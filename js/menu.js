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
