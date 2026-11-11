# Run r1-rules: report (2026-11-11)

**Scope:** release checklist 2, rows S1–S7 (shared rules plus the visible-gap checker).
- **Not touched:** app screens (`app/`), `ui-screens/` pages, the kit, the PRD and the decision log.
- **Commits:** two, published with `scripts/publish.sh`.
  1. `design-system/` on its own, for the later `shared/` PR.
  2. The project files (this folder, the L6 guard, STATUS).

## Rows

| # | Done | Evidence |
|---|---|---|
| S1 | ✅ | `design-system/RULES.md` §8.3 is rewritten as D-108. It covers: <br>• visible edges (text ink from cap height to descender, painted shapes, icons); <br>• tap areas and reserved lines add no space; <br>• 8 / 16 / 32 with tokens and what each joins or separates; <br>• notice placement (field 16 / 32, whole-screen, in-bar 16); <br>• component anatomy kept; <br>• the checker stops the build. <br>"Home-base screens use 3xl (48)" is removed. |
| S2 | ✅ | **L6** is now "Logo → title 16 (`--tm-space-lg`) on every screen with the logo (D-107; was 48, D-46)". **§8.13** now points to L6 = 16, measured from the safe area. <br>**`check-locked-specs.py`:** L6 is 16 for sign-in and Home, and a new `check_l6` covers OTP, offer and unlock. <br>**Guard run:** `check-locked-specs.log` has 31 failures, **all L6**: sign-in 12 states and Home 19 states, still at 48 today. OTP, offer and unlock pass at 16. Every other check passes. Run 2 (P1, P2, P7, U1) clears these. |
| S3 | ✅ | A new section, **"Entry and home screens"** (RULES §8, before the locked table): <br>• the band table (D-107) with a token per value; <br>• panel top 173; <br>• the copy check; <br>• variants 1–4 and "no other variant"; <br>• the screen standard below the band, with D-108 visible values (screens audit §1 box values replaced: notice → button 8 → 32, legal → Verify 8, inline primary 16 → 32, standing notice → 32, no "Minimum 15 minutes" per D-106); <br>• the words list (D-109). <br>§9.4's header row and §9.1 (`.tm-link`) are updated to match. |
| S4 | ✅ | **`components.css`:** new `.tm-sheet__heading`. It is a column with gap 8 (`--tm-space-sm`) inside `.tm-sheet__header`. The header switches to top alignment when it has a heading. The heading's top padding, (48 − 28) / 2, keeps the title line centred on the ✕ exactly where a title-only header puts it. <br>The old markup is unchanged. The preview's two sheets are moved to the new markup. <br>**Test:** subtitle top − title bottom = **8**, title centre = ✕ centre, same title position as a title-only sheet (`components-and-rules.test.mjs`). <br>**Sheets that use the subtitle today** (all have it in the body; moving them is run 2, P9): <br>• **App:** `app/screens/parts.js` `sheet()`, called by case leave (`case.js:333`), Prescribe discard (`prescribe.js:232`), add time (`home.js:178`), end availability (`home.js:186`) and log out (`home.js:191`). <br>• **References:** `ui-screens/case/case.html` (discard medicine changes, log out, mark unavailable) and `ui-screens/home/home-reference.js` (add time, end availability, log out). <br>• **Preview:** `design-system/src/preview.template.html` (leave case, Skip HA), already moved. |
| S5 | ✅ | **`components.css`:** new `.tm-link`. <br>• Brand colour, semibold, works on `<a>` and `<button>`. <br>• A centred `::after` gives a 48-tall hit area (`--tm-target-min`, min width 48) and adds **no** line height. <br>• 2px focus ring and a disabled style. <br>• `.tm-link--in-sentence` gives regular weight and no enlarged hit area, for legal text. <br>**Test, in a 14/20 line:** <br>• the line box stays 20, `::after` is 48; <br>• `elementFromPoint` hits at centre ±23 and misses at ±26; <br>• weight 600, focus outline solid. |
| S6 | ✅ | **The checker:** `design-system/scripts/check-visible-gaps.mjs` (Node + Playwright, the project's capture settings: installed Chrome, D-94 flags, DPR 2, clock 2026-11-11 15:00, animations off). <br>**What it measures as visible edges:** <br>• **text:** Range line rects trimmed to cap height and the font's descender line; <br>• **painted shapes:** background different from the parent, a border or a shadow, using the border box; <br>• **svg:** drawn shapes plus half the stroke; img / canvas / video use the content box. <br>**How it judges:** <br>• Units side by side form rows. Overlapping stacked blocks fail. <br>• Each gap goes through the **D-108 pair rules**, first match wins: anatomy (bar / sheet actions, sheet header, chips, stacked buttons), 8 joins, 16 within a group, 32 between things, the edge gap 32. If no rule matches, the fallback is any of 8 / 16 / 32. Tolerance is ±2. <br>• A project maps its local classes onto the roles in its config. A missing region fails. <br>**Output:** `visible-gaps.json` plus one picture per page and size, with the gaps drawn (green pass, red "px ≠ expected"). Exit 1 on failure. <br>**Tests:** Codex wrote the 5 required cases first (`tests/visible-gaps.test.mjs`, unedited). I added 5 for the pair rules, the fix pass, S4 and S5 (`tests/components-and-rules.test.mjs`). `node --test design-system/scripts/tests/` gives **10 / 10 pass**. |
| S7 | ✅ | `design-system/beyond-salt.md`: <br>• a new "Added 2026-11-11" table with the sheet heading (S4), the inline link (S5) and the checker; <br>• the L6 line is corrected to 16; <br>• "last updated" is changed. <br>**Token guard:** `check_tokens.py` passes after every CSS change. There is one new `raw-ok` (50 % centring of the hit area, the same reason the band audit accepted). |

## Dry run: the checker on today's approved screens

- **Command:** `node ../../design-system/scripts/check-visible-gaps.mjs --config docs/renders/2026-11-11-r1-rules/dry-run.config.json --out docs/renders/2026-11-11-r1-rules/dry-run`.
- **Screens:** sign-in (default, couldn't send), OTP (default, wrong code, locked, expired-and-limited), offer (fingerprint, enable failed), unlock (fingerprint, unavailable) and Home v3 (setup, available).
- **Sizes:** 390 × 844 and 360 × 640, 24 captures in all.
- **Result:** 50 failing gaps, 25 at each size. **360 gives the same numbers as 390.**
- **Files:**
  - `dry-run/visible-gaps.json`;
  - the pictures `dry-run/<screen>_<size>.png`;
  - the full table for both sizes, `dry-run/table.md` (built by `tools/table.mjs`);
  - `dry-run/console.txt`.

**Against the brief's expectation:**
- **Fails where D-108 says the screen is wrong:**
  - sign-in helper → Send OTP 16.9 (expected 32);
  - sign-in error → Send OTP 16 (32);
  - OTP boxes → locked / expired notice 8 (16);
  - OTP boxes → Resend 63.6 (32);
  - Resend → legal 50 (32);
  - legal → Verify 33.3 (8);
  - offer hero → points 18 (32);
  - points 18.9 apart (16);
  - unlock tile → caption 22.1 (16).
- **Passes where D-108 says the screen is right:**
  - sign-in field → error 16;
  - OTP locked notice → Verify 32;
  - label → field 8.9;
  - the bar's notice → button 16, caption → button 8.9 and stacked buttons (box 8);
  - chips 8 / 8;
  - wheel heads 4;
  - unlock unavailable;
  - Home v3 available.

**The first dry run failed this check, and the checker was fixed, not the expectation.** A pure "is it 8, 16 or 32" check passed sign-in helper → Send OTP (16.9) and OTP boxes → locked notice (8), because both values are on the scale. D-108 is about *which* gap goes between *which* things, so the checker now applies role-based pair rules.

| Screen | Gap (above → below) | Visible px | Expected | Result | D-108 |
|---|---|---|---|---|---|
| sign-in/default | panel top → "Mobile number" | 37.6 | 32 | **FAIL** | consequence (see note 1) |
| sign-in/default | "Mobile number" → field | 8.9 | 8 | pass | label ↔ field 8 |
| sign-in/default | field → helper | 13.6 | 8 | **FAIL** | consequence (note 1) |
| sign-in/default | helper → Send OTP | 16.9 | 32 | **FAIL** | named: field + helper → 32 → Send OTP |
| sign-in/couldnt-send | panel top → "Mobile number" | 37.6 | 32 | **FAIL** | consequence (note 1) |
| sign-in/couldnt-send | "Mobile number" → field | 8.9 | 8 | pass | label ↔ field 8 |
| sign-in/couldnt-send | field → "Couldn't send…" | 16 | 16 | pass | named: error 16 under the field |
| sign-in/couldnt-send | "Couldn't send…" → Send OTP | 16 | 32 | **FAIL** | named: 32 above Send OTP |
| otp/default | panel top → boxes | 32 | 32 | pass | — |
| otp/default | boxes → "Didn't receive it? Resend" | 63.6 | 32 | **FAIL** | named: boxes (+ line) → 32 → Resend |
| otp/default | Resend → legal | 50 | 32 | **FAIL** | named: Resend → 32 → legal |
| otp/default | legal → Verify | 33.3 | 8 | **FAIL** | named: legal → 8 → Verify |
| otp/wrong-code | boxes → "Wrong code." | 13.6 | 8 | **FAIL** | consequence (note 1) |
| otp/wrong-code | "Wrong code." → Resend | 36.5 | 32 | **FAIL** | named: boxes (+ line) → 32 → Resend |
| otp/wrong-code | Resend → legal · legal → Verify | 50 · 33.3 | 32 · 8 | **FAIL** · **FAIL** | named |
| otp/locked | boxes → notice | 8 | 16 | **FAIL** | named: boxes → 16 → notice |
| otp/locked | notice → Verify | 32 | 32 | pass | named: notice → 32 → Verify |
| otp/expired-and-resend-limited | boxes → notice · notice → Verify | 8 · 32 | 16 · 32 | **FAIL** · pass | named |
| offer/fingerprint (and enable-failed) | hero tile → first point | 18 | 32 | **FAIL** | named: hero → 32 → points |
| offer/fingerprint (and enable-failed) | point title → its line (× 3) | 7.6 | 8 | pass | joins (8) |
| offer/fingerprint (and enable-failed) | point → next point (× 2) | 18.9 | 16 | **FAIL** | named: points 16 apart |
| offer/enable-failed | bar notice → Try again | 16 | 16 | pass | bar spec |
| offer, unlock, Home available | bar primary → quiet | 29.6 (box 8) | 8 box | pass | bar spec (anatomy) |
| unlock/fingerprint | tile → "Ready when you are" | 22.1 | 16 | **FAIL** | named: tile → 16 → caption |
| unlock/unavailable | panel top → notice | 32 | 32 | pass | — |
| home-v3/setup | panel top → "Quick picks" | 38.1 | 32 | **FAIL** | consequence (note 1) |
| home-v3/setup | "Quick picks" → chips | 10.5 | 8 | **FAIL** | consequence: group label 8 |
| home-v3/setup | chip row → chip row | 8 | 8 | pass | anatomy |
| home-v3/setup | chips → "Custom" | 38.1 | 32 | **FAIL** | consequence: 32 between groups |
| home-v3/setup | "Custom" → column heads | 16 | 8 | **FAIL** | consequence: group label 8 |
| home-v3/setup | heads → wheel | 21 (box 4) | 4 box | pass | anatomy |
| home-v3/setup | "Available until…" → Set availability | 8.9 | 8 | pass | bar caption 8 |
| home-v3/available | panel top → card | 32 | 32 | pass | — |

**Note 1 (for the main thread):** "consequence" rows are gaps D-108 doesn't name. They fail only because D-108 measures text by its ink. A 32 or 8 box gap above or below a 14/20 or 16/24 text line shows about 4–6 px more.
- **Where it happens:**
  - the panel top → first label;
  - field → helper (13.6 against 8);
  - the group label → chips;
  - chips → "Custom".
- **What I did:** I applied D-108 literally, so these fail.
- **What run 2 must decide:** either trim the half-leading in CSS (e.g. `text-box: trim-both cap alphabetic` or a margin offset per text style), or have the main thread rule some of them as anatomy. **The checker stops the build** (D-108), so T1 will fail on them until one of the two happens.

## Codex

1. **Tests first:** `codex-tests-prompt.txt` → `codex-tests.log`. It wrote the 5 required cases against a fixed API contract. They failed until the module existed and pass now. They are unedited.
2. **One review:** read-only, of the rules text and the checker against D-107 / D-108 (`codex-review-prompt.txt` → `codex-review.log`, final answer at the end). It found 4 blockers and 3 should-fixes. It confirmed:
   - the rule sections drop every replaced value;
   - the dry run's named passes and fails match D-108.

**One fix pass. Ruling on each point:**

| Codex point | Ruling | What changed |
|---|---|---|
| B: a sheet-actions notice was judged as an ordinary notice (32 instead of 16) | **Fixed** | The bar roles include `.tm-sheet__actions`. Ordinary notice and button roles exclude it. Tested. |
| B: no point → point rule (an on-scale 8 or 32 between points would pass) | **Fixed** | New `pointTitle` / `pointLine` roles: title → line 8, between points 16. Tested. |
| B: image bounds were not painted bounds | **Fixed** | SVG uses the drawn shapes only (skipping defs / clipPath / mask / symbol, hidden or unpainted parts) plus half the stroke. `<img>`, canvas and video use the content box. Not done: transparent pixels inside a bitmap (noted in the code). |
| S: a missing region passes silently | **Fixed** | It now fails (`rule: missing`) unless the region is marked `optional`. Tested. |
| S: overlapping stacked blocks get no gap check | **Fixed** | They are recorded as `rule: overlap`, which fails. Units side by side still form one row by design. Tested. |
| B: painted containers (cards) are not walked inside | **Not changed** | D-108 and RULES §8.3 keep component anatomy as its own spec, and card rows (padding 16, hairline) are anatomy, so the card is measured as one shape. A later rule could list containers to check inside. |
| S: shadow bounds, painted pseudo-elements | **Not changed** | The eye reads a card's edge at its border box, not where the blur fades out. Pseudo-element geometry isn't readable from the DOM. Listed as a limitation. |

**No second review:** none of the fixes left a blocker open (D-100: a second review only for blockers).

## Unattended readings (my choices, for the main thread to check)

1. **"Trimmed to cap height / descender"** is read as: top = baseline − cap height, bottom = baseline + the font's descender (measured on "gjpqy"). This is the same for every string, so a copy change can't move a gap. The baseline comes from the Range rect and the font's ascent / descent.
2. **D-108 says two things about a tile and its caption.** Its 8-list has "a picture tile ↔ its caption" (8), but its Applied list has "unlock tile → 16 → caption". I wrote both in RULES as D-108 states them. The checker uses **16** for the unlock tile → caption (the Applied value). **NEEDS-APURVA:** which one wins for unlock?
3. **The band (D-107) is box-measured.** Its values (logo → title 16, title → subtitle 8) are layout values, marked "box" in RULES. The visible-gap check runs **below the band only**, as D-108 says ("one screen standard below the band"). The sheet's title → subtitle 8 also follows the band, as a box value.
4. **Pinned bar and sheet actions keep their spec:** stacked buttons 8 (box), notice → button 16, caption → button 8. D-108 says "a notice inside the pinned bar keeps the bar's own spec". I read the same for the bar's buttons, because their visible gap (29.6) comes from the 56 button height.
5. **"Minimum 15 minutes"** is left out of the standard (D-106: "no range text and no 'Minimum 15 minutes'"). This overrides the screens audit's drift fix.
6. **L6 is now checked on all five logo screens.** The old guard checked sign-in and Home only. D-107 makes it "every screen with the logo".
7. **Playwright is not a design-system dependency.** The checker loads the first install it finds (`TM_PLAYWRIGHT`, the current folder, a project's `tests/` folder). The Python guard needed the installed Chrome (`tools/run_locked_specs.py` sets `CHROMIUM`). The Python Playwright browser download is missing on this machine.
8. **`build.py` rewrote the native token files.** The only change was the build date stamp (`Built 2026-11-11`). I set it back so the shared commit carries no noise.
9. **Session handoff:** not edited. Runs end with the STATUS line, and the main thread keeps the handoff (as in earlier runs).

## Needs Apurva / main thread
- **Note 1:** the "consequence" failures below the band (panel top → first text 37.6 / 38.1; field → helper 13.6; group label → control 10.5 / 16; chips → Custom 38.1). Should run 2 trim them in CSS, or are some of them ruled anatomy?
- **Reading 2:** for the unlock tile → caption, is it 16 (the Applied value) or 8 (the 8-list)?

## Files
- **design-system (commit 1):**
  - `RULES.md`
  - `src/components.css`, `truemeds.css`, `src/preview.template.html`, `preview.html` (rebuilt)
  - `beyond-salt.md`
  - `scripts/check-visible-gaps.mjs`
  - `scripts/tests/visible-gaps.test.mjs` (Codex), `scripts/tests/components-and-rules.test.mjs`
- **Project (commit 2):**
  - `ui-screens/feedback/check-locked-specs.py`
  - this folder: REPORT, prompts, logs, the dry-run config / json / table / pictures, `tools/`, `check-locked-specs.log`
  - `docs/runs/STATUS.md`
