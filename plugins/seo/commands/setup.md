---
description: Set up the seo plugin for this project. Checks tools, detects the stack, writes .seo/profile.yaml, connects data sources, reports what is unlocked.
---

Load the `seo-system` skill. Run every step; re-running is safe (nothing is overwritten or duplicated). Never print or write credential values.

ROOT=${CLAUDE_PLUGIN_ROOT}, DATA=${CLAUDE_PLUGIN_DATA}, PROJECT=${CLAUDE_PROJECT_DIR}.

## 1. Tools

1. `sh "$ROOT/engines/ensure_node.sh" "$ROOT/node" "$DATA/node"`. The first run installs pinned Node tools and takes 1–3 minutes.
2. `uv run --script "$ROOT/engines/doctor.py" --root "$ROOT" --data "$DATA"`. Show only failed checks, with their `fix`.
   - Chromium missing → ask, then re-run with `--fix`.
   - squirrel privacy settings not off → ask the user, then run the `fix` command shown.
   - uv missing or Node below 22.18 → show the install command and stop.

## 2. Project state

1. `uv run --script "$ROOT/engines/project_setup.py" init --project "$PROJECT" --templates "$ROOT/templates"`.
2. `uv run --script "$ROOT/engines/project_setup.py" detect --project "$PROJECT"`. If `domain_candidates` is empty and the profile has no domain, ask for the production URL. Fetch the homepage once: `curl -sL --max-time 20 -o "$PROJECT/.seo/inputs/home.html" <url>`. Re-run detect with `--html "$PROJECT/.seo/inputs/home.html"`.
3. Fill `.seo/profile.yaml` with what was detected: `domain`, `stack.type`, `stack.framework`, `stack.rendering`, `stack.cms`. Add candidates from the live site: the homepage `<title>` as a brand-name candidate, and the homepage plus up to 5 main pages from `/sitemap.xml` as `key_urls`. Show these and ask the user to confirm.
4. In one grouped message, ask only for fields that are still empty: audience, conversions (with URLs), success_metric, competitors (3–5 domains), brand names, buyer prompts (5–10, in buyers' words), market regions and languages, approver. Never invent competitors, prompts or conversions; leave skipped fields empty.

## 3. Data connections (this project only, local scope; nothing is written to the repo)

Run `claude mcp get <name>` first and skip any server already registered. Register only servers whose credentials the doctor's `tier.sources` reports as present:

- search-console (`sources.search_console`):
  `claude mcp add --scope local search-console -e 'GSC_OAUTH_CLIENT_SECRETS_FILE=$''{GSC_OAUTH_CLIENT_SECRETS_FILE}' -- uvx --with 'cryptography<49' mcp-search-console@0.4.1`
- dataforseo (`sources.dataforseo`):
  `claude mcp add --scope local dataforseo -e 'DATAFORSEO_LOGIN=$''{DATAFORSEO_LOGIN}' -e 'DATAFORSEO_PASSWORD=$''{DATAFORSEO_PASSWORD}' -- npx -y dataforseo-mcp-server@3.1.1`
- squirrelscan (always):
  `claude mcp add --scope local squirrelscan -e NO_TELEMETRY=1 -- "$DATA/node/node_modules/squirrelscan/bin/squirrel" mcp`
- google-analytics (`sources.ga4` and `data_access.ga4_property` set):
  `claude mcp add --scope local google-analytics -- uvx analytics-mcp@0.7.0`

The `'$''{NAME}'` quoting stores a literal variable reference: no secret value is stored, and Claude Code expands it at start-up. New servers load in the next session, so tell the user to restart Claude Code in this folder. The plugin's hook enforces the safety guards in every project; there is nothing to configure: Search Console write tools, squirrelscan comments, DataForSEO Backlinks and Live, squirrel cloud flags.

## 4. Report

Credential tier (0, 1 or 2), what each connected source unlocks (seo-system "Tools and spend guards"), and the doctor's `next_step` for reaching the next tier. End with: "Next: /seo:audit".
