/* Seigniorage explainer: reveal-on-scroll, progress bar, TOC, copy link,
   the Roman denarius debasement chart, and the "what the issuer keeps" bars. */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.flow').forEach((chain) => {
  [...chain.children].forEach((child, i) => child.style.setProperty('--i', i));
});

const rio = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in-view');
  e.target.querySelectorAll('.ltrack i[data-w]').forEach((b) => { b.style.width = b.dataset.w + '%'; });
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

/* ---------------- Roman denarius silver content, bar chart ---------------- */
(function () {
  const s = document.getElementById('denariusSvg'); if (!s) return;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const tx = (p, x, y, str, a = {}) => { const t = el('text', Object.assign({ x, y, 'font-family': 'Inter' }, a), p); t.textContent = str; return t; };
  // silver fineness of the denarius, approximate, from several numismatic sources.
  // each: [emperor, date, silver %, why the content dropped at this point]
  const D = [
    ['Augustus', '~27 BCE', 98, 'The starting point: a near-pure silver coin, the stable standard of the early empire.'],
    ['Nero', '64 CE', 80, 'Nero cuts the silver and the weight to stretch the treasury after spending on rebuilding Rome after the Great Fire.'],
    ['Trajan', '~100 CE', 80, 'Held near Nero\u2019s level while conquests and new silver mines (in Dacia) help fund the state.'],
    ['M. Aurelius', '~170 CE', 75, 'Trimmed further to pay for costly frontier wars and the toll of the Antonine plague.'],
    ['S. Severus', '~200 CE', 50, 'Severus roughly halves the silver to fund army pay rises and civil-war spending after seizing power.'],
    ['Caracalla', '~215 CE', 50, 'Big military pay rises strain the coinage; Caracalla also issues the antoninianus, tariffed at two denarii but holding less than two coins\u2019 worth of silver.'],
    ['Gallienus', '~265 CE', 5, 'During the third-century crisis the coin collapses to a thin silver wash over bronze as the empire prints its way through chaos.'],
    ['late 3rd c.', '~270 CE', 2, 'Almost no silver left. Prices soar and people hoard the old good coins, forcing Diocletian\u2019s later currency reform.']
  ];
  const W = 680, H = 300, L = 44, R = 660, T = 20, B = 232;
  const n = D.length, gap = 14;
  const bw = (R - L - gap * (n - 1)) / n;
  const Yv = (v) => B - v / 100 * (B - T);
  [0, 25, 50, 75, 100].forEach((v) => {
    el('line', { x1: L, x2: R, y1: Yv(v), y2: Yv(v), stroke: v ? '#ece8df' : '#cfcabe' }, s);
    tx(s, L - 6, Yv(v) + 4, v + '%', { 'text-anchor': 'end', 'font-size': 10.5, fill: '#8a8578' });
  });
  const whyEl = document.getElementById('denariusWhy');
  const bars = [];
  D.forEach(([name, when, v, why], i) => {
    const x = L + i * (bw + gap);
    const full = el('rect', { x, y: T, width: bw, height: B - T, fill: '#f0ece2' }, s);
    const bar = el('rect', { x, y: B, width: bw, height: 0, fill: v > 60 ? '#9a9385' : (v > 20 ? '#c08a2d' : '#c2412d'), class: 'den-bar', style: `--i:${i}` }, s);
    bar.dataset.y = Yv(v); bar.dataset.h = B - Yv(v);
    tx(s, x + bw / 2, Yv(v) - 6, v + '%', { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: '#1f1f22' });
    tx(s, x + bw / 2, B + 16, name, { 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 600, fill: '#5d5a55' });
    tx(s, x + bw / 2, B + 29, when, { 'text-anchor': 'middle', 'font-size': 9, fill: '#8a8578' });
    bars.push(bar);
    // a full-column, transparent hit area so hover/tap works anywhere above the axis
    const hit = el('rect', { x: x - gap / 2, y: T, width: bw + gap, height: B - T, fill: 'transparent', style: 'cursor:pointer' }, s);
    const show = () => {
      bars.forEach((b) => b.style.opacity = '0.4');
      bar.style.opacity = '1';
      if (whyEl) whyEl.textContent = name + ' (' + when + '), ~' + v + '% silver: ' + why;
    };
    hit.addEventListener('mouseenter', show);
    hit.addEventListener('click', show);
  });
  if (whyEl) {
    s.addEventListener('mouseleave', () => { bars.forEach((b) => b.style.opacity = '1'); whyEl.textContent = 'Hover or tap a bar to see why the silver content dropped.'; });
    whyEl.textContent = 'Hover or tap a bar to see why the silver content dropped.';
  }
  // grow the bars when the chart scrolls into view
  const grow = () => s.querySelectorAll('.den-bar').forEach((b) => {
    if (reduced) { b.setAttribute('y', b.dataset.y); b.setAttribute('height', b.dataset.h); return; }
    b.style.transition = `y .7s cubic-bezier(.2,.8,.2,1) calc(var(--i,0)*70ms), height .7s cubic-bezier(.2,.8,.2,1) calc(var(--i,0)*70ms)`;
    requestAnimationFrame(() => { b.setAttribute('y', b.dataset.y); b.setAttribute('height', b.dataset.h); });
  });
  new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { o.disconnect(); grow(); } }), { threshold: .3 }).observe(s);
})();

/* ---------------- "What the issuer keeps" bars across eras ---------------- */
(function () {
  const s = document.getElementById('keepSvg'); if (!s) return;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const tx = (p, x, y, str, a = {}) => { const t = el('text', Object.assign({ x, y, 'font-family': 'Inter' }, a), p); t.textContent = str; return t; };
  // each: label, the cost/backing kept out as a fraction of face value (0-1), note
  const ROWS = [
    ['Silver coin (honest)', 0.98, 'A full-silver coin: almost all the face value is real metal. The mint keeps only a small fee.'],
    ['Debased coin', 0.50, 'Shave the silver to half and spend at full value: the issuer pockets the other half.'],
    ['$100 note', 0.001, 'Paper and ink cost about nine cents. Almost the entire $100 is seigniorage.'],
    ['Stablecoin (USDT)', 0.0, 'Near-zero to mint; the $1 of backing is invested in Treasuries and the issuer keeps the yield.']
  ];
  const W = 680, H = 250, L = 150, R = 620, T = 24, rh = 40, gap = 14;
  const X = (f) => L + f * (R - L);
  ROWS.forEach(([label, cost, note], i) => {
    const y = T + i * (rh + gap);
    // full face-value track
    el('rect', { x: L, y, width: R - L, height: rh, fill: '#f0ece2' }, s);
    // the profit portion (face value minus cost), grows on reveal
    const profW = (1 - cost) * (R - L);
    const prof = el('rect', { x: L, y, width: 0, height: rh, fill: '#5f8a63', class: 'keep-bar', style: `--i:${i}` }, s);
    prof.dataset.w = profW;
    // the cost portion label at the far left of the track
    if (cost > 0.02) {
      el('rect', { x: X(1 - cost), y, width: cost * (R - L), height: rh, fill: '#9a9385' }, s);
    }
    tx(s, L - 10, y + rh / 2 + 4, label, { 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 700, fill: '#1f1f22' });
    const pct = Math.round((1 - cost) * 100);
    tx(s, L + 10, y + rh / 2 + 4, pct >= 99 ? '≈100% kept' : pct + '% kept', { 'font-size': 12, 'font-weight': 700, fill: '#fff', class: 'keep-lab', style: `--i:${i}` });
  });
  const grow = () => {
    s.querySelectorAll('.keep-bar').forEach((b) => {
      if (reduced) { b.setAttribute('width', b.dataset.w); return; }
      b.style.transition = 'width .8s cubic-bezier(.2,.8,.2,1) calc(var(--i,0)*120ms)';
      requestAnimationFrame(() => b.setAttribute('width', b.dataset.w));
    });
  };
  new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { o.disconnect(); grow(); } }), { threshold: .3 }).observe(s);
})();

/* ---------------- "The industry that always does well": animated cartoon scene ----------------
   An analyst presents an outlook board. When the figure scrolls into view (.in-view), the five
   ordinary sectors draw sliding lines and get red "down" badges, then the money-printing line
   climbs out of the top of its panel, coins and notes fly out, and the quote pops up.
   Timing lives in css/seigniorage.css; reduced motion shows the finished frame. */
(function () {
  const s = document.getElementById('outlookSvg'); if (!s) return;
  const K = window.SceneKit;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const tx = (p, x, y, str, a = {}) => { const t = el('text', Object.assign({ x, y, 'font-family': 'Inter' }, a), p); t.textContent = str; return t; };
  const GOLD = '#c08a2d', RED = '#c2412d', INK = '#1f1f22', GREY = '#9a9385';
  const F = 452; // floor

  // room
  el('rect', { x: 0, y: 0, width: 800, height: 470, fill: '#f1ede4' }, s);
  el('rect', { x: 0, y: F, width: 800, height: 18, fill: '#d8d0bf' }, s);

  // the board
  const BX = 196, BY = 150, BW = 590, BH = 292;
  el('rect', { x: BX, y: BY, width: BW, height: BH, rx: 8, fill: '#fff', stroke: '#d8d2c4', 'stroke-width': 2 }, s);
  el('rect', { x: BX + BW / 2 - 60, y: BY + BH, width: 10, height: F - BY - BH, fill: '#b9b1a1' }, s);
  el('rect', { x: BX + BW / 2 + 50, y: BY + BH, width: 10, height: F - BY - BH, fill: '#b9b1a1' }, s);
  tx(s, BX + 18, BY + 28, 'INDUSTRY OUTLOOK', { 'font-size': 15, 'font-weight': 800, 'letter-spacing': '.08em', fill: INK });

  // five ordinary sectors, all sliding
  const TW = 128, TH = 108, GX = 10, GY = 12, X0 = BX + 16, Y0 = BY + 44;
  const SECT = [
    ['Staples', [[0, 18], [30, 24], [62, 40], [96, 50], [112, 62]]],
    ['Financials', [[0, 16], [28, 44], [56, 30], [86, 58], [112, 66]]],
    ['High tech', [[0, 12], [30, 30], [60, 26], [90, 52], [112, 64]]],
    ['Healthcare', [[0, 20], [30, 32], [60, 30], [90, 48], [112, 60]]],
    ['Travel', [[0, 10], [26, 22], [56, 46], [84, 50], [112, 68]]],
  ];
  SECT.forEach(([name, pts], i) => {
    const col = i % 3, row = Math.floor(i / 3);
    // second row has two tiles: centre them under the first row
    const x = X0 + (col + (row === 1 ? 0.5 : 0)) * (TW + GX), y = Y0 + row * (TH + GY);
    const g = el('g', { class: 'ol-tile', style: `--i:${i}` }, s);
    el('rect', { x, y, width: TW, height: TH, rx: 5, fill: '#faf8f3', stroke: '#e6e0d3' }, g);
    el('line', { x1: x + 8, x2: x + TW - 8, y1: y + 84, y2: y + 84, stroke: '#e6e0d3' }, g);
    const line = el('polyline', { class: 'ol-down', style: `--i:${i}`, points: pts.map(([px, py]) => `${x + 8 + px},${y + 8 + py}`).join(' '), fill: 'none', stroke: GREY, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    line.dataset.len = 1;
    tx(g, x + TW / 2, y + TH - 8, name, { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 600, fill: '#5d5a55' });
    const badge = el('g', { class: 'ol-badge', style: `--i:${i}` }, g);
    el('circle', { cx: x + TW - 16, cy: y + 16, r: 10, fill: RED }, badge);
    el('path', { d: `M${x + TW - 21} ${y + 13} L${x + TW - 11} ${y + 13} L${x + TW - 16} ${y + 21} Z`, fill: '#fff' }, badge);
  });

  // the exception: money printing, in a tall gold panel, with a little press
  const MX = X0 + 3 * (TW + GX) + 2, MY = Y0, MW = BX + BW - 16 - MX, MH = 2 * TH + GY;
  const mg = el('g', { class: 'ol-tile', style: '--i:5' }, s);
  el('rect', { x: MX, y: MY, width: MW, height: MH, rx: 5, fill: '#fbf3e2', stroke: GOLD, 'stroke-width': 2.5 }, mg);
  tx(mg, MX + MW / 2, MY + MH - 9, 'Money printing', { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 800, fill: GOLD });
  // press: a box with rollers; notes slide out of it on a loop
  const px = MX + 14, py = MY + MH - 62;
  el('rect', { x: px, y: py, width: 46, height: 30, rx: 4, fill: '#3a3833' }, mg);
  el('circle', { cx: px + 14, cy: py + 15, r: 6, fill: '#6b6862' }, mg);
  el('circle', { cx: px + 32, cy: py + 15, r: 6, fill: '#6b6862' }, mg);
  for (let k = 0; k < 3; k++) {
    const n = el('g', { class: 'ol-note', style: `--k:${k}` }, mg);
    el('rect', { x: px + 46, y: py + 9, width: 24, height: 12, rx: 2, fill: '#7fbf8a', stroke: '#3f7a4b' }, n);
    tx(n, px + 58, py + 19, '$', { 'text-anchor': 'middle', 'font-size': 9, 'font-weight': 800, fill: '#2d5a37' });
  }
  // the climbing line, which leaves the panel and the board
  const upPts = [[MX + 16, MY + MH - 84], [MX + 46, MY + MH - 104], [MX + 72, MY + MH - 140], [MX + 96, MY + 70], [MX + 114, MY + 6], [MX + 124, BY - 6], [MX + 130, 132]];
  el('polyline', { class: 'ol-up', points: upPts.map(([a, b]) => `${a},${b}`).join(' '), fill: 'none', stroke: GOLD, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, s);
  const tip = upPts[upPts.length - 1];
  const head = el('g', { class: 'ol-head' }, s);
  el('path', { d: `M${tip[0] - 9} ${tip[1] + 10} L${tip[0] + 1} ${tip[1] - 8} L${tip[0] + 9} ${tip[1] + 12} Z`, fill: GOLD }, head);
  // coins and notes burst out around the tip, then bob
  [[-34, 18, 'c'], [-64, 26, 'c'], [-20, -8, 'n'], [-52, -4, 'n'], [-40, 50, 'c'], [6, -16, 'c']].forEach(([dx, dy, kind], k) => {
    const g = el('g', { class: 'ol-coin', style: `--k:${k}` }, s);
    const cx = tip[0] + dx, cy = tip[1] + dy;
    if (kind === 'c') {
      el('circle', { cx, cy, r: 9, fill: '#e0b65a', stroke: '#9a7320', 'stroke-width': 1.5 }, g);
      tx(g, cx, cy + 4, '$', { 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: '#7a5a12' });
    } else {
      el('rect', { x: cx - 13, y: cy - 7, width: 26, height: 14, rx: 2, fill: '#7fbf8a', stroke: '#3f7a4b', transform: `rotate(${k % 2 ? -14 : 12} ${cx} ${cy})` }, g);
    }
  });

  // the analyst, pointing at the board
  if (K) {
    K.person(s, 104, { floor: F, sh: 300, top: '#2f4a7a', pants: '#1a1c22', tie: RED, hair: K.hair.short, hairColor: '#2a2018', skin: K.SKINS[1], arms: 'wave', smile: 4 });
  }

  // the quote, popping up last
  const q = el('g', { class: 'ol-quote' }, s);
  el('rect', { x: 168, y: 16, width: 520, height: 100, rx: 12, fill: '#fff', stroke: '#17305f', 'stroke-width': 2.5 }, q);
  el('path', { d: 'M196 114 L128 232 L232 114', fill: '#fff', stroke: '#17305f', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, q);
  el('rect', { x: 194, y: 110, width: 44, height: 8, fill: '#fff' }, q);
  [['"The only industry that always seems to', 50], ['do well is the printing industry, ', 76], ['specifically money printing."', 102]].forEach(([line, y]) => {
    tx(q, 428, y, line, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, 'font-style': 'italic', fill: '#a1301f' });
  });

  // set each drawn line's real length so the CSS draw-on animation matches it
  s.querySelectorAll('.ol-down, .ol-up').forEach((p) => { p.style.setProperty('--len', Math.ceil(p.getTotalLength())); });
})();

/* shared SVG helpers for the graphics below */
const SVGNS = 'http://www.w3.org/2000/svg';
const mk = (t, a, p) => { const e = document.createElementNS(SVGNS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
const say = (p, x, y, str, a = {}) => { const t = mk('text', Object.assign({ x, y, 'font-family': 'Inter' }, a), p); t.textContent = str; return t; };
// run fn(t) on every frame only while el is on screen (t = seconds since it first appeared)
function whileVisible(el, fn) {
  let raf = 0, on = false, t0 = 0;
  const loop = (now) => { if (!on) return; if (!t0) t0 = now; fn((now - t0) / 1000); raf = requestAnimationFrame(loop); };
  new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting && !on) { on = true; raf = requestAnimationFrame(loop); }
    if (!e.isIntersecting && on) { on = false; cancelAnimationFrame(raf); t0 = 0; }
  }), { threshold: 0.2 }).observe(el);
}
const ease = (p) => p * p * (3 - 2 * p);
// on phones the wide SVGs shrink a lot, so their labels are drawn bigger
const NARROW = matchMedia('(max-width: 560px)').matches;
const FS = NARROW ? 1.8 : 1;
const lerp = (a, b, p) => a + (b - a) * p;

/* ---------------- Gresham's law: good coins hoarded, bad coins spent ---------------- */
(function () {
  const s = document.getElementById('greshamSvg'); if (!s) return;
  const K = window.SceneKit, F = 300;
  mk('rect', { x: 0, y: 0, width: 800, height: 330, fill: '#f3efe6' }, s);
  mk('rect', { x: 0, y: F, width: 800, height: 30, fill: '#d8d0bf' }, s);
  // the hoard jar, at home (left)
  mk('rect', { x: 40, y: 150, width: 170, height: 150, fill: '#e9e2d2' }, s);
  mk('path', { d: 'M30 152 L125 96 L220 152 Z', fill: '#b9a27a' }, s);
  say(s, 125, 140, 'AT HOME', { 'text-anchor': 'middle', 'font-size': 11 * FS, 'font-weight': 800, fill: '#6e5f45', 'letter-spacing': '.12em' });
  mk('path', { d: 'M82 190 h86 v8 q8 4 8 14 v74 q0 12 -12 12 h-78 q-12 0 -12 -12 v-74 q0 -10 8 -14 z', fill: 'rgba(255,255,255,.55)', stroke: '#8a8578', 'stroke-width': 2 }, s);
  const jarFill = mk('g', {}, s);
  say(s, 125, 324, NARROW ? 'kept: good coins' : 'kept: the good coins', { 'text-anchor': 'middle', 'font-size': 12 * FS, 'font-weight': 700, fill: '#5d5a55' });
  // the market stall (right)
  mk('rect', { x: 590, y: 190, width: 170, height: 110, fill: '#c9b08a' }, s);
  mk('rect', { x: 580, y: 180, width: 190, height: 14, fill: '#8a6d3b' }, s);
  for (let i = 0; i < 5; i++) mk('path', { d: `M${580 + i * 38} 120 h38 v34 q-19 14 -38 0 z`, fill: i % 2 ? '#fff' : '#c2412d' }, s);
  mk('rect', { x: 584, y: 120, width: 6, height: 70, fill: '#6e5530' }, s);
  mk('rect', { x: 760, y: 120, width: 6, height: 70, fill: '#6e5530' }, s);
  say(s, 675, 250, 'MARKET', { 'text-anchor': 'middle', 'font-size': 11 * FS, 'font-weight': 800, fill: '#5b4526', 'letter-spacing': '.12em' });
  const tray = mk('g', {}, s);
  say(s, 675, 324, NARROW ? 'spent: debased' : 'spent: the debased coins', { 'text-anchor': 'middle', 'font-size': 12 * FS, 'font-weight': 700, fill: '#5d5a55' });
  // the shopper in the middle
  if (K) K.person(s, 400, { floor: F, sh: 168, top: '#7a5c8e', pants: '#2b2b30', hair: K.hair.short, hairColor: '#3a2a1a', skin: K.SKINS[1], arms: 'hold', smile: 3 });
  // a coin: good = bright silver, bad = dull grey-brown with a rough edge
  const coin = (p, good, r = 13) => {
    const g = mk('g', {}, p);
    mk('circle', { r, fill: good ? '#e6e8ec' : '#9b8e78', stroke: good ? '#9aa3b0' : '#6b604f', 'stroke-width': 2 }, g);
    mk('circle', { r: r - 4, fill: 'none', stroke: good ? '#b8c0cb' : '#7d7260', 'stroke-width': 1 }, g);
    say(g, 0, 4, 'I', { 'text-anchor': 'middle', 'font-size': r, 'font-weight': 800, fill: good ? '#7d8694' : '#5a5040' });
    return g;
  };
  // stacks that build up as coins land
  const jarSpots = [], traySpots = [];
  for (let i = 0; i < 12; i++) jarSpots.push([96 + (i % 4) * 22, 280 - Math.floor(i / 4) * 16]);
  for (let i = 0; i < 12; i++) traySpots.push([610 + (i % 6) * 26, 172 - Math.floor(i / 6) * 9]);
  const jarCoins = jarSpots.map(([x, y]) => { const c = coin(jarFill, true, 10); c.setAttribute('transform', `translate(${x} ${y})`); c.style.opacity = 0; return c; });
  const trayCoins = traySpots.map(([x, y]) => { const c = coin(tray, false, 10); c.setAttribute('transform', `translate(${x} ${y})`); c.style.opacity = 0; return c; });
  // the coin in flight
  const label = say(s, 400, 40, '', { 'text-anchor': 'middle', 'font-size': 13 * FS, 'font-weight': 800 });
  const flying = [coin(s, true), coin(s, false)];
  const CYCLE = 1.6, N = 24; // coins alternate good/bad; 24 coins then reset
  if (reduced) { jarCoins.forEach((c) => (c.style.opacity = 1)); trayCoins.forEach((c) => (c.style.opacity = 1)); flying.forEach((f) => (f.style.opacity = 0)); return; }
  flying.forEach((f) => (f.style.opacity = 0));
  whileVisible(s, (t) => {
    const total = t % (N * CYCLE + 2.5);
    const k = Math.floor(total / CYCLE), p = (total % CYCLE) / CYCLE;
    const good = k % 2 === 0, n = Math.floor(k / 2);
    jarCoins.forEach((c, i) => (c.style.opacity = i < (good ? n : n + 1) && k < N ? 1 : (k >= N ? 1 : 0)));
    trayCoins.forEach((c, i) => (c.style.opacity = i < n && k < N ? 1 : (k >= N ? 1 : 0)));
    flying.forEach((f) => (f.style.opacity = 0));
    if (k >= N) { label.textContent = 'Only the debased coins circulate'; label.setAttribute('fill', '#8a2a1c'); return; }
    const f = flying[good ? 0 : 1]; f.style.opacity = 1;
    label.textContent = good ? 'Full silver: keep it' : 'Debased: spend it';
    label.setAttribute('fill', good ? '#5d7fae' : '#8a2a1c');
    // drop into the hand, pause, then fly to the jar or the stall
    const hand = [400, 262], dest = good ? jarSpots[Math.min(n, 11)] : traySpots[Math.min(n, 11)];
    let x, y;
    if (p < 0.35) { const q = ease(p / 0.35); x = 400; y = lerp(60, hand[1], q); }
    else if (p < 0.5) { x = hand[0]; y = hand[1]; }
    else { const q = ease((p - 0.5) / 0.5); x = lerp(hand[0], dest[0], q); y = lerp(hand[1], dest[1], q) - Math.sin(q * Math.PI) * 90; }
    f.setAttribute('transform', `translate(${x} ${y})`);
  });
})();

/* ---------------- Balance scales: face value against cost ---------------- */
(function () {
  const s = document.getElementById('scaleSvg'); if (!s) return;
  const ITEMS = [
    { name: '$100 note', face: '$100', cost: '9¢', tilt: -1, verdict: 'Profit: about $99.91', short: '+$99.91', col: '#5f8a63' },
    { name: 'Penny', face: '1¢', cost: '3.7¢', tilt: 1, verdict: 'Loss: 2.7¢ a coin', short: '−2.7¢ each', col: '#c2412d' },
    { name: 'Nickel', face: '5¢', cost: '13.8¢', tilt: 1, verdict: 'Loss: 8.8¢ a coin', short: '−8.8¢ each', col: '#c2412d' }
  ];
  const parts = ITEMS.map((it, i) => {
    const cx = 120 + i * 240, py = 84, arm = 80;
    mk('path', { d: `M${cx - 34} 220 h68 l-10 -12 h-48 z`, fill: '#8a8578' }, s);
    mk('rect', { x: cx - 4, y: py, width: 8, height: 126, fill: '#8a8578' }, s);
    mk('circle', { cx, cy: py, r: 7, fill: '#5d5a55' }, s);
    const beam = mk('rect', { x: cx - arm, y: py - 3, width: arm * 2, height: 6, rx: 3, fill: '#5d5a55' }, s);
    const pan = (lab, sub, fill) => {
      const g = mk('g', {}, s);
      mk('line', { x1: -26, y1: 0, x2: 0, y2: -48, stroke: '#8a8578', 'stroke-width': 1.5 }, g);
      mk('line', { x1: 26, y1: 0, x2: 0, y2: -48, stroke: '#8a8578', 'stroke-width': 1.5 }, g);
      mk('path', { d: 'M-34 0 h68 q-6 14 -34 14 q-28 0 -34 -14 z', fill: '#cfc7b6' }, g);
      const bw = NARROW ? 76 : 54, bh = NARROW ? 32 : 24;
      mk('rect', { x: -bw / 2, y: -bh - 3, width: bw, height: bh, rx: 4, fill }, g);
      say(g, 0, NARROW ? -11 : -10, lab, { 'text-anchor': 'middle', 'font-size': NARROW ? 21 : 13, 'font-weight': 800, fill: '#fff' });
      say(g, 0, NARROW ? 38 : 32, sub, { 'text-anchor': 'middle', 'font-size': NARROW ? 17 : 10.5, 'font-weight': 700, fill: '#5d5a55' });
      return g;
    };
    const L = pan(it.face, NARROW ? 'face' : 'face value', '#5f8a63'), R = pan(it.cost, NARROW ? 'cost' : 'cost to make', '#9a6a3a');
    say(s, cx, 30, it.name, { 'text-anchor': 'middle', 'font-size': 15 * (NARROW ? 1.6 : 1), 'font-weight': 800, fill: '#1f1f22' });
    const v = say(s, cx, 254, NARROW ? it.short : it.verdict, { 'text-anchor': 'middle', 'font-size': NARROW ? 19 : 12.5, 'font-weight': 800, fill: it.col });
    v.style.opacity = 0; v.style.transition = 'opacity .5s ease .9s';
    return { it, cx, py, arm, beam, L, R, v };
  });
  const draw = (p) => parts.forEach(({ it, cx, py, arm, beam, L, R }) => {
    const a = it.tilt * 14 * p * Math.PI / 180;
    beam.setAttribute('transform', `rotate(${a * 180 / Math.PI} ${cx} ${py})`);
    const dx = Math.cos(a) * arm, dy = Math.sin(a) * arm;
    L.setAttribute('transform', `translate(${cx - dx} ${py - dy + 48})`);
    R.setAttribute('transform', `translate(${cx + dx} ${py + dy + 48})`);
  });
  draw(0);
  const fig = s.closest('.fig');
  new IntersectionObserver((es, o) => es.forEach((e) => {
    if (!e.isIntersecting) return; o.disconnect();
    parts.forEach((x) => (x.v.style.opacity = 1));
    if (reduced) { draw(1); return; }
    const t0 = performance.now() + 300;
    const step = (now) => {
      const q = Math.min(1, Math.max(0, (now - t0) / 1100));
      // a little overshoot so it settles like a real scale
      draw(q < 1 ? ease(q) * (1 + 0.15 * Math.sin(q * Math.PI)) : 1);
      if (q < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: 0.35 }).observe(fig);
})();

/* ---------------- The Fed's profit or loss at different interest rates ---------------- */
(function () {
  const s = document.getElementById('fedSvg'); const r = document.getElementById('fedRate'); if (!s || !r) return;
  const out = document.getElementById('fedRateV'), why = document.getElementById('fedWhy');
  const ASSETS = 7700, YIELD = 2.1, CASH = 2300, RES = 5300, COSTS = 9; // $bn, %, rounded ~2023
  const income = ASSETS * YIELD / 100; // ~162
  const cashPart = CASH * YIELD / 100; // ~48, earned on the bonds behind the notes
  // wide: labels left of the bars; narrow: a 360-wide chart with each label above its bar
  if (NARROW) s.setAttribute('viewBox', '0 0 360 300');
  const L = NARROW ? 8 : 210, Z = NARROW ? 190 : 480, SC = NARROW ? 0.5 : 0.55, RX = NARROW ? 352 : 670;
  const ROWY = NARROW ? [26, 96, 156, 226] : [30, 85, 125, 175];
  const rows = ['Interest earned on its bonds', 'Interest paid on reserves', 'Running costs', 'Result for the year'];
  rows.forEach((lab, i) => NARROW
    ? say(s, L, ROWY[i] - 6, lab, { 'font-size': 13, 'font-weight': 700, fill: '#1f1f22' })
    : say(s, L - 12, ROWY[i] + 17, lab, { 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 700, fill: '#1f1f22' }));
  mk('line', { x1: Z, x2: Z, y1: ROWY[0] - (NARROW ? 0 : 12), y2: ROWY[3] + 37, stroke: '#8a8578' }, s);
  mk('line', { x1: L, x2: RX, y1: ROWY[3] - (NARROW ? 26 : 15), y2: ROWY[3] - (NARROW ? 26 : 15), stroke: '#e4dfd3' }, s);
  const bar = (y, fill) => mk('rect', { x: Z, y, width: 0, height: 26, fill }, s);
  const bInc = bar(ROWY[0], '#5f8a63'); mk('rect', { x: Z, y: ROWY[0], width: cashPart * SC, height: 26, fill: '#3f6a45' }, s);
  const bPay = bar(ROWY[1], '#c2412d'), bCost = bar(ROWY[2], '#9a9385'), bRes = bar(ROWY[3], '#5f8a63');
  bInc.setAttribute('width', income * SC);
  bCost.setAttribute('x', Z - COSTS * SC); bCost.setAttribute('width', COSTS * SC);
  const tInc = say(s, Z + income * SC + 6, ROWY[0] + 18, '', { 'font-size': 12, 'font-weight': 800, fill: '#1f1f22' });
  say(s, NARROW ? L : Z, ROWY[0] + 40, NARROW ? 'darker part: earned on the bonds behind cash' : 'darker: backing cash', { 'font-size': NARROW ? 11 : 10, 'font-weight': 600, fill: '#3f6a45' });
  const tPay = say(s, 0, ROWY[1] + 18, '', { 'font-size': 12, 'font-weight': 800, fill: '#1f1f22', 'text-anchor': 'end' });
  say(s, Z - COSTS * SC - 6, ROWY[2] + 18, '−$9bn', { 'font-size': 12, 'font-weight': 800, fill: '#1f1f22', 'text-anchor': 'end' });
  const tRes = say(s, 0, ROWY[3] + 18, '', { 'font-size': 13, 'font-weight': 800 });
  tInc.textContent = '+$' + Math.round(income) + 'bn';
  function update() {
    const rate = +r.value; out.textContent = rate.toFixed(1) + '%';
    const pay = RES * rate / 100, res = income - pay - COSTS;
    bPay.setAttribute('x', Z - pay * SC); bPay.setAttribute('width', pay * SC);
    tPay.textContent = '−$' + Math.round(pay) + 'bn';
    // if the bar runs too close to the left edge, write its value inside it
    const inside = Z - pay * SC < (NARROW ? 70 : L + 60);
    tPay.setAttribute('x', inside ? Z - pay * SC + 6 : Z - pay * SC - 6); tPay.setAttribute('text-anchor', inside ? 'start' : 'end'); tPay.setAttribute('fill', inside ? '#fff' : '#1f1f22');
    const w = Math.abs(res) * SC;
    bRes.setAttribute('x', res >= 0 ? Z : Z - w); bRes.setAttribute('width', w); bRes.setAttribute('fill', res >= 0 ? '#5f8a63' : '#8a2a1c');
    tRes.setAttribute('x', res >= 0 ? Z + w + 6 : Z - w - 6); tRes.setAttribute('text-anchor', res >= 0 ? 'start' : 'end');
    tRes.setAttribute('fill', res >= 0 ? '#3f6a45' : '#8a2a1c');
    tRes.textContent = (res >= 0 ? 'Profit $' : 'Loss $') + Math.abs(Math.round(res)) + 'bn';
    why.innerHTML = res >= 0
      ? (rate < 1 ? 'Near-zero rates, as in 2021: reserves cost almost nothing, so nearly all the bond interest is profit, and it goes to the Treasury.' : `At ${rate.toFixed(1)}% the Fed still profits, but every rise in rates eats into it.`)
      : `At ${rate.toFixed(1)}% the interest on reserves outruns the bond income: a loss, booked as a deferred asset. ${rate >= 5 ? 'This is roughly 2023.' : ''} The dark-green slice, earned on the bonds behind cash, never goes away.`;
  }
  r.addEventListener('input', update);
  update();
  // a gentle demo: slide the rate up once when the chart first appears, unless the reader touches it
  if (!reduced) {
    let touched = false; r.addEventListener('pointerdown', () => (touched = true)); r.addEventListener('keydown', () => (touched = true));
    new IntersectionObserver((es, o) => es.forEach((e) => {
      if (!e.isIntersecting) return; o.disconnect();
      const t0 = performance.now() + 500;
      const step = (now) => {
        if (touched) return;
        const q = Math.min(1, Math.max(0, (now - t0) / 3000));
        r.value = (0.1 + 5.2 * ease(q)).toFixed(1); update();
        if (q < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }), { threshold: 0.5 }).observe(s);
  }
})();

/* ---------------- Stablecoin: the dollar goes in, the token comes out, the yield stays ---------------- */
(function () {
  const s = document.getElementById('stableSvg'); if (!s) return;
  const cnt = document.getElementById('stableCount');
  const node = (x, title, sub, fill) => {
    mk('rect', { x: x - 70, y: 50, width: 140, height: 76, rx: 10, fill: '#fff', stroke: fill, 'stroke-width': 2.5 }, s);
    say(s, x, 82, title, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: '#1f1f22' });
    say(s, x, 104, sub, { 'text-anchor': 'middle', 'font-size': 11.5, fill: '#5d5a55' });
  };
  const X = [100, 340, 580];
  node(X[0], 'You', 'hold the token', '#5d7fae');
  node(X[1], 'Issuer', 'keeps the interest', '#5f8a63');
  node(X[2], 'Treasury bill', 'pays interest', '#9a6a3a');
  mk('path', { d: `M${X[0] + 74} 70 H${X[1] - 74}`, stroke: '#d8d2c4', 'stroke-width': 2, 'stroke-dasharray': '4 4' }, s);
  mk('path', { d: `M${X[1] + 74} 70 H${X[2] - 74}`, stroke: '#d8d2c4', 'stroke-width': 2, 'stroke-dasharray': '4 4' }, s);
  const chip = (txt, fill) => { const g = mk('g', {}, s); mk('rect', { x: -22, y: -12, width: 44, height: 24, rx: 12, fill }, g); say(g, 0, 5, txt, { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: '#fff' }); g.style.opacity = 0; return g; };
  const dollar = chip('$1', '#3f6a45'), token = chip('1 tkn', '#5d7fae');
  const drips = [0, 1, 2].map(() => chip('+i', '#b8892f'));
  const cap = say(s, 340, 160, '', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#1f1f22' });
  const no = say(s, X[0], 160, '', { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#8a2a1c' });
  const at = (g, x, y) => g.setAttribute('transform', `translate(${x} ${y})`);
  const PER_SEC = 100e9 * 0.04 / (365 * 24 * 3600); // $100bn at 4%
  if (reduced) {
    at(dollar, X[2], 30); dollar.style.opacity = 1; at(token, X[0], 30); token.style.opacity = 1;
    cap.textContent = 'The interest goes to the issuer, not to you';
    if (cnt) cnt.textContent = 'On $100 billion of backing at 4%, the issuer earns about $127 a second, or $4 billion a year.';
    return;
  }
  whileVisible(s, (t) => {
    if (cnt) cnt.innerHTML = `While you've watched, $100 billion of backing at 4% has earned the issuer about <b>$${Math.round(t * PER_SEC).toLocaleString('en-US')}</b>.`;
    const c = t % 8;
    dollar.style.opacity = token.style.opacity = 0; drips.forEach((d) => (d.style.opacity = 0)); no.textContent = '';
    if (c < 1.4) { const q = ease(c / 1.4); dollar.style.opacity = 1; at(dollar, lerp(X[0], X[1], q), 30); cap.textContent = '1. You send the issuer a dollar'; }
    else if (c < 2.8) { const q = ease((c - 1.4) / 1.4); token.style.opacity = 1; at(token, lerp(X[1], X[0], q), 30); dollar.style.opacity = 1; at(dollar, X[1], 30); cap.textContent = '2. It mints a token for almost nothing'; }
    else if (c < 4.2) { const q = ease((c - 2.8) / 1.4); token.style.opacity = 1; at(token, X[0], 30); dollar.style.opacity = 1; at(dollar, lerp(X[1], X[2], q), 30); cap.textContent = '3. Your dollar buys a Treasury bill'; }
    else {
      token.style.opacity = 1; at(token, X[0], 30); dollar.style.opacity = 1; at(dollar, X[2], 30);
      cap.textContent = '4. The interest flows to the issuer';
      no.textContent = 'none of it to you';
      drips.forEach((d, i) => { const q = ((c - 4.2) / 1.2 - i * 0.4); if (q < 0 || q > 1) return; d.style.opacity = 1; at(d, lerp(X[2], X[1], ease(q)), 145 - Math.sin(q * Math.PI) * 18); });
    }
  });
})();
