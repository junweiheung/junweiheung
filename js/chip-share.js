/* Segment market-share switcher for the AMD/Intel/Nvidia explainer.
   Tabs swap a set of share bars (one row per sub-market). Plain DOM, no d3. */
(function () {
  const COL = { amd: "#c2412d", intel: "#2463d6", nvidia: "#5f9e6e", other: "#a9a59c" };
  const tabsEl = document.getElementById("segTabs");
  const chartEl = document.getElementById("segChart");
  const noteEl = document.getElementById("segNote");
  if (!tabsEl || !chartEl) return;

  // each segment: rows of sub-markets; each row has stacked shares that sum to ~100
  const SEG = {
    dc: {
      note: "The data centre is two races. AMD's EPYC leads cloud servers by units; Nvidia owns AI accelerator revenue.",
      rows: [
        { label: "Server CPUs (x86 units)", parts: [["amd", 35.5], ["intel", 64.5]] },
        { label: "Cloud / enterprise 2P servers", parts: [["amd", 46.8], ["intel", 53.2]] },
        { label: "AI accelerators (revenue)", parts: [["nvidia", 78], ["other", 15], ["amd", 7]] },
      ],
    },
    client: {
      note: "In the PCs people buy, Intel still ships the most, though AMD is at record highs.",
      rows: [
        { label: "Desktop CPUs (x86 units)", parts: [["amd", 29.9], ["intel", 70.1]] },
        { label: "Laptop CPUs (x86 units)", parts: [["amd", 29.2], ["intel", 70.8]] },
        { label: "All x86 (client + server)", parts: [["amd", 30.1], ["intel", 69.9]] },
      ],
    },
    gaming: {
      note: "How you count decides who leads: Nvidia owns discrete cards; Intel leads integrated graphics; AMD owns consoles.",
      rows: [
        { label: "Discrete desktop GPUs", parts: [["nvidia", 90], ["amd", 8], ["intel", 2]] },
        { label: "Integrated graphics (all PC GPUs)", parts: [["intel", 56], ["nvidia", 23], ["amd", 21]] },
        { label: "Current-gen consoles", parts: [["amd", 100]] },
      ],
    },
    embedded: {
      note: "The quietest segment is the most lopsided: after buying Xilinx, AMD owns most of the FPGA market.",
      rows: [
        { label: "FPGAs / adaptive computing (revenue)", parts: [["amd", 72], ["other", 28]] },
      ],
    },
  };
  const NAME = { amd: "AMD", intel: "Intel", nvidia: "Nvidia", other: "Others" };

  function render(seg) {
    const cfg = SEG[seg];
    chartEl.innerHTML = cfg.rows.map((row) => {
      const segs = row.parts.map(([who, v]) =>
        `<span class="bseg" style="--w:${v}%;background:${COL[who]}" title="${NAME[who]} ${v}%">${v >= 12 ? `<b>${NAME[who]}</b><em>${v}%</em>` : ""}</span>`).join("");
      // tiny slices get a label below the bar instead of inside
      const small = row.parts.filter(([, v]) => v < 12)
        .map(([who, v]) => `<span class="sm"><i style="background:${COL[who]}"></i>${NAME[who]} ${v}%</span>`).join("");
      return `<div class="brow">
        <div class="blabel">${row.label}</div>
        <div class="btrack">${segs}</div>
        ${small ? `<div class="bsmall">${small}</div>` : ""}
      </div>`;
    }).join("");
    if (noteEl) noteEl.textContent = cfg.note;
    // trigger the width animation
    requestAnimationFrame(() => chartEl.classList.add("in"));
  }

  tabsEl.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    tabsEl.querySelectorAll("button").forEach((x) => x.setAttribute("aria-selected", x === b));
    chartEl.classList.remove("in");
    render(b.dataset.seg);
  });

  render("dc");
})();

/* ---------------- timelapse: reported share points, played in order ----------------
   Every point is a reported figure (mostly Q4 of each year). Nothing is interpolated.
   Each row: [label, A%, why, source, B-split?]. For stacked races, B-split lists the
   non-leader shares in the order of `stack`. */
(function () {
  const svg = document.getElementById("lapseSvg");
  if (!svg) return;
  const NS = "http://www.w3.org/2000/svg";
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const AMD = "#c2412d", INTEL = "#2463d6", NV = "#5f9e6e", GREY = "#a9a59c";
  const MR = "Mercury Research";

  const SERIES = {
    server: {
      a: "AMD", b: "Intel", aCol: AMD, bCol: INTEL, unit: "AMD vs Intel, share of x86 server CPUs shipped",
      data: [["Q1 2005", 7.4, "Opteron is two years old and has won 7.4% of x86 server chips, a first real dent in Intel.", "Mercury Research via InfoWorld and eWeek"], ["Q1 2006", 22.1, "", "Mercury Research via InfoWorld and eWeek"], ["Q2 2006", 25.9, "The Opteron peak: AMD's 64-bit server chips win more than a quarter of the market.", "Mercury Research via InfoWorld and eWeek"], ["Q4 2017", 0.8, "A decade later, after the weak Bulldozer design and years of losses, AMD is almost gone from servers. The first EPYC chips have only just launched; no breakdown was published for the years in between.", "Mercury Research via Tom's Hardware"], ["Q2 2018", 1.4, "", "Mercury Research via Tom's Hardware"], ["Q3 2018", 1.6, "", "Mercury Research via Tom's Hardware"], ["Q4 2018", 3.2, "EPYC starts winning: share doubles in a quarter, from a tiny base.", "Mercury Research via Tom's Hardware"], ["Q1 2019", 2.9, "", "Mercury Research via Tom's Hardware"], ["Q2 2019", 3.4, "", "Mercury Research via Tom's Hardware"], ["Q3 2019", 4.3, "Zen 2 EPYC (Rome) launches with up to 64 cores.", "Mercury Research via Tom's Hardware"], ["Q4 2019", 4.5, "", "Mercury Research via Tom's Hardware"], ["Q1 2020", 5.1, "", "Mercury Research via Tom's Hardware"], ["Q2 2020", 5.8, "", "Mercury Research via Tom's Hardware"], ["Q3 2020", 6.6, "", "Mercury Research via Tom's Hardware"], ["Q4 2020", 7.1, "", "Mercury Research via Tom's Hardware"], ["Q1 2021", 8.9, "", "Mercury Research via Tom's Hardware"], ["Q2 2021", 9.5, "", "Mercury Research via Tom's Hardware"], ["Q3 2021", 10.2, "", "Mercury Research via Tom's Hardware"], ["Q4 2021", 10.7, "Back above 10% as Milan (Zen 3) ships.", "Mercury Research via Tom's Hardware"], ["Q1 2022", 11.6, "", "Mercury Research via Tom's Hardware"], ["Q2 2022", 13.9, "", "Mercury Research via Tom's Hardware"], ["Q3 2022", 17.5, "A jump as Genoa (Zen 4) nears and Intel's Sapphire Rapids slips again.", "Mercury Research via Tom's Hardware"], ["Q4 2022", 17.6, "", "Mercury Research via Tom's Hardware"], ["Q1 2023", 18.0, "", "Mercury Research via Tom's Hardware"], ["Q2 2023", 18.6, "", "Mercury Research via Tom's Hardware"], ["Q3 2023", 23.3, "Another step up as cloud providers standardise on EPYC.", "Mercury Research via Tom's Hardware"], ["Q4 2023", 23.1, "", "Mercury Research via Tom's Hardware"], ["Q1 2024", 23.6, "", "Mercury Research via Tom's Hardware"], ["Q2 2024", 24.1, "", "Mercury Research via Tom's Hardware"], ["Q3 2024", 24.2, "", "Mercury Research via Tom's Hardware"], ["Q4 2024", 25.1, "Back to a quarter of the market, matching the 2006 peak.", "Mercury Research via Tom's Hardware"], ["Q1 2025", 27.2, "", "Mercury Research via Tom's Hardware"], ["Q2 2025", 27.3, "", "Mercury Research via Tom's Hardware"], ["Q3 2025", 27.8, "", "Mercury Research via Tom's Hardware"], ["Q4 2025", 28.8, "", "Mercury Research via Tom's Hardware"], ["Q1 2026", 33.2, "A four-point jump in one quarter; by revenue AMD now earns about 46% of server-chip sales.", "Mercury Research via Tom's Hardware"], ["Q2 2026", 34.5, "", "Mercury Research via TechRadar"], ["Q3 2026", 35.5, "A record: more than a third of x86 server chips shipped.", "Mercury Research via HotHardware and Hardware Busters"]],
    },
    desktop: {
      a: "AMD", b: "Intel", aCol: AMD, bCol: INTEL, unit: "AMD vs Intel, share of x86 desktop CPUs shipped",
      data: [["Q3 2016", 9.1, "Before Ryzen: AMD is under 10% of desktop chips.", "Mercury Research via Tom's Hardware"], ["Q4 2016", 9.9, "", "Mercury Research via Tom's Hardware"], ["Q1 2017", 11.4, "First-generation Ryzen launches in March.", "Mercury Research via Tom's Hardware"], ["Q2 2017", 11.1, "", "Mercury Research via Tom's Hardware"], ["Q3 2017", 10.9, "", "Mercury Research via Tom's Hardware"], ["Q4 2017", 12.0, "", "Mercury Research via Tom's Hardware"], ["Q1 2018", 12.2, "", "Mercury Research via Tom's Hardware"], ["Q2 2018", 12.3, "", "Mercury Research via Tom's Hardware"], ["Q3 2018", 13.0, "", "Mercury Research via Tom's Hardware"], ["Q4 2018", 15.8, "Ryzen 2000 wins enthusiasts on price and core count.", "Mercury Research via Tom's Hardware"], ["Q1 2019", 17.1, "", "Mercury Research via Tom's Hardware"], ["Q2 2019", 17.1, "", "Mercury Research via Tom's Hardware"], ["Q3 2019", 18.0, "", "Mercury Research via Tom's Hardware"], ["Q4 2019", 18.3, "", "Mercury Research via Tom's Hardware"], ["Q1 2020", 18.6, "", "Mercury Research via Tom's Hardware"], ["Q2 2020", 19.2, "", "Mercury Research via Tom's Hardware"], ["Q3 2020", 20.1, "Ryzen 5000 is about to top gaming benchmarks.", "Mercury Research via Tom's Hardware"], ["Q4 2020", 19.3, "", "Mercury Research via Tom's Hardware"], ["Q1 2021", 19.3, "", "Mercury Research via Tom's Hardware"], ["Q2 2021", 17.1, "Shortages: AMD sends scarce chips to servers and laptops, and Intel's Alder Lake hits back.", "Mercury Research via Tom's Hardware"], ["Q3 2021", 17.0, "", "Mercury Research via Tom's Hardware"], ["Q4 2021", 16.2, "", "Mercury Research via Tom's Hardware"], ["Q1 2022", 18.3, "", "Mercury Research via Tom's Hardware"], ["Q2 2022", 20.5, "", "Mercury Research via Tom's Hardware"], ["Q3 2022", 13.9, "A sharp one-quarter drop as PC makers clear unsold stock.", "Mercury Research via Tom's Hardware"], ["Q4 2022", 18.6, "", "Mercury Research via Tom's Hardware"], ["Q1 2023", 19.2, "", "Mercury Research via Tom's Hardware"], ["Q2 2023", 19.4, "", "Mercury Research via Tom's Hardware"], ["Q3 2023", 19.2, "", "Mercury Research via Tom's Hardware"], ["Q4 2023", 19.8, "", "Mercury Research via Tom's Hardware"], ["Q1 2024", 23.9, "", "Mercury Research via Tom's Hardware"], ["Q2 2024", 23.0, "", "Mercury Research via Tom's Hardware"], ["Q3 2024", 28.7, "A jump as Intel's 13th- and 14th-gen chips suffer stability problems.", "Mercury Research via Tom's Hardware"], ["Q4 2024", 27.1, "", "Mercury Research via Tom's Hardware"], ["Q1 2025", 28.0, "", "Mercury Research via Tom's Hardware"], ["Q2 2025", 32.2, "", "Mercury Research via Tom's Hardware"], ["Q3 2025", 33.6, "", "Mercury Research via Tom's Hardware"], ["Q4 2025", 36.4, "AMD's best desktop quarter ever: more than a third of chips shipped.", "Mercury Research via Tom's Hardware"], ["Q1 2026", 33.2, "", "Mercury Research via Tom's Hardware"], ["Q2 2026", 34.9, "", "Mercury Research via TechRadar"], ["Q3 2026", 29.9, "A five-point fall in one quarter as Intel floods the desktop channel and gaming-PC builds stall.", "Mercury Research via HotHardware and Hardware Busters"]],
    },
    laptop: {
      a: "AMD", b: "Intel", aCol: AMD, bCol: INTEL, unit: "AMD vs Intel, share of x86 laptop CPUs shipped",
      data: [["Q4 2017", 6.9, "Intel owns laptop designs; AMD barely features.", "Mercury Research via Tom's Hardware"], ["Q2 2018", 8.8, "", "Mercury Research via Tom's Hardware"], ["Q3 2018", 10.9, "", "Mercury Research via Tom's Hardware"], ["Q4 2018", 12.2, "", "Mercury Research via Tom's Hardware"], ["Q1 2019", 13.1, "", "Mercury Research via Tom's Hardware"], ["Q2 2019", 14.1, "", "Mercury Research via Tom's Hardware"], ["Q3 2019", 14.7, "", "Mercury Research via Tom's Hardware"], ["Q4 2019", 16.2, "", "Mercury Research via Tom's Hardware"], ["Q1 2020", 17.1, "", "Mercury Research via Tom's Hardware"], ["Q2 2020", 19.9, "The lockdown laptop boom; Ryzen 4000 wins on battery life and cores.", "Mercury Research via Tom's Hardware"], ["Q3 2020", 20.2, "", "Mercury Research via Tom's Hardware"], ["Q4 2020", 19.0, "", "Mercury Research via Tom's Hardware"], ["Q1 2021", 18.0, "", "Mercury Research via Tom's Hardware"], ["Q2 2021", 20.0, "", "Mercury Research via Tom's Hardware"], ["Q3 2021", 22.0, "", "Mercury Research via Tom's Hardware"], ["Q4 2021", 21.6, "", "Mercury Research via Tom's Hardware"], ["Q1 2022", 22.5, "", "Mercury Research via Tom's Hardware"], ["Q2 2022", 24.8, "A record for the time, just before the PC slump.", "Mercury Research via Tom's Hardware"], ["Q3 2022", 15.7, "Down nine points in one quarter as laptop makers clear stock and Intel pushes volume.", "Mercury Research via Tom's Hardware"], ["Q4 2022", 16.4, "", "Mercury Research via Tom's Hardware"], ["Q1 2023", 16.2, "", "Mercury Research via Tom's Hardware"], ["Q2 2023", 16.5, "", "Mercury Research via Tom's Hardware"], ["Q3 2023", 19.5, "", "Mercury Research via Tom's Hardware"], ["Q4 2023", 20.3, "", "Mercury Research via Tom's Hardware"], ["Q1 2024", 19.3, "", "Mercury Research via Tom's Hardware"], ["Q2 2024", 20.3, "", "Mercury Research via Tom's Hardware"], ["Q3 2024", 22.3, "", "Mercury Research via Tom's Hardware"], ["Q4 2024", 23.7, "", "Mercury Research via Tom's Hardware"], ["Q1 2025", 22.5, "", "Mercury Research via Tom's Hardware"], ["Q2 2025", 20.6, "", "Mercury Research via Tom's Hardware"], ["Q3 2025", 21.9, "", "Mercury Research via Tom's Hardware"], ["Q4 2025", 26.0, "A record, as Intel's supply of entry-level chips tightens.", "Mercury Research via Tom's Hardware"], ["Q1 2026", 28.3, "", "Mercury Research via Tom's Hardware"], ["Q2 2026", 28.9, "", "Mercury Research via TechRadar"], ["Q3 2026", 29.2, "Another record. Apple's own chips aren't x86, so they're not counted here.", "Mercury Research via HotHardware and Hardware Busters"]],
    },
    gpu: {
      a: "Nvidia", b: "AMD and Intel", aCol: NV, bCol: AMD, unit: "Nvidia vs AMD vs Intel, share of discrete desktop graphics cards shipped",
      stack: [{ label: "AMD", col: AMD }, { label: "Intel", col: INTEL }],
      data: [["Q4 2017", 66.3, "Crypto miners buy AMD cards in bulk, holding AMD at a third.", "Jon Peddie Research via Digital Trends", [33.7, 0]], ["Q3 2018", 74.3, "", "Jon Peddie Research via PCGamesN", [25.7, 0]], ["Q4 2018", 81.2, "The mining bust hits AMD hardest; Nvidia launches its RTX 20 series.", "Jon Peddie Research via TechRadar", [18.8, 0]], ["Q2 2019", 67.9, "AMD's Radeon RX 5700 is about to launch.", "Jon Peddie Research via PCGamesN", [32.1, 0]], ["Q3 2019", 72.9, "", "Jon Peddie Research via PCGamesN", [27.1, 0]], ["Q4 2019", 68.9, "", "Jon Peddie Research via Wccftech", [31.1, 0]], ["Q1 2020", 69.2, "", "Jon Peddie Research", [30.8, 0]], ["Q2 2020", 78, "", "Jon Peddie Research via PC Gamer", [22, 0]], ["Q3 2020", 77, "Nvidia's RTX 30 cards launch and sell out.", "Jon Peddie Research via Wccftech", [23, 0]], ["Q4 2020", 83, "AMD falls to an all-time low at the time.", "Jon Peddie Research via Tom's Hardware", [17, 0]], ["Q3 2021", 78.2, "Shortage era: AMD's Radeon 6000 cards claw back share. (AMD's figure is the remainder.)", "Jon Peddie Research", [21.8, 0]], ["Q4 2021", 77.2, "(AMD's figure is the remainder.)", "Jon Peddie Research", [22.8, 0]], ["Q1 2022", 75, "", "Jon Peddie Research via TechRadar", [24, 1]], ["Q2 2022", 79.6, "Intel's first Arc cards are under 1%.", "Jon Peddie Research via Tom's Hardware", [20, 0]], ["Q4 2022", 84, "Intel's Arc takes 5% in its first full quarter.", "Jon Peddie Research via Tom's Hardware", [11, 5]], ["Q1 2023", 84, "(Intel's figure is the remainder.)", "Jon Peddie Research via Tom's Hardware", [12, 4]], ["Q2 2023", 80.2, "", "Jon Peddie Research via Tom's Hardware", [17, 2]], ["Q3 2023", 82, "", "Jon Peddie Research via Tom's Hardware", [17, 1]], ["Q4 2023", 80, "AMD's Radeon 7000 series lifts it to 19%.", "Jon Peddie Research via Tom's Hardware", [19, 1]], ["Q1 2024", 88, "Intel's Arc share evaporates.", "Jon Peddie Research via Tom's Hardware", [12, 0]], ["Q2 2024", 88, "", "Jon Peddie Research via Tom's Hardware", [12, 0]], ["Q3 2024", 90, "", "Jon Peddie Research via Wccftech", [10, 0]], ["Q4 2024", 82, "AMD rebounds ahead of its RX 9000 launch.", "Jon Peddie Research via Tom's Hardware", [17, 1]], ["Q1 2025", 92, "Nvidia's RTX 50 series launches.", "Jon Peddie Research via Yahoo Finance", [8, 0]], ["Q2 2025", 94, "", "Jon Peddie Research via Tom's Hardware", [6, 0]], ["Q3 2025", 92, "", "Jon Peddie Research via TechSpot", [7, 1]], ["Q4 2025", 94, "AMD hits a historic low.", "Jon Peddie Research via PC Gamer", [5, 1]], ["Q1 2026", 90, "", "Jon Peddie Research via Igor's Lab", [8, 1]], ["Q2 2026", 90, "Shipments hit a four-year high as buyers rush to beat price rises.", "Jon Peddie Research via Tom's Hardware", [8, 2]]],
    },
    integrated: {
      a: "Intel", b: "Nvidia and AMD", aCol: INTEL, bCol: NV, unit: "Intel vs Nvidia vs AMD, share of all PC graphics chips shipped, counting the integrated graphics built into processors",
      stack: [{ label: "Nvidia", col: NV }, { label: "AMD", col: AMD }],
      data: [["Q4 2019", 63, "Count the graphics built into processors and Intel leads, simply because it sells the most PC chips.", "Jon Peddie Research via Tom's Hardware", [18, 19]], ["Q3 2020", 62, "", "Jon Peddie Research via Wccftech", [19, 19]], ["Q4 2020", 69, "The lockdown laptop boom: almost every cheap laptop has Intel graphics inside.", "Jon Peddie Research via Tom's Hardware", [17, 15]], ["Q4 2021", 62, "Gaming cards and Ryzen laptops pull AMD and Nvidia level at 19% each.", "Jon Peddie Research via Tom's Hardware", [19, 19]], ["Q3 2022", 72, "The PC slump hits gaming cards hardest; Intel's built-in graphics hold up best.", "Jon Peddie Research via Notebookcheck", [16, 12]], ["Q4 2022", 71, "", "Jon Peddie Research via Tom's Hardware", [17, 12]], ["Q2 2025", 67, "Intel still leads overall, though it has slipped from 76% a year earlier; Nvidia is about a quarter of all PC GPUs as RTX 50 cards ship.", "Jon Peddie Research via PCWorld", [24, 9]], ["Q3 2025", 61, "Intel keeps the overall lead on built-in graphics; Nvidia holds 24% and AMD edges up to 15%.", "Jon Peddie Research via pcpartsgeek", [24, 15]], ["Q2 2026", 56, "Intel's lowest share in this series. AMD reaches 21%, mostly from Ryzen processors with Radeon graphics built in.", "Jon Peddie Research", [23, 21]]],
    },
    ai: {
      a: "Nvidia", b: "Everyone else", aCol: NV, bCol: GREY, unit: "Nvidia's share of data-centre AI chips (rough, mixed measures)",
      stack: [{ label: "Custom chips", col: GREY }, { label: "AMD", col: AMD }],
      data: [
        ["2020", 80.6, "Before ChatGPT, AI chips are a $4 billion market and Nvidia already has four-fifths of the revenue.", "Omdia via TechRadar", [19.4, 0]],
        ["2024", 80, "The AI boom multiplies the market; analysts still put Nvidia near 80%.", "Analyst estimates via Motley Fool", [20, 0]],
        ["2026", 78, "Custom chips such as Google's TPU (about 12–15%) and AMD's Instinct (about 5–7%) take a growing slice. Nvidia still has three-quarters.", "Industry estimates via CNBC", [15, 7]],
      ],
    },
    console: {
      a: "AMD / ATI", b: "Others", aCol: AMD, bCol: GREY, unit: "Who supplies the graphics in Sony and Microsoft's two home consoles (half each)",
      stack: [{ label: "Nvidia", col: NV }, { label: "Sony / other", col: GREY }],
      data: [
        ["2001", 0, "Neither console uses ATI yet. Microsoft's first Xbox pairs an Intel CPU with an Nvidia GPU; Sony's PS2 runs its own \"Graphics Synthesizer.\" So Nvidia has half, Sony half, and ATI (which AMD buys in 2006) none.", "Company specifications", [50, 50]],
        ["2006", 50, "The lead splits evenly. Microsoft's Xbox 360 uses an ATI GPU; Sony's PS3 uses an Nvidia one (the RSX). ATI 50%, Nvidia 50%.", "Company specifications", [50, 0]],
        ["2013", 100, "AMD, which now owns ATI, wins both: the PS4 and Xbox One each use a single AMD chip combining CPU and graphics. Nvidia is out of home consoles.", "Company announcements", [0, 0]],
        ["2020", 100, "The PS5 and Xbox Series X/S use AMD again. Only Nintendo's Switch, with an Nvidia Tegra chip, sits outside the home-console pair.", "Company announcements", [0, 0]],
        ["2026", 100, "Unchanged. AMD also powers most PC handhelds such as the Steam Deck, ROG Ally and Legion Go.", "Company announcements", [0, 0]],
      ],
    },
  };

  const yearEl = document.getElementById("lapseYear");
  const countEl = document.getElementById("lapseCount");
  const whyEl = document.getElementById("lapseWhy");
  const srcEl = document.getElementById("lapseSrc");
  const scrub = document.getElementById("lapseScrub");
  const playBtn = document.getElementById("lapsePlay");
  const subEl = svg.closest(".fig").querySelector(".fs");
  const segBtns = [...document.querySelectorAll(".lapse-seg button")];

  const fmt = (v) => (v % 1 ? v.toFixed(1) : v) + "%";
  const txt = (p, x, y, str, a = {}) => { const t = el("text", Object.assign({ x, y, "font-family": "Inter", "font-size": 12.5, "font-weight": 700 }, a), p); t.textContent = str; return t; };
  // place points by date, not by index, so long gaps (2006 to 2017) look long
  const when = (lab) => { const m = lab.match(/(?:Q(\d) )?(\d{4})/); return +m[2] + (m[1] ? (+m[1] - 0.5) / 4 : 0.5); };

  let cur = "server", timer = 0, playing = false;
  let W = 680, H = 300, L = 44, R = 600, T = 18, B = 250, xs, ys, lines = [], clip, marker;

  // the companies in a race, each with its share at every point
  function players(s) {
    const list = [{ name: s.a, col: s.aCol, vals: s.data.map((d) => d[1]) }];
    if (s.stack) s.stack.forEach((p, k) => list.push({ name: p.label, col: p.col, vals: s.data.map((d) => (d[4] || [])[k] || 0) }));
    else list.push({ name: s.b, col: s.bCol, vals: s.data.map((d) => +(100 - d[1]).toFixed(1)) });
    return list;
  }

  function build() {
    const s = SERIES[cur];
    // size the drawing to the figure's real width so text stays readable on phones
    W = Math.round(Math.max(340, Math.min(680, svg.getBoundingClientRect().width || 680)));
    const narrow = W < 520;
    H = narrow ? 260 : 300; L = 40; R = W - (narrow ? 96 : 120); T = 16; B = H - 40;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.innerHTML = "";
    scrub.max = s.data.length - 1; scrub.value = 0;
    const t0 = when(s.data[0][0]), t1 = when(s.data[s.data.length - 1][0]);
    xs = (i) => t1 === t0 ? (L + R) / 2 : L + (when(s.data[i][0]) - t0) / (t1 - t0) * (R - L);
    ys = (v) => B - v / 100 * (B - T);

    // grid and axes
    [0, 25, 50, 75, 100].forEach((v) => {
      el("line", { x1: L, x2: R, y1: ys(v), y2: ys(v), stroke: v ? "#ece8df" : "#cfcabe" }, svg);
      txt(svg, L - 6, ys(v) + 4, v + "%", { "text-anchor": "end", "font-size": 10.5, "font-weight": 500, fill: "#8a8578" });
    });
    // one tick per year; label as many years as fit
    const xt = (t) => t1 === t0 ? (L + R) / 2 : L + (t - t0) / (t1 - t0) * (R - L);
    const y0 = Math.ceil(t0 - 0.5), y1 = Math.floor(t1);
    const span = y1 - y0 + 1, every = Math.max(1, Math.ceil(span / ((R - L) / (narrow ? 34 : 40))));
    for (let y = y0; y <= y1; y++) {
      const x = xt(y + 0.5);
      if (x < L - 2 || x > R + 2) continue;
      el("line", { x1: x, x2: x, y1: B, y2: B + 4, stroke: "#cfcabe" }, svg);
      if ((y - y0) % every === 0) txt(svg, x, B + 18, y, { "text-anchor": "middle", "font-size": 10.5, "font-weight": 500, fill: "#8a8578" });
    }

    // lines are drawn in full but revealed up to the current point by a clip that grows
    const id = "lapseClip" + Math.random().toString(36).slice(2, 7);
    clip = el("rect", { x: 0, y: 0, width: 0, height: H }, el("clipPath", { id }, el("defs", {}, svg)));
    if (!reduced) clip.style.transition = "width .4s ease";
    marker = el("line", { y1: T, y2: B, stroke: "#111", "stroke-width": 1, "stroke-dasharray": "3 4", opacity: .35 }, svg);
    if (!reduced) marker.style.transition = "x1 .7s cubic-bezier(.2,.8,.2,1), x2 .7s cubic-bezier(.2,.8,.2,1)";
    const g = el("g", { "clip-path": `url(#${id})` }, svg);
    lines = players(s).map((p) => {
      // solid line between nearby points; a faint dashed one across long gaps with no data (e.g. 2006 to 2017)
      let run = [];
      const flush = () => { if (run.length > 1) el("polyline", { points: run.join(" "), fill: "none", stroke: p.col, "stroke-width": 3, "stroke-linejoin": "round", "stroke-linecap": "round" }, g); };
      p.vals.forEach((v, i) => {
        const pt = `${xs(i).toFixed(1)},${ys(v).toFixed(1)}`;
        if (i && when(s.data[i][0]) - when(s.data[i - 1][0]) > 2) {
          flush();
          el("line", { x1: xs(i - 1), y1: ys(p.vals[i - 1]), x2: xs(i), y2: ys(v), stroke: p.col, "stroke-width": 2, "stroke-dasharray": "4 5", opacity: .45 }, g);
          run = [];
        }
        run.push(pt);
      });
      flush();
      const r = s.data.length > 20 ? 2 : 3;
      p.vals.forEach((v, i) => el("circle", { cx: xs(i), cy: ys(v), r, fill: p.col }, g));
      const dot = el("circle", { r: 6, fill: "#fff", stroke: p.col, "stroke-width": 3 }, svg);
      const lab = txt(svg, 0, 0, "", { fill: p.col, "font-size": narrow ? 12 : 13 });
      if (!reduced) [dot, lab].forEach((n) => { n.style.transition = "cx .4s ease, cy .4s ease"; });
      return Object.assign(p, { dot, lab });
    });
    if (subEl) subEl.textContent = s.unit + ". Press play.";
    show(0);
  }

  function show(i) {
    const s = SERIES[cur];
    const [label, , why, src] = s.data[i];
    yearEl.textContent = label;
    if (countEl) countEl.textContent = `point ${i + 1} of ${s.data.length}`;
    const x = xs(i);
    clip.setAttribute("width", (x + 8).toFixed(1));
    marker.setAttribute("x1", x); marker.setAttribute("x2", x);
    // value labels sit to the right of each dot; nudge apart any that would overlap
    const tags = lines.map((p) => ({ p, v: p.vals[i], y: ys(p.vals[i]) })).sort((a, b) => a.y - b.y);
    for (let k = 1; k < tags.length; k++) if (tags[k].y - tags[k - 1].y < 15) tags[k].y = tags[k - 1].y + 15;
    tags.forEach(({ p, v, y }) => {
      p.dot.setAttribute("cx", x); p.dot.setAttribute("cy", ys(v));
      p.lab.textContent = p.name + " " + fmt(v);
      p.lab.setAttribute("x", (x + 11).toFixed(1)); p.lab.setAttribute("y", (y + 4).toFixed(1));
    });
    let note = why;
    if (!note && i > 0) {
      const d = +(s.data[i][1] - s.data[i - 1][1]).toFixed(1);
      note = d === 0 ? `${s.a} unchanged at ${fmt(s.data[i][1])}.` : `${s.a} ${d > 0 ? "up" : "down"} ${Math.abs(d)} points since ${s.data[i - 1][0]}, to ${fmt(s.data[i][1])}.`;
    }
    whyEl.textContent = note || "";
    if (srcEl) srcEl.textContent = "Source: " + src;
    scrub.value = i;
  }

  function play() {
    const s = SERIES[cur];
    let i = +scrub.value;
    if (i >= s.data.length - 1) { i = 0; show(0); }
    playing = true; playBtn.textContent = "❚❚ Pause"; playBtn.setAttribute("aria-label", "Pause");
    clearInterval(timer);
    // a whole race takes about 20 seconds however many points it has (between 0.45s and 1.6s a step)
    const step = reduced ? 600 : Math.max(450, Math.min(1600, 20000 / s.data.length));
    timer = setInterval(() => { i++; show(i); if (i >= s.data.length - 1) stop(); }, step);
  }
  function stop() { playing = false; clearInterval(timer); playBtn.textContent = "▶ Play"; playBtn.setAttribute("aria-label", "Play"); }

  playBtn.addEventListener("click", () => { playing ? stop() : play(); });
  scrub.addEventListener("input", () => { stop(); show(+scrub.value); });
  segBtns.forEach((b) => b.addEventListener("click", () => {
    segBtns.forEach((x) => x.setAttribute("aria-pressed", x === b));
    stop(); cur = b.dataset.l; build();
  }));
  // keyboard: left/right arrows step through points
  svg.closest(".fig").addEventListener("keydown", (e) => {
    if (e.target === scrub) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") { stop(); const n = SERIES[cur].data.length; show(Math.max(0, Math.min(n - 1, +scrub.value + (e.key === "ArrowRight" ? 1 : -1)))); }
  });
  // rebuild at the new size if the window is resized (keeps the current point)
  let rz = 0, lastW = 0;
  addEventListener("resize", () => {
    clearTimeout(rz);
    rz = setTimeout(() => {
      const w = Math.round(svg.getBoundingClientRect().width);
      if (Math.abs(w - lastW) < 20) return; lastW = w;
      const i = +scrub.value; stop(); build(); show(Math.min(i, SERIES[cur].data.length - 1));
    }, 200);
  });

  build();
  lastW = Math.round(svg.getBoundingClientRect().width);
})();
