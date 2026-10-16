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
const requiredOtp = ['default','empty-tap','too-short','verifying','wrong-code','two-tries-left','resend-available','new-code-sent','code-expired','couldnt-verify','too-many-resends','locked'];
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
console.log(`PASS: ${requiredSign.length} sign-in states, ${requiredOtp.length} OTP states, local assets, four-slot OTP, Home/unlock feedback, ${Object.keys(messages).length} registry IDs`);
