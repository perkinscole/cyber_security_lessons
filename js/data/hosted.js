// The hosted store: the same calls as local.js, answered by the Ready4AI server.
// The server is the authority. It reruns every code step itself and marks every quick check;
// what this page reports is never trusted.
const COURSE = 'cipher-city';

async function rpc(method, ...args) {
  let res;
  try {
    res = await fetch('/api/rpc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ method, args, course: COURSE }) });
  } catch (_) { throw new Error('Could not reach the server. Check your connection and try again.'); }
  const body = await res.json().catch(() => null);
  if (!body) throw new Error('The server gave an answer that could not be read. Try again.');
  if (!body.ok) {
    if (body.error === 'SIGNED_OUT') window.dispatchEvent(new Event('signed-out'));
    throw new Error(body.error);
  }
  return body.data;
}

export function createHostedStore({ runner }) {
  // While a teacher is in student view, student calls are made as their pretend student.
  let preview = false;
  const student = (method, ...args) => (preview ? rpc('asStudent', method, args) : rpc(method, ...args));
  const shape = async (core) => {
    if (!core) return null;
    if (core.role === 'teacher' && !preview) return { role: 'teacher', teacher: core.teacher };
    const mine = await student('ccMe');
    return { role: 'student', preview, student: mine.student, class: mine.class };
  };
  const api = {
    mode: 'hosted',
    session: async () => shape(await rpc('session')),
    signOut: async () => { preview = false; return rpc('signOut'); },
    teacherSignUp: async (name, email, password) => shape(await rpc('teacherSignUp', name, email, password)),
    teacherSignIn: async (email, password) => shape(await rpc('teacherSignIn', email, password)),
    studentSignIn: async (code, username, passcode) => shape(await rpc('studentSignIn', code, username, passcode)),
    async studentJoin(code, name) { const made = await rpc('studentJoin', code, name); return { session: await shape(made.session), username: made.username, passcode: made.passcode }; },

    home: () => student('ccHome'),
    saveMission: (lessonId, talk) => student('ccMission', lessonId, talk),
    saveDraft: (lessonId, stepId, code) => student('ccDraft', lessonId, stepId, code),
    async checkStep(lessonId, stepId, answer, step) {
      // Run it here first so the student sees their output and any error at once. The server then
      // runs it again in its own sealed engine, and only the server's verdict is saved.
      const local = step && !step.lab ? await runner(step, String(answer ?? '')) : null;
      const out = await student('ccStep', lessonId, stepId, answer);
      const result = local ? (local.passed === out.ok ? local : { ...local, passed: out.ok, tests: out.tests || local.tests }) : null;
      return { ok: out.ok, work: out.work, result };
    },
    answerQuiz: (lessonId, qid, choice) => student('ccQuiz', lessonId, qid, choice),
    ship: (lessonId, text, stretch) => student('ccShip', lessonId, text, stretch),
    rate: (lessonId, stars) => student('ccRate', lessonId, stars),
    confusing: (lessonId, id, on) => student('ccConfusing', lessonId, id, on),
    askHelp: (lessonId, stepId, note) => student('ccAskHelp', lessonId, stepId, note),
    cancelHelp: () => student('ccCancelHelp'),
    setAvatar: (avatar) => student('ccAvatar', avatar),
    usePlay: (seconds) => student('ccPlay', seconds),
    reportBug: (note, details) => rpc('reportBug', note, details),

    classes: () => rpc('ccClasses'),
    createClass: (name, grade) => rpc('ccCreateClass', name, grade),
    deleteClass: (id) => rpc('deleteClass', id),
    setClass: (id, patch) => rpc('ccSetClass', id, patch),
    roster: (classId) => rpc('listStudents', classId),
    addStudents: (classId, names) => rpc('addStudents', classId, names),
    resetPasscode: (studentId) => rpc('resetPasscode', studentId),
    removeStudent: (studentId) => rpc('removeStudent', studentId),
    board: (classId) => rpc('ccBoard', classId),
    studentWork: (studentId) => rpc('ccStudentWork', studentId),
    review: (studentId, lessonId, scores, feedback) => rpc('ccReview', studentId, lessonId, scores, feedback),
    award: (studentId, badgeId, on, note) => rpc('ccAward', studentId, badgeId, on, note),
    helpQueue: (classId) => rpc('ccHelpQueue', classId),
    helpDone: (id) => rpc('ccHelpDone', id),
    feedback: (classId) => rpc('ccFeedback', classId),
    screen: (classId) => rpc('ccScreen', classId),
    setPlan: (classId, plan) => rpc('ccSetPlan', classId, plan),
    answerKey: (grade) => rpc('ccAnswerKey', grade),
    exportClass: (classId) => rpc('ccExportClass', classId),
    bugReports: () => rpc('bugReports'),
    closeBug: (id) => rpc('closeBug', id),
    deleteAccount: (password) => rpc('deleteAccount', password),
    async previewStart(grade) { await rpc('ccPreviewGrade', grade); preview = true; return api.session(); },
    async previewEnd() { preview = false; return api.session(); },
    async previewReset() { await rpc('previewReset'); return api.session(); },
  };
  return api;
}
