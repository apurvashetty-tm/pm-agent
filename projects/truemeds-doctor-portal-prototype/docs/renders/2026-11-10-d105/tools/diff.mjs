// d105: pixel diff of the unlock pictures in two folders (same names). Prints % of differing pixels and the changed row band.
//   node diff.mjs <folder A> <folder B>   (from the project folder)
import { createRequire } from "module";
import fs from "fs"; import path from "path";
const require = createRequire(path.resolve("tests/package.json"));
const { PNG } = require("pngjs");
const [A, B] = process.argv.slice(2);
const out = {};
for (const f of fs.readdirSync(B).filter((f) => /^unlock_.*\.png$/.test(f)).sort()) {
  const a = PNG.sync.read(fs.readFileSync(path.join(A, f))), b = PNG.sync.read(fs.readFileSync(path.join(B, f)));
  if (a.width !== b.width || a.height !== b.height) { out[f] = `size ${a.width}x${a.height} vs ${b.width}x${b.height}`; continue; }
  let n = 0, top = -1, bottom = -1;
  for (let y = 0; y < a.height; y++) for (let x = 0; x < a.width; x++) {
    const i = (y * a.width + x) * 4;
    // tolerance 24 per channel: font anti-aliasing differs between Chrome builds (method proof: ~3 % exact-pixel noise, invisible)
    if (Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2])) > 24) { n++; if (top < 0) top = y; bottom = y; }
  }
  out[f] = n === 0 ? "identical" : `${(100 * n / (a.width * a.height)).toFixed(2)} % · rows ${top}–${bottom} of ${a.height} (2x)`;
}
console.log(JSON.stringify(out, null, 1));
