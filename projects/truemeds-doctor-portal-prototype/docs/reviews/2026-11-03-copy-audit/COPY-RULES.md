# Copy rules — doctor portal (DRAFT for Apurva's approval, 2026-11-03)

**What this is:** the standard every piece of text in the app is written and checked against. It covers messages, button labels, titles, sheet text, helpers, toasts and call scripts. It collects the copy rules already decided (D-48, D-65, D-77, D-81) and writes down the pattern the current text mostly follows. It also checks them against the published writing guides of Atlassian, Shopify Polaris, Apple HIG and Material Design (sources at the end).
**Once approved:** it moves into `docs/feedback-rules.md` as "§11 Copy rules". The mechanical rules (marked ⚙) are added to `check-sources.mjs`. Every round's audit uses this list.

## A. Voice
1. **Plain and short.** Everyday words and one idea per sentence. A notice has at most 2 sentences, and a field helper has 1.
2. **Front-load the point.** Say the fact first, then the reason or what's kept. Write "Couldn't confirm. Nothing was lost.", not "Unfortunately, the confirmation could not be completed…".
3. **Who is who:** "you" is the doctor, "the patient" is the patient, and "we" / "our" is Truemeds. *(Audit item: entry screens say "We couldn't send the code." while the case screens say "Couldn't confirm." Pick one way.)*
4. **Calm and neutral.** No "sorry", no "please" (outside spoken scripts), no "error", no exclamation marks ⚙, and no blame ("You ended the call…" states a fact, coaching only where it changes behaviour). Atlassian's reasoning: "sorry" makes an error feel worse, and "please" makes a required step sound optional.
4a. **Use contractions** ("couldn't", "you're"), the way people talk.

## B. What a message says
5. **A message doesn't repeat a button (D-65).** Say what happened and what is safe or kept. Give an instruction only when no control on screen does it, to explain why a button is blocked, or to add timing.
6. **Failure pattern:** "Couldn't [verb] [the thing]." plus what's kept or why. Name what failed and be specific. If the real reason isn't known, don't invent one (Atlassian). The fix is the button on screen (rule 5), so the message doesn't spell it out (Apple: don't explain a clear button).
7. **Waiting lines:** a verb ending in -ing, then "…", no full stop ⚙ ("Getting call result…", "Waiting for the call to end…").
8. **No internal numbers or system words.** Never show the gate seconds, partner names, codes or "leg 2" (D-58).
9. **One style per element type, and the same words for the same thing (Apple: build language patterns).** One situation gets one wording on every screen it appears on (e.g. 15 and B3 share keys, D-81).

## C. Labels and titles
10. **Buttons:** start with a verb, sentence case, no full stop, 1–3 words ("Request next case", "Confirm & forward", "Call again"). Fixed product names stay as they are (Callback, Skip HA, View Rx).
11. **Titles (screens, sheets, cards):** a noun phrase or plain statement, sentence case, no full stop ⚙ ("Schedule callback", "Forwarded to Health Advisor").
12. **Toasts:** a short past fact, no full stop ⚙ ("Time added"). *(Audit item: "New code sent." has a full stop.)*

## D. Terms (glossary)
13. **case** = the doctor's unit of work; **order** = the patient's purchase ("Order details", "No medicines on this order", D-48 / D-77).
14. **Health Advisor** is always written in full in text. "HA" is used only in the Skip HA button.
15. **Doctor Ops** is the support team the doctor calls. *(Audit item: "our Ops team" in the empty case is a placeholder until OQ-035.)*
16. **prescription**, **medicine** (not "drug" or "item"), **callback** (one word), **availability**.

## E. Punctuation and format ⚙
17. Curly apostrophes and quotes, and the "…" character (D-81).
18. **No dashes in UI text.** Dashes are allowed only inside spoken call scripts.
19. **Numbers in digits** ("4-digit code", "1 try left"), with singular and plural handled ("1 medicine").
20. Sentences end with a full stop. Labels, titles, toasts and waiting lines don't (rules 7, 11, 12).

## F. Call scripts (spoken to the patient)
21. First person, quoted, at most 2 sentences, polite ("Please stay on the line"). They must be true for the route the case is on: never promise a transfer on a forward.

## Sources checked
- Atlassian Design System: writing error messages (1–2 sentences, no "sorry", no "please", don't invent a reason, avoid technical detail).
- Shopify Polaris: content fundamentals and error messages (plain language, say what's wrong and what to do, be specific, no toasts for errors).
- Apple Human Interface Guidelines: Writing (language patterns, one style per element type, verb buttons, don't explain a clear button).
- Material Design 3 writing, as summarised in public UX-writing skills (sentence-case buttons, no full stops on buttons, contractions, no exclamation marks).
- Grafana UX writing guide (numerals in UI text).
