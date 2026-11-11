// T1: the shared visible-gap checker (design-system/scripts/check-visible-gaps.mjs, D-108) on every in-scope state of the BUILT
// app — sign-in, OTP, faster sign-in offer, returning unlock, Home (all states + the sheets that open from them) — at 390 × 844
// and 360 × 640. Serves app/ on a loopback port and opens each state in capture mode (?capture=1&s=<id>&w=<w>).
//   node docs/renders/2026-11-11-r2-build/tools/visible-gaps.mjs [regex] [--out <dir>] [--no-pictures]
// Writes <out>/visible-gaps.json, <out>/summary.md and (unless --no-pictures) one picture per state and size. Exit 1 on a failure.
// REPORT_ONLY=1 with CONFIG=other: the case page / Prescribe / calling / Profile report (RULINGS 2026-11-11 10:32: report only).
import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import url from "node:url";
const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const PROJECT = path.resolve(HERE, "../../../..");
const APP = path.join(PROJECT, "app");
const DS = path.resolve(PROJECT, "../../design-system/scripts/check-visible-gaps.mjs");
process.env.TM_PLAYWRIGHT ||= path.join(PROJECT, "tests");
const { launchBrowser, measurePage, drawReport, CAPTURE } = await import(url.pathToFileURL(DS).href);

const args = process.argv.slice(2);
const flt = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--out");
const OUT = path.resolve(args.includes("--out") ? args[args.indexOf("--out") + 1] : path.join(HERE, "..", "visible-gaps"));
const pictures = !args.includes("--no-pictures");
const OTHER = process.env.CONFIG === "other";
fs.mkdirSync(OUT, { recursive: true });

const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json", ".webmanifest": "application/manifest+json" };
const srv = http.createServer((q, r) => {
  const p = path.join(APP, decodeURIComponent(new URL(q.url, "http://x").pathname).replace(/\/$/, "/index.html"));
  if (!p.startsWith(APP) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { "Content-Type": T[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r);
});
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const BASE = `http://127.0.0.1:${srv.address().port}/`;

// Project roles (local classes → D-108 roles). The design-system defaults cover the .tm-* classes.
const roles = {
  legal: ".consent", linkLine: ".rs", tile: ".hero-ic, .prompt-icon", caption: "#ready", groupLabel: ".lbl",
  pointTitle: ".pt-t", pointLine: ".pt-d", helper: ".s1",
};
// .tm-toast floats over the bar (a layer, not part of its flow; RULES §9.5), so it is not a bar row.
const ignore = [".mock-kbd", ".sr-only", ".visually-hidden", ".tm-toast"];
const atomic = [".tm-otp-slots", ".columns"];
const rules = [
  { above: ".col-heads", below: ".columns", gap: 4, box: true, kind: "anatomy", note: "wheel column heads 4 (component, D-40)" },
];

globalThis.window = {};
await import(url.pathToFileURL(path.join(APP, "state-map.js")).href);
const all = window.TM_STATE_MAP.pictures.map((r) => r.id);
const SCREEN = (id) => id.split("_")[0];
const inScope = OTHER ? all.filter((id) => !/^(sign-in|otp|offer|unlock|home)_/.test(id)) : all.filter((id) => /^(sign-in|otp|offer|unlock|home)_/.test(id));
const ids = inScope.filter((id) => !flt || new RegExp(flt).test(id));

function pageFor(id) {
  const s = SCREEN(id);
  if (s === "sign-in") return { root: ".signin-screen", regions: [{ name: "panel", selector: ".login-fields", edgeTop: true }, { name: "sign-up line", selector: ".login-signup", optional: true }] };
  if (s === "otp") return { root: ".otp-screen", regions: [{ name: "panel", selector: ".entry-panel", edgeTop: true }] };
  if (s === "offer") return { root: ".offer-screen", regions: [{ name: "panel", selector: ".entry-panel", edgeTop: true }, { name: "bar", selector: ".tm-actionbar" }] };
  if (s === "unlock") return { root: ".unlock-screen", regions: [{ name: "panel", selector: ".entry-panel", edgeTop: true }, { name: "bar", selector: ".tm-actionbar" }] };
  if (s === "home") {
    // Profile pages are out of scope (not redesigned); the log-out sheet that opens from Profile is in.
    if (/profile|logout/.test(id)) return { root: ".home-screen", regions: /logout/.test(id) ? [{ name: "sheet", selector: ".tm-sheet" }, { name: "sheet actions", selector: ".tm-sheet__actions" }] : [] };
    // A sheet's pinned actions are their own region: content scrolled under them (360 × 640) is not "overlapping" them.
    return { root: ".home-screen", regions: [{ name: "panel", selector: ".entry-panel", edgeTop: true }, { name: "bar", selector: ".home-bg .tm-actionbar" },
      { name: "sheet", selector: ".tm-sheet", optional: true }, { name: "sheet actions", selector: ".tm-sheet__actions", optional: true }] };
  }
  // report only (other screens): the screen's own root element as the region (so its parts are measured, not one painted
  // block), plus its pinned bar and any open sheet as their own regions. Cards stay one unit each (anatomy, r1 ruling).
  return { root: "#screen > *", regions: [{ name: "screen", selector: null }, { name: "bar", selector: ".tm-actionbar", optional: true },
    { name: "sheet", selector: ".tm-sheet", optional: true }, { name: "sheet actions", selector: ".tm-sheet__actions", optional: true }] };
}

const browser = await launchBrowser();
const report = { checker: path.relative(PROJECT, DS), built: "app/ (capture mode)", sizes: ["390x844", "360x640"], pages: [] };
let failures = 0;
for (const id of ids) {
  const cfg = pageFor(id);
  if (!cfg.regions.length) continue;
  for (const [w, hgt] of [[390, 844], [360, 640]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: hgt }, deviceScaleFactor: CAPTURE.dpr });
    const page = await ctx.newPage();
    await page.clock.setFixedTime(CAPTURE.clock);
    const errors = []; page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(`${BASE}?capture=1&s=${id}&w=${w}`);
    await page.addStyleTag({ content: "*,*::before,*::after{animation:none !important;transition:none !important;caret-color:transparent !important}" });
    await page.evaluate(() => document.fonts && document.fonts.ready); await page.waitForTimeout(300);
    // Spacing is measured on the layout at rest: scroll areas back to the top (a drawn keyboard scrolls OTP / sign-in up, F-05).
    // The wheel columns are the exception: their scroll position is the value shown.
    await page.evaluate(() => document.querySelectorAll("*").forEach((e) => { if (e.scrollTop && !e.classList.contains("wheel")) e.scrollTop = 0; }));
    // Adapter: a wheel column shows three rows and clips the rest, but the checker reads scroll areas as unclipped (content below
    // the fold). Marking the columns overflow hidden (same scroll position, same pixels) lets it see only the drawn rows.
    await page.addStyleTag({ content: ".wheel{overflow-y:hidden !important}" });
    let rep;
    try { rep = await measurePage(page, { root: cfg.root, regions: cfg.regions, roles, ignore, atomic, rules }); }
    catch (e) { rep = { pass: false, failures: 1, regions: [], error: String(e) }; }
    if (pictures && rep.origin) await drawReport(page, rep, path.join(OUT, `${id}_w${w}.png`));
    const bad = rep.regions.flatMap((r) => r.gaps.filter((g) => !g.pass).map((g) => ({ region: r.name, above: g.above, below: g.below, px: g.px, expected: g.expected, rule: g.rule, note: g.note })));
    failures += rep.failures + errors.length;
    report.pages.push({ id, size: `${w}x${hgt}`, pass: rep.pass && !errors.length, failures: rep.failures, errors, error: rep.error, bad,
      gaps: rep.regions.map((r) => ({ region: r.name, gaps: r.gaps.map((g) => ({ above: g.above, below: g.below, px: g.px, expected: g.expected, pass: g.pass, rule: g.rule })) })) });
    console.log(`${rep.pass && !errors.length ? "PASS" : "FAIL"} ${id} ${w}x${hgt}${bad.length ? "  " + bad.map((b) => `[${b.region}] ${b.above} → ${b.below}: ${b.px} ≠ ${b.expected} (${b.rule})`).join(" ; ") : ""}${rep.error ? " " + rep.error : ""}${errors.length ? " errors: " + errors.join(" | ") : ""}`);
    await ctx.close();
  }
}
await browser.close(); srv.close();
fs.writeFileSync(path.join(OUT, "visible-gaps.json"), JSON.stringify(report, null, 1));
const passed = report.pages.filter((p) => p.pass).length;
const md = [`# Visible-gap check (${OTHER ? "other screens, report only" : "in-scope screens"}) — ${new Date().toISOString().slice(0, 10)}`, "",
  `Checker: \`${report.checker}\` · built app in capture mode · ${report.sizes.join(" and ")}.`, "",
  `**${passed} / ${report.pages.length} captures pass.**`, "",
  "| State | Size | Result | Failing gaps |", "|---|---|---|---|",
  ...report.pages.map((p) => `| ${p.id} | ${p.size} | ${p.pass ? "pass" : "**FAIL**"} | ${p.bad.map((b) => `${b.above} → ${b.below}: ${b.px} ≠ ${b.expected}`).join("; ").replace(/\|/g, "/")}${p.errors.length ? " errors: " + p.errors.join("; ") : ""} |`)];
fs.writeFileSync(path.join(OUT, "summary.md"), md.join("\n") + "\n");
console.log(`\n${passed} / ${report.pages.length} pass`);
process.exit(OTHER ? 0 : failures ? 1 : 0);
