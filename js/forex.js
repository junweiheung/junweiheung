/* Bottleneck: The $9.6 Trillion Market (html/explainers/forex.html)
   Page chrome (reveal, progress, contents, copy link), the currency-share bars,
   the pair calculator and the leverage calculator. */
(function () {
  const $ = (id) => document.getElementById(id);

  /* ---------------- reveal-on-scroll, progress bar, contents, copy link ---------------- */
  const rio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in-view'); rio.unobserve(e.target);
  }), { threshold: 0, rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.rv').forEach((e) => rio.observe(e));

  const prog = $('prog'), tocLinks = [...document.querySelectorAll('#toc a')];
  const secs = tocLinks.map((a) => document.querySelector(a.getAttribute('href')));
  addEventListener('scroll', () => {
    const h = document.documentElement;
    if (prog) prog.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
    let cur = 0; secs.forEach((sec, i) => { if (sec && sec.getBoundingClientRect().top < innerHeight * .35) cur = i; });
    tocLinks.forEach((a, i) => a.classList.toggle('on', i === cur));
  }, { passive: true });
  tocLinks.forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); const s = document.querySelector(a.getAttribute('href')); if (s) s.scrollIntoView({ behavior: 'smooth' }); }));
  const cl = $('copyLink');
  if (cl) cl.addEventListener('click', async (e) => { try { await navigator.clipboard.writeText(location.href); e.target.textContent = 'Copied'; } catch (_) { e.target.textContent = 'Copy from address bar'; } });

  const usd = (v, dp = 2) => (v < 0 ? '−' : '') + '$' + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
  const num = (v) => v.toLocaleString('en-US');

  /* segmented-button helper: fills or wires a .seg group, calls back with the pressed button */
  function seg(el, onPick) {
    el.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      el.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      onPick(b);
    });
    return () => el.querySelector('[aria-pressed="true"]');
  }

  /* ---------------- currency shares (BIS, April 2025) ---------------- */
  const SHARES = [['US dollar', 89.2, 'usd'], ['Euro', 28.9], ['Japanese yen', 16.8], ['British pound', 10.2], ['Chinese renminbi', 8.5]];
  const cb = $('ccyBars');
  if (cb) cb.innerHTML = SHARES.map(([n, v, k]) => `<div class="ccy-r${k ? ' on' : ''}"><span class="ccy-n">${n}</span><span class="ccy-t"><i style="--v:${v}%"></i></span><span class="ccy-v">${v}%</span></div>`).join('');

  /* ---------------- the pair calculator ----------------
     Illustrative rounded rates. USD value of one unit of each currency is used to convert. */
  const USDPER = { USD: 1, EUR: 1.16, GBP: 1.32, JPY: 1 / 155, SGD: 1 / 1.30 };
  const PAIRS = [
    { b: 'EUR', q: 'USD', r: 1.16, pip: 0.0001, spr: 1.0 },
    { b: 'USD', q: 'JPY', r: 155, pip: 0.01, spr: 1.2 },
    { b: 'GBP', q: 'USD', r: 1.32, pip: 0.0001, spr: 1.5 },
    { b: 'EUR', q: 'JPY', r: 180, pip: 0.01, spr: 2.0 },
    { b: 'USD', q: 'SGD', r: 1.30, pip: 0.0001, spr: 3.0 }
  ];
  const SYM = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', SGD: 'S$' };
  const pxPair = $('pxPair');
  if (pxPair) {
    pxPair.innerHTML = PAIRS.map((p, i) => `<button type="button" data-i="${i}" aria-pressed="${i === 0}">${p.b}/${p.q}</button>`).join('');
    const S = { i: 0, d: 1, u: 10000 };
    seg(pxPair, (b) => { S.i = +b.dataset.i; draw(); });
    seg($('pxDir'), (b) => { S.d = +b.dataset.d; draw(); });
    seg($('pxLot'), (b) => { S.u = +b.dataset.u; draw(); });
    const mv = $('pxMove'); mv.addEventListener('input', draw);
    function draw() {
      const p = PAIRS[S.i], pips = +mv.value, dpx = p.pip === 0.01 ? 2 : 4;
      $('pxMv').textContent = (pips > 0 ? '+' : pips < 0 ? '−' : '') + Math.abs(pips) + ' pips';
      const pipUsd = S.u * p.pip * USDPER[p.q];
      const pnl = S.d * pips * pipUsd;
      const sprUsd = p.spr * pipUsd;
      const notional = S.u * USDPER[p.b];
      const margin = notional / 20;
      const to = p.r + pips * p.pip;
      const quoteAmt = S.u * p.r;
      const buyWhat = S.d > 0
        ? `buy ${SYM[p.b]}${num(S.u)} and sell ${SYM[p.q]}${num(Math.round(quoteAmt))}`
        : `sell ${SYM[p.b]}${num(S.u)} and buy ${SYM[p.q]}${num(Math.round(quoteAmt))}`;
      $('pxOut').innerHTML = `
        <p class="px-say">${S.d > 0 ? 'Buying' : 'Selling'} ${S.u === 100000 ? 'one standard lot' : S.u === 10000 ? 'one mini lot' : 'one micro lot'} of <b>${p.b}/${p.q}</b> at ${p.r.toFixed(dpx)} means you ${buyWhat}. The price moves to <b>${to.toFixed(dpx)}</b>.</p>
        <div class="px-grid">
          <div><span>Value of 1 pip</span><b>${usd(pipUsd)}</b></div>
          <div><span>Result of the move</span><b class="${pnl > 0 ? 'up' : pnl < 0 ? 'dn' : ''}">${pnl > 0 ? '+' : ''}${usd(pnl)}</b></div>
          <div><span>Spread paid (about ${p.spr} pip${p.spr === 1 ? '' : 's'})</span><b>${usd(sprUsd)}</b></div>
          <div><span>Margin at 20:1</span><b>${usd(margin, 0)}</b></div>
        </div>
        <p class="px-foot">Position worth about ${usd(notional, 0)}. The move is <b>${(pnl / margin * 100 > 0 ? '+' : '') + (pnl / margin * 100).toFixed(1)}%</b> of the margin you put down.</p>`;
    }
    draw();
  }

  /* ---------------- the leverage calculator ---------------- */
  const LEV = [[1, 'None (1:1)'], [20, '20:1 Singapore'], [30, '30:1 EU'], [50, '50:1 US'], [500, '500:1 offshore']];
  const lvL = $('lvL');
  if (lvL) {
    lvL.innerHTML = LEV.map(([l, t]) => `<button type="button" data-l="${l}" aria-pressed="${l === 20}">${t}</button>`).join('');
    const S = { L: 20 }, D = 1000;
    seg(lvL, (b) => { S.L = +b.dataset.l; draw(); });
    const mv = $('lvMove'); mv.addEventListener('input', draw);
    function draw() {
      const m = +mv.value / 10; // percent; negative = against you
      const lbl = $('lvMv').parentNode;
      lbl.innerHTML = m === 0 ? 'The currency doesn’t move: <b id="lvMv">0%</b>'
        : `The currency moves <b id="lvMv">${Math.abs(m).toFixed(1)}%</b> ${m < 0 ? 'against you' : 'in your favour'}`;
      const pos = D * S.L, pnl = pos * m / 100, eq = D + pnl, wipe = 100 / S.L;
      const w = Math.max(0, Math.min(100, eq / (2 * D) * 100));
      const gone = eq <= 0;
      $('lvOut').innerHTML = `
        <div class="lv-bar"><i class="${gone ? 'gone' : pnl < 0 ? 'dn' : 'up'}" style="width:${w}%"></i><em style="left:50%"></em></div>
        <div class="lv-scale"><span>$0</span><span>$1,000 deposit</span><span>$2,000</span></div>
        <div class="px-grid">
          <div><span>Position controlled</span><b>${usd(pos, 0)}</b></div>
          <div><span>Profit or loss</span><b class="${pnl > 0 ? 'up' : pnl < 0 ? 'dn' : ''}">${pnl > 0 ? '+' : ''}${usd(pnl, 0)}</b></div>
          <div><span>Account left</span><b class="${gone ? 'dn' : ''}">${usd(eq, 0)}</b></div>
          <div><span>Move that wipes it out</span><b>${wipe >= 1 ? wipe.toFixed(0) : wipe.toFixed(1)}%</b></div>
        </div>
        <p class="px-foot">${gone
          ? `<b>The deposit is gone${eq < 0 ? `, and you owe the broker ${usd(-eq, 0)} more` : ''}.</b> ${eq < 0 ? 'Negative-balance protection, now required for retail clients in the EU and elsewhere, caps the loss at the deposit.' : ''}`
          : S.L === 1 ? 'Without leverage, even a 3% move, a big one for a major currency, changes the account by only $30.'
          : `A ${Math.abs(m).toFixed(1)}% move becomes a ${Math.abs(pnl / D * 100).toFixed(0)}% ${pnl < 0 ? 'loss' : 'gain'} on the deposit.`}</p>`;
    }
    draw();
  }
})();
