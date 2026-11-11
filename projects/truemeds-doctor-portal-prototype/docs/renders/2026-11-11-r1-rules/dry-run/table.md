| Screen | Size | Region | Gap (above → below) | Visible px | Expected | Result | D-108 |
|---|---|---|---|---|---|---|---|
| sign-in/default | 390x844 | panel | panel top edge → Mobile number | 37.6 | 32 | **FAIL** | consequence: panel content starts 32 (visible) |
| sign-in/default | 390x844 | panel | Mobile number → +91 | 8.9 | 8 | pass | — |
| sign-in/default | 390x844 | panel | +91 → We’ll send you a verification code | 13.6 | 8 | **FAIL** | consequence: field ↔ its helper / message line |
| sign-in/default | 390x844 | panel | We’ll send you a verification code → Send OTP | 16.9 | 32 | **FAIL** | D-108: field + helper → 32 → Send OTP (today 16) |
| sign-in/default | 360x640 | panel | panel top edge → Mobile number | 37.6 | 32 | **FAIL** | consequence: panel content starts 32 (visible) |
| sign-in/default | 360x640 | panel | Mobile number → +91 | 8.9 | 8 | pass | — |
| sign-in/default | 360x640 | panel | +91 → We’ll send you a verification code | 13.6 | 8 | **FAIL** | consequence: field ↔ its helper / message line |
| sign-in/default | 360x640 | panel | We’ll send you a verification code → Send OTP | 16.9 | 32 | **FAIL** | D-108: field + helper → 32 → Send OTP (today 16) |
| sign-in/couldnt-send | 390x844 | panel | panel top edge → Mobile number | 37.6 | 32 | **FAIL** | consequence: panel content starts 32 (visible) |
| sign-in/couldnt-send | 390x844 | panel | Mobile number → +91 | 8.9 | 8 | pass | — |
| sign-in/couldnt-send | 390x844 | panel | +91 → Couldn’t send the code. | 16 | 16 | pass | D-108: error 16 under the field |
| sign-in/couldnt-send | 390x844 | panel | Couldn’t send the code. → Send OTP | 16 | 32 | **FAIL** | D-108: error 32 above Send OTP |
| sign-in/couldnt-send | 360x640 | panel | panel top edge → Mobile number | 37.6 | 32 | **FAIL** | consequence: panel content starts 32 (visible) |
| sign-in/couldnt-send | 360x640 | panel | Mobile number → +91 | 8.9 | 8 | pass | — |
| sign-in/couldnt-send | 360x640 | panel | +91 → Couldn’t send the code. | 16 | 16 | pass | D-108: error 16 under the field |
| sign-in/couldnt-send | 360x640 | panel | Couldn’t send the code. → Send OTP | 16 | 32 | **FAIL** | D-108: error 32 above Send OTP |
| otp/default | 390x844 | panel | panel top edge → div.tm-otp-slots | 32 | 32 | pass | consequence: panel content starts 32 (visible) |
| otp/default | 390x844 | panel | div.tm-otp-slots → Didn’t receive it? Resend in 0:30 | 63.6 | 32 | **FAIL** | D-108: boxes (+ message line) → 32 → Resend |
| otp/default | 390x844 | panel | Didn’t receive it? Resend in 0:30 → By selecting Verify & sign in, you | 50 | 32 | **FAIL** | D-108: Resend → 32 → legal |
| otp/default | 390x844 | panel | By selecting Verify & sign in, you → Verify & sign in | 33.3 | 8 | **FAIL** | D-108: legal → 8 → Verify |
| otp/default | 360x640 | panel | panel top edge → div.tm-otp-slots | 32 | 32 | pass | consequence: panel content starts 32 (visible) |
| otp/default | 360x640 | panel | div.tm-otp-slots → Didn’t receive it? Resend in 0:30 | 63.6 | 32 | **FAIL** | D-108: boxes (+ message line) → 32 → Resend |
| otp/default | 360x640 | panel | Didn’t receive it? Resend in 0:30 → By selecting Verify & sign in, you | 50 | 32 | **FAIL** | D-108: Resend → 32 → legal |
| otp/default | 360x640 | panel | By selecting Verify & sign in, you → Verify & sign in | 33.3 | 8 | **FAIL** | D-108: legal → 8 → Verify |
| otp/wrong-code | 390x844 | panel | panel top edge → 4 8 2 7 | 32 | 32 | pass | consequence: panel content starts 32 (visible) |
| otp/wrong-code | 390x844 | panel | 4 8 2 7 → Wrong code. | 13.6 | 8 | **FAIL** | consequence: field ↔ its helper / message line |
| otp/wrong-code | 390x844 | panel | Wrong code. → Didn’t receive it? Resend in 0:30 | 36.5 | 32 | **FAIL** | D-108: boxes (+ message line) → 32 → Resend |
| otp/wrong-code | 390x844 | panel | Didn’t receive it? Resend in 0:30 → By selecting Verify & sign in, you | 50 | 32 | **FAIL** | D-108: Resend → 32 → legal |
| otp/wrong-code | 390x844 | panel | By selecting Verify & sign in, you → Verify & sign in | 33.3 | 8 | **FAIL** | D-108: legal → 8 → Verify |
| otp/wrong-code | 360x640 | panel | panel top edge → 4 8 2 7 | 32 | 32 | pass | consequence: panel content starts 32 (visible) |
| otp/wrong-code | 360x640 | panel | 4 8 2 7 → Wrong code. | 13.6 | 8 | **FAIL** | consequence: field ↔ its helper / message line |
| otp/wrong-code | 360x640 | panel | Wrong code. → Didn’t receive it? Resend in 0:30 | 36.5 | 32 | **FAIL** | D-108: boxes (+ message line) → 32 → Resend |
| otp/wrong-code | 360x640 | panel | Didn’t receive it? Resend in 0:30 → By selecting Verify & sign in, you | 50 | 32 | **FAIL** | D-108: Resend → 32 → legal |
| otp/wrong-code | 360x640 | panel | By selecting Verify & sign in, you → Verify & sign in | 33.3 | 8 | **FAIL** | D-108: legal → 8 → Verify |
| otp/locked | 390x844 | panel | panel top edge → div.tm-otp-slots | 32 | 32 | pass | consequence: panel content starts 32 (visible) |
| otp/locked | 390x844 | panel | div.tm-otp-slots → Too many wrong tries. Try again in | 8 | 16 | **FAIL** | D-108: boxes → 16 → notice |
| otp/locked | 390x844 | panel | Too many wrong tries. Try again in → Verify & sign in | 32 | 32 | pass | D-108: notice → 32 → Verify |
| otp/locked | 360x640 | panel | panel top edge → div.tm-otp-slots | 32 | 32 | pass | consequence: panel content starts 32 (visible) |
| otp/locked | 360x640 | panel | div.tm-otp-slots → Too many wrong tries. Try again in | 8 | 16 | **FAIL** | D-108: boxes → 16 → notice |
| otp/locked | 360x640 | panel | Too many wrong tries. Try again in → Verify & sign in | 32 | 32 | pass | D-108: notice → 32 → Verify |
| otp/expired-and-resend-limited | 390x844 | panel | panel top edge → div.tm-otp-slots | 32 | 32 | pass | consequence: panel content starts 32 (visible) |
| otp/expired-and-resend-limited | 390x844 | panel | div.tm-otp-slots → This code has expired. Request a n | 8 | 16 | **FAIL** | D-108: boxes → 16 → notice |
| otp/expired-and-resend-limited | 390x844 | panel | This code has expired. Request a n → Verify & sign in | 32 | 32 | pass | D-108: notice → 32 → Verify |
| otp/expired-and-resend-limited | 360x640 | panel | panel top edge → div.tm-otp-slots | 32 | 32 | pass | consequence: panel content starts 32 (visible) |
| otp/expired-and-resend-limited | 360x640 | panel | div.tm-otp-slots → This code has expired. Request a n | 8 | 16 | **FAIL** | D-108: boxes → 16 → notice |
| otp/expired-and-resend-limited | 360x640 | panel | This code has expired. Request a n → Verify & sign in | 32 | 32 | pass | D-108: notice → 32 → Verify |
| offer/fingerprint | 390x844 | panel | panel top edge → div.hero-ic | 32 | 32 | pass | consequence: panel content starts 32 (visible) |
| offer/fingerprint | 390x844 | panel | div.hero-ic → svg / No more waiting for SMS code | 18 | 32 | **FAIL** | D-108: offer hero → 32 → points |
| offer/fingerprint | 390x844 | panel | svg / No more waiting for SMS code → Unlock the app with one touch, not | 7.6 | 8 | pass | — |
| offer/fingerprint | 390x844 | panel | Unlock the app with one touch, not → svg / Your fingerprint stays on yo | 18.9 | 16 | **FAIL** | D-108: points 16 apart |
| offer/fingerprint | 390x844 | panel | svg / Your fingerprint stays on yo → Truemeds never sees or stores it. | 7.6 | 8 | pass | — |
| offer/fingerprint | 390x844 | panel | Truemeds never sees or stores it. → svg / Change it any time | 18.9 | 16 | **FAIL** | D-108: points 16 apart |
| offer/fingerprint | 390x844 | panel | svg / Change it any time → Turn it off from your profile. | 7.6 | 8 | pass | — |
| offer/fingerprint | 390x844 | bar | Turn on faster sign-in → Not now | 29.6 (box 8) | 8 | pass | anatomy: pinned bar / sheet actions: buttons 8 apart |
| offer/fingerprint | 360x640 | panel | panel top edge → div.hero-ic | 32 | 32 | pass | consequence: panel content starts 32 (visible) |
| offer/fingerprint | 360x640 | panel | div.hero-ic → svg / No more waiting for SMS code | 18 | 32 | **FAIL** | D-108: offer hero → 32 → points |
| offer/fingerprint | 360x640 | panel | svg / No more waiting for SMS code → Unlock the app with one touch, not | 7.6 | 8 | pass | — |
| offer/fingerprint | 360x640 | panel | Unlock the app with one touch, not → svg / Your fingerprint stays on yo | 18.9 | 16 | **FAIL** | D-108: points 16 apart |
| offer/fingerprint | 360x640 | panel | svg / Your fingerprint stays on yo → Truemeds never sees or stores it. | 7.6 | 8 | pass | — |
| offer/fingerprint | 360x640 | panel | Truemeds never sees or stores it. → svg / Change it any time | 18.9 | 16 | **FAIL** | D-108: points 16 apart |
| offer/fingerprint | 360x640 | panel | svg / Change it any time → Turn it off from your profile. | 7.6 | 8 | pass | — |
| offer/fingerprint | 360x640 | bar | Turn on faster sign-in → Not now | 29.6 (box 8) | 8 | pass | anatomy: pinned bar / sheet actions: buttons 8 apart |
| offer/enable-failed | 390x844 | panel | panel top edge → div.hero-ic | 32 | 32 | pass | consequence: panel content starts 32 (visible) |
| offer/enable-failed | 390x844 | panel | div.hero-ic → svg / No more waiting for SMS code | 18 | 32 | **FAIL** | D-108: offer hero → 32 → points |
| offer/enable-failed | 390x844 | panel | svg / No more waiting for SMS code → Unlock the app with one touch, not | 7.6 | 8 | pass | — |
| offer/enable-failed | 390x844 | panel | Unlock the app with one touch, not → svg / Your fingerprint stays on yo | 18.9 | 16 | **FAIL** | D-108: points 16 apart |
| offer/enable-failed | 390x844 | panel | svg / Your fingerprint stays on yo → Truemeds never sees or stores it. | 7.6 | 8 | pass | — |
| offer/enable-failed | 390x844 | panel | Truemeds never sees or stores it. → svg / Change it any time | 18.9 | 16 | **FAIL** | D-108: points 16 apart |
| offer/enable-failed | 390x844 | panel | svg / Change it any time → Turn it off from your profile. | 7.6 | 8 | pass | — |
| offer/enable-failed | 390x844 | bar | Couldn’t turn on faster sign-in. → Try again | 16 | 16 | pass | anatomy: notice in the pinned bar / sheet actions: 16 above its button |
| offer/enable-failed | 390x844 | bar | Try again → Not now | 29.6 (box 8) | 8 | pass | anatomy: pinned bar / sheet actions: buttons 8 apart |
| offer/enable-failed | 360x640 | panel | panel top edge → div.hero-ic | 32 | 32 | pass | consequence: panel content starts 32 (visible) |
| offer/enable-failed | 360x640 | panel | div.hero-ic → svg / No more waiting for SMS code | 18 | 32 | **FAIL** | D-108: offer hero → 32 → points |
| offer/enable-failed | 360x640 | panel | svg / No more waiting for SMS code → Unlock the app with one touch, not | 7.6 | 8 | pass | — |
| offer/enable-failed | 360x640 | panel | Unlock the app with one touch, not → svg / Your fingerprint stays on yo | 18.9 | 16 | **FAIL** | D-108: points 16 apart |
| offer/enable-failed | 360x640 | panel | svg / Your fingerprint stays on yo → Truemeds never sees or stores it. | 7.6 | 8 | pass | — |
| offer/enable-failed | 360x640 | panel | Truemeds never sees or stores it. → svg / Change it any time | 18.9 | 16 | **FAIL** | D-108: points 16 apart |
| offer/enable-failed | 360x640 | panel | svg / Change it any time → Turn it off from your profile. | 7.6 | 8 | pass | — |
| offer/enable-failed | 360x640 | bar | Couldn’t turn on faster sign-in. → Try again | 16 | 16 | pass | anatomy: notice in the pinned bar / sheet actions: 16 above its button |
| offer/enable-failed | 360x640 | bar | Try again → Not now | 29.6 (box 8) | 8 | pass | anatomy: pinned bar / sheet actions: buttons 8 apart |
| unlock/fingerprint | 390x844 | panel | panel top edge → div.prompt-icon | 32 | 32 | pass | consequence: panel content starts 32 (visible) |
| unlock/fingerprint | 390x844 | panel | div.prompt-icon → Ready when you are | 22.1 | 16 | **FAIL** | D-108: unlock tile → 16 → caption |
| unlock/fingerprint | 390x844 | bar | Unlock with fingerprint → Use OTP instead | 29.6 (box 8) | 8 | pass | anatomy: pinned bar / sheet actions: buttons 8 apart |
| unlock/fingerprint | 360x640 | panel | panel top edge → div.prompt-icon | 32 | 32 | pass | consequence: panel content starts 32 (visible) |
| unlock/fingerprint | 360x640 | panel | div.prompt-icon → Ready when you are | 22.1 | 16 | **FAIL** | D-108: unlock tile → 16 → caption |
| unlock/fingerprint | 360x640 | bar | Unlock with fingerprint → Use OTP instead | 29.6 (box 8) | 8 | pass | anatomy: pinned bar / sheet actions: buttons 8 apart |
| unlock/unavailable | 390x844 | panel | panel top edge → Faster sign-in isn’t available on  | 32 | 32 | pass | consequence: panel content starts 32 (visible) |
| unlock/unavailable | 360x640 | panel | panel top edge → Faster sign-in isn’t available on  | 32 | 32 | pass | consequence: panel content starts 32 (visible) |
| home-v3/setup | 390x844 | panel | panel top edge → Quick picks | 38.1 | 32 | **FAIL** | consequence: panel content starts 32 (visible) |
| home-v3/setup | 390x844 | panel | Quick picks → 15 min / 30 min / 45 min | 10.5 | 8 | **FAIL** | consequence: group label → its control |
| home-v3/setup | 390x844 | panel | 15 min / 30 min / 45 min → 1 hour / 2 hours / 3 hours | 8 | 8 | pass | anatomy: chip grid 8 / 8 |
| home-v3/setup | 390x844 | panel | 1 hour / 2 hours / 3 hours → Custom | 38.1 | 32 | **FAIL** | consequence: on the 8 / 16 / 32 scale |
| home-v3/setup | 390x844 | panel | Custom → Hours / Minutes | 16 | 8 | **FAIL** | consequence: group label → its control |
| home-v3/setup | 390x844 | panel | Hours / Minutes → 0 1 2 0 15 | 21 (box 4) | 4 | pass | anatomy: wheel column heads 4 (component) |
| home-v3/setup | 390x844 | bar | Available until 7:45 PM → Set availability | 8.9 | 8 | pass | anatomy: bar caption line 8 above its button |
| home-v3/available | 390x844 | panel | panel top edge → Time remaining 30:00 Add time Pres | 32 | 32 | pass | consequence: panel content starts 32 (visible) |
| home-v3/available | 390x844 | bar | Request a case → End availability | 29.6 (box 8) | 8 | pass | anatomy: pinned bar / sheet actions: buttons 8 apart |
| home-v3/setup | 360x640 | panel | panel top edge → Quick picks | 38.1 | 32 | **FAIL** | consequence: panel content starts 32 (visible) |
| home-v3/setup | 360x640 | panel | Quick picks → 15 min / 30 min / 45 min | 10.5 | 8 | **FAIL** | consequence: group label → its control |
| home-v3/setup | 360x640 | panel | 15 min / 30 min / 45 min → 1 hour / 2 hours / 3 hours | 8 | 8 | pass | anatomy: chip grid 8 / 8 |
| home-v3/setup | 360x640 | panel | 1 hour / 2 hours / 3 hours → Custom | 38.1 | 32 | **FAIL** | consequence: on the 8 / 16 / 32 scale |
| home-v3/setup | 360x640 | panel | Custom → Hours / Minutes | 16 | 8 | **FAIL** | consequence: group label → its control |
| home-v3/setup | 360x640 | panel | Hours / Minutes → 0 1 2 0 15 | 21 (box 4) | 4 | pass | anatomy: wheel column heads 4 (component) |
| home-v3/setup | 360x640 | bar | Available until 7:45 PM → Set availability | 8.9 | 8 | pass | anatomy: bar caption line 8 above its button |
| home-v3/available | 360x640 | panel | panel top edge → Time remaining 30:00 Add time Pres | 32 | 32 | pass | consequence: panel content starts 32 (visible) |
| home-v3/available | 360x640 | bar | Request a case → End availability | 29.6 (box 8) | 8 | pass | anatomy: pinned bar / sheet actions: buttons 8 apart |
