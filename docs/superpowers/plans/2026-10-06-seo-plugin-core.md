# SEO Plugin Core Implementation Plan (Plan 1 of 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A globally installed Claude Code plugin `seo` that, in any project folder, sets itself up, audits the site (or a local dev server) into pass/fail/unknown checks with evidence, ranks fixes, and applies approved fixes by stack — with spend and safety guards enforced by a hook.

**Architecture:** This repo becomes a local plugin marketplace (`.claude-plugin/marketplace.json`) holding one plugin at `plugins/seo/`. Commands stay thin and load the `seo-system` skill (rule base, loop, check catalogue). Work is done by small engines: Python scripts with uv inline dependencies (`uv run --script`) and one Node script; pinned Node tools are installed once into `${CLAUDE_PLUGIN_DATA}/node`. Per-project state lives in `<project>/.seo/`.

**Tech Stack:** Python 3.12 (uv inline scripts, pytest), Crawl4AI 0.9.4, Node ≥ 22.18 (squirrelscan 0.0.98, unlighthouse-ci 0.19.1, @adobe/structured-data-validator 1.7.0, @marbec/web-auto-extractor 2.2.1), Claude Code plugin system (commands, skills, hooks).

**Spec:** `docs/superpowers/specs/2026-10-05-seo-plugin-design.md` (v2). This plan covers spec §3 commands `start`, `setup`, `audit`, `fix`; §4–8; §12–13; §15 (core tests); §16 (migration). Plans 2–4 cover `/seo:research` + `/seo:content` + `/seo:brief` (§9), `/seo:visibility` (§11), `/seo:offpage` + `/seo:review` + schedules (§10, §11 sampler, §12 scheduled runs).

**Deviations from the spec (deliberate):**
- §12's per-project deny lists in `.claude/settings.local.json` are replaced by the plugin's PreToolUse hook. The hook enforces the same denials in every project, with no per-project file to keep in sync.
- §13 health checks for MCP servers (Search Console, DataForSEO balance, GA4) move to the plans that first call each server. Plan 1's doctor covers the local tools.
- §15's fixture robots.txt blocks `OAI-SearchBot`, not `GPTBot`. GPTBot is training-only, so blocking it is not a search-visibility failure (see the seo-system overrides).

**Shared scratch path:** steps that test an installed copy of the Node tools use `/tmp/claude-501/seo-plugin-data` as the plugin data folder (DATA). Each Bash call starts a fresh shell, so the path is written out in full rather than kept in a variable.

## Global Constraints

- Plugin name `seo`; marketplace name `seo-tool`; commands are `/seo:<name>`.
- Python engines start with `# /// script` inline metadata: `requires-python = ">=3.12"`; exact pins `crawl4ai==0.9.4`, `google-genai==2.25.0`, `pyyaml==6.0.3`; any engine that pulls crawl4ai or google-genai also lists `"cryptography<49; sys_platform == 'darwin' and platform_machine == 'x86_64'"` (no Intel-mac wheel ≥ 49).
- Engines that use Crawl4AI print this line in `--help` (licence requirement for command-line tools): `This product includes software developed by UncleCode (https://x.com/unclecode) as part of the Crawl4AI project (https://github.com/unclecode/crawl4ai).`
- Heavy imports (crawl4ai, playwright, google.genai) happen inside functions, so tests can import pure logic.
- Hook scripts: standard library only, Python 3.9 compatible (they run on the system `python3`).
- Node tools exact pins: `squirrelscan` 0.0.98, `unlighthouse-ci` 0.19.1, `@adobe/structured-data-validator` 1.7.0, `@marbec/web-auto-extractor` 2.2.1; Node ≥ 22.18.0; installed into `${CLAUDE_PLUGIN_DATA}/node` by `engines/ensure_node.sh`.
- squirrel is always called by path (`${CLAUDE_PLUGIN_DATA}/node/node_modules/squirrelscan/bin/squirrel`) with `NO_TELEMETRY=1`. Never `--render` (only `--render-mode off`), `-y`, `--publish`/`-p`, `auth`, `keys`.
- Every check has keys `id`, `question`, `verdict` (`pass` | `fail` | `unknown`), `pages` (list of URLs), `evidence`, `source`; optional `rule`, `heuristic: true`.
- No secret value is ever written to a file or printed. `${VAR}` references are stored literally in MCP config.
- Project state only under `<project>/.seo/`. The plugin never creates `.agents/product-marketing.md`.
- Licences: bundle MIT / Apache-2.0 / BSD only; GPL tools are recommended, never bundled; AGPL never.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Work happens on branch `seo-plugin`.
- Python tests: `uv run pytest plugins/seo/tests -q` from the repo root. Node tests: `node --test plugins/seo/node/` (after `npm ci` in `plugins/seo/node`).

## Review Focus

- **Large sites:** the breadth-first crawl stops at `--max-pages` before reaching deep targets. Unreached targets must be `unknown`, not `fail` (test in Task 3).
- **WordPress / Yoast JSON-LD:** `@graph` wrappers and multi-typed items (`["Article","NewsArticle"]`). Expect one issue per missing field, not duplicates, and subtypes (RealEstateAgent) checked as LocalBusiness (test in Task 4).
- **Compound shell commands:** `mkdir -p x && squirrel audit … --render-mode off` must not be denied; only squirrel's own flags count (test in Task 6).
- **Projects with secrets in `.env`:** detection must return only site URLs, never any other value (test in Task 7).
- **Low-traffic sites:** CrUX returns 404 for URL and origin. Expect `unknown` with a reason, not `fail`; a missing `GOOGLE_API_KEY` gives `unknown` plus the unlock step (test in Task 5).

---

### Task 1: Plugin skeleton, marketplace and the `seo-system` skill

**Files:**
- Create: `.claude-plugin/marketplace.json`
- Create: `plugins/seo/.claude-plugin/plugin.json`
- Create: `plugins/seo/NOTICE`
- Create: `plugins/seo/skills/seo-system/SKILL.md`
- Modify: `.gitignore`

**Interfaces:**
- Produces: installable plugin `seo@seo-tool`; skill `seo-system` that every command loads; the check catalogue ids used by Tasks 3–5 and 11.

- [ ] **Step 1: Commit the current repo as a baseline**

The repo has no commits besides the spec; everything else is untracked. Commit it so the migration diff is reviewable.

```bash
cd /Users/abdelhamidsahbi/seo-tool
git switch seo-plugin
git add -A
git commit -m "chore: baseline before plugin migration

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 2: Write the marketplace and plugin manifests**

`.claude-plugin/marketplace.json`:

```json
{
  "name": "seo-tool",
  "description": "SEO + AI search visibility system for Claude Code",
  "owner": { "name": "Abdelhamid" },
  "plugins": [
    {
      "name": "seo",
      "source": "./plugins/seo",
      "description": "Plug-and-play SEO + AI search visibility: audit, ranked fixes, approved fixes, monitoring."
    }
  ]
}
```

`plugins/seo/.claude-plugin/plugin.json`:

```json
{
  "name": "seo",
  "version": "0.1.0",
  "description": "Plug-and-play SEO + AI search visibility: audit, ranked fixes, approved fixes, monitoring.",
  "author": { "name": "Abdelhamid" },
  "license": "UNLICENSED",
  "keywords": ["seo", "geo", "ai-search", "audit", "structured-data"]
}
```

Append to `.gitignore`:

```text
plugins/seo/node/node_modules/
```

- [ ] **Step 3: Write `plugins/seo/NOTICE`**

```text
seo plugin: third-party notices

Bundled data
- schema.org vocabulary v30.1 (data/schemaorg-all-https.jsonld), Apache-2.0, https://schema.org

Installed on the user's machine at setup, not redistributed in this repository
- Crawl4AI 0.9.4, Apache-2.0 with attribution clause.
  This product includes software developed by UncleCode (https://x.com/unclecode) as part of the Crawl4AI project (https://github.com/unclecode/crawl4ai).
- squirrelscan 0.0.98 (MIT), unlighthouse-ci 0.19.1 (MIT), @adobe/structured-data-validator 1.7.0 (Apache-2.0), @marbec/web-auto-extractor 2.2.1 (MIT), Lighthouse via Unlighthouse (Apache-2.0)

Vendored skills (MIT), pinned
- coreyhaines31/marketingskills @5b2c000: seo-audit, ai-seo, schema, site-architecture, programmatic-seo, content-strategy, competitors, copywriting, copy-editing, analytics, public-relations, directory-submissions. Copyright (c) Corey Haines.
- squirrelscan/skills @993ff2e: audit-website. Copyright (c) squirrelscan.
- addyosmani/web-quality-skills @afa8da9: core-web-vitals, performance. Copyright (c) 2026 Addy Osmani.

Ideas borrowed and rewritten (MIT): local-SEO, Common Crawl graph and backlink-verification approaches (AgriciDaniel/claude-seo); AI-crawler user-agent list and CDN bot-blocking checks (Auriti-Labs/geo-optimizer-skill); evidence slots and claim tables (AgriciDaniel/claude-blog); cannibalization approach (AminForou/mcp-gsc).
```

- [ ] **Step 4: Write `plugins/seo/skills/seo-system/SKILL.md`**

Build it from the text below. Where it says COPY, paste the named text verbatim from the named file.

````markdown
---
name: seo-system
description: Rule base, operating loop, check catalogue and spend guards for the seo plugin. Load before running any /seo:* command, and when judging SEO or AI-search questions for a project that has a .seo/ folder.
---

# SEO system

## Principles (non-negotiable)

COPY: the seven bullets under "## Principles (non-negotiable)" in /Users/abdelhamidsahbi/seo-tool/CLAUDE.md.

## Where things live

- Plugin code: `${CLAUDE_PLUGIN_ROOT}` (engines/, node/, data/, templates/, skills/). Pinned Node tools: `${CLAUDE_PLUGIN_DATA}/node`, installed by `engines/ensure_node.sh`.
- Project state: `${CLAUDE_PROJECT_DIR}/.seo/`: `profile.yaml`, `baseline.json`, `change-log.md`, `reports/<YYYY-MM-DD>/` (production runs) and `reports/<YYYY-MM-DD>-local/` (dev-server runs; never written to the baseline), each with `checks.yaml`, `fix-queue.md` and tool dumps in `raw/`; `handoff/`, `briefs/`, `inputs/`.
- Vendored skills that ask for `.agents/product-marketing.md` or `product-marketing-context.md` use `.seo/profile.yaml` instead. Never create those files.

## Operating loop

1. **Load**: `profile.yaml`, `baseline.json`, `change-log.md`. Missing profile fields → the affected checks are `unknown`.
2. **Collect**: run the module's engines and tools; raw output under the run's `raw/`.
3. **Score**: findings → checks in the check format; apply the rule base.
4. **Rank**: `fix-queue.md` in the run folder.
5. **Predict**: every fix that will ship gets a change-log row before it ships: change, pages, predicted outcome, metric and source, check-after date.
6. **Approve**: the approver's name in that row. Nothing ships without it.
7. **Re-run and diff**: the next production run compares with `baseline.json` and the predictions, fills `Actual`, then updates `baseline.json`.

## Check format

```yaml
- id: tech.raw-html
  question: Is the core content in the initial HTML?
  verdict: fail                    # pass | fail | unknown
  pages: [https://example.com/services]
  evidence: raw has 45% of rendered words; H1 "Services" missing from raw
  rule: Core content must be in the initial HTML
  source: engines/raw_vs_rendered.py
  heuristic: false                 # true for heuristics (e.g. three-click depth)
```

No evidence → `unknown`, with what would resolve it.

## Check catalogue (Plan 1)

| id | Question | Source |
| --- | --- | --- |
| tech.raw-html | Is the core content in the initial HTML? | raw_vs_rendered.py |
| tech.click-depth | Are key and conversion pages within 3 clicks of the start page? (heuristic) | site_graph.py |
| tech.ai-crawler-access | Can search and AI-search crawlers fetch the key pages (robots.txt)? | site_graph.py |
| tech.crawl-index | Can every page that should be indexed be crawled and indexed (robots, sitemap, noindex, canonicals)? | squirrel crawl/* and core/canonical; Search Console URL Inspection |
| tech.broken | Are there broken pages, broken links or redirect chains? `pages` = the broken URLs; linking pages go in evidence | squirrel links/* |
| tech.hreflang | Are hreflang annotations valid and reciprocal? | site_graph.py; squirrel i18n/* |
| tech.schema-valid | Is the structured data valid for Google rich results and schema.org? | schema_check.mjs; Search Console richResultsResult |
| tech.schema-matches | Does structured data match visible text? | schema_check.mjs |
| tech.speed-lab | Do pages load fast and stay stable on mobile (lab)? | Unlighthouse → lab_speed.py |
| tech.speed-field | Do real mobile users get good Core Web Vitals (CrUX p75)? | crux.py |
| tech.mobile | Is the page usable on mobile (viewport, tap targets, font size)? | squirrel mobile/* |
| onpage.title-intent | Do titles match how people ask? | squirrel core/meta-title + Search Console queries (rule scope: ChatGPT) |
| onpage.meta | Does every indexable page have a unique, specific meta description? | squirrel core/meta-description, content/duplicate-description |
| onpage.h1 | Does every indexable page have exactly one descriptive H1? | squirrel core/h1*, content/heading-hierarchy |
| onpage.h2-answers | Are H2s phrased as questions and answered in the first sentence below them? | rendered markdown (judgement, quote evidence) |
| onpage.answer-early | Is the key answer in the first 30% of the page? (scope: ChatGPT) | rendered markdown |
| onpage.declarative-intro | Does the page open with a declarative statement? | rendered markdown |
| onpage.alt | Do meaningful images have descriptive alt text? | squirrel images/alt* |
| onpage.anchors | Is internal anchor text descriptive? | squirrel a11y/link-text, links anchor rules |

### squirrelscan rule prefixes → checks

| squirrel rule id prefix | Check |
| --- | --- |
| `crawl/`, `core/canonical`, `core/robots*` | tech.crawl-index |
| `links/` | tech.broken (anchor-text rules → onpage.anchors) |
| `mobile/` | tech.mobile |
| `core/meta-title`, `core/title-unique`, `content/duplicate-title` | onpage.title-intent (evidence) |
| `core/meta-description`, `content/duplicate-description` | onpage.meta |
| `core/h1`, `content/heading-hierarchy` | onpage.h1 |
| `images/alt` | onpage.alt |
| `a11y/link-text` | onpage.anchors |
| `i18n/` | tech.hreflang (second opinion) |
| `schema/`, `structured-data/` | tech.schema-valid (second opinion) |
| `perf/` | evidence for tech.speed-lab fixes |
| `ax/content-without-js` | ignore: needs paid rendering; tech.raw-html covers it |
| other `ax/` (llms-txt, markdown-response, agents-md) | info only (override below) |
| anything else (`eeat/`, `legal/`, `security/`, `local/`, `social/`, `url/`, other `content/`, `analytics/`, `blocking/`, other `a11y/`) | "Other findings" list in fix-queue.md with squirrel's severity; not rule failures |

Unknown prefixes go to "Other findings".

## Fix queue ranking

COPY: the "### Fix queue ranking" subsection (numbered list and the paragraph after it) from /Users/abdelhamidsahbi/seo-tool/CLAUDE.md.

## Verified rule base

COPY: the full table under "## Verified rule base" from /Users/abdelhamidsahbi/seo-tool/CLAUDE.md, then append the rows of the table under "## 14. Rule-base additions (scoped)" from docs/superpowers/specs/2026-10-05-seo-plugin-design.md. Apply the two "Edits to existing rows" listed in that spec section.

**Heuristics, not rules** (report as such, never as failures of a rule): three-click depth; social signals as distribution rather than ranking; topical-coverage correlation; internal-link counts; content-decay thresholds; SERP-clustering threshold; GEO-paper lifts.

## Known overrides

COPY: the three bullets under "### Known overrides" from /Users/abdelhamidsahbi/seo-tool/CLAUDE.md. Then add:

- Keyword density targets (claude-seo `seo-content`): overridden; Google lists keyword stuffing as spam and states no density.
- Word-count targets (claude-seo, claude-blog): overridden; Google has no preferred length.
- GEO statistics attributed to the GEO paper that are not in it (geo-seo-claude: "134-167 words", "115% quotations"): overridden.
- `ai-seo` GEO lift table: heuristic only; a replication found most GEO methods ineffective.
- Updating dates without substantive changes (`copy-editing` content-refresh): overridden.
- `public-relations` lists Connectively as live: it shut down 2024-12-09; HARO relaunched under Featured 2025-04-22.
- `directory-submissions` dofollow check by HTTP headers: invalid (rel lives in the HTML); its article-site and social-bookmarking tiers are link spam under Google's policies; its FAQ-schema claim conflicts with the rule base.
- Blocking an AI crawler in robots.txt is not automatically a failure: training-only agents (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot, meta-externalagent) do not affect search results; only search and user-fetch agents count for tech.ai-crawler-access.

## Tools and spend guards

| Tool | How to run | Guard |
| --- | --- | --- |
| squirrelscan | `NO_TELEMETRY=1 "${CLAUDE_PLUGIN_DATA}/node/node_modules/squirrelscan/bin/squirrel" audit <base> -C full --render-mode off -f json -o <file>` | Local and free only. The plugin hook denies `auth`, `keys`, `--render` (except `--render-mode off`), `-y`, `--publish`/`-p`. |
| Raw vs rendered, site graph | `uv run --script "${CLAUDE_PLUGIN_ROOT}/engines/raw_vs_rendered.py" …`, `site_graph.py` | Free, local |
| Lab speed | `"${CLAUDE_PLUGIN_DATA}/node/node_modules/.bin/unlighthouse-ci" …` then `lab_speed.py` | Free; lab data |
| Field speed | `crux.py` | Needs `GOOGLE_API_KEY`; field beats lab |
| Structured data | `node "${CLAUDE_PLUGIN_DATA}/node/schema_check.mjs" …` | Free |
| Search Console | `search-console` MCP | Read-only; the hook denies add/delete site and sitemap submit/delete/manage |
| DataForSEO | `dataforseo` MCP | Quote the cost and wait for a yes before every call. Standard queue by default. The hook asks on any `/live` path (Labs is Live-only) and denies `/backlinks/`. Log calls and cost in change-log "Run costs". $50 deposit, auto-recharge off. |

Credentials come only from environment variables; never print or store their values.
````

- [ ] **Step 5: Validate the manifests**

Run: `claude plugin validate /Users/abdelhamidsahbi/seo-tool && claude plugin validate /Users/abdelhamidsahbi/seo-tool/plugins/seo`
Expected: both report valid (no errors). Fix any reported field errors before continuing.

- [ ] **Step 6: Install from the local marketplace and confirm the skill loads**

```bash
claude plugin marketplace add /Users/abdelhamidsahbi/seo-tool
claude plugin install seo@seo-tool
claude plugin details seo@seo-tool
```

Expected: `details` lists skill `seo-system` and a projected token cost. Local-path plugins are read in place: later edits apply on the next session or `/reload-plugins`.

- [ ] **Step 7: Commit**

```bash
git add .claude-plugin plugins/seo .gitignore
git commit -m "feat(seo): plugin skeleton, local marketplace, seo-system skill

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Test harness and the two existing engines

**Files:**
- Move: `engines/raw_vs_rendered.py` → `plugins/seo/engines/raw_vs_rendered.py` (rewrite below)
- Move: `engines/prompt_runner.py` → `plugins/seo/engines/prompt_runner.py` (header only; upgraded in Plan 3)
- Delete: `engines/test_engines.py`
- Create: `plugins/seo/tests/conftest.py`, `plugins/seo/tests/test_raw_vs_rendered.py`, `plugins/seo/tests/test_prompt_runner.py`
- Modify: `pyproject.toml` (pytest dev dependency)

**Interfaces:**
- Produces: `raw_vs_rendered.compare(url, raw, rendered) -> dict` (a check with `id: "tech.raw-html"`), `raw_vs_rendered.slug(url) -> str`, CLI flag `--save-markdown DIR` (writes rendered markdown per URL to `DIR/<slug>.md`, used by the audit command); `prompt_runner.score(profile, platform, answers) -> {"summary", "results"}` unchanged.

- [ ] **Step 1: Add pytest and the test path setup**

```bash
cd /Users/abdelhamidsahbi/seo-tool && uv add --dev pytest
```

`plugins/seo/tests/conftest.py`:

```python
import sys
from pathlib import Path

PLUGIN = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PLUGIN / "engines"))
sys.path.insert(0, str(PLUGIN / "hooks"))
```

- [ ] **Step 2: Move the engines with git**

```bash
mkdir -p plugins/seo/engines plugins/seo/tests
git mv engines/raw_vs_rendered.py plugins/seo/engines/raw_vs_rendered.py
git mv engines/prompt_runner.py plugins/seo/engines/prompt_runner.py
git rm -q engines/test_engines.py
```

- [ ] **Step 3: Write the failing tests**

`plugins/seo/tests/test_raw_vs_rendered.py`:

```python
from raw_vs_rendered import compare, slug


def page(words, h1, status=200):
    return {"ok": True, "status": status, "words": words, "h1": h1, "headings": h1,
            "internal_links": 3, "json_ld": False, "blocks": []}


def test_pass_when_raw_has_most_content():
    r = compare("u", page(95, ["Hi"]), page(100, ["Hi"]))
    assert r["verdict"] == "pass"
    assert r["id"] == "tech.raw-html"


def test_fail_when_content_only_after_js():
    assert compare("u", page(40, ["Hi"]), page(100, ["Hi"]))["verdict"] == "fail"


def test_fail_when_h1_injected_by_js():
    assert compare("u", page(100, []), page(100, ["Hi"]))["verdict"] == "fail"


def test_unknown_when_a_fetch_failed():
    r = compare("u", {"ok": False, "status": None, "error": "x"}, page(1, []))
    assert r["verdict"] == "unknown"


def test_slug_is_filesystem_safe():
    assert slug("https://Example.com/a/b?x=1") == "example-com-a-b-x-1"
```

`plugins/seo/tests/test_prompt_runner.py`:

```python
from prompt_runner import score

PROFILE = {"domain": "example.com", "competitors": ["rival.com"], "brand": {"names": ["Example Co"]}}


def test_score_verdicts_and_lookalike_domain():
    res = score(PROFILE, "claude", [
        {"prompt": "a", "answer": "Example Co", "citations": ["https://www.example.com/x", "https://rival.com"]},
        {"prompt": "b", "answer": "none", "citations": ["https://notexample.com"]},
        {"prompt": "c", "answer": "", "citations": []},
    ])
    assert [r["verdict"] for r in res["results"]] == ["pass", "fail", "unknown"]
    assert res["results"][0]["competitors_cited"] == ["rival.com"]
    assert res["summary"] == {"platform": "claude", "prompts": 3, "answered": 2,
                              "mention_rate": 0.5, "citation_rate": 0.5}
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `uv run pytest plugins/seo/tests -q`
Expected: FAIL. `slug` is not defined (ImportError) and `compare` returns no `id`.

- [ ] **Step 5: Rewrite `plugins/seo/engines/raw_vs_rendered.py`**

```python
# /// script
# requires-python = ">=3.12"
# dependencies = [
#   "crawl4ai==0.9.4",
#   "cryptography<49; sys_platform == 'darwin' and platform_machine == 'x86_64'",
# ]
# ///
"""Raw vs rendered check.

Question: is the core content in the initial HTML?
ChatGPT, Claude, Perplexity and Meta crawlers do not run JavaScript, so
anything that only appears after rendering is invisible to them.

Fetches each URL twice through the same Crawl4AI pipeline:
  raw      - plain HTTP, AI-crawler user agent, no JavaScript
  rendered - headless Chromium
and compares words, headings, internal links and JSON-LD.

Usage:
  uv run --script raw_vs_rendered.py URL [URL ...] --out report.json [--save-markdown DIR]

This product includes software developed by UncleCode (https://x.com/unclecode) as part of the Crawl4AI project (https://github.com/unclecode/crawl4ai).
"""

import argparse
import asyncio
import json
import re
import sys
from pathlib import Path

GPTBOT_UA = (
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); "
    "compatible; GPTBot/1.2; +https://openai.com/gptbot"
)
# Heuristic: raw must carry at least this share of the rendered words to pass.
MIN_RAW_SHARE = 0.8


def slug(url):
    return re.sub(r"[^a-z0-9]+", "-", url.lower().split("://", 1)[-1]).strip("-")[:80]


def summarize(result):
    if not result.success:
        return {"ok": False, "status": result.status_code, "error": result.error_message}
    md = str(result.markdown or "")
    blocks = [b.strip() for b in re.split(r"\n\s*\n", md) if len(b.split()) >= 8]
    return {
        "ok": True,
        "status": result.status_code,
        "words": len(md.split()),
        "h1": [l[2:].strip() for l in md.splitlines() if l.startswith("# ")],
        "headings": [l.lstrip("#").strip() for l in md.splitlines() if re.match(r"#{1,3} ", l)],
        "internal_links": len((result.links or {}).get("internal", [])),
        "json_ld": "application/ld+json" in (result.html or ""),
        "blocks": blocks,
    }


def compare(url, raw, rendered):
    out = {"id": "tech.raw-html", "url": url, "question": "Is the core content in the initial HTML?",
           "rule": "Core content must be in the initial HTML", "source": "engines/raw_vs_rendered.py"}
    if not (raw["ok"] and rendered["ok"]):
        out.update(verdict="unknown", pages=[url], evidence={"raw": raw, "rendered": rendered})
        return out

    share = raw["words"] / rendered["words"] if rendered["words"] else 1.0
    raw_text = " ".join(raw["blocks"])
    missing_blocks = [b[:160] for b in rendered["blocks"] if b[:80] not in raw_text]
    missing_h1 = [h for h in rendered["h1"] if h not in raw["h1"]]
    missing_headings = [h for h in rendered["headings"] if h not in raw["headings"]]

    passed = share >= MIN_RAW_SHARE and not missing_h1 and raw["status"] == 200
    out.update(
        verdict="pass" if passed else "fail",
        pages=[] if passed else [url],
        evidence={
            "raw_status": raw["status"],
            "raw_words": raw["words"],
            "rendered_words": rendered["words"],
            "raw_share": round(share, 2),
            "missing_h1_in_raw": missing_h1,
            "missing_headings_in_raw": missing_headings[:10],
            "internal_links_raw_vs_rendered": [raw["internal_links"], rendered["internal_links"]],
            "json_ld_raw_vs_rendered": [raw["json_ld"], rendered["json_ld"]],
            "content_only_after_js": missing_blocks[:5],
        },
    )
    return out


async def run(urls, save_markdown=None):
    from crawl4ai import AsyncWebCrawler, CacheMode, CrawlerRunConfig, HTTPCrawlerConfig
    from crawl4ai.async_crawler_strategy import AsyncHTTPCrawlerStrategy

    cfg = CrawlerRunConfig(cache_mode=CacheMode.BYPASS, page_timeout=45000)
    http = AsyncHTTPCrawlerStrategy(browser_config=HTTPCrawlerConfig(headers={"User-Agent": GPTBOT_UA}))
    if save_markdown:
        Path(save_markdown).mkdir(parents=True, exist_ok=True)
    async with AsyncWebCrawler(crawler_strategy=http) as raw_crawler, AsyncWebCrawler() as browser:
        results = []
        for url in urls:
            raw = summarize(await raw_crawler.arun(url, config=cfg))
            rendered_result = await browser.arun(url, config=cfg)
            if save_markdown and rendered_result.success:
                (Path(save_markdown) / f"{slug(url)}.md").write_text(str(rendered_result.markdown or ""), encoding="utf-8")
            results.append(compare(url, raw, summarize(rendered_result)))
        return results


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("urls", nargs="+")
    p.add_argument("--out", help="write JSON here (default: stdout)")
    p.add_argument("--save-markdown", help="directory for rendered markdown, one <slug>.md per URL")
    args = p.parse_args()

    results = asyncio.run(run(args.urls, args.save_markdown))
    text = json.dumps(results, indent=2, ensure_ascii=False)
    if args.out:
        Path(args.out).write_text(text, encoding="utf-8")
    else:
        print(text)
    for r in results:
        print(f"{r['verdict']:>7}  {r['url']}", file=sys.stderr)


if __name__ == "__main__":
    main()
```

- [ ] **Step 6: Add the inline header to `plugins/seo/engines/prompt_runner.py`**

Insert at the very top of the file (above the docstring), leaving the rest unchanged:

```python
# /// script
# requires-python = ">=3.12"
# dependencies = [
#   "google-genai==2.25.0",
#   "pyyaml==6.0.3",
#   "cryptography<49; sys_platform == 'darwin' and platform_machine == 'x86_64'",
# ]
# ///
```

In its docstring, replace every `uv run engines/prompt_runner.py` with `uv run --script prompt_runner.py`.

- [ ] **Step 7: Run tests to verify they pass**

Run: `uv run pytest plugins/seo/tests -q`
Expected: 6 passed.

- [ ] **Step 8: Smoke-run the moved engine as an inline script**

Run: `uv run --script plugins/seo/engines/raw_vs_rendered.py https://example.com --out /tmp/claude-501/rvr.json --save-markdown /tmp/claude-501/md 2>&1 | tail -1 && ls /tmp/claude-501/md`
Expected: last line `   pass  https://example.com`; `example-com.md` listed.

- [ ] **Step 9: Commit**

```bash
git add -A pyproject.toml uv.lock plugins/seo/engines plugins/seo/tests engines
git commit -m "feat(seo): move engines into the plugin as uv inline scripts, add pytest

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Site graph engine (click depth, hreflang, AI-crawler access)

**Files:**
- Create: `plugins/seo/engines/site_graph.py`
- Test: `plugins/seo/tests/test_site_graph.py`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: CLI `site_graph.py START --out graph.json --checks-out checks.json [--targets A,B] [--max-pages 300] [--max-depth 8]`. `graph.json` = `{"start", "complete": bool, "pages": [{"url","depth","parent","status","links":[{"href","text"}],"hreflang":{lang: url}}], "top_linked": [url]}`. `checks.json` = list of three checks: `tech.click-depth`, `tech.hreflang`, `tech.ai-crawler-access`. Pure functions: `norm(url)`, `hreflang_map(html, base)`, `depth_check(pages, targets, complete, limit=3)`, `hreflang_check(pages)`, `robots_check(robots_txt, urls)`, `most_linked(pages, n)`.

- [ ] **Step 1: Write the failing tests**

`plugins/seo/tests/test_site_graph.py`:

```python
from site_graph import depth_check, hreflang_check, hreflang_map, most_linked, norm, robots_check

S = "https://s.test"


def pg(path, depth, hreflang=None, status=200, links=()):
    return {"url": norm(S + path), "depth": depth, "parent": None, "status": status,
            "links": [{"href": norm(S + l), "text": ""} for l in links], "hreflang": hreflang or {}}


def test_norm_drops_fragment_and_lowercases_host():
    assert norm("HTTPS://S.Test/a#x") == "https://s.test/a"
    assert norm("https://s.test") == "https://s.test/"


def test_hreflang_map_parses_alternates():
    html = '<link rel="alternate" hreflang="ar" href="/ar/"><link rel="canonical" href="/">'
    assert hreflang_map(html, S + "/") == {"ar": "https://s.test/ar/"}


def test_depth_fail_for_deep_target():
    pages = [pg("/", 0), pg("/deep", 5)]
    r = depth_check(pages, [S + "/deep"], complete=True)
    assert r["verdict"] == "fail" and r["pages"] == ["https://s.test/deep"] and r["heuristic"] is True


def test_depth_unreached_target_is_unknown_when_crawl_incomplete():
    r = depth_check([pg("/", 0)], [S + "/far"], complete=False)
    assert r["verdict"] == "unknown"


def test_depth_unreached_target_fails_when_crawl_complete():
    r = depth_check([pg("/", 0)], [S + "/orphan"], complete=True)
    assert r["verdict"] == "fail"


def test_depth_pass():
    assert depth_check([pg("/", 0), pg("/a", 2)], [S + "/a"], complete=True)["verdict"] == "pass"


def test_hreflang_missing_return_link_fails():
    en = pg("/en", 1, {"en": norm(S + "/en"), "ar": norm(S + "/ar")})
    ar = pg("/ar", 1, {"ar": norm(S + "/ar")})
    r = hreflang_check([en, ar])
    assert r["verdict"] == "fail" and r["pages"] == ["https://s.test/en"]


def test_hreflang_reciprocal_passes():
    en = pg("/en", 1, {"en": norm(S + "/en"), "ar": norm(S + "/ar")})
    ar = pg("/ar", 1, {"ar": norm(S + "/ar"), "en": norm(S + "/en")})
    assert hreflang_check([en, ar])["verdict"] == "pass"


def test_hreflang_invalid_code_fails():
    p = pg("/x", 1, {"english": norm(S + "/x")})
    assert hreflang_check([p])["verdict"] == "fail"


def test_robots_search_agent_blocked_fails():
    r = robots_check("User-agent: OAI-SearchBot\nDisallow: /\n", [S + "/"])
    assert r["verdict"] == "fail" and "OAI-SearchBot" in r["evidence"]["blocked_search"]


def test_robots_training_agent_blocked_is_info_only():
    r = robots_check("User-agent: GPTBot\nDisallow: /\n", [S + "/"])
    assert r["verdict"] == "pass" and "GPTBot" in r["evidence"]["blocked_training_only"]


def test_robots_unreadable_is_unknown():
    assert robots_check(None, [S + "/"])["verdict"] == "unknown"


def test_most_linked_counts_inbound():
    pages = [pg("/", 0, links=["/a", "/b", "/a"]), pg("/a", 1, links=["/b"]), pg("/b", 1)]
    assert most_linked(pages, 1) == ["https://s.test/b"] or most_linked(pages, 1) == ["https://s.test/a"]
    assert set(most_linked(pages, 2)) == {"https://s.test/a", "https://s.test/b"}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `uv run pytest plugins/seo/tests/test_site_graph.py -q`
Expected: FAIL with `ModuleNotFoundError: No module named 'site_graph'`.

- [ ] **Step 3: Write `plugins/seo/engines/site_graph.py`**

```python
# /// script
# requires-python = ">=3.12"
# dependencies = [
#   "crawl4ai==0.9.4",
#   "cryptography<49; sys_platform == 'darwin' and platform_machine == 'x86_64'",
# ]
# ///
"""Site graph: click depth, hreflang reciprocity and AI-crawler robots access.

Crawls raw HTML breadth-first from the start URL (no JavaScript, like AI crawlers).
Depth = shortest click path from the start page.

Usage:
  uv run --script site_graph.py START_URL --out graph.json --checks-out checks.json
         [--targets URL,URL] [--max-pages 300] [--max-depth 8]

This product includes software developed by UncleCode (https://x.com/unclecode) as part of the Crawl4AI project (https://github.com/unclecode/crawl4ai).
"""

import argparse
import asyncio
import json
import re
import sys
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlsplit, urlunsplit
from urllib.request import Request, urlopen
from urllib.robotparser import RobotFileParser

UA = "Mozilla/5.0 (compatible; seo-plugin-site-graph/1.0)"
DEPTH_LIMIT = 3  # heuristic: three-click depth
# Agents that decide whether pages can appear in search or AI-search answers.
SEARCH_AGENTS = ["Googlebot", "Bingbot", "OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot",
                 "Claude-User", "PerplexityBot", "Perplexity-User"]
# Training-only agents: blocking them is a policy choice and does not affect search results.
TRAINING_AGENTS = ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot", "meta-externalagent"]
LANG_RE = re.compile(r"^(x-default|[a-z]{2,3}(-[a-z]{4})?(-([a-z]{2}|\d{3}))?)$", re.I)


def norm(url):
    p = urlsplit(url)
    return urlunsplit((p.scheme.lower(), p.netloc.lower(), p.path or "/", p.query, ""))


class _Alternates(HTMLParser):
    def __init__(self):
        super().__init__()
        self.alts = {}

    def handle_starttag(self, tag, attrs):
        if tag != "link":
            return
        a = dict(attrs)
        if (a.get("rel") or "").lower() == "alternate" and a.get("hreflang") and a.get("href"):
            self.alts[a["hreflang"]] = a["href"]


def hreflang_map(html, base):
    parser = _Alternates()
    parser.feed(html or "")
    return {lang: norm(urljoin(base, href)) for lang, href in parser.alts.items()}


def depth_check(pages, targets, complete, limit=DEPTH_LIMIT):
    depth = {p["url"]: p["depth"] for p in pages}
    if targets:
        wanted = [norm(t) for t in targets]
        unreached = [t for t in wanted if t not in depth]
        deep = [{"url": t, "depth": depth[t]} for t in wanted if t in depth and depth[t] > limit]
    else:
        unreached = []
        deep = [{"url": u, "depth": d} for u, d in depth.items() if d > limit]
    if deep or (unreached and complete):
        verdict = "fail"
    elif unreached:
        verdict = "unknown"
    else:
        verdict = "pass"
    return {
        "id": "tech.click-depth",
        "question": f"Are key and conversion pages within {limit} clicks of the start page?",
        "verdict": verdict,
        "heuristic": True,
        "pages": [d["url"] for d in deep] + (unreached if complete else []),
        "evidence": {"too_deep": deep, "not_reached_by_links": unreached,
                     "crawl_complete": complete, "pages_crawled": len(pages)},
        "source": "engines/site_graph.py",
    }


def hreflang_check(pages):
    by_url = {p["url"]: p for p in pages}
    errors, unverified = [], []
    for p in pages:
        for lang, href in p.get("hreflang", {}).items():
            if not LANG_RE.match(lang):
                errors.append({"page": p["url"], "problem": f"invalid hreflang code '{lang}'"})
            if href == p["url"]:
                continue
            target = by_url.get(href)
            if target is None:
                unverified.append({"page": p["url"], "alternate": href, "problem": "alternate not reached by crawl"})
            elif (target.get("status") or 200) >= 400:
                errors.append({"page": p["url"], "alternate": href, "problem": f"alternate returns {target['status']}"})
            elif p["url"] not in target.get("hreflang", {}).values():
                errors.append({"page": p["url"], "alternate": href, "problem": "no return link"})
    uses = any(p.get("hreflang") for p in pages)
    if errors:
        verdict = "fail"
    elif unverified:
        verdict = "unknown"
    else:
        verdict = "pass"
    return {
        "id": "tech.hreflang",
        "question": "Are hreflang annotations valid and reciprocal?",
        "verdict": verdict if uses else "pass",
        "pages": sorted({e["page"] for e in errors}),
        "evidence": {"errors": errors, "unverified": unverified, "uses_hreflang": uses},
        "source": "engines/site_graph.py",
    }


def robots_check(robots_txt, urls):
    base = {"id": "tech.ai-crawler-access",
            "question": "Can search and AI-search crawlers fetch the key pages (robots.txt)?",
            "source": "engines/site_graph.py"}
    if robots_txt is None:
        return {**base, "verdict": "unknown", "pages": [], "evidence": {"error": "robots.txt could not be fetched"}}
    rp = RobotFileParser()
    rp.parse(robots_txt.splitlines())

    def blocked(agents):
        out = {}
        for agent in agents:
            hit = [u for u in urls if not rp.can_fetch(agent, u)]
            if hit:
                out[agent] = hit
        return out

    search, training = blocked(SEARCH_AGENTS), blocked(TRAINING_AGENTS)
    return {**base,
            "verdict": "fail" if search else "pass",
            "pages": sorted({u for hits in search.values() for u in hits}),
            "evidence": {"blocked_search": search, "blocked_training_only": training,
                         "note": "Training-only blocks do not affect search results; change robots.txt only on the owner's explicit choice."}}


def most_linked(pages, n):
    counts = Counter(l["href"] for p in pages for l in p["links"] if l["href"] != p["url"])
    known = {p["url"] for p in pages}
    return [u for u, _ in counts.most_common() if u in known][:n]


def fetch_text(url):
    try:
        with urlopen(Request(url, headers={"User-Agent": UA}), timeout=20) as r:
            return r.read().decode("utf-8", "replace")
    except HTTPError as e:
        return "" if e.code == 404 else None  # no robots.txt = everything allowed
    except (URLError, TimeoutError, OSError):
        return None


async def crawl(start, max_pages, max_depth):
    from crawl4ai import AsyncWebCrawler, CacheMode, CrawlerRunConfig, HTTPCrawlerConfig
    from crawl4ai.async_crawler_strategy import AsyncHTTPCrawlerStrategy
    from crawl4ai.deep_crawling import BFSDeepCrawlStrategy

    cfg = CrawlerRunConfig(deep_crawl_strategy=BFSDeepCrawlStrategy(max_depth=max_depth, max_pages=max_pages),
                           cache_mode=CacheMode.BYPASS, verbose=False)
    http = AsyncHTTPCrawlerStrategy(browser_config=HTTPCrawlerConfig(headers={"User-Agent": UA}))
    async with AsyncWebCrawler(crawler_strategy=http) as crawler:
        results = await crawler.arun(start, config=cfg)
    pages = []
    for r in results:
        url = norm(r.url)
        parent = (r.metadata or {}).get("parent_url")
        pages.append({
            "url": url,
            "depth": (r.metadata or {}).get("depth", 0),
            "parent": norm(parent) if parent else None,
            "status": r.status_code,
            "links": [{"href": norm(urljoin(url, l.get("href", ""))), "text": (l.get("text") or "").strip()[:120]}
                      for l in (r.links or {}).get("internal", [])],
            "hreflang": hreflang_map(r.html, url),
        })
    return pages


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("start")
    ap.add_argument("--out", required=True)
    ap.add_argument("--checks-out", required=True)
    ap.add_argument("--targets", default="")
    ap.add_argument("--max-pages", type=int, default=300)
    ap.add_argument("--max-depth", type=int, default=8)
    args = ap.parse_args()

    pages = asyncio.run(crawl(args.start, args.max_pages, args.max_depth))
    targets = [t for t in args.targets.split(",") if t.strip()]
    complete = len(pages) < args.max_pages
    robots = fetch_text(urljoin(args.start, "/robots.txt"))
    check_urls = [norm(t) for t in targets] or [p["url"] for p in pages[:50]]
    checks = [depth_check(pages, targets, complete), hreflang_check(pages), robots_check(robots, check_urls)]
    graph = {"start": norm(args.start), "complete": complete, "pages": pages, "top_linked": most_linked(pages, 15)}
    Path(args.out).write_text(json.dumps(graph, indent=2, ensure_ascii=False), encoding="utf-8")
    Path(args.checks_out).write_text(json.dumps(checks, indent=2, ensure_ascii=False), encoding="utf-8")
    for c in checks:
        print(f"{c['verdict']:>7}  {c['id']}", file=sys.stderr)


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `uv run pytest plugins/seo/tests/test_site_graph.py -q`
Expected: 13 passed.

- [ ] **Step 5: Smoke-run against a public crawl-practice site**

Run: `uv run --script plugins/seo/engines/site_graph.py https://books.toscrape.com/ --max-pages 40 --out /tmp/claude-501/g.json --checks-out /tmp/claude-501/c.json 2>&1 | tail -3`
Expected: three lines with verdicts for `tech.click-depth`, `tech.hreflang`, `tech.ai-crawler-access`; `/tmp/claude-501/g.json` has `"complete": false` (40-page cap hit).

- [ ] **Step 6: Commit**

```bash
git add plugins/seo/engines/site_graph.py plugins/seo/tests/test_site_graph.py
git commit -m "feat(seo): site graph engine for click depth, hreflang and AI-crawler access

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Node toolchain and the structured-data engine

**Files:**
- Create: `plugins/seo/node/package.json`, `plugins/seo/node/package-lock.json` (generated)
- Create: `plugins/seo/node/schema_check.mjs`
- Test: `plugins/seo/node/schema_check.test.mjs`
- Create: `plugins/seo/data/schemaorg-all-https.jsonld`, `plugins/seo/data/schemaorg.sha256`, `plugins/seo/data/google-required-fields.json`
- Create: `plugins/seo/engines/ensure_node.sh`

**Interfaces:**
- Produces: `sh ensure_node.sh <ROOT>/node <DATA>/node` prints the installed directory path; after it, `<DATA>/node/node_modules/squirrelscan/bin/squirrel`, `<DATA>/node/node_modules/.bin/unlighthouse-ci` and `<DATA>/node/schema_check.mjs` exist. CLI `node schema_check.mjs --vocab FILE --required FILE --out FILE URL...` writes `[{"url", "status", "checks": [tech.schema-valid, tech.schema-matches]}]`. Exported functions: `visibleText`, `stringValues`, `notVisible`, `subclassIndex`, `isSubtypeOf`, `requiredIssues`, `checkPage`.

- [ ] **Step 1: Write `plugins/seo/node/package.json` and install**

```json
{
  "name": "seo-plugin-node-tools",
  "private": true,
  "type": "module",
  "description": "Pinned Node tools for the seo plugin, installed into the plugin data folder by engines/ensure_node.sh.",
  "dependencies": {
    "@adobe/structured-data-validator": "1.7.0",
    "@marbec/web-auto-extractor": "2.2.1",
    "squirrelscan": "0.0.98",
    "unlighthouse-ci": "0.19.1"
  },
  "engines": { "node": ">=22.18.0" }
}
```

Run: `cd plugins/seo/node && npm install --no-fund --no-audit && ls node_modules/squirrelscan/bin/ && cd -`
Expected: `package-lock.json` created; `squirrel` (native binary) and `squirrel.js` listed.

- [ ] **Step 2: Vendor the schema.org vocabulary with its hash**

```bash
mkdir -p plugins/seo/data
curl -sSf -o plugins/seo/data/schemaorg-all-https.jsonld https://schema.org/version/30.1/schemaorg-all-https.jsonld
shasum -a 256 plugins/seo/data/schemaorg-all-https.jsonld | cut -c1-64 > plugins/seo/data/schemaorg.sha256
cat plugins/seo/data/schemaorg.sha256
```

Expected: `07e7c663dbc12a0937581745e59a98ed12b8698f38e8e3b03650287d9df88ae5` (captured 2026-10-06). If it differs, schema.org changed the file: keep the new hash and note the change in the commit message.

- [ ] **Step 3: Write `plugins/seo/data/google-required-fields.json`**

The Adobe validator does not cover these four types. Before saving, open each `doc` URL (WebFetch) and confirm the required and recommended lists match Google's page. Correct the lists if Google's page differs, and set `_checked` to today's date.

```json
{
  "_source": "Google Search Central structured data docs",
  "_checked": "2026-10-06",
  "LocalBusiness": {
    "required": ["name", "address"],
    "recommended": ["telephone", "url", "geo", "openingHoursSpecification", "priceRange", "image"],
    "doc": "https://developers.google.com/search/docs/appearance/structured-data/local-business"
  },
  "Event": {
    "required": ["name", "startDate", "location"],
    "recommended": ["description", "endDate", "eventStatus", "eventAttendanceMode", "image", "offers", "organizer", "performer"],
    "doc": "https://developers.google.com/search/docs/appearance/structured-data/event"
  },
  "Article": {
    "required": [],
    "recommended": ["headline", "image", "datePublished", "dateModified", "author"],
    "doc": "https://developers.google.com/search/docs/appearance/structured-data/article"
  },
  "FAQPage": {
    "required": ["mainEntity"],
    "recommended": [],
    "doc": "https://developers.google.com/search/docs/appearance/structured-data/faqpage",
    "note": "FAQ rich results are shown only for well-known, authoritative government and health sites."
  }
}
```

- [ ] **Step 4: Write the failing tests**

`plugins/seo/node/schema_check.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Validator from '@adobe/structured-data-validator';
import {
  visibleText, stringValues, notVisible, subclassIndex, isSubtypeOf, requiredIssues, checkPage,
} from './schema_check.mjs';

const vocab = JSON.parse(readFileSync(new URL('../data/schemaorg-all-https.jsonld', import.meta.url)));
const table = JSON.parse(readFileSync(new URL('../data/google-required-fields.json', import.meta.url)));
const parents = subclassIndex(vocab);
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;

test('visibleText drops scripts and tags, decodes entities', () => {
  assert.equal(visibleText('<p>Fish &amp; Chips</p><script>var x="hidden words here now"</script>'), 'fish & chips');
});

test('stringValues keeps 4+ word strings, skips urls and skipped keys', () => {
  const vals = stringValues({ '@type': 'Product', name: 'Premium Gold Widget Deluxe', url: 'https://a.b/one two three four', brand: 'Acme' });
  assert.deepEqual(vals, ['Premium Gold Widget Deluxe']);
});

test('notVisible flags schema text missing from the page', () => {
  const text = visibleText('<h1>Basic Widget</h1>');
  assert.deepEqual(notVisible([{ name: 'Premium Gold Widget Deluxe' }], text), ['Premium Gold Widget Deluxe']);
  assert.deepEqual(notVisible([{ name: 'Basic Widget for small homes' }], visibleText('<p>Basic Widget for small homes</p>')), []);
});

test('RealEstateAgent is a LocalBusiness subtype', () => {
  assert.equal(isSubtypeOf('RealEstateAgent', 'LocalBusiness', parents), true);
  assert.equal(isSubtypeOf('Product', 'LocalBusiness', parents), false);
});

test('requiredIssues: LocalBusiness subtype missing address is an ERROR, reported once', () => {
  const item = { '@type': ['RealEstateAgent', 'LocalBusiness'], name: 'Acme Homes', '@location': '1,2' };
  const issues = requiredIssues({ RealEstateAgent: [item], LocalBusiness: [item] }, table, parents);
  const errors = issues.filter((i) => i.severity === 'ERROR');
  assert.equal(errors.length, 1);
  assert.deepEqual(errors[0].fieldNames, ['address']);
});

test('checkPage: Product without offers fails validity; mismatch fails matches; @graph is read', async () => {
  const validator = new Validator(vocab);
  const html = `<html><head>${ld({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'Product', name: 'Premium Gold Widget Deluxe' },
  ] })}</head><body><h1>Basic Widget</h1></body></html>`;
  const [valid, matches] = await checkPage('https://x.test/p', html, validator, table, parents);
  assert.equal(valid.id, 'tech.schema-valid');
  assert.equal(valid.verdict, 'fail');
  assert.equal(matches.id, 'tech.schema-matches');
  assert.equal(matches.verdict, 'fail');
});

test('checkPage: no structured data passes with a note', async () => {
  const [valid, matches] = await checkPage('https://x.test/', '<h1>Hi</h1>', new Validator(vocab), table, parents);
  assert.equal(valid.verdict, 'pass');
  assert.equal(valid.evidence.note, 'no structured data found');
  assert.equal(matches.verdict, 'pass');
});
```

- [ ] **Step 5: Run tests to verify they fail**

Run: `node --test plugins/seo/node/`
Expected: FAIL. `Cannot find module .../schema_check.mjs`.

- [ ] **Step 6: Write `plugins/seo/node/schema_check.mjs`**

```js
// Structured data check for the seo plugin.
// Google rich-result requirements + schema.org vocabulary (@adobe/structured-data-validator),
// our required-field table for types Adobe skips (LocalBusiness, Event, Article, FAQPage),
// and a match of schema text against the page's visible text.
//
// Usage: node schema_check.mjs --vocab FILE --required FILE --out FILE URL [URL ...]
// Reads the raw HTML (structured data injected by JavaScript is not seen).
import Validator from '@adobe/structured-data-validator';
import WebAutoExtractor from '@marbec/web-auto-extractor';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const SKIP_KEYS = new Set(['@context', '@type', '@id', '@location', 'url', 'image', 'logo', 'sameAs',
  'contentUrl', 'embedUrl', 'thumbnailUrl']);
const URLISH = /^(https?:|\/|www\.)/i;
const UA = 'Mozilla/5.0 (compatible; seo-plugin-schema/1.0)';

export function visibleText(html) {
  return String(html)
    .replace(/<(script|style|noscript|template)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .toLowerCase().replace(/\s+/g, ' ').trim();
}

export function stringValues(node, out = []) {
  if (typeof node === 'string') {
    const s = node.trim();
    if (s.split(/\s+/).length >= 4 && !URLISH.test(s)) out.push(s);
  } else if (Array.isArray(node)) {
    node.forEach((n) => stringValues(n, out));
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) if (!SKIP_KEYS.has(k)) stringValues(v, out);
  }
  return out;
}

export function notVisible(items, text) {
  const values = new Set(items.flatMap((item) => stringValues(item)));
  return [...values].filter((s) => !text.includes(visibleText(s)));
}

export function subclassIndex(vocab) {
  const parents = new Map();
  for (const node of vocab['@graph'] ?? []) {
    const sc = node['rdfs:subClassOf'];
    if (!sc) continue;
    const id = String(node['@id']).replace(/^schema:/, '');
    parents.set(id, (Array.isArray(sc) ? sc : [sc]).map((s) => String(s['@id'] ?? s).replace(/^schema:/, '')));
  }
  return parents;
}

export function isSubtypeOf(type, ancestor, parents, seen = new Set()) {
  if (type === ancestor) return true;
  if (seen.has(type)) return false;
  seen.add(type);
  return (parents.get(type) ?? []).some((p) => isSubtypeOf(p, ancestor, parents, seen));
}

export function requiredIssues(jsonld, table, parents) {
  const issues = [];
  const seen = new Set();
  for (const [type, items] of Object.entries(jsonld)) {
    for (const [rule, spec] of Object.entries(table)) {
      if (rule.startsWith('_') || !isSubtypeOf(type, rule, parents)) continue;
      for (const item of items) {
        for (const [severity, fields] of [['ERROR', spec.required], ['WARNING', spec.recommended]]) {
          for (const f of fields) {
            const key = `${item['@location']}|${rule}|${f}`;
            if (item[f] !== undefined || seen.has(key)) continue;
            seen.add(key);
            issues.push({ rootType: type, rule, severity, fieldNames: [f], doc: spec.doc,
              issueMessage: `${severity === 'ERROR' ? 'Required' : 'Recommended'} attribute "${f}" is missing` });
          }
        }
      }
    }
  }
  return issues;
}

export async function checkPage(url, html, validator, table, parents) {
  const data = new WebAutoExtractor({ addLocation: true, embedSource: ['rdfa', 'microdata'] }).parse(html);
  const jsonld = data.jsonld ?? {};
  const all = [...(await validator.validate(data)), ...requiredIssues(jsonld, table, parents)];
  const errors = all.filter((i) => i.severity === 'ERROR');
  const warnings = all.filter((i) => i.severity !== 'ERROR');
  const items = Object.values(jsonld).flat();
  const present = items.length > 0 || Object.keys(data.microdata ?? {}).length > 0 || Object.keys(data.rdfa ?? {}).length > 0;
  const hidden = notVisible(items, visibleText(html));
  const brief = (i) => ({ type: i.rootType, message: i.issueMessage, fields: i.fieldNames });
  return [
    {
      id: 'tech.schema-valid',
      question: 'Is the structured data valid for Google rich results and schema.org?',
      verdict: errors.length ? 'fail' : 'pass',
      pages: errors.length ? [url] : [],
      evidence: present ? { errors: errors.map(brief), warnings: warnings.map(brief) } : { note: 'no structured data found' },
      source: 'engines/schema_check.mjs',
    },
    {
      id: 'tech.schema-matches',
      question: 'Does structured data match visible text?',
      verdict: hidden.length ? 'fail' : 'pass',
      pages: hidden.length ? [url] : [],
      evidence: { not_visible: hidden.slice(0, 10) },
      rule: 'Structured data must match visible text',
      source: 'engines/schema_check.mjs',
    },
  ];
}

async function main(argv) {
  const args = { urls: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--vocab') args.vocab = argv[++i];
    else if (argv[i] === '--required') args.required = argv[++i];
    else if (argv[i] === '--out') args.out = argv[++i];
    else args.urls.push(argv[i]);
  }
  const vocab = JSON.parse(readFileSync(args.vocab, 'utf8'));
  const validator = new Validator(vocab);
  const parents = subclassIndex(vocab);
  const table = JSON.parse(readFileSync(args.required, 'utf8'));
  const results = [];
  for (const url of args.urls) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow' });
      const html = await res.text();
      results.push({ url, status: res.status, checks: await checkPage(url, html, validator, table, parents) });
    } catch (e) {
      const unknown = (id) => ({ id, verdict: 'unknown', pages: [url], evidence: { error: String(e) }, source: 'engines/schema_check.mjs' });
      results.push({ url, status: null, checks: [unknown('tech.schema-valid'), unknown('tech.schema-matches')] });
    }
  }
  writeFileSync(args.out, JSON.stringify(results, null, 2));
  for (const r of results) console.error(`${r.checks.map((c) => c.verdict).join('/')}  ${r.url}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main(process.argv.slice(2));
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `node --test plugins/seo/node/`
Expected: 7 tests pass.

- [ ] **Step 8: Write `plugins/seo/engines/ensure_node.sh`**

```sh
#!/bin/sh
# Install the plugin's pinned Node tools into the plugin data folder.
# Reinstalls only when package-lock.json changes. Prints the install directory.
# Usage: sh ensure_node.sh <plugin root>/node <plugin data>/node
set -eu
SRC="$1"
DST="$2"
mkdir -p "$DST"
cp "$SRC/package.json" "$SRC/package-lock.json" "$SRC/schema_check.mjs" "$DST/"
LOCK=$(shasum -a 256 "$DST/package-lock.json" | cut -c1-64)
if [ ! -d "$DST/node_modules" ] || [ ! -f "$DST/.lock-sha" ] || [ "$(cat "$DST/.lock-sha")" != "$LOCK" ]; then
  (cd "$DST" && npm ci --no-fund --no-audit >&2)
  echo "$LOCK" > "$DST/.lock-sha"
fi
# squirrelscan downloads its native binary in postinstall; run it if npm skipped install scripts.
if [ ! -x "$DST/node_modules/squirrelscan/bin/squirrel" ]; then
  (cd "$DST/node_modules/squirrelscan" && SQUIRREL_VERSION=v0.0.98 node scripts/postinstall.js >&2)
fi
echo "$DST"
```

- [ ] **Step 9: Verify ensure_node.sh installs once and is idempotent**

```bash
rm -rf /tmp/claude-501/seo-plugin-data
sh plugins/seo/engines/ensure_node.sh plugins/seo/node /tmp/claude-501/seo-plugin-data/node
NO_TELEMETRY=1 /tmp/claude-501/seo-plugin-data/node/node_modules/squirrelscan/bin/squirrel --version
/tmp/claude-501/seo-plugin-data/node/node_modules/.bin/unlighthouse-ci --version
time sh plugins/seo/engines/ensure_node.sh plugins/seo/node /tmp/claude-501/seo-plugin-data/node
```

Expected: `0.0.98`; `0.19.1`; the second run finishes in under 2 seconds and does not print npm output.

- [ ] **Step 10: Live smoke on a real page**

Run: `node /tmp/claude-501/seo-plugin-data/node/schema_check.mjs --vocab plugins/seo/data/schemaorg-all-https.jsonld --required plugins/seo/data/google-required-fields.json --out /tmp/claude-501/schema.json https://books.toscrape.com/ && head -c 400 /tmp/claude-501/schema.json`
Expected: stderr `pass/pass  https://books.toscrape.com/` (or `fail/...` with listed errors); JSON file with `checks` for that URL.

- [ ] **Step 11: Commit**

```bash
git add plugins/seo/node/package.json plugins/seo/node/package-lock.json plugins/seo/node/schema_check.mjs \
  plugins/seo/node/schema_check.test.mjs plugins/seo/data plugins/seo/engines/ensure_node.sh
git commit -m "feat(seo): pinned Node toolchain and structured-data engine

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Speed engines (Unlighthouse lab summary, CrUX field data)

**Files:**
- Create: `plugins/seo/engines/lab_speed.py`, `plugins/seo/engines/crux.py`
- Create: `plugins/seo/tests/data/unlighthouse-ci-result.json` (copy of a real run)
- Test: `plugins/seo/tests/test_lab_speed.py`, `plugins/seo/tests/test_crux.py`
- Delete: `engines/lighthouse_runner.py`

**Interfaces:**
- Consumes: Unlighthouse `ci-result.json` (jsonExpanded): `{"routes": [{"path", "categories": {"performance": {"score"}}, "metrics": {"largest-contentful-paint": {"numericValue"}, "cumulative-layout-shift": {...}, "total-blocking-time": {...}}}]}`.
- Produces: `lab_speed.assess(ci, site) -> check (id tech.speed-lab)`; `crux.assess(record) -> {"verdict","p75","over_good","missing"}`, `crux.check(rows) -> check (id tech.speed-field)`, `crux.no_key_check() -> check`; CLIs `lab_speed.py CI_JSON --site BASE --out FILE`, `crux.py --origin URL [--url URL ...] --out FILE`.

- [ ] **Step 1: Capture a real Unlighthouse result as test data**

```bash
mkdir -p plugins/seo/tests/data
cp /private/tmp/claude-501/-Users-abdelhamidsahbi-seo-tool/25b71f75-ac98-47b7-bd40-94bf0ad58a7b/scratchpad/ulh-sample.json plugins/seo/tests/data/unlighthouse-ci-result.json
```

If that file no longer exists, regenerate it: `cd "$(mktemp -d)" && /tmp/claude-501/seo-plugin-data/node/node_modules/.bin/unlighthouse-ci --site https://example.com --mobile --reporter jsonExpanded --output-path out --no-cache && cp out/ci-result.json /Users/abdelhamidsahbi/seo-tool/plugins/seo/tests/data/unlighthouse-ci-result.json`.

- [ ] **Step 2: Write the failing tests**

`plugins/seo/tests/test_lab_speed.py`:

```python
import json
from pathlib import Path

from lab_speed import assess

DATA = Path(__file__).parent / "data" / "unlighthouse-ci-result.json"


def test_real_example_com_run_passes():
    r = assess(json.loads(DATA.read_text()), "https://example.com")
    assert r["id"] == "tech.speed-lab"
    assert r["verdict"] == "pass"
    assert r["evidence"]["routes"][0]["url"] == "https://example.com/"


def route(path, lcp, cls, tbt):
    return {"path": path, "categories": {"performance": {"score": 0.5}},
            "metrics": {"largest-contentful-paint": {"numericValue": lcp},
                        "cumulative-layout-shift": {"numericValue": cls},
                        "total-blocking-time": {"numericValue": tbt}}}


def test_slow_route_fails_and_is_listed():
    r = assess({"routes": [route("/", 1000, 0, 0), route("/slow", 4000, 0.3, 500)]}, "https://s.test/")
    assert r["verdict"] == "fail"
    assert r["pages"] == ["https://s.test/slow"]


def test_no_routes_is_unknown():
    assert assess({"routes": []}, "https://s.test")["verdict"] == "unknown"
```

`plugins/seo/tests/test_crux.py`:

```python
from crux import assess, check, no_key_check


def rec(lcp, inp, cls):
    m = {}
    if lcp is not None:
        m["largest_contentful_paint"] = {"percentiles": {"p75": lcp}}
    if inp is not None:
        m["interaction_to_next_paint"] = {"percentiles": {"p75": inp}}
    if cls is not None:
        m["cumulative_layout_shift"] = {"percentiles": {"p75": cls}}
    return {"record": {"metrics": m}}


def test_good_vitals_pass_with_string_cls():
    assert assess(rec(1800, 150, "0.05"))["verdict"] == "pass"


def test_poor_lcp_fails():
    r = assess(rec(4200, 150, "0.05"))
    assert r["verdict"] == "fail" and r["over_good"] == ["largest_contentful_paint"]


def test_missing_inp_is_unknown():
    assert assess(rec(1800, None, "0.05"))["verdict"] == "unknown"


def test_check_aggregates_rows():
    rows = [{"target": "o", "level": "origin", "verdict": "pass"},
            {"target": "u", "level": "origin-fallback", "verdict": "pass"}]
    assert check(rows)["verdict"] == "pass"
    rows.append({"target": "v", "level": "url", "verdict": "fail"})
    c = check(rows)
    assert c["verdict"] == "fail" and c["pages"] == ["v"] and c["id"] == "tech.speed-field"


def test_low_traffic_site_is_unknown_not_fail():
    rows = [{"target": "o", "level": "origin", "verdict": "unknown", "note": "no origin-level CrUX data"}]
    assert check(rows)["verdict"] == "unknown"


def test_missing_key_is_unknown_with_unlock_step():
    c = no_key_check()
    assert c["verdict"] == "unknown" and "GOOGLE_API_KEY" in c["evidence"]["unlock"]
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `uv run pytest plugins/seo/tests/test_lab_speed.py plugins/seo/tests/test_crux.py -q`
Expected: FAIL with `ModuleNotFoundError` for `lab_speed` and `crux`.

- [ ] **Step 4: Write `plugins/seo/engines/lab_speed.py`**

```python
# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///
"""Lab speed from an Unlighthouse CI jsonExpanded report: one check over all scanned routes.

Question: do pages load fast and stay stable on mobile (lab)?
Lab data only; CrUX field data (crux.py) wins when the two disagree. TBT stands in for INP.

Usage: uv run --script lab_speed.py CI_RESULT_JSON --site BASE_URL --out FILE
"""

import argparse
import json
import sys
from pathlib import Path

# Google's "good" thresholds (TBT 200 ms is Lighthouse's own good band).
LIMITS = {"largest-contentful-paint": 2500, "cumulative-layout-shift": 0.1, "total-blocking-time": 200}


def assess(ci, site):
    routes = []
    for r in ci.get("routes", []):
        metrics = r.get("metrics", {})
        values = {k: (metrics.get(k) or {}).get("numericValue") for k in LIMITS}
        perf = ((r.get("categories", {}).get("performance") or {}).get("score"))
        routes.append({
            "url": site.rstrip("/") + r["path"],
            "performance": round(perf * 100) if perf is not None else None,
            **values,
            "over_limit": [k for k, lim in LIMITS.items() if values[k] is not None and values[k] > lim],
            "missing": [k for k in LIMITS if values[k] is None],
        })
    failing = [r for r in routes if r["over_limit"]]
    if not routes or all(len(r["missing"]) == len(LIMITS) for r in routes):
        verdict = "unknown"
    else:
        verdict = "fail" if failing else "pass"
    return {
        "id": "tech.speed-lab",
        "question": "Do pages load fast and stay stable on mobile (lab)?",
        "verdict": verdict,
        "pages": [r["url"] for r in failing],
        "evidence": {"routes": routes, "limits": LIMITS,
                     "note": "Lab data (Unlighthouse/Lighthouse, mobile). Field data wins on disagreement."},
        "source": "engines/lab_speed.py (Unlighthouse)",
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("ci_result")
    ap.add_argument("--site", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()
    check = assess(json.loads(Path(args.ci_result).read_text()), args.site)
    Path(args.out).write_text(json.dumps(check, indent=2), encoding="utf-8")
    print(f"{check['verdict']:>7}  tech.speed-lab ({len(check['evidence']['routes'])} routes)", file=sys.stderr)


if __name__ == "__main__":
    main()
```

- [ ] **Step 5: Write `plugins/seo/engines/crux.py`**

```python
# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///
"""CrUX field data: p75 Core Web Vitals for phones over the last 28 days.

Question: do real mobile users get good Core Web Vitals?
Needs GOOGLE_API_KEY with the Chrome UX Report API enabled (free, 150 queries/min).
URL-level data needs enough traffic: on 404 a URL falls back to the origin result;
no origin data either -> unknown.

Usage: uv run --script crux.py --origin https://example.com [--url URL ...] --out FILE
"""

import argparse
import json
import os
import sys
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

API = "https://chromeuxreport.googleapis.com/v1/records:queryRecord"
GOOD = {"largest_contentful_paint": 2500, "interaction_to_next_paint": 200, "cumulative_layout_shift": 0.1}
QUESTION = "Do real mobile users get good Core Web Vitals (CrUX p75, 28 days)?"
SOURCE = "engines/crux.py (Chrome UX Report API)"


def assess(record):
    metrics = (record or {}).get("record", {}).get("metrics", {})
    p75 = {}
    for k in GOOD:
        v = (metrics.get(k) or {}).get("percentiles", {}).get("p75")
        p75[k] = float(v) if v is not None else None
    over = [k for k, lim in GOOD.items() if p75[k] is not None and p75[k] > lim]
    missing = [k for k in GOOD if p75[k] is None]
    verdict = "fail" if over else ("unknown" if missing else "pass")
    return {"verdict": verdict, "p75": p75, "over_good": over, "missing": missing}


def check(rows):
    failing = [r["target"] for r in rows if r["verdict"] == "fail"]
    verdicts = {r["verdict"] for r in rows}
    verdict = "fail" if failing else ("pass" if verdicts == {"pass"} else "unknown")
    return {"id": "tech.speed-field", "question": QUESTION, "verdict": verdict, "pages": failing,
            "evidence": {"rows": rows, "good_thresholds_p75": GOOD}, "source": SOURCE}


def no_key_check():
    return {"id": "tech.speed-field", "question": QUESTION, "verdict": "unknown", "pages": [],
            "evidence": {"unlock": "Export GOOGLE_API_KEY (Google Cloud API key with the Chrome UX Report API enabled)."},
            "source": SOURCE}


def query(key, body):
    req = Request(f"{API}?key={key}", data=json.dumps(body).encode(),
                  headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urlopen(req, timeout=30) as r:
            return json.load(r)
    except HTTPError as e:
        if e.code == 404:
            return None
        raise


def run(key, origin, urls):
    rows = []
    origin_rec = query(key, {"origin": origin.rstrip("/"), "formFactor": "PHONE"})
    origin_res = assess(origin_rec) if origin_rec else {"verdict": "unknown", "note": "no origin-level CrUX data (not enough traffic)"}
    rows.append({"target": origin, "level": "origin", **origin_res})
    for u in urls:
        rec = query(key, {"url": u, "formFactor": "PHONE"})
        if rec:
            rows.append({"target": u, "level": "url", **assess(rec)})
        else:
            rows.append({"target": u, "level": "origin-fallback", "verdict": origin_res["verdict"],
                         "note": "no URL-level data; the origin result applies"})
    return rows


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--origin", required=True)
    ap.add_argument("--url", action="append", default=[])
    ap.add_argument("--out", required=True)
    args = ap.parse_args()
    key = os.environ.get("GOOGLE_API_KEY")
    if not key:
        result = no_key_check()
    else:
        try:
            result = check(run(key, args.origin, args.url))
        except Exception as e:  # invalid key, API disabled, network: report, don't crash the audit
            result = {**no_key_check(), "evidence": {"error": str(e)[:300]}}
    Path(args.out).write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(f"{result['verdict']:>7}  tech.speed-field", file=sys.stderr)


if __name__ == "__main__":
    main()
```

- [ ] **Step 6: Run tests to verify they pass, then delete the old Lighthouse wrapper**

Run: `uv run pytest plugins/seo/tests -q`
Expected: all tests pass (6 + 13 + 3 + 6 = 28).

```bash
git rm -q engines/lighthouse_runner.py
```

- [ ] **Step 7: Commit**

```bash
git add plugins/seo/engines/lab_speed.py plugins/seo/engines/crux.py plugins/seo/tests
git commit -m "feat(seo): lab speed from Unlighthouse, field speed from CrUX; drop lighthouse_runner

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Guard hook (DataForSEO spend, read-only connectors, squirrel cloud flags)

**Files:**
- Create: `plugins/seo/hooks/hooks.json`, `plugins/seo/hooks/guard.py`, `plugins/seo/hooks/bash_guard.sh`
- Test: `plugins/seo/tests/test_guard.py`

**Interfaces:**
- Consumes: Claude Code PreToolUse event JSON on stdin: `{"tool_name": str, "tool_input": {...}}`. DataForSEO tool `mcp__dataforseo__api_request` input: `{"method", "path"?, "url"?, "data"?, "noAiMode"?}`.
- Produces: `guard.decide(event) -> None | (decision, reason)` with decision `"deny"` or `"ask"`; on stdout `{"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": ..., "permissionDecisionReason": ...}}`, nothing when allowed.

- [ ] **Step 1: Write the failing tests**

`plugins/seo/tests/test_guard.py`:

```python
import json
import subprocess
from pathlib import Path

from guard import decide

HOOKS = Path(__file__).resolve().parents[1] / "hooks"


def ev(tool, **inp):
    return {"tool_name": tool, "tool_input": inp}


def test_gsc_write_tools_denied():
    for t in ["add_site", "delete_site", "submit_sitemap", "delete_sitemap", "manage_sitemaps"]:
        assert decide(ev(f"mcp__search-console__{t}"))[0] == "deny"


def test_gsc_read_tool_allowed():
    assert decide(ev("mcp__search-console__get_search_analytics")) is None


def test_squirrel_comment_denied():
    assert decide(ev("mcp__squirrelscan__comment_on_issue"))[0] == "deny"


def test_dataforseo_backlinks_denied_by_path_or_url():
    assert decide(ev("mcp__dataforseo__api_request", method="POST", path="/v3/backlinks/summary/live"))[0] == "deny"
    assert decide(ev("mcp__dataforseo__api_request", method="POST",
                     url="https://api.dataforseo.com/v3/backlinks/domain_intersection/live"))[0] == "deny"


def test_dataforseo_live_asks():
    d = decide(ev("mcp__dataforseo__api_request", method="POST",
                  path="/v3/dataforseo_labs/google/ranked_keywords/live"))
    assert d[0] == "ask" and "cost" in d[1]
    assert decide(ev("mcp__dataforseo__api_request", method="POST",
                     path="/v3/serp/google/organic/live/advanced"))[0] == "ask"


def test_dataforseo_standard_and_free_allowed():
    assert decide(ev("mcp__dataforseo__api_request", method="POST", path="/v3/serp/google/organic/task_post")) is None
    assert decide(ev("mcp__dataforseo__api_request", method="GET", path="/v3/appendix/user_data")) is None


def test_squirrel_cloud_flags_denied():
    sq = "NO_TELEMETRY=1 /d/node/node_modules/squirrelscan/bin/squirrel"
    for cmd in [f"{sq} auth login", f"{sq} keys list", f"{sq} audit https://a.test --render",
                f"{sq} audit https://a.test --render-mode auto", f"{sq} audit https://a.test -y",
                f"{sq} report a.test --publish", f"{sq} report a.test -p"]:
        assert decide(ev("Bash", command=cmd))[0] == "deny", cmd


def test_squirrel_local_audit_and_other_segments_allowed():
    sq = "/d/node/node_modules/squirrelscan/bin/squirrel"
    ok = [f"{sq} audit https://a.test -C full --render-mode off -f json -o out.json",
          f"mkdir -p out && {sq} audit https://a.test --render-mode=off -f json -o out/s.json",
          f"{sq} --version", "npx -y unlighthouse-ci --site https://a.test", "mkdir -p x"]
    for cmd in ok:
        assert decide(ev("Bash", command=cmd)) is None, cmd


def test_hook_runs_on_system_python_and_prints_json():
    out = subprocess.run(["/usr/bin/python3", str(HOOKS / "guard.py")],
                         input=json.dumps(ev("mcp__search-console__delete_site")),
                         capture_output=True, text=True, check=True).stdout
    assert json.loads(out)["hookSpecificOutput"]["permissionDecision"] == "deny"


def test_bash_prefilter_skips_unrelated_commands():
    out = subprocess.run(["sh", str(HOOKS / "bash_guard.sh")],
                         input=json.dumps(ev("Bash", command="ls -la")), capture_output=True, text=True, check=True)
    assert out.stdout == ""
    out = subprocess.run(["sh", str(HOOKS / "bash_guard.sh")],
                         input=json.dumps(ev("Bash", command="squirrel auth login")), capture_output=True, text=True, check=True)
    assert json.loads(out.stdout)["hookSpecificOutput"]["permissionDecision"] == "deny"
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `uv run pytest plugins/seo/tests/test_guard.py -q`
Expected: FAIL with `ModuleNotFoundError: No module named 'guard'`.

- [ ] **Step 3: Write `plugins/seo/hooks/guard.py`**

```python
#!/usr/bin/env python3
"""PreToolUse guard for the seo plugin.

Reads the hook event on stdin and prints a deny/ask decision, or nothing to allow.
- Search Console write tools, squirrelscan comment tool: deny (the plugin uses them read-only).
- DataForSEO: Backlinks endpoints deny; any Live endpoint asks (DataForSEO Labs is Live-only).
- squirrel CLI: deny cloud spend and publishing (auth, keys, --render except --render-mode off, -y, --publish/-p).
Standard library only, Python 3.9 compatible: hooks run on the system python3.
"""
import json
import re
import sys

READ_ONLY = {
    "mcp__search-console__add_site",
    "mcp__search-console__delete_site",
    "mcp__search-console__submit_sitemap",
    "mcp__search-console__delete_sitemap",
    "mcp__search-console__manage_sitemaps",
    "mcp__squirrelscan__comment_on_issue",
}
SQUIRREL_BLOCKS = [
    (re.compile(r"squirrel\S*\s+(auth|keys)\b"), "squirrel auth/keys are cloud account actions"),
    (re.compile(r"--render(?!-mode[ =]off)"), "cloud rendering spends squirrel credits; Crawl4AI renders locally"),
    (re.compile(r"--publish\b|\s-p(\s|$)"), "publishing reports makes them public"),
    (re.compile(r"\saudit\b.*\s(-y|--yes)(\s|$)"), "-y auto-approves cloud spend"),
]
SEGMENT = re.compile(r"[;&|\n]+")


def decide(event):
    tool = event.get("tool_name") or ""
    args = event.get("tool_input") or {}
    if tool in READ_ONLY:
        return "deny", "seo plugin policy: %s is a write action; the plugin uses this service read-only." % tool
    if tool == "mcp__dataforseo__api_request":
        target = ("%s %s" % (args.get("path") or "", args.get("url") or "")).lower()
        if "/backlinks/" in target:
            return "deny", ("seo plugin policy: the DataForSEO Backlinks API is off by default (priced separately). "
                            "The user must enable it explicitly for this request.")
        if re.search(r"/live(/|\b)", target):
            return "ask", ("DataForSEO Live endpoint (Labs is Live-only; Live costs more than Standard). "
                           "Confirm the quoted cost before it runs.")
        return None
    if tool == "Bash":
        for segment in SEGMENT.split(args.get("command") or ""):
            if "squirrel" not in segment:
                continue
            for pattern, why in SQUIRREL_BLOCKS:
                if pattern.search(segment):
                    return "deny", "seo plugin policy: %s." % why
    return None


def main():
    try:
        event = json.load(sys.stdin)
    except ValueError:
        return 0
    decision = decide(event)
    if decision:
        json.dump({"hookSpecificOutput": {"hookEventName": "PreToolUse",
                                          "permissionDecision": decision[0],
                                          "permissionDecisionReason": decision[1]}}, sys.stdout)
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 4: Write `plugins/seo/hooks/bash_guard.sh` and `plugins/seo/hooks/hooks.json`**

`plugins/seo/hooks/bash_guard.sh`:

```sh
#!/bin/sh
# Pass Bash events to guard.py only when they mention squirrel, so every other Bash call stays fast.
i=$(cat)
case "$i" in
  *squirrel*) printf '%s' "$i" | python3 "$(dirname "$0")/guard.py" ;;
esac
```

`plugins/seo/hooks/hooks.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__dataforseo__api_request|mcp__search-console__(add_site|delete_site|submit_sitemap|delete_sitemap|manage_sitemaps)|mcp__squirrelscan__comment_on_issue",
        "hooks": [{ "type": "command", "command": "python3 \"${CLAUDE_PLUGIN_ROOT}/hooks/guard.py\"" }]
      },
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "sh \"${CLAUDE_PLUGIN_ROOT}/hooks/bash_guard.sh\"" }]
      }
    ]
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `uv run pytest plugins/seo/tests/test_guard.py -q`
Expected: 10 passed.

- [ ] **Step 6: Live-check the hook inside Claude Code**

A fresh `claude -p` process loads the plugin from disk, hooks included. Hooks apply even with bypassed permissions.

Run: `cd "$(mktemp -d)" && claude -p "Use the Bash tool to run exactly this command and report what happened: /tmp/claude-501/seo-plugin-data/node/node_modules/squirrelscan/bin/squirrel auth status" --permission-mode bypassPermissions; cd -`
Expected: the reply says the command was blocked with "seo plugin policy: squirrel auth/keys are cloud account actions." If it was not blocked, run `claude plugin details seo@seo-tool` and confirm the hooks are listed; fix `hooks.json` until they are.

- [ ] **Step 7: Commit**

```bash
git add plugins/seo/hooks plugins/seo/tests/test_guard.py
git commit -m "feat(seo): guard hook for DataForSEO spend, read-only connectors, squirrel cloud flags

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Project setup engine (state folder, stack detection) and profile template v2

**Files:**
- Create: `plugins/seo/engines/project_setup.py`
- Create: `plugins/seo/templates/profile.yaml`, `plugins/seo/templates/change-log.md`
- Test: `plugins/seo/tests/test_project_setup.py`

**Interfaces:**
- Produces: `project_setup.init(project, templates) -> {"seo_dir", "created": [paths]}`; `project_setup.detect(project, html=None) -> {"stack_type": "code"|"cms"|"none", "framework", "rendering", "cms", "domain_candidates": [url], "evidence": [str]}`; CLIs `project_setup.py init --project DIR --templates DIR` and `project_setup.py detect --project DIR [--html FILE]` (JSON on stdout).

- [ ] **Step 1: Write the templates**

`plugins/seo/templates/profile.yaml`:

```yaml
# seo plugin project profile. /seo:setup fills what it can detect and asks for the rest.
# Leave a field empty rather than guessing; checks that need it report "unknown".

name: ""                      # short project name
domain: ""                    # production domain, e.g. estateium.ae
key_urls: []                  # homepage, service pages, top converters (full production URLs)

market:
  regions: []                 # e.g. [Dubai, GCC]
  languages: []               # e.g. [en, ar]

audience: ""                  # who searches and what problem they are solving

conversions: []               # e.g. [{name: Enquiry form, url: /contact}, {name: WhatsApp}]
success_metric: ""            # the one number this project is judged on

competitors: []               # 3 to 5 domains

brand:
  names: []                   # brand name and aliases, used to detect AI mentions

buyer_prompts: []             # questions buyers ask AI assistants, in their words

data_access:
  search_console: ""          # property, e.g. sc-domain:example.com
  ga4_property: ""            # numeric property ID
  bing_webmaster: ""          # verified site URL

stack:
  type: ""                    # code | cms | none (decides how /seo:fix applies fixes)
  framework: ""               # e.g. nextjs, astro, hugo, static-html
  rendering: ""               # ssr | ssg | csr | hybrid | static | server
  cms: ""                     # e.g. wordpress, shopify, wix (when type is cms)
  repo: ""                    # where fixes are made, if not this folder

content:                      # used by /seo:content and /seo:brief (Plan 2)
  experts: []                 # [{name, role, credentials_url}]
  first_party_data: []        # data only this business has
  capacity_per_month: 0       # pieces human writers can publish per month

offpage:                      # used by /seo:offpage (Plan 4)
  spokespeople: []            # [{name, topics: [], bio_url}]
  linkable_assets: []
  platforms: []               # expert-source platforms subscribed to
  locations: []               # [{name, address, phone, hours, gbp_id}]
  communities: []
  partners: []

approval:
  approver: ""                # who signs off before anything ships
```

`plugins/seo/templates/change-log.md`:

```markdown
# Change log

Every change is logged with its predicted outcome before it ships. The next production audit or review fills in `Actual`.
DataForSEO calls and their cost are logged under Run costs.

| Date | Check | Change | Pages | Predicted outcome | Metric and source | Check after | Approved by | Where | Actual |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Run costs

| Date | Command | DataForSEO calls | Cost (USD) |
| --- | --- | --- | --- |
```

- [ ] **Step 2: Write the failing tests**

`plugins/seo/tests/test_project_setup.py`:

```python
import json
from pathlib import Path

from project_setup import detect, init

TEMPLATES = Path(__file__).resolve().parents[1] / "templates"


def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text)


def test_init_creates_state_and_never_overwrites(tmp_path):
    first = init(tmp_path, TEMPLATES)
    seo = tmp_path / ".seo"
    assert (seo / "profile.yaml").exists() and (seo / "reports").is_dir()
    assert "reports/*/raw/" in (seo / ".gitignore").read_text()
    (seo / "profile.yaml").write_text("name: kept\n")
    second = init(tmp_path, TEMPLATES)
    assert (seo / "profile.yaml").read_text() == "name: kept\n"
    assert second["created"] == [] and len(first["created"]) == 3


def test_detect_nextjs(tmp_path):
    write(tmp_path / "package.json", json.dumps({"dependencies": {"next": "16.0.0", "react": "19"}}))
    d = detect(tmp_path)
    assert (d["stack_type"], d["framework"]) == ("code", "nextjs")


def test_detect_vite_react_is_csr(tmp_path):
    write(tmp_path / "package.json", json.dumps({"dependencies": {"react": "19"}, "devDependencies": {"vite": "7"}}))
    d = detect(tmp_path)
    assert d["framework"] == "react" and d["rendering"] == "csr"


def test_detect_hugo(tmp_path):
    write(tmp_path / "hugo.toml", "title = 'x'")
    assert detect(tmp_path)["framework"] == "hugo"


def test_detect_wordpress_repo_is_cms(tmp_path):
    write(tmp_path / "wp-config.php", "<?php")
    d = detect(tmp_path)
    assert (d["stack_type"], d["cms"]) == ("cms", "wordpress")


def test_detect_no_code_uses_live_html(tmp_path):
    html = tmp_path / "home.html"
    html.write_text('<link href="https://x.test/wp-content/themes/a.css">')
    project = tmp_path / "client"
    project.mkdir()
    d = detect(project, html)
    assert (d["stack_type"], d["cms"]) == ("cms", "wordpress")


def test_detect_empty_folder_is_none(tmp_path):
    assert detect(tmp_path)["stack_type"] == "none"


def test_detect_static_html(tmp_path):
    write(tmp_path / "index.html", "<h1>x</h1>")
    d = detect(tmp_path)
    assert (d["stack_type"], d["framework"]) == ("code", "static-html")


def test_env_files_yield_only_site_urls(tmp_path):
    write(tmp_path / "package.json", json.dumps({"dependencies": {"next": "16"}}))
    write(tmp_path / ".env.local", "DATABASE_URL=postgres://user:secretpw@db/x\nNEXT_PUBLIC_SITE_URL=https://shop.test\nAPI_KEY=sk-123\n")
    d = detect(tmp_path)
    assert d["domain_candidates"] == ["https://shop.test"]
    assert "secretpw" not in json.dumps(d) and "sk-123" not in json.dumps(d)


def test_cname_and_astro_site(tmp_path):
    write(tmp_path / "package.json", json.dumps({"dependencies": {"astro": "6"}}))
    write(tmp_path / "astro.config.mjs", "export default { site: 'https://blog.test' }")
    write(tmp_path / "CNAME", "blog.test\n")
    d = detect(tmp_path)
    assert d["framework"] == "astro"
    assert d["domain_candidates"] == ["https://blog.test"]
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `uv run pytest plugins/seo/tests/test_project_setup.py -q`
Expected: FAIL with `ModuleNotFoundError: No module named 'project_setup'`.

- [ ] **Step 4: Write `plugins/seo/engines/project_setup.py`**

```python
# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///
"""Project setup helpers for the seo plugin.

  init    create <project>/.seo/ from the templates (never overwrites existing files)
  detect  guess stack type, framework, rendering mode, CMS and site URL candidates

Detection reads package.json, framework config files, CNAME and .env* files. From .env*
files only site-URL keys are read; no other value leaves this script.

Usage:
  uv run --script project_setup.py init --project DIR --templates DIR
  uv run --script project_setup.py detect --project DIR [--html FILE]
"""

import argparse
import json
import re
import shutil
from pathlib import Path

SUBDIRS = ["reports", "content", "offpage", "visibility", "briefs", "handoff", "inputs"]
GITIGNORE = "# Written by the seo plugin\nreports/*/raw/\ninputs/\n"
# (dependency, framework, rendering) in priority order: frameworks before plain libraries.
FRAMEWORKS = [
    ("next", "nextjs", "ssr/ssg (check 'use client' content)"),
    ("nuxt", "nuxt", "ssr/ssg"),
    ("astro", "astro", "ssg"),
    ("@sveltejs/kit", "sveltekit", "ssr/ssg"),
    ("gatsby", "gatsby", "ssg"),
    ("@remix-run/react", "remix", "ssr"),
    ("vite-ssg", "vue", "ssg"),
    ("vue", "vue", "csr"),
    ("react", "react", "csr"),
]
CONFIG_FILES = [("hugo.toml", "hugo"), ("hugo.yaml", "hugo"), ("_config.yml", "jekyll")]
HTML_MARKERS = [("wp-content/", "wordpress"), ("cdn.shopify.com", "shopify"), ("static.wixstatic.com", "wix"),
                ("squarespace.com", "squarespace"), ("website-files.com", "webflow")]
SITE_URL_KEYS = re.compile(
    r"^\s*(?:NEXT_PUBLIC_SITE_URL|PUBLIC_SITE_URL|SITE_URL|NUXT_PUBLIC_SITE_URL|VITE_SITE_URL)\s*=\s*['\"]?(https?://[^'\"\s]+)",
    re.M)
CONFIG_SITE = re.compile(r"(?:site|siteUrl)\s*:\s*['\"](https?://[^'\"]+)['\"]")


def init(project, templates):
    seo = Path(project) / ".seo"
    created = []
    for d in SUBDIRS:
        (seo / d).mkdir(parents=True, exist_ok=True)
    for name in ("profile.yaml", "change-log.md"):
        dst = seo / name
        if not dst.exists():
            shutil.copyfile(Path(templates) / name, dst)
            created.append(str(dst))
    gitignore = seo / ".gitignore"
    if not gitignore.exists():
        gitignore.write_text(GITIGNORE)
        created.append(str(gitignore))
    return {"seo_dir": str(seo), "created": created}


def detect(project, html=None):
    p = Path(project)
    evidence, domains = [], []
    framework = rendering = cms = None

    pkg = p / "package.json"
    if pkg.exists():
        data = json.loads(pkg.read_text())
        deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
        for dep, fw, rend in FRAMEWORKS:
            if dep in deps:
                framework, rendering = fw, rend
                evidence.append(f"package.json depends on {dep}")
                break
        if str(data.get("homepage", "")).startswith("http"):
            domains.append(data["homepage"])

    for name, fw in CONFIG_FILES:
        if not framework and (p / name).exists():
            framework, rendering = fw, "ssg"
            evidence.append(f"found {name}")
    if (p / "wp-config.php").exists() or (p / "wp-content").is_dir():
        cms = "wordpress"
        evidence.append("found WordPress files")

    for cfg in sorted(p.glob("astro.config.*")) + sorted(p.glob("next-sitemap.config.*")):
        domains += CONFIG_SITE.findall(cfg.read_text(errors="ignore"))
    cname = p / "CNAME"
    if cname.exists() and cname.read_text().strip():
        domains.append("https://" + cname.read_text().strip())
    for env_file in sorted(p.glob(".env*")):
        domains += SITE_URL_KEYS.findall(env_file.read_text(errors="ignore"))

    if not framework and not cms and any(p.glob("*.html")):
        framework, rendering = "static-html", "static"
        evidence.append("found *.html at the project root")

    if html:
        text = Path(html).read_text(errors="ignore")
        for marker, name in HTML_MARKERS:
            if marker in text and not cms:
                cms = name
                evidence.append(f"live HTML contains {marker}")

    if cms and framework is None:
        stack_type = "cms"
    elif framework:
        stack_type = "code"
    else:
        stack_type = "none"
    if cms == "wordpress":
        stack_type = "cms"
    unique = list(dict.fromkeys(d.rstrip("/") for d in domains))
    return {"stack_type": stack_type, "framework": framework, "rendering": rendering, "cms": cms,
            "domain_candidates": unique, "evidence": evidence}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("init")
    a.add_argument("--project", required=True)
    a.add_argument("--templates", required=True)
    b = sub.add_parser("detect")
    b.add_argument("--project", required=True)
    b.add_argument("--html")
    args = ap.parse_args()
    result = init(args.project, args.templates) if args.cmd == "init" else detect(args.project, args.html)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `uv run pytest plugins/seo/tests/test_project_setup.py -q`
Expected: 10 passed.

- [ ] **Step 6: Commit**

```bash
git add plugins/seo/engines/project_setup.py plugins/seo/templates plugins/seo/tests/test_project_setup.py
git commit -m "feat(seo): project state init, stack detection, profile template v2

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Doctor (prerequisites, pins, privacy settings, credential tier)

**Files:**
- Create: `plugins/seo/engines/doctor.py`
- Test: `plugins/seo/tests/test_doctor.py`

**Interfaces:**
- Consumes: `<DATA>/node` from Task 4; `<ROOT>/data/schemaorg.sha256` from Task 4.
- Produces: CLI `doctor.py --root ROOT --data DATA [--fix] [--quick]` printing `{"checks": [{"name","ok","detail","fix"}], "tier": {"tier", "sources": {...}, "next_step"}, "chromium_path": str|null}`. Pure functions `parse_version(text) -> tuple|None`, `tier(env, home) -> dict`.

- [ ] **Step 1: Write the failing tests**

`plugins/seo/tests/test_doctor.py`:

```python
from doctor import parse_version, tier


def test_parse_version():
    assert parse_version("v24.20.0") == (24, 20, 0)
    assert parse_version("squirrel 0.0.98\n") == (0, 0, 98)
    assert parse_version("") is None


def test_tier_zero_without_credentials(tmp_path):
    t = tier({}, tmp_path)
    assert t["tier"] == 0 and "GSC_OAUTH_CLIENT_SECRETS_FILE" in t["next_step"]


def test_tier_one_needs_existing_secrets_file(tmp_path):
    assert tier({"GSC_OAUTH_CLIENT_SECRETS_FILE": str(tmp_path / "missing.json")}, tmp_path)["tier"] == 0
    f = tmp_path / "client.json"
    f.write_text("{}")
    assert tier({"GSC_OAUTH_CLIENT_SECRETS_FILE": str(f)}, tmp_path)["tier"] == 1


def test_tier_two_and_sources(tmp_path):
    f = tmp_path / "client.json"
    f.write_text("{}")
    env = {"GSC_OAUTH_CLIENT_SECRETS_FILE": str(f), "DATAFORSEO_LOGIN": "a", "DATAFORSEO_PASSWORD": "b",
           "GOOGLE_API_KEY": "k"}
    t = tier(env, tmp_path)
    assert t["tier"] == 2 and t["sources"]["crux"] is True and t["sources"]["gemini"] is False


def test_ga4_from_adc_file(tmp_path):
    adc = tmp_path / ".config/gcloud/application_default_credentials.json"
    adc.parent.mkdir(parents=True)
    adc.write_text("{}")
    assert tier({}, tmp_path)["sources"]["ga4"] is True
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `uv run pytest plugins/seo/tests/test_doctor.py -q`
Expected: FAIL with `ModuleNotFoundError: No module named 'doctor'`.

- [ ] **Step 3: Write `plugins/seo/engines/doctor.py`**

```python
# /// script
# requires-python = ">=3.12"
# dependencies = [
#   "crawl4ai==0.9.4",
#   "cryptography<49; sys_platform == 'darwin' and platform_machine == 'x86_64'",
# ]
# ///
"""Health checks for the seo plugin: tools, pins, privacy settings and credential tier.

Prints JSON: {"checks": [...], "tier": {...}, "chromium_path": ...}. Never prints credential values.
--fix installs Chromium for Crawl4AI if missing. --quick reports only the tier.

Usage: uv run --script doctor.py --root PLUGIN_ROOT --data PLUGIN_DATA [--fix] [--quick]

This product includes software developed by UncleCode (https://x.com/unclecode) as part of the Crawl4AI project (https://github.com/unclecode/crawl4ai).
"""

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

SQUIRREL_PIN = (0, 0, 98)
UNLIGHTHOUSE_PIN = "0.19.1"
NODE_MIN = (22, 18, 0)


def parse_version(text):
    m = re.search(r"(\d+)\.(\d+)\.(\d+)", text or "")
    return tuple(int(x) for x in m.groups()) if m else None


def tier(env, home):
    gsc = env.get("GSC_OAUTH_CLIENT_SECRETS_FILE", "")
    sources = {
        "search_console": bool(gsc) and Path(gsc).expanduser().is_file(),
        "crux": bool(env.get("GOOGLE_API_KEY")),
        "bing_webmaster": bool(env.get("BING_WEBMASTER_API_KEY")),
        "dataforseo": bool(env.get("DATAFORSEO_LOGIN") and env.get("DATAFORSEO_PASSWORD")),
        "gemini": bool(env.get("GEMINI_API_KEY")),
        "ga4": bool(env.get("GOOGLE_APPLICATION_CREDENTIALS"))
               or (Path(home) / ".config/gcloud/application_default_credentials.json").is_file(),
    }
    level = 2 if sources["search_console"] and sources["dataforseo"] else (1 if sources["search_console"] else 0)
    steps = {
        0: "Create a Google Cloud OAuth client (Desktop app) with the Search Console API enabled, then export "
           "GSC_OAUTH_CLIENT_SECRETS_FILE=<path to its JSON>.",
        1: "Open a DataForSEO account ($50 deposit, auto-recharge off) and export DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD.",
        2: "All core sources connected.",
    }
    return {"tier": level, "sources": sources, "next_step": steps[level]}


def _run(cmd, extra_env=None):
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=60, env={**os.environ, **(extra_env or {})})
        return (p.stdout + p.stderr).strip()
    except (OSError, subprocess.TimeoutExpired):
        return None


def _item(name, ok, detail, fix=""):
    return {"name": name, "ok": bool(ok), "detail": detail, "fix": fix if not ok else ""}


def chromium_path():
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        path = p.chromium.executable_path
    return path if path and Path(path).exists() else None


def checks(root, data, fix):
    ensure = f'sh "{root}/engines/ensure_node.sh" "{root}/node" "{data}/node"'
    out = [_item("uv", shutil.which("uv"), shutil.which("uv") or "not found",
                 "curl -LsSf https://astral.sh/uv/install.sh | sh")]
    nv = parse_version(_run(["node", "-v"]))
    out.append(_item("node >= 22.18", nv and nv >= NODE_MIN, "v" + ".".join(map(str, nv)) if nv else "not found",
                     "Install Node 22.18 or newer (e.g. brew install node)"))
    sq = Path(data) / "node/node_modules/squirrelscan/bin/squirrel"
    sv = parse_version(_run([str(sq), "--version"], {"NO_TELEMETRY": "1"})) if sq.exists() else None
    out.append(_item("squirrelscan 0.0.98", sv == SQUIRREL_PIN, f"{sv} at {sq}", ensure))
    settings_file = Path.home() / ".squirrel/settings.json"
    s = json.loads(settings_file.read_text()) if settings_file.exists() else {}
    out.append(_item("squirrel privacy settings", s.get("auto_update") is False and s.get("telemetry") is False,
                     f"auto_update={s.get('auto_update')} telemetry={s.get('telemetry')}",
                     f'NO_TELEMETRY=1 "{sq}" self settings set auto_update false && '
                     f'NO_TELEMETRY=1 "{sq}" self settings set telemetry false'))
    ul = Path(data) / "node/node_modules/unlighthouse-ci/package.json"
    ul_version = json.loads(ul.read_text()).get("version") if ul.exists() else None
    out.append(_item("unlighthouse-ci 0.19.1", ul_version == UNLIGHTHOUSE_PIN, ul_version or "missing", ensure))
    vocab = Path(root) / "data/schemaorg-all-https.jsonld"
    want = (Path(root) / "data/schemaorg.sha256").read_text().split()[0]
    have = hashlib.sha256(vocab.read_bytes()).hexdigest() if vocab.exists() else None
    out.append(_item("schema.org vocabulary", have == want, have or "missing",
                     "Restore data/schemaorg-all-https.jsonld from git"))
    chromium = chromium_path()
    if not chromium and fix:
        subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], check=False)
        chromium = chromium_path()
    out.append(_item("chromium", chromium, chromium or "missing", "Re-run doctor.py with --fix"))
    return out, chromium


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--root", required=True)
    ap.add_argument("--data", required=True)
    ap.add_argument("--fix", action="store_true")
    ap.add_argument("--quick", action="store_true")
    args = ap.parse_args()
    result = {"tier": tier(os.environ, Path.home())}
    if not args.quick:
        result["checks"], result["chromium_path"] = checks(args.root, args.data, args.fix)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `uv run pytest plugins/seo/tests/test_doctor.py -q`
Expected: 5 passed.

- [ ] **Step 5: Run the real doctor against the Task 4 install**

Run: `uv run --script plugins/seo/engines/doctor.py --root plugins/seo --data /tmp/claude-501/seo-plugin-data`
Expected: JSON with every check `"ok": true` on this Mac (squirrel privacy settings were turned off on 2026-10-06), `chromium_path` set, and `tier.tier` matching the exported credentials. Confirm no credential value appears in the output.

- [ ] **Step 6: Commit**

```bash
git add plugins/seo/engines/doctor.py plugins/seo/tests/test_doctor.py
git commit -m "feat(seo): doctor for prerequisites, pins, privacy settings and credential tier

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Fix recipes and vendored skills

**Files:**
- Create: `plugins/seo/skills/fix-recipes/SKILL.md`
- Copy: 13 skills from `.claude/skills/` into `plugins/seo/skills/`
- Copy: `core-web-vitals`, `performance` from addyosmani/web-quality-skills @afa8da9 into `plugins/seo/skills/`

**Interfaces:**
- Produces: skills `fix-recipes` (loaded by `/seo:fix`), `seo-audit`, `audit-website` (loaded by `/seo:audit`), and the rest for Plans 2–4.

- [ ] **Step 1: Write `plugins/seo/skills/fix-recipes/SKILL.md`**

````markdown
---
name: fix-recipes
description: How to apply SEO fixes per stack (Next.js, Astro, Nuxt, SvelteKit, Vite SPAs, Hugo, Jekyll, static HTML, WordPress, Shopify, Wix, Squarespace, Webflow). Used by /seo:fix; load when changing titles, meta, canonicals, sitemaps, robots.txt, redirects, structured data, rendering mode, alt text, internal links or hreflang.
---

# Fix recipes

## Rules for every fix

- Change only what the fix-queue item names. One item per commit: `seo: <check id> <short description>`.
- Read the project first and follow its patterns (where metadata lives, components, i18n setup).
- Structured data must match visible text. Use types Google supports for rich results; no "AI schema"; llms.txt is not a Google requirement.
- Indexable content must be in the initial HTML: prefer static generation or server rendering over client-only rendering.
- Never change dates without a substantive content change. Never invent facts, reviews, ratings, prices or authors in markup or copy.
- robots.txt AI-crawler rules change only on the approver's explicit choice per agent. Search and user-fetch agents (Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User) affect visibility; training-only agents (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot, meta-externalagent) do not.
- Hosted platforms change their admin menus: before writing a handoff, confirm the current menu labels in the platform's own help docs (WebFetch) and cite the page.

## Next.js (App Router)

- Title, description, canonical, hreflang: `export const metadata` or `export async function generateMetadata()` in `app/**/page.tsx` or `layout.tsx`; `alternates: { canonical: '/path', languages: { en: '/en/x', ar: '/ar/x' } }`; set `metadataBase` in the root layout.
- Sitemap: `app/sitemap.ts` returning `MetadataRoute.Sitemap`; very large sites use `generateSitemaps`.
- Robots: `app/robots.ts` returning `MetadataRoute.Robots`, including `sitemap`.
- JSON-LD: `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />` in the page. In TypeScript projects type it with `schema-dts` (`import type { WithContext, Product } from 'schema-dts'`); adding the devDependency needs approval.
- Raw-HTML failures: content rendered by `'use client'` components that fetch on the client → fetch in the server component (async page) or render statically with `generateStaticParams`; keep interactivity in small client components.
- Redirects: `redirects()` in `next.config.*` with `permanent: true`, or `permanentRedirect()` in a route.
- Images: `next/image` with meaningful `alt` and `width`/`height` (or `fill` inside a sized parent).

## Next.js (Pages Router)

- `next/head` per page; `getStaticProps` or `getServerSideProps` instead of client fetching for indexable content; sitemap through a `pages/sitemap.xml.ts` route, or `next-sitemap` only if the project already uses it.

## Astro

- Set `site` in `astro.config.*` (needed for canonicals and the sitemap); `@astrojs/sitemap` integration; head tags in the base layout through props; JSON-LD with `<script type="application/ld+json" set:html={JSON.stringify(data)} />`; prefer static output; `client:only` islands must not hold indexable content.

## Nuxt

- With Nuxt SEO (`@nuxtjs/seo`): `useSeoMeta()`, `site.url` in `nuxt.config`, its sitemap and robots modules, `useSchemaOrg()` for JSON-LD. Without it: `useHead()` / `useSeoMeta()`. Server rendering or `nitro.prerender` for indexable routes.

## SvelteKit

- `<svelte:head>` per route; `export const prerender = true` in `+page.ts` or `+layout.ts` for static pages; sitemap from a `+server.ts` route (or `super-sitemap`, with approval).

## Vite SPA (React or Vue without a framework): client-rendered

- Raw-HTML failures here are structural. Options by size of change: (1) build-time prerendering of indexable routes with `vite-prerender-plugin` (any framework) or `vite-ssg` (Vue); (2) React Router framework mode with `prerender` in `react-router.config.ts`; (3) move indexable routes to an SSR/SSG framework (Vike, Next.js, Nuxt, Astro). Propose; do not migrate without approval. Do not add the deleted prerender server or the unmaintained react-snap.

## Hugo

- Built-in sitemap (`[sitemap]` config) and robots (`enableRobotsTXT = true`, `layouts/robots.txt`); title and description from front matter in `layouts/_default/baseof.html`; hreflang through multilingual config and `.Translations`.

## Jekyll

- `jekyll-seo-tag` (`{% seo %}` in the head) with front matter `title` and `description`; `jekyll-sitemap` for the sitemap.

## Static HTML

- Edit each page's `<head>`; write `sitemap.xml` and `robots.txt` at the root; JSON-LD in a `<script type="application/ld+json">` block; one `<h1>` per page.

## WordPress (handoff: admin steps)

- Use the SEO plugin already installed: Yoast SEO, Rank Math or The SEO Framework (GPL: recommend, never bundle). Titles and descriptions in each post's SEO panel; templates in the plugin's title/meta settings; XML sitemap in the plugin's sitemap setting; Settings → Reading "Discourage search engines" must be off; redirects in the plugin's redirect manager or the Redirection plugin; Organization or LocalBusiness schema in the plugin's schema settings, never two schema plugins at once. WordPress renders on the server; check page builders that inject content with JavaScript.

## Shopify, Wix, Squarespace, Webflow (handoff)

- Shopify: home title and description in Online Store preferences; each product and collection "Search engine listing"; URL redirects in Navigation; `robots.txt.liquid` for robots rules; JSON-LD in the theme.
- Wix: each page's SEO settings; the robots.txt editor and URL redirect manager in SEO settings.
- Squarespace: page Settings → SEO; URL mappings for 301s; code injection for JSON-LD.
- Webflow: page SEO settings; site SEO settings for robots and the auto sitemap; 301 redirects in hosting/publishing settings; custom code embed for JSON-LD.

## hreflang (any stack)

- Every language version lists every version, including itself, plus `x-default`; links are reciprocal; codes are ISO 639-1 with optional ISO 3166-1 region (`en`, `ar-AE`); each version's canonical points to itself.
````

- [ ] **Step 2: Copy the already-scanned vendored skills**

These are the copies scanned with skillspector on 2026-09-27 and installed in `.claude/skills/` at marketingskills @5b2c000 and squirrelscan/skills @993ff2e.

```bash
cd /Users/abdelhamidsahbi/seo-tool
for s in seo-audit ai-seo schema site-architecture programmatic-seo content-strategy competitors \
         copywriting copy-editing analytics public-relations directory-submissions audit-website; do
  cp -R ".claude/skills/$s" "plugins/seo/skills/$s"
done
ls plugins/seo/skills
```

Expected: 15 entries (13 copied plus `seo-system` and `fix-recipes`). If the copy is blocked by a permission prompt or the auto-mode classifier, stop. Ask the user to run the loop above, and continue after they confirm.

- [ ] **Step 3: Scan web-quality-skills before vendoring**

```bash
S=$(mktemp -d)
git clone -q https://github.com/addyosmani/web-quality-skills "$S/wq"
git -C "$S/wq" checkout -q afa8da942115f2961fdbfa80807ea0b232ff6c00
skillspector scan "$S/wq/skills/core-web-vitals" --no-llm 2>&1 | grep -E "Score|Severity|Recommendation"
skillspector scan "$S/wq/skills/performance" --no-llm 2>&1 | grep -E "Score|Severity|Recommendation"
```

Show both results to the user and wait for approval (user rule: scan, show, then install). If the folder layout differs (skills at repo root instead of `skills/`), locate `core-web-vitals/SKILL.md` with `find "$S/wq" -name SKILL.md`.

- [ ] **Step 4: After approval, copy the two skills**

```bash
cp -R "$S/wq/skills/core-web-vitals" plugins/seo/skills/core-web-vitals
cp -R "$S/wq/skills/performance" plugins/seo/skills/performance
cp "$S/wq/LICENSE" plugins/seo/skills/core-web-vitals/LICENSE
cp "$S/wq/LICENSE" plugins/seo/skills/performance/LICENSE
```

- [ ] **Step 5: Validate and check the session token cost**

Run: `claude plugin validate plugins/seo && claude plugin details seo@seo-tool`
Expected: valid; 17 skills listed. Report the projected token cost to the user in one line.

- [ ] **Step 6: Commit**

```bash
git add plugins/seo/skills
git commit -m "feat(seo): fix-recipes skill and pinned vendored SEO skills

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: `/seo:setup` and `/seo:start` commands

**Files:**
- Create: `plugins/seo/commands/setup.md`, `plugins/seo/commands/start.md`

**Interfaces:**
- Consumes: `ensure_node.sh` (Task 4), `doctor.py` (Task 8), `project_setup.py` (Task 7).
- Produces: `/seo:setup` (idempotent), `/seo:start`.

- [ ] **Step 1: Check which `${…}` sequences Claude Code substitutes in command text**

Command bodies get `${CLAUDE_PLUGIN_ROOT}` and similar substituted. Confirm that other `${VAR}` sequences are not substituted, because setup must not put credential values into the model's context. Create a throwaway command `plugins/seo/commands/zz-subst-test.md`:

```markdown
---
description: temporary substitution test
---
Reply with only the next two lines, exactly as you received them, and run no tools.
ROOT=${CLAUDE_PLUGIN_ROOT}
HOME_REF=${HOME}
```

Run: `cd "$(mktemp -d)" && claude -p "/seo:zz-subst-test"; cd -`
Expected: `ROOT=` shows a real path and `HOME_REF=${HOME}` stays literal. Then delete `plugins/seo/commands/zz-subst-test.md`. The setup command below avoids writing `${` before any credential name either way, by splitting it across shell quotes (`'$''{NAME}'`).

- [ ] **Step 2: Check that literal `${VAR}` in local-scope MCP env is expanded at start-up**

```bash
T=$(mktemp -d) && cd "$T"
claude mcp add --scope local envprobe -e 'PROBE=$''{HOME}' -- sh -c 'printf %s "$PROBE" > /tmp/claude-501/envprobe.txt; sleep 1'
claude mcp get envprobe
claude mcp list >/dev/null 2>&1; cat /tmp/claude-501/envprobe.txt; echo
claude mcp remove --scope local envprobe
cd -
```

Expected: `claude mcp get` shows `PROBE=${HOME}` (stored literally) and the probe file contains the real home path (expanded at start-up). If the file holds the literal `${HOME}`, local scope does not expand variables. In that case, change setup Step 3 below to register without `-e` for credentials (stdio servers inherit Claude Code's environment), and re-run this probe without `-e` to confirm inheritance.

- [ ] **Step 3: Write `plugins/seo/commands/setup.md`**

````markdown
---
description: Set up the seo plugin for this project. Checks tools, detects the stack, writes .seo/profile.yaml, connects data sources, reports what is unlocked.
---

Load the `seo-system` skill. Run every step; re-running is safe (nothing is overwritten or duplicated). Never print or write credential values.

ROOT=${CLAUDE_PLUGIN_ROOT}, DATA=${CLAUDE_PLUGIN_DATA}, PROJECT=${CLAUDE_PROJECT_DIR}.

## 1. Tools

1. `sh "$ROOT/engines/ensure_node.sh" "$ROOT/node" "$DATA/node"`. The first run installs pinned Node tools and takes 1–3 minutes.
2. `uv run --script "$ROOT/engines/doctor.py" --root "$ROOT" --data "$DATA"`. Show only failed checks, with their `fix`.
   - Chromium missing → ask, then re-run with `--fix`.
   - squirrel privacy settings not off → ask the user, then run the `fix` command shown.
   - uv missing or Node below 22.18 → show the install command and stop.

## 2. Project state

1. `uv run --script "$ROOT/engines/project_setup.py" init --project "$PROJECT" --templates "$ROOT/templates"`.
2. `uv run --script "$ROOT/engines/project_setup.py" detect --project "$PROJECT"`. If `domain_candidates` is empty and the profile has no domain, ask for the production URL. Fetch the homepage once: `curl -sL --max-time 20 -o "$PROJECT/.seo/inputs/home.html" <url>`. Re-run detect with `--html "$PROJECT/.seo/inputs/home.html"`.
3. Fill `.seo/profile.yaml` with what was detected: `domain`, `stack.type`, `stack.framework`, `stack.rendering`, `stack.cms`. Add candidates from the live site: the homepage `<title>` as a brand-name candidate, and the homepage plus up to 5 main pages from `/sitemap.xml` as `key_urls`. Show these and ask the user to confirm.
4. In one grouped message, ask only for fields that are still empty: audience, conversions (with URLs), success_metric, competitors (3–5 domains), brand names, buyer prompts (5–10, in buyers' words), market regions and languages, approver. Never invent competitors, prompts or conversions; leave skipped fields empty.

## 3. Data connections (this project only, local scope; nothing is written to the repo)

Run `claude mcp get <name>` first and skip any server already registered. Register only servers whose credentials the doctor's `tier.sources` reports as present:

- search-console (`sources.search_console`):
  `claude mcp add --scope local search-console -e 'GSC_OAUTH_CLIENT_SECRETS_FILE=$''{GSC_OAUTH_CLIENT_SECRETS_FILE}' -- uvx --with 'cryptography<49' mcp-search-console@0.4.1`
- dataforseo (`sources.dataforseo`):
  `claude mcp add --scope local dataforseo -e 'DATAFORSEO_LOGIN=$''{DATAFORSEO_LOGIN}' -e 'DATAFORSEO_PASSWORD=$''{DATAFORSEO_PASSWORD}' -- npx -y dataforseo-mcp-server@3.1.1`
- squirrelscan (always):
  `claude mcp add --scope local squirrelscan -e NO_TELEMETRY=1 -- "$DATA/node/node_modules/squirrelscan/bin/squirrel" mcp`
- google-analytics (`sources.ga4` and `data_access.ga4_property` set):
  `claude mcp add --scope local google-analytics -- uvx analytics-mcp@0.7.0`

The `'$''{NAME}'` quoting stores a literal variable reference: no secret value is stored, and Claude Code expands it at start-up. New servers load in the next session, so tell the user to restart Claude Code in this folder. The plugin's hook enforces the safety guards in every project; there is nothing to configure: Search Console write tools, squirrelscan comments, DataForSEO Backlinks and Live, squirrel cloud flags.

## 4. Report

Credential tier (0, 1 or 2), what each connected source unlocks (seo-system "Tools and spend guards"), and the doctor's `next_step` for reaching the next tier. End with: "Next: /seo:audit".
````

- [ ] **Step 4: Write `plugins/seo/commands/start.md`**

````markdown
---
description: Start here. Sets up the seo plugin in a new project, or shows this project's SEO status and the next step.
---

Load the `seo-system` skill. P=${CLAUDE_PROJECT_DIR}/.seo

If `$P/profile.yaml` does not exist: say "No SEO setup in this folder yet", then follow ${CLAUDE_PLUGIN_ROOT}/commands/setup.md step by step and stop after its report.

Otherwise, show compactly:

1. **Project**: domain, `stack.type`/`stack.framework`, credential tier from `uv run --script "${CLAUDE_PLUGIN_ROOT}/engines/doctor.py" --root "${CLAUDE_PLUGIN_ROOT}" --data "${CLAUDE_PLUGIN_DATA}" --quick`.
2. **Latest production audit** (newest `$P/reports/<date>/checks.yaml`, ignoring `-local` folders): date, pass/fail/unknown counts for `tech.*` and `onpage.*`, and the top 3 items of its `fix-queue.md`.
3. **Due**: change-log rows whose check-after date is today or earlier and whose `Actual` is empty; failed fix-queue items not yet in the change log.
4. **Next step**, the first that applies:
   - no production audit, or the newest is older than 30 days → `/seo:audit`;
   - failed fixes not yet applied → `/seo:fix top 5`;
   - predictions due → `/seo:audit` to measure them;
   - otherwise → "Nothing due."
````

- [ ] **Step 5: Try both commands in a throwaway Next.js-shaped folder**

```bash
T=$(mktemp -d) && cd "$T" && git init -q
printf '{"dependencies":{"next":"16.0.0","react":"19.0.0"}}' > package.json
printf 'NEXT_PUBLIC_SITE_URL=https://example.com\n' > .env.local
claude -p "/seo:setup" --permission-mode bypassPermissions 2>&1 | tail -30
ls -a .seo && grep -E "^(domain|  type|  framework)" .seo/profile.yaml
claude -p "/seo:start" --permission-mode bypassPermissions 2>&1 | tail -15
claude mcp list 2>&1 | grep -E "squirrelscan|search-console|dataforseo" ; claude mcp remove --scope local squirrelscan 2>/dev/null; cd -
```

Expected:
- `.seo/` contains `profile.yaml`, `change-log.md`, `.gitignore` and the subfolders.
- The profile has `domain: example.com`, `type: code`, `framework: nextjs`.
- The setup output asks for the missing fields and reports the tier.
- `/seo:start` reports "no production audit" and suggests `/seo:audit`.
- `squirrelscan` is registered at local scope; it gets removed at the end.

Bypassed permissions are acceptable here only because the folder is throwaway. The plugin hook still applies.

- [ ] **Step 6: Commit**

```bash
git add plugins/seo/commands/setup.md plugins/seo/commands/start.md
git commit -m "feat(seo): /seo:setup and /seo:start commands

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: `/seo:audit` command, fixture site and end-to-end test

**Files:**
- Create: `plugins/seo/commands/audit.md`
- Create: `tests/fixture-site/site/*` (pages below), `tests/fixture-site/profile.yaml`, `tests/fixture-site/expected.yaml`
- Create: `tests/check_expected.py`, `tests/e2e_audit.sh`

**Interfaces:**
- Consumes: every engine (Tasks 2–5), `ensure_node.sh`, `doctor.py`, the check catalogue (Task 1).
- Produces: `<project>/.seo/reports/<date>[-local]/checks.yaml` (YAML list of checks) and `fix-queue.md`; `raw/rendered/<slug>.md`.

- [ ] **Step 1: Write the fixture site (each page plants one problem)**

`tests/fixture-site/site/index.html`:

```html
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Fixture Co: plumbing services</title>
<meta name="description" content="Fixture Co fixes leaks and installs boilers across the city."></head>
<body><h1>Fixture Co plumbing services</h1>
<p>Fixture Co fixes leaks, installs boilers and answers emergency calls across the city every day of the year.</p>
<ul>
<li><a href="/csr.html">Pricing</a></li><li><a href="/schema-mismatch.html">Widget</a></li>
<li><a href="/bad-product.html">Product</a></li><li><a href="/local.html">Contact our office</a></li>
<li><a href="/no-h1.html">Guide</a></li><li><a href="/missing.html">Old offers</a></li>
<li><a href="/l1.html">Archive</a></li><li><a href="/en.html">English page</a></li>
</ul></body></html>
```

`tests/fixture-site/site/csr.html` (content only after JavaScript):

```html
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Pricing</title>
<meta name="description" content="Plumbing prices."></head>
<body><nav><a href="/">Home</a></nav><div id="app"></div>
<script>
document.getElementById('app').innerHTML = '<h1>Pricing</h1><p>' +
  'Our plumbing plans start at 99 dollars per month and include unlimited call-outs, priority booking and yearly boiler checks. '.repeat(8) +
  '</p>';
</script></body></html>
```

`tests/fixture-site/site/schema-mismatch.html` (JSON-LD contradicts visible text):

```html
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Basic Widget</title>
<meta name="description" content="A basic widget.">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Product","name":"Premium Gold Widget Deluxe Edition","image":"https://fixture.example/w.jpg","offers":{"@type":"Offer","price":"99.00","priceCurrency":"USD","availability":"https://schema.org/InStock"}}</script>
</head><body><h1>Basic Widget</h1><p>The basic widget costs ten dollars and fits standard pipes in most homes.</p></body></html>
```

`tests/fixture-site/site/bad-product.html` (invalid Product):

```html
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Pipe wrench</title>
<meta name="description" content="Pipe wrench.">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Product","name":"Pipe wrench"}</script>
</head><body><h1>Pipe wrench</h1><p>A pipe wrench for tight fittings and stubborn joints under the sink.</p></body></html>
```

`tests/fixture-site/site/local.html` (LocalBusiness subtype without address):

```html
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Contact our office</title>
<meta name="description" content="Visit or call Fixture Co.">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Plumber","name":"Fixture Co"}</script>
</head><body><h1>Contact Fixture Co</h1><p>Call us any day of the week to book a plumber for your home or office.</p></body></html>
```

`tests/fixture-site/site/no-h1.html`:

```html
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Guide</title>
<meta name="description" content="Leak guide."></head>
<body><h2>How do I find a leak?</h2><p>Check the meter with every tap closed; if it moves, water is leaking somewhere in the system.</p></body></html>
```

Depth chain: `l1.html` → `l2.html` → `l3.html` → `l4.html` → `deep.html` (depth 5 from `/`). Create them with:

```bash
cd tests/fixture-site/site
for i in 1 2 3; do n=$((i+1)); printf '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Archive %s</title><meta name="description" content="Archive page %s."></head><body><h1>Archive %s</h1><p>Older posts from the Fixture Co archive, kept for reference.</p><a href="/l%s.html">Older</a></body></html>\n' $i $i $i $n > l$i.html; done
printf '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Archive 4</title><meta name="description" content="Archive page 4."></head><body><h1>Archive 4</h1><p>Older posts from the Fixture Co archive, kept for reference.</p><a href="/deep.html">Boiler offer</a></body></html>\n' > l4.html
printf '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Boiler offer</title><meta name="description" content="Boiler offer."></head><body><h1>Boiler installation offer</h1><p>Book a new boiler installation this month and get the first service visit free.</p></body></html>\n' > deep.html
cd -
```

`tests/fixture-site/site/en.html` and `ar.html` (hreflang without a return link):

```html
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>English page</title>
<meta name="description" content="English.">
<link rel="alternate" hreflang="en" href="/en.html"><link rel="alternate" hreflang="ar" href="/ar.html">
</head><body><h1>Plumbing in English</h1><p>Our English page for customers across the city.</p><a href="/ar.html">العربية</a></body></html>
```

```html
<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>صفحة عربية</title>
<meta name="description" content="عربي.">
<link rel="alternate" hreflang="ar" href="/ar.html">
</head><body><h1>السباكة بالعربية</h1><p>صفحتنا العربية للعملاء في جميع أنحاء المدينة.</p></body></html>
```

`tests/fixture-site/site/robots.txt` (blocks a search agent):

```text
User-agent: OAI-SearchBot
Disallow: /

User-agent: *
Allow: /
```

`/missing.html` is deliberately absent (404).

- [ ] **Step 2: Write the fixture profile and the expected failures**

`tests/fixture-site/profile.yaml`:

```yaml
name: fixture
domain: fixture.example
key_urls:
  - https://fixture.example/
  - https://fixture.example/csr.html
  - https://fixture.example/deep.html
conversions:
  - {name: Contact, url: /local.html}
brand: {names: [Fixture Co]}
stack: {type: code, framework: static-html, rendering: static, cms: ""}
approval: {approver: E2E Test}
```

`tests/fixture-site/expected.yaml`:

```yaml
# check id -> paths that must appear in that check's pages, with verdict fail
tech.raw-html: [/csr.html]
tech.click-depth: [/deep.html]
tech.ai-crawler-access: [/]
tech.schema-valid: [/bad-product.html, /local.html]
tech.schema-matches: [/schema-mismatch.html]
tech.broken: [/missing.html]
tech.hreflang: [/en.html]
onpage.h1: [/no-h1.html]
```

- [ ] **Step 3: Write `tests/check_expected.py`**

```python
# /// script
# requires-python = ">=3.12"
# dependencies = ["pyyaml==6.0.3"]
# ///
"""Compare the newest checks.yaml under a reports folder with expected.yaml.
Usage: uv run --script check_expected.py EXPECTED_YAML REPORTS_DIR
"""
import sys
from pathlib import Path
from urllib.parse import urlsplit

import yaml


def main(expected_path, reports_dir):
    expected = yaml.safe_load(Path(expected_path).read_text())
    runs = sorted(Path(reports_dir).glob("*/checks.yaml"))
    if not runs:
        print("FAIL: no checks.yaml under", reports_dir)
        return 1
    checks = {c["id"]: c for c in yaml.safe_load(runs[-1].read_text())}
    problems = []
    for check_id, paths in expected.items():
        c = checks.get(check_id)
        if not c:
            problems.append(f"{check_id}: missing")
            continue
        if c.get("verdict") != "fail":
            problems.append(f"{check_id}: verdict {c.get('verdict')}, expected fail")
        found = {urlsplit(u).path or "/" for u in c.get("pages") or []}
        for p in paths:
            if p not in found:
                problems.append(f"{check_id}: {p} not in pages {sorted(found)}")
    for p in problems:
        print("FAIL:", p)
    print(f"{len(expected) - len({p.split(':')[0] for p in problems})}/{len(expected)} expected checks OK ({runs[-1]})")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:3]))
```

- [ ] **Step 4: Write `tests/e2e_audit.sh`**

```bash
#!/usr/bin/env bash
# End-to-end: run /seo:audit against the fixture site on localhost and check every planted problem is caught.
# Needs the plugin installed (claude plugin install seo@seo-tool). Uses Claude usage.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="$(mktemp -d)"
PORT="${PORT:-8765}"
cp -R "$HERE/fixture-site/site" "$WORK/site"
mkdir -p "$WORK/project/.seo"
cp "$HERE/fixture-site/profile.yaml" "$WORK/project/.seo/profile.yaml"
cp "$HERE/../plugins/seo/templates/change-log.md" "$WORK/project/.seo/change-log.md"
python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$WORK/site" >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null' EXIT
sleep 1
cd "$WORK/project"
claude -p "/seo:audit --local http://127.0.0.1:$PORT" --permission-mode bypassPermissions > "$WORK/claude.log" 2>&1 || true
echo "log: $WORK/claude.log"
uv run --script "$HERE/check_expected.py" "$HERE/fixture-site/expected.yaml" "$WORK/project/.seo/reports"
```

- [ ] **Step 5: Run the e2e test to verify it fails (no audit command yet)**

Run: `bash tests/e2e_audit.sh`
Expected: `FAIL: no checks.yaml under …/reports` (the command does not exist yet).

- [ ] **Step 6: Write `plugins/seo/commands/audit.md`**

````markdown
---
description: Technical + on-page SEO audit of this project's site, or of a local dev server, into a ranked fix queue.
argument-hint: "[--local http://localhost:3000]"
---

Load the `seo-system` skill and follow its operating loop. Use the `audit-website` and `seo-audit` skills to judge findings; the rule base wins on conflict.

ROOT=${CLAUDE_PLUGIN_ROOT}, DATA=${CLAUDE_PLUGIN_DATA}, P=${CLAUDE_PROJECT_DIR}/.seo

## 1. Load

- No `$P/profile.yaml` → run /seo:start instead and stop. Read `profile.yaml`, `baseline.json` (may be missing) and `change-log.md`.
- PROD = `https://<domain>` from the profile.
- If `$ARGUMENTS` contains `--local URL`: BASE = that URL and RUN = `$P/reports/<YYYY-MM-DD>-local`. Otherwise BASE = PROD and RUN = `$P/reports/<YYYY-MM-DD>`. RAW = `$RUN/raw`. Run `mkdir -p "$RAW"`.
- TARGETS = `key_urls` plus conversion URLs (relative ones joined to PROD), each rebased onto BASE by replacing PROD's scheme and host with BASE's.
- NODE = output of `sh "$ROOT/engines/ensure_node.sh" "$ROOT/node" "$DATA/node"`.
- CHROMIUM = `chromium_path` from `uv run --script "$ROOT/engines/doctor.py" --root "$ROOT" --data "$DATA"`.

## 2. Collect (run independent steps in parallel)

a. `NO_TELEMETRY=1 "$NODE/node_modules/squirrelscan/bin/squirrel" audit "$BASE" -C full --render-mode off -f json -o "$RAW/squirrel.json"`
b. `uv run --script "$ROOT/engines/site_graph.py" "$BASE" --targets "<TARGETS comma-separated>" --out "$RAW/site-graph.json" --checks-out "$RUN/site-graph-checks.json"`
c. After b: PAGES = TARGETS + `top_linked` from `$RAW/site-graph.json`, deduplicated, at most 20.
   - `uv run --script "$ROOT/engines/raw_vs_rendered.py" <PAGES> --out "$RAW/raw-vs-rendered.json" --save-markdown "$RAW/rendered"`
   - `node "$NODE/schema_check.mjs" --vocab "$ROOT/data/schemaorg-all-https.jsonld" --required "$ROOT/data/google-required-fields.json" --out "$RAW/schema.json" <PAGES>`
   - Write `$RAW/unlighthouse.config.ts` containing `export default { puppeteerOptions: { executablePath: '<CHROMIUM>' }, chrome: { useSystem: false, useDownloadFallback: false } }`. Then run `"$NODE/node_modules/.bin/unlighthouse-ci" --site "$BASE" --urls "<PAGES as root-relative paths, comma-separated>" --mobile --reporter jsonExpanded --output-path "$RAW/unlighthouse" --no-cache --config-file "$RAW/unlighthouse.config.ts"`, then `uv run --script "$ROOT/engines/lab_speed.py" "$RAW/unlighthouse/ci-result.json" --site "$BASE" --out "$RUN/lab-speed.json"`.
d. Production only (skip with `--local`): `uv run --script "$ROOT/engines/crux.py" --origin "$PROD" --url <each TARGET> --out "$RUN/field-speed.json"`.
e. Production only, and only if the `search-console` MCP is connected and `data_access.search_console` is set: URL Inspection for each TARGET (index status, `richResultsResult`), plus the last 28 days of top queries per TARGET. Save to `$RAW/gsc.json`. If not connected, the checks that need it are `unknown` with "connect Search Console (tier 1)".

## 3. Score → `$RUN/checks.yaml`

A YAML list with one entry per check id in the seo-system check catalogue, in the check format.

- **Engine checks:** copy them as they are.
  - tech.raw-html: merge the per-page results into one check whose `pages` lists failing pages and whose evidence is keyed per page.
  - tech.click-depth, tech.hreflang, tech.ai-crawler-access: from `site-graph-checks.json`.
  - tech.schema-valid, tech.schema-matches: merged per page from `schema.json`, plus Search Console `richResultsResult` issues when present.
  - tech.speed-lab, tech.speed-field.
- **squirrel issues:** map them with the seo-system prefix table into tech.crawl-index, tech.broken, tech.mobile, onpage.title-intent, onpage.meta, onpage.h1, onpage.alt and onpage.anchors. For tech.broken, `pages` = the broken URLs and the linking pages go in evidence.
- **Content checks:** judge onpage.h2-answers, onpage.answer-early and onpage.declarative-intro from `$RAW/rendered/*.md`. Quote the opening sentence, and each H2 with its first sentence, as evidence. Note the rule scope (ChatGPT) where the rule base gives one.
- **Verdicts:** come from evidence only. With no evidence the verdict is `unknown` and says what would resolve it.

## 4. Rank → `$RUN/fix-queue.md`

- **Top:** pass / fail / unknown counts per module.
- **Ranked fixes:** use the seo-system ranking. Each fix gives the failed question, the fix in one or two sentences, pages, evidence, where the fix is made (from `stack`), and the predicted outcome.
- **"Needs data":** unknown checks, each with what would resolve it.
- **"Other findings":** unmapped squirrel issues with squirrel's severity.

## 5. Baseline (production runs only; never for `-local`)

- **Previous run exists:** compare each check with it (newly failing, newly passing, still failing). Fill `Actual` in change-log rows whose check-after date has passed and whose check is in this audit.
- **Then write `baseline.json`:** set `audit` to the date, squirrel's overall and category scores, counts per verdict per module, per-check verdicts, and lab and field metrics. Leave other keys of `baseline.json` untouched.

Finish with the counts, the top 5 fixes, the path to `fix-queue.md`, and "Apply with /seo:fix top 5 (or pick check ids)".
````

- [ ] **Step 7: Run the e2e test to verify it passes**

Run: `bash tests/e2e_audit.sh`
Expected: `8/8 expected checks OK`. If a check is missing or wrong, read the log and the raw outputs under the printed work dir. Fix the engine when the raw output is wrong, or the audit command text when scoring dropped correct engine output, then re-run. Do not edit `expected.yaml` to match a wrong result.

- [ ] **Step 8: Commit**

```bash
git add plugins/seo/commands/audit.md tests/fixture-site tests/check_expected.py tests/e2e_audit.sh
git commit -m "feat(seo): /seo:audit command with fixture site end-to-end test

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: `/seo:fix` command and end-to-end test

**Files:**
- Create: `plugins/seo/commands/fix.md`
- Create: `tests/e2e_fix.sh`

**Interfaces:**
- Consumes: `fix-queue.md` and `checks.yaml` from `/seo:audit` (Task 11); `fix-recipes` skill (Task 9).
- Produces: branch `seo/fix-<YYYY-MM-DD>` with one commit per fixed check (code projects); `.seo/handoff/<date>.md` (cms or none); change-log rows.

- [ ] **Step 1: Write `tests/e2e_fix.sh`**

```bash
#!/usr/bin/env bash
# End-to-end: /seo:fix on a static-HTML code project must branch, fix, log, and refuse a dirty tree.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="$(mktemp -d)"
DAY="$(date +%F)"
cp -R "$HERE/fixture-site/site" "$WORK/project"
cd "$WORK/project"
git init -q -b main && git add -A && git -c user.name=t -c user.email=t@t commit -qm init
mkdir -p ".seo/reports/$DAY"
cp "$HERE/fixture-site/profile.yaml" .seo/profile.yaml
cp "$HERE/../plugins/seo/templates/change-log.md" .seo/change-log.md
cat > ".seo/reports/$DAY/checks.yaml" <<'EOF'
- id: onpage.h1
  question: Does every indexable page have exactly one descriptive H1?
  verdict: fail
  pages: [https://fixture.example/no-h1.html]
  evidence: no-h1.html has no <h1>; its first heading is an <h2>
  source: squirrel core/h1
EOF
cat > ".seo/reports/$DAY/fix-queue.md" <<'EOF'
# Fix queue
1. onpage.h1: add one descriptive <h1> to no-h1.html (static HTML). Pages: /no-h1.html
EOF
printf '.seo/\n' > .git/info/exclude

# Dirty tree must be refused.
echo "<!-- local edit -->" >> index.html
claude -p "/seo:fix onpage.h1 --approver 'E2E Test'" --permission-mode bypassPermissions > "$WORK/dirty.log" 2>&1 || true
if git rev-parse --verify -q "seo/fix-$DAY" >/dev/null; then echo "FAIL: branch created on a dirty tree"; exit 1; fi
git checkout -q -- index.html

# Clean tree: fix lands on a branch.
claude -p "/seo:fix onpage.h1 --approver 'E2E Test'" --permission-mode bypassPermissions > "$WORK/clean.log" 2>&1 || true
fail=0
[ "$(git branch --show-current)" = "seo/fix-$DAY" ] || { echo "FAIL: not on seo/fix-$DAY"; fail=1; }
grep -qi "<h1" no-h1.html || { echo "FAIL: no <h1> added"; fail=1; }
[ "$(git rev-list --count main)" = "1" ] || { echo "FAIL: main changed"; fail=1; }
grep -q "onpage.h1" .seo/change-log.md && grep -q "E2E Test" .seo/change-log.md || { echo "FAIL: change-log row missing"; fail=1; }
echo "logs: $WORK/dirty.log $WORK/clean.log"
[ $fail = 0 ] && echo "e2e fix OK"
exit $fail
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bash tests/e2e_fix.sh`
Expected: FAIL lines (no `/seo:fix` command yet), for example `FAIL: not on seo/fix-…`.

- [ ] **Step 3: Write `plugins/seo/commands/fix.md`**

````markdown
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
````

- [ ] **Step 4: Run the e2e test to verify it passes**

Run: `bash tests/e2e_fix.sh`
Expected: `e2e fix OK`. If it fails, read the printed logs, then fix the command text or the test's assumptions about git state. Do not weaken the dirty-tree check.

- [ ] **Step 5: Commit**

```bash
git add plugins/seo/commands/fix.md tests/e2e_fix.sh
git commit -m "feat(seo): /seo:fix command with branch, change-log and dirty-tree e2e test

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Migrate the old repo layout and document the plugin

**Files:**
- Delete: `engines/` (now empty), `searxng/`, `projects/_template/`, `.claude/commands/audit.md`, `research.md`, `brief.md`, `visibility.md`, `review.md`, root `.mcp.json`, `.claude/settings.json`, root `package.json`, `package-lock.json`
- Rewrite: `CLAUDE.md` (developer notes), `README.md` (install and use)

**Interfaces:**
- Consumes: everything above.
- Produces: a repo whose only runtime is the plugin. `/research`, `/brief`, `/visibility` and `/review` return as `/seo:*` commands in Plans 2–4.

- [ ] **Step 1: Stop and remove SearXNG**

The spec removes it: it sends automated queries to Google and is AGPL.

```bash
docker compose -f searxng/docker-compose.yml down
git rm -rq searxng
```

- [ ] **Step 2: Remove the superseded files**

```bash
git rm -q .claude/commands/audit.md .claude/commands/research.md .claude/commands/brief.md \
  .claude/commands/visibility.md .claude/commands/review.md
git rm -rq projects/_template
git rm -q .mcp.json .claude/settings.json package.json package-lock.json
rm -rf node_modules
rmdir engines 2>/dev/null || true
```

`.mcp.json` and `.claude/settings.json` are replaced by `/seo:setup`'s local-scope registration and the plugin hook. Run `/seo:setup` in this repo if you want the data connections here too.

- [ ] **Step 3: Rewrite `CLAUDE.md` as developer notes**

```markdown
# seo-tool: developer notes

This repo is the source and local marketplace of the `seo` Claude Code plugin.
Design: `docs/superpowers/specs/2026-10-05-seo-plugin-design.md`. Plans: `docs/superpowers/plans/`.
Operating rules (rule base, loop, check catalogue, spend guards) live in `plugins/seo/skills/seo-system/SKILL.md`. Edit them there, not here.

## Layout

- `.claude-plugin/marketplace.json`: marketplace `seo-tool` with one plugin, `./plugins/seo`.
- `plugins/seo/`: commands/, skills/, hooks/, engines/ (uv inline scripts), node/ (pinned Node tools + schema_check.mjs), data/, templates/, tests/, NOTICE.
- `tests/`: fixture site and end-to-end scripts (`e2e_audit.sh`, `e2e_fix.sh`; they use Claude usage).
- `.claude/skills/`: the full vendored marketing skill set for this repo only (the plugin carries a subset).

## Work on the plugin

- Unit tests: `uv run pytest plugins/seo/tests -q` and `(cd plugins/seo/node && npm ci && node --test)`.
- Edits apply on the next session or `/reload-plugins` (the plugin is installed from this folder).
- Pins: Python pins in each engine's `# /// script` header; Node pins in `plugins/seo/node/package.json` (exact); skills by commit in `plugins/seo/NOTICE`. Bump deliberately and re-check the rule base each quarter.
- New skill or plugin: `skillspector scan <path> --no-llm`, show the result, then vendor.
- Engines that use Crawl4AI must print its attribution line in `--help`.
```

- [ ] **Step 4: Rewrite `README.md` for users**

```markdown
# seo: SEO + AI search visibility plugin for Claude Code

Install once, then in any project folder: `/seo:start`.

## Install

Needs Node ≥ 22.18 and [uv](https://docs.astral.sh/uv/).

```bash
claude plugin marketplace add /Users/abdelhamidsahbi/seo-tool
claude plugin install seo@seo-tool
```

## Use

| Command | Does |
| --- | --- |
| `/seo:start` | First run: setup. Later: status and the next step. |
| `/seo:setup` | Checks tools, detects the stack, fills `.seo/profile.yaml`, connects data sources. |
| `/seo:audit [--local URL]` | Technical + on-page checks → `.seo/reports/<date>/fix-queue.md`. |
| `/seo:fix [ids \| top N]` | Applies approved fixes: a branch in code projects, admin steps for CMS sites, a handoff doc otherwise. |

Coming in later plans: `/seo:research`, `/seo:content`, `/seo:brief`, `/seo:visibility`, `/seo:offpage`, `/seo:review`.

## Credentials (optional; more data at each tier)

Export in your shell profile: `GSC_OAUTH_CLIENT_SECRETS_FILE` (Search Console OAuth client JSON), `GOOGLE_API_KEY` (Chrome UX Report API), `DATAFORSEO_LOGIN` + `DATAFORSEO_PASSWORD` ($50 deposit, auto-recharge off), `GEMINI_API_KEY`. GA4 uses `gcloud auth application-default login` with the `analytics.readonly` scope.

## Safety

A plugin hook blocks Search Console write tools, DataForSEO Backlinks calls, and squirrelscan cloud and publish flags in every project; it asks before any DataForSEO Live call. Fixes never land on your default branch, and nothing is pushed or deployed.

Third-party credits: `plugins/seo/NOTICE`.
```

- [ ] **Step 5: Full test pass**

```bash
uv run pytest plugins/seo/tests -q
(cd plugins/seo/node && npm ci --no-fund --no-audit >/dev/null && node --test)
claude plugin validate . && claude plugin validate plugins/seo
```

Expected: all Python and Node tests pass; both manifests valid.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore(seo): retire pre-plugin layout, SearXNG and repo-level configs; document the plugin

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
