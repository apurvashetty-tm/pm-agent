# Run A2 — Codex test disputes (for the main thread to rule on)

Codex's tests are unchanged. Every run-A test passes (edges 26/26, rules 15/15, journeys 254/254, options 8/8). One dispute, in the
A0 happy-path test that the A0 ruling deferred to the end of A2.

| Test | What it expects | What the approved spec says | Proposed ruling |
|---|---|---|---|
| **A0-happy-path** (`tests/codex/run-A0/all.mjs:129–130`) | (1) After tapping **Set availability**, a second button named `/Start availability\|Save\|Confirm/` to start it. (2) Then a button named `/Request (next )?case/`. | (1) Approved `home_setup-wheel`: the quick picks / wheel and **Set availability** in the bar; app-logic §3 "Confirm starts the countdown" — Set availability *is* that confirm; there is no second button. (2) The approved Home label is **"Request a case"** (`home.requestCase`, `home_active`); the regex matches only "Request case" / "Request next case". | Test bug, same kind as the A0 rulings ("Send OTP", "Verify & sign in"): drop the second availability click and match `/Request (a \|next )?case/`. With exactly those two changes the test passes end to end — sign-in → OTP → Not now → Set availability → Request a case → prescribe all → Call patient → fast-forward → Confirm prescription → Prescription confirmed → Request next case → the next case (`tools/a0-happy-minus-confirm.mjs`, `a0-happy-minus-confirm.log`: PASS). |
