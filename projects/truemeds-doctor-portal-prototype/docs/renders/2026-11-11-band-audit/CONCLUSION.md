# Band audit: conclusion (Claude + Codex, 2026-11-11)

**Scope kept:** pictures and reports only. No app, kit, PRD, decision-log or design-system file was changed. The "after" pictures are produced by injecting `after.css` and `after-titles.json` into the approved pages at capture time.

**At a glance:**
- **Before:** `bands.png`, which mixes three band heights: 173, 201–213 and 245.
- **After:** `after.png`, where every band ends at 173.
- **Evidence:** all 62 in-scope states plus Home v3's 2 screens, each at 390×844 and 360×640, which is **128 captures**:
  - `measure.json` (before) and `after-measure.json` (after: **128 / 128 on spec**).
  - `otp-target-check.json`.
  - Reviews in order: `claude-review.md`, `codex-review.md`, `codex-on-claude.md`, `claude-on-codex.md`, `codex-final.md`.

## 1 · The one band spec

| Part | Value | Token |
|---|---|---|
| Band surface | full-width light blue | `--tm-surface-brand-subtle` |
| Band padding | top 16 (from the **safe area**, D-101 o07) · sides 16 · bottom 32 | `--tm-space-lg` · `--tm-space-page` · `--tm-space-2xl` |
| Logo lockup | 166 wide (≈ 41 tall), left | §8.13 / A-07, the documented exception; no new token |
| Header row | the logo's height; nothing in it may add height | — |
| **Logo → title** | **16** | `--tm-space-lg` |
| Title | L1 32/40 semibold, primary, balanced (L8) | `.tm-text-title-lg`, `--tm-content-primary` |
| Title → subtitle | 8 | `--tm-space-sm` |
| Subtitle | L3 14/20, secondary; natural **20** line box (nothing inside may grow it) | `.tm-text-body-md`, `--tm-content-secondary` |
| Subtitle → panel | 32 | `--tm-space-2xl` |
| Panel | top corners 24, top padding 32, sides 16, white | `--tm-radius-2xl` · `--tm-space-2xl` · `--tm-space-page` · `--tm-surface-primary` |
| Default result | panel top **173** on every screen at both sizes: 20.5 % of 844, 27 % of 640 | derived, **not hard-coded**: the band is content flow |

**Copy check, not a rendering rule:**
- Every fixed title and subtitle fits **one line at 360 wide**: title text ≤ 328 px at 32/40, subtitle ≤ 328 px at 14/20.
- Never `nowrap` or clip. Enlarged text and long content wrap naturally (WCAG 1.4.4).

**Allowed variants, each with its reason:**
1. **Home header actions** (bell · help · profile): 48 targets with the B-07 overhang, last glyph 16 from the edge. They never add height. This is the doctor's signed-in hub (D-42).
2. **A title carrying a name may wrap to two balanced lines** ("Hello, Dr. Raghavendra" is 351 px), never truncated or shrunk. The band grows by 40. The name isn't ours to shorten.
3. **OTP subtitle emphasis:** number in primary medium, "Change" in brand semibold (D-44). "Change" is a plain inline link with a **48-tall hit area from a centred `::after`**. Verified: hit at centre ±23, not at ±26; line box 20; 2 px focus outline. OTP has no Back (D-61), so this link is the way to fix a wrong number.
4. **State and device wording** (offer fingerprint / Face ID / screen lock; Home setup / available / ending / ended): the meaning varies, the spacing doesn't.
5. **No other variant.** Notices, busy buttons and keyboards stay in the panel, so the band never changes with state. (This was already true; it was checked on every state.)

**Rule changes this needs** (L6 is locked, so they need Apurva):
- **L6 / D-46:** "Sign-in logo-to-title 48" becomes "logo → title 16 on every screen with the logo".
- **RULES §8.3:** remove "Home-base screens use 3xl (48) as the hero gap".
- **RULES §8.13:** update its reference to L6.
- The Home v3 working assumption "Sign-in keeps 48" goes.
- D-81 F8 then holds on every screen at both sizes.

## 2 · Per screen

| Screen | What changes to meet the spec |
|---|---|
| Sign-in (12 states) | Logo → title **48 → 16**. Drop the subtitle's `31ch` cap. Panel top 205 → 173. |
| OTP (17 states) | "Change" becomes an inline link with an `::after` 48 hit area (variant 3). Subtitle box **48 → 20**. Panel top 201 → 173. |
| Faster sign-in offer (7 states) | Title **"Skip OTPs next time"**. At 360 the panel top goes 213 → 173, so the fingerprint tile lines up with unlock again (F8). 390: no geometry change. |
| Returning unlock (7 states) | **No change.** Variant 2 covers long names. |
| Home, approved (19 states) | Becomes Home v3: logo → title **48 → 16**, one-line titles (§3). Panel top 245 / 205 → 173. Stop-pending no longer jumps. |
| Home v3 setup | **No change.** |
| Home v3 available | Copy only (§3). No geometry change. |
| Profile, case page, Prescribe, sheets | **Out of scope; no need to match.** Profile and the case page have compact task headers, Prescribe has the edit header with ✕, and sheets use the sheet template. None has a logo row. |

Build note (not a picture change): today the five screens build the band five different ways. One shared band block in the rebuild prevents this drift from coming back.

## 3 · Titles and subtitles (all one line at 390 and 360)

| Screen / states | Title (px) | Subtitle |
|---|---|---|
| Sign-in | Welcome, Doctor (273) | Your partner in thoughtful, affordable care. |
| OTP | Verify your number (290) | Sent to +91 98765 43210 · Change |
| Faster sign-in offer | **Skip OTPs next time** (303; was "Skip the OTP next time", 345, two lines at 360) | Use your fingerprint instead of waiting for an OTP. · Use Face ID instead of waiting for an OTP. · Use your screen lock instead of an OTP. (unchanged) |
| Returning unlock | Hello, Dr. {name} (Kunal 232; variant 2) | Let's check in on your patients today. |
| Home setup: setup-wheel, setting, setup-failed, idle-expired, manually-ended | Start taking cases (275) | You can add time or stop anytime. |
| Home available: active, requesting, no-cases, request-failed, offline, near-expiry, add-wheel, adding, add-failed, added, end-confirmation, unknown-result | **You can take cases** (289) | **Request a case now, or whenever you're ready.** (306) |
| Home stop-pending | Ending availability (276) | You won't get new cases. |
| Home expired-pending | **Availability ended** (273; was "Your availability has ended", two lines) | You won't get new cases. |

**How the titles read as a story:**
- **Sign-in → OTP → offer → Home:** Welcome, Doctor → Verify your number → Skip OTPs next time → Start taking cases. Greet, prove it's you, make it faster, start work.
- **Unlock → Home:** Hello, Dr. Kunal → Start taking cases (or You can take cases, if he is still available).
- **Setup → available:** Start taking cases → **You can take cases**. This is Apurva's story. "You can take cases now" is 362 px and wraps even at 390, so "now" moves to the subtitle's first words.
  - Rejected: "You're taking cases" (reads as if a case is already under way) and "Taking cases now" (drops his "You can").
- **Available → ending → ended:** You can take cases → Ending availability → Availability ended. This matches the buttons (Set / End availability).

## 4 · Where the reviewers still disagree
- **Wording only, same remedy:**
  - Codex calls the approved Home two-line titles "approved copy, not drift".
  - Claude calls the band-height effect drift.
  - Agreed reading: *approved copy with an unwanted height consequence*. No product decision is needed.
- **Everything else is settled.**
  - Codex accepted the `::after` hit area after the measured check. The overlap reaches only the non-interactive title.
  - Claude accepted the following from Codex: the Home state mapping, the D-101 safe area, the `31ch` cap removal, the F8 reason for the offer title, the text-enlargement rule and the full rule chain.
  - Before implementation sign-off, check the OTP target once with enlarged text.

## 5 · Needs Apurva
1. **Sign-in: logo → title 48 → 16, so every band is the same?** This unlocks L6. Both reviewers recommend yes.
2. **Copy, as shown in `after.png`:**
   - "Skip OTPs next time"
   - "You can take cases" / "Request a case now, or whenever you're ready."
   - "Availability ended" (only on the ended-with-a-pending-request state)

   OK?

## Run notes (unattended readings)
- **Capture method:** `tools/capture-home-v3.py` is the Home v3 tool copied here. `tools/capture.py` extends it to every in-scope screen with the same Chrome flags, fixed clock and DPR 2, loading the approved pages read-only (`?capture=`). Profile states (`profile`, `profile-case-open`, `logout-confirm`) are task headers and were left out.
- **Home in the after picture:** today's approved Home pages get the spec and the v3 titles. The v3 body (cards, wheel) is shown only in the Home v3 columns.
- **Codex:** ran three times, read-only, prompt through stdin, pictures attached with `-i`, each exit 0. The answers were copied from the logs: `codex-review.log` → `codex-review.md`, `codex-on-claude.log` → `.md`, `codex-final.log` → `.md`.
- **Pictures committed:** `bands.png`, `after.png`, the 20 per-screen shots (7 of them attached to Codex) and the OTP target shot. The 256 per-state captures in `shots/all` and `shots/after` are regenerable with `tools/capture.py` and were not committed (lighter-evidence ruling).
- **Token guard:** `after.css` passes `check_tokens.py`. It has one `raw-ok` (50 % centring).
