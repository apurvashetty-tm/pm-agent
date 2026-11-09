// One executable case per launch calling-flow edge. Expected actions/results are fixed by app-logic,
// not inferred from implementation. MAP supplies edge identities and catches newly unmapped edges.
import { MAP, run, ms, assert } from './harness.mjs';
const screens = { R1:'t01-ready', CALL:'t01-ready', C0:'t02-calling', C6:'t06-ended-early', C7b:'s7b-still-on-call', C7c:'t05-result-wait', C7d:'s7d-result-missing', C7f:'s7f-submitted', C8:'t08a-valid-cat4', RES:'t05-result-wait', E3:'t03-not-through', CB:'c-callback', B0:'g0-calling-pilot', B1:'g1-generic-confirm', B2:'g2-checking-ha', B3:'g3b-forwarded', B7d:'s7d-result-missing-pilot', T13:'t13-connecting-ha', T15:'t15-ha-no-join', E15:'t15-after-hangup', EB3:'g3b-after-hangup', T16:'t16-transfer-missed', T17:'t17-skip-ha-wait' };
const key = e => `${e.from}>${e.to}:${e.label}`;
const recipes = new Map();
function recipe(from,to,pattern,fn) { recipes.set(`${from}>${to}:${pattern}`,fn); }
const advance = async d => { await d.ff(ms('gate') + ms('mockServerDelay') + ms('pollingInterval') * 2); };
const confirm = label => async d => { await d.click(label); await d.settle(); };
recipe('R1','CALL','Call patient',async d=>{await d.click('Call patient'); await d.buttons([],['Back','Callback','End call']); await d.msg('call.scriptCat4');});
recipe('R1','LEAVE','Back',async d=>{await d.click('Back'); await d.text('Leave this case?'); await d.buttons(['Release case','Stay']); /* Main-thread ruling 2026-11-09 (A1 disputes): D-84 CA-22 renamed it to Stay */});
recipe('E3','LEAVE','Back',async d=>{await d.click('Back'); await d.text('Leave this case?');});
recipe('E3','CALL','Call again',async d=>{await d.click('Call again'); await d.msg('call.scriptCat4'); await d.buttons([],['Back']);});
recipe('CALL','C0','Cat4 / HA skipped',async d=>{await d.click('Call patient'); await d.msg('call.scriptCat4');});
recipe('CALL','B0','Pilot',async d=>{await d.click('Call patient'); await d.msg('call.scriptNeutral');});
recipe('CALL','E3',"doctor's leg failed",async d=>{await d.choose('doctorFailure','3'); await d.click('Call patient'); await advance(d); await d.msg('call.notThrough');});
recipe('CALL','P9',"patient's side failed (any time)",async d=>{await d.choose('patientFailure','busy'); await d.click('Call patient'); await advance(d); await d.text('Patient unavailable');});
recipe('C0','C7b','3 min, no result, end not known',async d=>{await d.choose('record','never'); await d.ff(ms('noResultTimeout')); await d.msg('call.stillOnCall');});
recipe('C0','C7c','3 min, no result, hang-up reported',async d=>{await d.choose('record','never'); await d.choose('hangup','reported'); await d.ff(ms('noResultTimeout')); await d.msg('call.resultWait'); await d.noText('Are you still on the call?');});
recipe('C0','RES','hang-up reported → 5 Getting call result → result',async d=>{await d.choose('hangup','reported'); await advance(d); await d.buttons(['Confirm prescription']);});
recipe('C0','RES','result (no screen: stays on Calling)',async d=>{await d.choose('record','over-gate'); await advance(d); await d.buttons(['Confirm prescription']); await d.noText('Getting call result…');});
recipe('C6','C0','Call again',async d=>{await d.click('Call again'); await d.msg('call.scriptCat4');});
recipe('C6','B0','Call again (Pilot context kept)',async d=>{await d.click('Call again'); await d.msg('call.scriptNeutral');});
for(const from of ['C6','C7d','B7d']) recipe(from,'CB','Callback',async d=>{await d.click('Callback'); await d.text('Schedule callback'); await d.buttons(['Confirm callback']);});
recipe('C7b','C0','Still talking',async d=>{await d.click('Still talking'); await d.ff(ms('stillOnCallRepeat')-1); await d.noText('Are you still on the call?'); await d.ff(ms('pollingInterval')); await d.msg('call.stillOnCall');});
recipe('C7b','B0','Still talking (Pilot context kept)',async d=>{await d.click('Still talking'); await d.msg('call.scriptNeutral');});
recipe('C7b','C7c','Call ended',async d=>{await d.click('Call ended'); await d.msg('call.resultWait'); await d.buttons([],['Callback']);});
recipe('C7c','C7d','nothing found',async d=>{await d.choose('record','never'); await d.settle(); await d.msg('call.resultMissing'); await d.buttons(['Confirm prescription','Callback','Unavailable']);});
recipe('C7c','RES','result found',async d=>{await d.choose('record','over-gate'); await advance(d); await d.buttons(['Confirm prescription']);});
recipe('C7d','C7f','Confirm',async d=>{await d.click('Confirm prescription'); await d.settle(); await d.msg('call.submittedTitle'); await d.noText('Prescription confirmed');});
for(const from of ['C7d','B7d']) recipe(from,'P9','Unavailable + reason',async d=>{await d.click('Unavailable'); await d.click('Not reachable'); await d.settle(); await d.text('Patient unavailable');});
recipe('C7f','E10a','record over the gate',async d=>{await d.choose('record','over-gate'); await advance(d); await d.text('Prescription confirmed');});
recipe('C7f','E10b','record over the gate (Pilot)',async d=>{await d.choose('record','over-gate'); await advance(d); await d.text('Forwarded to Health Advisor'); await d.noText('Prescription confirmed');});
recipe('C7f','HOLD','record under the gate or none in time',async d=>{await d.choose('record','never'); await d.ff(ms('callRecordWait')+ms('pollingInterval')); await d.log(/hold|retry/i); await d.noText('Prescription confirmed');});
recipe('C8','E10a','Confirm prescription',async d=>{await confirm('Confirm prescription')(d); await d.text('Prescription confirmed');});
recipe('CB','ECB','time chosen',async d=>{await d.click('Today'); await d.click('3:00 PM'); await confirm('Confirm callback')(d); await d.text('Callback today at 3:00 PM');});
recipe('RES','C6','too short',async d=>{await d.choose('record','under-gate'); await advance(d); await d.msg('call.endedEarly'); await d.buttons(['Call again','Callback']);});
recipe('RES','C8','over the gate',async d=>{await d.choose('record','over-gate'); await advance(d); await d.buttons(['Confirm prescription'],['Callback']);});
recipe('B0','B1','gate passed, call live',async d=>{await d.ff(ms('gate')+ms('pollingInterval')); await d.buttons(['Confirm prescription','Skip HA']);});
recipe('B0','B7d','no result: 7c, nothing',async d=>{await d.choose('record','never'); await d.ff(ms('noResultTimeout')); const b=d.button('Call ended'); if(await b.count()) await d.click('Call ended'); await d.settle(); await d.buttons(['Confirm & forward','Callback','Unavailable'],['Skip HA']);});
recipe('B0','RES','ended before the gate',async d=>{await d.choose('connected','under-gate'); await advance(d); await d.msg('call.endedEarly');});
recipe('B1','B2','Confirm prescription',async d=>{await d.click('Confirm prescription'); await d.msg('call.checkingHa');});
recipe('B1','T16','ended after gate, no Confirm',async d=>{await d.choose('hangup','reported'); await advance(d); await d.buttons(['Confirm & forward','Skip HA']);});
recipe('B1','T17','Skip HA + reason',async d=>{await d.click('Skip HA'); await d.root().getByRole('button',{name:/Clinically not required/}).click(); await d.msg('call.skipHa'); await d.msg('call.resultWait');});
recipe('B2','B3','no HA free',async d=>{await d.choose('ha','none'); await d.settle(); await d.msg('call.waitingForHangup'); await d.msg('call.forwardedTell');});
recipe('B2','T13','HA free',async d=>{await d.choose('ha','free'); await d.settle(); await d.msg('call.connectingHa');});
recipe('B3','EB3','hang-up',async d=>{await d.choose('hangup','reported'); await advance(d); await d.buttons(['Request next case','Back to Home']); await d.noText('Read the script, then end the call.');});
recipe('B7d','C7f','Confirm & forward',async d=>{await confirm('Confirm & forward')(d); await d.msg('call.submittedTitle');});
for(const from of ['E15','EB3']) recipe(from,'HOLD','result under the gate (background)',async d=>{await d.choose('record','under-gate'); await advance(d); await d.log(/mismatch/i); await d.log(/hold|retry/i);});
recipe('T13','E14',"HA rung (joins or doesn't pick up)",async d=>{await d.choose('ha','free'); await d.settle(); await d.text('Transferred to Health Advisor'); await d.buttons(['Request next case','Back to Home']);});
recipe('T13','T15',"couldn't start",async d=>{await d.choose('ha','request-failed'); await d.settle(); await d.msg('call.transferFailed'); await d.msg('call.waitingForHangup');});
recipe('T15','E15','hang-up',async d=>{await d.choose('hangup','reported'); await advance(d); await d.buttons(['Request next case','Back to Home']); await d.noText('Read the script, then end the call.');});
recipe('T16','E10a','Skip HA + reason → Confirm prescription',async d=>{await d.click('Skip HA'); await d.root().getByRole('button',{name:/Clinically not required/}).click(); await confirm('Confirm prescription')(d); await d.text('Prescription confirmed');});
recipe('T16','E10b','Confirm & forward',async d=>{await confirm('Confirm & forward')(d); await d.text('Forwarded to Health Advisor');});
recipe('T17','RES','result',async d=>{await d.choose('record','over-gate'); await advance(d); await d.buttons(['Confirm prescription'],['Skip HA']);});
export function edgeCases(runName) {
  return MAP.edges.filter(e=>e.route!=='A' && !['A11','A2'].includes(e.to)).filter(e=>{
    const pilot=e.route==='pilot'|| /^(B|T|E15|EB3)/.test(e.from) || /^(B|T|E14|E15|EB3)/.test(e.to);
    return (runName==='B')===pilot;
  }).map((e,i)=>({id:`${runName}-EDGE-${i+1}`,name:key(e),state:screens[e.from],fields:{scenario:runName==='B'?'pilot_ha_free':e.route.includes('ha-skipped')?'pilot_ha_skipped_customer':'cat4'},source:`app/state-map.js edge ${key(e)}; ui-screens/app-logic.md:133-160,176-190`,test:async d=>{
    assert.ok(screens[e.from], `Missing source fixture for ${key(e)}`);
    const fn=recipes.get(key(e)); assert.ok(fn,`New edge needs an independent test recipe: ${key(e)}`); await fn(d);
  }}));
}
export const CASES=edgeCases('A');
if(process.argv[1]?.endsWith('/run-A/edges.mjs')) await run(CASES);

// Static recipe completeness runs with --list as well as with a browser.
for (const e of MAP.edges.filter(e=>e.route!=='A' && !['A11','A2'].includes(e.to))) {
  assert.ok(screens[e.from], `No fixture for ${key(e)}`); assert.ok(recipes.has(key(e)), `No recipe for ${key(e)}`);
}
