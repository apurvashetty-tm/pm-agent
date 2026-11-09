# Kit viewer clean-up and downloads: proposal

2026-11-10 · For Apurva's agreement before anything changes. Applied in one pass by the kit run (all journeys), before Netlify deploy 1.

**Test for every item:** does it help an engineer build the screen right, or help Apurva walk them through it? If neither, cut it.

## 1. Screens tab (what you walk Engineering through)

| # | What's there today | Does it help? | Proposal |
|---|---|---|---|
| S1 | The 390 picture you tap, plus the element card (block, design values, spacing, text, icon) | **Yes**: this is the kit's core. | **Keep.** |
| S2 | Inside the element card: "box 358×743 at x,y" | Barely. The engineer builds with the spacing and design values, not pixel positions. | **Cut.** |
| S3 | Inside the element card: Accessibility ("role main · name · size 358×743") | Half. The spoken label matters for screen readers; role and size are noise. | **Keep only the spoken label**, and only where one exists. |
| S4 | A row of buttons with element names (field-control, field-prefix…) | Yes for tiny elements that are hard to tap. Clutter otherwise. | **Keep, folded** under "Can't tap it? Pick from a list". |
| S5 | "Rule for this state" card | **Not as written.** It shows our internal codes ("F1 — Submit empty; focus field, edit") and pastes the same long paragraph into many states. What it should answer is real: when does this state appear, and what can the doctor do next? | **Replace** with "When this shows": one or two plain lines (what causes it · what happens next) and links to the DECIDED answers. |
| S6 | "Tokens used in this state" table | No. It repeats what each element card already shows. | **Cut.** |
| S7 | "Not tokens in this state: 0" card | No. It's 0 on every state now, so it's noise. | **Show only when above 0**, as a red warning. Red flags inside element cards stay. |
| S8 | "Approved reference file: values that are not tokens (19)" | No. It's our internal check on our own reference HTML; engineers build from the built app, which has 0. | **Cut.** |
| S9 | Three pictures of the same screen (built 390, approved 360, approved 390) | Built 390 and approved 390 are the same picture (proved by the compare). | **Keep the built 390 (tap it) and the approved 360** (the smallest phone). **Cut the approved 390.** |

## 2. Start here tab

| # | Today | Proposal |
|---|---|---|
| H1 | "What is here" card | **Keep**, rewritten in four plain lines (one per tab). |
| H2 | "Files" card listing `../AGENTS.md`, `../DECIDED.md`… | **Replace** with the download area (§5). |
| H3 | "Tokens used on Sign-in" table (the first thing anyone sees) | **Move** to Foundation as a "used on screen X" filter. It's the main reason the first page overwhelms. |
| H4 | Nothing on how to use the viewer in a walkthrough | **Add** one line: "Start with Screens. Tap anything. Check DECIDED before asking." |

## 3. Foundation tab

| # | Today | Proposal |
|---|---|---|
| F1 | 174 design values, searchable, native name beside web name | **Keep** (reference). Add the "used on screen X" filter from H3. |
| F2 | "(via --tm-core-…)" alias chains | **Fold** into a hover / second line; most readers don't need them. |

## 4. Building blocks tab

| # | Today | Proposal |
|---|---|---|
| B1 | Each block: pictures, parts × states → values, rules | **Keep.** |
| B2 | "RN names are a suggestion [RECOMMENDED]" | **Reword:** "Suggested React Native names; you own the components." No internal labels. |
| B3 | Rules end with "— Design rules 9.1", "§9.1" | **Cut the section numbers.** They point to our internal rules file, which isn't in the kit. The rule text stays. |

## 5. Downloads: inside the site, not Google Drive

**Proposal:** a **Download** area on Start here, built by the same script that builds the kit:
- **"Download the whole kit (.zip)"**: one button. This is the folder their AI tool reads.
- **Single files** for people who only need one: `tokens.ts`, `icons.ts`, `messages.ts`, fonts (.zip), logo files.
- The file names, size and kit version/date show beside the buttons.

**Why not Google Drive:** someone has to upload to Drive by hand after every change, so it falls behind the site and people end up with mismatched versions. Drive also needs sharing permissions per person. Inside the site, the download is always the same version as what they're looking at, and it costs nothing extra.

**Public link check:** a Netlify link is open to anyone who has it, and the screens are already public on the current prototype site. The fonts are open-licence (SIL OFL), so hosting them is fine. Nothing internal is in the kit (checked: no run logs, briefs or deploy settings).

## Done when (pass / fail)

- [ ] Every item above is applied as agreed (or marked "kept on purpose").
- [ ] No internal code, label or section number visible anywhere in the viewer (F1, N1, [RECOMMENDED], §, "Design rules x.y").
- [ ] Start here fits on one laptop screen without scrolling.
- [ ] Download zip and single files work from the deployed site and from a downloaded copy (opened from disk).
- [ ] The zip equals the `handoff/` folder (checked by script); the kit's "out of date" check still passes.
- [ ] Applied to every journey's screens, not only Sign-in.

## Order

Agree → the kit run applies it with all journeys (one pass) → Claude reviews → Apurva looks → **Netlify deploy 1** (app + kit + calling-flow page) → final deploy 2 after approval.
