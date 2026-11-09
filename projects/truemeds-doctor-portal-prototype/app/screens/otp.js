// OTP screen (entry journey, step 1). States: default, empty-tap, too-short, verifying, wrong-code, two-tries-left,
// resend-available, new-code-sent, code-expired, couldnt-verify, too-many-resends, locked, resending, resend-failed,
// offline, cooldown-reconciling, expired-and-resend-limited. Number always "+91 98765 43210" with semibold digits.
import { MSG } from "../core/msg.js";
import { push } from "../core/nav.js";

const STATES = {
  "otp_default": "default",
  "otp_empty-tap": "empty-tap",
  "otp_too-short": "too-short",
  "otp_verifying": "verifying",
  "otp_wrong-code": "wrong-code",
  "otp_two-tries-left": "two-tries-left",
  "otp_resend-available": "resend-available",
  "otp_new-code-sent": "new-code-sent",
  "otp_code-expired": "code-expired",
  "otp_couldnt-verify": "couldnt-verify",
  "otp_too-many-resends": "too-many-resends",
  "otp_locked": "locked",
  "otp_resending": "resending",
  "otp_resend-failed": "resend-failed",
  "otp_offline": "offline",
  "otp_cooldown-reconciling": "cooldown-reconciling",
  "otp_expired-and-resend-limited": "expired-and-resend-limited",
};

const STATE_DEFS = {
  "default": { code: "", kb: true, rs: "wait", consent: true },
  "empty-tap": { code: "", kb: true, err: "otp.empty", rs: "wait", consent: true },
  "too-short": { code: "48", kb: true, err: "otp.short", rs: "wait", consent: true },
  "verifying": { code: "4827", kb: true, busy: true, rs: "wait", consent: true },
  "wrong-code": { code: "4827", kb: true, err: "otp.wrong", replace: true, rs: "wait", consent: true },
  "two-tries-left": { code: "4827", kb: true, err: "otp.triesLeft", replace: true, rs: "wait", consent: true },
  "resend-available": { code: "", kb: true, rs: "available", consent: true },
  "new-code-sent": { code: "", kb: true, s1: "otp.newSent", rs: "wait", consent: true, time: "1:00" },
  "code-expired": { code: "4827", kb: true, err: "otp.expired", replace: true, rs: "available", expired: true },
  "couldnt-verify": { code: "4827", kb: true, note: { k: "error", i: "alert-circle", t: "otp.couldntVerify" }, rs: "wait", consent: true },
  "too-many-resends": { code: "", kb: true, note: { k: "warning", i: "clock", ops: true, t: "otp.tooManyResends" }, rs: "hidden", consent: true },
  "locked": { code: "", locked: true, note: { k: "warning", i: "clock", ops: true, t: "otp.locked" }, rs: "hidden" },
  "resending": { code: "4827", kb: true, rs: "sending", consent: true },
  "resend-failed": { code: "4827", kb: true, note: { k: "error", i: "alert-circle", t: "otp.resendFailed" }, rs: "available", consent: true },
  "offline": { code: "4827", kb: true, note: { k: "warning", i: "alert-triangle", t: "signin.offline" }, rs: "available", consent: true },
  "cooldown-reconciling": { code: "", kb: true, rs: "checking", hold: true, consent: true },
  "expired-and-resend-limited": { code: "", locked: true, note: { k: "warning", i: "clock", ops: true, t: "otp.expiredAndLimited" }, rs: "hidden" },
};

export function render(host, id, { mode, w }) {
  const stateKey = STATES[id];
  if (!stateKey) return null;

  const state = STATE_DEFS[stateKey];
  if (!state) return null;

  host.innerHTML = "";
  const section = document.createElement("section");
  section.className = "tm shell-screen";
  section.style.display = "flex";
  section.style.flexDirection = "column";
  section.style.height = "100%";
  section.setAttribute("aria-label", "Verify your number");

  // Top section: logo, title, subtitle
  const top = document.createElement("div");
  top.style.padding = "var(--tm-space-lg) var(--tm-space-page) var(--tm-space-2xl)";
  top.style.background = "var(--tm-surface-brand-subtle)";
  top.style.flexShrink = 0;

  const logo = document.createElement("img");
  logo.src = "brand/truemeds-for-doctors.svg";
  logo.alt = "truemeds for doctors";
  logo.style.width = "166px";
  logo.style.height = "auto";
  logo.style.display = "block";
  logo.style.marginBottom = "var(--tm-space-lg)";
  top.appendChild(logo);

  const head = document.createElement("div");
  head.style.marginTop = "var(--tm-space-sm)";
  head.style.display = "flex";
  head.style.flexDirection = "column";
  head.style.gap = "var(--tm-space-sm)";

  const h1 = document.createElement("h1");
  h1.className = "tm-font-title-lg";
  h1.style.margin = "0";
  h1.textContent = "Verify your number";
  head.appendChild(h1);

  const subtitle = document.createElement("p");
  subtitle.className = "tm-font-body-md";
  subtitle.style.margin = "0";
  subtitle.style.color = "var(--tm-content-secondary)";
  subtitle.innerHTML = "Sent to <b style=\"color:var(--tm-content-primary);font-weight:600\">+91 90000 00001</b> · ";
  const changeLink = document.createElement("a");
  changeLink.href = "#";
  changeLink.style.color = "var(--tm-content-brand)";
  changeLink.style.fontWeight = "600";
  changeLink.style.textDecoration = "none";
  changeLink.textContent = "Change";
  changeLink.addEventListener("click", (e) => {
    e.preventDefault();
    push(null, { s: "sign-in_default" });
  });
  subtitle.appendChild(changeLink);
  head.appendChild(subtitle);

  top.appendChild(head);
  section.appendChild(top);

  // Panel: scrollable content
  const panel = document.createElement("div");
  panel.style.flex = "1";
  panel.style.minHeight = "0";
  panel.style.overflowY = "auto";
  panel.style.background = "var(--tm-surface-primary)";
  panel.style.borderRadius = "var(--tm-radius-2xl) var(--tm-radius-2xl) 0 0";
  panel.style.padding = "var(--tm-space-2xl) var(--tm-space-page) var(--tm-space-xl)";
  panel.style.display = "flex";
  panel.style.flexDirection = "column";

  // Group 1: Code input + messages
  const grp1 = document.createElement("div");
  grp1.style.display = "flex";
  grp1.style.flexDirection = "column";
  grp1.style.gap = "var(--tm-space-lg)";

  const field = document.createElement("div");
  field.className = "tm-field";
  field.style.display = "flex";
  field.style.flexDirection = "column";
  field.style.gap = "var(--tm-space-sm)";

  // OTP slots
  const slotsDiv = document.createElement("div");
  slotsDiv.className = "tm-otp-slots";
  slotsDiv.style.display = "flex";
  slotsDiv.style.gap = "var(--tm-space-md)";
  slotsDiv.style.justifyContent = "center";

  const codeInput = document.createElement("input");
  codeInput.id = "otp-input";
  codeInput.type = "text";
  codeInput.inputMode = "numeric";
  codeInput.pattern = "[0-9]*";
  codeInput.maxLength = "4";
  codeInput.autoComplete = "one-time-code";
  codeInput.setAttribute("aria-label", "4-digit verification code");
  codeInput.style.width = "0";
  codeInput.style.height = "0";
  codeInput.style.opacity = "0";
  codeInput.style.position = "absolute";
  codeInput.style.pointerEvents = "none";
  codeInput.value = state.code || "";
  if (state.locked) codeInput.disabled = true;
  if (state.busy) codeInput.readOnly = true;
  slotsDiv.appendChild(codeInput);

  const slots = [];
  for (let i = 0; i < 4; i++) {
    const slot = document.createElement("span");
    slot.className = "tm-otp-slots__slot";
    slot.style.width = "56px";
    slot.style.height = "56px";
    slot.style.display = "flex";
    slot.style.alignItems = "center";
    slot.style.justifyContent = "center";
    slot.style.fontSize = "28px";
    slot.style.fontWeight = "600";
    slot.style.border = "2px solid var(--tm-border-default)";
    slot.style.borderRadius = "var(--tm-radius-md)";
    slot.style.color = "var(--tm-content-primary)";
    slot.style.backgroundColor = "var(--tm-surface-secondary)";
    slot.setAttribute("aria-hidden", "true");
    slots.push(slot);
    slotsDiv.appendChild(slot);
  }

  field.appendChild(slotsDiv);

  // Helper / error / success message
  const codeSlot = document.createElement("div");
  codeSlot.style.minHeight = "20px";
  const helper = document.createElement("div");
  helper.className = "tm-field__helper";
  helper.id = "otp-helper";
  helper.style.margin = "0";
  helper.hidden = true;
  codeSlot.appendChild(helper);

  const s1 = document.createElement("p");
  s1.style.margin = "0";
  s1.style.display = "none";
  s1.style.alignItems = "center";
  s1.style.justifyContent = "center";
  s1.style.gap = "var(--tm-space-xs)";
  s1.style.fontSize = "var(--tm-font-size-body-md)";
  s1.style.color = "var(--tm-content-success)";
  s1.setAttribute("role", "status");
  const s1Icon = document.createElement("span");
  s1Icon.className = "tm-icon";
  s1Icon.setAttribute("data-icon", "check-circle");
  s1Icon.setAttribute("aria-hidden", "true");
  s1Icon.style.width = "16px";
  s1Icon.style.height = "16px";
  s1.appendChild(s1Icon);
  const s1Text = document.createElement("span");
  s1.appendChild(s1Text);
  codeSlot.appendChild(s1);

  field.appendChild(codeSlot);

  // Notice box
  const notice = document.createElement("div");
  notice.className = "tm-notice";
  notice.style.marginTop = "var(--tm-space-sm)";
  notice.style.display = "none";
  notice.setAttribute("role", "status");
  const noticeIcon = document.createElement("span");
  noticeIcon.className = "tm-icon";
  noticeIcon.setAttribute("aria-hidden", "true");
  notice.appendChild(noticeIcon);
  const noticeText = document.createElement("div");
  notice.appendChild(noticeText);
  field.appendChild(notice);

  grp1.appendChild(field);

  // Resend line
  const rs = document.createElement("p");
  rs.style.margin = "0";
  rs.style.textAlign = "center";
  rs.style.fontSize = "var(--tm-font-size-body-md)";
  rs.style.lineHeight = "48px";
  rs.style.minHeight = "48px";
  rs.style.color = "var(--tm-content-secondary)";
  rs.id = "resend-line";

  const rp = document.createElement("span");
  rp.textContent = "Didn't receive it? ";
  rs.appendChild(rp);

  const rr = document.createElement("span");
  rs.appendChild(rr);

  grp1.appendChild(rs);
  panel.appendChild(grp1);

  // Group 2: Consent + Button
  const grp2 = document.createElement("div");
  grp2.style.display = "flex";
  grp2.style.flexDirection = "column";
  grp2.style.gap = "var(--tm-space-lg)";
  grp2.style.marginTop = "var(--tm-space-2xl)";

  const consent = document.createElement("p");
  consent.className = "tm-text-body-sm";
  consent.style.margin = "0";
  consent.style.color = "var(--tm-content-secondary)";
  consent.style.textAlign = "center";
  consent.style.textWrap = "balance";
  consent.innerHTML = "By selecting Verify &amp; sign in, you agree to the <a href=\"#\" style=\"color:var(--tm-content-brand);font-weight:600;text-decoration:none;white-space:nowrap\">Terms &amp; Conditions</a> and acknowledge the <a href=\"#\" style=\"color:var(--tm-content-brand);font-weight:600;text-decoration:none;white-space:nowrap\">Privacy Policy</a>.";
  consent.style.display = state.consent && !state.locked && !state.expired ? "block" : "none";
  if (state.expired) {
    consent.style.visibility = "hidden";
    consent.style.height = "20px";
  }
  grp2.appendChild(consent);

  const button = document.createElement("button");
  button.className = "tm-btn tm-btn--lg tm-btn--primary tm-btn--block";
  button.type = "button";
  button.id = "otp-btn";
  button.disabled = state.locked || state.busy || state.expired || state.hold;

  const spinner = document.createElement("span");
  spinner.className = "tm-spinner";
  spinner.setAttribute("aria-hidden", "true");
  spinner.style.display = state.busy ? "inline-block" : "none";
  spinner.style.marginRight = "var(--tm-space-xs)";
  button.appendChild(spinner);

  const btnText = document.createElement("span");
  btnText.textContent = state.busy ? "Verifying…" : "Verify & sign in";
  button.appendChild(btnText);

  button.setAttribute("aria-busy", String(state.busy || false));
  button.style.marginTop = "var(--tm-space-lg)";

  button.addEventListener("click", () => {
    if (!button.disabled && !state.busy) {
      push(null, { s: "home_default" });
    }
  });

  grp2.appendChild(button);
  panel.appendChild(grp2);

  section.appendChild(panel);
  host.appendChild(section);

  // Update OTP slots display
  function updateSlots() {
    const v = codeInput.value.replace(/\D/g, "").slice(0, 4);
    if (codeInput.value !== v) codeInput.value = v;
    slots.forEach((slot, i) => {
      slot.textContent = v[i] || "";
    });
  }

  // Input handling
  codeInput.addEventListener("input", updateSlots);
  codeInput.addEventListener("focus", updateSlots);

  // Click on slots to focus input
  slotsDiv.addEventListener("click", () => {
    if (!state.locked) codeInput.focus();
  });

  // Update state display
  if (state.err) {
    helper.hidden = false;
    helper.textContent = MSG(state.err === "otp.triesLeft" ? "otp.triesLeft" : state.err,
      state.err === "otp.triesLeft" ? { count: 2 } : {});
    helper.setAttribute("role", "alert");
    field.style.borderColor = "var(--tm-border-error-strong)";
    field.classList.add("tm-field--error");
  }

  if (state.s1) {
    s1.style.display = "flex";
    s1Text.textContent = MSG(state.s1);
  }

  if (state.note) {
    notice.style.display = "flex";
    notice.classList.add("tm-notice--" + state.note.k);
    noticeIcon.setAttribute("data-icon", state.note.i);
    if (state.note.ops && state.note.t === "otp.locked") {
      noticeText.textContent = MSG(state.note.t, { time: "14:52" });
    } else if (state.note.ops && state.note.t === "otp.expiredAndLimited") {
      noticeText.textContent = MSG(state.note.t, { time: "9:42" });
    } else {
      noticeText.textContent = MSG(state.note.t);
    }
    codeSlot.style.display = "none";
  }

  // Resend line
  if (state.rs === "wait") {
    rr.innerHTML = "Resend in <span style=\"font-weight:600;font-variant-numeric:tabular-nums;color:var(--tm-content-primary)\">" + (state.time || "0:30") + "</span>";
  } else if (state.rs === "available") {
    rr.innerHTML = "<button type=\"button\" style=\"min-height:48px;min-width:48px;border:0;background:transparent;padding:0;color:var(--tm-content-brand);font:inherit;font-weight:600;cursor:pointer\">Resend code</button>";
  } else if (state.rs === "sending") {
    rr.textContent = "Sending a new code…";
  } else if (state.rs === "checking") {
    rp.hidden = true;
    rr.textContent = "Checking…";
  } else if (state.rs === "hidden") {
    rs.hidden = true;
  }

  updateSlots();

  return { journey: "otp" };
}
