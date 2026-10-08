# Lean PRD guide (Truemeds · Product)

*How to write a product-focused PRD that reads clean and human — not a bloated, jargon-heavy spec. Applies to **any** PRD. A build with an external vendor or partner is just one case, not the default — plenty of PRDs have no vendor at all.*

*v2 · 23 Sep 2026. Adds plain words, say-it-once, handling review edits and versions, AI tells and a pre-send check, from the AI-led Lead Qualification review.*

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
8. **Decided vs open** — the split below.
9. **How we'll know it worked** — the vital few metrics and the one primary success event.
10. **Annexure — suggestions** *(optional)* — good ideas that are explicitly *not* this build.

Not every PRD needs 5 or 10. A small change might be 1–4 plus 7–9.

## Decided vs open (section 8)

- **Decided** — things we simply choose. Write them as firm statements; nobody outside vetoes them.
- **Open, confirm first** — things we're *betting* are true but haven't confirmed with whoever owns them (another team, infra, legal, or a vendor). Write these as questions with an **owner in brackets**, never as facts.

Writing an open bet as though it's decided is how a PRD loses trust — it might turn out impossible.

## Small moves that keep it honest and clean

- **Working default + open question.** When you must assume something to give engineering a target, state it as a clearly-labelled *working default* and put the real decision in Open Questions, cross-referenced. Own the contradiction; don't hide it.
- **Inline `[Assumption — see §X]` tags** on any step in the flow that rests on an unconfirmed bet.
- **"Accepted, not blocking"** — a short list, kept separate from Open Questions, for things you know are imperfect but consciously accept.
- **Numbers are starting values.** Any specific figure (a threshold, a cap) is a value to set and validate, not hardcoded — say so, and name who sets it.

## Voice

Short sentences. Concrete nouns. Plain words a business reader gets on the first read. Lead with the point, then the reason. Write for an external reader: someone who wasn't in the room. Test: could a reader from outside the team explain each sentence back to you?

## Words the reader already knows

- Use the names the company already uses (FTC, Assign Order queue, Hold, dispositions). Don't rename them for the doc.
- A new term earns its place only if it's used several times. Define it in one line where it first appears, or drop it.
- No coined labels ("Bucket 2", "in flight", "Outcome-unknown-parked") and no metaphors ("the prize sits on both sides of the ledger"). Say the plain thing.
- Abstract claims get a concrete example. "Built to extend beyond carts" drew "not clear"; "the same setup can later call customers who uploaded a prescription but didn't order" would not have.
- If a reviewer asks "what does this mean?", the sentence failed. Rewrite it; don't just explain it in a reply.

## Say it once

- Every rule, number and decision lives in one section, its home. Elsewhere, point to it ("see §6"). Don't restate it.
- The executive summary is the only place allowed to repeat, and only as a one-line version.
- Lists of settings, states or rules appear once. If you catch a second list of the same things, merge them.
- Before sending, pick your three most important rules and search for each. More than one full statement means cut.

## Brainstorming, review edits and changes after sign-off

**First publish: no brainstorming in the doc.** Rejected options, "we considered X" and exploratory notes stay in the project's `DESIGN_JOURNAL.md`. The first version reviewers see states the current plan, with one line of why for each choice.

**In review: show your changes.**
- When you edit in answer to a comment, show the change in the body (strike through the old text, add the new) and reply in the comment thread with what changed.
- Resolved open questions can stay visible, struck through with their answer, so the reviewer can confirm them.
- When the review round closes and the doc is signed off, clean all of this up. The signed-off version reads clean.

**After sign-off: locked, changed by version.**
- Any change bumps the version (v1.0 → v1.1) and updates the body to the new truth. No strikethroughs in a locked doc.
- A short **change log** at the end has one row per change: version, date, what changed, why, and who approved it.
- Small fixes (wording, typos) get a change-log row only. Changes that alter what gets built (scope, a rule, a number) also go back to the affected reviewers or engineers before the version counts as agreed.

**Meeting notes with vendors or partners** stay out of the PRD body. The body carries only the decision that came out of a call, with a link to the notes doc.

## AI tells to cut

These make a doc read as generated. Cut or rewrite on sight.

- **Setup sentences.** "Three things matter here", "Four choices shape the whole thing, and each is deliberate", "One tension worth naming up front". Just state the things.
- **"Not X, it's Y" framing** when nobody claimed X.
- **Groups of three for rhythm** ("fast, simple, and reliable") when only one is true or matters.
- **Bold on every line.** Bold only what a skimmer must not miss; a few per section at most.
- **Dashes for drama.** Use a full stop or a comma.
- **Hedges and filler.** "essentially", "in order to", "it's worth noting", "at the end of the day".
- **Banned words.** leverage, robust, scalable, seamless, delve, landscape, synergy, streamline, cutting-edge, holistic, empower, unlock, game-changer.
- **Meta-scaffolding.** "This section describes…", "Below we outline…".
- **Made-up facts.** Never invent numbers, vendor behaviour or quotes. Use `[NEED: data from X]`, or put it in Open with an owner.

## Deliberately leave OUT of the body

Glossaries, meeting notes, RACI charts, NFR taxonomies, decision-log tables with "options considered" columns, milestone entry/exit tables, exhaustive edge-case matrices, and schema / DDL / state-machine diagrams. If Engineering wants an implementation contract, that's *their* companion doc, not this one.

## If — and only if — there's an external vendor or partner

Many PRDs have none; skip this section when that's the case. When one exists:

- Name the vendor **once**, up front; then use a generic role ("the vendor", "the provider") in the body, so the doc isn't coupled to them and survives a vendor change.
- Keep the **real names in the vendor-directed open questions** — those are literally the questions you'll send them, so naming them makes the questions actionable.
- State requirements as *your* constraints ("no personal data leaves our side"), not as the vendor's quirks — that way they hold even if the vendor changes.

## Before you send

- [ ] Every section earns its place; anything this PRD doesn't need is gone.
- [ ] No sentence tells engineering *how* to build it.
- [ ] Every term is one the reader already uses, or is defined once.
- [ ] Each rule and number appears in one place only.
- [ ] No brainstorming residue. If this is a signed-off version, no strikethroughs or resolved notes, and the change log is updated.
- [ ] The "AI tells" list above finds nothing.
- [ ] Every open item has an owner in brackets; nothing unconfirmed is written as fact.
- [ ] Read the executive summary alone: does a business reader know what, why and what's still open?

## Process

Markdown is the source of truth; rendered formats (Confluence) are generated from it. **Present → debate → agree → then edit** — brainstorm before drafting. Never sync to Confluence/Atlassian unless explicitly told "sync".

---

*This guide is the lean, product-first method. The heavier `workflows/core/create-prd` flow still exists for when a full, workflow-driven PRD run is explicitly wanted — but prefer this for new PRDs by default.*
