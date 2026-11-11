## 1 One standard across screens

**Keep the shared structure. Fix OTP’s excess spacing, keyboard clearance and the add-time sheet’s hidden error first.** Most notice and button differences are intentional.

All measurements below are CSS px from `measure.json` / `facts.md`, captured **2026-11-11**. Proposed values are recommendations. Home findings use **v3’s body**; old Home measurements are identified separately. The agreed band is treated as fixed. No files changed; independent review answers were not read.

| Element | Difference and verdict |
|---|---|
| Field, label, helper | Sign-in: label **14/20 semibold**, control **50 high**, gaps **8 / 8**. Keep shared field anatomy; input text **16/24**. OTP’s hidden accessible label, centred boxes and centred errors are **deliberate — D-44, D-46/L1, D-47/L7**. |
| Field result notice | Sign-in notice is **16 below the control**; OTP notice is **8 below boxes**. **Drift fix:** use **16** for both, following current §8.3/D-98. Keep plain field errors **8** below. |
| Notice position | General situation at panel top; action result above its action. **Deliberate — §9.5/A-19:** unlock unavailable and Home ending/ended notices stay at panel top; offer failures and Home request/offline/near-expiry notices stay in the bar. |
| Notice shape | Content/sheet: inset, left aligned, **12 padding, radius 12**. Bar: edge-to-edge, centred, **12 vertical / 16 horizontal padding**, upper radius **16**. **Deliberate — component spec, D-86.** Do not make them identical boxes. |
| Notice gaps | Bar notice → button measures approximately **16**; keep. Sign-in notice → button is **16**, while §8.3 names **8** for a result notice and its button. **Drift fix:** use **8** for inline form feedback; retain the bar’s explicit **16** anatomy. |
| Primary buttons | Full-width actions consistently **56 high, 18/24 semibold**. Busy stays blue with white spinner. **Deliberate — §9.1, L2.** |
| Secondary / quiet | Add time: compact secondary **48 high, 16/24 semibold**. Not now, Use OTP instead, Cancel, Keep available, Stay signed in: quiet **56 high**. **Deliberate — D-61, D-81, D-105, §9.1.** |
| Destructive actions | End availability and Log out confirmations use red outline, with quiet stay action below. **Deliberate — §9.4.** Home’s ordinary End availability remains quiet. |
| Pinned bar | **16 padding**, **8 between actions**, safe-area addition. One action **88 high**; two **152**; v3 setup’s status + action **116**. These heights are **component anatomy**, not drift. Sign-in/OTP remain inline — **D-43**. |
| Hero tiles | Offer and unlock both **64×64**, glyph **32**, centred; panel → tile **32**, tile → content **16**. **Deliberate — D-61.** Grey reassurance icons versus blue hero tile is **deliberate — D-47**. |
| Change / Resend | Standalone actions have **48-high targets**. Countdown occupies the same **48-high row** as Resend. **Deliberate — D-81/fix-round A-03**. |
| Terms / Privacy | Inline links within **12/16 L4 consent** are a valid exception; do not enlarge the whole sentence or turn links into buttons. **Deliberate — D-44, §8.6.** |
| Sign up | Reference renders it as a `span`, so the measurement report misses its target. **Drift fix:** real link, visible focus, keyboard activation, **48-high hit area**. Keep it hidden while typing. |
| Small print | Consent alone qualifies as L4 here. Helpers, notices, countdowns and availability status remain **14/20 minimum**. |
| Bar status lines | “Available until…” is **14/20**, **8 above Set availability**. “Checking whether…” is a non-button status line. **Deliberate — v3 and D-75**. Different bar heights follow different contents. |
| Section labels | Quick picks, Custom, Adjust duration, Today’s earnings: **16/24 semibold**. Wheel column labels: **14/20 regular**. Available-card labels: **16/24 regular**, values carry emphasis. **Deliberate — v3 REPORT and component roles**. |
| Sheets | Shared header/actions exist, but subtitle positioning adds an extra **4**, producing **20** after the header. **Drift fix:** header → body **16**, with no extra top margin on a first-child subtitle. |
| Duration controls | v3 says Quick picks / Custom; add-time sheet still says Adjust duration and has no Quick picks label. **Drift fix:** reuse v3’s two labelled groups in the sheet. Keep D-40 wheel anatomy. |

## 2 Gaps

**An amber measurement is not automatically a spacing defect.** Several measurements compare text inside different containers rather than the containers themselves.

| Measured gap, states and sizes | Classification | Value to use |
|---|---|---|
| OTP **59**, boxes → resend/countdown text; default, verifying, resending, checking; both sizes | Reserved helper **8 + 20**, related gap **16**, plus text inset inside the **48-high row**. Component anatomy, but the reservation must be explicit. | Keep **8 + reserved 20 + 16**, not a literal 59 margin. |
| OTP **31**, error/success/notice → resend text; both sizes | **16** container gap + text’s vertical inset. Anatomy. | **16** between containers. |
| OTP **44**, boxes → Resend button; resend-available | Same reserved helper anatomy. | **8 + 20 + 16**. |
| OTP **47**, resend text → consent | Includes the row’s remaining height and **32** between groups. Anatomy. | **32** between resend group and consent/action group. |
| OTP consent → Verify **32**, all consent-visible states | `.grp` gap **16** plus consent bottom margin **16**. **Drift fix.** | **16**, once. |
| OTP expired Resend → Verify **96** | Includes invisible reserved consent and group spacing. **Deliberate stability**, under the approved “Verify never moves” rule. | Reserve the same consent/action geometry as ordinary states; no independent 96 spacer. |
| Bar notice → button **15.9** | Fractional positioning/rounding. | Keep **16** token. |
| Offer reassurance title → description **0** | One text item, component anatomy. | Keep **0**; **16** between items. |
| Wheel column labels → wheel **4** | **Deliberate — D-40**, confirmed in v3 REPORT. | Keep **4**. |
| v3 available panel → “Time remaining” **48** | Panel padding **32** + card padding **16**. Anatomy. | Keep **32 + 16**. |
| v3 value label → value **4** | Approved value-row anatomy in v3 REPORT. | Keep **4**. |
| Sheets header → subtitle **20**, all Home sheets, both sizes | Body margin **16** plus subtitle margin **4**. **Drift fix.** | **16**. |
| Sheet content → actions **24** | Shared sheet anatomy. | Keep **24**; bottom **24 + safe area**, actions **8** apart. |
| Add-failed notice → Add button **40**, 390 | Notice bottom spacing plus actions margin stack. **Drift fix.** | **16** notice → action. |
| Add-sheet “Hours” → action **108**, 360 | **Not a gap:** sticky actions overlap the tall picker; nearest-block calculation skips overlapping blocks. | Keep picker intact; scroll it above actions. |
| Profile **34**, page top → name | Body/card padding plus vertical centring beside avatar. Anatomy. | **16 body + 16 card**, centred identity text. |
| Profile **48**, avatar → earnings heading | Card padding + card separation + next card padding. Anatomy. | **16 + 16 + 16**. |
| Profile **12.5 / 14.5**, User manual → toggle text/track | Centring within the next **48-high row**. Anatomy. | Keep **48 row**. |
| Profile **27.5**, toggle text → Log out | Text inset + card padding + inter-card spacing. Anatomy. | Keep **16** outside the card. |

**Superseded Home measurements:** **43.5 / 45.5**, **30.5 / 28.5**, **44.5**, and **18** come from old row centring, timer-row height and adjacent labels—not independent margins. Replace those bodies with v3 rather than “rounding” those numbers. The **27.5 / 29.5** after ending/ended notices similarly include row text inset: use **16 notice → v3 card**.

**Small-phone findings — 360×640**

| Screen/state | Evidence | Verdict |
|---|---|---|
| Sign-in, keyboard states | Button bottom **414.7**, keyboard top **384**: overlaps by **30.7**. | **Drift fix.** Even moving the agreed panel up **32** leaves only about **1.3 clearance** `[INFERRED]`, short of **16**. Scroll field/helper/button into the usable viewport. |
| OTP, keyboard states | Default Verify starts **476.7**, below keyboard top **384**. Panel overflow **165**; service-notice states **192**. | **Drift fix.** Scroll exists, but the initial view hides the action without a useful cue. Band correction alone does not solve it. |
| Offer, ordinary states | Current content→bar **−1**; screen-lock **−21**. | Current panel is **213**, not agreed **173**. That correction provides **40 more space** `[INFERRED]`; these overlaps should disappear. |
| Offer, failed/offline | Current **−48**; panel scroll **72**. | After the band correction, approximately **−8** remains `[INFERRED]`. Retain scrolling, visible continuation cue and end clearance. |
| Offer unavailable | Current **−4**; scroll **28**. | Expected to clear after agreed band correction; verify capture. |
| Unlock | Minimum clearance **179**; unavailable **281**. | Passes captured layout. |
| Home v3 setup | **−49** initially; scroll **65**. | Deliberate overflow with wheel edge cue and **16 end clearance**, documented in v3 REPORT. Keep. |
| Home v3 available | **74** clear. | Passes base state. Recheck notices on this body; old Home’s **−12 near-expiry** is not a v3 measurement. |
| Add-time sheet | Overflow **64**; failed **142**. Failure notice at **y552–598**, beneath pinned actions starting **y496**. | **Drift fix, blocker:** error is invisible initially. Put the error immediately above Add in the visible action area, or scroll it fully into view. Preserve picker end clearance. |

## 3 Type

| Role | Standard | Finding |
|---|---|---|
| L1 screen title | **32/40 semibold** | Agreed band; no reopening. |
| L2 content | **16/24 regular**; semibold for section headings | Offer reassurance headings use **500**, unlock prompt and section headings **600**. **Drift fix:** reassurance headings **600** if treated as headings. |
| L3 support/status | **14/20 regular** | Field labels remain **14/20 semibold** component anatomy; countdown emphasis semibold. |
| L4 legal | **12/16 regular** | OTP consent, including inline Terms/Privacy links, is valid L4. |
| L9 value | **32/40 semibold, tabular** | v3 timer/count values comply. Keep values stable as digits change. |
| Component exceptions | Buttons **18/24**, compact buttons **16/24**, OTP digits **24**, wheel typography | Deliberate; do not count these as extra screen-text levels. |
| Sheet/Profile title | **20/28 semibold** | Shared compact-header component exception. |

No captured actionable screen text below **14** beyond the explicitly permitted consent links. The **36×20 Profile toggle is not a target failure**: its enclosing label is a **48-high tappable row**.

## 4 Industry check, per screen

| Screen | Good version / ours | Verdict |
|---|---|---|
| Sign-in | Separate country code, suitable keyboard, paste normalisation, explain SMS before sending, specific errors. Ours does these. | **Deliberate:** immediate impossible-prefix validation is D-39; keyboard does not auto-open, D-43. **Gap:** initial keyboard clearance and a semantic Sign up link. |
| OTP | Destination + correction route; one real input supporting paste/autofill; clear errors, resend recovery and visible submission. Ours has the right structure. [Chrome guidance](https://developer.chrome.com/docs/modern-web-guidance/guides/forms/sms-otp-form?hl=en), [Twilio](https://www.twilio.com/en-us/blog/developers/best-practices/otp-input-forms-html). | **Deliberate — D-44:** four visual slots, explicit Verify, retained wrong digits. **Gap:** small-phone visibility. Autofill attributes exist; actual SMS autofill needs device verification. |
| Offer | Post-sign-in, optional, device-specific method, clear benefit, Not now, cancellation without punishment. Ours meets the research brief. | **Deliberate — D-61/D-64/D-93/D-104:** cancellation returns unchanged; screen lock fallback; unavailable → Continue; capped re-offer. Fix overflow, not the flow. |
| Unlock | Recognisable account, native prompt, visible fallback, cancellation/retry handling. Ours has these. Android supports native biometric/device-credential authentication; it does not establish a universal requirement to prompt on launch. [Android documentation](https://developer.android.com/identity/sign-in/biometric-auth). | **Deliberate — D-38:** prompt only after tapping Unlock. RESEARCH.md’s automatic-prompt recommendation is insufficient to reopen it. **D-105:** fallback opens prefilled Sign-in without sending SMS. |
| Home | Clear availability state, explicit case request, editable time, preserved pending request, recoverable failures. v3 provides the core hierarchy. | **Deliberate — D-36/D-47:** pull model; honour pending request; no timer while ending. **Gaps:** apply v3 consistently to every state; fix sheet error visibility; restore minimum-duration guidance. |

Do not import Visa’s resend counts or another product’s biometric retry limits over this product’s approved policies.

## 5 Words

**Use “OTP” for the named sign-in method and “code” once the OTP screen establishes context.** “Availability” is the work window; “time” is its duration. Those distinctions are useful.

All changes to approved registry wording below are **needs Apurva**.

| Where | Wording I would ship |
|---|---|
| Sign-in helper | **“We’ll send you an OTP by SMS.”** Replaces the otherwise isolated “verification code”. |
| Sign-in send failure | **“Couldn’t send the OTP.”** Matches Send OTP. |
| OTP accessible field label | **“4-digit OTP”**. Visible errors may continue to say “code”. |
| OTP resend success | **“New code sent.”** Registry currently omits the full stop; app-logic specifies it. **Drift fix.** |
| Offer first point | **“No waiting for an OTP”**. “No more waiting for SMS codes” is an absolute claim despite OTP fallback. |
| Offer fingerprint trust heading | **“Your fingerprint stays on your phone”** — keep. |
| Offer Face ID trust heading | **“Your Face ID data stays on your phone”**. Face ID itself is a feature, not stored information. |
| Offer screen-lock trust heading | **“Your screen lock stays on your phone”** — understandable, but keep only with platform-accurate supporting claims. |
| Offer third heading | **“Turn it off any time”**. More exact than “Change it any time”; support: “From your profile.” |
| Add-time sheet title | **“Add time”**. Matches its opener; replaces “Add availability”. |
| Setup and add-time groups | **“Quick picks” / “Custom”** consistently. |
| Home count | **“Prescriptions confirmed today”**. More precise than v3’s “written”: project truth counts confirmed prescriptions. |
| Idle-expired notice | **“Choose how long you’re available to take more cases.”** Avoid repeating Availability ended and its no-new-cases subtitle. |
| Manually-ended notice | Same recovery sentence. The title/subtitle already establish the outcome. |
| End-availability sheet | **“You won’t get new cases. A case already assigned to you stays with you.”** Align receive/get vocabulary. |
| Logout confirmation | **“You’ll need to sign in again to request cases.”** Matches the pull model; avoids implying cases arrive automatically. |

**Keep unchanged:** Mobile number; Send OTP; Sending OTP…; Try again in {time}; Call Doctor Ops; Sign up; all specific number-format errors; not-registered/inactive notices; offline wording; Verify & sign in; Wrong code and tries-left variants (**D-81**); expiry/lock/resend-limit messages; Change; Resend code/countdown; Terms & Conditions; Privacy Policy; consent sentence; device-specific offer subtitles and unlock labels; Turn on faster sign-in; Turning on…; Try again; Not now; Continue; Ready when you are; Use OTP instead; Set/End availability; Request a case; Add {n} minutes; Setting… / Adding… / Requesting… / Ending…; Time remaining; Available until…; Hours / Minutes; Minimum 15 minutes; pending/unknown-result notices; failure messages; Time added; Cancel; Keep available; Profile; Today’s earnings; Earned; Incentive; User manual; Faster sign-in; Log out; Stay signed in.

The approved band titles/subtitles stay as supplied, including **Skip OTPs next time**, **You can take cases**, and **Availability ended**.

## 6 States

| Finding | Classification |
|---|---|
| Sign-in field-error states keep CTA at **y358.7**; server notices move it to **392.7**, or **432.7** for long not-registered copy at 360. | Expected content growth, not drift. Keep readable notices and scroll into view rather than reserving the longest notice everywhere. |
| OTP ordinary/error/resend/verifying states keep Verify at **y476.7**. Service notices move it to **503.7**; resend-limited **458.7**; locked **394.7**. | **Deliberate:** app-logic expressly permits notice-box states to move it. Fix duplicate consent spacing consistently, preserving stable ordinary states. |
| Offer notice raises the bar; unavailable hides Not now and changes primary to Continue. | **Deliberate — D-93.** Not a jumping-state bug. |
| Unlock cancelled/platform-retry retain the underlying layout; unavailable replaces the hero with a notice and one primary. | **Deliberate — D-47/D-105.** OS owns retry feedback. |
| Home v3 shows Add time while available; old Home exposes it only near expiry. | User-selected v3 wins here: keep its position across available, requesting, failures and near-expiry; disable where necessary. |
| Ending removes timer; expired-pending retains zero timer; ended returns to setup while preserving today’s count. | **Deliberate — D-36/D-47.** Apply v3 rows, not old layout. |
| Sign-in too-long and prefilled-return states are absent from this capture set. | **Drift fix:** add boundary evidence for **D-101/D-105**, not new product decisions. |
| Profile faster-sign-in off, pending, failed, cancelled and unsupported states are not demonstrated here. | **Drift fix:** demonstrate existing **D-70** behaviour; do not invent new flow. |
| Long doctor name, long duration/hour-format timer and wrapped bar notices on v3 lack evidence. | **Industry gap / §9.6 coverage gap.** Capture at both sizes. |
| Add-failed exists but its message is beneath sticky actions at 360. | State exists; presentation fails. **Drift fix.** |

No case for adding a new standalone success screen, automatic OTP verification, or automatic biometric prompt.

## 7 Your screen standard

| Component | Below-band standard |
|---|---|
| Panel | Agreed top **173**, radius **24**, top padding **32**, side margins **16**. |
| Field | Label **14/20 semibold** → **8** → control; input **16/24** → **8** → helper/error **14/20**. |
| OTP | **56-square** slots, **8** apart; reserved **20-high** message line **8** below; resend row **48 high**. |
| Groups | **16 within**, **32 between**; explicit component exceptions only. |
| Notices | Field result **16 below control**; inline result → CTA **8**. Panel notice → next group **16**. Bar notice → CTA **16**. |
| Actions | Full-width **56 / 18 semibold**; compact **48 / 16 semibold**; **8** between grouped actions. |
| Bar | **16 padding + safe area**; action feedback first, primary, then alternative/quiet action. Status-only wait uses status line. |
| Hero / reassurance | Tile **64**, glyph **32**; next content **16** below. Reassurance items **16** apart; title **16/24 semibold**, support **14/20**. |
| Duration picker | Quick picks / Custom; headings **16/24 semibold**; labels **14/20**; D-40 three-row wheel and **4** label-to-wheel gap. Minimum reminder once on setup. |
| Value rows | Label **16/24 regular**, value **L9**, **4** internal gap; padding **16**. |
| Links | Brand colour, visible focus; standalone target **48 minimum**; legal inline exception retained. |
| Sheets | Title **20/28 semibold**, close **48**; header → body **16**; content → actions **24**; actions **8** apart; bottom **24 + safe area**. Feedback **16 above action** without stacked margins. |
| Small phone | Scroll cue when needed; final content **16 clear** of bar; inline CTA **16 clear** of keyboard. Sheet header/actions remain visible. |

## 8 Per-screen changes

| Screen | Change | Tag |
|---|---|---|
| Sign-in | Fix keyboard viewport/scroll clearance; make Sign up a real link. | drift fix |
| Sign-in | Inline notice → CTA **16 → 8**. | drift fix |
| Sign-in | Align helper/failure wording with OTP terminology. | needs Apurva |
| OTP | Notice below boxes **8 → 16**; consent → button **32 → 16**; preserve reserved-message stability. | drift fix |
| OTP | Ensure boxes, feedback and Verify are reachable above keyboard with **16 clearance**. | drift fix |
| OTP | Replace `#` legal links in reference with D-101 configured destinations; punctuate resend success consistently. | drift fix |
| Offer | Use one heading weight; verify failed/offline overflow after agreed band correction. | drift fix |
| Offer | Tighten benefit/trust/control wording. | needs Apurva |
| Unlock | Preserve tap-to-prompt, OS retry and D-105 prefilled fallback. | deliberate — D-38/D-105 |
| Home | Apply v3 body across all states; restore “Minimum 15 minutes” once on setup, required by D-40. | drift fix |
| Home | Keep Add time placement stable; preserve count in ending/ended states. | drift fix |
| Home sheets | Remove extra subtitle margin; standardise picker group labels; expose add failure above action. | drift fix |
| Home/Profile | Demonstrate long content, wrapped notices and existing toggle states. | industry gap |
| Home/Profile | Use confirmed-prescription wording, Add time title, consistent pull-model copy. | needs Apurva |

## 9 Questions for Apurva

1. **Approve the wording changes in §5?**
2. **Use the shared below-band standard in §7 for this whole set?**
