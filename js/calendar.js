// Interactive events calendar + add-to-calendar links (events come from js/events.js)
(() => {
  const TZ = 'America/New_York';
  const DEFAULT_LOCATION = '950 Grayson Hwy, Lawrenceville, GA 30046';

  const grid = document.getElementById('cal-grid');
  const monthLabel = document.getElementById('cal-month');
  const weekdaysRow = document.getElementById('cal-weekdays');
  const agendaTitle = document.getElementById('agenda-title');
  const agendaList = document.getElementById('agenda-list');
  const downloadAll = document.getElementById('cal-download-all');

  const pad = (n) => String(n).padStart(2, '0');
  const keyOf = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
  const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return { y, m: m - 1, d }; };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const text = (field) => (field && typeof field === 'object' ? field[I18N.lang] || field.bs || field.en : field) || '';

  const events = (typeof EVENTS !== 'undefined' ? EVENTS : [])
    .filter((e) => e && e.date)
    .sort((a, b) => (a.date + (a.start || '')).localeCompare(b.date + (b.start || '')));

  const byDate = {};
  events.forEach((e) => { (byDate[e.date] = byDate[e.date] || []).push(e); });

  const now = new Date();
  const todayKey = keyOf(now.getFullYear(), now.getMonth(), now.getDate());
  let viewY = now.getFullYear();
  let viewM = now.getMonth();
  let selected = null;

  // ---------- Formatting ----------
  function formatTime(hhmm) {
    if (I18N.lang === 'bs') return hhmm;
    let [h, m] = hhmm.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${pad(m)} ${ampm}`;
  }

  function timeRange(e) {
    if (!e.start) return I18N.t('cal.allDay');
    return e.end ? `${formatTime(e.start)} – ${formatTime(e.end)}` : formatTime(e.start);
  }

  function longDate(key) {
    const { y, m, d } = parse(key);
    const months = I18N.t('months');
    return I18N.lang === 'en' ? `${months[m]} ${d}, ${y}` : `${d}. ${months[m]} ${y}.`;
  }

  // ---------- Add-to-calendar ----------
  function stamp(key, hhmm) {
    return key.replace(/-/g, '') + (hhmm ? 'T' + hhmm.replace(':', '') + '00' : '');
  }

  function nextDay(key) {
    const { y, m, d } = parse(key);
    const n = new Date(y, m, d + 1);
    return keyOf(n.getFullYear(), n.getMonth(), n.getDate());
  }

  function endTime(e) {
    if (e.end) return e.end;
    const [h, m] = e.start.split(':').map(Number);
    return `${pad(Math.min(h + 1, 23))}:${pad(m)}`;
  }

  function googleUrl(e) {
    const dates = e.start
      ? `${stamp(e.date, e.start)}/${stamp(e.date, endTime(e))}`
      : `${stamp(e.date)}/${stamp(nextDay(e.date))}`;
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: text(e.title),
      dates,
      details: text(e.desc),
      location: e.location || DEFAULT_LOCATION,
      ctz: TZ,
    });
    return 'https://calendar.google.com/calendar/render?' + params.toString();
  }

  const icsEscape = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

  function fold(line) {
    const out = [];
    while (line.length > 73) { out.push(line.slice(0, 73)); line = ' ' + line.slice(73); }
    out.push(line);
    return out.join('\r\n');
  }

  function vevent(e) {
    const slug = text(e.title).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const dtstamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const lines = [
      'BEGIN:VEVENT',
      `UID:${e.date}-${slug}@omladina.zbga.org`,
      `DTSTAMP:${dtstamp}`,
    ];
    if (e.start) {
      lines.push(`DTSTART;TZID=${TZ}:${stamp(e.date, e.start)}`, `DTEND;TZID=${TZ}:${stamp(e.date, endTime(e))}`);
    } else {
      lines.push(`DTSTART;VALUE=DATE:${stamp(e.date)}`, `DTEND;VALUE=DATE:${stamp(nextDay(e.date))}`);
    }
    lines.push(`SUMMARY:${icsEscape(text(e.title))}`, `LOCATION:${icsEscape(e.location || DEFAULT_LOCATION)}`);
    if (text(e.desc)) lines.push(`DESCRIPTION:${icsEscape(text(e.desc))}`);
    lines.push('END:VEVENT');
    return lines;
  }

  const VTIMEZONE = [
    'BEGIN:VTIMEZONE', `TZID:${TZ}`,
    'BEGIN:DAYLIGHT', 'TZOFFSETFROM:-0500', 'TZOFFSETTO:-0400', 'TZNAME:EDT', 'DTSTART:19700308T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU', 'END:DAYLIGHT',
    'BEGIN:STANDARD', 'TZOFFSETFROM:-0400', 'TZOFFSETTO:-0500', 'TZNAME:EST', 'DTSTART:19701101T020000', 'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU', 'END:STANDARD',
    'END:VTIMEZONE',
  ];

  function downloadIcs(list, filename) {
    const lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Omladina ZBGA//Events//BS', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'X-WR-CALNAME:Omladina ZBGA', `X-WR-TIMEZONE:${TZ}`,
      ...VTIMEZONE,
      ...list.flatMap(vevent),
      'END:VCALENDAR',
    ];
    const blob = new Blob([lines.map(fold).join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ---------- Rendering ----------
  function renderWeekdays() {
    const names = I18N.t('weekdays');
    weekdaysRow.innerHTML = names.map((n) => `<span>${n}</span>`).join('');
  }

  function renderGrid() {
    const months = I18N.t('months');
    monthLabel.textContent = `${months[viewM]} ${viewY}`;

    const first = new Date(viewY, viewM, 1).getDay();
    const weekStart = I18N.t('weekStart');
    const blanks = (first - weekStart + 7) % 7;
    const days = new Date(viewY, viewM + 1, 0).getDate();

    let html = '';
    for (let i = 0; i < blanks; i++) html += '<span class="cal-day empty"></span>';
    for (let d = 1; d <= days; d++) {
      const key = keyOf(viewY, viewM, d);
      const has = byDate[key];
      const cls = ['cal-day'];
      if (key === todayKey) cls.push('today');
      if (key < todayKey) cls.push('past');
      if (has) cls.push('has-event');
      if (key === selected) cls.push('selected');
      const label = has ? `${longDate(key)} – ${has.map((e) => text(e.title)).join(', ')}` : longDate(key);
      html += `<button type="button" class="${cls.join(' ')}" data-date="${key}" aria-label="${esc(label)}"${key === selected ? ' aria-pressed="true"' : ''}>
        <span class="num">${d}</span>${has ? '<span class="dot" aria-hidden="true"></span>' : ''}</button>`;
    }
    grid.innerHTML = html;
  }

  function eventCard(e, i) {
    const { m, d } = parse(e.date);
    const loc = e.location || DEFAULT_LOCATION;
    return `<article class="event">
      <div class="event-date"><span class="event-day">${d}</span><span class="event-month">${I18N.t('monthsShort')[m]}</span></div>
      <div class="event-body">
        <h4>${esc(text(e.title))}</h4>
        <p class="event-meta">${esc(longDate(e.date))} · ${esc(timeRange(e))}</p>
        <p class="event-meta">${esc(loc)}</p>
        ${text(e.desc) ? `<p class="event-desc">${esc(text(e.desc))}</p>` : ''}
        <div class="event-actions">
          <a class="chip" href="${esc(googleUrl(e))}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/></svg>${I18N.t('cal.google')}</a>
          <button type="button" class="chip" data-ics="${i}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>${I18N.t('cal.ics')}</button>
        </div>
      </div>
    </article>`;
  }

  function comingSoon() {
    return `<div class="agenda-empty">
      <span class="coming-star" aria-hidden="true"></span>
      <h4>${I18N.t('cal.soon')}</h4>
      <p>${I18N.t('cal.soon.text')}</p>
    </div>`;
  }

  let shown = [];

  function renderAgenda() {
    const upcoming = events.filter((e) => e.date >= todayKey);

    if (selected) {
      shown = byDate[selected] || [];
      agendaTitle.textContent = longDate(selected);
      agendaList.innerHTML = (shown.length ? shown.map(eventCard).join('') : `<p class="agenda-none">${I18N.t('cal.none.day')}</p>`)
        + `<button type="button" class="link-btn" id="agenda-back">${I18N.t('cal.showUpcoming')}</button>`;
    } else {
      shown = upcoming.slice(0, 6);
      agendaTitle.textContent = I18N.t('cal.upcoming');
      agendaList.innerHTML = shown.length ? shown.map(eventCard).join('') : comingSoon();
    }
    downloadAll.hidden = upcoming.length === 0;
  }

  function render() {
    renderWeekdays();
    renderGrid();
    renderAgenda();
  }

  // ---------- Interaction ----------
  function shiftMonth(delta) {
    const d = new Date(viewY, viewM + delta, 1);
    viewY = d.getFullYear();
    viewM = d.getMonth();
    renderGrid();
  }

  document.getElementById('cal-prev').addEventListener('click', () => shiftMonth(-1));
  document.getElementById('cal-next').addEventListener('click', () => shiftMonth(1));
  document.getElementById('cal-today').addEventListener('click', () => {
    viewY = now.getFullYear();
    viewM = now.getMonth();
    selected = null;
    render();
  });

  grid.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.cal-day[data-date]');
    if (!btn) return;
    selected = btn.dataset.date === selected ? null : btn.dataset.date;
    renderGrid();
    renderAgenda();
  });

  agendaList.addEventListener('click', (ev) => {
    if (ev.target.closest('#agenda-back')) {
      selected = null;
      renderGrid();
      renderAgenda();
      return;
    }
    const ics = ev.target.closest('[data-ics]');
    if (ics) {
      const e = shown[Number(ics.dataset.ics)];
      downloadIcs([e], `omladina-zbga-${e.date}.ics`);
    }
  });

  downloadAll.addEventListener('click', () => {
    downloadIcs(events.filter((e) => e.date >= todayKey), 'omladina-zbga-dogadjaji.ics');
  });

  document.addEventListener('langchange', render);
  render();
})();
