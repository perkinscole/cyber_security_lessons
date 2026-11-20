// XP, levels, badges and unlocks. Everything here is worked out from saved progress each time it
// is shown. Nothing is stored, and nothing depends on a teacher's scores.
import { isCode } from '../curriculum/index.js';

export const XP = { mission: 10, step: 10, quiz: 30, first: 20, stretch: 25, ship: 50, rated: 10, lesson: 50, badge: 25 };
export const PASS = 3;       // quick-check questions right, out of 4
export const MIN_SHIP = 20;  // characters in a reflection
export const PLAY_MINUTES = 2; // reward-game minutes earned by each finished lesson

export const LEVELS = [
  [0, 'Rookie'], [150, 'Lookout'], [350, 'Scout'], [600, 'Code Breaker'], [900, 'Patcher'], [1250, 'Gatekeeper'],
  [1650, 'Night Guard'], [2100, 'Tracker'], [2600, 'Defender'], [3200, 'Key Master'], [3900, 'City Shield'], [4700, 'Legend of the Grid'],
];

// The operator's parts. [name, level it unlocks at]
export const PARTS = {
  body: [['Teal', 1], ['Pink', 1], ['Amber', 1], ['Violet', 2], ['Lime', 4], ['Sky', 6], ['Chrome', 9]],
  visor: [['Bar', 1], ['Round', 1], ['Shades', 3], ['Scanner', 5], ['Star', 8]],
  top: [['None', 1], ['Antenna', 2], ['Cap', 3], ['Headset', 5], ['Crown', 10]],
  deck: [['None', 1], ['Keyboard', 2], ['Tablet', 4], ['Shield', 7], ['Key', 11]],
};
export const BODY_COLORS = ['#19b8a6', '#ff5fa2', '#ffb53d', '#9a7bff', '#9be24a', '#4cc3ff', '#c9d3e0'];
export const defaultAvatar = (seed = '') => {
  let n = 0;
  for (const c of String(seed)) n = (n * 31 + c.charCodeAt(0)) >>> 0;
  return { body: n % 3, visor: n % 2, top: 0, deck: 0 };
};
/** Keep only parts this level has unlocked. */
export function cleanAvatar(a, level) {
  const out = {};
  for (const [part, list] of Object.entries(PARTS)) {
    const i = Number.isInteger(a?.[part]) && a[part] >= 0 && a[part] < list.length ? a[part] : 0;
    out[part] = list[i][1] <= level ? i : 0;
  }
  return out;
}

export const stepsDone = (lesson, p) => lesson.steps.filter((s) => p?.steps?.[s.id]?.done).length;
export const quizRight = (lesson, p) => lesson.quiz.filter((x) => p?.quiz?.right?.[x.id]).length;
export const quizPassed = (lesson, p) => quizRight(lesson, p) >= PASS;
export const shipped = (p) => (p?.ship?.text || '').trim().length >= MIN_SHIP;
export const isDone = (lesson, p) => !!p?.mission && stepsDone(lesson, p) === lesson.steps.length && quizPassed(lesson, p) && shipped(p);
export const lessonState = (lesson, p) => (isDone(lesson, p) ? 'done' : p && (p.mission || stepsDone(lesson, p)) ? 'started' : 'new');

/** Where a student is in a lesson: mission, build, quiz, ship or done. */
export function stageOf(lesson, p) {
  if (!p?.mission) return 'mission';
  if (stepsDone(lesson, p) < lesson.steps.length) return 'build';
  if (!quizPassed(lesson, p)) return 'quiz';
  if (!shipped(p)) return 'ship';
  return 'done';
}

export function lessonXp(lesson, p) {
  if (!p) return 0;
  let xp = 0;
  if (p.mission) xp += XP.mission;
  xp += stepsDone(lesson, p) * XP.step;
  if (quizPassed(lesson, p)) xp += XP.quiz;
  if (lesson.quiz.every((x) => p.quiz?.firstOk?.[x.id])) xp += XP.first;
  if (shipped(p)) xp += XP.ship;
  if (shipped(p) && p.ship.stretch) xp += XP.stretch;
  if (p.rating) xp += XP.rated;
  if (isDone(lesson, p)) xp += XP.lesson;
  return xp;
}

// Badges a student earns by working. Each comes with a sidekick bot to collect.
export const BADGES = [
  { id: 'power-on', name: 'Power On', bot: 'Blip', how: 'Finish your first lesson.', earned: (s) => s.done >= 1 },
  { id: 'night-watch', name: 'Night Watch', bot: 'Owlie', how: 'Finish 3 lessons.', earned: (s) => s.done >= 3 },
  { id: 'half-lit', name: 'Half the Lights', bot: 'Volt', how: 'Finish 5 lessons.', earned: (s) => s.done >= 5 },
  { id: 'district-lit', name: 'District Lit', bot: 'Beacon', how: 'Finish all 10 lessons.', earned: (s) => s.done >= 10 },
  { id: 'sharp-eye', name: 'Sharp Eye', bot: 'Lens', how: 'Get every quick-check question right on the first try in 3 lessons.', earned: (s) => s.perfect >= 3 },
  { id: 'clean-run', name: 'Clean Run', bot: 'Dash', how: 'Pass 5 code steps on the first try.', earned: (s) => s.firstTry >= 5 },
  { id: 'builder', name: 'Builder', bot: 'Rivet', how: 'Finish a project lesson.', earned: (s) => s.projects >= 1 },
  { id: 'deep-thinker', name: 'Deep Thinker', bot: 'Echo', how: 'Write 5 reflections of two sentences or more.', earned: (s) => s.longShips >= 5 },
  { id: 'extra-mile', name: 'Extra Mile', bot: 'Zoom', how: 'Try 3 stretch challenges.', earned: (s) => s.stretches >= 3 },
];
// Badges only a teacher can give.
export const TEACHER_BADGES = [
  { id: 'good-catch', name: 'Good Catch', bot: 'Patch', how: 'Found a problem and reported it the right way.' },
  { id: 'crew-mate', name: 'Crew Mate', bot: 'Buddy', how: 'Helped a classmate without giving the answer.' },
  { id: 'asks-first', name: 'Asks First', bot: 'Halo', how: 'Showed what permission means.' },
  { id: 'never-quits', name: 'Never Quits', bot: 'Tank', how: 'Kept going when the code would not work.' },
];
export const ALL_BADGES = [...BADGES, ...TEACHER_BADGES];
export const badgeInfo = (id) => ALL_BADGES.find((b) => b.id === id);

/**
 * Everything the game shows for one student.
 *   lessons: the lessons of the student's grade   works: { lessonId: progress }   awards: [{ badge_id }]
 */
export function statsFor(lessons, works = {}, awards = []) {
  const s = { done: 0, perfect: 0, firstTry: 0, projects: 0, longShips: 0, stretches: 0, xp: 0 };
  for (const l of lessons) {
    const p = works[l.id];
    if (!p) continue;
    s.xp += lessonXp(l, p);
    if (isDone(l, p)) { s.done++; if (l.project) s.projects++; }
    if (l.quiz.every((x) => p.quiz?.firstOk?.[x.id])) s.perfect++;
    s.firstTry += l.steps.filter((st) => isCode(st) && p.steps?.[st.id]?.done && p.steps[st.id].tries === 1).length;
    if (shipped(p) && (p.ship.text.match(/[.!?]/g) || []).length >= 2) s.longShips++;
    if (shipped(p) && p.ship.stretch) s.stretches++;
  }
  const earned = BADGES.filter((b) => b.earned(s)).map((b) => b.id);
  const given = awards.map((a) => a.badge_id).filter((id) => TEACHER_BADGES.some((b) => b.id === id));
  s.badges = [...earned, ...new Set(given)];
  s.xp += s.badges.length * XP.badge;
  let level = 1;
  LEVELS.forEach(([need], i) => { if (s.xp >= need) level = i + 1; });
  s.level = level;
  s.title = LEVELS[level - 1][1];
  s.next = LEVELS[level] ? LEVELS[level][0] : null;
  s.floor = LEVELS[level - 1][0];
  s.playMinutes = s.done * PLAY_MINUTES;
  return s;
}

/** May this student open this lesson? Lessons open in order unless the teacher opens them all. */
export function isOpen(lessons, works, lessonId, openAll) {
  const i = lessons.findIndex((l) => l.id === lessonId);
  if (i < 0) return false;
  return openAll || i === 0 || isDone(lessons[i - 1], works?.[lessons[i - 1].id]);
}
