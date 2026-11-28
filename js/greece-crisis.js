/* Greek debt crisis explainer: reveal-on-scroll, progress bar, TOC, copy link, plus the graphics:
   Greece in four numbers (Eurostat, 1995-2025) and the austerity arithmetic (fiscal multiplier). */

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

/* ---------------- Greece in four numbers (Eurostat, retrieved November 2026) ---------------- */
const Y0 = 1995;
const DATA = {
  // general government gross debt, % of GDP (gov_10dd_edpt1, GD)
  debt: [100.4, 103.7, 102.6, 100.8, 102.8, 108.9, 110.5, 107.9, 104.3, 105.5, 109.9, 105.3, 104.6, 110.9, 128.5, 147.8, 175.1, 164.1, 180.4, 182.7, 179.6, 183.1, 182.1, 189, 183.2, 209.4, 197.3, 177.8, 164, 153.5, 145.4],
  // net lending (+) / borrowing (-), % of GDP (gov_10dd_edpt1, B9)
  def: [-9.9, -8.4, -6.2, -6.5, -6, -4.2, -5.6, -6.2, -8, -9.1, -6.3, -6, -6.8, -10.3, -15.4, -11.4, -10.5, -9.3, -13.6, -3.8, -5.9, 0.2, 0.7, 0.9, 0.8, -9.9, -7.3, -2.7, -1.5, 1.4, 2],
  // real GDP growth, % (nama_10_gdp, CLV_PCH_PRE); 1995 not published
  gdp: [null, 1.4, 3.6, 3.4, 2.7, 4.1, 4.7, 4.7, 5.8, 5.4, 1.2, 6.4, 3.5, 0.1, -4.1, -5.7, -9.9, -8.3, -2.3, 0.8, -0.2, 0, 1.5, 2.1, 2.3, -9.2, 8.7, 5.5, 2, 2.1, 2.1],
  // unemployment, % of labour force 15-74 (une_rt_a); this series starts in 2009
  une: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, 9.8, 12.9, 18.1, 24.8, 27.8, 26.6, 25, 23.9, 21.8, 19.7, 17.9, 17.6, 14.7, 12.5, 11.1, 10.1, 8.9]
};
const EVENTS = {
  1995: 'Greece is outside the plans for the euro: its inflation and deficits are too high.',
  1999: 'Eleven countries launch the euro. Greece is left out, and applies again on its 1999 figures.',
  2000: 'The EU accepts Greece into the euro from the following year.',
  2001: 'Greece joins the euro on 1 January. Goldman Sachs’ currency swaps trim its reported debt.',
  2002: 'Euro notes and coins replace the drachma.',
  2004: 'Athens hosts the Olympics. After an election, an audit finds the deficit had been under-reported since 1997.',
  2008: 'The global financial crisis. Growth stalls as tourism and shipping slump.',
  2009: 'A new government reveals the deficit is far bigger than reported. Ratings agencies start cutting Greece towards junk.',
  2010: 'Greece can no longer borrow from markets. First bailout: €110 billion, with deep cuts.',
  2011: 'The economy shrinks by almost 10%, its worst year of the crisis.',
  2012: 'Second bailout, and private bondholders write off about €107 billion. The debt ratio dips, then rises again as GDP keeps falling.',
  2013: 'Unemployment peaks at 27.8%, and at 59% for under-25s.',
  2014: 'Growth returns, briefly.',
  2015: 'Syriza’s standoff with creditors: banks close, capital controls, a referendum and a third bailout.',
  2016: 'Under the third programme, the budget moves into a small surplus.',
  2018: 'Greece leaves its last bailout programme on 20 August.',
  2020: 'The pandemic: GDP falls 9% and debt peaks at 209% of GDP.',
  2021: 'A strong rebound as the economy reopens.',
  2025: 'Debt is down to about 145% of GDP, the budget is in surplus and unemployment is below 9%.'
};
(function () {
  const s = document.getElementById('grSvg'), yr = document.getElementById('grYear'), box = document.getElementById('grTabs'); if (!s || !yr || !box) return;
  const why = document.getElementById('grWhy'), yv = document.getElementById('grYearV');
  const tabs = [...box.querySelectorAll('[role=tab]')], ind = box.querySelector('.gr-ind');
  const fs = NARROW ? 1.6 : 1;
  if (NARROW) s.setAttribute('viewBox', '0 0 680 330');
  const L = NARROW ? 70 : 54, R = 664, T = 26, B = NARROW ? 270 : 252, N = DATA.debt.length;
  const step = (R - L) / N, bw = step * 0.72;
  const X = (i) => L + i * step + (step - bw) / 2;
  const CFG = {
    debt: { lo: 0, hi: 220, ticks: [0, 50, 100, 150, 200], ref: [60, 'Maastricht limit 60%'], unit: '%', col: () => '#2f5f9e' },
    def: { lo: -16, hi: 4, ticks: [-15, -10, -5, 0], ref: [-3, 'deficit limit 3%'], unit: '%', col: (v) => (v < 0 ? RED : GREEN) },
    gdp: { lo: -11, hi: 9, ticks: [-10, -5, 0, 5], ref: null, unit: '%', col: (v) => (v < 0 ? RED : GREEN) },
    une: { lo: 0, hi: 30, ticks: [0, 10, 20, 30], ref: null, unit: '%', col: () => '#b06a1d' }
  };
  const grid = mk('g', {}, s), bars = [], refG = mk('g', {}, s);
  for (let i = 0; i < N; i++) bars.push(mk('rect', { x: X(i), width: bw, y: B, height: 0, class: 'gb' }, s));
  for (let y = 1995; y <= 2025; y += 5) say(s, X(y - Y0) + bw / 2, B + 18 * fs, String(y), { 'text-anchor': 'middle', 'font-size': 11 * fs, fill: MUTED });
  const hl = mk('rect', { y: T - 8, width: step, height: B - T + 8, fill: 'rgba(31,31,34,.06)' }, s);
  s.insertBefore(hl, s.firstChild);
  const tag = say(s, 0, 0, '', { 'text-anchor': 'middle', 'font-size': 13 * fs, 'font-weight': 800, 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 4 });
  let key = 'debt';
  function draw() {
    const c = CFG[key], i = +yr.value - Y0, v = DATA[key][i];
    const Yv = (x) => T + (c.hi - x) / (c.hi - c.lo) * (B - T);
    grid.innerHTML = ''; refG.innerHTML = '';
    c.ticks.forEach((t) => {
      mk('line', { x1: L, x2: R, y1: Yv(t), y2: Yv(t), stroke: t ? RULE : '#b9b2a3', 'stroke-width': t ? 1 : 1.5 }, grid);
      say(grid, L - 8, Yv(t) + 4, t + c.unit, { 'text-anchor': 'end', 'font-size': 11 * fs, fill: MUTED });
    });
    if (c.ref) {
      mk('line', { x1: L, x2: R, y1: Yv(c.ref[0]), y2: Yv(c.ref[0]), stroke: INK, 'stroke-dasharray': '5 4', 'stroke-width': 1.2 }, refG);
      say(refG, R - 4, Yv(c.ref[0]) - 6, c.ref[1], { 'text-anchor': 'end', 'font-size': 11 * fs, fill: INK, 'font-weight': 700 });
    }
    const z = Yv(Math.max(c.lo, 0));
    DATA[key].forEach((d, j) => {
      const b = bars[j];
      if (d == null) { b.style.y = z + 'px'; b.style.height = '0px'; return; }
      const y1 = Yv(Math.max(d, 0)), y2 = Yv(Math.min(d, 0));
      b.style.y = y1 + 'px'; b.style.height = Math.max(1, y2 - y1) + 'px';
      b.setAttribute('fill', c.col(d)); b.setAttribute('opacity', j === i ? 1 : 0.45);
    });
    hl.setAttribute('x', L + i * step);
    yv.textContent = yr.value;
    if (v == null) { tag.textContent = ''; }
    else {
      tag.textContent = (v > 0 && key !== 'debt' && key !== 'une' ? '+' : '') + v + c.unit;
      tag.setAttribute('x', Math.min(R - 24 * fs, Math.max(L + 24 * fs, X(i) + bw / 2)));
      tag.setAttribute('y', v >= 0 ? Yv(v) - 8 : Yv(v) + 18 * fs);
      tag.setAttribute('fill', c.col(v));
    }
    const val = v == null ? (key === 'une' ? 'No comparable unemployment figure before 2009.' : 'No figure published.')
      : key === 'debt' ? `Government debt: ${v}% of GDP.`
      : key === 'def' ? (v < 0 ? `Budget deficit: ${-v}% of GDP.` : `Budget surplus: ${v}% of GDP.`)
      : key === 'gdp' ? (v < 0 ? `The economy shrank by ${-v}%.` : v === 0 ? 'The economy was flat.' : `The economy grew by ${v}%.`)
      : `Unemployment: ${v}%.`;
    why.textContent = val + (EVENTS[yr.value] ? ' ' + EVENTS[yr.value] : '');
  }
  function select(n, focus) {
    tabs.forEach((t, j) => { t.setAttribute('aria-selected', j === n); t.tabIndex = j === n ? 0 : -1; });
    const t = tabs[n]; key = t.dataset.k;
    ind.style.transform = `translateX(${t.offsetLeft}px)`; ind.style.width = t.offsetWidth + 'px';
    if (box.scrollWidth > box.clientWidth) box.scrollTo({ left: t.offsetLeft - 24, behavior: reduced ? 'auto' : 'smooth' });
    if (focus) t.focus();
    draw();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', (e) => {
      const n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (n === undefined) return;
      e.preventDefault(); select((n + tabs.length) % tabs.length, true);
    });
  });
  const cur = () => Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'));
  addEventListener('resize', () => select(cur()));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => select(cur()));
  yr.addEventListener('input', draw);
  select(0);
})();

/* ---------------- The austerity arithmetic: cuts, the multiplier and the debt ratio ---------------- */
(function () {
  const s = document.getElementById('multSvg'), r = document.getElementById('cut'); if (!s || !r) return;
  const why = document.getElementById('multWhy'), cv = document.getElementById('cutV');
  const fs = NARROW ? 1.6 : 1;
  if (NARROW) s.setAttribute('viewBox', '0 0 680 280');
  const D0 = 148, G0 = 100, DEF0 = 11, TAX = 0.45;
  const L = NARROW ? 250 : 210, R = 640, MAX = 200, W = (v) => v / MAX * (R - L);
  const rowH = NARROW ? 70 : 56, top = 20;
  const ROWS = [['Debt ratio, no cuts', '#8a8578'], ['Debt ratio, with cuts', '#2f5f9e'], ['Size of the economy', '#3f6a45']];
  const els = ROWS.map(([name, col], k) => {
    const y = top + k * rowH;
    say(s, L - 12, y + 22 * fs, name, { 'text-anchor': 'end', 'font-size': 12.5 * fs, 'font-weight': 700, fill: INK });
    const bar = mk('rect', { x: L, y, width: 0, height: 30 * (NARROW ? 1.3 : 1), fill: col, class: 'gb' }, s);
    const val = say(s, L, y + 21 * fs, '', { 'font-size': 13 * fs, 'font-weight': 800, fill: INK });
    return { bar, val };
  });
  const limitX = L + W(160);
  mk('line', { x1: limitX, x2: limitX, y1: top - 8, y2: top + 2 * rowH - 18, stroke: INK, 'stroke-dasharray': '3 4' }, s);
  let m = 0.5;
  function draw() {
    const c = +r.value; cv.textContent = c + '%';
    const g = G0 - m * c, def = DEF0 - c + TAX * m * c;
    const base = (D0 + DEF0) / G0 * 100, ratio = (D0 + def) / g * 100;
    const vals = [base, ratio, g];
    els.forEach((e, k) => {
      const v = vals[k];
      e.bar.setAttribute('width', W(v));
      e.val.setAttribute('x', L + W(v) + 8);
      e.val.textContent = k < 2 ? Math.round(v) + '%' : (k === 2 ? `${g.toFixed(1)} (was 100)` : '');
    });
    if (W(g) + 140 * fs > R - L) els[2].val.setAttribute('x', L + W(g) - 8), els[2].val.setAttribute('text-anchor', 'end'), els[2].val.setAttribute('fill', '#fff');
    else els[2].val.setAttribute('text-anchor', 'start'), els[2].val.setAttribute('fill', INK);
    const lost = TAX * m * c;
    let t;
    if (c === 0) t = `With no cuts, the 11% deficit adds to the debt and the ratio rises from 148% to ${Math.round(base)}% in a year.`;
    else {
      t = `Cutting ${c}% of GDP shrinks the economy by ${(m * c).toFixed(1)}% and costs ${lost.toFixed(1)}% of GDP in lost taxes, so the deficit falls only to ${def.toFixed(1)}%. `;
      t += ratio > base + 0.4 ? `Because GDP falls faster than the debt, the debt ratio ends up higher, at ${Math.round(ratio)}%, than with no cuts at all.`
        : ratio < base - 0.4 ? `The debt ratio ends at ${Math.round(ratio)}%, a little lower than with no cuts.`
        : `The debt ratio barely moves: ${Math.round(ratio)}%.`;
    }
    why.textContent = t;
  }
  seg('mult', (v) => { m = +v; draw(); });
  r.addEventListener('input', draw);
  draw();
})();
