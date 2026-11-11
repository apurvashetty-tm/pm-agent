// Checks for the r1-rules run (2026-11-11), written by Claude after Codex's tests-first file (visible-gaps.test.mjs):
// D-108 pair rules in the checker, S4 sheet subtitle (D-109 §2) and S5 inline link (.tm-link) in truemeds.css.
import { after, afterEach, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { launchBrowser, measurePage } from '../check-visible-gaps.mjs';

const CSS = readFileSync(fileURLToPath(new URL('../../truemeds.css', import.meta.url)), 'utf8');
let browser, page;
before(async () => { browser = await launchBrowser(); });
after(async () => { await browser?.close(); });
beforeEach(async () => { page = await browser.newPage({ viewport: { width: 390, height: 844 } }); });
afterEach(async () => { await page?.close(); });
const tm = (body, css = '') => page.setContent(`<!doctype html><html><head><style>${CSS}</style><style>body{margin:0}${css}</style></head><body class="tm">${body}</body></html>`);

test('pair rule: field helper → button at 16 fails, expected 32 (D-108 "field group → 32 → button")', async () => {
  await tm(`<div id="r" style="display:flex;flex-direction:column;padding:16px">
    <div class="tm-field__control" style="height:48px"></div>
    <div class="tm-field__helper" style="margin-top:8px">We'll send you an OTP by SMS.</div>
    <button class="tm-btn tm-btn--primary tm-btn--lg" style="margin-top:16px">Send OTP</button></div>`);
  const rep = await measurePage(page, { root: '#r' });
  const g = rep.regions[0].gaps.find(x => /Send OTP/.test(x.below));
  assert.ok(g, 'gap above the button measured');
  assert.equal(g.expected, 32); assert.equal(g.pass, false); assert.equal(g.rule, 'pair');
});

test('pair rule: legal line → button wants 8; bar buttons keep the bar spec (box 8)', async () => {
  await tm(`<div id="r" style="display:flex;flex-direction:column;padding:16px">
    <p class="tm-legal tm-text-body-sm" style="margin:0">By selecting Verify, you agree to the Terms.</p>
    <button class="tm-btn tm-btn--primary tm-btn--lg" style="margin-top:32px">Verify</button>
    <div class="tm-actionbar" style="position:static;margin-top:32px"><button class="tm-btn tm-btn--primary tm-btn--lg">A</button><button class="tm-btn tm-btn--quiet tm-btn--lg">B</button></div></div>`);
  // the pinned bar is painted (edge + shadow), so it is measured as its own region, as in a real screen config
  const rep = await measurePage(page, { root: '#r', regions: [{ name: 'panel', selector: null }, { name: 'bar', selector: '.tm-actionbar' }] });
  const legal = rep.regions[0].gaps.find(x => /Verify/.test(x.below) && /Terms/.test(x.above));
  assert.equal(legal.expected, 8); assert.equal(legal.pass, false);
  const bar = rep.regions[1].gaps.find(x => x.above === 'A' && x.below === 'B');
  assert.equal(bar.rule, 'anatomy'); assert.equal(bar.pass, true);
});

test('fix pass (Codex review): sheet-actions notice wants 16; points 8 / 16; missing region and overlap fail', async () => {
  await tm(`<div id="r" style="padding:16px">
    <div id="pts" style="display:flex;flex-direction:column">
      <p class="pt-t" style="margin:0;font:600 16px/24px Arial">One</p><p class="pt-d" style="margin:8px 0 0;font:14px/20px Arial">Line</p>
      <p class="pt-t" style="margin:8px 0 0;font:600 16px/24px Arial">Two</p></div>
    <div class="tm-sheet__actions" style="position:static"><div class="tm-notice tm-notice--error">Couldn't add time.</div><button class="tm-btn tm-btn--primary tm-btn--lg">Add</button></div>
    <div id="ov" style="display:flex;flex-direction:column"><div style="height:40px;background:#123"></div><div style="height:40px;margin-top:-10px;margin-left:20px;background:#456"></div></div></div>`);
  const rep = await measurePage(page, { root: '#r', roles: { pointTitle: '.pt-t', pointLine: '.pt-d' },
    regions: [{ name: 'points', selector: '#pts' }, { name: 'actions', selector: '.tm-sheet__actions' }, { name: 'ov', selector: '#ov' }, { name: 'gone', selector: '#nope' }] });
  const [pts, act, ov, gone] = rep.regions;
  const lineToNext = pts.gaps.find(g => g.above === 'Line' && g.below === 'Two');
  // the point rule applies (not the any-of-8/16/32 fallback), so an on-scale 8 or 32 between points would fail
  assert.equal(lineToNext.rule, 'pair'); assert.equal(lineToNext.expected, 16);
  assert.equal(lineToNext.pass, Math.abs(lineToNext.px - 16) <= 2);
  const n = act.gaps.find(g => /Couldn/.test(g.above) && g.below === 'Add');
  assert.equal(n.expected, 16); assert.equal(n.rule, 'anatomy');
  assert.ok(ov.gaps.some(g => g.rule === 'overlap' && g.pass === false), 'overlapping stacked blocks fail');
  assert.ok(gone.missing && gone.gaps.some(g => g.rule === 'missing' && !g.pass), 'a missing region fails');
});

test('S4: sheet subtitle sits 8 under the title inside the header; the title stays centred on the ✕', async () => {
  const sheet = (heading) => `<div class="tm-sheet" style="position:static;max-height:none"><div class="tm-sheet__header">${heading}<button class="tm-btn tm-btn--quiet tm-btn--icon tm-sheet__close" aria-label="Close">x</button></div></div>`;
  await tm(sheet('<div class="tm-sheet__heading"><h2 class="tm-sheet__title">End availability?</h2><p class="tm-sheet__subtitle">You won\'t get new cases.</p></div>')
    + sheet('<h2 class="tm-sheet__title">Add time</h2>'));
  const m = await page.evaluate(() => [...document.querySelectorAll('.tm-sheet')].map(s => {
    const r = sel => s.querySelector(sel)?.getBoundingClientRect(); const t = r('.tm-sheet__title'), c = r('.tm-sheet__close'), sub = r('.tm-sheet__subtitle'), top = s.getBoundingClientRect().top;
    return { gap: sub ? sub.top - t.bottom : null, titleMid: t.top + t.height / 2 - top, closeMid: c.top + c.height / 2 - top, inHeader: !!s.querySelector('.tm-sheet__header .tm-sheet__subtitle') };
  }));
  assert.equal(m[0].gap, 8); assert.equal(m[0].inHeader, true);
  assert.ok(Math.abs(m[0].titleMid - m[0].closeMid) <= 0.5, `title centre ${m[0].titleMid} vs ✕ ${m[0].closeMid}`);
  assert.ok(Math.abs(m[0].titleMid - m[1].titleMid) <= 0.5, 'title sits where a title-only header puts it');
});

test('S5: .tm-link has a 48 hit area that adds no line height, and a focus ring', async () => {
  await tm(`<p id="p" class="tm-text-body-md" style="margin:100px 16px">Sent to +91 98765 43210 · <button class="tm-link" id="l">Change</button></p>`);
  const m = await page.evaluate(() => {
    const p = document.getElementById('p').getBoundingClientRect(); const l = document.getElementById('l'); const b = l.getBoundingClientRect();
    const a = getComputedStyle(l, '::after'); const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
    const at = dy => document.elementFromPoint(cx, cy + dy) === l;
    return { lineH: p.height, after: parseFloat(a.height), hit23: at(-23) && at(23), miss26: !at(-26) && !at(26), weight: getComputedStyle(l).fontWeight };
  });
  assert.equal(m.lineH, 20); assert.equal(m.after, 48); assert.ok(m.hit23, 'hit at centre ±23'); assert.ok(m.miss26, 'no hit at ±26');
  assert.equal(m.weight, '600');
  await page.keyboard.press('Tab');
  const outline = await page.evaluate(() => getComputedStyle(document.getElementById('l')).outlineStyle);
  assert.equal(outline, 'solid');
});
