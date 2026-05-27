/* =========================================================
   Pascal Roth · Lebensphase Kinder
   Seitenspezifisches JS:
   - Hero-Parallax (dezent)
   - Kostenrechner: Bausteine bis zum 18. Geburtstag
   - Sparrate-Rechner: Sparen vs. strukturierter Aufbau
   - Statistik Count-up beim Scrollen
   Respektiert prefers-reduced-motion.
   ========================================================= */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    initKidHeroParallax();
    initKidPortraitRiseOnScroll();
    initKidCostCalc();
    initKidSavingsCalc();
    initKidStatsCountUp();
  });

  /* =========================================================
     Hilfsfunktionen
     ========================================================= */

  const numberFormatter = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
  const decimalFormatter = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 });

  function formatNumber(value) { return numberFormatter.format(Math.round(value)); }
  function formatDecimal(value) { return decimalFormatter.format(value); }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function animateNumber(el, from, to, duration = 700, formatter) {
    if (!el) return;
    const fmt = typeof formatter === 'function' ? formatter : formatNumber;
    if (reduceMotion || duration <= 0 || from === to) {
      el.textContent = fmt(to);
      return;
    }
    const start = performance.now();
    const delta = to - from;
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt(from + delta * eased);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }


  /* =========================================================
     HERO PARALLAX (dezent)
     ========================================================= */
  function initKidHeroParallax() {
    const hero = document.querySelector('.kid-hero[data-parallax]');
    if (!hero || reduceMotion) return;

    let ticking = false;
    let latestY = 0;

    function update() {
      const rect = hero.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        ticking = false;
        return;
      }
      const offset = clamp(-latestY * 0.05, -28, 24);
      hero.style.setProperty('--kid-parallax-y', offset.toFixed(1) + 'px');
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


  /* =========================================================
     Portrait: hochfahren beim Scrollen (Orbit-Sektion)
     ========================================================= */
  function initKidPortraitRiseOnScroll() {
    const root = document.querySelector('[data-kid-portrait-rise]');
    if (!root) return;

    if (reduceMotion) {
      root.classList.add('is-visible');
      return;
    }

    const markVisible = () => {
      root.classList.add('is-visible');
    };

    if (!('IntersectionObserver' in window)) {
      markVisible();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          markVisible();
          io.unobserve(root);
        });
      },
      { threshold: 0, rootMargin: '0px' }
    );

    io.observe(root);
  }


  /* =========================================================
     KOSTENRECHNER: „Was braucht dein Kind mit 18?"
     - Standardwerte als PLACEHOLDER_COST markiert (im HTML)
     - Frontend-only, dynamisch.
     ========================================================= */
  function initKidCostCalc() {
    const root = document.querySelector('[data-kid-calc]');
    if (!root) return;

    const ageInput = root.querySelector('[data-kid-calc-age]');
    const yearsOut = root.querySelectorAll('[data-kid-calc-years]');
    const sumOut = root.querySelector('[data-kid-calc-sum]');
    const monthlyOut = root.querySelector('[data-kid-calc-monthly]');
    const barFill = root.querySelector('[data-kid-calc-bar]');
    const rows = Array.from(root.querySelectorAll('.kid-calc__row'));

    if (!ageInput || !sumOut || !monthlyOut) return;

    let lastSum = 0;
    let lastMonthly = 0;

    function getAge() {
      const v = parseInt(ageInput.value, 10);
      if (Number.isNaN(v)) return 0;
      return clamp(v, 0, 17);
    }

    function compute() {
      const age = getAge();
      const years = Math.max(1, 18 - age);
      let total = 0;

      rows.forEach((row) => {
        const check = row.querySelector('.kid-calc__check');
        const input = row.querySelector('.kid-calc__row-input');
        if (!check || !input) return;
        const value = parseFloat(input.value.replace(',', '.'));
        const amount = Number.isFinite(value) ? Math.max(0, value) : 0;
        if (check.checked) total += amount;
      });

      const months = years * 12;
      const monthly = months > 0 ? total / months : 0;
      const yearsText = formatNumber(years);
      const monthlyText = formatNumber(Math.round(monthly));

      yearsOut.forEach((el) => { el.textContent = yearsText; });
      animateNumber(sumOut, lastSum, total, 500);
      animateNumber(monthlyOut, lastMonthly, Math.round(monthly), 500);
      lastSum = total;
      lastMonthly = Math.round(monthly);

      if (barFill) {
        const pct = clamp((total / 25000) * 100, 0, 100);
        barFill.style.setProperty('--kid-bar-width', pct.toFixed(1) + '%');
      }
    }

    rows.forEach((row) => {
      const check = row.querySelector('.kid-calc__check');
      const input = row.querySelector('.kid-calc__row-input');
      if (check) check.addEventListener('change', compute);
      if (input) {
        input.addEventListener('input', compute);
        input.addEventListener('blur', () => {
          const v = parseFloat(input.value.replace(',', '.'));
          if (Number.isFinite(v)) input.value = String(Math.max(0, Math.round(v)));
          else input.value = input.dataset.default || '0';
          compute();
        });
      }
    });

    ageInput.addEventListener('input', compute);
    ageInput.addEventListener('blur', () => {
      ageInput.value = String(getAge());
      compute();
    });

    compute();
  }


  /* =========================================================
     SPARRATE-RECHNER: Sparen vs. strukturiert anlegen
     - Beispielrendite klar als Annahme.
     - Keine Renditeversprechen, keine Anlageberatung.
     ========================================================= */
  function initKidSavingsCalc() {
    const root = document.querySelector('[data-kid-save]');
    if (!root) return;

    const ageInput = root.querySelector('[data-kid-save-age]');
    const ageVal = root.querySelector('[data-kid-save-age-val]');
    const rateInput = root.querySelector('[data-kid-save-rate]');
    const rateVal = root.querySelector('[data-kid-save-rate-val]');
    const startInput = root.querySelector('[data-kid-save-start]');
    const startVal = root.querySelector('[data-kid-save-start-val]');
    const returnInput = root.querySelector('[data-kid-save-return]');
    const returnVal = root.querySelector('[data-kid-save-return-val]');

    const totalOut = root.querySelector('[data-kid-save-total]');
    const yearsOut = root.querySelector('[data-kid-save-years]');
    const monthlyOut = root.querySelector('[data-kid-save-monthly]');
    const inOut = root.querySelector('[data-kid-save-in]');
    const saveOut = root.querySelector('[data-kid-save-save]');
    const investOut = root.querySelector('[data-kid-save-invest]');
    const inBar = root.querySelector('[data-kid-save-bar-in]');
    const saveBar = root.querySelector('[data-kid-save-bar-save]');
    const investBar = root.querySelector('[data-kid-save-bar-invest]');

    if (!totalOut || !investOut) return;

    let last = { invest: 0, save: 0, paid: 0 };

    function readNum(el, fallback) {
      if (!el) return fallback;
      const v = parseFloat(String(el.value).replace(',', '.'));
      return Number.isFinite(v) ? v : fallback;
    }

    function compute() {
      const age = clamp(readNum(ageInput, 5), 0, 17);
      const monthlyRate = clamp(readNum(rateInput, 50), 0, 1000);
      const start = clamp(readNum(startInput, 0), 0, 100000);
      const annualReturn = clamp(readNum(returnInput, 4), 0, 10);

      const years = Math.max(1, 18 - age);
      const months = years * 12;
      const r = annualReturn / 100;
      const monthlyR = r / 12;

      // Eingezahlt
      const paidIn = start + monthlyRate * months;

      // „Nur sparen" (0 % Verzinsung) = paidIn
      const onlySave = paidIn;

      // „Strukturiert anlegen" – Annuitätenformel: Endwert
      let invested;
      if (monthlyR === 0) {
        invested = paidIn;
      } else {
        const fvStart = start * Math.pow(1 + monthlyR, months);
        const fvSeries = monthlyRate * ((Math.pow(1 + monthlyR, months) - 1) / monthlyR);
        invested = fvStart + fvSeries;
      }

      if (yearsOut) yearsOut.textContent = formatNumber(years);
      if (monthlyOut) monthlyOut.textContent = formatNumber(monthlyRate);
      if (ageVal) ageVal.textContent = formatNumber(age) + ' Jahre';
      if (rateVal) rateVal.textContent = formatNumber(monthlyRate) + ' € / Monat';
      if (startVal) startVal.textContent = formatNumber(start) + ' €';
      if (returnVal) returnVal.textContent = formatDecimal(annualReturn) + ' % p. a.';

      animateNumber(totalOut, last.invest, invested, 600);
      animateNumber(inOut, last.paid, paidIn, 600);
      animateNumber(saveOut, last.save, onlySave, 600);
      animateNumber(investOut, last.invest, invested, 600);
      last = { invest: invested, save: onlySave, paid: paidIn };

      // Balken-Skala an höchstem Wert ausrichten
      const max = Math.max(paidIn, onlySave, invested, 1);
      const w = (v) => ((v / max) * 100).toFixed(1) + '%';
      if (inBar) inBar.style.setProperty('--kid-bar-w', w(paidIn));
      if (saveBar) saveBar.style.setProperty('--kid-bar-w', w(onlySave));
      if (investBar) investBar.style.setProperty('--kid-bar-w', w(invested));
    }

    [ageInput, rateInput, startInput, returnInput].forEach((el) => {
      if (!el) return;
      el.addEventListener('input', compute);
      el.addEventListener('change', compute);
    });

    compute();
  }


  /* =========================================================
     STATISTIK COUNT-UP beim Scrollen
     ========================================================= */
  function initKidStatsCountUp() {
    const stats = document.querySelectorAll('[data-kid-countup]');
    if (!stats.length) return;

    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      stats.forEach((el) => {
        const target = parseFloat(el.dataset.target || '0');
        el.textContent = formatNumber(target);
      });
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.target || '0');
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        animateNumber(el, 0, target, 900, (v) => prefix + formatNumber(v) + suffix);
        io.unobserve(el);
      });
    }, { threshold: 0.4 });

    stats.forEach((el) => io.observe(el));
  }


})();
