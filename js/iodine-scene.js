/*
 * Cartoon scenes for the iodine explainer, built with js/scene-kit.js.
 * Generic figures, not real people. Scripted motion only runs while on screen;
 * reduced-motion shows the end state.
 */
(function () {
  const K = window.SceneKit; if (!K) return;
  const { el, txt, person, bubble, room, hair, SKINS } = K;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function whileVisible(svg, fn) {
    let raf = 0, on = false, t0 = 0;
    const loop = (t) => { if (!on) return; fn((t - t0) / 1000); raf = requestAnimationFrame(loop); };
    new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting && !on) { on = true; t0 = performance.now(); raf = requestAnimationFrame(loop); }
      if (!e.isIntersecting) { on = false; cancelAnimationFrame(raf); }
    })).observe(svg.closest('.scene'));
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const small = (svg, x, F, k) => el('g', { transform: `translate(${x} ${F}) scale(${k}) translate(${-x} ${-F})` }, svg);
  const ease = (p) => p * p * (3 - 2 * p);

  /* vessel tree used on the scan monitor and in the highlighter analogy */
  const TREE = 'M0 30 C20 28 30 10 52 6 M30 22 C42 30 54 34 78 28 M52 6 C62 0 72 4 84 0 M52 6 C58 14 66 18 74 16 M78 28 C84 34 90 36 96 34';

  /* ---------- story scene: a CT room, where most iodine ends up ---------- */
  (function () {
    const s = document.getElementById('iodineSceneSvg'); if (!s) return;
    const F = room(s, { wall: '#e4eaec', lower: '#d3dde0', floorFill: '#9fb0b5' });
    // wall board
    el('rect', { x: 250, y: 18, width: 310, height: 104, rx: 8, fill: '#0b0d12', stroke: '#3a4152', 'stroke-width': 4 }, s);
    txt(s, 266, 44, 'WHERE WORLD IODINE GOES (2024, SQM EST.)', { 'font-size': 11, 'font-weight': 700, fill: '#e0b65a', 'letter-spacing': 1 });
    txt(s, 266, 78, '37%', { 'font-size': 26, 'font-weight': 800, fill: '#4d8bff' });
    txt(s, 336, 78, 'X-ray contrast dye', { 'font-size': 15, 'font-weight': 700, fill: '#fff' });
    txt(s, 266, 108, '13%', { 'font-size': 26, 'font-weight': 800, fill: '#2f9a8a' });
    txt(s, 336, 108, 'LCD and LED screens', { 'font-size': 15, 'font-weight': 700, fill: '#fff' });
    // scanner: a doughnut with a bed through it
    el('ellipse', { cx: 220, cy: 292, rx: 74, ry: 112, fill: '#f4f6f7', stroke: '#8b99a0', 'stroke-width': 5 }, s);
    el('ellipse', { cx: 220, cy: 292, rx: 40, ry: 64, fill: '#27313a' }, s);
    el('rect', { x: 150, y: 190, width: 140, height: 10, rx: 4, fill: '#c2412d' }, s);
    el('rect', { x: 60, y: 336, width: 300, height: 12, rx: 4, fill: '#6d7c85' }, s);
    el('rect', { x: 150, y: 348, width: 12, height: F - 348, fill: '#56646c' }, s);
    el('rect', { x: 262, y: 348, width: 12, height: F - 348, fill: '#56646c' }, s);
    // generic patient lying on the bed (blanket, head)
    el('rect', { x: 100, y: 312, width: 230, height: 26, rx: 12, fill: '#7aa5c4' }, s);
    el('circle', { cx: 92, cy: 318, r: 19, fill: SKINS[2] }, s);
    el('path', { d: 'M74 316 Q76 296 92 298 Q106 298 108 310 Q96 306 74 316 Z', fill: '#2a2018' }, s);
    // IV drip stand and bag
    el('rect', { x: 40, y: 200, width: 5, height: F - 200, fill: '#56646c' }, s);
    el('rect', { x: 26, y: 200, width: 34, height: 4, fill: '#56646c' }, s);
    el('rect', { x: 28, y: 204, width: 30, height: 44, rx: 8, fill: '#e0b65a', opacity: .85, stroke: '#8a6d3b', 'stroke-width': 2 }, s);
    txt(s, 43, 232, 'I', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: '#5a3a14' });
    // control desk and monitor
    el('rect', { x: 384, y: 346, width: 190, height: 12, fill: '#5a4632' }, s);
    el('rect', { x: 394, y: 358, width: 8, height: F - 358, fill: '#3e3022' }, s);
    el('rect', { x: 556, y: 358, width: 8, height: F - 358, fill: '#3e3022' }, s);
    el('rect', { x: 410, y: 248, width: 128, height: 92, rx: 5, fill: '#14181d', stroke: '#3a4152', 'stroke-width': 4 }, s);
    el('rect', { x: 466, y: 340, width: 16, height: 6, fill: '#3a4152' }, s);
    const mon = el('g', { transform: 'translate(424 264)' }, s);
    el('circle', { cx: 48, cy: 32, r: 34, fill: '#2b323a' }, mon);
    el('path', { d: TREE, stroke: '#5a626b', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, mon);
    const glow = el('path', { d: TREE, stroke: '#e0b65a', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', pathLength: 100, 'stroke-dasharray': '0 100' }, mon);
    txt(s, 474, 330, 'vessels light up', { 'text-anchor': 'middle', 'font-size': 10, fill: '#8d8a84' });
    // radiographer
    person(s, 650, { floor: F, sh: 270, top: '#2f7d9a', pants: '#27313a', hair: hair.bun, hairColor: '#2a2018', skin: SKINS[3], arms: 'wave', delay: .2, smile: 2, talk: true });
    bubble(s, 640, 200, 'Iodine in the dye shows the vessels.', { left: true, w: 230, size: 13, delay: .5 });
    function draw(t) {
      const p = (t % 3.2) / 3.2;
      glow.setAttribute('stroke-dasharray', `${(ease(clamp(p * 1.3, 0, 1)) * 100).toFixed(1)} 100`);
    }
    if (reduced) { glow.setAttribute('stroke-dasharray', '100 100'); return; }
    draw(0);
    whileVisible(s, draw);
  })();

  /* ---------- analogy: a highlighter for X-rays ---------- */
  (function () {
    const s = document.getElementById('hlSvg'); if (!s) return;
    el('rect', { x: 0, y: 0, width: 800, height: 360, fill: '#efe9dc' }, s);
    el('rect', { x: 0, y: 300, width: 800, height: 60, fill: '#c8bfa9' }, s);
    el('line', { x1: 400, y1: 14, x2: 400, y2: 346, stroke: '#b3a98f', 'stroke-width': 2, 'stroke-dasharray': '6 6' }, s);
    txt(s, 200, 30, 'An X-ray without iodine dye', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: '#111' });
    txt(s, 600, 30, 'With iodine dye', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: '#111' });
    const page = (x) => {
      el('rect', { x, y: 62, width: 220, height: 190, rx: 4, fill: '#fbfaf6', stroke: '#8a7f66', 'stroke-width': 2 }, s);
      for (let i = 0; i < 7; i++) el('rect', { x: x + 16, y: 78 + i * 24, width: 188 - (i % 3) * 30, height: 10, rx: 3, fill: '#c9c6bd' }, s);
    };
    page(90); page(490);
    // the "vessel" line on each page
    const vL = el('path', { d: 'M104 160 C130 140 150 190 176 166 S230 150 296 176', stroke: '#c9c6bd', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' }, s);
    el('path', { d: 'M504 160 C530 140 550 190 576 166 S630 150 696 176', stroke: '#c9c6bd', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' }, s);
    const hl = el('path', { d: 'M504 160 C530 140 550 190 576 166 S630 150 696 176', stroke: '#f0b400', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round', pathLength: 100, 'stroke-dasharray': '0 100' }, s);
    const F = 300, k = .62;
    person(small(s, 52, F, k), 52, { floor: F, sh: 172, top: '#2b3f73', pants: '#1a1c22', hair: hair.short, hairColor: '#2a2018', skin: SKINS[1], arms: 'side', smile: -2, delay: 0 });
    person(small(s, 748, F, k), 748, { floor: F, sh: 172, top: '#3d6b52', pants: '#1a1c22', hair: hair.long, hairColor: '#2a2018', skin: SKINS[3], arms: 'side', smile: 3, delay: .3 });
    const q = txt(s, 200, 282, '', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#c2412d' });
    const c2 = txt(s, 600, 282, '', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#2f7d4f' });
    const pen = el('rect', { x: -4, y: -14, width: 8, height: 28, rx: 3, fill: '#f0b400', stroke: '#8a6d3b', 'stroke-width': 2 }, s);
    const qm = txt(s, 200, 130, '?', { 'text-anchor': 'middle', 'font-size': 44, 'font-weight': 800, fill: '#c2412d', opacity: 0 });
    function draw(t) {
      const p = ease(clamp((t - 1) / 3, 0, 1));
      hl.setAttribute('stroke-dasharray', `${(p * 100).toFixed(1)} 100`);
      const L = hl.getTotalLength ? hl.getTotalLength() : 200;
      let pt = { x: 504, y: 160 }; try { pt = hl.getPointAtLength(L * p); } catch (e) {}
      pen.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${(pt.y - 10).toFixed(1)}) rotate(35)`);
      pen.setAttribute('opacity', p > 0 && p < 1 ? 1 : 0);
      q.textContent = t > 2 ? 'Every tissue looks alike.' : '';
      qm.setAttribute('opacity', t > 2 ? 1 : 0);
      c2.textContent = p >= 1 ? 'The vessels stand out.' : '';
    }
    if (reduced) { draw(5); pen.setAttribute('opacity', 0); return; }
    draw(0);
    whileVisible(s, (t) => draw(t % 7));
  })();

  /* ---------- analogy: one slow tap, a growing queue ---------- */
  (function () {
    const s = document.getElementById('tapSvg'); if (!s) return;
    el('rect', { x: 0, y: 0, width: 800, height: 360, fill: '#e8eef3' }, s);
    el('rect', { x: 0, y: 300, width: 800, height: 60, fill: '#b8b1a2' }, s);
    txt(s, 220, 30, 'Demand: more cups every year', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: '#111' });
    txt(s, 610, 30, 'Supply: one tap, built plant by plant', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: '#111' });
    // tap, barrel
    el('rect', { x: 560, y: 70, width: 100, height: 12, rx: 3, fill: '#6d7c85' }, s);
    el('rect', { x: 650, y: 70, width: 12, height: 38, rx: 3, fill: '#6d7c85' }, s);
    el('rect', { x: 612, y: 210, width: 88, height: 90, rx: 8, fill: '#9fb0b5', stroke: '#56646c', 'stroke-width': 3 }, s);
    const drop = el('ellipse', { cx: 656, cy: 118, rx: 4, ry: 6, fill: '#4d8bff' }, s);
    const level = el('rect', { x: 616, y: 280, width: 80, height: 16, fill: '#4d8bff', opacity: .8 }, s);
    // price sign
    el('rect', { x: 716, y: 150, width: 74, height: 56, rx: 6, fill: '#fff', stroke: '#111', 'stroke-width': 2 }, s);
    txt(s, 753, 172, 'PRICE', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#111' });
    const arrow = el('path', { d: 'M753 200 L753 184 M745 192 L753 182 L761 192', stroke: '#c2412d', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, s);
    const F = 300, k = .5, N = 8;
    const cs = [SKINS[0], SKINS[1], SKINS[2], SKINS[3], SKINS[4]], tops = ['#2b3f73', '#3d6b52', '#8a4a3a', '#6b4f8a', '#2f7d9a'];
    const queue = [];
    for (let i = 0; i < N; i++) {
      const x = 400 - i * 46;
      const g = el('g', {}, s);
      person(small(g, x, F, k), x, { floor: F, sh: 172, top: tops[i % 5], pants: '#1a1c22', hair: [hair.short, hair.bun, hair.long][i % 3], hairColor: '#2a2018', skin: cs[i % 5], arms: 'side', smile: i > 4 ? -2 : 2, delay: i * .15 });
      el('rect', { x: x - 5, y: 232, width: 10, height: 12, rx: 2, fill: '#fff', stroke: '#111', 'stroke-width': 1.5, opacity: .9 }, g);
      queue.push(g);
    }
    const cap = txt(s, 220, 334, '', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#c2412d' });
    function draw(t) {
      const n = reduced ? N : Math.min(N, 2 + Math.floor(t / .8));
      queue.forEach((g, i) => g.setAttribute('opacity', i < n ? 1 : 0));
      const d = (t % 1.2) / 1.2;
      drop.setAttribute('cy', (118 + d * 150).toFixed(1));
      drop.setAttribute('opacity', d < .9 ? 1 : 0);
      level.setAttribute('height', 14);
      arrow.setAttribute('transform', `translate(0 ${(-Math.min(1, n / N) * 6).toFixed(1)})`);
      cap.textContent = n >= N ? 'Same tap, longer queue.' : '';
    }
    if (reduced) { draw(0); return; }
    draw(0);
    whileVisible(s, (t) => draw(t % 9));
  })();
})();
