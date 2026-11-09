# Session 6 — response to Codex critique 1 (`codex-critique.md`)

| # | Point | Adopted? | What changed |
|---|---|---|---|
| B1 | `picdiff.py` never checks that changes are edge-only; an added box or a fill change could pass as "same design" | **Yes** | `picdiff.py` now also measures **flat-area changes**: pixels changed by more than 8/255 whose 3×3 neighbourhood is flat on both sides. A box, fill or colour change shows up there; smoothing never does. It also measures **moved tiles**: 32×32 tiles whose difference mostly goes away when the new picture is shifted by up to 4 px in x/y. "Same design" now needs 0 of each. `picdiff.py --selftest` proves an added solid box, a white → off-white fill change and a local 2-px move are each **DIFFERENT**. Baseline re-run: still 294 same design + 2 identical, every picture with 0 flat-area px and 0 moved tiles (`baseline-check.md` now shows both columns). D-93 concept check re-run: 0 flat-area px, 0 moved tiles. |
| S1 | repeatability evidence omits D-93 (296 entries, `new/` has 298) | **Yes** | `offer_unavailable` 390 / 360 captured three times with `d93/capture-d93.py` (same settings): identical each time; added to `repeat-check.json` (298 entries, all identical); report wording says how D-93 was captured. |

## Critique 2 (`codex-critique-2.md`, the one re-run the brief allows)

| # | Point | Adopted? | What changed |
|---|---|---|---|
| B1 | flat-area check needs both sides flat and ignores ≤ 8/255: a 20-px grey rule and a white → RGB(250,250,250) fill still pass | **Yes** | A pixel changed by more than **2/255** counts as smoothing only if **both** pictures have an edge within 1 px; anything else is a flat-area change (rule, box, fill, colour). Moved-content check reworked: changed pixels are grouped into connected regions (8-px cells) and each region is tested for a 2-D shift of up to 4 px, scored on its own changed pixels (the 32×32 tile version missed sparse moves). |
| S1 | `--selftest` prints but never fails; the box fixture exceeded the channel limit | **Yes** | `--selftest <png>` asserts each case and exits 1 on any failure. Fixtures: 6×6 box (−60), 20-px rule (−40) and white → 250 fill all stay inside the numeric limits and must be caught by `flatChangedPx`. A text block moved 2 px must be caught by a moved region or shifted rows, not only by the limits. Run on 7 pictures (sign-in, OTP, offer, unlock, Home, case, prescribe): all pass. |

Re-run with the tighter checks: baseline still **294 same design + 2 identical** (0 flat-area px, 0 moved regions on every picture); D-93 concept vs render still 0 / 0. Not re-reviewed by Codex (the brief allows one re-run); left for the main-thread review.
