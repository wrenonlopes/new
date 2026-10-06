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
