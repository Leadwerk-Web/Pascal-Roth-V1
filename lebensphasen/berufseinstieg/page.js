/* =========================================================
   Pascal Roth · Lebensphase Berufseinsteiger
   Seitenspezifisches JS:
   - Arbeitskraftwert-Rechner (live)
   - Donut-Chart Animation
   - Count-up Zahlen
   - Vergleichs-Bars (Sparen vs. Absicherung)
   - dezenter Hero-Parallax
   - Portrait „Was bewegt dich“: Hochfahren bei Scroll-in (IO, threshold 0)
   Respektiert prefers-reduced-motion.
   ========================================================= */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    initBekCalculator();
    initBekRiskChart();
    initBekSavingsBars();
    initBekHeroParallax();
    initBekPortraitRiseOnScroll();
  });

  /* =========================================================
     Hilfsfunktionen
     ========================================================= */

  const numberFormatter = new Intl.NumberFormat('de-DE', {
    maximumFractionDigits: 0
  });

  function formatNumber(value) {
    return numberFormatter.format(Math.round(value));
  }

  /**
   * Smooth count-up Animation für ein Element.
   * Springt direkt auf finalen Wert, falls Reduced Motion aktiv.
   */
  function animateNumber(el, from, to, duration = 700) {
    if (!el) return;
    if (reduceMotion || duration <= 0) {
      el.textContent = formatNumber(to);
      return;
    }

    const start = performance.now();
    const delta = to - from;

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = formatNumber(from + delta * eased);
      if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  /* =========================================================
     ARBEITSKRAFTWERT-RECHNER
     - Brutto/Netto-Toggle
     - Live-Update: Jahre bis Rente, Jahreseinkommen, Arbeitskraftwert
     - Synchron Range + Number-Input
     ========================================================= */
  function initBekCalculator() {
    const root = document.querySelector('[data-bek-calc]');
    if (!root) return;

    /* Inputs */
    const incomeNumber = root.querySelector('[data-bek-income-number]');
    const incomeRange = root.querySelector('[data-bek-income-range]');
    const ageNumber = root.querySelector('[data-bek-age-number]');
    const ageRange = root.querySelector('[data-bek-age-range]');
    const retireNumber = root.querySelector('[data-bek-retire-number]');
    const retireRange = root.querySelector('[data-bek-retire-range]');

    const incomeLabel = root.querySelector('[data-bek-income-label]');
    const ageLabel = root.querySelector('[data-bek-age-label]');
    const retireLabel = root.querySelector('[data-bek-retire-label]');

    /* Outputs */
    const outYears = root.querySelector('[data-bek-out-years]');
    const outAnnual = root.querySelector('[data-bek-out-annual]');
    const outValue = root.querySelector('[data-bek-out-value]');
    const timelineFill = root.querySelector('[data-bek-timeline-fill]');
    const timelineCurrent = root.querySelector('[data-bek-timeline-current]');
    const timelineEnd = root.querySelector('[data-bek-timeline-end]');

    /* Brutto/Netto Toggle */
    const toggleButtons = root.querySelectorAll('[data-bek-income-mode]');

    /* State */
    const state = {
      mode: 'netto', // 'netto' | 'brutto'
      income: 2500,
      age: 25,
      retire: 67
    };

    /* Stored last values for smooth count-up */
    let lastValue = 0;
    let lastAnnual = 0;
    let lastYears = 0;

    function recalc() {
      const yearsToRetire = Math.max(0, state.retire - state.age);
      const incomePerYear = state.income * 12;

      // Vereinfachte Brutto-zu-Netto-Annäherung als Ausgangsbasis,
      // damit der "Wert" in beiden Modi vergleichbar bleibt.
      // Brutto * 0.62 ist eine grobe Daumenregel für mittleres Einkommen.
      const baseAnnual = state.mode === 'brutto' ? incomePerYear * 0.62 : incomePerYear;
      const totalValue = baseAnnual * yearsToRetire;

      animateNumber(outYears, lastYears, yearsToRetire, 400);
      animateNumber(outAnnual, lastAnnual, incomePerYear, 600);
      animateNumber(outValue, lastValue, totalValue, 900);

      lastYears = yearsToRetire;
      lastAnnual = incomePerYear;
      lastValue = totalValue;

      // Timeline: aktueller Alter-Marker als Position auf der Timeline
      // (Skala: state.age bis state.retire = 0% bis 100%)
      // Der "Fill" zeigt: wie viel Lebensarbeitszeit liegt noch vor dir.
      // Wir füllen 100% des Tracks und beschriften die Marker dynamisch.
      if (timelineFill) timelineFill.style.width = '100%';
      if (timelineCurrent) timelineCurrent.textContent = `Alter ${state.age}`;
      if (timelineEnd) timelineEnd.textContent = `Rente ${state.retire}`;

      // Range-Fortschritt für CSS-Gradient
      syncRangeProgress(incomeRange, 1000, 12000, state.income);
      syncRangeProgress(ageRange, 18, 65, state.age);
      syncRangeProgress(retireRange, 60, 70, state.retire);

      // Live-Labels
      if (incomeLabel) incomeLabel.textContent = `${formatNumber(state.income)} €`;
      if (ageLabel) ageLabel.textContent = `${state.age} J.`;
      if (retireLabel) retireLabel.textContent = `${state.retire} J.`;
    }

    function syncRangeProgress(rangeEl, min, max, value) {
      if (!rangeEl) return;
      const clamped = Math.max(min, Math.min(max, value));
      const p = ((clamped - min) / (max - min)) * 100;
      rangeEl.style.setProperty('--p', p + '%');
    }

    /* Bind: Income */
    function setIncome(value, source) {
      const v = clampInt(value, 1000, 12000);
      state.income = v;
      if (source !== 'number' && incomeNumber) incomeNumber.value = v;
      if (source !== 'range' && incomeRange) incomeRange.value = v;
      recalc();
    }

    /* Bind: Age */
    function setAge(value, source) {
      const v = clampInt(value, 18, 65);
      state.age = v;
      // Sicherstellen dass retire >= age + 2
      if (state.retire < v + 2) {
        state.retire = Math.min(70, v + 2);
        if (retireNumber) retireNumber.value = state.retire;
        if (retireRange) retireRange.value = state.retire;
      }
      if (source !== 'number' && ageNumber) ageNumber.value = v;
      if (source !== 'range' && ageRange) ageRange.value = v;
      recalc();
    }

    /* Bind: Retire */
    function setRetire(value, source) {
      const v = clampInt(value, Math.max(state.age + 2, 60), 70);
      state.retire = v;
      if (source !== 'number' && retireNumber) retireNumber.value = v;
      if (source !== 'range' && retireRange) retireRange.value = v;
      recalc();
    }

    function clampInt(raw, min, max) {
      const n = parseInt(raw, 10);
      if (isNaN(n)) return min;
      return Math.max(min, Math.min(max, n));
    }

    /* Listeners */
    if (incomeRange) {
      incomeRange.addEventListener('input', e => setIncome(e.target.value, 'range'));
    }
    if (incomeNumber) {
      incomeNumber.addEventListener('input', e => setIncome(e.target.value, 'number'));
      incomeNumber.addEventListener('blur', e => setIncome(e.target.value, 'number'));
    }
    if (ageRange) {
      ageRange.addEventListener('input', e => setAge(e.target.value, 'range'));
    }
    if (ageNumber) {
      ageNumber.addEventListener('input', e => setAge(e.target.value, 'number'));
      ageNumber.addEventListener('blur', e => setAge(e.target.value, 'number'));
    }
    if (retireRange) {
      retireRange.addEventListener('input', e => setRetire(e.target.value, 'range'));
    }
    if (retireNumber) {
      retireNumber.addEventListener('input', e => setRetire(e.target.value, 'number'));
      retireNumber.addEventListener('blur', e => setRetire(e.target.value, 'number'));
    }

    /* Brutto/Netto Toggle */
    toggleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.bekIncomeMode;
        if (mode === state.mode) return;
        state.mode = mode;
        toggleButtons.forEach(b => {
          b.classList.toggle('is-active', b === btn);
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        recalc();
      });
    });

    /* Initial */
    if (incomeNumber) incomeNumber.value = state.income;
    if (incomeRange) incomeRange.value = state.income;
    if (ageNumber) ageNumber.value = state.age;
    if (ageRange) ageRange.value = state.age;
    if (retireNumber) retireNumber.value = state.retire;
    if (retireRange) retireRange.value = state.retire;
    recalc();

    /* Beim ersten Erscheinen smooth ins Bild zählen lassen */
    if ('IntersectionObserver' in window && !reduceMotion) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          // sanftes Heranzählen ab 0
          lastValue = 0;
          lastAnnual = 0;
          lastYears = 0;
          recalc();
          io.unobserve(entry.target);
        });
      }, { threshold: 0.35 });
      io.observe(root);
    }
  }


  /* =========================================================
     RISK DONUT CHART
     - SVG-basierter Donut, animiert beim Sichtbarwerden
     - Daten: aus data-* Attributen am .bek-risk__chart-Element
     - Cards rechts werden parallel animiert (count-up)
     ========================================================= */
  function initBekRiskChart() {
    const chart = document.querySelector('[data-bek-risk-chart]');
    if (!chart) return;

    const segments = chart.querySelectorAll('.bek-risk__segment');
    const cards = document.querySelectorAll('[data-bek-risk-card]');
    const centerNumber = document.querySelector('[data-bek-risk-center-number]');

    const radius = 40; // muss zum SVG-Viewbox passen (siehe HTML)
    const circumference = 2 * Math.PI * radius; // ≈ 251.327

    // Initial: alle Segmente "leer"
    segments.forEach(seg => {
      seg.style.strokeDasharray = `0 ${circumference}`;
    });

    function drawChart() {
      // Segmente bauen sich kumulativ auf
      let cumulative = 0;
      segments.forEach(seg => {
        const value = parseFloat(seg.dataset.value || '0');
        const length = (value / 100) * circumference;
        // Versatz so setzen, dass Segmente nahtlos aneinander schließen
        seg.style.strokeDasharray = `${length} ${circumference}`;
        seg.style.strokeDashoffset = `-${cumulative}`;
        cumulative += length;
      });
    }

    function animateCards() {
      cards.forEach((card, i) => {
        const valueEl = card.querySelector('[data-bek-risk-value]');
        const target = parseFloat(card.dataset.value || '0');
        if (!valueEl) return;
        // Stagger
        setTimeout(() => {
          animateNumber(valueEl, 0, target, 800);
          // Suffix anhängen
          setTimeout(() => {
            valueEl.textContent = target + ' %';
          }, reduceMotion ? 0 : 820);
        }, reduceMotion ? 0 : i * 90);
      });

      if (centerNumber) {
        const total = parseFloat(centerNumber.dataset.value || '100');
        animateNumber(centerNumber, 0, total, 900);
        setTimeout(() => {
          centerNumber.textContent = total + ' %';
        }, reduceMotion ? 0 : 920);
      }
    }

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          if (reduceMotion) {
            drawChart();
            animateCards();
          } else {
            requestAnimationFrame(() => {
              drawChart();
              animateCards();
            });
          }
          io.unobserve(entry.target);
        });
      }, { threshold: 0.3 });
      io.observe(chart);
    } else {
      drawChart();
      animateCards();
    }

    // Hover auf Card hebt zugehöriges Segment hervor
    cards.forEach(card => {
      const key = card.dataset.bekRiskCard;
      if (!key) return;
      const seg = chart.querySelector(`[data-bek-risk-key="${key}"]`);
      if (!seg) return;

      const enter = () => seg.classList.add('is-highlight');
      const leave = () => seg.classList.remove('is-highlight');
      card.addEventListener('mouseenter', enter);
      card.addEventListener('mouseleave', leave);
      card.addEventListener('focusin', enter);
      card.addEventListener('focusout', leave);
    });
  }


  /* =========================================================
     SAVINGS COMPARISON BARS
     - Bar 1 ("Kapital"): startet voll, läuft optisch aus
     - Bar 2 ("Absicherung"): bleibt voll
     ========================================================= */
  function initBekSavingsBars() {
    const section = document.querySelector('[data-bek-savings]');
    if (!section) return;

    const bars = section.querySelectorAll('.bek-savings__bar-fill');
    if (bars.length === 0) return;

    function play() {
      bars.forEach(bar => {
        const target = parseFloat(bar.dataset.target || '100');
        // initial setzen (von 0)
        bar.style.width = '0%';
        // im nächsten Frame triggern, damit Transition greift
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (reduceMotion) {
              bar.style.transition = 'none';
            }
            bar.style.width = target + '%';
          });
        });
      });
    }

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          play();
          io.unobserve(entry.target);
        });
      }, { threshold: 0.3 });
      io.observe(section);
    } else {
      play();
    }
  }


  /* =========================================================
     „Was bewegt dich“-Portrait: hochfahren, sobald der Block ins Blickfeld scrollt
     (IntersectionObserver: sobald ein sichtbarer Anteil im Viewport liegt).
     ========================================================= */
  function initBekPortraitRiseOnScroll() {
    const root = document.querySelector('[data-bek-portrait-rise]');
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
      {
        /* 0 = sobald auch nur ein Pixel des Portraits im Viewport liegt */
        threshold: 0,
        rootMargin: '0px 0px 0px 0px',
      }
    );

    io.observe(root);
  }

  /* =========================================================
     HERO PARALLAX (dezent, performant)
     - Verschiebt das Hintergrundbild um max. ±28px während Scrollens
     - Steuert das ::before-Pseudo-Element über CSS-Variable --bek-parallax-y
     ========================================================= */
  function initBekHeroParallax() {
    const hero = document.querySelector('[data-parallax]');
    if (!hero || reduceMotion) return;

    let ticking = false;
    let latestY = 0;

    function update() {
      // Nur bewegen, solange der Hero im Viewport ist
      const rect = hero.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        ticking = false;
        return;
      }
      const offset = Math.max(-32, Math.min(28, -latestY * 0.06));
      hero.style.setProperty('--bek-parallax-y', offset.toFixed(1) + 'px');
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
})();
