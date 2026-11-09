# Token pass (D-99) — Codex test disputes

Tests in `tests/codex/tokens/token-pass.test.mjs` that contradict the brief. Tests not edited (brief §0).
Result after the pass: **45 pass, 45 fail; all 45 failures are the three disputes below.**

## 1. Native token path has an extra `tokens` root (43 tests)
The test reads `native/tokens.json` at `tokens.<family>.<camelName>`, e.g. `json.tokens.size.iconSizeSm`.
- `native/tokens.json` has no `tokens` key at the top: `tokens` is the name of the TypeScript export
  (`export const tokens = {…}` in `tokens.ts`). The brief's "native `tokens.<group>.<name>`" means `tokens.ts`'s object.
- The brief says "same pattern" as D-98, whose tokens are `tokens.iconSize.sm`, `tokens.borderWidth.default`, … (in use
  by the hand-off kit and the D-98 Codex tests). The test's `size.iconSizeSm` / `layer.layerRaised` shape would rename
  every D-98 token.
- What the build writes (checked): `iconSize.xl` 32, `iconTile.size` 64, `target.min` 48, `thumb.size` 48,
  `controlHeight.lg` 56, `spinner.sizeLg` 18, `check.size` 18, `toggle.width/height/knob` 36/20/16, `borderWidth.thick` 2,
  `duration.fast/medium/spinner/pulse` 150/250/800/1200, `easing.standard/sheet`, `layer.raised…toast` 2/10/900/901/950/1000,
  `opacity.disabled` 50, `pressed.dim` 0.92, `layout.pageMax…textMax` 1280/720/420/240/640/300, `sheet.maxHeight` 85,
  `shadow.bar` (`boxShadow` + `ios` + `android`, "like the other shadows" per the brief; the test wants `offsetX`/`blur`/… fields).

## 2. `--tm-radius-full` value is `var(--tm-core-radius-full)` (1 test)
The brief marks it "(existing)". It is a SALT semantic token that points at the core scale (999px), like every SALT
semantic token. The test wants the literal `999px` on the semantic line. Changing SALT's alias chain is out of scope.

## 3. `transparent` counted as a raw colour (1 test, 10 lines)
The test's scanner flags `transparent` (e.g. `background: transparent` on quiet buttons, the spinner's open gap).
The brief's exception list doesn't name it because it isn't a raw value: it is "no colour", has no token in SALT, and
the guard the brief names (`check_tokens.py`) allows it as a base keyword, like `0`, `none` and `currentColor`.
Marking these lines `raw-ok` would put markers on values that are not raw.
