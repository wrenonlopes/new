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
