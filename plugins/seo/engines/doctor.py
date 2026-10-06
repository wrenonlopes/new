# /// script
# requires-python = ">=3.12"
# dependencies = [
#   "crawl4ai==0.9.4",
#   "cryptography<49; sys_platform == 'darwin' and platform_machine == 'x86_64'",
# ]
# ///
"""Health checks for the seo plugin: tools, pins, privacy settings and credential tier.

Prints JSON: {"checks": [...], "tier": {...}, "chromium_path": ...}. Never prints credential values.
--fix installs Chromium for Crawl4AI if missing. --quick reports only the tier.

Usage: uv run --script doctor.py --root PLUGIN_ROOT --data PLUGIN_DATA [--fix] [--quick]

This product includes software developed by UncleCode (https://x.com/unclecode) as part of the Crawl4AI project (https://github.com/unclecode/crawl4ai).
"""

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

SQUIRREL_PIN = (0, 0, 98)
UNLIGHTHOUSE_PIN = "0.19.1"
NODE_MIN = (22, 18, 0)


def parse_version(text):
    m = re.search(r"(\d+)\.(\d+)\.(\d+)", text or "")
    return tuple(int(x) for x in m.groups()) if m else None


def tier(env, home):
    gsc = env.get("GSC_OAUTH_CLIENT_SECRETS_FILE", "")
    sources = {
        "search_console": bool(gsc) and Path(gsc).expanduser().is_file(),
        "crux": bool(env.get("GOOGLE_API_KEY")),
        "bing_webmaster": bool(env.get("BING_WEBMASTER_API_KEY")),
        "dataforseo": bool(env.get("DATAFORSEO_LOGIN") and env.get("DATAFORSEO_PASSWORD")),
        "gemini": bool(env.get("GEMINI_API_KEY")),
        "ga4": bool(env.get("GOOGLE_APPLICATION_CREDENTIALS"))
               or (Path(home) / ".config/gcloud/application_default_credentials.json").is_file(),
    }
    level = 2 if sources["search_console"] and sources["dataforseo"] else (1 if sources["search_console"] else 0)
    steps = {
        0: "Create a Google Cloud OAuth client (Desktop app) with the Search Console API enabled, then export "
           "GSC_OAUTH_CLIENT_SECRETS_FILE=<path to its JSON>.",
        1: "Open a DataForSEO account ($50 deposit, auto-recharge off) and export DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD.",
        2: "All core sources connected.",
    }
    return {"tier": level, "sources": sources, "next_step": steps[level]}


def _run(cmd, extra_env=None):
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=60, env={**os.environ, **(extra_env or {})})
        return (p.stdout + p.stderr).strip()
    except (OSError, subprocess.TimeoutExpired):
        return None


def _item(name, ok, detail, fix=""):
    return {"name": name, "ok": bool(ok), "detail": detail, "fix": fix if not ok else ""}


def chromium_path():
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        path = p.chromium.executable_path
    return path if path and Path(path).exists() else None


def checks(root, data, fix):
    ensure = f'sh "{root}/engines/ensure_node.sh" "{root}/node" "{data}/node"'
    out = [_item("uv", shutil.which("uv"), shutil.which("uv") or "not found",
                 "curl -LsSf https://astral.sh/uv/install.sh | sh")]
    nv = parse_version(_run(["node", "-v"]))
    out.append(_item("node >= 22.18", nv and nv >= NODE_MIN, "v" + ".".join(map(str, nv)) if nv else "not found",
                     "Install Node 22.18 or newer (e.g. brew install node)"))
    sq = Path(data) / "node/node_modules/squirrelscan/bin/squirrel"
    sv = parse_version(_run([str(sq), "--version"], {"NO_TELEMETRY": "1"})) if sq.exists() else None
    out.append(_item("squirrelscan 0.0.98", sv == SQUIRREL_PIN, f"{sv} at {sq}", ensure))
    settings_file = Path.home() / ".squirrel/settings.json"
    s = json.loads(settings_file.read_text()) if settings_file.exists() else {}
    out.append(_item("squirrel privacy settings", s.get("auto_update") is False and s.get("telemetry") is False,
                     f"auto_update={s.get('auto_update')} telemetry={s.get('telemetry')}",
                     f'NO_TELEMETRY=1 "{sq}" self settings set auto_update false && '
                     f'NO_TELEMETRY=1 "{sq}" self settings set telemetry false'))
    ul = Path(data) / "node/node_modules/unlighthouse-ci/package.json"
    ul_version = json.loads(ul.read_text()).get("version") if ul.exists() else None
    out.append(_item("unlighthouse-ci 0.19.1", ul_version == UNLIGHTHOUSE_PIN, ul_version or "missing", ensure))
    vocab = Path(root) / "data/schemaorg-all-https.jsonld"
    want = (Path(root) / "data/schemaorg.sha256").read_text().split()[0]
    have = hashlib.sha256(vocab.read_bytes()).hexdigest() if vocab.exists() else None
    out.append(_item("schema.org vocabulary", have == want, have or "missing",
                     "Restore data/schemaorg-all-https.jsonld from git"))
    chromium = chromium_path()
    if not chromium and fix:
        subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], check=False)
        chromium = chromium_path()
    out.append(_item("chromium", chromium, chromium or "missing", "Re-run doctor.py with --fix"))
    return out, chromium


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--root", required=True)
    ap.add_argument("--data", required=True)
    ap.add_argument("--fix", action="store_true")
    ap.add_argument("--quick", action="store_true")
    args = ap.parse_args()
    result = {"tier": tier(os.environ, Path.home())}
    if not args.quick:
        result["checks"], result["chromium_path"] = checks(args.root, args.data, args.fix)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
