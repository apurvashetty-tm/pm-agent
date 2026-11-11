// Dry-run table for REPORT.md: every measured gap, with what D-108 says about it.
// node docs/renders/2026-11-11-r1-rules/tools/table.mjs > docs/renders/2026-11-11-r1-rules/dry-run/table.md
import { readFileSync } from 'node:fs';
const rep = JSON.parse(readFileSync(new URL('../dry-run/visible-gaps.json', import.meta.url)));
// D-108 "Applied" list and the named examples in the brief. Anything else is a consequence of the visible rule.
const NAMED = [
  [/^sign-in/, /SMS/, /Send OTP/, 'D-108: field + helper → 32 → Send OTP (today 16)'],
  [/^sign-in/, /Couldn/, /Send OTP/, 'D-108: error 32 above Send OTP'],
  [/^sign-in/, /\+91/, /Couldn/, 'D-108: error 16 under the field'],
  [/^otp/, /tm-otp-slots|^\d|Wrong/, /Didn/, 'D-108: boxes (+ message line) → 32 → Resend'],
  [/^otp/, /Didn/, /By selecting/, 'D-108: Resend → 32 → legal'],
  [/^otp/, /By selecting/, /Verify/, 'D-108: legal → 8 → Verify'],
  [/^otp/, /tm-otp-slots/, /Too many|expired/, 'D-108: boxes → 16 → notice'],
  [/^otp/, /Too many|expired/, /Verify/, 'D-108: notice → 32 → Verify'],
  [/^offer/, /hero-ic/, /./, 'D-108: offer hero → 32 → points'],
  [/^offer/, /OTP\.|stores it/, /./, 'D-108: points 16 apart'],
  [/^unlock/, /prompt-icon/, /Ready/, 'D-108: unlock tile → 16 → caption'],
  [/./, /./, /./, null],
];
const lines = ['| Screen | Size | Region | Gap (above → below) | Visible px | Expected | Result | D-108 |', '|---|---|---|---|---|---|---|---|'];
for (const p of rep.pages) {
  const size = p.name.includes('@') ? (p.name.endsWith('360') ? '360x640' : '390x844') : p.size;
  const screen = p.name.replace(/@\d+$/, '');
  for (const r of p.regions) for (const g of r.gaps) {
    const named = NAMED.find(([s, a, b]) => s.test(screen) && a.test(g.above) && b.test(g.below))[3];
    const why = named || (g.rule === 'edge' ? 'consequence: panel content starts 32 (visible)' : g.rule === 'anatomy' ? `anatomy: ${g.note}` : g.pass ? '—' : `consequence: ${g.note || 'on the 8 / 16 / 32 scale'}`);
    const cut = s => String(s).replace(/\|/g, '/').slice(0, 34);
    lines.push(`| ${screen} | ${size} | ${r.name} | ${cut(g.above)} → ${cut(g.below)} | ${g.px}${g.boxPx !== undefined ? ` (box ${g.boxPx})` : ''} | ${g.expected ?? '—'} | ${g.pass ? 'pass' : '**FAIL**'} | ${why} |`);
  }
}
console.log(lines.join('\n'));
