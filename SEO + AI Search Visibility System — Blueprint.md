# SEO + AI Search Visibility System — Blueprint

Sep 27, 2026 · @ABDELHAMID

## Purpose and design principles

One engine that runs a full SEO and AI-search audit, plan and monitoring loop for any project, driven by a per-project profile. It is built as a module on the InoTech AI core, so it serves as an internal tool and a sellable service.

- **Questions, not tasks.** Every check is a decision question scored pass, fail or unknown, with evidence attached.
- **Output is a ranked fix list**, never a generic report.
- **One keyword data source only.** Difficulty is a vendor score; scales are never mixed.
- **AI visibility is tracked per platform**, never as one blended score.
- **Predict before you change.** Every change is logged with its expected outcome before it ships.
- **Verified rules override vendor claims.** Where a skill or tool contradicts the fact-checked rule base, the rule base wins.
- **Humans approve before anything publishes.**

## Architecture

&#91;embedded content: system architecture · profile, orchestrator, four engines, outputs\]

The profile is the only thing that changes between projects. The orchestrator reads it, calls the four engines, and writes one output set; the monitoring phase re-runs the engines and diffs the results against the last run.

## Project profile

A new project is onboarded by filling one profile file; no engine code changes. Every field below feeds at least one engine.

| Field | Example | Used by |
| --- | --- | --- |
| Domain and key URLs | estateium.ae, service pages | Crawl and audit engine |
| Market and languages | Dubai, GCC; English and Arabic | Keyword research, content briefs |
| Audience | Who searches and what problem they solve | Keyword research, content |
| Conversions | Enquiry form, WhatsApp, call | Analytics goals, fix-queue priority |
| Competitors | 3 to 5 domains | Gap analysis, share of voice |
| Buyer prompts | Questions buyers ask AI assistants | AI visibility tracker |
| Data access | Search Console, GA4, Bing Webmaster properties; DataForSEO login; Google Ads account for Keyword Planner | Data connectors |
| Stack notes | CMS or framework, rendering mode | Technical checks, fix routing |

The profile also stores the baseline scores and the change log, so each re-run compares against the project's own history.

## Module map

Each of the eight branches becomes a module with its own checks and its own tools. Phase = when it is built.

| Module | What it checks | Tools | Phase |
| --- | --- | --- | --- |
| Technical SEO | Click depth, raw-HTML readability, speed, mobile, sitemap and robots, schema matches visible text, broken pages | squirrelscan, Crawl4AI, Lighthouse | 1 |
| On-page SEO | Titles vs how people ask, meta descriptions, question-style H2s answered in the first sentence, alt text, anchor text | squirrelscan, seo-audit skill | 1 |
| Keyword research | Audience problem, seed terms, intent split, own page or section of one | Search Console, DataForSEO MCP, Keyword Planner, Autocomplete, content-strategy skill | 2 |
| Site structure | Page map from the keyword set, internal links | site-architecture, programmatic-seo skills | 2 |
| Content creation | Declarative intro, unique data points, right format (article, table, calculator), last updated | Content briefs from the rule base, human approval | 3 |
| AI search | Citations and mentions per platform, which pages get cited, raw-HTML access for AI crawlers | AI visibility tracker, ai-seo skill (overridden where it conflicts) | 4 |
| Off-page SEO | Links that send customers, brand mentions, consistent address and hours, who recommends us | Search Console links, Ahrefs Free (own sites), mention tracking | 5 |
| Analytics and monitoring | One success number, impressions vs clicks, engagement, conversions that became revenue, predicted vs actual | Search Console, GA4, squirrelscan diffs | 5 |

## Verified rule base

These rules come from the fact-check of the carousel and override any skill or tool that says otherwise. Each keeps its scope, because most studies cover one platform.

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

Heuristics, not rules: three-click depth; social signals as distribution rather than ranking.

## Data flow and outputs

&#91;embedded content: operating loop · 7 steps, repeating\]

Each cycle writes the outputs listed in the architecture, and the diff against the previous run shows whether the predicted outcome happened. Nothing ships without the human approval step.

## Phased build plan

&#91;embedded content: build roadmap · 5 phases, 4 gates\]

No durations are set yet. Phase 1 starts with a pilot project so every later phase is tested on real data before a second project is onboarded.

## Tool stack, licensing and costs

Everything runs in Claude Code on a free core stack plus one paid layer, DataForSEO (pay-as-you-go, $50 deposit ceiling); ChatGPT and Perplexity are checked manually when needed; the only IP built from scratch is the AI visibility tracker and the orchestration on the InoTech core.

| Component | Cost and limits | Role |
| --- | --- | --- |
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | Open source; 51.6K stars | Knowledge layer |
| [squirrelscan](https://github.com/squirrelscan/squirrelscan) | CLI and rules open source; local audits free | Audit engine |
| [Crawl4AI](https://scrappey.com/qa/web-scraping-apis/what-is-crawl4ai) | Apache 2.0, free | Raw vs rendered check |
| Lighthouse | Apache 2.0, free | Speed, Core Web Vitals |
| Search Console + [mcp-gsc](https://github.com/AminForou/mcp-gsc) | Free | Real queries, positions, clicks, AI Overview and AI Mode impressions |
| [DataForSEO MCP](https://dataforseo.com/seo-mcp-server) | [$50 minimum deposit, no subscription](https://dataforseo.com/apis/serp-api/pricing); SERP from $0.0006 per query; \~$1.50 per project per month (estimate) | Exact search volumes, keyword ideas, competitor SERPs |
| Google Keyword Planner | Free with a Google Ads account; volumes shown as ranges | Cross-check on volumes |
| Google Autocomplete and People Also Ask | Free | Seed and question expansion |
| [Bing Webmaster Tools](https://www.searchinfluence.com/blog/bing-ai-performance-report-copilot-citations/) | Free; AI Performance report is CSV export, no API yet | Copilot citations, Bing keyword data |
| [Ahrefs Free](https://ahrefs.com/webmaster-tools?afsrc=1) | Free for unlimited verified sites; 5,000 crawl credits per project per month; no API | Backlinks, second audit |
| Google Trends | [Official API is a limited alpha](https://developers.google.com/search/apis/trends); pytrends archived | Manual checks only |
| SearXNG (self-hosted) | Open source | Fallback SERP snapshots |
| Claude (web search in Claude Code) | Included in the Claude Code subscription | Claude prompt checks |
| Gemini API | Free tier with rate limits | Gemini prompt checks |
| ChatGPT and Perplexity | No free API | Manual checks, run when needed |
| [Elmo](https://github.com/elmohq/elmo) | MIT; 263 stars | Reference for the visibility tracker |
| Claude Code | Existing subscription | Orchestrator; runs every phase |

DataForSEO fills the free stack's gaps: exact volumes and competitor SERPs, including for new sites with no Search Console history. The $50 deposit is the hard ceiling: auto-recharge off, Standard queue by default. Its refund window is 30 days from the first purchase, and the Backlinks API is priced separately, so check it before enabling.

Firecrawl was rejected for the product build: it is AGPL-3.0, which creates source-sharing obligations if InoTech sells the system. Crawl4AI's Apache licence does not.

## Runs in Claude Code

Every phase runs in Claude Code. The system is one repository: each project is a profile folder and each phase is a slash command.

```text
seo-system/
  CLAUDE.md             rule base + operating loop
  .mcp.json             mcp-gsc, dataforseo, squirrelscan MCP
  .claude/skills/       marketingskills + squirrelscan audit-website
  .claude/commands/     /audit  /research  /brief  /visibility  /review
  engines/              crawl4ai raw-vs-rendered, lighthouse runner, prompt runner
  projects/<name>/      profile.yaml, baseline, change-log, reports
```

Adding a project = create its folder and profile, then run /audit.

Spend guard: DataForSEO calls use the Standard queue unless Live is asked for, and every run writes its cost to the project's change log.

## Risks and open decisions

**Risks**

- **Vendor skills contain unverified claims.** The ai-seo skill cites a 30 to 40% schema lift that a controlled Ahrefs test did not reproduce; the rule base overrides it.
- **AI visibility tooling is immature.** The best open-source tracker has 263 stars; building on the InoTech core avoids depending on it.
- **AI citations are volatile.** Sources change within weeks, so single snapshots mislead; track trends per engine.
- **Tool rules can drift.** squirrelscan and the skills update often; pin versions and re-check the rule base each quarter.

**Open decisions**

- [ ] Which project is the pilot for Phase 1
- [ ] Whether the system is sold as an InoTech service or kept internal first
- [ ] Decided: ChatGPT and Perplexity checks stay manual, run when needed
- [ ] Which buyer prompts form the first tracked set
