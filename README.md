# seo: SEO + AI search visibility plugin for Claude Code

Install once, then in any project folder: `/seo:start`.

## Install

Needs Node ≥ 22.18 and [uv](https://docs.astral.sh/uv/).

```bash
claude plugin marketplace add /Users/abdelhamidsahbi/seo-tool
claude plugin install seo@seo-tool
```

## Use

| Command | Does |
| --- | --- |
| `/seo:start` | First run: setup. Later: status and the next step. |
| `/seo:setup` | Checks tools, detects the stack, fills `.seo/profile.yaml`, connects data sources. |
| `/seo:audit [--local URL]` | Technical + on-page checks → `.seo/reports/<date>/fix-queue.md`. |
| `/seo:fix [ids \| top N]` | Applies approved fixes: a branch in code projects, admin steps for CMS sites, a handoff doc otherwise. |

Coming in later plans: `/seo:research`, `/seo:content`, `/seo:brief`, `/seo:visibility`, `/seo:offpage`, `/seo:review`.

## Credentials (optional; more data at each tier)

Export in your shell profile: `GSC_OAUTH_CLIENT_SECRETS_FILE` (Search Console OAuth client JSON), `GOOGLE_API_KEY` (Chrome UX Report API), `DATAFORSEO_LOGIN` + `DATAFORSEO_PASSWORD` ($50 deposit, auto-recharge off), `GEMINI_API_KEY`. GA4 uses `gcloud auth application-default login` with the `analytics.readonly` scope.

## Safety

A plugin hook blocks Search Console write tools, DataForSEO Backlinks calls, and squirrelscan cloud and publish flags in every project; it asks before any DataForSEO Live call. Fixes never land on your default branch, and nothing is pushed or deployed.

Third-party credits: `plugins/seo/NOTICE`.
