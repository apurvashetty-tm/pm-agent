# Project South — Mixed-City Brainstorm
**Date:** 2026-09-29 (narration Entry 8)
**Mode:** Brainstorm. Not final.
**Context:** v2 routes each South pincode to one language. That breaks in mixed cities, where one pincode has customers speaking many languages. Swapnil wants mixed cities handled, not excluded.

---

## 1. The problem in mixed cities
In a single-language area (e.g. rural Tamil Nadu), pincode → Tamil is a safe guess. In a mixed city it isn't:

| City | Rough language picture *(qualitative, to be validated with data)* |
|---|---|
| Bangalore | Highly mixed: Kannada, Tamil, Telugu, Hindi, Malayalam, English. Many migrants. |
| Hyderabad | Telugu plus Hindi/Urdu (Dakhini) widely spoken. Largely bilingual. |
| Chennai | Tamil dominant, with English and some Telugu/Hindi |
| Kochi | Malayalam dominant, with English widely used |

In a mixed city, routing by pincode to a single language will often pick the wrong one.

---

## 2. First question: how big is the mixed-city gap?
- **Bangalore was excluded from the sizing ("ex-Blr"), so we don't know whether Bangalore even has a gap.**
- Hyderabad, Chennai and Kochi are *inside* the "South ex-Blr" numbers. They may be driving the gap or diluting it.
- **Ask Analytics for:** discard % split into Bangalore / Hyderabad / Chennai / Kochi / rest-of-South (tier 2–3 and rural), FTC and NFTC, each vs Non-South.

**Hypothesis:** the gap is largest in **tier 2–3 and rural South**, where Hindi/English is least common. Mixed cities may have a smaller gap because customers there more often manage in Hindi or English. If that's true, mixed cities are **second priority**, and the pilot should start in single-language areas.

---

## 3. Mixed isn't yes/no, it's a spectrum
Treat every pincode as a **language mix**, e.g. {Kannada 35%, Tamil 20%, Hindi 20%, Telugu 15%, …}, instead of a single language.

| Pincode type | Example | Routing idea |
|---|---|---|
| **Single-language**: top language ≥ threshold (e.g. 70%) | Rural TN | Route to doctors who speak that language (v2 as-is) |
| **Bilingual**: top two languages cover ≥ threshold | Hyderabad | Prefer doctors who speak **both**, else either |
| **Multilingual**: no small set covers most people | Parts of Bangalore | Pick the doctor who covers the **most of the mix** (§4, idea C) |

Single-language routing is just the simplest case of this model. **One design can handle all three.**

---

## 4. Ideas (divergent)

### A. Leave mixed cities on normal routing
- Zero effort. Works if §2 shows no gap there.
- Risk: leaves whatever gap exists in those cities unsolved.

### B. Pincode-level mapping inside cities
- Cities aren't uniform. Some localities are dominated by one language (e.g. Tamil-heavy or Telugu-heavy pockets in Bangalore, Urdu-heavy parts of old Hyderabad).
- Route only the pincodes inside the city that pass the threshold; the rest go to normal routing.
- Low effort: the same table as v2, just filled in more carefully.

### C. Language mix + doctor "coverage score"
- Each pincode stores its **language mix with shares**.
- Each available doctor gets a **coverage score** = total share of the pincode's languages they speak.
- **Assign the highest-coverage doctor available.**

Example for a Bangalore pincode {Kannada 35, Tamil 20, Hindi 20, Telugu 15, Malayalam 10}:

| Doctor | Speaks | Coverage |
|---|---|---|
| A | Kannada, Hindi, English | 55% |
| B | Tamil, Telugu, English | 35% |
| C | Hindi, English | 20% |

→ A first, then B, then C.

- Uses only the multi-language doctor tagging that's already in scope. **No customer language needed.**
- Single-language pincodes work the same way: a Tamil speaker gets 100% coverage there. **One rule for all of South.**
- **Open point:** English is shared by almost all doctors, and a share of urban customers can manage in it. Count it as a small baseline, or leave it out of the score?

### D. City "language set" pool (a simpler version of C)
- Define a required set per city:
  - Hyderabad = {Telugu, Hindi}
  - Bangalore = {Kannada, Hindi} or {Kannada, Tamil, Hindi}
  - Chennai = {Tamil}
  - Kochi = {Malayalam}
- Doctors who speak the whole set are preferred; doctors who speak part of it come next.
- Easier to explain and run than scores, but less precise.

### E. Learn the mix from past outcomes
- We already know each past order's pincode, the assigned doctor's languages, and whether the call confirmed.
- For each pincode, compare **confirm % by doctor language**. Where Tamil-speaking doctors confirm much better, the pincode is effectively Tamil-leaning.
- This can **bootstrap the mix from historical data before launch**, then keep improving after launch.
- It gives each pincode a data-backed mix without asking customers anything.

### F. Where do the language shares come from?
- Census language data is usually published at **district / sub-district level**, not pincode, so it has to be mapped to pincodes *(to validate)*.
- Idea E (our own order outcomes) is the sharper, Truemeds-specific source.
- Ops or field knowledge can correct known pockets.

### G. Things from future scope that would help most in mixed cities (flag only)
- **Customer's own language** is the most accurate signal, and mixed cities are exactly where it pays off.
  - **Question:** pull a *light* version (the app's language setting, or the language that worked on the customer's last confirmed call) into scope for mixed cities only?
- **Hand-over after a mismatch:** mixed cities would produce the most mismatches, so this is where it would help most.

### H. Doctor call opening line (Ops idea, no build)
- Doctors open with a short multilingual greeting and ask which language the customer is comfortable in.
- This spots a mismatch in seconds. It doesn't fix routing, but it's worth a note in doctor training.

---

## 5. Knock-on effects to think through
- **Doctors who speak many languages become the bottleneck.** A Kannada + Tamil + Hindi doctor is valuable everywhere.
  - Who gets them first? **Single-language (rural) orders**, because those customers have no fallback language. Mixed-city customers more often manage in Hindi/English.
- **Hiring profile changes for mixed cities:** look for doctors who speak 3 or more languages, not a specific single language.
- **Fallback:** if no high-coverage doctor is free, use normal routing. This is more acceptable in mixed cities than in rural areas (to validate).
- **Measurement:** report mixed cities as a **separate group** in the pilot, so a good rural result doesn't hide a weak city result, or the other way round.

---

## 6. Options by effort
| Effort | Option |
|---|---|
| Zero | A — leave on normal routing (only if §2 shows no gap) |
| Low | B — pincode-level mapping inside cities; D — city language set |
| Medium | C — language mix + coverage score (one rule for all of South); E — learn the mix from past orders |
| Future | G — customer's own language / hand-over |

**Direction worth exploring:** C, seeded with E, covers single-language and mixed pincodes with one rule. It uses only what's in scope (doctor languages + pincode data).

---

## 7. Questions for Swapnil
1. Can we get the discard gap split by Bangalore / Hyderabad / Chennai / Kochi / rest-of-South? It decides whether mixed cities go in the pilot or come after.
2. Is a coverage score (C) acceptable in complexity, or do you prefer the simpler city language set (D)?
3. Should single-language (rural) orders get first claim on doctors who speak many languages?
4. Is it OK to pull a light customer signal (app language setting / last successful call language) into scope for mixed cities only, or does it stay future?
5. How should English count: part of the coverage score, or a fallback only?
