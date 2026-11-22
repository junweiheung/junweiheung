/* Japan's lost decades explainer: reveal-on-scroll, progress bar, TOC, copy link,
   the Nikkei 225 timeline chart, and the land-and-share feedback loop. */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* give each flow/loop child an index so it can cascade in with a stagger */
document.querySelectorAll('.flow, .loop-steps').forEach((chain) => {
  [...chain.children].forEach((child, i) => child.style.setProperty('--i', i));
});

/* reveal on scroll (same pattern as the other explainers) */
const rio = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in-view');
  e.target.querySelectorAll('.ltrack i[data-w]').forEach((b) => { b.style.width = b.dataset.w + '%'; });
  rio.unobserve(e.target);
}), { threshold: 0.15 });
document.querySelectorAll('.rv, #qs').forEach((e) => rio.observe(e));

/* progress bar + active TOC link */
const prog = document.getElementById('prog');
const tocLinks = [...document.querySelectorAll('#toc a')];
const secs = tocLinks.map((a) => document.querySelector(a.getAttribute('href')));
addEventListener('scroll', () => {
  const h = document.documentElement;
  if (prog) prog.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
  let cur = 0;
  secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.35) cur = i; });
  tocLinks.forEach((a, i) => a.classList.toggle('on', i === cur));
}, { passive: true });
tocLinks.forEach((a) => a.addEventListener('click', (e) => {
  e.preventDefault();
  document.querySelector(a.getAttribute('href')).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
}));

/* copy link */
const copyBtn = document.getElementById('copyLink');
if (copyBtn) copyBtn.addEventListener('click', async (e) => {
  try { await navigator.clipboard.writeText(location.href); e.target.textContent = 'Copied'; }
  catch (_) { e.target.textContent = 'Copy from address bar'; }
});

/* ---------------- Nikkei 225 timeline, 1985–1998 ---------------- */
(function () {
  const s = document.getElementById('nikkeiSvg'); if (!s) return;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const tx = (p, x, y, str, a = {}) => { const t = el('text', Object.assign({ x, y, 'font-family': 'Inter' }, a), p); t.textContent = str; return t; };
  // Nikkei 225, approximate year-end levels (index points). The 1989 point is the
  // 29 Dec 1989 all-time peak of 38,915; others are rounded year-end values.
  const PTS = [
    [1985, 13113, ''],
    [1986, 18701, 'Plaza Accord fallout: the Bank of Japan cuts rates to fight a strong yen.'],
    [1987, 21564, 'Survives the global October crash, feeding a belief that prices cannot fall.'],
    [1988, 30159, 'Tax-exempt postal savings are abolished, freeing ~\u00a5300 trillion for investment.'],
    [1989, 38915, 'The 29 December peak. A broker predicts 80,000 by 1995. New BoJ governor starts raising rates.'],
    [1990, 23849, 'Rates hit 6%. The bubble deflates gradually, not in a single crash.'],
    [1991, 22984, ''],
    [1992, 16925, 'Down ~60% from the peak. Tokyo property falls about as far over the next few years.'],
    [1993, 17417, ''],
    [1994, 19723, ''],
    [1995, 19868, 'Far below the 80,000 once predicted for this year.'],
    [1996, 19361, ''],
    [1997, 15259, 'Banking crisis: Hokkaido Takushoku, a major bank, fails under zombie loans.'],
    [1998, 13842, 'Rates near 0%. Japan slips into a deflationary spiral and a liquidity trap.']
  ];
  const whyEl = document.getElementById('nikkeiWhy');
  const narrow = (s.getBoundingClientRect().width || 680) < 520;
  const W = 680, H = 360, L = 52, R = 648, T = 24, B = 300, MAX = 40000;
  const X = (i) => L + i / (PTS.length - 1) * (R - L);
  const Yv = (v) => B - v / MAX * (B - T);
  // gridlines
  for (let v = 0; v <= MAX; v += 10000) {
    el('line', { x1: L, x2: R, y1: Yv(v), y2: Yv(v), stroke: '#ece8df' }, s);
    tx(s, L - 8, Yv(v) + 4, (v / 1000) + 'k', { 'text-anchor': 'end', 'font-size': 11, fill: '#8a8578' });
  }
  // year ticks (every other year if narrow)
  PTS.forEach(([yr], i) => {
    if (narrow && i % 2) return;
    tx(s, X(i), B + 20, "'" + String(yr).slice(2), { 'text-anchor': 'middle', 'font-size': 11, fill: '#8a8578' });
  });
  // rise/fall shading split at the 1989 peak (index 4)
  el('rect', { x: X(0), y: T, width: X(4) - X(0), height: B - T, fill: '#e9f1e6' }, s);
  el('rect', { x: X(4), y: T, width: R - X(4), height: B - T, fill: '#f6e7e2' }, s);
  tx(s, (X(0) + X(4)) / 2, T + 14, 'The bubble inflates', { 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 700, fill: '#5d7a5d' });
  tx(s, (X(4) + R) / 2, T + 14, 'The lost decades begin', { 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 700, fill: '#a1553f' });
  // the line
  const d = PTS.map(([, v], i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Yv(v).toFixed(1)).join(' ');
  const line = el('path', { d, fill: 'none', stroke: '#111', 'stroke-width': 3, 'stroke-linejoin': 'round' }, s);
  // peak marker
  el('circle', { cx: X(4), cy: Yv(38915), r: 6, fill: '#c2412d' }, s);
  tx(s, X(4), Yv(38915) - 12, '38,915', { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 800, fill: '#c2412d' });
  // interactive dots: hover/tap to read what happened
  PTS.forEach(([yr, v, why], i) => {
    const dot = el('circle', { cx: X(i), cy: Yv(v), r: 11, fill: 'transparent', style: 'cursor:pointer' }, s);
    const vis = el('circle', { cx: X(i), cy: Yv(v), r: 3.5, fill: i === 4 ? '#c2412d' : '#111' }, s);
    const show = () => {
      [...s.querySelectorAll('circle[data-vis]')].forEach((c) => c.setAttribute('r', c.getAttribute('data-r')));
      vis.setAttribute('r', 6);
      if (whyEl) whyEl.textContent = why ? yr + ': ' + why : yr + ': Nikkei around ' + v.toLocaleString() + '.';
    };
    vis.setAttribute('data-vis', '1'); vis.setAttribute('data-r', i === 4 ? 6 : 3.5);
    dot.addEventListener('mouseenter', show);
    dot.addEventListener('click', show);
  });
  // reveal the line by drawing it on scroll
  if (!reduced && line.getTotalLength) {
    const len = line.getTotalLength();
    line.style.strokeDasharray = len; line.style.strokeDashoffset = len;
    new IntersectionObserver((es, o) => es.forEach((e) => {
      if (!e.isIntersecting) return; o.disconnect();
      line.style.transition = 'stroke-dashoffset 2s ease';
      requestAnimationFrame(() => { line.style.strokeDashoffset = 0; });
      setTimeout(() => { line.style.transition = 'none'; line.style.strokeDasharray = 'none'; }, 2200);
    }), { threshold: .3 }).observe(s);
  }
  if (whyEl) whyEl.textContent = 'Hover or tap a point to see what happened that year.';
})();

/* ---------------- the land-and-share feedback loop ---------------- */
(function () {
  const s = document.getElementById('loopSvg'); if (!s) return;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const W = 560, H = 560, cx = 280, cy = 280, rad = 185;
  const NODES = [
    { t: ['Land prices', 'rise'], a: -90 },
    { t: ['Companies look', 'cheap vs. their', 'land holdings'], a: -18 },
    { t: ['Share prices', 'rise'], a: 54 },
    { t: ["Banks' cross-held", 'shares gain value;', 'capital swells'], a: 126 },
    { t: ['Banks lend more', 'against land', 'and shares'], a: 198 }
  ];
  const pos = (a, r = rad) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
  // curved arrows between consecutive nodes (clockwise)
  for (let i = 0; i < NODES.length; i++) {
    const a0 = NODES[i].a + 20, a1 = NODES[(i + 1) % NODES.length].a - 20;
    const [x0, y0] = pos(a0), [x1, y1] = pos(a1);
    const sweep = 1;
    const p = el('path', { d: `M${x0.toFixed(1)} ${y0.toFixed(1)} A${rad} ${rad} 0 0 ${sweep} ${x1.toFixed(1)} ${y1.toFixed(1)}`, fill: 'none', stroke: '#c2412d', 'stroke-width': 2.5, 'marker-end': 'url(#loopArrow)', class: 'loop-arrow', style: `--i:${i}` }, s);
  }
  // arrowhead marker
  const defs = el('defs', {}, s);
  const mk = el('marker', { id: 'loopArrow', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
  el('path', { d: 'M0 0 L10 5 L0 10 z', fill: '#c2412d' }, mk);
  // nodes
  NODES.forEach((n, i) => {
    const [x, y] = pos(n.a);
    const g = el('g', { class: 'loop-node', style: `--i:${i}` }, s);
    el('circle', { cx: x, cy: y, r: 62, fill: '#0d0d0f' }, g);
    el('circle', { cx: x, cy: y, r: 62, fill: 'none', stroke: '#c2412d', 'stroke-width': 2 }, g);
    n.t.forEach((line, k) => {
      const t = el('text', { x, y: y - (n.t.length - 1) * 7 + k * 14, 'text-anchor': 'middle', 'font-family': 'Inter', 'font-size': 11.5, 'font-weight': 600, fill: '#fff' }, g);
      t.textContent = line;
    });
  });
  // centre label
  const cg = el('g', {}, s);
  const c1 = el('text', { x: cx, y: cy - 6, 'text-anchor': 'middle', 'font-family': 'Source Serif 4, serif', 'font-size': 18, 'font-weight': 700, fill: '#c2412d' }, cg);
  c1.textContent = 'The bubble';
  const c2 = el('text', { x: cx, y: cy + 16, 'text-anchor': 'middle', 'font-family': 'Source Serif 4, serif', 'font-size': 18, 'font-weight': 700, fill: '#c2412d' }, cg);
  c2.textContent = 'feeds itself';
})();
