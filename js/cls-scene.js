/*
 * Cartoon scenes for the CLS explainer, built with js/scene-kit.js.
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

  /* ---------- story scene: a Frankfurt dealing desk, 26 June 1974, 3.30pm ---------- */
  (function () {
    const s = document.getElementById('clsSceneSvg'); if (!s) return;
    const F = room(s, { wall: '#e6e3da', lower: '#d8d3c5', floorFill: '#a9a08c' });
    // wall clock reading 3.30
    el('circle', { cx: 60, cy: 90, r: 40, fill: '#fff', stroke: '#111', 'stroke-width': 4 }, s);
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; el('line', { x1: 60 + 32 * Math.sin(a), y1: 90 - 32 * Math.cos(a), x2: 60 + 36 * Math.sin(a), y2: 90 - 36 * Math.cos(a), stroke: '#111', 'stroke-width': 2 }, s); }
    el('line', { x1: 60, y1: 90, x2: 60 + 18 * Math.sin(Math.PI * 105 / 180), y2: 90 - 18 * Math.cos(Math.PI * 105 / 180), stroke: '#111', 'stroke-width': 5, 'stroke-linecap': 'round' }, s);
    el('line', { x1: 60, y1: 90, x2: 60, y2: 124, stroke: '#111', 'stroke-width': 3, 'stroke-linecap': 'round' }, s);
    // the board
    el('rect', { x: 290, y: 34, width: 240, height: 210, rx: 8, fill: '#0b0d12', stroke: '#3a4152', 'stroke-width': 4 }, s);
    txt(s, 306, 66, 'FRANKFURT · 26 JUN 1974', { 'font-size': 13, 'font-weight': 700, fill: '#e0b65a', 'letter-spacing': 1.5 });
    txt(s, 306, 90, 'Bank closed at 15:30', { 'font-size': 13, fill: '#8d8a84' });
    txt(s, 306, 134, 'Deutsche marks', { 'font-size': 18, 'font-weight': 700, fill: '#fff' });
    txt(s, 306, 154, 'paid out in Frankfurt', { 'font-size': 13, fill: '#8d8a84' });
    txt(s, 504, 142, '✔', { 'text-anchor': 'middle', 'font-size': 34, 'font-weight': 800, fill: '#4fc26b' });
    txt(s, 306, 196, 'US dollars', { 'font-size': 18, 'font-weight': 700, fill: '#fff' });
    txt(s, 306, 216, 'New York stopped paying', { 'font-size': 13, fill: '#8d8a84' });
    const q = el('g', { class: 'sk-blink' }, s);
    txt(q, 504, 206, '?', { 'text-anchor': 'middle', 'font-size': 38, 'font-weight': 800, fill: '#c2412d' });
    person(s, 140, { floor: F, sh: 270, top: '#3a4f7a', pants: '#1a1c22', tie: '#c2412d', hair: hair.short, hairColor: '#2a2018', skin: SKINS[0], arms: 'hold', delay: .2, smile: -2 });
    bubble(s, 130, 196, 'Where are my dollars?', { w: 190, size: 15, delay: .5 });
    person(s, 690, { floor: F, sh: 270, top: '#6b6f78', pants: '#2b2b30', hair: hair.bun, hairColor: '#4a3020', skin: SKINS[3], arms: 'wave', delay: 0, smile: 0, talk: true });
    bubble(s, 675, 196, 'New York has stopped.', { left: true, w: 160, size: 14, delay: 3.2 });
    // a tray of papers
    el('rect', { x: 340, y: 330, width: 140, height: 12, fill: '#5a4632' }, s);
    el('rect', { x: 350, y: 342, width: 8, height: F - 342, fill: '#3e3022' }, s);
    el('rect', { x: 462, y: 342, width: 8, height: F - 342, fill: '#3e3022' }, s);
    el('rect', { x: 368, y: 316, width: 60, height: 14, fill: '#f4efe4', stroke: '#8a6d3b', 'stroke-width': 2 }, s);
  })();

  /* ---------- analogy: two separate payments vs a locked swap box ---------- */
  (function () {
    const s = document.getElementById('lockerSvg'); if (!s) return;
    el('rect', { x: 0, y: 0, width: 800, height: 360, fill: '#e8eef3' }, s);
    el('rect', { x: 0, y: 300, width: 800, height: 60, fill: '#b8b1a2' }, s);
    el('line', { x1: 400, y1: 14, x2: 400, y2: 346, stroke: '#9aa3ad', 'stroke-width': 2, 'stroke-dasharray': '6 6' }, s);
    txt(s, 200, 30, 'Two separate payments', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: '#111' });
    txt(s, 600, 30, 'Swap in a locked box', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: '#111' });
    const F = 300, k = .62;
    const P = [
      [70, SKINS[1], '#2b3f73', hair.short], [330, SKINS[3], '#3d6b52', hair.bun],
      [470, SKINS[1], '#2b3f73', hair.short], [730, SKINS[3], '#3d6b52', hair.bun]];
    P.forEach(([x, sk, top, h], i) => person(small(s, x, F, k), x, { floor: F, sh: 172, top, pants: '#1a1c22', hair: h, hairColor: '#2a2018', skin: sk, arms: 'side', delay: i * .3, smile: 2 }));
    const coin = (c) => { const g = el('g', {}, s); el('circle', { r: 14, fill: '#e0b65a', stroke: '#8a6d3b', 'stroke-width': 2 }, g); txt(g, 0, 5, 'S$', { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: '#5a3a14' }); return g; };
    const note = () => { const g = el('g', {}, s); el('rect', { x: -18, y: -11, width: 36, height: 22, rx: 3, fill: '#5fae6e', stroke: '#2f6b3d', 'stroke-width': 2 }, g); txt(g, 0, 5, 'US$', { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 800, fill: '#113a1d' }); return g; };
    const cL = coin(), nL = note(), cR = coin(), nR = note();
    // box
    el('rect', { x: 560, y: 215, width: 80, height: 62, rx: 4, fill: '#7f8a96', stroke: '#3a4152', 'stroke-width': 3 }, s);
    const lock = el('circle', { cx: 600, cy: 246, r: 8, fill: '#3a4152' }, s);
    const lid = el('rect', { x: 556, y: 207, width: 88, height: 10, rx: 3, fill: '#5d6a76' }, s);
    const cap1 = txt(s, 200, 334, '', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#c2412d' });
    const cap2 = txt(s, 600, 334, '', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#2f7d4f' });
    const q = txt(s, 330, 150, '?', { 'text-anchor': 'middle', 'font-size': 44, 'font-weight': 800, fill: '#c2412d', opacity: 0 });
    const pos = (g, x, y) => g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    const mix = (a, b, p) => a + (b - a) * p;
    function draw(t) {
      // left: A pays S$ over to B at t 0.5-2.5; B's US$ never moves
      const pl = ease(clamp((t - .5) / 2, 0, 1));
      pos(cL, mix(100, 300, pl), 232 - Math.sin(pl * Math.PI) * 30);
      pos(nL, 300, 262);
      q.setAttribute('opacity', t > 3 ? 1 : 0);
      cap1.textContent = t > 3 ? 'Paid. Never received.' : '';
      // right: both drop into the box, lock, then swap
      const a = ease(clamp((t - .5) / 1.5, 0, 1)), b = ease(clamp((t - 1.5) / 1.5, 0, 1)), sw = ease(clamp((t - 4) / 1.8, 0, 1));
      const inBox = t < 4;
      pos(cR, inBox ? mix(500, 585, a) : mix(585, 710, sw), inBox ? 232 - Math.sin(a * Math.PI) * 30 + a * 14 : 246 - Math.sin(sw * Math.PI) * 30);
      pos(nR, inBox ? mix(700, 615, b) : mix(615, 500, sw), inBox ? 232 - Math.sin(b * Math.PI) * 30 + b * 14 : 246 - Math.sin(sw * Math.PI) * 30);
      lid.setAttribute('y', t > 3.2 && t < 4 ? 207 : (t >= 4 ? 197 : 207));
      lock.setAttribute('fill', t > 3.2 && t < 4 ? '#c2412d' : (t >= 4 ? '#4fc26b' : '#3a4152'));
      cap2.textContent = t > 6 ? 'Both arrive, or neither does.' : (t > 3.2 ? 'Locked until both are in' : '');
    }
    if (reduced) { draw(7); return; }
    draw(0);
    const CYC = 9;
    whileVisible(s, (t) => draw(t % CYC));
  })();

  /* ---------- analogy: three friends and the dinner tab (netting) ---------- */
  (function () {
    const s = document.getElementById('tabSvg'); if (!s) return;
    el('rect', { x: 0, y: 0, width: 800, height: 360, fill: '#efe9dc' }, s);
    txt(s, 400, 30, 'Each friend owes the next one $10 (illustrative)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: '#111' });
    const N = [[400, 90, 'A', SKINS[0], '#2463d6'], [220, 270, 'B', SKINS[3], '#2f7d4f'], [580, 270, 'C', SKINS[1], '#c2412d']];
    // arrows A->B->C->A
    const arrows = [[0, 1], [1, 2], [2, 0]].map(([i, j]) => {
      const [x1, y1] = N[i], [x2, y2] = N[j];
      const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      const g = el('g', {}, s);
      el('line', { x1: x1 + ux * 46, y1: y1 + uy * 46, x2: x2 - ux * 52, y2: y2 - uy * 52, stroke: '#8a6d3b', 'stroke-width': 3, 'stroke-dasharray': '7 5' }, g);
      return { g, x1: x1 + ux * 46, y1: y1 + uy * 46, x2: x2 - ux * 52, y2: y2 - uy * 52 };
    });
    N.forEach(([x, y, l, sk, c]) => {
      el('circle', { cx: x, cy: y, r: 34, fill: c }, s);
      el('circle', { cx: x, cy: y - 4, r: 16, fill: sk }, s);
      el('path', { d: `M${x - 22} ${y + 22} Q${x} ${y + 2} ${x + 22} ${y + 22}`, fill: sk }, s);
      txt(s, x, y + 52, l, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: '#111' });
    });
    const coins = [0, 1, 2].map(() => { const g = el('g', {}, s); el('circle', { r: 13, fill: '#e0b65a', stroke: '#8a6d3b', 'stroke-width': 2 }, g); txt(g, 0, 5, '$10', { 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: '#5a3a14' }); return g; });
    const cap = txt(s, 400, 210, '', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: '#111' });
    const sub = txt(s, 400, 234, '', { 'text-anchor': 'middle', 'font-size': 13, fill: '#5d5a55' });
    function draw(t) {
      const net = t > 4.2;
      arrows.forEach((a, i) => a.g.setAttribute('opacity', net ? .15 : 1));
      coins.forEach((c, i) => {
        const a = arrows[i], p = net ? 0 : ease(clamp((t - .4 - i * .5) / 1.6, 0, 1));
        c.setAttribute('transform', `translate(${(a.x1 + (a.x2 - a.x1) * p).toFixed(1)} ${(a.y1 + (a.y2 - a.y1) * p).toFixed(1)})`);
        c.setAttribute('opacity', net ? 0 : (p > 0 ? 1 : 0));
      });
      cap.textContent = net ? 'Net: nobody pays anyone' : (t > 2.6 ? '3 payments, $30 moving' : '');
      sub.textContent = net ? 'Everyone ends up exactly where they started.' : '';
    }
    if (reduced) { draw(6); return; }
    draw(0);
    const CYC = 8;
    whileVisible(s, (t) => draw(t % CYC));
  })();
})();
