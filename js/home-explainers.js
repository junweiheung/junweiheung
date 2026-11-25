(function () {
  const data = window.BOTTLENECK;
  if (!data || !data.articles.length) return;
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const SHOW = 3;
  const all = [...data.articles].reverse().sort((a, b) => b.date.localeCompare(a.date));
  const items = all.slice(0, SHOW).map((a) => {
    const month = new Date(a.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" });
    return `
      <li class="essay reveal">
        <a href="html/${esc(a.href)}">
          <div class="essay__thumb" aria-hidden="true"><img src="html/${esc(a.thumb)}" alt="" loading="lazy" /></div>
          <div>
            <div class="essay__kicker">${esc(a.kicker)} ✦ ${esc(a.topic)}</div>
            <h3 class="essay__name">${esc(a.short || a.title)}</h3>
            <p class="essay__dek">${esc(a.dek)}</p>
            <div class="essay__meta">${month} <b>✦</b> ${a.readMins} min read</div>
            <span class="pill pill--light essay__read">Read the explainer ↗</span>
          </div>
        </a>
      </li>`;
  });
  const more = all.length > SHOW
    ? `<a href="html/explainers.html" style="color: var(--gold)">See all ${all.length} explainers</a> · <a href="html/all.html#companies" style="color: var(--gold)">company map →</a>`
    : `Next explainer in the works… meanwhile, <a href="html/all.html#companies" style="color: var(--gold)">see the company map →</a>`;
  document.querySelector("#explainers .essays").innerHTML =
    items.join("") + `<li class="essay essay--soon reveal">${more}</li>`;
})();
