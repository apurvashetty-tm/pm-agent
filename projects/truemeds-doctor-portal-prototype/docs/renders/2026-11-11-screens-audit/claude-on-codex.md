# Claude on Codex's review (round 2, cross-critique)

I read `codex-review.md` point by point, then checked each disputed item against the measurements, the rules and the sources.

**Where I was wrong:**
1. **Unlock auto-prompt.** I called it an industry gap. **D-38** (2026-10-12) records it: "the phone's prompt opens when the doctor taps Unlock (no automatic prompt…)". It is a build record, but it sits in the decision log and nothing has replaced it. The research shows a convenience gain (one tap saved), not a real problem, so under the brief's rule it is **deliberate**. I withdraw the question and move the idea to the backlog as a next-version idea.
2. **Codex saw Sign-in's keyboard clearance at 360 more clearly than I did.**
   - I had dismissed it as a reference-page quirk: the page has `min-height: 844`, so the drawn keyboard sits below the fold in the 640 capture.
   - The geometry is still real. With the band at 173, Send OTP's bottom is ≈ 383 against a keyboard top of 384, so the clearance is ≈ 1, not 16.
   - The **build** already scrolls the field and the main button 16 clear of the keyboard: F-05, `app/shell/keyboard.js` (wheel-keyboard REPORT §2). So **no design change** is needed.
   - The evidence for this is a picture in a real 640 frame, and **that needs a re-render**. We agree on the remedy; we differed only on cause.
3. **Sign up as a real link.** The reference renders it as a `span`, so the target can't be measured. I missed it. Agree: a real link with a 48-tall hit area. The line is standalone and pinned, so there is room for it.
4. **Add-time sheet error at 360.** Codex measured the failure notice at y552–598, under the pinned actions starting at y496. It is **invisible on arrival**, so this is a blocker, not only a 40-vs-16 drift. My fix (the notice moves into the actions, 16 above Add) solves both. Codex's severity is right.

## Point by point

| Codex point | Verdict | Why |
|---|---|---|
| §1 field anatomy; OTP deliberate (D-44, L1, L7) | agree | Same as mine. |
| §1 field result notice 8 → 16 (OTP) | agree | D-98. |
| §1 **inline notice → CTA 16 → 8** (Sign-in) | **disagree** | §8.3 / A-14's 8 is for a result notice **under the button it came from** (§9.5: "16 below the field it came from (D-98) **or** 8 below the button (A-14)"). Sign-in's notice sits under the **field**, above the button. Nothing sets that gap. Every other last line above an inline primary is 16 (helper → Send OTP), so the button's distance from the form stays the same whether a helper, an error or a notice is above it. 8 would also make the notice look attached to the button rather than to the number it is about. **Keep 16.** |
| §1 notice shapes deliberate (D-86) | agree | |
| §1 bar anatomy; v3 caption 8 | agree | I add one thing: the 8 caption gap is undocumented. Write it into the standard. |
| §1 sheet header → subtitle: remove the extra 4 (→ 16 box gap) | **partly** | Removing the stray 4 is the minimal drift fix, but it still leaves the subtitle **≈ 26 below the title text**. The 20/28 title sits centred in a 48 row, so 10 is lost under it. The band pairs title and subtitle at 8, and so does every other title / subtitle pair (Profile identity 0, offer points 0). A sheet subtitle 26 away reads as the first content line, not as the title's subtitle. **8 under the title inside the header** is the standard. It is a central-component change, so it needs Apurva. |
| §1 duration controls: reuse v3 groups | agree | Same as mine. |
| §2 gap table | agree | Codex is more precise than my list on the OTP and Profile anatomy (container vs text). I adopt its wording. |
| §2 OTP consent → Verify 32 → 16 | agree | Same as mine. |
| §2 OTP expired 96 = reserved consent | agree | |
| §2 offer failed / offline ≈ −8 after the band fix | agree | Same number as mine. It passes with a scroll cue + end clearance. |
| §2 Sign-in keyboard 360: "drift fix" | partly | The build already does this (F-05). It is a picture fix only (see above). |
| §2 OTP keyboard 360: "drift fix" | partly | Same: the build scrolls the OTP as one (`html.phone-kb`). With consent → Verify 16, code-top → Verify-bottom is 268 against 368 available. Only the picture is missing. |
| §2 add-time sheet error **blocker** | agree | See above. |
| §3 offer heading 500 → 600 | agree | |
| §3 Profile toggle 36×20 is inside a 48 row | agree | I didn't flag it either. |
| §4 Sign-in / OTP / offer checks | agree | Codex also adds "check SMS auto-fill on a device". I add the **native** hand-off note (Android SMS User Consent / Retriever, iOS `.oneTimeCode`). They are the same gap. |
| §4 unlock deliberate (D-38) | **agree** (I was wrong) | See above. |
| §5 "OTP" outside, "code" inside the OTP screen | agree | Same rule as mine. |
| §5 Sign-in helper "We'll send you an OTP by SMS." | agree | Shorter than mine ("…to this number…"). I take Codex's. |
| §5 "Couldn't send the OTP." · "New code sent." · "Add time" · Quick picks / Custom · "get" in the end sheet | agree | Same as mine. |
| §5 OTP accessible label "4-digit OTP" | agree | No visual change. Screen-reader users hear the same noun as the button. |
| §5 offer point 1 "No waiting for an OTP" | partly | Codex is right that "No more waiting for SMS codes" over-promises (OTP stays the fallback). But "No waiting for an OTP" repeats the subtitle ("…instead of waiting for an OTP") a second time. **Merge:** title **"Sign in with one touch"** (Face ID "with a glance", screen lock "with your PIN or pattern"), line **"No SMS to wait for."** |
| §5 Face ID trust "Your Face ID data stays on your phone" | disagree (drop) | Approved copy (D-65 mirrors the three variants). The meaning is already clear, and the change would add a question to Apurva for little gain. |
| §5 third point "Turn it off any time / From your profile." | drop | Approved copy. A marginal gain. |
| §5 count "Prescriptions confirmed today" | drop here | This is home-blocks-review **Q2** (written vs confirmed), still with Apurva. Don't ask it twice. |
| §5 idle-expired / manually-ended notices | **disagree** | D-47: "idleExpired and manuallyEnded approved as drafted". They aren't inconsistent with the agreed band ("Start taking cases" + "You can add time or stop anytime."): the notice says what happened, the band says what to do. |
| §5 logout "You'll need to sign in again to request cases." | drop | Approved copy (`profile.logoutConfirm`). Profile is in scope only as a sheet that opens from Home. The current line is accurate enough ("stop getting cases" under the pull model means "can't request"). |
| §6 sign-in / OTP / offer / unlock states | agree | |
| §6 "Home v3 shows Add time while available — **v3 wins**" | **disagree** | home-blocks-review Q3 left "Add time always vs near expiry only" to Apurva, and app-logic §3 still says near expiry. The v3 picture is a review picture, not a decision. The standard holds the slot either way (A-09); the pictures follow Apurva's answer. |
| §6 v3 renders for every Home state; long content / wrapped notices | agree | Same as mine: pictures to make, no new decision. |
| §6 Profile toggle states, sign-in too-long / prefilled evidence | partly | They exist (signin-d101 o04 pictures; `unlock.sign-in-prefilled` reuses sign-in default). This is out of the screen standard's scope, so I note it and add no action. |
| §7 standard | agree, with three edits | (a) Sign-in notice → CTA **16**, not 8. (b) Sheet subtitle **8 under the title**. (c) The bar caption line is 8 (Codex has it as "status"). |
| §8 OTP legal links `#` → D-101 config URLs | agree (reference only) | The build already reads them from config (signin-d101). There is nothing to change in the design. |
| §9 questions | partly | "Approve §5 wording" is too broad. I'd ask about **only** the changed lines, in one list. "Use the §7 standard" is not a yes/no Apurva can judge without the after pictures, so it goes with them. |

## Still disputed (after my side)
1. Sign-in notice → Send OTP: **16** (Claude) vs **8** (Codex).
2. Sheet subtitle: **8 under the title** (Claude) vs **16 box gap, ≈ 26 to the title text** (Codex).
3. Offer point 1 wording: "Sign in with one touch / No SMS to wait for." (Claude) vs "No waiting for an OTP" (Codex).
4. Add time always visible: **open** (Claude, Q3) vs **v3 wins** (Codex).
