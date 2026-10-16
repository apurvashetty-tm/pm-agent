# <Project> — screens standards checklist (template)

Copy into `projects/<project>/docs/reviews/<date>-standards-checklist.md`, add the project's own
decisions (section 7), get Apurva's OK, then build and review against it. Rules: `RULES.md` §8–10.
**auto** = checked by the project's guard script on every captured state (360 / 390 / 430);
**eye** = checked by Claude's self-audit and the reviewer on contact sheets.
A state passes only when every line that applies passes.

## Approved exceptions (do not flag)
- Approved labels / proper nouns that keep capitals: …
- Inline links inside a sentence are exempt from the 48px target (WCAG 2.5.8).
- Disabled controls are exempt from contrast (WCAG 1.4.3).
- Mock OS keyboard and pictures of documents are exempt.

## 1. Layout
| # | Check | How |
|---|---|---|
| 1.1 | Side margin 24 on every block (§8.2) | auto |
| 1.2 | Gaps between blocks 8 / 16 / 32 (48 home-base hero); component internals keep their specs | eye |
| 1.3 | No horizontal overflow | auto |
| 1.4 | No clipped or hidden text; content scrolls | auto |
| 1.5 | Page surface: step screens white; work screens grey page with white cards; nothing loose on grey | eye |
| 1.6 | Main button placement (§8.4) | eye |
| 1.7 | ≥16px between inline button and keyboard; pinned bar steps aside while typing | auto / eye |

## 2. Type and copy
| # | Check | How |
|---|---|---|
| 2.1 | Four text levels only (§8.1); components keep their sizes | auto |
| 2.2 | Nothing under 14px except tags and L4 fine print; 9–11px never | auto |
| 2.3 | Titles: no full stop, balanced wrap | auto |
| 2.4 | Sentence case for buttons, titles, labels, sheet titles | auto |
| 2.5 | Formats (§9.7) | eye |
| 2.6 | Product vocabulary used exactly (project glossary) | eye |
| 2.7 | Copy matches the project's copy source; proposed copy marked | auto |
| 2.8 | Mock data consistent | eye |

## 3. Buttons (§9.1)
| # | Check | How |
|---|---|---|
| 3.1 | Only primary · secondary · quiet · destructive · call end · inline link | auto |
| 3.2 | At most one primary per screen or sheet | auto |
| 3.3 | Order: primary → secondary → quiet | eye |
| 3.4 | One height per group (56 action / 48 compact); nothing 40 / 32 | auto |
| 3.5 | Pairs equal width, no icons, one line at 360 | auto |
| 3.6 | Destructive is a red outline; solid red only for ending a live call | auto |
| 3.7 | Busy primary (L2); quiet in progress is text only | auto |
| 3.8 | Quiet role for leave / cancel / dismiss | eye |

## 4. Tap targets and accessibility (§8.6, §9.8)
| # | Check | How |
|---|---|---|
| 4.1 | Every tappable ≥ 48 × 48 | auto |
| 4.2 | Text contrast ≥ 4.5:1 (3:1 at 24px+) on its real background | auto |
| 4.3 | Icon-only buttons have accessible names | auto |
| 4.4 | Visible focus ring | eye |
| 4.5 | Field errors linked to their field | auto |
| 4.6 | Notices, toasts, status changes announced | auto |
| 4.7 | Sheets modal; focus inside; returns to trigger | auto |
| 4.8 | Status never by colour alone | eye |

## 5. Components (§9)
| # | Check | How |
|---|---|---|
| 5.1 | Sheets on the one template | auto |
| 5.2 | Reason lists use option rows | eye |
| 5.3 | Free chips wrap, never squeezed | auto |
| 5.4 | Grid chips one size per screen | auto |
| 5.5 | Status tags by meaning, width reserved | auto |
| 5.6 | Chevron only when tappable; read-only rows muted | auto |
| 5.7 | Status card for task outcomes | eye |
| 5.8 | Toast only where nothing on screen can show the result; dark, 14/20 | auto |
| 5.9 | One message per cause | eye |
| 5.10 | Header types per §8.5 | eye |
| 5.11 | No local restyling of central components | auto |
| 5.12 | Components identical to the design-system preview and across screens | eye |
| 5.13 | Every interactive component's states appear somewhere in the coverage | eye |

## 6. Journeys, safety and content
| # | Check | How |
|---|---|---|
| 6.1 | Each journey's states follow the state map; no dead ends; contact sheets by journey | eye |
| 6.2 | Irreversible or work-losing actions ask first | eye |
| 6.3 | Errors visible without scrolling; nothing typed or chosen is lost | eye |
| 6.4 | Every error / notice says what happened and what to do next | eye |
| 6.5 | Stress content: long names, long lists, empty optional fields | eye |
| 6.6 | Compared with the last approved finals: every change traces to a line or decision | eye |

## 7. Project decisions
| # | Check | How |
|---|---|---|
| 7.x | <one line per locked project decision> | eye / auto |

## 8. Coverage
| # | Check | How |
|---|---|---|
| 8.1 | Every state in the coverage matrix captured at 390 and 360 (+430 guards) | auto |
| 8.2 | No console / page errors or missing files | auto |

**Out of scope unless the project opts in:** dark mode · text enlargement (native) · animation (native) · real tap-through testing (prototype stage).
