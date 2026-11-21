/*
 * Cute cartoon scenes for the Fed / bond-market explainer, built with js/scene-kit.js.
 * Generic figures, not real people. Motion runs via scene-kit.css while .scene is in view
 * and stops under reduced motion. Drawn into the <svg>s in the .scene figures.
 */
(function () {
  const K = window.SceneKit; if (!K) return;
  const { el, txt, person, bubble, hair, SKINS } = K;
  const GOLD = '#e0b65a', INK = '#111', RED = '#c2412d', GREEN = '#4fc26b';

  /* ---------- Scene 1: the Fed on a seesaw ---------- */
  (function () {
    const s = document.getElementById('seesawSceneSvg'); if (!s) return;
    el('rect', { x: 0, y: 0, width: 800, height: 400, fill: '#eef2f5' }, s);
    el('rect', { x: 0, y: 330, width: 800, height: 70, fill: '#cbd3d8' }, s);

    // pivot (triangle fulcrum)
    el('path', { d: 'M400 250 L372 320 L428 320 Z', fill: '#8a6d3b' }, s);

    // the whole seesaw assembly rocks; the person and the two ends ride on the plank
    const rock = el('g', { class: 'bm-rock' }, s);
    rock.style.transformOrigin = '400px 250px';

    // the plank
    el('rect', { x: 120, y: 242, width: 560, height: 16, rx: 4, fill: '#5a4632' }, rock);

    // LEFT end: a bond marked PRICE, riding this side
    const left = el('g', {}, rock);
    el('rect', { x: 150, y: 150, width: 92, height: 64, rx: 6, fill: '#fff', stroke: INK, 'stroke-width': 3 }, left);
    txt(left, 196, 176, 'BOND', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: INK });
    txt(left, 196, 198, 'PRICE', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: GOLD });
    txt(left, 196, 234, 'yield ↓', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#76736c' });

    // RIGHT end: PRICE low, yield up
    const right = el('g', {}, rock);
    el('rect', { x: 558, y: 150, width: 92, height: 64, rx: 6, fill: '#0d0d0f', stroke: INK, 'stroke-width': 3 }, right);
    txt(right, 604, 176, 'BOND', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: '#fff' });
    txt(right, 604, 198, 'PRICE', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: GOLD });
    txt(right, 604, 234, 'yield ↑', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#76736c' });

    // the Fed, sitting on the plank at the pivot
    person(rock, 400, {
      floor: 250, sh: 150, seated: true, top: '#2f4a7a', pants: '#1a1c22', tie: RED,
      hair: hair.short, hairColor: '#2a2018', skin: SKINS[1], arms: 'hold', smile: 3
    });
    bubble(rock, 400, 70, 'One lever.', { w: 150, size: 16, delay: 0.8 });
  })();

  /* ---------- Scene 2: the Fed's two moods ---------- */
  (function () {
    const s = document.getElementById('moodsSceneSvg'); if (!s) return;
    el('rect', { x: 0, y: 0, width: 800, height: 360, fill: '#eef2f5' }, s);
    el('rect', { x: 0, y: 300, width: 800, height: 60, fill: '#b8b1a2' }, s);
    el('line', { x1: 400, y1: 14, x2: 400, y2: 346, stroke: '#9aa3ad', 'stroke-width': 2, 'stroke-dasharray': '6 6' }, s);
    txt(s, 200, 30, 'Afraid of a slump', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INK });
    txt(s, 600, 30, 'Afraid of inflation', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INK });

    // LEFT: sun, smiling Fed handing out coins (easy money)
    const sun = el('g', { class: 'sk-spin' }, s); sun.style.transformOrigin = '70px 80px';
    el('circle', { cx: 70, cy: 80, r: 18, fill: GOLD }, sun);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; el('line', { x1: 70 + 22 * Math.cos(a), y1: 80 + 22 * Math.sin(a), x2: 70 + 30 * Math.cos(a), y2: 80 + 30 * Math.sin(a), stroke: GOLD, 'stroke-width': 3, 'stroke-linecap': 'round' }, sun); }
    person(s, 200, { floor: 300, sh: 150, top: '#2f7a4a', pants: '#1a1c22', hair: hair.short, hairColor: '#2a2018', skin: SKINS[0], arms: 'wave', smile: 5 });
    // coins raining down (cheap money)
    [[150, 0], [185, 0.5], [230, 0.9], [265, 1.3]].forEach(([cx, d]) => {
      const c = el('g', { class: 'sk-bob' }, s); c.style.animationDelay = d + 's';
      el('circle', { cx, cy: 250, r: 11, fill: GOLD, stroke: '#9a7320', 'stroke-width': 2 }, c);
      txt(c, cx, 255, '$', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#7a5a12' });
    });
    txt(s, 200, 340, 'easy money · cheap loans', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#2f7a4a' });

    // RIGHT: stern Fed with a STOP sign (tight money)
    person(s, 600, { floor: 300, sh: 150, top: '#7a2f2f', pants: '#1a1c22', hair: hair.short, hairColor: '#2a2018', skin: SKINS[2], arms: 'hold', smile: -3 });
    const stop = el('g', { class: 'sk-blink' }, s);
    el('path', { d: 'M690 120 l22 0 l16 16 l0 22 l-16 16 l-22 0 l-16 -16 l0 -22 Z', fill: RED, stroke: '#fff', 'stroke-width': 3 }, stop);
    txt(stop, 701, 160, 'STOP', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#fff' });
    // a coin with a line through it (money dries up)
    const dry = el('g', {}, s);
    el('circle', { cx: 540, cy: 250, r: 11, fill: '#cbd3d8', stroke: '#9aa3ad', 'stroke-width': 2 }, dry);
    el('line', { x1: 531, y1: 259, x2: 549, y2: 241, stroke: RED, 'stroke-width': 3 }, dry);
    txt(s, 600, 340, 'tight money · dear loans', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#7a2f2f' });
  })();
})();
