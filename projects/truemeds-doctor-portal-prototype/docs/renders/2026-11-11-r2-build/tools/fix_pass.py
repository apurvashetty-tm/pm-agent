"""Step 7 fix pass (one pass, D-100): Codex should-fix 1–3 + RULINGS 2026-11-11 11:32 (unlock tile → caption 8). Run from the project folder."""
import pathlib


def patch(f, pairs):
    p = pathlib.Path(f); s = p.read_text()
    for a, b in pairs:
        assert a in s, (f, a[:70]); s = s.replace(a, b)
    p.write_text(s)


# 1 · unlock tile → caption 8 visible (ruling 11:32; D-108 corrected): app, app-logic, design rules, the shared checker's default
patch('app/screens/returning-unlock.css', [
    ('.unlock-screen .prompt { margin: 0; display: flex; flex-direction: column; align-items: center; gap: var(--tm-space-lg); text-align: center; }',
     '.unlock-screen .prompt { margin: 0; display: flex; flex-direction: column; align-items: center; gap: var(--tm-space-sm); text-align: center; }   /* tile → caption 8: one thing (D-108, corrected 2026-11-11) */'),
    ('/* Caption: its ink sits 16 under the tile (D-108 applied; text trimmed to the ink). */',
     '/* Caption: its ink sits 8 under the tile (D-108, corrected 2026-11-11: a tile and its caption join; text trimmed to the ink). */'),
    ('tile → 16 → caption; a whole-screen notice', 'tile → 8 → caption; a whole-screen notice'),
])
patch('ui-screens/app-logic.md', [('Tile → 16 → "Ready when you are" (D-108)', 'Tile → 8 → "Ready when you are" (D-108, corrected 2026-11-11)')])
patch('../../design-system/RULES.md', [('Unlock: tile → **16** → caption.', 'Unlock: tile → **8** → caption (a tile and its caption join; D-108 corrected 2026-11-11).')])
patch('../../design-system/scripts/check-visible-gaps.mjs', [
    ("  { above: '@tile', below: '@caption', gap: 16, note: 'unlock tile → caption 16 (D-108 applied)' },",
     "  { above: '@tile', below: '@caption', gap: 8, note: 'a picture tile ↔ its caption (D-108, corrected 2026-11-11: 8)' },")])

# 2 · band top padding is 16 from the safe area (D-107; viewport-fit=cover)
patch('app/screens/band.css', [
    ('.entry-band { flex: none; padding: var(--tm-space-lg) var(--tm-space-page) var(--tm-space-2xl);',
     '.entry-band { flex: none; padding: calc(var(--tm-space-lg) + env(safe-area-inset-top)) var(--tm-space-page) var(--tm-space-2xl);   /* 16 from the safe area (D-107) */\n ')])

# 3 · the kit no longer documents the removed 31ch subtitle cap (P2)
patch('scripts/build-handoff.mjs', [
    ('const EXCEPTIONS = [{ property: "max-width", value: "31ch", why: "Documented exception (D-98): a text measure, not a size — the subtitle\'s line length. React Native has no ch unit; see OPEN o19." }];',
     '// D-98\'s 31ch subtitle measure was removed by D-107 (r2-build, checklist P2): no documented exceptions left.\nconst EXCEPTIONS = [];'),
    ('balanced line breaks for titles and notices (iOS), the subtitle\'s 31-character width limit, and the 2px focus ring',
     'balanced line breaks for titles and notices (iOS) and the 2px focus ring'),
])
print('ok')
