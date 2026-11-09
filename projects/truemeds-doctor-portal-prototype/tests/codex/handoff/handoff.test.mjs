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
  const notices={'tm-login-notice':'not-registered','tm-login-offline-notice':'offline','tm-login-send-error-notice':'couldnt-send','tm-login-too-many-notice':'too-many-tries','tm-login-inactive-notice':'inactive'};
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

function rawDeclarations() {
  const start=html.indexOf('<style>')+7, css=html.slice(start,html.indexOf('</style>',start));
  // Preserve offsets while stripping comments. Includes review, capture and keyboard
  // CSS: the brief says list every raw value, not only the winning screen rules.
  const clean=css.replace(/\/\*[\s\S]*?\*\//g,m=>' '.repeat(m.length));
  const out=[];
  for(const m of clean.matchAll(/([\w-]+)\s*:\s*([^;{}]+)(?=;|})/g)) {
    const value=m[2].trim();
    const residual=value.replace(/var\(--[\w-]+\)/g,'').replace(/\s|!important/g,'');
    if(!residual) continue;
    const line=html.slice(0,start+m.index).split('\n').length;
    out.push({property:m[1],value,line});
  }
  return out;
}
test('H05: every non-token CSS declaration is flagged with exact source line', () => {
  const records=[];
  for(const f of files(kit).filter(p=>p.endsWith('.json')&&!p.includes('/foundation/'))) walk(JSON.parse(read(f)),v=>{
    if(v&&typeof v==='object'&&v.raw===true) records.push(v);
  });
  for(const declaration of rawDeclarations()) {
    assert.ok(records.some(r=>{
      const text=JSON.stringify(r);
      return text.includes('sign-in.html') && r.value===declaration.value && r.property===declaration.property
        && new RegExp(`(?:"(?:line|sourceLine)"\\s*:\\s*${declaration.line}\\b|:${declaration.line}\\b)`).test(text);
    }),`Unflagged sign-in.html:${declaration.line} ${declaration.property}: ${declaration.value}`);
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
    const sample=process.env.HANDOFF_SAMPLE_DOCTOR;
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
  function run(root) {return spawnSync(command,[path.join(root,script),'--check'],{cwd:root,encoding:'utf8',timeout:120000,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});}
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
  assert.equal(nodes.filter(n=>n.attrs.class?.split(' ').includes('login-key')).length,12);
  assert.equal(nodes.filter(n=>n.attrs.id==='tm-login-mobile').length,1);
  for(const state of stateNames) {
    const shown=nodes.filter(n=>visible(n,state));
    assert.ok(shown.length>10);
    assert.equal(new Set(shown.map(n=>n.selector)).size,shown.length);
    assert.equal(shown.some(n=>n.attrs.class==='tm-spinner'),state==='sending');
    assert.equal(shown.some(n=>n.attrs.id==='tm-login-notice'),state==='not-registered');
  }
  const raw=rawDeclarations();
  assert.ok(raw.some(r=>r.line===14&&r.property==='width'&&r.value==='166px'));
  assert.ok(raw.some(r=>r.line===43&&r.property==='background'&&r.value==='#d4d7dd'));
  assert.ok(!raw.some(r=>r.line===17&&r.property==='margin-top'));
  assert.ok(hasToken('tokens.color.content.primary'));
  assert.ok(!hasToken('tokens.color.content.invented'));
});
