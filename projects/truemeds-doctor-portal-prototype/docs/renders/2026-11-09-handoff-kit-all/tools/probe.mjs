// Probe: count visible elements per state in the built app (for sizing the generic capture). Run from the project folder.
import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import { createRequire } from "node:module";
const ROOT = process.cwd(); const require = createRequire(path.join(ROOT, "tests/package.json")); const { chromium } = require("playwright");
const APP = path.join(ROOT, "app");
const TYPES = { ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".html": "text/html" };
const srv = http.createServer((q, r) => {
  const p = path.join(APP, decodeURIComponent(new URL(q.url, "http://x").pathname).replace(/\/$/, "/index.html"));
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; }
  const t = TYPES[path.extname(p)]; r.writeHead(200, t ? { "Content-Type": t } : {}); fs.createReadStream(p).pipe(r);
});
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const b = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
for (const s of process.argv.slice(2)) {
  const pg = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  await pg.goto(`http://127.0.0.1:${srv.address().port}/?capture=1&s=${s}&w=390`); await pg.waitForTimeout(500);
  const info = await pg.evaluate(() => {
    const f = document.querySelector("#frame");
    const seen = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && !el.closest("[hidden]"); };
    const all = [...f.querySelectorAll("*")].filter((e) => seen(e) && !e.closest("svg") && !e.closest(".tm-icon") && !e.closest(".mock-kbd"));
    return { n: all.length, top: [...document.querySelector("#screen").children].map((c) => c.className),
      frameKids: [...f.children].map((c) => c.id + "." + c.className + (c.hidden ? "[hidden]" : "")),
      sample: all.map((e) => e.tagName.toLowerCase() + "." + [...e.classList].join(".")).join(" ") };
  });
  console.log(s, errs.join(";"), info.n, JSON.stringify(info.top), info.frameKids.join(" | "));
  if (process.env.V) console.log(info.sample);
  await pg.close();
}
await b.close(); srv.close();
