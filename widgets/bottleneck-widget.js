// Bottleneck: new-explainer widget for iPhone, for the free Scriptable app (scriptable.app).
// Shows the latest explainer from junweiheung.github.io with its thumbnail, marks it NEW for 48 hours,
// sends a notification when a new one is published, and opens the article when tapped.
// Works in small, medium and large home-screen widgets and the rectangular lock-screen widget.

const FEED = "https://junweiheung.github.io/junweiheung/feed.json";
const HOME = "https://junweiheung.github.io/junweiheung/html/explainers.html";
const NEW_HOURS = 48;          // how long the NEW badge stays on
const REFRESH_MIN = 30;        // how often to ask iOS to refresh (iOS decides the exact timing)

const C = {
  bg: new Color("#0d0d0f"), card: new Color("#1a1a1d"), gold: new Color("#e0b65a"),
  white: Color.white(), muted: new Color("#8d8a84"), line: new Color("#2a2926"),
};
const fm = FileManager.local();
const cachePath = (name) => fm.joinPath(fm.cacheDirectory(), name);

async function loadFeed() {
  const cache = cachePath("bottleneck-feed.json");
  try {
    const req = new Request(FEED);
    req.timeoutInterval = 15;
    const feed = await req.loadJSON();
    fm.writeString(cache, JSON.stringify(feed));
    return feed;
  } catch (e) {
    if (fm.fileExists(cache)) return JSON.parse(fm.readString(cache)); // offline: show the last copy
    throw e;
  }
}

// thumbnail as a PNG (the feed provides one per article); cached so it only downloads once
async function loadThumb(it) {
  const url = it && it._bottleneck && it._bottleneck.png;
  if (!url) return null;
  const file = cachePath(`bottleneck-${it.id}.png`);
  if (fm.fileExists(file)) return fm.readImage(file);
  try {
    const req = new Request(url); req.timeoutInterval = 15;
    const img = await req.loadImage();
    fm.writeImage(file, img);
    return img;
  } catch (e) { return null; }
}

// darken an image so white text stays readable on top of it
function dimmed(img, alpha) {
  const ctx = new DrawContext();
  ctx.size = img.size; ctx.opaque = true; ctx.respectScreenScale = false;
  ctx.drawImageInRect(img, new Rect(0, 0, img.size.width, img.size.height));
  ctx.setFillColor(new Color("#0d0d0f", alpha));
  ctx.fillRect(new Rect(0, 0, img.size.width, img.size.height));
  return ctx.getImage();
}

function when(iso) {
  const d = new Date(iso), days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return days + " days ago";
  const f = new DateFormatter(); f.dateFormat = "d MMM"; return f.string(d);
}
const isNew = (it) => Date.now() - new Date(it.date_published).getTime() < NEW_HOURS * 3600000;
const shortTitle = (it) => (it._bottleneck && it._bottleneck.short) || it.title;
const topic = (it) => (it._bottleneck && it._bottleneck.topic) || (it.tags || [""])[0];

async function notifyIfNew(latest) {
  const KEY = "bottleneck-last-id";
  const seen = Keychain.contains(KEY) ? Keychain.get(KEY) : null;
  if (seen !== latest.id) {
    Keychain.set(KEY, latest.id);
    if (seen !== null) {                       // skip on the very first run
      const n = new Notification();
      n.title = "New on Bottleneck";
      n.body = latest.title;
      n.openURL = latest.url;
      await n.schedule();
    }
  }
}

function header(w, latest) {
  const row = w.addStack(); row.centerAlignContent();
  const brand = row.addText("BOTTLENECK"); brand.font = Font.heavySystemFont(11); brand.textColor = C.white;
  row.addSpacer();
  if (latest && isNew(latest)) {
    const badge = row.addStack(); badge.backgroundColor = C.gold; badge.cornerRadius = 4; badge.setPadding(2, 6, 2, 6);
    const t = badge.addText("NEW"); t.font = Font.heavySystemFont(9); t.textColor = C.bg;
  }
}

function meta(stack, it, size = 10) {
  const t = stack.addText(`${topic(it).toUpperCase()} · ${when(it.date_published)}`);
  t.font = Font.semiboldSystemFont(size); t.textColor = C.gold; t.lineLimit = 1;
}

function earlier(w, items, count) {
  const more = items.slice(1, 1 + count);
  if (!more.length) return;
  const rule = w.addStack(); rule.backgroundColor = C.line; rule.size = new Size(0, 1); rule.addSpacer();
  more.forEach((it) => {
    w.addSpacer(4);
    const row = w.addStack(); row.url = it.url; row.centerAlignContent();
    const t = row.addText(shortTitle(it)); t.font = Font.mediumSystemFont(12); t.textColor = C.white; t.lineLimit = 1;
    row.addSpacer();
    const d = row.addText(when(it.date_published)); d.font = Font.systemFont(10); d.textColor = C.muted;
  });
}

function build(feed, family, thumb) {
  const items = feed.items || [], latest = items[0];
  const w = new ListWidget();
  w.backgroundColor = C.bg;
  w.refreshAfterDate = new Date(Date.now() + REFRESH_MIN * 60000);
  w.url = latest ? latest.url : HOME;

  if (family === "accessoryRectangular" || family === "accessoryInline") {
    w.backgroundColor = new Color("#000000", 0);
    const t = w.addText(latest ? (isNew(latest) ? "New · " : "") + shortTitle(latest) : "Bottleneck");
    t.font = Font.semiboldSystemFont(13); t.lineLimit = 2;
    if (family === "accessoryRectangular" && latest) { const m = w.addText(topic(latest)); m.font = Font.systemFont(11); }
    return w;
  }

  if (!latest) { w.setPadding(14, 14, 14, 14); header(w, null); const t = w.addText("No explainers yet."); t.textColor = C.muted; return w; }

  if (family === "small") {
    // thumbnail fills the widget, darkened so the text on top reads clearly
    if (thumb) w.backgroundImage = dimmed(thumb, 0.62);
    w.setPadding(12, 12, 12, 12);
    header(w, latest);
    w.addSpacer();
    meta(w, latest, 9);
    w.addSpacer(2);
    const title = w.addText(shortTitle(latest));
    title.font = Font.boldSystemFont(15); title.textColor = C.white; title.lineLimit = 3; title.minimumScaleFactor = 0.8;
    return w;
  }

  if (family === "medium") {
    w.setPadding(12, 12, 10, 14);
    const top = w.addStack(); top.centerAlignContent();
    if (thumb) {
      const im = top.addImage(thumb); im.imageSize = new Size(128, 72); im.cornerRadius = 6;
      top.addSpacer(10);
    }
    const col = top.addStack(); col.layoutVertically();
    header(col, latest);
    col.addSpacer(4);
    meta(col, latest, 9);
    col.addSpacer(2);
    const title = col.addText(latest.title);
    title.font = Font.boldSystemFont(13); title.textColor = C.white; title.lineLimit = 3; title.minimumScaleFactor = 0.85;
    w.addSpacer(8);
    earlier(w, items, 1);
    w.addSpacer();
    return w;
  }

  // large: thumbnail banner, then the story, then earlier explainers
  w.setPadding(14, 14, 12, 14);
  header(w, latest);
  w.addSpacer(8);
  if (thumb) {
    const row = w.addStack(); row.addSpacer();
    const im = row.addImage(thumb); im.imageSize = new Size(300, 169); im.cornerRadius = 8;
    row.addSpacer();
    w.addSpacer(8);
  }
  meta(w, latest);
  w.addSpacer(2);
  const title = w.addText(latest.title);
  title.font = Font.boldSystemFont(16); title.textColor = C.white; title.lineLimit = 2; title.minimumScaleFactor = 0.85;
  w.addSpacer(3);
  const d = w.addText(latest.summary); d.font = Font.systemFont(11); d.textColor = C.muted; d.lineLimit = thumb ? 2 : 4;
  w.addSpacer(8);
  earlier(w, items, thumb ? 3 : 4);
  w.addSpacer();
  return w;
}

let widget;
try {
  const feed = await loadFeed();
  const latest = feed.items && feed.items[0];
  if (latest) await notifyIfNew(latest);
  const family = config.widgetFamily || "medium";
  const thumb = family.startsWith("accessory") ? null : await loadThumb(latest);
  widget = build(feed, family, thumb);
} catch (e) {
  widget = new ListWidget(); widget.backgroundColor = C.bg; widget.url = HOME;
  const t = widget.addText("Bottleneck\nCouldn't load. Tap to open the site."); t.textColor = C.muted; t.font = Font.systemFont(12);
}

if (config.runsInWidget) Script.setWidget(widget);
else await widget.presentMedium();   // preview when you run it inside the Scriptable app
Script.complete();
