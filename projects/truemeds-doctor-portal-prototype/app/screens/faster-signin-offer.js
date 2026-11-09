// Faster sign-in offer screen (entry journey, step 1). States: fingerprint, face-id, screen-lock, enabling, enable-failed, offline.
// Offer is shown once after first OTP sign-in. "Offered once" + "enabled" flags persist (plan B12).
import { MSG } from "../core/msg.js";
import { push } from "../core/nav.js";

const STATES = {
  "offer_fingerprint": "fingerprint",
  "offer_face-id": "face-id",
  "offer_screen-lock": "screen-lock",
  "offer_enabling": "enabling",
  "offer_enable-failed": "enable-failed",
  "offer_offline": "offline",
};

const VARIANTS = {
  fingerprint: {
    icon: "fingerprint",
    sub: "offer.fingerprintSub",
    d1: "offer.fingerprintLine",
    t2: "offer.fingerprintTrust",
    enabling: false,
    notice: null,
    retry: false,
  },
  "face-id": {
    icon: "face-id",
    sub: "offer.faceIdSub",
    d1: "offer.faceIdLine",
    t2: "offer.faceIdTrust",
    enabling: false,
    notice: null,
    retry: false,
  },
  "screen-lock": {
    icon: "lock",
    sub: "offer.screenLockSub",
    d1: "offer.screenLockLine",
    t2: "offer.screenLockTrust",
    enabling: false,
    notice: null,
    retry: false,
  },
  enabling: {
    icon: "fingerprint",
    sub: "offer.fingerprintSub",
    d1: "offer.fingerprintLine",
    t2: "offer.fingerprintTrust",
    enabling: true,
    notice: null,
    retry: false,
  },
  "enable-failed": {
    icon: "fingerprint",
    sub: "offer.fingerprintSub",
    d1: "offer.fingerprintLine",
    t2: "offer.fingerprintTrust",
    enabling: false,
    notice: { k: "error", i: "alert-circle", t: "offer.enableFailed" },
    retry: true,
  },
  offline: {
    icon: "fingerprint",
    sub: "offer.fingerprintSub",
    d1: "offer.fingerprintLine",
    t2: "offer.fingerprintTrust",
    enabling: false,
    notice: { k: "warning", i: "alert-triangle", t: "offer.offline" },
    retry: false,
  },
};

export function render(host, id, { mode, w }) {
  const stateKey = STATES[id];
  if (!stateKey) return null;

  const variant = VARIANTS[stateKey];
  if (!variant) return null;

  host.innerHTML = "";
  const section = document.createElement("section");
  section.className = "tm shell-screen";
  section.style.display = "flex";
  section.style.flexDirection = "column";
  section.style.height = "100%";
  section.setAttribute("aria-label", "Skip the OTP next time");

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

  const h1 = document.createElement("h1");
  h1.className = "tm-font-title-lg";
  h1.style.margin = "var(--tm-space-lg) 0 var(--tm-space-sm)";
  h1.textContent = "Skip the OTP next time";
  top.appendChild(h1);

  const subtitle = document.createElement("p");
  subtitle.style.margin = "0";
  subtitle.style.fontSize = "var(--tm-font-size-body-md)";
  subtitle.style.lineHeight = "var(--tm-font-lineheight-sm)";
  subtitle.style.color = "var(--tm-content-secondary)";
  subtitle.textContent = MSG(variant.sub);
  top.appendChild(subtitle);

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

  // Hero icon
  const heroWrap = document.createElement("div");
  heroWrap.style.display = "flex";
  heroWrap.style.justifyContent = "center";
  heroWrap.style.marginBottom = "var(--tm-space-lg)";

  const heroIc = document.createElement("div");
  heroIc.style.width = "64px";
  heroIc.style.height = "64px";
  heroIc.style.borderRadius = "var(--tm-radius-lg)";
  heroIc.style.background = "var(--tm-surface-brand-subtle)";
  heroIc.style.color = "var(--tm-content-brand)";
  heroIc.style.display = "grid";
  heroIc.style.placeItems = "center";

  const heroIcon = document.createElement("span");
  heroIcon.className = "tm-icon";
  heroIcon.setAttribute("data-icon", variant.icon);
  heroIcon.setAttribute("aria-hidden", "true");
  heroIcon.style.width = "32px";
  heroIcon.style.height = "32px";
  heroIc.appendChild(heroIcon);
  heroWrap.appendChild(heroIc);
  panel.appendChild(heroWrap);

  // Points list
  const points = document.createElement("ul");
  points.style.listStyle = "none";
  points.style.margin = "0";
  points.style.padding = "0";
  points.style.display = "flex";
  points.style.flexDirection = "column";
  points.style.gap = "var(--tm-space-lg)";

  // Point 1
  const p1 = document.createElement("li");
  p1.style.display = "flex";
  p1.style.gap = "var(--tm-space-md)";
  p1.style.alignItems = "flex-start";

  const p1Icon = document.createElement("span");
  p1Icon.className = "tm-icon";
  p1Icon.setAttribute("data-icon", "circle-check");
  p1Icon.setAttribute("aria-hidden", "true");
  p1Icon.style.width = "24px";
  p1Icon.style.height = "24px";
  p1Icon.style.flex = "none";
  p1Icon.style.color = "var(--tm-content-secondary)";
  p1Icon.style.marginTop = "0";
  p1.appendChild(p1Icon);

  const p1Content = document.createElement("div");
  const p1Title = document.createElement("p");
  p1Title.style.margin = "0";
  p1Title.style.fontSize = "var(--tm-font-size-body-lg)";
  p1Title.style.lineHeight = "var(--tm-font-lineheight-md)";
  p1Title.style.fontWeight = "600";
  p1Title.style.color = "var(--tm-content-primary)";
  p1Title.textContent = "No more waiting for SMS codes";
  p1Content.appendChild(p1Title);

  const p1Desc = document.createElement("p");
  p1Desc.style.margin = "0";
  p1Desc.style.fontSize = "var(--tm-font-size-body-md)";
  p1Desc.style.lineHeight = "var(--tm-font-lineheight-sm)";
  p1Desc.style.color = "var(--tm-content-secondary)";
  p1Desc.textContent = MSG(variant.d1);
  p1Content.appendChild(p1Desc);
  p1.appendChild(p1Content);
  points.appendChild(p1);

  // Point 2
  const p2 = document.createElement("li");
  p2.style.display = "flex";
  p2.style.gap = "var(--tm-space-md)";
  p2.style.alignItems = "flex-start";

  const p2Icon = document.createElement("span");
  p2Icon.className = "tm-icon";
  p2Icon.setAttribute("data-icon", "lock");
  p2Icon.setAttribute("aria-hidden", "true");
  p2Icon.style.width = "24px";
  p2Icon.style.height = "24px";
  p2Icon.style.flex = "none";
  p2Icon.style.color = "var(--tm-content-secondary)";
  p2Icon.style.marginTop = "0";
  p2.appendChild(p2Icon);

  const p2Content = document.createElement("div");
  const p2Title = document.createElement("p");
  p2Title.style.margin = "0";
  p2Title.style.fontSize = "var(--tm-font-size-body-lg)";
  p2Title.style.lineHeight = "var(--tm-font-lineheight-md)";
  p2Title.style.fontWeight = "600";
  p2Title.style.color = "var(--tm-content-primary)";
  p2Title.textContent = MSG(variant.t2);
  p2Content.appendChild(p2Title);

  const p2Desc = document.createElement("p");
  p2Desc.style.margin = "0";
  p2Desc.style.fontSize = "var(--tm-font-size-body-md)";
  p2Desc.style.lineHeight = "var(--tm-font-lineheight-sm)";
  p2Desc.style.color = "var(--tm-content-secondary)";
  p2Desc.textContent = "Truemeds never sees or stores it.";
  p2Content.appendChild(p2Desc);
  p2.appendChild(p2Content);
  points.appendChild(p2);

  // Point 3
  const p3 = document.createElement("li");
  p3.style.display = "flex";
  p3.style.gap = "var(--tm-space-md)";
  p3.style.alignItems = "flex-start";

  const p3Icon = document.createElement("span");
  p3Icon.className = "tm-icon";
  p3Icon.setAttribute("data-icon", "settings");
  p3Icon.setAttribute("aria-hidden", "true");
  p3Icon.style.width = "24px";
  p3Icon.style.height = "24px";
  p3Icon.style.flex = "none";
  p3Icon.style.color = "var(--tm-content-secondary)";
  p3Icon.style.marginTop = "0";
  p3.appendChild(p3Icon);

  const p3Content = document.createElement("div");
  const p3Title = document.createElement("p");
  p3Title.style.margin = "0";
  p3Title.style.fontSize = "var(--tm-font-size-body-lg)";
  p3Title.style.lineHeight = "var(--tm-font-lineheight-md)";
  p3Title.style.fontWeight = "600";
  p3Title.style.color = "var(--tm-content-primary)";
  p3Title.textContent = "Change it any time";
  p3Content.appendChild(p3Title);

  const p3Desc = document.createElement("p");
  p3Desc.style.margin = "0";
  p3Desc.style.fontSize = "var(--tm-font-size-body-md)";
  p3Desc.style.lineHeight = "var(--tm-font-lineheight-sm)";
  p3Desc.style.color = "var(--tm-content-secondary)";
  p3Desc.textContent = "Turn it off from your profile.";
  p3Content.appendChild(p3Desc);
  p3.appendChild(p3Content);
  points.appendChild(p3);

  panel.appendChild(points);
  section.appendChild(panel);

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

  if (variant.notice) {
    const notice = document.createElement("div");
    notice.className = "tm-notice tm-notice--" + variant.notice.k;
    notice.setAttribute("role", "status");
    notice.style.marginBottom = "var(--tm-space-md)";

    const noticeIcon = document.createElement("span");
    noticeIcon.className = "tm-icon";
    noticeIcon.setAttribute("data-icon", variant.notice.i);
    noticeIcon.setAttribute("aria-hidden", "true");
    notice.appendChild(noticeIcon);

    const noticeText = document.createElement("span");
    noticeText.textContent = MSG(variant.notice.t);
    notice.appendChild(noticeText);

    footer.appendChild(notice);
  }

  const turnOnBtn = document.createElement("button");
  turnOnBtn.className = "tm-btn tm-btn--primary tm-btn--lg tm-btn--block";
  turnOnBtn.type = "button";
  turnOnBtn.id = "turn-on";

  if (variant.enabling) {
    turnOnBtn.classList.add("tm-btn--busy");
    turnOnBtn.setAttribute("aria-busy", "true");
    turnOnBtn.disabled = true;

    const spinner = document.createElement("span");
    spinner.className = "tm-spinner";
    spinner.setAttribute("aria-hidden", "true");
    spinner.style.marginRight = "var(--tm-space-xs)";
    turnOnBtn.appendChild(spinner);

    const label = document.createElement("span");
    label.textContent = "Turning on…";
    turnOnBtn.appendChild(label);
  } else {
    const label = variant.retry ? "Try again" : "Turn on faster sign-in";
    turnOnBtn.textContent = label;
  }

  turnOnBtn.addEventListener("click", () => {
    push(null, { s: "home_default" });
  });
  footer.appendChild(turnOnBtn);

  const notNowBtn = document.createElement("button");
  notNowBtn.className = "tm-btn tm-btn--quiet tm-btn--lg tm-btn--block";
  notNowBtn.type = "button";
  notNowBtn.textContent = "Not now";
  notNowBtn.disabled = variant.enabling;

  notNowBtn.addEventListener("click", () => {
    push(null, { s: "home_default" });
  });
  footer.appendChild(notNowBtn);

  section.appendChild(footer);
  host.appendChild(section);

  return { journey: "offer" };
}
