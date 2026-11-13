(function () {
  const Core = window.RoadPoliceCore;
  const DATA = window.EXAM_DATA;
  const SIGNS_DATA = window.SIGNS_DATA || { totalSigns: 0, categories: [] };

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
    search: {
      query: '',
      groupId: 'all',
      imagesOnly: false,
      showAnswers: false,
      page: 1,
      pageSize: 40,
    },
    signs: {
      query: '',
      categoryId: 'all',
    },
    openExplanations: {},
  };

  const rootEl = document.getElementById('app-root');
  const progressTextEl = document.getElementById('overall-progress-text');
  const mistakesBadgeEl = document.getElementById('mistakes-badge');
  const lightboxEl = document.getElementById('lightbox');
  const lightboxImgEl = document.getElementById('lightbox-img');
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
    const total = DATA.totalQuestions;
    let answeredCount = 0;
    let correctCount = 0;
    for (const entry of Object.values(state.practice)) {
      answeredCount += 1;
      if (entry.correct) correctCount += 1;
    }
    const pct = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
    progressTextEl.textContent = `Ընդամենը՝ ${total} հարց · Անցած՝ ${answeredCount} (${pct}% ճիշտ)`;

    const mistakeCount = Object.keys(state.mistakes).length;
    mistakesBadgeEl.textContent = String(mistakeCount);
    mistakesBadgeEl.classList.toggle('zero', mistakeCount === 0);

    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === state.ui.activeTab);
    });
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
          <span>💡 Բացատրություն (Ինչու է ճիշտ)</span>
          <span>${isOpen ? 'Թաքցնել ▲' : 'Ցույց տալ ▼'}</span>
        </button>
        ${
          isOpen
            ? `<div class="explanation-content">${escapeHtml(q.explanation)}</div>`
            : ''
        }
      </div>
    `;
  }

  // ---------- Tab 1: Practice ----------
  function renderPractice() {
    const activeGid = state.ui.activeGroupId || 1;
    const group = GROUPS_BY_ID[activeGid] || DATA.groups[0];
    const questions = getGroupQuestionsInOrder(group.id);
    const total = questions.length;
    let qIdx = state.ui.activeQuestionIndexByGroup[group.id] || 0;
    if (qIdx < 0) qIdx = 0;
    if (qIdx >= total) qIdx = total - 1;
    state.ui.activeQuestionIndexByGroup[group.id] = qIdx;

    const q = questions[qIdx];
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
              <span>Խումբ ${g.id}</span>
              <span>${gs.answered}/${gs.total}</span>
            </div>
            <div class="group-pill-sub">
              <span>Ճիշտ՝ ${acc}</span>
            </div>
          </button>
        `;
      })
      .join('');

    const optionsHtml = q.options
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
               ? '✓ Ճիշտ պատասխան է'
               : `✕ Սխալ է · Ճիշտ պատասխանն է՝ ${q.correctIndex + 1}. ${escapeHtml(q.options[q.correctIndex])}`
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
      <div class="group-pills">${pillsHtml}</div>

      <div class="card">
        <div class="toolbar">
          <div class="toolbar-group">
            <strong>Խումբ ${group.id}</strong>
            <span class="pill-tag">${stats.answered} / ${total} պատասխանված · ${stats.correct} ճիշտ</span>
          </div>
          <div class="toolbar-group">
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
          <span>Հարց №${q.number} (${qIdx + 1} / ${total})</span>
          <span class="pill-tag">Խումբ ${group.id}</span>
        </div>

        <h2 class="question-text">${escapeHtml(q.text)}</h2>
        ${renderImagesHtml(q.images)}
        <div class="options-list">${optionsHtml}</div>
        ${feedbackHtml}
        ${renderExplanationTabHtml(q, 'practice')}

        <div class="question-footer">
          <div class="toolbar-group">
            <button type="button" class="btn" id="btn-prev-q" ${qIdx === 0 ? 'disabled' : ''}>← Նախորդը</button>
            <button type="button" class="btn btn-primary" id="btn-next-q" ${qIdx >= total - 1 ? 'disabled' : ''}>Հաջորդը →</button>
          </div>
          <span class="kbd-hint">Ստեղներ՝ 1-5 պատասխանել · ← / → անցնել</span>
        </div>

        <div class="q-grid" aria-label="Հարցերի ցանկ">${gridHtml}</div>
      </div>
    `;
  }

  // ---------- Tab 2: Mock Exam ----------
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
    session.exam.status = 'finished';
    session.exam.result = result;
    persist();
    if (timedOut) {
      showToast('Ժամանակը լրացավ · քննությունը ավարտվեց');
    }
    render();
  }

  function renderExam() {
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
            Քննությունը կազմված է <strong>20 պատահական հարցից</strong> (2-ական հարց 1–10 խմբերից)՝
            ճիշտ պաշտոնական ձևաչափով։ Տրվում է <strong>30 րոպե</strong>։ Անցողիկ շեմը՝
            <strong>18 / 20</strong> (առավելագույնը 2 սխալ)։
          </p>
          <p style="color: var(--text-muted);">
            Ավարտելուց հետո բոլոր սխալված կամ բաց թողնված հարցերը ավտոմատ կավելացվեն «Սխալներ» բաժնում։
          </p>
          <button type="button" class="btn btn-primary" id="btn-start-exam">Սկսել քննությունը</button>
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

      const optionsHtml = q.options
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
              <strong>Հարց ${currentIndex + 1} / ${questions.length}</strong>
              <span class="pill-tag">Պատասխանված՝ ${answeredTotal} / ${questions.length}</span>
            </div>
            <div class="toolbar-group">
              <div class="${timerCls.join(' ')}" id="exam-timer-pill">${formatDuration(remainingSec)}</div>
              <button type="button" class="btn btn-primary" id="btn-finish-exam">Ավարտել քննությունը</button>
            </div>
          </div>

          <div class="q-grid" style="margin-top: 0; margin-bottom: 16px;">${navGrid}</div>

          <div class="question-meta">
            <span>Խումբ ${q.groupId} · №${q.number}</span>
          </div>

          <h2 class="question-text">${escapeHtml(q.text)}</h2>
          ${renderImagesHtml(q.images)}
          <div class="options-list">${optionsHtml}</div>

          <div class="question-footer">
            <div class="toolbar-group">
              <button type="button" class="btn" id="btn-exam-prev" ${currentIndex === 0 ? 'disabled' : ''}>← Նախորդը</button>
              <button type="button" class="btn btn-primary" id="btn-exam-next" ${currentIndex >= questions.length - 1 ? 'disabled' : ''}>Հաջորդը →</button>
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
        const statusTag = item.isCorrect
          ? '<span class="pill-tag success">✓ Ճիշտ</span>'
          : item.selectedIndex === null
          ? '<span class="pill-tag danger">✕ Բաց թողնված</span>'
          : '<span class="pill-tag danger">✕ Սխալ</span>';

        const opts = q.options
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
              <span><strong>${idx + 1}.</strong> Խումբ ${q.groupId} · Հարց №${q.number}</span>
              ${statusTag}
            </div>
            <div style="font-weight: 600; margin-bottom: 10px;">${escapeHtml(q.text)}</div>
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
    const mistakeMeta = state.mistakes[uid];
    const attempt = session.mistakes.attemptByUid[uid];

    const optionsHtml = q.options
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
               ? '✓ Ճիշտ է։ Հարցը հեռացվեց սխալների ցանկից։'
               : `✕ Կրկին սխալ է · Ճիշտ պատասխանն է՝ ${q.correctIndex + 1}. ${escapeHtml(q.options[q.correctIndex])}`
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

    rootEl.innerHTML = `
      <div class="card">
        <div class="toolbar">
          <div class="toolbar-group">
            <strong>Սխալների ուղղում</strong>
            <span class="pill-tag danger">Մնացել է՝ ${totalRemaining}</span>
          </div>
          <div class="toolbar-group">
            <button type="button" class="btn btn-sm" id="btn-refresh-mistakes">Թարմացնել ցանկը</button>
            <button type="button" class="btn btn-sm btn-danger" id="btn-clear-mistakes">Մաքրել բոլորը</button>
          </div>
        </div>

        <div class="question-meta">
          <span>Քարտ ${idx + 1} / ${queue.length} · Խումբ ${q.groupId} · Հարց №${q.number}</span>
          ${
            mistakeMeta
              ? `<span class="pill-tag danger">Սխալվել եք ${mistakeMeta.wrongCount} անգամ</span>`
              : `<span class="pill-tag success">Ուղղված է</span>`
          }
        </div>

        <h2 class="question-text">${escapeHtml(q.text)}</h2>
        ${renderImagesHtml(q.images)}
        <div class="options-list">${optionsHtml}</div>
        ${feedbackHtml}
        ${renderExplanationTabHtml(q, 'mistakes')}

        <div class="question-footer">
          <div class="toolbar-group">
            <button type="button" class="btn" id="btn-mistake-prev" ${idx === 0 ? 'disabled' : ''}>← Նախորդը</button>
            <button type="button" class="btn btn-primary" id="btn-mistake-next" ${idx >= queue.length - 1 ? 'disabled' : ''}>Հաջորդը →</button>
          </div>
          <span class="kbd-hint">Ճիշտ պատասխանելուց հետո հարցը դուրս է գալիս սխալներից</span>
        </div>

        <div class="q-grid">${gridHtml}</div>
      </div>
    `;
  }

  // ---------- Tab 4: Road Signs ----------
  function renderSignsResults(categories) {
    const { query, categoryId } = session.signs;
    const filtered = Core.filterSigns(categories, { query, categoryId });

    const countEl = document.getElementById('signs-count-pill');
    if (countEl) {
      countEl.textContent = `Ցուցադրված է՝ ${filtered.length} / ${SIGNS_DATA.totalSigns}`;
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
              .map(
                (sign) => `
              <article class="sign-card">
                ${
                  sign.image
                    ? `<button type="button" class="sign-thumb-btn" data-zoom-src="${escapeHtml(sign.image)}" title="Սեղմեք մեծացնելու համար">
                         <img src="${escapeHtml(sign.image)}" alt="${escapeHtml(sign.title)}" loading="lazy" />
                       </button>`
                    : ''
                }
                <div class="sign-body">
                  <span class="pill-tag">${escapeHtml(sign.categoryTitle)}</span>
                  <h3 class="sign-title">${escapeHtml(sign.title)}</h3>
                  ${
                    sign.description
                      ? `<p class="sign-desc">${escapeHtml(sign.description)}</p>`
                      : '<p class="sign-desc">Լրացուցիչ նկարագրություն չկա։</p>'
                  }
                </div>
              </article>`
              )
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

    // If the signs shell is already mounted, only update results so mobile keyboard stays open
    if (document.getElementById('signs-search-input') && document.getElementById('signs-results-container')) {
      renderSignsResults(categories);
      return;
    }

    const { query, categoryId } = session.signs;
    const catPillsHtml = [
      `<button type="button" class="sign-cat-pill ${categoryId === 'all' ? 'active' : ''}" data-sign-cat="all">Բոլորը (${SIGNS_DATA.totalSigns})</button>`,
      ...categories.map(
        (cat) => `
          <button type="button" class="sign-cat-pill ${Number(categoryId) === cat.id ? 'active' : ''}" data-sign-cat="${cat.id}">
            ${escapeHtml(cat.title)} (${cat.signCount})
          </button>`
      ),
    ].join('');

    rootEl.innerHTML = `
      <div class="card" style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 10px;">
          <h2 style="margin: 0; font-size: 19px;">Ճանապարհային նշաններ և նկարագրություններ</h2>
          <span class="pill-tag" id="signs-count-pill"></span>
        </div>
        <input
          type="search"
          class="input"
          style="width: 100%;"
          id="signs-search-input"
          placeholder="Որոնել նշանի համարով (օր.՝ 1.1, 3.24), անվանումով կամ նկարագրությամբ..."
          value="${escapeHtml(query)}"
        />
        <div class="signs-filters">${catPillsHtml}</div>
      </div>

      <div id="signs-results-container"></div>
    `;

    renderSignsResults(categories);

    document.getElementById('signs-search-input').addEventListener('input', (e) => {
      session.signs.query = e.target.value;
      renderSignsResults(categories);
    });
  }

  // ---------- Tab 5: Search & Browse ----------
  function renderSearchResults() {
    const { query, groupId, imagesOnly, showAnswers, page, pageSize } = session.search;
    const filtered = Core.filterQuestions(DATA.groups, { query, groupId, imagesOnly });
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
              const opts = q.options
                .map((opt, idx) => {
                  const isRight = showAnswers && idx === q.correctIndex;
                  return `<li class="${isRight ? 'is-correct' : ''}">${idx + 1}. ${escapeHtml(opt)} ${isRight ? '✓' : ''}</li>`;
                })
                .join('');
              return `
                <div class="search-result-card">
                  <div class="question-meta">
                    <span><strong>Խումբ ${q.groupId}</strong> · Հարց №${q.number}</span>
                    <button type="button" class="btn btn-sm btn-ghost" data-open-in-practice="${q.groupId}:${q.number}">
                      Բացել ուսուցման մեջ
                    </button>
                  </div>
                  <div style="font-weight: 600; margin-bottom: 10px;">${escapeHtml(q.text)}</div>
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

    const { query, groupId, imagesOnly, showAnswers } = session.search;
    const groupOptions = [
      `<option value="all" ${groupId === 'all' ? 'selected' : ''}>Բոլոր խմբերը (1–10)</option>`,
      ...DATA.groups.map(
        (g) => `<option value="${g.id}" ${Number(groupId) === g.id ? 'selected' : ''}>Խումբ ${g.id} (${g.questionCount})</option>`
      ),
    ].join('');

    rootEl.innerHTML = `
      <div class="card" style="margin-bottom: 16px;">
        <div class="search-controls">
          <input
            type="search"
            class="input"
            id="search-input"
            placeholder="Որոնել հարցերում և պատասխաններում (օր.՝ հետադարձ, նշան, կանգառ)..."
            value="${escapeHtml(query)}"
          />
          <select class="select" id="search-group">${groupOptions}</select>
          <label class="checkbox-label">
            <input type="checkbox" id="search-images-only" ${imagesOnly ? 'checked' : ''} />
            Միայն նկարով
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="search-show-answers" ${showAnswers ? 'checked' : ''} />
            Ցույց տալ պատասխանները
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
    document.getElementById('search-show-answers').addEventListener('change', (e) => {
      session.search.showAnswers = e.target.checked;
      renderSearchResults();
    });
  }

  // ---------- Main Render & Event Delegation ----------
  function render() {
    updateHeaderStats();
    const tab = state.ui.activeTab;
    if (tab === 'practice') renderPractice();
    else if (tab === 'exam') renderExam();
    else if (tab === 'mistakes') renderMistakes();
    else if (tab === 'signs') renderSigns();
    else if (tab === 'search') renderSearch();
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

  document.getElementById('btn-export').addEventListener('click', () => {
    const json = Core.exportStateJson(state);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roadpolice-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Առաջընթացը արտահանվեց');
  });

  document.getElementById('input-import').addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      state = Core.importStateJson(text);
      persist();
      render();
      showToast('Տվյալները հաջողությամբ ներմուծվեցին');
    } catch (err) {
      alert(`Ներմուծման սխալ․ ${err.message}`);
    } finally {
      e.target.value = '';
    }
  });

  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  lightboxEl.addEventListener('click', (e) => {
    if (e.target === lightboxEl) closeLightbox();
  });

  rootEl.addEventListener('click', (e) => {
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
      state = res.state;
      if (res.isCorrect) {
        state = Core.resolveMistake(state, uid);
      }
      session.mistakes.attemptByUid[uid] = {
        selectedIndex,
        isCorrect: res.isCorrect,
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
    const signCatBtn = e.target.closest('[data-sign-cat]');
    if (signCatBtn) {
      const val = signCatBtn.dataset.signCat;
      session.signs.categoryId = val === 'all' ? 'all' : Number(val);
      renderSigns();
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

  // Lightweight privacy-friendly visitor & page-open tracking on deployed hosts
  (function initVisitorTracking() {
    if (!Core.shouldTrackAnalytics(window.location) || typeof fetch !== 'function') return;
    const ops = Core.getAnalyticsOperations(window.localStorage, window.sessionStorage);
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
      callCounter(ops.sessionEndpoint, 'page-opens').then((res) => {
        if (res && typeof res.value === 'number' && ops.sessionEndpoint === 'hit') {
          ops.markSessionCounted();
        }
        return res;
      }),
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
})();
