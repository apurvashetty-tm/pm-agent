// Run A1 (steps 2–4): the REVIEW-CHECKS "automation gap" items the brief assigns to this run (A-R03 timer format and
// deadlines, A-R04 counts and earnings) plus the cheap ones (A-R05 placeholders / toggle success, A-R06 Rx zoom bounds and
// order details, A-R12 disable sheet close / re-prescribe). Reuses the Codex driver (tests/codex/run-A/harness.mjs) unchanged.
// Run: bash docs/renders/2026-11-09-build-fast/run-codex.sh tests/build-fast-a1.mjs <log>
import { run, assert, ms, copy } from "./codex/run-A/harness.mjs";
const MIN = 60 * 1000;
const cases = [];
const add = (id, name, state, source, test, fields = {}) => cases.push({ id, name, state, source, test, fields });
const time = async (d) => (await d.root().locator("#home-time").innerText()).trim();

add("R03-a", "timer: h:mm:ss from one hour, m:ss below, set only on confirmation", "home_setup-wheel", "app-logic.md:65-66 (D-53)", async (d) => {
  await d.click("1 hour"); await d.buttons(["Set availability"], ["Request a case"]);   // choosing a chip starts nothing
  await d.click("Set availability"); await d.settle();
  assert.match(await time(d), /^(1:00:00|59:5\d)$/, "one hour reads 1:00:00 (or just under after the server answer)");
  await d.ff(2000); await d.p.waitForTimeout(300); assert.match(await time(d), /^59:5\d$/);
});
add("R03-b", "Add 30 minutes to 5:00 gives 35:00", "home_near-expiry", "app-logic.md:60,68 (D-81 F10)", async (d) => {
  assert.equal(await time(d), "5:00");
  await d.click("+ Add time"); await d.click("30 min"); await d.root().locator(".tm-sheet:visible [data-confirm]").click(); await d.settle();
  assert.match(await time(d), /^3[45]:\d\d$/, "5:00 + 30 min = 35:00 (less the seconds the server took)");
  await d.msg("home.added");
});
add("R03-c", "expiry shows the ended state; a request made just before is honoured", "home_active", "app-logic.md:67,70", async (d) => {
  await d.ff(30 * MIN - 3000); await d.click("Request a case"); await d.ff(5000);   // the window ends while the request is open
  await d.settle(); await d.buttons(["Call patient"]);   // honoured: the case arrives
});
add("R03-d", "End availability with a request open: honours that request, no new ones, then ends", "home_requesting", "app-logic.md:69; feedback-state-map.md:126", async (d) => {
  await d.click("End availability"); await d.root().locator(".tm-sheet:visible").getByRole("button", { name: "End availability", exact: true }).click();
  await d.text(copy("home.stopPending")); assert.ok(await d.button("Request a case").isDisabled(), "no new request while ending");
  await d.settle(); await d.buttons(["Call patient"]);   // the open request is honoured
  await d.click("Back"); await d.click("Release case"); await d.settle();
  await d.msg("home.manuallyEnded"); await d.buttons(["Set availability"], ["Request a case"]);
});
add("R03-e", "0:00 when availability ran out with a request still open", "home_expired-pending", "app-logic.md:66 (D-53)", async (d) => {
  assert.equal(await time(d), "0:00"); await d.msg("home.expiredPending");
});
add("R04-a", "a confirmed prescription counts once; earnings = count × setting", "a-confirm-failed", "app-logic.md:71,279 (D-81 F10)", async (d) => {
  await d.choose("prescribe", "saved"); await d.click("Confirm prescription"); await d.settle(); await d.text("Prescription confirmed");
  await d.click("Back to Home"); await d.settle();
  const rx = await d.root().locator(".rx strong").innerText(); assert.equal(rx, "4", "3 before + 1 confirmed");
  await d.root().getByRole("button", { name: "Profile", exact: true }).click();
  await d.text(`₹${(4 * ms("earningsPerConfirmedRx")).toFixed(2)}`);
});
add("R04-c", "Request next case asks for the next case at once", "t10a-confirmed", "app-logic.md:95", async (d) => {
  await d.click("Request next case"); await d.settle(); await d.buttons(["Call patient"]);
});
add("R04-b", "release does not count", "t01-ready", "app-logic.md:71", async (d) => {
  await d.click("Back"); await d.click("Release case"); await d.settle();
  assert.equal(await d.root().locator(".rx strong").innerText(), "3");
});
add("R05-a", "Help, bell and User manual open the blank placeholder and Back returns", "home_active", "plan v3.2 §0 (D-88)", async (d) => {
  for (const name of ["Help", "Notifications"]) {
    await d.root().getByRole("button", { name, exact: true }).click(); await d.text(copy("placeholder.linkPending"));
    await d.back(); await d.buttons(["Request a case"]);
  }
  await d.root().getByRole("button", { name: "Profile", exact: true }).click(); await d.root().getByRole("button", { name: /User manual/ }).click();
  await d.text(copy("placeholder.linkPending")); await d.back(); await d.text(copy("profile.title"));
});
add("R05-b", "Faster sign-in toggle: on with a successful prompt; off with no prompt", "home_profile", "app-logic.md:77 (D-70)", async (d) => {
  const t = d.root().getByRole("switch");
  await t.click(); assert.equal(await t.getAttribute("aria-checked"), "false", "off at once, no prompt");
  await t.click(); await d.settle(); assert.equal(await t.getAttribute("aria-checked"), "true", "on after the prompt");
}, { offer: "enabled" });
add("R06-a", "Order details expands Created / Delivery / Payment; none → control hidden, View Rx left", "a-top", "app-logic.md:261 (B-16)", async (d) => {
  await d.root().locator("#ct-details").click();
  for (const k of ["case.orderCreated", "case.expectedDelivery", "case.payment"]) await d.msg(k);
  await d.p.goto(d.base + "?s=s-optional-empty"); await d.p.waitForTimeout(300);
  assert.equal(await d.root().locator("#ct-details").count(), 0, "no order details → no control");
});
add("R06-b", "View Rx: zoom clamps 50–400 %, reset; ✕ closes", "a-top", "app-logic.md:262", async (d) => {
  await d.click("View Rx");
  for (let i = 0; i < 20; i++) await d.root().getByRole("button", { name: "Zoom in", exact: true }).click();
  assert.equal(await d.root().locator("#rx-zoom-label").innerText(), "400%");
  for (let i = 0; i < 20; i++) await d.root().getByRole("button", { name: "Zoom out", exact: true }).click();
  assert.equal(await d.root().locator("#rx-zoom-label").innerText(), "50%");
  await d.root().getByRole("button", { name: "Reset view", exact: true }).click(); assert.equal(await d.root().locator("#rx-zoom-label").innerText(), "100%");
  await d.click("Close"); await d.buttons(["Call patient"]);
});
add("R12-a", "closing the Disable sheet changes nothing; re-prescribing a disabled medicine enables it", "d-default", "app-logic.md:247,250", async (d) => {
  await d.click("Disable"); await d.closeSheet(); await d.text(copy("prescribe.onPrescription")); await d.buttons(["Prescribe"]);
  await d.click("Disable"); await d.root().getByRole("button", { name: /Patient declined/ }).click();
  const row = d.root().locator('[data-med-id="1"]'); assert.match(await row.innerText(), /Disabled/);
  await row.click(); await d.text(copy("case.disabledMedicine", { reason: copy("prescribe.reasonDeclined") }));
  await d.click("Prescribe"); assert.match(await d.root().locator('[data-med-id="1"]').innerText(), /Prescribed/);
});
add("R13-a", "phone Back closes Prescribe (asks first after a change), then opens Leave on Ready", "d-default", "plan v3.2 B13; app-logic.md:90,249", async (d) => {
  await d.back(); await d.buttons(["Call patient"]);
  await d.root().locator('[data-med-id="2"]').click(); await d.click("After food"); await d.back(); await d.text(copy("prescribe.discardTitle"));
  await d.back(); await d.buttons(["Prescribe"]);   // Back closes the sheet first, the screen stays
  await d.click("Close"); await d.click("Discard"); await d.back(); await d.text(copy("case.leaveTitle"));
});
add("R10-a", "Other dose (single-dose schedule): only plain positive numbers; 7, 7.5 and .5 accepted; error in the form's unit", "d-syrup", "app-logic.md:231,245 (A-P07 on a single-dose schedule)", async (d) => {
  for (const ok of [".5", "7", "7.5"]) {
    await d.p.goto(d.base + "?s=d-syrup"); await d.p.waitForTimeout(250);
    await d.click("Weekly"); await d.click("Other");
    const input = d.root().locator("input[inputmode=decimal]:visible");
    for (const bad of ["", "0", "-1", "1e2", "1/2", "7..5"]) {
      await input.fill(bad); await d.click("Prescribe"); assert.ok(await input.isVisible(), `${bad} must not save`);
      await d.text(bad.trim() ? copy("prescribe.otherInvalid", { unit: "ml" }) : copy("prescribe.otherEmpty", { unit: "ml" }));
    }
    await input.fill(ok); await d.click("Prescribe"); await d.text("Prescribed"); await d.buttons(["Call patient"]);
  }
});
await run(cases);
