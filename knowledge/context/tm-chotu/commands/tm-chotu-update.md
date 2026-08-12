---
description: Update persona / default mood / skip-list. Re-runs subset of onboard. Lightweight, soft.
---

# tm-chotu update

**Drop caveman briefly.**

## Step 1 — Show current state

Read `~/.claude/tm-chotu-state.json` via the Read tool. Show:

```
Current state:
  Persona:       <persona>
  Default mood:  <default_mood>
  Tools:         Metabase <✓/✗>, Mixpanel <✓/✗>
  Onboarded on:  <onboard_date>
```

If file missing → tell user: "You haven't been onboarded. Run `/tm-chotu-onboard` first."

## Step 2 — Pick what to change

Use `AskUserQuestion`:

- **Question:** "What do you want to change?"
- **Header:** "Update"
- **Options** (multiSelect=true):
  - Persona (function)
  - Default mood
  - Nothing — cancel

## Step 3 — Apply change

If persona — run Step 2 of `/tm-chotu-onboard` (function picker + mood-map). Re-confirm mood.

If mood — run Step 3 of `/tm-chotu-onboard` (mood picker).

## Step 4 — Save back

Write updated state to `~/.claude/tm-chotu-state.json`. Preserve untouched fields.

## Step 5 — Confirm

Caveman one-liner: `Updated. Persona: <X>. Mood: <Y>.`
