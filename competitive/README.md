# competitive/

Competitor intelligence for BIOD. Three parts:

| File | What it is |
|---|---|
| `competitors.yml` | The registry — who we watch, why, and what to look for. The input to every run. |
| `teardown-YYYY-MM-DD.md` | One dated report per sweep. Newest is current; keep the old ones, the diff is the value. |
| `../.claude/skills/competitor-watch/SKILL.md` | The runbook. `/competitor-watch` in Claude Code. |

## Running a sweep

```bash
# from a machine with normal internet — NOT a Claude Code web session
/competitor-watch
```

The skill checks egress first and stops if it's sandboxed rather than guessing. Setup
(agent-reach, Groq key, the platform auth boundaries, and the TikTok workaround) is
documented in the skill itself.

**Install agent-reach from GitHub, not PyPI** — `pip install agent-reach` is a different,
unrelated package by another author. See the skill for the correct command.

Cadence: tier 1 weekly, tier 2 monthly. Update `competitors.yml` whenever a handle is
verified or a competitor changes shape.

## Ground rules

Public data only. Never copy a competitor's creative — extract the mechanism and rebuild it
in BIOD's voice. A competitor's claim is not evidence for that claim: the fact-checked claims
policy in the root `README.md` still binds everything that reaches the site or a script.
