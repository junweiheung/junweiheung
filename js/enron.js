/* Enron explainer: reveal-on-scroll, progress bar, TOC, copy link, plus the graphics:
   one deal under mark-to-market vs ordinary accounting, and the Raptor doom loop. */

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const NARROW = matchMedia('(max-width: 560px)').matches;

document.querySelectorAll('.flow').forEach((chain) => {
  [...chain.children].forEach((child, i) => child.style.setProperty('--i', i));
});
const rio = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in-view');
  rio.unobserve(e.target);
}), { threshold: 0.15 });
document.querySelectorAll('.rv, #qs').forEach((e) => rio.observe(e));

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
const copyBtn = document.getElementById('copyLink');
if (copyBtn) copyBtn.addEventListener('click', async (e) => {
  try { await navigator.clipboard.writeText(location.href); e.target.textContent = 'Copied'; }
  catch (_) { e.target.textContent = 'Copy from address bar'; }
});

/* ---------------- shared helpers ---------------- */
const SVGNS = 'http://www.w3.org/2000/svg';
const mk = (t, a, p) => { const e = document.createElementNS(SVGNS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
const say = (p, x, y, str, a = {}) => { const t = mk('text', Object.assign({ x, y, 'font-family': 'Inter' }, a), p); t.textContent = str; return t; };
const ease = (p) => p * p * (3 - 2 * p);
const lerp = (a, b, p) => a + (b - a) * p;
const money = (v, d = 0) => (v < 0 ? '−$' : '$') + Math.abs(v).toFixed(d);
// segmented buttons: one pressed at a time, calls onChange(value)
function seg(id, onChange) {
  const box = document.getElementById(id); if (!box) return () => null;
  const btns = [...box.querySelectorAll('button')];
  btns.forEach((b) => b.addEventListener('click', () => {
    btns.forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    onChange(b.dataset.v);
  }));
  return () => (btns.find((b) => b.getAttribute('aria-pressed') === 'true') || btns[0]).dataset.v;
}
const RED = '#c2412d', GREEN = '#5f8a63', INK = '#1f1f22', MUTED = '#8a8578', RULE = '#e4dfd3';

/* ---------------- One deal, two ways of counting ---------------- */
(function () {
  const s = document.getElementById('mtmSvg'), r = document.getElementById('mtmReal'); if (!s || !r) return;
  const why = document.getElementById('mtmWhy'), rv = document.getElementById('mtmRealV');
  const fs = NARROW ? 1.6 : 1;
  if (NARROW) s.setAttribute('viewBox', '0 0 680 320');
  const A = 15, N = 10, L = NARROW ? 76 : 60, R = 660, T = 24, B = NARROW ? 262 : 232, LO = -20, HI = 160;
  const Y = (v) => T + (HI - v) / (HI - LO) * (B - T);
  const step = (R - L) / N, bw = step * 0.62;
  [0, 50, 100, 150].forEach((t) => {
    mk('line', { x1: L, x2: R, y1: Y(t), y2: Y(t), stroke: t ? RULE : '#b9b2a3', 'stroke-width': t ? 1 : 1.5 }, s);
    say(s, L - 8, Y(t) + 4, (t < 0 ? '−$' : '$') + Math.abs(t) + 'm', { 'text-anchor': 'end', 'font-size': 11 * fs, fill: MUTED });
  });
  const bars = [], labs = [], cash = [];
  for (let i = 0; i < N; i++) {
    const x = L + i * step + (step - bw) / 2;
    bars.push(mk('rect', { x, width: bw, y: Y(0), height: 0, class: 'gb' }, s));
    labs.push(say(s, x + bw / 2, 0, '', { 'text-anchor': 'middle', 'font-size': 11.5 * fs, 'font-weight': 800 }));
    cash.push(mk('circle', { cx: x + bw / 2, cy: Y(0), r: 4.5 * fs, fill: '#fff', stroke: INK, 'stroke-width': 2 }, s));
    say(s, x + bw / 2, B + 18 * fs, NARROW ? String(i + 1) : 'Yr ' + (i + 1), { 'text-anchor': 'middle', 'font-size': 11 * fs, fill: MUTED });
  }
  // legend
  const lg = mk('g', {}, s);
  mk('circle', { cx: R - 150 * fs, cy: T - 6, r: 4.5 * fs, fill: '#fff', stroke: INK, 'stroke-width': 2 }, lg);
  say(lg, R - 140 * fs, T - 2, 'cash actually received', { 'font-size': 11 * fs, fill: INK });
  let way = 'mtm';
  const fmt = (v) => (v < 0 ? '−$' : '$') + Math.abs(v) + 'm';
  function draw() {
    const real = +r.value; rv.textContent = '$' + real + 'm';
    const vals = [];
    for (let i = 0; i < N; i++) vals.push(way === 'acc' ? real : (i === 0 ? N * A + (real - A) : real - A));
    vals.forEach((v, i) => {
      const y1 = Y(Math.max(v, 0)), y2 = Y(Math.min(v, 0));
      bars[i].style.y = y1 + 'px'; bars[i].style.height = Math.max(v ? 1 : 0, y2 - y1) + 'px';
      bars[i].setAttribute('fill', v < 0 ? RED : '#2f5f9e');
      labs[i].setAttribute('y', v >= 0 ? y1 - 6 : y2 + 14 * fs);
      labs[i].setAttribute('fill', v < 0 ? RED : '#2f5f9e');
      labs[i].textContent = v === 0 ? '' : (NARROW && i > 0 ? (v < 0 ? '−' + Math.abs(v) : String(v)) : fmt(v));
      cash[i].setAttribute('cy', Y(real));
    });
    const total = N * real;
    let t;
    if (way === 'acc') t = `Each year shows the $${real}m the deal actually earns, matching the cash that comes in. Ten years add up to $${total}m.`;
    else if (real === 0) t = `The deal earns nothing, yet year 1 shows $${vals[0]}m of profit. Every later year shows a $${A}m loss as the forecast fails, and over ten years the total comes to zero. No cash ever arrives.`;
    else if (real === A) t = `The forecast is right, so year 1 shows the whole $${N * A}m and the next nine years show nothing, even though $${A}m of cash arrives each year. To report growth next year, Enron needs a bigger new deal.`;
    else t = `Year 1 shows $${vals[0]}m of profit, but only $${real}m of cash comes in. Every later year the deal earns $${A - real}m less than forecast, which shows up as a loss. Over ten years both methods total $${total}m; mark-to-market just shows it all at the start, and the disappointment later.`;
    why.textContent = t;
  }
  seg('mtmWay', (v) => { way = v; draw(); });
  r.addEventListener('input', draw);
  draw();
})();

/* ---------------- The Raptor doom loop ---------------- */
(function () {
  const s = document.getElementById('rapSvg'), r = document.getElementById('rapPrice'); if (!s || !r) return;
  const why = document.getElementById('rapWhy'), pv = document.getElementById('rapPriceV');
  const fs = NARROW ? 1.6 : 1;
  if (NARROW) s.setAttribute('viewBox', '0 0 680 250');
  const SHARES = 18, LOSS = 1100, MAX = 1700; // $m
  const L = NARROW ? 250 : 230, R = 640, W = (v) => v / MAX * (R - L), rowH = NARROW ? 76 : 60, top = 22, bh = NARROW ? 38 : 30;
  const rows = [['Losses being hidden', RED], ['Partnership’s Enron shares', '#2f5f9e']].map(([name, col], k) => {
    const y = top + k * rowH;
    say(s, L - 12, y + bh / 2 + 4.5 * fs, name, { 'text-anchor': 'end', 'font-size': 12.5 * fs, 'font-weight': 700, fill: INK });
    const bar = mk('rect', { x: L, y, height: bh, width: 0, fill: col, class: 'gb' }, s);
    const val = say(s, L, y + bh / 2 + 4.5 * fs, '', { 'font-size': 13 * fs, 'font-weight': 800, fill: INK });
    return { bar, val };
  });
  const status = say(s, L, top + 2 * rowH + 14 * fs, '', { 'font-size': 14 * fs, 'font-weight': 800 });
  const money = (v) => (v >= 1000 ? '$' + (v / 1000).toFixed(2).replace(/0$/, '') + 'bn' : '$' + Math.round(v) + 'm');
  function draw() {
    const p = +r.value; pv.textContent = '$' + p;
    const val = SHARES * p, vals = [LOSS, val];
    rows.forEach((o, k) => {
      const w = W(vals[k]);
      o.bar.style.width = w + 'px'; o.bar.setAttribute('width', w);
      const inside = w > 120 * fs;
      o.val.setAttribute('x', inside ? L + w - 8 : L + w + 8);
      o.val.setAttribute('text-anchor', inside ? 'end' : 'start');
      o.val.setAttribute('fill', inside ? '#fff' : INK);
      o.val.textContent = money(vals[k]);
    });
    const ok = val >= LOSS;
    status.textContent = ok ? 'Hedge holds' : `Hedge fails: ${money(LOSS - val)} back on Enron’s books`;
    status.setAttribute('fill', ok ? '#3f6a45' : RED);
    const be = Math.ceil(LOSS / SHARES);
    why.textContent = ok
      ? `At $${p} a share, the partnership's ${SHARES} million Enron shares are worth ${money(val)}, enough to "cover" the hidden losses. Below about $${be}, it can't.`
      : `At $${p} a share, the partnership's Enron shares are worth only ${money(val)}. It can't cover the ${money(LOSS)} of losses, so ${money(LOSS - val)} lands back in Enron's results. Investors who see that sell, the price falls further, and the hole grows: the doom loop.`;
  }
  r.addEventListener('input', draw);
  draw();
})();

/* ---------------- The timeline: Enron's share price, drawn up to the step being read ----------------
   Year-end closes 1995-1999 from Enron's 1999 annual report (adjusted for the 1999 split), the 23 Aug 2000
   peak close, the 2000 year-end close, and dated 2001 closes from Time's chronology, Reuters and the Oil & Gas
   Journal. Log scale. Steps before the first point show the chart greyed. */
(function () {
  const svg = document.getElementById('tlChart'); if (!svg) return;
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const say = (p, x, y, s, a = {}) => { const t = mk('text', Object.assign({ x, y, 'font-family': 'Inter' }, a), p); t.textContent = s; return t; };
  const NARROW = matchMedia('(max-width: 900px)').matches;
  const YE = (y, v) => ({ t: y + 0.999, v, d: 'end ' + y });
  const ENE = [[1995, 19.06], [1996, 21.56], [1997, 20.78], [1998, 28.53], [1999, 44.38]].map(([y, v]) => YE(y, v)).concat([
    { t: 2000.645, v: 90, d: '23 Aug 2000' }, YE(2000, 83.13),
    { t: 2001.137, v: 75.09, d: '20 Feb 2001' }, { t: 2001.619, v: 39.55, d: '14 Aug 2001' },
    { t: 2001.792, v: 33.84, d: '16 Oct 2001' }, { t: 2001.819, v: 15.40, d: '26 Oct 2001' },
    { t: 2001.830, v: 11.16, d: '30 Oct 2001' }, { t: 2001.904, v: 4.01, d: '26 Nov 2001' },
    { t: 2001.915, v: 0.26, d: '30 Nov 2001' }]);
  ENE.sort((a, b) => a.t - b.t);
  const COL = '#e8743b';
  const W = 600, H = NARROW ? 330 : 470, L = NARROW ? 62 : 48, R = W - 16, T = 18, B = H - (NARROW ? 34 : 28);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const t0 = 1995.9, t1 = 2002.05;
  // 2001, when most of the story happens, is stretched to just over half the width
  const SPLIT = 2001, SW = 0.45, XS = L + SW * (R - L);
  const X = (t) => (t <= SPLIT ? L + (t - t0) / (SPLIT - t0) * (XS - L) : XS + (t - SPLIT) / (t1 - SPLIT) * (R - XS));
  const lg = Math.log10, Y = (v) => B - (lg(v) - lg(0.1)) / (lg(200) - lg(0.1)) * (B - T);
  mk('rect', { x: XS, y: T, width: R - XS, height: B - T, fill: '#16161a' }, svg);
  say(svg, (XS + R) / 2, T + (NARROW ? 18 : 14), '2001, stretched', { 'text-anchor': 'middle', 'font-size': NARROW ? 16 : 11, fill: '#6f6c66', 'font-weight': 700 });
  [0.1, 0.3, 1, 3, 10, 30, 100].forEach((v) => {
    mk('line', { x1: L, x2: R, y1: Y(v), y2: Y(v), stroke: [0.1, 1, 10, 100].includes(v) ? '#2a2a30' : '#1d1d22' }, svg);
    say(svg, L - 6, Y(v) + 5, '$' + v, { 'text-anchor': 'end', 'font-size': NARROW ? 17 : 11, fill: '#8d8a84' });
  });
  (NARROW ? [[1996, '1996'], [1998, '1998'], [2001, '2001'], [2001.5, 'Jul'], [2002, '2002']] : [[1996, '1996'], [1998, '1998'], [2001, '2001'], [2001.25, 'Apr'], [2001.5, 'Jul'], [2001.75, 'Oct'], [2002, '2002']])
    .forEach(([y, s]) => say(svg, X(y), H - 6, s, { 'text-anchor': 'middle', 'font-size': NARROW ? 17 : 11, fill: '#8d8a84' }));
  // the $90 peak, marked faintly from the start
  mk('line', { x1: L, x2: R, y1: Y(90), y2: Y(90), stroke: COL, 'stroke-dasharray': '2 5', opacity: 0.35 }, svg);
  const line = (pts) => 'M' + pts.map((p) => X(p.t).toFixed(1) + ' ' + Y(p.v).toFixed(1)).join('L');
  mk('path', { d: line(ENE), fill: 'none', stroke: COL, 'stroke-width': 2, opacity: 0.16 }, svg);
  const defs = mk('defs', {}, svg), clip = mk('clipPath', { id: 'tlClip' }, defs);
  const clipR = mk('rect', { x: 0, y: 0, width: L, height: H }, clip);
  const g = mk('g', { 'clip-path': 'url(#tlClip)' }, svg);
  mk('path', { d: line(ENE), fill: 'none', stroke: COL, 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
  ENE.forEach((p) => mk('circle', { cx: X(p.t), cy: Y(p.v), r: 2.6, fill: COL }, g));
  const cur = mk('line', { y1: T, y2: B, stroke: '#f0b23a', 'stroke-width': 1.5, 'stroke-dasharray': '3 4' }, svg);
  const dot = mk('circle', { r: 6, fill: COL, stroke: '#0d0d0f', 'stroke-width': 2 }, svg);
  const pre = say(svg, (L + R) / 2, (T + B) / 2, 'Share prices on this chart start at the end of 1995', { 'text-anchor': 'middle', 'font-size': NARROW ? 17 : 14, 'font-weight': 700, fill: '#8d8a84' });
  const yearEl = document.getElementById('tlYear'), valsEl = document.getElementById('tlVals');
  const at = (t) => { let p = null; ENE.forEach((q) => { if (q.t <= t + 0.0005) p = q; }); return p; };
  const yOn = (t) => {
    for (let k = 0; k < ENE.length - 1; k++) {
      const p = ENE[k], q = ENE[k + 1];
      if (t >= p.t && t <= q.t) return Y(p.v) + (Y(q.v) - Y(p.v)) * (t - p.t) / (q.t - p.t);
    }
    return Y(ENE[ENE.length - 1].v);
  };
  function setTime(t, label) {
    yearEl.textContent = label;
    const before = t < ENE[0].t;
    pre.style.display = before ? '' : 'none';
    clipR.setAttribute('width', before ? 0 : Math.min(W, X(t) + 2));
    [cur, dot].forEach((e) => (e.style.display = before ? 'none' : ''));
    if (before) { valsEl.innerHTML = ''; return; }
    const tx = Math.min(t, ENE[ENE.length - 1].t);
    cur.setAttribute('x1', X(t)); cur.setAttribute('x2', X(t));
    dot.setAttribute('cx', X(tx)); dot.setAttribute('cy', yOn(tx));
    const p = at(t);
    const off = (1 - p.v / 90) * 100;
    valsEl.innerHTML = `<span class="ve">Enron <b>${p.v >= 1 ? '$' + p.v.toFixed(2) : Math.round(p.v * 100) + '¢'}</b> <small>${p.d}</small></span><span class="vw">last close${off > 1 ? ` · ${off > 99 ? off.toFixed(1) : Math.round(off)}% below the peak` : ''}</span>`;
  }
  const steps = [...document.querySelectorAll('.tl-step')];
  let curStep = -1;
  function activate(k) {
    if (k === curStep) return; curStep = k;
    steps.forEach((s, j) => s.classList.toggle('on', j === k));
    const s = steps[k];
    setTime(+s.dataset.y, s.querySelector('.tl-yr').textContent);
  }
  const obs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) activate(steps.indexOf(e.target)); }),
    { rootMargin: NARROW ? '-62% 0px -30% 0px' : '-45% 0px -50% 0px' });
  steps.forEach((s) => obs.observe(s));
  activate(0);
  const scrolly = document.getElementById('tlScrolly');
  new IntersectionObserver((es) => es.forEach((e) => document.body.classList.toggle('tl-wide', e.isIntersecting)), { rootMargin: '-20% 0px -20% 0px' }).observe(scrolly);
})();
