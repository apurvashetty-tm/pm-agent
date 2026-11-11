// Tests first: D-105–D-109. Run: node tests/codex/r2/r2.test.mjs
import { chromium } from '../../node_modules/playwright/index.mjs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const APP = path.join(ROOT, 'app');
const messages = JSON.parse(fs.readFileSync(path.join(ROOT, 'ui-screens/feedback/messages.json')));
const copy = (key, vars = {}) => {
  const entry = messages[key];
  assert.ok(entry !== undefined, `Missing registry key ${key}`);
  return (typeof entry === 'string' ? entry : entry.text).replace(/\{(\w+)\}/g, (all, k) => vars[k] ?? all);
};
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(APP, 'state-map.js'), 'utf8'), sandbox);
const ids = sandbox.window.TM_STATE_MAP.pictures.map(x => x.id);
const { value } = await import(path.join(APP, 'core/settings.js'));
const { encodeStory, defaultStory } = await import(path.join(APP, 'core/play-link.js'));
const ANSWER = value('mockServerDelay', 'review') + 350;
const DELAY = value('phonePromptDelay', 'review');
const PROMPT = DELAY + 350;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
  const file = path.resolve(APP, '.' + pathname.replace(/\/$/, '/index.html'));
  if (!file.startsWith(APP + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const BASE = `http://127.0.0.1:${server.address().port}/`;
let browser, failed = 0;
const contexts = new Set();
async function open(state = '', { w = 390, h = 844, init, query = '' } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
  contexts.add(ctx);
  const p = await ctx.newPage(); p.setDefaultTimeout(2500);
  p.errors = [];
  p.on('pageerror', e => p.errors.push(e.message));
  p.on('console', m => { if (m.type() === 'error') p.errors.push(m.text()); });
  if (init) await p.addInitScript(init);
  await p.goto(BASE + '?' + (state ? `s=${state}&` : '') + query);
  await p.waitForTimeout(200);
  return p;
}
async function test(id, name, fn) {
  try { await fn(); console.log(`PASS ${id} ${name}`); }
  catch (e) { failed++; console.log(`FAIL ${id} ${name} [${e.message.replace(/\s+/g, ' ').slice(0, 1400)}]`); }
  finally { for (const ctx of contexts) await ctx.close(); contexts.clear(); }
}
const txt = async (p, s) => (await p.locator(s).innerText()).replace(/\u00a0/g, ' ').trim();
const eqCopy = async (p, s, key) => assert.equal(await txt(p, s), copy(key));
const ff = (p, ms) => p.evaluate(x => window.__tm.clock.fastForward(x), ms);
async function choose(p, field, v) {
  await p.evaluate(f => { const d = document.getElementById('rp-' + f)?.closest('details'); if (d) d.open = true; }, field);
  await p.selectOption('#rp-' + field, v);
}
const story = (p, patch) => p.evaluate(x => window.__tm.store.set({ story: { ...window.__tm.store.get().story, ...x } }), patch);
const state = p => p.evaluate(() => window.__tm.store.get().s);
const busy = p => p.locator('#unlock-action').getAttribute('aria-busy');
async function returning(answer) {
  const p = await open('', { w: 1280, h: 900 });
  await p.fill('#tm-login-mobile', '7012345688'); await p.click('.login-submit'); await p.waitForTimeout(ANSWER);
  await p.fill('#c', '1234'); await p.click('#b'); await p.waitForTimeout(ANSWER);
  await p.click('#turn-on'); await p.waitForTimeout(PROMPT);
  await choose(p, 'unlock', answer); await choose(p, 'start', 'unlock');
  await p.evaluate(() => document.getElementById('rp-restart').click());
  return p;
}
const sent = p => p.evaluate(() => {
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.endsWith(':otp:7012345688')) return JSON.parse(localStorage.getItem(k)).sent.length; }
  return 0;
});
const wheel = (p, c) => p.locator(`.wheel[data-col="${c}"]:visible`);
const values = (p, c) => wheel(p, c).locator('.wheel-item:not(.wheel-item--empty)').allTextContents().then(a => a.map(x => Number(x.trim())));
async function pick(p, c, n) {
  for (let i = 0; i < 45; i++) {
    const selected = wheel(p, c).locator('.wheel-item.is-selected');
    const current = Number(await selected.innerText());
    if (current === n) return;
    await selected.focus(); await p.keyboard.press(current < n ? 'ArrowDown' : 'ArrowUp'); await p.waitForTimeout(65);
  }
  assert.fail(`Wheel ${c} could not select ${n}`);
}
const seconds = async p => (await txt(p, '#home-time')).split(':').map(Number).reduce((a, x) => a * 60 + x, 0);
async function target(p, selector, maxLine, exact = false) {
  const g = await p.locator(selector).evaluate((a) => {
    const r = a.getBoundingClientRect(), range = document.createRange(); range.selectNodeContents(a);
    const t = range.getBoundingClientRect();
    // The containing text line, rather than the enlarged link / pseudo-element target.
    const line = a.parentElement.getBoundingClientRect();
    const x = (t.left + t.right) / 2, y = (t.top + t.bottom) / 2;
    const hit = dy => { const e = document.elementFromPoint(x, y + dy); return e === a || a.contains(e); };
    return { href: a.hasAttribute('href'), line: line.height, hit: hit(-23.5) && hit(23.5), box: r.height };
  });
  assert.ok(g.href && g.hit && (exact ? Math.abs(g.line - maxLine) <= 1 : g.line <= maxLine + 1), JSON.stringify(g));
}
const keyboardStub = () => {
  const vv = new EventTarget(); let H = innerHeight;
  for (const [k, f] of Object.entries({ height: () => H, width: () => innerWidth, offsetTop: () => 0, offsetLeft: () => 0, pageTop: () => scrollY, pageLeft: () => 0, scale: () => 1 })) Object.defineProperty(vv, k, { get: f });
  Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => vv });
  window.__kb = h => { H = h; vv.dispatchEvent(new Event('resize')); };
};
try {
  browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
  await test('R2-U1', 'returning unlock prompts automatically then reaches Home', async () => {
    const p = await returning('success'); assert.equal(await busy(p), 'true');
    await p.waitForTimeout(PROMPT); assert.match(await state(p), /^home_/);
    await p.waitForTimeout(PROMPT * 3); assert.match(await state(p), /^home_/);
  });
  await test('R2-U2', 'cancel stays still; tapping Unlock retries', async () => {
    const p = await returning('cancelled'); assert.equal(await busy(p), 'true');
    await p.waitForTimeout(PROMPT); assert.notEqual(await busy(p), 'true'); assert.match(await txt(p, '#unlock-action'), /^Unlock with /);
    let repeats = 0;
    await p.exposeFunction('r2Busy', () => repeats++);
    await p.evaluate(() => new MutationObserver(() => { if (document.querySelector('#unlock-action')?.getAttribute('aria-busy') === 'true') window.r2Busy(); }).observe(document.getElementById('screen'), { subtree: true, attributes: true, childList: true }));
    await p.waitForTimeout(DELAY * 3 + 400); assert.equal(repeats, 0); assert.match(await state(p), /^unlock_/);
    await p.click('#unlock-action'); assert.equal(await busy(p), 'true');
  });
  await test('R2-U3', 'automatic failure plus two retries falls back without SMS', async () => {
    const p = await returning('failed'), before = await sent(p);
    await p.waitForTimeout(PROMPT);
    for (let i = 0; i < 2; i++) { await p.click('#unlock-action'); await p.waitForTimeout(PROMPT); }
    assert.equal(await p.inputValue('#tm-login-mobile'), '7012345688'); assert.equal(await p.locator('.otp-screen').count(), 0); assert.equal(await sent(p), before);
  });
  await test('R2-U4', 'direct unlock pictures never auto-prompt', async () => {
    for (const query of ['', 'capture=1']) {
      const p = await open('unlock_fingerprint', { query });
      assert.notEqual(await busy(p), 'true'); await p.waitForTimeout(PROMPT * 3);
      assert.equal(await state(p), 'unlock_fingerprint'); assert.notEqual(await busy(p), 'true');
    }
  });
  await test('R2-S1', 'default SMS helper', async () => eqCopy(await open('sign-in_default'), '#tm-login-helper', 'signin.smsHelper'));
  await test('R2-S2', 'could not send notice', async () => eqCopy(await open('sign-in_couldnt-send'), '#tm-login-couldnt-send-notice', 'signin.couldntSend'));
  await test('R2-S3', 'Sign up link has 48px hit area and compact text line', async () => target(await open('sign-in_default'), '#tm-signup-option a[href]', 24));
  await test('R2-S4', 'empty, short and invalid-prefix errors', async () => {
    const p = await open('sign-in_default'); await p.click('.login-submit'); await eqCopy(p, '#tm-login-helper', 'signin.empty');
    await p.fill('#tm-login-mobile', '98765'); await p.click('.login-submit'); await eqCopy(p, '#tm-login-helper', 'signin.short');
    await p.fill('#tm-login-mobile', '1'); await eqCopy(p, '#tm-login-helper', 'signin.prefix');
  });
  await test('R2-O1', 'Change link has 48px hit area inside 20px subtitle', async () => target(await open('otp_default'), `.otp-screen a.tm-link[href]:text-is(${JSON.stringify(copy('otp.change'))})`, 20, true));
  await test('R2-O2', 'resend shows registry new-code message', async () => {
    const p = await open('otp_resend-available'); await p.locator('#rs a, #rs button').click(); await p.waitForTimeout(ANSWER); await eqCopy(p, '#s1', 'otp.newSent');
  });
  await test('R2-O3', 'every OTP picture renders without errors or missing copy', async () => {
    const all = ids.filter(x => x.startsWith('otp_')); assert.ok(all.length);
    const bad = [];
    for (const id of all) { const p = await open(id, { query: 'capture=1' }); const text = await txt(p, '.otp-screen'); if (p.errors.length || /\{|otp\.|\[missing:/.test(text)) bad.push([id, text, p.errors]); await p.context().close(); contexts.delete(p.context()); }
    assert.deepEqual(bad, []);
  });
  await test('R2-B1', 'shared band at both phone sizes', async () => {
    const bad = [];
    for (const [w, h] of [[390, 844], [360, 640]]) for (const id of ['sign-in_default', 'otp_default', 'offer_fingerprint', 'unlock_fingerprint', 'home_setup-wheel', 'home_active']) {
      const p = await open(id, { w, h, query: 'capture=1' });
      const g = await p.evaluate(() => {
        const root = document.querySelector('#screen'), frame = document.getElementById('frame').getBoundingClientRect();
        const logo = root.querySelector('img[src*="truemeds-for-doctors"], .brand img, .logo img');
        const title = root.querySelector('h1'), panel = root.querySelector('.panel');
        if (!logo || !title || !panel) return null;
        const l = logo.getBoundingClientRect(), t = title.getBoundingClientRect(), b = panel.getBoundingClientRect();
        return { top: l.top - frame.top, gap: t.top - l.bottom, panel: b.top - frame.top };
      });
      if (!g || Math.abs(g.top - 16) > 1 || Math.abs(g.gap - 16) > 1 || Math.abs(g.panel - 173) > 1) bad.push({ id, w, g });
      await p.context().close(); contexts.delete(p.context());
    }
    assert.deepEqual(bad, []);
  });
  await test('R2-H1', 'setup wheel edges and ten-hour timer', async () => {
    const p = await open('home_setup-wheel'); assert.deepEqual(await values(p, 'h'), Array.from({ length: 11 }, (_, i) => i));
    await pick(p, 'h', 10); assert.deepEqual(await values(p, 'm'), [0]);
    await pick(p, 'h', 0); assert.deepEqual(await values(p, 'm'), [15, 30, 45]);
    await pick(p, 'h', 10); await p.click('.home-screen .tm-actionbar [data-confirm]'); await p.locator('#home-time').waitFor({ state: 'visible' });
    assert.ok(Math.abs(await seconds(p) - 36000) <= 1);
  });
  await test('R2-H2', 'setup labels and changing until caption; no range', async () => {
    const p = await open('home_setup-wheel'), text = await txt(p, '.home-screen');
    assert.ok(!/Minimum 15 minutes|15\s*(?:min(?:utes)?)?\s*[–—-]\s*10|0\s*[–—-]\s*10\s*h/i.test(text));
    assert.ok(text.includes(copy('home.quickPicks')) && text.includes(copy('home.custom')));
    const before = await txt(p, '#home-until');
    const pattern = copy('home.availableUntil', { time: 'TIME' }).split('TIME');
    assert.ok(before.startsWith(pattern[0]) && before.endsWith(pattern[1])); assert.match(before.slice(pattern[0].length), /^\d{1,2}:\d{2}\s[AP]M/);
    await pick(p, 'm', 45); assert.notEqual(await txt(p, '#home-until'), before);
  });
  await test('R2-H3', 'available title and single two-row card with Add time', async () => {
    const p = await open('home_active'); await eqCopy(p, '.home-screen h1', 'home.titleActive'); await eqCopy(p, '.home-screen .band .sub', 'home.subActive');
    const cards = p.locator('.home-screen .tm-card').filter({ has: p.locator('#home-time') }); assert.equal(await cards.count(), 1);
    const text = await cards.innerText(); assert.ok(text.includes(copy('home.timeRemaining')) && text.includes(copy('home.rxToday'))); assert.ok(await p.locator('#add').isVisible());
  });
  await test('R2-H4', 'offline Add time remains visible and disabled', async () => {
    const p = await open('home_offline'); assert.ok(await p.locator('#add').isVisible()); assert.ok(await p.locator('#add').isDisabled());
  });
  await test('R2-H5', 'add wheel cap, hint and duration formats', async () => {
    const p = await open('home_add-wheel'); await eqCopy(p, '.tm-sheet:visible .tm-sheet__title', 'home.addTitle'); await eqCopy(p, '#add-hint', 'home.addHint');
    assert.equal(Math.max(...await values(p, 'h')), 9); await pick(p, 'h', 9); assert.equal(Math.max(...await values(p, 'm')), 45);
    for (const [h, m, duration] of [[9, 45, '9 h 45 min'], [0, 30, '30 min'], [1, 0, '1 h'], [2, 15, '2 h 15 min'], [0, 45, '45 min']]) {
      await pick(p, 'h', h); await pick(p, 'm', m); assert.equal(await txt(p, '.tm-sheet:visible [data-confirm]'), copy('home.addConfirm', { duration }));
    }
  });
  await test('R2-H6', 'adding maximum selectable time stays below ten hours', async () => {
    const p = await open('home_add-wheel'); await pick(p, 'h', 9); await pick(p, 'm', 45); await p.click('.tm-sheet:visible [data-confirm]'); await p.waitForTimeout(ANSWER);
    assert.equal(await p.locator('.tm-sheet:visible').count(), 0); const t = await seconds(p); assert.ok(t <= 36000 && Math.abs(t - 35400) <= 5, `seconds=${t}`);
  });
  await test('R2-H7', 'Rx row opens Profile and Back restores available Home', async () => {
    const p = await open('home_active'); await p.locator('button#home-rx').click(); assert.ok(await p.locator('.profile-page').isVisible());
    await p.click('#profile-back'); await eqCopy(p, '.home-screen h1', 'home.titleActive');
  });
  await test('R2-H8', 'ended count above picker; fresh setup hides count', async () => {
    for (const id of ['home_idle-expired', 'home_manually-ended']) {
      const p = await open(id); const row = p.locator('#home-rx'); assert.ok(await row.isVisible()); assert.match(await row.innerText(), /\b3\b/);
      const r = await row.boundingBox(), picker = await p.locator('.presets').boundingBox(); assert.ok(r.y + r.height <= picker.y);
    }
    assert.equal(await (await open('home_setup-wheel')).locator('#home-rx').count(), 0);
  });
  await test('R2-H9', 'every Home picture has the decided title and valid copy', async () => {
    const setup = new Set(['home_setup-wheel', 'home_setting', 'home_setup-failed', 'home_idle-expired', 'home_manually-ended']);
    const all = ids.filter(x => x.startsWith('home_') && !/profile|logout-confirm/.test(x)); assert.ok(all.length);
    const bad = [];
    for (const id of all) {
      const p = await open(id, { query: 'capture=1' });
      const key = setup.has(id) ? 'home.titleSetup' : id === 'home_stop-pending' ? 'home.titleStopping' : id === 'home_expired-pending' ? 'home.titleEnded' : 'home.titleActive';
      const title = await txt(p, '.home-screen h1'), text = await txt(p, '.home-screen');
      if (title !== copy(key) || /\{|home\.|\[missing:/.test(text) || p.errors.length) bad.push({ id, title, expected: copy(key), errors: p.errors, text });
      await p.context().close(); contexts.delete(p.context());
    }
    assert.deepEqual(bad, []);
  });
  await test('R2-H10', 'end sheet subtitle inside header with eight-pixel gap', async () => {
    const p = await open('home_end-confirmation'); await eqCopy(p, '.tm-sheet:visible .tm-sheet__subtitle', 'home.endSub');
    assert.ok(copy('home.endSub').startsWith(copy('home.subNoNewCases').replace(/\.$/, '')));
    const g = await p.locator('.tm-sheet:visible').evaluate(s => { const t = s.querySelector('.tm-sheet__title'), sub = s.querySelector('.tm-sheet__subtitle'); return { sameHeader: !!t.closest('.tm-sheet__header, header')?.contains(sub), gap: sub.getBoundingClientRect().top - t.getBoundingClientRect().bottom }; });
    assert.ok(g.sameHeader && Math.abs(g.gap - 8) <= 1, JSON.stringify(g));
  });
  for (const [id, s, field, action] of [['R2-K1', 'sign-in_default', '#tm-login-mobile', '.login-submit'], ['R2-K2', 'otp_default', '#c', '#b']]) await test(id, `${s} clears phone keyboard at 360`, async () => {
    const query = `play=${encodeURIComponent(encodeStory(defaultStory()))}`;
    const p = await open(s, { w: 360, h: 640, init: keyboardStub, query });
    await p.focus(field); await p.evaluate(() => window.__kb(340)); await p.waitForTimeout(900);
    const g = await p.evaluate(({ field, action }) => {
      const input = document.querySelector(field), f = (input.closest('.tm-field') || input).getBoundingClientRect(), a = document.querySelector(action).getBoundingClientRect();
      return { focused: document.activeElement === input, top: f.top, bottom: f.bottom, actionTop: a.top, actionBottom: a.bottom, height: visualViewport.height };
    }, { field, action });
    assert.ok(g.focused && g.top >= 0 && g.bottom <= g.height - 16 && g.actionTop >= 0 && g.actionBottom <= g.height - 16, JSON.stringify(g));
  });
  // RULINGS 2026-11-11 13:45: a message that appears while the keyboard is open (the field keeps focus, so no new focus event)
  // must not push the main button under the keyboard. The button is tapped without moving focus, as on a phone.
  const clear = (p, field, action, msg) => p.evaluate(({ field, action, msg }) => {
    const input = document.querySelector(field), a = document.querySelector(action).getBoundingClientRect(), m = document.querySelector(msg);
    return { focused: document.activeElement === input, msg: !!m && m.getClientRects().length > 0 && m.innerText.trim(), actionTop: a.top, actionBottom: a.bottom, height: visualViewport.height };
  }, { field, action, msg });
  const okClear = g => assert.ok(g.msg && g.actionTop >= 0 && g.actionBottom <= g.height - 16, JSON.stringify(g));
  const kbOpen = async (s, field) => {
    const p = await open(s, { w: 360, h: 640, init: keyboardStub, query: `play=${encodeURIComponent(encodeStory(defaultStory()))}` });
    await p.focus(field); await p.evaluate(() => window.__kb(340)); await p.waitForTimeout(900);
    return p;
  };
  const tapKeepFocus = (p, s) => p.evaluate(s => document.querySelector(s).click(), s);
  await test('R2-K3', 'OTP wrong code with keyboard open keeps Verify 16 clear at 360x640', async () => {
    const p = await kbOpen('otp_default', '#c');
    await p.keyboard.type('1111'); await tapKeepFocus(p, '#b'); await p.waitForTimeout(ANSWER + 900);
    const g = await clear(p, '#c', '#b', '.otp-screen [role="alert"]'); assert.ok(g.focused, JSON.stringify(g)); okClear(g);
  });
  await test('R2-K4', 'sign-in error with keyboard open keeps Send OTP 16 clear at 360x640', async () => {
    const p = await kbOpen('sign-in_default', '#tm-login-mobile');
    await p.keyboard.type('98765'); await tapKeepFocus(p, '.login-submit'); await p.waitForTimeout(900);
    const g = await clear(p, '#tm-login-mobile', '.login-submit', '#tm-login-helper[role="alert"]'); assert.ok(g.focused, JSON.stringify(g)); okClear(g);
  });
  await test('R2-K5', "sign-in Couldn't send: keyboard reopened keeps Send OTP 16 clear at 360x640", async () => {
    const p = await kbOpen('sign-in_default', '#tm-login-mobile');
    await p.keyboard.type('9000000004'); await tapKeepFocus(p, '.login-submit'); await p.waitForTimeout(ANSWER + 300);
    await p.focus('#tm-login-mobile'); await p.waitForTimeout(900);   // the app closes the keyboard on the answer; the doctor taps the field again
    const g = await clear(p, '#tm-login-mobile', '.login-submit', '#tm-login-couldnt-send-notice');
    assert.equal(g.msg, copy('signin.couldntSend')); okClear(g);
  });
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
process.exitCode = failed ? 1 : 0;
