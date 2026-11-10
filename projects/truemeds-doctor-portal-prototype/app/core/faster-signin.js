// Faster sign-in on this phone (app-logic §2 "Faster sign-in", D-45, D-47, D-64; plan B12). Pure logic: the storage, the story
// and the mode come in through ctx (entry-ctx authCtx), so Node tests run it too.
// Remembered per mobile number in the mode's storage: "offerCount" (how many times the offer was shown, D-104), "turnedOn" (faster
// sign-in was turned on at some point: the offer never comes back) and "enabled" (unlock on the next open).
import { deviceOf } from "./unlock.js";
import { value } from "./settings.js";

// Home is built in step 2; until then "→ Home" lands on its first approved state (the stub, plan §5 step 1).
export const HOME_STUB = "home_setup-wheel";
const OFFER_STATE = { fingerprint: "offer_fingerprint", face: "offer_face-id", "screen-lock": "offer_screen-lock" };
const UNLOCK_STATE = { fingerprint: "unlock_fingerprint", face: "unlock_face", "screen-lock": "unlock_screen-lock" };

const key = (n) => `faster:${n}`;
// Stored before D-104 as `offered: true` (shown once) → reads as a count of 1; an old enabled record reads as turned on.
export function fasterState(n, ctx) {
  const { offered, ...st } = ctx.db.get(key(n)) || {};
  const out = { offerCount: 0, turnedOn: false, enabled: false, ...st };
  if (offered && !st.offerCount) out.offerCount = 1;
  if (out.enabled) out.turnedOn = true;
  return out;
}
function put(n, ctx, patch) { ctx.db.set(key(n), { ...fasterState(n, ctx), ...patch }); }
// One showing of the offer (D-104: counts toward fasterOfferMax; "not available on this phone" counts too).
export function markOffered(n, ctx) { put(n, ctx, { offerCount: fasterState(n, ctx).offerCount + 1 }); }
// The method turned on is stored as a record; the next open asks for what the phone can do then (unlockState).
// Turned on once → the offer never comes back, even if Profile turns it off later (D-104 "until it's turned on").
export function setEnabled(n, ctx, on) { put(n, ctx, { enabled: !!on, ...(on ? { turnedOn: true } : {}), method: on ? deviceOf(ctx.story, ctx.mode) : null }); }

// The offer's look follows the phone (D-64): fingerprint or face if set up, otherwise the phone's screen lock.
export function offerState(ctx) { return OFFER_STATE[deviceOf(ctx.story, ctx.mode)] || null; }
// Returning unlock follows what the phone can do now (D-64): fingerprint or face if set up, else its screen lock; unavailable if
// it has no screen lock any more or the story says the prompt is unavailable. (The method turned on is kept only as a record.)
export function unlockState(ctx) {
  const d = deviceOf(ctx.story, ctx.mode);
  if (d === "none" || (ctx.mode !== "demo" && ctx.story.unlock === "unavailable")) return "unlock_unavailable";
  return UNLOCK_STATE[d];
}

// After a successful OTP sign-in: the offer, on a phone that has a screen lock, while faster sign-in has never been turned on and
// the offer has been shown fewer than fasterOfferMax times (D-104: at each OTP sign-in, at most 3 in total); else Home.
// No screen lock at all → the offer is skipped and not counted (offer.unsupported, D-64).
export function afterSignIn(n, ctx) {
  if (deviceOf(ctx.story, ctx.mode) === "none") return HOME_STUB;
  const f = fasterState(n, ctx);
  if (f.enabled || f.turnedOn || f.offerCount >= value("fasterOfferMax", ctx.mode)) return HOME_STUB;
  return offerState(ctx);
}

// Opening the app: a remembered doctor with faster sign-in on → returning unlock; remembered without it → Home (the session
// stays signed in, B12); nobody remembered → null (sign-in).
export function onOpen(ctx) {
  const a = ctx.db.get("auth");
  if (!a || !a.number) return null;
  return fasterState(a.number, ctx).enabled ? unlockState(ctx) : HOME_STUB;
}
