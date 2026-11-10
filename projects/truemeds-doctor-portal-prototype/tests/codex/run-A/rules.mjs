import { run, assert, ms } from './harness.mjs';
const cases=[];
const add=(id,name,test,fields={})=>cases.push({id,name,state:'t01-ready',fields,source:'ui-screens/app-logic.md:116-125,143,190-194; plan v3.2 B8-B12',test});
// B9 promises per-call length. This UI adapter requires an explicit duration control and fails if absent;
// it does not change the store/server or assume how elapsed time is implemented.
async function length(d,seconds){
  const control=d.p.locator('#rp-length, #rp-callLength, #rp-duration').filter({visible:true});
  assert.equal(await control.count(),1,'Need one visible per-call length control in seconds (B9); see README adapter contract');
  if(await control.evaluate(e=>e.tagName==='SELECT')) await control.selectOption(String(seconds));
  else {await control.fill(String(seconds)); await control.dispatchEvent('change');}
}
async function allReviewed(d){
  for(let i=0;i<20;i++){
    const rows=d.root().locator('#medicines-list .tm-row').filter({hasText:'Pending'}); if(!await rows.count()) break;
    await rows.first().click(); await d.click('Prescribe'); await d.settle();
  }
  assert.equal(await d.root().locator('#medicines-list .tm-row').filter({hasText:'Pending'}).count(),0);
}
async function call(d,seconds){await length(d,seconds); await d.click(await d.button('Call patient').count()?'Call patient':'Call again'); await d.ff((seconds+2)*1000+ms('pollingInterval')*2);}
for(const offset of [-1,0,1]) add('A-GATE-'+offset,`partner result at gate ${offset < 0 ? 'minus' : 'plus'} ${Math.abs(offset)} second`,async d=>{
  await allReviewed(d); await d.choose('connected', offset < 0 ? 'under-gate' : 'over-gate'); await d.choose('record', offset < 0 ? 'under-gate' : 'over-gate'); await call(d,ms('gate')/1000+offset);
  if(offset<0){await d.msg('call.endedEarly'); await d.buttons(['Call again','Callback'],['Confirm prescription']);}
  else await d.buttons(['Confirm prescription'],['Callback']);
});
add('A-GATE-live-cat4','Cat4 cannot unlock from local live time alone',async d=>{
  await d.choose('record','never'); await length(d,600); await d.click('Call patient'); await d.ff(ms('gate')+ms('pollingInterval'));
  await d.buttons([],['Confirm prescription','Confirm & transfer','Confirm & forward','Skip HA']);
});
add('A-GATE-sum','counted talk time adds across calls on same case',async d=>{
  await allReviewed(d); await d.choose('connected','under-gate'); await call(d,ms('gate')/2000); await d.msg('call.endedEarly');
  await d.clickControl('#rp-add-attempt'); await length(d,ms('gate')/2000); await d.click('Call again'); await d.ff(ms('gate')+ms('pollingInterval')*2);
  await d.buttons(['Confirm prescription']);
});
add('A-GATE-min','sub-minimum call is excluded from accumulated talk time',async d=>{
  await d.choose('connected','under-gate'); await call(d,(ms('minCountedCall')-1000)/1000); await d.msg('call.endedEarly');
  await d.clickControl('#rp-add-attempt'); await length(d,(ms('gate')-ms('minCountedCall')+1000)/1000); await d.click('Call again'); await d.ff(ms('gate')+ms('pollingInterval')*2);
  await d.buttons(['Call again'],['Confirm prescription']);
});
add('A-GATE-window','old talk time outside window cannot unlock next short call',async d=>{
  await d.choose('connected','under-gate'); await call(d,ms('gate')/2000); await d.msg('call.endedEarly'); await d.ff(ms('talkWindow')+ms('pollingInterval'));
  await d.clickControl('#rp-add-attempt'); await length(d,ms('gate')/2000); await d.click('Call again'); await d.ff(ms('gate')+ms('pollingInterval')*2);
  await d.buttons(['Call again'],['Confirm prescription']);
});
add('A-GATE-retry','short calls have no doctor retry cap',async d=>{
  await d.choose('connected','under-gate'); await d.choose('record','under-gate'); await call(d,(ms('minCountedCall')-1000)/1000);
  // The editor can store three attempts; the doctor's retry action must remain available beyond that.
  for(let i=0;i<5;i++){await d.buttons(['Call again']); await d.click('Call again'); await d.ff(ms('gate')+ms('pollingInterval')*2);}
  await d.buttons(['Call again']);
});
for(const record of ['under-gate','never','no-answer']) cases.push({id:'A-RECORD-'+record,name:'submitted prescription unproven: '+record,state:'s7f-submitted',source:'ui-screens/app-logic.md:125,143; calling-flow/data.js:158-161',test:async d=>{
  await d.choose('record',record); await d.ff(ms('callRecordWait')+ms('pollingInterval'));
  await d.log(/hold|retry/i); await d.log(/mismatch/i); await d.noText('Prescription confirmed'); await d.noText('Ops review');
}});
for(const scenario of ['cat4','pilot_ha_skipped_customer','pilot_ha_skipped_system']) add('A-ROUTE-'+scenario,'Cat4-style route: '+scenario,async d=>{
  await allReviewed(d); await call(d,ms('gate')/1000+1); await d.buttons(['Confirm prescription'],['Skip HA','Confirm & transfer','Confirm & forward']);
  await d.click('Confirm prescription'); await d.settle(); await d.text('Prescription confirmed'); await d.buttons(['Request next case','Back to Home']);
}, {scenario});
add('A-COUNT-once','one successful confirm logs exactly once after reload',async d=>{
  await allReviewed(d); await call(d,ms('gate')/1000+1); await d.click('Confirm prescription'); await d.settle(); await d.text('Prescription confirmed');
  await d.p.reload(); await d.p.waitForTimeout(200); await d.text('Prescription confirmed');
  await d.log(/confirm/i); await d.buttons([],['Confirm prescription']);
  // Exact once is checked in the reviewer event log, not guessed from button wording.
  const raw=await d.p.locator('details[data-row=log]').innerText();
  const matches=raw.split('\n').filter(l=>/confirm.*(?:success|completed)|(?:success|completed).*confirm/i.test(l));
  assert.equal(matches.length,1,'Exactly one completed confirm event (engineering may name the event freely)');
});
export const CASES=cases;
if(process.argv[1]?.endsWith('/rules.mjs')) await run(CASES);
