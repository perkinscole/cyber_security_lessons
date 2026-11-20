// Runs a lesson program in Node for the tests. The code it runs here is our own (reference
// answers and starters), so Node's built-in vm is enough. Student code on the server goes
// through a separate sealed engine instead: see platform/runner.ts.
import vm from 'node:vm';
import { buildProgram, judge, parseReport } from '../js/engine/program.js';

export function runStep(step, code, ms = 1500) {
  let report;
  try {
    report = parseReport(vm.runInNewContext(buildProgram(step, code), Object.create(null), { timeout: ms }));
  } catch (e) {
    report = { out: [], got: [], error: { name: e?.name || 'Error', message: /timed out/.test(String(e?.message)) ? 'TIMEOUT' : String(e?.message || e), stack: '' } };
  }
  return judge(step, code, report);
}
