// Static verification only: imports test declarations, allowed settings and generated map, never screen implementations.
import assert from 'node:assert/strict';
import { CASES as journeysA } from './run-A/journeys.mjs';
import { CASES as rulesA } from './run-A/rules.mjs';
import { CASES as optionsA } from './run-A/options.mjs';
import { CASES as journeysB } from './run-B/journeys.mjs';
import { edgeCases } from './run-A/edges.mjs';
import { MAP } from './run-A/harness.mjs';
const a=[...journeysA,...rulesA,...optionsA,...edgeCases('A')];
const b=[...journeysB,...edgeCases('B')];
const all=[...a,...b];
const states=new Set([...MAP.pictures,...MAP.others].map(r=>r.id));
assert.equal(new Set(all.map(c=>c.id)).size,all.length,'Unique test IDs');
for(const c of all){assert.ok(c.source,c.id+' source');assert.equal(typeof c.test,'function');if(c.state)assert.ok(states.has(c.state),c.id+' fixture exists');}
const edges=MAP.edges.filter(e=>e.route!=='A'&&!['A11','A2'].includes(e.to));
assert.equal(edgeCases('A').length+edgeCases('B').length,edges.length,'All launch edges assigned');
console.log(JSON.stringify({runA:a.length,runB:b.length,total:all.length,launchEdges:edges.length,status:'PASS (static only)'}));
