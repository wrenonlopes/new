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


def test_headless_wordpress_front_end_stays_code(tmp_path):
    write(tmp_path / "package.json", json.dumps({"dependencies": {"next": "16"}}))
    html = tmp_path / "home.html"
    html.write_text('<img src="https://cms.test/wp-content/uploads/a.jpg">')
    d = detect(tmp_path, html)
    assert (d["stack_type"], d["framework"], d["cms"]) == ("code", "nextjs", "wordpress")


def test_bad_inputs_do_not_crash(tmp_path):
    (tmp_path / ".envs").mkdir()
    write(tmp_path / "package.json", "{not json")
    assert detect(tmp_path)["stack_type"] == "none"
    write(tmp_path / "package.json", json.dumps({"dependencies": None, "devDependencies": {"astro": "6"}}))
    assert detect(tmp_path)["framework"] == "astro"
    write(tmp_path / "package.json", "[]")
    assert detect(tmp_path)["stack_type"] == "none"


def test_credentials_and_paths_are_stripped_from_candidates(tmp_path):
    write(tmp_path / ".env", "SITE_URL=https://admin:hunter2@staging.test/path?token=abc\n")
    d = detect(tmp_path)
    assert d["domain_candidates"] == ["https://staging.test"]
    assert "hunter2" not in json.dumps(d) and "token" not in json.dumps(d)


def test_localhost_example_env_and_repo_homepages_are_dropped(tmp_path):
    write(tmp_path / "package.json", json.dumps({"homepage": "https://github.com/a/b", "dependencies": {"next": "16"}}))
    write(tmp_path / ".env.development", "NEXT_PUBLIC_SITE_URL=http://localhost:3000\n")
    write(tmp_path / ".env.example", "NEXT_PUBLIC_SITE_URL=https://example.test\n")
    assert detect(tmp_path)["domain_candidates"] == []


def test_rendering_values_fit_the_profile_enum(tmp_path):
    write(tmp_path / "package.json", json.dumps({"dependencies": {"next": "16"}}))
    assert detect(tmp_path)["rendering"] == "hybrid"
