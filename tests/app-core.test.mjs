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
  assert.equal(state.ui.activeTab, 'practice');

  assert.throws(() => Core.importStateJson('not-json'), /JSON|անվավեր/i);
  assert.throws(() => Core.importStateJson('{"practice": "wrong"}'), /անվավեր|invalid/i);

  const exported = Core.exportStateJson(state);
  const reimported = Core.importStateJson(exported);
  assert.equal(reimported.ui.activeTab, 'practice');
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

test('generateMockExam picks 20 unique questions (2 per group)', () => {
  const groups = makeSampleGroups();
  const exam = Core.generateMockExam(groups, () => 0.42);
  assert.equal(exam.length, 20);
  const uids = new Set(exam.map((q) => q.uid));
  assert.equal(uids.size, 20);
  for (let gid = 1; gid <= 10; gid++) {
    const count = exam.filter((q) => q.groupId === gid).length;
    assert.equal(count, 2);
  }
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
