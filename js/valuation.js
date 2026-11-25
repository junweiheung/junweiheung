/* Bottleneck: What Is a Company Worth? (html/explainers/valuation.html)
   Page chrome (reveal, progress, contents, copy link), the market-cap vs EV comparison,
   the P/E / forward P/E / PEG calculator and the "which ratio" question list. */
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

  /* ---------------- stock split ---------------- */
  const spRatio = $('spRatio'), spGrid = $('spGrid');
  if (spRatio && spGrid) {
    const SH = 100, PX = 500, MINE = 10; // million shares, $, your shares
    const draw = (r) => {
      spRatio.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.r === r)));
      const cell = (k, before, after, same) => `<div class="sp-c${same ? ' same' : ''}"><span>${k}</span><b>${after}</b><small>${same ? 'unchanged' : 'was ' + before}</small></div>`;
      const px = PX / r;
      spGrid.innerHTML = [
        cell('Share price', '$500', '$' + (px % 1 ? px.toFixed(2) : px), r === 1),
        cell('Shares outstanding', '100M', (SH * r).toLocaleString('en-US') + 'M', r === 1),
        cell('Market cap', '', '$50B', true),
        cell('Your shares', '10', (MINE * r).toLocaleString('en-US'), r === 1),
        cell('Your stake’s value', '', '$5,000', true),
        cell('Your share of the company', '', '0.00001%', true)
      ].join('');
    };
    spRatio.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) draw(+b.dataset.r); });
    draw(10);
  }

  /* ---------------- market cap vs enterprise value ---------------- */
  const evD = $('evD'), evC = $('evC'), evOut = $('evOut');
  if (evD && evC && evOut) {
    const MC = 50, REV = 20, EBITDA = 6, SCALE = 110; // $B; SCALE = width of the bar track in $B
    const bar = (mc, debt, cash) => `<div class="ev-bar">
        <i class="b-mc" style="width:${(mc - cash) / SCALE * 100}%"></i>${cash ? `<i class="b-cash" style="width:${cash / SCALE * 100}%" title="cash, subtracted"></i>` : ''}<i class="b-debt" style="width:${debt / SCALE * 100}%"></i>
      </div>`;
    const co = (name, debt, cash) => {
      const ev = MC + debt - cash;
      return `<div class="ev-co"><div class="ev-h"><b>${name}</b><span>Debt $${debt}B · Cash $${cash}B</span></div>
        ${bar(MC, debt, cash)}
        <div class="ev-nums"><div><span>Market cap</span><b>$${MC}B</b></div><div><span>Enterprise value</span><b>$${ev}B</b></div><div><span>EV/Revenue</span><b>${(ev / REV).toFixed(1)}×</b></div><div><span>EV/EBITDA</span><b>${(ev / EBITDA).toFixed(1)}×</b></div></div></div>`;
    };
    const draw = () => {
      const d = +evD.value, c = +evC.value;
      $('evDv').textContent = '$' + d + 'B'; $('evCv').textContent = '$' + c + 'B';
      const evA = MC - c, evB = MC + d;
      evOut.innerHTML = co('Company A', 0, c) + co('Company B', d, 0) +
        `<div class="ev-key"><span><i class="b-mc"></i>Market cap (net of cash)</span><span><i class="b-cash"></i>Cash, subtracted</span><span><i class="b-debt"></i>Debt, added</span></div>
         <p class="ev-why">Buying all of B costs <b>$${evB}B</b> once its debt is counted; A costs only <b>$${evA}B</b> once its cash is netted off. Per dollar of EBITDA, B is ${evA > 0 ? `<b>${(evB / evA).toFixed(1)} times</b> as expensive` : 'far more expensive'}, though their market caps match.</p>`;
    };
    evD.addEventListener('input', draw); evC.addEventListener('input', draw);
    draw();
  }

  /* ---------------- P/E, forward P/E and PEG ---------------- */
  const peP = $('peP'), peE = $('peE'), peG = $('peG'), peOut = $('peOut'), peScale = $('peScale'), peWhy = $('peWhy');
  if (peP && peOut) {
    const BANDS = [
      { to: 10, label: 'Under 10', note: 'cheap, or in trouble', c: '#2f7a4a' },
      { to: 20, label: '10–20', note: 'fair, steady growth', c: '#7fa35a' },
      { to: 30, label: '20–30', note: 'growth premium', c: '#b8892b' },
      { to: 50, label: '30–50', note: 'high growth expected', c: '#c2412d' },
      { to: Infinity, label: '50+', note: 'extreme expectations', c: '#a3141f' }
    ];
    const MAXPE = 70;
    const band = (pe) => BANDS.find((b) => pe <= b.to);
    peScale.innerHTML = `<div class="ps-track">${BANDS.map((b, i) => {
      const from = i ? BANDS[i - 1].to : 0, to = Math.min(b.to, MAXPE);
      return `<i style="left:${from / MAXPE * 100}%;width:${(to - from) / MAXPE * 100}%;background:${b.c}"><span>${b.label}</span></i>`;
    }).join('')}<b class="ps-mk" id="psMk"></b><b class="ps-mk fwd" id="psMkF"></b></div>
      <div class="ps-key"><span><b class="ps-dot"></b>Trailing P/E</span><span><b class="ps-dot fwd"></b>Forward P/E</span></div>`;
    const draw = () => {
      const p = +peP.value, e = +peE.value, g = +peG.value;
      $('pePv').textContent = '$' + p; $('peEv').textContent = '$' + e.toFixed(2); $('peGv').textContent = g + '%';
      const pe = p / e, fe = e * (1 + g / 100), fpe = p / fe, peg = g > 0 ? pe / g : null;
      const b = band(pe);
      peOut.innerHTML = `<div class="pe-nums">
        <div><span>Trailing P/E</span><b>${pe.toFixed(1)}</b><small style="color:${b.c}">${b.note}</small></div>
        <div><span>Forward P/E</span><b>${fpe.toFixed(1)}</b><small>on forecast EPS of $${fe.toFixed(2)}</small></div>
        <div><span>PEG</span><b>${peg === null ? '—' : peg.toFixed(2)}</b><small>${peg === null ? 'no growth, no PEG' : peg < 0.95 ? 'possibly cheap for its growth' : peg <= 1.05 ? 'about fair for its growth' : 'expensive for its growth'}</small></div>
      </div>`;
      $('psMk').style.left = Math.min(pe, MAXPE) / MAXPE * 100 + '%';
      $('psMkF').style.left = Math.min(fpe, MAXPE) / MAXPE * 100 + '%';
      peWhy.innerHTML = `You pay <b>$${pe.toFixed(1)}</b> for each dollar of last year’s profit. ` +
        (g > 0 ? `If profits grow ${g}% as expected, that falls to <b>$${fpe.toFixed(1)}</b> on next year’s, ` + (peg !== null && peg <= 1.05 ? 'so the growth roughly justifies the price.' : 'but the price still asks for more growth than is forecast.') : 'With no growth expected, today’s P/E is all there is.');
    };
    [peP, peE, peG].forEach((x) => x.addEventListener('input', draw));
    draw();
  }

  /* ---------------- which ratio, when ---------------- */
  const qs = $('qsList');
  if (qs) {
    const Q = [
      { q: 'Is the company profitable and steady?', a: 'P/E, or forward P/E', why: 'Profit per share is the cleanest thing to pay for. Compare with peers and with the company’s own past.' },
      { q: 'Is it losing money?', a: 'EV/Revenue (or price-to-sales)', why: 'With no profit, P/E means nothing. Sales at least show the size of the business; check whether margins are heading toward profit.' },
      { q: 'Does it carry a lot of debt?', a: 'Enterprise value, EV/EBITDA', why: 'Market cap hides debt. EV puts lenders’ money back in, so heavily borrowed companies don’t look cheaper than they are.' },
      { q: 'Is it growing fast?', a: 'Forward P/E and PEG', why: 'Last year’s profit understates a fast grower. PEG asks whether the P/E is in line with the growth.' },
      { q: 'Does it actually generate cash?', a: 'Free cash flow, then EV/EBITDA', why: 'EBITDA is a rough guide; the cash-flow statement shows what is left after spending on equipment.' },
      { q: 'Is it a bank or insurer?', a: 'Price-to-book', why: 'For lenders, debt is the product, not a burden, so EV ratios break down. Book value is what the balance sheet says the equity is worth.' }
    ];
    qs.innerHTML = Q.map((x, i) => `<button type="button" class="q" aria-expanded="${i === 0}"><span class="q-q">${x.q}</span><span class="q-a">${x.a}</span><span class="q-w">${x.why}</span></button>`).join('');
    qs.addEventListener('click', (e) => {
      const b = e.target.closest('.q'); if (!b) return;
      const open = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', String(!open));
    });
  }
})();
