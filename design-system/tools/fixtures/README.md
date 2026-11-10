# Token linter fixtures (D-100)

Proof that `design-system/scripts/check_tokens.py` does what the rule says. Run from the repo root:

```sh
python3 design-system/scripts/check_tokens.py design-system/tools/fixtures/must-fail.css   # exit 1, one finding per rule (10; f10 = a raw value inside a comma list, D-99)
python3 design-system/scripts/check_tokens.py design-system/tools/fixtures/must-pass.css   # exit 0, no output
```

These files sit outside the default scan scope (`design-system/src/components.css`, `projects/*/app/screens/*.css`).
