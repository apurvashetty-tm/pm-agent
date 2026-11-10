// Debug probe: OTP under an emulated keyboard — rects and scroll sizes of the containers. node <this> (from tests/ resolution via import)
import { createRequire } from "module";
import path from "path"; import url from "url"; import http from "http"; import fs from "fs";
const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const PROJECT = path.resolve(HERE, "../../../..");
const require = createRequire(path.join(PROJECT, "tests/package.json"));
const { chromium } = require("playwright");
const APP = path.join(PROJECT, "app");
const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json" };
const srv = http.createServer((q, r) => { const p = path.join(APP, decodeURIComponent(new URL(q.url, "http://x").pathname).replace(/\/$/, "/index.html")); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { "Content-Type": T[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r); });
await new Promise((r) => srv.listen(8774, r));
const { encodeStory, defaultStory } = await import(path.join(APP, "core/play-link.js"));
const b = await chromium.launch({ executablePath: process.env.CHROME });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const p = await ctx.newPage();
await p.addInitScript(() => { const vv = new EventTarget(); let H = innerHeight; for (const [k, f] of Object.entries({ height: () => H, width: () => innerWidth, offsetTop: () => 0, offsetLeft: () => 0, scale: () => 1 })) Object.defineProperty(vv, k, { get: f }); Object.defineProperty(window, "visualViewport", { get: () => vv }); window.__kb = (h) => { H = h; vv.dispatchEvent(new Event("resize")); }; });
await p.goto(`http://localhost:8774/?play=${encodeURIComponent(encodeStory(defaultStory()))}&s=${process.argv[2] || "otp_default"}`); await p.waitForTimeout(500);
await p.focus(process.argv[3] || "#c"); await p.evaluate(() => window.__kb(508)); await p.waitForTimeout(900);
console.log(await p.evaluate(() => {
  const out = []; let el = document.activeElement;
  for (; el; el = el.parentElement) { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); out.push(`${el.tagName}.${el.className || el.id} top=${Math.round(r.top)} h=${Math.round(r.height)} oy=${cs.overflowY} sh=${el.scrollHeight} ch=${el.clientHeight} st=${el.scrollTop}`); }
  return out.join("\n");
}));
await b.close(); srv.close();
