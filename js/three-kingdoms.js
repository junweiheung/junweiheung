/* Three Kingdoms explainer: a scrollytelling timeline, 184-280.
   Left (top on phones): a map of the Han provinces coloured by who held them at each step.
   Right: the story of the realm at that step, plus the life of one person the reader picks.
   History follows Chen Shou's Records of the Three Kingdoms; borders are simplified to provinces. */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const NARROW = matchMedia('(max-width: 900px)').matches;

/* ---------------- language: English or Simplified Chinese (js/three-kingdoms-zh.js) ----------------
   ?lang=zh in the URL, or the reader's last choice, picks the starting language. */
const ZH = window.TK_ZH || null;
let LANG = 'en';
try {
  const q = new URLSearchParams(location.search).get('lang');
  LANG = q === 'zh' || q === 'en' ? q : (localStorage.getItem('tk-lang') || 'en');
} catch (e) {}
if (!ZH) LANG = 'en';
const isZh = () => LANG === 'zh';
const langHooks = []; // things that redraw themselves when the language changes

/* ---------------- page basics: reveal, progress bar, TOC, copy link ---------------- */
const rio = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in-view');
  rio.unobserve(e.target);
}), { threshold: 0.15 });
document.querySelectorAll('.rv, #qs').forEach((e) => rio.observe(e));
const prog = document.getElementById('prog');
const tocLinks = [...document.querySelectorAll('#toc a')];
const secs = tocLinks.map((a) => document.querySelector(a.getAttribute('href')));
addEventListener('scroll', () => {
  const h = document.documentElement;
  if (prog) prog.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
  let cur = 0;
  secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.35) cur = i; });
  tocLinks.forEach((a, i) => a.classList.toggle('on', i === cur));
}, { passive: true });
tocLinks.forEach((a) => a.addEventListener('click', (e) => {
  e.preventDefault();
  document.querySelector(a.getAttribute('href')).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
}));
const copyBtn = document.getElementById('copyLink');
if (copyBtn) copyBtn.addEventListener('click', async (e) => {
  try { await navigator.clipboard.writeText(location.href); e.target.textContent = 'Copied'; }
  catch (_) { e.target.textContent = 'Copy from address bar'; }
});

const SVGNS = 'http://www.w3.org/2000/svg';
const mk = (t, a, p) => { const e = document.createElementNS(SVGNS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
const say = (p, x, y, str, a = {}) => { const t = mk('text', Object.assign({ x, y, 'font-family': 'Inter' }, a), p); t.textContent = str; return t; };

/* ================= DATA ================= */

/* The Han provinces (zhou), drawn approximately as [lon, lat] outlines that share their borders.
   Jing, Yang and Yi are split where the frontier ran through them: north and south Jing,
   Huainan (Yang north of the Yangtze) and Jiangdong (south of it), and Hanzhong apart from
   the rest of Yi. Liaodong is shown apart from You because the Gongsun family ruled it alone. */
const PROV = {
  liang: { n: 'Liang 涼', p: [[92, 40.5], [104, 40.5], [106.5, 37.5], [106.8, 35.6], [105.8, 34.2], [103.5, 34.0], [101, 35], [92, 37]] },
  bing: { n: 'Bing 并', p: [[106.5, 37.5], [104, 40.5], [107, 41.5], [112, 41.3], [114.3, 40.3], [114.0, 37.8], [113.9, 36.2], [113.6, 35.3], [111.8, 35.8], [110.3, 36.2], [108.6, 35.4], [106.8, 35.6]] },
  sili: { n: 'Sili 司隸', p: [[106.8, 35.6], [108.6, 35.4], [110.3, 36.2], [111.8, 35.8], [113.6, 35.3], [114.3, 35.4], [114.3, 34.8], [113.9, 34.2], [112.8, 33.9], [110.8, 33.7], [108.5, 33.8], [106.6, 34.0], [105.8, 34.2]] },
  ji: { n: 'Ji 冀', p: [[114.0, 37.8], [114.3, 40.3], [115.2, 39.2], [116.6, 38.9], [117.6, 38.6], [117.9, 38.2], [116.2, 37.6], [116.8, 36.8], [115.8, 36.3], [114.6, 35.8], [114.3, 35.4], [113.6, 35.3], [113.9, 36.2]] },
  you: { n: 'You 幽', p: [[114.3, 40.3], [112, 41.3], [115, 42.3], [120, 42.5], [120.5, 41.0], [120.3, 39.5], [119, 39.2], [117.6, 38.6], [116.6, 38.9], [115.2, 39.2]] },
  liaodong: { n: 'Liaodong 遼東', p: [[120, 42.5], [125.5, 43], [126.5, 40.5], [124, 39.4], [121, 38.6], [120.3, 39.5], [120.5, 41.0]] },
  qing: { n: 'Qing 青', p: [[116.2, 37.6], [117.9, 38.2], [119, 38.3], [123, 38], [122.8, 36.5], [120.8, 35.9], [119.3, 35.9], [117.8, 35.9], [116.8, 36.8]] },
  yan: { n: 'Yan 兗', p: [[115.8, 36.3], [116.8, 36.8], [117.8, 35.9], [117.4, 35.1], [116.4, 34.6], [115.2, 34.4], [114.3, 34.8], [114.3, 35.4], [114.6, 35.8]] },
  xu: { n: 'Xu 徐', p: [[117.8, 35.9], [119.3, 35.9], [120.8, 35.9], [121.5, 34.5], [120.5, 33.0], [118.6, 33.0], [117.0, 33.5], [116.4, 34.6], [117.4, 35.1]] },
  yu: { n: 'Yu 豫', p: [[114.3, 34.8], [115.2, 34.4], [116.4, 34.6], [117.0, 33.5], [116.3, 32.5], [115.0, 32.2], [113.9, 32.4], [113.0, 33.0], [112.8, 33.9], [113.9, 34.2]] },
  huainan: { n: 'Huainan 淮南', p: [[115.0, 32.2], [116.3, 32.5], [117.0, 33.5], [118.6, 33.0], [120.5, 33.0], [121.0, 32.0], [119.5, 32.25], [118.6, 32.2], [118.0, 31.4], [117.2, 30.6], [116.1, 29.9], [115.4, 30.0], [114.6, 31.4], [113.9, 32.4]] },
  jiangdong: { n: 'Jiangdong 江東', p: [[121.0, 32.0], [122.5, 31], [122, 28], [119.8, 25.8], [117.3, 23.5], [116.5, 24.8], [114.0, 26.0], [114.2, 28.5], [115.4, 30.0], [116.1, 29.9], [117.2, 30.6], [118.0, 31.4], [118.6, 32.2], [119.5, 32.25]] },
  jingN: { n: 'North Jing 荊', p: [[110.8, 33.7], [112.8, 33.9], [113.0, 33.0], [113.9, 32.4], [114.6, 31.4], [113.6, 30.9], [112.3, 30.9], [111.2, 31.3], [110.0, 31.6], [110.2, 32.6]] },
  jingS: { n: 'South Jing 荊', p: [[110.0, 31.6], [111.2, 31.3], [112.3, 30.9], [113.6, 30.9], [114.6, 31.4], [115.4, 30.0], [114.2, 28.5], [114.0, 26.0], [113.5, 25.2], [111.5, 25.0], [109.5, 26.0], [108.8, 28.5], [109.3, 30.2]] },
  hanzhong: { n: 'Hanzhong 漢中', p: [[105.3, 33.6], [105.8, 34.2], [106.6, 34.0], [108.5, 33.8], [110.8, 33.7], [110.2, 32.6], [108.5, 32.3], [106.5, 32.4], [105.3, 32.6]] },
  yi: { n: 'Yi 益', p: [[98, 33], [101, 35], [103.5, 34.0], [105.8, 34.2], [105.3, 33.6], [105.3, 32.6], [106.5, 32.4], [108.5, 32.3], [110.2, 32.6], [110.0, 31.6], [109.3, 30.2], [108.8, 28.5], [109.5, 26.0], [108.5, 24.8], [106, 23], [104, 22.5], [101, 21.5], [98, 24.5], [97.5, 28]] },
  jiao: { n: 'Jiao 交', p: [[104, 22.5], [106, 23], [108.5, 24.8], [109.5, 26.0], [111.5, 25.0], [113.5, 25.2], [114.0, 26.0], [116.5, 24.8], [117.3, 23.5], [115, 21.5], [110, 20], [108, 17.5], [105.5, 18.5], [103.5, 21.5]] }
};

/* Who's who on the map. Names can change over time; a step's `nm` overrides them ([English, Chinese]). */
const FAC = {
  han: { n: 'Han court', c: '#cdbf98' },
  dong: { n: 'Dong Zhuo', c: '#6d4b3d' },
  lijue: { n: 'Li Jue and Guo Si', c: '#8c6b5a' },
  yuanshao: { n: 'Yuan Shao', c: '#d39b3a' },
  gongsun: { n: 'Gongsun Zan', c: '#9aa3ad' },
  gongsundu: { n: 'Gongsun clan', c: '#a9b59d' },
  yuanshu: { n: 'Yuan Shu', c: '#b58db0' },
  lubu: { n: 'Lü Bu', c: '#8f6fa8' },
  liubiao: { n: 'Liu Biao', c: '#86b3a6' },
  liuzhang: { n: 'Liu Zhang', c: '#cdb27e' },
  zhanglu: { n: 'Zhang Lu', c: '#a89f83' },
  mateng: { n: 'Ma Teng, Han Sui', c: '#b9967a' },
  shixie: { n: 'Shi Xie', c: '#9fbad0' },
  other: { n: 'Local warlords', c: '#dcd5c6' },
  cao: { n: 'Cao Cao', c: '#3e6aa8' },
  liubei: { n: 'Liu Bei', c: '#4f8a55' },
  sun: { n: 'Sun Quan', c: '#c2412d' },
  jin: { n: 'Jin', c: '#6b4f8f' }
};

/* Places the six lives pass through, [lon, lat]. */
const P = {
  qiao: [115.78, 33.85], zhuo: [115.97, 39.49], xiapi: [117.95, 34.3], langya: [118.46, 35.55], wen: [113.08, 34.94],
  yingchuan: [113.48, 34.15], xingyang: [113.38, 34.8], chenliu: [114.62, 34.68], puyang: [115.03, 35.7], shouzhang: [116.1, 36.0],
  pengcheng: [117.18, 34.26], yongqiu: [114.75, 34.48], wan: [112.53, 33.0], guandu: [114.05, 34.75], cangting: [115.85, 36.15],
  liyang: [114.5, 35.67], nanpi: [116.7, 38.04], huguan: [113.2, 36.12], bailang: [119.75, 41.13], chibi: [113.9, 29.75],
  hefei: [117.27, 31.86], tongguan: [110.25, 34.6], ruxu: [117.95, 31.4], nanzheng: [107.0, 33.1], changan: [108.94, 34.26],
  mopi: [113.3, 33.75], luoyang: [112.45, 34.62], ye: [114.35, 36.33], xu: [113.82, 34.04], gaotang: [116.23, 36.86],
  pingyuan: [116.43, 37.17], pei: [116.93, 34.73], runan: [114.36, 33.0], xinye: [112.36, 32.52], changban: [111.8, 30.85],
  gongan: [112.23, 30.06], fu: [104.75, 31.45], jiameng: [105.75, 32.3], luo: [104.4, 30.99], chengdu: [104.06, 30.66],
  yangping: [106.1, 32.95], hanzhong: [107.03, 33.07], yiling: [111.3, 30.7], baidi: [109.57, 31.05], shu: [116.95, 31.45],
  wu: [120.6, 31.3], yangxian: [119.8, 31.36], chaisang: [115.97, 29.7], jingkou: [119.45, 32.2], jianye: [118.8, 32.05],
  jiangling: [112.2, 30.35], wuchang: [114.89, 30.39], yuzhang: [115.9, 28.68], longzhong: [112.05, 32.0], linzheng: [112.6, 26.9],
  jieting: [105.7, 34.9], wuzhang: [107.6, 34.3], baima: [114.6, 35.6], yiyang: [112.35, 28.55], maicheng: [111.75, 30.95],
  xiangping: [123.17, 41.27]
};
const PLACE = { qiao: 'Qiao', zhuo: 'Zhuo', xiapi: 'Xiapi', langya: 'Langya', wen: 'Wen county', yingchuan: 'Yingchuan', xingyang: 'Xingyang', chenliu: 'Chenliu', puyang: 'Puyang', shouzhang: 'Shouzhang', pengcheng: 'Pengcheng', yongqiu: 'Yongqiu', wan: 'Wan', guandu: 'Guandu', cangting: 'Cangting', liyang: 'Liyang', nanpi: 'Nanpi', huguan: 'Huguan', bailang: 'White Wolf Mountain', chibi: 'Red Cliffs', hefei: 'Hefei', tongguan: 'Tong Pass', ruxu: 'Ruxu', nanzheng: 'Nanzheng', changan: 'Chang’an', mopi: 'Mopi', luoyang: 'Luoyang', ye: 'Ye', xu: 'Xu (Xuchang)', gaotang: 'Gaotang', pingyuan: 'Pingyuan', pei: 'Xiaopei', runan: 'Runan', xinye: 'Xinye', changban: 'Changban', gongan: 'Gong’an', fu: 'Fu', jiameng: 'Jiameng', luo: 'Luo', chengdu: 'Chengdu', yangping: 'Yangping Pass', hanzhong: 'Hanzhong', yiling: 'Yiling', baidi: 'Baidi', shu: 'Shu, Lujiang', wu: 'Wu', yangxian: 'Yangxian', chaisang: 'Chaisang', jingkou: 'Jingkou', jianye: 'Jianye (Nanjing)', jiangling: 'Jiangling', wuchang: 'Wuchang', yuzhang: 'Yuzhang', longzhong: 'Longzhong', linzheng: 'Linzheng', jieting: 'Jieting', wuzhang: 'Wuzhang Plains', baima: 'Baima', yiyang: 'Yiyang', maicheng: 'Maicheng', xiangping: 'Xiangping' };

/* Capitals and seats shown on the map. */
const CITIES = [['Luoyang', 'luoyang'], ["Chang'an", 'changan'], ['Xu', 'xu'], ['Ye', 'ye'], ['Chengdu', 'chengdu'], ['Jianye', 'jianye'], ['Xiangyang', 'longzhong']];

/* The steps and lives (js/three-kingdoms-data.js). Each step's full map and faction names are built by
   carrying the changes forward from the step before. */
const DATA = window.TK_DATA;
const STEPS = DATA.steps;
STEPS.reduce((prev, s) => { s.map = Object.assign({}, prev, s.own); return s.map; }, {});
STEPS.reduce((prev, s) => { s.names = Object.assign({}, prev, s.nm || {}); return s.names; }, {});
const PEOPLE = DATA.people;
const ORDER = ['caocao', 'liubei', 'sunquan', 'zhuge', 'guanyu', 'simayi'];
// for each person: the step where they die, and where they first appear
Object.values(PEOPLE).forEach((per) => {
  per.deathIdx = STEPS.findIndex((s) => per.life[s.id] && per.life[s.id][3]);
  per.firstIdx = STEPS.findIndex((s) => per.life[s.id]);
});

/* text lookups that follow the current language */
const L = () => (isZh() ? 1 : 0);
const facName = (si, f) => { const o = STEPS[si].names[f]; return o ? o[L()] : (isZh() ? ZH.fac[f] : FAC[f].n); };
const stepTitle = (i) => STEPS[i][isZh() ? 'zh' : 'en'].t;
const stepText = (i) => STEPS[i][isZh() ? 'zh' : 'en'].x;
const perName = (k) => PEOPLE[k].n[L()];
const perCh = (k) => PEOPLE[k].ch[L()];
const placeName = (k) => (isZh() ? ZH.place[k] : PLACE[k]) || '';

/* swap the page's static text; the English is remembered from the HTML on first use */
/* swap the page's static text; the English is remembered from the HTML on first use */
const EN_TITLE = document.title;
function applyStatic() {
  document.documentElement.lang = isZh() ? 'zh-Hans' : 'en';
  document.title = isZh() ? ZH.title : EN_TITLE;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    if (el.__en === undefined) el.__en = el.innerHTML;
    const zh = ZH && ZH.page[el.dataset.i18n];
    el.innerHTML = isZh() && zh ? zh : el.__en;
  });
  const b = document.getElementById('langBtn');
  if (b) {
    b.textContent = isZh() ? 'English' : '中文';
    b.lang = isZh() ? 'en' : 'zh';
    b.setAttribute('aria-label', isZh() ? 'Switch to English' : '切换到中文');
  }
}
function setLang(l) {
  LANG = l;
  try { localStorage.setItem('tk-lang', l); } catch (e) {}
  try { const u = new URL(location.href); u.searchParams.set('lang', l); history.replaceState(null, '', u); } catch (e) {}
  applyStatic();
  langHooks.forEach((f) => f());
}
const langBtn = document.getElementById('langBtn');
if (langBtn) { if (!ZH) langBtn.hidden = true; else langBtn.addEventListener('click', () => setLang(isZh() ? 'en' : 'zh')); }
applyStatic();


/* ================= THE MAP ================= */
(function () {
  const svg = document.getElementById('tkMap'); if (!svg) return;
  const stepsBox = document.getElementById('tkSteps');
  const yearEl = document.getElementById('tkYear'), titleEl = document.getElementById('tkTitle'), legendEl = document.getElementById('tkLegend');
  const W = 600, H = NARROW ? 470 : 620;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const hasMap = window.d3 && window.topojson && window.__WORLD110M;
  const proj = hasMap
    ? d3.geoMercator().fitExtent([[6, 6], [W - 6, H - 6]], { type: 'MultiPoint', coordinates: [[95, 19], [125, 42.5]] })
    : null;
  if (!proj) { svg.insertAdjacentHTML('afterend', '<p class="tk-note">The map needs JavaScript and an internet connection to load.</p>'); return; }
  const pt = (ll) => proj(ll);
  const ring = (pts) => 'M' + pts.map((ll) => pt(ll).map((v) => v.toFixed(1)).join(' ')).join('L') + 'Z';

  // land and sea
  mk('rect', { x: 0, y: 0, width: W, height: H, fill: '#dfe6ea' }, svg);
  const world = window.__WORLD110M;
  const feats = topojson.feature(world, world.objects.countries).features;
  const NEAR = new Set(['China', 'Vietnam', 'Laos', 'Myanmar', 'Mongolia', 'North Korea', 'South Korea', 'Taiwan', 'Thailand', 'Cambodia', 'Russia', 'India', 'Bhutan', 'Nepal', 'Bangladesh', 'Kazakhstan', 'Japan']);
  const HAN = new Set(['China', 'Vietnam', 'North Korea']);
  const gp = d3.geoPath(proj);
  const land = feats.filter((f) => NEAR.has(f.properties.name));
  land.forEach((f) => mk('path', { d: gp(f), fill: '#f1ede3', stroke: '#d9d2c2', 'stroke-width': 0.5 }, svg));
  // provinces are clipped to the coastline of China, Vietnam and North Korea
  const defs = mk('defs', {}, svg);
  const clip = mk('clipPath', { id: 'tkLand' }, defs);
  feats.filter((f) => HAN.has(f.properties.name)).forEach((f) => mk('path', { d: gp(f) }, clip));
  const provG = mk('g', { 'clip-path': 'url(#tkLand)' }, svg);
  const provEls = {};
  Object.entries(PROV).forEach(([k, v]) => {
    provEls[k] = mk('path', { d: ring(v.p), class: 'tk-prov', fill: FAC.han.c, stroke: '#fff', 'stroke-width': 0.9, 'stroke-linejoin': 'round' }, provG);
  });
  // province names, small
  const provLab = mk('g', { class: 'tk-provlab' }, svg);
  const centroid = (pts) => d3.polygonCentroid(pts.map(pt));
  const LABEL_AT = { yi: [103.5, 29.5], jiao: [110, 23.3], jiangdong: [118.6, 28.5], liang: [99.5, 38.2], liaodong: [123, 41.3], huainan: [117.2, 32.3], hanzhong: [107.3, 32.95] };
  const provTexts = Object.entries(PROV).map(([k, v]) => {
    const c = LABEL_AT[k] ? pt(LABEL_AT[k]) : centroid(v.p);
    return [k, say(provLab, c[0], c[1], v.n, { 'text-anchor': 'middle', 'font-size': NARROW ? 12 : 10.5, fill: 'rgba(20,20,20,.55)', 'font-weight': 600 })];
  });
  // cities
  const cityG = mk('g', {}, svg);
  const cityTexts = CITIES.map(([n, k]) => {
    const c = pt(P[k]);
    mk('circle', { cx: c[0], cy: c[1], r: 2.6, fill: '#1f1f22' }, cityG);
    return [n, k, say(cityG, c[0] + 5, c[1] - 4, n, { 'font-size': NARROW ? 12 : 10.5, 'font-weight': 700, fill: '#1f1f22', 'paint-order': 'stroke', stroke: 'rgba(255,255,255,.85)', 'stroke-width': 3 })];
  });
  const mapLabels = () => {
    provTexts.forEach(([k, t]) => { t.textContent = isZh() ? ZH.prov[k] : PROV[k].n; });
    cityTexts.forEach(([n, k, t]) => { t.textContent = isZh() ? ZH.city[k] : n; });
  };
  // faction names, placed at the middle of each faction's land
  const facLab = mk('g', { class: 'tk-faclab' }, svg);
  // the chosen person's trail and position
  const trail = mk('path', { fill: 'none', stroke: '#111', 'stroke-width': 2, 'stroke-dasharray': '2 5', 'stroke-linecap': 'round', opacity: 0.75 }, svg);
  const trailDots = mk('g', {}, svg);
  const me = mk('g', { class: 'tk-me' }, svg);
  const pulse = mk('circle', { r: 9, fill: 'none', stroke: '#111', 'stroke-width': 2, class: 'tk-pulse' }, me);
  mk('circle', { r: 7, fill: '#111', stroke: '#fff', 'stroke-width': 2.5 }, me);
  const meTag = mk('g', {}, me);
  const meBg = mk('rect', { rx: 3, height: 20, y: -32, fill: '#111' }, meTag);
  const meTx = say(meTag, 0, -18, '', { 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 800, fill: '#fff' });

  const area = (pts) => Math.abs(d3.polygonArea(pts.map(pt)));
  function draw(si, who) {
    const s = STEPS[si];
    Object.entries(s.map).forEach(([k, f]) => provEls[k].setAttribute('fill', FAC[f].c));
    // faction labels and legend
    facLab.innerHTML = '';
    const tally = {};
    Object.entries(s.map).forEach(([k, f]) => { const a = area(PROV[k].p); const c = centroid(PROV[k].p); (tally[f] = tally[f] || { a: 0, x: 0, y: 0 }); tally[f].a += a; tally[f].x += c[0] * a; tally[f].y += c[1] * a; });
    const total = Object.values(tally).reduce((a, t) => a + t.a, 0);
    Object.entries(tally).forEach(([f, t]) => {
      if (f === 'other' || t.a < total * 0.06) return;
      const name = facName(si, f).toUpperCase();
      say(facLab, t.x / t.a, t.y / t.a + 18, name, { 'text-anchor': 'middle', 'font-size': NARROW ? 17 : 15, 'font-weight': 800, 'letter-spacing': '.06em', fill: '#fff', 'paint-order': 'stroke', stroke: FAC[f].c, 'stroke-width': 4 });
    });
    legendEl.innerHTML = Object.keys(tally).sort((a, b) => tally[b].a - tally[a].a)
      .map((f) => `<span><i style="background:${FAC[f].c}"></i>${facName(si, f)}</span>`).join('');
    yearEl.textContent = s.yr; titleEl.textContent = stepTitle(si);
    // the person: their route so far, and where they are now
    const per = PEOPLE[who], col = FAC[per.fac].c, st = status(who, si);
    const path = [];
    for (let i = 0; i <= si; i++) { const e = per.life[STEPS[i].id]; if (e && e[0] && (per.deathIdx < 0 || i <= per.deathIdx)) path.push(pt(P[e[0]])); }
    trail.setAttribute('d', path.length > 1 ? 'M' + path.map((p) => p.join(' ')).join('L') : '');
    trail.setAttribute('stroke', col);
    trailDots.innerHTML = '';
    path.slice(0, -1).forEach((p) => mk('circle', { cx: p[0], cy: p[1], r: 3, fill: col, opacity: 0.6 }, trailDots));
    if (st.place && (st.kind === 'here' || st.kind === 'silent' || st.kind === 'dies')) {
      const c = pt(P[st.place]);
      me.style.display = '';
      me.style.opacity = st.kind === 'silent' ? 0.55 : 1;
      me.setAttribute('transform', `translate(${c[0]} ${c[1]})`);
      me.querySelector('circle:nth-of-type(2)').setAttribute('fill', col);
      pulse.setAttribute('stroke', col);
      meTx.textContent = perName(who) + (st.kind === 'dies' ? ' †' : '');
      const w = meTx.getComputedTextLength() + 14;
      meBg.setAttribute('x', -w / 2); meBg.setAttribute('width', w); meBg.setAttribute('fill', col);
      // keep the name tag inside the map
      const dx = Math.max(-c[0] + w / 2 + 4, Math.min(W - c[0] - w / 2 - 4, 0));
      meTag.setAttribute('transform', `translate(${dx} ${c[1] < 40 ? 50 : 0})`);
    } else me.style.display = 'none';
  }

  /* ---------------- the steps and the person toggle ---------------- */
  let who = 'caocao', si = 0;
  const age = (per, y) => per.born ? y - per.born : null;
  /* where a person stands at step i: not yet born, an entry for this step, silent (alive, no entry), or dead */
  function status(k, i) {
    const per = PEOPLE[k], s = STEPS[i], e = per.life[s.id];
    let last = null;
    for (let j = i; j >= 0; j--) { const x = per.life[STEPS[j].id]; if (x && x[0]) { last = x[0]; break; } }
    if (per.deathIdx >= 0 && i > per.deathIdx) return { kind: 'dead', e };
    if (e) return { kind: e[3] ? 'dies' : 'here', e, place: e[0] };
    if (per.born && s.y < per.born) return { kind: 'unborn' };
    if (i < per.firstIdx) return { kind: 'early' };
    return { kind: 'silent', place: last };
  }
  function personBlock(i) {
    const per = PEOPLE[who], s = STEPS[i], st = status(who, i), U = ZH && ZH.ui, zh = isZh();
    const col = FAC[per.fac].c;
    let meta, text, cls = '';
    if (st.kind === 'dead') {
      meta = zh ? `${per.died}年去世` : `Died ${per.died}`;
      text = st.e ? st.e[zh ? 1 : 2] : (zh ? `已于${per.died}年去世。` : `He died in ${per.died}.`);
      cls = ' gone';
    } else if (st.kind === 'unborn') {
      meta = zh ? `${per.born}年出生` : `Born ${per.born}`;
      text = zh ? '尚未出生。' : 'Not yet born.';
      cls = ' quiet';
    } else if (st.kind === 'early') {
      meta = zh ? '生年不详' : 'Birth year unknown';
      text = zh ? '早年事迹史书无载。' : 'The record says nothing of his early years.';
      cls = ' quiet';
    } else {
      const a = age(per, s.y);
      const ageTx = a === null ? (zh ? '年龄不详' : 'Age unknown') : a === 0 ? (zh ? '出生' : 'Born') : (zh ? `约${a}岁` : `Age about ${a}`);
      meta = ageTx + (st.place ? ` · ${placeName(st.place)}` : '') + (st.kind === 'dies' ? (zh ? ' · 去世' : ' · dies') : '');
      if (st.kind === 'silent') {
        text = zh ? '本时期《三国志》对他没有专门记载。' : 'The Records say nothing specific about him in these years.';
        cls = ' quiet';
      } else text = st.e[zh ? 1 : 2];
    }
    // in Chinese the name is already in characters, so the second (characters) label is left out
    const sub = zh ? '' : ` <span lang="zh">${per.zh}</span>`;
    return `<div class="tk-who${cls}" style="--pc:${col}">
      <div class="tk-av" aria-hidden="true">${perCh(who)}</div>
      <div><div class="tk-wn">${perName(who)}${sub}</div><div class="tk-wm">${meta}</div></div>
    </div><p class="tk-wt${cls}">${text}</p>`;
  }
  function quoteBlock(i) {
    const q = STEPS[i].q; if (!q) return '';
    const src = `<div class="tk-qs">${isZh() ? '原文' : 'Original text'} · <span lang="zh">${q.s}</span></div>`;
    return `<blockquote class="tk-q">${src}<p lang="zh">「${q.c}」</p>${isZh() ? '' : `<p class="tk-qe">${q.en}</p>`}</blockquote>`;
  }

  stepsBox.innerHTML = STEPS.map((s, i) => `<div class="tk-step" data-i="${i}"><div class="card">
    <div class="tk-yr">${s.yr} <span lang="zh">· ${s.era}</span></div><h3 class="tk-h"></h3><p class="tk-p"></p>
    <div class="tk-quote"></div>
    <div class="tk-person" data-i="${i}"></div></div></div>`).join('');
  const stepEls = [...stepsBox.querySelectorAll('.tk-step')];
  const personEls = [...stepsBox.querySelectorAll('.tk-person')];
  const renderPeople = () => personEls.forEach((el, i) => { el.innerHTML = personBlock(i); });
  const renderSteps = () => stepEls.forEach((el, i) => {
    el.querySelector('.tk-h').textContent = stepTitle(i);
    el.querySelector('.tk-p').textContent = stepText(i);
    el.querySelector('.tk-quote').innerHTML = quoteBlock(i);
  });
  renderSteps();

  const toggles = document.querySelectorAll('.tk-pick');
  function pick(k, from) {
    who = k;
    toggles.forEach((box) => box.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.p === k ? 'true' : 'false')));
    renderPeople(); draw(si, who);
    document.querySelectorAll('#castSvg .cast-row').forEach((g) => g.classList.toggle('on', g.dataset.p === k));
    if (from === 'cast') document.getElementById('tkScrolly').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }
  const renderToggles = () => toggles.forEach((box) => {
    box.innerHTML = ORDER.map((k) => `<button type="button" data-p="${k}" aria-pressed="${k === who}" style="--pc:${FAC[PEOPLE[k].fac].c}"><b lang="zh">${perCh(k)}</b>${perName(k)}</button>`).join('');
  });
  toggles.forEach((box) => box.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) pick(b.dataset.p); }));
  renderToggles();
  window.__tkPick = pick;
  window.__tkWho = () => who;
  mapLabels();
  langHooks.push(() => { mapLabels(); renderSteps(); renderPeople(); renderToggles(); draw(si, who); });

  function setStep(i) {
    if (i === si && stepEls[i].classList.contains('on')) return;
    si = i;
    stepEls.forEach((el, k) => el.classList.toggle('on', k === i));
    draw(si, who);
  }
  // a step becomes active when it crosses a line near the middle of the screen (lower on phones, under the map)
  const obs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setStep(+e.target.dataset.i); }),
    { rootMargin: NARROW ? '-70% 0px -25% 0px' : '-48% 0px -48% 0px' });
  stepEls.forEach((el) => obs.observe(el));
  renderPeople(); setStep(0);
})();

/* ================= THE CAST: six lifespans on one timeline ================= */
(function () {
  const s = document.getElementById('castSvg'); if (!s) return;
  function build() {
  s.innerHTML = '';
  const NAR = matchMedia('(max-width: 560px)').matches;
  const W = NAR ? 360 : 680, L = NAR ? 12 : 150, R = W - 14, RH = NAR ? 50 : 40, T = 46;
  const H = T + ORDER.length * RH + 30;
  s.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const X = (y) => L + (y - 150) / (285 - 150) * (R - L);
  const MARKS = [[184, 'Yellow Turbans'], [208, 'Red Cliffs'], [220, 'Han ends'], [263, 'Shu falls'], [280, 'Jin reunites']].map(([y, l], i) => [y, isZh() ? ZH.ui.marks[i] : l]);
  MARKS.forEach(([y, lab], i) => {
    mk('line', { x1: X(y), x2: X(y), y1: T - 8, y2: H - 22, stroke: '#d8d2c4', 'stroke-dasharray': '3 4' }, s);
    say(s, X(y), i % 2 ? T - 14 : T - 28, lab, { 'text-anchor': 'middle', 'font-size': NAR ? 10 : 11, 'font-weight': 700, fill: '#8a8578' });
  });
  [150, 175, 200, 225, 250, 275].forEach((y) => say(s, X(y), H - 6, y, { 'text-anchor': 'middle', 'font-size': 10.5, fill: '#8a8578' }));
  ORDER.forEach((k, i) => {
    const per = PEOPLE[k], col = FAC[per.fac].c, y = T + i * RH + (NAR ? 18 : 8);
    const g = mk('g', { class: 'cast-row', 'data-p': k, tabindex: 0, role: 'button', 'aria-label': isZh() ? ZH.ui.follow(perName(k)) : `Follow ${perName(k)} through the timeline` }, s);
    mk('rect', { x: 0, y: y - (NAR ? 20 : 8), width: W, height: RH, fill: 'transparent' }, g);
    const b0 = per.born || 160;
    if (!per.born) mk('rect', { x: X(150), y, width: X(b0) - X(150), height: 16, fill: 'none', stroke: col, 'stroke-dasharray': '3 3', rx: 3 }, g);
    mk('rect', { x: X(b0), y, width: X(per.died) - X(b0), height: 16, rx: 3, fill: col, class: 'cast-bar' }, g);
    const nameX = NAR ? X(b0) : L - 10, nameY = NAR ? y - 5 : y + 12;
    say(g, nameX, nameY, perName(k), { 'text-anchor': NAR ? 'start' : 'end', 'font-size': 13, 'font-weight': 800, fill: '#1f1f22' });
    say(g, X(per.died) + 6, y + 12, (per.born ? per.born : '?') + '–' + per.died, { 'font-size': 11, fill: '#5d5a55' });
    const pick = () => window.__tkPick && window.__tkPick(k, 'cast');
    g.addEventListener('click', pick);
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    if (k === (window.__tkWho ? window.__tkWho() : 'caocao')) g.classList.add('on');
  });
  }
  build();
  langHooks.push(build);
})();
