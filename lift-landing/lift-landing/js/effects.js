/**
 * FX "experience": reveal on scroll, parallax, kinetic text, cursor glow, magnetic hover.
 * Respeta prefers-reduced-motion.
 */
(function () {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rafThrottle(fn) {
    let scheduled = false;
    let lastArgs = null;
    return function (...args) {
      lastArgs = args;
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        fn(...lastArgs);
      });
    };
  }

  function ensureCursorGlow() {
    if (prefersReducedMotion) return;
    if (document.querySelector('.cursor-glow')) return;
    const el = document.createElement('div');
    el.className = 'cursor-glow';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);

    const move = rafThrottle((e) => {
      el.style.left = e.clientX + 'px';
      el.style.top = e.clientY + 'px';
    });
    window.addEventListener('pointermove', move, { passive: true });
  }

  function setupReveal() {
    const revealEls = Array.from(document.querySelectorAll('.section .container, .hero-content, .cards, .verse-of-day-wrap, .verse-actions, .verse-grid, .contact-form'));
    revealEls.forEach((el) => el.classList.add('reveal'));

    if (prefersReducedMotion) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        }
      },
      { root: null, threshold: 0.15 }
    );

    revealEls.forEach((el) => io.observe(el));
  }

  function splitKineticText(target) {
    const text = target.textContent || '';
    target.textContent = '';
    target.classList.add('kinetic-text');
    const frag = document.createDocumentFragment();
    let delay = 0;
    for (const ch of text) {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.style.setProperty('--d', `${delay}ms`);
      delay += 28;
      frag.appendChild(span);
    }
    target.appendChild(frag);
  }

  function setupKineticHero() {
    const h1 = document.querySelector('.hero-content h1');
    if (!h1) return;
    if (h1.querySelector('.char')) return;

    splitKineticText(h1);

    if (prefersReducedMotion) {
      h1.classList.add('is-visible');
      return;
    }

    // marca visible apenas cargue
    requestAnimationFrame(() => h1.classList.add('is-visible'));
  }

  function setupMagnetic() {
    if (prefersReducedMotion) return;
    const candidates = Array.from(document.querySelectorAll('.btn, .card, .verse-card-3d'));
    candidates.forEach((el) => el.classList.add('magnetic'));

    const onMove = (el, e) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      const max = 10;
      const x = Math.max(-max, Math.min(max, dx / 12));
      const y = Math.max(-max, Math.min(max, dy / 12));
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    candidates.forEach((el) => {
      const move = rafThrottle((e) => onMove(el, e));
      el.addEventListener('pointermove', move, { passive: true });
      el.addEventListener('pointerleave', () => {
        el.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  }

  function setupParallax() {
    if (prefersReducedMotion) return;

    // parallax suave en hero content + contenedores de secciones
    const parallaxEls = [
      ...Array.from(document.querySelectorAll('.hero-content')),
      ...Array.from(document.querySelectorAll('.section .container')),
    ];

    parallaxEls.forEach((el) => el.classList.add('parallax'));

    const update = rafThrottle(() => {
      const vh = Math.max(1, window.innerHeight);
      for (const el of parallaxEls) {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const t = (center - vh / 2) / (vh / 2); // -1..1 aprox
        const amp = el.classList.contains('hero-content') ? 14 : 10;
        const y = Math.max(-amp, Math.min(amp, -t * amp));
        el.style.setProperty('--py', `${y}px`);
      }
    });

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
  }

  function init() {
    ensureCursorGlow();
    setupKineticHero();
    setupReveal();
    setupMagnetic();
    setupParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

