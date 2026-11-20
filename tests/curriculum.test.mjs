// Every lesson is complete, short enough, safe, and can be solved: its reference answer passes
// its own tests and its starter code does not.
import test from 'node:test';
import assert from 'node:assert/strict';
import { GRADES, ALL, problems, unsafeText, coverage } from '../js/curriculum/index.js';
import { KEYS } from '../answers/index.js';
import { runStep } from '../tools/vmrun.mjs';

const want = Number(process.env.LESSONS_PER_GRADE || 10);

for (const g of GRADES) {
  test(`grade ${g.grade} has ${want} lessons, in order, with no gaps`, () => {
    assert.deepEqual(g.lessons.map((l) => l.id), Array.from({ length: want }, (_, i) => `g${g.grade}-${String(i + 1).padStart(2, '0')}`));
  });
  for (const lesson of g.lessons) {
    test(`${lesson.id} ${lesson.title}`, () => assert.deepEqual(problems(lesson, KEYS[lesson.id], runStep), []));
  }
  test(`grade ${g.grade} has projects and names its standards`, () => {
    if (g.lessons.length < 10) return;
    assert.ok(g.lessons.filter((l) => l.project).length >= 2, 'at least two projects');
    assert.ok(g.lessons[9].project, 'the last lesson is a project');
    assert.ok(coverage(g.grade).length >= 5);
  });
}

test('every answer belongs to a lesson', () => {
  const ids = new Set(ALL.map((l) => l.id));
  for (const id of Object.keys(KEYS)) assert.ok(ids.has(id), `${id} has answers but no lesson`);
});

test('lesson files carry no quick-check answers', async () => {
  const { readFile } = await import('node:fs/promises');
  for (const g of [6, 7, 8]) {
    const text = await readFile(new URL(`../js/curriculum/grade${g}.js`, import.meta.url), 'utf8');
    assert.ok(!/answers\//.test(text.replace(/\/\/[^\n]*/g, '')), `grade${g}.js must not import from answers/`);
  }
});

test('the safety check catches real addresses and network code', () => {
  assert.equal(unsafeText('Visit http://shop.example/login or mail sam@school.test from 10.0.0.5').length, 0);
  assert.ok(unsafeText('http://google.com').length);
  assert.ok(unsafeText('sam@gmail.com').length);
  assert.ok(unsafeText('8.8.8.8').length);
  assert.ok(unsafeText('fetch("/x")').length);
  assert.ok(unsafeText('new WebSocket(u)').length);
});
