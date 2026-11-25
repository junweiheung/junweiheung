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

/* ---------------- Four ways out of a debt: debt-to-GDP path ----------------
   d(t+1) = d(t) × (1 + r) / (1 + g) − primary balance. r = average interest rate on the debt,
   g = nominal GDP growth, primary balance = budget balance before interest (negative = deficit). */
(function () {
  const svg = document.getElementById('exSvg'), out = document.getElementById('exOut'), pre = document.getElementById('exPre');
  if (!svg || !out || !pre) return;
  const $ = (id) => document.getElementById(id);
  const G = $('exG'), R = $('exR'), P = $('exP');
  const D0 = 100, YEARS = 20, Y0 = 2025;
  const BASE = { g: 4.0, r: 3.3, p: -3.0 };
  const PRESETS = {
    base: { ...BASE, why: 'Roughly today’s US position: debt about 100% of GDP, an average interest rate of about 3.3%, nominal growth of about 4% and a deficit before interest of about 3% of GDP. The ratio keeps climbing.' },
    grow: { g: 5.0, r: 3.3, p: -2.6, why: 'One extra point of real growth a year raises nominal growth to 5% and lifts tax revenue a little. The ratio still rises, just more slowly: growth alone rarely closes a gap this size.' },
    inflate: { g: 7.5, r: 3.3, p: -3.0, why: 'About three extra points of inflation raise nominal growth to 7.5% while the interest on existing debt stays fixed, so the ratio falls. In practice lenders demand higher rates as debt rolls over, so the window is short; move the interest-rate slider up to see it close.' },
    repress: { g: 4.5, r: 0.5, p: -3.0, why: 'Hold the interest rate on the debt far below growth, by capping yields or requiring banks and pension funds to buy government bonds, while tolerating slightly higher inflation. The ratio drifts down, and savers quietly pay through returns below inflation.' },
    austere: { g: 3.2, r: 3.3, p: 1.0, why: 'Turn the deficit before interest into a 1% surplus by cutting spending or raising taxes. The ratio falls, but slower growth from the squeeze eats part of the gain, and the politics are brutal.' }
  };
  let cur = 'base';
  const path = (g, r, p) => { const d = [D0]; for (let t = 0; t < YEARS; t++) d.push(d[t] * (1 + r / 100) / (1 + g / 100) - p); return d; };
  const W = 640, H = 260, X0 = 46, X1 = 620, Yt = 16, Yb = 226, LO = 40, HI = 180;
  const x = (t) => X0 + t / YEARS * (X1 - X0), y = (v) => Yb - (Math.min(Math.max(v, LO), HI) - LO) / (HI - LO) * (Yb - Yt);
  const line = (d) => d.map((v, t) => `${t ? 'L' : 'M'}${x(t).toFixed(1)} ${y(v).toFixed(1)}`).join('');
  function draw() {
    const g = +G.value, r = +R.value, p = +P.value;
    $('exGv').textContent = g.toFixed(1) + '%'; $('exRv').textContent = r.toFixed(1) + '%';
    $('exPv').textContent = (p > 0 ? '+' : '') + p.toFixed(1) + '% of GDP';
    const base = path(BASE.g, BASE.r, BASE.p), d = path(g, r, p);
    let grid = '';
    for (let v = 60; v <= 180; v += 20) grid += `<line x1="${X0}" x2="${X1}" y1="${y(v)}" y2="${y(v)}" stroke="#eee"/><text x="${X0 - 6}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="#76736c">${v}%</text>`;
    for (let t = 0; t <= YEARS; t += 5) grid += `<text x="${x(t)}" y="${Yb + 18}" text-anchor="middle" font-size="11" fill="#76736c">${Y0 + t}</text>`;
    svg.innerHTML = grid +
      `<line x1="${X0}" x2="${X1}" y1="${y(100)}" y2="${y(100)}" stroke="#a9a59c" stroke-dasharray="3 4"/>` +
      `<path d="${line(base)}" fill="none" stroke="#a9a59c" stroke-width="2" stroke-dasharray="6 5"/>` +
      `<path d="${line(d)}" fill="none" stroke="#a3141f" stroke-width="3.5" stroke-linejoin="round"/>` +
      `<circle cx="${x(YEARS)}" cy="${y(d[YEARS])}" r="5" fill="#a3141f"/>` +
      `<text x="${x(YEARS) - 8}" y="${y(d[YEARS]) - 10}" text-anchor="end" font-size="13" font-weight="800" fill="#111">${Math.round(d[YEARS])}%</text>` +
      `<text x="${x(YEARS) - 8}" y="${y(base[YEARS]) + (Math.abs(base[YEARS] - d[YEARS]) < 8 ? 18 : -8)}" text-anchor="end" font-size="11.5" fill="#76736c">${cur === 'base' && g === BASE.g && r === BASE.r && p === BASE.p ? '' : 'today’s path ' + Math.round(base[YEARS]) + '%'}</text>`;
    const need = D0 * (r - g) / (100 + g);   // primary balance (% of GDP) that holds the ratio steady
    const custom = !(PRESETS[cur].g === g && PRESETS[cur].r === r && PRESETS[cur].p === p);
    out.innerHTML = `<div class="ex-nums">
        <div><span>Debt in ${Y0 + YEARS}</span><b>${Math.round(d[YEARS])}% of GDP</b></div>
        <div><span>Growth minus interest</span><b>${(g - r) > 0 ? '+' : ''}${(g - r).toFixed(1)} pts</b></div>
        <div><span>Balance before interest needed to hold debt steady</span><b>${need > 0 ? '+' : ''}${need.toFixed(1)}% of GDP</b></div>
      </div><p class="ex-why">${custom ? 'Your own mix. When growth beats the interest rate, a country can run a small deficit before interest and still see the ratio fall; when interest beats growth, it needs a surplus just to stand still.' : PRESETS[cur].why}</p>`;
    pre.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === cur && !custom)));
  }
  pre.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    cur = b.dataset.v; const s = PRESETS[cur];
    G.value = s.g; R.value = s.r; P.value = s.p; draw();
  });
  [G, R, P].forEach((el) => el.addEventListener('input', draw));
  draw();
})();
