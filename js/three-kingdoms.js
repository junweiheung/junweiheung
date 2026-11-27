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
}), { threshold: 0, rootMargin: '0px 0px -12% 0px' }); // any part on screen counts, so very tall figures still appear
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
  liang: { n: 'Liang 涼', p: [[92, 40.5], [104, 40.5], [106.5, 37.5], [106.8, 35.6], [105.8, 34.2], [103.5, 34.0], [101, 35], [98, 33], [92, 37]] },
  bing: { n: 'Bing 并', p: [[106.5, 37.5], [104, 40.5], [107, 41.5], [112, 41.3], [114.3, 40.3], [114.0, 37.8], [113.9, 36.2], [113.6, 35.3], [111.8, 35.8], [110.3, 36.2], [108.6, 35.4], [106.8, 35.6]] },
  sili: { n: 'Sili 司隸', p: [[106.8, 35.6], [108.6, 35.4], [110.3, 36.2], [111.8, 35.8], [113.6, 35.3], [114.3, 35.4], [114.3, 34.8], [113.9, 34.2], [112.8, 33.9], [110.8, 33.7], [108.5, 33.8], [106.6, 34.0], [105.8, 34.2]] },
  ji: { n: 'Ji 冀', p: [[114.0, 37.8], [114.3, 40.3], [115.2, 39.2], [116.6, 38.9], [117.6, 38.6], [119, 39.2], [119, 38.3], [117.9, 38.2], [116.2, 37.6], [116.8, 36.8], [115.8, 36.3], [114.6, 35.8], [114.3, 35.4], [113.6, 35.3], [113.9, 36.2]] },
  you: { n: 'You 幽', p: [[114.3, 40.3], [112, 41.3], [115, 42.3], [120, 42.5], [120.5, 41.0], [120.3, 39.5], [119, 39.2], [117.6, 38.6], [116.6, 38.9], [115.2, 39.2]] },
  liaodong: { n: 'Liaodong 遼東', p: [[120, 42.5], [125.5, 43], [126.5, 40.5], [125.6, 39.3], [124, 39.4], [121, 38.6], [120.3, 39.5], [120.5, 41.0]] },
  qing: { n: 'Qing 青', p: [[116.2, 37.6], [117.9, 38.2], [119, 38.3], [123, 38], [122.8, 36.5], [120.8, 35.9], [119.3, 35.9], [117.8, 35.9], [116.8, 36.8]] },
  yan: { n: 'Yan 兗', p: [[115.8, 36.3], [116.8, 36.8], [117.8, 35.9], [117.4, 35.1], [116.4, 34.6], [115.2, 34.4], [114.3, 34.8], [114.3, 35.4], [114.6, 35.8]] },
  xu: { n: 'Xu 徐', p: [[117.8, 35.9], [119.3, 35.9], [120.8, 35.9], [121.5, 34.5], [121.4, 33.0], [118.6, 33.0], [117.0, 33.5], [116.4, 34.6], [117.4, 35.1]] },
  yu: { n: 'Yu 豫', p: [[114.3, 34.8], [115.2, 34.4], [116.4, 34.6], [117.0, 33.5], [116.3, 32.5], [115.0, 32.2], [113.9, 32.4], [113.0, 33.0], [112.8, 33.9], [113.9, 34.2]] },
  huainan: { n: 'Huainan 淮南', p: [[115.0, 32.2], [116.3, 32.5], [117.0, 33.5], [118.6, 33.0], [121.4, 33.0], [122.0, 31.8], [119.5, 32.25], [118.6, 32.2], [118.0, 31.4], [117.2, 30.6], [116.1, 29.9], [115.4, 30.0], [114.6, 31.4], [113.9, 32.4]] },
  jiangdong: { n: 'Jiangdong 江東', p: [[122.0, 31.8], [122.5, 31], [122, 28], [119.8, 25.8], [119.4, 24.6], [117.3, 23.5], [116.5, 24.8], [114.0, 26.0], [114.2, 28.5], [115.4, 30.0], [116.1, 29.9], [117.2, 30.6], [118.0, 31.4], [118.6, 32.2], [119.5, 32.25]] },
  jingN: { n: 'North Jing 荊', p: [[110.8, 33.7], [112.8, 33.9], [113.0, 33.0], [113.9, 32.4], [114.6, 31.4], [113.6, 30.9], [112.3, 30.9], [111.2, 31.3], [110.0, 31.6], [110.2, 32.6]] },
  jingS: { n: 'South Jing 荊', p: [[110.0, 31.6], [111.2, 31.3], [112.3, 30.9], [113.6, 30.9], [114.6, 31.4], [115.4, 30.0], [114.2, 28.5], [114.0, 26.0], [113.5, 25.2], [111.5, 25.0], [109.5, 26.0], [108.8, 28.5], [109.3, 30.2]] },
  hanzhong: { n: 'Hanzhong 漢中', p: [[105.3, 33.6], [105.8, 34.2], [106.6, 34.0], [108.5, 33.8], [110.8, 33.7], [110.2, 32.6], [108.5, 32.3], [106.5, 32.4], [105.3, 32.6]] },
  yi: { n: 'Yi 益', p: [[98, 33], [101, 35], [103.5, 34.0], [105.8, 34.2], [105.3, 33.6], [105.3, 32.6], [106.5, 32.4], [108.5, 32.3], [110.2, 32.6], [110.0, 31.6], [109.3, 30.2], [108.8, 28.5], [109.5, 26.0], [108.5, 24.8], [106, 23], [104, 22.5], [101, 21.5], [98, 24.5], [97.5, 28]] },
  jiao: { n: 'Jiao 交', p: [[104, 22.5], [106, 23], [108.5, 24.8], [109.5, 26.0], [111.5, 25.0], [113.5, 25.2], [114.0, 26.0], [116.5, 24.8], [117.3, 23.5], [115, 21.5], [111.4, 20.3], [111.4, 18.0], [108.6, 16.2], [106.6, 16.6], [104.8, 18.6], [103.5, 21.5], [101, 21.5]] }
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

/* ---------------- the other map views: economy, population, battles ---------------- */
const VIEWS = [['political', 'Political', '政治'], ['economy', 'Economy', '经济'], ['population', 'People', '人口'], ['battles', 'Battles', '战役']];

/* Economy: resources and policies, each shown from the year it starts (and until it ends, if it does).
   Glyph categories: 盐 salt, 铁 iron, 粮 grain land, 屯 state farms, 马 horses, 锦 silk, 船 fleets, 钱 money. */
const ECON_KIND = { salt: ['盐', '#7f8c99', 'Salt', '盐'], iron: ['铁', '#4d4a46', 'Iron', '铁'], grain: ['粮', '#c49a2c', 'Grain land', '粮区'], farm: ['屯', '#5f8a3a', 'State farms', '屯田'], horse: ['马', '#8a5a3a', 'Horses', '马匹'], silk: ['锦', '#b0447a', 'Silk', '蜀锦'], ship: ['船', '#2f6a8f', 'Fleets', '水军'], coin: ['钱', '#b8892b', 'Money', '钱币'], water: ['堰', '#3f86a8', 'Waterworks', '水利'], tribute: ['贡', '#9a6b2f', 'Tribute', '贡赋'] };
const ECON = [
  { k: 'salt', ll: [110.95, 34.92], from: 155, side: 'l', en: 'Hedong salt lake', zh: '河东盐池', d: ["The great salt lake of Hedong; whoever held it controlled much of the north’s salt.", "河东解县（今运城）盐池，北方食盐的重要来源，控制河东即掌握大量盐利。"] },
  { k: 'salt', ll: [103.45, 30.25], from: 155, en: 'Brine wells of Shu', zh: '蜀地盐井', d: ["Sichuan drilled wells for brine and boiled it into salt, a key revenue for Liu Zhang and then Shu.", "蜀地凿井取卤煮盐，是刘璋和后来蜀汉的重要财源。"] },
  { k: 'salt', ll: [120.9, 30.5], from: 155, en: 'Sea salt', zh: '东南海盐', d: ["Salt boiled from seawater along the south-east coast, a mainstay of Wu’s revenue.", "东南沿海煮海为盐，是东吴的重要收入。"] },
  { k: 'iron', ll: [112.53, 33.0], from: 155, side: 'l', en: 'Nanyang ironworks', zh: '南阳冶铁', d: ["Nanyang had one of the Han’s main iron offices, making farm tools and weapons.", "南阳宛城设有汉代铁官，是农具与兵器的重要产地。"] },
  { k: 'iron', ll: [103.55, 30.65], from: 155, en: 'Linqiong iron', zh: '临邛冶铁', d: ["Linqiong near Chengdu had been famous for iron since the Qin; Shu put officials in charge of salt and iron.", "成都附近的临邛自秦代起以冶铁著称；蜀汉设司盐校尉管理盐铁之利。"] },
  { k: 'grain', ll: [108.4, 34.55], from: 155, en: 'Guanzhong plain', zh: '关中平原', d: ["The irrigated Wei valley around Chang’an, wrecked and emptied by the wars after 190.", "长安周围的渭河平原，190年后屡遭战乱，人口流散。"] },
  { k: 'grain', ll: [115.6, 37.6], from: 155, en: 'Hebei plain', zh: '河北平原', d: ["The densely farmed North China plain: Yuan Shao’s power base, then Cao Cao’s.", "人口稠密的华北平原，先是袁绍的根据地，后归曹操。"] },
  { k: 'grain', ll: [104.3, 31.2], from: 155, en: 'Chengdu plain', zh: '成都平原（天府之土）', d: ["Watered by the Dujiangyan weir; Zhuge Liang called Yi “fertile land for a thousand li, a storehouse of heaven.”", "都江堰灌溉的成都平原，诸葛亮在《隆中对》中称益州“沃野千里，天府之土”。"] },
  { k: 'grain', ll: [119.6, 31.0], from: 196, en: 'Taihu lowlands', zh: '太湖平原', d: ["The lakes and paddy fields around Lake Tai, opened up under the Sun family: the base of Wu’s wealth.", "太湖周围的水乡，在孙氏治下得到开发，是东吴财富的基础。"] },
  { k: 'farm', ll: [113.82, 34.04], from: 196, en: 'State farms at Xu (196)', zh: '许下屯田（196）', d: ["Soldiers and refugees farmed state land around Xu; a note in the Records says the first year yielded a million measures of grain.", "196年在许县周围募民屯田，裴注引《魏书》说当年“得谷百万斛”，解决了曹军的军粮。"] },
  { k: 'farm', ll: [116.6, 32.25], from: 209, en: 'Quebei farms (209)', zh: '芍陂屯田（209）', d: ["Cao Cao restored the old Quebei reservoir south of the Huai and farmed around it to feed the Hefei front.", "曹操在淮南修复芍陂，开垦屯田，为合肥前线供粮。"] },
  { k: 'farm', ll: [107.6, 34.3], from: 234, to: 234, en: 'Zhuge Liang’s army farms (234)', zh: '诸葛亮五丈原屯田（234）', d: ["On his last campaign Zhuge Liang set soldiers to farm among the locals so the army could stay for the long haul.", "诸葛亮最后一次北伐时分兵屯田，与当地百姓杂处，作久驻之计。"] },
  { k: 'farm', ll: [117.6, 33.0], from: 241, en: 'Deng Ai’s Huai farms (241)', zh: '邓艾淮南淮北屯田（241）', d: ["Deng Ai’s canals and farms on both banks of the Huai fed Wei’s armies against Wu for decades.", "邓艾在淮南淮北开渠屯田，为魏国对吴作战提供了长期的军粮。"] },
  { k: 'horse', ll: [101.5, 37.8], from: 155, en: 'Liang horses', zh: '凉州马', d: ["The north-western frontier bred the warhorses behind Ma Teng, Han Sui and Ma Chao.", "西北边地出产战马，是马腾、韩遂、马超骑兵的基础。"] },
  { k: 'horse', ll: [118.6, 41.6], from: 207, en: 'Wuhuan cavalry joins Cao Cao (207)', zh: '乌桓突骑归曹（207）', d: ["After White Wolf Mountain, Wuhuan horsemen joined Cao Cao’s armies and were called the finest cavalry in the realm.", "白狼山之战后，乌桓骑兵编入曹军，“由是三郡乌丸为天下名骑”。"] },
  { k: 'silk', ll: [104.06, 30.66], from: 214, en: 'Shu brocade', zh: '蜀锦', d: ["Chengdu’s brocade was Shu’s chief export, and Wei and Wu both bought it. Zhuge Liang is quoted as saying: “The people are poor and the state is empty; the means to fight the enemy rest on brocade alone” (今民贫国虚，决敌之资，唯仰锦耳; his collected works, quoted in the Taiping Yulan). He ran an older trade rather than inventing it: Chengdu’s brocade quarter was already called the “former brocade office”.", "成都织锦是蜀汉最重要的输出品，魏、吴都向蜀购锦。诸葛亮说：“今民贫国虚，决敌之资，唯仰锦耳。”（《太平御览》引《诸葛亮集》）《丹阳记》称江东无锦，“魏则市于蜀，而吴亦资西道”。锦业并非诸葛亮首创，《华阳国志》称成都锦里“故锦官也”。"] },
  { k: 'salt', ll: [104.06, 30.66], from: 215, side: 'l', en: 'Salt and iron officials (after 214)', zh: '司盐校尉、司金中郎将（214年后）', d: ["After Liu Bei took Yi, Wang Lian ran the salt and iron profits as Colonel of Salt, and the gains were “very large, a help to the state’s needs”; Zhang Yi, as Inspector of Metals, made farm tools and weapons. These were posts of the government Zhuge Liang ran.", "刘备取益州后，王连迁司盐校尉，“较盐铁之利，利入甚多，有裨国用”（《王连传》）；张裔为司金中郎将，典作农战之器（《张裔传》）。诸葛亮主政时一直沿用。"] },
  { k: 'tribute', ll: [103.8, 25.5], from: 225, en: 'Nanzhong pays for the army (225)', zh: '南中军资（225）', d: ["After Zhuge Liang’s southern campaign of 225, “the army’s supplies came from there and the state grew rich” (Records); the Huayang Guozhi lists gold, silver, cinnabar, lacquer, plough oxen and warhorses.", "225年诸葛亮南征，“其秋悉平，军资所出，国以富饶”（《诸葛亮传》）。《华阳国志·南中志》称南中“出其金、银、丹、漆、耕牛、战马给军国之用”。"] },
  { k: 'water', ll: [103.62, 31.0], from: 227, en: 'Dujiangyan weir guarded (from 227)', zh: '都江堰置堰官（227年起）', d: ["When he marched north, Zhuge Liang called the weir “the root of farming, what the state relies on”, and set 1,200 conscripts and a weir officer to guard it (Shuijing Zhu).", "《水经注·江水》：“诸葛亮北征，以此堰农本，国之所资，以征丁千二百人主护之，有堰官。”"] },
  { k: 'ship', ll: [119.45, 32.2], from: 200, en: 'Wu fleets', zh: '东吴水军', d: ["Wu’s war fleets on the Yangtze were its main defence against the northern armies.", "长江上的东吴水军，是抵御北方大军的主要屏障。"] },
  { k: 'ship', ll: [114.35, 36.33], from: 208, to: 208, en: 'Xuanwu Pool navy drill (208)', zh: '玄武池练水军（208）', d: ["Cao Cao dug a lake at Ye to train sailors before marching south.", "曹操在邺城开凿玄武池操练水军，准备南征。"] },
  { k: 'coin', ll: [112.45, 34.62], from: 190, to: 196, side: 'l', en: 'Dong Zhuo’s small coins: grain at hundreds of thousands', zh: '董卓铸小钱，谷价飞涨', d: ["Dong Zhuo melted bronze statues into tiny coins; prices soared and a measure of grain cost hundreds of thousands.", "董卓熔铜人、铸小钱，物价飞涨，谷一斛至数十万钱。"] },
  { k: 'salt', ll: [108.4, 33.95], from: 200, side: 'l', en: 'Salt monopoly restored (c. 200)', zh: '复置盐官（约200）', d: ["On Wei Ji’s advice Cao Cao put salt sales back under officials and used the profit to buy oxen and resettle Guanzhong.", "曹操采纳卫觊的建议，恢复官府专卖食盐，用盐利购买耕牛，招抚关中流民。"] },
  { k: 'coin', ll: [104.06, 30.66], from: 214, en: 'Liu Bei’s “worth-a-hundred” coin (214)', zh: '刘备铸直百钱（214）', d: ["With the treasury empty after Chengdu fell, Liu Ba had a coin minted worth a hundred ordinary ones; the treasury filled within months.", "刘备取成都后府库空虚，采纳刘巴的建议铸“直百钱”，数月之间府库充实。"] },
  { k: 'coin', ll: [112.45, 34.62], from: 221, to: 226, side: 'l', en: 'Cao Pi drops coins: trade in grain and silk (221)', zh: '曹丕罢五铢，以谷帛为市（221）', d: ["In 221 Wei stopped using coins and had people trade in grain and silk; coins returned in 227.", "221年魏国罢五铢钱，令百姓以谷帛交易；227年才恢复用钱。"] },
  { k: 'coin', ll: [118.8, 32.05], from: 236, en: 'Sun Quan’s “worth-500” coin (236)', zh: '孙权铸大泉五百（236）', d: ["Wu cast big coins worth 500 and later 1,000 ordinary coins, a disguised tax people resented; they were withdrawn in 246.", "东吴铸“大泉五百”，后又铸“大泉当千”，实为变相加税，民间不便，246年收回。"] }
];

/* People: registered population in the Han census of 140 (Book of the Later Han, treatise on commanderies),
   summed by the map's provinces from the commandery figures. You excludes Liaodong (unknown); Jiao is partial. */
const POP140 = { sili: 3106161, yu: 6179139, ji: 5931973, yan: 4052111, xu: 2791683, qing: 3709803, jingN: 3452686, jingS: 2813266, huainan: 857109, jiangdong: 3481429, hanzhong: 267402, yi: 6256158, liang: 391652, bing: 420228, you: 1556610, liaodong: 300213, jiao: 1114444 };

/* Battles: [year, place, winner's colour key, English, Chinese]. */
const BATTLES = [
  [190, [113.38, 34.8], 'dong', 'Xingyang', '荥阳', "Cao Cao, almost alone among the coalition, attacks Dong Zhuo’s army and is badly beaten by Xu Rong.", "曹操几乎独自进攻董卓军，被徐荣大败。"], [191, [112.7, 34.2], 'sun', 'Yangren', '阳人', "Sun Jian routs Dong Zhuo’s army and kills Hua Xiong, then enters Luoyang.", "孙坚大破董卓军，斩华雄，随后进入洛阳。"], [194, [115.03, 35.7], 'lubu', 'Puyang', '濮阳', "Cao Cao and Lü Bu fight for over a hundred days until famine ends it, neither side winning.", "曹操与吕布相持百余日，因蝗灾饥荒罢兵，未分胜负。"],
  [197, [112.53, 33.0], 'other', 'Wan', '宛城', "Zhang Xiu surrenders, then attacks Cao Cao by night; Cao Ang and Dian Wei are killed.", "张绣先降后叛，夜袭曹营，曹昂、典韦战死。"], [200, [114.6, 35.6], 'cao', 'Baima', '白马', "Cao Cao’s feint lets Guan Yu ride in and kill Yuan Shao’s general Yan Liang.", "曹操声东击西，关羽于万军之中斩袁绍大将颜良。"], [200, [114.05, 34.75], 'cao', 'Guandu', '官渡', "Outnumbered, Cao Cao burns Yuan Shao’s grain at Wuchao and Yuan’s army collapses: the north is decided.", "兵少的曹操火烧乌巢粮草，袁绍大军崩溃，北方归属由此决定。"],
  [204, [114.35, 36.33], 'cao', 'Ye', '邺城', "Cao Cao floods and starves the Yuan capital into surrender; Ye becomes his base.", "曹操引漳水灌城，围困数月攻下袁氏都城，此后以邺为根据地。"], [207, [119.75, 41.13], 'cao', 'White Wolf Mtn', '白狼山', "Far beyond the Wall, Cao Cao routs the Wuhuan and kills their chieftain Tadun.", "曹操远征塞外，大破乌桓，斩单于蹋顿。"], [208, [111.8, 30.85], 'cao', 'Changban', '长坂', "Cao Cao’s cavalry catch the fleeing Liu Bei and his refugees; Zhao Yun saves Liu Bei’s son.", "曹操轻骑追上南逃的刘备和百姓，刘备大败，赵云救出幼子。"],
  [208, [113.9, 29.75], 'sun', 'Red Cliffs', '赤壁', "The Sun–Liu alliance burns Cao Cao’s fleet; with plague in his camp he retreats north.", "孙刘联军火攻曹军舰队，加上疫病，曹操北撤，三分之势初成。"], [209, [112.2, 30.35], 'sun', 'Jiangling', '江陵', "Zhou Yu besieges Cao Ren for a year until Cao Ren abandons the city.", "周瑜围攻江陵一年，曹仁弃城北撤。"], [211, [110.25, 34.6], 'cao', 'Tong Pass', '潼关', "Cao Cao crosses the Wei River, splits Ma Chao from Han Sui and crushes the north-western warlords.", "曹操渡渭水，离间马超、韩遂，大破关中诸将。"],
  [213, [117.95, 31.4], 'sun', 'Ruxu', '濡须', "Cao Cao attacks Sun Quan’s river fort and withdraws after a month’s stand-off.", "曹操进攻孙权的濡须坞，相持月余后撤退。"], [214, [104.4, 30.99], 'liubei', 'Luo', '雒城', "Liu Bei besieges Luo for a year, losing Pang Tong, before taking it and then Chengdu.", "刘备围攻雒城近一年，庞统中箭身亡，城破后成都投降。"], [215, [106.1, 32.95], 'cao', 'Yangping', '阳平关', "Cao Cao breaks through the pass into Hanzhong, and Zhang Lu surrenders.", "曹操攻破阳平关，张鲁投降，汉中归曹。"],
  [215, [117.27, 31.86], 'cao', 'Hefei', '合肥', "Zhang Liao’s 800 men charge Sun Quan’s army of 100,000 and nearly capture him at Xiaoyao Ford.", "张辽以八百人冲击孙权十万大军，在逍遥津几乎生擒孙权。"], [219, [106.6, 33.15], 'liubei', 'Dingjun Mtn', '定军山', "Huang Zhong kills Xiahou Yuan, and Liu Bei wins Hanzhong.", "黄忠斩夏侯渊，刘备夺得汉中。"], [219, [112.15, 32.05], 'cao', 'Fancheng', '樊城', "Guan Yu drowns Yu Jin’s army in the floods, but the siege fails when Wu strikes his rear.", "关羽水淹于禁七军，威震华夏，但东吴从背后偷袭，樊城之围失败。"],
  [219, [111.75, 30.95], 'sun', 'Maicheng', '麦城', "Cut off by Lü Meng, Guan Yu’s army melts away; he is captured and killed.", "吕蒙袭取荆州，关羽军心瓦解，败走麦城后被擒杀。"], [222, [111.3, 30.7], 'sun', 'Yiling', '夷陵', "Lu Xun waits out Liu Bei for months, then burns his line of camps.", "陆逊坚守数月，以火攻烧毁刘备连营，蜀军大败。"], [228, [105.7, 34.9], 'cao', 'Jieting', '街亭', "Ma Su leaves the water supply for a hilltop and is routed by Zhang He, ending Zhuge Liang’s first campaign.", "马谡舍水上山，被张郃击败，诸葛亮第一次北伐失败。"],
  [228, [116.55, 30.85], 'sun', 'Shiting', '石亭', "Lu Xun lures the Wei general Cao Xiu deep into Wu territory and routs him.", "陆逊诱魏将曹休深入，在石亭大破魏军。"], [234, [107.6, 34.3], 'cao', 'Wuzhang', '五丈原', "Sima Yi refuses battle for a hundred days; Zhuge Liang dies in camp and Shu withdraws.", "司马懿坚守不战百余日，诸葛亮病逝军中，蜀军撤退。"], [238, [123.17, 41.27], 'cao', 'Xiangping', '襄平', "Sima Yi besieges Gongsun Yuan’s capital through the summer rains and takes Liaodong.", "司马懿冒雨围攻襄平，斩公孙渊，平定辽东。"],
  [263, [104.2, 31.35], 'cao', 'Mianzhu', '绵竹', "Deng Ai, through the mountains, beats Zhuge Zhan at Mianzhu; Liu Shan surrenders Chengdu.", "邓艾偷渡阴平，在绵竹击败诸葛瞻，刘禅开城投降。"], [280, [118.8, 32.05], 'jin', 'Jianye', '建业', "Jin fleets come down the Yangtze; Sun Hao surrenders and China is reunited.", "晋军舟师顺江而下，孙皓投降，天下重归一统。"]
];
// the last year a step covers ("225–228" covers up to 228)
const stepEnd = (s) => { const m = String(s.yr).match(/(\d{3})\D*$/); return m ? +m[1] : s.y; };

/* The steps and lives (js/three-kingdoms-data.js). Each step's full map and faction names are built by
   carrying the changes forward from the step before. */
const DATA = window.TK_DATA;
const STEPS = DATA.steps;
STEPS.reduce((prev, s) => { s.map = Object.assign({}, prev, s.own); return s.map; }, {});
STEPS.reduce((prev, s) => { s.names = Object.assign({}, prev, s.nm || {}); return s.names; }, {});
const PEOPLE = DATA.people;
// people grouped by the side they served: Wei, Shu, Wu (the picker and the cast chart both use this order)
const GROUPS = [
  { k: 'wei', n: ['Wei', '魏'], fac: 'cao', who: ['caocao', 'simayi'] },
  { k: 'shu', n: ['Shu', '蜀'], fac: 'liubei', who: ['liubei', 'zhuge', 'guanyu'] },
  { k: 'wu', n: ['Wu', '吴'], fac: 'sun', who: ['sunquan'] }
];
const ORDER = GROUPS.flatMap((g) => g.who);
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
  // wrap the map so whatever it draws beyond its own box is clipped there, not over the year or legend
  const wrap = document.createElement('div'); wrap.className = 'tk-mapwrap';
  svg.parentNode.insertBefore(wrap, svg); wrap.appendChild(svg);
  const stepsBox = document.getElementById('tkSteps');
  const yearEl = document.getElementById('tkYear'), titleEl = document.getElementById('tkTitle'), legendEl = document.getElementById('tkLegend');
  const W = 600, H = NARROW ? 470 : 600;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const hasMap = window.d3 && window.topojson && window.__WORLD110M;
  const proj = hasMap
    ? d3.geoMercator().fitExtent([[6, 6], [W - 6, H - 6]], { type: 'MultiPoint', coordinates: [[95, 19], [125, 42.5]] })
    : null;
  if (!proj) { svg.insertAdjacentHTML('afterend', '<p class="tk-note">The map needs JavaScript and an internet connection to load.</p>'); return; }
  const pt = (ll) => proj(ll);
  const ring = (pts) => 'M' + pts.map((ll) => pt(ll).map((v) => v.toFixed(1)).join(' ')).join('L') + 'Z';

  // land and sea
  // the sea reaches well past the drawing area: when the map box is wider or taller than the map,
  // the SVG shows what lies beyond its viewBox instead of blank bands (see #tkMap overflow in the CSS)
  mk('rect', { x: -W * 2, y: -H * 2, width: W * 5, height: H * 5, fill: '#dfe6ea' }, svg);
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
  const ovG = mk('g', { class: 'tk-ov' }, svg); // markers for the economy, population and battle views
  // a small card with the marker's name and a one-line description: on hover with a mouse, on tap on phones
  const tip = document.createElement('div'); tip.className = 'tk-tipbox'; tip.hidden = true;
  wrap.appendChild(tip);
  let tipTimer = 0;
  const showTip = (m) => {
    const c = svg.getScreenCTM(); if (!c) return;
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
  ovG.addEventListener('pointerover', (e) => { const m = e.target.closest('.tk-mk'); if (m && e.pointerType === 'mouse') showTip(m); });
  ovG.addEventListener('pointerout', (e) => { const m = e.target.closest('.tk-mk'); if (m && e.pointerType === 'mouse' && !m.contains(e.relatedTarget)) hideTip(); });
  ovG.addEventListener('click', (e) => {
    const m = e.target.closest('.tk-mk'); if (!m) return;
    showTip(m); clearTimeout(tipTimer); tipTimer = setTimeout(hideTip, 5000);
  });
  let view = 'political';
  const head = document.querySelector('.tk-head');
  const viewBox = document.createElement('div'); viewBox.className = 'tk-views'; viewBox.setAttribute('role', 'group');
  head.appendChild(viewBox);
  const renderViews = () => {
    viewBox.setAttribute('aria-label', isZh() ? '地图视图' : 'Map view');
    viewBox.innerHTML = VIEWS.map(([k, en, zh]) => `<button type="button" data-v="${k}" aria-pressed="${k === view}">${isZh() ? zh : en}</button>`).join('');
  };
  viewBox.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; view = b.dataset.v; renderViews(); draw(curSi, curWho); });
  // a switch for the big faction names on the political map
  let showNames = true;
  const namesBtn = document.createElement('button'); namesBtn.type = 'button'; namesBtn.className = 'tk-namesbtn';
  head.appendChild(namesBtn);
  const renderNamesBtn = () => {
    namesBtn.setAttribute('aria-pressed', showNames);
    namesBtn.textContent = (isZh() ? '势力名称' : 'Big names') + (showNames ? (isZh() ? '：开' : ': on') : (isZh() ? '：关' : ': off'));
  };
  namesBtn.addEventListener('click', () => { showNames = !showNames; renderNamesBtn(); draw(curSi, curWho); });
  renderViews(); renderNamesBtn();
  // the population bar chart sits under the map and can cover its lower part, so it can be folded away
  let showPop = true;
  legendEl.addEventListener('click', (e) => { if (!e.target.closest('.tk-popbtn')) return; showPop = !showPop; draw(curSi, curWho); });
  let curSi = 0, curWho = 'caocao';
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
  const fmtPop = (v) => isZh() ? (v >= 1e4 ? Math.round(v / 1e4) + '万' : v) : (v >= 1e6 ? (v / 1e6).toFixed(1) + 'm' : Math.round(v / 1e3) + 'k');
  /* recorded (registered) population: only the figures that survive, with the gap left visibly empty */
  function popChart(zh) {
    const W = 520, H = 170, L = 42, B = 132, T = 14, max = 60;
    const Y = (v) => B - v / max * (B - T);
    const bars = [
      { x: 70, lab: '140', parts: [[49.14, '#cdbf98']], note: zh ? '东汉' : 'Han' },
      { x: 130, lab: '157', parts: [[56.49, '#cdbf98']], note: zh ? '东汉' : 'Han' },
      { x: 360, lab: zh ? '263 / 280' : '263 / 280', parts: [[4.43, FAC.cao.c], [0.94, FAC.liubei.c], [2.3, FAC.sun.c]], note: zh ? '魏 蜀 吴' : 'Wei Shu Wu' },
      { x: 450, lab: '280', parts: [[16.16, FAC.jin.c]], note: zh ? '西晋' : 'Jin' }
    ];
    let g = '';
    [0, 20, 40, 60].forEach((v) => { g += `<line x1="${L}" x2="${W - 10}" y1="${Y(v)}" y2="${Y(v)}" stroke="#e4dfd3"/><text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end" font-size="10" fill="#8a8578">${v}${zh ? '百万' : 'm'}</text>`; });
    // the 106 years with no surviving census
    g += `<rect x="168" y="${T}" width="150" height="${B - T}" fill="url(#tkHatch)"/><text x="243" y="${(T + B) / 2}" text-anchor="middle" font-size="11" font-weight="700" fill="#8a8578">${zh ? '158–262年' : '158–262'}</text><text x="243" y="${(T + B) / 2 + 15}" text-anchor="middle" font-size="10.5" fill="#8a8578">${zh ? '无户口记录存世' : 'no census survives'}</text>`;
    bars.forEach((b) => {
      let y = B, tot = 0;
      b.parts.forEach(([v, c]) => { const h = B - Y(v); y -= h; tot += v; g += `<rect x="${b.x - 18}" y="${y}" width="36" height="${h}" fill="${c}"/>`; });
      g += `<text x="${b.x}" y="${y - 5}" text-anchor="middle" font-size="11" font-weight="800" fill="#1f1f22">${zh ? Math.round(tot * 100) + '万' : tot.toFixed(1) + 'm'}</text>`;
      g += `<text x="${b.x}" y="${B + 14}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#1f1f22">${b.lab}</text><text x="${b.x}" y="${B + 27}" text-anchor="middle" font-size="10" fill="#8a8578">${b.note}</text>`;
    });
    const svgTx = `<svg class="tk-popchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${zh ? '登记人口：140年约4914万，157年约5649万，158至262年无记录，三国末年魏蜀吴合计约767万，280年西晋约1616万。' : 'Registered population: about 49.1 million in 140, 56.5 million in 157, no records 158 to 262, about 7.7 million for Wei, Shu and Wu at the end, and 16.2 million for Jin in 280.'}"><defs><pattern id="tkHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#e4dfd3" stroke-width="2"/></pattern></defs>${g}</svg>`;
    const note = zh
      ? '圆圈为140年各州人口（《后汉书·郡国志》）。柱图只画存世的户口数字：140年、157年（《帝王世纪》）、三国末年（魏、蜀263年，吴280年，见裴注所引）、西晋280年（《晋书·地理志》）。这是登记纳税的人口，不是实际人口：大幅下降既有战乱饥荒中的死亡，也有大量百姓逃亡或投靠豪族而脱离户籍；280年的回升多是晋朝重新清点户口。'
      : 'Circles: each province in 140 (Book of the Later Han). The bars show only the census figures that survive: 140, 157 (Diwang Shiji), the end of each state (Wei and Shu in 263, Wu in 280, quoted in Pei\u2019s notes) and Jin in 280 (Book of Jin). These count registered taxpayers, not people: the collapse mixes deaths from war and famine with millions who fled or became tenants of great families and dropped off the rolls, and the 280 rebound is mostly Jin re-registering them.';
    return svgTx + `<span class="tk-lnote">${note}</span>`;
  }
  function drawView(si) {
    const s = STEPS[si], end = stepEnd(s), zh = isZh();
    ovG.innerHTML = ''; tip.hidden = true;
    provG.style.opacity = view === 'political' ? 1 : view === 'population' ? 0.25 : 0.4;
    facLab.style.display = view === 'political' && showNames ? '' : 'none';
    trail.style.display = trailDots.style.display = view === 'political' ? '' : 'none';
    if (view === 'economy') {
      const items = ECON.filter((m) => m.from <= end && (m.to === undefined || m.to >= s.y));
      const placed = []; // markers that land on top of one another (several sit at Chengdu) are spread apart
      items.forEach((m) => {
        const [g, col] = ECON_KIND[m.k], c = pt(m.ll).slice();
        const free = (x, y) => !placed.some((q) => Math.hypot(q[0] - x, q[1] - y) < 20);
        if (!free(c[0], c[1])) { // try rings of spots around the true place, nearest first
          outer: for (let ring = 1; ring <= 3; ring++) for (let j = 0; j < 8 * ring; j++) {
            const a = Math.PI / 4 + j * 2 * Math.PI / (8 * ring), x = c[0] + 21 * ring * Math.cos(a), y = c[1] + 21 * ring * Math.sin(a);
            if (free(x, y)) { c[0] = x; c[1] = y; break outer; }
          }
        }
        placed.push(c);
        const fresh = m.from >= s.y && m.from <= end && m.from > 155;
        const grp = mk('g', { transform: `translate(${c[0]} ${c[1]})`, class: 'tk-mk' }, ovG);
        Object.assign(grp, { __xy: c, __name: zh ? m.zh : m.en, __desc: m.d[zh ? 1 : 0] });
        grp.setAttribute('aria-label', grp.__name);
        mk('circle', { r: fresh ? 12 : 9, fill: col, stroke: '#fff', 'stroke-width': 2 }, grp);
        say(grp, 0, fresh ? 4.5 : 3.5, g, { 'text-anchor': 'middle', 'font-size': fresh ? 12 : 9.5, 'font-weight': 700, fill: '#fff' });
        if (fresh) say(grp, m.side === 'l' ? -15 : 15, 4, zh ? m.zh : m.en, { 'text-anchor': m.side === 'l' ? 'end' : 'start', 'font-size': NARROW ? 12 : 10.5, 'font-weight': 700, fill: '#1f1f22', 'paint-order': 'stroke', stroke: 'rgba(255,255,255,.9)', 'stroke-width': 3 });
      });
      const kinds = [...new Set(items.map((m) => m.k))];
      legendEl.innerHTML = kinds.map((k) => `<span><i class="g" style="background:${ECON_KIND[k][1]}" lang="zh">${ECON_KIND[k][0]}</i>${ECON_KIND[k][zh ? 3 : 2]}</span>`).join('') +
        `<span class="tk-lnote">${zh ? '只标注本节点新出现的项目；悬停或点按图标查看说明。' : 'Only new items are labelled; hover or tap an icon to read about it.'}</span>`;
    } else if (view === 'population') {
      const max = Math.max(...Object.values(POP140));
      Object.entries(POP140).forEach(([k, v]) => {
        const LA = { yi: [103.5, 29.5], jiao: [110, 23.3], jiangdong: [118.6, 28.5], liang: [99.5, 38.2], liaodong: [123, 41.3], huainan: [117.2, 32.3], hanzhong: [107.3, 32.95] };
        const c = LA[k] ? pt(LA[k]) : centroid(PROV[k].p);
        const r = 6 + 30 * Math.sqrt(v / max);
        mk('circle', { cx: c[0], cy: c[1], r, fill: 'rgba(194,65,45,.55)', stroke: '#8a2a1c', 'stroke-width': 1.2 }, ovG);
        say(ovG, c[0], c[1] + 4, fmtPop(v), { 'text-anchor': 'middle', 'font-size': NARROW ? 12.5 : 11, 'font-weight': 800, fill: '#1f1f22', 'paint-order': 'stroke', stroke: 'rgba(255,255,255,.9)', 'stroke-width': 3 });
      });
      const pb = `<button type="button" class="tk-popbtn" aria-expanded="${showPop}">${showPop ? (zh ? '收起人口图 ▾' : 'Hide population chart ▾') : (zh ? '展开人口图 ▸' : 'Show population chart ▸')}</button>`;
      legendEl.innerHTML = pb + (showPop ? popChart(zh) : '');
    } else if (view === 'battles') {
      BATTLES.filter((b) => b[0] <= end).forEach(([y, ll, f, en, zhn, den, dzh]) => {
        const c = pt(ll), now = y >= s.y && y <= end;
        const grp = mk('g', { transform: `translate(${c[0]} ${c[1]})`, opacity: now ? 1 : 0.7, class: 'tk-mk' }, ovG);
        Object.assign(grp, { __xy: c, __name: `${zh ? zhn : en} · ${y}`, __desc: zh ? dzh : den });
        grp.setAttribute('aria-label', grp.__name);
        mk('circle', { r: 9, fill: 'transparent' }, grp); // a bigger target for hover and tap
        if (now) mk('circle', { r: 16, fill: 'none', stroke: FAC[f].c, 'stroke-width': 2.5, class: 'tk-pulse' }, grp);
        const k = now ? 7 : 4.5;
        mk('path', { d: `M-${k} -${k} L${k} ${k} M${k} -${k} L-${k} ${k}`, stroke: FAC[f].c, 'stroke-width': now ? 4 : 2.5, 'stroke-linecap': 'round' }, grp);
        if (now) say(grp, 11, -7, `${zh ? zhn : en} ${y}`, { 'font-size': NARROW ? 13 : 12, 'font-weight': 800, fill: '#1f1f22', 'paint-order': 'stroke', stroke: 'rgba(255,255,255,.9)', 'stroke-width': 3 });
      });
      legendEl.innerHTML = `<span class="tk-lnote">${zh ? '✕ 颜色为胜方；只标注本节点的战役，悬停或点按查看说明。' : '✕ coloured by the winner; only this step’s battles are named. Hover or tap for details.'}</span>`;
    }
  }
  function draw(si, who) {
    curSi = si; curWho = who;
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
    drawView(si);
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
  /* the person picker: a dropdown grouped by side (Wei, Shu, Wu), with the chosen person's badge beside it */
  const syncPicker = () => toggles.forEach((box) => {
    const sel = box.querySelector('select'); if (sel) sel.value = who;
    const av = box.querySelector('.tk-selav');
    if (av) { av.textContent = perCh(who); av.style.setProperty('--pc', FAC[PEOPLE[who].fac].c); }
  });
  function pick(k, from) {
    who = k;
    syncPicker();
    renderPeople(); draw(si, who);
    document.querySelectorAll('#castSvg .cast-row').forEach((g) => g.classList.toggle('on', g.dataset.p === k));
    if (from === 'cast') document.getElementById('tkScrolly').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }
  const renderToggles = () => {
    toggles.forEach((box) => {
      const opts = GROUPS.map((g) => `<optgroup label="${g.n[L()]}">` +
        g.who.map((k) => `<option value="${k}">${perName(k)}</option>`).join('') + '</optgroup>').join('');
      box.innerHTML = `<span class="tk-selav" aria-hidden="true" lang="zh"></span><select class="tk-sel" aria-label="${isZh() ? '选择要跟随的人物' : 'Choose whose life to follow'}">${opts}</select>`;
    });
    syncPicker();
  };
  toggles.forEach((box) => box.addEventListener('change', (e) => { if (e.target.matches('select')) pick(e.target.value); }));
  renderToggles();
  window.__tkPick = pick;
  window.__tkWho = () => who;
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
  // hide the "In this story" list while the timeline is on screen, so the map can use that column
  // (the wide novel table below does the same)
  const wideOn = new Set();
  const wideObs = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) wideOn.add(e.target); else wideOn.delete(e.target); });
    document.body.classList.toggle('tk-wide', wideOn.size > 0);
  }, { rootMargin: '-20% 0px -20% 0px' });
  ['tkScrolly', 'novelFig'].forEach((id) => { const el = document.getElementById(id); if (el) wideObs.observe(el); });
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

/* ================= HISTORY AND THE NOVEL: the table, built from js/three-kingdoms-novel.js ================= */
(function () {
  const N = window.TK_NOVEL, fig = document.getElementById('novelFig'); if (!N || !fig) return;
  const table = fig.querySelector('table'); if (!table) return;
  table.classList.add('tk-novel');
  function build() {
    const zh = isZh(), i = zh ? 1 : 0;
    const head = zh ? ['情节', '小说怎么写', '史书怎么写'] : ['Scene', 'In the novel', 'In the history'];
    table.innerHTML = `<thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>` +
      N.rows.map((r) => {
        const [ven, vzh, vc] = N.verdicts[r.v];
        const quote = r.q ? `<blockquote class="tk-nq"><div class="tk-qs">${zh ? '原文' : 'Original text'} · <span lang="zh">${r.q.src}</span></div><p lang="zh">「${r.q.c}」</p>${zh ? '' : `<p class="tk-qe">${r.q.en}</p>`}</blockquote>` : '';
        return `<tr><td><span class="tk-sc">${r.s[i]}</span><span class="tk-vd" style="--vc:${vc}">${zh ? vzh : ven}</span></td>` +
          `<td data-h="${head[1]}">${r.n[i]}</td><td data-h="${head[2]}">${r.h[i]}${quote}</td></tr>`;
      }).join('') + '</tbody>';
  }
  build();
  langHooks.push(build);
})();
