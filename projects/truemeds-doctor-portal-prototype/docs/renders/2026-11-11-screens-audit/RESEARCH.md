# Industry research (main thread, live web search, 2026-11-11) — input for the screens audit

Paraphrased findings; check each against our approved decisions before acting on it.

**Layout and spacing**
- Compact (phone) screens use 16 side margins; Material and systems built on it (e.g. SAP Fiori for Android) put spacing on an 8dp grid, with 4dp for small parts. — m2.material.io/design/layout · sap.com Fiori Android layout basics
- Many public design systems give main sections a larger gap than sub-sections (e.g. Malaysia's MYDS: 24 between sub-sections or cards, 32 between main sections). Supports our 8 / 16 / 32 and the 32 band → panel. — design.digital.gov.my/en/docs/design/spacing

**Phone-number sign-in**
- Keep the country code separate from the number (users otherwise type it twice); numeric keyboard; don't force a fixed length unless the country needs it; validate on submit or blur, not on every keystroke. — developer.telesign.com UI best practices · docs.cidaas.com · uxpatterns phone number
- Tell the user, before they send, that a one-time code will be sent by SMS. — telesign.com 10 UI tips

**OTP screen**
- Show where the code was sent; open the keyboard when the screen appears; replace "Resend" with a countdown (about 30 s) and cap new-code requests (Visa: 3). — design.visa.com/patterns/one-time-passcode
- Auto-fill from SMS (iOS one-time-code content type; Android SMS Retriever / User Consent), auto-advance between boxes, paste support, clear wrong / expired / locked states. — Twilio OTP best practices (Android, iOS) · vp0.com OTP screen guide

**Faster sign-in (biometric) offer**
- Offer it right after the first successful sign-in, not at sign-up; one simple opt-in, always optional, with a visible fallback. — orbix.studio biometric UX guide · Android Developers "Biometric authentication Part 2"
- Convenience framing ("sign in faster next time") beats security framing; common pattern: "Set up now" + "Not now". — Corbado post-sign-in prompt research · mojoauth passkey UX patterns (eBay example)

**Returning unlock**
- Trigger the phone's biometric prompt automatically when the app opens; after 2–3 failures offer the other method. — theuxshop passwordless authentication UX · Android Developers Part 2
