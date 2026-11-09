// Test-only driver. No screen/core implementations are imported. Public hooks match entry-journeys.mjs.
import { chromium } from '../../node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
export const MSG = JSON.parse(fs.readFileSync(path.join(ROOT, 'ui-screens/feedback/messages.json')));
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'app/state-map.js'), 'utf8'), sandbox);
export const MAP = JSON.parse(JSON.stringify(sandbox.window.TM_STATE_MAP));
export const settings = (await import(path.join(ROOT, 'app/core/settings.js'))).SETTINGS;
export const ms = key => settings[key].value;
const norm = s => s.replace(/\s+/g, ' ').trim();
export const copy = (key, vars = {}) => {
  assert.ok(Object.hasOwn(MSG, key), `Missing registry key ${key}`);
  return norm(MSG[key].replace(/\{(\w+)\}/g, (_, k) => { assert.ok(k in vars, `Missing ${key}.${k}`); return vars[k]; }));
};
export async function launch() {
  let server;
  let base = process.env.CODEX_BASE_URL;
  if (!base) {
    const root = path.join(ROOT, 'app');
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json' };
    server = http.createServer((req, res) => {
      let p;
      try { p = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/\/$/, '/index.html')); }
      catch { res.writeHead(400).end(); return; }
      if (!p.startsWith(root + path.sep) || !fs.existsSync(p) || !fs.statSync(p).isFile()) { res.writeHead(404).end(); return; }
      res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
    base = `http://127.0.0.1:${server.address().port}/`;
  }
  let browser;
  try { browser = await chromium.launch({ executablePath: process.env.CHROME || process.env.CHROMIUM || undefined }); }
  catch (e) { server?.close(); throw e; }
  return {
    async open(id = '', fields = {}, width = 1280) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage(); page.setDefaultTimeout(2500);
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      const d = new Driver(page, context, errors, base);
      await page.goto(base); await page.waitForFunction(() => !!window.__tm && !!window.TM_STATE_MAP);
      for (const [k, v] of Object.entries(fields)) await d.choose(k, v);
      if (id) await d.jump(id); else if (Object.keys(fields).length) await d.clickControl('#rp-restart');
      return d;
    },
    async close() { await browser.close(); if (server) await new Promise(r => server.close(r)); },
  };
}
class Driver {
  constructor(p, context, errors, base) { Object.assign(this, { p, context, errors, base }); }
  root() { return this.p.locator('#screen'); }
  button(name) { return this.root().getByRole('button', { name, exact: true }).filter({ visible: true }); }
  async click(name) { const b = this.button(name); assert.equal(await b.count(), 1, `Exactly one visible app button: ${name}`); await b.click(); }
  async clickControl(selector) { await this.p.locator(selector).evaluate(e => { for (let d = e.closest('details'); d; d = d.parentElement?.closest('details')) d.open = true; }); await this.p.locator(selector).click(); }
  async choose(field, value) {
    const s = this.p.locator(`#rp-${field}`);
    assert.equal(await s.count(), 1, `Review control missing: rp-${field} (test adapter contract, see README)`);
    await s.evaluate(e => { for (let d = e.closest('details'); d; d = d.parentElement?.closest('details')) d.open = true; });
    await s.selectOption(String(value));
  }
  async jump(id) { await this.choose('jump', id); await this.clickControl('#rp-jump-go'); await this.p.waitForTimeout(80); }
  async ff(t) { await this.p.evaluate(t => window.__tm.clock.fastForward(t), t); await this.p.waitForTimeout(80); }
  async settle() { await this.p.waitForTimeout(ms('mockServerDelay') + ms('reconcileDelay') + 200); }
  async text(expected) {
    await this.p.waitForFunction(({ expected }) => {
      const root = document.getElementById('screen');
      return root && root.innerText.replace(/\s+/g, ' ').includes(expected);
    }, { expected: norm(expected) });
  }
  async msg(key, vars) { await this.text(copy(key, vars)); }
  async noText(expected) { assert.ok(!norm(await this.root().innerText()).includes(norm(expected)), `Unexpected app text: ${expected}`); }
  async buttons(yes = [], no = []) {
    for (const n of yes) assert.ok(await this.button(n).isVisible(), `Visible CTA ${n}`);
    for (const n of no) assert.equal(await this.button(n).count(), 0, `Forbidden CTA ${n}`);
  }
  async back() { await this.p.goBack(); await this.p.waitForTimeout(80); }
  async fill(selector, value) { await this.root().locator(selector).filter({ visible: true }).fill(value); }
  async closeSheet() { await this.root().locator('[role=dialog]:visible, .tm-sheet:visible').last().getByRole('button', { name: 'Close', exact: true }).click(); }
  async log(pattern) {
    // Backend-only outcomes must be observable in the existing reviewer event log. Never inspect private server state.
    await this.p.locator('details[data-row=log]').evaluate(e => e.open = true);
    const text = await this.p.locator('details[data-row=log]').innerText();
    assert.match(text, pattern, 'Required backend outcome missing from reviewer event log');
  }
  async clean() { assert.deepEqual(this.errors, [], 'No browser exceptions'); }
  async close() { await this.context.close(); }
}
export async function run(cases) {
  if (process.argv.includes('--list')) { for (const c of cases) console.log(`${c.id}\t${c.name}\t${c.source}`); return; }
  const filter = process.env.CODEX_FILTER;
  const selected = cases.filter(c => !filter || `${c.id} ${c.name}`.includes(filter));
  assert.ok(selected.length, 'Filter must select tests');
  const app = await launch(); let failed = 0;
  try {
    for (const c of selected) {
      let d;
      try { d = await app.open(c.state || '', c.fields || {}, c.width); await c.test(d, app); await d.clean(); console.log(`PASS ${c.id} ${c.name}`); }
      catch (e) { failed++; console.error(`FAIL ${c.id} ${c.name}\n  source: ${c.source}\n  ${e.stack}`); }
      finally { await d?.close(); }
    }
  } finally { await app.close(); }
  console.log(`${selected.length - failed}/${selected.length} passed`); process.exitCode = failed ? 1 : 0;
}
export function addressing(min, max) {
  return [360, 390].flatMap(width => [...MAP.pictures, ...MAP.others].filter(r => r.step >= min && r.step <= max && r.version !== 'A').map(r => ({
    id: `S-${width}-${r.id}`, name: `?s=${r.id} opens built content`, source: `app/state-map.js:${1 + fs.readFileSync(path.join(ROOT, 'app/state-map.js'), 'utf8').split('\n').findIndex(l => l.includes('"id": "' + r.id + '"'))}; plan v3.2 B4`,
    // Direct URLs, not a review jump: no shell image or placeholder is accepted as a built screen.
    test: async d => {
      await d.p.setViewportSize({ width, height: 844 }); await d.p.goto(d.base + '?capture=1&s=' + encodeURIComponent(r.id));
      await d.p.waitForTimeout(100);
      assert.ok(norm(await d.root().innerText()).length > 0, 'Nonempty built screen');
      assert.equal(await d.root().locator('img.shell-picture, figure').count(), 0, 'No picture stand-in');
      await d.noText('[missing:'); await d.noText('Not built');
    },
  })));
}
export { assert };
