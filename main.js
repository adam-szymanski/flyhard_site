/* FlyHard — site interactions
   Vanilla JS, zero dependencies. */

(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Nav: solidify on scroll ---------- */
  const nav = document.querySelector('.nav');
  const onScrollNav = () => {
    if (window.scrollY > 24) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { onScrollNav(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  onScrollNav();

  /* ---------- Mobile menu ---------- */
  const burger = document.querySelector('.nav__burger');
  const navLinks = document.querySelector('.nav__links');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    navLinks.addEventListener('click', e => {
      if (e.target.tagName === 'A') navLinks.classList.remove('is-open');
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Hero parallax ---------- */
  const heroImg = document.querySelector('.hero__img');
  const hero = document.querySelector('.hero');
  if (heroImg && hero && !prefersReduced) {
    let heroTicking = false;
    const update = () => {
      const rect = hero.getBoundingClientRect();
      const h = rect.height;
      if (rect.bottom < 0 || rect.top > window.innerHeight) { heroTicking = false; return; }
      const offset = -rect.top * 0.18;
      heroImg.style.transform = `translate3d(0, ${offset}px, 0) scale(1.14)`;
      heroTicking = false;
    };
    window.addEventListener('scroll', () => {
      if (!heroTicking) { requestAnimationFrame(update); heroTicking = true; }
    }, { passive: true });
  }

  /* ---------- Stat counters ---------- */
  const parseTarget = (raw) => {
    // Extract first number from strings like "2-4", "130", "90"
    const match = raw.match(/\d+(?:\.\d+)?/);
    return match ? parseFloat(match[0]) : null;
  };

  const animateCounter = (el) => {
    const raw = el.getAttribute('data-value') || el.textContent;
    const target = parseTarget(raw);
    if (target == null) return;
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const isRange = raw.includes('-');
    const rangeEnd = isRange ? parseFloat(raw.split('-')[1]) : null;
    const duration = 1400;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const val = target * ease(t);
      const rounded = target >= 10 ? Math.round(val) : val.toFixed(1);
      if (isRange && t === 1) {
        el.textContent = `${prefix}${target}-${rangeEnd}${suffix}`;
      } else {
        el.textContent = `${prefix}${rounded}${suffix}`;
      }
      if (t < 1) requestAnimationFrame(tick);
    };

    if (prefersReduced) {
      el.textContent = `${prefix}${raw}${suffix}`;
    } else {
      requestAnimationFrame(tick);
    }
  };

  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(el => cio.observe(el));
  }

  /* ---------- Smooth anchor scroll with nav offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navH = nav ? nav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Cursor-follow aqua dot on feature images (desktop only) ---------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReduced) {
    document.querySelectorAll('.feature__media').forEach(media => {
      const dot = document.createElement('span');
      dot.className = 'feature__media-dot';
      dot.style.cssText = `
        position: absolute; width: 12px; height: 12px; border-radius: 50%;
        background: var(--fh-aqua); pointer-events: none; opacity: 0;
        transform: translate(-50%, -50%); transition: opacity 200ms var(--fh-ease);
        box-shadow: 0 0 0 6px rgba(31,184,173,0.24); z-index: 2;
      `;
      media.appendChild(dot);
      media.addEventListener('mouseenter', () => { dot.style.opacity = '1'; });
      media.addEventListener('mouseleave', () => { dot.style.opacity = '0'; });
      media.addEventListener('mousemove', (e) => {
        const r = media.getBoundingClientRect();
        dot.style.left = (e.clientX - r.left) + 'px';
        dot.style.top  = (e.clientY - r.top) + 'px';
      });
    });
  }

  /* ---------- Current year in footer ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
