# D-99 token pass acceptance cases

Sources: `docs/renders/2026-11-09-token-pass/TERMINAL-BRIEF.md` and
`docs/reviews/2026-11-09-design-system-token-audit.md` only. The brief wins where
its final table differs from the audit. These are post-pass checks; failures
before implementation are expected.

Run from any directory:

```sh
node --test tests/codex/tokens/*.mjs
```

| ID | Check | Method |
|---|---|---|
| T01 | Every final-table CSS token exists with its final value, including all grouped toggle/layout names and retained D-98 tokens | auto: one test per token; every declaration must match |
| T02 | Every corresponding native token exists beneath `tokens`, in its semantic family, with a camel-cased name and specified value | auto: one test per token |
| T03 | Components and built screen CSS have no unmarked raw sizes, colours, border widths, layering, opacity or durations | auto: independent scanner, diagnostics include file and line |
| T04 | A `raw-ok` comment must be on the same line and contain a nonempty reason | auto: scanner fixture tests |
| T05 | Only explicitly deprecated legacy `.tm-otp` rules and mock Rx paper selectors bypass scanning as blocks | auto: scanner; shell/review/reference files excluded by scan scope |
| T06 | Guard exists and succeeds against the working repository | auto: invoke Python from repository root |
| T07 | Guard works in an isolated copy before mutation, then fails on a planted component size and a planted screen opacity | auto: temp repository; remove after check; original files untouched |
| T08 | RULES §2 names sizes, borders, timing, layering, shadow and opacity | auto: section-scoped assertions |
| T09 | RULES §5 includes the specified native question and answer | auto: section-scoped assertion |

## Interpretation and limits

- CSS dimensional values use px, durations ms, disabled opacity 50%, and sheet
  maximum height 85vh. Native values are unitless numbers. The brief's opacity
  value is 50; tests deliberately do not silently change it to 0.5.
- The brief specifies `tokens.<group>.<name>` with camel casing but does not give
  literal native paths for every row. Tests use the table's family (`size`,
  `radius`, `duration`, `easing`, `layer`, `shadow`, `opacity`, `layout`), accepting
  a name with or without a repeated family prefix. Border widths belong to
  `size`, consistent with the retained D-98 border width described in §1.
  `sheetMaxHeight` also uses `size`. These path interpretations need review
  against the final exporter; the tests do not read its implementation.
- Native bar shadow must preserve x=0, y=-8, blur=24, spread=0 and the specified
  RGBA colour. Common semantic field spellings are accepted; arbitrary objects
  or a shadow with different geometry fail.
- Geometry, optical offsets, 31ch, hidden-input zoom prevention, media widths,
  reduced motion and drawn keyboard dimensions still need same-line `raw-ok`
  comments. The brief explicitly distinguishes these from unscanned files.
- A mock Rx paper exemption is recognized by selectors containing `mock-rx`,
  `mock-prescription` or `rx-paper`. The brief does not enumerate actual selector
  names; review additional exemptions rather than broadening all Rx selectors.
- Unitless zero, CSS grammar numbers (for example flex factors, font weights and
  keyframe stops), strings and token references are not raw design literals.
  CSS escapes, deeply nested functions and unusual named colours require human
  review; this dependency-free scanner is not a complete CSS parser.
- Pictures, semantic token use, native README, beyond-SALT documentation and
  build integration are outside this requested test scope. No visual claim is
  made by this suite.
