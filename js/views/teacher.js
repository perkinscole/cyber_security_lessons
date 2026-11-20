// The teacher's screens: classes, progress, students and their work, help, feedback, sharing,
// the class screen, lesson plans with answer keys, standards, problem reports and the account.
import { h, add, clear, rich, attempt, modal, toast, copy, download, ago } from '../ui.js';
import { sound } from '../fx.js';
import { app, store, go, linkTo } from '../app.js';
import { GRADES, gradeInfo, lessonsFor, getLesson, isCode, standard, coverage } from '../curriculum/index.js';
import { statsFor, TEACHER_BADGES, ALL_BADGES, stepsDone, quizRight, shipped, isDone } from '../game/rules.js';
import { labAnswer } from '../engine/logic.js';
import { city, operator, bot } from '../game/art.js';

const RUBRIC = [['code', 'Code works and is the student\'s own'], ['thinking', 'Explains why, not only what'], ['writing', 'Reflection is clear and complete']];
const LEVELS = ['Not yet', 'Starting', 'Got it', 'Beyond'];
const back = (href, label) => h('a.small.no-print', { href }, `← ${label}`);

export async function viewClasses(main) {
  const classes = await store.classes();
  const name = h('input', { type: 'text', maxlength: 80, placeholder: 'Period 3', 'aria-label': 'Class name', name: 'cname' });
  const grade = h('select', { 'aria-label': 'Grade', name: 'cgrade' }, GRADES.map((g) => h('option', { value: g.grade }, `Grade ${g.grade}: ${g.name}`)));
  add(main,
    h('h1', 'Your classes'),
    classes.length ? h('div.grid3', classes.map((c) => h('a.lesson-card', { href: `#/class/${c.id}`, 'data-class': c.code },
      h('div.row.spread', h('span.pill.green', `Grade ${c.grade}`), h('span.mono', c.code)), h('h3', c.name), h('span.small.muted', `${c.count ?? 0} student${c.count === 1 ? '' : 's'}`)))) : h('div.card', h('p', 'No classes yet. Make your first one below.')),
    h('div.card', h('h2', 'Make a class'), h('p.muted', 'A class is for one grade. Students join with its code and a name. No student email is ever asked for.'),
      h('form.row', { onsubmit: async (e) => { e.preventDefault(); const c = await attempt(() => store.createClass(name.value, Number(grade.value))); if (c) go(`/class/${c.id}`); } }, h('div', { style: 'flex:2;min-width:180px' }, name), h('div', { style: 'flex:2;min-width:180px' }, grade), h('button.btn.primary', { type: 'submit' }, 'Make the class'))),
    h('div.grid2',
      h('div.card', h('h2', 'Teach'), h('p.muted', 'Lesson plans have every answer. Print them or read them on screen.'),
        h('div.row', GRADES.map((g) => h('a.btn.small', { href: `#/plans/${g.grade}` }, `Grade ${g.grade} plans`))), h('div.row', h('a.btn.small', { href: '#/standards' }, 'Standards coverage'))),
      h('div.card', h('h2', 'Try it as a student'), h('p.muted', 'A pretend student of your own. It is in no class and shows on no page.'),
        h('div.row', GRADES.map((g) => h('button.btn.small', { 'data-preview': g.grade, onclick: async () => { const s = await attempt(() => store.previewStart(g.grade)); if (s) { app.session = s; go('/'); } } }, `Grade ${g.grade}`))))),
    h('div.row', h('a.btn.small', { href: '#/bugs' }, 'Problem reports'), h('a.btn.small', { href: '#/account' }, 'Your account and data')));
}

function signInCards(cls, made) {
  modal('Sign-in cards', [
    h('p.no-print', 'Each passcode is shown only now. Print this page or copy the cards. You can make a new passcode for a student at any time.'),
    h('div.cards', made.map((m) => h('div.signin-card.stack.tight', h('strong', m.display_name), h('div.small', 'Cipher City'), h('div', 'Class code: ', h('span.mono', cls.code)), h('div', 'Username: ', h('span.mono', m.username)), h('div', 'Passcode: ', h('span.mono', m.passcode))))),
    h('div.row.no-print', h('button.btn.primary', { onclick: () => window.print() }, 'Print'), h('button.btn', { onclick: () => copy(made.map((m) => `${m.display_name}\tclass ${cls.code}\tusername ${m.username}\tpasscode ${m.passcode}`).join('\n')) }, 'Copy as text')),
  ], { wide: true });
}

export async function viewClass(main, id, tab = 'progress') {
  const board = await store.board(id);
  const cls = board.class, info = gradeInfo(cls.grade), lessons = info.lessons;
  const TABS = [['progress', 'Progress'], ['students', 'Students'], ['help', 'Help'], ['feedback', 'Feedback'], ['share', 'Share and assign'], ['settings', 'Settings']];
  const body = h('div.stack');
  add(main, back('#/', 'Your classes'),
    h('div.row.spread', h('div', h('div.eyebrow', `Grade ${cls.grade} · ${info.name}`), h('h1', cls.name)), h('div.row', h('span', 'Class code ', h('strong.mono', cls.code)), h('a.btn', { href: `#/screen/${id}` }, 'Class screen'))),
    h('div.tabs.no-print', TABS.map(([k, label]) => h('a.btn.small', { href: `#/class/${id}/${k}`, 'aria-pressed': tab === k ? 'true' : 'false' }, label))), body);
  let timer = null;

  if (tab === 'progress') {
    add(body, h('div.card', h('h2', 'The class city'), city(lessons, { counts: board.city.counts, size: board.city.size || 1 }), h('p.small.muted', 'Windows light up as students finish each lesson. No names, no scores.')),
      h('div.card', h('h2', 'Where everyone is'), board.students.length ? h('div.scroll', h('table',
        h('thead', h('tr', h('th', 'Student'), lessons.map((l, i) => h('th', { title: l.title }, String(i + 1))), h('th.num', 'Level'), h('th.num', 'XP'))),
        h('tbody', board.students.map((s) => h('tr', h('td', h('a', { href: `#/student/${s.id}` }, s.display_name)),
          s.row.map((c, i) => h('td', h(`span.grid-cell.${c.state}`, { title: `${lessons[i].title}: ${c.state === 'done' ? 'finished' : c.state === 'started' ? `${c.steps} of ${lessons[i].steps.length} steps` : 'not started'}` }, c.state === 'done' ? '✓' : c.state === 'started' ? String(c.steps) : ''))),
          h('td.num', String(s.level)), h('td.num', String(s.xp))))))) : h('p', 'No students yet. Open the Students tab to add them, or share the class code.'),
      h('p.small.muted', '✓ finished. A number is how many build steps are done. XP comes from doing the work, never from your scores.')));
  }
  if (tab === 'students') {
    const roster = await store.roster(id);
    const names = h('textarea', { placeholder: 'One name on each line', 'aria-label': 'Names to add', name: 'names' });
    add(body, h('div.card', h('h2', 'Add students'), h('p.muted', 'Type one name on each line: first name and last initial is plenty. You will get a sign-in card for each. Students can also add themselves with the class code.'), names,
      h('div.row', h('button.btn.primary', { onclick: async () => { const made = await attempt(() => store.addStudents(id, names.value.split('\n'))); if (made?.length) { signInCards(cls, made); go(`/class/${id}/students`); } else if (made) toast('Type at least one name.', 'bad'); } }, 'Add and make sign-in cards'))),
    h('div.card', h('h2', `Students (${roster.length})`), roster.length ? h('div.scroll', h('table', h('thead', h('tr', h('th', 'Name'), h('th', 'Username'), h('th', ''))),
      h('tbody', roster.map((s) => h('tr', h('td', h('a', { href: `#/student/${s.id}` }, s.display_name)), h('td.mono', s.username), h('td', h('div.row',
        h('button.btn.small', { onclick: async () => { const p = await attempt(() => store.resetPasscode(s.id)); if (p) signInCards(cls, [{ ...s, passcode: p }]); } }, 'New passcode'),
        h('button.btn.small.danger', { onclick: () => { const close = modal(`Remove ${s.display_name}?`, [h('p', 'This deletes the student and all their work. It cannot be undone.'), h('button.btn.danger', { onclick: async () => { if (await attempt(() => store.removeStudent(s.id))) { close(); go(`/class/${id}/students`); } } }, 'Delete this student')]); } }, 'Remove')))))))) : h('p', 'Nobody yet.')));
  }
  if (tab === 'help') {
    const list = h('div.stack');
    let seen = -1;
    const load = async () => {
      const q = await store.helpQueue(id).catch(() => null);
      if (!q) return;
      if (seen >= 0 && q.length > seen) sound.badge();
      seen = q.length;
      add(clear(list), q.length ? q.map((r) => h('div.card', h('div.row.spread', h('h3', r.name), h('span.small.muted', ago(r.at))), h('p', `${getLesson(r.lesson_id)?.title || r.lesson_id}${r.step_id ? `, ${/^q/.test(r.step_id) ? `question ${r.step_id.slice(1)}` : r.step_id === 'mission' || r.step_id === 'ship' ? r.step_id : `step ${r.step_id}`}` : ''}`), r.note && h('p', `"${r.note}"`),
        h('div.row', h('button.btn.primary.small', { onclick: async () => { if (await attempt(() => store.helpDone(r.id))) load(); } }, 'Helped')))) : h('div.card', h('p', 'Nobody is waiting. Requests appear here with a chime.')));
    };
    add(body, h('p.muted', 'Students press "I\'m stuck" on any step. This list refreshes by itself.'), list);
    await load();
    timer = setInterval(load, 15000);
  }
  if (tab === 'feedback') {
    const report = await store.feedback(id);
    const text = report.map((r, i) => [`${i + 1}. ${r.title}: ${r.finished} finished of ${r.started} started${r.rating ? `, rated ${r.rating} of 5 by ${r.ratings}` : ''}${r.help ? `, ${r.help} waiting for help` : ''}`,
      ...r.confusing.map((c) => `   Confusing: ${c.label} (${c.n})`), ...r.missed.map((m) => `   Missed on the first try by ${m.n} of ${m.of}: ${m.q}`), ...r.tries.map((t) => `   Step ${t.id} took ${t.avg} tries on average`)].join('\n')).join('\n');
    add(body, h('div.row.spread', h('p.muted', 'What the class found hard, with no student names. Use it to plan a reteach.'), h('div.row', h('button.btn.small', { onclick: () => copy(text) }, 'Copy'), h('button.btn.small', { onclick: () => download('cipher-city-feedback.txt', text) }, 'Download'))),
      report.map((r, i) => h('div.card', h('div.row.spread', h('h3', `${i + 1}. ${r.title}`), h('span.small.muted', `${r.finished} finished of ${r.started} started`)),
        r.rating ? h('p', `Rated ${r.rating} of 5 by ${r.ratings} student${r.ratings === 1 ? '' : 's'}.`) : null,
        r.confusing.length ? h('p', h('strong', 'Marked confusing: '), r.confusing.map((c) => `${c.label} (${c.n})`).join(', ')) : null,
        r.missed.map((m) => h('p', h('strong', `Missed on the first try by ${m.n} of ${m.of}: `), m.q)),
        r.tries.map((t) => h('p', h('strong', `Step ${t.id} `), `took ${t.avg} tries on average.`)),
        r.help ? h('p', `${r.help} waiting for help now.`) : null,
        !r.started && h('p.muted', 'Nobody has started this lesson.'))));
  }
  if (tab === 'share') {
    const join = linkTo('', `?join=${cls.code}`);
    const line = (label, value) => h('div.row', h('span', { style: 'flex:1;min-width:200px' }, h('strong', label), h('div.small.mono', { style: 'word-break:break-all' }, value)), h('button.btn.small', { onclick: () => copy(value) }, 'Copy'));
    add(body, h('div.card', h('h2', 'Invite students'), h('p.muted', 'Paste this into Google Classroom, Canvas, Schoology or any other system. Nothing is sent to that system, and it sends nothing here.'), line('Join link', join), line('Class code', cls.code)),
      h('div.card', h('h2', 'Assign a lesson'), h('p.muted', 'Each lesson has its own link. A student who is not signed in is asked to sign in first, and then lands on the lesson.'),
        lessons.map((l, i) => { const link = linkTo(`/lesson/${l.id}`, `?join=${cls.code}`); return h('div.stack.tight', { style: 'border-top:1px solid var(--edge);padding-top:10px' }, h('h3', `${i + 1}. ${l.title}`), line('Link', link), line('Instructions', `Cipher City lesson ${i + 1}: ${l.title}. ${l.goal} Open the link, finish every step, pass the quick check and write your reflection. About 45 minutes.`)); })));
  }
  if (tab === 'settings') {
    const toggle = (key, label, why) => h('label.check', h('input', { type: 'checkbox', checked: !!cls[key], 'data-toggle': key, onchange: async (e) => { const c = await attempt(() => store.setClass(id, { [key]: e.target.checked })); if (c) { cls[key] = c[key]; toast('Saved.'); } else e.target.checked = !!cls[key]; } }), h('span', h('strong', label), h('div.small.muted', why)));
    add(body, h('div.card', h('h2', 'Switches'),
      toggle('join_open', 'Students can join with the class code', 'Turn off once everyone is in.'),
      toggle('game_open', 'Night Shift reward game is open', 'Students can only play with time earned by finishing lessons: 2 minutes for each.'),
      toggle('open_all', 'Every lesson is open', 'Off: lessons open in order. On: students may start any lesson.')),
    h('div.card', h('h2', 'This class\'s data'), cls.delete_on && h('p', `If nothing changes, the daily clean-up will delete this class on ${cls.delete_on}.`),
      h('div.row', h('button.btn', { onclick: async () => { const data = await attempt(() => store.exportClass(id)); if (data) download(`cipher-city-${cls.code}.json`, JSON.stringify(data, null, 2), 'application/json'); } }, 'Download everything held about this class'),
        h('button.btn.danger', { onclick: () => { const close = modal(`Delete ${cls.name}?`, [h('p', 'This deletes the class, every student in it and all their work. It cannot be undone.'), h('button.btn.danger', { onclick: async () => { if (await attempt(() => store.deleteClass(id))) { close(); go('/'); } } }, 'Delete this class')]); } }, 'Delete this class'))));
  }
  return () => clearInterval(timer);
}

export async function viewStudent(main, id) {
  const data = await store.studentWork(id);
  const st = data.student, lessons = lessonsFor(st.grade);
  const stats = statsFor(lessons, data.works, data.awards);
  const awards = h('div.row');
  const drawAwards = (list) => add(clear(awards), TEACHER_BADGES.map((b) => { const has = list.some((a) => a.badge_id === b.id); return h('button.btn.small', { 'aria-pressed': has ? 'true' : 'false', title: b.how, onclick: async () => { const out = await attempt(() => store.award(id, b.id, !has, '')); if (out) { drawAwards(out); toast(has ? 'Badge taken back.' : `${b.name} given. ${st.display_name} will see it.`); } } }, bot(b.id, 28), b.name); }));
  drawAwards(data.awards);
  add(main, back('#/', 'Your classes'),
    h('div.card', h('div.row', operator(st.avatar, 72), h('div.stack.tight', h('h1', st.display_name), h('div.muted', `Username ${st.username} · Level ${stats.level} · ${stats.xp} XP · ${stats.done} of ${lessons.length} lessons finished`))),
      h('h3', 'Give a badge'), awards, h('p.small.muted', 'For things only you can see: asking first, helping a classmate, sticking with it.')),
    lessons.map((l, i) => {
      const w = data.works[l.id];
      if (!w?.mission) return h('div.card', h('div.row.spread', h('h3', `${i + 1}. ${l.title}`), h('span.muted.small', 'Not started')));
      const review = data.reviews[l.id] || { scores: {}, feedback: '' };
      const scores = { ...review.scores };
      const note = h('textarea', { maxlength: 1000, 'aria-label': 'Feedback for the student', placeholder: 'One thing done well, one thing to try next.' }, review.feedback || '');
      return h('details.card', { 'data-work': l.id }, h('summary', h('strong', `${i + 1}. ${l.title}`), ' ', isDone(l, w) ? h('span.pill.green', 'Finished') : h('span.pill.amber', `${stepsDone(l, w)} of ${l.steps.length} steps`), review.at ? h('span.pill.sky', { style: 'margin-left:6px' }, 'Reviewed') : null),
        w.talk && h('p', h('strong', 'Partner talk: '), w.talk),
        l.steps.map((s) => { const r = w.steps?.[s.id]; return h('div.stack.tight', h('div', h('strong', `Step ${s.id} `), r?.done ? `done in ${r.tries} ${r.tries === 1 ? 'try' : 'tries'}` : r ? `not done yet (${r.tries || 0} tries)` : 'not started', w.confusing?.includes(s.id) ? h('span.pill.amber', { style: 'margin-left:6px' }, 'Marked confusing') : null), isCode(s) && r?.code ? h('pre.code-view', r.code) : null); }),
        Object.keys(w.quiz?.first || {}).length ? h('p', h('strong', 'Quick check: '), `${l.quiz.filter((x) => w.quiz.firstOk?.[x.id]).length} of ${l.quiz.length} right on the first try, ${quizRight(l, w)} right in the end.`) : null,
        shipped(w) ? h('div.note', h('strong', 'Reflection: '), w.ship.text, w.ship.stretch ? h('div.small', 'Says they tried the stretch challenge.') : null) : null,
        h('h3', 'Your review'), RUBRIC.map(([k, label]) => h('label.field', h('span', label), h('select', { onchange: (e) => { if (e.target.value === '') delete scores[k]; else scores[k] = Number(e.target.value); } }, h('option', { value: '' }, 'No score'), LEVELS.map((name, n) => h('option', { value: n, selected: scores[k] === n }, `${n}: ${name}`))))),
        note, h('div.row', h('button.btn.primary', { onclick: async () => { if (await attempt(() => store.review(id, l.id, scores, note.value))) toast('Review saved. The student sees your written feedback, not the scores.'); } }, 'Save review')));
    }));
}

export async function viewScreen(main, id) {
  const data = await store.screen(id);
  const lessons = lessonsFor(data.class.grade);
  document.body.classList.add('on-screen');
  const plan = { ...data.plan };
  const focus = () => getLesson(plan.focus) || lessons[0];
  const q = h('p.q'), sub = h('p.muted'), clock = h('div.clock'), winsBox = h('div.stack.tight'), cityBox = h('div');
  let left = (plan.minutes || 10) * 60, ticking = null;
  const showClock = () => { clock.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`; };
  const draw = (d) => {
    q.textContent = plan.question || focus().question;
    sub.textContent = `Today: ${lessons.indexOf(focus()) + 1}. ${focus().title}. ${focus().goal}`;
    add(clear(winsBox), d.wins.length ? d.wins.map((w) => h('div', h('strong', w.name), ` ${w.text}`)) : h('div.muted', 'Wins appear here as students finish lessons.'));
    clear(cityBox).append(city(lessons, { counts: d.city.counts, size: d.city.size || 1 }));
  };
  const startBtn = h('button.btn', { onclick: () => { if (ticking) { clearInterval(ticking); ticking = null; startBtn.textContent = 'Start'; return; } startBtn.textContent = 'Pause'; ticking = setInterval(() => { left = Math.max(0, left - 1); showClock(); if (!left) { clearInterval(ticking); ticking = null; startBtn.textContent = 'Start'; sound.level(); } }, 1000); } }, 'Start');
  const setup = () => {
    const question = h('input', { type: 'text', maxlength: 200, value: plan.question, placeholder: focus().question });
    const lessonPick = h('select', lessons.map((l, i) => h('option', { value: l.id, selected: l === focus() }, `${i + 1}. ${l.title}`)));
    const mins = h('input', { type: 'number', min: 1, max: 60, value: plan.minutes || 10 });
    const close = modal('Set up the class screen', [h('label.field', h('span', 'Today\'s lesson'), lessonPick), h('label.field', h('span', 'Question of the day (leave empty to use the lesson\'s own)'), question), h('label.field', h('span', 'Timer, in minutes'), mins),
      h('button.btn.primary', { onclick: async () => { const saved = await attempt(() => store.setPlan(id, { question: question.value, focus: lessonPick.value, minutes: Number(mins.value) })); if (saved) { Object.assign(plan, saved); left = plan.minutes * 60; showClock(); draw(data); close(); } } }, 'Save')]);
  };
  showClock(); draw(data);
  add(main, h('div.row.spread.no-print', back(`#/class/${id}`, data.class.name), h('div.row', h('button.btn.small', { onclick: setup }, 'Set up'), h('button.btn.small', { onclick: () => document.documentElement.requestFullscreen?.().catch(() => {}) }, 'Full screen'))),
    h('div.card', h('div.eyebrow', 'Question of the day'), q, sub),
    h('div.grid2', h('div.card.center', clock, h('div.row.center', startBtn, h('button.btn', { onclick: () => { left = (plan.minutes || 10) * 60; showClock(); } }, 'Reset'))), h('div.card', h('h2', 'Recent wins'), winsBox)),
    h('div.card', h('h2', 'Our city'), cityBox));
  const poll = setInterval(async () => { const d = await store.screen(id).catch(() => null); if (d) draw(d); }, 20000);
  return () => { clearInterval(poll); clearInterval(ticking); document.body.classList.remove('on-screen'); };
}

const answerText = (lab) => {
  if (lab.type === 'mcq') return `${lab.choices[lab.answer]} (${lab.why})`;
  if (lab.type === 'sort') return lab.bins.map((b, i) => `${b}: ${lab.items.filter((it) => it[1] === i).map((it) => it[0]).join('; ')}`).join(' | ');
  if (lab.type === 'order') return lab.items.map((t, i) => `${i + 1}. ${t}`).join('  ');
  return lab.pairs.map((p) => `${p[0]} → ${p[1]}`).join('; ');
};

export async function viewPlans(main, grade) {
  const info = gradeInfo(grade);
  if (!info) { go('/'); return; }
  const keys = await store.answerKey(info.grade);
  add(main, h('div.row.spread.no-print', back('#/', 'Your classes'), h('button.btn.primary', { onclick: () => window.print() }, 'Print these plans')),
    h('div', h('div.eyebrow', `Grade ${info.grade} · ${info.district}`), h('h1', `${info.name}: lesson plans and answer keys`), h('p.muted', info.blurb)),
    info.lessons.map((l, i) => { const key = keys?.[l.id]; return h('div.card.plan', { 'data-plan': l.id },
      h('div.row.spread', h('h2', `${i + 1}. ${l.title}`), h('span', l.project && h('span.pill.pink', 'Project'), ' ', h('span.pill', '40 to 50 minutes'))),
      h('p', h('strong', 'Question of the day: '), l.question), h('p', h('strong', 'Students can say: '), l.goal),
      l.standards.map((c) => h('p.small', h('strong', c), ' ', standard(c).text)),
      h('p', h('strong', 'Words: '), l.mission.vocab.map(([w, d]) => `${w} (${d})`).join(' ')),
      h('p', h('strong', 'The rule for this lesson: '), l.mission.rule), h('p', h('strong', `Career: ${l.job[0]}. `), l.job[1]),
      h('p', h('strong', 'Partner talk: '), l.mission.talk),
      h('div.note', h('strong', 'Teacher note: '), l.teacher.note),
      h('h3', 'Build steps and answers'),
      l.steps.map((s) => h('div.stack.tight', h('p', h('strong', `Step ${s.id}. `), rich(s.say)), isCode(s) ? [h('p.small.muted', 'One answer that passes (others can too):'), h('pre.code-view', key?.code?.[s.id] || 'Answers are shown when you are signed in to a real class.')] : h('p.small', h('strong', 'Answer: '), answerText(s.lab)))),
      h('h3', 'Quick check'), h('ol', l.quiz.map((x) => { const k = key?.quiz?.[x.id]; return h('li', x.q, k ? h('div.small', h('strong', `Answer: ${x.choices[k[0]]}. `), k[1]) : null); })),
      h('h3', 'Turn in'), h('p', l.ship.prompt), h('p.small', h('strong', 'Sentence starter: '), l.ship.frame), h('p.small', h('strong', 'Stretch: '), l.ship.stretch)); }));
}

export function viewStandards(main) {
  add(main, back('#/', 'Your classes'), h('h1', 'Standards coverage'), h('p.muted', 'Massachusetts Digital Literacy and Computer Science framework (2016), grades 6 to 8, quoted word for word.'),
    GRADES.map((g) => h('div.card', h('h2', `Grade ${g.grade}: ${g.name}`), h('div.scroll', h('table', h('thead', h('tr', h('th', 'Standard'), h('th', 'Text'), h('th', 'Lessons'))),
      h('tbody', coverage(g.grade).map((r) => h('tr', h('td.mono', { style: 'white-space:nowrap' }, r.code), h('td', r.text), h('td', r.lessons.join(', ')))))))) ));
}

export async function viewBugs(main) {
  const list = h('div.stack');
  const draw = (bugs) => add(clear(list), bugs.length ? bugs.map((b) => h('div.card', h('div.row.spread', h('h3', `${b.name} (${b.role})`), h('span.small.muted', ago(b.at))), h('p', b.note), b.page && h('p.small.muted', `On: ${b.page}`), h('div.row', h('button.btn.small', { onclick: async () => { const out = await attempt(() => store.closeBug(b.id)); if (out) draw(out); } }, 'Done')))) : h('div.card', h('p', 'No open reports.')));
  draw(await store.bugReports());
  add(main, back('#/', 'Your classes'), h('h1', 'Problem reports'), h('p.muted', 'Sent by you and your students from the "Report a problem" link.'), list);
}

export function viewAccount(main) {
  const pass = h('input', { type: 'password', autocomplete: 'current-password', 'aria-label': 'Your password' });
  add(main, back('#/', 'Your classes'), h('h1', 'Your account and data'),
    h('div.card', h('h2', 'What is kept'), h('ul', h('li', 'About you: your name, email and a scrambled password.'), h('li', 'About each student: a display name, a username, a scrambled passcode, and their lesson work. No email, no Google account.'), h('li', 'No advertising, no trackers, and no student work is sent to an AI model.')),
      h('p', 'Download or delete a class from its Settings tab. Remove one student from its Students tab.')),
    h('div.card', h('h2', 'Delete your account'), h('p', 'This deletes your account, every class, every student in them and all their work, in every Ready4AI course. It cannot be undone.'),
      store.mode === 'local' ? h('button.btn.danger', { onclick: async () => { if (await attempt(() => store.deleteAccount())) { toast('Practice data was reset.'); go('/'); } } }, 'Reset the practice data')
        : h('div.row', h('div', { style: 'flex:1;min-width:200px' }, pass), h('button.btn.danger', { onclick: async () => { if (await attempt(() => store.deleteAccount(pass.value))) { app.session = null; location.hash = ''; location.reload(); } } }, 'Delete everything'))));
}

export { labAnswer, ALL_BADGES };
