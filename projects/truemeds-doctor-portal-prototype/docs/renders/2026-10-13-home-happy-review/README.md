# Home happy flow — review group 1

2026-10-13. Four unapproved snapshots: setup, active Home, add sheet, updated timer with toast. Approve individually. Previously saved wheel/tap alternatives remain unchanged; stepper here does not select a winner.

## Stable layout rules
- Primary action: x24, y708, width342, height56 at 390×844. Same position in all four snapshots.
- Active heading, subheading, Rx count, timer label, Add time link and footer stay fixed through loading, feedback and near-expiry variations. Near expiry changes timer color and adds warning copy; Add time does not move or turn amber.
- Headline may change when task changes (setup vs active); not for each request response. Larger text uses normal wrapping/scrolling rather than clipping; native responsive behavior still requires implementation testing.
- Shared duration picker function renders same 15/30/45 min and 1/2/3 h choices, Hours/Minutes labels, +/- controls and minimum guidance in setup and sheet. Additional time uses 15-minute steps. Natural expiry while sheet open changes no copy or action.
- On addition success, server deadline updates and sheet closes. Compact toast is transient, about four seconds with accessibility duration respected. Preserve current Home context.

## Audit performed
- PNGs 780×1688, 2× capture-equivalent size.
- Active/success pixel comparison: no changed pixels outside timer and toast areas.
- CTA baseline identical across all four; controls do not intersect CTA.
- Toast reads shared token values: body-xs 12px, lineheight-xs 16px, semibold600, xs/sm padding4/8, radius-xs4, inverse surface/content. Content-width, no action. Positioned above action bar to avoid obscuring controls.
- Inspected four-screen comparison for wrapping, alignment, picker reuse and copy consistency.
- Count remains3; example duration30min then +30min =1h. Real remaining time uses server deadline.

## Provenance
Static Pillow renders with project font and official logo/icons, not browser screenshots or functional component HTML. index.html is an image gallery. Full native accessibility and responsive behavior are not validated by this review. Generator uses dependencies from earlier render source snapshots and /private/tmp assets. New review only; no approved files overwritten.
