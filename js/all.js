/* Full list of every explainer, newest first, with a category filter and pagination, plus the List / Topics / Companies / Countries view switch. Reads articles.js. */
(function () {
  const DATA = window.BOTTLENECK || { articles: [] };
  const articles = [...DATA.articles].reverse().sort((a, b) => b.date.localeCompare(a.date));
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const shortDate = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const catOf = (a) => a.category || a.topic;

  const listEl = $("list"), pagerEl = $("pager");
  if (!listEl) return;
  $("count").textContent = articles.length + " published";

  const PAGE_SIZE = 10;
  const categories = [...new Set(articles.map(catOf))];
  let category = "All";
  let page = 1;

  const filtered = () => articles.filter((a) => category === "All" || catOf(a) === category);

  function renderList() {
    const all = filtered();
    const pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
    if (page > pages) page = pages;
    const start = (page - 1) * PAGE_SIZE;
    const shown = all.slice(start, start + PAGE_SIZE);

    listEl.innerHTML = shown.map((a) => `
      <li><a href="${esc(a.href)}">
        <span class="date">${shortDate(a.date)}</span>
        <span class="t">${esc(a.title)}<small>${esc(a.summary || a.dek || "")}${a.readMins ? " · " + a.readMins + " min" : ""}</small></span>
        <span class="tag">${esc(catOf(a))}</span>
      </a></li>`).join("");

    renderPager(pages);
  }

  function renderPager(pages) {
    if (!pagerEl) return;
    if (pages <= 1) { pagerEl.hidden = true; pagerEl.innerHTML = ""; return; }
    pagerEl.hidden = false;
    let html = `<button type="button" class="pg-arrow" data-p="prev"${page === 1 ? " disabled" : ""} aria-label="Previous page">←</button>`;
    for (let i = 1; i <= pages; i++) {
      html += `<button type="button" class="pg-num" data-p="${i}" aria-current="${i === page ? "page" : "false"}">${i}</button>`;
    }
    html += `<button type="button" class="pg-arrow" data-p="next"${page === pages ? " disabled" : ""} aria-label="Next page">→</button>`;
    pagerEl.innerHTML = html;
  }

  function goTo(p) {
    const pages = Math.max(1, Math.ceil(filtered().length / PAGE_SIZE));
    page = Math.min(Math.max(1, p), pages);
    renderList();
    // scroll back to the top of the list so the new page starts in view
    const anchor = $("all");
    if (anchor) anchor.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }

  if (pagerEl) pagerEl.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b || b.disabled) return;
    const p = b.dataset.p;
    if (p === "prev") goTo(page - 1);
    else if (p === "next") goTo(page + 1);
    else goTo(+p);
  });

  // category filter chips
  const chipsEl = $("topicChips");
  if (chipsEl && categories.length > 1) {
    const opts = [{ v: "All", label: "All" }, ...categories.map((t) => ({ v: t, label: t }))];
    chipsEl.hidden = false;
    chipsEl.innerHTML = opts.map((o) => `<button type="button" data-v="${esc(o.v)}" aria-pressed="${o.v === "All"}">${esc(o.label)}</button>`).join("");
    chipsEl.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      chipsEl.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
      category = b.dataset.v; page = 1; renderList();
    });
  }

  renderList();

  // Views: List, Topics (js/map.js), Companies (js/explainers.js) and Countries (js/countries.js).
  // The company and country scripts load the first time their tab opens, so they measure a visible
  // container. The hash (#topics, #companies, #countries) opens a view and can be shared.
  const VIEWS = {
    list: { tab: "tabList", panel: "viewList" },
    topics: { tab: "tabMap", panel: "viewMap" },
    companies: { tab: "tabCompanies", panel: "viewCompanies", scripts: ["../js/explainers.js"] },
    countries: { tab: "tabCountries", panel: "viewCountries", scripts: ["../js/vendor/topojson-client.min.js", "../js/vendor/world-110m.js", "../js/countries-data.js", "../js/countries.js"] }
  };
  const HASH = { "": "list", "#topics": "topics", "#map": "topics", "#companies": "companies", "#countries": "countries" };
  const loaded = {};
  const loadScripts = (list) => list.reduce((p, src) => p.then(() => new Promise((res, rej) => {
    const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.body.appendChild(s);
  })), Promise.resolve());
  function showView(v, push) {
    if (!VIEWS[v] || !$("tabList")) return;
    Object.entries(VIEWS).forEach(([k, o]) => {
      const on = k === v;
      $(o.tab).setAttribute("aria-selected", String(on));
      $(o.panel).hidden = !on;
    });
    const o = VIEWS[v];
    if (v === "topics") dispatchEvent(new Event("bottleneck:mapshow"));
    if (o.scripts && !loaded[v]) { loaded[v] = true; loadScripts(o.scripts).catch(() => {}); }
    if (push) history.replaceState(null, "", v === "list" ? location.pathname + location.search : "#" + v);
  }
  Object.entries(VIEWS).forEach(([k, o]) => { const t = $(o.tab); if (t) t.addEventListener("click", () => showView(k, true)); });
  addEventListener("hashchange", () => showView(HASH[location.hash] || "list", false));
  if (HASH[location.hash] && HASH[location.hash] !== "list") showView(HASH[location.hash], false);
})();
