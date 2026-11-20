// The hands-on parts of a step: the code editor, and four kinds of click-through lab.
import { h, add, clear, rich } from '../ui.js';
import { sound } from '../fx.js';
import { shuffle } from '../engine/logic.js';
import { explain } from '../engine/explain.js';
import { mentionsSecrets } from '../curriculum/index.js';

/**
 * The code editor for one step.
 *   code:    what to show first (the student's saved code, or the starter)
 *   onRun:   async (code) => { ok, result }   runs and checks the code
 *   onDraft: (code) => void                   called a moment after typing stops
 */
export function mountCode(root, step, { code, onRun, onDraft }) {
  const area = h('textarea', { spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', 'aria-label': 'Your code', 'data-editor': step.id });
  const gutter = h('div.gutter', { 'aria-hidden': 'true' });
  const out = h('pre.out', { 'aria-live': 'polite', 'data-out': step.id }, h('span.dim', 'Press Run to see what your code does.'));
  const tests = h('ul.tests');
  const errorBox = h('div');
  let errLine = 0;
  const draw = () => {
    const n = area.value.split('\n').length;
    area.rows = Math.max(6, Math.min(30, n + 1));
    clear(gutter);
    for (let i = 1; i <= n; i++) gutter.append(h(`div${i === errLine ? '.err' : ''}`, String(i)));
  };
  let timer = null;
  area.value = code;
  area.addEventListener('input', () => { errLine = 0; draw(); clearTimeout(timer); timer = setTimeout(() => onDraft?.(area.value), 1500); });
  area.addEventListener('keydown', (e) => {
    // Tab indents. Esc then Tab leaves the editor, so keyboard users are never trapped.
    if (e.key === 'Escape') { area.dataset.leave = '1'; return; }
    if (e.key === 'Tab' && !area.dataset.leave && !e.shiftKey) { e.preventDefault(); area.setRangeText('  ', area.selectionStart, area.selectionEnd, 'end'); area.dispatchEvent(new Event('input')); }
    else if (e.key === 'Enter') {
      const before = area.value.slice(0, area.selectionStart);
      const line = before.slice(before.lastIndexOf('\n') + 1);
      const indent = line.match(/^\s*/)[0] + (/[{([]\s*$/.test(line) ? '  ' : '');
      e.preventDefault(); area.setRangeText(`\n${indent}`, area.selectionStart, area.selectionEnd, 'end'); area.dispatchEvent(new Event('input'));
    }
    delete area.dataset.leave;
  });
  const runBtn = h('button.btn.primary', { 'data-run': step.id, onclick: run }, 'Run it');
  async function run() {
    runBtn.classList.add('wait'); runBtn.textContent = 'Running…';
    clearTimeout(timer);
    let res;
    try { res = await onRun(area.value); } finally { runBtn.classList.remove('wait'); runBtn.textContent = 'Run it'; }
    if (!res) return;
    const r = res.result;
    clear(out);
    if (r.out.length) out.textContent = r.out.join('\n'); else out.append(h('span.dim', 'Your code did not print anything.'));
    clear(errorBox);
    const ex = explain(r.error);
    errLine = ex?.line || 0;
    if (ex) add(errorBox, h('div.badbox', { role: 'alert' }, h('strong', errLine ? `Look at line ${errLine}. ` : 'Something stopped the code. '), ex.text, ex.raw && ex.raw !== 'TIMEOUT' && !/blank/.test(ex.raw) ? h('div.small.muted.mono', `The computer said: ${ex.raw}`) : null));
    draw();
    clear(tests);
    for (const t of r.tests) tests.append(h(`li.${t.ok ? 'ok' : 'no'}`, h('span.mark', t.ok ? '✓' : '✗'), h('span', t.label, !t.ok && t.got && !r.error ? h('span.muted', ` (yours gave ${t.got})`) : null)));
    (res.ok ? sound.good : sound.buzz)();
  }
  draw();
  add(root,
    mentionsSecrets(step) && h('div.note.small', 'Everything here is pretend. Use made-up passwords only. ', h('strong', 'Never type a real password'), ', yours or anyone else\'s.'),
    h('div.term.scan', h('div.term-bar', h('span', `STEP-${step.id.toUpperCase()}.JS`), h('button.btn.small', { onclick: () => { area.value = step.starter; area.dispatchEvent(new Event('input')); } }, 'Start over')), h('div.editor', gutter, area)),
    h('div.row', runBtn, h('span.muted.small', 'Tab indents. To leave the box with the keyboard, press Esc and then Tab.')),
    errorBox,
    h('div.term', h('div.term-bar', 'OUTPUT'), out),
    tests);
  return { run, value: () => area.value };
}

/** A click-through lab. onDone(answer) is called once the student has it right. */
export function mountLab(root, lab, { seed = '', onDone }) {
  const box = h('div.lab');
  add(root, box);
  if (lab.type === 'mcq') {
    const why = h('div');
    const order = shuffle(lab.choices.map((_, i) => i), `${seed}m`);
    add(box, h('div.choices', order.map((i) => h('button.btn.choice', { onclick: (e) => {
      if (i === lab.answer) { e.currentTarget.classList.add('right'); sound.good(); clear(why).append(h('div.okbox', lab.why)); onDone(i); } else { e.currentTarget.classList.add('wrong'); sound.buzz(); clear(why).append(h('div.badbox', 'Not that one. Try another.')); }
    } }, lab.choices[i]))), why);
  }
  if (lab.type === 'sort') {
    const order = shuffle(lab.items.map((_, i) => i), `${seed}s`);
    const answer = [];
    let at = 0;
    const card = h('div.sort-card'), note = h('div.small.muted'), bins = h('div.bins');
    const show = () => {
      if (at >= order.length) { card.textContent = 'All sorted!'; clear(bins); onDone(answer); return; }
      card.textContent = lab.items[order[at]][0];
      note.textContent = `${at + 1} of ${order.length}`;
    };
    lab.bins.forEach((name, b) => bins.append(h('button.btn.bin-btn', { onclick: () => {
      const i = order[at];
      if (lab.items[i][1] === b) { answer[i] = b; at++; sound.tick(); show(); } else { sound.buzz(); note.textContent = 'Not there. Think again.'; }
    } }, name)));
    add(box, card, note, bins);
    show();
  }
  if (lab.type === 'order') {
    let order = shuffle(lab.items.map((_, i) => i), `${seed}o`);
    const list = h('div.stack.tight'), note = h('div');
    const draw = () => add(clear(list), order.map((i, at) => h('div.order-item',
      h('span.order-text', lab.items[i]),
      h('button.btn.small.up', { 'aria-label': 'Move up', onclick: () => { if (at > 0) { [order[at - 1], order[at]] = [order[at], order[at - 1]]; sound.tick(); draw(); } } }, '▲'),
      h('button.btn.small.down', { 'aria-label': 'Move down', onclick: () => { if (at < order.length - 1) { [order[at + 1], order[at]] = [order[at], order[at + 1]]; sound.tick(); draw(); } } }, '▼'))));
    add(box, list, h('div.row', h('button.btn.primary', { onclick: () => {
      if (order.every((x, i) => x === i)) { sound.good(); clear(note).append(h('div.okbox', 'That is the right order.')); onDone(order.slice()); } else { sound.buzz(); const good = order.findIndex((x, i) => x !== i); clear(note).append(h('div.badbox', good > 0 ? `The first ${good} ${good === 1 ? 'is' : 'are'} right. Keep going.` : 'Not yet. Which one comes first?')); }
    } }, 'Check the order')), note);
    draw();
  }
  if (lab.type === 'match') {
    const right = shuffle(lab.pairs.map((_, i) => i), `${seed}p`);
    const done = new Set();
    let picked = null;
    const note = h('div.small.muted', 'Pick one on the left, then its match on the right.');
    const left = h('div.match-col'), rightCol = h('div.match-col');
    const draw = () => {
      add(clear(left), lab.pairs.map((p, i) => h(`button.btn.match-btn${done.has(i) ? '.done' : ''}`, { 'aria-pressed': picked === i ? 'true' : 'false', onclick: () => { if (!done.has(i)) { picked = i; draw(); } } }, p[0])));
      add(clear(rightCol), right.map((i) => h(`button.btn.match-btn${done.has(i) ? '.done' : ''}`, { onclick: () => {
        if (done.has(i) || picked === null) return;
        if (picked === i) { done.add(i); picked = null; sound.tick(); note.textContent = `${done.size} of ${lab.pairs.length} matched.`; draw(); if (done.size === lab.pairs.length) { sound.good(); onDone(lab.pairs.map((_, k) => k)); } } else { sound.buzz(); note.textContent = 'Those two do not go together.'; }
      } }, lab.pairs[i][1])));
    };
    add(box, note, h('div.match-cols', left, rightCol));
    draw();
  }
  return box;
}

export { rich };
