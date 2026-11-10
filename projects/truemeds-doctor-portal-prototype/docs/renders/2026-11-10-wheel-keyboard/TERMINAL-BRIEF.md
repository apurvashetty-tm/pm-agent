# Brief — swipe wheel + keyboard handling (F-04, F-05), small run before the final deploy

Folder: the project folder (project branch). Evidence: this folder. **Aim: two to three hours.** Read `docs/runs/RULINGS.md` first, then F-02, F-04, F-05 in `docs/reviews/2026-11-09-prototype-feedback.md`, D-40 (wheel) and app-logic §3. **The approved look doesn't change**: same pictures (compare stays within 1 %).

## 1 · F-04 Availability wheel that swipes (Home setup and the Add time sheet)
- Today `wheel()` in `app/screens/home.js` draws 3 buttons (above · selected · below) and a tap moves one step: it behaves like a select. Make each column a **real wheel**: drag / swipe (touch and mouse), momentum, **snaps** to one item, the item in the centre band is the value; mouse wheel / trackpad scrolls it; tapping the row above / below still moves one step; arrow keys work (accessible as now: listbox / options, the selected option announced).
- Same look: 3 rows visible, the selected row in the band, same sizes and tokens. Hours and minutes columns keep their ranges (minutes in 15-minute steps, D-40); the minimum (15 min) and the busy / disabled rules stay.
- Tests (smallest): programmatic swipe on each column snaps and sets the value; tap above / below still works; busy blocks it; the value set is what Set availability / Add uses.

## 2 · F-05 Keyboard never covers the field or the main button (phones)
- F-02's `interactive-widget=resizes-content` isn't enough on Apurva's Android phone (Chrome): after typing the OTP, **Verify & sign in stays under the keyboard**, and focused fields don't scroll into view.
- Fix once in the shell, for every screen: use `window.visualViewport` (resize / scroll) to size the app to the space above the keyboard on phones, and on focus scroll the focused field **and the screen's main action** (pinned bar button, or the button right under the field, e.g. Send OTP, Verify & sign in, Add notes fields) into that space. Works on Android Chrome and iOS Safari; keep the meta tag. Desktop phone frame with the drawn keyboard: unchanged.
- Tests: in a phone-sized headless page, focus the OTP field, shrink the visual viewport as a keyboard would (emulate with a smaller viewport height / a stubbed `visualViewport` resize) and assert Verify & sign in and the field are fully inside it; same for sign-in, the notes fields on the case page and the Prescribe "Other dose" / instructions fields.
- After the run, Apurva checks both on his phone through the local link (`scripts/serve.sh`). Say so in the report; don't deploy.

## 3 · Kit rules (React Native)
In the generator's DECIDED config, plain words: **Wheel:** a native-feel wheel — swipe, momentum, snap to 15-minute steps, three rows visible; iOS has a native wheel, Android's picker is a dropdown, so use a wheel component there (app team's choice of library). **Keyboard:** the focused field and the screen's main button always sit above the keyboard (keyboard-avoiding layout on every screen with a text field). Regenerate the kit; `--check` and `tests/codex/handoff/` pass.

## Checks
entry-journeys, run-checks, the steps 2–4 compare (Home and the Add sheet pictures within 1 %), `layout_check.py --app`, `check-locked-specs.py`, `check-sources.mjs`, token check, kit `--check`. One Codex review (correctness vs this brief), one fix pass. No deploy.

## End
Short `REPORT.md` here. Append `DONE wheel-keyboard` (or `STOPPED wheel-keyboard: <reason>`) to `docs/runs/STATUS.md`, publish with `bash ../../scripts/publish.sh -m "..." <files>`, stop.
