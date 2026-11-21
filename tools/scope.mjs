// Writes docs/CURRICULUM.md from the lesson files:  node tools/scope.mjs
import { writeFile } from 'node:fs/promises';
import { GRADES, coverage, isCode } from '../js/curriculum/index.js';

const lines = ['# Scope and sequence', '', 'Written by `node tools/scope.mjs` from the lesson files. Do not edit by hand.', '',
  'Standards are from the Massachusetts Digital Literacy and Computer Science framework (2016), grades 6 to 8, quoted word for word. All three grades share one set of standards, so the courses spiral: grade 6 keeps yourself safe, grade 7 explains how attacks and defences work, grade 8 designs and tests defences. Each grade stands alone.', '',
  'Every lesson has a mission, build steps, a four-question quick check and a written reflection, and is planned for one 40 to 50 minute period. "Code" is the number of build steps where the student writes or changes code; the rest are click-through labs. Every target in every lesson is pretend and lives inside the lesson.', ''];
for (const g of GRADES) {
  lines.push(`## Grade ${g.grade}: ${g.name}`, '', g.blurb, '', '| # | Lesson | Question of the day | Students can say | Code | Career | Standards |', '| --- | --- | --- | --- | --- | --- | --- |');
  g.lessons.forEach((l, i) => lines.push(`| ${i + 1} | ${l.title}${l.project ? ' **(project)**' : ''} | ${l.question} | ${l.goal} | ${l.steps.filter(isCode).length} of ${l.steps.length} | ${l.job[0]} | ${l.standards.join(', ')} |`));
  lines.push('', '| Standard | Text | Lessons |', '| --- | --- | --- |');
  for (const r of coverage(g.grade)) lines.push(`| ${r.code} | ${r.text} | ${r.lessons.join(', ')} |`);
  lines.push('');
}
await writeFile(new URL('../docs/CURRICULUM.md', import.meta.url), lines.join('\n'));
console.log('Wrote docs/CURRICULUM.md');
