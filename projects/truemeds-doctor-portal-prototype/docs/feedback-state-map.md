# Feedback state mapping

Version 1.2 · 2026-11-03 · D-41, D-44, D-45, D-83 (calling round) · Read [feedback-rules.md](feedback-rules.md) first.

This maps current auth/Home states and known recovery conditions to reusable feedback. It is not a list of new screens to build or render. Shared copy now lives in `../ui-screens/feedback/messages.json` with behavior metadata in `metadata.json`; generated browser/native adapters consume the same text. Copy approved (D-53). Existing approved PNGs remain historical until source-derived visual review.

## Placement rules (Round 4, 2026-11-02 — A-19, RULES §9.5)

- **Result of an action → next to the control that did it.** On a screen with a pinned action bar, inside the bar above its button, as a band (`.tm-actionbar > .tm-notice`). On a screen without a bar, 16 below the field it came from (D-98) or 8 below the button (A-14).
- **Bar's own action → inside the bar.** The result of the last tap, or why the bar's button is disabled right now: offline (case and Home), request failed, "No cases right now", ending soon, setup / add / confirm / release failures, offer enable-failed / offline, calling notices (Round 4, lane-request 7).
- **Screen's general situation → top of the panel.** Not tied to a button; stays until the cause is gone (unlock "isn't available", Home idle-expired, manually ended, expired-pending, stop-pending).
- Notices wrap balanced (A-22). Toasts only where no control can show the result; they sit above the pinned bar when there is one.
- Small phones (RULES §8.14): every state at 360×640 — nothing the doctor needs is hidden without a scroll cue; the bar never covers the last content.

## Coverage notation

- **R01–R09:** proposed representative capture, not yet generated or approved.
- **Existing:** retain an existing approved visual for unchanged layout; check integration if shared component changes.
- **Fixture:** source/behavior coverage; new PNG only if a rule in render contract triggers it.
- A representative covers component styling, not every sibling's recovery logic. All rows still need behavior checks.

## Sign-in

Current copy: `../ui-screens/sign-in/sign-in.html`. Native: `../ui-screens/native/SignInScreen.tsx`. Decisions D-33, D-39.

| State / registry key | Pattern | Trigger and recovery | Visual coverage |
|---|---|---|---|
| signin.default | None | Entry; neutral SMS helper | Existing |
| signin.keyboard-open | None | Potentially valid partial entry; no early length error | Existing |
| signin.empty-tap | F1 | Submit empty; focus field, edit | R01 sibling |
| signin.too-short | F1 | Submit incomplete; retain digits, edit | R01 sibling |
| signin.wrong-first-digit | F1 | Impossible prefix; immediate, clear on valid correction | R01 representative |
| signin.too-long | F1 | More than 10 digits after +91 / 0 cleaning: `signin.long` "That’s more than 10 digits. Check the number." — immediate, same slot and style as `signin.too-short`; digits kept, never cut; clears on a valid edit (D-101 o04) | New — live state, captured for the phone walkthrough (`docs/renders/2026-11-09-signin-d101/`) |
| signin.pasted-cleaned | None | Normalise supported prefix; preserve meaningful digits per D-39 | Existing + fixture |
| signin.back-from-otp | None | Change / phone back on OTP returns with the number kept; it edits normally (first typed digit does not replace it, D-101 o10) | Live behaviour |
| signin.sending | L1 | Send pending; disable duplicate send | Existing + fixture |
| signin.not-registered | N1 | Server access result; existing sign-up route / approval information (sign-up line is one entry `signin.signup` with `{link}`, D-101 o25) | R06 |
| signin.offline | F2 after action; N1 passive | Restore connectivity, retry; retain number; one message | R03 sibling + layout QA |
| signin.couldnt-send | F2 | Confirmed send failure; retain number and retry | R03 sibling + layout QA |
| signin.too-many-tries | W1 | Issuance cap; wait for server eligibility, retain number | R04 sibling + fixture |
| signin.locked-number | W1 | Sign-in on a locked number goes to OTP in the locked state (`otp.locked`): code and Verify off, lock time and "call Doctor Ops", Change still available (D-81 F6) | R04 sibling |
| signin.inactive | F2 access block | Server says inactive; Call Doctor Ops | Existing + notice integration QA |

## OTP

Current copy: `../ui-screens/otp/otp.html`. Native: `../ui-screens/native/OtpScreen.tsx`. Decisions D-34, D-35, D-39, D-44 (layout v2). Layout v2 rows below replace the earlier OTP behaviour; all OTP rows drop "preserve opt-in" (no opt-in on OTP after D-45).

**Reserved line under the code boxes (Round 5 B, Round 6 item 3, Apurva 2026-11-02):** one line is reserved under the boxes in every OTP state that can show a one-line message (helper, new-code line, wrong code, tries left, code expired, empty or too short, resend, cooldown, verifying). Verify & sign in therefore sits at the same y in those states. The line is empty when there is no message; the 8 / 16 / 32 spacing scale holds. The notice-box states (offline, locked, couldn't verify, resend failed, too many codes, expired and resend limited) keep their notice box in the flow and may move Verify & sign in; accepted, not a defect.

| State / registry key | Pattern | Trigger and recovery | Visual coverage |
|---|---|---|---|
| otp.default | None | Keyboard open on load; box 1 focused; resend timer running (D-44) | Superseded: layout v2 capture pending |
| otp.empty-tap | F1 | Submit empty; focus input | R01/R02 siblings; keyboard QA |
| otp.too-short | F1 | Submit1–3 digits; retain input, edit | R01/R02 siblings; keyboard QA |
| otp.verifying | L1 | Verification pending; retain code, prevent duplicate | Existing + fixture |
| otp.wrong-code | F1 | Code stays visible, red borders, no focus box; first keystroke replaces whole code; keyboard open. Copy "Wrong code." (D-81 F1; replaces "That code isn't right.") | Superseded: layout v2 capture pending |
| otp.two-tries-left | F1 | Same as wrong code, with the remaining-tries count (dynamic): "Wrong code. 2 tries left."; at 1 try left the singular "Wrong code. 1 try left." (D-81 F1) | R02 sibling + longest-copy QA |
| otp.resend-available | None | "Resend code" brand link, 44pt tap area, under the notice (D-44) | Superseded: layout v2 capture pending |
| otp.new-code-sent | S1 | Confirmed resend; restart countdown | Existing; reposition only through review |
| otp.code-expired | F1 | Code stays visible; "Resend code" available at once; Verify of the same code blocked | R02 |
| otp.couldnt-verify | F2 | Retain code; resend line shown (D-44) | R03 |
| otp.too-many-resends | W1 | Resend line hidden; last unexpired code can still verify | R05 |
| otp.locked | W1 | Keyboard closed; boxes and Verify disabled; resend and consent lines hidden; authoritative cooldown recovery (D-44) | R04 |

### OTP behavior combinations: reuse patterns

| Registry key | Pattern | Required behavior | Coverage |
|---|---|---|---|
| otp.resending | L1 on Resend | One resend pending; keep current challenge until response; prevent duplicates | Fixture; capture only if controls/layout differ |
| otp.resend-failed | F2 | Preserve code; retry if eligible; do not claim new code sent | R03 sibling |
| otp.offline | F2 or N1 | Same offline rule as sign-in; do not label code wrong | R03 sibling |
| otp.cooldown-reconciling | W1 + progress | Timer zero; the terms line stays and Verify & sign in does not move; the line reads "Checking…" alone; boxes stay focused (D-81 F5, F7). Wait for authoritative eligibility before enabling | Fixture |
| otp.expired-and-resend-limited | W1 | Locked treatment (D-46): empty disabled boxes, keyboard closed, Verify disabled, no consent, no resend line. Copy: "This code has expired. Request a new code in 9:42, or call Doctor Ops." | R05 layout + longest-copy QA |

Issuance window/reset policy remains existing open backend decision. Do not invent a duration from countdown fixture values. Four-code issuance and five wrong-code attempts remain separate configurable server policies.

## Faster sign-in offer (D-45, layout v2)

Shown once after the first successful OTP sign-in on a device that supports it and has faster sign-in off. Native screen; no OTP opt-in. **No Back; the phone's back gesture = Not now** (D-47). Decision D-45; re-offer timing OQ-023.

| State / registry key | Pattern | Behaviour |
|---|---|---|
| offer.shown | None | After first successful OTP sign-in on a supported device where faster sign-in is off |
| offer.enabling | L1 + OS prompt | One request at a time; primary shows progress |
| offer.enabled | — | Go to Home (no toast needed; Profile shows it's on) |
| offer.cancelled | None | OS prompt cancelled → back to the offer, no message (D-61) |
| offer.failed | Notice | Enrolment failed → stays on the offer: `offer.enableFailed` "Couldn't turn on faster sign-in." · Try again · Not now (D-61, D-65) |
| offer.offline | Notice | `offer.offline` "You're offline. Check your connection." (D-66) |
| offer.unavailable | Notice | Phone answers "unavailable" at Turn on → stays on the offer, unchanged (tile and three points shown); warning notice in the bar, `alert-triangle`, `unlock.unavailable` "Faster sign-in isn't available on this phone right now." (same slot as Offline and Couldn't turn on, A-19); the primary reads **Continue** (`offer.continue`) → Home; Not now hidden. Not enabled; recorded as offered; can be turned on later in Profile (D-93). Picture `offer_unavailable` approved (D-93 revised); in `ui-screens/` since the D-94 refresh |
| offer.not-now | None | → Home; re-offer per OQ-023; can be turned on later in Profile (D-69) |
| offer.screen-lock | None | No fingerprint or face set up → offer uses the phone's screen lock (PIN / pattern / password) (D-64) |
| offer.unsupported | — | Phone has no screen lock at all → screen skipped entirely (D-64) |

## Returning unlock

Current copy: `../ui-screens/returning-unlock/returning-unlock.html`. Native: `../ui-screens/native/UnlockScreen.tsx`. **No Back** — first screen when the app opens; "Not you? Switch account" leads to sign-in (D-47).

| State / registry key | Pattern | Recovery | Coverage |
|---|---|---|---|
| unlock.fingerprint / face-id / screen-lock | None | Native authentication from existing CTA | Three existing visuals |
| unlock.pending | L1 + OS prompt | No concurrent authentication request | Fixture |
| unlock.cancelled | None | Return to unchanged screen; cancellation is not failure | Fixture |
| unlock.platform-retry | OS-owned | Use supported native retry guidance | Device check; do not invent OS mock |
| unlock.unavailable | N1 (neutral info, not an error — D-47 amendment) | "Use OTP instead" becomes the primary; notice copy "Faster sign-in isn't available on this phone right now." (no repeat of the button text, D-47); preserve account context | R03 component + host-layout QA |

## Availability and Home

- **Setting… / Adding…** (D-81 F9): wheel, duration chips, Cancel and × disabled. **Offline** (D-81 F13): End availability greyed out; the offline notice explains. Set availability stays pinned to (inside the action bar, Round 4 item 1; the content above scrolls) the bottom in every state (D-81 F12).

Current references: `../ui-screens/home/`; native `../ui-screens/native/HomeScreen.tsx`. Draft state evidence: `renders/2026-10-13-home-simplified/`. Decisions D-36, D-40. Drafts are superseded where newer decisions differ.

| State / registry key | Pattern | Recovery / invariant | Coverage |
|---|---|---|---|
| home.setup | None | Wheel + presets, minimum reminder once | Existing wheel |
| home.setting | L1 | Keep selected duration; only start after confirmation | Fixture |
| home.setup-failed | F2 | Retain duration, retry known failure | R07 component + setup-layout QA |
| home.active | None | Timer and Request a case | Existing |
| home.requesting | L1 | One in-flight request; stable headline and CTA | Fixture |
| home.no-cases | N1 | Check again; remain available until deadline | Existing draft needs later state approval; not an error |
| home.request-failed | F2 | Retry confirmed failure; distinguish unknown result | R09 |
| home.offline | F2 or N1 | Preserve state; reconnect and reconcile pending request | R09 sibling |
| home.near-expiry | W1 | Keep Add time placement; last-second requests valid | Existing draft requires corrected layout; later review |
| home.add-open | None | Wheel sheet; same duration controls, no repeated helper | Existing wheel sheet |
| home.adding | L1 | Keep sheet/selection; prevent repeat addition | Fixture |
| home.add-failed | F2 | Keep sheet/selection and original deadline; retry confirmed failure | R07 |
| home.added | T1 | Confirmed deadline update; dismiss sheet, preserve Home | R08 |
| home.end-confirmation | Confirmation, not error | Existing pending-request decision; no new error component | Separate interaction coverage when reviewed |
| home.stop-pending | N1 + L1 | Finish request/assigned case before stop. Subtitle "You won't get new cases." (not a repeat of the notice). **No "Time remaining" row**; quiet "Ending…" without spinner (D-47) | Fixture + later Home state review |
| home.expired-pending | N1 + L1 | Honour request already submitted; do not interrupt case | Same pending layout; fixture |
| home.idle-expired / manually-ended | N1 + setup | Reuse setup; keep prescription count; no giant0-minute error screen | Existing setup integration QA |
| home.unknown-result | N1 + L1 | Reconcile operation ID before retry; do not invent failure or success | Fixture; backend integration required |

## Case page exits (D-48)

Applies to the case page (`ui-screens/case/case.html`; the old `index.html` is frozen, D-56). Copy approved (D-53).

| State | Pattern | Behaviour |
|---|---|---|
| case.back-before-call | Confirmation sheet | Only on Ready and states 3 and 4 (no call attempted). Back (header or phone gesture) opens "Leave this case?" · "It goes back to the queue for another doctor." From the Call tap the header Back is hidden and never returns once the patient answered (D-80 pt 1, D-81 F21). Sheet sits over Ready (D-81 F22). |
| case.releasing | L1 | Release pending over Ready; one request; primary shows the busy state (L2). Failure keeps the doctor on the case with an F2 notice. Backend refuses Release once our call is accepted, unless the result is 3 or 4 (D-80). |
| case.back-blocked | N1 (not an error) | Call attempted or connected, case not closed. Header Back hidden from the call tap on; phone back gesture shows "Finish this case first. Then you can go back to Home." (D-81 F21). |
| case.closed | None | End of case: confirmation at the top of the content, titled by path ("Prescription confirmed" / "Transferred to HA" / "Forwarded to HA"); pinned bar **Request next case** (primary) + **Back to Home** (secondary), stacked. Header Back hidden; phone back → Home. Case content read-only and muted (D-51). |
| case.closed-availability-ended | None | Availability ended during the case: only **Back to Home**; Home shows the expired state. |
| case.reopened | None | App reopened with a case open → straight back into the case. |

## Case page — states still to design and render (D-52)

| State | Pattern | Behaviour |
|---|---|---|
| case.loading | L1 | Skeleton shaped like the loaded page: an Order details row, Medicines and Notes blocks, in the same places; no text, no actions until loaded (D-81 F28). |
| case.load-failed | F2 | Error notice "Couldn't load this case." + primary **Try again**; nothing else on the page. *Copy approved (Apurva, D-53).* |
| case.offline | W1 → F2 | Warning notice (D-54: offline blocks the main action) "You're offline. Reconnect to call or confirm." while browsing; an action attempted offline fails with one error notice "No connection. Nothing was lost. Try again when you're back online." Typed notes are kept. *Copy approved (Apurva, D-53).* |
| case.confirm-busy | L1 | Final CTA busy (L2), label **"Confirming…"**; every other action disabled; medicine rows and notes read-only and muted; View Rx stays the outlined button (D-81 F24–F25). No second submit. *Copy approved (Apurva, D-53).* |
| case.confirm-failed | F2 | Error notice above the bar "Couldn't confirm. Nothing was lost. Try again."; CTA back to normal. An uncertain result is reconciled before retry (no duplicate confirm). *Copy approved (Apurva, D-53).* |
| case.release-failed | F2 | Sheet closes over Ready; doctor stays on the case; error notice "Couldn't release this case. You're still on it. Try again."; Back works again. *Copy approved (Apurva, D-53).* (D-81 F22) |
| case.callback-failed | F2 | Error notice inside the sheet "Couldn't schedule the callback. Your time is kept. Try again."; chosen date and time kept. *Copy approved (Apurva, D-53).* |
| rx.load-failed | F2 | Inside the viewer: notice "Couldn't load the prescription." + **Try again**; ✕ still closes. *Copy approved (Apurva, D-53).* |
| case.no-medicines | Standing state (top of the panel) | Amber notice "No medicines on this order. Our Ops team will check it." (`case.noMedicines`, D-84) above the medicines card, which shows no text; no Call patient; main button **Release case**, which releases directly (no sheet) and returns to Home; header Back does the same (D-80 pt 4, D-81 F23; D-83 CW-A6, K4). |
| case.long-content | — | Long patient name (two lines in the header) and long medicine names, checked at 360. |
| call.waiting-for-hangup | Status line | "Waiting for the call to end…" (`call.waitingForHangup`) in the bar, where the buttons would be, while a forward or a failed transfer is still live (15, B3; D-83 K8, K9). After the hang-up: Request next case · Back to Home. |
| call.transfer-failed | Card body (live) | "Read the script, then end the call." (`call.transferFailed`) in the amber card under "Forwarded to Health Advisor" while the call is live on 15 and B3. The patient script (`call.forwardedTell`): "I’ve written your prescription. Our Health Advisor will call you back to help with the next steps." Copy never says the Health Advisor is unavailable (MAIN-CHECK 2 item 2). |
| call.skipHa | Grey note in the bar | "Health Advisor call will be skipped. End the call when you’re done." on 17 (`t17-skip-ha-wait`), with the no-HA script and the status line "Getting call result…" (D-85). No Calling line, no buttons. |
| case.callback-refused | F2 | Error notice inside the Schedule callback sheet "Couldn’t schedule a callback. The patient wasn’t reached." (`callback.notReached`) when the backend refuses a callback without leg 2 answered (D-83 K3, CW-A1). Choices kept. |
| case.result-missing-pilot | Same as 7d | Pilot 7d: "We didn’t get the call result." notice; **Confirm & forward** · Callback + Unavailable; no Skip HA (D-83 K6, CW-D2). |

## Prescribe (D-81)

| State | Kind | What the doctor sees | Notes |
|---|---|---|---|
| prescribe.dose-error | F1 | "Choose a dose for at least one time of day." as field text under the M / A / N grid; the screen scrolls to the first error (D-81 F16). | No tinted box. |
| prescribe.disabled | N1 | "Disabled: {reason}. Prescribing it will enable it again." (`d-disabled`; D-81 F17, D-20). | Prescribe re-enables it. |
| prescribe.keyboard | none | Focused field (Other dose, Additional instructions; Chief complaints, Doctor notes on the case page) scrolls above the keyboard with its label and helper; the pinned bar hides while the keyboard is open (D-81 F20). | Keyboard rule, RULES §9. |

## First representative review batch

Nine proposed examples cover **different visual/behavior conditions**, not nine new error components. Some can be omitted if a current approved reference already proves unchanged anatomy and placement. Do not render yet.

| ID | Representative | Why a screenshot earns its place |
|---|---|---|
| R01 | Sign-in invalid prefix, keyboard open | Field error + keyboard reachability + existing heavy-border correction |
| R02 | OTP expired, keyboard closed | Same F1 in OTP layout with explicit resend recovery |
| R03 | OTP verification service failure | Shared action notice; longest typical service copy |
| R04 | OTP number locked | Warning notice with disabled verification controls |
| R05 | OTP resend capped | Same warning anatomy but verification remains available |
| R06 | Sign-in not registered | Neutral notice plus sign-up/access recovery |
| R07 | Add availability failed, wheel sheet | Error inside modal; long picker + footer fit |
| R08 | Availability added toast over Home | Compact overlay clears footer and does not look like CTA |
| R09 | Home request failed | Shared notice integrated with stable Home action area |

Review by pattern groups (field, notice, toast), not arbitrary groups of four. Keep copy-only siblings in source fixtures. Do not infer approval of unreviewed copy from approval of one representative.

## Implementation gates still open

Completed in source: registry and metadata, generated browser/native adapters, shared web/native notice anatomy, neutral notice proposal, compact four-slot OTP with one real input, server-controlled lock gating, leading-zero normalization, field association and polite announcements. `ui-screens/feedback/check-sources.mjs`, React Native type check and pure logic checks passed on 2026-10-13.

Still open: source-derived 390×844 captures and visual approval, 360-width and large-text/device checks, native platform autofill/accessibility, real callbacks and authoritative backend reconciliation. Future combination rows above remain integration fixtures, not approved standalone screens. See `renders/2026-10-13-feedback-review/README.md` for capture status.

> **Calling states (2026-10-19, D-58):** the full list of call states, triggers, screens and actions is in `ui-screens/app-logic.md` §5 (state table). This file does not repeat it. Rows above for `case.noPickup` / `case.didntConnect` sheets are retired by D-58.

## Round 4 changes (2026-11-02, consistency audit — Lane A)

| Row | Change | Why |
|---|---|---|
| Home — failed request, add, setup, ending soon | Notice inside the action bar, above its button, band style | A-19 (Round 4 item 2) |
| Home — "No cases right now" | Bar's own action (no cases now): notice inside the bar above Request a case | A-19, lane-request 7 |
| Unlock — "isn't available" | Screen's general situation: notice stays at the top of the panel | A-19 |
| Faster sign-in — failed enable | "Couldn't turn on faster sign-in." sits in the bar above Try again | A-19 |
| Faster sign-in — subtitle | "Use your screen lock instead of an OTP." (one line) | A-06 |
| OTP — waiting text and Resend link | Same height; Verify & sign in does not move | A-03 |
| OTP — "New code sent." | Green text, no icon | A-21 |
| OTP — too many resends / locked / expired and limited | "Doctor Ops" and the time never split across lines | A-17 |
| case.confirm-failed, case.release-failed | Bar notice above its button (the bar keeps its height in busy states). case.callback-failed stays inside the sheet, 8 above its button | A-19, B-02 |
| case.confirming / call.connectingHa (Transferring…) | Bar keeps its height; Skip HA alone, full width, greyed and disabled; no Callback (D-83 K13) | B-01 |
| fallback B2 | Status line takes the row the buttons were on; bar keeps its height | B-02 |
| case.checking (7c) | Same screen as 5: "Getting call result…" (`call.resultWait`), normal bar height, no script, no buttons; picture `t05-result-wait` | D-91 (replaces B-02 for 7c) |
| Empty case | Card text left-aligned, 14 px normal; View Rx left-aligned when Order details is hidden | B-16, B-17 |
| Back-blocked toast | Breaks between its two sentences | B-21 |
| Logo (all home-base screens) | One lockup size: 166 px wide, 16 from the top | A-07 (sign-in 174 → 166 in Round 4 lane D; Apurva to confirm) |

**Busy label and gap:** the spinner sits 8 from the label on every busy button (A-08, set centrally).
**Recorded, no change:** A-18 (offer hero stays centred), B-23 (SOS toggle row), B-25 ("Order details" title regular).

