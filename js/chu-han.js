/* Chu–Han explainer: a scrollytelling timeline, 210–180 BC.
   Left (top on phones): a map of the Qin commanderies and the kingdoms after them, coloured by who held each one.
   Right: the story of the realm at that step, plus the life of one person the reader picks.
   History follows Sima Qian's Shiji, checked against the Book of Han; borders are simplified.
   Years are BC and stored as positive numbers, so later years are smaller. */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const NARROW = matchMedia('(max-width: 900px)').matches;

/* ---------------- language: English or Simplified Chinese (js/chu-han-zh.js) ----------------
   ?lang=zh in the URL, or the reader's last choice, picks the starting language. */
const ZH = window.CH_ZH || null;
let LANG = 'en';
try {
  const q = new URLSearchParams(location.search).get('lang');
  LANG = q === 'zh' || q === 'en' ? q : (localStorage.getItem('ch-lang') || 'en');
} catch (e) {}
if (!ZH) LANG = 'en';
const isZh = () => LANG === 'zh';
const L = () => (isZh() ? 1 : 0);
const langHooks = []; // things that redraw themselves when the language changes

/* ---------------- page basics: reveal, progress bar, TOC, copy link ---------------- */
const rio = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in-view');
  rio.unobserve(e.target);
}), { threshold: 0, rootMargin: '0px 0px -12% 0px' });
document.querySelectorAll('.rv').forEach((e) => rio.observe(e));
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
  try { await navigator.clipboard.writeText(location.href); e.target.textContent = isZh() ? '已复制' : 'Copied'; }
  catch (_) { e.target.textContent = isZh() ? '请从地址栏复制' : 'Copy from address bar'; }
});

const SVGNS = 'http://www.w3.org/2000/svg';
const mk = (t, a, p) => { const e = document.createElementNS(SVGNS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
const say = (p, x, y, str, a = {}) => { const t = mk('text', Object.assign({ x, y, 'font-family': 'Inter' }, a), p); t.textContent = str; return t; };

/* ================= DATA ================= */

/* Regions, drawn approximately as [lon, lat] outlines that share their borders: the Qin commanderies
   grouped the way Xiang Yu split them into kingdoms in 206 BC, plus the pieces the early Han kingdoms
   were later cut along (Jinan out of Jibei; Dongyang between the Huai and the Yangtze). The shapes
   never move; each step only changes who holds them.
   The map is clipped to the modern coastline. */
const REG = {
  yong: { n: ['Yong', '雍'], p: [[103, 37], [106.6, 37], [107.5, 35.6], [108.3, 35.6], [108.3, 33.9], [105.5, 33.9], [103, 34.5]] },
  di: { n: ['Di', '翟'], p: [[106.6, 37], [107, 39.6], [110.6, 39.6], [110.6, 35.6], [108.3, 35.6], [107.5, 35.6]] },
  sai: { n: ['Sai', '塞'], p: [[108.3, 35.6], [110.6, 35.6], [110.4, 34.6], [110.4, 33.9], [108.3, 33.9]] },
  hanzhong: { n: ['Hanzhong', '汉中'], p: [[103, 34.5], [105.5, 33.9], [108.3, 33.9], [110.4, 33.9], [110.8, 32.6], [108.5, 32.0], [106, 32.2], [103.5, 32.8]] },
  bashu: { n: ['Ba–Shu', '巴蜀'], p: [[102, 32.5], [103.5, 32.8], [106, 32.2], [108.5, 32.0], [110.8, 32.6], [110.3, 30.5], [109.5, 28.5], [106, 27.6], [103, 27.5], [101.5, 29.5]] },
  henan: { n: ['Henan', '河南'], p: [[110.4, 34.6], [112, 34.85], [113.0, 34.92], [113.0, 34.2], [112.6, 33.6], [110.4, 33.9]] },
  hann: { n: ['Yingchuan', '颍川'], p: [[113.0, 34.92], [113.4, 34.95], [114.4, 35.15], [114.6, 34.3], [114.4, 33.3], [113.0, 33.0], [112.6, 33.6], [113.0, 34.2]] },
  nanyang: { n: ['Nanyang', '南阳'], p: [[110.4, 33.9], [112.6, 33.6], [113.0, 33.0], [114.0, 32.4], [113.5, 31.6], [111.5, 31.8], [110.8, 32.6]] },
  xiwei: { n: ['Hedong', '河东'], p: [[110.4, 34.6], [110.6, 35.6], [110.6, 37.2], [112.9, 37.2], [113.3, 36.2], [112.6, 35.1], [112, 34.85]] },
  yin: { n: ['Henei', '河内'], p: [[112, 34.85], [112.6, 35.1], [113.3, 36.2], [114.8, 36.6], [115.6, 36.4], [116, 36.0], [114.5, 35.2], [114.4, 35.15], [113.4, 34.95], [113.0, 34.92]] },
  dai: { n: ['Dai', '代'], p: [[110.6, 37.2], [110.6, 39.6], [111, 41], [114, 41.2], [115.2, 40.5], [114.6, 38.4], [113.6, 37.6], [112.9, 37.2]] },
  zhao: { n: ['Zhao', '赵'], p: [[112.9, 37.2], [113.6, 37.6], [114.6, 38.4], [115.2, 39.0], [116.8, 38.6], [116.8, 37.3], [115.6, 36.4], [114.8, 36.6], [113.3, 36.2]] },
  yan: { n: ['Yan', '燕'], p: [[114, 41.2], [117, 42], [119.5, 41.5], [119.5, 39.6], [119.3, 39.0], [118.2, 39.0], [117.4, 38.6], [116.8, 38.6], [115.2, 39.0], [114.6, 38.4], [115.2, 40.5]] },
  liaodong: { n: ['Liaodong', '辽东'], p: [[119.5, 41.5], [124.5, 42.8], [126, 41], [125.6, 39.5], [124, 39.6], [121.1, 38.6], [121, 40.3], [119.5, 39.6]] },
  jibei: { n: ['Jibei', '济北'], p: [[116.8, 38.6], [117.4, 38.6], [118.2, 39.0], [118.2, 38.0], [118.08, 37.4], [117.3, 37.35], [116.75, 36.8], [117.0, 36.35], [117.6, 36.5], [117.2, 36.0], [116, 36.0], [115.6, 36.4], [116.8, 37.3]] },
  jinan: { n: ['Jinan', '济南'], p: [[116.75, 36.8], [117.3, 37.35], [118.08, 37.4], [118.0, 37.0], [117.6, 36.5], [117.0, 36.35]] },
  linzi: { n: ['Linzi', '临淄'], p: [[118.2, 38.0], [118.2, 38.3], [119.2, 38.3], [119.3, 37.4], [119.6, 36.0], [120.3, 35.9], [119.8, 35.0], [118.6, 35.0], [117.6, 35.4], [117.2, 36.0], [118.0, 37.0]] },
  jiaodong: { n: ['Jiaodong', '胶东'], p: [[119.3, 37.4], [121, 37.8], [122.8, 37.4], [122.5, 36.6], [120.3, 35.9], [119.6, 36.0]] },
  liang: { n: ['Dang', '砀'], p: [[114.4, 35.15], [114.5, 35.2], [116, 36.0], [117.2, 36.0], [116.2, 35.0], [115.6, 34.2], [115.0, 34.0], [114.6, 34.3]] },
  chu: { n: ['Sishui', '泗水'], p: [[117.2, 36.0], [117.6, 35.4], [118.6, 35.0], [119.8, 35.0], [120.55, 34.2], [119.2, 33.6], [118.5, 33.05], [117.6, 32.95], [117.0, 33.0], [116.0, 33.3], [115.0, 34.0], [115.6, 34.2], [116.2, 35.0]] },
  dongyang: { n: ['Dongyang', '东阳'], p: [[117.6, 32.95], [118.5, 33.05], [119.2, 33.6], [120.55, 34.2], [121.2, 33.5], [122.1, 31.85], [119.0, 32.4], [117.6, 32.54]] },
  chen: { n: ['Chen', '陈'], p: [[114.6, 34.3], [115.0, 34.0], [116.0, 33.3], [115.4, 32.2], [114.0, 32.4], [113.0, 33.0], [114.4, 33.3]] },
  jiujiang: { n: ['Jiujiang', '九江'], p: [[115.4, 32.2], [116.0, 33.3], [117.0, 33.0], [117.6, 32.95], [117.6, 32.54], [119.0, 32.4], [118.6, 31.7], [117.6, 30.8], [116.2, 29.8], [115.0, 30.2], [114.6, 31.2], [114.0, 32.4]] },
  hengshan: { n: ['Hengshan', '衡山'], p: [[113.5, 31.6], [114.0, 32.4], [114.6, 31.2], [115.0, 30.2], [116.2, 29.8], [116.5, 28.0], [116.0, 26.0], [114.5, 25.2], [114.3, 27.0], [113.0, 29.0], [114.0, 30.5]] },
  linjiang: { n: ['Nan', '南郡'], p: [[110.8, 32.6], [111.5, 31.8], [113.5, 31.6], [114.0, 30.5], [113.0, 29.0], [112.0, 27.5], [110, 26.5], [109.5, 28.5], [110.3, 30.5]] },
  changsha: { n: ['Changsha', '长沙'], p: [[110, 26.5], [112, 27.5], [113.0, 29.0], [114.3, 27.0], [114.5, 25.2], [112, 24.8], [110.5, 25.2], [109.5, 25.5]] },
  kuaiji: { n: ['Kuaiji', '会稽'], p: [[119.0, 32.4], [122.1, 31.85], [122.3, 30.5], [122.2, 28.4], [121.3, 27.7], [120.9, 27.1], [118, 28.0], [116.5, 28.0], [116.2, 29.8], [117.6, 30.8], [118.6, 31.7]] },
  minyue: { n: ['Min', '闽'], p: [[116.5, 28.0], [118, 28.0], [120.9, 27.1], [120.8, 26.2], [118.5, 23.9], [116.5, 24.5], [116.0, 26.0]] },
  nanyue: { n: ['Lingnan', '岭南'], p: [[110.5, 25.2], [112, 24.8], [114.5, 25.2], [116.0, 26.0], [116.5, 24.5], [118.5, 23.9], [117, 22.4], [113, 21.2], [110, 20], [107.6, 20.9], [106.5, 22.5], [107.5, 24.5], [109.5, 25.5]] }
};
/* Lines along which a region was carved out of an older unit; drawn dotted. Each point is a vertex the two
   regions share. */
const CUTS = [
  [[118.08, 37.4], [117.3, 37.35], [116.75, 36.8], [117.0, 36.35], [117.6, 36.5]],   // Jinan out of Jibei
  [[117.6, 32.95], [118.5, 33.05], [119.2, 33.6], [120.55, 34.2]]                     // Dongyang out of Sishui, along the Huai
];
const LABEL_AT = { bashu: [105.2, 30.2], nanyue: [111.5, 23.2], kuaiji: [119.6, 29.6], hengshan: [115.4, 27.8], liaodong: [123, 41.2], di: [109, 38.2], dai: [112.5, 39.6], yong: [105.2, 35.6], minyue: [118.3, 25.9], hanzhong: [107.3, 33.1], linjiang: [111.6, 29.7] };

/* Who's who on the map, [English, Chinese]. A step's `nm` can rename a side; `b` is a short label for the map. */
const FAC = {
  qin: { n: ['Qin', '秦'], c: '#3b3b44' },
  zhangchu: { n: ['Rebels (Zhang-Chu)', '张楚义军'], c: '#c08a62' },
  chu: { n: ['Chu', '楚'], c: '#6b4f8f' },
  han: { n: ['Liu Bang', '刘邦'], c: '#c2412d' },
  sanqin: { n: ['Three Qins (Zhang Han, Sima Xin, Dong Yi)', '三秦（章邯、司马欣、董翳）'], c: '#7d7a72' },
  zhao: { n: ['Zhao', '赵'], c: '#d39b3a' },
  dai: { n: ['Dai', '代'], c: '#e5c27f' },
  yan: { n: ['Yan', '燕'], c: '#8d9aa6' },
  liaodongk: { n: ['Liaodong (Han Guang)', '辽东（韩广）'], c: '#b8c3cc' },
  qi: { n: ['Qi (Tian family)', '齐（田氏）'], c: '#4f8a55' },
  hanxin: { n: ['Qi (Han Xin)', '齐（韩信）'], c: '#a8862b' },
  wei: { n: ['Wei (Wei Bao)', '魏（魏豹）'], c: '#b58db0' },
  hannk: { n: ['Hann (Han Cheng)', '韩（韩成）'], c: '#86b3a6' },
  yink: { n: ['Yin (Sima Ang)', '殷（司马卬）'], c: '#a89f83' },
  henank: { n: ['Henan (Shen Yang)', '河南（申阳）'], c: '#cdb27e' },
  jiujiangk: { n: ['Jiujiang (Ying Bu)', '九江（英布）'], c: '#8a5a3a' },
  hengshank: { n: ['Hengshan (Wu Rui)', '衡山（吴芮）'], c: '#9fbad0' },
  linjiangk: { n: ['Linjiang (Gong Ao)', '临江（共敖）'], c: '#b9967a' },
  nanyue: { n: ['Nanyue (Zhao Tuo)', '南越（赵佗）'], c: '#5f8a8a' },
  // the seven kings not of the Liu family (202 BC), one side per kingdom; `k` marks a kingdom, whose map label keeps its king's name
  kchu: { n: ['Chu (Han Xin)', '楚（韩信）'], c: '#a8862b', k: 1 },
  kliang: { n: ['Liang (Peng Yue)', '梁（彭越）'], c: '#b58db0', k: 1 },
  khuainan: { n: ['Huainan (Ying Bu)', '淮南（英布）'], c: '#8a5a3a', k: 1 },
  kchangsha: { n: ['Changsha (Wu Rui)', '长沙（吴芮）'], c: '#d8a24a', k: 1 },
  kzhao: { n: ['Zhao (Zhang Ao)', '赵（张敖）'], c: '#9b7bb0', k: 1 },
  kyan: { n: ['Yan (Lu Wan)', '燕（卢绾）'], c: '#8d9aa6', k: 1 },
  khann: { n: ['Hann (King Xin)', '韩（韩王信）'], c: '#86b3a6', k: 1 },
  // the Liu princes: one side per kingdom, coloured apart from the Han emperor's red and from their neighbours, named for its first king (a step's `nm` renames it when the king changes)
  lqi: { n: ['Qi (Liu Fei)', '齐（刘肥）'], c: '#ee8f4e', k: 1 },
  lchu: { n: ['Chu (Liu Jiao)', '楚（刘交）'], c: '#c9a3d9', k: 1 },
  ljing: { n: ['Jing (Liu Jia)', '荆（刘贾）'], c: '#e6c35c', k: 1 },
  lwu: { n: ['Wu (Liu Bi)', '吴（刘濞）'], c: '#e6c35c', k: 1 },
  ldai: { n: ['Dai (Liu Xi)', '代（刘喜）'], c: '#f3d9a4', k: 1 },
  lzhao: { n: ['Zhao (Ruyi)', '赵（如意）'], c: '#a87ca0', k: 1 },
  lliang: { n: ['Liang (Liu Hui)', '梁（刘恢）'], c: '#f2a7a0', k: 1 },
  lhuaiyang: { n: ['Huaiyang (Liu You)', '淮阳（刘友）'], c: '#9fbf8f', k: 1 },
  lhuainan: { n: ['Huainan (Liu Chang)', '淮南（刘长）'], c: '#e48f72', k: 1 },
  lyan: { n: ['Yan (Liu Jian)', '燕（刘建）'], c: '#e3a9c2', k: 1 },
  ljichuan: { n: ['Jichuan (Liu Tai)', '济川（刘太）'], c: '#d6c08a', k: 1 },
  // the Lü kings, in blues
  klu: { n: ['Lü (Lü Tai)', '吕（吕台）'], c: '#2f6a8f', k: 1 },
  kluzhao: { n: ['Zhao (Lü Lu)', '赵（吕禄）'], c: '#3f7fb0', k: 1 },
  kluliang: { n: ['Liang (Lü Chan)', '梁（吕产）'], c: '#5b9bc7', k: 1 },
  kluyan: { n: ['Yan (Lü Tong)', '燕（吕通）'], c: '#24506e', k: 1 },
  revolt: { n: ['In revolt', '叛乱'], c: '#5d4a3c' },
  xiongnu: { n: ['Xiongnu', '匈奴'], c: '#5a4632' },
  other: { n: ['Unassigned or local', '未封或地方势力'], c: '#dcd5c6' }
};

/* Places the six lives pass through, [lon, lat], with names [English, Chinese]. */
const P = {
  pei: [[116.93, 34.73], 'Pei', '沛县'], xue: [[117.1, 34.98], 'Xue', '薛'], pengcheng: [[117.18, 34.26], 'Pengcheng', '彭城'],
  chenliu: [[114.62, 34.68], 'Chenliu', '陈留'], wan: [[112.53, 33.0], 'Wan', '宛'], bashang: [[109.1, 34.28], 'Bashang', '霸上'],
  hongmen: [[109.27, 34.4], 'Hong Gate', '鸿门'], nanzheng: [[107.03, 33.07], 'Nanzheng', '南郑'], hanzhong: [[107.03, 33.07], 'Hanzhong', '汉中'],
  feiqiu: [[108.5, 34.25], 'Feiqiu', '废丘'], xingyang: [[113.38, 34.8], 'Xingyang', '荥阳'], xiuwu: [[113.45, 35.23], 'Xiuwu', '修武'],
  guangwu: [[113.55, 34.92], 'Guangwu', '广武'], gaixia: [[117.55, 33.4], 'Gaixia', '垓下'], dingtao: [[115.55, 35.07], 'Dingtao', '定陶'],
  chen: [[114.88, 33.73], 'Chen', '陈县'], pingcheng: [[113.3, 40.08], 'Pingcheng (Baideng)', '平城（白登）'], bairen: [[114.7, 37.38], 'Bairen', '柏人'],
  changan: [[108.93, 34.3], 'Chang’an', '长安'], handan: [[114.48, 36.6], 'Handan', '邯郸'], luoyang: [[112.45, 34.68], 'Luoyang', '洛阳'],
  xiapi: [[117.95, 34.3], 'Xiapi', '下邳'], wujiang: [[118.33, 31.75], 'Wu River', '乌江'], juchao: [[117.87, 31.6], 'Juchao', '居鄛'],
  wu: [[120.6, 31.3], 'Wu', '吴县'], julu: [[115.04, 37.22], 'Julu', '巨鹿'], xinan: [[111.95, 34.73], 'Xin’an', '新安'],
  linzi: [[118.3, 36.85], 'Linzi', '临淄'], huaiyin: [[119.0, 33.6], 'Huaiyin', '淮阴'], xuyi: [[118.5, 33.0], 'Xuyi', '盱眙'],
  chencang: [[107.15, 34.35], 'Chencang', '陈仓'], anyi: [[111.0, 35.1], 'Anyi', '安邑'], jingxing: [[114.1, 38.05], 'Jingxing', '井陉'],
  xiayi: [[116.4, 34.43], 'Xiayi', '下邑'], dazexiang: [[117.0, 33.7], 'Dazexiang', '大泽乡'], weishui: [[119.4, 36.5], 'Wei River', '潍水'],
  kuaizhui: [[117.1, 33.5], 'Kuaizhui', '会甀'], csborder: [[112.6, 25.6], 'Changsha border', '长沙边邑'], didao: [[103.85, 35.37], 'Didao', '狄道'],
  shaqiu: [[115.15, 37.05], 'Shaqiu', '沙丘'], ji: [[116.4, 39.9], 'Ji', '蓟'], panyu: [[113.27, 23.13], 'Panyu', '番禺'], xianyang: [[108.71, 34.36], 'Xianyang', '咸阳']
};
const ll = (k) => P[k][0];
const placeName = (k) => (k && P[k] ? P[k][1 + L()] : '');

/* Capitals shown on the map. Xianyang gives way to Chang'an once Han decides to build there. */
const CITIES = [['xianyang', (y) => y >= 206], ['changan', (y) => y <= 202], ['luoyang'], ['pengcheng'], ['linzi'], ['ji'], ['panyu']];

/* Battles: [step id, place, winner's colour key, English, Chinese, note English, note Chinese]. */
const BATTLES = [
  ['209b', 'dazexiang', 'zhangchu', 'Dazexiang', '大泽乡', 'Chen Sheng and Wu Guang’s conscripts kill their officers and rise.', '陈胜、吴广杀尉起义。'],
  ['208b', 'dingtao', 'qin', 'Dingtao', '定陶', 'Zhang Han surprises the Chu camp; Xiang Liang is killed.', '章邯夜袭，项梁战死。'],
  ['207a', 'julu', 'chu', 'Julu', '巨鹿', 'Xiang Yu sinks his boats and breaks the Qin siege in nine battles.', '项羽破釜沉舟，九战大破秦军。'],
  ['207c', 'xinan', 'chu', 'Xin’an', '新安', 'More than 200,000 surrendered Qin soldiers massacred in a night.', '一夜坑杀秦降卒二十余万。'],
  ['206c', 'chencang', 'han', 'Chencang', '陈仓', 'Han breaks out of Hanzhong and takes Guanzhong.', '汉军出陈仓，还定三秦。'],
  ['205a', 'pengcheng', 'chu', 'Pengcheng', '彭城', '30,000 Chu horsemen rout a coalition said to number 560,000.', '项羽以三万骑大破五十六万汉军。'],
  ['205b', 'anyi', 'han', 'Anyi', '安邑', 'Han Xin crosses the Yellow River on jars and takes Wei.', '韩信木罂渡河，袭破魏国。'],
  ['204a', 'jingxing', 'han', 'Jingxing', '井陉', 'Back to the river: Zhao’s army destroyed, Chen Yu killed.', '背水一战，破赵斩陈馀。'],
  ['204b', 'xingyang', 'chu', 'Xingyang', '荥阳', 'Liu Bang besieged; Ji Xin dies in his place.', '刘邦被围，纪信替死。'],
  ['203a', 'weishui', 'han', 'Wei River', '潍水', 'Han Xin breaks a sandbag dam on Long Ju’s army.', '韩信囊沙壅水，斩龙且。'],
  ['202a', 'gaixia', 'han', 'Gaixia', '垓下', 'Xiang Yu trapped by Han Xin, Peng Yue and Ying Bu.', '项羽被韩信、彭越、英布合围。'],
  ['202b', 'wujiang', 'han', 'Wu River', '乌江', 'Xiang Yu’s last stand.', '项羽乌江自刎。'],
  ['200', 'pingcheng', 'xiongnu', 'Baideng', '白登', 'Liu Bang surrounded by Modu’s horsemen for seven days.', '刘邦被冒顿围困七日。'],
  ['196b', 'kuaizhui', 'revolt', 'Ying Bu rises', '英布起兵', 'Ying Bu kills the King of Jing and attacks Chu.', '英布杀荆王刘贾，攻楚。'],
  ['195a', 'kuaizhui', 'han', 'Kuaizhui', '会甀', 'Ying Bu crushed; Liu Bang hit by an arrow.', '英布大败，刘邦中流矢。'],
  ['183', 'csborder', 'nanyue', 'Changsha border', '长沙边邑', 'Nanyue sacks several Changsha counties.', '南越攻破长沙数县。'],
  ['182', 'didao', 'xiongnu', 'Didao', '狄道', 'Xiongnu raid Didao and Ayang.', '匈奴寇狄道，攻阿阳。'],
  ['181', 'didao', 'xiongnu', 'Didao', '狄道', 'Xiongnu carry off more than 2,000 people.', '匈奴掳走两千余人。']
];

const VIEWS = [['political', 'Political', '政治'], ['battles', 'Battles', '战役']];

/* The steps and lives (js/chu-han-data.js). Each step's full map and faction names are built by
   carrying the changes forward from the step before. */
const DATA = window.CH_DATA;
const STEPS = DATA.steps;
STEPS.reduce((prev, s) => { s.map = Object.assign({}, prev, s.own); return s.map; }, {});
STEPS.reduce((prev, s) => { s.names = Object.assign({}, prev, s.nm || {}); return s.names; }, {});
const stepIdx = Object.fromEntries(STEPS.map((s, i) => [s.id, i]));
const PEOPLE = DATA.people;
const GROUPS = [
  { k: 'han', n: ['Han', '汉'], c: FAC.han.c, who: ['liubang', 'luzhi', 'zhangliang', 'hanxin'] },
  { k: 'chu', n: ['Chu', '楚'], c: FAC.chu.c, who: ['xiangyu', 'fanzeng'] }
];
const ORDER = GROUPS.flatMap((g) => g.who);
Object.values(PEOPLE).forEach((per) => {
  per.deathIdx = STEPS.findIndex((s) => per.life[s.id] && per.life[s.id][3]);
  per.firstIdx = STEPS.findIndex((s) => per.life[s.id]);
});

/* text lookups that follow the current language */
// is a fill light enough to need dark text on it? (relative luminance of a #rrggbb colour)
const light = (hex) => { const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2] > 0.55; };
const facName = (si, f) => { const o = STEPS[si].names[f]; return o ? o[L()] : FAC[f].n[L()]; };
const stepTitle = (i) => STEPS[i][isZh() ? 'zh' : 'en'].t;
const stepText = (i) => STEPS[i][isZh() ? 'zh' : 'en'].x;
const perName = (k) => PEOPLE[k].n[L()];
const perCh = (k) => PEOPLE[k].ch[L()];
// "205–204" -> "205–204 BC" or "前205–前204年"
const yrLabel = (yr) => (isZh() ? String(yr).split('–').map((x) => '前' + x).join('–') + '年' : yr + ' BC');

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
  try { localStorage.setItem('ch-lang', l); } catch (e) {}
  try { const u = new URL(location.href); u.searchParams.set('lang', l); history.replaceState(null, '', u); } catch (e) {}
  applyStatic();
  langHooks.forEach((f) => f());
}
const langBtn = document.getElementById('langBtn');
if (langBtn) { if (!ZH) langBtn.hidden = true; else langBtn.addEventListener('click', () => setLang(isZh() ? 'en' : 'zh')); }
applyStatic();


/* ================= THE MAP ================= */
(function () {
  const svg = document.getElementById('chMap'); if (!svg) return;
  const wrap = document.createElement('div'); wrap.className = 'ch-mapwrap';
  svg.parentNode.insertBefore(wrap, svg); wrap.appendChild(svg);
  const stepsBox = document.getElementById('chSteps');
  const yearEl = document.getElementById('chYear'), titleEl = document.getElementById('chTitle'), legendEl = document.getElementById('chLegend');
  const W = 600, H = NARROW ? 470 : 560;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const hasMap = window.d3 && window.topojson && window.__WORLD110M;
  const proj = hasMap
    ? d3.geoMercator().fitExtent([[6, 6], [W - 6, H - 6]], { type: 'MultiPoint', coordinates: [[101.5, 21.5], [125.5, 42.3]] })
    : null;
  if (!proj) { svg.insertAdjacentHTML('afterend', '<p class="ch-note">The map needs JavaScript and an internet connection to load.</p>'); return; }
  const pt = (x) => proj(x);
  const ring = (pts) => 'M' + pts.map((p) => pt(p).map((v) => v.toFixed(1)).join(' ')).join('L') + 'Z';

  // land and sea; the sea reaches past the drawing area so a wide box shows sea, not blank bands
  mk('rect', { x: -W * 2, y: -H * 2, width: W * 5, height: H * 5, fill: '#dfe6ea' }, svg);
  const world = window.__WORLD110M;
  const feats = topojson.feature(world, world.objects.countries).features;
  const NEAR = new Set(['China', 'Vietnam', 'Laos', 'Myanmar', 'Mongolia', 'North Korea', 'South Korea', 'Taiwan', 'Thailand', 'Russia', 'India', 'Bhutan', 'Japan']);
  const CLIP = new Set(['China', 'Vietnam', 'North Korea']);
  const gp = d3.geoPath(proj);
  feats.filter((f) => NEAR.has(f.properties.name)).forEach((f) => mk('path', { d: gp(f), fill: '#f1ede3', stroke: '#d9d2c2', 'stroke-width': 0.5 }, svg));
  const defs = mk('defs', {}, svg);
  const clip = mk('clipPath', { id: 'chLand' }, defs);
  feats.filter((f) => CLIP.has(f.properties.name)).forEach((f) => mk('path', { d: gp(f) }, clip));
  const regG = mk('g', { 'clip-path': 'url(#chLand)' }, svg);
  const regEls = {};
  Object.entries(REG).forEach(([k, v]) => {
    regEls[k] = mk('path', { d: ring(v.p), class: 'ch-prov', fill: FAC.qin.c, stroke: 'none' }, regG);
  });
  // borders on their own layer: solid, except the lines along which a later kingdom was carved out
  // of an older unit (Jinan out of Jibei, Dongyang out of Sishui), which are dotted
  const segKey = (a, b) => [a, b].map((p) => p.join(',')).sort().join('|');
  const CUT = new Set();
  CUTS.forEach((line) => line.forEach((p, i) => { if (i) CUT.add(segKey(line[i - 1], p)); }));
  const seg = (a, b) => `M${pt(a).map((v) => v.toFixed(1)).join(' ')}L${pt(b).map((v) => v.toFixed(1)).join(' ')}`;
  let solid = '';
  Object.values(REG).forEach((v) => v.p.forEach((a, i) => { const b = v.p[(i + 1) % v.p.length]; if (!CUT.has(segKey(a, b))) solid += seg(a, b); }));
  const borderEls = [
    mk('path', { d: solid, fill: 'none', stroke: '#fff', 'stroke-width': 0.9, 'stroke-linecap': 'round' }, regG),
    mk('path', { d: CUTS.map((line) => 'M' + line.map((p) => pt(p).map((v) => v.toFixed(1)).join(' ')).join('L')).join(''), fill: 'none', stroke: '#fff', 'stroke-width': 1.3, 'stroke-dasharray': '1.5 3', 'stroke-linecap': 'round', class: 'ch-cut' }, regG)
  ];
  // the steppe to the north: the Xiongnu
  const steppe = say(svg, pt([108, 41.4])[0], pt([108, 41.4])[1], '', { 'text-anchor': 'middle', 'font-size': NARROW ? 13 : 12, 'font-weight': 800, 'letter-spacing': '.2em', fill: 'rgba(90,70,50,.55)' });
  // region names, small
  const centroid = (pts) => d3.polygonCentroid(pts.map(pt));
  const regLab = mk('g', { class: 'ch-provlab' }, svg);
  // the small regions round Luoyang and Pengcheng crowd the capitals' names, so they go unlabelled
  const SMALL = new Set(['henan', 'hann', 'liang', 'yin', 'chen', 'sai', 'jinan']);
  // ...until the reader zooms in, when there is room for them (class ch-small, shown by .is-close)
  const regTexts = Object.entries(REG).map(([k, v]) => {
    const c = LABEL_AT[k] ? pt(LABEL_AT[k]) : centroid(v.p);
    return [k, say(regLab, c[0], c[1], '', { 'text-anchor': 'middle', 'font-size': NARROW ? 11.5 : 10, fill: 'rgba(255,255,255,.8)', 'font-weight': 600, class: SMALL.has(k) ? 'ch-small' : '' })];
  });
  // capitals
  const cityG = mk('g', {}, svg);
  const cityEls = CITIES.map(([k, when]) => {
    const c = pt(ll(k));
    const g = mk('g', {}, cityG);
    mk('circle', { cx: c[0], cy: c[1], r: 2.6, fill: '#1f1f22', stroke: '#fff', 'stroke-width': 1 }, g);
    const t = say(g, c[0] + 5, c[1] - 4, '', { 'font-size': NARROW ? 12 : 10.5, 'font-weight': 700, fill: '#1f1f22', 'paint-order': 'stroke', stroke: 'rgba(255,255,255,.85)', 'stroke-width': 3 });
    return { k, when, g, t };
  });
  const mapLabels = () => {
    regTexts.forEach(([k, t]) => { t.textContent = REG[k].n[L()]; });
    cityEls.forEach((c) => { c.t.textContent = placeName(c.k); });
    steppe.textContent = isZh() ? '匈 奴' : 'XIONGNU';
  };
  const facLab = mk('g', { class: 'ch-faclab' }, svg);
  const ovG = mk('g', { class: 'ch-ov' }, svg);
  // marker tooltip: on hover with a mouse, on tap on phones
  let vp = null; // the drag/zoom group, set up below
  const tip = document.createElement('div'); tip.className = 'ch-tipbox'; tip.hidden = true;
  wrap.appendChild(tip);
  let tipTimer = 0;
  const showTip = (m) => {
    const c = (vp || svg).getScreenCTM(); if (!c) return; // marker positions are in the zoomed group's coordinates
    const p = svg.createSVGPoint(); [p.x, p.y] = m.__xy; const q = p.matrixTransform(c);
    const r = wrap.getBoundingClientRect();
    tip.innerHTML = `<b>${m.__name}</b>${m.__desc ? `<span>${m.__desc}</span>` : ''}`;
    tip.hidden = false;
    const w = tip.offsetWidth, h = tip.offsetHeight;
    let x = q.x - r.left - w / 2, y = q.y - r.top - h - 14;
    if (y < 4) y = q.y - r.top + 16;
    tip.style.left = Math.max(4, Math.min(r.width - w - 4, x)) + 'px';
    tip.style.top = y + 'px';
  };
  const hideTip = () => { tip.hidden = true; };
  ovG.addEventListener('pointerover', (e) => { const m = e.target.closest('.ch-mk'); if (m && e.pointerType === 'mouse') showTip(m); });
  ovG.addEventListener('pointerout', (e) => { const m = e.target.closest('.ch-mk'); if (m && e.pointerType === 'mouse' && !m.contains(e.relatedTarget)) hideTip(); });
  ovG.addEventListener('click', (e) => {
    const m = e.target.closest('.ch-mk'); if (!m) return;
    showTip(m); clearTimeout(tipTimer); tipTimer = setTimeout(hideTip, 5000);
  });
  // view switch and the big-names switch
  let view = 'political', showNames = true;
  const head = document.querySelector('.ch-head');
  const viewBox = document.createElement('div'); viewBox.className = 'ch-views'; viewBox.setAttribute('role', 'group');
  head.appendChild(viewBox);
  const renderViews = () => {
    viewBox.setAttribute('aria-label', isZh() ? '地图视图' : 'Map view');
    viewBox.innerHTML = VIEWS.map(([k, en, zh]) => `<button type="button" data-v="${k}" aria-pressed="${k === view}">${isZh() ? zh : en}</button>`).join('');
  };
  viewBox.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; view = b.dataset.v; renderViews(); draw(curSi, curWho); });
  const namesBtn = document.createElement('button'); namesBtn.type = 'button'; namesBtn.className = 'ch-namesbtn';
  head.appendChild(namesBtn);
  const renderNamesBtn = () => {
    namesBtn.setAttribute('aria-pressed', showNames);
    namesBtn.textContent = (isZh() ? '势力名称' : 'Big names') + (showNames ? (isZh() ? '：开' : ': on') : (isZh() ? '：关' : ': off'));
  };
  namesBtn.addEventListener('click', () => { showNames = !showNames; renderNamesBtn(); draw(curSi, curWho); });
  // the capitals switch: hides the city dots and names
  let showCities = true;
  const citiesBtn = document.createElement('button'); citiesBtn.type = 'button'; citiesBtn.className = 'ch-namesbtn';
  head.appendChild(citiesBtn);
  const renderCitiesBtn = () => {
    citiesBtn.setAttribute('aria-pressed', showCities);
    citiesBtn.textContent = (isZh() ? '城市' : 'Cities') + (showCities ? (isZh() ? '：开' : ': on') : (isZh() ? '：关' : ': off'));
  };
  citiesBtn.addEventListener('click', () => { showCities = !showCities; renderCitiesBtn(); cityG.style.display = showCities ? '' : 'none'; });
  langHooks.push(renderCitiesBtn);
  renderViews(); renderNamesBtn(); renderCitiesBtn();
  let curSi = 0, curWho = 'liubang';
  // the chosen person's trail and position
  const trail = mk('path', { fill: 'none', stroke: '#111', 'stroke-width': 2, 'stroke-dasharray': '2 5', 'stroke-linecap': 'round', opacity: 0.8 }, svg);
  const trailDots = mk('g', {}, svg);
  const me = mk('g', { class: 'ch-me' }, svg);
  const pulse = mk('circle', { r: 9, fill: 'none', stroke: '#111', 'stroke-width': 2, class: 'ch-pulse' }, me);
  const meDot = mk('circle', { r: 7, fill: '#111', stroke: '#fff', 'stroke-width': 2.5 }, me);
  const meTag = mk('g', {}, me);

  /* ---- drag and zoom ----
     Everything drawn so far moves into one group that d3.zoom transforms. The map can't be dragged
     off its frame. So the page still scrolls normally over the map, the mouse wheel zooms only with
     Ctrl/⌘ (a trackpad pinch sends that too), and on touch screens one finger pans only once zoomed in;
     two fingers pinch. */
  vp = mk('g', { class: 'ch-vp' });
  [...svg.childNodes].filter((n) => n !== defs).forEach((n) => vp.appendChild(n));
  svg.appendChild(vp);
  let zk = 1;
  const zoom = d3.zoom()
    .scaleExtent([1, 5])
    .translateExtent([[0, 0], [W, H]])
    .extent([[0, 0], [W, H]])
    .clickDistance(4)
    .filter((e) => {
      if (e.type === 'wheel') return e.ctrlKey || e.metaKey;
      if (e.type.startsWith('touch')) return e.touches.length > 1 || zk > 1;
      return !e.button;
    })
    .on('zoom', (e) => {
      zk = e.transform.k;
      vp.setAttribute('transform', e.transform.toString());
      svg.style.touchAction = zk > 1 ? 'none' : 'pan-y';
      wrap.classList.toggle('is-zoomed', zk > 1.01);
      wrap.classList.toggle('is-close', zk >= 1.5); // close enough to name the small regions
      hideTip();
    });
  // labels stay at their normal size while the map zooms: divide each text's size (and halo) by the zoom,
  // and border lines keep their width
  const fitText = () => {
    vp.querySelectorAll('text').forEach((t) => {
      const fs = parseFloat(t.getAttribute('font-size')), sw = parseFloat(t.getAttribute('stroke-width'));
      if (fs) t.style.fontSize = (fs / zk) + 'px';
      if (sw) t.style.strokeWidth = (sw / zk) + 'px';
    });
  };
  let fitQueued = false;
  new MutationObserver(() => { if (zk !== 1 && !fitQueued) { fitQueued = true; requestAnimationFrame(() => { fitQueued = false; fitText(); }); } })
    .observe(vp, { childList: true, subtree: true });
  zoom.on('zoom.text', fitText);
  borderEls.forEach((p) => p.setAttribute('vector-effect', 'non-scaling-stroke'));
  d3.select(svg).call(zoom).on('dblclick.zoom', null);
  svg.style.touchAction = 'pan-y';
  const zc = document.createElement('div'); zc.className = 'ch-zoom';
  const renderZoom = () => {
    zc.innerHTML = [['in', '+', isZh() ? '放大' : 'Zoom in'], ['out', '−', isZh() ? '缩小' : 'Zoom out'], ['reset', '⟲', isZh() ? '复位' : 'Reset view']]
      .map(([k, s, t]) => `<button type="button" data-z="${k}" aria-label="${t}" title="${t}">${s}</button>`).join('') +
      `<span class="ch-zhint">${isZh() ? '放大后可拖动地图' : 'Zoom in, then drag to move'}</span>`;
  };
  renderZoom(); langHooks.push(renderZoom);
  wrap.appendChild(zc);
  zc.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const s = d3.select(svg).transition().duration(reduced ? 0 : 350);
    if (b.dataset.z === 'in') s.call(zoom.scaleBy, 1.6);
    else if (b.dataset.z === 'out') s.call(zoom.scaleBy, 1 / 1.6);
    else s.call(zoom.transform, d3.zoomIdentity);
  });
  const meBg = mk('rect', { rx: 3, height: 20, y: -32, fill: '#111' }, meTag);
  const meTx = say(meTag, 0, -18, '', { 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 800, fill: '#fff' });
  const area = (pts) => Math.abs(d3.polygonArea(pts.map(pt)));

  function drawView(si) {
    const zh = isZh();
    ovG.innerHTML = ''; tip.hidden = true;
    regG.style.opacity = view === 'political' ? 1 : 0.4;
    facLab.style.display = view === 'political' && showNames ? '' : 'none';
    trail.style.display = trailDots.style.display = view === 'political' ? '' : 'none';
    if (view !== 'battles') return;
    BATTLES.filter((b) => stepIdx[b[0]] <= si).forEach(([sid, place, f, en, zhn, den, dzh]) => {
      const c = pt(ll(place)), now = stepIdx[sid] === si, yr = STEPS[stepIdx[sid]].y;
      const grp = mk('g', { transform: `translate(${c[0]} ${c[1]})`, opacity: now ? 1 : 0.7, class: 'ch-mk' }, ovG);
      Object.assign(grp, { __xy: c, __name: `${zh ? zhn : en} · ${yrLabel(yr)}`, __desc: zh ? dzh : den });
      grp.setAttribute('aria-label', grp.__name);
      mk('circle', { r: 10, fill: 'transparent' }, grp); // a bigger target for hover and tap
      if (now) mk('circle', { r: 16, fill: 'none', stroke: FAC[f].c, 'stroke-width': 2.5, class: 'ch-pulse' }, grp);
      const k = now ? 7 : 4.5;
      mk('path', { d: `M-${k} -${k} L${k} ${k} M${k} -${k} L-${k} ${k}`, stroke: FAC[f].c, 'stroke-width': now ? 4 : 2.5, 'stroke-linecap': 'round' }, grp);
      if (now) say(grp, 11, -7, zh ? zhn : en, { 'font-size': NARROW ? 13 : 12, 'font-weight': 800, fill: '#1f1f22', 'paint-order': 'stroke', stroke: 'rgba(255,255,255,.9)', 'stroke-width': 3 });
    });
    legendEl.innerHTML = `<span class="ch-lnote">${zh ? '✕ 颜色为胜方或起事一方；只标注本节点的战役，悬停或点按查看说明。' : '✕ coloured by the winner (or the side that rose); only this step’s battles are named. Hover or tap for details.'}</span>`;
  }
  function draw(si, who) {
    curSi = si; curWho = who;
    const s = STEPS[si];
    Object.entries(s.map).forEach(([k, f]) => regEls[k].setAttribute('fill', FAC[f].c));
    regTexts.forEach(([k, t]) => t.setAttribute('fill', light(FAC[s.map[k]].c) ? 'rgba(20,20,20,.5)' : 'rgba(255,255,255,.75)'));
    cityEls.forEach((c) => { c.g.style.display = !c.when || c.when(s.y) ? '' : 'none'; });
    // a side's name goes in its biggest region: after 202 the kings' lands are scattered, and their middle can be someone else's
    facLab.innerHTML = '';
    const tally = {};
    Object.entries(s.map).forEach(([k, f]) => { const a = area(REG[k].p); (tally[f] = tally[f] || { a: 0, big: 0, k }); tally[f].a += a; if (a > tally[f].big) { tally[f].big = a; tally[f].k = k; } });
    const total = Object.values(tally).reduce((a, t) => a + t.a, 0);
    Object.entries(tally).forEach(([f, t]) => {
      if (f === 'other' || t.a < total * (FAC[f].k ? 0.015 : 0.07)) return;
      const name = FAC[f].k ? facName(si, f) : FAC[f].b && !STEPS[si].names[f] ? FAC[f].b[L()] : facName(si, f).replace(/ \(.*\)|（.*）/, '');
      const c = LABEL_AT[t.k] ? pt(LABEL_AT[t.k]) : centroid(REG[t.k].p);
      say(facLab, c[0], c[1] + 16, isZh() ? name : name.replace(/^[^(]+/, (m) => m.toUpperCase()), // "CHU (Han Xin)"
         { 'text-anchor': 'middle', 'font-size': NARROW ? 16 : 14, 'font-weight': 800, 'letter-spacing': '.05em', fill: '#fff', 'paint-order': 'stroke', stroke: FAC[f].c, 'stroke-width': 4 });
    });
    legendEl.innerHTML = Object.keys(tally).sort((a, b) => tally[b].a - tally[a].a)
      .map((f) => `<span><i style="background:${FAC[f].c}"></i>${facName(si, f)}</span>`).join('');
    yearEl.textContent = yrLabel(s.yr); titleEl.textContent = stepTitle(si);
    drawView(si);
    // the person: their route so far, and where they are now
    const per = PEOPLE[who], col = per.c, st = status(who, si);
    const path = [];
    for (let i = 0; i <= si; i++) { const e = per.life[STEPS[i].id]; if (e && e[0] && (per.deathIdx < 0 || i <= per.deathIdx)) path.push(pt(ll(e[0]))); }
    trail.setAttribute('d', path.length > 1 ? 'M' + path.map((p) => p.join(' ')).join('L') : '');
    trail.setAttribute('stroke', col);
    trailDots.innerHTML = '';
    path.slice(0, -1).forEach((p) => mk('circle', { cx: p[0], cy: p[1], r: 3, fill: col, opacity: 0.7 }, trailDots));
    if (st.place && (st.kind === 'here' || st.kind === 'silent' || st.kind === 'dies')) {
      const c = pt(ll(st.place));
      me.style.display = '';
      me.style.opacity = st.kind === 'silent' ? 0.55 : 1;
      me.setAttribute('transform', `translate(${c[0]} ${c[1]})`);
      meDot.setAttribute('fill', col);
      pulse.setAttribute('stroke', col);
      meTx.textContent = perName(who) + (st.kind === 'dies' ? ' †' : '');
      const w = meTx.getComputedTextLength() + 14;
      meBg.setAttribute('x', -w / 2); meBg.setAttribute('width', w); meBg.setAttribute('fill', col);
      const dx = Math.max(-c[0] + w / 2 + 4, Math.min(W - c[0] - w / 2 - 4, 0));
      meTag.setAttribute('transform', `translate(${dx} ${c[1] < 40 ? 50 : 0})`);
    } else me.style.display = 'none';
  }

  /* ---------------- the steps and the person picker ---------------- */
  let who = 'liubang', si = 0;
  /* where a person stands at step i: not yet born, an entry for this step, silent (alive, no entry), or dead */
  function status(k, i) {
    const per = PEOPLE[k], s = STEPS[i], e = per.life[s.id];
    let last = null;
    for (let j = i; j >= 0; j--) { const x = per.life[STEPS[j].id]; if (x && x[0]) { last = x[0]; break; } }
    if (per.deathIdx >= 0 && i > per.deathIdx) return { kind: 'dead', e };
    if (e) return { kind: e[3] ? 'dies' : 'here', e, place: e[0] || last };
    if (per.born && s.y > per.born) return { kind: 'unborn' };
    if (i < per.firstIdx) return { kind: 'early' };
    return { kind: 'silent', place: last };
  }
  function personBlock(i) {
    const per = PEOPLE[who], s = STEPS[i], st = status(who, i), zh = isZh();
    let meta, text, cls = '';
    if (st.kind === 'dead') {
      meta = zh ? `卒于前${per.died}年` : `Died ${per.died} BC`;
      text = st.e ? st.e[zh ? 1 : 2] : (zh ? `已于前${per.died}年去世。` : `Died in ${per.died} BC.`);
      cls = ' gone';
    } else if (st.kind === 'early') {
      meta = zh ? '生年不详' : 'Birth year unknown';
      text = zh ? '此时史书对此人尚无记载。' : 'The record has nothing on this person yet.';
      cls = ' quiet';
    } else {
      const a = per.born ? per.born - s.y : null;
      const ageTx = a === null ? (zh ? '年龄不详' : 'Age unknown') : (zh ? `约${a}岁` : `Age about ${a}`) + (per.bornNote ? (zh ? '（生年有两说）' : ' (birth year disputed)') : '');
      meta = ageTx + (st.place ? ` · ${placeName(st.place)}` : '') + (st.kind === 'dies' ? (zh ? ' · 去世' : ' · dies') : '');
      if (st.kind === 'silent') {
        text = zh ? '这段时间史书对此人没有专门记载。' : 'The histories say nothing specific about this person in these years.';
        cls = ' quiet';
      } else text = st.e[zh ? 1 : 2];
    }
    const sub = zh ? '' : ` <span lang="zh">${per.zh}</span>`;
    return `<div class="ch-who${cls}" style="--pc:${per.c}">
      <div class="ch-av" aria-hidden="true" lang="zh">${perCh(who)}</div>
      <div><div class="ch-wn">${perName(who)}${sub}</div><div class="ch-wm">${meta}</div></div>
    </div><p class="ch-wt${cls}" style="--pc:${per.c}">${text}</p>`;
  }
  function quoteBlock(i) {
    const q = STEPS[i].q; if (!q) return '';
    const src = `<div class="ch-qs">${isZh() ? '原文' : 'Original text'} · <span lang="zh">${q.s}</span></div>`;
    return `<blockquote class="ch-q">${src}<p lang="zh">「${q.c}」</p>${isZh() ? '' : `<p class="ch-qe">${q.en}</p>`}</blockquote>`;
  }

  stepsBox.innerHTML = STEPS.map((s, i) => `<div class="ch-step" data-i="${i}"><div class="card">
    <div class="ch-yr"><span class="ch-yl"></span> <span lang="zh">· ${s.era}</span></div><h3 class="ch-h"></h3><p class="ch-p"></p>
    <div class="ch-quote"></div>
    <div class="ch-person"></div></div></div>`).join('');
  const stepEls = [...stepsBox.querySelectorAll('.ch-step')];
  const personEls = [...stepsBox.querySelectorAll('.ch-person')];
  const renderPeople = () => personEls.forEach((el, i) => { el.innerHTML = personBlock(i); });
  const renderSteps = () => stepEls.forEach((el, i) => {
    el.querySelector('.ch-yl').textContent = yrLabel(STEPS[i].yr);
    el.querySelector('.ch-h').textContent = stepTitle(i);
    el.querySelector('.ch-p').textContent = stepText(i);
    el.querySelector('.ch-quote').innerHTML = quoteBlock(i);
  });
  renderSteps();

  const toggles = document.querySelectorAll('.ch-pick');
  const syncPicker = () => toggles.forEach((box) => {
    const sel = box.querySelector('select'); if (sel) sel.value = who;
    const av = box.querySelector('.ch-selav');
    if (av) { av.textContent = perCh(who); av.style.setProperty('--pc', PEOPLE[who].c); }
  });
  function pick(k, from) {
    who = k;
    syncPicker();
    renderPeople(); draw(si, who);
    document.querySelectorAll('#castSvg .cast-row').forEach((g) => g.classList.toggle('on', g.dataset.p === k));
    if (from === 'cast') document.getElementById('chScrolly').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }
  const renderToggles = () => {
    toggles.forEach((box) => {
      const opts = GROUPS.map((g) => `<optgroup label="${g.n[L()]}">` +
        g.who.map((k) => `<option value="${k}">${perName(k)}</option>`).join('') + '</optgroup>').join('');
      box.innerHTML = `<span class="ch-selav" aria-hidden="true" lang="zh"></span><select class="ch-sel" aria-label="${isZh() ? '选择要跟随的人物' : 'Choose whose life to follow'}">${opts}</select>`;
    });
    syncPicker();
  };
  toggles.forEach((box) => box.addEventListener('change', (e) => { if (e.target.matches('select')) pick(e.target.value); }));
  renderToggles();
  window.__chPick = pick;
  window.__chWho = () => who;
  mapLabels();
  langHooks.push(() => { mapLabels(); renderViews(); renderNamesBtn(); renderSteps(); renderPeople(); renderToggles(); draw(si, who); });

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
  // hide the "In this story" list while the wide timeline or legend table is on screen
  const wideOn = new Set();
  const wideObs = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) wideOn.add(e.target); else wideOn.delete(e.target); });
    document.body.classList.toggle('ch-wide', wideOn.size > 0);
  }, { rootMargin: '-20% 0px -20% 0px' });
  ['chScrolly', 'legendFig'].forEach((id) => { const el = document.getElementById(id); if (el) wideObs.observe(el); });
  renderPeople(); setStep(0);
})();

/* ================= THE CAST: six lifespans on one timeline ================= */
(function () {
  const s = document.getElementById('castSvg'); if (!s) return;
  const A0 = 262, A1 = 175; // axis, years BC (left to right)
  function build() {
    s.innerHTML = '';
    const zh = isZh();
    const NAR = matchMedia('(max-width: 560px)').matches;
    const W = NAR ? 360 : 680, Lm = NAR ? 12 : 130, R = W - (NAR ? 44 : 70), RH = NAR ? 50 : 40, T = 50;
    const H = T + ORDER.length * RH + 30;
    s.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const X = (y) => Lm + (A0 - Math.min(A0, y)) / (A0 - A1) * (R - Lm);
    const MARKS = [[221, 'Qin unifies', '秦统一'], [209, 'Revolt', '大泽乡起义'], [202, 'Han founded', '汉朝建立'], [180, 'Lü Zhi dies', '吕后去世']];
    MARKS.forEach(([y, en, zhl], i) => {
      mk('line', { x1: X(y), x2: X(y), y1: T - 8, y2: H - 22, stroke: '#d8d2c4', 'stroke-dasharray': '3 4' }, s);
      say(s, X(y), i % 2 ? T - 14 : T - 30, zh ? zhl : en, { 'text-anchor': 'middle', 'font-size': NAR ? 10 : 11, 'font-weight': 700, fill: '#8a8578' });
    });
    [260, 240, 220, 200, 180].forEach((y) => say(s, X(y), H - 6, zh ? `前${y}` : `${y} BC`, { 'text-anchor': 'middle', 'font-size': 10.5, fill: '#8a8578' }));
    ORDER.forEach((k, i) => {
      const per = PEOPLE[k], col = per.c, y = T + i * RH + (NAR ? 18 : 8);
      const g = mk('g', { class: 'cast-row', 'data-p': k, tabindex: 0, role: 'button', 'aria-label': zh ? `在时间线中跟随${perName(k)}` : `Follow ${perName(k)} through the timeline` }, s);
      mk('rect', { x: 0, y: y - (NAR ? 20 : 8), width: W, height: RH, fill: 'transparent' }, g);
      const b0 = per.born || 228; // unknown births: dashed until the first record
      if (!per.born) mk('rect', { x: X(250), y, width: X(b0) - X(250), height: 16, fill: 'none', stroke: col, 'stroke-dasharray': '3 3', rx: 3 }, g);
      mk('rect', { x: X(b0), y, width: X(per.died) - X(b0), height: 16, rx: 3, fill: col, class: 'cast-bar' }, g);
      if (per.born && per.born > A0) say(g, X(A0) + 3, y + 12, '◀', { 'font-size': 10, fill: '#fff' });
      const nameX = NAR ? X(per.born ? b0 : 250) : Lm - 10, nameY = NAR ? y - 5 : y + 12;
      say(g, nameX, nameY, perName(k), { 'text-anchor': NAR ? 'start' : 'end', 'font-size': 13, 'font-weight': 800, fill: '#1f1f22' });
      const born = per.born ? per.born + (per.bornNote ? '?' : '') : '?';
      say(g, X(per.died) + 6, y + 12, zh ? `前${born}–${per.diedNote ? '约' : ''}${per.died}` : `${born}–${per.diedNote ? 'c.' : ''}${per.died}`, { 'font-size': 11, fill: '#5d5a55' });
      const go = () => window.__chPick && window.__chPick(k, 'cast');
      g.addEventListener('click', go);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      if (k === (window.__chWho ? window.__chWho() : 'liubang')) g.classList.add('on');
    });
  }
  build();
  langHooks.push(build);
})();

/* ================= HISTORY AND LEGEND: the table, built from js/chu-han-data.js ================= */
(function () {
  const N = DATA.legend, fig = document.getElementById('legendFig'); if (!N || !fig) return;
  const table = fig.querySelector('table'); if (!table) return;
  table.classList.add('ch-leg');
  function build() {
    const zh = isZh(), i = zh ? 1 : 0;
    const head = zh ? ['情节', '传说怎么讲', '史书怎么写'] : ['Scene', 'The story', 'The record'];
    table.innerHTML = `<thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>` +
      N.rows.map((r) => {
        const [ven, vzh, vc] = N.verdicts[r.v];
        const quote = r.q ? `<blockquote class="ch-nq"><div class="ch-qs">${zh ? '原文' : 'Original text'} · <span lang="zh">${r.q.src}</span></div><p lang="zh">「${r.q.c}」</p>${zh ? '' : `<p class="ch-qe">${r.q.en}</p>`}</blockquote>` : '';
        return `<tr><td><span class="ch-sc">${r.s[i]}</span><span class="ch-vd" style="--vc:${vc}">${zh ? vzh : ven}</span></td>` +
          `<td data-h="${head[1]}">${r.n[i]}</td><td data-h="${head[2]}">${r.h[i]}${quote}</td></tr>`;
      }).join('') + '</tbody>';
  }
  build();
  langHooks.push(build);
})();
