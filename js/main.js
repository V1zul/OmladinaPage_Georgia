// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Fade cards in as they scroll into view
const reveals = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  reveals.forEach((el, i) => {
    el.style.transitionDelay = (i % 6) * 80 + 'ms';
    observer.observe(el);
  });
} else {
  reveals.forEach((el) => el.classList.add('visible'));
}
