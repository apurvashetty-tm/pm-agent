# Screens audit: Claude's independent review (round 1)

**Scope:** everything below the blue band on Sign-in (12 states), OTP (17), the faster sign-in offer (7), Returning unlock (7) and Home. Home means the approved Home page's 19 states plus Profile / Log out?, judged on the **Home v3 body** (setup + available). Sheets and Profile are covered only where they open from these screens.

**Inputs:**
- `measure.json`, `facts.md` and `measure-<screen>.png`: 132 captures, 66 states × 390×844 and 360×640.
- `RESEARCH.md`, RULES §8–9, `components.css`, app-logic §1–3, the feedback-state map, the decisions listed in the brief, and `messages.json`.

**Band:** I took the band spec as agreed (band audit `CONCLUSION.md`), so the panel top is **173** everywhere. Where a gap below depends on the panel top (360×640 fit), I recomputed it with 173.

**Tags:**
- **drift**: the same thing is done two ways with no decision behind it.
- **gap**: industry practice that we lack, with no decision saying why.
- **Apurva**: changes a locked spec, an approved decision or approved copy.
- **deliberate**: backed by a decision (named).

---

## 1 · One standard across screens

| Part | What we have (measured) | Verdict |
|---|---|---|
| **Field group** (Sign-in) | Label 14/20 semibold → 8 → control 50 → 8 → helper 14/20 (L4). Error replaces the helper in the same slot. | Fine (component, L4/L7). |
| **OTP code** | 56 boxes (L1) → 8 → one reserved centred message line (L7). | Deliberate (D-44, D-46/47, Round 5 B "Verify never moves"). |
| **Result notice under a field** | Sign-in: field → notice **16** (D-98). OTP box notices (locked, offline, couldn't verify, resend failed, too many codes, expired-and-limited): code → notice **8**. | **drift**: OTP should be 16, as D-98 says for every field. |
| **Notice → inline primary** | Sign-in notice → Send OTP **16**. OTP locked notice → Verify **32**. | **drift**: use one value. I'd use 16 (related: the notice is about this button). |
| **Last line → inline primary** | Sign-in helper → Send OTP **16**. OTP consent → Verify **32**. D-44 says the consent sits "directly above the button". | **drift**: use 16. It also lifts Verify 16 px on the tightest keyboard screen. |
| **Notice styles** | Panel notice: inset box at the 16 margin, padding 12/12, radius 12, left-aligned. Bar notice: full-width band, padding 12/16, top radius 16, centred. | Deliberate (A-19, D-86). Keep both, documented as two variants of one component. |
| **Panel-top standing notice** | Home stop-pending / ended: notice → content **16** (`.panel > .status`). Unlock unavailable: notice alone. | Fine. Keep 16 in the standard. |
| **Bar contents** | Padding 16 on all sides. Buttons 56 apart by 8. Notice → button **16** (component). Status / caption line → button **8** (v3 "Available until 7:45 PM"). "Checking…" status line replaces the button (48 tall). | Mostly deliberate. **The caption line (8) is not written down anywhere.** Add it to the standard: "bar caption: L3 centred, 8 above its button; a notice is 16". |
| **Buttons** | Primary / quiet / destructive 56 / 18 semibold in every bar, sheet and inline form. Compact secondary (Add time) 48 / 16. Order primary → quiet with 8 between. | Consistent. |
| **Icon tiles** | Offer hero and unlock prompt: same 64 tile, radius lg, brand-subtle, 32 glyph, centred at panel top + 32, then **16** to the next block. | Consistent. The band fix keeps them at the same y at 360 too (F8). |
| **Links** | **Change**: brand semibold inline with a 48 `::after` (band audit). **Resend code**: brand, in a 48-tall line. **Terms / Privacy**: brand inside 12/16 legal text. **Sign up**: brand semibold in a 14/20 sentence pinned to the bottom. | Fine. All links are brand blue; the inline-link exception (§8.6) covers Terms, Privacy and Sign up. |
| **Group labels** | v3 "Quick picks" / "Custom", the sheet's "Adjust duration" and Profile's "Today's earnings": all 16/24 semibold, 8 to the control (A-20). | The style is consistent. **The words drift** (§5): the add-time sheet still uses "Adjust duration", where v3 setup says "Custom". |
| **Duration picker** | v3 setup: Quick picks (6 chips, 3 columns, 8/8) → 32 → Custom (column heads 4 → wheel 3×48). Add-time sheet: chips with no label → 16 → "Adjust duration" + "Minimum 15 minutes" → wheel. | **drift**: one picker block, used on setup and in the sheet. |
| **"Minimum 15 minutes"** | Approved setup: shown, right of the wheel label. v3 setup: **missing**. | **drift** against D-40 ("show 'Minimum 15 minutes' once on setup"). Put it back in v3, right-aligned on the "Custom" label row (14/20 grey), as approved. |
| **Sheets** | Title 20/28, ✕ 48. Subtitle 4 below a 48 header row, so it sits **~30 below the title text**. Header → content 16. Content → actions **24** (`margin-top xl`). | The 24 is a component spec. The ~30 between title and subtitle reads as two blocks. The band uses 8. See §2. |
| **Error inside the sheet** | Add-failed: notice → Add button **40** (16 margin + 24 actions gap). A-12 says "16 above its button, as on the page". | **drift**: put the sheet's result notice **inside the pinned actions, 16 above Add**, as the bar does (A-19). It then also stays visible when the content scrolls at 360. |
| **Small print** | OTP consent 12/16 (L4), centred. Sign-in "New to Truemeds? Sign up" 14/20, centred, pinned to the bottom. | Fine. See §3. |

## 2 · Gaps

**Off-scale gaps that are component anatomy (keep):**
- OTP resend line: the 48-tall line box has 18 of text in it, so it looks like 31 / 59. Box to box it is 8 / 16 / 32 (target, A-03).
- Wheel column heads 4 (D-40 anatomy).
- Card row label → value 4 (value-display anatomy; home-v3 Q2 is still open with Apurva).
- Sheet content → actions 24 (§9.4 component).
- Approved Home `rx` row (48 min-height). v3 replaces it anyway.

**Off-scale or drifting gaps to fix:**
1. OTP code → box notice: **8 → 16** (D-98).
2. OTP consent → Verify and locked notice → Verify: **32 → 16** (§1).
3. Sheet title → subtitle: **~30 → 8**. Move the subtitle into the header block, as the band does. This is a central component change (`components.css` `.tm-sheet__subtitle`), so it goes to the design system with Apurva's yes.
4. Sheet error → Add: **40 → 16**, inside the actions (A-12).

**Small phones (§8.14, 360×640, with the band at 173):**
- **Offer, enable-failed / offline:** the third point still sits about 8 px under the bar at the first scroll position (−48 today, +40 from the band fix).
  - The panel scrolls, the bar's shadow is the cue, and the end clearance is 24. **Passes.**
  - Every other offer state clears once the band moves.
- **Add-time sheet:** the content scrolls by 64 (142 on add-failed). The wheel is cut through its selected row, right under the pinned Add button. The capture shows **no hairline / shadow** on the actions (`.is-stuck`), so nothing says "scroll".
  - **Check that `sheet-scroll.js` runs on Home** and that the picture shows the cue.
  - Moving the error into the actions (fix 4) stops the error being scrolled away.
- **v3 setup:** scrolls by 65. The wheel edge is the cue and the end clearance is 16 (accepted in the v3 run).
- **OTP with the keyboard:** the static picture hides Verify and the consent under the 256 keyboard. The build scrolls the code + Verify above the keyboard (F-05, wheel-keyboard run).
  - From code top to Verify bottom is 300 px today and **268** with fix 2, against 384 − 16 available.
  - **Passes in the build.** The approved picture just shows the unscrolled frame.
- **Sign-in at 360×640 is not a real 640 screen.** The reference page has `min-height: 844px`, so the sign-up line and the keyboard drawing sit below the fold.
  - It's a capture quirk, not a design fault.
  - Re-render it in a 640 frame before calling Sign-in done at 360 (§8.14).

## 3 · Type

- Four levels plus L9 hold almost everywhere: titles L1, field / group labels and key content 16/24, supporting text 14/20, values L9 32/40.
- **One weight per role, one break:** the offer's point titles are **16/24 medium (500)**. Every other 16/24 emphasis (unlock "Ready when you are", Profile names, group labels) is **semibold (600)**. Medium isn't on the scale (§8.1: 16/24 "or -strong").
  - **drift → semibold**, or regular if the three bold lines feel heavy. I'd pick **semibold** to match Profile's row titles.
- **Card labels:** v3 uses "Time remaining" / "Prescriptions written today" at 16 regular primary. App-logic §3 (A-10) says "Labels are 14 px grey".
  - v3 deliberately overrides A-10 (v3 REPORT §3).
  - Approving v3 should also amend A-10, so the two documents agree. No separate question needed.
- **Under 14 and actionable:** only the OTP consent (12/16) with its Terms / Privacy links.
  - §8.1 allows 12 for L4 legal fine print, and the links are optional reading.
  - At 14/20 it becomes three lines at 360 and pushes Verify down on the tightest keyboard screen.
  - **Deliberate (L4, D-44). Keep.**
- **Field label vs group label:**
  - Field label (14/20 semibold, `tm-field__label`) and group label (16/24 semibold) are two roles.
  - Keep both, but name them in the standard so nobody "unifies" them.

## 4 · Industry check, per screen

| Screen | Good practice (RESEARCH.md) | Ours | Verdict |
|---|---|---|---|
| Sign-in | Country code separate | Fixed "+91" prefix inside the field | ✓ |
| | Numeric keyboard | `type=tel`, `inputmode=tel` | ✓ |
| | Say a code will come by SMS | Helper "We'll send you a verification code by SMS." | ✓ (wording, §5) |
| | Validate on submit / blur | "Wrong first digit" and "more than 10" show as typed | Deliberate (app-logic §2, D-101 o04) |
| | Don't force a length unless the country needs it | 10 digits (India) | ✓ |
| OTP | Show where the code went + a way to fix it | "Sent to +91 … · Change" | ✓ |
| | Keyboard opens on load | Yes | ✓ (D-44) |
| | Countdown instead of Resend, cap new codes | Resend in 0:30 / 60 / 120 s; 4 codes per window | ✓ (D-35, Visa caps at 3: same idea) |
| | SMS auto-fill | Web: `autocomplete="one-time-code"` ✓ | |
| | | Native: nothing says "Android SMS User Consent / SMS Retriever; iOS `.oneTimeCode`" | **gap**: a hand-off note for the app team, no screen change |
| | Paste, auto-advance | One real input under four boxes | ✓ |
| | Clear wrong / expired / locked | All present | ✓ |
| | Auto-submit after auto-fill (common) | No auto-verify | Deliberate (D-44). The research doesn't show a real problem. Keep. |
| Offer | Right after a successful sign-in, optional, visible fallback | After OTP sign-in, at most 3 times (D-104); Not now | ✓ |
| | Convenience framing; "Set up now / Not now" | "Skip OTPs next time"; Turn on faster sign-in / Not now | ✓ |
| Unlock | **Open the phone's prompt automatically on app open** | Only when the doctor taps Unlock (an old build note: "no automatic prompt, matching the approved 'Ready when you are' screen") | **gap → Apurva.** Open the prompt once on arrival. Cancel leaves today's screen with the Unlock button (the existing `cancelled` state). It saves a tap on every app open, the most frequent entry. No decision rejects it; the note only describes the build. |
| | Fallback after 2–3 failures | 3 failures → Sign-in with the number filled in (D-105) | ✓ |
| Home | (no research given) | Pull model, pinned actions, end time shown ("Available until") | ✓ |

## 5 · Words

**Vocabulary we should hold to:**
- **OTP** for the SMS code everywhere outside the OTP screen; **code** only on the OTP screen, where the boxes give it context.
- **Faster sign-in** for the feature.
- **Availability / time** for the window, **case** for the work, **get** for new cases.

| Where | Today | Ship | Why |
|---|---|---|---|
| Sign-in helper | We'll send you a verification code by SMS. | **We'll send an OTP to this number by SMS.** | Same noun as the "Send OTP" button. "Verification code" appears nowhere else on screen. |
| Sign-in send failure | Couldn't send the code. | **Couldn't send the OTP.** | Same noun as the button that failed. |
| Offer point 1 | No more waiting for SMS codes / Unlock the app with one touch, not an OTP. | **Sign in with one touch / No more waiting for an SMS.** | Today the subtitle and point 1 both say "instead of waiting for an OTP", three times in four lines. (Face ID: "Sign in with a glance"; screen lock: "Sign in with your PIN or pattern".) |
| Add-time sheet title | Add availability | **Add time** | The button that opens it says "Add time". |
| Add-time sheet label | Adjust duration | **Custom** (with "Quick picks" over the chips) | Same picker as v3 setup. |
| End sheet subtitle | You won't **receive** new cases after this… | You won't **get** new cases after this… | "get" is used everywhere else (`subNoNewCases`, `idleExpired`, `manuallyEnded`). |
| OTP message line | New code sent | **New code sent.** | Every other message on that line ends with a full stop (§9.7: full stops on sentences in notices / helpers). |
| Sign-in "Too many attempts on this number." vs OTP "Too many wrong tries." | — | Keep | Two different limits (sends vs wrong codes). |
| Unlock subtitle "Let's check in on your patients today." | — | Keep (band copy, kept by the band audit) | The doctor takes cases, not "their patients", but it's warm and approved. Not worth a question. |

## 6 · States

- **Nothing jumps that shouldn't.**
  - Sign-in's notice states move Send OTP (accepted: one message per cause, inline button).
  - OTP's one-line states keep Verify fixed; its notice-box states move it (accepted, app-logic §2).
  - The offer and unlock bars grow upwards from the bottom (A-19).
  - Home: the panel top was the only jump (stop-pending), and the band audit fixed it.
- **States the research expects:**
  - All present on sign-in, OTP and the offer.
  - Unlock lacks an **auto-prompt** step (§4).
  - The **OS biometric lockout** (too many failed scans) is covered by `platform-retry` / the 3-failure fallback.
- **Home on v3: these states still exist only on the old body.** near expiry, ending, ended (idle / manual / expired-pending), offline, request / setup failures, unknown-result, the add-time sheet and the end-confirmation sheet.
  - Each needs a v3 picture before the build: card + bar notice, or panel-top notice + card.
  - "Add time" appears in the v3 *available* picture at 30:00. App-logic §3 shows it only near expiry, and the home-blocks-review Q3 is still open. The pictures must follow whichever Apurva picks.
  - The count on ended Home (home-blocks-review Q4) is also still open.
  - **I don't re-ask these two here.**

## 7 · Proposed screen standard (below the band)

| Part | Spec |
|---|---|
| Panel | Content starts 32 below the panel top. Side margins 16. |
| Group label | 16/24 semibold, 8 to its control. An optional helper (14/20 grey) sits right-aligned on the same line. |
| Field | Label 14/20 semibold → 8 → control → 8 → helper / error 14/20 in one slot (L4, L7). |
| Between groups | 32. Within a group 16. Chips 8 / 8. |
| Result notice (panel) | Inset box (padding 12, radius 12, left-aligned), **16 below the field or control it came from**, **16 above the next button**. |
| Standing notice | Top of the panel, same inset box, 16 to the content below. |
| Inline primary (typing screens) | **16 below the last line above it** (helper, notice or consent). Visible above the keyboard by scrolling (F-05). |
| Pinned bar | Padding 16. Buttons 56 / 18, primary → quiet, 8 apart. **Caption line** L3 centred, **8** above its button. **Bar notice** full-width band, centred, **16** above its button. Content scrolls; the end clearance is ≥ 16. |
| Icon tile (hero) | 64, radius lg, brand-subtle, 32 glyph, centred, at panel top + 32, then 16 to the next block. |
| List points / card rows | Icon 24 neutral, 12 to text, title 16/24 **semibold**, line 14/20 grey, 16 between points. Card rows: padding 16, hairline between. |
| Links | Brand. Semibold when the link is the line's action (Change, Resend code, Sign up). Regular inside legal text. 48 hit area unless inside a sentence. |
| Fine print | L4 12/16 only for legal consent. Nothing else under 14. |
| Sheet | Header (title 20/28 + ✕ 48) with the **subtitle 8 under the title inside the header** → 16 → content → 24 → pinned actions. **A result notice sits in the actions, 16 above its button.** |
| Picker (setup and add sheet) | One block: "Quick picks" chips → 32 → "Custom" + "Minimum 15 minutes" (setup only, D-40) → column heads 4 → wheel 3 × 48. |

## 8 · Per-screen changes

| Screen | Change | Tag |
|---|---|---|
| Sign-in | Helper "We'll send an OTP to this number by SMS."; "Couldn't send the OTP." | drift (copy → Apurva) |
| Sign-in | Re-render the 360 reference in a real 640 frame | drift (picture) |
| OTP | Code → box notice 8 → 16 | drift |
| OTP | Consent → Verify 32 → 16; locked notice → Verify 32 → 16 | drift |
| OTP | "New code sent." with a full stop | drift (copy) |
| OTP | Native hand-off note: SMS User Consent / Retriever, iOS one-time-code | industry gap (kit note) |
| Offer | Point titles medium → semibold | drift |
| Offer | Point 1: "Sign in with one touch / No more waiting for an SMS." (+ Face ID / screen-lock variants) | drift (copy → Apurva) |
| Unlock | Open the phone's prompt automatically once on arrival; the button stays for retry | industry gap → Apurva |
| Home v3 setup | Put back "Minimum 15 minutes" on the Custom row (D-40) | drift |
| Home add-time sheet | Title "Add time"; reuse the v3 picker (Quick picks / Custom); error in the actions, 16 above Add; scroll cue at 360 | drift |
| Home end sheet | "get" instead of "receive" | drift (copy) |
| Sheets (central) | Subtitle 8 under the title, inside the header | drift (design system → Apurva) |
| Home, remaining states | Render near expiry, ending, ended, offline, failures, unknown-result and both sheets on the v3 body | gap (pictures) |
| Returning unlock (layout) | No change | — |

## 9 · Questions for Apurva

1. **Unlock:** should the phone's fingerprint / Face ID prompt open by itself when the app opens (the Unlock button stays for a retry)?
2. **Copy:** OK to say "OTP" everywhere outside the OTP screen ("We'll send an OTP to this number by SMS.", "Couldn't send the OTP."), shorten the offer's first point to "Sign in with one touch", and use "Add time" as the sheet title?
3. **Sheets (design system):** OK to put a sheet's subtitle 8 under its title, as in the screen bands?
