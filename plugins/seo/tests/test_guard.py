import json
import subprocess
from pathlib import Path

from guard import decide

HOOKS = Path(__file__).resolve().parents[1] / "hooks"


def ev(tool, **inp):
    return {"tool_name": tool, "tool_input": inp}


def test_gsc_write_tools_denied():
    for t in ["add_site", "delete_site", "submit_sitemap", "delete_sitemap", "manage_sitemaps"]:
        assert decide(ev(f"mcp__search-console__{t}"))[0] == "deny"


def test_gsc_read_tool_allowed():
    assert decide(ev("mcp__search-console__get_search_analytics")) is None


def test_squirrel_comment_denied():
    assert decide(ev("mcp__squirrelscan__comment_on_issue"))[0] == "deny"


def test_dataforseo_backlinks_denied_by_path_or_url():
    assert decide(ev("mcp__dataforseo__api_request", method="POST", path="/v3/backlinks/summary/live"))[0] == "deny"
    assert decide(ev("mcp__dataforseo__api_request", method="POST",
                     url="https://api.dataforseo.com/v3/backlinks/domain_intersection/live"))[0] == "deny"


def test_dataforseo_live_asks():
    d = decide(ev("mcp__dataforseo__api_request", method="POST",
                  path="/v3/dataforseo_labs/google/ranked_keywords/live"))
    assert d[0] == "ask" and "cost" in d[1]
    assert decide(ev("mcp__dataforseo__api_request", method="POST",
                     path="/v3/serp/google/organic/live/advanced"))[0] == "ask"


def test_dataforseo_standard_and_free_allowed():
    assert decide(ev("mcp__dataforseo__api_request", method="POST", path="/v3/serp/google/organic/task_post")) is None
    assert decide(ev("mcp__dataforseo__api_request", method="GET", path="/v3/appendix/user_data")) is None


def test_squirrel_cloud_flags_denied():
    sq = "NO_TELEMETRY=1 /d/node/node_modules/squirrelscan/bin/squirrel"
    for cmd in [f"{sq} auth login", f"{sq} keys list", f"{sq} audit https://a.test --render",
                f"{sq} audit https://a.test --render-mode auto", f"{sq} audit https://a.test -y",
                f"{sq} report a.test --publish", f"{sq} report a.test -p"]:
        assert decide(ev("Bash", command=cmd))[0] == "deny", cmd


def test_squirrel_local_audit_and_other_segments_allowed():
    sq = "/d/node/node_modules/squirrelscan/bin/squirrel"
    ok = [f"{sq} audit https://a.test -C full --render-mode off -f json -o out.json",
          f"mkdir -p out && {sq} audit https://a.test --render-mode=off -f json -o out/s.json",
          f"{sq} --version", "npx -y unlighthouse-ci --site https://a.test", "mkdir -p x"]
    for cmd in ok:
        assert decide(ev("Bash", command=cmd)) is None, cmd


def test_hook_runs_on_system_python_and_prints_json():
    out = subprocess.run(["/usr/bin/python3", str(HOOKS / "guard.py")],
                         input=json.dumps(ev("mcp__search-console__delete_site")),
                         capture_output=True, text=True, check=True).stdout
    assert json.loads(out)["hookSpecificOutput"]["permissionDecision"] == "deny"


def test_bash_prefilter_skips_unrelated_commands():
    out = subprocess.run(["sh", str(HOOKS / "bash_guard.sh")],
                         input=json.dumps(ev("Bash", command="ls -la")), capture_output=True, text=True, check=True)
    assert out.stdout == ""
    out = subprocess.run(["sh", str(HOOKS / "bash_guard.sh")],
                         input=json.dumps(ev("Bash", command="squirrel auth login")), capture_output=True, text=True, check=True)
    assert json.loads(out.stdout)["hookSpecificOutput"]["permissionDecision"] == "deny"
