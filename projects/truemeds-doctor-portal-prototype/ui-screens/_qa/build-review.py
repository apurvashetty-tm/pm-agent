"""Rebuild ui-screens/REVIEW.html from the picture folders (Round 3, 2026-10-31).

Run from the project folder:  python3 ui-screens/_qa/build-review.py
Every state with a 390 picture in a folder listed below appears once, in its section, sorted by id.
Sections and counts are computed, so the nav and headings always match the pictures on disk.
"""
import html
import pathlib
import re

UI = pathlib.Path(__file__).resolve().parents[1]          # ui-screens/
TITLE = 'Doctor portal — approved screens (promoted 2026-10-29; status line 2026-10-30; audit fixes 2026-10-31; stale case states 2026-10-31)'

STYLE = (
    "body{font-family:-apple-system,Segoe UI,sans-serif;margin:0;background:#f4f5f7;color:#1f2328}"
    "header{position:sticky;top:0;background:#fff;border-bottom:1px solid #ddd;padding:12px 20px;z-index:2}"
    "h1{font-size:18px;margin:0 0 8px}nav{display:flex;flex-wrap:wrap;gap:8px}"
    "nav a{padding:6px 10px;border:1px solid #ccd;border-radius:16px;text-decoration:none;color:#1d5dcf;font-size:13px}"
    "nav span{color:#888}label{font-size:13px;margin-left:12px}section{padding:16px 20px}h2{font-size:16px}"
    ".grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px}"
    "figure{margin:0;background:#fff;border-radius:8px;padding:8px;box-shadow:0 1px 3px rgba(0,0,0,.08)}"
    "img{width:100%;display:block;cursor:zoom-in}figcaption{font-size:12px;color:#555;margin-top:6px;word-break:break-all}"
    "#zoom{position:fixed;inset:0;background:rgba(0,0,0,.8);display:none;align-items:center;justify-content:center}"
    "#zoom img{width:auto;max-width:95vw;max-height:95vh}"
)
SCRIPT = (
    "const w=document.getElementById('w');w.onchange=()=>document.querySelectorAll('img[data-n]').forEach(i=>i.src=i.dataset.n+(w.checked?'_w360.png':'_w390.png'));"
    "const z=document.getElementById('zoom');document.querySelectorAll('img[data-n]').forEach(i=>i.onclick=()=>{z.firstChild.src=i.src;z.style.display='flex'});"
    "z.onclick=()=>z.style.display='none';"
)


def groups():
    """Return [(section id, heading, [(folder, picture prefix, state id)])]."""
    def pics(folder, prefix='', keep=lambda sid: True):
        out = []
        for p in sorted((UI / folder).glob(f'{prefix}*_w390.png')):
            sid = p.name[len(prefix):-len('_w390.png')]
            if keep(sid):
                out.append((folder, prefix, sid))
        return out

    case = pics('case')
    calling = [x for x in case if re.match(r't\d|s7|g\d', x[2])]
    case_other = [x for x in case if x not in calling]
    return [
        ('calling', 'Case page: calling', calling),
        ('case', 'Case page: ready, sheets, closed, stress', case_other),
        ('prescribe', 'Prescribe', pics('prescribe')),
        ('home', 'Home and Profile', pics('home', 'home_')),
        ('sign-in', 'Sign-in', pics('sign-in', 'sign-in_')),
        ('otp', 'OTP', pics('otp', 'otp_')),
        ('returning-unlock', 'Returning unlock', pics('returning-unlock', 'unlock_')),
        ('faster-signin-offer', 'Faster sign-in offer', pics('faster-signin-offer', 'offer_')),
    ]


def main():
    sections = groups()
    nav = ''.join(f'<a href="#{sid}">{html.escape(head)} <span>{len(items)}</span></a>' for sid, head, items in sections)
    body = ''
    total = 0
    for sid, head, items in sections:
        total += len(items)
        figs = ''.join(
            f'<figure><img loading="lazy" data-n="{folder}/{prefix}{st}" src="{folder}/{prefix}{st}_w390.png" alt="{html.escape(st)}">'
            f'<figcaption>{html.escape(st)}</figcaption></figure>'
            for folder, prefix, st in items)
        body += f'<section id="{sid}"><h2>{html.escape(head)} ({len(items)} states)</h2><div class="grid">{figs}</div></section>'
    page = (
        '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        f'<title>Doctor portal — approved screens</title><style>{STYLE}</style></head>'
        f'<body><header><h1>{html.escape(TITLE)}</h1><nav>{nav}'
        '<label><input type="checkbox" id="w"> Show 360 width</label></nav></header>'
        f'{body}<div id="zoom"><img></div><script>{SCRIPT}</script></body></html>'
    )
    (UI / 'REVIEW.html').write_text(page)
    print(f'REVIEW.html: {total} states in {len(sections)} sections')


if __name__ == '__main__':
    main()
