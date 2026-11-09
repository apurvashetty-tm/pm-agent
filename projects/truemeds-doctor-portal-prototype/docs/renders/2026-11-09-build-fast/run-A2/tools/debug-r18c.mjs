// Debug helper (run A2): 7f left before the record.
import { launch, ms } from "../../../../../tests/codex/run-A/harness.mjs";
const app = await launch();
const d = await app.open("s7f-submitted");
await d.choose("record", "delayed");
await d.p.waitForTimeout(400);
console.log("case", await d.p.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem("tm-doctor-app:review:work")).openCase.call)));
await d.click("Back to Home"); await d.settle();
console.log("records", await d.p.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem("tm-doctor-app:review:work")).records)));
await d.ff(ms("callRecordWait")); await d.p.waitForTimeout(600);
console.log("records after", await d.p.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem("tm-doctor-app:review:work")).records)));
console.log(await d.p.locator("#rp-log").evaluate((e) => e.textContent), await d.p.evaluate(() => localStorage.getItem("tm-doctor-app:review:log")));
console.log(d.errors);
await d.close(); await app.close();
