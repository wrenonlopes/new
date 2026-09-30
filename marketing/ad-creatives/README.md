# BIOD static ad creatives

Three static concepts for Meta, each rendered at the two sizes the ad sets
actually run: Instagram Feed (1080×1350) and Stories/Reels (1080×1920).

| File | Product | Angle |
|---|---|---|
| `01-xl-bathroom` | Face Towel XL, AED 49 | "50 clean towels. Or keep using the one hanging in your bathroom." |
| `02-xl-once` | Face Towel XL, AED 49 | "One towel. One face. Once." |
| `03-bundle-math` | Bundle XL, AED 176 | "200 towels. 88 fils each." |

## Rebuilding

```
npm i playwright @fontsource/outfit @fontsource/plus-jakarta-sans
node build.js
```

Writes `creatives.html` and `out/*.png`. Copy lives in the `CONCEPTS` array at
the top of `build.js` — edit there and re-run rather than editing the HTML,
which is generated.

`creatives.html` is self-contained (fonts and artwork inlined as data URIs), so
it can be opened and re-rendered anywhere without a network.

## Notes

- Brand colours are read from the same values as `config/settings_data.json`;
  keep them in step if the theme's change.
- Product artwork is `assets/sticker-xl.png` from the theme.
- Story frames keep all content between y=270 and y=1520, clear of the profile
  row at the top and the CTA and action rail at the bottom.
- Every figure on these is checked: 50 towels at AED 49 (98 fils each); 200 at
  AED 176 is 88 fils exactly; free shipping starts at AED 100, so the bundle
  qualifies and the single box does not. No ratings claim and no hygiene or
  disposal claim appears on any of them.
