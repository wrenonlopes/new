---
name: competitor-watch
description: >
  Run a competitor sweep for BIOD — pull competitors' videos, product pages, prices and
  reviews, transcribe the video, and write a dated teardown into competitive/. Use when
  asked to check on competitors, analyse a competitor's video or ad, do a competitive
  teardown, or refresh the competitor registry. Requires open internet egress, so it runs
  on a local machine, NOT in a Claude-on-web session.
---

# Competitor watch (BIOD)

Turns competitor video and storefronts into a dated, comparable teardown in `competitive/`.
The competitor set lives in `competitive/competitors.yml` — read it first, it is the input.

## Before you start: does this environment work?

This workflow needs general outbound internet. **Claude Code on the web cannot run it** —
its egress proxy answers `403` to CONNECT for youtube.com, instagram.com, tiktok.com,
r.jina.ai and api.groq.com. Check in one command:

```bash
curl -sS -o /dev/null -w "%{http_code}\n" --max-time 15 https://www.tiktok.com
```

`200`/`3xx` → proceed. `000` → you are in a sandbox; stop and say so rather than producing
a teardown from memory. Confirm with `curl -sS "$HTTPS_PROXY/__agentproxy/status"` if set.

## Setup (once per machine)

Install from the **GitHub repo, not PyPI**. `pip install agent-reach` installs an unrelated
v0.1.0 package by a different author — a name collision. The real tool is:

```bash
git clone https://github.com/Panniantong/agent-reach ~/tools/agent-reach
pip install -e ~/tools/agent-reach          # provides `agent-reach` v1.5+
agent-reach doctor                           # shows per-platform status + active backend
```

Transcription needs a free Groq key and ffmpeg:

```bash
agent-reach configure groq-key               # hidden input; console.groq.com
```

Know the auth boundary before promising coverage:

| Surface | Works how | Gotcha |
|---|---|---|
| YouTube | `yt-dlp`, zero config | needs a JS runtime configured, or subs come back empty |
| Web pages | Jina Reader, zero config | fine for storefronts and press |
| RSS | zero config | good for competitor blogs/PR |
| **TikTok** | **not a channel in agent-reach** | see workaround below — this is the main gap |
| Instagram / Facebook | OpenCLI on the user's logged-in Chrome | **desktop Chrome + extension required**, never on a server |
| Twitter / Reddit | user-exported cookies | export via Cookie-Editor; use a burner account |

Never log into a platform on the user's behalf and never read their browser cookies —
agent-reach's own policy, and it is the right one. Ask them to export.

## The TikTok gap (read this — it matters for BIOD)

TikTok and Reels are where this category actually sells, and agent-reach has no TikTok
channel. `yt-dlp` does support TikTok and Instagram directly, so go around it:

```bash
# metadata: views, likes, comments, caption, duration, music
yt-dlp --dump-json "https://www.tiktok.com/@handle/video/ID" > /tmp/v.json

# a creator's recent posts, newest first, no download
yt-dlp --flat-playlist --dump-json --playlist-end 30 "https://www.tiktok.com/@handle"

# the words: transcribe, since TikTok has no subtitle track to pull
agent-reach transcribe "https://www.tiktok.com/@handle/video/ID" -o /tmp/t.txt
```

Rate-limit yourself: 2–3s between requests. Captcha walls are the platform's limit, not a
bug to route around — if you hit one, stop and report partial results.

## The sweep

1. **Read the registry.** `competitive/competitors.yml`. Do tier 1 every run, tier 2 monthly.
2. **Resolve unverified handles first.** Any competitor with `verified: false` — confirm the
   handle from their own site's social links, then update the YAML and flip the flag. Do not
   attribute metrics to a guessed handle.
3. **Per competitor, collect:**
   - storefront: current SKUs, sheet counts, price, **price per sheet**, subscription discount,
     free-delivery threshold, claims and certifications
   - video: 10–20 most recent posts with view/like/comment counts; transcribe the top 3 by views
   - reviews: what buyers praise and complain about (Amazon listing + site reviews)
4. **For each transcribed video, record the mechanics**, not a summary:
   - the hook — the literal first sentence, and which formula it is (shock/revelation,
     product-as-find, product-as-hack, before-after, swab/proof demo)
   - seconds to first product appearance
   - the claim made, and whether it is substantiated
   - the CTA and where it points (own site vs Amazon vs TikTok Shop)
   - format: talking head / texture close-up / voiceover-over-b-roll / founder-led
5. **Diff against last run.** `ls competitive/teardown-*.md | tail -2` — lead the new report
   with what changed: new SKUs, price moves, new retail listings, a new hook that is working.
6. **Write `competitive/teardown-YYYY-MM-DD.md`.** Sections: What changed · Per-competitor ·
   Video mechanics table · What BIOD should do (ranked, each tied to a named file or section
   of this theme) · Open questions. Cite a URL for every factual claim.

## Guardrails

- **Public data only.** Public posts, storefronts, listings, press. No scraping behind logins
  that aren't the user's own, no fake accounts, no automated engagement.
- **Never copy a competitor's creative.** Extract the *mechanism* (hook shape, proof device,
  CTA placement) and rebuild it in BIOD's voice. Lifting a script or edit is both a legal
  problem and an obvious one to viewers.
- **BIOD's claims policy still binds** (see `README.md`). A competitor making a claim is not
  evidence for it. Do not recommend copying "antibacterial fabric" or unverified trial
  percentages into BIOD copy just because a rival says it.
- **Mark inference as inference.** Follower counts and view counts are observable; CAC, margin
  and "why it worked" are not. Label guesses.
