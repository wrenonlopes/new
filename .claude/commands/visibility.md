---
description: AI search visibility per platform - mentions, citations, cited pages, AI-crawler access (Phase 4).
argument-hint: <project-name> [chatgpt] [perplexity]
---

Arguments: `$ARGUMENTS`. First word is the project; `chatgpt` / `perplexity` add the manual platforms to this run.

`VIS=projects/<name>/visibility/<today>`. Requires `buyer_prompts` and `brand.names` in the profile; if missing, ask for them and stop.

## Collect, one platform at a time (never blend)

- **Gemini**: `uv run engines/prompt_runner.py gemini --profile projects/<name>/profile.yaml --out-dir $VIS`. Needs `GEMINI_API_KEY`; without it, Gemini is `unknown` for this run.
- **Claude**: for each buyer prompt, answer it with web search as a buyer would get it, and record the URLs you would cite. Save as `[{prompt, answer, citations, run_by: "claude-code-web-search"}]` in `$VIS/claude-answers.json`, then `uv run engines/prompt_runner.py score --profile ... --platform claude --answers $VIS/claude-answers.json --out-dir $VIS`. Answer each prompt fresh; do not look at the brand's site first.
- **ChatGPT / Perplexity** (only if named in the arguments): `uv run engines/prompt_runner.py template --profile ... --out $VIS/<platform>-answers.json`, ask the user to paste each answer and its cited links, then `score --platform <platform>`.
- **Copilot**: if the user supplies the Bing Webmaster AI Performance CSV, summarize cited pages from it as its own platform.
- **Google AI Overviews / AI Mode**: from Search Console if the MCP exposes those impressions; otherwise `unknown`.

## AI-crawler access

- robots.txt: are GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended and Bingbot allowed on the pages that should be cited?
- `uv run engines/raw_vs_rendered.py` on every own page that was cited or should be (target pages from `page-map.md`). Content only after JS = invisible to non-Google AI crawlers.

## Score and report

Write `$VIS/report.md`:
- One table per platform: prompt, mentioned, cited, own pages cited, competitors cited.
- Per platform: mention rate and citation rate, and the trend versus earlier runs of the same platform (say how many runs). One snapshot is not a trend; citations are volatile.
- Which own pages get cited, and which competitor or third-party pages are cited instead. 85% of brand discovery comes from third-party sources, so list the third-party domains that earn citations as off-page targets.
- Checks in the CLAUDE.md format; fixes into the fix queue.

Where the `ai-seo` skill conflicts with the rule base (e.g. schema lift, llms.txt as a requirement), follow the rule base and say so.

Store per-platform rates under `visibility.<platform>` in `baseline.json`. Never store a combined score.
