**Blocker — “same design” still accepts real design changes.**

- `session-6/picdiff.py:48–55,79`: the flat-area check requires both images to be flat and ignores changes ≤8/255. In-memory probes accepted an added 20-pixel grey rule on white and a whole-image white → RGB(250,250,250) fill change as **“same design.”** These are new content and a colour change, not smoothing. Verify differences against existing edges and detect coherent flat-fill changes, then regenerate `baseline-check.md`; its line 30 blanket clearance remains unsupported. **Checklist 2.1, 2.2; brief §6.3.**

**Should-fix — selftest prints results without asserting them.**

- `session-6/picdiff.py:83–90`: `--selftest` produces the expected four verdicts, but exits successfully regardless of those verdicts. The added-box fixture also exceeds the channel limit, so it does not isolate the new detection. Add assertions, nonzero failure status, and fixtures within the numeric limits, including the counterexamples above. **Checklist 2.1, 2.2; brief §6.3.**

**Nice-to-have:** none.

The previous D-93 coverage finding is resolved: `repeat-check.json` has **298 identical entries**, including both `offer_unavailable` widths, with keys exactly matching `new/`. This verifies artifact coverage; I did not independently repeat browser captures.

Reviewed `git diff HEAD` and `git log -3 --stat`. The retry loop is removed, and both capture paths wait for fonts and two frames. No files written; step 5 remains pending main-thread review.