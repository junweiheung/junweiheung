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
    image: abs(a.thumb),
    _bottleneck: { short: a.short || a.title, topic: a.topic, readMins: a.readMins, stat: (a.stats || [])[0] || null },
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
