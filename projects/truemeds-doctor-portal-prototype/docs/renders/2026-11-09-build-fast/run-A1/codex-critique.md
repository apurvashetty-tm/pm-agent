**A1 has blockers.** Findings below exclude calling behaviour assigned to A2. Review was read-only; test status comes from the existing run-A1 logs, not a fresh browser run.

| Severity | File / line | Correctness gap | Spec |
|---|---|---|---|
| **Blocker** | `app/screens/home.js:88` | Opening `home_added` outside capture calls `v()` before its `const` initialization at line 93. This throws; the shell catches it and falls back to a picture, so the state is not interactive. The recorded smoke pass does not establish working content here. | Plan v3.2:56, B4: every state opens built content; brief: A1 states must work from `?s=`. |
| **Blocker** | `app/screens/home.js:266`, `:297` | Set availability and Add time always succeed. Neither checks offline nor provides a failed response path. Setup/add failure states are only fixtures; a failed operation cannot retain the selection and original deadline as required. Add time can also extend availability while offline. | `docs/feedback-state-map.md:113–114`, `:119`, `:122–124`; `ui-screens/app-logic.md:67`. |
| **Should-fix** | `app/screens/home.js:337` | Phone Back does not dismiss Home sheets. Home installs no sheet-aware Back handler; Profile installs `profileBack` even while Log out confirmation is open. Back therefore follows page history instead of closing Add time, End availability or Log out first. | Plan v3.2:65, B13: phone Back closes the top sheet first. |
| **Should-fix** | `app/screens/home.js:31`, `:92`; `app/screens/case.js:29`, `:96` | Direct offline fixtures remain permanently offline: `offlineFx || store…offline` cannot become false when the reviewer selects reconnect. The resulting request/call/release actions cannot recover without leaving the state. | `docs/feedback-state-map.md:119`; `ui-screens/app-logic.md:271`: preserve work and recover after reconnect. |
| **Should-fix** | `app/screens/prescribe.css:51`; `app/screens/case.css:69` | Action-bar visibility follows focused fields, rather than whether the phone keyboard is open. Dismissing the keyboard while leaving the field focused keeps the bar hidden. Field/helper clearance above the real keyboard is only explicitly implemented for capture fixtures. | `ui-screens/app-logic.md:257`: hide while keyboard is open, restore when it closes, reveal field with label/helper. |

**Steps 2–4 scenarios without a recorded passing test**

From `run-A1/codex-run-A-1.log` and the focused rerun logs:

- `A-C01` — Ready Back → Leave; Stay/Close preserve case.
- `A-P07` — Other accepts only positive decimal numbers.
- `A-OPTIONS-d-every-x-hours` — approved hour choices.
- At both widths: `S-*-a-loading`, `S-*-case.back-before-call`, `S-*-case.closed`, `S-*-case.closed-availability-ended`, `S-*-rx.load-failed`, `S-*-prescribe.dose-error`.

These are evidence gaps, not automatically app defects. In particular, `a-loading` fails the smoke test’s nonempty-text assertion despite the spec requiring a skeleton.

The supplemental checks referenced by `CASES.md` also lack complete passing evidence: **A-R01–A-R13**, restricted to their steps 2–4 portions. Existing tests cover parts of these checks, but not the full wheel/busy/deadline, count/earnings, Profile, Rx gestures, persisted schedule/form matrix, disable isolation, and sheet-history requirements described in `REVIEW-CHECKS.md`.

No token correctness gap identified in the scoped CSS.