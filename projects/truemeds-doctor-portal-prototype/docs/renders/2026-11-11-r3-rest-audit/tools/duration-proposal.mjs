// Proposal render (not a change): Prescribe's duration picker today vs a reduced option set, at 390 × 844 and 360 × 640.
// Opens the built app's d-duration-picker state in capture mode and swaps the open panel's chips in the capture page only
// (same design-system chip classes, 4-column numeric grid with 8 gaps, §9.2). Nothing in app/ changes.
//   node docs/renders/2026-11-11-r3-rest-audit/tools/duration-proposal.mjs
// Writes duration/<variant>_w<w>.png, duration/duration-proposal.png (side by side) and duration/measure.json.
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
import { serve, open, checker } from "./lib.mjs";
const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "..", "duration"); fs.mkdirSync(OUT, { recursive: true });

// Variants. P1 (recommended): unit first (word chips), then the numbers that make sense for that unit (≤ 8 = two rows of 4).
// P2: one fixed number list of 8, unit after (today's order).
const VARIANTS = {
  today: null,
  "p1-days": { unitFirst: true, unit: "Days", nums: [1, 2, 3, 5, 7, 10, 14, 15], sel: 5 },
  "p1-weeks": { unitFirst: true, unit: "Weeks", nums: [1, 2, 3, 4, 6, 8], sel: 2 },
  "p1-months": { unitFirst: true, unit: "Months", nums: [1, 2, 3, 4, 6, 12], sel: 6 },
  "p2-fixed": { unitFirst: false, unit: "Days", nums: [1, 2, 3, 5, 7, 10, 14, 15], sel: 5 },
};
const SWAP = (v) => {
  const panel = document.querySelector("#ps-dur-panel"); if (!panel) throw new Error("duration panel not open");
  const chipCls = "tm-chip tm-chip--lg";
  const mk = (t, on) => `<button type="button" class="${chipCls}" aria-pressed="${on}">${t}</button>`;
  const grid = `<div class="ps-grid" role="group" aria-label="Duration number">${v.nums.map((n) => mk(n, n === v.sel)).join("")}</div>`;
  const units = `<div class="ps-dur-units"><div class="tm-chip-group">${["Days", "Weeks", "Months", "Ongoing"].map((u) => mk(u, u === v.unit)).join("")}</div></div>`;
  panel.innerHTML = v.unitFirst ? units + grid : grid + units;
  // proposed spacing: 16 visible between the toggle's value and the first chip row; 16 between the two chip groups
  panel.style.paddingTop = "var(--tm-space-2xs)";   // 12.9 visible today + 4 = 16
  const second = panel.children[1]; second.style.marginTop = "var(--tm-space-lg)";
  if (v.unitFirst) { const u = panel.querySelector(".ps-dur-units"); u.style.marginTop = "0"; }
  // side inset: today the grid and the unit row are pulled 12 left (B-09 inset), so chips touch the field's border
  // ("margins are non-existent"). Proposal: both start on the value text's left edge, 12 inside the border, full width.
  for (const e of panel.querySelectorAll(".ps-grid, .ps-dur-units")) { e.style.marginLeft = "0"; e.style.width = "100%"; }
  const val = document.querySelector("#ps-dur-value"); if (val) { val.firstChild.textContent = `${v.sel} ${v.unit.toLowerCase()}`; const sp = val.querySelector("span"); if (sp) sp.textContent = "Changed"; }
};
const { browser, base, close } = await serve();
const meas = {};
for (const [name, v] of Object.entries(VARIANTS)) for (const [w, h] of [[390, 844], [360, 640]]) {
  const page = await open(browser, base, "d-duration-picker", w, h);
  if (v) await page.evaluate(SWAP, v);
  await page.waitForTimeout(100);
  // put the duration card at the top of the body so the whole picker shows
  const clip = await page.evaluate(() => { const c = document.querySelector("#ps-card-duration"); c.scrollIntoView({ block: "start" }); const b = document.querySelector("#ps-body"); b.scrollTop -= 16;
    const r = c.getBoundingClientRect(); return { x: 0, y: Math.max(0, r.top - 16), width: innerWidth, height: Math.min(innerHeight - Math.max(0, r.top - 16), r.height + 32) }; });
  await page.screenshot({ path: path.join(OUT, `${name}_w${w}.png`), clip });
  // visible gaps inside the card
  await page.evaluate(() => document.querySelector(".ps-dur-field").setAttribute("data-r3", "dur"));
  const rep = await checker.measurePage(page, { root: "#screen", regions: [{ name: "duration field (inside the border)", selector: '[data-r3="dur"]' }], roles: { groupLabel: ".ps-label" } });
  meas[`${name}_w${w}`] = rep.regions[0].gaps.map((g) => `${g.px}${g.pass ? "" : " ≠ " + g.expected} ${g.above.slice(0, 24)} → ${g.below.slice(0, 24)}`);
  await page.ctxClose();
}
await close();
fs.writeFileSync(path.join(OUT, "measure.json"), JSON.stringify(meas, null, 1));
console.log(JSON.stringify(meas, null, 1));
