# Kit 1.0.0 (10 Nov, `963c2b5`) → current kit: building-block map

Status: **[RECOMMENDED] draft**, not yet in the kit. It goes into `CHANGES.md` and `changes.json` when kit 2.0.0 is built, after the app team's details page is read.

## How this map was made (references)

- **Old side:** the 10 Nov kit at commit `963c2b5` (`handoff/components/*.json`, `handoff/screens/*.json`). There's also a saved snapshot in `scripts/kit-changes/v1.json`.
- **New side:** the current `handoff/` on branch `project/truemeds-doctor-portal-prototype`.
- **Method:** for every place an old block appears, I took the same screen state in the new kit and found the new element that:
  - sits in the same measured position;
  - carries the same copy key.

  I didn't trust git's own rename guesses, since they compare file text only. One of them was wrong: git paired `sub` with `bar-caption`. In fact `sub` became `entry-band.sub`, and `bar-caption` is new.
- **Why the names changed:** kit block names come from the app's CSS class names. The r2-build pass (`aa2802c`, D-106 to D-109) merged the separate entry-screen headers into one shared band, and rebuilt the Home rows. That renamed the classes, and the kit followed.

## Map (old block.part → new block.part)

| Old (1.0.0) | Where it was | New | What happened |
|---|---|---|---|
| `band` | Home: title area | `entry-band` | Merged into the one shared band |
| `band.h1` | Home title (`home.title*`) | `entry-band.title` | Merged |
| `header` | Home: logo + actions row | `entry-band.row` | Merged |
| `header-actions` | Home: top-right actions | `entry-band.actions` | Merged |
| `logo` | Home logo | `entry-band.logo` | Merged |
| `login-logo` | OTP, offer, unlock logo | `entry-band.logo` | Merged |
| `head` | OTP, unlock: title block | `entry-band` | Merged |
| `head.otp-title`, `head.h1` | OTP title, unlock greeting | `entry-band.title` | Merged |
| `head.p` | OTP "sent to", unlock subtitle | `entry-band.sub` | Merged |
| `head.b` | OTP phone number in bold | `entry-band.b` | Merged |
| `top` | OTP, offer: top area | `entry-band` | Merged |
| `top.offer-title` | Offer title | `entry-band.title` | Merged |
| `intro` | Unlock: intro area | `entry-band` | Merged |
| `sub` | Home and offer subtitle (`home.sub*`, `offer.*Sub`) | `entry-band.sub` | Merged |
| `panel` | White panel under the band (all entry screens, Home) | `entry-panel` | Renamed, same job |
| `grp` | OTP: groups around code and resend | none (`field` + `link` sit straight in `entry-panel`) | Wrapper removed |
| `lk` | OTP "Change" link | `link` | Renamed, same job |
| `rx` | Home: "Prescriptions today" row | `srow` (`srow.label`, `srow.value` / `value-display`) | Rebuilt as a summary row |
| `rx.span` | `home.rxToday` label | `srow.label` | Rebuilt |
| `rx.strong` | The count | `srow.value` or `value-display` | Rebuilt |
| `timer-row` | Home: "Time remaining" row | `srow` | Rebuilt as a summary row |
| `timer-label` | `home.timeRemaining` | `srow.label` | Rebuilt |
| `adjust-row` | Home: "Adjust" label row | `lbl-row` | Renamed, same job |
| `adjust` | `home.adjust` label | `lbl` (`home.quickPicks`, `home.custom`) | Renamed; the copy changed too |
| `helper` | `home.minimum` hint | `hint` (`home.addHint`) | Renamed; the copy changed too |

**New in the current kit, with no old counterpart:**
- `group`: wraps quick picks and custom time.
- `until`: the "Available until" line.
- `bar-caption`: the case "availability ended" caption.
- `pt-txt`: offer point text.

## Going back to the old names?

It's possible but not recommended:

- **Not possible for 14 of the 18:** they were merged. Seven old blocks (`band`, `header`, `logo`, `login-logo`, `head`, `top`, `intro`) are now one shared band, which was the point of the 11 Nov standardisation. Bringing the old names back would mean bringing back the separate headers.
- **Possible for 4 straight renames** (`panel`, `lk`, `adjust-row`, `helper`), but the new names are clearer.
- Recommended: keep the new names and ship this map, with kit 2.0.0 marked breaking.
- If the app team wants a softer move, we can add an "aliases" list in `changes.json`, so their build can point old names at new ones for one release.
