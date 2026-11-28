/* Bank-run explainer: reveal-on-scroll, progress bar, TOC, copy link, plus the graphics:
   the run simulator (a balance sheet under withdrawals) and the anti-run toolkit tabs. */

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

/* ---------------- The run simulator: a balance sheet under withdrawals ---------------- */
(function () {
  const s = document.getElementById('runSvg'), r = document.getElementById('runPct'); if (!s || !r) return;
  const why = document.getElementById('runWhy'), outV = document.getElementById('runPctV');
  const fs = NARROW ? 1.6 : 1;
  if (NARROW) s.setAttribute('viewBox', '0 0 680 380');
  const BASE = NARROW ? 330 : 290, K = (NARROW ? 230 : 220) / 110; // px per $
  const AX = 90, CX = 390, W = 190;
  const COL = { cash: '#3f6a45', bonds: '#2f5f9e', loans: '#b08a2e', dep: '#8a8578', cb: '#6a4a9a', cap: INK, hole: RED };
  const NAME = { cash: 'Cash', bonds: 'Bonds', loans: 'Loans', dep: 'Deposits', cb: 'Central bank loan', cap: 'Capital', hole: 'Shortfall' };
  mk('line', { x1: 40, x2: 640, y1: BASE, y2: BASE, stroke: '#b9b2a3', 'stroke-width': 1.5 }, s);
  say(s, AX + W / 2, BASE + 22 * fs, 'What the bank owns', { 'text-anchor': 'middle', 'font-size': 12 * fs, 'font-weight': 700, fill: MUTED });
  say(s, CX + W / 2, BASE + 22 * fs, NARROW ? 'What it owes' : 'What it owes, and its capital', { 'text-anchor': 'middle', 'font-size': 12 * fs, 'font-weight': 700, fill: MUTED });
  // the bank's size before the run, for scale
  [AX, CX].forEach((x) => mk('rect', { x, y: BASE - 110 * K, width: W, height: 110 * K, fill: 'none', stroke: '#cfc8b8', 'stroke-dasharray': '4 4' }, s));
  [AX, CX].forEach((x) => say(s, x + W / 2, BASE - 110 * K - 6, 'before the run: $110', { 'text-anchor': 'middle', 'font-size': 11 * fs, fill: MUTED }));
  const status = say(s, 40, 26 * fs, '', { 'font-size': 15 * fs, 'font-weight': 800 });
  const paidT = say(s, 640, 26 * fs, '', { 'text-anchor': 'end', 'font-size': 12 * fs, fill: MUTED, 'font-weight': 600 });
  const seg_ = {};
  function bar(key, x) {
    const g = mk('g', {}, s);
    const rect = mk('rect', { x, y: BASE, width: W, height: 0, fill: COL[key], class: 'bar' }, g);
    if (key === 'hole') { rect.setAttribute('fill', 'rgba(194,65,45,.15)'); rect.setAttribute('stroke', RED); rect.setAttribute('stroke-dasharray', '5 4'); rect.setAttribute('stroke-width', 2); }
    const t = say(g, x + W / 2, BASE, '', { 'text-anchor': 'middle', 'font-size': 12.5 * fs, 'font-weight': 700, fill: key === 'hole' ? RED : '#fff' });
    seg_[key] = { rect, t };
  }
  ['loans', 'bonds', 'cash', 'hole'].forEach((k) => bar(k, AX));
  ['dep', 'cb', 'cap'].forEach((k) => bar(k, CX));
  const lossT = say(s, AX + W / 2, 0, '', { 'text-anchor': 'middle', 'font-size': 12 * fs, 'font-weight': 700, fill: RED });
  function stack(keys, vals) {
    let y = BASE;
    keys.forEach((k) => {
      const v = Math.max(0, vals[k] || 0), h = v * K, o = seg_[k];
      y -= h;
      o.rect.style.y = y + 'px'; o.rect.style.height = h + 'px';
      o.rect.setAttribute('y', y); o.rect.setAttribute('height', h);
      o.t.setAttribute('y', y + h / 2 + 4.5 * fs);
      o.t.textContent = h > 17 * fs ? `${NAME[k]} $${fmt(v)}` : '';
    });
    return y;
  }
  const fmt = (v) => (Math.abs(v - Math.round(v)) < 0.05 ? Math.round(v).toString() : v.toFixed(1));
  let rates = 'calm', help = 'sell';
  function draw() {
    const pct = +r.value; outV.textContent = pct + '%';
    const bv = rates === 'up' ? 0.8 : 1, FIRE = 0.6, PLEDGE = 0.8;
    let cash = 10, bonds = 30, loans = 70, cb = 0, loss = 0, need = pct;
    const steps = [];
    const fromCash = Math.min(need, cash); cash -= fromCash; need -= fromCash;
    if (fromCash > 0) steps.push(`It pays the first $${fmt(fromCash)} from its cash.`);
    if (need > 0 && help === 'cb') {
      const cap = bonds + loans * PLEDGE, b = Math.min(need, cap);
      cb = b; need -= b;
      steps.push(`Cash is gone, so it borrows $${fmt(b)} from the central bank, pledging its bonds and loans. It keeps the assets and takes no loss.`);
    } else if (need > 0) {
      const take = Math.min(need, bonds * bv), book = take / bv;
      bonds -= book; loss += book - take; need -= take;
      steps.push(bv < 1 ? `Cash is gone, so it sells bonds. Rates have risen, so they fetch only 80 cents on the dollar: raising $${fmt(take)} costs $${fmt(book)} of bonds, a loss of $${fmt(book - take)}.` : `Cash is gone, so it sells $${fmt(take)} of bonds at full value.`);
      if (need > 0) {
        const t2 = Math.min(need, loans * FIRE), b2 = t2 / FIRE;
        loans -= b2; loss += b2 - t2; need -= t2;
        steps.push(`Then it has to dump loans, which buyers take only at 60 cents on the dollar: raising $${fmt(t2)} costs $${fmt(b2)} of loans, a loss of $${fmt(b2 - t2)}.`);
      }
    }
    const paid = pct - need, dep = 100 - paid;
    const assets = cash + bonds + loans, capital = assets - dep - cb;
    const top = stack(['loans', 'bonds', 'cash'], { loans, bonds, cash });
    stack(['dep', 'cb', 'cap'], { dep, cb, cap: capital });
    // a negative capital is a hole on top of the assets
    const hole = Math.max(0, -capital), ho = seg_.hole;
    ho.rect.style.y = (top - hole * K) + 'px'; ho.rect.style.height = hole * K + 'px';
    ho.rect.setAttribute('y', top - hole * K); ho.rect.setAttribute('height', hole * K);
    ho.t.setAttribute('y', top - hole * K / 2 + 4.5 * fs); ho.t.textContent = hole * K > 17 * fs ? `Shortfall $${fmt(hole)}` : '';
    lossT.setAttribute('y', top - hole * K - 10);
    lossT.textContent = loss > 0.05 ? `Lost in sales: $${fmt(loss)}` : '';
    paidT.textContent = `Paid out: $${fmt(paid)}`;
    let st, col, end;
    if (need > 0.05) { st = 'Failed: out of cash'; col = RED; end = `It has nothing left to sell or pledge and can't pay the last $${fmt(need)}. The bank fails.`; }
    else if (capital < -0.05) { st = 'Insolvent'; col = RED; end = `Its capital is gone: it now owes $${fmt(hole)} more than it owns. A cash shortage has become a solvency crisis, caused by the run itself.`; }
    else if (capital < 0.05 && pct > 0) { st = 'On the edge'; col = RED; end = 'Its capital is exactly used up. One more withdrawal and it owes more than it owns.'; }
    else if (loss > 0.05) { st = 'Damaged'; col = '#b06a1d'; end = `Capital is down from $10 to $${fmt(capital)}. Depositors who see the losses have even more reason to run.`; }
    else { st = pct ? 'Still standing' : 'A normal day'; col = '#3f6a45'; end = ''; }
    status.textContent = st; status.setAttribute('fill', col);
    let intro = pct === 0 ? 'No one is withdrawing. The bank holds $10 of cash against $100 of deposits, and that is normal: on a usual day only a few depositors want money back.' : steps.join(' ');
    if (pct === 0 && bv < 1) intro += ' But its bonds are now worth only $24, not the $30 it paid. On its books its capital is $10; at market prices it is $4, a loss nobody sees until it has to sell.';
    why.textContent = (intro + ' ' + end).trim();
  }
  seg('runRates', (v) => { rates = v; draw(); });
  seg('runHelp', (v) => { help = v; draw(); });
  r.addEventListener('input', draw);
  draw();
})();

/* ---------------- The anti-run toolkit: ARIA tablist with a sliding indicator ---------------- */
(function () {
  const box = document.getElementById('tkTabs'); if (!box) return;
  const tabs = [...box.querySelectorAll('[role=tab]')], ind = box.querySelector('.tk-ind');
  function select(i, focus) {
    tabs.forEach((t, j) => {
      const on = i === j;
      t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    const t = tabs[i];
    ind.style.transform = `translateX(${t.offsetLeft}px)`; ind.style.width = t.offsetWidth + 'px';
    if (box.scrollWidth > box.clientWidth) box.scrollTo({ left: t.offsetLeft - 24, behavior: reduced ? 'auto' : 'smooth' });
    if (focus) t.focus();
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
  // fonts can change tab widths after load
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => select(cur()));
  select(0);
})();
