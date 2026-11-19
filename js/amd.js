/*
 * AMD explainer page script.
 * Draws three graphics: a hero stock-price line, an animated server-share chart,
 * and the Xilinx share-swap illustration. Plus the shared article chrome
 * (reveal-on-scroll, progress bar, TOC, copy link). Load after scene-kit.js.
 */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a = {}, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const txt = (p, x, y, s, a = {}) => { const t = el('text', Object.assign({ x, y, 'font-family': 'Inter' }, a), p); t.textContent = s; return t; };
  const $ = (id) => document.getElementById(id);

  /* ---------------- hero: AMD stock-price comeback ---------------- */
  // Approximate yearly close, US$, split-adjusted. Points are illustrative, not tick-exact.
  const STOCK = [
    { year: 2014, v: 3, label: 'Su becomes CEO' },
    { year: 2015, v: 1.62, label: '$1.62 low' },
    { year: 2017, v: 10, label: 'Zen ships' },
    { year: 2019, v: 46 },
    { year: 2022, v: 120, label: 'Passes Intel' },
    { year: 2024, v: 170 },
    { year: 2026, v: 560, label: '$1T club' },
  ];
  function drawHero() {
    const svg = $('heroSvg'); if (!svg) return;
    svg.innerHTML = '';
    const W = 1600, H = 720, padL = 90, padR = 120, padT = 90, padB = 90;
    const xs = STOCK.map((d) => d.year), ys = STOCK.map((d) => d.v);
    const xmin = Math.min(...xs), xmax = Math.max(...xs), ymax = Math.max(...ys);
    const X = (y) => padL + (W - padL - padR) * (y - xmin) / (xmax - xmin);
    const Y = (v) => H - padB - (H - padT - padB) * (v / ymax);
    // baseline + gridlines
    [0, 0.25, 0.5, 0.75, 1].forEach((f) => {
      const y = H - padB - (H - padT - padB) * f;
      el('line', { x1: padL, y1: y, x2: W - padR, y2: y, stroke: '#26262b', 'stroke-width': 1 }, svg);
      txt(svg, padL - 14, y + 5, '$' + Math.round(ymax * f), { 'text-anchor': 'end', 'font-size': 20, fill: '#6b6b74' });
    });
    // area + line
    let dLine = '', dArea = `M${X(STOCK[0].year)} ${H - padB}`;
    STOCK.forEach((d, i) => { const px = X(d.year), py = Y(d.v); dLine += (i ? 'L' : 'M') + px + ' ' + py + ' '; dArea += `L${px} ${py} `; });
    dArea += `L${X(STOCK[STOCK.length - 1].year)} ${H - padB} Z`;
    const grad = el('linearGradient', { id: 'amdHeroGrad', x1: 0, y1: 0, x2: 0, y2: 1 }, svg);
    el('stop', { offset: '0%', 'stop-color': '#e01e2b', 'stop-opacity': 0.5 }, grad);
    el('stop', { offset: '100%', 'stop-color': '#e01e2b', 'stop-opacity': 0 }, grad);
    el('path', { d: dArea, fill: 'url(#amdHeroGrad)' }, svg);
    const line = el('path', { d: dLine, fill: 'none', stroke: '#fff', 'stroke-width': 4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);
    // draw-on animation
    const len = line.getTotalLength ? line.getTotalLength() : 3000;
    line.setAttribute('stroke-dasharray', len); line.setAttribute('stroke-dashoffset', len);
    line.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 1800, easing: 'ease-out', fill: 'forwards' });
    // markers + labels
    STOCK.forEach((d) => {
      const px = X(d.year), py = Y(d.v);
      el('circle', { cx: px, cy: py, r: 7, fill: '#e01e2b', stroke: '#fff', 'stroke-width': 3 }, svg);
      txt(svg, px, H - 40, d.year, { 'text-anchor': 'middle', 'font-size': 20, fill: '#8a8a92' });
      if (d.label) {
        const left = px > W * 0.6;
        txt(svg, left ? px - 14 : px + 14, py - 14, d.label, { 'text-anchor': left ? 'end' : 'start', 'font-size': 22, 'font-weight': 700, fill: '#fff' });
      }
    });
    txt(svg, padL, 46, 'AMD share price, US$ (split-adjusted, illustrative)', { 'font-size': 22, 'font-weight': 700, fill: '#fff' });
  }

  /* ---------------- server-share chart (animated on reveal) ---------------- */
  const SHARE = [
    { year: '2006', v: 22 }, { year: '2010', v: 10 }, { year: '2014', v: 3 },
    { year: '2016', v: 1 }, { year: '2019', v: 10 }, { year: '2021', v: 24 },
    { year: '2024', v: 35 }, { year: '2026', v: 46 },
  ];
  function drawShare() {
    const svg = $('shareSvg'); if (!svg) return;
    svg.innerHTML = '';
    const W = 800, H = 460, padL = 54, padR = 20, padT = 30, padB = 54;
    const ymax = 50;
    const X = (i) => padL + (W - padL - padR) * i / (SHARE.length - 1);
    const Y = (v) => H - padB - (H - padT - padB) * (v / ymax);
    [0, 10, 20, 30, 40, 50].forEach((g) => {
      const y = Y(g);
      el('line', { x1: padL, y1: y, x2: W - padR, y2: y, stroke: '#e6e0d3', 'stroke-width': 1 }, svg);
      txt(svg, padL - 10, y + 4, g + '%', { 'text-anchor': 'end', 'font-size': 12, fill: '#8a8578' });
    });
    let dLine = '';
    SHARE.forEach((d, i) => { dLine += (i ? 'L' : 'M') + X(i) + ' ' + Y(d.v) + ' '; });
    const line = el('path', { d: dLine, fill: 'none', stroke: '#e01e2b', 'stroke-width': 3.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);
    SHARE.forEach((d, i) => {
      el('circle', { cx: X(i), cy: Y(d.v), r: 4.5, fill: '#e01e2b' }, svg);
      txt(svg, X(i), H - 32, d.year, { 'text-anchor': 'middle', 'font-size': 11.5, fill: '#8a8578' });
    });
    // annotate the trough and the peak
    txt(svg, X(3), Y(1) + 24, '~1% (near write-off)', { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#111' });
    txt(svg, X(7), Y(46) - 14, '~46% by 2026', { 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 700, fill: '#e01e2b' });
    return line;
  }
  function animateShare(line) {
    if (!line) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const len = line.getTotalLength ? line.getTotalLength() : 1500;
    line.setAttribute('stroke-dasharray', len); line.setAttribute('stroke-dashoffset', len);
    line.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 1600, easing: 'ease-out', fill: 'forwards' });
  }

  /* ---------------- Xilinx share-swap illustration ---------------- */
  function drawSwap() {
    const svg = $('swapSvg'); if (!svg) return;
    svg.innerHTML = '';
    const W = 800, H = 420;
    // two "deal value" bars that grow on reveal: $35B -> $49B
    const base = 330, barW = 150;
    const cols = [
      { x: 180, v: 35, cap: '$35B', sub: 'Announced · Oct 2020', h: 150 },
      { x: 460, v: 49, cap: '$49B', sub: 'Closed · Feb 2022', h: 210 },
    ];
    txt(svg, W / 2, 34, 'Same share ratio (1.7234), rising price', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: '#111' });
    txt(svg, W / 2, 56, 'Fixed exchange of AMD shares for every Xilinx share', { 'text-anchor': 'middle', 'font-size': 12.5, fill: '#6d6a64' });
    cols.forEach((c, i) => {
      const bar = el('rect', { x: c.x, y: base, width: barW, height: 0, rx: 4, fill: i ? '#e01e2b' : '#b8892b', class: 'amd-swapbar' }, svg);
      bar.dataset.h = c.h; bar.dataset.y = base - c.h;
      txt(svg, c.x + barW / 2, base + 24, c.sub, { 'text-anchor': 'middle', 'font-size': 12, fill: '#6d6a64' });
      const val = txt(svg, c.x + barW / 2, base - c.h - 12, c.cap, { 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: i ? '#e01e2b' : '#b8892b', opacity: 0, class: 'amd-swapval' });
      val.dataset.show = '1';
    });
    // arrow between them
    el('path', { d: `M345 ${base - 90} C400 ${base - 150} 420 ${base - 150} 455 ${base - 190}`, fill: 'none', stroke: '#111', 'stroke-width': 2, 'marker-end': 'url(#amdArrow)' }, svg);
    const defs = el('defs', {}, svg);
    const m = el('marker', { id: 'amdArrow', markerWidth: 10, markerHeight: 10, refX: 7, refY: 3, orient: 'auto', markerUnits: 'strokeWidth' }, defs);
    el('path', { d: 'M0 0 L7 3 L0 6 Z', fill: '#111' }, m);
    txt(svg, 400, base - 150, '+$14B, no extra cash', { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: '#111' });
  }
  function animateSwap() {
    const svg = $('swapSvg'); if (!svg) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bars = [...svg.querySelectorAll('.amd-swapbar')];
    const vals = [...svg.querySelectorAll('.amd-swapval')];
    if (reduce) {
      bars.forEach((b) => { b.setAttribute('height', b.dataset.h); b.setAttribute('y', b.dataset.y); });
      vals.forEach((v) => v.setAttribute('opacity', 1));
      return;
    }
    const tween = (b, i) => {
      const h = +b.dataset.h, base = +b.dataset.y + h; // base = bottom of the bar (fixed)
      const start = performance.now(), dur = 900, delay = 200 + i * 350;
      function frame(now) {
        const t = Math.min(1, Math.max(0, (now - start - delay) / dur));
        const e = 1 - Math.pow(1 - t, 3); // easeOutCubic
        b.setAttribute('height', (h * e).toFixed(1));
        b.setAttribute('y', (base - h * e).toFixed(1));
        if (t < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    };
    bars.forEach(tween);
    vals.forEach((v, i) => setTimeout(() => {
      v.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, fill: 'forwards' });
      v.setAttribute('opacity', 1);
    }, 800 + i * 350));
  }

  /* ---------------- reveal-on-scroll ---------------- */
  const shareLine = drawShare();
  drawSwap();
  const rio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in-view');
    if (e.target.id === 'shareFig') animateShare(shareLine);
    if (e.target.id === 'swapFig') animateSwap();
    rio.unobserve(e.target);
  }), { threshold: 0.2 });
  document.querySelectorAll('.rv').forEach((e) => rio.observe(e));

  drawHero();

  /* ---------------- progress bar + TOC ---------------- */
  const prog = $('prog'), tocLinks = [...document.querySelectorAll('#toc a')];
  addEventListener('scroll', () => {
    const h = document.documentElement;
    if (prog) prog.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
    const y = scrollY + 120;
    tocLinks.forEach((a) => {
      const sec = document.querySelector(a.getAttribute('href'));
      if (sec) a.classList.toggle('on', sec.offsetTop <= y && sec.offsetTop + sec.offsetHeight > y);
    });
  });
  tocLinks.forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); const s = document.querySelector(a.getAttribute('href')); if (s) s.scrollIntoView({ behavior: 'smooth' }); }));

  /* ---------------- copy link ---------------- */
  const cl = $('copyLink');
  if (cl) cl.addEventListener('click', async (e) => { try { await navigator.clipboard.writeText(location.href); e.target.textContent = 'Copied'; } catch (_) { e.target.textContent = 'Copy from address bar'; } });
})();
