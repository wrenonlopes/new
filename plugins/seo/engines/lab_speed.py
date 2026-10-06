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
    elif failing:
        verdict = "fail"
    elif any(r["missing"] for r in routes):
        verdict = "unknown"  # no failure seen, but not every metric was measured
    else:
        verdict = "pass"
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
