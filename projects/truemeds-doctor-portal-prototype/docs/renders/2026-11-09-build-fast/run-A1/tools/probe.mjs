// Build aid (run A1): drive the app through a few steps and print the screen text (debugging). Not a test.
import { launch } from "../../../../../tests/codex/run-A/harness.mjs";
const app = await launch();
const d = await app.open("a-confirm-failed", { prescribe: "saved" });
await d.click("Confirm prescription"); await d.settle();
console.log("AFTER CONFIRM:", (await d.root().innerText()).replace(/\s+/g, " ").slice(0, 300));
await d.click("Back to Home"); await d.settle();
console.log("AFTER BACK TO HOME:", (await d.root().innerText()).replace(/\s+/g, " ").slice(0, 300));
console.log("errors", d.errors);
await d.close(); await app.close();
