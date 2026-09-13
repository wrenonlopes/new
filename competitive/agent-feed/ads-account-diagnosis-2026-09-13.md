# BIOD Meta account diagnosis — 2026-09-13

Account `431128092720483` (BIOD, AED). Window: last 14 days. All figures pulled live.

## The short answer: nothing changed

Your ads produced **4 purchases in 14 days** — 0.286 per day. At that rate, the daily
distribution is:

| Sales in a day | Probability |
|---|---|
| **0** | **75.1%** |
| 1 | 21.5% |
| 2 | 3.1% |
| 3 | 0.3% |

**Three out of four days should have zero ad-driven sales.** Today is the normal case.
*Yesterday* was the 0.3% event — and if all three of yesterday's sales came from ads, that was
luck, not a setting you've since broken. Nothing in the account changed: no delivery errors, no
disapprovals, pixel fired today.

Reading daily sales at this volume will make you change things at random and destroy the little
signal you have. **Use a 7-day rolling number.** Nothing below a week is information.

## What is actually wrong — the economics

| Metric | Value | Read |
|---|---|---|
| Spend (14d) | AED 925.82 | AED 66/day |
| Impressions | 7,253 | very thin |
| CPM | **AED 127.65** | 2–4× a normal UAE CPM |
| CTR | 1.81% | **fine — creative works** |
| CPC | **AED 7.07** | this is the broken number |
| CVR (click→purchase) | 3.05% | **fine — site converts** |
| Purchases | 4 | |
| **Blended CAC** | **AED 231.46** | |

Against your own pricing:

| Product | CAC ÷ AOV | CPC you'd need |
|---|---|---|
| Dhs 19 trial | **12.2×** | AED 0.58 |
| Dhs 49 box | **4.7×** | AED 1.50 |
| Dhs 100 order | 2.3× | AED 3.05 |
| Dhs 150 bundle | 1.5× | AED 4.58 |

**You are paying AED 231 to sell a AED 49 box.** Every sale loses money, so more spend means
more loss. That is the whole problem, and it is not a creative problem.

## What is NOT wrong — stop looking here

- **Tracking is healthy.** Purchase event match quality **9.3/10**, all eleven match keys at 100%
  coverage, pixel fired today, server-side CAPI live, first-party cookies on. Ruled out.
- **Creative works.** 1.81% CTR on cold traffic is respectable. The films are earning the click.
- **The landing page converts.** 3.05% click-to-purchase is a normal-to-good ecommerce rate.
- **No delivery errors.** Zero blocking issues account-wide.

The funnel is healthy at every step. It is simply priced wrong: traffic costs more than the
product earns.

## Why it will not fix itself: permanent learning phase

Meta needs roughly **50 conversions per ad set per week** to exit the learning phase. You have
two active ad sets producing about **1 conversion per ad set per week — 2% of the threshold.**

The algorithm has never had enough signal to optimise. It is guessing, and it will keep guessing
at this volume no matter how long it runs. This also explains the AED 127 CPM: an unoptimised
ad set bids badly.

## Ad set breakdown

| Ad set | Spend | Purchases | Cost/purchase | Status |
|---|---|---|---|---|
| **Tissue Tube M/W** | AED 402.20 | 3 | **AED 134.07** | Active — your best |
| **AE_EN_CNV – COLD** | AED 440.72 | 1 | **AED 440.72** | Active — 3.3× worse |
| 3D Arabic Ad Only | AED 82.90 | — | — | **PAUSED, and CTR 3.37%** |

> **Superseded — see "Correction: the ad-set read was wrong" below.** Cutting at ad-set level
> would kill the cheapest purchase in the account. The cut belongs one level down.

Account hygiene: 8 campaigns exist, 7 dormant; 14 ad sets, 12 not spending. Several show status
ACTIVE under `CAMPAIGN_PAUSED`. Not harmful, but it makes the account unreadable.

## Where I disagree with Meta

Meta's Opportunity Score is **88/100** and its highest-lift recommendation (6 points) is
**"budget limited — consider increasing your budget"** on both active ad sets.

**Do not do that yet.** That recommendation optimises for volume, not profit, and it has no idea
what your margin is. At AED 231 CAC on a AED 49 product, raising budget buys losses faster.
Fix the economics first, then scale — in that order. Meta's other suggestion, switching the
performance goal to maximise conversions, you are *already* doing (`OFFSITE_CONVERSIONS`).

## What to change, in order

**1. Raise AOV above AED 150. This is the only lever that makes the maths work.**
At a 3.05% CVR and AED 7 CPC, a AED 49 order can never pay for itself. Bundles, multi-packs,
towel + tube sets, subscription-first. Push the free-delivery threshold to pull basket size —
this is the one argument *for* keeping it at Dhs 100 rather than dropping to Dhs 70, and it
cuts against my earlier recommendation. Decide it on margin, not on matching Bambuyu.

**2. Kill the ad, not the ad set: turn off Baddie Reel.**
AED 251.34 — **26% of all account spend** — on zero sales, with the worst CTR (1.19%) and the
highest CPM (AED 156.99) of any ad with real volume. This is the budget leak. Cutting at ad-set
level instead would take Mariam & Hind down with it.

**3. Run one ad set, not two.** At AED 66/day, splitting the budget guarantees both ad sets stay
in learning forever. One ad set at full budget is strictly better until you have volume.

**4. Give Mariam & Hind real budget.** It has spent **AED 9.77** and produced one purchase — the
only sale in the account at a CAC below the product price. One purchase from three clicks is
noise, not a conversion rate, so treat this as *untested rather than proven*: it has never been
given enough budget to fail. It is also the film that generated your first paid order.

**5. Watch Breakup x Biod's CPM.** AED 15.82 against an account average of AED 127.65 — **8×
cheaper**. At 67 impressions that is far too early to believe, but if it holds at any scale it
implies roughly AED 0.87 CPC and ~AED 29 CAC, which is the only path on this page that makes the
AED 49 box work on Meta. Let it spend before judging it.

**5. Consider optimising for Add to Cart temporarily.** With 4 purchases per fortnight there is
not enough purchase signal to train on. Optimising for a higher-volume upper-funnel event gets
the ad set out of learning, then you switch back. *Trade-off: it buys volume at the cost of
intent, so only do this while volume is the binding constraint.* If you do, fix match quality on
those events first — AddToCart EMQ is **6.6** and InitiateCheckout **6.1** (email and phone
coverage only 15–20%) versus 9.3 on Purchase.

**7. Then, and only then, raise budget.** Once CAC is below AOV, Meta's budget recommendation
becomes correct and you should follow it hard.

## Correction: the ad-set read was wrong, twice

The operator pushed back on the Arabic recommendation. They were right, and checking at ad level
found a second error.

**Error 1 — I ranked the Arabic ad on CTR, in the same document where I argued CTR is not the
bottleneck.** That is self-contradictory. If the constraint is CAC, a high click-through rate is
not a fix. The Arabic ad has **21 clicks and zero sales**.

Being precise about what that does and does not prove: at the account's 3.05% conversion rate,
21 clicks would be expected to produce 0.64 sales, and **there is a 52% chance of seeing zero
sales even if the ad converts exactly at the account average.** So zero sales does not prove the
Arabic ad is bad — but nothing about it is evidence that it is good either. Twenty-one clicks is
not a result. If anything, a high CTR paired with no conversion is a mild *warning* — it can mean
the click is curiosity rather than intent — and it is certainly not a promise.

**Error 2 — "kill AE_EN_CNV – COLD" would have destroyed the best unit economics in the account.**
That ad set contains **Mariam & Hind**, which produced a purchase at **AED 9.77** — the only sale
anywhere below the product's price. Its ad-set average was dragged to AED 440.72 by Baddie Reel
sitting in the same ad set. Cutting at the wrong level would have thrown away the one thing
working.

**What the ad-level data actually shows:**

| Ad | Spend | % of spend | CTR | CPM | Sales | Cost/sale |
|---|---|---|---|---|---|---|
| Tissue Tube Professor | AED 482.94 | 51% | 2.00% | 105.15 | **3** | AED 160.98 |
| **Baddie Reel** | AED 251.34 | **26%** | 1.19% | 156.99 | **0** | — |
| ZDF 3D Explainer Arabic | AED 94.45 | 10% | 3.36% | 151.12 | 0 | — |
| ZDF 3D Explainer (EN) | AED 54.77 | 6% | 1.39% | 152.56 | 0 | — |
| **Mariam & Hind** | AED 9.77 | 1% | 5.36% | 174.46 | **1** | **AED 9.77** |
| **Breakup x Biod** | AED 1.06 | 0.1% | 1.49% | **15.82** | 0 | — |

**48% of spend went to ads that produced no sales**, and a single ad — Baddie Reel — accounts for
26% of everything spent. The operator's own read was correct: the sales came from cold prospecting
and from the creatives inside it, specifically Tissue Tube Professor and Mariam & Hind.

**The lesson for every future read of this account:** rank ads by cost per purchase, not by CTR,
and never cut at ad-set level when one ad inside it is carrying the result.

## What this means for the marketplace argument

This is the strongest evidence yet for the Amazon.ae / Noon recommendation. Clean Skin Club does
~80% of revenue on marketplace, and this account shows why: at AED 7 per click, paid social
cannot profitably sell a AED 49 consumable to a cold audience. Marketplace traffic is
intent-driven and near-zero CAC by comparison. Meta is the right channel for the *comedy brand
building* you're doing well — it is the wrong channel to be your only till.

## Watch list for the next check

- 7-day rolling purchases and CAC, never daily
- Cost per purchase on the consolidated ad set — target under AED 60
- AOV — the number that decides whether any of this works
- Whether the ad set ever reaches 50 conversions/week
