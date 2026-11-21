// Browser check of the sandbox: student code cannot reach the network, the page around it, or
// anything saved in the browser. Every way out is tried from inside real student code, and the
// browser's own request log must stay empty.
//
//   node e2e/sandbox.mjs                         starts its own copy of the local server
//   node e2e/sandbox.mjs http://localhost:8080/cipher-city/     checks a running site
import { createRequire } from 'node:module';
import { serve } from '../tools/serve.mjs';

const { chromium } = createRequire(import.meta.url)('playwright');
let server = null;
let base = process.argv[2];
if (!base) { server = await serve(8765); base = 'http://localhost:8765/'; }
base = base.replace(/\/?$/, '/');
const origin = new URL(base).origin;
const browser = await chromium.launch();
const page = await browser.newPage();
// What counts is a request that got an answer: the browser lists an attempt it blocked too, but a
// blocked attempt never leaves the computer. Every target below is on this site, so it would answer.
const requests = [];
page.on('response', (r) => requests.push(r.url()));
await page.goto(base);
await page.waitForLoadState('networkidle');
// Everything from here on is the sandbox's doing. It may load its one runner script, and nothing else.
const before = requests.length;

// Each line is one way student code might try to get out. It must end up as the word after "=>".
const ATTEMPTS = [
  ['typeof fetch', 'undefined'], ['typeof XMLHttpRequest', 'undefined'], ['typeof WebSocket', 'undefined'], ['typeof EventSource', 'undefined'],
  ['typeof importScripts', 'undefined'], ['typeof Worker', 'undefined'], ['typeof indexedDB', 'undefined'], ['typeof caches', 'undefined'],
  ['typeof document', 'undefined'], ['typeof window', 'undefined'], ['typeof localStorage', 'undefined'], ['typeof parent', 'undefined'], ['typeof top', 'undefined'],
  // Building new code from text is refused by the frame's rule, so removed tools cannot be fetched back that way.
  ['(function () { try { return typeof Function("return fetch")(); } catch (e) { return "blocked"; } })()', 'blocked'],
  ['(function () { try { return typeof self.constructor.constructor("return XMLHttpRequest")(); } catch (e) { return "blocked"; } })()', 'blocked'],
  ['(function () { try { return typeof (0, eval)("fetch"); } catch (e) { return "blocked"; } })()', 'blocked'],
  ['(function () { try { return navigator.sendBeacon ? "open" : "blocked"; } catch (e) { return "blocked"; } })()', 'blocked'],
  // Its origin is a throwaway one of its own, not the site's: no cookies, no saved data, no sign-in.
  ['self.origin', 'null'],
];
const code = `
var leaks = [];
try { importScripts("${origin}/leak-importscripts.js"); leaks.push("importScripts"); } catch (e) {}
try { new Image().src = "${origin}/leak-image.png"; leaks.push("image"); } catch (e) {}
try { fetch("${origin}/api/rpc", { method: "POST", body: "{}" }); leaks.push("fetch"); } catch (e) {}
try { var x = new XMLHttpRequest(); x.open("GET", "${origin}/leak-xhr"); x.send(); leaks.push("xhr"); } catch (e) {}
try { new WebSocket("ws://localhost:1/leak-ws"); leaks.push("websocket"); } catch (e) {}
try { navigator.sendBeacon("${origin}/leak-beacon", "x"); leaks.push("beacon"); } catch (e) {}
try { new Worker("${origin}/leak-worker.js"); leaks.push("worker"); } catch (e) {}
try { self.location = "${origin}/leak-location"; } catch (e) {}
try { self.location.href = "https://outside.example/leak"; } catch (e) {}
try { import("${origin}/leak-import.js").catch(function () {}); } catch (e) {}
try { import("${base}js/engine/frame.js?leak=1").catch(function () {}); } catch (e) {}
`;
const result = await page.evaluate(async ({ code, attempts }) => {
  const { runStep } = await import(new URL('js/engine/sandbox.js', document.baseURI).href);
  const step = { tests: [{ run: 'leaks', want: [] }, ...attempts.map(([run, want]) => ({ run, want }))] };
  const out = await runStep(step, code);
  // A second run still works, and one run cannot see what an earlier one left behind.
  const again = await runStep({ tests: [{ run: 'typeof leaks', want: 'undefined' }] }, 'say("fresh")');
  // An endless loop is stopped, and the page stays usable.
  const stuck = await runStep({ tests: [{ run: '1', want: 1 }] }, 'while (true) {}', 700);
  const after = await runStep({ tests: [{ run: '1 + 1', want: 2 }] }, '');
  return { out, again, stuck, after };
}, { code, attempts: ATTEMPTS });
await page.waitForTimeout(800);

const problems = [];
for (const t of result.out.tests) if (!t.ok) problems.push(`a way out was open: ${t.label} (got ${t.got})`);
if (!result.again.passed) problems.push('a second run could see the first run');
if (result.stuck.error?.message !== 'TIMEOUT') problems.push('an endless loop was not stopped');
if (!result.after.passed) problems.push('the sandbox did not recover after an endless loop');
const allowed = (u) => u.startsWith('blob:') || /\/js\/engine\/(sandbox|program|frame)\.js$/.test(u);
for (const u of requests.slice(before)) if (!allowed(u)) problems.push(`a request left the sandbox: ${u}`);
const frames = page.frames().filter((f) => f !== page.mainFrame());
if (frames.length !== 1) problems.push(`expected one sandbox frame, found ${frames.length}`);
const sandboxAttr = await page.locator('iframe').getAttribute('sandbox');
if (sandboxAttr !== 'allow-scripts') problems.push(`the frame's sandbox setting is "${sandboxAttr}", expected only allow-scripts`);

await browser.close();
server?.close();
if (problems.length) { console.error(`${problems.length} problem(s):\n${problems.join('\n')}`); process.exit(1); }
console.log(`The sandbox held: ${ATTEMPTS.length + 10} ways out tried, none worked, and no request left the page.`);
