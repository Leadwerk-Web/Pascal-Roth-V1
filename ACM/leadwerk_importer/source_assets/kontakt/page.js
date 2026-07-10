/* Pascal Roth · Kontakt – Hero-Parallax */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initKontaktHeroParallax() {
    const hero = document.querySelector('.kontakt-page .vma-hero[data-parallax]');
    if (!hero || reduceMotion) return;

    let ticking = false;
    let latestY = 0;

    function update() {
      const rect = hero.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        ticking = false;
        return;
      }
      const offset = Math.max(-32, Math.min(28, -latestY * 0.06));
      hero.style.setProperty('--vma-parallax-y', `${offset.toFixed(1)}px`);
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      () => {
        latestY = window.scrollY;
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  }

  document.addEventListener('DOMContentLoaded', initKontaktHeroParallax);
})();
