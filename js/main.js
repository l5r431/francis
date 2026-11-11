/* main.js — shared behaviour on every page: animated mobile menu, footer year, form sending */
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    // open or close the menu: the CSS animates the three lines into an X and slides the panel
    function setNav(open) {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    toggle.addEventListener('click', () => setNav(!nav.classList.contains('open')));
    // choosing a link closes the menu
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
    // Escape closes it and returns focus to the button
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setNav(false); toggle.focus(); }
    });
    // tapping outside closes it
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !toggle.contains(e.target)) setNav(false);
    });
    // going back to a wide screen resets it
    window.matchMedia('(min-width: 981px)').addEventListener('change', (e) => { if (e.matches) setNav(false); });
  }
  // phone browsers tint their address bar with this colour: match today's theme
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const inkNow = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
  if (themeMeta && inkNow) themeMeta.setAttribute('content', inkNow);
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();

/* ---------- Animations on every page ---------- */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Reveal on scroll: anything with data-reveal fades in once when it enters the screen
  const revealEls = [...document.querySelectorAll('[data-reveal]')];
  revealEls.forEach((el) => el.style.setProperty('--d', el.dataset.delay || 0));
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    revealEls.forEach((el) => io.observe(el));
  }

  // 2. Banner image parallax: the picture behind the page title drifts slower than the page
  const bannerImg = document.querySelector('.banner-img');
  if (bannerImg && !reduce) {
    let ticking = false;
    const moveBanner = () => {
      if (window.scrollY < 900) {
        bannerImg.style.transform = 'translateY(' + (window.scrollY * 0.22).toFixed(1) + 'px) scale(1.14)';
      }
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(moveBanner); } }, { passive: true });
  }

  // 3. Page transition: fade out before following a link to another page
  if (!reduce) {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      let url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (!['http:', 'https:', 'file:'].includes(url.protocol)) return;   // mailto:, tel: ...
      if (url.origin !== location.origin) return;                          // other websites
      if (url.pathname === location.pathname && url.search === location.search) return; // same page (#anchor)
      e.preventDefault();
      document.documentElement.classList.add('leaving');
      setTimeout(() => { location.href = a.href; }, 260);
    });
    // coming back with the browser's Back button: undo the fade-out
    window.addEventListener('pageshow', () => document.documentElement.classList.remove('leaving'));
  }
})();

/* ---------- Sticky sub-menu: highlight the section being read (About and News page, People page) ---------- */
(function () {
  const nav = document.querySelector('.subnav');
  if (!nav) return;
  const wrap = nav.querySelector('.wrap');
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href')));
  let activeIndex = -1;
  function spy() {
    const line = window.innerHeight * 0.35;
    let current = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= line) current = i; });
    if (current === activeIndex) return;
    activeIndex = current;
    links.forEach((a, i) => a.classList.toggle('active', i === current));
    if (current >= 0) { // keep the active pill in view on narrow screens
      const a = links[current];
      wrap.scrollTo({ left: a.offsetLeft - wrap.clientWidth / 2 + a.clientWidth / 2, behavior: 'smooth' });
    }
  }
  let ticking = false;
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { spy(); ticking = false; }); } }, { passive: true });
  spy();
})();

/* ---------- Form sending (Formspree) ----------
   1. Create a free form at https://formspree.io and copy its ID.
   2. Replace YOUR_FORM_ID below. Every form on the site uses this one function.   */
const FORMSPREE_URL = 'https://formspree.io/f/xnpjwqga';

async function sendForm(fields) {
  if (FORMSPREE_URL.includes('YOUR_FORM_ID')) {
    console.warn('Formspree is not connected yet: set FORMSPREE_URL in js/main.js');
    return false;
  }
  try {
    const res = await fetch(FORMSPREE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(fields)
    });
    return res.ok;
  } catch (err) {
    return false; // network problem
  }
}

/* Shows a message in a form's status line: kind is 'ok' or 'bad' */
function showStatus(el, message, kind) {
  el.textContent = message;
  el.className = 'form-status' + (kind ? ' ' + kind : '');
}

/* ---------- Floating helpers on every page: reading progress bar, back to top, WhatsApp / call button ----------
   SET THE SCHOOL'S REAL NUMBER on the SCHOOL_PHONE line: digits only, with the country code, no + and no spaces
   (for example 256700123456). The number below is a placeholder copied from the footer. */
(function () {
  const SCHOOL_PHONE = '2561234567890';
  const WHATSAPP_HELLO = 'Hello St. Francis High School, I would like to ask about a place at the school.';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ICON = {
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    chat: '<svg class="icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>',
    close: '<svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
  };

  // 1. reading progress bar along the top of the screen
  const bar = document.createElement('div');
  bar.className = 'read-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  // 2 and 3. the button stack, bottom right
  const stack = document.createElement('div');
  stack.className = 'fab-stack';
  stack.innerHTML =
    '<button class="to-top" type="button" aria-label="Back to top">' + ICON.up + '</button>' +
    '<div class="fab-contact">' +
      '<div class="fab-menu" id="fab-menu">' +
        '<a class="fab-link" style="--i:1" target="_blank" rel="noopener" href="https://wa.me/' + SCHOOL_PHONE +
          '?text=' + encodeURIComponent(WHATSAPP_HELLO) + '">' + ICON.whatsapp + 'Chat on WhatsApp</a>' +
        '<a class="fab-link" style="--i:0" href="tel:+' + SCHOOL_PHONE + '">' + ICON.phone + 'Call the school</a>' +
      '</div>' +
      '<button class="fab-main" type="button" aria-expanded="false" aria-controls="fab-menu" aria-label="Contact the school">' +
        ICON.chat + ICON.close + '</button>' +
    '</div>';
  document.body.appendChild(stack);

  const toTop = stack.querySelector('.to-top');
  const contact = stack.querySelector('.fab-contact');
  const main = stack.querySelector('.fab-main');

  function setMenu(open) {
    contact.classList.toggle('open', open);
    stack.classList.toggle('menu-open', open);
    main.setAttribute('aria-expanded', String(open));
    main.setAttribute('aria-label', open ? 'Close the contact menu' : 'Contact the school');
  }
  main.addEventListener('click', () => setMenu(!contact.classList.contains('open')));
  contact.addEventListener('click', (e) => { if (e.target.closest('.fab-link')) setMenu(false); });
  document.addEventListener('click', (e) => { if (!contact.contains(e.target)) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contact.classList.contains('open')) { setMenu(false); main.focus(); }
  });

  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  // update the bar and the back-to-top button as the page scrolls
  let ticking = false;
  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.transform = 'scaleX(' + progress.toFixed(4) + ')';
    toTop.classList.toggle('show', window.scrollY > 700);
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* ---------- Install as an app, and work offline ----------
   sw.js (the service worker) saves the site on the visitor's phone. It only runs on https:// or localhost,
   so double-clicking index.html will not use it. Below: registering it, the "Install the app" button in the footer,
   and the small "You're offline" notice. */
(function () {
  const secure = location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname);
  if ('serviceWorker' in navigator && secure) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }

  // "Install the app" in the footer, only when the browser says the site can be installed
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const footerBase = document.querySelector('.footer-base');
  if (footerBase && !standalone) {
    const left = document.createElement('div');
    left.className = 'footer-left';
    footerBase.replaceWith(left);
    left.appendChild(footerBase);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'install-btn';
    btn.textContent = 'Install the app';
    btn.hidden = true;
    left.appendChild(btn);

    let offered = null;
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); offered = e; btn.hidden = false; });
    btn.addEventListener('click', async () => {
      if (!offered) return;
      btn.hidden = true;
      offered.prompt();
      await offered.userChoice.catch(() => {});
      offered = null;
    });
    window.addEventListener('appinstalled', () => { btn.hidden = true; });

    // iPhones and iPads have no install button: show how to do it by hand
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (ios) {
      const note = document.createElement('p');
      note.className = 'install-note';
      note.textContent = 'To install: tap the Share button, then “Add to Home Screen”.';
      left.appendChild(note);
    }
  }

  // a small notice while there is no signal
  const pill = document.createElement('div');
  pill.className = 'offline-pill';
  pill.setAttribute('role', 'status');
  pill.textContent = 'Offline Mode.';
  document.body.appendChild(pill);
  const showOnline = () => pill.classList.toggle('show', !navigator.onLine);
  window.addEventListener('online', showOnline);
  window.addEventListener('offline', showOnline);
  showOnline();
})();
