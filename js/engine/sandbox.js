// Runs a code step in the sandbox frame and judges the result.
import { buildProgram, judge, parseReport, codeOffset } from './program.js';

let frame = null, ready = null, seq = 0;
const waiting = new Map();

function boot() {
  if (ready) return ready;
  ready = new Promise((resolve) => {
    window.addEventListener('message', (e) => {
      if (!frame || e.source !== frame.contentWindow || !e.data) return;
      if (e.data.cc === 'ready') resolve();
      if (e.data.cc === 'ran') { waiting.get(e.data.id)?.(String(e.data.text)); waiting.delete(e.data.id); }
    });
    frame = document.createElement('iframe');
    // allow-scripts only: the frame gets an origin of its own, so it cannot read this page, its cookies or its saved data.
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.setAttribute('aria-hidden', 'true');
    frame.setAttribute('tabindex', '-1');
    frame.title = 'Code runner';
    frame.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden';
    frame.src = new URL('../../sandbox.html', import.meta.url).href;
    document.body.append(frame);
  });
  return ready;
}

/** The line of the student's code an error points at, or 0 if it cannot be told. */
function lineOf(step, error) {
  let line = Number(error.line) || 0;
  if (!line) { const m = String(error.stack || '').match(/:(\d+):\d+\)?\s*(\n|$)/); if (m) line = Number(m[1]); }
  line -= codeOffset(step);
  return line > 0 ? line : 0;
}

/** Run a step with this code. Gives { passed, tests, out, error } where error has a line in the student's code. */
export async function runStep(step, code, ms = 2000) {
  await boot();
  const id = ++seq;
  const text = await new Promise((resolve) => {
    waiting.set(id, resolve);
    frame.contentWindow.postMessage({ cc: 'run', id, program: buildProgram(step, code), ms }, '*');
    // If the frame itself has gone quiet, do not leave the student waiting.
    setTimeout(() => { if (waiting.delete(id)) resolve(JSON.stringify({ out: [], got: [], error: { name: 'Timeout', message: 'TIMEOUT', stack: '' } })); }, ms + 1500);
  });
  const result = judge(step, code, parseReport(text));
  if (result.error && result.error.name !== 'Blank') result.error.line = Math.min(lineOf(step, result.error), String(code).split('\n').length);
  return result;
}
