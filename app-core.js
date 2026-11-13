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
      examHistory: [],
      ui: {
        activeTab: 'practice',
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
            lastWrongAt: typeof entry.lastWrongAt === 'number' ? entry.lastWrongAt : Date.now(),
          };
        }
      }
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
      const validTabs = new Set(['practice', 'exam', 'mistakes', 'signs', 'search']);
      if (validTabs.has(raw.ui.activeTab)) {
        base.ui.activeTab = raw.ui.activeTab;
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
        lastWrongAt: now,
      },
    };
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

  function generateMockExam(groups, rng = Math.random) {
    const picked = [];
    for (const group of groups) {
      const pool = shuffleArray(group.questions, rng);
      const count = Math.min(2, pool.length);
      for (let i = 0; i < count; i++) {
        picked.push(pool[i]);
      }
    }
    return shuffleArray(picked, rng);
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
    if (isCorrect) {
      return { state, isCorrect: true };
    }
    return {
      state: {
        ...state,
        mistakes: _addMistake(state.mistakes, uid, now),
      },
      isCorrect: false,
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

  function filterQuestions(groups, { query = '', groupId = 'all', imagesOnly = false } = {}) {
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
        if (normQuery) {
          const haystack = normalizeArmenian(
            `${q.text} ${(q.options || []).join(' ')}`
          );
          if (!haystack.includes(normQuery)) {
            continue;
          }
        }
        out.push(q);
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

  return {
    STORAGE_KEY,
    EXAM_DURATION_SEC,
    EXAM_PASS_SCORE,
    normalizeArmenian,
    createInitialState,
    loadState,
    saveState,
    exportStateJson,
    importStateJson,
    recordPracticeAnswer,
    resetGroupPractice,
    shuffleArray,
    generateMockExam,
    gradeMockExam,
    retryMistakeAnswer,
    resolveMistake,
    clearAllMistakes,
    filterQuestions,
    filterSigns,
  };
});
