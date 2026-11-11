"""K1 / K2: hand-off kit sources (one-off patch, kept for the record). Run from the project folder.
- every entry journey and Home list the shared band (app/screens/band.js, band.css) among their code files; Home lists the
  10-hour cap setting (availabilityMaximum);
- the Sign-in kit's DECIDED gains the spacing rule (D-108, RULES §8.3) and the band (D-107); SMS auto-fill and the unlock
  auto-prompt reach DECIDED through their app-logic lines (the journeys' DECIDED is generated from app-logic)."""
import pathlib
p = pathlib.Path('scripts/build-handoff.journeys.mjs'); s = p.read_text()
for a, b in [
    ('code: ["app/screens/otp.js", "app/screens/otp.css", "app/core/auth.js"]', 'code: ["app/screens/otp.js", "app/screens/otp.css", "app/screens/band.js", "app/screens/band.css", "app/core/auth.js"]'),
    ('code: ["app/screens/faster-signin-offer.js", "app/screens/faster-signin-offer.css"]', 'code: ["app/screens/faster-signin-offer.js", "app/screens/faster-signin-offer.css", "app/screens/band.js", "app/screens/band.css"]'),
    ('code: ["app/screens/returning-unlock.js", "app/screens/returning-unlock.css"]', 'code: ["app/screens/returning-unlock.js", "app/screens/returning-unlock.css", "app/screens/band.js", "app/screens/band.css"]'),
    ('code: ["app/screens/home.js", "app/screens/home.css"], settings: ["nearExpiryWarning", "availabilityMinimum", "availabilityStep", "earningsPerConfirmedRx"]',
     'code: ["app/screens/home.js", "app/screens/home.css", "app/screens/band.js", "app/screens/band.css"], settings: ["nearExpiryWarning", "availabilityMinimum", "availabilityStep", "availabilityMaximum", "earningsPerConfirmedRx"]'),
]:
    assert a in s, a[:60]; s = s.replace(a, b)
p.write_text(s)

p = pathlib.Path('scripts/build-handoff.mjs'); s = p.read_text()
anchor = '    { id: "d30", topic: "Keyboard",'
assert anchor in s
new = ('    { id: "d31", topic: "Layout", q: "How is the space between things measured, and which gaps are allowed?", a: [RUL("8.3", /^3\\. \\*\\*Spacing is measured on what the eye sees/), DEC("D-108", /\\*\\*Decision \\(Apurva\\):\\*\\* gaps are measured/), { src: "Kit", text: "Gaps are 8 (parts of one thing), 16 (items in one group) or 32 (different things), measured between visible edges: the ink of text from the top of the capitals to the bottom of the descenders, the painted edge of shapes. Tap areas and empty reserved lines add no space. On React Native, set includeFontPadding false (Android) and measure from the text\'s cap height: the gap tokens are the visible gaps." }], refs: ["D-108"] },\n'
       '    { id: "d32", topic: "Layout", q: "What is the band at the top of Sign-in, OTP, the offer, unlock and Home?", a: [DEC("D-107", /\\*\\*Decision \\(Apurva\\):\\*\\* sign-in, OTP/), { src: "Kit", text: "One shared band: logo 16 from the top of the safe area, logo → title 16, title 32/40 on one line, title → subtitle 8, subtitle 14/20 on one 20 line, subtitle → panel 32; the white panel has 24 top corners and 32 top padding, and its top lands at 173. Build it once and reuse it on all five screens (app/screens/band.js is the prototype\'s)." }], refs: ["D-107"] },\n')
s = s.replace(anchor, new + anchor)
p.write_text(s)

p = pathlib.Path('ui-screens/app-logic.md'); s = p.read_text()
a = '- All OTP limits are enforced by the server; the app only shows them.'
assert a in s
s = s.replace(a, a + '\n- **SMS auto-fill (hand-off note, screens audit 2026-11-11):** the code field is a one-time-code field (`autocomplete="one-time-code"` in the prototype). On the phone use Android SMS User Consent (or the SMS Retriever API) and iOS `textContentType="oneTimeCode"`; the filled code still waits for **Verify & sign in** (no auto-verify). Check it on a real device.')
p.write_text(s)
print('ok')
