---
name: competitor-watch
description: >
  Full-surface competitor sweep for BIOD — Meta/Instagram ads, Instagram, TikTok, competitor
  websites and Amazon storefronts — scored for tone and humour, written out as a machine-readable
  feed for BIOD's Claude ads agents plus a dated human teardown. Use when asked to watch, monitor
  or analyse competitors, audit their ads or videos, check what creative rivals are running, or
  refresh the competitor registry. The ads surface works anywhere; the rest needs open egress.
---

# Competitor watch (BIOD)

Turns every competitor surface into (a) `competitive/agent-feed/uae-competitive-state.json` for
the ads agents and (b) `competitive/teardown-YYYY-MM-DD.md` for humans.

**Read `competitive/competitors.yml` first — it is the input, and it carries the Meta page IDs
that make the ads sweep reliable.**

Mission framing: BIOD is betting on **comedy / bold humour** as its wedge in the UAE. So tone is
not a soft observation here, it is a scored dimension — see *Tone audit* below.

## Surface coverage — know what runs where

| Surface | Tool | Works in a restricted session? |
|---|---|---|
| **Meta + Instagram ads** | `ads_library_search` (MCP) | **Yes** — server-side, ignores container egress |
| Instagram organic | agent-reach → OpenCLI | No — needs desktop Chrome + extension |
| TikTok | `yt-dlp` direct (no agent-reach channel) | No |
| Competitor websites | agent-reach web / Jina Reader | No |
| Amazon storefronts | web fetch + `yt-dlp`-free scraping | No |

So: **always run the ads sweep** — it works everywhere. Run the rest locally.

```bash
curl -sS -o /dev/null -w "%{http_code}\n" --max-time 15 https://www.tiktok.com
```
`000` → restricted. Do the ads sweep, mark every other surface `not_collected` in the JSON with
its blocker, and say so. Never fill a blocked surface from memory.

## 1. Ads — the reliable surface

Query by **`page_ids`**, not keywords. Page IDs are in `competitors.yml` under `meta_page_id`.

```
ads_library_search(page_ids=["103702641815801"], ad_active_status="ALL", limit=50)
```

Record per ad: id, `ad_creative_link_title`, creation and delivery dates, variant count, currency
(AED confirms UAE targeting), format (catalog/DPA vs single), and a tone + humour score.

**Known tool behaviour — do not misuse it:**
- Search by **brand name** works well for discovering an unknown page ID (`search_terms="Bambuyu"`).
- Search by **page_id** is exact and reliable.
- **Broad thematic search is useless** — an emoji query returned 1.5M irrelevant ads, and
  "face towel" returned drama-short spam. Never use it to support a category-wide claim such as
  "nobody in UAE does comedy." If asked to prove that, say it cannot be measured this way.
- Catalog/DPA ads leak the advertiser's **whole product line** in the link title. Always read them
  — that is how Bambuyu's six SKUs were confirmed.

New competitor found? Resolve its page ID by brand-name search, add it to `competitors.yml`.

## 2. TikTok — agent-reach has no channel, use yt-dlp

```bash
yt-dlp --dump-json "https://www.tiktok.com/@handle/video/ID" > /tmp/v.json   # views/likes/caption
yt-dlp --flat-playlist --dump-json --playlist-end 30 "https://www.tiktok.com/@handle"
agent-reach transcribe "https://www.tiktok.com/@handle/video/ID" -o /tmp/t.txt
```

2–3s between requests. A captcha wall is the platform's limit — stop and report partial results.

## 3. Instagram, websites, Amazon

- **Instagram**: `opencli instagram profile/user <handle> -f yaml`. Desktop Chrome, user's own
  logged-in session, never a server. Do not log in for the user; do not read their cookies.
- **Websites**: price, sheet count, **price per sheet**, subscription discount, free-delivery
  threshold, claims, certifications.
- **Amazon**: listing price, review count and rating, Best Sellers Rank, variant count, and
  whether the brand has a Storefront. Marketplace presence is the structural gap for BIOD —
  the category leader does ~80% of volume there — so record it even when nothing changed.

## 4. Tone audit — scored, because comedy is the strategy

Score every ad and top organic video **0–5**:

| Score | Register |
|---|---|
| 0 | Sincere / functional — "A Fresh Towel Every Time" |
| 1 | Punchy imperative, no joke — "Your Loofah Needs An Upgrade" |
| 2 | Wry aside or mild self-awareness |
| 3 | Clearly a joke, safe and brand-adjacent |
| 4 | Committed comedy — a real bit, a character, a runner |
| 5 | Category-defining comic voice |

Also log: does it **name an enemy**? Does it **mock the customer** (a scold) or **the object** (a
joke)? Those are different things and the distinction drives BIOD's creative decisions — BIOD's
own *"Why use that dirty towel on your pretty face?"* scores 1 precisely because it scolds.

Report the humour average per competitor, and flag any rival moving above 2 — that is BIOD's lane
being contested and it is the single most important early warning this sweep produces.

## 5. Setup (once per machine, for the non-ads surfaces)

Install from the **GitHub repo, not PyPI** — `pip install agent-reach` is an unrelated v0.1.0
package by a different author.

```bash
git clone https://github.com/Panniantong/agent-reach ~/tools/agent-reach
pip install -e ~/tools/agent-reach
agent-reach configure groq-key      # free, console.groq.com — needed for transcription
agent-reach doctor
```

## 6. Write the output

**Always both files.**

1. `competitive/agent-feed/uae-competitive-state.json` — bump nothing, keep `schema_version`,
   set `generated`, fill `collection_status` honestly per surface, and tag **every** block
   `verified` / `documented` / `inference`. The ads agents gate on those tags.
2. `competitive/teardown-YYYY-MM-DD.md` — human report. Lead with **what changed** since the
   previous teardown (`ls competitive/teardown-*.md | tail -2`), then per-competitor, tone table,
   ranked actions each tied to a named file or section, and open questions.

If the sweep produced new creative direction, update `competitive/agent-feed/comedy-briefs.md` —
and every hook in it must trace to a line **already live on the site**, so nothing needs
re-clearing.

## Ads-account analysis — mandatory verification protocol

Any claim about BIOD's own Meta account goes through all eight of these first. Each one exists
because skipping it produced a wrong answer that reached the operator.

1. **Start at account level for totals.** Never derive an account total by summing campaigns, ad
   sets or ads — a paginated or partial response silently under-counts.
2. **Reconcile the levels before reporting.** account = Σ campaigns = Σ ad sets = Σ ads. If they
   disagree, find the reason first.
3. **Establish the ad account's timezone and what "today" means in it.** Today is always a partial
   day. Never diagnose from it, and never compare a partial day to a complete one.
4. **Name the source of every sales figure.** A Meta-attributed purchase is not a Shopify order.
   Ask which one the operator means before explaining any change in it.
5. **State n before stating a finding.** Below ~100 clicks or ~30 conversions, report "no signal"
   rather than a conclusion, and compute the probability of the observed result under the null
   before calling anything a change.
6. **Rank on the objective metric — cost per purchase — never on a proxy such as CTR.**
7. **Never recommend at a level above where the variance lives.** Drill to ad level before
   proposing any cut: ad-set averages hide the ad carrying the result.
8. **Every number must be traceable to a specific query.** If it cannot be pointed at, it does not
   go in the report.

Spend-affecting changes are never applied without explicit operator approval.

## Guardrails

- **Public data only.** Public posts, storefronts, listings, the Ad Library. No logins that
  aren't the user's own, no fake accounts, no automated engagement, no bulk scraping.
- **Never copy a competitor's creative.** Extract the mechanism — hook shape, proof device, CTA
  placement — and rebuild it in BIOD's voice.
- **BIOD's claims policy (root `README.md`) binds everything**, jokes included. Three cleared
  claims. A competitor asserting something is not evidence for it.
- **Never name a competitor in BIOD creative.** Punch at cotton towels and wet wipes.
- **UAE humour guardrails** apply to anything creative this sweep proposes: object-comedy and
  self-deprecation are safe; religion, politics, national identity, modesty, alcohol and
  person-directed mockery are not. Step the tone down during Ramadan.
- **Mark inference as inference.** View counts and ad titles are observable. CAC, margin, "why it
  worked", and market-wide tone claims are not.
