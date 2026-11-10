import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../../..',import.meta.url)));
const kit=path.resolve(process.env.HANDOFF_DIR||path.join(root,'handoff'));
const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const sandbox={window:{}};
vm.runInNewContext(read(path.join(root,'app/state-map.js')),sandbox);
const pictures=JSON.parse(JSON.stringify(sandbox.window.TM_STATE_MAP.pictures));
const journeys=['sign-in','otp','faster-signin-offer','returning-unlock','home','case','prescribe'];
const later=new Set(['t08b-valid-forward','t11-calling-transfer','t12-transfer-ready']);
const screen=j=>json(path.join(kit,'screens',j+'.json'));
function exported(p,name){const s=read(p),start=s.indexOf('{',s.indexOf('export const '+name));let depth=0,quoted=false,escaped=false;for(let i=start;i<s.length;i++){const c=s[i];if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;}else if(c==='"')quoted=true;else if(c==='{')depth++;else if(c==='}'&&--depth===0)return JSON.parse(s.slice(start,i+1));}throw Error('Unclosed '+p);}
const tokens=exported(path.resolve(root,'../../design-system/native/tokens.ts'),'tokens');
const messages=exported(path.join(root,'ui-screens/native/messages.ts'),'messages');
function native(name){assert.equal(typeof name,'string');assert.ok(name.startsWith('tokens.'),name);let v=tokens;for(const k of name.slice(7).split('.')){assert.ok(v&&Object.hasOwn(v,k),`Unknown native ${name}`);v=v[k];}assert.ok(v===null||typeof v!=='object'||/^tokens\.shadow\.[^.]+$/.test(name),`Token must be a leaf: ${name}`);} // shadows are one composite token by design (D-98 native build; main-thread ruling 2026-11-10)
function copy(key){assert.equal(typeof key,'string');assert.ok(Object.hasOwn(messages,key.replace(/^messages\./,'')),`Unknown copy ${key}`);}
function inside(rel){assert.equal(typeof rel,'string');const p=path.resolve(kit,rel);assert.ok(p.startsWith(kit+path.sep),`Outside kit: ${rel}`);assert.ok(fs.statSync(p).isFile(),`Missing ${rel}`);return p;}
function entries(){return journeys.flatMap(j=>screen(j).states.map(s=>({j,s})));}
function typed(v){return /#[\da-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|lab|lch|color)\(|\b(?:white|black|red|blue|green|yellow|gray|grey|orange|purple)\b|(?<![\w.-])(?:\d*\.)?\d+(?:px|r?em|ch|pt|[ds]?v[wh])\b/i.test(String(v).replace(/var\([^)]*\)/g,''));}
function entry(text,id){return text.split(/^### /m).slice(1).find(s=>new RegExp(`^(?:<[^>]+>)*${id}\\s*·`).test(s));}

test('H15: exact approved state partition and portable byte-identical pictures',()=>{
 assert.equal(pictures.length,149,'Approved state-map total (user contract)');
 for(const j of journeys){const data=screen(j);assert.ok(data.screen);assert.ok(Array.isArray(data.states));assert.ok(Array.isArray(data.tokensUsed));assert.ok(Array.isArray(data.rawValues.builtApp));assert.ok(Array.isArray(data.rawValues.exceptions));
 const expected=pictures.filter(p=>p.picture.split('/')[0]===j);
 assert.deepEqual(data.states.map(s=>s.id).sort(),expected.map(s=>s.id).sort(),j);
 for(const s of data.states){assert.ok(s.name);const p=expected.find(p=>p.id===s.id);for(const w of [360,390])assert.deepEqual(fs.readFileSync(inside(s.pictures['w'+w])),fs.readFileSync(path.join(root,'ui-screens',p.picture+`_w${w}.png`)),`${s.id} w${w}`);}
 }
});
test('H16: built states and precisely the three deferred A-only states',()=>{
 for(const {s} of entries()){assert.ok(s.rule&&/feedback|app-logic/i.test(JSON.stringify(s.rule)),`${s.id}: source rule`);
 if(later.has(s.id)){assert.equal(s.built,false);assert.ok(s.later);assert.equal(s.elements?.length||0,0);continue;}
 assert.ok(s.built===true||s.built===undefined,`${s.id}: built`);assert.ok(s.elements.length,`${s.id}: elements`);
 assert.equal(s.built390,`viewer/shots/built-390_${s.id}.png`);const b=fs.readFileSync(inside(s.built390));assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 }
});
test('H17: unique element identities, full fields, viewport geometry and decision links',()=>{
 const decided=read(path.join(kit,'DECIDED.md'));
 for(const {s} of entries()){const ids=new Set();for(const e of s.elements||[]){const label=`${s.id}/${e.id}`;
 for(const k of ['id','block','part','variant','blockState','box','tokens','styles','copy','accessibility','behaviour'])assert.ok(e[k]!==undefined,`${label}: ${k}`);
 assert.ok(e.id&&!ids.has(e.id),label);ids.add(e.id);
 for(const k of ['x','y','w','h'])assert.ok(Number.isFinite(e.box[k]),`${label}: ${k}`);
 const {x,y,w,h}=e.box;assert.ok(x>=0&&y>=0&&w>=0&&h>=0&&x+w<=390.01&&y+h<=844.01,`${label}: viewport`);
 assert.ok(Array.isArray(e.styles)&&Array.isArray(e.copy));assert.ok(e.accessibility&&typeof e.accessibility==='object');
 assert.ok(e.behaviour.state!==undefined);assert.ok(e.behaviour.decided?.length,`${label}: decision`);
 for(const ref of e.behaviour.decided){assert.match(ref,/^DECIDED\.md#[\w-]+$/);const id=ref.split('#')[1];assert.ok(decided.includes(`id="${id}"`)||entry(decided,id),`${label}: broken ${ref}`);}
 }}
});
test('H18: all token and copy references resolve including property arrays and slots',()=>{
 for(const j of journeys){const d=screen(j);for(const name of d.tokensUsed)native(typeof name==='string'?name:name.native);
 for(const s of d.states)for(const e of s.elements||[]){for(const names of Object.values(e.tokens)){assert.ok(Array.isArray(names));names.forEach(native);}
 for(const key of [e.copyKey,...(e.copyKeys||[])].filter(Boolean))copy(key);
 for(const c of e.copy){assert.ok(c.slot);assert.equal(['copyKey','literal','data'].filter(k=>Object.hasOwn(c,k)).length,1);if(c.copyKey)copy(c.copyKey);}
 for(const st of e.styles){assert.ok(st.property&&Object.hasOwn(st,'value'));assert.ok(st.from?.selector&&st.from?.file&&Number.isInteger(st.from?.line)&&st.from.line>0);assert.ok(Array.isArray(st.tokens));for(const t of st.tokens){native(t.native);assert.match(t.web,/^--/);assert.ok(Object.hasOwn(t,'value'));}}
 }}
});
test('H19: typed styles flagged with provenance or documented exceptions; zero/layout/% plain',()=>{
 for(const j of journeys){const d=screen(j);for(const s of d.states)for(const e of s.elements||[])for(const st of e.styles){
 const exception=d.rawValues.exceptions.some(ex=>ex.property===st.property&&ex.value===st.value&&ex.from?.file===st.from?.file&&ex.from?.line===st.from?.line&&JSON.stringify(ex).match(/reason|note|exception/i));
 if(typed(st.value))assert.ok(st.raw===true||exception,`${s.id}/${e.id}: unflagged ${st.property}: ${st.value}`);
 if(st.raw===true){assert.ok(typed(st.value)||['word','copy','text'].includes(st.kind),`Layout flagged raw: ${st.value}`);assert.ok(st.from.file&&st.from.line);}
 }
 for(const r of d.rawValues.builtApp){assert.equal(r.raw,true);assert.ok(r.from?.file||r.file);assert.ok(Number.isInteger(r.from?.line||r.line));}
 }
});
test('H20: every used block has parts/states/tokens/rules and accurate usedIn',()=>{
 const used=new Map();for(const {s} of entries())for(const e of s.elements||[]){if(!used.has(e.block))used.set(e.block,[]);used.get(e.block).push({s,e});}
 for(const [block,rows]of used){assert.match(block,/^[\w-]+$/);const spec=json(path.join(kit,'components',block+'.json'));assert.ok(spec.rules&&Object.keys(spec.rules).length);assert.ok(spec.parts&&Object.keys(spec.parts).length);assert.ok(spec.states&&Object.keys(spec.states).length);assert.ok(Array.isArray(spec.usedIn));
 for(const {s,e}of rows){assert.ok(spec.usedIn.includes(s.id),`${block}: ${s.id}`);assert.ok(JSON.stringify(spec.parts).includes(e.part),`${block}: part ${e.part}`);assert.ok(JSON.stringify(spec.states).includes(e.blockState),`${block}: state ${e.blockState}`);}
 }
});
test('H21: journey decisions, D-101 and configurable mock rulings',()=>{
 const d=read(path.join(kit,'DECIDED.md')),o=read(path.join(kit,'OPEN.md'));
 for(const title of ['Sign-in','OTP','Faster sign-in offer','Returning unlock','Home','Case page','Prescribe'])for(const text of [d,o])assert.ok(text.split('\n').includes('## '+title),title);
 const product=['o04','o05','o07','o08','o10','o11','o17','o18','o25','o26'],mock=['o01','o02','o03','o12','o15','o16','o19','o21','o22','o24'];
 for(const id of [...product,...mock]){const e=entry(d,id);assert.ok(e,`Missing DECIDED ${id}`);assert.ok(!entry(o,id)&&!o.includes(`id="${id}"`),`Still OPEN ${id}`);if(product.includes(id))assert.match(e,/D-101/);else{assert.match(e,/\[MOCK\]/);assert.match(e,/keep configurable/i);}}
 for(const e of d.split(/^### /m).slice(1)){assert.match(e,/^[\w-]+\s*·/);assert.match(e,/D-\d+/);assert.match(e,/source/i);}
});
test('H22: disk viewer exposes each journey and state without network-only loading',()=>{
 const html=read(path.join(kit,'viewer/index.html'));
 assert.doesNotMatch(html,/<(?:script|link)[^>]+(?:src|href)=["']https?:/i);
 // Follow local JS/data references; do not execute untrusted viewer code in Node.
 let content=html;
 for(const m of html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi))content+='\n'+read(inside(path.posix.normalize('viewer/'+m[1])));
 for(const j of journeys)assert.ok(content.includes(j),`Viewer missing journey ${j}`);
 assert.ok(/states|stateId/.test(content),'No state navigation');
 assert.ok(/tokensUsed/.test(content),'No tokens-used inspector');
 assert.ok(/raw/.test(content)&&/red|#[fF]00|#[eEdD][\da-fA-F]{5}/.test(content),'No raw red presentation');
 // A fully embedded viewer or a local script may contain the states; dynamic local
 // data navigation still needs the offline walkthrough recorded in CASES.md.
 assert.ok(!/fetch\s*\(\s*["']https?:/i.test(content));
});
test('H23: external handoff excludes internal history and doctor-unit order wording',()=>{
 function scan(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{assert.ok(!e.isSymbolicLink());const p=path.join(dir,e.name);return e.isDirectory()?scan(p):[p];});}
 for(const p of scan(kit)){if(!/\.(md|json|html|js|mjs|css|ts|txt|svg)$/i.test(p)||path.basename(p)==='OFL.txt')continue;
 const text=read(p);assert.doesNotMatch(text,/\b(?:Netlify|Codex|Apurva|Swapnil|review rounds?|render rules|terminal.brief)\b|(?:^|\/)\.git(?:\/|\b)|\/Users\//i,p);
 for(const m of text.matchAll(/\bDr\.?\s+[A-Z][a-z]+/g))assert.equal(m[0],'Dr. Kunal',p);
 // Customer order identifiers and CSS order declarations are legitimate technical data.
 for(const line of text.split('\n').filter(l=>/\border\b/i.test(l)))assert.ok(/customer order (?:ID|identifier)|order[-_ ]?id|["']?order["']?\s*:|\border of\b|\b(?:reading|tab|focus|validation|display|sort|source|paint) order\b|not ["“]?order|never ["“]?order|\border (?:details|created)\b|\border \{id\}|\border-details\b|\b(?:on this|your|earlier) order\b|\bordered strength\b|orderDetails|orderCreated|orderMeta|\bin (?:what|this|that|the same) order\b|\\?["“]order\\?["”]|\border on first use\b|removed from the order|the order ships|-order-/i.test(line),`${p}: ambiguous doctor-unit wording: ${line.slice(0,180)}`);
 }
});
test('H24: source-only Home CSS mutation invalidates --check in a private overlay',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'handoff-home-'));
 const replica=path.join(temp,'workspace/projects/portal');
 function overlay(src,dst,selected){fs.mkdirSync(dst,{recursive:true});for(const ent of fs.readdirSync(src,{withFileTypes:true})){const a=path.join(src,ent.name),b=path.join(dst,ent.name),sub=selected.filter(s=>s===ent.name||s.startsWith(ent.name+'/'));
 if(sub.includes(ent.name))fs.cpSync(a,b,{recursive:true});else if(sub.length)overlay(a,b,sub.map(s=>s.slice(ent.name.length+1)));else fs.symlinkSync(a,b);}}
 const run=()=>spawnSync(process.execPath,['scripts/build-handoff.mjs','--check'],{cwd:replica,encoding:'utf8',timeout:8000});
 try{overlay(root,replica,['scripts','handoff','app/screens/__private_overlay__']);fs.symlinkSync(path.resolve(root,'../../design-system'),path.join(temp,'workspace/design-system'));
 const baseline=run();assert.equal(baseline.error,undefined);assert.equal(baseline.status,0,baseline.stderr+baseline.stdout);
 // Replace only the replica symlink. Never open the app stylesheet or write its target.
 const css=path.join(replica,'app/screens/home.css');fs.unlinkSync(css);fs.writeFileSync(css,'/* private freshness probe: replaced source */\n');
 const changed=run();assert.equal(changed.error,undefined);assert.ok(Number.isInteger(changed.status)&&changed.status!==0,'Changed Home source accepted');assert.doesNotMatch(changed.stderr+changed.stdout,/ENOENT|Cannot find module|SyntaxError|Traceback/);
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
test('oracle: raw classifier respects token references, zero, percentages and optical sizes',()=>{
 for(const v of ['0','0 0','50%','transparent','flex','var(--tm-space-lg)','calc(100% - var(--tm-space-lg))'])assert.equal(typed(v),false,v);
 for(const v of ['1px','2px','3px','31ch','#fff','rgb(1 2 3)','calc(100% - 2px)'])assert.equal(typed(v),true,v);
 assert.equal(new Set(pictures.map(p=>p.id)).size,149);
});
