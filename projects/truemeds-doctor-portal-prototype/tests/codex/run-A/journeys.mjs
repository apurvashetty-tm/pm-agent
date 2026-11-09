import { run, addressing, assert, ms, copy } from './harness.mjs';
const cases = [];
const add = (id, name, state, lines, test, fields = {}) => cases.push({ id, name, state, source: `ui-screens/app-logic.md:${lines}`, test, fields });
const finals = ['Confirm prescription', 'Confirm & transfer', 'Confirm & forward', 'Skip HA'];
add('A-H01', 'availability starts only on confirmation, then requests a case', 'home_setup-wheel', '64-66', async d => {
  await d.click('30 min'); await d.buttons(['Set availability'], ['Request a case']);
  await d.click('Set availability'); await d.settle(); await d.buttons(['Request a case']);
  await d.click('Request a case'); await d.settle(); await d.buttons(['Call patient']);
});
add('A-H02', 'request failure stays on Home and retry succeeds', 'home_active', '66-73', async d => {
  await d.choose('request', 'failed'); await d.click('Request a case'); await d.settle(); await d.msg('home.requestFailed');
  await d.choose('request', 'accepted'); await d.click('Request a case'); await d.settle(); await d.buttons(['Call patient']);
});
add('A-H03', 'no cases preserves availability and allows manual retry', 'home_active', '66-73', async d => {
  await d.choose('request', 'no-cases'); await d.click('Request a case'); await d.settle(); await d.msg('home.noCases');
  await d.buttons(['Request a case']); await d.ff(ms('pollingInterval') * 2); await d.msg('home.noCases');
});
add('A-H04', 'Home offline blocks request and End availability', 'home_offline', '60,66,270', async d => {
  await d.msg('home.offline'); assert.ok(await d.button('End availability').isDisabled());
  const b = d.button('Request a case'); if (await b.isEnabled()) { await d.click('Request a case'); await d.settle(); await d.msg('home.offline'); }
  await d.buttons([], ['Call patient']);
});
add('A-H05', 'near expiry adds selected time and dismisses sheet', 'home_near-expiry', '65-67', async d => {
  await d.msg('home.endingSoon'); await d.click('+ Add time'); await d.click('15 min');
  const confirm = d.root().locator('.tm-sheet:visible [data-confirm]'); await confirm.click(); await d.settle();
  await d.msg('home.added'); assert.equal(await d.root().locator('.tm-sheet:visible').count(), 0);
});
add('A-H06', 'failed add retains duration; closing does not add time', 'home_add-failed', '67; docs/feedback-state-map.md:123', async d => {
  await d.msg('home.addFailed'); const selected = await d.root().locator('.tm-sheet:visible [aria-pressed=true]').allTextContents();
  assert.ok(selected.length, 'Selection retained'); await d.closeSheet(); await d.ff(ms('nearExpiryWarning'));
  await d.msg('home.idleExpired');
});
add('A-H07', 'cancel end keeps availability; confirm end returns to setup', 'home_active', '68', async d => {
  await d.click('End availability'); await d.click('Keep available'); await d.buttons(['Request a case']);
  await d.click('End availability'); await d.root().locator('.tm-sheet:visible').getByRole('button', { name: 'End availability', exact: true }).click();
  await d.settle(); await d.msg('home.manuallyEnded'); await d.buttons(['Set availability']);
});
add('A-H08', 'pending request honoured after availability ends', 'home_requesting', '66,68-69', async d => {
  await d.ff(ms('availabilityMinimum') + ms('mockServerDelay')); await d.settle(); await d.buttons(['Call patient']);
});
add('A-H09', 'idle timer expiry keeps prescription count and setup', 'home_active', '65,69-70', async d => {
  const count = await d.root().getByText('Prescriptions today', { exact: true }).count(); assert.ok(count);
  await d.ff(24 * 60 * 60 * 1000); await d.msg('home.idleExpired'); await d.buttons(['Set availability'], ['Request a case']);
  assert.ok(await d.root().getByText('Prescriptions today', { exact: true }).count());
});
add('A-H10', 'Profile logout cancelled then confirmed returns to sign-in', 'home_profile', '75', async d => {
  await d.click('Log out'); await d.msg('profile.logoutConfirm'); await d.click('Stay signed in'); await d.buttons(['Log out']);
  await d.click('Log out'); await d.root().locator('.tm-sheet:visible').getByRole('button', { name: 'Log out', exact: true }).click();
  await d.settle(); await d.text(copy('signin.welcome')); await d.p.reload(); await d.text(copy('signin.welcome'));
});
add('A-C01', 'ready Back opens leave; stay and close preserve case', 't01-ready', '89,100', async d => {
  await d.click('Back'); await d.text('Leave this case?'); await d.click('Stay on this case'); await d.buttons(['Call patient']);
  await d.click('Back'); await d.closeSheet(); await d.buttons(['Call patient']);
});
add('A-C02', 'release returns to Home', 's7e-leave-sheet', '100', async d => {
  await d.click('Release case'); await d.settle(); await d.buttons(['Request a case']);
});
add('A-C03', 'release refused leaves doctor on Ready with notes retained', 't01-ready', '100,262', async d => {
  await d.fill('#doctor-notes-input', 'Synthetic release note'); await d.click('Back'); await d.click('Release case'); await d.settle();
  await d.msg('case.releaseFailed'); await d.buttons(['Call patient', 'Back']);
  assert.equal(await d.root().locator('#doctor-notes-input').inputValue(), 'Synthetic release note');
}, { caseKind: 'release-refused' });
for (const how of ['Release case', 'Back']) add(`A-C04-${how}`, 'empty case releases directly: ' + how, 'a-no-medicines', '96', async d => {
  await d.msg('case.noMedicines'); await d.buttons([], ['Call patient']); await d.click(how);
  assert.equal(await d.root().getByText('Leave this case?', { exact: true }).count(), 0); await d.settle(); await d.buttons(['Request a case']);
});
add('A-C05', 'Rx failed retry and close remain usable', 'd-rx-failed', '261; docs/feedback-state-map.md:155', async d => {
  await d.buttons(['Try again']); await d.click('Try again'); await d.settle(); await d.click('Close'); await d.buttons(['Call patient']);
});
add('A-C06', 'offline action keeps notes, reconnect recovers', 't01-ready', '256-262,270', async d => {
  await d.fill('#doctor-notes-input', 'Synthetic preserved notes'); await d.choose('offline', 'yes'); await d.msg('case.offline');
  const b = d.button('Call patient'); if (await b.isEnabled()) { await d.click('Call patient'); await d.msg('case.offlineAction'); }
  assert.equal(await d.root().locator('#doctor-notes-input').inputValue(), 'Synthetic preserved notes');
  await d.choose('offline', 'no'); await d.buttons(['Call patient']);
});
add('A-P01', 'zero daily dose blocks prescribe and focuses first error', 'd-error-dose', '244-246', async d => {
  await d.click('Prescribe'); await d.text('Choose a dose for at least one time of day.');
  const e = d.root().getByText('Choose a dose for at least one time of day.', { exact: true });
  assert.ok(await e.isVisible()); assert.equal(await e.locator('xpath=ancestor::*[contains(@class,"tm-notice")]').count(), 0);
});
add('A-P02', 'save prescription marks medicine Prescribed', 'd-default', '246', async d => {
  await d.click('Prescribe'); await d.settle(); await d.text('Prescribed'); await d.buttons(['Call patient']);
});
for (const reason of ['Can’t prescribe remotely', 'Contraindicated for patient', 'Duplicate medication', 'Patient declined', 'Wrong strength']) add(`A-P03-${reason}`, 'disable immediately: ' + reason, 'd-default', '249', async d => {
  await d.click('Disable'); await d.root().getByRole('button', { name: new RegExp(reason) }).click(); await d.settle(); await d.text('Disabled');
  await d.buttons(['Call patient']);
});
add('A-P04', 'prescribing disabled medicine enables it again', 'd-disabled', '246-247', async d => {
  await d.text('Prescribing it will enable it again.'); await d.click('Prescribe'); await d.settle(); await d.text('Prescribed');
});
add('A-P05', 'changed Prescribe closes through discard and Keep editing', 'd-default', '248', async d => {
  await d.fill('#ps-note', 'Synthetic instruction'); await d.click('Close'); await d.text('Discard changes?'); await d.click('Keep editing');
  assert.equal(await d.root().locator('#ps-note').inputValue(), 'Synthetic instruction'); await d.click('Close'); await d.click('Discard'); await d.buttons(['Call patient']);
});
add('A-P06', 'unchanged Prescribe closes without discard', 'd-default', '248', async d => {
  await d.click('Close'); await d.buttons(['Call patient']); await d.noText('Discard changes?');
});
add('A-P07', 'Other accepts only positive decimal numbers', 'd-syrup', '244', async d => {
  await d.click('Other'); const input = d.root().locator('input[inputmode=decimal]:visible');
  for (const invalid of ['', '0', '-1', '1e2', '1/2', '7..5']) {
    await input.fill(invalid); await d.click('Prescribe'); assert.ok(await input.isVisible(), `${invalid} must not save`);
    assert.ok(await d.root().locator('.tm-field__helper:visible, [role=alert]:visible').count(), 'Field error visible');
  }
  await input.fill('.5'); await d.click('Prescribe'); await d.settle(); await d.text('Prescribed');
});
add('A-P08', 'instructions appear in live printed line; food toggles clear', 'd-default', '243,251', async d => {
  await d.fill('#ps-note', 'Synthetic aftercare'); await d.root().locator('#ps-note').blur(); await d.text('Synthetic aftercare');
  await d.click('After food'); assert.ok((await d.root().locator('#ps-prints-text').innerText()).includes('After food'));
  await d.click('After food'); assert.ok(!(await d.root().locator('#ps-prints-text').innerText()).includes('After food'));
});
add('A-F01', 'Pending medicines block confirm and allow medicine review', 't08c-confirm-blocked', '146,194', async d => {
  await d.click('Confirm prescription'); assert.match(await d.root().innerText(), /Prescribe or disable \d+ medicine/);
  assert.ok(await d.button('Confirm prescription').isEnabled()); await d.buttons([], ['Callback']);
});
add('A-F02', 'confirm failure restores CTA without losing work', 't08a-valid-cat4', '190', async d => {
  await d.choose('prescribe', 'confirm-failed'); await d.click('Confirm prescription'); await d.settle(); await d.msg('case.confirmFailed');
  await d.choose('prescribe', 'saved'); await d.click('Confirm prescription'); await d.settle(); await d.text('Prescription confirmed');
});
add('A-F03', 'uncertain confirm stays busy and refuses duplicate submission', 't08a-valid-cat4', '173,190', async d => {
  await d.choose('prescribe', 'confirm-busy'); await d.click('Confirm prescription'); await d.msg('case.confirming');
  await d.buttons([], ['Confirm prescription', 'Callback']);
  assert.equal(await d.root().locator('textarea:enabled:visible').count(), 0); await d.ff(ms('reconcileDelay')); await d.noText('Couldn’t confirm');
});
for (const state of ['t02-calling', 's7a-calling', 't05-result-wait', 's7b-still-on-call']) add('A-CTA-' + state, 'forbidden finals/callback while waiting: ' + state, state, '90,120-121,134-140', async d => {
  await d.buttons([], [...finals, 'Callback', 'End call', 'Back']);
});
for (const [state, yes, no] of [
  ['t03-not-through', ['Call again', 'Back'], [...finals, 'Callback']],
  ['t04-doctor-missed', ['Call again', 'Back'], [...finals, 'Callback']],
  ['t06-ended-early', ['Call again', 'Callback'], [...finals, 'Unavailable', 'Back']],
  ['s7d-result-missing', ['Confirm prescription', 'Callback', 'Unavailable'], ['Skip HA', 'Call again', 'Back']],
  ['t08a-valid-cat4', ['Confirm prescription'], ['Callback', 'Skip HA', 'Confirm & forward', 'Confirm & transfer', 'Back']],
  ['t10a-confirmed', ['Request next case', 'Back to Home'], [...finals, 'Callback', 'Call patient', 'Back']],
  ['e-availability-ended', ['Back to Home'], ['Request next case', ...finals]],
]) add('A-CTA-' + state, 'CTA permissions: ' + state, state, '133-148,185,204', d => d.buttons(yes, no));
add('A-N01', 'phone Back during call shows blocked toast', 't01-ready', '90,100', async d => {
  await d.click('Call patient'); await d.back(); await d.text('Finish this case first. Then you can go back to Home.');
  await d.buttons([], ['Back', 'Release case']);
});
add('A-N02', 'phone Back on closed case goes Home', 't10a-confirmed', '94', async d => {
  await d.back(); await d.text('Prescriptions today');
});
for (const [fields, message] of [[{doctorFailure:'3'}, 'call.notThrough'], [{doctorFailure:'4'}, 'call.doctorMissed']]) add('A-CALL-' + fields.doctorFailure, 'doctor-side failure allows retry and release', 't01-ready', '118,122,135-136', async d => {
  for (const [k,v] of Object.entries(fields)) await d.choose(k,v); await d.click('Call patient'); await d.ff(ms('gate')); await d.msg(message);
  await d.buttons(['Call again', 'Back'], ['Callback']);
});
for (const cause of ['no-answer', 'busy', 'rejected', 'switched-off', 'unreachable', 'invalid-number', 'unknown']) add('A-HOLD-' + cause, 'patient failure closes and applies hold policy: ' + cause, 't01-ready', '122,207', async d => {
  await d.choose('patientFailure', cause); await d.click('Call patient'); await d.ff(ms('gate')); await d.text('Patient unavailable');
  await d.buttons(['Request next case', 'Back to Home'], ['Callback']);
  await d.log(cause === 'invalid-number' ? /not.retried|invalid.number.*flag/i : cause === 'unknown' ? /plain.hold/i : /retry|by.cause/i);
});
for (const state of ['t06-ended-early', 's7d-result-missing']) add('A-CB-' + state, 'callback validates both fields then schedules', state, '201-204', async d => {
  await d.click('Callback'); await d.click('Confirm callback'); await d.msg('case.callbackPickBoth');
  await d.click('Today'); await d.click('Confirm callback'); await d.msg('case.callbackPickTime');
  await d.click('3:00 PM'); await d.click('Confirm callback'); await d.settle(); await d.text('Callback today at 3:00 PM');
});
add('A-CB-refused', 'callback backend refusal keeps choices and case open', 'c-callback-refused', '126,204', async d => {
  await d.msg('callback.notReached'); assert.ok(await d.root().locator('.tm-sheet:visible [aria-pressed=true]').count());
  await d.closeSheet(); await d.buttons(['Callback']);
});
add('A-CB-failed', 'callback save failure keeps selected date and time', 'c-callback-failed', '203', async d => {
  await d.msg('case.callbackFailed'); assert.ok(await d.root().locator('.tm-sheet:visible [aria-pressed=true]').count() >= 2); await d.buttons(['Confirm callback']);
});
for (const reason of ['Didn’t answer', 'Not reachable', 'Wrong number']) add('A-U-' + reason, 'Unavailable reason immediately closes: ' + reason, 's7d-result-missing', '208-209', async d => {
  await d.click('Unavailable'); await d.click(reason); await d.settle(); await d.text('Patient unavailable'); await d.buttons(['Request next case']);
  await d.log(new RegExp(reason.replace('’', '[’\u0027]'), 'i'));
});
add('A-U-cancel', 'Unavailable close leaves case unchanged', 's7d-result-missing', '208', async d => {
  await d.click('Unavailable'); await d.closeSheet(); await d.buttons(['Confirm prescription', 'Callback', 'Unavailable']);
});
export const CASES = [...cases, ...addressing(2, 5)];
if (process.argv[1]?.endsWith('/journeys.mjs')) await run(CASES);
