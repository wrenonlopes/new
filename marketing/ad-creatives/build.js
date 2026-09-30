/*
 * BIOD static ad creatives for Meta.
 *
 * Three concepts, each borrowing a piece of interface Gen Z reads all day --
 * a text thread, a search result, a receipt -- so the frame looks like
 * something already on their phone rather than something a brand paid for.
 * Copy is written for the ad. None of it is lifted from the storefront.
 *
 * Everything is inlined as data URIs: this container has no egress to
 * fonts.googleapis.com or cdn.shopify.com, and a self-contained file is also
 * what lets it be reopened and re-rendered later without a network.
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
  o700: font('outfit', 'outfit-latin-700-normal.woff2'),
  o800: font('outfit', 'outfit-latin-800-normal.woff2'),
  j500: font('plus-jakarta-sans', 'plus-jakarta-sans-latin-500-normal.woff2'),
  j700: font('plus-jakarta-sans', 'plus-jakarta-sans-latin-700-normal.woff2'),
  m400: font('space-mono', 'space-mono-latin-400-normal.woff2'),
  m700: font('space-mono', 'space-mono-latin-700-normal.woff2'),
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

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* A till receipt is torn off, not cut. The teeth are generated rather than
   drawn so the edge stays sharp at any width. */
function tear(dir) {
  const teeth = 40, w = 100, d = 4;
  const pts = [];
  for (let i = 0; i <= teeth; i++) {
    const x = (i * w) / teeth;
    const y = dir === 'down' ? (i % 2 ? d : 0) : (i % 2 ? 0 : d);
    pts.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  const close = dir === 'down' ? `L${w} 0 L0 0 Z` : `L${w} ${d} L0 ${d} Z`;
  return `<svg class="tear" viewBox="0 0 ${w} ${d}" preserveAspectRatio="none" aria-hidden="true">
    <path d="M${pts.join(' L')} ${close}" fill="#fff"/></svg>`;
}

/* ---------------------------------------------------------------- concepts */
/* Every figure is checked: 50 towels at AED 49; 200 at AED 176 is 88 fils
   exactly; free shipping starts at AED 100, so the bundle clears it and the
   single box does not. No ratings, hygiene or disposal claim appears here. */
const CONCEPTS = [
  {
    id: '01-thread',
    label: 'Face Towel XL — the text thread',
    format: 'chat',
    ground: '#23232B', fg: C.cream, accent: C.leaf, logo: LOGO_CREAM,
    thread: [
      { who: 'them', t: 'can i use your face towel' },
      { who: 'you', t: 'take a fresh one, i have 50' },
      { who: 'them', t: '50?????' },
      { who: 'you', t: 'they were 49 aed lol' },
    ],
    tag: ['aed 49', '50 towels in a box'],
    art: 'single', artW: 390, tilt: -4,
  },
  {
    id: '02-search',
    label: 'Face Towel XL — the search result',
    format: 'search',
    ground: C.paper, fg: C.ink, accent: C.leafDark, logo: LOGO_DARK,
    query: 'why am i still breaking out if i wash my face twice a day',
    answer: [{ t: "it's the " }, { t: 'towel', accent: true }, { t: '.' }],
    sub: 'every wash, you put the same used towel back on clean skin.',
    tag: ['aed 49', '50 clean ones'],
    art: 'single', artW: 470, tilt: 3,
  },
  {
    id: '03-receipt',
    label: 'Bundle XL — the receipt',
    format: 'receipt',
    ground: C.leaf, fg: C.ink, accent: C.ink, logo: LOGO_DARK,
    receipt: {
      title: 'BIOD  ·  XL BUNDLE',
      rows: [
        ['4 BOXES x 50', '200 TOWELS'],
        ['PER TOWEL', 'AED 0.88'],
        ['DELIVERY', 'AED 0.00'],
      ],
      total: ['TOTAL', 'AED 176.00'],
      foot: 'THANK YOU  ·  NOW STOP REORDERING',
    },
    headline: [{ t: '88 fils ' }, { t: 'a face', accent: false }, { t: '.' }],
    sub: 'the cheapest step in the whole routine.',
    tag: ['aed 176', 'delivered free'],
    art: 'row', artW: 210,
  },
];

/* Meta placements this account actually runs: Instagram Feed, Stories, Reels.
   Story keeps its content inside y 270-1520 so neither the profile row at the
   top nor the CTA and action rail at the bottom covers any of it. */
const FORMATS = [
  { key: 'feed', w: 1080, h: 1350, padT: 84, padB: 84, padX: 84, s: 1 },
  { key: 'story', w: 1080, h: 1920, padT: 270, padB: 400, padX: 104, s: 1.05 },
];

function artHTML(c) {
  if (c.art === 'row') {
    return `<div class="row">${[-6, 4, -3, 6]
      .map((t) => `<img class="bx" style="--t:${t}deg;--bw:${c.artW}px" src="${BOX}" alt="">`)
      .join('')}</div>`;
  }
  return `<img class="bx solo" style="--t:${c.tilt}deg;--bw:${c.artW}px" src="${BOX}" alt="">`;
}

function bodyHTML(c) {
  if (c.format === 'chat') {
    return `<div class="thread">${c.thread
      .map((m) => `<div class="bub ${m.who}">${esc(m.t)}</div>`)
      .join('')}</div>`;
  }

  if (c.format === 'search') {
    return `<div class="searchbar">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2.4"/>
          <path d="M16.5 16.5 L21 21" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
        </svg>
        <span>${esc(c.query)}<i class="caret"></i></span>
      </div>
      <h1 class="answer">${c.answer
        .map((p) => (p.accent ? `<em>${esc(p.t)}</em>` : esc(p.t)))
        .join('')}</h1>
      <p class="sub">${esc(c.sub)}</p>`;
  }

  const r = c.receipt;
  return `<div class="receipt">
      ${tear('up')}
      <div class="rbody">
        <div class="rtitle">${esc(r.title)}</div>
        <div class="rdash"></div>
        ${r.rows.map(([a, b]) => `<div class="rrow"><span>${esc(a)}</span><span>${esc(b)}</span></div>`).join('')}
        <div class="rdash"></div>
        <div class="rrow rtotal"><span>${esc(r.total[0])}</span><span>${esc(r.total[1])}</span></div>
        <div class="rfoot">${esc(r.foot)}</div>
      </div>
      ${tear('down')}
    </div>
    <h1 class="head">${c.headline.map((p) => esc(p.t)).join('')}</h1>
    <p class="sub">${esc(c.sub)}</p>`;
}

function canvas(c, f) {
  return `
<div class="canvas ${f.key} f-${c.format}" data-name="biod-${c.id}-${f.key}"
     data-w="${f.w}" data-h="${f.h}"
     style="--ground:${c.ground};--fg:${c.fg};--accent:${c.accent};
            --w:${f.w}px;--h:${f.h}px;--padT:${f.padT}px;--padB:${f.padB}px;
            --padX:${f.padX}px;--s:${f.s}">
  <div class="inner">
    <header><img class="logo" src="${c.logo}" alt="biod"></header>
    <div class="body">${bodyHTML(c)}</div>
    <div class="art">${artHTML(c)}</div>
    <div class="foot">
      <div class="tag"><b>${esc(c.tag[0])}</b><span>${esc(c.tag[1])}</span></div>
      <div class="site">biod.co</div>
    </div>
  </div>
</div>`;
}

const html = `<!doctype html>
<meta charset="utf-8">
<title>BIOD static ad creatives</title>
<style>
@font-face{font-family:Outfit;src:url(${FONTS.o700}) format('woff2');font-weight:700;font-display:block}
@font-face{font-family:Outfit;src:url(${FONTS.o800}) format('woff2');font-weight:800;font-display:block}
@font-face{font-family:'Plus Jakarta Sans';src:url(${FONTS.j500}) format('woff2');font-weight:500;font-display:block}
@font-face{font-family:'Plus Jakarta Sans';src:url(${FONTS.j700}) format('woff2');font-weight:700;font-display:block}
@font-face{font-family:'Space Mono';src:url(${FONTS.m400}) format('woff2');font-weight:400;font-display:block}
@font-face{font-family:'Space Mono';src:url(${FONTS.m700}) format('woff2');font-weight:700;font-display:block}

*{box-sizing:border-box;margin:0;padding:0}
body{background:#141418;font-family:'Plus Jakarta Sans',system-ui,sans-serif;
     display:flex;flex-wrap:wrap;gap:40px;padding:40px;align-items:flex-start}

.canvas{width:var(--w);height:var(--h);background:var(--ground);color:var(--fg);
        position:relative;overflow:hidden;flex:none}
.inner{position:absolute;inset:0;padding:var(--padT) var(--padX) var(--padB);
       display:flex;flex-direction:column}
.logo{height:calc(42px * var(--s));width:auto;display:block;opacity:.9}
header{margin-bottom:calc(46px * var(--s))}
.body{flex:none}

/* ------------------------------------------------------------------- chat */
/* Tailless bubbles with one tightened corner: the shape every messaging app
   has settled on, so it reads as a thread without copying any one of them. */
.thread{display:flex;flex-direction:column;gap:calc(18px * var(--s))}
.bub{max-width:80%;padding:calc(26px * var(--s)) calc(36px * var(--s));
     font-size:calc(43px * var(--s));line-height:1.28;font-weight:500;
     border-radius:calc(42px * var(--s))}
.bub.them{align-self:flex-start;background:#3A3A46;color:var(--fg);
          border-bottom-left-radius:calc(12px * var(--s))}
.bub.you{align-self:flex-end;background:var(--accent);color:#1B2410;font-weight:700;
         border-bottom-right-radius:calc(12px * var(--s))}

/* ----------------------------------------------------------------- search */
.searchbar{display:flex;align-items:center;gap:calc(22px * var(--s));
           background:#fff;border:calc(3px * var(--s)) solid rgba(46,46,56,.14);
           border-radius:calc(999px);padding:calc(26px * var(--s)) calc(36px * var(--s));
           box-shadow:0 calc(10px * var(--s)) calc(30px * var(--s)) rgba(46,46,56,.07)}
.searchbar svg{width:calc(38px * var(--s));height:calc(38px * var(--s));flex:none;opacity:.42}
.searchbar span{font-size:calc(32px * var(--s));line-height:1.3;font-weight:500;opacity:.82}
.caret{display:inline-block;vertical-align:-calc(5px * var(--s));
       width:calc(3px * var(--s));height:calc(34px * var(--s));background:var(--accent);
       margin-left:calc(6px * var(--s))}
.answer{margin-top:calc(46px * var(--s));font-family:Outfit,sans-serif;font-weight:800;
        font-size:calc(132px * var(--s));line-height:.96;letter-spacing:-.04em}
.answer em{font-style:normal;color:var(--accent)}

/* ---------------------------------------------------------------- receipt */
.receipt{position:relative;width:calc(640px * var(--s));margin:0 auto;
         filter:drop-shadow(0 calc(22px * var(--s)) calc(40px * var(--s)) rgba(0,0,0,.2))}
.tear{display:block;width:100%;height:calc(14px * var(--s))}
.rbody{background:#fff;color:#1C1C22;font-family:'Space Mono',ui-monospace,monospace;
       padding:calc(10px * var(--s)) calc(44px * var(--s)) calc(16px * var(--s))}
.rtitle{text-align:center;font-weight:700;font-size:calc(30px * var(--s));
        letter-spacing:.08em;padding:calc(16px * var(--s)) 0 calc(20px * var(--s))}
.rdash{height:calc(2px * var(--s));margin:calc(12px * var(--s)) 0;
       background:repeating-linear-gradient(90deg,#1C1C22 0 10px,transparent 10px 20px);opacity:.45}
.rrow{display:flex;justify-content:space-between;gap:calc(20px * var(--s));
      font-size:calc(28px * var(--s));line-height:2;font-variant-numeric:tabular-nums}
.rtotal{font-weight:700;font-size:calc(38px * var(--s))}
.rfoot{text-align:center;font-size:calc(21px * var(--s));letter-spacing:.06em;
       opacity:.5;padding-top:calc(18px * var(--s))}
.head{margin-top:calc(44px * var(--s));font-family:Outfit,sans-serif;font-weight:800;
      font-size:calc(112px * var(--s));line-height:.96;letter-spacing:-.04em;text-align:center}

.sub{margin-top:calc(26px * var(--s));font-weight:500;font-size:calc(35px * var(--s));
     line-height:1.4;opacity:.78;max-width:calc(820px * var(--s))}
.f-receipt .sub{text-align:center;margin-inline:auto}

/* -------------------------------------------------------------------- art */
.art{flex:1;position:relative;display:flex;align-items:center;justify-content:center;
     min-height:0}
.bx{display:block;width:var(--bw);height:auto;max-height:100%;object-fit:contain;
    transform:rotate(var(--t,0deg));
    filter:drop-shadow(0 calc(20px * var(--s)) calc(38px * var(--s)) rgba(0,0,0,.26))}
.solo{width:calc(var(--bw) * var(--s))}
.row{display:flex;align-items:center;justify-content:center}
.row .bx{width:calc(var(--bw) * var(--s));margin-inline:calc(-26px * var(--s))}
.row .bx:nth-child(2){z-index:2}.row .bx:nth-child(3){z-index:3}
.row .bx:nth-child(4){z-index:4}

/* ------------------------------------------------------------------- foot */
/* The one piece of furniture all three share, so the set reads as a family
   while the middle of each frame does something completely different. */
.foot{display:flex;align-items:center;justify-content:space-between;gap:24px;flex:none}
.tag{display:flex;align-items:baseline;gap:calc(16px * var(--s));
     background:var(--fg);color:var(--ground);
     padding:calc(16px * var(--s)) calc(32px * var(--s)) calc(19px * var(--s))}
.tag b{font-family:Outfit,sans-serif;font-weight:800;font-size:calc(52px * var(--s));
       letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.tag span{font-weight:700;font-size:calc(25px * var(--s));opacity:.72}
.site{font-weight:700;font-size:calc(29px * var(--s));letter-spacing:.05em;opacity:.7}
.story .foot{padding-right:calc(36px * var(--s))}
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
     is what keeps the 800-weight display type clean. */
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
