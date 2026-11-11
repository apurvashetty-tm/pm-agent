# Run 3 — Audit the rest of the app against the new rules (no fixes)

Folder: the project folder (project branch). Evidence: this folder. **Aim: 1–1.5 hours. Reports and pictures only — change no app, kit, PRD, decision-log or design-system file.**

**Gate:** start only if the last STATUS lines include `DONE r1-rules` and `DONE r2-build`; otherwise write `STOPPED r3-rest-audit: r1/r2 not done` and stop.

## Why
D-106–D-109 and the new `design-system/RULES.md` (visible-edge spacing, band spec, screen standard, sheet subtitle, inline link, vocabulary) were applied to the entry and Home screens only. Find what they mean for **every other screen**, so the next round is one agreed list instead of surprises.

## Screens
Case page (all states incl. calling, outcomes, closed), Prescribe (all states, medicine overlays), Rx viewer, Profile, every sheet and the calling-flow page — every state in the kit (`handoff/`), 360 × 640 and 390 × 844.

## Open the hidden parts first (Apurva, 13:31)
Some sections are collapsed by default and a default capture never shows them. Before measuring, **open each one** and capture it at both sizes: Prescribe's **duration picker** (the number + unit chips under "6 months" / Default), the **SOS** section (toggle on, its dose and max chips), "Every X hours" hours, "SOS only" max doses, Order details on the case page, every sheet. Use r2's per-screen regions so the sticky case header and Prescribe-over-case don't count as overlaps.

**Prescribe duration options (Apurva: "margins are non-existent"; "reduce the options, only till 12 or something"; fewer per line).** Today: numbers 1–7, 10, 14, 15 × Days / Weeks / Months, plus Ongoing. Both reviewers propose a reduced set (at most 12 number options, laid out on the 4-column numeric grid with 8 gaps, §9.2) with the clinical reasoning (what durations doctors actually write for 1 day–12 months; Ongoing stays), and render it. This is a **proposal for Apurva**, not a change.

## Do
1. **Measure** with run 1's visible-gap checker (`design-system/scripts/`) on every state; reuse r2-build's capture settings. Save the report and the gap pictures.
2. **Two independent reviews** — `claude-review.md` (you) and `codex-review.md` (Codex, read-only, prompt through stdin, the checker report + pictures attached with `-i`; not your review). Same checklist for both:
   - spacing by visible edges (8 / 16 / 32, anatomy listed in RULES);
   - type (four levels + L9; nothing the doctor acts on under 14);
   - components the same as on the entry / Home screens (buttons, bar, notices, links, sheets, cards, rows);
   - **vocabulary** per D-109 (OTP / code, faster sign-in, availability / time / case / get) — every string in `ui-screens/feedback/messages.json` used on these screens;
   - task headers (Back, compact header) consistent with each other — the band spec doesn't apply to them; say so where it doesn't;
   - anything D-106–D-109 changes indirectly (e.g. Rx row → Profile: does Profile show today's earnings clearly; Add time always on Home vs the case page's availability notices).
3. **Cross-critique** — Codex on yours, you on Codex's, point by point; one final Codex pass on what's still disputed.
4. `CONCLUSION.md`: per screen, each finding tagged *drift fix* / *needs Apurva* / *no change*, with the evidence (state, gap, px), sorted by how visible it is to a doctor; the short list of **needs Apurva** questions (yes/no); an estimate of the fix run's size.

## End
Append `DONE r3-rest-audit` (or `STOPPED …`) to `docs/runs/STATUS.md`, publish this folder and STATUS, stop.
