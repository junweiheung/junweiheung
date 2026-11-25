/* Bottleneck: Reading the Squiggles (html/explainers/chart-reading.html)
   Page chrome, a seeded illustrative price series, the four chart types (candlestick, Point & Figure,
   Kagi, Renko), the moving-average crossover chart with RSI / MACD, and the studies table. */
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

  /* ---------------- an illustrative price series (seeded, so it's the same every visit) ---------------- */
  let seed = 99;
  const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const N = 420, DRIFT = (i) => (i < 90 ? 0.0028 : i < 170 ? -0.0032 : i < 250 ? 0.0034 : i < 320 ? -0.0026 : 0.0024);
  const bars = []; let px = 100;
  for (let i = 0; i < N; i++) {
    const o = px, c = o * (1 + DRIFT(i) + gauss() * 0.012);
    const hi = Math.max(o, c) * (1 + Math.abs(gauss()) * 0.006), lo = Math.min(o, c) * (1 - Math.abs(gauss()) * 0.006);
    bars.push({ o, h: hi, l: lo, c }); px = c;
  }
  const closes = bars.map((b) => b.c);

  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (svg, t, a, txt) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; svg.appendChild(e); return e; };
  const UP = '#2f7a4a', DN = '#a3141f', MUTED = '#76736c';
  const axis = (svg, lo, hi, X0, X1, Y0, Y1, step, fmt) => {
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) {
      const y = Y1 - (v - lo) / (hi - lo) * (Y1 - Y0);
      svgEl(svg, 'line', { x1: X0, x2: X1, y1: y, y2: y, stroke: '#eee' });
      svgEl(svg, 'text', { x: X0 - 6, y: y + 4, 'text-anchor': 'end', 'font-size': 11, fill: MUTED }, fmt(v));
    }
  };

  /* ---------------- four chart types ---------------- */
  const ctSvg = $('ctSvg'), ctTabs = $('ctTabs'), ctWhy = $('ctWhy');
  if (ctSvg && ctTabs) {
    const WIN = bars.slice(160, 320), wc = WIN.map((b) => b.c);
    const W = 680, H = 300, X0 = 48, X1 = 668, Y0 = 14, Y1 = 286;
    const lo = Math.floor(Math.min(...WIN.map((b) => b.l)) / 5) * 5 - 2, hi = Math.ceil(Math.max(...WIN.map((b) => b.h)) / 5) * 5 + 2;
    const y = (v) => Y1 - (v - lo) / (hi - lo) * (Y1 - Y0);
    const fmt = (v) => '$' + v;
    const WHY = {
      candle: 'Every trading day gets a candle, so all 160 days are here, quiet ones included. Green bodies closed higher than they opened, red ones lower; the wicks show how far the price strayed during the day.',
      pf: 'Each column is one uninterrupted move: X’s while the price rises, O’s while it falls, one symbol per $2 box. A new column starts only after a $6 reversal, so small wiggles leave no trace and horizontal levels where columns keep stopping stand out as support and resistance.',
      kagi: 'One line that only turns after a 3% reversal. It turns thick (“yang”) when the price breaks above the previous peak and thin (“yin”) when it breaks below the previous trough, a quick read of whether buyers or sellers are in control.',
      ohlc: 'The same 160 days as OHLC bars: each vertical line runs from the day’s low to its high, the left tick is the open and the right tick the close. Identical information to the candles, in a thinner, more compact form.',
      renko: 'Each $2 move in the closing price adds one brick, green up or red down; a red brick after green bricks needs a $4 fall. Long staircases of one colour are trends; the days in between are gone.'
    };
    const candle = () => {
      const bw = (X1 - X0) / WIN.length;
      WIN.forEach((b, i) => {
        const cx = X0 + (i + 0.5) * bw, col = b.c >= b.o ? UP : DN;
        svgEl(ctSvg, 'line', { x1: cx, x2: cx, y1: y(b.h), y2: y(b.l), stroke: col, 'stroke-width': 1 });
        svgEl(ctSvg, 'rect', { x: cx - bw * 0.36, y: y(Math.max(b.o, b.c)), width: bw * 0.72, height: Math.max(1, Math.abs(y(b.o) - y(b.c))), fill: col });
      });
    };
    const ohlc = () => {
      const bw = (X1 - X0) / WIN.length;
      WIN.forEach((b, i) => {
        const cx = X0 + (i + 0.5) * bw, col = b.c >= b.o ? UP : DN, t = bw * 0.42;
        svgEl(ctSvg, 'line', { x1: cx, x2: cx, y1: y(b.h), y2: y(b.l), stroke: col, 'stroke-width': 1.2 });
        svgEl(ctSvg, 'line', { x1: cx - t, x2: cx, y1: y(b.o), y2: y(b.o), stroke: col, 'stroke-width': 1.2 });
        svgEl(ctSvg, 'line', { x1: cx, x2: cx + t, y1: y(b.c), y2: y(b.c), stroke: col, 'stroke-width': 1.2 });
      });
    };
    const pf = () => {
      const B = 2, REV = 3; const cols = []; let dir = 0, top, bot;
      const start = Math.floor(wc[0] / B) * B; top = bot = start;
      for (const c of wc) {
        if (dir >= 0 && c >= top + B) { if (dir === 0) { dir = 1; cols.push({ d: 1, from: start + B, to: start }); } top = Math.floor(c / B) * B; cols[cols.length - 1].to = top; continue; }
        if (dir <= 0 && c <= bot - B) { if (dir === 0) { dir = -1; cols.push({ d: -1, from: start - B, to: start }); } bot = Math.ceil(c / B) * B; cols[cols.length - 1].to = bot; continue; }
        if (dir === 1 && c <= top - REV * B) { dir = -1; bot = Math.ceil(c / B) * B; cols.push({ d: -1, from: top - B, to: bot }); }
        else if (dir === -1 && c >= bot + REV * B) { dir = 1; top = Math.floor(c / B) * B; cols.push({ d: 1, from: bot + B, to: top }); }
      }
      const cw = Math.min(30, (X1 - X0) / cols.length);
      cols.forEach((col, i) => {
        const cx = X0 + (i + 0.5) * cw, a = Math.min(col.from, col.to), b = Math.max(col.from, col.to);
        for (let v = a; v <= b; v += B) {
          const cy = y(v + B / 2), s = Math.min(cw, Math.abs(y(v) - y(v + B))) * 0.36;
          if (col.d > 0) { svgEl(ctSvg, 'line', { x1: cx - s, y1: cy - s, x2: cx + s, y2: cy + s, stroke: UP, 'stroke-width': 1.6 }); svgEl(ctSvg, 'line', { x1: cx - s, y1: cy + s, x2: cx + s, y2: cy - s, stroke: UP, 'stroke-width': 1.6 }); }
          else svgEl(ctSvg, 'circle', { cx, cy, r: s, fill: 'none', stroke: DN, 'stroke-width': 1.6 });
        }
      });
    };
    const kagi = () => {
      // turning points: the line reverses only after a 4% move against the current extreme
      const R = 0.03, pts = [wc[0]]; let dir = 0, ext = wc[0];
      for (const c of wc) {
        if (dir === 0) { if (c >= wc[0] * (1 + R)) { dir = 1; ext = c; } else if (c <= wc[0] * (1 - R)) { dir = -1; ext = c; } continue; }
        if (dir === 1) { if (c > ext) ext = c; else if (c <= ext * (1 - R)) { pts.push(ext); dir = -1; ext = c; } }
        else { if (c < ext) ext = c; else if (c >= ext * (1 + R)) { pts.push(ext); dir = 1; ext = c; } }
      }
      pts.push(ext);
      const step = (X1 - X0) / pts.length;
      // thick ("yang") after breaking above the previous peak, thin ("yin") after breaking below the previous trough
      let thick = pts[1] > pts[0], prevHigh = null, prevLow = null;
      const seg = (x, p, q, th) => svgEl(ctSvg, 'line', { x1: x, x2: x, y1: y(p), y2: y(q), stroke: th ? UP : DN, 'stroke-width': th ? 4.5 : 1.6, 'stroke-linecap': 'square' });
      for (let i = 0; i < pts.length - 1; i++) {
        const x = X0 + (i + 0.5) * step, a = pts[i], b = pts[i + 1], up = b > a;
        if (up && !thick && prevHigh !== null && b > prevHigh) { seg(x, a, prevHigh, false); thick = true; seg(x, prevHigh, b, true); }
        else if (!up && thick && prevLow !== null && b < prevLow) { seg(x, a, prevLow, true); thick = false; seg(x, prevLow, b, false); }
        else seg(x, a, b, thick);
        if (i < pts.length - 2) svgEl(ctSvg, 'line', { x1: x, x2: x + step, y1: y(b), y2: y(b), stroke: thick ? UP : DN, 'stroke-width': thick ? 4.5 : 1.6 });
        if (up) prevHigh = b; else prevLow = b;
      }
    };
    const renko = () => {
      const B = 2; const bricks = []; let top = Math.floor(wc[0] / B) * B + B, bottom = top - B, dir = 0;
      for (const c of wc) {
        while (c >= top + B) { bricks.push({ lo: top, up: true }); bottom = top; top += B; dir = 1; }
        while (c <= bottom - B) { bricks.push({ lo: bottom - B, up: false }); top = bottom; bottom -= B; dir = -1; }
      }
      const bw = Math.min(14, (X1 - X0) / Math.max(bricks.length, 1));
      bricks.forEach((b, i) => svgEl(ctSvg, 'rect', { x: X0 + i * bw + 0.5, y: y(b.lo + B), width: bw - 1, height: y(b.lo) - y(b.lo + B), fill: b.up ? UP : DN, rx: 1 }));
    };
    const show = (v) => {
      ctSvg.innerHTML = '';
      axis(ctSvg, lo, hi, X0, X1, Y0, Y1, 10, fmt);
      ({ candle, ohlc, pf, kagi, renko })[v]();
      ctTabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
      ctWhy.textContent = WHY[v];
    };
    ctTabs.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) show(b.dataset.v); });
    show('candle');
  }

  /* ---------------- moving averages, crosses, RSI and MACD ---------------- */
  const sma = (a, n) => a.map((_, i) => (i < n - 1 ? null : a.slice(i - n + 1, i + 1).reduce((s, v) => s + v, 0) / n));
  const ema = (a, n) => { const k = 2 / (n + 1), out = []; a.forEach((v, i) => out.push(i ? v * k + out[i - 1] * (1 - k) : v)); return out; };
  const rsi = (a, n = 14) => {
    const out = Array(a.length).fill(null); let g = 0, l = 0;
    for (let i = 1; i <= n; i++) { const d = a[i] - a[i - 1]; g += Math.max(d, 0); l += Math.max(-d, 0); }
    g /= n; l /= n; out[n] = 100 - 100 / (1 + g / (l || 1e-9));
    for (let i = n + 1; i < a.length; i++) { const d = a[i] - a[i - 1]; g = (g * (n - 1) + Math.max(d, 0)) / n; l = (l * (n - 1) + Math.max(-d, 0)) / n; out[i] = 100 - 100 / (1 + g / (l || 1e-9)); }
    return out;
  };
  const maSvg = $('maSvg'), maPair = $('maPair'), maOsc = $('maOsc'), maWhy = $('maWhy');
  if (maSvg && maPair && maOsc) {
    let pair = [50, 200], osc = 'rsi';
    const W = 680, X0 = 48, X1 = 668, PY0 = 14, PY1 = 236, OY0 = 262, OY1 = 362;
    const x = (i) => X0 + i / (N - 1) * (X1 - X0);
    const lo = Math.floor(Math.min(...closes) / 10) * 10, hi = Math.ceil(Math.max(...closes) / 10) * 10;
    const y = (v) => PY1 - (v - lo) / (hi - lo) * (PY1 - PY0);
    const path = (arr, yf) => arr.map((v, i) => (v == null ? '' : `${arr[i - 1] == null ? 'M' : 'L'}${x(i).toFixed(1)} ${yf(v).toFixed(1)}`)).join('');
    const rsiV = rsi(closes);
    const m12 = ema(closes, 12), m26 = ema(closes, 26), macd = m12.map((v, i) => v - m26[i]), sig = ema(macd, 9);
    const draw = () => {
      maSvg.innerHTML = '';
      axis(maSvg, lo, hi, X0, X1, PY0, PY1, 20, (v) => '$' + v);
      const s = sma(closes, pair[0]), l = sma(closes, pair[1]);
      svgEl(maSvg, 'path', { d: path(closes, y), fill: 'none', stroke: '#a9a59c', 'stroke-width': 1.3 });
      svgEl(maSvg, 'path', { d: path(s, y), fill: 'none', stroke: '#2463d6', 'stroke-width': 2.2 });
      svgEl(maSvg, 'path', { d: path(l, y), fill: 'none', stroke: '#b8892b', 'stroke-width': 2.2 });
      const crosses = [];
      for (let i = 1; i < N; i++) if (s[i - 1] != null && l[i - 1] != null && (s[i - 1] - l[i - 1]) * (s[i] - l[i]) < 0) crosses.push({ i, gold: s[i] > l[i] });
      crosses.forEach((c) => {
        svgEl(maSvg, 'circle', { cx: x(c.i), cy: y(s[c.i]), r: 6.5, fill: c.gold ? '#e0b65a' : '#111', stroke: '#fff', 'stroke-width': 2 });
        svgEl(maSvg, 'text', { x: x(c.i), y: y(s[c.i]) + (c.gold ? 22 : -12), 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 800, fill: c.gold ? '#8a6414' : '#111' }, c.gold ? 'Golden cross' : 'Death cross');
      });
      svgEl(maSvg, 'text', { x: X0 + 6, y: PY0 + 12, 'font-size': 11.5, 'font-weight': 700, fill: '#2463d6' }, `${pair[0]}-day average`);
      svgEl(maSvg, 'text', { x: X0 + 120, y: PY0 + 12, 'font-size': 11.5, 'font-weight': 700, fill: '#8a6414' }, `${pair[1]}-day average`);
      // momentum panel
      svgEl(maSvg, 'rect', { x: X0, y: OY0, width: X1 - X0, height: OY1 - OY0, fill: '#faf8f3' });
      if (osc === 'rsi') {
        const oy = (v) => OY1 - v / 100 * (OY1 - OY0);
        svgEl(maSvg, 'rect', { x: X0, y: oy(100), width: X1 - X0, height: oy(70) - oy(100), fill: 'rgba(163,20,31,.08)' });
        svgEl(maSvg, 'rect', { x: X0, y: oy(30), width: X1 - X0, height: oy(0) - oy(30), fill: 'rgba(47,122,74,.08)' });
        [30, 70].forEach((v) => { svgEl(maSvg, 'line', { x1: X0, x2: X1, y1: oy(v), y2: oy(v), stroke: '#c9c4b8', 'stroke-dasharray': '3 3' }); svgEl(maSvg, 'text', { x: X0 - 6, y: oy(v) + 4, 'text-anchor': 'end', 'font-size': 11, fill: MUTED }, v); });
        svgEl(maSvg, 'path', { d: path(rsiV, oy), fill: 'none', stroke: '#7a4fb8', 'stroke-width': 1.5 });
        svgEl(maSvg, 'text', { x: X1 - 4, y: OY0 + 12, 'text-anchor': 'end', 'font-size': 11, fill: MUTED }, 'RSI: above 70 overbought, below 30 oversold');
      } else {
        const mx = Math.max(...macd.slice(30).map(Math.abs)) * 1.1;
        const oy = (v) => (OY0 + OY1) / 2 - v / mx * (OY1 - OY0) / 2;
        macd.forEach((v, i) => { if (i < 30) return; const hgt = v - sig[i]; svgEl(maSvg, 'rect', { x: x(i) - 0.6, y: Math.min(oy(0), oy(hgt)), width: 1.2, height: Math.abs(oy(hgt) - oy(0)), fill: hgt >= 0 ? 'rgba(47,122,74,.5)' : 'rgba(163,20,31,.5)' }); });
        svgEl(maSvg, 'line', { x1: X0, x2: X1, y1: oy(0), y2: oy(0), stroke: '#c9c4b8' });
        svgEl(maSvg, 'path', { d: path(macd.map((v, i) => (i < 30 ? null : v)), oy), fill: 'none', stroke: '#2463d6', 'stroke-width': 1.5 });
        svgEl(maSvg, 'path', { d: path(sig.map((v, i) => (i < 30 ? null : v)), oy), fill: 'none', stroke: '#c2412d', 'stroke-width': 1.3 });
        svgEl(maSvg, 'text', { x: X1 - 4, y: OY0 + 12, 'text-anchor': 'end', 'font-size': 11, fill: MUTED }, 'MACD (blue) vs signal (red); bars show the gap');
      }
      maPair.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === pair.join(','))));
      maOsc.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === osc)));
      const g = crosses.filter((c) => c.gold).length, d = crosses.length - g;
      maWhy.innerHTML = `With ${pair[0]}- and ${pair[1]}-day averages this history gives <b>${g} golden</b> and <b>${d} death</b> cross${d === 1 ? '' : 'es'}. ` +
        (pair[0] === 50 ? 'The slow pair signals rarely and late: each cross comes well after the turn in the grey price line.' : 'The faster pair catches each turn sooner, but in choppy, sideways markets it crosses back and forth and gives more false alarms: the trade-off every moving-average rule makes.') +
        (osc === 'rsi' ? ' Below, RSI spends the strong rises near or above 70 and the slides near 30.' : ' Below, MACD crossing its signal line is the faster cousin of the same crossover idea.');
    };
    maPair.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { pair = b.dataset.v.split(',').map(Number); draw(); } });
    maOsc.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { osc = b.dataset.v; draw(); } });
    draw();
  }

  /* ---------------- the studies menu ---------------- */
  const stTabs = $('stTabs'), stBody = $('stBody');
  if (stTabs && stBody) {
    const FAM = {
      'Momentum oscillators': [
        ['Relative Strength Index (RSI)', 'The speed and size of recent gains against recent losses, on a 0–100 scale.', 'Above 70 overbought (possible sell), below 30 oversold (possible buy); divergences from price.'],
        ['Chande Momentum Oscillator', 'The difference between the sum of recent gains and recent losses.', 'Like RSI but runs from +100 to −100; flags overbought and oversold, and trend strength.'],
        ['Momentum', 'How fast the price is changing: today’s price against the price a set number of days ago.', 'Oscillates around zero: above is bullish, below bearish; watch for divergences.'],
        ['Rate of Change (ROC)', 'The percentage change from the price a set number of days ago.', 'The same idea as Momentum, expressed as a percentage.']
      ],
      'Moving-average tools': [
        ['MACD', 'Trend and momentum: the gap between a 12-day and a 26-day exponential average.', 'MACD crossing its 9-day signal line gives buy or sell signals; crossing zero confirms a trend; divergences matter.'],
        ['Percentage Price Oscillator (PPO)', 'Like MACD, but the gap is shown as a percentage of the slower average.', 'Above zero bullish, below bearish; the percentage makes it comparable across stocks with different prices.'],
        ['Price Oscillator', 'The gap between any two moving averages of price.', 'A general momentum gauge, read like MACD for crossovers and divergences.']
      ],
      'Volume and money flow': [
        ['Accumulation/Distribution Line (ADL)', 'Whether a stock is being accumulated (bought) or distributed (sold), using price and volume.', 'Confirms a trend when it moves with price; a divergence can warn of a reversal.'],
        ['Chaikin Money Flow (CMF)', 'Buying and selling pressure over a period, by summing volume weighted by where each day closed in its range.', 'Above zero net buying pressure, below zero net selling; gauges trend strength.'],
        ['Chaikin Oscillator', 'The momentum of the ADL itself: the gap between two exponential averages of it.', 'Crossing above zero bullish, below bearish; divergences are significant.'],
        ['Force Index', 'The force behind a move: price change multiplied by volume.', 'Positive bullish force, negative bearish; confirms trends and spots corrections.'],
        ['Money Flow Index (MFI)', 'Overbought and oversold conditions, using price and volume together.', 'A volume-weighted RSI: above 80 overbought, below 20 oversold; divergences.'],
        ['Intraday Intensity (and %)', 'Buying and selling pressure each day, from where the close sits in the day’s range, times volume.', 'Like Chaikin Money Flow on a per-day basis; the % version scales it for comparison and divergences.']
      ],
      'Bands': [
        ['Envelope', 'Overbought and oversold conditions: lines a fixed percentage above and below a moving average.', 'Touching the upper band may mean overbought, the lower band oversold; a break through can signal a breakout.'],
        ['Keltner Channel', 'Volatility: bands set by the Average True Range above and below a moving average.', 'Like an envelope that widens in volatile markets; riding the upper or lower band shows a strong trend.']
      ]
    };
    const names = Object.keys(FAM);
    stTabs.innerHTML = names.map((n, i) => `<button type="button" data-i="${i}" aria-pressed="${i === 0}">${n} (${FAM[n].length})</button>`).join('');
    const show = (i) => {
      stTabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.i === i)));
      stBody.innerHTML = FAM[names[i]].map(([a, b, c]) => `<tr><td>${a}</td><td>${b}</td><td>${c}</td></tr>`).join('');
    };
    stTabs.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) show(+b.dataset.i); });
    show(0);
  }

  /* ---------------- candlestick pattern cheatsheet ----------------
     Each pattern: context trend ('down' / 'up' / none) drawn as grey candles, then the pattern
     candles as [open, high, low, close] on a 0–10 scale. */
  const cpGrid = $('cpGrid'), cpTabs = $('cpTabs');
  if (cpGrid && cpTabs) {
    const COL = { bull: '#2f7a4a', bear: '#a3141f', neutral: '#b8892b' };
    const KIND = { bull: 'Bullish', bear: 'Bearish', neutral: 'Indecision' };
    const P = [
      ['Hammer', 'bull', 'down', [[3.6, 4.5, 1.2, 4.4]], 'Small body at the top, lower wick at least twice the body. Sellers drove it down; buyers pushed it back.'],
      ['Inverted hammer', 'bull', 'down', [[2.4, 5.8, 2.3, 3.2]], 'Small body at the bottom, long upper wick, after a fall. Buyers tested higher; a strong next candle confirms.'],
      ['Dragonfly doji', 'bull', 'down', [[4.0, 4.05, 1.4, 4.0]], 'Opens and closes at the high, with a long lower wick. A rejection of lower prices.'],
      ['Bullish marubozu', 'bull', null, [[2.0, 8.0, 2.0, 8.0]], 'A long green body with no wicks: buyers in control from open to close.'],
      ['Bullish engulfing', 'bull', 'down', [[4.6, 4.8, 3.4, 3.6], [3.2, 5.6, 3.0, 5.4]], 'A green body completely covers the previous red body: buyers have taken over.'],
      ['Piercing line', 'bull', 'down', [[5.4, 5.6, 3.4, 3.6], [3.0, 5.0, 2.8, 4.8]], 'Opens below the prior low, closes above the middle of the prior red body.'],
      ['Bullish harami', 'bull', 'down', [[5.8, 6.0, 2.6, 2.8], [3.6, 4.6, 3.4, 4.4]], 'A small green body inside the previous big red one: the selling is losing force.'],
      ['Tweezer bottom', 'bull', 'down', [[4.6, 4.8, 2.4, 3.0], [3.0, 4.8, 2.4, 4.5]], 'Two candles with the same low: that level held twice.'],
      ['Morning star', 'bull', 'down', [[6.0, 6.2, 3.6, 3.8], [3.2, 3.6, 2.6, 3.0], [3.6, 6.0, 3.4, 5.8]], 'Big red, a small pause candle, then a big green closing well into the first. A classic bottom.'],
      ['Three white soldiers', 'bull', 'down', [[2.4, 4.0, 2.2, 3.8], [3.4, 5.4, 3.2, 5.2], [4.8, 6.8, 4.6, 6.6]], 'Three long green candles, each closing higher: a strong reversal upward.'],
      ['Hanging man', 'bear', 'up', [[7.8, 7.9, 4.6, 7.0]], 'The hammer’s shape at the top of a rise. A warning that sellers are appearing.'],
      ['Shooting star', 'bear', 'up', [[7.4, 10.2, 6.5, 6.6]], 'Small body at the bottom, long upper wick, after a rise. Buyers pushed up and lost.'],
      ['Gravestone doji', 'bear', 'up', [[7.0, 9.6, 6.95, 7.0]], 'Opens and closes at the low, with a long upper wick. A rejection of higher prices.'],
      ['Bearish marubozu', 'bear', null, [[8.0, 8.0, 2.0, 2.0]], 'A long red body with no wicks: sellers in control from open to close.'],
      ['Bearish engulfing', 'bear', 'up', [[6.4, 7.6, 6.2, 7.4], [7.8, 8.0, 5.6, 5.8]], 'A red body completely covers the previous green body: sellers have taken over.'],
      ['Dark cloud cover', 'bear', 'up', [[5.6, 7.6, 5.4, 7.4], [8.0, 8.2, 6.2, 6.4]], 'Opens above the prior high, closes below the middle of the prior green body.'],
      ['Bearish harami', 'bear', 'up', [[4.2, 7.6, 4.0, 7.4], [6.6, 6.8, 5.6, 5.8]], 'A small red body inside the previous big green one: the buying is losing force.'],
      ['Tweezer top', 'bear', 'up', [[6.4, 8.6, 6.2, 8.0], [8.0, 8.6, 6.4, 6.6]], 'Two candles with the same high: that level was rejected twice.'],
      ['Evening star', 'bear', 'up', [[4.4, 6.8, 4.2, 6.6], [7.0, 7.6, 6.8, 7.2], [6.6, 6.8, 4.4, 4.6]], 'Big green, a small pause candle, then a big red closing well into the first. A classic top.'],
      ['Three black crows', 'bear', 'up', [[7.8, 8.0, 6.2, 6.4], [6.8, 7.0, 4.8, 5.0], [5.4, 5.6, 3.4, 3.6]], 'Three long red candles, each closing lower: a strong reversal downward.'],
      ['Doji', 'neutral', null, [[5.0, 7.2, 2.8, 5.05]], 'Open and close almost equal: buyers and sellers fought to a draw. Meaningful after a long run.'],
      ['Spinning top', 'neutral', null, [[4.6, 7.4, 2.6, 5.4]], 'A small body with wicks on both sides: indecision, often a pause within a trend.']
    ];
    const card = ([name, kind, ctx, cs, text]) => {
      const W = 150, H = 96, f = cs[0], top = Math.max(f[0], f[3]), bot = Math.min(f[0], f[3]);
      // two grey candles leading into the pattern: falling into it, or rising into it
      const ctxC = ctx === 'down' ? [[top + 3.2, top + 3.4, top + 1.6, top + 1.8], [top + 2.0, top + 2.2, top + 0.4, top + 0.6]]
        : ctx === 'up' ? [[bot - 3.2, bot - 1.6, bot - 3.4, bot - 1.8], [bot - 2.0, bot - 0.4, bot - 2.2, bot - 0.6]] : [];
      const all = ctxC.map((c) => ({ c, grey: true })).concat(cs.map((c) => ({ c, grey: false })));
      const lo = Math.min(...all.map((a) => a.c[2])) - 0.4, hi = Math.max(...all.map((a) => a.c[1])) + 0.4;
      const y = (v) => 8 + (hi - v) / (hi - lo) * (H - 16);
      const slot = Math.min(26, (W - 20) / all.length), x0 = (W - slot * all.length) / 2;
      const body = all.map((a, i) => {
        const [o, h, l, c] = a.c, cx = x0 + (i + 0.5) * slot, up = c >= o;
        const col = a.grey ? '#c9c4b8' : (Math.abs(c - o) < 0.1 ? '#4a4a52' : up ? '#2f7a4a' : '#a3141f');
        const top = y(Math.max(o, c)), bh = Math.max(1.5, Math.abs(y(o) - y(c)));
        return `<line x1="${cx}" x2="${cx}" y1="${y(h)}" y2="${y(l)}" stroke="${col}" stroke-width="1.5"/><rect x="${cx - slot * 0.32}" y="${top}" width="${slot * 0.64}" height="${bh}" fill="${col}"/>`;
      }).join('');
      return `<div class="pat" data-k="${kind}" style="--c:${COL[kind]}"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${name}">${body}</svg><b>${name}</b><span class="pat-k">${KIND[kind]}${ctx ? ` · after a ${ctx === 'down' ? 'fall' : 'rise'}` : ''}</span><p>${text}</p></div>`;
    };
    cpGrid.innerHTML = P.map(card).join('');
    cpTabs.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      cpTabs.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      cpGrid.querySelectorAll('.pat').forEach((c) => { c.hidden = b.dataset.v !== 'all' && c.dataset.k !== b.dataset.v; });
    });
  }

  /* ---------------- Point & Figure pattern cheatsheet ----------------
     Columns as [direction, lowBox, highBox]; sig = [column, box] where the signal is given. */
  const ppGrid = $('ppGrid'), ppTabs = $('ppTabs');
  if (ppGrid && ppTabs) {
    const X = 1, O = -1;
    const P = [
      ['Double top breakout', 'bull', [[X, 2, 6], [O, 3, 5], [X, 4, 7]], [2, 7], 'The second X column rises one box above the first: the simplest buy signal.'],
      ['Double bottom breakdown', 'bear', [[O, 2, 6], [X, 3, 5], [O, 1, 4]], [2, 1], 'The second O column falls one box below the first: the simplest sell signal.'],
      ['Triple top breakout', 'bull', [[X, 2, 6], [O, 3, 5], [X, 4, 6], [O, 3, 5], [X, 4, 7]], [4, 7], 'Two failures at the same level, then a break through it on the third try: a stronger buy.'],
      ['Triple bottom breakdown', 'bear', [[O, 2, 6], [X, 3, 5], [O, 2, 4], [X, 3, 5], [O, 1, 4]], [4, 1], 'Support holds twice, then gives way on the third test: a stronger sell.'],
      ['Ascending triple top', 'bull', [[X, 1, 5], [O, 2, 4], [X, 3, 6], [O, 3, 5], [X, 4, 7]], [4, 7], 'Each X column tops the last and each O column bottoms higher: a rising staircase of buy signals.'],
      ['Descending triple bottom', 'bear', [[O, 3, 7], [X, 4, 6], [O, 2, 5], [X, 3, 5], [O, 1, 4]], [4, 1], 'Each O column breaks lower and each rally stalls lower: a falling staircase of sell signals.'],
      ['Bullish catapult', 'bull', [[X, 2, 6], [O, 3, 5], [X, 4, 6], [O, 3, 5], [X, 4, 7], [O, 4, 6], [X, 5, 8]], [6, 8], 'A triple top breakout, a pullback, then a double top breakout: the move is “launched”.'],
      ['Bullish triangle', 'bull', [[X, 1, 7], [O, 2, 6], [X, 3, 6], [O, 3, 5], [X, 4, 7]], [4, 7], 'Lower highs and higher lows squeeze together; the break above the last X column is the buy.'],
      ['High pole', 'bear', [[O, 2, 5], [X, 3, 11], [O, 5, 10]], [2, 6], 'A sudden tall X column, then O’s giving back more than half of it: a warning the rally has failed.'],
      ['Low pole', 'bull', [[X, 6, 9], [O, 1, 8], [X, 2, 6]], [2, 5], 'A sudden deep O column, then X’s recovering more than half of it: a warning the slide has ended.']
    ];
    const COL = { bull: '#2f7a4a', bear: '#a3141f' };
    const card = ([name, kind, cols, sig, text]) => {
      const lo = Math.min(...cols.map((c) => c[1])), hi = Math.max(...cols.map((c) => c[2]));
      const rows = hi - lo + 1, cell = Math.min(14, 84 / rows), W = 180, H = rows * cell + 12;
      const x0 = (W - cols.length * cell) / 2;
      let out = '';
      cols.forEach(([d, a, b], ci) => {
        for (let v = a; v <= b; v++) {
          const cx = x0 + (ci + 0.5) * cell, cy = 6 + (hi - v + 0.5) * cell, s = cell * 0.32, isSig = sig[0] === ci && sig[1] === v;
          if (isSig) out += `<rect x="${cx - cell / 2}" y="${cy - cell / 2}" width="${cell}" height="${cell}" fill="#f6d98a"/>`;
          out += d > 0
            ? `<line x1="${cx - s}" y1="${cy - s}" x2="${cx + s}" y2="${cy + s}" stroke="#2f7a4a" stroke-width="1.5"/><line x1="${cx - s}" y1="${cy + s}" x2="${cx + s}" y2="${cy - s}" stroke="#2f7a4a" stroke-width="1.5"/>`
            : `<circle cx="${cx}" cy="${cy}" r="${s}" fill="none" stroke="#a3141f" stroke-width="1.5"/>`;
        }
      });
      // the level being broken
      const [sc, sv] = sig, prevLevel = kind === 'bull' ? sv - 1 : sv + 1;
      const ly = 6 + (hi - prevLevel + (kind === 'bull' ? 0 : 1)) * cell;
      out += `<line x1="${x0 - 4}" x2="${x0 + (sc + 1) * cell + 4}" y1="${ly}" y2="${ly}" stroke="${COL[kind]}" stroke-dasharray="3 2" stroke-width="1"/>`;
      return `<div class="pat" data-k="${kind}" style="--c:${COL[kind]}"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${name}">${out}</svg><b>${name}</b><span class="pat-k">${kind === 'bull' ? 'Buy signal' : 'Sell signal'}</span><p>${text}</p></div>`;
    };
    ppGrid.innerHTML = P.map(card).join('');
    ppTabs.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      ppTabs.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      ppGrid.querySelectorAll('.pat').forEach((c) => { c.hidden = b.dataset.v !== 'all' && c.dataset.k !== b.dataset.v; });
    });
  }
})();
