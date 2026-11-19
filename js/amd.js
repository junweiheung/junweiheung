/*
 * AMD explainer: hero share-price chart (real closes, log scale), server-share chart (reported Mercury points only),
 * Xilinx deal bars, data-centre bars, and the shared article chrome. Load after scene-kit.js and amd-scene.js.
 */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a = {}, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const txt = (p, x, y, s, a = {}) => { const t = el('text', Object.assign({ x, y, 'font-family': 'Inter' }, a), p); t.textContent = s; return t; };
  const $ = (id) => document.getElementById(id);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // draw a line on; a timer guarantees the finished state even if the browser throttles animation frames
  const drawOn = (path, ms, delay = 0) => {
    if (reduced || !path.getTotalLength) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
    path.getBoundingClientRect();
    path.style.transition = `stroke-dashoffset ${ms}ms ease-out ${delay}ms`;
    requestAnimationFrame(() => { path.style.strokeDashoffset = 0; });
    setTimeout(() => { path.style.transition = 'none'; path.style.strokeDasharray = 'none'; path.style.strokeDashoffset = 0; }, ms + delay + 150);
  };

  /* ---------------- hero: real share prices, log scale ---------------- */
  // t = fractional year. Year-end closes (StatMuse), the July 2015 low, the 21 Sep 2026 intraday high, the 18 Nov 2026 close.
  const PX = [
    { t: 2014.99, v: 2.67 }, { t: 2015.57, v: 1.62, lab: '$1.62 low', sub: 'Jul 2015', below: 1 },
    { t: 2015.99, v: 2.87 }, { t: 2016.99, v: 11.34 }, { t: 2017.99, v: 10.28 }, { t: 2018.99, v: 18.46 },
    { t: 2019.99, v: 45.86 }, { t: 2020.99, v: 91.71 }, { t: 2021.99, v: 143.90 }, { t: 2022.99, v: 64.77, lab: '$64.77', sub: 'end 2022', below: 1 },
    { t: 2023.99, v: 147.41 }, { t: 2024.99, v: 120.79 }, { t: 2025.99, v: 214.16 },
    { t: 2026.72, v: 615.52, lab: '$615.52', sub: '21 Sep 2026 · $1T', left: 1 }, { t: 2026.88, v: 530.14, lab: '$530.14', sub: '18 Nov 2026', below: 2, left: 1 },
  ];
  const EVENTS = [[2014.78, 'Su becomes CEO'], [2017.15, 'Zen ships'], [2022.12, 'Xilinx closes, passes Intel'], [2025.77, 'OpenAI deal']];
  (function hero() {
    const s = $('heroSvg'); if (!s) return;
    const L = 150, R = 1500, T = 120, B = 640, t0 = 2014.5, t1 = 2027;
    const X = (t) => L + (t - t0) / (t1 - t0) * (R - L);
    const lg = Math.log10, Y = (v) => B - (lg(v) - lg(1)) / (lg(1000) - lg(1)) * (B - T);
    txt(s, L, 66, 'AMD share price, US$', { 'font-size': 30, 'font-weight': 700, fill: '#fff' });
    txt(s, L, 98, 'Log scale: each gridline is ten times the one below', { 'font-size': 19, fill: '#8d8a84' });
    [1, 10, 100, 1000].forEach((v) => {
      el('line', { x1: L, x2: R, y1: Y(v), y2: Y(v), stroke: '#26262b', 'stroke-width': 1.5 }, s);
      txt(s, L - 16, Y(v) + 7, '$' + v.toLocaleString(), { 'text-anchor': 'end', 'font-size': 20, fill: '#6b6b74' });
    });
    for (let y = 2015; y <= 2026; y++) txt(s, X(y + .5), B + 34, y, { 'text-anchor': 'middle', 'font-size': 18, fill: y % 2 ? '#6b6b74' : '#8d8a84' });
    EVENTS.forEach(([t, l]) => {
      el('line', { x1: X(t), x2: X(t), y1: T - 4, y2: B, stroke: '#3a3833', 'stroke-dasharray': '4 6', 'stroke-width': 2 }, s);
      txt(s, X(t) + 8, t < 2020 ? T + 10 : B - 14, l, { 'font-size': 17, 'font-weight': 600, fill: '#8d8a84' });
    });
    const d = PX.map((p, i) => (i ? 'L' : 'M') + X(p.t).toFixed(1) + ' ' + Y(p.v).toFixed(1)).join(' ');
    const g = el('linearGradient', { id: 'amdHeroGrad', x1: 0, y1: 0, x2: 0, y2: 1 }, el('defs', {}, s));
    el('stop', { offset: '0%', 'stop-color': '#e01e2b', 'stop-opacity': .45 }, g); el('stop', { offset: '100%', 'stop-color': '#e01e2b', 'stop-opacity': 0 }, g);
    el('path', { d: d + ` L${X(PX[PX.length - 1].t)} ${B} L${X(PX[0].t)} ${B} Z`, fill: 'url(#amdHeroGrad)' }, s);
    drawOn(el('path', { d, fill: 'none', stroke: '#fff', 'stroke-width': 5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, s), 2000, 200);
    PX.forEach((p) => {
      const x = X(p.t), y = Y(p.v);
      el('circle', { cx: x, cy: y, r: p.lab ? 9 : 6, fill: p.lab ? '#e01e2b' : '#fff', stroke: p.lab ? '#fff' : 'none', 'stroke-width': 3 }, s);
      if (!p.lab) return;
      const anchor = p.left ? 'end' : 'start', dx = p.left ? -16 : 16, dy = p.below === 2 ? 12 : p.below ? 34 : p.left ? -44 : -30;
      txt(s, x + dx, y + dy, p.lab, { 'text-anchor': anchor, 'font-size': 26, 'font-weight': 800, fill: '#fff' });
      txt(s, x + dx, y + dy + 24, p.sub, { 'text-anchor': anchor, 'font-size': 17, fill: '#cfcbc3' });
    });
  })();

  /* ---------------- server share: reported points only ---------------- */
  (function share() {
    const s = $('shareSvg'); if (!s) return;
    const L = 56, R = 770, T = 24, B = 360, t0 = 2005.5, t1 = 2027;
    const X = (t) => L + (t - t0) / (t1 - t0) * (R - L), Y = (v) => B - v / 50 * (B - T);
    [0, 10, 20, 30, 40, 50].forEach((v) => { el('line', { x1: L, x2: R, y1: Y(v), y2: Y(v), stroke: '#ece8df' }, s); txt(s, L - 10, Y(v) + 4, v + '%', { 'text-anchor': 'end', 'font-size': 12, fill: '#8a8578' }); });
    [2006, 2010, 2014, 2018, 2022, 2026].forEach((y) => txt(s, X(y), B + 22, y, { 'text-anchor': 'middle', 'font-size': 12, fill: '#8a8578' }));
    // Zen launch marker
    el('line', { x1: X(2017.15), x2: X(2017.15), y1: T, y2: B, stroke: '#b8892b', 'stroke-dasharray': '3 4' }, s);
    txt(s, X(2017.15) + 6, T + 14, 'Zen / EPYC launch, 2017', { 'font-size': 11.5, 'font-weight': 700, fill: '#b8892b' });
    const UNIT = [[2006.4, 25.9], [2018.5, 1.5], [2022.95, 17.6], [2023.95, 23.1], [2024.95, 25.1], [2025.95, 28.8], [2026.2, 33.2], [2026.45, 34.5]];
    const REV = [[2024.2, 33], [2025.2, 39.4], [2026.2, 46.2]];
    const path = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join(' ');
    // gap 2006 -> 2018 drawn dashed (two reported points, nothing in between)
    el('path', { d: path(UNIT.slice(0, 2)), fill: 'none', stroke: '#2463d6', 'stroke-width': 2, 'stroke-dasharray': '5 6', opacity: .6 }, s);
    el('path', { d: path(UNIT.slice(1, 3)), fill: 'none', stroke: '#2463d6', 'stroke-width': 2, 'stroke-dasharray': '5 6', opacity: .6 }, s);
    const u = el('path', { d: path(UNIT.slice(2)), fill: 'none', stroke: '#2463d6', 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, s);
    const r = el('path', { d: path(REV), fill: 'none', stroke: '#e01e2b', 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, s);
    UNIT.forEach(([t, v], i) => el('circle', { cx: X(t), cy: Y(v), r: 4.5, fill: i === 1 ? '#fff' : '#2463d6', stroke: '#2463d6', 'stroke-width': 2 }, s));
    REV.forEach(([t, v]) => el('circle', { cx: X(t), cy: Y(v), r: 4.5, fill: '#e01e2b' }, s));
    txt(s, X(2006.4) + 8, Y(25.9) - 10, '~26% (2006)', { 'font-size': 12, 'font-weight': 700, fill: '#2463d6' });
    txt(s, X(2018.5), Y(1.5) + 22, '1–2% (2018)', { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#111' });
    txt(s, X(2022.95) - 8, Y(17.6) + 4, '17.6%', { 'text-anchor': 'end', 'font-size': 12, 'font-weight': 700, fill: '#2463d6' });
    txt(s, X(2026.45) + 6, Y(34.5) + 16, '34.5%', { 'font-size': 12, 'font-weight': 700, fill: '#2463d6' });
    txt(s, X(2026.2) - 6, Y(46.2) - 10, '46.2% of revenue', { 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 800, fill: '#e01e2b' });
    s._anim = () => { drawOn(u, 1400); drawOn(r, 1200, 500); };
  })();

  /* ---------------- Xilinx deal bars ---------------- */
  (function swap() {
    const s = $('swapSvg'); if (!s) return;
    const base = 320, k = 4.4, w = 150;
    txt(s, 400, 30, 'Fixed ratio: 1.7234 AMD shares for each Xilinx share', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: '#111' });
    [[170, 35, '$35B', 'Announced · Oct 2020', '#b8892b'], [480, 49, '$49B', 'Closed · Feb 2022', '#e01e2b']].forEach(([x, v, cap, sub, c], i) => {
      const h = v * k;
      const b = el('rect', { class: 'grow', x, y: base - h, width: w, height: h, rx: 3, fill: c }, s); b.style.transitionDelay = (i * .35) + 's';
      txt(s, x + w / 2, base - h - 12, cap, { 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 800, fill: c });
      txt(s, x + w / 2, base + 24, sub, { 'text-anchor': 'middle', 'font-size': 12.5, fill: '#6d6a64' });
    });
    el('line', { x1: 140, x2: 660, y1: base, y2: base, stroke: '#111' }, s);
    const defs = el('defs', {}, s), m = el('marker', { id: 'amdArrow', markerWidth: 10, markerHeight: 10, refX: 7, refY: 3, orient: 'auto' }, defs);
    el('path', { d: 'M0 0 L7 3 L0 6 Z', fill: '#111' }, m);
    el('path', { d: `M330 ${base - 170} C390 ${base - 230} 420 ${base - 240} 470 ${base - 228}`, fill: 'none', stroke: '#111', 'stroke-width': 2, 'marker-end': 'url(#amdArrow)' }, s);
    txt(s, 400, base - 252, 'AMD shares up ~40%: +$14B, no extra cash', { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: '#111' });
  })();

  /* ---------------- reveal-on-scroll ---------------- */
  const rio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in-view');
    e.target.querySelectorAll('.ltrack i').forEach((b) => b.style.width = b.dataset.w + '%');
    const svg = e.target.querySelector('svg'); if (svg && svg._anim) svg._anim();
    rio.unobserve(e.target);
  }), { threshold: 0.2 });
  document.querySelectorAll('.rv, #qs').forEach((e) => rio.observe(e));

  /* ---------------- progress bar + TOC ---------------- */
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
})();
