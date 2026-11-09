// Review panel (desktop beside the frame; phone drawer). Controls for every journey (plan §4). Never a scroll container on desktop.
// Layout (step 1 recovery, Part A item 2; concept docs/renders/2026-11-06-phone-testing-concept/desktop-review-qr.png):
// a "Review panel" card where every section is one row that shows its current choice and opens on tap — one open at a time
// (Story open first) — and a separate "Test on phone" card with a QR that is always current (Part A item 3).
// Words are plain (Part A item 1): option values stay the story codes; people only see labels.js / state-names.js words.
// Buttons use the central .tm-btn components (checklist 3.5); on a phone every control is at least 48px (RULES §9).
import { REVIEW_TEXT as T, valueLabel } from "./labels.js";
import { STATE_GROUPS, stateName } from "./state-names.js";
import { STORY_FIELDS, CALL_KEYS, MAX_CALL_ATTEMPTS } from "../data/story-schema.js";
import { CALL_CHOICES } from "../core/call-sim.js";
import { listSettings } from "../core/settings.js";
import { encodeShort } from "../core/play-link.js";
import { qrSvg } from "./qr.js";

const LABELS = {
  start: "Story starts at", scenario: "Case", offline: "Connection", signIn: "Sign-in answer", otp: "OTP answer",
  offer: "Faster sign-in offer", device: "Phone has", unlock: "Unlock answer", availability: "Availability",
  request: "Request a case", caseKind: "Case content", prescribe: "Prescribe / confirm",
};
const CALL_LABELS = {
  connected: "Patient answers · talk length", doctorFailure: "Doctor-side failure", patientFailure: "Patient-side failure", partner: "Partner",
  callEndedEvent: "Call-ended event (Knowlarity, open)", hangupReported: "Hang-up", whoEnded: "Who ended", ha: "Health Advisor (B2)",
  record: "Call record", callbackRefused: "Callback", releaseRefused: "Release",
};
// Rows of the Review panel card. `fields` carry data-journey so the phone drawer shows only the current screen's controls.
const ROWS = [
  { key: "entry", title: "Sign-in answers", fields: [["signIn", "signIn"], ["otp", "otp"], ["offer", "offer"], ["device", "offer unlock"], ["unlock", "unlock"]] },
  { key: "work", title: "Home and case answers", fields: [["availability", "home"], ["request", "home"], ["caseKind", "caseView call"], ["prescribe", "prescribe caseView call"]] },
];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const opts = (field, options, value) => options.map((o) => `<option value="${esc(o)}"${String(o) === String(value) ? " selected" : ""}>${esc(valueLabel(field, o))}</option>`).join("");
const sel = (id, label, options, value, journeys = "") =>
  `<label data-for="${esc(journeys)}">${esc(label)}<select id="rp-${id}" data-field="${id}">${opts(id, options, value)}</select></label>`;
const btn = (id, text, cls = "tm-btn--primary") => `<button type="button" id="${id}" class="tm-btn tm-btn--xs ${cls}">${esc(text)}</button>`;
const row = (key, title, body, open = false) => `
    <details class="rp-row" name="rp-rows" data-row="${key}"${open ? " open" : ""}>
      <summary><span class="rp-row__title">${esc(title)}</span><span class="rp-row__value" data-value="${key}"></span><span class="tm-icon rp-row__chev" data-icon="chevron-down" aria-hidden="true"></span></summary>
      <div class="rp-row__body">${body}</div>
    </details>`;

// The story as 3–6 plain steps for the Test on phone card (Part A item 3). Entry stories show the OTP and offer answers too.
export function storySteps(s) {
  const v = (f) => valueLabel(f, s[f]);
  const steps = [];
  if (s.offline === "yes") steps.push("Phone is offline");
  if (s.start === "sign-in") {
    steps.push(`Sign-in: ${v("signIn")}`);
    if (["sent", "locked-number"].includes(s.signIn)) steps.push(`OTP: ${v("otp")}`);
    steps.push(s.device === "none" ? "No screen lock: offer skipped" : `Faster sign-in (${v("device").toLowerCase()}): ${v("offer").toLowerCase()}`);
  } else if (s.start === "unlock") {
    steps.push(`Returning unlock (${v("device").toLowerCase()}): ${v("unlock").toLowerCase()}`);
  } else if (s.start === "home") {
    steps.push(`Home: availability ${v("availability").toLowerCase()}`, `Request a case: ${v("request").toLowerCase()}`);
  }
  steps.push(`${v("scenario")} case${s.caseKind !== "normal" ? ` · ${v("caseKind").toLowerCase()}` : ""}`);
  s.calls.forEach((a, i) => {
    const what = a.doctorFailure !== "none" ? valueLabel("doctorFailure", a.doctorFailure)
      : a.patientFailure !== "none" ? `Patient: ${valueLabel("patientFailure", a.patientFailure).toLowerCase()}`
      : a.connected === "none" ? valueLabel("connected", "none")
      : `${valueLabel("partner", a.partner)} · ${valueLabel("connected", a.connected).toLowerCase()} · ${valueLabel("whoEnded", a.whoEnded).toLowerCase()}`;
    steps.push(`${s.calls.length > 1 ? `Call ${i + 1}` : "Call"}: ${what}`);
  });
  if (s.start === "sign-in" || s.start === "unlock") steps.splice(0, 0, s.start === "sign-in" ? "Opens at sign-in" : "Opens at returning unlock");
  return steps.slice(0, 6);
}

// handlers: { onChange(story), onRunCalls(story), onFastForward(), onReset(), onRestart(), onJump(id), onPhone(url) }
export function mountPanel(root, { story, handlers, stateIds }) {
  let active = 0; // index of the call attempt the call controls edit
  let current = null; // state on screen (Jump row value)
  let events = 0;
  const known = new Set(stateIds.map((s) => s.id));
  const jumpOptions = STATE_GROUPS.map((g) => {
    const ids = Object.keys(g.ids).filter((id) => known.has(id));
    return ids.length ? `<optgroup label="${esc(g.title)}">${ids.map((id) => `<option value="${esc(id)}">${esc(g.ids[id])}</option>`).join("")}</optgroup>` : "";
  }).join("");
  const callBody = () => `
      <label data-for="call">Attempt<select id="rp-attempt">${story.calls.map((_, i) => `<option value="${i}"${i === active ? " selected" : ""}>Call ${i + 1} of ${story.calls.length}</option>`).join("")}</select></label>
      <div class="rp-grid">${CALL_KEYS.map((k) => sel(k, CALL_LABELS[k], CALL_CHOICES[k], story.calls[active][k], "call")).join("")}</div>
      <div class="rp-actions">${btn("rp-run-calls", T.runCall)} ${btn("rp-add-attempt", "Add a call", "tm-btn--secondary")} ${btn("rp-remove-attempt", "Remove last call", "tm-btn--secondary")}</div>`;
  root.innerHTML = `
  <div class="rp-card" id="rp-review">
    <div class="rp-head"><h2>${T.title}</h2>${btn("rp-reset", T.reset, "tm-btn--tertiary")}</div>
    ${row("story", "Story", `
      <div class="rp-grid">
        ${sel("start", LABELS.start, STORY_FIELDS.start, story.start, "always")}
        ${sel("scenario", LABELS.scenario, STORY_FIELDS.scenario, story.scenario, "always")}
        ${sel("offline", LABELS.offline, STORY_FIELDS.offline, story.offline, "always")}
      </div>`, true)}
    ${row("jump", T.jump, `<label data-for="always">State<select id="rp-jump">${jumpOptions}</select></label><div class="rp-actions">${btn("rp-jump-go", T.jumpGo)}</div>`)}
    ${ROWS.map((r) => row(r.key, r.title, `<div class="rp-grid">${r.fields.map(([f, j]) => sel(f, LABELS[f], STORY_FIELDS[f], story[f], j)).join("")}</div>`)).join("")}
    <details class="rp-row" name="rp-rows" data-row="call"><summary><span class="rp-row__title">${T.call}</span><span class="rp-row__value" data-value="call"></span><span class="tm-icon rp-row__chev" data-icon="chevron-down" aria-hidden="true"></span></summary><div class="rp-row__body" id="rp-call-body">${callBody()}</div></details>
    ${row("settings", T.settingsHeading, `<ol class="log">${listSettings().map((s) => `<li>${esc(s.key)}: ${esc(JSON.stringify(s.value))} — ${esc(s.source)}</li>`).join("")}</ol>`)}
    ${row("log", T.log, `<ol id="rp-log" class="log"></ol>`)}
    <div class="rp-actions rp-bar">${btn("rp-restart", T.restart)} ${btn("rp-ff", T.fastForward, "tm-btn--secondary")}</div>
  </div>
  <div class="rp-card rp-phone" id="rp-phone">
    <div class="rp-head"><h2>${T.phone}</h2></div>
    <p class="rp-note">${T.qrNote}</p>
    <div class="rp-qr-row"><div id="rp-qr" class="qr-box"></div><ol id="rp-steps" class="rp-steps"></ol></div>
    <code id="rp-link"></code>
    <div class="rp-actions">${btn("rp-copy", T.copy, "tm-btn--secondary")}</div>
  </div>`;

  if (window.TMIcons) window.TMIcons.render(root);
  const q = (s) => root.querySelector(s);
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
  // Every row shows its current choice in words; the QR, link and steps follow every change (no "Make QR" button).
  const v = (f) => valueLabel(f, story[f]);
  function refresh() {
    const a = story.calls[active];
    const vals = {
      story: `${v("start")} · ${v("scenario")}${story.offline === "yes" ? " · offline" : ""}`,
      jump: current ? stateName(current) : "",
      entry: `${v("signIn")} · ${v("otp")} · ${v("offer")} · ${v("unlock")}`,
      work: `${v("request")} · ${v("caseKind")} · ${v("prescribe")}`,
      call: `${a.connected === "none" ? "Not answered" : valueLabel("connected", a.connected)} · ${valueLabel("partner", a.partner)}${story.calls.length > 1 ? ` · ${story.calls.length} calls` : ""}`,
      settings: `${listSettings().length} values`,
      log: `${events} ${events === 1 ? "event" : "events"}`,
    };
    root.querySelectorAll("[data-value]").forEach((el) => { el.textContent = vals[el.dataset.value] ?? ""; });
    const url = new URL("./?play=" + encodeShort(story), location.href).href;
    if (q("#rp-link").textContent !== url) {
      q("#rp-qr").innerHTML = qrSvg(url);
      q("#rp-link").textContent = url;
      q("#rp-steps").innerHTML = storySteps(story).map((s) => `<li>${esc(s)}</li>`).join("");
      if (handlers.onPhone) handlers.onPhone(url);
    }
  }
  root.addEventListener("change", (e) => {
    if (e.target.id === "rp-attempt") { readStory(); active = Number(e.target.value); rerenderCall(); refresh(); return; }
    if (e.target.matches("select[data-field]")) { handlers.onChange(readStory()); refresh(); }
  });
  // Delegated: the call section is re-rendered on attempt changes, so its buttons are replaced. Listeners live on the root.
  root.addEventListener("click", (e) => {
    const id = e.target.closest("button")?.id;
    if (id === "rp-run-calls") handlers.onRunCalls(readStory());
    else if (id === "rp-add-attempt") addAttempt();
    else if (id === "rp-remove-attempt") removeAttempt();
    else if (id === "rp-ff") handlers.onFastForward();
    else if (id === "rp-reset") handlers.onReset();
    else if (id === "rp-restart") handlers.onRestart(readStory());
    else if (id === "rp-jump-go") handlers.onJump(q("#rp-jump").value);
    else if (id === "rp-copy") copyLink();
  });
  function addAttempt() {
    readStory();
    if (story.calls.length >= MAX_CALL_ATTEMPTS) return;
    story = { ...story, calls: [...story.calls, { ...story.calls[active] }] };
    active = story.calls.length - 1;
    handlers.onChange(story);
    rerenderCall(); refresh();
  }
  function removeAttempt() {
    readStory();
    if (story.calls.length <= 1) return;
    story = { ...story, calls: story.calls.slice(0, -1) };
    active = Math.min(active, story.calls.length - 1);
    handlers.onChange(story);
    rerenderCall(); refresh();
  }
  function rerenderCall() { q("#rp-call-body").innerHTML = callBody(); }
  function copyLink() {
    const text = q("#rp-link").textContent;
    const done = () => logLine(root, "link copied");
    try { navigator.clipboard.writeText(text).then(done, () => logLine(root, "copy blocked — select the link")); } catch (e) { logLine(root, "copy blocked — select the link"); }
  }
  root.addEventListener("tm-log", () => { events += 1; refresh(); });
  // Desktop to phone width (or back) while open: re-apply the drawer filtering for the screen on show (checklist 2.4, 5.11).
  matchMedia("(max-width: 767px)").addEventListener("change", () => focusJourney(root, root.dataset.journey || null));
  refresh();
  return {
    readStory,
    setStory(s) { story = s; active = 0; rerenderCall(); root.querySelectorAll("select[data-field]").forEach((el) => { if (!CALL_KEYS.includes(el.dataset.field) && s[el.dataset.field] !== undefined) el.value = s[el.dataset.field]; }); refresh(); },
    setCurrent(id) { current = id; if (id && q(`#rp-jump option[value="${CSS.escape(id)}"]`)) q("#rp-jump").value = id; refresh(); },
  };
}

// Phone drawer (Part A item 4): the controls for the screen the phone is on come first, then Jump to a state and the Story row
// (Restart story). Other rows are hidden on a phone. Desktop shows every row. Called on every screen change.
export function focusJourney(root, journey) {
  root.dataset.journey = journey || "";
  const narrow = matchMedia("(max-width: 767px)").matches;
  const forJourney = (el) => (el.dataset.for || "").split(" ").some((j) => j === "always" || j === journey);
  root.querySelectorAll("label[data-for]").forEach((l) => { l.hidden = narrow && !forJourney(l); });
  const card = root.querySelector("#rp-review");
  const rows = [...root.querySelectorAll("details.rp-row")];
  rows.forEach((d) => {
    const hasControls = [...d.querySelectorAll("label[data-for]")].some((l) => !l.hidden);
    const always = d.dataset.row === "story" || d.dataset.row === "jump";
    d.hidden = narrow && !(always || (hasControls && d.dataset.row !== "settings" && d.dataset.row !== "log"));
  });
  if (!card) return;
  if (narrow) {
    const mine = rows.filter((d) => !d.hidden && d.dataset.row !== "story" && d.dataset.row !== "jump");
    const order = [...mine, rows.find((d) => d.dataset.row === "jump"), rows.find((d) => d.dataset.row === "story"), card.querySelector(".rp-bar")];
    order.forEach((d) => d && card.append(d));
    if (mine[0]) mine[0].open = true; else rows.find((d) => d.dataset.row === "story").open = true;
  } else {
    const order = ["story", "jump", "entry", "work", "call", "settings", "log"];
    order.forEach((k) => { const d = rows.find((r) => r.dataset.row === k); if (d) card.append(d); });
    card.append(card.querySelector(".rp-bar"));
  }
}
const LOG_SHOWN = 10;   // newest events only; the count in the row keeps the total
export function logLine(root, text) {
  const ol = root && root.querySelector("#rp-log");
  if (!ol) return;
  const li = document.createElement("li");
  li.textContent = text;
  ol.prepend(li);
  while (ol.children.length > LOG_SHOWN) ol.lastElementChild.remove();   // bounded: the desktop panel never scrolls (RULES §7)
  root.dispatchEvent(new CustomEvent("tm-log"));
}
