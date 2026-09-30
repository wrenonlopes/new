/*
 * BIOD price-led static ad creatives for Meta.
 *
 * The system: the price IS the headline. Not a badge, not a burst, not a pill
 * -- the number is simply the largest type on the page, set in the display
 * face on a flat ground with a lot of air around it. A discount sticker is
 * small type in a loud container; this is the inverse, which is how the frame
 * stays price-led without reading as dropshipping.
 *
 * Copy and every figure behind it live in copy.js.
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
};
const BOX = b64(path.join(THEME, 'sticker-xl.png'), 'image/png');
const LOGO_CREAM = b64(path.join(THEME, 'biod-logo-cream.png'), 'image/png');
const LOGO_DARK = b64(path.join(THEME, 'biod-logo-dark.png'), 'image/png');

/* Brand tokens, matching config/settings_data.json. */
const C = {
  leaf: '#7AC143', leafDark: '#3E7015', ink: '#2E2E38',
  cream: '#F8F1DF', paper: '#FDFBF5', kraft: '#C69A6D', sunrise: '#E9601F',
};

/* Each creative gets its own ground so the four are distinguishable in
   reporting and so Meta has visibly different assets to allocate across. */
const LOOK = {
  'a-hook':  { ground: '#23232B', fg: C.cream, accent: C.leaf,     logo: LOGO_CREAM, boxes: 4, scale: 246 },
  'b-drop':  { ground: C.cream,   fg: C.ink,   accent: C.leafDark, logo: LOGO_DARK,  boxes: 4, scale: 246 },
  'c-month': { ground: C.leaf,    fg: C.ink,   accent: C.leafDark, logo: LOGO_DARK,  boxes: 4, scale: 246 },
  'd-fifty': { ground: C.paper,   fg: C.ink,   accent: C.leafDark, logo: LOGO_DARK,  boxes: 1, scale: 560 },
};

const FORMATS = [
  { key: 'feed',  w: 1080, h: 1350, padT: 84,  padB: 84,  padX: 84,  s: 1 },
  { key: 'story', w: 1080, h: 1920, padT: 270, padB: 400, padX: 104, s: 1.05 },
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* "88 fils" is set as one lockup: the integer at full display size so the eye
   never reads "nearly one", and the unit at well under half, tucked to the
   numerals' own baseline. Emphasis by scale, never by a container. */
function fils(n, unit) {
  return `<span class="lock"><span class="num">${esc(n)}</span><span class="unit">${esc(unit)}</span></span>`;
}

/* The furniture line is the one place price and quality are guaranteed to
   share a frame -- the rule is that they must never end up in separate
   visual blocks, or the price reads as cheap paper on a face. */
function furniture(text) {
  return text
    .split(' · ')
    .map((seg) => (/fils|AED|was \d/.test(seg) ? `<b>${esc(seg)}</b>` : esc(seg)))
    .join('<i>·</i>');
}

function boxesHTML(look) {
  if (look.boxes === 1) {
    return `<img class="bx" style="--bw:${look.scale}px;--t:-3deg" src="${BOX}" alt="">`;
  }
  /* Four discrete boxes, not one big spend: partitioning is what keeps
     AED 176 from being evaluated as a single outlay. */
  return `<div class="quad">${[-6, 4, -3, 6]
    .map((t) => `<img class="bx" style="--bw:${look.scale}px;--t:${t}deg" src="${BOX}" alt="">`)
    .join('')}</div>`;
}

function heroHTML(c) {
  if (c.id === 'b-drop') {
    /* The drop is felt as a change of scale, not read as a percentage: the old
       landed price is struck and small, the new one is four times its size
       directly beneath it. Both numbers are live prices plus the published
       AED 15 rate, so nothing here can be refuted in the comments. */
    return `<div class="drop">
      <div class="from"><s>${esc(c.heroFrom)}</s> <span>a towel, delivered</span></div>
      <div class="to">${fils(c.hero.replace(' fils', ''), 'fils')}<span class="tail">${esc(c.heroTail)}</span></div>
    </div>`;
  }
  if (c.id === 'c-month') {
    return `<h1 class="head money">${fils('AED 27', 'a month')}</h1>
            <p class="tailline">${esc(c.heroTail)}</p>`;
  }
  if (c.id === 'd-fifty') {
    return `<h1 class="head money big">${esc(c.hero)}</h1>`;
  }
  return `<h1 class="head ask">${esc(c.hero)}</h1>`;
}

function canvas(c, f) {
  const k = LOOK[c.id];
  return `
<div class="canvas ${f.key} c-${c.id}" data-name="biod-${c.id}-${f.key}" data-w="${f.w}" data-h="${f.h}"
     style="--ground:${k.ground};--fg:${k.fg};--accent:${k.accent};--w:${f.w}px;--h:${f.h}px;
            --padT:${f.padT}px;--padB:${f.padB}px;--padX:${f.padX}px;--s:${f.s}">
  <div class="inner">
    <header><img class="logo" src="${k.logo}" alt="biod"></header>
    <div class="say">
      ${heroHTML(c)}
      <p class="sup">${esc(c.support)}</p>
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

*{box-sizing:border-box;margin:0;padding:0}
body{background:#141418;font-family:'Plus Jakarta Sans',system-ui,sans-serif;
     display:flex;flex-wrap:wrap;gap:40px;padding:40px;align-items:flex-start}

.canvas{width:var(--w);height:var(--h);background:var(--ground);color:var(--fg);
        position:relative;overflow:hidden;flex:none}
.inner{position:absolute;inset:0;padding:var(--padT) var(--padX) var(--padB);
       display:flex;flex-direction:column}
.logo{height:calc(40px * var(--s));width:auto;display:block;opacity:.88}
header{margin-bottom:calc(40px * var(--s))}
.say{flex:none}

/* ---- the number as headline -------------------------------------------- */
/* Scale and air carry the emphasis. Nothing is boxed, outlined, rotated or
   badged: that is the whole difference between editorial and dropshipper. */
.head{font-family:Outfit,system-ui,sans-serif;font-weight:800;letter-spacing:-.04em;
      line-height:.92}
.head.ask{font-size:calc(82px * var(--s));line-height:1.06;letter-spacing:-.025em;
          text-wrap:balance}
.head.money{font-size:calc(150px * var(--s))}
.head.money.big{font-size:calc(196px * var(--s))}

.lock{display:inline-flex;align-items:baseline;gap:calc(16px * var(--s));
      white-space:nowrap}
.lock .num{font-family:Outfit,sans-serif;font-weight:800;letter-spacing:-.045em;
           font-variant-numeric:tabular-nums}
.lock .unit{font-family:Outfit,sans-serif;font-weight:700;font-size:.34em;
            letter-spacing:-.01em;color:var(--accent)}

.tailline{margin-top:calc(10px * var(--s));font-family:Outfit,sans-serif;
          font-weight:700;font-size:calc(58px * var(--s));letter-spacing:-.025em;opacity:.9}

/* B's drop: the old price is struck and small, the new one four times its
   size directly beneath, so the fall is felt before it is read. */
.drop .from{font-family:Outfit,sans-serif;font-weight:700;
            font-size:calc(62px * var(--s));letter-spacing:-.02em;opacity:.55}
.drop .from s{text-decoration:line-through;text-decoration-thickness:calc(5px * var(--s))}
.drop .from span{font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;
                 font-size:calc(34px * var(--s));letter-spacing:0}
.drop .to{margin-top:calc(6px * var(--s));display:flex;align-items:baseline;
          gap:calc(20px * var(--s));font-size:calc(236px * var(--s))}
.drop .to .tail{font-family:Outfit,sans-serif;font-weight:700;
                font-size:calc(58px * var(--s));letter-spacing:-.02em;opacity:.75}

.sup{margin-top:calc(30px * var(--s));font-weight:500;font-size:calc(37px * var(--s));
     line-height:1.38;opacity:.8;max-width:calc(840px * var(--s))}
.c-a-hook .sup{color:var(--accent);opacity:1;font-weight:700}

/* ---- product ------------------------------------------------------------ */
.art{flex:1;position:relative;display:flex;align-items:center;justify-content:center;
     min-height:0;margin:calc(16px * var(--s)) 0}
.quad{display:flex;align-items:center;justify-content:center}
.bx{display:block;width:calc(var(--bw) * var(--s));height:auto;max-height:100%;
    object-fit:contain;transform:rotate(var(--t,0deg));
    filter:drop-shadow(0 calc(18px * var(--s)) calc(34px * var(--s)) rgba(0,0,0,.24))}
.quad .bx{margin-inline:calc(-26px * var(--s))}
.quad .bx:nth-child(2){z-index:2}.quad .bx:nth-child(3){z-index:3}
.quad .bx:nth-child(4){z-index:4}

/* ---- furniture ---------------------------------------------------------- */
/* Price and quality on one typographic line. If they ever end up in separate
   blocks, 88 fils starts reading as cheap paper on a face. */
.foot{flex:none;border-top:calc(2px * var(--s)) solid currentColor;
      padding-top:calc(24px * var(--s));position:relative}
.furn{font-weight:500;font-size:calc(28px * var(--s));line-height:1.5;opacity:.86}
.furn b{font-weight:700;color:var(--accent)}
.c-a-hook .furn b{color:var(--accent)}
.furn i{font-style:normal;opacity:.4;margin:0 calc(12px * var(--s))}
.note{margin-top:calc(8px * var(--s));font-weight:500;font-size:calc(24px * var(--s));opacity:.6}
.site{position:absolute;right:0;bottom:0;font-weight:700;font-size:calc(27px * var(--s));
      letter-spacing:.05em;opacity:.6}
.story .site{right:calc(30px * var(--s))}
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
  /* Rendered at 2x and resampled to the exact upload size: supersampling is
     what keeps 800-weight display type clean at these sizes. */
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
