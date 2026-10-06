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

SUBDIRS = ["reports", "content", "offpage", "visibility", "briefs", "handoff", "inputs"]
GITIGNORE = "# Written by the seo plugin\nreports/*/raw/\ninputs/\n"
# (dependency, framework, rendering) in priority order: frameworks before plain libraries.
FRAMEWORKS = [
    ("next", "nextjs", "ssr/ssg (check 'use client' content)"),
    ("nuxt", "nuxt", "ssr/ssg"),
    ("astro", "astro", "ssg"),
    ("@sveltejs/kit", "sveltekit", "ssr/ssg"),
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
CONFIG_SITE = re.compile(r"(?:site|siteUrl)\s*:\s*['\"](https?://[^'\"]+)['\"]")


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
    if pkg.exists():
        data = json.loads(pkg.read_text())
        deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
        for dep, fw, rend in FRAMEWORKS:
            if dep in deps:
                framework, rendering = fw, rend
                evidence.append(f"package.json depends on {dep}")
                break
        if str(data.get("homepage", "")).startswith("http"):
            domains.append(data["homepage"])

    for name, fw in CONFIG_FILES:
        if not framework and (p / name).exists():
            framework, rendering = fw, "ssg"
            evidence.append(f"found {name}")
    if (p / "wp-config.php").exists() or (p / "wp-content").is_dir():
        cms = "wordpress"
        evidence.append("found WordPress files")

    for cfg in sorted(p.glob("astro.config.*")) + sorted(p.glob("next-sitemap.config.*")):
        domains += CONFIG_SITE.findall(cfg.read_text(errors="ignore"))
    cname = p / "CNAME"
    if cname.exists() and cname.read_text().strip():
        domains.append("https://" + cname.read_text().strip())
    for env_file in sorted(p.glob(".env*")):
        domains += SITE_URL_KEYS.findall(env_file.read_text(errors="ignore"))

    if not framework and not cms and any(p.glob("*.html")):
        framework, rendering = "static-html", "static"
        evidence.append("found *.html at the project root")

    if html:
        text = Path(html).read_text(errors="ignore")
        for marker, name in HTML_MARKERS:
            if marker in text and not cms:
                cms = name
                evidence.append(f"live HTML contains {marker}")

    if cms and framework is None:
        stack_type = "cms"
    elif framework:
        stack_type = "code"
    else:
        stack_type = "none"
    if cms == "wordpress":
        stack_type = "cms"
    unique = list(dict.fromkeys(d.rstrip("/") for d in domains))
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
