# SEO + AI Search Visibility System

One engine that runs an SEO and AI-search audit, plan and monitoring loop for any project, driven by a per-project profile. Source of truth for design: `SEO + AI Search Visibility System — Blueprint.md`. This file is the operating manual.

## Principles (non-negotiable)

- **Questions, not tasks.** Every check is a decision question scored `pass`, `fail` or `unknown`, with evidence attached. No evidence → `unknown`, never a guess.
- **Output is a ranked fix list**, never a generic report.
- **One keyword data source per project.** DataForSEO is the source of record for volume and difficulty. Keyword Planner and Search Console are cross-checks only. Never compare or mix difficulty scores across tools.
- **AI visibility is tracked per platform**, never as one blended score.
- **Predict before you change.** Every change gets a row in the project's `change-log.md` with its predicted outcome, metric and check date *before* it ships.
- **Verified rules override vendor claims.** If a skill, tool or rule in `.claude/skills/` contradicts the rule base below, the rule base wins. Say so in the output when it happens.
- **Humans approve before anything publishes.** Never push, deploy, publish or edit a live site, CMS or client repo without the approver named in the profile signing off in the change log.

## Repository

```text
CLAUDE.md               this file: rule base + operating loop
.mcp.json               search-console (mcp-gsc), dataforseo, squirrelscan (local)
.claude/skills/         marketingskills + squirrelscan audit-website (vendored, pinned)
.claude/commands/       /audit /research /brief /visibility /review
engines/                raw_vs_rendered.py, lighthouse_runner.py, prompt_runner.py
projects/_template/     profile.yaml + change-log.md to copy for a new project
projects/<name>/        profile.yaml, baseline.json, change-log.md, reports/, visibility/
searxng/                self-hosted fallback SERP (docker, 127.0.0.1:8888)
```

Adding a project = `cp -R projects/_template projects/<name>`, fill `profile.yaml`, run `/audit <name>`. No engine code changes per project.

Skills that look for `.agents/product-marketing.md` (or `product-marketing-context.md`): use `projects/<name>/profile.yaml` as that context. Never create those files here; they are repo-wide and would mix projects.

## Operating loop

Every command follows the same seven steps. (Reconstructed from the blueprint text; the original diagram did not survive export.)

1. **Load**: read `projects/<name>/profile.yaml`, `baseline.json` and `change-log.md`. Missing profile fields → affected checks are `unknown`.
2. **Collect**: run the engines and tools for the module. Save raw output under `projects/<name>/reports/<YYYY-MM-DD>/`.
3. **Score**: turn findings into checks (format below). Apply the rule base.
4. **Rank**: write `fix-queue.md` in the run folder (ranking below).
5. **Predict**: for each fix proposed to ship, add a change-log row: change, pages, predicted outcome, metric and source, check-after date.
6. **Approve**: stop and ask the approver. Nothing ships without their name in the change-log row.
7. **Re-run and diff**: on the next run, compare against `baseline.json` and the change-log predictions, fill the `Actual` column, then update `baseline.json`.

### Check format

```yaml
- id: tech.raw-html                     # module.check
  question: Is the core content in the initial HTML?
  verdict: fail                         # pass | fail | unknown
  pages: [https://example.com/services]
  evidence: raw has 45% of rendered words; H1 "Services" missing from raw
  rule: Core content must be in the initial HTML   # rule base row, if any
  source: engines/raw_vs_rendered.py
```

### Fix queue ranking

Rank failed checks by, in order:
1. Blocks crawling, indexing or AI-crawler access (robots, noindex, raw-HTML failures, broken pages).
2. Touches a conversion page from the profile (`conversions`, `key_urls`).
3. Number of pages affected.
4. Effort, low first (say where the fix is made, using `stack` in the profile).

Each item: the failed question, the fix in one or two sentences, pages, evidence, predicted outcome. `unknown` checks go in a separate "needs data" list with what would resolve them.

## Verified rule base

Fact-checked. Keep each rule's scope; most studies cover one platform. Do not generalize a rule beyond its scope.

| Rule | Scope | Source |
| --- | --- | --- |
| Core content must be in the initial HTML; ChatGPT, Claude, Perplexity and Meta crawlers do not run JavaScript | Non-Google AI crawlers; Gemini and Copilot can render | [Vercel/MERJ summary](https://www.tripledart.com/research/why-your-site-is-invisible-to-chatgpt-and-claude) |
| No special AI files or AI schema are needed | Google AI Overviews and AI Mode only | [Google Search Central](https://developers.google.cn/search/docs/appearance/ai-features?authuser=1) |
| Structured data must match visible text | Google | Google Search Central |
| Adding schema did not lift AI citations | Ahrefs matched-control test | [summary](https://be.linkedin.com/in/jeroenvr) |
| Page length barely matters; 53.4% of citations go to pages under 1,000 words | Google AI Overviews | [Ahrefs](https://ahrefs.com/blog/short-vs-long-content-in-ai-overviews) |
| Longer, well-sectioned pages earn more citations | ChatGPT | [PushLeads summary of SE Ranking](https://pushleads.com/how-long-should-your-content-be-to-get-cited-by-ai-search-in-2026/) |
| Put the key answer in the first 30% of the page (44.2% of citations) | ChatGPT | [Growth Memo, Kevin Indig](https://www.searchenginejournal.com/the-science-of-how-ai-pays-attention/561306/) |
| Open with a declarative statement (+14% citation lift) | 7 verticals | [SEJ](https://www.searchenginejournal.com/the-science-of-what-ai-actually-rewards/570849/) |
| Titles should match how the prompt is phrased (0.602 vs 0.484 similarity) | ChatGPT | [Ahrefs study summary](https://www.searchenginejournal.com/chatgpt-often-retrieves-but-rarely-cites-reddit-pages-data-shows/572243/) |
| 91% of citations appear on only one platform, so track each engine separately | ChatGPT, Perplexity, AI Overviews | [Kevin Indig H1 2026](https://letsdatascience.com/news/kevin-indig-documents-ai-search-measurement-gap-00cb8aaf) |
| A small set of URLs earns most citations; aim pages at that group | Cross-platform | [Dynadot summary of Otterly](https://www.dynadot.com/blog/how-ai-understands-domain-names) |
| 85% of brand discovery in AI search comes from third-party sources | Category queries | [AirOps](https://airops.com/report/the-influence-of-offsite-signals-in-ai-search) |
| AI referrals grow fast but organic still sends more traffic | Shopify Q2 2026 | [Search Engine Land](https://searchengineland.com/shopify-ai-referrals-up-organic-search-leads-traffic-484962) |
| GA4 bounce rate = 1 minus engagement rate | GA4 | [GoodMetrics](https://goodmetrics.io/blog/ga4-bounce-rate) |
| Never compare keyword difficulty across tools | All tools | Principle |

**Heuristics, not rules** (report as such, never as failures of a rule): three-click depth; social signals as distribution rather than ranking.

### Known overrides

- `ai-seo` skill cites a 30–40% citation lift from schema. Overridden: a matched-control Ahrefs test did not reproduce it. Recommend schema only for Google rich results and only when it matches visible text.
- Any skill recommending `llms.txt` or AI-specific schema as a Google requirement: overridden for Google AI Overviews / AI Mode (not needed). May still be noted as optional for other platforms, marked unverified.
- squirrelscan "Agent Experience" findings (llms.txt, AGENTS.md, Markdown responses) are `info`, not failures, unless they concern raw-HTML access.

## Tools and spend guards

| Tool | How to run | Guard |
| --- | --- | --- |
| squirrelscan (pinned in package.json) | Audits via CLI: `node_modules/squirrelscan/bin/squirrel audit <domain> -C full --render-mode off -f json -o <file>`; diffs: `node_modules/squirrelscan/bin/squirrel report <domain> --diff <audit-id> -f json`. The `squirrelscan` MCP is for querying stored reports, issues and entities. | Local and free only. Never `--render`, `--render-mode auto/all`, `-y`, `--publish` or `auth login`: those spend cloud credits or publish reports. Rendering is Crawl4AI's job. |
| Crawl4AI | `uv run engines/raw_vs_rendered.py <urls> --out <file>` | Free, local. |
| Lighthouse (pinned) | `uv run engines/lighthouse_runner.py <urls> --out-dir <dir>` | Lab data; Search Console CWV (field) wins on disagreement. |
| Search Console | `search-console` MCP | Read-only use. |
| DataForSEO | `dataforseo` MCP | $50 deposit is the hard ceiling; auto-recharge off. Standard queue (task_post / task_get) by default; Live endpoints only when the user asks. Never call Backlinks API endpoints without explicit approval (priced separately). Log every run's calls and cost in the project change log. |
| Keyword Planner | Google Ads UI, manual | Ranges only; cross-check, never the source of record. |
| Autocomplete, People Also Ask | SearXNG or web search | Seed and question expansion only. |
| SearXNG | `curl "http://127.0.0.1:8888/search?q=...&format=json"` | Fallback SERP snapshots, not ranking data. |
| Gemini | `uv run engines/prompt_runner.py gemini ...` | Free tier; rate limits → `unknown`, not retries in a loop. |
| Claude | web search inside Claude Code, scored with `prompt_runner.py score --platform claude` | Record as "Claude Code web search", not claude.ai. |
| ChatGPT, Perplexity | Manual. `prompt_runner.py template` → user fills → `score` | Run only when the user asks. |
| Bing Webmaster (Copilot citations) | CSV export from the AI Performance report, user supplied | No API. |
| Ahrefs Webmaster Tools | Manual, own verified sites only | No API. |
| Google Trends | Manual | Official API is a limited alpha; pytrends is archived. |

Environment variables (export in your shell; Claude Code does not read `.env`): `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD`, `GSC_OAUTH_CLIENT_SECRETS_FILE`, `GEMINI_API_KEY`. See `.env.example`.

## Module map

| Module | Checks | Tools | Command | Phase |
| --- | --- | --- | --- | --- |
| Technical SEO | Click depth, raw-HTML readability, speed, mobile, sitemap and robots, schema matches visible text, broken pages | squirrelscan, Crawl4AI, Lighthouse | /audit | 1 |
| On-page SEO | Titles vs how people ask, meta descriptions, question-style H2s answered in the first sentence, alt text, anchor text | squirrelscan, seo-audit skill | /audit | 1 |
| Keyword research | Audience problem, seed terms, intent split, own page or section of one | Search Console, DataForSEO, Keyword Planner, Autocomplete, content-strategy skill | /research | 2 |
| Site structure | Page map from the keyword set, internal links | site-architecture, programmatic-seo skills | /research | 2 |
| Content creation | Declarative intro, unique data points, right format, last updated | Briefs from the rule base, human approval | /brief | 3 |
| AI search | Citations and mentions per platform, cited pages, raw-HTML access for AI crawlers | prompt_runner.py, ai-seo skill (overridden where it conflicts) | /visibility | 4 |
| Off-page SEO | Links that send customers, brand mentions, consistent NAP, who recommends us | Search Console links, Ahrefs Free, mention tracking | /review | 5 |
| Analytics and monitoring | One success number, impressions vs clicks, engagement, conversions → revenue, predicted vs actual | Search Console, GA4, squirrelscan diffs | /review | 5 |

## Risks to keep in mind

- AI citations are volatile; one snapshot misleads. Report trends per platform, and say how many runs a trend is based on.
- squirrelscan and the skills update often. Versions are pinned (`package.json`, `pyproject.toml`, `.mcp.json`, skill commits in `README.md`); re-check the rule base each quarter before bumping.
