import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const root = path.resolve(project, '../..');
const ds = path.join(root, 'design-system');
const read = p => fs.readFileSync(p, 'utf8');
const camel = s => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
// Paths are family + camel-cased name, as specified in brief §1. Size
// tokens retain the complete semantic name (including border/focus sizes).
const rows = [];
function add(family, name, value, unit = '') { rows.push({family, name, value, unit}); }
for (const [name, value] of Object.entries({
  'icon-size-sm':16,'icon-size-md':20,'icon-size-lg':24,'spinner-size':16,
  'spinner-ring':2,'logo-lockup-width':166,'border-width-default':1,
  'focus-ring-width':2,'focus-ring-offset':2,'icon-size-xl':32,'icon-tile-size':64,
  'target-min':48,'thumb-size':48,'control-height-lg':56,'spinner-size-lg':18,
  'check-size':18,'toggle-width':36,'toggle-height':20,'toggle-knob':16,
  'border-width-thick':2,
})) add('size', name, value, 'px');
add('radius', 'radius-full', 999, 'px');
for (const [n,v] of Object.entries({fast:150,medium:250,spinner:800,pulse:1200})) add('duration',`duration-${n}`,v,'ms');
add('easing','easing-standard','cubic-bezier(0.25, 0.1, 0.25, 1)');
add('easing','easing-sheet','cubic-bezier(0.32, 0.72, 0, 1)');
for (const [n,v] of Object.entries({raised:2,sticky:10,overlay:900,sheet:901,snackbar:950,toast:1000})) add('layer',`layer-${n}`,v);
add('shadow','shadow-bar','0 -8px 24px 0 rgba(16, 24, 40, 0.10)');
add('opacity','opacity-disabled',50,'%');
add('opacity','pressed-dim',0.92);
for (const [n,v] of Object.entries({pageMax:1280,narrow:720,mobile:420,sidenav:240,sheetMax:640,textMax:300})) {
  add('layout',`layout-${n.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}`,v,'px');
}
add('size','sheet-max-height',85,'vh');
const compact = s => String(s).replace(/\s+/g,'').replace(/0\.10\b/g,'0.1');

for (const row of rows) test(`CSS token --tm-${row.name} has the specified value`, () => {
  const css = read(path.join(ds,'truemeds.css'));
  const matches = [...css.matchAll(new RegExp(`--tm-${row.name}\\s*:\\s*([^;}]+)`, 'g'))];
  assert.ok(matches.length, `Missing --tm-${row.name}`);
  for (const m of matches) assert.equal(compact(m[1]),compact(`${row.value}${row.unit}`));
});

function at(obj, keys) { return keys.reduce((v,k)=>v?.[k],obj); }
for (const row of rows) test(`Native token ${row.name} has the specified path and value`, () => {
  const json = JSON.parse(read(path.join(ds,'native/tokens.json')));
  const short = row.name.startsWith(row.family+'-') ? row.name.slice(row.family.length+1) : row.name;
  // The brief fixes camel-casing but not whether a repeated family prefix is
  // retained in the key. Accept those two spellings only, within its family.
  const paths = [...new Set([camel(short),camel(row.name)])].map(k=>['tokens',row.family,k]);
  const hits = paths.map(p=>[p.join('.'),at(json,p)]).filter(([,v])=>v!==undefined);
  assert.ok(hits.length, `Missing ${paths.map(p=>p.join('.')).join(' or ')}`);
  for (const [p,v] of hits) {
    if (row.family === 'shadow') {
      assert.ok(v && typeof v === 'object',p);
      const pick = keys => keys.map(k=>v[k]).find(x=>x!==undefined);
      assert.equal(pick(['offsetX','x']),0,p+' x');
      assert.equal(pick(['offsetY','y']),-8,p+' y');
      assert.equal(pick(['blur','blurRadius']),24,p+' blur');
      assert.equal(pick(['spread','spreadRadius']),0,p+' spread');
      assert.equal(compact(v.color),compact('rgba(16, 24, 40, 0.10)'),p+' color');
    } else assert.equal(compact(v),compact(row.value),p);
  }
});

// Independent lexical scanner: strip token calls, strings and comments before
// looking for literals. Zero and CSS grammar numbers (grid/flex/font-weight,
// keyframe stops, etc.) are not raw design values.
export function violations(css, filename) {
  const errors=[];
  let deprecated=false, depth=0, comment=false;
  const lines=css.split('\n');
  for (let i=0;i<lines.length;i++) {
    let line=lines[i];
    if (/\/\*\s*raw-ok:\s*[^*\s][\s\S]*?\*\//.test(line)) continue;
    if (/\[DEPRECATED\]/.test(line)) deprecated=true;
    if (deprecated && /\.tm-otp(?:\b|[-_])/.test(line)) {
      depth+=(line.match(/{/g)||[]).length-(line.match(/}/g)||[]).length;
      while(depth>0 && ++i<lines.length) depth+=(lines[i].match(/{/g)||[]).length-(lines[i].match(/}/g)||[]).length;
      continue;
    }
    // Mock prescription paper is the sole selector-level exemption.
    if (/\.(?:mock-rx|rx-paper|mock-prescription)[\w-]*/.test(line)) {
      depth=(line.match(/{/g)||[]).length-(line.match(/}/g)||[]).length;
      while(depth>0 && ++i<lines.length) depth+=(lines[i].match(/{/g)||[]).length-(lines[i].match(/}/g)||[]).length;
      continue;
    }
    line=line.replace(/\/\*.*?\*\//g,'');
    if(comment) { const end=line.indexOf('*/'); if(end<0) continue; line=line.slice(end+2); comment=false; }
    if(line.includes('/*')) { line=line.slice(0,line.indexOf('/*')); comment=true; }
    line=line.replace(/var\(--[\w-]+\)/g,'TOKEN').replace(/(['"]).*?\1/g,'');
    for(const m of line.matchAll(/([\w-]+)\s*:\s*([^;{}]+)/g)) {
      const [,prop,value]=m;
      const dimensional=/(?<![\w.-])-?(?:\d*\.)?\d+(?:px|r?em|ch|vw|vh|vmin|vmax|%|ms|s)(?![\w%])/g;
      const rawDimension=[...value.matchAll(dimensional)].some(x=>parseFloat(x[0])!==0);
      const colour=/#(?:[\da-f]{3,8})\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\s*\(|\b(?:white|black|red|blue|green|gray|grey|transparent)\b/i.test(value);
      const scalar=/^(?:z-index|opacity)$/.test(prop) && /\d/.test(value) || /brightness\(\s*[.\d]/.test(value);
      if(rawDimension||colour||scalar) errors.push(`${filename}:${i+1}: ${prop}: ${value.trim()}`);
    }
  }
  return errors;
}
test('Scoped CSS contains no unmarked raw design values',()=>{
  const files=[path.join(ds,'src/components.css'),...fs.readdirSync(path.join(project,'app/screens')).filter(f=>f.endsWith('.css')).map(f=>path.join(project,'app/screens',f))];
  const errors=files.flatMap(f=>violations(read(f),path.relative(root,f)));
  assert.deepEqual(errors,[]);
});

test('Guard passes repository and rejects a planted literal in a temporary repository',()=>{
  const script=path.join(ds,'scripts/check_tokens.py');
  assert.ok(fs.existsSync(script),'Missing check_tokens.py');
  const run=(base)=>spawnSync('python3',[path.join(base,'design-system/scripts/check_tokens.py')],{cwd:base,encoding:'utf8',timeout:60000});
  const original=run(root);
  assert.equal(original.status,0,original.error?.message || original.stdout+original.stderr);
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'tm-token-test-'));
  try {
    fs.cpSync(ds,path.join(tmp,'design-system'),{recursive:true});
    const screenDir=path.join(tmp,'projects/truemeds-doctor-portal-prototype/app/screens');
    fs.mkdirSync(screenDir,{recursive:true});
    for(const f of fs.readdirSync(path.join(project,'app/screens')).filter(f=>f.endsWith('.css'))) fs.copyFileSync(path.join(project,'app/screens',f),path.join(screenDir,f));
    const clean=run(tmp);
    assert.equal(clean.status,0,'Temp baseline must pass: '+clean.stdout+clean.stderr);
    for(const [file,raw] of [[path.join(tmp,'design-system/src/components.css'),'width: 37px'],[path.join(screenDir,'codex-planted.css'),'opacity: 0.37']]) {
      const before=fs.existsSync(file)?read(file):'';
      fs.writeFileSync(file,before+`\n.codex-planted { ${raw}; }\n`);
      const result=run(tmp);
      assert.ok(!result.error,result.error?.message);
      assert.ok(Number.isInteger(result.status)&&result.status!==0,'Guard accepted '+raw);
      fs.writeFileSync(file,before);
    }
  } finally {fs.rmSync(tmp,{recursive:true,force:true});}
});

test('RULES sections cover the expanded token scope and native review question',()=>{
  const rules=read(path.join(ds,'RULES.md'));
  function section(n) {
    const match=rules.match(new RegExp(`^##\\s+${n}(?:[.· :—–]|\\s)[^\\n]*\\n([\\s\\S]*?)(?=^##\\s|$(?![\\s\\S]))`,'m'));
    assert.ok(match,`Missing section ${n}`); return match[1];
  }
  const two=section(2);
  for(const term of [/sizes?/i,/border(?: widths?)?/i,/timing/i,/layering/i,/shadow/i,/opacity/i]) assert.match(two,term);
  assert.match(section(5),/Would the native app need a name for this value\?\s*If yes, it[’']s a token\./i);
});


test('Independent scanner detects the required literal categories',()=>{
  for(const declaration of ['width: 37px','color: #abc','border: 2px solid TOKEN','z-index: 9','opacity: .4','transition: all 150ms','filter: brightness(0.92)','max-height: 85vh','width: 33%']) {
    assert.equal(violations(`.x { ${declaration}; }`,'fixture.css').length,1,declaration);
  }
  assert.equal(violations('.x { width: 37px; } /* raw-ok: prototype keyboard */','fixture.css').length,0);
  for(const marker of ['/* raw-ok: */','/* raw-ok:   */']) assert.equal(violations(`.x { width: 37px; } ${marker}`,'fixture.css').length,1);
  assert.equal(violations('/* raw-ok: previous line does not count */\n.x { width: 37px; }','fixture.css').length,1);
  assert.equal(violations('.x { width: var(--tm-thumb-size); margin: 0; }','fixture.css').length,0);
  assert.equal(violations('/* [DEPRECATED] */\n.tm-otp { width: 37px; }\n.other { width: 37px; }','fixture.css').length,1);
  assert.equal(violations('.rx-paper { width: 37px; }\n.other { width: 37px; }','fixture.css').length,1);
});
