/* about.js — about page only: timeline, key person helper, news filter + search */
const items = document.querySelectorAll('#timeline li');
items.forEach((li) => {
  const btn = li.querySelector('button');
  const text = li.querySelector('p');
  btn.addEventListener('click', () => {
    const wasOpen = btn.getAttribute('aria-expanded') === 'true';
    items.forEach((other) => {
      other.querySelector('button').setAttribute('aria-expanded', 'false');
      other.querySelector('p').hidden = true;
    });
    if (!wasOpen) { btn.setAttribute('aria-expanded', 'true'); text.hidden = false; }
  });
});

const keyText = {
  s12: 'A class teacher looks after your class all year, and a house master or mistress follows your progress and your house points. You meet both in orientation week.',
  s34: 'Your class teacher and subject teachers guide your subject choices, and the guidance team helps you plan for UCE and what comes next.',
  s56: 'A class teacher and a career guidance teacher help you plan for university, college or work. You can also become a prefect or club leader.',
  board: 'A warden and a matron look after every dormitory day and night, and your class teacher and house master or mistress stay in touch with your family.'
};
const keySelect = document.getElementById('key-year');
const keyOut = document.getElementById('key-out');
keySelect.addEventListener('change', () => {
  keyOut.textContent = keyText[keySelect.value] || 'Pick a level to see who your main adults will be.';
});

/* ---------- News: category filter + search ---------- */
const chipButtons = document.querySelectorAll('#news-chips button');
const articles = document.querySelectorAll('#news-grid article');
const searchBox = document.getElementById('news-search');
const emptyMsg = document.getElementById('news-empty');
let activeCat = 'all';

function applyNewsFilter() {
  const q = searchBox.value.trim().toLowerCase();
  let shown = 0;
  articles.forEach((a) => {
    const catOk = activeCat === 'all' || a.dataset.cat === activeCat;
    const textOk = a.textContent.toLowerCase().includes(q);
    a.hidden = !(catOk && textOk);
    if (!a.hidden) shown++;
  });
  emptyMsg.hidden = shown !== 0;
}
chipButtons.forEach((b) => b.addEventListener('click', () => {
  activeCat = b.dataset.cat;
  chipButtons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  applyNewsFilter();
}));
searchBox.addEventListener('input', applyNewsFilter);
