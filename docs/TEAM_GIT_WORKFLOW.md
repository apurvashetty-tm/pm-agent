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
