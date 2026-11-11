// R3: the D-106 / D-107 / D-109 copy batch applied to ui-screens/feedback/messages.json + metadata.json (key order kept;
// renamed keys take the old key's place). Run once from the project folder: node docs/renders/2026-11-11-r2-build/tools/copy-batch.mjs
// then: node ui-screens/feedback/build-messages.mjs && cp ui-screens/feedback/messages.js app/feedback/messages.js
import fs from "fs";
const MJ = "ui-screens/feedback/messages.json", MD = "ui-screens/feedback/metadata.json";
const msgs = JSON.parse(fs.readFileSync(MJ, "utf8")), meta = JSON.parse(fs.readFileSync(MD, "utf8"));
const COPY = (why) => `approved ${why} (2026-11-11)`;
const label = (slot, extra = {}) => ({ pattern: "none", trigger: "screen label", slot, next: "—", clear: "—", retain: "—", copy: COPY("D-106"), ...extra });

// [key, new text, why] — text changes on existing keys
const TEXT = [
  ["signin.smsHelper", "We’ll send you an OTP by SMS.", "D-109 §1"],
  ["signin.couldntSend", "Couldn’t send the OTP.", "D-109 §1"],
  ["otp.newSent", "New code sent.", "D-109 §1"],
  ["offer.title", "Skip OTPs next time", "D-107"],
  ["offer.pointNoWait", "No SMS to wait for.", "D-109 §1"],
  ["home.titleSetup", "Start taking cases", "D-106"],
  ["home.subSetup", "You can add time or stop anytime.", "D-106"],
  ["home.titleActive", "You can take cases", "D-107 (band audit §3)"],
  ["home.subActive", "Request a case now, or whenever you’re ready.", "D-107 (band audit §3)"],
  ["home.titleEnded", "Availability ended", "D-107"],
  ["home.rxToday", "Prescriptions written today", "D-106"],
  ["home.addTime", "Add time", "D-106"],
  ["home.addTitle", "Add time", "D-109 §1"],
  ["home.endSub", "You won’t get new cases after this. A case already assigned to you stays with you.", "D-109 §1"],
];
// renames: old → [new key, text, slot]
const RENAME = {
  "offer.fingerprintLine": ["offer.fingerprintPoint", "Sign in with one touch", "offer point 1 title, fingerprint"],
  "offer.faceIdLine": ["offer.faceIdPoint", "Sign in with a glance", "offer point 1 title, Face ID"],
  "offer.screenLockLine": ["offer.screenLockPoint", "Sign in with your PIN or pattern", "offer point 1 title, screen lock"],
  "home.adjust": ["home.custom", "Custom", "Home duration picker group label (setup and add-time sheet)"],
};
const REMOVE = ["home.minimum"];   // D-106: no range text, no "Minimum 15 minutes"
// new keys inserted after an anchor: [anchor, key, text, metadata]
const ADD = [
  ["home.custom", "home.quickPicks", "Quick picks", label("Home duration picker group label (setup and add-time sheet)")],
  ["home.custom", "home.addHint", "Up to 10 hours in total", label("add-time sheet: helper on the Custom label line (10-hour cap)", { trigger: "add-time sheet" })],
  ["home.setAvailability", "home.availableUntil", "Available until {time}", label("setup: caption line 8 above Set availability", { trigger: "setup duration picked", placeholders: ["time"] })],
  ["home.addConfirm", "home.durMinutes", "{m} min", label("duration in the Add button, under 60 min", { placeholders: ["m"] })],
  ["home.durMinutes", "home.durHours", "{h} h", label("duration in the Add button, whole hours", { placeholders: ["h"] })],
  ["home.durHours", "home.durHoursMinutes", "{h} h {m} min", label("duration in the Add button, hours and minutes", { placeholders: ["h", "m"] })],
];

function rebuild(obj, fn) { const out = {}; for (const [k, v] of Object.entries(obj)) fn(out, k, v); return out; }
let M = rebuild(msgs, (o, k, v) => { if (REMOVE.includes(k)) return; if (RENAME[k]) o[RENAME[k][0]] = RENAME[k][1]; else o[k] = v; });
let D = rebuild(meta, (o, k, v) => { if (REMOVE.includes(k)) return; if (RENAME[k]) o[RENAME[k][0]] = { ...v, slot: RENAME[k][2], copy: COPY("D-109 §1") }; else o[k] = v; });
for (const [k, t, why] of TEXT) { if (!(k in M)) throw new Error("missing " + k); M[k] = t; D[k] = { ...D[k], copy: COPY(why) }; }
M["home.addConfirm"] = "Add {duration}";
D["home.addConfirm"] = { ...D["home.addConfirm"], placeholders: ["duration"], copy: COPY("D-106 (hours and minutes from 60 min up)") };
for (const [anchor, k, t, md] of ADD) {
  const ins = (obj, val) => rebuild(obj, (o, kk, vv) => { o[kk] = vv; if (kk === anchor) o[k] = val; });
  M = ins(M, t); D = ins(D, md);
}
fs.writeFileSync(MJ, JSON.stringify(M, null, 2) + "\n");
fs.writeFileSync(MD, JSON.stringify(D, null, 2) + "\n");
console.log("messages", Object.keys(M).length, "metadata", Object.keys(D).length);
