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
