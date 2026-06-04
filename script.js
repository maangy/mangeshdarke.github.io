/* ── Cursor spotlight glow ───────────────────────────────────── */
document.addEventListener('mousemove', e => {
  document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
  document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
});

/* ── Active nav on scroll ────────────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-item[data-section]');

const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute('id');
      navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.section === id);
      });
    });
  },
  { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
);

sections.forEach(s => sectionObserver.observe(s));

/* ── Scroll reveal ───────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach((entry, _, all) => {
      if (!entry.isIntersecting) return;

      // Stagger cards in the same parent
      const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
      const delay = siblings.indexOf(entry.target) * 80;

      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);

      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Respect prefers-reduced-motion ─────────────────────────── */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.reveal').forEach(el => {
    el.style.transition = 'none';
    el.classList.add('visible');
  });
}
