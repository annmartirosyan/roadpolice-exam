import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Core = require('../app-core.js');

function makeSampleGroups() {
  return Array.from({ length: 10 }, (_, gi) => {
    const gid = gi + 1;
    return {
      id: gid,
      title: `ԽՈՒՄԲ ${gid}`,
      questionCount: 3,
      questions: [1, 2, 3].map((num) => ({
        uid: `g${gid}-q${num}`,
        groupId: gid,
        number: num,
        text: gid === 1 && num === 1
          ? 'Երթեւեկության կանոնները խաչմերուկում'
          : `Հարց ${gid}-${num}`,
        images: num === 1 ? [`data/images/g${gid}.jpg`] : [],
        options: ['Առաջին', 'Երկրորդ', 'Երրորդ'],
        correctIndex: 1,
      })),
    };
  });
}

test('normalizeArmenian treats և and եւ identically and folds case', () => {
  const a = Core.normalizeArmenian('ԵՐԹԵՒԵԿՈՒԹՅՈՒՆ և անվտանգություն');
  const b = Core.normalizeArmenian('երթևեկություն եւ անվտանգություն');
  assert.equal(a, b);
  assert.ok(Core.normalizeArmenian('Երթեւեկության կանոնները').includes(Core.normalizeArmenian('երթևեկ')));
});

test('loadState recovers safely from corrupted JSON and importStateJson validates input', () => {
  const brokenStorage = {
    getItem: () => '{bad json!!!',
    setItem: () => {},
  };
  const state = Core.loadState(brokenStorage);
  assert.deepEqual(state.practice, {});
  assert.deepEqual(state.mistakes, {});
  assert.deepEqual(state.examHistory, []);
  assert.equal(state.ui.activeTab, 'home');

  assert.throws(() => Core.importStateJson('not-json'), /JSON|անվավեր/i);
  assert.throws(() => Core.importStateJson('{"practice": "wrong"}'), /անվավեր|invalid/i);

  const exported = Core.exportStateJson(state);
  const reimported = Core.importStateJson(exported);
  assert.equal(reimported.ui.activeTab, 'home');
});

test('recordPracticeAnswer locks first selection and tracks mistakes', () => {
  let state = Core.createInitialState();

  const res1 = Core.recordPracticeAnswer(state, 'g1-q1', 0, 1);
  assert.equal(res1.isCorrect, false);
  assert.equal(res1.newlyRecorded, true);
  state = res1.state;
  assert.equal(state.practice['g1-q1'].selectedIndex, 0);
  assert.equal(state.mistakes['g1-q1'].wrongCount, 1);

  // Clicking another option on an already-answered question must NOT overwrite or duplicate mistake
  const res2 = Core.recordPracticeAnswer(state, 'g1-q1', 1, 1);
  assert.equal(res2.newlyRecorded, false);
  assert.equal(res2.state.practice['g1-q1'].selectedIndex, 0);
  assert.equal(res2.state.mistakes['g1-q1'].wrongCount, 1);
});

test('resetGroupPractice clears only the target group practice entries', () => {
  let state = Core.createInitialState();
  state = Core.recordPracticeAnswer(state, 'g1-q1', 1, 1).state;
  state = Core.recordPracticeAnswer(state, 'g2-q1', 0, 1).state;

  const groups = makeSampleGroups();
  const next = Core.resetGroupPractice(state, groups[0].questions);
  assert.equal(next.practice['g1-q1'], undefined);
  assert.ok(next.practice['g2-q1']);
  assert.ok(next.mistakes['g2-q1']);
});

test('generateMockExam picks 20 unique questions with official 15+2+2+1 distribution', () => {
  const groups = makeSampleGroups();
  const exam = Core.generateMockExam(groups, () => 0.42);
  assert.equal(exam.length, 20);
  const uids = new Set(exam.map((q) => q.uid));
  assert.equal(uids.size, 20);

  const rulesSet = new Set([1, 4, 5, 6, 7, 8, 9]);
  assert.equal(exam.filter((q) => rulesSet.has(q.groupId)).length, 15);
  assert.equal(exam.filter((q) => q.groupId === 2).length, 2);
  assert.equal(exam.filter((q) => q.groupId === 3).length, 2);
  assert.equal(exam.filter((q) => q.groupId === 10).length, 1);
});

test('gradeMockExam handles unanswered questions on timer expiry and saves history', () => {
  const groups = makeSampleGroups();
  const exam = Core.generateMockExam(groups);
  const answers = {};
  // Answer first 18 correctly, leave last 2 unanswered (timer expired)
  for (let i = 0; i < 18; i++) {
    answers[exam[i].uid] = exam[i].correctIndex;
  }

  const state = Core.createInitialState();
  const { state: nextState, result } = Core.gradeMockExam(state, exam, answers, 1800);

  assert.equal(result.score, 18);
  assert.equal(result.total, 20);
  assert.equal(result.passed, true);
  assert.equal(nextState.examHistory.length, 1);
  assert.ok(nextState.mistakes[exam[18].uid]);
  assert.ok(nextState.mistakes[exam[19].uid]);
  assert.equal(nextState.mistakes[exam[0].uid], undefined);
});

test('retryMistakeAnswer and resolveMistake update or clear mistakes', () => {
  let state = Core.createInitialState();
  state = Core.recordPracticeAnswer(state, 'g1-q1', 0, 1).state;
  assert.equal(state.mistakes['g1-q1'].wrongCount, 1);

  const wrongRetry = Core.retryMistakeAnswer(state, 'g1-q1', 2, 1);
  assert.equal(wrongRetry.isCorrect, false);
  state = wrongRetry.state;
  assert.equal(state.mistakes['g1-q1'].wrongCount, 2);

  const rightRetry = Core.retryMistakeAnswer(state, 'g1-q1', 1, 1);
  assert.equal(rightRetry.isCorrect, true);
  state = Core.resolveMistake(rightRetry.state, 'g1-q1');
  assert.equal(state.mistakes['g1-q1'], undefined);
});

test('filterQuestions filters by Armenian query, groupId, and imagesOnly', () => {
  const groups = makeSampleGroups();
  const qRes = Core.filterQuestions(groups, { query: 'երթևեկ', groupId: 'all', imagesOnly: false });
  assert.equal(qRes.length, 1);
  assert.equal(qRes[0].uid, 'g1-q1');

  const imgRes = Core.filterQuestions(groups, { query: '', groupId: 3, imagesOnly: true });
  assert.equal(imgRes.length, 1);
  assert.equal(imgRes[0].uid, 'g3-q1');
});

test('filterSigns filters by categoryId and normalized Armenian query', () => {
  const categories = [
    {
      id: 1,
      title: '1. ՆԱԽԱԶԳՈՒՇԱՑՆՈՂ ՆՇԱՆՆԵՐ',
      signs: [
        { id: 's1', code: '1.1', title: '1.1. «Երկաթուղային գծանց»', description: 'Տեղադրվում է մինչեւ գծանցը' },
      ],
    },
    {
      id: 2,
      title: '2. ԱՌԱՎԵԼՈՒԹՅԱՆ ՆՇԱՆՆԵՐ',
      signs: [
        { id: 's2', code: '2.1', title: '2.1. «Գլխավոր ճանապարհ»', description: 'Երթևեկության առաջնահերթություն' },
      ],
    },
  ];
  assert.equal(Core.filterSigns(categories, { query: 'մինչև' }).length, 1);
  assert.equal(Core.filterSigns(categories, { query: 'երթեւեկ', categoryId: 2 }).length, 1);
  assert.equal(Core.filterSigns(categories, { query: '2.1', categoryId: 1 }).length, 0);
});

test('shouldTrackAnalytics skips file:// and localhost and tracks deployed hosts', () => {
  assert.equal(Core.shouldTrackAnalytics({ protocol: 'file:', hostname: '' }), false);
  assert.equal(Core.shouldTrackAnalytics({ protocol: 'http:', hostname: 'localhost' }), false);
  assert.equal(Core.shouldTrackAnalytics({ protocol: 'http:', hostname: '127.0.0.1' }), false);
  assert.equal(Core.shouldTrackAnalytics({ protocol: 'https:', hostname: 'annmartirosyan.github.io' }), true);
});

test('getAnalyticsOperations counts unique visitors once and every repeat visit', () => {
  const map = new Map();
  const local = {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
  };

  const first = Core.getAnalyticsOperations(local);
  assert.equal(first.visitorEndpoint, 'hit');
  assert.equal(first.visitEndpoint, 'hit');
  first.markVisitorCounted();

  // Repeat visits by the same person still increment total opens, but read unique visitors without incrementing
  const repeat = Core.getAnalyticsOperations(local);
  assert.equal(repeat.visitorEndpoint, 'get');
  assert.equal(repeat.visitEndpoint, 'hit');
});

test('computeReadiness and generateSmartDrill prioritize mistakes and weak questions', () => {
  const groups = makeSampleGroups();
  let state = Core.createInitialState();
  assert.equal(Core.computeReadiness(groups, state).overallPct, 0);

  state = Core.recordPracticeAnswer(state, 'g1-q1', 0, 1).state; // wrong -> in mistakes
  state = Core.recordPracticeAnswer(state, 'g2-q1', 1, 1).state; // correct

  const readiness = Core.computeReadiness(groups, state);
  assert.ok(readiness.overallPct > 0 && readiness.overallPct < 100);
  assert.equal(readiness.buckets.law.correct, 1);

  const drill = Core.generateSmartDrill(groups, state, 10);
  assert.equal(drill.length, 10);
  assert.equal(drill[0].uid, 'g1-q1');
  assert.equal(new Set(drill.map((q) => q.uid)).size, 10);
});

test('computeReadiness scales proportionally with mastered questions on full 1050-question bank', () => {
  const realSizes = { 1: 147, 2: 82, 3: 59, 4: 181, 5: 136, 6: 95, 7: 127, 8: 53, 9: 119, 10: 51 };
  const bigGroups = Object.entries(realSizes).map(([gidStr, count]) => {
    const gid = Number(gidStr);
    return {
      id: gid,
      title: `ԽՈՒՄԲ ${gid}`,
      questionCount: count,
      questions: Array.from({ length: count }, (_, idx) => ({
        uid: `g${gid}-q${idx + 1}`,
        groupId: gid,
        number: idx + 1,
        text: `Q ${gid}-${idx + 1}`,
        images: [],
        options: ['A', 'B'],
        correctIndex: 0,
      })),
    };
  });

  let state = Core.createInitialState();
  // Answering 2 out of 1050 questions correctly must be ~0.2%, not 26% or 53%
  state = Core.recordPracticeAnswer(state, 'g1-q1', 0, 0).state;
  state = Core.recordPracticeAnswer(state, 'g1-q2', 0, 0).state;
  const r2 = Core.computeReadiness(bigGroups, state);
  assert.ok(r2.overallPct > 0 && r2.overallPct <= 0.5, `Expected <= 0.5%, got ${r2.overallPct}%`);

  // Answering all 1050 correctly yields 100%
  for (const g of bigGroups) {
    for (const q of g.questions) {
      state = Core.recordPracticeAnswer(state, q.uid, 0, 0).state;
    }
  }
  assert.equal(Core.computeReadiness(bigGroups, state).overallPct, 100);
});

test('sign cross-linking ignores measurement units and rule numbers while linking real sign codes', () => {
  const categories = [
    {
      id: 1,
      title: '1. ՆԱԽԱԶԳՈՒՇԱՑՆՈՂ',
      signs: [
        { id: 's1', categoryId: 1, code: '1.2', title: '1.2. «Առանց ուղեփակոցի»', description: 'desc' },
        { id: 's2', categoryId: 1, code: '1.6', title: '1.6. «Հավասարազոր հատում»', description: 'desc' },
        { id: 's3', categoryId: 1, code: '1.34', title: '1.34.1«Շրջադարձի ուղղություն»', description: 'desc' },
      ],
    },
    {
      id: 4,
      title: '4. ԹԵԼԱԴՐՈՂ',
      signs: [
        { id: 's4', categoryId: 4, code: '4.2.2', title: '4.2.2. «Արգելքի շրջանցումը ձախից»', description: 'desc' },
        { id: 's5', categoryId: 4, code: '4.4', title: '4.4.1 «Հեծանվային արահետ»', description: 'desc' },
      ],
    },
  ];
  const { byCode } = Core.buildSignIndex(categories);
  assert.ok(byCode['1.34.1']);
  assert.ok(byCode['4.4.1']);

  const text = 'Նշան 4.2.2-ը պարտադրում է շրջանցում ձախից, իսկ դողերի 1.6 մմ բարձրությունը և կետ 1.2-ը թվեր են։';
  const tokens = Core.tokenizeExplanationWithSigns(text, byCode);
  const linkedCodes = tokens.filter((t) => t.type === 'sign').map((t) => t.code);
  assert.deepEqual(linkedCodes, ['4.2.2']);

  const quiz = Core.generateSignQuiz(categories, 'all', 4);
  assert.equal(quiz.length, 4);
  for (const item of quiz) {
    assert.equal(item.options.length, 4);
    assert.equal(item.options[item.correctIndex].id, item.target.id);
  }
});
