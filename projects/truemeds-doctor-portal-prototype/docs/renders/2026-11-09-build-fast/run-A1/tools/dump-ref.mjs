// Build aid (run A1): opens an approved reference page state and prints its visible DOM (hidden nodes, scripts and review
// controls dropped) so the screen module can lift the same structure and classes. Not a test.
//   node dump-ref.mjs <url path under repo root> [selector]
import { chromium } from "../../../../../tests/node_modules/playwright/index.mjs";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../../../../../..");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".json": "application/json" };
const srv = http.createServer((q, r) => { const p = path.join(REPO, decodeURIComponent(new URL(q.url, "http://x").pathname)); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404).end(); return; } r.writeHead(200, { "Content-Type": types[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r); });
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const b = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto(`http://127.0.0.1:${srv.address().port}/${process.argv[2]}`); await p.waitForTimeout(900);
const out = await p.evaluate((sel) => {
  const root = document.querySelector(sel || "body").cloneNode(true);
  const live = document.querySelector(sel || "body");
  const a = [...live.querySelectorAll("*")], c = [...root.querySelectorAll("*")];
  a.forEach((el, i) => { const cs = getComputedStyle(el); if (el.hidden || cs.display === "none" || cs.visibility === "hidden" || el.tagName === "SCRIPT" || el.tagName === "STYLE") c[i].setAttribute("data-drop", "1"); });
  root.querySelectorAll("[data-drop]").forEach((e) => e.remove());
  root.querySelectorAll("svg").forEach((s) => s.replaceWith(document.createTextNode("")));
  return root.outerHTML.replace(/\n\s*\n/g, "\n");
}, process.argv[3]);
console.log(out);
await b.close(); srv.close();
