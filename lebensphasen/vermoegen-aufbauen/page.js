/* Pascal Roth · Lebensphase Vermögen aufbauen (Namespace vma-*) */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const numberFmt = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
  const moneyFmt = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  });

  function formatInt(n) {
    return numberFmt.format(Math.round(n));
  }

  function formatMoney(n) {
    return moneyFmt.format(Math.round(n));
  }

  function animateNumber(el, from, to, duration = 700, formatter = formatInt) {
    if (!el) return;
    if (reduceMotion || duration <= 0) {
      el.textContent = formatter(to);
      return;
    }
    const start = performance.now();
    const delta = to - from;
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = formatter(from + delta * eased);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------
     1) Vermögens-Klarheitscheck
     ------------------------------------------------------------ */

  const VMA_QUESTIONS = [
    {
      text: 'Hast du ein konkretes finanzielles Ziel für die nächsten Jahre?',
      options: [
        { label: 'Ja, klar formuliert', score: 10 },
        { label: 'Eher grobe Idee', score: 5 },
        { label: 'Noch nicht', score: 2 },
      ],
    },
    {
      text: 'Hast du einen monatlichen Sparbetrag, der zu deinem Alltag passt?',
      options: [
        { label: 'Ja, regelmäßig', score: 10 },
        { label: 'Unregelmäßig', score: 5 },
        { label: 'Bisher nicht', score: 2 },
      ],
    },
    {
      text: 'Investierst du bereits regelmäßig (z. B. Sparplan oder Depot)?',
      options: [
        { label: 'Ja', score: 10 },
        { label: 'Erste Schritte', score: 5 },
        { label: 'Nein', score: 2 },
      ],
    },
    {
      text: 'Weißt du grob, welches Risiko zu dir passt – auch in schwankenden Phasen?',
      options: [
        { label: 'Ja', score: 10 },
        { label: 'Teils', score: 5 },
        { label: 'Nein', score: 2 },
      ],
    },
    {
      text: 'Hast du Rücklagen für unerwartete Ausgaben (3–6 Monate Fixkosten)?',
      options: [
        { label: 'Ja, ausreichend', score: 10 },
        { label: 'Teilweise', score: 5 },
        { label: 'Eher nicht', score: 2 },
      ],
    },
    {
      text: 'Gibt es bereits eine Altersvorsorge oder einen Plan dafür?',
      options: [
        { label: 'Ja, aktiv geplant', score: 10 },
        { label: 'Eher passiv', score: 5 },
        { label: 'Noch offen', score: 2 },
      ],
    },
    {
      text: 'Hast du einen Überblick über bestehende Verträge, Depots oder Sparpläne?',
      options: [
        { label: 'Ja, sortiert', score: 10 },
        { label: 'Grob', score: 5 },
        { label: 'Nein', score: 2 },
      ],
    },
    {
      text: 'Weißt du, wie lange dein Anlagehorizont realistisch ist?',
      options: [
        { label: 'Ja', score: 10 },
        { label: 'Ungefähr', score: 5 },
        { label: 'Nein', score: 2 },
      ],
    },
    {
      text: 'Hast du eine Strategie – oder triffst du eher Einzelentscheidungen?',
      options: [
        { label: 'Klare Strategie', score: 10 },
        { label: 'Mischform', score: 5 },
        { label: 'Eher Einzelentscheidungen', score: 2 },
      ],
    },
    {
      text: 'Wurde deine Geldanlage schon einmal unabhängig geprüft?',
      options: [
        { label: 'Ja, kürzlich', score: 10 },
        { label: 'Vor längerer Zeit', score: 5 },
        { label: 'Noch nie', score: 2 },
      ],
    },
  ];

  function bandForScore(pct) {
    if (pct >= 75) {
      return {
        title: 'Schon gut strukturiert – starke Basis',
        body:
          '<strong>Orientierung:</strong> Du hast viele Bausteine deines Vermögensaufbaus bereits sortiert. Das ist eine gute Ausgangslage für die nächsten Jahre.<br><br><strong>Nächster Schritt:</strong> Jetzt geht es oft um Feinjustierung – Kosten, Risiko-Mix und Steuerthemen sauber zusammenführen.<br><br><strong>Einordnung:</strong> Eine unabhängige Zweitmeinung kann helfen, die Strategie ruhig weiterzuentwickeln, ohne alles umzustellen.',
      };
    }
    if (pct >= 50) {
      return {
        title: 'Einige Punkte verdienen Aufmerksamkeit',
        body:
          '<strong>Orientierung:</strong> Du hast erste wichtige Grundlagen geschaffen. Trotzdem fehlt vielen ein klarer Zusammenhang zwischen Ziel, Sparrate, Risiko und Zeithorizont.<br><br><strong>Nächster Schritt:</strong> Sinnvoll ist jetzt, die einzelnen Bausteine zu verbinden, statt neue Verträge zu sammeln.<br><br><strong>Einordnung:</strong> Ein Vermögens-Check kann helfen, deine nächsten Schritte sinnvoll zu sortieren – ohne Druck und ohne Trendkäufe.',
      };
    }
    if (pct >= 30) {
      return {
        title: 'Hier lohnt sich ein gemeinsamer Blick',
        body:
          '<strong>Orientierung:</strong> Vieles ist noch offen – das ist normal und kein schlechtes Zeichen. Es bedeutet vor allem: Es gibt Potenzial, das mit Struktur sichtbar wird.<br><br><strong>Nächster Schritt:</strong> Klein anfangen, klar priorisieren – zuerst Ziele und Rücklagen, dann Sparrate und Strategie.<br><br><strong>Einordnung:</strong> Genau dafür bin ich für dich da: verständlich übersetzen, einordnen und Schritt für Schritt einen Plan bauen.',
      };
    }
    return {
      title: 'Viel Potenzial – ruhig den ersten Schritt machen',
      body:
        '<strong>Orientierung:</strong> Wenn die meisten Fragen noch offen sind, heißt das nicht, dass du etwas „falsch“ machst. Es heißt nur: Es gibt noch keinen ruhigen roten Faden.<br><br><strong>Nächster Schritt:</strong> Ein erster Fokus auf Ziele, Rücklagen und realistische Sparrate schafft schnell Klarheit.<br><br><strong>Einordnung:</strong> Wir bauen gemeinsam einen einfachen, ehrlichen Plan – ohne Fachchinesisch und ohne Verkaufsdruck.',
    };
  }

  function initVmaCheck() {
    const root = document.querySelector('[data-vma-check]');
    if (!root) return;

    const stepNum = root.querySelector('[data-vma-check-step-num]');
    const progressWrap = root.querySelector('[data-vma-check-progress-wrap]');
    const progressBar = root.querySelector('[data-vma-check-progress-bar]');
    const legend = root.querySelector('[data-vma-check-question]');
    const optionsWrap = root.querySelector('[data-vma-check-options]');
    const btnBack = root.querySelector('[data-vma-check-back]');
    const btnNext = root.querySelector('[data-vma-check-next]');
    const ringFill = root.querySelector('[data-vma-check-ring-fill]');
    const ringPct = root.querySelector('[data-vma-check-ring-pct]');
    const resultBox = root.querySelector('[data-vma-check-result]');
    const resultTitle = root.querySelector('[data-vma-check-result-title]');
    const resultText = root.querySelector('[data-vma-check-result-text]');
    const btnRestart = root.querySelector('[data-vma-check-restart]');

    const ringR = 52;
    const ringC = 2 * Math.PI * ringR;

    let step = 0;
    const answers = [];

    function selectedIndex() {
      const inputs = optionsWrap.querySelectorAll('input[type="radio"]');
      for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].checked) return i;
      }
      return -1;
    }

    function setRingFromProgress(answeredCount) {
      const p = Math.max(0, Math.min(1, answeredCount / VMA_QUESTIONS.length));
      if (ringFill) ringFill.setAttribute('stroke-dasharray', `${p * ringC} ${ringC}`);
      if (ringPct) ringPct.textContent = `${Math.round(p * 100)}%`;
    }

    function setRingFromScore(pct) {
      const p = Math.max(0, Math.min(100, pct)) / 100;
      if (ringFill) ringFill.setAttribute('stroke-dasharray', `${p * ringC} ${ringC}`);
      if (ringPct) ringPct.textContent = `${Math.round(pct)}%`;
    }

    function renderStep() {
      const q = VMA_QUESTIONS[step];
      if (legend) legend.textContent = q.text;
      optionsWrap.innerHTML = '';
      const groupName = `vma-check-q${step}`;
      q.options.forEach((opt, i) => {
        const id = `${groupName}-${i}`;
        const label = document.createElement('label');
        label.className = 'vma-check__opt';
        label.setAttribute('for', id);
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = groupName;
        input.id = id;
        input.value = String(i);
        if (answers[step] === i) input.checked = true;
        const span = document.createElement('span');
        span.textContent = opt.label;
        label.appendChild(input);
        label.appendChild(span);
        optionsWrap.appendChild(label);
      });

      if (stepNum) stepNum.textContent = String(step + 1);
      if (progressBar) progressBar.style.width = `${((step + 1) / VMA_QUESTIONS.length) * 100}%`;
      if (progressWrap) {
        progressWrap.setAttribute('aria-valuenow', String(step + 1));
        progressWrap.setAttribute('aria-valuemax', String(VMA_QUESTIONS.length));
      }
      if (btnBack) btnBack.disabled = step === 0;
      if (btnNext) {
        btnNext.innerHTML =
          step === VMA_QUESTIONS.length - 1
            ? 'Auswertung <span aria-hidden="true">→</span>'
            : 'Weiter <span aria-hidden="true">→</span>';
      }
      setRingFromProgress(answers.filter((a) => a !== undefined).length);
    }

    function showResult() {
      let sum = 0;
      answers.forEach((idx, qi) => {
        const sc = VMA_QUESTIONS[qi].options[idx]?.score ?? 0;
        sum += sc;
      });
      const max = VMA_QUESTIONS.length * 10;
      const pct = max > 0 ? (sum / max) * 100 : 0;
      const band = bandForScore(pct);

      root.classList.add('vma-check--result-mode');
      if (resultBox) {
        resultBox.classList.remove('is-hidden');
        resultBox.setAttribute('tabindex', '-1');
        resultBox.focus({ preventScroll: true });
      }
      if (resultTitle) resultTitle.textContent = band.title;
      if (resultText) resultText.innerHTML = band.body;

      if (reduceMotion) {
        setRingFromScore(pct);
      } else {
        const fromPct = (answers.length / VMA_QUESTIONS.length) * 100;
        const start = performance.now();
        const dur = 700;
        function frame(now) {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          setRingFromScore(fromPct + (pct - fromPct) * eased);
          if (t < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      }
    }

    function restart() {
      step = 0;
      answers.length = 0;
      root.classList.remove('vma-check--result-mode');
      if (resultBox) resultBox.classList.add('is-hidden');
      if (ringFill) ringFill.setAttribute('stroke-dasharray', `0 ${ringC}`);
      if (ringPct) ringPct.textContent = '0%';
      renderStep();
    }

    btnNext?.addEventListener('click', () => {
      const idx = selectedIndex();
      if (idx < 0) {
        optionsWrap.querySelector('input')?.focus();
        return;
      }
      answers[step] = idx;
      if (step < VMA_QUESTIONS.length - 1) {
        step += 1;
        renderStep();
        btnNext?.focus();
      } else {
        showResult();
      }
    });

    btnBack?.addEventListener('click', () => {
      if (step > 0) {
        step -= 1;
        renderStep();
      }
    });

    btnRestart?.addEventListener('click', restart);

    renderStep();
  }

  /* ------------------------------------------------------------
     2) Sparplan-Rechner
     - Eingaben: Startkapital, monatliche Sparrate, Laufzeit (Jahre),
       angenommene Rendite (% p.a.), optionale Dynamik (% pro Jahr).
     - Berechnung erfolgt jahresweise (vereinfacht).
     - Hinweis: Beispielrechnung, keine Zusicherung.
     ------------------------------------------------------------ */

  function initVmaSavings() {
    const root = document.querySelector('[data-vma-savings]');
    if (!root) return;

    const inStart = root.querySelector('[data-vma-savings-start]');
    const inRate = root.querySelector('[data-vma-savings-rate]');
    const inYears = root.querySelector('[data-vma-savings-years]');
    const inReturn = root.querySelector('[data-vma-savings-return]');
    const inDyn = root.querySelector('[data-vma-savings-dyn]');

    const outPaid = root.querySelector('[data-vma-savings-paid]');
    const outFinal = root.querySelector('[data-vma-savings-final]');
    const outGain = root.querySelector('[data-vma-savings-gain]');
    const barPaid = root.querySelector('[data-vma-savings-bar-paid]');
    const barGain = root.querySelector('[data-vma-savings-bar-gain]');

    let last = { paid: 0, final: 0, gain: 0 };

    function readNum(el, fallback = 0) {
      const n = parseFloat(el?.value);
      return Number.isFinite(n) ? n : fallback;
    }

    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v));
    }

    function compute() {
      const start = Math.max(0, readNum(inStart, 0));
      let rate = Math.max(0, readNum(inRate, 0));
      const years = clamp(Math.round(readNum(inYears, 25)), 1, 50);
      const r = clamp(readNum(inReturn, 5), 0, 12) / 100;
      const dyn = clamp(readNum(inDyn, 0), 0, 6) / 100;

      let kapital = start;
      let paid = start;
      for (let y = 0; y < years; y++) {
        const annualSavings = rate * 12;
        kapital = (kapital + annualSavings) * (1 + r);
        paid += annualSavings;
        rate = rate * (1 + dyn);
      }
      const finalValue = kapital;
      const gain = finalValue - paid;

      animateNumber(outPaid, last.paid, paid, 700, formatMoney);
      animateNumber(outFinal, last.final, finalValue, 900, formatMoney);
      animateNumber(outGain, last.gain, gain, 800, formatMoney);

      const maxVal = Math.max(finalValue, 1);
      if (barPaid) barPaid.style.width = `${(paid / maxVal) * 100}%`;
      if (barGain) barGain.style.width = `${(finalValue / maxVal) * 100}%`;

      last = { paid, final: finalValue, gain };
    }

    [inStart, inRate, inYears, inReturn, inDyn].forEach((el) => {
      el?.addEventListener('input', compute);
      el?.addEventListener('change', compute);
    });

    if ('IntersectionObserver' in window && !reduceMotion) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            last = { paid: 0, final: 0, gain: 0 };
            compute();
            io.unobserve(entry.target);
          });
        },
        { threshold: 0.25 }
      );
      io.observe(root);
    }
    compute();
  }

  /* ------------------------------------------------------------
     3) "Was kostet Warten?" – Vergleich Heute vs. Später
     - Eingaben: Sparrate, Laufzeit (Jahre), Rendite, Verzögerung in Jahren.
     - Annahme: gleiche Endlaufzeit, "später" startet entsprechend kürzer.
     ------------------------------------------------------------ */

  function initVmaWaiting() {
    const root = document.querySelector('[data-vma-waiting]');
    if (!root) return;

    const inRate = root.querySelector('[data-vma-waiting-rate]');
    const inYears = root.querySelector('[data-vma-waiting-years]');
    const inReturn = root.querySelector('[data-vma-waiting-return]');
    const inDelay = root.querySelector('[data-vma-waiting-delay]');

    const outA = root.querySelector('[data-vma-waiting-a]');
    const outB = root.querySelector('[data-vma-waiting-b]');
    const outDiff = root.querySelector('[data-vma-waiting-diff]');
    const barA = root.querySelector('[data-vma-waiting-bar-a]');
    const barB = root.querySelector('[data-vma-waiting-bar-b]');
    const labelA = root.querySelector('[data-vma-waiting-label-a]');
    const labelB = root.querySelector('[data-vma-waiting-label-b]');

    let last = { a: 0, b: 0, diff: 0 };

    function readNum(el, fb) {
      const n = parseFloat(el?.value);
      return Number.isFinite(n) ? n : fb;
    }

    function fv(rateMonthly, years, r) {
      let k = 0;
      const a = rateMonthly * 12;
      for (let y = 0; y < years; y++) {
        k = (k + a) * (1 + r);
      }
      return k;
    }

    function compute() {
      const rate = Math.max(0, readNum(inRate, 200));
      const years = Math.max(1, Math.min(50, Math.round(readNum(inYears, 30))));
      const r = Math.max(0, Math.min(12, readNum(inReturn, 5))) / 100;
      const delay = Math.max(0, Math.min(years - 1, Math.round(readNum(inDelay, 5))));

      const a = fv(rate, years, r);
      const b = fv(rate, years - delay, r);
      const diff = a - b;

      animateNumber(outA, last.a, a, 800, formatMoney);
      animateNumber(outB, last.b, b, 800, formatMoney);
      animateNumber(outDiff, last.diff, diff, 800, formatMoney);

      const maxVal = Math.max(a, b, 1);
      if (barA) barA.style.width = `${(a / maxVal) * 100}%`;
      if (barB) barB.style.width = `${(b / maxVal) * 100}%`;

      if (labelA) labelA.textContent = `Start heute · ${years} Jahre`;
      if (labelB) labelB.textContent = delay > 0 ? `Start in ${delay} Jahr${delay === 1 ? '' : 'en'} · ${years - delay} Jahre` : `Start heute · ${years} Jahre`;

      last = { a, b, diff };
    }

    [inRate, inYears, inReturn, inDelay].forEach((el) => {
      el?.addEventListener('input', compute);
      el?.addEventListener('change', compute);
    });

    if ('IntersectionObserver' in window && !reduceMotion) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            last = { a: 0, b: 0, diff: 0 };
            compute();
            io.unobserve(entry.target);
          });
        },
        { threshold: 0.25 }
      );
      io.observe(root);
    }
    compute();
  }

  /* ------------------------------------------------------------
     5) Roadmap – Tab-Phasen (wie „Wachstum“ auf Selbstständigkeit)
     ------------------------------------------------------------ */

  function initVmaGrowth() {
    const root = document.querySelector('[data-vma-growth]');
    if (!root) return;

    const tabs = Array.from(root.querySelectorAll('[data-vma-growth-tab]'));
    const panels = Array.from(root.querySelectorAll('[data-vma-growth-panel]'));
    if (!tabs.length || !panels.length) return;

    function activate(key, focusTab) {
      tabs.forEach((btn) => {
        const active = btn.getAttribute('data-vma-growth-tab') === key;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
        btn.setAttribute('tabindex', active ? '0' : '-1');
      });
      panels.forEach((panel) => {
        const active = panel.getAttribute('data-vma-growth-panel') === key;
        panel.classList.toggle('is-active', active);
        if (active) panel.removeAttribute('hidden');
        else panel.setAttribute('hidden', '');
      });
      if (focusTab) {
        const next = tabs.find((t) => t.getAttribute('data-vma-growth-tab') === key);
        if (next) next.focus();
      }
    }

    tabs.forEach((btn) => {
      btn.addEventListener('click', () => activate(btn.getAttribute('data-vma-growth-tab') || '1'));
      btn.addEventListener('keydown', (ev) => {
        const navKeys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
        if (!navKeys.includes(ev.key)) return;
        ev.preventDefault();
        const idx = tabs.indexOf(btn);
        let nextIdx;
        if (ev.key === 'Home') nextIdx = 0;
        else if (ev.key === 'End') nextIdx = tabs.length - 1;
        else if (ev.key === 'ArrowRight') nextIdx = (idx + 1) % tabs.length;
        else nextIdx = (idx - 1 + tabs.length) % tabs.length;
        const nextKey = tabs[nextIdx].getAttribute('data-vma-growth-tab') || '1';
        activate(nextKey, true);
      });
    });

    const initial = tabs.find((t) => t.classList.contains('is-active')) || tabs[0];
    activate(initial.getAttribute('data-vma-growth-tab') || '1');
  }

  /* ------------------------------------------------------------
     6) Hero-Parallax (sehr dezent)
     ------------------------------------------------------------ */

  function initVmaHeroParallax() {
    const hero = document.querySelector('.vma-hero[data-parallax]');
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

  /* ------------------------------------------------------------
     Init
     ------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    initVmaCheck();
    initVmaSavings();
    initVmaWaiting();
    initVmaGrowth();
    initVmaHeroParallax();
  });
})();
