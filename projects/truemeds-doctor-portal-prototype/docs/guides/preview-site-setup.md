# Preview site setup — `truemeds-doctor-app-preview`

For Apurva to create once in Netlify. Nothing is deployed by this step. A deploy happens only when Apurva asks, by putting `[deploy]` in the commit message (plan v3 §4, D-88 Q3).

**What the site is:** the new doctor app prototype (`app/`), on its own site, so the current prototype site keeps serving the old files until the new one is approved.

## Steps

1. Open Netlify → **Add new site** → **Import an existing project** → choose the same GitHub repository as the current doctor-portal site.
2. **Branch to deploy:** `project/truemeds-doctor-portal-prototype` (production branch). Review needs no merge to `main`.
3. **Base directory:** `projects/truemeds-doctor-portal-prototype/app`
4. **Build command:** `sh ../scripts/copy-shared.sh` (also set in `app/netlify.toml`; Netlify uses the file if it finds it).
5. **Publish directory:** `.` (relative to the base directory, so only `app/` is served; `docs/` is not reachable).
6. **Site name:** `truemeds-doctor-app-preview` (Netlify gives `truemeds-doctor-app-preview.netlify.app`; change the name in Site settings → Site details if the name is taken).
7. Create the site. Then open **Site configuration → Build & deploy → Continuous deployment → Build settings → Ignore** and confirm it shows the rule from `app/netlify.toml` (`git log -1 --pretty=%B | grep -qF '[deploy]' && exit 1 || exit 0`).
8. Do **not** trigger a deploy yet. The first deploy happens when Apurva asks (step 5 phone demo, or later).
9. Once the first deploy exists, check the link: `…/?demo=1` opens the demo; the bare link opens review; `…/manifest.webmanifest` loads.

## Notes

- Engineering reads the `[deploy]` rule from the latest commit message, not the PR title (the root site's rule, same here).
- Search engines: the app sends `noindex` and `robots.txt` disallows everything.
- Local run, same files: from the project folder, `sh scripts/copy-shared.sh` then `python3 -m http.server 8765 --directory app`.
