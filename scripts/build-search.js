#!/usr/bin/env node
/*
 * Builds js/search-index.js, the full-text index behind the site search (js/menu.js).
 * For every explainer in js/articles.js it reads the page, drops scripts, styles, header, footer and the
 * table of contents, and splits the text into sections at each <h2 id="...">, so a search result can link
 * straight to the section that matched. Text drawn by a page's own script (the Three Kingdoms timeline and
 * novel table) is added from its data files.
 * Run from the repo root:  node scripts/build-search.js   (build-feed.js also runs it)
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
global.window = global.window || {};
require(path.join(ROOT, "js", "articles.js"));
const { articles } = window.BOTTLENECK;

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", cent: "¢", mdash: "—", ndash: "–", hellip: "…", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", times: "×", middot: "·", deg: "°", pound: "£", euro: "€", yen: "¥" };
const decode = (s) => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&([a-z]+);/gi, (m, n) => ENT[n.toLowerCase()] ?? m);
const text = (html) => decode(html
  .replace(/<br\s*\/?>/gi, " ")
  .replace(/<\/(p|li|td|th|div|h\d|figcaption|blockquote)>/gi, " ")
  .replace(/<[^>]+>/g, " "))
  .replace(/\s+/g, " ").trim();

function sectionsOf(html) {
  // keep only the article body: drop scripts, styles, svg drawings, the header/footer and the contents list
  let body = html
    .replace(/<head[\s\S]*?<\/head>/i, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<aside class="toc"[\s\S]*?<\/aside>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    // footnote markers and the Sources list's numbers / back-links are navigation, not text
    .replace(/<sup class="fn">[\s\S]*?<\/sup>/gi, "")
    .replace(/<span class="src-n">\d+<\/span>|<a class="src-back"[^>]*>[\s\S]*?<\/a>/gi, "");
  const out = [];
  // everything before the first <h2> is the intro; then one section per <h2 id>
  const re = /<h2[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/gi;
  let m, last = 0, cur = { id: "", h: "" };
  while ((m = re.exec(body))) {
    out.push({ ...cur, t: text(body.slice(last, m.index)) });
    cur = { id: m[1], h: text(m[2].replace(/<span class="n">[\s\S]*?<\/span>/, "")) };
    last = re.lastIndex;
  }
  out.push({ ...cur, t: text(body.slice(last)) });
  return out.filter((s) => s.t || s.h);
}

/* pages whose main text is drawn by their own script: index that text from the data files too */
function extraSections(id) {
  if (id === "chu-han") return chuHanSections();
  if (id !== "three-kingdoms") return [];
  const w = {};
  ["three-kingdoms-data.js", "three-kingdoms-novel.js"].forEach((f) => {
    const p = path.join(ROOT, "js", f);
    if (fs.existsSync(p)) new Function("window", fs.readFileSync(p, "utf8"))(w);
  });
  const out = [];
  (w.TK_DATA?.steps || []).forEach((s) => out.push({
    id: "s3", h: `${s.yr} ${s.en.t} · ${s.zh.t}`,
    t: [s.en.x, s.zh.x, s.q?.c].filter(Boolean).join(" ")
  }));
  Object.values(w.TK_DATA?.people || {}).forEach((p) => out.push({
    id: "s3", h: `${p.n[0]} · ${p.n[1]}`,
    t: Object.values(p.life).map((e) => `${e[2]} ${e[1]}`).join(" ")
  }));
  (w.TK_NOVEL?.rows || []).forEach((r) => out.push({
    id: "s4", h: `${r.s[0]} · ${r.s[1]}`,
    t: [r.n[0], r.n[1], r.h[0], r.h[1], r.q?.c].filter(Boolean).join(" ")
  }));
  return out;
}

/* the Chu–Han timeline cards, lives and legend table (js/chu-han-data.js) */
function chuHanSections() {
  const w = {}, p = path.join(ROOT, "js", "chu-han-data.js");
  if (fs.existsSync(p)) new Function("window", fs.readFileSync(p, "utf8"))(w);
  const D = w.CH_DATA || {}, out = [];
  (D.steps || []).forEach((s) => out.push({
    id: "s3", h: `${s.yr} BC ${s.en.t} · ${s.zh.t}`,
    t: [s.en.x, s.zh.x, s.q?.c].filter(Boolean).join(" ")
  }));
  Object.values(D.people || {}).forEach((per) => out.push({
    id: "s3", h: `${per.n[0]} · ${per.n[1]}`,
    t: Object.values(per.life).map((e) => `${e[2]} ${e[1]}`).join(" ")
  }));
  (D.legend?.rows || []).forEach((r) => out.push({
    id: "s4", h: `${r.s[0]} · ${r.s[1]}`,
    t: [r.n[0], r.n[1], r.h[0], r.h[1], r.q?.c].filter(Boolean).join(" ")
  }));
  return out;
}

const index = articles.map((a) => {
  const file = path.join(ROOT, "html", a.href);
  if (!fs.existsSync(file)) return null;
  const html = fs.readFileSync(file, "utf8");
  return {
    id: a.id, href: a.href, title: a.title, short: a.short || "", topic: a.topic || "", category: a.category || "",
    date: a.date, dek: a.summary || a.dek || "",
    sec: [...sectionsOf(html), ...extraSections(a.id)]
  };
}).filter(Boolean);

// a script rather than JSON, so the search also works when the pages are opened straight from disk (file://),
// where browsers block fetch() but still load <script> files
const outFile = path.join(ROOT, "js", "search-index.js");
fs.writeFileSync(outFile, "window.BOTTLENECK_SEARCH=" + JSON.stringify({ built: new Date().toISOString(), pages: index }) + ";\n");
const oldJson = path.join(ROOT, "search-index.json");
if (fs.existsSync(oldJson)) fs.unlinkSync(oldJson);
const kb = Math.round(fs.statSync(outFile).size / 1024);
console.log(`js/search-index.js written: ${index.length} page(s), ${index.reduce((n, p) => n + p.sec.length, 0)} section(s), ${kb} KB`);
