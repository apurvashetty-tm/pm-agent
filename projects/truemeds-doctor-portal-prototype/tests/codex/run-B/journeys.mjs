import { run, addressing, assert, ms } from '../run-A/harness.mjs';
const cases = [];
const add = (id, name, state, lines, test, fields = {}) => cases.push({ id, name, state, source: `ui-screens/app-logic.md:${lines}`, test, fields: { scenario: 'pilot_ha_free', ...fields } });
for (const scenario of ['pilot_ha_free', 'pilot_no_ha_free']) {
  add('B-gate-' + scenario, 'before gate: neutral script, no finals, callback or back', 'g0-calling-pilot', '119-121,160,176', async d => {
    await d.msg('call.scriptNeutral'); await d.buttons([], ['Confirm prescription','Confirm & transfer','Confirm & forward','Skip HA','Callback','Back','End call']);
  }, { scenario });
  add('B-live-' + scenario, 'live gate CTA independent of HA capacity', 'g1-generic-confirm', '160,176', async d => {
    await d.buttons(['Confirm prescription','Skip HA'], ['Confirm & transfer','Confirm & forward','Callback','Back']); await d.msg('call.scriptNeutral');
    await d.click('Confirm prescription'); await d.msg('call.checkingHa'); assert.ok(await d.button('Skip HA').isDisabled());
  }, { scenario });
}
for (const state of ['g2-checking-ha','t13-connecting-ha']) add('B-busy-' + state, 'busy stage disables Skip HA and has no Callback', state, '152,160,173,176', async d => {
  await d.msg(state.startsWith('g2') ? 'call.checkingHa' : 'call.connectingHa');
  assert.ok(await d.button('Skip HA').isDisabled()); await d.buttons([], ['Callback','Confirm prescription','Confirm & transfer','Confirm & forward']);
  assert.equal(await d.root().locator('textarea:visible:enabled').count(), 0);
});
for (const state of ['g3b-forwarded','t15-ha-no-join']) add('B-wait-' + state, 'forward while live waits; no next-case actions', state, '123,154-160,189', async d => {
  await d.msg('call.waitingForHangup'); await d.msg('call.transferFailed'); await d.msg('call.forwardedTell');
  await d.buttons([], ['Request next case','Back to Home','Callback','Skip HA','End call']);
  await d.noText('Health Advisor is unavailable');
});
for (const state of ['g3b-after-hangup','t15-after-hangup']) add('B-ended-' + state, 'forward after hang-up removes script and allows next case', state, '155,160', async d => {
  await d.text('Forwarded to Health Advisor'); await d.buttons(['Request next case','Back to Home']);
  await d.noText('Read the script, then end the call.'); await d.noText('I’ve written your prescription.');
});
for (const [state,key] of [['t16-transfer-missed','call.transferMissedDoctor'],['t16b-transfer-missed-patient','call.transferMissedPatient'],['t16c-transfer-missed-unknown','call.transferMissed']]) add('B-missed-' + state, 'ended-before-confirm names correct party', state, '157,176,185', async d => {
  await d.msg(key); await d.buttons(['Confirm & forward','Skip HA'], ['Callback','Confirm & transfer']);
  await d.noText('I’m writing your prescription now.'); await d.click('Confirm & forward'); await d.settle(); await d.text('Forwarded to Health Advisor');
});
for (const state of ['g1-generic-confirm','t16-transfer-missed']) for (const reason of ['Patient declined the Health Advisor call','Clinically not required','Repeat patient, familiar with the medicines']) add('B-skip-' + state + '-' + reason, 'Skip HA immediate reason: ' + reason, state, '158,176,185-188', async d => {
  await d.click('Skip HA'); await d.root().getByRole('button', { name: new RegExp(reason) }).click();
  if (state.startsWith('g1')) { await d.msg('call.skipHa'); await d.msg('call.resultWait'); await d.buttons([], ['Confirm prescription','Callback','Skip HA']); }
  else { await d.buttons(['Confirm prescription'], ['Confirm & forward','Confirm & transfer','Skip HA']); await d.click('Confirm prescription'); await d.settle(); await d.text('Prescription confirmed'); }
});
add('B-skip-cancel', 'Skip HA close preserves live B1 and eligibility', 'g1-generic-confirm', '187', async d => {
  await d.click('Skip HA'); await d.closeSheet(); await d.buttons(['Confirm prescription','Skip HA']); await d.msg('call.scriptNeutral');
});
add('B-7d', 'Pilot missing result forwards, callback and unavailable; no Skip HA', 's7d-result-missing-pilot', '141,143,185', async d => {
  await d.msg('call.resultMissing'); await d.buttons(['Confirm & forward','Callback','Unavailable'], ['Confirm prescription','Skip HA']);
  await d.click('Confirm & forward'); await d.settle(); await d.msg('call.submittedTitle'); await d.msg('call.submittedText');
});
add('B-pending', 'Pilot Pending gate also blocks live generic confirm', 'g1-generic-confirm', '194', async d => {
  await d.choose('prescribe','pending-blocks-confirm'); await d.click('Confirm prescription');
  assert.match(await d.root().innerText(), /Prescribe or disable \d+ medicine/); await d.buttons(['Skip HA']); await d.noText('Checking for a Health Advisor…');
});
add('B-expiry', 'availability ending mid-case never interrupts; ending allows only Home', 't08a-valid-cat4', '69-70,94', async d => {
  await d.ff(24 * 60 * 60 * 1000); await d.buttons(['Confirm prescription']); await d.click('Confirm prescription'); await d.settle();
  await d.text('Prescription confirmed'); await d.buttons(['Back to Home'], ['Request next case']); await d.click('Back to Home'); await d.msg('home.idleExpired');
}, { scenario:'cat4' });
add('B-reopen', 'reload restores open case, medicine changes and typed notes', 't01-ready', '77,100,262; plan v3.2 B12', async d => {
  await d.fill('#doctor-notes-input','Synthetic note surviving reopen'); await d.fill('#symptoms-input','Synthetic symptom');
  await d.root().locator('#medicines-list .tm-row').first().click(); await d.click('Prescribe'); await d.settle(); await d.text('Prescribed');
  await d.p.goto(d.base); await d.p.waitForTimeout(200); await d.buttons(['Call patient']);
  assert.equal(await d.root().locator('#doctor-notes-input').inputValue(), 'Synthetic note surviving reopen');
  assert.equal(await d.root().locator('#symptoms-input').inputValue(), 'Synthetic symptom'); await d.text('Prescribed');
}, { scenario:'cat4' });
add('B-open-profile', 'Profile forbids logout while case open', 'home_profile-case-open', '75,77', async d => {
  await d.msg('profile.logoutBlocked'); await d.buttons([], ['Log out']); await d.click('Back'); await d.p.goto(d.base); await d.buttons(['Call patient']);
});
add('B-background', 'clock survives background/reload during a call; no OTP overlay', 'g0-calling-pilot', '77,119; plan v3.2 B8,B12', async d => {
  const other = await d.context.newPage(); await other.goto('about:blank'); await d.ff(ms('gate') + ms('pollingInterval'));
  await d.p.bringToFront(); await d.p.reload(); await d.p.waitForTimeout(200);
  await d.buttons(['Confirm prescription','Skip HA'], ['Verify & sign in']); await other.close();
});
add('B-late-earlier', 'late record for previous case cannot replace next case', 's7d-result-missing-pilot', '143; plan v3.2 B7, step 7', async d => {
  await d.choose('record','over-gate'); await d.choose('recordDelay','late');
  await d.click('Confirm & forward'); await d.settle(); await d.msg('call.submittedTitle'); await d.click('Request next case'); await d.settle();
  const identity = await d.root().locator('#ch-name').innerText(); await d.ff(ms('callRecordWait')); await d.settle();
  assert.equal(await d.root().locator('#ch-name').innerText(), identity); await d.buttons(['Call patient']); await d.noText('Forwarded to Health Advisor');
});
add('B-demo', 'demo goes sign-in through prescribing and valid call to next case', '', '274-297; plan v3.2 step 5', async d => {
  await d.p.goto(d.base + '?demo=1'); await d.fill('#tm-login-mobile','7012345678'); await d.click('Send OTP'); await d.settle();
  await d.fill('#c','1234'); await d.click('Verify & sign in'); await d.settle();
  const notNow = d.button('Not now'); if (await notNow.count()) await d.click('Not now');
  await d.click('15 min'); await d.click('Set availability'); await d.settle(); await d.click('Request a case'); await d.settle();
  for (let i = 0; i < 20; i++) {
    const pending = d.root().locator('#medicines-list .tm-row').filter({ hasText:'Pending' });
    if (!(await pending.count())) break;
    await pending.first().click(); await d.click('Prescribe'); await d.settle();
  }
  assert.equal(await d.root().locator('#medicines-list .tm-row').filter({ hasText:'Pending' }).count(), 0);
  await d.click('Call patient'); await d.ff(ms('gate') * 2); await d.buttons(['Confirm prescription']);
  await d.click('Confirm prescription'); await d.settle(); await d.text('Prescription confirmed'); await d.click('Request next case'); await d.settle(); await d.buttons(['Call patient']);
});
// Every launch story must produce an equivalent route on a phone through the actual panel-generated play link.
for (const scenario of ['cat4','pilot_ha_free','pilot_no_ha_free','pilot_ha_skipped_customer','pilot_ha_skipped_system']) add('B-play-' + scenario, 'desktop and phone play-link route parity', 't01-ready', '297; plan v3.2 B15', async (d, app) => {
  await d.choose('start','case'); const link = (await d.p.locator('#rp-link').textContent() || '').trim(); // main thread 2026-11-10: Story folds Test on phone (D-97), so innerText is empty
  const phone = await app.open('', {}, 390);
  try {
    await phone.p.goto(link.replace(/^https?:\/\/[^/]+\//, d.base)); await phone.p.waitForTimeout(200);
    for (const x of [d, phone]) {
      // Review medicines by real taps, never set private app state.
      for (let i=0;i<20;i++) { const pending=x.root().locator('#medicines-list .tm-row').filter({hasText:'Pending'}); if(!await pending.count()) break; await pending.first().click(); await x.click('Prescribe'); await x.settle(); }
      await x.click('Call patient'); await x.ff(ms('gate') + ms('pollingInterval') * 3);
      if (scenario === 'pilot_ha_free' || scenario === 'pilot_no_ha_free') await x.buttons(['Confirm prescription','Skip HA']);
      else { await x.ff(ms('gate')); await x.buttons(['Confirm prescription'], ['Skip HA']); }
    }
    assert.equal(await phone.p.locator('#review-panel').isVisible(), false, 'Phone panel must not overlay app'); await phone.clean();
  } finally { await phone.close(); }
}, { scenario });
export const CASES = [...cases, ...addressing(6, 8)];
if (process.argv[1]?.endsWith('/journeys.mjs')) await run(CASES);
