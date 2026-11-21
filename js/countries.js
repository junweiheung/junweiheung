/*
 * Bottleneck country map: a choropleth world map shaded by how many articles
 * cover each country. Interactions mirror the company map (pan/zoom, hover,
 * click-to-select, side panel). Data: js/countries-data.js. Geometry:
 * js/vendor/world-110m.js (world-atlas). Needs d3 and topojson-client.
 *
 * Tiny countries that don't exist in the 110m atlas (e.g. Singapore, Hong Kong)
 * are drawn as clickable marker dots at their coordinates, shaded like the rest.
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

  // [lng, lat] for small countries/territories too tiny to appear as a polygon
  // in the 110m atlas. Add more here as articles cover them.
  const MARKER_COORDS = {
    "Singapore": [103.82, 1.35],
    "Hong Kong": [114.17, 22.32],
    "Bahrain": [50.58, 26.07],
    "Luxembourg": [6.13, 49.61],
    "Malta": [14.38, 35.90],
  };

  const countOf = (name) => { const c = DATA[name]; return c && c.articles ? c.articles.length : 0; };
  const counts = Object.keys(DATA).map(countOf);
  const maxCount = Math.max(1, ...counts);

  const EMPTY = "#eceadf";
  const ramp = d3.scaleSequential(d3.interpolateYlOrBr).domain([0, maxCount * 1.15]);
  const fillFor = (name) => (countOf(name) > 0 ? ramp(countOf(name)) : EMPTY);

  const svg = d3.select(svgEl);
  const W = () => svgEl.clientWidth, H = () => svgEl.clientHeight;
  let vp = svg.append("g").attr("class", "vp");
  let curK = 1; // current zoom scale, used to keep marker dots a constant screen size

  const zoom = d3.zoom().scaleExtent([1, 8])
    .filter((e) => e.type !== "dblclick")
    .on("zoom", (e) => { vp.attr("transform", e.transform); curK = e.transform.k; sizeMarkers(); });
  svg.call(zoom).on("dblclick.zoom", null);
  const zoomBy = (k) => svg.transition().duration(200).call(zoom.scaleBy, k);
  $("zoomIn") && $("zoomIn").addEventListener("click", () => zoomBy(1.5));
  $("zoomOut") && $("zoomOut").addEventListener("click", () => zoomBy(1 / 1.5));
  $("zoomReset") && $("zoomReset").addEventListener("click", () => svg.transition().duration(250).call(zoom.transform, d3.zoomIdentity));

  const panel = $("panel");
  const HINT = `<p class="hint">Hover a country to see how many articles cover it. Click one to list them. Darker means more coverage. Small countries show as dots.</p>`;
  if (panel) panel.innerHTML = HINT;
  const tip = $("maptip");

  const world = window.__WORLD110M;
  const countries = topojson.feature(world, world.objects.countries).features
    .filter((f) => f.properties.name !== "Antarctica");
  const atlasNames = new Set(countries.map((f) => f.properties.name));

  // data countries missing from the atlas become marker dots (if we know their coords)
  const markers = Object.keys(DATA)
    .filter((name) => !atlasNames.has(name) && MARKER_COORDS[name])
    .map((name) => ({ name, lnglat: MARKER_COORDS[name] }));

  let path, proj;
  function fit() {
    proj = d3.geoNaturalEarth1().fitSize([W(), H()], { type: "FeatureCollection", features: countries });
    path = d3.geoPath(proj);
  }
  fit();

  /* ---- shared selection + tooltip, keyed by country name ---- */
  function showTipAt(clientX, clientY, name) {
    if (!tip) return;
    const n = countOf(name);
    tip.innerHTML = `<b>${esc(name)}</b><span>${n ? `${n} ${n === 1 ? "article" : "articles"}` : "No articles yet"}</span>`;
    tip.hidden = false;
    const box = svgEl.getBoundingClientRect();
    tip.style.left = (clientX - box.left) + "px";
    tip.style.top = (clientY - box.top) + "px";
  }
  const hideTip = () => { if (tip) tip.hidden = true; };

  function selectName(name) {
    g.classed("sel", (d) => d.properties.name === name);
    mk.classed("sel", (d) => d.name === name);
    if (!name) { if (panel) panel.innerHTML = HINT; return; }
    showCountry(name);
  }

  function showCountry(name) {
    if (!panel) return;
    const arts = (DATA[name] && DATA[name].articles) || [];
    panel.innerHTML = `
      <h4>${esc(name)}</h4>
      <div class="hq">${arts.length} ${arts.length === 1 ? "article" : "articles"}</div>
      ${arts.length
        ? `<ul>${arts.map((a) => `<li>${a.href ? `<a href="${esc(a.href)}">${esc(a.title)}</a>` : `<span>${esc(a.title)}</span><span class="role">coming soon</span>`}</li>`).join("")}</ul>`
        : `<p class="hint">No articles cover this country yet.</p>`}`;
  }

  /* ---- country polygons ---- */
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

  g.on("mousemove", (e, d) => showTipAt(e.clientX, e.clientY, d.properties.name))
   .on("mouseleave", hideTip)
   .on("click", (e, d) => { e.stopPropagation(); hideTip(); if (countOf(d.properties.name) > 0) selectName(d.properties.name); })
   .on("keydown", (e, d) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectName(d.properties.name); } });

  /* ---- marker dots for tiny countries ---- */
  const mkLayer = vp.append("g").attr("class", "mk-layer");
  const mk = mkLayer.selectAll("g.mk").data(markers).join("g")
    .attr("class", "mk")
    .attr("tabindex", 0).attr("role", "button")
    .attr("aria-label", (d) => { const n = countOf(d.name); return `${d.name}, ${n} ${n === 1 ? "article" : "articles"}`; });
  mk.append("circle").attr("class", "mk-dot").attr("fill", (d) => fillFor(d.name));
  mk.append("title").text((d) => d.name); // native fallback

  function placeMarkers() {
    mk.attr("transform", (d) => { const p = proj(d.lnglat); return `translate(${p[0]},${p[1]})`; });
    sizeMarkers();
  }
  function sizeMarkers() {
    // counter-scale the radius so the dot stays ~6px on screen regardless of zoom
    // (stroke stays crisp via CSS vector-effect:non-scaling-stroke)
    mk.select("circle").attr("r", 6 / curK);
  }
  placeMarkers();

  mk.on("mousemove", (e, d) => showTipAt(e.clientX, e.clientY, d.name))
    .on("mouseleave", hideTip)
    .on("click", (e, d) => { e.stopPropagation(); hideTip(); selectName(d.name); })
    .on("keydown", (e, d) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectName(d.name); } });

  svg.on("click", () => selectName(null));

  /* ---- legend ---- */
  const legend = $("maplegend");
  if (legend) {
    const items = [`<span class="lg"><i style="background:${EMPTY}"></i>0</span>`];
    for (let i = 1; i <= maxCount; i++) items.push(`<span class="lg"><i style="background:${ramp(i)}"></i>${i}</span>`);
    legend.innerHTML = items.join("") + `<span class="lgcap">articles per country · small countries shown as dots</span>`;
  }

  let rt;
  addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => { fit(); g.attr("d", path); placeMarkers(); }, 200);
  });
})();
