// Practice and demo mode: everything is kept in this browser and nothing is sent anywhere.
// It answers the same calls as the hosted store (hosted.js), using the same rules (brain.js).
import { lessonsFor, getLesson, gradeOf, isGrade, isCode } from '../curriculum/index.js';
import { Oops, newWork, applyMission, applyDraft, applyStep, applyQuiz, applyShip, applyRate, applyConfusing, boardRow, feedbackReport, wins, cityCounts } from './brain.js';
import { statsFor, isOpen, cleanAvatar, defaultAvatar, TEACHER_BADGES } from '../game/rules.js';

const KEY = 'cipher-city:v1';
const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();
const NAMES = ['Nova R', 'Kai T', 'Juno P', 'Rio M', 'Sage W', 'Zed B', 'Lux A', 'Pax D'];
const SHIPS = ['I learned that a longer secret takes much longer to guess. Next time I will use four random words.', 'The main idea is to slow the guesser down. For example, a lock-out after three tries.', 'I would tell my family to stop and check the sender before they click anything.'];

/** A made-up student who has finished the first `n` lessons. */
function madeUp(cls, name, n, i) {
  const works = {};
  lessonsFor(cls.grade).slice(0, n + 1).forEach((l, at) => {
    const w = newWork();
    w.mission = true; w.talk = 'We think it depends on how many choices there are.';
    const all = at < n;
    l.steps.forEach((s, k) => { if (all || k < 2) w.steps[s.id] = { done: true, tries: 1 + ((i + k + at) % 3), ...(isCode(s) ? { code: s.starter } : {}) }; });
    if (all) {
      l.quiz.forEach((x, k) => { const ok = (i + k + at) % 4 !== 0; w.quiz.first[x.id] = 0; w.quiz.firstOk[x.id] = ok; w.quiz.right[x.id] = true; });
      w.quiz.tries = 5;
      w.ship = { text: SHIPS[(i + at) % SHIPS.length], stretch: (i + at) % 3 === 0, at: new Date(Date.now() - (n - at) * 3600e3 - i * 60e3).toISOString() };
      w.rating = 3 + ((i + at) % 3);
      if ((i + at) % 5 === 0) w.confusing = [l.steps[1].id];
    }
    works[l.id] = w;
  });
  return { id: uid(), class_id: cls.id, display_name: name, username: name.toLowerCase().replace(/[^a-z0-9]/g, ''), avatar: defaultAvatar(name), works, awards: i === 0 ? [{ badge_id: 'crew-mate', note: 'Helped Kai find a missing bracket.' }] : [], reviews: {}, play_used: 0, made_up: true };
}

function seed() {
  const classes = [6, 7, 8].map((g) => ({ id: uid(), name: `Sample class, grade ${g}`, code: `DEMO${g}`, grade: g, join_open: true, game_open: true, open_all: false, plan: { question: '', focus: '', minutes: 10 }, created_at: now() }));
  const students = classes.flatMap((c) => NAMES.slice(0, 6).map((n, i) => madeUp(c, n, [4, 3, 2, 2, 1, 0][i], i)));
  const first = students.find((s) => s.class_id === classes[0].id && s.display_name === 'Rio M');
  const help = first ? [{ id: uid(), student_id: first.id, class_id: first.class_id, lesson_id: 'g6-03', step_id: 'b', note: 'My loop never stops.', at: now() }] : [];
  return { classes, students, help, bugs: [], me: null, preview: null };
}

export function createLocalStore({ storage = globalThis.localStorage, runner, loadKeys } = {}) {
  let db;
  const load = () => { if (!db) { try { db = JSON.parse(storage.getItem(KEY) || 'null'); } catch (_) { db = null; } if (!db?.classes) db = seed(); } return db; };
  const save = () => { try { storage.setItem(KEY, JSON.stringify(db)); } catch (_) { throw new Oops('This browser would not save. Check that it is not in private mode.'); } };
  let keys;
  const keyFor = async (lessonId) => { if (keys === undefined) { try { keys = await loadKeys(); } catch (_) { keys = null; } } return keys ? keys[lessonId] : null; };

  const classOf = (id) => { const c = load().classes.find((x) => x.id === id); if (!c) throw new Oops('That class was not found.'); return c; };
  const studentOf = (id) => { const s = load().students.find((x) => x.id === id); if (!s) throw new Oops('That student was not found.'); return s; };
  const teacher = () => { if (load().me?.role !== 'teacher') throw new Oops('SIGNED_OUT'); };
  /** The student acting now: the signed-in one, or the teacher's pretend student. */
  const me = () => {
    const d = load();
    if (d.me?.role === 'teacher' && d.preview) return d.preview;
    if (d.me?.role !== 'student') throw new Oops('SIGNED_OUT');
    return studentOf(d.me.id);
  };
  const myClass = (s) => (s.preview ? { id: 'preview', name: 'Student view', grade: s.grade, game_open: true, open_all: true } : classOf(s.class_id));
  const mates = (c) => load().students.filter((s) => s.class_id === c.id);
  const sessionOut = () => {
    const d = load();
    if (!d.me) return null;
    if (d.me.role === 'teacher' && !d.preview) return { role: 'teacher', teacher: { display_name: 'Practice teacher', email: '' } };
    const s = me(), c = myClass(s);
    return { role: 'student', preview: !!s.preview, student: { id: s.id, display_name: s.display_name, username: s.username, avatar: s.avatar }, class: { id: c.id, name: c.name, grade: c.grade, game_open: !!c.game_open, open_all: !!c.open_all } };
  };
  /** The lesson and saved work for a change, after checking the student may open it. */
  const open = (lessonId) => {
    const s = me(), c = myClass(s), lesson = getLesson(lessonId);
    if (!lesson || gradeOf(lessonId) !== c.grade) throw new Oops('That lesson is not in your course.');
    if (!isOpen(lessonsFor(c.grade), s.works, lessonId, c.open_all)) throw new Oops('Finish the lesson before this one first.');
    return { s, lesson, work: s.works[lessonId] };
  };
  const put = (s, lessonId, work) => { s.works[lessonId] = work; save(); return work; };
  const addNames = (c, names) => {
    const made = [];
    for (const raw of (Array.isArray(names) ? names : []).slice(0, 60)) {
      const name = String(raw || '').replace(/\s+/g, ' ').trim().slice(0, 30);
      if (!name) continue;
      const base = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || 'student';
      let username = base;
      for (let n = 2; mates(c).some((x) => x.username === username); n++) username = base + n;
      const st = { id: uid(), class_id: c.id, display_name: name, username, avatar: defaultAvatar(name), works: {}, awards: [], reviews: {}, play_used: 0 };
      db.students.push(st);
      made.push({ id: st.id, display_name: name, username, passcode: 'practice' });
    }
    save();
    return made;
  };

  const api = {
    mode: 'local',
    session: async () => sessionOut(),
    async signOut() { load().me = null; db.preview = null; save(); return true; },
    // Practice mode has no passwords: nothing here is private, and nothing leaves the browser.
    async teacherSignIn() { load().me = { role: 'teacher' }; db.preview = null; save(); return sessionOut(); },
    teacherSignUp: () => api.teacherSignIn(),
    async studentJoin(code, name) {
      const c = load().classes.find((x) => x.code === String(code || '').trim().toUpperCase());
      if (!c) throw new Oops('That class code was not found. Try DEMO6, DEMO7 or DEMO8.');
      const clean = String(name || '').replace(/\s+/g, ' ').trim();
      if (!clean) throw new Oops('Enter the name your class will see.');
      const old = mates(c).find((s) => s.display_name.toLowerCase() === clean.toLowerCase() && !s.made_up);
      const made = old ? { id: old.id, username: old.username, passcode: 'practice' } : addNames(c, [clean])[0];
      db.me = { role: 'student', id: made.id }; save();
      return { session: sessionOut(), username: made.username, passcode: made.passcode };
    },
    async studentSignIn(code, username) {
      const c = load().classes.find((x) => x.code === String(code || '').trim().toUpperCase());
      const s = c && mates(c).find((x) => x.username === String(username || '').trim().toLowerCase());
      if (!s) throw new Oops('Check your class code and username.');
      db.me = { role: 'student', id: s.id }; save();
      return sessionOut();
    },

    // Student --------------------------------------------------------------------------------
    async home() {
      const s = me(), c = myClass(s), lessons = lessonsFor(c.grade);
      const all = s.preview ? [s.works] : mates(c).map((x) => x.works);
      return { works: s.works, awards: s.awards, reviews: s.reviews, play_used: s.play_used || 0, city: { counts: cityCounts(lessons, all), size: all.length }, help: load().help.find((h) => h.student_id === s.id) || null };
    },
    async saveMission(lessonId, talk) { const { s, lesson, work } = open(lessonId); return put(s, lessonId, applyMission(lesson, work, talk)); },
    async saveDraft(lessonId, stepId, code) { const { s, lesson, work } = open(lessonId); put(s, lessonId, applyDraft(lesson, work, stepId, code)); return true; },
    async checkStep(lessonId, stepId, answer) {
      const { s, lesson, work } = open(lessonId);
      const step = lesson.steps.find((x) => x.id === stepId);
      const result = step && isCode(step) ? await runner(step, String(answer ?? '')) : null;
      const out = applyStep(lesson, work, stepId, answer, result?.passed);
      put(s, lessonId, out.work);
      return { ok: out.ok, work: out.work, result };
    },
    async answerQuiz(lessonId, qid, choice) {
      const { s, lesson, work } = open(lessonId);
      const key = await keyFor(lessonId);
      // Where the answers are not on this device (the demo on the hosted site), every answer is accepted and none is marked.
      const out = applyQuiz(lesson, key || { quiz: Object.fromEntries(lesson.quiz.map((x) => [x.id, [choice, 'The demo does not mark quick checks. A real class does.']])) }, work, qid, choice);
      put(s, lessonId, out.work);
      return out;
    },
    async ship(lessonId, text, stretch) { const { s, lesson, work } = open(lessonId); return put(s, lessonId, applyShip(lesson, work, text, stretch)); },
    async rate(lessonId, stars) { const { s, lesson, work } = open(lessonId); return put(s, lessonId, applyRate(lesson, work, stars)); },
    async confusing(lessonId, id, on) { const { s, lesson, work } = open(lessonId); return put(s, lessonId, applyConfusing(lesson, work, id, on)); },
    async askHelp(lessonId, stepId, note) {
      const { s } = open(lessonId);
      if (s.preview) return null;
      db.help = db.help.filter((h) => h.student_id !== s.id);
      const req = { id: uid(), student_id: s.id, class_id: s.class_id, lesson_id: lessonId, step_id: String(stepId || '').slice(0, 10), note: String(note || '').slice(0, 300), at: now() };
      db.help.push(req); save();
      return req;
    },
    async cancelHelp() { const s = me(); db.help = db.help.filter((h) => h.student_id !== s.id); save(); return true; },
    async setAvatar(avatar) {
      const s = me(), c = myClass(s);
      s.avatar = cleanAvatar(avatar, statsFor(lessonsFor(c.grade), s.works, s.awards).level); save();
      return s.avatar;
    },
    async usePlay(seconds) {
      const s = me(), c = myClass(s);
      if (!c.game_open) throw new Oops('Your teacher has closed the game for now.');
      const earned = statsFor(lessonsFor(c.grade), s.works, s.awards).playMinutes * 60;
      s.play_used = Math.min(earned, (s.play_used || 0) + Math.max(0, Math.min(60, Math.round(Number(seconds) || 0)))); save();
      return { used: s.play_used, earned };
    },
    async reportBug(note, details) {
      if (!String(note || '').trim()) throw new Oops('Say what went wrong first.');
      load().bugs.push({ id: uid(), at: now(), role: db.me?.role || 'visitor', name: db.me?.role === 'teacher' ? 'Practice teacher' : me().display_name, note: String(note).slice(0, 1500), page: String(details?.page || '') }); save();
      return true;
    },

    // Teacher --------------------------------------------------------------------------------
    async classes() { teacher(); return db.classes.map((c) => ({ ...c, count: mates(c).length, delete_on: '' })); },
    async createClass(name, grade) {
      teacher();
      const n = String(name || '').trim().slice(0, 80);
      if (!n) throw new Oops('Give the class a name.');
      if (!isGrade(Number(grade))) throw new Oops('Choose grade 6, 7 or 8.');
      const c = { id: uid(), name: n, code: uid().slice(0, 6).toUpperCase(), grade: Number(grade), join_open: true, game_open: false, open_all: false, plan: { question: '', focus: '', minutes: 10 }, created_at: now() };
      db.classes.push(c); save();
      return { ...c, count: 0 };
    },
    async deleteClass(id) { teacher(); classOf(id); db.students = db.students.filter((s) => s.class_id !== id); db.help = db.help.filter((h) => h.class_id !== id); db.classes = db.classes.filter((c) => c.id !== id); save(); return true; },
    async setClass(id, patch) {
      teacher();
      const c = classOf(id);
      for (const k of ['join_open', 'game_open', 'open_all']) if (k in (patch || {})) c[k] = !!patch[k];
      save();
      return { ...c, count: mates(c).length };
    },
    async roster(classId) { teacher(); return mates(classOf(classId)).map((s) => ({ id: s.id, display_name: s.display_name, username: s.username })).sort((a, b) => a.display_name.localeCompare(b.display_name)); },
    async addStudents(classId, names) { teacher(); return addNames(classOf(classId), names); },
    async resetPasscode(studentId) { teacher(); studentOf(studentId); return 'practice'; },
    async removeStudent(studentId) { teacher(); studentOf(studentId); db.students = db.students.filter((s) => s.id !== studentId); db.help = db.help.filter((h) => h.student_id !== studentId); save(); return true; },
    async board(classId) {
      teacher();
      const c = classOf(classId), lessons = lessonsFor(c.grade), list = mates(c);
      return {
        class: { ...c, count: list.length },
        students: list.map((s) => { const st = statsFor(lessons, s.works, s.awards); return { id: s.id, display_name: s.display_name, avatar: s.avatar, row: boardRow(lessons, s.works), xp: st.xp, level: st.level, done: st.done, badges: st.badges }; }).sort((a, b) => a.display_name.localeCompare(b.display_name)),
        city: { counts: cityCounts(lessons, list.map((s) => s.works)), size: list.length },
      };
    },
    async studentWork(studentId) { teacher(); const s = studentOf(studentId); return { student: { id: s.id, display_name: s.display_name, username: s.username, avatar: s.avatar, grade: classOf(s.class_id).grade }, works: s.works, reviews: s.reviews, awards: s.awards }; },
    async review(studentId, lessonId, scores, feedback) {
      teacher();
      const s = studentOf(studentId);
      if (!s.works[lessonId]) throw new Oops('There is no work to review yet.');
      const clean = {};
      for (const k of ['code', 'thinking', 'writing']) if ([0, 1, 2, 3].includes(scores?.[k])) clean[k] = scores[k];
      s.reviews[lessonId] = { scores: clean, feedback: String(feedback || '').slice(0, 1000), at: now() }; save();
      return s.reviews[lessonId];
    },
    async award(studentId, badgeId, on, note) {
      teacher();
      const s = studentOf(studentId);
      if (!TEACHER_BADGES.some((b) => b.id === badgeId)) throw new Oops('That badge was not found.');
      s.awards = s.awards.filter((a) => a.badge_id !== badgeId);
      if (on) s.awards.push({ badge_id: badgeId, note: String(note || '').slice(0, 200) });
      save();
      return s.awards;
    },
    async helpQueue(classId) { teacher(); classOf(classId); return db.help.filter((h) => h.class_id === classId).map((h) => ({ ...h, name: studentOf(h.student_id).display_name })); },
    async helpDone(id) { teacher(); db.help = db.help.filter((h) => h.id !== id); save(); return true; },
    async feedback(classId) { teacher(); const c = classOf(classId); return feedbackReport(lessonsFor(c.grade), mates(c).map((s) => s.works), db.help.filter((h) => h.class_id === c.id)); },
    async screen(classId) {
      teacher();
      const c = classOf(classId), lessons = lessonsFor(c.grade), list = mates(c);
      return { class: { id: c.id, name: c.name, grade: c.grade }, plan: c.plan, wins: wins(lessons, list), city: { counts: cityCounts(lessons, list.map((s) => s.works)), size: list.length } };
    },
    async setPlan(classId, plan) {
      teacher();
      const c = classOf(classId);
      c.plan = { question: String(plan?.question || '').slice(0, 200), focus: String(plan?.focus || '').slice(0, 20), minutes: Math.max(1, Math.min(60, Math.round(Number(plan?.minutes) || 10))) }; save();
      return c.plan;
    },
    async answerKey(grade) { teacher(); const out = {}; for (const l of lessonsFor(grade)) out[l.id] = await keyFor(l.id); return out; },
    async exportClass(classId) { teacher(); const c = classOf(classId); return { exported_at: now(), class: { name: c.name, code: c.code, grade: c.grade }, students: mates(c).map((s) => ({ display_name: s.display_name, username: s.username, works: s.works, reviews: s.reviews, awards: s.awards })) }; },
    async bugReports() { teacher(); return db.bugs.slice().reverse(); },
    async closeBug(id) { teacher(); db.bugs = db.bugs.filter((b) => b.id !== id); save(); return db.bugs.slice().reverse(); },
    async deleteAccount() { teacher(); db = seed(); save(); return true; },
    // Student view: a pretend student who is in no class and shows on no page.
    async previewStart(grade) {
      teacher();
      if (!isGrade(Number(grade))) throw new Oops('Choose grade 6, 7 or 8.');
      db.preview = db.preview?.grade === Number(grade) ? db.preview : { id: 'preview', preview: true, grade: Number(grade), display_name: 'You (student view)', username: 'studentview', avatar: defaultAvatar('you'), works: {}, awards: [], reviews: {}, play_used: 0 };
      save();
      return sessionOut();
    },
    async previewEnd() { load().preview = null; save(); return sessionOut(); },
    async previewReset() { const g = load().preview?.grade || 6; db.preview = null; return api.previewStart(g); },
  };
  return api;
}
