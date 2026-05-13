/* Pascal Roth · Lebensphase Selbständige (Namespace sst-*) */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Platzhalter-Gewichte je Profil (Summe je Profil = 100). Redaktionell anpassbar. */
  const SST_PROFILE_WEIGHTS = {
    freelancer: { kv: 18, ek: 16, av: 14, liq: 20, st: 10, hf: 12, vm: 10 },
    company: { kv: 12, ek: 18, av: 18, liq: 14, st: 14, hf: 14, vm: 10 },
    craft: { kv: 14, ek: 20, av: 10, liq: 16, st: 8, hf: 22, vm: 10 },
  };

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

  function animateNumber(el, from, to, duration = 600) {
    if (!el) return;
    if (reduceMotion || duration <= 0) {
      el.textContent = formatInt(to);
      return;
    }
    const start = performance.now();
    const delta = to - from;
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = formatInt(from + delta * eased);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const SST_QUESTIONS = [
    {
      text: 'Hast du einen Überblick über deine monatlichen Fixkosten – privat und geschäftlich?',
      options: [
        { label: 'Ja', score: 10 },
        { label: 'Teils', score: 5 },
        { label: 'Nein', score: 2 },
      ],
    },
    {
      text: 'Weißt du ungefähr, wie lange deine Rücklagen dich tragen würden?',
      options: [
        { label: 'Ja', score: 10 },
        { label: 'Teils', score: 5 },
        { label: 'Nein', score: 2 },
      ],
    },
    {
      text: 'Hast du deine Krankenversicherung bewusst gewählt und grob verstanden?',
      options: [
        { label: 'Ja', score: 10 },
        { label: 'Teils', score: 5 },
        { label: 'Nein', score: 2 },
      ],
    },
    {
      text: 'Gibt es bei dir eine Idee oder Strategie für Ausfallzeiten (Krankheit, Familie, Planung)?',
      options: [
        { label: 'Ja', score: 10 },
        { label: 'Teils', score: 5 },
        { label: 'Nein', score: 2 },
      ],
    },
    {
      text: 'Ist deine Altersvorsorge aktiv geplant – oder eher „irgendwann“?',
      options: [
        { label: 'Aktiv geplant', score: 10 },
        { label: 'Teils', score: 5 },
        { label: 'Eher später', score: 2 },
      ],
    },
    {
      text: 'Hast du Haftung und berufliche Risiken für deine Branche grob sortiert?',
      options: [
        { label: 'Ja', score: 10 },
        { label: 'Teils', score: 5 },
        { label: 'Nein', score: 2 },
      ],
    },
    {
      text: 'Planst du Steuern und mögliche Nachzahlungen ein (z. B. Rücklagen)?',
      options: [
        { label: 'Ja', score: 10 },
        { label: 'Teils', score: 5 },
        { label: 'Nein', score: 2 },
      ],
    },
    {
      text: 'Kennst du die wichtigsten Eckpunkte deiner bestehenden Verträge?',
      options: [
        { label: 'Ja', score: 10 },
        { label: 'Teils', score: 5 },
        { label: 'Nein', score: 2 },
      ],
    },
    {
      text: 'Fühlst du dich bei Geld- und Absicherungsthemen informiert genug, um zu entscheiden?',
      options: [
        { label: 'Ja', score: 10 },
        { label: 'Teils', score: 5 },
        { label: 'Nein', score: 2 },
      ],
    },
    {
      text: 'Hast du eine verlässliche Anlaufstelle, um Finanzfragen zu sortieren (Berater:in, Steuer, Netzwerk)?',
      options: [
        { label: 'Ja', score: 10 },
        { label: 'Teils', score: 5 },
        { label: 'Nein', score: 2 },
      ],
    },
  ];

  function bandForScore(pct) {
    if (pct >= 80) {
      return {
        title: 'Starker Klarheitsgrad – viele Bausteine sind schon sortiert',
        body:
          '<strong>Orientierung:</strong> Du hast viele Themen bereits auf dem Schirm – das ist eine echte Stärke in der Selbständigkeit.<br><br><strong>Nächster Schritt:</strong> Jetzt geht es oft darum, Überlappungen zu prüfen und Prioritäten feinzujustieren, statt alles neu zu erfinden.<br><br><strong>Einordnung:</strong> Selbst mit gutem Überblick lohnt sich oft ein unabhängiger Sparring – ich begleite dich gern, wenn sich dein Business weiterentwickelt.',
      };
    }
    if (pct >= 60) {
      return {
        title: 'Solider Klarheitsgrad – du bist mitten im Prozess',
        body:
          '<strong>Orientierung:</strong> Du hast schon wichtige Punkte erkannt – und genau da stehen viele Selbständige.<br><br><strong>Nächster Schritt:</strong> Sinnvoll ist jetzt, Lücken und „Blindspots“ zu schließen, ohne alles auf einmal zu wollen.<br><br><strong>Einordnung:</strong> Mit einem strukturierten Check helfe ich dir dabei, die Energie auf die Themen zu lenken, die dir wirklich Ruhe geben.',
      };
    }
    if (pct >= 40) {
      return {
        title: 'Klarheit im Aufbau – das ist normal und gut bearbeitbar',
        body:
          '<strong>Orientierung:</strong> Viele Selbständige starten genau hier: viel Verantwortung, wenig Zeit für die große Übersicht.<br><br><strong>Nächster Schritt:</strong> Kleine, klare Schritte schlagen große Pakete – zuerst Liquidität und die größten Risiken sortieren.<br><br><strong>Einordnung:</strong> Dein Ergebnis ist kein Urteil, sondern eine Einladung, Struktur aufzubauen – ohne Druck und ohne Scham.',
      };
    }
    return {
      title: 'Viel Spielraum für mehr Ruhe und Struktur',
        body:
          '<strong>Orientierung:</strong> Wenn viele Fragen noch offen sind, heißt das vor allem: du hast viele Baustellen gleichzeitig – nicht, dass etwas „falsch“ ist.<br><br><strong>Nächster Schritt:</strong> Ein erster Fokus (z. B. Fixkosten + Rücklagen) schafft oft schnell mehr Handlungsspielraum.<br><br><strong>Einordnung:</strong> Genau dafür bin ich für dich da: Themen übersetzen, priorisieren und in einen Plan bringen – verständlich und ohne Verkaufsdruck.',
    };
  }

  function initSstCheck() {
    const root = document.querySelector('[data-sst-check]');
    if (!root) return;

    const stepNum = root.querySelector('[data-sst-check-step-num]');
    const progressWrap = root.querySelector('[data-sst-check-progress-wrap]');
    const progressBar = root.querySelector('[data-sst-check-progress-bar]');
    const fieldset = root.querySelector('[data-sst-check-fieldset]');
    const legend = root.querySelector('[data-sst-check-question]');
    const optionsWrap = root.querySelector('[data-sst-check-options]');
    const btnBack = root.querySelector('[data-sst-check-back]');
    const btnNext = root.querySelector('[data-sst-check-next]');
    const ringFill = root.querySelector('[data-sst-check-ring-fill]');
    const ringPct = root.querySelector('[data-sst-check-ring-pct]');
    const resultBox = root.querySelector('[data-sst-check-result]');
    const resultTitle = root.querySelector('[data-sst-check-result-title]');
    const resultText = root.querySelector('[data-sst-check-result-text]');
    const btnRestart = root.querySelector('[data-sst-check-restart]');

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
      const p = Math.max(0, Math.min(1, answeredCount / SST_QUESTIONS.length));
      if (ringFill) {
        const len = p * ringC;
        ringFill.setAttribute('stroke-dasharray', `${len} ${ringC}`);
      }
      if (ringPct) ringPct.textContent = `${Math.round(p * 100)}%`;
    }

    function setRingFromScore(pct) {
      const p = Math.max(0, Math.min(100, pct)) / 100;
      if (ringFill) {
        const len = p * ringC;
        ringFill.setAttribute('stroke-dasharray', `${len} ${ringC}`);
      }
      if (ringPct) ringPct.textContent = `${Math.round(pct)}%`;
    }

    function renderStep() {
      const q = SST_QUESTIONS[step];
      if (legend) legend.textContent = q.text;
      optionsWrap.innerHTML = '';
      const groupName = `sst-check-q${step}`;
      q.options.forEach((opt, i) => {
        const id = `${groupName}-${i}`;
        const label = document.createElement('label');
        label.className = 'sst-check__opt';
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
      if (progressBar) progressBar.style.width = `${((step + 1) / SST_QUESTIONS.length) * 100}%`;
      if (progressWrap) {
        progressWrap.setAttribute('aria-valuenow', String(step + 1));
        progressWrap.setAttribute('aria-valuemax', String(SST_QUESTIONS.length));
      }
      if (btnBack) btnBack.disabled = step === 0;
      if (btnNext) {
        btnNext.innerHTML =
          step === SST_QUESTIONS.length - 1
            ? 'Auswertung <span aria-hidden="true">→</span>'
            : 'Weiter <span aria-hidden="true">→</span>';
      }
      setRingFromProgress(answers.filter((a) => a !== undefined).length);
    }

    function showResult() {
      let sum = 0;
      answers.forEach((idx, qi) => {
        const sc = SST_QUESTIONS[qi].options[idx]?.score ?? 0;
        sum += sc;
      });
      const max = SST_QUESTIONS.length * 10;
      const pct = max > 0 ? (sum / max) * 100 : 0;
      const band = bandForScore(pct);

      root.classList.add('sst-check--result-mode');
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
        const fromPct = (answers.length / SST_QUESTIONS.length) * 100;
        const start = performance.now();
        const dur = 700;
        function frame(now) {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          const v = fromPct + (pct - fromPct) * eased;
          setRingFromScore(v);
          if (t < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      }
    }

    function hideResult() {
      root.classList.remove('sst-check--result-mode');
      if (resultBox) resultBox.classList.add('is-hidden');
    }

    function restart() {
      step = 0;
      answers.length = 0;
      hideResult();
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
      if (step < SST_QUESTIONS.length - 1) {
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

  function initSstReserve() {
    const root = document.querySelector('[data-sst-reserve]');
    if (!root) return;

    const netto = root.querySelector('[data-sst-reserve-netto]');
    const priv = root.querySelector('[data-sst-reserve-priv]');
    const biz = root.querySelector('[data-sst-reserve-biz]');
    const cash = root.querySelector('[data-sst-reserve-cash]');
    const months = root.querySelector('[data-sst-reserve-months]');
    const outTotal = root.querySelector('[data-sst-reserve-total]');
    const outCoverage = root.querySelector('[data-sst-reserve-coverage]');
    const outTarget = root.querySelector('[data-sst-reserve-target]');
    const outGap = root.querySelector('[data-sst-reserve-gap]');
    const bar = root.querySelector('[data-sst-reserve-bar]');

    function readNum(el, fallback = 0) {
      const n = parseFloat(el?.value);
      return Number.isFinite(n) ? Math.max(0, n) : fallback;
    }

    function recalc() {
      const n = readNum(netto, 0);
      const p = readNum(priv, 0);
      const b = readNum(biz, 0);
      const c = readNum(cash, 0);
      const m = Math.max(1, Math.min(36, readNum(months, 6)));

      const total = p + b;
      const coverageMonths = total > 0 ? c / total : 0;
      const target = total * m;
      const gap = target - c;

      if (outTotal) outTotal.textContent = formatMoney(total);
      if (outCoverage) {
        if (total <= 0) outCoverage.textContent = '–';
        else outCoverage.textContent = `${coverageMonths.toFixed(1).replace('.', ',')} Monate`;
      }
      if (outTarget) outTarget.textContent = formatMoney(target);
      if (outGap) outGap.textContent = formatMoney(gap);

      let barPct = 0;
      if (target > 0) barPct = Math.min(100, (c / target) * 100);
      if (bar) bar.style.width = `${barPct}%`;
    }

    [netto, priv, biz, cash, months].forEach((el) => {
      el?.addEventListener('input', recalc);
      el?.addEventListener('change', recalc);
    });

    recalc();
  }

  function initSstWorkforce() {
    const root = document.querySelector('[data-sst-workforce]');
    if (!root) return;

    const income = root.querySelector('[data-sst-wf-income]');
    const age = root.querySelector('[data-sst-wf-age]');
    const end = root.querySelector('[data-sst-wf-end]');
    const weeks = root.querySelector('[data-sst-wf-weeks]');
    const outValue = root.querySelector('[data-sst-wf-value]');
    const outYears = root.querySelector('[data-sst-wf-years]');
    const outAnnual = root.querySelector('[data-sst-wf-annual]');
    const fill = root.querySelector('[data-sst-wf-fill]');
    const labelStart = root.querySelector('[data-sst-wf-label-start]');
    const labelEnd = root.querySelector('[data-sst-wf-label-end]');

    let lastTotal = 0;
    let lastYears = 0;
    let lastAnnual = 0;

    function readInt(el, min, max, fallback) {
      const n = parseInt(el?.value, 10);
      if (!Number.isFinite(n)) return fallback;
      return Math.max(min, Math.min(max, n));
    }

    function recalc() {
      const monthly = readInt(income, 0, 500000, 0);
      const a = readInt(age, 18, 80, 38);
      let e = readInt(end, 50, 75, 67);
      if (e <= a) e = a + 1;
      const w = readInt(weeks, 0, 52, 0);

      const years = Math.max(0, e - a);
      const factor = (52 - w) / 52;
      const annual = monthly * 12 * factor;
      const total = annual * years;

      animateNumber(outYears, lastYears, years, 400);
      if (outAnnual) outAnnual.textContent = formatMoney(annual);
      animateNumber(outValue, lastTotal, total, 800);

      lastYears = years;
      lastAnnual = annual;
      lastTotal = total;

      if (labelStart) labelStart.textContent = `Alter ${a}`;
      if (labelEnd) labelEnd.textContent = `Ende ${e}`;
      if (fill) {
        const span = Math.max(1, e - 18);
        const pct = ((a - 18) / span) * 100;
        fill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
      }

      if (end && parseInt(end.value, 10) !== e) end.value = String(e);
    }

    [income, age, end, weeks].forEach((el) => {
      el?.addEventListener('input', recalc);
      el?.addEventListener('change', recalc);
    });

    if ('IntersectionObserver' in window && !reduceMotion) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            lastTotal = 0;
            lastYears = 0;
            recalc();
            io.unobserve(entry.target);
          });
        },
        { threshold: 0.25 }
      );
      io.observe(root);
    }
    recalc();
  }

  function initSstDuties() {
    const root = document.querySelector('[data-sst-duties]');
    const chart = document.querySelector('[data-sst-duties-chart]');
    if (!root || !chart) return;

    const segments = chart.querySelectorAll('[data-sst-d-key]');
    const cards = root.querySelectorAll('[data-sst-d-card]');
    const center = document.querySelector('[data-sst-d-center]');
    const tabButtons = document.querySelectorAll('[data-sst-profile]');

    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    let currentProfile = 'freelancer';
    let chartAnimated = false;

    function applyWeights(profileKey) {
      const w = SST_PROFILE_WEIGHTS[profileKey];
      if (!w) return;
      segments.forEach((seg) => {
        const key = seg.getAttribute('data-sst-d-key');
        if (key && w[key] != null) {
          seg.setAttribute('data-value', String(w[key]));
        }
      });
      cards.forEach((card) => {
        const key = card.getAttribute('data-sst-d-card');
        if (key && w[key] != null) {
          card.setAttribute('data-value', String(w[key]));
        }
      });
    }

    function syncCardPctLabels() {
      cards.forEach((card, i) => {
        const pctEl = card.querySelector('[data-sst-d-pct]');
        const v = parseFloat(card.getAttribute('data-value') || '0');
        if (!pctEl) return;
        if (reduceMotion) {
          pctEl.textContent = `${Math.round(v)}%`;
          return;
        }
        const from = 0;
        const start = performance.now() + i * 70;
        const dur = 550;
        function tick(now) {
          if (now < start) {
            requestAnimationFrame(tick);
            return;
          }
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          pctEl.textContent = `${Math.round(from + (v - from) * eased)}%`;
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }

    function drawChart(animate) {
      let cumulative = 0;
      segments.forEach((seg, i) => {
        const value = parseFloat(seg.getAttribute('data-value') || '0');
        const length = (value / 100) * circumference;
        seg.style.strokeDasharray = `${length} ${circumference}`;
        seg.style.strokeDashoffset = `-${cumulative}`;
        cumulative += length;
        if (!animate) seg.style.transition = 'none';
        else seg.style.transition = '';
      });
      if (center) center.textContent = '100%';
    }

    function playChartAnimation() {
      segments.forEach((seg) => {
        seg.style.strokeDasharray = `0 ${circumference}`;
      });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          drawChart(true);
          syncCardPctLabels();
        });
      });
    }

    function setProfile(key) {
      currentProfile = key;
      tabButtons.forEach((btn) => {
        const active = btn.getAttribute('data-sst-profile') === key;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
        btn.setAttribute('tabindex', active ? '0' : '-1');
      });
      applyWeights(key);
      if (chartAnimated) {
        cards.forEach((card) => {
          const pctEl = card.querySelector('[data-sst-d-pct]');
          if (pctEl) pctEl.textContent = '0%';
        });
        if (reduceMotion) {
          drawChart(false);
          syncCardPctLabels();
        } else playChartAnimation();
      }
    }

    tabButtons.forEach((btn, i) => {
      btn.addEventListener('click', () => setProfile(btn.getAttribute('data-sst-profile') || 'freelancer'));
      btn.addEventListener('keydown', (ev) => {
        if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
        ev.preventDefault();
        const list = Array.from(tabButtons);
        const idx = list.indexOf(btn);
        const next = ev.key === 'ArrowRight' ? (idx + 1) % list.length : (idx - 1 + list.length) % list.length;
        list[next].click();
        list[next].focus();
      });
      if (i === 0) btn.setAttribute('tabindex', '0');
      else btn.setAttribute('tabindex', '-1');
    });

    cards.forEach((card) => {
      const key = card.getAttribute('data-sst-d-card');
      if (!key) return;
      const seg = chart.querySelector(`[data-sst-d-key="${key}"]`);
      if (!seg) return;
      const enter = () => seg.classList.add('is-highlight');
      const leave = () => seg.classList.remove('is-highlight');
      card.addEventListener('mouseenter', enter);
      card.addEventListener('mouseleave', leave);
      card.addEventListener('focusin', enter);
      card.addEventListener('focusout', leave);
    });

    applyWeights(currentProfile);
    segments.forEach((seg) => {
      seg.style.strokeDasharray = `0 ${circumference}`;
    });
    cards.forEach((card) => {
      const pctEl = card.querySelector('[data-sst-d-pct]');
      if (pctEl) pctEl.textContent = '0%';
    });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            chartAnimated = true;
            if (reduceMotion) {
              drawChart(false);
              syncCardPctLabels();
            } else playChartAnimation();
            io.unobserve(entry.target);
          });
        },
        { threshold: 0.25 }
      );
      io.observe(chart);
    } else {
      chartAnimated = true;
      drawChart(false);
      syncCardPctLabels();
    }

    window.SST_PROFILE_WEIGHTS = SST_PROFILE_WEIGHTS;
  }

  function initSstGrowth() {
    const root = document.querySelector('[data-sst-growth]');
    if (!root) return;

    const tabs = Array.from(root.querySelectorAll('[data-sst-growth-tab]'));
    const panels = Array.from(root.querySelectorAll('[data-sst-growth-panel]'));
    if (!tabs.length || !panels.length) return;

    function activate(key, focusTab) {
      tabs.forEach((btn) => {
        const active = btn.getAttribute('data-sst-growth-tab') === key;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
        btn.setAttribute('tabindex', active ? '0' : '-1');
      });
      panels.forEach((panel) => {
        const active = panel.getAttribute('data-sst-growth-panel') === key;
        panel.classList.toggle('is-active', active);
        if (active) panel.removeAttribute('hidden');
        else panel.setAttribute('hidden', '');
      });
      if (focusTab) {
        const next = tabs.find((t) => t.getAttribute('data-sst-growth-tab') === key);
        if (next) next.focus();
      }
    }

    tabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        activate(btn.getAttribute('data-sst-growth-tab') || '1');
      });
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
        const nextKey = tabs[nextIdx].getAttribute('data-sst-growth-tab') || '1';
        activate(nextKey, true);
      });
    });

    const initial = tabs.find((t) => t.classList.contains('is-active')) || tabs[0];
    activate(initial.getAttribute('data-sst-growth-tab') || '1');
  }

  /** Themenwolke: nur drei feste Blautöne (styles.css: --bg-dark, --primary, --secondary), zufällig pro Wort. */
  function initSstWordcloud() {
    const svg = document.querySelector('[data-sst-wordcloud] .sst-wordcloud__svg');
    if (!svg) return;

    const colors = ['#02254a', '#035aa7', '#93b5e4'];

    svg.querySelectorAll('g.wordcloud-word').forEach((g) => {
      const fill = colors[Math.floor(Math.random() * colors.length)];
      g.querySelectorAll('text, tspan').forEach((el) => {
        el.style.setProperty('fill', fill, 'important');
      });
    });
  }

  function initSstHeroParallax() {
    const hero = document.querySelector('.sst-hero[data-parallax]');
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
      hero.style.setProperty('--sst-parallax-y', `${offset.toFixed(1)}px`);
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

  document.addEventListener('DOMContentLoaded', () => {
    initSstCheck();
    initSstReserve();
    initSstWorkforce();
    initSstDuties();
    initSstGrowth();
    initSstWordcloud();
    initSstHeroParallax();
  });
})();
