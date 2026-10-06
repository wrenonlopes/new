from types import SimpleNamespace

from site_graph import (crawl_failure, page_ok, depth_check, hreflang_check, hreflang_map, key, most_linked, norm, robots_check)

S = "https://s.test"


def pg(path, depth, hreflang=None, status=200, links=(), ok=None):
    if ok is None:
        ok = status is not None and status < 400
    return {"url": norm(S + path), "depth": depth, "parent": None, "ok": ok, "status": status,
            "links": [{"href": norm(S + l), "text": ""} for l in links], "hreflang": hreflang or {}}


def test_norm_drops_fragment_and_lowercases_host():
    assert norm("HTTPS://S.Test/a#x") == "https://s.test/a"
    assert norm("https://s.test") == "https://s.test/"


def test_hreflang_map_parses_alternates():
    html = '<link rel="alternate" hreflang="ar" href="/ar/"><link rel="canonical" href="/">'
    assert hreflang_map(html, S + "/") == {"ar": "https://s.test/ar/"}


def test_depth_fail_for_deep_target():
    pages = [pg("/", 0), pg("/deep", 5)]
    r = depth_check(pages, [S + "/deep"], complete=True)
    assert r["verdict"] == "fail" and r["pages"] == ["https://s.test/deep"] and r["heuristic"] is True


def test_depth_unreached_target_is_unknown_when_crawl_incomplete():
    r = depth_check([pg("/", 0)], [S + "/far"], complete=False)
    assert r["verdict"] == "unknown"


def test_depth_unreached_target_fails_when_crawl_complete():
    r = depth_check([pg("/", 0)], [S + "/orphan"], complete=True)
    assert r["verdict"] == "fail"


def test_depth_pass():
    assert depth_check([pg("/", 0), pg("/a", 2)], [S + "/a"], complete=True)["verdict"] == "pass"


def test_hreflang_missing_return_link_fails():
    en = pg("/en", 1, {"en": norm(S + "/en"), "ar": norm(S + "/ar")})
    ar = pg("/ar", 1, {"ar": norm(S + "/ar")})
    r = hreflang_check([en, ar])
    assert r["verdict"] == "fail" and r["pages"] == ["https://s.test/en"]


def test_hreflang_reciprocal_passes():
    en = pg("/en", 1, {"en": norm(S + "/en"), "ar": norm(S + "/ar")})
    ar = pg("/ar", 1, {"ar": norm(S + "/ar"), "en": norm(S + "/en")})
    assert hreflang_check([en, ar])["verdict"] == "pass"


def test_hreflang_invalid_code_fails():
    p = pg("/x", 1, {"english": norm(S + "/x")})
    assert hreflang_check([p])["verdict"] == "fail"


def test_robots_search_agent_blocked_fails():
    r = robots_check("User-agent: OAI-SearchBot\nDisallow: /\n", [S + "/"])
    assert r["verdict"] == "fail" and "OAI-SearchBot" in r["evidence"]["blocked_search"]


def test_robots_training_agent_blocked_is_info_only():
    r = robots_check("User-agent: GPTBot\nDisallow: /\n", [S + "/"])
    assert r["verdict"] == "pass" and "GPTBot" in r["evidence"]["blocked_training_only"]


def test_robots_unreadable_is_unknown():
    assert robots_check(None, [S + "/"])["verdict"] == "unknown"


def test_most_linked_counts_inbound():
    pages = [pg("/", 0, links=["/a", "/b", "/a"]), pg("/a", 1, links=["/b"]), pg("/b", 1)]
    assert most_linked(pages, 1) == ["https://s.test/b"] or most_linked(pages, 1) == ["https://s.test/a"]
    assert set(most_linked(pages, 2)) == {"https://s.test/a", "https://s.test/b"}


def test_key_canonicalises_but_norm_keeps_www():
    assert key("https://www.S.test:443/a/") == key("https://s.test/a")
    assert key("https://s.test/index.html") == key("https://s.test/")
    assert norm("https://www.s.test/a") == "https://www.s.test/a"


def test_depth_target_matches_despite_trailing_slash():
    assert depth_check([pg("/", 0), pg("/services/", 1)], [S + "/services"], complete=True)["verdict"] == "pass"


def test_depth_no_targets_truncated_crawl_is_unknown():
    assert depth_check([pg("/", 0), pg("/a", 1)], [], complete=False)["verdict"] == "unknown"


def test_depth_no_targets_complete_shallow_crawl_passes():
    assert depth_check([pg("/", 0), pg("/a", 1)], [], complete=True)["verdict"] == "pass"


def test_hreflang_unfetched_alternate_is_unknown():
    en = pg("/en", 1, {"en": norm(S + "/en"), "ar": norm(S + "/ar")})
    ar = pg("/ar", 1, status=None)
    assert hreflang_check([en, ar])["verdict"] == "unknown"


def test_robots_wildcard_and_end_anchor():
    txt = "User-agent: OAI-SearchBot\nDisallow: /*.html$\n"
    assert robots_check(txt, [S + "/page.html"])["verdict"] == "fail"
    assert robots_check(txt, [S + "/page.htm"])["verdict"] == "pass"


def test_robots_longest_match_allow_wins():
    txt = "User-agent: *\nDisallow: /\nAllow: /public/\n"
    assert robots_check(txt, [S + "/public/x"])["verdict"] == "pass"
    assert robots_check(txt, [S + "/private"])["verdict"] == "fail"


def test_robots_specific_group_overrides_star():
    txt = "User-agent: *\nDisallow: /\n\nUser-agent: Googlebot\nAllow: /\n"
    r = robots_check(txt, [S + "/"])
    assert "Googlebot" not in r["evidence"]["blocked_search"]
    assert "Bingbot" in r["evidence"]["blocked_search"]


def test_crawl_failure_reasons():
    assert crawl_failure([]) == "crawl returned no pages"
    assert "503" in crawl_failure([pg("/", 0, status=503)])
    assert crawl_failure([pg("/", 0)]) is None


def test_page_ok_keeps_a_2xx_empty_js_shell_but_not_a_404():
    shell = "Blocked by anti-bot protection: Structural: minimal_text on small page (453 bytes, 4 chars visible)"
    r = lambda ok, status, err="": SimpleNamespace(success=ok, status_code=status, html="<html><body></body></html>", error_message=err)
    assert page_ok(r(False, 200, shell))
    assert page_ok(r(True, 200))
    assert not page_ok(r(False, 404, "HTTP 404"))
    assert not page_ok(r(False, 200, "Blocked by anti-bot protection: Cloudflare challenge"))
