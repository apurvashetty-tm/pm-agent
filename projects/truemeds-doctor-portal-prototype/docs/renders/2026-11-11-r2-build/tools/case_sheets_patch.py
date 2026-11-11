"""S4 / P9 on the case page reference (RULINGS 2026-11-11 10:32): every sheet with a subtitle puts it 8 under the title inside
the header (.tm-sheet__heading, D-109 §2), as app/screens/parts.js does. Nothing else on the case page changes."""
import pathlib, re
p = pathlib.Path('ui-screens/case/case.html'); s = p.read_text()
X = '<button class="tm-btn tm-btn--quiet tm-btn--icon tm-sheet__close" onclick="closeSheet()" aria-label="Close"><span class="tm-icon" data-icon="x"></span></button>'
n = 0
for title, sub_attrs, sub in [
    ('Discard changes?', '', 'Your changes to this medicine won’t be saved.'),
    ('Log out?', '', "You'll stop getting orders until you sign in again."),
    ('Patient unavailable', ' id="unavail-desc"', 'Patient could not be reached. Case will be reassigned to the queue.'),
]:
    old = (f'<header class="tm-sheet__header"><h2 class="tm-sheet__title">{title}</h2>{X}</header>\n'
           f'    <div class="tm-sheet__body">\n      <p{sub_attrs} class="tm-sheet__subtitle">{sub}</p>\n    </div>\n')
    new = (f'<header class="tm-sheet__header"><div class="tm-sheet__heading"><h2 class="tm-sheet__title">{title}</h2>'
           f'<p{sub_attrs} class="tm-sheet__subtitle">{sub}</p></div>{X}</header>\n')
    assert old in s, title
    s = s.replace(old, new); n += 1
old = ('<header class="tm-sheet__header"><h2 class="tm-sheet__title" id="cl-t">Leave this case?</h2><button class="tm-btn tm-btn--quiet tm-btn--icon tm-sheet__close" id="cl-x" type="button" aria-label="Close"><span class="tm-icon" data-icon="x" aria-hidden="true"></span></button></header>'
       '<div class="tm-sheet__body"><p class="tm-sheet__subtitle">It goes back to the queue for another doctor.</p></div>')
new = ('<header class="tm-sheet__header"><div class="tm-sheet__heading"><h2 class="tm-sheet__title" id="cl-t">Leave this case?</h2><p class="tm-sheet__subtitle">It goes back to the queue for another doctor.</p></div>'
       '<button class="tm-btn tm-btn--quiet tm-btn--icon tm-sheet__close" id="cl-x" type="button" aria-label="Close"><span class="tm-icon" data-icon="x" aria-hidden="true"></span></button></header>')
assert old in s
s = s.replace(old, new); n += 1
p.write_text(s)
print('sheets moved:', n)
