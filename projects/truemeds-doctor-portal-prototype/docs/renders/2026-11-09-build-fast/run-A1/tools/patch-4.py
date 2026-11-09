"""Build aid (run A1): existing checks follow the built screens; UI timings out of the panel's settings list. One-off patch."""
import os
PRJ = os.path.normpath(os.path.join(os.path.dirname(__file__), "../../../../.."))
def edit(name, old, new, count=1):
    p = os.path.join(PRJ, name); s = open(p).read()
    assert old in s, (name, old[:80]); open(p, "w").write(s.replace(old, new, count))

# run-checks: the R list's built test looks for a picture stand-in, not any img (screens have their logo); t01-ready is built (A1).
edit("tests/run-checks.mjs", 'if (/^(sign-in|otp|offer|unlock|home)_|^(a|s|d)-/.test(id)) {', 'if (/^(sign-in|otp|offer|unlock|home)_|^(a|s|d)-|^t01-ready$/.test(id)) {')
edit("tests/run-checks.mjs", '&& !document.querySelector("#screen img, .shell-label"));', '&& !document.querySelector("#screen .shell-picture, .shell-label"));')
# B4 / B5: capture of a state that is still a picture (step 6), since t01-ready is built in run A1.
edit("tests/run-checks.mjs", '  const c = await open("?capture=1&s=t01-ready");\n  const cinfo', '  const c = await open("?capture=1&s=t10b-forwarded");   // a state still shown as its picture (step 6)\n  const cinfo')
# layout_check --app: the screen (built or picture) fits the frame.
edit("docs/layout_check.py", '''ok(f"{tag} picture fits the frame", pg.evaluate("(()=>{const i=document.querySelector('#screen img').getBoundingClientRect();''',
     '''ok(f"{tag} screen fits the frame", pg.evaluate("(()=>{const i=document.querySelector('#screen > *').getBoundingClientRect();''')
# UI timings (toast, double tap) are interaction constants, not product rules: kept out of the panel's Timings and limits.
edit("app/core/settings.js", '''  // On-screen feedback (RULES §9.5): a toast shows about 4 s. Rx viewer: two taps within this window zoom (app-logic §9).
  toastDuration:        { value: 4000, source: "rule", ref: "RULES §9.5 (about 4 s)" },
  doubleTapWindow:      { value: 300, source: "MOCK ASSUMPTION", ref: "Rx viewer double-tap (app-logic §9)" },
''', '')
edit("app/core/settings.js", '// Value for the current mode.', '''// Interaction timings (not product rules, so not in the review panel's Timings and limits): a toast shows about 4 s
// (RULES §9.5); two taps within the window zoom the Rx viewer (app-logic §9).
export const UI_TIMING = { toastDuration: 4000, doubleTapWindow: 300 };

// Value for the current mode.''')
edit("app/core/settings.js", '  const s = SETTINGS[key];\n  if (!s) throw', '  if (key in UI_TIMING) return UI_TIMING[key];\n  const s = SETTINGS[key];\n  if (!s) throw')
edit("app/review/labels.js", '\n  toastDuration: "Toast shows for", doubleTapWindow: "Rx viewer double-tap window",', '')
edit("app/review/labels.js", '  if (key === "toastDuration" || key === "doubleTapWindow") return dur(value);   // milliseconds, not demo-scaled\n', '')
print("patched")
