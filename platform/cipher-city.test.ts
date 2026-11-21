// Cipher City on the platform, against a real database.
// What these prove: the server checks the work itself, quick-check answers never leave it, the
// sealed code engine cannot be escaped or stalled, one school cannot see another's rows, and
// deleting a student, class or account removes their Cipher City data.
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { freshDatabase, browser, closePool } from './helpers.ts';
import { inSchool } from '../src/db.ts';
import { runSealed, stopRunner, RUN_MS } from '../src/courses/cipher-city-runner.ts';
import { createApp } from '../src/http.ts';
// @ts-expect-error The course is plain JavaScript without type declarations.
import { ALL, lessonsFor, isCode } from '../../courses/cipher-city/js/curriculum/index.js';
// @ts-expect-error The course is plain JavaScript without type declarations.
import { KEYS } from '../../courses/cipher-city/answers/index.js';
// @ts-expect-error The course is plain JavaScript without type declarations.
import { labAnswer } from '../../courses/cipher-city/js/engine/logic.js';
// @ts-expect-error The course is plain JavaScript without type declarations.
import { buildProgram, judge, parseReport } from '../../courses/cipher-city/js/engine/program.js';

const CC = 'cipher-city';
type B = ReturnType<typeof browser>;
type AnyLesson = { id: string; title: string; steps: any[]; quiz: any[] };
const lessons = (grade: number) => lessonsFor(grade) as AnyLesson[];
const owner = () => new pg.Client({ connectionString: process.env.OWNER_DATABASE_URL });

let n = 0;
async function teacher(grade = 6, name = 'Ms Rivera') {
  const b = browser(`10.7.0.${++n}`, CC);
  const session = await b.call('teacherSignUp', name, `cc${n}@school.example`, 'made-up-password-1');
  const cls = await b.call('ccCreateClass', `Period ${n}`, grade);
  return { ...b, cls, session };
}
async function joined(code: string, name: string) {
  const b = browser(`10.8.0.${++n}`, CC);
  const made = await b.call('studentJoin', code, name);
  return { ...b, ...made as { username: string; passcode: string; session: any } };
}
/** Do a whole lesson the honest way: reference code for code steps, right answers for the rest. */
async function finish(s: B, lesson: AnyLesson) {
  const key = KEYS[lesson.id];
  await s.call('ccMission', lesson.id, 'We talked it through.');
  for (const step of lesson.steps) {
    const out = await s.call('ccStep', lesson.id, step.id, isCode(step) ? key.code[step.id] : labAnswer(step.lab));
    assert.equal(out.ok, true, `${lesson.id} step ${step.id} should pass`);
  }
  for (const x of lesson.quiz) assert.equal((await s.call('ccQuiz', lesson.id, x.id, key.quiz[x.id][0])).right, true);
  await s.call('ccShip', lesson.id, 'I learned that a longer secret takes much longer to guess.', true);
}

before(freshDatabase);
after(async () => { stopRunner(); await closePool(); });

test('a student joins, finishes a lesson, and the teacher sees it', async () => {
  const t = await teacher(6);
  assert.equal(t.cls.grade, 6);
  const s = await joined(t.cls.code, 'Nova R');
  const me = await s.call('ccMe');
  assert.equal(me.class.grade, 6);
  assert.equal(me.student.display_name, 'Nova R');
  const [first, second] = lessons(6) as [AnyLesson, AnyLesson];
  await assert.rejects(s.call('ccMission', second.id, ''), /Finish the lesson before this one/);
  await finish(s, first);
  await s.call('ccRate', first.id, 5);
  await s.call('ccMission', second.id, ''); // now open

  const home = await s.call('ccHome');
  assert.equal(home.works[first.id].ship.stretch, true);
  assert.equal(home.city.counts[first.id], 1);
  assert.equal(home.city.size, 1);

  const board = await t.call('ccBoard', t.cls.id);
  assert.equal(board.students.length, 1);
  assert.equal(board.students[0].row[0].state, 'done');
  assert.equal(board.students[0].done, 1);
  assert.ok(board.students[0].xp > 150, 'XP is worked out from the saved work');
  assert.ok(board.students[0].badges.includes('power-on'));
  const classes = await t.call('ccClasses');
  assert.deepEqual(classes.map((c: any) => [c.grade, c.count]), [[6, 1]]);
  const screen = await t.call('ccScreen', t.cls.id);
  assert.equal(screen.wins[0].name, 'Nova R');
  assert.ok(!JSON.stringify(screen).includes('xp'), 'the class screen carries no scores');
});

test('the server checks the work itself and believes nothing the browser claims', async () => {
  const t = await teacher(6);
  const s = await joined(t.cls.code, 'Kai T');
  const lesson = lessons(6)[0]!;
  const key = KEYS[lesson.id];
  const codeStep = lesson.steps.find((x) => isCode(x));
  // Steps before the mission, and anything out of order, are refused.
  await assert.rejects(s.call('ccStep', lesson.id, codeStep.id, key.code[codeStep.id]), /Read the mission first/);
  await s.call('ccMission', lesson.id, '');
  await assert.rejects(s.call('ccQuiz', lesson.id, 'q1', 0), /Finish the build steps first/);
  await assert.rejects(s.call('ccShip', lesson.id, 'A sentence that is long enough to count.', false), /Pass the quick check first/);
  // The starter does not pass. Neither does a claim of success in place of code.
  assert.equal((await s.call('ccStep', lesson.id, codeStep.id, codeStep.starter)).ok, false);
  for (const claim of [{ done: true }, { passed: true, ok: true }, true, null, 12345, ['passed']]) {
    assert.equal((await s.call('ccStep', lesson.id, codeStep.id, claim)).ok, false);
  }
  const labStep = lesson.steps.find((x) => !isCode(x));
  if (labStep) for (const claim of [true, { done: true }, 'done', [], null]) assert.equal((await s.call('ccStep', lesson.id, labStep.id, claim)).ok, false);
  const home = await s.call('ccHome');
  assert.ok(!home.works[lesson.id].steps[codeStep.id].done);
  // A lesson from another grade is not this student's to open.
  await assert.rejects(s.call('ccMission', 'g7-01', ''), /not in your course/);
  await assert.rejects(s.call('ccMission', 'nope', ''), /not in your course/);
  // A student cannot reach teacher requests, or another course's.
  await assert.rejects(s.call('ccBoard', t.cls.id), /cannot do that/);
  await assert.rejects(s.call('ccAnswerKey', 6), /cannot do that/);
  await assert.rejects(s.call('ccAward', s.session.student.id, 'crew-mate', true), /cannot do that/);
  await assert.rejects(s.call('saveWork', 'a1', { code: '' }), /cannot do that/);
});

test('quick-check answers never reach a student', async () => {
  const t = await teacher(6);
  const s = await joined(t.cls.code, 'Juno P');
  const lesson = lessons(6)[0]!;
  const key = KEYS[lesson.id];
  await s.call('ccMission', lesson.id, '');
  for (const step of lesson.steps) await s.call('ccStep', lesson.id, step.id, isCode(step) ? key.code[step.id] : labAnswer(step.lab));
  const x = lesson.quiz[0];
  const wrongChoice = (key.quiz[x.id][0] + 1) % x.choices.length;
  const wrong = await s.call('ccQuiz', lesson.id, x.id, wrongChoice);
  assert.equal(wrong.right, false);
  assert.equal(wrong.why, '', 'a wrong answer gets no reason, so it gives nothing away');
  assert.ok(!JSON.stringify(wrong).includes(key.quiz[x.id][1]));
  const right = await s.call('ccQuiz', lesson.id, x.id, key.quiz[x.id][0]);
  assert.equal(right.right, true);
  // The first choice is what the teacher's report uses, and it stays the first choice.
  assert.equal(right.work.quiz.first[x.id], wrongChoice);
  assert.equal(right.work.quiz.firstOk[x.id], false);
  // Nothing a student can ask for carries the answers to questions they have not got right.
  const other = KEYS[lesson.id].quiz.q4[1];
  for (const out of [await s.call('ccHome'), await s.call('ccMe')]) assert.ok(!JSON.stringify(out).includes(other));

  // And the answers folder is not served at all.
  const server = createApp().listen(0);
  const port = (server.address() as { port: number }).port;
  try {
    for (const p of ['answers/index.js', 'answers/grade6.js', 'tests/curriculum.test.mjs', 'UPSTREAM.md', '../../server/src/config.ts']) {
      assert.equal((await fetch(`http://localhost:${port}/cipher-city/${p}`)).status, 404, `${p} must not be served`);
    }
    const page = await fetch(`http://localhost:${port}/cipher-city/`);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /<meta name="cc-store" content="hosted">/);
    const csp = page.headers.get('content-security-policy') || '';
    assert.match(csp, /default-src 'self'/);
    assert.ok(!/unsafe-eval|https?:|\*/.test(csp), 'the page may load nothing from another site and may not use eval');
    assert.ok(!/script-src[^;]*unsafe-inline/.test(csp), 'no inline script');
    assert.equal(page.headers.get('x-frame-options'), 'DENY');
    const lessonFile = await (await fetch(`http://localhost:${port}/cipher-city/js/curriculum/grade6.js`)).text();
    assert.ok(!lessonFile.includes(other), 'lesson files sent to the browser hold no answer reasons');
  } finally { server.close(); }
});

test('every reference answer in all 30 lessons passes in the sealed engine, quickly', async () => {
  assert.equal(ALL.length, 30);
  let slowest = 0;
  for (const lesson of ALL as AnyLesson[]) {
    for (const step of lesson.steps.filter((x) => isCode(x))) {
      const code = KEYS[lesson.id].code[step.id];
      const t0 = Date.now();
      const verdict = judge(step, code, parseReport(await runSealed(buildProgram(step, code))));
      slowest = Math.max(slowest, Date.now() - t0);
      assert.equal(verdict.passed, true, `${lesson.id} step ${step.id}: ${verdict.error?.message || JSON.stringify(verdict.tests.filter((x: any) => !x.ok))}`);
      const starter = judge(step, step.starter, parseReport(await runSealed(buildProgram(step, step.starter))));
      assert.equal(starter.passed, false, `${lesson.id} step ${step.id}: the starter must not pass`);
    }
  }
  assert.ok(slowest < RUN_MS / 2, `the slowest reference answer took ${slowest} ms; the limit for students is ${RUN_MS} ms`);
});

test('the sealed engine cannot be escaped, stalled or tricked', async () => {
  const step = { tests: [{ run: 'answer()', want: 42 }] };
  const run = async (code: string) => judge(step, code, parseReport(await runSealed(buildProgram(step, code))));
  assert.equal((await run('function answer() { return 42; }')).passed, true);

  // Stalling: an endless loop, endless recursion and a memory bomb all end, and none passes.
  for (const code of ['var a = []; while (true) a.push(new Array(100000).join("x"));', 'while (true) {}', 'function answer() { return answer(); }', 'var s = "x"; while (true) s += s;', 'function answer() { while (true) {} }']) {
    const t0 = Date.now();
    const out = await run(code);
    assert.equal(out.passed, false, code);
    assert.ok(Date.now() - t0 < RUN_MS + 2500, `stopped in time: ${code}`);
  }
  // After a run had to be cut off, the next honest run still works.
  assert.equal((await run('function answer() { return 42; }')).passed, true);
  // Meanwhile the server itself stays free: a stalled run does not hold up other work.
  const stalled = run('var a = []; while (true) a.push(new Array(100000).join("x"));');
  const tick = Date.now();
  await new Promise((r) => setTimeout(r, 50));
  assert.ok(Date.now() - tick < 300, 'the server kept answering while student code was stuck');
  await stalled;
  // Escaping: nothing of the server is reachable from inside.
  const probes = ['typeof process', 'typeof require', 'typeof fetch', 'typeof XMLHttpRequest', 'typeof WebSocket', 'typeof setTimeout', 'typeof globalThis.Deno', 'typeof module', 'typeof Bun', 'typeof os', 'typeof std'];
  const seen = await runSealed(buildProgram({ tests: probes.map((p) => ({ run: p, want: 'undefined' })) }, ''));
  assert.deepEqual(parseReport(seen).got.map((g: any) => g.v), probes.map(() => 'undefined'));
  for (const code of [
    'function answer() { return this.constructor.constructor("return process")().pid; }',
    'function answer() { return (function(){}).constructor("return globalThis.process")() ? 1 : 0; }',
    'function answer() { return import("node:fs"); }',
    'function answer() { try { null.x } catch (e) { return e.constructor.constructor("return process")().env; } }',
  ]) assert.equal((await run(code)).passed, false, code);
  // Tricking the checker: the report is built by code the student cannot replace, and judged outside the engine.
  for (const code of [
    '__cc = { finish: function () { return "{\\"out\\":[],\\"got\\":[{\\"v\\":42}],\\"error\\":null}"; } };',
    'JSON.stringify = function () { return "{\\"out\\":[],\\"got\\":[{\\"v\\":42}],\\"error\\":null}"; };',
    '__cc.tests = function () {}; __cc.finish = function () { return "x"; }; function answer() { return 1; }',
    'var __result = "{\\"out\\":[],\\"got\\":[{\\"v\\":42}],\\"error\\":null}";',
    'Array.prototype.push = function () { return 0; }; Object.keys = function () { return []; }; function answer() { return 41; }',
    '} catch (e) {} function answer() { return 41; } try {',
    'throw { message: "x", name: "y", stack: "z" };',
    'function answer() { return { valueOf: function () { return 42; }, toJSON: function () { return 41; } }; }',
  ]) assert.equal((await run(code)).passed, false, code);
  // A flood of output is cut off, not kept.
  const flood = parseReport(await runSealed(buildProgram(step, 'for (var i = 0; i < 5000; i++) say("x".repeat(5000)); function answer() { return 42; }')));
  assert.ok(flood.out.length <= 120 && flood.out.every((l: string) => l.length < 400));
});

test('a student cannot run code without limit', async () => {
  const t = await teacher(6);
  const s = await joined(t.cls.code, 'Rio M');
  const lesson = lessons(6)[0]!;
  const step = lesson.steps.find((x) => isCode(x));
  await s.call('ccMission', lesson.id, '');
  for (let i = 0; i < 40; i++) await s.call('ccStep', lesson.id, step.id, 'say("again")');
  await assert.rejects(s.call('ccStep', lesson.id, step.id, 'say("again")'), /a lot of runs/);
  await assert.rejects(s.call('ccStep', lesson.id, step.id, 'x'.repeat(7000)), /too much code|a lot of runs/);
});

test('one teacher cannot reach another teacher\'s class, and the database itself keeps schools apart', async () => {
  const a = await teacher(7, 'Ms Avery');
  const b = await teacher(7, 'Mr Blake');
  const s = await joined(a.cls.code, 'Sage W');
  const lesson = lessons(7)[0]!;
  await finish(s, lesson);
  const help = await s.call('ccAskHelp', lesson.id, 'a', 'My loop never stops.');
  const sid = s.session.student.id;
  for (const attack of [
    () => b.call('ccBoard', a.cls.id), () => b.call('ccFeedback', a.cls.id), () => b.call('ccScreen', a.cls.id), () => b.call('ccHelpQueue', a.cls.id),
    () => b.call('ccExportClass', a.cls.id), () => b.call('ccSetClass', a.cls.id, { open_all: true }), () => b.call('ccSetPlan', a.cls.id, { question: 'hi' }),
    () => b.call('ccStudentWork', sid), () => b.call('ccReview', sid, lesson.id, { code: 3 }, 'x'), () => b.call('ccAward', sid, 'crew-mate', true, ''),
  ]) await assert.rejects(attack(), /was not found/);
  // Another school's help request does not exist as far as this teacher's database view goes, so nothing happens.
  await b.call('ccHelpDone', help.id);
  assert.equal((await a.call('ccHelpQueue', a.cls.id)).length, 1, 'the request is still there');
  // A student in one class sees nothing of another class, even by guessing ids.
  const other = await joined(b.cls.code, 'Zed B');
  assert.equal((await other.call('ccHome')).city.counts[lesson.id], 0);

  // Below the application: as the server's own database role, inside school B, school A's rows do not exist.
  const schoolA = await schoolOf(a.cls.id), schoolB = await schoolOf(b.cls.id);
  assert.notEqual(schoolA, schoolB);
  await inSchool(schoolB, async (q) => {
    for (const table of ['cc_work', 'cc_help', 'cc_student']) assert.equal((await q(`SELECT 1 FROM ${table}`)).length, 0, `${table} of another school is hidden`);
    assert.equal((await q('UPDATE cc_work SET data = \'{}\' RETURNING 1')).length, 0, 'cannot change another school\'s work');
    assert.equal((await q('DELETE FROM cc_help RETURNING 1')).length, 0, 'cannot delete another school\'s rows');
  });
  await assert.rejects(inSchool(schoolB, (q) => q('INSERT INTO cc_work (school_id, student_id, lesson_id, data) VALUES ($1, $2, $3, $4)', [schoolA, sid, 'g7-02', '{}'])), /row-level security/);
  await assert.rejects(inSchool(schoolB, (q) => q('INSERT INTO cc_award (school_id, student_id, badge_id) VALUES ($1, $2, $3)', [schoolA, sid, 'crew-mate'])), /row-level security/);
  await inSchool(schoolA, async (q) => assert.ok((await q('SELECT 1 FROM cc_work')).length >= 1, 'school A still sees its own'));
});
async function schoolOf(classId: string): Promise<string> {
  const c = owner();
  await c.connect();
  try { return (await c.query('SELECT school_id FROM classes WHERE id = $1', [classId])).rows[0].school_id as string; } finally { await c.end(); }
}

test('reviews, badges, the help queue, the feedback report and the export', async () => {
  const t = await teacher(8);
  const s = await joined(t.cls.code, 'Lux A');
  const [first] = lessons(8) as [AnyLesson];
  await finish(s, first);
  await s.call('ccConfusing', first.id, 'a', true);
  const sid = s.session.student.id;

  await t.call('ccReview', sid, first.id, { code: 3, thinking: 2, writing: 9, extra: 1 }, 'Clear thinking. Next time, say why.');
  const work = await t.call('ccStudentWork', sid);
  assert.deepEqual(work.reviews[first.id].scores, { code: 3, thinking: 2 }, 'only real rubric rows and levels are kept');
  assert.ok(work.works[first.id].steps[first.steps.find((x) => isCode(x)).id].code, 'the teacher can read the student\'s code');
  const before = (await t.call('ccBoard', t.cls.id)).students[0].xp;
  // The student sees the words, not the scores. And scores never change XP.
  const home = await s.call('ccHome');
  assert.equal(home.reviews[first.id].feedback, 'Clear thinking. Next time, say why.');
  assert.deepEqual(home.reviews[first.id].scores, {});
  await t.call('ccReview', sid, first.id, { code: 0, thinking: 0, writing: 0 }, '');
  assert.equal((await t.call('ccBoard', t.cls.id)).students[0].xp, before, 'XP does not depend on a teacher\'s scores');

  await assert.rejects(t.call('ccAward', sid, 'district-lit', true, ''), /badge was not found/, 'earned badges cannot be handed out');
  await t.call('ccAward', sid, 'asks-first', true, 'Asked before testing.');
  assert.ok((await t.call('ccBoard', t.cls.id)).students[0].badges.includes('asks-first'));

  await s.call('ccAskHelp', first.id, 'b', 'I tried the hint.');
  await s.call('ccAskHelp', first.id, 'c', 'Now this one.');
  const queue = await t.call('ccHelpQueue', t.cls.id);
  assert.equal(queue.length, 1, 'one open request for each student');
  assert.equal(queue[0].name, 'Lux A');
  await t.call('ccHelpDone', queue[0].id);
  assert.equal((await t.call('ccHelpQueue', t.cls.id)).length, 0);

  const report = await t.call('ccFeedback', t.cls.id);
  assert.equal(report[0].finished, 1);
  assert.equal(report[0].confusing[0].n, 1);
  assert.ok(!JSON.stringify(report).includes('Lux'), 'the feedback report has no student names');

  const data = await t.call('ccExportClass', t.cls.id);
  assert.equal(data.students[0].display_name, 'Lux A');
  assert.ok(data.students[0].works[first.id].ship.text);
  assert.equal(data.students[0].reviews.length, 1);
  assert.ok(!JSON.stringify(data).includes('passcode'), 'no passcode, scrambled or not, is exported');

  const key = await t.call('ccAnswerKey', 8);
  assert.equal(Object.keys(key).length, 10);
});

test('the reward game only spends time that was earned, and only while the teacher has it open', async () => {
  const t = await teacher(6);
  const s = await joined(t.cls.code, 'Pax D');
  await assert.rejects(s.call('ccPlay', 10), /closed the game/);
  await t.call('ccSetClass', t.cls.id, { game_open: true });
  assert.deepEqual(await s.call('ccPlay', 30), { used: 0, earned: 0 }, 'no lessons finished, no play time');
  await finish(s, lessons(6)[0]!);
  assert.deepEqual(await s.call('ccPlay', 50), { used: 50, earned: 120 });
  assert.deepEqual(await s.call('ccPlay', 9999), { used: 110, earned: 120 }, 'one call can spend a minute at most');
  assert.deepEqual(await s.call('ccPlay', 60), { used: 120, earned: 120 }, 'never more than was earned');
  // Operator parts above the student's level are not kept.
  assert.deepEqual(await s.call('ccAvatar', { body: 6, visor: 4, top: 4, deck: 4 }), { body: 0, visor: 0, top: 0, deck: 0 });
  assert.equal((await s.call('ccAvatar', { body: 1, visor: 1, top: 0, deck: 0 })).body, 1);
  assert.deepEqual((await s.call('ccMe')).student.avatar, { body: 1, visor: 1, top: 0, deck: 0 });
});

test('student view is a pretend student no class page ever shows', async () => {
  const t = await teacher(6);
  await t.call('ccPreviewGrade', 8);
  const me = await t.call('asStudent', 'ccMe', []);
  assert.equal(me.class.grade, 8);
  assert.equal(me.class.open_all, true);
  await t.call('asStudent', 'ccMission', ['g8-05', '']); // any lesson is open to the pretend student
  assert.equal(await t.call('asStudent', 'ccAskHelp', ['g8-05', 'a', 'hello']), null, 'the pretend student sends no help requests');
  await assert.rejects(t.call('asStudent', 'ccBoard', [t.cls.id]), /cannot do that/);
  assert.equal((await t.call('ccClasses')).length, 1, 'the hidden class is not listed');
  assert.equal((await t.call('ccBoard', t.cls.id)).students.length, 0);
  await t.call('ccPreviewGrade', 6);
  assert.equal((await t.call('asStudent', 'ccMe', [])).class.grade, 6);
});

test('a class belongs to this course, and other courses are left alone', async () => {
  const t = await teacher(6);
  // The same teacher account works on Pixel Trail, and each course lists only its own classes.
  const pt = browser('10.9.0.1', 'pixel-trail');
  await pt.call('teacherSignIn', t.session.teacher.email, 'made-up-password-1');
  assert.deepEqual(await pt.call('listClasses'), []);
  const ptClass = await pt.call('createClass', 'Pixel period');
  assert.equal((await t.call('ccClasses')).length, 1);
  await assert.rejects(t.call('ccBoard', ptClass.id), /was not found/);
  // A Cipher City code typed on Pixel Trail's page says where it belongs, and the other way round.
  await assert.rejects(browser('10.9.0.2', 'pixel-trail').call('studentJoin', t.cls.code, 'Ari'), /Cipher City/);
  await assert.rejects(browser('10.9.0.3', CC).call('studentJoin', ptClass.code, 'Ari'), /Pixel Trail/);
  // A Pixel Trail student has no Cipher City requests.
  const ps = browser('10.9.0.4', 'pixel-trail');
  await ps.call('studentJoin', ptClass.code, 'Ari M');
  await assert.rejects(ps.call('ccHome'), /cannot do that/);
});

test('deleting a student, a class or an account removes their Cipher City data', async () => {
  const t = await teacher(6);
  const s1 = await joined(t.cls.code, 'Ada One');
  const s2 = await joined(t.cls.code, 'Bea Two');
  const lesson = lessons(6)[0]!;
  for (const s of [s1, s2]) { await finish(s, lesson); await s.call('ccAskHelp', lesson.id, 'a', 'help'); }
  await t.call('ccAward', s1.session.student.id, 'crew-mate', true, '');
  await t.call('ccReview', s2.session.student.id, lesson.id, { code: 2 }, 'ok');
  const c = owner();
  await c.connect();
  const count = async (table: string, where: string, v: string) => Number((await c.query(`SELECT count(*) AS n FROM ${table} WHERE ${where} = $1`, [v])).rows[0].n);
  try {
    const school = (await c.query('SELECT school_id FROM classes WHERE id = $1', [t.cls.id])).rows[0].school_id as string;
    assert.ok(await count('cc_work', 'student_id', s1.session.student.id) >= 1);
    await t.call('removeStudent', s1.session.student.id);
    for (const table of ['cc_work', 'cc_help', 'cc_award', 'cc_student', 'cc_review']) assert.equal(await count(table, 'student_id', s1.session.student.id), 0, `${table} of a removed student`);
    assert.ok(await count('cc_work', 'school_id', school) >= 1, 'the other student is untouched');
    await t.call('deleteClass', t.cls.id);
    for (const table of ['cc_work', 'cc_help', 'cc_award', 'cc_student', 'cc_review']) assert.equal(await count(table, 'school_id', school), 0, `${table} after the class is deleted`);

    const t2 = await teacher(7);
    const s3 = await joined(t2.cls.code, 'Cy Three');
    await finish(s3, lessons(7)[0]!);
    const school2 = (await c.query('SELECT school_id FROM classes WHERE id = $1', [t2.cls.id])).rows[0].school_id as string;
    await t2.call('deleteAccount', 'made-up-password-1');
    for (const table of ['cc_work', 'cc_student']) assert.equal(await count(table, 'school_id', school2), 0, `${table} after the account is deleted`);
  } finally { await c.end(); }
});
