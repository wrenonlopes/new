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

from raw_vs_rendered import structural_false_block  # same engines/ folder; stdlib-only at import time

UA = "Mozilla/5.0 (compatible; seo-plugin-site-graph/1.0)"
DEPTH_LIMIT = 3  # heuristic: three-click depth
# Agents that decide whether pages can appear in search or AI-search answers.
SEARCH_AGENTS = ["Googlebot", "Bingbot", "OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot",
                 "Claude-User", "PerplexityBot", "Perplexity-User"]
# Training-only agents: blocking them is a policy choice and does not affect search results.
TRAINING_AGENTS = ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot", "meta-externalagent"]
LANG_RE = re.compile(r"^(x-default|[a-z]{2,3}(-[a-z]{4})?(-([a-z]{2}|\d{3}))?)$", re.I)
DEFAULT_PORTS = {"http": 80, "https": 443}
INDEX_DOCS = ("index.html", "index.htm", "index.php")


def norm(url):
    """Fetchable URL: lowercase scheme and host, no default port, no fragment."""
    p = urlsplit(url)
    scheme = p.scheme.lower()
    host = (p.hostname or "").lower()
    port = f":{p.port}" if p.port and p.port != DEFAULT_PORTS.get(scheme) else ""
    return urlunsplit((scheme, host + port, p.path or "/", p.query, ""))


def key(url):
    """Comparison key: norm() plus no www., no trailing slash, no index document."""
    p = urlsplit(norm(url))
    host = p.netloc.removeprefix("www.")
    path = p.path
    for doc in INDEX_DOCS:
        if path.endswith("/" + doc):
            path = path[: -len(doc)]
    if len(path) > 1:
        path = path.rstrip("/")
    return urlunsplit((p.scheme, host, path, p.query, ""))


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
    depth = {key(p["url"]): (p["url"], p["depth"]) for p in pages}
    if targets:
        wanted = [norm(t) for t in targets]
        unreached = [t for t in wanted if key(t) not in depth]
        deep = [{"url": t, "depth": depth[key(t)][1]} for t in wanted
                if key(t) in depth and depth[key(t)][1] > limit]
    else:
        unreached = []
        deep = [{"url": u, "depth": d} for u, d in depth.values() if d > limit]
    if deep or (unreached and complete):
        verdict = "fail"
    elif unreached or (not targets and not complete):
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
    by_key = {key(p["url"]): p for p in pages}
    errors, unverified = [], []
    for p in pages:
        for lang, href in p.get("hreflang", {}).items():
            if not LANG_RE.match(lang):
                errors.append({"page": p["url"], "problem": f"invalid hreflang code '{lang}'"})
            if key(href) == key(p["url"]):
                continue
            target = by_key.get(key(href))
            if target is None:
                unverified.append({"page": p["url"], "alternate": href, "problem": "alternate not reached by crawl"})
            elif not target.get("ok", True) or target.get("status") is None:
                unverified.append({"page": p["url"], "alternate": href, "problem": "alternate could not be fetched"})
            elif target["status"] >= 400:
                errors.append({"page": p["url"], "alternate": href, "problem": f"alternate returns {target['status']}"})
            elif key(p["url"]) not in {key(v) for v in target.get("hreflang", {}).values()}:
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


def robots_groups(text):
    """RFC 9309 groups as (agents, rules); a rule is (allow: bool, path)."""
    groups, agents, rules, last = [], [], [], None
    for raw in (text or "").splitlines():
        line = raw.split("#", 1)[0].strip()
        if ":" not in line:
            continue
        field, value = (s.strip() for s in line.split(":", 1))
        field = field.lower()
        if field == "user-agent":
            if last == "rule":
                groups.append((agents, rules))
                agents, rules = [], []
            agents.append(value.lower())
            last = "agent"
        elif field in ("allow", "disallow") and agents:
            if value:  # an empty rule matches nothing
                rules.append((field == "allow", value))
            last = "rule"
    if agents:
        groups.append((agents, rules))
    return groups


def _rules_for(groups, agent):
    token = agent.lower()
    if any(token in agents for agents, _ in groups):
        return [r for agents, rules in groups if token in agents for r in rules]
    return [r for agents, rules in groups if "*" in agents for r in rules]


def _matches(pattern, target):
    anchored = pattern.endswith("$")
    body = re.escape(pattern[:-1] if anchored else pattern).replace(r"\*", ".*")
    return re.match(body + ("$" if anchored else ""), target) is not None


def robots_allows(groups, agent, url):
    parts = urlsplit(url)
    target = (parts.path or "/") + (f"?{parts.query}" if parts.query else "")
    best = None  # (pattern length, allow): longest match wins; allow wins a tie
    for allow, pattern in _rules_for(groups, agent):
        if _matches(pattern, target) and (best is None or (len(pattern), allow) > best):
            best = (len(pattern), allow)
    return True if best is None else best[1]


def robots_check(robots_txt, urls):
    base = {"id": "tech.ai-crawler-access",
            "question": "Can search and AI-search crawlers fetch the key pages (robots.txt)?",
            "source": "engines/site_graph.py"}
    if robots_txt is None:
        return {**base, "verdict": "unknown", "pages": [], "evidence": {"error": "robots.txt could not be fetched"}}
    groups = robots_groups(robots_txt)

    def blocked(agents):
        out = {}
        for agent in agents:
            hit = [u for u in urls if not robots_allows(groups, agent, u)]
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
    url_for = {key(p["url"]): p["url"] for p in pages}
    counts = Counter()
    for p in pages:
        for k in {key(l["href"]) for l in p["links"]} - {key(p["url"])}:
            counts[k] += 1
    return [url_for[k] for k, _ in counts.most_common() if k in url_for][:n]


def page_ok(r):
    """Crawl4AI marks an empty client-side shell as blocked; a 2xx page is still a live page."""
    return bool(r.success) or structural_false_block(r)


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
        url = norm(r.redirected_url or r.url)
        parent = (r.metadata or {}).get("parent_url")
        pages.append({
            "url": url,
            "depth": (r.metadata or {}).get("depth", 0),
            "parent": norm(parent) if parent else None,
            "ok": page_ok(r),
            "status": r.status_code,
            "links": [{"href": norm(urljoin(url, l.get("href", ""))), "text": (l.get("text") or "").strip()[:120]}
                      for l in (r.links or {}).get("internal", [])],
            "hreflang": hreflang_map(r.html, url),
        })
    return pages


def crawl_failure(pages):
    """Reason the crawl cannot support depth/hreflang verdicts, or None."""
    if not pages:
        return "crawl returned no pages"
    start = min(pages, key=lambda p: p["depth"])
    status = start.get("status") or 0
    if not start.get("ok", True) or not 200 <= status < 300:
        return f"start page fetch failed (status {start.get('status')})"
    return None


def unknown_check(check, reason):
    return {**check, "verdict": "unknown", "pages": [], "evidence": {"error": reason}}


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
    reason = crawl_failure(pages)
    if reason:
        checks[0] = unknown_check(checks[0], reason)   # tech.click-depth
        checks[1] = unknown_check(checks[1], reason)   # tech.hreflang
    graph = {"start": norm(args.start), "complete": complete, "pages": pages, "top_linked": most_linked(pages, 15)}
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    Path(args.checks_out).parent.mkdir(parents=True, exist_ok=True)
    Path(args.out).write_text(json.dumps(graph, indent=2, ensure_ascii=False), encoding="utf-8")
    Path(args.checks_out).write_text(json.dumps(checks, indent=2, ensure_ascii=False), encoding="utf-8")
    for c in checks:
        print(f"{c['verdict']:>7}  {c['id']}", file=sys.stderr)


if __name__ == "__main__":
    main()
