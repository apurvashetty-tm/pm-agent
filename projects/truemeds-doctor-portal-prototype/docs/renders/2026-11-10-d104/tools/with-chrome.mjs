// d104 run: the tests' Playwright (1.58.2) browser isn't installed on this Mac; the tests already accept CHROME=<path>.
// This sets CHROME to the installed Google Chrome (as scripts/build-handoff.mjs does by itself) and runs the given test file.
// Usage: node docs/renders/2026-11-10-d104/tools/with-chrome.mjs tests/entry-journeys.mjs [args…]
import fs from "fs";
import path from "path";
import url from "url";
const MAC_CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
if (!process.env.CHROME && fs.existsSync(MAC_CHROME)) process.env.CHROME = MAC_CHROME;
const target = path.resolve(process.argv[2]);
process.argv.splice(1, 2, target);   // the test sees itself as argv[1], with its own args after
await import(url.pathToFileURL(target).href);
