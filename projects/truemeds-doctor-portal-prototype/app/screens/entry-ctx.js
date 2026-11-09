// Shared plumbing for the entry screens: the auth context (clock, settings for the mode, session storage, the live story)
// and a render "life" so timers and late server answers never touch a screen the doctor has left.
import { clock } from "../core/clock.js";
import { value } from "../core/settings.js";
import { storageFor } from "../core/storage.js";
import { store } from "../core/store.js";

export function authCtx(mode) {
  const st = store.get();
  return {
    now: () => clock.now(),
    value: (k) => value(k, mode),
    db: storageFor(mode),
    story: st.story || {},
    offline: st.offline === "yes",
  };
}

let renderSeq = 0;
// One life per render. `alive()` is false once another screen (or another render of this one) has taken the host.
export function newLife(host, mode) {
  const id = ++renderSeq;
  host.dataset.life = String(id);
  const timers = [];
  const alive = () => host.dataset.life === String(id) && host.isConnected;
  return {
    alive,
    // A simulated server answer: runs after mockServerDelay, only if the screen is still showing.
    later(fn, key = "mockServerDelay") { const t = setTimeout(() => { if (alive()) fn(); }, value(key, mode)); timers.push(t); },
    // A ticker for countdowns (reads the app clock each time; never counts ticks). Stops itself when the screen goes.
    every(fn, ms = 250) { const t = setInterval(() => { if (!alive()) { clearInterval(t); return; } fn(); }, ms); timers.push(t); },
  };
}
