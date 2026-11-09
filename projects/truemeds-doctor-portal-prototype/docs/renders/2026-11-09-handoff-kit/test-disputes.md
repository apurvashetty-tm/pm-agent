# Test disputes — handoff kit (for the main thread)

Codex tests: `tests/codex/handoff/handoff.test.mjs` (CASES.md). Not edited. 9 of 10 pass; one disputed.

## H05 — "every non-token CSS declaration is flagged" (partly disputed)

**What the test wants:** a `raw: true` record for *every* declaration in the `<style>` block of
`ui-screens/sign-in/sign-in.html` (lines 9–61) whose value is not purely `var(--…)`, "including … layout, keyboard,
capture and review CSS; no implicit exemption" (CASES.md H05).

**What the kit does:**
- Flags every non-token value in the CSS the kit actually inspects — the built app's `app/screens/sign-in.css` and the
  design-system rules that apply (Chrome's matched rules, file + line): 73 records, each `raw: true` with `kind`
  (`size` / `colour` / `keyword` / `zero` / `copy`). Red in the viewer.
- Also flags every non-token value in the approved reference file's screen CSS (`#doctor-login-preview …` rules,
  including the drawn keyboard and the `@media` rule): 61 records under `rawValues.approvedReference`. Keywords and zeros
  are flagged too, as the test asks (broader than the brief's "raw px, hex, rgba", which is safe).
- **Does not** list the reference page's own scaffolding: lines 51–52 (`html, body`, `body`), 54–56 (`.review-controls …`,
  the state picker) and 57–60 (`html.capture …`, the capture mode). The test fails on line 51 (`margin: 0`).

**Why it contradicts the brief / proposal:**
- Brief, Hard rules: "The kit is for an outside team. No internal working notes in it: no render rules, git, Netlify,
  Codex, terminal briefs, review history …". The `html.capture` rules are how pictures are rendered, and
  `.review-controls` is our internal state picker — neither is part of the screen.
- Brief §2: "A value that isn't a token (raw px, hex, rgba) is **flagged** … Sign-in's CSS has a few; list each." The
  screen's CSS is what is flagged; the review page's frame is not Sign-in's CSS.
- Proposal §2.3 / §6: "Zero raw values unflagged" is about the screen the team builds.

**Ask:** accept the exemption for page scaffolding (`html`, `body`, `.review-controls*`, `html.capture*`), or rule that
those 9 lines be added to `rawValues.approvedReference` (a one-line change: drop the `SCAFFOLD` filter in
`scripts/build-handoff.mjs`).
