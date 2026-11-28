/* Strange-ETFs explainer: reveal-on-scroll, progress bar, TOC, copy link, plus four calculators:
   domicile and dividend tax, fee drag, the daily-reset trap, and the cost of rolling VIX futures. */

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

const FS = NARROW ? 1.6 : 1;
const val = (id) => +document.getElementById(id).value;
const setT = (id, t) => { const e = document.getElementById(id); if (e) e.textContent = t; };
const bind = (ids, fn) => ids.forEach((id) => { const e = document.getElementById(id); if (e) e.addEventListener('input', fn); });
const usd0 = (v) => '$' + Math.round(v).toLocaleString('en-US');
// a simple line chart with a fresh y scale each draw
function lineChart(s, opts) {
  const { L, R, T, B, xMax, yMin, yMax, xTicks, yTicks, xFmt, yFmt } = opts;
  const X = (x) => L + x / xMax * (R - L), Y = (v) => B - (v - yMin) / (yMax - yMin) * (B - T);
  const g = mk('g', {}, s);
  yTicks.forEach((t) => { mk('line', { x1: L, x2: R, y1: Y(t), y2: Y(t), stroke: RULE }, g); say(g, L - 8, Y(t) + 4, yFmt(t), { 'text-anchor': 'end', 'font-size': 11 * FS, fill: MUTED }); });
  xTicks.forEach((t) => say(g, X(t), B + 18 * FS, xFmt(t), { 'text-anchor': 'middle', 'font-size': 11 * FS, fill: MUTED }));
  return { g, X, Y };
}
const niceTicks = (lo, hi, n = 4) => {
  const raw = (hi - lo) / n, p = Math.pow(10, Math.floor(Math.log10(raw))), st = [1, 2, 2.5, 5, 10].map((m) => m * p).find((m) => m >= raw);
  const out = []; for (let v = Math.ceil(lo / st) * st; v <= hi + 1e-9; v += st) out.push(+v.toFixed(6)); return out;
};

/* ---------------- domicile: fee plus tax on dividends ---------------- */
(function () {
  const s = document.getElementById('domSvg'); if (!s) return;
  if (NARROW) s.setAttribute('viewBox', '0 0 680 230');
  const L = NARROW ? 270 : 230, R = 600, rowH = NARROW ? 66 : 56, bh = NARROW ? 32 : 26, MAX = 1.4;
  const W = (v) => v / MAX * (R - L);
  const rows = [[NARROW ? 'US fund (VOO)' : 'US-domiciled (like VOO)', 0.03, 0.30], [NARROW ? 'Irish fund (VWRA)' : 'Irish-domiciled (like VWRA)', null, 0.15]].map(([name], k) => {
    const y = 12 + k * rowH;
    say(s, L - 10, y + bh / 2 - 2, name, { 'text-anchor': 'end', 'font-size': 12.5 * FS, 'font-weight': 700, fill: INK });
    const sub = say(s, L - 10, y + bh / 2 + 14 * FS, '', { 'text-anchor': 'end', 'font-size': 11 * FS, fill: MUTED });
    return { fee: mk('rect', { x: L, y, height: bh, fill: '#8a8578', class: 'gb' }, s), tax: mk('rect', { y, height: bh, fill: RED, class: 'gb' }, s), t: say(s, L, y + bh / 2 + 4.5 * FS, '', { 'font-size': 13 * FS, 'font-weight': 800, fill: INK }), sub };
  });
  const key = mk('g', {}, s), ky = 12 + 2 * rowH + 4;
  mk('rect', { x: L, y: ky, width: 12, height: 12, fill: '#8a8578' }, key); say(key, L + 18, ky + 11, 'fund fee', { 'font-size': 11 * FS, fill: MUTED });
  mk('rect', { x: L + 110 * FS, y: ky, width: 12, height: 12, fill: RED }, key); say(key, L + 110 * FS + 18, ky + 11, 'US tax on dividends', { 'font-size': 11 * FS, fill: MUTED });
  function draw() {
    const y = val('domYield'), fee = val('domFee');
    setT('domYieldV', y.toFixed(1) + '%'); setT('domFeeV', fee.toFixed(2) + '%');
    const parts = [[0.03, 0.30 * y], [fee, 0.15 * y]];
    parts.forEach(([f, t], k) => {
      const o = rows[k];
      o.fee.setAttribute('width', W(f)); o.tax.setAttribute('x', L + W(f)); o.tax.setAttribute('width', W(t));
      o.t.setAttribute('x', L + W(f + t) + 8); o.t.textContent = (f + t).toFixed(2) + '% a year';
      o.sub.textContent = `fee ${f.toFixed(2)}% + tax ${t.toFixed(2)}%`;
    });
    const us = parts[0][0] + parts[0][1], ie = parts[1][0] + parts[1][1], diff = us - ie;
    document.getElementById('domWhy').textContent = Math.abs(diff) < 0.005
      ? `At these settings the two cost about the same each year, but the Irish fund still avoids US estate tax.`
      : diff > 0
        ? `The Irish-domiciled fund costs ${diff.toFixed(2)} percentage points a year less: about $${Math.round(diff * 1000)} a year on $100,000, even though its fee is higher. It also avoids US estate tax.`
        : `At these settings the US fund is ${(-diff).toFixed(2)} points a year cheaper, because the Irish fund's higher fee outweighs its tax saving. Estate-tax exposure still favours the Irish fund.`;
  }
  bind(['domYield', 'domFee'], draw); draw();
})();

/* ---------------- fee drag over 30 years ---------------- */
(function () {
  const s = document.getElementById('feeSvg'); if (!s) return;
  if (NARROW) s.setAttribute('viewBox', '0 0 680 300');
  const L = NARROW ? 92 : 70, R = NARROW ? 560 : 580, T = 16, B = NARROW ? 262 : 228;
  let ch = null;
  const cheap = mk('path', { fill: 'none', stroke: '#2f5f9e', 'stroke-width': 3 }, s), dear = mk('path', { fill: 'none', stroke: RED, 'stroke-width': 3 }, s);
  const tc = say(s, 0, 0, '', { 'font-size': 12 * FS, 'font-weight': 800, fill: '#2f5f9e' }), td = say(s, 0, 0, '', { 'font-size': 12 * FS, 'font-weight': 800, fill: RED });
  function draw() {
    const f = val('feeX'); setT('feeXV', f.toFixed(2) + '%');
    const grow = (fee, t) => 10000 * Math.pow(1.07 - fee / 100, t);
    const top = grow(0.03, 30);
    if (ch) ch.g.remove();
    ch = lineChart(s, { L, R, T, B, xMax: 30, yMin: 0, yMax: Math.ceil(top / 20000) * 20000, xTicks: [0, 10, 20, 30], yTicks: niceTicks(0, Math.ceil(top / 20000) * 20000), xFmt: (t) => t ? 'yr ' + t : 'now', yFmt: (v) => '$' + v / 1000 + 'k' });
    s.insertBefore(ch.g, s.firstChild);
    const pts = (fee) => Array.from({ length: 31 }, (_, t) => ch.X(t) + ' ' + ch.Y(grow(fee, t))).join(' L');
    cheap.setAttribute('d', 'M' + pts(0.03)); dear.setAttribute('d', 'M' + pts(f));
    const a = grow(0.03, 30), b = grow(f, 30);
    tc.setAttribute('x', R + 6); tc.setAttribute('y', ch.Y(a) + 4); tc.textContent = usd0(a);
    td.setAttribute('x', R + 6); td.setAttribute('y', Math.max(ch.Y(b) + 4, ch.Y(a) + 20 * FS)); td.textContent = usd0(b);
    document.getElementById('feeWhy').textContent = f <= 0.03
      ? 'At the same fee, the two end up the same.'
      : `After 30 years, the 0.03% fund grows to ${usd0(a)} and the ${f.toFixed(2)}% fund to ${usd0(b)}: ${usd0(a - b)} less, ${Math.round((1 - b / a) * 100)}% of the final pot, lost to fees.`;
  }
  bind(['feeX'], draw); draw();
})();

/* ---------------- daily inverse: why it isn't the opposite ---------------- */
(function () {
  const s = document.getElementById('drSvg'); if (!s) return;
  if (NARROW) s.setAttribute('viewBox', '0 0 680 300');
  const L = NARROW ? 80 : 62, R = NARROW ? 520 : 540, T = 16, B = NARROW ? 262 : 228, N = 20;
  let path = 'chop', ch = null;
  const lines = [['The fund it targets', INK, ''], ['Daily inverse fund', RED, ''], ['Simple opposite of the total', '#8a8578', '6 5']].map(([n, col, dash]) => ({ n, col, p: mk('path', { fill: 'none', stroke: col, 'stroke-width': 3, 'stroke-dasharray': dash }, s), t: say(s, 0, 0, '', { 'font-size': 11.5 * FS, 'font-weight': 700, fill: col }) }));
  function draw() {
    const m = val('drMove') / 100; setT('drMoveV', (m * 100) + '%');
    const r = Array.from({ length: N }, (_, i) => (path === 'chop' ? (i % 2 ? -m : m) : path === 'down' ? -m : m));
    const u = [100], inv = [100];
    r.forEach((x, i) => { u.push(u[i] * (1 + x)); inv.push(inv[i] * (1 - x)); });
    const simple = u.map((v) => Math.max(0, 200 - v));
    const all = u.concat(inv, simple), lo = Math.max(0, Math.min(...all) * 0.9), hi = Math.max(...all) * 1.05;
    if (ch) ch.g.remove();
    const yt = niceTicks(lo, hi);
    ch = lineChart(s, { L, R, T, B, xMax: N, yMin: lo, yMax: hi, xTicks: [0, 5, 10, 15, 20], yTicks: yt, xFmt: (t) => t ? 'day ' + t : 'start', yFmt: (v) => '$' + Math.round(v) });
    s.insertBefore(ch.g, s.firstChild);
    [u, inv, simple].forEach((arr, k) => {
      lines[k].p.setAttribute('d', 'M' + arr.map((v, i) => ch.X(i) + ' ' + ch.Y(v)).join(' L'));
    });
    // end labels, nudged apart
    const ends = [u, inv, simple].map((a, k) => ({ k, y: ch.Y(a[N]), v: a[N] })).sort((a, b) => a.y - b.y);
    for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 16 * FS) ends[i].y = ends[i - 1].y + 16 * FS;
    ends.forEach((e) => { const o = lines[e.k]; o.t.setAttribute('x', R + 6); o.t.setAttribute('y', e.y + 4); o.t.textContent = '$' + e.v.toFixed(0) + (NARROW ? '' : ' ' + ['target', 'daily inverse', 'simple opposite'][e.k]); });
    const tgt = u[N], dinv = inv[N], simp = simple[N];
    document.getElementById('drWhy').textContent = path === 'chop'
      ? `The market goes up ${m * 100}% and down ${m * 100}% on alternate days. The target ends at $${tgt.toFixed(0)}, so the simple opposite would be $${simp.toFixed(0)}. But the daily inverse fund ends at $${dinv.toFixed(0)}: in a choppy market, both lose.`
      : path === 'down'
        ? `The target falls ${m * 100}% a day to $${tgt.toFixed(0)}. The daily inverse fund compounds its gains and ends at $${dinv.toFixed(0)}, ahead of the simple opposite, $${simp.toFixed(0)}.`
        : `The target rises ${m * 100}% a day to $${tgt.toFixed(0)}. The daily inverse fund ends at $${dinv.toFixed(0)}; its losses shrink as it gets smaller, so it loses less than the simple opposite, $${simp.toFixed(0)}.`;
  }
  seg('drPath', (v) => { path = v; draw(); });
  bind(['drMove'], draw); draw();
})();

/* ---------------- VIX futures: the roll and the spike ---------------- */
(function () {
  const s = document.getElementById('vixSvg'); if (!s) return;
  if (NARROW) s.setAttribute('viewBox', '0 0 680 300');
  const L = NARROW ? 80 : 62, R = NARROW ? 520 : 540, T = 16, B = NARROW ? 262 : 228, N = 24, SPIKE = 18, JUMP = 1.15;
  let shock = 0, ch = null;
  const lines = [['Long volatility (like VXX)', '#2f5f9e'], ['Short volatility (like XIV)', '#b06a1d']].map(([n, col]) => ({ col, p: mk('path', { fill: 'none', stroke: col, 'stroke-width': 3 }, s), t: say(s, 0, 0, '', { 'font-size': 11.5 * FS, 'font-weight': 700, fill: col }) }));
  const dead = say(s, 0, 0, '', { 'font-size': 12 * FS, 'font-weight': 800, fill: RED });
  function draw() {
    const c = val('vixC') / 100; setT('vixCV', (c * 100) + '%');
    const roll = c / (1 + c), lo = [100], sh = [100];
    for (let t = 1; t <= N; t++) {
      let a = lo[t - 1] * (1 - roll), b = sh[t - 1] * (1 + roll);
      if (shock && t === SPIKE) { a *= 1 + JUMP; b = Math.max(0, b * (1 - JUMP)); }
      if (sh[t - 1] === 0) b = 0;
      lo.push(a); sh.push(b);
    }
    const hi = Math.max(...lo, ...sh) * 1.08;
    if (ch) ch.g.remove();
    ch = lineChart(s, { L, R, T, B, xMax: N, yMin: 0, yMax: hi, xTicks: [0, 6, 12, 18, 24], yTicks: niceTicks(0, hi), xFmt: (t) => t ? 'mo ' + t : 'start', yFmt: (v) => '$' + Math.round(v) });
    s.insertBefore(ch.g, s.firstChild);
    [lo, sh].forEach((arr, k) => {
      lines[k].p.setAttribute('d', 'M' + arr.map((v, i) => ch.X(i) + ' ' + ch.Y(v)).join(' L'));
      lines[k].t.setAttribute('x', R + 6); lines[k].t.setAttribute('y', ch.Y(arr[N]) + 4 + (k && Math.abs(ch.Y(lo[N]) - ch.Y(arr[N])) < 16 * FS ? 16 * FS : 0));
      lines[k].t.textContent = '$' + arr[N].toFixed(0) + (NARROW ? '' : k ? ' short vol' : ' long vol');
    });
    dead.textContent = shock ? 'terminated' : '';
    dead.setAttribute('x', ch.X(SPIKE) + 6); dead.setAttribute('y', ch.Y(0) - 8);
    document.getElementById('vixWhy').textContent = c === 0
      ? 'With no contango, rolling costs nothing and both funds stay at $100 while the VIX is flat.'
      : shock
        ? `For 17 months the short-volatility fund grows steadily, to $${sh[SPIKE - 1].toFixed(0)}, while the long fund bleeds to $${lo[SPIKE - 1].toFixed(0)}. Then one day of panic: the futures jump 115%, the long fund more than doubles, and the short fund, which owes the inverse of a 115% rise, is wiped out. That's what happened to XIV.`
        : `Rolling futures ${c * 100}% above today's level each month costs the long fund about ${(roll * 100).toFixed(1)}% a month, leaving $${lo[N].toFixed(0)} after two years though the VIX never moved. The fund betting against volatility collects that cost and grows to $${sh[N].toFixed(0)}, for as long as nothing goes wrong.`;
  }
  seg('vixShock', (v) => { shock = +v; draw(); });
  bind(['vixC'], draw); draw();
})();
