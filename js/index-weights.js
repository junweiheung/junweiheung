/* Bottleneck: Who Gets the Biggest Slice? (html/explainers/index-weights.html)
   Page chrome (reveal, progress, contents, copy link), the three-recipe weighting
   explorer and the top-ten concentration bars. */
(function () {
  const $ = (id) => document.getElementById(id);

  /* ---------------- reveal-on-scroll, progress bar, contents, copy link ---------------- */
  const rio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in-view'); rio.unobserve(e.target);
  }), { threshold: 0, rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.rv').forEach((e) => rio.observe(e));

  const prog = $('prog'), tocLinks = [...document.querySelectorAll('#toc a')];
  const secs = tocLinks.map((a) => document.querySelector(a.getAttribute('href')));
  addEventListener('scroll', () => {
    const h = document.documentElement;
    if (prog) prog.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
    let cur = 0; secs.forEach((sec, i) => { if (sec && sec.getBoundingClientRect().top < innerHeight * .35) cur = i; });
    tocLinks.forEach((a, i) => a.classList.toggle('on', i === cur));
  }, { passive: true });
  tocLinks.forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); const s = document.querySelector(a.getAttribute('href')); if (s) s.scrollIntoView({ behavior: 'smooth' }); }));
  const cl = $('copyLink');
  if (cl) cl.addEventListener('click', async (e) => { try { await navigator.clipboard.writeText(location.href); e.target.textContent = 'Copied'; } catch (_) { e.target.textContent = 'Copy from address bar'; } });

  /* ---------------- weighting explorer ----------------
     Hypothetical companies: price in $, shares in millions. Value in $ billions = price × shares / 1000. */
  const CO = [
    { n: 'MegaSoft', d: 'Software giant', p: 200, s: 1000, c: '#2463d6' },
    { n: 'Harbour Bank', d: 'Large bank', p: 600, s: 100, c: '#2f7a4a' },
    { n: 'ShopCo', d: 'Retailer', p: 50, s: 400, c: '#b8892b' },
    { n: 'Precision Tools', d: 'Machinery maker', p: 300, s: 20, c: '#a3141f' },
    { n: 'Kopi House', d: 'Café chain', p: 10, s: 400, c: '#7a4fb8' }
  ];
  const LABEL = { cap: 'by company value', eq: 'equally', px: 'by share price' };
  const rows = $('wtRows'), why = $('wtWhy'), modeEl = $('wtMode'), splitEl = $('wtSplit');
  if (rows) {
    let mode = 'cap', split = false, sel = 1;
    const price = (i) => (i === 0 && split ? CO[0].p / 4 : CO[i].p);
    const shares = (i) => (i === 0 && split ? CO[0].s * 4 : CO[i].s);
    const weights = (m) => {
      if (m === 'eq') return CO.map(() => 1 / CO.length);
      const v = CO.map((_, i) => (m === 'cap' ? price(i) * shares(i) : price(i)));
      const t = v.reduce((a, b) => a + b, 0);
      return v.map((x) => x / t);
    };
    const pct = (x) => (x * 100).toFixed(x < 0.1 ? 1 : 0) + '%';
    const money = (x) => '$' + (x >= 1 ? x.toFixed(x % 1 ? 1 : 0) : x.toFixed(2));
    const draw = () => {
      const w = weights(mode);
      const max = Math.max(...w);
      rows.innerHTML = CO.map((c, i) => {
        const val = price(i) * shares(i) / 1000;
        return `<button type="button" class="wt-r" data-i="${i}" aria-pressed="${i === sel}" style="--c:${c.c}">
          <span class="wt-n">${c.n}<small>${c.d}</small></span>
          <span class="wt-m">${money(price(i))} × ${shares(i).toLocaleString('en-US')}M = <b>$${val}B</b></span>
          <span class="wt-b"><i style="width:${(w[i] / max * 100).toFixed(1)}%"></i></span>
          <span class="wt-v">${pct(w[i])}</span></button>`;
      }).join('');
      const all = { cap: weights('cap')[sel], eq: weights('eq')[sel], px: weights('px')[sel] };
      const c = CO[sel];
      why.innerHTML = `If <b>${c.n}</b>'s shares rise 10%, an index weighted ${LABEL[mode]} rises <b>${(w[sel] * 10).toFixed(1)}%</b>. ` +
        `For comparison: by value ${(all.cap * 10).toFixed(1)}%, equal ${(all.eq * 10).toFixed(1)}%, by share price ${(all.px * 10).toFixed(1)}%.` +
        (split ? ` After the split MegaSoft is worth exactly the same, but its share price is a quarter, so in the price-weighted index it now counts ${pct(weights('px')[0])} instead of ${pct(200 / 1160)}.` : '');
    };
    modeEl.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      modeEl.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      mode = b.dataset.m; draw();
    });
    splitEl.addEventListener('click', () => {
      split = !split; splitEl.setAttribute('aria-pressed', String(split));
      splitEl.textContent = split ? 'Undo the split' : 'Split MegaSoft 4-for-1';
      if (split) sel = 0;
      draw();
    });
    rows.addEventListener('click', (e) => { const b = e.target.closest('.wt-r'); if (b) { sel = +b.dataset.i; draw(); } });
    draw();
  }

  /* ---------------- top-ten concentration bars ---------------- */
  const tb = $('topBars');
  if (tb) {
    const D = [{ y: '2000', v: 23, t: 'Dot-com peak' }, { y: '2015', v: 19, t: '' }, { y: '2025', v: 40, t: 'Highest since the mid-1960s' }];
    tb.innerHTML = D.map((d) => `<div class="tp-r"><span class="tp-y">${d.y}</span><span class="tp-b"><i style="--w:${d.v * 2}%"></i></span><span class="tp-v">~${d.v}%<small>${d.t}</small></span></div>`).join('');
  }
})();
