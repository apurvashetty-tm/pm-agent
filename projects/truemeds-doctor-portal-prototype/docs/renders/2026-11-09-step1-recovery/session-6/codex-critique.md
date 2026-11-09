**Blocker — baseline evidence does not prove “same design.”**

- `session-6/picdiff.py:33–45` checks whole-row matches and broad colour bands, then accepts differences within numeric limits. It never verifies that changes occur only on edges. In read-only, in-memory probes, it classified both an added solid box and a whole-image fill change as **“same design.”** Consequently, `baseline-check.md`’s blanket clearance is unsupported. Add edge/flat-area verification and reliable local movement detection, then regenerate the report. **Checklist 2.1, 2.2; brief §6.3; D-94.**

**Should-fix — repeatability evidence omits D-93.**

- `session-6/baseline-report.py:28` says “All pictures captured twice,” but `repeat-check.json` contains **296 entries with no `offer_unavailable`**, while `new/` contains **298 pictures**. Repeat-capture D-93 at both widths and include those results; reconcile the report’s coverage. **Checklist 2.1; brief §6.1–2.** Counts verified directly from those artifacts.

**Nice-to-have:** none.

D-93’s concept comparison visually matches the revised bar placement. Its above-limit edge differences are explicitly disclosed, as §6a.3 requests. The preview reports **78 exact, 6 accepted, 0 failed** (`compare-preview/results.md`); this is recorded evidence, not an independently rerun browser check.

Reviewed Session 6 changes only. No files written. Step 5 remains for the main thread.