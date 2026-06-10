# Decision: SOP Images Hosted on GitHub Pages, Not in Repo

**Date:** 2026-06-11
**Status:** Decided

## Context
SOP documents contain ~20 images each. Two options considered:
1. Store images directly in git repo alongside markdown files
2. Host images on GitHub Pages, reference by URL

## Decision
Images hosted at `https://apurvashetty-tm.github.io/pm-agent/assets/` via GitHub Pages on the main branch `/docs` folder. Markdown files use absolute URLs.

## Reasoning
- Repo is a PM reference archive, not a publishing platform — shared deliverables are DOCX
- Images are binary; text compresses well in git. As doc count grows, binary bloat compounds
- GitHub Pages is free, stable, lives within the same repo, no external dependency
- Google Drive links were rejected: permissions drift, links expire silently

## Consequences
- `docs/assets/` in repo = web-accessible images
- All SOP markdown image references use absolute GitHub Pages URLs
- Adding new project images = add to `docs/assets/` and commit
