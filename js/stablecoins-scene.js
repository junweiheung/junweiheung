/* The Terra death-spiral loop for the stablecoins explainer. Four nodes in a ring
   with arrows; a dot travels the loop to show the self-feeding cycle. Plain SVG. */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const svg = document.getElementById("spiralSvg");
  if (!svg) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  el("rect", { x: 0, y: 0, width: 800, height: 380, fill: "#f3efe6" }, svg);

  const cx = 400, cy = 196, rx = 250, ry = 120;
  const nodes = [
    { t: "UST falls below $1", c: "#c2412d" },
    { t: "Holders swap UST\nfor $1 of LUNA", c: "#e0b65a" },
    { t: "They sell LUNA,\nits price drops", c: "#b8892b" },
    { t: "Terra mints more\nLUNA — price drops more", c: "#8a2f2f" },
  ];
  // positions around an ellipse, starting at top
  const pos = nodes.map((_, i) => {
    const ang = -Math.PI / 2 + i * Math.PI / 2;
    return { x: cx + rx * Math.cos(ang), y: cy + ry * Math.sin(ang), ang };
  });

  // curved arrows between consecutive nodes (clockwise)
  for (let i = 0; i < 4; i++) {
    const a = pos[i], b = pos[(i + 1) % 4];
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    // bow the control point outward from centre
    const ox = (mx - cx) * 0.18, oy = (my - cy) * 0.18;
    const path = `M${a.x.toFixed(0)},${a.y.toFixed(0)} Q${(mx + ox).toFixed(0)},${(my + oy).toFixed(0)} ${b.x.toFixed(0)},${b.y.toFixed(0)}`;
    el("path", { d: path, fill: "none", stroke: "#c9a24a", "stroke-width": 3, "marker-end": "url(#sp-arrow)", class: "sp-link", id: "sp-link-" + i }, svg);
  }
  // arrowhead marker
  const defs = el("defs", {}, svg);
  const m = el("marker", { id: "sp-arrow", viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" }, defs);
  el("path", { d: "M0,0 L10,5 L0,10 z", fill: "#b8892b" }, m);

  // nodes
  nodes.forEach((n, i) => {
    const g = el("g", {}, svg);
    el("rect", { x: pos[i].x - 92, y: pos[i].y - 30, width: 184, height: 60, rx: 8, fill: "#0d0d0f", stroke: n.c, "stroke-width": 3 }, g);
    const lines = n.t.split("\n");
    lines.forEach((ln, li) => {
      const tx = el("text", { x: pos[i].x, y: pos[i].y + (lines.length === 1 ? 5 : li * 18 - 4), "text-anchor": "middle", "font-family": "Inter", "font-size": 14, "font-weight": 700, fill: "#fff" }, g);
      tx.textContent = ln;
    });
  });

  // centre caption
  const c1 = el("text", { x: cx, y: cy - 6, "text-anchor": "middle", "font-family": "Inter", "font-size": 15, "font-weight": 800, fill: "#c2412d" }, svg);
  c1.textContent = "DEATH SPIRAL";
  const c2 = el("text", { x: cx, y: cy + 16, "text-anchor": "middle", "font-family": "Inter", "font-size": 12, fill: "#76736c" }, svg);
  c2.textContent = "each step feeds the next";

  // a dot that travels the loop (only while the scene is visible)
  if (!reduced) {
    const dot = el("circle", { r: 7, fill: "#c2412d", class: "sp-dot" }, svg);
    const links = [0, 1, 2, 3].map((i) => document.getElementById("sp-link-" + i));
    let seg = 0, t = 0, raf = 0, running = false;
    function step() {
      if (!running) return;
      t += 0.012;
      if (t >= 1) { t = 0; seg = (seg + 1) % 4; }
      const L = links[seg];
      const len = L.getTotalLength();
      const pt = L.getPointAtLength(len * t);
      dot.setAttribute("cx", pt.x); dot.setAttribute("cy", pt.y);
      raf = requestAnimationFrame(step);
    }
    new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting && !running) { running = true; raf = requestAnimationFrame(step); }
      else if (!e.isIntersecting) { running = false; cancelAnimationFrame(raf); }
    })).observe(svg.closest(".scene") || svg);
  }
})();
