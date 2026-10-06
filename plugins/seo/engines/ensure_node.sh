#!/bin/sh
# Install the plugin's pinned Node tools into the plugin data folder.
# Reinstalls only when package-lock.json changes. Prints the install directory.
# Usage: sh ensure_node.sh <plugin root>/node <plugin data>/node
set -eu
SRC="$1"
DST="$2"
mkdir -p "$DST"
cp "$SRC/package.json" "$SRC/package-lock.json" "$SRC/schema_check.mjs" "$DST/"
LOCK=$(shasum -a 256 "$DST/package-lock.json" | cut -c1-64)
if [ ! -d "$DST/node_modules" ] || [ ! -f "$DST/.lock-sha" ] || [ "$(cat "$DST/.lock-sha")" != "$LOCK" ]; then
  (cd "$DST" && npm ci --no-fund --no-audit >&2)
  echo "$LOCK" > "$DST/.lock-sha"
fi
# squirrelscan downloads its native binary in postinstall; run it if npm skipped install scripts.
if [ ! -x "$DST/node_modules/squirrelscan/bin/squirrel" ]; then
  (cd "$DST/node_modules/squirrelscan" && SQUIRREL_VERSION=v0.0.98 node scripts/postinstall.js >&2)
fi
echo "$DST"
