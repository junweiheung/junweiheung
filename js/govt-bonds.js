/* Drill-down pie for the government-bonds explainer. Starts on "who holds the
   $40.1tn" by holder; clicking the Foreign holders slice breaks it into countries.
   Click that slice again, the back button, or outside to return. Plain SVG, no d3. */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const svg = document.getElementById("pie");
  const leg = document.getElementById("leg");
  if (!svg || !leg) return;
  const titleEl = document.getElementById("pieTitle");
  const subEl = document.getElementById("pieSub");
  const backBtn = document.getElementById("pieBack");
  const fig = svg.closest(".fig");

  const CX = 110, CY = 110, R = 96, HOLE = 46;

  // "drill" marks the slice that drills down into another dataset
  const byHolder = {
    title: "Who holds the $40.1 trillion",
    sub: 'Click the <b>foreign holders</b> slice to break it down by country',
    fmt: (d) => d.value.toFixed(1) + "%",
    rest: "$40.1T",
    pop: false,
    data: [
      { label: "Other US investors", value: 48.0, color: "#2463d6" },
      { label: "US government accounts", value: 19.4, color: "#7fbf8a" },
      { label: "Foreign holders", value: 21.3, color: "#e0b65a", drill: "foreign" },
      { label: "Federal Reserve", value: 11.3, color: "#5d5a55" },
    ],
  };
  const foreign = {
    title: "The $8.5 trillion held abroad",
    sub: "Foreign holders by country · click anywhere out to go back",
    fmt: (d) => "$" + d.value.toFixed(1) + "tn",
    rest: "$8.5tn",
    pop: true,
    data: [
      { label: "Japan", value: 1.1, color: "#c2412d" },
      { label: "United Kingdom", value: 0.8, color: "#e0b65a" },
      { label: "China", value: 0.7, color: "#2463d6" },
      { label: "Other foreign", value: 5.9, color: "#a9a59c" },
    ],
  };

  function slicePath(a0, a1) {
    const x0 = CX + R * Math.cos(a0), y0 = CY + R * Math.sin(a0);
    const x1 = CX + R * Math.cos(a1), y1 = CY + R * Math.sin(a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M${CX},${CY} L${x0.toFixed(2)},${y0.toFixed(2)} A${R},${R} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)} Z`;
  }

  let view = "holder";
  let slices = [];

  function render(cfg) {
    svg.innerHTML = "";
    slices = [];
    const total = cfg.data.reduce((s, d) => s + d.value, 0);
    let a = -Math.PI / 2;
    cfg.data.forEach((d, i) => {
      const a1 = a + (d.value / total) * Math.PI * 2;
      const mid = (a + a1) / 2;
      const p = el("path", {
        d: slicePath(a, a1), fill: d.color, stroke: "#fff", "stroke-width": 2,
        class: "pslice" + (d.drill ? " drillable" : ""), tabindex: 0, role: "img",
        "aria-label": `${d.label}, ${cfg.fmt(d)}${d.drill ? ", click to break down" : ""}`,
      }, svg);
      p.style.transformOrigin = `${CX}px ${CY}px`;
      p.dataset.dx = (Math.cos(mid) * (cfg.pop ? 12 : 0)).toFixed(2);
      p.dataset.dy = (Math.sin(mid) * (cfg.pop ? 12 : 0)).toFixed(2);
      slices.push({ node: p, d });
      a = a1;
    });
    el("circle", { cx: CX, cy: CY, r: HOLE, fill: "#fff" }, svg);
    // the value in the centre of the hole: the slice's value on hover, the total at rest
    const cVal = el("text", { x: CX, y: CY + 6, "text-anchor": "middle", class: "pie-val" }, svg);
    leg.innerHTML = cfg.data.map((d, i) =>
      `<li data-i="${i}" tabindex="0" class="${d.drill ? "drillable" : ""}"><s style="background:${d.color}"></s><span>${d.label}${d.drill ? ' <em class="hint">break down →</em>' : ""}</span><b>${cfg.fmt(d)}</b></li>`).join("");
    const rows = [...leg.children];
    cVal.textContent = cfg.rest; // total at rest

    function focus(i) {
      svg.classList.add("active");
      slices.forEach((s, j) => {
        const on = j === i;
        s.node.classList.toggle("on", on);
        s.node.classList.toggle("off", !on);
        s.node.style.transform = (cfg.pop && on) ? `scale(1.05) translate(${s.node.dataset.dx}px,${s.node.dataset.dy}px)` : "";
      });
      rows.forEach((row, j) => row.classList.toggle("on", j === i));
      cVal.textContent = cfg.fmt(cfg.data[i]);
    }
    function clearFocus() {
      svg.classList.remove("active");
      slices.forEach((s) => { s.node.classList.remove("on", "off"); s.node.style.transform = ""; });
      rows.forEach((row) => row.classList.remove("on"));
      cVal.textContent = cfg.rest;
    }
    function activate(i) {
      // only the Foreign-holders slice in the holder view drills down.
      // In the foreign view, slices are inert; return via the back button, outside click, or Escape.
      if (view === "holder" && cfg.data[i].drill === "foreign") toForeign();
    }
    slices.forEach((s, i) => {
      s.node.addEventListener("mouseenter", () => focus(i));
      s.node.addEventListener("focus", () => focus(i));
      s.node.addEventListener("mouseleave", clearFocus);
      s.node.addEventListener("blur", clearFocus);
      s.node.addEventListener("click", (e) => { e.stopPropagation(); activate(i); });
      s.node.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(i); } });
    });
    rows.forEach((row, i) => {
      row.addEventListener("mouseenter", () => focus(i));
      row.addEventListener("focus", () => focus(i));
      row.addEventListener("mouseleave", clearFocus);
      row.addEventListener("blur", clearFocus);
      row.addEventListener("click", (e) => { e.stopPropagation(); activate(i); });
    });
  }

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const block = svg.closest(".pie-block");
  let swapping = false;

  // fade the pie + legend out, swap in the new view, fade back in
  function swap(toView) {
    if (swapping) return;
    const next = toView === "foreign" ? foreign : byHolder;
    const apply = () => {
      view = toView;
      titleEl.textContent = next.title;
      subEl.innerHTML = next.sub;
      if (backBtn) backBtn.hidden = (toView !== "foreign");
      render(next);
    };
    if (reduced) { apply(); return; }
    swapping = true;
    if (block) block.classList.add("swapping");
    setTimeout(() => {
      apply();                                 // swap content while faded out
      setTimeout(() => {                       // then fade back in
        if (block) block.classList.remove("swapping");
        swapping = false;
      }, 30);
    }, 200);
  }
  function toForeign() { swap("foreign"); }
  function toHolder() { swap("holder"); }

  if (backBtn) backBtn.addEventListener("click", (e) => { e.stopPropagation(); toHolder(); });
  // click outside the pie/legend returns to the holder view
  document.addEventListener("click", (e) => {
    if (view === "foreign" && fig && !svg.contains(e.target) && !leg.contains(e.target) && e.target !== backBtn) toHolder();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && view === "foreign") toHolder(); });

  render(byHolder, false); // initial draw; reveal handled by the .in-view transition
})();
