# BIOD ad creatives

Nineteen concepts — thirteen for the XL bundle, four for the tissue tube, two for
the single box — each rendered at the two sizes the ad sets run: Feed
(1080×1350) and Stories/Reels (1080×1920).

| File | Hero | Mechanism |
|---|---|---|
| `bundle-01-fils` | **88 fils** a towel | The number, alone |
| `bundle-02-volume` | 200 towels / **88 fils** each | Volume and unit price together |
| `bundle-03-dirham` | not even a dirham | Crossing below one dirham as a threshold |
| `bundle-04-drop` | AED 1.28 → **88 fils** | Landed-cost anchor |
| `bundle-05-month` | **88 fils** a towel | Partitioned to ~AED 44 a month |
| `bundle-06-hook` | how many times has that towel… | Installs the problem before the price |
| `bundle-07-four` | **88 fils** a towel | Four separate boxes, not one object |
| `bundle-08-months` | Four months of clean towels | Supply rather than spend |
| `bundle-09-once` | buy it once | Decision cost, not discount |
| `tube-01-fits` | it fits the cup holder | The form factor, demonstrated |
| `tube-02-nine` | **AED 9** a tube | Per tube |
| `tube-03-loose` | where does a square box actually sit? | Problem install |
| `tube-04-interior` | it actually looks good in there | The design argument |
| `bundle-10-versus` | Your towel vs ours | Head to head |
| `bundle-11-study` | **89%** | A cited research finding |
| `bundle-12-howto` | Three steps | The routine |
| `bundle-13-spec` | What AED 176 buys | The spec |
| `single-01-fifty` | 50 for 49 | Entry price |
| `single-02-once` | one towel. one face. once. | The proposition, not the price |

**Units.** Face towels are always priced **per towel** (88 fils) and the tube
always **per tube** (AED 9). In each case that is the unit a buyer actually
picks up — and for the tube it matters twice over, because AED 9 reads as a
price where 18 fils reads as an abstraction. 36 ÷ 4 = 9 exactly.

**The comparison frame.** Every line in `bundle-10-versus` is a logistical or
behavioural fact — how the object is used, stored and laundered. Not one line
claims anything about skin, germs or health. Those are the claims that get an
ad reported or rejected, and they are not needed when the handling facts are
this lopsided.

**The cited figure.** `bundle-11-study` carries the one published statistic the
brand already cites on its own site: 89% of 82 used hand towels carried
coliform bacteria (Gerba et al, University of Arizona, *Food Protection
Trends* 34(5), 2014). It is stated as a study finding with the source on the
frame, never as a claim about what the product does to skin. The "hand-towel
data" qualifier stays visible — it is the obvious rebuttal, and pre-empting it
is what makes the rest credible. This is also the only `%` in the set, and it
is a research figure rather than a discount.

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
- The pack is **four months** of use (the owner's figure, from how customers
  actually buy — it implies ~1.6 towels a day, i.e. a twice-daily wash, not the
  one-a-day I had assumed). So 176 ÷ 4 = **AED 44 a month**, and one box is
  about a month. Do not re-derive this from a one-a-day rate.

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
