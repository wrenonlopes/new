# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///
"""Project setup helpers for the seo plugin.

  init    create <project>/.seo/ from the templates (never overwrites existing files)
  detect  guess stack type, framework, rendering mode, CMS and site URL candidates

Detection reads package.json, framework config files, CNAME and .env* files. From .env*
files only site-URL keys are read; no other value leaves this script.

Usage:
  uv run --script project_setup.py init --project DIR --templates DIR
  uv run --script project_setup.py detect --project DIR [--html FILE]
"""

import argparse
import json
import re
import shutil
from pathlib import Path
from urllib.parse import urlsplit

SUBDIRS = ["reports", "content", "offpage", "visibility", "briefs", "handoff", "inputs"]
GITIGNORE = "# Written by the seo plugin\nreports/*/raw/\ninputs/\n"
# (dependency, framework, rendering) in priority order: frameworks before plain libraries.
FRAMEWORKS = [
    ("next", "nextjs", "hybrid"),
    ("nuxt", "nuxt", "hybrid"),
    ("astro", "astro", "ssg"),
    ("@sveltejs/kit", "sveltekit", "hybrid"),
    ("gatsby", "gatsby", "ssg"),
    ("@remix-run/react", "remix", "ssr"),
    ("vite-ssg", "vue", "ssg"),
    ("vue", "vue", "csr"),
    ("react", "react", "csr"),
]
CONFIG_FILES = [("hugo.toml", "hugo"), ("hugo.yaml", "hugo"), ("_config.yml", "jekyll")]
HTML_MARKERS = [("wp-content/", "wordpress"), ("cdn.shopify.com", "shopify"), ("static.wixstatic.com", "wix"),
                ("squarespace.com", "squarespace"), ("website-files.com", "webflow")]
SITE_URL_KEYS = re.compile(
    r"^\s*(?:NEXT_PUBLIC_SITE_URL|PUBLIC_SITE_URL|SITE_URL|NUXT_PUBLIC_SITE_URL|VITE_SITE_URL)\s*=\s*['\"]?(https?://[^'\"\s]+)",
    re.M)
CONFIG_SITE = re.compile(r"\b(?:site|siteUrl)\s*:\s*['\"](https?://[^'\"]+)['\"]")
NOT_SITES = {"localhost", "127.0.0.1", "0.0.0.0", "::1", "github.com", "gitlab.com", "www.npmjs.com", "npmjs.com"}


def _read(path):
    try:
        return path.read_text(errors="ignore")
    except OSError:
        return None


def site_root(url):
    """scheme://host[:port] only: drops credentials, path, query and fragment. None if not a public site."""
    try:
        p = urlsplit(url.strip())
        port = p.port
    except ValueError:
        return None
    if "@" in url and "@" not in p.netloc:
        return None  # unencoded userinfo ('#', '?' or '/' in a password) would leak into the host
    if p.scheme not in ("http", "https") or not p.hostname or p.hostname in NOT_SITES:
        return None
    host = f"[{p.hostname}]" if ":" in p.hostname else p.hostname  # IPv6 keeps its brackets
    return f"{p.scheme}://{host}" + (f":{port}" if port else "")


def init(project, templates):
    seo = Path(project) / ".seo"
    created = []
    for d in SUBDIRS:
        (seo / d).mkdir(parents=True, exist_ok=True)
    for name in ("profile.yaml", "change-log.md"):
        dst = seo / name
        if not dst.exists():
            shutil.copyfile(Path(templates) / name, dst)
            created.append(str(dst))
    gitignore = seo / ".gitignore"
    if not gitignore.exists():
        gitignore.write_text(GITIGNORE)
        created.append(str(gitignore))
    return {"seo_dir": str(seo), "created": created}


def detect(project, html=None):
    p = Path(project)
    evidence, domains = [], []
    framework = rendering = cms = None

    pkg = p / "package.json"
    if pkg.is_file():
        try:
            data = json.loads(_read(pkg) or "")
        except ValueError:
            data = None
        if not isinstance(data, dict):
            evidence.append("package.json unreadable")
            data = {}
        deps = {}
        for field in ("dependencies", "devDependencies"):
            if isinstance(data.get(field), dict):
                deps.update(data[field])
        for dep, fw, rend in FRAMEWORKS:
            if dep in deps:
                framework, rendering = fw, rend
                evidence.append(f"package.json depends on {dep}")
                if fw == "nextjs":
                    evidence.append("Next.js: content in 'use client' components renders in the browser; check raw HTML")
                break
        if isinstance(data.get("homepage"), str):
            domains.append(data["homepage"])

    for name, fw in CONFIG_FILES:
        if not framework and (p / name).exists():
            framework, rendering = fw, "ssg"
            evidence.append(f"found {name}")
    wp_files = (p / "wp-config.php").exists() or (p / "wp-content").is_dir()
    if wp_files:
        cms = "wordpress"
        evidence.append("found WordPress files")

    for cfg in sorted(p.glob("astro.config.*")) + sorted(p.glob("next-sitemap.config.*")):
        domains += CONFIG_SITE.findall(_read(cfg) or "")
    cname = p / "CNAME"
    name = (_read(cname) or "").strip()
    if name:
        domains.append("https://" + name)
    for env_file in sorted(f for f in p.glob(".env*") if f.is_file() and f.name != ".env.example"):
        domains += SITE_URL_KEYS.findall(_read(env_file) or "")

    if not framework and not cms and any(p.glob("*.html")):
        framework, rendering = "static-html", "static"
        evidence.append("found *.html at the project root")

    if html:
        text = _read(Path(html)) or ""
        for marker, name in HTML_MARKERS:
            if marker in text and not cms:
                cms = name
                evidence.append(f"live HTML contains {marker}")

    if wp_files or (cms and framework is None):
        stack_type = "cms"
    elif framework:
        stack_type = "code"  # an HTML-detected CMS behind a code front end (headless) stays code
    else:
        stack_type = "none"
        evidence.append("no framework, CMS or HTML found at the project root; set stack.repo if the code lives elsewhere")
    unique = list(dict.fromkeys(r for r in (site_root(d) for d in domains) if r))
    return {"stack_type": stack_type, "framework": framework, "rendering": rendering, "cms": cms,
            "domain_candidates": unique, "evidence": evidence}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("init")
    a.add_argument("--project", required=True)
    a.add_argument("--templates", required=True)
    b = sub.add_parser("detect")
    b.add_argument("--project", required=True)
    b.add_argument("--html")
    args = ap.parse_args()
    result = init(args.project, args.templates) if args.cmd == "init" else detect(args.project, args.html)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
