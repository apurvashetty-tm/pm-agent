// Mock phone unlock (plan B14). The review panel picks the outcome; demo always succeeds.
export const UNLOCK_OUTCOMES = ["success", "cancelled", "failed", "unavailable"];
let outcome = "success";
export function setUnlockOutcome(o) { if (UNLOCK_OUTCOMES.includes(o)) outcome = o; }
export function requestUnlock(mode = "review") {
  const result = mode === "demo" ? "success" : outcome;
  return new Promise((resolve) => setTimeout(() => resolve(result), 0));
}
