/* admissions.js — first-day checklist, enquiry form (admissions page only) */

// 1. Checklist: remembers ticks in localStorage (wrapped in try/catch in case storage is blocked)
const boxes = [...document.querySelectorAll('#checklist input')];
const progress = document.getElementById('check-progress');
const STORE_KEY = 'stfrancis-first-day';
let saved = [];
try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch (err) { saved = []; }
function showProgress() {
  const done = boxes.filter((b) => b.checked).length;
  progress.textContent = done === boxes.length
    ? 'All done. See you on the first day!'
    : done + ' of ' + boxes.length + ' done';
}
boxes.forEach((b, i) => {
  b.checked = Boolean(saved[i]);
  b.addEventListener('change', () => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(boxes.map((x) => x.checked))); } catch (err) { /* ignore */ }
    showProgress();
  });
});
showProgress();

// 2. Enquiry form: validate on submit, show a message under each bad field
const form = document.getElementById('enquiry-form');
const statusEl = document.getElementById('e-status');
function setError(input, message) {
  const err = input.parentElement.querySelector('.err');
  if (err) err.textContent = message;
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
}
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = form.elements.name;
  const email = form.elements.email;
  const stageSel = form.elements.stage;
  setError(name, name.value.trim() ? '' : 'Enter your name.');
  setError(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) ? '' : 'Enter an email like name@example.com.');
  setError(stageSel, stageSel.value ? '' : 'Choose a class.');
  const bad = [name, email, stageSel].find((el) => el.getAttribute('aria-invalid') === 'true');
  if (bad) { bad.focus(); showStatus(statusEl, 'Please fix the highlighted fields.', 'bad'); return; }

  // Honeypot: real people never see this field. If it is filled, pretend success and send nothing.
  if (form.elements._gotcha.value) { showStatus(statusEl, 'Thank you.', 'ok'); form.reset(); return; }

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  showStatus(statusEl, 'Sending...', '');
  const ok = await sendForm({
    form: 'Admissions enquiry',
    _subject: 'New admissions enquiry from ' + name.value.trim(),
    name: name.value.trim(),
    email: email.value.trim(),
    _replyto: email.value.trim(),
    class_applying: stageSel.value,
    day_or_boarding: form.elements.mode.value,
    message: form.elements.message.value.trim()
  });
  button.disabled = false;
  if (ok) {
    showStatus(statusEl, 'Thank you, ' + name.value.trim() + '. Your enquiry has been sent. We will email you within two working days.', 'ok');
    form.reset();
  } else {
    showStatus(statusEl, 'Sorry, your enquiry could not be sent. Please try again or call the school office.', 'bad');
  }
});
