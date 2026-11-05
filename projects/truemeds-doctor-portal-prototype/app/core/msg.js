// MSG(key, values) — every fixed word comes from ui-screens/feedback/messages.json through the generated messages.js (checklist 3.1).
// Missing keys are shown as [missing: key] and recorded, so a review catches them; they never fall back to typed copy.
const missing = new Set();
export function MSG(key, values = {}) {
  const reg = (globalThis.window && window.TMFeedback) || null;
  if (!reg || typeof reg.msg !== "function") throw new Error("MSG: messages.js is not loaded");
  try {
    return reg.msg(key, values);
  } catch (e) {
    missing.add(key);
    return `[missing: ${key}]`;
  }
}
export function missingKeys() { return [...missing]; }
