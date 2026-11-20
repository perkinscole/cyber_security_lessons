// The three grades, and the validator every lesson must pass.
import { STANDARDS } from './standards.js';
import grade6 from './grade6.js';
import grade7 from './grade7.js';
import grade8 from './grade8.js';

export { STANDARDS };
export const GRADES = [
  { grade: 6, name: 'Lock It Down', district: 'Harbor District', blurb: 'Keep yourself safe. Finish and change code that is already started.', lessons: grade6 },
  { grade: 7, name: 'Crack the Case', district: 'Midtown', blurb: 'How attacks and defences work. Write one short function at a time.', lessons: grade7 },
  { grade: 8, name: 'Build the Defence', district: 'The Heights', blurb: 'Design and test defences. Write whole functions and test them.', lessons: grade8 },
];
export const isGrade = (g) => g === 6 || g === 7 || g === 8;
export const gradeInfo = (grade) => GRADES.find((g) => g.grade === Number(grade));
export const lessonsFor = (grade) => gradeInfo(grade)?.lessons || [];
export const ALL = GRADES.flatMap((g) => g.lessons);
const BY_ID = new Map(ALL.map((l) => [l.id, l]));
export const getLesson = (id) => BY_ID.get(id);
export const gradeOf = (lessonId) => Number(String(lessonId).slice(1, 2));
export const standard = (code) => STANDARDS.find((s) => s.code === code);
export const isCode = (step) => !step.lab;
/** Does this lesson ask for anything that looks like a password? Then the screen says: made-up ones only. */
export const mentionsSecrets = (step) => /pass(word|phrase|code)|\bPIN\b|sign[- ]?in|log[- ]?in/i.test(`${step.say} ${step.more || ''} ${step.starter || ''}`);

// Limits, in words. Short text is a feature: one idea on screen at a time.
export const LIMITS = { title: 6, story: 40, say: 30, more: 70, hint: 35, question: 30, choice: 16, why: 30, prompt: 35, lines: 30 };
const words = (t) => String(t || '').replace(/\*\*/g, '').trim().split(/\s+/).filter(Boolean).length;

// Nothing in a lesson may point at a real place on the internet, or reach for the network.
const SAFE_HOST = /\.(example|test)$/i;
const SAFE_IP = /^(10\.|192\.168\.|192\.0\.2\.|198\.51\.100\.|203\.0\.113\.|127\.0\.0\.1$|0\.0\.0\.0$)/;
export function unsafeText(text) {
  const t = String(text || '');
  const bad = [];
  for (const m of t.matchAll(/https?:\/\/([a-z0-9.-]+)/gi)) if (!SAFE_HOST.test(m[1])) bad.push(`real web address ${m[0]}`);
  for (const m of t.matchAll(/[\w.+-]+@([a-z0-9-]+(?:\.[a-z0-9-]+)+)/gi)) if (!SAFE_HOST.test(m[1])) bad.push(`real-looking email ${m[0]}`);
  for (const m of t.matchAll(/\b[a-z0-9-]+\.(com|org|net|edu|gov|io|co|uk|ru|cn)\b/gi)) bad.push(`real-looking site name ${m[0]}`);
  for (const m of t.matchAll(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g)) if (!SAFE_IP.test(m[0])) bad.push(`an address outside the pretend ranges: ${m[0]}`);
  for (const m of t.matchAll(/\b(fetch|XMLHttpRequest|WebSocket|EventSource|importScripts|sendBeacon|eval|document\.|window\.|localStorage|require)\b\s*\(?/g)) {
    if (/\(|\.$/.test(m[0]) || /XMLHttpRequest|WebSocket|EventSource|localStorage/.test(m[0])) bad.push(`code that reaches outside the lesson: ${m[0].trim()}`);
  }
  return bad;
}

/**
 * Everything wrong with a lesson, as sentences. An empty list means it is ready.
 *   key: this lesson's entry in answers/ ({ quiz, code })
 *   run: (step, code) => { passed }   runs a code step, so the reference answer can be proven
 */
export function problems(lesson, key, run) {
  const out = [];
  const need = (ok, msg) => { if (!ok) out.push(`${lesson.id || '?'}: ${msg}`); };
  const max = (text, n, what) => need(words(text) <= n, `${what} is ${words(text)} words; the limit is ${n}`);
  need(/^g[678]-(0[1-9]|10)$/.test(lesson.id || ''), 'id must look like g6-01');
  need(lesson.title && words(lesson.title) <= LIMITS.title, 'needs a short title');
  need(lesson.question?.endsWith('?'), 'needs a question of the day ending in ?');
  need(/^I can /.test(lesson.goal || ''), 'goal must start with "I can "');
  need(Array.isArray(lesson.standards) && lesson.standards.length >= 1 && lesson.standards.length <= 3 && lesson.standards.every(standard), 'needs 1 to 3 real standards');
  need(Array.isArray(lesson.job) && lesson.job[0] && lesson.job[1], 'needs a security job and what it does');
  const m = lesson.mission || {};
  need(Array.isArray(m.story) && m.story.length >= 2 && m.story.length <= 3, 'mission needs 2 or 3 short paragraphs');
  (m.story || []).forEach((p, i) => max(p, LIMITS.story, `mission paragraph ${i + 1}`));
  need(Array.isArray(m.vocab) && m.vocab.length >= 2 && m.vocab.length <= 5 && m.vocab.every((v) => v[0] && v[1]), 'mission needs 2 to 5 vocabulary words');
  need(m.talk, 'mission needs a partner talk prompt');
  need(m.rule && /permission|allowed|ask|report|law|own/i.test(m.rule), 'mission needs a rule about permission, the law or reporting');
  const steps = lesson.steps || [];
  need(steps.length >= 3 && steps.length <= 5, 'needs 3 to 5 build steps');
  need(new Set(steps.map((s) => s.id)).size === steps.length && steps.every((s) => /^[a-e]$/.test(s.id)), 'step ids must be a to e, each used once');
  need(steps.some(isCode), 'needs at least one code step');
  for (const s of steps) {
    const at = `step ${s.id}`;
    need(s.say, `${at} needs an instruction`);
    max(s.say, LIMITS.say, `${at} instruction`);
    max(s.more, LIMITS.more, `${at} explanation`);
    if (isCode(s)) {
      need(s.hint, `${at} needs a hint`);
      max(s.hint, LIMITS.hint, `${at} hint`);
      need(typeof s.starter === 'string' && s.starter.trim(), `${at} needs starter code`);
      need(String(s.starter || '').split('\n').length <= LIMITS.lines, `${at} starter is longer than ${LIMITS.lines} lines`);
      need(Array.isArray(s.tests) && s.tests.length >= 1, `${at} needs at least one test`);
      const answer = key?.code?.[s.id];
      need(typeof answer === 'string' && answer.trim(), `${at} has no reference answer in answers/`);
      if (answer && run) {
        need(String(answer).split('\n').length <= LIMITS.lines, `${at} reference answer is longer than ${LIMITS.lines} lines`);
        const good = run(s, answer);
        need(good.passed, `${at} reference answer does not pass: ${good.error?.message || good.tests.filter((t) => !t.ok).map((t) => `${t.label} (got ${t.got})`).join('; ')}`);
        need(!run(s, s.starter).passed, `${at} starter already passes, so there is nothing to do`);
      }
    } else {
      const l = s.lab;
      need(['mcq', 'sort', 'order', 'match'].includes(l.type), `${at} has an unknown lab type`);
      if (l.type === 'mcq') need(l.choices?.length >= 2 && Number.isInteger(l.answer) && l.answer < l.choices.length && l.why, `${at} needs choices, an answer and a why`);
      if (l.type === 'sort') need(l.bins?.length >= 2 && l.items?.length >= 4 && l.items.every((it) => it[0] && Number.isInteger(it[1]) && it[1] < l.bins.length), `${at} needs bins and at least 4 items`);
      if (l.type === 'order') need(l.items?.length >= 3, `${at} needs at least 3 things to put in order`);
      if (l.type === 'match') need(l.pairs?.length >= 3 && l.pairs.every((p) => p[0] && p[1]), `${at} needs at least 3 pairs`);
    }
  }
  const quiz = lesson.quiz || [];
  need(quiz.length === 4 && quiz.every((x, i) => x.id === `q${i + 1}`), 'needs exactly 4 quick-check questions, q1 to q4');
  for (const x of quiz) {
    max(x.q, LIMITS.question, `${x.id} question`);
    need(x.choices?.length >= 3 && x.choices.length <= 4, `${x.id} needs 3 or 4 choices`);
    (x.choices || []).forEach((c) => max(c, LIMITS.choice, `${x.id} choice`));
    need('answer' in x === false, `${x.id} must not carry its answer: answers live in answers/`);
    const k = key?.quiz?.[x.id];
    need(Array.isArray(k) && Number.isInteger(k[0]) && k[0] >= 0 && k[0] < (x.choices?.length || 0) && k[1], `${x.id} has no answer and reason in answers/`);
    if (k) max(k[1], LIMITS.why, `${x.id} reason`);
  }
  const ship = lesson.ship || {};
  need(ship.prompt && ship.stretch, 'needs a reflection prompt and a stretch challenge');
  max(ship.prompt, LIMITS.prompt, 'reflection prompt');
  need(/___/.test(ship.frame || ''), 'needs a sentence starter with ___ blanks');
  need(typeof lesson.teacher?.note === 'string' && lesson.teacher.note, 'needs a teacher note');
  if (lesson.sensitive) need(/counsel|trusted adult|report|school policy|mandated/i.test(lesson.teacher?.note || ''), 'a sensitive lesson needs a teacher note on what to do if a student shares something');
  for (const bad of unsafeText(JSON.stringify([lesson, key]).replace(/\\n/g, '\n'))) out.push(`${lesson.id}: contains ${bad}`);
  return out;
}

/** Which standards a grade covers, and in which lessons. */
export function coverage(grade) {
  const rows = new Map();
  lessonsFor(grade).forEach((l, i) => l.standards.forEach((c) => rows.set(c, [...(rows.get(c) || []), i + 1])));
  return [...rows].sort(([a], [b]) => a.localeCompare(b)).map(([c, lessons]) => ({ ...standard(c), lessons }));
}
