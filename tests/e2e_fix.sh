#!/usr/bin/env bash
# End-to-end: /seo:fix on a static-HTML code project must branch, fix, log, and refuse a dirty tree.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="$(mktemp -d)"
DAY="$(date +%F)"
cp -R "$HERE/fixture-site/site" "$WORK/project"
cd "$WORK/project"
git init -q -b main && git add -A && git -c user.name=t -c user.email=t@t commit -qm init
mkdir -p ".seo/reports/$DAY"
cp "$HERE/fixture-site/profile.yaml" .seo/profile.yaml
cp "$HERE/../plugins/seo/templates/change-log.md" .seo/change-log.md
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
printf '.seo/\n' > .git/info/exclude

# --plugin-dir pins the working-tree plugin instead of whatever copy Claude Code has installed.
# Dirty tree must be refused.
echo "<!-- local edit -->" >> index.html
claude -p "/seo:fix onpage.h1 --approver 'E2E Test'" --plugin-dir "$HERE/../plugins/seo" --permission-mode bypassPermissions < /dev/null > "$WORK/dirty.log" 2>&1 || true
if git rev-parse --verify -q "seo/fix-$DAY" >/dev/null; then echo "FAIL: branch created on a dirty tree"; exit 1; fi
git checkout -q -- index.html

# Clean tree: fix lands on a branch.
claude -p "/seo:fix onpage.h1 --approver 'E2E Test'" --plugin-dir "$HERE/../plugins/seo" --permission-mode bypassPermissions < /dev/null > "$WORK/clean.log" 2>&1 || true
fail=0
[ "$(git branch --show-current)" = "seo/fix-$DAY" ] || { echo "FAIL: not on seo/fix-$DAY"; fail=1; }
grep -qi "<h1" no-h1.html || { echo "FAIL: no <h1> added"; fail=1; }
[ "$(git rev-list --count main)" = "1" ] || { echo "FAIL: main changed"; fail=1; }
grep -q "onpage.h1" .seo/change-log.md && grep -q "E2E Test" .seo/change-log.md || { echo "FAIL: change-log row missing"; fail=1; }
echo "logs: $WORK/dirty.log $WORK/clean.log"
[ $fail = 0 ] && echo "e2e fix OK"
exit $fail
