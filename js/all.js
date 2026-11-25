/* Full list of every explainer, newest first, with a category filter and pagination, plus the List / Map view switch. Reads articles.js. */
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

  // List / Map views. The map (js/map.js) lays itself out when its view is shown; #map in the URL opens it.
  const tabList = $("tabList"), tabMap = $("tabMap"), viewList = $("viewList"), viewMap = $("viewMap");
  function showView(v, push) {
    if (!tabList || !viewMap) return;
    const map = v === "map";
    tabList.setAttribute("aria-selected", String(!map)); tabMap.setAttribute("aria-selected", String(map));
    viewList.hidden = map; viewMap.hidden = !map;
    if (map) dispatchEvent(new Event("bottleneck:mapshow"));
    if (push) history.replaceState(null, "", map ? "#map" : location.pathname + location.search);
  }
  if (tabList) {
    tabList.addEventListener("click", () => showView("list", true));
    tabMap.addEventListener("click", () => showView("map", true));
    addEventListener("hashchange", () => showView(location.hash === "#map" ? "map" : "list", false));
    if (location.hash === "#map") showView("map", false);
  }
})();
