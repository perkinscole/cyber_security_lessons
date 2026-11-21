// The thread that runs student code. See cipher-city-runner.ts for why and how it is sealed.
// It receives a program's text, runs it inside QuickJS (a separate JavaScript engine compiled to
// WebAssembly, with no files, network or timers), and sends back one string.
import { parentPort } from 'node:worker_threads';
import { getQuickJS, shouldInterruptAfterDeadline } from 'quickjs-emscripten';

const MEMORY_BYTES = 16 * 1024 * 1024;
const STACK_BYTES = 256 * 1024;
const failed = (name, message) => JSON.stringify({ out: [], got: [], error: { name, message, stack: '' } });
const quickjs = await getQuickJS();

function run(program, ms) {
  const runtime = quickjs.newRuntime();
  runtime.setMemoryLimit(MEMORY_BYTES);
  runtime.setMaxStackSize(STACK_BYTES);
  const deadline = Date.now() + ms;
  runtime.setInterruptHandler(shouldInterruptAfterDeadline(deadline));
  const vm = runtime.newContext();
  try {
    const result = vm.evalCode(program, 'lesson.js');
    if (result.error) {
      const e = vm.dump(result.error);
      result.error.dispose();
      if (Date.now() >= deadline) return failed('Timeout', 'TIMEOUT');
      const isObj = e && typeof e === 'object';
      return failed(isObj && typeof e.name === 'string' ? e.name : 'Error', String(isObj && typeof e.message === 'string' ? e.message : e).slice(0, 300));
    }
    const value = vm.dump(result.value);
    result.value.dispose();
    return typeof value === 'string' ? value : failed('Error', 'The code did not finish.');
  } catch (_) {
    // The engine itself gave up (out of memory, say). Treat it as a failed run.
    return failed('Error', 'The code used too much memory or could not be run.');
  } finally {
    try { vm.dispose(); runtime.dispose(); } catch (_) { /* a run that broke the engine's own bookkeeping is still thrown away */ }
  }
}

parentPort.on('message', ({ id, program, ms }) => parentPort.postMessage({ id, text: run(String(program), Number(ms) || 400) }));
parentPort.postMessage({ ready: true });
