import { after, afterEach, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { launchBrowser, measurePage } from '../check-visible-gaps.mjs';

let browser;
let page;
before(async () => { browser = await launchBrowser(); });
after(async () => { await browser?.close(); });
beforeEach(async () => {
  page = await browser.newPage({ viewport: { width: 390, height: 844 } });
});
afterEach(async () => { await page?.close(); });

const html = (content, css = '') => `<!doctype html>
<html><head><style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Arial, sans-serif; }
  #root { display: flex; flex-direction: column; align-items: stretch; }
  .box { height: 56px; flex: none; background: rgb(20, 100, 150); }
  ${css}
</style></head><body><div id="root">${content}</div></body></html>`;

const near = (actual, expected, tolerance = 0.5) => {
  assert.ok(Number.isFinite(actual), `Expected a finite measurement, got ${actual}`);
  assert.ok(Math.abs(actual - expected) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}`);
};
const regionOf = (report) => {
  assert.equal(report.regions.length, 1);
  assert.equal(report.regions[0].name, 'root');
  return report.regions[0];
};
const measure = () => measurePage(page, { root: '#root' });

test('48 link around 14 text: transparent hit area leaves the ink gap unchanged', async () => {
  await page.setContent(html(
    '<p>Read <a href="#">the details</a></p><div class="box"></div>',
    `p { margin: 0 0 16px; font-size: 14px; line-height: 20px; }
     a { position: relative; color: inherit; text-decoration: none; }
     .hit a::after { content: ''; position: absolute; height: 48px;
       left: 0; right: 0; top: 50%; transform: translateY(-50%);
       background: transparent; }`,
  ));
  const without = regionOf(await measure());
  await page.locator('#root').evaluate((root) => root.classList.add('hit'));
  const withHit = regionOf(await measure());

  for (const region of [without, withHit]) {
    assert.equal(region.rows.length, 2);
    assert.equal(region.gaps.length, 1);
    const textUnits = region.rows[0].units;
    assert.ok(textUnits.length > 0);
    assert.ok(textUnits.every((unit) => unit.kind === 'text'));
    for (const unit of textUnits) {
      assert.ok(unit.bottom > unit.top);
      assert.ok(unit.bottom - unit.top < 20, 'Text must be trimmed below line-box height');
    }
    assert.ok(region.rows[0].bottom - region.rows[0].top < 20);
    assert.equal(region.rows[1].units[0].kind, 'paint');
  }
  near(withHit.gaps[0].px, without.gaps[0].px);
  near(withHit.rows[0].top, without.rows[0].top);
  near(withHit.rows[0].bottom, without.rows[0].bottom);
});

test('Reserved empty message line: only two visible rows with a 32px gap', async () => {
  await page.setContent(html(
    '<div class="box" id="a"></div><div class="empty"></div><div class="box" id="b"></div>',
    '.empty { height: 20px; flex: none; margin-bottom: 12px; }',
  ));
  const report = await measure();
  const region = regionOf(report);
  assert.equal(region.rows.length, 2);
  assert.deepEqual(region.rows.map((row) => row.units.length), [1, 1]);
  assert.equal(region.gaps.length, 1);
  assert.equal(region.gaps[0].px, 32);
  assert.equal(region.gaps[0].expected, 32);
  assert.equal(region.gaps[0].pass, true);
  assert.equal(report.pass, true);
  assert.equal(report.failures, 0);
});

test('Bordered notice: measure the border as one painted unit at 16px', async () => {
  await page.setContent(html(
    '<div class="box"></div><div class="notice">Please review this notice</div>',
    `.notice { margin-top: 16px; background: transparent;
       border: 1px solid black; padding: 12px; font-size: 14px; line-height: 20px; }`,
  ));
  const report = await measure();
  const region = regionOf(report);
  assert.equal(region.rows.length, 2);
  assert.equal(region.gaps.length, 1);
  near(region.gaps[0].px, 16);
  assert.equal(region.gaps[0].pass, true);
  assert.equal(region.rows[1].units.length, 1);
  assert.equal(region.rows[1].units[0].kind, 'paint');
  near(region.rows[1].top, 72);
  near(region.rows[1].bottom, 118);
  assert.equal(report.pass, true);
  assert.equal(report.failures, 0);
});

test('32-gap pass: two filled boxes pass the spacing scale', async () => {
  await page.setContent(html(
    '<div class="box"></div><div class="box" style="margin-top:32px"></div>',
  ));
  const report = await measure();
  const region = regionOf(report);
  assert.equal(region.rows.length, 2);
  assert.equal(region.gaps.length, 1);
  assert.equal(region.gaps[0].px, 32);
  assert.equal(region.gaps[0].expected, 32);
  assert.equal(region.gaps[0].rule, 'scale');
  assert.equal(region.gaps[0].pass, true);
  assert.equal(report.pass, true);
  assert.equal(report.failures, 0);
});

test('20-gap fail: nearest allowed gap is 16px', async () => {
  await page.setContent(html(
    '<div class="box"></div><div class="box" style="margin-top:20px"></div>',
  ));
  const report = await measure();
  const region = regionOf(report);
  assert.equal(region.rows.length, 2);
  assert.equal(region.gaps.length, 1);
  assert.equal(region.gaps[0].px, 20);
  assert.equal(region.gaps[0].expected, 16);
  assert.equal(region.gaps[0].rule, 'scale');
  assert.equal(region.gaps[0].pass, false);
  assert.equal(report.pass, false);
  assert.equal(report.failures, 1);
});
