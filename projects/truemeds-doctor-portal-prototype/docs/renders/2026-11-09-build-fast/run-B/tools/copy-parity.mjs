// Run B, step 8 (plan v3.2 §5): copy parity with native. The registry (ui-screens/feedback/messages.json) is the one source; the
// web copy (ui-screens/feedback/messages.js, copied to app/feedback/messages.js) and the native copy (ui-screens/native/messages.ts)
// must hold exactly the same keys and strings. Run from the project folder: node docs/renders/2026-11-09-build-fast/run-B/tools/copy-parity.mjs
import fs from "node:fs";
const src = JSON.parse(fs.readFileSync("ui-screens/feedback/messages.json", "utf8"));
const objectAfter = (text, marker) => { const at = text.indexOf(marker) + marker.length; const start = text.indexOf("{", at); let depth = 0;
  for (let i = start; i < text.length; i++) { if (text[i] === "{") depth++; else if (text[i] === "}" && --depth === 0) return JSON.parse(text.slice(start, i + 1)); } return null; };
const files = { "ui-screens/feedback/messages.js": "Object.freeze(", "app/feedback/messages.js": "Object.freeze(", "ui-screens/native/messages.ts": "export const messages =" };
let bad = 0;
for (const [file, marker] of Object.entries(files)) {
  const got = objectAfter(fs.readFileSync(file, "utf8"), marker);
  const missing = Object.keys(src).filter((k) => !(k in got)), extra = Object.keys(got).filter((k) => !(k in src));
  const differ = Object.keys(src).filter((k) => k in got && got[k] !== src[k]);
  const ok = !missing.length && !extra.length && !differ.length;
  if (!ok) bad++;
  console.log(`${ok ? "PASS" : "FAIL"} ${file}: ${Object.keys(got).length} keys (registry ${Object.keys(src).length})${missing.length ? " missing " + missing.join(",") : ""}${extra.length ? " extra " + extra.join(",") : ""}${differ.length ? " differ " + differ.join(",") : ""}`);
}
process.exitCode = bad ? 1 : 0;
