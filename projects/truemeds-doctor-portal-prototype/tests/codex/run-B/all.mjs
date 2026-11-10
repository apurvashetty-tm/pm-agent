import { run } from '../run-A/harness.mjs';
import { CASES as journeys } from './journeys.mjs';
import { CASES as edges } from './edges.mjs';
await run([...journeys, ...edges]);
