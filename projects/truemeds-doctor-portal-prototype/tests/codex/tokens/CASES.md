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
| T01 | Every final-table CSS token exists with its final value, including all grouped toggle/layout names and retained D-98 tokens; a SALT semantic token may alias a core token (resolved one level, e.g. `--tm-radius-full` → `--tm-core-radius-full` = 999px) | auto: one test per token; every declaration must match |
| T02 | Every corresponding native token exists in `design-system/native/tokens.json` (no `tokens` root; `tokens` is the TypeScript export name) at `<group>.<name>` as in D-98 (e.g. `iconSize.sm`, `borderWidth.thick`, `spinner.sizeLg`, `layout.pageMax`), with the specified value | auto: one test per token |
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
- Native paths (ruled 2026-11-09, see below): `<group>.<name>` split from the CSS name the way D-98 did
  (`--tm-icon-size-sm` → `iconSize.sm`, `--tm-spinner-size-lg` → `spinner.sizeLg`); the test accepts any split
  point of the kebab name, plus the original family spellings. There is no `tokens` root in `tokens.json`.
- Native bar shadow has the same shape as the other native shadows: `boxShadow` (the CSS value) plus `ios` and
  `android`. An object with x / y / blur / spread fields is also accepted if it keeps x=0, y=-8, blur=24, spread=0
  and the specified RGBA colour.
- `transparent` is a keyword ("no colour"), not a raw colour, like `currentColor`, `none` and `0`.
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

## Rulings (main thread, 2026-11-09, after the token pass)

The first version of this suite failed 45 of 90 tests against a correct build (token-pass `test-disputes.md`).
Ruled in the build's favour and fixed in `token-pass.test.mjs`: (1) native paths follow D-98 and `tokens.json`
has no `tokens` root (43 tests); (2) a semantic token may alias a core token (1 test); (3) `transparent` is a
keyword (1 test). Result: **90 / 90 pass**. Record: `docs/runs/RULINGS.md` (2026-11-09 20:45).
