# Brief — Deep audit of the entry + Home screens, whole screen (Claude + Codex: review, cross-critique, conclude)

Folder: the project folder (project branch). Evidence: this folder. **Aim: 1.5–2 hours. Pictures and reports only — change no app, kit, PRD, decision-log or design-system file.**

## Why
The band audit (`docs/renders/2026-11-11-band-audit/CONCLUSION.md`) fixed only the blue band. Apurva wants the **whole screen** audited: these are standard screens every app has, and today there is no single standard for the components below the band either. Go deeper than the band audit, and compare with how the industry does these screens.

## Screens in scope (every state, 390 × 844 and 360 × 640)
Sign-in, OTP, faster sign-in offer, returning unlock, Home (setup / available / near expiry / ending / ended / offline / failures / add-time sheet / end-confirmation), using **Home v3** (`docs/renders/2026-11-11-home-v3/`) for Home and the band spec from the band audit. Sheets and the Profile page only where they open from these screens.

## Inputs
- `RESEARCH.md` here (live web research by the main thread: Material / layout spacing, phone sign-in, OTP, biometric offer, unlock — with sources).
- `design-system/RULES.md`, `design-system/src/components.css`, `ui-screens/app-logic.md` §1–3, `docs/feedback-state-map.md`, decisions D-36, D-40, D-42–D-47, D-61, D-64, D-81, D-93, D-101, D-104, D-105 in `docs/context/decision_log.md`.
- The band audit's `CONCLUSION.md` (treat the band spec as agreed unless you find a real problem with it).

## Measure first (shared facts)
Reuse the band audit's capture tool (`docs/renders/2026-11-11-band-audit/tools/capture.py`). For **every element below the band** record: component used (class), size, type (size / line / weight / colour), gap to the element above, side alignment, tap target, and where the main action sits. Write `measure.json` and one sheet per screen with the gaps drawn on (`measure-<screen>.png`).

## What to judge (both reviewers, the same list)
1. **One standard across screens:** the same thing looks and is spaced the same everywhere — field + label + helper, notices (top vs in the bar), primary / quiet buttons, the pinned bar, icon tiles (unlock and offer hero), links (Change, Resend, Terms), small print. List every difference: deliberate (with the decision) or drift.
2. **Gaps:** every vertical gap is 8 / 16 / 32 or a component's own spec; nothing reaches the bar on small phones (§8.14).
3. **Type:** four levels + L9, one weight per role, nothing under 14 that the doctor acts on.
4. **Industry check, per screen:** what the research says a good version of this screen does (e.g. OTP: autofill, countdown, resend cap, where the code went; sign-in: country code separate, "we'll send a code by SMS"; offer: right after the first sign-in, convenience wording, Set up / Not now; unlock: prompt opens automatically, fallback after failures) — **does ours do it, and if not, is that a decision or a gap?** Don't reopen approved decisions unless the research shows a real problem.
5. **Words:** every title, subtitle, label, button and notice: plain, consistent vocabulary across the screens (availability, cases, OTP, faster sign-in), one line where it should be.
6. **States:** each screen's states all keep the same layout (nothing jumps), and every state the research expects exists (or a decision says why not).

## Rounds
1. **Two independent reviews** — `claude-review.md` (you) and `codex-review.md` (Codex, read-only, prompt through stdin, measure sheets + shots attached with `-i`; it gets the facts, the research and the rules, **not** your review).
2. **Cross-critique** — Codex on yours (`codex-on-claude.md`), you on Codex's (`claude-on-codex.md`), point by point; say where you were wrong.
3. **Conclude** — one more Codex pass on what is still disputed (`codex-final.md`), then `CONCLUSION.md`:
   - **the screen standard** (a short spec for components below the band, building on the band spec),
   - a per-screen table of changes (or "no change"), each tagged *drift fix* / *industry gap* / *needs Apurva*,
   - remaining disagreements (both views, one line each),
   - **Needs Apurva**: as few, plain yes/no questions as possible.
4. **Show it** — `after-<screen>.png` for each screen with the agreed changes applied (inject CSS / copy at capture time as the band audit did; token guard on any CSS), plus one `before-after.png` overview.

## End
Append `DONE screens-audit` (or `STOPPED screens-audit: …`) to `docs/runs/STATUS.md`, publish this folder and STATUS with `bash ../../scripts/publish.sh -m "..." <files>`, stop.
