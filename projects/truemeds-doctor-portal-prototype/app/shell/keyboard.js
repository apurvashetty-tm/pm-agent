// F-05: the phone's keyboard never covers the focused field or the screen's main button. Once, in the shell, for every screen.
// On a phone (below 768 wide, not capture), the app frame is sized to the visual viewport — the space above the keyboard — so a
// pinned bar sits on the keyboard (Android Chrome even when interactive-widget=resizes-content is not honoured; iOS Safari, which
// ignores it). On focus, and whenever the viewport changes while a field has focus, the field (with its label and helper) and the
// screen's main action — the first primary button after the field: Send OTP, Verify & sign in, a sheet's or Prescribe's button —
// are scrolled into that space, 16 px clear of the keyboard (D-44). Where an approved rule hides the pinned bar while typing
// (case page and Prescribe, D-81) the hidden bar is not a main action; the field alone is revealed.
// Desktop (the phone frame with the drawn keyboard) and capture: unchanged — this does nothing there.
const PHONE = "(max-width: 767px)";
const SETTLE = [0, 120, 320, 650];   // the keyboard animates in; reveal again as the viewport settles

const isField = (el) => !!el && (el.tagName === "TEXTAREA" || el.isContentEditable ||
  (el.tagName === "INPUT" && !/^(checkbox|radio|button|submit|reset|range|color|file|hidden)$/i.test(el.type)));
const shown = (el) => !!el && el.getClientRects().length > 0 && !el.closest("[inert], [hidden]") && getComputedStyle(el).visibility !== "hidden";
const scrolls = (el) => { const o = getComputedStyle(el).overflowY; return (o === "auto" || o === "scroll") && el.scrollHeight > el.clientHeight + 1; };

// The screen's main action for a field: the first shown primary button after it in the page (the button right under the field,
// or the pinned bar / sheet button that follows the fields).
export function mainAction(field, frame) {
  return [...frame.querySelectorAll(".tm-btn--primary")]
    .find((b) => (field.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) && shown(b)) || null;
}

// Scrolls each scroll container around the field so the field box and the action fit inside the visible area.
export function reveal(field, frame, gap) {
  const box = field.closest(".tm-field") || field;
  const action = mainAction(field, frame);
  const vv = window.visualViewport;
  const viewTop = vv ? vv.offsetTop : 0, viewBottom = vv ? vv.offsetTop + vv.height : innerHeight;
  for (let sc = box.parentElement; sc && sc !== document.body; sc = sc.parentElement) {
    if (!scrolls(sc)) { if (sc === frame) break; continue; }
    const r = sc.getBoundingClientRect();
    const top = Math.max(r.top, viewTop), bottom = Math.min(r.bottom, viewBottom);
    const f = box.getBoundingClientRect();
    const a = action && sc.contains(action) ? action.getBoundingClientRect() : null;   // a pinned action outside this scroller stays put
    const uTop = Math.min(f.top, a ? a.top : f.top), uBottom = Math.max(f.bottom, a ? a.bottom : f.bottom);
    let d = 0;
    if (uBottom - uTop + gap <= bottom - top) {               // both fit, the lower one 16 clear of the keyboard: the least movement
      if (uBottom + gap > bottom) d = uBottom + gap - bottom;
      else if (uTop < top) d = uTop - Math.min(gap, bottom - top - (uBottom - uTop) - gap) - top;
    } else d = f.top - top;                                     // not both: the field first, at the top
    if (d) sc.scrollTop += d;
    if (sc === frame) break;
  }
}

export function mountKeyboardAvoid({ mode, frame }) {
  const vv = window.visualViewport;
  if (!vv || !frame || mode === "capture") return;
  const phone = matchMedia(PHONE);
  const css = document.documentElement.style;
  const gap = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--tm-space-lg")) || 16;
  let timers = [], tallest = 0, wide = innerWidth;
  // Pinch zoom also shrinks the visual viewport: only at normal zoom on a phone does the app resize or scroll anything.
  const eligible = () => phone.matches && Math.abs(vv.scale - 1) <= 0.01;
  function fit() {
    if (!eligible()) { css.removeProperty("--app-vh"); css.removeProperty("--app-vt"); open(false); return; }
    css.setProperty("--app-vh", `${Math.round(vv.height)}px`);
    css.setProperty("--app-vt", `${Math.round(vv.offsetTop)}px`);
    if (innerWidth !== wide) { wide = innerWidth; tallest = 0; }   // turned: measure again
    tallest = Math.max(tallest, vv.height);
    open(isField(document.activeElement) && vv.height < tallest * 0.8);   // same test as parts.js watchKeyboard (D-81)
  }
  // html.phone-kb while the phone's keyboard is open: a screen whose header sits outside its scroll area (OTP) scrolls as one.
  const open = (on) => document.documentElement.classList.toggle("phone-kb", !!on);
  document.addEventListener("focusout", () => setTimeout(fit, 0));
  function revealSoon() {
    timers.forEach(clearTimeout);
    const el = document.activeElement;
    if (!eligible() || !isField(el) || !frame.contains(el)) return;
    timers = SETTLE.map((ms) => setTimeout(() => { if (document.activeElement === el && eligible()) reveal(el, frame, gap()); }, ms));
  }
  vv.addEventListener("resize", () => { fit(); revealSoon(); });
  vv.addEventListener("scroll", fit);
  phone.addEventListener?.("change", fit);
  document.addEventListener("focusin", (e) => { if (isField(e.target)) { fit(); revealSoon(); } });
  fit();
}
