/*
 * BIOD price-led static ad creatives for Meta.
 *
 * The system: the price IS the headline. A discount sticker is small type in
 * a loud container; this is the inverse -- the largest type on the page, in
 * the display face, on a flat ground, sitting on nothing. The dropshipper
 * signal is decoration, not size, so size alone stays editorial as long as
 * none of the six decorations (pill, badge, outline, shadow, gradient,
 * rotation) is present behind a number.
 *
 * Copy and the arithmetic behind every figure live in copy.js.
 *
 * Everything is inlined as data URIs: this container has no egress to
 * fonts.googleapis.com or cdn.shopify.com, and a self-contained file is also
 * what lets it be reopened and re-rendered later without a network.
 *
 *   node build.js          # writes creatives.html + out/*.png
 */
const fs = require('fs');
const path = require('path');
const { CONCEPTS } = require('./copy.js');

const ROOT = __dirname;
const THEME = path.resolve(ROOT, '../../assets');
const NM = process.env.BIOD_NODE_MODULES || path.resolve(ROOT, 'node_modules');
const OUT = path.join(ROOT, 'out');

const b64 = (p, mime) => `data:${mime};base64,${fs.readFileSync(p).toString('base64')}`;
const font = (pkg, file) => b64(path.join(NM, '@fontsource', pkg, 'files', file), 'font/woff2');

const FONTS = {
  o600: font('outfit', 'outfit-latin-600-normal.woff2'),
  o700: font('outfit', 'outfit-latin-700-normal.woff2'),
  o800: font('outfit', 'outfit-latin-800-normal.woff2'),
  j500: font('plus-jakarta-sans', 'plus-jakarta-sans-latin-500-normal.woff2'),
  j700: font('plus-jakarta-sans', 'plus-jakarta-sans-latin-700-normal.woff2'),
  /* Outfit has no Arabic coverage, so an Arabic frame would silently fall back
     to a system face. Cairo is what Gulf retail actually sets display Arabic
     in, and it ships Latin digits -- which is what keeps "88" Western inside
     an RTL line, the way a UAE price tag is written. */
  c700: font('cairo', 'cairo-arabic-700-normal.woff2'),
  c900: font('cairo', 'cairo-arabic-900-normal.woff2'),
};
const BOX = b64(path.join(THEME, 'sticker-xl.png'), 'image/png');
const TUBE = b64(path.join(THEME, 'sticker-tube.png'), 'image/png');
const LOGO_CREAM = b64(path.join(THEME, 'biod-logo-cream.png'), 'image/png');
const LOGO_DARK = b64(path.join(THEME, 'biod-logo-dark.png'), 'image/png');

/* sticker-xl.png is a 480px-wide source. Rendering it wider than that goes
   visibly soft on an illustration with hard edges, so every box width below
   is capped here rather than trusted to the layout. */
const ART = {
  box:  { src: BOX,  native: 480 },
  tube: { src: TUBE, native: 380 },
};
const artW = (kind, w) => Math.min(w, ART[kind].native);

/* Brand tokens, matching config/settings_data.json. */
const C = {
  leaf: '#7AC143', leafDark: '#3E7015', ink: '#2E2E38',
  cream: '#F8F1DF', paper: '#FDFBF5', kraft: '#C69A6D', sunrise: '#E9601F',
};

/* One ground each: seven visibly different assets so Meta has real variety to
   allocate across, and so they stay distinguishable in reporting. Exactly one
   dark frame, and the numeral only takes the accent colour there -- cream type
   with one coloured figure on dark is a financial-magazine convention. A
   coloured numeral on a light ground is a banner. */
const LOOK = {
  'bundle-01-fils':   { ground: C.paper,   fg: C.ink,   accent: C.leafDark, logo: LOGO_DARK,  boxes: 4, bw: 232 },
  'bundle-02-volume': { ground: C.leaf,    fg: C.ink,   accent: C.leafDark, logo: LOGO_DARK,  boxes: 4, bw: 232 },
  'bundle-03-dirham': { ground: C.sunrise, fg: C.cream, accent: C.cream,    logo: LOGO_CREAM, boxes: 4, bw: 232 },
  'bundle-04-drop':   { ground: C.cream,   fg: C.ink,   accent: C.ink,      logo: LOGO_DARK,  boxes: 4, bw: 232 },
  'bundle-05-month':  { ground: C.kraft,   fg: C.ink,   accent: C.leafDark, logo: LOGO_DARK,  boxes: 4, bw: 232 },
  'bundle-06-hook':   { ground: '#23232B', fg: C.cream, accent: C.leaf,     logo: LOGO_CREAM, boxes: 4, bw: 232, numAccent: true },
  'single-01-fifty':  { ground: C.leafDark,fg: C.cream, accent: C.leaf,     logo: LOGO_CREAM, boxes: 1, bw: 460, numAccent: true },
  'single-02-once':   { ground: C.cream,   fg: C.ink,   accent: C.leafDark, logo: LOGO_DARK,  boxes: 1, bw: 430 },
  'tube-01-fits':     { ground: C.leaf,    fg: C.ink,   accent: C.leafDark, logo: LOGO_DARK,  art: 'tube', boxes: 4, bw: 158 },
  'tube-02-nine':     { ground: C.ink,     fg: C.cream, accent: C.leaf,     logo: LOGO_CREAM, art: 'tube', boxes: 4, bw: 158, numAccent: true },
  'tube-03-loose':    { ground: '#23232B', fg: C.cream, accent: C.leaf,     logo: LOGO_CREAM, art: 'tube', boxes: 4, bw: 158 },
  'tube-04-interior': { ground: C.paper,   fg: C.ink,   accent: C.leafDark, logo: LOGO_DARK,  art: 'tube', boxes: 4, bw: 158 },
  'bundle-07-four':   { ground: C.ink,     fg: C.cream, accent: C.leaf,     logo: LOGO_CREAM, boxes: 4, bw: 232, numAccent: true },
  'bundle-14-that':   { ground: C.cream,   fg: C.ink,   accent: C.leafDark, logo: LOGO_DARK },
  'bundle-15-sheet':  { ground: C.ink,     fg: C.cream, accent: C.leaf,     logo: LOGO_CREAM },
  'bundle-10-versus': { ground: C.paper,   fg: C.ink,   accent: C.leafDark, logo: LOGO_DARK,  boxes: 4, bw: 170 },
  'bundle-11-study':  { ground: '#23232B', fg: C.cream, accent: C.leaf,     logo: LOGO_CREAM, boxes: 4, bw: 170, numAccent: true },
  'bundle-12-howto':  { ground: C.cream,   fg: C.ink,   accent: C.leafDark, logo: LOGO_DARK,  boxes: 4, bw: 190 },
  'bundle-13-spec':   { ground: C.ink,     fg: C.cream, accent: C.leaf,     logo: LOGO_CREAM, boxes: 4, bw: 170 },
  'bundle-08-months': { ground: C.leafDark,fg: C.cream, accent: C.leaf,     logo: LOGO_CREAM, boxes: 4, bw: 232 },
  'bundle-09-once':   { ground: C.sunrise, fg: C.cream, accent: C.cream,    logo: LOGO_CREAM, boxes: 4, bw: 232 },
  'bundle-18-hotel':  { ground: '#23232B', fg: C.cream, accent: C.leaf,     logo: LOGO_CREAM, boxes: 1, bw: 440 },
  'bundle-19-ar':     { ground: C.sunrise, fg: C.cream, accent: C.cream,    logo: LOGO_CREAM, boxes: 4, bw: 232 },
  /* The two horror frames are the only near-black grounds in the set and they
     are deliberately a pair: same ground family, same list, one aimed at a
     hotel and one at her own hook, so the second reads as the answer to the
     first if she sees both. The boxes shrink to 150 because the list, not the
     packaging, is doing the work. */
  /* All three go dark, and the drawn prop is the only lit thing on the frame.
     On a light ground an off-white towel is a smudge; on these it glows, and
     with four words of copy the eye has nowhere else to go. Three different
     darks so they stay separable in reporting. */
  'bundle-20-hotel':  { ground: '#17171C',  fg: C.cream, accent: C.leaf,    logo: LOGO_CREAM, art: 'towelstack' },
  'bundle-21-home':   { ground: C.ink,      fg: C.cream, accent: C.leaf,    logo: LOGO_CREAM, art: 'towelhook' },
  'bundle-22-routine':{ ground: C.leafDark, fg: C.cream, accent: C.sunrise, logo: LOGO_CREAM, art: 'routine' },
  'tube-05-holder':   { ground: C.paper,   fg: C.ink,   accent: C.leafDark, logo: LOGO_DARK,  art: 'holder' },
};

const FORMATS = [
  { key: 'feed',  w: 1080, h: 1350, padT: 84,  padB: 84,  padX: 84,  s: 1 },
  { key: 'story', w: 1080, h: 1920, padT: 270, padB: 400, padX: 104, s: 1.04 },
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* The unit rides the numeral's own baseline at 0.42x, in the same face, the
   same weight and the SAME COLOUR. A superscript unit, or a unit in a second
   colour, is the loudest price-badge tell there is. */
const lock = (n, unit) =>
  `<span class="lock"><span class="num">${esc(n)}</span>${
    unit ? `<span class="unit">${esc(unit)}</span>` : ''}</span>`;

/* Price and quality share one typographic line. If they ever end up in
   separate blocks, 88 fils starts reading as cheap paper on a face. */
const furniture = (text) =>
  text.split(' · ')
    .map((seg) => (/fils|AED|was \d|\u062f\u0631\u0647\u0645|\u0641\u0644\u0633/.test(seg)
      ? `<b>${esc(seg)}</b>` : esc(seg)))
    .join('<i>·</i>');

function boxesHTML(k) {
  const kind = k.art || 'box';
  /* The sheet, drawn rather than photographed. Nineteen creatives showed the
     box, which is packaging; this is the product. The whole proposition is
     tactile, so the weave, the soft edge and the drape are the point -- a
     hard-edged rectangle would read as paper. */
  if (kind === 'sheet') {
    return `<div class="sheets">
      <div class="sh back"></div>
      <div class="sh mid"></div>
      <div class="sh front"><i class="curl"></i></div>
    </div>`;
  }
  /* Three props drawn as SVG rather than stacked divs. A towel is a silhouette
     problem -- a drape, a hem, the fall of the folds -- and a rounded rectangle
     reads as foam no matter what texture is painted on it. Paths solve it;
     border-radius cannot. */
  if (kind === 'towelstack') return TOWEL_STACK;
  if (kind === 'towelhook') return TOWEL_HOOK;
  if (kind === 'routine') return ROUTINE_ROW;
  /* The cup holder, drawn. The tissue tube's whole argument is that it fits
     something, and a tube floating on a flat ground cannot make that argument
     -- it needs the thing it fits into. The well is painted first, the tube
     over it, then the near lip over the tube's base: that last layer is what
     makes it read as IN the holder rather than ON it. */
  if (kind === 'holder') {
    return `<div class="holder">
      <div class="console"></div>
      <div class="well a"></div>
      <div class="well b"></div>
      <img class="tb" src="${ART.tube.src}" alt="">
      <i class="lip"></i>
    </div>`;
  }
  const { src } = ART[kind];
  const w = artW(kind, k.bw);
  if (k.boxes === 1) {
    return `<img class="bx solo" style="--bw:${w}px;--t:4deg" src="${src}" alt="">`;
  }
  /* Four discrete units, not one spend: partitioning is what stops the pack
     total being evaluated as a single outlay. Nothing rotates past 6deg --
     both stickers are drawn in fixed perspective and a steeper tilt reads as
     a mistake. Tubes stand upright, so they get a tighter tilt than the box. */
  const tilts = kind === 'tube' ? [-2, 1.5, -1.5, 2] : [-3, 2, -2, 3];
  return `<div class="quad ${kind}">${tilts
    .map((t) => `<img class="bx" style="--bw:${w}px;--t:${t}deg" src="${src}" alt="">`)
    .join('')}</div>`;
}

/* Drawn rather than typed: the tick and cross glyphs are not in either brand
   face and would silently fall back to a system font. */
const TICK = `<svg class="mk v" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5 L9.5 18 L20 6"/></svg>`;
const CROSS = `<svg class="mk x" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5 L19 19 M19 5 L5 19"/></svg>`;

/* Terry, twice: a fine vertical pile over the whole shape and a flat woven
   dobby band. Shared by every towel below so they read as the same cloth. */
const TERRY = `
  <pattern id="pile" width="5" height="5" patternUnits="userSpaceOnUse">
    <rect width="1" height="5" fill="#7A7058" opacity=".085"/>
  </pattern>`;

/* The hotel stack. Folded towels are flat, not fat: each is a shallow slab with
   the rolled fold showing as a lighter lip along its front edge, and the cut
   layers showing as short strokes at the end. Those two details are the whole
   difference between a towel and a block. */
const TOWEL_STACK = (() => {
  /* 3.4:1, not 6:1. The first attempt made each towel a 596x92 strip and the
     stack read as venetian blind slats -- a folded towel is a stout block, and
     the proportion is most of what identifies it. */
  const slab = (x, y, w, h) => `
    <g transform="translate(${x} ${y})">
      <rect x="0" y="0" width="${w}" height="${h}" rx="11" fill="url(#terryG)"/>
      <rect x="0" y="0" width="${w}" height="${h}" rx="11" fill="url(#pile)"/>
      <!-- the folded layers, seen end-on at the left -->
      ${[0.26, 0.5, 0.74].map((f) =>
        `<path d="M9 ${h * f} h34" stroke="#9A8F72" stroke-opacity=".42" stroke-width="2.2"
               stroke-linecap="round"/>`).join('')}
      <!-- the dobby band: two fine lines, the detail that says hotel -->
      <path d="M62 ${h * 0.33} H${w - 24}" stroke="#A2977B" stroke-opacity=".34" stroke-width="2.6"/>
      <path d="M62 ${h * 0.44} H${w - 24}" stroke="#A2977B" stroke-opacity=".34" stroke-width="2.6"/>
      <!-- the rolled front edge -->
      <path d="M2 ${h - 19} H${w - 2}" stroke="#8C8268" stroke-opacity=".26" stroke-width="1.8"/>
      <path d="M12 ${h - 9} H${w - 12}" stroke="#FFFDF7" stroke-opacity=".8" stroke-width="3.4"/>
      <rect x="0" y="0" width="${w}" height="${h}" rx="11" fill="none"
            stroke="#6F6450" stroke-opacity=".18"/>
    </g>`;
  return `<svg class="prop stack" viewBox="0 0 400 300" aria-hidden="true">
    <defs>${TERRY}
      <linearGradient id="terryG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FEFCF7"/><stop offset=".55" stop-color="#F1ECE0"/>
        <stop offset="1" stop-color="#DBD4C2"/></linearGradient>
      <filter id="dropA" x="-30%" y="-30%" width="160%" height="190%">
        <feDropShadow dx="0" dy="9" stdDeviation="11" flood-opacity=".46"/></filter>
    </defs>
    <g filter="url(#dropA)">
      ${slab(30, 192, 340, 100)}
      <g transform="rotate(-.8 200 150)">${slab(45, 100, 310, 100)}</g>
      <g transform="rotate(1.1 200 58)">${slab(60, 8, 280, 100)}</g>
    </g>
  </svg>`;
})();

/* The towel on the hook. The silhouette does the work: narrow where it folds
   over the rail, falling wider, and a hem that is not level because a hanging
   towel never is. The gradient runs warm at the top to a cool grey-green at the
   bottom -- warm reads as dry cotton, cool reads as wet, and "wet" is the
   entire claim of the frame. */
const TOWEL_HOOK = `<svg class="prop hook" viewBox="0 0 440 530" aria-hidden="true">
  <defs>${TERRY}
    <linearGradient id="dampG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FBF8F1"/><stop offset=".22" stop-color="#F1EBDD"/>
      <stop offset=".50" stop-color="#DCD4BF"/><stop offset=".72" stop-color="#B2AE9B"/>
      <stop offset=".88" stop-color="#8E9287"/><stop offset="1" stop-color="#7C8179"/>
    </linearGradient>
    <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F0F2F6"/><stop offset=".46" stop-color="#A7ACB5"/>
      <stop offset="1" stop-color="#555963"/></linearGradient>
    <linearGradient id="creaseG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5E543E" stop-opacity=".34"/>
      <stop offset="1" stop-color="#5E543E" stop-opacity="0"/></linearGradient>
    <filter id="dropB" x="-30%" y="-20%" width="160%" height="150%">
      <feDropShadow dx="0" dy="14" stdDeviation="16" flood-opacity=".40"/></filter>
    <clipPath id="clipT"><path d="M135 36 C128 64 124 92 123 118 L116 440
      Q115 462 137 465 C190 472 250 472 303 465 Q325 462 324 440 L317 118
      C316 92 312 64 305 36 Z"/></clipPath>
  </defs>
  <rect x="88" y="26" width="264" height="15" rx="7.5" fill="url(#chrome)"/>
  <!-- the back panel, just visible past the front one: a towel over a rail is
       two panels, and without the second it reads as a board -->
  <path d="M152 34 C147 58 145 84 145 104 L141 452 Q140 470 158 472 L300 472
           Q318 470 317 452 L313 104 C313 84 311 58 306 34 Z"
        fill="#8E8878" opacity=".55" transform="translate(13 7)"/>
  <g filter="url(#dropB)">
    <path d="M135 36 C128 64 124 92 123 118 L116 440 Q115 462 137 465
             C190 472 250 472 303 465 Q325 462 324 440 L317 118
             C316 92 312 64 305 36 Z" fill="url(#dampG)"/>
  </g>
  <g clip-path="url(#clipT)">
    <rect x="110" y="30" width="220" height="445" fill="url(#pile)"/>
    <!-- the crease where it folds over the rail -->
    <rect x="110" y="36" width="220" height="46" fill="url(#creaseG)"/>
    <path d="M220 44 V 470" stroke="#5E543E" stroke-opacity=".15" stroke-width="9"/>
    <path d="M176 58 V 468" stroke="#5E543E" stroke-opacity=".08" stroke-width="5"/>
    <path d="M268 58 V 468" stroke="#5E543E" stroke-opacity=".08" stroke-width="5"/>
    <path d="M110 384 H 330" stroke="#4F4B3B" stroke-opacity=".22" stroke-width="3.4"
          stroke-dasharray="4 9"/>
    <path d="M110 402 H 330" stroke="#4F4B3B" stroke-opacity=".22" stroke-width="3.4"
          stroke-dasharray="4 9"/>
    <!-- the hem, and the water sitting in it -->
    <path d="M110 446 H 330" stroke="#4F4B3B" stroke-opacity=".26" stroke-width="2.4"/>
    <rect x="110" y="398" width="220" height="80" fill="#6F7569" opacity=".30"/>
  </g>
</svg>`;

/* The routine, as objects: three vessels she chose, ticked, and the towel she
   never thought about, crossed. Four marks and no sentences. */
const ROUTINE_ROW = `<svg class="prop routine" viewBox="0 0 760 320" aria-hidden="true">
  <defs>${TERRY}
    <linearGradient id="glassG" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FDFBF5"/><stop offset=".58" stop-color="#EDE7D9"/>
      <stop offset="1" stop-color="#CFC7B4"/></linearGradient>
    <linearGradient id="capG" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#E6DFCF"/><stop offset="1" stop-color="#BDB4A0"/></linearGradient>
    <linearGradient id="terryG2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FEFCF7"/><stop offset=".55" stop-color="#F1ECE0"/>
      <stop offset="1" stop-color="#DBD4C2"/></linearGradient>
    <filter id="dropC" x="-40%" y="-20%" width="180%" height="150%">
      <feDropShadow dx="0" dy="9" stdDeviation="11" flood-opacity=".38"/></filter>
  </defs>
  <g filter="url(#dropC)">
    <g><rect x="74" y="4" width="52" height="46" rx="8" fill="url(#capG)"/>
       <rect x="86" y="46" width="28" height="30" fill="url(#capG)"/>
       <rect x="48" y="72" width="104" height="158" rx="16" fill="url(#glassG)"/>
       <rect x="68" y="104" width="64" height="76" rx="6" fill="#FFFFFF" opacity=".38"/></g>
    <g><rect x="206" y="20" width="98" height="17" rx="5" fill="url(#capG)"/>
       <path d="M210 36 h90 v142 a45 45 0 0 1 -90 0 Z" fill="url(#glassG)"/>
       <rect x="228" y="70" width="54" height="66" rx="6" fill="#FFFFFF" opacity=".34"/></g>
    <g><rect x="352" y="100" width="124" height="34" rx="10" fill="url(#capG)"/>
       <rect x="340" y="132" width="148" height="98" rx="16" fill="url(#glassG)"/>
       <rect x="366" y="156" width="68" height="48" rx="6" fill="#FFFFFF" opacity=".34"/></g>
    <g transform="translate(540 128)">
      <rect x="0" y="0" width="184" height="102" rx="11" fill="url(#terryG2)"/>
      <rect x="0" y="0" width="184" height="102" rx="11" fill="url(#pile)"/>
      <path d="M0 87 h184" stroke="#8C8268" stroke-opacity=".30" stroke-width="1.6"/>
      <path d="M8 95 h168" stroke="#FFFDF7" stroke-opacity=".7" stroke-width="3"/>
      <path d="M28 33 h128" stroke="#9A8F72" stroke-opacity=".3" stroke-width="2.6" stroke-dasharray="3 7"/>
      <path d="M28 46 h128" stroke="#9A8F72" stroke-opacity=".3" stroke-width="2.6" stroke-dasharray="3 7"/>
      <rect x="0" y="0" width="184" height="102" rx="11" fill="none" stroke="#6F6450" stroke-opacity=".16"/>
    </g>
  </g>
  <g fill="none" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round">
    ${[100, 255, 414].map((cx) =>
      `<path d="M${cx - 20} ${278} l12 13 l24 -27" stroke="var(--fg)" stroke-opacity=".40"/>`).join('')}
    <path d="M612 268 l28 28 M640 268 l-28 28" stroke="var(--accent)"/>
  </g>
</svg>`;

function heroHTML(c) {
  switch (c.kind) {
    case 'fils':
      return `<div class="hero ${c.size ? c.size : ''}">${lock(c.hero, c.unit)}${
        c.heroTail ? `<span class="tail">${esc(c.heroTail)}</span>` : ''}</div>`;

    case 'stack':
      /* Volume above, unit price below and larger: the pile is the value, the
         unit price is what makes the pile affordable. */
      return `<div class="hero stack">
          <div class="qty">${esc(c.qty)}</div>
          <div class="each">${lock(c.hero, c.unit)}${
            c.heroTail ? `<span class="tail">${esc(c.heroTail)}</span>` : ''}</div>
        </div>`;

    case 'drop':
      /* The drop is felt before it is read. One variable changes at a time:
         the anchor is small, greyed and struck; "now" sits alone at the same
         size as a beat of silence; then size explodes. All three left-align to
         the same x, because the fall is vertical and nothing may move
         sideways. No arrow -- that lives once, at furniture size. */
      return `<div class="hero drop">
          <div class="was">Was <span class="strike">${esc(c.heroFrom)}</span> a towel, delivered</div>
          <div class="now">now</div>
          <div class="to">${lock(c.hero, c.unit)}${
            c.heroTail ? `<span class="tail">${esc(c.heroTail)}</span>` : ''}</div>
        </div>`;

    case 'versus': {
      /* Marks are drawn rather than typed: the tick and cross glyphs are not
         in either brand face and would silently fall back to a system font. */
      const cross = CROSS, tick = TICK;
      return `<h1 class="hero vs">${esc(c.hero)}</h1>
        <div class="table">
          <div class="col bad"><div class="ch">${esc(c.columns[0])}</div>${
            c.rows.map((r) => `<div class="cell">${cross}<span>${esc(r[0])}</span></div>`).join('')}</div>
          <div class="col good"><div class="ch">${esc(c.columns[1])}</div>${
            c.rows.map((r) => `<div class="cell">${tick}<span>${esc(r[1])}</span></div>`).join('')}</div>
        </div>`;
    }

    case 'stat':
      /* The only % in the set, and it is a cited research figure rather than
         a discount. The source sits on the frame, not in the caption. */
      return `<div class="hero statnum">${esc(c.hero)}</div>
        <p class="statline">${esc(c.statLine)}</p>
        <p class="sup">${esc(c.support)}</p>
        <p class="src">${esc(c.source)}</p>`;

    case 'steps':
      return `<h1 class="hero vs">${esc(c.hero)}</h1>
        <ol class="steps">${c.steps.map((st, i) => `<li><b>${i + 1}</b><span><em>${
          esc(st[0])}</em> ${esc(st[1])}</span></li>`).join('')}</ol>`;

    case 'spec':
      return `<h1 class="hero vs">${esc(c.hero)}</h1>
        <dl class="spec">${c.specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;

    case 'ask':
      return `<h1 class="hero ask">${esc(c.hero)}</h1>`;

    default:
      return `<h1 class="hero line ${c.size === 'lg' ? 'lg' : ''}">${esc(c.hero)}</h1>`;
  }
}

function canvas(c, f) {
  const k = { ...LOOK[c.id], ...(c.art ? { art: c.art } : {}) };
  const rtl = c.lang === 'ar';
  return `
<div class="canvas ${f.key} k-${c.kind} ${k.numAccent ? 'accent-num' : ''}${rtl ? ' ar' : ''}"${
       rtl ? ' dir="rtl" lang="ar"' : ''} data-name="biod-${c.id}-${f.key}"
     data-w="${f.w}" data-h="${f.h}"
     style="--ground:${k.ground};--fg:${k.fg};--accent:${k.accent};--w:${f.w}px;--h:${f.h}px;
            --padT:${f.padT}px;--padB:${f.padB}px;--padX:${f.padX}px;--s:${f.s}">
  <div class="inner">
    <header><img class="logo" src="${k.logo}" alt="biod"></header>
    <div class="say">
      ${heroHTML(c)}
      ${c.support && c.kind !== 'stat' ? `<p class="sup">${esc(c.support)}</p>` : ''}
    </div>
    <div class="art">${boxesHTML(k)}</div>
    <div class="foot">
      <p class="furn">${furniture(c.furniture)}</p>
      ${c.footnote ? `<p class="note">${esc(c.footnote)}</p>` : ''}
      <div class="site">biod.co</div>
    </div>
  </div>
</div>`;
}

const html = `<!doctype html>
<meta charset="utf-8">
<title>BIOD price-led ad creatives</title>
<style>
@font-face{font-family:Outfit;src:url(${FONTS.o600}) format('woff2');font-weight:600;font-display:block}
@font-face{font-family:Outfit;src:url(${FONTS.o700}) format('woff2');font-weight:700;font-display:block}
@font-face{font-family:Outfit;src:url(${FONTS.o800}) format('woff2');font-weight:800;font-display:block}
@font-face{font-family:'Plus Jakarta Sans';src:url(${FONTS.j500}) format('woff2');font-weight:500;font-display:block}
@font-face{font-family:'Plus Jakarta Sans';src:url(${FONTS.j700}) format('woff2');font-weight:700;font-display:block}
@font-face{font-family:Cairo;src:url(${FONTS.c700}) format('woff2');font-weight:700;font-display:block}
@font-face{font-family:Cairo;src:url(${FONTS.c900}) format('woff2');font-weight:900;font-display:block}

*{box-sizing:border-box;margin:0;padding:0}
body{background:#141418;font-family:'Plus Jakarta Sans',system-ui,sans-serif;
     display:flex;flex-wrap:wrap;gap:40px;padding:40px;align-items:flex-start}

.canvas{width:var(--w);height:var(--h);background:var(--ground);color:var(--fg);
        position:relative;overflow:hidden;flex:none}
.inner{position:absolute;inset:0;padding:var(--padT) var(--padX) var(--padB);
       display:flex;flex-direction:column}
.logo{height:calc(38px * var(--s));width:auto;display:block;opacity:.88}
header{margin-bottom:calc(44px * var(--s))}
.say{flex:none}

/* ---- the number as headline -------------------------------------------- */
/* Tight numerals read as a magazine cover; loose ones read as a banner. The
   number sits on nothing: no pill, badge, outline, shadow, gradient or
   rotation anywhere behind it. */
.hero{font-family:Outfit,system-ui,sans-serif;font-weight:800;
      letter-spacing:-.055em;line-height:.86}
.lock{display:inline-flex;align-items:baseline;white-space:nowrap}
.lock .num{font-variant-numeric:proportional-nums}
.lock .unit{font-size:.42em;letter-spacing:-.03em;margin-inline-start:.1em}
.hero .tail{font-family:Outfit,sans-serif;font-weight:700;font-size:calc(52px * var(--s));
            letter-spacing:-.02em;opacity:.62;margin-inline-start:calc(22px * var(--s))}

/* ---- drawn props ------------------------------------------------------- */
/* The SVGs carry their own drawing; all the stylesheet owes them is a size and
   a ceiling, so a tall prop cannot push up into the headline the way the first
   cup-holder attempt did. */
.prop{display:block;height:auto;max-width:100%;max-height:100%}
.prop.stack{width:calc(560px * var(--s))}
.prop.hook{width:calc(400px * var(--s))}
.prop.routine{width:calc(820px * var(--s))}

/* ---- the cup holder, drawn ---------------------------------------------- */
/* Three layers in paint order: the well, the tube, then the near lip over the
   tube's base. Without that third layer the tube sits on the console instead of
   in it, and the entire argument of the frame collapses. */
.holder{position:relative;width:calc(640px * var(--s));height:calc(620px * var(--s))}
.console{position:absolute;left:0;right:0;bottom:0;height:calc(250px * var(--s));z-index:0;
         border-radius:calc(44px * var(--s));
         background:linear-gradient(168deg,#5A5A64 0%,#44444D 30%,#33333B 62%,#292930 100%);
         box-shadow:inset 0 calc(3px * var(--s)) 0 rgba(255,255,255,.17),
                    inset 0 calc(-3px * var(--s)) calc(10px * var(--s)) rgba(0,0,0,.35),
                    0 calc(16px * var(--s)) calc(32px * var(--s)) rgba(0,0,0,.20)}
.well{position:absolute;top:calc(426px * var(--s));width:calc(210px * var(--s));
      height:calc(92px * var(--s));border-radius:50%;z-index:1;
      background:radial-gradient(ellipse at 50% 28%,#1A1A20 0%,#0B0B0F 74%);
      box-shadow:inset 0 calc(8px * var(--s)) calc(14px * var(--s)) rgba(0,0,0,.65),
                 0 0 0 calc(3px * var(--s)) rgba(255,255,255,.07),
                 0 calc(3px * var(--s)) 0 rgba(255,255,255,.10)}
.well.a{left:calc(66px * var(--s))}
.well.b{left:calc(364px * var(--s))}
/* 160px wide against a 380x993 source, so 418px tall; its base lands 26px above
   the well's far edge, which is what puts it inside the hole rather than on it. */
.holder .tb{position:absolute;left:calc(389px * var(--s));bottom:calc(120px * var(--s));
            width:calc(160px * var(--s));height:auto;z-index:2;
            filter:drop-shadow(calc(-6px * var(--s)) calc(12px * var(--s)) calc(18px * var(--s)) rgba(0,0,0,.30))}
/* The near lip, painted last and over the tube's base. Without this layer the
   tube sits on the console instead of in it, and the frame proves nothing. */
.holder .lip{position:absolute;left:calc(364px * var(--s));top:calc(472px * var(--s));
             width:calc(210px * var(--s));height:calc(46px * var(--s));z-index:3;
             border-radius:0 0 calc(105px * var(--s)) calc(105px * var(--s))
                         / 0 0 calc(46px * var(--s)) calc(46px * var(--s));
             background:linear-gradient(180deg,#0D0D12 0%,#1A1A21 38%,#3B3B44 100%);
             box-shadow:inset 0 calc(4px * var(--s)) calc(8px * var(--s)) rgba(0,0,0,.55)}

/* ---- Arabic ------------------------------------------------------------- */
/* Everything above is laid out with flex and logical properties and carries no
   text-align, so dir=rtl alone reverses the whole frame correctly. Two things
   do NOT carry over: the -.055em tracking, which breaks the joins between
   Arabic letterforms rather than tightening them, and the 0.86 line-height,
   which clips the descenders Latin does not have. Both are reset here. */
.canvas.ar{font-family:Cairo,system-ui,sans-serif}
.canvas.ar .hero,.canvas.ar .hero .tail{font-family:Cairo,system-ui,sans-serif;
      letter-spacing:normal}
.canvas.ar .hero{line-height:1.05;font-weight:900}
.canvas.ar .lock .unit{letter-spacing:normal}
.canvas.ar .furn b,.canvas.ar .ch{letter-spacing:normal}

.k-fils .hero{font-size:calc(300px * var(--s));display:flex;align-items:baseline;flex-wrap:wrap}
.k-fils .hero.xl{font-size:calc(340px * var(--s))}
/* A currency-prefixed hero ("AED 9") carries three more glyphs than a bare
   numeral and overruns the column at the xl step, so it opts into its own. */
.k-fils .hero.cur{font-size:calc(236px * var(--s))}
.accent-num .lock .num,.accent-num .lock .unit{color:var(--accent)}

/* stack: volume set above, unit price below and larger. */
.hero.stack{line-height:.9}
.hero.stack .qty{font-size:calc(104px * var(--s));opacity:.5;letter-spacing:-.04em}
.hero.stack .each{font-size:calc(252px * var(--s));margin-top:calc(6px * var(--s));
                  display:flex;align-items:baseline;flex-wrap:wrap}
.accent-num .hero.stack .each{color:var(--accent)}

/* drop */
.hero.drop{line-height:.9}
.hero.drop .was{font-family:Outfit,sans-serif;font-weight:700;font-size:calc(54px * var(--s));
                letter-spacing:-.02em;color:color-mix(in srgb,var(--fg) 50%,transparent)}
.hero.drop .now{font-family:Outfit,sans-serif;font-weight:700;font-size:calc(54px * var(--s));
                letter-spacing:-.02em;margin-top:calc(14px * var(--s))}
.hero.drop .to{display:flex;align-items:baseline;flex-wrap:wrap;
               font-size:calc(292px * var(--s));margin-top:calc(2px * var(--s))}
/* Chromium's line-through is thin and badly placed, and it strikes the whole
   sentence. Only the price is cancelled, and the mark is drawn at full
   strength over text at half -- the strike is stronger than what it kills. */
.strike{position:relative;display:inline-block}
.strike::after{content:'';position:absolute;left:calc(-6px * var(--s));right:calc(-6px * var(--s));
               top:52%;height:calc(5px * var(--s));
               border-radius:calc(3px * var(--s));transform:rotate(-2.2deg);
               transform-origin:left center;background:var(--fg)}

.hero.vs{font-size:calc(76px * var(--s));line-height:1.02;letter-spacing:-.03em;
          margin-bottom:calc(34px * var(--s))}

/* Head to head. The two columns are the same width and baseline so the eye
   reads across a row rather than down a sales list. */
.table{display:grid;grid-template-columns:1fr 1fr;gap:calc(26px * var(--s));
       align-items:start}
.col{display:flex;flex-direction:column;gap:calc(16px * var(--s))}
.ch{font-weight:700;font-size:calc(27px * var(--s));letter-spacing:.09em;
    text-transform:uppercase;padding-bottom:calc(14px * var(--s));
    border-bottom:calc(2px * var(--s)) solid currentColor}
.col.bad .ch,.col.bad .cell{opacity:.5}
.col.good .ch{color:var(--accent);border-color:var(--accent)}
.cell{display:flex;gap:calc(13px * var(--s));align-items:flex-start;
      font-weight:500;font-size:calc(30px * var(--s));line-height:1.26}
.mk{width:calc(27px * var(--s));height:calc(27px * var(--s));flex:none;
    margin-top:calc(4px * var(--s));fill:none;stroke-width:3;stroke-linecap:round}
.mk.x{stroke:currentColor}
.mk.v{stroke:var(--accent)}

/* The cited figure. */
.hero.statnum{font-size:calc(250px * var(--s));letter-spacing:-.055em;line-height:.86}
.statline{margin-top:calc(14px * var(--s));font-family:Outfit,sans-serif;font-weight:700;
          font-size:calc(46px * var(--s));line-height:1.14;letter-spacing:-.02em;
          max-width:calc(880px * var(--s))}
.src{margin-top:calc(22px * var(--s));font-weight:500;font-size:calc(22px * var(--s));
     line-height:1.4;opacity:.55;max-width:calc(820px * var(--s))}

/* The routine, numbered. */
.steps{list-style:none;display:flex;flex-direction:column;gap:calc(22px * var(--s))}
.steps li{display:flex;gap:calc(24px * var(--s));align-items:baseline}
.steps b{font-family:Outfit,sans-serif;font-weight:800;font-size:calc(72px * var(--s));
         line-height:.9;letter-spacing:-.04em;color:var(--accent);
         min-width:calc(62px * var(--s));font-variant-numeric:tabular-nums}
.steps span{font-weight:500;font-size:calc(36px * var(--s));line-height:1.3;opacity:.88}
.steps em{font-style:normal;font-weight:700;opacity:1}

/* What you actually get. */
.spec{display:flex;flex-direction:column;gap:calc(2px * var(--s))}
.spec div{display:grid;grid-template-columns:calc(250px * var(--s)) 1fr;
          gap:calc(20px * var(--s));padding:calc(15px * var(--s)) 0;
          border-bottom:calc(2px * var(--s)) solid currentColor}
.spec div:first-child{border-top:calc(2px * var(--s)) solid currentColor}
.spec dt{font-weight:700;font-size:calc(25px * var(--s));letter-spacing:.08em;
         text-transform:uppercase;opacity:.5}
.spec dd{font-weight:500;font-size:calc(31px * var(--s));line-height:1.25}

.hero.ask{font-size:calc(84px * var(--s));line-height:1.06;letter-spacing:-.025em;
          text-wrap:balance;font-weight:800}
.hero.line{font-size:calc(146px * var(--s));line-height:.94;text-wrap:balance}
.hero.line.lg{font-size:calc(190px * var(--s));line-height:.92}
.hero.line.sm{font-size:calc(96px * var(--s));line-height:1.04}

/* The supporting line sits inside the same block as the price -- no rule, no
   colour change, no gap over 32px -- which is what welds "ultrasoft" to the
   number. A divider here would split price from quality; there must not be one. */
.sup{margin-top:calc(30px * var(--s));font-weight:500;font-size:calc(35px * var(--s));
     line-height:1.4;opacity:.78;max-width:calc(790px * var(--s))}
.k-ask .sup{color:var(--accent);opacity:1;font-weight:700;font-size:calc(40px * var(--s))}

/* ---- product ------------------------------------------------------------ */
.art{flex:1;position:relative;display:flex;align-items:center;justify-content:center;
     min-height:0;padding-bottom:calc(10px * var(--s))}
.quad{display:flex;align-items:flex-end;justify-content:center}
.bx{display:block;width:calc(var(--bw) * var(--s));height:auto;max-height:100%;
    object-fit:contain;transform:rotate(var(--t,0deg));
    filter:drop-shadow(0 calc(16px * var(--s)) calc(30px * var(--s)) rgba(0,0,0,.22))}
.quad .bx{margin-inline:calc(-14px * var(--s))}
.quad.tube .bx{margin-inline:calc(10px * var(--s))}
.quad .bx:nth-child(2){z-index:2}.quad .bx:nth-child(3){z-index:3}
.quad .bx:nth-child(4){z-index:4}
.bx.solo{margin-right:calc(-70px * var(--s))}

/* The sheet. Two crossed hairline gradients give the weave; the uneven
   border-radius keeps the edge from reading as cut paper; the curl is a soft
   highlight at one corner so it drapes rather than lies flat. */
.sheets{position:relative;display:flex;align-items:center;justify-content:center;
        width:100%;height:100%}
.sh{position:absolute;top:50%;left:50%;height:94%;width:auto;aspect-ratio:1/1.18;
    background:
      repeating-linear-gradient(0deg,rgba(94,84,64,.055) 0 1px,transparent 1px 5px),
      repeating-linear-gradient(90deg,rgba(94,84,64,.045) 0 1px,transparent 1px 5px),
      linear-gradient(152deg,#FFFEFA 0%,#FAF6EC 46%,#F0E9DA 100%);
    border-radius:calc(20px * var(--s)) calc(26px * var(--s)) calc(22px * var(--s)) calc(28px * var(--s))
                / calc(26px * var(--s)) calc(20px * var(--s)) calc(28px * var(--s)) calc(22px * var(--s));
    box-shadow:0 calc(22px * var(--s)) calc(44px * var(--s)) rgba(0,0,0,.2),
               inset 0 0 0 calc(1.5px * var(--s)) rgba(94,84,64,.13)}
.sh.back{transform:translate(-50%,-50%) rotate(-7deg) translate(calc(-42px * var(--s)),calc(10px * var(--s)));opacity:.5}
.sh.mid{transform:translate(-50%,-50%) rotate(4deg) translate(calc(24px * var(--s)),calc(4px * var(--s)));opacity:.78}
.sh.front{transform:translate(-50%,-50%) rotate(-1.5deg)}
/* A soft lift at the near corner, so the top sheet reads as about to be
   picked up rather than stacked flat. */
.curl{position:absolute;right:0;bottom:0;width:38%;height:30%;
      border-bottom-right-radius:inherit;
      background:linear-gradient(315deg,rgba(255,255,255,.95) 0%,rgba(240,233,218,0) 62%);
      filter:blur(calc(1px * var(--s)))}

/* ---- furniture ---------------------------------------------------------- */
.foot{flex:none;border-top:calc(2px * var(--s)) solid currentColor;
      padding-top:calc(22px * var(--s));position:relative}
.furn{font-weight:700;font-size:calc(27px * var(--s));line-height:1.45;opacity:.8}
.furn b{font-weight:700;color:var(--accent)}
.furn i{font-style:normal;opacity:.4;margin:0 calc(11px * var(--s))}
.note{margin-top:calc(7px * var(--s));font-weight:500;font-size:calc(23px * var(--s));opacity:.58}
.site{position:absolute;inset-inline-end:0;bottom:0;font-weight:700;font-size:calc(26px * var(--s));
      letter-spacing:.05em;opacity:.58}
.story .site{inset-inline-end:calc(28px * var(--s))}
</style>
${CONCEPTS.map((c) => FORMATS.map((f) => canvas(c, f)).join('\n')).join('\n')}
`;

fs.writeFileSync(path.join(ROOT, 'creatives.html'), html);
console.log('wrote creatives.html (' + (html.length / 1024 / 1024).toFixed(2) + ' MB)');

(async () => {
  let chromium;
  try { ({ chromium } = require('playwright')); }
  catch { console.log('playwright not installed here — open creatives.html in a browser'); return; }

  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  /* Rendered at 2x and resampled to the exact upload size. Supersampling is
     what keeps 800-weight display type clean; the box art is capped at its
     480px native width above, so nothing is upscaled on the way. */
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.join(ROOT, 'creatives.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  for (const n of await page.$$('.canvas')) {
    const { name, w, h } = await n.evaluate((el) => ({
      name: el.dataset.name, w: +el.dataset.w, h: +el.dataset.h,
    }));
    const big = await n.screenshot({ type: 'png' });
    const exact = await page.evaluate(async ({ b64, w, h }) => {
      const img = await new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + b64; });
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const x = c.getContext('2d');
      x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
      x.drawImage(img, 0, 0, w, h);
      return c.toDataURL('image/png').split(',')[1];
    }, { b64: big.toString('base64'), w, h });
    fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(exact, 'base64'));
    console.log(`  ${name}.png  ${w}x${h}`);
  }
  await browser.close();
})();
