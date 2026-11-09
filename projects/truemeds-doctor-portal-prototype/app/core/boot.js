// Entry point (plan v3 §5 step 0). Order matters: resolve the effective mode first, then storage, then the story, then the consumers.
import { resolveMode } from "./modes.js";
import { clock } from "./clock.js";
import { store } from "./store.js";
import { storageFor } from "./storage.js";
import { setRenderer, attachPhoneBack, push, start } from "./nav.js";
import { decodeStory, defaultStory, encodeStory } from "./play-link.js";
import { timeline } from "./call-sim.js";
import { createServer, createPoller } from "./mock-server.js";
import { setUnlockOutcome } from "./unlock.js";
import { value } from "./settings.js";
import { renderState, renderShellIntro } from "../shell/screen-host.js";
import { onOpen, unlockState } from "./faster-signin.js";
import { authCtx } from "../screens/entry-ctx.js";
import { mountPanel, focusJourney, logLine, setLogKeeper } from "../review/panel.js";
import { setEventSink, event } from "./events.js";
import { work, settleRecords } from "./session.js";
import { recordOutcome } from "./call-engine.js";
import { CALL_KEYS } from "../data/story-schema.js";
import { mountDrawer } from "../review/drawer.js";
import { REVIEW_TEXT as T } from "../review/labels.js";

const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const q = resolveMode(location.search, { standalone });
const notice = document.getElementById("notice-host");
const host = document.getElementById("screen");
const panelRoot = document.getElementById("review-panel");

// 1. Story first (play link). An unreadable code makes the whole session review, with a notice.
let story = defaultStory();
let unreadable = false;
if (q.mode === "play") {
  const decoded = decodeStory(q.play || "");
  if (decoded) story = decoded; else unreadable = true;
}
// 2. Effective mode, then everything that depends on it.
const mode = unreadable ? "review" : q.mode;
clock.setMode(mode);
document.body.dataset.mode = mode;
const storage = storageFor(mode);
// Review: the panel's story is the simulated phone and server, so it survives reopening the app (a reload) like the phone does;
// Reset clears it. Play keeps the link's story; capture writes nothing.
if (mode === "review") { const kept = storage.get("story"); const ok = kept && decodeStory(encodeStory(kept)); if (ok) story = ok; }
const keepStory = (s) => { if (mode === "review" && s) storage.set("story", s); };
store.set({ mode, s: q.s, w: q.w, installed: q.installed, story, scenario: story.scenario, offline: story.offline, unlock: story.unlock });
let keptStory = story;
store.subscribe((st) => { if (st.story !== keptStory) { keptStory = st.story; keepStory(st.story); } });   // every story change, panel or test
setUnlockOutcome(story.unlock);
if (unreadable) { notice.hidden = false; notice.textContent = T.playUnreadable; }

// 3. Mock server and polling (B7). Demo scales the interval through settings; no fixed floor here.
const CASE_ID = "shell-case-1";
let server = createServer();
let poller;
const logEvent = (e) => { logLine(panelRoot, `${e.ev} ${JSON.stringify(e.data)}`); store.log(e.ev); };
// App events (hold, retry, mismatch, confirm outcomes, D-50) go to the reviewer's event log.
setEventSink((text) => { logLine(panelRoot, text); store.log(text); });
// The app clock survives reopening the app (B8, B12): a fast-forward stays applied, like real time passing on the phone.
if (mode !== "capture") {
  const kept = storage.get("clockOffset");
  if (kept) clock.fastForward(kept);
  let saved = clock.offset();
  setInterval(() => { if (clock.offset() !== saved) { saved = clock.offset(); storage.set("clockOffset", saved); } }, 250);
}
// 7f cases the doctor has left still settle when their call record arrives or the wait runs out (CW-D3, CW-D4).
setInterval(() => settleRecords(clock.now(), {
  outcome: (r, now) => recordOutcome(r.attempts[r.attempts.length - 1], r.choices, { call: { attempts: r.attempts } }, now, (k) => value(k, mode), r.submittedAt),
  onProven: (r) => event(`confirm completed: ${r.route === "cat4" ? "Cat4" : "HA skipped"} — prescription confirmed (order ${r.order}, after the doctor left)`),
  onUnproven: (r, why) => event(`call record ${why}: prescription not confirmed (mismatch, order ${r.order}) → case on hold, retry`),
}), 250);
const newPoller = () => createPoller({ server, caseId: CASE_ID, apply: logEvent });
poller = newPoller();
let pending = [];
let callCounter = 0;
function runCalls(attempts) {
  if (store.get().offline === "yes") { logLine(panelRoot, "offline — calls not sent"); return; }
  let offset = clock.now();
  attempts.forEach((choices, i) => {
    callCounter += 1;
    const events = timeline({ ...choices, callId: `call-${callCounter}` }, mode);
    const start = offset;
    pending = pending.concat(events.map((ev) => ({ due: start + ev.at, ev: ev.ev, data: ev.data })));
    offset = start + (events.length ? Math.max(...events.map((e) => e.at)) : 0) + value("attemptGap", mode);
    logLine(panelRoot, `attempt ${i + 1}: ${events.length} events scheduled`);
  });
}
function pump() {
  const now = clock.now();
  const due = pending.filter((p) => p.due <= now).sort((a, b) => a.due - b.due);
  pending = pending.filter((p) => p.due > now);
  for (const p of due) server.emit(CASE_ID, p.due, p.ev, p.data);
}
const pollOnce = () => { if (store.get().offline !== "yes") poller.tick(); };
setInterval(pump, 250);                                     // the partner's clock: events become due
setInterval(pollOnce, value("pollingInterval", mode));     // the app's clock: polling, paused offline
document.addEventListener("visibilitychange", () => { if (!document.hidden) pollOnce(); }); // re-read when the app comes back

// 4. Screens (one renderer for every route; picture layout set on every render).
// The story's start screen when no state is named: sign-in is built (step 1); the others show the shell until their step.
// The first step names its state, so later steps (OTP Change, phone Back) can find it in the history.
// Opening the app (first start, story start "sign-in", not capture) follows what this phone remembers (plan B12): a doctor with
// faster sign-in on → returning unlock; signed in without it → Home; else sign-in. Restart story always goes to the story's start.
function startState(opening) {
  const ctx = authCtx(mode);
  if (story.start === "unlock") return unlockState(ctx);
  if (story.start !== "sign-in") return null;
  // A doctor with a case open goes straight back into it (D-48, app-logic §4: reopening goes back into the case, OQ-025);
  // the session stays valid through an open case (no OTP over a live case, app-logic §3).
  if (opening && mode !== "capture" && work().openCase) return "t01-ready";
  return (opening && mode !== "capture" && onOpen(ctx)) || "sign-in_default";
}
// Story starts at Home or straight in a case (plan §4 play link): the picture moment for the story's availability answer, then live.
const HOME_START = { normal: "home_active", "near-expiry": "home_near-expiry", ending: "home_near-expiry", "ended-with-request": "home_expired-pending" };
function startParams(s, opening = false) {
  if (s) return { s };
  if (story.start === "home") return { s: HOME_START[story.availability] || "home_active" };
  if (story.start === "case") return { s: "t01-ready" };
  const id = startState(opening); return id ? { s: id, live: true } : { s };
}
// Behaviour-only step-1 states have no picture: Jump opens the screen where the behaviour shows (app-logic §2,
// feedback-state-map rows). Later steps' behaviour states keep their card until their step builds them.
const BEHAVIOUR_SCREEN = {
  "offer.shown": "offer_fingerprint",        // offered once after the first sign-in
  "offer.cancelled": "offer_fingerprint",    // prompt cancelled → back on the offer, unchanged, no message
  "offer.enabled": "home_setup-wheel",       // turned on → Home (stub until step 2)
  "offer.not-now": "home_setup-wheel",       // Not now → Home
  "offer.unsupported": "home_setup-wheel",   // no screen lock → offer skipped → Home
  "offer.unavailable": "offer_unavailable",  // D-93: phone answers unavailable at Turn on (picture in ui-screens/ since D-94 step 5)
  "signin.locked-number": "otp_locked",      // sign-in on a locked number → OTP locked
  "home.setup": "home_setup-wheel",          // step 2: set availability (wheel + presets)
  "home.add-open": "home_add-wheel",         // step 2: the Add time sheet
  "case.back-before-call": "a-leave-sheet",  // step 3: Back before a call → "Leave this case?"
  "case.closed": "t10a-confirmed",           // step 3: closed case (outcome card, Request next case · Back to Home)
  "case.closed-availability-ended": "e-availability-ended",   // step 3: closed after availability ended → Back to Home only
  "rx.load-failed": "d-rx-failed",           // step 3: Rx viewer couldn't load
  "prescribe.dose-error": "d-error-dose",    // step 4: no dose on a daily schedule
  "call.hold": "t09-patient-unavailable",    // step 5: patient side failed → the case closes as unavailable and goes on hold (CW-B2)
  "flow.HOLD": "s7f-submitted",              // step 5: an unproven confirm is not confirmed → hold and retry (CW-D3); the doctor sees 7f
};
function renderScreen(id, params = {}) {
  if (id && BEHAVIOUR_SCREEN[id]) id = BEHAVIOUR_SCREEN[id];
  document.body.classList.toggle("picture-only", !!id);
  if (!id) {
    renderShellIntro(host, mode);
    if (panelRoot) focusJourney(panelRoot, START_JOURNEY[story.start]);
    store.set({ s: null, journey: null });
    return;
  }
  const r = renderState(host, id, { mode, w: store.get().w, params });
  store.set({ s: id, journey: r.journey });
  if (panelRoot) focusJourney(panelRoot, r.journey);   // drawer follows every transition (Part A item 4)
  if (controls) controls.setCurrent(id === "placeholder" ? null : id);
}
const START_JOURNEY = { "sign-in": "signIn", unlock: "unlock", home: "home", case: "caseView" };
setRenderer((screen, params) => renderScreen(params.s ?? null, params));

// 5. Review panel and drawer (review and play only).
function restart(s) {
  story = s;
  pending = [];
  server = createServer();
  poller = newPoller();
  // The app clock (and any fast-forward) is kept: sign-in limits stored in this session sit on that time base and must keep
  // their remaining time across a story restart (step 1 recovery §1). Reset (storage clear) starts the clock again.
  store.set({ story: s, scenario: s.scenario, offline: s.offline, unlock: s.unlock });
  setUnlockOutcome(s.unlock);
  if (panelRoot) panelRoot.dispatchEvent(new CustomEvent("tm-restart"));
  logLine(panelRoot, `restart at ${s.start}`);
  start(null, startParams(null));
}
let controls = null;
if (mode === "review" || mode === "play") {
  panelRoot.hidden = false;
  controls = mountPanel(panelRoot, {
    story,
    stateIds: [...window.TM_STATE_MAP.pictures, ...window.TM_STATE_MAP.others].map((r) => ({ id: r.id, step: r.step })),   // behaviour-only states too
    handlers: {
      onChange: (s, field) => {
        story = s;
        // A Call simulator change applies to the active attempt from now on, replacing what a picture state implied (B9).
        const callEdit = field === "calls" || CALL_KEYS.includes(field);
        store.set({ story: s, scenario: s.scenario, offline: s.offline, unlock: s.unlock, ...(callEdit ? { callEdits: (store.get().callEdits || 0) + 1 } : {}) });
        setUnlockOutcome(s.unlock);
        logLine(panelRoot, callEdit ? (field === "calls" ? `call simulator: ${s.calls.length} calls` : `call simulator: ${field} changed`) : `set ${s.scenario}, offline ${s.offline}, unlock ${s.unlock}`);
      },
      onRunCalls: (s) => { story = s; runCalls(s.calls); },
      onFastForward: () => { const step = value("fastForwardStep", mode); clock.fastForward(step); logLine(panelRoot, `fast-forward ${Math.round(step / 1000)} s`); },
      onReset: () => { storage.clear(); clock.reset(); pending = []; location.reload(); },
      onRestart: (s) => restart(s),
      onJump: (id) => { push("state", { s: id }); logLine(panelRoot, `jump to ${id}`); },
      onPhone: () => {},
    },
  });
  mountDrawer({ mode, panel: panelRoot, handle: document.getElementById("drawer-handle"), backdrop: document.getElementById("drawer-backdrop") });
  // The event log is kept like the simulated server's state (review / play storage; Reset clears it): replay, then keep.
  const LOG_KEPT = 50;
  (storage.get("log") || []).forEach((t) => logLine(panelRoot, t, { replay: true }));
  setLogKeeper((t) => storage.set("log", [...(storage.get("log") || []), t].slice(-LOG_KEPT)));
}
attachPhoneBack();
start(null, startParams(q.s, true));
window.__tm = { store, get server() { return server; }, runCalls, clock, story: () => story };
