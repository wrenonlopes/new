---
description: Apply approved SEO fixes from the latest fix queue, routed by stack (code edits on a branch, CMS admin steps, or a developer handoff).
argument-hint: "[check ids | top N] [--approver NAME]"
---

Load the `seo-system` and `fix-recipes` skills. P=${CLAUDE_PROJECT_DIR}/.seo

Read `$P/profile.yaml`, `$P/change-log.md`, and the newest `$P/reports/<date>/fix-queue.md` with its `checks.yaml`. Use a `-local` run only if no production run exists. No fix queue → tell the user to run /seo:audit and stop.

## 1. Select

From `$ARGUMENTS` take check ids (e.g. `onpage.h1 tech.schema-valid`) or `top N`, plus an optional `--approver NAME`. Only checks with `verdict: fail` in `checks.yaml` can be selected; for any other id say why it is skipped, and stop if nothing selectable remains. With no selection, show the top 10 fixes, ask which to apply, and stop until answered.

## 2. Show the plan and get approval (nothing is written yet)

Show each selected item: check id, the change in one sentence, the files or admin screens it touches, pages, and predicted outcome.

Approval:
- `--approver NAME` that matches `approval.approver` in the profile (case-insensitive, trimmed) → approved by that name.
- Otherwise (no flag, a different name, or no approver in the profile): ask "Approve these changes as <name>?" and wait for an explicit yes in chat that names the approver.

Without approval, stop. Write no change-log row, create no branch and edit no file. In a non-interactive run, an unanswered question means no approval.

## 3. Preflight for `stack.type: code` (no row or edit yet)

Run each command from `${CLAUDE_PROJECT_DIR}`. On any failure, stop with the message shown and write nothing.

1. `git rev-parse --is-inside-work-tree`. If this is not a git repository, stop with "Not a git repository: run /seo:fix after `git init`, or set `stack.type: none` for a handoff."
2. `git status --porcelain --untracked-files=all -- . ':!.seo'`. If it prints anything, stop with "Working tree has uncommitted or untracked changes; commit or stash them first." Never stash, commit or delete the user's own work.
3. Find the default branch, DEFAULT:
   - `git symbolic-ref --quiet --short refs/remotes/origin/HEAD` with the `origin/` prefix removed;
   - otherwise `main`, if `git show-ref --verify --quiet refs/heads/main` succeeds;
   - otherwise `master`, by the same test;
   - otherwise ask the user which branch is the default, and stop.
4. FIX=`seo/fix-<YYYY-MM-DD>`, using today's date. If FIX exists, `git switch "$FIX"`; otherwise `git switch -c "$FIX" "$DEFAULT"`.
5. `[ "$(git branch --show-current)" = "$FIX" ]`. If not, stop with "Not on $FIX; no edits made."

## 4. Log the prediction

Only now add one row per approved item to `$P/change-log.md`:
- date, check id, change, pages;
- predicted outcome, plus the metric and its source;
- check-after date: +7 days for technical checks the next audit re-verifies, +28 days for anything measured in Search Console;
- approver;
- Where: `$FIX` for code, or the handoff file for cms and none.

## 5. Apply, by `stack.type` (an empty or unknown value means `none`)

### code

1. Before each edit, confirm `git branch --show-current` is still `$FIX`; if not, stop and mark the remaining rows `Not applied: left $FIX`. For each item, make the edit following `fix-recipes` for `stack.framework`. Then commit only the files that fix touched (`git add <those files>`, never `git add -A`), with the message `seo: <check id> <summary>` ending with the Co-Authored-By trailer. Never commit `.seo/`.
2. If `package.json` has a `build` script, run `npm run build`; if it has a `test` script, run `npm test`. Report failures. Never commit build or test output. If `git status --porcelain --untracked-files=all -- . ':!.seo'` is not empty afterwards, list the changed files and leave them for the user. Do not change code unrelated to the selected fixes.
3. Re-verify each fixed item on a local URL: the dev or preview URL given by the user, or the one from the last `--local` audit. Re-run only the engine that produced the check (raw_vs_rendered, site_graph, schema_check or squirrel), only for the fixed pages, and report pass or fail per item. Judgment checks, or no local URL: say that the next audit verifies them.
4. Show `git log --oneline "$DEFAULT..$FIX"` and `git diff --stat "$DEFAULT...$FIX"`. Never merge into DEFAULT, push or deploy. Tell the user how to review and merge.

### cms

Never edit the live CMS. `mkdir -p "$P/handoff"`, then write `$P/handoff/<YYYY-MM-DD>.md`. For each item give the admin screen, the setting and the exact value to enter (title text, meta text, redirect from → to, schema field), plus how to verify after saving. Follow `fix-recipes` for `stack.cms`.

### none

`mkdir -p "$P/handoff"`, then write `$P/handoff/<YYYY-MM-DD>.md` for the site's developer. For each item give the problem with its evidence, the exact code for the detected stack (`stack.framework`, or the technologies in the latest `raw/squirrel.json`), and the acceptance test: which check id must pass.

## 6. Finish

Every row written in step 4 ends with a final `Where`:
- the branch and commit;
- the handoff file;
- or `Not applied: <reason>` for an item whose edit or commit did not happen. Never leave a row that claims a fix that is not there.

Say that `/seo:audit` after deploy confirms the fix on production, and that the change log's `Actual` column gets filled then.
