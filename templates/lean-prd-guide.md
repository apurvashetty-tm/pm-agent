# Lean PRD guide (Truemeds · Product)

*How to write a product-focused PRD that reads clean and human — not a bloated, jargon-heavy spec. Applies to **any** PRD. A build with an external vendor or partner is just one case, not the default — plenty of PRDs have no vendor at all.*

*Seed version — we'll keep improving this.*

## The one rule

State the **what, the why, and the non-negotiable constraints**. Leave the **how** — schemas, queries, integration plumbing, sequencing — to Engineering, as Open Questions / Dependencies. If a sentence is telling engineers *how to build it*, it probably doesn't belong in the body.

## A lean skeleton (adapt it; drop what a given PRD doesn't need)

1. **Executive summary** — the hallway version, 3–5 sentences.
2. **The problem** — the pain, plus the two or three numbers that matter. Not a data dump.
3. **What we're building** — the approach, and the 3–4 deliberate choices that shape it, each with one line of *why*.
4. **How it works** — one subject, start to finish, on the clean path; one diagram. Keep branches and failures out of here.
5. **The journey / edge behaviour** *(only if the thing has retries, waiting, states, stop conditions)* — the branches §4 left out.
6. **User stories** — the few human actors, as short first-person lines, not a persona grid.
7. **Scope — in / out.** The "out" list does real work: name what people will *assume* is included but isn't.
8. **Decided vs open** — the two-bucket split below.
9. **How we'll know it worked** — the vital few metrics and the one primary success event.
10. **Annexure — suggestions** *(optional)* — good ideas that are explicitly *not* this build.

Not every PRD needs 5 or 10. A small change might be 1–4 plus 7–9.

## The two-bucket honesty split (section 8)

- **Decided (Bucket 1)** — things we simply choose. Write them as firm statements; nobody outside vetoes them.
- **Open, confirm-first (Bucket 2)** — things we're *betting* are true but haven't confirmed with whoever owns them (another team, infra, legal, or a vendor). Write these as questions with an **owner in brackets**, never as facts.

Writing a Bucket-2 bet as though it's decided is how a PRD loses trust — it might turn out impossible.

## Small moves that keep it honest and clean

- **Working default + open question.** When you must assume something to give engineering a target, state it as a clearly-labelled *working default* and put the real decision in Open Questions, cross-referenced. Own the contradiction; don't hide it.
- **Inline `[Assumption — see §X]` tags** on any step in the flow that rests on an unconfirmed bet.
- **"Accepted, not blocking"** — a short list, kept separate from Open Questions, for things you know are imperfect but consciously accept.
- **Numbers are starting values.** Any specific figure (a threshold, a cap) is a value to set and validate, not hardcoded — say so, and name who sets it.

## Voice

Short sentences. Concrete nouns. Plain words a business reader gets on the first read. No "leverage / robust / scalable / seamless", no meta-scaffolding ("this section describes…"). Write for an external reader.

## Deliberately leave OUT of the body

Glossaries, RACI charts, NFR taxonomies, decision-log tables with "options considered" columns, milestone entry/exit tables, exhaustive edge-case matrices, and schema / DDL / state-machine diagrams. If Engineering wants an implementation contract, that's *their* companion doc, not this one.

## If — and only if — there's an external vendor or partner

Many PRDs have none; skip this section when that's the case. When one exists:

- Name the vendor **once**, up front; then use a generic role ("the vendor", "the provider") in the body, so the doc isn't coupled to them and survives a vendor change.
- Keep the **real names in the vendor-directed open questions** — those are literally the questions you'll send them, so naming them makes the questions actionable.
- State requirements as *your* constraints ("no personal data leaves our side"), not as the vendor's quirks — that way they hold even if the vendor changes.

## Process

Markdown is the source of truth; rendered formats (Confluence) are generated from it. **Present → debate → agree → then edit** — brainstorm before drafting. Never sync to Confluence/Atlassian unless explicitly told "sync".

---

*This guide is the lean, product-first method. The heavier `workflows/core/create-prd` flow still exists for when a full, workflow-driven PRD run is explicitly wanted — but prefer this for new PRDs by default.*
