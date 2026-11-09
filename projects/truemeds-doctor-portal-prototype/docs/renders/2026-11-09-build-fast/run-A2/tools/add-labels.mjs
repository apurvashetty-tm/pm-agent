// Run A2: adds the step-5 picture labels to the copy registry (plan B6: every word through MSG(); keys only for labels the
// approved pictures already show). Then run `node ui-screens/feedback/build-messages.mjs`. Idempotent.
import fs from "node:fs";
import path from "node:path";
const dir = path.resolve(process.argv[2] || "ui-screens/feedback");
const mf = path.join(dir, "messages.json"), df = path.join(dir, "metadata.json");
const messages = JSON.parse(fs.readFileSync(mf, "utf8")), meta = JSON.parse(fs.readFileSync(df, "utf8"));
const L = (trigger, slot) => ({ pattern: "none", trigger, slot, next: "—", clear: "—", retain: "—", copy: "approved picture label (plan B6, run A2 2026-11-09)" });
const add = {
  "case.callAgain": ["Call again", L("Calling bar on 3, 4 and 6", "case action bar button")],
  "case.callback": ["Callback", L("Calling bar on 6 and 7d", "case action bar button")],
  "case.unavailable": ["Unavailable", L("Calling bar on 7d", "case action bar button")],
  "case.stillTalking": ["Still talking", L("7b Still on the call?", "case action bar button")],
  "case.callEnded": ["Call ended", L("7b Still on the call?", "case action bar button")],
  "case.unavailableTitle": ["Patient unavailable", L("Case closed as patient unavailable (9)", "outcome card title")],
  "callback.title": ["Schedule callback", L("Callback sheet", "sheet title")],
  "callback.date": ["Date", L("Callback sheet", "sheet label")],
  "callback.time": ["Time", L("Callback sheet", "sheet label")],
  "callback.today": ["Today", L("Callback sheet", "date chip")],
  "callback.tomorrow": ["Tomorrow", L("Callback sheet", "date chip")],
  "callback.confirm": ["Confirm callback", L("Callback sheet", "sheet button")],
  "callback.scheduled": ["Callback {day} at {time}", { ...L("Case closed with a callback (e-callback-scheduled)", "outcome card title"), placeholders: ["day", "time"] }],
  "callback.dayToday": ["today", L("Callback outcome card", "day word in callback.scheduled")],
  "callback.dayTomorrow": ["tomorrow", L("Callback outcome card", "day word in callback.scheduled")],
  "unavailable.title": ["Mark patient unavailable", L("Unavailable sheet (7d)", "sheet title")],
  "unavailable.selectReason": ["Select reason", L("Unavailable sheet (7d)", "sheet label")],
  "unavailable.noAnswer": ["Didn’t answer", L("Unavailable sheet (7d)", "reason title")],
  "unavailable.noAnswerDesc": ["Rang with no answer, or the line was busy", L("Unavailable sheet (7d)", "reason line")],
  "unavailable.notReachable": ["Not reachable", L("Unavailable sheet (7d)", "reason title")],
  "unavailable.notReachableDesc": ["Phone switched off or out of coverage", L("Unavailable sheet (7d)", "reason line")],
  "unavailable.wrongNumber": ["Wrong number", L("Unavailable sheet (7d)", "reason title")],
  "unavailable.wrongNumberDesc": ["Invalid or not the patient’s number", L("Unavailable sheet (7d)", "reason line")],
};
let n = 0;
for (const [k, [text, m]] of Object.entries(add)) {
  if (messages[k] !== undefined && messages[k] !== text) throw new Error(`${k} exists with other text`);
  if (messages[k] === undefined) n++;
  messages[k] = text; meta[k] = m;
}
fs.writeFileSync(mf, JSON.stringify(messages, null, 2) + "\n");
fs.writeFileSync(df, JSON.stringify(meta, null, 2) + "\n");
console.log(`added ${n} keys`);
