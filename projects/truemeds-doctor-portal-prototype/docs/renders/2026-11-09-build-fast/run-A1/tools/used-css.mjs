// Build aid (run A1): which local (non design-system) CSS rules of the approved reference page match a visible element in
// the given states. Prints the rules once each, in source order, with the states that use them. Not a test.
//   node used-css.mjs <page under ui-screens/> <query template with {s}> <state> [state ...]
import { chromium } from "../../../../../tests/node_modules/playwright/index.mjs";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../../../../../..");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".json": "application/json" };
const srv = http.createServer((q, r) => { const p = path.join(REPO, decodeURIComponent(new URL(q.url, "http://x").pathname)); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404).end(); return; } r.writeHead(200, { "Content-Type": types[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r); });
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const b = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const [page, query, ...states] = process.argv.slice(2);
const used = new Map(); // key -> { text, order, states:Set }
for (const s of states) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto(`http://127.0.0.1:${srv.address().port}/projects/truemeds-doctor-portal-prototype/ui-screens/${page}?${query.replace("{s}", s)}`); await p.waitForTimeout(900);
  const rules = await p.evaluate(() => {
    const out = []; let order = 0;
    const visible = [...document.querySelectorAll("*")].filter((el) => el.checkVisibility ? el.checkVisibility() : true);
    const walk = (list, media) => { for (const r of list) {
      order++;
      if (r.cssRules && r.media) { walk(r.cssRules, r.media.mediaText); continue; }
      if (!r.selectorText) continue;
      const sels = r.selectorText.split(",").map((x) => x.trim());
      const hit = sels.some((sel) => { const base = sel.replace(/::?(before|after|placeholder|-webkit-[\w-]+)/g, "").replace(/:(hover|focus|focus-visible|focus-within|active|disabled|checked)/g, "") || "*"; try { return visible.some((el) => el.matches(base)); } catch { return false; } });
      if (hit) out.push({ key: (media ? "@media " + media + " " : "") + r.cssText, order });
    } };
    for (const sh of document.styleSheets) { if (sh.href && /design-system/.test(sh.href)) continue; try { walk(sh.cssRules, null); } catch {} }
    return out;
  });
  for (const r of rules) { const u = used.get(r.key) || { order: r.order, states: new Set() }; u.states.add(s); used.set(r.key, u); }
  await p.close();
}
for (const [k, u] of [...used].sort((a, b) => a[1].order - b[1].order)) console.log(`/* ${u.states.size === states.length ? "all" : [...u.states].join(" ")} */\n${k}`);
await b.close(); srv.close();
