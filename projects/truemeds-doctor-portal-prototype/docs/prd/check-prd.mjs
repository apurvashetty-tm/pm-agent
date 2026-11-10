#!/usr/bin/env node
// Auto checks for docs/prd/PRD.md (checklist lines marked "auto" in CHECKLIST.md).
// Run from the project folder: node docs/prd/check-prd.mjs
// Reads only frozen inputs; writes nothing.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const PROJ = path.resolve(HERE, '../..');
const prd = fs.readFileSync(path.join(HERE, 'PRD.md'), 'utf8');
const lines = prd.split('\n');
const results = [];
const check = (id, name, ok, detail = '') => results.push({ id, name, ok, detail });

// ---- split into sections by "## " headings
const sections = [];
let cur = { h: '(header)', body: [] , start: 0};
lines.forEach((l, i) => {
  if (/^## /.test(l)) { sections.push(cur); cur = { h: l.slice(3).trim(), body: [], start: i }; }
  else cur.body.push(l);
});
sections.push(cur);
const sec = (prefix) => sections.filter(s => s.h.startsWith(prefix)).map(s => s.body.join('\n')).join('\n');
const body = sections.filter(s => !s.h.startsWith('Annex C')).map(s => s.body.join('\n')).join('\n');

// 1 · sections
const expected = ['1. Executive summary', '2. The problem', "3. What we're building", '4. How it works', '5. Screen by screen',
  '6. Rules on every screen', '7. Settings', '8. User stories', '9. Scope', '10. Decided vs open', "11. How we'll know it worked",
  'Annex A.', 'Annex B.', 'Annex C.'];
const got = sections.slice(1).map(s => s.h);
const missing = expected.filter(e => !got.some(g => g.startsWith(e)));
const extra = got.filter(g => !expected.some(e => g.startsWith(e)));
check(1, 'Sections match the plan', !missing.length && !extra.length, [missing.length && 'missing: ' + missing, extra.length && 'extra: ' + extra].filter(Boolean).join('; '));

// 4 · setting values only in §7
const settingPhrases = [/\b50 ?s(ec(ond)?s?)?\b/i, /50-second/i, /₹ ?20\b/, /\b3 minutes?\b/i, /\b3-minute/i, /about 5 seconds/i, /\b15 minutes\b/i, /\b6 months\b/i];
const outside7 = [];
sections.forEach(s => {
  if (s.h.startsWith('7.') || s.h.startsWith('Annex C')) return;
  s.body.forEach((l, i) => {
    if (/^\|/.test(l) && s.h.startsWith('5.')) { /* medicine table examples may print durations */ }
    const clean = l.replace(/`[^`]*`/g, '');
    settingPhrases.forEach(rx => { if (rx.test(clean)) outside7.push(`${s.h.slice(0, 12)} L${s.start + i + 2}: ${clean.trim().slice(0, 80)}`); });
  });
});
check(4, 'Setting values appear only in §7', !outside7.length, outside7.join('\n      '));

// 5 · banned words and AI tells
const banned = ['leverage', 'robust', 'scalable', 'seamless', 'delve', 'landscape', 'synergy', 'streamline', 'cutting-edge', 'holistic', 'empower', 'unlock', 'game-changer',
  'essentially', 'in order to', "it's worth noting", 'at the end of the day', 'this section describes', 'below we outline'];
const bannedHits = [];
lines.forEach((l, i) => {
  const t = l.toLowerCase().replace(/`[^`]*`/g, '').replace(/\(\.\.\/[^)]*\)/g, '');
  banned.forEach(w => {
    if (w === 'unlock') {
      // "unlock" is a product word here (Returning unlock, phone unlock). Flag only the marketing sense.
      if (/unlock (the )?(value|potential|growth)/.test(t)) bannedHits.push(`L${i + 1}: ${w}`);
    } else if (t.includes(w)) bannedHits.push(`L${i + 1}: ${w}`);
  });
});
check(5, 'No banned words or AI-tell phrases', !bannedHits.length, bannedHits.join(', '));

// 6 · no decision ids / walkthrough ids / rejected options in body
const idHits = [];
lines.forEach((l, i) => { if (/\bD-\d{2}\b|\bCW-[A-F]\d\b|\bRejected\b|\bwe considered\b/i.test(l)) idHits.push(`L${i + 1}`); });
check(6, 'No decision ids or rejected options in the body', !idHits.length, idHits.join(', '));

// 8 · "order" — list for eye review (customer order is allowed)
const orderLines = [];
lines.forEach((l, i) => {
  const t = l.replace(/`[^`]*`/g, '');
  if (/\border(s)?\b/i.test(t)) orderLines.push(`L${i + 1}: ${t.trim().slice(0, 90)}`);
});
check('8*', '"order" occurrences (eye: each must mean the customer\'s order)', true, orderLines.join('\n      '));

// 10 · partner names only in §3 and §10
const partnerHits = [];
sections.forEach(s => {
  if (s.h.startsWith('3.') || s.h.startsWith('10.')) return;
  s.body.forEach((l, i) => { if (/Knowlarity|Ozonetel/.test(l)) partnerHits.push(`${s.h.slice(0, 10)} L${s.start + i + 2}`); });
});
check(10, 'Partner names only in §3 and vendor questions (§10)', !partnerHits.length, partnerHits.join(', '));

// 11 · quoted on-screen copy is verbatim (sections 5 and 6)
const msgs = [];
(function walk(o) { if (typeof o === 'string') msgs.push(o); else if (o && typeof o === 'object') Object.values(o).forEach(walk); })(
  JSON.parse(fs.readFileSync(path.join(PROJ, 'ui-screens/feedback/messages.json'), 'utf8')));
const visible = JSON.parse(fs.readFileSync(path.join(PROJ, 'ui-screens/feedback/visible-strings.json'), 'utf8')).map(e => e.text);
const norm = s => s.trim().replace(/\s+/g, ' ');
const msgRx = msgs.map(m => new RegExp('^' + norm(m).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\{[a-zA-Z]+\\\}/g, '.+') + '$'));
const known = new Set(visible.map(norm).concat(msgs.map(norm)));
// A quote with {placeholders} also matches the pictures' text with real values filled in (e.g. "Try again in 9:42").
const phRx = q => new RegExp('^' + norm(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\{[a-zA-Z]+\\\}/g, '.+') + '$');
const isKnown = q => known.has(norm(q)) || msgRx.some(rx => rx.test(norm(q))) || (/\{[a-zA-Z]+\}/.test(q) && visible.some(v => phRx(q).test(norm(v))));
const quoteFails = [];
let quoteCount = 0;
sections.filter(s => s.h.startsWith('5.') || s.h.startsWith('6.')).forEach(s => {
  s.body.forEach((l, i) => {
    const t = l.replace(/`[^`]*`/g, '');
    for (const m of t.matchAll(/"([^"]+)"/g)) { quoteCount++; if (!isKnown(m[1]) && !isKnown(m[1].replace(/[.…]$/, ''))) quoteFails.push(`L${s.start + i + 2}: "${m[1]}"`); }
    for (const m of t.matchAll(/“[^”]+”/g)) { quoteCount++; if (!isKnown(m[0])) quoteFails.push(`L${s.start + i + 2}: ${m[0]}`); }
  });
});
check(11, `Quoted copy is verbatim (${quoteCount} quotes)`, !quoteFails.length, quoteFails.join('\n      '));

// 12 · picture and file links exist
const linkFails = [];
let linkCount = 0;
for (const m of prd.matchAll(/\]\((\.\.?\/[^)\s]+)\)/g)) {
  linkCount++;
  const p = path.resolve(HERE, m[1].split('#')[0]);
  if (!fs.existsSync(p)) linkFails.push(m[1]);
}
check(12, `Local links and pictures exist (${linkCount})`, !linkFails.length, linkFails.join(', '));

// 14 · version-A pictures only in Annex A
const aHits = [];
sections.forEach(s => { if (s.h.startsWith('Annex A')) return; s.body.forEach((l, i) => { if (/t11-|t12-|t08b-/.test(l)) aHits.push(`L${s.start + i + 2}`); }); });
check(14, 'Version-A screens only in Annex A', !aHits.length, aHits.join(', '));

// 15 · no list of calling states in 5.7 / 5.8
const callSecs = sections.filter(s => /^5\.[78] /.test(s.h)).map(s => s.body.join('\n')).join('\n');
const sub = prd.split(/^### /m).filter(b => /^5\.[78] /.test(b)).join('\n');
check(15, 'Calling sections link the flow page, no state list', !/\*\*Other states/.test(sub) && (sub.match(/calling-flow/g) || []).length >= 2);

// 16 · open questions present
const oqText = fs.readFileSync(path.join(PROJ, 'docs/context/open_questions.md'), 'utf8');
const oqBlocks = oqText.split(/^### /m).slice(1);
const openOq = [];
oqBlocks.forEach(b => {
  const id = (b.match(/^OQ-\d+/) || [])[0]; if (!id) return;
  const head = b.split('\n')[0];
  const answered = /ANSWERED|CLOSED|prototype only/.test(head) || /\*\*Status:\*\*\s*Answered/i.test(b) || /Answered by D-/.test(b);
  if (!answered) openOq.push(id);
});
const tenAndNine = sec('10.') + sec('9.');
const oqMissing = openOq.filter(id => !tenAndNine.includes(id) && !prd.includes(id));
const engItems = { 'Knowlarity call-ended event': /call-ended event/, 'hangup-cause mapping': /failure codes/, 'Pilot partner': /Which partner carries Pilot/, 'mismatch table': /unproven confirms are logged/, 'callback refusal (rule)': /refuses a callback unless the patient answered/ };
const engMissing = Object.entries(engItems).filter(([, rx]) => !rx.test(prd)).map(([k]) => k);
// OQs deliberately named out of scope in §9 without their id
const outByText = { 'OQ-015': /per-medicine detail view/i, 'OQ-028': /pushed to doctors/i, 'OQ-016': /keep checking for a case/i, 'OQ-021': /Sign-up link, Terms/ };
const oqStill = oqMissing.filter(id => !(outByText[id] && outByText[id].test(prd)));
check(16, `Open questions covered (${openOq.length} open: ${openOq.join(' ')})`, !oqStill.length && !engMissing.length, [oqStill.length && 'missing: ' + oqStill.join(' '), engMissing.length && 'engineering items missing: ' + engMissing].filter(Boolean).join('; '));

// 17 · no prototype-only values
const protoRx = [/90000000\d\d/, /\bOTP (1234|0000|9999)\b/, /\b35:00\b/, /₹ ?60/, /\bKunal\b/, /\bdemo mode\b/i, /\bscenario switcher\b/i, /fast-forward/i];
const protoHits = [];
lines.forEach((l, i) => protoRx.forEach(rx => { if (rx.test(l)) protoHits.push(`L${i + 1}`); }));
check(17, 'No prototype-only values', !protoHits.length, protoHits.join(', '));

// 18 · state numbers only in captions
const stateHits = [];
lines.forEach((l, i) => {
  if (/^\*.*\(`[^`]+`.*\)\*$/.test(l.trim())) return; // caption line
  const t = l.replace(/`[^`]*`/g, '').replace(/\]\([^)]*\)/g, ']');
  if (/\bstate (\d+[a-f]?|B\d)\b|\b(?:[1-9]|1[0-7])[a-f]\b|\bB[1-3]\b/.test(t)) stateHits.push(`L${i + 1}: ${t.trim().slice(0, 70)}`);
});
check(18, 'State numbers only in captions', !stateHits.length, stateHits.join('\n      '));

// 19 · every screen block, led by its job
const blocks = prd.split(/^### /m).slice(1).filter(b => /^5\.\d+ /.test(b));
const screenNames = ['5.1 Sign-in', '5.2 OTP', '5.3 Faster sign-in offer', '5.4 Returning unlock', '5.5 Home', '5.6 Case page', '5.7 Calling', '5.8 Calling', '5.9 Ending', '5.10 Prescribe', '5.11 Rx viewer'];
const blockFails = screenNames.filter(n => { const b = blocks.find(x => x.startsWith(n)); return !b || !/^[^\n]*\n\n\*\*Job to be done:\*\*/.test(b) || !/\*\*Built this way because:\*\*/.test(b) || !/!\[[^\]]*\]\([^)]+_w390\.png\)/.test(b); });
check(19, 'Every screen block: job first, built-this-way, one picture', !blockFails.length, blockFails.join(', '));
const picCounts = blocks.map(b => [b.split('\n')[0], (b.match(/!\[/g) || []).length]).filter(([, n]) => n !== 1);
check('19b', 'Exactly one picture per screen block', !picCounts.length, picCounts.map(([h, n]) => `${h}: ${n}`).join(', '));

// 21 · every state maps to a section
const states = [];
(function walk(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) {
  if (f.isDirectory() && !f.name.startsWith('_')) walk(path.join(d, f.name));
  else if (f.name.endsWith('_w390.png')) states.push(f.name.replace('_w390.png', ''));
} })(path.join(PROJ, 'ui-screens'));
const map = s => {
  if (/^sign-in_/.test(s)) return '5.1'; if (/^otp_/.test(s)) return '5.2'; if (/^offer_/.test(s)) return '5.3'; if (/^unlock_/.test(s)) return '5.4';
  if (/^home_/.test(s) || s === 'e-availability-ended') return '5.5';
  if (/^(t11|t12|t08b)-/.test(s)) return 'A';
  if (/^d-/.test(s)) return '5.10';
  if (['a-rx-viewer', 'a-notes-typing'].includes(s)) return '5.11';
  if (/^c-callback/.test(s) || ['e-callback-scheduled', 't09-patient-unavailable', 's7d-unavailable-sheet'].includes(s)) return '5.9';
  if (/^(g\d|t1[3-7]|t10b)/.test(s) || s === 'c-skip-ha') return '5.8';
  if (['t01-ready', 'a-top', 'a-scrolled', 'a-long-content', 'a-order-details', 'a-loading', 'a-load-failed', 'a-no-medicines', 'a-offline', 'a-offline-action', 'a-leave-sheet', 's7e-leave-sheet', 'a-releasing', 'a-release-failed', 'a-back-blocked'].includes(s) || /^s-/.test(s)) return '5.6';
  if (/^(t0[2-8]|t10a|s7[a-f])/.test(s) || ['a-confirm-busy', 'a-confirm-failed'].includes(s)) return '5.7';
  return null;
};
const unmapped = states.filter(s => !map(s));
check(21, `Every state maps to a section (${states.length} states)`, states.length >= 148 && !unmapped.length, unmapped.join(', ') || (states.length !== 148 ? `found ${states.length}` : ''));

// 28 · ui-screens untouched (app/ belongs to the build thread)
let gitOut = '';
try { gitOut = execSync('git status --porcelain -- ui-screens docs/prd', { cwd: PROJ }).toString(); } catch (e) { gitOut = 'git error: ' + e.message; }
// The build thread works in the same folder, so other changes under ui-screens/ may be theirs.
// This line only lists them; the PRD thread's own writes are checked by eye (CHECKLIST line 28).
const uiChanged = gitOut.split('\n').filter(l => l && !l.includes('docs/prd'));
check('28*', `ui-screens/ changes in the folder (info: ${uiChanged.length}, not written by the PRD thread)`, true, uiChanged.length ? uiChanged.length + ' files, e.g. ' + uiChanged.slice(0, 2).join('; ') : '');

// ---- report
let fail = 0;
for (const r of results) {
  if (!r.ok) fail++;
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${String(r.id).padEnd(4)} ${r.name}${r.detail ? '\n      ' + r.detail : ''}`);
}
console.log(`\n${results.length - fail}/${results.length} passed`);
process.exit(fail ? 1 : 0);
