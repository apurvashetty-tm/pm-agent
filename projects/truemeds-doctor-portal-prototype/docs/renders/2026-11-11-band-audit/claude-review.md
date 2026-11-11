# Claude review — the blue band on every "logo + title + subtitle" screen (round 1, independent)

Written before reading Codex's review. Evidence: `measure.json` (128 captures: 62 states × 390×844 and 360×640, plus Home v3's 4 frames), `bands.png`, `text-widths.json`. Rules: RULES §8.1, §8.3 (incl. L6), §8.5, §8.6, §8.10, §8.13, §8.14; D-42, D-46, D-61, D-81 F8, Round 4 A-05 / A-07.

## 1 · What is already the same (no action)
Measured identical on every screen, every state, both sizes:
- **Logo:** 166 × 41, 16 from the top, 16 from the left (A-07, §8.13).
- **Title:** L1 32/40 semibold, primary colour, balanced, starting at the 16 margin.
- **Title → subtitle:** 8.
- **Subtitle:** L3 14/20 secondary grey.
- **Subtitle → panel:** 32 (A-05).
- **Panel:** radius 24, top padding 32, first content 32 below the panel edge.
- **Band colour:** `--tm-surface-brand-subtle`.
- **No state moves the band** on sign-in, OTP, the offer or unlock: notices, keyboards and busy buttons all stay in the panel. On Home, only the title length changes the band (stop-pending has a one-line title).

## 2 · Every difference

| # | Difference | Screens · measured | Verdict |
|---|---|---|---|
| D1 | **Logo → title gap** | Sign-in **48**, approved Home **48**. OTP, offer, unlock and Home v3: **16**. | **Deliberate rule, now out of date.** 48 is L6 / §8.3 "home-base hero gap" (D-46). It rested on D-42's split: home-base screens (sign-in, Home) had the logo, and task screens didn't. D-61 put the logo on OTP, offer and unlock too. D-81 F8 then gave those three 16, so they read as one header. Home v3 has now moved Home to 16 (agreed). **Sign-in is the only screen left at 48.** The split no longer separates two header types: all five bands have the same anatomy. |
| D2 | **Subtitle box height** | OTP **48**; every other screen **20**. The "Change" link is `inline-flex; min-height: 48`, which makes the whole line 48 tall. | **Drift.** It is a side effect of meeting §8.6 (48 targets), not a choice. The OTP band is 28 taller than offer and unlock (panel top 201 vs 173). §8.6 lets a link inside a sentence use the inline exception, but the 48 hit area is still worth keeping. It can be kept **without growing the line** (vertical padding on an inline link doesn't change the line box). |
| D3 | **Title on two lines** | Approved Home: "Consult on your schedule" (387 px), "You're available for consultations" and "Your availability has ended" (404 px) wrap at both sizes. Offer: "Skip the OTP next time" (344.5) wraps **at 360 only** (328 available). | **Drift (copy length).** L8 only says *how* a title wraps (balanced). Nothing chose 2-line bands. Home v3 already fixes setup and available. The ended titles and the offer title at 360 remain. |
| D4 | **Band height** (panel top) | At 390×844: 173 (offer, unlock, v3) · 201 (OTP) · 205 (sign-in) · 245 (approved Home). That is 20.5–29 % of the screen; at 360×640 it is 27–38 %. | **Result of D1–D3**, not a separate rule. With D1–D3 fixed, every band is 173: 20.5 % at 844 and 27 % at 640. |
| D5 | **Header icons** | Home and Home v3 only: bell, help and profile, 48 targets, last glyph 16 from the edge. The targets overhang 9 / 14 px, so the row stays at the logo's 41. | **Deliberate** (D-42 home-base actions, kept by D-61; B-07 overhang). The icons don't change any vertical number, so they are an allowed variant, not a different band. |
| D6 | **How each screen builds the band** | Five different implementations: sign-in uses `padding-top` on `.login-content` and a negative-margin panel; OTP collapses `logo margin 16` with `.head margin 8`; unlock uses `.head{margin-top:0}`; the offer uses `h1 margin 16`; Home uses `.band` padding. | **Drift (code, not pixels).** It renders the same, but it is why D1 and D2 crept in. The fix belongs in the build: one band block. It is not needed for these pictures. |
| D7 | Sign-in subtitle `max-width: 31ch` | Sign-in only | **Harmless today:** the subtitle is 280 px and fits on one line. Not needed once every subtitle is one line by rule. |

Home's other states (19) all match approved Home's numbers. Profile pages are task headers and were not measured.

## 3 · Proposed band spec (one, for all five screens)

| Part | Value | Token |
|---|---|---|
| Band surface | light blue, full width | `--tm-surface-brand-subtle` |
| Band padding | top 16 · sides 16 · bottom 32 | `--tm-space-lg` · `--tm-space-page` · `--tm-space-2xl` |
| Logo lockup | 166 wide (41 tall), left, 16 from the top | §8.13 (`raw-ok`, lockup rule) |
| Header row | the logo's height (41). Optional icon actions on the right (variant V1) | `--tm-target-min` targets, B-07 overhang |
| Logo → title | **16** | `--tm-space-lg` |
| Title | L1 32/40 semibold, primary, balanced; **one line at 360 for fixed copy** (text ≤ 328 px) | `.tm-text-title-lg` |
| Title → subtitle | 8 | `--tm-space-sm` |
| Subtitle | L3 14/20, secondary; **one line, box 20**; a link inside keeps a 48 hit area that doesn't grow the line | `--tm-font-size-body-md` / `--tm-font-lineheight-sm` / `--tm-content-secondary` |
| Subtitle → panel | 32 | `--tm-space-2xl` |
| Panel | top corners 24, top padding 32, sides 16 | `--tm-radius-2xl` · `--tm-space-2xl` · `--tm-space-page` |
| **Result** | panel top **173** on every screen, both sizes (20.5 % of 844, 27 % of 640) | — |

**Allowed variants:**
- **V1. Header icons (Home only).** They sit on the logo row and never add height, because Home is where the doctor needs notifications, help and profile (D-42).
- **V2. A title carrying a name may wrap to two balanced lines** ("Hello, Dr. Raghavendra" is 351 px, so it wraps at 360). The name's length isn't ours to control, and cutting it is worse. The band then grows by 40, which is the only allowed height change.
- **No other variant.** Busy, error and keyboard states stay in the panel; the band never changes with state.

**What this changes in the rules (needs Apurva, because L6 is locked):**
- L6 becomes **"logo → title 16 on every screen with the logo"**.
- §8.3's line "Home-base screens use 3xl (48) as the hero gap" goes.
- D-46 L6 and D-42's home-base / task split for the band are replaced. D-42 still decides *which* screens get Back and icon actions.

**Why 16, not 48, for everyone:**
- Four of the five screens (and the agreed Home v3) are already at 16.
- 48 costs 32 px on every phone. On sign-in at 360×640 with the keyboard open, that is space the field and Send OTP need.
- The logo already reads as a brand moment at 16 on OTP, unlock and the offer, which Apurva approved.

## 4 · Per screen

| Screen | Change to meet the spec |
|---|---|
| Sign-in | Logo → title 48 → **16**. Panel top 205 → 173. |
| OTP | "Change" keeps its 48 hit area as inline padding, so the subtitle box is 48 → **20**. Panel top 201 → 173. |
| Faster sign-in offer | At 360 the title wraps (2 lines, panel top 213). One-line title (§5), or accept as an exception. 390: no change. |
| Returning unlock | **No change** (V2 applies to long names). |
| Home (approved states) | Replaced by Home v3 for setup and available. Ended titles go to one line (§5). Logo → title 16 (already agreed in v3). |
| Home v3 setup | **No change.** |
| Home v3 available | Title "You're available" → **"You can take cases"** (§5), subtitle to match. Band numbers unchanged. |

## 5 · Titles and subtitles

| Screen | Title (px at 32/40; one line 390 / 360) | Subtitle (one line both) |
|---|---|---|
| Sign-in | Welcome, Doctor (273 · ✓ / ✓) | Your partner in thoughtful, affordable care. |
| OTP | Verify your number (290 · ✓ / ✓) | Sent to +91 98765 43210 · Change |
| Offer | **Skip OTPs next time** (303 · ✓ / ✓). Today "Skip the OTP next time" (345 · ✓ / ✗) | Use your fingerprint instead of waiting for an OTP. (unchanged; Face ID / screen-lock variants unchanged) |
| Unlock | Hello, Dr. {name} (231 for "Kunal" · V2 for long names) | Let's check in on your patients today. |
| Home v3 setup | Start taking cases (275 · ✓ / ✓) | You can add time or stop anytime. |
| Home v3 available | **You can take cases** (289 · ✓ / ✓) | **Request a case now, or whenever you're ready.** (306) |
| Home ending | Ending availability (276 · ✓ / ✓) | You won't get new cases. |
| Home ended | **Availability ended** (273 · ✓ / ✓). Today "Your availability has ended" (404 · 2 lines) | You won't get new cases. |

**Do the pairs read as a story?**
- **Sign-in → OTP → offer → Home:**
  - "Welcome, Doctor → Verify your number → Skip OTPs next time → Start taking cases" reads as one path: greet, prove it's you, make it faster, start work.
  - "Skip OTPs next time" keeps the meaning in 303 px. The plural is natural English for "stop getting codes". If Apurva prefers today's wording, the alternative is to allow the wrap at 360 only. That would be the only fixed title that breaks the one-line rule.
- **Unlock → Home:** "Hello, Dr. Kunal → Start taking cases" works. The greeting is the warm return and Home is the action.
- **Setup → available (his story):**
  - "Start taking cases → **You can take cases**" keeps his words. "now" moves to the subtitle's first clause ("Request a case **now**, or whenever you're ready"), so the meaning of "now" survives.
  - The subtitle also replaces "whenever you have a moment" without losing its "no pressure" tone.
  - Second choice: **"Taking cases now"** (267). It echoes D-36's state name and keeps "now" in the title, but it drops his "You can".
- **Available → ending → ended:**
  - "You can take cases → Ending availability → Availability ended" matches the buttons (Set availability / End availability).
  - "Availability ended" is one line and says the same as today's two-line title.

## 6 · Task headers (out of scope)
- Profile, the case page, Prescribe and sheets use task headers (Back / ✕ + 20/28 or hero title, no logo, D-42 / D-49 / D-61). They have no logo row, so the logo → title question doesn't arise, and they don't need to match this band.
- One shared point: their panels and cards already use the same 16 margin and 24 radius.

## 7 · Questions for Apurva
1. **Sign-in logo → title 48 → 16?** This unlocks L6, so the band is the same on every screen. I recommend yes.
2. **Offer title at 360:** "Skip OTPs next time" (one line everywhere), or keep "Skip the OTP next time" and allow it to wrap on small phones?
3. **Home available:** "You can take cases" + "Request a case now, or whenever you're ready."? And ended: "Availability ended" (one line)?
