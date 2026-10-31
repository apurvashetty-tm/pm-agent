# Feedback state mapping

Version 1.1 · 2026-10-14 · D-41, D-44, D-45 · Read [feedback-rules.md](feedback-rules.md) first.

This maps current auth/Home states and known recovery conditions to reusable feedback. It is not a list of new screens to build or render. Shared copy now lives in `../ui-screens/feedback/messages.json` with behavior metadata in `metadata.json`; generated browser/native adapters consume the same text. Copy approved (D-53). Existing approved PNGs remain historical until source-derived visual review.

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
| signin.pasted-cleaned | None | Normalise supported prefix; preserve meaningful digits per D-39 | Existing + fixture |
| signin.sending | L1 | Send pending; disable duplicate send | Existing + fixture |
| signin.not-registered | N1 | Server access result; existing sign-up route / approval information | R06 |
| signin.offline | F2 after action; N1 passive | Restore connectivity, retry; retain number; one message | R03 sibling + layout QA |
| signin.couldnt-send | F2 | Confirmed send failure; retain number and retry | R03 sibling + layout QA |
| signin.too-many-tries | W1 | Issuance cap; wait for server eligibility, retain number | R04 sibling + fixture |
| signin.inactive | F2 access block | Server says inactive; Call Doctor Ops | Existing + notice integration QA |

## OTP

Current copy: `../ui-screens/otp/otp.html`. Native: `../ui-screens/native/OtpScreen.tsx`. Decisions D-34, D-35, D-39, D-44 (layout v2). Layout v2 rows below replace the earlier OTP behaviour; all OTP rows drop "preserve opt-in" (no opt-in on OTP after D-45).

| State / registry key | Pattern | Trigger and recovery | Visual coverage |
|---|---|---|---|
| otp.default | None | Keyboard open on load; box 1 focused; resend timer running (D-44) | Superseded: layout v2 capture pending |
| otp.empty-tap | F1 | Submit empty; focus input | R01/R02 siblings; keyboard QA |
| otp.too-short | F1 | Submit1–3 digits; retain input, edit | R01/R02 siblings; keyboard QA |
| otp.verifying | L1 | Verification pending; retain code, prevent duplicate | Existing + fixture |
| otp.wrong-code | F1 | Code stays visible, red borders, no focus box; first keystroke replaces whole code; keyboard open (D-44) | Superseded: layout v2 capture pending |
| otp.two-tries-left | F1 | Same as wrong code, with remaining-tries count (dynamic) | R02 sibling + longest-copy QA |
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
| otp.cooldown-reconciling | W1 + progress | Timer zero; wait for authoritative eligibility before enabling | Fixture |
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
| case.back-before-call | Confirmation sheet | No call attempted yet. Back (header or phone gesture) opens "Leave this case?" · "It goes back to the queue for another doctor." · **Release case** / Stay on this case. Release → Home. |
| case.releasing | L1 | Release pending; one request; primary shows the busy state (L2). Failure keeps the doctor on the case with an F2 notice. |
| case.back-blocked | N1 (not an error) | Call attempted or connected, case not closed. Header Back hidden; phone back gesture shows "Finish this case first. Then you can go back to Home." Help stays available. |
| case.closed | None | End of case: confirmation at the top of the content, titled by path ("Prescription confirmed" / "Transferred to HA" / "Forwarded to HA"); pinned bar **Request next case** (primary) + **Back to Home** (secondary), stacked. Header Back hidden; phone back → Home. Case content read-only and muted (D-51). |
| case.closed-availability-ended | None | Availability ended during the case: only **Back to Home**; Home shows the expired state. |
| case.reopened | None | App reopened with a case open → straight back into the case. |

## Case page — states still to design and render (D-52)

| State | Pattern | Behaviour |
|---|---|---|
| case.loading | L1 | Header and card outlines (skeleton) while the case loads; no text, no actions until loaded. |
| case.load-failed | F2 | Error notice "Couldn't load this case." + primary **Try again**; nothing else on the page. *Copy approved (Apurva, D-53).* |
| case.offline | W1 → F2 | Warning notice (D-54: offline blocks the main action) "You're offline. Reconnect to call or confirm." while browsing; an action attempted offline fails with one error notice "No connection. Nothing was lost. Try again when you're back online." Typed notes are kept. *Copy approved (Apurva, D-53).* |
| case.confirm-busy | L1 | Final CTA busy (L2), label **"Confirming…"**; every other action disabled; no second submit. *Copy approved (Apurva, D-53).* |
| case.confirm-failed | F2 | Error notice above the bar "Couldn't confirm. Nothing was lost. Try again."; CTA back to normal. An uncertain result is reconciled before retry (no duplicate confirm). *Copy approved (Apurva, D-53).* |
| case.release-failed | F2 | Sheet closes; doctor stays on the case; error notice "Couldn't release this case. You're still on it. Try again."; Back works again. *Copy approved (Apurva, D-53).* |
| case.callback-failed | F2 | Error notice inside the sheet "Couldn't schedule the callback. Your time is kept. Try again."; chosen date and time kept. *Copy approved (Apurva, D-53).* |
| rx.load-failed | F2 | Inside the viewer: notice "Couldn't load the prescription." + **Try again**; ✕ still closes. *Copy approved (Apurva, D-53).* |
| case.no-medicines | Empty | `.tm-empty` "No medicines on this order." in the Medicines card. |
| case.long-content | — | Long patient name (two lines in the header) and long medicine names, checked at 360. |

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
