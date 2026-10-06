---
description: Apply approved SEO fixes from the latest fix queue, routed by stack (code edits on a branch, CMS admin steps, or a developer handoff).
argument-hint: "[check ids | top N] [--approver NAME]"
---

Load the `seo-system` and `fix-recipes` skills. P=${CLAUDE_PROJECT_DIR}/.seo

Read `$P/profile.yaml`, `$P/change-log.md`, and the newest `$P/reports/<date>/fix-queue.md` with its `checks.yaml`. Use a `-local` run only if no production run exists. No fix queue → tell the user to run /seo:audit and stop.

## 1. Select

From `$ARGUMENTS` take check ids (e.g. `onpage.h1 tech.schema-valid`) or `top N`, plus an optional `--approver NAME`. With no selection, show the top 10 fixes, ask which to apply, and stop until answered.

## 2. Predict and approve (before any change)

For each selected item, add a row to `$P/change-log.md` with these fields:
- date, check id, change, pages;
- predicted outcome, plus the metric and its source;
- check-after date: +7 days for technical checks the next audit re-verifies, +28 days for anything measured in Search Console;
- approver, and where the fix will live.

The approver is the `--approver` value. Otherwise use `approval.approver` from the profile, after the user confirms in chat. Otherwise ask the user for a name. With no approver, stop: nothing ships.

## 3. Apply, by `stack.type`

### code

1. Run `git -C "${CLAUDE_PROJECT_DIR}" status --porcelain -- . ':!.seo'`. If it prints anything, stop with "Working tree has uncommitted changes; commit or stash them first." Never stash or commit the user's own work.
2. Run `git -C "${CLAUDE_PROJECT_DIR}" switch -c "seo/fix-$(date +%F)"`, or `switch` to it if it already exists.
3. For each item: make the edit following `fix-recipes` for `stack.framework`, then commit only the files that fix touched: `seo: <check id> <summary>`, ending with the Co-Authored-By trailer.
4. If `package.json` has a `build` script, run `npm run build`; if it has a `test` script, run `npm test`. Report failures. Do not change code unrelated to the selected fixes.
5. Re-verify each fixed item on a local URL. Use the dev or preview URL given by the user, or the one from the last `--local` audit. Re-run only the engine that produced the check, only for the fixed pages (raw_vs_rendered, site_graph, schema_check or squirrel), and report pass or fail per item. If no local URL is available, say so; the next audit verifies instead.
6. Show `git log --oneline <default branch>..HEAD` and `git diff --stat <default branch>...HEAD`. Never merge into the default branch, push or deploy. Tell the user how to review and merge.

### cms

Write `$P/handoff/<YYYY-MM-DD>.md`. For each item give the admin screen, the setting and the exact value to enter (title text, meta text, redirect from → to, schema field), plus how to verify after saving. Follow `fix-recipes` for `stack.cms`.

### none

Write `$P/handoff/<YYYY-MM-DD>.md` for the site's developer. For each item give the problem with its evidence, the exact code for the detected stack (`stack.framework`, or the technologies in the latest `raw/squirrel.json`), and the acceptance test: which check id must pass.

## 4. Finish

In each change-log row, record where the fix lives: the branch and commit, or the handoff file. Say that `/seo:audit` after deploy confirms the fix on production, and that the change log's `Actual` column gets filled then.
