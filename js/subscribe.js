// "Stay up to date" floating sign-up form
import * as backend from './backend.js?v=dev';

const dialog = document.getElementById('subscribe-dialog');
const form = document.getElementById('subscribe-form');
const stepForm = document.getElementById('sub-step-form');
const stepDone = document.getElementById('sub-step-done');
const msg = form.querySelector('.sub-msg');
const submitBtn = stepForm.querySelector('button[type="submit"]');
const submitLabel = submitBtn.querySelector('span');

function open() {
  stepForm.hidden = false;
  stepDone.hidden = true;
  msg.textContent = '';
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
  form.elements.name.focus();
}

function close() {
  if (typeof dialog.close === 'function') dialog.close();
  else dialog.removeAttribute('open');
}

document.querySelectorAll('[data-subscribe]').forEach((btn) => btn.addEventListener('click', open));
form.querySelectorAll('[data-close]').forEach((btn) => btn.addEventListener('click', close));

// Click on the dark area around the bubble closes it
dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });

function fail(key, field) {
  msg.textContent = I18N.t(key);
  if (field) form.elements[field].focus();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = '';

  const name = form.elements.name.value.trim().replace(/\s+/g, ' ');
  const email = form.elements.email.value.trim();
  const phone = form.elements.phone.value.trim();

  if (form.elements.website.value) return; // spam bot
  if (name.length < 2) return fail('sub.err.name', 'name');
  if (!/^[^@\s/]+@[^@\s/]+\.[^@\s/]+$/.test(email) || email.length > 200) return fail('sub.err.email', 'email');
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15 || !/^[+\d\s().-]+$/.test(phone)) return fail('sub.err.phone', 'phone');
  if (!form.elements.consent.checked) return fail('sub.err.consent', 'consent');
  if (!backend.enabled) return fail('sub.err.offline');

  submitBtn.disabled = true;
  submitLabel.textContent = I18N.t('sub.sending');
  try {
    await backend.subscribe({ name, email, phone, lang: I18N.lang });
    form.reset();
    stepForm.hidden = true;
    stepDone.hidden = false;
    stepDone.querySelector('button').focus();
  } catch (err) {
    if (err && err.code === 'permission-denied') fail('sub.err.exists', 'email');
    else if (err && err.code === 'unavailable') fail('sub.err.offline');
    else fail('sub.err.generic');
  } finally {
    submitBtn.disabled = false;
    submitLabel.textContent = I18N.t('sub.submit');
  }
});

// Keep the button label in the chosen language
document.addEventListener('langchange', () => { if (!submitBtn.disabled) submitLabel.textContent = I18N.t('sub.submit'); });
