import { run } from './harness.mjs';
import { CASES as journeys } from './journeys.mjs';
import { CASES as edges } from './edges.mjs';
import { CASES as rules } from './rules.mjs';
import { CASES as options } from './options.mjs';
await run([...journeys, ...edges, ...rules, ...options]);
