/* Derivatives explainer: reveal-on-scroll, progress bar, TOC, copy link, plus the graphics:
   market size squares, option payoff explorer, airline hedge, collar, leverage, clearing-house network
   and the open-interest simulator. */
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

/* ---------------- The big number and the real one (squares by area) ---------------- */
(function () {
  const s = document.getElementById('sizeSvg'); if (!s) return;
  const BIG = 300, X0 = 30, Y0 = 20;
  const ITEMS = [
    [846, 'Notional', '$846 trillion', 'The face value payments are calculated on', '#d8d0bf'],
    [21.8, 'Market value', '$21.8 trillion', 'What the contracts were actually worth', '#c2412d'],
    [3.0, 'After netting', '$3.0 trillion', 'Exposure left once offsetting deals cancel', '#5a1408']
  ];
  const fs = NARROW ? 1.5 : 1;
  ITEMS.forEach(([v, name, val, desc, fill], i) => {
    const side = BIG * Math.sqrt(v / 846);
    const sq = mk('rect', { x: X0, y: Y0 + BIG - side, width: side, height: side, fill, class: 'sz-sq' }, s);
    sq.style.setProperty('--i', i);
    // labels down the right-hand side, with a leader line to each square
    const ly = Y0 + 40 + i * 100;
    const tx = X0 + BIG + 40;
    if (i) mk('path', { d: `M${X0 + side} ${Y0 + BIG - side / 2} L${tx - 10} ${ly - 8}`, stroke: MUTED, fill: 'none', 'stroke-width': 1, class: 'sz-lab', style: `--i:${i}` }, s);
    const g = mk('g', { class: 'sz-lab', style: `--i:${i}` }, s);
    say(g, tx, ly - 18, name.toUpperCase(), { 'font-size': 11 * fs, 'font-weight': 800, fill: MUTED, 'letter-spacing': '.1em' });
    say(g, tx, ly + 8 * fs, val, { 'font-size': 24 * fs, 'font-weight': 800, fill: i ? fill : INK });
    if (!NARROW) say(g, tx, ly + 30, desc, { 'font-size': 12, fill: '#5d5a55' });
  });
})();

/* ---------------- Option payoff explorer ---------------- */
(function () {
  const s = document.getElementById('payoffSvg'); const r = document.getElementById('poPrice'); if (!s || !r) return;
  const outV = document.getElementById('poPriceV'), why = document.getElementById('poWhy');
  const K = 100, PREM = 5, L = 70, R = 610, T = 24, B = 240;
  const X = (p) => L + (p - 50) / 100 * (R - L);
  const Y = (v) => T + (55 - v) / 110 * (B - T); // profit range -55..+55
  const fs = NARROW ? 2 : 1;
  if (NARROW) s.setAttribute('viewBox', '0 0 640 345');
  // axes and grid
  [-50, -25, 0, 25, 50].forEach((v) => {
    mk('line', { x1: L, x2: R, y1: Y(v), y2: Y(v), stroke: v ? RULE : '#b9b2a3', 'stroke-width': v ? 1 : 1.5 }, s);
    say(s, L - 8, Y(v) + 4, (v > 0 ? '+' : '') + money(v), { 'text-anchor': 'end', 'font-size': 11 * fs, fill: MUTED });
  });
  [50, 75, 100, 125, 150].forEach((p) => say(s, X(p), B + 18 * fs, '$' + p, { 'text-anchor': 'middle', 'font-size': 11 * fs, fill: MUTED }));
  mk('line', { x1: X(K), x2: X(K), y1: T, y2: B, stroke: '#d8d2c4', 'stroke-dasharray': '3 4' }, s);
  say(s, X(K) + 6, T + 12 * fs, 'strike $100', { 'font-size': 11 * fs, fill: MUTED });
  say(s, (L + R) / 2, B + 40 * fs, 'stock price at expiry →', { 'text-anchor': 'middle', 'font-size': 12 * fs, fill: MUTED });
  const gain = mk('path', { fill: 'rgba(95,138,99,.14)' }, s), loss = mk('path', { fill: 'rgba(194,65,45,.12)' }, s);
  const line = mk('path', { fill: 'none', stroke: RED, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, s);
  const dotLine = mk('line', { stroke: INK, 'stroke-dasharray': '2 3' }, s);
  const dot = mk('circle', { r: 7, fill: INK, stroke: '#fff', 'stroke-width': 2 }, s);
  const tag = say(s, 0, 0, '', { 'font-size': 13 * fs, 'font-weight': 800, 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 4 });
  let kind = 'call', side = 'buy';
  const pay = (p) => {
    const intrinsic = kind === 'call' ? Math.max(0, p - K) : Math.max(0, K - p);
    const v = intrinsic - PREM;
    return Math.max(-55, Math.min(55, side === 'buy' ? v : -v));
  };
  function draw() {
    const pts = []; for (let p = 50; p <= 150; p += 1) pts.push([X(p), Y(pay(p))]);
    line.setAttribute('d', 'M' + pts.map((q) => q.join(' ')).join(' L'));
    // shade gains above zero and losses below zero
    const z = Y(0);
    gain.setAttribute('d', `M${L} ${z} ` + pts.map(([x, y]) => `L${x} ${Math.min(y, z)}`).join(' ') + ` L${R} ${z} Z`);
    loss.setAttribute('d', `M${L} ${z} ` + pts.map(([x, y]) => `L${x} ${Math.max(y, z)}`).join(' ') + ` L${R} ${z} Z`);
    const p = +r.value, v = pay(p); outV.textContent = '$' + p;
    dot.setAttribute('cx', X(p)); dot.setAttribute('cy', Y(v));
    dotLine.setAttribute('x1', X(p)); dotLine.setAttribute('x2', X(p)); dotLine.setAttribute('y1', Y(0)); dotLine.setAttribute('y2', Y(v));
    const right = X(p) < (L + R) / 2;
    tag.setAttribute('x', X(p) + (right ? 12 : -12)); tag.setAttribute('y', Y(v) + (v >= 0 ? -10 : 22));
    tag.setAttribute('text-anchor', right ? 'start' : 'end');
    tag.setAttribute('fill', v > 0 ? '#3f6a45' : v < 0 ? RED : INK);
    tag.textContent = (v > 0 ? 'profit ' : v < 0 ? 'loss ' : '') + money(Math.abs(v));
    const used = kind === 'call' ? p > K : p < K;
    const right_ = kind === 'call' ? 'buy at $100' : 'sell at $100';
    const what = side === 'buy'
      ? (used ? `The buyer uses the right to ${right_} a share worth $${p}, ` + (v > 0 ? `clearing ${money(v)} after the $5 premium.` : `which doesn't yet cover the $5 premium.`)
              : `The right isn't worth using, so the buyer walks away and loses just the $5 premium. That's the most they can ever lose.`)
      : (used ? `The buyer uses the option against you: you must ${kind === 'call' ? 'sell' : 'buy'} at $100 a share worth $${p}. ` + (v < 0 ? `After the premium you're down ${money(-v)}, and ${kind === 'call' ? 'there is no ceiling on how far the price can rise' : 'it gets worse all the way to zero'}.` : `The $5 premium still covers it.`)
              : `The option expires unused and you keep the $5 premium. That's the most a seller can ever make.`);
    why.textContent = what;
  }
  seg('poKind', (v) => { kind = v; draw(); });
  seg('poSide', (v) => { side = v; draw(); });
  r.addEventListener('input', draw);
  draw();
})();

/* ---------------- The airline's hedge ---------------- */
(function () {
  const s = document.getElementById('hedgeSvg'); const r = document.getElementById('hedgePrice'); if (!s || !r) return;
  const outV = document.getElementById('hedgePriceV');
  const GAL = 100, LOCK = 2.5; // million gallons, $/gal
  // labels sit above their bars; costs point left of the zero line, gains right
  // phones get a narrower drawing so the text stays a readable size
  const L = NARROW ? 8 : 20, Z = NARROW ? 225 : 440, SC = NARROW ? 0.5 : 0.95;
  const fs = 1;
  s.setAttribute('viewBox', NARROW ? '0 0 360 230' : '0 0 680 230');
  const rows = [['Fuel bill at the market price', 40], ['Gain or loss on the futures', 112], ['What the airline really pays', 184]];
  rows.forEach(([lab, y]) => say(s, L, y - 8, lab, { 'font-size': 12.5 * fs, 'font-weight': 700, fill: INK }));
  mk('line', { x1: Z, x2: Z, y1: 30, y2: 222, stroke: MUTED }, s);
  const bars = rows.map(([, y]) => mk('rect', { y, height: 30, x: Z, width: 0 }, s));
  const labs = rows.map(([, y]) => say(s, 0, y + 20, '', { 'font-size': 13 * fs, 'font-weight': 800, fill: INK }));
  // a dashed marker at the locked-in cost
  mk('line', { x1: Z - LOCK * GAL * SC, x2: Z - LOCK * GAL * SC, y1: 178, y2: 220, stroke: INK, 'stroke-dasharray': '3 3' }, s);
  function put(i, v, col) {
    const w = Math.abs(v) * SC, b = bars[i], t = labs[i];
    b.setAttribute('x', v >= 0 ? Z : Z - w); b.setAttribute('width', w); b.setAttribute('fill', col);
    // cost bars point left (money out); gains point right
    const out = v < 0;
    const inside = out ? Z - w < (NARROW ? 70 : 110) : Z + w > (NARROW ? 300 : 600);
    t.setAttribute('text-anchor', out !== inside ? 'end' : 'start');
    t.setAttribute('x', out ? (inside ? Z - w + 8 : Z - w - 8) : (inside ? Z + w - 8 : Z + w + 8));
    t.setAttribute('fill', inside ? '#fff' : INK);
  }
  function draw() {
    const p = +r.value; outV.textContent = '$' + p.toFixed(2);
    const bill = -p * GAL, fut = (p - LOCK) * GAL, net = bill + fut;
    put(0, bill, '#9a6a3a'); labs[0].textContent = money(bill) + 'm';
    put(1, fut, fut >= 0 ? GREEN : RED); labs[1].textContent = (fut >= 0 ? '+' : '') + money(fut) + 'm';
    put(2, net, INK); labs[2].textContent = money(net) + (NARROW ? 'm' : 'm, locked in');
  }
  r.addEventListener('input', draw); draw();
})();

/* ---------------- The collar: buy one option, sell the other ---------------- */
(function () {
  const svg = document.getElementById('collarSvg'), r = document.getElementById('colPrice'), who = document.getElementById('colWho'), out = document.getElementById('colOut');
  if (!svg || !r || !who || !out) return;
  const NS = 'http://www.w3.org/2000/svg', PUT = 70, CALL = 80, LO = 50, HI = 100;
  const W = 680, H = 280, X0 = 64, X1 = 650, Y0 = 240, Y1 = 22;
  const x = (p) => X0 + (p - LO) / (HI - LO) * (X1 - X0), y = (p) => Y0 - (p - LO) / (HI - LO) * (Y0 - Y1);
  const FONT = 'Inter, sans-serif';
  const el = (t, a, txt) => { const e = document.createElementNS(NS, t); Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v)); if (txt != null) e.textContent = txt; svg.appendChild(e); return e; };
  let mode = 'air';
  const eff = (p) => Math.min(Math.max(p, PUT), CALL); // either side ends up inside the band
  const usd = (v) => (v < 0 ? '−$' : '$') + Math.abs(v);
  const signed = (v) => (v > 0 ? '+$' + v : v < 0 ? '−$' + (-v) : '$0');
  function draw() {
    const p = +r.value;
    document.getElementById('colPriceV').textContent = '$' + p;
    svg.innerHTML = '';
    // the band the collar keeps the price inside, and a light grid
    el('rect', { x: X0, y: y(CALL), width: X1 - X0, height: y(PUT) - y(CALL), fill: '#f3efe6' });
    [50, 60, 70, 80, 90, 100].forEach((v) => {
      el('line', { x1: X0, x2: X1, y1: y(v), y2: y(v), stroke: '#eee' });
      el('text', { x: X0 - 8, y: y(v) + 4, 'text-anchor': 'end', 'font-size': 12, fill: '#76736c', 'font-family': FONT }, '$' + v);
      el('text', { x: x(v), y: Y0 + 18, 'text-anchor': 'middle', 'font-size': 12, fill: '#76736c', 'font-family': FONT }, '$' + v);
    });
    el('text', { x: X1, y: Y0 + 34, 'text-anchor': 'end', 'font-size': 11.5, fill: '#76736c', 'font-family': FONT }, 'Market price of oil →');
    el('text', { x: X0 + 6, y: Y1 + 4, 'font-size': 11.5, fill: '#76736c', 'font-family': FONT }, mode === 'air' ? '↑ What the airline effectively pays' : '↑ What the producer effectively receives');
    // no hedge: follows the market
    el('line', { x1: x(LO), y1: y(LO), x2: x(HI), y2: y(HI), stroke: '#a9a59c', 'stroke-width': 2, 'stroke-dasharray': '5 5' });
    el('text', { x: x(97), y: y(99) - 4, 'text-anchor': 'end', 'font-size': 12, 'font-weight': 700, fill: '#76736c', 'font-family': FONT }, 'No hedge');
    // the collar: flat, rising, flat
    const col = mode === 'air' ? '#2463d6' : '#2f7a4a';
    el('polyline', { points: `${x(LO)},${y(PUT)} ${x(PUT)},${y(PUT)} ${x(CALL)},${y(CALL)} ${x(HI)},${y(CALL)}`, fill: 'none', stroke: col, 'stroke-width': 4, 'stroke-linejoin': 'round' });
    el('text', { x: x(HI) - 4, y: y(CALL) - 8, 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 800, fill: col, 'font-family': FONT }, mode === 'air' ? 'Ceiling $80 (bought call)' : 'Cap $80 (sold call)');
    el('text', { x: x(LO) + 4, y: y(PUT) + 18, 'font-size': 12.5, 'font-weight': 800, fill: col, 'font-family': FONT }, mode === 'air' ? 'Floor $70 (sold put)' : 'Floor $70 (bought put)');
    // where the slider is: grey dot on the no-hedge line, coloured dot on the collar
    el('line', { x1: x(p), x2: x(p), y1: Y1 + 10, y2: Y0, stroke: '#111', 'stroke-dasharray': '3 3' });
    el('circle', { cx: x(p), cy: y(p), r: 5, fill: '#fff', stroke: '#a9a59c', 'stroke-width': 2 });
    el('circle', { cx: x(p), cy: y(eff(p)), r: 7, fill: col, stroke: '#fff', 'stroke-width': 2 });

    const call = Math.max(p - CALL, 0), put = Math.max(PUT - p, 0);
    let rows, why;
    if (mode === 'air') {
      rows = [['Buys fuel at the market', usd(-p)], ['Call it bought ($80)', signed(call)], ['Put it sold ($70)', signed(-put)], ['Net cost per barrel', '$' + eff(p)]];
      why = p > CALL ? `Oil is above $80, so the call pays the airline $${call}. Its fuel effectively costs $80, the ceiling.`
        : p < PUT ? `Oil is below $70, so the buyer of the put collects $${put} from the airline. But the airline is buying fuel at $${p}, so its cost is still $70: it has given up the savings below the floor, not lost money overall.`
        : 'Between $70 and $80 neither option pays. The airline simply pays the market price.';
    } else {
      rows = [['Sells oil at the market', '+$' + p], ['Put it bought ($70)', signed(put)], ['Call it sold ($80)', signed(-call)], ['Net received per barrel', '$' + eff(p)]];
      why = p < PUT ? `Oil is below $70, so the put pays the producer $${put}. It effectively receives $70, the floor.`
        : p > CALL ? `Oil is above $80, so the producer pays $${call} to the buyer of its call. It still sells at $${p}, so it receives $80: it has given up the gains above the cap.`
        : 'Between $70 and $80 neither option pays. The producer simply gets the market price.';
    }
    out.innerHTML = `<div class="col-grid">${rows.map(([k, v], i) => `<div${i === 3 ? ' class="net"' : ''}><span>${k}</span><b>${v}</b></div>`).join('')}</div><p class="po-why">${why}</p>`;
  }
  who.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    who.querySelectorAll('button').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
    mode = b.dataset.v; draw();
  });
  r.addEventListener('input', draw); draw();
})();

/* ---------------- Leverage ---------------- */
(function () {
  const s = document.getElementById('levSvg'); const r = document.getElementById('levMove'); if (!s || !r) return;
  const outV = document.getElementById('levMoveV'), why = document.getElementById('levWhy');
  const POS = 100000;
  const L = 20, Z = 340, HALF = 300; // bars centred on Z; full width = 100%
  const fs = NARROW ? 2 : 1;
  say(s, L, 34, 'Oil price', { 'font-size': 12 * fs, 'font-weight': 700, fill: INK });
  say(s, L, 114, 'Your deposit', { 'font-size': 12 * fs, 'font-weight': 700, fill: INK });
  [-100, -50, 0, 50, 100].forEach((v) => {
    mk('line', { x1: Z + v / 100 * HALF, x2: Z + v / 100 * HALF, y1: 44, y2: 170, stroke: v ? RULE : MUTED }, s);
    say(s, Z + v / 100 * HALF, 186, (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v) + '%', { 'text-anchor': 'middle', 'font-size': 10.5 * fs, fill: MUTED });
  });
  const pb = mk('rect', { y: 44, height: 30 }, s), db = mk('rect', { y: 124, height: 30 }, s);
  const pt = say(s, 0, 64, '', { 'font-size': 13 * fs, 'font-weight': 800 }), dt = say(s, 0, 144, '', { 'font-size': 13 * fs, 'font-weight': 800 });
  const wipe = mk('rect', { x: Z - HALF, y: 120, width: HALF * 2, height: 38, fill: 'none', stroke: '#5a1408', 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: 0 }, s);
  let margin = 10;
  const bar = (rect, txt, pct, label) => {
    const c = Math.max(-100, Math.min(100, pct)), w = Math.abs(c) / 100 * HALF;
    rect.setAttribute('x', c >= 0 ? Z : Z - w); rect.setAttribute('width', w); rect.setAttribute('fill', pct >= 0 ? GREEN : pct <= -100 ? '#5a1408' : RED);
    const inside = w > 200;
    txt.setAttribute('text-anchor', (c >= 0) === inside ? 'end' : 'start');
    txt.setAttribute('x', c >= 0 ? (inside ? Z + w - 8 : Z + w + 8) : (inside ? Z - w + 8 : Z - w - 8));
    txt.setAttribute('fill', inside ? '#fff' : INK); txt.textContent = label;
  };
  function draw() {
    const m = +r.value; outV.textContent = (m > 0 ? '+' : m < 0 ? '−' : '') + Math.abs(m) + '%';
    const dep = POS * margin / 100, pnl = POS * m / 100, ret = pnl / dep * 100;
    bar(pb, pt, m, (m > 0 ? '+' : m < 0 ? '−' : '') + Math.abs(m) + '%');
    bar(db, dt, ret, ret <= -100 ? 'all gone' : (ret > 0 ? '+' : ret < 0 ? '−' : '') + Math.abs(Math.round(ret)) + '%');
    wipe.setAttribute('opacity', ret <= -100 ? 1 : 0);
    const x = Math.round(100 / margin);
    why.innerHTML = margin === 100
      ? `Paying the full $100,000, your money moves exactly with the price: ${Math.abs(m)}% ${m < 0 ? 'down' : 'up'}.`
      : `With $${dep.toLocaleString('en-US')} down you control $100,000 of oil, so every move is magnified <b>${x} times</b>. ` +
        (ret <= -100 ? `A ${Math.abs(m)}% fall wipes out the whole deposit${ret < -100 ? `, and you still owe <b>$${Math.round(-pnl - dep).toLocaleString('en-US')}</b> more` : ''}. Long before this, the broker would have made a margin call.`
          : m < 0 ? `A ${Math.abs(m)}% fall costs ${Math.abs(Math.round(ret))}% of your money.` : m > 0 ? `A ${m}% rise makes ${Math.round(ret)}% on your money.` : 'Move the slider.');
  }
  seg('levM', (v) => { margin = +v; draw(); });
  r.addEventListener('input', draw); draw();
})();

/* ---------------- Clearing house: from a tangle to a hub ---------------- */
(function () {
  const s = document.getElementById('ccpSvg'); if (!s) return;
  const why = document.getElementById('ccpWhy'), failBtn = document.getElementById('ccpFail');
  const N = 8, CX = 340, CY = 165, RAD = 130;
  const P = [...Array(N)].map((_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / N; return [CX + RAD * (NARROW ? 1.05 : 1.55) * Math.cos(a), CY + RAD * Math.sin(a)]; });
  if (NARROW) s.setAttribute('viewBox', '160 0 360 330');
  // a fixed web of bilateral deals
  const EDGES = [[0, 1], [0, 2], [0, 4], [0, 5], [1, 2], [1, 3], [1, 6], [2, 3], [2, 5], [2, 7], [3, 4], [3, 6], [4, 5], [4, 7], [5, 6], [6, 7], [0, 7], [1, 5], [3, 7]];
  const web = mk('g', {}, s), hubG = mk('g', {}, s), nodes = mk('g', {}, s);
  const webLines = EDGES.map(([a, b]) => mk('line', { x1: P[a][0], y1: P[a][1], x2: P[b][0], y2: P[b][1], stroke: '#9a9385', 'stroke-width': 1.8 }, web));
  const spokes = P.map(([x, y]) => mk('line', { x1: x, y1: y, x2: CX, y2: CY, stroke: '#5d7fae', 'stroke-width': 2.2 }, hubG));
  const hub = mk('g', {}, hubG);
  mk('circle', { cx: CX, cy: CY, r: 42, fill: '#2f4a7a' }, hub);
  say(hub, CX, CY - 3, 'CLEARING', { 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: '#fff', 'letter-spacing': '.08em' });
  say(hub, CX, CY + 11, 'HOUSE', { 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: '#fff', 'letter-spacing': '.08em' });
  const shield = mk('circle', { cx: CX, cy: CY, r: 52, fill: 'none', stroke: '#5f8a63', 'stroke-width': 4, opacity: 0 }, hubG);
  const banks = P.map(([x, y], i) => {
    const g = mk('g', { transform: `translate(${x} ${y})` }, nodes);
    const c = mk('circle', { r: 22, fill: '#fff', stroke: INK, 'stroke-width': 2 }, g);
    c.label = say(g, 0, 5, 'Bank ' + 'ABCDEFGH'[i], { 'text-anchor': 'middle', 'font-size': NARROW ? 12 : 10, 'font-weight': 800, fill: INK });
    if (NARROW) c.setAttribute('r', 26);
    return c;
  });
  let mode = 'web', timers = [];
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  function reset() {
    clear();
    web.style.display = mode === 'web' ? '' : 'none'; hubG.style.display = mode === 'hub' ? '' : 'none';
    banks.forEach((c) => { c.setAttribute('fill', '#fff'); c.setAttribute('stroke', INK); c.label.setAttribute('fill', INK); });
    webLines.forEach((l) => { l.setAttribute('stroke', '#9a9385'); l.setAttribute('stroke-width', 1.8); });
    spokes.forEach((l) => l.setAttribute('stroke', '#5d7fae'));
    shield.setAttribute('opacity', 0);
    why.textContent = mode === 'web'
      ? `Eight banks, ${EDGES.length} separate contracts between them. Each bank knows its own deals, but nobody sees the whole web.`
      : 'Every contract now runs through the clearing house: eight links instead of nineteen, each backed by collateral settled daily.';
  }
  const later = (ms, fn) => timers.push(setTimeout(fn, reduced ? 0 : ms));
  function fail() {
    reset();
    const F = 2;
    banks[F].setAttribute('fill', '#5a1408'); banks[F].setAttribute('stroke', '#5a1408'); banks[F].label.setAttribute('fill', '#fff');
    if (mode === 'web') {
      // the shock travels along the links: first neighbours, then theirs
      const hit = new Set([F]); let wave = [F];
      for (let step = 1; step <= 2; step++) {
        const next = [];
        EDGES.forEach(([a, b], k) => {
          const from = wave.includes(a) ? a : wave.includes(b) ? b : -1; if (from < 0) return;
          const to = from === a ? b : a;
          later(step * 700, () => { webLines[k].setAttribute('stroke', RED); webLines[k].setAttribute('stroke-width', 3); });
          if (!hit.has(to)) { hit.add(to); next.push(to); later(step * 700 + 350, () => { banks[to].setAttribute('fill', step === 1 ? '#f0b8ab' : '#f7dcd4'); banks[to].setAttribute('stroke', RED); }); }
        });
        wave = next;
      }
      later(1800, () => { why.textContent = `Bank C fails. Its ${EDGES.filter(([a, b]) => a === F || b === F).length} counterparties take losses at once, some of them wobble, and the strain spreads to their own counterparties. Everyone starts pulling back from everyone, the way markets froze around AIG in 2008.`; });
    } else {
      later(500, () => spokes[F].setAttribute('stroke', RED));
      later(1000, () => shield.setAttribute('opacity', 1));
      later(1400, () => { why.textContent = 'Bank C fails. The clearing house uses C\'s collateral, then a shared default fund, to cover what C owed, and keeps paying everyone else. The other seven banks never meet C\'s losses directly.'; });
    }
  }
  seg('ccpMode', (v) => { mode = v; reset(); });
  if (failBtn) failBtn.addEventListener('click', fail);
  reset();
})();

/* ---------------- Open interest simulator ---------------- */
(function () {
  const s = document.getElementById('oiSvg'); if (!s) return;
  const why = document.getElementById('oiWhy');
  const NAMES = ['Ana', 'Ben', 'Cy', 'Dev', 'Eve', 'Fay', 'Gus', 'Hal', 'Ivy', 'Jo', 'Kai', 'Lu', 'Max', 'Nia', 'Oz', 'Pia'];
  let open = [], vol = 0, nextName = 0, day = 1;
  const W = mk('g', {}, s);
  // counters
  const box = (x, label) => {
    mk('rect', { x, y: 12, width: 150, height: 70, rx: 8, fill: '#fff', stroke: '#d8d2c4', 'stroke-width': 2 }, s);
    say(s, x + 14, 34, label, { 'font-size': 10.5, 'font-weight': 800, fill: MUTED, 'letter-spacing': '.08em' });
    return say(s, x + 14, 70, '0', { 'font-size': 30, 'font-weight': 800, fill: INK });
  };
  if (NARROW) s.setAttribute('viewBox', '0 0 340 250');
  const MID = NARROW ? 170 : 340, LX = NARROW ? 90 : 218, RX = NARROW ? 250 : 462;
  const volT = box(NARROW ? 10 : 120, 'VOLUME TODAY');
  const oiT = box(NARROW ? 180 : 410, 'OPEN INTEREST');
  const dayT = say(s, MID, NARROW ? 104 : 50, '', { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: MUTED });
  const who = () => NAMES[nextName++ % NAMES.length];
  function flash(t) { if (reduced) return; t.animate([{ fill: '#c2412d' }, { fill: INK }], { duration: 700 }); }
  function render() {
    W.innerHTML = '';
    volT.textContent = vol; oiT.textContent = open.length; dayT.textContent = 'Day ' + day;
    open.slice(-6).forEach((c, i) => {
      const y = (NARROW ? 126 : 118) + i * 18;
      say(W, LX - 8, y + 4, c.buyer, { 'text-anchor': 'end', 'font-size': 12, 'font-weight': 700, fill: '#2f4a7a' });
      mk('line', { x1: LX, x2: RX, y1: y, y2: y, stroke: c.fresh ? RED : '#9a9385', 'stroke-width': 2.2 }, W);
      say(W, RX + 8, y + 4, c.seller, { 'font-size': 12, 'font-weight': 700, fill: '#7a4a1a' });
      c.fresh = false;
    });
    if (open.length > 6) say(W, MID, NARROW ? 244 : 228, `+ ${open.length - 6} more`, { 'text-anchor': 'middle', 'font-size': 11, fill: MUTED });
    if (!open.length) say(W, MID, 160, 'No open contracts', { 'text-anchor': 'middle', 'font-size': 13, fill: MUTED });
  }
  const ACT = {
    open() { const c = { buyer: who(), seller: who(), fresh: true }; open.push(c); vol++; flash(volT); flash(oiT); return `${c.buyer} buys and ${c.seller} sells a brand-new contract. Volume +1, open interest +1.`; },
    pass() {
      if (!open.length) return 'There are no open contracts to sell on yet. Open one first.';
      const c = open[open.length - 1], old = c.buyer; c.buyer = who(); c.fresh = true; vol++; flash(volT);
      return `${old} sells their side to ${c.buyer}. A trade happened, so volume +1, but it's the same contract with a new owner: open interest unchanged.`;
    },
    close() {
      if (!open.length) return 'Nothing to close.';
      const c = open.pop(); vol++; flash(volT); flash(oiT);
      return `${c.buyer} and ${c.seller} close out their contract with offsetting trades. Volume +1, open interest −1.`;
    },
    day() { day++; vol = 0; return 'A new day: volume resets to zero, but every open contract carries over. Open interest is the stock of obligations; volume is the flow of trading.'; }
  };
  document.querySelectorAll('.oi-btns button').forEach((b) => b.addEventListener('click', () => { why.textContent = ACT[b.dataset.a](); render(); }));
  ACT.open(); ACT.open(); vol = 0; render();
})();
