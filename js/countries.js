/*
 * Bottleneck country map: a choropleth world map shaded by how many articles
 * cover each country. Interactions mirror the company map (pan/zoom, hover,
 * click-to-select, side panel). Data: js/countries-data.js. Geometry:
 * js/vendor/countries-110m.json (world-atlas). Needs d3 and topojson-client.
 */
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const DATA = (window.BOTTLENECK_COUNTRIES || { countries: {} }).countries;
  const svgEl = $("worldmap");
  if (!svgEl) return;
  if (!window.d3 || !window.topojson) {
    svgEl.outerHTML = `<p class="panel">The map couldn't load (no internet connection?).</p>`;
    return;
  }

  const countOf = (name) => { const c = DATA[name]; return c && c.articles ? c.articles.length : 0; };
  const counts = Object.keys(DATA).map(countOf);
  const maxCount = Math.max(1, ...counts);

  // gold ramp: 0 = empty neutral, 1..max = light→dark gold
  const EMPTY = "#eceadf";
  const ramp = d3.scaleSequential(d3.interpolateYlOrBr).domain([0, maxCount * 1.15]);
  const fillFor = (name) => (countOf(name) > 0 ? ramp(countOf(name)) : EMPTY);

  const svg = d3.select(svgEl);
  const W = () => svgEl.clientWidth, H = () => svgEl.clientHeight;
  let vp = svg.append("g").attr("class", "vp");

  const zoom = d3.zoom().scaleExtent([1, 8])
    .filter((e) => e.type !== "dblclick")
    .on("zoom", (e) => vp.attr("transform", e.transform));
  svg.call(zoom).on("dblclick.zoom", null);
  const zoomBy = (k) => svg.transition().duration(200).call(zoom.scaleBy, k);
  $("zoomIn") && $("zoomIn").addEventListener("click", () => zoomBy(1.5));
  $("zoomOut") && $("zoomOut").addEventListener("click", () => zoomBy(1 / 1.5));
  $("zoomReset") && $("zoomReset").addEventListener("click", () => svg.transition().duration(250).call(zoom.transform, d3.zoomIdentity));

  const panel = $("panel");
  const HINT = `<p class="hint">Hover a country to see how many articles cover it. Click one to list them. Darker means more coverage.</p>`;
  if (panel) panel.innerHTML = HINT;

  const tip = $("maptip");
  const world = window.__WORLD110M; // injected by the inline loader in countries.html
  const countries = topojson.feature(world, world.objects.countries).features
    .filter((f) => f.properties.name !== "Antarctica");

  let path, proj;
  function fit() {
    proj = d3.geoNaturalEarth1().fitSize([W(), H()], { type: "FeatureCollection", features: countries });
    path = d3.geoPath(proj);
  }
  fit();

  const g = vp.selectAll("path").data(countries).join("path")
    .attr("class", "cty")
    .attr("d", path)
    .attr("fill", (d) => fillFor(d.properties.name))
    .attr("tabindex", (d) => (countOf(d.properties.name) > 0 ? 0 : null))
    .attr("role", (d) => (countOf(d.properties.name) > 0 ? "button" : null))
    .attr("aria-label", (d) => {
      const n = countOf(d.properties.name);
      return n > 0 ? `${d.properties.name}, ${n} ${n === 1 ? "article" : "articles"}` : null;
    });

  function showTip(e, d) {
    if (!tip) return;
    const n = countOf(d.properties.name);
    tip.innerHTML = `<b>${esc(d.properties.name)}</b><span>${n ? `${n} ${n === 1 ? "article" : "articles"}` : "No articles yet"}</span>`;
    tip.hidden = false;
    const box = svgEl.getBoundingClientRect();
    tip.style.left = (e.clientX - box.left) + "px";
    tip.style.top = (e.clientY - box.top) + "px";
  }
  const hideTip = () => { if (tip) tip.hidden = true; };

  function select(d) {
    g.classed("sel", (n) => n === d);
    g.classed("dim", (n) => d && n !== d && countOf(n.properties.name) > 0 ? false : false); // no dimming; selection is the highlight
    if (!d) { if (panel) panel.innerHTML = HINT; return; }
    showCountry(d.properties.name);
  }

  function showCountry(name) {
    if (!panel) return;
    const rec = DATA[name];
    const arts = (rec && rec.articles) || [];
    panel.innerHTML = `
      <h4>${esc(name)}</h4>
      <div class="hq">${arts.length} ${arts.length === 1 ? "article" : "articles"}</div>
      ${arts.length
        ? `<ul>${arts.map((a) => `<li>${a.href ? `<a href="${esc(a.href)}">${esc(a.title)}</a>` : `<span>${esc(a.title)}</span><span class="role">coming soon</span>`}</li>`).join("")}</ul>`
        : `<p class="hint">No articles cover this country yet.</p>`}`;
  }

  g.on("mousemove", showTip)
   .on("mouseleave", hideTip)
   .on("click", (e, d) => { e.stopPropagation(); hideTip(); if (countOf(d.properties.name) > 0) select(d); })
   .on("keydown", (e, d) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(d); } });
  svg.on("click", () => select(null));

  // legend: swatches 0..max
  const legend = $("maplegend");
  if (legend) {
    const items = [`<span class="lg"><i style="background:${EMPTY}"></i>0</span>`];
    for (let i = 1; i <= maxCount; i++) items.push(`<span class="lg"><i style="background:${ramp(i)}"></i>${i}</span>`);
    legend.innerHTML = items.join("") + `<span class="lgcap">articles per country</span>`;
  }

  let rt;
  addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => { fit(); g.attr("d", path); }, 200);
  });
})();
