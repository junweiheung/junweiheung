/* Bond-pricing explainer: reveal-on-scroll, progress bar, TOC, copy link, plus eight calculators:
   cash flows, zero-coupon yield, coupon pricing, pull to par, selling early, forward rates, credit risk, duration. */

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

/* ---------------- shared bond maths ---------------- */
// price of a $100 bond: annual coupon rate c% and yield y% (both annual, compounded f times a year), n years left
function bondPrice(c, y, n, f = 2) {
  const C = c / f, r = y / 100 / f, N = Math.round(n * f);
  if (N <= 0) return 100;
  const ann = Math.abs(r) < 1e-12 ? C * N : C * (1 - Math.pow(1 + r, -N)) / r;
  return ann + 100 / Math.pow(1 + r, N);
}
// modified duration in years
function modDur(c, y, n, f = 2) {
  const C = c / f, r = y / 100 / f, N = Math.round(n * f), P = bondPrice(c, y, n, f);
  let mac = 0;
  for (let k = 1; k <= N; k++) mac += (k / f) * (C + (k === N ? 100 : 0)) / Math.pow(1 + r, k);
  return mac / P / (1 + r);
}
const pc = (v, d = 2) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(d) + '%';
const usd = (v) => (v < 0 ? '−$' : '$') + Math.abs(v).toFixed(2);
const FS = NARROW ? 1.6 : 1;
function axisY(s, L, R, Y, ticks, fmt) {
  ticks.forEach((t) => {
    mk('line', { x1: L, x2: R, y1: Y(t), y2: Y(t), stroke: RULE }, s);
    say(s, L - 8, Y(t) + 4, fmt(t), { 'text-anchor': 'end', 'font-size': 11 * FS, fill: MUTED });
  });
}
function bind(ids, fn) { ids.forEach((id) => { const e = document.getElementById(id); if (e) e.addEventListener('input', fn); }); }
const val = (id) => +document.getElementById(id).value;
const setT = (id, t) => { const e = document.getElementById(id); if (e) e.textContent = t; };

/* ---------------- 1. the cash a bond promises ---------------- */
(function () {
  const s = document.getElementById('cfSvg'); if (!s) return;
  if (NARROW) s.setAttribute('viewBox', '0 0 680 300');
  let f = 2;
  const g = mk('g', {}, s);
  function draw() {
    const c = val('cfRate'), n = val('cfYears'), N = n * f, C = c / f;
    setT('cfRateV', c + '%'); setT('cfYearsV', String(n));
    g.innerHTML = '';
    const L = 40, R = 660, Z = NARROW ? 150 : 130, K = NARROW ? 1.15 : 1.05;
    mk('line', { x1: L - 10, x2: R, y1: Z, y2: Z, stroke: '#b9b2a3', 'stroke-width': 1.5 }, g);
    const step = (R - L - 20) / N, bw = Math.max(3, Math.min(26, step * 0.6));
    const X = (k) => L + 10 + k * step;
    // purchase
    mk('rect', { x: X(0) - bw / 2, y: Z, width: bw, height: 100 * K * 0.9, fill: RED }, g);
    say(g, X(0) + bw / 2 + 6, Z + 90 * K * 0.9, '−$100 to buy', { 'font-size': 12 * FS, 'font-weight': 700, fill: RED });
    for (let k = 1; k <= N; k++) {
      const amt = C + (k === N ? 100 : 0), h = Math.max(2, amt * K * 0.9);
      mk('rect', { x: X(k) - bw / 2, y: Z - h, width: bw, height: h, fill: k === N ? '#2f5f9e' : GREEN }, g);
    }
    say(g, X(N), Z - (C + 100) * K * 0.9 - 8, '$' + (C + 100).toFixed(2), { 'text-anchor': 'end', 'font-size': 12 * FS, 'font-weight': 800, fill: '#2f5f9e' });
    if (C > 0) say(g, X(1), Z - C * K * 0.9 - 8, '$' + C.toFixed(2), { 'text-anchor': 'start', 'font-size': 12 * FS, 'font-weight': 800, fill: '#3f6a45' });
    [0, N].forEach((k) => say(g, X(k), Z + 16 * FS, k === 0 ? 'today' : 'year ' + n, { 'text-anchor': k ? 'end' : 'middle', 'font-size': 11 * FS, fill: MUTED }));
    const tot = C * N + 100;
    document.getElementById('cfWhy').textContent = c === 0
      ? `With no coupon, the only payment is the $100 at the end. At a price of $100 that earns nothing, which is why zero-coupon bonds sell below face value (Part 2).`
      : `You pay $100 today. You receive ${N} coupon${N > 1 ? 's' : ''} of $${C.toFixed(2)}, ${f === 2 ? 'every six months' : 'once a year'}, and $100 back with the last one: $${tot.toFixed(2)} in all.`;
  }
  seg('cfFreq', (v) => { f = +v; draw(); });
  bind(['cfRate', 'cfYears'], draw); draw();
})();

/* ---------------- 2. zero-coupon: from price to yield ---------------- */
(function () {
  const s = document.getElementById('zcSvg'); if (!s) return;
  if (NARROW) s.setAttribute('viewBox', '0 0 680 270');
  const L = NARROW ? 70 : 56, R = 660, T = 46, B = NARROW ? 232 : 196;
  const Y = (v) => B - (v - 40) / 60 * (B - T);
  axisY(s, L, R, Y, [40, 60, 80, 100], (t) => '$' + t);
  const big = say(s, L, 26 * FS, '', { 'font-size': 18 * FS, 'font-weight': 800, fill: '#2f5f9e' });
  const path = mk('path', { fill: 'none', stroke: '#2f5f9e', 'stroke-width': 3 }, s);
  const d0 = mk('circle', { r: 6, fill: INK }, s), d1 = mk('circle', { r: 6, fill: '#2f5f9e' }, s);
  const xl = mk('g', {}, s);
  function draw() {
    const p = val('zcPrice'), n = val('zcYears'), y = Math.pow(100 / p, 1 / n) - 1;
    setT('zcPriceV', usd(p)); setT('zcYearsV', String(n));
    const X = (t) => L + t / n * (R - L);
    const pts = []; for (let i = 0; i <= 60; i++) { const t = n * i / 60; pts.push(X(t) + ' ' + Y(p * Math.pow(1 + y, t))); }
    path.setAttribute('d', 'M' + pts.join(' L'));
    d0.setAttribute('cx', X(0)); d0.setAttribute('cy', Y(p)); d1.setAttribute('cx', X(n)); d1.setAttribute('cy', Y(100));
    xl.innerHTML = '';
    say(xl, X(0), B + 18 * FS, 'today', { 'font-size': 11 * FS, fill: MUTED });
    say(xl, X(n), B + 18 * FS, 'year ' + n, { 'text-anchor': 'end', 'font-size': 11 * FS, fill: MUTED });
    big.textContent = 'Yield to maturity: ' + pc(y * 100);
    document.getElementById('zcWhy').textContent = p >= 100
      ? 'Pay the full $100 for $100 later and you earn nothing: a yield of zero.'
      : `Paying ${usd(p)} for $100 in ${n} year${n > 1 ? 's' : ''} works out at ${pc(y * 100)} a year: (100 ÷ ${p}) to the power 1/${n}, minus 1. A lower price, or a shorter wait, means a higher yield.`;
  }
  bind(['zcPrice', 'zcYears'], draw); draw();
})();

/* ---------------- 3. coupon bond: premium, par or discount ---------------- */
(function () {
  const s = document.getElementById('cpSvg'); if (!s) return;
  if (NARROW) s.setAttribute('viewBox', '0 0 680 320');
  const L = NARROW ? 74 : 58, R = 660, T = 40, B = NARROW ? 278 : 242, X = (y) => L + (y - 0.5) / 11.5 * (R - L);
  const grid = mk('g', {}, s), path = mk('path', { fill: 'none', stroke: '#2f5f9e', 'stroke-width': 3 }, s);
  const parL = mk('line', { x1: L, x2: R, stroke: INK, 'stroke-dasharray': '5 4' }, s);
  const parT = say(s, R - 4, 0, 'par $100', { 'text-anchor': 'end', 'font-size': 11 * FS, 'font-weight': 700, fill: INK });
  const dot = mk('circle', { r: 7, fill: INK, stroke: '#fff', 'stroke-width': 2 }, s);
  const badge = say(s, L, 24 * FS, '', { 'font-size': 17 * FS, 'font-weight': 800 });
  [1, 3, 5, 7, 9, 11].forEach((y) => say(s, X(y), B + 18 * FS, y + '%', { 'text-anchor': 'middle', 'font-size': 11 * FS, fill: MUTED }));
  say(s, (L + R) / 2, B + 36 * FS, 'market yield →', { 'text-anchor': 'middle', 'font-size': 11 * FS, fill: MUTED });
  if (NARROW) s.setAttribute('viewBox', '0 0 680 340');
  function draw() {
    const c = val('cpCoupon'), y = val('cpYtm'), n = val('cpYears');
    setT('cpCouponV', c + '%'); setT('cpYtmV', y + '%'); setT('cpYearsV', String(n));
    const ys = []; for (let v = 0.5; v <= 12.001; v += 0.125) ys.push([v, bondPrice(c, v, n)]);
    const hi = Math.max(110, ...ys.map((q) => q[1])), lo = Math.min(90, ...ys.map((q) => q[1]));
    const top = Math.ceil(hi / 20) * 20, bot = Math.max(0, Math.floor(lo / 20) * 20);
    const Y = (v) => B - (v - bot) / (top - bot) * (B - T);
    grid.innerHTML = '';
    const tk = []; for (let v = bot; v <= top; v += (top - bot > 120 ? 40 : 20)) tk.push(v);
    axisY(grid, L, R, Y, tk, (t) => '$' + t);
    path.setAttribute('d', 'M' + ys.map(([v, p]) => X(v) + ' ' + Y(p)).join(' L'));
    parL.setAttribute('y1', Y(100)); parL.setAttribute('y2', Y(100)); parT.setAttribute('y', Y(100) - 6);
    const p = bondPrice(c, y, n);
    dot.setAttribute('cx', X(y)); dot.setAttribute('cy', Y(p));
    const kind = Math.abs(p - 100) < 0.005 ? 'Par' : p > 100 ? 'Premium' : 'Discount';
    badge.textContent = `${kind}: ${usd(p)}`;
    badge.setAttribute('fill', kind === 'Premium' ? '#3f6a45' : kind === 'Discount' ? RED : INK);
    document.getElementById('cpWhy').textContent = kind === 'Par'
      ? `The coupon equals the market yield, so the bond is worth exactly its face value, $100.`
      : kind === 'Premium'
        ? `The ${c}% coupon pays more than the ${y}% the market demands, so buyers pay extra for it: ${usd(p)}. That premium is gradually given back as the price is pulled to $100 by maturity.`
        : `The ${c}% coupon pays less than the ${y}% the market demands, so the bond must sell below face value, at ${usd(p)}. The buyer makes up the difference as the price rises to $100 at maturity.`;
  }
  bind(['cpCoupon', 'cpYtm', 'cpYears'], draw); draw();
})();

/* ---------------- 4. pull to par ---------------- */
(function () {
  const s = document.getElementById('ptpSvg'); if (!s) return;
  if (NARROW) s.setAttribute('viewBox', '0 0 680 320');
  const L = NARROW ? 74 : 58, R = NARROW ? 600 : 590, T = 20, B = NARROW ? 270 : 240;
  const X = (t) => L + t / 10 * (R - L), Y = (v) => B - (v - 70) / 60 * (B - T);
  axisY(s, L, R, Y, [70, 80, 90, 100, 110, 120, 130], (t) => '$' + t);
  [0, 2, 4, 6, 8, 10].forEach((t) => say(s, X(t), B + 18 * FS, t ? 'yr ' + t : 'now', { 'text-anchor': 'middle', 'font-size': 11 * FS, fill: MUTED }));
  const BONDS = [[8, '#3f6a45', '8% coupon'], [5, INK, '5% coupon'], [2, RED, '2% coupon']];
  const dots = BONDS.map(([c, col, name]) => {
    const pts = []; for (let t = 0; t <= 10.001; t += 0.5) pts.push(X(t) + ' ' + Y(bondPrice(c, 5, 10 - t)));
    mk('path', { d: 'M' + pts.join(' L'), fill: 'none', stroke: col, 'stroke-width': 2.6 }, s);
    say(s, R + 8, Y(bondPrice(c, 5, 10)) + 4, NARROW ? c + '%' : name, { 'font-size': 11 * FS, 'font-weight': 700, fill: col });
    return { c, d: mk('circle', { r: 6, fill: col, stroke: '#fff', 'stroke-width': 2 }, s) };
  });
  const cur = mk('line', { y1: T, y2: B, stroke: MUTED, 'stroke-dasharray': '3 4' }, s);
  function draw() {
    const t = val('ptpT'); setT('ptpTV', String(t));
    cur.setAttribute('x1', X(t)); cur.setAttribute('x2', X(t));
    const ps = dots.map((o) => { const p = bondPrice(o.c, 5, 10 - t); o.d.setAttribute('cx', X(t)); o.d.setAttribute('cy', Y(p)); return p; });
    document.getElementById('ptpWhy').textContent = t >= 10
      ? 'Maturity: all three are worth exactly $100, the face value about to be repaid.'
      : `With ${10 - t} year${10 - t === 1 ? '' : 's'} to go: the 8% bond is at ${usd(ps[0])}, the 5% bond at ${usd(ps[1])} and the 2% bond at ${usd(ps[2])}. The gap to $100 shrinks as maturity nears.`;
  }
  bind(['ptpT'], draw); draw();
})();

/* ---------------- 5. selling before maturity ---------------- */
(function () {
  const s = document.getElementById('hprSvg'); if (!s) return;
  if (NARROW) s.setAttribute('viewBox', '0 0 680 240');
  const L = NARROW ? 230 : 200, R = 640, rowH = NARROW ? 52 : 44, bh = NARROW ? 30 : 24, MAX = 160;
  const W = (v) => Math.max(0, v) / MAX * (R - L);
  const rows = [['Paid', RED], ['Coupons received', GREEN], ['Sale price', '#2f5f9e']].map(([n, col], k) => {
    const y = 10 + k * rowH;
    say(s, L - 10, y + bh / 2 + 4.5 * FS, n, { 'text-anchor': 'end', 'font-size': 12.5 * FS, 'font-weight': 700, fill: INK });
    return { bar: mk('rect', { x: L, y, height: bh, width: 0, fill: col, class: 'gb' }, s), t: say(s, L, y + bh / 2 + 4.5 * FS, '', { 'font-size': 13 * FS, 'font-weight': 800, fill: INK }) };
  });
  const res = say(s, L, 10 + 3 * rowH + 18 * FS, '', { 'font-size': 15 * FS, 'font-weight': 800 });
  function irr(h, S) {
    const N = Math.round(h * 2), C = 2.5;
    const npv = (r) => { let v = -100; for (let k = 1; k <= N; k++) v += C / Math.pow(1 + r, k); return v + S / Math.pow(1 + r, N); };
    let lo = -0.5, hi = 0.5;
    for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (npv(m) > 0) lo = m; else hi = m; }
    return (lo + hi) / 2 * 2 * 100; // annual rate, compounded twice a year
  }
  function draw() {
    const h = val('hprHold'), y = val('hprNew');
    setT('hprHoldV', String(h)); setT('hprNewV', y + '%');
    const S = bondPrice(5, y, 10 - h), coup = 2.5 * Math.round(h * 2), r = irr(h, S);
    [100, coup, S].forEach((v, k) => { rows[k].bar.setAttribute('width', W(v)); rows[k].t.setAttribute('x', L + W(v) + 8); rows[k].t.textContent = usd(v); });
    res.textContent = `Annual return: ${pc(r)}`;
    res.setAttribute('fill', r > 5.005 ? '#3f6a45' : r < 4.995 ? RED : INK);
    document.getElementById('hprWhy').textContent = Math.abs(y - 5) < 0.001
      ? `Yields haven't changed, so the bond still sells for $100 and your return is the 5% you bought at.`
      : y > 5
        ? `Yields have risen to ${y}%, so the bond sells for only ${usd(S)}. Your return falls to ${pc(r)}${r < 0 ? ': a loss, on a bond that never missed a payment' : ''}. The shorter you held it, the harder the hit.`
        : `Yields have fallen to ${y}%, so the bond sells for ${usd(S)}, a capital gain. Your return rises to ${pc(r)}.`;
  }
  bind(['hprHold', 'hprNew'], draw); draw();
})();

/* ---------------- 6. forward rate: roll or lock in ---------------- */
(function () {
  const s = document.getElementById('fwdSvg'); if (!s) return;
  if (NARROW) s.setAttribute('viewBox', '0 0 680 250');
  const xs = [70, 330, 590], rows = [60, 160];
  const lab = [], box = [];
  ['Lock in two years', 'Roll one-year bonds'].forEach((n, k) => {
    say(s, 14, rows[k] - 30, n, { 'font-size': 12.5 * FS, 'font-weight': 800, fill: k ? '#b06a1d' : '#2f5f9e' });
    mk('line', { x1: xs[0], x2: xs[2], y1: rows[k], y2: rows[k], stroke: k ? '#b06a1d' : '#2f5f9e', 'stroke-width': 2 }, s);
    xs.forEach((x, i) => {
      box.push(mk('circle', { cx: x, cy: rows[k], r: 8, fill: k ? '#b06a1d' : '#2f5f9e' }, s));
      lab.push(say(s, x, rows[k] + 26 * FS, '', { 'text-anchor': i === 0 ? 'start' : i === 2 ? 'end' : 'middle', 'font-size': 13 * FS, 'font-weight': 800, fill: INK }));
    });
  });
  const rate = [say(s, (xs[0] + xs[1]) / 2, rows[0] - 8, '', { 'text-anchor': 'middle', 'font-size': 11.5 * FS, fill: MUTED }), say(s, (xs[1] + xs[2]) / 2, rows[0] - 8, '', { 'text-anchor': 'middle', 'font-size': 11.5 * FS, fill: MUTED }),
    say(s, (xs[0] + xs[1]) / 2, rows[1] - 8, '', { 'text-anchor': 'middle', 'font-size': 11.5 * FS, fill: MUTED }), say(s, (xs[1] + xs[2]) / 2, rows[1] - 8, '', { 'text-anchor': 'middle', 'font-size': 11.5 * FS, fill: '#b06a1d', 'font-weight': 800 })];
  function draw() {
    const r1 = val('fwdR1') / 100, y2 = val('fwdY2') / 100, f = Math.pow(1 + y2, 2) / (1 + r1) - 1;
    setT('fwdR1V', (r1 * 100) + '%'); setT('fwdY2V', (y2 * 100) + '%');
    const a1 = 100 * (1 + y2), a2 = 100 * Math.pow(1 + y2, 2), b1 = 100 * (1 + r1);
    [['$100', usd(a1), usd(a2)], ['$100', usd(b1), usd(b1 * (1 + f))]].forEach((v, k) => v.forEach((t, i) => (lab[k * 3 + i].textContent = t)));
    rate[0].textContent = `${pc(y2 * 100)} a year`; rate[1].textContent = `${pc(y2 * 100)} a year`;
    rate[2].textContent = `${pc(r1 * 100)} now`; rate[3].textContent = `f = ${pc(f * 100)} next year`;
    document.getElementById('fwdWhy').textContent = `For rolling to match locking in, next year's one-year rate would have to be ${pc(f * 100)}: (1 + ${pc(y2 * 100, 2)})² ÷ (1 + ${pc(r1 * 100, 2)}) − 1. ` +
      (f > r1 + 1e-9 ? 'The curve slopes up, so the forward rate is above today’s one-year rate.' : f < r1 - 1e-9 ? 'The curve is inverted, so the forward rate is below today’s one-year rate: the market is pricing in falling rates.' : 'The curve is flat, so the forward rate equals today’s rate.') +
      ' If next year’s actual rate beats it, rolling wins; if not, locking in does.';
  }
  bind(['fwdR1', 'fwdY2'], draw); draw();
})();

/* ---------------- 7. credit risk: promised versus expected ---------------- */
(function () {
  const s = document.getElementById('crSvg'); if (!s) return;
  if (NARROW) s.setAttribute('viewBox', '0 0 680 240');
  const TSY = 4, L = NARROW ? 270 : 230, R = 640, rowH = NARROW ? 52 : 44, bh = NARROW ? 30 : 24;
  const rows = [['Promised yield', '#2f5f9e'], ['Expected return', '#b06a1d'], ['Treasury', '#8a8578']].map(([n, col], k) => {
    const y = 10 + k * rowH;
    say(s, L - 10, y + bh / 2 + 4.5 * FS, n, { 'text-anchor': 'end', 'font-size': 12.5 * FS, 'font-weight': 700, fill: INK });
    return { col, bar: mk('rect', { y, height: bh, fill: col, class: 'gb' }, s), t: say(s, L, y + bh / 2 + 4.5 * FS, '', { 'font-size': 13 * FS, 'font-weight': 800, fill: INK }) };
  });
  const zero = mk('line', { y1: 4, y2: 10 + 3 * rowH - 16, stroke: '#b9b2a3', 'stroke-width': 1.5 }, s);
  const sp = say(s, L, 10 + 3 * rowH + 10 * FS, '', { 'font-size': 13 * FS, 'font-weight': 700, fill: MUTED });
  function draw() {
    const y = val('crY'), pd = val('crPd') / 100, rec = val('crRec');
    setT('crYV', y + '%'); setT('crPdV', val('crPd') + '%'); setT('crRecV', String(rec));
    const price = 100 / (1 + y / 100), ecf = (1 - pd) * 100 + pd * rec, e = (ecf / price - 1) * 100;
    const lo = Math.min(0, e), hi = Math.max(y, TSY, 1), Z = L + (0 - lo) / (hi - lo) * (R - 60 - L), K = (R - 60 - L) / (hi - lo);
    zero.setAttribute('x1', Z); zero.setAttribute('x2', Z);
    [y, e, TSY].forEach((v, k) => {
      const o = rows[k], x = v >= 0 ? Z : Z + v * K, w = Math.abs(v) * K;
      o.bar.setAttribute('x', x); o.bar.setAttribute('width', Math.max(1, w));
      o.bar.setAttribute('fill', v < 0 ? RED : o.col);
      o.t.setAttribute('x', v >= 0 ? Z + w + 8 : Z + 8); o.t.textContent = pc(v);
    });
    sp.textContent = `Credit spread: ${(y - TSY).toFixed(1)} points over Treasuries`;
    document.getElementById('crWhy').textContent = `You pay ${usd(price)} for a promised $100. Allowing for a ${val('crPd')}% chance of default with ${rec} cents recovered, you should expect $${ecf.toFixed(2)}: an expected return of ${pc(e)}. ` +
      (e > TSY + 0.005 ? `That beats the Treasury: the spread more than pays for the expected losses, leaving a reward for bearing the risk.` : e < TSY - 0.005 ? `That is less than the safe Treasury: at these odds the spread doesn't cover the expected losses.` : `That just matches the Treasury: the spread only covers expected losses.`);
  }
  bind(['crY', 'crPd', 'crRec'], draw); draw();
})();

/* ---------------- 8. duration ---------------- */
(function () {
  const s = document.getElementById('durSvg'); if (!s) return;
  if (NARROW) s.setAttribute('viewBox', '0 0 680 270');
  const BONDS = [[6, 2, '2-yr, 6% coupon'], [4, 10, '10-yr, 4% coupon'], [0, 30, '30-yr zero-coupon']].map(([c, n, name]) => ({ c, n, name, D: modDur(c, 4, n) }));
  const L = NARROW ? 290 : 250, R = 640, rowH = NARROW ? 62 : 54, bh = NARROW ? 30 : 24, top = 14;
  const rows = BONDS.map((b, k) => {
    const y = top + k * rowH;
    say(s, L - 10, y + bh / 2 - 2, b.name, { 'text-anchor': 'end', 'font-size': 12.5 * FS, 'font-weight': 700, fill: INK });
    say(s, L - 10, y + bh / 2 + 14 * FS, 'duration ' + b.D.toFixed(1), { 'text-anchor': 'end', 'font-size': 11 * FS, fill: MUTED });
    return { bar: mk('rect', { y, height: bh, class: 'gb' }, s), est: mk('line', { y1: y - 4, y2: y + bh + 4, stroke: INK, 'stroke-width': 2.5 }, s), t: say(s, 0, y + bh / 2 + 4.5 * FS, '', { 'font-size': 13 * FS, 'font-weight': 800, fill: INK }) };
  });
  const zero = mk('line', { y1: 4, y2: top + 3 * rowH - 18, stroke: '#b9b2a3', 'stroke-width': 1.5 }, s);
  function draw() {
    const dy = val('durDy');
    setT('durDyV', (dy > 0 ? '+' : dy < 0 ? '−' : '') + Math.abs(dy).toFixed(2));
    const ex = BONDS.map((b) => (bondPrice(b.c, 4 + dy, b.n) / bondPrice(b.c, 4, b.n) - 1) * 100);
    const es = BONDS.map((b) => -b.D * dy);
    const m = Math.max(5, ...ex.map(Math.abs), ...es.map(Math.abs)) * 1.05;
    const Z = (L + R) / 2, K = (R - L) / 2 / m;
    zero.setAttribute('x1', Z); zero.setAttribute('x2', Z);
    rows.forEach((o, k) => {
      const v = ex[k], w = Math.abs(v) * K;
      o.bar.setAttribute('x', v >= 0 ? Z : Z - w); o.bar.setAttribute('width', Math.max(1, w));
      o.bar.setAttribute('fill', v >= 0 ? GREEN : RED);
      o.est.setAttribute('x1', Z + es[k] * K); o.est.setAttribute('x2', Z + es[k] * K);
      const right = v < 0;
      o.t.setAttribute('x', right ? Z + 8 : Z - 8); o.t.setAttribute('text-anchor', right ? 'start' : 'end');
      o.t.textContent = (v > 0 ? '+' : '') + pc(v, 1);
    });
    document.getElementById('durWhy').textContent = dy === 0
      ? 'Move the slider to change yields.'
      : `A ${dy > 0 ? 'rise' : 'fall'} of ${Math.abs(dy).toFixed(2)} points moves the 2-year bond ${pc(ex[0], 1)}, the 10-year ${pc(ex[1], 1)} and the 30-year zero ${pc(ex[2], 1)}. Duration predicts ${pc(es[0], 1)}, ${pc(es[1], 1)} and ${pc(es[2], 1)}.`;
  }
  bind(['durDy'], draw); draw();
})();
