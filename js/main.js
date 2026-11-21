// Starts the page: who is signed in, which screen to show, and the bar across the top.
import { h, add, clear, attempt, modal, toast } from './ui.js';
import { startIdleHints, isMuted, setMuted, sound } from './fx.js';
import { applySettings, openSettings } from './settings.js';
import { app, store, go, demo } from './app.js';
import { lessonsFor, getLesson } from './curriculum/index.js';
import { statsFor } from './game/rules.js';
import { operator } from './game/art.js';
import { viewLogin } from './views/auth.js';
import { viewHome, viewMe, viewGame } from './views/student.js';
import { viewLesson } from './views/lesson.js';
import { viewClasses, viewClass, viewStudent, viewScreen, viewPlans, viewStandards, viewBugs, viewAccount } from './views/teacher.js';

applySettings();
const errors = [];
window.addEventListener('error', (e) => { errors.push(String(e.message).slice(0, 300)); });

const STUDENT_ROUTES = [[/^\/$/, viewHome], [/^\/lesson\/(g\d-\d\d)$/, viewLesson], [/^\/me$/, viewMe], [/^\/game$/, viewGame]];
const TEACHER_ROUTES = [[/^\/$/, viewClasses], [/^\/class\/([\w-]+)(?:\/(\w+))?$/, viewClass], [/^\/student\/([\w-]+)$/, viewStudent], [/^\/screen\/([\w-]+)$/, viewScreen],
  [/^\/plans\/(\d)$/, viewPlans], [/^\/standards$/, viewStandards], [/^\/bugs$/, viewBugs], [/^\/account$/, viewAccount]];

function openBugReport() {
  const note = h('textarea', { maxlength: 1500, 'aria-label': 'What went wrong?', placeholder: 'What did you do, and what happened?' });
  const close = modal('Report a problem', [h('p', 'Tell us what went wrong. Do not include passwords or private details.'), note,
    h('button.btn.primary', { onclick: async () => { if (await attempt(() => store.reportBug(note.value, { page: location.hash, browser: navigator.userAgent, screen: `${innerWidth}x${innerHeight}`, theme: document.documentElement.dataset.theme || 'arcade', errors }))) { close(); toast('Thank you. Your report was sent.'); } } }, 'Send')]);
}

function topbar() {
  const s = app.session;
  const xp = h('span.xp-pill', { 'data-xp': '1' });
  const mute = h('button.btn.small', { 'aria-pressed': isMuted() ? 'true' : 'false', 'aria-label': 'Mute sounds', onclick: (e) => { setMuted(!isMuted()); e.currentTarget.setAttribute('aria-pressed', String(isMuted())); e.currentTarget.textContent = isMuted() ? '🔇' : '🔊'; if (!isMuted()) sound.tick(); } }, isMuted() ? '🔇' : '🔊');
  if (s.role === 'student') {
    // The XP shown is worked out from saved lessons each time. A screen can pass newer work for one lesson.
    app.refreshTop = (work, lessonId) => {
      const works = { ...(app.home?.works || {}) };
      if (work && lessonId) { works[lessonId] = work; if (app.home) app.home.works = works; }
      const st = statsFor(lessonsFor(s.class.grade), works, app.home?.awards || []);
      xp.textContent = `Level ${st.level} · ${st.xp} XP`;
    };
    store.home().then((home) => { app.home = home; app.refreshTop(); }).catch(() => {});
  }
  return h('header.topbar', h('a.brand', { href: '#/' }, 'CIPHER CITY'),
    h('nav.navs', s.role === 'student' ? [h('a.nav', { href: '#/' }, 'City'), h('a.nav', { href: '#/me' }, 'Operator')] : [h('a.nav', { href: '#/' }, 'Classes'), h('a.nav', { href: '#/standards' }, 'Standards')]),
    h('div.who', s.role === 'student' ? [operator(s.student.avatar, 34), h('span', s.student.display_name), xp] : h('span', s.teacher.display_name),
      mute, h('button.btn.small', { onclick: () => openSettings(openBugReport) }, 'Display'),
      h('button.btn.small', { onclick: async () => { await attempt(() => store.signOut()); app.session = null; location.hash = ''; render(); } }, 'Sign out')));
}

const previewBanner = () => h('div.banner', h('strong', 'Student view.'), 'You are a pretend student. Nothing here shows on any class page.',
  h('button.btn.small', { onclick: async () => { const s = await attempt(() => store.previewReset()); if (s) { app.session = s; toast('Started again from lesson 1.'); go('/'); } } }, 'Start again'),
  h('button.btn.small.primary', { onclick: async () => { const s = await attempt(() => store.previewEnd()); if (s) { app.session = s; go('/'); } } }, 'Back to the teacher desk'));

let cleanup = null;
async function render() {
  const root = document.getElementById('app');
  cleanup?.(); cleanup = null;
  const hash = location.hash.slice(1) || '/';
  // A lesson link opened while signed out stays in the address, so sign-in lands on the lesson.
  if (!app.session) { viewLogin(clear(root), render); return; }
  // One link works for any class: a student is taken to the same lesson number in their own grade.
  const other = app.session.role === 'student' && hash.match(/^\/lesson\/g(\d)(-\d\d)$/);
  if (other && Number(other[1]) !== app.session.class.grade && getLesson(`g${app.session.class.grade}${other[2]}`)) { go(`/lesson/g${app.session.class.grade}${other[2]}`); return; }
  const main = h('main.page');
  const routes = app.session.role === 'student' ? STUDENT_ROUTES : TEACHER_ROUTES;
  add(clear(root), topbar(), app.session.preview && previewBanner(), main,
    h('footer.foot.no-print', h('span', store.mode === 'local' ? (demo ? 'Demo: made-up students. Nothing leaves this browser.' : 'Practice mode: work is saved in this browser on this device.') : 'No ads. No trackers. Student code runs only in this browser and in a sealed checker.'), h('button.linkish', { onclick: openBugReport }, 'Report a problem')));
  root.querySelectorAll('.nav').forEach((a) => { if (a.getAttribute('href') === `#${hash}`) a.setAttribute('aria-current', 'page'); });
  for (const [re, view] of routes) {
    const m = hash.match(re);
    if (m) {
      try { cleanup = (await view(main, ...m.slice(1))) || null; } catch (e) { if (e.message !== 'SIGNED_OUT') add(main, h('div.card', h('h2', 'Something went wrong'), h('p', e.message), h('a.btn', { href: '#/' }, 'Back to the start'))); }
      window.scrollTo(0, 0);
      return;
    }
  }
  go('/');
}

window.addEventListener('hashchange', render);
window.addEventListener('signed-out', () => { app.session = null; render(); });

(async () => {
  try { app.session = await store.session(); } catch (e) {
    add(clear(document.getElementById('app')), h('main.page', h('div.card', h('h1', 'Cipher City could not start'), h('p', e.message))));
    return;
  }
  startIdleHints();
  render();
})();
