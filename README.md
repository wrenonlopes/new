# SEO + AI Search Visibility System

Per-project SEO and AI-search audit, plan and monitoring loop, run from Claude Code. Design: `SEO + AI Search Visibility System — Blueprint.md`. Operating manual (rule base, loop, guards): `CLAUDE.md`.

## Setup (once per machine)

Needs Node, [uv](https://docs.astral.sh/uv/) and Docker.

```bash
npm install                 # squirrelscan 0.0.98, lighthouse 13.5.0 (pinned)
uv sync                     # crawl4ai, google-genai, pyyaml (pinned)
uv run crawl4ai-setup       # Chromium for Crawl4AI and Lighthouse
docker compose -f searxng/docker-compose.yml up -d   # SERP fallback on 127.0.0.1:8888
uv run engines/test_engines.py                       # prints "ok"
```

Credentials: copy the exports in `.env.example` into your shell profile and fill them. Then start Claude Code in this folder and approve the three project MCP servers (`search-console`, `dataforseo`, `squirrelscan`).

Accounts to set up by hand: Google Cloud OAuth client (Search Console API), DataForSEO ($50 deposit, auto-recharge off), Gemini API key, Bing Webmaster Tools, Ahrefs Webmaster Tools, Google Ads (Keyword Planner).

### Skills

Vendored from pinned commits, scanned with `skillspector --no-llm` on 2026-09-27:

| Source | Commit | Scope | Scan |
| --- | --- | --- | --- |
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | `5b2c000` | `skills/*` → `.claude/skills/`, `tools/` → `.claude/tools/` | Full repo CRITICAL (false positives in ad/sales skills and API docs); the 5 SEO skills LOW |
| [squirrelscan/skills](https://github.com/squirrelscan/skills) | `993ff2e` | `skills/audit-website` → `.claude/skills/` | Full repo CRITICAL (install docs); audit-website LOW |

## Use

```bash
cp -R projects/_template projects/<name>   # or let /audit onboard it
```

| Command | Phase | Does |
| --- | --- | --- |
| `/audit <name>` | 1 | Technical + on-page checks → ranked fix queue |
| `/research <name>` | 2 | Keywords (DataForSEO) + page map |
| `/brief <name> <group or URL>` | 3 | Content brief from the rule base |
| `/visibility <name> [chatgpt] [perplexity]` | 4 | AI mentions and citations, per platform |
| `/review <name>` | 5 | Diffs, predicted vs actual, analytics, off-page |

Outputs land in `projects/<name>/reports/<date>/` and `projects/<name>/visibility/<date>/`.
