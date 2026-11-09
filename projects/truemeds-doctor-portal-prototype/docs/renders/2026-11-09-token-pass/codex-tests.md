Created only:

- `tests/codex/tokens/CASES.md`
- `tests/codex/tokens/token-pass.test.mjs`

Scanner self-tests pass. The full suite currently fails against the pre-pass repository, as expected. Native path and shadow-format interpretations are documented in `CASES.md`.

Run: `node --test tests/codex/tokens/*.mjs`