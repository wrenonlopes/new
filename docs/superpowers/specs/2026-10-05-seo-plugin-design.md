# SEO plugin: design

Date: 2026-10-05 · Status: approved in brainstorming, awaiting spec review
Source blueprint: `SEO + AI Search Visibility System — Blueprint.md`

## 1. Goal

Install once, then in any project folder get the full SEO + AI-search loop: audit → ranked fixes → fixes applied (after approval) → AI-visibility tracking → weekly monitoring. Open-source tools and skills first; custom code only as glue.

Success criteria:
1. In a folder with no prior setup, `/seo:start` reaches a first ranked fix queue with no credentials configured (tier 0).
2. The same commands work for a code repo, a CMS site and a no-code client site; only the fix route differs.
3. Every check is pass / fail / unknown with evidence; missing data yields `unknown` plus what would unlock it.
4. The fixture site's planted problems are all caught by `/seo:audit` (section 11).
5. No secret value is written to any config file; no paid call happens without a shown estimate and a yes.

## 2. Decisions recorded

| Decision | Choice |
| --- | --- |
| Shape | Global Claude Code plugin; state per project in `.seo/` |
| Packaging | Self-contained plugin (approach A): uv inline-dependency scripts, pinned `npx` tools, no venv or node_modules to manage |
| Project types | All: code repos (any framework), WordPress/CMS, client sites without code |
| Monitoring | Weekly scheduled run per project, local |
| Tooling principle | Open source first; MIT / Apache / BSD preferred; GPL recommend-only; AGPL never bundled |
| AI-citation tracker | Own `prompt_runner.py` default; Limelit opt-in pilot |
| Process tooling | superpowers plugin (installed 6.4.1, user scope) |

Non-goals: hosted service or UI dashboard; rank-history UI (SerpBear, OpenSEO); automated ChatGPT/Perplexity querying (stays manual, no free API); auto-deploying or pushing fixes; selling/licensing decisions (blueprint open decision, unchanged).

## 3. Commands

All namespaced `/seo:<name>` (plugin commands cannot be bare).

| Command | Behaviour |
| --- | --- |
| `/seo:start` | No `.seo/` → runs setup. Otherwise: status (latest check counts per module, credential tier, items due: predictions past check date, visibility run older than 30 days) and offers the next step. |
| `/seo:setup` | Prerequisite check; tier report; auto-detect profile; ask only for missing fields; register MCP servers; write permission denies; create weekly task. Idempotent: re-running updates, never duplicates. |
| `/seo:audit [--local URL]` | Technical + on-page checks → `checks.yaml` + `fix-queue.md`. `--local` audits a dev server instead of production. |
| `/seo:fix [ids \| top N]` | Applies approved fixes via the stack route (section 8). |
| `/seo:research` | Keywords + page map. DataForSEO is the source of record. |
| `/seo:brief <group or URL>` | Content brief from the rule base; draft only on request. |
| `/seo:visibility [chatgpt] [perplexity] [--limelit]` | AI mentions and citations, one file per platform. |
| `/seo:review` | Re-run, diff, predicted vs actual, Search Console, GA4, off-page. Run weekly by the schedule. |

Command bodies stay thin: load the `seo-system` skill, then run the module steps. Behaviour lives in skills and engines, not in duplicated command text.

## 4. Credential tiers

| Tier | Needs | Unlocks |
| --- | --- | --- |
| 0 | nothing | squirrelscan, Crawl4AI raw-vs-rendered, Unlighthouse, schema validator, SearXNG autocomplete (if Docker), Claude Code web-search visibility |
| 1 | Search Console OAuth client; `GOOGLE_API_KEY` | Real queries and positions, indexing and URL Inspection, AI Overview impressions; CrUX field data |
| 2 | DataForSEO login; `GEMINI_API_KEY`; GA4 via Google ADC | Volumes, difficulty, SERP and PAA; Gemini citations; engagement and conversions |

Credentials come only from the shell environment (`DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD`, `GSC_OAUTH_CLIENT_SECRETS_FILE`, `GOOGLE_API_KEY`, `GEMINI_API_KEY`) and Google Application Default Credentials for GA4. Setup reports which tier is active and the exact step to reach the next.

## 5. Per-project state

```text
<project>/.seo/
  profile.yaml        committed  (template fields + stack.type: code | cms | none)
  baseline.json       committed
  change-log.md       committed  (predictions, approvals, actuals, run costs)
  reports/<date>/     committed: checks.yaml, fix-queue.md, review.md, summaries
  reports/<date>/raw/ gitignored: tool dumps (squirrel JSON, Unlighthouse output, etc.)
  visibility/<date>/  committed: <platform>.json, report.md
  briefs/, handoff/   committed
  .gitignore          written by setup: raw/
```

Vendored skills that look for `.agents/product-marketing.md` use `.seo/profile.yaml` instead; the plugin never creates that file.

## 6. Architecture and layout

```text
seo-tool/                              this repo = plugin source + marketplace
  .claude-plugin/marketplace.json      one plugin, source ./plugins/seo
  plugins/seo/
    .claude-plugin/plugin.json
    commands/   start setup audit fix research brief visibility review (.md)
    skills/
      seo-system/      rule base, operating loop, check format, ranking, spend guards (from CLAUDE.md)
      fix-recipes/     per-stack fix instructions (section 8)
      seo-audit, ai-seo, schema, site-architecture, programmatic-seo,
      content-strategy, competitors, copywriting, analytics   (marketingskills @5b2c000)
      audit-website                                           (squirrelscan/skills @993ff2e)
      core-web-vitals, performance                            (addyosmani/web-quality-skills, pinned, scanned)
    engines/
      raw_vs_rendered.py   kept (uv script, inline deps)
      schema_check.mjs     new: @adobe/structured-data-validator + visible-text match
      prompt_runner.py     kept (uv script)
      test_engines.py
    templates/  profile.yaml, change-log.md
    searxng/    docker-compose.yml, settings.yml (optional)
    NOTICE      third-party credits and licences
  tests/fixture-site/  planted-problem pages + expected.yaml
  docs/superpowers/specs/, docs/superpowers/plans/
```

Paths inside command and skill bodies use `${CLAUDE_PLUGIN_ROOT}` (engines, templates) and `${CLAUDE_PROJECT_DIR}` (state). `CLAUDE_PLUGIN_ROOT` is substituted into skill and command text but is not exported to Bash, so commands write the substituted path into each Bash call.

Install: add this repo as a local marketplace, install `seo@seo-tool` at user scope. Local-path plugins are read in place, so edits apply on the next session or `/reload-plugins`.

The 51 skills vendored in this repo's `.claude/skills/` stay project-level here; the plugin carries only the subset above, to keep every session's skill list small.

## 7. Open-source stack

| Module | Tool | Licence | Use |
| --- | --- | --- | --- |
| Site audit, links, a11y, local NAP | squirrelscan CLI 0.0.98 | MIT | `npx -y squirrelscan@0.0.98 ...` audits, `report --diff` for monitoring. Local only: never `--render`, `-y`, `--publish`, `auth`. |
| Raw vs rendered | Crawl4AI 0.9.4 | Apache-2.0 + attribution clause | `raw_vs_rendered.py`; credit line in NOTICE and README |
| Lab speed, site-wide | Unlighthouse CI 0.19.x | MIT | `npx -y unlighthouse-ci@0.19.1 --site <url> --reporter jsonExpanded` (version and flags verified in the plan); replaces `lighthouse_runner.py` |
| Field speed | CrUX API | Google service | One `curl` per origin/URL with `GOOGLE_API_KEY`; field beats lab |
| Structured data | @adobe/structured-data-validator 1.7.x + @marbec/web-auto-extractor; schema.org vocabulary v30.1 | Apache-2.0 / MIT / Apache-2.0 | `schema_check.mjs`: validity + Google requirements + every JSON-LD string value of 4+ words checked against visible text |
| Google's own rich-result verdict | Search Console URL Inspection (existing mcp-gsc) | — | Tier 1, verified sites |
| Click depth, anchors, hreflang | squirrelscan JSON if it carries depth; else advertools 0.18.0 crawl | MIT | Decided in the plan's first task by inspecting squirrel output |
| Search Console | mcp-search-console 0.4.1 (`--with cryptography<49` on Intel macs) | MIT | Read-only |
| Keywords, SERP, PAA | DataForSEO MCP 3.1.1 | MIT (client) | Standard queue; estimate + yes before calls; no Backlinks/Live unless asked |
| GA4 | googleanalytics/google-analytics-mcp 0.7.x | Apache-2.0 | `/seo:review` engagement and key events |
| Seeds | SearXNG `/autocompleter` | AGPL-3.0, optional, never bundled (compose file only) | Free autocomplete seeds |
| AI visibility | `prompt_runner.py` (Gemini API + scoring); Limelit rc opt-in | own / Apache-2.0 | Per-platform files, never blended |
| Fix recipes | Next.js Metadata API, `sitemap.ts`, `robots.ts` + schema-dts; @astrojs/sitemap; Nuxt SEO; Hugo/Jekyll built-ins; framework prerendering (React Router `prerender`, vite-ssg, Vike, vite-prerender-plugin); WordPress: Yoast / The SEO Framework / Rank Math | MIT / Apache; WP plugins GPL (recommended, never bundled) | `fix-recipes` skill |

Borrowed, rewritten in our own words with credit in NOTICE (MIT): local-SEO checks (AgriciDaniel/claude-seo), AI-crawler user-agent list, CDN bot-blocking and access-log checks (Auriti-Labs/geo-optimizer-skill). Their 0–100 scoring is not adopted; the rule base wins.

Rejected, with reason: all-in-one SEO suites (scoring conflicts with the rule base), Lighthouse CI (stale), SerpBear and OpenSEO (second SERP source; OpenSEO bypasses spend guards), Plausible/GEOHub/searchmirror (AGPL), paid vendor MCPs (cost, second keyword source), CAPTCHA-bypass and anti-detection tools (terms of service), deleted or archived prerender servers.

Every new skill or plugin is scanned with `skillspector scan <path> --no-llm` and the result shown before it is vendored. Versions are pinned; bumping is deliberate.

## 8. Fix routing (`/seo:fix`)

1. User selects fix-queue items. Each gets a change-log row (prediction, metric and source, check-after date, approver) before any change.
2. Route by `profile.stack.type`:
   - `code`: create branch `seo/fix-<date>` (refuse if the working tree is dirty); apply edits per `fix-recipes` for the detected framework; run the project's own build/test scripts if present; re-run affected checks against `--local`; show the diff. Never commit to the default branch, push or deploy.
   - `cms`: write `.seo/handoff/<date>.md` with click-by-click admin steps and plugin settings.
   - `none`: write `.seo/handoff/<date>.md` as a developer handoff with exact snippets for the detected stack (from squirrel's technology detection).
3. Next `/seo:review` verifies on production and fills `Actual`.

## 9. Setup details

- Prerequisites: `uv`, `node` ≥ 22.18 (Unlighthouse), Chromium (installed through Crawl4AI's setup if missing); Docker optional (SearXNG).
- Profile auto-detection: domain (package.json homepage, framework config, CNAME, env files without reading secret values), framework and rendering mode (dependencies, config files), CMS (squirrel technologies), sitemap and robots (live fetch). Asks only for fields it could not fill: audience, conversions, competitors, brand names, buyer prompts, success metric, approver.
- MCP servers registered per project with `claude mcp add --scope local` (search-console, dataforseo, squirrelscan, google-analytics). Secrets are referenced as `${VAR}`, never stored as values; the plan verifies expansion works at local scope, else falls back to environment inheritance.
- Permission denies merged into the project's `.claude/settings.local.json`: Search Console `add_site`, `delete_site`, `submit_sitemap`, `delete_sitemap`, `manage_sitemaps`; squirrelscan `comment_on_issue`; squirrel `auth`, `keys`, `--render`, `--publish`. Existing settings are merged, not overwritten.
- Weekly task created through the desktop app's local scheduled tasks; if unavailable, setup prints a launchd entry running `claude -p "/seo:review"` in the project folder.

## 10. Scheduled runs, failures, spend

- Scheduled `/seo:review` is read-only and free: no code edits, no `/seo:fix`, no DataForSEO, no Limelit paid providers. Writes only under `.seo/reports/`. Ends with a notification summary.
- Tool failure or missing credential → affected checks `unknown` with the reason; the run continues.
- DataForSEO: estimate shown, explicit yes required, Standard queue default, cost logged in change log; $50 deposit with auto-recharge off is the ceiling.
- Gemini rate limits → `unknown`, no retry loops.

## 11. Testing

- `engines/test_engines.py` offline: raw-vs-rendered compare, prompt scoring, schema visible-text matching.
- `tests/fixture-site/`: static pages served on localhost with planted problems: client-rendered content, JSON-LD that contradicts visible text, invalid Product schema, broken internal link, missing H1, page five clicks deep, robots.txt blocking GPTBot. `expected.yaml` lists the check id each must fail.
- End-to-end: `claude -p "/seo:audit --local http://127.0.0.1:<port>"` in a temp copy of the fixture; pass = every expected failure appears in `checks.yaml`.
- `claude plugin validate` on `plugins/seo` (if the subcommand exists; otherwise install and list).

## 12. Migration from the current repo

- `engines/raw_vs_rendered.py`, `prompt_runner.py`, `test_engines.py` → `plugins/seo/engines/`, converted to uv inline-dependency scripts.
- `engines/lighthouse_runner.py` deleted (Unlighthouse).
- `projects/_template/` → `plugins/seo/templates/`, with `stack.type` added.
- `.claude/commands/*` → `plugins/seo/commands/`, rewritten for `.seo/` state and the new tools.
- Rule base and operating sections of `CLAUDE.md` → `skills/seo-system/SKILL.md`; `CLAUDE.md` becomes short developer notes for this repo.
- `.mcp.json`, `.claude/settings.json`, `package.json`, `pyproject.toml` in this repo: kept only if still needed for developing the plugin; the plugin itself does not depend on them.
- `searxng/` → `plugins/seo/searxng/`.

## 13. Risks

- Young dependencies (Limelit rc, adobe validator at 16 stars): pinned, isolated behind one engine or flag each.
- Global skill-list cost: ~14 descriptions per session; acceptable, revisit if it grows.
- Unverified claims carried from research: Unlighthouse CI flags, Search Console having no CWV API, squirrel JSON click depth, Limelit's unusual star/fork ratio. Each is checked in the plan before it is relied on.
- AI citations are volatile; trends need several runs per platform.
