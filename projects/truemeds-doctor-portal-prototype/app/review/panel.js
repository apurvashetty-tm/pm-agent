// Review panel (desktop beside the frame; phone drawer). Controls for every journey (plan §4). Never a scroll container on desktop.
// Layout (step 1 recovery, Part A item 2; concept docs/renders/2026-11-06-phone-testing-concept/desktop-review-qr.png):
// a "Review panel" card where every section is one row that shows its current choice and opens on tap — one open at a time.
// D-97: one column on the right; "Test on phone" is the first row (open first; QR always current, Part A item 3); then Story ·
// Jump to a state · Sign-in answers (with the test numbers and codes) · Home and case answers · Call simulator · Advanced
// (Timings and limits, Event log).
// Words are plain (Part A item 1): option values stay the story codes; people only see labels.js / state-names.js words.
// Buttons use the central .tm-btn components (checklist 3.5); on a phone every control is at least 48px (RULES §9).
import { REVIEW_TEXT as T, valueLabel, SETTING_NAME, settingValue, settingTag } from "./labels.js";
import { STATE_GROUPS, stateName } from "./state-names.js";
import { STORY_FIELDS, CALL_KEYS, MAX_CALL_ATTEMPTS } from "../data/story-schema.js";
import { CALL_CHOICES } from "../core/call-sim.js";
import { listSettings } from "../core/settings.js";
import { encodeShort } from "../core/play-link.js";
import { SIGN_IN_NUMBERS, OTP_CODES } from "../data/test-numbers.js";
import { phoneLink } from "./phone-link.js";
import { qrSvg } from "./qr.js";

const LABELS = {
  start: "Story starts at", scenario: "Case", offline: "Connection", signIn: "Sign-in answer", otp: "OTP answer",
  offer: "Faster sign-in offer", device: "Phone has", unlock: "Unlock answer", availability: "Availability",
  request: "Request a case", caseKind: "Case content", prescribe: "Prescribe / confirm",
};
const CALL_LABELS = {
  connected: "Patient answers · talk length", doctorFailure: "Doctor-side failure", patientFailure: "Patient-side failure", partner: "Partner",
  callEndedEvent: "Call-ended event (Knowlarity, open)", hangup: "Hang-up", whoEnded: "Who ended", ha: "Health Advisor (B2)",
  record: "Call result / record", callback: "Callback", releaseRefused: "Release", recordDelay: "Result timing", length: "Talk length (seconds)", ring: "Rings before the answer",
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
// Test numbers and codes (D-97 item 5b, app-logic §11): built from app/data/test-numbers.js, the data the mock server answers
// from, so the list can't drift. Tapping a line fills it into the running app's sign-in or OTP field.
const NUMBER_RESULT = { "not-registered": "Not registered", inactive: "Account inactive", "too-many-tries": "Too many attempts, countdown",
  "couldnt-send": "Couldn't send", "locked-number": "Number locked" };
const CODE_RESULT = { correct: "Correct, signs in", expired: "Code expired", "couldnt-verify": "Couldn't verify" };
const fillBtn = (field, v, result) => `<li><button type="button" class="rp-fill" data-fill="${field}" data-fill-value="${esc(v)}"><b>${esc(v)}</b><span>${esc(result)}</span></button></li>`;
export function testListHtml() {
  return `<ul class="rp-tests" data-for="signIn otp" aria-label="Test numbers">
      <li class="rp-tests__h">Test numbers · tap to fill · any other valid number: code sent</li>
      ${Object.entries(SIGN_IN_NUMBERS).map(([n, r]) => fillBtn("number", n, NUMBER_RESULT[r] || r)).join("")}
    </ul>
    <ul class="rp-tests" data-for="signIn otp" aria-label="Test codes">
      <li class="rp-tests__h">Test codes · tap to fill · any other code: wrong, the 5th locks</li>
      ${Object.entries(OTP_CODES).map(([c, r]) => fillBtn("code", c, CODE_RESULT[r] || r)).join("")}
    </ul>`;
}
// Fills a value the way a doctor types it: the first digit as a key (so an error state's "first key replaces" rule runs), then the rest.
const FIELD = { number: "#tm-login-mobile", code: "#c" };
export function fillField(field, v) {
  const el = document.querySelector(FIELD[field]);
  if (!el || el.readOnly || el.disabled) return false;
  el.focus();
  el.dispatchEvent(new KeyboardEvent("keydown", { key: v[0], bubbles: true, cancelable: true }));
  el.value = v;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
}
// Timings and limits (D-97 item 5c): plain name, value with its unit, Rule / Stand-in tag; the reference on hover (title) or tap.
function timingsHtml() {
  const item = (x) => { const tag = settingTag(x.source);
    const ref = (x.source === "review tool" ? "Review tool, not a product rule: " : "") + x.ref;
    return `<li><details data-setting="${esc(x.key)}" title="${esc(x.ref)}"><summary><span class="rp-timings__name">${esc(SETTING_NAME[x.key] || x.key)}</span><span class="rp-timings__val">${esc(settingValue(x))}</span><span class="rp-tag rp-tag--${tag === "Rule" ? "rule" : "stand-in"}">${tag}</span></summary><p class="rp-timings__ref">${esc(ref)}</p></details></li>`; };
  const all = listSettings();
  return `<ul class="rp-timings">${all.filter((x) => x.source !== "review tool").map(item).join("")}</ul>
    <p class="rp-timings__tool" data-setting-group="review tool"><span class="rp-tag rp-tag--stand-in">Stand-in</span> Review tool only, not product rules: ${all.filter((x) => x.source === "review tool").map((x) => `<span data-setting="${esc(x.key)}" title="${esc(x.ref)}">${esc(SETTING_NAME[x.key])} ${esc(settingValue(x))}</span>`).join(" · ")}</p>`;
}
const row = (key, title, body, open = false) => `
    <details class="rp-row" name="rp-rows" data-row="${key}"${open ? " open" : ""}>
      <summary><span class="rp-row__title">${esc(title)}</span> <span class="rp-row__value" data-value="${key}"></span><span class="tm-icon rp-row__chev" data-icon="chevron-down" aria-hidden="true"></span></summary>
      <div class="rp-row__body">${body}</div>
    </details>`;

// The story as 3–6 plain steps for the Test on phone card (Part A item 3). Entry stories show the OTP and offer answers too.
export function storySteps(s) {
  const v = (f) => valueLabel(f, s[f]);
  const steps = [];
  if (s.offline === "yes") steps.push("Phone is offline");
  if (s.start === "sign-in") {
    steps.push(`Opens at sign-in: ${v("signIn").toLowerCase()}`);
    if (["sent", "locked-number"].includes(s.signIn)) steps.push(`OTP: ${v("otp")}`);
    steps.push(s.device === "none" ? "No screen lock: offer skipped" : `Faster sign-in (${v("device").toLowerCase()}): ${v("offer").toLowerCase()}`);
  } else if (s.start === "unlock") {
    steps.push(`Opens at returning unlock (${v("device").toLowerCase()}): ${v("unlock").toLowerCase()}`);
  } else if (s.start === "home") {
    steps.push(`Home: availability ${v("availability").toLowerCase()}`, `Request a case: ${v("request").toLowerCase()}`);
  }
  steps.push(`${v("scenario")} case${s.caseKind !== "normal" ? ` · ${v("caseKind").toLowerCase()}` : ""}`);
  const last = s.calls[s.calls.length - 1];
  s.calls.forEach((a, i) => {
    const what = a.doctorFailure !== "none" ? valueLabel("doctorFailure", a.doctorFailure)
      : a.patientFailure !== "none" ? `Patient: ${valueLabel("patientFailure", a.patientFailure).toLowerCase()}`
      : a.connected === "none" ? valueLabel("connected", "none")
      : `${valueLabel("partner", a.partner)} · ${valueLabel("connected", a.connected).toLowerCase()} · ${valueLabel("whoEnded", a.whoEnded).toLowerCase()}`;
    steps.push(`${s.calls.length > 1 ? `Call ${i + 1}` : "Call"}: ${what}`);
  });
  // Happy path (D-97 item 4): a Cat4-style case (Cat4, HA skipped) whose last call passes the gate and whose record agrees ends on
  // Prescription confirmed → next case (app-logic §11 launch scenarios: Cat4 → 10a; HA skipped: Cat4-style ending).
  const cat4Style = ["cat4", "pilot_ha_skipped_customer", "pilot_ha_skipped_system"].includes(s.scenario);
  if (cat4Style && s.offline !== "yes" && s.prescribe === "saved" && last.doctorFailure === "none" && last.patientFailure === "none"
    && ["over-gate", "at-gate"].includes(last.connected) && last.record === "over-gate") steps.push("Confirm prescription → Prescription confirmed → next case");
  return steps.slice(0, 7);
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
      <div class="rp-attempt"><label data-for="call">Attempt<select id="rp-attempt">${story.calls.map((_, i) => `<option value="${i}"${i === active ? " selected" : ""}>Call ${i + 1} of ${story.calls.length}</option>`).join("")}</select></label>${btn("rp-add-attempt", "Add a call", "tm-btn--secondary")} ${btn("rp-remove-attempt", "Remove last", "tm-btn--secondary")}</div>
      <div class="rp-grid">${CALL_KEYS.filter((k) => k !== "length").map((k) => sel(k, CALL_LABELS[k], CALL_CHOICES[k], story.calls[active][k], "call")).join("")}</div>
      <div class="rp-actions">${btn("rp-run-calls", T.runCall)}</div>`;
  root.innerHTML = `
  <div class="rp-card" id="rp-review">
    <div class="rp-head"><h2>${T.title}</h2>${btn("rp-reset", T.reset, "tm-btn--tertiary")}</div>
    ${row("phone", T.phone, `
      <p class="rp-note">${T.qrNote}</p>
      <div class="rp-qr-row"><div id="rp-qr" class="qr-box"></div><ol id="rp-steps" class="rp-steps"></ol></div>
      <p id="rp-wifi" class="rp-wifi"></p>
      <code id="rp-link"></code>
      <div class="rp-actions">${btn("rp-copy", T.copy, "tm-btn--secondary")}</div>`, true)}
    ${row("story", "Story", `
      <div class="rp-grid">
        ${sel("start", LABELS.start, STORY_FIELDS.start, story.start, "always")}
        ${sel("scenario", LABELS.scenario, STORY_FIELDS.scenario, story.scenario, "always")}
        ${sel("offline", LABELS.offline, STORY_FIELDS.offline, story.offline, "always")}
      </div>`)}
    ${row("jump", T.jump, `<label data-for="always">State<select id="rp-jump">${jumpOptions}</select></label><div class="rp-actions">${btn("rp-jump-go", T.jumpGo)}</div>`)}
    ${ROWS.map((r) => row(r.key, r.title, `<div class="rp-grid">${r.fields.map(([f, j]) => sel(f, LABELS[f], STORY_FIELDS[f], story[f], j)).join("")}</div>${r.key === "entry" ? testListHtml() : ""}`)).join("")}
    <details class="rp-row" name="rp-rows" data-row="call"><summary><span class="rp-row__title">${T.call}</span> <span class="rp-row__value" data-value="call"></span><span class="tm-icon rp-row__chev" data-icon="chevron-down" aria-hidden="true"></span></summary><div class="rp-row__body" id="rp-call-body">${callBody()}</div></details>
    <p class="rp-group" data-group="advanced">${T.advanced}</p>
    ${row("settings", T.settingsHeading, timingsHtml())}
    ${row("log", T.log, `<ol id="rp-log" class="log"></ol>`)}
    <div class="rp-actions rp-bar">${sel("length", CALL_LABELS.length, CALL_CHOICES.length, story.calls[active].length || "auto", "call")}${btn("rp-restart", T.restart)} ${btn("rp-ff", T.fastForward, "tm-btn--secondary")}</div>
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
      settings: settingsSummary(),
      log: `${events} ${events === 1 ? "event" : "events"}`,
    };
    root.querySelectorAll("[data-value]").forEach((el) => { el.textContent = vals[el.dataset.value] ?? ""; });
    const link = phoneLink(encodeShort(story));
    const url = link.url;
    q("#rp-wifi").textContent = link.kind === "network" ? T.sameWifi : link.kind === "local" ? T.serveHint : "";
    q("#rp-wifi").hidden = link.kind === "site";
    if (q("#rp-link").textContent !== url) {
      q("#rp-qr").innerHTML = qrSvg(url);
      q("#rp-link").textContent = url;
      q("#rp-steps").innerHTML = storySteps(story).map((s) => `<li>${esc(s)}</li>`).join("");
      if (handlers.onPhone) handlers.onPhone(url);
    }
  }
  root.addEventListener("change", (e) => {
    if (e.target.id === "rp-attempt") { readStory(); active = Number(e.target.value); rerenderCall(); refresh(); return; }
    if (e.target.matches("select[data-field]")) { handlers.onChange(readStory(), e.target.dataset.field); refresh(); }
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
    const fill = e.target.closest("button[data-fill]");
    if (fill) {
      const ok = fillField(fill.dataset.fill, fill.dataset.fillValue);
      logLine(root, ok ? `filled ${fill.dataset.fillValue}` : `open the ${fill.dataset.fill === "number" ? "sign-in" : "OTP"} screen to fill ${fill.dataset.fillValue}`);
    }
  });
  function addAttempt() {
    readStory();
    if (story.calls.length >= MAX_CALL_ATTEMPTS) return;
    story = { ...story, calls: [...story.calls, { ...story.calls[active] }] };
    active = story.calls.length - 1;
    handlers.onChange(story, "calls");
    rerenderCall(); refresh();
  }
  function removeAttempt() {
    readStory();
    if (story.calls.length <= 1) return;
    story = { ...story, calls: story.calls.slice(0, -1) };
    active = Math.min(active, story.calls.length - 1);
    handlers.onChange(story, "calls");
    rerenderCall(); refresh();
  }
  // The talk length sits in the panel's bottom bar (always in reach, next to Fast-forward, B9) and follows the active attempt.
  function rerenderCall() { q("#rp-call-body").innerHTML = callBody(); q("#rp-length").value = story.calls[active].length || "auto"; }
  function copyLink() {
    const text = q("#rp-link").textContent;
    const done = () => logLine(root, "link copied");
    try { navigator.clipboard.writeText(text).then(done, () => logLine(root, "copy blocked — select the link")); } catch (e) { logLine(root, "copy blocked — select the link"); }
  }
  root.addEventListener("tm-log", () => { events += 1; refresh(); });
  // Desktop to phone width (or back) while open: re-apply the drawer filtering for the screen on show (checklist 2.4, 5.11).
  matchMedia("(max-width: 767px)").addEventListener("change", () => focusJourney(root, root.dataset.journey || null));
  function settingsSummary() {
    const all = listSettings(); const rules = all.filter((x) => settingTag(x.source) === "Rule").length;
    return `${SETTING_NAME.gate} ${settingValue(all.find((x) => x.key === "gate"))} · ${rules} rules, ${all.length - rules} stand-ins`;
  }
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
  root.querySelectorAll("label[data-for], .rp-tests[data-for]").forEach((l) => { l.hidden = narrow && !forJourney(l); });
  const card = root.querySelector("#rp-review");
  const rows = [...root.querySelectorAll("details.rp-row")];
  rows.forEach((d) => {
    const hasControls = [...d.querySelectorAll("label[data-for], .rp-tests[data-for]")].some((l) => !l.hidden);
    const always = d.dataset.row === "story" || d.dataset.row === "jump";
    d.hidden = narrow && !(always || (hasControls && !["settings", "log", "phone"].includes(d.dataset.row)));
  });
  if (!card) return;
  const group = card.querySelector("[data-group=advanced]");
  if (group) group.hidden = narrow;
  if (narrow) {
    const mine = rows.filter((d) => !d.hidden && d.dataset.row !== "story" && d.dataset.row !== "jump");
    const order = [...mine, rows.find((d) => d.dataset.row === "jump"), rows.find((d) => d.dataset.row === "story"), card.querySelector(".rp-bar")];
    order.forEach((d) => d && card.append(d));
    if (mine[0]) mine[0].open = true; else rows.find((d) => d.dataset.row === "story").open = true;
  } else {
    const order = ["phone", "story", "jump", "entry", "work", "call", "advanced", "settings", "log"];
    order.forEach((k) => { const d = k === "advanced" ? group : rows.find((r) => r.dataset.row === k); if (d) card.append(d); });
    card.append(card.querySelector(".rp-bar"));
  }
}
const LOG_SHOWN = 10;   // newest events only; the count in the row keeps the total
// The event log survives reopening the app like the simulated server does (review / play keep it in the mode's storage, set by
// boot), so a completed confirm is seen exactly once after a reload (D-50 events once per completed confirm).
let keeper = null;
export function setLogKeeper(fn) { keeper = fn; }
export function logLine(root, text, { replay = false } = {}) {
  const ol = root && root.querySelector("#rp-log");
  if (!ol) return;
  const li = document.createElement("li");
  li.textContent = text;
  ol.prepend(li);
  while (ol.children.length > LOG_SHOWN) ol.lastElementChild.remove();   // bounded: the desktop panel never scrolls (RULES §7)
  if (keeper && !replay) keeper(text);
  root.dispatchEvent(new CustomEvent("tm-log"));
}
