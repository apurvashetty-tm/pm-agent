## Point by point

Measurements below come from `measure.json`; candidate copy widths from `text-widths.json`. Proposed changes are judged against the rules and decisions listed in `codex-prompt.txt`.

| Claude point | Verdict | Why |
|---|---|---|
| **2 D1 — Logo → title** | PARTLY | The measured split and recommendation are sound. D-61 changed logo placement, not automatically L6’s spacing; Sign-in’s 48 remains locked until explicitly amended. |
| **2 D2 — OTP subtitle height** | PARTLY | Correct: the inline-flex Change link inflates the subtitle to 48 and adds 28 to the band. A 48-high padded inline hit area is optional under §8.6 and needs bounds/focus verification before being prescribed. |
| **2 D3 — Two-line titles** | PARTLY | Wrapping measurements are correct. Approved Home copy with L8 wrapping is an existing approved treatment, not established drift; the offer’s small-phone wrap does conflict with F8 tile alignment. |
| **2 D4 — Band height** | PARTLY | Correct derivation. But “every band is 173” applies only to default one-line content; Claude’s own name variant makes it 213. The current 360 offer is also 213. |
| **2 D5 — Header icons** | AGREE | Home-only actions retain 48 targets without growing the measured 41-high logo row. Preserve this functional variant. |
| **2 D6 — Different implementations** | PARTLY | The source implementations differ. Calling that the cause of D1 is unsupported: D1 follows explicit decisions. A shared band is a reasonable build recommendation, not a measured visual defect. |
| **2 D7 — Sign-in subtitle cap** | PARTLY | Current copy fits, but this is still a distinct width constraint: 318 versus 358/328 elsewhere. Remove it explicitly in the per-screen plan if standardising widths. |
| **3 — Surface and padding** | AGREE | Existing surface and proposed 16 top/sides, 32 bottom match the cited tokens and compact-band geometry. |
| **3 — Logo and header row** | AGREE | Preserve 166-wide artwork and its measured 41-high row; keep actions from enlarging it. |
| **3 — Logo → title 16** | AGREE | A coherent recommendation for uniformity, subject to changing locked L6 and the Sign-in working assumption. |
| **3 — Title specification** | PARTLY | Keep L1 and balanced wrapping. “One line at 360” should be a default-copy acceptance check, not a universal rendering restriction. |
| **3 — Title → subtitle 8** | AGREE | Already consistent and token-backed. |
| **3 — Subtitle specification** | PARTLY | L3 and the natural 20-high line box are right. Preserve OTP’s number/link emphasis; do not require the optional enlarged inline target as part of this spec. |
| **3 — Subtitle → panel 32** | AGREE | Already consistent under A-05. |
| **3 — Panel specification** | AGREE | Radius 24, top padding 32 and sides 16 match measurements and rules. |
| **3 — Result: panel top 173** | PARTLY | Correct as a derived default. Use content flow rather than fixing panel position. |
| **3 V1 — Home icons** | AGREE | Functional variation with unchanged band geometry. |
| **3 V2 — Long names** | PARTLY | Allow wrapping without truncating the name or shrinking type. The supplied Raghavendra example needs two lines at 360; that does not prove every possible name fits two. |
| **3 — No other variant** | DISAGREE | Device-specific offer subtitles and OTP inline emphasis are legitimate variants. State wording must also change even when geometry remains constant. |
| **3 — Rule changes** | PARTLY | Amend L6/D-46 and §8.3; also reconcile §8.13’s spacing reference and Home v3’s “Sign-in keeps 48” assumption. D-61 already superseded D-42’s logo distribution. |
| **3 — Why 16 everywhere** | PARTLY | Saving 32 on Sign-in is valid. Having the same anatomy supports consistency, but does not itself invalidate a deliberately larger welcome gap. |
| **4 — Sign-in** | PARTLY | Gap and panel changes are correct. Also remove the `31ch` subtitle cap identified in D7. |
| **4 — OTP** | PARTLY | Correct target geometry: subtitle 20, panel 173. Prefer the permitted inline-link treatment; any retained 48 hit area needs verification. |
| **4 — Offer** | PARTLY | Shortening fixes the 360 wrap and restores F8 alignment. “Or accept an exception” conflicts with the proposed fixed-copy rule and reopens that alignment problem. |
| **4 — Returning unlock** | AGREE | No geometry change for Kunal; retain natural long-name wrapping. |
| **4 — Approved Home** | PARTLY | Correct direction, but “ended titles” is too broad. Only `expired-pending` uses the ended title; `idle-expired` and `manually-ended` use setup wording. |
| **4 — Home v3 setup** | AGREE | Already meets the proposed compact geometry and copy. |
| **4 — Home v3 available** | AGREE | The proposed copy fits both widths without changing geometry. |
| **5 — Sign-in pair** | AGREE | Both strings fit both widths; the greeting and supporting line work together. |
| **5 — OTP pair** | AGREE | Both fit; the problem is subtitle-box layout, not copy length. Keep the destination emphasis and Change action. |
| **5 — Offer pair** | AGREE | “Skip OTPs next time” measures 303.4 and fits both. Existing device-specific subtitles should remain explicit variants. |
| **5 — Unlock pair** | AGREE | Works for the supplied name; long-name handling remains necessary. |
| **5 — Setup pair** | AGREE | “Start taking cases” and its reassurance fit both widths and establish the next action. |
| **5 — Available pair** | AGREE | “You can take cases” measures 289.4; the subtitle measures 305.6. Both fit and retain Apurva’s intended permission/readiness story. |
| **5 — Ending pair** | AGREE | Existing “Ending availability” already fits; apply specifically to `stop-pending`. |
| **5 — Ended pair** | PARTLY | “Availability ended” fits and preserves meaning, but belongs to `expired-pending`, not every state following expiry or a manual stop. |
| **5 story — Sign-in → OTP → offer → Home** | AGREE | A clear progression from entry to verification, optional faster return and work setup. |
| **5 story — Unlock → Home** | PARTLY | Works when Home opens in setup. The story should also allow the available pair when availability remains active. |
| **5 story — Setup → available** | AGREE | Moving “now” into the subtitle preserves the intended story. “Taking cases now” is a weaker alternative because it can suggest work is already underway; D-36 does not require that title. |
| **5 story — Available → ending → ended** | PARTLY | The wording is coherent for pending-stop/expiry states. It is not the universal transition: `manually-ended` and `idle-expired` return to setup wording. |
| **6 — Task headers need not match** | PARTLY | Correct conclusion. Distinguish compact task headers, Prescribe’s edit/Close header and sheet title/Close templates rather than treating them as one header type. |
| **6 — Shared margins and radii** | DISAGREE | The 16 margin is shared; “panels and cards already use 24 radius” is too broad. The measured 24 here describes the main panel, not every card or task surface. |
| **7 Q1 — Approve Sign-in 16** | AGREE | Necessary because L6 is locked; clearly identify the rule amendment. |
| **7 Q2 — Offer wording or wrap** | PARTLY | Valid copy decision, but explain that retaining the wrap also retains the F8 alignment defect at 360. |
| **7 Q3 — Available and ended copy** | AGREE | A useful approval request. Name `expired-pending` explicitly so “ended” is not applied to the wrong states. |

## Missing or wrong

- **Home mapping needs to be explicit.** `measure.json` and `home-reference.js` agree:
  - Setup title: `setup-wheel`, `setting`, `setup-failed`, `idle-expired`, `manually-ended`.
  - Available title: `active`, `requesting`, `no-cases`, `request-failed`, `offline`, `near-expiry`, `add-wheel`, `adding`, `add-failed`, `added`, `end-confirmation`, `unknown-result`.
  - `stop-pending`: **“Ending availability”**, panel top **205**.
  - `expired-pending`: **“Your availability has ended”**, panel top **245**.
  
  Consequently, “Home’s other states all match” needs this exception, and the screenshot labelled “Home ended” does not establish that all ended states use an ended title.

- **OTP has a deliberate visual difference beyond height.** The number uses primary colour/medium weight; Change uses brand colour/semibold. A uniform band should preserve those semantic distinctions.

- **The offer’s wrap breaks a specific approved relationship.** At 360 its panel starts at **213**, versus unlock’s **173**. This matters because D-81 F8 requires the fingerprint tiles to align—not merely because one title has two lines.

- **The specification needs a safe-area reference.** D-101 defines the logo’s top offset from the safe area. The capture’s **16** from screen top should not become an instruction to ignore device insets.

- **The enlarged OTP link is a proposal, not verified evidence.** Claude correctly identifies the height cause, but supplies no rendered proof that its replacement preserves the claimed target, focus outline and spacing.

## Net: where Claude's review should change

Keep the compact **16-gap** recommendation and proposed copy. Correct the Home state mapping, distinguish approved treatments from drift, make **173 a derived default**, and preserve semantic/device variants. Amend the complete rule chain, remove the subtitle-width cap explicitly, and simplify or verify the OTP link treatment.

Read-only review; no files changed.
