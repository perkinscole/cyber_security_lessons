// One lesson: mission, build steps (one on screen at a time), quick check, then turn in.
import { h, add, clear, rich, attempt, modal, toast } from '../ui.js';
import { sound, floatXp, confetti, refuse, speak } from '../fx.js';
import { app, store, go } from '../app.js';
import { getLesson, lessonsFor, gradeOf, isCode, standard } from '../curriculum/index.js';
import { stageOf, stepsDone, isDone, isOpen, lessonXp, XP, MIN_SHIP } from '../game/rules.js';
import { shuffle } from '../engine/logic.js';
import { mountCode, mountLab } from '../labs/index.js';

const STAGES = [['mission', 'Mission'], ['build', 'Build'], ['quiz', 'Quick check'], ['ship', 'Turn in'], ['done', 'Done']];
const plain = (t) => String(t).replace(/\*\*|`/g, '');

export async function viewLesson(main, id) {
  const lesson = getLesson(id);
  const grade = app.session.class.grade;
  if (!lesson || gradeOf(id) !== grade) { add(main, h('div.card', h('h2', 'That lesson is not in your course'), h('a.btn', { href: '#/' }, 'Back to the city'))); return; }
  const lessons = lessonsFor(grade);
  const home = await store.home();
  if (!isOpen(lessons, home.works, id, app.session.class.open_all)) {
    const at = lessons.findIndex((l) => l.id === id);
    add(main, h('div.card', h('h2', `${lesson.title} is not open yet`), h('p', `Finish "${lessons[at - 1].title}" first.`), h('a.btn.primary', { href: `#/lesson/${lessons[at - 1].id}`, 'data-nudge': 'Go to the lesson before this one' }, `Go to lesson ${at}`)));
    return;
  }
  let work = home.works[id];
  let help = home.help;
  let stage = stageOf(lesson, work);
  let stepAt = Math.max(0, lesson.steps.findIndex((s) => !work?.steps?.[s.id]?.done));
  const n = lessons.indexOf(lesson) + 1;
  const seed = `${app.session.student.id}${id}`;
  const body = h('div.stack');
  const stageRow = h('ol.stages');
  const reached = () => STAGES.findIndex(([k]) => k === stageOf(lesson, work));

  /** Save something, then update the page and celebrate any XP gained. */
  async function save(fn, from) {
    const before = lessonXp(lesson, work);
    const out = await attempt(fn);
    if (out === undefined) return undefined;
    work = out.work || out;
    const gained = lessonXp(lesson, work) - before;
    if (gained > 0) floatXp(from, gained);
    return out;
  }

  const tools = (stepId, text) => {
    const on = work?.confusing?.includes(stepId);
    return h('div.row.no-print',
      h('button.btn.small', { onclick: () => speak(plain(text)) }, '🔊 Read aloud'),
      h('button.btn.small', { 'aria-pressed': on ? 'true' : 'false', onclick: async (e) => { const b = e.currentTarget; const now = b.getAttribute('aria-pressed') !== 'true'; if (await save(() => store.confusing(id, stepId, now))) { b.setAttribute('aria-pressed', String(now)); toast(now ? 'Thanks. Your teacher will see that this part was confusing.' : 'Mark removed.'); } } }, 'Confusing?'),
      help ? h('button.btn.small', { 'aria-pressed': 'true', onclick: async () => { if (await attempt(() => store.cancelHelp())) { help = null; draw(); } } }, '✋ Help is on the way (cancel)')
        : h('button.btn.small', { onclick: () => askHelp(stepId) }, '✋ I\'m stuck'));
  };
  function askHelp(stepId) {
    const note = h('textarea', { maxlength: 300, placeholder: 'I tried ___ but ___.', 'aria-label': 'What have you tried?' });
    const close = modal('Ask your teacher for help', [
      h('p', 'Say what you tried. Your teacher will see your name in the help list.'), note,
      h('button.btn.primary', { onclick: async () => { const r = await attempt(() => store.askHelp(id, stepId, note.value)); if (r !== undefined) { help = r; close(); toast(r ? 'Your teacher has been told.' : 'Student view: no request was sent.'); draw(); } } }, 'Send'),
    ]);
  }

  function drawStages() {
    const now = STAGES.findIndex(([k]) => k === stage), max = reached();
    add(clear(stageRow), STAGES.map(([k, label], i) => h(`li.stage${i === now ? '.now' : i < max || (i === max && k === 'done') ? '.done' : ''}`,
      h('button.linkish', { style: 'text-decoration:none;font-weight:800', onclick: (e) => { if (i <= max) { stage = k; draw(); } else refuse(e.currentTarget, '', null); } }, label))));
  }

  function mission() {
    const m = lesson.mission;
    const talk = h('textarea', { maxlength: 500, 'aria-label': 'What you and your partner think' }, work?.talk || '');
    add(body,
      h('div.card', h('div.eyebrow', 'Your mission'), m.story.map((p) => h('p', rich(p))), tools('mission', m.story.join(' '))),
      h('div.grid2',
        h('div.card', h('h3', 'Words to know'), h('dl.vocab', m.vocab.map(([w, d]) => [h('dt', w), h('dd', d)]))),
        h('div.card', h('h3', `Who does this for a job? ${lesson.job[0]}`), h('p', lesson.job[1]), h('div.note', h('strong', 'The rule: '), m.rule))),
      h('div.card', h('h3', 'Talk with a partner'), h('p', m.talk), talk,
        h('div.gate', h('button.btn.primary.big', { 'data-nudge': 'Press Start building', onclick: async (e) => { if (await save(() => store.saveMission(id, talk.value), e.currentTarget)) { stage = 'build'; draw(); } } }, work?.mission ? 'Back to building' : 'Start building'), h('span.gate-note', 'You can leave the box empty if you talked it through.'))));
  }

  function build() {
    const step = lesson.steps[stepAt];
    const rec = () => work?.steps?.[step.id];
    const status = h('div');
    const nextBtn = h('button.btn.primary', { onclick: (e) => {
      if (!rec()?.done) { refuse(e.currentTarget, isCode(step) ? 'Press Run until every check has a ✓.' : 'Finish this step first.', body.querySelector('.lab, .term')); return; }
      if (stepAt < lesson.steps.length - 1) { stepAt++; draw(); } else { stage = stageOf(lesson, work) === 'build' ? 'build' : 'quiz'; if (stage === 'build') stepAt = lesson.steps.findIndex((s) => !work.steps?.[s.id]?.done); draw(); }
    } }, stepAt < lesson.steps.length - 1 ? 'Next step' : 'Go to the quick check');
    const showDone = () => { if (rec()?.done) { clear(status).append(h('div.okbox', h('strong', 'Step done. '), 'Nice work.')); nextBtn.dataset.nudge = 'Go on to the next part'; } };
    const check = async (answer, from) => {
      const was = rec()?.done;
      const out = await save(() => store.checkStep(id, step.id, answer, step), from);
      if (out?.ok && !was) sound.good();
      showDone();
      return out;
    };
    const hands = h('div.stack');
    if (isCode(step)) mountCode(hands, step, { code: rec()?.code ?? step.starter, onRun: (code) => check(code, hands.querySelector('[data-run]')), onDraft: (code) => { if (!rec()?.done || code !== rec().code) store.saveDraft(id, step.id, code).catch(() => {}); } });
    else mountLab(hands, step.lab, { seed: seed + step.id, onDone: (answer) => check(answer, hands) });
    add(body, h('div.card',
      h('div.row.spread', h('div.eyebrow', `Step ${stepAt + 1} of ${lesson.steps.length}`), h('div.dots', lesson.steps.map((s, i) => h(`span.dot${work?.steps?.[s.id]?.done ? '.done' : i === stepAt ? '.now' : ''}`)))),
      h('p.say', rich(step.say)),
      step.more && h('details.more', h('summary', 'Explain more'), h('p', rich(step.more))),
      step.hint && h('details.more', h('summary', 'Need a hint?'), h('p', rich(step.hint))),
      tools(step.id, `${step.say} ${step.more || ''}`),
      hands, status,
      h('div.gate', stepAt > 0 && h('button.btn', { onclick: () => { stepAt--; draw(); } }, 'Back'), nextBtn, h('span.gate-note'))));
    showDone();
    if (!rec()?.done) (isCode(step) ? hands.querySelector('[data-run]') : hands.querySelector('.lab')).dataset.nudge = isCode(step) ? 'Change the code, then press Run' : 'Try this part';
  }

  function quiz() {
    const left = lesson.quiz.filter((x) => !work?.quiz?.right?.[x.id]);
    if (!left.length) { stage = stageOf(lesson, work); if (stage === 'quiz') stage = 'ship'; draw(); return; }
    const x = left[0];
    const at = lesson.quiz.indexOf(x) + 1;
    const note = h('div');
    const order = shuffle(x.choices.map((_, i) => i), seed + x.id);
    add(body, h('div.card',
      h('div.row.spread', h('div.eyebrow', `Quick check: question ${at} of ${lesson.quiz.length}`), h('div.dots', lesson.quiz.map((y) => h(`span.dot${work?.quiz?.right?.[y.id] ? '.done' : y === x ? '.now' : ''}`)))),
      h('p.say', x.q), tools(x.id, `${x.q} ${x.choices.join('. ')}`),
      h('div.choices', { 'data-quiz': x.id }, order.map((i) => h('button.btn.choice', { 'data-choice': String(i), onclick: async (e) => {
        const btn = e.currentTarget;
        const out = await save(() => store.answerQuiz(id, x.id, i), btn);
        if (!out) return;
        if (out.right) {
          btn.classList.add('right'); sound.good();
          body.querySelectorAll('.choice').forEach((b) => { b.disabled = true; });
          add(clear(note), h('div.okbox', h('strong', 'Yes. '), out.why), h('div.gate', h('button.btn.primary', { 'data-nudge': 'Go on', onclick: () => draw() }, left.length > 1 ? 'Next question' : 'Go to turn in')));
        } else { btn.classList.add('wrong'); btn.disabled = true; sound.buzz(); add(clear(note), h('div.badbox', 'Not that one. Read it again and pick another.')); }
      } }, x.choices[i]))), note));
  }

  function ship() {
    const sh = lesson.ship;
    const text = h('textarea', { maxlength: 2000, 'aria-label': 'Your reflection', 'data-ship': '1' }, work?.ship?.text || '');
    const stretch = h('input', { type: 'checkbox', checked: !!work?.ship?.stretch });
    add(body, h('div.card', h('div.eyebrow', 'Turn in'), h('p.say', sh.prompt), tools('ship', sh.prompt),
      h('div.row', h('button.btn.small', { onclick: () => { if (!text.value.trim()) text.value = sh.frame; text.focus(); } }, 'Use a sentence starter'), h('span.muted.small', sh.frame)),
      text,
      h('div.note', h('strong', 'Stretch challenge: '), sh.stretch, h('label.check', { style: 'margin-top:8px' }, stretch, `I tried it (+${XP.stretch} XP)`)),
      h('div.gate', h('button.btn.primary.big', { 'data-nudge': 'Write your answer, then turn it in', onclick: async (e) => {
        if (text.value.replace(/_+/g, '').trim().length < MIN_SHIP) { refuse(e.currentTarget, 'Write at least one full sentence first.', text); return; }
        const was = isDone(lesson, work);
        if (await save(() => store.ship(id, text.value, stretch.checked), e.currentTarget)) { if (!was) { sound.pass(); confetti(); } stage = 'done'; draw(); }
      } }, work?.ship ? 'Save my changes' : 'Turn it in'), h('span.gate-note', 'Your teacher will read this. You do not have to wait for them: keep going.'))));
  }

  function done() {
    const next = lessons[n];
    const review = home.reviews?.[id];
    const stars = h('div.stars', { role: 'group', 'aria-label': 'Rate this lesson' });
    const drawStars = () => add(clear(stars), [1, 2, 3, 4, 5].map((k) => h(`button.star${(work.rating || 0) >= k ? '.on' : ''}`, { 'aria-label': `${k} star${k > 1 ? 's' : ''}`, onclick: async (e) => { if (await save(() => store.rate(id, k), e.currentTarget)) drawStars(); } }, '★')));
    drawStars();
    add(body,
      h('div.card.glow.center', h('div.eyebrow', 'Building lit'), h('h2', `You finished ${lesson.title}!`), h('p', `You earned ${lessonXp(lesson, work)} XP in this lesson. A new building is shining in the city.`),
        h('div.row.center', next ? h('a.btn.primary.big', { href: `#/lesson/${next.id}`, 'data-nudge': 'Start the next lesson' }, `Next: ${next.title}`) : h('a.btn.primary.big', { href: '#/', 'data-nudge': 'See your city' }, 'See the whole district lit'), h('a.btn', { href: '#/' }, 'Back to the city'))),
      h('div.grid2',
        h('div.card', h('h3', 'How was this lesson?'), stars, h('p.small.muted', `Rating a lesson earns ${XP.rated} XP and helps your teacher.`)),
        h('div.card', h('h3', 'What you wrote'), h('p', work.ship.text), h('button.btn.small', { onclick: () => { stage = 'ship'; draw(); } }, 'Change it'))),
      review && (review.feedback || Object.keys(review.scores || {}).length) && h('div.card', h('h3', 'From your teacher'), review.feedback && h('p', review.feedback)));
  }

  function draw() {
    speechSynthesis?.cancel?.();
    drawStages();
    clear(body);
    ({ mission, build, quiz, ship, done })[stage]();
    app.refreshTop?.(work, id);
  }

  add(main,
    h('div.stack.tight', h('a.small', { href: '#/' }, '← The city'), h('div.row.spread', h('h1', `${n}. ${lesson.title}`), lesson.project && h('span.pill.pink', 'Project')), h('p.muted', lesson.goal),
      h('details.more.small', h('summary', 'Standards'), lesson.standards.map((c) => h('p', h('strong', c), ' ', standard(c).text)))),
    stageRow, body);
  draw();
  return () => { try { speechSynthesis?.cancel?.(); } catch (_) { /* no speech on this device */ } };
}

export { stepsDone, go };
