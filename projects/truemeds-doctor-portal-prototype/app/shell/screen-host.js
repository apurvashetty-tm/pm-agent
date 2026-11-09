// Shows the state for ?s=<id>: the approved picture inside the frame (review / play label: "Not built yet"), or a card for a
// behaviour-only state. Journey screens replace this per state in their own step.
import { REVIEW_TEXT as T } from "../review/labels.js";
import { MSG } from "../core/msg.js";
import * as signInScreen from "../screens/sign-in.js";
import * as otpScreen from "../screens/otp.js";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export const FOLDER_JOURNEY = { "sign-in": "signIn", otp: "otp", "faster-signin-offer": "offer", "returning-unlock": "unlock", home: "home", case: "caseView", prescribe: "prescribe" };

// Built screen renderers (step 1+). Faster sign-in offer and returning unlock are rebuilt in session 3 (step 1 recovery):
// their session-1 scaffolds (screens/faster-signin-offer.js, screens/returning-unlock.js) are display-only with inline styles,
// so until then those states show the approved picture with the "Not built yet" label.
const renderers = {
  "sign-in": signInScreen.render,
  "otp": otpScreen.render,
};

export function findState(id) {
  const map = window.TM_STATE_MAP;
  const row = map.pictures.find((r) => r.id === id);
  if (row) return { kind: "picture", row };
  const other = map.others.find((o) => o.id === id);
  if (other) return { kind: "behaviour", row: other };
  return null;
}

// Returns { journey } for the panel, and renders into host.
let hostSeq = 0;
export function renderState(host, id, { mode, w, params = {} }) {
  host.dataset.life = `host-${++hostSeq}`;   // every transition ends the previous screen's timers and late answers (entry-ctx newLife)
  if (id === "placeholder") return renderPlaceholder(host, params);
  const found = findState(id);
  if (!found) {
    host.innerHTML = `<div class="shell-picture shell-picture--card"><h2>${esc(T.unknownState.replace("{id}", id))}</h2></div>`;
    return { journey: null, ok: false };
  }
  const label = mode === "capture" ? "" : `<p class="shell-label">${esc(
    found.kind === "picture" ? T.pictureLabel.replace("{step}", found.row.step) : T.behaviourOnly.replace("{step}", found.row.step))}</p>`;
  if (found.kind === "picture") {
    const folder = found.row.picture.split("/")[0];
    const renderer = renderers[folder];

    // Try to render with actual screen (step 1+)
    if (renderer) {
      try {
        const result = renderer(host, id, { mode, w, params });
        if (result) return { journey: result.journey || (found.row.calling.length ? "call" : FOLDER_JOURNEY[folder] || null), ok: true };
      } catch (e) {
        console.error("Screen render failed:", e);
      }
    }

    // Fallback to picture
    host.innerHTML = `<figure class="shell-picture">${label}<img alt="${esc(found.row.id)}" src="pictures/${esc(found.row.picture)}_w${w}.png"></figure>`;
    return { journey: found.row.calling.length ? "call" : FOLDER_JOURNEY[folder] || null, ok: true };
  }
  host.innerHTML = `<figure class="shell-picture shell-picture--card">${label}<h2>${esc(found.row.id)}</h2>
    <p>${esc(T.behaviourOnly.replace("{step}", found.row.step))}</p>${found.row.calling ? `<p>${esc(found.row.calling)}</p>` : ""}</figure>`;
  return { journey: null, ok: true };
}

// Placeholder page for links that are not real in the prototype (OQ-021: Call Doctor Ops, Message support, Terms, Privacy;
// same blank-page pattern as Help, D-88). Phone back returns. Never a real tel: or wa.me link.
function renderPlaceholder(host, params) {
  host.innerHTML = "";
  const page = document.createElement("section");
  page.className = "tm placeholder-page";
  const text = document.createElement("p");
  text.className = "placeholder-page__text";
  text.textContent = MSG(params.text || "placeholder.linkPending");
  page.append(text);
  host.append(page);
  return { journey: null, ok: true };
}

export function renderShellIntro(host, mode) {
  const text = mode === "demo" ? T.demoShell : T.shellOnly;
  host.innerHTML = `<div class="shell-screen"><p class="shell-empty">${esc(text)}</p></div>`;
}
export { MSG };
