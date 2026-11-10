// d104 run: how far the review panel overshoots 1280×800 with "Timings and limits" open (P5).
import fs from "fs";
import path from "path";
import http from "http";
import url from "url";
import { createRequire } from "module";
const PROJECT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "../../../..");
const APP = path.join(PROJECT, "app");
const { chromium } = createRequire(path.join(PROJECT, "tests/x.mjs"))("playwright");
const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json" };
const srv = http.createServer((q, r) => { let p = path.join(APP, decodeURIComponent(new URL(q.url, "http://x").pathname)); if (p.endsWith("/")) p += "index.html";
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { "Content-Type": T[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r); });
await new Promise((r) => srv.listen(0, r));
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.goto(`http://localhost:${srv.address().port}/?s=sign-in_default`); await p.waitForTimeout(800);
for (const k of process.argv.slice(2).length ? process.argv.slice(2) : ["settings", "log", "call"]) {
  await p.evaluate((k) => { document.querySelector(`details[data-row=${k}]`).open = true; }, k); await p.waitForTimeout(100);
  console.log(k, JSON.stringify(await p.evaluate(() => { const a = document.getElementById("rp-review").getBoundingClientRect();
    const t = document.querySelector(".rp-timings"); return { reviewBottom: Math.round(a.bottom), scrollH: document.documentElement.scrollHeight, inner: innerHeight,
      timingsH: t ? Math.round(t.getBoundingClientRect().height) : null, rows: t ? t.children.length : 0 }; })));
}
await b.close(); srv.close();
