// Signing in. Students: a class code and a name, never an email. Teachers: name, email and password.
import { h, add, clear, attempt, modal } from '../ui.js';
import { app, store, demo } from '../app.js';

const field = (label, attrs) => h('label.field', h('span', label), h('input', { type: 'text', ...attrs }));
const val = (root, name) => root.querySelector(`[name="${name}"]`).value;

/** Show a new student their username and passcode once, to write down. */
export function showPasscode(made, code, done) {
  modal('Write these down', [
    h('p', 'You will need them next time. Your teacher can give you a new passcode if you lose it.'),
    h('div.signin-card.stack.tight', h('div', 'Class code: ', h('strong.mono', code)), h('div', 'Username: ', h('strong.mono', made.username)), h('div', 'Passcode: ', h('strong.mono', { 'data-passcode': '1' }, made.passcode))),
    h('p.small.muted', 'This passcode was made for you by the site. Never use a password from another site here.'),
  ], { onclose: done });
}

export function viewLogin(root, render) {
  const local = store.mode === 'local';
  const joinCode = new URLSearchParams(location.search).get('join') || '';
  let tab = 'join';
  const body = h('div.stack');
  const signedIn = (session) => { app.session = session; render(); };
  const draw = () => {
    clear(body);
    if (tab === 'join') {
      add(body, h('form.stack', { onsubmit: async (e) => {
        e.preventDefault();
        const code = val(body, 'code').trim().toUpperCase();
        const made = await attempt(() => store.studentJoin(code, val(body, 'name')));
        if (!made) return;
        if (local) signedIn(made.session); else showPasscode(made, code, () => signedIn(made.session));
      } },
      field('Class code', { name: 'code', value: joinCode, autocapitalize: 'characters', autocomplete: 'off', required: true, placeholder: local ? 'DEMO6, DEMO7 or DEMO8' : '' }),
      field('Your name, as your class knows you', { name: 'name', autocomplete: 'off', maxlength: 30, required: true }),
      h('p.small.muted', 'First name and last initial is plenty. No email needed.'),
      h('button.btn.primary.big', { type: 'submit' }, 'Join the crew')));
    }
    if (tab === 'back') {
      add(body, h('form.stack', { onsubmit: async (e) => {
        e.preventDefault();
        const s = await attempt(() => store.studentSignIn(val(body, 'code'), val(body, 'user'), val(body, 'pass')));
        if (s) signedIn(s);
      } },
      field('Class code', { name: 'code', value: joinCode, autocapitalize: 'characters', autocomplete: 'off', required: true }),
      field('Username', { name: 'user', autocomplete: 'off', autocapitalize: 'none', required: true }),
      local ? h('input', { type: 'hidden', name: 'pass', value: 'practice' }) : field('Passcode', { name: 'pass', autocomplete: 'off', autocapitalize: 'none', required: true }),
      h('button.btn.primary.big', { type: 'submit' }, 'Sign in')));
    }
    if (tab === 'teacher') {
      if (local) {
        add(body, h('p', 'This is practice mode. Everything stays in this browser and there is no password.'),
          h('button.btn.primary.big', { onclick: async () => { const s = await attempt(() => store.teacherSignIn()); if (s) signedIn(s); } }, 'Open the teacher desk'));
      } else {
        let fresh = false;
        const form = h('form.stack');
        const drawForm = () => add(clear(form),
          fresh && field('Your name', { name: 'tname', autocomplete: 'name', required: true }),
          field('Email', { name: 'email', type: 'email', autocomplete: 'email', required: true }),
          field(fresh ? 'Choose a password (8 characters or more)' : 'Password', { name: 'password', type: 'password', autocomplete: fresh ? 'new-password' : 'current-password', required: true }),
          h('button.btn.primary.big', { type: 'submit' }, fresh ? 'Create my account' : 'Sign in'),
          h('button.linkish', { type: 'button', onclick: () => { fresh = !fresh; drawForm(); } }, fresh ? 'I already have an account' : 'I am new: create a teacher account'));
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const s = await attempt(() => (fresh ? store.teacherSignUp(val(form, 'tname'), val(form, 'email'), val(form, 'password')) : store.teacherSignIn(val(form, 'email'), val(form, 'password'))));
          if (s) signedIn(s);
        });
        drawForm();
        add(body, form, h('p.small.muted', 'One teacher account works for every Ready4AI course.'));
      }
    }
  };
  const tabs = [['join', 'I am new'], ['back', 'I have a username'], ['teacher', 'Teacher']];
  const tabRow = h('div.tabs');
  const drawTabs = () => add(clear(tabRow), tabs.map(([id, label]) => h('button.btn', { 'aria-pressed': tab === id ? 'true' : 'false', onclick: () => { tab = id; drawTabs(); draw(); } }, label)));
  drawTabs(); draw();
  add(root, h('main.page', { style: 'max-width:560px' },
    h('div.center.stack', h('h1.boot-word', 'CIPHER CITY'), h('p', 'The city has gone dark. Learn to defend it, and switch the lights back on.')),
    (local || demo) && h('div.note.small', demo ? 'Demo: made-up students, kept in this browser. Nothing is sent anywhere.' : 'Practice mode: work is saved in this browser on this device only.'),
    h('div.card', tabRow, body)));
}
