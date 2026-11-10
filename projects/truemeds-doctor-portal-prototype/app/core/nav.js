// Navigation and phone back (plan B13). Every screen and sheet is a step in the app's history. The shell owns Back:
// a guard may block it (during a case: the toast); a screen may own its Back action (OTP: Back = Change, app-logic §2);
// at the root phone back never closes the app.
let stack = [];
let guard = null;     // () => string | null — returns a blocking message, or null to allow
let onBlocked = null; // (message) => void
let render = null;    // (screenId, params) => void
let screenBack = null; // () => void — the current screen's own Back action; cleared on every render
export function setRenderer(fn) { render = fn; }
export function setGuard(fn, blocked) { guard = fn; onBlocked = blocked; }
export function setScreenBack(fn) { screenBack = fn; }
function show(entry) { screenBack = null; if (render && entry) render(entry.screen, entry.params); }
// First step of a session or a restarted story: one entry, no extra history.
export function start(screen, params = {}) {
  stack = [{ screen, params }];
  history.replaceState({ tm: 1 }, "", location.href);
  show(stack[0]);
}
export function push(screen, params = {}) {
  stack.push({ screen, params });
  history.pushState({ tm: stack.length }, "", location.href);
  show(stack[stack.length - 1]);
}
// Replaces the current step (no new history entry): server answers that change the state of the same screen.
export function replace(screen, params = {}) {
  if (!stack.length) { push(screen, params); return; }
  stack[stack.length - 1] = { screen, params };
  show(stack[stack.length - 1]);
}
// Goes back to an earlier step of the given screen kind if there is one (keeps history short), else pushes it.
export function backTo(match, params = {}) {
  const i = stack.map((e) => match(e)).lastIndexOf(true);
  if (i < 0) { push(null, params); return; }
  stack = stack.slice(0, i + 1);
  stack[i] = { ...stack[i], params: { ...stack[i].params, ...params } };
  show(stack[i]);
}
export function back() {
  const block = guard ? guard() : null;
  if (block) { if (onBlocked) onBlocked(block); history.pushState({ tm: stack.length }, "", location.href); return false; }
  if (screenBack) { const fn = screenBack; history.pushState({ tm: stack.length }, "", location.href); fn(); return true; }
  if (stack.length <= 1) { history.pushState({ tm: stack.length }, "", location.href); return false; } // root: stay in the app
  stack.pop();
  show(stack[stack.length - 1]);
  return true;
}
// Saves a screen's own state into its history step, so Back to it restores what the doctor saw (e.g. back from a placeholder page).
export function saveCurrent(patch) { const top = stack[stack.length - 1]; if (top) top.params = { ...top.params, ...patch }; }
export function current() { return stack[stack.length - 1] || null; }
export function depth() { return stack.length; }
export function reset() { stack = []; }
export function attachPhoneBack() {
  addEventListener("popstate", () => { back(); });
}
