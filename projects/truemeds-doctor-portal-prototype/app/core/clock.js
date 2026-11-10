// One app clock (plan B8). Capture uses a fixed time (checklist 2.1: fixed clock). Review fast-forward moves an offset, never a counter.
const CAPTURE_NOW = Date.UTC(2026, 10, 6, 3, 30); // 2026-11-06 09:00 IST, fixed for pictures
let fixed = null, offset = 0;
const jumps = new Set();   // listeners told at once when time jumps (a reopened app or a fast-forward polls straight away)
export const clock = {
  setMode(mode) { fixed = mode === "capture" ? CAPTURE_NOW : null; },
  now() { return (fixed ?? Date.now()) + offset; },
  fastForward(ms) { offset += ms; jumps.forEach((f) => f()); },
  onJump(fn) { jumps.add(fn); return () => jumps.delete(fn); },
  reset() { offset = 0; },
  offset() { return offset; },
};
