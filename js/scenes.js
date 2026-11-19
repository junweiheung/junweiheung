/*
 * Cartoon scenes for individual explainers, built with js/scene-kit.js.
 * Each builder runs only if its <svg> is on the page. All figures are generic illustrations.
 */
(function () {
  const K = window.SceneKit; if (!K) return;
  const { el, txt, origin, person, bubble, room, hair, SKINS } = K;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fig = (svg) => svg.closest('.scene');
  // run fn(t) every frame while the figure is on screen
  function whileVisible(svg, fn) {
    let raf = 0, on = false, t0 = 0;
    const loop = (t) => { if (!on) return; fn((t - t0) / 1000); raf = requestAnimationFrame(loop); };
    new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting && !on) { on = true; t0 = performance.now(); raf = requestAnimationFrame(loop); }
      if (!e.isIntersecting) { on = false; cancelAnimationFrame(raf); }
    })).observe(fig(svg));
  }

  /* ---------- implants: the 2017 "chip party" ---------- */
  (function () {
    const s = document.getElementById('partySvg'); if (!s) return;
    const F = room(s, { wall: '#eef0ea', lower: '#e1e5dc', floorFill: '#c9c1ae' });
    // bunting banner and balloons
    el('path', { d: 'M40 40 Q400 70 760 40', stroke: '#8d8a84', 'stroke-width': 2, fill: 'none' }, s);
    for (let i = 0; i < 14; i++) { const x = 60 + i * 50, y = 40 + 30 * Math.sin(Math.PI * (x - 40) / 720) * 0.95; el('path', { d: `M${x - 12} ${y} L${x + 12} ${y} L${x} ${y + 22} Z`, fill: ['#c2412d', '#e0b65a', '#2463d6'][i % 3] }, s); }
    el('rect', { x: 250, y: 92, width: 300, height: 48, rx: 6, fill: '#111' }, s);
    txt(s, 400, 124, 'CHIP PARTY!', { 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: '#e0b65a', 'letter-spacing': 2 });
    [[70, '#c2412d', 0], [118, '#2463d6', .6], [96, '#e0b65a', 1.1]].forEach(([x, c, d]) => {
      const b = origin(el('g', { class: 'sk-bob' }, s), x, 200); b.style.animationDelay = d + 's';
      el('line', { x1: x, y1: 215, x2: x + 4, y2: 300, stroke: '#8d8a84', 'stroke-width': 1.5 }, b);
      el('ellipse', { cx: x, cy: 190, rx: 20, ry: 25, fill: c }, b);
    });
    // the queue
    person(s, 170, { floor: F, sh: 196, top: '#6b8f71', pants: '#3a3833', hair: hair.long, skin: SKINS[1], arms: 'clasp', badge: 1, delay: .3, smile: 1 });
    person(s, 255, { floor: F, sh: 188, top: '#c97b5a', pants: '#2b2b30', hair: hair.short, hairColor: '#111', skin: SKINS[3], arms: 'side', badge: 1, delay: .9, smile: -1 });
    // the injector stands behind the table; the person getting chipped stands in front
    person(s, 470, { floor: F, sh: 186, top: '#f7f5f0', pants: '#5d5a55', hair: hair.short, hairColor: '#6b4a2f', skin: SKINS[2], arms: 'hold', delay: 1.2, smile: 3 });
    el('rect', { x: 452, y: 252, width: 36, height: 9, rx: 4, fill: '#9aa3ad' }, s);
    el('rect', { x: 488, y: 255, width: 12, height: 3, fill: '#5d5a55' }, s);
    el('rect', { x: 300, y: 300, width: 220, height: 12, fill: '#8a6d3b' }, s);
    el('rect', { x: 312, y: 312, width: 8, height: F - 312, fill: '#6e5530' }, s);
    el('rect', { x: 500, y: 312, width: 8, height: F - 312, fill: '#6e5530' }, s);
    el('rect', { x: 436, y: 282, width: 66, height: 18, rx: 3, fill: '#fff', stroke: '#76736c' }, s);
    txt(s, 469, 295, 'US$300 each', { 'text-anchor': 'middle', 'font-size': 10, fill: '#3d3d3d' });
    person(s, 370, { floor: F, sh: 192, top: '#2463d6', pants: '#2b2b30', hair: hair.bun, skin: SKINS[0], arms: 'side', badge: 1, delay: .5, smile: 0 });
    // door with reader, and a chipped worker tapping in
    el('rect', { x: 650, y: 150, width: 120, height: F - 150, fill: '#5a3a26' }, s);
    el('circle', { cx: 755, cy: 290, r: 5, fill: '#e0b65a' }, s);
    el('rect', { x: 618, y: 236, width: 26, height: 40, rx: 4, fill: '#111' }, s);
    el('circle', { class: 'sk-blink', cx: 631, cy: 248, r: 5, fill: '#4fc26b' }, s);
    person(s, 570, { floor: F, sh: 190, top: '#3a3833', pants: '#26272b', hair: hair.cap, skin: SKINS[4], arms: 'wave', badge: 1, delay: .2, smile: 4 });
    bubble(s, 640, 222, 'Beep. Door open!', { left: true, w: 180, size: 17 });
    el('rect', { x: 0, y: F + 22, width: 800, height: 40, fill: 'none' }, s);
  })();

  /* ---------- gpu-unlock: same card, two desks ---------- */
  (function () {
    const s = document.getElementById('desksSvg'); if (!s) return;
    const F = room(s, { wall: '#e9e6f0', lower: '#dedae6', floorFill: '#bdb6a6' });
    el('line', { x1: 400, y1: 20, x2: 400, y2: F, stroke: '#cfc8d8', 'stroke-width': 3, 'stroke-dasharray': '8 8' }, s);
    const desk = (cx, who) => {
      // chair back, person, desk, monitor, PC with GPU
      el('rect', { x: cx - 120, y: 230, width: 60, height: 100, rx: 8, fill: '#3a3833' }, s);
      person(s, cx - 90, who);
      el('rect', { x: cx - 175, y: 300, width: 330, height: 14, fill: '#8a6d3b' }, s);
      el('rect', { x: cx - 165, y: 314, width: 10, height: F - 314, fill: '#6e5530' }, s);
      el('rect', { x: cx + 135, y: 314, width: 10, height: F - 314, fill: '#6e5530' }, s);
      el('rect', { x: cx - 70, y: 292, width: 70, height: 8, rx: 2, fill: '#2b2b30' }, s);
      el('rect', { x: cx + 10, y: 196, width: 140, height: 90, rx: 4, fill: '#111' }, s);
      el('rect', { x: cx + 74, y: 286, width: 12, height: 14, fill: '#111' }, s);
      const scr = el('g', {}, s);
      el('rect', { x: cx + 18, y: 204, width: 124, height: 74, fill: '#1d2a44' }, scr);
      const pc = el('g', {}, s);
      el('rect', { x: cx + 40, y: 330, width: 80, height: F - 334, rx: 4, fill: '#2b2b30' }, pc);
      el('rect', { x: cx + 50, y: 350, width: 60, height: 12, rx: 2, fill: '#76b900' }, pc);
      const lock = el('g', {}, s);
      el('path', { d: `M${cx + 68} ${346} v-8 a12 12 0 0 1 24 0 v8`, stroke: '#e0b65a', 'stroke-width': 4, fill: 'none' }, lock);
      el('rect', { x: cx + 63, y: 344, width: 34, height: 26, rx: 4, fill: '#e0b65a' }, lock);
      return { scr, lock };
    };
    const L = desk(200, { floor: F, sh: 220, top: '#7a3b6e', hair: hair.headset, skin: SKINS[1], arms: 'type', seated: 1, delay: .2 });
    const R = desk(600, { floor: F, sh: 220, top: '#2f6d5f', hair: hair.long, hairColor: '#6b4a2f', skin: SKINS[0], arms: 'type', seated: 1, delay: .7 });
    // left screen: a game with an fps counter
    el('path', { d: 'M218 278 L250 238 L270 258 L300 222 L342 278 Z', fill: '#4d8bff' }, L.scr);
    el('circle', { cx: 320, cy: 222, r: 8, fill: '#e0b65a' }, L.scr);
    const fps = txt(L.scr, 336, 216, '60 fps', { 'text-anchor': 'end', 'font-size': 12, 'font-weight': 700, fill: '#fff' });
    // right screen: an AI image job with a progress bar
    txt(R.scr, 626, 222, 'Generating image…', { 'font-size': 11, fill: '#cfcbc3' });
    el('rect', { x: 626, y: 240, width: 108, height: 12, rx: 3, fill: '#2a2926' }, R.scr);
    const bar = el('rect', { x: 626, y: 240, width: 0, height: 12, rx: 3, fill: '#e0b65a' }, R.scr);
    const secs = txt(R.scr, 626, 270, '72 s per image', { 'font-size': 11, 'font-weight': 700, fill: '#fff' });
    // captions on the floor
    K.label(s, 200, F + 26, 'Gamer', 'Frames stay the same');
    K.label(s, 600, F + 26, 'AI hobbyist', 'Same card, 72 s → 45 s per image');
    const tag = txt(s, 400, 40, 'As shipped', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: '#111' });
    // timeline: 0–5 s locked, unlock at 5 s, 5–11 s unlocked, then repeat
    let p = 0, last = 0;
    const frame = (t) => {
      const T = t % 11, unlocked = T > 5, dt = Math.min(.1, Math.max(0, t - last)); last = t;
      const per = unlocked ? 45 : 72;                       // seconds per image, shown sped up 12x
      p = (p + dt * 12 / per) % 1;
      bar.setAttribute('width', 108 * p);
      secs.textContent = (unlocked ? '45' : '72') + ' s per image';
      fps.textContent = '60 fps';
      tag.textContent = unlocked ? 'Unlocked: games +0%, AI images faster' : 'As shipped';
      tag.setAttribute('fill', unlocked ? '#b8892b' : '#111');
      const off = unlocked ? Math.min(1, (T - 5) * 2) : 0;
      [L.lock, R.lock].forEach((lk) => { lk.setAttribute('transform', `translate(0 ${-40 * off})`); lk.setAttribute('opacity', 1 - off); });
    };
    if (reduced) { bar.setAttribute('width', 108); secs.textContent = '72 s → 45 s per image'; tag.textContent = 'Unlocked: games +0%, AI images faster'; return; }
    whileVisible(s, frame);
  })();

  /* ---------- smile: one chip rides the line, each stop keeps its cents ---------- */
  (function () {
    const s = document.getElementById('lineSvg'); if (!s) return;
    el('rect', { x: 0, y: 0, width: 800, height: 460, fill: '#f1ece2' }, s);
    const stops = [
      ['Design', 75, '#2463d6', { hair: hair.short, top: '#3a3833' }],
      ['EDA software', 88, '#2463d6', { hair: hair.long, top: '#6b8f71' }],
      ['Equipment', 57, '#2463d6', { hair: hair.hardhat, top: '#c97b5a' }],
      ['Wafer fab', 66, '#2463d6', { hair: hair.cap, top: '#f7f5f0' }],
      ['Memory', 80, '#2463d6', { hair: hair.bun, top: '#7a3b6e' }],
      ['Packaging', 22, '#e0b65a', { hair: hair.short, top: '#2f6d5f' }],
      ['Assembly', 6, '#e0b65a', { hair: hair.hardhat, top: '#2463d6' }],
    ];
    const F = 360, X0 = 70, DX = 110;
    el('rect', { x: 20, y: F - 6, width: 760, height: 22, rx: 11, fill: '#3a3833' }, s);
    for (let i = 0; i < 20; i++) origin(el('circle', { class: 'sk-spin', cx: 38 + i * 38, cy: F + 5, r: 7, fill: '#76736c', stroke: '#3a3833', 'stroke-width': 2, 'stroke-dasharray': '4 3' }, s), 38 + i * 38, F + 5);
    const jars = stops.map(([name, c, col, o], i) => {
      const x = X0 + i * DX;
      const g = el('g', { transform: `translate(${x} ${F}) scale(.62) translate(${-x} ${-F})` }, s);
      person(g, x, Object.assign({ floor: F, sh: 228, pants: '#2b2b30', skin: SKINS[i % 5], arms: 'clasp', delay: i * .3 }, o));
      // jar: outline, cents fill, label
      const jx = x - 26, jy = 40, jh = 120;
      el('rect', { x: jx, y: jy, width: 52, height: jh, rx: 8, fill: '#fff', stroke: '#76736c', 'stroke-width': 2 }, s);
      const fill = el('rect', { x: jx + 3, y: jy + jh - 3, width: 46, height: 0, rx: 5, fill: col }, s);
      const val = txt(s, x, jy - 8, '', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: '#111' });
      txt(s, x, F + 40, name, { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#111' });
      return { x, c, fill, val, jy, jh };
    });
    const chip = el('g', {}, s);
    el('rect', { x: -16, y: F - 34, width: 32, height: 26, rx: 3, fill: '#111' }, chip);
    el('rect', { x: -9, y: F - 28, width: 18, height: 14, rx: 2, fill: '#e0b65a' }, chip);
    txt(s, 400, 438, 'Cents each stop keeps per dollar of sales (blue: more than half)', { 'text-anchor': 'middle', 'font-size': 12, fill: '#5d5a55' });
    const set = (j, k) => { const h = (j.jh - 6) * j.c / 100 * k; j.fill.setAttribute('y', j.jy + j.jh - 3 - h); j.fill.setAttribute('height', h); j.val.textContent = k > 0 ? Math.round(j.c * k) + '¢' : ''; };
    if (reduced) { jars.forEach((j) => set(j, 1)); chip.setAttribute('transform', `translate(${jars[6].x} 0)`); return; }
    const TRAVEL = 12;                                      // seconds for the chip to cross, then a pause
    whileVisible(s, (t) => {
      const T = t % (TRAVEL + 3), x = 20 + Math.min(1, T / TRAVEL) * 760;
      chip.setAttribute('transform', `translate(${x} 0)`);
      jars.forEach((j) => set(j, Math.max(0, Math.min(1, (x - j.x + 30) / 60))));
    });
  })();

  /* ---------- glass-cloth: the Fukushima mill and the queue outside ---------- */
  (function () {
    const s = document.getElementById('millSvg'); if (!s) return;
    el('rect', { x: 0, y: 0, width: 800, height: 460, fill: '#dfe9ef' }, s);
    el('path', { d: 'M0 300 Q140 230 300 280 T560 260 T800 270 L800 400 L0 400 Z', fill: '#b9cfa3' }, s);
    const F = 402;
    el('rect', { x: 0, y: F, width: 800, height: 58, fill: '#a8a294' }, s);
    // the mill
    el('rect', { x: 30, y: 150, width: 330, height: F - 150, fill: '#f4efe4', stroke: '#8a6d3b', 'stroke-width': 3 }, s);
    el('path', { d: 'M20 150 L195 90 L370 150 Z', fill: '#5a3a26' }, s);
    el('rect', { x: 260, y: 60, width: 26, height: 70, fill: '#8a6d3b' }, s);
    [0, 1, 2].forEach((i) => { const c = origin(el('circle', { class: 'sk-bob', cx: 273 + i * 10, cy: 48 - i * 16, r: 9 + i * 3, fill: '#fff', opacity: .7 }, s), 273, 48); c.style.animationDelay = i * .5 + 's'; });
    el('rect', { x: 95, y: 112, width: 200, height: 26, rx: 3, fill: '#111' }, s);
    txt(s, 195, 130, 'FUKUSHIMA · SINCE 1918', { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: '#e0b65a', 'letter-spacing': 1 });
    // loom in a big window: warp threads and a shuttle running across
    el('rect', { x: 60, y: 170, width: 270, height: 120, fill: '#1d2a44' }, s);
    for (let i = 0; i < 26; i++) el('line', { x1: 72 + i * 10, y1: 176, x2: 72 + i * 10, y2: 284, stroke: '#cfe4f2', 'stroke-width': 1.5, opacity: .8 }, s);
    const woven = el('rect', { x: 66, y: 240, width: 258, height: 44, fill: '#eaf3f8', opacity: .85 }, s);
    const shuttle = el('rect', { x: 66, y: 232, width: 30, height: 10, rx: 4, fill: '#e0b65a' }, s);
    const wk = el('g', { transform: `translate(318 ${F}) scale(.72) translate(-318 ${-F})` }, s);
    person(wk, 318, { floor: F, sh: 250, top: '#2463d6', pants: '#2b2b30', hair: hair.hardhat, skin: SKINS[0], arms: 'side', delay: .4 });
    // door and conveyor of cloth rolls heading out
    el('rect', { x: 70, y: 310, width: 70, height: F - 310, fill: '#5a3a26' }, s);
    el('rect', { x: 360, y: F - 22, width: 120, height: 10, fill: '#3a3833' }, s);
    const roll = el('g', {}, s);
    el('rect', { x: -22, y: F - 44, width: 44, height: 22, rx: 11, fill: '#eaf3f8', stroke: '#9fb7c6', 'stroke-width': 2 }, roll);
    // the queue of buyers holding signs
    const buyers = [['Nvidia', '#2f6d5f'], ['Microsoft', '#3a3833'], ['Google', '#c97b5a'], ['Amazon', '#7a3b6e']];
    buyers.forEach(([n, c], i) => {
      const x = 520 + i * 72, g = el('g', { transform: `translate(${x} ${F}) scale(.78) translate(${-x} ${-F})` }, s);
      person(g, x, { floor: F, sh: F - 190, top: c, pants: '#2b2b30', hair: [hair.short, hair.long, hair.bun, hair.cap][i], skin: SKINS[(i + 2) % 5], arms: 'hold', delay: i * .4 });
      el('rect', { x: x - 34, y: F - 104, width: 68, height: 22, rx: 3, fill: '#fff', stroke: '#111', 'stroke-width': 1.5 }, s);
      txt(s, x, F - 89, n, { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: '#111' });
    });
    bubble(s, 742, 230, 'Still waiting…', { left: true, w: 150, size: 16 });
    txt(s, 630, F + 34, 'The queue (customers as reported)', { 'text-anchor': 'middle', 'font-size': 12, fill: '#3d3d3d' });
    if (reduced) { roll.setAttribute('transform', 'translate(430 0)'); return; }
    whileVisible(s, (t) => {
      const k = (Math.sin(t * 2.2) + 1) / 2;
      shuttle.setAttribute('x', 66 + k * 228);
      const w = (t % 6) / 6; woven.setAttribute('y', 240 - w * 40); woven.setAttribute('height', 44 + w * 40);
      roll.setAttribute('transform', `translate(${380 + ((t * 30) % 110)} 0)`);
    });
  })();
})();
