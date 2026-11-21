// Turns a code step and a student's code into one program, and judges what the program reports.
// No page code here: the browser's sandbox, the tests and the server all use exactly this.
//
// Anything a test expression prints is not shown: the output box holds only what the student's own run printed.
//
// The program has three parts: a small prelude (say() and the result box), the step's hidden setup
// plus the student's code, and one function for each test. It never decides whether the student
// passed. It only reports what was printed and what each test expression gave; judge() compares
// those with the answers outside the sandbox, where student code cannot reach.

export const MAX_CODE = 6000;
export const MAX_OUT = 120;

// One line, so a line number in an error is easy to map back to the student's code.
const PRELUDE = 'const __cc=(function(){var out=[],J=JSON.stringify,S=String,F=Object.freeze,cut=function(t){return t.length>300?t.slice(0,300)+"...":t};'
  + 'function show(v){if(typeof v==="string")return v;if(typeof v==="function")return "[function]";if(v===undefined)return "undefined";try{var t=J(v);return t===undefined?S(v):t}catch(e){return S(v)}}'
  + 'function say(){var t="";for(var i=0;i<arguments.length;i++)t+=(i?" ":"")+show(arguments[i]);if(!quiet&&out.length<' + MAX_OUT + ')out[out.length]=cut(t)}'
  + 'var got=[],err=null,quiet=false;'
  + 'function fail(e){var m=e&&e.message!==undefined?S(e.message):S(e),n=e&&e.name?S(e.name):"Error",k=e&&e.stack?S(e.stack):"";err={name:n,message:cut(m),stack:k.slice(0,600)}}'
  + 'function tests(list){quiet=true;for(var i=0;i<list.length;i++){try{var v=list[i]();got[i]=v===undefined?{u:1}:typeof v==="function"?{f:1}:{v:v}}catch(e){got[i]={e:cut(S(e&&e.message!==undefined?e.message:e))}}}}'
  + 'function finish(){var r;try{r=J({out:out,got:got,error:err})}catch(e){r=J({out:out,got:[],error:{name:"Error",message:"A test gave back something that cannot be checked.",stack:""}})}return r}'
  + 'return F({say:say,fail:fail,tests:tests,finish:finish})})();const say=__cc.say;const console=Object.freeze({log:say,info:say,warn:say,error:say});';

/** How many lines sit above the student's first line. */
export function codeOffset(step) {
  return 2 + (step.setup ? step.setup.split('\n').length : 0);
}

/** The tests that run code. Each has a `run` expression. */
export const runTests = (step) => (step.tests || []).filter((t) => t.run !== undefined);

/** Source for one whole run. Its last expression is a JSON string: { out, got, error }. */
export function buildProgram(step, code) {
  const lines = [PRELUDE, 'try {'];
  if (step.setup) lines.push(step.setup);
  lines.push(String(code));
  lines.push(`;__cc.tests([${runTests(step).map((t) => `function(){return (${t.run}\n)}`).join(',')}]);`);
  lines.push('} catch (__e) { __cc.fail(__e) }');
  lines.push('var __result = __cc.finish(); __result;');
  return lines.join('\n');
}

const isObj = (v) => v !== null && typeof v === 'object';
export function same(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 1e-9;
  if (!isObj(a) || !isObj(b)) return a === b;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => Object.hasOwn(b, k) && same(a[k], b[k]));
}

const brief = (v) => { const t = typeof v === 'string' ? `"${v}"` : JSON.stringify(v); return t.length > 80 ? `${t.slice(0, 80)}…` : t; };
const strip = (code) => String(code).replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');
const norm = (t) => String(t).trim().replace(/\s+/g, ' ').toLowerCase();

/** The sentence a student reads for one test. */
export function labelOf(t) {
  if (t.label) return t.label;
  if (t.run !== undefined) return `${t.run} gives ${brief(t.want)}`;
  if (t.says !== undefined) return `It says: ${t.says}`;
  if (t.out) return 'The output matches';
  if (t.uses) return `Your code uses ${t.uses}`;
  if (t.avoids) return `Your code does not use ${t.avoids}`;
  return 'Check';
}

/**
 * Compare a run's report with the step's answers.
 * result: the parsed { out, got, error } from the program, or { error } if it never finished.
 */
export function judge(step, code, result) {
  const out = Array.isArray(result?.out) ? result.out.map(String) : [];
  const got = Array.isArray(result?.got) ? result.got : [];
  const error = result?.error || null;
  const src = strip(code);
  let at = 0;
  const tests = (step.tests || []).map((t) => {
    const label = labelOf(t);
    if (t.run !== undefined) {
      const g = got[at++];
      if (!g) return { label, ok: false, got: '' };
      if (g.e !== undefined) return { label, ok: false, got: `Error: ${g.e}` };
      if (g.u) return { label, ok: false, got: 'nothing (undefined). Did you forget return?' };
      if (g.f) return { label, ok: false, got: 'a function. Did you forget the ( ) to call it?' };
      // With a label written in plain words, the raw value would only confuse ("yours gave false").
      return { label, ok: same(g.v, t.want), got: t.label ? '' : brief(g.v) };
    }
    if (t.says !== undefined) return { label, ok: out.some((l) => norm(l) === norm(t.says) || (t.loose && norm(l).includes(norm(t.says)))), got: '' };
    if (t.out) return { label, ok: out.length === t.out.length && t.out.every((l, i) => norm(l) === norm(out[i])), got: '' };
    if (t.uses) return { label, ok: src.includes(t.uses), got: '' };
    if (t.avoids) return { label, ok: !src.includes(t.avoids), got: '' };
    return { label, ok: false, got: '' };
  });
  if (/___/.test(src)) return { passed: false, tests: tests.map((t) => ({ ...t, ok: false, got: '' })), out, error: { name: 'Blank', message: 'There is still a ___ blank to fill in.', stack: '', line: 1 + src.split('\n').findIndex((l) => l.includes('___')) } };
  return { passed: !error && tests.length > 0 && tests.every((t) => t.ok), tests, out, error };
}

/** Read what a sandbox gave back. Anything that is not the program's own report counts as an error. */
export function parseReport(text) {
  try {
    const r = JSON.parse(text);
    if (r && Array.isArray(r.out) && Array.isArray(r.got)) return r;
  } catch (_) { /* fall through */ }
  return { out: [], got: [], error: { name: 'Error', message: 'The code did not finish.', stack: '' } };
}
