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
