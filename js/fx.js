/* fx.js: shared by every page.
   1. Lite mode for slow connections / low-memory phones
   2. Lined + smoky background layer
   3. Date and time card with a greeting for each time of day (uses the visitor's own clock)
   4. Lazy loading for every image, including ones added later by scripts */
(function () {
  var root = document.documentElement;

  // 1. lite mode
  var c = navigator.connection || {};
  if (c.saveData || /(^|-)2g$/.test(c.effectiveType || '') ||
      (navigator.deviceMemory && navigator.deviceMemory <= 2) ||
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2)) {
    root.classList.add('fx-lite');
  }

  // 2. background layer
  var bg = document.createElement('div');
  bg.className = 'bg-fx';
  bg.setAttribute('aria-hidden', 'true');
  bg.innerHTML = '<i class="bg-lines"></i><i class="bg-smoke"></i><i class="bg-smoke"></i>';
  document.body.insertBefore(bg, document.body.firstChild);

  // 3. clock card
  var KEY = 'stfrancis-clock-closed';
  var closed = false;
  try { closed = sessionStorage.getItem(KEY) === '1'; } catch (e) { /* ignore */ }

  var PARTS = [
    { from: 5,  hi: 'Good morning!',   msg: 'A fresh start. Be on time and ready to learn.' },
    { from: 12, hi: 'Good afternoon!', msg: 'Keep going. The day is only half done.' },
    { from: 17, hi: 'Good evening!',   msg: 'Prep time. Review today and plan tomorrow.' },
    { from: 21, hi: 'Good night!',     msg: 'Lights out soon. Rest well, wisdom needs sleep.' },
    { from: 0,  hi: 'Still awake?',    msg: 'Late already. Get some rest for tomorrow.' }
  ];
  function partFor(h) {
    if (h >= 21) return PARTS[3];
    if (h >= 17) return PARTS[2];
    if (h >= 12) return PARTS[1];
    if (h >= 5) return PARTS[0];
    return PARTS[4];
  }

  var main = document.getElementById('main');
  if (main && !closed) {
    var card = document.createElement('div');
    card.className = 'clock-card';
    card.setAttribute('role', 'group');
    card.setAttribute('aria-label', 'Today\u2019s date and time');
    card.innerHTML =
      '<p class="cc-msg"><strong class="cc-greet"></strong><span class="cc-line"></span></p>' +
      '<p class="cc-when"><span class="cc-date"></span><time class="cc-time"></time></p>' +
      '<button type="button" class="cc-close" aria-label="Close the date and time card">\u00d7</button>';
    main.insertBefore(card, main.firstChild);
    root.classList.add('has-clock');

    var greet = card.querySelector('.cc-greet'), line = card.querySelector('.cc-line');
    var dateEl = card.querySelector('.cc-date'), timeEl = card.querySelector('.cc-time');
    var lastDay = '', lastPart = null, timer = 0;

    var tick = function () {
      var d = new Date();
      var t = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (timeEl.textContent !== t) timeEl.textContent = t;
      var day = d.toDateString();
      if (day !== lastDay) {
        lastDay = day;
        dateEl.textContent = d.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      }
      var p = partFor(d.getHours());
      if (p !== lastPart) { lastPart = p; greet.textContent = p.hi; line.textContent = p.msg; }
    };
    var setH = function () { root.style.setProperty('--clock-h', (card.offsetHeight + 4) + 'px'); };
    setH();
    window.addEventListener('resize', setH);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setH);
    var start = function () { tick(); clearInterval(timer); timer = setInterval(tick, 1000); };
    start();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) clearInterval(timer); else start();
    });

    card.querySelector('.cc-close').addEventListener('click', function () {
      clearInterval(timer);
      card.remove();
      root.classList.remove('has-clock');
      root.style.removeProperty('--clock-h');
      try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ }
    });
  }

  // 4. lazy images (static ones are marked in the HTML; this catches the ones scripts add later)
  function lazy(img) {
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
  }
  document.querySelectorAll('img').forEach(lazy);
  new MutationObserver(function (list) {
    list.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        if (n.nodeType !== 1) return;
        if (n.tagName === 'IMG') lazy(n);
        else if (n.querySelectorAll) n.querySelectorAll('img').forEach(lazy);
      });
    });
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
