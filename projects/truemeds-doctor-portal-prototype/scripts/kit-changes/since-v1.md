# CHANGES

**What changed since the kit you started from (10 November 2026, "kit v1").** This kit replaces it. Read this page first: if you have built a screen from v1, the rows below are all you need to change. Nothing else moved.

**How to read it.** **Must** = behaviour, rule or wording: build it. **Looks** = spacing or size only. **No work** = a file or part was renamed. Before / after pictures: [`changes/`](changes/). Exact wording differences are in the table at the end.

**Status:** draft for product approval. Rows C1–C7, H8, H9, P2 and P3 (and Add time greyed under 15 minutes in H4) are built and wait for the product owner's OK.

**Same as v1:** the number and names of the states (149), every design value (no token added, removed or changed), and the calling flow.

**Using an AI coding tool?** Give it this file and say: "Apply every Must and Looks row to the screens we already built; use `screens/<screen>.json` in this kit for the values."

## Every screen

| # | Change | Kind |
|---|---|---|
| A1 | Gaps are measured between what the eye sees (text, shapes, borders), never layout boxes: **8** joins parts of one thing, **16** separates items in a group, **32** separates different things. Tap areas and empty message lines add no visible space. | Looks |
| A2 | Sheets: the subtitle sits 8 under the title, inside the header. Header to content is a visible 16. | Looks |
| A3 | The keyboard never covers the focused field or the main button: the field and button scroll into the space above it, the button at least 16 clear. | Must |
| A4 | One band for sign-in, OTP, faster sign-in offer, unlock and Home: logo 16 from the top · logo to title 16 · title to subtitle 8 · subtitle to panel 32. | Looks |

## Sign-in

| # | Change | Kind |
|---|---|---|
| S1 | Wording: "We’ll send you an OTP by SMS."; "Couldn’t send the OTP." | Must |
| S2 | Field and helper, then 32, then Send OTP. A result notice sits 16 under the field and 32 above Send OTP. | Looks |
| S3 | "Sign up" is a link with a 48 tap area that adds no height. | Looks |
| S4 | Opened from unlock ("Use OTP instead", or three failed unlocks): the number is filled in; no SMS is sent until Send OTP. | Must |

## OTP

| # | Change | Kind |
|---|---|---|
| O1 | Spacing: boxes (message 8 under) · 32 · Resend line · 32 · legal line · 8 · Verify. The message line takes no space when empty, so Verify moves down by one line when a message shows. | Looks |
| O2 | "Change", "Resend code" and "call Doctor Ops" are inline links with a 48 tap area. | Must |
| O3 | "New code sent." | Must |

## Faster sign-in offer

| # | Change | Kind |
|---|---|---|
| F1 | Shown after an OTP sign-in while faster sign-in is off, **up to 3 times in total** (setting `fasterOfferMax`; "not available" counts). v1: once. | Must |
| F2 | Title "Skip OTPs next time"; first point "Sign in with one touch" (Face ID "with a glance", screen lock "with your PIN or pattern") and "No SMS to wait for."; point titles semibold. | Must |
| F3 | Tile to points 32, points 16 apart. | Looks |

## Returning unlock

| # | Change | Kind |
|---|---|---|
| U1 | Two buttons: Unlock and Use OTP instead. "Not you? Switch account" is removed. | Must |
| U2 | The phone's unlock prompt opens by itself once when the app opens here; cancelling leaves the screen as it is; Unlock retries. The automatic prompt counts as a try. | Must |
| U3 | Three failed tries do the same as Use OTP instead (S4). | Must |
| U4 | Tile to caption 8. | Looks |

## Home and Profile

| # | Change | Kind |
|---|---|---|
| H1 | Setup: "Start taking cases" / "You can add time or stop anytime."; Quick picks, then Custom (the wheel, always shown); "Available until {time}" 8 above Set availability. "Adjust duration", "Minimum 15 minutes" and the count are gone from setup. | Must |
| H2 | **10 hours in total** (set and added; setting `availabilityMaximum`). v1: no maximum. The wheel stops at 15 minutes and 10 hours and swipes and snaps. | Must |
| H3 | Available: "You can take cases" / "Request a case now, or whenever you’re ready."; one card with Time remaining and Prescriptions written today. | Must |
| H4 | **Add time always shows** while available (greyed offline, and when less than 15 minutes fit under the 10 hours). v1: only near the end. | Must |
| H5 | Prescriptions written today opens Profile. | Must |
| H6 | Add time sheet: title "Add time"; same picker; "Up to 10 hours in total"; "Add 9 h 45 min" from 60 minutes; the error is pinned, 16 above Add. | Must |
| H7 | End sheet: "You won’t get new cases after this. A case already assigned to you stays with you."; title when time ran out with a request open: "Availability ended". | Must |
| H8 | After availability ends: the count is one row above the picker, number on the label's line, so the whole wheel shows at 390 × 844. | Must |
| H9 | Profile shows Prescriptions written today (read only). Cards to Log out 32. | Must |
| H10 | **A new OTP sign-in opens a fresh Home** ("Start taking cases", no old notice). Availability, its "ended" notice and any case request left from an earlier session that was never logged out (app closed, sign-in expired) are cleared, and the backend ends that availability. Prescriptions written today stays; an open case still reopens first. Log out already ends availability. v1: not covered. | Must |

## Case page and calling

| # | Change | Kind |
|---|---|---|
| C1 | Status tags are 14 (were 12). | Looks |
| C2 | Card title to content 16; note fields 32 apart; order details rows 16 apart; patient name to age 8; toast 16 above the bar, at the page margins. | Looks |
| C3 | Bar: "Are you still on the call?" to its buttons 16; "Checking for a Health Advisor…" 8 above Skip HA. | Looks |
| C4 | Case closed and availability has ended: "Your availability has ended." above Back to Home. | Must |
| C5 | Callback sheet: while saving the button reads "Scheduling…"; failure reads "Couldn’t schedule the callback. Your chosen time is kept." and is pinned with the button, 16 above it. | Must |
| C6 | Rx viewer: hint to paper 8; tools row 8 under the title row, ✕ keeps its whole tap area. | Looks |
| C7 | A patient name on two lines grows the header; the age line stays 8 under it. | Looks |

## Prescribe

| # | Change | Kind |
|---|---|---|
| P1 | **Duration numbers are 1 to 12** for Days, Weeks and Months (v1: 1–7, 10, 14, 15). Ongoing is unchanged. | Must |
| P2 | Duration picker: chips 12 in, on the edge of the field's text; value, numbers and units 16 apart. | Looks |
| P4 | Prescribe: the "On prescription" band turns a deeper blue for a moment when its text changes (none with reduced motion); after Prescribe or Disable, focus returns to that medicine's row; an open overlay keeps focus inside it. | Must |
| P3 | Field groups 32 apart; helper and error lines 8 under their field; disabled notice to card 32. | Looks |
