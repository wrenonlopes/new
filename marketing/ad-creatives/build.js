/*
 * Builds the BIOD Meta static ad creatives as one self-contained HTML file,
 * then renders each canvas to a PNG at Meta's exact upload sizes.
 *
 * Everything is inlined as data URIs: this container has no egress to
 * fonts.googleapis.com or cdn.shopify.com, and a self-contained file is also
 * what lets the file be reopened and re-rendered later without a network.
 *
 *   node build.js          # writes creatives.html + out/*.png
 */
const fs = require('fs');
const path = require('path');

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

/* Brand tokens, lifted verbatim from config/settings_data.json so the ads and
   the storefront cannot drift apart. */
const C = {
  leaf: '#7AC143', leafDark: '#3E7015', ink: '#2E2E38',
  cream: '#F8F1DF', paper: '#FDFBF5', kraft: '#C69A6D', sunrise: '#E9601F',
};

/* ---------------------------------------------------------------- concepts */
/* Every number here is checked: 50 towels at AED 49; 200 towels at AED 176 is
   88 fils exactly; free_shipping_threshold is 100, so the bundle clears it and
   the single box does not. No ratings claim and no hygiene or disposal claim
   appears on any of the three. */
const CONCEPTS = [
  {
    id: '01-xl-bathroom',
    label: 'Face Towel XL — bathroom towel',
    ground: C.ink, fg: C.cream, accent: C.leaf, logo: LOGO_CREAM, glow: true,
    headline: [{ parts: [{ t: '50 ' }, { t: 'clean', accent: true }] }, { t: 'towels.' }],
    sub: 'Or keep using the one hanging in your bathroom.',
    price: '49', priceNote: '50 towels · 98 fils each',
    art: 'single', tilt: 0,
  },
  {
    id: '02-xl-once',
    label: 'Face Towel XL — one towel, one face, once',
    ground: C.leaf, fg: C.ink, accent: C.ink, logo: LOGO_DARK, mark: C.cream, markFg: C.leafDark,
    headline: [{ t: 'One towel.' }, { t: 'One face.' }, { t: 'Once.', mark: true }],
    sub: 'Then tomorrow you take a fresh one.',
    price: '49', priceNote: '50 in a box',
    art: 'single', tilt: -5,
  },
  {
    id: '03-bundle-math',
    label: 'Bundle XL — the maths',
    ground: C.cream, fg: C.ink, accent: C.leafDark, logo: LOGO_DARK,
    headline: [{ t: '200 towels.' }, { t: '88 fils each.', accent: true }],
    sub: 'Four boxes of 50. Buy it once and stop reordering.',
    price: '176', priceNote: 'Free delivery',
    art: 'quad', tilt: 0,
  },
];

/* Meta placements this account actually runs: Instagram Feed, Stories, Reels.
   Story keeps its content inside y 270-1520 so neither the profile row at the
   top nor the CTA and action rail at the bottom cover any of it. */
const FORMATS = [
  { key: 'feed', w: 1080, h: 1350, padT: 88, padB: 88, padX: 88, s: 1 },
  { key: 'story', w: 1080, h: 1920, padT: 270, padB: 400, padX: 110, s: 1.06 },
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function headlineHTML(c) {
  return c.headline.map((l) => {
    if (l.parts) {
      const inner = l.parts
        .map((p) => (p.accent ? `<span class="a">${esc(p.t)}</span>` : esc(p.t)))
        .join('');
      return `<span>${inner}</span>`;
    }
    const cls = l.accent ? ' class="a"' : l.mark ? ' class="m"' : '';
    return `<span${cls}>${esc(l.t)}</span>`;
  }).join('');
}

function artHTML(c) {
  if (c.art === 'quad') {
    const tilts = [-5, 4, -3, 6];
    return `<div class="quad">${tilts
      .map((t, i) => `<img class="bx q${i}" style="--t:${t}deg" src="${BOX}" alt="">`)
      .join('')}</div>`;
  }
  return `<img class="bx solo" style="--t:${c.tilt}deg" src="${BOX}" alt="">`;
}

function canvas(c, f) {
  return `
<div class="canvas ${f.key}" data-name="biod-${c.id}-${f.key}" data-w="${f.w}" data-h="${f.h}"
     style="--ground:${c.ground};--fg:${c.fg};--accent:${c.accent};--mark:${c.mark || c.accent};--markFg:${c.markFg || c.ground};
            --w:${f.w}px;--h:${f.h}px;--padT:${f.padT}px;--padB:${f.padB}px;--padX:${f.padX}px;--s:${f.s}">
  <div class="inner">
    <header><img class="logo" src="${c.logo}" alt="biod"></header>
    <h1 class="head">${headlineHTML(c)}</h1>
    <p class="sub">${esc(c.sub)}</p>
    <div class="rule" aria-hidden="true"></div>
    <div class="art">${c.glow ? '<div class="glow" aria-hidden="true"></div>' : ''}${artHTML(c)}</div>
    <div class="foot">
      <div class="tag">
        <div class="tagrow"><span class="cur">AED</span><span class="amt">${c.price}</span></div>
        <div class="note">${esc(c.priceNote)}</div>
      </div>
      <div class="site">biod.co</div>
    </div>
  </div>
</div>`;
}

const html = `<!doctype html>
<meta charset="utf-8">
<title>BIOD static ad creatives</title>
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

/* Wordmark is set small and quiet: the box art already carries the brand, and
   the job of the top of the frame is to get out of the headline's way. */
.logo{height:calc(46px * var(--s));width:auto;display:block;opacity:.92}
header{margin-bottom:calc(52px * var(--s))}

.head{font-family:Outfit,system-ui,sans-serif;font-weight:800;
      font-size:calc(104px * var(--s));line-height:.94;letter-spacing:-.035em;
      display:flex;flex-direction:column;text-wrap:balance}
.head .a{color:var(--accent)}
/* The marker block gives the payoff word full contrast on the green ground,
   where a tinted word would sit too close to it. box-decoration-break keeps
   the block tight to the glyphs rather than to the line box. */
.head .m{background:var(--mark);color:var(--markFg);align-self:flex-start;
         padding:0 calc(20px * var(--s)) calc(8px * var(--s));
         margin-left:calc(-20px * var(--s));margin-top:calc(10px * var(--s));
         -webkit-box-decoration-break:clone;box-decoration-break:clone}

.sub{margin-top:calc(34px * var(--s));font-weight:500;
     font-size:calc(38px * var(--s));line-height:1.38;opacity:.84;
     max-width:calc(760px * var(--s))}

/* Perforation. These towels are pulled one at a time off a stack, so a tear
   line is the product's own vocabulary rather than an applied ornament. */
.rule{margin-top:calc(40px * var(--s));height:3px;flex:none;
      background:repeating-linear-gradient(90deg,currentColor 0 16px,transparent 16px 32px);
      opacity:.28}

.art{flex:1;position:relative;display:flex;align-items:center;justify-content:center;
     min-height:0;margin:calc(12px * var(--s)) 0}
.glow{position:absolute;inset:-12%;
      background:radial-gradient(ellipse at 50% 52%,rgba(255,255,255,.17),transparent 62%)}
.bx{position:relative;display:block;transform:rotate(var(--t));
    filter:drop-shadow(0 calc(26px * var(--s)) calc(48px * var(--s)) rgba(0,0,0,.24))}
.solo{width:calc(650px * var(--s));height:auto;max-height:100%;object-fit:contain}

.quad{position:relative;display:grid;grid-template-columns:repeat(2,auto);
      justify-content:center;align-content:center;
      gap:calc(4px * var(--s)) calc(10px * var(--s))}
.quad .bx{width:calc(340px * var(--s));height:auto}
.q0{z-index:2}.q1{z-index:1;margin-left:calc(-46px * var(--s))}
.q2{z-index:4;margin-top:calc(-64px * var(--s))}
.q3{z-index:3;margin-top:calc(-64px * var(--s));margin-left:calc(-46px * var(--s))}

.foot{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex:none}

/* Shelf ticket: a hard-edged block in the inverted colour, set flush to the
   left gutter so the price reads as a tag clipped onto the frame. */
.tag{position:relative;background:var(--fg);color:var(--ground);
     padding:calc(18px * var(--s)) calc(38px * var(--s)) calc(20px * var(--s)) calc(34px * var(--s))}
.tagrow{display:flex;align-items:baseline;gap:calc(12px * var(--s))}
.cur{font-family:Outfit,sans-serif;font-weight:700;font-size:calc(38px * var(--s));
     letter-spacing:.02em;opacity:.7}
.amt{font-family:Outfit,sans-serif;font-weight:800;font-size:calc(104px * var(--s));
     line-height:.86;letter-spacing:-.04em;font-variant-numeric:tabular-nums}
.note{margin-top:calc(8px * var(--s));font-weight:700;
      font-size:calc(23px * var(--s));letter-spacing:.11em;text-transform:uppercase;opacity:.74}

.site{font-weight:700;font-size:calc(30px * var(--s));letter-spacing:.06em;
      opacity:.72;padding-bottom:calc(6px * var(--s))}

/* Story keeps a wider gutter on the right so the Reels action rail never
   crosses the type. */
.story .foot{padding-right:calc(40px * var(--s))}
</style>
${CONCEPTS.map((c) => FORMATS.map((f) => canvas(c, f)).join('\n')).join('\n')}
`;

fs.writeFileSync(path.join(ROOT, 'creatives.html'), html);
console.log('wrote creatives.html (' + (html.length / 1024 / 1024).toFixed(2) + ' MB)');

/* ------------------------------------------------------------------ render */
(async () => {
  let chromium;
  try { ({ chromium } = require('playwright')); }
  catch { console.log('playwright not installed here — open creatives.html in a browser instead'); return; }

  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  /* Rendered at 2x and resampled down to the exact upload size: supersampling
     is what keeps the 800-weight display type clean at these sizes. */
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.join(ROOT, 'creatives.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  const nodes = await page.$$('.canvas');
  for (const n of nodes) {
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
