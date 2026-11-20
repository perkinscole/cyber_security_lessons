// The rules for saving a student's work. No storage and no page code here: the browser-only
// store and the server both call these, so a lesson behaves the same in a demo and in a real class.
import { isCode } from '../curriculum/index.js';
import { checkLab } from '../engine/logic.js';
import { MAX_CODE } from '../engine/program.js';
import { stepsDone, quizPassed, quizRight, shipped, isDone, lessonXp, MIN_SHIP } from '../game/rules.js';

/** A problem the person can fix. Its message is written for them. */
export class Oops extends Error {}

const clip = (v, n) => String(v ?? '').slice(0, n);
export const newWork = () => ({ mission: false, talk: '', steps: {}, quiz: { first: {}, firstOk: {}, right: {}, tries: 0 }, ship: null, rating: 0, confusing: [] });
const copy = (p) => JSON.parse(JSON.stringify(p || newWork()));
const stepOf = (lesson, id) => {
  const s = lesson.steps.find((x) => x.id === id);
  if (!s) throw new Oops('That step was not found.');
  return s;
};

export function applyMission(lesson, p, talk) {
  const n = copy(p);
  n.mission = true;
  n.talk = clip(talk, 500).trim();
  return n;
}

/** Keep code a student is still working on, without checking it. */
export function applyDraft(lesson, p, stepId, code) {
  const s = stepOf(lesson, stepId);
  if (!isCode(s)) throw new Oops('That step has no code.');
  const n = copy(p);
  n.steps[stepId] = { ...(n.steps[stepId] || { done: false, tries: 0 }), code: clip(code, MAX_CODE) };
  return n;
}

/**
 * Record a checked try at a step.
 *   code step: answer is the code; `passed` comes from running it in a sandbox the caller trusts.
 *   lab step:  answer is what the student chose; it is checked here.
 */
export function applyStep(lesson, p, stepId, answer, passed) {
  const s = stepOf(lesson, stepId);
  if (!p?.mission) throw new Oops('Read the mission first.');
  const n = copy(p);
  const rec = n.steps[stepId] || { done: false, tries: 0 };
  const ok = isCode(s) ? !!passed : checkLab(s.lab, answer);
  if (!rec.done) rec.tries = (rec.tries || 0) + 1;
  if (isCode(s)) rec.code = clip(answer, MAX_CODE);
  if (ok) rec.done = true;
  n.steps[stepId] = rec;
  return { work: n, ok };
}

/** One quick-check answer. Returns whether it was right, and why. The first choice is kept for the teacher. */
export function applyQuiz(lesson, key, p, qid, choice) {
  const x = lesson.quiz.find((y) => y.id === qid);
  if (!x) throw new Oops('That question was not found.');
  if (stepsDone(lesson, p) < lesson.steps.length) throw new Oops('Finish the build steps first.');
  if (!Number.isInteger(choice) || choice < 0 || choice >= x.choices.length) throw new Oops('Pick one of the answers.');
  const n = copy(p);
  const [answer, why] = key.quiz[qid];
  const right = choice === answer;
  if (!(qid in n.quiz.first)) { n.quiz.first[qid] = choice; n.quiz.firstOk[qid] = right; }
  if (right) n.quiz.right[qid] = true;
  n.quiz.tries++;
  return { work: n, right, why: right ? why : '' };
}

export function applyShip(lesson, p, text, stretch) {
  if (!quizPassed(lesson, p)) throw new Oops('Pass the quick check first.');
  const t = clip(text, 2000).trim();
  if (t.length < MIN_SHIP) throw new Oops('Write a little more first: at least one full sentence.');
  const n = copy(p);
  n.ship = { text: t, stretch: !!stretch, at: n.ship?.at || new Date().toISOString() };
  return n;
}

export function applyRate(lesson, p, stars) {
  if (!isDone(lesson, p)) throw new Oops('Finish the lesson first.');
  if (![1, 2, 3, 4, 5].includes(stars)) throw new Oops('Pick 1 to 5 stars.');
  const n = copy(p);
  n.rating = stars;
  return n;
}

/** A student marks a step or question as confusing, or clears the mark. */
export function applyConfusing(lesson, p, id, on) {
  if (!lesson.steps.some((s) => s.id === id) && !lesson.quiz.some((x) => x.id === id) && id !== 'mission') throw new Oops('That step was not found.');
  const n = copy(p);
  const set = new Set(n.confusing);
  if (on) set.add(id); else set.delete(id);
  n.confusing = [...set];
  return n;
}

/** One line of the teacher's progress grid. */
export function boardRow(lessons, works) {
  return lessons.map((l) => {
    const p = works[l.id];
    return { id: l.id, state: isDone(l, p) ? 'done' : p?.mission ? 'started' : 'new', steps: stepsDone(l, p), quiz: quizRight(l, p), shipped: shipped(p), xp: lessonXp(l, p) };
  });
}

/**
 * The class feedback report. No names: only counts.
 *   all: [{ lessonId: work }] one entry per student   help: [{ lesson_id, step_id }]
 */
export function feedbackReport(lessons, all, help = []) {
  return lessons.map((l) => {
    const works = all.map((w) => w[l.id]).filter(Boolean);
    const ratings = works.map((w) => w.rating).filter(Boolean);
    const count = (id) => works.filter((w) => w.confusing?.includes(id)).length;
    return {
      id: l.id, title: l.title, started: works.filter((w) => w.mission).length, finished: works.filter((w) => isDone(l, w)).length,
      rating: ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null, ratings: ratings.length,
      confusing: [['mission', 'Mission'], ...l.steps.map((s) => [s.id, `Step ${s.id}`]), ...l.quiz.map((x) => [x.id, `Question ${x.id.slice(1)}`])].map(([id, label]) => ({ id, label, n: count(id) })).filter((c) => c.n),
      missed: l.quiz.map((x) => ({ id: x.id, q: x.q, n: works.filter((w) => w.quiz?.first && x.id in w.quiz.first && !w.quiz.firstOk?.[x.id]).length, of: works.filter((w) => w.quiz?.first && x.id in w.quiz.first).length })).filter((m) => m.n),
      tries: l.steps.filter(isCode).map((s) => { const t = works.map((w) => w.steps?.[s.id]).filter((r) => r?.done).map((r) => r.tries || 1); return { id: s.id, avg: t.length ? Math.round((t.reduce((a, b) => a + b, 0) / t.length) * 10) / 10 : null }; }).filter((t) => t.avg && t.avg >= 3),
      help: help.filter((h) => h.lesson_id === l.id).length,
    };
  });
}

/** Recent good news for the class screen. First names only would still be names, so: what happened, not a score. */
export function wins(lessons, students) {
  const out = [];
  for (const st of students) {
    for (const l of lessons) {
      const p = st.works[l.id];
      if (isDone(l, p)) out.push({ name: st.display_name, text: `finished ${l.title}`, at: p.ship.at });
    }
  }
  return out.sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 8);
}

/** How many of the class have lit each building. Counts only. */
export const cityCounts = (lessons, all) => Object.fromEntries(lessons.map((l) => [l.id, all.filter((w) => isDone(l, w[l.id])).length]));
