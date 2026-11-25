/* Bottleneck: Shrinking the Pie (html/explainers/buybacks.html)
   Page chrome (reveal, progress, contents, copy link), the buyback effect slider,
   the 25%-of-volume pace calculator and the blackout-window strip. */
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

  /* ---------------- buyback effect ----------------
     Company: profit $1B, 1,000M shares at $20 (value $20B incl. $4B spare cash). You hold 1M shares. */
  const amt = $('bbAmt'), amtV = $('bbAmtV'), grid = $('bbGrid'), why = $('bbWhy');
  if (amt && grid) {
    const PROFIT = 1000, SH = 1000, PX = 20, VAL = 20000, MINE = 1;
    const tile = (label, before, after, fmt, c) => {
      const up = after > before + 1e-9, down = after < before - 1e-9;
      return `<div class="bb-t" style="--c:${c}"><span class="bb-l">${label}</span>
        <span class="bb-a">${fmt(after)}</span>
        <span class="bb-b">before: ${fmt(before)}${up ? ' <em class="u">▲</em>' : down ? ' <em class="d">▼</em>' : ' <em>=</em>'}</span></div>`;
    };
    const draw = () => {
      const b = +amt.value * 1000; // $ millions
      amtV.textContent = '$' + (+amt.value).toFixed(1) + 'B';
      const bought = b / PX, left = SH - bought, val = VAL - b;
      grid.innerHTML = [
        tile('Shares outstanding', SH, left, (x) => Math.round(x).toLocaleString('en-US') + 'M', '#2463d6'),
        tile('Earnings per share', PROFIT / SH, PROFIT / left, (x) => '$' + x.toFixed(2), '#2f7a4a'),
        tile('Your 1M shares own', MINE / SH * 100, MINE / left * 100, (x) => x.toFixed(3) + '%', '#b8892b'),
        tile('Company value', VAL, val, (x) => '$' + (x / 1000).toFixed(1) + 'B', '#a3141f'),
        tile('Value per share', PX, val / left, (x) => '$' + x.toFixed(2), '#4a4a52')
      ].join('');
      why.innerHTML = b === 0
        ? 'With no buyback, nothing changes. Move the slider to spend some of the spare cash.'
        : `Spending <b>$${(b / 1000).toFixed(1)}B</b> retires <b>${Math.round(bought)}M</b> shares (${(bought / SH * 100).toFixed(0)}%). Earnings per share rise <b>${((SH / left - 1) * 100).toFixed(1)}%</b> and your slice grows by the same proportion, but the company holds $${(b / 1000).toFixed(1)}B less cash, so each share is still worth <b>$20</b>.`;
    };
    amt.addEventListener('input', draw);
    draw();
  }

  /* ---------------- pace calculator ---------------- */
  const pcAmt = $('pcAmt'), pcOut = $('pcOut');
  if (pcAmt && pcOut) {
    const PRICE = 150, PERDAY = 5; // million shares a day at 25% of 20M
    const draw = (bn) => {
      const shares = bn * 1000 / PRICE; // millions
      const days = Math.ceil(shares / PERDAY);
      const months = days / 21;
      const cells = Math.min(days, 160);
      pcOut.innerHTML = `<div class="pc-nums">
          <div><b>${shares >= 100 ? Math.round(shares).toLocaleString('en-US') : shares.toFixed(1)}M</b><span>shares to buy</span></div>
          <div><b>${days}</b><span>trading days at the maximum pace</span></div>
          <div><b>${months < 1 ? 'under 1' : '≈' + months.toFixed(months < 3 ? 1 : 0)}</b><span>month${months < 1 || months.toFixed(1) === '1.0' ? '' : 's'} of trading</span></div>
        </div>
        <div class="pc-days" aria-hidden="true">${Array.from({ length: cells }, () => '<i></i>').join('')}${days > cells ? `<em>+${days - cells} more</em>` : ''}</div>
        <p class="pc-note">Each square is one trading day of buying 5 million shares.</p>`;
    };
    pcAmt.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      pcAmt.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      draw(+b.dataset.b);
    });
    draw(1.5);
  }

  /* ---------------- blackout strip ----------------
     A 13-week quarter plus the first 5 weeks of the next. Blackout: week 11 to week 16 (results ~week 15). */
  const win = $('winBar');
  if (win) {
    const W = 18;
    const cells = Array.from({ length: W }, (_, i) => {
      const shut = i >= 11 && i <= 15;
      return `<i class="${shut ? 'w-shut' : 'w-open'}${i === 15 ? ' w-res' : ''}"></i>`;
    }).join('');
    win.innerHTML = `<div class="win-cells">${cells}</div>
      <div class="win-lab"><span style="left:0">Quarter starts</span><span style="left:${(13 / W * 100).toFixed(1)}%">Quarter ends</span><span style="left:${(15 / W * 100).toFixed(1)}%" class="r">Results out</span></div>`;
  }
})();
