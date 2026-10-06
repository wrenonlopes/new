from prompt_runner import score

PROFILE = {"domain": "example.com", "competitors": ["rival.com"], "brand": {"names": ["Example Co"]}}


def test_score_verdicts_and_lookalike_domain():
    res = score(PROFILE, "claude", [
        {"prompt": "a", "answer": "Example Co", "citations": ["https://www.example.com/x", "https://rival.com"]},
        {"prompt": "b", "answer": "none", "citations": ["https://notexample.com"]},
        {"prompt": "c", "answer": "", "citations": []},
    ])
    assert [r["verdict"] for r in res["results"]] == ["pass", "fail", "unknown"]
    assert res["results"][0]["competitors_cited"] == ["rival.com"]
    assert res["summary"] == {"platform": "claude", "prompts": 3, "answered": 2,
                              "mention_rate": 0.5, "citation_rate": 0.5}
