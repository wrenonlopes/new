---
description: Technical + on-page SEO audit of this project's site, or of a local dev server, into a ranked fix queue.
argument-hint: "[--local http://localhost:3000]"
---

Load the `seo-system` skill and follow its operating loop. Use the `audit-website` and `seo-audit` skills to judge findings; the rule base wins on conflict.

ROOT=${CLAUDE_PLUGIN_ROOT}, DATA=${CLAUDE_PLUGIN_DATA}, P=${CLAUDE_PROJECT_DIR}/.seo

## 1. Load

- No `$P/profile.yaml` → run /seo:start instead and stop. Read `profile.yaml`, `baseline.json` (may be missing) and `change-log.md`.
- PROD = `https://<domain>` from the profile.
- If `$ARGUMENTS` contains `--local URL`: BASE = that URL and RUN = `$P/reports/<YYYY-MM-DD>-local`. Otherwise BASE = PROD and RUN = `$P/reports/<YYYY-MM-DD>`. RAW = `$RUN/raw`. Run `mkdir -p "$RAW"`.
- TARGETS = `key_urls` plus conversion URLs (relative ones joined to PROD), each rebased onto BASE by replacing PROD's scheme and host with BASE's.
- NODE = output of `sh "$ROOT/engines/ensure_node.sh" "$ROOT/node" "$DATA/node"`.
- CHROMIUM = `chromium_path` from `uv run --script "$ROOT/engines/doctor.py" --root "$ROOT" --data "$DATA"`.

## 2. Collect (run steps a to e in parallel; Unlighthouse runs last)

a. `NO_TELEMETRY=1 "$NODE/node_modules/squirrelscan/bin/squirrel" audit "$BASE" -C full --render-mode off -f json -o "$RAW/squirrel.json"`
b. `uv run --script "$ROOT/engines/site_graph.py" "$BASE" --targets "<TARGETS comma-separated>" --out "$RAW/site-graph.json" --checks-out "$RUN/site-graph-checks.json"`
c. After b: PAGES = TARGETS + `top_linked` from `$RAW/site-graph.json`, deduplicated, at most 20. Exclude pages whose site-graph `status` is not 2xx or whose `ok` is false; tech.broken covers them.
   - `uv run --script "$ROOT/engines/raw_vs_rendered.py" <PAGES> --out "$RAW/raw-vs-rendered.json" --save-markdown "$RAW/rendered"`
   - `node "$NODE/schema_check.mjs" --vocab "$ROOT/data/schemaorg-all-https.jsonld" --required "$ROOT/data/google-required-fields.json" --out "$RAW/schema.json" <PAGES>`
d. Production only (skip with `--local`): `uv run --script "$ROOT/engines/crux.py" --origin "$PROD" --url <each TARGET> --out "$RUN/field-speed.json"`.
e. Production only, and only if the `search-console` MCP is connected and `data_access.search_console` is set: URL Inspection for each TARGET (index status, `richResultsResult`), plus the last 28 days of top queries per TARGET. Save to `$RAW/gsc.json`. If not connected, the checks that need it are `unknown` with "connect Search Console (tier 1)".

Run Unlighthouse alone, after steps a to e have finished, so it does not skew lab numbers: write `$RAW/unlighthouse.config.ts` containing `export default { puppeteerOptions: { executablePath: '<CHROMIUM>' }, chrome: { useSystem: false, useDownloadFallback: false } }`. Then run `"$NODE/node_modules/.bin/unlighthouse-ci" --site "$BASE" --urls "<PAGES as root-relative paths, comma-separated>" --mobile --reporter jsonExpanded --output-path "$RAW/unlighthouse" --no-cache --config-file "$RAW/unlighthouse.config.ts"`, then `uv run --script "$ROOT/engines/lab_speed.py" "$RAW/unlighthouse/ci-result.json" --site "$BASE" --out "$RUN/lab-speed.json"`. If CHROMIUM is null, skip Unlighthouse and set tech.speed-lab to unknown with "Chromium missing: run /seo:setup".

## 3. Score → `$RUN/checks.yaml`

A YAML list with one entry per check id in the seo-system check catalogue, in the check format.

- Merging per-page engine results into one check: any page `fail` → `fail`; else any `unknown` → `unknown`; else `pass`. `pages` lists the failing pages (or, for `unknown`, the pages without evidence).
- An engine's `unknown`, error or non-zero exit stays `unknown` with the engine's reason. Never replace engine output with your own fetch or guess.
- Copy `rule` only from the seo-system check catalogue or rule base; otherwise omit it.
- **Engine checks:** copy them as they are.
  - tech.raw-html: merge the per-page results into one check whose `pages` lists failing pages and whose evidence is keyed per page.
  - tech.click-depth, tech.hreflang, tech.ai-crawler-access: from `site-graph-checks.json`.
  - tech.schema-valid, tech.schema-matches: merged per page from `schema.json`, plus Search Console `richResultsResult` issues when present.
  - tech.speed-lab, tech.speed-field.
- **squirrel issues:** map them with the seo-system prefix table into tech.crawl-index, tech.broken, tech.mobile, onpage.title-intent, onpage.meta, onpage.h1, onpage.alt and onpage.anchors. For tech.broken, `pages` = the broken URLs and the linking pages go in evidence.
- **Content checks:** judge onpage.h2-answers, onpage.answer-early and onpage.declarative-intro from `$RAW/rendered/*.md`. Quote the opening sentence, and each H2 with its first sentence, as evidence. Note the rule scope (ChatGPT) where the rule base gives one.
- **Verdicts:** come from evidence only. With no evidence the verdict is `unknown` and says what would resolve it.

## 4. Rank → `$RUN/fix-queue.md`

- **Top:** pass / fail / unknown counts per module.
- **Ranked fixes:** use the seo-system ranking. Each fix gives the failed question, the fix in one or two sentences, pages, evidence, where the fix is made (from `stack`), and the predicted outcome.
- **"Needs data":** unknown checks, each with what would resolve it.
- **"Other findings":** unmapped squirrel issues with squirrel's severity.

## 5. Baseline (production runs only; never for `-local`)

- **Previous run exists:** compare each check with it (newly failing, newly passing, still failing). Fill `Actual` in change-log rows whose check-after date has passed and whose check is in this audit.
- **Then write `baseline.json`:** set `audit` to the date, squirrel's overall and category scores, counts per verdict per module, per-check verdicts, and lab and field metrics. Leave other keys of `baseline.json` untouched.

Finish with the counts, the top 5 fixes, the path to `fix-queue.md`, and "Apply with /seo:fix top 5 (or pick check ids)".
