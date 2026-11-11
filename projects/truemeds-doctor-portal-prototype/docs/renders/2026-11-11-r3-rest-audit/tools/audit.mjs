// r3-rest-audit step 1: the shared visible-gap checker (design-system/scripts/check-visible-gaps.mjs, D-108) on every
// state of the case page (incl. calling, outcomes, closed), Prescribe (+ medicine overlays), Rx viewer, Profile and every
// sheet, at 390 × 844 and 360 × 640. Report only — nothing in app/ is changed (adapters run in the capture page only).
//   node docs/renders/2026-11-11-r3-rest-audit/tools/audit.mjs [regex] [--no-pictures]
// Per-screen regions (brief: "so the sticky case header and Prescribe-over-case don't count as overlaps"):
//   pass A — the screen's parts as separate regions: compact header · scroll content (cards are one unit each) · pinned bar;
//            Prescribe: edit header + summary band · body · bar; a sheet: sheet · its pinned actions; Rx viewer: header · body.
//            When Prescribe, the Rx viewer or a sheet is open, only it is measured (the page behind has its own state).
//   pass B — the inside of every card (the hidden parts r2 never measured: chip grids, duration picker, SOS, order details).
// Pictures: drawn on a tall viewport (same width, height grown to show the whole scroll content) so content below the fold
// is visible; the numbers in the report are from the real viewport. Also collects type facts, tap targets and visible text.
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
import { serve, open, checker, APP } from "./lib.mjs";
const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "..", "visible-gaps");
const args = process.argv.slice(2);
const flt = args.find((a) => !a.startsWith("--"));
const pictures = !args.includes("--no-pictures");
fs.mkdirSync(OUT, { recursive: true });

globalThis.window = {};
await import(url.pathToFileURL(path.join(APP, "state-map.js")).href);
const all = window.TM_STATE_MAP.pictures.map((r) => r.id);
const ids = all.filter((id) => !/^(sign-in|otp|offer|unlock)_/.test(id) && (!/^home_/.test(id) || /^home_profile/.test(id)))
  .filter((id) => !flt || new RegExp(flt).test(id));

const roles = {
  label: ".ps-label, .tm-sheet__label",
  groupLabel: ".ps-label, .tm-sheet__label, .sheet-section-label",
  helper: ".ps-helper, .tm-field__helper",
  pointTitle: ".pt-t", pointLine: ".pt-d",
};
const ignore = [".mock-kbd", ".sr-only", ".visually-hidden", ".tm-toast", "#__vg_overlay"];
const atomic = [".tm-otp-slots", ".columns", ".rx-paper"];   // the mock Rx paper is exempt (CLAUDE.md); measured as one picture
const rules = [{ above: ".col-heads", below: ".columns", gap: 4, box: true, kind: "anatomy", note: "wheel column heads 4 (component, D-40)" }];

// In-page: tag the regions for this state and return [{ pass, name, selector, optional }].
const TAG = () => {
  document.querySelectorAll("[data-r3]").forEach((e) => e.removeAttribute("data-r3"));
  const vis = (e) => e && e.getClientRects().length && getComputedStyle(e).display !== "none" && getComputedStyle(e).visibility !== "hidden";
  const regs = []; let n = 0;
  const label = (e) => (e.innerText || "").replace(/\s+/g, " ").trim().slice(0, 28);
  const add = (pass, e, name) => { if (!vis(e)) return; e.setAttribute("data-r3", String(++n)); regs.push({ pass, name, selector: `[data-r3="${n}"]` }); };
  const cards = (scope, prefix) => scope && [...scope.querySelectorAll(".tm-card, .ps-card, #medicines-section, #notes-section")].filter((c) => !c.parentElement.closest(".tm-card")).forEach((c) => add("B", c, `${prefix} card “${label(c)}”`));
  const sheet = [...document.querySelectorAll(".tm-sheet")].find(vis);
  const ps = document.querySelector("#prescribe-screen.open");
  const rx = document.querySelector("#rx-overlay.open");
  let mode;
  if (sheet) { mode = "sheet"; add("A", sheet, "sheet"); add("A", sheet.querySelector(".tm-sheet__actions"), "sheet actions"); cards(sheet, "sheet"); }
  else if (rx) { mode = "rx"; add("A", rx.querySelector("#rx-overlay-header"), "viewer header"); add("A", rx.querySelector("#rx-overlay-body"), "viewer body"); }
  else if (ps) { mode = "prescribe"; add("A", ps.querySelector("#ps-top"), "edit header + summary"); add("A", ps.querySelector("#ps-body"), "Prescribe body"); add("A", ps.querySelector("#ps-actionbar"), "bar"); cards(ps.querySelector("#ps-body"), "Prescribe"); }
  else if (document.querySelector(".case-screen")) {
    mode = "case"; add("A", document.querySelector("#case-head"), "case header"); add("A", document.querySelector("#case-scroll"), "case content");
    add("A", document.querySelector("#case-actionbar"), "bar"); cards(document.querySelector("#case-scroll"), "case");
  } else if (document.querySelector(".profile-page")) {
    mode = "profile"; const p = document.querySelector(".profile-page");
    add("A", p.querySelector(".profile-header"), "Profile header"); add("A", p.querySelector(".profile-body"), "Profile body"); cards(p.querySelector(".profile-body"), "Profile");
  } else { mode = "other"; add("A", document.querySelector("#screen > *"), "screen"); }
  return { mode, regs };
};

// In-page facts for the reviews: text styles, tap targets, visible strings (inside the measured regions only).
const FACTS = () => {
  const vis = (e) => { for (let p = e; p && p.nodeType === 1; p = p.parentElement) { const c = getComputedStyle(p); if (c.display === "none" || c.visibility === "hidden" || parseFloat(c.opacity) === 0) return false; } return e.getClientRects().length > 0; };
  const scopes = [...document.querySelectorAll("[data-r3]")];
  const inScope = (e) => scopes.some((s) => s.contains(e)) && !e.closest(".rx-paper, .mock-kbd, .sr-only, .visually-hidden");
  const text = []; const seen = new Set();
  const w = document.createTreeWalker(document.querySelector("#screen") || document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode());) {
    const t = n.textContent.replace(/\s+/g, " ").trim(); const el = n.parentElement;
    if (!t || !el || !inScope(el) || !vis(el)) continue;
    const c = getComputedStyle(el); const key = `${t}|${c.fontSize}|${c.fontWeight}|${c.lineHeight}`;
    if (seen.has(key)) continue; seen.add(key);
    text.push({ t: t.slice(0, 90), fs: parseFloat(c.fontSize), fw: c.fontWeight, lh: c.lineHeight, cls: (el.className && typeof el.className === "string" ? el.className : el.tagName.toLowerCase()).slice(0, 60),
      tag: !!el.closest(".tm-tag"), legal: !!el.closest(".tm-legal"), color: c.color });
  }
  const taps = [];
  for (const e of document.querySelectorAll("button, a[href], [role=button], label.tm-check, input, textarea, select, .profile-row, [onclick]")) {
    if (!inScope(e) || !vis(e)) continue;
    const r = e.getBoundingClientRect(); let ar = r;
    const after = getComputedStyle(e, "::after"); const aH = parseFloat(after.height) || 0;   // .tm-link: 48 hit area from ::after
    const h = Math.max(r.height, aH);
    if (h < 47.5 || r.width < 47.5) taps.push({ name: (e.getAttribute("aria-label") || e.innerText || e.className || e.tagName).toString().replace(/\s+/g, " ").trim().slice(0, 48), w: Math.round(r.width), h: Math.round(h), cls: String(e.className).slice(0, 60) });
  }
  return { text, taps };
};

const resetScroll = () => document.querySelectorAll("*").forEach((e) => { if (e.scrollTop && !e.classList.contains("wheel")) e.scrollTop = 0; });

async function measure(page) {
  await page.evaluate(resetScroll);
  await page.addStyleTag({ content: ".wheel{overflow-y:hidden !important}" });
  const { mode, regs } = await page.evaluate(TAG);
  const opts = (pass) => ({ root: "#screen", regions: regs.filter((r) => r.pass === pass).map(({ name, selector }) => ({ name, selector, optional: true })), roles, ignore, atomic, rules });
  const A = await checker.measurePage(page, opts("A"));
  // Inside a card every element's closest('.tm-card') is the card itself, so D-108's "cards stacked 16" pair would judge
  // every gap inside it. Pass B drops that one pair (it is measured in pass A, where cards are units).
  const insideRules = [...rules, ...checker.D108_RULES.filter((r) => !(r.above === "@card" && r.below === "@card"))];
  const B = regs.some((r) => r.pass === "B") ? await checker.measurePage(page, { ...opts("B"), rules: insideRules, defaultRules: false }) : { regions: [], failures: 0, origin: A.origin };
  return { mode, regions: [...A.regions, ...B.regions], failures: A.failures + B.failures, origin: A.origin };
}

const { browser, base, close } = await serve();
const report = { checker: "design-system/scripts/check-visible-gaps.mjs (D-108 rules + project roles)", built: "app/ in capture mode (?capture=1&s=<id>&w=<w>)", sizes: ["390x844", "360x640"], pages: [] };
for (const id of ids) {
  for (const [w, h] of [[390, 844], [360, 640]]) {
    const errors = [];
    const page = await open(browser, base, id, w, h, errors);
    let rep, facts, tallNote = null, tallBad = [];
    try { rep = await measure(page); facts = await page.evaluate(FACTS); }
    catch (e) { rep = { mode: "?", regions: [], failures: 1, error: String(e) }; facts = { text: [], taps: [] }; }
    if (pictures && !rep.error) {
      // tall picture: grow the viewport by what the scroll areas hide, re-measure there and draw
      const extra = await page.evaluate(() => { let m = 0; for (const e of document.querySelectorAll("*")) { const c = getComputedStyle(e); if (/(auto|scroll)/.test(c.overflowY) && !e.classList.contains("wheel")) m = Math.max(m, e.scrollHeight - e.clientHeight); } return Math.min(m, 3200); });
      if (extra > 0) { await page.setViewportSize({ width: w, height: h + extra }); await page.waitForTimeout(150); }
      const tall = await measure(page);
      if (tall.failures !== rep.failures) tallNote = `tall picture shows ${tall.failures} failing gaps vs ${rep.failures} at ${w}x${h}`;
      // content below the fold inside an overflow-hidden ancestor (Prescribe) is clipped at the real viewport: the tall
      // layout (same width, same flow) is the complete record, so its failures are kept too (summarise.mjs takes the union).
      tallBad = tall.regions.flatMap((r) => r.gaps.filter((g) => !g.pass).map((g) => ({ region: r.name, above: g.above, below: g.below, px: g.px, expected: g.expected, rule: g.rule, note: g.note, tall: true })));
      await checker.drawReport(page, tall, path.join(OUT, `${id}_w${w}.png`));
    }
    await page.ctxClose();
    const bad0 = rep.regions.flatMap((r) => r.gaps.filter((g) => !g.pass).map((g) => ({ region: r.name, above: g.above, below: g.below, px: g.px, expected: g.expected, rule: g.rule, note: g.note })));
    const k = (b) => `${b.region}|${b.above}|${b.below}`;
    const bad = [...bad0, ...tallBad.filter((t) => !bad0.some((b) => k(b) === k(t)))];
    report.pages.push({ id, size: `${w}x${h}`, mode: rep.mode, pass: !bad.length && !errors.length, failures: bad.length, errors, error: rep.error, tallNote, bad,
      regions: rep.regions.map((r) => ({ name: r.name, missing: r.missing, gaps: r.gaps.map((g) => ({ above: g.above, below: g.below, px: g.px, expected: g.expected, pass: g.pass, rule: g.rule, note: g.note })) })),
      text: facts.text, taps: facts.taps });
    console.log(`${!bad.length && !errors.length ? "PASS" : "FAIL"} ${id} ${w}x${h} (${rep.mode}) ${bad.length} bad${rep.error ? " ERROR " + rep.error : ""}${errors.length ? " pageerrors " + errors.length : ""}`);
  }
}
await close();
fs.writeFileSync(path.join(OUT, "visible-gaps.json"), JSON.stringify(report, null, 1));
const passed = report.pages.filter((p) => p.pass).length;
console.log(`\n${passed} / ${report.pages.length} captures pass`);
