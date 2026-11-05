// Builds the state map (plan v3 B4, checklist 1.1–1.3): one row per approved picture (one owning step),
// calling states from calling-flow/data.js (normalised), and behaviour-only states from feedback-state-map.md.
// Run from the project folder:  node scripts/build-state-map.mjs
// Writes: app/state-map.js (read by the app) and docs/state-map.md (the readable table).
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const FOLDERS = ["sign-in", "otp", "faster-signin-offer", "returning-unlock", "home", "prescribe", "case"];

// Retired keys: never carried into the map (MERGE.md §4 item 7, D-83, D-85).
export const RETIRED = ["call.forwarded-after-hangup", "case.end-call-first", "call.end-call-first", "call.endCallFirst", "t15b-end-call-first"];

// Step 0 registers every row; the step that owns the build is the one that makes it "built".
// Picture owners follow plan v3 §5 (one owner per picture). ↗ = trigger arrives in a later step.
const STEP_BY_PICTURE = {
  "a-back-blocked": [3, 5], "a-confirm-busy": [3, 5], "a-confirm-failed": [3, 5], "s-medicine-disabled": [3, 4],
  "home_profile-case-open": [2, 3],
  "s7d-result-missing-pilot": [6], "c-skip-ha": [6],
  "t08b-valid-forward": [9], "t11-calling-transfer": [9], "t12-transfer-ready": [9],
};
const STEP5 = ["t01-ready", "t02-calling", "t03-not-through", "t04-doctor-missed", "t05-result-wait", "t06-ended-early",
  "t08a-valid-cat4", "t08c-confirm-blocked", "t09-patient-unavailable", "t10a-confirmed", "s7a-calling", "s7b-still-on-call",
  "s7d-result-missing", "s7d-unavailable-sheet", "s7f-submitted", "c-callback", "c-callback-error",
  "c-callback-failed", "c-callback-refused", "e-callback-scheduled", "e-availability-ended"];
const STEP6 = ["g0-calling-pilot", "g1-generic-confirm", "g2-checking-ha", "t13-connecting-ha", "t14-transferred",
  "t15-ha-no-join", "t15-after-hangup", "g3b-forwarded", "g3b-after-hangup", "t16-transfer-missed", "t16b-transfer-missed-patient",
  "t16c-transfer-missed-unknown", "t10b-forwarded", "t17-skip-ha-wait"];
const STEP3_CASE = ["s7e-leave-sheet"];

export function pictureStep(folder, base) {
  if (STEP_BY_PICTURE[base]) return STEP_BY_PICTURE[base];
  if (folder === "sign-in" || folder === "otp" || folder === "faster-signin-offer" || folder === "returning-unlock") return [1];
  if (folder === "home") return [2];
  if (folder === "prescribe") return base === "d-rx-failed" ? [3] : [4];
  if (folder === "case") {
    if (base.startsWith("a-") || base.startsWith("s-") || STEP3_CASE.includes(base)) return [3];
    if (STEP5.includes(base)) return [5];
    if (STEP6.includes(base)) return [6];
  }
  return null; // unowned: the build fails
}

// Behaviour-only rules (feedback-state-map IDs with no picture), by prefix; specific overrides first.
const BEHAVIOUR_STEP = { "offer.": 1, "unlock.": 1, "signin.": 1, "otp.": 1, "home.": 2, "prescribe.": 4, "rx.": 3, "call.": 5, "case.": 3 };
const BEHAVIOUR_OVERRIDE = {
  "case.reopened": 7, "case.callback-failed": 5, "case.callback-refused": 5, "case.confirm-busy": 5, "case.confirm-failed": 5,
  "case.result-missing-pilot": 6, "call.transfer-failed": 6, "call.skipHa": 6, "call.waiting-for-hangup": 6, "call.transfer-missed": 6,
  "call.skip-ha-wait": 6, "call.connectingHa": 6, "call.transferred": 6, "rx.load-failed": 3, "offer.cancelled": 1,
  "offer.not-now": 1, "offer.unsupported": 1, "offer.enabled": 1, "case.back-before-call": 3, "case.no-medicines": 3,
  "case.closed-availability-ended": 3,
};

function loadFlow() {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "calling-flow/data.js"), "utf8"), ctx);
  return ctx.window.FLOW;
}

function parseFeedbackStateMap() {
  const text = fs.readFileSync(path.join(ROOT, "docs/feedback-state-map.md"), "utf8");
  const ids = new Set();
  for (const line of text.split("\n")) {
    const m = line.match(/^\|\s*([a-z][a-z0-9-]*\.[A-Za-z0-9./-]+)\s*\|/);
    if (m) ids.add(m[1]);
  }
  return [...ids];
}

// Name match between a feedback-state-map ID and a picture (e.g. signin.default ↔ sign-in_default). Reviewed by eye.
const PREFIX_FOLDER = { signin: "sign-in", otp: "otp", offer: "faster-signin-offer", unlock: "returning-unlock", home: "home", prescribe: "prescribe", case: "case" };
function matchPicture(id, pics) {
  const [prefix, rest] = id.split(/\.(.+)/);
  const folder = PREFIX_FOLDER[prefix];
  if (!folder) return null;
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const wants = rest.split("/").map(norm);
  const hit = pics.find((p) => p.folder === folder && wants.some((w) => w.length >= 4 && norm(p.base).endsWith(w)));
  return hit ? hit.base : null;
}

export function build() {
  const pics = [];
  for (const f of FOLDERS) {
    const dir = path.join(ROOT, "ui-screens", f);
    for (const file of fs.readdirSync(dir).sort()) {
      if (!file.endsWith("_w390.png")) continue;
      const base = file.replace("_w390.png", "");
      if (!fs.existsSync(path.join(dir, base + "_w360.png"))) throw new Error(`missing 360 picture for ${f}/${base}`);
      pics.push({ folder: f, base, picture: `${f}/${base}` });
    }
  }
  const rows = new Map();
  for (const p of pics) {
    const step = pictureStep(p.folder, p.base);
    if (!step) throw new Error(`no owning step for picture ${p.picture}`);
    rows.set(p.base, {
      id: p.base, kind: "picture", picture: p.picture, step: step[0], lookAhead: step.length > 1 ? step.slice(1) : [],
      version: step[0] === 9 ? "A" : "B", calling: [], behaviour: null, notes: [],
    });
  }
  // Calling states (calling-flow/data.js). Join boxes and notes are references, not states.
  const flow = loadFlow();
  const callingRows = [];
  for (const [key, s] of Object.entries(flow.states)) {
    if (["join", "later"].includes(s.style)) continue;
    if (s.types === "A") continue; // version A boxes: their pictures carry version 9 (not calling rows)
    if (s.style === "note") { // side panel: links its pictures to the state, adds no row of its own
      for (const pic of s.pics || []) rows.get(pic)?.calling.push(key);
      continue;
    }
    if (s.pics && s.pics.length) {
      for (const pic of s.pics) {
        const row = rows.get(pic);
        if (!row) throw new Error(`calling state ${key} names unknown picture ${pic}`);
        row.calling.push(key);
      }
    } else {
      callingRows.push({ key, title: (s.title || "").replace(/\n/g, " "), types: s.types || "", version: "B", stateId: s.stateId || "—" });
    }
  }
  // Normalising step (B4): Pilot retries keep Pilot context. data.js draws 6 → Call again and 7b → Still talking into the Cat4 lane (C0).
  for (const e of flow.edges) {
    if (e[1] === "C0" && (e[0] === "C6" || e[0] === "C7b")) {
      for (const p of flow.states[e[0]].pics || []) rows.get(p).notes.push(`Pilot retry (${e[2].replace(/\n/g, " ")}) → B0 Calling… (Pilot context kept)`);
    }
  }
  // Behaviour-only states (feedback-state-map.md IDs with no picture)
  const pictureBases = pics;
  const behaviour = [];
  for (const id of parseFeedbackStateMap()) {
    if (RETIRED.includes(id)) continue;
    const pic = matchPicture(id, pictureBases);
    if (pic) { rows.get(pic).behaviour = id; continue; }
    const prefix = Object.keys(BEHAVIOUR_STEP).find((p) => id.startsWith(p));
    const step = BEHAVIOUR_OVERRIDE[id] ?? (prefix ? BEHAVIOUR_STEP[prefix] : 5);
    behaviour.push({ id, kind: "behaviour", step, picture: null, version: "B" });
  }
  // Extra behaviour-only states named in plan B4 / checklist 1.2 that feedback-state-map.md does not list as rows
  for (const [id, step] of [["call.hold", 5], ["call.mismatch-logged", 6]]) {
    if (!behaviour.find((b) => b.id === id)) behaviour.push({ id, kind: "behaviour", step, picture: null, version: "B" });
  }
  for (const r of callingRows) behaviour.push({ id: `flow.${r.key}`, kind: "calling-box", step: /^(T|E|B)/.test(r.key) ? 6 : 5, picture: null, version: r.version, calling: r.key, title: r.title, types: r.types });
  const out = [...rows.values()].sort((a, b) => a.step - b.step || a.id.localeCompare(b.id));
  // Transitions (checklist 1.3, plan B4): every arrow in data.js, joins resolved to the box they reference, Pilot retries kept
  // on the Pilot route. Scenario context: the route tag of the box the arrow starts from (C = Cat4, B = Pilot, A = version A).
  const boxes = flow.states;
  const resolveId = (id) => (boxes[id] && boxes[id].style === "join" && boxes[id].ref ? boxes[id].ref : id);
  const route = (id) => { const t = (boxes[id] && boxes[id].types) || ""; return /^[AJ]?A/.test(id) || t === "A" ? "A" : t.includes("P") && !/[CK]/.test(t) ? "pilot" : t.includes("P") ? "shared" : "cat4"; };
  const edges = [];
  for (const e of flow.edges) {
    const from = resolveId(e[0]), to = resolveId(e[1]);
    edges.push({ from, to, via: [e[0], e[1]].filter((x) => x !== from || x !== to).filter((x) => boxes[x] && boxes[x].style === "join"), label: e[2].replace(/\n/g, " "), kind: e[3], drawn: e[4] !== "text", route: route(e[0]) });
    if (e[1] === "C0" && (e[0] === "C6" || e[0] === "C7b")) edges.push({ from: e[0], to: "B0", via: [], label: `${e[2].replace(/\n/g, " ")} (Pilot context kept)`, kind: e[3], drawn: false, route: "pilot" });
  }
  for (const t of flow.trunk) edges.push({ from: t[0], to: t[1], via: [], label: t[2].replace(/\n/g, " "), kind: "trunk", drawn: true, route: "split" });
  edges.sort((a, b) => (a.from + a.to + a.label).localeCompare(b.from + b.to + b.label));
  return { pictures: out, others: behaviour.sort((a, b) => a.step - b.step || a.id.localeCompare(b.id)), edges, paths: flow.paths };
}

export function render(model) {
  const lines = [];
  lines.push("// GENERATED by scripts/build-state-map.mjs — do not edit. Drift is checked by scripts/check-state-map.mjs.");
  lines.push("window.TM_STATE_MAP = " + JSON.stringify({ pictures: model.pictures, others: model.others, edges: model.edges, paths: model.paths, retired: RETIRED }, null, 1) + ";");
  return lines.join("\n") + "\n";
}

export function renderMd(model) {
  const L = [];
  L.push("# State map — generated", "", "Generated by `scripts/build-state-map.mjs` (do not edit). Drift check: `scripts/check-state-map.mjs`.", "");
  L.push(`Pictures: ${model.pictures.length} (each has one owning step) · behaviour-only and calling boxes: ${model.others.length} · retired keys not carried: ${RETIRED.map((r) => "`" + r + "`").join(", ")}`, "");
  L.push("## Pictures (149, one owner each)", "", "| Step | Render ID | Picture | Calling state(s) | Behaviour ID | Version | Notes |", "|---|---|---|---|---|---|---|");
  for (const r of model.pictures) {
    const ahead = r.lookAhead.length ? ` ↗${r.lookAhead.join(",")}` : "";
    L.push(`| ${r.step}${ahead} | \`${r.id}\` | ${r.picture} | ${r.calling.join(", ") || "—"} | ${r.behaviour || "—"} | ${r.version} | ${r.notes.filter(Boolean).join("; ") || "—"} |`);
  }
  L.push("", `## Transitions (${model.edges.length} from data.js; joins resolved; generated one journey test per drawn edge for steps 5–6)`, "", "| From | To | Label | Kind | Route | Via join |", "|---|---|---|---|---|---|");
  for (const e of model.edges) L.push(`| ${e.from} | ${e.to} | ${e.label} | ${e.kind} | ${e.route} | ${e.via.join(", ") || "—"} |`);
  L.push("", "## Behaviour-only states and calling boxes (no picture)", "", "| Step | ID | Source | Version | Note |", "|---|---|---|---|---|");
  for (const o of model.others) L.push(`| ${o.step} | \`${o.id}\` | ${o.kind}${o.calling ? " " + o.calling : ""} | ${o.version} | ${o.title ? o.title : "—"} |`);
  return L.join("\n") + "\n";
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const model = build();
  fs.mkdirSync(path.join(ROOT, "app"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "app/state-map.js"), render(model));
  fs.writeFileSync(path.join(ROOT, "docs/state-map.md"), renderMd(model));
  console.log(`pictures ${model.pictures.length} · others ${model.others.length} · written app/state-map.js and docs/state-map.md`);
}
