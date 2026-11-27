/* Bottleneck: the connections map, the "Map" view of html/all.html.
   A hand-laid "canvas" of topic cards, in the style of an Obsidian canvas: each card lists explainers
   (titles and links come from js/articles.js), and labelled arrows show how the topics feed each other.
   Hovering an explainer lights up the explainers it connects to (text links, shared companies, related
   topics) from js/graph-data.js, built by scripts/build-graph.js.

   To place a new explainer, add its id to a card's `items` below. Any explainer not placed on a card
   is listed automatically on a "New on the map" card, so nothing goes missing. */
(function () {
  const B = window.BOTTLENECK, G = window.BOTTLENECK_GRAPH || { edges: [] };
  const board = document.getElementById('cvBoard'), world = document.getElementById('cvWorld');
  if (!B || !board || !world) return;
  const byId = Object.fromEntries(B.articles.map((a) => [a.id, a]));

  /* ---------- the canvas: cards (x, y, width in canvas px) and arrows ---------- */
  const CARDS = [
    { id: 'hub', x: 640, y: 400, w: 440, hub: true, title: 'Financial markets',
      note: 'Where savers’ money meets the governments and companies that need it. What gets traded:',
      items: [['Stocks', 'index-weights'], ['Bonds', 'govt-bonds'], ['Currencies', 'forex'], ['Crypto', 'stablecoins'], ['Derivatives', 'derivatives']] },
    { id: 'savers', x: 60, y: 450, w: 300, title: 'Savers and investors',
      note: 'People with money to lend or invest, and the choices in front of them.',
      items: [['Where to save', 'risk-ladder'], ['Valuing a stock', 'valuation'], ['Reading a chart', 'chart-reading']] },
    { id: 'gov', x: 690, y: 40, w: 340, title: 'Governments and central banks',
      note: 'Who issues the money, borrows the most, and sets the price of borrowing.',
      items: [['Money', 'seigniorage'], ['Interest rates', 'bond-market']] },
    { id: 'plumbing', x: 60, y: 60, w: 330, title: 'Market plumbing',
      note: 'The quiet institutions that settle trades, set prices and insure the cargo.',
      items: [['Settlement', 'cls'], ['Benchmarks', 'oil-window'], ['Insurance', 'pi-clubs']] },
    { id: 'crises', x: 1300, y: 80, w: 320, title: 'When it breaks',
      note: 'Bubbles, runs and currency crises, and what they left behind.',
      items: [['Germany', 'schacht'], ['Japan', 'japan-bubble'], ['Asia', 'asian-crisis']] },
    { id: 'companies', x: 1300, y: 470, w: 330, title: 'Companies',
      note: 'How companies raise money from markets, and hand it back.',
      items: [['Raising', 'anthropic-ipo'], ['Returning', 'buybacks'], ['Comeback', 'amd'], ['Rivals', 'chip-share']] },
    { id: 'chips', x: 1300, y: 900, w: 330, title: 'Chips and AI',
      note: 'The industry the money is pouring into right now.',
      items: [['Value chain', 'smile'], ['Compute', 'gpu-unlock'], ['Data centres', 'stargate'], ['Inference', 'inference'], ['The lab', 'anthropic-story']] },
    { id: 'materials', x: 760, y: 940, w: 320, title: 'Raw materials',
      note: 'Single-supplier inputs the whole chain quietly depends on.',
      items: [['Glass cloth', 'glass-cloth'], ['Iodine', 'iodine']] },
    { id: 'beyond', x: 60, y: 920, w: 320, title: 'Beyond finance',
      note: 'Stories off the money map.',
      items: [['Neurotech', 'implants'], ['AD 184–280', 'three-kingdoms'], ['210–180 BC', 'chu-han']] }
  ];
  const ARROWS = [
    ['savers', 'hub', 'invest in'],
    ['hub', 'companies', 'fund'],
    ['gov', 'hub', 'borrows in, sets rates'],
    ['plumbing', 'hub', 'settles and prices'],
    ['hub', 'crises', 'can break'],
    ['companies', 'savers', 'return cash to', 'bottom', 'bottom'],   // routed under the hub
    ['companies', 'chips', 'build'],
    ['chips', 'materials', 'depend on'],
    ['gov', 'crises', 'defends the currency']
  ];

  // anything not placed on a card goes on a catch-all card
  const placed = new Set(CARDS.flatMap((c) => c.items.map((i) => i[1])));
  const loose = B.articles.filter((a) => !placed.has(a.id));
  if (loose.length) CARDS.push({ id: 'new', x: 440, y: 1160, w: 320, title: 'New on the map', note: 'Not yet placed on a topic.', items: loose.map((a) => ['', a.id]) });
  const cardById = Object.fromEntries(CARDS.map((c) => [c.id, c]));

  /* ---------- render cards ---------- */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cardHTML = (c) => {
    const out = ARROWS.filter((a) => a[0] === c.id).map((a) => `<li>→ ${esc(a[2])} <b>${esc(cardById[a[1]].title)}</b></li>`).join('');
    return `<section class="cv-card${c.hub ? ' hub' : ''}" id="cv-${c.id}" style="--x:${c.x}px;--y:${c.y}px;--w:${c.w}px">
      <h3>${esc(c.title)}</h3>
      <p class="cv-note">${esc(c.note)}</p>
      <ul class="cv-items">${c.items.filter((i) => byId[i[1]]).map(([tag, id]) => `<li data-id="${id}">${tag ? `<span class="cv-tag">${esc(tag)}</span>` : ''}<a href="${esc(byId[id].href)}">${esc(byId[id].short || byId[id].title)}</a></li>`).join('')}</ul>
      ${out ? `<ul class="cv-out">${out}</ul>` : ''}
    </section>`;
  };
  world.insertAdjacentHTML('beforeend', CARDS.map(cardHTML).join(''));
  const svg = document.getElementById('cvArrows');

  /* ---------- arrows: curved, from the facing sides of two cards ---------- */
  const box = (id) => { const c = cardById[id]; return { x: c.x, y: c.y, w: c.w, h: document.getElementById('cv-' + id).offsetHeight }; };
  const SIDE = { top: [0, -1], bottom: [0, 1], left: [-1, 0], right: [1, 0] };
  function anchor(b, o, side) {
    if (side) { const [nx, ny] = SIDE[side]; return { x: b.x + b.w * (nx + 1) / 2, y: b.y + b.h * (ny + 1) / 2, nx, ny }; }
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2, dx = o.x + o.w / 2 - cx, dy = o.y + o.h / 2 - cy;
    if (Math.abs(dx) / (b.w + o.w) > Math.abs(dy) / (b.h + o.h)) return { x: dx > 0 ? b.x + b.w : b.x, y: cy, nx: dx > 0 ? 1 : -1, ny: 0 };
    return { x: cx, y: dy > 0 ? b.y + b.h : b.y, nx: 0, ny: dy > 0 ? 1 : -1 };
  }
  function drawArrows() {
    let maxX = 0, maxY = 0;
    CARDS.forEach((c) => { const b = box(c.id); maxX = Math.max(maxX, b.x + b.w); maxY = Math.max(maxY, b.y + b.h); });
    const W = maxX + 60, H = maxY + 60;
    world.style.width = W + 'px'; world.style.height = H + 'px';
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = `<defs><marker id="cvHead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="context-stroke"/></marker></defs>` +
      ARROWS.map(([f, t, label, sf, st]) => {
        const A = box(f), T = box(t), p = anchor(A, T, sf), q = anchor(T, A, st);
        const d = sf ? Math.max(160, Math.abs(Math.max(p.y, q.y) - Math.min(p.y, q.y)) + 160) : Math.max(60, Math.hypot(q.x - p.x, q.y - p.y) * 0.4);
        const c1 = { x: p.x + p.nx * d, y: p.y + p.ny * d }, c2 = { x: q.x + q.nx * d, y: q.y + q.ny * d };
        const mx = (p.x + 3 * c1.x + 3 * c2.x + q.x) / 8, my = (p.y + 3 * c1.y + 3 * c2.y + q.y) / 8;
        const lw = label.length * 7.6 + 18;
        return `<g class="cv-a" data-f="${f}" data-t="${t}"><path d="M${p.x} ${p.y}C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${q.x + q.nx * 3} ${q.y + q.ny * 3}" marker-end="url(#cvHead)"/>
          <rect x="${mx - lw / 2}" y="${my - 13}" width="${lw}" height="26" rx="5"/><text x="${mx}" y="${my + 5}">${esc(label)}</text></g>`;
      }).join('');
  }

  /* ---------- hover: light up connected explainers, and a card's arrows ---------- */
  const links = {};
  G.edges.forEach((e) => { (links[e.a] = links[e.a] || new Set()).add(e.b); (links[e.b] = links[e.b] || new Set()).add(e.a); });
  const hint = document.getElementById('cvHint'), defaultHint = hint ? hint.innerHTML : '';
  const clear = () => {
    world.classList.remove('focus');
    world.querySelectorAll('.cv-items li').forEach((x) => x.classList.remove('on', 'nb'));
    if (hint) hint.innerHTML = defaultHint;
  };
  world.addEventListener('mouseover', (ev) => {
    const card = ev.target.closest('.cv-card');
    svg.querySelectorAll('.cv-a').forEach((g) => g.classList.toggle('hl', !!card && (card.id === 'cv-' + g.dataset.f || card.id === 'cv-' + g.dataset.t)));
    const li = ev.target.closest('.cv-items li');
    if (!li) { clear(); return; }
    const id = li.dataset.id, nb = links[id] || new Set();
    world.classList.add('focus');
    world.querySelectorAll('.cv-items li').forEach((x) => { x.classList.toggle('on', x.dataset.id === id); x.classList.toggle('nb', nb.has(x.dataset.id)); });
    if (hint) hint.innerHTML = nb.size
      ? `<b>${esc(byId[id].short)}</b> connects to ${nb.size} other explainer${nb.size > 1 ? 's' : ''} (highlighted) through links in the text, shared companies or a related topic.`
      : `<b>${esc(byId[id].short)}</b> stands on its own.`;
  });
  world.addEventListener('mouseleave', () => { clear(); svg.querySelectorAll('.cv-a').forEach((g) => g.classList.remove('hl')); });

  /* ---------- pan and zoom (d3-zoom on the board, CSS transform on the world) ---------- */
  let zoom = null;
  const narrow = () => board.clientWidth < 700;
  function fit(animate) {
    if (!zoom) return;
    const W = board.clientWidth, H = board.clientHeight, w = world.offsetWidth, h = world.offsetHeight;
    const k = Math.min(W / w, H / h, 1);
    const t = d3.zoomIdentity.translate((W - w * k) / 2, (H - h * k) / 2).scale(k);
    (animate ? d3.select(board).transition().duration(400) : d3.select(board)).call(zoom.transform, t);
  }
  function layout() {
    const list = narrow();
    board.classList.toggle('cv-list', list);
    if (list) {
      world.style.transform = world.style.width = world.style.height = '';
      if (zoom) { d3.select(board).on('.zoom', null); zoom = null; }
      return;
    }
    drawArrows();
    if (!zoom && window.d3) {
      zoom = d3.zoom().scaleExtent([0.3, 2])
        .filter((ev) => (ev.type === 'wheel' ? ev.ctrlKey || ev.metaKey : !ev.button && !(ev.target.closest && ev.target.closest('a'))))
        .on('zoom', (ev) => { const t = ev.transform; world.style.transform = `translate(${t.x}px,${t.y}px) scale(${t.k})`; });
      d3.select(board).call(zoom).on('dblclick.zoom', null);
    }
    fit(false);
  }
  const zi = document.getElementById('zoomIn'), zo = document.getElementById('zoomOut'), zr = document.getElementById('zoomReset');
  if (zi) zi.onclick = () => zoom && d3.select(board).transition().duration(250).call(zoom.scaleBy, 1.25);
  if (zo) zo.onclick = () => zoom && d3.select(board).transition().duration(250).call(zoom.scaleBy, 0.8);
  if (zr) zr.onclick = () => fit(true);

  const mc = document.getElementById('mapCount'); if (mc) mc.textContent = `${B.articles.length} explainers on ${CARDS.length} topic cards.`;
  addEventListener('bottleneck:mapshow', () => requestAnimationFrame(layout));
  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 150); });
})();
