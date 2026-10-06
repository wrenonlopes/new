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
