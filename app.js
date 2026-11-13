(function () {
  const Core = window.RoadPoliceCore;
  const DATA = window.EXAM_DATA;
  const EXAM_I18N = window.EXAM_I18N || { ru: {}, en: {} };
  const SIGNS_DATA = window.SIGNS_DATA || { totalSigns: 0, categories: [] };
  const SIGNS_I18N = window.SIGNS_I18N || { categories: { ru: {}, en: {} }, ru: {}, en: {} };
  const MARKINGS_DATA = window.MARKINGS_DATA || { totalItems: 0, categories: [] };
  const COLOR_TESTS_DATA = window.COLOR_TESTS_DATA || { totalPlates: 0, plates: [] };
  const RULES_DATA = window.RULES_DATA || { documents: [] };

  const STRINGS = {
    hy: {
      brandTitle: 'Varordakan · ՃՈ Քննական Հարցաշար',
      tabs: {
        home: 'Գլխավոր',
        practice: 'Ուսուցում',
        exam: 'Քննություն (20)',
        mistakes: 'Սխալներ',
        signs: 'Նշաններ և գծանշում',
        colortest: 'Գունաընկալում',
        cheatsheet: 'Օրենք և հուշաթերթ',
        search: 'Որոնում',
      },
      groupWord: 'Խումբ',
      questionWord: 'Հարց',
      prev: '← Նախորդը',
      next: 'Հաջորդը →',
      correctBanner: '✓ Ճիշտ պատասխան է',
      wrongBannerPrefix: '✕ Սխալ է · Ճիշտ պատասխանն է՝',
      explanationTitle: '💡 Բացատրություն (Ինչու է ճիշտ)',
      show: 'Ցույց տալ ▼',
      hide: 'Թաքցնել ▲',
      bookmarkSave: '☆ Պահել',
      bookmarkSaved: '★ Պահված է',
      noteTitle: '📌 Իմ նշումները',
      notePlaceholder: 'Գրեք Ձեր նշումները այստեղ (ավտոմատ պահպանվում են բոլոր էջերում)...',
      streakUnit: 'օր',
      footer: 'ՀՀ ՃՈ Տեսական Քննություն · ABC Կարգեր',
    },
    ru: {
      brandTitle: 'Varordakan · ПДД Экзамен Армении',
      tabs: {
        home: 'Главная',
        practice: 'Обучение',
        exam: 'Экзамен (20)',
        mistakes: 'Ошибки',
        signs: 'Знаки и разметка',
        colortest: 'Цветовосприятие',
        cheatsheet: 'Законы и шпаргалка',
        search: 'Поиск',
      },
      groupWord: 'Группа',
      questionWord: 'Вопрос',
      prev: '← Назад',
      next: 'Далее →',
      correctBanner: '✓ Правильный ответ',
      wrongBannerPrefix: '✕ Неверно · Правильный ответ:',
      explanationTitle: '💡 Объяснение (Почему это верно)',
      show: 'Показать ▼',
      hide: 'Скрыть ▲',
      bookmarkSave: '☆ Сохранить',
      bookmarkSaved: '★ В избранном',
      noteTitle: '📌 Мои заметки',
      notePlaceholder: 'Записывайте заметки здесь (сохраняются на всех вкладках)...',
      streakUnit: 'дн.',
      footer: 'Теоретический экзамен Полиции РА · Категории ABC',
    },
    en: {
      brandTitle: 'Varordakan · Armenia Driving Exam',
      tabs: {
        home: 'Home',
        practice: 'Practice',
        exam: 'Mock Exam (20)',
        mistakes: 'Mistakes',
        signs: 'Signs & Markings',
        colortest: 'Color Test',
        cheatsheet: 'Rules & Guide',
        search: 'Search',
      },
      groupWord: 'Group',
      questionWord: 'Question',
      prev: '← Previous',
      next: 'Next →',
      correctBanner: '✓ Correct answer',
      wrongBannerPrefix: '✕ Incorrect · Correct answer:',
      explanationTitle: '💡 Explanation (Why it is right)',
      show: 'Show ▼',
      hide: 'Hide ▲',
      bookmarkSave: '☆ Bookmark',
      bookmarkSaved: '★ Saved',
      noteTitle: '📌 My Notes',
      notePlaceholder: 'Write your study notes here (saved across all tabs)...',
      streakUnit: 'd',
      footer: 'Armenia Road Police Theory Exam · ABC Categories',
    },
  };

  function getLang() {
    return state && state.ui && STRINGS[state.ui.lang] ? state.ui.lang : 'hy';
  }

  function t(key) {
    const lang = getLang();
    return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.hy[key] || '';
  }

  function getQText(q) {
    const lang = getLang();
    if (lang !== 'hy' && EXAM_I18N[lang] && EXAM_I18N[lang][q.uid]) {
      return EXAM_I18N[lang][q.uid].text || q.text;
    }
    return q.text;
  }

  function getQOptions(q) {
    const lang = getLang();
    if (lang !== 'hy' && EXAM_I18N[lang] && EXAM_I18N[lang][q.uid]) {
      return EXAM_I18N[lang][q.uid].options || q.options;
    }
    return q.options;
  }

  function getSignText(sign) {
    const lang = getLang();
    if (lang !== 'hy' && SIGNS_I18N[lang] && SIGNS_I18N[lang][sign.id]) {
      const tr = SIGNS_I18N[lang][sign.id];
      return {
        title: tr.title || sign.title,
        description: tr.description || sign.description,
      };
    }
    return { title: sign.title, description: sign.description };
  }

  function getSignCategoryTitle(cat) {
    const lang = getLang();
    if (lang !== 'hy' && SIGNS_I18N.categories && SIGNS_I18N.categories[lang] && SIGNS_I18N.categories[lang][cat.id]) {
      return SIGNS_I18N.categories[lang][cat.id];
    }
    return cat.title;
  }

  function getMarkingText(item) {
    const lang = getLang();
    if (lang === 'ru') {
      return {
        title: item.title_ru || item.title,
        description: item.description_ru || item.description,
        categoryTitle: item.categoryTitle_ru || item.categoryTitle,
      };
    }
    if (lang === 'en') {
      return {
        title: item.title_en || item.title,
        description: item.description_en || item.description,
        categoryTitle: item.categoryTitle_en || item.categoryTitle,
      };
    }
    return {
      title: item.title,
      description: item.description,
      categoryTitle: item.categoryTitle,
    };
  }

  // Index rules & articles for quick jump from explanations
  const RULE_ID_LOOKUP = {};
  for (const doc of RULES_DATA.documents || []) {
    for (const ch of doc.chapters || []) {
      for (const item of ch.items || []) {
        if (item.id) RULE_ID_LOOKUP[item.id] = { docId: doc.id, itemId: item.id };
      }
    }
  }

  if (!Core || !DATA || !Array.isArray(DATA.groups)) {
    document.getElementById('app-root').innerHTML =
      '<div class="card empty-state"><h2>Տվյալները չեն գտնվել</h2><p>Խնդրում ենք նախ գործարկել արտահանման սկրիպտը (extract_pdfs.py)։</p></div>';
    return;
  }

  const QUESTIONS_BY_UID = {};
  const GROUPS_BY_ID = {};
  for (const group of DATA.groups) {
    GROUPS_BY_ID[group.id] = group;
    for (const q of group.questions) {
      QUESTIONS_BY_UID[q.uid] = q;
    }
  }

  const SIGN_INDEX = Core.buildSignIndex(SIGNS_DATA.categories || []);
  const QUESTIONS_BY_SIGN_CODE = {};
  for (const sign of SIGN_INDEX.list) {
    const code = sign.canonicalCode || sign.code;
    if (code && !QUESTIONS_BY_SIGN_CODE[code]) {
      QUESTIONS_BY_SIGN_CODE[code] = Core.getQuestionsForSign(DATA.groups, code, SIGN_INDEX.byCode);
    }
  }

  let state = Core.loadState(window.localStorage);

  // Ephemeral session state (not persisted mid-flight unless completed)
  const session = {
    shuffledOrderByGroup: {},
    exam: {
      status: 'idle', // 'idle' | 'running' | 'finished'
      questions: [],
      answersByUid: {},
      currentIndex: 0,
      remainingSec: Core.EXAM_DURATION_SEC,
      startedAtMs: 0,
      timerId: null,
      result: null,
    },
    mistakes: {
      queueUids: [],
      currentIndex: 0,
      // { [uid]: { selectedIndex, isCorrect } } for current retry view
      attemptByUid: {},
    },
    signs: {
      section: 'signs', // 'signs' | 'markings' | 'vehicle_id' | 'quiz'
      query: '',
      categoryId: 'all',
      markingCatId: 'all',
      mode: 'browse', // 'browse' | 'quiz'
      quiz: {
        items: [],
        index: 0,
        answers: {},
      },
    },
    colortest: {
      mode: 'practice', // 'practice' | 'exam3'
      index: 0,
      answers: {}, // { [plateId]: selectedIndex }
      examPlates: [],
      examIndex: 0,
      examFailed: false,
      examPassed: false,
    },
    cheatsheet: {
      subtab: 'rules', // 'rules' | 'guide'
      docId: 'all',
      query: '',
      highlightRuleId: '',
      pose: 'side', // 'up' | 'side' | 'forward'
      approach: 'left', // 'left' | 'right' | 'front' | 'back'
    },
    search: {
      query: '',
      groupId: 'all',
      imagesOnly: false,
      bookmarkedOnly: false,
      showAnswers: false,
      page: 1,
      pageSize: 40,
    },
    practiceFocus: null, // null | { mode: 'smart' | 'sign', label: string, questions: [], index: 0 }
    openExplanations: {},
  };

  const rootEl = document.getElementById('app-root');
  const progressTextEl = document.getElementById('overall-progress-text');
  const mistakesBadgeEl = document.getElementById('mistakes-badge');
  const lightboxEl = document.getElementById('lightbox');
  const lightboxImgEl = document.getElementById('lightbox-img');
  const signModalEl = document.getElementById('sign-modal');
  const signModalTitleEl = document.getElementById('sign-modal-title');
  const signModalBodyEl = document.getElementById('sign-modal-body');
  const toastEl = document.getElementById('toast');
  let toastTimer = null;

  function persist() {
    Core.saveState(window.localStorage, state);
    updateHeaderStats();
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.hidden = true;
    }, 2800);
  }

  function openLightbox(src) {
    lightboxImgEl.src = src;
    lightboxEl.hidden = false;
  }

  function closeLightbox() {
    lightboxEl.hidden = true;
    lightboxImgEl.src = '';
  }

  function openSignModal(code) {
    const sign = SIGN_INDEX.byCode[code];
    if (!sign || !signModalEl) return;
    const canonical = sign.canonicalCode || sign.code;
    const linkedQs = QUESTIONS_BY_SIGN_CODE[canonical] || [];
    const loc = getSignText(sign);
    signModalTitleEl.textContent = loc.title;
    signModalBodyEl.innerHTML = `
      ${
        sign.image
          ? `<div class="modal-sign-preview"><img src="${escapeHtml(sign.image)}" alt="${escapeHtml(loc.title)}" /></div>`
          : ''
      }
      <span class="pill-tag">${escapeHtml(sign.categoryTitle)}</span>
      <p style="margin: 10px 0 14px; font-size: 14.5px; color: var(--text-muted); line-height: 1.6;">
        ${loc.description ? escapeHtml(loc.description) : 'Լրացուցիչ նկարագրություն չկա։'}
      </p>
      <div class="toolbar-group">
        ${
          linkedQs.length > 0
            ? `<button type="button" class="btn btn-primary" data-practice-sign="${escapeHtml(canonical)}">
                 Պարապել այս նշանի հարցերը (${linkedQs.length})
               </button>`
            : ''
        }
        <button type="button" class="btn" id="sign-modal-done">Փակել</button>
      </div>
    `;
    signModalEl.hidden = false;
  }

  function closeSignModal() {
    if (signModalEl) {
      signModalEl.hidden = true;
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatDuration(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function updateHeaderStats() {
    const lang = getLang();
    const strings = STRINGS[lang];
    document.documentElement.lang = lang;

    const brandTitleEl = document.getElementById('brand-title-text');
    if (brandTitleEl) brandTitleEl.textContent = strings.brandTitle;

    const footerEl = document.getElementById('footer-brand-text');
    if (footerEl) footerEl.textContent = strings.footer;

    const total = DATA.totalQuestions;
    let answeredCount = 0;
    let correctCount = 0;
    for (const entry of Object.values(state.practice)) {
      answeredCount += 1;
      if (entry.correct) correctCount += 1;
    }
    const pct = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
    progressTextEl.textContent =
      lang === 'ru'
        ? `Всего: ${total} · Пройдено: ${answeredCount} (${pct}% верно)`
        : lang === 'en'
        ? `Total: ${total} · Done: ${answeredCount} (${pct}% right)`
        : `Ընդամենը՝ ${total} հարց · Անցած՝ ${answeredCount} (${pct}% ճիշտ)`;

    const mistakeCount = Object.keys(state.mistakes).length;
    mistakesBadgeEl.textContent = String(mistakeCount);
    mistakesBadgeEl.classList.toggle('zero', mistakeCount === 0);

    document.querySelectorAll('.tab-btn').forEach((btn) => {
      const tabKey = btn.dataset.tab;
      btn.classList.toggle('active', tabKey === state.ui.activeTab);
      if (tabKey === 'mistakes') {
        btn.innerHTML = `${escapeHtml(strings.tabs.mistakes)} <span class="badge ${mistakeCount === 0 ? 'zero' : ''}" id="mistakes-badge">${mistakeCount}</span>`;
      } else if (strings.tabs[tabKey]) {
        btn.textContent = strings.tabs[tabKey];
      }
    });

    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    const study = Core.getStudyProgress(state);
    const streakBtn = document.getElementById('btn-daily-goal');
    const streakTextEl = document.getElementById('streak-pill-text');
    if (streakBtn && streakTextEl) {
      streakBtn.classList.toggle('done', study.goalMetToday);
      streakTextEl.textContent =
        study.streakDays > 0
          ? `${study.streakDays} ${strings.streakUnit} · ${study.todayCount}/${study.dailyGoal}`
          : `${study.todayCount}/${study.dailyGoal}`;
    }

    const noteTitleEl = document.querySelector('.sticky-note-title');
    const noteTextEl = document.getElementById('sticky-note-text');
    if (noteTitleEl) noteTitleEl.textContent = strings.noteTitle;
    if (noteTextEl) noteTextEl.placeholder = strings.notePlaceholder;
  }

  // ---------- Practice Helpers ----------
  function getGroupQuestionsInOrder(groupId) {
    const group = GROUPS_BY_ID[groupId];
    if (!group) return [];
    const isShuffled = Boolean(state.ui.shuffleByGroup[groupId]);
    if (!isShuffled) return group.questions;

    if (!session.shuffledOrderByGroup[groupId]) {
      session.shuffledOrderByGroup[groupId] = Core.shuffleArray(group.questions).map((q) => q.uid);
    }
    return session.shuffledOrderByGroup[groupId]
      .map((uid) => QUESTIONS_BY_UID[uid])
      .filter(Boolean);
  }

  function getGroupStats(group) {
    let answered = 0;
    let correct = 0;
    for (const q of group.questions) {
      const rec = state.practice[q.uid];
      if (rec) {
        answered += 1;
        if (rec.correct) correct += 1;
      }
    }
    return { answered, correct, total: group.questions.length };
  }

  function renderImagesHtml(images) {
    if (!images || images.length === 0) return '';
    return `
      <div class="question-images">
        ${images
          .map(
            (src) => `
          <button type="button" class="question-img-btn" data-zoom-src="${escapeHtml(src)}" title="Սեղմեք մեծացնելու համար">
            <img src="${escapeHtml(src)}" alt="Ճանապարհային իրավիճակի նկար" loading="lazy" />
          </button>`
          )
          .join('')}
      </div>
    `;
  }

  function renderBookmarkBtnHtml(uid) {
    const saved = Core.isBookmarked(state, uid);
    return `
      <button type="button" class="bookmark-btn ${saved ? 'active' : ''}" data-toggle-bookmark="${escapeHtml(uid)}">
        ${saved ? t('bookmarkSaved') : t('bookmarkSave')}
      </button>
    `;
  }

  function renderBilingualHintHtml(q) {
    if (getLang() === 'hy' || !state.ui.bilingual) return '';
    return `<p class="bilingual-sub">🇦🇲 ${escapeHtml(q.text)}</p>`;
  }

  function renderLinkedExplanationHtml(text) {
    const tokens = Core.tokenizeExplanationWithSigns(text, SIGN_INDEX.byCode);
    const ruleRe = /(կետ|հոդված)\s+(\d+(?:\.\d+)?)/gi;
    return tokens
      .map((tok) => {
        if (tok.type === 'sign') {
          return `<button type="button" class="sign-ref-link" data-open-sign="${escapeHtml(tok.code)}" title="${escapeHtml(tok.sign.title)}">${escapeHtml(tok.code)}</button>`;
        }
        const chunk = tok.value;
        let out = '';
        let last = 0;
        let m;
        ruleRe.lastIndex = 0;
        while ((m = ruleRe.exec(chunk)) !== null) {
          const kind = m[1].toLowerCase();
          const num = m[2];
          const ruleId = kind === 'հոդված' ? `hodvac-${num}` : `ket-${num}`;
          if (RULE_ID_LOOKUP[ruleId]) {
            if (m.index > last) out += escapeHtml(chunk.slice(last, m.index));
            out += `<button type="button" class="sign-ref-link" data-open-rule="${escapeHtml(ruleId)}">${escapeHtml(m[0])}</button>`;
            last = m.index + m[0].length;
          }
        }
        if (last < chunk.length) out += escapeHtml(chunk.slice(last));
        return out;
      })
      .join('');
  }

  function renderExplanationTabHtml(q, scopeKey) {
    if (!q || !q.explanation) return '';
    const key = `${scopeKey}:${q.uid}`;
    const isOpen = Boolean(session.openExplanations[key]);
    return `
      <div class="explanation-box">
        <button
          type="button"
          class="explanation-toggle"
          data-toggle-exp="${escapeHtml(key)}"
          aria-expanded="${isOpen ? 'true' : 'false'}"
        >
          <span>${t('explanationTitle')}</span>
          <span>${isOpen ? t('hide') : t('show')}</span>
        </button>
        ${
          isOpen
            ? `<div class="explanation-content">${renderLinkedExplanationHtml(q.explanation)}</div>`
            : ''
        }
      </div>
    `;
  }

  // ---------- Tab 0: Home / Landing Page ----------
  let homeAnimatedOnce = false;

  function buildAnimatedRoadSvg() {
    return `
      <svg class="hero-road-scene" viewBox="0 0 320 112" aria-hidden="true">
        <circle cx="48" cy="30" r="14" fill="#fde047" opacity="0.85"/>
        <path d="M0 70 Q50 48 105 70 T225 70 T320 68 L320 70 L0 70 Z" fill="#bfdbfe" opacity="0.65"/>
        <rect x="0" y="70" width="320" height="42" fill="#334155"/>
        <line x1="0" y1="91" x2="320" y2="91" stroke="#f8fafc" stroke-width="3" stroke-linecap="round" class="hero-road-dashes"/>
        <g class="hero-car-group">
          <rect x="108" y="64" width="96" height="22" rx="8" fill="#1d4ed8"/>
          <path d="M124 64 L138 48 L178 48 L194 64 Z" fill="#2563eb"/>
          <path d="M141 51 L156 51 L156 62 L130 62 Z" fill="#dbeafe"/>
          <path d="M160 51 L175 51 L186 62 L160 62 Z" fill="#dbeafe"/>
          <circle cx="130" cy="86" r="9" fill="#0f172a"/>
          <circle cx="130" cy="86" r="4" fill="#e2e8f0"/>
          <circle cx="184" cy="86" r="9" fill="#0f172a"/>
          <circle cx="184" cy="86" r="4" fill="#e2e8f0"/>
          <rect x="199" y="70" width="6" height="5" rx="2" fill="#fef08a"/>
        </g>
      </svg>
    `;
  }

  function animateHomeCounters() {
    if (homeAnimatedOnce) return;
    homeAnimatedOnce = true;
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = document.querySelectorAll('[data-count-to]');
    if (reduceMotion) return;
    els.forEach((el) => {
      const target = Number(el.dataset.countTo || 0);
      const suffix = el.dataset.countSuffix || '';
      const duration = 650;
      const start = performance.now();
      function step(now) {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = `${Math.round(target * eased)}${suffix}`;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  function renderHome() {
    const readiness = Core.computeReadiness(DATA.groups, state);
    const answeredTotal = Object.keys(state.practice).length;
    const mistakeCount = Object.keys(state.mistakes).length;
    const totalSigns = SIGNS_DATA.totalSigns || 282;
    const totalPlates = COLOR_TESTS_DATA.totalPlates || 53;

    const resumeHtml =
      answeredTotal > 0 || mistakeCount > 0
        ? `<div class="card readiness-card home-anim home-delay-1">
             <div class="readiness-main">
               <div class="readiness-top">
                 <span class="readiness-pct">${readiness.overallPct}%</span>
                 <strong>Ձեր ընթացիկ պատրաստվածությունը</strong>
                 <span style="font-size: 13px; color: var(--text-muted);">(${answeredTotal} / ${DATA.totalQuestions} հարց անցած)</span>
               </div>
               <div class="progress-bar-wrap" style="margin-bottom: 0;">
                 <div class="progress-bar-fill" style="width: ${readiness.overallPct}%"></div>
               </div>
             </div>
             <div class="toolbar-group">
               <button type="button" class="btn btn-primary" data-nav-tab="practice">Շարունակել ուսուցումը</button>
               ${
                 mistakeCount > 0
                   ? `<button type="button" class="btn btn-danger" data-nav-tab="mistakes">Ուղղել սխալները (${mistakeCount})</button>`
                   : ''
               }
             </div>
           </div>`
        : '';

    const previewCodes = ['2.1', '3.27', '4.2.2'];
    const previewSignsHtml = previewCodes
      .map((code) => {
        const s = SIGN_INDEX.byCode[code];
        if (!s || !s.image) return '';
        return `
          <button type="button" class="hero-sign-mini" data-open-sign="${escapeHtml(code)}" title="${escapeHtml(s.title)}">
            <img src="${escapeHtml(s.image)}" alt="${escapeHtml(s.title)}" />
            <span>${escapeHtml(code)}</span>
          </button>`;
      })
      .join('');

    const animCls = homeAnimatedOnce ? '' : 'home-anim';

    rootEl.innerHTML = `
      <section class="hero-card ${animCls}">
        <div>
          <span class="hero-eyebrow"><span class="live-dot"></span> ՀՀ ՃՈ Տեսական Քննություն · ABC 2026</span>
          <h2 class="hero-title">Սովորի՛ր կանոնները հասկանալով, ոչ թե անգիր անելով</h2>
          <p class="hero-subtitle">
            Պաշտոնական բոլոր հարցերը, հայերեն բացատրությունները, ճանապարհային նշաններն ու գունաընկալման թեստը՝ մեկ անվճար հարթակում։
          </p>
          <div class="hero-actions">
            <button type="button" class="btn btn-primary" data-nav-tab="practice">Սկսել ուսուցումը</button>
            <button type="button" class="btn" data-nav-tab="exam">Փորձնական քննություն</button>
          </div>
        </div>

        <aside class="hero-preview" aria-label="Արագ ծանոթացում">
          ${buildAnimatedRoadSvg()}
          <div class="hero-signs-row">${previewSignsHtml}</div>
        </aside>
      </section>

      ${resumeHtml}

      <section class="stats-strip ${animCls} home-delay-1" aria-label="Հարթակի տվյալները">
        <div class="stat-tile">
          <div class="stat-value" data-count-to="${DATA.totalQuestions}">${DATA.totalQuestions}</div>
          <div class="stat-label">Պաշտոնական հարց</div>
        </div>
        <div class="stat-tile">
          <div class="stat-value" data-count-to="${totalSigns}">${totalSigns}</div>
          <div class="stat-label">Ճանապարհային նշան</div>
        </div>
        <div class="stat-tile">
          <div class="stat-value" data-count-to="${totalPlates}">${totalPlates}</div>
          <div class="stat-label">Գունաընկալման աղյուսակ</div>
        </div>
        <div class="stat-tile">
          <div class="stat-value" data-count-to="100" data-count-suffix="%">100%</div>
          <div class="stat-label">Անվճար և օֆլայն</div>
        </div>
      </section>

      <section class="${animCls} home-delay-2" style="margin-bottom: 16px;">
        <h2 class="section-heading">Բաժիններ</h2>
        <div class="features-grid">
          <button type="button" class="feature-tile" data-nav-tab="practice">
            <div class="feature-icon" aria-hidden="true">📘</div>
            <div class="feature-tile-body">
              <h3 class="feature-title">Ուսուցում (10 խումբ)</h3>
              <p class="feature-desc">Բացատրություններ և խելացի 10 հարցանոց մարզում</p>
            </div>
            <span class="feature-arrow">→</span>
          </button>

          <button type="button" class="feature-tile" data-nav-tab="exam">
            <div class="feature-icon" aria-hidden="true">⏱️</div>
            <div class="feature-tile-body">
              <h3 class="feature-title">Քննություն (20 հարց)</h3>
              <p class="feature-desc">30 րոպե, պաշտոնական 15+2+2+1 կշիռներ, 18/20 շեմ</p>
            </div>
            <span class="feature-arrow">→</span>
          </button>

          <button type="button" class="feature-tile" data-nav-tab="mistakes">
            <div class="feature-icon" aria-hidden="true">🔁</div>
            <div class="feature-tile-body">
              <h3 class="feature-title">Սխալներ (${mistakeCount})</h3>
              <p class="feature-desc">Սխալված հարցերի ավտոմատ կրկնություն</p>
            </div>
            <span class="feature-arrow">→</span>
          </button>

          <button type="button" class="feature-tile" data-nav-tab="signs">
            <div class="feature-icon" aria-hidden="true">🚸</div>
            <div class="feature-tile-body">
              <h3 class="feature-title">Նշաններ (${totalSigns})</h3>
              <p class="feature-desc">Նշանագիրք, հարցերի կապ և նշանների թեստ</p>
            </div>
            <span class="feature-arrow">→</span>
          </button>

          <button type="button" class="feature-tile" data-nav-tab="colortest">
            <div class="feature-icon" aria-hidden="true">🎨</div>
            <div class="feature-tile-body">
              <h3 class="feature-title">Գունաընկալում (${totalPlates})</h3>
              <p class="feature-desc">Աղյուսակներ և 3-հարցանոց ստուգում</p>
            </div>
            <span class="feature-arrow">→</span>
          </button>

          <button type="button" class="feature-tile" data-nav-tab="cheatsheet">
            <div class="feature-icon" aria-hidden="true">🧭</div>
            <div class="feature-tile-body">
              <h3 class="feature-title">Հուշաթերթ և որոնում</h3>
              <p class="feature-desc">Կարգավորողի մարզիչ և բոլոր թվերը</p>
            </div>
            <span class="feature-arrow">→</span>
          </button>
        </div>
      </section>

      <details class="exam-guide-details ${animCls} home-delay-3">
        <summary class="exam-guide-summary">Ինչպե՞ս է անցնում պաշտոնական տեսական քննությունը</summary>
        <div class="exam-guide-body">
          <div class="how-steps">
            <div class="how-step">
              <span class="how-step-num">Քայլ 1</span>
              <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">Գունաընկալում (3 հարց)</div>
              <p class="feature-desc">Առաջին 3 հարցում սխալ չի թույլատրվում։</p>
            </div>
            <div class="how-step">
              <span class="how-step-num">Քայլ 2</span>
              <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">Տեսական թեստ (20 հարց)</div>
              <p class="feature-desc">30 րոպե՝ առնվազն 18 ճիշտ պատասխան (max 2 սխալ)։</p>
            </div>
            <div class="how-step">
              <span class="how-step-num">Քայլ 3</span>
              <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">Թեմաների կշիռը</div>
              <p class="feature-desc">15՝ ՃԵԿ, 2՝ Օրենք, 2՝ Անսարքություն, 1՝ Առաջին օգնություն։</p>
            </div>
          </div>
        </div>
      </details>
    `;

    animateHomeCounters();
  }

  // ---------- Tab 1: Practice ----------
  function renderReadinessBannerHtml() {
    const r = Core.computeReadiness(DATA.groups, state);
    const b = r.buckets;
    const bookmarkCount = Object.keys(state.bookmarks || {}).length;
    const study = Core.getStudyProgress(state);
    return `
      <div class="card readiness-card">
        <div class="readiness-main">
          <div class="readiness-top">
            <span class="readiness-pct">${r.overallPct}%</span>
            <strong>Քննության պատրաստվածություն</strong>
            <span style="font-size: 13px; color: var(--text-muted);">
              · 🔥 ${study.streakDays} ${t('streakUnit')} · Այսօր՝ ${study.todayCount}/${study.dailyGoal}
            </span>
          </div>
          <div class="progress-bar-wrap" style="margin-bottom: 8px;">
            <div class="progress-bar-fill" style="width: ${r.overallPct}%"></div>
          </div>
          <div class="readiness-buckets">
            ${Object.values(b)
              .map(
                (item) => `
              <div class="readiness-chip">
                <strong>${escapeHtml(item.label)} · ${item.pct}%</strong>
                <span>${item.mastered}/${item.total} յուրացված</span>
              </div>`
              )
              .join('')}
          </div>
        </div>
        <div class="toolbar-group">
          <button type="button" class="btn btn-primary" id="btn-smart-drill">
            ⚡ Խելացի մարզում (10)
          </button>
          <button type="button" class="btn" id="btn-bookmarks-drill" ${bookmarkCount === 0 ? 'disabled' : ''}>
            ★ Պահված (${bookmarkCount})
          </button>
        </div>
      </div>
    `;
  }

  function renderPracticeFocus() {
    const focus = session.practiceFocus;
    const questions = focus.questions;
    const total = questions.length;
    if (total === 0) {
      session.practiceFocus = null;
      renderPractice();
      return;
    }
    const qIdx = Math.min(Math.max(0, focus.index), total - 1);
    focus.index = qIdx;
    const q = questions[qIdx];
    const qText = getQText(q);
    const qOpts = getQOptions(q);
    const attempt = focus.attemptByUid[q.uid];

    const optionsHtml = qOpts
      .map((opt, idx) => {
        const cls = ['option-btn'];
        if (attempt) {
          if (idx === q.correctIndex) cls.push('correct');
          else if (idx === attempt.selectedIndex) cls.push('wrong');
        }
        return `
          <button
            type="button"
            class="${cls.join(' ')}"
            data-focus-opt="${idx}"
            ${attempt ? 'disabled' : ''}
          >
            <span class="option-num">${idx + 1}</span>
            <span>${escapeHtml(opt)}</span>
          </button>
        `;
      })
      .join('');

    const feedbackHtml = attempt
      ? `<div class="feedback-banner ${attempt.isCorrect ? 'correct' : 'wrong'}">
           <span>${
             attempt.isCorrect
               ? t('correctBanner')
               : `${t('wrongBannerPrefix')} ${q.correctIndex + 1}. ${escapeHtml(qOpts[q.correctIndex])}`
           }</span>
         </div>`
      : '';

    const gridHtml = questions
      .map((item, idx) => {
        const att = focus.attemptByUid[item.uid];
        const cls = ['q-dot'];
        if (idx === qIdx) cls.push('current');
        if (att) cls.push(att.isCorrect ? 'correct' : 'wrong');
        return `<button type="button" class="${cls.join(' ')}" data-focus-jump="${idx}">${idx + 1}</button>`;
      })
      .join('');

    rootEl.innerHTML = `
      <div class="card">
        <div class="toolbar">
          <div class="toolbar-group">
            <strong>${escapeHtml(focus.label)}</strong>
            <span class="pill-tag">${qIdx + 1} / ${total}</span>
          </div>
          <div class="toolbar-group">
            ${
              getLang() !== 'hy'
                ? `<button type="button" class="btn btn-sm ${state.ui.bilingual ? 'btn-primary' : ''}" id="btn-toggle-bilingual">🇦🇲 Հայերեն</button>`
                : ''
            }
            <button type="button" class="btn btn-sm" id="btn-exit-focus">← Վերադառնալ խմբերին</button>
          </div>
        </div>

        <div class="question-meta">
          <span>${t('groupWord')} ${q.groupId} · ${t('questionWord')} №${q.number}</span>
          ${renderBookmarkBtnHtml(q.uid)}
        </div>

        <h2 class="question-text">${escapeHtml(qText)}${renderBilingualHintHtml(q)}</h2>
        ${renderImagesHtml(q.images)}
        <div class="options-list">${optionsHtml}</div>
        ${feedbackHtml}
        ${renderExplanationTabHtml(q, 'focus')}

        <div class="question-footer">
          <div class="toolbar-group">
            <button type="button" class="btn" id="btn-focus-prev" ${qIdx === 0 ? 'disabled' : ''}>${t('prev')}</button>
            <button type="button" class="btn btn-primary" id="btn-focus-next" ${qIdx >= total - 1 ? 'disabled' : ''}>${t('next')}</button>
          </div>
        </div>

        <div class="q-grid">${gridHtml}</div>
      </div>
    `;
  }

  function renderPractice() {
    if (session.practiceFocus) {
      renderPracticeFocus();
      return;
    }

    const activeGid = state.ui.activeGroupId || 1;
    const group = GROUPS_BY_ID[activeGid] || DATA.groups[0];
    const questions = getGroupQuestionsInOrder(group.id);
    const total = questions.length;
    let qIdx = state.ui.activeQuestionIndexByGroup[group.id] || 0;
    if (qIdx < 0) qIdx = 0;
    if (qIdx >= total) qIdx = total - 1;
    state.ui.activeQuestionIndexByGroup[group.id] = qIdx;

    const q = questions[qIdx];
    const qText = getQText(q);
    const qOpts = getQOptions(q);
    const record = state.practice[q.uid];
    const stats = getGroupStats(group);
    const isShuffled = Boolean(state.ui.shuffleByGroup[group.id]);
    const progressPct = total > 0 ? Math.round((stats.answered / total) * 100) : 0;

    const pillsHtml = DATA.groups
      .map((g) => {
        const gs = getGroupStats(g);
        const acc = gs.answered > 0 ? `${Math.round((gs.correct / gs.answered) * 100)}%` : '—';
        return `
          <button type="button" class="group-pill ${g.id === group.id ? 'active' : ''}" data-select-group="${g.id}">
            <div class="group-pill-top">
              <span>${t('groupWord')} ${g.id}</span>
              <span>${gs.answered}/${gs.total}</span>
            </div>
            <div class="group-pill-sub">
              <span>${getLang() === 'ru' ? 'Верно' : getLang() === 'en' ? 'Correct' : 'Ճիշտ'}՝ ${acc}</span>
            </div>
          </button>
        `;
      })
      .join('');

    const optionsHtml = qOpts
      .map((opt, idx) => {
        const cls = ['option-btn'];
        if (record) {
          if (idx === q.correctIndex) cls.push('correct');
          else if (idx === record.selectedIndex) cls.push('wrong');
        }
        return `
          <button
            type="button"
            class="${cls.join(' ')}"
            data-practice-opt="${idx}"
            ${record ? 'disabled' : ''}
          >
            <span class="option-num">${idx + 1}</span>
            <span>${escapeHtml(opt)}</span>
          </button>
        `;
      })
      .join('');

    const feedbackHtml = record
      ? `<div class="feedback-banner ${record.correct ? 'correct' : 'wrong'}">
           <span>${
             record.correct
               ? t('correctBanner')
               : `${t('wrongBannerPrefix')} ${q.correctIndex + 1}. ${escapeHtml(qOpts[q.correctIndex])}`
           }</span>
         </div>`
      : '';

    const gridHtml = questions
      .map((item, idx) => {
        const rec = state.practice[item.uid];
        const cls = ['q-dot'];
        if (idx === qIdx) cls.push('current');
        if (rec) cls.push(rec.correct ? 'correct' : 'wrong');
        return `<button type="button" class="${cls.join(' ')}" data-practice-jump="${idx}">${item.number}</button>`;
      })
      .join('');

    rootEl.innerHTML = `
      ${renderReadinessBannerHtml()}
      <div class="group-pills">${pillsHtml}</div>

      <div class="card">
        <div class="toolbar">
          <div class="toolbar-group">
            <strong>${t('groupWord')} ${group.id}</strong>
            <span class="pill-tag">${stats.answered} / ${total} · ${stats.correct} ✓</span>
          </div>
          <div class="toolbar-group">
            ${
              getLang() !== 'hy'
                ? `<button type="button" class="btn btn-sm ${state.ui.bilingual ? 'btn-primary' : ''}" id="btn-toggle-bilingual">🇦🇲 Հայերեն</button>`
                : ''
            }
            <button type="button" class="btn btn-sm ${isShuffled ? 'btn-primary' : ''}" id="btn-toggle-shuffle">
              ${isShuffled ? 'Խառնված է' : 'Խառնել'}
            </button>
            <button type="button" class="btn btn-sm" id="btn-next-unanswered">Հաջորդ չպատասխանածը</button>
            <button type="button" class="btn btn-sm btn-danger" id="btn-reset-group">Վերսկսել խումբը</button>
          </div>
        </div>

        <div class="progress-bar-wrap" aria-label="Խմբի առաջընթաց">
          <div class="progress-bar-fill" style="width: ${progressPct}%"></div>
        </div>

        <div class="question-meta">
          <span>${t('questionWord')} №${q.number} (${qIdx + 1} / ${total})</span>
          <div class="toolbar-group">
            ${renderBookmarkBtnHtml(q.uid)}
            <span class="pill-tag">${t('groupWord')} ${group.id}</span>
          </div>
        </div>

        <h2 class="question-text">${escapeHtml(qText)}${renderBilingualHintHtml(q)}</h2>
        ${renderImagesHtml(q.images)}
        <div class="options-list">${optionsHtml}</div>
        ${feedbackHtml}
        ${renderExplanationTabHtml(q, 'practice')}

        <div class="question-footer">
          <div class="toolbar-group">
            <button type="button" class="btn" id="btn-prev-q" ${qIdx === 0 ? 'disabled' : ''}>${t('prev')}</button>
            <button type="button" class="btn btn-primary" id="btn-next-q" ${qIdx >= total - 1 ? 'disabled' : ''}>${t('next')}</button>
          </div>
          <span class="kbd-hint">1-5 · ← / →</span>
        </div>

        <div class="q-grid" aria-label="Հարցերի ցանկ">${gridHtml}</div>
      </div>
    `;
  }

  // ---------- Tab 2: Mock Exam & Color Perception Pre-Test ----------
  const COLOR_PLATES = [
    {
      answer: '12',
      options: ['12', '17', '72', 'Ոչ մի թիվ չի երևում'],
      bgColors: ['#d97706', '#ea580c', '#f59e0b', '#c2410c'],
      fgColors: ['#15803d', '#16a34a', '#22c55e', '#166534'],
      text: '12',
    },
    {
      answer: '8',
      options: ['3', '8', '6', 'Ոչ մի թիվ չի երևում'],
      bgColors: ['#16a34a', '#22c55e', '#4ade80', '#15803d'],
      fgColors: ['#dc2626', '#ef4444', '#b91c1c', '#e11d48'],
      text: '8',
    },
    {
      answer: '5',
      options: ['2', '5', '9', 'Ոչ մի թիվ չի երևում'],
      bgColors: ['#dc2626', '#f97316', '#ef4444', '#fb923c'],
      fgColors: ['#0284c7', '#0ea5e9', '#0369a1', '#0d9488'],
      text: '5',
    },
  ];

  function buildIshiharaPlateSvg(plate, seedIdx) {
    // Deterministic pseudo-random circle grid + distinct contrasting numeral dots
    const circles = [];
    let seed = (seedIdx + 1) * 9301 + 49297;
    const nextRand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < 240; i++) {
      const ang = nextRand() * Math.PI * 2;
      const rad = Math.sqrt(nextRand()) * 102;
      const cx = (120 + Math.cos(ang) * rad).toFixed(1);
      const cy = (120 + Math.sin(ang) * rad).toFixed(1);
      const r = (3.5 + nextRand() * 5.2).toFixed(1);
      const col = plate.bgColors[Math.floor(nextRand() * plate.bgColors.length)];
      circles.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}" opacity="0.9"/>`);
    }
    const fg = plate.fgColors[0];
    const fg2 = plate.fgColors[1];
    return `
      <svg class="ishihara-svg" viewBox="0 0 240 240" aria-label="Գունաընկալման աղյուսակ">
        <circle cx="120" cy="120" r="116" fill="#f8fafc"/>
        ${circles.join('')}
        <text x="120" y="148" text-anchor="middle" font-family="system-ui, sans-serif" font-size="94" font-weight="900" fill="${fg}" stroke="${fg2}" stroke-width="3" stroke-dasharray="6 4" opacity="0.92">${escapeHtml(plate.text)}</text>
      </svg>
    `;
  }

  function startColorPreTest() {
    stopExamTimer();
    const realPlates = (COLOR_TESTS_DATA.plates || []).length >= 3
      ? Core.shuffleArray(COLOR_TESTS_DATA.plates).slice(0, 3)
      : null;
    session.exam = {
      status: 'color_test',
      colorStep: 0,
      colorFailed: false,
      colorPlates: realPlates,
      questions: [],
      answersByUid: {},
      currentIndex: 0,
      remainingSec: Core.EXAM_DURATION_SEC,
      startedAtMs: 0,
      timerId: null,
      result: null,
    };
    render();
  }

  function stopExamTimer() {
    if (session.exam.timerId) {
      clearInterval(session.exam.timerId);
      session.exam.timerId = null;
    }
  }

  function startExam() {
    stopExamTimer();
    const questions = Core.generateMockExam(DATA.groups);
    session.exam = {
      status: 'running',
      questions,
      answersByUid: {},
      currentIndex: 0,
      remainingSec: Core.EXAM_DURATION_SEC,
      startedAtMs: Date.now(),
      timerId: null,
      result: null,
    };
    session.exam.timerId = setInterval(() => {
      if (session.exam.status !== 'running') {
        stopExamTimer();
        return;
      }
      session.exam.remainingSec -= 1;
      const timerEl = document.getElementById('exam-timer-pill');
      if (timerEl) {
        timerEl.textContent = formatDuration(Math.max(0, session.exam.remainingSec));
        timerEl.classList.toggle('warn', session.exam.remainingSec <= 300 && session.exam.remainingSec > 60);
        timerEl.classList.toggle('danger', session.exam.remainingSec <= 60);
      }
      if (session.exam.remainingSec <= 0) {
        finishExam(true);
      }
    }, 1000);
    render();
  }

  function finishExam(timedOut = false) {
    if (session.exam.status !== 'running') return;
    stopExamTimer();
    const elapsedSec = Core.EXAM_DURATION_SEC - Math.max(0, session.exam.remainingSec);
    const { state: nextState, result } = Core.gradeMockExam(
      state,
      session.exam.questions,
      session.exam.answersByUid,
      elapsedSec
    );
    state = nextState;
    const answeredInExam = Object.keys(session.exam.answersByUid).length;
    for (let i = 0; i < answeredInExam; i++) {
      state = Core.recordStudyActivity(state);
    }
    session.exam.status = 'finished';
    session.exam.result = result;
    persist();
    if (timedOut) {
      showToast('Ժամանակը լրացավ · քննությունը ավարտվեց');
    }
    render();
  }

  function renderExam() {
    if (session.exam.status === 'color_test') {
      if (session.exam.colorFailed) {
        rootEl.innerHTML = `
          <div class="card empty-state">
            <h2>Գունաընկալման թեստը չի հանձնվել</h2>
            <p>Պաշտոնական քննության ժամանակ գունաընկալման 3 հարցերում սխալ չի թույլատրվում։</p>
            <div class="toolbar-group" style="justify-content: center;">
              <button type="button" class="btn btn-primary" id="btn-start-color-exam">Կրկին փորձել</button>
              <button type="button" class="btn" id="btn-start-exam">Անցնել տեսական քննությանը</button>
            </div>
          </div>
        `;
        return;
      }
      const step = session.exam.colorStep || 0;
      const realList = session.exam.colorPlates;
      if (realList && realList[step]) {
        const plate = realList[step];
        rootEl.innerHTML = `
          <div class="card">
            <div class="toolbar">
              <strong>Փուլ 1 · Գունաընկալման թեստ</strong>
              <span class="pill-tag">Աղյուսակ ${step + 1} / ${realList.length} (0 սխալ)</span>
            </div>
            <p style="color: var(--text-muted); margin-top: 0;">
              Անցնելուց հետո ավտոմատ կսկսվի 20 հարցանոց տեսական քննությունը։
            </p>
            <div class="ishihara-wrap">
              <button type="button" class="color-plate-btn" data-zoom-src="${escapeHtml(plate.image)}" title="Սեղմեք մեծացնելու համար">
                <img src="${escapeHtml(plate.image)}" alt="Գունաընկալման աղյուսակ" />
              </button>
            </div>
            <h2 class="question-text" style="text-align: center;">${escapeHtml(plate.question)}</h2>
            <div class="options-list">
              ${plate.options
                .map(
                  (opt, i) => `
                <button type="button" class="option-btn" data-color-opt="${i}">
                  <span class="option-num">${i + 1}</span>
                  <span>${escapeHtml(opt)}</span>
                </button>`
                )
                .join('')}
            </div>
            <div class="question-footer">
              <button type="button" class="btn btn-sm btn-ghost" id="btn-start-exam">Բաց թողնել և սկսել 20 հարցը →</button>
            </div>
          </div>
        `;
        return;
      }
      const plate = COLOR_PLATES[step];
      rootEl.innerHTML = `
        <div class="card">
          <div class="toolbar">
            <strong>Փուլ 1 · Գունաընկալման թեստ</strong>
            <span class="pill-tag">Աղյուսակ ${step + 1} / ${COLOR_PLATES.length} (0 սխալ)</span>
          </div>
          <p style="color: var(--text-muted); margin-top: 0;">
            Ինչպե՞ս է նշված թիվը պատկերված գունավոր շրջանակների ներսում։ Անցնելուց հետո ավտոմատ կսկսվի 20 հարցանոց տեսական քննությունը։
          </p>
          <div class="ishihara-wrap">${buildIshiharaPlateSvg(plate, step)}</div>
          <div class="options-list">
            ${plate.options
              .map(
                (opt, i) => `
              <button type="button" class="option-btn" data-color-opt="${escapeHtml(opt)}">
                <span class="option-num">${i + 1}</span>
                <span>${escapeHtml(opt)}</span>
              </button>`
              )
              .join('')}
          </div>
          <div class="question-footer">
            <button type="button" class="btn btn-sm btn-ghost" id="btn-start-exam">Բաց թողնել և սկսել 20 հարցը →</button>
          </div>
        </div>
      `;
      return;
    }

    if (session.exam.status === 'idle') {
      const historyHtml =
        state.examHistory.length === 0
          ? '<p style="color: var(--text-muted); margin: 12px 0 0;">Դեռ ավարտված քննություններ չկան։</p>'
          : `<div class="history-list">
              ${state.examHistory
                .slice(0, 10)
                .map(
                  (h) => `
                <div class="history-item">
                  <span>${new Date(h.date).toLocaleString('hy-AM')}</span>
                  <span>Ժամանակ՝ ${formatDuration(h.durationSec)}</span>
                  <span class="pill-tag ${h.passed ? 'success' : 'danger'}">
                    ${h.score} / ${h.total} · ${h.passed ? 'Հանձնված է' : 'Չի հանձնվել'}
                  </span>
                </div>`
                )
                .join('')}
            </div>`;

      rootEl.innerHTML = `
        <div class="card">
          <h2 style="margin-top: 0;">Տեսական քննության սիմուլյացիա</h2>
          <p style="color: var(--text-muted);">
            Քննությունը կազմված է <strong>20 հարցից</strong>՝ պաշտոնական կշիռներով
            (<strong>15</strong>՝ ՃԵԿ և նշաններ, <strong>2</strong>՝ Օրենք, <strong>2</strong>՝ Անսարքություններ, <strong>1</strong>՝ Առաջին օգնություն)։
            Տրվում է <strong>30 րոպե</strong>։ Անցողիկ շեմը՝ <strong>18 / 20</strong> (առավելագույնը 2 սխալ)։
          </p>
          <p style="color: var(--text-muted);">
            Իրական քննության նման կարող եք սկսել նաև 3-հարցանոց գունաընկալման նախաթեստով։ Ավարտելուց հետո բոլոր սխալված հարցերը կավելացվեն «Սխալներ» բաժնում։
          </p>
          <div class="toolbar-group">
            <button type="button" class="btn btn-primary" id="btn-start-color-exam">Սկսել գունաընկալումով (իրական ձևաչափ)</button>
            <button type="button" class="btn" id="btn-start-exam">Սկսել միայն 20 հարցը</button>
          </div>
        </div>

        <div class="card">
          <h3 style="margin: 0;">Վերջին քննությունների պատմություն</h3>
          ${historyHtml}
        </div>
      `;
      return;
    }

    if (session.exam.status === 'running') {
      const { questions, answersByUid, currentIndex, remainingSec } = session.exam;
      const q = questions[currentIndex];
      const qText = getQText(q);
      const qOpts = getQOptions(q);
      const selected = answersByUid[q.uid];
      const answeredTotal = Object.keys(answersByUid).length;

      const timerCls = ['timer-pill'];
      if (remainingSec <= 60) timerCls.push('danger');
      else if (remainingSec <= 300) timerCls.push('warn');

      const navGrid = questions
        .map((item, idx) => {
          const cls = ['q-dot'];
          if (idx === currentIndex) cls.push('current');
          if (typeof answersByUid[item.uid] === 'number') cls.push('answered');
          return `<button type="button" class="${cls.join(' ')}" data-exam-jump="${idx}">${idx + 1}</button>`;
        })
        .join('');

      const optionsHtml = qOpts
        .map(
          (opt, idx) => `
          <button
            type="button"
            class="option-btn ${selected === idx ? 'selected' : ''}"
            data-exam-opt="${idx}"
          >
            <span class="option-num">${idx + 1}</span>
            <span>${escapeHtml(opt)}</span>
          </button>`
        )
        .join('');

      rootEl.innerHTML = `
        <div class="card">
          <div class="exam-topbar">
            <div class="toolbar-group">
              <strong>${t('questionWord')} ${currentIndex + 1} / ${questions.length}</strong>
              <span class="pill-tag">${answeredTotal} / ${questions.length}</span>
            </div>
            <div class="toolbar-group">
              <div class="${timerCls.join(' ')}" id="exam-timer-pill">${formatDuration(remainingSec)}</div>
              <button type="button" class="btn btn-primary" id="btn-finish-exam">Ավարտել քննությունը</button>
            </div>
          </div>

          <div class="q-grid" style="margin-top: 0; margin-bottom: 16px;">${navGrid}</div>

          <div class="question-meta">
            <span>${t('groupWord')} ${q.groupId} · №${q.number}</span>
            ${renderBookmarkBtnHtml(q.uid)}
          </div>

          <h2 class="question-text">${escapeHtml(qText)}${renderBilingualHintHtml(q)}</h2>
          ${renderImagesHtml(q.images)}
          <div class="options-list">${optionsHtml}</div>

          <div class="question-footer">
            <div class="toolbar-group">
              <button type="button" class="btn" id="btn-exam-prev" ${currentIndex === 0 ? 'disabled' : ''}>${t('prev')}</button>
              <button type="button" class="btn btn-primary" id="btn-exam-next" ${currentIndex >= questions.length - 1 ? 'disabled' : ''}>${t('next')}</button>
            </div>
            <span class="kbd-hint">Պատասխանները կարող եք փոխել մինչև ավարտելը</span>
          </div>
        </div>
      `;
      return;
    }

    // Finished exam review
    const res = session.exam.result;
    const breakdownHtml = res.breakdown
      .map((item, idx) => {
        const q = item.question;
        const qText = getQText(q);
        const qOpts = getQOptions(q);
        const statusTag = item.isCorrect
          ? '<span class="pill-tag success">✓ Ճիշտ</span>'
          : item.selectedIndex === null
          ? '<span class="pill-tag danger">✕ Բաց թողնված</span>'
          : '<span class="pill-tag danger">✕ Սխալ</span>';

        const opts = qOpts
          .map((opt, oi) => {
            const cls = [];
            if (oi === q.correctIndex) cls.push('is-correct');
            const chosenMark = item.selectedIndex === oi ? ' (Ձեր ընտրությունը)' : '';
            const wrongStyle =
              !item.isCorrect && item.selectedIndex === oi
                ? 'style="background: var(--danger-bg); border-color: var(--danger-border); color: var(--danger);"'
                : '';
            return `<li class="${cls.join(' ')}" ${wrongStyle}>${oi + 1}. ${escapeHtml(opt)}${chosenMark}</li>`;
          })
          .join('');

        return `
          <div class="search-result-card">
            <div class="question-meta">
              <span><strong>${idx + 1}.</strong> ${t('groupWord')} ${q.groupId} · №${q.number}</span>
              <div class="toolbar-group">
                ${renderBookmarkBtnHtml(q.uid)}
                ${statusTag}
              </div>
            </div>
            <div style="font-weight: 600; margin-bottom: 10px;">${escapeHtml(qText)}${renderBilingualHintHtml(q)}</div>
            ${renderImagesHtml(q.images)}
            <ul class="search-options">${opts}</ul>
            ${renderExplanationTabHtml(q, 'exam-review')}
          </div>
        `;
      })
      .join('');

    rootEl.innerHTML = `
      <div class="card">
        <div class="exam-result-hero">
          <div>
            <span class="pill-tag ${res.passed ? 'success' : 'danger'}">
              ${res.passed ? '✓ Քննությունը հանձնված է' : '✕ Քննությունը չի հանձնվել'}
            </span>
            <div class="result-score">${res.score} / ${res.total}</div>
            <div style="color: var(--text-muted); font-size: 14px;">
              Ծախսված ժամանակ՝ ${formatDuration(res.durationSec)} · Անցողիկ շեմը՝ 18/20
            </div>
          </div>
          <div class="toolbar-group">
            <button type="button" class="btn btn-primary" id="btn-start-exam">Սկսել նոր քննություն</button>
            <button type="button" class="btn" id="btn-goto-mistakes">Բացել սխալները (${Object.keys(state.mistakes).length})</button>
          </div>
        </div>
      </div>

      <div style="margin-top: 16px;">
        ${breakdownHtml}
      </div>
    `;
  }

  // ---------- Tab 3: Mistakes Retry ----------
  function syncMistakeQueue(forceRebuild = false) {
    const activeSet = new Set(Object.keys(state.mistakes));
    if (forceRebuild || session.mistakes.queueUids.length === 0) {
      session.mistakes.queueUids = Object.keys(state.mistakes).filter((uid) => QUESTIONS_BY_UID[uid]);
      session.mistakes.currentIndex = 0;
      session.mistakes.attemptByUid = {};
      return;
    }
    // Keep current item visible while it has an attempt in progress, drop items removed externally
    if (session.mistakes.currentIndex >= session.mistakes.queueUids.length) {
      session.mistakes.currentIndex = Math.max(0, session.mistakes.queueUids.length - 1);
    }
    if (activeSet.size === 0 && Object.keys(session.mistakes.attemptByUid).length === 0) {
      session.mistakes.queueUids = [];
      session.mistakes.currentIndex = 0;
    }
  }

  function renderMistakes() {
    syncMistakeQueue(false);
    const totalRemaining = Object.keys(state.mistakes).length;
    const queue = session.mistakes.queueUids;

    if (queue.length === 0) {
      rootEl.innerHTML = `
        <div class="card empty-state">
          <h2>Սխալների ցանկը դատարկ է</h2>
          <p>Գերազանց է։ Երբ ուսուցման կամ քննության ընթացքում սխալվեք, հարցերը ավտոմատ կհայտնվեն այստեղ՝ կրկին պարապելու համար։</p>
          <button type="button" class="btn btn-primary" id="btn-back-practice">Անցնել ուսուցմանը</button>
        </div>
      `;
      return;
    }

    const idx = Math.min(session.mistakes.currentIndex, queue.length - 1);
    session.mistakes.currentIndex = idx;
    const uid = queue[idx];
    const q = QUESTIONS_BY_UID[uid];
    const qText = getQText(q);
    const qOpts = getQOptions(q);
    const mistakeMeta = state.mistakes[uid];
    const attempt = session.mistakes.attemptByUid[uid];

    const optionsHtml = qOpts
      .map((opt, oi) => {
        const cls = ['option-btn'];
        if (attempt) {
          if (oi === q.correctIndex) cls.push('correct');
          else if (oi === attempt.selectedIndex) cls.push('wrong');
        }
        return `
          <button
            type="button"
            class="${cls.join(' ')}"
            data-mistake-opt="${oi}"
            ${attempt ? 'disabled' : ''}
          >
            <span class="option-num">${oi + 1}</span>
            <span>${escapeHtml(opt)}</span>
          </button>
        `;
      })
      .join('');

    const feedbackHtml = attempt
      ? `<div class="feedback-banner ${attempt.isCorrect ? 'correct' : 'wrong'}">
           <span>${
             attempt.isCorrect
               ? attempt.resolved
                 ? '✓ 2/2 ճիշտ է։ Հարցը լիովին յուրացված է և հեռացվեց սխալներից։'
                 : `✓ 1/2 ճիշտ է։ Եվս 1 անգամ ճիշտ պատասխանեք («Թարմացնել ցանկը»), որպեսզի հեռացվի սխալներից։`
               : `${t('wrongBannerPrefix')} ${q.correctIndex + 1}. ${escapeHtml(qOpts[q.correctIndex])}`
           }</span>
         </div>`
      : '';

    const gridHtml = queue
      .map((itemUid, gi) => {
        const cls = ['q-dot'];
        if (gi === idx) cls.push('current');
        const att = session.mistakes.attemptByUid[itemUid];
        if (att) cls.push(att.isCorrect ? 'correct' : 'wrong');
        return `<button type="button" class="${cls.join(' ')}" data-mistake-jump="${gi}">${gi + 1}</button>`;
      })
      .join('');

    const streakVal = mistakeMeta ? mistakeMeta.streak || 0 : Core.MISTAKE_CLEAR_STREAK;

    rootEl.innerHTML = `
      <div class="card">
        <div class="toolbar">
          <div class="toolbar-group">
            <strong>Սխալների ուղղում (2 անգամ անընդմեջ ճիշտ)</strong>
            <span class="pill-tag danger">Մնացել է՝ ${totalRemaining}</span>
          </div>
          <div class="toolbar-group">
            <button type="button" class="btn btn-sm" id="btn-refresh-mistakes">Թարմացնել ցանկը</button>
            <button type="button" class="btn btn-sm btn-danger" id="btn-clear-mistakes">Մաքրել բոլորը</button>
          </div>
        </div>

        <div class="question-meta">
          <span>Քարտ ${idx + 1} / ${queue.length} · ${t('groupWord')} ${q.groupId} · №${q.number}</span>
          <div class="toolbar-group">
            ${renderBookmarkBtnHtml(q.uid)}
            ${
              mistakeMeta
                ? `<span class="pill-tag ${streakVal > 0 ? 'success' : 'danger'}">Սերիա՝ ${streakVal}/2 · Սխալ՝ ${mistakeMeta.wrongCount}×</span>`
                : `<span class="pill-tag success">Ուղղված է (2/2)</span>`
            }
          </div>
        </div>

        <h2 class="question-text">${escapeHtml(qText)}${renderBilingualHintHtml(q)}</h2>
        ${renderImagesHtml(q.images)}
        <div class="options-list">${optionsHtml}</div>
        ${feedbackHtml}
        ${renderExplanationTabHtml(q, 'mistakes')}

        <div class="question-footer">
          <div class="toolbar-group">
            <button type="button" class="btn" id="btn-mistake-prev" ${idx === 0 ? 'disabled' : ''}>${t('prev')}</button>
            <button type="button" class="btn btn-primary" id="btn-mistake-next" ${idx >= queue.length - 1 ? 'disabled' : ''}>${t('next')}</button>
          </div>
          <span class="kbd-hint">Հարցը դուրս է գալիս սխալներից 2 անընդմեջ ճիշտ պատասխանից հետո</span>
        </div>

        <div class="q-grid">${gridHtml}</div>
      </div>
    `;
  }

  // ---------- Tab 4: Road Signs, Road Markings, Vehicle ID Signs & Quiz ----------
  function startSignQuiz() {
    const categories = SIGNS_DATA.categories || [];
    const items = Core.generateSignQuiz(categories, session.signs.categoryId, 10);
    session.signs.mode = 'quiz';
    session.signs.quiz = {
      items,
      index: 0,
      answers: {},
    };
    renderSigns();
  }

  function renderSignQuiz(categories) {
    const { items, index, answers } = session.signs.quiz;
    if (!items || items.length === 0) {
      session.signs.mode = 'browse';
      renderSigns();
      return;
    }
    const idx = Math.min(Math.max(0, index), items.length - 1);
    session.signs.quiz.index = idx;
    const current = items[idx];
    const selected = answers[idx];
    const answeredCount = Object.keys(answers).length;
    const correctCount = Object.entries(answers).filter(
      ([qi, optIdx]) => items[Number(qi)] && items[Number(qi)].correctIndex === optIdx
    ).length;
    const targetLoc = getSignText(current.target);

    const optionsHtml = current.options
      .map((opt, oi) => {
        const cls = ['option-btn'];
        if (typeof selected === 'number') {
          if (oi === current.correctIndex) cls.push('correct');
          else if (oi === selected) cls.push('wrong');
        }
        return `
          <button
            type="button"
            class="${cls.join(' ')}"
            data-sign-quiz-opt="${oi}"
            ${typeof selected === 'number' ? 'disabled' : ''}
          >
            <span class="option-num">${oi + 1}</span>
            <span>${escapeHtml(getSignText(opt).title)}</span>
          </button>
        `;
      })
      .join('');

    const feedbackHtml =
      typeof selected === 'number'
        ? `<div class="feedback-banner ${selected === current.correctIndex ? 'correct' : 'wrong'}">
             <span>${
               selected === current.correctIndex
                 ? t('correctBanner')
                 : `${t('wrongBannerPrefix')} ${escapeHtml(targetLoc.title)}`
             }</span>
           </div>
           ${
             targetLoc.description
               ? `<p style="margin: 10px 0 0; font-size: 14px; color: var(--text-muted);">${escapeHtml(targetLoc.description)}</p>`
               : ''
           }`
        : '';

    rootEl.innerHTML = `
      <div class="card">
        <div class="toolbar">
          <div class="toolbar-group">
            <strong>🎯 Նշանների թեստ</strong>
            <span class="pill-tag">${idx + 1} / ${items.length} · ${correctCount}/${answeredCount} ✓</span>
          </div>
          <div class="toolbar-group">
            <button type="button" class="btn btn-sm" id="btn-sign-quiz-restart">Նոր 10 նշան</button>
            <button type="button" class="btn btn-sm btn-ghost" id="btn-sign-mode-browse">← Նշանագիրք</button>
          </div>
        </div>

        <div class="modal-sign-preview" style="margin: 12px 0 16px;">
          <img src="${escapeHtml(current.target.image)}" alt="Ճանապարհային նշան" />
        </div>

        <h2 class="question-text" style="text-align: center;">Ո՞ր նշանն է պատկերված նկարում։</h2>
        <div class="options-list">${optionsHtml}</div>
        ${feedbackHtml}

        <div class="question-footer">
          <div class="toolbar-group">
            <button type="button" class="btn" id="btn-sign-quiz-prev" ${idx === 0 ? 'disabled' : ''}>${t('prev')}</button>
            <button type="button" class="btn btn-primary" id="btn-sign-quiz-next" ${idx >= items.length - 1 ? 'disabled' : ''}>${t('next')}</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderSignsResults(categories) {
    const { section, query, categoryId, markingCatId } = session.signs;
    const countEl = document.getElementById('signs-count-pill');

    if (section === 'markings' || section === 'vehicle_id') {
      const mCats = (MARKINGS_DATA.categories || []).filter((c) =>
        section === 'vehicle_id' ? c.key === 'vehicle_id' : c.key === 'horiz' || c.key === 'vert'
      );
      const filtered = Core.filterMarkings(mCats, {
        query,
        categoryId: section === 'vehicle_id' ? 'all' : markingCatId,
      });
      const totalInSec = mCats.reduce((acc, c) => acc + c.count, 0);
      if (countEl) countEl.textContent = `${filtered.length} / ${totalInSec}`;

      const cardsHtml =
        filtered.length === 0
          ? '<div class="card empty-state"><h2>Տվյալներ չեն գտնվել</h2><p>Փորձեք փոխել որոնման բառը։</p></div>'
          : `<div class="signs-list">
              ${filtered
                .map((item) => {
                  const loc = getMarkingText(item);
                  const imgs = item.images && item.images.length ? item.images : item.image ? [item.image] : [];
                  return `
                <article class="sign-card">
                  ${
                    imgs.length
                      ? `<button type="button" class="sign-thumb-btn" data-zoom-src="${escapeHtml(imgs[0])}" title="Սեղմեք մեծացնելու համար">
                           <img src="${escapeHtml(imgs[0])}" alt="${escapeHtml(loc.title)}" loading="lazy" />
                         </button>`
                      : ''
                  }
                  <div class="sign-body">
                    <span class="pill-tag">${escapeHtml(loc.categoryTitle || '')}</span>
                    <h3 class="sign-title">${escapeHtml(loc.title)}</h3>
                    <p class="sign-desc">${escapeHtml(loc.description || '')}</p>
                  </div>
                </article>`;
                })
                .join('')}
            </div>`;

      const container = document.getElementById('signs-results-container');
      if (container) container.innerHTML = cardsHtml;
      return;
    }

    // Default: Road Signs (Form 1)
    const lang = getLang();
    const filtered = [];
    const normQ = Core.normalizeArmenian(query);
    for (const cat of categories) {
      if (categoryId !== 'all' && Number(categoryId) !== cat.id) continue;
      const catTitle = getSignCategoryTitle(cat);
      for (const sign of cat.signs || []) {
        const loc = getSignText(sign);
        if (normQ) {
          const hay = Core.normalizeArmenian(
            `${sign.code || ''} ${sign.title} ${sign.description} ${loc.title} ${loc.description}`
          );
          if (!hay.includes(normQ)) continue;
        }
        filtered.push({ ...sign, locTitle: loc.title, locDesc: loc.description, catTitle });
      }
    }

    if (countEl) {
      countEl.textContent = `${filtered.length} / ${SIGNS_DATA.totalSigns}`;
    }

    document.querySelectorAll('[data-sign-cat]').forEach((btn) => {
      const val = btn.dataset.signCat;
      const isAct = val === 'all' ? categoryId === 'all' : Number(categoryId) === Number(val);
      btn.classList.toggle('active', isAct);
    });

    const cardsHtml =
      filtered.length === 0
        ? '<div class="card empty-state"><h2>Նշաններ չեն գտնվել</h2><p>Փորձեք փոխել որոնման բառը կամ ընտրել այլ խումբ։</p></div>'
        : `<div class="signs-list">
            ${filtered
              .map((sign) => {
                const canonical = Core.getCanonicalSignCode(sign);
                const linkedQs = QUESTIONS_BY_SIGN_CODE[canonical] || [];
                return `
              <article class="sign-card">
                ${
                  sign.image
                    ? `<button type="button" class="sign-thumb-btn" data-zoom-src="${escapeHtml(sign.image)}" title="Սեղմեք մեծացնելու համար">
                         <img src="${escapeHtml(sign.image)}" alt="${escapeHtml(sign.locTitle)}" loading="lazy" />
                       </button>`
                    : ''
                }
                <div class="sign-body">
                  <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px; flex-wrap: wrap;">
                    <span class="pill-tag">${escapeHtml(sign.catTitle)}</span>
                    ${
                      linkedQs.length > 0
                        ? `<button type="button" class="btn btn-sm btn-ghost" data-practice-sign="${escapeHtml(canonical)}">
                             ${lang === 'ru' ? 'Вопросы' : lang === 'en' ? 'Questions' : 'Հարցեր'} (${linkedQs.length})
                           </button>`
                        : ''
                    }
                  </div>
                  <h3 class="sign-title">${escapeHtml(sign.locTitle)}</h3>
                  ${
                    sign.locDesc
                      ? `<p class="sign-desc">${escapeHtml(sign.locDesc)}</p>`
                      : '<p class="sign-desc">—</p>'
                  }
                </div>
              </article>`;
              })
              .join('')}
          </div>`;

    const container = document.getElementById('signs-results-container');
    if (container) {
      container.innerHTML = cardsHtml;
    }
  }

  function renderSigns() {
    const categories = SIGNS_DATA.categories || [];
    if (categories.length === 0) {
      rootEl.innerHTML =
        '<div class="card empty-state"><h2>Ճանապարհային նշանների տվյալները բացակայում են</h2><p>Գործարկեք <code>scripts/extract_signs.py</code> սկրիպտը։</p></div>';
      return;
    }

    if (session.signs.mode === 'quiz') {
      renderSignQuiz(categories);
      return;
    }

    const { section, query, categoryId, markingCatId } = session.signs;
    const mCats = MARKINGS_DATA.categories || [];
    const markingsCount = mCats
      .filter((c) => c.key === 'horiz' || c.key === 'vert')
      .reduce((acc, c) => acc + c.count, 0);
    const vehicleIdCount = mCats
      .filter((c) => c.key === 'vehicle_id')
      .reduce((acc, c) => acc + c.count, 0);

    const subBar = `
      <div class="subtab-bar">
        <button type="button" class="sign-cat-pill ${section === 'signs' ? 'active' : ''}" data-signs-section="signs">
          🚸 Նշաններ (${SIGNS_DATA.totalSigns})
        </button>
        <button type="button" class="sign-cat-pill ${section === 'markings' ? 'active' : ''}" data-signs-section="markings">
          🛣️ Գծանշումներ 1.1–2.7 (${markingsCount})
        </button>
        <button type="button" class="sign-cat-pill ${section === 'vehicle_id' ? 'active' : ''}" data-signs-section="vehicle_id">
          🚗 Ճանաչման նշաններ (${vehicleIdCount})
        </button>
        <button type="button" class="btn btn-sm btn-primary" id="btn-sign-mode-quiz">🎯 Նշանների թեստ (10)</button>
      </div>
    `;

    let filtersHtml = '';
    if (section === 'signs') {
      filtersHtml = `
        <div class="signs-filters">
          <button type="button" class="sign-cat-pill ${categoryId === 'all' ? 'active' : ''}" data-sign-cat="all">Բոլորը (${SIGNS_DATA.totalSigns})</button>
          ${categories
            .map(
              (cat) => `
                <button type="button" class="sign-cat-pill ${Number(categoryId) === cat.id ? 'active' : ''}" data-sign-cat="${cat.id}">
                  ${escapeHtml(getSignCategoryTitle(cat))} (${cat.signCount})
                </button>`
            )
            .join('')}
        </div>
      `;
    } else if (section === 'markings') {
      const mSubCats = mCats.filter((c) => c.key === 'horiz' || c.key === 'vert');
      filtersHtml = `
        <div class="signs-filters">
          <button type="button" class="sign-cat-pill ${markingCatId === 'all' ? 'active' : ''}" data-marking-cat="all">Բոլորը (${markingsCount})</button>
          ${mSubCats
            .map(
              (c) => `
                <button type="button" class="sign-cat-pill ${Number(markingCatId) === c.id ? 'active' : ''}" data-marking-cat="${c.id}">
                  ${escapeHtml(getLang() === 'ru' ? c.title_ru : getLang() === 'en' ? c.title_en : c.title)} (${c.count})
                </button>`
            )
            .join('')}
        </div>
      `;
    }

    rootEl.innerHTML = `
      <div class="card" style="margin-bottom: 16px;">
        ${subBar}
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 10px;">
          <h2 style="margin: 0; font-size: 19px;">
            ${
              section === 'markings'
                ? 'Ճանապարհային գծանշումներ (Ձև N 2)'
                : section === 'vehicle_id'
                ? 'Տրանսպորտային միջոցի ճանաչման նշաններ (Ձև N 3)'
                : 'Ճանապարհային նշաններ (Ձև N 1)'
            }
          </h2>
          <span class="pill-tag" id="signs-count-pill"></span>
        </div>
        <input
          type="search"
          class="input"
          style="width: 100%;"
          id="signs-search-input"
          placeholder="Որոնել համարով, անվանումով կամ նկարագրությամբ..."
          value="${escapeHtml(query)}"
        />
        ${filtersHtml}
      </div>

      <div id="signs-results-container"></div>
    `;

    renderSignsResults(categories);

    document.getElementById('signs-search-input').addEventListener('input', (e) => {
      session.signs.query = e.target.value;
      renderSignsResults(categories);
    });
  }

  // ---------- Tab 5: Color Blindness / Psychological Test ----------
  function startColorExam3() {
    const plates = COLOR_TESTS_DATA.plates || [];
    session.colortest = {
      ...session.colortest,
      mode: 'exam3',
      examPlates: Core.shuffleArray(plates).slice(0, 3),
      examIndex: 0,
      examFailed: false,
      examPassed: false,
    };
    renderColorTest();
  }

  function renderColorTest() {
    const plates = COLOR_TESTS_DATA.plates || [];
    if (plates.length === 0) {
      rootEl.innerHTML =
        '<div class="card empty-state"><h2>Գունաընկալման աղյուսակները բացակայում են</h2><p>Գործարկեք <code>scripts/extract_color_tests.py</code> սկրիպտը։</p></div>';
      return;
    }

    const ct = session.colortest;

    if (ct.mode === 'exam3') {
      if (ct.examFailed || ct.examPassed) {
        rootEl.innerHTML = `
          <div class="card empty-state">
            <span class="pill-tag ${ct.examPassed ? 'success' : 'danger'}" style="margin-bottom: 10px; display: inline-block;">
              ${ct.examPassed ? '✓ Հանձնված է (3 / 3)' : '✕ Չի հանձնվել'}
            </span>
            <h2>${
              ct.examPassed
                ? 'Գերազանց է։ Բոլոր 3 գունաընկալման հարցերին ճիշտ պատասխանեցիք։'
                : 'Սխալ պատասխան՝ գունաընկալման փուլում'
            }</h2>
            <p>${
              ct.examPassed
                ? 'Իրական քննության ժամանակ սա թույլ կտա անցնել հիմնական 20 հարցանոց թեստին։'
                : 'Պաշտոնական քննության ժամանակ հոգեբանական/գունաընկալման 3 հարցերում սխալ չի թույլատրվում։'
            }</p>
            <div class="toolbar-group" style="justify-content: center;">
              <button type="button" class="btn btn-primary" id="btn-ct-start-exam3">Նոր 3-հարցանոց ստուգում</button>
              <button type="button" class="btn" id="btn-ct-mode-practice">Պարապել բոլոր ${plates.length} աղյուսակները</button>
            </div>
          </div>
        `;
        return;
      }

      const p = ct.examPlates[ct.examIndex];
      rootEl.innerHTML = `
        <div class="card">
          <div class="toolbar">
            <div class="toolbar-group">
              <strong>🎨 Քննական ստուգում (3 հարց · 0 սխալ)</strong>
              <span class="pill-tag">Հարց ${ct.examIndex + 1} / ${ct.examPlates.length}</span>
            </div>
            <div class="toolbar-group">
              <button type="button" class="btn btn-sm btn-ghost" id="btn-ct-mode-practice">← Ամբողջ ցանկը (${plates.length})</button>
            </div>
          </div>

          <div class="ishihara-wrap">
            <button type="button" class="color-plate-btn" data-zoom-src="${escapeHtml(p.image)}" title="Սեղմեք մեծացնելու համար">
              <img src="${escapeHtml(p.image)}" alt="Գունաընկալման աղյուսակ №${p.number}" />
            </button>
          </div>

          <h2 class="question-text" style="text-align: center;">${escapeHtml(p.question)}</h2>
          <div class="options-list">
            ${p.options
              .map(
                (opt, oi) => `
              <button type="button" class="option-btn" data-ct-exam3-opt="${oi}">
                <span class="option-num">${oi + 1}</span>
                <span>${escapeHtml(opt)}</span>
              </button>`
              )
              .join('')}
          </div>
        </div>
      `;
      return;
    }

    // Practice all 53 plates
    const idx = Math.min(Math.max(0, ct.index), plates.length - 1);
    ct.index = idx;
    const plate = plates[idx];
    const selected = ct.answers[plate.id];
    const answeredCount = Object.keys(ct.answers).length;
    const correctCount = plates.filter((pl) => ct.answers[pl.id] === pl.correctIndex).length;

    const optionsHtml = plate.options
      .map((opt, oi) => {
        const cls = ['option-btn'];
        if (typeof selected === 'number') {
          if (oi === plate.correctIndex) cls.push('correct');
          else if (oi === selected) cls.push('wrong');
        }
        return `
          <button
            type="button"
            class="${cls.join(' ')}"
            data-ct-opt="${oi}"
            ${typeof selected === 'number' ? 'disabled' : ''}
          >
            <span class="option-num">${oi + 1}</span>
            <span>${escapeHtml(opt)}</span>
          </button>
        `;
      })
      .join('');

    const feedbackHtml =
      typeof selected === 'number'
        ? `<div class="feedback-banner ${selected === plate.correctIndex ? 'correct' : 'wrong'}">
             <span>${
               selected === plate.correctIndex
                 ? '✓ Ճիշտ է'
                 : `✕ Սխալ է · Ճիշտ պատասխանն է՝ ${plate.correctIndex + 1}. ${escapeHtml(plate.options[plate.correctIndex])}`
             }</span>
           </div>`
        : '';

    const gridHtml = plates
      .map((pl, gi) => {
        const cls = ['q-dot'];
        if (gi === idx) cls.push('current');
        const ans = ct.answers[pl.id];
        if (typeof ans === 'number') {
          cls.push(ans === pl.correctIndex ? 'correct' : 'wrong');
        }
        return `<button type="button" class="${cls.join(' ')}" data-ct-jump="${gi}">${pl.number}</button>`;
      })
      .join('');

    rootEl.innerHTML = `
      <div class="card">
        <div class="toolbar">
          <div class="toolbar-group">
            <strong>🎨 Գունաընկալման և հոգեբանական թեստեր</strong>
            <span class="pill-tag">${answeredCount} / ${plates.length} · ${correctCount} ճիշտ</span>
          </div>
          <div class="toolbar-group">
            <button type="button" class="btn btn-sm btn-primary" id="btn-ct-start-exam3">Քննական 3 հարց (0 սխալ)</button>
            <button type="button" class="btn btn-sm btn-danger" id="btn-ct-reset">Վերսկսել</button>
          </div>
        </div>

        <p style="color: var(--text-muted); margin-top: 0; font-size: 13.5px;">
          Իրական քննությունը սկսվում է 3 նմանատիպ հարցով, որտեղ բոլոր 3 պատասխանները պետք է ճիշտ լինեն (ՃԵԿ / Որոշում N 385-Ն)։
        </p>

        <div class="question-meta">
          <span>Աղյուսակ №${plate.number} (${idx + 1} / ${plates.length})</span>
          <span class="pill-tag">Գունաընկալում</span>
        </div>

        <div class="ishihara-wrap">
          <button type="button" class="color-plate-btn" data-zoom-src="${escapeHtml(plate.image)}" title="Սեղմեք մեծացնելու համար">
            <img src="${escapeHtml(plate.image)}" alt="Գունաընկալման աղյուսակ №${plate.number}" />
          </button>
        </div>

        <h2 class="question-text" style="text-align: center;">${escapeHtml(plate.question)}</h2>
        <div class="options-list">${optionsHtml}</div>
        ${feedbackHtml}

        <div class="question-footer">
          <div class="toolbar-group">
            <button type="button" class="btn" id="btn-ct-prev" ${idx === 0 ? 'disabled' : ''}>← Նախորդը</button>
            <button type="button" class="btn btn-primary" id="btn-ct-next" ${idx >= plates.length - 1 ? 'disabled' : ''}>Հաջորդը →</button>
          </div>
          <span class="kbd-hint">Սեղմեք նկարի վրա՝ մեծացնելու համար</span>
        </div>

        <div class="q-grid">${gridHtml}</div>
      </div>
    `;
  }

  // ---------- Tab 6: Cheat Sheet & Interactive Regulator ----------
  const REGULATOR_RULES = {
    up: {
      poseLabel: 'Ձեռքը բարձրացված է վեր',
      sides: {
        left: { cars: 'Արգելված է (կանգ առնել)', trams: 'Արգելված է', allowed: false },
        right: { cars: 'Արգելված է (կանգ առնել)', trams: 'Արգելված է', allowed: false },
        front: { cars: 'Արգելված է (կանգ առնել)', trams: 'Արգելված է', allowed: false },
        back: { cars: 'Արգելված է (կանգ առնել)', trams: 'Արգելված է', allowed: false },
      },
      note: 'Բացառություն՝ եթե վարորդը չի կարող կանգ առնել առանց կտրուկ արգելակելու, կարող է շարունակել երթևեկությունը (ՃԵԿ, կետ 19)։',
    },
    side: {
      poseLabel: 'Ձեռքերը կողմ պարզված կամ իջեցված են',
      sides: {
        left: { cars: 'Ուղիղ և դեպի աջ', trams: 'Միայն ուղիղ', allowed: true },
        right: { cars: 'Ուղիղ և դեպի աջ', trams: 'Միայն ուղիղ', allowed: true },
        front: { cars: 'Արգելված է', trams: 'Արգելված է', allowed: false },
        back: { cars: 'Արգելված է', trams: 'Արգելված է', allowed: false },
      },
      note: 'Կրծքի և թիկունքի կողմից երթևեկությունն արգելված է, իսկ կողքերից ոչ ռելսագնացները կարող են գնալ ուղիղ և աջ, տրամվայը՝ միայն ուղիղ (ՃԵԿ, կետ 16)։',
    },
    forward: {
      poseLabel: 'Աջ ձեռքը պարզված է առաջ',
      sides: {
        left: { cars: 'Բոլոր ուղղություններով (ուղիղ, աջ, ձախ, հետադարձ)', trams: 'Միայն դեպի ձախ', allowed: true },
        front: { cars: 'Միայն դեպի աջ', trams: 'Միայն դեպի աջ', allowed: true },
        right: { cars: 'Արգելված է', trams: 'Արգելված է', allowed: false },
        back: { cars: 'Արգելված է', trams: 'Արգելված է', allowed: false },
      },
      note: '«Ձախից՝ ինչպես թագավոր (բոլոր ուղղություններով), կրծքից՝ միայն աջ, աջից և թիկունքից՝ արգելված է» (ՃԵԿ, կետ 16)։',
    },
  };

  function buildRegulatorSvg(pose, approach) {
    const rule = REGULATOR_RULES[pose].sides[approach];
    const carColor = rule.allowed ? '#15803d' : '#b91c1c';
    const armLeft = pose === 'side' ? '<line x1="88" y1="120" x2="112" y2="120" stroke="#1e293b" stroke-width="6" stroke-linecap="round"/>' : '';
    const armRight =
      pose === 'side'
        ? '<line x1="128" y1="120" x2="152" y2="120" stroke="#1e293b" stroke-width="6" stroke-linecap="round"/>'
        : pose === 'forward'
        ? '<line x1="128" y1="120" x2="128" y2="152" stroke="#1d4ed8" stroke-width="6" stroke-linecap="round"/>'
        : '<line x1="128" y1="120" x2="144" y2="96" stroke="#b91c1c" stroke-width="6" stroke-linecap="round"/>';

    const carCoords = {
      left: { x: 26, y: 110, label: 'Ձախ' },
      right: { x: 186, y: 110, label: 'Աջ' },
      front: { x: 106, y: 192, label: 'Կուրծք' },
      back: { x: 106, y: 24, label: 'Թիկունք' },
    }[approach];

    return `
      <svg class="regulator-svg" viewBox="0 0 240 240" aria-label="Կարգավորողի սխեմա">
        <rect x="0" y="75" width="240" height="90" fill="#e2e8f0"/>
        <rect x="75" y="0" width="90" height="240" fill="#e2e8f0"/>
        <circle cx="120" cy="120" r="14" fill="#1e293b"/>
        <circle cx="120" cy="120" r="5" fill="#fff"/>
        <text x="120" y="99" text-anchor="middle" font-size="10" fill="#475569">Թիկունք</text>
        <text x="120" y="149" text-anchor="middle" font-size="10" fill="#475569">Կուրծք</text>
        ${armLeft}${armRight}
        <rect x="${carCoords.x}" y="${carCoords.y}" width="28" height="20" rx="5" fill="${carColor}"/>
        <text x="${carCoords.x + 14}" y="${carCoords.y + 13}" text-anchor="middle" font-size="9" font-weight="700" fill="#fff">ԱՎՏՈ</text>
      </svg>
    `;
  }

  function renderRulesResults() {
    const { docId, query, highlightRuleId } = session.cheatsheet;
    const docs = RULES_DATA.documents || [];
    const trimmedQuery = (query || '').trim();
    const countEl = document.getElementById('rules-count-pill');
    const container = document.getElementById('rules-results-container');
    if (!container) return;

    // Don't dump all rules by default; only show results when searching or jumping to a cited rule
    if (!trimmedQuery && !highlightRuleId) {
      if (countEl) countEl.textContent = 'Որոնման համար մուտքագրեք բառ կամ կետ';
      container.innerHTML = '';
      return;
    }

    let items = Core.filterRules(docs, { docId, query });
    if (!trimmedQuery && highlightRuleId) {
      items = items.filter((it) => it.id === highlightRuleId);
    }
    const shown = items.slice(0, 120);

    if (countEl) {
      countEl.textContent =
        items.length > shown.length
          ? `${shown.length} / ${items.length} արդյունք (ճշգրտեք որոնումը)`
          : `${items.length} կետ`;
    }

    if (shown.length === 0) {
      container.innerHTML =
        '<div class="card empty-state"><h2>Օրենքի կետեր չեն գտնվել</h2><p>Փորձեք փոխել որոնման բառը կամ փաստաթուղթը։</p></div>';
      return;
    }

    container.innerHTML = `
      <div class="rules-list">
        ${shown
          .map(
            (it) => `
          <article class="rule-item-card ${highlightRuleId && it.id === highlightRuleId ? 'highlight' : ''}" id="rule-${escapeHtml(it.id)}">
            <div class="rule-item-head">
              <span class="pill-tag">${escapeHtml(it.chapterTitle)}</span>
              ${it.ref ? `<span class="pill-tag success">${escapeHtml(it.ref)}</span>` : ''}
            </div>
            <p class="rule-item-text">${escapeHtml(it.text)}</p>
          </article>`
          )
          .join('')}
      </div>
    `;
  }

  function renderCheatSheet() {
    const { subtab, docId, query, pose, approach } = session.cheatsheet;
    const subBar = `
      <div class="subtab-bar">
        <button type="button" class="sign-cat-pill ${subtab === 'rules' ? 'active' : ''}" data-cs-subtab="rules">
          📖 Օրենք և ՃԵԿ (որոնելի)
        </button>
        <button type="button" class="sign-cat-pill ${subtab === 'guide' ? 'active' : ''}" data-cs-subtab="guide">
          🧭 Կարգավորող և հիմնական թվեր
        </button>
      </div>
    `;

    if (subtab === 'rules') {
      const docs = RULES_DATA.documents || [];
      rootEl.innerHTML = `
        <div class="card" style="margin-bottom: 16px;">
          ${subBar}
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 10px;">
            <h2 style="margin: 0; font-size: 19px;">ՀՀ Ճանապարհային երթևեկության կանոններ և օրենք</h2>
            <span class="pill-tag" id="rules-count-pill"></span>
          </div>
          <input
            type="search"
            class="input"
            style="width: 100%; margin-bottom: 10px;"
            id="rules-search-input"
            placeholder="Որոնել կետի համարով կամ բառով (օր.՝ վազանց, հետադարձ, կետ 39, հոդված 24, 15 օր)..."
            value="${escapeHtml(query)}"
          />
          <div class="signs-filters">
            <button type="button" class="sign-cat-pill ${docId === 'all' ? 'active' : ''}" data-rule-doc="all">Բոլորը</button>
            ${docs
              .map(
                (d) => `
              <button type="button" class="sign-cat-pill ${docId === d.id ? 'active' : ''}" data-rule-doc="${escapeHtml(d.id)}">
                ${escapeHtml(d.title)}
              </button>`
              )
              .join('')}
          </div>
        </div>
        <div id="rules-results-container"></div>
      `;

      renderRulesResults();

      document.getElementById('rules-search-input').addEventListener('input', (e) => {
        session.cheatsheet.query = e.target.value;
        session.cheatsheet.highlightRuleId = '';
        renderRulesResults();
      });
      return;
    }

    const poseObj = REGULATOR_RULES[pose];
    const sideInfo = poseObj.sides[approach];

    const poseLabels = {
      up: '1. Ձեռքը վեր բարձրացրած',
      side: '2. Ձեռքերը կողմ / իջեցված',
      forward: '3. Աջ ձեռքը առաջ պարզած',
    };
    const sideLabels = {
      left: 'Ձախ կողմից',
      front: 'Կրծքի կողմից',
      right: 'Աջ կողմից',
      back: 'Թիկունքի կողմից',
    };

    rootEl.innerHTML = `
      <div class="card">
        ${subBar}
        <h2 style="margin-top: 0;">Հուշաթերթ · Խաչմերուկներ, կարգավորող և հիմնական թվեր</h2>
        <p style="color: var(--text-muted); margin-top: 0;">
          Արագ կրկնություն քննությունից առաջ՝ կարգավորողի ինտերակտիվ մարզիչ, գերակայության հերթականություն և բոլոր քննական թվերը մեկ տեղում։
        </p>

        <h3 style="margin-bottom: 6px;">1. Երթևեկության կարգավորման գերակայության սանդուղք</h3>
        <div class="priority-steps">
          <div class="priority-step"><span class="priority-step-num">1</span><strong>Կարգավորող</strong> (գերակայում է ամեն ինչին՝ ՃԵԿ, կետ 20)</div>
          <div class="priority-step"><span class="priority-step-num">2</span><strong>Լուսացույց</strong> (գերակայում է առավելության նշաններին՝ կետ 173)</div>
          <div class="priority-step"><span class="priority-step-num">3</span><strong>Ժամանակավոր նշաններ / նարնջագույն գիծ</strong> (գերակայում են հաստատունին)</div>
          <div class="priority-step"><span class="priority-step-num">4</span><strong>Առավելության նշաններ / գծանշում</strong> (երբ լուսացույցն անջատված է կամ դեղին թարթող է)</div>
          <div class="priority-step"><span class="priority-step-num">5</span><strong>Հավասարազոր խաչմերուկ</strong> (Տրամվայ → Աջից արգելք, բացի 4.3 շրջանաձևից)</div>
        </div>
      </div>

      <div class="card">
        <h3 style="margin-top: 0;">2. Կարգավորողի ազդանշանների ինտերակտիվ մարզիչ</h3>
        <div class="regulator-layout">
          <div class="regulator-svg-box">
            ${buildRegulatorSvg(pose, approach)}
          </div>
          <div>
            <div style="font-size: 13px; font-weight: 700; color: var(--text-muted);">Ընտրեք կարգավորողի դիրքը․</div>
            <div class="choice-pills">
              ${Object.entries(poseLabels)
                .map(
                  ([k, lbl]) => `
                <button type="button" class="sign-cat-pill ${pose === k ? 'active' : ''}" data-reg-pose="${k}">${lbl}</button>`
                )
                .join('')}
            </div>

            <div style="font-size: 13px; font-weight: 700; color: var(--text-muted);">Ո՞ր կողմից եք մոտենում (կարգավորողը կանգնած է դեմքով դեպի ներքև)․</div>
            <div class="choice-pills">
              ${Object.entries(sideLabels)
                .map(
                  ([k, lbl]) => `
                <button type="button" class="sign-cat-pill ${approach === k ? 'active' : ''}" data-reg-side="${k}">${lbl}</button>`
                )
                .join('')}
            </div>

            <div class="feedback-banner ${sideInfo.allowed ? 'correct' : 'wrong'}" style="margin-top: 8px;">
              <div>
                <div><strong>Ավտոմոբիլներ․</strong> ${escapeHtml(sideInfo.cars)}</div>
                <div><strong>Տրամվայ․</strong> ${escapeHtml(sideInfo.trams)}</div>
              </div>
            </div>
            <p style="font-size: 13.5px; color: var(--text-muted); margin: 10px 0 0;">${escapeHtml(poseObj.note)}</p>
          </div>
        </div>
      </div>

      <div class="cheat-grid">
        <div class="card">
          <h3 style="margin-top: 0;">🚗 Առավելագույն արագություններ</h3>
          <ul class="cheat-list">
            <li><strong>20 կմ/ժ</strong> — բնակելի գոտի (5.21) և բակային տարածքներ</li>
            <li><strong>50 կմ/ժ</strong> — քարշակում</li>
            <li><strong>60 կմ/ժ</strong> — բնակավայրերում, երեխաներ/թափքում մարդ տեղափոխելիս</li>
            <li><strong>70 կմ/ժ</strong> — բնակավայրից դուրս՝ կցորդով թեթև մարդատար, 3.5տ+ բեռնատար</li>
            <li><strong>90 կմ/ժ</strong> — բնակավայրից դուրս (թեթև մարդատար, մինչև 3.5տ բեռնատար, մոտոցիկլ, միջքաղաքային ավտոբուս)</li>
            <li><strong>110 կմ/ժ</strong> — ավտոմայրուղում (թեթև մարդատար և մինչև 3.5տ բեռնատար)</li>
          </ul>
        </div>

        <div class="card">
          <h3 style="margin-top: 0;">📏 Հեռավորություններ և կանգառ</h3>
          <ul class="cheat-list">
            <li><strong>3 մ</strong> — նվազագույն տարածք մեքենայի և հոծ գծի միջև կանգառելիս</li>
            <li><strong>5 մ</strong> — հետիոտնային անցումից առաջ և խաչմերուկից. ուղեփակոցից կանգնելիս</li>
            <li><strong>10 մ</strong> — մոտակա ռելսից կանգնելիս (առանց ուղեփակոցի)</li>
            <li><strong>15 մ</strong> — տրանսպորտի կանգառից. վթարային նշանը բնակավայրում</li>
            <li><strong>30 մ</strong> — վթարային նշանը բնակավայրից դուրս</li>
            <li><strong>50 մ</strong> — կայանումն արգելված է գծանցներից մոտ</li>
            <li><strong>100 մ</strong> — վազանց/հետադարձ/կանգառ արգելված է տեսանելիության սահմանից պակաս</li>
            <li><strong>150 մ / 300 մ</strong> — լույսերի փոխարկում (150մ), անբավարար տեսանելիություն (300մ)</li>
          </ul>
        </div>

        <div class="card">
          <h3 style="margin-top: 0;">🛞 Դողեր, ղեկ և օրենք</h3>
          <ul class="cheat-list">
            <li><strong>Դողի նախշանկար՝</strong> 2.0 մմ (ավտոբուս), 1.6 մմ (թեթև մարդատար), 1.0 մմ (բեռնատար), 0.8 մմ (մոտոցիկլ), ≤ 4.0 մմ (ձմեռային՝ ձյան վրա)</li>
            <li><strong>Ձմեռային դողեր՝</strong> պարտադիր են <strong>նոյեմբերի 15 – մարտի 31</strong>, բութակավորներն արգելված են <strong>հունիս–օգոստոսին</strong></li>
            <li><strong>Ղեկի խաղացք՝</strong> max 10° (թեթև), 20° (ավտոբուս), 25° (բեռնատար)</li>
            <li><strong>Վկայական՝</strong> «AM» 16-ից, «A/B/C» 18-ից, «D» 21-ից · ուժի մեջ է 10 տարի · գրանցումը՝ 15 օրում</li>
          </ul>
        </div>

        <div class="card">
          <h3 style="margin-top: 0;">🩹 Առաջին օգնություն և թակարդներ</h3>
          <ul class="cheat-list">
            <li><strong>Լարան՝</strong> տաք եղանակին max <strong>1 ժամ</strong>, ցուրտ եղանակին՝ <strong>30 րոպե</strong></li>
            <li><strong>Շնչառության ստուգում՝</strong> 10 վայրկյան · նորմալ պուլս՝ 60–80, շնչառություն՝ 12–18</li>
            <li><strong>Այրվածք՝</strong> 20 րոպե սառեցնել ջրով, բշտիկները <strong>չբացել</strong></li>
            <li><strong>Ազդանշանը՝</strong> առավելություն չի տալիս (ՃԵԿ, կետ 36)</li>
            <li><strong>Միաժամանակ վերադասավորում՝</strong> զիջում է <strong>ձախից</strong> ընթացողը (կետ 39)</li>
            <li><strong>Կտրուկ վայրէջք/վերելք՝</strong> զիջում է <strong>վայրէջքով</strong> ընթացողը (կետ 46)</li>
          </ul>
        </div>
      </div>
    `;
  }

  // ---------- Tab 7: Search & Browse ----------
  function renderSearchResults() {
    const { query, groupId, imagesOnly, bookmarkedOnly, showAnswers, page, pageSize } = session.search;
    const filtered = Core.filterQuestions(DATA.groups, {
      query,
      groupId,
      imagesOnly,
      bookmarkedOnly,
      bookmarks: state.bookmarks,
      i18nData: EXAM_I18N,
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    session.search.page = safePage;
    const slice = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

    const metaEl = document.getElementById('search-meta-bar');
    if (metaEl) {
      metaEl.innerHTML = `
        <span>Գտնվել է՝ <strong>${filtered.length}</strong> հարց</span>
        <span>Էջ ${safePage} / ${totalPages}</span>
      `;
    }

    const resultsHtml =
      slice.length === 0
        ? '<div class="card empty-state"><h2>Հարցեր չեն գտնվել</h2><p>Փորձեք փոխել որոնման բառը կամ զտիչները։</p></div>'
        : slice
            .map((q) => {
              const qText = getQText(q);
              const qOpts = getQOptions(q);
              const opts = qOpts
                .map((opt, idx) => {
                  const isRight = showAnswers && idx === q.correctIndex;
                  return `<li class="${isRight ? 'is-correct' : ''}">${idx + 1}. ${escapeHtml(opt)} ${isRight ? '✓' : ''}</li>`;
                })
                .join('');
              return `
                <div class="search-result-card">
                  <div class="question-meta">
                    <span><strong>${t('groupWord')} ${q.groupId}</strong> · ${t('questionWord')} №${q.number}</span>
                    <div class="toolbar-group">
                      ${renderBookmarkBtnHtml(q.uid)}
                      <button type="button" class="btn btn-sm btn-ghost" data-open-in-practice="${q.groupId}:${q.number}">
                        Բացել ուսուցման մեջ
                      </button>
                    </div>
                  </div>
                  <div style="font-weight: 600; margin-bottom: 10px;">${escapeHtml(qText)}${renderBilingualHintHtml(q)}</div>
                  ${renderImagesHtml(q.images)}
                  <ul class="search-options">${opts}</ul>
                  ${renderExplanationTabHtml(q, 'search')}
                </div>
              `;
            })
            .join('');

    const container = document.getElementById('search-results-container');
    if (container) {
      container.innerHTML = resultsHtml;
    }

    const paginationEl = document.getElementById('search-pagination-bar');
    if (paginationEl) {
      paginationEl.innerHTML =
        totalPages > 1
          ? `<div class="card pagination-bar">
               <button type="button" class="btn" id="btn-search-prev" ${safePage <= 1 ? 'disabled' : ''}>← Նախորդ էջ</button>
               <span>Էջ ${safePage} / ${totalPages}</span>
               <button type="button" class="btn" id="btn-search-next" ${safePage >= totalPages ? 'disabled' : ''}>Հաջորդ էջ →</button>
             </div>`
          : '';
    }
  }

  function renderSearch() {
    // Keep input & controls mounted so iOS/iPadOS virtual keyboard doesn't close while typing
    if (document.getElementById('search-input') && document.getElementById('search-results-container')) {
      renderSearchResults();
      return;
    }

    const { query, groupId, imagesOnly, bookmarkedOnly, showAnswers } = session.search;
    const groupOptions = [
      `<option value="all" ${groupId === 'all' ? 'selected' : ''}>Բոլոր խմբերը (1–10)</option>`,
      ...DATA.groups.map(
        (g) => `<option value="${g.id}" ${Number(groupId) === g.id ? 'selected' : ''}>${t('groupWord')} ${g.id} (${g.questionCount})</option>`
      ),
    ].join('');

    rootEl.innerHTML = `
      <div class="card" style="margin-bottom: 16px;">
        <div class="search-controls">
          <input
            type="search"
            class="input"
            id="search-input"
            placeholder="Որոնել հայերեն, ռուսերեն կամ անգլերեն..."
            value="${escapeHtml(query)}"
          />
          <select class="select" id="search-group">${groupOptions}</select>
          <label class="checkbox-label">
            <input type="checkbox" id="search-images-only" ${imagesOnly ? 'checked' : ''} />
            Միայն նկարով
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="search-bookmarks-only" ${bookmarkedOnly ? 'checked' : ''} />
            ★ Պահված
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="search-show-answers" ${showAnswers ? 'checked' : ''} />
            Պատասխանները
          </label>
        </div>
        <div id="search-meta-bar" style="margin-top: 10px; font-size: 13px; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;"></div>
      </div>

      <div id="search-results-container"></div>
      <div id="search-pagination-bar"></div>
    `;

    renderSearchResults();

    document.getElementById('search-input').addEventListener('input', (e) => {
      session.search.query = e.target.value;
      session.search.page = 1;
      renderSearchResults();
    });
    document.getElementById('search-group').addEventListener('change', (e) => {
      session.search.groupId = e.target.value;
      session.search.page = 1;
      renderSearchResults();
    });
    document.getElementById('search-images-only').addEventListener('change', (e) => {
      session.search.imagesOnly = e.target.checked;
      session.search.page = 1;
      renderSearchResults();
    });
    document.getElementById('search-bookmarks-only').addEventListener('change', (e) => {
      session.search.bookmarkedOnly = e.target.checked;
      session.search.page = 1;
      renderSearchResults();
    });
    document.getElementById('search-show-answers').addEventListener('change', (e) => {
      session.search.showAnswers = e.target.checked;
      renderSearchResults();
    });
  }

  // ---------- Main Render & Event Delegation ----------
  function render() {
    const tab = state.ui.activeTab;
    if (tab === 'home') renderHome();
    else if (tab === 'practice') renderPractice();
    else if (tab === 'exam') renderExam();
    else if (tab === 'mistakes') renderMistakes();
    else if (tab === 'signs') renderSigns();
    else if (tab === 'colortest') renderColorTest();
    else if (tab === 'cheatsheet') renderCheatSheet();
    else if (tab === 'search') renderSearch();
    else {
      state.ui.activeTab = 'home';
      renderHome();
    }
    updateHeaderStats();
  }

  const brandHomeBtn = document.getElementById('btn-brand-home');
  if (brandHomeBtn) {
    brandHomeBtn.addEventListener('click', () => {
      state.ui.activeTab = 'home';
      persist();
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.ui.lang = btn.dataset.lang;
      persist();
      render();
    });
  });

  const dailyGoalBtn = document.getElementById('btn-daily-goal');
  if (dailyGoalBtn) {
    dailyGoalBtn.addEventListener('click', () => {
      const goals = [10, 20, 30, 50];
      const cur = (state.study && state.study.dailyGoal) || 20;
      const next = goals[(goals.indexOf(cur) + 1) % goals.length];
      state = Core.setDailyGoal(state, next);
      persist();
      render();
      showToast(`Օրական նպատակը՝ ${next} հարց`);
    });
  }

  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      if (target === 'mistakes') {
        syncMistakeQueue(true);
      }
      state.ui.activeTab = target;
      persist();
      render();
      if (typeof btn.scrollIntoView === 'function') {
        btn.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      }
    });
  });

  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  lightboxEl.addEventListener('click', (e) => {
    if (e.target === lightboxEl) closeLightbox();
  });

  if (signModalEl) {
    document.getElementById('sign-modal-close').addEventListener('click', closeSignModal);
    signModalEl.addEventListener('click', (e) => {
      if (e.target === signModalEl || e.target.id === 'sign-modal-done') {
        closeSignModal();
        return;
      }
      const pSignBtn = e.target.closest('[data-practice-sign]');
      if (pSignBtn) {
        const code = pSignBtn.dataset.practiceSign;
        const qs = QUESTIONS_BY_SIGN_CODE[code] || [];
        closeSignModal();
        if (qs.length > 0) {
          session.practiceFocus = {
            mode: 'sign',
            label: `Նշան ${code}-ի հարցեր`,
            questions: qs,
            index: 0,
            attemptByUid: {},
          };
          state.ui.activeTab = 'practice';
          persist();
          render();
        }
      }
    });
  }

  rootEl.addEventListener('click', (e) => {
    const navTabBtn = e.target.closest('[data-nav-tab]');
    if (navTabBtn) {
      const target = navTabBtn.dataset.navTab;
      if (target === 'mistakes') {
        syncMistakeQueue(true);
      }
      state.ui.activeTab = target;
      persist();
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const signRefBtn = e.target.closest('[data-open-sign]');
    if (signRefBtn) {
      openSignModal(signRefBtn.dataset.openSign);
      return;
    }

    const ruleRefBtn = e.target.closest('[data-open-rule]');
    if (ruleRefBtn) {
      const ruleId = ruleRefBtn.dataset.openRule;
      const info = RULE_ID_LOOKUP[ruleId];
      if (info) {
        session.cheatsheet.subtab = 'rules';
        session.cheatsheet.docId = info.docId;
        session.cheatsheet.query = '';
        session.cheatsheet.highlightRuleId = ruleId;
        state.ui.activeTab = 'cheatsheet';
        persist();
        render();
        setTimeout(() => {
          const el = document.getElementById(`rule-${ruleId}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 60);
      }
      return;
    }

    const bmBtn = e.target.closest('[data-toggle-bookmark]');
    if (bmBtn) {
      const uid = bmBtn.dataset.toggleBookmark;
      const res = Core.toggleBookmark(state, uid);
      state = res.state;
      persist();
      render();
      showToast(res.bookmarked ? 'Հարցը պահվեց ընտրվածներում' : 'Հարցը հեռացվեց պահվածներից');
      return;
    }

    const pSignBtn = e.target.closest('[data-practice-sign]');
    if (pSignBtn) {
      const code = pSignBtn.dataset.practiceSign;
      const qs = QUESTIONS_BY_SIGN_CODE[code] || [];
      if (qs.length > 0) {
        session.practiceFocus = {
          mode: 'sign',
          label: `Նշան ${code}-ի հարցեր`,
          questions: qs,
          index: 0,
          attemptByUid: {},
        };
        state.ui.activeTab = 'practice';
        persist();
        render();
      }
      return;
    }

    const expBtn = e.target.closest('[data-toggle-exp]');
    if (expBtn) {
      const key = expBtn.dataset.toggleExp;
      session.openExplanations[key] = !session.openExplanations[key];
      render();
      return;
    }

    const zoomBtn = e.target.closest('[data-zoom-src]');
    if (zoomBtn) {
      openLightbox(zoomBtn.dataset.zoomSrc);
      return;
    }

    // Practice focus & smart drill interactions
    if (e.target.id === 'btn-smart-drill') {
      const drillQs = Core.generateSmartDrill(DATA.groups, state, 10);
      session.practiceFocus = {
        mode: 'smart',
        label: '⚡ Խելացի մարզում (10 հարց)',
        questions: drillQs,
        index: 0,
        attemptByUid: {},
      };
      render();
      return;
    }

    if (e.target.id === 'btn-bookmarks-drill') {
      const bmUids = Object.keys(state.bookmarks || {});
      const bmQs = bmUids.map((uid) => QUESTIONS_BY_UID[uid]).filter(Boolean);
      if (bmQs.length === 0) {
        showToast('Պահված հարցեր չկան');
        return;
      }
      session.practiceFocus = {
        mode: 'bookmarks',
        label: `★ Պահված հարցեր (${bmQs.length})`,
        questions: bmQs,
        index: 0,
        attemptByUid: {},
      };
      render();
      return;
    }

    if (e.target.id === 'btn-toggle-bilingual') {
      state.ui.bilingual = !state.ui.bilingual;
      persist();
      render();
      return;
    }

    if (e.target.id === 'btn-exit-focus') {
      session.practiceFocus = null;
      render();
      return;
    }

    const focusOpt = e.target.closest('[data-focus-opt]');
    if (focusOpt && session.practiceFocus) {
      const q = session.practiceFocus.questions[session.practiceFocus.index];
      if (!q || session.practiceFocus.attemptByUid[q.uid]) return;
      const selIdx = Number(focusOpt.dataset.focusOpt);
      const isCorrect = selIdx === q.correctIndex;
      session.practiceFocus.attemptByUid[q.uid] = { selectedIndex: selIdx, isCorrect };
      // Also record into practice/mistakes so readiness stays up to date
      const res = Core.recordPracticeAnswer(state, q.uid, selIdx, q.correctIndex);
      state = res.state;
      state = Core.recordStudyActivity(state);
      if (isCorrect && state.mistakes[q.uid]) {
        state = Core.retryMistakeAnswer(state, q.uid, selIdx, q.correctIndex).state;
      } else if (!isCorrect && !res.newlyRecorded) {
        state = Core.retryMistakeAnswer(state, q.uid, selIdx, q.correctIndex).state;
      }
      persist();
      render();
      return;
    }

    const focusJump = e.target.closest('[data-focus-jump]');
    if (focusJump && session.practiceFocus) {
      session.practiceFocus.index = Number(focusJump.dataset.focusJump);
      render();
      return;
    }

    if (e.target.id === 'btn-focus-prev' && session.practiceFocus) {
      session.practiceFocus.index = Math.max(0, session.practiceFocus.index - 1);
      render();
      return;
    }

    if (e.target.id === 'btn-focus-next' && session.practiceFocus) {
      session.practiceFocus.index = Math.min(
        session.practiceFocus.questions.length - 1,
        session.practiceFocus.index + 1
      );
      render();
      return;
    }

    // Practice interactions
    const groupBtn = e.target.closest('[data-select-group]');
    if (groupBtn) {
      state.ui.activeGroupId = Number(groupBtn.dataset.selectGroup);
      persist();
      render();
      return;
    }

    const practiceOpt = e.target.closest('[data-practice-opt]');
    if (practiceOpt) {
      const gid = state.ui.activeGroupId || 1;
      const questions = getGroupQuestionsInOrder(gid);
      const qIdx = state.ui.activeQuestionIndexByGroup[gid] || 0;
      const q = questions[qIdx];
      if (!q) return;
      const res = Core.recordPracticeAnswer(state, q.uid, Number(practiceOpt.dataset.practiceOpt), q.correctIndex);
      state = res.state;
      if (res.newlyRecorded) {
        state = Core.recordStudyActivity(state);
      }
      persist();
      render();
      return;
    }

    const practiceJump = e.target.closest('[data-practice-jump]');
    if (practiceJump) {
      const gid = state.ui.activeGroupId || 1;
      state.ui.activeQuestionIndexByGroup[gid] = Number(practiceJump.dataset.practiceJump);
      persist();
      render();
      return;
    }

    if (e.target.id === 'btn-prev-q') {
      const gid = state.ui.activeGroupId || 1;
      state.ui.activeQuestionIndexByGroup[gid] = Math.max(0, (state.ui.activeQuestionIndexByGroup[gid] || 0) - 1);
      persist();
      render();
      return;
    }

    if (e.target.id === 'btn-next-q') {
      const gid = state.ui.activeGroupId || 1;
      const total = getGroupQuestionsInOrder(gid).length;
      state.ui.activeQuestionIndexByGroup[gid] = Math.min(total - 1, (state.ui.activeQuestionIndexByGroup[gid] || 0) + 1);
      persist();
      render();
      return;
    }

    if (e.target.id === 'btn-next-unanswered') {
      const gid = state.ui.activeGroupId || 1;
      const questions = getGroupQuestionsInOrder(gid);
      const cur = state.ui.activeQuestionIndexByGroup[gid] || 0;
      let found = -1;
      for (let offset = 1; offset <= questions.length; offset++) {
        const idx = (cur + offset) % questions.length;
        if (!state.practice[questions[idx].uid]) {
          found = idx;
          break;
        }
      }
      if (found === -1) {
        showToast('Այս խմբի բոլոր հարցերին արդեն պատասխանել եք');
      } else {
        state.ui.activeQuestionIndexByGroup[gid] = found;
        persist();
        render();
      }
      return;
    }

    if (e.target.id === 'btn-toggle-shuffle') {
      const gid = state.ui.activeGroupId || 1;
      const nextShuffle = !state.ui.shuffleByGroup[gid];
      state.ui.shuffleByGroup[gid] = nextShuffle;
      if (nextShuffle) {
        session.shuffledOrderByGroup[gid] = Core.shuffleArray(GROUPS_BY_ID[gid].questions).map((q) => q.uid);
      } else {
        delete session.shuffledOrderByGroup[gid];
      }
      state.ui.activeQuestionIndexByGroup[gid] = 0;
      persist();
      render();
      return;
    }

    if (e.target.id === 'btn-reset-group') {
      const gid = state.ui.activeGroupId || 1;
      if (confirm(`Վերսկսե՞լ Խումբ ${gid}-ի առաջընթացը։`)) {
        state = Core.resetGroupPractice(state, GROUPS_BY_ID[gid].questions);
        state.ui.activeQuestionIndexByGroup[gid] = 0;
        persist();
        render();
      }
      return;
    }

    // Exam interactions
    if (e.target.id === 'btn-start-color-exam') {
      startColorPreTest();
      return;
    }

    const colorOpt = e.target.closest('[data-color-opt]');
    if (colorOpt && session.exam.status === 'color_test') {
      const step = session.exam.colorStep || 0;
      const realList = session.exam.colorPlates;
      let isOk = false;
      if (realList && realList[step]) {
        isOk = Number(colorOpt.dataset.colorOpt) === realList[step].correctIndex;
      } else {
        isOk = colorOpt.dataset.colorOpt === COLOR_PLATES[step].answer;
      }
      const totalPlates = realList ? realList.length : COLOR_PLATES.length;
      if (isOk) {
        if (step + 1 >= totalPlates) {
          showToast('Գունաընկալումը հանձնված է · սկսում ենք քննությունը');
          startExam();
        } else {
          session.exam.colorStep = step + 1;
          render();
        }
      } else {
        session.exam.colorFailed = true;
        render();
      }
      return;
    }

    if (e.target.id === 'btn-start-exam') {
      startExam();
      return;
    }

    const examOpt = e.target.closest('[data-exam-opt]');
    if (examOpt && session.exam.status === 'running') {
      const q = session.exam.questions[session.exam.currentIndex];
      session.exam.answersByUid[q.uid] = Number(examOpt.dataset.examOpt);
      render();
      return;
    }

    const examJump = e.target.closest('[data-exam-jump]');
    if (examJump && session.exam.status === 'running') {
      session.exam.currentIndex = Number(examJump.dataset.examJump);
      render();
      return;
    }

    if (e.target.id === 'btn-exam-prev' && session.exam.status === 'running') {
      session.exam.currentIndex = Math.max(0, session.exam.currentIndex - 1);
      render();
      return;
    }

    if (e.target.id === 'btn-exam-next' && session.exam.status === 'running') {
      session.exam.currentIndex = Math.min(session.exam.questions.length - 1, session.exam.currentIndex + 1);
      render();
      return;
    }

    if (e.target.id === 'btn-finish-exam' && session.exam.status === 'running') {
      const unanswered = session.exam.questions.length - Object.keys(session.exam.answersByUid).length;
      if (unanswered > 0 && !confirm(`Դուք ունեք ${unanswered} չպատասխանված հարց։ Ավարտե՞լ քննությունը։`)) {
        return;
      }
      finishExam(false);
      return;
    }

    if (e.target.id === 'btn-goto-mistakes') {
      syncMistakeQueue(true);
      state.ui.activeTab = 'mistakes';
      persist();
      render();
      return;
    }

    // Mistakes interactions
    if (e.target.id === 'btn-back-practice') {
      state.ui.activeTab = 'practice';
      persist();
      render();
      return;
    }

    const mistakeOpt = e.target.closest('[data-mistake-opt]');
    if (mistakeOpt) {
      const uid = session.mistakes.queueUids[session.mistakes.currentIndex];
      const q = QUESTIONS_BY_UID[uid];
      if (!q || session.mistakes.attemptByUid[uid]) return;
      const selectedIndex = Number(mistakeOpt.dataset.mistakeOpt);
      const res = Core.retryMistakeAnswer(state, uid, selectedIndex, q.correctIndex);
      state = Core.recordStudyActivity(res.state);
      session.mistakes.attemptByUid[uid] = {
        selectedIndex,
        isCorrect: res.isCorrect,
        resolved: res.resolved,
        streak: res.streak,
      };
      persist();
      render();
      return;
    }

    const mistakeJump = e.target.closest('[data-mistake-jump]');
    if (mistakeJump) {
      session.mistakes.currentIndex = Number(mistakeJump.dataset.mistakeJump);
      render();
      return;
    }

    if (e.target.id === 'btn-mistake-prev') {
      session.mistakes.currentIndex = Math.max(0, session.mistakes.currentIndex - 1);
      render();
      return;
    }

    if (e.target.id === 'btn-mistake-next') {
      session.mistakes.currentIndex = Math.min(
        session.mistakes.queueUids.length - 1,
        session.mistakes.currentIndex + 1
      );
      render();
      return;
    }

    if (e.target.id === 'btn-refresh-mistakes') {
      syncMistakeQueue(true);
      render();
      return;
    }

    if (e.target.id === 'btn-clear-mistakes') {
      if (confirm('Ջնջե՞լ բոլոր պահպանված սխալները։')) {
        state = Core.clearAllMistakes(state);
        session.mistakes.queueUids = [];
        session.mistakes.attemptByUid = {};
        persist();
        render();
      }
      return;
    }

    // Signs interactions
    if (e.target.id === 'btn-sign-mode-quiz' || e.target.id === 'btn-sign-quiz-restart') {
      startSignQuiz();
      return;
    }

    if (e.target.id === 'btn-sign-mode-browse') {
      session.signs.mode = 'browse';
      renderSigns();
      return;
    }

    const signQuizOpt = e.target.closest('[data-sign-quiz-opt]');
    if (signQuizOpt && session.signs.mode === 'quiz') {
      const qi = session.signs.quiz.index;
      if (typeof session.signs.quiz.answers[qi] !== 'number') {
        session.signs.quiz.answers[qi] = Number(signQuizOpt.dataset.signQuizOpt);
        renderSigns();
      }
      return;
    }

    if (e.target.id === 'btn-sign-quiz-prev' && session.signs.mode === 'quiz') {
      session.signs.quiz.index = Math.max(0, session.signs.quiz.index - 1);
      renderSigns();
      return;
    }

    if (e.target.id === 'btn-sign-quiz-next' && session.signs.mode === 'quiz') {
      session.signs.quiz.index = Math.min(
        session.signs.quiz.items.length - 1,
        session.signs.quiz.index + 1
      );
      renderSigns();
      return;
    }

    const signSectionBtn = e.target.closest('[data-signs-section]');
    if (signSectionBtn) {
      session.signs.section = signSectionBtn.dataset.signsSection;
      session.signs.mode = 'browse';
      session.signs.query = '';
      renderSigns();
      return;
    }

    const markingCatBtn = e.target.closest('[data-marking-cat]');
    if (markingCatBtn) {
      const val = markingCatBtn.dataset.markingCat;
      session.signs.markingCatId = val === 'all' ? 'all' : Number(val);
      renderSigns();
      return;
    }

    const signCatBtn = e.target.closest('[data-sign-cat]');
    if (signCatBtn) {
      const val = signCatBtn.dataset.signCat;
      session.signs.categoryId = val === 'all' ? 'all' : Number(val);
      renderSigns();
      return;
    }

    // Color Blindness / Psychological test interactions
    if (e.target.id === 'btn-ct-start-exam3') {
      startColorExam3();
      return;
    }

    if (e.target.id === 'btn-ct-mode-practice') {
      session.colortest.mode = 'practice';
      renderColorTest();
      return;
    }

    const ctExam3Opt = e.target.closest('[data-ct-exam3-opt]');
    if (ctExam3Opt && session.colortest.mode === 'exam3') {
      const p = session.colortest.examPlates[session.colortest.examIndex];
      if (!p) return;
      if (Number(ctExam3Opt.dataset.ctExam3Opt) === p.correctIndex) {
        if (session.colortest.examIndex + 1 >= session.colortest.examPlates.length) {
          session.colortest.examPassed = true;
        } else {
          session.colortest.examIndex += 1;
        }
      } else {
        session.colortest.examFailed = true;
      }
      renderColorTest();
      return;
    }

    const ctOpt = e.target.closest('[data-ct-opt]');
    if (ctOpt) {
      const plates = COLOR_TESTS_DATA.plates || [];
      const p = plates[session.colortest.index];
      if (!p || typeof session.colortest.answers[p.id] === 'number') return;
      session.colortest.answers[p.id] = Number(ctOpt.dataset.ctOpt);
      renderColorTest();
      return;
    }

    const ctJump = e.target.closest('[data-ct-jump]');
    if (ctJump) {
      session.colortest.index = Number(ctJump.dataset.ctJump);
      renderColorTest();
      return;
    }

    if (e.target.id === 'btn-ct-prev') {
      session.colortest.index = Math.max(0, session.colortest.index - 1);
      renderColorTest();
      return;
    }

    if (e.target.id === 'btn-ct-next') {
      const plates = COLOR_TESTS_DATA.plates || [];
      session.colortest.index = Math.min(plates.length - 1, session.colortest.index + 1);
      renderColorTest();
      return;
    }

    if (e.target.id === 'btn-ct-reset') {
      session.colortest.answers = {};
      session.colortest.index = 0;
      renderColorTest();
      return;
    }

    // Cheat Sheet / Law & Rules interactions
    const csSubBtn = e.target.closest('[data-cs-subtab]');
    if (csSubBtn) {
      session.cheatsheet.subtab = csSubBtn.dataset.csSubtab;
      renderCheatSheet();
      return;
    }

    const ruleDocBtn = e.target.closest('[data-rule-doc]');
    if (ruleDocBtn) {
      session.cheatsheet.docId = ruleDocBtn.dataset.ruleDoc;
      session.cheatsheet.highlightRuleId = '';
      renderCheatSheet();
      return;
    }

    const regPoseBtn = e.target.closest('[data-reg-pose]');
    if (regPoseBtn) {
      session.cheatsheet.pose = regPoseBtn.dataset.regPose;
      renderCheatSheet();
      return;
    }

    const regSideBtn = e.target.closest('[data-reg-side]');
    if (regSideBtn) {
      session.cheatsheet.approach = regSideBtn.dataset.regSide;
      renderCheatSheet();
      return;
    }

    // Search interactions
    const openInPracticeBtn = e.target.closest('[data-open-in-practice]');
    if (openInPracticeBtn) {
      const [gidStr, qnumStr] = openInPracticeBtn.dataset.openInPractice.split(':');
      const gid = Number(gidStr);
      const qnum = Number(qnumStr);
      state.ui.shuffleByGroup[gid] = false;
      state.ui.activeGroupId = gid;
      state.ui.activeQuestionIndexByGroup[gid] = Math.max(0, qnum - 1);
      state.ui.activeTab = 'practice';
      persist();
      render();
      return;
    }

    if (e.target.id === 'btn-search-prev') {
      session.search.page = Math.max(1, session.search.page - 1);
      renderSearch();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (e.target.id === 'btn-search-next') {
      session.search.page += 1;
      renderSearch();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (signModalEl && !signModalEl.hidden && e.key === 'Escape') {
      closeSignModal();
      return;
    }
    if (!lightboxEl.hidden && e.key === 'Escape') {
      closeLightbox();
      return;
    }
    if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
      return;
    }

    if (state.ui.activeTab === 'practice') {
      const gid = state.ui.activeGroupId || 1;
      const questions = getGroupQuestionsInOrder(gid);
      const qIdx = state.ui.activeQuestionIndexByGroup[gid] || 0;
      const q = questions[qIdx];
      if (!q) return;

      if (e.key >= '1' && e.key <= '9') {
        const optIdx = Number(e.key) - 1;
        if (optIdx < q.options.length && !state.practice[q.uid]) {
          const res = Core.recordPracticeAnswer(state, q.uid, optIdx, q.correctIndex);
          state = res.state;
          if (res.newlyRecorded) {
            state = Core.recordStudyActivity(state);
          }
          persist();
          render();
        }
      } else if (e.key === 'ArrowLeft') {
        if (qIdx > 0) {
          state.ui.activeQuestionIndexByGroup[gid] = qIdx - 1;
          persist();
          render();
        }
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (qIdx < questions.length - 1) {
          state.ui.activeQuestionIndexByGroup[gid] = qIdx + 1;
          persist();
          render();
        }
      }
    } else if (state.ui.activeTab === 'exam' && session.exam.status === 'running') {
      const q = session.exam.questions[session.exam.currentIndex];
      if (e.key >= '1' && e.key <= '9') {
        const optIdx = Number(e.key) - 1;
        if (optIdx < q.options.length) {
          session.exam.answersByUid[q.uid] = optIdx;
          render();
        }
      } else if (e.key === 'ArrowLeft' && session.exam.currentIndex > 0) {
        session.exam.currentIndex -= 1;
        render();
      } else if (e.key === 'ArrowRight' && session.exam.currentIndex < session.exam.questions.length - 1) {
        session.exam.currentIndex += 1;
        render();
      }
    }
  });

  render();

  // ---------- Floating Draggable Yellow Sticky Note ----------
  (function initStickyNote() {
    const noteEl = document.getElementById('sticky-note');
    const dragHandle = document.getElementById('sticky-note-drag');
    const minBtn = document.getElementById('sticky-btn-min');
    const delBtn = document.getElementById('sticky-btn-del');
    const textarea = document.getElementById('sticky-note-text');
    const openNoteBtn = document.getElementById('btn-open-note');
    if (!noteEl || !dragHandle || !minBtn || !delBtn || !textarea || !openNoteBtn) return;

    function clampPosition(x, y) {
      const rect = noteEl.getBoundingClientRect();
      const w = rect.width || 260;
      const h = rect.height || 44;
      const maxX = Math.max(8, window.innerWidth - w - 8);
      const maxY = Math.max(8, window.innerHeight - h - 8);
      return {
        x: Math.min(Math.max(8, x), maxX),
        y: Math.min(Math.max(8, y), maxY),
      };
    }

    function applyNoteState() {
      const sn = state.stickyNote || { visible: true, minimized: false, deleted: false, text: '', x: null, y: null };
      if (sn.deleted || !sn.visible) {
        noteEl.hidden = true;
        return;
      }
      noteEl.hidden = false;
      noteEl.classList.toggle('minimized', Boolean(sn.minimized));
      minBtn.textContent = sn.minimized ? '▢' : '―';
      minBtn.title = sn.minimized ? 'Բացել նշումը' : 'Փոքրացնել';
      if (textarea.value !== sn.text) {
        textarea.value = sn.text || '';
      }
      if (typeof sn.x === 'number' && typeof sn.y === 'number') {
        noteEl.style.right = 'auto';
        noteEl.style.bottom = 'auto';
        const pos = clampPosition(sn.x, sn.y);
        noteEl.style.left = `${pos.x}px`;
        noteEl.style.top = `${pos.y}px`;
      } else {
        noteEl.style.left = '';
        noteEl.style.top = '';
        noteEl.style.right = '';
        noteEl.style.bottom = '';
      }
    }

    textarea.addEventListener('input', () => {
      state.stickyNote.text = textarea.value;
      persist();
    });

    minBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.stickyNote.minimized = !state.stickyNote.minimized;
      persist();
      applyNoteState();
    });

    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.stickyNote.text.trim() && !confirm('Ջնջե՞լ դեղին նշումը և դրա տեքստը։')) {
        return;
      }
      state.stickyNote.text = '';
      state.stickyNote.deleted = true;
      state.stickyNote.visible = false;
      state.stickyNote.minimized = false;
      persist();
      applyNoteState();
      showToast('Նշումը ջնջվեց (կարող եք նորից բացել վերևի 📝 կոճակով)');
    });

    openNoteBtn.addEventListener('click', () => {
      if (state.stickyNote.deleted || !state.stickyNote.visible) {
        state.stickyNote.deleted = false;
        state.stickyNote.visible = true;
        state.stickyNote.minimized = false;
      } else {
        state.stickyNote.minimized = !state.stickyNote.minimized;
      }
      persist();
      applyNoteState();
      if (!state.stickyNote.minimized) {
        textarea.focus();
      }
    });

    let dragCtx = null;
    dragHandle.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      const rect = noteEl.getBoundingClientRect();
      dragCtx = {
        pointerId: e.pointerId,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
      };
      dragHandle.setPointerCapture(e.pointerId);
      noteEl.style.right = 'auto';
      noteEl.style.bottom = 'auto';
      noteEl.style.left = `${rect.left}px`;
      noteEl.style.top = `${rect.top}px`;
    });

    dragHandle.addEventListener('pointermove', (e) => {
      if (!dragCtx || e.pointerId !== dragCtx.pointerId) return;
      const pos = clampPosition(e.clientX - dragCtx.offsetX, e.clientY - dragCtx.offsetY);
      noteEl.style.left = `${pos.x}px`;
      noteEl.style.top = `${pos.y}px`;
    });

    function finishDrag(e) {
      if (!dragCtx || e.pointerId !== dragCtx.pointerId) return;
      const rect = noteEl.getBoundingClientRect();
      state.stickyNote.x = Math.round(rect.left);
      state.stickyNote.y = Math.round(rect.top);
      persist();
      dragCtx = null;
    }

    dragHandle.addEventListener('pointerup', finishDrag);
    dragHandle.addEventListener('pointercancel', finishDrag);
    window.addEventListener('resize', applyNoteState);

    applyNoteState();
  })();

  // Lightweight privacy-friendly unique-visitor & total-visits tracking on deployed hosts
  (function initVisitorTracking() {
    if (!Core.shouldTrackAnalytics(window.location) || typeof fetch !== 'function') return;
    const ops = Core.getAnalyticsOperations(window.localStorage);
    const base = `https://abacus.jasoncameron.dev`;
    const ns = Core.ANALYTICS_NAMESPACE;

    const callCounter = (endpoint, key) =>
      fetch(`${base}/${endpoint}/${ns}/${key}`, { method: 'GET', mode: 'cors' })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);

    Promise.all([
      callCounter(ops.visitorEndpoint, 'unique-visitors').then((res) => {
        if (res && typeof res.value === 'number' && ops.visitorEndpoint === 'hit') {
          ops.markVisitorCounted();
        }
        return res;
      }),
      callCounter(ops.visitEndpoint, 'page-opens'),
    ]).then(([visitorsRes, opensRes]) => {
      const wrap = document.getElementById('visit-stats');
      const vEl = document.getElementById('stat-visitors');
      const oEl = document.getElementById('stat-opens');
      if (!wrap || !vEl || !oEl) return;
      if (visitorsRes && typeof visitorsRes.value === 'number') {
        vEl.textContent = String(visitorsRes.value);
        wrap.hidden = false;
      }
      if (opensRes && typeof opensRes.value === 'number') {
        oEl.textContent = String(opensRes.value);
        wrap.hidden = false;
      }
    });
  })();

  // Register offline PWA service worker on http/https hosts
  if (
    'serviceWorker' in navigator &&
    (window.location.protocol === 'https:' || window.location.protocol === 'http:')
  ) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
})();
