// Scans app/ for: hard-coded settings (checklist 3.2), hex colours (3.4), emoji (3.4 / RULES), phone-number patterns (6.4).
// Excludes vendored and shared files (design-system, feedback, state-map, vendor QR, pictures), and the drawing of the phone's own
// keyboard (shell/mock-keyboard.css: raw colours as in the approved pictures; not app UI) — the same exemption as the mock Rx paper.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../app");
const SKIP = [/shell\/mock-keyboard\.css$/, /screens\/rx-paper\.css$/, /design-system/, /feedback/, /pictures/, /icons/, /vendor/, /state-map\.js$/, /core\/settings\.js$/, /data\/test-numbers\.js$/, /data\/scenarios\.js$/];
const fails = [];
function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
const files = walk(ROOT).filter((f) => /\.(js|css|html|webmanifest)$/.test(f) && !SKIP.some((r) => r.test(f)));
const HARD = /\b(50000|180000|600000|900000|1800000|120000|30000|60000|3000|10000)\b/;
const HEX = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/;
const EMOJI = /\p{Extended_Pictographic}/u;
const PHONE = /(?<!\d)[6-9]\d{9}(?!\d)/g;
const ALLOW_PHONE = new Set(["9000000001", "9000000002", "9000000003", "9000000004", "9000000005"]);
let checked = 0;
for (const f of files) {
  const rel = path.relative(ROOT, f);
  const lines = fs.readFileSync(f, "utf8").split("\n");
  lines.forEach((line, i) => {
    checked++;
    if (HARD.test(line) && !line.trim().startsWith("//") && !line.includes("ref:")) fails.push(`3.2 hard-coded time value in ${rel}:${i + 1}: ${line.trim().slice(0, 100)}`);
    const colourExempt = /theme-color|background_color|theme_color/.test(line); // install metadata: must equal --tm-surface-primary (#FFFFFF)
    if (HEX.test(line) && !colourExempt && !/^\s*\/\*|^\s*\/\//.test(line)) fails.push(`3.4 hex colour in ${rel}:${i + 1}`);
    if (EMOJI.test(line)) fails.push(`3.4 emoji in ${rel}:${i + 1}`);
    for (const m of line.matchAll(PHONE)) if (!ALLOW_PHONE.has(m[0])) fails.push(`6.4 phone-number pattern in ${rel}:${i + 1}: ${m[0]}`);
  });
}
console.log(`scan: ${files.length} files, ${checked} lines checked`);
console.log(fails.length ? fails.join("\n") + `\nFAIL ${fails.length}` : "PASS — 0 scan failures");
process.exit(fails.length ? 1 : 0);
