#!/usr/bin/env bash
# Self-test for the git model (workspace.sh, publish.sh, hooks). Builds a throwaway repo with its own fake
# GitHub under $TMPDIR — never touches this repo or GitHub. Usage: scripts/tests/test-git-model.sh
B="$(cd "$(dirname "$0")/../.." && pwd)"; T="$(mktemp -d)"; export HOME_T="$T"
mkdir -p $T/seed; cd $T; git init -q --bare origin.git; cd seed; git init -q; git checkout -q -b main
cp -R $B/scripts $B/templates .; mkdir -p projects/ACOM projects/alpha knowledge
echo a > projects/ACOM/a.md; echo b > projects/alpha/b.md; echo k > knowledge/k.md; printf '.work/\n' > .gitignore
git add -A; git -c user.name=t -c user.email=t@t -c core.hooksPath=/dev/null commit -q -m seed
git remote add origin $T/origin.git; git push -q origin main; git --git-dir=$T/origin.git symbolic-ref HEAD refs/heads/main
cd $T; git clone -q origin.git repo
(   cd $HOME_T/repo; git config user.name t; git config user.email t@t; git config core.hooksPath scripts/git-hooks
  ok(){ echo "  PASS: $1"; }; bad(){ echo "  FAIL: $1"; }
  echo "T1 commit on main"; echo x >> knowledge/k.md; git add knowledge/k.md; git commit -q -m x 2>/dev/null && bad "allowed" || ok "refused"; git restore --staged knowledge/k.md; git checkout -q -- knowledge/k.md
  echo "T12 bad names"; scripts/workspace.sh project .. >/dev/null 2>&1 && bad ".. accepted" || ok ".. refused"; scripts/workspace.sh project .hidden >/dev/null 2>&1 && bad ".hidden accepted" || ok ".hidden refused"
  echo "T15 collaborator"; scripts/workspace.sh project type1-revamp 2>&1 | grep -q "Swapnil" && ok "open refused" || bad "open"
  echo "T2 new project"; P=$(scripts/workspace.sh project zz | tail -1); [ -f "$P/projects/zz/CLAUDE.md" ] && ok "scaffolded" || bad "no scaffold"; grep -q '^gitdir: \.\./\.\./\.git/worktrees/zz$' $P/.git && ok "relative link" || bad "link $(cat $P/.git)"; [ -f .git/worktrees/zz/locked ] && ok locked || bad unlocked; git ls-remote --exit-code origin refs/heads/project/zz >/dev/null && ok "branch on remote" || bad "no remote branch"
  cd $P
  echo "T3 own publish"; echo n > projects/zz/note.md; scripts/publish.sh -m own projects/zz/note.md 2>&1 | grep -q "^Pushed" && ok pushed || bad "not pushed"
  echo "T4/T5 cross-project via publish"; echo y >> projects/ACOM/a.md; out=$(scripts/publish.sh -m bad projects/ACOM/a.md 2>&1); echo "$out" | grep -q "NOT committed" && ok refused || bad "$out"; [ "$(git diff --cached --name-only)" = projects/ACOM/a.md ] && ok "staged work kept" || bad "staged lost"; git restore --staged -- projects/ACOM/a.md; git checkout -q -- projects/ACOM/a.md
  echo "T9 cross-project rename"; git mv projects/alpha/b.md projects/zz/b.md; git commit -q -m mv 2>/dev/null && bad allowed || ok refused; git reset -q --hard
  echo "T10 newline filename"; f=$'projects/ACOM/x\nprojects/zz/y.md'; echo q > "$f"; git add -- "$f"; git commit -q -m nl 2>/dev/null && bad allowed || ok refused; git reset -q --hard; rm -f "$f"
  echo "T10b own newline filename"; g=$'projects/zz/a\nb.md'; echo q > "$g"; git add -- "$g"; git commit -q -m nl2 2>/dev/null && ok allowed || bad refused; git reset -q --hard HEAD~1
  echo "T11 detached"; git checkout -q --detach; echo d > projects/zz/d.md; git add projects/zz/d.md; git commit -q -m d 2>/dev/null && bad allowed || ok refused; git reset -q --hard; rm -f projects/zz/d.md; git checkout -q project/zz )
(   ok(){ echo "  PASS: $1"; }; bad(){ echo "  FAIL: $1"; }
  R=$HOME_T/repo; P=$R/.work/zz; cd $P
  echo "T10 newline filename in a foreign project"; f=$'projects/ACOM/q\nr.md'; echo q > "$f"; git add -- "$f"; git commit -q -m nl 2>/dev/null && bad allowed || ok refused; git reset -q --hard; rm -f "$f"
  # main moves on (simulate an approved PR elsewhere)
  rm -rf $HOME_T/other; git clone -q $HOME_T/origin.git $HOME_T/other; ( cd $HOME_T/other && echo m >> projects/ACOM/a.md && git -c user.name=t -c user.email=t@t -c core.hooksPath=/dev/null commit -qam "acom approved" && git push -q origin main )
  echo "T6 merge of main (automatic) allowed"; git fetch -q origin; git merge -q --no-edit origin/main 2>/dev/null && ok merged || bad refused
  echo "T7 automatic merge of another project's branch refused"; git branch -q other-proj origin/main; ( git checkout -q other-proj && echo o >> projects/alpha/b.md && git -c core.hooksPath=/dev/null commit -qam "alpha work" ) ; git checkout -q project/zz; git merge -q --no-edit other-proj 2>/dev/null && bad allowed || ok refused; git merge --abort 2>/dev/null; git reset -q --hard origin/project/zz 2>/dev/null; git merge -q --no-edit origin/main
  echo "T8 fast-forward bypass caught by publish gate"; git checkout -q -b ff-src; echo o >> projects/alpha/b.md; git -c core.hooksPath=/dev/null commit -qam "alpha via ff"; git checkout -q project/zz; git merge -q --ff-only ff-src && echo "  (fast-forward happened, no hook ran)"; echo z > projects/zz/z.md; out=$($R/scripts/publish.sh -m ff projects/zz/z.md 2>&1); echo "$out" | grep -q "would change more than it may" && ok "gate stopped push" || bad "$out"; git ls-remote origin refs/heads/project/zz | cut -c1-7; git reset -q --hard origin/project/zz; git branch -q -D ff-src other-proj
  echo "T13 folder on the wrong branch"; git checkout -q -b wrong; out=$($R/scripts/workspace.sh project zz 2>&1); echo "$out" | grep -q "is not on project/zz" && ok refused || bad "$out"; git checkout -q project/zz; git branch -q -D wrong
  echo "T15b publish/hook on collaborator branch"; git checkout -q -b project/type1-revamp; echo t > projects/zz/t.md; out=$($R/scripts/publish.sh -m t projects/zz/t.md 2>&1); echo "$out" | grep -q Swapnil && ok "publish refused" || bad "$out"; git add projects/zz/t.md; git commit -q -m t 2>/dev/null && bad "hook allowed" || ok "hook refused"; git reset -q --hard; rm -f projects/zz/t.md; git checkout -q project/zz; git branch -q -D project/type1-revamp
  echo "T16 runner outside shared/weekly-auto"; node scripts/run-synthesis.js >/dev/null 2>&1 && bad ran || ok stopped
  echo "shared branch may not change a project"; S=$($R/scripts/workspace.sh shared docs-x | tail -1); cd $S; echo s >> projects/ACOM/a.md; git add projects/ACOM/a.md; git commit -q -m s 2>/dev/null && bad allowed || ok refused; git reset -q --hard )
(   ok(){ echo "  PASS: $1"; }; bad(){ echo "  FAIL: $1"; }
  R=$HOME_T/repo; P=$R/.work/zz; cd $R
  echo "T14a unmerged work"; out=$(scripts/workspace.sh close project zz 2>&1); echo "$out" | grep -q "isn't merged into main" && ok stopped || bad "$out"; [ -d $P ] && ok "folder kept" || bad "folder gone"
  # approve: merge project/zz into main on the "GitHub" side
  ( cd $HOME_T/other && git fetch -q && git merge -q --no-edit -c core.hooksPath=/dev/null origin/project/zz 2>/dev/null || git -c core.hooksPath=/dev/null -c user.name=t -c user.email=t@t merge -q --no-edit origin/project/zz; git push -q origin main )
  echo "T14b untracked/ignored files present"; echo log > $P/build.log; echo "build.log" >> $R/.git/info/exclude; touch $P/.DS_Store; out=$(scripts/workspace.sh close project zz 2>&1); echo "$out" | grep -q "would be lost" && ok stopped || bad "$out"; echo "$out" | grep -q "build.log" && ok "lists build.log" || bad "not listed"; echo "$out" | grep -q DS_Store && bad "listed .DS_Store" || ok ".DS_Store ignored"; [ -f $P/build.log ] && ok "nothing removed" || bad "removed"; rm $P/build.log
  echo "T14c GitHub branch has commits not in main"; ( cd $HOME_T/other && git checkout -q -b x origin/project/zz && echo late > projects/zz/late.md && git add -A && git -c core.hooksPath=/dev/null -c user.name=t -c user.email=t@t commit -qm late && git push -q origin HEAD:project/zz && git checkout -q main ); out=$(scripts/workspace.sh close project zz 2>&1); echo "$out" | grep -q "commits that aren't in main" && ok stopped || bad "$out"; ( cd $HOME_T/other && git push -q -f origin origin/main:refs/heads/project/zz 2>/dev/null; git fetch -q )
  echo "T14d all merged -> close retires folder, local and GitHub branch"; out=$(scripts/workspace.sh close project zz 2>&1); echo "$out" | tail -1; [ ! -d $P ] && ok "folder gone" || bad "folder kept"; git show-ref -q refs/heads/project/zz && bad "local branch kept" || ok "local branch gone"; git ls-remote --exit-code origin refs/heads/project/zz >/dev/null && bad "remote kept" || ok "remote retired"; [ -f .DS_Store ] ; ls .git/worktrees
  echo "T14e reopen starts fresh from main"; P2=$(scripts/workspace.sh project zz | tail -1); [ "$(git -C $P2 rev-parse HEAD^)" = "$(git rev-parse origin/main)" ] && ok "fresh from main" || echo "  head: $(git -C $P2 log --oneline -2 | tr '\n' ' ')"
  echo "T14f merged and GitHub branch already deleted"; git push -q origin --delete project/zz; ( cd $HOME_T/other && git fetch -q && git -c core.hooksPath=/dev/null -c user.name=t -c user.email=t@t merge -q --no-edit origin/main 2>/dev/null; true ); git -C $P2 reset -q --hard origin/main; out=$(scripts/workspace.sh close project zz 2>&1); echo "$out" | tail -1 )
echo "Test folder: $T (delete when done)"
