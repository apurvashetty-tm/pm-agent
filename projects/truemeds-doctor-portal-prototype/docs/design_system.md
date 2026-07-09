# Design System — Truemeds Doctor Portal Prototype

Single reference for every visual decision. **Before building any new UI element, check here first.**
If what you need exists → use it. If it doesn't → extend this file *first*, then implement.

Implementation lives in `styles.css` (tokens + component classes) and `app.js` (`ICONS` map).
This doc and the code must never disagree — update both in the same change.

---

## 1. Design tokens (`:root` in styles.css)

| Token | Value | Use |
|---|---|---|
| `--primary` | `#1B69DE` | Brand blue — primary actions, links, active states |
| `--primary-hover` | `#155fcc` | Pressed state of primary |
| `--primary-light` | `#eef4fd` | Tinted backgrounds (briefing strip, badges) |
| `--success` | `#16a34a` | Positive actions (Prescribe), live-call green |
| `--warning` | `#d97706` | Attention accents (HA pending) |
| `--danger` | `#dc2626` | Destructive/stop actions (End Call, disable) |
| `--text-primary` | `#111827` | Default text, **enabled button labels** |
| `--text-secondary` | `#6b7280` | Supporting text, quiet actions |
| `--text-muted` | `#9ca3af` | Hints, placeholders — never on actionable labels |
| `--radius-btn` | `10px` | All buttons |
| `--radius-card` | `12px` | Cards |
| `--radius-input` | `8px` | Inputs, list rows |

Border grey for outlined components: `#e5e7eb` (no token yet — if used a third time, promote to `--border`).

---

## 2. Button system

Every CTA is `class="btn btn-{size} btn-{variant}"`. No bespoke button CSS.
Per-button IDs may only add **placement** (margin, width, visibility) — never cosmetics.

### Sizes

| Class | Height | Font | Use |
|---|---|---|---|
| `btn-lg` | 56px | 17px | Hero action — one per screen (Call Patient, Confirm Order) |
| `btn-md` | 48px | 15px | Standard action (sheet confirms, sidebar CTA) |
| `btn-sm` | 42px | 13px | Compact / paired chips (Schedule, Skip HA) |

### Variants

| Class | Look | Use |
|---|---|---|
| `btn-primary` | Solid blue, white text, shadow | The one main action of a context |
| `btn-success` | Solid green | Positive confirm inside sheets (Prescribe, Confirm Callback) |
| `btn-danger` | Solid red | Stop/destructive hero action (End Call) |
| `btn-calling` | Solid green + `pulsing` | Live dialing status (disabled but not dimmed) |
| `btn-ghost` | White, grey border, **dark label** | Secondary actions. Dark label is deliberate — grey label reads disabled |
| `btn-text` | No border, grey label | Tertiary quiet action (Schedule link during live call) |
| `btn-text-danger` | Quiet, red on hover | Rare destructive links (Disable medicine, Mark Unavailable) |

### Rules

1. **One `btn-primary` visible per context.** Competing actions step down to ghost/text.
2. **Paired secondaries** go in a flex row (`#postcall-secondary-row` pattern), equal width, both `btn-sm btn-ghost`.
3. **Disabled ≠ grey label.** Disabled comes from `.btn:disabled` (opacity). Never style an enabled button with muted text.
4. **State changes swap classes in JS** (`callBtn.className = 'btn btn-lg btn-danger'`) — never inline `style.background`.

---

## 3. Icons (`ICONS` map, app.js)

Markup: `<span data-icon="name"></span>` — populated once by `initIcons()`.
JS state swaps use `ICONS.name`. **Never paste inline SVG into components; add to the map.**

| Key | Glyph | Used on |
|---|---|---|
| `phone` | Receiver (filled) | Call Patient / Calling / Call Again |
| `phoneEnd` | Receiver rotated 135° | End Call |
| `calendar` | Calendar (stroke) | Every Schedule Callback instance |

Emoji are banned in CTAs. Informational labels (briefing strip, demo controls) may keep them.

---

## 4. Existing component patterns (reuse before inventing)

| Pattern | Class / ID | Notes |
|---|---|---|
| Bottom sheet | `.bottom-sheet` inside `#sheet-overlay` | Anchored to mobile column by `openSheet()` |
| Selector chips | `.chip` (+ `.chip-active`) | Form option pickers — not CTAs |
| Option list rows | `.sheet-option-btn`, `.reason-btn` | Tap-to-choose lists inside sheets |
| Toast (transient) | `#toast`, `showToast(msg)` | Auto-dismiss 2.8s, column-centered |
| Success toast (persistent) | `#success-toast`, `showSuccessToast(title, desc)` | Terminal states; carries Next Order |
| Briefing strip | `#pre-call-brief` | Left-accent info strip above action zone |
| Status badges | `.badge` | PRESCRIBED / PENDING etc. |

---

## 5. Adding a new CTA — checklist

1. Which variant? (One primary per context → probably ghost or text.)
2. Which size? (Hero lg / standard md / compact sm.)
3. Icon needed? Reuse from `ICONS` or add there.
4. Write `<button class="btn btn-{size} btn-{variant}" …>` — ID only for behavior/placement.
5. Does it need a new look? Stop — that's a design-system change. Update this file + `styles.css` `.btn` block deliberately, knowing it changes every button.
