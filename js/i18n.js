/*
  Bosnian / English translations.
  Bosnian text lives in index.html (data-i18n="key"); English is below.
  Strings used only by scripts (calendar etc.) have both languages here.
*/
const I18N = (() => {
  const en = {
    'skip': 'Skip to content',
    'nav.activities': 'Activities',
    'nav.events': 'Events',
    'nav.news': 'News',
    'nav.about': 'About',
    'nav.board': 'Board',
    'nav.contact': 'Contact',
    'hero.title': 'ZBGA Youth',
    'hero.text': 'Community of Bosniaks Georgia - Youth serving faith, knowledge and community.',
    'hero.join': 'Join us',
    'hero.events': 'Calendar',
    'hero.board': 'Our board',
    'act.title': 'Activities',
    'act.sub': 'Programs for the youth of our community',
    'act.lectures': 'Lectures',
    'act.lectures.text': 'Weekly lectures and study circles for youth on faith and everyday life.',
    'act.sport': 'Sports',
    'act.sport.text': 'Soccer, basketball and other sports for all ages.',
    'act.social': 'Socials',
    'act.social.text': 'Iftars, trips and social nights that bring our youth together.',
    'act.charity': 'Charity work',
    'act.charity.text': 'Volunteering and charity drives to help those in need.',
    'ev.title': 'Events',
    'ev.sub': 'See what is coming up and add events to your calendar',
    'news.title': 'News',
    'news.sub': 'The latest from ZBGA Youth',
    'news.soon': 'News coming soon',
    'news.soon.text': 'News, photos and announcements will be posted here soon. Check back!',
    'about.title': 'About us',
    'about.text': 'ZBGA Youth brings together young Bosniaks from Atlanta and the surrounding area. Through lectures, sports, socials and charity work we are building a strong, connected generation that keeps its identity, faith and tradition. All young people are welcome.',
    'board.title': 'Meet our board',
    'board.sub': 'The young people leading ZBGA Youth',
    'role.president.f': 'President',
    'role.vice.f': 'Vice President',
    'role.secretary.f': 'Secretary',
    'role.treasurer.f': 'Treasurer',
    'role.organizer.f': 'Organizer',
    'role.organizer.m': 'Organizer',
    'contact.title': 'Contact',
    'contact.sub': 'Visit us or get in touch',
    'contact.address': 'Address',
    'contact.phone': 'Phone',
    'contact.web': 'Community',
    'footer.youth': 'Youth',
    'cal.today': 'Today',
    'cal.addAll': 'Add all events to your calendar',
    'sub.button': 'Stay up to date',
    'sub.title': 'Stay up to date',
    'sub.intro': 'Get notified about ZBGA Youth events and announcements.',
    'sub.name': 'Full name',
    'sub.email': 'Email',
    'sub.phone': 'Phone number',
    'sub.consent': 'I agree that ZBGA Youth may contact me by email and text message only about events and announcements. My information will not be used for anything else or shared with anyone. I can unsubscribe at any time.',
    'sub.submit': 'Sign up',
    'sub.fine': 'Message and data rates may apply. Reply STOP or contact us to unsubscribe.',
    'sub.done.title': 'Thank you!',
    'sub.done.text': 'You are signed up. We will let you know about the next event.',
    'sub.done.close': 'Close',
  };

  // Strings that only exist in scripts
  const scriptStrings = {
    bs: {
      'lang.switch': 'English',
      'menu': 'Meni',
      'top': 'Na vrh',
      'cal.prev': 'Prethodni mjesec',
      'cal.next': 'Sljedeći mjesec',
      'cal.upcoming': 'Nadolazeći događaji',
      'cal.on': 'Događaji',
      'cal.none.day': 'Nema događaja ovog dana.',
      'cal.soon': 'Događaji uskoro',
      'cal.soon.text': 'Uskoro objavljujemo prve događaje Omladine. Navratite ponovo!',
      'cal.allDay': 'Cijeli dan',
      'cal.google': 'Google kalendar',
      'cal.ics': 'Apple / Outlook',
      'cal.showUpcoming': 'Prikaži sve nadolazeće',
      'ann.more': 'Više',
      'ann.close': 'Zatvori obavijest',
      'close': 'Zatvori',
      'sub.err.name': 'Upišite ime i prezime.',
      'sub.err.email': 'Upišite ispravnu email adresu.',
      'sub.err.phone': 'Upišite ispravan broj telefona.',
      'sub.err.consent': 'Potrebna je vaša saglasnost da bismo vas mogli kontaktirati.',
      'sub.err.exists': 'Ova email adresa je već prijavljena.',
      'sub.err.offline': 'Prijava trenutno nije dostupna. Pokušajte kasnije.',
      'sub.err.generic': 'Nešto nije u redu. Pokušajte ponovo.',
      'sub.sending': 'Šaljem…',
      months: ['januar', 'februar', 'mart', 'april', 'maj', 'juni', 'juli', 'august', 'septembar', 'oktobar', 'novembar', 'decembar'],
      monthsShort: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
      weekdays: ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'],
      weekStart: 1,
    },
    en: {
      'lang.switch': 'Bosanski',
      'menu': 'Menu',
      'top': 'Back to top',
      'cal.prev': 'Previous month',
      'cal.next': 'Next month',
      'cal.upcoming': 'Upcoming events',
      'cal.on': 'Events',
      'cal.none.day': 'No events on this day.',
      'cal.soon': 'Events coming soon',
      'cal.soon.text': 'Our first youth events will be announced soon. Check back!',
      'cal.allDay': 'All day',
      'cal.google': 'Google Calendar',
      'cal.ics': 'Apple / Outlook',
      'cal.showUpcoming': 'Show all upcoming',
      'ann.more': 'More',
      'ann.close': 'Close announcement',
      'close': 'Close',
      'sub.err.name': 'Please enter your full name.',
      'sub.err.email': 'Please enter a valid email address.',
      'sub.err.phone': 'Please enter a valid phone number.',
      'sub.err.consent': 'We need your consent before we can contact you.',
      'sub.err.exists': 'This email address is already signed up.',
      'sub.err.offline': 'Sign-up is not available right now. Please try again later.',
      'sub.err.generic': 'Something went wrong. Please try again.',
      'sub.sending': 'Sending…',
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      weekStart: 0,
    },
  };

  // aria-label translations for icon-only buttons
  const ariaTargets = { '.sub-close': 'close', '#cal-prev': 'cal.prev', '#cal-next': 'cal.next', '.to-top': 'top', '.nav-toggle': 'menu' };

  const bs = {};
  const nodes = document.querySelectorAll('[data-i18n]');
  nodes.forEach((el) => { bs[el.dataset.i18n] = el.textContent; });
  const bsTitle = document.title;

  let lang = 'bs';
  try { if (localStorage.getItem('lang') === 'en') lang = 'en'; } catch (e) { /* storage unavailable */ }

  function t(key) {
    return scriptStrings[lang][key] ?? (lang === 'en' ? en[key] : bs[key]) ?? key;
  }

  function apply() {
    document.documentElement.lang = lang;
    document.title = lang === 'en' ? 'Youth – Community of Bosniaks Georgia' : bsTitle;
    nodes.forEach((el) => {
      const key = el.dataset.i18n;
      el.textContent = lang === 'en' ? (en[key] ?? bs[key]) : bs[key];
    });
    document.querySelectorAll('.lang-label').forEach((el) => { el.textContent = t('lang.switch'); });
    Object.entries(ariaTargets).forEach(([sel, key]) => {
      document.querySelectorAll(sel).forEach((el) => el.setAttribute('aria-label', t(key)));
    });
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  }

  function toggle() {
    lang = lang === 'bs' ? 'en' : 'bs';
    try { localStorage.setItem('lang', lang); } catch (e) { /* storage unavailable */ }
    apply();
  }

  document.querySelectorAll('.lang-toggle').forEach((btn) => btn.addEventListener('click', toggle));

  return { t, apply, get lang() { return lang; } };
})();
