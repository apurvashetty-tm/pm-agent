// d104 run: build the preview site into a temp copy as Netlify would (base app/, the netlify.toml build command), serve it as a
// static site (publish "." = app/), open /calling-flow/ headless: no 404s, no console errors, pictures load.
// Usage (from the project folder): node docs/renders/2026-11-10-d104/tools/check-calling-flow-site.mjs
import fs from "fs";
import path from "path";
import http from "http";
import url from "url";
import { execSync } from "child_process";
import { createRequire } from "module";

const PROJECT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "../../../..");
const REPO = path.resolve(PROJECT, "../..");
const TMP = path.join(PROJECT, "docs/renders/2026-11-10-d104/tmp/site");
const { chromium } = createRequire(path.join(PROJECT, "tests/x.mjs"))("playwright");

// 1. temp copy: the repo's design-system + the project's tracked files (what Netlify checks out)
fs.rmSync(TMP, { recursive: true, force: true });
const TP = path.join(TMP, "projects/truemeds-doctor-portal-prototype");
fs.mkdirSync(TP, { recursive: true });
// tracked + new files, never the git-ignored copies
const tracked = execSync("git ls-files -z -c -o --exclude-standard", { cwd: PROJECT }).toString().split("\0").filter(Boolean)
  .filter((f) => /^(app|scripts|calling-flow|ui-screens|brand|handoff)\//.test(f));
for (const f of tracked) { const to = path.join(TP, f); fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(path.join(PROJECT, f), to); }
const ds = execSync("git ls-files -z design-system", { cwd: REPO }).toString().split("\0").filter(Boolean);
for (const f of ds) { const to = path.join(TMP, f); fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(path.join(REPO, f), to); }

// 2. the build command from app/netlify.toml, run in app/ (Netlify base directory)
const toml = fs.readFileSync(path.join(TP, "app/netlify.toml"), "utf8");
const cmd = toml.match(/^\s*command\s*=\s*"(.*)"\s*$/m)[1];
console.log(`build: ${cmd}`);
console.log(execSync(cmd, { cwd: path.join(TP, "app") }).toString().trim());
const SITE = path.join(TP, "app");

// 3. serve app/ as a static site (directory → index.html; anything missing → 404)
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json" };
const hits = [];
const srv = http.createServer((req, res) => {
  let p = path.join(SITE, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, "index.html");
  const ok = p.startsWith(SITE) && fs.existsSync(p);
  hits.push([ok ? 200 : 404, req.url]);
  if (!ok) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => srv.listen(0, r));
const BASE = `http://localhost:${srv.address().port}`;

// 4. open the page headless, visit every tab, count pictures
const MAC_CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({ executablePath: process.env.CHROME || (fs.existsSync(MAC_CHROME) ? MAC_CHROME : undefined) });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(`${BASE}/calling-flow/`, { waitUntil: "networkidle" });
const tabs = await page.$$eval("[data-tab], [role=tab]", (els) => els.length);
for (let i = 0; i < tabs; i++) { await page.locator("[data-tab], [role=tab]").nth(i).click().catch(() => {}); await page.waitForLoadState("networkidle"); }
// open one picture full size (the lightbox), so its path is checked too
const thumb = page.locator("img[data-full]").first();
if (await thumb.count()) { await thumb.click().catch(() => {}); await page.waitForLoadState("networkidle"); }
const info = await page.evaluate(async () => {
  const imgs = [...document.querySelectorAll("img")].filter((i) => i.getAttribute("src"));   // the closed lightbox has no src
  for (const im of imgs) { im.loading = "eager"; if (!im.complete) await new Promise((r) => { im.onload = im.onerror = r; setTimeout(r, 3000); }); }
  const svgImgs = [...document.querySelectorAll("image")].map((x) => x.getAttribute("href"));
  return { title: document.title, imgs: imgs.length, broken: imgs.filter((i) => !i.naturalWidth).map((i) => i.getAttribute("src")),
    svgImgs: svgImgs.length, font: getComputedStyle(document.body).fontFamily, hasMsg: !!(window.TMFeedback && window.TMFeedback.messages) };
});
// SVG <image> pictures: fetch each once to confirm it resolves
const svgHrefs = await page.$$eval("image", (els) => [...new Set(els.map((x) => x.href.baseVal ? new URL(x.href.baseVal, location.href).href : ""))].filter(Boolean));
const svgBad = [];
for (const h of svgHrefs) { const r = await page.request.get(h); if (r.status() !== 200) svgBad.push(h); }
await browser.close(); srv.close();

const notFound = hits.filter(([s]) => s === 404).map(([, u]) => u);
const picHits = hits.filter(([s, u]) => s === 200 && u.endsWith(".png")).length;
console.log(JSON.stringify({ tabs, ...info, svgHrefs: svgHrefs.length, svgBad, notFound, picHits, requests: hits.length, errors }, null, 1));
const pass = !notFound.length && !errors.length && !info.broken.length && !svgBad.length && info.hasMsg && (info.imgs + svgHrefs.length) > 0;
console.log(pass ? "PASS calling-flow on the built site: no 404s, no console errors, pictures load" : "FAIL");
// the temp copy is evidence-free scratch: remove it
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(pass ? 0 : 1);
