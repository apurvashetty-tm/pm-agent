# Screens audit: conclusion (Claude + Codex, 2026-11-11)

**Scope kept:** pictures and reports only. No app, kit, PRD, decision-log or design-system file was changed. The "after" pictures inject `after.css`, `after.js` and `after-copy.json` into the approved pages at capture time, on top of the band audit's spec.

**At a glance:**
- **Before:** `measure-<screen>.png` shows every state at 390×844 and 360×640, with every block below the band outlined and its gaps drawn on.
- **After:** `after-<screen>.png`, plus `before-after.png` for the 12 states the changes touch.
- **Evidence:**
  - Measurements: `measure.json` (132 captures), `facts.md` (digest) and `after-measure.json` with `after-check.json` (**48 / 48 on spec**). The token guard passes on `after.css`.
  - Keyboard: `keyboard-360.png` and `keyboard-check.json` (**8 / 8**). At 360×640, OTP and Sign-in are scrolled the way the build does it (F-05). The field stays visible and the main button sits 16 above the keyboard.
  - Reviews, in order: `claude-review.md`, `codex-review.md`, `codex-on-claude.md`, `claude-on-codex.md` and `codex-final.md`.

**Overall:** the screens already share most of a standard: buttons, the pinned bar, notice variants, hero tiles, group labels and links. What's missing is a written spec for the parts below the band, plus seven small drift fixes, one hidden error and a short copy batch.

## 1 · The screen standard (below the band; builds on the band spec)

| Part | Spec | Token / source |
|---|---|---|
| Panel | Content starts 32 below the panel top (173). Side margins 16. | `--tm-space-2xl`, `--tm-space-page` |
| Gaps | 8 tight · 16 within a group · 32 between groups. Component anatomy keeps its own values: wheel heads 4, value label → value 4, sheet content → actions 24, OTP resend line 48 tall. | §8.3 |
| Group label | 16/24 semibold, 8 to its control. An optional helper (14/20 grey) sits right-aligned on the same line. Examples: "Quick picks", "Custom · Minimum 15 minutes", "Today's earnings". | A-20 |
| Field | Label 14/20 semibold → 8 → control → 8 → helper or error, 14/20, in one slot (L4, L7). The field label and the group label are **two roles**; don't merge them. | `.tm-field` |
| OTP code | 56 boxes, 8 apart (L1) → 8 → a reserved 20 message line (centred, L7) → 16 → the 48 resend line. | D-44, A-03 |
| Result notice, no bar | Inset box (padding 12, radius 12, left-aligned), **16 below the field it came from** (D-98) and **8 above the button it came from** (§8.3, A-14). | `.tm-notice` |
| Standing notice | Top of the panel, the same inset box, 16 to the content below. | §9.5 |
| Inline primary (typing screens) | **16 below the last line above it** (helper, consent), or 8 under a result notice. Kept visible above the keyboard by scrolling, 16 clear (F-05, built). | §8.4, §8.9 |
| Pinned bar | Padding 16 plus the safe area. Buttons 56/18, primary → quiet, 8 apart. **Bar notice:** full-width band, centred, 16 above its button. **Caption line** (e.g. "Available until 7:45 PM"): L3 centred, **8 above its button** (newly written down). The content scrolls; ≥ 16 clear at the end. | `.tm-actionbar`, A-19, D-86 |
| Hero tile | 64 tile, radius lg, brand-subtle, 32 glyph, centred, at panel top + 32, then 16 to the next block. The same on the offer and unlock. | D-61 |
| Points / card rows | Neutral 24 icon · 12 · title **16/24 semibold** · line 14/20 grey · 16 between points. Card rows: padding 16, with a hairline between rows. Value rows: label 16/24 regular, value L9. | §8.11, L9, v3 |
| Links | Brand colour. Semibold when the link is the line's action (Change, Resend code, Sign up). Regular inside legal text. A 48 hit area unless the link is inside a sentence. Visible focus. **Sign up is a real link with a 48 hit area.** | §8.6 |
| Fine print | L4 12/16 only for the OTP legal consent; its Terms / Privacy links are the inline exception. Nothing else the doctor reads or taps is under 14. | §8.1 |
| Sheet | Header: title 20/28 + ✕ 48, **subtitle 8 under the title inside the header**. Header → content 16; content → actions 24; actions 8 apart; 24 + safe area at the bottom. **A result notice sits inside the pinned actions, 16 above its button**, left-aligned. | §9.4 (subtitle: needs Apurva) |
| Duration picker | One block on setup and in the add-time sheet: "Quick picks" (6 chips, 3 columns, 8/8) → 32 → "Custom" → column heads 4 → wheel of 3 × 48 rows. "Minimum 15 minutes" shows on setup only (D-40). | D-40, v3 |
| Type | Four levels + L9. One weight per role: 16/24 emphasis is always semibold (600); medium is not used below the band. | §8.1 |
| Vocabulary | **OTP** for the SMS code everywhere outside the OTP screen; **code** only on the OTP screen. **Faster sign-in** for the feature. **Availability** for the window, **time** for its length, **case** for the work, **get** for new cases. | §5 below |

## 2 · Per-screen changes

**Tags:**
- **drift fix:** the same thing is done two ways and no decision is behind it.
- **industry gap:** good practice we lack and no decision says why.
- **needs Apurva:** changes approved copy, a central component or an approved behaviour.

| Screen | Change | Tag |
|---|---|---|
| **Sign-in** | Server notice → Send OTP **16 → 8** (field → notice stays 16) | drift fix |
| | Sign up as a real link with a 48 hit area (the reference uses a `span`) | drift fix |
| | Helper "We'll send you **an OTP** by SMS." · "Couldn't send **the OTP**." | needs Apurva (copy batch) |
| | Re-render the approved 360 pictures in a real 640 frame: the reference page is `min-height: 844`, so its keyboard and sign-up line sit below the fold. The clearance itself is proven in `keyboard-360.png`: the screen scrolls 15, and Send OTP sits 16 above the keyboard. | drift fix (picture) |
| **OTP** | Code → box notice **8 → 16** (offline, couldn't verify, resend failed, too many codes, locked, expired-and-limited) | drift fix |
| | Consent → Verify **32 → 16** | drift fix |
| | Locked / expired-and-limited notice → Verify **32 → 8** | drift fix |
| | "New code sent" → "New code sent." (app-logic already has the full stop) | drift fix (copy key) |
| | Hand-off note: check native SMS auto-fill on a device (Android SMS User Consent / Retriever, iOS one-time-code) | industry gap (kit note, no screen change) |
| **Faster sign-in offer** | Point titles medium → **semibold** | drift fix |
| | Point 1: "Sign in with one touch" (Face ID "with a glance", screen lock "with your PIN or pattern") / "No SMS to wait for." | needs Apurva (copy batch, optional) |
| | 360: the band fix lifts the panel by 40. Failed / offline still scroll by about 8 under the bar, with the bar's edge as the cue and 24 clear at the end. Passes. | no change |
| **Returning unlock** | Layout: no change | — |
| | Optional: open the phone's prompt once on arrival. The Unlock button stays for retry, and cancel = today's screen. | needs Apurva (optional) |
| **Home v3 setup** | Put "Minimum 15 minutes" back on the Custom row (D-40; v3 dropped it) | drift fix |
| **Home, remaining states** | Render near expiry, ending, ended (idle / manual / expired-pending), offline, failures, unknown-result and both sheets on the v3 body. Use 16 from a standing notice to the card. Follow Apurva's answers to home-blocks Q2–Q4. | drift fix (pictures) |
| **Add-time sheet** | Title "Add time" · the v3 picker ("Quick picks" / "Custom"; "Adjust duration" goes) | drift fix (label) + copy batch (title) |
| | **The error moves into the pinned actions, 16 above Add.** Today it is 40 away, and at 360 it sits *under* the pinned actions (y 552–598 vs 496), invisible on arrival. | **drift fix, blocker** |
| | 360: the content scrolls by 64. `.is-stuck` is set (hairline + upward shadow), but the edge falls on the wheel's selected row and reads faintly. Acceptable, since §8.14 is met. | no change |
| **Sheets** (add time, end availability, log out) | **Subtitle 8 under the title, inside the header.** Today it is ≈ 30 away and reads as the first content line. | needs Apurva (design-system component) |
| | End availability: "won't **receive**" → "won't **get**" | drift fix (copy batch) |
| **Profile** | No change (out of scope beyond the log-out sheet) | — |

**Out of the per-screen list (already settled or already asked):**
- v3 card labels at 16 regular override app-logic A-10 (14 grey). Approving v3 should amend A-10 in the same step.
- The keyboard on Sign-in and OTP at 360 is built (F-05, wheel-keyboard run) and evidenced here (`keyboard-360.png`, 8 / 8). It still needs Apurva's real-phone check, which is already queued.

## 3 · Where the reviewers still disagree
- **Settled during the rounds** (details in `claude-on-codex.md` and `codex-on-claude.md`):
  - Claude conceded the notice → button gap: 8 by §8.3, not 16.
  - Claude conceded that the unlock auto-prompt is not a gap.
  - Codex accepted the sheet subtitle at 8.
  - Codex accepted that Add time is still open (Q3).
  - Codex accepted the Sign-in 360 page quirk.
  - Codex dropped its six extra copy rewrites.
- **Settled in the final round** (`codex-final.md`):
  - Codex changed its mind on the offer's point 1. It goes in the optional copy batch, because D-47 means approval is needed, not that the copy can't be changed.
  - Codex agreed to tag the sheet subtitle "needs Apurva (design-system component)".
  - The copy batch stays exactly as listed.
- **Codex's one after-picture blocker was about evidence, not design:** the static 360 OTP / Sign-in pictures couldn't show the keyboard clearance. It is closed by `keyboard-360.png` (8 / 8 at 16 clear). Codex found no other blockers: the add-time error is visible above Add, and the faint `.is-stuck` edge is accepted.
- **No disagreement remains.** One difference in wording only: Codex calls the unlock change "an optional flow improvement". Claude first called it an industry gap. Both now present it as optional.

## 4 · Needs Apurva (yes / no)
1. **Copy batch** (each line optional; approved copy is changing):
   - Sign-in "We'll send you an OTP by SMS."
   - Sign-in "Couldn't send the OTP."
   - The add-time sheet title "Add time".
   - The end sheet "won't get new cases".
   - The offer's first point "Sign in with one touch / No SMS to wait for."

   OK?
2. **Sheets:** put a sheet's subtitle 8 under its title, as in the screen bands? (This is a design-system component change.)
3. **Unlock (optional):** open the fingerprint / Face ID prompt by itself when the app opens, keeping the Unlock button for a retry?

**Not asked again:** home-blocks Q2 (written vs confirmed), Q3 (Add time always vs near expiry) and Q4 (count on ended Home); band audit Q1–Q2.

## Run notes (unattended readings)
- **Home:**
  - "Using Home v3 for Home" was read as: v3 is the body for setup / available.
  - Every other Home state, the sheets and Profile were measured on the approved Home page (`ui-screens/home/home.html`) and judged as they would sit on v3.
  - The after pictures show those states on the approved body with the band spec and the agreed changes. Rendering them on the v3 body is listed as a change, not done here.
- **Profile:** captured only as the page the log-out sheet opens over.
- **Capture:** the band audit's method (installed Chrome, D-94 flags, fixed clock 2026-11-11 15:00, DPR 2, approved pages loaded read-only with `?capture=`). `tools/capture.py` extends its measure to every block below the band.
  - The gap figures are box-to-box. Text inside a taller box (the OTP resend line, card rows) shows a larger apparent gap; both reviews read those as anatomy.
- **Codex:** three runs, read-only, prompt through stdin, pictures attached with `-i`, each exit 0. The answers were copied from the logs into `codex-review.md`, `codex-on-claude.md` and `codex-final.md`.
  - Round 1 got the facts, research and rules, not Claude's review.
- **A correction to `claude-review.md` §2:** "the capture shows no hairline / shadow" was wrong. `.is-stuck` is set at 360 (`tools/probe_stuck.py`); the cue is just faint over the wheel band.
- **Pictures committed:** the measure and after sheets, `before-after.png` and the reviews. The 264 per-state captures in `shots/` and the reduced Codex copies in `codex-att/` can be regenerated with the tools and were not committed (lighter-evidence ruling).
