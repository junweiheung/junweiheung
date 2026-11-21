/* Fed / bond-market explainer: reveal-on-scroll, progress bar, TOC, copy link, and the 2019–2024 cycle chart. */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* give each flow/split child an index so it can cascade in with a stagger */
document.querySelectorAll('.flow, .split').forEach((chain) => {
  [...chain.children].forEach((child, i) => child.style.setProperty('--i', i));
});

/* reveal on scroll (same pattern as the other explainers) */
const rio = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in-view');
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

/* ---------------- the cycle chart: Fed rate vs 10-year yield, 2019–2024 ---------------- */
(function () {
  const s = document.getElementById('cycleSvg'); if (!s) return;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const tx = (p, x, y, str, a = {}) => { const t = el('text', Object.assign({ x, y, 'font-family': 'Inter' }, a), p); t.textContent = str; return t; };
  // 10-year Treasury yield, monthly average of daily closes (US Treasury), Jan 2019 – Dec 2024
  const Y10 = [2.71,2.68,2.57,2.53,2.4,2.07,2.06,1.63,1.7,1.71,1.81,1.86, 1.76,1.5,0.87,0.66,0.67,0.73,0.62,0.65,0.68,0.79,0.87,0.93,
    1.08,1.26,1.61,1.64,1.62,1.52,1.32,1.28,1.37,1.58,1.56,1.46, 1.76,1.93,2.13,2.75,2.9,3.14,2.9,2.9,3.52,3.98,3.89,3.62,
    3.53,3.75,3.66,3.46,3.57,3.75,3.9,4.17,4.38,4.8,4.5,4.02, 4.06,4.21,4.21,4.54,4.48,4.31,4.25,3.87,3.72,4.1,4.36,4.39];
  // top of the Fed's target range at each month end (Fed rate decisions)
  const FED = [];
  const steps = [[0,2.5],[6,2.25],[8,2.0],[9,1.75],[14,0.25],[38,0.5],[40,1.0],[41,1.75],[42,2.5],[44,3.25],[46,4.0],[47,4.5],[49,4.75],[50,5.0],[52,5.25],[54,5.5],[68,5.0],[70,4.75],[71,4.5]];
  for (let i = 0, k = 0, v = steps[0][1]; i < Y10.length; i++) { while (k < steps.length && steps[k][0] <= i) v = steps[k++][1]; FED.push(v); }
  const CPI = [[16, 0.1, '0.1% (May 2020)'], [41, 9.1, '9.1% (Jun 2022)'], [53, 3.0, '3.0% (Jun 2023)']];
  const L = 46, R = 780, T = 18, B = 360, N = Y10.length, MAX = 10;
  const X = (i) => L + i / (N - 1) * (R - L), Yv = (v) => B - v / MAX * (B - T);
  // shaded phases
  [[14, 38, 'Afraid of a slump', '#e9f1e6'], [38, 54, 'Afraid of inflation', '#f6e7e2']].forEach(([a, b, l, c]) => {
    el('rect', { x: X(a), y: T, width: X(b) - X(a), height: B - T, fill: c }, s);
    tx(s, (X(a) + X(b)) / 2, T + 16, l, { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#5d5a55' });
  });
  for (let v = 0; v <= MAX; v += 2) { el('line', { x1: L, x2: R, y1: Yv(v), y2: Yv(v), stroke: '#e6e2d8' }, s); tx(s, L - 8, Yv(v) + 4, v + '%', { 'text-anchor': 'end', 'font-size': 11.5, fill: '#8a8578' }); }
  for (let y = 0; y < 6; y++) tx(s, X(y * 12 + 6), B + 22, 2019 + y, { 'text-anchor': 'middle', 'font-size': 12, fill: '#8a8578' });
  const path = (arr, step) => arr.map((v, i) => {
    if (!step) return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Yv(v).toFixed(1);
    return i ? `H${X(i).toFixed(1)} V${Yv(v).toFixed(1)}` : `M${X(0)} ${Yv(v)}`;
  }).join(' ');
  const fed = el('path', { d: path(FED, true), fill: 'none', stroke: '#111', 'stroke-width': 3 }, s);
  const y10 = el('path', { d: path(Y10), fill: 'none', stroke: '#b8892b', 'stroke-width': 3, 'stroke-linejoin': 'round' }, s);
  CPI.forEach(([i, v, l]) => {
    el('circle', { cx: X(i), cy: Yv(v), r: 6, fill: '#c2412d' }, s);
    const right = i < 30;
    tx(s, X(i) + (right ? 10 : -10), Yv(v) + (v < 1 ? -10 : 4), l, { 'text-anchor': right ? 'start' : 'end', 'font-size': 11.5, 'font-weight': 700, fill: '#c2412d' });
  });
  tx(s, X(54) + 6, Yv(5.5) - 8, 'Fed 5.5%', { 'font-size': 11.5, 'font-weight': 700, fill: '#111' });
  tx(s, X(57) + 4, Yv(4.8) - 10, '10-year 4.8%', { 'font-size': 11.5, 'font-weight': 700, fill: '#b8892b' });
  tx(s, X(29), Yv(0.25) - 8, 'Fed near zero', { 'font-size': 11.5, 'font-weight': 700, fill: '#111' });
  // draw the lines on when the chart scrolls in
  if (!reduced && fed.getTotalLength) {
    [fed, y10].forEach((p) => { const len = p.getTotalLength(); p.style.strokeDasharray = len; p.style.strokeDashoffset = len; });
    new IntersectionObserver((es, o) => es.forEach((e) => {
      if (!e.isIntersecting) return; o.disconnect();
      [fed, y10].forEach((p, k) => { p.style.transition = `stroke-dashoffset 1.8s ease ${k * .3}s`; requestAnimationFrame(() => { p.style.strokeDashoffset = 0; }); });
      setTimeout(() => [fed, y10].forEach((p) => { p.style.transition = 'none'; p.style.strokeDasharray = 'none'; }), 2600);
    }), { threshold: .3 }).observe(s);
  }
})();
