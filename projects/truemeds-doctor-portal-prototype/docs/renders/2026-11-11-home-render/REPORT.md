# Home render options + Codex critique (2026-11-11)

Input: the agreed blocks (`docs/proposals/2026-11-11-home-building-blocks.md`, "Agreed 2026-11-11" box), blocks-review REPORT §3, RULES §8–9, the approved Home reference. **No app, kit, PRD, decision-log or design-system file was changed.** Pictures only.

**Files:** `home-options.html` / `.css` / `.js` (a copy of the Home reference: real `truemeds.css`, icons, the approved logo, `messages.js`; switch with `?option=a|b|c&state=…`) · `shots/` (93 pictures) · `option-a.png`, `option-b.png`, `option-c.png`, `compare.png` · `audit.json` (measurements) · `tools/capture.py`, `tools/sheets.py` · `codex-prompt.txt`, `codex-review.log`.

**Run notes (unattended):**
- Capture uses the d105 method (Playwright + installed Chrome, D-94 rasterisation flags, fixed clock, DPR 2). `CHROMIUM` env prefix was refused by the sandbox, so the script defaults to the installed Chrome path.
- Codex ran as last time, prompt through stdin, sheets attached with `-i`: `codex exec -i option-a.png -i option-b.png -i option-c.png -i compare.png -s read-only -C <this folder> - < codex-prompt.txt`. Exit 0, 60k tokens; the review is at the end of `codex-review.log`.
- **The one planned rule change:** the band title is **24/32** (`--tm-font-size-title-md` / `--tm-font-lineheight-xl`, existing tokens), and the logo→title gap is **32**. Both differ from RULES §8.1 (title 32/40) and L6 (48). This follows agreed block 1. The rule change goes to `main` on its own PR before the build.

## 1 · The options (one difference each)
- **A · One card, divider.** On Available, Time remaining and Prescriptions written today sit in one `tm-card`, split by a `tm-divider`. On Setup, the duration choice sits flat on the white panel.
- **B · Two separate cards.** As A, but each row is its own card, stacked 16 apart.
- **C · Setup in a card too.** As A, and the Setup duration choice is also in a card, so the panel always holds cards. On ended Home that gives two cards, 16 apart.

All three share the agreed blocks:
- band 32 / 24/32
- rows with a neutral icon, a 16/24 label and an L9 value (32/40 semibold, tabular digits) for both the timer and the count
- the count row on ended Home only when the count is above 0
- the 0–10 h wheel (10 h → minutes 0 only; 0 h → 15/30/45)
- the add wheel capped at what is left, with "Up to 10 hours in total"
- "+ Add time" only near expiry, in a reserved slot on the timer line
- "Availability duration" / "15 minutes to 10 hours" (8 apart) · "Quick picks" / "Custom" (14/20 secondary)
- stop-pending shows the count row only
- spinbutton wheel columns, toggle chips, and a timer with `aria-live="off"`

**States**, each option at 390 × 844 and 360 × 640:
- setup with a quick pick (1 hour) · setup custom (1 h 15, no chip) · Setting…
- available · near expiry + Add time · add sheet at the cap (5:00 left, wheel at its top 9 h 45)
- stop-pending · ended with count (manually ended) · offline
- boundaries: ended with 0 (idle-expired, no row) · wheel at 10 h · longest timer 9:59:59 (measured, not pictured)

## 2 · Self-audit (all 72 captures measured in `audit.json`, pictures checked by eye)
| Check | Result |
|---|---|
| Logo → title 32; title 24/32; balanced wrap | **Pass**: 32 in every capture. "You're available for consultations" wraps to 2 balanced lines; the setup title fits on 1. |
| Spacing 8 / 16 / 32 | **Pass**: hint 8 under the title, 16 between groups, 32 from the ended count card to "Availability duration" (16 between cards in B and C). One exception, kept: the wheel's own column-head gap of 4 (approved wheel anatomy, D-40). |
| Values L9 | **Pass**: every value display is 32px/40px 600 tabular-nums. |
| Targets ≥ 48 | **Pass**: no tappable item under 48 in any capture. |
| §8.14 360 × 640: bar never covers the last row; scroll cue | **Pass** in all 36 small captures (`barCoversLast` false; "scrolled to end" pictures in the sheets). The next item's edge shows at the bar: chips or wheel on setup, the count row offline. **Cost:** setup scrolls 89 px (A/B) or 121 px (C). Ended Home scrolls 307 px (A/B) or 323 px (C), so the wheel is two thumb-scrolls away. |
| Add time never collides with the timer | **Pass**: Add time only shows at ≤ 5:00. Gap at 360: 76 px. The longest timer 9:59:59 still clears the reserved (hidden) slot by 27 px at 360. |
| Duplicates | **Pass**: one message per cause. Bar notices (ending soon, offline) and top notices (stop-pending, ended) follow A-19. |
| Thumb reach | Primary and secondary actions are in the pinned bar (bottom third). Add time sits in the upper-middle of the screen at 390 (approved placement, A-09; the same as today). |
| Fixed before Codex | Token guard: 3 raw values were reference geometry copies; each got a `raw-ok` reason. Guard passes. |

## 3 · Codex findings (one review; one fix pass)
**Codex's pick: A.** "The timer and count form one compact group, while setup avoids an extra container. B adds height without adding information; C narrows the picker and increases scrolling."

| # | Codex point | Verdict | Action |
|---|---|---|---|
| 1 | Row icons didn't get the neutral grey: the CSS selector missed, because the icon was wrapped in a span. | **agree** (my bug) | **Fixed**: wrapper removed, icons now `--tm-content-secondary`. Everything re-captured. |
| 2 | Wheel column heads use a 4 px gap (off 8/16/32). | **disagree** | This is the approved wheel's internal anatomy (D-40, the same as the approved reference). Components keep their specs (§8.1). Not changed. |
| 3 | 360 × 640 missing for Setting…, near expiry, add sheet, stop-pending. | **agree** | **Fixed**: every state is now captured and measured at 360 × 640. All pass §8.14. |
| 4 | Show ended with 0 count (no row) and idle-expired. | **agree** | **Fixed**: `ended-zero` (idle-expired, no count row) added. |
| 5 | Show the wheel boundaries. | **agree** | **Fixed**: `setup-max` (10 h → minutes 0 only). The 0 h boundary is in the add sheet logic (minutes 15/30/45) and in the code. |
| 6 | Static pages don't prove arrow-key stepping, chip taps, sheet focus or thumb feel. | **agree, out of scope** | Render run only. The build run implements these on the real wheel (`app/screens/wheel.js` already does keys and swipe). Phone walkthrough for feel. |
| 7 | `audit.json` flags the sheet header's horizontal overflow. | **checked, no issue** | This is the ✕'s 48 px target stepping out 14 px by design (B-07). The same happens in the approved sheets. |
| 8 | Captions overlap on `compare.png`. | **agree** | **Fixed**: shorter captions. |

Per option, Codex found no further rule violations for A, B or C. B's extra height worsens small-phone offline scrolling, and C's card costs space. Both are trade-offs, not blockers.

## 4 · Found while rendering — needs Apurva
1. **"Add {n} minutes" at large values.** With the 10-hour cap, the add wheel goes up to 9 h 45, and the approved label then reads **"Add 585 minutes"** (see `*_add-cap_*`). This is approved copy, so I didn't change it. Suggestion: "Add 9 h 45 min", or the hours form from 60 up. **Needs Apurva** (copy key `home.addConfirm`).
2. **Add sheet at 360 × 640.** The sheet reaches its 85 % height cap. The wheel's selected row is below the pinned buttons until the doctor scrolls inside the sheet. This is allowed by §9.4 (content scrolls between the pinned header and actions), and the button label carries the value. **Needs Apurva:** OK, or drop "Quick picks" in the add sheet (one-tap chips matter less there)?
3. **Ended Home is long at 360 × 640** (307 px of scroll; the wheel is two scrolls down). This comes from agreed block 3 (count card + top notice + full setup). If it matters, the shortest fix is the count as a single line in the card instead of an L9 value. That would reopen block 2, so I left it as it is.
4. Wheel minutes show "0", not "00" (approved wheel). Block 4 says "minutes 00". I read that as the value, not the label. Say if you want "00".

## 5 · Recommendation
**Option A** (Codex agrees). One card makes time and count read as one status group, with the least height. Setup stays flat, so the wheel gets the most room and the least scroll on small phones (89 px against C's 121). B's second card adds a gap and a shadow that carry no meaning. C's setup card narrows the chips and wheel and adds scroll on every setup and ended screen. Next: Apurva picks the option and answers §4. Then the band rule change goes to `main` on its own PR, before the build run.
