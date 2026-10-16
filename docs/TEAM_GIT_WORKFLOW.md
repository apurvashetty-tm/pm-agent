# Product Team Git Workflow

## Purpose

`pm-agent` is the shared operating workspace for the product team. GitHub keeps
changes reviewable, versioned, attributable, and recoverable.

## Repository access

The repository stays under the `apurvashetty-tm` personal GitHub account. Add the
two or three product-team members as direct collaborators. Collaborators can create
branches, push work, review pull requests, and merge approved changes.

This setup is independent from any Truemeds engineering GitHub organization.

## Daily flow

**Apurva's checkout (and the AIs working in it):** `main` = approved only; one project, one branch (`project/<folder>`), each with its own folder `.work/<folder>/`.
1. `scripts/start-project.sh <folder>` → work in the folder it prints.
2. `scripts/publish.sh -m "message" <files>` → pushes the branch, prints the pull-request link.
3. Open the pull request (once per round of work). Apurva decides; merge only on his say-so, as a normal merge commit (never squash/rebase). The branch stays and keeps catching up with `main`.
4. Project paused and everything merged: `scripts/workspace.sh close project <folder>` retires the folder and the branch (local and GitHub).
Shared changes on their own: `scripts/workspace.sh shared <topic>`. Details: `AGENTS.md` → Git safety.

**Collaborators (e.g. Swapnil):** unchanged —

1. Sync `main`.
2. Create a branch for one piece of work.
3. Make and validate changes.
4. Push the branch.
5. Open a pull request.
6. Get at least one review.
7. Resolve comments and merge.
8. Delete the merged branch.

## Recommended `main` protection

Configure a GitHub branch ruleset for `main`:

- Require a pull request before merging.
- Require at least one approval.
- Dismiss stale approvals when new commits are pushed.
- Require all review conversations to be resolved.
- Block force pushes.
- Block branch deletion.
- Require status checks after automated checks are added.
- Limit bypass rights to repository owners for emergencies.

## Collaborator setup

For each teammate:

1. Open repository **Settings → Collaborators**.
2. Select **Add people**.
3. Enter the teammate's GitHub username.
4. Ask the teammate to accept the invitation.
5. Confirm the teammate can push a branch and open a pull request.

Do not share one GitHub account or personal access token across the team.

## Onboarding

1. Invite teammate as a direct repository collaborator.
2. Confirm two-factor authentication is enabled on their GitHub account.
3. Ask teammate to clone the repository.
4. Have teammate open a small documentation pull request.
5. Confirm review and merge permissions work as expected.

## Offboarding

1. Remove teammate from repository collaborators.
2. Revoke any credentials assigned specifically to that person.
3. Reassign open pull requests and issues.
4. Review recent repository activity.

## Remaining GitHub setup

1. Invite direct collaborators when their GitHub usernames are available.
2. Enable the `main` branch protection supported by the repository plan.
3. Add trusted reviewers to `.github/CODEOWNERS` if shared ownership is desired.
4. Revisit organization ownership only after alignment with Truemeds IT.

## Deployments (live links)

Which branch and folder each live link publishes. Check this before merging into `main` or touching a
`netlify.toml`.

| Live link | Deploys from | Publishes | Config | Watch out |
|---|---|---|---|---|
| https://doctor-portal-prototype.netlify.app | `main` (approved work only) | `projects/truemeds-doctor-portal-prototype` | root `netlify.toml` — copies `design-system/` next to the app at deploy | Rebuilds only when the doctor portal, `design-system/` or `netlify.toml` changes. Approving a doctor-portal pull request puts it live. |
| https://price-lock-prd.netlify.app | `main` (approved work only) | `projects/truemeds-price-lock/prototype/price-lock` | `projects/truemeds-price-lock/netlify.toml` (Netlify base directory = `projects/truemeds-price-lock`) | Rebuilds only when the Price Lock folder changes. Re-linked from `price-lock-proto` to `main` on 2026-10-17; that branch is deleted (backup tags kept). |
| https://acom-mystats-redesign.netlify.app | manual CLI deploy (not linked to Git) | ACOM My Statistics prototype | none in the repo | Pushing to GitHub does not update it. |

## Operations log (exceptions only)

Git history already records every change, who made it and why (`git log`). Do not copy commits here.
Log only what a teammate, or an AI assistant in another thread, could be surprised by:

- a push to `main` without a pull request;
- a change to deployment or hosting (Netlify settings, `netlify.toml`, live links);
- a change to branch protection, collaborators or repository settings;
- a known conflict or trap waiting for a future merge.

Format: date · who (person, and tool or AI assistant if one did it) · what · why · follow-up. Newest first.

- 2026-10-17 · Apurva (Netlify UI, guided by Claude) · Price Lock site `price-lock-prd` re-linked: production branch `main`, base directory `projects/truemeds-price-lock`; first deploy from `main@c0ffe9e` identical to the previous one. `price-lock-proto` deleted (tags `backup/2026-10-16/price-lock-proto`, `backup/pre-trunk/price-lock-proto`). GitHub `main` protection: 'Do not allow bypassing' on, approvals not required. · Follow-up: none.
- 2026-10-16 (later) · Claude (Cowork) for Apurva · Final model agreed with Apurva: `main` approved-only; one project, one branch (`project/<folder>`) with its own folder `.work/<folder>/`; `shared/<topic>` for shared changes; scripts `start-project.sh`, `workspace.sh`, `publish.sh` (never pushes to `main`); commit check refuses commits on `main` and cross-project commits; `commit-and-push.sh` retired; weekly memory-export and synthesis jobs publish to `shared/weekly-auto` for approval. Earlier the same day `main` took direct pushes during the clean-up (CEO discussions, ValueMeds, post-order AOP, Roadmap README, Price Lock CAB files) — those were the last. · Follow-up: Price Lock site re-link; delete `price-lock-proto`.
- 2026-10-16 · Claude (Cowork) for Apurva · Moved to one `main`: merged `acom-portal-revamp` and `price-lock-proto` (its project folder; root `netlify.toml` kept from `main`) into `main`; deleted `acom-portal-revamp` and `doctor-portal/sign-in`; added `scripts/publish.sh`, the one-project commit check (`scripts/git-hooks/pre-commit`) and a Netlify `ignore` rule; fixed the credential helper for worktrees. Swapnil's `project/type1-revamp` and `project/project-south` were briefly given a catch-up merge from `main` and then restored exactly to their earlier state (`backup/2026-10-16/*`) — untouched. Backups: `backup/pre-trunk/*`. · Why: stale project copies on long-lived branches and mixed commits. · Follow-up: Apurva re-links the Price Lock site to `main`; uncommitted Aug files of other projects in Apurva's folder await his decision.
- 2026-10-16 · Claude (Cowork) for Apurva · Repo clean-up: (1) `doctor-portal/sign-in` pushed straight to `main` (fast-forward, 3779ce7) — branch protection bypassed as owner, no PR page; (2) every branch backed up as tag `backup/2026-10-16/<branch>`; (3) `main` merged into `acom-portal-revamp`, `price-lock-proto` (kept its own `netlify.toml`), `project/project-south`, `project/type1-revamp` — no project files changed or deleted; (4) deleted branches already in `main`: `doctor-portal-restyle`, `doctor-portal/audit-fixes`, `doctor-portal/pinned-actions-cards`, `design-system-central`, `ftc-priority-prd`, `docs/cowork-direct-git` (superseded), `cowork/connector-verification-2026-10-06`. · Why: a session read July copies of the doctor portal on another branch. · Follow-up: future `main` changes via PR; decide repo structure.
- 2026-10-08 · Claude (Cowork) for Apurva · Merged `doctor-portal-restyle` into `main` and pushed straight to `main`
  (2a196f2, then 1997d56 and 7468eeb) without a pull request · to update the doctor-portal live link the same day ·
  This bypassed the "pull request + one review" rule above. Future changes go through a branch and pull request.
- 2026-10-08 · Claude (Cowork) for Apurva · Added the root `netlify.toml` for the doctor-portal site · the site publishes
  only the project folder, but the app loads the shared `design-system/` from outside it; the build now copies it in ·
  Combine with the Price Lock config before `price-lock-proto` is ever merged into `main` (see Deployments).

