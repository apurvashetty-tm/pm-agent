// Faster sign-in on this phone (app-logic §2 "Faster sign-in", D-45, D-47, D-64; plan B12). Pure logic: the storage, the story
// and the mode come in through ctx (entry-ctx authCtx), so Node tests run it too.
// Remembered per mobile number in the mode's storage: "offered" (the offer is shown once) and "enabled" (unlock on the next open).
import { deviceOf } from "./unlock.js";

// Home is built in step 2; until then "→ Home" lands on its first approved state (the stub, plan §5 step 1).
export const HOME_STUB = "home_setup-wheel";
const OFFER_STATE = { fingerprint: "offer_fingerprint", face: "offer_face-id", "screen-lock": "offer_screen-lock" };
const UNLOCK_STATE = { fingerprint: "unlock_fingerprint", face: "unlock_face", "screen-lock": "unlock_screen-lock" };

const key = (n) => `faster:${n}`;
export function fasterState(n, ctx) { return { offered: false, enabled: false, ...(ctx.db.get(key(n)) || {}) }; }
function put(n, ctx, patch) { ctx.db.set(key(n), { ...fasterState(n, ctx), ...patch }); }
export function markOffered(n, ctx) { put(n, ctx, { offered: true }); }
// The method turned on (fingerprint / face / screen lock) is remembered with it: the next open asks for that method.
export function setEnabled(n, ctx, on) { put(n, ctx, { offered: true, enabled: !!on, method: on ? deviceOf(ctx.story, ctx.mode) : null }); }

// The offer's look follows the phone (D-64): fingerprint or face if set up, otherwise the phone's screen lock.
export function offerState(ctx) { return OFFER_STATE[deviceOf(ctx.story, ctx.mode)] || null; }
// Returning unlock: the method turned on (else what the phone has); unavailable if the phone has no screen lock any more or the
// story says the prompt is unavailable.
export function unlockState(ctx, method = null) {
  const d = deviceOf(ctx.story, ctx.mode);
  if (d === "none" || (ctx.mode !== "demo" && ctx.story.unlock === "unavailable")) return "unlock_unavailable";
  return UNLOCK_STATE[method] || UNLOCK_STATE[d];
}

// After a successful OTP sign-in: the offer, once, on a phone that has a screen lock and has faster sign-in off; else Home.
// No screen lock at all → the offer is skipped (offer.unsupported, D-64).
export function afterSignIn(n, ctx) {
  if (deviceOf(ctx.story, ctx.mode) === "none") return HOME_STUB;
  const f = fasterState(n, ctx);
  return f.enabled || f.offered ? HOME_STUB : offerState(ctx);
}

// Opening the app: a remembered doctor with faster sign-in on → returning unlock; remembered without it → Home (the session
// stays signed in, B12); nobody remembered → null (sign-in).
export function onOpen(ctx) {
  const a = ctx.db.get("auth");
  if (!a || !a.number) return null;
  const f = fasterState(a.number, ctx);
  return f.enabled ? unlockState(ctx, f.method) : HOME_STUB;
}
