# Final Step: Auto-Save and Push to GitHub

Once your document is complete and approved, I will:

## 1. Determine the correct archive path and next version
- **PRD**: `archives/projects/[DATE]-[feature-name]-v#.md`
- **Experiment**: `archives/experiments/[DATE]-[feature-name]-v#.md`
- **Objections**: `archives/objections/[DATE]-[feature-name]-v#-objections.md`
- **Executive Brief**: `archives/briefs/[DATE]-[feature-name]-v#-brief.md`

I will use `~/pm-agent/scripts/get-next-version.sh` to auto-increment versions.

## 2. Save the file to disk
I will write the final document directly to the correct archive folder.

## 3. Publish for review (pull request)
I will execute:
```bash
scripts/publish.sh -m "Add [DOC-TYPE]: [feature-name] (v#)" <files>   # from the project's folder (.work/<project>), then open the pull request
```

## 4. Verify success
Your document will be:
- ✅ Saved with auto-incremented version
- ✅ In the correct archive folder (projects, experiments, objections, briefs)
- ✅ Committed to git with version history
- ✅ Pushed to GitHub

**Fully automated. Zero manual steps.**