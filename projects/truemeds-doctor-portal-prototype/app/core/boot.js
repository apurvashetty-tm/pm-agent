// Entry point (plan v3 §5 step 0). Order matters: resolve the effective mode first, then storage, then the story, then the consumers.
import { resolveMode } from "./modes.js";
import { clock } from "./clock.js";
import { store } from "./store.js";
import { storageFor } from "./storage.js";
import { setRenderer, attachPhoneBack, push } from "./nav.js";
import { decodeStory, defaultStory } from "./play-link.js";
import { timeline } from "./call-sim.js";
import { createServer, createPoller } from "./mock-server.js";
import { setUnlockOutcome } from "./unlock.js";
import { value } from "./settings.js";
import { renderState, renderShellIntro } from "../shell/screen-host.js";
import { mountPanel, focusJourney, logLine } from "../review/panel.js";
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
store.set({ mode, s: q.s, w: q.w, installed: q.installed, story, scenario: story.scenario, offline: story.offline, unlock: story.unlock });
setUnlockOutcome(story.unlock);
if (unreadable) { notice.hidden = false; notice.textContent = T.playUnreadable; }

// 3. Mock server and polling (B7). Demo scales the interval through settings; no fixed floor here.
const CASE_ID = "shell-case-1";
let server = createServer();
let poller;
const logEvent = (e) => { logLine(panelRoot, `${e.ev} ${JSON.stringify(e.data)}`); store.log(e.ev); };
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
function renderScreen(id) {
  document.body.classList.toggle("picture-only", !!id);
  if (!id) {
    renderShellIntro(host, mode);
    if (panelRoot) focusJourney(panelRoot, START_JOURNEY[story.start]);
    store.set({ s: null, journey: null });
    return;
  }
  const r = renderState(host, id, { mode, w: store.get().w });
  store.set({ s: id, journey: r.journey });
  if (panelRoot && r.journey) focusJourney(panelRoot, r.journey);
}
const START_JOURNEY = { "sign-in": "signIn", unlock: "unlock", home: "home", case: "caseView" };
setRenderer((screen, params) => renderScreen(params.s ?? null));

// 5. Review panel and drawer (review and play only).
function restart(s) {
  story = s;
  pending = [];
  server = createServer();
  poller = newPoller();
  clock.reset();
  store.set({ story: s, scenario: s.scenario, offline: s.offline, unlock: s.unlock });
  setUnlockOutcome(s.unlock);
  if (panelRoot) panelRoot.dispatchEvent(new CustomEvent("tm-restart"));
  logLine(panelRoot, `restart at ${s.start}`);
  renderScreen(null);
}
if (mode === "review" || mode === "play") {
  panelRoot.hidden = false;
  const controls = mountPanel(panelRoot, {
    story,
    stateIds: window.TM_STATE_MAP.pictures.map((r) => ({ id: r.id, step: r.step })),
    handlers: {
      onChange: (s) => {
        story = s;
        store.set({ story: s, scenario: s.scenario, offline: s.offline, unlock: s.unlock });
        setUnlockOutcome(s.unlock);
        logLine(panelRoot, `set ${s.scenario}, offline ${s.offline}, unlock ${s.unlock}`);
      },
      onRunCalls: (s) => { story = s; runCalls(s.calls); },
      onFastForward: () => { const step = value("fastForwardStep", mode); clock.fastForward(step); logLine(panelRoot, `fast-forward ${Math.round(step / 1000)} s`); },
      onReset: () => { storage.clear(); clock.reset(); pending = []; location.reload(); },
      onRestart: (s) => restart(s),
      onJump: (id) => { push("state", { s: id }); logLine(panelRoot, `jump to ${id}`); },
      onPhone: (url) => logLine(panelRoot, `play link made (${url.length} chars)`),
    },
  });
  mountDrawer({ mode, panel: panelRoot, handle: document.getElementById("drawer-handle"), backdrop: document.getElementById("drawer-backdrop") });
}
attachPhoneBack();
renderScreen(q.s);
window.__tm = { store, get server() { return server; }, runCalls, clock, story: () => story };
