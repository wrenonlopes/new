---
description: Write a content brief for one page, built from the verified rule base (Phase 3).
argument-hint: <project-name> <keyword group or URL>
---

Arguments: `$ARGUMENTS` (project name first, then the keyword group or URL).

Read the project's `profile.yaml`, the latest `keywords.csv` and `page-map.md`, and the rule base in CLAUDE.md. If the target is an existing URL, fetch it (and run `uv run engines/raw_vs_rendered.py <url>`) so the brief starts from what is there.

Write `projects/<name>/briefs/<slug>.md` with:

1. **Target**: URL (or "new" with proposed URL), keyword group, intent, language, conversion this page should drive.
2. **Title**: phrased the way buyers ask (use the exact wording of the closest Search Console queries and `buyer_prompts`). Rule: titles should match prompt phrasing (scope ChatGPT).
3. **Opening**: the first sentence as a declarative answer. Rule: open with a declarative statement; key answer in the first 30% of the page.
4. **Outline**: H2s as the questions buyers ask, each with the one-sentence answer that opens that section.
5. **Unique data points**: what only this business can say (prices, timelines, counts, cases, local facts). Mark each as "have" or "need from client". Do not invent figures.
6. **Format**: article, table, comparison, calculator or FAQ, whichever the SERP and the question call for.
7. **Length**: state the platform tradeoff. Google AI Overviews: length barely matters (53.4% of citations go to pages under 1,000 words). ChatGPT: longer, well-sectioned pages earn more. Pick for the platforms the page targets.
8. **Structured data**: only types eligible for Google rich results, and only fields that match visible text. No "AI schema".
9. **Freshness**: a visible "last updated" date and what triggers an update.
10. **Rendering**: the content must be in the initial HTML (note the stack's rendering mode from the profile).
11. **Internal links**: in and out, from `page-map.md`.
12. **Predicted outcome**: metric, source and check-after date. Add it as a change-log row once approved.

End the brief with an approval line for the approver in the profile. Draft copy only if asked, and label it "draft, not approved". Nothing publishes without approval.
