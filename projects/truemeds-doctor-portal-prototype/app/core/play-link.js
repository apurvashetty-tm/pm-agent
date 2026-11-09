// Play link codec (plan v3 §4, checklist 5.12, D-89): the whole story goes into ?play=<code>. No server. Pure: tests run it in Node.
// Story v2 = every journey's answers (data/story-schema.js) + 1–3 call attempts. Decode validates every field; anything unknown → null,
// and the app opens review with a notice.
import { STORY_FIELDS, DEFAULT_STORY, CALL_KEYS, MAX_CALL_ATTEMPTS, defaultAttempt } from "../data/story-schema.js";
import { CALL_CHOICES } from "./call-sim.js";

const enc = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const dec = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4))));

export function defaultStory() { return { ...DEFAULT_STORY, calls: [defaultAttempt()] }; }

// Short link (step 1 recovery, Part A item 3): "3" + only the fields that differ from the default, each as one letter + the
// value's index. Attempts follow, each after "~", with upper-case letters for call fields. Letters and indexes are fixed by
// the order in STORY_FIELDS / CALL_KEYS: add new fields and values at the end only. Example: "3b1~K1" = Pilot HA free,
// one attempt where the patient ended the call. A default story is "3". Older base64 links (v2) still decode.
const STORY_KEYS = Object.keys(STORY_FIELDS);
const lower = (i) => String.fromCharCode(97 + i), upper = (i) => String.fromCharCode(65 + i);
export function encodeShort(story) {
  let out = "3";
  STORY_KEYS.forEach((k, i) => {
    const idx = STORY_FIELDS[k].indexOf(story[k] ?? DEFAULT_STORY[k]);
    if (idx > 0) out += lower(i) + idx;
  });
  const calls = story.calls && story.calls.length ? story.calls : [defaultAttempt()];
  const def = defaultAttempt();
  const parts = calls.map((a) => CALL_KEYS.map((k, i) => { const idx = CALL_CHOICES[k].indexOf(a[k] ?? def[k]); return idx > 0 ? upper(i) + idx : ""; }).join(""));
  if (parts.length > 1 || parts[0]) out += parts.map((p) => "~" + p).join("");
  return out;
}
function decodeShort(code) {
  const [head, ...atts] = code.slice(1).split("~");
  const story = { ...DEFAULT_STORY };
  const tok = /([a-zA-Z])(\d+)/g;
  const read = (text, keys, choices, target, base) => {
    if (text.replace(tok, "") !== "") return false;
    for (const m of text.matchAll(tok)) {
      const k = keys[m[1].charCodeAt(0) - base];
      const opts = k && choices[k];
      if (!opts || !opts[Number(m[2])]) return false;
      target[k] = opts[Number(m[2])];
    }
    return true;
  };
  if (!read(head, STORY_KEYS, STORY_FIELDS, story, 97)) return null;
  if (atts.length > MAX_CALL_ATTEMPTS) return null;
  story.calls = (atts.length ? atts : [""]).map((t) => { const a = defaultAttempt(); return read(t, CALL_KEYS, CALL_CHOICES, a, 65) ? a : null; });
  if (story.calls.some((a) => a === null)) return null;
  return story;
}

export function encodeStory(story) {
  const out = { v: 2 };
  for (const key of Object.keys(STORY_FIELDS)) out[key] = story[key] ?? DEFAULT_STORY[key];
  out.calls = (story.calls && story.calls.length ? story.calls : [defaultAttempt()]).map((a) => Object.fromEntries(CALL_KEYS.map((k) => [k, a[k]])));
  return enc(JSON.stringify(out));
}

// Returns a complete story, or null when the code can't be read or any value is not allowed.
export function decodeStory(code) {
  if (typeof code === "string" && /^3[a-zA-Z0-9~]*$/.test(code)) return decodeShort(code);
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
