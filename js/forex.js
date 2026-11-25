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

  /* ---------------- order book: bid, ask and market orders ---------------- */
  const bookEl = document.getElementById('bookRows'), bookOut = document.getElementById('bookOut');
  if (bookEl && bookOut) {
    // best levels first; size in the asset's own unit
    const BOOKS = {
      stock: { name: 'A share', unit: 'shares', dp: 2, pre: '$',
        ask: [[100.02, 300], [100.03, 500], [100.05, 800], [100.08, 1200]],
        bid: [[100.00, 400], [99.99, 600], [99.97, 900], [99.94, 1500]],
        sizes: [100, 700, 2500] },
      forex: { name: 'EUR/USD', unit: 'euros', dp: 5, pre: '',
        ask: [[1.16010, 1e6], [1.16012, 2e6], [1.16015, 5e6], [1.16020, 1e7]],
        bid: [[1.16000, 1e6], [1.15998, 2e6], [1.15995, 5e6], [1.15990, 1e7]],
        sizes: [5e5, 3e6, 1.5e7] },
      crypto: { name: 'Bitcoin', unit: 'BTC', dp: 0, pre: '$',
        ask: [[90010, 0.5], [90015, 1.2], [90030, 2], [90060, 4]],
        bid: [[90000, 0.6], [89990, 1.0], [89970, 2.5], [89940, 4]],
        sizes: [0.2, 1.5, 6] }
    };
    let mk = 'stock', side = 'buy', si = 0;
    const qty = (v, b) => (b.unit === 'euros' ? (v >= 1e6 ? (v / 1e6) + 'M' : (v / 1e3) + 'k') : v.toLocaleString('en-US'));
    const px = (v, b) => b.pre + v.toLocaleString('en-US', { minimumFractionDigits: b.dp, maximumFractionDigits: b.dp });
    const draw = () => {
      const b = BOOKS[mk], want = b.sizes[si];
      const levels = side === 'buy' ? b.ask : b.bid;
      let left = want, cost = 0; const used = [];
      levels.forEach(([p, s], i) => { if (left <= 1e-9) return; const take = Math.min(left, s); used[i] = take; cost += take * p; left -= take; });
      const filled = want - left, avg = filled ? cost / filled : 0, best = levels[0][0];
      const row = (kind, [p, s], i) => {
        const hit = (kind === 'ask') === (side === 'buy') && used[i];
        return `<div class="bk-r ${kind}${hit ? ' hit' : ''}"><span class="bk-p">${px(p, b)}</span><span class="bk-s">${qty(s, b)}</span><span class="bk-bar"><i style="width:${Math.min(100, s / Math.max(...b.ask.concat(b.bid).map((l) => l[1])) * 100)}%"></i></span>${hit ? `<span class="bk-take">${side === 'buy' ? 'bought' : 'sold'} ${qty(used[i], b)}</span>` : ''}</div>`;
      };
      const spread = b.ask[0][0] - b.bid[0][0];
      bookEl.innerHTML = `<div class="bk-h"><span>Price</span><span>Size (${b.unit})</span></div>` +
        `<div class="bk-lab ask">Asks: sellers waiting</div>` +
        [...b.ask].map((l, i) => [l, i]).reverse().map(([l, i]) => row('ask', l, i)).join('') +
        `<div class="bk-spread">Spread: ${mk === 'forex' ? (spread * 1e4).toFixed(1) + ' pip' : px(spread, b)}</div>` +
        b.bid.map((l, i) => row('bid', l, i)).join('') +
        `<div class="bk-lab bid">Bids: buyers waiting</div>`;
      const slip = Math.abs(avg - best);
      bookOut.innerHTML = `<div class="bk-nums">
          <div><span>${side === 'buy' ? 'Best ask' : 'Best bid'}</span><b>${px(best, b)}</b></div>
          <div><span>Average fill</span><b>${px(avg, b)}</b></div>
          <div><span>Slippage</span><b>${slip < 1e-9 ? 'none' : (mk === 'forex' ? (slip * 1e4).toFixed(2) + ' pips' : px(slip, b))}</b></div>
        </div>
        <p class="bk-why">A market ${side} of <b>${qty(want, b)} ${b.unit}</b> ${side === 'buy' ? 'takes the cheapest asks first' : 'hits the highest bids first'}${used.filter(Boolean).length > 1 ? `, then works through ${used.filter(Boolean).length} price levels because the best one isn’t big enough` : ', and the best level is big enough to fill it all'}.${left > 1e-9 ? ` The visible book runs out with ${qty(left, b)} still unfilled.` : ''} ${side === 'buy' ? 'Buyers pay the ask; the moment you bought, you could only sell back at the bid, so the spread is a cost paid up front.' : 'Sellers receive the bid, below the ask a buyer would pay: the spread goes to whoever posted the bid.'}</p>`;
      document.querySelectorAll('#bookMk button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.v === mk)));
      document.querySelectorAll('#bookSide button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.v === side)));
      document.querySelectorAll('#bookSize button').forEach((x, i) => { x.setAttribute('aria-pressed', String(i === si)); x.textContent = `${['Small', 'Medium', 'Large'][i]} (${qty(b.sizes[i], b)})`; });
    };
    const on = (id, fn) => document.getElementById(id).addEventListener('click', (e) => { const x = e.target.closest('button'); if (x) { fn(x); draw(); } });
    on('bookMk', (x) => { mk = x.dataset.v; });
    on('bookSide', (x) => { side = x.dataset.v; });
    on('bookSize', (x) => { si = +x.dataset.i; });
    draw();
  }

  /* ---------------- the impossible trinity ---------------- */
  const triSvg = document.getElementById('triSvg'), triCard = document.getElementById('triCard'), triPick = document.getElementById('triPick');
  if (triSvg && triCard && triPick) {
    // corners: 0 fixed rate (top), 1 open capital (bottom left), 2 own interest rates (bottom right)
    const P = [[170, 46], [44, 252], [296, 252]];
    const LAB = [['Fixed', 'exchange rate'], ['Free capital', 'flows'], ['Own interest', 'rates']];
    const CH = [
      { sides: [0, 1], off: 2, title: 'Fixed rate + open capital',
        get: 'A stable currency, good for trade, and money free to move in and out.',
        give: 'Its own interest rates: they must follow the anchor currency’s.',
        ex: 'Hong Kong (tied to the US dollar, so its rates track the Federal Reserve’s); Denmark (tied to the euro). Singapore makes a looser version of this trade, managing its currency in a band and letting global rates set its own.' },
      { sides: [1, 2], off: 0, title: 'Open capital + own rates',
        get: 'Full control of interest rates, and open borders for investment.',
        give: 'A stable exchange rate: the currency floats and can swing.',
        ex: 'The United States, the euro area, Japan, the UK, Australia. The Fed sets rates for America and lets the dollar find its own level.' },
      { sides: [2, 0], off: 1, title: 'Fixed rate + own rates',
        get: 'A managed, stable currency, and interest rates set for the home economy.',
        give: 'Free movement of capital: money in and out has to be controlled.',
        ex: 'China, which manages the yuan within a daily band and restricts cross-border capital; Malaysia from September 1998, which fixed the ringgit and imposed capital controls.' }
    ];
    const sideKey = (a, b) => [a, b].sort().join('');
    let pick = 0;
    const draw = () => {
      const c = CH[pick], on = sideKey(...c.sides);
      const sides = [[0, 1], [1, 2], [2, 0]].map(([a, b]) => `<line class="t-side${sideKey(a, b) === on ? ' on' : ''}" data-s="${sideKey(a, b)}" x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}"/>`).join('');
      const nodes = P.map(([x, y], i) => {
        const ly = i === 0 ? y - 30 : y + 26;
        return `<circle class="t-node${i === c.off ? ' off' : ''}" cx="${x}" cy="${y}" r="11"/>
          <text class="t-lab${i === c.off ? ' off' : ''}" x="${x}" y="${ly}">${LAB[i][0]}</text><text class="t-lab${i === c.off ? ' off' : ''}" x="${x}" y="${ly + 15}">${LAB[i][1]}</text>`;
      }).join('');
      triSvg.innerHTML = sides + nodes + `<text x="170" y="170" text-anchor="middle" font-size="12" fill="#76736c">pick any two</text>`;
      triCard.innerHTML = `<h4>${c.title}</h4><dl><dt>They get</dt><dd>${c.get}</dd><dt>They give up</dt><dd class="give">${c.give}</dd><dt>Examples</dt><dd>${c.ex}</dd></dl>`;
      triPick.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.i === pick)));
    };
    triPick.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { pick = +b.dataset.i; draw(); } });
    triSvg.addEventListener('click', (e) => {
      const l = e.target.closest('.t-side'); if (!l) return;
      pick = CH.findIndex((c) => sideKey(...c.sides) === l.dataset.s); draw();
    });
    draw();
  }
})();
