Session 4 still has **one blocker and one should-fix**.

**Blocker**

- **An invisible spinner can still pass comparison.** [compare-step1.mjs:52](tests/compare-step1.mjs:52) treats a spinner with layout rectangles as visible; `visibility:hidden` or `opacity:0` preserves those rectangles. The geometry check at [line 150](tests/compare-step1.mjs:150) then passes and masks the missing drawing. Check computed visibility and opacity before masking. **Checklist 2.1–2.2; recovery brief “Busy states”.** The first-pass blocker is only partly resolved.

**Should-fix**

- **Behaviour-only jump options open placeholder cards.** [boot.js:126](app/core/boot.js:126) now includes them, but [screen-host.js:60](app/shell/screen-host.js:60) renders their raw IDs and “behaviour only” text, returning no journey. Selecting `offer.cancelled`, for example, neither shows the offer nor keeps its drawer controls. [P2b, line 277](tests/run-checks.mjs:277) checks option membership, not navigation results. Resolve Step 1 behaviour IDs to their corresponding screen/outcome and test selection. **Plan B4 and §5 Step 1; checklist 1.5 / 6.2; Part A.1.**

**Nice-to-have**

- None.

The other first-pass fixes are present: bounded event history with populated-log P5 coverage, breakpoint filtering with P8b coverage, the transition audit table, and the generated picture count.

Read-only validation: state-map drift check passed. The saved compare report records **42 states / 84 pictures, zero failures**; I inspected the saved desktop panel image. Browser checks and `layout_check.py --app` were **not independently rerun**: the sandbox rejected local-server binding (`EPERM`). No files changed.