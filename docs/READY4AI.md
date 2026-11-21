# Cipher City on Ready4AI

Cipher City runs on Ready4AI as an app of its own. This page says exactly what it adds, what it touches, and how to take it out again.

## Putting it in

```bash
node platform/plug-in.mjs /path/to/Ready4AI
```

```bash
npm install
```

```bash
npm test
```

The script can be run again at any time to bring Ready4AI's copy up to date. Lessons are changed here, never in Ready4AI's copy.

## What it adds

| Added | What it is |
| --- | --- |
| `courses/cipher-city/` | The pages, lessons, answers, and the course's own tests. Only `index.html`, `js/` and `css/` are served. `answers/` is read by the server and is never sent to a browser. |
| `server/src/courses/cipher-city.ts` | The course's requests. Every one is named `cc…`. |
| `server/src/courses/cipher-city-runner.ts` and `cipher-city-worker.mjs` | The sealed engine that reruns student code, on a thread of its own. |
| `server/sql/011_cipher_city.sql` | Five new tables: `cc_work`, `cc_student`, `cc_review`, `cc_award`, `cc_help`. No existing table is changed. |
| `server/test/cipher-city.test.ts` | 12 tests against a real database. |
| One package | `quickjs-emscripten`: a small JavaScript engine compiled to WebAssembly. Ready4AI had one package before (`pg`). |

## What it edits

Each edit is a line or a short block, added beside the matching line for Maker Lab.

| File | Edit |
| --- | --- |
| `server/src/courses/names.ts` | The course's name. |
| `server/src/courses/index.ts` | The course's module. |
| `server/src/http.ts` | Serve the pages at `/cipher-city/`, with their browser rule. |
| `package.json` | The package above, and the course's tests in `npm test`. |
| `.github/workflows/ci.yml` | Two browser checks: all 30 lessons, and the sandbox. |
| `site/privacy.html`, `docs/compliance/data-schedule.md` | What the course keeps. See [PRIVACY.md](PRIVACY.md). |
| `docs/hosting.md` | The course's address. |

It does not edit the shared core (`core.ts`, `rpc.ts`, `auth.ts`, `db.ts`), any other course, or the homepage. The course is reachable at `/cipher-city/` but is not listed on the homepage until you add it there.

## What it leans on, unchanged

Teacher accounts, class codes, student usernames and passcodes, sign-in limits, row-level security, student view, problem reports, account deletion and the daily clean-up are all the platform's own. A class made in Cipher City is an ordinary platform class whose settings hold its grade.

Because every Cipher City row hangs off a platform student or class, the platform's deletions remove the course's data with no extra step. Tests prove this for removing a student, deleting a class and deleting an account.

## How work is checked

- **Quick checks.** The answers live in `answers/`, which the server reads and never serves. A student sends a choice and gets back "right" or "not yet", with the reason only when right.
- **Labs.** The student's choices are sent and checked on the server.
- **Code.** The student's code is sent and run again on the server. It runs inside QuickJS, a separate JavaScript engine compiled to WebAssembly, which has no files, no network, no timers and no way to reach the server's memory. Each run gets a new engine with a 16 MB memory limit and a 0.4 second time limit. The engine lives on its own thread; if a run is still going after one second the thread is stopped and replaced, so student code cannot hold up other requests. The program only reports values; the comparison with the right answers happens outside the engine.
- **Limits.** 40 code runs a minute for each student, and 6,000 characters of code for a step.

## The browser rule

Cipher City's pages may load only this site's own files. No inline script, no `eval`, nothing from another site. The one exception is named by its exact fingerprint: the sandbox frame's runner script, which is written into the frame as text so that the frame itself can be forbidden from loading anything at all. The site-wide rule that no page may be shown inside a frame is unchanged.

## Things to know before a real class uses it

- **One checking thread.** Code runs wait in a line and go one at a time. A normal run takes a few thousandths of a second, so a class pressing Run together is fine on paper. It has not been load-tested.
- **Demo mode** (`/cipher-city/?demo`) keeps everything in the browser and makes no server calls. Because the answers are not on the device, the demo does not mark quick checks: any answer is accepted, and it says so.
- Everything in `docs/hosting.md` under "Before a real class uses it" applies to this course too.

## Taking it out

Delete the added files, remove the edited lines, and drop the five `cc_*` tables. Nothing else refers to them.
