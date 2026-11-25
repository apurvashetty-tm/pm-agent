// Shared helpers for run r3-rest-audit: serve app/ on loopback, open a state in capture mode with r2-build's capture
// settings (design-system CAPTURE: installed Chrome, flags, DPR 2, fixed clock; animations off; fonts ready).
import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import url from "node:url";
const HERE = path.dirname(url.fileURLToPath(import.meta.url));
export const PROJECT = path.resolve(HERE, "../../../..");
export const APP = path.join(PROJECT, "app");
export const DS = path.resolve(PROJECT, "../../design-system/scripts/check-visible-gaps.mjs");
process.env.TM_PLAYWRIGHT ||= path.join(PROJECT, "tests");
export const checker = await import(url.pathToFileURL(DS).href);
const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json", ".webmanifest": "application/manifest+json", ".jpg": "image/jpeg", ".webp": "image/webp" };

export async function serve(root = APP) {
  const srv = http.createServer((q, r) => {
    const p = path.join(root, decodeURIComponent(new URL(q.url, "http://x").pathname).replace(/\/$/, "/index.html"));
    if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; }
    r.writeHead(200, { "Content-Type": T[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r);
  });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const browser = await checker.launchBrowser();
  return { browser, base: `http://127.0.0.1:${srv.address().port}/`, close: async () => { await browser.close(); srv.close(); } };
}

export async function open(browser, base, id, w, h, errors = []) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: checker.CAPTURE.dpr });
  const page = await ctx.newPage();
  await page.clock.setFixedTime(checker.CAPTURE.clock);
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${base}?capture=1&s=${id}&w=${w}`);
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none !important;transition:none !important;caret-color:transparent !important}" });
  await page.evaluate(() => document.fonts && document.fonts.ready); await page.waitForTimeout(300);
  page.ctxClose = () => ctx.close();
  return page;
}
