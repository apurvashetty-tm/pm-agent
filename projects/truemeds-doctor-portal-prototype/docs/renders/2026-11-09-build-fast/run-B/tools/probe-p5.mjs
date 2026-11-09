// Run B: how far the review panel overflows 1280 x 800 with "Timings and limits" open (run-checks P5).
import { chromium } from "../../../../../tests/node_modules/playwright/index.mjs";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const HERE = path.dirname(new URL(import.meta.url).pathname);
const APP = path.resolve(HERE, "../../../../../app");
const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const srv = http.createServer((q, r) => { const p = path.join(APP, decodeURIComponent(new URL(q.url, "http://x").pathname).replace(/\/$/, "/index.html")); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404).end(); return; } r.writeHead(200, { "Content-Type": T[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r); });
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const b = await chromium.launch({ executablePath: process.env.CHROME });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.goto(`http://127.0.0.1:${srv.address().port}/`); await p.waitForFunction(() => !!window.__tm);
for (const k of ["settings", "call", "log"]) {
  const r = await p.evaluate((k) => { const d = document.querySelector(`details[data-row=${k}]`); d.open = true;
    const bar = document.querySelector(".rp-bar").getBoundingClientRect(); const panel = document.getElementById("review-panel").getBoundingClientRect();
    const tool = document.querySelector(".rp-timings__tool")?.getBoundingClientRect();
    return { k, scrollH: document.documentElement.scrollHeight, barBottom: Math.round(bar.bottom), panelBottom: Math.round(panel.bottom), toolH: tool && Math.round(tool.height) }; }, k);
  console.log(JSON.stringify(r));
}
await b.close(); srv.close();
