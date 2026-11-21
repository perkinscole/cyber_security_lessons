// Cipher City (cybersecurity, grades 6 to 8) on the platform.
//
// The course is self-contained: its pages are in courses/cipher-city, its data is in the cc_*
// tables (server/sql/011_cipher_city.sql), and every request it answers is named cc*. It uses the
// platform's sign-in, classes and rosters as they are and changes none of them.
//
// The server is the authority. Lesson rules, quick-check answers and the code checks are read
// from the same files the pages use, and every code step is run again here in a sealed engine
// (./cipher-city-runner.ts). Nothing a browser reports about being right is believed.
import type { Query } from '../db.ts';
import { UserError, makeClassCode } from '../auth.ts';
import { classOut, ownedClass, ownedStudent, text, isId, type ClassRow, type Course, type Json, type StudentMe, type TeacherMe } from '../core.ts';
import { runSealed } from './cipher-city-runner.ts';
// @ts-expect-error The course is plain JavaScript without type declarations.
import * as curriculum from '../../../courses/cipher-city/js/curriculum/index.js';
// @ts-expect-error The course is plain JavaScript without type declarations.
import * as brain from '../../../courses/cipher-city/js/data/brain.js';
// @ts-expect-error The course is plain JavaScript without type declarations.
import * as rules from '../../../courses/cipher-city/js/game/rules.js';
// @ts-expect-error The course is plain JavaScript without type declarations.
import * as program from '../../../courses/cipher-city/js/engine/program.js';
// @ts-expect-error The course is plain JavaScript without type declarations.
import { KEYS } from '../../../courses/cipher-city/answers/index.js';

const ID = 'cipher-city';
const RUNS_A_MINUTE = 40;

type Step = { id: string; lab?: unknown };
type Lesson = { id: string; title: string; steps: Step[] };
type Work = Json;
type Works = Record<string, Work>;
type Settings = { grade: number; game_open: boolean; open_all: boolean; plan: { question: string; focus: string; minutes: number } };
type Ctx = { settings: Settings; lessons: Lesson[] };

const lessonsFor = curriculum.lessonsFor as (grade: number) => Lesson[];
const getLesson = curriculum.getLesson as (id: string) => Lesson | undefined;
const gradeOf = curriculum.gradeOf as (id: string) => number;
const isGrade = curriculum.isGrade as (g: unknown) => boolean;
const isCode = curriculum.isCode as (s: Step) => boolean;
const keys = KEYS as Record<string, Json>;

/** Read a class's Cipher City settings. Anything missing or odd falls back to the safe default. */
function settingsOf(raw: Json | null | undefined): Settings {
  const s = raw ?? {};
  const plan = (s.plan && typeof s.plan === 'object' ? s.plan : {}) as Json;
  return {
    grade: isGrade(s.grade) ? s.grade as number : 6,
    game_open: !!s.game_open, open_all: !!s.open_all,
    plan: { question: text(plan.question, 200), focus: text(plan.focus, 20), minutes: Math.max(1, Math.min(60, Math.round(Number(plan.minutes) || 10))) },
  };
}
const classView = (c: ClassRow, count?: number) => {
  const s = settingsOf(c.settings);
  const o = classOut(c);
  return { id: o.id, name: o.name, code: o.code, join_open: o.join_open, created_at: o.created_at, delete_on: o.delete_on, grade: s.grade, game_open: s.game_open, open_all: s.open_all, ...(count === undefined ? {} : { count }) };
};

/** The course's own rules raise Oops for things the person can fix. Pass those on as they are. */
async function guard<T>(work: () => Promise<T> | T): Promise<T> {
  try { return await work(); } catch (e) {
    if (e instanceof brain.Oops) throw new UserError((e as Error).message);
    throw e;
  }
}

async function ctxOf(me: StudentMe, q: Query): Promise<Ctx> {
  const [c] = await q<{ settings: Json }>('SELECT settings FROM classes WHERE id = $1', [me.student.class_id]);
  const settings = settingsOf(c?.settings);
  return { settings, lessons: lessonsFor(settings.grade) };
}
async function worksOf(q: Query, studentId: string): Promise<Works> {
  const rows = await q<{ lesson_id: string; data: Work }>('SELECT lesson_id, data FROM cc_work WHERE student_id = $1', [studentId]);
  return Object.fromEntries(rows.map((r) => [r.lesson_id, r.data]));
}
const awardsOf = (q: Query, studentId: string) => q<{ badge_id: string; note: string }>('SELECT badge_id, note FROM cc_award WHERE student_id = $1 ORDER BY at', [studentId]);

/** The lesson and saved work for a change, after checking this student may open it. Locks the row. */
async function open(me: StudentMe, q: Query, lessonId: unknown): Promise<{ ctx: Ctx; lesson: Lesson; work: Work | undefined }> {
  const ctx = await ctxOf(me, q);
  const lesson = typeof lessonId === 'string' ? getLesson(lessonId) : undefined;
  if (!lesson || gradeOf(lesson.id) !== ctx.settings.grade) throw new UserError('That lesson is not in your course.');
  const at = ctx.lessons.findIndex((l) => l.id === lesson.id);
  const before = at > 0 ? ctx.lessons[at - 1]! : null;
  const rows = await q<{ lesson_id: string; data: Work }>('SELECT lesson_id, data FROM cc_work WHERE student_id = $1 AND lesson_id = ANY($2) FOR UPDATE', [me.student.id, [lesson.id, before?.id ?? '']]);
  const works: Works = Object.fromEntries(rows.map((r) => [r.lesson_id, r.data]));
  if (!rules.isOpen(ctx.lessons, works, lesson.id, ctx.settings.open_all)) throw new UserError('Finish the lesson before this one first.');
  return { ctx, lesson, work: works[lesson.id] };
}
async function put(me: StudentMe, q: Query, lessonId: string, work: Work): Promise<Work> {
  await q(
    `INSERT INTO cc_work (school_id, student_id, lesson_id, data) VALUES ($1, $2, $3, $4)
     ON CONFLICT (student_id, lesson_id) DO UPDATE SET data = excluded.data, updated_at = now()`,
    [me.school_id, me.student.id, lessonId, JSON.stringify(work)]);
  return work;
}

/** One code run for this student. More than a class could need in a minute is refused. */
async function countRun(me: StudentMe, q: Query): Promise<void> {
  const [row] = await q<{ runs: number }>(
    `INSERT INTO cc_student (student_id, school_id, runs, runs_from) VALUES ($1, $2, 1, now())
     ON CONFLICT (student_id) DO UPDATE SET
       runs = CASE WHEN cc_student.runs_from < now() - interval '1 minute' THEN 1 ELSE cc_student.runs + 1 END,
       runs_from = CASE WHEN cc_student.runs_from < now() - interval '1 minute' THEN now() ELSE cc_student.runs_from END
     RETURNING runs`, [me.student.id, me.school_id]);
  if ((row?.runs ?? 0) > RUNS_A_MINUTE) throw new UserError('That is a lot of runs in one minute. Read your code through, then try again in a moment.');
}

const student: Course['student'] = {
  /** Who I am in this course: my class's grade and switches. */
  async ccMe(me, q) {
    const { settings } = await ctxOf(me, q);
    const s = me.student;
    return {
      student: { id: s.id, display_name: s.display_name, username: s.username, avatar: s.avatar ?? rules.defaultAvatar(s.display_name) },
      class: { id: me.class.id, name: me.class.name, grade: settings.grade, game_open: settings.game_open, open_all: settings.open_all },
    };
  },

  async ccHome(me, q) {
    const { lessons } = await ctxOf(me, q);
    const works = await worksOf(q, me.student.id);
    // The class city: how many classmates have finished each lesson. Counts only, never names.
    const mates = await q<{ student_id: string; lesson_id: string; data: Work }>(
      'SELECT w.student_id, w.lesson_id, w.data FROM cc_work w JOIN students s ON s.id = w.student_id WHERE s.class_id = $1', [me.student.class_id]);
    const byStudent = new Map<string, Works>();
    for (const r of mates) byStudent.set(r.student_id, { ...(byStudent.get(r.student_id) ?? {}), [r.lesson_id]: r.data });
    const [{ n }] = await q<{ n: number }>('SELECT count(*)::int AS n FROM students WHERE class_id = $1', [me.student.class_id]) as [{ n: number }];
    const reviews = await q<{ lesson_id: string; feedback: string }>('SELECT lesson_id, feedback FROM cc_review WHERE student_id = $1', [me.student.id]);
    const [mine] = await q<{ play_used: number }>('SELECT play_used FROM cc_student WHERE student_id = $1', [me.student.id]);
    const [help] = await q<Json>('SELECT id, lesson_id, step_id, note, at FROM cc_help WHERE student_id = $1', [me.student.id]);
    return {
      works, awards: await awardsOf(q, me.student.id),
      // A student sees the teacher's written feedback. Rubric scores stay with the teacher.
      reviews: Object.fromEntries(reviews.map((r) => [r.lesson_id, { feedback: r.feedback, scores: {} }])),
      play_used: mine?.play_used ?? 0,
      city: { counts: brain.cityCounts(lessons, [...byStudent.values()]), size: n },
      help: help ?? null,
    };
  },

  ccMission: (me, q, lessonId: unknown, talk: unknown) => guard(async () => {
    const { lesson, work } = await open(me, q, lessonId);
    return put(me, q, lesson.id, brain.applyMission(lesson, work, talk));
  }),

  ccDraft: (me, q, lessonId: unknown, stepId: unknown, code: unknown) => guard(async () => {
    const { lesson, work } = await open(me, q, lessonId);
    await put(me, q, lesson.id, brain.applyDraft(lesson, work, stepId, code));
    return true;
  }),

  /** Check a step. A code step is run again here; a lab's answer is checked here. */
  ccStep: (me, q, lessonId: unknown, stepId: unknown, answer: unknown) => guard(async () => {
    const { lesson, work } = await open(me, q, lessonId);
    const step = lesson.steps.find((s) => s.id === stepId);
    if (!step) throw new UserError('That step was not found.');
    let verdict: { passed: boolean; tests: { label: string; ok: boolean; got: string }[] } | null = null;
    if (isCode(step)) {
      const code = typeof answer === 'string' ? answer : '';
      if (code.length > program.MAX_CODE) throw new UserError('That is too much code for one step.');
      await countRun(me, q);
      verdict = program.judge(step, code, program.parseReport(await runSealed(program.buildProgram(step, code))));
    }
    const out = brain.applyStep(lesson, work, stepId, answer, verdict?.passed) as { work: Work; ok: boolean };
    await put(me, q, lesson.id, out.work);
    return { ok: out.ok, work: out.work, tests: verdict?.tests ?? null };
  }),

  /** One quick-check answer. The right answers never leave the server; only "right or not" and the reason do. */
  ccQuiz: (me, q, lessonId: unknown, qid: unknown, choice: unknown) => guard(async () => {
    const { lesson, work } = await open(me, q, lessonId);
    const out = brain.applyQuiz(lesson, keys[lesson.id], work, qid, choice) as { work: Work; right: boolean; why: string };
    await put(me, q, lesson.id, out.work);
    return out;
  }),

  ccShip: (me, q, lessonId: unknown, words: unknown, stretch: unknown) => guard(async () => {
    const { lesson, work } = await open(me, q, lessonId);
    return put(me, q, lesson.id, brain.applyShip(lesson, work, words, stretch));
  }),

  ccRate: (me, q, lessonId: unknown, stars: unknown) => guard(async () => {
    const { lesson, work } = await open(me, q, lessonId);
    return put(me, q, lesson.id, brain.applyRate(lesson, work, stars));
  }),

  ccConfusing: (me, q, lessonId: unknown, id: unknown, on: unknown) => guard(async () => {
    const { lesson, work } = await open(me, q, lessonId);
    return put(me, q, lesson.id, brain.applyConfusing(lesson, work, id, !!on));
  }),

  async ccAskHelp(me, q, lessonId: unknown, stepId: unknown, note: unknown) {
    const { lesson } = await open(me, q, lessonId);
    // The teacher's pretend student is in no class a teacher watches, so it has nobody to ask.
    const [c] = await q<{ is_preview: boolean }>('SELECT is_preview FROM classes WHERE id = $1', [me.student.class_id]);
    if (c?.is_preview) return null;
    const [row] = await q<Json>(
      `INSERT INTO cc_help (school_id, student_id, class_id, lesson_id, step_id, note) VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (student_id) DO UPDATE SET lesson_id = excluded.lesson_id, step_id = excluded.step_id, note = excluded.note, at = now()
       RETURNING id, lesson_id, step_id, note, at`,
      [me.school_id, me.student.id, me.student.class_id, lesson.id, text(stepId, 10), text(note, 300).trim()]);
    return row;
  },

  async ccCancelHelp(me, q) {
    await q('DELETE FROM cc_help WHERE student_id = $1', [me.student.id]);
    return true;
  },

  /** Choose operator parts. Only parts the student's level has unlocked are kept. */
  async ccAvatar(me, q, avatar: unknown) {
    const { lessons } = await ctxOf(me, q);
    const stats = rules.statsFor(lessons, await worksOf(q, me.student.id), await awardsOf(q, me.student.id)) as { level: number };
    const clean = rules.cleanAvatar(avatar, stats.level) as Json;
    await q('UPDATE students SET avatar = $2 WHERE id = $1', [me.student.id, JSON.stringify(clean)]);
    return clean;
  },

  /** Spend reward-game time. It can only be spent while the teacher has the game open, and never past what was earned. */
  async ccPlay(me, q, seconds: unknown) {
    const { settings, lessons } = await ctxOf(me, q);
    if (!settings.game_open) throw new UserError('Your teacher has closed the game for now.');
    const stats = rules.statsFor(lessons, await worksOf(q, me.student.id), await awardsOf(q, me.student.id)) as { playMinutes: number };
    const earned = stats.playMinutes * 60;
    const spend = Math.max(0, Math.min(60, Math.round(Number(seconds) || 0)));
    const [row] = await q<{ play_used: number }>(
      `INSERT INTO cc_student (student_id, school_id, play_used) VALUES ($1, $2, least($3::int, $4::int))
       ON CONFLICT (student_id) DO UPDATE SET play_used = least(cc_student.play_used + $3::int, $4::int) RETURNING play_used`,
      [me.student.id, me.school_id, spend, earned]);
    return { used: row!.play_used, earned };
  },
};

// Teacher ------------------------------------------------------------------------------------------

type Roster = { id: string; display_name: string; username: string; avatar: unknown; works: Works; awards: { badge_id: string; note: string }[] };
/** Every student of a class with their work. */
async function rosterWith(q: Query, classId: string): Promise<Roster[]> {
  const students = await q<{ id: string; display_name: string; username: string; avatar: unknown }>('SELECT id, display_name, username, avatar FROM students WHERE class_id = $1 ORDER BY lower(display_name)', [classId]);
  const ids = students.map((s) => s.id);
  const works = await q<{ student_id: string; lesson_id: string; data: Work }>('SELECT student_id, lesson_id, data FROM cc_work WHERE student_id = ANY($1)', [ids]);
  const awards = await q<{ student_id: string; badge_id: string; note: string }>('SELECT student_id, badge_id, note FROM cc_award WHERE student_id = ANY($1)', [ids]);
  return students.map((s) => ({
    ...s,
    works: Object.fromEntries(works.filter((w) => w.student_id === s.id).map((w) => [w.lesson_id, w.data])),
    awards: awards.filter((a) => a.student_id === s.id).map((a) => ({ badge_id: a.badge_id, note: a.note })),
  }));
}
const cityOf = (lessons: Lesson[], list: Roster[]) => ({ counts: brain.cityCounts(lessons, list.map((s) => s.works)) as Record<string, number>, size: list.length });
const saveSettings = (q: Query, classId: string, s: Settings) => q('UPDATE classes SET settings = settings || $2::jsonb WHERE id = $1', [classId, JSON.stringify(s)]);

const teacher: Course['teacher'] = {
  async ccClasses(me, q) {
    const rows = await q<ClassRow & { count: number }>(
      `SELECT c.*, (SELECT count(*)::int FROM students s WHERE s.class_id = c.id) AS count
         FROM classes c WHERE c.teacher_id = $1 AND c.course = $2 AND NOT c.is_preview ORDER BY c.created_at`, [me.teacher.id, ID]);
    return rows.map((c) => classView(c, c.count));
  },

  /** A class is for one grade, chosen when it is made. */
  async ccCreateClass(me, q, name: unknown, grade: unknown) {
    const n = text(name, 80).trim();
    if (!n) throw new UserError('Give the class a name.');
    if (!isGrade(grade)) throw new UserError('Choose grade 6, 7 or 8.');
    const settings = settingsOf({ grade: grade as number });
    for (let tries = 0; ; tries++) {
      const [c] = await q<ClassRow>(
        'INSERT INTO classes (school_id, teacher_id, course, name, code, settings) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (code) DO NOTHING RETURNING *',
        [me.school_id, me.teacher.id, ID, n, makeClassCode(), JSON.stringify(settings)]);
      if (c) return classView(c, 0);
      if (tries >= 5) throw new Error('Could not make a class code.');
    }
  },

  async ccSetClass(me, q, classId: unknown, patch: unknown) {
    const c = await ownedClass(q, me, classId);
    const p = (patch && typeof patch === 'object' ? patch : {}) as Json;
    const s = settingsOf(c.settings);
    if ('game_open' in p) s.game_open = !!p.game_open;
    if ('open_all' in p) s.open_all = !!p.open_all;
    await saveSettings(q, c.id, s);
    if ('join_open' in p) await q('UPDATE classes SET join_open = $2 WHERE id = $1', [c.id, !!p.join_open]);
    const [now] = await q<ClassRow>('SELECT * FROM classes WHERE id = $1', [c.id]);
    return classView(now!);
  },

  /** The progress grid. */
  async ccBoard(me, q, classId: unknown) {
    const c = await ownedClass(q, me, classId);
    const lessons = lessonsFor(settingsOf(c.settings).grade);
    const list = await rosterWith(q, c.id);
    return {
      class: classView(c, list.length),
      students: list.map((s) => {
        const st = rules.statsFor(lessons, s.works, s.awards) as { xp: number; level: number; done: number; badges: string[] };
        return { id: s.id, display_name: s.display_name, avatar: s.avatar ?? rules.defaultAvatar(s.display_name), row: brain.boardRow(lessons, s.works), xp: st.xp, level: st.level, done: st.done, badges: st.badges };
      }),
      city: cityOf(lessons, list),
    };
  },

  async ccStudentWork(me, q, studentId: unknown) {
    const s = await ownedStudent(q, me, studentId);
    const [c] = await q<{ settings: Json }>('SELECT settings FROM classes WHERE id = $1', [s.class_id]);
    const reviews = await q<{ lesson_id: string; scores: Json; feedback: string; at: Date }>('SELECT lesson_id, scores, feedback, at FROM cc_review WHERE student_id = $1', [s.id]);
    return {
      student: { id: s.id, display_name: s.display_name, username: s.username, avatar: s.avatar ?? rules.defaultAvatar(s.display_name), grade: settingsOf(c?.settings).grade },
      works: await worksOf(q, s.id), awards: await awardsOf(q, s.id),
      reviews: Object.fromEntries(reviews.map((r) => [r.lesson_id, { scores: r.scores, feedback: r.feedback, at: r.at }])),
    };
  },

  /** Rubric scores and written feedback. These never change a student's XP. */
  async ccReview(me, q, studentId: unknown, lessonId: unknown, scores: unknown, feedback: unknown) {
    const s = await ownedStudent(q, me, studentId);
    const [w] = await q('SELECT 1 FROM cc_work WHERE student_id = $1 AND lesson_id = $2', [s.id, text(lessonId, 10)]);
    if (!w) throw new UserError('There is no work to review yet.');
    const given = (scores && typeof scores === 'object' ? scores : {}) as Json;
    const clean: Record<string, number> = {};
    for (const k of ['code', 'thinking', 'writing']) if ([0, 1, 2, 3].includes(given[k] as number)) clean[k] = given[k] as number;
    const [row] = await q<Json>(
      `INSERT INTO cc_review (school_id, student_id, lesson_id, scores, feedback) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (student_id, lesson_id) DO UPDATE SET scores = excluded.scores, feedback = excluded.feedback, at = now()
       RETURNING scores, feedback, at`, [me.school_id, s.id, text(lessonId, 10), JSON.stringify(clean), text(feedback, 1000)]);
    return row;
  },

  async ccAward(me, q, studentId: unknown, badgeId: unknown, on: unknown, note: unknown) {
    const s = await ownedStudent(q, me, studentId);
    if (!(rules.TEACHER_BADGES as { id: string }[]).some((b) => b.id === badgeId)) throw new UserError('That badge was not found.');
    await q('DELETE FROM cc_award WHERE student_id = $1 AND badge_id = $2', [s.id, badgeId]);
    if (on) await q('INSERT INTO cc_award (school_id, student_id, badge_id, note) VALUES ($1, $2, $3, $4)', [me.school_id, s.id, badgeId, text(note, 200)]);
    return awardsOf(q, s.id);
  },

  async ccHelpQueue(me, q, classId: unknown) {
    const c = await ownedClass(q, me, classId);
    return q<Json>('SELECT h.id, h.student_id, h.lesson_id, h.step_id, h.note, h.at, s.display_name AS name FROM cc_help h JOIN students s ON s.id = h.student_id WHERE h.class_id = $1 ORDER BY h.at', [c.id]);
  },

  async ccHelpDone(me, q, id: unknown) {
    const [h] = isId(id) ? await q<{ class_id: string }>('SELECT class_id FROM cc_help WHERE id = $1', [id]) : [];
    if (!h) return true;
    await ownedClass(q, me, h.class_id);
    await q('DELETE FROM cc_help WHERE id = $1', [id]);
    return true;
  },

  /** What the class found hard. Counts only: no student is named. */
  async ccFeedback(me, q, classId: unknown) {
    const c = await ownedClass(q, me, classId);
    const list = await rosterWith(q, c.id);
    const help = await q<{ lesson_id: string }>('SELECT lesson_id FROM cc_help WHERE class_id = $1', [c.id]);
    return brain.feedbackReport(lessonsFor(settingsOf(c.settings).grade), list.map((s) => s.works), help);
  },

  /** The screen to project: question, timer length, recent wins and the class city. No scores. */
  async ccScreen(me, q, classId: unknown) {
    const c = await ownedClass(q, me, classId);
    const s = settingsOf(c.settings);
    const lessons = lessonsFor(s.grade);
    const list = await rosterWith(q, c.id);
    return { class: { id: c.id, name: c.name, grade: s.grade }, plan: s.plan, wins: brain.wins(lessons, list), city: cityOf(lessons, list) };
  },

  async ccSetPlan(me, q, classId: unknown, plan: unknown) {
    const c = await ownedClass(q, me, classId);
    const s = settingsOf({ ...c.settings, plan: plan as Json });
    await saveSettings(q, c.id, s);
    return s.plan;
  },

  /** Quick-check answers and reference code, for the teacher's lesson plans. */
  async ccAnswerKey(_me, _q, grade: unknown) {
    if (!isGrade(Number(grade))) throw new UserError('Choose grade 6, 7 or 8.');
    return Object.fromEntries(lessonsFor(Number(grade)).map((l) => [l.id, keys[l.id]]));
  },

  /** Everything held about a class's students, for the teacher, district or a parent's request. */
  async ccExportClass(me, q, classId: unknown) {
    const c = await ownedClass(q, me, classId);
    const list = await rosterWith(q, c.id);
    const reviews = await q<{ student_id: string; lesson_id: string; scores: Json; feedback: string; at: Date }>('SELECT student_id, lesson_id, scores, feedback, at FROM cc_review WHERE student_id = ANY($1)', [list.map((s) => s.id)]);
    const help = await q<{ student_id: string; lesson_id: string; step_id: string; note: string; at: Date }>('SELECT student_id, lesson_id, step_id, note, at FROM cc_help WHERE class_id = $1', [c.id]);
    const counters = await q<{ student_id: string; play_used: number }>('SELECT student_id, play_used FROM cc_student WHERE student_id = ANY($1)', [list.map((s) => s.id)]);
    return {
      exported_at: new Date().toISOString(),
      class: { name: c.name, code: c.code, grade: settingsOf(c.settings).grade, created_at: c.created_at },
      students: list.map((s) => ({
        display_name: s.display_name, username: s.username, avatar: s.avatar, works: s.works, awards: s.awards,
        reviews: reviews.filter((r) => r.student_id === s.id).map(({ student_id: _, ...r }) => r),
        help_requests: help.filter((h) => h.student_id === s.id).map(({ student_id: _, ...h }) => h),
        play_seconds_used: counters.find((k) => k.student_id === s.id)?.play_used ?? 0,
      })),
    };
  },

  /** Choose the grade for student view. The pretend student's class is made by the platform on first use. */
  async ccPreviewGrade(me, q, grade: unknown) {
    if (!isGrade(Number(grade))) throw new UserError('Choose grade 6, 7 or 8.');
    const settings = { ...cipherCity.previewSettings, grade: Number(grade) };
    const [c] = await q<{ id: string }>('SELECT id FROM classes WHERE teacher_id = $1 AND course = $2 AND is_preview', [me.teacher.id, ID]);
    if (c) await q('UPDATE classes SET settings = $2 WHERE id = $1', [c.id, JSON.stringify(settings)]);
    else {
      for (let tries = 0; tries < 6; tries++) {
        const made = await q(`INSERT INTO classes (school_id, teacher_id, course, name, code, join_open, is_preview, settings) VALUES ($1, $2, $3, 'Student view', $4, false, true, $5) ON CONFLICT DO NOTHING RETURNING id`,
          [me.school_id, me.teacher.id, ID, makeClassCode(), JSON.stringify(settings)]);
        if (made.length) break;
      }
    }
    return true;
  },
};

export const cipherCity: Course = {
  id: ID,
  previewSettings: { grade: 6, open_all: true, game_open: true },
  teacher,
  student,
  anyone: {},
  studentRoute: (method) => (Object.hasOwn(student, method) ? student[method]! : null),
  other: () => null,
};

export type { TeacherMe };
