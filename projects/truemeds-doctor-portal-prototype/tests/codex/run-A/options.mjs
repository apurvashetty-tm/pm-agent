import { run, assert } from './harness.mjs';
const CASES=[];
for(const [state,options] of [
 ['d-default',['Daily','Every X hours','Alt days','Weekly','Monthly','SOS only']],
 ['d-every-x-hours',['Every 4 hours','Every 6 hours','Every 8 hours','Every 12 hours']], // Main-thread ruling 2026-11-09 (A1 disputes): chips read '4 h'…, accessible names 'Every 4 hours'…
 ['d-duration-picker',['1','2','3','4','5','6','7','10','14','15','Days','Weeks','Months','Ongoing']],
]) CASES.push({id:'A-OPTIONS-'+state,name:'approved schedule/duration choices: '+state,state,source:'ui-screens/app-logic.md:223,240-243',test:async d=>{
 for(const name of options) assert.ok(await d.root().getByRole('button',{name,exact:true}).filter({visible:true}).count(),`Choice ${name}`);
}});
for(const [state,unit,expected] of [['d-sos-only','tablet',/max 1 tablet\/day/],['d-inhaler','puffs',/max 8 puffs\/day/],['d-cream','times',/max 3 times\/day/]]) CASES.push({id:'A-SOS-'+state,name:'SOS total dose and unit: '+unit,state,source:'ui-screens/app-logic.md:241,251',test:async d=>{
 // Choose the relevant configured fixture. The assertion checks the printed outcome, not chip styling.
 const text=await d.root().locator('#ps-prints-text').innerText();
 // Fixtures are display coverage only until the test sets dose/count. Do not assume their initial dose values.
 if(state==='d-inhaler'){
   await d.click('SOS only');
   const dose=d.root().locator('#ps-dose-section').getByRole('button',{name:'2',exact:true}); await dose.click();
   await d.root().getByRole('button',{name:'4',exact:true}).filter({visible:true}).last().click();
 } else if(state==='d-cream'){
   await d.click('SOS only'); await d.root().getByRole('button',{name:'3',exact:true}).filter({visible:true}).last().click();
 } else {
   await d.root().locator('#ps-dose-section').getByRole('button',{name:'1',exact:true}).click();
   await d.root().getByRole('button',{name:'1',exact:true}).filter({visible:true}).last().click();
 }
 assert.ok(text.length); assert.match(await d.root().locator('#ps-prints-text').innerText(),expected);
}});
for(const [outcome,notice] of [['cancelled',null],['enable-failed','Couldn’t turn on faster sign-in.']]) CASES.push({id:'A-PROFILE-'+outcome,name:'Profile faster sign-in on: '+outcome,state:'home_profile',fields:{offer:outcome},source:'ui-screens/app-logic.md:75-76',test:async d=>{
 const toggle=d.root().getByRole('switch'); assert.equal(await toggle.count(),1); if(await toggle.getAttribute('aria-checked')==='true') await toggle.click();
 await toggle.click(); await d.settle(); assert.equal(await toggle.getAttribute('aria-checked'),'false');
 if(notice) await d.text(notice); else await d.noText('Couldn’t turn on faster sign-in.');
}});
export { CASES };
if(process.argv[1]?.endsWith('/options.mjs')) await run(CASES);
