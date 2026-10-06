---
description: Keyword research + site structure for a project (Phase 2). Uses DataForSEO as the single keyword source.
argument-hint: <project-name>
---

Run the operating loop in CLAUDE.md for project `$ARGUMENTS`, modules Keyword research and Site structure. `RUN=projects/$ARGUMENTS/reports/<today>`.

## Keyword research

Work per language in `market.languages`. Never merge languages into one list.

1. **Audience problem.** Restate the `audience` field as the problems buyers are trying to solve. Use the `content-strategy` skill.
2. **Seeds.** Collect from, in order: Search Console queries (last 3 months, if connected); the profile's `buyer_prompts`; Google Autocomplete and People Also Ask through SearXNG (`curl "http://127.0.0.1:8888/search?q=...&format=json"`, and `http://127.0.0.1:8888/autocompleter?q=...`); competitor pages from the profile.
3. **Volumes and difficulty.** DataForSEO only, via the `dataforseo` MCP. Before calling, state the number of keywords and the estimated cost and wait for a yes. Use the Standard queue unless the user asks for Live. Location and language from `market`. Log calls and cost in `change-log.md` under Run costs. If DataForSEO is not set up, volumes are `unknown`. Never fill them from another tool's difficulty scale.
4. **Cross-check.** If the user supplies Keyword Planner ranges, show them next to DataForSEO volumes as a sanity check only.
5. **Intent split.** Label each keyword informational, commercial, transactional or navigational, from the live SERP (what ranks), not from the wording alone.
6. **Own page or section.** Group keywords whose SERPs share most top results. Each group is one page; a keyword whose SERP matches an existing group is a section of that page.

Write `$RUN/keywords.csv`: language, keyword, volume, difficulty (DataForSEO), intent, group, target page (existing URL or "new"), source.

## Site structure

Use the `site-architecture` skill, plus `programmatic-seo` if one pattern repeats across many groups (e.g. service × area).

- `$RUN/page-map.md`: every group → one URL (existing or new), its parent, click depth from home, and the internal links it should receive and give.
- Checks, in the check format: Does every high-value group have exactly one target page? Are any two pages competing for the same group? Is every conversion page reachable within three clicks (heuristic)?

Add missing pages and cannibalization fixes to `$RUN/fix-queue.md`, ranked per CLAUDE.md, then continue with steps 5–7 of the loop. Store the keyword set summary under `research` in `baseline.json`.
