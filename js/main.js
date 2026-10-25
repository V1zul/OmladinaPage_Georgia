// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Apply saved language (Bosnian by default)
I18N.apply();

// Sticky navbar + back-to-top appear once the hero is scrolled past
const navbar = document.querySelector('.navbar');
const toTop = document.querySelector('.to-top');
const hero = document.querySelector('.hero');

new IntersectionObserver(([entry]) => {
  const past = !entry.isIntersecting;
  navbar.classList.toggle('visible', past);
  toTop.classList.toggle('visible', past);
}, { rootMargin: '-80px 0px 0px 0px' }).observe(hero);

// Mobile menu
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  const open = navbar.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navbar.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
  });
});

// Highlight the menu link of the section in view
const links = navLinks.querySelectorAll('a');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });

document.querySelectorAll('main section[id]').forEach((s) => sectionObserver.observe(s));

// Fade cards in as they scroll into view
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.15 });

reveals.forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 80 + 'ms';
  revealObserver.observe(el);
});
