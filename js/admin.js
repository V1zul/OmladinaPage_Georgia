// Admin side panel: login, announcements, events, news, admin accounts
import * as backend from './backend.js?v=dev';

const panel = document.getElementById('admin-panel');
const backdrop = document.getElementById('admin-backdrop');
const body = document.getElementById('admin-body');
const triggers = document.querySelectorAll('.admin-trigger');

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const bs = (field) => (field && typeof field === 'object' ? field.bs || field.en : field) || '';

let user; // undefined = still checking, null = logged out
let tab = 'announcements';
let lists = { announcements: [], events: [], news: [], subscribers: [], admins: [] };
let unsubs = [];
let watching = false;
let lastFocus = null;

// ---------- Open / close ----------
function open() {
  lastFocus = document.activeElement;
  panel.classList.add('open');
  backdrop.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  document.body.classList.add('admin-open');
  start();
  setTimeout(() => (panel.querySelector('input, button') || panel).focus(), 50);
}

function close() {
  panel.classList.remove('open');
  backdrop.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('admin-open');
  if (location.hash === '#admin') history.replaceState(null, '', location.pathname + location.search);
  if (lastFocus) lastFocus.focus();
}

triggers.forEach((t) => t.addEventListener('click', open));
backdrop.addEventListener('click', close);
panel.querySelector('.admin-close').addEventListener('click', close);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && panel.classList.contains('open')) close(); });
if (location.hash === '#admin') open();

// ---------- Helpers ----------
function friendlyError(err) {
  const code = (err && err.code) || '';
  const map = {
    'auth/invalid-credential': 'Wrong email or password.',
    'auth/invalid-login-credentials': 'Wrong email or password.',
    'auth/wrong-password': 'Wrong password.',
    'auth/user-not-found': 'Wrong email or password.',
    'auth/invalid-email': 'That email address is not valid.',
    'auth/too-many-requests': 'Too many attempts. Wait a few minutes and try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password must be at least 8 characters.',
    'auth/network-request-failed': 'No connection. Check your internet and try again.',
    'permission-denied': 'You do not have permission to do that.',
  };
  return map[code] || (err && err.message) || 'Something went wrong.';
}

function setMsg(form, msg, ok = false) {
  const el = form.querySelector('.form-msg');
  el.textContent = msg;
  el.className = 'form-msg' + (ok ? ' ok' : ' err');
}

async function submit(form, fn, okMsg) {
  // Lists can re-render the tab while saving, so always work on the form currently on screen
  const current = () => (form.dataset.form && body.querySelector(`[data-form="${form.dataset.form}"]`)) || form;
  form.querySelector('button[type="submit"]').disabled = true;
  setMsg(form, '');
  try {
    await fn();
    if (okMsg) { current().reset(); setMsg(current(), okMsg, true); }
  } catch (err) {
    setMsg(current(), friendlyError(err));
  } finally {
    current().querySelector('button[type="submit"]').disabled = false;
  }
}

const val = (form, name) => (form.elements[name].value || '').trim();
const pair = (form, name) => ({ bs: val(form, name + '_bs'), en: val(form, name + '_en') });

// ---------- Data subscriptions ----------
async function start() {
  if (!backend.enabled || watching) return render();
  watching = true;
  render();
  try {
    await backend.onUser((u) => {
      user = u;
      unsubs.forEach((fn) => fn && fn());
      unsubs = [];
      if (user && user.admin) {
        ['announcements', 'events', 'news', 'subscribers'].forEach(async (c) => unsubs.push(await backend.watch(c, (l) => { lists[c] = l; renderTab(); })));
        backend.watchAdmins((l) => { lists.admins = l; renderTab(); }).then((fn) => unsubs.push(fn));
      }
      render();
    });
  } catch (err) {
    body.innerHTML = `<div class="admin-note err">Could not connect: ${esc(friendlyError(err))}</div>`;
  }
}

// ---------- Views ----------
function render() {
  if (!backend.enabled) {
    body.innerHTML = `<div class="admin-note">
      <h3>Admin panel is not connected yet</h3>
      <p>Follow the steps in <strong>ADMIN_SETUP.md</strong> in the repository to connect Firebase. After that you can log in here.</p>
    </div>`;
    return;
  }
  if (user === undefined) { body.innerHTML = '<p class="a-empty">Loading…</p>'; return; }
  if (!user) return renderLogin();
  if (!user.admin) {
    body.innerHTML = `<div class="admin-note">
      <h3>No admin access</h3>
      <p>${esc(user.email)} is not an admin account.</p>
      <button type="button" class="a-btn a-btn-ghost" id="a-logout">Log out</button>
    </div>`;
    body.querySelector('#a-logout').addEventListener('click', () => backend.logout());
    return;
  }
  renderDashboard();
}

function renderLogin() {
  body.innerHTML = `<form class="a-form" id="a-login" autocomplete="on">
    <div class="admin-lock" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></div>
    <h3>Admin login</h3>
    <label>Email<input type="email" name="email" required autocomplete="username"></label>
    <label>Password<input type="password" name="password" required autocomplete="current-password"></label>
    <button type="submit" class="a-btn">Log in</button>
    <p class="form-msg" role="alert"></p>
  </form>`;
  const form = body.querySelector('#a-login');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submit(form, () => backend.login(val(form, 'email'), form.elements.password.value));
  });
}

const TABS = [
  ['announcements', 'Announcements'],
  ['events', 'Events'],
  ['news', 'News'],
  ['subscribers', 'Subscribers'],
  ['admins', 'Admins'],
  ['account', 'My account'],
];

function renderDashboard() {
  body.innerHTML = `<p class="admin-who">Logged in as <strong>${esc(user.email)}</strong></p>
    <div class="admin-tabs" role="tablist">
      ${TABS.map(([id, label]) => `<button type="button" role="tab" data-tab="${id}" aria-selected="${tab === id}">${label}</button>`).join('')}
    </div>
    <div id="admin-tab"></div>`;
  body.querySelector('.admin-tabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (!b) return;
    tab = b.dataset.tab;
    body.querySelectorAll('[data-tab]').forEach((x) => x.setAttribute('aria-selected', x.dataset.tab === tab));
    renderTab();
  });
  renderTab();
}

function itemList(collection, describe) {
  const items = lists[collection];
  if (!items.length) return '<p class="a-empty">Nothing here yet.</p>';
  return `<ul class="a-list">${items.map((it) => `<li>
      <div><strong>${esc(describe(it).title)}</strong><span>${esc(describe(it).meta)}</span></div>
      <button type="button" class="a-del" data-del="${esc(it.id)}" data-col="${collection}" aria-label="Delete">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>
      </button></li>`).join('')}</ul>`;
}

const bilingual = (name, label, area = false) => `
  <div class="a-pair">
    <label>${label} (Bosanski)${area ? `<textarea name="${name}_bs" rows="3" required></textarea>` : `<input name="${name}_bs" required>`}</label>
    <label>${label} (English, optional)${area ? `<textarea name="${name}_en" rows="3"></textarea>` : `<input name="${name}_en">`}</label>
  </div>`;

const VIEWS = {
  announcements: () => `
    <form class="a-form" data-form="announcements">
      <h3>New announcement</h3>
      <p class="a-hint">Shown as a bar at the top of the website.</p>
      ${bilingual('title', 'Title')}
      ${bilingual('text', 'Text')}
      <label>Link (optional)<input type="url" name="link" placeholder="https://"></label>
      <label>Show until (optional)<input type="date" name="until"></label>
      <button type="submit" class="a-btn">Publish announcement</button>
      <p class="form-msg" role="alert"></p>
    </form>
    <h3 class="a-sub">Published</h3>
    ${itemList('announcements', (a) => ({ title: bs(a.title), meta: a.until ? `Until ${a.until}` : 'No end date' }))}`,

  events: () => `
    <form class="a-form" data-form="events">
      <h3>New event</h3>
      <p class="a-hint">Appears in the calendar with add-to-calendar buttons.</p>
      ${bilingual('title', 'Title')}
      <div class="a-row">
        <label>Date<input type="date" name="date" required></label>
        <label>Start (optional)<input type="time" name="start"></label>
        <label>End (optional)<input type="time" name="end"></label>
      </div>
      ${bilingual('desc', 'Description', true)}
      <label>Location (optional)<input name="location" placeholder="950 Grayson Hwy, Lawrenceville, GA 30046"></label>
      <button type="submit" class="a-btn">Add event</button>
      <p class="form-msg" role="alert"></p>
    </form>
    <h3 class="a-sub">Events</h3>
    ${itemList('events', (e) => ({ title: bs(e.title), meta: `${e.date}${e.start ? ' · ' + e.start : ''}` }))}`,

  news: () => `
    <form class="a-form" data-form="news">
      <h3>New news post</h3>
      <p class="a-hint">Shown in the News section.</p>
      ${bilingual('title', 'Title')}
      ${bilingual('body', 'Text', true)}
      <label>Image link (optional)<input type="url" name="image" placeholder="https://"></label>
      <button type="submit" class="a-btn">Publish post</button>
      <p class="form-msg" role="alert"></p>
    </form>
    <h3 class="a-sub">Posts</h3>
    ${itemList('news', (n) => ({ title: bs(n.title), meta: new Date(n.createdAt).toLocaleDateString() }))}`,

  subscribers: () => {
    const subs = lists.subscribers;
    return `<div class="a-form">
      <h3>Stay up to date sign-ups</h3>
      <p class="a-hint">People who agreed to receive emails and texts about events and announcements only.
        Only admins can see this list. Delete someone if they ask to unsubscribe.</p>
      <p class="a-count"><strong>${subs.length}</strong> ${subs.length === 1 ? 'person' : 'people'} signed up</p>
      <button type="button" class="a-btn" id="a-export" ${subs.length ? '' : 'disabled'}>Download list (Excel / CSV)</button>
    </div>
    <h3 class="a-sub">Sign-ups</h3>
    ${subs.length ? `<ul class="a-list">${subs.map((p) => `<li>
      <div><strong>${esc(p.name)}</strong>
        <span><a href="mailto:${esc(p.email)}">${esc(p.email)}</a> · <a href="tel:${esc(p.phone)}">${esc(p.phone)}</a></span>
        <span>${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}${p.lang === 'en' ? ' · English' : ''}</span></div>
      <button type="button" class="a-del" data-del="${esc(p.id)}" data-col="subscribers" aria-label="Delete">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>
      </button></li>`).join('')}</ul>` : '<p class="a-empty">Nobody has signed up yet.</p>'}`;
  },

  admins: () => `
    <form class="a-form" data-form="admins">
      <h3>Add admin login</h3>
      <p class="a-hint">Passwords are stored securely hashed by Firebase. Nobody, including you, can read them.</p>
      <label>Name<input name="name" required></label>
      <label>Email<input type="email" name="email" required autocomplete="off"></label>
      <label>Password (min. 8 characters)<input type="password" name="password" minlength="8" required autocomplete="new-password"></label>
      <label>Repeat password<input type="password" name="password2" minlength="8" required autocomplete="new-password"></label>
      <button type="submit" class="a-btn">Add admin</button>
      <p class="form-msg" role="alert"></p>
    </form>
    <h3 class="a-sub">Admins</h3>
    ${lists.admins.length ? `<ul class="a-list">${lists.admins.map((a) => `<li>
      <div><strong>${esc(a.name || a.email || a.id)}${a.id === user.uid ? ' <em>(you)</em>' : ''}</strong>
        <span>${esc(a.email || '')}${a.addedBy ? ' · added by ' + esc(a.addedBy) : ''}</span></div>
      ${a.id === user.uid ? '' : `<button type="button" class="a-del" data-del="${esc(a.id)}" data-col="admins" aria-label="Remove admin">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg></button>`}
    </li>`).join('')}</ul>` : '<p class="a-empty">Loading…</p>'}`,

  account: () => `
    <form class="a-form" data-form="password">
      <h3>Change my password</h3>
      <label>Current password<input type="password" name="current" required autocomplete="current-password"></label>
      <label>New password (min. 8 characters)<input type="password" name="password" minlength="8" required autocomplete="new-password"></label>
      <label>Repeat new password<input type="password" name="password2" minlength="8" required autocomplete="new-password"></label>
      <button type="submit" class="a-btn">Change password</button>
      <p class="form-msg" role="alert"></p>
    </form>
    <button type="button" class="a-btn a-btn-ghost" id="a-logout">Log out</button>`,
};

const ACTIONS = {
  announcements: (f) => backend.add('announcements', { title: pair(f, 'title'), text: pair(f, 'text'), link: val(f, 'link'), until: val(f, 'until') }),
  events: (f) => backend.add('events', {
    title: pair(f, 'title'), desc: pair(f, 'desc'), date: val(f, 'date'),
    start: val(f, 'start'), end: val(f, 'end'), location: val(f, 'location'),
  }),
  news: (f) => backend.add('news', { title: pair(f, 'title'), body: pair(f, 'body'), image: val(f, 'image') }),
  admins: (f) => {
    if (f.elements.password.value !== f.elements.password2.value) throw new Error('Passwords do not match.');
    return backend.addAdmin(val(f, 'name'), val(f, 'email'), f.elements.password.value);
  },
  password: (f) => {
    if (f.elements.password.value !== f.elements.password2.value) throw new Error('Passwords do not match.');
    return backend.changePassword(f.elements.current.value, f.elements.password.value).catch((err) => {
      if (['auth/invalid-credential', 'auth/wrong-password', 'auth/invalid-login-credentials'].includes(err.code)) throw new Error('Current password is wrong.');
      throw err;
    });
  },
};

const OK = { announcements: 'Announcement published.', events: 'Event added.', news: 'Post published.', admins: 'Admin added.', password: 'Password changed.' };

// Keep what the admin is typing when lists refresh
function renderTab() {
  const host = body.querySelector('#admin-tab');
  if (!host) return;
  const form = host.querySelector('.a-form');
  const saved = form && form.dataset.form === (tab === 'account' ? 'password' : tab)
    ? Object.fromEntries([...form.elements].filter((el) => el.name).map((el) => [el.name, el.value]))
    : null;
  const msg = form && form.querySelector('.form-msg');
  const savedMsg = msg ? [msg.textContent, msg.className] : null;

  host.innerHTML = VIEWS[tab]();

  const newForm = host.querySelector('.a-form');
  if (saved && newForm) {
    Object.entries(saved).forEach(([k, v]) => { if (newForm.elements[k]) newForm.elements[k].value = v; });
    if (savedMsg) { const m = newForm.querySelector('.form-msg'); m.textContent = savedMsg[0]; m.className = savedMsg[1]; }
  }
}

body.addEventListener('submit', (e) => {
  const form = e.target.closest('[data-form]');
  if (!form) return;
  e.preventDefault();
  const kind = form.dataset.form;
  submit(form, async () => ACTIONS[kind](form), OK[kind]);
});

body.addEventListener('click', async (e) => {
  if (e.target.closest('#a-logout')) { backend.logout(); return; }
  if (e.target.closest('#a-export')) { exportSubscribers(); return; }
  const del = e.target.closest('[data-del]');
  if (!del) return;
  const col = del.dataset.col;
  const question = col === 'admins' ? 'Remove this admin? They will no longer be able to log in to the panel.' : 'Delete this item? This cannot be undone.';
  if (!confirm(question)) return;
  del.disabled = true;
  try {
    if (col === 'admins') await backend.removeAdmin(del.dataset.del);
    else await backend.remove(col, del.dataset.del);
  } catch (err) {
    alert(friendlyError(err));
    del.disabled = false;
  }
});

// Excel-friendly CSV of the sign-up list
function exportSubscribers() {
  // Prefix cells that start with = + - @ so spreadsheets never run them as formulas
  const cell = (v) => {
    let t = String(v ?? '');
    if (/^[=+\-@\t\r]/.test(t)) t = "'" + t;
    return '"' + t.replace(/"/g, '""') + '"';
  };
  const rows = [['Name', 'Email', 'Phone', 'Language', 'Signed up', 'Consent']]
    .concat(lists.subscribers.map((p) => [
      p.name, p.email, p.phone, p.lang === 'en' ? 'English' : 'Bosanski',
      p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : '', p.consent ? 'Yes' : 'No',
    ]));
  const csv = '\uFEFF' + rows.map((r) => r.map(cell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `omladina-zbga-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
