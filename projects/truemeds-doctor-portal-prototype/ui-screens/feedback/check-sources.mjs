import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
const here = dirname(fileURLToPath(import.meta.url));
const screens = join(here, '..');
const get = path => readFileSync(join(screens, path), 'utf8');
const messages = JSON.parse(readFileSync(join(here, 'messages.json'), 'utf8'));
const metadata = JSON.parse(readFileSync(join(here, 'metadata.json'), 'utf8'));
assert.deepEqual(Object.keys(messages).sort(), Object.keys(metadata).sort());
// D-81 F3: every apostrophe in the copy is curly (’), never a straight '.
for (const [id, text] of Object.entries(messages)) assert.ok(!text.includes("'"), `straight apostrophe in copy: ${id}`);
const browserContext = { window: {} };
runInNewContext(readFileSync(join(here, 'messages.js'), 'utf8'), browserContext);
const detachedMessage = browserContext.window.TMFeedback.msg;
for (const [id, template] of Object.entries(messages)) {
  const values = Object.fromEntries((metadata[id].placeholders || []).map(key => [key, key]));
  const expected = template.replace(/\{(\w+)\}/g, (_, key) => String(values[key]));
  assert.equal(detachedMessage(id, values), expected, `detached browser message: ${id}`);
}
assert.throws(() => detachedMessage('missing.id'), /Unknown feedback message/);
const sign = get('sign-in/sign-in.html');
const otp = get('otp/otp.html');
const unlock = get('returning-unlock/returning-unlock.html');
const home = get('home/home-reference.js');
for (const [name, html] of [['sign-in', sign], ['otp', otp], ['returning-unlock', unlock]]) {
  assert.match(html, /\.\.\/feedback\/messages\.js/);
  for (const ref of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (ref[1].startsWith('#') || /^https?:/.test(ref[1])) continue;
    assert.ok(existsSync(join(screens, name, ref[1])), `${name}: missing ${ref[1]}`);
  }
}
const requiredSign = ['default','keyboard-open','empty-tap','too-short','wrong-first-digit','pasted-cleaned','sending','not-registered','offline','couldnt-send','too-many-tries','inactive'];
const requiredOtp = ['default','empty-tap','too-short','verifying','wrong-code','two-tries-left','resend-available','new-code-sent','code-expired','couldnt-verify','too-many-resends','locked','resending','resend-failed','offline','cooldown-reconciling','expired-and-resend-limited']; // Round 3: all 17 OTP pictures
for (const id of requiredSign) assert.match(sign, new RegExp(`value="${id}"`));
for (const id of requiredOtp) assert.match(otp, new RegExp(`value="${id}"`));
assert.equal((otp.match(/class="tm-otp-slots__slot"/g) || []).length, 4);
assert.equal((otp.match(/id="c"/g) || []).length, 1);
assert.match(otp, /autocomplete="one-time-code"/);
assert.match(otp, /expired:true/);
assert.match(home, /state==='near-expiry'/);
assert.match(home, /state==='add-failed'/);
assert.match(home, /state==='request-failed'/);
assert.match(home, /class="tm-toast home-toast"/);
assert.match(unlock, /unlock\.unavailable/);
for (const [id, item] of Object.entries(metadata)) {
  for (const key of ['pattern','trigger','slot','next','clear','retain','copy']) assert.ok(item[key], `${id}: ${key}`);
}

// Copy rules v2.1 (docs/reviews/2026-11-03-copy-audit/COPY-RULES.md): script checks, D-84 / FIX-BRIEF MAIN-CHECK 1.
// Scope: every visible string in the 149 states (visible-strings.json, from extract-visible-strings.py) and every messages.json key.
// Allowlist = fixed names, answer buttons, approved toasts and idioms, each named with its decision.
const visible = JSON.parse(readFileSync(join(here, 'visible-strings.json'), 'utf8'));
const copyItems = [
  ...visible.map(r => ({ text: r.text, kind: r.kind, cls: r.cls, src: `state ${r.states[0]}` })),
  ...Object.entries(messages).map(([id, text]) => ({ text, kind: 'text', cls: 'messages.json', src: id })),
];
const ALLOW = new Set([
  'Callback', 'Skip HA', 'View Rx', 'Unavailable', 'Still talking', 'Call ended', 'Not now',   // fixed names and answers (rule 12, D-77 pt 1, D-66)
  'Finish this case first.', 'Then you can go back to Home.',                                  // back-blocked toast (D-77 pt 2, rule 14)
  'Call didn’t go through.',                                                                  // call.notThrough: approved shortening (D-65)
]);
const IDIOM = /\b(one touch|one time|at least one|the last one)\b/i;                                       // rule 22: idioms, not counts
const isScript = t => /^[“"]/.test(t);                                                       // spoken scripts (rule 26)
const failures = [];
const fail = (rule, item, why) => failures.push(`rule ${rule}: ${why}: "${item.text.slice(0, 70)}" [${item.src}]`);
for (const item of copyItems) {
  const t = item.text;
  if (ALLOW.has(t)) continue;
  if (/!/.test(t)) fail(4, item, 'exclamation mark');
  if (/\b(cannot|will not|do not|does not|did not|is not|are not|can not)\b/i.test(t)) fail(5, item, 'uncontracted negative');
  if (item.kind === 'text' && /^(Sending|Verifying|Confirming|Setting|Adding|Requesting|Releasing|Ending|Unlocking|Turning|Transferring|Checking|Getting|Waiting|Calling|Resending|Loading)\b/.test(t) && /\.$/.test(t)) fail(11, item, 'progress line ends with full stop');
  if (/tm-sheet__title|tm-text-title|tm-status-card__title|tm-header-(task|viewer|edit)__title|tm-section-title/.test(item.cls) && /\.$/.test(t)) fail(13, item, 'title ends with full stop');
  if (/tm-toast/.test(item.cls) && /\.$/.test(t)) fail(14, item, 'toast ends with full stop');
  if (/\bHA\b/.test(t) && !/Skip HA/.test(t)) fail(19, item, '"HA" outside Skip HA');
  if (/[—–]/.test(t) && !isScript(t)) fail(21, item, 'dash in UI text');
  if (/['"]/.test(t) && !isScript(t)) fail(21, item, 'straight apostrophe or quote');
  if (isScript(t) && /"/.test(t)) fail(21, item, 'straight double quote in script');
  if (/\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/i.test(t) && !IDIOM.test(t)) fail(22, item, 'number spelled out');
  if (/tm-btn|tm-chip|tm-field__label|tm-toast|tm-status-line|tm-section-title/.test(item.cls) && /\.$/.test(t) && !isScript(t) && t.length < 45) fail(23, item, 'fragment label ends with full stop');
}
assert.deepEqual(failures, [], `copy checks failed (${failures.length}):\n${failures.join('\n')}`);
console.log(`PASS: copy checks rules 4/5/11/13/14/19/21/22/23 over ${copyItems.length} strings; ${requiredSign.length} sign-in states, ${requiredOtp.length} OTP states, local assets, four-slot OTP, Home/unlock feedback, ${Object.keys(messages).length} registry IDs`);
