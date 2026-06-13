const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ░░ IDEA 3: Boot handshake ░░ */
(function () {
  const boot = document.getElementById('boot');
  if (!boot) return;

  if (reduceMotion) { boot.classList.add('done'); return; }

  const lines = boot.querySelectorAll('.bl');
  lines.forEach((line, i) => {
    setTimeout(() => line.classList.add('show'), 250 + i * 320);
  });
  setTimeout(() => boot.classList.add('done'), 250 + lines.length * 320 + 600);
})();

/* ░░ IDEA 1: Packet-journey rail ░░ */
(function () {
  const fill = document.getElementById('railFill');
  const packet = document.getElementById('railPacket');
  const nodes = [...document.querySelectorAll('.rail-node')];
  if (!fill || !packet) return;

  const nodeFracs = nodes.map(n => parseFloat(n.style.top) / 100);
  const BUFFER = 90;
  let targetP = 0;
  let currentP = 0;
  let anchors = [];

  // Build scroll→rail-fraction anchors: each section's node lights up exactly
  // when that section's title reaches the top of the viewport (+buffer).
  function buildAnchors() {
    anchors = [{ y: 0, f: 0 }];
    nodes.forEach((n, i) => {
      if (!n.dataset.section) return;
      const el = document.getElementById(n.dataset.section);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      anchors.push({ y: Math.max(0, top - BUFFER), f: nodeFracs[i] });
    });
    for (let i = 1; i < anchors.length; i++) {
      if (anchors[i].y <= anchors[i - 1].y) anchors[i].y = anchors[i - 1].y + 1;
    }
  }

  function fracFor(scrollY) {
    if (scrollY <= anchors[0].y) return 0;
    for (let i = 1; i < anchors.length; i++) {
      if (scrollY <= anchors[i].y) {
        const a = anchors[i - 1], b = anchors[i];
        const t = (scrollY - a.y) / (b.y - a.y);
        return a.f + (b.f - a.f) * t;
      }
    }
    return 1;
  }

  function computeTarget() {
    targetP = fracFor(window.scrollY);
  }

  const ease = reduceMotion ? 1 : 0.12;
  const origin = document.querySelector('.rail-origin');
  let departed = false;

  function frame() {
    currentP += (targetP - currentP) * ease;
    if (Math.abs(targetP - currentP) < 0.0004) currentP = targetP;

    const pct = currentP * 100;
    fill.style.height = pct + '%';
    packet.style.top = pct + '%';

    nodes.forEach((n, i) => {
      n.classList.toggle('resolved', currentP >= nodeFracs[i] - 0.004);
    });

    // transmit pulse when the packet departs / returns to localhost
    if (origin && !reduceMotion) {
      if (!departed && currentP > 0.02) {
        departed = true;
        origin.classList.remove('transmit');
        void origin.offsetWidth;
        origin.classList.add('transmit');
      } else if (departed && currentP < 0.005) {
        departed = false;
      }
    }

    requestAnimationFrame(frame);
  }

  function refresh() { buildAnchors(); computeTarget(); }

  window.addEventListener('scroll', computeTarget, { passive: true });
  window.addEventListener('resize', refresh);
  window.addEventListener('load', refresh);
  refresh();
  requestAnimationFrame(frame);
})();

/* ░░ IDEA 2: Hop-style heading resolve ░░ */
(function () {
  const headings = document.querySelectorAll('.hop-heading');
  const obs = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('resolved');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  headings.forEach(h => obs.observe(h));
})();

/* ░░ Ping footer: print lines when it scrolls into view ░░ */
(function () {
  const block = document.querySelector('.ping-block');
  if (!block) return;
  const obs = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          block.classList.add('printing');
          obs.unobserve(block);
        }
      });
    },
    { threshold: 0.4 }
  );
  obs.observe(block);
})();

/* ── Scroll reveal ───────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
      const delay = siblings.indexOf(entry.target) * 80;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
);
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Respect prefers-reduced-motion ─────────────────────────── */
if (reduceMotion) {
  document.querySelectorAll('.reveal').forEach(el => {
    el.style.transition = 'none';
    el.classList.add('visible');
  });
  document.querySelectorAll('.hop-heading').forEach(h => h.classList.add('resolved'));
  const pb = document.querySelector('.ping-block');
  if (pb) pb.classList.add('printing');
}
