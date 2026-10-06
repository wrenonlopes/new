from doctor import parse_version, tier


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
