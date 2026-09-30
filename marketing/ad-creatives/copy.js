/*
 * Ad copy for the price-led set, with the arithmetic that backs every figure.
 *
 * Kept separate from build.js so the wording can be changed without touching
 * layout, and so the provenance of each number sits next to the number itself.
 * Nothing in here is lifted from the storefront.
 */

/* Verified against the Shopify catalogue, the delivery profile and the
   discount rules. Re-check these before changing any price on a creative.
     bundle   AED 176, 4 boxes x 50 = 200 towels      176/200        = 0.88
     single   AED 49, 50 towels                       49/50          = 0.98
     single, landed (under the AED 100 free-shipping
       threshold, so +AED 15 domestic)                (49+15)/50     = 1.28
     compare-at, per towel                            79/50, 316/200 = 1.58
     WELCOME10, 10% off, minimum spend AED 100        176*0.9/200    = 0.792
     supply, at one towel a day                       200/30.4       = 6.6 months
     cost per month over that supply                  176/6.6        = 26.7
   AED 316 is the arithmetic sum of parts (4 x 79) and was never charged; the
   only former price the store has actually taken for the bundle is AED 300,
   on 5 units over a year ago. Neither survives a buyer doing 4 x 49 = 196 in
   the comments, so no struck-through total appears on any bundle creative --
   the only anchor used is landed cost, which is two live prices plus the
   published AED 15 domestic rate. */
const FACTS = {
  bundlePrice: 176, bundleTowels: 200, bundlePerTowel: '88 fils',
  singlePrice: 49, singleTowels: 50, singleLanded: '1.28',
  compareAtPerTowel: '1.58', monthly: 27, months: '6.6',
};

/* WELCOME10 is deliberately absent from every creative below. On cold traffic
   it adds a second number and a condition to the frame, and 79 fils promised
   on an image against 88 fils at the product page is a price rise at the worst
   possible moment. It belongs on retargeting and abandoned-cart links as
   ?discount=WELCOME10, where it arrives already applied. */
const CONCEPTS = [
  {
    id: 'a-hook',
    label: 'Bundle — the hook (problem install, loss frame)',
    product: 'bundle',
    hero: 'how many times has that towel touched your face since it was washed?',
    support: "it's not you. it's the damp hook.",
    furniture: '88 fils a towel · ultrasoft 100% bamboo',
    footnote: 'a fresh one, every time. 200 towels, AED 176. delivery free.',
    primary: [
      "the hook towel doesn't get washed. it just gets used again.",
      'this is 200 in a box — a fresh one every time, for about six months.',
      'ultrasoft bamboo, 88 fils a towel. AED 176, delivered free.',
    ],
    headline: "it's not you, it's the damp hook",
  },
  {
    id: 'b-drop',
    label: 'Bundle — the drop (landed-cost anchor, gain frame)',
    product: 'bundle',
    heroFrom: 'AED 1.28',
    hero: '88 fils',
    heroTail: 'a towel',
    support: 'one box, delivered: AED 64. four boxes, delivered: AED 176.',
    furniture: '200 ultrasoft towels · 100% bamboo fibre · delivery free',
    primary: [
      'one box is AED 49, plus 15 delivery. that is AED 1.28 a towel.',
      'four boxes is AED 176, delivery free. that is 88 fils a towel.',
      '200 large ultrasoft towels, 100% bamboo fibre.',
    ],
    headline: 'AED 1.28 a towel, or 88 fils',
  },
  {
    id: 'c-month',
    label: 'Bundle — by the month (threshold + duration, loss frame)',
    product: 'bundle',
    hero: 'AED 27 a month.',
    heroTail: 'a fresh towel every morning.',
    support: "ultrasoft 100% bamboo. one box runs out in seven weeks — four don't.",
    furniture: '88 fils a towel · 200 towels, AED 176 · delivery free',
    primary: [
      'about AED 27 a month, for a fresh towel every morning.',
      "the 50-box works out at AED 1.28 a towel once delivery's on it. this one is 88 fils and delivery's free over AED 100.",
      'ultrasoft bamboo, 200 towels, AED 176.',
    ],
    headline: '88 fils a towel, delivery free',
  },
  {
    id: 'd-fifty',
    label: 'Single — 50 for 49 (entry, gain frame)',
    product: 'single',
    hero: '50 for 49',
    support: '100% bamboo fibre, ultrasoft, 50 large towels. about seven weeks to a box.',
    furniture: 'AED 49, was 79 · ultrasoft 100% bamboo',
    footnote: 'delivery 15 under AED 100, free above · or take four boxes',
    /* The AED 15 is named rather than left for checkout to reveal: at a 19%
       checkout completion rate an ambush costs more than the click it saves. */
    primary: [
      '50 large ultrasoft bamboo towels, AED 49. was 79.',
      'delivery is 15 under AED 100 and free above it, so four boxes ship free.',
      'a fresh one every time, about seven weeks to a box.',
    ],
    headline: '50 large bamboo towels, AED 49',
  },
];

module.exports = { FACTS, CONCEPTS };
