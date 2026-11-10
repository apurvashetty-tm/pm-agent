# Doctor app PRD — structure and done-checklist (for approval)

**Status:** approved by Apurva, 6 Nov 2026 (title "Truemeds For Doctors - App_PRD"; drafted in this thread). Q1 and Q2 were not answered at approval, so working defaults are used: measures marked Proposed with baselines `[NEED]`; old-PRD items raised as open questions.
**Writes only in:** `docs/prd/`. Reads (frozen): `ui-screens/` (pictures, README), `ui-screens/app-logic.md`, `docs/feedback-state-map.md`, decision log up to D-92, `calling-flow/data.js`, `ui-screens/feedback/messages.json` (copy). Background only: `docs/Doctor_Portal_Developer_PRD.md` (8 Oct, outdated), `project_truth.md`, `open_questions.md`, `COPY-ANNEX.md`.

## 1. What this PRD is

- **Readers:** the app team (React Native), Backend, Ops and leadership. Someone who wasn't in the room.
- **Job:** the product truth for the launch release: what each screen is for, what the doctor can do, the rules that must hold, and what's still open, with owners. The "how" stays with Engineering (their spec and the test cases are derived from this PRD later, D-79).
- **Shape (D-79 + lean PRD guide):** main screens, the job of each, one picture per screen, other states as text with their exact message.
- **Launch = Fallback B** for Pilot. Version A is a short "Later" annex.
- **Not a copy of app-logic.** Body states each rule in plain words once; detail stays in the linked pictures, app-logic and the calling-flow page.

## 2. Files in `docs/prd/`

| File | What |
|---|---|
| `PRD.md` | The PRD (pictures linked from `ui-screens/`, 390 wide, no copies) |
| `CHECKLIST.md` | This checklist, with the pass/fail evidence filled in |
| `TRACE.md` | Review aid, not for readers: each PRD rule → its source (app-logic §, decision, picture id). Keeps D-numbers out of the body |
| `check-prd.mjs` | The auto checks below |
| `reviews/` | `CODEX-BRIEF.md` (written in this thread, run by Apurva in the terminal), Codex report, merge notes |

## 3. Proposed structure of `PRD.md`

| § | Section | What goes in | Main source |
|---|---|---|---|
| 0 | Header | Status, version, owner, links: prototype, calling-flow page, pictures | — |
| 1 | Executive summary | 4–5 sentences: what, why, what's open | whole doc |
| 2 | The problem | Today's portal and dialler flow; the 2–3 numbers that matter (marked `[NEED]` where unconfirmed, e.g. OQ-029) | `reference/current-portal-screenshots/`, project_truth §2 |
| 3 | What we're building | The approach and the deliberate choices, one line of why each: doctors request cases · click-to-call via the telecom partner, ended on the phone · 50 s gate proved by the backend · final button chosen by case type, never by the doctor · one Pilot flow (B) · no adding medicines, no quantity edit, no price · OTP + fingerprint / Face ID sign-in | project_truth §3–5 |
| 4 | How it works | One short paragraph (a Cat4 case from Request next case to Prescription confirmed), the calling-flow overview picture and the link to the live calling-flow page. Every calling state, trigger and button lives on that page only | calling-flow page |
| 5 | Screen by screen | See §3a. The bulk of the doc | pictures, app-logic, state map |
| 6 | Rules on every screen | Errors / offline / loading pattern, busy states, copy standard, phone layout, session and availability ending. Short, with links | feedback-state-map, RULES §8–9 |
| 7 | Settings | **One table** of every product number (not prototype values) as a setting with an owner: 50 s gate, min availability, 3-min result timeout, record wait time, retry gaps and attempts, ₹20 per confirmed prescription | app-logic, D-83 |
| 8 | User stories | Doctor, Ops, Health Advisor. Short first-person lines | — |
| 9 | Scope in / out | "Out" names what people will assume is in: version A, calling inside the app, pushed cases, Wallet, Help / bell contents (blank placeholder), Profile redesign, bottom tab bar | project_truth §1, backlog §4b |
| 10 | Decided vs open | Decided: short list pointing to each rule's home section. Open: every open OQ + D-83 engineering items, as questions with **owner in brackets**. Working default: polling, labelled | open_questions, backlog §4 |
| 11 | How we'll know it worked | Primary success event + vital few metrics, each with definition and data source; the four final outcomes tracked apart (D-50); release rate and Patient unavailable rate per doctor; unproven-confirm mismatch table | D-50, D-80, D-83 |
| A | Annex: Later — version A | Live-call Confirm & transfer (11, 12, 8b), in one page | app-logic §5–6 |
| B | Annex: copy changes | The decided copy fixes (from `COPY-ANNEX.md`); `messages.json` stays the source | D-84 |
| C | Change log | Empty until sign-off | — |

### 3a. Section 5, screen by screen

Every screen uses the same short block, led by its job:
1. **Job to be done:** what the doctor is trying to get done here (from app-logic §1 and the Home scope of 12 Oct). The most important line of the block.
2. **Built this way because:** one to three lines tying the main design choices to that job (e.g. OTP: the doctor taps Verify, no auto-submit). Current reasons only, no rejected options.
3. **Picture:** one, 390 wide. The state number appears only in the caption and link.
4. **What the doctor can do** · **Rules** · **Other states** (one line each: when → what the doctor sees, message text verbatim; not for calling, see below) · **Open** (OQ links).

| § | Screen | States |
|---|---|---|
| 5.1 | Sign-in | 12 |
| 5.2 | OTP | 17 |
| 5.3 | Faster sign-in offer | 6 |
| 5.4 | Returning unlock | 7 |
| 5.5 | Home: availability, add time, end, Profile | 22 |
| 5.6 | Case page before the call: ready, loading, failed, empty case, Leave / Release | from case 62 |
| 5.7 | Calling: Cat4 and Pilot with HA skipped (→ Prescription confirmed) | from case 62 |
| 5.8 | Calling: Pilot launch flow (Confirm → HA check → transferred or forwarded; 16, 17 Skip HA) | from case 62 |
| 5.9 | Ending without a prescription: Callback, Patient unavailable, Release (one home for the three) | from case 62 |
| 5.10 | Prescribe, incl. the full **medicine-type table** (form · unit · dose options · printed-line examples: regular, SOS only, + SOS) | 23 |
| 5.11 | Rx viewer and notes | from case 62 |

**Calling sections (5.7–5.9) are short:** job, built-this-way lines, the outcome rules, one picture, then "every state: see the calling-flow page" (live, latest version). No list of calling states in the PRD. The calling rules themselves (50 s gate, final button by case type, an unproven confirm isn't confirmed, Fallback B) are still stated once, in their home section, because they are the requirements reviewers comment on.

**Prototype-only values stay out** (app-logic §11): test mobile numbers, OTP test codes, mock timers and earnings in pictures, the sample doctor, demo / review mode. They belong to the engineering spec and test cases. §7 holds only product settings.

### 3b. Where writing is free and where it's fixed

- **Fixed (checked):** every rule, number, copy string, picture and open item must trace to the frozen inputs. Nothing invented; conflicts surfaced, not blended.
- **Free:** wording of the problem, choices, summary and stories; grouping of states; which picture best represents a screen; diagrams.

## 4. Done-checklist

**auto** = `check-prd.mjs` · **eye** = reviewer.

| # | Check | How |
|---|---|---|
| **Lean guide** | | |
| 1 | Sections match §3 above; nothing extra, nothing missing | auto |
| 2 | Executive summary alone tells a business reader what, why and what's open | eye |
| 3 | No "how": no endpoints, schemas, polling intervals, state machines | eye |
| 4 | Said once: every number appears only in §7; the three key rules (50 s gate, final button by case type, an unproven confirm isn't confirmed) are fully stated once | auto + eye |
| 5 | No AI tells or banned words (guide list) | auto + eye |
| 6 | No D-numbers, rejected options or brainstorm residue in the body | auto |
| 7 | Every open item has an owner in brackets; nothing unconfirmed written as fact; working defaults labelled | eye |
| **Truemeds terms** | | |
| 8 | "case", never "order", for the doctor's unit of work (customer order ID line excepted) | auto |
| 9 | "attempted" / "connected" used as Truemeds defines them (attempted = patient answered) | eye |
| 10 | Telecom partners named once in §3 and in vendor-directed open questions; "the telecom partner" elsewhere | auto |
| **Fidelity to frozen inputs** | | |
| 11 | Every quoted on-screen string is verbatim from `messages.json` | auto |
| 12 | Every picture path exists in `ui-screens/` | auto |
| 13 | Every rule traces in `TRACE.md` to app-logic, a decision ≤ D-92, the state map or `data.js`; latest decision wins | auto (no untraced rule) + eye |
| 14 | Fallback B is the launch Pilot flow; version-A screens appear only in Annex A | auto + eye |
| 15 | Calling: no list of calling states in the PRD; nothing in the PRD contradicts the calling-flow page | auto + eye |
| 16 | Every open OQ and every D-83 engineering item is in §10 or named out of scope | auto |
| 17 | No prototype-only values (app-logic §11); §7 holds product settings only | auto + eye |
| 18 | State numbers (1, 3, 7d, B1…) appear only in picture captions and links, never as a state's name in the text | auto |
| **Coverage** | | |
| 19 | Every screen in app-logic §1 has its block, opening with its job to be done | auto |
| 20 | Every design choice named in "Built this way because" traces to that screen's job | eye |
| 21 | Every one of the 148 states maps in `TRACE.md` to a PRD section or to the calling-flow page | auto |
| 22 | Each case type's outcome is stated: Cat4 · Pilot HA skipped (customer / system) · Pilot HA skipped by the doctor · Pilot HA required | eye |
| 23 | Medicine-type table covers every form in app-logic §8 | eye |
| 24 | Every requirement in the 8 Oct PRD is in this PRD, in "Out", or raised to Apurva (see Q2) | eye |
| **Metrics** | | |
| 25 | Primary success event + vital few, each defined with a data source; missing baselines marked `[NEED: … (owner)]` | eye |
| **Review and hygiene** | | |
| 26 | Codex review in the terminal, once, on the full draft, with the `review-prd` rubrics (P0 / P1 / P2): zero P0 after the merge; only valid points adopted, doubts flagged; open P1s listed. Claude's final check against this checklist is the second pass | Codex + eye |
| 27 | Pictures render in the markdown viewer | eye |
| 28 | Only `docs/prd/` changed; `app/` and `ui-screens/` untouched | auto (git) |

**Finish line:** every line passes, reviewers report no blockers, Apurva approves. Then frozen: new findings are bugs or next-version ideas. Confluence only on "sync".

## 5. How it runs once approved

1. `TRACE.md` skeleton and `check-prd.mjs` first (state ids, OQ list, screen list from the frozen files).
2. Draft `PRD.md` in one pass, section by section.
3. Auto checks → `reviews/CODEX-BRIEF.md` written here → Apurva runs Codex once in the terminal and says when it's done → this thread merges the valid points in one pass.
4. Final check here against this checklist (second pass) → full PRD in the side panel, with only pointed questions.

This thread is the brain: it brainstorms with Apurva, writes the briefs, judges reviewer findings and records decisions. The terminal does the heavy runs.
5. Commit `docs/prd/` only, on the project branch (the build thread's files are left alone).

## 6. Questions for Apurva

- **Q1 · Primary success event.** Proposal: *confirmed prescriptions per available doctor-hour*, with *share of requested cases that end confirmed* and *time from Request next case to the case's outcome* as the vital few. Do you agree, and may I pull today's baselines from Mixpanel (connected), or mark them `[NEED]` for Doctor Ops?
- **Q2 · Old PRD items no decision covers.** The 8 Oct PRD proposed Case rejection (a clinical "I won't prescribe this" path), structured Diagnosis / Allergy fields and a pre-submit prescription review. No decision since mentions them. List them under "Out — not in this release", or raise them as open questions?
- **Q3 · Name.** Proposal: title "truemeds for doctors — PRD (launch release)", and "the doctor app" in the text (the "Doctor Portal" name was dropped). OK?
- **Q4 · Who drafts.** Draft `PRD.md` in this thread (my default), or brief the terminal to draft it from this plan and keep this thread for judging and merging?
