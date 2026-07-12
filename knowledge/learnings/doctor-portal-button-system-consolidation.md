# Learning — Button/CTA System Consolidation

**Project:** Truemeds Doctor Portal Prototype
**Captured:** 2026-07-13
**Type:** Reusable engineering pattern (not company-specific — applies to any prototype in this workspace)

---

## The pattern

When the same CTA (button/action) gets restyled multiple times across a build session, each styling request tends to touch only the immediate button — a new ID, a new bespoke CSS block, maybe a `!important` to win a specificity fight. After 3+ rounds, the "same" CTA has quietly drifted into several different fonts, colors, and icons depending on where it's rendered, because there was never one place a cosmetic change would apply everywhere at once.

**Symptom to watch for:** a design review catches "this button doesn't match that other button" for an action that is conceptually the same thing (e.g. one "Schedule Callback" action rendered in three different visual styles across three screen states).

**Fix:** consolidate into a small, explicit button system before continuing feature work:

1. One base CSS class (`.btn`) with 2–4 size modifiers and a handful of variant modifiers (primary / ghost / text / danger / success, etc.) — this becomes the *only* place cosmetics are defined.
2. Every button in the markup uses `class="btn btn-{size} btn-{variant}"`. Per-element IDs are only allowed to carry **placement** (margin, width, visibility toggling) — never color, font, or border.
3. One icon registry (a JS map of name → SVG/markup), populated once at init, referenced by key everywhere. No inline SVG pasted per-component.
4. A short design-system reference doc (tokens table, variant table, "checklist before adding a new CTA") that a future session — or a future request in the same session — is expected to check *before* building a new button from scratch.

## Why this matters beyond one project

This isn't a Truemeds-specific fact — it's a generic consequence of iterative, request-by-request UI work in a single file (or even a well-organized multi-file frontend) without a component system. Any prototype in this workspace built the same way (fast iteration, no framework, direct DOM/CSS edits per request) will hit the same drift if nobody stops to consolidate.

**Signal to trigger this pattern in a future project:** a user says some version of "why does the same button look different in two places" or "shouldn't this come from one place so changes reflect everywhere." That's the exact trigger that produced this consolidation in the Doctor Portal prototype — treat it as a standing cue to stop and build the system rather than patching the one instance being complained about.

## What the consolidated version looks like in practice

See `projects/truemeds-doctor-portal-prototype/docs/design_system.md` for the actual implementation (token table, `.btn` size/variant matrix, `ICONS` map convention, "adding a new CTA" checklist). That file is the concrete template — copy its structure, not its specific color values, into any other project that needs the same discipline.

## Related

- `projects/truemeds-doctor-portal-prototype/docs/context/session_handoff.md` §1.1 — the specific consolidation that produced this learning
