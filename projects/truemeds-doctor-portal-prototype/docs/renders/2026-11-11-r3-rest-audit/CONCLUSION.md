# r3-rest-audit — conclusion (report only; nothing in app/, kit, PRD, decision log or design system changed)

**What was checked:** every other screen against D-106–D-109 and the new RULES (§8.3 visible gaps, "Entry and home screens", §9): case page (all states incl. calling, outcomes, closed), Prescribe (all states and medicine forms), Rx viewer, Profile, every sheet, and the calling-flow page. 86 states × 390 × 844 and 360 × 640 = **172 captures** with `design-system/scripts/check-visible-gaps.mjs` (r2's capture settings) → `visible-gaps/` (pictures + JSON + summary), grouped in `facts.md` (85 gap groups: **43 real**, 27 list-row anatomy, 15 checker artefacts).
**Hidden parts opened:** these states already exist in the kit with the parts open, and each was measured inside, with every card as its own region: duration picker (d-duration-picker), SOS on (d-sos-on), Every X hours (d-every-x-hours), SOS only max doses (d-sos-only), Order details (a-order-details), every sheet (c-callback ×4, c-skip-ha, d-disable-sheet, d-discard-sheet, a-leave-sheet, a-releasing, s7e-leave-sheet, s7d-unavailable-sheet). Regions per screen: compact header / content / bar; Prescribe edit header / body / bar; sheet / sheet actions; viewer header / body. The sticky case header and Prescribe-over-case therefore never count as overlaps.
**Reviews:** `claude-review.md` and `codex-review.md` (independent) → `claude-on-codex.md`, `codex-on-claude.md` → `codex-final.md`: **no disagreement left**; Codex withdrew 6 points, Claude conceded 3.

## 1. Findings by screen, most visible first

Tags: **drift fix** (rule clear, screen off) · **needs Apurva** · **no change**. px = visible gap, both widths unless noted.

### Prescribe
| # | Finding | Evidence | Tag |
|---|---|---|---|
| P1 | Duration picker: chips touch the field's left border (0 inset; B-09 pulls the grid 12 left), value → chips 12.9, numbers → units 8, Ongoing alone on a row | d-duration-picker; `duration/today_w*.png`, measure.json | **drift fix** (inset 12 = the value's edge, 16 / 16) + option set **needs Apurva** (§3) |
| P2 | SOS toggle → its helper 27.6 → **8** | d-default and 17 other Prescribe states | drift fix |
| P3 | Field → helper / error 13.6 → **8** ("Printed on the prescription.", "Use numbers only…") — same trim r2 gave sign-in | 20 states; d-error-other | drift fix (extend r2's helper trim app-wide) |
| P4 | Every X hours chips → "4 times a day, round the clock" 13.6 → **8** | d-every-x-hours | drift fix |
| P5 | Disabled notice → schedule card 16 → **32**; disabled header title → form 3.7 → **8** | d-disabled | drift fix |
| P6 | Field groups inside the schedule card 29.6 (How often → Dose / Every; dose → Max doses), SOS helper → its settings 24.9 → **32** | tablet, syrup, drops, inhaler, injection, cream, sos-on, sos-only | drift fix |
| P7 | Dose error 9.6 under the grid; edit header title → form 7.1; −0.4 beside Disable (artefact); toggle / Other inputs inside 48 targets | d-error-dose; all | no change |

### Case page (incl. calling, outcomes, closed)
| # | Finding | Evidence | Tag |
|---|---|---|---|
| C1 | Card title → its content: one value, **16** — today "End-of-call script" → script 14.5, "Medicines to prescribe" → rows 18.5 (24 with a two-line name), "Notes & symptoms" → first label 20 | ~60 states (a-*, s7*, t*, g*, e-*) | drift fix |
| C2 | Notes: Chief complaints field → "Doctor notes" 17.6 → **32** (two field groups) | 46 states | drift fix |
| C3 | Bar question "Are you still on the call?" → Still talking / Call ended 30.7 → **16**, as a centred bar notice | s7b-still-on-call | drift fix |
| C4 | Bar status "Checking for a Health Advisor…" → Skip HA 26.5 → **8** (caption) | g2-checking-ha | drift fix |
| C5 | Compact header: name → "54 · Male" 17.1 → **8** (meta → meta 6.5 is one block, keep) | every case state | drift fix (header component) |
| C6 | Back-blocked toast sits 8 above the bar with 24 side insets (`case.css:56`); §9.5: bar height + 16, page margins 16 | a-back-blocked | drift fix |
| C7 | Order details expanded: row → details 8 → **16** (rows in a group) | a-order-details | drift fix |
| C8 | Availability ended mid-case: only "Back to Home", no reason (Home now always offers Add time, D-106) | e-availability-ended | **needs Apurva** (Q3) |
| C9 | Status tags Prescribed / Pending / Disabled 12/600 — RULES §8.1 allows 12 for tags but asks ≥ 14 for status | all case states | **needs Apurva** (Q4) |
| C10 | Medicine list rows 0 / 12 (each row paints its hairline), row title → Qty / tag | 27 groups | no change (anatomy / artefact) |
| C11 | Toast weight 14/500 | a-back-blocked | no change (shared `.tm-toast`; the medium rule is entry/Home's) |

### Sheets
| # | Finding | Evidence | Tag |
|---|---|---|---|
| S1 | Header → content: **33.1** on sheets without a subtitle (Schedule callback, Disable, Mark unavailable, Skip HA) vs ~15–17 with one (Leave, Discard, Home's sheets) → **16 visible** on every sheet | c-callback*, d-disable-sheet, s7d-unavailable-sheet, c-skip-ha | drift fix (sheet header, central) |
| S2 | Callback: result notice ("Couldn't schedule the callback…") 24 under the slots in the content → inside the pinned actions, 16 above Confirm (§9.4 / §9.5, as Home's add-time in r2) | c-callback-failed, c-callback-refused | drift fix |
| S3 | Callback: Date chips → "Time" 21.6 → **32** | c-callback ×4 | drift fix |
| S4 | Callback: "Pick a date and a time." 13.6 → **8** | c-callback-error | drift fix |
| S5 | Callback busy button keeps "Confirm callback" + spinner; §9.1 busy labels end with "…" (proposed "Scheduling…") | callback busy | drift fix (wording: Q7) |
| S6 | Callback times on 3 columns (§9.2 says 4; "10:00 AM" doesn't fit 4 at 360) | c-callback | **needs Apurva** (Q6) |
| S7 | Subtitles in header (D-109) on Leave / Discard; "Select reason" is a body label | all sheets | no change |

### Profile
| # | Finding | Evidence | Tag |
|---|---|---|---|
| F1 | Home's "Prescriptions written today" row opens Profile (D-106), which shows earnings but not that count | home_profile* | **needs Apurva** (Q2) |
| F2 | Rows card → Log out 16, → "You can log out after this case is closed." 16 → **32** | home_profile, home_profile-case-open | drift fix |
| F3 | Earnings label → amount 7 → **4** (value label → value anatomy); goes away if F1 adopts Home's row anatomy | home_profile* | drift fix |
| F4 | Header (tinted task header, 20/28, Back), Faster sign-in row (48 row is the target) | — | no change |

### Rx viewer
| # | Finding | Evidence | Tag |
|---|---|---|---|
| R1 | Hint → paper 4.9 → **8** | a-rx-viewer | drift fix |
| R2 | Header title row → tools row 34.1 (not listed anatomy) | a-rx-viewer | **needs Apurva** (Q8) |

### Vocabulary (every string these screens use from messages.json; `facts.md` §4)
No OTP / code / faster sign-in / availability / case / get conflicts. Customer-order wording ("Order details", order ID, "track your order", "on this order", "Counselled in an earlier order") is approved (RULINGS 2026-11-10, H23). "Request next case" / "Skip HA" are locked labels. Optional: "Your time is kept." → "Your chosen time is kept." (Q7). **No change** otherwise.

### Task headers
Case (compact), Profile (tinted task), Prescribe (edit), Rx (viewer) each follow their RULES §8.5 type; **the band spec applies to none of them** (worth one line in RULES). Gaps: C5, R2.

### Calling-flow page
Internal desktop reference diagram, not a doctor screen: mobile §8 rules don't apply; no fix work. Scope line: Q9.

## 2. Needs Apurva (yes / no)
1. **Duration options:** unit first, then the numbers for that unit — Days 1 2 3 5 / 7 10 14 15 · Weeks 1 2 3 4 / 6 8 · Months 1 2 3 6 / 12 · Ongoing (6 months) unchanged (`duration/duration-proposal_w360.png`)? (Codex's alternative adds Weeks 12 and Months 4, 9.) When the unit changes, keep the number if the new unit has it, otherwise clear it?
2. **Profile:** add "Prescriptions written today" to Profile (Home's row anatomy) so Home's row lands on its own number?
3. **Closed case after availability ended:** add "Your availability has ended." as a bar caption above Back to Home?
4. **Status tags:** keep 12 as tag anatomy (yes) or raise to 14 (no)? (Codex recommends 14.)
5. ~~Order details 8 vs 16~~ — settled: 16 (drift fix C7).
6. **Callback times:** keep 3 columns as listed anatomy?
7. **Callback copy:** busy "Scheduling…" and "Your chosen time is kept."?
8. **Rx viewer header:** list its two rows as anatomy with the tools row 8 below the title (yes), or keep today's 34 (no)?
9. **Calling-flow page:** record "internal desktop diagram: RULES §4 applies, not §8"?

## 3. Duration proposal (Prescribe) — for Q1
Apurva: "margins are non-existent"; "reduce the options, only till 12 or something"; fewer per line. Today 10 numbers (1–7, 10, 14, 15) in 3 rows + Days / Weeks / Months / Ongoing, chips flush on the field's left border. Proposal P1 (both reviewers): unit chips first (word chips, wrap), then **at most 8 numbers for that unit on the 4-column grid, 8 gaps**; 12 distinct numbers in total. Reasoning (both reviewers; Codex notes these are product proposals, not measured prescribing frequency): days cover acute courses (3 / 5 / 7 antibiotics and analgesics, 10 / 14 longer courses, 15 for PPIs, vitamins and "review in 15 days", 1 / 2 single-dose cover); weeks cover tapers and 6–8-week courses; months cover chronic refills (1 / 2 / 3), today's 6-month default and an annual 12. Rendered with the inset and gap fixes: `duration/p1-days|weeks|months_w360|w390.png`, today vs proposals side by side in `duration/duration-proposal_w360.png` / `_w390.png`. P2 (one fixed list of 8) was rejected by both: it loses 6 months, the default.

## 4. Size of the fix run
- **Drift fixes: 24** (P1–P6, C1–C7, S1–S5, F2–F3, R1), plus whatever Q1–Q9 add.
- **Mostly CSS, few files:** central — helper trim app-wide (r2's half-leading trim), sheet header → content 16, compact header title → meta 8; project — `prescribe.css` (P1–P6), `case.css` (C1–C4, C6, C7), `home.css` Profile (F2, F3), Rx viewer CSS (R1); JS / copy — `callback-sheet.js` (S2 notice into actions, S5 busy label) + `messages.json` (1–2 new strings), `prescribe.js` only if Q1 is yes (unit-first sets).
- **Pictures:** almost every case / Prescribe / sheet state moves (C1, C2, C5, S1 touch nearly all of them), so ~86 states × 2 re-renders, compare, kit `--check`, locked specs, run-checks, and the visible-gap checker as a gate on these screens (config: `tools/audit.mjs`, with the list-row and artefact rules from `tools/summarise.mjs` moved into the checker config).
- **Estimate:** one terminal run of about **2–2.5 hours** (≈ 1 h build, ≈ 1 h re-render + checks, review), about the size of r2-build. Q1 (duration) adds ~30 min if approved.

## 5. Notes for the main thread
- Measurement method (`tools/`): `audit.mjs` (regions, the inside of cards, tall pictures), `summarise.mjs` (grouping, anatomy / artefact tags), `duration-proposal.mjs` (proposal render; swaps chips in the capture page only), `codex.sh`. Two findings about measuring itself: Prescribe's body sits in an `overflow: hidden` ancestor, so below-the-fold content is clipped from the real-viewport measurement (the record is the union with a tall same-width layout; scrolling itself works); and the shared checker's "cards stacked 16" pair matches every pair inside a card, so it must be off when a card is measured as its own region. Both belong in the checker before it gates these screens.
- The calling-flow page was not measured (desktop diagram).
- Not measured inside: bordered boxes nested in a card (the SOS settings panel on d-sos-on, the closed duration field) — measured as one shape each; by eye the SOS panel's Dose → chips → "Max extra doses a day" read 8 / 16, consistent with the rest. Pictures are saved at 1× (downscaled from the 2× captures) to keep the commit small (12 MB in all).
- Unattended-run readings: the "hidden parts" all exist as kit states, so they were measured from those states instead of being opened by script; "every sheet" = the 11 sheet states in the kit; the calling-flow page is reviewed (wording, scope), not measured.
