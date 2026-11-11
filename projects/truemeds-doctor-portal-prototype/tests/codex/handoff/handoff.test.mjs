import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const project = path.resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const kit = path.resolve(process.env.HANDOFF_DIR || path.join(project, 'handoff'));
const read = p => fs.readFileSync(p, 'utf8');
const sourceHTML = path.join(project, 'ui-screens/sign-in/sign-in.html');
const html = read(sourceHTML);
const tokenSource = path.resolve(project, '../../design-system/native/tokens.ts');
const messageSource = path.join(project, 'ui-screens/native/messages.ts');
function exportedObject(file, name) {
  const text = read(file), start = text.indexOf('{', text.indexOf(`export const ${name}`));
  assert.ok(start >= 0, `${file}: missing export ${name}`);
  let depth = 0, quoted = false, escaped = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (quoted) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === '"') quoted = false; }
    else if (c === '"') quoted = true;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return JSON.parse(text.slice(start, i + 1));
  }
  throw Error(`Unclosed object: ${file}`);
}
const tokens = exportedObject(tokenSource, 'tokens');
const messages = exportedObject(messageSource, 'messages');
function files(dir) {
  assert.ok(fs.existsSync(dir), `Missing ${dir}`);
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => {
    const p = path.join(dir, e.name);
    assert.ok(!e.isSymbolicLink(), `Kit must travel independently; symlink: ${p}`);
    return e.isDirectory() ? files(p) : [p];
  });
}
function textual(p) { return /\.(?:md|json|[cm]?js|ts|tsx|html|css|svg|txt|ya?ml)$/i.test(p); }
function walk(value, fn, trail = []) {
  fn(value, trail);
  if (value && typeof value === 'object') for (const [k,v] of Object.entries(value)) walk(v, fn, [...trail,k]);
}
const screen = () => JSON.parse(read(path.join(kit,'screens/sign-in.json')));
const states = () => {
  const s = screen().states;
  assert.ok(s && typeof s === 'object', 'sign-in.json must expose states (array or id-keyed object)');
  return Array.isArray(s) ? s : Object.entries(s).map(([id,v]) => ({id,...v}));
};
const stateNames = [...html.matchAll(/<option value="([^"]+)"/g)].map(m=>m[1]);
const normalizeState = s => s.replace(/^(?:signin\.|sign-in[._-])/, '');
const hasToken = name => {
  let v = tokens;
  for (const k of name.replace(/^tokens\./,'').split('.')) {
    if (!v || !Object.hasOwn(v,k)) return false;
    v=v[k];
  }
  return true;
};

test('H01: required portable kit layout', () => {
  for (const f of ['README.md','AGENTS.md','CLAUDE.md','.claude/skills/truemeds-native-ui/SKILL.md',
    'DECIDED.md','OPEN.md','CHANGES.md','foundation/tokens.ts','foundation/tokens.json',
    'foundation/icons.ts','foundation/messages.ts','screens/sign-in.json','viewer/index.html']) {
    assert.ok(read(path.join(kit,f)).trim(), `Missing/empty ${f}`);
  }
  assert.ok(files(path.join(kit,'components')).some(p=>p.endsWith('.json')), 'No block specs');
  files(kit);
});
test('H02: native references resolve, copied tokens and messages match source', () => {
  assert.deepEqual(exportedObject(path.join(kit,'foundation/tokens.ts'),'tokens'),tokens);
  assert.deepEqual(JSON.parse(read(path.join(kit,'foundation/tokens.json'))),tokens);
  assert.deepEqual(exportedObject(path.join(kit,'foundation/messages.ts'),'messages'),messages);
  let count=0;
  for (const f of files(kit).filter(textual)) {
    const text=read(f);
    for (const m of text.matchAll(/\btokens((?:\.[A-Za-z0-9_$]+|\[['"][^'"]+['"]\])+)/g)) {
      const name='tokens'+m[1].replace(/\[['"]([^'"]+)['"]\]/g,'.$1');
      if (['tokens.ts','tokens.json'].includes(name)) continue;
      assert.ok(hasToken(name), `${f}: unknown ${name}`); count++;
    }
    if (f.endsWith('.json') && !f.includes('/foundation/')) walk(JSON.parse(text),(v,keys)=>{
      if (typeof v==='string' && /^(?:native|nativeToken|tokenName|token)$/i.test(keys.at(-1))) {
        assert.ok(v.startsWith('tokens.') && hasToken(v),`${f}: invalid native token ${v}`);
      }
    });
  }
  assert.ok(count,'No native token references found');
});
test('H03: every copy reference resolves; all source Sign-in copy keys represented', () => {
  const found=new Set();
  for (const f of files(kit).filter(p=>p.endsWith('.json')&&!p.includes('/foundation/'))) walk(JSON.parse(read(f)),(v,keys)=>{
    if (/^(?:copyKey|messageKey|copyKeys|messageKeys)$/i.test(keys.at(-1))) {
      for (const key of Array.isArray(v)?v:[v]) {
        assert.equal(typeof key,'string',`${f}: copy key must be a string`);
        const clean=key.replace(/^messages\./,'');
        assert.ok(Object.hasOwn(messages,clean),`${f}: unknown copy key ${key}`); found.add(clean);
      }
    }
  });
  for (const key of Object.keys(messages).filter(k=>k.startsWith('signin.'))) assert.ok(found.has(key),`Missing ${key}`);
});

// Source markup inventory, not a list supplied by the generator. Every DOM node inside
// the phone is included, including containers, decorative icons and keyboard keys.
function inventory() {
  const body=html.slice(html.indexOf('<section class="login-phone'),html.indexOf('</section>')+10);
  const stack=[], nodes=[];
  const tags=/<\/?([\w-]+)\b([^>]*?)>/g;
  for (const m of body.matchAll(tags)) {
    if(m[0].startsWith('</')) { stack.pop(); continue; }
    const attrs=Object.fromEntries([...m[2].matchAll(/([\w-]+)="([^"]*)"/g)].map(x=>[x[1],x[2]]));
    const parent=stack.at(-1), siblings=nodes.filter(n=>n.parent===parent&&n.tag===m[1]);
    const selector=attrs.id?`#${attrs.id}`:(parent?parent.selector+' > ':'')+m[1]+`:nth-of-type(${siblings.length+1})`;
    const node={tag:m[1],attrs,parent,selector,line:html.slice(0,html.indexOf(body)+m.index).split('\n').length};
    nodes.push(node);
    if(!['img','input','br','hr','meta','link'].includes(m[1])) stack.push(node);
  }
  return nodes;
}
function visible(node,state) {
  // 2026-11-11 (r2-build, U1): the approved reference uses the app's notice ids (tm-login-<state>-notice) — test edit, not a dispute.
  const notices={'tm-login-not-registered-notice':'not-registered','tm-login-offline-notice':'offline','tm-login-couldnt-send-notice':'couldnt-send','tm-login-too-many-tries-notice':'too-many-tries','tm-login-inactive-notice':'inactive'};
  for(let n=node;n;n=n.parent) {
    if(notices[n.attrs.id] && notices[n.attrs.id]!==state) return false;
    if(n.attrs.id==='tm-login-helper' && Object.values(notices).includes(state)) return false;
    const cls=n.attrs.class||'';
    const keyboard=['keyboard-open','empty-tap','too-short','wrong-first-digit','pasted-cleaned','sending'].includes(state);
    if(cls.split(' ').includes('login-keyboard')&&!keyboard) return false;
    if(n.attrs.id==='tm-signup-option'&&keyboard) return false;
    if(cls.split(' ').includes('tm-spinner')&&state!=='sending') return false;
  }
  return true;
}
test('H04: all 12 states, all visible source elements, complete element contracts', () => {
  assert.equal(stateNames.length,12);
  const list=states(); assert.equal(list.length,12);
  assert.deepEqual(list.map(s=>normalizeState(s.id)).sort(),[...stateNames].sort());
  for(const state of list) {
    const id=normalizeState(state.id);
    assert.ok(Array.isArray(state.elements)&&state.elements.length,`${id}: no elements`);
    const selectors=new Set();
    for(const element of state.elements) {
      // sourceSelector is the stable audit join. Multiple selectors may be covered by
      // a compound block via sourceSelectors; neither changes the kit's product model.
      for(const s of [element.sourceSelector,element.selector,...(element.sourceSelectors||[])].filter(Boolean)) selectors.add(s);
      for(const key of ['id','block','variant','tokens']) assert.ok(element[key]!==undefined,`${id}/${element.id}: missing ${key}`);
      assert.ok(element.spacing||element.spacingTokens,`${id}/${element.id}: missing neighbour spacing`);
      assert.ok(element.behaviour||element.behavior||element.behaviourRef||element.behaviorRef,`${id}/${element.id}: missing behaviour`);
      assert.ok(element.accessibility||element.a11y,`${id}/${element.id}: missing accessibility`);
    }
    for(const node of inventory().filter(n=>visible(n,id))) assert.ok(selectors.has(node.selector),`${id}: missing ${node.selector} (sign-in.html:${node.line})`);
    const text=JSON.stringify(state);
    for(const width of [360,390]) {
      const expected=`sign-in_${id}_w${width}.png`;
      assert.ok(text.includes(expected),`${id}: missing approved ${width} picture`);
      assert.ok(files(kit).some(p=>path.basename(p)===expected),`${id}: ${expected} not bundled`);
    }
    assert.match(text,/app-logic|feedback-state-map/,`${id}: no source rule`);
  }
});

// D-98: audit screen rules, excluding the reference document's scaffolding.
function declarations(css, baseLine = 1) {
  const clean=css.replace(/\/\*[\s\S]*?\*\//g,m=>' '.repeat(m.length));
  const out=[];
  for(const rule of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector=rule[1].trim();
    if(selector.split(',').every(s=>/^(?:html\b|body\b|\.review-controls)/.test(s.trim()))) continue;
    for(const m of rule[2].matchAll(/([\w-]+)\s*:\s*([^;{}]+)(?=;|$)/g)) {
      const value=m[2].trim();
      const offset=rule.index+rule[0].indexOf('{')+1+m.index;
      out.push({selector,property:m[1],value,line:baseLine+(css.slice(0,offset).match(/\n/g)||[]).length});
    }
  }
  return out;
}
function typedKind(value) {
  const v=value.replace(/var\(--[\w-]+\)/g,'').replace(/!important/g,'');
  if(/#[0-9a-f]{3,8}\b|(?:rgba?|hsla?|oklch|color)\(|\b(?:white|black|red|blue)\b/i.test(v)) return 'colour';
  if(/(?:\d*\.)?\d+(?:px|ch|r?em|[ds]?v[wh]|pt|%)\b/.test(v)) return 'size';
  return null;
}
function rawDeclarations() {
  const start=html.indexOf('<style>')+7;
  return declarations(html.slice(start,html.indexOf('</style>',start)),html.slice(0,start).split('\n').length)
    .filter(d=>typedKind(d.value));
}
function rawRecords() {
  const records=[];
  for(const f of files(kit).filter(p=>p.endsWith('.json')&&!p.includes('/foundation/'))) walk(JSON.parse(read(f)),v=>{
    if(v&&typeof v==='object'&&v.raw===true) records.push(v);
  });
  return records;
}
function documentedException(r) {
  // Only D-98's expressly accepted text measure; arbitrary exception labels cannot waive failures.
  return r.property==='max-width' && r.value==='31ch' && /31ch/.test(JSON.stringify(screen()))
    && /(?:text measure|documented exception)/i.test(JSON.stringify(screen()));
}
test('H05: typed reference values flagged with exact line; scaffolding excluded', () => {
  const records=rawRecords();
  for(const d of rawDeclarations()) {
    assert.ok(documentedException(d)||records.some(r=>{
      const text=JSON.stringify(r);
      return text.includes('sign-in.html') && r.value===d.value && r.property===d.property
        && new RegExp(`(?:"(?:line|sourceLine)"\\s*:\\s*${d.line}\\b|:${d.line}\\b)`).test(text);
    }),`Unflagged sign-in.html:${d.line} ${d.property}: ${d.value}`);
  }
  for(const r of screen().rawValues.approvedReference) {
    assert.doesNotMatch(r.selector||'',/^(?:html\b|body\b|\.review-controls)/,'Scaffolding leaked into reference audit');
  }
});
test('H10: red means typed size, colour or word; no unexplained built Sign-in red',()=>{
  const records=rawRecords();
  for(const r of records) {
    assert.ok(typedKind(r.value||'') || ['copy','word','text'].includes(r.kind),`Layout/zero flagged red: ${JSON.stringify(r)}`);
    if(!JSON.stringify(r).includes('sign-in.html')) assert.ok(documentedException(r),`Unexplained built red: ${JSON.stringify(r)}`);
  }
  for(const state of states()) for(const e of state.elements) {
    for(const style of e.styles||[]) {
      if(typedKind(style.value||'')) assert.ok(style.raw===true || documentedException(style) ||
        (style.tokens?.length && !typedKind(style.value.replace(/var\(--[\w-]+\)/g,''))),`Unflagged ${state.id}/${e.id}: ${JSON.stringify(style)}`);
      for(const t of style.tokens||[]) assert.ok(!t.unmapped && t.native && hasToken(t.native),`Unmapped token: ${JSON.stringify(t)}`);
    }
    for(const c of e.copy||[]) assert.ok(!c.literal,`Typed copy: ${JSON.stringify(c)}`);
  }

});
test('H11: new size token references resolve to canonical native tokens',()=>{
  const map=JSON.parse(read(path.join(kit,'foundation/token-map.json')));
  const text=JSON.stringify(map);
  for(const row of map.tokens) assert.ok(hasToken(row.native), `Unknown canonical native token ${row.native}`);
  for (const state of states()) for (const element of state.elements) {
    for (const style of element.styles || []) for (const token of style.tokens || []) {
      assert.ok(hasToken(token.native), `Unknown native token ${token.native}`);
      assert.ok(text.includes(token.web), `Missing web mapping ${token.web}`);
    }
  }
});
test('H12: prefix and logo accessible name have message keys and MSG consumers',()=>{
  for(const value of ['+91','truemeds for doctors']) {
    const keys=Object.keys(messages).filter(k=>messages[k]===value);
    assert.ok(keys.length,`Missing message key for ${value}`);
    assert.ok(states().some(state=>state.elements.some(e=>keys.some(key=>JSON.stringify(e).includes(key)))),`Missing kit consumer for ${value}`);
  }
});
test('H13: native logo PNGs at 1x/2x/3x with locked SVG source sha256',()=>{
  const dir=path.join(kit,'foundation/brand'), all=files(dir);
  const pngs=all.filter(p=>p.endsWith('.png'));
  const widths=[];
  for(const p of pngs) {
    const b=fs.readFileSync(p);
    assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
    assert.equal(b.subarray(12,16).toString(),'IHDR');
    widths.push(b.readUInt32BE(16));
    assert.ok(b.readUInt32BE(20)>0);
  }
  for(const width of [166,332,498]) assert.ok(widths.includes(width),`Missing logo width ${width}`);
  assert.ok(all.filter(textual).some(p=>/sha256[\s\S]*[a-f0-9]{64}/i.test(read(p))), 'Missing source SVG sha256 note');
});
test('H14: D-98 questions are DECIDED, not OPEN',()=>{
  const decided=read(path.join(kit,'DECIDED.md')), open=read(path.join(kit,'OPEN.md'));
  for(const id of ['o06','o13','o14','o20']) {
    assert.match(decided,new RegExp(`id="${id}"`),`Missing DECIDED ${id}`);
    assert.doesNotMatch(open,new RegExp(`(?:id="${id}"|\\b${id}\\s*[·|])`),`Still OPEN: ${id}`);
    const entry=decided.slice(decided.indexOf(`id="${id}"`)).split(/<a id=/)[0];
    assert.match(entry,/D-98/,`${id} lacks D-98 provenance`);
  }
});

test('H06: no internal files, wording, personal details or external-repo dependencies',()=>{
  assert.ok(files(kit).some(p=>textual(p)), 'No textual kit content to inspect');
  const forbidden=/\b(?:git|netlify|codex|terminal[ -]brief|render[ -]rules|review history|NEEDS-APURVA|Apurva|Swapnil|Claude Code)\b|\.git(?:\/|\b)|\/Users\/|pm-agent|gh[pousr]_[A-Za-z0-9]+|sk-[A-Za-z0-9]{16,}/i;
  for(const f of files(kit)) {
    const rel=path.relative(kit,f);
    assert.doesNotMatch(rel,forbidden,`Internal path ${rel}`);
    if(!textual(f)) continue;
    let text=read(f);
    // OFL is a legal notice: copyright holders and official github.com/google/fonts
    // provenance are required, not personal information leaked from the workspace.
    if(path.basename(f)==='OFL.txt') continue;
    text=text.replace(/https:\/\/github\.com\/google\/fonts[^\s)"<>]*/g,'OFFICIAL_FONT_SOURCE');
    assert.doesNotMatch(text,forbidden,`Internal content in ${rel}`);
    const names=[...text.matchAll(/\bDr\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g)].map(m=>m[0]);
    const sample='Dr. Kunal';
    for(const name of names) assert.equal(name,sample,`${rel}: unapproved personal name ${name}; set HANDOFF_SAMPLE_DOCTOR to the exact approved sample only`);
    assert.doesNotMatch(text,/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,`${rel}: email address`);
  }
});
test('H07: AI pack points to real kit files and shares one instruction source',()=>{
  assert.equal(read(path.join(kit,'CLAUDE.md')).trim(),'@AGENTS.md');
  for(const file of ['AGENTS.md','.claude/skills/truemeds-native-ui/SKILL.md']) {
    const text=read(path.join(kit,file));
    for(const target of ['foundation/tokens.ts','foundation/messages.ts','screens/sign-in.json','components/','DECIDED.md','OPEN.md']) {
      assert.ok(text.includes(target),`${file}: missing ${target}`);
      assert.ok(fs.existsSync(path.join(kit,target)),`${file}: broken ${target}`);
    }
    for(const m of text.matchAll(/\]\(([^)]+)\)/g)) {
      if(/^(?:https?:|#)/.test(m[1])) continue;
      const target=path.resolve(path.dirname(path.join(kit,file)),m[1].split('#')[0]);
      assert.ok(target.startsWith(kit+path.sep),`${file}: points outside kit`);
      assert.ok(fs.existsSync(target),`${file}: broken link ${m[1]}`);
    }
  }
  const agents=read(path.join(kit,'AGENTS.md'));
  for(const pattern of [/React Native/i,/tokens/,/messages/,/case/,/one primary/i,/DECIDED/,/OPEN/]) assert.match(agents,pattern);
});
test('H08: four static TTFs, weight metadata, OFL, matching sha256 and platform setup',()=>{
  const all=files(kit), fonts=all.filter(f=>/\.ttf$/i.test(f));
  assert.equal(fonts.length,4,'Exactly four static font weights required');
  const note=all.find(f=>path.basename(f)==='FONTS.md'); assert.ok(note,'Missing FONTS.md');
  const text=read(note); assert.match(text,/github\.com\/google\/fonts/);
  for(const p of [/Plus Jakarta Sans/,/iOS/i,/Android/i,/400/,/500/,/600/,/700/]) assert.match(text,p);
  assert.ok(all.some(p=>path.basename(p)==='OFL.txt'),'Missing OFL.txt');
  const weights=[];
  for(const f of fonts) {
    const data=fs.readFileSync(f), hash=crypto.createHash('sha256').update(data).digest('hex');
    assert.ok(text.includes(path.basename(f))&&text.includes(hash),`Missing name/hash for ${f}`);
    assert.equal(data.readUInt32BE(0),0x00010000,`${f}: not a TrueType sfnt`);
    const tables=new Map();
    for(let i=0;i<data.readUInt16BE(4);i++){const o=12+i*16;tables.set(data.toString('ascii',o,o+4),data.readUInt32BE(o+8));}
    assert.ok(!tables.has('fvar'),`${f}: variable font, static required`);
    assert.ok(tables.has('OS/2'),`${f}: missing weight table`);
    weights.push(data.readUInt16BE(tables.get('OS/2')+4));
  }
  assert.deepEqual(weights.sort((a,b)=>a-b),[400,500,600,700]);
});

test('H09: --check passes fresh, fails after a source-only change (isolated replica)',()=>{
  const script=['scripts/build-handoff.mjs','scripts/build-handoff.py'].find(p=>fs.existsSync(path.join(project,p)));
  assert.ok(script,'Missing one-command builder');
  const command=script.endsWith('.py')?'python3':process.execPath;
  function run(root) {return spawnSync(command,[path.join(root,script),'--check'],{cwd:root,encoding:'utf8',timeout:8000,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});}
  const baseline=run(project);
  assert.equal(baseline.status,0,`Fresh --check failed: ${baseline.stderr}\n${baseline.stdout}`);
  // Copy-on-write directory overlay: never modify a real source. Other entries are
  // symlinked, including app/ (never opened by this suite). Builder owns its reads.
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'handoff-check-'));
  const replica=path.join(temp,'workspace/projects/pilot');
  fs.mkdirSync(replica,{recursive:true});
  function overlay(original,destination,overrides) {
    fs.mkdirSync(destination,{recursive:true});
    for(const entry of fs.readdirSync(original,{withFileTypes:true})) {
      const src=path.join(original,entry.name), dst=path.join(destination,entry.name);
      const selected=overrides.filter(p=>p===entry.name||p.startsWith(entry.name+'/'));
      if(selected.some(p=>p===entry.name)) fs.cpSync(src,dst,{recursive:true});
      else if(selected.length) overlay(src,dst,selected.map(p=>p.slice(entry.name.length+1)));
      else fs.symlinkSync(src,dst);
    }
  }
  try {
    overlay(project,replica,['scripts','handoff','ui-screens/native/messages.ts']);
    fs.symlinkSync(path.resolve(project,'../../design-system'),path.join(temp,'workspace/design-system'));
    const copied=run(replica);
    assert.equal(copied.status,0,`Replica baseline must pass before mutation: ${copied.stderr}\n${copied.stdout}`);
    const file=path.join(replica,'ui-screens/native/messages.ts');
    const before=read(file);
    assert.ok(before.includes('Welcome, Doctor'));
    fs.writeFileSync(file,before.replace('Welcome, Doctor','Welcome, Doctor [stale-check probe]'));
    const changed=run(replica);
    assert.equal(changed.error,undefined,`--check execution error: ${changed.error}`);
    assert.ok(changed.status!==null&&changed.status!==0,'--check accepted changed source');
    assert.doesNotMatch(changed.stderr||'',/ENOENT|Cannot find module|SyntaxError|Traceback/, 'Failure must indicate staleness, not broken replica');
  } finally {fs.rmSync(temp,{recursive:true,force:true});}
});

// Harness checks are independent of whether the parallel build is finished.
test('oracle: state and DOM inventories are populated from the approved fixture',()=>{
  assert.equal(new Set(stateNames).size,12);
  const nodes=inventory();
  assert.equal(nodes.filter(n=>n.attrs.class?.split(' ').includes('mock-kbd__key')).length,12);   // r2-build U1: the app's drawn keyboard
  assert.equal(nodes.filter(n=>n.attrs.id==='tm-login-mobile').length,1);
  for(const state of stateNames) {
    const shown=nodes.filter(n=>visible(n,state));
    assert.ok(shown.length>10);
    assert.equal(new Set(shown.map(n=>n.selector)).size,shown.length);
    assert.equal(shown.some(n=>n.attrs.class==='tm-spinner'),state==='sending');
    assert.equal(shown.some(n=>n.attrs.id==='tm-login-not-registered-notice'),state==='not-registered');
  }
  const raw=rawDeclarations();
  // r2-build U1: the reference now takes the screen's styles from the app; its only typed values are the page frame (line 20).
  assert.ok(raw.some(r=>r.line===20&&r.property==='height'&&r.value==='844px'));
  // (the drawn keyboard's colours now live in app/shell/mock-keyboard.css, the one file exempt from the token rule)
  assert.ok(!raw.some(r=>r.property==='background'&&r.value==='#d4d7dd'));
  assert.ok(!raw.some(r=>r.property==='margin-top'));
  assert.ok(hasToken('tokens.color.content.primary'));
  assert.ok(!hasToken('tokens.color.content.invented'));
});


test('oracle: D-98 red classification and scaffold boundary',()=>{
  for(const value of ['flex','center','nowrap','none','0','0 0','var(--tm-space-lg)','calc(-1 * var(--tm-space-lg))']) assert.equal(typedKind(value),null,value);
  for(const value of ['166px','1px solid var(--tm-border-default)','2px','#fff','rgb(1,2,3)']) assert.ok(typedKind(value),value);
  const css='html,body {width:12px;} .review-controls select {height:44px;} html.capture .login-phone {width:390px;} .login-logo {width:166px;}';
  assert.deepEqual(declarations(css).map(d=>d.value),['166px']);
});
