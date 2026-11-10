// F-03 (Apurva 2026-11-09): Back on Profile (header arrow and phone back) must land on Home.
// Runs the real app/core/nav.js with a stubbed browser history; mirrors home.js profileBack + its screen Back.
import assert from "node:assert/strict";
let pops = [];
globalThis.history = { pushState() {}, replaceState() {} };
globalThis.location = { href: "x" };
globalThis.addEventListener = (t, fn) => { if (t === "popstate") pops.push(fn); };
const nav = await import("../app/core/nav.js");
let shown = [];
nav.setRenderer((_s, p) => shown.push(p.s));
nav.attachPhoneBack();
function openProfile() {
  nav.push(null, { s: "home_profile" });
  // as in home.js: the screen's own Back, and profileBack (fixed)
  const profileBack = () => { if (nav.depth() > 1) { nav.setScreenBack(null); nav.back(); } else { nav.reset(); nav.push(null, { s: "home_active" }); } };
  nav.setScreenBack(() => profileBack());
  return profileBack;
}
// 1. header arrow
nav.start(null, { s: "home_active" });
let profileBack = openProfile();
profileBack();
assert.equal(nav.current().params.s, "home_active", "header Back lands on Home");
assert.equal(nav.depth(), 1);
// 2. phone back
profileBack = openProfile();
pops.forEach((fn) => fn());
assert.equal(nav.current().params.s, "home_active", "phone Back lands on Home");
assert.equal(nav.depth(), 1);
// 3. the same code as home.js uses (guard against drift)
import { readFileSync } from "node:fs";
assert.match(readFileSync(new URL("../app/screens/home.js", import.meta.url), "utf8"), /function profileBack\(\) \{ if \(depth\(\) > 1\) \{ setScreenBack\(null\); navBack\(\); \}/);
console.log("PASS F-03 profile back: header arrow and phone back land on Home (3/3)");
