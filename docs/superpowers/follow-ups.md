# Plan 1 follow-ups

Open items from Plan 1's final review (2026-10-07). Pick these up in Plans 2–4.

## Fix soon (can give false verdicts)

- `site_graph.py`: a hub page that fails to fetch makes targets under it `fail`; they should be `unknown`.
- `crux.py`: rows tagged "origin-fallback" list each URL as failing, but the data is origin-level.
- `schema_check`: a bot-challenge page served with status 200 scores schema pass/pass.
- `raw_vs_rendered`: slug collisions can give a page another page's saved markdown.
- `setup.md`: pipes up to 200 KB of sitemap into the conversation. Extract the `<loc>` lines instead.

## Guard residuals (`hooks/guard.py`, a literal-text guardrail)

- A `$VAR` that holds the squirrel path, used after a prefix word (`env`, `timeout`, `do`, `(`), bypasses the squirrel rules.
- False denies:
  - `squirrel audit --help`;
  - `grep "squirrel audit"`;
  - `jq … > audit-summary.json`;
  - `diff -up` or `ls -lp` on squirrel.json.
- Deliberate obfuscation evades it:
  - a comment or quoted string holding `--offline`;
  - `sh -c '…' --offline`;
  - `--no-offline`.
- `squirrel feedback`, `skills` and `self` are not guarded.
- Doctor's `python3` check finds the macOS `/usr/bin/python3` stub even without the Command Line Tools.

## Can wait

- Detection gaps in `project_setup.py`:
  - `.env.sample`;
  - loopback variants;
  - `@` in a URL path drops the candidate.
- fix-recipes has no redirect, noindex or alt recipes outside Next.js.
- The e2e scripts:
  - no per-run timeout (macOS has no `timeout`);
  - the usage-limit pattern is missing from `run()`;
  - no test for a mismatched `--approver` name.
- Lab-speed and judgment checks vary from run to run. Report the trend, not one run.
- The plugin costs about 3,930 tokens in every session (21 skill descriptions).
