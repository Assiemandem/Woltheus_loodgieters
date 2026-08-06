/* ============================================================
   MAIN.JS – Woltheus Loodgieters
   ============================================================ */
'use strict';

/* ── Year ─────────────────────────────────────────────────── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── Refs ─────────────────────────────────────────────────── */
const header        = document.getElementById('site-header');
const heroShrinkBox = document.getElementById('hero-shrink-box');

/* ── Unified scroll handler ───────────────────────────────── */
let lastScrollY   = window.scrollY;
let scrollTicking = false;

function updateNavOnScroll(currentY) {
  if (!header) return;

  if (currentY < 60) {
    /* At the very top – fully transparent, no transform */
    header.classList.remove('header--hidden', 'header--light');
  } else if (currentY > lastScrollY + 4) {
    /* Scrolling DOWN → slide header off screen */
    header.classList.add('header--hidden');
    header.classList.remove('header--light');
  } else if (currentY < lastScrollY - 4) {
    /* Scrolling UP → show header with white background */
    header.classList.remove('header--hidden');
    header.classList.add('header--light');
  }
}

function updateHeroShrink(currentY) {
  if (!heroShrinkBox) return;
  if (window.innerWidth <= 640) return;

  const maxPad    = 80;   // px – same as --header-height nav bar
  const shrinkOver = 150; // scroll distance to complete the effect

  const progress = Math.max(0, Math.min(currentY / shrinkOver, 1));
  const pad      = Math.round(progress * maxPad);
  const radius   = Math.round(progress * 16); // grows to 16px

  /* Set all four sides at once – video + text + arrow shrink together */
  heroShrinkBox.style.inset        = `${pad}px`;
  heroShrinkBox.style.borderRadius = `${radius}px`;
}

function onScroll() {
  const currentY = window.scrollY;
  updateNavOnScroll(currentY);
  updateHeroShrink(currentY);
  lastScrollY   = currentY;
  scrollTicking = false;
}

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(onScroll);
    scrollTicking = true;
  }
}, { passive: true });

/* Run once on load so initial state is correct */
onScroll();

/* ── Mobile hamburger ─────────────────────────────────────── */
const hamburger = document.getElementById('hamburger-btn');
const mainNav   = document.getElementById('main-nav');

if (hamburger && mainNav) {
  hamburger.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mainNav.classList.contains('open')) {
      mainNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      hamburger.focus();
    }
  });
}

/* ── Scroll-reveal (Intersection Observer) ────────────────── */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReduced) {
  const revealTargets = [
    '.service-card',
    '.cert-card',
    '.about-text',
    '.about-usp-list li',
    '.section-header',
    '.contact-info > *',
    '.contact-form-wrap',
    '.trust-item',
  ];

  document.querySelectorAll(revealTargets.join(',')).forEach(el => {
    el.classList.add('reveal');
    const siblings = el.parentElement
      ? el.parentElement.querySelectorAll('.reveal')
      : [];
    const idx = Array.from(siblings).indexOf(el);
    if (idx > 0 && idx <= 5) el.classList.add(`reveal-delay-${idx}`);
  });

  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

/* ── Active nav highlight on scroll ──────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.header-nav a[href^="#"]');

if (sections.length && navLinks.length) {
  const sectionObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.removeAttribute('aria-current');
            if (link.getAttribute('href') === `#${id}`) {
              link.setAttribute('aria-current', 'page');
            }
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(s => sectionObserver.observe(s));
}

/* ── Contact form ─────────────────────────────────────────── */
const contactForm = document.getElementById('contact-form');
const submitBtn   = document.getElementById('submit-btn');

if (contactForm && submitBtn) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!contactForm.checkValidity()) { contactForm.reportValidity(); return; }

    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           style="animation:spin .8s linear infinite">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      Verzenden…`;

    if (!document.getElementById('spin-style')) {
      const s = document.createElement('style');
      s.id = 'spin-style';
      s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
      document.head.appendChild(s);
    }

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Verstuurd! We nemen snel contact op.`;
      submitBtn.style.backgroundColor = 'hsl(150, 60%, 40%)';
      contactForm.reset();

      setTimeout(() => {
        submitBtn.innerHTML = originalHTML;
        submitBtn.style.backgroundColor = '';
      }, 5000);
    }, 1200);
  });
}
