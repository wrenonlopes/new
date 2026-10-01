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

     tube     AED 36 per 4-pack of tubes              36/4   = AED 9 a tube
     each tube holds 50 three-ply tissues           4 x 50 = 200 per pack
     box inside the XL bundle                       176/4  = AED 44 a box
   Per tube and per box rather than per tissue or per towel on these frames:
   the unit a buyer actually picks up is more legible than the smaller number,
   and AED 9 reads as a price where 18 fils reads as an abstraction.
   The modal tissue-tube order in the data is three 4-packs at AED 108 -- the
   free-shipping threshold is already shaping how people buy it, unprompted.

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
    /* The hero idea for this product. A cylinder goes in a cup holder and a
       rectangle does not -- it is a demonstration rather than a claim, and it
       is already the angle working in the account: the ad set runs on car
       interests and three traced orders have come through it. */
    id: 'tube-01-fits',
    label: 'Tissue tube — it fits',
    kind: 'line', product: 'tube',
    hero: 'it fits the cup holder',
    support: "a square box doesn't. it slides around the back seat and gets in the way.",
    furniture: 'AED 9 a tube · 3-ply bamboo · 50 tissues in each',
    footnote: 'four tubes, AED 36.',
    primary: [
      'a cardboard tissue box will not go in a cup holder. this will.',
      'round, upright, out of the way. 50 three-ply bamboo tissues a tube.',
      'four tubes, AED 36.',
    ],
    headline: 'the tissue tube that fits a cup holder',
  },
  {
    /* The price, in the unit people pick up. */
    id: 'tube-02-nine',
    label: 'Tissue tube — AED 9 a tube',
    kind: 'fils', size: 'cur', product: 'tube',
    hero: 'AED 9', heroTail: 'a tube',
    support: 'four of them, AED 36. 50 three-ply bamboo tissues in each.',
    furniture: 'fits a cup holder · 3-ply bamboo · 200 tissues in the pack',
    footnote: 'the four-pack is AED 36.',
    primary: [
      'AED 9 a tube.',
      'four tubes, 200 three-ply bamboo tissues, and every one of them fits a cup holder.',
      'AED 36 the pack.',
    ],
    headline: 'AED 9 a tube, fits a cup holder',
  },
  {
    /* Problem install: a question whose honest answers all indict the box. */
    id: 'tube-03-loose',
    label: 'Tissue tube — nowhere to put a box',
    kind: 'ask', product: 'tube',
    hero: 'where does a square tissue box actually sit?',
    support: 'not the cup holder. so it slides around the back seat instead.',
    furniture: 'AED 9 a tube · 3-ply bamboo',
    footnote: 'four tubes, 200 tissues, AED 36.',
    primary: [
      'a tissue box in a car has one home: loose, on a seat, sliding.',
      'this one stands in the cup holder and stays there.',
      'AED 9 a tube, four for AED 36.',
    ],
    headline: 'a tissue box fits nowhere in a car',
  },
  {
    /* The design argument the owner called the hero: it is the only tissue
       product that does not visibly cheapen the interior it sits in. */
    id: 'tube-04-interior',
    label: 'Tissue tube — it looks good in there',
    kind: 'line', product: 'tube',
    hero: 'it actually looks good in there',
    support: 'round, upright, in the cup holder. not a cardboard box sliding around behind you.',
    furniture: 'AED 9 a tube · 3-ply bamboo · 50 tissues in each',
    footnote: 'four tubes, AED 36.',
    primary: [
      'every other tissue box in a car looks like it was put there in an emergency.',
      'this one is round, upright and in the cup holder where it belongs.',
      'AED 9 a tube. four for AED 36.',
    ],
    headline: 'tissues that suit the car',
  },
  {
    /* Per box rather than per towel. AED 44 is the unit a buyer handles, and
       it is the only figure that makes the bundle look like four purchases
       instead of one large one. */
    id: 'bundle-07-perbox',
    label: 'Bundle — AED 44 a box',
    kind: 'fils', size: 'cur',
    hero: 'AED 44', heroTail: 'a box',
    support: 'four boxes, AED 176. 50 large ultrasoft towels in each.',
    furniture: '200 large towels · ultrasoft 100% bamboo · delivery free',
    footnote: PACK,
    primary: [
      'AED 44 a box.',
      'four boxes, 200 large ultrasoft towels, 100% bamboo fibre.',
      'AED 176 the pack, delivered free.',
    ],
    headline: 'AED 44 a box, four in the pack',
  },
  {
    /* Supply rather than spend: converting money into time is what turns a
       large outlay into a stocked cupboard. */
    id: 'bundle-08-months',
    label: 'Bundle — six months',
    kind: 'line',
    hero: 'six months of clean towels',
    support: '200 of them. a fresh one every time, at 88 fils a towel.',
    furniture: '88 fils a towel · ultrasoft 100% bamboo · delivery free',
    footnote: PACK,
    primary: [
      '200 large towels is about six months of a fresh one every time.',
      '88 fils each, ultrasoft 100% bamboo.',
      'AED 176, delivered free.',
    ],
    headline: 'six months, 88 fils a towel',
  },
  {
    /* Decision cost, not discount: the argument for buying up is that you
       stop having to decide again. */
    id: 'bundle-09-once',
    label: 'Bundle — buy it once',
    kind: 'line',
    hero: 'buy it once',
    support: "200 towels. you won't think about this again for six months.",
    furniture: '88 fils a towel · ultrasoft 100% bamboo · delivery free',
    footnote: PACK,
    primary: [
      'one box runs out in seven weeks. four do not.',
      '200 large ultrasoft towels at 88 fils each, so you stop reordering.',
      'AED 176, delivered free.',
    ],
    headline: 'buy it once, stop reordering',
  },
  {
    /* The one non-price frame for the face towel: the proposition itself,
       stated without naming disposal. */
    id: 'single-02-once',
    kind: 'line', product: 'single',
    label: 'Single — one towel, one face, once',
    hero: 'one towel. one face. once.',
    support: 'then tomorrow you take a fresh one. 50 large ultrasoft towels to a box.',
    furniture: 'AED 49, was 79 · ultrasoft 100% bamboo',
    footnote: 'or four boxes at 88 fils a towel, delivery free.',
    primary: [
      'one towel, one face, once.',
      'then tomorrow you take a fresh one. 50 large ultrasoft bamboo towels, AED 49.',
      'or four boxes at 88 fils a towel, delivered free.',
    ],
    headline: 'one towel, one face, once',
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
