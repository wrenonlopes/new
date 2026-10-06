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


def test_unknown_when_rendered_page_is_empty():
    r = compare("u", page(10, []), page(0, []))
    assert r["verdict"] == "unknown"
    assert r["pages"] == ["u"]
