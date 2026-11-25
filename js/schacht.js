/* Bottleneck: The Dark Wizard (html/explainers/schacht.html)
   Page chrome (reveal, progress, contents, copy link), Schacht's timeline, the foreign-currency
   squeeze, the Mefo bill stepper and the toolkit cards. */
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

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

  /* ---------------- timeline ---------------- */
  const tl = $('lifeTl');
  if (tl) {
    const ERA = { emp: ['Empire', '#6b6b6b'], wei: ['Weimar', '#2463d6'], naz: ['Nazi Germany', '#a3141f'], post: ['After the war', '#2f7a4a'] };
    const T = [
      ['1877', 'emp', 'Born in Schleswig-Holstein, to a German father and a Danish mother.'],
      ['1899', 'emp', 'Doctorate in economics at the University of Kiel.'],
      ['1903–15', 'emp', 'Rises to deputy director of Dresdner Bank; in 1914–15 a financial adviser in occupied Belgium.'],
      ['1918', 'wei', 'Co-founds the liberal German Democratic Party as the Kaiser falls.'],
      ['Nov–Dec 1923', 'wei', 'Currency commissioner as the Rentenmark ends hyperinflation; then president of the Reichsbank.'],
      ['1924', 'wei', 'Dawes Plan eases reparations; American loans flow in.'],
      ['Mar 1930', 'wei', 'Resigns from the Reichsbank over the Young Plan reparations settlement.'],
      ['Oct 1931', 'wei', 'Speaks at the nationalist Harzburg rally alongside Hitler.'],
      ['Mar 1933', 'naz', 'Hitler reappoints him president of the Reichsbank.'],
      ['1934', 'naz', 'Mefo bills, foreign-debt moratorium, the “New Plan” of import controls; economics minister from August.'],
      ['1936', 'naz', 'Göring’s Four-Year Plan takes control of the war economy.'],
      ['Nov 1937', 'naz', 'Gives up the economics ministry after clashing with Göring.'],
      ['Jan 1939', 'naz', 'Dismissed from the Reichsbank after warning against more arms spending.'],
      ['Jul 1944', 'naz', 'Arrested after the plot against Hitler; held in concentration camps.'],
      ['1946', 'post', 'Acquitted by the International Military Tribunal at Nuremberg.'],
      ['1947–49', 'post', 'Sentenced to eight years by a denazification court; the sentence is overturned on appeal.'],
      ['1950s', 'post', 'Founds a bank in Düsseldorf; advises governments including Indonesia and Egypt.'],
      ['1970', 'post', 'Dies in Munich, aged 93.']
    ];
    tl.innerHTML = T.map(([y, e, t]) => `<li style="--c:${ERA[e][1]}"><span class="tl-y">${y}</span><span class="tl-e">${ERA[e][0]}</span><p>${t}</p></li>`).join('');
  }

  /* ---------------- the foreign-currency squeeze ----------------
     1933 baseline per the source video: exports 4.8, imports 4.2, debt service 1.0 (billion RM a year).
     Recovery and rearmament add imports; tools cut outflows or add exports. Round-number assumptions. */
  const bpR = $('bpR'), bpA = $('bpA'), bpTools = $('bpTools'), bpOut = $('bpOut');
  if (bpR && bpOut) {
    const on = { def: false, imp: false, exp: false };
    const draw = () => {
      const r = +bpR.value / 100, a = +bpA.value / 100;
      $('bpRv').textContent = Math.round(r * 100) + '%'; $('bpAv').textContent = Math.round(a * 100) + '%';
      let exp = 4.8 + (on.exp ? 0.5 : 0);
      let imp = 4.2 + r * 1.2 + a * 1.0;
      if (on.imp) imp -= Math.min(1.4, r * 1.2 + 0.4); // licences squeeze civilian imports first
      const debt = on.def ? 0.3 : 1.0;
      const net = exp - imp - debt;
      const max = 7;
      const bar = (v, c) => `<i style="width:${(Math.max(v, 0) / max * 100).toFixed(1)}%;background:${c}"></i>`;
      bpOut.innerHTML = `
        <div class="bp-r"><span class="bp-l">Money in: exports</span><span class="bp-b">${bar(exp, '#2f7a4a')}</span><b>${exp.toFixed(1)}</b></div>
        <div class="bp-r"><span class="bp-l">Money out: imports</span><span class="bp-b">${bar(imp, '#c2412d')}</span><b>${imp.toFixed(1)}</b></div>
        <div class="bp-r"><span class="bp-l">Money out: foreign debt</span><span class="bp-b">${bar(debt, '#a3141f')}</span><b>${debt.toFixed(1)}</b></div>
        <div class="bp-net ${net < -0.05 ? 'dn' : 'up'}"><span>Each year the Reichsbank’s reserves ${net < -0.05 ? 'lose' : 'gain'}</span><b>${net < -0.05 ? '−' : '+'}${Math.abs(net).toFixed(1)} billion RM</b></div>
        <p class="bp-why">${net < -0.05
          ? (r + a > 0 ? 'Recovery and rearmament both pull in imports, so the drain grows. With reserves already scraping the bottom, a drain like this would halt the imports industry needs within months.' : 'This is roughly where Schacht started in 1933: a steady drain, with reserves already low.') + (Object.values(on).some(Boolean) ? ' Switch on more tools to close the gap.' : ' Try the tools.')
          : 'The books balance, but only because the state now decides what may be imported, which debts are paid and which exports are subsidised. The cost has moved into shortages and controls.'}</p>`;
    };
    [bpR, bpA].forEach((x) => x.addEventListener('input', draw));
    bpTools.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      on[b.dataset.t] = !on[b.dataset.t]; b.setAttribute('aria-pressed', String(on[b.dataset.t])); draw();
    });
    draw();
  }

  /* ---------------- Mefo bill stepper ---------------- */
  const mfTabs = $('mfTabs'), mfFlow = $('mfFlow'), mfWhy = $('mfWhy');
  if (mfTabs && mfFlow) {
    const NODES = [['gov', 'Reich government', 'Wants tanks, can’t show the cost'], ['mefo', 'Mefo', 'Shell company, almost no capital'], ['firm', 'Arms maker', 'e.g. Krupp, Rheinmetall'], ['bank', 'Banks and firms', 'Hold the bills for interest'], ['rb', 'Reichsbank', 'Promises to buy any bill']];
    const STEPS = [
      { t: '1. The order', on: ['gov', 'firm'], arrows: [['gov', 'firm', 'orders tanks']], why: 'The armed forces order weapons from industry, as any government would. The difference is in how the bill is settled.' },
      { t: '2. The IOU', on: ['firm', 'mefo'], arrows: [['firm', 'mefo', 'draws a bill'], ['mefo', 'firm', 'accepts it']], why: 'Instead of cash from the budget, the maker is paid with a bill of exchange accepted by Mefo, a company that exists only on paper. Nothing appears in the government’s accounts.' },
      { t: '3. The guarantee', on: ['firm', 'bank', 'rb'], arrows: [['firm', 'bank', 'passes the bill on'], ['rb', 'bank', 'will buy it for cash']], why: 'The maker can pass the bill to its bank or suppliers, or sell it to the Reichsbank, which has promised to take it at any time. That promise is what makes the bill as good as money.' },
      { t: '4. The result', on: ['gov', 'mefo', 'firm', 'bank', 'rb'], arrows: [['gov', 'rb', 'hidden borrowing']], why: 'In effect the government borrowed from the central bank and the banking system without a trace in the budget. Because the bills paid about 4% interest, most stayed in banks’ and firms’ drawers instead of turning into new cash, which helped keep inflation down. About 12 billion Reichsmarks were outstanding by 1938.' }
    ];
    mfTabs.innerHTML = STEPS.map((s, i) => `<button type="button" role="tab" data-i="${i}" aria-pressed="${i === 0}">${s.t}</button>`).join('');
    const show = (i) => {
      const s = STEPS[i];
      mfTabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.i === i)));
      mfFlow.innerHTML = NODES.map(([id, n, d]) => `<div class="mf-n mf-${id}${s.on.includes(id) ? ' on' : ''}"><b>${n}</b><span>${d}</span></div>`).join('') +
        `<ul class="mf-arrows">${s.arrows.map(([f, t, l]) => `<li><b>${NODES.find((n) => n[0] === f)[1]}</b> → <b>${NODES.find((n) => n[0] === t)[1]}</b>: ${esc(l)}</li>`).join('')}</ul>`;
      mfWhy.textContent = s.why;
    };
    mfTabs.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) show(+b.dataset.i); });
    show(0);
  }

  /* ---------------- the toolkit ---------------- */
  const grid = $('tkGrid'), card = $('tkCard');
  if (grid && card) {
    const TOOLS = [
      { n: 'Hidden deficit spending', p: 'Jobs and an army, without a visible budget', did: 'Borrowed through Mefo bills and other credit to fund rearmament off the books.', cost: 'Built up a hidden debt and an economy run for the military; once slack was gone, more spending pushed toward inflation.' },
      { n: 'Wage controls', p: 'Stop full employment raising wages', did: 'Independent trade unions were abolished in 1933 and replaced by the Nazi German Labour Front; state-appointed “trustees of labour” set pay.', cost: 'Workers got jobs but little of the boom: real wages barely rose while hours grew.' },
      { n: 'Price controls', p: 'Stop rising demand raising prices', did: 'Caps on prices were added sector by sector as they spiked, then a general price freeze from late 1936.', cost: 'When prices can’t rise to match demand, goods run short instead: queues, rationing by shopkeepers and poor-quality substitutes.' },
      { n: 'Quotas', p: 'Get scarce materials to the right industries', did: 'Bureaucrats allocated steel, coal and other raw materials, favouring armaments over civilian uses.', cost: 'Civilian industries such as construction were starved; the state, not prices, decided who could produce.' },
      { n: 'Selective debt default', p: 'Stop foreign-currency leaking out to creditors', did: 'From mid-1934 transfers on most foreign debt were suspended, then partly resumed for Britain, the Netherlands and Switzerland in return for trade deals; American creditors lost out.', cost: 'Germany was shut out of foreign credit and faced trade retaliation.' },
      { n: 'Import licences', p: 'Decide which imports get foreign currency', did: 'Under the 1934 “New Plan”, importers needed approval from state boards for foreign currency; trade shifted to barter-like clearing deals, especially with south-eastern Europe.', cost: 'A huge bureaucracy, and consumer imports such as cotton, wool and coffee squeezed in favour of war materials.' },
      { n: 'Export subsidies', p: 'Earn foreign currency without devaluing', did: 'Rather than devalue the Reichsmark after Britain and the US let their currencies fall, the state subsidised exporters, funded partly by a levy on industry.', cost: 'Expensive, and a way of avoiding the adjustment a cheaper currency would have made.' },
      { n: 'Capital controls on emigrants', p: 'Stop people taking wealth abroad', did: 'The Reich Flight Tax and blocked accounts let emigrants leave but not their money, aimed above all at Jewish Germans.', cost: 'Confiscation dressed as currency policy: it stripped emigrants of most of their wealth and left many trapped in a country that would murder them.' }
    ];
    grid.innerHTML = TOOLS.map((t, i) => `<button type="button" class="tk-b" data-i="${i}" aria-pressed="${i === 0}"><span>${i + 1}</span>${t.n}</button>`).join('');
    const show = (i) => {
      const t = TOOLS[i];
      grid.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.i === i)));
      card.innerHTML = `<h4>${i + 1}. ${t.n}</h4><p class="tk-p">${t.p}</p><dl><dt>What it did</dt><dd>${t.did}</dd><dt>Where the cost went</dt><dd class="cost">${t.cost}</dd></dl>`;
    };
    grid.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) show(+b.dataset.i); });
    show(0);
  }
})();
