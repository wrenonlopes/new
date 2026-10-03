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
     supply, per the owner                            200 towels     = 4 months
     which implies                                    200/122 days   = ~1.6 a day
     so one box is about a month                      50/1.6         = ~31 days
     cost per month over that supply                  176/4          = AED 44

     tube     AED 36 per 4-pack of tubes              36/4   = AED 9 a tube
     each tube holds 50 three-ply tissues           4 x 50 = 200 per pack
   Face towels are always priced per towel (88 fils) and the tube always per
   tube (AED 9). For the tube the unit a buyer picks up is the tube, and AED 9
   reads as a price where 18 fils reads as an abstraction; for the towels the
   towel is that unit, and 88 fils is the number the whole account is built on.
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

/* The one published figure the brand already cites on its own site. Stated as
   a study finding with the source on the frame, never as a claim about what
   the product does to skin: a cited result is defensible, a health benefit is
   not. The "hand-towel data" qualifier stays on the creative -- it is the
   obvious rebuttal, and pre-empting it is what makes the rest credible. */
/* First-party, countable in admin, and the only proof in this account that is
   not disputed: the store's first order was 14 July 2024. The date is the
   usable signal rather than the order count -- it defeats the "this appeared
   last week" read without needing a big number. Cash on delivery is the other
   one: in the UAE it is the mechanism for buying from a brand you do not know,
   and it was buried in a single furniture line until now. */
const TRUST = 'shipping in the UAE since July 2024';

/* The owner's call, and it is the right one: a shopper compares "less than
   AED 1" against the dirham they already have a feel for, where 88 fils has to
   be converted first. Same number, one fewer step. 176/200 = 0.88, so it is
   true, and the pack total stays on every frame as the footnote so the
   arithmetic is checkable. */
const UNDER_ONE = 'less than AED 1 a towel';

const STUDY = 'Gerba et al · University of Arizona · Food Protection Trends, 2014 · hand-towel data';
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
    support: 'four boxes of 50. a fresh one every time, for about four months.',
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
    hero: 'Not even a dirham',
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
    support: 'that is about AED 44 a month. one box lasts a month — there are four in the pack.',
    furniture: `200 large towels · ${QUALITY} · delivery free`,
    footnote: PACK,
    primary: [
      'about AED 44 a month, for a fresh towel every time.',
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
    hero: 'How many times has that towel touched your face since it was washed?',
    support: "it's not you. it's the damp hook.",
    furniture: `88 fils a towel · ${QUALITY}`,
    footnote: 'a fresh one, every time. ' + PACK,
    primary: [
      "the hook towel doesn't get washed. it just gets used again.",
      'this is 200 in a box — a fresh one every time, for about four months.',
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
    hero: 'It fits the cup holder',
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
    hero: 'Where does a square tissue box actually sit?',
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
    hero: 'It actually looks good in there',
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
    /* Priced per towel like every other face-towel frame, but arguing the
       shape of the pack: four separate boxes, which is what stops AED 176
       being evaluated as one large object. */
    id: 'bundle-07-four',
    label: 'Bundle — four boxes, not one',
    kind: 'fils',
    hero: '88', unit: 'fils', heroTail: 'a towel',
    support: 'it arrives as four boxes, not one. bathroom, gym bag, desk, spare.',
    furniture: '200 large towels · ultrasoft 100% bamboo · delivery free',
    footnote: PACK,
    primary: [
      '88 fils a towel, and it comes as four separate boxes rather than one.',
      'bathroom, gym bag, desk, spare. 50 large ultrasoft towels in each.',
      'AED 176, delivered free.',
    ],
    headline: 'Four boxes, 88 fils a towel',
  },
  {
    /* Supply rather than spend: converting money into time is what turns a
       large outlay into a stocked cupboard. */
    id: 'bundle-08-months',
    label: 'Bundle — four months',
    kind: 'line',
    hero: 'Four months of clean towels',
    support: '200 of them. one box a month, four months in the pack, 88 fils a towel.',
    furniture: '88 fils a towel · ultrasoft 100% bamboo · delivery free',
    footnote: PACK,
    primary: [
      '200 large towels is about four months of a fresh one every time.',
      '88 fils each, ultrasoft 100% bamboo.',
      'AED 176, delivered free.',
    ],
    headline: 'Four months, 88 fils a towel',
  },
  {
    /* Decision cost, not discount: the argument for buying up is that you
       stop having to decide again. */
    id: 'bundle-09-once',
    label: 'Bundle — buy it once',
    kind: 'line',
    hero: 'Buy it once',
    support: "200 towels. you won't think about this again for four months.",
    furniture: '88 fils a towel · ultrasoft 100% bamboo · delivery free',
    footnote: PACK,
    primary: [
      'one box lasts about a month. four boxes last four.',
      '200 large ultrasoft towels at 88 fils each, so you stop reordering.',
      'AED 176, delivered free.',
    ],
    headline: 'buy it once, stop reordering',
  },
  {
    /* The juxtaposition. It asserts nothing -- she supplies the consequence
       herself, and "that" with no antecedent makes her look at her own hook.
       This is the frame the set was missing: desire, problem and proof
       together, with the sheet rather than the box as the image. */
    id: 'bundle-14-that',
    label: 'Bundle — then you dry it on that',
    kind: 'ask', art: 'sheet',
    hero: 'You wash your face. Then you dry it on that.',
    support: 'a fresh towel every time. 200 of them, four boxes, 88 fils each.',
    furniture: TRUST,
    footnote: PACK,
    primary: [
      'you just cleaned your face. now you are drying it on the towel that has been on the hook since tuesday.',
      'a fresh one every time instead. 200 large ultrasoft towels, 88 fils each.',
      'AED 176, delivered free.',
    ],
    headline: 'A fresh towel every time',
  },
  {
    /* The sensory frame. Nineteen creatives showed the box, which is
       packaging; this one shows the sheet, which is the product. The whole
       proposition is tactile and nothing in the set was carrying it. */
    id: 'bundle-15-sheet',
    label: 'Bundle — the sheet itself',
    kind: 'line', size: 'sm', art: 'sheet',
    hero: 'This is the part that touches your face',
    support: 'ultrasoft, 100% bamboo fibre. used once, then you take a fresh one.',
    furniture: '88 fils a towel · 200 in the pack · delivery free',
    footnote: PACK,
    primary: [
      'this is the sheet. ultrasoft, 100% bamboo fibre, large.',
      'you use it once and take a fresh one. 200 in the pack, 88 fils each.',
      'AED 176, delivered free.',
    ],
    headline: 'Ultrasoft bamboo, used once',
  },
  {
    /* Head to head. Every line is a logistical or behavioural fact -- how the
       object is used, stored and laundered. No line claims anything about
       skin, germs or health: those are the claims that get an ad reported,
       and they are not needed when the handling facts are this lopsided. */
    id: 'bundle-10-versus',
    label: 'Bundle — head to head',
    kind: 'versus',
    hero: 'Your towel vs ours',
    columns: ['Your face towel', 'BIOD'],
    rows: [
      ['Used again and again', 'A fresh one every time'],
      ['Damp between uses', 'Dry and unused until you open it'],
      ['Washed… when, exactly?', 'Never washed. Never reused.'],
      ['Shares a hook with everyone', 'Yours alone, once'],
      ['Another thing in the laundry', 'Nothing to launder'],
    ],
    furniture: '88 fils a towel · ultrasoft 100% bamboo · delivery free',
    footnote: PACK,
    primary: [
      'the towel on the hook gets used again. and again. and then washed, eventually.',
      'this one is fresh every time, 88 fils a towel, and never sees a washing machine.',
      '200 large ultrasoft towels, AED 176, delivered free.',
    ],
    headline: 'A fresh towel every time',
  },
  {
    /* The informative frame. The percentage is a cited research finding, not a
       discount -- the only place a % belongs in this set. */
    id: 'bundle-11-study',
    label: 'Bundle — the study',
    kind: 'stat',
    hero: '89%',
    statLine: 'of 82 used hand towels tested carried coliform bacteria.',
    support: 'a fresh sheet skips the question entirely. 200 of them in the pack.',
    source: STUDY,
    furniture: '88 fils a towel · ultrasoft 100% bamboo · delivery free',
    primary: [
      'in a published study, 89% of 82 used hand towels carried coliform bacteria.',
      'gerba et al, university of arizona, 2014. hand-towel data — a towel on a hook is not doing better.',
      'a fresh sheet every time. 88 fils a towel, AED 176 the pack.',
    ],
    headline: '89% of used towels tested',
  },
  {
    /* Informative: the actual routine, in the brand's own three steps. "Pat,
       don't rub" is a real technique note rather than a sales line, which is
       what makes the frame worth stopping on. */
    id: 'bundle-12-howto',
    label: 'Bundle — how to use it',
    kind: 'steps',
    hero: 'Three steps',
    steps: [
      ['Pull', 'one fresh sheet from the box.'],
      ['Wash', 'your face exactly as you always do.'],
      ['Pat', "dry — don't rub. then it's done."],
    ],
    furniture: '88 fils a towel · ultrasoft 100% bamboo · delivery free',
    footnote: PACK,
    primary: [
      'pull a fresh sheet. wash your face as you always do. pat dry, don\'t rub.',
      'that is the whole routine. 200 large ultrasoft towels in the pack.',
      '88 fils a towel. AED 176, delivered free.',
    ],
    headline: 'Pull, wash, pat dry',
  },
  {
    /* Informative: what AED 176 actually buys, stated as a spec rather than
       sold. Every line here is on-pack or on the storefront. */
    id: 'bundle-13-spec',
    label: 'Bundle — what you get',
    kind: 'spec',
    hero: 'What AED 176 buys',
    specs: [
      ['Towels', '200, across four boxes'],
      ['Size', 'Large — 50 to a box'],
      ['Material', '100% bamboo fibre, ultrasoft'],
      ['Additives', 'No dyes, no fragrance'],
      ['Per towel', '88 fils'],
      ['Delivery', 'Free over AED 100 · UAE-wide'],
    ],
    furniture: 'ships within 24 hours · delivery free over AED 100',
    primary: [
      '200 large ultrasoft towels across four boxes. 100% bamboo fibre, no dyes, no fragrance.',
      '88 fils a towel, delivered free anywhere in the UAE.',
      'AED 176.',
    ],
    headline: '200 towels, 88 fils each',
  },
  {
    /* The one non-price frame for the face towel: the proposition itself,
       stated without naming disposal. */
    id: 'single-02-once',
    kind: 'line', product: 'single',
    label: 'Single — one towel, one face, once',
    hero: 'One towel. One face. Once.',
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
    support: '100% bamboo fibre, ultrasoft, 50 large towels. about a month to a box.',
    furniture: `AED 49, was 79 · ${QUALITY}`,
    /* The AED 15 is stated as a rule rather than as a penalty: naming the
       threshold lets it do the upselling, where naming the charge prices the
       click before it happens. */
    footnote: 'delivery 15 under AED 100, free above · or take four boxes',
    primary: [
      '50 large ultrasoft bamboo towels, AED 49. was 79.',
      'delivery is 15 under AED 100 and free above it, so four boxes ship free.',
      'a fresh one every time, about a month to a box.',
    ],
    headline: '50 large bamboo towels, AED 49',
  },
  {
    /* The one idea in this account with a conversion record behind it, moved
       into a still. The hotel-bathroom video runs at roughly 4% CTR, the best
       in the account, and the mechanism is a towel in a place you did not
       choose, with a history you cannot see. Twenty-two frames argue price and
       none argues scene. No hygiene claim is made and none is needed -- the
       viewer supplies it, which is exactly why it works. */
    id: 'bundle-18-hotel',
    label: 'Bundle \u2014 the hotel towel',
    kind: 'ask',
    hero: 'That hotel towel has a history.',
    support: 'and you will never see it. pack a box, take a fresh one every morning \u2014 88 fils each.',
    furniture: `200 towels \u00b7 ${QUALITY} \u00b7 delivery free`,
    footnote: PACK,
    primary: [
      'that hotel towel has a history, and you will never see it.',
      'pack a box instead. 50 large ultrasoft bamboo towels, a fresh one every morning.',
      'four boxes is 88 fils a towel, AED 176, delivered free.',
    ],
    headline: 'pack your own towel',
  },
  {
    /* Arabic. Every order in the store carries an en-AE or en locale and the
       Arabic storefront is unpublished, so this is built and held: an Arabic
       ad that hands off to an English product page spends the goodwill it just
       earned. The moment ar is published it goes live as-is.
       Western digits are deliberate. Gulf retail prices in 0-9, not in Arabic-
       Indic numerals, and Meta renders digits LTR inside an RTL line either
       way -- so 88 is what a UAE price tag actually looks like. */
    id: 'bundle-19-ar',
    label: 'Bundle \u2014 Arabic, 88 fils',
    lang: 'ar',
    kind: 'fils', size: 'xl',
    hero: '88', unit: '\u0641\u0644\u0633', heroTail: '\u0644\u0644\u0645\u0646\u0634\u0641\u0629',
    support: '200 \u0645\u0646\u0634\u0641\u0629 \u0643\u0628\u064a\u0631\u0629 \u0641\u064a \u0627\u0644\u0639\u0628\u0648\u0629 \u00b7 \u0623\u0644\u064a\u0627\u0641 \u0627\u0644\u062e\u064a\u0632\u0631\u0627\u0646 \u0641\u0627\u0626\u0642\u0629 \u0627\u0644\u0646\u0639\u0648\u0645\u0629',
    furniture: '176 \u062f\u0631\u0647\u0645 \u0644\u0644\u0639\u0628\u0648\u0629 \u00b7 \u062a\u0648\u0635\u064a\u0644 \u0645\u062c\u0627\u0646\u064a \u00b7 \u0627\u0644\u062f\u0641\u0639 \u0639\u0646\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645',
    footnote: '\u0645\u0646\u0634\u0641\u0629 \u062c\u062f\u064a\u062f\u0629 \u0641\u064a \u0643\u0644 \u0645\u0631\u0629.',
    primary: [
      '88 \u0641\u0644\u0633 \u0644\u0644\u0645\u0646\u0634\u0641\u0629.',
      '200 \u0645\u0646\u0634\u0641\u0629 \u0643\u0628\u064a\u0631\u0629 \u0641\u0627\u0626\u0642\u0629 \u0627\u0644\u0646\u0639\u0648\u0645\u0629 \u0645\u0646 \u0623\u0644\u064a\u0627\u0641 \u0627\u0644\u062e\u064a\u0632\u0631\u0627\u0646 100%\u060c \u0645\u0646\u0634\u0641\u0629 \u062c\u062f\u064a\u062f\u0629 \u0641\u064a \u0643\u0644 \u0645\u0631\u0629.',
      '\u0627\u0644\u0639\u0628\u0648\u0629 \u0627\u0644\u0643\u0627\u0645\u0644\u0629 176 \u062f\u0631\u0647\u0645\u060c \u0645\u0639 \u062a\u0648\u0635\u064a\u0644 \u0645\u062c\u0627\u0646\u064a \u0648\u0627\u0644\u062f\u0641\u0639 \u0639\u0646\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645.',
    ],
    headline: '88 \u0641\u0644\u0633 \u0644\u0644\u0645\u0646\u0634\u0641\u0629',
  },
  {
    /* The ick, and it is a chain rather than a claim: a face, then a laundry
       nobody shows you, then a shelf, then yours. Every link is just how a
       hotel works, so there is nothing to substantiate and nothing to argue
       with -- she assembles the feeling herself, which is the only way disgust
       ever gets past a defence. */
    id: 'bundle-20-hotel',
    label: 'Bundle \u2014 someone else was here first',
    kind: 'line', accentSup: true,
    hero: 'Someone else\u2019s face was here first.',
    support: 'then a laundry you never see, then a shelf, then you. pack your own \u2014 less than AED 1 a towel.',
    furniture: `200 large towels \u00b7 ${QUALITY} \u00b7 delivery free`,
    footnote: PACK,
    primary: [
      'someone else\u2019s face was on that hotel towel before yours.',
      'then a laundry you never see, then a shelf, then you. pack your own instead \u2014 200 large ultrasoft bamboo towels, used once, less than AED 1 each.',
      'AED 176, delivered free.',
    ],
    headline: 'Less than AED 1 a towel',
  },
  {
    /* The harder of the two, because the hotel towel is somebody else's problem
       and this one is hers. The headline concedes the hotel its single virtue
       in order to take it off her, and every line under it is something she can
       check by walking down the hall. */
    id: 'bundle-21-home',
    label: 'Bundle \u2014 the one on your own hook',
    kind: 'line', accentSup: true,
    hero: 'The one in your bathroom is worse.',
    support: 'the hotel at least washes theirs. yours has hung damp since sunday, and everyone who visits dries their hands on it.',
    furniture: `200 large towels \u00b7 less than AED 1 each \u00b7 ${QUALITY}`,
    footnote: PACK,
    primary: [
      'at least the hotel washes theirs.',
      'yours has hung damp since sunday, in the wettest room in the house, and everyone who visits dries their hands on it. twice a day you press it into your face.',
      'a fresh one every time instead \u2014 200 large ultrasoft bamboo towels, less than AED 1 each. AED 176, delivered free.',
    ],
    headline: 'A fresh towel every time',
  },
  {
    /* The taunt, and the only frame in the set that agrees with her first. The
       routine is right, the spend is right, the order is right -- and then the
       one thing nobody sells her undoes the care she took over all of it.
       Nothing is claimed about skin: the whole argument is consistency, which
       she can check without taking anyone's word for it. */
    id: 'bundle-22-routine',
    label: 'Bundle \u2014 every step but one',
    kind: 'line', accentSup: true,
    hero: 'You got every step right but one.',
    support: 'cleanser, serum, SPF, all of it correct \u2014 then you dried it off on the towel from tuesday. less than AED 1 a towel.',
    furniture: `200 large towels \u00b7 ${QUALITY} \u00b7 delivery free`,
    footnote: PACK,
    primary: [
      'cleanser, serum, SPF. all of it right.',
      'then you dried it off on the towel that has been on the hook since tuesday. the last thing to touch your face is the one part nobody sells you.',
      '200 large ultrasoft bamboo towels, used once, less than AED 1 each. AED 176, delivered free.',
    ],
    headline: 'Every step right but one',
  },
  {
    /* The fit, drawn. Four tube frames already assert that it suits a car; none
       of them shows the cup holder, so none of them proves it. The illustration
       is the whole creative and the price rides on top of it -- AED 9 is the
       number a buyer can picture, where 18 fils a tissue is an abstraction, and
       AED 36 stays small because the tube is the unit she is deciding on. */
    id: 'tube-05-holder',
    label: 'Tube \u2014 in the cup holder',
    kind: 'fils', size: 'cur', product: 'tube', art: 'holder',
    hero: 'AED 9', heroTail: 'a tube',
    support: 'it drops into the cup holder and stays there. no square box sliding around the passenger seat.',
    furniture: 'four tubes \u00b7 200 three-ply tissues \u00b7 one hand, every time',
    footnote: 'four tubes, AED 36. delivery free over AED 100.',
    primary: [
      'AED 9 a tube.',
      'it drops into the cup holder and stays there \u2014 no square box sliding around the passenger seat. 50 three-ply tissues in each.',
      'four tubes, AED 36.',
    ],
    headline: 'AED 9 a tube',
  },
];

module.exports = { CONCEPTS };
