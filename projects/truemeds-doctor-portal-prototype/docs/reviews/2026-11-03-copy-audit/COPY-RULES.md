# Copy rules — doctor portal (v2.1, approved by Apurva 2026-11-03, D-84; v2.1 = main-thread clarifications after the copy round)

**What this is:** the standard every piece of text in the app is written and checked against: messages, button labels, titles, sheet text, helpers, toasts and call scripts. It collects the copy rules already decided (D-48, D-65, D-66, D-77, D-81, D-83) and writes down the pattern the current text mostly follows. It is checked against the published writing guides of Atlassian, Shopify Polaris, Apple HIG and Material Design (sources at the end). Where this standard is stricter than those guides, it is marked **(local)**.
**v2:** revised after Codex's critique (`codex-report.md`, 2026-11-03).
**Where it applies:** `docs/feedback-rules.md` §11 points here. Rules marked ⚙ get script checks and ◐ get warnings in `check-sources.mjs`, added during the prototype build (D-84).
**Users:** doctors in India, on mobile, often mid-call. Many read English as a second language.

## A. Voice
1. **Plain and short.** Everyday words, one idea per sentence. **Default:** a notice has at most 2 sentences and a field helper has 1 ◐. Longer is allowed only as an approved exception, never by cutting a needed consequence or coaching line. Approved exceptions: `call.transferMissedDoctor` (D-83), `signin.notRegistered`.
2. **Front-load the point.** Fact first, then the reason or what's kept ("Couldn't confirm. Nothing was lost.").
3. **Who is who, in app-to-doctor text:** "you" is the doctor, "the patient" is the patient, "we" / "our" is Truemeds. **Spoken scripts** are doctor-to-patient: "I" is the doctor and "you" is the patient (rule 26).
4. **Calm and neutral.** No "sorry" and no "please" outside scripts, because "sorry" makes an error feel worse and "please" makes a required step sound optional (Atlassian). No "error" or "failed", no exclamation marks ⚙, no blame. Coaching is allowed only where it changes behaviour.
5. **Use contractions** ("couldn't", "you're").

## B. What a message says
6. **True to the current state (Codex).** Promise an outcome, kept data or timing only when the app's state and agreed behaviour support it. "Saved", "confirmed", "forwarded" and "transferred" mean different things and aren't swapped.
7. **The message and the controls together explain recovery.** The message says what happened and what is kept; the button on screen is the fix, so the message doesn't repeat it (D-65, **local** — Atlassian and Polaris put the fix in the message, Apple says don't explain a clear button). Give an instruction only when no control does it, to explain why a button is blocked, or to add timing. Naming what failed ("Couldn't confirm.") is not a repeat (D-66 C).
8. **Failed operation:** "Couldn't [verb] [the thing]." plus what's kept or why. **Field validation** states the required correction ("Enter all 10 digits."); a **server verdict** on what the doctor entered may simply name it ("Wrong code.", D-81). Be specific; if the real reason isn't known, don't invent one (Atlassian).
9. **No internal details.** Never show gate seconds, partner names, internal status codes or system terms like "leg 2" (D-58). Verification codes (OTP) are fine.
10. **One style per element type, same words for the same thing** (Apple: build language patterns; 15 and B3 share keys, D-81).

## C. Element types (each has its own form)
11. **Progress line** (something is happening): a verb ending in -ing + "…", no full stop ⚙ ("Getting call result…"). **Status line** (a standing state): short phrase, may end in "…" if live ("On call…").
12. **Action buttons:** start with a verb, sentence case, no full stop ⚙, usually 1–3 words ◐ ("Request next case", "Confirm & forward"). **Answer buttons** reply to a question on screen ("Still talking" / "Call ended", D-77). **Navigation** ("Back to Home"). Fixed names stay (Callback, Skip HA, View Rx, **Unavailable** — a verb-first label doesn't fit the half-width button at 360).
13. **Titles** (screens, sheets, cards): a noun phrase, task or question in sentence case; no full stop ⚙, question mark when it's a question ("Leave this case?").
14. **Toasts:** short, no full stop when it's a fact fragment ⚙ ("Time added"); a full sentence when it gives guidance (the back-blocked toast, D-77).
15. **Empty states:** say what's empty and, if there is one, the next step or timing ("No cases right now. Try again in a minute.").
16. **Confirmation sheets:** the title asks the question, the body says the consequence, and the buttons name both choices ("Release case" / "Stay").
17. **Placeholders** are examples, never the label or an instruction; a visible label always exists.

## D. Terms (glossary)
18. **case** = the doctor's unit of work; **order** = the patient's purchase (D-48 / D-77).
19. **Health Advisor** in full in text; "HA" only in the Skip HA button ◐ (allowlist).
20. **Doctor Ops** = the support team the doctor calls. **prescription**, **medicine** (not "drug" or "item"), **callback** (one word), **availability**.

## E. Punctuation, numbers, fit ⚙
21. Curly apostrophes and quotes (also around scripts), and the "…" character (D-81). **No dashes between clauses** in UI text (allowed inside spoken scripts); hyphens in words ("4-digit") and ranges are fine.
22. **Numbers in digits** with singular / plural handled ("1 medicine"); dates as "Today" / "Tomorrow" / "3 Nov", times as "3:00 PM" (callback sheet), countdowns as "m:ss" ("0:30", the app's existing format).
23. Sentences end with a full stop; progress lines, labels, titles and fragment toasts don't (rules 11–14).
24. **Fits at 360 px and at large text size:** no truncated buttons or medicine names (at large text a two-up button row may stack — a build rule, not a copy change); whole strings in `messages.json` (no sentences built from pieces), with plural variants as separate keys.

## F. Accessibility
25. A button's accessible name matches its visible label; icon-only buttons have a name ("Back", "Help"). Field errors are tied to their field; progress and result messages are announced to screen readers.

## G. Call scripts (doctor-to-patient, spoken)
26. First person, in curly quotes, at most 2 sentences, polite ("Please stay on the line" is fine). True for the route the case is on: never promise a transfer on a forward.

## Sources checked
- Atlassian Design System — writing error messages (1–2 sentences, no "sorry" / "please", don't invent a reason, say what to do).
- Shopify Polaris — content fundamentals and error messages (plain language, what's wrong and what to do, specific, no toasts for errors).
- Apple Human Interface Guidelines — Writing (language patterns, one style per element type, verb buttons, don't explain a clear button).
- Material Design writing (sentence-case buttons, no full stops on buttons, contractions, hyphens and ranges allowed).
- Codex critique, 2026-11-03 (`codex-report.md`).
