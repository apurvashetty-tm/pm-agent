// Shared pieces, built once and composed by the screens (build-fast brief "Build shared pieces once"): icon, buttons, notices
// (page box and the action-bar band), the bottom-sheet template (RULES §9.4), toast, the compact case header (D-49) and the
// medicine row (app-logic §8). Markup and classes are the approved ones (ui-screens/home, ui-screens/case). Words through MSG().
import { MSG } from "../core/msg.js";
import { h } from "../core/dom.js";

export const icon = (name, cls = "") => h("span", { class: `tm-icon${cls ? " " + cls : ""}`, "data-icon": name, "aria-hidden": "true" });
export const paint = (root) => { if (window.TMIcons) window.TMIcons.render(root); return root; };

// Buttons. `busy` shows the spinner and the busy label, disabled (LOCKED L2).
export function btn(label, cls, onclick, attrs = {}) {
  return h("button", { type: "button", class: `tm-btn ${cls}`, onclick, ...attrs }, label);
}
export function busyBtn(label, cls) {
  return h("button", { type: "button", class: `tm-btn ${cls} tm-btn--busy`, disabled: true, "aria-busy": "true" },
    h("span", { class: "tm-spinner", "aria-hidden": "true" }), label);
}

// Notices: kind error | warning | neutral; role alert for errors, status otherwise.
const NOTICE_ICON = { error: "alert-circle", warning: "alert-triangle", neutral: "info-circle", success: "circle-check" };
export function notice(kind, text, { iconName, role, cls = "" } = {}) {
  return h("div", { class: `tm-notice tm-notice--${kind}${cls ? " " + cls : ""}`, role: role || (kind === "error" ? "alert" : "status") },
    icon(iconName || NOTICE_ICON[kind]), h("span", { text }));
}
export function statusLine(text) {
  return h("div", { class: "tm-status-line", role: "status" }, h("span", { class: "tm-spinner", "aria-hidden": "true" }), text);
}

// The pinned action bar: an optional bar notice (the edge-to-edge band, A-19) above its buttons.
export function actionBar(children, { notice: band = null, cls = "", id } = {}) {
  return h("div", { class: `tm-actionbar${cls ? " " + cls : ""}`, id }, band, ...[].concat(children));
}

// Bottom sheet over the screen (RULES §9.4): scrim, header (title + ✕), body, pinned actions. Returns the overlay element.
// onClose: ✕ and a tap on the scrim. closeDisabled: busy sheets keep ✕ greyed (D-81 F9).
// beforeActions: a result notice that sits between the body and the buttons (callback save failure, K3).
export function sheet({ title, subtitle, body = [], actions = [], onClose, closeDisabled = false, id, label, cls = "", beforeActions = null }) {
  const titleId = `sh-${Math.random().toString(36).slice(2, 7)}`;
  const close = h("button", { type: "button", class: "tm-btn tm-btn--quiet tm-btn--icon tm-sheet__close", "aria-label": MSG("common.close"), disabled: closeDisabled, onclick: () => onClose && onClose() }, icon("x"));
  // D-109 §2: a subtitle sits 8 under the title inside the header (.tm-sheet__heading); the title line stays centred on the ✕.
  const titleEl = h("h2", { class: "tm-sheet__title", id: titleId, text: title });
  const box = h("section", { class: `tm-sheet${cls ? " " + cls : ""}`, role: "dialog", "aria-modal": "true", "aria-labelledby": titleId, tabindex: "-1", id },
    h("header", { class: "tm-sheet__header" },
      subtitle ? h("div", { class: "tm-sheet__heading" }, titleEl, h("p", { class: "tm-sheet__subtitle", text: subtitle })) : titleEl, close),
    // A confirmation sheet whose only words are the subtitle has no body: header → actions (24, the actions' own margin).
    label || [].concat(body).some(Boolean) ? h("div", { class: "tm-sheet__body" }, label ? h("div", { class: "tm-sheet__label", text: label }) : null, ...[].concat(body)) : null,
    beforeActions,
    actions.length ? h("div", { class: "tm-sheet__actions" }, ...actions) : null);
  const overlay = h("div", { class: "tm-overlay app-overlay" }, box);
  overlay.addEventListener("click", (e) => { if (e.target === overlay && !closeDisabled && onClose) onClose(); });
  return overlay;
}
// Reason list (Disable, Unavailable, Skip HA): tapping a row applies it (no extra button).
// The title names the button; the line under it describes it (screen readers read the name, then the description).
let optSeq = 0;
export function option(title, desc, onclick) {
  const id = `opt-${++optSeq}`;
  return h("button", { type: "button", class: "tm-option", onclick, "aria-labelledby": `${id}-t`, "aria-describedby": desc ? `${id}-d` : null },
    h("span", { class: "tm-option__title", id: `${id}-t`, text: title }), desc ? h("span", { class: "tm-option__desc", id: `${id}-d`, text: desc }) : null);
}

export function toast(text, cls = "") { return h("div", { class: `tm-toast${cls ? " " + cls : ""}`, role: "status" }, text); }

// Compact case header (D-49): Back (only where allowed), patient name, Help; age · gender; order line. "Case", never "order",
// for the doctor's unit of work — the customer order ID line stays (CLAUDE.md wording rule).
export function caseHeader(c, { back = true, onBack, onHelp, loading = false } = {}) {
  const row = h("div", { class: "tm-header-task__row" },
    back ? h("button", { type: "button", class: "tm-btn tm-btn--quiet tm-btn--icon", id: "ch-back", "aria-label": MSG("common.back"), onclick: onBack }, icon("arrow-left")) : null,
    loading ? null : h("h1", { class: "tm-header-task__title", id: "ch-name", text: c.patient }),
    h("button", { type: "button", class: "tm-btn tm-btn--quiet tm-btn--icon", id: "ch-help", "aria-label": MSG("common.help"), onclick: onHelp }, icon("help-circle")));
  return h("header", { id: "case-head", class: `tm-header-task--compact${back ? "" : " tm-header-task--no-back"}` }, row,
    loading ? null : h("p", { class: "tm-header-task__meta", id: "ch-meta1", text: MSG("case.patientMeta", { age: c.age, gender: c.gender }) }),
    loading ? null : h("p", { class: "tm-header-task__meta", id: "ch-meta2", text: MSG("case.orderMeta", { id: c.order, total: c.total }) }));
}

// Medicine row (app-logic §8): form icon, name + strength, Qty and status tag; tap → Prescribe. Read-only rows: no arrow.
const FORM_ICON = { tablet: "tablet", capsule: "pill", injection: "vaccine", syrup: "syrup", drops: "eye-drops", cream: "ointment-tube", inhaler: "inhaler" };
const TAG = { prescribed: ["tm-tag--success", "case.statusPrescribed"], pending: ["tm-tag--warning", "case.statusPending"], disabled: ["tm-tag--neutral", "case.statusDisabled"] };
export function medicineRow(m, { readonly = false, onOpen } = {}) {
  const [tagCls, tagKey] = TAG[m.status] || TAG.pending;
  const row = h("div", { class: `tm-row medicine-item${m.status === "disabled" ? " disabled" : ""}${readonly ? " tm-row--readonly" : ""}`,
    role: readonly ? null : "button", tabindex: readonly ? "-1" : "0", "aria-label": MSG("case.editMedicine", { name: m.name }), "data-med-id": String(m.id) },
    h("div", { class: "tm-thumb med-icon" }, icon(FORM_ICON[m.form] || "tablet", "tm-icon--24")),
    h("div", { class: "tm-row__main med-info" },
      h("div", { class: "tm-row__title med-name", text: `${m.name} ${m.strength}` }),
      h("div", { class: "tm-row__line" }, h("span", { class: "tm-row__fact", text: MSG("case.qty", { n: m.qty }) }),
        h("span", { class: `tm-tag tm-tag--md ${tagCls} tm-tag--fixed`, text: MSG(tagKey) }))),
    readonly ? null : icon("chevron-right", "tm-icon--16"));
  if (!readonly && onOpen) {
    row.addEventListener("click", () => onOpen(m.id));
    row.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(m.id); } });
  }
  return row;
}

// Focus the sheet when it opens (Round 3 guard 4.7) without scrolling the page behind it.
export function focusSheet(overlay) { const s = overlay && overlay.querySelector(".tm-sheet"); if (s) s.focus({ preventScroll: true }); }

// Keyboard rule (D-81): the focused field scrolls into view above the keyboard with its label and helper, 16 clear of it.
export function revealAboveKeyboard(scroller, field, keyboard) {
  if (!scroller || !field || !keyboard) return;
  const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--tm-space-lg")) || 0;
  const d = field.getBoundingClientRect().bottom + gap - keyboard.getBoundingClientRect().top;
  if (d > 0) scroller.scrollTop += d;
}

// Keyboard rule (D-81) on a phone: the pinned bar hides while the keyboard is open and returns when it closes. The keyboard is
// "open" when a text field has focus and the visual viewport is clearly shorter than the tallest seen (the keyboard took it).
export function watchKeyboard(root, alive) {
  const vv = window.visualViewport; if (!vv) return;
  let tallest = vv.height;
  const check = () => {
    if (!alive()) { vv.removeEventListener("resize", check); return; }
    tallest = Math.max(tallest, vv.height);
    const field = document.activeElement && root.contains(document.activeElement) && /^(TEXTAREA|INPUT)$/.test(document.activeElement.tagName);
    root.classList.toggle("kb-real", !!field && vv.height < tallest * 0.8);
  };
  vv.addEventListener("resize", check); root.addEventListener("focusin", check); root.addEventListener("focusout", () => setTimeout(check, 0));
}
