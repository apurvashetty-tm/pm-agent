"""Build aid (run A1): printed-line no-wrap spans, Ongoing chip name, behaviour-state mapping. One-off patch, kept for the record."""
import os, re
APP = os.path.normpath(os.path.join(os.path.dirname(__file__), "../../../../../app"))
def edit(name, old, new):
    p = os.path.join(APP, name); s = open(p).read()
    assert old in s, (name, old[:70]); open(p, "w").write(s.replace(old, new))

NEW_PRINT = r'''  return line.charAt(0).toUpperCase() + line.slice(1);
}
// B-12: a number stays with its unit ("6 months" never splits): each "number unit" pair is one no-wrap span.
function printNodes(line) {
  const out = []; let last = 0;
  for (const m of line.matchAll(/(\d+(?:\.\d+)?|\.\d+|½) ([A-Za-z]+)/g)) {
    if (m.index > last) out.push(document.createTextNode(line.slice(last, m.index)));
    out.push(h("span", { class: "ps-keep", text: m[0] })); last = m.index + m[0].length;
  }
  if (last < line.length) out.push(document.createTextNode(line.slice(last)));
  return out;
}'''
p = os.path.join(APP, "screens/prescribe.js"); src = open(p).read()
src, n = re.subn(r'  line = line\.charAt\(0\)\.toUpperCase\(\) \+ line\.slice\(1\);\n  return line\.replace\(.*\n\}', lambda m: NEW_PRINT, src, count=1)
assert n == 1; open(p, "w").write(src)
edit("screens/prescribe.js", '  function setPrint() { printEl.textContent = printLine(model()); }',
     '  function setPrint() { printEl.replaceChildren(...printNodes(printLine(model()))); }')
edit("screens/prescribe.js", 'chip(MSG("prescribe.ongoing"), x.durOngoing, set(() => { x.durOngoing = true; }), MSG("prescribe.ongoingAria", { period: durationWords("ongoing") }))',
     'chip(MSG("prescribe.ongoing"), x.durOngoing, set(() => { x.durOngoing = true; }))')
open(os.path.join(APP, "screens/prescribe.css"), "a").write(".ps-keep { white-space: nowrap; }   /* B-12 */\n")
edit("core/boot.js", '  "home.add-open": "home_add-wheel",         // step 2: the Add time sheet\n',
     '''  "home.add-open": "home_add-wheel",         // step 2: the Add time sheet
  "case.back-before-call": "a-leave-sheet",  // step 3: Back before a call → "Leave this case?"
  "case.closed": "t10a-confirmed",           // step 3: closed case (outcome card, Request next case · Back to Home)
  "case.closed-availability-ended": "e-availability-ended",   // step 3: closed after availability ended → Back to Home only
  "rx.load-failed": "d-rx-failed",           // step 3: Rx viewer couldn't load
  "prescribe.dose-error": "d-error-dose",    // step 4: no dose on a daily schedule
''')
print("patched")
