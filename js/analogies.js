/*
 * Animated analogy scenes, built with js/scene-kit.js. Each builder runs only if its <svg> is on the page.
 * All figures are generic illustrations. viewBox is 800 x 360.
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
  const ease = (k) => k < 0 ? 0 : k > 1 ? 1 : 1 - Math.pow(1 - k, 3);
  const small = (svg, x, F, k) => el('g', { transform: `translate(${x} ${F}) scale(${k}) translate(${-x} ${-F})` }, svg);

  /* ---------- stargate: the engagement announcement ---------- */
  (function () {
    const s = document.getElementById('engageSvg'); if (!s) return;
    const F = room(s, { h: 360, floor: 300, wall: '#f1e9ef', lower: '#e7dbe3', floorFill: '#cdbfa6' });
    // the happy couple
    person(s, 120, { floor: F, sh: 112, top: '#2b3f73', pants: '#26272b', tie: '#c2412d', hair: hair.short, skin: SKINS[1], arms: 'wave', delay: 0, smile: 4 });
    person(s, 210, { floor: F, sh: 118, top: '#c97b5a', pants: '#3a3833', hair: hair.long, skin: SKINS[0], arms: 'clasp', delay: .5, smile: 4 });
    const ring = origin(el('g', { class: 'sk-bob' }, s), 177, 60);
    el('circle', { cx: 177, cy: 56, r: 7, fill: 'none', stroke: '#e0b65a', 'stroke-width': 3 }, ring);
    el('path', { d: 'M177 44 l3 -6 l3 6 z', fill: '#bfe4ff' }, ring);
    bubble(s, 140, 66, "We're engaged!", { w: 160, size: 17 });
    // confetti
    const conf = [];
    for (let i = 0; i < 26; i++) conf.push(el('rect', { x: 0, y: 0, width: 7, height: 4, fill: ['#c2412d', '#e0b65a', '#2463d6', '#2f7d4f'][i % 4] }, s));
    // the paperwork nobody has signed
    el('rect', { x: 400, y: 214, width: 360, height: 12, fill: '#8a6d3b' }, s);
    el('rect', { x: 412, y: 226, width: 8, height: F - 226, fill: '#6e5530' }, s);
    el('rect', { x: 740, y: 226, width: 8, height: F - 226, fill: '#6e5530' }, s);
    const docs = ['Where do we live?', 'Whose name on the deed?', 'Who pays the mortgage?'];
    docs.forEach((d, i) => {
      const x = 420 + i * 112, g = el('g', {}, s);
      el('rect', { x, y: 112, width: 100, height: 100, rx: 3, fill: '#fff', stroke: '#b9b2a4', 'stroke-width': 1.5 }, g);
      [0, 1, 2].forEach((k) => el('line', { x1: x + 10, y1: 160 + k * 10, x2: x + 90, y2: 160 + k * 10, stroke: '#e1dbcf', 'stroke-width': 2 }, g));
      el('line', { x1: x + 14, y1: 198, x2: x + 86, y2: 198, stroke: '#76736c', 'stroke-width': 1, 'stroke-dasharray': '3 3' }, g);
      txt(g, x + 50, 205 - 4, 'sign here', { 'text-anchor': 'middle', 'font-size': 8, fill: '#9a958b' });
      const words = d.split(' '); const mid = Math.ceil(words.length / 2);
      txt(g, x + 50, 130, words.slice(0, mid).join(' '), { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: '#111' });
      txt(g, x + 50, 144, words.slice(mid).join(' '), { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: '#111' });
      const q = origin(el('g', { class: 'sk-bob' }, s), x + 50, 96); q.style.animationDelay = i * .4 + 's';
      txt(q, x + 50, 100, '?', { 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: '#c2412d' });
    });
    txt(s, 590, 334, 'Still unsigned', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#111' });
    txt(s, 165, 334, 'The announcement', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#111' });
    const seeds = conf.map((_, i) => ({ x: 60 + ((i * 53) % 280), sp: 40 + (i * 17) % 50, ph: (i * 0.37) % 3 }));
    if (reduced) { conf.forEach((c, i) => c.setAttribute('transform', `translate(${seeds[i].x} ${40 + (i * 23) % 200})`)); return; }
    whileVisible(s, (t) => conf.forEach((c, i) => {
      const sd = seeds[i], y = ((t + sd.ph) * sd.sp) % 260 + 10;
      c.setAttribute('transform', `translate(${sd.x + Math.sin(t * 2 + i) * 8} ${y}) rotate(${(t * 120 + i * 40) % 360})`);
    }));
  })();

  /* ---------- stargate: the landlord who bought the furniture ---------- */
  (function () {
    const s = document.getElementById('landlordSvg'); if (!s) return;
    el('rect', { x: 0, y: 0, width: 800, height: 360, fill: '#e3ecf2' }, s);
    const F = 300;
    el('rect', { x: 0, y: F, width: 800, height: 60, fill: '#b8b1a2' }, s);
    // the building, cut open
    el('rect', { x: 260, y: 60, width: 300, height: F - 60, fill: '#f4efe4', stroke: '#8a6d3b', 'stroke-width': 3 }, s);
    el('line', { x1: 260, y1: 180, x2: 560, y2: 180, stroke: '#8a6d3b', 'stroke-width': 3 }, s);
    el('path', { d: 'M248 60 L410 20 L572 60 Z', fill: '#5a3a26' }, s);
    // furniture that arrives one piece at a time (bought with the loan)
    const pieces = [];
    const sofa = el('g', {}, s); el('rect', { x: 290, y: 140, width: 90, height: 30, rx: 6, fill: '#2463d6' }, sofa); el('rect', { x: 290, y: 124, width: 90, height: 18, rx: 6, fill: '#1c4fae' }, sofa); pieces.push([sofa, 0]);
    const lamp = el('g', {}, s); el('rect', { x: 405, y: 110, width: 4, height: 60, fill: '#3a3833' }, lamp); el('path', { d: 'M392 112 L422 112 L414 92 L400 92 Z', fill: '#e0b65a' }, lamp); pieces.push([lamp, 1]);
    const tv = el('g', {}, s); el('rect', { x: 450, y: 100, width: 80, height: 50, rx: 3, fill: '#111' }, tv); el('rect', { x: 486, y: 150, width: 8, height: 20, fill: '#111' }, tv); pieces.push([tv, 2]);
    const bed = el('g', {}, s); el('rect', { x: 290, y: 262, width: 110, height: 26, rx: 4, fill: '#7a3b6e' }, bed); el('rect', { x: 290, y: 248, width: 26, height: 16, rx: 4, fill: '#fff' }, bed); pieces.push([bed, 3]);
    const fridge = el('g', {}, s); el('rect', { x: 480, y: 210, width: 46, height: 82, rx: 4, fill: '#cfd6dc', stroke: '#9aa3ad', 'stroke-width': 2 }, fridge); pieces.push([fridge, 4]);
    // landlord holding a very long loan
    person(s, 140, { floor: F, sh: 130, top: '#3a3833', pants: '#26272b', tie: '#7d2333', hair: hair.bald, skin: SKINS[2], arms: 'hold', delay: .2, smile: 1 });
    const loan = el('path', { d: 'M132 200 L148 200 L148 296 L132 296 Z', fill: '#fff', stroke: '#76736c' }, s);
    txt(s, 140, 214, 'LOAN', { 'text-anchor': 'middle', 'font-size': 9, 'font-weight': 800, fill: '#c2412d' });
    txt(s, 140, 334, 'The landlord', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#111' });
    // the famous tenant, leaking money
    person(s, 670, { floor: F, sh: 126, top: '#111', pants: '#26272b', hair: hair.cap, hairColor: '#e0b65a', skin: SKINS[0], arms: 'wave', delay: .6, smile: 4 });
    const star = origin(el('path', { class: 'sk-bob', d: 'M670 30 l5 11 l12 1 l-9 8 l3 12 l-11 -6 l-11 6 l3 -12 l-9 -8 l12 -1 z', fill: '#e0b65a' }, s), 670, 40);
    txt(s, 670, 334, 'The one famous tenant', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#111' });
    const coins = [0, 1, 2, 3].map(() => el('circle', { r: 6, fill: '#e0b65a', stroke: '#b8892b', 'stroke-width': 2 }, s));
    bubble(s, 700, 70, 'Love the place!', { left: true, w: 150, size: 16, delay: 1 });
    const loanLen = (k) => loan.setAttribute('d', `M132 200 L148 200 L148 ${200 + 96 * k} L132 ${200 + 96 * k} Z`);
    if (reduced) { loanLen(1); coins.forEach((c, i) => c.setAttribute('transform', `translate(${700 + i * 10} ${230 + i * 18})`)); return; }
    whileVisible(s, (t) => {
      const T = t % 9;
      pieces.forEach(([g, i]) => { const k = ease((T - 0.6 * i) / 0.6); g.setAttribute('transform', `translate(0 ${-140 * (1 - k)})`); g.setAttribute('opacity', k); });
      loanLen(0.2 + 0.8 * ease(T / 3.6));
      coins.forEach((c, i) => { const y = ((t * 60 + i * 30) % 120); c.setAttribute('transform', `translate(${704 + i * 6} ${200 + y})`); c.setAttribute('opacity', 1 - y / 120); });
    });
  })();

  /* ---------- glass-cloth: rebar in concrete ---------- */
  (function () {
    const s = document.getElementById('rebarSvg'); if (!s) return;
    el('rect', { x: 0, y: 0, width: 800, height: 360, fill: '#ece7dd' }, s);
    const slabs = [
      { x: 70, label: 'Resin only', sub: 'Like concrete with no steel', mesh: false },
      { x: 430, label: 'Resin + woven glass', sub: 'Like concrete with steel mesh', mesh: true },
    ];
    const parts = slabs.map((sl) => {
      const g = el('g', {}, s);
      el('rect', { x: sl.x + 10, y: 220, width: 26, height: 70, fill: '#8d8a84' }, g);
      el('rect', { x: sl.x + 264, y: 220, width: 26, height: 70, fill: '#8d8a84' }, g);
      const slab = el('path', { fill: '#cfc8b8', stroke: '#76736c', 'stroke-width': 2 }, g);
      const mesh = el('g', {}, g);
      if (sl.mesh) for (let i = 0; i < 14; i++) el('line', { x1: sl.x + 10 + i * 20, y1: 200, x2: sl.x + 20 + i * 20, y2: 218, stroke: '#4d8bff', 'stroke-width': 2 }, mesh);
      const flames = [0, 1, 2].map((i) => { const f = origin(el('path', { class: 'sk-bob', d: `M${sl.x + 90 + i * 60} 300 q-10 -18 0 -34 q10 16 0 34 z`, fill: '#e07b3a', opacity: 0 }, g), sl.x + 90 + i * 60, 300); f.style.animationDelay = i * .3 + 's'; return f; });
      txt(g, sl.x + 150, 330, sl.label, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: '#111' });
      txt(g, sl.x + 150, 348, sl.sub, { 'text-anchor': 'middle', 'font-size': 11, fill: '#5d5a55' });
      const heat = txt(g, sl.x + 150, 120, '', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: '#111' });
      return { sl, slab, mesh, flames, heat };
    });
    txt(s, 400, 60, 'Same heat underneath', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: '#5d5a55' });
    const draw = (p, sag) => {
      const x = p.sl.x, mid = 200 + sag, mid2 = 220 + sag;
      p.slab.setAttribute('d', `M${x} 200 Q${x + 150} ${mid * 2 - 200} ${x + 300} 200 L${x + 300} 220 Q${x + 150} ${mid2 * 2 - 220} ${x} 220 Z`);
      p.mesh.setAttribute('transform', `translate(0 ${sag * 0.5})`);
    };
    const state = (heatK) => parts.forEach((p) => {
      const sag = p.sl.mesh ? 2 * heatK : 34 * heatK;
      draw(p, sag);
      p.flames.forEach((f) => f.setAttribute('opacity', heatK > 0.05 ? 1 : 0));
      p.heat.textContent = heatK > 0.05 ? (p.sl.mesh ? 'Stays flat' : 'Bends') : 'Room temperature';
      p.heat.setAttribute('fill', heatK > 0.05 ? (p.sl.mesh ? '#2f7d4f' : '#c2412d') : '#76736c');
    });
    if (reduced) { state(1); return; }
    whileVisible(s, (t) => { const T = t % 8; state(T < 1.5 ? 0 : T < 4 ? ease((T - 1.5) / 2.5) : T < 6.5 ? 1 : 1 - ease((T - 6.5) / 1.5)); });
  })();

  /* ---------- glass-cloth: the bakery with the starter ---------- */
  (function () {
    const s = document.getElementById('bakerySvg'); if (!s) return;
    const F = room(s, { h: 360, floor: 300, wall: '#f5ecdf', lower: '#ecdfcc', floorFill: '#c9b89a' });
    el('line', { x1: 400, y1: 10, x2: 400, y2: F, stroke: '#d9c9ad', 'stroke-width': 3, 'stroke-dasharray': '8 8' }, s);
    const shop = (cx, name, sub, starter) => {
      // oven, counter, baker
      el('rect', { x: cx - 160, y: 120, width: 110, height: 110, rx: 8, fill: '#3a3833' }, s);
      el('rect', { x: cx - 148, y: 150, width: 86, height: 54, rx: 4, fill: '#e07b3a', opacity: .85 }, s);
      person(s, cx + 10, { floor: F, sh: 138, top: '#f7f5f0', pants: '#5d5a55', hair: starter ? hair.bun : hair.short, skin: SKINS[starter ? 4 : 2], arms: 'hold', delay: starter ? .4 : 0, smile: starter ? 4 : 0 });
      el('rect', { x: cx - 80, y: 222, width: 220, height: 12, fill: '#8a6d3b' }, s);
      el('rect', { x: cx - 70, y: 234, width: 8, height: F - 234, fill: '#6e5530' }, s);
      el('rect', { x: cx + 122, y: 234, width: 8, height: F - 234, fill: '#6e5530' }, s);
      // same ingredients on the counter
      el('rect', { x: cx + 70, y: 192, width: 26, height: 30, rx: 3, fill: '#fff', stroke: '#b9b2a4' }, s);
      txt(s, cx + 83, 211, 'flour', { 'text-anchor': 'middle', 'font-size': 8, fill: '#5d5a55' });
      if (starter) {
        el('rect', { x: cx + 102, y: 188, width: 28, height: 34, rx: 6, fill: '#f4ead2', stroke: '#b8892b', 'stroke-width': 2 }, s);
        for (let i = 0; i < 4; i++) { const b = origin(el('circle', { class: 'sk-bob', cx: cx + 110 + (i % 2) * 10, cy: 200 + (i > 1 ? 10 : 0), r: 3, fill: '#e0b65a' }, s), cx + 116, 205); b.style.animationDelay = i * .3 + 's'; }
        txt(s, cx + 116, 184, 'starter', { 'text-anchor': 'middle', 'font-size': 8, 'font-weight': 700, fill: '#b8892b' });
      }
      const loaf = el('ellipse', { cx: cx - 30, cy: 222, rx: 30, ry: 6, fill: '#c98a3b', stroke: '#8a5a1f', 'stroke-width': 2 }, s);
      txt(s, cx, 326, name, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#111' });
      txt(s, cx, 344, sub, { 'text-anchor': 'middle', 'font-size': 11, fill: '#5d5a55' });
      return loaf;
    };
    const flat = shop(200, 'Competitor', 'Same flour, same oven', false);
    const tall = shop(600, 'The one with the starter', 'Decades of know-how', true);
    const rise = (k) => {
      tall.setAttribute('ry', 6 + 22 * k); tall.setAttribute('cy', 222 - 22 * k);
      flat.setAttribute('ry', 6 + 4 * k); flat.setAttribute('cy', 222 - 4 * k);
    };
    bubble(s, 640, 96, 'Rises every time.', { left: true, w: 170, size: 15, delay: 1.5 });
    bubble(s, 220, 96, 'Why is mine flat?', { w: 170, size: 15 });
    if (reduced) { rise(1); return; }
    whileVisible(s, (t) => { const T = t % 7; rise(T < 1 ? 0 : T < 4 ? ease((T - 1) / 3) : T < 6 ? 1 : 1 - ease((T - 6) / 1)); });
  })();

  /* ---------- implants: the breathalyser in the truck ---------- */
  (function () {
    const s = document.getElementById('truckSvg'); if (!s) return;
    el('rect', { x: 0, y: 0, width: 800, height: 360, fill: '#dfe9ef' }, s);
    el('rect', { x: 0, y: 270, width: 800, height: 90, fill: '#4a4f59' }, s);
    const dashes = el('g', {}, s);
    for (let i = 0; i < 12; i++) el('rect', { x: i * 80, y: 312, width: 44, height: 6, fill: '#f4efe4' }, dashes);
    // the truck
    const truck = el('g', {}, s);
    el('rect', { x: 60, y: 120, width: 250, height: 140, rx: 6, fill: '#c2412d' }, truck);
    el('path', { d: 'M310 150 L380 150 L410 200 L410 260 L310 260 Z', fill: '#2463d6' }, truck);
    el('path', { d: 'M322 160 L374 160 L396 198 L322 198 Z', fill: '#cfe4f2' }, truck);
    const cab = small(truck, 355, 240, .55);
    person(cab, 355, { floor: 330, sh: 182, top: '#2f6d5f', pants: '#26272b', hair: hair.cap, skin: SKINS[1], arms: 'side', seated: 1, delay: .2, smile: 2 });
    const wheels = [110, 250, 370].map((x) => { const w = el('g', {}, truck); el('circle', { cx: x, cy: 262, r: 22, fill: '#111' }, w); el('rect', { x: x - 3, y: 244, width: 6, height: 36, fill: '#76736c' }, w); return { w, x }; });
    // the dashboard readout
    const panel = el('g', {}, s);
    el('rect', { x: 470, y: 40, width: 290, height: 190, rx: 10, fill: '#0d0d0f' }, panel);
    txt(panel, 490, 70, 'CAB SENSOR', { 'font-size': 12, 'font-weight': 800, fill: '#8d8a84', 'letter-spacing': 2 });
    const rows = [['Fatigue', 'OK  ✓', '#4fc26b'], ['Focus score', '62 / 100', '#ff7a63'], ['Mood', 'Low', '#ff7a63'], ['Loyalty', '??', '#ff7a63']];
    const rowEls = rows.map(([k, v, c], i) => {
      const g = el('g', {}, panel);
      txt(g, 490, 104 + i * 32, k, { 'font-size': 15, fill: '#fff' });
      txt(g, 740, 104 + i * 32, v, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 800, fill: c });
      return g;
    });
    const caption = txt(s, 400, 350, '', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#f4efe4' });
    const say = bubble(s, 372, 150, 'Wait, what?', { left: true, w: 120, size: 15 });
    say.classList.remove('sk-bubble'); say.setAttribute('opacity', 0);
    const set = (creep, t) => {
      rowEls.forEach((g, i) => g.setAttribute('opacity', i === 0 ? 1 : creep));
      say.setAttribute('opacity', creep);
      caption.textContent = creep > .5 ? 'Same sensor, used to rate you: that is where the fight starts' : 'Checks one thing, for safety: few people object';
      const moving = creep < .5;
      dashes.setAttribute('transform', `translate(${moving ? -((t * 160) % 80) : 0} 0)`);
      wheels.forEach(({ w, x }) => w.setAttribute('transform', `rotate(${moving ? (t * 360) % 360 : 0} ${x} 262)`));
    };
    if (reduced) { set(1, 0); return; }
    whileVisible(s, (t) => { const T = t % 10; set(T < 5 ? 0 : T < 5.6 ? ease((T - 5) / .6) : T < 9.4 ? 1 : 1 - ease((T - 9.4) / .6), t); });
  })();
})();
