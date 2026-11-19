#!/usr/bin/env node
/*
 * Builds feed.json (JSON Feed 1.1) and feed.xml (RSS 2.0) from js/articles.js.
 * Run from the repo root after adding or editing an explainer:  node scripts/build-feed.js
 * The iPhone widget (widgets/bottleneck-widget.js) and any RSS reader read these files.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SITE = "https://junweiheung.github.io/junweiheung/";
const MAX_ITEMS = 30;

global.window = {};
require(path.join(ROOT, "js", "articles.js"));
const { articles } = window.BOTTLENECK;

// newest first; on the same date, the one added later wins (matches the site's ordering)
const items = [...articles].reverse().sort((a, b) => b.date.localeCompare(a.date)).slice(0, MAX_ITEMS);
const abs = (rel) => new URL("html/" + rel, SITE).href;        // registry paths are relative to html/

/* ---- PNG thumbnails: the iPhone widget can't show SVG, so render each thumbnail to images/thumbs/png/<id>.png.
   Uses headless Chrome/Chromium (lets the SVG's animations finish), else rsvg-convert. Skips ones already up to date. */
const { execFileSync } = require("child_process");
const PNG_DIR = path.join(ROOT, "images", "thumbs", "png");
fs.mkdirSync(PNG_DIR, { recursive: true });
const has = (cmd) => { try { execFileSync("which", [cmd], { stdio: "ignore" }); return true; } catch { return false; } };
const chrome = [process.env.CHROME_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium"].find((p) => p && fs.existsSync(p))
  || ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"].find(has);
// Render the thumbnail's finished frame: every CSS animation jumps straight to its end state
// (fade-ins with "forwards" end visible; looping effects drop back to their resting look).
const FINISH = "*{animation-delay:0s!important;animation-duration:0s!important;animation-iteration-count:1!important}";
function renderPng(svgPath, pngPath) {
  let src = fs.readFileSync(svgPath, "utf8");
  src = src.includes("</style>") ? src.replace("</style>", FINISH + "</style>") : src.replace(/<svg([^>]*)>/, `<svg$1><style>${FINISH}</style>`);
  const tmp = path.join(path.dirname(svgPath), `.render-${path.basename(svgPath)}`);
  fs.writeFileSync(tmp, src);
  try {
    if (chrome) {
      execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars", "--force-prefers-reduced-motion",
        `--screenshot=${pngPath}`, "--window-size=800,450", "--virtual-time-budget=3000", "file://" + tmp], { stdio: "ignore", timeout: 60000 });
    } else if (has("rsvg-convert")) {
      execFileSync("rsvg-convert", ["-w", "800", "-h", "450", "-o", pngPath, tmp]);
    } else return false;
  } finally { fs.unlinkSync(tmp); }
  return fs.existsSync(pngPath) && fs.statSync(pngPath).size > 2000;   // a blank render is tiny
}
const pngFor = {};
items.forEach((a) => {
  const svg = path.join(ROOT, "html", a.thumb), png = path.join(PNG_DIR, a.id + ".png");
  if (!fs.existsSync(svg)) return;
  const fresh = fs.existsSync(png) && fs.statSync(png).mtimeMs >= fs.statSync(svg).mtimeMs;
  let ok = fresh;
  if (!fresh) { try { ok = renderPng(svg, png); } catch (e) { ok = false; } }
  if (ok) pngFor[a.id] = `${SITE}images/thumbs/png/${a.id}.png`;
  else console.warn(`warning: no PNG thumbnail for "${a.id}" (install Chrome/Chromium or rsvg-convert)`);
});
const isoDate = (d) => d + "T09:00:00+08:00";                    // date only in the registry; noon-ish SGT

const json = {
  version: "https://jsonfeed.org/version/1.1",
  title: "Bottleneck by Jun Wei",
  home_page_url: SITE + "html/explainers.html",
  feed_url: SITE + "feed.json",
  description: "Explainers on the companies and industries the world can't do without.",
  authors: [{ name: "Jun Wei Heung", url: SITE }],
  language: "en-SG",
  items: items.map((a) => ({
    id: a.id,
    url: abs(a.href),
    title: a.title,
    summary: a.dek,
    content_text: a.dek,
    date_published: isoDate(a.date),
    tags: [a.topic],
    image: pngFor[a.id] || abs(a.thumb),
    _bottleneck: { short: a.short || a.title, topic: a.topic, readMins: a.readMins, stat: (a.stats || [])[0] || null, png: pngFor[a.id] || null },
  })),
};

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));
const rfc822 = (d) => new Date(isoDate(d)).toUTCString();
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Bottleneck by Jun Wei</title>
  <link>${SITE}html/explainers.html</link>
  <atom:link href="${SITE}feed.xml" rel="self" type="application/rss+xml"/>
  <description>Explainers on the companies and industries the world can't do without.</description>
  <language>en-sg</language>
  <lastBuildDate>${items.length ? rfc822(items[0].date) : new Date().toUTCString()}</lastBuildDate>
${items.map((a) => `  <item>
    <title>${esc(a.title)}</title>
    <link>${abs(a.href)}</link>
    <guid isPermaLink="false">bottleneck-${esc(a.id)}</guid>
    <pubDate>${rfc822(a.date)}</pubDate>
    <category>${esc(a.topic)}</category>
    <description>${esc(a.dek)}</description>
  </item>`).join("\n")}
</channel>
</rss>
`;

fs.writeFileSync(path.join(ROOT, "feed.json"), JSON.stringify(json, null, 2) + "\n");
fs.writeFileSync(path.join(ROOT, "feed.xml"), rss);
console.log(`feed.json and feed.xml written: ${items.length} item(s), latest "${items[0] && items[0].id}"`);
