/*
 * Cartoon scenes for the P&I clubs explainer, built with js/scene-kit.js.
 * Generic figures, not real people. Scripted motion only runs while on screen;
 * reduced-motion shows the end state.
 */
(function () {
  const K = window.SceneKit; if (!K) return;
  const { el, txt, origin, person, bubble, room, hair, SKINS } = K;
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

  /* ---------- story scene: a club's claims desk, the morning of 26 March 2024 ---------- */
  (function () {
    const s = document.getElementById('piSceneSvg'); if (!s) return;
    const F = room(s, { wall: '#e4e9ee', lower: '#d6dde4', floorFill: '#b9b4a6' });
    // window with a harbour skyline
    el('rect', { x: 30, y: 40, width: 170, height: 150, fill: '#bcd7ee', stroke: '#8b97a3', 'stroke-width': 4 }, s);
    el('rect', { x: 30, y: 140, width: 170, height: 50, fill: '#5f86a8' }, s);
    el('rect', { x: 60, y: 118, width: 90, height: 22, fill: '#2b3f73' }, s);
    [[64, 100], [82, 100], [100, 100], [118, 100]].forEach(([x, y]) => el('rect', { x, y, width: 14, height: 18, fill: ['#c2412d', '#e0b65a', '#2463d6', '#2f7d4f'][(x / 18 | 0) % 4] }, s));
    el('line', { x1: 115, y1: 40, x2: 115, y2: 190, stroke: '#8b97a3', 'stroke-width': 4 }, s);
    // the big screen
    el('rect', { x: 270, y: 34, width: 270, height: 200, rx: 8, fill: '#0b0d12', stroke: '#3a4152', 'stroke-width': 4 }, s);
    txt(s, 288, 68, 'CLAIM OPENED', { 'font-size': 14, 'font-weight': 700, fill: '#8d8a84', 'letter-spacing': 3 });
    txt(s, 288, 94, 'Dali · Baltimore · 26 Mar 2024', { 'font-size': 15, 'font-weight': 700, fill: '#fff' });
    txt(s, 405, 170, '~$1.5bn', { 'text-anchor': 'middle', 'font-size': 62, 'font-weight': 800, fill: '#e0b65a' });
    txt(s, 405, 198, 'first reserve, as reported', { 'text-anchor': 'middle', 'font-size': 14, fill: '#8d8a84' });
    txt(s, 405, 222, '12 clubs + reinsurers share it', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600, fill: '#cfcbc3' });
    const glow = el('rect', { class: 'sk-flash', x: 290, y: 118, width: 230, height: 66, rx: 8, fill: '#e0b65a', opacity: 0 }, s);
    glow.style.mixBlendMode = 'screen';
    // desk with two claims handlers
    person(s, 120, { floor: F, sh: 238, top: '#2b3f73', pants: '#1a1c22', tie: '#c2412d', hair: hair.short, hairColor: '#222', skin: SKINS[1], arms: 'type', delay: .2, smile: 1 });
    person(s, 235, { floor: F, sh: 236, top: '#3a3833', pants: '#1a1c22', hair: hair.bun, hairColor: '#3b2a20', skin: SKINS[3], arms: 'type', delay: .7, smile: 1 });
    el('rect', { x: 50, y: 304, width: 270, height: 12, fill: '#5a4632' }, s);
    el('rect', { x: 64, y: 316, width: 8, height: F - 316, fill: '#3e3022' }, s);
    el('rect', { x: 298, y: 316, width: 8, height: F - 316, fill: '#3e3022' }, s);
    [[136, '#9aa3ad'], [250, '#9aa3ad']].forEach(([x, c]) => {
      el('path', { d: `M${x - 26} 304 L${x - 20} 276 L${x + 30} 276 L${x + 36} 304 Z`, fill: c }, s);
      el('rect', { x: x - 20, y: 280, width: 50, height: 4, fill: '#4fc26b', class: 'sk-blink' }, s);
    });
    bubble(s, 130, 186, 'Open the file.', { w: 140, size: 16, delay: .4 });
    // a manager on the phone to the other clubs
    person(s, 690, { floor: F, sh: 270, top: '#e0b65a', pants: '#2b2b30', hair: hair.long, hairColor: '#2b1d16', skin: SKINS[0], arms: 'wave', delay: 0, smile: 0, talk: true });
    bubble(s, 675, 196, 'Call the pool.', { left: true, w: 150, size: 16, delay: 2.6 });
    // a third colleague with a folder
    person(s, 770, { floor: F, sh: 272, top: '#3d6b52', pants: '#2b2b30', hair: hair.short, hairColor: '#111', skin: SKINS[2], arms: 'hold', delay: .4, smile: 0 });
    el('rect', { x: 748, y: 330, width: 40, height: 28, rx: 2, fill: '#e8dcc0', stroke: '#8a6d3b', 'stroke-width': 2 }, s);
  })();

  /* ---------- analogy: buckets that overflow into bigger buckets ---------- */
  (function () {
    const s = document.getElementById('bucketsSvg'); if (!s) return;
    el('rect', { x: 0, y: 0, width: 800, height: 360, fill: '#e8eef3' }, s);
    el('rect', { x: 0, y: 330, width: 800, height: 30, fill: '#b8b1a2' }, s);
    const B = [
      { x: 50, w: 100, top: 110, h: 90, cap: 2, name: 'Club', sub: 'pays the first $10m' },
      { x: 220, w: 120, top: 160, h: 120, cap: 3, name: 'Pool', sub: 'the 12 clubs share the next $90m' },
      { x: 410, w: 190, top: 200, h: 130, cap: 7, name: 'Reinsurers', sub: 'take the next $2bn' },
      { x: 660, w: 110, top: 240, h: 90, cap: 3, name: 'Overspill', sub: 'last $1bn' },
    ];
    // pipe + tap
    el('rect', { x: 92, y: 30, width: 16, height: 60, fill: '#8d98a3' }, s);
    el('rect', { x: 80, y: 24, width: 40, height: 10, rx: 3, fill: '#5d6a76' }, s);
    const drip = el('circle', { cx: 100, cy: 90, r: 5, fill: '#2463d6' }, s);
    const water = B.map((b) => {
      const w = el('rect', { x: b.x + 3, y: b.top + b.h - 3, width: b.w - 6, height: 0, fill: '#4d8bff', opacity: .85 }, s);
      return w;
    });
    B.forEach((b, i) => {
      el('path', { d: `M${b.x} ${b.top} L${b.x + 6} ${b.top + b.h} L${b.x + b.w - 6} ${b.top + b.h} L${b.x + b.w} ${b.top}`, fill: 'none', stroke: i === 3 ? '#c2412d' : '#3a4152', 'stroke-width': 4, 'stroke-linejoin': 'round', 'stroke-dasharray': i === 3 ? '8 5' : '0' }, s);
      txt(s, b.x + b.w / 2, b.top + b.h + 22, b.name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#111' });
    });
    const streams = [[0, 1], [1, 2], [2, 3]].map(([a, b]) => {
      const x0 = B[a].x + B[a].w, y0 = B[a].top, x1 = B[b].x + B[b].w * .3, y1 = B[b].top + 4;
      return el('path', { d: `M${x0} ${y0} Q${x0 + 24} ${y0 - 4} ${(x0 + x1) / 2 + 6} ${(y0 + y1) / 2} T${x1} ${y1}`, stroke: '#4d8bff', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round', 'stroke-dasharray': '10 6', opacity: 0 }, s);
    });
    txt(s, 780, 24, 'Not to scale. 2024/25 layers.', { 'text-anchor': 'end', 'font-size': 11, fill: '#5d5a55' });
    const LIM = 14.1, CYC = 18; // overspill ends 70% full, like the Dali claim
    function draw(t) {
      const w = Math.min(t, LIM);
      const amt = [Math.min(w, 2), clamp(w - 2, 0, 3), clamp(w - 5, 0, 7), clamp(w - 12, 0, 3)];
      B.forEach((b, i) => {
        const h = (b.h - 6) * (amt[i] / b.cap);
        water[i].setAttribute('height', h.toFixed(1)); water[i].setAttribute('y', (b.top + b.h - 3 - h).toFixed(1));
      });
      const full = [amt[0] >= 2, amt[1] >= 3, amt[2] >= 7];
      streams.forEach((st, i) => { st.setAttribute('opacity', full[i] && amt[i + 1] < B[i + 1].cap ? 1 : 0); st.setAttribute('stroke-dashoffset', (-t * 30).toFixed(0)); });
      drip.setAttribute('cy', 40 + ((t * 70) % 50)); drip.setAttribute('opacity', t < LIM ? 1 : 0);
    }
    if (reduced) { draw(LIM); streams.forEach((st) => st.setAttribute('opacity', 0)); drip.setAttribute('opacity', 0); return; }
    draw(0);
    whileVisible(s, (t) => draw(t % CYC < CYC - 1 ? (t % CYC) : 0));
  })();

  /* ---------- analogy: the street's roof fund (a mutual) ---------- */
  (function () {
    const s = document.getElementById('kittySvg'); if (!s) return;
    el('rect', { x: 0, y: 0, width: 800, height: 360, fill: '#e6edf2' }, s);
    const F = 300;
    el('rect', { x: 0, y: F, width: 800, height: 60, fill: '#b8b1a2' }, s);
    [40, 210, 380].forEach((x, i) => {
      el('rect', { x, y: 180, width: 130, height: 120, fill: ['#f4efe4', '#efe6d4', '#f1ecdf'][i], stroke: '#8a6d3b', 'stroke-width': 3 }, s);
      el('path', { d: `M${x - 10} 182 L${x + 65} 112 L${x + 140} 182 Z`, fill: '#5a3a26' }, s);
      el('rect', { x: x + 20, y: 220, width: 30, height: 36, fill: '#bcd7ee', stroke: '#8a6d3b', 'stroke-width': 2 }, s);
    });
    // storm over the middle house
    const cloud = el('g', { opacity: 0 }, s);
    [[250, 60, 26], [278, 52, 32], [308, 62, 24]].forEach(([cx, cy, r]) => el('circle', { cx, cy, r, fill: '#6b7683' }, cloud));
    const bolt = el('path', { d: 'M282 82 L270 112 L284 112 L276 146', stroke: '#e0b65a', 'stroke-width': 5, fill: 'none', 'stroke-linejoin': 'round', opacity: 0 }, s);
    const hole = el('ellipse', { cx: 275, cy: 150, rx: 18, ry: 11, fill: '#1a1a1d', opacity: 0 }, s);
    const patch = el('g', { opacity: 0 }, s);
    el('rect', { x: 255, y: 140, width: 40, height: 22, rx: 3, fill: '#2f7d4f' }, patch);
    txt(patch, 275, 156, 'fixed', { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: '#fff' });
    // the kitty
    el('path', { d: 'M592 230 Q586 232 588 250 L592 296 L668 296 L672 250 Q674 232 668 230 Z', fill: '#cfe3d6', stroke: '#3a4152', 'stroke-width': 3 }, s);
    el('rect', { x: 586, y: 220, width: 88, height: 12, rx: 4, fill: '#8a6d3b' }, s);
    const jarCoins = el('g', {}, s);
    txt(s, 630, 322, 'Shared kitty', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#111' });
    txt(s, 275, 322, 'Three neighbours, one roof fund', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#111' });
    // neighbours, scaled around their feet
    const px = [150, 320, 490];
    [[SKINS[1], '#2b3f73', hair.short], [SKINS[3], '#c97b5a', hair.long], [SKINS[0], '#3d6b52', hair.bun]].forEach(([skin, top, hr], i) => {
      person(small(s, px[i], F, .5), px[i], { floor: F, sh: 130, top, pants: '#3a3833', hair: hr, skin, arms: 'side', delay: i * .4, smile: 3 });
    });
    const coin = () => el('circle', { r: 7, fill: '#e0b65a', stroke: '#8a6d3b', 'stroke-width': 2, opacity: 0 }, s);
    const inCoins = px.flatMap((x, i) => [0, 1, 2].map((k) => ({ c: coin(), x0: x, y0: 214, t0: 1.2 + i * .3 + k * .35 })));
    const outCoins = [0, 1, 2, 3, 4].map((k) => ({ c: coin(), t0: 4.2 + k * .4 }));
    const arc = (c, x0, y0, x1, y1, p, lift) => { c.setAttribute('cx', (x0 + (x1 - x0) * p).toFixed(1)); c.setAttribute('cy', (y0 + (y1 - y0) * p - Math.sin(Math.PI * p) * lift).toFixed(1)); };
    function draw(t) {
      const T = t % 10;
      cloud.setAttribute('opacity', T < 7 ? clamp(T / .5, 0, 1) : clamp(1 - (T - 7) / 1.2, 0, 1));
      bolt.setAttribute('opacity', T > .5 && T < .75 ? 1 : 0);
      hole.setAttribute('opacity', T > .7 && T < 6.6 ? 1 : 0);
      patch.setAttribute('opacity', T >= 6.6 ? 1 : 0);
      inCoins.forEach((o) => { const p = (T - o.t0) / 1.4; o.c.setAttribute('opacity', p > 0 && p < 1 ? 1 : 0); if (p > 0 && p < 1) arc(o.c, o.x0, o.y0, 630, 226, p, 120); });
      outCoins.forEach((o) => { const p = (T - o.t0) / 1.2; o.c.setAttribute('opacity', p > 0 && p < 1 ? 1 : 0); if (p > 0 && p < 1) arc(o.c, 630, 226, 275, 150, p, 90); });
      const n = Math.min(inCoins.filter((o) => T > o.t0 + 1.4).length, 9) - Math.min(outCoins.filter((o) => T > o.t0 + 1.2).length, 5);
      jarCoins.replaceChildren();
      for (let k = 0; k < Math.max(n, 0); k++) el('circle', { cx: 606 + (k % 4) * 16, cy: 288 - Math.floor(k / 4) * 11, r: 7, fill: '#e0b65a', stroke: '#8a6d3b', 'stroke-width': 2 }, jarCoins);
    }
    if (reduced) { draw(8); return; }
    draw(0);
    whileVisible(s, draw);
  })();
})();
