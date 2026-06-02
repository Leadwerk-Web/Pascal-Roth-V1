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
    /* Passung-Abschnitt nutzt jetzt statische Karten – keine Interaktion nötig. */
  }

  document.addEventListener('DOMContentLoaded', () => {
    initPrHeroParallax();
    initTrustModule();
  });
})();
