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
from urllib.parse import quote
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
    req = Request(f"{API}?key={quote(key, safe='')}", data=json.dumps(body).encode(),
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
    key = (os.environ.get("GOOGLE_API_KEY") or "").strip()
    if not key:
        result = no_key_check()
    else:
        try:
            result = check(run(key, args.origin, args.url))
        except Exception as e:  # invalid key, API disabled, network: report without the key, keep the unlock hint
            base = no_key_check()
            result = {**base, "evidence": {**base["evidence"], "error": str(e).replace(key, "***")[:300]}}
    Path(args.out).write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(f"{result['verdict']:>7}  tech.speed-field", file=sys.stderr)


if __name__ == "__main__":
    main()
