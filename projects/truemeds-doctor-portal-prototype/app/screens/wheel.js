// Availability wheel column (D-40, F-04): a real wheel, not a select. Used by Home setup and the Add time sheet (home.js).
// One column = a scroll container showing three rows; the row in the centre band is the value.
//   · touch swipe: the browser's own scrolling (momentum) with CSS scroll-snap → snaps to one row
//   · mouse drag (desktop review): dragged here, with a short momentum, then snapped
//   · mouse wheel / trackpad: native scrolling, snapped
//   · tap the row above / below: one step (as before) · arrow keys: one step · Home / End: first / last
// When the column comes to rest the value is set through onPick (home.js applies the 15-minute minimum and redraws).
// Accessible as before: role listbox with role option rows, aria-selected on the row in the band (roving tab stop).
// Same look: the rows, band and sizes come from home.css; at rest the picture is the approved three-row wheel.
import { h } from "../core/dom.js";

const SETTLE_MS = 120;   // no scroll for this long (and no finger / mouse down) = the wheel has come to rest
const DRAG_SLOP = 4;     // px of mouse travel before a press becomes a drag (a smaller move stays a tap)
const FRICTION = 0.92;   // per-frame velocity decay of the mouse-drag momentum

export function wheelColumn({ name, col, values, current, disabled, onPick }) {
  const at = Math.max(0, values.indexOf(current));
  const items = values.map((val, k) => h("button", {
    type: "button", class: `wheel-item${k === at ? " is-selected" : ""}`, role: "option", "aria-selected": String(k === at),
    tabindex: k === at ? "0" : "-1", disabled, "data-index": String(k),
    onclick: (e) => { if (el.dataset.dragged) { e.preventDefault(); return; } if (k !== at) onPick(val, { col }); },
  }, String(val)));
  const el = h("div", { class: `wheel${disabled ? " is-busy" : ""}`, role: "listbox", "aria-label": name, "data-col": col },
    h("span", { class: "wheel-item wheel-item--empty", "aria-hidden": "true" }), items,
    h("span", { class: "wheel-item wheel-item--empty", "aria-hidden": "true" }));

  const rowH = () => (items[0] && items[0].offsetHeight) || 1;
  const nearest = () => Math.min(values.length - 1, Math.max(0, Math.round(el.scrollTop / rowH())));
  let shown = at;
  function mark(k) {   // the row in the band looks selected while the wheel moves
    if (k === shown) return;
    items[shown]?.classList.remove("is-selected"); items[shown]?.setAttribute("aria-selected", "false");
    items[k]?.classList.add("is-selected"); items[k]?.setAttribute("aria-selected", "true");
    shown = k;
  }
  let held = false, timer = 0, anim = 0, moving = false;
  function settle() {
    clearTimeout(timer);
    if (disabled || held || anim) return;
    timer = setTimeout(() => {
      if (held || anim || !el.isConnected) return;
      const k = nearest();
      el.classList.remove("is-dragging");
      if (Math.abs(el.scrollTop - k * rowH()) > 1) { el.scrollTo({ top: k * rowH(), behavior: "smooth" }); return; }   // lands, then settles again
      moving = false;
      // Both columns together: while the other column still moves, wait — the last one to rest sets both values (a commit
      // redraws the picker, which would otherwise throw away the other column's swipe in progress).
      const all = [...(el.parentElement ? el.parentElement.querySelectorAll(".wheel") : [el])];
      if (all.some((w) => w !== el && w.isMoving && w.isMoving())) return;
      pickAll(all);
    }, SETTLE_MS);
  }
  el.addEventListener("scroll", () => { moving = true; mark(nearest()); settle(); }, { passive: true });
  el.addEventListener("touchstart", () => { held = true; moving = true; clearTimeout(timer); }, { passive: true });
  const release = () => { held = false; settle(); };
  el.addEventListener("touchend", release, { passive: true });
  el.addEventListener("touchcancel", release, { passive: true });

  // Mouse drag (touch scrolls natively). Snap is off while the mouse moves the wheel, back on when it rests.
  el.addEventListener("pointerdown", (e) => {
    if (disabled || e.pointerType !== "mouse" || e.button !== 0) return;
    cancelAnimationFrame(anim); anim = 0;
    const y0 = e.clientY, top0 = el.scrollTop;
    let lastY = y0, lastT = performance.now(), v = 0, dragging = false;
    held = true; moving = true; delete el.dataset.dragged;
    const move = (m) => {
      if (!dragging && Math.abs(m.clientY - y0) < DRAG_SLOP) return;
      if (!dragging) { dragging = true; el.dataset.dragged = "1"; el.classList.add("is-dragging"); }
      const t = performance.now();
      v = (lastY - m.clientY) / Math.max(1, t - lastT);   // px per ms, positive = towards later values
      lastY = m.clientY; lastT = t;
      el.scrollTop = top0 + (y0 - m.clientY);
    };
    const up = () => {
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up);
      held = false;
      if (!dragging) { settle(); return; }
      setTimeout(() => { delete el.dataset.dragged; }, 0);   // the click that follows a drag is not a tap
      let speed = v * 16;   // px per frame
      const glide = () => {
        if (Math.abs(speed) < 0.5 || !el.isConnected) { anim = 0; settle(); return; }
        el.scrollTop += speed; speed *= FRICTION;
        anim = requestAnimationFrame(glide);
      };
      anim = requestAnimationFrame(glide);
    };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
  });

  el.addEventListener("keydown", (e) => {
    if (disabled) return;
    const k = { ArrowUp: at - 1, ArrowDown: at + 1, Home: 0, End: values.length - 1 }[e.key];
    if (k === undefined) return;
    e.preventDefault();
    if (k >= 0 && k < values.length && k !== at) onPick(values[k], { col, focus: true });
  });

  // Puts the selected row in the band. Call once the column is in the page (home.js draw()).
  el.sync = () => { el.scrollTop = at * rowH(); shown = at; };
  el.isMoving = () => held || !!anim || moving;
  // The row in the band now, if it differs from the committed value (Set availability / Add read it before sending).
  el.pending = () => { if (disabled) return null; const k = nearest(); return k !== at ? { col, val: values[k], pick: onPick } : null; };
  return el;
}
function pickAll(wheels) {
  const picks = wheels.map((w) => w.pending && w.pending()).filter(Boolean);   // read every band first: the first pick redraws
  picks.forEach((p) => p.pick(p.val, { col: p.col }));
}

// The values in the bands, committed now (Set availability / Add tapped before the wheel came to rest): what the doctor sees is
// what is sent.
export function commitWheels(root) { pickAll([...root.querySelectorAll(".wheel")]); }

// After a redraw: every wheel shows its value in the band; the column the keyboard moved keeps the focus.
export function syncWheels(root, focusCol) {
  root.querySelectorAll(".wheel").forEach((w) => w.sync && w.sync());
  if (focusCol) root.querySelector(`.wheel[data-col="${focusCol}"] .wheel-item.is-selected`)?.focus({ preventScroll: true });
}
