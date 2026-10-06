import json
from pathlib import Path

from project_setup import detect, init

TEMPLATES = Path(__file__).resolve().parents[1] / "templates"


def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text)


def test_init_creates_state_and_never_overwrites(tmp_path):
    first = init(tmp_path, TEMPLATES)
    seo = tmp_path / ".seo"
    assert (seo / "profile.yaml").exists() and (seo / "reports").is_dir()
    assert "reports/*/raw/" in (seo / ".gitignore").read_text()
    (seo / "profile.yaml").write_text("name: kept\n")
    second = init(tmp_path, TEMPLATES)
    assert (seo / "profile.yaml").read_text() == "name: kept\n"
    assert second["created"] == [] and len(first["created"]) == 3


def test_detect_nextjs(tmp_path):
    write(tmp_path / "package.json", json.dumps({"dependencies": {"next": "16.0.0", "react": "19"}}))
    d = detect(tmp_path)
    assert (d["stack_type"], d["framework"]) == ("code", "nextjs")


def test_detect_vite_react_is_csr(tmp_path):
    write(tmp_path / "package.json", json.dumps({"dependencies": {"react": "19"}, "devDependencies": {"vite": "7"}}))
    d = detect(tmp_path)
    assert d["framework"] == "react" and d["rendering"] == "csr"


def test_detect_hugo(tmp_path):
    write(tmp_path / "hugo.toml", "title = 'x'")
    assert detect(tmp_path)["framework"] == "hugo"


def test_detect_wordpress_repo_is_cms(tmp_path):
    write(tmp_path / "wp-config.php", "<?php")
    d = detect(tmp_path)
    assert (d["stack_type"], d["cms"]) == ("cms", "wordpress")


def test_detect_no_code_uses_live_html(tmp_path):
    html = tmp_path / "home.html"
    html.write_text('<link href="https://x.test/wp-content/themes/a.css">')
    project = tmp_path / "client"
    project.mkdir()
    d = detect(project, html)
    assert (d["stack_type"], d["cms"]) == ("cms", "wordpress")


def test_detect_empty_folder_is_none(tmp_path):
    assert detect(tmp_path)["stack_type"] == "none"


def test_detect_static_html(tmp_path):
    write(tmp_path / "index.html", "<h1>x</h1>")
    d = detect(tmp_path)
    assert (d["stack_type"], d["framework"]) == ("code", "static-html")


def test_env_files_yield_only_site_urls(tmp_path):
    write(tmp_path / "package.json", json.dumps({"dependencies": {"next": "16"}}))
    write(tmp_path / ".env.local", "DATABASE_URL=postgres://user:secretpw@db/x\nNEXT_PUBLIC_SITE_URL=https://shop.test\nAPI_KEY=sk-123\n")
    d = detect(tmp_path)
    assert d["domain_candidates"] == ["https://shop.test"]
    assert "secretpw" not in json.dumps(d) and "sk-123" not in json.dumps(d)


def test_cname_and_astro_site(tmp_path):
    write(tmp_path / "package.json", json.dumps({"dependencies": {"astro": "6"}}))
    write(tmp_path / "astro.config.mjs", "export default { site: 'https://blog.test' }")
    write(tmp_path / "CNAME", "blog.test\n")
    d = detect(tmp_path)
    assert d["framework"] == "astro"
    assert d["domain_candidates"] == ["https://blog.test"]
