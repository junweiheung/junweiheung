/*
 * Bottleneck header menu: turns the <details class="menu"> in the masthead into a panel that slides in
 * from the right, dims the page, folds the ☰ icon into an X, and staggers the links in.
 * Closes on the X, a click on the dimmed page, Escape, or following a link. Shared by every page in html/.
 */
(function () {
  const menu = document.querySelector('.mast .menu');
  if (!menu) return;
  const summary = menu.querySelector('summary');
  const sheet = menu.querySelector('.sheet');
  if (!summary || !sheet) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CLOSE_MS = reduced ? 0 : 560;
  menu.classList.add('js');

  // the drawer's own close button, pinned to its top-right corner
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button'; closeBtn.className = 'menu-close'; closeBtn.setAttribute('aria-label', 'Close menu');
  closeBtn.innerHTML = '<span></span><span></span>';
  sheet.insertBefore(closeBtn, sheet.firstChild);

  // dimmed backdrop
  const dim = document.createElement('div');
  dim.className = 'menu-dim';
  dim.setAttribute('aria-hidden', 'true');
  menu.insertBefore(dim, sheet);

  // label, numbers and staggering for the main links; mark the current page
  const here = location.pathname.replace(/index\.html$/, '');
  const label = document.createElement('div');
  label.className = 'menu-label stag'; label.textContent = 'Menu';
  sheet.insertBefore(label, sheet.firstChild);
  let i = 0;
  sheet.querySelectorAll(':scope > a').forEach((a) => {
    const base = a.classList.contains('base');
    if (!base) {
      const text = a.textContent.trim();
      a.innerHTML = `<span class="no">0${++i}</span><span class="tx"></span>`;
      a.querySelector('.tx').textContent = text;
    }
    a.classList.add('stag');
    try { if (new URL(a.href).pathname.replace(/index\.html$/, '') === here) a.setAttribute('aria-current', 'page'); } catch (e) {}
  });

  sheet.querySelectorAll('.stag').forEach((el, k) => el.style.setProperty('--i', k));

  let closeTimer = 0;
  function open() {
    clearTimeout(closeTimer);
    menu.open = true;
    summary.setAttribute('aria-label', 'Close menu');
    summary.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('menu-lock');
    placeClose();
    sheet.getBoundingClientRect(); // let the browser register the closed position first
    requestAnimationFrame(() => menu.classList.add('is-open'));
    setTimeout(() => closeBtn.focus({ preventScroll: true }), reduced ? 0 : 350);
  }
  function close(returnFocus) {
    if (!menu.open) return;
    menu.classList.remove('is-open');
    summary.setAttribute('aria-label', 'Open menu');
    summary.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('menu-lock');
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => { menu.open = false; }, CLOSE_MS);
    if (returnFocus) summary.focus({ preventScroll: true });
  }

  summary.setAttribute('aria-expanded', 'false');
  summary.addEventListener('click', (e) => {
    e.preventDefault();
    if (menu.classList.contains('is-open')) close(false); else open();
  });
  dim.addEventListener('click', () => close(false));
  closeBtn.addEventListener('click', () => close(true));
  // put the X exactly where the stack (☰) button is, so it reads as the same button changing shape.
  // On very wide screens the ☰ can sit left of the drawer, so the X is kept inside the drawer.
  function placeClose() {
    const b = summary.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const fromRight = vw - b.right;
    const maxRight = sheet.offsetWidth - b.width - 12;
    closeBtn.style.top = Math.max(0, b.top) + 'px';
    closeBtn.style.right = Math.max(0, Math.min(fromRight, maxRight)) + 'px';
    closeBtn.style.width = b.width + 'px';
    closeBtn.style.height = b.height + 'px';
  }
  addEventListener('resize', () => { if (menu.classList.contains('is-open')) placeClose(); });
  // block page scrolling while open, but let the panel itself scroll if it's taller than the screen
  const scrollsInSheet = (t) => t instanceof Node && sheet.contains(t) && sheet.scrollHeight > sheet.clientHeight;
  const block = (e) => { if (menu.classList.contains('is-open') && !scrollsInSheet(e.target)) e.preventDefault(); };
  addEventListener('wheel', block, { passive: false });
  addEventListener('touchmove', block, { passive: false });
  const SCROLL_KEYS = new Set([' ', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown']);
  addEventListener('keydown', (e) => { if (menu.classList.contains('is-open') && SCROLL_KEYS.has(e.key) && e.target !== summary && !(e.key === ' ' && e.target.closest && e.target.closest('a')) && !scrollsInSheet(e.target)) e.preventDefault(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) close(true);
    // keep keyboard focus inside the open panel
    if (e.key === 'Tab' && menu.classList.contains('is-open')) {
      const items = [closeBtn, ...sheet.querySelectorAll('a')];
      const idx = items.indexOf(document.activeElement);
      if (e.shiftKey && idx <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && idx === items.length - 1) { e.preventDefault(); items[0].focus(); }
    }
  });
  // same-page links (#anchors) close the panel before scrolling
  sheet.addEventListener('click', (e) => { const a = e.target.closest('a'); if (a && a.hash && a.pathname === location.pathname) close(false); });
  // coming back via the browser's back button shouldn't show a half-open menu
  addEventListener('pageshow', () => { menu.classList.remove('is-open'); menu.open = false; document.documentElement.classList.remove('menu-lock'); });
})();

/*
 * Site search: a magnifier button beside the menu opens a search panel. The full-text index
 * (js/search-index.js, built by scripts/build-search.js) loads the first time it opens.
 * Matches in titles count most, then summaries and section headings, then body text. Each result
 * links to the section that matched. Shortcuts: "/" or Cmd/Ctrl+K to open, arrows to move, Enter to go, Esc to close.
 */
(function () {
  const mast = document.querySelector('.mast'); if (!mast) return;
  const home = mast.querySelector('.menu a.base') || document.querySelector('a.base');
  if (!home) return;
  const ROOT = new URL('.', home.href).href;                 // the site root (where index.html lives)
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'mast-search'; btn.setAttribute('aria-label', 'Search the explainers');
  btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  mast.querySelector('.in').appendChild(btn);

  const panel = document.createElement('div');
  panel.className = 'srch'; panel.hidden = true;
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-label', 'Search');
  panel.innerHTML = `<div class="srch-dim"></div>
    <div class="srch-box">
      <div class="srch-bar">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <input type="search" placeholder="Search every explainer…" aria-label="Search every explainer" autocomplete="off" spellcheck="false">
        <button type="button" class="srch-x" aria-label="Close search">Esc</button>
      </div>
      <div class="srch-meta" aria-live="polite"></div>
      <ol class="srch-res"></ol>
    </div>`;
  document.body.appendChild(panel);
  const input = panel.querySelector('input'), list = panel.querySelector('.srch-res'), meta = panel.querySelector('.srch-meta');

  let index = null, loading = null, failed = false;
  // load the index with a <script> tag: unlike fetch(), that also works for pages opened from disk
  const getIndex = () => new Promise((ok, no) => {
    if (window.BOTTLENECK_SEARCH) return ok(window.BOTTLENECK_SEARCH);
    const tag = document.createElement('script');
    tag.src = ROOT + 'js/search-index.js';
    tag.onload = () => (window.BOTTLENECK_SEARCH ? ok(window.BOTTLENECK_SEARCH) : no());
    tag.onerror = no;
    document.head.appendChild(tag);
  });
  const load = () => loading || (loading = getIndex().then((d) => {
    // pre-lowercase everything once
    index = d.pages.map((p) => ({ ...p, _t: (p.title + ' ' + p.short).toLowerCase(), _d: (p.dek + ' ' + p.topic + ' ' + p.category).toLowerCase(),
      sec: p.sec.map((s) => ({ ...s, _h: s.h.toLowerCase(), _t: s.t.toLowerCase() })) }));
  }).catch(() => { failed = true; }));

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const terms = (q) => q.toLowerCase().split(/\s+/).filter(Boolean);
  // a short piece of text around the first match, with every term highlighted
  function snippet(t, ts) {
    const low = t.toLowerCase();
    let at = Math.min(...ts.map((x) => { const i = low.indexOf(x); return i < 0 ? Infinity : i; }));
    if (!isFinite(at)) at = 0;
    const from = Math.max(0, at - 70), to = Math.min(t.length, at + 150);
    let s = esc((from ? '…' : '') + t.slice(from, to) + (to < t.length ? '…' : ''));
    ts.forEach((x) => { s = s.replace(new RegExp(esc(x).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), (m) => `<mark>${m}</mark>`); });
    return s;
  }
  function search(q) {
    const ts = terms(q); if (!ts.length || !index) return [];
    const res = [];
    index.forEach((p) => {
      const all = p._t + ' ' + p._d + ' ' + p.sec.map((s) => s._h + ' ' + s._t).join(' ');
      if (!ts.every((x) => all.includes(x))) return;          // every word must appear somewhere on the page
      let score = 0;
      ts.forEach((x) => { if (p._t.includes(x)) score += 12; if (p._d.includes(x)) score += 5; });
      const secs = p.sec.map((s) => {
        let sc = 0;
        ts.forEach((x) => { if (s._h.includes(x)) sc += 4; let i = -1, n = 0; while ((i = s._t.indexOf(x, i + 1)) >= 0 && n < 6) n++; sc += n; });
        return { s, sc };
      }).filter((x) => x.sc > 0).sort((a, b) => b.sc - a.sc);
      score += secs.slice(0, 3).reduce((a, x) => a + x.sc, 0);
      res.push({ p, score, secs: secs.slice(0, 2) });
    });
    return res.sort((a, b) => b.score - a.score).slice(0, 12);
  }
  let sel = -1;
  function render() {
    const q = input.value.trim();
    if (!q) { list.innerHTML = ''; meta.textContent = 'Search titles, sections and the full text of every explainer.'; sel = -1; return; }
    if (failed) { meta.textContent = 'Search is unavailable right now.'; list.innerHTML = ''; return; }
    if (!index) { meta.textContent = 'Loading…'; load().then(() => { if (index || failed) render(); }); return; }
    const res = search(q), ts = terms(q);
    meta.textContent = res.length ? `${res.length} explainer${res.length > 1 ? 's' : ''} found` : 'No matches. Try fewer or different words.';
    list.innerHTML = res.map(({ p, secs }) => {
      const url = ROOT + 'html/' + p.href;
      const parts = secs.length ? secs : [{ s: { id: '', h: '', t: p.dek } }];
      return `<li><a class="srch-hit" href="${url}${parts[0].s.id ? '#' + parts[0].s.id : ''}">
          <span class="srch-cat">${esc(p.category || p.topic)}</span>
          <span class="srch-tt">${snippet(p.title, ts)}</span>
          <span class="srch-sn">${parts[0].s.h ? `<b>${esc(parts[0].s.h)}</b> · ` : ''}${snippet(parts[0].s.t, ts)}</span></a>
        ${parts[1] ? `<a class="srch-sub" href="${url}#${parts[1].s.id}">${parts[1].s.h ? `<b>${esc(parts[1].s.h)}</b> · ` : ''}${snippet(parts[1].s.t, ts)}</a>` : ''}</li>`;
    }).join('');
    sel = -1;
  }
  const hits = () => [...list.querySelectorAll('.srch-hit')];
  function move(d) {
    const h = hits(); if (!h.length) return;
    sel = (sel + d + h.length) % h.length;
    h.forEach((a, i) => a.classList.toggle('on', i === sel));
    h[sel].scrollIntoView({ block: 'nearest' });
  }

  let lastFocus = null;
  function open() {
    if (!panel.hidden) return;
    lastFocus = document.activeElement;
    panel.hidden = false; document.documentElement.classList.add('srch-lock');
    requestAnimationFrame(() => panel.classList.add('is-open'));
    load(); render();
    setTimeout(() => input.focus(), reduced ? 0 : 60);
  }
  function close() {
    panel.classList.remove('is-open'); document.documentElement.classList.remove('srch-lock');
    setTimeout(() => { panel.hidden = true; }, reduced ? 0 : 200);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  btn.addEventListener('click', open);
  panel.querySelector('.srch-dim').addEventListener('click', close);
  panel.querySelector('.srch-x').addEventListener('click', close);
  let t = 0;
  input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(render, 80); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') { const h = hits(); const a = h[sel >= 0 ? sel : 0]; if (a) { e.preventDefault(); location.href = a.href; } }
  });
  // following a link to a section on the page you're on: close the panel first
  list.addEventListener('click', (e) => { const a = e.target.closest('a'); if (a && a.pathname === location.pathname) close(); });
  document.addEventListener('keydown', (e) => {
    const typing = /input|textarea|select/i.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if (e.key === 'Escape' && !panel.hidden) { e.preventDefault(); close(); }
    else if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing && panel.hidden)) { e.preventDefault(); open(); }
  });
  addEventListener('pageshow', () => { if (!panel.hidden) { panel.hidden = true; panel.classList.remove('is-open'); document.documentElement.classList.remove('srch-lock'); } });
})();
