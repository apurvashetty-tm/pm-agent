**Run A0 still needs fixes before acceptance.** I found no confirmed blocker in the app shell itself, but reference-frame compliance and verification gaps remain. Review was read-only; browser results below are from the supplied logs, not a fresh run. I independently checked the default-story output and QR generator units.

**Should-fix**

1. **Reference frames don’t consistently follow §7’s scaling formula.**  
   `ui-screens/case/case-styles.css:37` subtracts 32px rather than 48px from viewport height. `ui-screens/home/home-reference.css:11` remains fixed at 390×844, so it cannot scale down for shorter desktop windows. The sign-in change at `ui-screens/sign-in/sign-in.html:13` is overridden by `:27` (`aspect-ratio:auto; min-height:844px`), making that edit ineffective.  
   **Spec:** Brief:56; design-system/RULES.md:119. Apply the desktop formula to the effective reference-frame rules and check desktop reference geometry.

2. **The claimed four-module QR quiet zone is actually two modules.**  
   `app/review/qr.js:7` passes `margin:4`, but the vendored generator defaults `cellSize` to 2 and interprets margin in SVG units (`app/review/vendor/qrcode-generator.js:509–510`). Independent inspection confirmed a two-module margin. The decoder passes are useful evidence, but don’t substantiate the reliability claim in the comment or dispute report. Omit `margin` to use the library’s four-module default, or use `margin:8`.  
   **Spec:** Brief:58, phone-readable QR.

3. **P15/P16 don’t replace the disputed every-entry tap-fill tests.**  
   `tests/run-checks.mjs:399–411` taps only one number and one code on desktop. P16 at `:415–423` checks hidden attributes without opening the drawer or tapping anything. Consequently, `run-A0/test-disputes.md:8` overstates the replacement coverage.  
   **Spec:** Brief:61; CASES.md:29–30. Run every listed value on its matching screen, on desktop and through the visible phone drawer.

4. **Network verification stops before Copy link and advertised-address navigation.**  
   P17 injects a synthetic meta tag (`tests/run-checks.mjs:428`) and checks QR decoding, but never tests the server’s actual injection, clipboard contents, or opening the advertised LAN URL. The disputed Codex test stops before those assertions too.  
   **Spec:** Brief:58; CASES.md:24–26. Add passing evidence using the real server, both loopback hosts, and the preview-origin branch.

5. **Picture preservation is asserted without an inspectable full comparison record.**  
   `run-A0/picture-proof.md:3–5` reports all approved captures identical, but the directory contains no per-picture comparison manifest, capture log, or exact command/output supporting that full result. The supplied `compare-step1` log covers entry screens, not the entire approved collection. Also, “desktop frame rules do not apply” is too broad: the edited sign-in declaration is outside a desktop media query, although subsequently overridden.  
   **Spec:** Brief:56; CASES.md:20. Retain the full comparison results and correct that explanation.

**Items 1–6**

| Item | Assessment |
|---|---|
| 1 — Frame/pictures | App geometry matches; reference scaling and complete picture-proof evidence need work. Frozen root files are unchanged. |
| 2 — Control column | Implementation and supplied geometry/screenshot evidence support compliance. |
| 3 — Phone link/server | Address-selection logic is sound on inspection; QR margin and complete network verification need fixes. The custom Python handler is a reasonable equivalent to plain `http.server` because it supplies the address. |
| 4 — Happy-path default | Pass at configuration level: independently confirmed Cat4, over-gate call/record, updated steps, and selectable unanswered-call encoding. End-to-end playback remains dependent on A1/A2. |
| 5 / 5b / 5c | Wrapping, shared-data lists, ordering and readable settings are implemented. Every-entry phone interaction remains unproved. |
| 6 — Checks/delivery | Supplied logs report run-checks **87/87** and entry journeys **60/60**, plus passing layout/guard checks. Required before/after screenshots exist. Publishing, REPORT.md and the waiting-for-review status remain unfinished; Brief:77 still says “not started.” |

**Disputes**

- **Layout:** fair. `tests/codex/run-A0/all.mjs:38` measures the first summary, while Brief:57 requires the panel’s top edge. Correcting that assertion should be followed by running the remaining assertions.
- **Inputs:** fair selector bug. The unanchored `/0000/` at `all.mjs:70` also matches the synthetic phone numbers. Accept the dispute, but retain the missing coverage described above.
- **Network:** fair selector bug. `all.mjs:107` selects the summary chevron before the QR. Its subsequent clipboard/navigation assertions still need execution.
- **Happy path:** fair A1/A2 dependency, explicitly anticipated in CASES.md:27. “Send code” at `all.mjs:124` is also the wrong label. This is deferred coverage, not a passing A0 journey.

**CASES.md scenarios without a complete passing test**

- `A0-layout-1280`, `A0-layout-1440`, `A0-layout-1920`: Codex cases fail early; P5/P11 supply substantial partial coverage.
- All four `A0-inputs-*` cases: no complete every-value display-and-fill pass.
- `A0-network-link`: no complete QR → Copy → advertised URL pass, including both loopback hosts.
- `A0-happy-path`: no end-to-end pass; defer explicitly to A2.
- Eye-only scenarios lack a consolidated acceptance record: `A0-reference`, `A0-network-copy` preview behavior, `A0-server`, `A0-data-origin`, `A0-order`, and `A0-shell-contract`. Some have supporting code or screenshots, but that is distinct from a passing scenario test.

**Nice-to-have:** make P18 fail on a failed `storySteps` import. Its `.catch(() => ({}))` and `!storySteps || …` at `tests/run-checks.mjs:444–448` currently allow the QR-step assertion to pass without running.