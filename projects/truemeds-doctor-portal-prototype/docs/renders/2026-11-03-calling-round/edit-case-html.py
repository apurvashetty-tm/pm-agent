import re, pathlib
P = pathlib.Path('/Users/mac/src/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/ui-screens/case/case.html')
lines = P.read_text(encoding='utf-8').split('\n')

def find(prefix):
    hits = [i for i, l in enumerate(lines) if l.lstrip().startswith(prefix)]
    assert len(hits) == 1, (prefix, hits)
    return hits[0]

def replace(prefix, new):
    i = find(prefix); lines[i] = new

def delete(prefix):
    i = find(prefix); del lines[i]

def insert_after(prefix, new_lines):
    i = find(prefix); lines[i+1:i+1] = new_lines

# helpers
delete('const greyPair = ')
replace('const calling = scn', "  const calling = scn => { switchScenario(scn); initiateCall(); return later(() => { setBar(statusLine('Calling ' + first() + '…')); showScript(); }, 250); };   // D-81 F21: no header Back from the call tap on; K1 (CW-A1): no Callback on a live call")
replace('const s7dBar = ', "  const s7dBar = (label = 'Confirm prescription') => { setBar(notice('warning', 'status', MSG('call.resultMissing'), 'alert-triangle'), btn('tm-btn--primary tm-btn--block', label), pair(btn('tm-btn--secondary', icon('calendar') + 'Callback'), unavailableBtn())); $('pre-call-brief').style.display = 'none'; };   // D-75 / CW-D2: label follows the route")
insert_after('const callbackRow = ', [
"  // K13 / K11 / K8: Skip HA alone, full width, under the main button; disabled while the HA is being checked or transferred",
"  const skipHaRow = (disabled) => { const w = document.createElement('div'); w.className = 'tm-btn-pair'; w.style.order = getComputedStyle($('ab-secondary')).order; w.style.gridTemplateColumns = '1fr'; const b = btn('tm-btn--secondary', icon('player-track-next') + 'Skip HA'); if (disabled) b.disabled = true; w.appendChild(b); return w; };",
"  // K2: the callback sheets open over Call too short (6), the only post-call state that offers Callback with the sheet",
"  const six = () => setBar(notice('warning', 'status', MSG('call.endedEarly'), 'phone-off'), btn('tm-btn--primary tm-btn--block', icon('phone') + 'Call again'), callbackRow());",
"  // K8 / K9: a live forward or transfer-failed call waits for the hang-up; the buttons come after it",
"  const waitingBar = () => setBar(statusLine(MSG('call.waitingForHangup')));",
])

# recipes (each is a single line keyed by its state id)
replace("'a-back-blocked':", "    'a-back-blocked':          () => { switchScenario(CAT4); initiateCall(); return later(() => { setBar(statusLine('Calling ' + first() + '…')); showScript(); head.classList.add('tm-header-task--no-back'); $('ch-back').style.display = 'none'; caseBack(); }, 250); },   // Round 3: attempted call, no header Back (D-58), phone-back toast; K1: no Callback")
replace("'a-no-medicines':", "    'a-no-medicines':          () => { switchScenario(CAT4); renderMedicines([]); $('medicines-count').style.display = 'none'; const e = document.getElementById('medicines-empty'); e.hidden = true; e.innerHTML = ''; window.__emptyCase = true; $('action-zone').style.display = 'none'; main.insertBefore(cardNotice(notice('warning', 'status', MSG('case.noMedicines'), 'alert-triangle')), tools); const rel = btn('tm-btn--primary tm-btn--block', 'Release case'); rel.onclick = () => $('cl-release').click(); setBar(rel); },   // K4 (CW-A6): amber notice at the top of the panel; Release case releases directly")
replace("'g1-generic-confirm':", "    'g1-generic-confirm':      () => { passGate(VALUE); allRx(); return later(() => { $('pcb-text').textContent = MSG('call.scriptNeutral'); setBar(btn('tm-btn--primary tm-btn--block', 'Confirm prescription'), skipHaRow()); }, 250); },   // Round 6 (G5 race): the bar is set once here; K11 (CW-F1): Skip HA full width under the main button, no Callback")
replace("'g2-checking-ha':", "    'g2-checking-ha':          () => { passGate(VALUE); allRx(); return later(() => { $('pcb-text').textContent = MSG('call.scriptNeutral'); setBar(statusRow(MSG('call.checkingHa')), skipHaRow(true)); }, 250); },   // B-02; K13: greyed Skip HA only, full width, disabled")
replace("'g3b-forwarded':", "    'g3b-forwarded':           () => closeCase(VALUE, () => { showSuccessToast('Forwarded for Review', ''); $('success-toast-title').textContent = 'Forwarded to Health Advisor'; cardText(MSG('call.transferFailed'), true); scriptAfterOutcome(MSG('call.forwardedTell')); waitingBar(); }),   // K9 (CW-E3): live call, bar = \"Waiting for the call to end…\" only; D-62 B3 amber, D-81 F4 wording")
insert_after("'g3b-forwarded':", [
"    'g3b-after-hangup':        () => closeCase(VALUE, () => { showSuccessToast('Forwarded for Review', ''); $('success-toast-title').textContent = 'Forwarded to Health Advisor'; cardText(MSG('call.transferFailed'), true); scriptAfterOutcome(MSG('call.forwardedTell')); }),   // K9: after the hang-up: Request next case · Back to Home",
"    'g0-calling-pilot':        () => { switchScenario(VALUE); initiateCall(); return later(() => { setBar(statusLine('Calling ' + first() + '…')); showScript(MSG('call.scriptNeutral')); }, 250); },   // K12 (CW-F1): the Pilot twin of t02 before the gate; neutral script, no Callback, no header Back",
])
replace("'t05-result-wait':", "    't05-result-wait':         () => { switchScenario(CAT4); initiateCall(); return later(() => { setBar(statusLine(MSG('call.resultWait'))); $('pre-call-brief').style.display = 'none'; }, 250); },   // call known to have ended (state 5, §5): no script; K1: no Callback")
replace("'t08c-confirm-blocked':", "    't08c-confirm-blocked':    () => { passGate(CAT4); return later(() => { $('action-zone').style.display = 'none'; $('ab-secondary').style.display = 'none'; const n = [...document.querySelectorAll('#main-scroll .tm-tag')].filter(t => /pending/i.test(t.textContent)).length; noticeAboveBar(notice('error', 'alert', MSG(n === 1 ? 'case.confirmBlockedOne' : 'case.confirmBlocked', { n }), 'alert-circle')); }, 200); },   // D-81 F2 / Flag 5; K1: no Callback here (only 6 and 7d offer it)")
replace("'t08b-valid-forward':", "    't08b-valid-forward':      () => { passGate(FWD); allRx(); return later(() => { $('action-zone').style.display = 'none'; setBar(btn('tm-btn--primary tm-btn--block', 'Confirm & forward'), skipHaRow()); }, 200); },   // K1 (CW-C3): Confirm & forward · Skip HA full width; no Callback")
replace("'t12-transfer-ready':", "    't12-transfer-ready':      () => { passGate(VALUE); allRx(); return later(() => { showScript(); setBar(btn('tm-btn--primary tm-btn--block', 'Confirm & transfer'), skipHaRow()); }, 200); },   // K1 (CW-A1): Confirm & transfer · Skip HA full width; no Callback")
replace("'t13-connecting-ha':", "    't13-connecting-ha':       () => { passGate(VALUE); allRx(); return later(() => { showScript(); setBar(busy(MSG('call.connectingHa')), skipHaRow(true)); window.__frozen = true; syncConcept(); }, 250); },   // D-81 F24; K13: greyed Skip HA only, full width, disabled")
delete("'t15b-end-call-first':")   # K10: retired
replace("'t15-ha-no-join':", "    't15-ha-no-join':          () => closeCase(VALUE, () => { showSuccessToast('Forwarded for Review', ''); cardText(MSG('call.transferFailed'), true); scriptAfterOutcome(MSG('call.forwardedTell')); waitingBar(); }),   // K8 (CW-E3): live call: card unchanged, bar = \"Waiting for the call to end…\" only")
insert_after("'t15-ha-no-join':", [
"    't15-after-hangup':        () => closeCase(VALUE, () => { showSuccessToast('Forwarded for Review', ''); cardText(MSG('call.transferFailed'), true); scriptAfterOutcome(MSG('call.forwardedTell')); }),   // K8: after the hang-up: same card, Request next case · Back to Home",
])
replace("'t17-skip-ha-wait':", "    't17-skip-ha-wait':        () => { passGate(VALUE); allRx(); return later(() => { showScript(SCRIPT.cat4); setBar(notice('neutral', 'status', MSG('call.skipHa'), 'info-circle'), statusLine('Calling ' + first() + '…')); }, 250); },   // K7 (CW-E2): live: \"Calling {name}…\" until the hang-up, then \"Getting call result…\"; no Callback")
replace("'s7a-calling':", "    's7a-calling':             () => { switchScenario(CAT4); initiateCall(); return later(() => { setBar(statusLine('Calling ' + first() + '…')); showScript(); }, 250); },   // K1: no Callback on a live call")
insert_after("'s7d-result-missing':", [
"    's7d-result-missing-pilot': () => { switchScenario(VALUE); initiateCall(); allRx(); return later(() => s7dBar('Confirm & forward'), 250); },   // K6 (CW-D2): Pilot route: Confirm & forward · Callback + Unavailable; no Skip HA",
])
replace("'c-callback':", "    'c-callback':              () => { startCall(CAT4); handleCallAction(); return later(() => { six(); openSheet('sheet-callback'); }, 250); },   // K2 (CW-A1): the sheet opens over 6 Call too short, not Calling")
replace("'c-callback-error':", "    'c-callback-error':        () => { startCall(CAT4); handleCallAction(); return later(() => { six(); openSheet('sheet-callback'); confirmScheduleCallback(); }, 250); },   // K2")
replace("'c-callback-failed':", "    'c-callback-failed':       () => { startCall(CAT4); handleCallAction(); return later(() => { six(); openSheet('sheet-callback'); selectCallbackDay('today'); selectCallbackTime('15:00'); const a = document.querySelector('#sheet-callback .tm-sheet__actions'); const g = document.createElement('div'); g.className = 'concept-new concept-gap'; g.appendChild(notice('error', 'alert', MSG('case.callbackFailed'), 'alert-circle')); a.before(g); }, 250); },   // K2")
insert_after("'c-callback-failed':", [
"    'c-callback-refused':      () => { startCall(CAT4); handleCallAction(); return later(() => { six(); openSheet('sheet-callback'); selectCallbackDay('today'); selectCallbackTime('15:00'); const a = document.querySelector('#sheet-callback .tm-sheet__actions'); const g = document.createElement('div'); g.className = 'concept-new concept-gap'; g.appendChild(notice('error', 'alert', MSG('callback.notReached'), 'alert-circle')); a.before(g); }, 250); },   // K3: backend refuses a callback without leg 2 answered (CW-A1); same pattern as the save failure",
])
replace("'c-skip-ha':", "    'c-skip-ha':               () => { passGate(VALUE); allRx(); return later(() => { showScript(); setBar(btn('tm-btn--primary tm-btn--block', 'Confirm & transfer'), skipHaRow()); openSheet('sheet-skip-ha'); }, 200); },   // over 12 Confirm & transfer · Skip HA (K1)")

P.write_text('\n'.join(lines), encoding='utf-8')
print('ok', len(lines))
