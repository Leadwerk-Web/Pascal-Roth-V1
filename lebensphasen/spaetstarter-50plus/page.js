/* Pascal Roth · Lebensphase Spätstarter 50+ (Namespace vma-*, page-scoped)
   Diese Seite basiert technisch auf der Vermögen-aufbauen-Seite.
   - Klarheitscheck wie „Familien-Check“ (8 Fragen, Skala, Tasten 1–3)
   - Beispielrechner: „Was ist bis zur Rente noch möglich?“ (Sparplan)
   PLATZHALTER: Default-Werte und Renditen im Rechner sind redaktionelle
   Beispielwerte und müssen vor Veröffentlichung fachlich geprüft werden. */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const numberFmt = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
  const moneyFmt = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  });

  function formatInt(n) { return numberFmt.format(Math.round(n)); }
  function formatMoney(n) { return moneyFmt.format(Math.round(n)); }

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

  function readNum(el, fb) {
    const n = parseFloat(el?.value);
    return Number.isFinite(n) ? n : fb;
  }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  /* ------------------------------------------------------------
     1) Spätstarter-Klarheitscheck (wie Familien-Check: 8 Fragen, Skala)
     ------------------------------------------------------------ */

  const SP50_FAM_CHECK_QUESTIONS = [
    {
      id: 'rente-info',
      question: 'Kennst du deine voraussichtliche gesetzliche Rente?',
      sub: 'Renteninformation oder Online-Renteninformation – ungefähr reicht fürs Bauchgefühl.',
      options: [
        { value: 'ja', label: 'Ja, ungefähr' },
        { value: 'teils', label: 'Nur grob / veraltet' },
        { value: 'nein', label: 'Nein, noch nicht' },
      ],
      topic: 'Gesetzliche Rente',
    },
    {
      id: 'ruhestand-ausgaben',
      question: 'Hast du deine Ausgaben im Ruhestand schon durchdacht?',
      sub: 'Fixkosten, Wünsche, Reisen – grob, ohne Perfektion.',
      options: [
        { value: 'ja', label: 'Ja, grob kalkuliert' },
        { value: 'teils', label: 'Nur Einzelposten' },
        { value: 'nein', label: 'Noch nicht' },
      ],
      topic: 'Lebenshaltung',
    },
    {
      id: 'vorsorge',
      question: 'Wie steht es um private Altersvorsorge oder aufgebautes Vermögen?',
      sub: 'Depots, Riester/Rürup, Immobilie, bAV – was auch immer bei dir zählt.',
      options: [
        { value: 'ja', label: 'Mehrere Bausteine, Überblick' },
        { value: 'teils', label: 'Etwas, aber unklar' },
        { value: 'nein', label: 'Kaum oder nichts Strukturiertes' },
      ],
      topic: 'Vorsorge & Vermögen',
    },
    {
      id: 'vertraege',
      question: 'Hast du Überblick über Verträge, Konten und laufende Kosten?',
      sub: 'Versicherungen, alte Sparverträge, Gebühren – sortiert oder Schublade?',
      options: [
        { value: 'ja', label: 'Ja, weitgehend sortiert' },
        { value: 'teils', label: 'Teilweise' },
        { value: 'nein', label: 'Eher unübersichtlich' },
      ],
      topic: 'Überblick',
    },
    {
      id: 'ruecklagen',
      question: 'Gibt es Rücklagen für unerwartete Ausgaben?',
      sub: 'Auto, Reparatur, Gesundheit – typisch 3–6 Monate Fixkosten als Richtwert.',
      options: [
        { value: 'ja', label: 'Ja, mehrere Monate abgesichert' },
        { value: 'teils', label: 'Knapp, wir bauen auf' },
        { value: 'nein', label: 'Eher nicht' },
      ],
      topic: 'Liquidität',
    },
    {
      id: 'spar-rhythmus',
      question: 'Sparst oder investierst du noch regelmäßig bis zur Rente?',
      options: [
        { value: 'ja', label: 'Ja, durchgehend' },
        { value: 'teils', label: 'Unregelmäßig' },
        { value: 'nein', label: 'Aktuell nicht' },
      ],
      topic: 'Aufbau',
    },
    {
      id: 'luecke',
      question: 'Weißt du ungefähr, wie groß deine Rentenlücke sein könnte?',
      sub: 'Wunsch-Einkommen minus voraussichtliche Einnahmen – auch nur grob.',
      options: [
        { value: 'ja', label: 'Ja, ungefähr' },
        { value: 'teils', label: 'Nur Bauchgefühl' },
        { value: 'nein', label: 'Keine Vorstellung' },
      ],
      topic: 'Rentenlücke',
    },
    {
      id: 'fahrplan',
      question: 'Hast du einen Fahrplan für die nächsten Jahre bis zur Rente?',
      sub: 'Inkl. Themen wie Pflege, Immobilie oder Familie – auch nur im Kopf.',
      options: [
        { value: 'ja', label: 'Ja, grob oder schriftlich' },
        { value: 'teils', label: 'Im Kopf, aber lückenhaft' },
        { value: 'nein', label: 'Nein' },
      ],
      topic: 'Strategie',
    },
  ];

  function evaluateSp50FamCheck(answers) {
    const total = SP50_FAM_CHECK_QUESTIONS.length;
    let score = 0;
    const openTopics = [];
    SP50_FAM_CHECK_QUESTIONS.forEach((q) => {
      const a = answers[q.id];
      if (a === undefined || a === null) return;
      if (a === 'ja') score += 1;
      else if (a === 'teils') score += 0.5;
      if (a !== 'ja') openTopics.push(q.topic);
    });

    let category;
    let title;
    let text;
    if (score >= total * 0.75) {
      category = 'good';
      title = 'Schon gut sortiert.';
      text = 'Du hast viele wichtige Themen im Blick. Trotzdem lohnt sich ein ruhiger Zweitblick – besonders bei Übergängen in weniger Arbeit oder mehr Entnahme.';
    } else if (score >= total * 0.45) {
      category = 'mixed';
      title = 'Ein paar wichtige Punkte sind offen.';
      text = 'Vieles passt schon. Bei einzelnen Bausteinen lohnt es sich, noch einmal hinzuschauen – damit aus Bauchgefühl ein klarer Faden wird.';
    } else {
      category = 'open';
      title = 'Hier lohnt sich ein gemeinsamer Blick.';
      text = 'Mehrere Themen sind noch unstrukturiert – das ist normal und kein Grund zur Panik. Genau dort starte ich gern mit dir: ohne Druck und in deinem Tempo.';
    }

    return {
      score: Math.round(score * 10) / 10,
      total,
      category,
      title,
      text,
      openTopics: openTopics.slice(0, 6),
    };
  }

  function initSp50FamCheck() {
    const root = document.querySelector('[data-sp50-fam-check]');
    if (!root) return;

    const stage = root.querySelector('[data-sp50-fam-stage]');
    const backBtn = root.querySelector('[data-sp50-fam-back]');
    const progressCurrent = root.querySelector('[data-sp50-fam-progress-current]');
    const progressTotal = root.querySelector('[data-sp50-fam-progress-total]');
    const dotsContainer = root.querySelector('[data-sp50-fam-dots]');
    const scoreEl = root.querySelector('[data-sp50-fam-scale-score]');
    const scaleFill = root.querySelector('[data-sp50-fam-scale-fill]');
    const scalePin = root.querySelector('[data-sp50-fam-scale-pin]');

    if (!stage || !scaleFill || !scalePin) return;

    const total = SP50_FAM_CHECK_QUESTIONS.length;
    if (progressTotal) progressTotal.textContent = String(total);

    /** @type {Record<string, 'ja' | 'teils' | 'nein'>} */
    const answers = {};
    let currentIndex = 0;
    let lastScore = 0;
    /** @type {'questions' | 'finish'} */
    let phase = 'questions';

    function buildDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('span');
        dot.className = 'fam-check__dot';
        dotsContainer.appendChild(dot);
      }
    }

    function renderDots() {
      if (!dotsContainer) return;
      const dots = dotsContainer.querySelectorAll('.fam-check__dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', phase === 'questions' && i === currentIndex);
        const q = SP50_FAM_CHECK_QUESTIONS[i];
        const answered = q && answers[q.id] !== undefined;
        dot.classList.toggle('is-done', answered);
      });
    }

    function renderProgress() {
      if (progressCurrent) progressCurrent.textContent = String(Math.min(currentIndex + 1, total));
    }

    function setScale(score) {
      const pct = Math.max(0, Math.min(100, (score / total) * 100));
      scaleFill.style.width = `${pct}%`;
      scalePin.style.left = `${pct}%`;
    }

    function withTransition(renderFn) {
      if (reduceMotion) {
        renderFn();
        return;
      }
      stage.classList.add('fam-check__stage-anim-out');
      setTimeout(() => {
        renderFn();
        stage.classList.remove('fam-check__stage-anim-out');
        stage.classList.add('fam-check__stage-anim-in');
        setTimeout(() => stage.classList.remove('fam-check__stage-anim-in'), 380);
      }, 180);
    }

    function renderQuestion(index, options = {}) {
      phase = 'questions';
      const q = SP50_FAM_CHECK_QUESTIONS[index];
      if (!q) return;

      const paint = () => {
        stage.innerHTML = '';

        if (q.topic) {
          const topic = document.createElement('span');
          topic.className = 'fam-check__topic';
          topic.textContent = q.topic;
          stage.appendChild(topic);
        }

        const heading = document.createElement('p');
        heading.className = 'fam-check__question';
        heading.textContent = q.question;
        stage.appendChild(heading);

        if (q.sub) {
          const sub = document.createElement('p');
          sub.className = 'fam-check__sub';
          sub.textContent = q.sub;
          stage.appendChild(sub);
        }

        const opts = document.createElement('div');
        opts.className = 'fam-check__options';
        opts.setAttribute('role', 'radiogroup');
        opts.setAttribute('aria-label', q.question);

        q.options.forEach((opt, i) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'fam-check__option';
          btn.setAttribute('role', 'radio');
          btn.setAttribute('aria-checked', answers[q.id] === opt.value ? 'true' : 'false');
          if (answers[q.id] === opt.value) btn.classList.add('is-selected');

          const key = document.createElement('span');
          key.className = 'fam-check__option-key';
          key.textContent = String(i + 1);
          btn.appendChild(key);

          const label = document.createElement('span');
          label.className = 'fam-check__option-text';
          label.textContent = opt.label;
          btn.appendChild(label);

          const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          arrow.setAttribute('class', 'fam-check__option-arrow');
          arrow.setAttribute('viewBox', '0 0 24 24');
          arrow.setAttribute('fill', 'none');
          arrow.setAttribute('stroke', 'currentColor');
          arrow.setAttribute('stroke-width', '2');
          arrow.setAttribute('stroke-linecap', 'round');
          arrow.setAttribute('stroke-linejoin', 'round');
          arrow.setAttribute('aria-hidden', 'true');
          arrow.innerHTML = '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/>';
          btn.appendChild(arrow);

          btn.addEventListener('click', () => selectOption(q.id, opt.value));
          opts.appendChild(btn);
        });

        stage.appendChild(opts);

        if (backBtn) backBtn.disabled = index === 0;
        renderProgress();
        renderDots();
      };

      if (options.skipTransition) paint();
      else withTransition(paint);
    }

    function selectOption(questionId, value) {
      answers[questionId] = value;

      const opts = stage.querySelectorAll('.fam-check__option');
      const q = SP50_FAM_CHECK_QUESTIONS[currentIndex];
      opts.forEach((btn, i) => {
        const isSelected = q && q.options[i]?.value === value;
        btn.classList.toggle('is-selected', isSelected);
        btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      });

      updateLiveScore();
      renderDots();

      const delay = reduceMotion ? 0 : 320;
      setTimeout(() => {
        if (currentIndex < total - 1) {
          currentIndex += 1;
          renderQuestion(currentIndex);
        } else {
          renderFinish();
        }
      }, delay);
    }

    function formatScore(value) {
      const rounded = Math.round(value * 10) / 10;
      return Number.isInteger(rounded) ? String(rounded) : rounded.toString().replace('.', ',');
    }

    function renderFinish() {
      phase = 'finish';
      if (backBtn) backBtn.disabled = false;

      const result = evaluateSp50FamCheck(answers);
      lastScore = result.score;
      setScale(result.score);
      if (scoreEl) scoreEl.textContent = formatScore(result.score);

      withTransition(() => {
        stage.innerHTML = '';
        const wrap = document.createElement('div');
        wrap.className = 'fam-check__finish';

        const eyebrow = document.createElement('span');
        eyebrow.className = 'fam-check__result-eyebrow';
        eyebrow.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Dein Ergebnis';
        wrap.appendChild(eyebrow);

        const title = document.createElement('h3');
        title.className = 'fam-check__result-title';
        title.textContent = result.title;
        wrap.appendChild(title);

        const text = document.createElement('p');
        text.className = 'fam-check__result-text';
        text.textContent = result.text;
        wrap.appendChild(text);

        if (result.openTopics.length > 0) {
          const tags = document.createElement('div');
          tags.className = 'fam-check__result-tags';

          const lead = document.createElement('span');
          lead.className = 'fam-check__result-tag fam-check__result-tag--lead';
          lead.textContent = 'Mögliche Themen';
          tags.appendChild(lead);

          result.openTopics.forEach((topic) => {
            const tag = document.createElement('span');
            tag.className = 'fam-check__result-tag';
            tag.textContent = topic;
            tags.appendChild(tag);
          });
          wrap.appendChild(tags);
        }

        const actions = document.createElement('div');
        actions.className = 'fam-check__result-actions';

        const cta = document.createElement('a');
        cta.className = 'btn-primary';
        cta.href = 'tel:+4980052569960';
        cta.innerHTML = 'Gespräch mit mir anfragen <span aria-hidden="true">→</span>';
        actions.appendChild(cta);

        const restart = document.createElement('button');
        restart.type = 'button';
        restart.className = 'fam-check__restart';
        restart.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.5 15a9 9 0 1 0 2.6-9.4L1 10"/></svg> Check neu starten';
        restart.addEventListener('click', resetCheck);
        actions.appendChild(restart);

        wrap.appendChild(actions);
        stage.appendChild(wrap);
        renderDots();
        if (progressCurrent) progressCurrent.textContent = String(total);
      });
    }

    function updateLiveScore() {
      const result = evaluateSp50FamCheck(answers);
      animateNumber(scoreEl, lastScore, result.score, 450, formatScore);
      lastScore = result.score;
      setScale(result.score);
    }

    function resetCheck() {
      Object.keys(answers).forEach((k) => delete answers[k]);
      currentIndex = 0;
      lastScore = 0;
      phase = 'questions';
      setScale(0);
      if (scoreEl) scoreEl.textContent = '0';
      renderQuestion(0, { skipTransition: true });
    }

    function goBack() {
      if (phase === 'finish') {
        phase = 'questions';
        renderQuestion(currentIndex);
        return;
      }
      if (currentIndex === 0) return;
      currentIndex -= 1;
      renderQuestion(currentIndex);
    }

    backBtn.addEventListener('click', goBack);

    document.addEventListener('keydown', (e) => {
      const active = document.activeElement;
      if (active && /^(input|textarea|select)$/i.test(active.tagName)) return;
      if (!isSp50FamCheckInView()) return;
      if (phase !== 'questions') return;

      if (e.key === '1' || e.key === '2' || e.key === '3') {
        const i = Number(e.key) - 1;
        const q = SP50_FAM_CHECK_QUESTIONS[currentIndex];
        if (q && q.options[i]) {
          e.preventDefault();
          selectOption(q.id, q.options[i].value);
        }
      }
      if (e.key === 'Backspace' && backBtn && !backBtn.disabled) {
        e.preventDefault();
        goBack();
      }
    });

    function isSp50FamCheckInView() {
      const rect = root.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    }

    buildDots();
    renderQuestion(0, { skipTransition: true });
    setScale(0);
  }

  /* ------------------------------------------------------------
     2) "Was ist bis zur Rente noch möglich?" – Sparplan-Rechner
     - Eingaben: aktuelles Alter, Rentenalter, Startkapital,
       monatliche Sparrate, Renditeannahme, optionale Einmalanlage.
     - Berechnung jahresweise, vereinfachte Future-Value-Logik.
     - PLATZHALTER: Renditeannahme 4 % p.a., Default-Werte beispielhaft.
     ------------------------------------------------------------ */

  function initVmaSavings() {
    const root = document.querySelector('[data-vma-savings]');
    if (!root) return;

    const inAge = root.querySelector('[data-vma-savings-age]');
    const inRet = root.querySelector('[data-vma-savings-retage]');
    const inStart = root.querySelector('[data-vma-savings-start]');
    const inRate = root.querySelector('[data-vma-savings-rate]');
    const inReturn = root.querySelector('[data-vma-savings-return]');
    const inExtra = root.querySelector('[data-vma-savings-extra]');

    const outYears = root.querySelector('[data-vma-savings-years-out]');
    const outPaid = root.querySelector('[data-vma-savings-paid]');
    const outFinal = root.querySelector('[data-vma-savings-final]');
    const outGain = root.querySelector('[data-vma-savings-gain]');
    const barPaid = root.querySelector('[data-vma-savings-bar-paid]');
    const barGain = root.querySelector('[data-vma-savings-bar-gain]');

    let last = { paid: 0, final: 0, gain: 0, years: 0 };

    function compute() {
      const age = clamp(Math.round(readNum(inAge, 54)), 30, 80);
      const retAge = clamp(Math.round(readNum(inRet, 67)), age + 1, 80);
      const years = retAge - age;
      const start = Math.max(0, readNum(inStart, 10000));
      const rate = Math.max(0, readNum(inRate, 300));
      const r = clamp(readNum(inReturn, 4), 0, 12) / 100;
      const extra = Math.max(0, readNum(inExtra, 0));

      let kapital = start + extra;
      let paid = start + extra;
      for (let y = 0; y < years; y++) {
        const annual = rate * 12;
        kapital = (kapital + annual) * (1 + r);
        paid += annual;
      }
      const finalValue = kapital;
      const gain = finalValue - paid;

      animateNumber(outYears, last.years, years, 500, formatInt);
      animateNumber(outPaid, last.paid, paid, 700, formatMoney);
      animateNumber(outFinal, last.final, finalValue, 900, formatMoney);
      animateNumber(outGain, last.gain, gain, 800, formatMoney);

      const maxVal = Math.max(finalValue, 1);
      if (barPaid) barPaid.style.width = `${(paid / maxVal) * 100}%`;
      if (barGain) barGain.style.width = `${(finalValue / maxVal) * 100}%`;

      last = { paid, final: finalValue, gain, years };
    }

    [inAge, inRet, inStart, inRate, inReturn, inExtra].forEach((el) => {
      el?.addEventListener('input', compute);
      el?.addEventListener('change', compute);
    });

    if ('IntersectionObserver' in window && !reduceMotion) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          last = { paid: 0, final: 0, gain: 0, years: 0 };
          compute();
          io.unobserve(entry.target);
        });
      }, { threshold: 0.25 });
      io.observe(root);
    }
    compute();
  }

  /* ------------------------------------------------------------
     3) Roadmap – Tab-Phasen (5 Stellschrauben ab 50)
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
     4) Hero-Parallax (sehr dezent)
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

    window.addEventListener('scroll', () => {
      latestY = window.scrollY;
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  /* ------------------------------------------------------------
     Init
     ------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    initSp50FamCheck();
    initVmaSavings();
    initVmaGrowth();
    initVmaHeroParallax();
  });
})();
