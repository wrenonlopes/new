# BIOD — Bamboo Revolution (Shopify Online Store 2.0 theme)

Design system: Outfit + Plus Jakarta Sans, cream/ink/leaf/sunrise palette, bold Gen Z
color-block sections. Built from the approved design mockups (homepage, PDP, store pages).

## Install
1. Zip this folder (the zip must contain assets/, config/, layout/, locales/, sections/,
   snippets/, templates/ at the top level).
2. Shopify admin → Online Store → Themes → Add theme → Upload zip.
3. Preview → Customize.

## Required setup after upload
1. **Logo**: Theme settings → Brand → upload the dark logo (transparent PNG/SVG) and the
   cream logo for dark backgrounds.
2. **Menus**: Navigation → create/confirm `main-menu` (Shop, The Science, About, Blog, FAQ)
   and footer menus, then assign them in the Header and Footer sections.
3. **WhatsApp + shipping threshold**: Theme settings → Store details.
4. **Homepage**: the index template ships with Hero, Ticker, Problem+Chat, Featured
   collection, Versus, Receipts, Planet, Reviews strip, FAQ, Final CTA. Every text, stat,
   chat message, fighter, and review is a section/block setting — edit in the customizer.
5. **Hero photos**: add 3 images (4:5) to the Hero section's Photo snap blocks.
6. **Reviews strip**: add your UGC videos (9:16, they autoplay muted) to the video blocks.

## Product metafields (Settings → Custom data → Products)
Create these under namespace `biod` (all single-line text unless noted):
- `biod.card_tag`      — card corner tag ("Bestseller", "Try it · Dhs 19")
- `biod.card_subtitle` — grid card subtitle ("50 single-use large towels")
- `biod.kicker`        — PDP kicker ("The daily driver")
- `biod.hook`          — PDP hook line
- `biod.unit_note`     — per-unit math ("≈ Dhs 0.98 per towel · 50 sheets per box")
- `biod.pairs_with`    — product reference list (for the Pairs-well-with row; falls back
                         to Shopify recommendations if empty)

## Subscriptions (Subscribe & Save 30%)
The PDP renders selling plans automatically when they exist. Install a subscriptions app
(Shopify Subscriptions is free) and create a "Monthly — save 30%" selling plan per product.

## Fix these catalogue issues in admin (found during the redesign)
- Tissue Tube: unify title/price (collection says 4-pack Dhs 36; product page said Dhs 45).
- Bundle copy says "save 25%" but prices show 30–44% — align.
- XL bundle handle is /products/travel-towel-2 — rename (set a URL redirect).
- Face Towel XL compare-at: 79 vs 80 mismatch.
- Shared FAQ typo "recieve" → "receive"; remove towel copy from tissue listings.
- Inventory shows everything sold out — restock or hide.

## Claims policy
Site copy uses only fact-checked claims (see brand guidelines fact-check log,
2026-08-19): the 89% / 1-in-4 towel study (Food Protection Trends 2014), AAD guidance,
bamboo growth/biodegradability. Do not add "antibacterial fabric" or unverified trial
percentages without documentation.
