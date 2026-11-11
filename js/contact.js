/* contact.js — live office-hours status + visit request form (contact page only) */

// 1. Office status from the visitor's local clock
// Hours: Mon-Fri 8:00-18:00, Sat 9:00-12:00, Sun closed
function officeStatus(now) {
  const day = now.getDay(); // 0 = Sunday
  const mins = now.getHours() * 60 + now.getMinutes();
  if (day >= 1 && day <= 5) return mins >= 480 && mins < 1080;
  if (day === 6) return mins >= 540 && mins < 720;
  return false;
}
const dot = document.getElementById('status-dot');
const text = document.getElementById('status-text');
const isOpen = officeStatus(new Date());
dot.className = 'dot ' + (isOpen ? 'open' : 'closed');
text.textContent = isOpen ? 'The office is open now. Call us.' : 'The office is closed. Send a request and we will reply on the next working day.';

// 2. Visit form: validate, then send with Formspree and confirm
const form = document.getElementById('visit-form');
const statusEl = document.getElementById('v-status');
const dateInput = document.getElementById('v-date');
dateInput.min = new Date().toISOString().split('T')[0]; // no past dates

function setError(input, message) {
  const err = input.parentElement.querySelector('.err');
  err.textContent = message;
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
}
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('v-name');
  const email = document.getElementById('v-email');
  const type = document.getElementById('v-type');
  setError(name, name.value.trim() ? '' : 'Enter your name.');
  setError(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) ? '' : 'Enter an email like name@example.com.');
  setError(dateInput, dateInput.value ? '' : 'Choose a date.');
  setError(type, type.value ? '' : 'Choose a type of visit.');
  const bad = form.querySelector('[aria-invalid="true"]');
  if (bad) { bad.focus(); showStatus(statusEl, 'Please fix the highlighted fields.', 'bad'); return; }

  const honeypot = form.querySelector('[name="_gotcha"]');
  if (honeypot.value) { showStatus(statusEl, 'Thank you.', 'ok'); form.reset(); return; }

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  showStatus(statusEl, 'Sending...', '');
  const ok = await sendForm({
    form: 'Visit request',
    _subject: 'Visit request from ' + name.value.trim(),
    name: name.value.trim(),
    email: email.value.trim(),
    _replyto: email.value.trim(),
    preferred_date: dateInput.value,
    visit_type: type.value
  });
  button.disabled = false;
  if (ok) {
    showStatus(statusEl, 'Thank you, ' + name.value.trim() + '. Your visit request for ' + dateInput.value + ' has been sent. We will confirm by email.', 'ok');
    form.reset();
  } else {
    showStatus(statusEl, 'Sorry, your request could not be sent. Please try again or call the school office.', 'bad');
  }
});
