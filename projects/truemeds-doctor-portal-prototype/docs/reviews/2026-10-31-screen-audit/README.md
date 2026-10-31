# Doctor app — five-lens screen audit (frozen screens, 2026-10-31)

**What this is:** three independent agents opened all 144 approved pictures (390 wide) and checked them against `app-logic.md`, the copy registry, RULES and the decision log, through five lenses — words, structure as information, basic quality, usability, clinical / business risk. They searched the decision log first, so a finding on something already decided is raised only with a new reason. Claude then checked the key claims against the source files and added a read on each.

**Totals:** 73 findings — 3 High, 19 Med, the rest Low. 17 are "no change" (checked and fine, listed at the end).

**How to use it:** don't decide all of this now. Proposed handling:
- **Part A — 3 High:** read these first.
- **Part B — clear bugs:** contradict an agreed rule or are plain defects. Recommendation: accept as a batch; fixed (and pictures re-captured) in that journey's pass of the storyboard review.
- **Part C — decisions:** each would change an agreed design. They come up in the storyboard review of their journey, next to the screen.
- Reply with IDs if you disagree with a label (e.g. "P-02 next version", "C-08 drop").

Labels: **bug** = fix where it occurs · **next version** = real improvement that changes an agreed design · **no change**.

---

## Part A — High

**C-01 · High · calling · decide** — Cat4 calls can be released mid-consultation.
- *Finding:* header Back (→ Release case) shows "until the backend reports the patient answered". Cat4 runs on Knowlarity, which sends **one result after the call ends** — no live "patient answered" event (project_truth §5). So on a Cat4 call Back stays for the whole conversation, including 7b ("Are you still on the call?", 3+ min in). The backend can't refuse the release either — it needs the same signal.
- *Risk:* the case goes back to the queue while the doctor is talking; a second doctor calls the same patient; the "no leaving after an attempted call" rule (D-48, D-58 pt 2) breaks silently.
- *Claude's read:* **agree — real.** D-58 pt 20 chose Back in 7a/7b; it didn't weigh that Cat4 has no live events. Today's app-logic wording (D-79) made the dependency visible. Options: hide Back from the tap on Call for flows without live events (Release only in 1, 3, 4 where we know no one answered), or at the latest from 7b. Confirm with Engineering (OQ-030).

**P-01 · High · Prescribe · bug** — the printed SOS limit has no unit.
- *Finding:* the inhaler prints "2 puffs as needed (max 4/day)". The field is **Max doses a day** = 4 doses of 2 puffs (8 puffs), but the patient and pharmacist read 4 puffs. Same for any dose above 1. D-16 set the format with a 1-tablet example only.
- *Claude's read:* **agree.** Name the unit: "max 4 doses/day", or work it out: "max 8 puffs/day" (clearer for the patient). Same format for SOS-only and "+ SOS".

**C-06 · High (raised from Med by Claude) · case · decide** — an order with no medicines can be confirmed.
- *Finding:* `a-no-medicines` still offers Call patient; after a valid call the "no Pending medicines" check passes (there are none), so "Prescription confirmed" with nothing prescribed — counted in the doctor's prescriptions and earnings (D-73).
- *Claude's read:* **agree; raised to High** — an empty prescription and a paid case. Needs a rule: e.g. no Confirm with zero medicines, case closes via Help / Doctor Ops; one line on the empty state saying what to do.

---

## Part B — clear bugs (accept as a batch; fixed per journey)

**Copy registry** (one pass in `messages.json` + a check in `check-sources`)
- **E-08 / C-12** — no singular forms: "1 tries left", "Prescribe or disable 1 medicines first." Add singular variants. Both are safety messages.
- **E-10 / H-05** — straight apostrophes in `signin.couldntSend`, `otp.resendFailed`, `home.requestFailed`, `case.noPickup`, `case.didntConnect` and most `call.*` keys; curly ’ elsewhere. Make all curly; guard it.
- **C-11** — one outcome, two wordings: B3 "No Health Advisor is free right now…" vs 15 "Health Advisor unavailable right now…" (D-69 pt 1 fixed one text). Use `call.transferFailed`; retire `call.noHaFree`.

**Entry**
- **E-01 · Med** — OTP: on "Verifying…" the consent line disappears and the button jumps up 64 pt under the thumb (also cooldown-reconciling). Busy buttons keep their place (feedback-rules §2). Keep the line's space.
- **E-02 · Med** — sign-in has no "number locked" state, though today's test number 9000000005 needs one. *Claude:* my miss when proposing the numbers. Fix: go to OTP in the locked state (already designed), no new picture.
- **E-09 · Low** — cooldown: "Didn't receive it? Checking…" reads like checking the SMS; boxes focused while Verify is blocked. Own status line; don't focus.
- **E-11 · Low** — D-61 pt 4 "same tile, same place" not met: offer tile 24 pt higher than unlock; logo→title gap differs. One header spacing.

**Home**
- **H-01 · Med** — while Adding… / Setting…, Cancel, × and pickers still look active; undefined behaviour. Disable while busy.
- **H-03 · Low** — picture: 5:00 + 30 min shows 1:00:00. Re-capture.
- **H-06 · Low** — "Stay signed in" is an outlined secondary; RULES §9.4 makes the stay option quiet (as "Keep available").
- **H-08 · Low** — Set availability isn't pinned and jumps ~80 pt when a notice appears; D-43 pins Home's main button.
- **H-09 · Low** — Profile earnings ₹0.00 while Home shows 3 prescriptions today. Matching mock values.
- **H-11 · Low** — End availability works offline with no failure state. Add the notice or disable offline.

**Prescribe**
- **P-02 · Med · (agent: next version → Claude: bug)** — capsules get ½. Capsules can't be split. Dose set by form: ½ tablets only.
- **P-04 · Med** — dose error appears at the top while the doctor is scrolled down at the pinned Prescribe; looks like nothing happened. Scroll to the first error (as 8c does).
- **P-05 · Low** — "no dose" error is a tinted notice box, the Other error is field text; notices mean action results. Make it a field error under M/A/N.
- **P-06 · Med** — no picture or copy for Prescribe opened on a **Disabled** medicine; D-20 requires "Disabled: reason. Prescribing it will enable it again." Add state `d-disabled` + key.
- **P-08 · Low** — duration picker: number chips and unit chips don't share a left edge.
- **P-10 · Low** — pictures don't show their state: `d-food-selected` has no Food chip, `d-notes-keyboard` no keyboard. Re-capture.
- **P-13 · Low** — optional fields marked two ways ("(optional)" vs helper line). One pattern.

**Case and calling**
- **C-02 · Med** — `a-release-failed` drops back to **Ready** (Call patient + Back) though the release came from Calling and the likely cause is the patient answering — the doctor sees "Call patient" on a live call. Return to the state it came from; fix the feedback-map row.
- **C-03 · Med** — during Confirming… / Transferring… medicine rows keep chevrons and notes look editable. Use the closed-case read-only look while busy.
- **C-09 · Low** — View Rx greyed during Confirming… but active during Transferring…; D-76 says always the outlined button. Make `a-confirm-busy` match; update app-logic §9.
- **C-10 · Low** — 15b "End the call to get your next case." is a red error; it's an expected step → amber warning (RULES §9.5).
- **C-13 · Low** — Callback / Skip HA icons are 13 px in some bars, 16 px in others. One size, set centrally.
- **C-18 · Low** — loading skeleton starts ~108 px lower than real content and lacks the Order details row; the page jumps on load.

---

## Part C — decisions (taken in the storyboard review, journey by journey)

**Entry**
- **E-03 · Med** — expired code: the only way on (Resend) is a small link under a big dead Verify; "Didn't receive it?" is wrong (it was received, it expired). Follow the unlock-unavailable model (D-66): "Code expired." + Resend as the main action in this one state. *Claude: agree.*
- **E-04 · Med** — sign-in too many tries: the wait time is only in the disabled button, grey on grey (~1.4:1). Put the countdown back in the notice, as OTP locked does. *New reason vs D-66 C: accessibility. Claude: agree.*
- **E-05 · Med** — "Number not registered… Already applied?" doesn't help a registered doctor who mistyped, or one on an unapproved second number. Add "Check the number, or call Doctor Ops if you're already a Truemeds doctor." *Claude: agree; check wrap at 360.*
- **E-06 · Med** — Unlock's "Switch account" signs the doctor out with no open-case guard; Profile blocks Log out during a case (D-70). Same guard on Unlock, or hide it with a case open. Ties to OQ-025. *Claude: agree.*
- **E-07 · Low** — the same 4-code limit says "attempts" on sign-in, "codes" on OTP; only OTP offers Doctor Ops. Use "codes" + Doctor Ops on both.
- **E-12 · Low** — unlock: the big blue icon tile looks tappable but isn't; "Ready when you are" says nothing. Make the tile trigger unlock; drop the line.
- **E-13 · Low** — during the phone prompt the offer greys "Not now"; unlock leaves its quiet actions active. Match the offer.
- **E-14 · Low** — screen-lock offer says "PIN or pattern" (misses password / iPhone passcode); one padlock icon means two things. "Unlock the app with your phone's screen lock…"; different icon for the privacy row.
- **E-15 · Low** — unlock subtitle "Let's check in on your patients today." — doctors don't have ongoing patients (they pull cases). Neutral line or none.

**Home**
- **H-02 · Low** — one action, three names: "+ Add time" → "Add availability" → "Time added". Title the sheet "Add time".
- **H-04 · Low** — "Your selection is saved." — nothing was saved. → "kept".
- **H-07 · Low** — End availability sheet: "receive" vs "get"; doesn't say a pending request is still honoured.
- **H-10 · Low** — Profile always shows a fingerprint icon; method may be face or screen lock. Neutral icon.

**Prescribe and Rx**
- **P-03 · Med** — injection chips count injections, "Other" asks for units (example B12 1000 mcg isn't dosed in units). One unit word across chips, Other and the printed line.
- **P-07 · Med** — the Disable sheet never says the medicine is **removed from the patient's order** (D-59). One subtitle line. *New reason vs D-52 (removed a repeated line): this states a consequence. Claude: agree.*
- **P-09 · Low** — SOS switch off-state ~1.3:1, below WCAG 3:1. Fix centrally in `.tm-toggle`.
- **P-11 · Med** — the customer's upload is titled "Prescription"; everywhere else that word is the doctor's output. → "Customer's Rx". *Claude: agree — two documents, one word, clinical flow.*
- **P-12 · Low** — an invalid Other value silently drops the dose from the printed line; 0-0-0 shows "0-0-0". Same placeholder ("Dose needed").

**Case and calling** (with your walkthrough misses)
- **C-04 · Med** — Skip HA during a live transfer call: the patient has heard "stay on the line — I'll connect you to our Health Advisor"; the script switches to the Cat4 line, which doesn't take that back. New script, e.g. "I've written your prescription. You won't need the Health Advisor call — you can track your order in the Truemeds app." *Claude: agree.*
- **C-05 · Med** — Callback during a live call closes the case with no line for the patient, and Request next case isn't checked against the call having ended (D-63 assumed other closed states come after the call). *Claude: agree — same pattern as 15/B3.*
- **C-07 · Med** — "Calling {name}…" stays for minutes of conversation; the only sign the patient answered is Back disappearing. Where live events exist (Ozonetel), change the text to "On call with {name}" — same status line.
- **C-08 · Med** — notes are dropped without warning on Callback / Unavailable; the callback goes to another doctor who re-asks the symptoms. *New reason vs D-59 pt 1 (pool hand-over). Claude: worth discussing; at minimum one line in the Callback sheet.*
- **C-14 · Low** — locked empty notes on a closed case still show the "e.g., Fever since 2 days…" placeholder — can read as recorded symptoms. Show "None recorded".
- **C-15 · Low** — availability ended during a case: only Back to Home, no reason given. One line.
- **C-16 · Low** — "Callback today at 3:00 PM" reads like the doctor's own appointment; it goes to the pool. "Callback scheduled for…".
- **C-17 · Low** — offline tap on Call: "No connection. Nothing was lost." — doesn't say what failed. "Couldn't start the call. You're offline."
- **C-19 · Low** — release-failed and load-failed notices sit inside an otherwise empty white card; other failures sit in the bar. Drop the wrapper card.

---

## Checked and fine (no change)

- **Entry:** `unlock_cancelled` / `unlock_platform-retry` identical to the default — correct (cancel isn't a failure; retries are the phone's own prompt). Offer failed → "Try again" (D-65). Unlock unavailable promotes Use OTP instead (the model for E-03).
- **Home:** `home_profile-case-open` unreachable but harmless (note in app-logic). Both actions hidden while an unclear request is checked — correct.
- **Prescribe:** long names wrap in the header — safer; mark D-23's one-line text as superseded. `d-header-white` identical to `d-default` (documents D-51).
- **Case:** 7d Confirm without a record (D-58 pt 20, D-68, D-73). Pending tags on closed cases (D-52). Time slots in 3 columns — picture right, RULES §9.2 text to update. No Unavailable on 6, no Callback on 7b / 13 / B2 (D-58). 8c red notice with Confirm still tappable (Flag 5, D-64).

## What the auditors said should stay
Verbs that carry through each action (Confirm prescription → Confirming… → Prescription confirmed) · one slot under Order details for script then outcome · the gate holds on every calling picture · reason sheets that apply on tap · field errors vs notices cleanly separated on sign-in and OTP · OTP locked keeps Change and Doctor Ops · the honest, calm faster sign-in offer · the pinned "On prescription" band · Home's single action area · the Discard sheet as the model confirmation sheet.

## Patterns
1. **Call state depends on a signal Cat4's partner doesn't send** (C-01, C-02, C-07).
2. **Script and outcome drift when the path changes mid-call** (C-04, C-05).
3. **The printed prescription line is the clinical contract and has gaps** (P-01, P-02, P-03, P-12).
4. **Busy states disable the bar but not the content** (H-01, C-03, C-09).
5. **Copy registry hygiene** — plurals, apostrophes, two words for one thing (E-07, E-08, C-11, C-12, H-04, P-11).
