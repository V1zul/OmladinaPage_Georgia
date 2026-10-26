// Shows announcements, news and events saved from the admin panel
import * as backend from './backend.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const text = (field) => (field && typeof field === 'object' ? field[I18N.lang] || field.bs || field.en : field) || '';
const safeUrl = (u) => (/^https?:\/\//i.test(u || '') ? u : '');

const pad = (n) => String(n).padStart(2, '0');
const now = new Date();
const todayKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

function formatDate(ms) {
  const d = new Date(ms);
  const months = I18N.t('months');
  return I18N.lang === 'en'
    ? `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
    : `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}.`;
}

// ---------- Announcements ----------
const annBox = document.getElementById('announcements');
let announcements = [];

function dismissed() {
  try { return JSON.parse(sessionStorage.getItem('dismissed') || '[]'); } catch (e) { return []; }
}

function renderAnnouncements() {
  const hidden = dismissed();
  const active = announcements.filter((a) => (!a.until || a.until >= todayKey) && !hidden.includes(a.id));
  annBox.innerHTML = active.map((a) => {
    const link = safeUrl(a.link);
    return `<div class="announcement" data-id="${esc(a.id)}">
      <div class="container announcement-inner">
        <span class="announcement-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1zM15 9a3 3 0 0 1 0 6M18 6a7 7 0 0 1 0 12"/></svg></span>
        <p><strong>${esc(text(a.title))}</strong>${text(a.text) ? ` <span>${esc(text(a.text))}</span>` : ''}
          ${link ? ` <a href="${esc(link)}" target="_blank" rel="noopener">${esc(I18N.t('ann.more'))} →</a>` : ''}</p>
        <button type="button" class="announcement-close" aria-label="${esc(I18N.t('ann.close'))}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
    </div>`;
  }).join('');
}

annBox.addEventListener('click', (ev) => {
  const btn = ev.target.closest('.announcement-close');
  if (!btn) return;
  const id = btn.closest('.announcement').dataset.id;
  try { sessionStorage.setItem('dismissed', JSON.stringify([...dismissed(), id])); } catch (e) { /* storage unavailable */ }
  renderAnnouncements();
});

// ---------- News ----------
const newsList = document.getElementById('news-list');
const newsSoon = document.getElementById('news-soon');
let news = [];

function renderNews() {
  newsSoon.hidden = news.length > 0;
  newsList.hidden = news.length === 0;
  newsList.innerHTML = news.map((n) => {
    const img = safeUrl(n.image);
    return `<article class="card card-left news-card">
      ${img ? `<img src="${esc(img)}" alt="" class="news-img" loading="lazy">` : ''}
      <span class="card-date">${esc(formatDate(n.createdAt))}</span>
      <h3>${esc(text(n.title))}</h3>
      <p class="news-body">${esc(text(n.body))}</p>
    </article>`;
  }).join('');
}

function renderAll() {
  renderAnnouncements();
  renderNews();
}

document.addEventListener('langchange', renderAll);

if (backend.enabled) {
  backend.init().then(() => {
    backend.watch('announcements', (list) => { announcements = list; renderAnnouncements(); });
    backend.watch('news', (list) => { news = list; renderNews(); });
    backend.watch('events', (list) => window.ZBGACalendar && window.ZBGACalendar.setRemoteEvents(list));
  }).catch((e) => console.warn('Live content unavailable:', e));
}
