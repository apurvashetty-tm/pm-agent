// Play link codec (plan v3 §4, checklist 5.12, D-89): the whole story goes into ?play=<code>. No server. Pure: tests run it in Node.
// Story v2 = every journey's answers (data/story-schema.js) + 1–3 call attempts. Decode validates every field; anything unknown → null,
// and the app opens review with a notice.
import { STORY_FIELDS, DEFAULT_STORY, CALL_KEYS, MAX_CALL_ATTEMPTS, defaultAttempt } from "../data/story-schema.js";
import { CALL_CHOICES } from "./call-sim.js";

const enc = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const dec = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4))));

export function defaultStory() { return { ...DEFAULT_STORY, calls: [defaultAttempt()] }; }

export function encodeStory(story) {
  const out = { v: 2 };
  for (const key of Object.keys(STORY_FIELDS)) out[key] = story[key] ?? DEFAULT_STORY[key];
  out.calls = (story.calls && story.calls.length ? story.calls : [defaultAttempt()]).map((a) => Object.fromEntries(CALL_KEYS.map((k) => [k, a[k]])));
  return enc(JSON.stringify(out));
}

// Returns a complete story, or null when the code can't be read or any value is not allowed.
export function decodeStory(code) {
  try {
    const o = JSON.parse(dec(code));
    if (!o || o.v !== 2) return null;
    const story = { v: 2 };
    for (const [key, options] of Object.entries(STORY_FIELDS)) {
      if (!(key in o) && key === "device") { story[key] = DEFAULT_STORY[key]; continue; }   // links made before the field existed
      if (!options.includes(o[key])) return null;
      story[key] = o[key];
    }
    if (!Array.isArray(o.calls) || o.calls.length < 1 || o.calls.length > MAX_CALL_ATTEMPTS) return null;
    story.calls = o.calls.map((a) => {
      if (!a || typeof a !== "object") return null;
      const att = {};
      for (const k of CALL_KEYS) { if (!CALL_CHOICES[k].includes(a[k])) return null; att[k] = a[k]; }
      if (Object.keys(a).length !== CALL_KEYS.length) return null;
      return att;
    });
    if (story.calls.some((a) => a === null)) return null;
    return story;
  } catch (e) {
    return null;
  }
}
