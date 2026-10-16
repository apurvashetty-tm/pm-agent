# B · checklist results, round 16

Source: `guard-round-16.json` (check-locked-specs.py at 390, 360, 430) plus the 8.1 coverage check. Auto lines are machine-checked on every state. **Eye lines** (1.2, 1.5–1.6, 2.5, 2.8, 3.3, 3.8, 4.4, 4.8, 5.2, 5.7, 5.9, 5.10, 5.13, 5.14, 7.x, 7b.x, 8.3 guards only) are judged on the contact sheets and in `changes.md`; they are not marked here.

`pass` = no failure on that line at that width. `FAIL` lists the failing lines. 430 runs guards only (8.3).

| Phase · state | 390 | 360 | 430 |
|---|---|---|---|
| B · offer/fingerprint | pass | pass | pass |
| B · offer/face-id | pass | pass | pass |
| B · offer/enabling | pass | pass | pass |
| B · unlock/fingerprint | pass | pass | pass |
| B · unlock/face | pass | pass | pass |
| B · unlock/screen-lock | pass | pass | pass |
| B · unlock/pending | pass | pass | pass |
| B · unlock/cancelled | pass | pass | pass |
| B · unlock/platform-retry | pass | pass | pass |
| B · unlock/unavailable | pass | pass | pass |

