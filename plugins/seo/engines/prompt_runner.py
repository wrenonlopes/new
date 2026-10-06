# /// script
# requires-python = ">=3.12"
# dependencies = [
#   "google-genai==2.25.0",
#   "pyyaml==6.0.3",
#   "cryptography<49; sys_platform == 'darwin' and platform_machine == 'x86_64'",
# ]
# ///
"""AI visibility prompt runner.

Question per prompt and platform: are we mentioned, and is our domain cited?
Each platform is scored and stored on its own; results are never blended
(91% of citations appear on only one platform).

  gemini    run the profile's buyer prompts through the Gemini API with
            Google Search grounding (needs GEMINI_API_KEY)
  template  write a blank answers file for a manual platform
            (chatgpt, perplexity) or for Claude Code's own web-search run
  score     score a filled answers file: [{prompt, answer, citations: [url]}]

Usage:
  uv run --script prompt_runner.py gemini   --profile projects/X/profile.yaml --out-dir DIR
  uv run --script prompt_runner.py template --profile projects/X/profile.yaml --platform chatgpt --out FILE
  uv run --script prompt_runner.py score    --profile projects/X/profile.yaml --platform chatgpt --answers FILE --out-dir DIR
"""

import argparse
import json
import os
import sys
from pathlib import Path
from urllib.parse import urlparse

import yaml


def host(url):
    h = urlparse(url if "://" in url else f"https://{url}").hostname or ""
    return h.removeprefix("www.")


def on(h, domain):
    return h == domain or h.endswith("." + domain)


def score(profile, platform, answers):
    domain = host(profile["domain"])
    names = [n.lower() for n in profile.get("brand", {}).get("names", [])] or [domain.split(".")[0]]
    competitors = [host(c) for c in profile.get("competitors", [])]

    rows = []
    for a in answers:
        text = (a.get("answer") or "").lower()
        cited = [c for c in a.get("citations", []) if c]
        cited_hosts = [host(c) for c in cited]
        rows.append({
            "prompt": a["prompt"],
            "platform": platform,
            "question": "Are we mentioned, and is our domain cited?",
            "verdict": "unknown" if not a.get("answer") else (
                "pass" if any(on(h, domain) for h in cited_hosts) else "fail"),
            "brand_mentioned": any(n in text for n in names),
            "domain_cited": any(on(h, domain) for h in cited_hosts),
            "own_pages_cited": [c for c, h in zip(cited, cited_hosts) if on(h, domain)],
            "competitors_cited": sorted({c for c in competitors if any(on(h, c) for h in cited_hosts)}),
            "competitors_mentioned": sorted({c for c in competitors if c.split(".")[0] in text}),
            "citations": cited,
            "answer": a.get("answer"),
            "run_by": a.get("run_by", platform),
        })
    answered = [r for r in rows if r["verdict"] != "unknown"]
    summary = {
        "platform": platform,
        "prompts": len(rows),
        "answered": len(answered),
        "mention_rate": round(sum(r["brand_mentioned"] for r in answered) / len(answered), 2) if answered else None,
        "citation_rate": round(sum(r["domain_cited"] for r in answered) / len(answered), 2) if answered else None,
    }
    return {"summary": summary, "results": rows}


def run_gemini(prompts, model):
    from google import genai
    from google.genai import types

    client = genai.Client()  # reads GEMINI_API_KEY
    cfg = types.GenerateContentConfig(tools=[types.Tool(google_search=types.GoogleSearch())])
    answers = []
    for prompt in prompts:
        try:
            resp = client.models.generate_content(model=model, contents=prompt, config=cfg)
        except Exception as e:  # rate limit or quota: record as unknown, keep going
            answers.append({"prompt": prompt, "answer": None, "citations": [], "error": str(e)[:300]})
            continue
        meta = resp.candidates[0].grounding_metadata if resp.candidates else None
        chunks = (meta.grounding_chunks or []) if meta else []
        # Grounding URIs are Google redirect links; the chunk title carries the source domain.
        citations = [c.web.title if c.web.title and "." in c.web.title else c.web.uri for c in chunks if c.web]
        answers.append({"prompt": prompt, "answer": resp.text, "citations": citations, "run_by": f"gemini-api:{model}"})
    return answers


def write(out_dir, platform, data):
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"{platform}.json"
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    s = data["summary"]
    print(f"{platform}: {s['answered']}/{s['prompts']} answered, "
          f"mention {s['mention_rate']}, citation {s['citation_rate']} -> {path}", file=sys.stderr)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("mode", choices=["gemini", "template", "score"])
    p.add_argument("--profile", required=True)
    p.add_argument("--platform", help="chatgpt | perplexity | claude | ...")
    p.add_argument("--answers", help="filled answers file (score mode)")
    p.add_argument("--out", help="template output file")
    p.add_argument("--out-dir", help="results directory")
    p.add_argument("--model", default=os.environ.get("GEMINI_MODEL", "gemini-flash-latest"))
    args = p.parse_args()

    profile = yaml.safe_load(Path(args.profile).read_text())
    prompts = profile.get("buyer_prompts") or sys.exit("profile has no buyer_prompts")

    if args.mode == "template":
        blank = [{"prompt": q, "answer": "", "citations": []} for q in prompts]
        Path(args.out).write_text(json.dumps(blank, indent=2, ensure_ascii=False))
    elif args.mode == "gemini":
        write(args.out_dir, "gemini", score(profile, "gemini", run_gemini(prompts, args.model)))
    else:
        answers = json.loads(Path(args.answers).read_text())
        write(args.out_dir, args.platform, score(profile, args.platform, answers))


if __name__ == "__main__":
    main()
