/* Short selling explainer: reveal-on-scroll, progress bar, TOC, copy link, plus the graphics:
   the animated short sale, short vs put payoff, and the days-to-cover calculator. */

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

/* ---------------- Short selling: the seven steps, animated ---------------- */
(function () {
  const s = document.getElementById('ssSvg'), tabsBox = document.getElementById('ssTabs'); if (!s || !tabsBox) return;
  const say_ = document.getElementById('ssSay'), play = document.getElementById('ssPlay');
  const tabs = [...tabsBox.querySelectorAll('[role=tab]')], ind = tabsBox.querySelector('.ss-ind');
  const sums = [...document.querySelectorAll('.ss-sum [data-s]')];
  const fs = NARROW ? 1.9 : 1;
  if (NARROW) s.setAttribute('viewBox', '0 0 680 320');
  // box and chip geometry (bigger on phones, where the svg is drawn at half size)
  const BW = NARROW ? 214 : 160, BH = NARROW ? 106 : 92, TY = NARROW ? 128 : 120, LY = NARROW ? [160, 190] : [146, 168];
  const CW = NARROW ? 118 : 72, CH = NARROW ? 40 : 28, CY = NARROW ? 214 : 198, CO = NARROW ? 64 : 40, BY = NARROW ? 296 : 272;
  const COL = ['#76736c', ...tabs.map((t) => t.style.getPropertyValue('--c'))];
  const PX = { broker: 105, you: 340, market: 575 };

  // price panel with a sparkline
  const PL = NARROW ? 150 : 200, PW = NARROW ? 380 : 280, PH = NARROW ? 84 : 70;
  mk('rect', { x: PL, y: 4, width: PW, height: PH, fill: '#fff', stroke: RULE }, s);
  say(s, PL + 14, NARROW ? 30 : 24, 'SHARE PRICE', { 'font-size': 10.5 * fs, 'font-weight': 800, fill: MUTED, 'letter-spacing': '.1em' });
  const priceT = say(s, PL + 14, NARROW ? 74 : 62, '$100', { 'font-size': NARROW ? 40 : 28, 'font-weight': 800, fill: INK });
  const SX0 = NARROW ? 300 : 330, SX1 = NARROW ? 516 : 466, SY = (p) => (NARROW ? 78 : 68) - (p - 40) / 130 * (NARROW ? 60 : 52);
  mk('line', { x1: SX0, x2: SX1, y1: SY(100), y2: SY(100), stroke: RULE, 'stroke-dasharray': '3 3' }, s);
  const spark = mk('path', { fill: 'none', stroke: INK, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, s);

  // the three parties
  const boxes = {};
  function party(key, title, sub) {
    const g = mk('g', {}, s), x = PX[key] - BW / 2;
    const r = mk('rect', { x, y: 96, width: BW, height: BH, rx: 10, fill: '#fff', stroke: RULE, 'stroke-width': 2, class: 'ss-box' }, g);
    say(g, PX[key], TY, title, { 'text-anchor': 'middle', 'font-size': 12 * fs, 'font-weight': 800, fill: INK, 'letter-spacing': '.1em' });
    const lines = [say(g, PX[key], LY[0], sub[0], { 'text-anchor': 'middle', 'font-size': 12 * fs, fill: '#5d5a55' }),
      say(g, PX[key], LY[1], sub[1] || '', { 'text-anchor': 'middle', 'font-size': 12 * fs, fill: '#5d5a55' })];
    boxes[key] = { r, lines };
  }
  party('broker', 'BROKER', NARROW ? ['lends', 'the share'] : ['lends a share from', 'another investor']);
  party('you', 'YOU', ['', '']);
  party('market', 'MARKET', NARROW ? ['buyers,', 'sellers'] : ['other buyers', 'and sellers']);

  // tokens that travel between the parties
  function chip(label, fill, dx) {
    const g = mk('g', { class: 'ss-tok' }, s);
    mk('rect', { x: dx - CW / 2, y: CY, width: CW, height: CH, rx: CH / 2, fill }, g);
    const t = say(g, dx, CY + CH / 2 + 4.5 * fs, label, { 'text-anchor': 'middle', 'font-size': 12 * fs, 'font-weight': 800, fill: '#fff' });
    return { g, t };
  }
  const share = chip('1 share', '#2f5f9e', -CO), cash = chip('$100', '#3f6a45', CO), cash2 = chip('$70', '#3f6a45', CO);
  const badge = say(s, 340, BY, '', { 'text-anchor': 'middle', 'font-size': 17 * fs, 'font-weight': 800 });
  const place = (tok, where, show = true) => { tok.g.style.transform = `translate(${PX[where]}px,0)`; tok.g.style.opacity = show ? 1 : 0; };

  const FLAT = [100, 100, 100, 100], DOWN = [100, 100, 100, 100, 95, 88, 82, 76, 72, 70], UP = [100, 100, 100, 100, 108, 117, 128, 140, 151, 160];
  // what the scene looks like after each step
  const ST = [
    { sh: 'broker', c1: 'market', c2: ['you', 0], p: FLAT, cash: '$0', owe: 'Owe: nothing', on: [], say: 'Press play to watch a short sale, one step at a time.' },
    { sh: 'you', c1: 'market', c2: ['you', 0], p: FLAT, cash: '$0', owe: 'Owe: 1 share', on: ['broker', 'you'], say: 'You borrow one share from your broker, who finds it in another investor’s account. You now owe one share, not a sum of money.' },
    { sh: 'market', c1: 'you', c2: ['you', 0], p: FLAT, cash: '$100', owe: 'Owe: 1 share', on: ['you', 'market'], say: 'You sell the borrowed share in the market at today’s price, and receive $100.' },
    { sh: 'market', c1: 'you', c2: ['you', 0], p: DOWN, cash: '$100', owe: 'Owe: 1 share', on: [], say: 'You expected the price to fall, and it does: from $100 to $70.' },
    { sh: 'you', c1: ['you', 0], c2: ['market', 1], p: DOWN, cash: '$30', owe: 'Owe: 1 share', on: ['you', 'market'], say: 'You buy one share back in the market for $70.' },
    { sh: 'broker', c1: ['you', 0], c2: ['market', 1], p: DOWN, cash: '$30', owe: 'Owe: nothing', on: ['you', 'broker'], say: 'You return the share to your broker. The loan is repaid and your short position is closed.' },
    { sh: 'broker', c1: ['you', 0], c2: ['market', 1], p: DOWN, cash: '$30', owe: 'Owe: nothing', on: ['you'], badge: [NARROW ? '+$30, less fees' : '+$30, less fees and interest', '#3f6a45'], say: 'You keep the difference between selling at $100 and buying at $70: $30, less the borrowing fee and interest.' },
    { sh: 'market', c1: 'you', c2: ['you', 0], p: UP, cash: '$100', owe: 'Owe: 1 share', on: ['you'], badge: [NARROW ? '−$60, and no ceiling' : 'Buy back at $160: −$60, and no ceiling', RED], say: 'But if the price rises instead, you still owe the share. At $160, buying it back costs $60 more than you sold it for, and a price can keep rising with no limit, so the loss can too.' }
  ];

  let cur = 0, timer = null, tween = null, shownPrice = 100;
  function showPrice(target, col) {
    cancelAnimationFrame(tween);
    const from = shownPrice, t0 = performance.now(), dur = reduced ? 0 : 900;
    const tick = (t) => {
      const k = dur ? Math.min(1, (t - t0) / dur) : 1;
      shownPrice = Math.round(lerp(from, target, ease(k)));
      priceT.textContent = '$' + shownPrice; priceT.setAttribute('fill', col);
      if (k < 1) tween = requestAnimationFrame(tick);
    };
    tween = requestAnimationFrame(tick);
  }
  function moveInd() {
    const t = tabs[Math.max(0, cur - 1)];
    ind.style.opacity = cur ? 1 : 0;
    ind.style.transform = `translateX(${t.offsetLeft}px)`; ind.style.width = t.offsetWidth + 'px';
    ind.style.background = COL[cur];
    if (cur && tabsBox.scrollWidth > tabsBox.clientWidth) tabsBox.scrollTo({ left: t.offsetLeft - 24, behavior: reduced ? 'auto' : 'smooth' });
  }
  function go(n) {
    cur = n; const st = ST[n];
    tabs.forEach((t, i) => { const on = i + 1 === n; t.setAttribute('aria-selected', on); t.tabIndex = on || (!n && !i) ? 0 : -1; });
    sums.forEach((e) => e.classList.toggle('on', +e.dataset.s === n));
    moveInd();
    place(share, st.sh);
    Array.isArray(st.c1) ? place(cash, st.c1[0], st.c1[1]) : place(cash, st.c1);
    place(cash2, st.c2[0], st.c2[1]);
    const pts = st.p.map((p, i) => `${SX0 + i * (SX1 - SX0) / 9} ${SY(p)}`);
    spark.setAttribute('d', 'M' + pts.join(' L'));
    const last = st.p[st.p.length - 1], pc = last > 100 ? RED : last < 100 ? '#3f6a45' : INK;
    spark.setAttribute('stroke', pc);
    showPrice(last, pc);
    boxes.you.lines[0].textContent = 'Cash: ' + st.cash; boxes.you.lines[1].textContent = NARROW ? st.owe.replace('Owe: nothing', 'Owes nothing').replace('Owe: ', 'Owes ') : st.owe;
    Object.entries(boxes).forEach(([k, b]) => b.r.setAttribute('stroke', st.on.includes(k) ? COL[n] : RULE));
    badge.textContent = st.badge ? st.badge[0] : ''; badge.setAttribute('fill', st.badge ? st.badge[1] : INK);
    if (!reduced && st.badge) badge.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: 'ease-out' });
    say_.textContent = st.say;
  }
  function stop(label) { clearInterval(timer); timer = null; play.textContent = label || '▶ Play'; }
  function start() {
    if (cur === 0 || cur === 7) go(1); else go(cur + 1);
    play.textContent = '❚❚ Pause';
    timer = setInterval(() => { if (cur >= 7) stop('↺ Replay'); else { go(cur + 1); if (cur >= 7) stop('↺ Replay'); } }, 3200);
    if (cur >= 7) stop('↺ Replay');
  }
  play.addEventListener('click', () => (timer ? stop() : start()));
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => { stop(); go(i + 1); });
    t.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1, Home: -99, End: 99 }[e.key]; if (!d) return;
      e.preventDefault(); stop();
      const n = Math.max(1, Math.min(7, (cur || 1) + d)); go(n); tabs[n - 1].focus();
    });
  });
  addEventListener('resize', moveInd);
  go(0);
  // play once by itself the first time it comes into view (not with reduced motion)
  if (!reduced) {
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); if (!cur) setTimeout(start, 500); } }, { threshold: 0.6 });
    io.observe(s);
  }
})();

/* ---------------- Short selling: lopsided risk, short vs put ---------------- */
(function () {
  const s = document.getElementById('shortSvg'); const r = document.getElementById('shPrice'); if (!s || !r) return;
  const outV = document.getElementById('shPriceV'), why = document.getElementById('shWhy');
  const K = 100, PREM = 5, L = 70, R = 610, T = 24, B = 240, PMAX = 250, VMIN = -150, VMAX = 150;
  const X = (p) => L + p / PMAX * (R - L);
  const Y = (v) => T + (VMAX - v) / (VMAX - VMIN) * (B - T);
  const fs = NARROW ? 2 : 1;
  if (NARROW) s.setAttribute('viewBox', '0 0 640 345');
  [-150, -100, -50, 0, 50, 100, 150].forEach((v) => {
    mk('line', { x1: L, x2: R, y1: Y(v), y2: Y(v), stroke: v ? RULE : '#b9b2a3', 'stroke-width': v ? 1 : 1.5 }, s);
    if (!NARROW || v % 100 === 0) say(s, L - 8, Y(v) + 4, (v > 0 ? '+' : '') + money(v), { 'text-anchor': 'end', 'font-size': 11 * fs, fill: MUTED });
  });
  [0, 50, 100, 150, 200, 250].forEach((p) => say(s, X(p), B + 18 * fs, '$' + p, { 'text-anchor': 'middle', 'font-size': 11 * fs, fill: MUTED }));
  mk('line', { x1: X(K), x2: X(K), y1: T, y2: B, stroke: '#d8d2c4', 'stroke-dasharray': '3 4' }, s);
  say(s, X(K) + 6, T + 12 * fs, NARROW ? '$100' : 'sold or bought at $100', { 'font-size': 11 * fs, fill: MUTED });
  say(s, (L + R) / 2, B + 40 * fs, 'share price later →', { 'text-anchor': 'middle', 'font-size': 12 * fs, fill: MUTED });
  // the buyer's line, faint, for comparison
  mk('path', { d: `M${X(0)} ${Y(-100)} L${X(PMAX)} ${Y(Math.min(VMAX, PMAX - K))}`, fill: 'none', stroke: '#b9b2a3', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, s);
  say(s, X(240), Y(140) + 22 * fs, 'buyer', { 'text-anchor': 'end', 'font-size': 11 * fs, fill: MUTED, 'font-weight': 700 });
  const line = mk('path', { fill: 'none', stroke: RED, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, s);
  const off = say(s, X(195), Y(-135), '', { 'text-anchor': 'end', 'font-size': 11 * fs, fill: RED, 'font-weight': 700 });
  const dotLine = mk('line', { stroke: INK, 'stroke-dasharray': '2 3' }, s);
  const dot = mk('circle', { r: 7, fill: INK, stroke: '#fff', 'stroke-width': 2 }, s);
  const tag = say(s, 0, 0, '', { 'font-size': 13 * fs, 'font-weight': 800, 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 4 });
  let way = 'short';
  const pay = (p) => (way === 'short' ? K - p : Math.max(0, K - p) - PREM);
  const clip = (v) => Math.max(VMIN, Math.min(VMAX, v));
  function draw() {
    const pts = []; for (let p = 0; p <= PMAX; p += 1) pts.push([X(p), Y(clip(pay(p)))]);
    line.setAttribute('d', 'M' + pts.map((q) => q.join(' ')).join(' L'));
    off.textContent = way === 'short' && !NARROW ?'loss keeps growing ↓' : '';
    const p = +r.value, v = pay(p); outV.textContent = '$' + p;
    const cy = Y(clip(v));
    dot.setAttribute('cx', X(p)); dot.setAttribute('cy', cy);
    dotLine.setAttribute('x1', X(p)); dotLine.setAttribute('x2', X(p)); dotLine.setAttribute('y1', Y(0)); dotLine.setAttribute('y2', cy);
    const right = X(p) < (L + R) / 2;
    tag.setAttribute('x', X(p) + (right ? 12 : -12)); tag.setAttribute('y', cy + (v >= 0 ? -10 : 22));
    tag.setAttribute('text-anchor', right ? 'start' : 'end');
    tag.setAttribute('fill', v > 0 ? '#3f6a45' : v < 0 ? RED : INK);
    tag.textContent = (v > 0 ? 'profit ' : v < 0 ? 'loss ' : '') + money(Math.abs(v));
    if (way === 'short') {
      why.textContent = p < K
        ? `You buy the share back for $${p} and keep ${money(K - p)}. ` + (p === 0 ? 'That\'s the best case: the company is worthless and you keep the whole $100.' : 'The most you can ever make is $100, if the share goes to zero.')
        : p === K ? 'The price hasn\'t moved, so you break even before fees.'
        : `You must buy back at $${p}, a loss of ${money(p - K)}. ` + (p > 200 ? 'You\'ve now lost more than the $100 you sold for, and the loss keeps growing with every dollar the price climbs.' : 'Every dollar the price climbs adds a dollar to the loss, with no limit.');
    } else {
      why.textContent = p < K
        ? `You use the right to sell at $100 a share worth $${p}. ` + (v > 0 ? `After the $5 premium you make ${money(v)}, $5 less than a short sale would.` : 'That doesn\'t yet cover the $5 premium.')
        : 'The put isn\'t worth using, so you let it expire. You lose the $5 premium and nothing more, however high the price goes. That\'s the cost of capping the risk.';
    }
  }
  seg('shWay', (v) => { way = v; draw(); });
  r.addEventListener('input', draw);
  draw();
})();

/* ---------------- Days to cover: one square per trading day ---------------- */
(function () {
  const s = document.getElementById('dtcSvg'), si = document.getElementById('dtcSi'), vol = document.getElementById('dtcVol'); if (!s || !si || !vol) return;
  const why = document.getElementById('dtcWhy');
  const fs = NARROW ? 1.6 : 1, COLS = 10, SQ = 34, GAP = 7, X0 = NARROW ? 232 : 210, Y0 = 14;
  const big = say(s, 4, 74, '', { 'font-size': 46 * fs, 'font-weight': 800, fill: INK });
  say(s, 4, 74 + 26 * fs, 'days to cover', { 'font-size': 13 * fs, fill: MUTED, 'font-weight': 600 });
  const more = say(s, 4, 74 + 48 * fs, '', { 'font-size': 11 * fs, fill: RED, 'font-weight': 700 });
  const sqs = [];
  for (let i = 0; i < 30; i++) {
    const x = X0 + (i % COLS) * (SQ + GAP), y = Y0 + Math.floor(i / COLS) * (SQ + GAP);
    sqs.push(mk('rect', { x, y, width: SQ, height: SQ, rx: 4, fill: RULE }, s));
  }
  say(s, X0, Y0 + 3 * (SQ + GAP) + 12 * fs, 'each square = one normal trading day', { 'font-size': 11 * fs, fill: MUTED });
  function draw() {
    const a = +si.value, b = +vol.value, d = a / b;
    document.getElementById('dtcSiV').textContent = a + '%';
    document.getElementById('dtcVolV').textContent = b + '%';
    big.textContent = d < 10 ? d.toFixed(1) : Math.round(d).toString();
    big.setAttribute('fill', d > 30 ? RED : INK);
    sqs.forEach((q, i) => {
      const f = Math.max(0, Math.min(1, d - i));
      q.setAttribute('fill', f >= 1 ? (d > 30 ? RED : INK) : f > 0 ? '#8a8578' : RULE);
      q.setAttribute('opacity', f > 0 && f < 1 ? 0.35 + 0.65 * f : 1);
    });
    more.textContent = d > 30 ? `+ ${Math.round(d - 30)} more days` : '';
    let t = `Short sellers owe ${a}% of the shares available to trade. On a normal day ${b}% change hands, so even if every trade were a short seller buying back, it would take ${d < 10 ? d.toFixed(1) : Math.round(d)} trading days.`;
    if (a > 100) t += ' Short interest above 100% is possible because shares that are lent and sold can be lent again, as happened with GameStop.';
    else if (d >= 10) t += ' That is a long queue for the exit if the price starts to rise.';
    else if (d <= 2) t += ' Shorts could get out quickly without moving the price much.';
    why.textContent = t;
  }
  si.addEventListener('input', draw); vol.addEventListener('input', draw);
  draw();
})();
