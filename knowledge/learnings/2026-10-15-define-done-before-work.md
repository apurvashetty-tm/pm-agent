# Define "done" before the work, not during the review

Date: 2026-10-15 · Source: Doctor Portal layout v2 (phases A–D) · [USER-PROVIDED] rule by Apurva

## What happened
The Doctor Portal screens went through roughly ten render-and-review rounds. Each round
found new issues, because the standard was being discovered during review: button roles,
sheet layout, toasts, tap sizes and missing states were not written down; one concept
invented content; an old shared stylesheet kept overriding fixes; reviewers judged by eye.

## What fixed it
Design-system rules written first (RULES §9) → a pass/fail checklist approved before
rendering → automatic checks on every screen → fix shared code first → compare with the
last approved finals → a clear finish line, after which new ideas go to a next-version list.

## The rule (applies to all work, not only design)
`AGENTS.md` → "Definition of done — all work". Template: `templates/definition-of-done.md`.

## DRAFT — to refine later (Apurva, 2026-10-15): balance rules and freedom
Not all-or-nothing. Rules grow as the work firms up; switch stages on purpose.
- **Explore** (find the idea): freedom; only always-on guardrails. Done when 2–3 real options are seen and a direction is picked.
- **Shape** (make the chosen idea whole): decisions recorded, details still move, checklist drafted from what was learned. Done when decisions + checklist are agreed.
- **Finish** (complete and correct): full checklist, no taste; new ideas go to a next-version list; frozen after approval.
- **Always on:** true facts, locked decisions, Truemeds terminology, accessibility, clinical safety.
- **Switch triggers:** Explore → Shape when Apurva picks a direction; Shape → Finish when other work starts depending on it or it gets expensive to change. Going back is allowed only as Apurva's explicit call.
- Open: refine the wording, examples per work type, and update `AGENTS.md` / `templates/definition-of-done.md` once agreed.

## Added 2026-10-16 — what still slipped, and the fixes
- **Automatic checks and AI reviewers passed screens that were wrong** (spilling labels, three stacked buttons, indented chips, stale renders). Checks measure sizes, not decisions. Fix: before "done", trace every decision to every screen it touches and look at each at full size (both widths) — never sign off from contact sheets.
- **Two rules can conflict** (one chip size per screen vs. grids start at their label). When a check fails against an approved design, look for a rule conflict before changing the design.
- **Sub-sessions must not record decisions** in the user's name; they report, the lead session records after the user agrees.
- **Git in a shared folder:** one `main`, each project in its own folder; publish only named files with `scripts/publish.sh`; a commit check refuses commits that touch two projects (see `AGENTS.md` → Git safety; changed 2026-10-16 from per-project branches, which left stale copies).
- **A prototype that grows by patching** stops being a safe base; extract the rules to a document, then rebuild from scratch.
