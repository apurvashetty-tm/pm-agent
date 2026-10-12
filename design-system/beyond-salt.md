# Added beyond SALT

Everything below is used in Truemeds prototypes but is **not in SALT (the Figma design library) yet**. Each is
marked `[PROPOSED]` in code. Share this list with the SALT designers so they can add, change or reject each item in
Figma; the native app team should treat them as proposals until SALT confirms. Last updated 2026-10-12.

## Components (`src/components.css`)
| Item | Class | Why it exists |
|---|---|---|
| Quiet button | `.tm-btn--quiet` | Grey, no fill: app-bar and sheet close. SALT's ghost button is brand blue and reads as the main action. |
| On-dark button | `.tm-btn--on-dark` | Light controls on a dark surface (prescription viewer). |
| Busy button | `.tm-btn--busy` | "Calling…", "Sending OTP": keeps the primary look while working; disabled grey reads as unavailable. |
| Field prefix | `.tm-field__prefix` | Fixed "+91" before the mobile-number input. |
| One-time code | `.tm-otp` | OTP boxes (one real input under the boxes, so SMS autofill and paste work). |
| Large chip | `.tm-chip--lg` | ~46px touch-size chip for choices tapped during a call (dose, interval, duration). |
| Medium tag | `.tm-tag--md` | 12px tag label; SALT's 10px is too small on dense doctor screens. |
| Snackbar | `.tm-snackbar` | Message + one action. Currently unused (no toasts, D-27); keep or drop. |
| Empty / waiting state | `.tm-empty` | Centred icon, title, line and optional action (e.g. "No cases right now"). |
| Web layer | `.tm-sidenav`, data table, `.tm-stat` | Internal desktop tools only; not needed in the native app. |

Fix (not new): checked toggle inside a label stayed grey (D-21).

## Icons (`scripts/build-icons.mjs`)
| Icon | Why |
|---|---|
| `tablet`, `syrup`, `eye-drops`, `ointment-tube`, `inhaler` | Medicine forms Tabler doesn't have (approved 2026-10-09). |
| `face-id` | Returning-doctor unlock (approved 2026-10-12). |

## Screen patterns in approved doctor-app screens (not yet components)
Built with local styles in `projects/truemeds-doctor-portal-prototype/ui-screens/`:
- **Sign-in layout:** brand-subtle blue top with logo and heading, white panel with 24px rounded top for the form
  (sign-in, OTP, returning unlock).
- **Inline notices** in four tones (info, warning, error, success) that replace the field helper line; no toasts.
- **Faster sign-in option card:** icon tile, title, description, checkbox on the right, whole card tappable.
- **Info notice** (`.tm-notice--info`), used for "number not registered".
