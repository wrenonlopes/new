# BIOD campaign spec — handoff to Nordec

**Date:** 2026-09-15 · **Account:** `431128092720483` · **Currency:** AED

All figures verified live and reconciled account → campaign → ad set → ad → placement.
This supersedes the ad-set-level read in `ads-account-diagnosis-2026-09-13.md`.

---

## The problem in one line

CAC is **AED 237.83** against a **AED 49** product. CPM is **AED 119.86** against a UAE
benchmark of **AED 10–40**. No single fix closes that. Four levers have to move together, and
one of them isn't about ads.

## What was ruled out, with evidence

Don't let anyone spend time here:

| Suspected cause | Verdict | Evidence |
|---|---|---|
| Tracking broken | **No** | Purchase event match quality 9.3/10, all match keys 100%, server-side CAPI firing |
| Landing page | **No** | Click→purchase 2.68%, at UAE benchmark |
| Hook / thumbnail | **No** | CTR 1.88%, at UAE benchmark |
| Restricted placements | **No** | All 12 placements already live; cheapest with volume (FB Reels) is AED 82.53 — still 2–8× benchmark |
| Delivery errors | **No** | Zero blocking errors account-wide |
| Comedy direction | **No** | The two best-retaining ads in the account are both comedy |

## Where the money actually goes

| Placement | Spend | % | CPM | Purchases |
|---|---|---|---|---|
| Instagram Reels | AED 565.09 | 45.8% | 102.65 | **4** |
| Instagram Feed | AED 328.62 | 26.7% | 121.31 | 0 |
| Instagram Stories | AED 151.47 | 12.3% | **155.83** | 0 |
| Facebook Feed | AED 90.37 | 7.3% | 106.19 | **1** |
| Facebook Reels | AED 86.41 | 7.0% | **82.53** | 0 |
| All others | AED 11.14 | 0.9% | — | 0 |

**Do not manually exclude Instagram Stories** despite the number. With 5 total purchases there is
no statistical basis, and narrowing the pool typically raises CPM. Meta allocates badly because it
has no conversion signal — fixing the signal (lever 02) fixes the allocation.

## Retention — the metric that was missing

| Ad | CTR | Reached 25% | To end | Avg watch | Purchases |
|---|---|---|---|---|---|
| **Baddie Reel** | 1.48% | **7.7%** | 1.5% | **3s** | **0** |
| ZDF 3D Explainer Arabic | 3.36% | 16.8% | 6.1% | 11s | 0 |
| **Tissue Tube Professor** | 1.93% | **25.7%** | 11.2% | 6s | **4** |
| Mariam & Hind | 5.36% | 34.0% | 12.8% | 9s | 1 |

CTR says Baddie Reel and Tissue Tube Professor are the same ad. Retention says one loses 92% of
its audience before the quarter mark. **Retention rank-orders purchases; CTR inverts them** — the
two highest-CTR ads have one sale between them.

Decisive comparison is Baddie Reel (2,313 plays) vs Tissue Tube Professor (5,134 plays). Mariam &
Hind (47 plays) and ZDF Arabic (554) are directional only.

---

## The four levers

### 01 — Kill Baddie Reel. Today. (≈ −20 CPM)
AED 324.16 spent, 7.7% retention, zero purchases. Meta prices on engagement quality: your worst
retainer costs **AED 136.66** CPM against **AED 101.76** for your best.
**Pause the ad, not the ad set.** Do not re-hook it.

### 02 — One ad set, AED 130+/day, untouched for 7 days (≈ −30 CPM)
At AED 72 split across ad sets you get ~2 conversions/week against the ~50 Meta needs to exit
learning. Consolidate everything. Broad UAE, no interest targeting, no age limits, Advantage+
placements left ON. Make every change at once — each edit resets the 7-day clock.

### 03 — Variants off Tissue Tube Professor, not new concepts (CTR → 2.5%)
6–8 new openings on the same body. One edit session, no shoot. Add Mariam & Hind as concept two.
Target 12–16 live ads from two concepts. Benchmark: Clean Skin Club runs 110 live ads from 4 hooks.

### 04 — Point every ad at the AED 176 bundle (3.5× headroom)
Not a CPM fix — it decides whether any CPM is survivable.

| SKU | Price | Max CAC |
|---|---|---|
| Travel | AED 19 | AED 5.80 |
| Face Towel XL | AED 49 | AED 18.43 |
| Bundle Travel 3+1 | AED 56 | AED 21.38 |
| **Bundle XL 3+1** | **AED 176** | **AED 64.90** |

Frame as Bamteek does — "Buy 3 Get 1 Free" reads as value, not bigger spend. Keep AED 19 as a
downsell, never the entry ad.

## Why all four

| Scenario | CPC | CAC | vs AED 64.90 |
|---|---|---|---|
| Today (CPM 120, CTR 1.88%, CVR 2.68%) | 6.38 | 238 | 3.7× over |
| + lever 01 → CPM 100 | 5.32 | 198 | 3.1× over |
| + lever 02 → CPM 70 | 3.72 | 139 | 2.1× over |
| + lever 03 → CPM 60, CTR 2.5% | 2.40 | 90 | 1.4× over |
| + bundle page → CVR 3% | 2.40 | 80 | 1.2× over |
| + CPM 50, CTR 3% | 1.67 | **56** | **profitable** |

**Against the AED 49 box, not one scenario ever works.**

---

## Sequence and gates

**Week 1 — all changes at once, then stop.** Pause Baddie Reel and anything under 15% retention.
Consolidate. Budget to AED 130+. Bundle destination + landing page. Ship 6–8 hook variants.
> **GATE:** if AED 130/day can't be funded, stop here. At AED 72 the ad set cannot reach the
> conversion threshold even at target CPA — you'd be paying to stay stuck.

**Week 2 — read retention only.** Rank variants by 25% retention, kill under 15%. Watch CPM daily.
Do not judge on sales.
> **GATE:** CPM under 90 by day 14. If it hasn't moved, the consolidation or budget change didn't
> take effect — verify before spending more.

**Week 3 — scale the winner.** 6 more cuts from the top retainer. Test the absolution opening
("it's not your serum, it's your towel") head-to-head against the current one. Arabic cut if CPM < 80.
> **GATE:** CPM < 70 and CAC trending under AED 120 = working. CPM stuck above 100 with good
> retention = the constraint is budget scale, not creative.

**Week 4 — decide.** 7-day rolling CAC vs AED 64.90 headroom.
- CAC under 100 and falling → increase budget, it compounds
- CAC above 150 with CPM under 70 → conversion problem, fix the bundle page before more spend
- CPM still above 100 → Meta is pricing you out at this scale; marketplace is the better channel

## Measurement order — do not deviate

1. **25% retention** — readable within a day, needs zero purchases. Kill threshold 15%.
2. **CPM** — the scoreboard for the next month.
3. **7-day rolling CAC** — never daily.
4. **Daily sales** — *do not steer on this.* Slowest, noisiest number in the account.

---

## Corrections to the Nordec kickoff document

His account figures are accurate (verified: AED 1,211.79 vs 1,216.82 actual; 5 purchases vs 5).
He reports outbound CTR, the stricter metric. Two things need changing:

1. **Priority 1 is wrong.** He plans a shoot day re-hooking Baddie Reel because it "showed real
   promise... when people click through, they buy." It has **35 clicks and zero purchases** over
   his own window, plus 7.7% retention. His own document contradicts this on page 2 ("Tissue Tube
   M/W is the standout, not the Baddie Reel"). **Kill it, don't re-hook it.**
2. **Mariam & Hind is already under his target CPA.** AED 9.77 against his AED 12.90 target and
   AED 18.43 max — on AED 9.77 of total spend. n=1, so unproven, but untested rather than failed.
   Fund it before shooting anything new.

Also: his margin table states "confirmed 45% gross margin" but every profit figure works out to
30–38% of price. Break-even ROAS maths is internally consistent, so probably net of fees — but ask
what was deducted, because those numbers set every CPA target in the plan.

## Realistic expectation

CPM 120 → 70 is very achievable. **70 → 50 is harder** and depends on reaching enough scale that
Meta stops pricing BIOD as a thin, unproven advertiser. Plan for CAC landing around **AED 80–120**
after a good month, not 56.

**1–2 orders a day is not a creative failure — it is what AED 72/day buys at a AED 238 CAC.** This
plan roughly triples what that budget produces. Beyond that needs more budget, a higher-value
basket, and a cheaper channel. Probably all three.
