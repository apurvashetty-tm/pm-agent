"""Build aid (run A1): keyboard rule wiring in case.js / prescribe.js / parts.js. One-off patch, kept for the record."""
import os
P = os.path.normpath(os.path.join(os.path.dirname(__file__), "../../../../../app/screens"))
def edit(name, old, new):
    p = os.path.join(P, name); s = open(p).read()
    assert old in s, (name, old[:60]); open(p, "w").write(s.replace(old, new))

parts = open(os.path.join(P, "parts.js")).read()
if "revealAboveKeyboard" not in parts:
    open(os.path.join(P, "parts.js"), "a").write('''
// Keyboard rule (D-81): the focused field scrolls into view above the keyboard with its label and helper, 16 clear of it.
export function revealAboveKeyboard(scroller, field, keyboard) {
  if (!scroller || !field || !keyboard) return;
  const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--tm-space-lg")) || 0;
  const d = field.getBoundingClientRect().bottom + gap - keyboard.getBoundingClientRect().top;
  if (d > 0) scroller.scrollTop += d;
}
''')
edit("case.js", 'medicineRow, focusSheet } from "./parts.js";', 'medicineRow, focusSheet, revealAboveKeyboard } from "./parts.js";')
edit("case.js", '  if (ui.typing === "symptoms") symptoms.focus({ preventScroll: true });',
     '  if (ui.typing === "symptoms") { symptoms.focus({ preventScroll: true }); requestAnimationFrame(() => revealAboveKeyboard(scroller, symptoms.closest(".tm-field"), root.querySelector(".mock-kbd"))); }')
edit("prescribe.js", 'option, notice, focusSheet } from "./parts.js";', 'option, notice, focusSheet, revealAboveKeyboard } from "./parts.js";')
edit("prescribe.js", '  if (fx.kb === "text" && opts.mode === "capture") { showKb("text"); requestAnimationFrame(() => note.focus({ preventScroll: true })); }\n  if (fx.kb === "decimal" && opts.mode === "capture") showKb("decimal");',
     '  if (fx.kb === "text" && opts.mode === "capture") { showKb("text"); requestAnimationFrame(() => { note.focus({ preventScroll: true }); revealAboveKeyboard(body, note.closest(".tm-field"), kbSlot.firstChild); }); }\n  if (fx.kb === "decimal" && opts.mode === "capture") requestAnimationFrame(() => showKb("decimal"));   // after the check scrolled to the error, as in the picture')
print("patched")
