// Shell state (one object, subscribe to changes). Review state lives here; the screens will read it in later steps.
const state = { mode: "review", s: null, w: 390, offline: false, scenario: "cat4", unlock: "success", call: {}, log: [] };
const subs = new Set();
export const store = {
  get: () => state,
  set(patch) { Object.assign(state, patch); subs.forEach((f) => f(state)); },
  log(text) {
    const t = new Date(globalThis.__tmNow ? globalThis.__tmNow() : Date.now());
    state.log = [...state.log.slice(-49), `${t.toTimeString().slice(0, 8)}  ${text}`];
    subs.forEach((f) => f(state));
  },
  subscribe(f) { subs.add(f); return () => subs.delete(f); },
  reset() { state.scenario = "cat4"; state.unlock = "success"; state.offline = false; state.call = {}; state.s = null; state.log = []; subs.forEach((f) => f(state)); },
};
