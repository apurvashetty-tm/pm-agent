// Spec-only A0 tests. Only the explicitly permitted data/settings modules are imported.
import { chromium } from '../../../../../tests/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SETTINGS } from '../../../../../app/core/settings.js';
import { SIGN_IN_NUMBERS, OTP_CODES } from '../../../../../app/data/test-numbers.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..');
const rows = ['Test on phone','Story','Jump to a state','Sign-in answers','Home and case answers','Call simulator','Timings and limits','Event log'];
const tests = [];
const test = (id, fn) => tests.push({id, fn});
const summary = (p, name) => p.locator('summary').filter({hasText: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?:\\s|$)`)}).first();
async function fold(p, name, open=true) {
  const s = summary(p,name); await s.waitFor({state:'visible'});
  if (await s.evaluate(e=>e.parentElement.open) !== open) await s.click();
  return s.locator('..');
}
async function frame(p) {
  // Public driver #screen; infer its enclosing phone frame geometrically, without implementation selectors.
  return p.locator('#screen').evaluate(e=>{
    const found=[];
    for(let n=e;n && n!==document.body;n=n.parentElement){const r=n.getBoundingClientRect();
      if(r.width>200 && r.width<450 && r.height>600 && r.height<900) found.push({x:r.x,y:r.y,width:r.width,height:r.height});}
    if(!found.length) throw Error('Adapter: cannot identify enclosing frame from public #screen');
    return found.at(-1);
  });
}
async function bounds(l){const b=await l.boundingBox();assert(b,'visible geometry required');return b;}
async function open(p, query=''){await p.goto(base+query);await p.locator('#screen').waitFor();}
for(const [w,h] of [[1280,800],[1440,900],[1920,1080]]) test(`A0-layout-${w}`,async p=>{
  await p.setViewportSize({width:w,height:h});await open(p);
  const f=await frame(p), expected=Math.min(844,Math.max(640,h-48));
  assert(Math.abs(f.height-expected)<2,JSON.stringify(f));
  assert(Math.abs(f.width-f.height*390/844)<2,JSON.stringify(f));
  assert(Math.abs(f.x+f.width/2-w/2)<2,'frame stays centred');
  const panel=await bounds(p.locator('.review-panel'));assert(Math.abs(panel.y-f.y)<3,'panel card top aligns with frame');
  const first=await bounds(summary(p,rows[0]));
  assert(first.x>=f.x+f.width,'controls on right');
  assert(await summary(p,rows[0]).evaluate(e=>e.parentElement.open),'phone row defaults open');
  const phone=await fold(p,rows[0]);await phone.getByText('Phone and Mac on the same Wi-Fi',{exact:true}).waitFor();
  await phone.getByRole('button',{name:/Copy link/i}).waitFor();
  assert(await phone.locator('#rp-qr svg').count()>0,'QR visible');
  await fold(p,rows[0],false);await fold(p,rows[0],true);
  for(const active of ['Story','Call simulator',...rows]){
    await fold(p,active);
    let bottom=-1;
    for(const name of rows){const b=await bounds(summary(p,name));assert(b.x>=f.x+f.width,'one right column');assert(Math.abs(b.x-first.x)<2,'same column');assert(b.y>=bottom-1,'required panel order');assert(b.y+b.height<=h,'no row off screen');bottom=b.y+b.height;}
    const scroll=await summary(p,rows[0]).evaluate(e=>{const out=[];for(let n=e.parentElement.parentElement;n&&n!==document.body;n=n.parentElement){const s=getComputedStyle(n);if(/auto|scroll/.test(s.overflowY)&&n.scrollHeight>n.clientHeight+1)out.push(n.tagName);}return out;});
    assert.deepEqual(scroll,[],'panel cannot scroll');
    await fold(p,active,false);
  }
  const left=await p.getByText('Test on phone',{exact:true}).all();
  for(const l of left)if(await l.isVisible())assert((await bounds(l)).x>=f.x+f.width,'no left gutter phone card');
  assert(await p.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1),'desktop page does not scroll');
});
test('A0-summaries',async p=>{
 await open(p);for(const name of rows){const s=summary(p,name);await s.waitFor();const r=await s.evaluate(e=>{
 const nodes=[e,...e.querySelectorAll('*')].filter(n=>n.textContent.trim());return nodes.map(n=>{const c=getComputedStyle(n);return {text:n.textContent,nowrap:c.whiteSpace==='nowrap',ellipsis:c.textOverflow==='ellipsis',clip:n.scrollWidth>n.clientWidth+1,lineClamp:c.webkitLineClamp};});});
 assert(!r.some(n=>n.ellipsis||n.clip||n.lineClamp==='1'),'summary must wrap without truncation: '+name);
 }
});
const results={'not-registered':/not registered|sign.up/i,inactive:/inactive|Doctor Ops/i,'too-many-tries':/too many|countdown/i,'couldnt-send':/couldn.t send/i,'locked-number':/locked/i,correct:/correct|signs in/i,expired:/expired/i,'couldnt-verify':/couldn.t verify|server error/i};
for(const mobile of [false,true])for(const [state,data]of [['sign-in_default',SIGN_IN_NUMBERS],['otp_default',OTP_CODES]])test(`A0-inputs-${mobile?'phone':'desktop'}-${state}`,async p=>{
 await p.setViewportSize({width:mobile?390:1440,height:mobile?844:900});await open(p,`?${mobile?'play=1&':''}s=${state}`);
 if(mobile)await p.getByRole('button',{name:/review|demo|controls/i}).first().click();
 const row=await fold(p,'Sign-in answers');
 // Both lists must be present on either auth screen, including phone drawer.
 for(const [n,outcome]of Object.entries({...SIGN_IN_NUMBERS,...OTP_CODES})){
 const line=row.getByRole('button',{name:new RegExp(`^${n}\\b`)});await line.waitFor({state:'visible'});assert.match(await line.innerText(),results[outcome]);
 }
 assert.match(await row.innerText(),/any other.*(number|mobile)/i);assert.match(await row.innerText(),/any other.*(OTP|code)/i);
 for(const n of Object.keys(data)){
 await row.getByRole('button',{name:new RegExp(`^${n}\\b`)}).click();
 const field=p.locator(state.startsWith('otp')?'#c':'#tm-login-mobile');await field.waitFor();assert.equal(await field.inputValue(),n);
 // A fill may close the phone drawer. Reopen via public visible control if necessary.
 if(!await summary(p,'Sign-in answers').isVisible())await p.getByRole('button',{name:/review|demo|controls/i}).first().click();await fold(p,'Sign-in answers');
 }
});
test('A0-settings',async p=>{
 await open(p);const row=await fold(p,'Timings and limits');
 assert.equal(await p.locator('summary').filter({hasText:/^Settings(?:\s|$)/}).count(),0);
 for(const name of ['Valid-call minimum','OTP lock','Resend waits'])await row.getByText(name,{exact:true}).waitFor();
 for(const [key,s]of Object.entries(SETTINGS)){
 // Reference is a public title/tooltip, NOT an implementation id. Plain label mapping is intentionally not invented.
 const item=row.locator('[title]');
 const match=await item.evaluateAll((els,ref)=>els.findIndex(e=>e.title===ref),s.ref);
 assert(match>=0,`reference hover/tap adapter missing for ${key}: ${s.ref}`);
 const control=item.nth(match);await control.hover();
 const line=control.locator('xpath=..');const txt=await line.innerText();
 assert.match(txt,new RegExp(s.source==='rule'?'\\bRule\\b':'\\bStand-in\\b'));
 assert(!txt.includes(key) || !/[A-Z]/.test(key),'raw camelCase setting name: '+key);
 for(const v of [].concat(s.value)){
 if(s.time)assert(new RegExp(`(?:${v/1000}\\s*(?:s\\b|sec|seconds)|${v/60000}\\s*(?:m\\b|min|minutes))`,'i').test(txt),`${key}: missing time with units: ${txt}`);
 else assert(txt.includes(String(v)),`${key}: missing value`);
 }
 }
 const advanced=p.getByText('Advanced',{exact:true});const a=await bounds(advanced);
 assert(a.y>(await bounds(summary(p,'Call simulator'))).y);assert(a.y<(await bounds(summary(p,'Timings and limits'))).y);
});
test('A0-network-link',async p=>{
 assert(process.env.A0_NETWORK_HOST,'Set A0_NETWORK_HOST to the host already configured by the build server; no undocumented injection');
 await open(p);const row=await fold(p,'Test on phone');const l=row.locator('#rp-link');await l.waitFor();
 const raw=await l.evaluate(e=>e.href||e.value||e.textContent.trim());const link=new URL(raw);
 assert(!['localhost','127.0.0.1','::1','[::1]'].includes(link.hostname));assert.equal(link.hostname,process.env.A0_NETWORK_HOST);
 assert.equal(link.port,new URL(base).port,'preserve serving port');
 const decoded=await row.locator('#rp-qr svg').evaluate(async e=>{
   if(!globalThis.BarcodeDetector)throw Error('QR decoder unavailable: run Chrome with BarcodeDetector support or supply a test decoder adapter; do not count href as decoded QR');
   const detector=new BarcodeDetector({formats:['qr_code']});
   const canvas=document.createElement('canvas');const r=e.getBoundingClientRect();canvas.width=r.width;canvas.height=r.height;
   const context=canvas.getContext('2d');
   if(e.tagName.toLowerCase()==='svg'){
     const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(e));await img.decode();context.drawImage(img,0,0,canvas.width,canvas.height);
   }else context.drawImage(e,0,0,canvas.width,canvas.height);
   const codes=await detector.detect(canvas);return codes.map(c=>c.rawValue);
 });
 assert(decoded.includes(link.href),'QR must decode to advertised play URL');
 await p.context().grantPermissions(['clipboard-read','clipboard-write']);await row.getByRole('button',{name:/Copy link/i}).click();assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),link.href);
 // Navigate the advertised play link: an unreachable LAN host is a real configuration failure.
 await p.goto(link.href);await p.locator('#screen').waitFor();
});
test('A0-happy-path',async p=>{
 await open(p);const row=await fold(p,'Test on phone');const raw=await row.locator('#rp-link').evaluate(e=>e.href||e.value||e.textContent.trim());
 await p.goto(raw);await p.locator('#tm-login-mobile').fill('9876543210');await p.getByRole('button',{name:'Send OTP',exact:true}).click();
 await p.locator('#c').fill('1234');await p.getByRole('button',{name:'Verify & sign in',exact:true}).click();
 // Public role adapters only. No story/store mutation: defaults are the behavior being tested.
 const notNow=p.getByRole('button',{name:'Not now',exact:true});await notNow.waitFor();await notNow.click();
 await p.getByRole('button',{name:/Set availability/i}).click();
 await p.getByRole('button',{name:/Request (a |next )?case/i}).click();
 const medicines=p.locator('#medicines-list');await medicines.waitFor();
 for(let i=0;i<20;i++){const pending=medicines.getByText('Pending',{exact:true});if(!await pending.count())break;await pending.first().click();await p.getByRole('button',{name:'Prescribe',exact:true}).click();}
 await p.getByRole('button',{name:/Call patient/i}).click();
 await p.evaluate(()=>window.__tm.clock.fastForward(120000));
 await p.getByRole('button',{name:'Confirm prescription',exact:true}).click();
 await p.getByText('Prescription confirmed',{exact:true}).waitFor();
 await p.getByRole('button',{name:'Request next case',exact:true}).click();await medicines.waitFor();
});
if(process.argv.includes('--list')){for(const t of tests)console.log(t.id);process.exit(0);}
let server;let browser;let base=process.env.CODEX_BASE_URL;
try{
 if(!base){const app=path.join(root,'app');server=http.createServer((req,res)=>{const f=path.resolve(app,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/\/$/,'/index.html'));if(!f.startsWith(app+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});await new Promise((ok,no)=>{server.once('error',no);server.listen(0,'127.0.0.1',ok);});base=`http://localhost:${server.address().port}/`;}
 browser=await chromium.launch({executablePath:process.env.CHROME||undefined});let failures=0;
 // Main-thread ruling: happy-path acceptance runs at the end of A2, explicitly selected by its ID.
 for(const t of tests.filter(t=>(t.id!=='A0-happy-path'||process.env.CODEX_FILTER==='A0-happy-path')&&(!process.env.CODEX_FILTER||t.id.includes(process.env.CODEX_FILTER)))){const ctx=await browser.newContext({viewport:{width:1440,height:900}});try{const p=await ctx.newPage();p.setDefaultTimeout(8000);await t.fn(p);console.log('PASS',t.id);}catch(e){failures++;console.error('FAIL',t.id,e.message);}finally{await ctx.close();}}
 if(failures)process.exitCode=1;
}finally{await browser?.close();if(server)await new Promise(r=>server.close(r));}
