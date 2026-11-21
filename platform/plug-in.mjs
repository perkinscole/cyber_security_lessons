// Puts Cipher City into a Ready4AI checkout:  node platform/plug-in.mjs /path/to/Ready4AI
//
// It adds files and makes five small edits. Run it again any time to bring the copy up to date.
//
// Added (nothing existing is replaced):
//   courses/cipher-city/                          the pages, lessons, answers and the course's own tests
//   server/src/courses/cipher-city.ts             the course's requests
//   server/src/courses/cipher-city-runner.ts      the sealed engine that reruns student code,
//   server/src/courses/cipher-city-worker.mjs     and the separate thread it runs on
//   server/sql/011_cipher_city.sql                the course's own tables (cc_*)
//   server/test/cipher-city.test.ts               tests against a real database
// Edited, one or two lines each:
//   server/src/courses/names.ts                   the course's name
//   server/src/courses/index.ts                   the course's module
//   server/src/http.ts                            serve the pages, with their browser rule
//   package.json                                  one package (quickjs-emscripten), and the course's tests
//   .github/workflows/ci.yml                      the browser check that finishes all 30 lessons
import { cp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = process.argv[2] && path.resolve(process.argv[2]);
if (!target) { console.error('Say where Ready4AI is:  node platform/plug-in.mjs /path/to/Ready4AI'); process.exit(1); }
const at = (...p) => path.join(target, ...p);
const read = (...p) => readFile(at(...p), 'utf8');

// 1. The course folder.
const dest = at('courses', 'cipher-city');
await rm(dest, { recursive: true, force: true });
await mkdir(dest, { recursive: true });
for (const dir of ['js', 'css', 'answers', 'tests', 'tools', 'e2e', 'docs']) await cp(path.join(HERE, dir), path.join(dest, dir), { recursive: true });
// On the platform the page uses the hosted store: the server keeps the work and checks it.
const index = (await readFile(path.join(HERE, 'index.html'), 'utf8')).replace('<meta name="cc-store" content="local">', '<meta name="cc-store" content="hosted">');
if (!index.includes('content="hosted"')) throw new Error('index.html has no cc-store line to switch.');
await writeFile(path.join(dest, 'index.html'), index);
let commit = 'unknown';
try { commit = execFileSync('git', ['-C', HERE, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim(); } catch (_) { /* not a git checkout */ }
await writeFile(path.join(dest, 'UPSTREAM.md'), `# Where this folder comes from\n\nCopied from \`perkinscole/cyber_security_lessons\` at commit \`${commit}\` by \`platform/plug-in.mjs\` in that repository.\n\nDo not edit lessons here. Change them there, run its tests, and run the plug-in again.\n\nOnly \`index.html\`, \`js/\` and \`css/\` are served. \`answers/\` is read by the server and is never sent to a browser.\n`);

// 2. The server files.
await cp(path.join(HERE, 'platform', 'cipher-city.ts'), at('server', 'src', 'courses', 'cipher-city.ts'));
await cp(path.join(HERE, 'platform', 'cipher-city-runner.ts'), at('server', 'src', 'courses', 'cipher-city-runner.ts'));
await cp(path.join(HERE, 'platform', 'cipher-city-worker.mjs'), at('server', 'src', 'courses', 'cipher-city-worker.mjs'));
await cp(path.join(HERE, 'platform', '011_cipher_city.sql'), at('server', 'sql', '011_cipher_city.sql'));
await cp(path.join(HERE, 'platform', 'cipher-city.test.ts'), at('server', 'test', 'cipher-city.test.ts'));

// 3. The small edits. Each is skipped if it is already there, and stops with a message if its anchor has moved.
async function edit(file, has, find, put) {
  const text = await read(...file);
  if (text.includes(has)) return;
  if (!text.includes(find)) throw new Error(`${file.join('/')} has changed: could not find "${find}". Make this edit by hand.`);
  await writeFile(at(...file), text.replace(find, put));
}
await edit(['server', 'src', 'courses', 'names.ts'], "'cipher-city'", "  'maker-lab': 'Maker Lab',\n", "  'maker-lab': 'Maker Lab',\n  'cipher-city': 'Cipher City',\n");
await edit(['server', 'src', 'courses', 'index.ts'], './cipher-city.ts', "import { makerLab } from './maker-lab.ts';\n", "import { makerLab } from './maker-lab.ts';\nimport { cipherCity } from './cipher-city.ts';\n");
await edit(['server', 'src', 'courses', 'index.ts'], '[cipherCity.id]', '[makerLab.id]: makerLab }', '[makerLab.id]: makerLab, [cipherCity.id]: cipherCity }');
await edit(['server', 'src', 'http.ts'], "'cipher-city': {", "  'maker-lab': { dir: path.join(ROOT, 'courses', 'maker-lab'), served: ['static'], csp: '' },\n",
  "  'maker-lab': { dir: path.join(ROOT, 'courses', 'maker-lab'), served: ['static'], csp: '' },\n"
  + "  // Cipher City. Its answers folder is read by the server and is not in this list, so it is never sent to a browser.\n"
  + "  'cipher-city': { dir: path.join(ROOT, 'courses', 'cipher-city'), served: ['index.html', 'js', 'css'], csp: '' },\n");
await edit(['server', 'src', 'http.ts'], "COURSES['cipher-city']!.csp", '\n/** The visitor\'s address.',
  "// Cipher City runs student code in a worker inside a locked-down frame (see its js/engine/sandbox.js).\n"
  + "// Its pages load only this site's own files: no eval, nothing from anywhere else, and no inline script\n"
  + "// except one, named by its exact fingerprint: the frame's runner, which is written into the frame as text.\n"
  + "const CC_RUNNER = createHash('sha256').update(readFileSync(path.join(ROOT, 'courses', 'cipher-city', 'js', 'engine', 'frame.js'))).digest('base64');\n"
  + "COURSES['cipher-city']!.csp = `default-src 'self'; script-src 'self' blob: 'sha256-${CC_RUNNER}'; worker-src blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; ${COMMON_CSP}`;\n"
  + '\n/** The visitor\'s address.');
await edit(['server', 'src', 'http.ts'], "from 'node:crypto'", "import path from 'node:path';\n", "import path from 'node:path';\nimport { readFileSync } from 'node:fs';\nimport { createHash } from 'node:crypto';\n");
await edit(['package.json'], 'quickjs-emscripten', '    "pg": "^8.13.0"', '    "pg": "^8.13.0",\n    "quickjs-emscripten": "^0.31.0"');
await edit(['package.json'], 'courses/cipher-city/tests', 'node --test courses/pixel-trail/tests/*.test.mjs"', 'node --test courses/pixel-trail/tests/*.test.mjs courses/cipher-city/tests/*.test.mjs"');
await edit(['.github', 'workflows', 'ci.yml'], 'cipher-city', '          node e2e/maker-lab.mjs http://localhost:8080\n', '          node e2e/maker-lab.mjs http://localhost:8080\n          node courses/cipher-city/e2e/walk.mjs http://localhost:8080/cipher-city/ hosted\n');

console.log(`Cipher City (${commit}) is plugged into ${target}.\nNext: npm install, then npm test.`);
