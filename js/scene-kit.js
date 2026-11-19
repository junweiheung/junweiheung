/*
 * Bottleneck scene kit: flat, animated cartoon scenes for explainers.
 * Load before a page's own script. Draw into an <svg> inside <figure class="fig rv scene">;
 * the page's reveal-on-scroll adds .in-view, which starts the animations in css/scene-kit.css.
 * People are generic and stylised: never a likeness of a real person.
 */
window.SceneKit = (function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a = {}, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const txt = (p, x, y, s, a = {}) => { const t = el('text', Object.assign({ x, y, 'font-family': 'Inter' }, a), p); t.textContent = s; return t; };
  const origin = (node, x, y) => { node.style.transformOrigin = `${x}px ${y}px`; return node; };

  const SKINS = ['#efc8a2', '#d9a77f', '#b07a52', '#8a5a3b', '#f3d2b3'];
  const hair = {
    short: (g, x, y, c = '#3b2a20') => el('path', { d: `M${x - 20} ${y - 2} Q${x - 22} ${y - 30} ${x} ${y - 28} Q${x + 22} ${y - 30} ${x + 20} ${y - 2} Q${x + 12} ${y - 16} ${x} ${y - 17} Q${x - 12} ${y - 16} ${x - 20} ${y - 2} Z`, fill: c }, g),
    long: (g, x, y, c = '#2b1d16') => { el('path', { d: `M${x - 22} ${y + 26} Q${x - 28} ${y - 30} ${x} ${y - 29} Q${x + 28} ${y - 30} ${x + 22} ${y + 26} L${x + 14} ${y + 26} Q${x + 18} ${y - 12} ${x} ${y - 16} Q${x - 18} ${y - 12} ${x - 14} ${y + 26} Z`, fill: c }, g); },
    bun: (g, x, y, c = '#4a3020') => { el('circle', { cx: x, cy: y - 30, r: 9, fill: c }, g); hair.short(g, x, y, c); },
    bald: (g, x, y) => { el('path', { d: `M${x - 20} ${y + 2} Q${x - 21} ${y - 10} ${x - 15} ${y - 14}`, stroke: '#555', 'stroke-width': 4, fill: 'none' }, g); el('path', { d: `M${x + 20} ${y + 2} Q${x + 21} ${y - 10} ${x + 15} ${y - 14}`, stroke: '#555', 'stroke-width': 4, fill: 'none' }, g); },
    cap: (g, x, y, c = '#2463d6') => { el('path', { d: `M${x - 21} ${y - 6} Q${x - 20} ${y - 30} ${x} ${y - 30} Q${x + 20} ${y - 30} ${x + 21} ${y - 6} Z`, fill: c }, g); el('rect', { x: x - 2, y: y - 10, width: 34, height: 6, rx: 3, fill: c }, g); },
    hardhat: (g, x, y, c = '#e0b65a') => { el('path', { d: `M${x - 24} ${y - 8} Q${x - 22} ${y - 34} ${x} ${y - 34} Q${x + 22} ${y - 34} ${x + 24} ${y - 8} Z`, fill: c }, g); el('rect', { x: x - 28, y: y - 10, width: 56, height: 6, rx: 3, fill: c }, g); },
    headset: (g, x, y, c = '#3b2a20') => { hair.short(g, x, y, c); el('path', { d: `M${x - 22} ${y} Q${x - 24} ${y - 34} ${x} ${y - 34} Q${x + 24} ${y - 34} ${x + 22} ${y}`, stroke: '#111', 'stroke-width': 4, fill: 'none' }, g); el('rect', { x: x - 27, y: y - 6, width: 9, height: 16, rx: 3, fill: '#111' }, g); el('rect', { x: x + 18, y: y - 6, width: 9, height: 16, rx: 3, fill: '#111' }, g); },
  };

  /*
   * person(svg, x, o) draws a standing (or seated) figure whose feet touch o.floor.
   * o: sh (shoulder y), top (shirt/jacket colour), pants, tie (or null), shoes, skin, hair (fn), hairColor,
   *    arms: 'clasp' | 'side' | 'wave' | 'type' | 'hold', seated (bool), smile, delay, talk (bool), coat (lab coat).
   */
  function person(svg, x, o) {
    const floor = o.floor, sh = o.sh, hy = sh - 34, skin = o.skin || SKINS[0];
    const hip = o.seated ? sh + 70 : sh + 108;
    const g = el('g', { class: 'sk-who' }, svg); g.style.animationDelay = (o.delay || 0) + 's';
    if (!o.seated) {
      el('rect', { x: x - 17, y: hip - 4, width: 15, height: floor - hip, fill: o.pants }, g);
      el('rect', { x: x + 2, y: hip - 4, width: 15, height: floor - hip, fill: o.pants }, g);
      el('ellipse', { cx: x - 11, cy: floor - 2, rx: 13, ry: 6, fill: o.shoes || '#111' }, g);
      el('ellipse', { cx: x + 11, cy: floor - 2, rx: 13, ry: 6, fill: o.shoes || '#111' }, g);
    }
    el('rect', { x: x - 8, y: hy + 16, width: 16, height: 24, fill: skin }, g);
    el('path', { d: `M${x - 36} ${sh + 14} Q${x - 36} ${sh} ${x - 22} ${sh - 2} L${x + 22} ${sh - 2} Q${x + 36} ${sh} ${x + 36} ${sh + 14} L${x + 31} ${hip + 6} L${x - 31} ${hip + 6} Z`, fill: o.top }, g);
    if (o.tie !== undefined) {
      el('path', { d: `M${x - 13} ${sh - 2} L${x + 13} ${sh - 2} L${x} ${sh + 48} Z`, fill: '#f7f5f0' }, g);
      if (o.tie) el('path', { d: `M${x} ${sh + 4} l-5 6 l3 34 l2 6 l2 -6 l3 -34 z`, fill: o.tie }, g);
    }
    if (o.badge) el('rect', { x: x + 12, y: sh + 24, width: 14, height: 18, rx: 2, fill: '#fff', stroke: '#2463d6', 'stroke-width': 2 }, g);
    const armCol = o.top;
    const arm = (d, cls, ox, oy) => { const a = el('g', cls ? { class: cls } : {}, g); if (cls) origin(a, ox, oy); el('path', { d, stroke: armCol, 'stroke-width': 16, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' }, a); return a; };
    const hand = (p, cx, cy) => el('circle', { cx, cy, r: 8, fill: skin }, p);
    const A = o.arms || 'side';
    if (A === 'clasp') {
      arm(`M${x - 33} ${sh + 10} L${x - 37} ${sh + 64} L${x - 7} ${sh + 94}`);
      arm(`M${x + 33} ${sh + 10} L${x + 37} ${sh + 64} L${x + 7} ${sh + 94}`);
      el('ellipse', { cx: x, cy: sh + 96, rx: 13, ry: 9, fill: skin }, g);
    } else if (A === 'side') {
      hand(arm(`M${x - 33} ${sh + 10} L${x - 38} ${sh + 92}`), x - 38, sh + 98);
      hand(arm(`M${x + 33} ${sh + 10} L${x + 38} ${sh + 92}`), x + 38, sh + 98);
    } else if (A === 'wave') {
      hand(arm(`M${x - 33} ${sh + 10} L${x - 38} ${sh + 92}`), x - 38, sh + 98);
      const w = arm(`M${x + 33} ${sh + 10} L${x + 52} ${sh - 20} L${x + 56} ${sh - 56}`, 'sk-wave', x + 33, sh + 10);
      hand(w, x + 57, sh - 62);
    } else if (A === 'type') {
      const l = arm(`M${x - 33} ${sh + 10} L${x - 30} ${sh + 60} L${x - 4} ${sh + 64}`, 'sk-type', x - 33, sh + 10); hand(l, x - 2, sh + 64);
      const r = arm(`M${x + 33} ${sh + 10} L${x + 34} ${sh + 60} L${x + 52} ${sh + 64}`, 'sk-type sk-type2', x + 33, sh + 10); hand(r, x + 54, sh + 64);
    } else if (A === 'hold') {
      arm(`M${x - 33} ${sh + 10} L${x - 36} ${sh + 60} L${x - 10} ${sh + 70}`);
      arm(`M${x + 33} ${sh + 10} L${x + 36} ${sh + 60} L${x + 10} ${sh + 70}`);
      el('circle', { cx: x - 8, cy: sh + 70, r: 8, fill: skin }, g); el('circle', { cx: x + 8, cy: sh + 70, r: 8, fill: skin }, g);
    }
    el('circle', { cx: x - 20, cy: hy + 2, r: 5, fill: skin }, g);
    el('circle', { cx: x + 20, cy: hy + 2, r: 5, fill: skin }, g);
    el('ellipse', { cx: x, cy: hy, rx: 20, ry: 24, fill: skin }, g);
    (o.hair || hair.short)(g, x, hy, o.hairColor);
    const eyes = origin(el('g', { class: 'sk-eyes' }, g), x, hy - 2); eyes.style.animationDelay = ((o.delay || 0) * 1.7) + 's';
    el('circle', { cx: x - 7, cy: hy - 2, r: 2.2, fill: '#222' }, eyes); el('circle', { cx: x + 7, cy: hy - 2, r: 2.2, fill: '#222' }, eyes);
    if (o.talk) origin(el('ellipse', { class: 'sk-talk', cx: x, cy: hy + 12, rx: 5, ry: 3, fill: '#7a3b2e' }, g), x, hy + 12);
    else el('path', { d: `M${x - 5} ${hy + 12} q5 ${o.smile ?? 2} 10 0`, stroke: '#7a3b2e', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, g);
    return g;
  }

  /* speech bubble anchored with its tail at (x, y); pops in and out on a loop */
  function bubble(svg, x, y, text, o = {}) {
    const w = o.w || 12 + text.length * 11.5, h = 50, bx = x + (o.left ? -w + 10 : -10), by = y - h - 16;
    const b = origin(el('g', { class: 'sk-bubble' }, svg), x, y); if (o.delay) b.style.animationDelay = o.delay + 's';
    el('rect', { x: bx, y: by, width: w, height: h, rx: 10, fill: '#fff', stroke: '#111', 'stroke-width': 2 }, b);
    el('path', { d: `M${x - 6} ${by + h - 1} L${x} ${y} L${x + 12} ${by + h - 1}`, fill: '#fff', stroke: '#111', 'stroke-width': 2, 'stroke-linejoin': 'round' }, b);
    el('rect', { x: x - 5, y: by + h - 3, width: 16, height: 5, fill: '#fff' }, b);
    txt(b, bx + w / 2, by + 32, text, { 'text-anchor': 'middle', 'font-size': o.size || 19, 'font-weight': 800, fill: '#111' });
    return b;
  }

  /* plain room: wall, skirting, floor; returns the floor y */
  function room(svg, o = {}) {
    const W = o.w || 800, H = o.h || 460, floor = o.floor || 402;
    el('rect', { x: 0, y: 0, width: W, height: H, fill: o.wall || '#ebe5d8' }, svg);
    el('rect', { x: 0, y: floor - 70, width: W, height: 70, fill: o.lower || '#e2dbcb' }, svg);
    el('line', { x1: 0, y1: floor - 70, x2: W, y2: floor - 70, stroke: '#d2c9b5', 'stroke-width': 3 }, svg);
    el('rect', { x: 0, y: floor, width: W, height: H - floor, fill: o.floorFill || '#cbbd9c' }, svg);
    return floor;
  }

  const label = (svg, x, y, name, sub) => {
    txt(svg, x, y, name, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#111' });
    if (sub) txt(svg, x, y + 14, sub, { 'text-anchor': 'middle', 'font-size': 11, fill: '#5d5a55' });
  };

  return { el, txt, origin, person, bubble, room, label, hair, SKINS };
})();
