/* academics.js — pathway tabs, animated result bars, subject search (academics page only) */

// 1. Pathway tabs
const paths = {
  s1:  { title: 'S.1: Starting strong', text: 'A new school and a wide range of subjects. We help every student settle in and build good study habits.', list: ['Orientation week and a house to belong to', 'English, mathematics, sciences and ICT basics', 'Library induction and reading challenge', 'A teacher mentor for every student'] },
  s2:  { title: 'S.2: Growing in confidence', text: 'Students deepen their knowledge, join clubs and take on roles in class and in their house.', list: ['Regular practicals in the science labs', 'Computer lab sessions and coding club', 'Debate, music, sport and drama', 'Class monitor and house roles'] },
  s3:  { title: 'S.3: Choosing well', text: 'Subject choices matter now. Teachers and the guidance team help students pick what suits their strengths and goals.', list: ['Subject choice guidance for S.4', 'Entrepreneurship and project work', 'Career talks and the careers day', 'Study groups and remedial support'] },
  s4:  { title: 'S.4: Getting ready for UCE', text: 'A focused year with mock exams, revision clinics and plenty of support before the national exams.', list: ['Mock exams and revision clinics', 'Extra evening prep for boarders', 'Past-paper practice in the library', 'Leavers\' prom and farewell'] },
  s56: { title: 'S.5 to S.6: A-Level and beyond (UACE)', text: 'Specialist subject combinations, independent study and real preparation for university, college and work.', list: ['Subject combinations and General Paper', 'Prefect and leadership roles', 'University and career guidance', 'Leavers\' prom and graduation'] }
};
const chips = document.querySelectorAll('#path-chips button');
function showPath(key) {
  const p = paths[key];
  document.getElementById('path-title').textContent = p.title;
  document.getElementById('path-text').textContent = p.text;
  const ul = document.getElementById('path-list');
  ul.innerHTML = '';
  p.list.forEach((item) => { const li = document.createElement('li'); li.textContent = item; ul.appendChild(li); });
  chips.forEach((c) => c.setAttribute('aria-selected', String(c.dataset.path === key)));
}
chips.forEach((c) => c.addEventListener('click', () => showPath(c.dataset.path)));
showPath('s1');

// 2. Bars grow when scrolled into view
const bars = document.querySelectorAll('.bar i');
function fill(el) { el.style.width = el.dataset.value + '%'; }
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { fill(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.5 });
  bars.forEach((b) => io.observe(b));
} else { bars.forEach(fill); }

// 3. Subject search
const search = document.getElementById('subject-search');
const subjects = document.querySelectorAll('#subject-list li');
const empty = document.getElementById('subject-empty');
search.addEventListener('input', () => {
  const q = search.value.trim().toLowerCase();
  let shown = 0;
  subjects.forEach((li) => {
    const match = li.textContent.toLowerCase().includes(q);
    li.hidden = !match;
    if (match) shown++;
  });
  empty.hidden = shown !== 0;
});
