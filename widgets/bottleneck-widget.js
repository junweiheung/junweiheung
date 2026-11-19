// Bottleneck: new-explainer widget for iPhone, for the free Scriptable app (scriptable.app).
// Shows the latest explainer from junweiheung.github.io, marks it NEW for 48 hours,
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

async function loadFeed() {
  const fm = FileManager.local();
  const cache = fm.joinPath(fm.cacheDirectory(), "bottleneck-feed.json");
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

function build(feed, family) {
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

  w.setPadding(14, 14, 12, 14);
  header(w, latest);
  w.addSpacer(family === "small" ? 6 : 8);
  if (!latest) { const t = w.addText("No explainers yet."); t.textColor = C.muted; return w; }

  meta(w, latest);
  w.addSpacer(3);
  const title = w.addText(family === "small" ? shortTitle(latest) : latest.title);
  title.font = Font.boldSystemFont(family === "small" ? 15 : 16);
  title.textColor = C.white; title.lineLimit = family === "small" ? 4 : 2; title.minimumScaleFactor = 0.8;

  if (family === "small") {
    w.addSpacer();
    const r = w.addText(`${latest._bottleneck ? latest._bottleneck.readMins : "?"} min read →`);
    r.font = Font.mediumSystemFont(10); r.textColor = C.muted;
    return w;
  }

  if (family === "large") {
    w.addSpacer(4);
    const d = w.addText(latest.summary); d.font = Font.systemFont(12); d.textColor = C.muted; d.lineLimit = 4;
    const stat = latest._bottleneck && latest._bottleneck.stat;
    if (stat) {
      w.addSpacer(8);
      const s = w.addStack(); s.backgroundColor = C.card; s.cornerRadius = 6; s.setPadding(8, 10, 8, 10); s.centerAlignContent();
      const big = s.addText(stat.big); big.font = Font.heavySystemFont(18); big.textColor = C.gold;
      s.addSpacer(8);
      const tx = s.addText(stat.text); tx.font = Font.systemFont(10); tx.textColor = C.white; tx.lineLimit = 2;
    }
  }

  // earlier explainers, each row opens its own article
  const more = items.slice(1, family === "large" ? 5 : 3);
  if (more.length) {
    w.addSpacer(family === "large" ? 10 : 8);
    const rule = w.addStack(); rule.backgroundColor = C.line; rule.size = new Size(0, 1); rule.addSpacer();
    more.forEach((it) => {
      w.addSpacer(5);
      const row = w.addStack(); row.url = it.url; row.centerAlignContent();
      const t = row.addText(shortTitle(it)); t.font = Font.mediumSystemFont(12); t.textColor = C.white; t.lineLimit = 1;
      row.addSpacer();
      const d = row.addText(when(it.date_published)); d.font = Font.systemFont(10); d.textColor = C.muted;
    });
  }
  w.addSpacer();
  return w;
}

let widget;
try {
  const feed = await loadFeed();
  if (feed.items && feed.items[0]) await notifyIfNew(feed.items[0]);
  widget = build(feed, config.widgetFamily || "medium");
} catch (e) {
  widget = new ListWidget(); widget.backgroundColor = C.bg; widget.url = HOME;
  const t = widget.addText("Bottleneck\nCouldn't load. Tap to open the site."); t.textColor = C.muted; t.font = Font.systemFont(12);
}

if (config.runsInWidget) Script.setWidget(widget);
else await widget.presentMedium();   // preview when you run it inside the Scriptable app
Script.complete();
