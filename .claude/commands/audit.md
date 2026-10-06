---
description: Technical + on-page SEO audit for a project (Phase 1). Onboards the project if it has no profile yet.
argument-hint: <project-name>
---

Run the operating loop in CLAUDE.md for project `$ARGUMENTS`, modules Technical SEO and On-page SEO.

## 0. Onboard (only if `projects/$ARGUMENTS/profile.yaml` is missing)

Copy `projects/_template/` to `projects/$ARGUMENTS/`. Ask the user for every profile field in one message, grouped as in the template. Fill what they give; leave the rest empty. Do not invent competitors, prompts or conversions.

## 1. Load

Read `profile.yaml`, `baseline.json` (may not exist yet) and `change-log.md`. Set `RUN=projects/$ARGUMENTS/reports/<today YYYY-MM-DD>` and create it.

## 2. Collect

Run these (independent, can run in parallel):

- `node_modules/squirrelscan/bin/squirrel audit <domain> -C full --render-mode off -f json -o $RUN/squirrel.json`
- `uv run engines/raw_vs_rendered.py <urls> --out $RUN/raw-vs-rendered.json` where urls = `key_urls` + conversion page URLs + up to 15 more pages from the squirrel crawl, choosing the most internally linked.
- `uv run engines/lighthouse_runner.py <key_urls, max 10> --out-dir $RUN`
- If `data_access.search_console` is set and the `search-console` MCP is connected: pull the last 28 days of top queries per page for the audited pages, and any pages with indexing problems. Save to `$RUN/gsc.json`. If not connected, the checks that need it are `unknown`.

Use the `audit-website` skill to interpret squirrel output and the `seo-audit` skill for on-page judgement. The rule base in CLAUDE.md overrides both.

## 3. Score

Write `$RUN/checks.yaml` in the check format from CLAUDE.md. At minimum, one check per question:

Technical
- tech.raw-html: Is the core content in the initial HTML? (raw-vs-rendered; rule base row 1)
- tech.click-depth: Are key and conversion pages within three clicks of the homepage? (heuristic, label it so)
- tech.speed-mobile: Do key pages load fast and stay stable on mobile? (Lighthouse lab; GSC CWV field data wins)
- tech.mobile: Is the page usable on mobile? (viewport, tap targets, font size)
- tech.crawl-index: Can search engines and AI crawlers reach and index every page that should be indexed? (robots.txt incl. GPTBot, OAI-SearchBot, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended; sitemap; noindex; canonicals)
- tech.schema-matches: Does structured data match visible text? (Google rule)
- tech.broken: Are there broken pages, broken links or redirect chains?

On-page
- onpage.title-intent: Do titles match how people ask? (GSC queries per page; rule base "titles match prompt phrasing", scope ChatGPT)
- onpage.meta: Does every indexable page have a unique, specific meta description?
- onpage.h2-answers: Are H2s phrased as questions and answered in the first sentence below them?
- onpage.answer-early: Is the key answer in the first 30% of the page? (scope ChatGPT)
- onpage.declarative-intro: Does the page open with a declarative statement?
- onpage.alt: Do meaningful images have descriptive alt text?
- onpage.anchors: Is internal anchor text descriptive (no "click here")?

Every verdict needs evidence (numbers, URLs, quoted text). No evidence → `unknown`.

## 4. Rank

Write `$RUN/fix-queue.md` using the ranking in CLAUDE.md. Top of file: pass / fail / unknown counts, then the ranked fixes, then "needs data". Each fix says where it is made (from `stack`).

## 5. Predict

For the fixes the user wants to ship, add rows to `change-log.md` with predicted outcome, metric and source, and a check-after date. Leave "Approved by" empty.

## 6. Approve

Show the top 10 fixes and ask the approver named in the profile to approve. Do not change any live site or client repo before approval is recorded in the change log.

## 7. Diff

If `baseline.json` exists: run `node_modules/squirrelscan/bin/squirrel report <domain> --diff <previous audit id> -f json -o $RUN/squirrel-diff.json`, compare checks with the previous run, and fill `Actual` for change-log rows whose check-after date has passed. Then write the new values into `baseline.json` under `audit` (date, squirrel score and category scores, check counts, per-URL Lighthouse metrics, raw-HTML pass rate). On a first run, just write the baseline.

Finish with: counts, the top 5 fixes, and the path to `fix-queue.md`.
