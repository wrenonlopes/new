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
  /* Back on the sticker. A drawn towel was two attempts at a prop the brand
     does not sell, and it looked it; the box is the one piece of art in this
     project that was made by someone who draws. Four boxes on all three --
     these sell the bundle -- on three grounds that are already proven. */
  'bundle-20-hotel':  { ground: C.ink,     fg: C.cream, accent: C.leaf,     logo: LOGO_CREAM, boxes: 4, bw: 232 },
  'bundle-21-home':   { ground: C.kraft,   fg: C.ink,   accent: C.leafDark, logo: LOGO_DARK,  boxes: 4, bw: 232 },
  'bundle-22-routine':{ ground: C.cream,   fg: C.ink,   accent: C.sunrise,  logo: LOGO_DARK,  boxes: 4, bw: 232 },
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
      const cross = `<svg class="mk x" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5 L19 19 M19 5 L5 19"/></svg>`;
      const tick = `<svg class="mk v" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5 L9.5 18 L20 6"/></svg>`;
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
      ${c.support && c.kind !== 'stat'
        ? `<p class="sup${c.accentSup ? ' hi' : ''}">${esc(c.support)}</p>` : ''}
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

/* ---- the cup holder, drawn ---------------------------------------------- */
/* Three layers in paint order: the well, the tube, then the near lip over the
   tube's base. Without that third layer the tube sits on the console instead of
   in it, and the entire argument of the frame collapses. */
.holder{position:relative;width:calc(640px * var(--s));height:calc(620px * var(--s))}
.console{position:absolute;left:0;right:0;bottom:0;height:calc(250px * var(--s));z-index:0;
         border-radius:calc(44px * var(--s));
         background:radial-gradient(120% 150% at 22% 0%,rgba(255,255,255,.16) 0%,transparent 52%),
                    linear-gradient(168deg,#78767E 0%,#5B5A63 32%,#45444C 66%,#38373E 100%);
         box-shadow:inset 0 calc(3px * var(--s)) 0 rgba(255,255,255,.26),
                    inset 0 calc(-3px * var(--s)) calc(12px * var(--s)) rgba(0,0,0,.30),
                    0 calc(16px * var(--s)) calc(32px * var(--s)) rgba(0,0,0,.20)}
.well{position:absolute;top:calc(426px * var(--s));width:calc(210px * var(--s));
      height:calc(92px * var(--s));border-radius:50%;z-index:1;
      background:radial-gradient(ellipse at 50% 28%,#2A2930 0%,#121117 74%);
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
             background:linear-gradient(180deg,#131218 0%,#24232B 38%,#4C4A54 100%);
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
/* The accent support line under a full-size headline. It is the second thing
   read on the frame and the only coloured text on it, so it is where the
   argument and the price both land. */
.sup.hi{color:var(--accent);opacity:1;font-weight:700;font-size:calc(38px * var(--s))}

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
