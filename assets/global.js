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

  /* ---------- roast bubbles: tap sticker → squish + next roast ---------- */
  document.addEventListener('click', ev => {
    const s = ev.target.closest('[data-roasts]');
    if (!s) return;
    const lines = (s.dataset.roasts || '').split('|').map(t => t.trim()).filter(Boolean);
    const bubble = s.querySelector('.roast');
    if (lines.length < 2 || !bubble) return;
    const i = ((+s.dataset.ri || 0) + 1) % lines.length;
    s.dataset.ri = i;
    bubble.textContent = lines[i];
    bubble.style.animation = 'none'; void bubble.offsetWidth;
    bubble.style.animation = ''; bubble.style.animationDelay = '0s';
    s.classList.add('squish');
    setTimeout(() => s.classList.remove('squish'), 220);
  });

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

  /* ---------- AJAX add to cart ---------- */
  document.addEventListener('submit', async ev => {
    const form = ev.target.closest('form[data-ajax-add]');
    if (!form) return;
    ev.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const orig = btn.textContent;
    btn.disabled = true; btn.textContent = 'Adding…';
    try {
      const res = await fetch('/cart/add.js', { method: 'POST', body: new FormData(form) });
      if (!res.ok) throw new Error((await res.json()).description || 'error');
      const cart = await (await fetch('/cart.js')).json();
      bumpCart(cart.item_count);
      btn.textContent = 'Added ✓';
    } catch (err) {
      btn.textContent = 'Oops — try again';
      console.error(err);
    }
    setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 1400);
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
