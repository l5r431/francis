/* straw.js (home page only): a see-through drinking straw down the middle of the page.
   It runs flat in some places and bends in others. Water fills it as you scroll: the water's tip stays
   level with the middle of the screen. The straw is drawn once (and again if the page size changes);
   while scrolling only the water's dash offset and the little droplet move. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var NS = 'http://www.w3.org/2000/svg';
  var host = document.createElement('div');
  host.className = 'straw';
  host.setAttribute('aria-hidden', 'true');
  document.body.appendChild(host);

  function mk(name, attrs, parent) {
    var el = document.createElementNS(NS, name);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    (parent || host).appendChild(el);
    return el;
  }

  // the pattern: F = flat run (px), B = bend to a side (-1 left, 0 centre, 1 right) over a length (px)
  var PATTERN = [['F', 460], ['B', 1, 380], ['F', 240], ['B', -1, 520], ['B', 1, 520], ['F', 600],
                 ['B', 0, 360], ['F', 320], ['B', -1, 420], ['B', 1, 420], ['B', 0, 380], ['F', 520]];

  var W = 0, H = 0, d = '', total = 0, table = [], water, glint, drop, tube, hole;
  var wrap = 0, tick = 0;

  function build() {
    host.style.display = 'none'; // measure the page without the straw so it can shrink again
    W = document.documentElement.clientWidth;
    H = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    var cx = W / 2, amp = Math.min(W * 0.26, 170), x = cx, y = 0, i = 0;
    var path = 'M' + x + ' 0';
    while (y < H - 40) {
      var s = PATTERN[i % PATTERN.length]; i++;
      if (s[0] === 'F') {
        y += s[1];
        path += ' L' + x + ' ' + y;
      } else {
        var nx = cx + s[1] * amp, len = s[2];
        path += ' C' + x + ' ' + (y + len * 0.55) + ' ' + nx + ' ' + (y + len * 0.45) + ' ' + nx + ' ' + (y + len);
        x = nx; y += len;
      }
    }
    host.style.display = '';
    d = path;
    host.style.width = W + 'px';
    host.style.height = H + 'px';
    host.textContent = '';
    var svg = mk('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H });
    var thick = W < 700 ? 22 : 28;

    // glass tube: a ring (outer stroke with the inside cut out by a mask), plus a faint see-through body
    var defs = mk('defs', {}, svg);
    var mask = mk('mask', { id: 'straw-cut', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H }, defs);
    mk('rect', { x: 0, y: 0, width: W, height: H, fill: '#fff' }, mask);
    mk('path', { d: d, fill: 'none', stroke: '#000', 'stroke-width': thick - 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, mask);
    mk('path', { d: d, fill: 'none', stroke: '#fff', 'stroke-opacity': 0.16, 'stroke-width': thick - 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
    tube = mk('path', { d: d, fill: 'none', stroke: 'rgba(20,35,58,.55)', 'stroke-width': thick, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', mask: 'url(#straw-cut)' }, svg);
    // water, a moving shine on it, and the droplet at its tip
    water = mk('path', { d: d, fill: 'none', stroke: 'rgba(40,150,225,.78)', 'stroke-width': thick - 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
    glint = mk('path', { d: d, fill: 'none', stroke: 'rgba(255,255,255,.75)', 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
    drop = mk('circle', { r: (thick - 8) / 2 + 1, fill: 'rgba(40,150,225,.9)', stroke: 'rgba(255,255,255,.8)', 'stroke-width': 1.5 }, svg);

    total = water.getTotalLength();
    water.style.strokeDasharray = total + ' ' + total;
    glint.style.strokeDasharray = '18 ' + total;
    // y -> length lookup so the tip can follow the screen's middle line
    table = [];
    var N = 240;
    for (var k = 0; k <= N; k++) {
      var l = total * k / N;
      table.push([l, water.getPointAtLength(l).y]);
    }
    update();
  }

  function lengthAtY(yy) {
    if (yy <= table[0][1]) return 0;
    var lo = 0, hi = table.length - 1;
    if (yy >= table[hi][1]) return total;
    while (hi - lo > 1) {
      var mid = (lo + hi) >> 1;
      if (table[mid][1] < yy) lo = mid; else hi = mid;
    }
    var a = table[lo], b = table[hi], t = (yy - a[1]) / ((b[1] - a[1]) || 1);
    return a[0] + (b[0] - a[0]) * t;
  }

  function update() {
    tick = 0;
    if (!water) return;
    var len = lengthAtY(window.scrollY + window.innerHeight * 0.5);
    water.style.strokeDashoffset = total - len;
    // one shine slides down the last 300px of water, looping as you scroll
    var span = Math.min(300, len), f = (window.scrollY * 0.8 % 300) / 300;
    glint.style.strokeDashoffset = -(Math.max(0, len - 300) + f * Math.max(0, span - 18));
    glint.style.opacity = len > 40 ? 1 : 0;
    var p = water.getPointAtLength(Math.min(len, total));
    drop.setAttribute('cx', p.x);
    drop.setAttribute('cy', p.y);
    drop.style.opacity = len > 4 ? 1 : 0;
  }

  function onScroll() { if (!tick) tick = requestAnimationFrame(update); }
  function rebuild() { clearTimeout(wrap); wrap = setTimeout(build, 250); }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', rebuild);
  window.addEventListener('load', rebuild);
  if ('ResizeObserver' in window) {
    var lastH = 0;
    new ResizeObserver(function () {
      var h = document.documentElement.scrollHeight;
      if (Math.abs(h - lastH) > 40) { lastH = h; rebuild(); }
    }).observe(document.body);
  }
  build();
})();
