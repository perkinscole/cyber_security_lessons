// Runs a code step in the sandbox frame and judges the result.
import { buildProgram, judge, parseReport, codeOffset } from './program.js';

let frame = null, ready = null, seq = 0;
const waiting = new Map();

async function hashOf(text) {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function boot() {
  if (ready) return ready;
  ready = (async () => {
    // The frame's page is written here, not loaded from an address, so the site can keep its rule
    // that no page of its own may be shown inside a frame. The runner script goes inside it as
    // text. The frame's rule names that script's fingerprint and nothing else: no addresses at
    // all, not even this site's. So nothing in the frame, or in a worker it starts, can make a
    // request of any kind.
    const runner = await (await fetch(new URL('./frame.js', import.meta.url))).text();
    if (runner.includes('</scr' + 'ipt')) throw new Error('The code runner could not be loaded.');
    const rule = `default-src 'none'; script-src 'sha256-${await hashOf(runner)}' blob:; worker-src blob:`;
    await start(`<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${rule}"><title>Code runner</title><script>${runner}</scr` + `ipt>`);
  })();
  return ready;
}

function start(page) {
  return new Promise((resolve) => {
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
    frame.srcdoc = page;
    document.body.append(frame);
  });
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
