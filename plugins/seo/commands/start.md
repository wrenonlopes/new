---
description: Start here. Sets up the seo plugin in a new project, or shows this project's SEO status and the next step.
---

Load the `seo-system` skill. P=${CLAUDE_PROJECT_DIR}/.seo

If `$P/profile.yaml` does not exist: say "No SEO setup in this folder yet", then follow ${CLAUDE_PLUGIN_ROOT}/commands/setup.md step by step and stop after its report.

Otherwise, show compactly:

1. **Project**: domain, `stack.type`/`stack.framework`, credential tier from `uv run --script "${CLAUDE_PLUGIN_ROOT}/engines/doctor.py" --root "${CLAUDE_PLUGIN_ROOT}" --data "${CLAUDE_PLUGIN_DATA}" --quick`.
2. **Latest production audit** (newest `$P/reports/<date>/checks.yaml`, ignoring `-local` folders): date, pass/fail/unknown counts for `tech.*` and `onpage.*`, and the top 3 items of its `fix-queue.md`.
3. **Due**: change-log rows whose check-after date is today or earlier and whose `Actual` is empty; failed fix-queue items not yet in the change log.
4. **Next step**, the first that applies:
   - no production audit, or the newest is older than 30 days → `/seo:audit`;
   - failed fixes not yet applied → `/seo:fix top 5`;
   - predictions due → `/seo:audit` to measure them;
   - otherwise → "Nothing due."
