from types import SimpleNamespace

from raw_vs_rendered import compare, slug, summarize


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


def crawl_result(error, status=200, html="<html><body></body></html>"):
    return SimpleNamespace(success=False, status_code=status, html=html, error_message=error,
                           markdown="[Home](/)\n", links={})


def test_empty_js_shell_flagged_structural_is_kept_not_unknown():
    s = summarize(crawl_result("Blocked by anti-bot protection: Structural: minimal_text on small page (453 bytes, 4 chars visible)"), allow_shell=True)
    assert s["ok"] and s["words"] == 1
    assert compare("u", s, page(100, ["Pricing"]))["verdict"] == "fail"


def test_real_block_and_non_2xx_stay_unknown():
    assert not summarize(crawl_result("Blocked by anti-bot protection: Cloudflare challenge"), allow_shell=True)["ok"]
    assert not summarize(crawl_result("Blocked by anti-bot protection: Structural: minimal_text", status=403), allow_shell=True)["ok"]


def test_unmounted_js_shell_on_both_sides_is_unknown_not_pass():
    shell = "Blocked by anti-bot protection: Structural: minimal_text on small page (453 bytes, 4 chars visible)"
    r = compare("u", summarize(crawl_result(shell), allow_shell=True), summarize(crawl_result(shell)))
    assert r["verdict"] == "unknown"
