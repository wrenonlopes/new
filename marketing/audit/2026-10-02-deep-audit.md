# BIOD — deep audit, 2 October 2026

Six specialists, read-only, across the Meta account, the Shopify funnel, pricing,
measurement, the theme, and the brand. Nothing was changed anywhere.

---

## The one-paragraph version

BIOD is not an underperforming store. It is a store that **stopped trading for
twelve months** and restarted two months ago into an ad account that has never
been profitable, with measurement that double-counts every event, 40% of its
traffic classified as non-human, and a product page carrying 198 fabricated
reviews. The creative work of the last two days was aimed at the wrong problem.

---

## 1. The money

| | Lifetime | Since restart (1 Aug) | Since the fix (27 Sep) |
|---|---|---|---|
| Meta spend | 10,310 | 3,143 | 532 |
| Meta purchases | 61 | 8 | 3 |
| CPA | 169 | 393 | 177 |
| ROAS | 0.85 | 0.29 | 0.59 |

Store ledger, lifetime: **gross AED 16,276 · discounts AED 4,002 (25% of gross)
· net AED 11,417 across 128 orders · net AOV AED 89.19.**

Meta spend is **90% of lifetime net revenue**. Measured honestly — real spend of AED 3,142.77 since 13 Aug against the **15
orders that actually paid** — **true CPA is AED 209.52**, and true ROAS about
**0.33**. Meta's own 177 is counting 100%-off creator orders and refunds.

**Net AOV of AED 89.19 sits below the store's own AED 100 free-shipping
threshold.** The average order has never qualified.

**No cost of goods is recorded on any product.** `unitCost` is null across the
catalogue, so nobody can compute real profit per order.

### The number that moves everything

AOV has collapsed **42%**: the best campaign this account ever ran did AED
197.66; the live one does AED 115.18. The AED 94 break-even was calibrated to the
old basket. At the same margin, today's basket puts break-even near **AED 55** —
so the account is not 1.9× over, it is **3.2× over**.

The account's own evidence says why: **non-discount creatives carry AOV 168–198;
discount statics carry 120.** The creative library is dominated by "FLAT 30% OFF".

---

## 2. Corrections to things I told you

| I said | Actually |
|---|---|
| The funnel collapsed 2.5× at both stages | **Reach-to-checkout did not fall.** Aug 2026 ran 9.5% against Apr 2025's 9.0%. Apr 2025 was the best month in store history; the median of the ten trading months before the blackout was 3.2%. **Only completion genuinely broke: ~47% median → 20%.** |
| Advanced matching gave lift where it mattered, nothing upstream | It **damaged** upstream. PageView 6.3 → 5.4, AddToCart 6.3 → 6.1, InitiateCheckout 6.6 → 5.8, and email coverage on all four fell to **zero**. |
| Meta and Shopify now reconcile exactly | One week at n=3. Across the restart it is 8 against 11 — the **~27% under-report stands**, and cannot be fixed by a setting: your 10/21/29-day lags all exceed Meta's 7-day maximum click window. |
| Abandoned-checkout email is worth building | **15 abandonments lifetime**, 6 from real UAE shoppers, ~AED 379. Meanwhile ~42 people reached checkout in September and left before typing an email. The lapsed-buyer list is worth ~100× more. |
| The bundle has sold nothing in 12 months | It has sold **twice** — #1119 on 9 Sep at the **full AED 176, no code**, and #1127 on 30 Sep at 158.40. |
| CPA since restart is AED 393 | That folds in a separate campaign's AED 911 of zero-purchase spend. True ≈ **AED 209.52**. |
| 206 customers | **71 distinct paying customers.** The 206 counts popup signups and abandoners. Of 129 orders, 92 were commercial — 32 were 100%-off creator codes. |

---

## 3. Measurement is not trustworthy

**Every event is counted twice.** Browser pixel and server-side CAPI both fire
with no shared `event_id`. Web-only returns 13 purchases; server-only returns 13
purchases — at the **identical 13 hour-buckets**. Shopify recorded 14 orders.
**13 real purchases appear as 26**, and the purchase optimiser trains on the
doubled stream. The fix is in the Meta sales-channel app, not the theme.

**40% of post-relaunch traffic is non-human.** 1,092 of 2,712 sessions, zero
orders. Bots were **exactly zero** in every month from Sept 2024 to Jul 2025.
They begin Jul 2026. A second campaign — *Consolidated Sales | Sprint*, now
paused — was the source: **21.9% of its 1,029 sessions were bots, and Meta
billed for them.** It spent AED 911.56 across 1,475 clicks for **zero
purchases**, and its 0.62 CPC and 5.03% CTR were junk inventory, not efficiency.

**Retargeting is not available to you.** All three custom audiences sit at the
delivery floor (bound 20 users). Both lookalikes are inactive. The two audiences
built on 27 Sep are unusable and were partly seeded by bot AddToCart events.

What to trust: **CPM yes. Shopify human-only sessions yes. Everything else no** —
use Shopify orders over Meta purchases, and compute CPA as total spend ÷
UTM-traced orders.

---

## 4. The Meta account

- **The campaign cannot exit learning.** Purchase optimisation needs ~50
  purchases per ad set per week. At AED 100/day the ceiling is 4–7 per week
  across two ad sets — **7–15% of the threshold**. The per-ad-set floor for this
  objective is AED 282–470/day; effective spend is ~AED 50.
- **18 ads sit in one ad set**, 11 of which spent in the last 30 days averaging
  **AED 43 each**. That ad set's lifetime: **AED 811 → 1 purchase.**
- **85.7% of lifetime spend (AED 8,716 of 10,173)** went to ads that either never
  converted or converted above break-even. 45 ads produced zero purchases for
  AED 2,761.
- **Instagram-only is losing money.** Facebook Feed is the **only placement above
  ROAS 1.0 (1.72)** and the cheapest purchase in the campaign; IG Feed takes 31%
  of budget at **ROAS 0.07**. The best ad set in account history ran Facebook +
  Instagram + Audience Network + Messenger with expansion: **CPA 96.63, ROAS
  2.05.** *(The Facebook case rests on one purchase — strong prior, not proof.)*
- **"Women 18-65" is not in force.** `advantage_audience: 1` on both ad sets, so
  age and gender are suggestions. The two ad sets differ only by a seed hint Meta
  may ignore — which is exactly why the fragmentation flag fires.
- **Your best creative is being starved.** *Hotel Room* has the highest CTR
  (3.25%) and hook rate (27.8%) of any live ad and has spent **AED 19.33 in its
  life**, zero for three days — suppressed by an ad set whose prior is one
  purchase per AED 811. Your worst, *MariamHind_PDP*, burned **AED 820.77 across
  1,423 clicks, 107 add-to-carts and 28 checkouts for zero purchases.**
- **Best ad ever: Baddie Reel — CPA 68.86, ROAS 2.45, AOV 168.** A UGC-style
  reel. Only video/UGC has ever combined volume with ROAS above 2.

---

## 5. Why completion broke — three dated causes

1. **COD stopped being chosen.** April 2025: **8 of 18 paid orders were cash on
   delivery (44%)**, including the two largest orders in store history (AED 750
   and 560). Aug–Oct 2026: **1 of 14 (7%)**. COD messaging was removed from the
   site on 23 Aug and not restored until 20 Sep — which covers most of the
   relaunch's traffic. In the UAE, COD is how a first-time buyer pays a brand
   they have never heard of. **Verify COD is actually enabled at checkout, not
   just messaged on the site** — that cannot be read from the API.
2. **The cart drawer orphans express checkout.** `cart-drawer.liquid` has **zero**
   express checkout buttons; the cart page has them. On 20 Sep I added those
   buttons; on 21 Sep I made the drawer the only post-add path, routing every
   shopper past the page I had just fixed. **This one is mine.**
3. **AED 15 shipping is never disclosed before checkout.** The shipping bar is
   gated on `cart.item_count > 0`, so a first-time visitor sees nothing. Proven by
   abandoned-checkout totals: AED 49 → 64, AED 19 → 34, **AED 36 → 51 (+41.7%)**
   — and the AED 36 tube was the landing page for 7 of 12 September orders.

---

## 6. Credibility

**198 fabricated reviews**, not 98. Face Towel XL: 99 of 100 bodies are
machine-generated filler under stock American names. Face Towel Travel: the same,
99 of 100. Sixty-three distinct stock names reused up to five times each.

It compounds: **Okendo contradicts Loox on the same page** (2 reviews / 5.0★
against 98 / 4.7★). The PDP hardcodes `89%`. An invented testimonial "Mariam A. —
Dubai" ships in the product template. The homepage carries six invented review
cards with fake handles. The hero claims "4.6★ / 100k+ customers" against a real
206 customers.

And the real reviews are buried: the Combo pack has **6 genuine ones**, including
a fulfilment complaint worth reading.

**My own structured-data snippet publishes the fabricated Loox rating to Google
as `aggregateRating`** while no rating is visible on the page — the exact pattern
Google issues manual actions for. That block should be deleted.

---

## 7. The theme

- **The home page emits no `og:image`.** `seo-meta.liquid` falls back to
  `settings.share_image`, which was never defined in the settings schema. Product
  links share fine; **the Instagram bio link shares as a grey box.** Mine.
- **JSON-LD trailing-comma bug** — if the last of the first five media items is a
  video, the Product block becomes invalid JSON and Google discards it entirely.
  Mine.
- **Pagination is broken.** `paginate` blocks render no pagination links, so
  products past #12 and articles past #9 have no path at all, for users or
  crawlers.
- **No meta-description fallback** — any product without a hand-written SEO
  description ships with none.
- **Render-blocking font chain**: nine font files from a third-party origin,
  loaded before first-party CSS. 300–600ms off LCP.
- **The marquee reads `scrollWidth` every frame** on two home-page tracks with no
  pause when offscreen — continuous forced layout at 60fps.
- **Primary CTA contrast is 2.9:1**, and the only two ways to dismiss the
  full-screen mobile popup are at ~2.8:1. The popup also fires on a 9-second
  timer with no focus trap and calls `.focus()`, yanking up the mobile keyboard.
- **Arabic is not live.** The theme is genuinely ready — `ar.json` has full
  parity and the RTL CSS pass holds up — but every piece of selling copy is in
  English in section settings and metafields.

---

## 8. Brand

Positioned on evidence: **cheaper bamboo face towels with better typography.**
Sixteen of 22 creatives argue unit price. **Bambuyu** has been trading in the UAE
since 2021 with the same face towels, the same tissue tube 4-pack, and the toilet
paper and kitchen roll the site lists as "coming soon". Noon generics sit at
roughly half BIOD's per-towel price. *(Competitor prices came from search results
— the auditor could not reach those sites. Verify before acting.)*

If that holds, **88 fils is a premium, not a low price**, and the price-led
strategy is aimed at a position the brand does not occupy.

Three defects in the creative worth knowing: the box illustration has **"YOUR
JOURNEY TO CLEAR SKIN BEGINS HERE" printed on it** in all 22 frames, which makes
the no-skin-claims policy cosmetic; `bundle-14-that` shows a pristine BIOD sheet
where "that" was supposed to point at her own towel, inverting the ad; and
`tube-01-fits` claims "It fits the cup holder" with no cup holder in frame.

The one idea worth building on: **the product is not a towel, it is the end of
the hook.** Nobody in this category owns the hook as a place, and only a brand
that lives in this humidity can show it.

---

## 9. Pricing — where the business is actually losing

**WELCOME10 charges your customer more money.** Shopify evaluates a
free-shipping rate against the subtotal *after* discounts, and free shipping sits
at AED 100. So:

| Basket | After the code | Shipping | Delivered | vs no code |
|---|---|---|---|---|
| 100 | 90.00 | 15 | **105.00** | **+5.00** |
| 110 | 99.00 | 15 | 114.00 | +4.00 |
| 118 | 106.20 | 0 | 106.20 | −11.80 |

The code only helps above **AED 111.11**. Below that it is a penalty. Penetration
confirms it: 11 of 15 current orders were eligible and **one** used it. It also
cannot touch the hero product at all — its own AED 100 minimum locks out the
AED 49 box, while the popup promises "{percent} off your first box" with the
Liquid placeholder unrendered.

**Replace it with "first order ships free, no minimum."** Worth AED 15 against
AED 4.90 — **3.1× the value**, deliverable on the hero, and free shipping can
never push an order below a free-shipping threshold.

*(One test checkout at exactly AED 100 with the code settles the post-discount
behaviour beyond doubt. The arithmetic above is verified; the Shopify evaluation
order is inferred from the rate logic.)*

### The threshold is a wall, not a nudge

**Zero orders in the entire current era fall between AED 50 and AED 100.** Order
#1105 is the proof: a customer bought 2 × Face Towel XL = **98**, missed the
threshold by **AED 2**, and paid 15 shipping. All-time, 18 orders landed at
75–99.99 and **17 of them paid the fifteen.**

Tissue works because the same mechanism fires for it, unprompted:

| | Delivered | Per unit |
|---|---|---|
| 1 tissue 4-pack | 36 + 15 = **51** | 12.75 a tube |
| 3 tissue 4-packs | **108**, free | **9.00 a tube — 29.4% better** |
| 1 Face Towel XL | 49 + 15 = **64** | 1.28 a towel |
| 2 Face Towel XL | 98 + 15 = **113** | 1.13 — only 11.7% better |

Buyers found the tissue ladder on their own: four orders at exactly AED 108.
**Tissue is now 51% of current-era merchandise revenue**, against 22% for the XL
box. The towel line cannot do the same thing because 2 × 49 = 98.

**The fix is one dirham.** Move Face Towel XL from 49 to **50**. Then 2 × 50 =
100 exactly: free shipping, **AED 1.00 a towel, 23% better than one box, and not
a fil of margin surrendered.** AED 50 was genuinely charged in Oct 2024, so it is
a return rather than an invention. With the hero at 50, a 2-box SKU is redundant
— build a quantity tier instead.

### All six compare-at prices are fictional

Not two. Every struck-through price in the catalogue is a price never charged
across 129 orders: XL 79, Travel 30, Combo 109, Bundle 316, Travel Bundle 120,
Tissue 49. The pattern gives it away — 316 = 4 × 79, 109 = 30 + 79, 120 = 4 × 30.
A ghost price list propagated into the bundle maths.

Under UAE Federal Law 15/2020 a struck-through price must have been charged for a
reasonable prior period. **Delete five of them.** On Bundle XL set the compare-at
to the component sum, **4 × 49 = 196** — a 10.2% saving you can evidence from
your own price list.

### Break-even is unreachable by repricing

Required AOV at today's CPA is roughly **AED 200**. The largest basket the
catalogue can physically produce is 231; the largest ever observed in the current
era is 180; orders above 200: **zero**. The best cannibalisation scenario tops out
at 110. **This cannot be fixed on AOV. It has to be fixed on lifetime value.**

And the store has already run that experiment. The legacy **30% subscription**
produced 2 subscribers, **10 orders and AED 907 — 7.2% of all lifetime revenue
from 2.8% of paying customers**, averaging 5 orders each. The current 5% plan has
produced **zero**: 5% on a 49 box is AED 2.45, and the subscriber still pays 15
shipping, so it is 3.8% off the delivered price. Nobody trades a recurring
commitment for 3.8%.

### The offer worth building

> **The 90-Day Box — 3 × Face Towel XL (150 towels) + 2 × Bamboo Tissue 4-pack
> (8 tubes). AED 169 one-off, AED 139 on repeat, first box AED 119. Ships free.**

- À la carte at list: 3 × 49 + 2 × 36 = **219**. So 169 is **22.8% off, provable
  from your own price list** — a compare-at you can legally print.
- First box 119 against 219 needs **no discount code**, which retires the
  WELCOME10 problem entirely.
- **AOV 169 against 106 today: +59%** — the largest AOV move available here.
- It pairs the two SKUs that actually co-occur, and leads with the one that is
  already half of revenue.
- 150 towels over 90 days is **1.67 a day — your own usage figure**, so the cycle
  is real rather than arbitrary. That is what makes a subscription hold.
- At a 65.7% margin, cumulative contribution reaches **AED 261 by the third
  delivery**, which clears even the true AED 209.52 CPA inside about six months.
  Your legacy subscribers averaged five orders each.

---

## 10. What to do

**Before 5 October — off-platform only, nothing touches the live campaign**

1. **Retire WELCOME10 today** and replace it with "first order ships free, no
   minimum." It is currently charging customers AED 5 on a AED 100 basket.
2. Get your real landed cost per box and re-derive break-even. Every target in
   this account is calibrated to an AOV that no longer exists.
3. Verify COD is enabled at checkout, not just messaged.
4. Delete the fabricated reviews and the `aggregateRating` block. Ship with no
   rating rather than a false one.
5. Move Face Towel XL to AED 50 and delete the five indefensible compare-at
   prices.
6. Fix the three theme defects that are mine: `og:image`, the JSON-LD comma, and
   express checkout in the cart drawer.
7. Turn on event deduplication in the Meta sales-channel app. Every number in the
   account is currently 2×.
8. Shoot two non-discount UGC reels in the *Baddie Reel* / *Hotel Room* register.
   That is the only format-and-message combination that has ever cleared ROAS 2
   on this account.

**After 5 October**

9. Collapse to one ad set, three ads, all placements.
10. Ring-fence a test for *Hotel Room*; stop *Immigration* (AED 80 in seven days,
    0.74% CTR, zero add-to-carts).
11. Build the 90-Day Box and put the subscription price on the cycle, not on a
    5% nudge.
12. Win back the 2024–25 buyers. Eight genuine repeat customers produced 22 of 129
   lifetime orders, and June–July 2025 ran 80–100% returning. Since the relaunch:
   **zero repeat orders out of fourteen.** About 100 real buyers sit unmailed.

**Do not** build on Appstle as configured — five subscription line items ever, a
5% discount worth 3.8% of the delivered price, and no plan on either bundle.

---

## What could not be determined

Installed-app list and script tags (token lacks access) · current checkout
payment configuration (API exposes past gateways only) · `content_ids` /
`content_type` on pixel events · UAE category benchmarks (Meta returned no data)
· whether iOS WebKit preloads the review videos before LCP · competitor pricing
(egress blocked) · real gross margin (no cost recorded — every margin figure here runs at an
assumed 65.7%) · whether the free-shipping rule leaks (three orders shipped free
below the threshold) · why Facebook, Threads
and WhatsApp spend exists on Instagram-only ad sets.
