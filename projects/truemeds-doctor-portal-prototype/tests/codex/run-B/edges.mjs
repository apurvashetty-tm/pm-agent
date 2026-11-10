import { run } from '../run-A/harness.mjs';
import { edgeCases } from '../run-A/edges.mjs';
export const CASES = edgeCases('B');
if (process.argv[1]?.endsWith('/run-B/edges.mjs')) await run(CASES);
