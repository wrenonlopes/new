# What to add — BIOD, 3 October 2026

Scope set by the brief: **do not touch the ads.** Nothing in this document
changes a budget, a bid, an audience, a creative or a status on anything that is
currently serving. Everything here is either an addition, or a finding reported
for a decision that is yours.

Window for all ad figures: **26 Sep – 3 Oct** (8 days), account 431128092720483,
campaign *Wren Sales Final*. Store figures: **28 Sep – 3 Oct** (since the
restart), 7 orders.

---

## 1 · What moved since yesterday

**Order #1131 came in at 05:54 this morning** — AED 83, Dubai, cash on delivery,
Face Towel XL plus a Travel. Traced to **Hotel Room** (`content:
120251412571570201`).

That makes **Hotel Room responsible for two of the last three orders** (#1130,
#1131). It is also the ad the audit flagged last week as the starved one.

### The 8-day picture

| Ad | Spend | Share | Impr. | CTR | Orders (Shopify-traced) |
|---|---|---|---|---|---|
| Tissue Tube Professor | AED 497.06 | **72%** | 3,595 | 1.42% | 3 |
| **Hotel Room** | AED 102.84 | **15%** | 1,204 | **3.99%** | **2** |
| Immigration | AED 80.83 | 12% | 2,022 | 0.74% | 0 |
| Mariam & Hind | AED 7.93 | 1% | 179 | 1.12% | 0 |
| | **AED 688.66** | | | | **5** |

Unit costs, Hotel Room against the ad taking 72% of the budget:

| | Hotel Room | Tissue Tube Professor | |
|---|---|---|---|
| Link click | AED 2.86 | AED 13.08 | **4.6× cheaper** |
| Landing page view | AED 3.21 | AED 16.03 | **5.0× cheaper** |
| Add to cart | AED 12.86 | AED 38.24 | **3.0× cheaper** |
| Initiate checkout | AED 34.28 | AED 99.41 | **2.9× cheaper** |
| Purchase (Meta-attributed) | AED 102.84 | AED 165.69 | 38% cheaper |

On Shopify's two traced orders rather than Meta's one, Hotel Room's real cost
per order is **AED 51.42** — under the ~AED 55 break-even the last audit
established, and the only thing in the account that has ever been.

I am not proposing you move the budget. You said leave it, and the CBO is
allocating on Meta's attribution, which under-reports this ad. It is the reason
every recommendation below points at **making more things that work like Hotel
Room**, rather than at the budget split.

### Why Hotel Room works — the thing to copy

It is not the hook rate alone, it is where the drop-off isn't:

| | Hotel Room | Tissue Professor | Immigration |
|---|---|---|---|
| Reached 25% of the video | **39.1%** of impressions | 18.9% | 7.9% |
| ThruPlay / 25% | 53% | 50% | 73% |
| Clicked / ThruPlay | **19.2%** | 15.1% | 12.9% |

Hotel Room stops twice as many people as the tissue ad and five times as many as
Immigration, and then converts the attention at the highest rate of the three.
The mechanism is a **towel in a place you did not choose, with a history you
cannot see** — and crucially, the viewer supplies the disgust themselves. No
claim is made. That is why it clears policy and why it lands.

Everything new below is built on that.

---

## 2 · The Arabic question — answered

You said all our buyers are Arabs, so the UGC should be Arabic. **The buyer read
is right. The execution has a blocker you need to clear first.**

**Right:** the shipping names on the order book skew strongly Arab and Gulf —
including #1131 this morning, whose shipping name is in Arabic script, and #1121
whose city field reads إمارة دبيّ. Not uniformly (there are Romanian, Filipino,
South Asian and Western names in there too), but the centre of mass is clear.

**The blocker:** `shopLocales` returns

```
ar  ·  primary: false  ·  published: false
en  ·  primary: true   ·  published: true
```

The Arabic translation exists — `locales/ar.json`, 9.3 KB, written 27 Sep, and
it is *larger* than the English default. It has simply never been published. So
today, **biod.co serves English to everybody.**

And the orders agree: **`customerLocale` is `en-AE` or `en` on all 12 of the most
recent orders. Not one `ar`.** Including the customer with the Arabic-script
shipping name, and the one in إمارة دبيّ. Your buyers are Arab and they browse in
English, because English is the only thing on offer.

**So:** shoot the Arabic videos — the audience is right and Arabic will buy you
hook rate in a feed full of English. But publish the locale before you run them.
An Arabic ad that hands off to an English product page spends its credibility in
the half-second after the click, on exactly the audience it just earned. It is
one toggle: **Shopify admin → Settings → Languages → Arabic → Publish.**

---

## 3 · UGC videos — `marketing/ugc/scripts-ar.md`

Four Arabic scripts, Khaleeji dialect, with transliteration and English gloss so
they can be read aloud or handed to talent. Shot lists and timings included.

| # | Script | Why |
|---|---|---|
| **1** | **منشفة الفندق** — the hotel towel | **Shoot this first.** It is the proven mechanism, spoken instead of implied. Everything else in the account is a guess; this one has two orders behind it. |
| 2 | كم مرة؟ — how many times | The bathroom version of the same idea, pointed at her own towel instead of a hotel's. |
| 3 | العلبة المربعة — the square box | The tissue cup-holder demo, which carries three traced orders. Survives with the sound off. |
| 4 | **الدفع عند الاستلام** — pay the driver | **New axis, no English counterpart.** See below. |

**Why script 4 exists.** Cash on delivery appears as a payment method on exactly
two orders in the store's history — **#1130 and #1131, the two most recent, both
traced to Hotel Room.** Every order before them went through a card. For a cold
Gulf buyer looking at a brand they have never heard of, the card field is the
objection, not the price, and the last audit put checkout completion at about
20%. Nothing in the account — not one of the 22 statics, not one of the four
live videos — leads with payment. This does.

Dialect note is in the file and it matters: **Khaleeji, not MSA.** Fus-ha in a
UGC clip reads as a news bulletin, which is the exact opposite of the effect
UGC buys you. Also in there: the burn-in trap — several phone editors reverse
Arabic letter order or break the joins, so test-export one line before cutting a
whole video.

---

## 4 · Images — three new, rendered

In `marketing/ad-creatives/out/`, feed (1080×1350) and story (1080×1920), copy
and captions in `copy.js`. Each one is a **new axis**, not a 23rd way to say 88
fils.

**`biod-bundle-18-hotel`** — *"That hotel towel has a history."*
The winning video's idea as a still. Twenty-two frames argue price; none argues
scene. Runs alongside Arabic script 1, which carries the same line as its
burn-in, so the still and the video reinforce each other in the feed.

**`biod-bundle-17-cod`** — *"Pay when it reaches your door."*
Cash on delivery as the headline, per-towel price demoted to the furniture. The
static counterpart to script 4, and the only frame in the set that addresses
checkout rather than desire.

**`biod-bundle-19-ar`** — *88 فلس للمنشفة*
Arabic, RTL, set in Cairo. Western digits throughout, deliberately — that is how
a UAE price tag, a receipt and your own checkout all write them. **Hold this
one until `ar` is published**, same reason as the videos.

---

## 5 · What else

### Costs nothing, touches no ad

**a · Publish the Arabic locale.** One toggle. Gates the entire Arabic plan
above. Do this before anything else here.

**b · Two live ads appear to have no primary text and no call-to-action
button.** Querying all four live creatives with the same field list in one call:

| Ad | Primary text | CTA button |
|---|---|---|
| Hotel Room | ✓ | SHOP_NOW |
| Tissue Tube Professor | ✓ | SHOP_NOW |
| **Immigration** | — | — |
| **Mariam & Hind** | — | — |

Two came back with body copy and a CTA, two came back with neither, in the same
request. Immigration is spending AED 80.83 at **0.74% CTR** — a fifth of Hotel
Room's — and 7.9% of people who see it reach the 25% mark. An ad with no copy
and no button would explain that precisely. The airport-security video *does*
have good copy written for it ("Declare your liquids… maybe declare the towel
you've been rubbing on your face for six weeks") — it is sitting on a duplicate
creative object that this ad is not wired to.

Fixing it means editing those two ads, which is outside the brief, so I have not
touched them. Worth thirty seconds in Ads Manager to confirm with your own eyes:
<https://www.facebook.com/adsmanager/manage/ads/edit?act=431128092720483&selected_ad_ids=120251405864530201>

**c · Your average order sits below your own free-delivery threshold.**
Seven orders since the restart, AED 698.40 gross, AOV **AED 99.77**. Strip out
the AED 15 that three of them paid in shipping and the merchandise average is
**AED 93.34** — **AED 6.66 under the AED 100 line.**

The sharpest single case is this morning's #1131: AED 68 of product, so they
paid AED 15 and took it to 83. One more tissue 4-pack would have put them at
AED 104, free delivery, **AED 21 more spent for AED 36 of product.** Nobody told
them. The progress bar that would have — `snippets/free-shipping-bar.liquid` —
is gated at line 18 on `cart.item_count > 0`, so a first-time visitor browsing a
product page never sees the threshold at all.

**d · Express checkout is still missing from the cart drawer.** `cart-drawer.liquid`
has zero occurrences of `payment_button` / `content_for_additional_checkout_buttons`;
`main-cart.liquid` and `main-product.liquid` have one each. The drawer is the only
post-add path, so the buttons that exist are unreachable. This is my regression
from 20–21 Sep and it sits directly on the 20% completion rate.

**e · Meta event deduplication.** Every event is still counted twice, which is
why Meta reports one purchase for Hotel Room where Shopify traces two, and why
the CBO is allocating against a distorted picture. Fixing measurement does not
change delivery today, but every decision after it gets better.

### Genuinely additive on Meta, from the Opportunity Score (81/100)

**f · Partnership ads — Meta estimates 19% lower cost per result.** This is the
one recommendation that fits the UGC plan exactly: when the Arabic clips are
shot, run them as partnership ads so they carry signals from both the BIOD page
and the creator's (or your own) handle, instead of as a plain page post. It is a
property of how a *new* ad is created, so it costs nothing on anything currently
running.

**g · Reuse the raw footage.** Each 20-second clip cuts into three 8-second
Stories variants, and Meta counts those as separate creative. Four scripts shot
once becomes twelve assets.

### Reported, not proposed — these would touch the ads

- **Fragmentation.** Meta flags ad sets `AE_EN_CNV - COLD` and `Tissue Tube M/W`
  as similar setups with different audiences, competing with each other and both
  taking longer to optimise. Combining them is the single largest item on the
  Opportunity Score (+8). It is also exactly the 72/15 split above.
- **Budget limited** (+6). You have fixed AED 100/day. Noted and left alone.
- **Creative library hygiene.** Still active in the library (mostly on paused
  ads): four creatives claiming "Reduces Acne & Breakouts" and "Free from
  Infections"; six whose description reads "50 **Single-Use** Large Towels…
  free from germs, dirt, and bathroom residues"; two in `PRIVACY_CHECK_FAIL`;
  two with empty bodies; one titled literally `{{product.name}}`; and four
  telling a paid-feed viewer to use the "link in bio", where there is no bio.
  None of this is serving today. All of it is a policy exposure the day
  something gets duplicated.

---

## 6 · One honest caveat about "adding"

There is no way to put a new creative inside `AE_EN_CNV - COLD` or
`Tissue Tube M/W` without Meta treating it as a significant edit to that ad set.
Adding an ad is on Meta's own list.

In this account that matters less than it normally would — at 5 purchases in 8
days both ad sets are permanently learning-limited and will never hit the 50
conversions a week that exiting learning requires, so there is no accumulated
learning to lose. The real risk is simpler: a new ad in that ad set competes
with Hotel Room for a budget Hotel Room is already only getting 15% of.

**The clean way to add is a new ad set**, with the new Arabic creative in it,
leaving all four current ads untouched. On a fixed AED 100/day under CBO that
still draws from the same pool — so the honest statement is that *every* addition
on Meta costs something, and the only free wins on this page are (a), (c), (d)
and (e), which happen on the store and not in the ad account.

My order, if it were mine: **publish `ar` → fix the cart drawer → ungate the
shipping bar → shoot script 1 → everything else.**
