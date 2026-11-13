(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.RoadPoliceCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
  const STORAGE_KEY = 'roadpolice_abc_v1';
  const EXAM_DURATION_SEC = 1800;
  const EXAM_PASS_SCORE = 18;
  const MAX_HISTORY_ITEMS = 50;
  const MISTAKE_CLEAR_STREAK = 2;
  const DEFAULT_DAILY_GOAL = 20;

  function normalizeArmenian(text) {
    if (typeof text !== 'string') return '';
    return text
      .normalize('NFC')
      .replace(/և/g, 'եւ')
      .toLowerCase()
      .replace(/և/g, 'եւ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function createInitialState() {
    return {
      version: 1,
      practice: {},
      mistakes: {},
      bookmarks: {},
      examHistory: [],
      study: {
        dailyGoal: DEFAULT_DAILY_GOAL,
        dailyCounts: {},
      },
      stickyNote: {
        visible: true,
        minimized: false,
        deleted: false,
        text: '',
        x: null,
        y: null,
      },
      ui: {
        activeTab: 'home',
        lang: 'hy',
        bilingual: false,
        activeGroupId: 1,
        activeQuestionIndexByGroup: {},
        shuffleByGroup: {},
      },
    };
  }

  function _isPlainObject(val) {
    return Boolean(val) && typeof val === 'object' && !Array.isArray(val);
  }

  function _sanitizeState(raw) {
    if (!_isPlainObject(raw)) return null;
    const base = createInitialState();

    if (raw.practice !== undefined && !_isPlainObject(raw.practice)) return null;
    if (raw.mistakes !== undefined && !_isPlainObject(raw.mistakes)) return null;
    if (raw.examHistory !== undefined && !Array.isArray(raw.examHistory)) return null;

    if (_isPlainObject(raw.practice)) {
      for (const [uid, entry] of Object.entries(raw.practice)) {
        if (
          _isPlainObject(entry) &&
          typeof entry.selectedIndex === 'number' &&
          typeof entry.correct === 'boolean'
        ) {
          base.practice[uid] = {
            selectedIndex: entry.selectedIndex,
            correct: entry.correct,
          };
        }
      }
    }

    if (_isPlainObject(raw.mistakes)) {
      for (const [uid, entry] of Object.entries(raw.mistakes)) {
        if (_isPlainObject(entry) && typeof entry.wrongCount === 'number') {
          base.mistakes[uid] = {
            wrongCount: Math.max(1, entry.wrongCount),
            streak:
              typeof entry.streak === 'number'
                ? Math.max(0, Math.min(MISTAKE_CLEAR_STREAK - 1, entry.streak))
                : 0,
            lastWrongAt: typeof entry.lastWrongAt === 'number' ? entry.lastWrongAt : Date.now(),
          };
        }
      }
    }

    if (_isPlainObject(raw.bookmarks)) {
      for (const [uid, ts] of Object.entries(raw.bookmarks)) {
        if (typeof ts === 'number' || ts === true) {
          base.bookmarks[uid] = typeof ts === 'number' ? ts : Date.now();
        }
      }
    }

    if (_isPlainObject(raw.study)) {
      if (
        typeof raw.study.dailyGoal === 'number' &&
        raw.study.dailyGoal >= 5 &&
        raw.study.dailyGoal <= 200
      ) {
        base.study.dailyGoal = Math.round(raw.study.dailyGoal);
      }
      if (_isPlainObject(raw.study.dailyCounts)) {
        for (const [day, cnt] of Object.entries(raw.study.dailyCounts)) {
          if (/^\d{4}-\d{2}-\d{2}$/.test(day) && typeof cnt === 'number' && cnt >= 0) {
            base.study.dailyCounts[day] = Math.round(cnt);
          }
        }
      }
    }

    if (_isPlainObject(raw.stickyNote)) {
      base.stickyNote = {
        visible: raw.stickyNote.visible !== false,
        minimized: Boolean(raw.stickyNote.minimized),
        deleted: Boolean(raw.stickyNote.deleted),
        text: typeof raw.stickyNote.text === 'string' ? raw.stickyNote.text : '',
        x: typeof raw.stickyNote.x === 'number' ? raw.stickyNote.x : null,
        y: typeof raw.stickyNote.y === 'number' ? raw.stickyNote.y : null,
      };
    }

    if (Array.isArray(raw.examHistory)) {
      base.examHistory = raw.examHistory
        .filter(
          (item) =>
            _isPlainObject(item) &&
            typeof item.score === 'number' &&
            typeof item.total === 'number'
        )
        .slice(0, MAX_HISTORY_ITEMS);
    }

    if (_isPlainObject(raw.ui)) {
      const validTabs = new Set(['home', 'practice', 'exam', 'mistakes', 'signs', 'colortest', 'cheatsheet', 'search']);
      if (validTabs.has(raw.ui.activeTab)) {
        base.ui.activeTab = raw.ui.activeTab;
      }
      if (['hy', 'ru', 'en'].includes(raw.ui.lang)) {
        base.ui.lang = raw.ui.lang;
      }
      if (typeof raw.ui.bilingual === 'boolean') {
        base.ui.bilingual = raw.ui.bilingual;
      }
      if (typeof raw.ui.activeGroupId === 'number' && raw.ui.activeGroupId >= 1 && raw.ui.activeGroupId <= 10) {
        base.ui.activeGroupId = raw.ui.activeGroupId;
      }
      if (_isPlainObject(raw.ui.activeQuestionIndexByGroup)) {
        base.ui.activeQuestionIndexByGroup = { ...raw.ui.activeQuestionIndexByGroup };
      }
      if (_isPlainObject(raw.ui.shuffleByGroup)) {
        base.ui.shuffleByGroup = { ...raw.ui.shuffleByGroup };
      }
    }

    return base;
  }

  function loadState(storage) {
    try {
      const rawStr = storage && typeof storage.getItem === 'function' ? storage.getItem(STORAGE_KEY) : null;
      if (!rawStr) return createInitialState();
      const parsed = JSON.parse(rawStr);
      return _sanitizeState(parsed) || createInitialState();
    } catch {
      return createInitialState();
    }
  }

  function saveState(storage, state) {
    try {
      if (storage && typeof storage.setItem === 'function') {
        storage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch {
      // Ignore storage quota or private-mode errors
    }
  }

  function exportStateJson(state) {
    return JSON.stringify(state, null, 2);
  }

  function importStateJson(jsonStr) {
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      throw new Error('Անվավեր JSON ֆայլ');
    }
    if (
      !_isPlainObject(parsed) ||
      (parsed.practice !== undefined && !_isPlainObject(parsed.practice)) ||
      (parsed.mistakes !== undefined && !_isPlainObject(parsed.mistakes)) ||
      (parsed.examHistory !== undefined && !Array.isArray(parsed.examHistory))
    ) {
      throw new Error('Անվավեր տվյալների կառուցվածք');
    }
    const sanitized = _sanitizeState(parsed);
    if (!sanitized) {
      throw new Error('Անվավեր տվյալների կառուցվածք');
    }
    return sanitized;
  }

  function _addMistake(mistakes, uid, now) {
    const prev = mistakes[uid];
    return {
      ...mistakes,
      [uid]: {
        wrongCount: prev ? prev.wrongCount + 1 : 1,
        streak: 0,
        lastWrongAt: now,
      },
    };
  }

  function getLocalDateKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function _prevDateKey(dateKey) {
    const [y, m, d] = dateKey.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() - 1);
    return getLocalDateKey(dt);
  }

  function recordStudyActivity(state, dateKey = getLocalDateKey()) {
    const study = state.study || { dailyGoal: DEFAULT_DAILY_GOAL, dailyCounts: {} };
    const nextCounts = {
      ...study.dailyCounts,
      [dateKey]: (study.dailyCounts[dateKey] || 0) + 1,
    };
    return {
      ...state,
      study: {
        ...study,
        dailyCounts: nextCounts,
      },
    };
  }

  function setDailyGoal(state, goal) {
    const num = Math.max(5, Math.min(200, Math.round(Number(goal) || DEFAULT_DAILY_GOAL)));
    const study = state.study || { dailyGoal: DEFAULT_DAILY_GOAL, dailyCounts: {} };
    return {
      ...state,
      study: {
        ...study,
        dailyGoal: num,
      },
    };
  }

  function getStudyProgress(state, todayKey = getLocalDateKey()) {
    const study = (state && state.study) || { dailyGoal: DEFAULT_DAILY_GOAL, dailyCounts: {} };
    const dailyGoal = study.dailyGoal || DEFAULT_DAILY_GOAL;
    const counts = study.dailyCounts || {};
    const todayCount = counts[todayKey] || 0;
    const dailyPct = Math.min(100, Math.round((todayCount / dailyGoal) * 100));

    let streakDays = 0;
    let cursor = todayCount >= dailyGoal ? todayKey : _prevDateKey(todayKey);
    while ((counts[cursor] || 0) >= dailyGoal) {
      streakDays += 1;
      cursor = _prevDateKey(cursor);
    }

    return {
      todayCount,
      dailyGoal,
      dailyPct,
      goalMetToday: todayCount >= dailyGoal,
      streakDays,
    };
  }

  function toggleBookmark(state, uid, now = Date.now()) {
    const next = { ...(state.bookmarks || {}) };
    const added = !next[uid];
    if (added) {
      next[uid] = now;
    } else {
      delete next[uid];
    }
    return {
      state: {
        ...state,
        bookmarks: next,
      },
      bookmarked: added,
    };
  }

  function isBookmarked(state, uid) {
    return Boolean(state && state.bookmarks && state.bookmarks[uid]);
  }

  function recordPracticeAnswer(state, uid, selectedIndex, correctIndex, now = Date.now()) {
    if (state.practice[uid]) {
      return {
        state,
        isCorrect: state.practice[uid].correct,
        newlyRecorded: false,
      };
    }
    const isCorrect = selectedIndex === correctIndex;
    const nextPractice = {
      ...state.practice,
      [uid]: {
        selectedIndex,
        correct: isCorrect,
      },
    };
    const nextMistakes = isCorrect ? state.mistakes : _addMistake(state.mistakes, uid, now);
    return {
      state: {
        ...state,
        practice: nextPractice,
        mistakes: nextMistakes,
      },
      isCorrect,
      newlyRecorded: true,
    };
  }

  function resetGroupPractice(state, groupQuestions) {
    const nextPractice = { ...state.practice };
    for (const q of groupQuestions) {
      delete nextPractice[q.uid];
    }
    return {
      ...state,
      practice: nextPractice,
    };
  }

  function shuffleArray(arr, rng = Math.random) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  const OFFICIAL_RULES_GROUPS = [1, 4, 5, 6, 7, 8, 9];
  const OFFICIAL_EXAM_WEIGHTS = {
    rules: { groupIds: OFFICIAL_RULES_GROUPS, count: 15, weight: 0.75, label: 'ՃԵԿ և նշաններ' },
    law: { groupIds: [2], count: 2, weight: 0.10, label: 'Օրենք' },
    malfunctions: { groupIds: [3], count: 2, weight: 0.10, label: 'Անսարքություններ' },
    firstAid: { groupIds: [10], count: 1, weight: 0.05, label: 'Առաջին օգնություն' },
  };

  function generateMockExam(groups, rng = Math.random) {
    const byId = {};
    for (const g of groups) {
      byId[g.id] = g.questions || [];
    }
    const picked = [];
    const seen = new Set();

    function takeFromPool(pool, count) {
      const shuffled = shuffleArray(pool, rng);
      let taken = 0;
      for (const q of shuffled) {
        if (taken >= count) break;
        if (!seen.has(q.uid)) {
          seen.add(q.uid);
          picked.push(q);
          taken += 1;
        }
      }
      return taken;
    }

    // Official distribution: 15 from Rules (groups 1,4,5,6,7,8,9), 2 from Law (2), 2 from Malfunctions (3), 1 from First Aid (10)
    const rulesPool = [];
    for (const gid of OFFICIAL_RULES_GROUPS) {
      const gqs = byId[gid] || [];
      // Take up to 2 from each rules group first for broad coverage, then top up to 15
      takeFromPool(gqs, 2);
      for (const q of gqs) rulesPool.push(q);
    }
    const rulesSoFar = picked.length;
    if (rulesSoFar < 15) {
      takeFromPool(rulesPool, 15 - rulesSoFar);
    }

    takeFromPool(byId[2] || [], 2);
    takeFromPool(byId[3] || [], 2);
    takeFromPool(byId[10] || [], 1);

    // Fallback top-up to 20 if synthetic small group pools were passed
    if (picked.length < 20) {
      const allPool = groups.flatMap((g) => g.questions || []);
      takeFromPool(allPool, 20 - picked.length);
    }

    return shuffleArray(picked.slice(0, 20), rng);
  }

  function computeReadiness(groups, state) {
    const byId = {};
    for (const g of groups || []) {
      byId[g.id] = g.questions || [];
    }
    const practice = (state && state.practice) || {};
    const mistakes = (state && state.mistakes) || {};

    let overallExact = 0;
    const buckets = {};

    for (const [key, cfg] of Object.entries(OFFICIAL_EXAM_WEIGHTS)) {
      const qs = cfg.groupIds.flatMap((gid) => byId[gid] || []);
      const total = qs.length;
      let answered = 0;
      let correct = 0;
      let mastered = 0;
      let unresolvedMistakes = 0;
      for (const q of qs) {
        const hasMistake = Boolean(mistakes[q.uid]);
        if (hasMistake) unresolvedMistakes += 1;
        const rec = practice[q.uid];
        if (rec) {
          answered += 1;
          if (rec.correct) correct += 1;
          if (!hasMistake) mastered += 1;
        }
      }
      const ratio = total > 0 ? mastered / total : 0;
      const pct = Math.round(ratio * 100);
      buckets[key] = {
        label: cfg.label,
        total,
        answered,
        correct,
        mastered,
        unresolvedMistakes,
        pct,
      };
      overallExact += ratio * cfg.weight * 100;
    }

    const overallPct =
      overallExact > 0 && overallExact < 1
        ? Math.round(overallExact * 10) / 10
        : Math.round(overallExact);

    return {
      overallPct,
      buckets,
    };
  }

  function generateSmartDrill(groups, state, count = 10, rng = Math.random) {
    const allQs = (groups || []).flatMap((g) => g.questions || []);
    const practice = (state && state.practice) || {};
    const mistakes = (state && state.mistakes) || {};

    // Compute per-group accuracy to prioritize weak groups
    const groupAcc = {};
    for (const g of groups || []) {
      let a = 0;
      let c = 0;
      for (const q of g.questions || []) {
        if (practice[q.uid]) {
          a += 1;
          if (practice[q.uid].correct) c += 1;
        }
      }
      groupAcc[g.id] = a > 0 ? c / a : 0.5;
    }

    const picked = [];
    const seen = new Set();
    const pushFrom = (list) => {
      for (const q of shuffleArray(list, rng)) {
        if (picked.length >= count) break;
        if (!seen.has(q.uid)) {
          seen.add(q.uid);
          picked.push(q);
        }
      }
    };

    // Priority 1: Active unresolved mistakes
    pushFrom(allQs.filter((q) => Boolean(mistakes[q.uid])));
    // Priority 2: Previously answered wrong in practice
    pushFrom(allQs.filter((q) => practice[q.uid] && !practice[q.uid].correct));
    // Priority 3: Unanswered questions sorted by lowest-accuracy groups first
    if (picked.length < count) {
      const unanswered = allQs.filter((q) => !practice[q.uid]);
      const weakUnanswered = unanswered.filter((q) => groupAcc[q.groupId] < 0.8);
      pushFrom(weakUnanswered);
      pushFrom(unanswered);
    }
    // Priority 4: Any remaining questions for review
    if (picked.length < count) {
      pushFrom(allQs);
    }

    return picked.slice(0, count);
  }

  function gradeMockExam(state, examQuestions, answersByUid, durationSec, now = Date.now()) {
    let score = 0;
    let nextMistakes = { ...state.mistakes };
    const breakdown = [];

    for (const q of examQuestions) {
      const selectedIndex =
        typeof answersByUid[q.uid] === 'number' ? answersByUid[q.uid] : null;
      const isCorrect = selectedIndex !== null && selectedIndex === q.correctIndex;
      if (isCorrect) {
        score += 1;
      } else {
        nextMistakes = _addMistake(nextMistakes, q.uid, now);
      }
      breakdown.push({
        question: q,
        selectedIndex,
        isCorrect,
      });
    }

    const total = examQuestions.length;
    const passed = score >= EXAM_PASS_SCORE;
    const historyEntry = {
      id: `exam-${now}`,
      date: new Date(now).toISOString(),
      score,
      total,
      passed,
      durationSec: Math.max(0, Math.round(durationSec)),
    };

    return {
      state: {
        ...state,
        mistakes: nextMistakes,
        examHistory: [historyEntry, ...state.examHistory].slice(0, MAX_HISTORY_ITEMS),
      },
      result: {
        ...historyEntry,
        breakdown,
      },
    };
  }

  function retryMistakeAnswer(state, uid, selectedIndex, correctIndex, now = Date.now()) {
    const isCorrect = selectedIndex === correctIndex;
    if (!isCorrect) {
      return {
        state: {
          ...state,
          mistakes: _addMistake(state.mistakes, uid, now),
        },
        isCorrect: false,
        resolved: false,
        streak: 0,
      };
    }

    const prev = state.mistakes[uid];
    const nextStreak = prev ? (prev.streak || 0) + 1 : MISTAKE_CLEAR_STREAK;
    if (nextStreak >= MISTAKE_CLEAR_STREAK) {
      return {
        state: resolveMistake(state, uid),
        isCorrect: true,
        resolved: true,
        streak: nextStreak,
      };
    }

    return {
      state: {
        ...state,
        mistakes: {
          ...state.mistakes,
          [uid]: {
            ...prev,
            streak: nextStreak,
          },
        },
      },
      isCorrect: true,
      resolved: false,
      streak: nextStreak,
    };
  }

  function resolveMistake(state, uid) {
    if (!state.mistakes[uid]) return state;
    const nextMistakes = { ...state.mistakes };
    delete nextMistakes[uid];
    return {
      ...state,
      mistakes: nextMistakes,
    };
  }

  function clearAllMistakes(state) {
    return {
      ...state,
      mistakes: {},
    };
  }

  function filterQuestions(
    groups,
    { query = '', groupId = 'all', imagesOnly = false, bookmarkedOnly = false, bookmarks = null, i18nData = null } = {}
  ) {
    const normQuery = normalizeArmenian(query);
    const out = [];
    for (const group of groups) {
      if (groupId !== 'all' && Number(groupId) !== group.id) {
        continue;
      }
      for (const q of group.questions) {
        if (imagesOnly && (!q.images || q.images.length === 0)) {
          continue;
        }
        if (bookmarkedOnly && (!bookmarks || !bookmarks[q.uid])) {
          continue;
        }
        if (normQuery) {
          const parts = [q.text, ...(q.options || [])];
          if (i18nData) {
            const ru = i18nData.ru && i18nData.ru[q.uid];
            const en = i18nData.en && i18nData.en[q.uid];
            if (ru) parts.push(ru.text, ...(ru.options || []));
            if (en) parts.push(en.text, ...(en.options || []));
          }
          const haystack = normalizeArmenian(parts.join(' '));
          if (!haystack.includes(normQuery)) {
            continue;
          }
        }
        out.push(q);
      }
    }
    return out;
  }

  function filterMarkings(categories, { query = '', categoryId = 'all' } = {}) {
    const normQuery = normalizeArmenian(query);
    const out = [];
    for (const cat of categories || []) {
      if (categoryId !== 'all' && Number(categoryId) !== cat.id) {
        continue;
      }
      for (const item of cat.items || []) {
        if (normQuery) {
          const haystack = normalizeArmenian(
            `${item.code || ''} ${item.title || ''} ${item.title_ru || ''} ${item.title_en || ''} ${item.description || ''} ${item.description_ru || ''} ${item.description_en || ''}`
          );
          if (!haystack.includes(normQuery)) {
            continue;
          }
        }
        out.push({ ...item, categoryTitle: cat.title, categoryTitle_ru: cat.title_ru, categoryTitle_en: cat.title_en });
      }
    }
    return out;
  }

  function filterRules(documents, { docId = 'all', query = '' } = {}) {
    const normQuery = normalizeArmenian(query);
    const out = [];
    for (const doc of documents || []) {
      if (docId !== 'all' && doc.id !== docId) continue;
      for (const ch of doc.chapters || []) {
        for (const item of ch.items || []) {
          if (normQuery) {
            const haystack = normalizeArmenian(`${ch.title} ${item.ref || ''} ${item.text || ''}`);
            if (!haystack.includes(normQuery)) continue;
          }
          out.push({
            ...item,
            docId: doc.id,
            docTitle: doc.title,
            chapterId: ch.id,
            chapterTitle: ch.title,
          });
        }
      }
    }
    return out;
  }

  function filterSigns(categories, { query = '', categoryId = 'all' } = {}) {
    const normQuery = normalizeArmenian(query);
    const out = [];
    for (const cat of categories || []) {
      if (categoryId !== 'all' && Number(categoryId) !== cat.id) {
        continue;
      }
      for (const sign of cat.signs || []) {
        if (normQuery) {
          const haystack = normalizeArmenian(
            `${sign.code || ''} ${sign.title || ''} ${sign.description || ''}`
          );
          if (!haystack.includes(normQuery)) {
            continue;
          }
        }
        out.push({ ...sign, categoryTitle: cat.title });
      }
    }
    return out;
  }

  function getCanonicalSignCode(sign) {
    if (!sign) return '';
    const title = String(sign.title || '');
    const m = title.match(/^(\d+(?:\.\d+)+)/);
    if (m) return m[1];
    return String(sign.code || '').trim();
  }

  function buildSignIndex(categories) {
    const byCode = {};
    const list = [];
    for (const cat of categories || []) {
      for (const sign of cat.signs || []) {
        const canonical = getCanonicalSignCode(sign);
        const enriched = {
          ...sign,
          canonicalCode: canonical,
          categoryTitle: cat.title,
        };
        list.push(enriched);
        if (canonical && !byCode[canonical]) {
          byCode[canonical] = enriched;
        }
        if (sign.code && !byCode[sign.code]) {
          byCode[sign.code] = enriched;
        }
      }
    }
    return { byCode, list };
  }

  const SIGN_CODE_TOKEN_RE = /(?<![\d.,])(\d+\.\d+(?:\.\d+)?)(?![\d.,])/g;
  const UNIT_FOLLOW_RE = /^\s*(?:մմ|սմ|կմ|մ(?!\p{L})|տ(?!\p{L})|կգ|ժ|րոպե|վ(?!\p{L})|%|աստիճան)/u;
  const RULE_PREFIX_RE = /(?:կետ|կետեր|ենթակետ|ենթ\.|հոդված|մաս|N|հավելված)\s*$/iu;

  function extractSignCodesFromText(text, byCode) {
    if (!text || !byCode) return [];
    const found = new Set();
    SIGN_CODE_TOKEN_RE.lastIndex = 0;
    let m;
    while ((m = SIGN_CODE_TOKEN_RE.exec(text)) !== null) {
      const code = m[1];
      if (!byCode[code]) continue;
      const before = text.slice(Math.max(0, m.index - 20), m.index);
      const after = text.slice(m.index + code.length, m.index + code.length + 14);
      if (UNIT_FOLLOW_RE.test(after) || RULE_PREFIX_RE.test(before)) continue;
      found.add(code);
    }
    return Array.from(found);
  }

  function tokenizeExplanationWithSigns(text, byCode) {
    if (!text) return [];
    if (!byCode) return [{ type: 'text', value: text }];
    const tokens = [];
    let lastIdx = 0;
    SIGN_CODE_TOKEN_RE.lastIndex = 0;
    let m;
    while ((m = SIGN_CODE_TOKEN_RE.exec(text)) !== null) {
      const code = m[1];
      if (!byCode[code]) continue;
      const before = text.slice(Math.max(0, m.index - 20), m.index);
      const after = text.slice(m.index + code.length, m.index + code.length + 14);
      if (UNIT_FOLLOW_RE.test(after) || RULE_PREFIX_RE.test(before)) continue;
      if (m.index > lastIdx) {
        tokens.push({ type: 'text', value: text.slice(lastIdx, m.index) });
      }
      tokens.push({ type: 'sign', code, sign: byCode[code] });
      lastIdx = m.index + code.length;
    }
    if (lastIdx < text.length) {
      tokens.push({ type: 'text', value: text.slice(lastIdx) });
    }
    return tokens;
  }

  function getQuestionsForSign(groups, signCode, byCode) {
    if (!signCode || !groups) return [];
    const target = String(signCode).trim();
    const out = [];
    for (const g of groups) {
      for (const q of g.questions || []) {
        const blob = `${q.text || ''} ${(q.options || []).join(' ')} ${q.explanation || ''}`;
        const codes = extractSignCodesFromText(blob, byCode || { [target]: true });
        if (codes.includes(target)) {
          out.push(q);
        }
      }
    }
    return out;
  }

  function generateSignQuiz(categories, categoryId = 'all', count = 10, rng = Math.random) {
    const pool = [];
    const allSigns = [];
    for (const cat of categories || []) {
      for (const sign of cat.signs || []) {
        const enriched = { ...sign, categoryTitle: cat.title };
        allSigns.push(enriched);
        if (categoryId === 'all' || Number(categoryId) === cat.id) {
          pool.push(enriched);
        }
      }
    }
    const chosen = shuffleArray(pool, rng).slice(0, Math.min(count, pool.length));
    return chosen.map((target) => {
      const sameCat = allSigns.filter(
        (s) => s.id !== target.id && s.categoryId === target.categoryId && s.title !== target.title
      );
      const fallback = allSigns.filter((s) => s.id !== target.id && s.title !== target.title);
      const distractorPool = sameCat.length >= 3 ? sameCat : fallback;
      const distractors = [];
      const usedTitles = new Set([target.title]);
      for (const cand of shuffleArray(distractorPool, rng)) {
        if (distractors.length >= 3) break;
        if (!usedTitles.has(cand.title)) {
          usedTitles.add(cand.title);
          distractors.push(cand);
        }
      }
      const options = shuffleArray([target, ...distractors], rng);
      return {
        target,
        options,
        correctIndex: options.findIndex((o) => o.id === target.id),
      };
    });
  }

  const ANALYTICS_NAMESPACE = 'annmartirosyan-roadpolice-exam';
  const VISITOR_FLAG_KEY = 'roadpolice_visitor_counted_v1';

  function shouldTrackAnalytics(locationObj) {
    if (!locationObj) return false;
    const protocol = String(locationObj.protocol || '');
    const host = String(locationObj.hostname || '').toLowerCase();
    if (protocol !== 'http:' && protocol !== 'https:') return false;
    if (!host || host === 'localhost' || host === '127.0.0.1' || host === '[::1]') {
      return false;
    }
    return true;
  }

  function getAnalyticsOperations(localStore) {
    let alreadyCountedVisitor = false;
    try {
      alreadyCountedVisitor = Boolean(localStore && localStore.getItem(VISITOR_FLAG_KEY));
    } catch {
      alreadyCountedVisitor = false;
    }
    return {
      visitorEndpoint: alreadyCountedVisitor ? 'get' : 'hit',
      visitEndpoint: 'hit',
      markVisitorCounted: () => {
        try {
          if (localStore) localStore.setItem(VISITOR_FLAG_KEY, '1');
        } catch {
          // ignore
        }
      },
    };
  }

  return {
    STORAGE_KEY,
    EXAM_DURATION_SEC,
    EXAM_PASS_SCORE,
    MISTAKE_CLEAR_STREAK,
    DEFAULT_DAILY_GOAL,
    ANALYTICS_NAMESPACE,
    normalizeArmenian,
    createInitialState,
    loadState,
    saveState,
    exportStateJson,
    importStateJson,
    recordPracticeAnswer,
    resetGroupPractice,
    getLocalDateKey,
    recordStudyActivity,
    setDailyGoal,
    getStudyProgress,
    toggleBookmark,
    isBookmarked,
    shuffleArray,
    generateMockExam,
    computeReadiness,
    generateSmartDrill,
    gradeMockExam,
    retryMistakeAnswer,
    resolveMistake,
    clearAllMistakes,
    filterQuestions,
    filterSigns,
    filterMarkings,
    filterRules,
    getCanonicalSignCode,
    buildSignIndex,
    extractSignCodesFromText,
    tokenizeExplanationWithSigns,
    getQuestionsForSign,
    generateSignQuiz,
    shouldTrackAnalytics,
    getAnalyticsOperations,
  };
});
