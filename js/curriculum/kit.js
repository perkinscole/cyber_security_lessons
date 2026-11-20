// Short helpers that keep the lesson files readable.

/** A quick-check question. The right answer is not here: it lives in answers/, which is never sent to a student. */
export const q = (id, text, choices) => ({ id, q: text, choices });

/** A click-through lab step. */
export const lab = (id, say, spec, more = '') => ({ id, say, more, lab: spec });

/** A code step. `starter` is what the student sees first; `tests` decide when it is done. */
export const code = (id, say, spec) => ({ id, say, more: spec.more || '', hint: spec.hint, setup: spec.setup || '', starter: spec.starter, tests: spec.tests });
