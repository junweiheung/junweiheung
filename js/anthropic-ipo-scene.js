/*
 * Cartoon scenes for the Anthropic IPO explainer, built with js/scene-kit.js.
 * Generic figures, not real people.
 */
(function () {
  const K = window.SceneKit; if (!K) return;
  const { el, txt, origin, person, bubble, room, hair, SKINS } = K;

  /* ---------- pricing night: the book closes at $83 ---------- */
  (function () {
    const s = document.getElementById('bellSvg'); if (!s) return;
    const F = room(s, { wall: '#1d2230', lower: '#161a24', floorFill: '#2b2f38' });
    // city window strip
    el('rect', { x: 30, y: 40, width: 220, height: 150, fill: '#0e1220', stroke: '#3a4152', 'stroke-width': 4 }, s);
    [[44, 120, 28, 70], [80, 90, 22, 100], [110, 110, 30, 80], [148, 70, 26, 120], [182, 100, 24, 90], [212, 125, 26, 65]].forEach(([x, y, w, h]) => {
      el('rect', { x, y, width: w, height: h, fill: '#232a3d' }, s);
      for (let yy = y + 8; yy < y + h - 6; yy += 14) el('rect', { class: 'sk-blink', x: x + 6, y: yy, width: 4, height: 5, fill: '#e0b65a' }, s).style.animationDelay = ((x + yy) % 7) / 5 + 's';
    });
    el('line', { x1: 140, y1: 40, x2: 140, y2: 190, stroke: '#3a4152', 'stroke-width': 4 }, s);

    // the big screen
    el('rect', { x: 280, y: 36, width: 340, height: 210, rx: 8, fill: '#0b0d12', stroke: '#3a4152', 'stroke-width': 4 }, s);
    txt(s, 300, 76, 'ANT', { 'font-size': 22, 'font-weight': 800, fill: '#8d8a84', 'letter-spacing': 3 });
    txt(s, 300, 92, 'PRICED · NASDAQ', { 'font-size': 11, 'font-weight': 600, fill: '#5d5a55', 'letter-spacing': 2 });
    const big = txt(s, 450, 150, '$83.00', { 'text-anchor': 'middle', 'font-size': 64, 'font-weight': 800, fill: '#4fc26b' });
    txt(s, 450, 182, 'range was $70–$78', { 'text-anchor': 'middle', 'font-size': 14, fill: '#8d8a84' });
    el('line', { x1: 300, y1: 200, x2: 600, y2: 200, stroke: '#232a3d', 'stroke-width': 2 }, s);
    txt(s, 300, 228, '980M shares', { 'font-size': 17, 'font-weight': 700, fill: '#fff' });
    txt(s, 600, 228, '$81.3B raised', { 'text-anchor': 'end', 'font-size': 17, 'font-weight': 700, fill: '#e0b65a' });
    // flashing glow on the price
    const glow = el('rect', { class: 'sk-flash', x: 330, y: 98, width: 240, height: 66, rx: 8, fill: '#4fc26b', opacity: 0 }, s);
    glow.style.mixBlendMode = 'screen';
    s.insertBefore(glow, big);

    // order-book ticker under the screen
    const tick = el('g', {}, s);
    const clip = el('clipPath', { id: 'tickClip' }, s); el('rect', { x: 280, y: 252, width: 340, height: 26 }, clip);
    tick.setAttribute('clip-path', 'url(#tickClip)');
    el('rect', { x: 280, y: 252, width: 340, height: 26, fill: '#0b0d12' }, tick);
    const strip = el('g', { class: 'ipo-tick' }, tick);
    const items = 'BOOK CLOSED · UPSIZED 825M → 980M · $26B PLACEMENT AT IPO PRICE · FIRST TRADE THURSDAY 9:30AM ET · ';
    txt(strip, 290, 270, items + items, { 'font-size': 12, 'font-weight': 700, fill: '#e0b65a', 'letter-spacing': 1 });

    // desk with two bankers, laptops
    person(s, 110, { floor: F, sh: 238, top: '#2b2f3a', pants: '#1a1c22', tie: '#2463d6', hair: hair.short, hairColor: '#222', skin: SKINS[1], arms: 'type', delay: .2, smile: 2 });
    person(s, 220, { floor: F, sh: 236, top: '#3a3833', pants: '#1a1c22', tie: '#c2412d', hair: hair.bun, hairColor: '#3b2a20', skin: SKINS[3], arms: 'type', delay: .7, smile: 3 });
    el('rect', { x: 40, y: 304, width: 270, height: 12, fill: '#5a4632' }, s);
    el('rect', { x: 54, y: 316, width: 8, height: F - 316, fill: '#3e3022' }, s);
    el('rect', { x: 288, y: 316, width: 8, height: F - 316, fill: '#3e3022' }, s);
    [[126, '#9aa3ad'], [236, '#9aa3ad']].forEach(([x, c]) => {
      el('path', { d: `M${x - 26} 304 L${x - 20} 276 L${x + 30} 276 L${x + 36} 304 Z`, fill: c }, s);
      el('rect', { x: x - 20, y: 280, width: 50, height: 4, fill: '#4fc26b', class: 'sk-blink' }, s);
    });
    bubble(s, 120, 180, 'Book closed!', { w: 150, size: 17, delay: .4 });

    // cheering figure by the screen
    person(s, 715, { floor: F, sh: 270, top: '#e0b65a', pants: '#2b2b30', hair: hair.long, hairColor: '#2b1d16', skin: SKINS[0], arms: 'wave', delay: 0, smile: 5 });
    bubble(s, 702, 196, '$83!', { left: true, w: 80, size: 22, delay: 2.2 });
    // confetti
    for (let i = 0; i < 16; i++) {
      const x = 630 + (i * 37) % 150, y = 300 + (i * 23) % 60;
      const c = el('rect', { class: 'sk-bob', x, y, width: 7, height: 4, fill: ['#e0b65a', '#4fc26b', '#2463d6', '#c2412d'][i % 4], transform: `rotate(${(i * 47) % 180} ${x} ${y})` }, s);
      c.style.animationDelay = (i % 5) * .3 + 's';
    }
  })();

  /* ---------- analogy: a members' club vote ---------- */
  (function () {
    const s = document.getElementById('clubSvg'); if (!s) return;
    const F = room(s, { w: 800, h: 360, floor: 316, wall: '#efe9dc', lower: '#e4dccb', floorFill: '#cbbd9c' });
    // banner
    el('rect', { x: 250, y: 22, width: 300, height: 36, rx: 4, fill: '#111' }, s);
    txt(s, 400, 46, 'ANNUAL MEETING · VOTE', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: '#e0b65a', 'letter-spacing': 2 });

    // ballot box in the middle
    const bx = 400;
    el('rect', { x: bx - 50, y: 214, width: 100, height: 70, fill: '#8a6d3b' }, s);
    el('rect', { x: bx - 56, y: 206, width: 112, height: 12, fill: '#6e5530' }, s);
    el('rect', { x: bx - 22, y: 209, width: 44, height: 5, fill: '#111' }, s);
    el('rect', { x: bx - 40, y: 284, width: 80, height: F - 284, fill: '#6e5530' }, s);
    txt(s, bx, 256, 'VOTES', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: '#f7f5f0', 'letter-spacing': 2 });

    // small ballots falling from ordinary members
    for (let i = 0; i < 5; i++) {
      const b = el('g', { class: 'ipo-drop' }, s); b.style.animationDelay = (i * .7) + 's';
      el('rect', { x: bx - 18 + i * 6, y: 150, width: 16, height: 11, fill: '#fff', stroke: '#76736c' }, b);
    }
    // ordinary members (Class A), small, on the left
    const S = (x, top, hr, skin, d) => {
      const g = el('g', { transform: `translate(${x} ${F}) scale(.62) translate(${-x} ${-F})` }, s);
      person(g, x, { floor: F, sh: 150, top, pants: '#3a3833', hair: hr, skin, arms: 'side', delay: d, smile: 1 });
    };
    S(70, '#6b8f71', hair.short, SKINS[2], .1); S(130, '#2463d6', hair.long, SKINS[0], .5); S(190, '#c97b5a', hair.cap, SKINS[3], .9); S(250, '#5d5a55', hair.bun, SKINS[1], 1.3);
    txt(s, 160, 336, 'Members: 49.9% of votes', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#111' });

    // founders with one giant ballot
    person(s, 520, { floor: F, sh: 150, top: '#111', pants: '#26272b', hair: hair.short, hairColor: '#3b2a20', skin: SKINS[4], arms: 'hold', delay: .3, smile: 2 });
    const gb = origin(el('g', { class: 'sk-bob' }, s), 520, 200);
    el('rect', { x: 466, y: 196, width: 108, height: 62, fill: '#fff', stroke: '#111', 'stroke-width': 3 }, gb);
    txt(gb, 520, 228, '50.1%', { 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 800, fill: '#c2412d' });
    txt(gb, 520, 248, 'FOUNDERS', { 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 700, fill: '#111', 'letter-spacing': 1.5 });

    // two rich backers with money bags, no ballots, at the back right
    const bag = (x, y) => { el('path', { d: `M${x - 18} ${y} Q${x - 26} ${y + 34} ${x} ${y + 36} Q${x + 26} ${y + 34} ${x + 18} ${y} Z`, fill: '#b8892b' }, s); el('rect', { x: x - 8, y: y - 8, width: 16, height: 9, rx: 3, fill: '#8a6d3b' }, s); txt(s, x, y + 24, '$', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: '#fff' }); };
    const B = (x, top, hr, skin, d) => {
      const g = el('g', { transform: `translate(${x} ${F}) scale(.7) translate(${-x} ${-F})` }, s);
      person(g, x, { floor: F, sh: 150, top, pants: '#26272b', tie: '#2463d6', hair: hr, skin, arms: 'clasp', delay: d, smile: 0 });
    };
    B(650, '#4a5568', hair.short, SKINS[1], .4); B(725, '#4a5568', hair.bald, SKINS[0], .8);
    bag(620, 268); bag(760, 268);
    const nb = el('g', {}, s);
    el('rect', { x: 618, y: 128, width: 140, height: 28, rx: 14, fill: '#fff', stroke: '#c2412d', 'stroke-width': 2 }, nb);
    txt(nb, 688, 147, 'No ballots', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: '#c2412d' });
    txt(s, 688, 336, 'Big backers: 0% of votes', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#111' });

    // the trustee with a key to the boardroom door (top-left corner)
    el('rect', { x: 110, y: 66, width: 64, height: 96, fill: '#5a3a26' }, s);
    txt(s, 142, 88, 'BOARD', { 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: '#e0b65a', 'letter-spacing': 1 });
    el('circle', { cx: 164, cy: 118, r: 3, fill: '#e0b65a' }, s);
    const key = origin(el('g', { class: 'sk-wave' }, s), 202, 110);
    el('circle', { cx: 210, cy: 110, r: 9, fill: 'none', stroke: '#e0b65a', 'stroke-width': 4 }, key);
    el('rect', { x: 178, y: 108, width: 24, height: 4, fill: '#e0b65a' }, key);
    el('rect', { x: 180, y: 112, width: 4, height: 6, fill: '#e0b65a' }, key);
    txt(s, 228, 104, 'Trust: picks', { 'font-size': 12, 'font-weight': 700, fill: '#111' });
    txt(s, 228, 119, 'most of the board', { 'font-size': 12, 'font-weight': 700, fill: '#111' });
  })();
})();
