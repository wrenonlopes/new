"""Lighthouse runner.

Question: does the page load fast and stay stable on mobile?
Lab data only (mobile emulation). Field data comes from Search Console's
Core Web Vitals report; when the two disagree, field data wins.

Uses the pinned lighthouse from node_modules and the Chromium that
Crawl4AI installed (override with CHROME_PATH).

Usage:
  uv run engines/lighthouse_runner.py URL [URL ...] --out-dir DIR
"""

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
LIGHTHOUSE = ROOT / "node_modules" / ".bin" / "lighthouse"
# Google's "good" thresholds. TBT stands in for INP, which lab runs cannot measure.
LIMITS = {"lcp_ms": 2500, "cls": 0.1, "tbt_ms": 200}


def chrome_path():
    if os.environ.get("CHROME_PATH"):
        return os.environ["CHROME_PATH"]
    with sync_playwright() as p:
        return p.chromium.executable_path


def run_one(url, out_dir, chrome):
    slug = re.sub(r"[^a-z0-9]+", "-", url.lower().split("://", 1)[-1]).strip("-")[:80]
    raw_path = out_dir / f"lighthouse-{slug}.raw.json"
    cmd = [
        str(LIGHTHOUSE), url,
        "--output=json", f"--output-path={raw_path}",
        "--only-categories=performance,seo,accessibility,best-practices",
        "--chrome-flags=--headless=new --no-sandbox",
        "--quiet",
    ]
    proc = subprocess.run(cmd, env={**os.environ, "CHROME_PATH": chrome}, capture_output=True, text=True)
    out = {"url": url, "question": "Does the page load fast and stay stable on mobile?"}
    if proc.returncode != 0 or not raw_path.exists():
        out.update(verdict="unknown", evidence={"error": proc.stderr.strip()[-500:]})
        return out

    lhr = json.loads(raw_path.read_text())
    audits = lhr["audits"]
    metric = lambda k: audits.get(k, {}).get("numericValue")
    ev = {
        "scores": {k: round((v.get("score") or 0) * 100) for k, v in lhr["categories"].items()},
        "lcp_ms": metric("largest-contentful-paint"),
        "cls": metric("cumulative-layout-shift"),
        "tbt_ms": metric("total-blocking-time"),
        "fcp_ms": metric("first-contentful-paint"),
        "raw_report": str(raw_path),
    }
    if lhr.get("runtimeError"):
        out.update(verdict="unknown", evidence={**ev, "error": lhr["runtimeError"].get("message")})
        return out

    failed = [k for k, limit in LIMITS.items() if ev[k] is None or ev[k] > limit]
    ev["over_limit"] = failed
    out.update(verdict="fail" if failed else "pass", evidence=ev)
    return out


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("urls", nargs="+")
    p.add_argument("--out-dir", required=True)
    args = p.parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    chrome = chrome_path()
    results = [run_one(u, out_dir, chrome) for u in args.urls]
    (out_dir / "lighthouse.json").write_text(json.dumps(results, indent=2))
    for r in results:
        print(f"{r['verdict']:>7}  {r['url']}", file=sys.stderr)


if __name__ == "__main__":
    main()
