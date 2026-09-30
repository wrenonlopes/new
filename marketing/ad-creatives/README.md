# BIOD ad creatives

Four price-led statics for Meta, each rendered at the two sizes the ad sets
run: Instagram Feed (1080×1350) and Stories/Reels (1080×1920).

| File | SKU | Mechanism | Frame |
|---|---|---|---|
| `a-hook` | Bundle XL | Installs the problem before naming a price | Loss |
| `b-drop` | Bundle XL | Landed-cost anchor, AED 1.28 → 88 fils | Gain |
| `c-month` | Bundle XL | Cost per month, AED 27 | Loss |
| `d-fifty` | Face Towel XL | Entry price, 50 for 49 | Gain |

Copy and the arithmetic behind every figure live in `copy.js`; layout in
`build.js`. Change wording there and re-run — the HTML is generated.

## The design rule

The price *is* the headline: the largest type on the page, set in the display
face on a flat ground with air around it. No badge, burst, pill, outline or
rotation. A discount sticker is small type in a loud container; this is the
inverse, which is what keeps a price-led frame from reading as dropshipping.

Price and quality always share one typographic line (the furniture rule). If a
price number and the word "ultrasoft" ever land in separate visual blocks, the
frame has failed — 88 fils starts reading as cheap paper on a face.

## Claims — what is on these and why

Verified against the catalogue, the delivery profile and the discount rules:

- 176 ÷ 200 = **88 fils** a towel. 49 ÷ 50 = 98 fils.
- Domestic delivery is AED 15 under AED 100 and free above, so one box lands at
  (49 + 15) ÷ 50 = **AED 1.28** a towel and four boxes at 88 fils. Both sides of
  that anchor are live prices plus a published rate, so it cannot be refuted.
- 200 towels at one a day ≈ 6.6 months; 176 ÷ 6.6 ≈ **AED 27** a month.

Deliberately absent:

- **No struck-through total.** AED 316 is 4 × 79 and was never charged; AED 300
  was taken on 5 units over a year ago. Either invites a buyer to answer with
  4 × 49 = 196 in the comments.
- **No WELCOME10.** It has an AED 100 minimum, so promising 79 fils on an image
  becomes a price rise on arrival at the product page, and it does not apply to
  the single at all. It belongs on retargeting as `?discount=WELCOME10`, already
  applied.
- **No stock counter.** "19 left" is true today and false next week.
- No ratings, no hygiene or dermatological claim, no biodegradability claim, and
  the words "disposable", "single-use" and "throwaway" appear nowhere.

## Rebuilding

```
npm i playwright @fontsource/outfit @fontsource/plus-jakarta-sans
node build.js
```

Story frames keep all content between y=270 and y=1520, clear of the profile
row and the CTA rail. Brand colours match `config/settings_data.json`; product
art is `assets/sticker-xl.png`.
