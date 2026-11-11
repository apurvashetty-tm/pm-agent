## 1 Differences

**Recommend one compact band, with a 16px logo-to-title gap everywhere.** Today’s differences mostly follow separate decisions; they are not all implementation mistakes.

All current measurements below come from `measure.json`; copy widths come from `text-widths.json`. Proposed dimensions use the cited design-system rules.

| # | Difference | Screens and measured values | Verdict and why |
|---|---|---|---|
| 1 | Logo → title | Sign-in and approved Home: **48px**. OTP, offer, unlock and Home v3: **16px**. | **DELIBERATE RULE:** D-46/L6 and §8.3 versus D-81 F8 and the agreed Home v3 direction. Separate decisions now conflict with the desired uniformity. |
| 2 | Header actions | Home/Home v3: bell, help, profile; **48px targets**, last glyph **16px** from edge. Auth screens: none. Header row remains **41px**. | **DELIBERATE RULE:** D-42’s Home actions. These serve signed-in navigation and should remain an allowed variant. |
| 3 | Fixed title wrapping | Approved Home setup, active and expired-pending: **2 lines** at both sizes. Other fixed titles: **1 line**, except offer. | **DELIBERATE RULE:** approved copy with balanced wrapping, L8. It nevertheless creates visibly different band heights. |
| 4 | Offer changes with phone width | “Skip the OTP next time”: **1 line at 390**, **2 at 360**; panel **173 → 213px**. | **DRIFT:** the resulting fingerprint-tile misalignment with unlock defeats D-81 F8 at the smaller size. |
| 5 | OTP subtitle box | OTP: **48px**; all others: **20px**, despite identical **14/20** text. | **DRIFT:** the inline “Change” link inherits a standalone target height. §8.6 explicitly allows inline links without that minimum. |
| 6 | Subtitle available width | Sign-in: **318px** at both sizes. Others: **358/328px**. | **DRIFT:** Sign-in’s `31ch` cap adds an unnecessary width rule. Current copy fits, so it is latent rather than visible wrapping. |
| 7 | Subtitle emphasis | OTP mixes secondary text, a primary-colour medium-weight number and a brand-colour semibold link. Others are secondary regular text. | **DELIBERATE RULE:** D-44’s destination number and Change action; source styles supply the emphasis. Preserve this semantic difference. |
| 8 | State-specific wording | Offer changes subtitle for fingerprint, Face ID and screen lock. Home changes title/subtitle by setup, active, ending and ended state. | **DELIBERATE RULE:** D-61/D-64 device copy and approved Home state mapping. Meaning should vary; spacing should not. |
| 9 | Home jumps when stopping | Approved Home panel: **245px**, then **205px** in stop-pending because its title becomes one line. | **DRIFT:** an incidental consequence of copy length, with no task reason for the panel to jump. |
| 10 | Overall blue-band depth | At 390: **173/201/205/245px**, or **20.5–29%** of height. At 360: **173/201/205/213/245px**, or **27–38.2%**. | **DRIFT in the combined experience:** the accumulated effects above, not another independent spacing rule. |

**Already identical:** logo position/size, band colour, title typography/left edge, title → subtitle gap, subtitle typography/base colour, subtitle → panel gap, panel radius, panel padding and panel → first-content gap. No other measured state introduces a geometry difference.

## 2 One band spec

These are **recommendations requiring approval**, not changes to the locked references.

| Part | One specification | Token / authority |
|---|---|---|
| Band background | Existing light blue | `--tm-surface-brand-subtle` |
| Side margins | **16px**, shared by title, subtitle and panel content | `--tm-space-page` |
| Logo top | **16px** | `--tm-space-lg` |
| Logo size | **166px wide**, automatic height, approximately **41px** | §8.13/A-07; approved artwork. No existing logo-width token—retain the documented exception rather than inventing one. |
| Header row | Logo’s intrinsic height, approximately **41px**; consistent with or without actions | Artwork-derived geometry; no separate height token |
| Logo → title | **16px** | `--tm-space-lg` |
| Title | **32/40px, 600**, primary colour; **one line** for fixed copy; balanced wrapping | `.tm-text-title-lg`, `--tm-content-primary`; L8 |
| Title → subtitle | **8px** | `--tm-space-sm` |
| Subtitle | **14/20px, 400**, secondary colour; **one line** for supplied fixed copy | `.tm-text-body-md`, `--tm-content-secondary` |
| Subtitle box | Natural **20px** line box; no extra minimum height | `--tm-font-lineheight-sm` |
| Subtitle → white panel | **32px**; this is the band’s bottom padding | `--tm-space-2xl` |
| Panel top corners | **24px** | `--tm-radius-2xl` |
| Panel top padding | **32px** to the first content box | `--tm-space-2xl` |
| Panel background | White | `--tm-surface-primary` |

**Derived default panel top: 173px** = 16 + 41 + 16 + 40 + 8 + 20 + 32. Use content flow, not a fixed band height or percentage.

**ALLOWED VARIANTS**

- **Home actions:** retain the existing icon layout, **48px** targets (`--tm-target-min`) and **16px** glyph edge. Targets may extend beyond the logo row without increasing its height.
- **OTP inline content:** retain number emphasis and the blue Change link (`--tm-content-brand`). Remove its height-producing inline-flex/min-height treatment; retain visible keyboard focus and its action.
- **Device-specific offer subtitle:** fingerprint, Face ID or screen lock wording; same type and spacing.
- **Long doctor names:** allow a balanced second title line without truncating the name or shrinking type. This adds **40px**, making the panel top approximately **213px** [derived from the proposed spec].
- **Text enlargement or unusually long content:** allow natural wrapping and scrolling. One-line copy is a default-size acceptance criterion, not clipping or `nowrap`.

**Rules to amend:** replace L6’s Sign-in **48px** with the shared **16px** rule through an explicit amendment to **D-46**. Update §8.3’s home-base hero-gap sentence and §8.13’s reference to it; reconcile D-81 F8 and the Home v3 “Sign-in keeps 48” assumption. Keep L8’s balanced wrapping.

## 3 Per screen

| Screen | Change to meet the spec |
|---|---|
| Sign-in, all states | Gap **48 → 16px**; remove the subtitle’s `31ch` cap. Panel **205 → 173px**. |
| OTP, all states | Make Change a true inline link without the **48px** minimum height. Subtitle box **48 → 20px**; panel **201 → 173px**. No Back button. |
| Faster sign-in offer, all states | Shorten title to **“Skip OTPs next time”**. At 360, panel **213 → 173px**, restoring alignment with unlock’s fingerprint tile. |
| Returning unlock, all states | **No geometry change** for the supplied name. Allow the long-name variant. |
| Approved Home, all states | Gap **48 → 16px**; replace setup/active bands with the v3 pair; shorten the ended title. All supplied default bands resolve to **173px**, including stop-pending. |
| Home v3 setup | **No change.** |
| Home v3 available | Change title and subtitle to the pair below; **no geometry change**. |

For Home, setup wording covers setup-wheel, setting, setup-failed, idle-expired and manually-ended. Available wording covers the active/request/add-time/error variants and the band behind confirmation sheets. Stop-pending and expired-pending retain distinct status wording.

## 4 Titles and subtitles

“1/1” means one line at **390/360**. Supplied candidate widths verify the proposed fixed copy unless marked estimated.

| Screen | Current title/subtitle lines | Title I’d ship | Subtitle I’d ship | Proposed lines |
|---|---|---|---|---|
| Sign-in | 1/1 · 1/1 | **Welcome, Doctor** | Your partner in thoughtful, affordable care. | Both 1/1 |
| OTP | 1/1 · 1/1; subtitle box inflated | **Verify your number** | Sent to +91 98765 43210 · **Change** | Both 1/1 |
| Offer: fingerprint | 1/2 · 1/1 | **Skip OTPs next time** | Use your fingerprint instead of waiting for an OTP. | Both 1/1 |
| Offer: Face ID | 1/2 · 1/1 | **Skip OTPs next time** | Use Face ID instead of waiting for an OTP. | Both 1/1 |
| Offer: screen lock | 1/2 · 1/1 | **Skip OTPs next time** | Use your screen lock instead of an OTP. | Both 1/1 |
| Returning unlock | 1/1 · 1/1 for Kunal | **Hello, Dr. Kunal** | Let’s check in on your patients today. | Both 1/1; long-name exception |
| Home setup, replacing approved setup | Approved: 2/2 · 1/1; v3: both 1/1 | **Start taking cases** | You can add time or stop anytime. | Both 1/1 |
| Home available, replacing approved active | Approved: 2/2 · 1/1; v3: both 1/1 | **You can take cases** | Request a case now, or whenever you’re ready. | Both 1/1 |
| Home expired-pending | 2/2 · 1/1 | **Availability ended** | You won’t get new cases. | Both 1/1 |
| Home stop-pending | 1/1 · 1/1 | **Ending availability** | You won’t get new cases. | Both 1/1 |

Face ID and screen-lock subtitles already fit in `measure.json`; they are not new estimates.

**The story works:** welcome → verify identity → offer a quicker return → start work. Returning unlock supplies recognition before Home supplies the work action. Its “your patients” phrase is slightly less precise for a shared case pool, but does not justify another copy change in this band audit.

**Setup → available is the strongest pair:** “Start taking cases” → “You can take cases.” The subtitle carries **now** and explains that requesting remains the doctor’s choice. The title measures **289.4px**, fitting both widths; Apurva’s full “You can take cases now” measures **361.6px** and fits neither. Avoid “You’re taking cases,” which can imply a case is already underway. D-36’s internal state name can remain **Taking cases**.

Keep pending-request explanations in their existing notices. Idle-expired and manually-ended return to the setup pair, with their outcome notice; they should not inherit the expired-pending title.

## 5 Task headers

Profile and the case page use compact task headers and do **not** need to match this logo band.  
Prescribe uses an edit header with **Close**, and sheets use their own title/Close template—not universally Back + title (§8.5/§9.4).

## 6 Questions for Apurva

1. Approve **16px everywhere**, replacing Sign-in’s locked 48px gap?
2. Approve the copy above, especially **“You can take cases” / “Request a case now, or whenever you’re ready.”**?

Read-only review completed; no files changed.
