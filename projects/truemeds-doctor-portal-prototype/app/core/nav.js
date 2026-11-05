// Navigation and phone back (plan B13). Every screen and sheet is a step in the app's history. The shell owns Back:
// a guard may block it (during a case: the toast); at the root phone back never closes the app mid-case.
let stack = [];
let guard = null;     // () => string | null — returns a blocking message, or null to allow
let onBlocked = null; // (message) => void
let render = null;    // (screenId, params) => void
export function setRenderer(fn) { render = fn; }
export function setGuard(fn, blocked) { guard = fn; onBlocked = blocked; }
export function push(screen, params = {}) {
  stack.push({ screen, params });
  history.pushState({ tm: stack.length }, "", location.href);
  if (render) render(screen, params);
}
export function back() {
  const block = guard ? guard() : null;
  if (block) { if (onBlocked) onBlocked(block); history.pushState({ tm: stack.length }, "", location.href); return false; }
  if (stack.length <= 1) return false;
  stack.pop();
  const top = stack[stack.length - 1];
  if (render && top) render(top.screen, top.params);
  return true;
}
export function current() { return stack[stack.length - 1] || null; }
export function reset() { stack = []; }
export function attachPhoneBack() {
  addEventListener("popstate", () => { back(); });
}
