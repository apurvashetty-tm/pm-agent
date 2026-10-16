#!/usr/bin/env bash
# Self-test for the git model (workspace.sh, publish.sh, hooks, close, weekly runner).
# Builds a throwaway repo with its own fake GitHub in a temp folder — never touches this repo or GitHub.
# Exits non-zero if any check fails or any setup step fails.   Usage: scripts/tests/test-git-model.sh
set -u
B="$(cd "$(dirname "$0")/../.." && pwd)"; T="$(mktemp -d)"; PASSES=0; FAILS=0
pass(){ PASSES=$((PASSES+1)); echo "  PASS: $1"; }
fail(){ FAILS=$((FAILS+1)); echo "  FAIL: $1"; }
need(){ "$@" >/dev/null 2>&1 || { echo "SETUP FAILED: $*"; echo "Result: setup error"; exit 2; }; }   # setup steps must succeed
expect_refused(){ local name=$1; shift; if "$@" >/dev/null 2>&1; then fail "$name (was allowed)"; else pass "$name"; fi; }
expect_ok(){ local name=$1; shift; if "$@" >/dev/null 2>&1; then pass "$name"; else fail "$name (was refused)"; fi; }
G="git -c user.name=t -c user.email=t@t"; RAW="$G -c core.hooksPath=/dev/null"   # RAW = no checks, for simulating other people

# --- fake GitHub + clone ---
need mkdir -p $T/seed; cd $T; need git init -q --bare origin.git; cd seed; need git init -q; need git checkout -q -b main
need cp -R $B/scripts $B/templates $B/changelogs .; mkdir -p projects/ACOM projects/alpha knowledge
echo a > projects/ACOM/a.md; echo b > projects/alpha/b.md; echo k > knowledge/k.md; printf '.work/\n' > .gitignore
need git add -A; need $RAW commit -q -m seed; need git remote add origin $T/origin.git; need git push -q origin main
need git --git-dir=$T/origin.git symbolic-ref HEAD refs/heads/main
cd $T; need git clone -q origin.git repo; need git clone -q origin.git other
R=$T/repo; cd $R; git config user.name t; git config user.email t@t; git config core.hooksPath scripts/git-hooks
approve(){ ( cd $T/other && git fetch -q && git checkout -q main && git merge -q --ff-only origin/main && $RAW merge -q --no-edit "origin/$1" && git push -q origin main ) >/dev/null 2>&1 || { echo "SETUP FAILED: approve $1"; exit 2; }; }

echo "1. main and names"
echo x >> knowledge/k.md; need git add knowledge/k.md
expect_refused "commit on main" git commit -q -m x; git reset -q --hard
expect_refused "name '..'" scripts/workspace.sh project ..
expect_refused "name '.hidden'" scripts/workspace.sh project .hidden
expect_refused "open Swapnil's branch" scripts/workspace.sh project type1-revamp

echo "2. new project"
P=$(scripts/workspace.sh project zz | tail -1); [ -d "$P" ] || { echo "SETUP FAILED: workspace"; exit 2; }
[ -f $P/projects/zz/CLAUDE.md ] && pass "scaffolded" || fail "scaffold"
grep -qx 'gitdir: ../../.git/worktrees/zz' $P/.git && pass "relative link" || fail "link: $(cat $P/.git)"
[ -f .git/worktrees/zz/locked ] && pass "locked" || fail "not locked"
git ls-remote --exit-code origin refs/heads/project/zz >/dev/null && pass "branch on GitHub" || fail "no branch on GitHub"

echo "3. publishing and the commit check"
cd $P; echo n > projects/zz/note.md
expect_ok "own-project publish" scripts/publish.sh -m own projects/zz/note.md
echo y >> projects/ACOM/a.md
out=$(scripts/publish.sh -m bad projects/ACOM/a.md 2>&1); echo "$out" | grep -q "NOT committed" && pass "cross-project publish refused" || fail "cross-project publish: $out"
[ "$(git diff --cached --name-only)" = projects/ACOM/a.md ] && pass "refused work stays staged" || fail "staged work lost"
git reset -q --hard
need git mv projects/alpha/b.md projects/zz/b.md; expect_refused "cross-project rename" git commit -q -m mv; git reset -q --hard
f=$'projects/ACOM/q\nr.md'; echo q > "$f" || { echo "SETUP FAILED: newline file"; exit 2; }; need git add -- "$f"
expect_refused "newline file name in another project" git commit -q -m nl; git reset -q --hard; rm -f "$f"
g=$'projects/zz/a\nb.md'; echo q > "$g" || { echo "SETUP FAILED: newline file 2"; exit 2; }; need git add -- "$g"
expect_ok "newline file name in own project" git commit -q -m nl2; need git reset -q --hard HEAD~1
need git checkout -q --detach; echo d > projects/zz/d.md; need git add projects/zz/d.md
expect_refused "commit on detached HEAD" git commit -q -m d; git reset -q --hard; rm -f projects/zz/d.md; need git checkout -q project/zz

echo "3b. line break inside a project folder name"
d=$'projects/zz\nzz/file.md'; mkdir -p "$(dirname "$d")" || { echo "SETUP FAILED: newline dir"; exit 2; }; echo e > "$d"; need git add -- "$d"
expect_refused "commit with a line break in a project folder name" git commit -q -m nd; git reset -q --hard; rm -rf $'projects/zz\nzz'
need git checkout -q -b nl-src; mkdir -p $'projects/zz\nzz'; echo e > "$d"; need git add -- "$d"; need $RAW commit -q -m "nl dir"; need git checkout -q project/zz
expect_refused "merge commit bringing in a line-break project folder" git merge -q --no-ff --no-edit nl-src; git merge --abort 2>/dev/null; git reset -q --hard
need git merge -q --ff-only nl-src 2>/dev/null || { git reset -q --hard nl-src; }
echo z2 > projects/zz/z2.md
out=$(scripts/publish.sh -m nl projects/zz/z2.md 2>&1); echo "$out" | grep -q -E "unusual project folder name|would change more than it may" && pass "publish check stops a line-break project folder" || fail "publish nl: $out"
need git reset -q --hard origin/project/zz; git branch -q -D nl-src; rm -rf $'projects/zz\nzz'

echo "4. failing git diff must reject (mocked)"
mkdir -p $T/fakebin; cat > $T/fakebin/git <<'FG'
#!/usr/bin/env bash
for a in "$@"; do [ "$a" = diff ] && exit 128; done
exec /usr/bin/env -u PATH_FAKE PATH="$REAL_PATH" git "$@"
FG
chmod +x $T/fakebin/git; echo m > projects/zz/m.md; need git add projects/zz/m.md
expect_refused "commit when git diff fails" env REAL_PATH="$PATH" PATH="$T/fakebin:$PATH" scripts/git-hooks/check-commit commit
expect_refused "merge check when git diff fails" env REAL_PATH="$PATH" PATH="$T/fakebin:$PATH" scripts/git-hooks/check-commit merge
git reset -q --hard; rm -f projects/zz/m.md

echo "5. merges"
( cd $T/other && echo m >> projects/ACOM/a.md && $RAW commit -qam "acom approved" && git push -q origin main ) >/dev/null 2>&1 || { echo "SETUP FAILED: main moves"; exit 2; }
need git fetch -q origin; expect_ok "automatic merge of main" git merge -q --no-edit origin/main
need git branch -q other-proj origin/main; ( git checkout -q other-proj && echo o >> projects/alpha/b.md && $RAW commit -qam alpha ) >/dev/null 2>&1 || { echo "SETUP FAILED: other-proj"; exit 2; }
need git checkout -q project/zz; expect_refused "automatic merge of another project's branch" git merge -q --no-edit other-proj; git merge --abort 2>/dev/null; git reset -q --hard
need git checkout -q -b ff-src; echo o >> projects/alpha/b.md; need $RAW commit -qam "alpha via ff"; need git checkout -q project/zz
need git merge -q --ff-only ff-src; echo z > projects/zz/z.md
out=$(scripts/publish.sh -m ff projects/zz/z.md 2>&1); echo "$out" | grep -q "would change more than it may" && pass "fast-forward bypass stopped before push" || fail "ff bypass: $out"
need git reset -q --hard origin/project/zz; git branch -q -D ff-src other-proj

echo "6. identity, Swapnil's branch, runner, shared branch"
need git checkout -q -b wrong; out=$($R/scripts/workspace.sh project zz 2>&1); echo "$out" | grep -q "is not on project/zz" && pass "folder on wrong branch refused" || fail "wrong branch: $out"
need git checkout -q project/zz; git branch -q -D wrong
need git checkout -q -b project/type1-revamp; echo t > projects/zz/t.md
out=$(scripts/publish.sh -m t projects/zz/t.md 2>&1); echo "$out" | grep -q Swapnil && pass "publish refused on Swapnil's branch" || fail "publish on Swapnil's branch: $out"
need git add projects/zz/t.md; expect_refused "commit refused on Swapnil's branch" git commit -q -m t
git reset -q --hard; rm -f projects/zz/t.md; need git checkout -q project/zz; git branch -q -D project/type1-revamp
expect_refused "weekly runner outside shared/weekly-auto" node scripts/run-synthesis.js
W=$($R/scripts/workspace.sh shared weekly-auto | tail -1); [ -d "$W" ] || { echo "SETUP FAILED: weekly folder"; exit 2; }
( cd $W && node scripts/run-synthesis.js ) > $T/runner.log 2>&1 && ! grep -q -E "ReferenceError|Error:" $T/runner.log && pass "weekly runner completes cleanly in shared/weekly-auto" || fail "runner: $(tail -3 $T/runner.log)"
cd $W; echo s >> projects/ACOM/a.md; need git add projects/ACOM/a.md; expect_refused "shared branch changing a project" git commit -q -m s; git reset -q --hard; cd $P

echo "7. close"
cd $R
out=$(scripts/workspace.sh close project zz 2>&1); echo "$out" | grep -q "isn't merged into main" && pass "close stops on unmerged work" || fail "unmerged: $out"
approve project/zz; ( cd $P && git fetch -q && git merge -q --ff-only origin/main ) >/dev/null 2>&1
echo log > $P/build.log; echo build.log >> .git/info/exclude; touch $P/.DS_Store "$P/report .DS_Store"; mkdir -p $P/sub && touch $P/sub/.DS_Store
out=$(scripts/workspace.sh close project zz 2>&1)
echo "$out" | grep -q "would be lost" && pass "close stops on files that would be lost" || fail "lost files: $out"
echo "$out" | grep -q "build.log" && pass "lists ignored build.log" || fail "build.log not listed"
echo "$out" | grep -q "report .DS_Store" && pass "lists 'report .DS_Store' (not a real .DS_Store)" || fail "'report .DS_Store' hidden"
echo "$out" | grep -q -x -E '\?\? (sub/)?\.DS_Store' && fail "listed a real .DS_Store" || pass "real .DS_Store files skipped"
[ -f $P/build.log ] && [ -f "$P/report .DS_Store" ] && pass "nothing removed" || fail "files removed"
rm -f $P/build.log "$P/report .DS_Store"
( cd $T/other && git fetch -q && git checkout -q -b late origin/project/zz && echo late > projects/zz/late.md && git add -A && $RAW commit -qm late && git push -q origin HEAD:project/zz ) >/dev/null 2>&1 || { echo "SETUP FAILED: late push"; exit 2; }
out=$(scripts/workspace.sh close project zz 2>&1); echo "$out" | grep -q "commits that aren't in main" && pass "close stops on GitHub-branch work not in main" || fail "late: $out"
approve project/zz; ( cd $P && git fetch -q && git merge -q --ff-only origin/project/zz ) >/dev/null 2>&1
git remote set-url origin $T/nowhere.git
out=$(scripts/workspace.sh close project zz 2>&1); echo "$out" | grep -q -E "can't reach GitHub|ls-remote failed" && pass "unreachable GitHub stops close" || fail "unreachable: $out"
[ -d $P ] && pass "folder kept when GitHub unreachable" || fail "folder removed"
git remote set-url origin $T/origin.git
# remote branch moves after the check: the lease must refuse the delete
oid=$(git ls-remote origin refs/heads/project/zz | cut -f1)
( cd $T/other && git fetch -q && git checkout -q -B race origin/project/zz && echo r > projects/zz/race.md && git add -A && $RAW commit -qm race && git push -q origin HEAD:project/zz ) >/dev/null 2>&1 || { echo "SETUP FAILED: race push"; exit 2; }
expect_refused "GitHub-branch delete refused when it moved after the check" git push -q --force-with-lease="refs/heads/project/zz:$oid" origin :refs/heads/project/zz
git ls-remote --exit-code origin refs/heads/project/zz >/dev/null && pass "moved branch kept on GitHub" || fail "moved branch deleted"
approve project/zz; ( cd $P && git fetch -q && git merge -q --ff-only origin/project/zz ) >/dev/null 2>&1
out=$(scripts/workspace.sh close project zz 2>&1); echo "$out" | grep -q "^Closed" && pass "close of fully merged project" || fail "close: $out"
[ ! -d $P ] && pass "folder removed" || fail "folder kept"
git show-ref -q refs/heads/project/zz && fail "local branch kept" || pass "local branch removed"
git ls-remote --exit-code origin refs/heads/project/zz >/dev/null && fail "GitHub branch kept" || pass "GitHub branch retired"
P2=$(scripts/workspace.sh project zz | tail -1); need git fetch -q origin
[ "$(git -C $P2 rev-parse HEAD)" = "$(git rev-parse origin/main)" ] && pass "reopen starts exactly at main" || fail "reopen: $(git -C $P2 log --oneline -1)"
need git push -q origin --delete project/zz
out=$(scripts/workspace.sh close project zz 2>&1); echo "$out" | grep -q "^Closed" && pass "close when GitHub branch is already gone" || fail "gone: $out"

echo; echo "Result: $PASSES passed, $FAILS failed   (test folder: $T)"
[ $FAILS -eq 0 ] && rm -rf "$T"
[ $FAILS -eq 0 ]
