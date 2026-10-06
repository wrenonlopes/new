#!/usr/bin/env bash
# End-to-end: run /seo:audit against the fixture site on localhost and check every planted problem is caught.
# Needs the plugin installed (claude plugin install seo@seo-tool). Uses Claude usage.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="$(mktemp -d)"
PORT="${PORT:-8765}"
cp -R "$HERE/fixture-site/site" "$WORK/site"
mkdir -p "$WORK/project/.seo"
cp "$HERE/fixture-site/profile.yaml" "$WORK/project/.seo/profile.yaml"
cp "$HERE/../plugins/seo/templates/change-log.md" "$WORK/project/.seo/change-log.md"
python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$WORK/site" >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null' EXIT
UP=""
for i in $(seq 1 20); do curl -sf "http://127.0.0.1:$PORT/" >/dev/null && { UP=1; break; }; sleep 0.25; done
[ -n "$UP" ] || { echo "FAIL: fixture server did not answer on port $PORT"; exit 1; }
cd "$WORK/project"
# --plugin-dir pins the working-tree plugin instead of whatever copy Claude Code has installed.
claude -p "/seo:audit --local http://127.0.0.1:$PORT" --plugin-dir "$HERE/../plugins/seo" --permission-mode bypassPermissions < /dev/null > "$WORK/claude.log" 2>&1 || true
echo "log: $WORK/claude.log"
ls -d "$WORK"/project/.seo/reports/*-local >/dev/null 2>&1 || { echo "FAIL: no -local run folder"; exit 1; }
[ ! -e "$WORK/project/.seo/baseline.json" ] || { echo "FAIL: local run wrote baseline.json"; exit 1; }
uv run --script "$HERE/check_expected.py" "$HERE/fixture-site/expected.yaml" "$WORK/project/.seo/reports"
