#!/usr/bin/env bash
# End-to-end: /seo:fix on a static-HTML code project must refuse without approval or on an unclean tree
# (writing nothing), and on a clean tree must commit the fix on a branch, leave main alone and log the row.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="$(mktemp -d)"
DAY="$(date +%F)"
cp -R "$HERE/fixture-site/site" "$WORK/project"
cd "$WORK/project"
git init -q -b main && git add -A && git -c user.name=t -c user.email=t@t commit -qm init
MAIN_SHA=$(git rev-parse main)
mkdir -p ".seo/reports/$DAY"
cp "$HERE/fixture-site/profile.yaml" .seo/profile.yaml
cp "$HERE/../plugins/seo/templates/change-log.md" .seo/change-log.md
cp .seo/change-log.md "$WORK/log0.md"
cat > ".seo/reports/$DAY/checks.yaml" <<'EOF'
- id: onpage.h1
  question: Does every indexable page have exactly one descriptive H1?
  verdict: fail
  pages: [https://fixture.example/no-h1.html]
  evidence: no-h1.html has no <h1>; its first heading is an <h2>
  source: squirrel core/h1
EOF
cat > ".seo/reports/$DAY/fix-queue.md" <<'EOF'
# Fix queue
1. onpage.h1: add one descriptive <h1> to no-h1.html (static HTML). Pages: /no-h1.html
EOF
# .seo/ stays untracked on purpose: only the command's ':!.seo' pathspec keeps it out of the dirty check.

# --plugin-dir pins the working-tree plugin instead of whatever copy Claude Code has installed.
# A session that never ran (logged out, usage limit) would make every refusal case pass vacuously, so fail on that.
run() {
  claude -p "$1" --plugin-dir "$HERE/../plugins/seo" --permission-mode bypassPermissions < /dev/null > "$WORK/$2.log" 2>&1 || true
  [ -s "$WORK/$2.log" ] && ! grep -qiE "Failed to authenticate|OAuth session expired|Not logged in|Invalid API key" "$WORK/$2.log" \
    || { echo "FAIL($2): claude did not run; see $WORK/$2.log"; exit 1; }
}
# Find the fix branch by pattern so a run that crosses midnight still passes.
fixbr() { git for-each-ref --format='%(refname:short)' 'refs/heads/seo/fix-*'; }
untouched() {  # $1 = case name: no fix branch, no row, no-h1.html unchanged, still on main
  [ -z "$(fixbr)" ] || { echo "FAIL($1): fix branch created"; exit 1; }
  cmp -s .seo/change-log.md "$WORK/log0.md" || { echo "FAIL($1): change-log written"; exit 1; }
  git diff --quiet HEAD -- no-h1.html || { echo "FAIL($1): no-h1.html edited"; exit 1; }
  [ "$(git rev-parse main)" = "$MAIN_SHA" ] || { echo "FAIL($1): main moved"; exit 1; }
  [ "$(git branch --show-current)" = main ] || { echo "FAIL($1): left main"; exit 1; }
}

# Case 1: no approver. The profile names E2E Test, but nobody confirms in chat.
run "/seo:fix onpage.h1" noapprover; untouched noapprover

# Case 2: dirty tracked file must be refused, and the local edit must survive.
echo "<!-- local edit -->" >> index.html
run "/seo:fix onpage.h1 --approver 'E2E Test'" dirty; untouched dirty
grep -q "local edit" index.html || { echo "FAIL(dirty): local edit lost"; exit 1; }
git checkout -q -- index.html

# Case 3: untracked file must be refused, and the file must survive.
echo note > notes.txt
run "/seo:fix onpage.h1 --approver 'E2E Test'" untracked; untouched untracked
[ -f notes.txt ] || { echo "FAIL(untracked): notes.txt removed"; exit 1; }
rm notes.txt

# Case 4: clean tree, fix is committed on its own branch.
run "/seo:fix onpage.h1 --approver 'E2E Test'" clean
BR=$(fixbr)
fail=0
{ [ -n "$BR" ] && [ "$(echo "$BR" | wc -l)" -eq 1 ] && [ "$(git branch --show-current)" = "$BR" ]; } || { echo "FAIL: not exactly one fix branch, or not on it ($BR)"; fail=1; }
[ "$(git rev-parse main)" = "$MAIN_SHA" ] || { echo "FAIL: main changed"; fail=1; }
[ "$(git rev-list --count "main..$BR")" = 1 ] || { echo "FAIL: fix branch is not exactly one commit ahead of main"; fail=1; }
[ "$(git diff --name-only "main..$BR")" = "no-h1.html" ] || { echo "FAIL: commit touches more than no-h1.html"; fail=1; }
git show "$BR:no-h1.html" | grep -qi "<h1" || { echo "FAIL: <h1> not committed"; fail=1; }
git log -1 --format=%B "$BR" | grep -q '^Co-Authored-By: ' || { echo "FAIL: commit lacks Co-Authored-By trailer"; fail=1; }
[ -z "$(git status --porcelain --untracked-files=all -- . ':!.seo')" ] || { echo "FAIL: tree not clean after fix"; fail=1; }
grep "onpage.h1" .seo/change-log.md | grep "E2E Test" | grep -q "$BR" || { echo "FAIL: change-log row missing approver or branch"; fail=1; }

if [ $fail = 0 ]; then echo "e2e fix OK"; rm -rf "$WORK"; else echo "logs: $WORK/*.log"; fi
exit $fail
