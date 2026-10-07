import json
import re
import subprocess
from pathlib import Path

from guard import decide, READ_ONLY

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
    ok = [f"{sq} audit https://a.test -C full --render-mode off --offline -f json -o out.json",
          f"mkdir -p out && {sq} audit https://a.test --render-mode=off --offline -f json -o out/s.json",
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


def test_global_config_flag_does_not_bypass_auth_keys():
    sq = "/d/node/node_modules/squirrelscan/bin/squirrel"
    for cmd in [f"{sq} -c cfg.toml auth login", f"{sq} --config-file cfg.toml keys list"]:
        assert decide(ev("Bash", command=cmd))[0] == "deny", cmd


def test_wrapped_and_equals_flags_are_denied():
    sq = "/d/node/node_modules/squirrelscan/bin/squirrel"
    for cmd in [f"sh -c '{sq} audit https://a.test -y'", f'bash -c "{sq} report a.test -p"',
                f"{sq} audit https://a.test --yes=true", f"sh -c '{sq} report a.test --publish'"]:
        assert decide(ev("Bash", command=cmd))[0] == "deny", cmd


def test_auth_in_a_url_is_not_a_subcommand():
    sq = "/d/node/node_modules/squirrelscan/bin/squirrel"
    assert decide(ev("Bash", command=f"{sq} audit https://a.test/auth -C full --render-mode off --offline")) is None


def test_hooks_json_matcher_covers_every_guarded_tool():
    config = json.loads((HOOKS / "hooks.json").read_text())
    matcher = config["hooks"]["PreToolUse"][0]["matcher"]
    for name in sorted(READ_ONLY) + ["mcp__dataforseo__api_request", "mcp__squirrelscan__audit_website"]:
        assert re.fullmatch(matcher, name), name
    assert not re.fullmatch(matcher, "mcp__search-console__get_sitemaps")
    assert not re.fullmatch(matcher, "mcp__squirrelscan__quick_check")


def test_malformed_event_fails_closed():
    for payload in ["null", "[]", json.dumps({"tool_name": "Bash", "tool_input": {"command": ["squirrel", "auth"]}})]:
        out = subprocess.run(["/usr/bin/python3", str(HOOKS / "guard.py")], input=payload,
                             capture_output=True, text=True, check=True).stdout
        assert json.loads(out)["hookSpecificOutput"]["permissionDecision"] == "deny", payload


SQ = "/d/node/node_modules/squirrelscan/bin/squirrel"


def test_audit_and_crawl_need_offline():
    for cmd in [f"NO_TELEMETRY=1 {SQ} audit https://a.test -C full --render-mode off -f json -o o.json",
                f"{SQ} crawl https://a.test", f"{SQ} audit https://a.test --offline=false"]:
        d = decide(ev("Bash", command=cmd))
        assert d[0] == "deny" and "--offline" in d[1], cmd
    for cmd in [f"NO_TELEMETRY=1 {SQ} audit https://a.test -C full --render-mode off --offline -f json -o o.json",
                f"{SQ} crawl https://a.test --offline", f"{SQ} report a.test --diff 1a2b3c4d -f json"]:
        assert decide(ev("Bash", command=cmd)) is None, cmd


def test_mcp_audit_website_needs_offline_true():
    assert decide(ev("mcp__squirrelscan__audit_website", url="https://a.test", offline=True)) is None
    for inp in [{}, {"offline": False}, {"offline": "true"}]:
        assert decide(ev("mcp__squirrelscan__audit_website", url="https://a.test", **inp))[0] == "deny", inp
    assert decide(ev("mcp__squirrelscan__quick_check", url="https://a.test")) is None


def test_line_continuations_and_combined_short_flags():
    assert decide(ev("Bash", command=f"{SQ} audit a.test --offline \\\n -y"))[0] == "deny"
    assert decide(ev("Bash", command=f"{SQ} audit a.test \\\n --offline -C full --render-mode off -f json")) is None
    for flags in ["-yp", "-py", "-yC full", "-Cy full"]:
        assert decide(ev("Bash", command=f"{SQ} audit a.test --offline {flags}"))[0] == "deny", flags
    assert decide(ev("Bash", command=f"{SQ} report a.test -lp"))[0] == "deny"


def test_squirrel_through_a_variable():
    for cmd in [f'SQ={SQ}; NO_TELEMETRY=1 "$SQ" audit https://a.test --offline -y',
                f"SQ={SQ}\n$SQ auth login", f"SQ={SQ} && ${{SQ}} audit https://a.test"]:
        assert decide(ev("Bash", command=cmd))[0] == "deny", cmd
    assert decide(ev("Bash", command=f'SQ={SQ}; "$SQ" audit https://a.test --offline -C full')) is None
    assert decide(ev("Bash", command='X=/bin/ls; "$X" -p')) is None  # no squirrel anywhere
