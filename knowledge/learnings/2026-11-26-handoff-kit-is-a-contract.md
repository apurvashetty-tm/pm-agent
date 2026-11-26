# A hand-off kit is a contract: never rename or remove without a map

Date: 2026-11-26 · Source: doctor-portal kit review (`projects/truemeds-doctor-portal-prototype`) · [USER-PROVIDED] rules from the app (FE) team; agreed by Apurva as the bare minimum.

## What happened

- The app team builds `@tm-portal/app-design` straight from our kit, copying files by name. Kit 1.0.0 was sent on 10 Nov (`963c2b5`).
- The 11 Nov spacing and standardisation pass merged the entry-screen headers into one shared band and rebuilt the Home rows. Kit block names come from CSS class names, so 18 building-block files were renamed or removed.
- `CHANGES.md` listed them as "gone" but:
  - gave no old → new map;
  - had no new version number;
  - didn't mark the kit as breaking.
- Our checks only tested that the new kit matched itself. None compared it with the kit the team already had.
- The map was rebuilt afterwards from the saved 10 Nov kit, matching on screen position and copy key. One of git's automatic rename guesses was wrong.

## Rules (bare minimum for any kit, tokens or design system we hand over)

1. **No silent renames or removals.**
   - Every old name gets a row: new name, or "removed, use X instead".
   - Any such change marks the release as breaking.
2. **A new version for every kit,** even a one-token fix. Never resend different content under the same version.
3. **A changes list in two forms:**
   - one for people (`CHANGES.md`);
   - one for machines (`changes.json`): tokens, copy keys, icons, blocks, screens.
4. **An automatic check against the last kit the receiving team has.** If a name disappears without a map row, the build fails. That turns the rule into a gate rather than something we have to remember.
5. **Prefer adding to renaming.** Keep the old name, or give an alias for one release, until the receiving team confirms they've moved over.
6. **Keep the last sent kit's snapshot** (commit and data). Without it, the map can't be rebuilt.

## How to apply

- Before any clean-up or restyle that touches class names, file names or keys, check whether the kit has already been sent. If it has, the change needs a map row and a version bump.
- Get the receiving team's rules in writing first. For the doctor portal they're the FE kit rules: `kit.json`, `changes.json`, `DECIDED.md`, and every block state with a picture.
