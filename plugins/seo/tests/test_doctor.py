import json

import doctor
from doctor import parse_version, tier, checks


def test_parse_version():
    assert parse_version("v24.20.0") == (24, 20, 0)
    assert parse_version("squirrel 0.0.98\n") == (0, 0, 98)
    assert parse_version("") is None


def test_tier_zero_without_credentials(tmp_path):
    t = tier({}, tmp_path)
    assert t["tier"] == 0 and "GSC_OAUTH_CLIENT_SECRETS_FILE" in t["next_step"]


def test_tier_one_needs_existing_secrets_file(tmp_path):
    assert tier({"GSC_OAUTH_CLIENT_SECRETS_FILE": str(tmp_path / "missing.json")}, tmp_path)["tier"] == 0
    f = tmp_path / "client.json"
    f.write_text("{}")
    assert tier({"GSC_OAUTH_CLIENT_SECRETS_FILE": str(f)}, tmp_path)["tier"] == 1


def test_tier_two_and_sources(tmp_path):
    f = tmp_path / "client.json"
    f.write_text("{}")
    env = {"GSC_OAUTH_CLIENT_SECRETS_FILE": str(f), "DATAFORSEO_LOGIN": "a", "DATAFORSEO_PASSWORD": "b",
           "GOOGLE_API_KEY": "k"}
    t = tier(env, tmp_path)
    assert t["tier"] == 2 and t["sources"]["crux"] is True and t["sources"]["gemini"] is False


def test_ga4_from_adc_file(tmp_path):
    adc = tmp_path / ".config/gcloud/application_default_credentials.json"
    adc.parent.mkdir(parents=True)
    adc.write_text("{}")
    assert tier({}, tmp_path)["sources"]["ga4"] is True


def test_tier_output_never_contains_credential_values(tmp_path):
    f = tmp_path / "client.json"
    f.write_text("{}")
    env = {"GSC_OAUTH_CLIENT_SECRETS_FILE": str(f), "DATAFORSEO_LOGIN": "login-value-123",
           "DATAFORSEO_PASSWORD": "pw-value-456", "GOOGLE_API_KEY": "key-value-789", "GEMINI_API_KEY": "gem-value-000"}
    out = json.dumps(tier(env, tmp_path))
    for value in ["login-value-123", "pw-value-456", "key-value-789", "gem-value-000"]:
        assert value not in out


def test_checks_survive_broken_state_files(tmp_path, monkeypatch):
    root, data, home = tmp_path / "root", tmp_path / "data", tmp_path / "home"
    (root / "data").mkdir(parents=True)
    (root / "data/schemaorg.sha256").write_text("")  # empty hash file
    (home / ".squirrel").mkdir(parents=True)
    (home / ".squirrel/settings.json").write_text("{not json")
    ul = data / "node/node_modules/unlighthouse-ci"
    ul.mkdir(parents=True)
    (ul / "package.json").write_text("{not json")
    monkeypatch.setattr(doctor.Path, "home", classmethod(lambda cls: home))
    monkeypatch.setattr(doctor, "chromium_path", lambda: None)
    items, chromium = checks(str(root), str(data), fix=False)
    by_name = {i["name"]: i for i in items}
    assert by_name["schema.org vocabulary"]["ok"] is False
    assert by_name["squirrel privacy settings"]["ok"] is False
    assert by_name["squirrel signed out"]["ok"] is False
    assert by_name["unlighthouse-ci 0.19.1"]["ok"] is False
    assert chromium is None


def test_signed_in_squirrel_fails_without_printing_auth(tmp_path, monkeypatch):
    root, home = tmp_path / "root", tmp_path / "home"
    (root / "data").mkdir(parents=True)
    (root / "data/schemaorg.sha256").write_text("x")
    (home / ".squirrel").mkdir(parents=True)
    settings = home / ".squirrel/settings.json"
    monkeypatch.setattr(doctor.Path, "home", classmethod(lambda cls: home))
    monkeypatch.setattr(doctor, "chromium_path", lambda: None)
    settings.write_text(json.dumps({"auth": {"token": "tok-secret-123"}, "auto_update": False, "telemetry": False}))
    items, _ = checks(str(root), str(tmp_path / "data"), fix=False)
    item = {i["name"]: i for i in items}["squirrel signed out"]
    assert item["ok"] is False and "auth logout" in item["fix"]
    assert "tok-secret-123" not in json.dumps(items)
    settings.write_text(json.dumps({"auth": None}))
    items, _ = checks(str(root), str(tmp_path / "data"), fix=False)
    assert {i["name"]: i for i in items}["squirrel signed out"]["ok"] is True
    assert "python3" in {i["name"] for i in items}
