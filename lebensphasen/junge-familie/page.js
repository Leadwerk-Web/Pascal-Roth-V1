/* =========================================================
   Pascal Roth · Lebensphase Junge Familie
   Seitenspezifisches JS:
   - Familien-Sicherheitscheck (8 Fragen, dynamische Auswertung)
   - Einkommensausfall-Rechner (live)
   - Donut-Chart „Familien-Verpflichtungen" mit Miete/Eigenheim-Toggle
   - Dezenter Hero-Parallax
   - Portrait „Kommt euch das bekannt vor?": Hochfahren bei Scroll-in
   - Roadmap: horizontale Leiste, Pfeile, Punkte, Drag; ohne Scrollbalken
   Respektiert prefers-reduced-motion.
   ========================================================= */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    initFamCheck();
    initFamCalculator();
    initFamLoadChart();
    initFamHeroParallax();
    initFamPortraitRiseOnScroll();
    initFamRoadmapStrip();
  });

  /* =========================================================
     Hilfsfunktionen
     ========================================================= */

  const numberFormatter = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
  function formatNumber(value) { return numberFormatter.format(Math.round(value)); }

  function animateNumber(el, from, to, duration = 700, formatter) {
    if (!el) return;
    const fmt = typeof formatter === 'function' ? formatter : formatNumber;
    if (reduceMotion || duration <= 0) {
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
     FAMILIEN-CHECK
     - 8 Ja/Nein/Teils-Fragen
     - Score: 'ja' = 1, 'teils' = 0.5, 'nein' = 0
     - Anpassbar: FAM_CHECK_QUESTIONS unten austauschen.
     ========================================================= */

  /**
   * @typedef {{
   *   id: string,
   *   question: string,
   *   sub?: string,
   *   options: { value: 'ja' | 'teils' | 'nein', label: string }[],
   *   topic: string
   * }} FamCheckQuestion
   *
   * @type {FamCheckQuestion[]}
   */
  const FAM_CHECK_QUESTIONS = [
    {
      id: 'kinder',
      question: 'Gibt es Kinder im Haushalt?',
      sub: 'Egal ob ein, zwei oder mehr – das verändert die Prioritäten oft deutlich.',
      options: [
        { value: 'ja',    label: 'Ja, schon' },
        { value: 'teils', label: 'Eines unterwegs / geplant' },
        { value: 'nein',  label: 'Noch nicht' }
      ],
      topic: 'Familie'
    },
    {
      id: 'einkommen',
      question: 'Wie ist euer Einkommen aufgestellt?',
      sub: 'Zwei Einkommen geben Stabilität – ein Einkommen verlangt mehr Schutz.',
      options: [
        { value: 'ja',    label: 'Zwei sichere Einkommen' },
        { value: 'teils', label: 'Eines voll, eines teilweise' },
        { value: 'nein',  label: 'Ein Einkommen trägt alles' }
      ],
      topic: 'Einkommen'
    },
    {
      id: 'wohnen',
      question: 'Eigenheim oder laufende Finanzierung?',
      sub: 'Eine Finanzierung verändert die Absicherung deutlich.',
      options: [
        { value: 'ja',    label: 'Mietwohnung, kein Kredit' },
        { value: 'teils', label: 'Eigenheim ohne Kredit' },
        { value: 'nein',  label: 'Eigenheim mit Finanzierung' }
      ],
      topic: 'Wohnen'
    },
    {
      id: 'reserven',
      question: 'Gibt es Rücklagen für 3–6 Monate?',
      sub: 'Ein Notgroschen ist die wichtigste finanzielle Basis – noch vor Versicherungen.',
      options: [
        { value: 'ja',    label: 'Ja, fest auf der Seite' },
        { value: 'teils', label: 'Wir bauen sie gerade auf' },
        { value: 'nein',  label: 'Noch nicht wirklich' }
      ],
      topic: 'Rücklagen'
    },
    {
      id: 'ausfall',
      question: 'Ist geklärt, was bei längerem Ausfall passiert?',
      sub: 'Krankheit, Unfall, Job-Aus: Wer trägt die Familie, wenn ein Einkommen fehlt?',
      options: [
        { value: 'ja',    label: 'Ja, das ist abgesichert' },
        { value: 'teils', label: 'Teilweise – aber lückenhaft' },
        { value: 'nein',  label: 'Wir haben das offen gelassen' }
      ],
      topic: 'Einkommensschutz'
    },
    {
      id: 'kinderVorsorge',
      question: 'Habt ihr Vorsorge für die Kinder eingerichtet?',
      sub: 'Sparplan, Ausbildung, langfristige Rücklage – muss nicht groß sein, aber strukturiert.',
      options: [
        { value: 'ja',    label: 'Ja, läuft bereits' },
        { value: 'teils', label: 'Etwas, aber unsystematisch' },
        { value: 'nein',  label: 'Noch nicht' }
      ],
      topic: 'Kinder-Vorsorge'
    },
    {
      id: 'altersvorsorge',
      question: 'Gibt es eine strukturierte Altersvorsorge?',
      sub: 'Auch im Familienalltag wichtig: Was läuft im Hintergrund für später mit?',
      options: [
        { value: 'ja',    label: 'Ja, klar geplant' },
        { value: 'teils', label: 'Etwas, aber unklar' },
        { value: 'nein',  label: 'Noch nicht angegangen' }
      ],
      topic: 'Altersvorsorge'
    },
    {
      id: 'vertraege',
      question: 'Habt ihr Überblick über bestehende Verträge?',
      sub: 'Versicherungen, Sparpläne, Konten: Wisst ihr, was läuft und ob es noch passt?',
      options: [
        { value: 'ja',    label: 'Ja, sortiert' },
        { value: 'teils', label: 'Teilweise – nicht alles' },
        { value: 'nein',  label: 'Eher nicht' }
      ],
      topic: 'Überblick'
    }
  ];

  /**
   * Auswertung: Score in 0..8, dazu drei Kategorien.
   * Themen mit niedriger Punktzahl werden als "Lohnt-sich-Tags" angezeigt.
   */
  function evaluateFamCheck(answers) {
    const total = FAM_CHECK_QUESTIONS.length;
    let score = 0;
    const openTopics = [];

    FAM_CHECK_QUESTIONS.forEach((q) => {
      const a = answers[q.id];
      if (a === undefined || a === null) return;
      if (a === 'ja') score += 1;
      else if (a === 'teils') score += 0.5;
      if (a !== 'ja') openTopics.push(q.topic);
    });

    let category, title, text;
    if (score >= total * 0.75) {
      category = 'good';
      title = 'Schon gut sortiert.';
      text = 'Ihr habt viele wichtige Themen schon im Blick. Trotzdem lohnt sich ein zweiter Blick auf Details, die im Alltag oft untergehen – und das kostet euch nichts.';
    } else if (score >= total * 0.45) {
      category = 'mixed';
      title = 'Ein paar wichtige Punkte sind offen.';
      text = 'Vieles passt schon. Bei einzelnen Themen lohnt es sich, noch mal hinzuschauen – damit aus Bauchgefühl ein klarer Plan wird.';
    } else {
      category = 'open';
      title = 'Hier lohnt sich ein gemeinsamer Blick.';
      text = 'Ihr habt einiges, das noch unstrukturiert läuft. Genau dort starten wir am liebsten – ohne Druck und in eurem Tempo.';
    }

    return {
      score: Math.round(score * 10) / 10,
      total,
      category,
      title,
      text,
      openTopics: openTopics.slice(0, 6)
    };
  }

  function initFamCheck() {
    const root = document.querySelector('[data-fam-check]');
    if (!root) return;

    const stage           = root.querySelector('[data-fam-stage]');
    const backBtn         = root.querySelector('[data-fam-back]');
    const progressCurrent = root.querySelector('[data-fam-progress-current]');
    const progressTotal   = root.querySelector('[data-fam-progress-total]');
    const dotsContainer   = root.querySelector('[data-fam-dots]');
    const scoreEl         = root.querySelector('[data-fam-scale-score]');
    const scaleFill       = root.querySelector('[data-fam-scale-fill]');
    const scalePin        = root.querySelector('[data-fam-scale-pin]');

    if (!stage || !scaleFill || !scalePin) return;

    const total = FAM_CHECK_QUESTIONS.length;
    if (progressTotal) progressTotal.textContent = total;

    /** @type {Record<string, 'ja' | 'teils' | 'nein'>} */
    const answers = {};
    let currentIndex = 0;
    let lastScore = 0;
    /** @type {'questions' | 'finish'} */
    let phase = 'questions';

    /* ---------- Step-Dots ---------- */
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
        const q = FAM_CHECK_QUESTIONS[i];
        const answered = q && answers[q.id] !== undefined;
        dot.classList.toggle('is-done', answered);
      });
    }

    function renderProgress() {
      if (progressCurrent) progressCurrent.textContent = Math.min(currentIndex + 1, total);
    }

    /* ---------- Skala (Klarheitsgrad) ---------- */
    function setScale(score) {
      const pct = Math.max(0, Math.min(100, (score / total) * 100));
      scaleFill.style.width = pct + '%';
      scalePin.style.left = pct + '%';
    }

    /* ---------- Stage-Transitions ---------- */
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

    /* ---------- Frage-View ---------- */
    function renderQuestion(index, options = {}) {
      phase = 'questions';
      const q = FAM_CHECK_QUESTIONS[index];
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

        backBtn.disabled = index === 0;
        renderProgress();
        renderDots();
      };

      if (options.skipTransition) paint();
      else withTransition(paint);
    }

    /* ---------- Antwort wählen ---------- */
    function selectOption(questionId, value) {
      answers[questionId] = value;

      // sofortiges visuelles Feedback in der aktuellen Frage
      const opts = stage.querySelectorAll('.fam-check__option');
      const q = FAM_CHECK_QUESTIONS[currentIndex];
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

    /* ---------- Ergebnis-View ---------- */
    function renderFinish() {
      phase = 'finish';
      backBtn.disabled = false;

      const result = evaluateFamCheck(answers);
      lastScore = result.score;
      setScale(result.score);
      if (scoreEl) scoreEl.textContent = formatScore(result.score);

      withTransition(() => {
        stage.innerHTML = '';
        const wrap = document.createElement('div');
        wrap.className = 'fam-check__finish';

        const eyebrow = document.createElement('span');
        eyebrow.className = 'fam-check__result-eyebrow';
        eyebrow.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Euer Ergebnis';
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

          result.openTopics.forEach(topic => {
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
        cta.href = '#fam-kontakt';
        cta.innerHTML = 'Familien-Check mit Pascal anfragen <span aria-hidden="true">→</span>';
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
        if (progressCurrent) progressCurrent.textContent = total;
      });
    }

    /* ---------- Live-Score (während der Fragen) ---------- */
    function updateLiveScore() {
      const result = evaluateFamCheck(answers);
      animateNumber(scoreEl, lastScore, result.score, 450, formatScore);
      lastScore = result.score;
      setScale(result.score);
    }

    function formatScore(value) {
      const rounded = Math.round(value * 10) / 10;
      // ganzzahlige Zwischenwerte ohne Komma anzeigen
      return Number.isInteger(rounded) ? String(rounded) : rounded.toString().replace('.', ',');
    }

    /* ---------- Reset ---------- */
    function resetCheck() {
      Object.keys(answers).forEach(k => delete answers[k]);
      currentIndex = 0;
      lastScore = 0;
      phase = 'questions';
      setScale(0);
      if (scoreEl) scoreEl.textContent = '0';
      renderQuestion(0);
    }

    /* ---------- Zurück-Button ---------- */
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

    /* ---------- Tastatur-Shortcuts ---------- */
    document.addEventListener('keydown', (e) => {
      const active = document.activeElement;
      if (active && /^(input|textarea|select)$/i.test(active.tagName)) return;
      if (!isFamCheckInView()) return;
      if (phase !== 'questions') return;

      if (e.key === '1' || e.key === '2' || e.key === '3') {
        const i = Number(e.key) - 1;
        const q = FAM_CHECK_QUESTIONS[currentIndex];
        if (q && q.options[i]) {
          e.preventDefault();
          selectOption(q.id, q.options[i].value);
        }
      }
      if (e.key === 'Backspace' && !backBtn.disabled) {
        e.preventDefault();
        goBack();
      }
    });

    function isFamCheckInView() {
      const rect = root.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    }

    /* ---------- Init ---------- */
    buildDots();
    renderQuestion(0, { skipTransition: true });
    setScale(0);
  }


  /* =========================================================
     EINKOMMENSAUSFALL-RECHNER
     - Live-Update: Lücke / Versorgung / Monate
     - Visualisierung: Balken auf Skala 0–12 Monate (>12 = "über 12 M.")
     ========================================================= */
  function initFamCalculator() {
    const root = document.querySelector('[data-fam-calc]');
    if (!root) return;

    const netNumber     = root.querySelector('[data-fam-net-number]');
    const netRange      = root.querySelector('[data-fam-net-range]');
    const netLabel      = root.querySelector('[data-fam-net-label]');

    const fixNumber     = root.querySelector('[data-fam-fix-number]');
    const fixRange      = root.querySelector('[data-fam-fix-range]');
    const fixLabel      = root.querySelector('[data-fam-fix-label]');

    const kidsNumber    = root.querySelector('[data-fam-kids-number]');
    const kidsRange     = root.querySelector('[data-fam-kids-range]');
    const kidsLabel     = root.querySelector('[data-fam-kids-label]');

    const reserveNumber = root.querySelector('[data-fam-reserve-number]');
    const reserveRange  = root.querySelector('[data-fam-reserve-range]');
    const reserveLabel  = root.querySelector('[data-fam-reserve-label]');

    const lossNumber    = root.querySelector('[data-fam-loss-number]');
    const lossRange     = root.querySelector('[data-fam-loss-range]');
    const lossLabel     = root.querySelector('[data-fam-loss-label]');

    const outMonths     = root.querySelector('[data-fam-out-months]');
    const outMonthsUnit = root.querySelector('[data-fam-out-months-unit]');
    const outGap        = root.querySelector('[data-fam-out-gap]');
    const outRemaining  = root.querySelector('[data-fam-out-remaining]');
    const outMessage    = root.querySelector('[data-fam-out-message]');
    const timelineFill  = root.querySelector('[data-fam-timeline-fill]');
    const timelineLabel = root.querySelector('[data-fam-timeline-label]');

    const state = {
      net: 4500,
      fix: 3200,
      kids: 1,
      reserve: 10000,
      loss: 50
    };

    let lastMonths = 0;
    let lastGap = 0;
    let lastRemaining = 0;

    function clampInt(raw, min, max) {
      const n = parseInt(raw, 10);
      if (isNaN(n)) return min;
      return Math.max(min, Math.min(max, n));
    }

    function syncRange(rangeEl, min, max, value) {
      if (!rangeEl) return;
      const clamped = Math.max(min, Math.min(max, value));
      const p = ((clamped - min) / (max - min)) * 100;
      rangeEl.style.setProperty('--p', p + '%');
    }

    function recalc() {
      const lossEuro = state.net * (state.loss / 100);
      const remaining = Math.max(0, state.net - lossEuro);
      const gap = Math.max(0, state.fix - remaining);
      const months = gap > 0 ? state.reserve / gap : 99;

      // Display: maximal "12+" anzeigen
      const displayMonths = Math.min(months, 12);
      const monthsRounded = Math.max(0, Math.round(months * 10) / 10);
      const showOverflow = months > 12;

      animateNumber(outMonths, lastMonths, showOverflow ? 12 : monthsRounded, 500);
      lastMonths = showOverflow ? 12 : monthsRounded;

      if (outMonthsUnit) {
        if (gap === 0) outMonthsUnit.textContent = 'keine Lücke';
        else if (showOverflow) outMonthsUnit.textContent = 'Monate +';
        else if (monthsRounded === 1) outMonthsUnit.textContent = 'Monat';
        else outMonthsUnit.textContent = 'Monate';
      }

      animateNumber(outGap, lastGap, gap, 500);
      animateNumber(outRemaining, lastRemaining, remaining, 500);
      lastGap = gap;
      lastRemaining = remaining;

      // Timeline: 0–12 Monate Skala
      const fillPct = Math.min(100, (displayMonths / 12) * 100);
      if (timelineFill) timelineFill.style.width = fillPct + '%';
      if (timelineLabel) {
        if (gap === 0) timelineLabel.textContent = 'keine Lücke';
        else if (showOverflow) timelineLabel.textContent = '12+ Monate';
        else timelineLabel.textContent = `${monthsRounded.toFixed(monthsRounded < 10 ? 1 : 0)} Monate`;
        timelineLabel.style.left = fillPct + '%';
      }

      // Empfehlungstext
      if (outMessage) {
        if (gap === 0) {
          outMessage.textContent = 'Sehr gut: euer verbleibendes Einkommen deckt eure Fixkosten ab. Trotzdem lohnt sich ein Polster für unerwartete Kosten.';
        } else if (months >= 6) {
          outMessage.textContent = 'Solides Polster: eure Rücklagen tragen mehrere Monate. Wir schauen, ob ihr zusätzlich Einkommensschutz braucht – oder lieber Geld investiert.';
        } else if (months >= 3) {
          outMessage.textContent = 'Ein realistisches Risiko: eure Rücklagen tragen einige Monate. Bei längerem Ausfall wird es eng – ein gezielter Einkommensschutz wäre sinnvoll.';
        } else {
          outMessage.textContent = 'Hier lohnt sich ein gemeinsamer Blick: eure Rücklagen tragen kürzer als typische Ausfälle dauern. Wir prüfen Polster und Einkommensschutz.';
        }
      }

      // Range-Progress
      syncRange(netRange, 1500, 15000, state.net);
      syncRange(fixRange, 500, 12000, state.fix);
      syncRange(kidsRange, 0, 6, state.kids);
      syncRange(reserveRange, 0, 100000, state.reserve);
      syncRange(lossRange, 20, 100, state.loss);

      // Live-Labels
      if (netLabel)     netLabel.textContent     = `${formatNumber(state.net)} €`;
      if (fixLabel)     fixLabel.textContent     = `${formatNumber(state.fix)} €`;
      if (kidsLabel)    kidsLabel.textContent    = String(state.kids);
      if (reserveLabel) reserveLabel.textContent = `${formatNumber(state.reserve)} €`;
      if (lossLabel)    lossLabel.textContent    = `${state.loss}\u00a0%`;
    }

    function setNet(v, source) {
      state.net = clampInt(v, 1500, 15000);
      // Fixkosten dürfen das Netto leicht übersteigen, aber wir cappen den Slider
      if (state.fix > state.net + 2000) {
        state.fix = state.net + 2000;
        if (fixNumber) fixNumber.value = state.fix;
        if (fixRange) fixRange.value = state.fix;
      }
      if (source !== 'number' && netNumber) netNumber.value = state.net;
      if (source !== 'range' && netRange) netRange.value = state.net;
      recalc();
    }

    function setFix(v, source) {
      state.fix = clampInt(v, 500, 12000);
      if (source !== 'number' && fixNumber) fixNumber.value = state.fix;
      if (source !== 'range' && fixRange) fixRange.value = state.fix;
      recalc();
    }

    function setKids(v, source) {
      state.kids = clampInt(v, 0, 6);
      if (source !== 'number' && kidsNumber) kidsNumber.value = state.kids;
      if (source !== 'range' && kidsRange) kidsRange.value = state.kids;
      recalc();
    }

    function setReserve(v, source) {
      state.reserve = clampInt(v, 0, 100000);
      if (source !== 'number' && reserveNumber) reserveNumber.value = state.reserve;
      if (source !== 'range' && reserveRange) reserveRange.value = state.reserve;
      recalc();
    }

    function setLoss(v, source) {
      state.loss = clampInt(v, 20, 100);
      if (source !== 'number' && lossNumber) lossNumber.value = state.loss;
      if (source !== 'range' && lossRange) lossRange.value = state.loss;
      recalc();
    }

    // Listeners
    netRange?.addEventListener('input', e => setNet(e.target.value, 'range'));
    netNumber?.addEventListener('input', e => setNet(e.target.value, 'number'));
    netNumber?.addEventListener('blur',  e => setNet(e.target.value, 'number'));

    fixRange?.addEventListener('input', e => setFix(e.target.value, 'range'));
    fixNumber?.addEventListener('input', e => setFix(e.target.value, 'number'));
    fixNumber?.addEventListener('blur',  e => setFix(e.target.value, 'number'));

    kidsRange?.addEventListener('input', e => setKids(e.target.value, 'range'));
    kidsNumber?.addEventListener('input', e => setKids(e.target.value, 'number'));
    kidsNumber?.addEventListener('blur',  e => setKids(e.target.value, 'number'));

    reserveRange?.addEventListener('input', e => setReserve(e.target.value, 'range'));
    reserveNumber?.addEventListener('input', e => setReserve(e.target.value, 'number'));
    reserveNumber?.addEventListener('blur',  e => setReserve(e.target.value, 'number'));

    lossRange?.addEventListener('input', e => setLoss(e.target.value, 'range'));
    lossNumber?.addEventListener('input', e => setLoss(e.target.value, 'number'));
    lossNumber?.addEventListener('blur',  e => setLoss(e.target.value, 'number'));

    // Initial
    if (netNumber) netNumber.value = state.net;
    if (netRange)  netRange.value  = state.net;
    if (fixNumber) fixNumber.value = state.fix;
    if (fixRange)  fixRange.value  = state.fix;
    if (kidsNumber) kidsNumber.value = state.kids;
    if (kidsRange)  kidsRange.value  = state.kids;
    if (reserveNumber) reserveNumber.value = state.reserve;
    if (reserveRange)  reserveRange.value  = state.reserve;
    if (lossNumber) lossNumber.value = state.loss;
    if (lossRange)  lossRange.value  = state.loss;

    recalc();

    // Beim Sichtbarwerden: sanftes "Heranzählen" ab 0
    if ('IntersectionObserver' in window && !reduceMotion) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          lastMonths = 0;
          lastGap = 0;
          lastRemaining = 0;
          recalc();
          io.unobserve(entry.target);
        });
      }, { threshold: 0.3 });
      io.observe(root);
    }
  }


  /* =========================================================
     DONUT-CHART „FAMILIEN-VERPFLICHTUNGEN"
     - Toggle: Mietwohnung / Eigenheim
     - Hover/Focus auf Cards hebt Segment hervor
     ========================================================= */
  function initFamLoadChart() {
    const chart = document.querySelector('[data-fam-load-chart]');
    if (!chart) return;

    const segments = chart.querySelectorAll('.fam-load__segment');
    const cards = document.querySelectorAll('[data-fam-load-card]');
    const toggleBtns = document.querySelectorAll('[data-fam-load-mode]');
    const centerNumber = document.querySelector('[data-fam-load-center]');
    const centerCount = document.querySelector('[data-fam-load-center-count]');

    if (centerCount) centerCount.textContent = String(segments.length);

    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    let mode = 'miete';

    function valueOf(el, m) {
      const raw = el.dataset[m] ?? el.getAttribute(`data-${m}`);
      return parseFloat(raw || '0');
    }

    function drawChart() {
      let cumulative = 0;
      segments.forEach(seg => {
        const value = valueOf(seg, mode);
        const length = (value / 100) * circumference;
        seg.style.strokeDasharray = `${length} ${circumference}`;
        seg.style.strokeDashoffset = `-${cumulative}`;
        cumulative += length;
      });
    }

    function updateCards() {
      cards.forEach(card => {
        const valueEl = card.querySelector('[data-fam-load-value]');
        if (!valueEl) return;
        const target = valueOf(card, mode);
        const current = parseFloat(valueEl.dataset.last || '0');
        animateNumber(valueEl, current, target, 600);
        valueEl.dataset.last = String(target);
        // % anhängen, sobald Animation fertig
        const finishAt = reduceMotion ? 0 : 620;
        setTimeout(() => { valueEl.textContent = target + ' %'; }, finishAt);
      });
    }

    function setMode(newMode) {
      if (newMode === mode) return;
      mode = newMode;
      toggleBtns.forEach(btn => {
        const active = btn.dataset.famLoadMode === mode;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      drawChart();
      updateCards();
    }

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => setMode(btn.dataset.famLoadMode));
    });

    // Initial: Segmente leer
    segments.forEach(seg => {
      seg.style.strokeDasharray = `0 ${circumference}`;
    });

    // Card-Hover hebt Segment hervor
    cards.forEach(card => {
      const key = card.dataset.famLoadCard;
      if (!key) return;
      const seg = chart.querySelector(`[data-fam-load-key="${key}"]`);
      if (!seg) return;
      const enter = () => seg.classList.add('is-highlight');
      const leave = () => seg.classList.remove('is-highlight');
      card.addEventListener('mouseenter', enter);
      card.addEventListener('mouseleave', leave);
      card.addEventListener('focusin', enter);
      card.addEventListener('focusout', leave);
    });

    // Beim Sichtbarwerden: einmalig zeichnen + Cards animieren
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          if (reduceMotion) {
            drawChart();
            updateCards();
          } else {
            requestAnimationFrame(() => {
              drawChart();
              updateCards();
            });
          }
          io.unobserve(entry.target);
        });
      }, { threshold: 0.3 });
      io.observe(chart);
    } else {
      drawChart();
      updateCards();
    }
  }


  /* =========================================================
     PORTRAIT „Kommt euch das bekannt vor?": Hochfahren bei Scroll-in
     ========================================================= */
  function initFamPortraitRiseOnScroll() {
    const root = document.querySelector('[data-fam-portrait-rise]');
    if (!root) return;

    if (reduceMotion) {
      root.classList.add('is-visible');
      return;
    }

    const markVisible = () => root.classList.add('is-visible');

    if (!('IntersectionObserver' in window)) {
      markVisible();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
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
     ROADMAP: horizontale Leiste, Pfeile, Punkte, Drag, kein Scrollbalken
     ========================================================= */
  function initFamRoadmapStrip() {
    const frame = document.querySelector('[data-fam-roadmap-strip]');
    if (!frame) return;

    const scroller = frame.querySelector('.fam-roadmap-strip__scroller');
    const steps = scroller
      ? Array.from(scroller.querySelectorAll('.fam-roadmap-strip__step'))
      : [];
    const prevBtn = frame.querySelector('.fam-roadmap-strip__nav--prev');
    const nextBtn = frame.querySelector('.fam-roadmap-strip__nav--next');
    const dotsWrap = frame.querySelector('[data-fam-roadmap-dots]');
    const dots = dotsWrap
      ? Array.from(dotsWrap.querySelectorAll('[data-fam-roadmap-dot]'))
      : [];

    if (!scroller || steps.length === 0 || !prevBtn || !nextBtn) return;

    function scrollIntoForIndex(i) {
      const last = steps.length - 1;
      let inline = 'center';
      if (i === 0) inline = 'start';
      else if (i === last) inline = 'end';
      return {
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'nearest',
        inline,
      };
    }

    function nearestIndex() {
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      const eps = 8;
      const left = scroller.scrollLeft;
      if (left <= eps) return 0;
      if (left >= maxScroll - eps) return steps.length - 1;

      const center = left + scroller.clientWidth * 0.5;
      let best = 0;
      let bestDist = Infinity;
      steps.forEach((step, i) => {
        const mid = step.offsetLeft + step.offsetWidth / 2;
        const d = Math.abs(mid - center);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      return best;
    }

    function goToIndex(idx) {
      const i = Math.max(0, Math.min(steps.length - 1, idx));
      steps[i].scrollIntoView(scrollIntoForIndex(i));
    }

    function go(delta) {
      const i = nearestIndex();
      goToIndex(i + delta);
    }

    function syncDots(activeIdx) {
      if (!dots.length) return;
      dots.forEach((dot, i) => {
        const on = i === activeIdx;
        dot.classList.toggle('is-active', on);
        dot.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }

    function updateState() {
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      const eps = 6;
      const left = scroller.scrollLeft;
      const noOverflow = maxScroll <= eps;
      frame.classList.toggle('fam-roadmap-strip__frame--no-overflow', noOverflow);
      if (noOverflow) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        syncDots(nearestIndex());
        return;
      }
      prevBtn.disabled = left <= eps;
      nextBtn.disabled = left >= maxScroll - eps;
      syncDots(nearestIndex());
    }

    let scrollRaf = 0;
    function onScroll() {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        updateState();
      });
    }

    prevBtn.addEventListener('click', () => go(-1));
    nextBtn.addEventListener('click', () => go(1));

    if (dotsWrap) {
      dotsWrap.addEventListener('click', (e) => {
        const dot = e.target.closest('[data-fam-roadmap-dot]');
        if (!dot) return;
        const idx = parseInt(dot.getAttribute('data-fam-roadmap-dot'), 10);
        if (!Number.isNaN(idx)) goToIndex(idx);
      });
    }

    /* Drag mit Maus / Stift (Touch scrollt weiterhin horizontal) */
    const drag = { id: null, x: 0, scroll: 0 };
    function endDrag(e) {
      if (drag.id === null || e.pointerId !== drag.id) return;
      try {
        scroller.releasePointerCapture(drag.id);
      } catch (_) {
        /* ignore */
      }
      scroller.classList.remove('is-dragging');
      drag.id = null;
    }

    scroller.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      if (e.button !== 0) return;
      drag.id = e.pointerId;
      drag.x = e.clientX;
      drag.scroll = scroller.scrollLeft;
      scroller.classList.add('is-dragging');
      try {
        scroller.setPointerCapture(e.pointerId);
      } catch (_) {
        drag.id = null;
        scroller.classList.remove('is-dragging');
      }
    });

    scroller.addEventListener('pointermove', (e) => {
      if (drag.id === null || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      scroller.scrollLeft = drag.scroll - dx;
    });

    scroller.addEventListener('pointerup', endDrag);
    scroller.addEventListener('pointercancel', endDrag);

    scroller.addEventListener('scroll', onScroll, { passive: true });
    scroller.addEventListener('scrollend', updateState, { passive: true });

    window.addEventListener('resize', updateState, { passive: true });

    updateState();
  }


  /* =========================================================
     HERO PARALLAX (dezent, performant)
     ========================================================= */
  function initFamHeroParallax() {
    const hero = document.querySelector('.fam-hero[data-parallax]');
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
      hero.style.setProperty('--fam-parallax-y', offset.toFixed(1) + 'px');
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
