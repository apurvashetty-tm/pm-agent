# Handoff: My Statistics page redesign (Acom agent portal)

## Overview

The agent-facing **My Statistics** page currently renders fifteen identically-weighted metric cards behind a date-range filter and a **Get Details** button, so an agent lands on an empty page, types two dates, clicks, and then scans a flat wall of numbers with no hierarchy. This redesign replaces the page body only: data is present on open, the fifteen cards become two weighted groups plus two collapsed sections, and the call-to-order funnel is expressed as one object rather than three unrelated cards.

The shared portal shell — hamburger, shift-timing badge, logout icon, header structure, footer — is unchanged.

## About the design files

**The files in this bundle are design references written in HTML. They are not production code to copy.** `index.html`, `styles.css` and `app.js` are a prototype that demonstrates the intended look, behaviour and metric formulas. The task is to **recreate this design inside the Acom portal's existing environment**, using its established component library, routing, data layer and state conventions.

Specifically, do not ship the files under `reference/`. Do take from them:

- the exact token values in `tokens.json` and the `:root` block of `styles.css`
- the derived-metric formulas in `app.js` → `derive()`, which are the source of truth for every percentage on the page
- the API shape in `data.sample.json`
- the copy, verbatim (labels, empty/error text, and info-icon tooltips)

The original Claude Design reference files are retained under `reference/` for traceability. The clean prototype in this folder does not require Claude Design runtime or the artifact link.

## Fidelity

**High fidelity.** Colours, type, spacing, radii, shadows, hover states and responsive breakpoints are final and were verified by measurement at 1440 / 1180 / 980 / 780px. Recreate pixel-accurately using the portal's own components where equivalents exist.

Two known handoff placeholders:

1. **Logout icon** — approximated as a CSS door shape plus a chevron. Replace with the portal's real logout SVG.
2. **Fonts** — Manrope (UI) and IBM Plex Mono (numerics). Manrope was chosen to match the Truemeds wordmark's proportions while holding up at 12px; the storefront's actual font could not be read from its stylesheets. If the portal already has a UI font, keep it and only adopt the mono for numerics.

## Screens / views

There is one page with three time views, one Day period, three Week periods, three Month periods, two collapsible sections, and four data states. Every combination is reachable through the view controls or documented URL parameters.

### Page header area

**Layout** — `flex`, `align-items: flex-end`, wrap. Title block left, view selector pushed right with `margin-left:auto`.

- **Title** — "My Statistics", Manrope 700 / 28px / 1.2 / `-0.01em`, `#0F1724`
- **Subtitle** — "Your performance for the selected period", Manrope 500 / 13px, `#64748B`, `margin-top: 6px`
- **View selector** — segmented control. Track `#E2E8F0`, `padding: 4px`, `radius: 10px`, `gap: 4px`. Each button `padding: 9px 20px`, `min-height: 38px`, `radius: 7px`, Manrope 600 / 13px, `#33415C`; hover `background:#EEF2F7`; **selected** 700 weight, `#FFFFFF` on `#1B69DE`. Options: Day (default) / Week / Month.

### Period bar

**Layout** — `flex`, wrap, `gap: 14px`, `padding-bottom: 18px`, `border-bottom: 1px solid #DCE2EA`. Chips left; freshness group pushed right.

- **Chips** — `padding: 8px 15px`, `min-height: 36px`, `radius: 8px`, Manrope 500 / 13px, `#33415C` on `#FFFFFF`, border `1px #DCE2EA`. **Selected**: 700 weight, `#0A4193` on `#E6EFFC`, border `#1B69DE`.
  - Day → `Today`
  - Week → `This Week`, `Last Week`, `Two Weeks Ago`
  - Month → `July 2026`, `August 2026`, `September 2026` — **the current month and the two preceding it, nothing else.** Default to the current month. There is no date picker and no free date entry anywhere on the page.
- **Freshness** — 7px `#22B573` dot, then "Last updated today 09:41 AM" in IBM Plex Mono 500 / 12px, `#64748B`, **`white-space: nowrap`** (it wraps mid-timestamp without this). Then a text **Refresh** button, Manrope 600 / 12px, `#1B69DE`, hover `background: #E6EFFC`.

### Key Performance (default visible)

Section heading: 3×16px rule in `#1B69DE`, then "Key Performance" Manrope 700 / 16px, then the period label in Manrope 500 / 12px `#94A3B8`.

**Row layout** — `display: flex; gap: 14px; flex-wrap: wrap; align-items: stretch`. Funnel card `flex: 2 1 520px`; value card `flex: 1 1 320px`. Side by side from 1440 down to 980; stacked at 780.

#### Card 1 — Call to order funnel

White, `radius: 12px`, `box-shadow: 0 1px 3px rgba(15,23,36,0.07)`, `padding: 16px 20px 20px`.

This card is the central change. Calls initiated, calls connected and orders placed are three stages of one funnel, so they share one card and each stage carries its own rate. Bar widths are the funnel shape, so the drop-off is visible before any number is read.

- **Header** — eyebrow "CALL TO ORDER FUNNEL" (Manrope 700 / 11px / `0.06em` / uppercase, `#64748B`), and right-aligned a **conversion badge**: `#E6EFFC` fill, `padding: 6px 12px`, `radius: 8px`, containing the label "Conversion" (Manrope 500 / 12px `#33415C`), the value in IBM Plex Mono 700 / 16px `#0A4193`, and an info button.
- **Stages** — `flex-direction: column; gap: 14px; margin-top: 18px`. Each stage is a head row (`display:flex; align-items:baseline; gap:10px`) above a bar (`height:10px`, track `#EEF2F7`, `radius: 99px`, fill transitions `width 240ms ease`).

| Stage | Value type | Bar fill | Bar width | Right-hand rate |
|---|---|---|---|---|
| Calls initiated | Mono 700 / 26px, `#0F1724`, `min-width: 74px` | `#C5D9F7` | `100%` | text hint "starting point", `#94A3B8` |
| Calls connected | Mono 700 / 26px, `#1B69DE` | `#1B69DE` | `connectedPct` | `connectedPct` Mono 700/13px `#0A4193` + "answered" + info |
| Orders placed | Mono 700 / 26px, `#22935B` | `#22B573` | `conversionPct` | `closePct` Mono 700/13px `#22935B` + "of connected" + info |

- **Footer** — `1px #EEF2F7` divider, then "Conversion vs previous {view}" (`#64748B`, 12px) and a delta badge: Manrope 700 / 12px, `#22935B` on `#C8EDDC`, `radius: 6px`. Negative deltas flip to `#A5170F` on `#FDECEA`.

#### Card 2 — Total order value

White, `radius: 12px`, `box-shadow: 0 1px 3px rgba(15,23,36,0.07)`, `padding: 14px 18px 18px`.

- Eyebrow "TOTAL ORDER VALUE"
- Value — IBM Plex Mono 700 / 38px / 1.1 / `-0.01em`
- "{aov} average per order" — Manrope 500 / 13px, `#33415C`
- `1px #EEF2F7` divider, then "vs previous {view}" plus the value delta badge

> **Final decision:** keep this card light. Use typography, spacing, and subtle accent treatment for prominence. Do not use an inverted dark treatment.

### Needs your attention

Section heading rule in `#F2A93B` ("Needs your attention"). Grid: `repeat(auto-fit, minmax(260px, 1fr))`, `gap: 14px`.

Two cards, each `padding: 16px 18px`, `display:flex; align-items:center; gap:16px`, hover `#F4F8FE`, clickable (they should navigate to the filtered order list):

- **Orders on hold** — value Mono 700 / 30px `#8A5A00`, label Manrope 600 / 14px, right chevron at `opacity: 0.4`
- **Scheduled orders** — value Mono 700 / 30px `#0A4193`, same structure

These carry no descriptive sub-line by design — the number and the label say everything, and a restating sub-line was removed during review.

### Expandable sections

Two accordions, `margin-top: 26px`, `gap: 12px`. Inline expansion only — **never navigate away**.

**Head** — `padding: 16px 18px`, `display:flex; align-items:center; gap:14px`, hover `#F7F9FC`. Contains: 3px `#94A3B8` rule, title Manrope 700 / 15px, a live summary in Manrope 500 / 12px `#64748B`, then right-aligned toggle text Manrope 600 / 12px `#1B69DE` and a chevron rotated `90deg` closed / `-90deg` open with `transition: transform 180ms ease`.

Toggle label reads "Show N metrics" when closed and "Hide" when open, where N is the tile count.

**Body** — `border-top: 1px solid #EEF2F7`, `padding: 18px`, grid `repeat(auto-fit, minmax(180px, 1fr))`, `gap: 12px`. Tiles: `#F7F9FC`, `radius: 10px`, `padding: 14px 16px`; label Manrope 500 / 12px `#64748B`; value IBM Plex Mono 700 / 24px.

**Fulfilment** — summary "{delivered} delivered · {inTransit} in transit". Five tiles:

| Tile | Value colour | Notes |
|---|---|---|
| Total orders delivered | `#22935B` | |
| Orders in transit | `#0A4193` | |
| Orders cancelled | `#A5170F` | |
| RTOs | `#A5170F` | has info icon; **replaced the old "Orders refunded (Full)"** |
| Delivery success rate | `#0F1724` | has info icon; derived from existing metrics |

**RTO decision — carry this into the data layer.** "Refunds" was removed because a refund can happen for reasons unconnected to agent performance. RTOs replace it, and **door-to-origin returns (DTO) are bundled into the RTO count rather than shown separately**. Cancellations stay a separate metric.

**OTC** — summary "{otcOrders} orders · {otcSale} sale value". Three tiles:

| Tile | Value colour | Notes |
|---|---|---|
| OTC orders | `#0F1724` | |
| OTC order value — MRP | `#64748B` | intentionally muted; it is the reference figure |
| OTC order value — Sale value | `#22935B` | |

## Interactions & behaviour

- **View switch** — swaps the period chip set, selects that view's remembered period, and **collapses both accordions** (they reopen with new data otherwise, which reads as a glitch).
- **Period switch** — re-fetches; keeps the accordion state.
- **Refresh** — enters `loading` for the duration of the request, then back to `ready`. In the prototype this is a 1100ms timeout.
- **Accordion** — pure show/hide, no route change, no scroll jump.
- **Attention cards** — should navigate to the order list pre-filtered to that status. Not wired in the prototype.
- **Info icons** — `title` attributes in the prototype. **Replace with the portal's real tooltip component**; native `title` is too slow to appear and is invisible on touch. Text must carry over verbatim, formula first.
- **Transitions** — bar `width` 240ms ease; chevron `transform` 180ms ease. Nothing else animates.
- **Focus** — `box-shadow: 0 0 0 3px #E6EFFC` on `:focus-visible` for every interactive element, without exception: view tabs, period chips, buttons, Refresh, accordion heads, attention cards, info icons, hamburger, logout. Agents work by keyboard; do not drop this. Note the attention cards carry `tabindex="0"`, so they are in the tab order and must show the ring.

### Info icon copy (verbatim)

| Where | Tooltip |
|---|---|
| Conversion badge | Formula: orders placed ÷ calls initiated × 100. End-to-end conversion across the whole funnel, so unanswered calls do count. The two step rates below break down where the drop-off happens. |
| Calls connected | Formula: calls connected ÷ calls initiated × 100. A call counts as connected only when the customer answers; ring-outs, busy tones and invalid numbers still count as initiated. |
| Orders placed | Formula: orders placed ÷ calls connected × 100. Your close rate once a customer actually picks up — the part of the funnel most within your control. |
| RTOs | Return to origin. Orders that came back to the warehouse undelivered, including door-to-origin returns where the customer refused at the door. DTOs are bundled in here rather than counted separately. |
| Delivery success rate | Formula: orders delivered ÷ (delivered + cancelled + RTOs) × 100. Counts only orders that reached dispatch, so orders still in transit are excluded from both sides. |

## Data states

| State | Trigger | Renders |
|---|---|---|
| `ready` | data returned, `hasActivity: true` | full page |
| `loading` | initial load, view/period change, Refresh | six skeleton cards + "Fetching your numbers…"; shimmer is `opacity .45 → 1 → .45` over 1.4s with staggered delays |
| `empty` | 200 with `hasActivity: false` | centred panel, "No activity recorded for {period}", primary "Go to my call queue" + secondary "View previous period". **Never a page of zeroes.** |
| `error` | request failed | panel with `3px #D93025` top border, heading `#A5170F`, reassurance that calls and orders are unaffected, mono error code, "Try again" + "Report to support" |

## State management

```
view:      'day' | 'week' | 'month'                 // default 'day'
period:    { day, week, month }                     // remembered per view
dataState: 'ready' | 'loading' | 'empty' | 'error'
open:      { fulfilment: boolean, otc: boolean }    // reset to false on view change
```

Data fetching: one request per (view, period). `availablePeriods` is **server-owned** so the three-month cap cannot be bypassed from the client. Percentages are **not** sent by the API — derive them client-side from the formulas in `app.js` so UI calculations remain consistent.

## Design tokens

Full machine-readable set in `tokens.json`; CSS custom properties in the `:root` block of `styles.css`.

Colours were **pixel-sampled from Truemeds brand assets** (the wordmark SVG and the CDN icon set), so the brand values are exact rather than eyeballed: primary `#1B69DE`, green `#22B573`, deep blue `#0A4193`, tints `#E6EFFC` / `#C8EDDC`. Neutrals, status colours, the dense type steps and the focus ring did not exist on the storefront and were derived for portal use — those are flagged `"derived": true` in `tokens.json`.

- **Spacing** — 4px base; `4 6 8 10 12 14 18 20 26 32`. Section gap 26px, card gap 14px, card padding `16px 20px 20px`.
- **Radius** — 6 / 8 / 10 / 12 / 99 (pill).
- **Shadow** — card `0 1px 3px rgba(15,23,36,0.07)`; raised `0 4px 14px rgba(15,23,36,0.16)`.
- **Type** — Manrope for UI, IBM Plex Mono for **every** numeric. The mono is not decorative: fixed-width digits keep columns of figures from shifting when the period changes.
- **Minimum interactive height** — 36px (chips), 38px (view tabs), 42px (buttons).

## Responsive behaviour

Verified by measurement, not assumed:

| Width | Key Performance | Accordion tiles |
|---|---|---|
| 1440 | funnel + value side by side | 5 columns |
| 1180 | side by side | 5 columns |
| 980 | side by side | 4 columns |
| 780 | stacked | 3 columns |

Nothing is pinned to a fixed pixel width; all rows are `flex-wrap` or `auto-fit` grids.

## Assets

| Asset | Source | Action |
|---|---|---|
| `rightChev.svg` | `assets.truemeds.in/Images/website-assets/icons/actions/rightChev.svg` | used for accordion + attention chevrons; replace with the portal's own icon set |
| `GenericSafe.svg` | `assets.truemeds.in/Images/website-assets/icons/status/GenericSafe.svg` | empty-state illustration |
| Manrope, IBM Plex Mono | Google Fonts | self-host for an internal portal |
| Logout icon | **not sourced** | supply the real asset |

The Truemeds CDN icon set covers marketing needs only — it has no sort, filter, assign or escalate glyph. Adopt one flat interface icon set at 20px for portal work and keep the duotone illustrations for empty states.

## Files

| File | What it is |
|---|---|
| `index.html` | Full page markup, all four states, semantic classes |
| `styles.css` | Tokens as CSS custom properties + component classes |
| `app.js` | State machine, derived-metric formulas, sample data |
| `data.sample.json` | Suggested API response shape with field notes |
| `tokens.json` | Machine-readable tokens, sampled vs derived flagged |
| `reference/My Statistics Redesign.dc.html` | Original interactive design reference |
| `reference/Truemeds Design System.dc.html` | Extracted design-system reference |
| `reference/support.js` | Claude Design runtime retained for reference only |
| `screenshots/` | Captured visual QA states and responsive widths |

## Resolved decisions

1. Total Order Value card stays light. Dark inverted treatment is out of scope.
2. Fulfilment remains a performance-related section and keeps its current name.
3. Order-level CSV export is out of scope. No export CTA is included.
4. The Claude artifact link is optional. This standalone folder is the handoff source of truth.

## Implementation dependencies

1. Attention cards should open the order list pre-filtered to the corresponding status, or use the portal's approved queue destination.
2. Replace placeholder logout icon with the portal's real asset.
3. Replace native `title` tooltips with the portal's approved tooltip component.
4. Replace external fonts and CDN assets with portal-owned assets where required.

## Future scope

Substitutes / Generics may become a future expandable group containing substitutes possible, substitutes done, and substitution percentage. It is not part of this version and is not rendered in the prototype.

## Running and previewing

Open `index.html` in a browser. If browser security blocks local scripts, serve this folder with any static file server. External font and icon URLs require network access.

Review states through URL parameters:

- `?view=day&state=ready`
- `?view=week&state=ready`
- `?view=month&state=ready`
- `?view=month&state=ready&open=fulfilment`
- `?view=month&state=ready&open=otc`
- `?state=loading`
- `?state=empty`
- `?state=error`

## Screenshot inventory

`screenshots/` is reserved for ready, expanded, loading, empty, error, and responsive-width captures. Browser screenshot capture remains pending because the current environment cannot open this local folder in its browser. These are visual references only; frontend implementation must use the portal's existing component library and data layer.
