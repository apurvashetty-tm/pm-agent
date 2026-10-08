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
| https://doctor-portal-prototype.netlify.app | `main` (every push, automatically) | `projects/truemeds-doctor-portal-prototype` | root `netlify.toml` — copies `design-system/` next to the app at deploy | Any push to `main` redeploys this site, including docs-only commits. |
| Price Lock prototype (Netlify) | `price-lock-proto` | `projects/truemeds-price-lock/prototype/price-lock` | root `netlify.toml` **on that branch** | Merging `price-lock-proto` into `main` will conflict on the root `netlify.toml` — the two site configs must be combined first, or the doctor-portal site breaks. |
| https://acom-mystats-redesign.netlify.app | manual CLI deploy (not linked to Git) | ACOM My Statistics prototype | none in the repo | Pushing to GitHub does not update it. |

## Operations log (exceptions only)

Git history already records every change, who made it and why (`git log`). Do not copy commits here.
Log only what a teammate, or an AI assistant in another thread, could be surprised by:

- a push to `main` without a pull request;
- a change to deployment or hosting (Netlify settings, `netlify.toml`, live links);
- a change to branch protection, collaborators or repository settings;
- a known conflict or trap waiting for a future merge.

Format: date · who (person, and tool or AI assistant if one did it) · what · why · follow-up. Newest first.

- 2026-10-08 · Claude (Cowork) for Apurva · Merged `doctor-portal-restyle` into `main` and pushed straight to `main`
  (2a196f2, then 1997d56 and 7468eeb) without a pull request · to update the doctor-portal live link the same day ·
  This bypassed the "pull request + one review" rule above. Future changes go through a branch and pull request.
- 2026-10-08 · Claude (Cowork) for Apurva · Added the root `netlify.toml` for the doctor-portal site · the site publishes
  only the project folder, but the app loads the shared `design-system/` from outside it; the build now copies it in ·
  Combine with the Price Lock config before `price-lock-proto` is ever merged into `main` (see Deployments).

