import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

// Black-box tests: proposal D-103 + KIT RUN ruling, never the preview implementation.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const handoff = path.join(root, 'handoff');
const viewer = path.join(handoff, 'viewer');
const url = pathToFileURL(path.join(viewer, 'index.html')).href;
const { chromium } = createRequire(path.join(root, 'tests/package.json'))('playwright');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'app/state-map.js'), 'utf8'), sandbox);
const oracle = sandbox.window.TM_STATE_MAP.pictures;
const labels = ['Sign-in', 'OTP', 'Faster sign-in offer', 'Returning unlock', 'Home', 'Case', 'Prescribe', 'Calling'];
const later = new Set(['t08b-valid-forward', 't11-calling-transfer', 't12-transfer-ready']);
const forbidden = /\b(?:F1|F2|N1|W1|L1)\b|\[(?:RECOMMENDED|PROPOSED|LOCKED)\]|§|Design rules|Rule for this state|Tokens used in this state|Approved reference|\bbox\s+\d+\s*[×x]\s*\d+/i;
let browser, page, kit;
const runtimeErrors = [];
before(async () => {
  browser = await chromium.launch({ executablePath: process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.setDefaultTimeout(2500);
  page.on('pageerror', e => runtimeErrors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') runtimeErrors.push(m.text()); });
  await page.goto(url);
  kit = await page.evaluate(() => window.KIT);
});
after(async () => { await browser?.close(); });
async function route(hash) {
  await page.evaluate(h => { location.hash = h; }, hash);
  await page.waitForFunction(h => location.hash === h, hash);
  // Let the hashchange renderer complete without depending on its implementation.
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
const states = () => {
  assert.ok(kit?.screens?.length, 'KIT.screens must not be empty');
  return kit.screens.flatMap(screen => screen.states.map(state => ({ screen, state })));
};
const stateRoute = (screen, state) => `#screens/${screen.tab}/${state.id}`;
async function eachState(check) {
  const failures = [];
  for (const { screen, state } of states()) {
    try { await route(stateRoute(screen, state)); await check(screen, state); }
    catch (e) { failures.push(`${screen.tab}/${state.id}: ${e.message}`); }
  }
  assert.deepEqual(failures, []);
}
function localFile(href) {
  const resolved = fileURLToPath(new URL(href, url));
  assert.ok(resolved.startsWith(handoff + path.sep), `outside handoff: ${href}`);
  assert.ok(fs.statSync(resolved).isFile(), `missing file: ${href}`);
  return resolved;
}

test('H25: all eight live screen tabs reach every approved state exactly once', { timeout: 120000 }, async () => {
  await route('#start');
  assert.deepEqual(await page.locator('nav.v-top button').allTextContents(), ['Start here', 'Foundation', 'Building blocks', 'Screens']);
  await page.locator('nav.v-top button').getByText('Screens', { exact: true }).click();
  assert.deepEqual(await page.locator('nav.scrtabs button').allTextContents(), labels);
  const all = states();
  for (const item of oracle) {
    const matches = all.filter(x => x.state.id === item.id);
    assert.equal(matches.length, 1, `${item.id} reachable once`);
    const folder = item.picture.split('/')[0];
    const expected = folder === 'case' ? (item.calling.length ? 'Calling' : 'Case') : ({ 'sign-in': 'Sign-in', otp: 'OTP', 'faster-signin-offer': 'Faster sign-in offer', 'returning-unlock': 'Returning unlock', home: 'Home', prescribe: 'Prescribe' })[folder];
    assert.equal(matches[0].screen.name, expected, item.id);
  }
  for (const label of labels) {
    const button = page.locator('nav.scrtabs button').getByText(label, { exact: true });
    assert.equal(await button.isDisabled(), false, label);
    await button.click();
    const screen = kit.screens.find(s => s.name === label);
    assert.ok(screen, label);
    assert.equal(await page.locator('.chips button').count(), screen.states.length, label);
    for (let i = 0; i < screen.states.length; i++) {
      await page.locator('.chips button').nth(i).click();
      assert.equal(await page.evaluate(() => location.hash), stateRoute(screen, screen.states[i]));
    }
  }
});

test('H26: every state has plain When this shows and linked answered questions', { timeout: 120000 }, async () => {
  const decided = fs.readFileSync(path.join(handoff, 'DECIDED.md'), 'utf8');
  await eachState(async (_, state) => {
    assert.ok(state.when?.shows?.trim() && state.when?.next?.trim(), 'data has both when lines');
    const first = page.locator('.panel .card').first();
    assert.ok(await first.evaluate(e => e.matches('.when')));
    assert.match(await first.innerText(), /When this shows/);
    for (const [selector, expected] of [['p.when-shows', state.when.shows], ['p.when-next', state.when.next]]) {
      assert.equal((await first.locator(selector).innerText()).trim(), expected.trim());
      assert.doesNotMatch(expected, /<[^>]+>|\b(?:F1|F2|N1|W1|L1)\b/);
    }
    assert.ok(Array.isArray(state.rule?.decided), 'rule.decided exists');
    if (state.rule.decided.length) {
      const links = first.locator('details.ans a[href^="../DECIDED.md#"]');
      const actual = await links.evaluateAll(es => es.map(e => ({ id: decodeURIComponent(e.hash.slice(1)), text: e.textContent.trim() })));
      assert.deepEqual(actual.map(a => a.id).sort(), [...state.rule.decided].sort());
      for (const a of actual) {
        assert.equal(a.text, kit.decided.find(d => d.id === a.id)?.q, a.id);
        assert.notEqual(a.text.toLowerCase(), a.id.toLowerCase());
        assert.ok(decided.includes(`### ${a.id} ·`) || decided.includes(`id="${a.id}"`), a.id);
      }
    }
  });
});

test('H27: one phone image, caption, later exceptions and independently scrolling panel', { timeout: 120000 }, async () => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await eachState(async (_, state) => {
    assert.equal(await page.locator('.shot img').count(), 1);
    const images = await page.locator('img').evaluateAll(es => es.map(e => ({ shot: !!e.closest('.shot'), src: e.src, loaded: e.complete && e.naturalWidth > 0 })));
    const shot = images.find(i => i.shot);
    localFile(shot.src);
    assert.ok(shot.loaded, 'phone image loaded');
    assert.equal(images.filter(i => !i.shot && (i.src.includes(state.id) || /(?:w360|w390|approved)/i.test(i.src))).length, 0, 'no duplicate reference screen');
    assert.match(await page.locator('body').innerText(), /smallest supported phone: 360 wide/i);
    assert.match(await page.locator('.panel').evaluate(e => getComputedStyle(e).overflowY), /^(auto|scroll)$/);
    if (later.has(state.id)) {
      assert.match(await page.locator('body').innerText(), /later/i);
      assert.equal(await page.locator('.shot .hit').count(), 0);
    } else {
      assert.ok(await page.locator('.shot .hit[data-id]').count(), 'built phone has tap targets');
      assert.equal(Math.round(await page.locator('.shot img').evaluate(e => e.getBoundingClientRect().width)), 390);
    }
  });
});

test('H28: tapping elements opens clean details, block route and folded picker', { timeout: 120000 }, async () => {
  await eachState(async (_, state) => {
    if (later.has(state.id)) return;
    const hit = page.locator('.shot .hit[data-id]').first();
    await hit.click({ force: true });
    const card = page.locator('.card.el');
    assert.equal(await card.count(), 1);
    const text = await card.innerText();
    assert.doesNotMatch(text, /\bbox\b|\bBehaviour\b|\brole\b/i);
    const href = await card.locator('a[href^="#blocks/"]').first().getAttribute('href');
    assert.ok(kit.blocks.some(b => `#blocks/${b.block}` === href), href);
    const fold = page.locator('details.elfold');
    assert.equal(await fold.locator('summary').innerText(), "Can't tap it? Pick from a list");
    assert.equal(await fold.getAttribute('open'), null);
    // Data field names for element a11y are deliberately not assumed: the rendered
    // label must contain a real value whenever its heading is present.
    if (/Screen reader label/i.test(text)) assert.match(text, /Screen reader label\s+\S/i);
    await card.locator('a[href^="#blocks/"]').first().click();
    assert.equal(await page.evaluate(() => location.hash), href);
  });
});

test('H29: no zero not-tokens card or state token/reference tables', { timeout: 120000 }, async () => {
  await eachState(async () => {
    const text = await page.locator('body').innerText();
    assert.doesNotMatch(text, /Not tokens(?: in this state)?\s*:\s*0\b/i);
    assert.doesNotMatch(text, /Tokens used in this state|Approved reference/i);
    for (const card of await page.locator('.card').all()) {
      const value = await card.innerText();
      if (/Not tokens/i.test(value)) assert.match(value, /Not tokens[^\n]*\b[1-9]\d*\b/i);
    }
  });
});

test('H30: every block usage is grouped and every chip selects that block on its state', { timeout: 120000 }, async () => {
  assert.ok(kit.blocks.length);
  const failures = [];
  for (const block of kit.blocks) {
    try {
      await route(`#blocks/${block.block}`);
      const used = page.locator('.usedon');
      assert.match(await used.innerText(), /Where it's used/);
      const groups = await used.locator('p').evaluateAll(es => es.map(e => ({ name: e.querySelector('b')?.textContent.trim(), links: [...e.querySelectorAll('a.uchip')].map(a => a.getAttribute('href')) })));
      const expected = states().filter(x => block.usedIn.includes(x.state.id));
      assert.deepEqual(groups.map(g => g.name).sort(), [...new Set(expected.map(x => x.screen.name))].sort());
      assert.deepEqual(groups.flatMap(g => g.links.map(h => decodeURIComponent(h.split('/')[2]))).sort(), [...block.usedIn].sort());
      for (const group of groups) for (const href of group.links) {
        assert.ok(href.startsWith('#screens/'));
        // Hash structure is #screens/<tab>/<state>/<element>.
        const parts = href.slice(1).split('/');
        const entry = expected.find(x => x.screen.tab === parts[1] && x.state.id === parts[2]);
        assert.ok(entry && entry.screen.name === group.name && parts[3], href);
        await route(`#blocks/${block.block}`);
        await page.locator('.usedon a.uchip').evaluateAll((es, h) => es.find(e => e.getAttribute('href') === h).click(), href);
        await page.waitForFunction(h => location.hash === h, href);
        assert.equal(await page.locator('.hit.sel').getAttribute('data-id'), decodeURIComponent(parts[3]));
        assert.equal(await page.locator('.card.el a[href^="#blocks/"]').first().getAttribute('href'), `#blocks/${block.block}`);
      }
    } catch (e) { failures.push(`${block.block}: ${e.message}`); }
  }
  assert.deepEqual(failures, []);
});

test('H31: Start here fits laptop and exposes all real downloads with identical single files', { timeout: 120000 }, async () => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await route('#start');
  assert.ok(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1));
  assert.equal(await page.locator('table').count(), 0);
  assert.match(await page.locator('body').innerText(), /Start with Screens\. Tap anything\. Check DECIDED before asking\./);
  const links = await page.locator('.dls a.dl[href]').evaluateAll(es => es.map(e => ({ href: e.getAttribute('href'), text: e.innerText })));
  assert.equal(await page.locator('.dls a.dl-main').count(), 1);
  assert.ok(Array.isArray(await page.evaluate(() => window.KIT_DOWNLOADS)));
  const files = links.map(l => localFile(l.href));
  for (const name of ['tokens.ts', 'messages.ts', 'icons.ts', 'fonts.zip', 'logo.zip']) {
    const file = files.find(f => path.basename(f) === name);
    assert.ok(file, name);
    if (name.endsWith('.ts')) assert.deepEqual(fs.readFileSync(file), fs.readFileSync(path.join(handoff, 'foundation', name)), name);
  }
});

test('H32: whole-kit zip contains exactly handoff excluding downloads, byte for byte', { timeout: 120000 }, async () => {
  await route('#start');
  const zip = localFile(await page.locator('.dls a.dl-main').getAttribute('href'));
  const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const full = path.join(dir, e.name);
    const relative = path.relative(handoff, full).split(path.sep).join('/');
    if (relative === 'viewer/downloads') return [];
    return e.isDirectory() ? walk(full) : [relative];
  });
  const expected = walk(handoff).sort();
  const entries = execFileSync('unzip', ['-Z1', zip], { encoding: 'utf8', timeout: 20000 }).trim().split('\n').filter(x => !x.endsWith('/')).sort();
  assert.deepEqual(entries, expected);
  for (const entry of entries) assert.deepEqual(execFileSync('unzip', ['-p', zip, entry], { maxBuffer: 128 * 1024 * 1024, timeout: 20000 }), fs.readFileSync(path.join(handoff, entry)), entry);
});

test('H33: Foundation screen filter narrows tokens and hides inline alias chains', { timeout: 120000 }, async () => {
  await route('#foundation');
  const label = page.locator('label.only');
  assert.match(await label.innerText(), /Only values used on/i);
  const select = label.locator('select');
  assert.ok(await select.locator('option').count());
  const checkbox = label.locator('input[type="checkbox"]');
  await checkbox.uncheck();
  const total = await page.locator('tbody tr').count();
  await select.selectOption({ index: 0 });
  await checkbox.check();
  const filtered = await page.locator('tbody tr').count();
  assert.ok(filtered > 0 && filtered < total, `${filtered} must be between 0 and ${total}`);
  assert.doesNotMatch(await page.locator('body').innerText(), /\(via --tm-/);
});

test('H34: all tabs, states with one tap and block pages are free of internal labels and script errors', { timeout: 120000 }, async () => {
  const failures = [];
  async function clean(where) {
    const text = await page.locator('body').innerText();
    if (forbidden.test(text)) failures.push(`${where}: ${text.match(forbidden)?.[0]}`);
  }
  for (const hash of ['#start', '#foundation', '#blocks', '#screens']) { await route(hash); await clean(hash); }
  for (const { screen, state } of states()) {
    await route(stateRoute(screen, state));
    await clean(state.id);
    if (await page.locator('.shot .hit[data-id]').count()) {
      await page.locator('.shot .hit[data-id]').first().click({ force: true });
      await clean(`${state.id} tapped`);
    }
  }
  for (const block of kit.blocks) { await route(`#blocks/${block.block}`); await clean(block.block); }
  assert.deepEqual({ labels: failures, runtimeErrors }, { labels: [], runtimeErrors: [] });
});

test('H35: generated kit and downloads pass build freshness check', { timeout: 120000 }, () => {
  execFileSync(process.execPath, ['scripts/build-handoff.mjs', '--check'], { cwd: root, encoding: 'utf8', timeout: 110000, stdio: 'pipe' });
});
