# CEO Discussions — Claude Rules

## What this is
A recurring workspace for preparing meetings with the CEO. It is **not** a single
project or a build. It is a container: each CEO discussion lives in its own dated
subfolder, and this top level holds the rules, the index, and the running record
of decisions that span meetings.

This is not a throwaway scratchpad and it is not a public artifact. Everything
here is prep material and post-meeting record for real executive conversations.

---

## Folder model

```
ceo-discussions/
  CLAUDE.md            ← this file (how any CEO discussion gets prepped)
  README.md            ← index of every discussion + status + decision taken
  decisions-log.md     ← running ledger of CEO decisions/commitments across ALL meetings
  _template/           ← copied for each new meeting
  YYYY-MM-DD-<topic>/  ← one folder per discussion
```

### Per-meeting folder (copy `_template/`)
- `brain-dump.md` — raw source material / inputs, kept verbatim. Never edit for polish.
- `agenda.md` — objective + flow + the ask.
- `prep.md` — impact scorecard + **verification checklist** (numbers to lock before the meeting).
- `talking-points.md` — the tight spoken narrative, in order.
- `decision-brief.md` — options, trade-offs, and the exact decision requested.
- `outcomes.md` — filled **after** the meeting: decision taken, action items, follow-ups.

Name folders `YYYY-MM-DD-<short-topic>` so they sort chronologically and match the
repo's archive convention.

---

## The non-negotiable rule: no unverified number in front of the CEO

Brain dumps arrive full of approximate figures. Before any number appears in
`prep.md`, `talking-points.md`, or `decision-brief.md`:

- If confirmed against real data → present it plainly.
- If not yet confirmed → mark it `[VERIFY]` and keep it in the verification checklist,
  not in the spoken narrative, until locked.
- Pull real numbers via authorized data access (tm-chotu skills / Metabase / Mixpanel).
  Never invent, round-up, or "make it look better." A wrong number in front of the
  CEO costs more than a missing one.

Carry the source's own hedges through — "approximate", "conservative", denominator
and period caveats — do not silently harden an estimate into a fact.

---

## Prep principles (exec altitude)
- **Impact first, history second.** Lead with measurable outcomes, not project logs.
- **One decision per meeting.** Know the single decision being asked for and drive to it.
- **Two proof stories, not ten.** Depth on one or two; everything else goes to a
  scorecard or appendix unless the CEO asks.
- **No defensive framing.** State impact; do not justify the pod's existence.
- **Separate what is decided from what is open.** Use the decision labels below.

---

## Decision labels
- `[LOCKED]` — decided, present as fact.
- `[VERIFY]` — number/claim not yet confirmed against data; cannot be presented until locked.
- `[RECOMMENDED]` — best current suggestion, open to override.
- `[OPEN DECISION]` — needs the user's (or CEO's) call before it is treated as truth.

---

## Workflow for a new discussion
1. Copy `_template/` to `YYYY-MM-DD-<topic>/`.
2. Drop raw inputs into `brain-dump.md`.
3. Derive `agenda`, `prep`, `talking-points`, `decision-brief` from it.
4. Route every number through the verification rule above.
5. After the meeting, fill `outcomes.md` and append the decision to `decisions-log.md`.
6. Update `README.md` index status.

---

## After any work here
- Update `README.md` (status of the meeting worked on).
- If a meeting produced a decision, append it to `decisions-log.md`.
- Reusable company/system facts belong in root `knowledge/`, not here.
