# SEO plugin: design (v2)

Date: 2026-10-06 · Status: v1 approved in brainstorming; v2 adds the weak-spot research, awaiting spec review
Source blueprint: `SEO + AI Search Visibility System — Blueprint.md`
v2 changes: off-page module, content engine, AI-sampling protocol, dependency hardening, ~20 new rules. Limelit, SearXNG and advertools removed.

## 1. Goal

Install once, then in any project folder get the full SEO + AI-search loop: audit → ranked fixes → fixes applied (after approval) → content plan → off-page opportunities → AI-visibility tracking → weekly monitoring. Open-source tools and skills first; custom code only as glue.

Success criteria:
1. In a folder with no prior setup, `/seo:start` reaches a first ranked fix queue with no credentials configured (tier 0).
2. The same commands work for a code repo, a CMS site and a no-code client site; only the fix route differs.
3. Every check is pass / fail / unknown with evidence; missing data yields `unknown` plus what would unlock it.
4. The fixture site's planted problems are all caught by `/seo:audit` (section 15).
5. No secret value is written to any config file; no paid call happens without a shown estimate and a yes, enforced by a hook, not only by instructions.
6. Every AI-visibility rate is shown with its confidence interval and sample size; no trend is claimed before it is statistically supported.

## 2. Decisions recorded

| Decision | Choice |
| --- | --- |
| Shape | Global Claude Code plugin; state per project in `.seo/` |
| Packaging | Self-contained plugin: uv inline-dependency scripts; Node tools installed once at pinned versions into the plugin data folder |
| Project types | All: code repos (any framework), WordPress/CMS, client sites without code |
| Monitoring | Weekly review per project, plus a free daily Gemini sampler (section 11) |
| Tooling principle | Open source first; MIT / Apache / BSD preferred; GPL recommend-only; AGPL never bundled |
| AI-citation tracker | Own `prompt_runner.py`, upgraded with the sampling protocol. Limelit dropped (star-farm pattern, unsigned binaries, unauthenticated dashboard on all interfaces) |
| Automated Google queries | None. SearXNG removed: it sends automated queries to Google (machine-generated traffic under Google's spam policies) and is AGPL. Seeds come from Search Console, DataForSEO and buyer prompts |
| squirrelscan | Pinned binary called by path; auto-update and telemetry turned off in `~/.squirrel/settings.json` (done 2026-10-06) |
| Process tooling | superpowers plugin (6.4.1, user scope) |

Non-goals: hosted service or dashboard; rank-history UI (SerpBear, OpenSEO); automated ChatGPT/Perplexity consumer querying; automated outreach or posting of any kind; auto-deploying or pushing fixes; batch-drafting content; selling/licensing decisions.

## 3. Commands

All namespaced `/seo:<name>`.

| Command | Behaviour |
| --- | --- |
| `/seo:start` | No `.seo/` → setup. Otherwise status: check counts per module, credential tier, items due (predictions past check date, decaying pages, press-request deadlines, stale visibility window) and the next step. |
| `/seo:setup` | Prerequisites + health checks (section 13); tier report; profile auto-detection; asks only for missing fields; installs pinned Node tools; registers MCP servers; writes permission denies; creates scheduled tasks. Idempotent. |
| `/seo:audit [--local URL]` | Technical + on-page checks → `checks.yaml` + `fix-queue.md`. |
| `/seo:fix [ids \| top N]` | Applies approved fixes via the stack route (section 8). |
| `/seo:research` | Keyword set, SERP clustering, page map. DataForSEO is the source of record. |
| `/seo:content` | Content engine (section 9): topical map, decay and refresh candidates, cannibalization, content calendar. |
| `/seo:brief <group or URL>` | Brief v2 with evidence slots (section 9). One draft at most, only on request. |
| `/seo:offpage` | Off-page opportunities (section 10): broken inbound links, unlinked mentions, AI-cited surfaces we are absent from, press requests, competitor gap, NAP. Drafts only; a human sends everything. |
| `/seo:visibility [chatgpt] [perplexity]` | AI mentions and citations per platform with the sampling protocol (section 11). |
| `/seo:review` | Weekly: re-run, diff, predicted vs actual, Search Console, GA4, visibility windows, off-page counts. |

Command bodies stay thin: load the `seo-system` skill, then run module steps. Behaviour lives in skills and engines.

## 4. Credential tiers

| Tier | Needs | Unlocks |
| --- | --- | --- |
| 0 | nothing | squirrelscan, Crawl4AI (raw vs rendered, click depth), Unlighthouse, schema engine, Claude Code web-search visibility, GDELT / HN / Wikipedia mentions |
| 1 | Search Console OAuth client; `GOOGLE_API_KEY` (CrUX); optional `BING_WEBMASTER_API_KEY` | Queries, positions, indexing, URL Inspection; decay and cannibalization; CrUX field data; own backlinks from Bing |
| 2 | DataForSEO login; `GEMINI_API_KEY`; GA4 via Google ADC (`analytics.readonly`) | Volumes, SERPs, PAA, autocomplete, competitor gap; Gemini sampling; engagement and conversions |

Credentials come only from the shell environment and Google ADC. Setup reports the active tier and the exact step to the next.

## 5. Per-project state

```text
<project>/.seo/
  profile.yaml        committed
  baseline.json       committed (per-module, per-platform; never a combined score)
  change-log.md       committed (predictions, approvals, actuals, run costs)
  reports/<date>/     committed: checks.yaml, fix-queue.md, review.md, summaries
  reports/<date>/raw/ gitignored: tool dumps
  content/            topical-map.yaml, content-calendar.md
  offpage/<date>/     opportunities.md, needs-data.md, drafts/ (unsent)
  outreach-log.csv    human-filled
  visibility/         prompt-set.yaml (versioned), samples/<date>.jsonl, windows/<date>.md
  briefs/, handoff/   committed
  inputs/             user-dropped exports (GSC links CSV, Ahrefs Free, Bing AI Performance CSV, GA4, press-request .eml/.mbox)
  .gitignore          raw/, inputs/
```

Profile additions beyond the v1 template: `stack.type` (code | cms | none); `content.experts[]`, `content.first_party_data[]`, `content.capacity_per_month`; `offpage.spokespeople[]` (name, topics, bio URL), `offpage.linkable_assets[]`, `offpage.platforms[]`, `offpage.locations[]` (NAP, GBP id), `offpage.communities[]`, `offpage.partners[]`.

Vendored skills that look for `.agents/product-marketing.md` use `.seo/profile.yaml`; the plugin never creates that file.

## 6. Architecture and layout

```text
seo-tool/                              plugin source + marketplace
  .claude-plugin/marketplace.json      one plugin, source ./plugins/seo
  plugins/seo/
    .claude-plugin/plugin.json
    commands/   start setup audit fix research content brief offpage visibility review
    hooks/      hooks.json + dataforseo_guard.py (PreToolUse, section 12)
    skills/
      seo-system/   rule base, loop, check format, ranking, spend guards, overrides
      fix-recipes/  per-stack fix instructions
      vendored (pinned, scanned): seo-audit, ai-seo, schema, site-architecture, programmatic-seo,
                content-strategy, competitors, copywriting, copy-editing, analytics, public-relations,
                directory-submissions (marketingskills @5b2c000); audit-website (squirrelscan/skills @993ff2e);
                core-web-vitals, performance (addyosmani/web-quality-skills @afa8da9)
    engines/    raw_vs_rendered.py, site_graph.py, schema_check.mjs, prompt_runner.py, vis_stats.py,
                serp_cluster.py, decay.py, cannibal.py, mentions.py, test_engines.py
    data/       schemaorg-all-https.jsonld (v30.1, sha256 recorded), google-required-fields.yaml
    templates/  profile.yaml, change-log.md, prompt-set.yaml
    NOTICE
  tests/fixture-site/
  docs/superpowers/specs/, docs/superpowers/plans/
```

- Paths in command and skill text use `${CLAUDE_PLUGIN_ROOT}` (code, data), `${CLAUDE_PLUGIN_DATA}` (pinned Node tools, caches; survives updates) and `${CLAUDE_PROJECT_DIR}` (state). `CLAUDE_PLUGIN_ROOT` is substituted into text but not exported to Bash.
- Install: add this repo as a local marketplace, install `seo@seo-tool` at user scope; edits apply on next session or `/reload-plugins`.
- This repo's 51 project-level skills stay here; the plugin carries only the list above.

## 7. Open-source stack

| Module | Tool | Licence | Use |
| --- | --- | --- | --- |
| Site audit, links, a11y | squirrelscan 0.0.98 | MIT | `npm install --prefix ${CLAUDE_PLUGIN_DATA} squirrelscan@0.0.98`; call `${CLAUDE_PLUGIN_DATA}/node_modules/squirrelscan/bin/squirrel` directly with `NO_TELEMETRY=1` (the npm wrapper prefers any `~/.local/bin/squirrel`). Local only: never `--render`, `-y`, `--publish`, `auth`. |
| Raw vs rendered | Crawl4AI 0.9.4 | Apache-2.0 + attribution clause | `raw_vs_rendered.py`; credit in NOTICE |
| Click depth, link graph, anchors, hreflang | Crawl4AI `BFSDeepCrawlStrategy` over HTTP (no JS) | Apache-2.0 | `site_graph.py`: depth and parent URL per page (verified 2026-10-06; squirrel JSON has no depth); reciprocal hreflang check in ~30 lines |
| Lab speed, site-wide | unlighthouse-ci 0.19.1 | MIT | Installed into plugin data; `--site`, `--urls`, `--reporter jsonExpanded`, `--output-path`, `--budget`, `--mobile` (flags verified); `scanner.maxRoutes` via config file; Node ≥ 22.18 |
| Field speed | CrUX API + CrUX History API | Google service | `records:queryRecord` / `queryHistoryRecord` with `GOOGLE_API_KEY`; 150 queries/min. URL 404 (low traffic) → origin → `unknown`. Field beats lab. PSI not used (Google plans to drop CrUX from it) |
| Structured data | @adobe/structured-data-validator 1.7.0 + @marbec/web-auto-extractor 2.2.1 + vendored schema.org vocabulary | Apache-2.0 / MIT / Apache-2.0 | `schema_check.mjs`. Adobe covers Product, Offer, Review, Rating, Breadcrumb, Video, JobPosting, Recipe, HowTo, Organization, Person and others. It does **not** cover Article, LocalBusiness, FAQPage, Event: our `google-required-fields.yaml` covers those from Google's docs. Plus a visible-text match for every JSON-LD string of 4+ words |
| Google's rich-result verdict | Search Console URL Inspection (`richResultsResult`) | — | Tier 1 |
| Search Console | mcp-search-console 0.4.1 (`--with cryptography<49` on Intel macs, constraints file) | MIT | Read-only via deny rules (it requests the full webmasters scope; submit tools are ungated upstream) |
| Keywords, SERP, PAA, autocomplete, gap | dataforseo-mcp-server 3.1.1 | MIT client | SERP / autocomplete / volume on Standard queue; Labs is Live-only → always quoted and confirmed; Backlinks off. Enforced by hook (section 12) |
| GA4 | analytics-mcp 0.7.0 (official) | Apache-2.0 | `uvx analytics-mcp@0.7.0`; ADC `analytics.readonly`; `run_report`, `run_conversions_report` |
| Own backlinks | Bing Webmaster JSON API (`GetUrlLinks`); manual GSC Links, Ahrefs Free exports | — | Each source kept separate, never summed |
| Mentions | GDELT DOC 2.0, HN Algolia, Wikipedia `exturlusage`, Wayback CDX; trafilatura for "named but not linked" | free services; trafilatura Apache-2.0 | `mentions.py`, polite rate limits, contact User-Agent |
| Competitor referring domains (optional) | Common Crawl domain web graph via DuckDB | CC terms of use | Asks before the 9–15 GiB download; results labelled "seen in CC graph <release>"; never compared across releases |
| Broken outbound links on prospects | lychee | MIT OR Apache-2.0 | `brew install lychee` (optional) |
| NAP cross-check | Overture Maps places (overturemaps-py) | CDLA-Permissive-2.0 / MIT | Compare site and GBP (if approved) against open places data; Apple, Bing, Yelp manual checklist |
| SERP clustering | ~50 lines: Jaccard on top-10 URLs + scipy linkage | BSD-3 | `serp_cluster.py`; start threshold ≥ 4 shared URLs (heuristic) |
| Entities and coverage | spaCy 3.8 `en_core_web_sm` + trafilatura + scikit-learn TF-IDF | MIT / Apache / BSD | Coverage prompts for briefs, never density targets. No torch (Intel mac) |
| Readability | textstat | MIT | Heuristic only |
| AI visibility | `prompt_runner.py` + `vis_stats.py` | own | Section 11 |
| Fix recipes | Next.js Metadata API, `sitemap.ts`, `robots.ts` + schema-dts; @astrojs/sitemap; Nuxt SEO; Hugo / Jekyll built-ins; framework prerendering (React Router `prerender`, vite-ssg, Vike, vite-prerender-plugin); WordPress: Yoast / The SEO Framework / Rank Math | MIT / Apache; WP plugins GPL, recommended never bundled | `fix-recipes` skill |

Borrowed and rewritten with credit (MIT): local-SEO, Common Crawl graph, Bing backlink and backlink-verification approaches (AgriciDaniel/claude-seo); AI-crawler user-agent list, CDN bot-blocking and access-log checks (Auriti-Labs/geo-optimizer-skill); evidence-slot and fact-check table ideas (AgriciDaniel/claude-blog); cannibalization approach (AminForou/mcp-gsc skill).

Rejected: all-in-one SEO suites; Limelit; SearXNG; advertools; Lighthouse CI (stale); SerpBear, OpenSEO; Plausible, GEOHub, searchmirror, YAKE (AGPL); paid vendor MCPs; CAPTCHA-bypass, platform-automation and auto-send tools (cnych/seo-mcp, qwoted-seo-backlinks-skill, linkforge); KeyBERT / BERTopic (torch); PSI API.

Every new skill or plugin is scanned with `skillspector scan <path> --no-llm` and the result shown before vendoring.

## 8. Fix routing (`/seo:fix`)

1. User selects fix-queue items. Each gets a change-log row (prediction, metric and source, check-after date, approver) before any change.
2. Route by `profile.stack.type`:
   - `code`: branch `seo/fix-<date>` (refuse on a dirty tree); edits per `fix-recipes`; project build/tests if present; re-check against `--local`; show the diff. Never commit to the default branch, push or deploy.
   - `cms`: `.seo/handoff/<date>.md` with admin steps and plugin settings.
   - `none`: `.seo/handoff/<date>.md` developer handoff with exact snippets.
3. Next `/seo:review` verifies on production and fills `Actual`.

## 9. Content engine (`/seo:content`, `/seo:brief`)

- **Topical map** (`serp_cluster.py`): keywords from `/seo:research` grouped by SERP overlap → `content/topical-map.yaml`: pillar → cluster → keywords → URL (existing or new), our coverage vs competitors (Labs gap data, with a yes), PAA subquestions, expected entities and subtopics from the top 10 (spaCy + trafilatura).
- **Decay** (`decay.py`, Search Console): per page, last 90 days vs prior 90 and vs same period last year, plus drop from peak. Diagnosis: position down → refresh; impressions down with flat position → demand, check Trends, no refresh; CTR down with flat position → SERP feature or AI Overview capture, refresh won't fix; page gone → `/seo:audit`. Skips core-update rollout windows plus 7 days; never compares impressions or position across 2025-09-11 (Google's `num=100` change). Thresholds (heuristic): clicks −20% over 90 days, target query −5 positions, 3+ months declining on pages with ≥ 1% of site traffic.
- **Cannibalization** (`cannibal.py`): non-brand query where two or more URLs each get ≥ 20% of 90-day impressions at position ≤ 20, or the top URL flips 2+ times; then a SERP check (Google allows up to 2 listings per site). Human decides merge + 301, differentiate or leave. Anonymized-query gaps → `unknown`.
- **Calendar** (`content/content-calendar.md`): refreshes, then gaps, then new clusters; ordered by conversion pages, fix-queue ranking, then cluster completion (finish a cluster to ≥ 75% before starting another); capped by `content.capacity_per_month`. Each item carries a brief and a change-log prediction.
- **Brief v2**: evidence slots E1 first-hand experience (who, what, when, artifacts), E2 original data (client-supplied only), E3 named author or reviewer with verifiable credentials, E4 what the top 10 already cover vs what this page adds. Experience-dependent topics with empty E1/E2 are blocked to "needs data". Claim-by-claim fact-check table. Who/How/Why line including AI-use disclosure. No word-count target. `dateModified` changes only with substantive edits, logged.
- Automated: pulls, clustering, gap lists, decay and cannibalization flags, calendar ranking, brief skeletons, claim tables, cost quotes. Human: Labs spend, pillar choice, E1–E3, merge decisions, writing, fact-check sign-off, approval, publishing. At most one draft per request, labelled "draft, not approved".

## 10. Off-page (`/seo:offpage`)

Collect (free unless stated; each source stored separately):
1. Own inbound links: Bing `GetUrlLinks` + user exports in `inputs/`; every linked target checked for 200.
2. Mentions: GDELT, HN Algolia, Wikipedia `exturlusage`, plus third-party URLs cited in the latest `/seo:visibility` window; trafilatura decides named / linked / `rel`.
3. Competitor gap (optional, asks first): Common Crawl domain graph: domains linking to ≥ 2 competitors but not to us.
4. Broken outbound links on candidate pages (lychee) → Wayback for the dead target → our matching page.
5. AI-cited surfaces per platform where we are absent: classified as list, review site, Reddit, YouTube, Wikipedia, news.
6. Press requests: parse the user's exported HARO / Source of Sources / MentionMatch / Qwoted digests from `inputs/`; match to spokesperson topics and deadlines. The plugin never logs into, scrapes or posts on these platforms.
7. NAP: site vs GBP (if API approved) vs Overture places; Apple, Bing, Yelp manual checklist.

Rank `opportunities.md`: (1) our URLs with inbound links returning 4xx/5xx, fixed on our site; (2) AI-cited surfaces we are absent from, per platform; (3) warm asks: unlinked mentions under 7 days old, then press requests before deadline; (4) touches key or conversion pages; (5) competitor overlap count; (6) effort: site fix, edit request, inclusion request, cold broken-link pitch. Each item: question, target, evidence (source, date, CC release), action, draft path, who acts, prediction, approval needed.

Outputs: `drafts/` (reclamation emails, inclusion requests, press answers, Wikipedia talk-page requests; all marked unsent), `outreach-log.csv` (human), per-source counts in `baseline.json`, change-log predictions.

Manual always: platform sign-ups, exports, sending, press answers (spokesperson rewrites every draft: Qwoted bans AI commentary, HARO filters it), community participation, Wikipedia requests, review invitations. Approver name required for: every send, any third-party post, site redirects, publishing a linkable asset, any DataForSEO call, the CC download, enabling Reddit or X API keys. Never: bought links or paid placements, link exchanges at scale, automated sending, sockpuppets, unedited AI pitches, scraping or CAPTCHA solving, review gating or incentivised reviews where the platform bans them.

Vendored skill corrections (recorded as overrides): `public-relations` lists Connectively as live (shut 2024-12-09; HARO relaunched under Featured 2025-04-22) and old platform names; `directory-submissions` dofollow check reads headers only, tiers 11–12 are link spam, FAQ-schema claim conflicts with the rule base.

## 11. AI-visibility sampling protocol

- **Prompt set** (`visibility/prompt-set.yaml`, versioned): 30 unbranded prompts = 10 buyer questions × 3 paraphrases (4 discovery, 3 problem / how-to, 2 alternatives or comparisons without our brand, 1 conversion or local tied to a key URL), plus 2–3 branded controls excluded from headlines. Frozen ≥ 8 weeks; changing it starts a new baseline.
- **Sampling**: Gemini API pinned to `gemini-2.5-flash` (free tier grounding only exists on 2.5 models; up to 500 grounded requests/day) → 30 calls/day, ~6 s apart, by a daily local scheduled task. No seed or temperature set (we measure what users get); model version stored per call. Claude Code web search: 30 × 3 per week inside the weekly review. ChatGPT and Perplexity: manual paste, 30 × 1, 28-day rates only. Google AI Overviews / AI Mode: Search Console Generative AI performance report export (impressions only, no API) and optional DataForSEO SERP snapshots twice weekly, quoted first.
- **Per answer** (`samples/<date>.jsonl`): status ok / failed / no answer shown; mention, domain cited, own pages cited (Gemini: `unknown`, its citations expose only the domain), competitors mentioned and cited, sub-queries issued, model version, timestamp. Only `ok` counts in denominators. Labels name the surface honestly ("Gemini API", "Claude Code web search"), not the consumer app.
- **Statistics** (`vis_stats.py`): Wilson 95% interval on rates; design effect for prompt clustering, DEFF = 1 + (m̄ − 1)·ρ̂, n_eff = n / DEFF, ρ̂ from the window's between/within-prompt variance; change between consecutive 28-day windows by paired bootstrap over prompts (5,000 resamples), Holm correction across platform × metric tests; two-proportion z-test on n_eff if the prompt set changed. Share of voice = brand mentions ÷ (brand + competitor mentions).
- **Display rules**: < 20 answers → "needs data"; per-prompt verdict only with ≥ 7 samples in the window; trend line after 4 weekly runs; trend claimed only after 8 weeks (two non-overlapping 28-day windows differing significantly); series breaks when the model version changes. Example: "Gemini API (gemini-2.5-flash) · citation rate 32% (95% CI 23–43%, n=150, 30 prompts, n_eff≈83) · −3 pts vs previous 28 days (CI −11 to +5), not significant · 6 weekly runs".
- **Predictions**: prompts tied to changed pages vs untouched prompts (difference in differences), checked no earlier than 4 weeks after shipping.
- Sub-queries that recur across samples feed `/seo:research` as keyword candidates.

## 12. Spend and safety guards

- **DataForSEO hook** (`hooks/dataforseo_guard.py`, PreToolUse on `mcp__dataforseo__api_request`): path contains `/backlinks/` → deny; path contains `/live/` (all Labs calls) → ask, with the estimate stated in the reason; everything else allowed. The plugin's instructions additionally require a cost quote before any call. Health check: `GET /v3/appendix/user_data` (free) logs balance and refuses work if it exceeds the $50 ceiling setting.
- **Search Console**: deny `add_site`, `delete_site`, `submit_sitemap`, `delete_sitemap`, `manage_sitemaps` in the project's `.claude/settings.local.json` (merged, never overwritten).
- **squirrelscan**: deny `comment_on_issue`, `auth`, `keys`, `--render`, `--publish`.
- **Scheduled runs** (weekly review, daily Gemini sampler) are read-only and free: no code edits, no `/seo:fix`, no DataForSEO, no sends. They write only under `.seo/reports/` and `.seo/visibility/`.
- Tool failure or missing credential → `unknown` with the reason; the run continues. Gemini rate limit → `unknown`, no retry loops.

## 13. Dependencies: pins, health checks, fallbacks

| Dependency | Pin | Health check in `/seo:setup` | Fallback |
| --- | --- | --- | --- |
| squirrelscan | 0.0.98 by path | `self version --json` = 0.0.98; settings show `auto_update:false`, `telemetry:false`; warn if `~/.local/bin/squirrel` is another version | Crawl4AI checks + Unlighthouse SEO category; SEOnaut (MIT) as crawler |
| unlighthouse-ci | 0.19.1 | `--version`; one-URL smoke writes `ci-result.json` | Lighthouse 13.5.0 CLI over sitemap-sampled URLs |
| adobe validator + extractor | 1.7.0 / 2.2.1 exact; vocabulary sha256 | Fixture Product missing required fields yields ≥ 1 ERROR; vocabulary hash matches | extruct (BSD-3) + `google-required-fields.yaml`; manual Rich Results Test |
| mcp-search-console | 0.4.1 + constraints | `get_capabilities`, then `list_properties` includes the profile's property | `gsc_pull.py` with google-api-python-client, `webmasters.readonly` |
| dataforseo-mcp-server | 3.1.1 | `user_data` status 20000, balance ≤ ceiling | Direct REST `task_post` / `task_get` |
| analytics-mcp | 0.7.0 | `get_account_summaries` lists the profile's property | GA4 export in `inputs/` |
| Crawl4AI | 0.9.4 | `raw_vs_rendered.py` on the fixture | — (core; pinned) |
| Gemini model | `gemini-2.5-flash` | one grounded call returns grounding metadata | Gemini `unknown`; other platforms continue |

## 14. Rule-base additions (scoped)

| Rule | Scope | Source |
| --- | --- | --- |
| Never generate many pages without added value, however created | Google | Spam policies (2026-08-28); rater guidelines §4.6.5 |
| No page per query variation or fan-out | Google AI features | AI optimization guide (2026-07-10) |
| No word-count targets; Google has no preferred length | Google | Creating helpful content |
| Change dates only with substantive changes; visible date and `dateModified` consistent | Google | Creating helpful content; publication dates |
| Experience claims need evidence; no fabricated authors or AI headshots | Google raters | Rater guidelines §5.6 |
| E-E-A-T is not a scored factor: check concrete items, never output an "E-E-A-T score" | Google | Creating helpful content |
| Fact-check AI-assisted text, titles, descriptions, structured data, alt text before approval | Google | Generative AI content guidance (2026-10-01) |
| llms.txt and content chunking not needed (strengthens existing rule) | Google Search | AI optimization guide (2026-07-10) |
| Hosted third-party content must not exploit our domain's signals | Google | Site reputation policy |
| After a core update: wait for completion + 7 days; no quick fixes; deletion last resort | Google | Core updates guide (2025-12-10) |
| CTR drop with stable position is not content decay | AI Overviews, US | Pew (2025-07-22) |
| Google AI visibility = Generative AI performance report, impressions only | AI Overviews, AI Mode | Search Console help 16984139 |
| Cover a cluster's subtopics, not just the head term | AI Overviews | Ahrefs fan-out study (2026-03-02) |
| Keep cited pages maintained; AI-cited URLs are fresher than organic ones | 7 AI platforms, correlation | Ahrefs (2025-07-28) |
| Manipulating generative AI answers is spam | Google | Spam policies (2026-08-28) |
| Earned third-party mentions correlate more with AI visibility than backlinks (0.664 vs 0.218) | AI Overviews, correlation | Ahrefs (2025-05-26) |
| Earned media is ~84% of AI citations | ChatGPT, Claude, Gemini | Muck Rack (2026-05-07) |
| Single AI-answer runs are noise; report windows with intervals | All platforms | SparkToro (2026-01-28); arXiv 2604.07585 |
| Never compare Common Crawl referring-domain counts across releases | Common Crawl | CC graph release notes |
| Automated queries to Google are machine-generated traffic | Google | Spam policies (2026-08-28) |

Edits to existing rows: AirOps scope narrowed to "B2B software discovery, three models, Oct 2025"; the 91% row cites the Growth Memo original.

Heuristics (reported as such): topical-coverage correlation (vendor), internal-link counts (Zyppy), decay thresholds, clustering threshold, GEO-paper lifts (a replication found most ineffective), three-click depth.

New overrides: keyword density (claude-seo); word-count targets (claude-seo, claude-blog); GEO misattributions (geo-seo-claude); ai-seo GEO table; date-only updates (copy-editing); Connectively and dofollow-by-header (public-relations, directory-submissions).

## 15. Testing

- `test_engines.py` offline: raw-vs-rendered compare; prompt scoring; Wilson and DEFF against hand-computed values; paired bootstrap on a synthetic no-change set (must not flag) and a 30-point change (must flag); SERP clustering on a toy SERP set; decay diagnosis table; cannibalization thresholds; DataForSEO hook decisions for backlinks / live / standard paths; schema visible-text matching.
- `tests/fixture-site/` on localhost with planted problems: client-rendered content, JSON-LD contradicting visible text, invalid Product schema, LocalBusiness missing required fields, broken internal link, missing H1, page five clicks deep, robots.txt blocking GPTBot, a reciprocal-hreflang error. `expected.yaml` lists the failing check id for each.
- End-to-end: `claude -p "/seo:audit --local http://127.0.0.1:<port>"` in a temp copy; pass = every expected failure in `checks.yaml`.
- `claude plugin validate` on `plugins/seo` if available; otherwise install and list commands.

## 16. Migration from the current repo

- `raw_vs_rendered.py`, `prompt_runner.py`, `test_engines.py` → `plugins/seo/engines/` as uv inline-dependency scripts; `prompt_runner.py` gets the model pin, metadata and Gemini `unknown` for own pages.
- `lighthouse_runner.py` deleted; `searxng/` deleted.
- `projects/_template/` → `plugins/seo/templates/` with the new fields.
- `.claude/commands/*` → `plugins/seo/commands/`, rewritten.
- Rule base and operating sections of `CLAUDE.md` → `skills/seo-system/SKILL.md`; `CLAUDE.md` becomes developer notes.
- Repo `.mcp.json`, `.claude/settings.json`, `package.json`, `pyproject.toml`: kept only for plugin development.

## 17. Risks

- Young or thin dependencies (adobe validator: sparse maintenance, coverage gaps; mcp-search-console: single author, unpinned transitive deps): pinned, behind one engine each, with fallbacks in section 13.
- Free Gemini grounding exists only while Google serves 2.5 models; when it ends, Gemini becomes `unknown` or paid (quoted).
- Off-page results still depend on human outreach; the plugin finds and drafts, people earn.
- AI-search platform shocks (e.g. Reddit's ChatGPT citation share falling sharply in weeks) can move rates regardless of our work; reported as context, not as our result.
- Unverified: Generative AI performance report has no API (inferred); PSI quotas; Limelit CSRF (moot, dropped).
