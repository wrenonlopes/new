---
description: Monitoring review - diffs against baseline, predicted vs actual, analytics and off-page (Phase 5).
argument-hint: <project-name>
---

Run step 7 of the operating loop for project `$ARGUMENTS`, plus modules Analytics and monitoring and Off-page SEO. `RUN=projects/$ARGUMENTS/reports/<today>`.

## Re-run and diff

1. Re-run the /audit collection step (squirrel, raw-vs-rendered, Lighthouse) into `$RUN`, and `node_modules/squirrelscan/bin/squirrel report <domain> --diff <previous audit id> -f json -o $RUN/squirrel-diff.json`.
2. Compare each check with the previous run: newly failing, newly passing, still failing.
3. If a visibility run is older than 30 days, say so and suggest /visibility. Do not re-run it unasked.

## Predicted vs actual

For each `change-log.md` row whose check-after date has passed: pull the metric from its stated source, fill `Actual`, and mark it hit, missed or inconclusive (with why). Missed predictions are findings, not failures to hide.

## Analytics

- **Success number**: report `success_metric` from the profile, current vs previous period. If it cannot be measured with the data available, say what is missing.
- **Search Console** (MCP): impressions vs clicks and CTR, last 28 days vs the 28 before, by page and by query; pages with rising impressions but flat clicks are title/snippet candidates.
- **GA4**: no connector yet. Ask the user for an export (landing page, sessions, engagement rate, key events), or mark `unknown`. Bounce rate = 1 − engagement rate.
- **Revenue**: which conversions became revenue, only if the user supplies it.

## Off-page

- Links that send customers: referring pages with sessions or conversions (GA4 export), not link counts.
- Search Console top linking sites; Ahrefs Webmaster Tools export if the user supplies one (own sites only).
- Brand mentions: SearXNG `"<brand name>" -site:<domain>`; note new mentions since the last review.
- NAP: is the name, address, phone and hours consistent across the site (squirrel Local SEO rules) and on the listings the user names?
- Who recommends us: third-party pages cited by AI platforms (from the latest /visibility run).

## Output

`$RUN/review.md`: success number, what changed, predicted vs actual, new fix-queue items (ranked per CLAUDE.md), and what data was missing. Update `baseline.json`.
