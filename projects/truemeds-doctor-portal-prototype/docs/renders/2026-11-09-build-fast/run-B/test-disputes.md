# Run B — test disputes (for the main thread to rule on)

Codex's tests are unchanged. One dispute; it covers five cases.

## 1. B-play-cat4, B-play-pilot_ha_free, B-play-pilot_no_ha_free, B-play-pilot_ha_skipped_customer, B-play-pilot_ha_skipped_system

**What fails:** `tests/codex/run-B/journeys.mjs:90` reads the play link with `d.p.locator('#rp-link').innerText()` right after
`d.choose('start','case')`. `choose` opens the **Story** row. The panel rows are one exclusive accordion
(`<details name="rp-rows">`, D-97 item 2 / RULES §7.3: "rows fold", one open at a time, so nothing is pushed off screen at
1280 × 800), so opening Story folds **Test on phone**, and `innerText` of an element in a folded `<details>` is `""`.
`page.goto("")` then fails: "Cannot navigate to invalid URL".

**Spec:** D-97 item 2 (Test on phone is "the first folding row … collapses like the others"); RULES §7.3 (rows fold, the panel
doesn't scroll). The link itself is correct: it is always current in `#rp-link` (run-checks Q1–Q3 decode it).

**Evidence the app passes the case's intent:** the same five cases with only the read changed to `textContent()`
(`run-B/tools/b-play-textcontent.mjs`, `run-B/b-play-textcontent.log`): **5 / 5 pass** — desktop and phone both play to B1
(Confirm prescription · Skip HA) for the two Pilot scenarios and to 8a (Confirm prescription, no Skip HA) for Cat4 / HA skipped,
and the phone's review panel is not visible.

**Proposed ruling:** test adapter bug. Read the link with `textContent()` (or open `details[data-row=phone]` first, the way
`choose` opens a field's row). No app change.

**Found on the way (fixed in the app, not a dispute):** on a phone the closed drawer was only moved off screen
(`transform`), so its controls stayed in the tab order and Playwright counted the panel as visible. The closed drawer is now
also `visibility: hidden` after its slide (`app/shell/shell.css`), which the same cases' last assertion needed.
