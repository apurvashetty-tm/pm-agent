# PRD v0.4 — rule tests

Round 2 review cases, derived from the PRD and frozen sources. These are written test cases, not executed app tests. No product decisions are added.

Counting: one numbered entry per independently asserted rule; compound behaviours are tested together where they form one rule. Repeated summaries are cross-references, not additional rules. §5.9 Release includes the rules it incorporates from §5.6. Each §7 setting row is covered; the common configuration requirement is covered separately.

Settings marked [NEED] remain parameterized: their behaviour is testable, but execution waits for the named owner to provide the value. UNCLEAR means the expected result itself cannot be fixed from the wording; it does not turn an existing open setting into a new product decision.

## RT-01 · §5.7 · Gate

- Given: a case with qualifying connected talk time.
- When: the total reaches the configured gate.
- Then: the call becomes valid; below the gate it remains invalid.
- Source proved: `docs/prd/PRD.md:266`.
- Frozen / linked evidence: `ui-screens/app-logic.md:116`.

## RT-02 · §5.7 · Accumulation

- Given: two qualifying connected calls on the same case.
- When: their combined talk time reaches the gate.
- Then: their talk time adds up; calls on another case do not contribute.
- Source proved: `docs/prd/PRD.md:266`.
- Frozen / linked evidence: `ui-screens/app-logic.md:117`.

## RT-03 · §5.7 · Hidden count

- Given: any call in progress.
- When: the screen renders.
- Then: no running talk-time count is shown.
- Source proved: `docs/prd/PRD.md:266`.
- Frozen / linked evidence: `ui-screens/app-logic.md:117`.

## RT-04 · §5.7 · Live authority

- Given: a live Pilot call with an HA required.
- When: the app count from patient answer reaches the gate but partner duration differs.
- Then: Confirm prescription appears using the app count; partner duration remains reporting data.
- Source proved: `docs/prd/PRD.md:267`.
- Frozen / linked evidence: `calling-flow/data.js:171`.

## RT-05 · §5.7 · Other-call authority

- Given: Cat4, customer/system HA-skipped Pilot, or doctor-skipped Pilot.
- When: the live app count reaches the gate without a partner result.
- Then: no live Confirm appears; the partner result determines validity after hang-up.
- Source proved: `docs/prd/PRD.md:267`.
- Frozen / linked evidence: `ui-screens/app-logic.md:120`; `calling-flow/data.js:222`.
- UNCLEAR: “on a live Pilot call” includes HA-skipped Pilot, but the frozen sources explicitly place it on the post-call result path. This expected result follows the frozen sources; the PRD sentence alone cannot prove it.

## RT-06 · §5.7 · Attempted definition

- Given: a failed request, missed doctor leg, unanswered patient leg, or answered patient leg.
- When: attempts are counted.
- Then: only the answered patient leg counts as attempted.
- Source proved: `docs/prd/PRD.md:268`.
- Frozen / linked evidence: `ui-screens/app-logic.md:118`.

## RT-07 · §5.7 · Before gate

- Given: an invalid call outside the no-result recovery path.
- When: actions render.
- Then: none of Confirm prescription, Confirm & transfer, Confirm & forward or Skip HA appears.
- Source proved: `docs/prd/PRD.md:269`.
- Frozen / linked evidence: `ui-screens/app-logic.md:121`.

## RT-08 · §5.7 · Missing-result exception

- Given: the call ended and the backend result check found nothing.
- When: the doctor confirms using the route-specific button.
- Then: the saved prescription waits for the record; it is not yet confirmed.
- Source proved: `docs/prd/PRD.md:269`.
- Frozen / linked evidence: `calling-flow/data.js:141`; `calling-flow/data.js:245`.

## RT-09 · §5.7 · System-selected route

- Given: a case with a backend-selected type and HA status.
- When: the final action renders.
- Then: the system selects the action without asking the doctor to choose a route.
- Source proved: `docs/prd/PRD.md:270`.
- Frozen / linked evidence: `ui-screens/app-logic.md:176`.

## RT-10 · §5.7 · Cat4 ending

- Given: a valid Cat4 call and no Pending medicines.
- When: Confirm prescription succeeds.
- Then: the ending is Prescription confirmed.
- Source proved: `docs/prd/PRD.md:274`.
- Frozen / linked evidence: `ui-screens/app-logic.md:180`.

## RT-11 · §5.7 · HA-skipped ending

- Given: a valid Pilot call with HA skipped by customer, system or doctor.
- When: Confirm prescription succeeds.
- Then: the ending is Prescription confirmed, without transfer or forward.
- Source proved: `docs/prd/PRD.md:275`.
- Frozen / linked evidence: `ui-screens/app-logic.md:181`.

## RT-12 · §5.7 · Live HA-required ending

- Given: a live valid Pilot call with HA required.
- When: Confirm prescription succeeds.
- Then: the HA check runs and ends transferred or forwarded according to availability/transfer start.
- Source proved: `docs/prd/PRD.md:276`.
- Frozen / linked evidence: `ui-screens/app-logic.md:176`.

## RT-13 · §5.7 · Ended/no-result HA-required route

- Given: an HA-required Pilot call ended after the gate, or its result is missing.
- When: final actions render.
- Then: Confirm & forward is the final button; missing-result confirmation waits for the record.
- Source proved: `docs/prd/PRD.md:277`.
- Frozen / linked evidence: `calling-flow/data.js:234`; `calling-flow/data.js:245`.

## RT-14 · §5.7 · No HA on Cat4

- Given: a Cat4 case.
- When: any case UI renders.
- Then: no Health Advisor actions or content appear.
- Source proved: `docs/prd/PRD.md:279`.
- Frozen / linked evidence: `ui-screens/app-logic.md:188`.

## RT-15 · §5.7 · Unproven rejection

- Given: a saved confirm awaiting proof.
- When: the record is below gate, shows no patient answer, or fails to arrive by the configured wait.
- Then: the prescription is not confirmed; hold/retry applies, no payment is earned, a mismatch is logged, and no Ops review item is created.
- Source proved: `docs/prd/PRD.md:280`.
- Frozen / linked evidence: `calling-flow/data.js:154`; `calling-flow/data.js:162`.

## RT-16 · §5.7 · Pending block

- Given: any confirm action with n Pending medicines.
- When: the doctor taps the still-tappable action.
- Then: confirmation is blocked, the matching singular/plural message appears and the page scrolls to the first Pending medicine.
- Source proved: `docs/prd/PRD.md:281`.
- Frozen / linked evidence: `ui-screens/app-logic.md:194`.

## RT-17 · §5.7 · Automatic unavailability

- Given: patient no answer, busy, switched off, unreachable or invalid number.
- When: the failure is detected at any stage.
- Then: the case closes for the doctor as Patient unavailable.
- Source proved: `docs/prd/PRD.md:282`.
- Frozen / linked evidence: `ui-screens/app-logic.md:122`.

## RT-18 · §5.7 · Script lifetime

- Given: a case before Call patient.
- When: Call patient is tapped, then the call ends.
- Then: the script appears from the tap while the call may be live and hides after hang-up.
- Source proved: `docs/prd/PRD.md:283`.
- Frozen / linked evidence: `ui-screens/app-logic.md:102`.

## RT-19 · §5.7 · Status latency

- Given: a partner-reported status change.
- When: the report is received.
- Then: the app shows the change within the §7 configured latency.
- Source proved: `docs/prd/PRD.md:284`.
- Frozen / linked evidence: `ui-screens/app-logic.md:164`.

## RT-20 · §5.7 · Call and retry

- Given: a ready case, failed request, missed doctor leg or too-short call.
- When: the doctor taps Call patient or Call again as offered.
- Then: a new click-to-call begins.
- Source proved: `docs/prd/PRD.md:286`.
- Frozen / linked evidence: `calling-flow/data.js:17`; `calling-flow/data.js:56`; `calling-flow/data.js:110`.

## RT-21 · §5.7 · Call-status question

- Given: no result and an unknown call end.
- When: the question appears and the doctor chooses Still talking or Call ended.
- Then: Still talking resumes Calling; Call ended initiates a result check.
- Source proved: `docs/prd/PRD.md:286`.
- Frozen / linked evidence: `calling-flow/data.js:128`.

## RT-22 · §5.7 · Alternative exits

- Given: a too-short or missing-result call.
- When: exit actions render.
- Then: Callback is offered in both; manual Patient unavailable is offered only with missing result.
- Source proved: `docs/prd/PRD.md:286`.
- Frozen / linked evidence: `ui-screens/app-logic.md:204`; `ui-screens/app-logic.md:208`.

## RT-23 · §5.8 · Capacity wording

- Given: no free HA after confirmation.
- When: the patient script and doctor UI render.
- Then: they promise a callback without saying HA unavailable.
- Source proved: `docs/prd/PRD.md:296`.
- Frozen / linked evidence: `calling-flow/data.js:211`.

## RT-24 · §5.8 · Closed-case exits

- Given: a transferred or forwarded case after hang-up with availability active.
- When: the ending renders.
- Then: Request next case and Back to Home are available; §5.5 limits the ending to Home if availability ended.
- Source proved: `docs/prd/PRD.md:303`.
- Frozen / linked evidence: `ui-screens/app-logic.md:94`.

## RT-25 · §5.8 · HA free

- Given: a live confirmed HA-required Pilot case.
- When: the HA check finds a free HA and transfer starts.
- Then: the patient is transferred on the same call; the doctor ending is Transferred to Health Advisor.
- Source proved: `docs/prd/PRD.md:306`.
- Frozen / linked evidence: `calling-flow/data.js:186`; `calling-flow/data.js:192`.

## RT-26 · §5.8 · HA absent or transfer start fails

- Given: a live confirmed HA-required Pilot case.
- When: no HA is free or the transfer cannot start.
- Then: the case is forwarded for an HA callback.
- Source proved: `docs/prd/PRD.md:306`.
- Frozen / linked evidence: `calling-flow/data.js:200`; `calling-flow/data.js:209`.

## RT-27 · §5.8 · Forward waits for hang-up

- Given: a forwarded call still live.
- When: the doctor views the case and later hangs up.
- Then: the patient script remains and the action bar only shows Waiting for the call to end…; next-case/Home actions appear after hang-up.
- Source proved: `docs/prd/PRD.md:307`.
- Frozen / linked evidence: `calling-flow/data.js:201`; `calling-flow/data.js:205`.

## RT-28 · §5.8 · Forward proof

- Given: a forwarded case.
- When: the partner result arrives.
- Then: the forward is confirmed only if the result proves the call; an unproven result follows §5.7.
- Source proved: `docs/prd/PRD.md:308`.
- Frozen / linked evidence: `calling-flow/data.js:202`; `calling-flow/data.js:206`.

## RT-29 · §5.8 · Ended before Confirm

- Given: HA-required Pilot call valid but not confirmed.
- When: the call ends.
- Then: Confirm & forward and Skip HA are offered.
- Source proved: `docs/prd/PRD.md:309`.
- Frozen / linked evidence: `calling-flow/data.js:231`.

## RT-30 · §5.8 · Skip eligibility

- Given: each combination of Cat4/Pilot, valid/invalid, HA required/already skipped, result missing/present.
- When: actions render.
- Then: Skip HA is offered only for valid Pilot with an HA call still to come and not in the missing-result recovery state.
- Source proved: `docs/prd/PRD.md:310`.
- Frozen / linked evidence: `ui-screens/app-logic.md:185`; `ui-screens/app-logic.md:187`.

## RT-31 · §5.8 · Skip reasons

- Given: an eligible Pilot case.
- When: Skip HA is tapped.
- Then: the choices are patient declined, clinically not required, and repeat patient familiar with medicines.
- Source proved: `docs/prd/PRD.md:310`.
- Frozen / linked evidence: `calling-flow/data.js:181`.

## RT-32 · §5.8 · Skip on live call

- Given: a live eligible Pilot call.
- When: the doctor chooses a skip reason.
- Then: the case waits for the partner result, then follows the Cat4 result route; no live Confirm is shown.
- Source proved: `docs/prd/PRD.md:310`.
- Frozen / linked evidence: `calling-flow/data.js:219`; `calling-flow/data.js:222`.

## RT-33 · §5.8 · Separate outcomes

- Given: Cat4 confirmed, HA-skipped confirmed, transferred and forwarded cases.
- When: outcomes are tracked.
- Then: four distinct outcomes are recorded, independent of shared button text.
- Source proved: `docs/prd/PRD.md:311`.
- Frozen / linked evidence: `ui-screens/app-logic.md:191`.

## RT-34 · §5.9 · Distinct exits

- Given: a releasable, unreachable or callback-eligible case.
- When: the corresponding ending succeeds.
- Then: Release returns to another doctor queue, Patient unavailable holds/retries, and Callback books a later consultation.
- Source proved: `docs/prd/PRD.md:320`.
- Frozen / linked evidence: `calling-flow/data.js:31`; `calling-flow/data.js:68`; `calling-flow/data.js:121`.

## RT-35 · §5.9 · Callback eligibility

- Given: all calling states.
- When: Callback visibility is evaluated.
- Then: it is offered only for too-short or missing-result calls, never on a live call.
- Source proved: `docs/prd/PRD.md:328`.
- Frozen / linked evidence: `ui-screens/app-logic.md:204`.

## RT-36 · §5.9 · Callback booking

- Given: an eligible case where the patient answered.
- When: the doctor selects today/tomorrow and a backend time and confirms.
- Then: the case closes for this doctor and enters the callback pool.
- Source proved: `docs/prd/PRD.md:328`.
- Frozen / linked evidence: `ui-screens/app-logic.md:201`; `ui-screens/app-logic.md:203`.

## RT-37 · §5.9 · Callback answer guard

- Given: an eligible-looking case whose patient never answered.
- When: the doctor submits a callback.
- Then: the backend refuses it; no booking is made.
- Source proved: `docs/prd/PRD.md:328`.
- Frozen / linked evidence: `calling-flow/data.js:121`.

## RT-38 · §5.9 · Retryable cause

- Given: automatic unavailability due to busy, no answer, switched off or network problem.
- When: the case is held.
- Then: retries use configured gaps and attempts for that cause.
- Source proved: `docs/prd/PRD.md:329`.
- Frozen / linked evidence: `calling-flow/data.js:68`.

## RT-39 · §5.9 · Unknown cause

- Given: automatic unavailability with unknown cause.
- When: the case closes.
- Then: it goes on plain hold without an invented retry schedule.
- Source proved: `docs/prd/PRD.md:329`.
- Frozen / linked evidence: `ui-screens/app-logic.md:207`.

## RT-40 · §5.9 · Invalid number

- Given: a patient failure identified as invalid number.
- When: the case is held.
- Then: it is not retried and is flagged for data cleanup.
- Source proved: `docs/prd/PRD.md:329`.
- Frozen / linked evidence: `calling-flow/data.js:69`.

## RT-41 · §5.9 · Manual unavailable guard

- Given: every state including too-short and missing-result.
- When: manual Unavailable visibility is evaluated.
- Then: it appears only in the missing-result state.
- Source proved: `docs/prd/PRD.md:330`.
- Frozen / linked evidence: `ui-screens/app-logic.md:208`.

## RT-42 · §5.9 · Manual unavailable reason

- Given: a missing-result case.
- When: the doctor chooses didn’t answer, not reachable or wrong number.
- Then: the case closes and the chosen reason is saved with it.
- Source proved: `docs/prd/PRD.md:330`.
- Frozen / linked evidence: `ui-screens/app-logic.md:208`.

## RT-43 · §5.9 · Release eligibility

- Given: a case on Ready or doctor-side failure where patient has never answered.
- When: Back then Release is selected.
- Then: Release returns the case to the queue and the doctor to Home; Stay cancels leaving.
- Source proved: `docs/prd/PRD.md:331`.
- Frozen / linked evidence: `docs/prd/PRD.md:237`; `ui-screens/app-logic.md:100`.

## RT-44 · §5.9 · Release refusal

- Given: a partner-accepted request without an eligible doctor-side failure, or a patient-answer race.
- When: Release is requested.
- Then: the backend refuses release and the doctor remains on the case.
- Source proved: `docs/prd/PRD.md:331`.
- Frozen / linked evidence: `docs/prd/PRD.md:238`; `ui-screens/app-logic.md:100`.

## RT-45 · §5.9 · Empty release

- Given: an empty case.
- When: Release case is tapped.
- Then: release occurs directly without a sheet and returns to Home; no Call patient appears.
- Source proved: `docs/prd/PRD.md:331`.
- Frozen / linked evidence: `docs/prd/PRD.md:246`; `ui-screens/app-logic.md:96`.

## RT-46 · §5.9 · Discard notes

- Given: typed consultation notes on a case.
- When: Callback or Patient unavailable closes it.
- Then: those notes are not saved.
- Source proved: `docs/prd/PRD.md:332`.
- Frozen / linked evidence: `ui-screens/app-logic.md:262`.

## RT-47 · §5.9 · Callback required fields

- Given: callback sheet missing both selections, only date, or only time.
- When: Confirm callback is tapped.
- Then: the matching Pick a date and a time / Pick a date / Pick a time error appears; no callback is booked.
- Source proved: `docs/prd/PRD.md:335`.
- Frozen / linked evidence: `ui-screens/app-logic.md:202`.

## RT-48 · §5.9 · Callback save failure

- Given: chosen callback day/time.
- When: saving fails.
- Then: the sheet shows Couldn’t schedule the callback. Your time is kept. and retains selections.
- Source proved: `docs/prd/PRD.md:336`.
- Frozen / linked evidence: `ui-screens/app-logic.md:203`.

## RT-49 · §5.9 · Callback refusal message

- Given: patient never answered.
- When: callback is refused.
- Then: the sheet shows Couldn’t schedule the callback. The patient wasn’t reached..
- Source proved: `docs/prd/PRD.md:337`.
- Frozen / linked evidence: `calling-flow/data.js:120`.

## RT-50 · §5.9 · Callback outcome card

- Given: a callback successfully booked at a chosen day/time.
- When: the ending renders.
- Then: the card displays that chosen day/time rather than a fixed example.
- Source proved: `docs/prd/PRD.md:338`.
- Frozen / linked evidence: `calling-flow/data.js:125`.

## RT-51 · §5.9 · Unavailable outcome card

- Given: a case closed as Patient unavailable while availability is active.
- When: the ending renders.
- Then: the Patient unavailable card offers Request next case and Back to Home.
- Source proved: `docs/prd/PRD.md:339`.
- Frozen / linked evidence: `ui-screens/app-logic.md:209`; `calling-flow/data.js:67`.

## RT-52 · §7 · Remote settings

- Given: an owner changes a configurable product setting.
- When: the new setting is applied.
- Then: the app uses the changed value without requiring a new app release.
- Source proved: `docs/prd/PRD.md:425`.

## RT-53 · §7 · Gate default

- Given: the launch gate is unchanged.
- When: qualifying total is just below, at or above 50 seconds.
- Then: only totals at or above 50 seconds pass.
- Source proved: `docs/prd/PRD.md:429`.
- Frozen / linked evidence: `ui-screens/app-logic.md:116`.

## RT-54 · §7 · Qualifying-call boundaries

- Given: same-case connected calls around the stated duration and window cutoffs.
- When: eligible talk time is accumulated.
- Then: include only calls meeting the configured minimum duration and time window.
- Source proved: `docs/prd/PRD.md:430`.
- Frozen / linked evidence: `ui-screens/app-logic.md:117`.
- UNCLEAR: “about 10 s” and “about 30 min” do not define exact inclusivity or the window anchor. Nominal accumulation can be tested, but boundary expectations cannot be fixed from these sources.

## RT-55 · §7 · Status default

- Given: a partner status report with a recorded receipt time.
- When: the app receives it.
- Then: the changed status is visible within approximately 5 seconds.
- Source proved: `docs/prd/PRD.md:431`.
- Frozen / linked evidence: `ui-screens/app-logic.md:164`.

## RT-56 · §7 · Missing-result timeout

- Given: no result after the Call tap.
- When: 3 minutes pass, then another 3 minutes after Still talking.
- Then: ask Still on the call only if the end is unknown; otherwise check for the record; repeat the question at the configured interval.
- Source proved: `docs/prd/PRD.md:432`.
- Frozen / linked evidence: `ui-screens/app-logic.md:125`; `calling-flow/data.js:126`.

## RT-57 · §7 · Record wait configuration

- Given: the owner supplies wait W and a confirm is awaiting proof.
- When: no record arrives by W.
- Then: treat the confirm as unproven under §5.7; run with configured W, not an invented launch number.
- Source proved: `docs/prd/PRD.md:433`.
- Frozen / linked evidence: `calling-flow/data.js:154`.

## RT-58 · §7 · Retry configuration

- Given: Ops/Engineering supply gaps and attempts for failure reason R.
- When: a retryable Patient unavailable case for R is held.
- Then: retry with that configuration and stop at its configured attempt limit; invalid numbers remain excluded.
- Source proved: `docs/prd/PRD.md:434`.
- Frozen / linked evidence: `calling-flow/data.js:68`.

## RT-59 · §7 · Minimum availability

- Given: a doctor selects availability below, at or above 15 minutes.
- When: availability is set.
- Then: reject lengths below 15 minutes and accept lengths at/above it.
- Source proved: `docs/prd/PRD.md:435`.
- Frozen / linked evidence: `ui-screens/app-logic.md:64`.

## RT-60 · §7 · Ending-soon threshold

- Given: Product supplies threshold E.
- When: remaining availability falls below E.
- Then: show the ending-soon notice; use configured E without substituting the prototype value.
- Source proved: `docs/prd/PRD.md:436`.

## RT-61 · §7 · Wrong OTP cap

- Given: a registered number with consecutive wrong OTP submissions.
- When: the fifth wrong code is submitted.
- Then: the number locks; fewer wrong codes do not trigger this cap.
- Source proved: `docs/prd/PRD.md:437`.
- Frozen / linked evidence: `ui-screens/app-logic.md:41`.

## RT-62 · §7 · OTP issuance cap

- Given: a number in one configured limit window.
- When: it has received the first code and three resends, then requests another.
- Then: four codes are allowed in total; the next request is limited.
- Source proved: `docs/prd/PRD.md:438`.
- Frozen / linked evidence: `ui-screens/app-logic.md:42`.

## RT-63 · §7 · OTP time settings

- Given: Product/Engineering supply lock length L, window V and code life C.
- When: each timer elapses or a code older than C is submitted.
- Then: the lock/window follow L/V and the expired code cannot verify; test with configured values, pending OQ-017.
- Source proved: `docs/prd/PRD.md:439`.
- Frozen / linked evidence: `docs/prd/PRD.md:113`; `docs/prd/PRD.md:118`.

## RT-64 · §7 · Resend waits

- Given: Product supplies increasing waits R1 < R2 < R3.
- When: each resend is requested.
- Then: block resend until the applicable wait expires; each successive configured wait is longer.
- Source proved: `docs/prd/PRD.md:440`.

## RT-65 · §7 · Failed unlock threshold

- Given: Product supplies failed-unlock cap F.
- When: the Fth failed phone unlock occurs.
- Then: fall back to OTP using F, not the prototype cap.
- Source proved: `docs/prd/PRD.md:441`.
- Frozen / linked evidence: `docs/prd/PRD.md:170`.

## RT-66 · §7 · Ongoing duration

- Given: backend default is the launch six months.
- When: Ongoing is selected.
- Then: the printed duration is six months; changing backend default changes the printed duration.
- Source proved: `docs/prd/PRD.md:442`.
- Frozen / linked evidence: `docs/prd/PRD.md:359`.

## RT-67 · §7 · Earnings default

- Given: a prescription with a proven call.
- When: it becomes confirmed.
- Then: earnings add ₹20 once; unproven confirms earn nothing.
- Source proved: `docs/prd/PRD.md:443`.
- Frozen / linked evidence: `calling-flow/data.js:106`; `docs/prd/PRD.md:280`.

## RT-68 · §7 · Backend callback slots

- Given: backend sends a set of callback slots.
- When: the callback sheet opens.
- Then: the selectable times come from that set, not the prototype time list.
- Source proved: `docs/prd/PRD.md:444`.
- Frozen / linked evidence: `ui-screens/app-logic.md:201`.

## RT-69 · §7 · Backend links

- Given: backend supplies sign-up, Terms, Privacy and Doctor Ops destinations.
- When: each link/action is used.
- Then: the supplied destination is opened, with no hard-coded prototype destination.
- Source proved: `docs/prd/PRD.md:445`.
- Frozen / linked evidence: `docs/prd/PRD.md:79`.

Count: 69 rules, 69 tests, 2 unclear.
