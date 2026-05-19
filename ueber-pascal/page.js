(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initPrHeroParallax() {
    const hero = document.querySelector('.pr-page .vma-hero[data-parallax]');
    if (!hero || reduceMotion) return;

    let ticking = false;
    let latestY = 0;

    function update() {
      const rect = hero.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        ticking = false;
        return;
      }
      const offset = Math.max(-28, Math.min(24, -latestY * 0.05));
      hero.style.setProperty('--pr-parallax-y', `${offset.toFixed(1)}px`);
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      latestY = window.scrollY;
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  function initTrustModule() {
    const root = document.querySelector('[data-pr-trust]');
    if (!root) return;

    const chips = root.querySelectorAll('.pr-trust-chip');
    const reply = root.querySelector('[data-pr-trust-reply]');
    const defaultText = root.dataset.defaultReply || reply?.getAttribute('data-default-text') || '';

    const tagline =
      ' Genau darum geht es in meiner Beratung: Du sollst verstehen, was du entscheidest – und warum.';

    function setReply(text) {
      if (!reply) return;
      reply.textContent = text;
    }

    chips.forEach((chip, i) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('is-selected'));
        chip.classList.add('is-selected');
        const specific = chip.getAttribute('data-reply');
        const msg = specific ? specific + tagline : defaultText;
        setReply(msg);
      });

      chip.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const next = e.key === 'ArrowRight' ? i + 1 : i - 1;
        const t = chips[Math.max(0, Math.min(chips.length - 1, next))];
        t.focus();
      });
    });

    if (reply && defaultText) setReply(defaultText);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initPrHeroParallax();
    initTrustModule();
  });
})();
