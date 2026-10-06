#!/bin/sh
# Pass Bash events to guard.py only when they mention squirrel, so every other Bash call stays fast.
i=$(cat)
case "$i" in
  *squirrel*) printf '%s' "$i" | python3 "$(dirname "$0")/guard.py" ;;
esac
