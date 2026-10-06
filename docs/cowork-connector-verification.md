# Cowork GitHub connector verification

This branch (`cowork/connector-verification-2026-10-06`) exists only to test file publishing through the GitHub connector in Cowork.

- Connector commits are made directly on GitHub and are separate from local Git pushes. Commits that exist only in a local clone are not published by the connector; they need their own Git push.
- Future tasks should publish only task-related files, to feature branches (never directly to `main`), and then read the files back from the remote to verify the published content.
