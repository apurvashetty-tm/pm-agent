// Modes (plan v3 §4): review (bare link) · demo (?demo=1, and always the installed app) · capture (?capture=1) · play (?play=<code>).
// Pure: takes the query string and whether the app runs installed (standalone). Unit-tested in tests/.
export const MODES = ["review", "demo", "capture", "play"];

export function resolveMode(search, { standalone = false } = {}) {
  const p = new URLSearchParams(search || "");
  const s = p.get("s") || null;
  const w = p.get("w") === "360" ? 360 : 390;
  if (standalone) return { mode: "demo", installed: true, s: null, w: 390, play: null }; // installed app ignores review / capture settings
  if (p.has("play")) return { mode: "play", installed: false, s, w, play: p.get("play") };
  if (p.get("capture") === "1") return { mode: "capture", installed: false, s, w, play: null };
  if (p.get("demo") === "1") return { mode: "demo", installed: false, s: null, w: 390, play: null };
  return { mode: "review", installed: false, s, w, play: null };
}
