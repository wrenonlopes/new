"""Offline checks for the engines' scoring logic. Run: uv run engines/test_engines.py"""

from raw_vs_rendered import compare
from prompt_runner import score


def page(words, h1, status=200):
    return {"ok": True, "status": status, "words": words, "h1": h1, "headings": h1,
            "internal_links": 3, "json_ld": False, "blocks": []}


assert compare("u", page(95, ["Hi"]), page(100, ["Hi"]))["verdict"] == "pass"
assert compare("u", page(40, ["Hi"]), page(100, ["Hi"]))["verdict"] == "fail"          # content only after JS
assert compare("u", page(100, []), page(100, ["Hi"]))["verdict"] == "fail"             # H1 injected by JS
assert compare("u", {"ok": False, "status": None, "error": "x"}, page(1, []))["verdict"] == "unknown"

profile = {"domain": "example.com", "competitors": ["rival.com"], "brand": {"names": ["Example Co"]}}
res = score(profile, "claude", [
    {"prompt": "a", "answer": "Example Co", "citations": ["https://www.example.com/x", "https://rival.com"]},
    {"prompt": "b", "answer": "none", "citations": ["https://notexample.com"]},              # lookalike domain
    {"prompt": "c", "answer": "", "citations": []},
])
assert [r["verdict"] for r in res["results"]] == ["pass", "fail", "unknown"]
assert res["results"][0]["competitors_cited"] == ["rival.com"]
assert res["summary"] == {"platform": "claude", "prompts": 3, "answered": 2, "mention_rate": 0.5, "citation_rate": 0.5}
print("ok")
