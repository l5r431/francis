/* people.js: class leaders tool and self-moving carousels (home page) */
(function () {
  'use strict';
  /* ---------- Carousels: teachers and prefects ---------- */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.marquee').forEach((m) => {
    const track = m.querySelector('.marquee-track');
    if (!track) return;
    if (!reduce) {
      [...track.children].forEach((item) => {
        const copy = item.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        copy.querySelectorAll('img').forEach((img) => { img.alt = ''; });
        track.appendChild(copy);
      });
      const setSpeed = () => {
        const half = track.scrollWidth / 2;
        m.style.setProperty('--marq-dur', Math.max(25, Math.round(half / 50)) + 's');   // about 50px per second
      };
      setSpeed();
      window.addEventListener('resize', setSpeed);
    }
    const btn = m.parentElement.querySelector('.marquee-toggle');
    if (btn) {
      btn.addEventListener('click', () => {
        const paused = m.classList.toggle('is-paused');
        btn.setAttribute('aria-pressed', String(paused));
        btn.textContent = paused ? 'Play' : 'Pause';
      });
    }
  });

  /* ---------- Class leaders and monitors ---------- */
  const jobs = ['Register monitor', 'Lights and doors', 'Library monitor', 'Computer lab monitor', 'Cleanliness monitor', 'Timekeeper'];
  const classes = {
    s1: { teacher: 'Class teacher: Ms. Doreen Nalubega', titles: ['Class leader', 'Deputy leader'], leader: 'Aisha', deputy: 'Brian', monitors: ['Esther', 'Felix', 'Grace', 'Hassan', 'Irene', 'Jonah'] },
    s2: { teacher: 'Class teacher: Mr. Isaac Byaruhanga', titles: ['Class leader', 'Deputy leader'], leader: 'Ruth', deputy: 'Samuel', monitors: ['Tabitha', 'Umar', 'Vivian', 'Wilson', 'Yvonne', 'Zacharia'] },
    s3: { teacher: 'Class teacher: Mrs. Juliet Kyomuhendo', titles: ['Class leader', 'Deputy leader'], leader: 'Patience', deputy: 'Derrick', monitors: ['Abel', 'Betty', 'Collins', 'Diana', 'Edgar', 'Florence'] },
    s4: { teacher: 'Class teacher: Mr. Ronald Kiggundu', titles: ['Class leader', 'Deputy leader'], leader: 'Gloria', deputy: 'Henry', monitors: ['Immaculate', 'Joshua', 'Kevin', 'Lydia', 'Martin', 'Nancy'] },
    s5: { teacher: 'Class teacher: Ms. Faith Namukasa', titles: ['Class leader', 'Deputy leader'], leader: 'Oliver', deputy: 'Prossy', monitors: ['Quinto', 'Rita', 'Stephen', 'Teddy', 'Urbanus', 'Violet'] },
    s6: { teacher: 'Class teacher: Mr. Moses Wandera', titles: ['Class leader', 'Deputy leader'], leader: 'Timothy', deputy: 'Harriet', monitors: ['Ambrose', 'Beatrice', 'Cyrus', 'Dorcas', 'Elijah', 'Flavia'] }
  };
  const classSelect = document.getElementById('class-select');
  const monitorList = document.getElementById('monitor-list');
  function showClass(key) {
    const c = classes[key];
    document.getElementById('class-teacher').textContent = c.teacher;
    document.getElementById('cl-leader').textContent = c.leader;
    document.getElementById('cl-leader-title').textContent = c.titles[0];
    document.getElementById('cl-leader-initial').textContent = c.leader[0];
    document.getElementById('cl-deputy').textContent = c.deputy;
    document.getElementById('cl-deputy-title').textContent = c.titles[1];
    document.getElementById('cl-deputy-initial').textContent = c.deputy[0];
    monitorList.innerHTML = '';
    jobs.forEach((job, i) => {
      const li = document.createElement('li');
      const b = document.createElement('b'); b.textContent = c.monitors[i];
      const span = document.createElement('span'); span.textContent = job;
      li.append(b, span);
      monitorList.appendChild(li);
    });
    // little pop animation each time the class changes
    document.querySelectorAll('.badge-card, .monitor-list li').forEach((el) => {
      el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
    });
  }
  classSelect.addEventListener('change', () => showClass(classSelect.value));
  showClass(classSelect.value);
})();
