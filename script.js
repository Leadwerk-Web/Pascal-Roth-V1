/* ============================================
   Pascal Roth – Website JavaScript
   Navigation, FAQ, Marquee, Scroll Reveal
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initMobileMenu();
  initFAQ();
  initMarquee();
  initScrollReveal();
  initStickyMobileCTA();
  initContactForm();
  initSmoothScroll();
});

/* --- Sticky Navigation on Scroll --- */
function initNavigation() {
  const nav = document.querySelector('.nav-wrapper');
  if (!nav) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  }, { passive: true });
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
