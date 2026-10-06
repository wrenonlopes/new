#!/usr/bin/env python3
"""PreToolUse guard for the seo plugin.

Reads the hook event on stdin and prints a deny/ask decision, or nothing to allow.
- Search Console write tools, squirrelscan comment tool: deny (the plugin uses them read-only).
- DataForSEO: Backlinks endpoints deny; any Live endpoint asks (DataForSEO Labs is Live-only).
- squirrel CLI: deny cloud spend and publishing (auth, keys, --render except --render-mode off, -y, --publish/-p).
Standard library only, Python 3.9 compatible: hooks run on the system python3.
Literal-text guardrail, not a sandbox: deliberate obfuscation (variables, odd casing) can evade it.
"""
import json
import re
import sys

READ_ONLY = {
    "mcp__search-console__add_site",
    "mcp__search-console__delete_site",
    "mcp__search-console__submit_sitemap",
    "mcp__search-console__delete_sitemap",
    "mcp__search-console__manage_sitemaps",
    "mcp__squirrelscan__comment_on_issue",
}
# A flag ends at anything that is not a word character or dash (space, quote, '=', ')', end).
END = r"(?![\w-])"
SQUIRREL_BLOCKS = [
    # auth/keys as a token anywhere after the squirrel command (global -c/--config-file may precede it)
    (re.compile(r"squirrel\S*\s(?:.*\s)?(auth|keys)" + END), "squirrel auth/keys are cloud account actions"),
    (re.compile(r"--render(?!-mode[ =]off)"), "cloud rendering spends squirrel credits; Crawl4AI renders locally"),
    (re.compile(r"--publish" + END + r"|\s-p" + END), "publishing reports makes them public"),
    (re.compile(r"\saudit\b.*\s(-y|--yes)" + END), "-y auto-approves cloud spend"),
]
SEGMENT = re.compile(r"[;&|\n]+")


def decide(event):
    tool = event.get("tool_name") or ""
    args = event.get("tool_input") or {}
    if tool in READ_ONLY:
        return "deny", "seo plugin policy: %s is a write action; the plugin uses this service read-only." % tool
    if tool == "mcp__dataforseo__api_request":
        target = ("%s %s" % (args.get("path") or "", args.get("url") or "")).lower()
        if "/backlinks/" in target:
            return "deny", ("seo plugin policy: the DataForSEO Backlinks API is off by default (priced separately). "
                            "The user must enable it explicitly for this request.")
        if re.search(r"/live(/|\b)", target):
            return "ask", ("DataForSEO Live endpoint (Labs is Live-only; Live costs more than Standard). "
                           "Confirm the quoted cost before it runs.")
        return None
    if tool == "Bash":
        for segment in SEGMENT.split(args.get("command") or ""):
            if "squirrel" not in segment:
                continue
            for pattern, why in SQUIRREL_BLOCKS:
                if pattern.search(segment):
                    return "deny", "seo plugin policy: %s." % why
    return None


def main():
    try:
        event = json.load(sys.stdin)
        decision = decide(event)
    except Exception:  # unreadable event for a guarded tool: fail closed
        decision = ("deny", "seo plugin guard could not read this tool call, so it was blocked.")
    if decision:
        json.dump({"hookSpecificOutput": {"hookEventName": "PreToolUse",
                                          "permissionDecision": decision[0],
                                          "permissionDecisionReason": decision[1]}}, sys.stdout)
    return 0


if __name__ == "__main__":
    sys.exit(main())
