/* Bottleneck: The Saver's Ladder (html/explainers/risk-ladder.html)
   Page chrome (reveal, progress, contents, copy link), the ladder explorer,
   the Bessembinder dot grid and the long-run growth calculator. */
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

  /* ---------------- the ladder explorer ----------------
     ret / swing / out are relative 1–5 guides, not measurements. Listed top rung first. */
  const RUNGS = [
    { id: 'stock', name: 'Individual stocks', c: '#a3141f', ret: 5, swing: 5, out: 4,
      own: 'A slice of one company.', pays: 'Nobody promises anything: dividends if the company pays them, and the share price.',
      guard: 'None. If the company fails, shareholders are paid last, usually nothing.',
      risk: 'The company does badly or fails; the price can swing 50% or more.', out2: 'Sell on the exchange on any trading day, at whatever the price is.' },
    { id: 'etf', name: 'Stock ETFs (many companies)', c: '#c2412d', ret: 4, swing: 4, out: 4,
      own: 'Small slices of many companies in one product. (Bond ETFs exist too; they sit nearer the bond rung.)', pays: 'The combined dividends and price changes of everything the fund holds, minus its yearly fee.',
      guard: 'None on value. Fund assets are held separately from the fund manager, so the manager failing does not wipe them out.',
      risk: 'The whole market falls; narrow theme funds can swing like single stocks.', out2: 'Sell on the exchange on any trading day.' },
    { id: 'corp', name: 'Corporate bonds (one company)', c: '#b8892b', ret: 3, swing: 3, out: 2,
      own: 'A loan to a company.', pays: 'The company pays fixed interest and repays the loan on a set date.',
      guard: 'None from the state. Lenders are paid before shareholders if the company fails; perpetuals and junior debt rank lower.',
      risk: 'The company defaults, and with one issuer there is nothing to cushion it; prices also fall when interest rates rise.', out2: 'Can be sold before maturity, but retail markets can be thin.' },
    { id: 'govt', name: 'SSBs and T-bills', c: '#2f7a4a', ret: 2, swing: 1, out: 3,
      own: 'A loan to the Singapore government.', pays: 'The government pays interest (SSB) or a discount to face value (T-bills).',
      guard: 'Backed by the Singapore government.', risk: 'Inflation outpacing the rate; locking in just before rates rise.',
      out2: 'SSB: cash back in any month, no penalty. T-bills: held to maturity, six months or a year.' },
    { id: 'fd', name: 'Fixed deposits', c: '#2463d6', ret: 1, swing: 1, out: 2,
      own: 'A loan to your bank, locked for a term.', pays: 'The bank pays a fixed rate for the term.',
      guard: 'Insured by SDIC up to S$100,000 per depositor per bank.', risk: 'Inflation; above S$100,000, the bank itself.',
      out2: 'Locked for the term; breaking it early usually costs the interest.' },
    { id: 'cash', name: 'Savings account', c: '#4d8bff', ret: 1, swing: 1, out: 5,
      own: 'A loan to your bank, repayable on demand.', pays: 'The bank pays a (usually low) variable rate.',
      guard: 'Insured by SDIC up to S$100,000 per depositor per bank.', risk: 'Inflation eating the buying power.',
      out2: 'Instantly.' }
  ];
  const rungsEl = $('ladRungs'), card = $('ladCard');
  if (rungsEl && card) {
    rungsEl.innerHTML = RUNGS.map((r, i) => `<button type="button" role="tab" data-i="${i}" aria-selected="false" style="--c:${r.c}"><span class="lr-n">${r.name}</span><span class="lr-lvl">${['Highest expected return', '', '', '', '', 'Most guaranteed'][i] || ''}</span></button>`).join('');
    const dots = (n) => '<span class="lc-dots">' + [1, 2, 3, 4, 5].map((k) => `<i class="${k <= n ? 'on' : ''}"></i>`).join('') + '</span>';
    const show = (i) => {
      const r = RUNGS[i];
      rungsEl.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(+b.dataset.i === i)));
      card.style.setProperty('--c', r.c);
      card.innerHTML = `<h4>${r.name}</h4>
        <div class="lc-m"><span>Expected return</span>${dots(r.ret)}</div>
        <div class="lc-m"><span>Price swings</span>${dots(r.swing)}</div>
        <div class="lc-m"><span>Ease of getting out</span>${dots(r.out)}</div>
        <dl><dt>What you own</dt><dd>${r.own}</dd><dt>Who pays you</dt><dd>${r.pays}</dd><dt>Protection</dt><dd>${r.guard}</dd><dt>What can go wrong</dt><dd>${r.risk}</dd><dt>Getting your money out</dt><dd>${r.out2}</dd></dl>`;
    };
    rungsEl.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) show(+b.dataset.i); });
    show(4);
  }

  /* ---------------- Bessembinder dot grid ---------------- */
  const dotsEl = $('dots');
  if (dotsEl) dotsEl.innerHTML = Array.from({ length: 100 }, (_, i) => `<i class="${i < 58 ? 'k1' : i < 96 ? 'k2' : 'k3'}"></i>`).join('');

  /* ---------------- growth calculator ---------------- */
  const yIn = $('grY'), yV = $('grYv'), feeEl = $('grFee'), bars = $('grBars'), why = $('grWhy');
  if (yIn && bars) {
    const START = 10000;
    const ASSETS = [
      { n: 'Idle cash', r: -2, c: '#a9a59c', worst: 'Never falls in dollars; loses to inflation every year' },
      { n: 'Cash-like bills', r: 0.5, c: '#4d8bff', worst: 'Almost never falls in dollars' },
      { n: 'Bonds', r: 1.7, c: '#2f7a4a', worst: 'Worst recent year: about −16% (global bonds, 2022)' },
      { n: 'World stocks', r: 5.2, c: '#c2412d', fee: true, worst: 'Worst recent year: about −40% (world stocks, 2008)' }
    ];
    let fee = 0.2;
    const sgd = (v) => 'S$' + Math.round(v).toLocaleString('en-US');
    const draw = () => {
      const y = +yIn.value; yV.textContent = y;
      const vals = ASSETS.map((a) => START * Math.pow(1 + (a.r - (a.fee ? fee : 0)) / 100, y));
      const max = Math.max(...vals, START);
      bars.innerHTML = ASSETS.map((a, i) => `<div class="gb-r">
          <div class="gb-n">${a.n}<small>${(a.r - (a.fee ? fee : 0)).toFixed(1)}% a year real${a.fee ? ', after fee' : ''}</small></div>
          <div class="gb-t"><i style="width:${(vals[i] / max * 100).toFixed(2)}%;background:${a.c}"></i><b class="gb-start" style="left:${(START / max * 100).toFixed(2)}%"></b></div>
          <div class="gb-v">${sgd(vals[i])}</div>
          <div class="gb-w">${a.worst}</div></div>`).join('');
      const noFee = START * Math.pow(1.052, y), withFee = vals[3];
      why.innerHTML = `After ${y} year${y > 1 ? 's' : ''}, stocks at the long-run average would turn S$10,000 into about <b>${sgd(withFee)}</b> of today's buying power, against <b>${sgd(vals[1])}</b> in bills. The ${fee}% fee costs <b>${sgd(noFee - withFee)}</b> of it. The thin line marks the S$10,000 you started with.`;
    };
    yIn.addEventListener('input', draw);
    feeEl.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      feeEl.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      fee = +b.dataset.f; draw();
    });
    draw();
  }
})();
