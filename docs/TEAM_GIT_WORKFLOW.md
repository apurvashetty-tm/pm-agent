# Product Team Git Workflow

## Purpose

`pm-agent` is the shared operating workspace for the product team. GitHub keeps
changes reviewable, versioned, attributable, and recoverable.

## Repository access

| Group | Recommended access | Purpose |
|---|---|---|
| Repository owners | Admin | Settings, access, and emergency recovery |
| Product leads | Maintain | Review, merge, and repository upkeep |
| Product managers | Write | Create branches, push work, and open pull requests |
| Review-only stakeholders | Triage or Read | Comment, review, and follow progress |

Keep organization owners limited to the product head and one backup owner.

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

## Team setup

Recommended GitHub organization teams:

- `product-leads`: Maintain access
- `product`: Write access
- `stakeholders`: Triage or Read access

Use team access instead of inviting each employee separately. This makes joining,
role changes, and offboarding manageable from one place.

## Onboarding

1. Invite teammate to the GitHub organization.
2. Add teammate to the correct team.
3. Confirm two-factor authentication is enabled.
4. Ask teammate to clone the repository.
5. Have teammate open a small documentation pull request.
6. Confirm review and merge permissions work as expected.

## Offboarding

1. Remove teammate from organization or relevant teams.
2. Revoke organization-owned credentials assigned to that person.
3. Reassign open pull requests and issues.
4. Review recent access in the organization audit log.

## Remaining GitHub setup

Repository files define the working agreement. GitHub settings must still be
configured after the organization exists:

1. Transfer `pm-agent` to the organization.
2. Create teams and assign repository roles.
3. Enable the `main` branch ruleset.
4. Require two-factor authentication.
5. Replace personal account in `.github/CODEOWNERS` with the product-leads team.

