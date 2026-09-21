/* BIOD theme JS */
(function () {
  const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cfg = window.BIOD || {};

  /* ---------- scroll reveals ---------- */
  if (cfg.reveals !== false) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  }

  /* ---------- stat count-up ---------- */
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const el = e.target, target = +el.dataset.target, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (!motionOK) { el.textContent = pre + target + suf; return; }
    const t0 = performance.now(), dur = 1300;
    (function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = pre + Math.round(easeOut(p) * target) + suf;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }), { threshold: .5 });
  document.querySelectorAll('[data-target].count').forEach(el => cio.observe(el));

  /* ---------- final CTA: clear-skin-era loader (stalls at 99%) ---------- */
  const loader = document.querySelector('[data-loader]');
  if (loader) {
    const fill = loader.querySelector('[data-loader-fill]');
    const pct = loader.querySelector('[data-loader-pct]');
    const lio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      lio.unobserve(loader);
      if (!motionOK) { fill.style.width = '99%'; pct.textContent = 99; return; }
      const t0 = performance.now(), dur = 2400;
      (function tick(now) {
        const p = Math.min((now - t0) / dur, 1);
        const v = Math.round(easeOut(p) * 99);
        fill.style.width = v + '%';
        pct.textContent = v;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }), { threshold: .4 });
    lio.observe(loader);
  }

  /* ---------- velocity marquees ---------- */
  let lastY = window.scrollY, velocity = 0, vTimer;
  if (motionOK && cfg.marqueeVelocity !== false) {
    document.querySelectorAll('.ticker__track, .rev-track').forEach(track => {
      track.style.animation = 'none';
      const base = +track.dataset.speed || 90;
      let paused = false;
      track.addEventListener('mouseenter', () => paused = true);
      track.addEventListener('mouseleave', () => paused = false);
      track.addEventListener('touchstart', () => paused = true, { passive: true });
      track.addEventListener('touchend', () => setTimeout(() => paused = false, 1200), { passive: true });
      let offset = Math.random() * 200, prev = performance.now();
      const half = () => track.scrollWidth / 2;
      (function loop(now) {
        const dt = Math.min((now - prev) / 1000, .05); prev = now;
        if (!paused && half() > 0) {
          offset = (offset + (base + Math.min(Math.abs(velocity) * .9, 700)) * dt) % half();
          track.style.transform = 'translateX(' + (-offset).toFixed(1) + 'px)';
        }
        requestAnimationFrame(loop);
      })(prev);
    });
    addEventListener('scroll', () => {
      const y = window.scrollY;
      velocity = y - lastY; lastY = y;
      clearTimeout(vTimer); vTimer = setTimeout(() => velocity = 0, 90);
    }, { passive: true });
  }

  /* ---------- hero sticker parallax ---------- */
  const stickers = [...document.querySelectorAll('.hs')];
  const speeds = [-.16, -.10, .12, .08];
  if (motionOK && stickers.length) {
    addEventListener('scroll', () => {
      const y = window.scrollY;
      stickers.forEach((s, i) => s.style.setProperty('--py', (y * (speeds[i % 4])).toFixed(1) + 'px'));
    }, { passive: true });
  }

  /* ---------- header: mobile menu + cart bump ---------- */
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }

  function bumpCart(count) {
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      el.textContent = count;
      const link = el.closest('.cart-link');
      if (link) { link.classList.remove('bump'); void link.offsetWidth; link.classList.add('bump'); }
    });
  }

  /* ---------- cart drawer ----------
     The drawer lives in snippets/cart-drawer.liquid and is rendered on every page by
     sections/cart-drawer.liquid, so it is re-rendered on the server after every cart
     change: money keeps coming from the theme's money filter and the free-delivery
     progress keeps coming from the free-shipping-bar snippet. This file only chooses
     which of the server-rendered upsell cards to show, and opens and closes the panel.
     Every path that can fail falls back to the cart page — an add that succeeded must
     never leave the shopper stranded. */
  const DRAWER_SECTION = 'cart-drawer';
  const UPSELL_MAX = 3;
  let drawerBusy = false;
  let drawerTrigger = null;
  let lastAddedProductId = null;

  const drawerRoot = () => document.querySelector('[data-cart-drawer]');

  function cartRoutes() {
    const d = (drawerRoot() || {}).dataset || {};
    return {
      cart: d.cartUrl || '/cart',
      add: d.cartAddUrl || '/cart/add',
      change: d.cartChangeUrl || '/cart/change'
    };
  }

  async function fetchDrawerSection(routes) {
    const res = await fetch(routes.cart + '?sections=' + DRAWER_SECTION, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('drawer section');
    const html = (await res.json())[DRAWER_SECTION];
    if (!html) throw new Error('drawer section');
    return html;
  }

  function applyDrawerSection(root, html) {
    const next = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-cart-drawer-inner]');
    const current = root.querySelector('[data-cart-drawer-inner]');
    if (!next || !current) throw new Error('drawer markup');
    current.innerHTML = next.innerHTML;
  }

  function drawerPairs(root, productId) {
    const el = productId ? root.querySelector('[data-cart-drawer-pairs]') : null;
    if (!el) return [];
    try {
      const list = JSON.parse(el.textContent)[productId];
      return Array.isArray(list) ? list : [];
    } catch (err) {
      return [];
    }
  }

  /* Upsell priority, in order:
       1) top up the just-added line — the snippet only renders that card when the
          quantity on it is verified to reach the free-delivery threshold,
       2) that product's curated biod.pairs_with list, in the order stored,
       3) fill: while the cart is short of the threshold, the cheapest product that
          actually crosses it (data-crosses) comes first, and only if nothing can cross
          do we fall back to whatever gets closest — never to "cheapest overall", which
          would spend the shopper's money and still leave them paying for delivery.
          Once the cart clears the threshold, cheapest first is the easy yes.
     The candidates are all server-rendered; anything already in the cart or out of
     stock never reaches the pool, and only a card the server verified may say
     anything about free delivery. */
  function renderUpsells(root) {
    const section = root.querySelector('[data-upsell-section]');
    const list = root.querySelector('[data-upsell-list]');
    if (!section || !list) return;
    const topups = root.querySelector('[data-upsell-topups]');
    const pool = root.querySelector('[data-upsell-pool]');
    const cards = pool ? [...pool.content.querySelectorAll('[data-upsell-card]')] : [];
    const wanted = lastAddedProductId ? String(lastAddedProductId) : '';
    const below = section.dataset.belowThreshold === 'true';
    const price = c => +c.dataset.price || 0;
    const chosen = [];

    if (topups && wanted) {
      const top = [...topups.content.querySelectorAll('[data-upsell-card]')].find(c => c.dataset.productId === wanted);
      if (top) chosen.push(top);
    }
    drawerPairs(root, wanted).forEach(id => {
      if (chosen.length >= UPSELL_MAX) return;
      const card = cards.find(c => c.dataset.productId === String(id) && !chosen.includes(c));
      if (card) chosen.push(card);
    });

    const rest = cards.filter(c => c.dataset.fillExclude !== 'true' && !chosen.includes(c));
    const fill = below
      ? rest.filter(c => c.dataset.crosses === 'true').sort((a, b) => price(a) - price(b))
          .concat(rest.filter(c => c.dataset.crosses !== 'true').sort((a, b) => price(b) - price(a)))
      : rest.sort((a, b) => price(a) - price(b));
    fill.forEach(c => { if (chosen.length < UPSELL_MAX) chosen.push(c); });

    list.textContent = '';
    chosen.slice(0, UPSELL_MAX).forEach(c => list.appendChild(c.cloneNode(true)));
    section.hidden = list.children.length === 0;
  }

  function drawerAnnounce(root, cart) {
    const el = root.querySelector('[data-cart-drawer-status]');
    if (!el || !cart) return;
    el.textContent = cart.item_count === 1 ? '1 item in your bag.' : cart.item_count + ' items in your bag.';
  }

  function drawerFocusables(panel) {
    return [...panel.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')]
      .filter(el => !el.disabled && el.tabIndex >= 0 && (el.offsetWidth > 0 || el.offsetHeight > 0));
  }

  function openDrawer(root, trigger) {
    const wasOpen = root.classList.contains('is-open');
    root.classList.add('is-open');
    document.documentElement.classList.add('cdrawer-open');
    const panel = root.querySelector('[data-cart-drawer-panel]');
    if (!wasOpen) {
      drawerTrigger = trigger || document.activeElement;
      const body = root.querySelector('[data-cart-drawer-body]');
      if (body) body.scrollTop = 0;
      if (panel) panel.focus();
    } else if (panel && !panel.contains(document.activeElement)) {
      panel.focus();
    }
  }

  function closeDrawer(root) {
    root.classList.remove('is-open');
    document.documentElement.classList.remove('cdrawer-open');
    const back = drawerTrigger;
    drawerTrigger = null;
    if (back && !back.disabled && document.contains(back) && typeof back.focus === 'function') back.focus();
  }

  async function showDrawer(routes, html, cart, trigger) {
    const root = drawerRoot();
    if (!root) throw new Error('no drawer');
    applyDrawerSection(root, html || await fetchDrawerSection(routes));
    renderUpsells(root);
    drawerAnnounce(root, cart);
    openDrawer(root, trigger);
  }

  /* Remembers each add button's resting label and its pending restore, so a second add
     from the same button cannot bake "Added ✓" in as the label it reverts to. */
  const addBtnState = new WeakMap();

  /* ---------- AJAX add to cart ---------- */
  document.addEventListener('submit', async ev => {
    const form = ev.target.closest('form[data-ajax-add]');
    if (!form) return;
    ev.preventDefault();
    if (drawerBusy) return;
    const routes = cartRoutes();
    const btn = form.querySelector('[type="submit"]');
    let orig = '';
    if (btn) {
      const state = addBtnState.get(btn) || { label: btn.textContent };
      clearTimeout(state.timer);
      addBtnState.set(btn, state);
      orig = state.label;
    }
    let addedOk = false;
    drawerBusy = true;
    if (btn) { btn.disabled = true; btn.textContent = btn.dataset.addingLabel || 'Adding…'; }
    try {
      const body = new FormData(form);
      body.append('sections', DRAWER_SECTION);
      body.append('sections_url', routes.cart);
      const res = await fetch(routes.add + '.js', { method: 'POST', headers: { 'Accept': 'application/json' }, body });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error((data && data.description) || 'add failed');
      addedOk = true;
      // Re-enable straight away: the drawer is the confirmation now, and closing it has
      // to be able to put focus back on this button. The label still reverts below.
      if (btn) { btn.disabled = false; btn.textContent = btn.dataset.addedLabel || 'Added ✓'; }
      const added = data && (data.items ? data.items[0] : data);
      if (added && added.product_id) lastAddedProductId = added.product_id;
      const cart = await (await fetch(routes.cart + '.js')).json();
      bumpCart(cart.item_count);
      await showDrawer(routes, data && data.sections && data.sections[DRAWER_SECTION], cart, btn || form);
    } catch (err) {
      if (addedOk) {
        // The add went through and only the drawer failed: send the shopper to the cart
        // so the item is still visible and checkout is still one tap away.
        drawerBusy = false;
        window.location = routes.cart;
        return;
      }
      if (btn) btn.textContent = 'Oops — try again';
    }
    drawerBusy = false;
    if (btn) {
      addBtnState.get(btn).timer = setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 1400);
    }
  });

  /* ---------- cart drawer: line qty via /cart/change.js, re-rendered in place ---------- */
  document.addEventListener('click', async ev => {
    const b = ev.target.closest('[data-drawer-line]');
    if (!b) return;
    ev.preventDefault();
    if (drawerBusy) return;
    const root = b.closest('[data-cart-drawer]');
    if (!root) return;
    const line = parseInt(b.dataset.drawerLine, 10);
    const qty = parseInt(b.dataset.drawerQty, 10);
    if (!Number.isFinite(line) || !Number.isFinite(qty)) return;
    const step = b.dataset.drawerStep || '';
    const routes = cartRoutes();
    drawerBusy = true;
    root.classList.add('is-busy');
    try {
      const res = await fetch(routes.change + '.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ line, quantity: qty, sections: DRAWER_SECTION, sections_url: routes.cart })
      });
      if (!res.ok) throw new Error('change failed');
      const cart = await res.json();
      bumpCart(cart.item_count);
      applyDrawerSection(root, (cart.sections && cart.sections[DRAWER_SECTION]) || await fetchDrawerSection(routes));
      renderUpsells(root);
      drawerAnnounce(root, cart);
      // Put focus back on the control that was used. After a removal the line indexes
      // shift, so land on the panel rather than on another line's remove button.
      const onLine = sel => root.querySelector('[data-drawer-line="' + line + '"][data-drawer-step="' + sel + '"]:not([disabled])');
      const back = (step === 'plus' || step === 'minus' ? onLine(step) || onLine('plus') : null)
        || root.querySelector('[data-cart-drawer-panel]');
      if (back) back.focus();
    } catch (err) {
      drawerBusy = false;
      root.classList.remove('is-busy');
      window.location = routes.cart;
      return;
    }
    drawerBusy = false;
    root.classList.remove('is-busy');
  });

  /* ---------- cart drawer: close ---------- */
  document.addEventListener('click', ev => {
    const c = ev.target.closest('[data-cart-drawer-close]');
    if (!c) return;
    const root = c.closest('[data-cart-drawer]');
    if (!root) return;
    ev.preventDefault();
    closeDrawer(root);
  });

  document.addEventListener('keydown', ev => {
    const root = document.querySelector('[data-cart-drawer].is-open');
    if (!root) return;
    if (ev.key === 'Escape') { ev.preventDefault(); closeDrawer(root); return; }
    if (ev.key !== 'Tab') return;
    const panel = root.querySelector('[data-cart-drawer-panel]');
    if (!panel) return;
    const items = drawerFocusables(panel);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (ev.shiftKey) {
      if (document.activeElement === first || !panel.contains(document.activeElement) || document.activeElement === panel) {
        ev.preventDefault(); last.focus();
      }
    } else if (document.activeElement === last) {
      ev.preventDefault(); first.focus();
    }
  });

  /* ---------- PDP: gallery + qty + selling plan price ---------- */
  const pdp = document.querySelector('[data-pdp]');
  if (pdp) {
    const main = pdp.querySelector('.pdp__main-img img');
    pdp.querySelectorAll('.pdp__thumbs img').forEach(t => t.addEventListener('click', () => {
      main.src = t.dataset.full; main.srcset = '';
      pdp.querySelectorAll('.pdp__thumbs img').forEach(x => x.classList.remove('on'));
      t.classList.add('on');
    }));
    const qtyInput = pdp.querySelector('.qty-box input');
    pdp.querySelector('[data-qty-plus]')?.addEventListener('click', () => qtyInput.value = Math.min(+qtyInput.value + 1, 50));
    pdp.querySelector('[data-qty-minus]')?.addEventListener('click', () => qtyInput.value = Math.max(+qtyInput.value - 1, 1));
    pdp.querySelectorAll('.plan').forEach(p => p.addEventListener('click', () => {
      pdp.querySelectorAll('.plan').forEach(x => x.classList.remove('on'));
      p.classList.add('on');
      p.querySelector('input').checked = true;
      const priceEl = pdp.querySelector('[data-price-now]');
      if (priceEl && p.dataset.price) priceEl.innerHTML = p.dataset.price;
    }));
  }

  /* ---------- cart page: line qty via /cart/change.js ---------- */
  document.addEventListener('click', async ev => {
    const b = ev.target.closest('[data-line-change]');
    if (!b) return;
    ev.preventDefault();
    const line = +b.dataset.line, qty = +b.dataset.qty;
    const res = await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ line, quantity: qty })
    });
    if (res.ok) location.reload();
  });
})();
