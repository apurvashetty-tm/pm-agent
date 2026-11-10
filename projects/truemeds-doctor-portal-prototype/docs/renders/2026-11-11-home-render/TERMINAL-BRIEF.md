# Brief — Home render options + Codex critique of the renders (no build)

Folder: the project folder (project branch). Evidence: this folder. **Aim: about an hour.** Read `docs/runs/RULINGS.md`, then the **agreed** building blocks: `docs/proposals/2026-11-11-home-building-blocks.md` (the "Agreed 2026-11-11" box overrides the rest), `docs/renders/2026-11-11-home-blocks-review/REPORT.md` §3, `design-system/RULES.md` §8–9, `ui-screens/home/home.html` + `home-reference.css` / `.js` (today's approved Home reference). **Change no app, kit, PRD, decision-log or design-system file** — this run only makes pictures.

## 1 · Build the options as reference pages
- Make a copy of the Home reference in this folder (`home-options.html` + its CSS/JS), loading the real `design-system/truemeds.css`, icons, the approved "truemeds for doctors" logo and `ui-screens/feedback/messages.js`. Real components only (`tm-chip--lg`, the approved wheel, `tm-card`, `tm-actionbar`, `tm-btn--secondary` small for + Add time, `tm-value-display`); tokens only — run the token guard on your CSS. The band title 24/32 uses existing tokens; flag it in the report as the one planned rule change.
- **Approved copy stays** (titles, subtitles, buttons, notices from the messages registry). New copy only: "Availability duration", "15 minutes to 10 hours", "Quick picks", "Custom", "Prescriptions written today", "Up to 10 hours in total".
- **2 or 3 options**, each a complete, agreed-blocks design that differs in one clear way you choose and name (for example: card with a divider vs two separate rows; sub-labels shown vs only the section title; where the subtitle sits). Not variations of copy.

## 2 · Render
For every option: setup (a quick pick chosen), setup (custom value, no chip chosen), setting…, available, near expiry with + Add time, add-time sheet near the 10-hour cap, stop-pending (count row only), ended Home with count, offline (bar notice). At **390 × 844**, plus **360 × 640** for setup, available, offline and ended. Use the project's usual capture script. One contact sheet per option (`option-<x>.png`) and one side-by-side sheet of setup + available across options (`compare.png`).

## 3 · Self-audit, then Codex
- Self-audit each option against the agreed blocks and RULES §8 (spacing 8/16/32, type scale, 360 × 640 small-phone guard §8.14, bar never covers the last row, thumb reach, duplicates). Fix what fails before Codex sees it.
- **One Codex review of the renders** (read-only; run the prompt through stdin as the last run did): give Codex the sheets and the agreed blocks; ask which option is best and why, what is still wrong per option, and anything missed. Write `codex-prompt.txt`, log `codex-review.log`.

## End
Short `REPORT.md`: the options (one line each), self-audit results, Codex findings each marked agree / disagree / needs Apurva, and **your recommended option**. Append `DONE home-render` (or `STOPPED home-render: …`) to `docs/runs/STATUS.md`, publish this folder and STATUS with `bash ../../scripts/publish.sh -m "..." <files>`, stop.
