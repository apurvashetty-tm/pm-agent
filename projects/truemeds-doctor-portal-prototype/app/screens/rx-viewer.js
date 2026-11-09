// View Rx (app-logic §9): the customer's prescription full screen inside the frame — zoom 50–400 %, rotate, reset, pinch and
// drag; load failure: notice + Try again; ✕ always closes. Markup lifted from ui-screens/case/case.html (#rx-overlay, viewer
// header D-51). The paper is a mock document (mock data in app/data/cases.js; its look is the exempt mock Rx paper block).
// Zoom / rotate / pan are applied with a zero-length Web Animation, so no inline style is written (step 1 quality rule).
import { MSG } from "../core/msg.js";
import { h } from "../core/dom.js";
import { icon, btn, notice } from "./parts.js";
import { value } from "../core/settings.js";

export function rxViewer(c, { mode, failed = false, onClose, onRetry, later }) {
  const st = { zoom: 1, rot: 0, x: 0, y: 0 };
  const label = h("span", { id: "rx-zoom-label", text: MSG("rx.zoom", { n: 100 }) });
  const doc = paper(c);
  const wrap = h("div", { id: "rx-doc-wrapper" }, doc);
  const apply = () => {
    wrap.getAnimations().forEach((a) => a.cancel());
    wrap.animate([{ transform: `translate(${st.x}px, ${st.y}px) rotate(${st.rot}deg) scale(${st.zoom})` }], { duration: 0, fill: "forwards" });
    label.textContent = MSG("rx.zoom", { n: Math.round(st.zoom * 100) });
  };
  const zoom = (d) => { st.zoom = Math.min(4, Math.max(0.5, st.zoom + d)); apply(); };
  const tool = (ic, key, fn) => h("button", { class: "tm-btn tm-btn--on-dark tm-btn--icon rx-ctrl-btn", type: "button", "aria-label": MSG(key), title: MSG(key), onclick: fn }, icon(ic, "tm-icon--16"));
  const header = h("div", { id: "rx-overlay-header", class: "tm-header-viewer" },
    h("button", { id: "rx-overlay-close", class: "tm-btn tm-btn--on-dark tm-btn--icon", type: "button", "aria-label": MSG("common.close"), onclick: onClose }, icon("x")),
    h("div", { id: "rx-overlay-title", class: "tm-header-viewer__title", text: MSG("rx.title") }),
    failed ? null : h("div", { id: "rx-controls", class: "tm-header-viewer__tools" },
      tool("minus", "rx.zoomOut", () => zoom(-0.25)), label, tool("plus", "rx.zoomIn", () => zoom(0.25)),
      tool("rotate-clockwise", "rx.rotate", () => { st.rot = (st.rot + 90) % 360; apply(); }),
      tool("arrows-minimize", "rx.reset", () => { Object.assign(st, { zoom: 1, rot: 0, x: 0, y: 0 }); apply(); })));
  if (failed) {
    return h("div", { id: "rx-overlay", class: "open", role: "dialog", "aria-modal": "true", "aria-labelledby": "rx-overlay-title" }, header,
      h("div", { id: "rx-overlay-body" }, h("div", { class: "rx-stack" }, notice("error", MSG("rx.loadFailed")))),
      h("div", { class: "tm-actionbar rx-bar" }, btn(MSG("common.tryAgain"), "tm-btn--primary tm-btn--lg tm-btn--block", () => later(onRetry))));
  }
  const bodyEl = h("div", { id: "rx-overlay-body" }, h("div", { id: "rx-hint", text: MSG("rx.hint") }), wrap);
  // Gestures: drag to pan, pinch to zoom, double-tap to zoom (pointer events; no library).
  const pts = new Map(); let pinch = null, lastTap = 0;
  bodyEl.addEventListener("pointerdown", (e) => { pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); bodyEl.setPointerCapture(e.pointerId);
    const now = Date.now(); if (pts.size === 1 && now - lastTap < value("doubleTapWindow", mode)) zoom(st.zoom >= 2 ? 1 - st.zoom : 1); lastTap = now; });
  bodyEl.addEventListener("pointermove", (e) => {
    const p = pts.get(e.pointerId); if (!p) return;
    if (pts.size === 2) {
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const [a, b] = [...pts.values()]; const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch) { st.zoom = Math.min(4, Math.max(0.5, st.zoom * dist / pinch)); apply(); }
      pinch = dist; return;
    }
    st.x += e.clientX - p.x; st.y += e.clientY - p.y; pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); apply();
  });
  const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; };
  bodyEl.addEventListener("pointerup", up); bodyEl.addEventListener("pointercancel", up);
  return h("div", { id: "rx-overlay", class: "open", role: "dialog", "aria-modal": "true", "aria-labelledby": "rx-overlay-title" }, header, bodyEl);
}

// The mock prescription paper (synthetic letterhead, the case's medicines and their customer Rx lines).
function paper(c) {
  const r = c.rx, L = r.labels;
  return h("div", { class: "rx-paper" },
    h("div", { class: "rx-paper-letterhead" }, h("div", { class: "rx-paper-clinic", text: r.clinic }), h("div", { class: "rx-paper-doctor", text: r.doctor }),
      h("div", { class: "rx-paper-quals", text: r.quals }), h("div", { class: "rx-paper-address" }, r.address[0], h("br"), r.address[1])),
    h("div", { class: "rx-paper-body" },
      h("div", { class: "rx-paper-patient-row" },
        h("div", { class: "rx-paper-patient" }, h("div", { class: "rx-paper-label", text: L.patient }), h("div", { class: "rx-paper-value", text: c.patient }),
          h("div", { class: "rx-paper-label rx-paper-label--gap", text: L.date }), h("div", { class: "rx-paper-value", text: rxDate() })),
        h("div", {}, h("div", { class: "rx-paper-patient rx-paper-right" }, h("div", { class: "rx-paper-label", text: L.ageGender }), h("div", { class: "rx-paper-value", text: `${c.age} / ${c.gender}` })),
          h("div", { class: "rx-paper-symbol", text: "℞" }))),
      h("div", { class: "rx-paper-medicines" }, c.medicines.map((m, i) => h("div", { class: "rx-paper-med" },
        h("div", { class: "rx-paper-med-number", text: L.medicine.replace("{n}", i + 1) }), h("div", { class: "rx-paper-med-name", text: `${m.name} ${m.strength}` }),
        h("div", { class: "rx-paper-med-details", text: m.rxLine }), h("div", { class: "rx-paper-med-note", text: r.note })))),
      h("div", { class: "rx-paper-footer" },
        h("div", { class: "rx-paper-advice" }, h("div", { class: "rx-paper-advice-label", text: L.advice }), h("div", { class: "rx-paper-advice-text" }, r.advice[0], h("br"), r.advice[1]),
          h("div", { class: "rx-paper-stamp" }, h("div", { class: "rx-paper-stamp-text", text: r.stamp }))),
        h("div", { class: "rx-paper-signature" }, h("div", { class: "rx-paper-sig-line" }), h("div", { class: "rx-paper-sig-name", text: r.doctor }), h("div", { class: "rx-paper-sig-reg", text: r.reg })))));
}
// The paper's date: today, as the mock clinic would write it (dd Mon yyyy).
function rxDate() { return new Date(globalThis.__tmNow ? globalThis.__tmNow() : Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
