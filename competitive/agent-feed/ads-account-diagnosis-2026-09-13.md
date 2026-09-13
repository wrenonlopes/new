# BIOD Meta account diagnosis — revision 3 (2026-09-14)

Account `431128092720483` (BIOD, AED). **Revisions 1–2 contained errors in the headline figures
and in the answer to "what changed". Both are corrected below. Do not use figures from the
earlier revisions.**

## The root error: two different numbers called "sales"

**You were reading Shopify orders. I was reading Meta-attributed purchases. I never reconciled
the two.** They are not the same number and the gap is large:

> **Meta never attributed more than ONE purchase on any single day in this period.**

So "3 sales yesterday" cannot be three ad-driven purchases — Meta did not record that on any day.
Those three orders include direct, organic and returning traffic. Every conclusion I drew from
"3 versus 0" was answering a question about a number Meta never reported.

**Before any future analysis: state which source a sales figure comes from.** Shopify total
orders and Meta-attributed purchases need separate lines in every report.

## What actually happened, by day

| Date | Spend | Impressions | Clicks | Meta purchases | CPM |
|---|---|---|---|---|---|
| 09-06 | AED 63.07 | 366 | 9 | 1 | 172.32 |
| 09-07 | AED 70.93 | 429 | 14 | 0 | 165.34 |
| 09-08 | AED 91.15 | 788 | 13 | 1 | 115.67 |
| 09-09 | AED 74.85 | 762 | 11 | 1 | 98.23 |
| 09-10 | AED 78.49 | 695 | 16 | 0 | 112.94 |
| 09-11 | AED 65.19 | 664 | 8 | 0 | 98.18 |
| 09-12 | AED 63.05 | 712 | 11 | 1 | 88.55 |
| **09-13** | **AED 97.86** | **1,242** | **30** | **0** | **78.79** |
| **09-14** | **AED 0.59** | **9** | **0** | **0** | 65.56 |

Two things this shows that I previously got wrong:

**1. "Today" in the ad account is 09-14, and it is roughly an hour old.** Nine impressions and
AED 0.59 is a day that has just started, not a delivery failure and not a statistical event.
There is nothing to diagnose in it yet.

**2. The day you mean by "today" is almost certainly 09-13 — and it was the best delivery day of
the entire period.** Highest spend (AED 97.86), most impressions (1,242), most clicks (30), and
the lowest CPM (AED 78.79). It returned zero Meta-attributed purchases.

Is that zero alarming? At the account's 2.68% conversion rate, 30 clicks would be expected to
produce 0.81 purchases, and there is a **44% chance of seeing zero anyway**. So it is not proof
that anything broke — but it is the one day worth watching, because it is the largest click
volume in the period with no conversion. If 09-14 also delivers well and converts nothing, that
becomes a signal.

## Corrected headline figures

Revisions 1–2 summed a daily breakdown that was missing rows, and reported the result as the
account total. Every derived metric was therefore wrong. Account-level figures are authoritative:

| Metric | Correct (14d) | I previously said | |
|---|---|---|---|
| Spend | **AED 951.31** | AED 925.82 | wrong |
| Impressions | **7,937** | 7,253 | wrong |
| Clicks | **149** | 131 | wrong |
| CTR | **1.88%** | 1.81% | wrong |
| CPM | **AED 119.86** | AED 127.65 | wrong |
| CPC | **AED 6.38** | AED 7.07 | wrong |
| CVR | **2.68%** | 3.05% | wrong |
| **CAC** | **AED 237.83** | AED 231.46 | wrong — Meta's own cost-per-result confirms 237.83 |
| Purchases | 4 | 4 | correct |
| Reach / frequency | 5,267 / 1.51 | not reported | — |

The direction of the conclusion does not change — it gets slightly worse. **CAC AED 237.83
against a AED 49 box is 4.9× underwater**, and you would need a CPC of AED 1.32 rather than the
AED 6.38 you are paying.

## What survives verification unchanged

Re-checked against account-level and ad-level data:

- **Tracking is healthy.** Purchase event match quality 9.3/10, full match-key coverage,
  server-side CAPI firing. Confirmed.
- **Baddie Reel is the budget leak.** AED 251.34 = **26.4% of AED 951.31**, zero purchases.
  Confirmed against the corrected denominator.
- **Mariam & Hind** produced one purchase on AED 9.77 of spend. Confirmed — still the only sale
  below the product's own price, and still far too small a sample to call a conversion rate.
- **Both ad sets are stuck in learning** — about 1 conversion per ad set per week against Meta's
  ~50 threshold. Confirmed.
- **Breakup x Biod CPM AED 15.82** — confirmed, but it is a **single day** (67 impressions) of
  data. Flagged, not concluded.
- **No delivery errors**, Opportunity Score 88/100, top recommendation "budget limited" on both
  active ad sets. Confirmed — and the advice to not raise budget while CAC is 4.9× AOV stands.

## Verification protocol — required before any figure is reported

Every error in revisions 1–2 came from skipping one of these. They are now mandatory.

1. **Start at account level for totals.** Never derive an account total by summing a lower level;
   a paginated or partial response silently under-counts.
2. **Reconcile every level before reporting.** account = Σ campaigns = Σ ad sets = Σ ads. If they
   disagree, find out why first. Revision 1 was off by AED 25.49 and shipped anyway.
3. **Establish the ad account's timezone and what "today" means in it.** Today is always partial.
   Never diagnose from a partial day, and never compare a partial day to a complete one.
4. **Name the source of every sales figure.** Meta-attributed purchase ≠ Shopify order. Ask which
   one the operator means before explaining a change in it.
5. **State n before stating a finding.** Below ~100 clicks or ~30 conversions, report "no signal",
   not a conclusion. Compute the probability of the observed result under the null before calling
   anything a change.
6. **Rank on the objective metric — cost per purchase.** Never on a proxy such as CTR.
7. **Never recommend at a level above where the variance lives.** Drill to ad level before
   proposing any cut; ad-set averages hide the ad that is carrying the result.
8. **Every number must be traceable to a specific query.** If it cannot be pointed at, it does
   not go in the report.

---

## Earlier sections (retained; figures superseded by the table above)

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
