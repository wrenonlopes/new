# BIOD ad creatives

Fifteen concepts — nine for the XL bundle, four for the tissue tube, two for
the single box — each rendered at the two sizes the ad sets run: Feed
(1080×1350) and Stories/Reels (1080×1920).

| File | Hero | Mechanism |
|---|---|---|
| `bundle-01-fils` | **88 fils** a towel | The number, alone |
| `bundle-02-volume` | 200 towels / **88 fils** each | Volume and unit price together |
| `bundle-03-dirham` | not even a dirham | Crossing below one dirham as a threshold |
| `bundle-04-drop` | AED 1.28 → **88 fils** | Landed-cost anchor |
| `bundle-05-month` | **88 fils** a towel | Partitioned to ~AED 27 a month |
| `bundle-06-hook` | how many times has that towel… | Installs the problem before the price |
| `bundle-07-four` | **88 fils** a towel | Four separate boxes, not one object |
| `bundle-08-months` | six months of clean towels | Supply rather than spend |
| `bundle-09-once` | buy it once | Decision cost, not discount |
| `tube-01-fits` | it fits the cup holder | The form factor, demonstrated |
| `tube-02-nine` | **AED 9** a tube | Per tube |
| `tube-03-loose` | where does a square box actually sit? | Problem install |
| `tube-04-interior` | it actually looks good in there | The design argument |
| `single-01-fifty` | 50 for 49 | Entry price |
| `single-02-once` | one towel. one face. once. | The proposition, not the price |

**Units.** Face towels are always priced **per towel** (88 fils) and the tube
always **per tube** (AED 9). In each case that is the unit a buyer actually
picks up — and for the tube it matters twice over, because AED 9 reads as a
price where 18 fils reads as an abstraction. 36 ÷ 4 = 9 exactly.

**Capitals.** Every hero opens with a capital; supporting copy, furniture and
footnotes stay lowercase. The same rule applies to on-screen text in the UGC
scripts.

Copy and the arithmetic behind every figure live in `copy.js`; layout in
`build.js`. Change wording there and re-run — the HTML is generated.

## The rules this set obeys

**The per-towel price is the largest figure on every bundle frame, and AED 176
is always a footnote.** A low unit price reads as value; the pack total reads
as an outlay, and an outlay is what the buyer is deciding whether to avoid.

**The price is the headline, not a badge.** Largest type on the page, in the
display face, on a flat ground, sitting on nothing. The dropshipper signal is
decoration rather than size, so none of the six decorations — pill, badge,
outline, shadow, gradient, rotation — appears behind any number. The unit
(`fils`) rides the numeral's own baseline at 0.42×, same face, same weight,
same colour: a superscript or recoloured unit is the loudest price-badge tell
there is.

**Price and quality share one typographic line.** If a price number and the
word "ultrasoft" ever land in separate visual blocks, the frame has failed —
88 fils starts reading as cheap paper on a face. There is deliberately no
divider between the hero and its supporting line.

**`sticker-xl.png` is a 480px source and is never rendered wider.** `boxW()`
caps it; an illustration with hard edges goes visibly soft above native.

## Claims — what is on these and why

- 176 ÷ 200 = **88 fils**. 49 ÷ 50 = 98 fils.
- Delivery is AED 15 under AED 100 and free above, so one box lands at
  (49 + 15) ÷ 50 = **AED 1.28** a towel and four boxes at 88 fils. Both sides of
  that anchor are live prices plus a published rate, so it cannot be refuted.
- 200 towels at one a day ≈ 6.6 months; 176 ÷ 6.6 ≈ **AED 27** a month.

Deliberately absent: no struck-through pack total (AED 316 is 4 × 79 and was
never charged; AED 300 was taken on 5 units over a year ago — both invite a
buyer to answer with 4 × 49 = 196); no WELCOME10 (its AED 100 minimum makes a
promised 79 fils a price rise on arrival, and it does not apply to the single);
no stock counter; no ratings, hygiene, dermatological or biodegradability
claim; and the words "disposable", "single-use" and "throwaway" appear nowhere.

## Rebuilding

```
npm i playwright @fontsource/outfit @fontsource/plus-jakarta-sans
node build.js
```

Story frames keep all content between y=270 and y=1520, clear of the profile
row and the CTA rail. Brand colours match `config/settings_data.json`.
