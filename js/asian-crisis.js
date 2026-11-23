/* 1997 Asian financial crisis explainer: reveal-on-scroll, progress bar, TOC,
   copy link, and the D3 contagion timelapse map. */
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

/* ---------------- The contagion timelapse map ----------------
   Cropped to East and Southeast Asia. Countries turn red as they are hit, the newest one gets a
   pulsing outline, each hit country shows its currency's fall, and the last step marks the
   economies that held up (Hong Kong and Singapore are dots: too small for the base map). */
(function () {
  const svgEl = document.getElementById('crisisMap'); if (!svgEl) return;
  if (!window.d3 || !window.topojson || !window.__WORLD110M) {
    const fig = svgEl.closest('.fig'); if (fig) fig.insertAdjacentHTML('beforeend', '<p class="map-why">The map could not load (no internet connection?).</p>');
    return;
  }
  const yearEl = document.getElementById('crisisStep');
  const whyEl = document.getElementById('crisisWhy');
  const playBtn = document.getElementById('crisisPlay');
  const scrub = document.getElementById('crisisScrub');

  const HIT_ALL = ['Thailand', 'Philippines', 'Malaysia', 'Indonesia', 'South Korea'];
  const PHASES = [
    { t: 'Early 1997', hit: [], note: 'Calm before the storm. Thailand, Indonesia, Malaysia, the Philippines and South Korea have boomed for years on foreign money, much of it short-term dollar loans. Several peg their currencies to the US dollar.' },
    { t: 'May–Jun 1997', hit: [], warn: 'Thailand', note: 'Speculators attack the Thai baht, betting the dollar peg can’t hold. Thailand quietly burns through its reserves defending it, much of them already promised away in forward deals.' },
    { t: '2 July 1997', hit: ['Thailand'], who: 'Thailand', note: 'Out of usable reserves, Thailand lets the baht float. It falls sharply, on its way to losing more than half its value. Thai firms that borrowed in dollars now owe far more in baht.' },
    { t: 'July 1997', hit: ['Thailand', 'Philippines', 'Malaysia'], who: ['Philippines', 'Malaysia'], note: 'Contagion. The Philippines floats the peso on 11 July, and Malaysia stops defending the ringgit days later. Investors see the same weakness next door, short-term dollar debt behind a peg, and pull money out.' },
    { t: 'Aug 1997 – Jan 1998', hit: ['Thailand', 'Philippines', 'Malaysia', 'Indonesia'], who: 'Indonesia', note: 'Indonesia floats the rupiah in August and is hit hardest: by January it has lost about 80% of its value. Companies that owe dollars are ruined, and the turmoil will help topple Suharto in 1998.' },
    { t: 'Nov–Dec 1997', hit: HIT_ALL, who: 'South Korea', note: 'The panic jumps to South Korea, a far larger, richer economy. The won crashes as banks fail to roll over short-term debt, and in December Korea takes the biggest IMF rescue to that point, about $58 billion.' },
    { t: '1998', hit: HIT_ALL, held: true, note: 'The IMF arrives with record bailouts and tough conditions, and the hit economies shrink. Hong Kong, Singapore, Taiwan, China and Japan (blue) take a knock but avoid a currency collapse. Part 9 explains why.' }
  ];
  const FALL = { 'Thailand': 'baht −56%', 'Philippines': 'peso −41%', 'Malaysia': 'ringgit −46%', 'Indonesia': 'rupiah −81%', 'South Korea': 'won −55%' };
  const HELD = new Set(['Taiwan', 'China', 'Japan']);
  const DOTS = [{ n: 'Hong Kong', ll: [114.17, 22.32], dx: 10, dy: 12 }, { n: 'Singapore', ll: [103.82, 1.35], dx: -8, dy: 22, anchor: 'end' }];

  const world = window.__WORLD110M;
  const feats = topojson.feature(world, world.objects.countries).features;
  const REGION = new Set(['Thailand', 'Indonesia', 'Malaysia', 'Philippines', 'South Korea', 'North Korea', 'Japan', 'China', 'Taiwan', 'Vietnam', 'Myanmar', 'Cambodia', 'Laos', 'Brunei', 'Papua New Guinea', 'Timor-Leste', 'Mongolia', 'India', 'Bangladesh']);
  const region = feats.filter((f) => REGION.has(f.properties.name));
  const focus = region.filter((f) => HIT_ALL.includes(f.properties.name) || f.properties.name === 'Taiwan');

  const svg = d3.select(svgEl);
  const W = () => svgEl.clientWidth || 680, H = () => svgEl.clientHeight || 440;
  const g = svg.append('g');
  const cty = g.selectAll('path').data(region).join('path').attr('class', 'cmap').style('fill', '#efece3').attr('stroke', '#fff').attr('stroke-width', 0.6);
  const dots = g.selectAll('g.cdot').data(DOTS).join('g').attr('class', 'cdot');
  dots.append('circle').attr('r', 5).attr('stroke', '#fff').attr('stroke-width', 1.5).style('fill', '#cfcabe');
  dots.append('text').attr('font-family', 'Inter').attr('font-size', 10.5).attr('font-weight', 700).attr('fill', '#2a2a2e').attr('paint-order', 'stroke').attr('stroke', '#fff').attr('stroke-width', 2.5)
    .attr('x', (d) => d.dx).attr('y', (d) => d.dy - 10).attr('text-anchor', (d) => d.anchor || 'start').text((d) => d.n);
  const labels = g.selectAll('g.clab').data(region.filter((f) => HIT_ALL.includes(f.properties.name))).join('g').attr('class', 'clab');
  labels.append('text').attr('text-anchor', 'middle').attr('font-family', 'Inter').attr('font-size', 11.5).attr('font-weight', 800)
    .attr('paint-order', 'stroke').attr('stroke', '#fff').attr('stroke-width', 3).attr('fill', '#2a2a2e')
    .text((d) => d.properties.name === 'South Korea' ? 'S. Korea' : d.properties.name);
  const badge = labels.append('g').attr('class', 'cbadge').attr('transform', 'translate(0 16)');
  badge.append('rect').attr('rx', 3).attr('height', 17).attr('y', -12).attr('fill', '#8a2a1c');
  badge.append('text').attr('text-anchor', 'middle').attr('font-family', 'Inter').attr('font-size', 10.5).attr('font-weight', 700).attr('fill', '#fff').text((d) => FALL[d.properties.name]);
  badge.each(function () { const t = this.querySelector('text'); const w = t.getComputedTextLength() + 12; d3.select(this).select('rect').attr('x', -w / 2).attr('width', w); });
  // label anchors as lon/lat so they stay put at every screen size (Malaysia's sits on Malaysian Borneo)
  const AT = { 'Thailand': [101, 15.6], 'Philippines': [123.6, 12.2], 'Malaysia': [114.2, 3.2], 'Indonesia': [113, -5], 'South Korea': [128, 36.6] };

  let proj, path;
  function fit() {
    proj = d3.geoMercator().fitExtent([[18, 16], [W() - 18, H() - 16]], { type: 'FeatureCollection', features: focus });
    path = d3.geoPath(proj);
    cty.attr('d', path);
    dots.attr('transform', (d) => { const p = proj(d.ll); return `translate(${p[0]},${p[1]})`; });
    labels.attr('transform', (d) => { const c = proj(AT[d.properties.name]); return `translate(${c[0]},${c[1]})`; });
  }
  fit();

  const RED = '#c2412d', HELDC = '#7d9bc4', WARN = '#e8b4a8';
  function render(i) {
    const p = PHASES[i];
    const hit = new Set(p.hit), newest = new Set([].concat(p.who || []));
    cty.style('fill', (d) => {
      const n = d.properties.name;
      if (hit.has(n)) return RED;
      if (p.warn === n) return WARN;
      if (p.held && HELD.has(n)) return HELDC;
      return '#efece3';
    }).classed('epi', (d) => newest.has(d.properties.name));
    dots.select('circle').style('fill', p.held ? HELDC : '#cfcabe');
    labels.select('.cbadge').classed('on', (d) => hit.has(d.properties.name));
    if (yearEl) yearEl.textContent = p.t;
    if (whyEl) whyEl.textContent = p.note;
    if (scrub) scrub.value = i;
  }

  let timer = 0, playing = false;
  function stop() { playing = false; clearInterval(timer); if (playBtn) { playBtn.textContent = '▶ Play'; playBtn.setAttribute('aria-label', 'Play'); } }
  function play() {
    let i = +scrub.value;
    if (i >= PHASES.length - 1) { i = 0; render(0); }
    playing = true; if (playBtn) { playBtn.textContent = '❚❚ Pause'; playBtn.setAttribute('aria-label', 'Pause'); }
    clearInterval(timer);
    timer = setInterval(() => { i++; render(i); if (i >= PHASES.length - 1) stop(); }, reduced ? 900 : 2600);
  }
  if (playBtn) playBtn.addEventListener('click', () => { if (playing) stop(); else play(); });
  if (scrub) { scrub.max = PHASES.length - 1; scrub.addEventListener('input', () => { stop(); render(+scrub.value); }); }

  render(0);
  if (!reduced) {
    new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { o.disconnect(); setTimeout(play, 400); } }), { threshold: 0.4 }).observe(svgEl);
  }
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(fit, 200); });
})();

/* ---------------- How far the currencies fell (bars) ---------------- */
(function () {
  const s = document.getElementById('fallSvg'); if (!s) return;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const tx = (p, x, y, str, a = {}) => { const t = el('text', Object.assign({ x, y, 'font-family': 'Inter' }, a), p); t.textContent = str; return t; };
  const ROWS = [['Indonesian rupiah', 81], ['Thai baht', 56], ['Korean won', 55], ['Malaysian ringgit', 46], ['Philippine peso', 41], ['Hong Kong dollar', 0]];
  const L = 150, R = 600, T = 18, rh = 30, gap = 13;
  const X = (v) => L + v / 100 * (R - L);
  [0, 25, 50, 75, 100].forEach((v) => { el('line', { x1: X(v), x2: X(v), y1: T - 6, y2: T + ROWS.length * (rh + gap) - gap + 4, stroke: v ? '#ece8df' : '#cfcabe' }, s); tx(s, X(v), T + ROWS.length * (rh + gap) + 10, v + '%', { 'text-anchor': 'middle', 'font-size': 10.5, fill: '#8a8578' }); });
  ROWS.forEach(([name, v], i) => {
    const y = T + i * (rh + gap);
    tx(s, L - 10, y + rh / 2 + 4, name, { 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 700, fill: '#1f1f22' });
    if (!v) { tx(s, L + 8, y + rh / 2 + 4, 'held its peg: 0%', { 'font-size': 12, 'font-weight': 700, fill: '#5d7fae' }); return; }
    const bar = el('rect', { class: 'fall-bar', x: L, y, width: X(v) - L, height: rh, fill: v > 70 ? '#8a2a1c' : '#c2412d' }, s);
    bar.style.setProperty('--i', i);
    tx(s, X(v) + 8, y + rh / 2 + 4, '−' + v + '%', { class: 'fall-lab', 'font-size': 13, 'font-weight': 800, fill: '#1f1f22', style: `--i:${i}` });
  });
  tx(s, L, T + ROWS.length * (rh + gap) + 28, 'Share of value lost against the US dollar', { 'font-size': 11, fill: '#8a8578' });
})();

/* ---------------- Animated analogy: the same dollar loan, a falling baht ---------------- */
(function () {
  const s = document.getElementById('debtSvg'); if (!s) return;
  const K = window.SceneKit;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const tx = (p, x, y, str, a = {}) => { const t = el('text', Object.assign({ x, y, 'font-family': 'Inter' }, a), p); t.textContent = str; return t; };
  const F = 330;
  el('rect', { x: 0, y: 0, width: 800, height: 360, fill: '#f3efe6' }, s);
  el('rect', { x: 0, y: F, width: 800, height: 30, fill: '#d8d0bf' }, s);
  // the owner at a desk
  el('rect', { x: 40, y: 250, width: 170, height: 10, fill: '#8a6d3b' }, s);
  el('rect', { x: 52, y: 260, width: 8, height: F - 260, fill: '#6e5530' }, s);
  el('rect', { x: 190, y: 260, width: 8, height: F - 260, fill: '#6e5530' }, s);
  if (K) K.person(s, 125, { floor: F, sh: 176, seated: true, top: '#6b8f71', pants: '#2b2b30', hair: K.hair.short, hairColor: '#1b1b1b', skin: K.SKINS[2], arms: 'hold', smile: -3 });
  const sweat = el('g', { class: 'dbt-sweat' }, s);
  el('path', { d: 'M150 120 q4 8 0 12 q-4 -4 0 -12 Z', fill: '#7fb3e0' }, sweat);
  // the fixed things: the loan in dollars, the income in baht
  const box = (x, y, w, h, title, val, col) => { el('rect', { x, y, width: w, height: h, rx: 8, fill: '#fff', stroke: '#d8d2c4', 'stroke-width': 2 }, s); tx(s, x + 14, y + 22, title, { 'font-size': 11, 'font-weight': 700, fill: '#8a8578', 'letter-spacing': '.08em' }); return tx(s, x + 14, y + 52, val, { 'font-size': 26, 'font-weight': 800, fill: col }); };
  box(250, 26, 200, 68, 'THE LOAN, IN DOLLARS', '$1 million', '#1f1f22');
  box(250, 108, 200, 68, 'SALES A YEAR, IN BAHT', '30 million', '#5f8a63');
  // the exchange rate dial and the baht needed to repay
  el('rect', { x: 480, y: 26, width: 290, height: 150, rx: 8, fill: '#fff', stroke: '#d8d2c4', 'stroke-width': 2 }, s);
  tx(s, 494, 48, 'BAHT PER DOLLAR', { 'font-size': 11, 'font-weight': 700, fill: '#8a8578', 'letter-spacing': '.08em' });
  const rateT = tx(s, 494, 86, '25', { 'font-size': 34, 'font-weight': 800, fill: '#c2412d' });
  tx(s, 494, 120, 'BAHT NEEDED TO REPAY THE LOAN', { 'font-size': 11, 'font-weight': 700, fill: '#8a8578', 'letter-spacing': '.08em' });
  const needT = tx(s, 494, 156, '25 million', { 'font-size': 26, 'font-weight': 800, fill: '#1f1f22' });
  // the pile of baht notes that grows with the rate
  const pile = el('g', {}, s);
  const notes = [];
  for (let i = 0; i < 22; i++) {
    const r = el('rect', { x: 560 + (i % 2) * 6, y: F - 8 - i * 6.5, width: 120, height: 6, rx: 1.5, fill: i % 2 ? '#9a6fb0' : '#b085c4', stroke: '#6e4a80', 'stroke-width': .6 }, pile);
    notes.push(r);
  }
  tx(s, 620, F + 20, 'baht owed', { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#5d5a55' });
  // compare: the year's sales as a fixed pile
  for (let i = 0; i < 13; i++) el('rect', { x: 400, y: F - 8 - i * 6.5, width: 120, height: 6, rx: 1.5, fill: i % 2 ? '#5f8a63' : '#7fae84', stroke: '#3f6a45', 'stroke-width': .6 }, s);
  tx(s, 460, F + 20, 'a year’s sales', { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#5d5a55' });

  const reduced2 = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function frame(rate) {
    rateT.textContent = rate.toFixed(0);
    needT.textContent = rate.toFixed(0) + ' million';
    const shown = Math.round(rate / 56 * notes.length);
    notes.forEach((n, i) => n.setAttribute('opacity', i < shown ? 1 : 0));
    needT.setAttribute('fill', rate > 30 ? '#c2412d' : '#1f1f22');
    sweat.setAttribute('opacity', rate > 38 ? 1 : 0);
  }
  if (reduced2) { frame(56); return; }
  frame(25);
  // while on screen: the rate slides from 25 to 56 over ~5s, holds, then resets
  let raf = 0, on = false, t0 = 0;
  const loop = (t) => {
    if (!on) return;
    const c = ((t - t0) / 1000) % 9;
    const p = c < 1 ? 0 : c < 6 ? (c - 1) / 5 : 1;
    frame(25 + (56 - 25) * (p * p * (3 - 2 * p)));
    raf = requestAnimationFrame(loop);
  };
  new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting && !on) { on = true; t0 = performance.now(); raf = requestAnimationFrame(loop); }
    if (!e.isIntersecting) { on = false; cancelAnimationFrame(raf); }
  })).observe(s);
})();

/* ---------------- The per-country bailout outcome tabs ---------------- */
(function () {
  const tabs = document.getElementById('octabs');
  const panel = document.getElementById('ocpanel');
  if (!tabs || !panel) return;

  // verdict: 'win' (relative success), 'mixed', 'fail'
  const DATA = {
    thailand: {
      name: 'Thailand', verdict: 'mixed', vlabel: 'Mixed', gdp: '\u22129.4%',
      got: 'An IMF-led package of about $17 billion (August 1997), the first of the rescues, after it floated the baht.',
      asked: 'Austerity and a tight budget, high interest rates, and closing or merging insolvent finance companies and banks.',
      implemented: 'Broadly carried out the programme and stayed with the IMF for years, closing dozens of finance companies and recapitalising banks, though the clean-up was slow and the social cost heavy.',
      happened: 'A deep 1998 recession (GDP down about 9.4%) and heavy bank losses, but the baht stabilised and exports recovered. Thailand stayed under IMF programmes for years.',
      why: 'As the origin, Thailand bore the first shock and the slowest cleanup, but it did follow the programme and return to growth. Judged a workable, if painful, rescue rather than a clear win or failure.'
    },
    indonesia: {
      name: 'Indonesia', verdict: 'fail', vlabel: 'Failed',
      gdp: '\u221213.7%',
      got: 'An IMF stand-by credit of about $10 billion within a package of roughly $23 billion (November 1997), later renegotiated more than once.',
      asked: 'The standard austerity and high rates, plus deep structural and "crony-capitalism" reforms, including cutting subsidies and dismantling politically connected monopolies.',
      implemented: 'The programme stalled on politics. President Suharto backtracked on commitments and resisted raising rates even when the IMF chief flew in to press him. A botched round of bank closures in late 1997 sparked bank runs rather than calming them; the Bank Restructuring Agency (IBRA), set up in January 1998, moved slowly while political interference and the Suharto succession crisis made any credible plan impossible. Weak governance deepened the crisis and delayed the fix.',
      happened: 'The worst outcome of all: the rupiah lost about 80%, GDP fell about 13.7% in 1998, prices and unemployment soared, and cuts to fuel and food subsidies helped trigger riots and the fall of the Suharto government.',
      why: 'The IMF\u2019s own evaluators later said the first programme failed, less because the conditions were wrong on paper than because they were never credibly carried out: reforms were reversed, bank closures were mishandled, and the political collapse destroyed the confidence the programme was meant to restore.'
    },
    korea: {
      name: 'South Korea', verdict: 'win', vlabel: 'Relative success',
      gdp: '\u22125.8%',
      got: 'The largest IMF-led rescue in history to that point, about $58 billion including bilateral commitments (December 1997).',
      asked: 'High interest rates and tight budgets, opening up to foreign capital and ownership, restructuring the heavily indebted chaebol and their banks, and loosening a rigid labour market.',
      implemented: 'Carried out fast, and with striking public buy-in. Korea pushed through chaebol and bank restructuring, merged or closed weak banks, lifted limits on foreign ownership, and, most painfully, allowed layoffs in a system built on jobs for life. In a national gold-collecting campaign in early 1998, some 3.5 million citizens donated about 227 tonnes of gold (roughly $2 billion) to help repay the debt. Korea took real ownership of the reforms and repaid the IMF ahead of schedule.',
      happened: 'A sharp but short recession (GDP down about 5.8% in 1998), then a fast V-shaped recovery. Korea reformed its banks and chaebol, rebuilt reserves, and repaid the IMF ahead of schedule.',
      why: 'The clearest success, largely because of how it was executed: a capable state and a cohesive public drove the reforms through quickly rather than resisting them, so the breathing room the loan bought was actually used.'
    },
    malaysia: {
      name: 'Malaysia', verdict: 'mixed', vlabel: 'Different path',
      gdp: '\u22126.7%',
      got: 'Nothing from the IMF. Malaysia refused a programme and its conditions entirely.',
      asked: 'Not applicable. Instead, in 1998 Malaysia did the opposite of the IMF template: it imposed capital controls and pegged the ringgit, rather than raising rates and opening up.',
      implemented: 'Did it its own way and in full: in September 1998 it fixed the ringgit, restricted capital from leaving, and used lower rates and public spending to support the economy, exactly the reverse of the IMF script, and stuck with it.',
      happened: 'A real recession (GDP down about 6.7% in 1998), milder than Indonesia\u2019s or Thailand\u2019s, followed by a recovery that held. The controls were widely condemned at the time but did not cause the lasting flight of investors that critics predicted.',
      why: 'The crisis\u2019s natural experiment: the same shock, the opposite response. Once treated as reckless, Malaysia\u2019s capital controls are now seen by many as a defensible way to buy time and stop a panic.'
    }
  };
  const ORDER = ['thailand', 'indonesia', 'korea', 'malaysia'];

  function esc(s) { return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }

  function show(key) {
    const d = DATA[key]; if (!d) return;
    [...tabs.querySelectorAll('button')].forEach((b) => b.setAttribute('aria-selected', String(b.dataset.c === key)));
    panel.className = 'ocpanel v-' + d.verdict;
    panel.innerHTML =
      '<div class="ochead">' +
        '<h4>' + esc(d.name) + '</h4>' +
        '<span class="ocverdict">' + esc(d.vlabel) + '</span>' +
        '<span class="ocgdp"><b>' + esc(d.gdp) + '</b> GDP, 1998</span>' +
      '</div>' +
      '<dl class="ocrows">' +
        '<div><dt>What it got</dt><dd>' + esc(d.got) + '</dd></div>' +
        '<div><dt>What it was asked to do</dt><dd>' + esc(d.asked) + '</dd></div>' +
        (d.implemented ? '<div><dt>How it carried it out</dt><dd>' + esc(d.implemented) + '</dd></div>' : '') +
        '<div><dt>What happened</dt><dd>' + esc(d.happened) + '</dd></div>' +
        '<div><dt>Why it succeeded or failed</dt><dd>' + esc(d.why) + '</dd></div>' +
      '</dl>';
  }

  tabs.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b && b.dataset.c) show(b.dataset.c); });
  tabs.addEventListener('keydown', (e) => {
    const btns = [...tabs.querySelectorAll('button')];
    const i = btns.findIndex((b) => b.getAttribute('aria-selected') === 'true');
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const ni = (i + (e.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length;
      btns[ni].focus(); show(btns[ni].dataset.c);
    }
  });
  show(ORDER[0]);

  // 1998 GDP bars above the tabs: compare at a glance, click one to open that country
  const bars = document.getElementById('gdpBars');
  if (bars) {
    const G = [['indonesia', 'Indonesia', 13.7], ['thailand', 'Thailand', 9.4], ['malaysia', 'Malaysia', 6.7], ['korea', 'South Korea', 5.8]];
    bars.innerHTML = '<div class="gb-title">Real GDP, 1998</div>' + G.map(([k, n, v]) =>
      `<button type="button" class="gb" data-c="${k}"><span class="gb-n">${n}</span><span class="gb-t"><i style="--w:${(v / 14 * 100).toFixed(1)}%"></i></span><b>\u2212${v}%</b></button>`).join('');
    bars.addEventListener('click', (e) => { const b = e.target.closest('.gb'); if (!b) return; show(b.dataset.c); bars.querySelectorAll('.gb').forEach((x) => x.classList.toggle('on', x === b)); });
    bars.querySelector('[data-c="thailand"]').classList.add('on');
    tabs.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) bars.querySelectorAll('.gb').forEach((x) => x.classList.toggle('on', x.dataset.c === b.dataset.c)); });
  }
})();
