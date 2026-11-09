Session 4 is **not ready to pass**.

**Blockers**

- **Desktop event log can overflow the page.** [shell.css:90](app/shell/shell.css:90) removes the log’s height limit, while [panel.js:217](app/review/panel.js:217) retains up to 50 entries. Opening a populated log pushes the panel beyond the viewport. P5 tests a nearly empty log, so misses this. Bound or paginate the visible entries without adding a scrolling panel. **Checklist 2.3; Part A.2; RULES §7.**
- **Spinner masks can conceal real defects.** [compare-step1.mjs:148](tests/compare-step1.mjs:148) masks the union of built and reference spinner rectangles without checking that both spinners exist and occupy the same box. A missing or moved spinner can therefore pass. Assert matching presence and geometry before masking animation pixels. **Checklist 2.1–2.2; recovery brief “Busy states” and “Compare harness”.**

**Should-fix**

- **The required calling-transition audit table is missing.** [state-map.md:162](docs/state-map.md:162) lists transitions, but provides neither “matches / doubt” verdicts nor source lines. Generator comments explain selected corrections, not the required review of every transition. Add the evidence table before closing Session 4. **Checklist 1.3; Part A.5.**
- **Jump omits behaviour-only states despite naming them.** [boot.js:126](app/core/boot.js:126) supplies only `pictures` to the panel; [panel.js:74](app/review/panel.js:74) filters everything else out. States such as `offer.not-now` cannot be selected. P2 checks the label dictionary rather than actual dropdown coverage. Include the relevant `others` rows and test rendered options. **Plan B4; Part A.1; checklist 6.2.**
- **Drawer filtering becomes stale after resizing.** [panel.js:188](app/review/panel.js:188) applies viewport-dependent filtering only on screen transitions. Changing from desktop to phone width leaves unrelated sections visible; changing back can leave desktop controls hidden until navigation. Reapply filtering on breakpoint changes. **Checklist 2.4; Part A.4 / 5.11.**

**Nice-to-have**

- Replace the hard-coded “149” heading at [build-state-map.mjs:200](scripts/build-state-map.mjs:200) with `model.pictures.length`; [state-map.md:7](docs/state-map.md:7) currently contradicts its own count. **Checklist 1.1; Part A0.**

Read-only checks passed: state-map drift and all 94 single-field short-link round trips. The saved compare report records 42 states / 84 pictures with no failures; I inspected saved panel and compare images. I could not independently rerun browser checks because the sandbox rejected the local server. No files changed.