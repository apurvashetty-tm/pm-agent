// Run B (steps 6–8, Pilot Fallback B and across journeys): the run-B REVIEW-CHECKS "automation gap" items — B-R01 (live gate from
// the patient's answer, only while live, talk time adds up, Non-Value same flow), B-R02 (HA doesn't pick up → 14, B2 frozen),
// B-R03 (forward confirmed once on the partner's result, mismatch + hold, settles after the doctor left), B-R04 (Skip HA reason
// stored exactly, ✕ cancels), B-R05 (17 → 6 → retry stays HA skipped; 17 → 8a → 10a), B-R06 (Pilot 7d → forward → 10b / hold,
// Still talking stays Pilot), B-R07 (availability ends during B3), B-R09 (reload during 13 counts once), B-R12 (distinct
// completed events) — plus offline and phone Back on the Pilot stages. Reuses the Codex driver (tests/codex/run-A/harness.mjs).
// Run: bash docs/renders/2026-11-09-build-fast/run-codex.sh tests/build-fast-b.mjs <log>
import { run, assert, ms, copy } from "./codex/run-A/harness.mjs";
const cases = [];
const PILOT = { scenario: "pilot_ha_free" };
const add = (id, name, state, source, test, fields = PILOT) => cases.push({ id, name, state, source, test, fields });
const rxCount = async (d) => (await d.root().locator(".rx strong").innerText()).trim();
const logText = async (d) => { await d.p.locator("details[data-row=log]").evaluate((e) => { e.open = true; }); return d.p.locator("details[data-row=log]").innerText(); };
const logCount = async (d, re) => (await logText(d)).split("\n").filter((l) => re.test(l)).length;
async function length(d, s) { await d.p.locator("#rp-length").selectOption(String(s)); }
async function prescribeAll(d) {
  for (let i = 0; i < 20; i++) {
    const rows = d.root().locator("#medicines-list .tm-row").filter({ hasText: "Pending" }); if (!(await rows.count())) break;
    await rows.first().click(); await d.click("Prescribe"); await d.settle();
  }
}
const poll = (n = 1) => ms("pollingInterval") * n;
const TRANSFER = /confirm completed: transfer — transferred to Health Advisor/;
const FORWARD = /confirm completed: forward — forwarded to Health Advisor/;

// B-R01
add("BR01-a", "B1 appears at the gate counted from the patient's answer, not the tap", "t01-ready", "app-logic.md:120 (Launch B)", async (d) => {
  await prescribeAll(d); await d.choose("ring", "20"); await d.click("Call patient");
  await d.ff(ms("gate") + poll()); await d.buttons([], ["Confirm prescription", "Skip HA"]);   // 53 s after the tap, 33 s after the answer
  await d.ff(20000); await d.buttons(["Confirm prescription", "Skip HA"]); await d.msg("call.scriptNeutral");
});
add("BR01-b", "a Pilot call that ends before the gate never shows B1: result → 6", "t01-ready", "app-logic.md:120-122", async (d) => {
  await prescribeAll(d); await length(d, 30); await d.click("Call patient");
  await d.ff(ms("gate") * 2); await d.msg("call.endedEarly"); await d.buttons(["Call again", "Callback"], ["Confirm prescription", "Skip HA"]);
});
add("BR01-c", "talk time adds up on the live gate: 20 s, then B1 30 s into the next call", "t01-ready", "app-logic.md:118,120 (D-58 pt 22)", async (d) => {
  await prescribeAll(d); await length(d, 20); await d.click("Call patient"); await d.ff(30000); await d.msg("call.endedEarly");
  await d.clickControl("#rp-add-attempt"); await length(d, "auto"); await d.click("Call again"); await d.msg("call.scriptNeutral");
  await d.ff(25000); await d.buttons([], ["Confirm prescription"]);
  await d.ff(5000 + poll()); await d.buttons(["Confirm prescription", "Skip HA"]);
});
add("BR01-d", "Non-Value Meds (no HA free) play the same B flow: B1 → B2 → B3", "t01-ready", "app-logic.md:177 (Non-Value Meds go through the same HA check)", async (d) => {
  await prescribeAll(d); await d.click("Call patient"); await d.ff(ms("gate") + poll());
  await d.buttons(["Confirm prescription", "Skip HA"]); await d.click("Confirm prescription"); await d.msg("call.checkingHa");
  await d.settle(); await d.msg("call.waitingForHangup"); await d.msg("call.forwardedTell");
}, { scenario: "pilot_no_ha_free" });
// B-R02
add("BR02-a", "an HA who rings but never picks up is 14 Transferred for the doctor", "g2-checking-ha", "app-logic.md:124 (CW-E1)", async (d) => {
  await d.choose("ha", "no-answer"); await d.settle(); await d.settle(); await d.text(copy("case.transferredTitle"));
  await d.buttons(["Request next case", "Back to Home"]);
});
add("BR02-b", "B2: medicine rows take no tap, Skip HA disabled, no Callback", "g2-checking-ha", "app-logic.md:152-153,174 (K13)", async (d) => {
  await d.root().locator("#medicines-list .tm-row").first().click(); await d.p.waitForTimeout(150);
  await d.buttons([], ["Prescribe", "Callback"]); assert.ok(await d.button("Skip HA").isDisabled());
});
// The 13 picture's call is live and ends one poll after it opens (gate + pilotTalkAfterGate long); one second shorter, its
// reported hang-up (seen one poll after the end) lands before Transferring… finishes (two simulated server answers): 4 s shorter.
add("BR02-c", "critique 1: the call ends during Transferring… → 16 (ended before the transfer), never Transferred, nothing counted", "t13-connecting-ha", "app-logic.md:158,190 (D-57: transfer = same call)", async (d) => {
  await d.choose("hangup", "reported"); await d.choose("whoEnded", "patient"); await d.choose("record", "never");
  await d.choose("length", String((ms("gate") + ms("pilotTalkAfterGate")) / 1000 - 4));
  await d.ff(poll(2)); await d.msg("call.transferMissedPatient"); await d.buttons(["Confirm & forward", "Skip HA"]);
  await d.settle(); await d.settle(); await d.noText(copy("case.transferredTitle")); assert.equal(await logCount(d, TRANSFER), 0);
});
// B-R03
add("BR03-a", "B3 → hang-up → the record proves the forward: counted once, distinct forward event", "g3b-forwarded", "app-logic.md:124,190 (CW-F2); §3 count", async (d) => {
  await d.choose("hangup", "reported"); await d.ff(poll(3)); await d.p.waitForTimeout(300);
  await d.buttons(["Request next case", "Back to Home"]); await d.noText(copy("call.forwardedTell"));
  assert.equal(await logCount(d, FORWARD), 1, "one forward event");
  await d.ff(poll(3)); await d.p.waitForTimeout(300); assert.equal(await logCount(d, FORWARD), 1, "never twice");
  await d.click("Back to Home"); await d.settle(); assert.equal(await rxCount(d), "4");
});
add("BR03-b", "B3 → the record under the gate: mismatch, hold, nothing counted", "g3b-forwarded", "app-logic.md:124,126 (CW-D3, CW-F2)", async (d) => {
  await d.choose("record", "under-gate"); await d.ff(poll(3)); await d.p.waitForTimeout(300);
  await d.buttons(["Request next case", "Back to Home"]); await d.log(/forward not confirmed \(mismatch\)/); await d.log(/hold/);
  assert.equal(await logCount(d, FORWARD), 0); await d.click("Back to Home"); await d.settle(); assert.equal(await rxCount(d), "3");
});
add("BR03-c", "forward left before the record still settles after the doctor left", "g3b-after-hangup", "app-logic.md:126,144; plan v3.2 step 7", async (d) => {
  await d.choose("record", "delayed"); await d.click("Back to Home"); await d.settle(); assert.equal(await rxCount(d), "3");
  await d.ff(ms("callRecordWait")); await d.p.waitForTimeout(400); await d.log(/forward — forwarded to Health Advisor \(order .*after the doctor left\)/);
});
// B-R04
add("BR04", "Skip HA: ✕ cancels with no change; the chosen reason is stored exactly", "g1-generic-confirm", "app-logic.md:188 (D-70 item 3)", async (d) => {
  await d.click("Skip HA"); await d.text(copy("skipHa.title")); await d.closeSheet(); await d.buttons(["Confirm prescription", "Skip HA"]);
  assert.equal(await logCount(d, /Skip HA:/), 0, "✕ saves nothing");
  await d.click("Skip HA"); await d.root().getByRole("button", { name: copy("skipHa.repeat"), exact: true }).click();
  await d.log(new RegExp(`Skip HA: reason saved with the case: ${copy("skipHa.repeat")}`)); await d.msg("call.skipHa");
});
// B-R05
add("BR05-a", "17 → result under the gate → 6 → Call again stays HA skipped (Cat4 script, no HA controls)", "g1-generic-confirm", "app-logic.md:159,188 (CW-E2)", async (d) => {
  await d.click("Skip HA"); await d.root().getByRole("button", { name: copy("skipHa.notRequired"), exact: true }).click(); await d.msg("call.skipHa");
  await d.choose("record", "under-gate"); await d.ff(poll(3)); await d.msg("call.endedEarly");
  await d.choose("record", "over-gate"); await d.click("Call again"); await d.msg("call.scriptCat4"); await d.buttons([], ["Skip HA"]);
  await d.ff(ms("gate") + poll(3)); await d.buttons(["Confirm prescription"], ["Skip HA", "Confirm & forward"]);
  await d.click("Confirm prescription"); await d.settle(); await d.text(copy("case.confirmedTitle"));
  await d.log(/confirm completed: HA skipped \(doctor\) — prescription confirmed/);
});
add("BR05-b", "17 → result over the gate → 8a → Prescription confirmed, one HA-skipped event", "t17-skip-ha-wait", "app-logic.md:159,177", async (d) => {
  await d.buttons([], ["Confirm prescription", "Callback", "Skip HA", "Back"]); await d.msg("call.scriptCat4");
  await d.choose("record", "over-gate"); await d.ff(poll(3)); await d.buttons(["Confirm prescription"], ["Skip HA"]);
  await d.click("Confirm prescription"); await d.settle(); await d.text(copy("case.confirmedTitle"));
  assert.equal(await logCount(d, /confirm completed: HA skipped \(doctor\)/), 1);
});
add("BR05-c", "critique 3: 17 with the hang-up reported → Getting call result, script gone, HA stays skipped", "t17-skip-ha-wait", "app-logic.md:103,138,141", async (d) => {
  await d.choose("record", "delayed"); await d.choose("hangup", "reported"); await d.ff(poll(3));
  await d.msg("call.resultWait"); await d.noText(copy("call.scriptCat4")); await d.buttons([], ["Skip HA", "Confirm prescription"]);
  await d.ff(ms("callRecordWait") / 2); await d.buttons(["Confirm prescription"], ["Skip HA", "Confirm & forward"]);
});
// B-R06
add("BR06-a", "Pilot 7d → Confirm & forward → 7f → record over the gate → 10b, counted once", "s7d-result-missing-pilot", "app-logic.md:144 (D-89, Q-A)", async (d) => {
  await d.click("Confirm & forward"); await d.settle(); await d.msg("call.submittedTitle"); assert.equal(await logCount(d, FORWARD), 0, "no premature success");
  await d.choose("record", "over-gate"); await d.ff(poll()); await d.text(copy("case.forwardedTitle")); await d.noText(copy("case.confirmedTitle"));
  assert.equal(await logCount(d, FORWARD), 1);
});
add("BR06-b", "Pilot 7f → record says the patient never answered → hold, card stays 7f", "s7d-result-missing-pilot", "app-logic.md:144 (CW-D3)", async (d) => {
  await d.click("Confirm & forward"); await d.settle(); await d.choose("record", "no-answer"); await d.ff(poll());
  await d.log(/never answered/); await d.log(/hold/); await d.msg("call.submittedTitle"); await d.noText(copy("case.forwardedTitle"));
});
add("BR06-c", "Still talking on a Pilot call returns to the Pilot live stage, never Cat4", "s7b-still-on-call", "app-logic.md:140 (CW-D1); state map C7b>B0", async (d) => {
  await d.click("Still talking"); await d.msg("call.scriptNeutral"); await d.ff(poll());
  await d.buttons(["Confirm prescription", "Skip HA"]); await d.noText(copy("call.scriptCat4"));
});
// B-R07
add("BR07", "availability ends during B3: never interrupted; after the hang-up only Back to Home", "g3b-forwarded", "app-logic.md:70 (window ends during a case)", async (d) => {
  await d.ff(31 * 60 * 1000); await d.msg("call.waitingForHangup");
  await d.choose("hangup", "reported"); await d.ff(poll(3)); await d.p.waitForTimeout(300);
  await d.buttons(["Back to Home"], ["Request next case"]); await d.click("Back to Home"); await d.msg("home.idleExpired");
});
// B-R09 / B-R12
add("BR09", "reload during Transferring… continues to 14 and counts the transfer once", "t13-connecting-ha", "plan v3.2 B8, B12; app-logic.md:192 (D-50)", async (d) => {
  await d.choose("ha", "free"); await d.p.reload(); await d.p.waitForTimeout(200); await d.settle(); await d.settle();
  await d.text(copy("case.transferredTitle")); await d.p.reload(); await d.p.waitForTimeout(400);
  await d.text(copy("case.transferredTitle")); assert.equal(await logCount(d, TRANSFER), 1);
  await d.click("Back to Home"); await d.settle(); assert.equal(await rxCount(d), "4");
});
add("BR12", "the four outcomes log four distinct completed events (never from the button label)", "g2-checking-ha", "app-logic.md:192 (D-50)", async (d) => {
  await d.choose("ha", "free"); await d.settle(); await d.settle(); await d.text(copy("case.transferredTitle"));
  assert.equal(await logCount(d, TRANSFER), 1); assert.equal(await logCount(d, /confirm completed: (Cat4|HA skipped|forward)/), 0);
});
add("BR08", "critique 2: a story starting at Case reopens the remembered case (notes, medicines), not a fresh fixture", "", "plan v3.2 B12; app-logic.md:101", async (d) => {
  await d.choose("start", "case"); await d.clickControl("#rp-restart"); await d.p.waitForTimeout(300);
  await d.fill("#doctor-notes-input", "Kept across reopen"); await d.root().locator("#medicines-list .tm-row").first().click(); await d.click("Prescribe"); await d.settle();
  await d.p.reload(); await d.p.waitForTimeout(400);
  assert.equal(await d.root().locator("#doctor-notes-input").inputValue(), "Kept across reopen"); await d.text("Prescribed");
});
// Offline and phone Back on the Pilot stages
add("BPILOT-offline", "offline on B1: Confirm prescription and Skip HA fail with one notice, nothing lost", "g1-generic-confirm", "app-logic.md:271 (D-54)", async (d) => {
  await d.choose("offline", "yes"); await d.click("Confirm prescription"); await d.msg("case.offlineAction"); await d.noText(copy("call.checkingHa"));
  await d.click("Skip HA"); await d.root().getByRole("button", { name: copy("skipHa.notRequired"), exact: true }).click();
  await d.msg("case.offlineAction"); await d.buttons(["Confirm prescription", "Skip HA"]); assert.equal(await logCount(d, /Skip HA:/), 0);
});
add("BPILOT-back", "phone Back: B1 and B3 show the toast; after the hang-up it goes Home", "g1-generic-confirm", "app-logic.md:91,95 (D-81 F21)", async (d) => {
  await d.back(); await d.text(copy("case.backBlocked").split(". ")[0]); await d.buttons(["Confirm prescription"]);
  await d.click("Confirm prescription"); await d.choose("ha", "none"); await d.settle(); await d.msg("call.waitingForHangup");
  await d.back(); await d.msg("call.waitingForHangup");
  await d.choose("hangup", "reported"); await d.ff(poll(3)); await d.p.waitForTimeout(300); await d.buttons(["Request next case"]);
  await d.back(); await d.settle(); await d.buttons(["Request a case"]);
});
await run(cases);
