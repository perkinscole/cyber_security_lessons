// Runs a student's code on the server, to check a step without trusting the browser.
//
// Three walls stand between that code and the server:
//   1. It never runs in Node. It runs inside QuickJS, a small separate JavaScript engine compiled
//      to WebAssembly. That engine has no files, no network, no timers and no way to reach the
//      server's memory. The only thing that goes in is the program's text, and the only thing
//      that comes out is one string.
//   2. Each run gets a brand-new engine with a memory limit and a time limit of its own.
//   3. The engine lives on a separate thread (cipher-city-worker.mjs). If a run is still going
//      after the hard limit, the whole thread is stopped and a fresh one is started. So student
//      code can never hold up anyone else's requests, whatever it does.
// Runs wait in a line and go one at a time.
import { Worker } from 'node:worker_threads';

/** How long a student's program may run. Reference answers take a few thousandths of a second. */
export const RUN_MS = 400;
/** If the engine's own limit has not stopped a run by now, the thread is stopped instead. */
const HARD_MS = RUN_MS + 600;
const START_MS = 15_000;

const failed = (name: string, message: string) => JSON.stringify({ out: [], got: [], error: { name, message, stack: '' } });
type Waiting = { resolve: (text: string) => void; timer: NodeJS.Timeout };

let worker: Worker | null = null;
let ready: Promise<void> | null = null;
let seq = 0;
const waiting = new Map<number, Waiting>();
let line: Promise<unknown> = Promise.resolve();

function stop(): void {
  const old = worker;
  worker = null; ready = null;
  for (const w of waiting.values()) { clearTimeout(w.timer); w.resolve(failed('Timeout', 'TIMEOUT')); }
  waiting.clear();
  void old?.terminate();
}

function start(): Promise<void> {
  if (ready) return ready;
  const w = new Worker(new URL('./cipher-city-worker.mjs', import.meta.url), { resourceLimits: { maxOldGenerationSizeMb: 96, stackSizeMb: 4 } });
  worker = w;
  ready = new Promise<void>((resolve, reject) => {
    const slow = setTimeout(() => reject(new Error('The code checker did not start.')), START_MS);
    w.on('message', (m: { ready?: boolean; id?: number; text?: string }) => {
      if (m.ready) { clearTimeout(slow); resolve(); return; }
      const hit = typeof m.id === 'number' ? waiting.get(m.id) : undefined;
      if (hit) { clearTimeout(hit.timer); waiting.delete(m.id!); hit.resolve(String(m.text)); }
    });
    w.on('error', () => { clearTimeout(slow); if (worker === w) stop(); reject(new Error('The code checker stopped.')); });
    w.on('exit', () => { if (worker === w) stop(); });
    // The thread must never keep the server (or a test run) alive on its own. This has to come
    // after the listeners above: adding one makes Node wait for the thread again.
    w.unref();
  });
  ready.catch(() => { if (worker === w) stop(); });
  return ready;
}

async function runOne(program: string, ms: number): Promise<string> {
  await start();
  const id = ++seq;
  return new Promise<string>((resolve) => {
    const timer = setTimeout(() => { if (waiting.has(id)) stop(); }, ms + (HARD_MS - RUN_MS));
    waiting.set(id, { resolve, timer });
    worker!.postMessage({ id, program, ms });
  });
}

/** Run a lesson program (see buildProgram) and give back its report as text. Never throws for anything the code does. */
export function runSealed(program: string, ms: number = RUN_MS): Promise<string> {
  const next = line.then(() => runOne(program, ms)).catch(() => failed('Error', 'The code checker is busy. Try again in a moment.'));
  line = next;
  return next;
}

/** Stop the thread. For tests and for shutting down. */
export function stopRunner(): void { stop(); }
