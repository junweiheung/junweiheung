/* Bottleneck: What Happens When You Press Send (html/explainers/inference.html)
   Page chrome (reveal, progress, contents), the request walkthrough, the tokeniser toy,
   the MoE illustration, the dense-vs-MoE calculator and the chips-to-hold-the-model chart. */
(function () {
  const $ = (id) => document.getElementById(id);
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NARROW = matchMedia('(max-width: 900px)').matches;
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------------- reveal-on-scroll, progress bar, contents, copy link ---------------- */
  const rio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in-view'); rio.unobserve(e.target);
  }), { threshold: 0, rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.rv, #qs').forEach((e) => rio.observe(e));

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

  /* ---------------- the tokeniser toy ----------------
     Not a real tokeniser: short and very common words stay whole (with their leading space, as real
     tokenisers do), longer words lose a common suffix and the rest is cut into chunks of about four letters. */
  const COMMON = new Set('the of and to a in is it that for on was with as are be this by at or from but not have an they which you were her his all one can there had their what so if about would will up out who get when make like time no just him know take into your some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us why sky blue'.split(' '));
  const SUFFIX = ['ing', 'tion', 'ness', 'ment', 'able', 'ally', 'ed', 'ly', 'er', 'es', 's'];
  function toyTokens(text) {
    const out = [];
    const re = /(\s*)([A-Za-z]+|\d{1,3}|[^\sA-Za-z\d])/g; let m;
    while ((m = re.exec(text))) {
      const sp = m[1] ? ' ' : '', w = m[2];
      if (!/^[A-Za-z]+$/.test(w) || w.length <= 4 || COMMON.has(w.toLowerCase())) { out.push(sp + w); continue; }
      let stem = w, suf = '';
      for (const s of SUFFIX) if (w.length - s.length >= 4 && w.toLowerCase().endsWith(s)) { stem = w.slice(0, -s.length); suf = w.slice(-s.length); break; }
      const parts = [];
      if (stem.length <= 6) parts.push(stem);
      else for (let i = 0; i < stem.length; i += 4) parts.push(stem.slice(i, i + 4));
      if (parts.length > 1 && parts[parts.length - 1].length < 2) { const t = parts.pop(); parts[parts.length - 1] += t; }
      parts[0] = sp + parts[0];
      out.push(...parts); if (suf) out.push(suf);
    }
    return out;
  }
  const tokIn = $('tokIn'), tokOut = $('tokOut'), tokStat = $('tokStat');
  function renderTok() {
    if (!tokIn) return;
    const toks = toyTokens(tokIn.value.slice(0, 600));
    tokOut.innerHTML = toks.map((t, i) => `<span class="tk c${i % 5}">${esc(t).replace(/^ /, '<i>␣</i>')}</span>`).join('');
    const words = (tokIn.value.match(/[A-Za-z0-9’']+/g) || []).length, chars = tokIn.value.length;
    tokStat.innerHTML = `<b>${toks.length}</b> tokens from ${words} words and ${chars} characters · rule of thumb (characters ÷ 4): about ${Math.max(1, Math.round(chars / 4))}`;
  }
  if (tokIn) { tokIn.addEventListener('input', renderTok); renderTok(); }

  /* ---------------- Part 1: the request walkthrough ---------------- */
  const WHERE = ['Your device', 'CPU servers', 'CPU servers', 'CPU servers', 'Host CPU', 'Accelerator', 'Accelerator', 'Accelerator', 'CPU servers', 'Your device'];
  const Q = 'Why is the sky blue?';
  const QTOK = ['Why', ' is', ' the', ' sky', ' blue', '?'];
  const ANS = ['Sun', 'light', ' is', ' scattered', ' by', ' air', ' molecules', ',', ' and', ' blue', ' light', ' scatters', ' most', '.'];
  const chips = (arr, cls = '') => arr.map((t, i) => `<span class="tk c${i % 5} ${cls}">${esc(t).replace(/^ /, '<i>␣</i>')}</span>`).join('');
  let loop = null; const stopLoop = () => { if (loop) { clearInterval(loop); loop = null; } };
  const VIEWS = [
    () => `<div class="v-chat"><div class="b them">What makes sunsets red?</div><div class="b me-a">Sunlight passes through more air at sunset…</div><div class="b them new">${Q}</div></div>
           <div class="v-note">The whole conversation is sent, not just the last line.</div>`,
    () => `<pre class="v-json">{
  <span class="k">"system"</span>: <span class="s">"You are a helpful assistant…"</span>,
  <span class="k">"tools"</span>: [ … ],
  <span class="k">"messages"</span>: [
    { <span class="k">"role"</span>: "user", <span class="k">"content"</span>: <span class="s">"What makes sunsets red?"</span> },
    { <span class="k">"role"</span>: "assistant", <span class="k">"content"</span>: <span class="s">"Sunlight passes…"</span> },
    { <span class="k">"role"</span>: "user", <span class="k">"content"</span>: <span class="s">"${Q}"</span> }
  ]
}</pre><div class="v-note">Checked, filtered, and wrapped in instructions you never see.</div>`,
    () => `<div class="v-tok">${chips(QTOK)}</div><div class="v-arrow">↓</div>
           <div class="v-ids">${QTOK.map((t, i) => `<span class="c${i % 5}">${[10445, 374, 279, 13180, 6437, 30][i]}</span>`).join('')}</div>
           <div class="v-note">Six tokens, each replaced by its number in the vocabulary. (Numbers are illustrative.)</div>`,
    () => `<div class="v-route">${['US East', 'US West', 'Europe', 'Asia'].map((r, i) => `<div class="dc ${i === 0 ? 'pick' : ''}"><b>${r}</b>${[0, 1, 2, 3].map((j) => `<span class="srv ${i === 0 && j === 2 ? 'pick' : ''} ${(i + j) % 3 === 0 ? 'busy' : ''}"></span>`).join('')}</div>`).join('')}</div>
           <div class="v-note">To a data centre, then to a server group with the model loaded, room to spare and, ideally, your conversation already cached.</div>`,
    () => `<div class="v-batch">${Array.from({ length: 24 }, (_, i) => `<span class="${i === 9 ? 'you' : ''} ${i % 7 === 3 ? 'done' : ''}">${i === 9 ? 'you' : ''}</span>`).join('')}</div>
           <div class="v-note">Your request joins requests from other users. Finished ones leave and new ones join on every step.</div>`,
    () => `<div class="v-tok all">${chips(QTOK, 'pf')}</div><div class="v-arrow">↓ all at once ↓</div>
           <div class="v-kv"><span>KV cache</span><i class="fill"></i></div>
           <div class="v-meter"><span>Limited by</span><b>arithmetic</b></div>`,
    () => `<div class="v-tok">${chips(QTOK)}</div><div class="v-ans" id="vAns"></div>
           <div class="v-kv"><span>KV cache</span><i id="vKv" style="--w:30%"></i></div>
           <div class="v-meter"><span>Each token reads</span><b>the whole model</b></div>`,
    () => `<div class="v-prob">${[['Sun', 41], ['Because', 22], ['The', 15], ['Blue', 7], ['It', 5], ['…', 10]].map(([t, p], i) => `<div class="pr ${i === 0 ? 'top' : ''}"><span>${t}</span><i style="--w:${p * 2}%"></i><b>${p}%</b></div>`).join('')}</div>
           <div class="v-note">Scores for every token in the vocabulary become probabilities; one is picked. (Probabilities are illustrative.)</div>`,
    () => `<div class="v-ids s">${ANS.slice(0, 6).map((t, i) => `<span class="c${i % 5}">${[31192, 4238, 374, 38067, 555, 3805][i]}</span>`).join('')}</div><div class="v-arrow">↓</div>
           <div class="v-stream" id="vStream"></div><div class="v-note">Each token is sent the moment it is made.</div>`,
    () => `<div class="v-chat"><div class="b them">${Q}</div><div class="b me-a final">${ANS.join('').trim()}</div></div>
           <div class="v-note">Milliseconds of plumbing; most of the time was prefill and decode.</div>`
  ];
  const rail = [...document.querySelectorAll('#ifRail li')], view = $('ifView'), where = $('ifWhere');
  const steps = [...document.querySelectorAll('.if-step')];
  let curK = -1;
  function show(k) {
    if (k === curK || !view) return; curK = k; stopLoop();
    steps.forEach((s) => s.classList.toggle('on', +s.dataset.k === k));
    rail.forEach((li, i) => { li.classList.toggle('on', i === k); li.classList.toggle('past', i < k); });
    where.textContent = WHERE[k]; where.className = 'if-where ' + (WHERE[k] === 'Accelerator' ? 'gpu' : WHERE[k].includes('CPU') ? 'cpu' : 'dev');
    view.innerHTML = VIEWS[k]();
    if (k === 6) {           // decode: tokens appear one at a time, the KV cache creeps up
      const a = $('vAns'), kv = $('vKv'); let n = 0;
      // add one token per tick (re-drawing them all would restart every chip's fade-in); pause, then start over
      const tick = () => {
        n = (n % (ANS.length + 4)) + 1;
        if (n === 1) a.innerHTML = '';
        if (n <= ANS.length) a.insertAdjacentHTML('beforeend', `<span class="tk c${(n - 1) % 5} dc">${esc(ANS[n - 1]).replace(/^ /, '<i>␣</i>')}</span>`);
        kv.style.setProperty('--w', (30 + 70 * Math.min(n, ANS.length) / ANS.length).toFixed(1) + '%');
      };
      if (!REDUCED) { tick(); loop = setInterval(tick, 420); } else { a.innerHTML = chips(ANS); kv.style.setProperty('--w', '100%'); }
    }
    if (k === 8) {           // stream: words arrive at the screen
      const st = $('vStream'); let n = 0;
      const tick = () => { n = (n % (ANS.length + 4)) + 1; st.textContent = ANS.slice(0, Math.min(n, ANS.length)).join(''); };
      if (!REDUCED) { tick(); loop = setInterval(tick, 300); } else st.textContent = ANS.join('');
    }
  }
  if (steps.length) {
    const obs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) show(+e.target.dataset.k); }),
      { rootMargin: NARROW ? '-62% 0px -30% 0px' : '-45% 0px -50% 0px' });
    steps.forEach((s) => obs.observe(s));
    show(0);
    rail.forEach((li, i) => li.addEventListener('click', () => steps[i].scrollIntoView({ behavior: 'smooth', block: 'center' })));
    new IntersectionObserver((es) => es.forEach((e) => document.body.classList.toggle('if-wide', e.isIntersecting)), { rootMargin: '-20% 0px -20% 0px' }).observe($('ifScrolly'));
  }

  /* ---------------- Part 2: the MoE illustration ---------------- */
  const dense = $('moeDense'), grid = $('moeGrid'), tokEl = $('moeTok');
  if (dense && grid) {
    dense.innerHTML = '<span></span>'.repeat(16); grid.innerHTML = '<span></span>'.repeat(16);
    const cells = [...grid.children], words = ['sky', 'blue', 'why', 'is', 'scattered', 'light'];
    let w = 0;
    const pick = () => {
      const a = Math.floor(Math.random() * 16); let b = Math.floor(Math.random() * 15); if (b >= a) b++;
      cells.forEach((c, i) => c.classList.toggle('on', i === a || i === b));
      tokEl.textContent = `token: “${words[w++ % words.length]}”`;
    };
    pick(); if (!REDUCED) setInterval(pick, 1400);
  }

  /* ---------------- Part 2: dense vs MoE on one 8x H200 server ----------------
     Each model: total and active weights (billions). For MoE, E routed experts per MoE layer, k used per token;
     the shared part N and one expert's weights e (summed over layers) are solved from total = N + E·e and active = N + k·e. */
  const MODELS = [
    { id: 'l8', name: 'Llama 3.1 8B', short: '8B dense', total: 8, active: 8 },
    { id: 'l70', name: 'Llama 3.1 70B', short: '70B dense', total: 70, active: 70 },
    { id: 'mx', name: 'Mixtral 8x7B', short: 'Mixtral', total: 46.7, active: 12.9, E: 8, k: 2 },
    { id: 'mv', name: 'Llama 4 Maverick', short: 'Maverick', total: 400, active: 17, E: 128, k: 1 },
    { id: 'ds', name: 'DeepSeek-V3', short: 'DeepSeek-V3', total: 671, active: 37, E: 256, k: 8 }
  ];
  MODELS.forEach((m) => { if (m.E) { m.e = (m.total - m.active) / (m.E - m.k); m.N = m.active - m.k * m.e; } });
  const SRV = { mem: 1128, bw: 38.4, flops8: 15.83, flops16: 7.91 };   // GB, TB/s, PFLOPS (8 x H200, dense)
  const BATCH = [1, 2, 4, 8, 16, 32, 64, 128, 256];
  const fmtN = (v) => v >= 100 ? Math.round(v).toLocaleString('en-US') : v >= 10 ? v.toFixed(0) : v.toFixed(1);
  const cx = { m: 'l70', p: 1, b: 0 };
  function segButtons(el, onPick, sel) {
    el.innerHTML = MODELS.map((m) => `<button type="button" data-m="${m.id}" aria-pressed="${m.id === sel}">${m.short}</button>`).join('');
    el.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; el.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b)); onPick(b.dataset.m); });
  }
  function calc() {
    const out = $('cxOut'); if (!out) return;
    const m = MODELS.find((x) => x.id === cx.m), B = BATCH[cx.b], bytes = cx.p;
    $('cxBv').textContent = B;
    const memGB = m.total * bytes;
    const share = m.E ? 1 - Math.pow(1 - m.k / m.E, B) : 1;                 // fraction of routed experts touched in a step
    const readB = m.E ? (m.N + share * m.E * m.e) : m.total;                // billions of weights read per step
    const readGB = readB * bytes;
    const tMem = readGB / (SRV.bw * 1000);                                   // seconds
    const tCmp = (2 * m.active * 1e9 * B) / ((bytes === 1 ? SRV.flops8 : SRV.flops16) * 1e15);
    const t = Math.max(tMem, tCmp), perUser = 1 / t, total = B / t;
    const fits = memGB <= SRV.mem * 0.9;
    const bound = tCmp > tMem ? 'arithmetic' : 'memory reads';
    const row = (l, v, s = '') => `<div class="cx-c"><span>${l}</span><b>${v}</b>${s ? `<small>${s}</small>` : ''}</div>`;
    out.innerHTML = `<div class="cx-grid">
      ${row('Memory to hold it', fmtN(memGB) + ' GB', fits ? `${Math.round(memGB / SRV.mem * 100)}% of the server` : 'does not fit on one server')}
      ${row('Arithmetic per token', fmtN(2 * m.active) + ' billion ops', m.E ? `uses ${m.active}B of ${m.total}B weights` : 'uses every weight')}
      ${row('Weights read per step', fmtN(readGB) + ' GB', m.E ? `${Math.round(share * 100)}% of experts touched by ${B} user${B > 1 ? 's' : ''}` : 'the whole model, every step')}
      ${row('Speed ceiling per user', fits ? fmtN(perUser) + ' tokens/s' : '—', fits ? `limited by ${bound}` : '')}
      ${row('Whole server', fits ? fmtN(total) + ' tokens/s' : '—', fits ? `${B} user${B > 1 ? 's' : ''} at once` : '')}
    </div>
    <div class="cx-bar" aria-hidden="true"><span>Share of the model read each step</span><i style="width:${Math.max(1.5, readB / m.total * 100)}%"></i><em>${Math.round(readB / m.total * 100)}%</em></div>`;
  }
  if ($('cxModel')) {
    segButtons($('cxModel'), (id) => { cx.m = id; calc(); }, cx.m);
    $('cxPrec').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; $('cxPrec').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b)); cx.p = +b.dataset.p; calc(); });
    $('cxB').addEventListener('input', (e) => { cx.b = +e.target.value; calc(); });
    calc();
  }

  /* ---------------- Part 3: chips needed just to hold the weights (8-bit) ---------------- */
  const HW = [
    { n: 'Nvidia H200', s: '141 GB HBM', gb: 141, c: 'gpu' },
    { n: 'Groq 3 LP30', s: '500 MB SRAM', gb: 0.5, c: 'lpu' },
    { n: 'Groq first gen', s: '230 MB SRAM', gb: 0.23, c: 'lpu' },
    { n: 'Taalas HC1-sized', s: 'one 8B model per chip (hypothetical beyond 8B)', per8B: true, c: 'hc' }
  ];
  function chipsChart(id) {
    const el = $('chBars'); if (!el) return;
    const m = MODELS.find((x) => x.id === id);
    const counts = HW.map((h) => Math.max(1, Math.ceil(h.per8B ? m.total / 8 : m.total / h.gb)));
    const max = Math.log10(5000);
    el.innerHTML = HW.map((h, i) => `<div class="chb ${h.c}"><div class="chb-l"><b>${h.n}</b><small>${h.s}</small></div>
      <div class="chb-t"><i style="width:${Math.max(2, Math.log10(counts[i]) / max * 100)}%"></i><em>${counts[i].toLocaleString('en-US')} chip${counts[i] > 1 ? 's' : ''}</em></div></div>`).join('') +
      `<div class="chb-axis">${[1, 10, 100, 1000].map((v) => `<span style="left:${Math.log10(v) / max * 100}%">${v.toLocaleString('en-US')}</span>`).join('')}</div>`;
  }
  if ($('chModel')) { segButtons($('chModel'), chipsChart, 'l70'); chipsChart('l70'); }
})();

/* ---------------- Part 3: the memory-limit calculator (one user, one chip family) ----------------
   Upper bound on tokens/s for one user = memory bandwidth ÷ bytes of weights read per token.
   If the model doesn't fit in one chip's memory it is split over N chips, each reading its share. */
(function () {
  const out = document.getElementById('mwOut'), slider = document.getElementById('mwParams'); if (!out || !slider) return;
  const SIZES = [1, 8, 70, 120, 405, 1000];                      // billions of weights
  const CHIPS = { '4.8': ['Nvidia H200', 141], '8': ['AMD MI355X', 288], '19.6': ['AMD MI455X', 432] };   // TB/s → [name, GB of memory]
  let bits = 16, bw = 4.8;
  const seg = (id, set) => {
    const box = document.getElementById(id);
    box.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      box.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      set(+b.dataset.v); draw();
    });
  };
  const fmt = (n) => n >= 100 ? Math.round(n).toLocaleString('en-US') : n.toFixed(n >= 10 ? 0 : 1);
  function draw() {
    const p = SIZES[+slider.value];
    document.getElementById('mwP').textContent = p >= 1000 ? (p / 1000) + 'T' : p + 'B';
    const gb = p * bits / 8;                                     // GB of weights
    const [name, cap] = CHIPS[String(bw)];
    const n = Math.max(1, Math.ceil(gb / (cap * 0.9)));          // leave a little room for the KV cache
    const tps = bw * 1000 * n / gb;
    out.innerHTML = `<div class="mw-big"><b>≈ ${fmt(tps)}</b><span>tokens a second, at most, for one user</span></div>
      <p class="mw-why">${p >= 1000 ? (p / 1000) + ' trillion' : p + ' billion'} weights × ${bits / 8} byte${bits === 8 ? '' : 's'} each = <b>${fmt(gb)} GB</b> to read for every token. ` +
      (n === 1 ? `The ${name} reads ${bw} TB a second from memory, so ${bw * 1000} GB ÷ ${fmt(gb)} GB ≈ ${fmt(tps)}.`
               : `That doesn't fit in one ${name}'s ${cap} GB, so it is split across at least <b>${n}</b> chips, each reading its share at ${bw} TB/s. Linking them adds delays this ignores.`) +
      `${p === 8 && bits === 16 && bw === 4.8 ? ' Nvidia measures about 230 in practice. Taalas’s HC1, with the model built into the chip, does about 17,000.' : ''}</p>`;
  }
  seg('mwBits', (v) => { bits = v; });
  seg('mwChip', (v) => { bw = v; });
  slider.addEventListener('input', draw);
  draw();
})();
