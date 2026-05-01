/* ============================================
   Pascal Roth – Website JavaScript
   Navigation, FAQ, Marquee, Scroll Reveal
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initMobileMenu();
  initFAQ();
  initMarquee();
  initPhasesAccordion();
  initScrollReveal();
  initStickyMobileCTA();
  initContactForm();
  initSmoothScroll();
});

/* --- Sticky Navigation on Scroll --- */
const NAV_LOGO_TOP = 'Fotos/Pascal Roth Logo_blau.png';
const NAV_LOGO_SCROLLED = 'Fotos/Pascal Roth Logo.png';

function setNavBarLogo(scrolled) {
  document.querySelectorAll('.site-logo--nav').forEach((img) => {
    const next = scrolled ? NAV_LOGO_SCROLLED : NAV_LOGO_TOP;
    if (img.getAttribute('src') !== next) {
      img.src = next;
    }
  });
}

function initNavigation() {
  const nav = document.querySelector('.nav-wrapper');
  if (!nav) return;

  let lastScroll = 0;

  function applyScrollState() {
    const currentScroll = window.scrollY;
    const scrolled = currentScroll > 60;

    if (scrolled) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    setNavBarLogo(scrolled);
    lastScroll = currentScroll;
  }

  applyScrollState();

  window.addEventListener('scroll', applyScrollState, { passive: true });
}

/* --- Mobile Menu Toggle --- */
function initMobileMenu() {
  const trigger = document.getElementById('mobile-menu-trigger');
  const menu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');
  const links = menu ? menu.querySelectorAll('a') : [];

  if (!trigger || !menu) return;

  function openMenu() {
    menu.classList.add('open');
    document.body.style.overflow = 'hidden';
    trigger.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    menu.classList.remove('open');
    document.body.style.overflow = '';
    trigger.setAttribute('aria-expanded', 'false');
  }

  trigger.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  links.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      closeMenu();
    }
  });
}

/* --- FAQ Accordion --- */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');

    if (!trigger || !content) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      items.forEach(other => {
        other.classList.remove('open');
        const otherContent = other.querySelector('.faq-content');
        if (otherContent) otherContent.style.maxHeight = '0';
        const otherTrigger = other.querySelector('.faq-trigger');
        if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* --- Testimonial Marquee Clone --- */
function initMarquee() {
  const track = document.querySelector('.marquee-track');
  if (!track) return;

  const cards = track.querySelectorAll('.testimonial-card');
  cards.forEach(card => {
    const clone = card.cloneNode(true);
    track.appendChild(clone);
  });

  let isPaused = false;
  track.addEventListener('mouseenter', () => { isPaused = true; });
  track.addEventListener('mouseleave', () => { isPaused = false; });
  track.addEventListener('touchstart', () => { isPaused = true; }, { passive: true });
  track.addEventListener('touchend', () => {
    setTimeout(() => { isPaused = false; }, 2000);
  });
}

/* --- Lebensphasen-Akkordeon (Lamellen) ---
   - Mobile (<900px): vertikales Akkordeon, Tap auf Lamelle öffnet/schließt.
   - Desktop (>=900px): horizontales Akkordeon. Hover öffnet temporär,
     Klick fixiert die aktive Lamelle. Erste Lamelle ist Default-aktiv.
   - Tab-Fokus aktiviert die fokussierte Lamelle (Tastatur-Bedienung).
   - Klick auf bereits aktive Lamelle navigiert zur Detail-Seite,
     Klick auf inaktive aktiviert sie zuerst (verhindert versehentliches
     Verlassen der Seite, bevor man die Story gesehen hat).
*/
function initPhasesAccordion() {
  const accordion = document.querySelector('[data-phases-accordion]');
  if (!accordion) return;

  const lamellas = accordion.querySelectorAll('.phase-lamella');
  if (lamellas.length === 0) return;

  const desktopMQ = window.matchMedia('(min-width: 900px)');

  function activate(target) {
    lamellas.forEach((l) => {
      const active = l === target;
      l.classList.toggle('is-active', active);
      l.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  lamellas.forEach((lamella) => {
    /* Klick-Verhalten:
       - Desktop (>=900 px): Hover hat die Story schon gezeigt -> direkt navigieren.
       - Mobile/Touch: erst aktivieren (Story einblenden),
         beim zweiten Tap auf die bereits aktive Lamelle navigieren. */
    lamella.addEventListener('click', (e) => {
      if (desktopMQ.matches) return;

      if (!lamella.classList.contains('is-active')) {
        e.preventDefault();
        activate(lamella);
      }
    });

    /* Tab-Fokus aktiviert die Lamelle (für Tastatur-Bedienung) */
    lamella.addEventListener('focus', () => {
      activate(lamella);
    });

    /* Pfeiltasten-Navigation innerhalb des Akkordeons */
    lamella.addEventListener('keydown', (e) => {
      const idx = parseInt(lamella.dataset.phaseIndex, 10);
      if (isNaN(idx)) return;

      const isHorizontal = desktopMQ.matches;
      const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
      const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';

      let target = null;
      if (e.key === nextKey) {
        target = lamellas[Math.min(idx + 1, lamellas.length - 1)];
      } else if (e.key === prevKey) {
        target = lamellas[Math.max(idx - 1, 0)];
      } else if (e.key === 'Home') {
        target = lamellas[0];
      } else if (e.key === 'End') {
        target = lamellas[lamellas.length - 1];
      }

      if (target) {
        e.preventDefault();
        target.focus();
      }
    });
  });
}

/* --- Scroll Reveal (Intersection Observer) --- */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
  } else {
    elements.forEach(el => el.classList.add('visible'));
  }
}

/* --- Sticky Mobile CTA --- */
function initStickyMobileCTA() {
  const stickyCTA = document.querySelector('.sticky-cta');
  const contactSection = document.getElementById('kontakt');
  if (!stickyCTA) return;

  window.addEventListener('scroll', () => {
    const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);

    const contactVisible = contactSection
      ? contactSection.getBoundingClientRect().top < window.innerHeight
      : false;

    if (scrollPercent > 0.25 && !contactVisible) {
      stickyCTA.classList.add('visible');
      stickyCTA.classList.remove('hidden');
    } else {
      stickyCTA.classList.remove('visible');
      stickyCTA.classList.add('hidden');
    }
  }, { passive: true });
}

/* --- Contact Form Basic Handling --- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = 'Wird gesendet...';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.textContent = 'Nachricht gesendet!';
      submitBtn.style.background = '#22C55E';

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
        form.reset();
      }, 3000);
    }, 1200);
  });
}

/* --- Smooth Scroll for Anchor Links --- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}
