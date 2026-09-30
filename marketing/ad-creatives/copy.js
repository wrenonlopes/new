/*
 * Ad copy, with the arithmetic that backs every figure recorded beside it.
 *
 * Kept separate from build.js so wording can change without touching layout.
 * Nothing here is lifted from the storefront.
 *
 * The number hierarchy is the rule the whole set obeys: the per-towel price is
 * the largest figure on every bundle frame and AED 176 is always a footnote.
 * A low unit price reads as value; the pack total reads as an outlay, and an
 * outlay is what the buyer is deciding whether to avoid.
 */

/* Verified against the Shopify catalogue, the delivery profile and the
   discount rules. Re-check before changing any price on a creative.
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

/* WELCOME10 is deliberately absent from every creative. On cold traffic it
   adds a second number and a condition to the frame, and 79 fils promised on
   an image against 88 fils at the product page is a price rise at the worst
   possible moment. It belongs on retargeting and abandoned-cart links as
   ?discount=WELCOME10, where it arrives already applied. */

const PACK = 'the full pack is AED 176, delivered free.';
const QUALITY = 'ultrasoft 100% bamboo';

const CONCEPTS = [
  {
    /* The purest form of the brief: one number, as large as the frame allows,
       and nothing competing with it. */
    id: 'bundle-01-fils',
    label: 'Bundle — the number',
    kind: 'fils', size: 'xl',
    hero: '88', unit: 'fils', heroTail: 'a towel',
    support: '200 of them in the pack. ultrasoft, 100% bamboo fibre.',
    furniture: `200 large towels · ${QUALITY} · delivery free`,
    footnote: PACK,
    primary: [
      '88 fils a towel.',
      '200 large ultrasoft towels, 100% bamboo fibre, a fresh one every time.',
      'the full pack is AED 176, delivered free.',
    ],
    headline: '88 fils a towel',
  },
  {
    /* Volume and unit price stated together: the pile is the value, the unit
       price is what makes the pile affordable. */
    id: 'bundle-02-volume',
    label: 'Bundle — the pile',
    kind: 'stack',
    qty: '200 towels',
    hero: '88', unit: 'fils', heroTail: 'each',
    support: 'four boxes of 50. a fresh one every time, for about six months.',
    furniture: `200 large towels · ${QUALITY} · delivery free`,
    footnote: PACK,
    primary: [
      '200 large towels. 88 fils each.',
      'four boxes of 50, ultrasoft 100% bamboo, a fresh one every time.',
      'the full pack is AED 176, delivered free.',
    ],
    headline: '200 towels, 88 fils each',
  },
  {
    /* Same number, different trigger: crossing below one dirham is a threshold
       event, and thresholds are felt rather than calculated. */
    id: 'bundle-03-dirham',
    label: 'Bundle — under a dirham',
    kind: 'line',
    hero: 'not even a dirham',
    support: '88 fils a towel. 200 of them, ultrasoft 100% bamboo.',
    furniture: '88 fils a towel · 200 large towels · delivery free',
    footnote: PACK,
    primary: [
      'a clean towel for your face costs less than a dirham.',
      '88 fils, to be exact. 200 large ultrasoft towels in the pack.',
      'the full pack is AED 176, delivered free.',
    ],
    headline: 'less than a dirham a towel',
  },
  {
    /* Landed cost, not list price: one box delivered against four delivered.
       Both sides are live prices plus the published AED 15 rate, so this is
       the one anchor nobody can answer with "4 x 49 = 196". */
    id: 'bundle-04-drop',
    label: 'Bundle — the drop',
    kind: 'drop',
    heroFrom: 'AED 1.28',
    hero: '88', unit: 'fils', heroTail: 'a towel',
    support: 'one box, delivered: AED 64. four boxes, delivered: AED 176.',
    furniture: `200 large towels · ${QUALITY} · delivery free`,
    footnote: PACK,
    primary: [
      'one box is AED 49, plus 15 delivery. that is AED 1.28 a towel.',
      'four boxes is AED 176, delivery free. that is 88 fils a towel.',
      '200 large ultrasoft towels, 100% bamboo fibre.',
    ],
    headline: 'AED 1.28 a towel, or 88 fils',
  },
  {
    /* Partitioning: AED 176 evaluated as a monthly running cost rather than as
       a single outlay. The unit price still leads. */
    id: 'bundle-05-month',
    label: 'Bundle — by the month',
    kind: 'fils',
    hero: '88', unit: 'fils', heroTail: 'a towel',
    support: "that is about AED 27 a month. one box runs out in seven weeks — four don't.",
    furniture: `200 large towels · ${QUALITY} · delivery free`,
    footnote: PACK,
    primary: [
      'about AED 27 a month, for a fresh towel every time.',
      "the 50-box works out at AED 1.28 a towel once delivery's on it. this one is 88 fils.",
      'ultrasoft bamboo, 200 large towels, delivered free.',
    ],
    headline: '88 fils a towel, delivery free',
  },
  {
    /* The only asset that gives her a problem before it gives her a price. A
       date could be answered "yesterday", which lets the towel off; a count
       cannot be answered flatteringly. Runs in its own ad set -- in a shared
       one the price creatives win the first 48 hours on CTR and this starves
       before it can show whether the problem frame opens the category. */
    id: 'bundle-06-hook',
    label: 'Bundle — the hook',
    kind: 'ask',
    hero: 'how many times has that towel touched your face since it was washed?',
    support: "it's not you. it's the damp hook.",
    furniture: `88 fils a towel · ${QUALITY}`,
    footnote: 'a fresh one, every time. ' + PACK,
    primary: [
      "the hook towel doesn't get washed. it just gets used again.",
      'this is 200 in a box — a fresh one every time, for about six months.',
      'ultrasoft bamboo, 88 fils a towel. AED 176, delivered free.',
    ],
    headline: "it's not you, it's the damp hook",
  },
  {
    /* The entry SKU, and the only one with sales history behind it. No
       per-towel figure here: at AED 1.28 landed it is the weakest unit price
       in the catalogue, and printing it would undercut every bundle asset. */
    id: 'single-01-fifty',
    label: 'Single — 50 for 49',
    kind: 'line', size: 'lg', product: 'single',
    hero: '50 for 49',
    support: '100% bamboo fibre, ultrasoft, 50 large towels. about seven weeks to a box.',
    furniture: `AED 49, was 79 · ${QUALITY}`,
    /* The AED 15 is stated as a rule rather than as a penalty: naming the
       threshold lets it do the upselling, where naming the charge prices the
       click before it happens. */
    footnote: 'delivery 15 under AED 100, free above · or take four boxes',
    primary: [
      '50 large ultrasoft bamboo towels, AED 49. was 79.',
      'delivery is 15 under AED 100 and free above it, so four boxes ship free.',
      'a fresh one every time, about seven weeks to a box.',
    ],
    headline: '50 large bamboo towels, AED 49',
  },
];

module.exports = { CONCEPTS };
