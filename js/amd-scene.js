/*
 * Cartoon scenes for the AMD explainer, built with js/scene-kit.js. Generic figures, not real people.
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

  /* ---------- 2017: the Zen launch ---------- */
  (function () {
    const s = document.getElementById('zenSvg'); if (!s) return;
    const F = room(s, { wall: '#1c1b22', lower: '#141318', floorFill: '#2a2830' });
    // spotlight
    el('path', { d: 'M180 0 L80 402 L300 402 Z', fill: '#fff', opacity: .05 }, s);
    // stage
    el('rect', { x: 20, y: 330, width: 440, height: 22, fill: '#3a3833' }, s);
    // big screen with the target vs result bars
    el('rect', { x: 250, y: 30, width: 360, height: 206, rx: 6, fill: '#0b0b0e', stroke: '#3a3833', 'stroke-width': 4 }, s);
    txt(s, 274, 64, 'MORE WORK PER CLOCK', { 'font-size': 13, 'font-weight': 800, fill: '#8d8a84', 'letter-spacing': 2 });
    txt(s, 274, 80, 'vs AMD’s previous design', { 'font-size': 11, fill: '#5d5a55' });
    const bars = [[104, '#8d8a84', 'Target', '+40%', 160], [150, '#e01e2b', 'Delivered', '+52%', 208]];
    const grow = [];
    bars.forEach(([y, c, l, v, w]) => {
      txt(s, 274, y + 16, l, { 'font-size': 13, 'font-weight': 700, fill: '#cfcbc3' });
      const r = el('rect', { x: 352, y, width: reduced ? w : 0, height: 24, fill: c }, s); grow.push([r, w]);
      txt(s, 352 + w + 8, y + 18, v, { 'font-size': 16, 'font-weight': 800, fill: c });
    });
    txt(s, 274, 216, 'ZEN · 2017', { 'font-size': 18, 'font-weight': 800, fill: '#fff', 'letter-spacing': 3 });
    // presenter on stage holding a chip box
    person(s, 150, { floor: 330, sh: 214, top: '#111', pants: '#26272b', hair: hair.short, hairColor: '#1b1b1b', skin: SKINS[1], arms: 'hold', delay: .2, smile: 4 });
    el('rect', { x: 128, y: 266, width: 44, height: 34, rx: 3, fill: '#e01e2b' }, s);
    txt(s, 150, 288, 'ZEN', { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: '#fff' });
    bubble(s, 150, 176, 'We beat it!', { left: true, w: 140, size: 16, delay: .8 });
    // audience: scaled-down engineers, cheering
    const crowd = [[590, SKINS[0], hair.long, '#6b8f71', 'wave'], [650, SKINS[3], hair.cap, '#2463d6', 'side'], [710, SKINS[2], hair.bun, '#c97b5a', 'wave'], [765, SKINS[4], hair.short, '#5d5a55', 'clasp']];
    crowd.forEach(([x, skin, hr, top, arms], i) => {
      const g = el('g', { transform: `translate(${x} ${F}) scale(.62) translate(${-x} ${-F})` }, s);
      person(g, x, { floor: F, sh: 200, top, pants: '#26272b', hair: hr, skin, arms, delay: i * .4, smile: 4, badge: 1 });
    });
    if (!reduced) {
      let done = false;
      new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting || done) return; done = true;
        grow.forEach(([r, w], i) => r.animate([{ width: '0px' }, { width: w + 'px' }], { duration: 900, delay: 400 + i * 600, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }));
        setTimeout(() => grow.forEach(([r, w]) => r.setAttribute('width', w)), 2200);
      }), { threshold: .3 }).observe(s.closest('.scene'));
    }
  })();

  /* ---------- analogy: riding in the slipstream ---------- */
  (function () {
    const s = document.getElementById('draftSvg'); if (!s) return;
    el('rect', { x: 0, y: 0, width: 800, height: 360, fill: '#dfeaf2' }, s);
    el('rect', { x: 0, y: 230, width: 800, height: 130, fill: '#8f8a80' }, s);
    el('rect', { x: 0, y: 226, width: 800, height: 6, fill: '#6e6a62' }, s);
    const dashes = el('g', {}, s);
    for (let i = 0; i < 12; i++) el('rect', { x: i * 80, y: 300, width: 44, height: 6, fill: '#f2efe8' }, dashes);
    // wind lines hitting the leader
    const wind = el('g', {}, s);
    const wl = [];
    for (let i = 0; i < 6; i++) wl.push(el('line', { x1: 0, y1: 120 + i * 18, x2: 50, y2: 120 + i * 18, stroke: '#8fa9bd', 'stroke-width': 3, 'stroke-linecap': 'round' }, wind));
    txt(s, 690, 60, 'Wind', { 'font-size': 14, 'font-weight': 700, fill: '#5b7a91', 'text-anchor': 'middle' });
    function rider(col, label) {
      const g = el('g', {}, s);
      const wheels = [];
      [-34, 34].forEach((dx) => {
        const w = el('g', {}, g);
        el('circle', { cx: dx, cy: 0, r: 26, fill: 'none', stroke: '#222', 'stroke-width': 5 }, w);
        el('line', { x1: dx - 26, y1: 0, x2: dx + 26, y2: 0, stroke: '#555', 'stroke-width': 2 }, w);
        el('line', { x1: dx, y1: -26, x2: dx, y2: 26, stroke: '#555', 'stroke-width': 2 }, w);
        wheels.push([w, dx]);
      });
      el('path', { d: 'M-34 0 L-6 -34 L24 -34 L34 0 M-6 -34 L0 0 L-34 0', fill: 'none', stroke: col, 'stroke-width': 5, 'stroke-linejoin': 'round' }, g);
      el('path', { d: 'M-8 -40 Q8 -78 30 -66', stroke: col, 'stroke-width': 18, fill: 'none', 'stroke-linecap': 'round' }, g); // back
      el('circle', { cx: 40, cy: -70, r: 13, fill: '#e9c4a0' }, g);
      el('path', { d: 'M28 -76 Q40 -92 54 -76 Z', fill: col }, g);
      const leg = el('line', { x1: -6, y1: -40, x2: 0, y2: 0, stroke: '#26272b', 'stroke-width': 9, 'stroke-linecap': 'round' }, g);
      txt(g, 0, 56, label, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: '#111' });
      return { g, wheels, leg };
    }
    const lead = rider('#2463d6', 'Intel');
    const follow = rider('#e01e2b', 'AMD');
    const effortL = txt(s, 0, 0, 'Pushing hard', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#2463d6' });
    const effortF = txt(s, 0, 0, 'Easy ride', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#e01e2b' });
    function pose(t) {
      // 0-6s: follower drafts behind; 6-9s: pulls out and draws level; 9-10s: hold, then loop
      const c = t % 10;
      const lx = 470, ly = 230;
      let fx = lx - 150, fy = ly, out = 0;
      if (c > 6) { out = Math.min(1, (c - 6) / 2.5); fx = lx - 150 + 150 * out; fy = ly + 40 * out; }
      const bob = (k) => Math.sin(t * 9 + k) * 1.5;
      lead.g.setAttribute('transform', `translate(${lx} ${ly - 26 + bob(0)})`);
      follow.g.setAttribute('transform', `translate(${fx} ${fy - 26 + bob(1)})`);
      [lead, follow].forEach((r, i) => {
        const a = t * (i ? (out > 0 ? 520 : 360) : 520);
        r.wheels.forEach(([w, dx]) => w.setAttribute('transform', `rotate(${a} ${dx} 0)`));
        r.leg.setAttribute('x2', Math.cos(a * Math.PI / 180) * 10); r.leg.setAttribute('y2', Math.sin(a * Math.PI / 180) * 10);
      });
      effortL.setAttribute('x', lx); effortL.setAttribute('y', ly - 132);
      effortF.setAttribute('x', fx); effortF.setAttribute('y', fy - 132);
      effortF.textContent = out > .4 ? 'Into the wind!' : 'Easy ride';
      wl.forEach((l, i) => { const x = 820 - ((t * 260 + i * 70) % 380); l.setAttribute('x1', x); l.setAttribute('x2', x + 46); l.setAttribute('opacity', x < lx + 60 ? 0 : 1); });
      dashes.setAttribute('transform', `translate(${-(t * 220) % 80} 0)`);
    }
    pose(reduced ? 3 : 0);
    if (!reduced) whileVisible(s, pose);
  })();
})();
