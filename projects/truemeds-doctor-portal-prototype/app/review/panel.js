// Review panel (desktop beside the frame; phone drawer). Controls for every journey (plan §4). Never a scroll container on desktop.
// Buttons use the central .tm-btn components (checklist 3.5); on a phone every control is at least 48px (RULES §9).
import { REVIEW_TEXT as T } from "./labels.js";
import { STORY_FIELDS, JOURNEYS, CALL_KEYS, MAX_CALL_ATTEMPTS, defaultAttempt } from "../data/story-schema.js";
import { CALL_CHOICES } from "../core/call-sim.js";
import { listSettings } from "../core/settings.js";
import { encodeStory } from "../core/play-link.js";
import { qrSvg } from "./qr.js";

const LABELS = {
  start: "Start point", scenario: "Scenario", offline: "Offline", signIn: "Sign-in result", otp: "OTP result", offer: "Faster sign-in offer",
  unlock: "Phone unlock", availability: "Availability", request: "Request", caseKind: "Case", prescribe: "Prescribe / confirm",
};
const CALL_LABELS = {
  connected: "Talk length (boundaries)", doctorFailure: "Doctor-side failure", patientFailure: "Patient-side failure", partner: "Partner",
  callEndedEvent: "Call-ended event (Knowlarity, open)", hangupReported: "Hang-up reported", whoEnded: "Who ended", ha: "HA (B2)",
  record: "Call record", callbackRefused: "Callback", releaseRefused: "Release",
};
const JOURNEY_TITLE = { signIn: "Sign-in", otp: "OTP", offer: "Faster sign-in", unlock: "Phone unlock", home: "Home", caseView: "Case and prescribe", prescribe: "Prescribe" };
const JOURNEY_FIELDS = {
  signIn: ["signIn"], otp: ["otp"], offer: ["offer"], unlock: ["unlock"], home: ["availability", "request"],
  caseView: ["caseKind"], prescribe: ["prescribe"],
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const sel = (id, label, options, value) => `<label>${esc(label)}<select id="rp-${id}" data-field="${id}">${options.map((o) => `<option value="${esc(o)}"${o === value ? " selected" : ""}>${esc(o)}</option>`).join("")}</select></label>`;
const btn = (id, text, cls = "") => `<button type="button" id="${id}" class="tm-btn tm-btn--sm ${cls}">${esc(text)}</button>`;

// handlers: { onChange(story), onRunCalls(story), onFastForward(), onReset(), onRestart(), onJump(id), onPhone(url) }
export function mountPanel(root, { story, handlers, stateIds }) {
  let active = 0; // index of the call attempt the call controls edit
  const jumpOptions = stateIds.map((s) => `<option value="${esc(s.id)}">${s.step} · ${esc(s.id)}</option>`).join("");
  const callSection = () => `
    <details data-journey="call" open>
      <summary>${T.call}</summary>
      <label>Attempt<select id="rp-attempt">${story.calls.map((_, i) => `<option value="${i}"${i === active ? " selected" : ""}>${i + 1}</option>`).join("")}</select></label>
      ${CALL_KEYS.map((k) => sel(k, CALL_LABELS[k], CALL_CHOICES[k], story.calls[active][k])).join("")}
      ${btn("rp-add-attempt", "Add call attempt", "tm-btn--secondary")} ${btn("rp-remove-attempt", "Remove last attempt", "tm-btn--secondary")}
      ${btn("rp-run-calls", T.runCall)}
    </details>`;
  root.innerHTML = `
    <h2>${T.title}</h2>
    <details data-journey="always" open>
      <summary>Story</summary>
      ${sel("start", T.start, STORY_FIELDS.start, story.start)}
      ${sel("scenario", T.scenario, STORY_FIELDS.scenario, story.scenario)}
      ${sel("offline", T.offline, STORY_FIELDS.offline, story.offline)}
      ${btn("rp-restart", T.restart, "tm-btn--secondary")} ${btn("rp-ff", T.fastForward, "tm-btn--secondary")} ${btn("rp-reset", T.reset, "tm-btn--secondary")}
    </details>
    <details data-journey="always" open>
      <summary>${T.jump}</summary>
      <label>State<select id="rp-jump">${jumpOptions}</select></label>
      ${btn("rp-jump-go", T.jumpGo)}
    </details>
    ${Object.entries(JOURNEY_FIELDS).map(([k, f]) => `
    <details data-journey="${k}" open>
      <summary>${esc(JOURNEY_TITLE[k])}</summary>
      ${f.map((x) => sel(x, LABELS[x], STORY_FIELDS[x], story[x])).join("")}
    </details>`).join("")}
    ${callSection()}
    <details data-journey="always" open>
      <summary>${T.phone}</summary>
      <p>${T.qrNote}</p>
      ${btn("rp-make-qr", T.makeQr)}
      <div id="rp-qr" class="qr-box" hidden></div>
      <code id="rp-link"></code>
    </details>
    <details data-journey="always">
      <summary>${T.settingsHeading}</summary>
      <ol class="log">${listSettings().map((s) => `<li>${esc(s.key)}: ${esc(JSON.stringify(s.value))} — ${esc(s.source)}</li>`).join("")}</ol>
    </details>
    <details data-journey="always" open>
      <summary>${T.log}</summary>
      <ol id="rp-log" class="log"></ol>
    </details>`;

  // Reads every story field from the controls. Call controls write the active attempt.
  const readStory = () => {
    const out = { v: 2, calls: story.calls.map((a) => ({ ...a })) };
    root.querySelectorAll("select[data-field]").forEach((el) => {
      if (CALL_KEYS.includes(el.dataset.field)) out.calls[active][el.dataset.field] = el.value;
      else out[el.dataset.field] = el.value;
    });
    story = { ...story, ...out };
    return story;
  };
  const q = (s) => root.querySelector(s);
  root.addEventListener("change", (e) => {
    if (e.target.id === "rp-attempt") { readStory(); active = Number(e.target.value); root.querySelector("details[data-journey='call']").outerHTML = callSection(); return; }
    if (e.target.matches("select[data-field]")) handlers.onChange(readStory());
  });
  // Delegated: the call section is re-rendered on attempt changes, so its buttons are replaced. Listeners live on the root.
  root.addEventListener("click", (e) => {
    const id = e.target.id;
    if (id === "rp-run-calls") handlers.onRunCalls(readStory());
    else if (id === "rp-add-attempt") addAttempt();
    else if (id === "rp-remove-attempt") removeAttempt();
    else if (id === "rp-ff") handlers.onFastForward();
    else if (id === "rp-reset") handlers.onReset();
    else if (id === "rp-restart") handlers.onRestart(readStory());
    else if (id === "rp-jump-go") handlers.onJump(q("#rp-jump").value);
    else if (id === "rp-make-qr") makeQr();
  });
  function addAttempt() {
    readStory();
    if (story.calls.length >= MAX_CALL_ATTEMPTS) return;
    story = { ...story, calls: [...story.calls, { ...story.calls[active] }] };
    active = story.calls.length - 1;
    handlers.onChange(story);
    rerenderCall();
  }
  function removeAttempt() {
    readStory();
    if (story.calls.length <= 1) return;
    story = { ...story, calls: story.calls.slice(0, -1) };
    active = Math.min(active, story.calls.length - 1);
    handlers.onChange(story);
    rerenderCall();
  }
  function rerenderCall() { root.querySelector("details[data-journey='call']").outerHTML = callSection(); }
  function makeQr() {
    const code = encodeStory(readStory());
    const url = new URL("./?play=" + code, location.href).href;
    const box = q("#rp-qr");
    box.innerHTML = qrSvg(url); box.hidden = false;
    q("#rp-link").textContent = url;
    handlers.onPhone(url);
  }
  return { readStory, setStory(s) { story = s; active = 0; rerenderCall(); } };
}

// Phone: only the sections for the screen the phone is on. Desktop: all sections. "always" sections stay.
export function focusJourney(root, journey) {
  const narrow = matchMedia("(max-width: 767px)").matches;
  root.querySelectorAll("details[data-journey]").forEach((d) => {
    const k = d.dataset.journey;
    d.hidden = narrow && !(k === "always" || k === journey || (journey === "call" && k === "caseView"));
  });
}
export function logLine(root, text) {
  const ol = root.querySelector("#rp-log");
  if (!ol) return;
  const li = document.createElement("li");
  li.textContent = text;
  ol.prepend(li);
  while (ol.children.length > 50) ol.lastElementChild.remove();
}
