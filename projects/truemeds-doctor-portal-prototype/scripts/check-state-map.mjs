// Drift check for the state map (checklist 1.1, 1.2, 1.3). Run: node scripts/check-state-map.mjs
// Fails if: a picture on disk has no single owner; a picture in the map is missing on disk; calling-flow/data.js names a
// picture or state the map lacks; retired keys appear; app/state-map.js is stale (not regenerated from the sources).
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";
import { build, render, ROOT, RETIRED } from "./build-state-map.mjs";

const fails = [];
const fail = (m) => fails.push(m);
const model = build();
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "app/state-map.js"), "utf8"), ctx);
const shipped = ctx.window.TM_STATE_MAP;

// 1.1 every approved picture on disk: exactly one row with one owning step
const onDisk = [];
for (const f of ["sign-in", "otp", "faster-signin-offer", "returning-unlock", "home", "prescribe", "case"])
  for (const file of fs.readdirSync(path.join(ROOT, "ui-screens", f))) if (file.endsWith("_w390.png")) onDisk.push(`${f}/${file.replace("_w390.png", "")}`);
const rowsByPic = new Map(), rowsById = new Map();
for (const r of shipped.pictures) {
  if (rowsByPic.has(r.picture)) fail(`1.1 picture listed twice: ${r.picture}`);
  rowsByPic.set(r.picture, r);
  rowsById.set(r.id, r);
  if (!Number.isInteger(r.step)) fail(`1.1 no owning step: ${r.picture}`);
  if (!fs.existsSync(path.join(ROOT, "ui-screens", r.picture + "_w390.png"))) fail(`1.1 map picture not on disk: ${r.picture}`);
  if (!r.id.length) fail(`1.1 empty id: ${r.picture}`);
}
for (const p of onDisk) if (!rowsByPic.has(p)) fail(`1.1 picture on disk not in the map: ${p}`);
if (onDisk.length !== 149) fail(`1.1 expected 149 pictures on disk, found ${onDisk.length}`);
if (shipped.pictures.length !== 149) fail(`1.1 expected 149 map rows, found ${shipped.pictures.length}`);
const ids = shipped.pictures.map((r) => r.id);
if (new Set(ids).size !== ids.length) fail("1.1 render IDs not unique");

// 1.2 behaviour-only states: IDs present, none retired
const otherIds = new Set(shipped.others.map((o) => o.id));
for (const r of RETIRED) if (otherIds.has(r) || ids.includes(r)) fail(`1.2 retired key carried: ${r}`);
for (const need of ["offer.cancelled", "offer.not-now", "offer.unsupported", "offer.enabled", "rx.load-failed", "case.reopened", "call.hold"])
  if (!otherIds.has(need) && !shipped.pictures.some((r) => r.behaviour === need)) fail(`1.2 behaviour state missing: ${need}`);

// 1.3 calling rows: every calling-flow state that has a picture is in the map under that picture
const flowCtx = { window: {} };
vm.createContext(flowCtx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "calling-flow/data.js"), "utf8"), flowCtx);
const F = flowCtx.window.FLOW;
for (const [key, s] of Object.entries(F.states)) {
  if (s.types === "A") continue;
  for (const pic of s.pics || []) {
    const r = rowsById.get(pic);
    if (!r) fail(`1.3 calling state ${key} picture not in map: ${pic}`);
    else if (!r.calling.includes(key)) fail(`1.3 picture ${pic} not linked to calling state ${key}`);
  }
}

// freshness: the committed app/state-map.js equals a fresh build from the sources
const fresh = render(model);
if (fresh !== fs.readFileSync(path.join(ROOT, "app/state-map.js"), "utf8")) fail("drift: app/state-map.js differs from a fresh build (run node scripts/build-state-map.mjs)");

console.log(`pictures ${onDisk.length} · map rows ${shipped.pictures.length} · behaviour/calling boxes ${shipped.others.length}`);
console.log(fails.length ? fails.join("\n") + `\nFAIL ${fails.length}` : "PASS — 0 drift failures");
process.exit(fails.length ? 1 : 0);
