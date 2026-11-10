# Home — building blocks before any render (2026-11-11)

> **Agreed 2026-11-11 (Apurva: "go ahead" with the main thread's picks), after the research + Codex review (`docs/renders/2026-11-11-home-blocks-review/REPORT.md`). These override the blocks below where they differ:**
> 1. **Band:** logo → title gap **32** (was 48); Home band title **24/32** (`--tm-font-size-title-md` / `--tm-font-lineheight-xl`), added to the design rules as the Home title size — that rule change goes to `main` on its own shared PR before the build run. Copy unchanged.
> 2. **Rows match:** both rows label on top, value below; **both values use the L9 value display (32/40 semibold, fixed-width digits)** — timer and count alike.
> 3. **Count after availability ends** (idle-expired, manually ended): one row above "Availability duration", only when the count is above 0. Fresh setup with 0: no row.
> 4. **10-hour cap in total:** the setup wheel goes 0–10 h (at 10 h minutes 00 only; at 0 h minutes 15/30/45). The add-time wheel tops out at what is left, with the hint "Up to 10 hours in total".
> 5. **Label:** "Prescriptions written today".
> 6. **+ Add time:** shown only near the end, as today, in a reserved slot on the timer line so nothing moves.
> Also from the review: spacing only 8 / 16 / 32; hint 8 under the section title; sub-labels "Quick picks" / "Custom" in the existing 14/20 secondary regular section-label style; neutral (grey) icons on the rows, no brand tiles (§8.11); a content card (`tm-card`), not a status card; in stop-pending only the count row shows; countdown m:ss (h:mm:ss from an hour); wheel columns are spinbuttons, chips are toggle buttons, the countdown is not live-announced (near expiry / ended / time added announced once).

Two screens: **Setup** (not available yet) and **Available**. Approved copy stays unless marked **NEW**. Nothing is rendered until you agree on these blocks.

## Rules both screens share
- **Header** unchanged: logo left; bell, help, profile right.
- **Blue band**: the gap from logo to title goes from 48 to **24**, and the title from 32 to **24**. That is the whole fix for "the band eats a quarter of the screen". Copy unchanged.
- **One text scale in the panel**: section titles 16 semibold, dark; labels 16 regular, dark; hints 14 grey, always attached to what they explain (4 below or beside it, never floating on their own); values 24 semibold.
- **Bottom bar** unchanged.

## 1 · Setup

```
┌──────────────────────────────────┐
│ truemeds              🔔  ?  👤  │
│                                  │  24
│ Consult on your schedule         │  title 24, one line
│ Choose how long you're available │  14 grey
│ today.                           │
├──────────────────────────────────┤ white panel
│ Availability duration            │  section title 16 semibold   NEW
│ 15 minutes to 10 hours           │  hint 14 grey, 4 below        NEW
│                                  │  16
│ Quick picks                      │  sub-label 14 semibold grey   NEW
│ (15 min) (30 min) (45 min)       │
│ (1 hour) (2 hours) (3 hours)     │
│                                  │  24
│ Custom                           │  sub-label 14 semibold grey   NEW
│     Hours         Minutes        │
│       0             15           │
│ ▕     1      │      30      ▏    │  selection band (approved wheel)
│       2             45           │
├──────────────────────────────────┤
│ [        Set availability      ] │
└──────────────────────────────────┘
```

| Block | What it is | Why |
|---|---|---|
| Section title + range | "Availability duration", with "15 minutes to 10 hours" right under it | The range applies to the whole choice, chips included, so it belongs to the title. Replaces the old "Adjust duration" / "Minimum 15 minutes" pair. |
| Quick picks | The 6 approved chips | One tap covers most doctors. |
| Custom | The approved wheel, always shown (hours 0–10; at 10 h minutes are 00 only) | The panel has the room; no extra tap. |
| Sync | Tap a chip → the wheel moves to it. Turn the wheel to a value with no chip → no chip is selected. | One value, two ways to set it. |
| Removed | Prescriptions today, "Adjust duration", "Minimum 15 minutes" | Not part of choosing a duration. |

**Alternative (your bracket idea):** no section title; the second label reads **Custom (15 min – 10 hours)**. Saves one line, but the range then looks as if it applies to the wheel only.

**Small phone (360 × 640):** with the section title, the panel is about 56 px taller than the space, so the wheel's last row scrolls under the bar. Allowed by the rules (the panel scrolls; the bar stays), but worth knowing. The bracket version fits without scrolling.

## 2 · Available

```
┌──────────────────────────────────┐
│ truemeds              🔔  ?  👤  │
│ You're available for             │  title 24 (two lines: long copy)
│ consultations                    │
│ Request a case whenever you have │
│ a moment.                        │
├──────────────────────────────────┤
│ ┌──────────────────────────────┐ │  one card, two rows, one anatomy
│ │ [⏱] Time remaining  [+ Add time]│ │  row: icon tile · label/value · action
│ │      30:00                    │ │
│ │──────────────────────────────│ │
│ │ [Rx] Prescriptions written    │ │
│ │      today                    │ │
│ │      3                        │ │
│ └──────────────────────────────┘ │
├──────────────────────────────────┤
│ [         Request a case       ] │
│          End availability        │
└──────────────────────────────────┘
```

| Block | What it is | Why |
|---|---|---|
| Status card | One card (like the case page's View Rx card) with two rows divided by a line | Both facts read as one status block; neither looks like fine print. |
| Row anatomy (same for both) | 40 icon tile (brand tint) · label 16 dark · value 24 semibold under it · action slot on the right, centred on the row | Both rows match exactly; this is what didn't line up before. |
| Time row | Clock icon · "Time remaining" · 30:00 · **+ Add time** in the action slot (secondary small button, like View Rx) | The action sits next to the thing it changes. |
| Prescriptions row | Rx icon · label · count · empty action slot | Same anatomy, no action. |
| Countdown | Stays mm:ss (30:00; 1:30:00 above an hour), as approved | Shows it running down. |

## Your answers needed
1. **Setup:** section title + range (my pick), or the bracket version on Custom?
2. **Label:** you offered "Prescriptions generated today" / "created today". I'd use **"Prescriptions written today"** — it's how doctors describe their own work, and "generated" sounds like the system made it. Your call among the three.
3. **+ Add time:** today it appears only near the end (last 5 minutes). With a fixed slot on the row, I'd show it **all the time** (greyed when offline), so a doctor can extend whenever they like. Or keep it only near the end?

After your answers I render exactly these blocks (390 and 360 × 640), self-check them, and show you.
