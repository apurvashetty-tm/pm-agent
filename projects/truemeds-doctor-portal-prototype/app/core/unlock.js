// Mock phone (plan B14). A browser can't use the phone's own unlock, so the review story says what the phone has and how its
// prompt answers: `device` (fingerprint · face · screen lock only · no screen lock), `offer` (the prompt on the faster sign-in
// offer) and `unlock` (the prompt on returning unlock). The story is read at the moment the prompt answers, so a panel change
// applies to the running journey. Demo always succeeds (plan B14).
export const DEVICES = ["fingerprint", "face", "screen-lock", "none"];
export const UNLOCK_OUTCOMES = ["success", "cancelled", "failed", "unavailable"];
export const ENABLE_OUTCOMES = ["enabled", "cancelled", "enable-failed", "unavailable"];
let outcome = "success";
export function setUnlockOutcome(o) { if (UNLOCK_OUTCOMES.includes(o)) outcome = o; }
export function requestUnlock(mode = "review") {
  const result = mode === "demo" ? "success" : outcome;
  return new Promise((resolve) => setTimeout(() => resolve(result), 0));
}
// What the phone has. Demo: a fingerprint phone.
export function deviceOf(story = {}, mode = "review") { return mode !== "demo" && DEVICES.includes(story.device) ? story.device : "fingerprint"; }
// The prompt's answer: "enable" on the offer (and later the Profile switch), "unlock" on returning unlock.
export function promptAnswer(kind, story = {}, mode = "review") {
  if (kind === "enable") return mode !== "demo" && ENABLE_OUTCOMES.includes(story.offer) ? story.offer : "enabled";
  return mode !== "demo" && UNLOCK_OUTCOMES.includes(story.unlock) ? story.unlock : "success";
}
