// The student's screens: the city and lesson list, the operator and sidekick bots, and the reward game.
import { h, add, clear, attempt } from '../ui.js';
import { sound } from '../fx.js';
import { app, store } from '../app.js';
import { lessonsFor, gradeInfo } from '../curriculum/index.js';
import { statsFor, lessonState, isOpen, lessonXp, PARTS, ALL_BADGES, BADGES, PLAY_MINUTES } from '../game/rules.js';
import { city, operator, bot } from '../game/art.js';
import { startNightShift } from '../game/nightshift.js';

export async function viewHome(main) {
  const { student, class: cls } = app.session;
  const info = gradeInfo(cls.grade), lessons = info.lessons;
  const home = await store.home();
  app.home = home;
  const st = statsFor(lessons, home.works, home.awards);
  const mine = Object.fromEntries(lessons.map((l) => [l.id, lessonState(l, home.works[l.id])]));
  const next = lessons.find((l) => mine[l.id] !== 'done');
  const span = st.next ? Math.round(((st.xp - st.floor) / (st.next - st.floor)) * 100) : 100;
  const playLeft = Math.max(0, st.playMinutes * 60 - (home.play_used || 0));
  add(main,
    h('div.card', h('div.row',
      h('a', { href: '#/me', 'aria-label': 'Change your operator' }, operator(student.avatar, 84)),
      h('div.stack.tight', { style: 'flex:1;min-width:200px' },
        h('h1', `Welcome, ${student.display_name}`),
        h('div', h('span.pill.green', `Level ${st.level}`), ' ', h('strong', st.title)),
        h('div.bar', { role: 'img', 'aria-label': st.next ? `${st.xp} XP. ${st.next - st.xp} more to the next level.` : `${st.xp} XP. Top level.` }, h('i', { style: `width:${span}%` })),
        h('div.small.muted', st.next ? `${st.xp} XP · ${st.next - st.xp} more to level ${st.level + 1}` : `${st.xp} XP · top level`)))),
    h('div.card', h('div.row.spread', h('div', h('div.eyebrow', `${info.district} · Grade ${cls.grade}`), h('h2', info.name)), h('span.muted.small', home.city.size > 1 ? 'Windows light up as your whole class finishes lessons.' : 'Each finished lesson lights a building.')),
      city(lessons, { mine, counts: home.city.counts, size: home.city.size }),
      next ? h('div.row', h('a.btn.primary.big', { href: `#/lesson/${next.id}`, 'data-nudge': 'Open your next lesson' }, mine[next.id] === 'started' ? `Keep going: ${next.title}` : `Start: ${next.title}`)) : h('div.okbox', h('strong', 'The whole district is lit. '), 'You finished every lesson.')),
    h('div.lesson-list', lessons.map((l, i) => {
      const open = isOpen(lessons, home.works, l.id, cls.open_all), state = mine[l.id];
      return h(`a.lesson-card.${state}${l === next ? '.next' : ''}${open ? '' : '.locked'}`, { href: `#/lesson/${l.id}`, 'data-lesson': l.id },
        h('div.row.spread', h('span.n', String(i + 1)), h('span', l.project && h('span.pill.pink', 'Project'), ' ', state === 'done' ? h('span.pill.green', 'Lit') : state === 'started' ? h('span.pill.amber', 'Started') : !open ? h('span.pill', 'Locked') : null)),
        h('h3', l.title), h('span.small.muted', l.question), state !== 'new' && h('span.small', `${lessonXp(l, home.works[l.id])} XP`));
    })),
    h('div.grid2',
      h('div.card', h('div.row.spread', h('h2', 'Your sidekick bots'), h('a.btn.small', { href: '#/me' }, 'See them all')),
        st.badges.length ? h('div.bots', st.badges.slice(-4).map((id) => { const b = ALL_BADGES.find((x) => x.id === id); return h('div.bot', bot(id), h('b', b.bot), h('span', b.name)); })) : h('p.muted', 'Finish your first lesson to meet Blip, your first bot.')),
      h('div.card', h('h2', 'Night Shift'), cls.game_open
        ? [h('p', playLeft >= 10 ? `You have ${Math.floor(playLeft / 60)} min ${playLeft % 60} s of play time.` : `No play time left. Each finished lesson earns ${PLAY_MINUTES} minutes.`), h('div', playLeft >= 10 ? h('a.btn', { href: '#/game' }, 'Play Night Shift') : null)]
        : h('p.muted', `Your teacher opens the game. Each finished lesson earns ${PLAY_MINUTES} minutes of play time.`))));
}

export async function viewMe(main) {
  const { student, class: cls } = app.session;
  const lessons = lessonsFor(cls.grade);
  const home = await store.home();
  const st = statsFor(lessons, home.works, home.awards);
  let avatar = { ...student.avatar };
  const pic = h('div'), parts = h('div.stack');
  const draw = () => {
    clear(pic).append(operator(avatar, 150));
    add(clear(parts), Object.entries(PARTS).map(([part, list]) => h('div.stack.tight', h('h3', { body: 'Color', visor: 'Visor', top: 'On top', deck: 'Gear' }[part]),
      h('div.parts', list.map(([name, level], i) => h('button.btn.small', { 'aria-pressed': (avatar[part] || 0) === i ? 'true' : 'false', onclick: async () => {
        if (level > st.level) { sound.buzz(); return; }
        const saved = await attempt(() => store.setAvatar({ ...avatar, [part]: i }));
        if (saved) { avatar = saved; app.session.student.avatar = saved; sound.tick(); draw(); }
      } }, level > st.level ? `🔒 ${name} (level ${level})` : name))))));
  };
  draw();
  const given = new Map((home.awards || []).map((a) => [a.badge_id, a.note]));
  add(main, h('a.small', { href: '#/' }, '← The city'),
    h('div.card', h('h1', 'Your operator'), h('div.row', { style: 'align-items:flex-start' }, pic, h('div', { style: 'flex:1;min-width:240px' }, parts)), h('p.small.muted', `Level ${st.level}: ${st.title}. New parts unlock as you level up.`)),
    h('div.card', h('h2', 'Sidekick bots'), h('p.muted', 'Each badge comes with a bot. Collect the whole crew.'),
      h('div.bots', ALL_BADGES.map((b) => { const has = st.badges.includes(b.id); return h(`div.bot${has ? '' : '.locked'}`, bot(b.id, 56, !has), h('b', has ? b.bot : '???'), h('span', b.name), h('span.small.muted', given.get(b.id) || b.how), !BADGES.includes(b) && !has && h('span.small.muted', 'Given by your teacher.')); }))));
}

export async function viewGame(main) {
  const { class: cls } = app.session;
  const home = await store.home();
  const st = statsFor(lessonsFor(cls.grade), home.works, home.awards);
  let left = Math.max(0, st.playMinutes * 60 - (home.play_used || 0));
  add(main, h('a.small', { href: '#/' }, '← The city'));
  if (!cls.game_open || left < 10) {
    add(main, h('div.card', h('h1', 'Night Shift'), h('p', !cls.game_open ? 'Your teacher has not opened the game right now.' : `You have used your play time. Each finished lesson earns ${PLAY_MINUTES} more minutes.`), h('a.btn.primary', { href: '#/', 'data-nudge': 'Back to your lessons' }, 'Back to the city')));
    return undefined;
  }
  const clock = h('strong.arcade', ''), score = h('strong.arcade', '0');
  const canvas = h('canvas', { width: 800, height: 450, tabindex: '0', 'aria-label': 'Night Shift game. Move the shield with the left and right arrow keys or by dragging. Bounce the red packets away and let the green ones through.' });
  const note = h('div');
  const show = () => { clock.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`; };
  show();
  add(main, h('div.card', h('div.row.spread', h('h1', 'Night Shift'), h('div.row', h('span', 'Play time ', clock), h('span', 'Score ', score))),
    h('p.muted', 'Guard the city gate. Bounce the red packets away with your shield. Let the green ones through.'),
    h('div.game-wrap', canvas), note));
  let spent = 0;
  const game = startNightShift(canvas, { onScore: (n) => { score.textContent = String(n); } });
  const tick = setInterval(async () => {
    if (document.hidden) return;
    left--; spent++; show();
    if (spent >= 10 || left <= 0) {
      const used = spent; spent = 0;
      const out = await store.usePlay(used).catch(() => null);
      if (!out || left <= 0) { clearInterval(tick); game.stop(); add(clear(note), h('div.note', out ? 'Play time is up. Finish a lesson to earn more.' : 'The game has been closed for now.'), h('a.btn.primary', { href: '#/' }, 'Back to the city')); }
    }
  }, 1000);
  return () => { clearInterval(tick); game.stop(); if (spent) store.usePlay(spent).catch(() => {}); };
}
