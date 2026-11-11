Read-only cross-critique complete. No files changed; I did not read `claude-on-codex.md` or `CONCLUSION.md`.

Measurements below come from this audit’s `measure.json`, `facts.md` and annotated images, dated 2026-11-11. Calculated clearances are identified as inferred.

## 1 · One standard across screens

| Claude’s point | Verdict and reason |
|---|---|
| Field group | **Agree.** Label/helper gaps are 8; label and helper are 14/20. Keep the field anatomy and reserved error slot (L4, L7). |
| OTP code and reserved message | **Agree.** The 56 boxes and reserved message line are deliberate; preserve ordinary-state button stability (L1, L7, D-44, D-81). |
| Field → result notice | **Agree.** Box notices need 16 below the OTP control, rather than the measured 8. D-98 expressly covers notices under fields; ordinary helper text stays 8 below. |
| Notice → inline primary | **Disagree with 16 as an existing-rule fix.** §8.3 explicitly says result notice **↔** originating button is 8 (A-14). §9.5 specifies 8 **below** a button but supplies no contrary above-button value; D-98 governs **field → notice**, not notice → button. Thus my 8 recommendation follows the written rule; adopting Claude’s 16 requires a central rule clarification/change. |
| Helper/consent → inline primary | **Agree.** Sign-in uses 16; OTP’s consent → Verify is 32 from stacked spacing. Use 16 once; preserve D-81’s reserved consent during busy states. |
| Notice styles | **Agree.** Inset, left-aligned panel notices and centred bar bands are deliberate variants (A-19, D-86, §9.5). |
| Panel-top standing notice | **Agree.** Keep 16 to following content. These describe the screen’s situation rather than an action result (§9.5). |
| Bar contents and caption | **Agree.** Keep padding 16, action gap 8, notice → button 16. Document the measured 14/20 caption → button 8 separately; my calling that fully documented was too strong. |
| Buttons | **Agree.** Full actions are 56/18; compact Add time is 48/16 (§9.1). |
| Hero tiles | **Agree.** Both use 64 tiles, 32 glyphs, panel inset 32 and following gap 16 (D-61). |
| Links | **Partly.** The visual treatments and inline legal-link exception are sound (§8.6). The Sign-up reference’s `span` alone does not establish a functional build defect: reference pages are picture references (D-77). |
| Group labels | **Agree.** The measured 16/24 semibold role is consistent; “Adjust duration” versus “Custom” needs reconciliation with the selected picker. |
| Duration picker | **Agree on reuse.** Setup and Add should share picker anatomy; D-40’s wheel remains. Setup-only guidance must not automatically become Add-sheet copy. |
| “Minimum 15 minutes” | **Agree.** Restore the D-40 setup reminder omitted by v3. I caught its absence in round 1 but failed to carry it consistently into the change list. |
| Sheet subtitle | **Agree with Claude’s proposed component, not its “drift” classification.** A subtitle belongs with its title: title → subtitle 8, then header → body 16. §9.4 does not currently lock that internal 8; change the shared component with Apurva’s approval. |
| Add-sheet error | **Agree.** Measured notice → Add is 40; at 360 the notice is beneath the pinned actions. Put it in the visible action area, 16 above Add (A-12, A-19). Retain left alignment inside sheets (D-86). |
| Small print | **Agree.** OTP consent is the permitted 12/16 legal exception; Sign-up remains 14/20 (L4, §8.6). |

**Subtitle correction to my review:** removing the extra 4 only changes header → subtitle from 20 to 16; title text → subtitle remains approximately **26** `[INFERRED: current ~30 − 4]`. That fixes stacking but fails to group the title and subtitle. Claude’s component proposal is better.

## 2 · Gaps

| Claude’s point | Verdict and reason |
|---|---|
| Resend text gaps | **Agree.** Apparent 31/59 gaps include text positioning inside a 48 target and reserved helper space; they are not literal margins (A-03, L7). |
| Wheel headings 4 | **Agree.** D-40 component anatomy. |
| Value label → value 4 | **Agree on spacing.** This is value-component anatomy; the count’s wording remains the separate home-blocks Q2. |
| Sheet actions gap 24 | **Agree.** Preserve shared sheet anatomy (§9.4). |
| Old Home row gaps | **Agree.** Replace superseded bodies with v3; do not round text-centering measurements into margins. |
| Four proposed spacing fixes | **Agree**, except notice → inline button remains the §1 rule dispute. Subtitle 8 is a proposed shared-component change, not an already-mandated token correction. |
| Offer small-phone overflow | **Agree, conditional on corrected capture.** −48 plus the band’s 40 saving leaves approximately −8 `[INFERRED]`; scrolling, cue and end clearance can satisfy §8.14. |
| Add-sheet cue | **Agree on the missing visible cue; partly on diagnosis.** Home already includes `sheet-scroll.js`, so “check it runs” must become “check execution and `.is-stuck` behaviour.” Measured overflow is 64, or 142 with failure (§8.14). |
| v3 setup | **Agree.** Overflow 65 with wheel continuation and 16 end clearance is documented; overflow itself is not failure (§8.14). |
| OTP keyboard | **Agree with a qualification.** The wheel-keyboard report records whole-screen scrolling and 16 CTA clearance, with simulated-viewport tests passing. Real Android/iOS keyboard verification remains outstanding. |
| Sign-in 360 reference | **Agree; my round-1 diagnosis was wrong.** `sign-in.html:27` and capture rule at `:60` impose `min-height:844px`; the bottom-positioned 256 keyboard extends below the 640 capture. My assumed keyboard top of 384 was not its actual reference geometry. |

The [wheel-keyboard report](../2026-11-10-wheel-keyboard/REPORT.md) also covers **Sign-in**, not just OTP. I should have distinguished static-reference evidence from the already-fixed build before proposing another keyboard fix.

## 3 · Type

| Claude’s point | Verdict and reason |
|---|---|
| Four levels plus L9 | **Agree.** Keep explicit component exceptions, including button labels and compact sheet titles (§8.1, L9). |
| Offer headings 500 → 600 | **Agree.** Measured medium differs from the supported strong role; semibold matches equivalent emphasis (§8.1). |
| v3 card labels override A-10 | **Agree.** Reconcile A-10’s 14-grey instruction with selected v3’s 16-primary labels; avoid a duplicate approval question. |
| Keep legal consent 12/16 | **Agree.** L4 permits it, including inline links (§8.6). |
| Separate field/group labels | **Agree.** Field label 14/20 semibold and group heading 16/24 semibold serve different roles; unifying them would erase component anatomy. |

## 4 · Industry check

| Claude’s point | Verdict and reason |
|---|---|
| Sign-in checks | **Agree.** Suitable number entry, SMS explanation and India-specific length exist. Immediate impossible-prefix validation is deliberate (D-39, D-101). |
| OTP destination, keyboard, resend, paste and errors | **Agree.** These behaviours exist; external examples do not override this product’s issue limits (D-34, D-35, D-44). |
| Native SMS handoff | **Partly.** Useful implementation guidance, but missing native terminology in these web-screen files does not prove missing native functionality. Treat as handoff verification, not a screen defect. |
| Explicit Verify | **Agree.** D-44 deliberately retains it; supplied research establishes no reason to reopen. |
| Optional offer | **Agree.** Placement, cancellation, fallback and capped re-offer are covered (D-61, D-93, D-104). |
| Automatic unlock prompt | **Partly.** Claude correctly challenges my approval claim; D-38 is headed **“built into the prototype”**, not “Decision (Apurva).” Its reference to an approved screen does not establish explicit approval of prompt timing. |
| Unlock fallback | **Agree.** Preserve D-105’s prefilled Sign-in without automatically sending SMS. |
| Home | **Agree.** Keep the pull model and pending-request rules (D-36); the supplied research contains no Home-specific requirement overriding them. |

**Unlock conclusion:** D-38 establishes the current implementation, not conclusive approval of tap-only authentication. Automatic prompting saves the initial tap `[INFERRED from the two flows]`, but the supplied research does not demonstrate a usability failure or universal requirement. [Android’s documentation](https://developer.android.com/identity/sign-in/biometric-auth) explains invoking the system prompt without prescribing automatic launch.

Write: **“Optional flow improvement for Apurva: prompt once on arrival, retaining Unlock after cancellation. Current tap-to-prompt is documented implementation; neither an approved rejection of automatic prompting nor a proven industry defect is established.”** My “deliberate—D-38, therefore closed” was wrong; Claude’s “industry gap requiring correction” is too categorical.

## 5 · Words

| Claude’s point | Verdict and reason |
|---|---|
| Vocabulary framework | **Agree.** OTP names the method; “code” is clear within OTP entry. Availability/time and case remain useful distinctions. |
| Sign-in helper/failure → OTP | **Agree as optional copy approval.** The helper is approved in D-33; neither inconsistency permits an unapproved rewrite. |
| Shorten offer point 1 | **Partly.** Repetition exists, but the offer copy was approved as drafted (D-47). Keep as an optional editorial proposal, not drift. |
| Add availability → Add time | **Agree as proposed copy.** It matches the opener; include in a small copy approval batch rather than presenting it as mechanical drift. |
| Adjust duration → Custom | **Agree**, subject to adopting the shared picker labels. |
| Receive → get | **Agree as minor consistency**, but no evidence justifies expanding the approved end-sheet sentence. |
| New code sent. | **Agree.** Add the full stop required by §9.7 and already present in app-logic. |
| Different attempt-limit wording | **Agree.** Sending limits and wrong-code limits describe different causes; retain approved D-81 messages. |
| Keep unlock band subtitle | **Agree.** The band is settled; a stylistic preference is insufficient to reopen it. |

**My excess copy proposals should be dropped from this audit’s approval queue:**

- Offer trust headings and third point: approved offer copy, D-47; no demonstrated factual defect.
- Idle/manual notice rewrites: explicitly **“approved as drafted”**, D-47.
- Logout rewrite and expanded end-sheet explanation: approved/frozen screens, D-81; no demonstrated functional misunderstanding.
- “Prescriptions confirmed today”: keep my preference only within existing **home-blocks Q2**, alongside “written”; do not ask again.
- Additional accessible-label wording: no demonstrated naming failure requiring a new copy decision.

Claude was more disciplined about limiting editorial scope.

## 6 · States

| Claude’s point | Verdict and reason |
|---|---|
| Expected layout growth | **Agree.** Inline server notices may move Sign-in/OTP actions; ordinary OTP states retain reserved geometry (D-81, app-logic §2). |
| Offer/unlock bar changes | **Agree.** Upward growth and unavailable-state alternatives are deliberate (A-19, D-93, D-105). |
| Home panel jump | **Agree within the agreed band correction.** Remaining state bodies still need v3 evidence. |
| Expected state coverage | **Partly.** Existing entry states cover the listed failures; automatic prompt is an optional flow change, not conclusively a missing required state. |
| OS lockout coverage | **Partly.** Existing retry/fallback handles recovery, but an app failure counter alone does not prove every OS lockout outcome is mapped (D-105). |
| Remaining Home states on v3 | **Agree.** Render notices, failures, ending/ended and sheets against the replacement body (§9.6). |
| Add time Q3 | **Agree; I was wrong.** “v3 wins” overclaimed. The home-blocks report explicitly leaves always-visible versus near-expiry to Apurva, linked to the Add cap. |
| Ended count Q4 | **Agree.** Preserve the existing question and requirement to retain the count; do not silently decide its placement or ask again. |

## 7 · Proposed screen standard

**Agree** with Claude’s panel, field, group, button, tile, type, links, picker and reserved-message specifications, for the reasons above.

**Partly** on notices and sheets: keep the written **8 notice ↔ inline originating button** unless centrally amended; adopt **title → subtitle 8 inside the header** only as an approved shared-component change. Moving sheet feedback into actions must preserve D-86’s left alignment.

**Partly** on keyboard compliance: the build has reported implementation/test evidence; actual-device checking remains necessary. Static captures alone cannot settle it.

## 8 · Per-screen changes

| Claude’s change group | Verdict |
|---|---|
| Sign-in copy and genuine 640 reference | **Agree**, with approved-copy tagging and no claim that the reference proves a build keyboard bug. |
| OTP spacing and punctuation | **Agree**, except the disputed notice → button value; retain ordinary-state stability (D-81). |
| Native SMS note | **Partly:** handoff verification, not established screen deficiency. |
| Offer weight and shortened first point | **Agree** on weight drift; **partly** on optional approved-copy revision (D-47). |
| Automatic unlock | **Partly:** optional improvement, not proven defect or already-approved rejection. |
| Setup minimum reminder | **Agree:** D-40 restoration. |
| Add sheet picker/error/cue | **Agree:** shared anatomy, visible feedback 16 above Add, working scroll cue (§8.14, A-12). |
| End-sheet wording | **Partly:** minor optional edit; preserve approved meaning. |
| Shared subtitle component | **Agree:** Apurva-approved central change, not local drift repair. |
| Remaining Home pictures | **Agree:** apply v3 without deciding Q2/Q3/Q4 through rendering. |

I did **not** miss the hidden add-time error: round 1 explicitly identified its 40 gap and its location beneath actions at 360. Claude added the useful scroll-cue check. Likewise, I identified the missing minimum reminder, but underemphasised it in my final actions.

## 9 · Questions for Apurva

**Partly agree with Claude’s three questions.**

- **Unlock:** optional, explicitly framed as saving a tap; not a required correction.
- **Copy:** one small optional batch, clearly identifying approved wording being changed. Drop my additional trust/control, idle/manual and logout rewrites.
- **Sheet subtitle:** retain a specific approval question for the shared component’s title → subtitle 8.

Do not repeat home-blocks Q2, Q3 or Q4. My broad “approve the whole standard” question was insufficiently precise.

## Still disputed

- **Inline result notice → button:** Claude recommends 16; I retain 8 under §8.3’s explicit bidirectional A-14 rule, pending a central amendment.
- **Automatic unlock:** Claude calls it an industry gap; I call it an optional improvement—D-38 does not conclusively approve tap-only, and research does not prove a defect.
- **Offer first-point rewrite:** Claude includes it in the copy batch; I would defer it unless Apurva wants editorial refinement of D-47-approved copy.

## Agreed list

- OTP box notices need field → notice 16; consent → Verify needs 16 without duplicate margins.
- Sheet subtitle should sit 8 under its title inside the header, through an approved shared-component change.
- Add-time failure must remain visible, 16 above Add; verify the sheet’s scroll cue.
- Restore D-40’s setup minimum reminder.
- Use the supported semibold role for offer headings.
- Correct the Sign-in 640 reference before judging its small-phone layout.
- Recognise the wheel-keyboard build fix; retain real-device verification.
- D-38 alone does not conclusively establish approval of tap-only unlock.
- Drop unnecessary rewrites of approved copy and duplicate approval questions.
- Always-visible Add time remains undecided in Q3.
- Render remaining Home states on v3 while preserving approved behaviour and existing open questions.
