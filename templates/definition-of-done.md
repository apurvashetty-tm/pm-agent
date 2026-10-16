# Definition of done — checklist template (any work)

Copy this before starting a PRD, document, prototype, screen set or analysis. Fill it in,
get Apurva's OK, then build and review against it. Rule: `AGENTS.md` → "Definition of done".

## 1. What this covers
- Work item: …
- Sources the checklist is built from (rules, templates, decisions): …
- Out of scope (decided, so nobody raises it later): …

## 2. Approved exceptions (do not flag)
- …

## 3. Checklist
Each line is pass/fail. **auto** = a script checks it; **eye** = a reviewer checks it.

| # | Check | Source | How |
|---|---|---|---|
| 1 | … | … | auto / eye |

Starter lines by type (keep what applies, add the rest from the sources):
- **PRD:** follows `templates/lean-prd-guide.md`; product what/why only, "how" left to
  Engineering as open questions; every requirement testable; Truemeds funnel terms
  ("attempted", "connected") used exactly; metrics defined with source; each open
  question has an owner; nothing said twice.
- **Document / brief:** audience and purpose stated; every claim sourced or marked
  [UNVERIFIED]; one idea per section; plain words; no AI tells; length fits the use.
- **Screens / prototype:** `design-system/RULES.md` §8–10 and the project's decisions;
  every state covered (loading, empty, failed, offline, busy, outcome, disabled,
  read-only, long content); template: `design-system/templates/standards-checklist.md`.
- **Analysis:** question stated; data source and date range named; numbers computed in
  code, not estimated; assumptions listed; conclusion follows from the numbers.

## 4. Coverage
List every item the work must contain (sections, screens × states, metrics…). Nothing
missing, nothing duplicated.

## 5. Evidence record
`<item> × <checklist line> × pass/fail`, plus reviewer replies and open exceptions.

## 6. Finish line
Every line passes · reviewers report no blockers · Apurva approves. Then frozen:
new findings are a **bug** (fix where it occurs) or a **next-version idea** (log it).
