"""Build aid (run A1): fixes from the Codex critique (codex-critique.md). One-off patch, kept for the record."""
import os
APP = os.path.normpath(os.path.join(os.path.dirname(__file__), "../../../../../app"))
def edit(name, old, new):
    p = os.path.join(APP, name); s = open(p).read()
    assert old in s, (name, old[:80]); open(p, "w").write(s.replace(old, new, 1))

# Blocker 1: v() used before its definition (home_added outside capture).
edit("screens/home.js", '  const story = () => store.get().story || {};\n  const ui = {', '  const story = () => store.get().story || {};\n  const v = (k) => value(k, mode);\n  const ui = {')
edit("screens/home.js", '  const offline = () => ui.offlineFx || store.get().offline === "yes";\n  const v = (k) => value(k, mode);\n',
     '  const offline = () => ui.offlineFx || store.get().offline === "yes";\n')
# Blocker 2: Set availability / Add time fail when the server can't be reached (offline): selection and deadline kept.
edit("screens/home.js", '    life.later(() => { ui.busy = null; setAvailability(ui.duration * MIN); draw(); });',
     '    life.later(() => {\n      ui.busy = null;\n      if (offline()) { ui.bar = "setup-failed"; draw(); return; }   // known failure: the selection is kept (feedback-state-map home.setup-failed)\n      setAvailability(ui.duration * MIN); draw();\n    });')
edit("screens/home.js", '''    life.later(() => {
      ui.busy = null; addTime(ui.addDuration * MIN); ui.sheet = null;''', '''    life.later(() => {
      ui.busy = null;
      if (offline()) { ui.addFailed = true; draw(); return; }   // home.add-failed: sheet and selection kept, deadline unchanged
      addTime(ui.addDuration * MIN); ui.sheet = null;''')
# Should-fix: phone Back closes a Home sheet first (B13); Profile Back after that.
edit("screens/home.js", '  setScreenBack(ui.page === "profile" ? profileBack : null);   // Home is a root: phone back stays in the app; Profile goes back',
     '  // Phone back (B13): an open sheet closes first; then Profile goes back; Home is a root (phone back stays in the app).\n  setScreenBack(() => { if (ui.sheet) { closeSheet(); return; } if (ui.page === "profile") profileBack(); });')
# Should-fix: an offline picture moment recovers when the reviewer reconnects (any offline change replaces the fixture).
edit("screens/home.js", '  const unsub = store.subscribe(() => { if (!life.alive()) { unsub(); return; } if (drawKey(availability()) !== lastKey) draw(); });',
     '  let lastOffline = store.get().offline;\n  const unsub = store.subscribe((st) => {\n    if (!life.alive()) { unsub(); return; }\n    if (st.offline !== lastOffline) { lastOffline = st.offline; ui.offlineFx = false; }   // the reviewer\'s switch replaces the picture moment\n    if (drawKey(availability()) !== lastKey) draw();\n  });')
edit("screens/case.js", '''  const unsub = store.subscribe(() => {
    if (!life.alive()) { unsub(); return; }
    const off = offline();''', '''  let lastSwitch = store.get().offline;
  const unsub = store.subscribe((st) => {
    if (!life.alive()) { unsub(); return; }
    if (st.offline !== lastSwitch) { lastSwitch = st.offline; ui.offlineFx = false; }   // the reviewer's switch replaces the picture moment
    const off = offline();''')
# Should-fix: the bar hides while the phone keyboard is open (visual viewport shrinks), not merely while a field has focus.
open(os.path.join(APP, "screens/parts.js"), "a").write('''
// Keyboard rule (D-81) on a phone: the pinned bar hides while the keyboard is open and returns when it closes. The keyboard is
// "open" when a text field has focus and the visual viewport is clearly shorter than the tallest seen (the keyboard took it).
export function watchKeyboard(root, alive) {
  const vv = window.visualViewport; if (!vv) return;
  let tallest = vv.height;
  const check = () => {
    if (!alive()) { vv.removeEventListener("resize", check); return; }
    tallest = Math.max(tallest, vv.height);
    const field = document.activeElement && root.contains(document.activeElement) && /^(TEXTAREA|INPUT)$/.test(document.activeElement.tagName);
    root.classList.toggle("kb-real", !!field && vv.height < tallest * 0.8);
  };
  vv.addEventListener("resize", check); root.addEventListener("focusin", check); root.addEventListener("focusout", () => setTimeout(check, 0));
}
''')
edit("screens/case.js", 'medicineRow, focusSheet, revealAboveKeyboard } from "./parts.js";', 'medicineRow, focusSheet, revealAboveKeyboard, watchKeyboard } from "./parts.js";')
edit("screens/case.js", '  draw();\n  if (!live && fx.scroll) requestAnimationFrame', '  watchKeyboard(root, life.alive);\n  draw();\n  if (!live && fx.scroll) requestAnimationFrame')
for name, old, new in [
    ("screens/case.css", "@media (pointer: coarse) { .case-screen:has(.case-scroll textarea:focus) .case-bar { display: none; } }", ".case-screen.kb-real .case-bar { display: none; }   /* the phone keyboard is open (parts.js watchKeyboard) */"),
    ("screens/prescribe.css", "@media (pointer: coarse) { #prescribe-screen:has(textarea:focus, input:focus) #ps-actionbar { display: none; } }", ".case-screen.kb-real #ps-actionbar { display: none; }   /* the phone keyboard is open (parts.js watchKeyboard) */"),
]:
    edit(name, old, new)
print("patched")
