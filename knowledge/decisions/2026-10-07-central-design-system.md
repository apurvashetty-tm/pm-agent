# 2026-10-07 — One central Truemeds design system for all frontend work

**Decision:** Every frontend project in this workspace (prototypes, portals, internal
tools, mockups) uses one central design system at `design-system/`. Projects link it;
they never define their own colours, fonts or icons.

**Why:** The doctor portal prototype was functionally right but visually off-brand
(guessed colours, system font, emoji and multicolour icons) because it wrote its own
"design system" after the code. IRIS looked right because a visual reference was
locked before building. The fix is a shared, locked source applied before any UI work.

**Source of truth:** SALT — "TRUEMEDS Design Library (App)" in Figma. `design-system/`
is a code copy built from SALT's variable export (Core + Default tokens), plus shadows
and text styles copied from SALT's pages. Icons are Tabler outline (the set SALT uses).

**Choices made:**
- App tokens are the base for web too. truemeds.in uses the same font and most of the
  same colours but less strictly; there is no separate web library yet.
- Brand blue follows the token export (`#266CE1`). SALT's older variable set and
  truemeds.in use `#1B69DE`; the design team is aware.
- Portal/desktop needs not in SALT (page grid, side nav, data table, KPI tile) live in an
  internal-tools layer marked `[PROPOSED]`, built from SALT tokens only.
- Engineering's React Native repo was not reachable (404); the design system is built
  from Figma alone.

**How it's enforced:** `AGENTS.md` (workspace rule), the project scaffold
(`templates/project-scaffold/`), and the design review checklist in
`design-system/RULES.md` §5.
