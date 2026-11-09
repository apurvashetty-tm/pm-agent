// Returning unlock screen (entry journey). States: fingerprint, face, screen-lock, pending, cancelled, platform-retry, unavailable.
// First screen when app opens for a returning doctor with biometric/screen-lock enabled. 3 failed tries → fall back to OTP.
// Doctor name from mock data (D-92: "Dr. Kunal").
import { MSG } from "../core/msg.js";
import { push } from "../core/nav.js";

const STATES = {
  "unlock_fingerprint": "fingerprint",
  "unlock_face": "face",
  "unlock_screen-lock": "screen-lock",
  "unlock_pending": "pending",
  "unlock_cancelled": "cancelled",
  "unlock_platform-retry": "platform-retry",
  "unlock_unavailable": "unavailable",
};

const VARIANTS = {
  fingerprint: { icon: "fingerprint", label: "Unlock with fingerprint", busy: false, unavailable: false },
  face: { icon: "face-id", label: "Unlock with Face ID", busy: false, unavailable: false },
  "screen-lock": { icon: "lock", label: "Unlock with screen lock", busy: false, unavailable: false },
  pending: { icon: "fingerprint", label: "Unlocking…", busy: true, unavailable: false },
  cancelled: { icon: "fingerprint", label: "Unlock with fingerprint", busy: false, unavailable: false },
  "platform-retry": { icon: "fingerprint", label: "Unlock with fingerprint", busy: false, unavailable: false },
  unavailable: { icon: "fingerprint", label: "Unlock with fingerprint", busy: false, unavailable: true },
};

export function render(host, id, { mode, w }) {
  const stateKey = STATES[id];
  if (!stateKey) return null;

  const variant = VARIANTS[stateKey];
  if (!variant) return null;

  host.innerHTML = "";
  const main = document.createElement("main");
  main.className = "tm shell-screen";
  main.style.display = "flex";
  main.style.flexDirection = "column";
  main.style.height = "100%";
  main.setAttribute("aria-label", "Returning doctor quick unlock");

  // Header: logo, title, subtitle
  const header = document.createElement("header");
  header.style.padding = "var(--tm-space-lg) var(--tm-space-page) var(--tm-space-2xl)";
  header.style.background = "var(--tm-surface-brand-subtle)";
  header.style.flexShrink = 0;

  const logo = document.createElement("img");
  logo.src = "brand/truemeds-for-doctors.svg";
  logo.alt = "truemeds for doctors";
  logo.style.width = "166px";
  logo.style.height = "auto";
  logo.style.display = "block";
  logo.style.marginBottom = "var(--tm-space-lg)";
  header.appendChild(logo);

  const head = document.createElement("div");
  head.style.marginTop = "0";

  const h1 = document.createElement("h1");
  h1.className = "tm-font-title-lg";
  h1.style.margin = "0 0 var(--tm-space-sm)";
  h1.textContent = "Hello, Dr. Kunal";
  head.appendChild(h1);

  const subtitle = document.createElement("p");
  subtitle.style.margin = "0";
  subtitle.style.fontSize = "var(--tm-font-size-body-md)";
  subtitle.style.lineHeight = "var(--tm-font-lineheight-sm)";
  subtitle.style.color = "var(--tm-content-secondary)";
  subtitle.textContent = "Let's check in on your patients today.";
  head.appendChild(subtitle);
  header.appendChild(head);
  main.appendChild(header);

  // Panel: scrollable content
  const panel = document.createElement("section");
  panel.style.flex = "1";
  panel.style.minHeight = "0";
  panel.style.display = "flex";
  panel.style.flexDirection = "column";
  panel.style.padding = "var(--tm-space-2xl) var(--tm-space-page) var(--tm-space-xl)";
  panel.style.borderRadius = "var(--tm-radius-2xl) var(--tm-radius-2xl) 0 0";
  panel.style.background = "var(--tm-surface-primary)";
  panel.style.overflowY = "auto";
  panel.setAttribute("aria-labelledby", "ready");

  // Notice (shown only in unavailable state)
  const notice = document.createElement("div");
  notice.className = "tm-notice tm-notice--neutral";
  notice.style.margin = "0 0 var(--tm-space-lg)";
  notice.setAttribute("role", "status");
  notice.hidden = !variant.unavailable;

  if (variant.unavailable) {
    const noticeIcon = document.createElement("span");
    noticeIcon.className = "tm-icon";
    noticeIcon.setAttribute("data-icon", "info-circle");
    noticeIcon.setAttribute("aria-hidden", "true");
    notice.appendChild(noticeIcon);

    const noticeText = document.createElement("span");
    noticeText.textContent = MSG("unlock.unavailable");
    notice.appendChild(noticeText);
  }
  panel.appendChild(notice);

  // Prompt (hidden in unavailable state)
  const prompt = document.createElement("div");
  prompt.style.margin = "0";
  prompt.style.display = "flex";
  prompt.style.flexDirection = "column";
  prompt.style.alignItems = "center";
  prompt.style.gap = "var(--tm-space-lg)";
  prompt.style.textAlign = "center";
  prompt.hidden = variant.unavailable;

  const promptIcon = document.createElement("div");
  promptIcon.style.width = "64px";
  promptIcon.style.height = "64px";
  promptIcon.style.display = "grid";
  promptIcon.style.placeItems = "center";
  promptIcon.style.borderRadius = "var(--tm-radius-lg)";
  promptIcon.style.background = "var(--tm-surface-brand-subtle)";
  promptIcon.style.color = "var(--tm-content-brand)";
  promptIcon.setAttribute("aria-hidden", "true");

  const icon = document.createElement("span");
  icon.className = "tm-icon";
  icon.setAttribute("data-icon", variant.icon);
  icon.style.width = "32px";
  icon.style.height = "32px";
  promptIcon.appendChild(icon);
  prompt.appendChild(promptIcon);

  const h2 = document.createElement("h2");
  h2.id = "ready";
  h2.style.margin = "0";
  h2.style.fontSize = "var(--tm-font-size-body-lg)";
  h2.style.lineHeight = "var(--tm-font-lineheight-md)";
  h2.style.fontWeight = "600";
  h2.textContent = "Ready when you are";
  prompt.appendChild(h2);

  panel.appendChild(prompt);
  main.appendChild(panel);

  // Footer action bar
  const footer = document.createElement("div");
  footer.className = "tm-actionbar";
  footer.style.flexShrink = 0;
  footer.style.padding = "var(--tm-space-lg) var(--tm-space-page) var(--tm-space-xl)";
  footer.style.borderTop = "1px solid var(--tm-border-subtle)";
  footer.style.backgroundColor = "var(--tm-surface-primary)";
  footer.style.display = "flex";
  footer.style.flexDirection = "column";
  footer.style.gap = "var(--tm-space-md)";

  const unlockBtn = document.createElement("button");
  unlockBtn.className = "tm-btn tm-btn--primary tm-btn--lg tm-btn--block";
  unlockBtn.type = "button";
  unlockBtn.id = "unlock-action";
  unlockBtn.hidden = variant.unavailable;

  if (variant.busy) {
    unlockBtn.classList.add("tm-btn--busy");
    unlockBtn.setAttribute("aria-busy", "true");
    unlockBtn.disabled = true;

    const spinner = document.createElement("span");
    spinner.className = "tm-spinner";
    spinner.setAttribute("aria-hidden", "true");
    spinner.style.marginRight = "var(--tm-space-xs)";
    unlockBtn.appendChild(spinner);

    const label = document.createElement("span");
    label.textContent = variant.label;
    unlockBtn.appendChild(label);
  } else {
    unlockBtn.textContent = variant.label;
  }

  unlockBtn.addEventListener("click", () => {
    push(null, { s: "home_default" });
  });
  footer.appendChild(unlockBtn);

  const fallbackBtn = document.createElement("button");
  fallbackBtn.className = variant.unavailable ? "tm-btn tm-btn--primary tm-btn--lg tm-btn--block" : "tm-btn tm-btn--quiet tm-btn--lg tm-btn--block";
  fallbackBtn.type = "button";
  fallbackBtn.id = "fallback";
  fallbackBtn.textContent = "Use OTP instead";

  fallbackBtn.addEventListener("click", () => {
    push(null, { s: "sign-in_default" });
  });
  footer.appendChild(fallbackBtn);

  const switchBtn = document.createElement("button");
  switchBtn.className = "tm-btn tm-btn--quiet tm-btn--lg tm-btn--block";
  switchBtn.type = "button";
  switchBtn.style.marginTop = "var(--tm-space-md)";
  switchBtn.innerHTML = "Not you? <strong style=\"color:var(--tm-content-brand);font-weight:600\">Switch account</strong>";

  switchBtn.addEventListener("click", () => {
    push(null, { s: "sign-in_default" });
  });
  footer.appendChild(switchBtn);

  main.appendChild(footer);
  host.appendChild(main);

  return { journey: "unlock" };
}
