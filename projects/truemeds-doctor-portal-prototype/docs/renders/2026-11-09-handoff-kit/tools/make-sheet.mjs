// Evidence sheet: five phone-width (390) views of handoff/viewer, side by side. Usage (project folder): node <this> 
import { createRequire } from "module"; import path from "path"; import fs from "fs";
const ROOT = process.cwd();
const require = createRequire(path.join(ROOT, "tests/package.json"));
const { chromium } = require("playwright");
const OUT = path.join(ROOT, "docs/renders/2026-11-09-handoff-kit");
const b = await chromium.launch({ executablePath: process.env.CHROME || undefined });
const pg = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const base = "file://" + path.join(ROOT, "handoff/viewer/index.html");
const views = [
  ["1 · Start here", "", null],
  ["2 · Block spec: Button", "#blocks/button", "h3"],
  ["3 · Inspector: submit tapped (too many tries)", "#screens/sign-in_too-many-tries/submit", ".shot"],
  ["4 · Element panel: tokens, spacing, copy key", "#screens/sign-in_too-many-tries/submit", ".panel h2"],
  ["5 · Tokens used in this state", "#screens/sign-in_too-many-tries/submit", "text=Tokens used in this state"],
  ["6 · Raw values flagged red", "#screens/sign-in_sending/submit-spinner", "text=Not tokens in this state"],
];
const shots = [];
for (const [i, [cap, hash, sel]] of views.entries()) {
  await pg.goto(base + hash); await pg.waitForTimeout(300);
  if (sel) await pg.locator(sel).first().evaluate((e) => e.scrollIntoView({ block: "start" }));
  if (i === 2) await pg.evaluate(() => window.scrollBy(0, -8));
  await pg.waitForTimeout(150);
  const f = `/tmp/sheet-${i}.png`; await pg.screenshot({ path: f });
  shots.push([cap, fs.readFileSync(f).toString("base64")]);
}
const html = `<body style="margin:0;background:#EDEEF1;font:600 15px system-ui;display:flex;gap:16px;padding:16px">` +
  shots.map(([c, d]) => `<figure style="margin:0;width:390px"><figcaption style="margin-bottom:8px">${c}</figcaption><img style="width:390px;border-radius:8px" src="data:image/png;base64,${d}"></figure>`).join("") + "</body>";
const s = await b.newPage({ viewport: { width: 16 + 6 * 406, height: 900 }, deviceScaleFactor: 1 });
await s.setContent(html); await s.waitForTimeout(300);
await s.screenshot({ path: path.join(OUT, "sheet.png"), fullPage: true });
await b.close(); console.log("sheet.png written");
