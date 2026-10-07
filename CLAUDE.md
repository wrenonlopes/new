# seo-tool: developer notes

This repo is the source and local marketplace of the `seo` Claude Code plugin.
Design: `docs/superpowers/specs/2026-10-05-seo-plugin-design.md`. Plans: `docs/superpowers/plans/`.
Operating rules (rule base, loop, check catalogue, spend guards) live in `plugins/seo/skills/seo-system/SKILL.md`. Edit them there, not here.

## Layout

- `.claude-plugin/marketplace.json`: marketplace `seo-tool` with one plugin, `./plugins/seo`.
- `plugins/seo/`: commands/, skills/, hooks/, engines/ (uv inline scripts), node/ (pinned Node tools + schema_check.mjs), data/, templates/, tests/, NOTICE.
- `tests/`: fixture site and end-to-end scripts (`e2e_audit.sh`, `e2e_fix.sh`; they use Claude usage).
- `.claude/skills/`: the full vendored marketing skill set for this repo only (the plugin carries a subset).
- `pyproject.toml`, `uv.lock`: dev environment for the Python tests (engines carry their own inline pins).

## Work on the plugin

- Unit tests: `uv run pytest plugins/seo/tests -q` and `(cd plugins/seo/node && npm ci --no-fund --no-audit >/dev/null) && node --test "plugins/seo/node/*.test.mjs"`.
- Edits apply on the next session or `/reload-plugins` (the plugin is installed from this folder).
- Pins: Python pins in each engine's `# /// script` header; Node pins in `plugins/seo/node/package.json` (exact); skills by commit in `plugins/seo/NOTICE`. Bump deliberately and re-check the rule base each quarter.
- New skill or plugin: `skillspector scan <path> --no-llm`, show the result, then vendor.
- Engines that use Crawl4AI must print its attribution line in `--help`.
