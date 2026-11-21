// Browser check: a pretend student in each grade finishes every lesson through the real page,
// typing a reference answer into each code step and clicking through each lab. Then the teacher
// pages are opened. It fails on any page error, and on any request to another site.
//
//   node tools/serve.mjs                                  (in another terminal)
//   node e2e/walk.mjs http://localhost:8080               practice mode: class codes DEMO6 to DEMO8
//   node e2e/walk.mjs http://localhost:8080/cipher-city/ hosted   on Ready4AI: signs up a teacher, makes classes
//   add a folder name at the end to save screenshots there
import { createRequire } from 'node:module';
import { GRADES } from '../js/curriculum/index.js';
import { KEYS } from '../answers/index.js';

// Playwright is installed on the machine, not in this project, so it is loaded the way Node finds global packages.
const { chromium } = createRequire(import.meta.url)('playwright');
const base = (process.argv[2] || 'http://localhost:8080').replace(/\/?$/, '/');
const hosted = process.argv[3] === 'hosted';
const shots = process.argv[hosted ? 4 : 3];
const only = process.env.GRADES ? process.env.GRADES.split(',').map(Number) : [6, 7, 8];
const origin = new URL(base).origin;
const problems = [];
const browser = await chromium.launch();
const exact = (text) => new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);

// Practice mode keeps everything in one browser's storage, so there the student and the teacher share one browser.
const makeContext = () => browser.newContext({ viewport: { width: 1100, height: 850 }, reducedMotion: 'reduce' });
const shared = hosted ? null : await makeContext();
async function newPage() {
  const context = shared || await makeContext();
  const page = await context.newPage();
  page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.css|Failed to load resource/.test(m.text())) problems.push(`console: ${m.text()}`); });
  // The rule the whole course is built on: nothing is fetched from, or sent to, anywhere else.
  page.on('request', (r) => { const u = r.url(); if (!u.startsWith(origin) && !u.startsWith('blob:') && !u.startsWith('data:')) problems.push(`request to another site: ${u}`); });
  page.on('response', (r) => { if (r.status() >= 400 && !/fonts\.css/.test(r.url())) problems.push(`failed request: ${r.status()} ${r.url()}`); });
  return page;
}
const shot = async (page, name) => { if (shots) await page.screenshot({ path: `${shots}/${name}.png`, fullPage: true }); };

async function solveLab(page, lab) {
  const box = page.locator('.lab').last();
  if (lab.type === 'mcq') await box.locator('.choice', { hasText: exact(lab.choices[lab.answer]) }).click();
  if (lab.type === 'sort') {
    for (let i = 0; i < lab.items.length; i++) {
      const text = await box.locator('.sort-card').textContent();
      await box.locator('.bin-btn').nth(lab.items.find((x) => x[0] === text)[1]).click();
    }
  }
  if (lab.type === 'order') {
    for (let i = 0; i < lab.items.length; i++) {
      const now = await box.locator('.order-text').allTextContents();
      for (let at = now.indexOf(lab.items[i]); at > i; at--) await box.locator('.order-item').nth(at).locator('.up').click();
    }
    await box.getByRole('button', { name: 'Check the order' }).click();
  }
  if (lab.type === 'match') {
    for (const [a, b] of lab.pairs) {
      await box.locator('.match-col').first().locator('.match-btn', { hasText: exact(a) }).click();
      await box.locator('.match-col').last().locator('.match-btn', { hasText: exact(b) }).click();
    }
  }
}

async function doLesson(page, lesson, first) {
  const key = KEYS[lesson.id];
  await page.goto(`${base}#/lesson/${lesson.id}`);
  await page.getByRole('button', { name: 'Start building' }).click();
  for (const step of lesson.steps) {
    await page.locator('.say').waitFor();
    if (step.lab) await solveLab(page, step.lab);
    else {
      if (first && step === lesson.steps.find((s) => !s.lab)) {
        // The starter must not pass, and the Next button must say why instead of going on.
        await page.locator(`[data-run="${step.id}"]`).click();
        await page.locator('.tests li.no, .badbox').first().waitFor();
        await page.getByRole('button', { name: /^(Next step|Go to the quick check)$/ }).click();
        await page.locator('.gate-note.bad').waitFor();
        await shot(page, `${lesson.id}-not-yet`);
      }
      await page.locator(`[data-editor="${step.id}"]`).fill(key.code[step.id]);
      await page.locator(`[data-run="${step.id}"]`).click();
    }
    await page.locator('.okbox', { hasText: 'Step done' }).waitFor({ timeout: 15000 }).catch(async () => { await shot(page, `stuck-${lesson.id}-${step.id}`); throw new Error(`${lesson.id} step ${step.id} did not finish`); });
    if (first && step === lesson.steps[0]) await shot(page, `${lesson.id}-step`);
    await page.getByRole('button', { name: /^(Next step|Go to the quick check)$/ }).click();
  }
  for (const x of lesson.quiz) {
    await page.locator(`[data-quiz="${x.id}"] [data-choice="${key.quiz[x.id][0]}"]`).click();
    await page.getByRole('button', { name: /^(Next question|Go to turn in)$/ }).click();
  }
  await page.locator('[data-ship]').fill(`I learned how ${lesson.title} works. Next time I will check before I trust.`);
  await page.getByRole('button', { name: 'Turn it in' }).click();
  await page.getByRole('heading', { name: `You finished ${lesson.title}!` }).waitFor();
  await page.getByRole('button', { name: '4 stars' }).click();
}

async function student(g, code) {
  const page = await newPage();
  await page.goto(code ? `${base}?join=${code}` : base);
  await page.locator('[name="code"]').fill(code || `DEMO${g.grade}`);
  await page.locator('[name="name"]').fill('Walker T');
  await page.getByRole('button', { name: 'Join the crew' }).click();
  if (hosted) { await page.locator('[data-passcode]').waitFor(); await page.getByRole('button', { name: 'Close' }).click(); }
  await page.getByRole('heading', { name: 'Welcome, Walker T' }).waitFor();
  if (g.grade === only[0]) await shot(page, 'home-new');
  for (const lesson of g.lessons) { await doLesson(page, lesson, lesson === g.lessons[0]); process.stdout.write(`  ${lesson.id} done\n`); }
  await page.goto(`${base}#/`);
  await page.getByText('The whole district is lit.').waitFor();
  const lit = await page.locator('.city [data-lit="1"]').count();
  if (lit !== g.lessons.length) problems.push(`grade ${g.grade}: ${lit} buildings lit, expected ${g.lessons.length}`);
  await shot(page, `home-grade${g.grade}`);
  await page.goto(`${base}#/me`);
  await page.getByRole('heading', { name: 'Sidekick bots' }).waitFor();
  await shot(page, `operator-grade${g.grade}`);
  if (shared) { await page.getByRole('button', { name: 'Sign out' }).click(); await page.getByRole('button', { name: 'Join the crew' }).waitFor(); await page.close(); } else await page.context().close();
}

async function teacher() {
  const page = await newPage();
  await page.goto(base);
  await page.getByRole('button', { name: 'Teacher', exact: true }).click();
  const codes = {};
  if (hosted) {
    await page.getByRole('button', { name: /create a teacher account/ }).click();
    await page.locator('[name="tname"]').fill('Ms Rivera');
    await page.locator('[name="email"]').fill(`walk${Date.now()}@school.example`);
    await page.locator('[name="password"]').fill('made-up-password-for-the-walk');
    await page.getByRole('button', { name: 'Create my account' }).click();
    for (const g of GRADES.filter((x) => only.includes(x.grade))) {
      await page.getByRole('heading', { name: 'Your classes' }).waitFor();
      await page.locator('[name="cname"]').fill(`Period ${g.grade}`);
      await page.locator('[name="cgrade"]').selectOption(String(g.grade));
      await page.getByRole('button', { name: 'Make the class' }).click();
      await page.getByRole('heading', { name: `Period ${g.grade}` }).waitFor();
      codes[g.grade] = (await page.locator('.mono').first().textContent()).trim();
      await page.goto(`${base}#/`);
    }
  } else await page.getByRole('button', { name: 'Open the teacher desk' }).click();
  await page.getByRole('heading', { name: 'Your classes' }).waitFor();
  return { page, codes };
}

async function teacherPages(page, codes) {
  await page.goto(`${base}#/`);
  await shot(page, 'teacher-classes');
  await page.locator(`[data-class="${codes[only[0]] || `DEMO${only[0]}`}"]`).click();
  await page.getByRole('heading', { name: 'Where everyone is' }).waitFor();
  const done = await page.locator('tr', { hasText: 'Walker T' }).locator('.grid-cell.done').count();
  if (done !== 10) problems.push(`progress grid shows ${done} finished lessons for the walker, expected 10`);
  await shot(page, 'teacher-progress');
  for (const [tab, heading] of [['Students', 'Add students'], ['Help', null], ['Feedback', null], ['Share and assign', 'Invite students'], ['Settings', 'Switches']]) {
    await page.getByRole('link', { name: tab, exact: true }).click();
    if (heading) await page.getByRole('heading', { name: heading }).waitFor(); else await page.locator('.card').first().waitFor();
    await shot(page, `teacher-${tab.split(' ')[0].toLowerCase()}`);
  }
  await page.getByRole('link', { name: 'Progress', exact: true }).click();
  await page.getByRole('link', { name: 'Walker T' }).click();
  await page.locator('[data-work]').first().locator('summary').click();
  await page.locator('.code-view').first().waitFor();
  await shot(page, 'teacher-student');
  await page.goBack();
  await page.getByRole('link', { name: 'Class screen' }).click();
  await page.getByRole('heading', { name: 'Recent wins' }).waitFor();
  if (!(await page.getByText('Walker T').count())) problems.push('the class screen shows no win for the walker');
  await shot(page, 'teacher-screen');
  await page.goto(`${base}#/plans/${only[0]}`);
  await page.locator('[data-plan]').nth(9).waitFor();
  if (!(await page.locator('.code-view').count())) problems.push('lesson plans show no answer code');
  await shot(page, 'teacher-plans');
  await page.goto(`${base}#/standards`);
  await page.getByRole('heading', { name: 'Standards coverage' }).waitFor();
  // Student view: a pretend student who is in no class.
  await page.goto(`${base}#/`);
  await page.locator(`[data-preview="${only[0]}"]`).click();
  await page.getByText('Student view.').waitFor();
  await page.getByRole('button', { name: 'Back to the teacher desk' }).click();
  await page.getByRole('heading', { name: 'Your classes' }).waitFor();
}

try {
  let t = hosted ? await teacher() : { codes: {} };
  for (const g of GRADES.filter((x) => only.includes(x.grade))) { console.log(`Grade ${g.grade}: ${g.name}`); await student(g, t.codes[g.grade]); }
  if (!hosted) t = await teacher();
  await teacherPages(t.page, t.codes);
} catch (e) { problems.push(`stopped: ${e.message.split('\n')[0]}`); }
await browser.close();
if (problems.length) { console.error(`\n${problems.length} problem(s):\n${[...new Set(problems)].slice(0, 30).join('\n')}`); process.exit(1); }
console.log(`\nAll lessons finished in grade${only.length > 1 ? 's' : ''} ${only.join(', ')} with no page errors and no requests to another site.`);
