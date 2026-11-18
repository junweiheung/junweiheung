(function () {
  const DATA = window.BOTTLENECK || { articles: [], companies: {} };
  // newest first; on the same date, the one added later to articles.js comes first (sort is stable)
  const articles = [...DATA.articles].reverse().sort((a, b) => b.date.localeCompare(a.date));
  const companies = DATA.companies;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtDate = (iso, opts) => new Date(iso + "T00:00:00").toLocaleDateString("en-US", opts);
  const longDate = (iso) => fmtDate(iso, { month: "long", day: "numeric", year: "numeric" });
  const shortDate = (iso) => fmtDate(iso, { month: "short", day: "numeric", year: "numeric" });

  /* ---------- latest + key numbers ---------- */
  const latest = articles[0];
  if (latest) {
    $("latestDate").textContent = fmtDate(latest.date, { month: "short", year: "numeric" });
    $("feature").href = latest.href;
    $("fThumb").src = latest.thumb;
    $("fKicker").innerHTML = `${esc(latest.kicker)} <span>· ${esc(latest.topic)}</span>`;
    $("fTitle").textContent = latest.title;
    $("fDek").textContent = latest.dek;
    $("fDate").textContent = longDate(latest.date);
    $("fRead").textContent = latest.readMins + " min read";
    $("strip").innerHTML = (latest.stats || [])
      .map((s) => `<div><div class="big">${esc(s.big)}</div><p>${esc(s.text)}</p></div>`).join("");
  }

  /* ---------- list + topic filter ---------- */
  $("count").textContent = articles.length + " published";
  const topics = [...new Set(articles.map((a) => a.topic))];
  let topic = "All";
  function renderList() {
    const shown = articles.filter((a) => topic === "All" || a.topic === topic);
    $("list").innerHTML = shown.map((a) => `
      <li><a href="${esc(a.href)}">
        <span class="date">${shortDate(a.date)}</span>
        <span class="t">${esc(a.title)}<small>${esc(a.summary)} · ${a.readMins} min</small></span>
        <span class="tag">${esc(a.topic)}</span>
      </a></li>`).join("") + `<li class="soon">The next one is in the works.</li>`;
  }
  function chips(el, options, current, onPick) {
    if (options.length < 2) { el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = options.map((o) =>
      `<button type="button" data-v="${esc(o.v)}" aria-pressed="${o.v === current}">${esc(o.label)}</button>`).join("");
    el.onclick = (e) => {
      const b = e.target.closest("button"); if (!b) return;
      el.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
      onPick(b.dataset.v);
    };
  }
  chips($("topicChips"), [{ v: "All", label: "All" }, ...topics.map((t) => ({ v: t, label: t }))], "All",
    (v) => { topic = v; renderList(); });
  renderList();
  $("footList").innerHTML = articles.map((a) => `<a href="${esc(a.href)}">${esc(a.short || a.title)}</a>`).join("<br>");

  /* ---------- company map ---------- */
  const panel = $("panel");
  const HINT = `<p class="hint">Click a company on the map to see which explainers it appears in, what it does there, and what it keeps per dollar.</p>`;
  panel.innerHTML = HINT;

  // where each company appears: [{article, step, margin}]
  const appearances = {};
  articles.forEach((a) => a.chain.forEach((s) => s.companies.forEach((c) => {
    (appearances[c] = appearances[c] || []).push({ a, step: s.step, margin: (a.margins || {})[c] });
  })));
  const coIds = Object.keys(appearances);
  $("mapCount").textContent = `${coIds.length} companies · ${articles.length} explainer${articles.length === 1 ? "" : "s"}`;

  function showCompany(id) {
    const c = companies[id] || { name: id };
    const rows = appearances[id];
    const byArticle = new Map();
    rows.forEach((r) => { if (!byArticle.has(r.a)) byArticle.set(r.a, []); byArticle.get(r.a).push(r); });
    const peers = new Set();
    rows.forEach((r) => r.a.chain.filter((s) => s.step === r.step).forEach((s) => s.companies.forEach((p) => p !== id && peers.add(p))));
    panel.innerHTML = `
      <h4>${esc(c.name)}</h4>
      <div class="hq">${c.hq ? "HQ: " + esc(c.hq) : ""}</div>
      <ul>${[...byArticle].map(([a, rs]) => `
        <li><a href="${esc(a.href)}">${esc(a.short || a.title)}</a>
          <span class="role">${rs.map((r) => esc(r.step)).join(" · ")}${rs[0].margin ? ` · keeps <span class="m">${esc(rs[0].margin)}</span>` : ""}</span>
        </li>`).join("")}</ul>
      ${peers.size ? `<p class="peers">Alongside: ${[...peers].map((p) => esc((companies[p] || { name: p }).name)).join(", ")}</p>` : ""}`;
  }

  if (!window.d3) { $("graph").outerHTML = `<p class="panel">The map couldn't load (no internet connection?).</p>`; return; }

  const svg = d3.select("#graph");
  let sim;
  function drawGraph(filterId) {
    if (sim) sim.stop();
    svg.selectAll("*").remove();
    const W = svg.node().clientWidth, H = svg.node().clientHeight;
    const shownArticles = articles.filter((a) => !filterId || filterId === "all" || a.id === filterId);

    const nodes = [], links = [], chainLinks = [];
    const nodeById = new Map();
    const add = (n) => { if (!nodeById.has(n.id)) { nodeById.set(n.id, n); nodes.push(n); } return nodeById.get(n.id); };

    // Steps run left→right on wide screens and top→bottom on narrow ones,
    // zig-zagging so neighbouring labels don't collide. Each explainer gets its own band.
    const vertical = W < 640, k = shownArticles.length;
    shownArticles.forEach((a, ai) => {
      const n = a.chain.length;
      a.chain.forEach((s, si) => {
        const t = n === 1 ? 0.5 : si / (n - 1), zig = si % 2 ? 1 : -1;
        const along = vertical ? H * (0.07 + 0.86 * t) : W * (0.08 + 0.84 * t);
        const band = (vertical ? W : H) / k;
        const across = band * (ai + 0.5) + zig * band * (vertical ? 0.1 : 0.2);
        const step = add({
          id: `${a.id}:${si}`, type: "step", label: s.step,
          tx: vertical ? across : along,
          ty: vertical ? along : across,
        });
        if (si > 0) chainLinks.push({ source: `${a.id}:${si - 1}`, target: step.id });
        s.companies.forEach((c) => {
          add({ id: c, type: "co", label: (companies[c] || { name: c }).name });
          links.push({ source: c, target: step.id });
        });
      });
    });
    // a company is a "bridge" if it sits at more than one step (in the shown explainers)
    const deg = {}, stepsOf = {};
    links.forEach((l) => { deg[l.source] = (deg[l.source] || 0) + 1; (stepsOf[l.source] = stepsOf[l.source] || []).push(l.target); });
    nodes.forEach((n) => { if (n.type === "co") { n.deg = deg[n.id]; n.r = 7 + 3 * (n.deg - 1); } });

    const gLinks = svg.append("g").selectAll("line").data(links).join("line").attr("class", "g-link");
    chainLinks.forEach((l) => { l.source = nodeById.get(l.source); l.target = nodeById.get(l.target); });
    const gChain = svg.append("g").selectAll("line").data(chainLinks).join("line").attr("class", "g-chain");

    const coLayer = svg.append("g"), stepLayer = svg.append("g");
    const steps = stepLayer.selectAll("g").data(nodes.filter((n) => n.type === "step")).join("g").attr("class", "g-step");
    steps.append("rect").attr("rx", 2).attr("height", 22).attr("y", -11);
    steps.append("text").attr("text-anchor", "middle").attr("dy", "0.35em").text((d) => d.label);
    steps.each(function () {
      const t = d3.select(this).select("text").node().getComputedTextLength();
      d3.select(this).select("rect").attr("width", t + 16).attr("x", -(t + 16) / 2);
      d3.select(this).datum().hw = (t + 16) / 2;
    });

    const cos = coLayer.selectAll("g").data(nodes.filter((n) => n.type === "co")).join("g")
      .attr("class", (d) => "g-co" + (d.deg > 1 ? " bridge" : ""))
      .attr("tabindex", 0).attr("role", "button").attr("aria-label", (d) => d.label);
    cos.append("circle").attr("r", (d) => d.r);
    cos.append("text").attr("x", (d) => d.r + 4).attr("dy", "0.35em").text((d) => d.label)
      .each(function (d) { d.lw = this.getComputedTextLength(); });

    function select(d) {
      cos.classed("sel", (n) => n === d);
      if (!d) { [cos, steps, gLinks, gChain].forEach((s) => s.classed("dim", false)); panel.innerHTML = HINT; return; }
      const near = new Set([d.id]);
      links.forEach((l) => { if (l.source.id === d.id) near.add(l.target.id); });
      links.forEach((l) => { if (near.has(l.target.id)) near.add(l.source.id); });
      cos.classed("dim", (n) => !near.has(n.id));
      steps.classed("dim", (n) => !near.has(n.id));
      gLinks.classed("dim", (l) => !(near.has(l.source.id) && near.has(l.target.id)));
      gChain.classed("dim", true);
      showCompany(d.id);
    }
    cos.on("click", (e, d) => { e.stopPropagation(); select(d); })
       .on("keydown", (e, d) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(d); } });
    svg.on("click", () => select(null));

    sim = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d) => d.id).distance(58).strength(0.5))
      .force("charge", d3.forceManyBody().strength((d) => (d.type === "step" ? -300 : -160)))
      .force("x", d3.forceX((d) => d.tx ?? W / 2).strength((d) => (d.type === "step" ? 0.9 : 0.02)))
      .force("y", d3.forceY((d) => d.ty ?? H / 2).strength((d) => (d.type === "step" ? 0.9 : 0.04)))
      .force("collide", d3.forceCollide((d) => (d.type === "step" ? d.hw * 0.8 : d.r + 8 + (d.lw || 0) * 0.4)).iterations(2))
      .on("tick", () => {
        nodes.forEach((d) => {
          // keep every node, including its label, inside the box
          const left = d.type === "step" ? d.hw + 4 : d.r + 4;
          const right = d.type === "step" ? d.hw + 4 : d.r + 8 + (d.lw || 0);
          d.x = Math.max(left, Math.min(W - right, d.x));
          d.y = Math.max(16, Math.min(H - 16, d.y));
        });
        gLinks.attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y).attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);
        gChain.attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y).attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);
        steps.attr("transform", (d) => `translate(${d.x},${d.y})`);
        cos.attr("transform", (d) => `translate(${d.x},${d.y})`);
        // put each name on the side facing away from its step(s), so it doesn't cover the step label
        cos.select("text").each(function (d) {
          const ss = stepsOf[d.id].map((id) => nodeById.get(id));
          const sx = ss.reduce((t, n) => t + n.x, 0) / ss.length;
          const left = d.x < sx && d.x - d.r - 8 - d.lw > 0;
          this.setAttribute("x", left ? -(d.r + 4) : d.r + 4);
          this.setAttribute("text-anchor", left ? "end" : "start");
        });
      });
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { sim.stop(); for (let i = 0; i < 300; i++) sim.tick(); sim.on("tick")(); }

    const drag = d3.drag()
      .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.2).restart(); d.fx = d.x; d.fy = d.y; })
      .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; });
    cos.call(drag); steps.call(drag);
  }

  let mapFilter = "all";
  chips($("mapChips"), [{ v: "all", label: "All explainers" }, ...articles.map((a) => ({ v: a.id, label: a.short || a.title }))], "all",
    (v) => { mapFilter = v; panel.innerHTML = HINT; drawGraph(v); });
  drawGraph(mapFilter);
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => drawGraph(mapFilter), 200); });
})();

/* reveal on scroll */
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in-view"); io.unobserve(e.target); } }), { threshold: 0.2 });
document.querySelectorAll(".rv").forEach((e) => io.observe(e));
