# Source parity audit — 2026-10-13

## Copy and approval updates

- Initial setup, both variants: **Minimum 15 minutes**, shown once.
- Add availability, both variants: no repeated minimum/step reminder.
- Both controls retain the 15-minute minimum and increments.
- User approved the add-time wheel variant on 2026-10-13.
- All four PNG replacements were compared against their previous versions. Differences are confined to the reminder-text region; CTA positions and other pixels are unchanged. Active Home was not replaced.

## Available source

- HTML: availability.html, home.html and add-availability.html share home-reference.js/css and central web design-system assets.
- React Native: ../native contains actual TSX components for all approved auth/Home references, with shared native tokens and icons. See ../native/VALIDATION.md.
- Approved PNGs remain the visual acceptance references.

## Checks and remaining gaps

| Check | Result |
|---|---|
| Home JavaScript syntax | Passed |
| Home local stylesheet/script/logo paths | Passed |
| Native TypeScript and duration logic | Passed |
| Updated reminder copy across PNG/HTML/native | Passed |
| PNG changes confined to authorized text regions | Passed |
| Native device rendering and gestures | Not run |
| HTML-to-PNG pixel equivalence | Not verified; browser local-file access blocked |
| HTML wheel visual equivalence | Known gap: uses a browser listbox |
| Setup footer vs active Home footer | Existing difference: setup CTA is 56 points lower; preserved pending layout review |

Auth native components expose approved visual states; host implements current validation rules and backend outcomes. Native copy/structure is a handoff starting point, not proof that spacing matches approved screenshots. Font mapping and device screenshots are the next acceptance gate.

This audit supersedes earlier statements that wheel approval was pending or that no native screen components existed. Historical audit notes remain as history.
