// The doctor's working session (app-logic §3–4, plan B12 "remembering"): availability window, the case request in flight,
// prescriptions today and the open case (medicines reviewed, notes typed, stage). One object, kept in the mode's storage, so a
// reload / reopen comes back to the same place. Capture writes nothing (storage), demo and review keep separate storage.
// Times are app-clock time stamps (plan B8): every countdown is worked out from them, never counted.
import { clock } from "./clock.js";
import { value } from "./settings.js";
import { storageFor } from "./storage.js";
import { store } from "./store.js";
import { caseFor } from "../data/cases.js";

const KEY = "work";
const blank = () => ({
  avail: null,        // { endsAt } while availability is set (it may have run out: see availability())
  ended: null,        // "idle" | "manual" — why availability ended (Home notice), cleared when it is set again
  stopping: false,    // End availability tapped while a request is pending (app-logic §3: honoured, then ends)
  request: null,      // { at } — one case request in flight (honoured even if the window ends, app-logic §3)
  rxToday: 0,         // prescriptions confirmed today (count only, app-logic §3)
  openCase: null,     // the case on the doctor's screen (data + medicines + notes + stage)
});
let mem = null;
const mode = () => store.get().mode || "review";
const db = () => storageFor(mode());
export function work() { if (!mem) mem = { ...blank(), ...(db().get(KEY) || {}) }; return mem; }
export function saveWork(patch = {}) { Object.assign(work(), patch); db().set(KEY, mem); return mem; }
export function resetWork(patch = {}) { mem = { ...blank(), ...patch }; db().set(KEY, mem); return mem; }
const v = (k) => value(k, mode());

// ---- availability ----
// "none" (set it) · "active" · "near" (Availability ends soon, + Add time) · "expired-pending" (ran out with a request open) ·
// "stopping" (ended by the doctor with a request open). Ends on its own when the clock passes endsAt (app-logic §3).
export function availability() {
  const w = work();
  if (!w.avail) return { state: "none", left: 0 };
  const left = Math.max(0, w.avail.endsAt - clock.now());
  if (w.stopping) return w.request ? { state: "stopping", left: 0 } : endNow("manual");
  if (left <= 0) return w.request ? { state: "expired-pending", left: 0 } : endNow("idle");
  return { state: left <= v("nearExpiryWarning") ? "near" : "active", left };
}
function endNow(why) { saveWork({ avail: null, ended: why, stopping: false }); return { state: "none", left: 0 }; }
export function setAvailability(ms) { saveWork({ avail: { endsAt: clock.now() + ms }, ended: null, stopping: false }); }
export function addTime(ms) { const w = work(); if (w.avail) saveWork({ avail: { endsAt: w.avail.endsAt + ms } }); }
// End availability (sheet confirmed): with a request open it waits for that request (stop-pending), else it ends now.
export function endAvailability() { const w = work(); if (w.request) saveWork({ stopping: true }); else saveWork({ avail: null, ended: "manual", stopping: false }); }

// ---- case request (pull model, app-logic §3) ----
export function startRequest() { saveWork({ request: { at: clock.now() } }); }
export function clearRequest() { saveWork({ request: null }); }

// ---- the open case ----
export function openCase(scenario, kind) {
  const c = caseFor(scenario, kind);
  c.kind = kind; c.notes = { symptoms: "", doctor: "" }; c.stage = "ready"; c.openedAt = clock.now();
  saveWork({ openCase: c, request: null });
  return c;
}
export function currentCase() { return work().openCase; }
export function updateCase(patch) { const c = work().openCase; if (!c) return null; Object.assign(c, patch); saveWork(); return c; }
export function updateMedicine(id, patch) { const c = work().openCase; const m = c && c.medicines.find((x) => x.id === id); if (!m) return null; Object.assign(m, patch); saveWork(); return m; }
// Release (Back → Release case, or the empty case's Release case): the case goes back to the queue (OQ-024, backend).
export function releaseCase() { saveWork({ openCase: null }); }
// A confirmed prescription counts once (app-logic §3; D-50 analytics are the call steps' job).
export function countConfirmed() { saveWork({ rxToday: work().rxToday + 1 }); }
