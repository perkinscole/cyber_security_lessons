// The game rules and the practice-mode store: XP comes only from saved work, the lesson order
// holds, quick-check answers are checked not trusted, and the teacher pages show what was done.
import test from 'node:test';
import assert from 'node:assert/strict';
import { lessonsFor, isCode } from '../js/curriculum/index.js';
import { KEYS } from '../answers/index.js';
import { createLocalStore } from '../js/data/local.js';
import { statsFor, lessonXp, isDone, cleanAvatar, XP, LEVELS, BADGES } from '../js/game/rules.js';
import { checkLab, labAnswer, shuffle } from '../js/engine/logic.js';
import { buildProgram, judge, parseReport, same } from '../js/engine/program.js';
import { explain } from '../js/engine/explain.js';
import { runStep } from '../tools/vmrun.mjs';

function memory() { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v) }; }
const fresh = () => createLocalStore({ storage: memory(), runner: async (step, code) => runStep(step, code), loadKeys: async () => KEYS });

async function finish(store, lesson) {
  const key = KEYS[lesson.id];
  await store.saveMission(lesson.id, 'We talked.');
  for (const s of lesson.steps) assert.equal((await store.checkStep(lesson.id, s.id, isCode(s) ? key.code[s.id] : labAnswer(s.lab))).ok, true, `${lesson.id} ${s.id}`);
  for (const x of lesson.quiz) assert.equal((await store.answerQuiz(lesson.id, x.id, key.quiz[x.id][0])).right, true);
  return store.ship(lesson.id, 'I learned that a longer secret is harder to guess. I will use four words.', true);
}

test('a practice student can finish every lesson in every grade', async () => {
  for (const grade of [6, 7, 8]) {
    const store = fresh();
    await store.studentJoin(`DEMO${grade}`, 'Walker T');
    const lessons = lessonsFor(grade);
    for (const l of lessons) assert.ok(isDone(l, await finish(store, l)), l.id);
    const home = await store.home();
    const st = statsFor(lessons, home.works, home.awards);
    assert.equal(st.done, 10);
    assert.ok(st.badges.includes('district-lit') && st.badges.includes('builder'));
    assert.equal(st.playMinutes, 20);
    assert.ok(st.level >= 6 && st.level <= LEVELS.length);
  }
});

test('lessons open in order, steps need the mission, and wrong work does not count', async () => {
  const store = fresh();
  await store.studentJoin('DEMO6', 'Order Test');
  const [first, second] = lessonsFor(6);
  await assert.rejects(store.saveMission(second.id, ''), /Finish the lesson before this one/);
  await assert.rejects(store.saveMission('g7-01', ''), /not in your course/);
  const codeStep = first.steps.find(isCode);
  await assert.rejects(store.checkStep(first.id, codeStep.id, KEYS[first.id].code[codeStep.id]), /Read the mission first/);
  await store.saveMission(first.id, '');
  assert.equal((await store.checkStep(first.id, codeStep.id, codeStep.starter)).ok, false);
  assert.equal((await store.checkStep(first.id, codeStep.id, 'this is not code (')).ok, false);
  await assert.rejects(store.answerQuiz(first.id, 'q1', 0), /Finish the build steps first/);
  await assert.rejects(store.ship(first.id, 'A long enough sentence to count as one.', false), /Pass the quick check first/);
  const work = (await store.home()).works[first.id];
  assert.equal(work.steps[codeStep.id].tries, 2);
  assert.ok(!work.steps[codeStep.id].done);
  assert.equal(lessonXp(first, work), XP.mission);
});

test('XP and badges come from the work, never from a teacher\'s scores', async () => {
  const store = fresh();
  const made = await store.studentJoin('DEMO6', 'Score Test');
  const first = lessonsFor(6)[0];
  await finish(store, first);
  const xp = statsFor(lessonsFor(6), (await store.home()).works, []).xp;
  await store.signOut();
  await store.teacherSignIn();
  const cls = (await store.classes()).find((c) => c.code === 'DEMO6');
  const row = (await store.board(cls.id)).students.find((s) => s.display_name === 'Score Test');
  assert.equal(row.xp, xp);
  await store.review(row.id, first.id, { code: 0, thinking: 0, writing: 0 }, 'Try again.');
  assert.equal((await store.board(cls.id)).students.find((s) => s.id === row.id).xp, xp, 'low scores take nothing away');
  await store.review(row.id, first.id, { code: 3, thinking: 3, writing: 3 }, '');
  assert.equal((await store.board(cls.id)).students.find((s) => s.id === row.id).xp, xp, 'high scores add nothing');
  await assert.rejects(store.award(row.id, 'district-lit', true), /badge was not found/);
  await store.award(row.id, 'crew-mate', true, 'Helped a friend.');
  assert.equal((await store.board(cls.id)).students.find((s) => s.id === row.id).xp, xp + XP.badge);
  assert.ok(made.username);
  for (const b of BADGES) assert.equal(typeof b.earned, 'function');
});

test('the teacher pages: made-up students, feedback with no names, help, class screen, export', async () => {
  const store = fresh();
  await store.teacherSignIn();
  const classes = await store.classes();
  assert.deepEqual(classes.map((c) => c.code), ['DEMO6', 'DEMO7', 'DEMO8']);
  const cls = classes[0];
  const board = await store.board(cls.id);
  assert.equal(board.students.length, 6);
  const names = board.students.map((s) => s.display_name);
  const report = await store.feedback(cls.id);
  assert.equal(report.length, 10);
  for (const n of names) assert.ok(!JSON.stringify(report).includes(n), 'the feedback report has no student names');
  assert.ok(report.some((r) => r.rating && r.finished));
  assert.equal((await store.helpQueue(cls.id)).length, 1);
  const screen = await store.screen(cls.id);
  assert.ok(screen.wins.length > 0);
  assert.ok(!('xp' in screen.wins[0]), 'the class screen shows wins, not scores');
  const made = await store.createClass('Period 2', 7);
  assert.equal(made.grade, 7);
  await assert.rejects(store.createClass('Bad', 9), /grade 6, 7 or 8/);
  const cards = await store.addStudents(made.id, ['Ada L', 'Ada L', '  ', 'Grace H']);
  assert.deepEqual(cards.map((c) => c.username), ['adal', 'adal2', 'graceh']);
  assert.equal((await store.exportClass(made.id)).students.length, 3);
  await store.removeStudent(cards[0].id);
  assert.equal((await store.roster(made.id)).length, 2);
  await store.deleteClass(made.id);
  assert.equal((await store.classes()).length, 3);
  // Student view: a pretend student with every lesson open, who shows on no class page.
  const s = await store.previewStart(8);
  assert.equal(s.class.grade, 8);
  await store.saveMission('g8-04', '');
  await store.previewEnd();
  for (const c of await store.classes()) assert.ok(!(await store.board(c.id)).students.some((x) => /student view/i.test(x.display_name)));
});

test('labs are checked by what was chosen, not by a claim of being done', () => {
  const sort = { type: 'sort', bins: ['a', 'b'], items: [['x', 0], ['y', 1], ['z', 0], ['w', 1]] };
  assert.ok(checkLab(sort, labAnswer(sort)));
  for (const bad of [true, 'done', { done: true }, [0, 1, 0], [1, 1, 0, 1], null]) assert.ok(!checkLab(sort, bad));
  const mcq = { type: 'mcq', choices: ['a', 'b'], answer: 1, why: 'x' };
  assert.ok(checkLab(mcq, 1) && !checkLab(mcq, 0) && !checkLab(mcq, true));
  const order = { type: 'order', items: ['a', 'b', 'c'] };
  assert.ok(checkLab(order, [0, 1, 2]) && !checkLab(order, [1, 0, 2]));
  const a = [1, 2, 3, 4, 5];
  assert.deepEqual(shuffle(a, 'k'), shuffle(a, 'k'));
  assert.notDeepEqual(shuffle(a, 'k'), a);
});

test('the code checker: values, printed lines, blanks, mistakes and what the error explainer says', () => {
  const step = { setup: 'var secret = 7;', tests: [{ run: 'twice(4)', want: 8 }, { run: 'twice(secret)', want: 14 }, { says: 'ready' }, { uses: 'return' }] };
  assert.ok(runStep(step, 'function twice(n) { return n * 2; }\nsay("Ready")').passed);
  assert.ok(!runStep(step, 'function twice(n) { return 8; }\nsay("ready")').passed, 'one fixed answer does not pass two tests');
  const blank = runStep(step, 'function twice(n) { return n * ___; }\nsay("ready")');
  assert.ok(!blank.passed && /blank/.test(blank.error.message));
  assert.match(explain(blank.error).text, /___ blank/);
  assert.match(explain(runStep(step, 'say(nope)').error).text, /does not know the name "nope"/);
  assert.match(explain(runStep(step, 'function twice(n) { return n * 2;').error).text, /bracket or brace/);
  assert.match(explain(runStep(step, 'while (true) {}', 200).error).text, /too long/);
  // What a test expression prints is not mixed into the student's own output.
  const noisy = runStep({ tests: [{ run: 'loud()', want: 1 }] }, 'function loud() { say("from the test"); return 1; }\nsay("mine")');
  assert.deepEqual(noisy.out, ['mine']);
  // The report is judged outside the program, so a made-up report in the output changes nothing.
  assert.ok(!judge(step, 'x', parseReport('{"passed":true}')).passed);
  assert.ok(!judge(step, 'x', parseReport('not json')).passed);
  assert.ok(same({ a: [1, 2] }, { a: [1, 2] }) && !same([1], [1, 2]) && !same('1', 1));
  assert.ok(buildProgram(step, 'x').split('\n')[0].startsWith('const __cc='));
  assert.deepEqual(cleanAvatar({ body: 6, visor: 99, top: -1, deck: 'x' }, 1), { body: 0, visor: 0, top: 0, deck: 0 });
});
