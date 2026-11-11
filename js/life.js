/* life.js — activity filter + pinned day story + sample menu + photo gallery (life page only) */

// 1. Activity filter
const buttons = document.querySelectorAll('#act-chips button');
const cards = document.querySelectorAll('#act-grid li');
const count = document.getElementById('act-count');
function filter(cat) {
  let shown = 0;
  cards.forEach((c) => {
    const show = cat === 'all' || c.dataset.cat === cat;
    c.hidden = !show;
    if (show) shown++;
  });
  buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === cat)));
  count.textContent = 'Showing ' + shown + ' of ' + cards.length + ' activities';
}
buttons.forEach((b) => b.addEventListener('click', () => filter(b.dataset.cat)));
filter('all');

// 2. "A day at St. Francis": on wide screens the section pins and scrolling slides the cards sideways;
//    with reduced motion it is a swipeable strip with Previous / Next buttons.
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (n, a, b) => Math.min(Math.max(n, a), b);
  const stickTop = (el) => parseFloat(getComputedStyle(el).top) || 0;
  const day = document.getElementById('day');
  const daySticky = day.querySelector('.day-sticky');
  const dayTrack = document.getElementById('day-track');
  const dayBar = document.getElementById('day-bar');
  const DAY_SPEED = 1.8;   // sideways pixels per scrolled pixel (higher = shorter section)
  const pinned = !reduce;
  if (pinned) {
    day.classList.add('day--pinned');
    dayTrack.removeAttribute('tabindex');
  }
  const distance = () => Math.max(dayTrack.scrollWidth - window.innerWidth + 40, 0);
  function size() {
    if (pinned) day.style.height = Math.round(daySticky.offsetHeight + distance() / DAY_SPEED) + 'px';
  }
  function update() {
    let progress;
    if (pinned) {
      const box = day.getBoundingClientRect();
      const span = box.height - daySticky.offsetHeight;
      progress = span > 0 ? clamp((stickTop(daySticky) - box.top) / span, 0, 1) : 0;
      dayTrack.style.transform = 'translateX(' + (-progress * distance()).toFixed(1) + 'px)';
    } else {
      const furthest = dayTrack.scrollWidth - dayTrack.clientWidth;
      progress = furthest > 0 ? clamp(dayTrack.scrollLeft / furthest, 0, 1) : 1;
    }
    dayBar.style.transform = 'scaleX(' + Math.max(progress, 0.08).toFixed(3) + ')';
  }
  function slide(direction) {
    const card = dayTrack.querySelector('.day-card');
    const gap = parseFloat(getComputedStyle(dayTrack).columnGap) || 0;
    dayTrack.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: reduce ? 'auto' : 'smooth' });
  }
  dayTrack.addEventListener('scroll', update, { passive: true });
  window.addEventListener('scroll', update, { passive: true });
  document.getElementById('day-prev').addEventListener('click', () => slide(-1));
  document.getElementById('day-next').addEventListener('click', () => slide(1));
  window.addEventListener('resize', () => { size(); update(); });
  window.addEventListener('load', () => { size(); update(); });
  size();
  update();
})();

// 3. Sample lunch menu by day
const menu = {
  mon: { main: 'Porridge and bread', veg: 'Posho, beans and cabbage', pud: 'Rice, beef stew and greens' },
  tue: { main: 'Tea, chapati and boiled eggs', veg: 'Matooke, groundnut sauce and greens', pud: 'Posho and beans with avocado' },
  wed: { main: 'Porridge and sweet potatoes', veg: 'Rice, beans and cabbage', pud: 'Irish potatoes, chicken stew and greens' },
  thu: { main: 'Tea and mandazi', veg: 'Posho, peas and greens', pud: 'Cassava, fish stew and vegetables' },
  fri: { main: 'Porridge and bread with margarine', veg: 'Rice, lentils and a fruit', pud: 'Chapati, beans and a fruit' }
};
const menuBtns = document.querySelectorAll('#menu-chips button');
const menuCard = document.getElementById('menu-card');
function showMenu(key) {
  const m = menu[key];
  menuCard.innerHTML = '';
  [['Breakfast', m.main], ['Lunch', m.veg], ['Supper', m.pud]].forEach(([label, text]) => {
    const h = document.createElement('h3'); h.textContent = label;
    const p = document.createElement('p'); p.textContent = text;
    menuCard.append(h, p);
  });
  menuBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.day === key)));
}
menuBtns.forEach((b) => b.addEventListener('click', () => showMenu(b.dataset.day)));
showMenu('mon');

// 4. Photo gallery: tap a photo to open it bigger, then swipe, tap the arrows or use the arrow keys
(function () {
  const items = [...document.querySelectorAll('.gallery-item')];
  const box = document.getElementById('lightbox');
  if (!items.length || !box || typeof box.showModal !== 'function') return;
  const photo = document.getElementById('lb-img');
  const caption = document.getElementById('lb-cap');
  const counter = document.getElementById('lb-count');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;

  // a button can carry data-full="img/big-photo.jpg" to open a larger picture than its thumbnail
  const bigSrc = (i) => items[i].dataset.full || items[i].querySelector('img').src;

  function show(i) {
    index = (i + items.length) % items.length;
    const thumb = items[index].querySelector('img');
    photo.src = bigSrc(index);
    photo.alt = thumb.alt;
    caption.textContent = items[index].dataset.caption || thumb.alt;
    counter.textContent = (index + 1) + ' of ' + items.length;
    if (!reduce && photo.animate) photo.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220 });
    // start loading the neighbours so the next photo appears at once
    [index - 1, index + 1].forEach((n) => { new Image().src = bigSrc((n + items.length) % items.length); });
  }

  items.forEach((b, i) => b.addEventListener('click', () => { show(i); box.showModal(); }));
  document.getElementById('lb-prev').addEventListener('click', () => show(index - 1));
  document.getElementById('lb-next').addEventListener('click', () => show(index + 1));
  document.getElementById('lb-close').addEventListener('click', () => box.close());

  // tapping the dark area around the photo closes it
  box.addEventListener('click', (e) => { if (e.target === box) box.close(); });

  // arrow keys (Escape is handled by the browser)
  document.addEventListener('keydown', (e) => {
    if (!box.open) return;
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });

  // swipe left or right on a phone
  let startX = 0;
  let startY = 0;
  box.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; }, { passive: true });
  box.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(dx < 0 ? index + 1 : index - 1);
  }, { passive: true });

  // when it closes, put the keyboard focus back on the photo that was last open
  box.addEventListener('close', () => items[index].focus({ preventScroll: true }));
})();
