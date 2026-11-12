/* sw.js: the service worker. It lets the site open with no signal and be installed like an app.
   It only runs on https:// (or localhost), never when you double-click index.html.

   !! EVERY TIME YOU PUBLISH CHANGES, add 1 to VERSION below. That throws away the saved copies on visitors' phones
   so they get your new pictures and frames. (Pages, CSS and scripts also refresh by themselves when there is signal.) */
const VERSION = 'stfrancis-v7';

const SHELL = VERSION + '-shell';     // the pages and code, saved when the app is first opened
const RUNTIME = VERSION + '-media';   // pictures and frames, saved the first time each one is seen
const FONTS = VERSION + '-fonts';     // the Google fonts
const MAX_MEDIA = 600;                // keep at most this many saved pictures
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

const SHELL_FILES = [
  "./",
  "about.html",
  "academics.html",
  "admissions.html",
  "contact.html",
  "index.html",
  "life.html",
  "css/about.css",
  "css/academics.css",
  "css/admissions.css",
  "css/base.css",
  "css/contact.css",
  "css/fx.css",
  "css/home.css",
  "css/life.css",
  "css/people.css",
  "js/about.js",
  "js/academics.js",
  "js/admissions.js",
  "js/contact.js",
  "js/fx.js",
  "js/straw.js",
  "js/home.js",
  "js/life.js",
  "js/main.js",
  "js/people.js",
  "js/theme.js",
  "frames/manifest.js",
  "frames-mobile/manifest.js",
  "site.webmanifest",
  "images/icon-192.png",
  "images/icon-512.png",
  "images/apple-touch-icon.png",
  "images/favicon-96x96.png",
  "images/favicon.ico",
  "images/favicon.svg",
  "images/logo-full-256-original.png",
  "offline.html"
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    // one missing file must not stop the rest from being saved
    await Promise.all(SHELL_FILES.map((f) => cache.add(new Request(f, { cache: 'reload' })).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = [SHELL, RUNTIME, FONTS];
    const names = await caches.keys();
    await Promise.all(names.filter((n) => n.startsWith('stfrancis-') && !keep.includes(n)).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    if (req.mode === 'navigate') {
      event.respondWith(openPage(req));
    } else if (/\.(?:css|js|webmanifest|json)$/.test(url.pathname)) {
      event.respondWith(staleWhileRevalidate(event, SHELL));
    } else {
      event.respondWith(cacheFirst(req, RUNTIME)); // pictures, frames, icons
    }
  } else if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(event, FONTS));
  }
  // anything else (the map, the contact forms) goes straight to the internet
});

// A page: ask the internet first (so changes show up), fall back to the saved copy, then to offline.html
async function openPage(req) {
  const cache = await caches.open(SHELL);
  try {
    const fresh = await fetchWithTimeout(req, 5000);
    if (fresh.ok) {
      const u = new URL(req.url);
      await cache.put(new Request(u.origin + u.pathname), fresh.clone()); // ?theme=tue and similar share one copy
    }
    return fresh;
  } catch (err) {
    return (await cache.match(req, { ignoreSearch: true })) ||
           (await cache.match('offline.html')) ||
           new Response('Offline.', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

function fetchWithTimeout(req, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(req, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

// Code and fonts: show the saved copy at once, and update it in the background
async function staleWhileRevalidate(event, cacheName) {
  const cache = await caches.open(cacheName);
  const saved = await cache.match(event.request);
  const update = fetch(event.request).then((res) => {
    if (res.ok || res.type === 'opaque') cache.put(event.request, res.clone());
    return res;
  }).catch(() => null);
  event.waitUntil(update);
  return saved || (await update) || Response.error();
}

// Pictures and frames: use the saved one if there is one, otherwise get it and save it
async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const saved = await cache.match(req);
  if (saved) return saved;
  try {
    const res = await fetch(req);
    if (res.ok) {
      await cache.put(req, res.clone());
      trim(cache, MAX_MEDIA);
    }
    return res;
  } catch (err) {
    return Response.error();
  }
}

async function trim(cache, max) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}
