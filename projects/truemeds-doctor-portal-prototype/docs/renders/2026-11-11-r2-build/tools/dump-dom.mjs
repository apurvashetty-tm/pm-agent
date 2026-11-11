// Prints the built app's screen DOM for a state (capture mode), for writing the matching approved reference.
//   node docs/renders/2026-11-11-r2-build/tools/dump-dom.mjs <state-id> [w]
import { chromium } from "../../../../tests/node_modules/playwright/index.mjs";
import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import url from "node:url";
const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, "../../../../app");
const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json" };
const srv = http.createServer((q, r) => {
  const p = path.join(APP, decodeURIComponent(new URL(q.url, "http://x").pathname).replace(/\/$/, "/index.html"));
  if (!p.startsWith(APP) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { "Content-Type": T[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r);
});
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const b = await chromium.launch({ executablePath: process.env.CHROME || undefined });
const p = await b.newPage({ viewport: { width: Number(process.argv[3] || 390), height: 844 } });
await p.goto(`http://127.0.0.1:${srv.address().port}/?capture=1&s=${process.argv[2]}`); await p.waitForTimeout(400);
console.log(await p.evaluate(() => { const s = document.querySelector("#screen"); s.querySelectorAll("svg").forEach((x) => x.replaceWith("[svg]")); return s.innerHTML.replace(/></g, ">\n<"); }));
await b.close(); srv.close();
