# Repo split — plan and checklist (DRAFT for Apurva's approval)

**Status:** DRAFT — nothing moves until Apurva approves this file. 2026-10-16.
**Why:** on 2026-10-16 a thread read July copies of the doctor portal on another project's branch, and earlier an ACOM commit swept up doctor-portal files. Root causes: (1) every branch carries a stale copy of every project; (2) commits can mix projects; (3) all threads share one working folder on the Mac; (4) project branches drift for months. Rules alone rely on every session obeying them.
**Chosen direction (option E):** move out only what deploys or is built in code; keep docs, knowledge and rules in `pm-agent`.

---

## 1. Target layout

| Repo | Holds | Works on | Live link |
|---|---|---|---|
| `pm-agent` (stays, the hub) | Knowledge base, templates, workflows, AGENTS/CLAUDE rules, all docs-only projects: ACOM / Ring AI, Roadmap, CEO discussions, ValueMeds, incentive platform, payment-gateway decision, post-order AOP, Project South | `main` directly, one folder per project (no long-lived project branches) | — |
| `truemeds-doctor-portal` (new) | `projects/truemeds-doctor-portal-prototype` with its history | branch per milestone → PR → `main` | doctor-portal-prototype.netlify.app (re-linked) |
| `truemeds-price-lock` (new) | `projects/truemeds-price-lock` with its history | same | Price Lock site (re-linked) |
| `truemeds-design-system` (new) | `design-system/` with its history | PR → `main`; versions tagged `v1`, `v2`… | hosted CSS, fonts, icons (see §2) |
| `type1-revamp` (to confirm) | `projects/type1-revamp` | same | — |

**Open — Apurva to confirm:**
- [ ] Type 1 revamp: has mockups and 2 HTML/JS files. Own repo (if it will become a prototype) or stay in the hub (if it is mostly docs)?
- [ ] ACOM: one static mockup page (`My Statistics Page`). Stays in the hub unless it becomes a deployed prototype.
- [ ] Repo names above.

## 2. How shared pieces work after the split

- **Design system:** own repo, published as a small Netlify site. Each release is tagged (`v1`, `v2`…) and served at a fixed path, e.g. `…/v1/truemeds.css`. Prototypes link to a fixed version, so a design-system change never silently breaks another project; a project moves to a new version on purpose. Any project thread proposes a new component by a PR to the design-system repo. `RULES.md` lives there.
- **Knowledge, rules, templates:** stay in `pm-agent`. A project thread can attach the hub folder alongside its project folder to read them; learnings are added in the hub.
- **Each project repo** has a short `CLAUDE.md` pointing to the hub's `AGENTS.md` rules and to the design-system version it uses.

## 3. Migration steps (Claude does these; Apurva only the marked ones)

1. Freeze: no other thread writes to `pm-agent` during the move.
2. Backup tags exist (`backup/2026-10-16/*`); add `backup/pre-split/*` just before starting.
3. Create each new repo on GitHub (private, owner `apurvashetty-tm`).
4. Copy each project out **with its history** (only that folder's commits), push to the new repo.
5. Design system: same, then set up its Netlify site and the `v1` tag; change each prototype's design-system links from `../../design-system/…` to the `v1` URL.
6. **Apurva:** in Netlify, re-link the doctor-portal and Price Lock sites to their new repos (guided step by step).
7. **Apurva:** add Swapnil (and anyone else) to the new repos (guided).
8. In `pm-agent`: replace each moved folder with a one-line `MOVED.md` pointing to the new repo; delete the matching project branches (backed up); remove the root `netlify.toml`.
9. Clone each new repo to its own folder on the Mac (e.g. `~/src/truemeds-doctor-portal`), set up the same repo-local credential helper; attach that folder in project threads.
10. Update memory and each repo's handoff with the new locations.

## 4. Done when (pass/fail)

- [ ] Each new repo's `main` has every file of its project, byte-identical to `pm-agent` before the move (checked by script).
- [ ] Each new repo's history shows that project's past commits.
- [ ] doctor-portal-prototype.netlify.app and the Price Lock site load and look the same as before (checked on phone).
- [ ] Every prototype loads the design system from the `v1` URL; no `../../design-system` links left.
- [ ] `pm-agent` has no project branches left; only `main`.
- [ ] Commit and push work from each new folder via `device_bash`, with the repo-local credential helper.
- [ ] A fresh thread, given only the doctor-portal folder, finds the current handoff and screens without help.
- [ ] Nothing deleted that isn't backed up by a tag.

## 5. Working rules after the split

- One project = one repo = one folder on the Mac = the folder you attach to its threads.
- Parallel threads: as in `AGENTS.md` → "Working in parallel" (read freely; one writer per file; shared records only by the main thread; commit only your own files).
- `main` of each project repo changes only through a PR; the hub's `main` takes direct commits (docs only).
- A commit check (git hook) in each project repo refuses commits outside that project's files.
