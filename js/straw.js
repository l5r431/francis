/* straw.js (home page only): a see-through drinking straw down the middle of the page.
   It runs flat in some places and bends in others. Water fills it as you scroll: the water's tip stays
   level with the middle of the screen.

   HOW IT STAYS FAST
   The straw used to be one SVG as tall as the whole page, with a mask, redrawn on every scroll tick.
   Now it is a small <canvas> that is only as tall as the screen and only as wide as the straw's wiggle.
   The path is worked out ONCE (and again if the page size changes) as a list of points. While you scroll,
   only the short part of the straw that is on screen is drawn: a few dozen points, a few strokes. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'straw';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  // the pattern: F = flat run (px), B = bend to a side (-1 left, 0 centre, 1 right) over a length (px)
  var PATTERN = [['F', 460], ['B', 1, 380], ['F', 240], ['B', -1, 520], ['B', 1, 520], ['F', 600],
                 ['B', 0, 360], ['F', 320], ['B', -1, 420], ['B', 1, 420], ['B', 0, 380], ['F', 520]];

  var STEPS = 36;            // points used to draw each bend (more = smoother, a little more work)
  var xs = [], ys = [], cum = [];   // the straw as points: x, y (page pixels) and the length so far
  var total = 0, thick = 16, bandLeft = 0, bandW = 0, dpr = 1, vh = 0;
  var wrap = 0, tick = 0, lastH = 0;

  function addPoint(x, y) {
    var n = xs.length;
    cum.push(n ? cum[n - 1] + Math.hypot(x - xs[n - 1], y - ys[n - 1]) : 0);
    xs.push(x);
    ys.push(y);
  }

  // a bend is a cubic curve, stored as many short straight pieces
  function addBend(x0, y0, x1, y1, x2, y2, x3, y3) {
    for (var s = 1; s <= STEPS; s++) {
      var t = s / STEPS, u = 1 - t;
      var a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
      addPoint(a * x0 + b * x1 + c * x2 + d * x3, a * y0 + b * y1 + c * y2 + d * y3);
    }
  }

  function build() {
    var W = document.documentElement.clientWidth;
    var H = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    vh = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    thick = W < 700 ? 13 : 17;           // a slimmer straw than before (it was 22 and 28)
    var cx = W / 2, amp = Math.min(W * 0.26, 170), x = cx, y = 0, i = 0;

    // the Mission / Vision section: the straw must be dead centre and straight all the way through it
    var zone = document.getElementById('purpose'), zt = 1e9, zb = 1e9, zoneDone = true;
    if (zone) {
      var zr = zone.getBoundingClientRect();
      zt = zr.top + window.scrollY; zb = zr.bottom + window.scrollY; zoneDone = false;
    }

    xs = []; ys = []; cum = [];
    addPoint(x, 0);
    while (y < H - 40) {
      if (!zoneDone && y + 80 >= zt - 420) {
        // ease to the centre (if needed), then run flat through the section
        var room = zt - 20 - y;
        if (x !== cx) {
          var bl = Math.max(60, Math.min(360, room));
          addBend(x, y, x, y + bl * 0.55, cx, y + bl * 0.45, cx, y + bl);
          x = cx; y += bl;
        }
        y = Math.max(y, zb + 30);
        addPoint(x, y);
        zoneDone = true;
        continue;
      }
      var s = PATTERN[i % PATTERN.length]; i++;
      if (s[0] === 'F') {
        if (!zoneDone) s = ['F', Math.min(s[1], Math.max(40, zt - 420 - y))];
        y += s[1];
        addPoint(x, y);
      } else {
        if (!zoneDone && y + s[2] > zt - 400) continue;
        var nx = cx + s[1] * amp, len = s[2];
        addBend(x, y, x, y + len * 0.55, nx, y + len * 0.45, nx, y + len);
        x = nx; y += len;
      }
    }
    total = cum[cum.length - 1] || 1;

    // the canvas only covers the strip the straw wiggles in, and is as tall as the screen
    bandW = Math.min(W, Math.ceil(2 * amp + thick + 48));
    bandLeft = Math.round((W - bandW) / 2);
    canvas.style.left = bandLeft + 'px';
    canvas.style.width = bandW + 'px';
    canvas.style.height = vh + 'px';
    canvas.width = Math.round(bandW * dpr);
    canvas.height = Math.round(vh * dpr);
    draw();
  }

  // first point whose y is at or below yy (y only ever goes down the page, so a binary search works)
  function indexAtY(yy) {
    var lo = 0, hi = ys.length - 1;
    while (lo < hi) {
      var mid = (lo + hi) >> 1;
      if (ys[mid] < yy) lo = mid + 1; else hi = mid;
    }
    return lo;
  }
  function lengthAtY(yy) {
    if (yy <= ys[0]) return 0;
    var last = ys.length - 1;
    if (yy >= ys[last]) return total;
    var hi = indexAtY(yy), lo = hi - 1;
    var t = (yy - ys[lo]) / ((ys[hi] - ys[lo]) || 1);
    return cum[lo] + (cum[hi] - cum[lo]) * t;
  }
  function indexAtLength(l) {
    var lo = 0, hi = cum.length - 1;
    while (lo < hi) {
      var mid = (lo + hi) >> 1;
      if (cum[mid] < l) lo = mid + 1; else hi = mid;
    }
    return lo;
  }
  function pointAt(l) {
    var hi = indexAtLength(l);
    if (hi === 0) return [xs[0], ys[0]];
    var lo = hi - 1, t = (l - cum[lo]) / ((cum[hi] - cum[lo]) || 1);
    return [xs[lo] + (xs[hi] - xs[lo]) * t, ys[lo] + (ys[hi] - ys[lo]) * t];
  }

  // add the part of the straw between two lengths to the current path
  function tracePath(a, b) {
    if (b <= a) return false;
    var p = pointAt(a);
    ctx.beginPath();
    ctx.moveTo(p[0], p[1]);
    for (var k = indexAtLength(a); k < xs.length && cum[k] < b; k++) {
      if (cum[k] > a) ctx.lineTo(xs[k], ys[k]);
    }
    p = pointAt(b);
    ctx.lineTo(p[0], p[1]);
    return true;
  }
  function stroke(a, b, color, width) {
    if (!tracePath(a, b)) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  function draw() {
    tick = 0;
    if (!xs.length) return;
    var sy = window.scrollY;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // from here on we draw in PAGE pixels: the transform slides the page under the screen
    ctx.setTransform(dpr, 0, 0, dpr, -bandLeft * dpr, -sy * dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // only the part of the straw that is on screen (plus a little margin)
    var from = lengthAtY(sy - thick * 2), to = lengthAtY(sy + vh + thick * 2);
    var tip = lengthAtY(sy + vh * 0.5);

    // glass tube: a ring (outer stroke with the inside cut out), plus a faint see-through body
    stroke(from, to, 'rgba(20,35,58,.55)', thick);
    ctx.globalCompositeOperation = 'destination-out';
    stroke(from, to, '#000', thick - 4);
    ctx.globalCompositeOperation = 'source-over';
    stroke(from, to, 'rgba(255,255,255,.16)', thick - 4);

    // water up to the middle of the screen
    if (tip > from) stroke(from, Math.min(tip, to), 'rgba(40,150,225,.78)', thick - 8);

    // one shine slides down the last 300px of water, looping as you scroll
    if (tip > 40) {
      var span = Math.min(300, tip), f = (sy * 0.8 % 300) / 300;
      var g = Math.max(0, tip - 300) + f * Math.max(0, span - 18);
      stroke(g, Math.min(g + 18, tip), 'rgba(255,255,255,.75)', 2.5);
    }

    // the droplet at the tip
    if (tip > 4) {
      var p = pointAt(tip);
      ctx.beginPath();
      ctx.arc(p[0], p[1], (thick - 8) / 2 + 1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(40,150,225,.9)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255,255,255,.8)';
      ctx.stroke();
    }
  }

  function onScroll() { if (!tick) tick = requestAnimationFrame(draw); }
  function rebuild() { clearTimeout(wrap); wrap = setTimeout(build, 250); }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', rebuild);
  window.addEventListener('load', rebuild);
  if ('ResizeObserver' in window) {
    new ResizeObserver(function () {
      var h = document.documentElement.scrollHeight;
      if (Math.abs(h - lastH) > 40) { lastH = h; rebuild(); }
    }).observe(document.body);
  }
  build();
})();
