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

Two things jump out:

1. **Half your budget is in the ad set that performs 3.3× worse.** AE_EN_CNV – COLD has spent
   *more* than Tissue Tube and returned a third of the purchases.
2. **Your best CTR in the entire account is on a paused ad.** The Arabic creative pulled **3.37%**
   against 1.48–1.85% on everything live. That is the Arabic opening, with evidence.

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

**2. Kill AE_EN_CNV – COLD, move its budget to Tissue Tube M/W.**
AED 440.72 vs AED 134.07 per purchase. Consolidating also doubles the signal into one ad set,
which is the only way to move toward exiting learning. Expect blended CAC to fall toward
AED 134 immediately — roughly a 40% improvement for one switch.

**3. Run one ad set, not two.** At AED 66/day, splitting the budget guarantees both ad sets stay
in learning forever. One ad set at full budget is strictly better until you have volume.

**4. Unpause the Arabic creative.** 3.37% CTR, best in the account, currently off.

**5. Consider optimising for Add to Cart temporarily.** With 4 purchases per fortnight there is
not enough purchase signal to train on. Optimising for a higher-volume upper-funnel event gets
the ad set out of learning, then you switch back. *Trade-off: it buys volume at the cost of
intent, so only do this while volume is the binding constraint.* If you do, fix match quality on
those events first — AddToCart EMQ is **6.6** and InitiateCheckout **6.1** (email and phone
coverage only 15–20%) versus 9.3 on Purchase.

**6. Then, and only then, raise budget.** Once CAC is below AOV, Meta's budget recommendation
becomes correct and you should follow it hard.

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
