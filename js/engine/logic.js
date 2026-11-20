// Pure rules behind the click-through labs. No page code, so the tests and the server run the same checks.

/** A repeatable shuffle: the same seed always gives the same order. */
export function shuffle(list, seed = 'x') {
  let n = 2166136261;
  for (const c of String(seed)) n = Math.imul(n ^ c.charCodeAt(0), 16777619) >>> 0;
  const rand = () => { n ^= n << 13; n >>>= 0; n ^= n >>> 17; n ^= n << 5; n >>>= 0; return n / 4294967296; };
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  // A shuffle that changes nothing teaches nothing: turn it by one.
  if (out.length > 1 && out.every((x, i) => x === list[i])) out.push(out.shift());
  return out;
}

const ints = (v, n) => Array.isArray(v) && v.length === n && v.every((x) => Number.isInteger(x));

/**
 * Is this answer to a lab right?
 *   mcq:   the index of the chosen answer
 *   sort:  for each item in lesson order, the index of the bin it was put in
 *   order: the item indexes from top to bottom (the lesson lists them in the right order)
 *   match: for each left-hand item, the index of the right-hand item it was joined to
 */
export function checkLab(lab, answer) {
  if (lab.type === 'mcq') return answer === lab.answer;
  if (lab.type === 'sort') return ints(answer, lab.items.length) && lab.items.every((it, i) => it[1] === answer[i]);
  if (lab.type === 'order') return ints(answer, lab.items.length) && answer.every((x, i) => x === i);
  if (lab.type === 'match') return ints(answer, lab.pairs.length) && answer.every((x, i) => x === i);
  return false;
}

/** The right answer to a lab, in the shape checkLab takes. */
export function labAnswer(lab) {
  if (lab.type === 'mcq') return lab.answer;
  if (lab.type === 'sort') return lab.items.map((it) => it[1]);
  if (lab.type === 'order') return lab.items.map((_, i) => i);
  if (lab.type === 'match') return lab.pairs.map((_, i) => i);
  return null;
}
