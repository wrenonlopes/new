# BIOD static ad creatives

Three static concepts for Meta, each rendered at the two sizes the ad sets
actually run: Instagram Feed (1080×1350) and Stories/Reels (1080×1920).

Each one borrows a piece of interface the audience reads all day, so the frame
looks like something already on their phone rather than something a brand paid
for. Copy is written for the ad — none of it is lifted from the storefront.

| File | Product | Format |
|---|---|---|
| `01-thread` | Face Towel XL, AED 49 | A text thread. The price lands as the punchline. |
| `02-search` | Face Towel XL, AED 49 | A search box and its answer. Built on real search intent. |
| `03-receipt` | Bundle XL, AED 176 | A till receipt. The unit price argues for itself. |

All three share one footer strip — price tag left, `biod.co` right — so the set
reads as a family while the middle of each frame does something different.

## Rebuilding

```
npm i playwright @fontsource/outfit @fontsource/plus-jakarta-sans @fontsource/space-mono
node build.js
```

Writes `creatives.html` and `out/*.png`. Copy lives in the `CONCEPTS` array at
the top of `build.js` — edit there and re-run rather than editing the HTML,
which is generated.

`creatives.html` is self-contained (fonts and artwork inlined as data URIs), so
it can be opened and re-rendered anywhere without a network.

## Notes

- Brand colours match `config/settings_data.json`; keep them in step if the
  theme's change.
- Product artwork is `assets/sticker-xl.png` from the theme.
- Story frames keep all content between y=270 and y=1520, clear of the profile
  row at the top and the CTA and action rail at the bottom.
- Every figure is checked: 50 towels at AED 49; 200 at AED 176 is 88 fils
  exactly; free shipping starts at AED 100, so the bundle qualifies and the
  single box does not. No ratings, hygiene or disposal claim appears on any of
  them.
