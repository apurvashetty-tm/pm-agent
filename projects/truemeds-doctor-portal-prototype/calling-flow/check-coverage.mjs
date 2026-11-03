// Coverage check for the calling-flow page (CHECKLIST C1, C2, C4, B3). Run: node calling-flow/check-coverage.mjs
import fs from "fs"; import path from "path"; import vm from "vm"; import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.join(here, "..");
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(here, "data.js"), "utf8"), ctx);
vm.runInContext(fs.readFileSync(path.join(root, "ui-screens/feedback/messages.js"), "utf8"), ctx);
const F = ctx.window.FLOW, MSG = ctx.window.TMFeedback.messages;
const fails = [];
const used = new Set(Object.values(F.states).flatMap(s => s.pics || []));
const pics = fs.readdirSync(path.join(root, "ui-screens/case")).filter(f => f.endsWith("_w390.png")).map(f => f.replace("_w390.png", ""));
for (const p of pics) if (!used.has(p) && !F.notCalling.includes(p)) fails.push(`C1 picture not on the page: ${p}`);
for (const p of used) if (!pics.includes(p)) fails.push(`C6 picture missing in ui-screens/case: ${p}`);
const logic = fs.readFileSync(path.join(root, "ui-screens/app-logic.md"), "utf8");
const table = logic.split("**State table")[1].split("**Fallback B")[0];
for (const m of table.matchAll(/`([a-z]\d[\w-]*)`/g)) if (!used.has(m[1]) && !/t15b/.test(m[1]) && !m[1].includes("…")) fails.push(`C1 app-logic §5 render id not on the page: ${m[1]}`);
if ([...used].some(p => p.startsWith("t15b"))) fails.push("C1 retired state 15b is on the page");
for (const e of [...F.edges, ...F.trunk]) for (const id of e.slice(0, 2)) if (!F.states[id]) fails.push(`C2 arrow points to unknown box ${id}`);
for (const e of F.edges) if (!["a", "e"].includes(e[3])) fails.push(`C2 arrow without a kind: ${e}`);
for (const [id, s] of Object.entries(F.states)) {
  for (const k of s.copy || []) if (MSG[k] === undefined) fails.push(`C4 ${id}: copy key not in messages.json: ${k}`);
  if (!s.ref && s.style !== "later" && s.style !== "note" && !(s.how || s.sees || s.rules)) fails.push(`C4 ${id}: no panel content`);
  const linked = [...F.edges, ...F.trunk].some(e => e.includes(id));
  if (!linked && !["ANY", "LATER"].includes(id)) fails.push(`C2 ${id}: no arrow in or out`);
}
console.log(`states ${Object.keys(F.states).length} · arrows ${F.edges.length + F.trunk.length} · pictures used ${used.size}/${pics.length} (${F.notCalling.length} not calling)`);
console.log(fails.length ? fails.join("\n") + `\nFAIL ${fails.length}` : "PASS — 0 failures");
process.exit(fails.length ? 1 : 0);
