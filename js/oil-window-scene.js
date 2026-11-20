/*
 * Cartoon scenes for the oil-window explainer, built with js/scene-kit.js.
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

  /* ---------- story scene: a trading desk in Singapore, 16:29 ---------- */
  (function () {
    const s = document.getElementById('oilSceneSvg'); if (!s) return;
    const F = room(s, { wall: '#dfe5ec', lower: '#d0d8e1', floorFill: '#aeb4bd' });
    // wall screen
    el('rect', { x: 36, y: 22, width: 440, height: 84, rx: 8, fill: '#0b0d12', stroke: '#3a4152', 'stroke-width': 4 }, s);
    txt(s, 54, 48, 'DUBAI PARTIALS', { 'font-size': 13, 'font-weight': 700, fill: '#8d8a84', 'letter-spacing': 3 });
    txt(s, 54, 76, '25,000 bbl each', { 'font-size': 24, 'font-weight': 800, fill: '#e0b65a' });
    txt(s, 54, 96, '20 partials = 1 cargo = 500,000 bbl', { 'font-size': 14, 'font-weight': 600, fill: '#cfcbc3' });
    // clock
    el('rect', { x: 520, y: 22, width: 250, height: 84, rx: 8, fill: '#0b0d12', stroke: '#3a4152', 'stroke-width': 4 }, s);
    txt(s, 536, 46, 'SINGAPORE TIME', { 'font-size': 12, 'font-weight': 700, fill: '#8d8a84', 'letter-spacing': 3 });
    const clock = txt(s, 536, 90, '16:29:40', { 'font-size': 38, 'font-weight': 800, fill: '#fff', 'font-family': 'Inter' });
    clock.setAttribute('style', 'font-variant-numeric:tabular-nums');
    const closed = txt(s, 760, 46, 'CLOSED', { 'text-anchor': 'end', 'font-size': 13, 'font-weight': 800, fill: '#c2412d', 'letter-spacing': 2 });
    closed.setAttribute('opacity', 0);
    // traders at a long desk (generic figures)
    person(s, 110, { floor: F, sh: 232, top: '#2b3f73', pants: '#1a1c22', hair: hair.headset, hairColor: '#222', skin: SKINS[1], arms: 'type', delay: .2, smile: 0 });
    person(s, 235, { floor: F, sh: 234, top: '#7a3b2e', pants: '#1a1c22', hair: hair.headset, hairColor: '#3b2a20', skin: SKINS[3], arms: 'type', delay: .7, smile: 0 });
    person(s, 360, { floor: F, sh: 232, top: '#3d6b52', pants: '#1a1c22', hair: hair.headset, hairColor: '#2b1d16', skin: SKINS[0], arms: 'type', delay: .4, smile: 0 });
    el('rect', { x: 50, y: 306, width: 390, height: 12, fill: '#5a4632' }, s);
    el('rect', { x: 64, y: 318, width: 8, height: F - 318, fill: '#3e3022' }, s);
    el('rect', { x: 418, y: 318, width: 8, height: F - 318, fill: '#3e3022' }, s);
    [110, 235, 360].forEach((x) => {
      el('path', { d: `M${x - 26} 306 L${x - 20} 278 L${x + 30} 278 L${x + 36} 306 Z`, fill: '#9aa3ad' }, s);
      el('rect', { x: x - 20, y: 282, width: 50, height: 4, fill: '#4fc26b', class: 'sk-blink' }, s);
    });
    bubble(s, 110, 180, 'I bid.', { w: 100, size: 17, delay: .3 });
    bubble(s, 235, 182, 'I offer.', { w: 110, size: 17, delay: 1.7 });
    bubble(s, 360, 180, 'Done.', { w: 100, size: 17, delay: 3.1 });
    // the price reporter's editor, with a notepad (generic figure)
    person(s, 640, { floor: F, sh: 268, top: '#e0b65a', pants: '#2b2b30', hair: hair.bun, hairColor: '#2b1d16', skin: SKINS[2], arms: 'hold', delay: 0, smile: 0, talk: true, badge: true });
    el('rect', { x: 624, y: 326, width: 32, height: 24, rx: 2, fill: '#fff', stroke: '#8a6d3b', 'stroke-width': 2 }, s);
    bubble(s, 650, 196, 'Window closes.', { w: 190, size: 16, delay: 2.4, left: true });
    txt(s, 640, 436, 'price reporter', { 'text-anchor': 'middle', 'font-size': 12, fill: '#5d5a55' });
    // second observer at the far right
    person(s, 735, { floor: F, sh: 272, top: '#3a3833', pants: '#2b2b30', hair: hair.short, hairColor: '#111', skin: SKINS[4], arms: 'side', delay: .5, smile: 1 });
    txt(s, 735, 436, 'refiner', { 'text-anchor': 'middle', 'font-size': 12, fill: '#5d5a55' });
    txt(s, 235, 436, 'traders', { 'text-anchor': 'middle', 'font-size': 12, fill: '#5d5a55' });

    const pad = (n) => String(n).padStart(2, '0');
    function draw(t) {
      const T = t % 9, sec = Math.min(Math.floor(T) + 40, 60);
      const done = sec >= 60;
      clock.textContent = done ? '16:30:00' : '16:29:' + pad(sec);
      clock.setAttribute('fill', done ? '#e0b65a' : '#fff');
      closed.setAttribute('opacity', done ? 1 : 0);
    }
    if (reduced) { draw(8.5); return; }
    draw(0);
    whileVisible(s, draw);
  })();

  /* ---------- analogy: the closing-time mango stall ---------- */
  (function () {
    const s = document.getElementById('mangoSvg'); if (!s) return;
    el('rect', { x: 0, y: 0, width: 800, height: 360, fill: '#eaf0f4' }, s);
    const F = 300;
    el('rect', { x: 0, y: F, width: 800, height: 60, fill: '#b8b1a2' }, s);
    // tiny stall
    el('rect', { x: 40, y: 190, width: 190, height: 110, fill: '#efe6d4', stroke: '#8a6d3b', 'stroke-width': 3 }, s);
    for (let i = 0; i < 5; i++) el('path', { d: `M${34 + i * 40} 158 L${74 + i * 40} 158 L${74 + i * 40} 190 L${34 + i * 40} 190 Z`, fill: i % 2 ? '#fff' : '#c2412d' }, s);
    el('rect', { x: 34, y: 150, width: 200, height: 10, fill: '#5a3a26' }, s);
    const crates = [0, 1, 2].map((i) => {
      const g = el('g', {}, s);
      el('rect', { x: 130 + i * 30, y: 270, width: 26, height: 28, fill: '#c89a5b', stroke: '#8a6d3b', 'stroke-width': 2 }, g);
      el('circle', { cx: 143 + i * 30, cy: 268, r: 9, fill: '#e07a2a' }, g);
      return g;
    });
    person(small(s, 80, F, .62), 80, { floor: F, sh: 178, top: '#2b3f73', pants: '#3a3833', hair: hair.cap, skin: SKINS[3], arms: 'wave', delay: 0, smile: 3 });
    txt(s, 135, 322, 'A few crates trade', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#111' });
    // bell
    const bell = el('g', {}, s); bell.style.transformOrigin = '255px 112px'; bell.style.transformBox = 'view-box';
    el('line', { x1: 255, y1: 112, x2: 255, y2: 130, stroke: '#5a3a26', 'stroke-width': 3 }, bell);
    el('path', { d: 'M241 152 Q241 128 255 128 Q269 128 269 152 Z', fill: '#e0b65a', stroke: '#8a6d3b', 'stroke-width': 2 }, bell);
    el('circle', { cx: 255, cy: 156, r: 4, fill: '#8a6d3b' }, bell);
    el('line', { x1: 255, y1: 112, x2: 255, y2: 100, stroke: '#5a3a26', 'stroke-width': 3 }, s);
    txt(s, 255, 90, 'Closing bell', { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#3d3d3d' });
    // price board over the stall
    el('rect', { x: 60, y: 38, width: 150, height: 64, rx: 6, fill: '#0b0d12', stroke: '#3a4152', 'stroke-width': 3 }, s);
    txt(s, 135, 60, 'CLOSING PRICE', { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: '#8d8a84', 'letter-spacing': 2 });
    const board = txt(s, 135, 92, '–', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: '#e0b65a' });
    // buyer coin
    const coin = el('circle', { r: 7, fill: '#e0b65a', stroke: '#8a6d3b', 'stroke-width': 2, opacity: 0 }, s);
    person(small(s, 300, F, .62), 300, { floor: F, sh: 178, top: '#c97b5a', pants: '#3a3833', hair: hair.long, skin: SKINS[1], arms: 'side', delay: .5, smile: 3 });
    // road with lorries
    el('rect', { x: 330, y: 276, width: 470, height: 24, fill: '#4a4d55' }, s);
    el('line', { x1: 330, y1: 288, x2: 800, y2: 288, stroke: '#cfcbc3', 'stroke-width': 3, 'stroke-dasharray': '16 12' }, s);
    txt(s, 590, 322, 'The whole city’s mangoes, priced off the bell', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#111' });
    const lorries = [0, 1, 2].map(() => {
      const g = el('g', {}, s);
      el('rect', { x: 0, y: 214, width: 92, height: 56, fill: '#f1ecdf', stroke: '#8a6d3b', 'stroke-width': 3 }, g);
      el('path', { d: 'M92 232 L120 232 L132 252 L132 270 L92 270 Z', fill: '#2b3f73' }, g);
      el('circle', { cx: 22, cy: 272, r: 9, fill: '#111' }, g); el('circle', { cx: 108, cy: 272, r: 9, fill: '#111' }, g);
      [[16, 12], [40, 12], [64, 12], [28, 34], [52, 34]].forEach(([x, y]) => el('circle', { cx: x + 8, cy: 214 + y + 8, r: 9, fill: '#e07a2a' }, g));
      const tag = el('g', {}, g);
      el('rect', { x: 20, y: 160, width: 70, height: 36, rx: 6, fill: '#fff', stroke: '#111', 'stroke-width': 2 }, tag);
      const tt = txt(tag, 55, 185, '–', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: '#111' });
      return { g, tt };
    });
    function draw(t) {
      const T = t % 9;
      const ring = T > 1 && T < 2.4 ? Math.sin((T - 1) * 14) * 16 * (1 - (T - 1) / 1.4) : 0;
      bell.style.transform = `rotate(${ring.toFixed(1)}deg)`;
      const p = clamp((T - 2.6) / 1.2, 0, 1);
      coin.setAttribute('opacity', p > 0 && p < 1 ? 1 : 0);
      coin.setAttribute('cx', (300 + (150 - 300 + 0) * p).toFixed(1));
      coin.setAttribute('cy', (230 - Math.sin(Math.PI * p) * 60).toFixed(1));
      crates[2].setAttribute('opacity', T > 3.6 && T < 8.2 ? 0 : 1);
      const up = T > 3.8 && T < 8.6;
      board.textContent = up ? '↑' : '–';
      lorries.forEach((l, i) => {
        const x = 330 + ((t * 70 + i * 190) % 640) - 140;
        l.g.setAttribute('transform', `translate(${x.toFixed(1)} 0)`);
        l.tt.textContent = up ? '↑' : '–';
      });
    }
    if (reduced) { draw(5); crates[2].setAttribute('opacity', 0); return; }
    draw(0);
    whileVisible(s, draw);
  })();

  /* ---------- analogy: the jam jar that keeps its label ---------- */
  (function () {
    const s = document.getElementById('jamSvg'); if (!s) return;
    el('rect', { x: 0, y: 0, width: 800, height: 360, fill: '#f0ebe0' }, s);
    el('rect', { x: 0, y: 300, width: 800, height: 60, fill: '#b8a98a' }, s);
    // jar
    el('rect', { x: 300, y: 70, width: 200, height: 20, rx: 4, fill: '#8a6d3b' }, s);
    const jarBack = el('path', { d: 'M305 92 L295 290 Q295 300 305 300 L495 300 Q505 300 505 290 L495 92 Z', fill: '#f6efe0', stroke: '#8a6d3b', 'stroke-width': 4 }, s);
    const fruits = [
      { n: 'Brent', c: '#c2412d', x: 350, y: 270, at: .6 },
      { n: 'Forties', c: '#e0b65a', x: 400, y: 270, at: 2.4 },
      { n: 'Oseberg', c: '#2f7d4f', x: 450, y: 270, at: 2.9 },
      { n: 'Ekofisk', c: '#2463d6', x: 375, y: 222, at: 4.8 },
      { n: 'Troll', c: '#8a5a9e', x: 425, y: 222, at: 6.6 },
      { n: 'WTI Midland', c: '#e07a2a', x: 400, y: 174, at: 8.4 },
    ].map((f) => {
      const g = el('g', {}, s); g.setAttribute('opacity', 0);
      el('circle', { cx: f.x, cy: f.y, r: 22, fill: f.c, stroke: '#111', 'stroke-width': 2, 'stroke-opacity': .25 }, g);
      el('circle', { cx: f.x - 7, cy: f.y - 7, r: 5, fill: '#fff', opacity: .35 }, g);
      return Object.assign(f, { g });
    });
    // label
    el('rect', { x: 330, y: 120, width: 140, height: 34, rx: 4, fill: '#fff', stroke: '#111', 'stroke-width': 2 }, s);
    txt(s, 400, 144, 'BRENT', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: '#111', 'letter-spacing': 3 });
    // year ticker + legend
    const tick = txt(s, 400, 332, '', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: '#111' });
    const stages = [[.6, 'Early on: Brent crude only'], [2.4, '2002: Forties and Oseberg added'], [4.8, '2007: Ekofisk added'], [6.6, '2018: Troll added'], [8.4, '2023: WTI Midland, from Texas, added']];
    txt(s, 150, 160, 'The label never changes.', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: '#111' });
    txt(s, 150, 182, 'The recipe does.', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: '#c2412d' });
    const names = el('g', {}, s);
    function draw(t) {
      const T = t % 12;
      fruits.forEach((f) => {
        const p = clamp((T - f.at) / .7, 0, 1);
        f.g.setAttribute('opacity', p > 0 ? 1 : 0);
        f.g.setAttribute('transform', `translate(0 ${(-(1 - p) * (f.y - 40)).toFixed(1)})`);
      });
      let cur = ''; stages.forEach(([at, label]) => { if (T >= at) cur = label; });
      tick.textContent = cur;
      names.replaceChildren();
      let k = 0;
      fruits.forEach((f) => { if (T >= f.at + .5) { el('circle', { cx: 580, cy: 130 + k * 26, r: 7, fill: f.c }, names); txt(names, 594, 135 + k * 26, f.n, { 'font-size': 14, 'font-weight': 600, fill: '#111' }); k++; } });
    }
    if (reduced) { draw(11); return; }
    draw(0);
    whileVisible(s, draw);
  })();
})();
