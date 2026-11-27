/* Bottleneck: The Safety Lab That Became a Juggernaut (html/explainers/anthropic-story.html)
   Page chrome with a per-chapter accent colour, the scrolling story (Parts 1–5) with the critics'
   counterpoint to each card pinned beside it, the full event list, and two ARIA tablists ("two versions" and the criticisms) that cross-fade their
   panels. Every animation is skipped under prefers-reduced-motion. */
(function () {
  const $ = (id) => document.getElementById(id);
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NARROW = matchMedia('(max-width: 767px)');

  /* Cross-fade a panel to new HTML, animating its height so the page below doesn't jump. */
  function swap(panel, html) {
    if (REDUCE || !panel.firstElementChild) { panel.innerHTML = html; return; }
    const h0 = panel.offsetHeight;
    panel.style.height = h0 + 'px';
    panel.classList.add('is-out');
    clearTimeout(panel._t1); clearTimeout(panel._t2);
    panel._t1 = setTimeout(() => {
      panel.innerHTML = html;
      panel.style.height = 'auto';
      const h1 = panel.offsetHeight;
      panel.style.height = h0 + 'px';
      void panel.offsetHeight;                 // commit the old height before animating to the new one
      panel.style.height = h1 + 'px';
      panel.classList.remove('is-out');
      panel._t2 = setTimeout(() => { panel.style.height = ''; }, 420);
    }, 170);
  }

  /* A WAI-ARIA tablist: a sliding indicator behind the selected tab, arrow / Home / End keys,
     roving tabindex, and a tabpanel whose content cross-fades. */
  function tablist(list, panel, render, idPrefix) {
    list.setAttribute('role', 'tablist');
    panel.setAttribute('role', 'tabpanel');
    panel.tabIndex = 0;
    list.insertAdjacentHTML('afterbegin', '<span class="tab-ind" aria-hidden="true"></span>');
    const ind = list.querySelector('.tab-ind');
    const tabs = [...list.querySelectorAll('[data-i]')];
    tabs.forEach((t, i) => { t.setAttribute('role', 'tab'); t.id = idPrefix + i; t.setAttribute('aria-controls', panel.id); });
    let cur = -1;
    const place = () => {
      const t = tabs[cur]; if (!t) return;
      ind.style.transform = `translate(${t.offsetLeft}px, ${t.offsetTop}px)`;
      ind.style.width = t.offsetWidth + 'px';
      ind.style.height = t.offsetHeight + 'px';
    };
    const select = (i, focus) => {
      if (i === cur) return;
      const first = cur < 0;
      cur = i;
      tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
      panel.setAttribute('aria-labelledby', tabs[i].id);
      place();
      if (focus) tabs[i].focus();
      if (first) { panel.innerHTML = render(i); requestAnimationFrame(() => list.classList.add('ready')); }
      else swap(panel, render(i));
    };
    list.addEventListener('click', (e) => { const t = e.target.closest('[data-i]'); if (t) select(+t.dataset.i); });
    list.addEventListener('keydown', (e) => {
      const n = tabs.length;
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      let i;
      if (step !== undefined) i = (cur + step + n) % n;
      else if (e.key === 'Home') i = 0;
      else if (e.key === 'End') i = n - 1;
      else return;
      e.preventDefault(); select(i, true);
    });
    addEventListener('resize', place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    select(0);
  }

  /* ---------------- reveal-on-scroll, progress bar, contents, copy link ---------------- */
  const rio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in-view'); rio.unobserve(e.target);
  }), { threshold: 0, rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.rv').forEach((e) => rio.observe(e));
  const prog = $('prog'), tocLinks = [...document.querySelectorAll('#toc a')];
  const secs = tocLinks.map((a) => document.querySelector(a.getAttribute('href')));
  // each chapter borrows its era's colour; the analysis chapters (6–8) stay in 2026 red
  const CHAPTER = ['#76736c', '#2463d6', '#2f7a4a', '#b8892b', '#a3141f', '#a3141f', '#a3141f', '#a3141f', '#a3141f'];
  secs.forEach((sec, i) => { const n = sec && sec.querySelector('.n'); if (n) n.style.color = CHAPTER[i]; });
  let lastChapter = -1;
  const onScroll = () => {
    const h = document.documentElement;
    if (prog) prog.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
    let cur = 0; secs.forEach((sec, i) => { if (sec && sec.getBoundingClientRect().top < innerHeight * .35) cur = i; });
    tocLinks.forEach((a, i) => a.classList.toggle('on', i === cur));
    if (cur !== lastChapter) { lastChapter = cur; document.body.style.setProperty('--chapter-accent', CHAPTER[cur] || CHAPTER[0]); }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  tocLinks.forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); const s = document.querySelector(a.getAttribute('href')); if (s) s.scrollIntoView({ behavior: 'smooth' }); }));
  const cl = $('copyLink');
  if (cl) cl.addEventListener('click', async (e) => { try { await navigator.clipboard.writeText(location.href); e.target.textContent = 'Copied'; } catch (_) { e.target.textContent = 'Copy from address bar'; } });

  /* ---------------- timeline ---------------- */
  const ERAS = [
    { id: 'roots', label: '2014–2020: roots', c: '#76736c' },
    { id: 'found', label: '2021–2022: founding', c: '#2463d6' },
    { id: 'ent', label: '2023–2024: enterprise', c: '#2f7a4a' },
    { id: 'code', label: '2025: Claude Code', c: '#b8892b' },
    { id: 'y26', label: '2026: red lines & IPO', c: '#a3141f' }
  ];
  const EVENTS = [
    ['roots', '2014', 'Dario Amodei joins Baidu’s AI lab and sees models improve predictably with more data and compute.'],
    ['roots', '2016', 'At Google Brain, co-writes “Concrete Problems in AI Safety”; joins OpenAI later that year.'],
    ['roots', '2018', 'Daniela Amodei moves from Stripe to OpenAI, later running safety and policy.'],
    ['roots', 'Feb 2019', 'OpenAI unveils GPT-2, whose research Dario co-led, and at first withholds the full model over misuse fears.'],
    ['roots', 'Jan 2020', 'Co-authors the scaling-laws paper behind GPT-3.'],
    ['roots', 'Dec 2020', 'Seven senior staff leave OpenAI: “the divorce”.'],
    ['found', '2021', 'Anthropic incorporated as a public benefit corporation; $124 million Series A.'],
    ['found', 'Apr 2022', '$580 million Series B, led by Sam Bankman-Fried of FTX.'],
    ['found', 'Nov 2022', 'FTX collapses; days later ChatGPT launches.'],
    ['found', 'Dec 2022', 'Constitutional AI paper: training a model against a written set of principles.'],
    ['ent', 'Mar 2023', 'Claude launches for business partners.'],
    ['ent', 'Jul 2023', 'Claude 2 reads 100,000 tokens at once.'],
    ['ent', 'Sep 2023', 'Responsible Scaling Policy, with a pledge to pause if safety lags; Amazon agrees to invest up to $4 billion.'],
    ['ent', 'Mar 2024', 'Claude 3 family (Haiku, Sonnet, Opus).'],
    ['ent', 'Jun 2024', 'Claude 3.5 Sonnet becomes programmers’ favourite.'],
    ['ent', 'Oct 2024', '“Machines of Loving Grace”; Claude learns to operate a computer.'],
    ['ent', 'Nov 2024', 'Model Context Protocol released; Amazon’s total investment reaches $8 billion.'],
    ['code', 'Feb 2025', 'Claude Code previewed alongside Claude 3.7 Sonnet.'],
    ['code', 'May 2025', 'Claude Code released fully.'],
    ['code', 'Jul 2025', 'Pentagon prototype agreement worth up to $200 million.'],
    ['code', 'Aug 2025', 'Claude offered to all three branches of US government for $1 per agency.'],
    ['code', 'Sep 2025', '$13 billion Series F at $183 billion; $1.5 billion settlement with authors.'],
    ['y26', 'Jan 2026', '“The Adolescence of Technology”; Cowork plug-ins trigger the “SaaSpocalypse”.'],
    ['y26', 'Feb 2026', '$30 billion at $380 billion; pause pledge dropped; distillation accusations; Pentagon labels Anthropic a supply chain risk.'],
    ['y26', 'Mar 2026', 'Claude tops the US App Store; Anthropic sues the Pentagon.'],
    ['y26', 'Apr 2026', 'Claude Mythos released only to partners via Project Glasswing.'],
    ['y26', 'Q2 2026', 'First quarterly operating profit, about $974 million.'],
    ['y26', 'Aug–Sep 2026', 'Courts split on the Pentagon designation.'],
    ['y26', 'Nov 2026', 'IPO at $83 a share: $81.3 billion raised, about $1.5 trillion fully diluted.']
  ];
  // the full list, inside the "Every event" disclosure
  const tlList = $('tlList');
  const colOf = Object.fromEntries(ERAS.map((e) => [e.id, e.c]));
  if (tlList) {
    tlList.innerHTML = EVENTS.map(([e, d, t]) => `<li style="--c:${colOf[e]}"><span class="tl-d">${d}</span><p>${t}</p></li>`).join('');
    const n = $('tlCount'); if (n) n.textContent = `(${EVENTS.length})`;
  }

  /* ---------------- the story, with the other view ----------------
     One requestAnimationFrame loop reads where each story card sits relative to the middle of the
     viewport: it fades and gently drifts the cards, and when a new card takes the middle it
     cross-fades that card's counterpoint (the <aside class="cx"> inside it) into the pinned panel
     and counts the valuation line up to the latest funding round. On narrow screens the asides
     simply show under their cards. With reduced motion, everything snaps. */
  const sc = $('tlScrolly');
  if (sc) {
    const ERA_NAME = { roots: '2014–2020 · Roots', found: '2021–2022 · Founding', ent: '2023–2024 · Enterprise', code: '2025 · Claude Code', y26: '2026 · Red lines and the IPO' };
    const VAL = [[2025.2, 'Mar 2025', 61.5], [2025.65, 'Sep 2025', 183], [2026.12, 'Feb 2026', 380], [2026.4, 'May 2026', 965], [2026.88, 'Nov 2026 IPO', 1500]];
    const money = (v) => (v >= 1000 ? '$' + (v / 1000).toFixed(1) + 'T' : '$' + (v < 100 ? v.toFixed(1) : Math.round(v)) + 'B');
    const eraEl = $('tgEra'), nowV = $('tgNowV'), nowL = $('tgNowL'), body = $('cxBody');
    const steps = [...sc.querySelectorAll('.step')];
    if (!REDUCE) sc.classList.add('smooth');

    // count the valuation figure up (or down) to its new value
    let shown = 0, target = 0, countRaf = 0;
    const setNow = (v, label) => {
      nowL.textContent = label;
      if (v === target) return;
      const from = shown, to = v, t0 = performance.now(), dur = REDUCE ? 0 : 700;
      target = v; cancelAnimationFrame(countRaf);
      const tick = (now) => {
        const k = dur ? Math.min(1, (now - t0) / dur) : 1;
        shown = from + (to - from) * (1 - Math.pow(1 - k, 3));
        nowV.textContent = to === 0 && k === 1 ? '—' : money(shown || to);
        if (k < 1) countRaf = requestAnimationFrame(tick);
      };
      countRaf = requestAnimationFrame(tick);
    };

    let active = -1;
    const activate = (i) => {
      active = i;
      const st = steps[i], e = st.dataset.e, t = +st.dataset.t;
      steps.forEach((s, k) => s.classList.toggle('on', k === i));
      eraEl.textContent = ERA_NAME[e]; eraEl.style.color = colOf[e];
      const cx = st.querySelector('.cx');
      if (cx) swap(body, cx.innerHTML);
      let n = -1; VAL.forEach(([vt], k) => { if (t >= vt - 0.001) n = k; });
      if (n < 0) setNow(0, 'no public valuation yet');
      else setNow(VAL[n][2], VAL[n][1]);
    };

    let queued = false;
    const frame = () => {
      queued = false;
      const mid = innerHeight / 2;
      const R = steps.map((s) => s.querySelector('.card').getBoundingClientRect());
      let i = 0;
      R.forEach((r, k) => { if (r.top <= mid) i = k; });
      if (!REDUCE) {
        const drift = NARROW.matches ? 0 : 36;
        steps.forEach((s, k) => {
          const r = R[k];
          // 0 while the card spans the middle of the screen, growing with its distance from it
          const d = Math.max(-1, Math.min(1, (r.top > mid ? r.top - mid : r.bottom < mid ? r.bottom - mid : 0) / innerHeight));
          s.style.setProperty('--fade', (1 - Math.min(1, Math.abs(d) * 2.4) * 0.6).toFixed(3));
          s.style.setProperty('--shift', (-d * drift).toFixed(1) + 'px');
        });
      }
      if (i !== active) activate(i);
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    frame();
  }

  /* ---------------- two versions of the story ---------------- */
  const Q = [
    { q: 'Why did the founders leave OpenAI?',
      a: ['A clash over safety and speed', 'OpenAI wanted to push ahead to stay in front; the Amodeis feared deploying models before anyone understood them.'],
      b: ['A breakdown of trust', 'Dario Amodei has said it was not simply about safety or commercialisation but about trust in OpenAI’s leadership, citing how deals and access decisions were handled.'],
      r: 'Both can be true, and only the people involved know the weighting. What is documented is the timing (December 2020, after GPT-3) and that the group left together.' },
    { q: 'Why business customers, not a consumer chatbot?',
      a: ['A values choice', 'Anthropic avoided advertising-driven consumer apps that optimise for engagement, preferring reliable tools for work, science and medicine.'],
      b: ['A forced pivot', 'Industry insiders argue Anthropic wanted consumers too, but ChatGPT won the mindshare so completely that it had to go after businesses.'],
      r: 'Claude launched to business partners first, in March 2023, four months after ChatGPT. Anthropic does run consumer apps, and briefly topped the App Store in 2026, but most of its revenue comes from businesses and developers.' },
    { q: 'How fast did Claude Code reach $2.5 billion?',
      a: ['Within about a year of the preview', 'Previewed in February 2025, released in May, above $2.5 billion annualised by February 2026.'],
      b: ['Within nine months', 'Some accounts say it passed $2.5 billion within nine months of the preview, by late 2025.'],
      r: 'Anthropic’s own February 2026 announcement put it above $2.5 billion, more than double the level at the start of 2026, which fits the first version.' },
    { q: 'What was the Pentagon fight about?',
      a: ['Holding an ethical line', 'Anthropic refused to allow mass domestic surveillance or fully autonomous weapons and accepted the punishment.'],
      b: ['Manufactured PR', 'Pentagon officials and critics say Anthropic had pushed hard to get onto classified networks, and that the guardrails it fought over were already required by US law and military policy.'],
      r: 'The designation, the lawsuit and the split court rulings are on the record. Whether the restrictions added anything beyond existing rules is exactly what the parties dispute.' },
    { q: 'How should Anthropic’s revenue be counted?',
      a: ['Gross', 'Anthropic counts the full amount customers spend through cloud marketplaces as revenue and books the cloud partner’s cut as a cost.'],
      b: ['Net', 'OpenAI and other critics argue the partner’s cut of roughly 16–20% should be deducted first, so Anthropic’s headline revenue is not comparable with rivals’.'],
      r: 'Accounting rules allow either, depending on who controls the sale to the customer, so this is a judgment call; the dispute is about comparability between companies, not about a hidden number.' },
    { q: 'What was the IPO valuation?',
      a: ['About $1.5 trillion', 'Priced at $83 a share, above the range, worth about $1.5 trillion fully diluted.'],
      b: ['$2 trillion', 'Some accounts, recorded before pricing, describe a $2 trillion listing; others put it near $1 trillion.'],
      r: 'The final price of $83 implies about $1.5 trillion fully diluted; $2 trillion was talk beforehand.' }
  ];
  const spQ = $('spQ'), spOut = $('spOut');
  if (spQ && spOut) {
    spQ.innerHTML = Q.map((x, i) => `<button type="button" data-i="${i}">${x.q}</button>`).join('');
    tablist(spQ, spOut, (i) => {
      const x = Q[i];
      return `<div class="sp-v a"><span class="sp-k">Version A</span><b>${x.a[0]}</b><p>${x.a[1]}</p></div>
        <div class="sp-v b"><span class="sp-k">Version B</span><b>${x.b[0]}</b><p>${x.b[1]}</p></div>
        <div class="sp-r"><span class="sp-k">What the record shows</span><p>${x.r}</p></div>`;
    }, 'spTab');
  }

  /* ---------------- the case against ---------------- */
  const C = [
    { n: 'Safety talk, racing walk', k: 3,
      crit: 'Anthropic warns about an AI race while racing hardest. When the pause pledge became inconvenient, it was dropped; critics also point to the pirated-books library used in early training.',
      reply: 'A lab that pauses alone just hands the frontier to less careful rivals. Anthropic says it lowered no existing safeguards, and a court ruled that training on lawfully bought books was fair use.',
      check: 'The pause commitment was removed in RSP v3.0 (February 2026). Anthropic paid $1.5 billion to settle the piracy claims.' },
    { n: 'Military and geopolitical hawkishness', k: 3,
      crit: 'A company that says it serves “all of humanity” sought classified military work first, lobbies for tough chip export controls on China, and its model has been reported in US operations in Venezuela and Iran.',
      reply: 'Amodei argues democracies must keep a lead over autocracies. Anthropic also risked its government business to refuse mass surveillance and fully autonomous weapons.',
      check: 'The Pentagon agreement, the supply-chain designation and the WSJ report on the Maduro raid are documented. Amodei says he does not know Claude’s role in the Minab strike.' },
    { n: 'Fear as marketing', k: 3,
      crit: 'Warnings about catastrophe and lost jobs double as marketing and as a push for regulation that would burden smaller and open-source rivals. Withholding Mythos looked like scarcity marketing.',
      reply: 'Amodei rejects “doom marketing”, saying his essays separate tasks from jobs and propose policy fixes, and that clips are taken out of context. Glasswing partners did use Mythos to patch real vulnerabilities.',
      check: 'The essays and Glasswing are public; motives are not verifiable either way.' },
    { n: 'A closed, mission-driven culture', k: 2,
      crit: 'Long “culture interviews” screen for believers, staff debate whether Claude has moral status, and the seven founders keep 50.1% of the votes through a single share class.',
      reply: 'The culture keeps people: staff have turned down very large offers from rivals. Governance experts have praised the structure as a guard against mission drift.',
      check: 'The Class F share and the Long-Term Benefit Trust are set out in the IPO filing; see “Who Owns Anthropic?”.' },
    { n: 'Fragile finances', k: 2,
      crit: 'Growth slowed sharply in the third quarter of 2026, a handful of customers are a large share of revenue, much of it flows through Amazon and Google, and compute commitments run to hundreds of billions.',
      reply: 'Anthropic turned an operating profit in the second quarter of 2026, its gross margin is high, and customers who adopt Claude Code tend to spend much more over time.',
      check: 'The Q2 operating profit (about $974 million) and compute commitments are in the S-1; the Q3 slowdown figures come from one video account.' },
    { n: 'How the critics frame it', k: 1,
      crit: 'The most critical video calls Anthropic a cult and compares its rhetoric to that of totalitarian movements.',
      reply: 'Even that video grants that the technical achievements are real and that Claude is, in its view, the strongest model available.',
      check: 'This is interpretation, not fact; it is included so readers know the range of views.' }
  ];
  const crList = $('crList'), crCard = $('crCard');
  if (crList && crCard) {
    crList.innerHTML = C.map((c, i) => `<button type="button" class="cr-b" data-i="${i}"><span class="cr-n">${c.n}</span><span class="cr-d" aria-label="${c.k} of 4 videos">${[0, 1, 2, 3].map((k) => `<i class="${k < c.k ? 'on' : ''}"></i>`).join('')}</span></button>`).join('');
    tablist(crList, crCard, (i) => {
      const c = C[i];
      return `<h4>${c.n}</h4><p class="cr-f">Raised in ${c.k} of the 4 video accounts</p>
        <dl><dt>The criticism</dt><dd>${c.crit}</dd><dt>The reply</dt><dd>${c.reply}</dd><dt>What can be checked</dt><dd class="ck">${c.check}</dd></dl>`;
    }, 'crTab');
  }
})();
