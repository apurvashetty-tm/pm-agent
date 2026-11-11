// Run A2 (step 5, calling): the REVIEW-CHECKS "automation gap" items the brief assigns to this run — A-R16 (gate anchored on
// the talk time, exact minimum counted call, a new case starts its own count), A-R18 (record wait and hold policy, no premature
// hold, no earnings when unproven), A-R19 (callback missing-date and retained values, unavailable reason stored), A-R20 (pending
// block count, scroll, no request, no duplicate submit) — plus cheap ones (A-R04 counts for callback / unavailable / 7f,
// A-R13 phone Back in calling sheets and a later 3 without Back, A-R17 late result replaces 7d, known end skips 7b on Cat4).
// Reuses the Codex driver (tests/codex/run-A/harness.mjs) unchanged.
// Run: bash docs/renders/2026-11-09-build-fast/run-codex.sh tests/build-fast-a2.mjs <log>
import { run, assert, ms, copy } from "./codex/run-A/harness.mjs";
const cases = [];
const add = (id, name, state, source, test, fields = {}) => cases.push({ id, name, state, source, test, fields });
const rxCount = async (d) => (await d.root().locator("#home-rx .srow__value").innerText()).trim();
const logText = async (d) => { await d.p.locator("details[data-row=log]").evaluate((e) => { e.open = true; }); return d.p.locator("details[data-row=log]").innerText(); };
async function length(d, s) { await d.p.locator("#rp-length").selectOption(String(s)); }
async function prescribeAll(d) {
  for (let i = 0; i < 20; i++) {
    const rows = d.root().locator("#medicines-list .tm-row").filter({ hasText: "Pending" }); if (!(await rows.count())) break;
    await rows.first().click(); await d.click("Prescribe"); await d.settle();
  }
}
async function call(d, seconds, label = "Call patient") { await length(d, seconds); await d.click(label); await d.ff((seconds + 2) * 1000 + ms("pollingInterval") * 2); }

add("R16-a", "a call of exactly the counted minimum counts toward the gate", "t01-ready", "app-logic.md:118 (D-58 pt 22)", async (d) => {
  await prescribeAll(d); await call(d, ms("minCountedCall") / 1000); await d.msg("call.endedEarly");
  await d.clickControl("#rp-add-attempt"); await call(d, (ms("gate") - ms("minCountedCall")) / 1000, "Call again");
  await d.buttons(["Confirm prescription"], ["Call again", "Callback"]);
});
add("R16-b", "the gate counts from the patient's answer: 45 s ringing + 20 s talk is too short", "t01-ready", "app-logic.md:116-121 (D-58: attempted = leg 2 answered)", async (d) => {
  await prescribeAll(d); await d.choose("ring", "45"); await length(d, 20); await d.click("Call patient");
  await d.ff(ms("gate") + 2000); await d.buttons([], ["Confirm prescription"]);   // 52 s after the tap: still ringing / talking
  await d.ff(30000); await d.msg("call.endedEarly"); await d.buttons(["Call again"], ["Confirm prescription"]);
});
add("R16-b2", "45 s ringing + 50 s talk: valid only once 50 s after the answer have passed", "t01-ready", "app-logic.md:116-121", async (d) => {
  await prescribeAll(d); await d.choose("ring", "45"); await length(d, ms("gate") / 1000); await d.click("Call patient");
  await d.ff(ms("gate") + ms("pollingInterval") * 2); await d.buttons([], ["Confirm prescription"]);   // a tap-anchored count would unlock here
  await d.ff(45000); await d.buttons(["Confirm prescription"]);
});
add("R16-c", "a new case starts its own talk-time count", "c-callback", "app-logic.md:118; plan v3.2 B8", async (d) => {
  await d.click("Today"); await d.click("3:00 PM"); await d.click("Confirm callback"); await d.settle(); await d.text("Callback today at 3:00 PM");
  await d.click("Request next case"); await d.settle(); await d.buttons(["Call patient"]);
  await call(d, ms("gate") / 2000); await d.msg("call.endedEarly");   // the earlier case's 25 s are not carried over
});
add("R17-a", "Cat4, hang-up known: the timeout skips 7b and checks the record (7c → 7d)", "t02-calling", "app-logic.md:125,140-141 (CW-D1, CW-C2)", async (d) => {
  await d.choose("record", "never"); await d.choose("hangup", "reported");
  await d.ff(ms("gate")); await d.msg("call.calling", { name: "Ramesh" });   // Cat4 stays on Calling after the hang-up (no 5)
  await d.ff(ms("noResultTimeout")); await d.msg("call.resultWait"); await d.noText(copy("call.stillOnCall"));
  await d.settle(); await d.msg("call.resultMissing");
});
add("R17-b", "a late result replaces 7d by itself", "s7d-result-missing", "app-logic.md:125 (A late result updates the screen by itself)", async (d) => {
  await d.choose("record", "delayed"); await d.ff(ms("callRecordWait") / 2 + ms("pollingInterval"));
  await d.buttons(["Confirm prescription"], ["Callback", "Unavailable"]); await d.noText(copy("call.resultMissing"));
});
add("R18-a", "7f: no hold before the record wait ends; then mismatch, hold, no earnings", "s7f-submitted", "app-logic.md:143 (CW-D3, CW-D4)", async (d) => {
  await d.choose("record", "never"); await d.ff(ms("callRecordWait") - 5000);
  assert.ok(!/mismatch/i.test(await logText(d)), "no hold before the wait ends");
  await d.ff(10000); await d.log(/mismatch/i); await d.log(/hold/i); await d.text(copy("call.submittedTitle"));
  await d.click("Back to Home"); await d.settle(); assert.equal(await rxCount(d), "3", "an unproven confirm earns nothing");
});
add("R18-b", "7f: the record over the gate confirms and counts once", "s7f-submitted", "app-logic.md:143,71", async (d) => {
  await d.choose("record", "over-gate"); await d.ff(ms("pollingInterval")); await d.text("Prescription confirmed");
  await d.click("Back to Home"); await d.settle(); assert.equal(await rxCount(d), "4");
  const lines = (await logText(d)).split("\n").filter((l) => /confirm completed/i.test(l)); assert.equal(lines.length, 1);
});
add("R18-c", "7f left before the record: it still settles, counted after the doctor left", "s7f-submitted", "app-logic.md:143; plan v3.2 step 7 (late answers)", async (d) => {
  await d.choose("record", "delayed"); await d.click("Back to Home"); await d.settle(); assert.equal(await rxCount(d), "3");
  await d.ff(ms("callRecordWait")); await d.p.waitForTimeout(400); await d.log(/after the doctor left/);
  await d.root().getByRole("button", { name: "Profile", exact: true }).click(); await d.text(`₹${(4 * ms("earningsPerConfirmedRx")).toFixed(2)}`);   // 3 + the late-proven one
});
add("R18-d", "hold policy: retried by cause with the configured gap and attempts", "t01-ready", "app-logic.md:122,207 (CW-B2); settings holdRetryGap / holdRetryAttempts", async (d) => {
  await d.choose("patientFailure", "switched-off"); await d.click("Call patient"); await d.ff(ms("pollingInterval"));
  await d.text("Patient unavailable"); await d.log(new RegExp(`every ${ms("holdRetryGap") / 60000} min, up to ${ms("holdRetryAttempts")} times`));
});
add("R18-e", "hold: retried every gap up to the attempts, then plain hold; invalid number never retried", "t01-ready", "app-logic.md:123,208 (CW-B2); settings holdRetryGap / holdRetryAttempts", async (d) => {
  await d.choose("patientFailure", "busy"); await d.click("Call patient"); await d.ff(ms("pollingInterval")); await d.text("Patient unavailable");
  await d.ff(ms("holdRetryGap") - 5000); await d.p.waitForTimeout(400); assert.ok(!/hold: retry 1/.test(await logText(d)), "no retry before the gap");
  for (let n = 1; n <= ms("holdRetryAttempts"); n++) { await d.ff(n === 1 ? 5000 : ms("holdRetryGap")); await d.p.waitForTimeout(400); await d.log(new RegExp(`hold: retry ${n} of ${ms("holdRetryAttempts")}`)); }
  await d.log(/retries used, plain hold/);
});
add("R18-f", "7f unproven: the held case is retried too", "s7f-submitted", "app-logic.md:144 (CW-D3: hold and retry)", async (d) => {
  await d.choose("record", "under-gate"); await d.ff(ms("pollingInterval")); await d.log(/mismatch/);
  await d.ff(ms("holdRetryGap")); await d.p.waitForTimeout(400); await d.log(/hold: retry 1 of \d \(order .*unproven confirm\)/);
});
add("R19-a", "callback: only a time picked → Pick a date.; only a date → Pick a time.", "t06-ended-early", "app-logic.md:203", async (d) => {
  await d.click("Callback"); await d.click("3:00 PM"); await d.click("Confirm callback"); await d.msg("case.callbackPickDate");
  await d.click("Today"); await d.noText(copy("case.callbackPickDate"));   // fixing the choice clears the error
  await d.closeSheet(); await d.click("Callback"); await d.click("Today"); await d.click("Confirm callback"); await d.msg("case.callbackPickTime");
});
add("R19-b", "callback refused / failed: the exact date and time are kept; the case stays open", "t06-ended-early", "app-logic.md:204-205 (K3)", async (d) => {
  for (const [v, key] of [["refused", "callback.notReached"], ["failed", "case.callbackFailed"]]) {
    await d.choose("callback", v);
    if (!(await d.root().locator(".tm-sheet:visible").count())) await d.click("Callback");
    if ((await d.root().locator('.tm-sheet:visible [aria-pressed=true]').count()) < 2) { await d.click("Tomorrow"); await d.click("11:30 AM"); }
    await d.click("Confirm callback"); await d.settle(); await d.msg(key);
    const kept = await d.root().locator(".tm-sheet:visible [aria-pressed=true]").allInnerTexts();
    assert.deepEqual(kept.map((t) => t.trim()), ["Tomorrow", "11:30 AM"]);
  }
  await d.closeSheet(); await d.buttons(["Call again", "Callback"]); await d.msg("call.endedEarly");
});
add("R19-c", "unavailable: the chosen reason is stored exactly; callback / unavailable / 7f never count", "s7d-result-missing", "app-logic.md:209 (D-73, D-75); 71", async (d) => {
  await d.click("Unavailable"); await d.click("Wrong number"); await d.text("Patient unavailable"); await d.log(/reason saved with the case: Wrong number/);
  await d.click("Back to Home"); await d.settle(); assert.equal(await rxCount(d), "3");
});
add("R20-a", "Pending block: count in words, scroll to the first Pending, no request sent", "t08c-confirm-blocked", "app-logic.md:147,195 (Flag 5)", async (d) => {
  await d.click("Confirm prescription"); await d.msg("case.confirmBlocked", { n: 4 });
  const row = d.root().locator("#medicines-list .tm-row").filter({ hasText: "Pending" }).first();
  assert.ok(await row.evaluate((r) => { const s = r.closest("#case-scroll").getBoundingClientRect(), b = r.getBoundingClientRect(); return b.top >= s.top && b.bottom <= s.bottom; }), "first Pending row in view");
  assert.ok(!/confirm (completed|failed)|prescription saved/i.test(await logText(d)), "no confirm request sent");
  for (let i = 0; i < 3; i++) { const r = d.root().locator("#medicines-list .tm-row").filter({ hasText: "Pending" }).first(); await r.click(); await d.click("Prescribe"); await d.settle(); }
  await d.click("Confirm prescription"); await d.msg("case.confirmBlockedOne");
});
add("R20-b", "Confirming…: one submit only; the page is frozen until the answer", "t08a-valid-cat4", "app-logic.md:173,191 (D-69)", async (d) => {
  await d.click("Confirm prescription"); await d.msg("case.confirming");
  await d.root().locator("#case-actionbar .tm-btn--busy").click({ force: true }).catch(() => {});
  assert.equal(await d.root().locator("#medicines-list [role=button]").count(), 0, "rows not tappable");
  await d.settle(); await d.text("Prescription confirmed");
  const lines = (await logText(d)).split("\n").filter((l) => /confirm completed/i.test(l)); assert.equal(lines.length, 1);
});
add("R20-c", "unclear confirm: stays Confirming… and checks again; resolves to the confirmed card, one submit", "t08a-valid-cat4", "app-logic.md:191 (D-69)", async (d) => {
  await d.choose("prescribe", "confirm-busy"); await d.click("Confirm prescription"); await d.settle(); await d.msg("case.confirming");
  await d.choose("prescribe", "saved"); await d.p.waitForTimeout(ms("reconcileDelay") + 400); await d.text("Prescription confirmed");
  const lines = (await logText(d)).split("\n").filter((l) => /confirm completed/i.test(l)); assert.equal(lines.length, 1);
});
add("R20-d", "unclear confirm survives a reopen: still Confirming…, no second submit, then the failure notice", "t08a-valid-cat4", "app-logic.md:191 (D-69); plan B12", async (d) => {
  await d.choose("prescribe", "confirm-busy"); await d.click("Confirm prescription"); await d.settle();
  await d.p.reload(); await d.p.waitForTimeout(400); await d.msg("case.confirming"); await d.buttons([], ["Confirm prescription"]);
  await d.choose("prescribe", "confirm-failed"); await d.p.waitForTimeout(ms("reconcileDelay") + 400); await d.msg("case.confirmFailed");
  await d.buttons(["Confirm prescription"]);
});
add("R20-e", "7d Confirming…: Callback and Unavailable are disabled", "s7d-result-missing", "app-logic.md:191 (everything else disabled)", async (d) => {
  await d.choose("prescribe", "confirm-busy"); await d.click("Confirm prescription"); await d.settle(); await d.msg("case.confirming");
  assert.ok(await d.button("Callback").isDisabled()); assert.ok(await d.button("Unavailable").isDisabled());
});
add("R17-c", "a late result closes a sheet the new stage doesn't offer", "s7d-result-missing", "app-logic.md:145,205,209", async (d) => {
  await d.click("Callback"); await d.text("Schedule callback");
  await d.choose("record", "delayed"); await d.ff(ms("callRecordWait") / 2 + ms("pollingInterval"));
  await d.noText("Schedule callback"); await d.buttons(["Confirm prescription"], ["Callback", "Unavailable"]);
});
add("R13-a", "phone Back closes the callback and unavailable sheets; the case stays", "s7d-result-missing", "app-logic.md:205,209; plan v3.2 B13", async (d) => {
  await d.click("Callback"); await d.text("Schedule callback"); await d.back(); await d.noText("Schedule callback"); await d.msg("call.resultMissing");
  await d.click("Unavailable"); await d.text("Mark patient unavailable"); await d.back(); await d.noText("Mark patient unavailable");
  await d.buttons(["Confirm prescription", "Callback", "Unavailable"]);
  await d.back(); await d.text(copy("case.backBlocked").split(". ")[0]);   // the case itself: blocked toast, never Home
});
add("R13-b", "after the patient answered, a later 3 never brings Back", "t01-ready", "app-logic.md:101 (D-80 pt 1, D-81 F21)", async (d) => {
  await d.choose("connected", "under-gate"); await d.choose("record", "under-gate"); await call(d, 20); await d.msg("call.endedEarly");
  await d.clickControl("#rp-add-attempt"); await d.choose("doctorFailure", "3"); await d.click("Call again"); await d.ff(ms("pollingInterval"));
  await d.msg("call.notThrough"); await d.buttons(["Call again"], ["Back"]);
});
add("R13-c", "3 before the patient was ever reached keeps Back and the leave sheet", "t01-ready", "app-logic.md:101,136", async (d) => {
  await d.choose("doctorFailure", "4"); await d.click("Call patient"); await d.ff(ms("pollingInterval"));
  await d.msg("call.doctorMissed"); await d.click("Back"); await d.text("Leave this case?");
});
add("R-offline", "offline: Call and Callback fail with one notice, nothing lost; polling pauses", "t06-ended-early", "app-logic.md:270 (D-54); plan B7", async (d) => {
  await d.choose("offline", "yes"); await d.msg("case.offline"); await d.click("Call again"); await d.msg("case.offlineAction");
  await d.click("Callback"); await d.click("Today"); await d.click("3:00 PM"); await d.click("Confirm callback"); await d.msg("case.offlineAction");
  assert.equal(await d.root().locator(".tm-sheet:visible [aria-pressed=true]").count(), 2, "choices kept");
});
add("R-demo", "demo: sign-in → prescribe → call → Prescription confirmed → next case", "", "plan v3.2 step 5 (full demo run)", async (d) => {
  await d.p.goto(d.base + "?demo=1"); await d.p.waitForTimeout(200);
  await d.fill("#tm-login-mobile", "7012345678"); await d.click("Send OTP"); await d.p.waitForTimeout(800);
  await d.fill("#c", "1234"); await d.click("Verify & sign in"); await d.p.waitForTimeout(800);
  if (await d.button("Not now").count()) await d.click("Not now");
  await d.click("15 min"); await d.click("Set availability"); await d.p.waitForTimeout(800); await d.click("Request a case"); await d.p.waitForTimeout(800);
  for (let i = 0; i < 20; i++) { const r = d.root().locator("#medicines-list .tm-row").filter({ hasText: "Pending" }); if (!(await r.count())) break; await r.first().click(); await d.click("Prescribe"); await d.p.waitForTimeout(400); }
  await d.click("Call patient"); await d.p.waitForTimeout(12000);   // demo scales every time (8 s call passes the 7.5 s gate)
  await d.click("Confirm prescription"); await d.p.waitForTimeout(800); await d.text("Prescription confirmed");
  await d.click("Request next case"); await d.p.waitForTimeout(800); await d.buttons(["Call patient"]);
});
export const CASES = cases;
if (process.argv[1]?.endsWith("/build-fast-a2.mjs")) await run(CASES);
