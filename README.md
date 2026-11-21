# Cipher City

Cybersecurity for grades 6 to 8, taught by writing code. Three courses of ten lessons each, built on the Massachusetts Digital Literacy and Computer Science standards. A plain web app with no build step and nothing loaded from another site, made to run on Ready4AI.

The city has gone dark. Each finished lesson lights one building, and the whole class lights the skyline together.

| Grade | Course | What students do |
| --- | --- | --- |
| 6 | Lock It Down | Keep yourself safe. Finish and change code that is already started: PINs, password checkers, passphrases, spotting fakes, secret codes, updates, kindness online. |
| 7 | Crack the Case | How attacks and defences work. Write one short function at a time: brute force and lockouts, word lists, scrambled storage, cracking a cipher, a phishing detector, a malware simulation, firewall rules. |
| 8 | Build the Defence | Design and test defences. Write whole functions and test them: scope, a safe sign-in, input checks, permission checks, key sharing, fingerprints, a firewall, log alerts. |

The lesson list with standards is in [docs/CURRICULUM.md](docs/CURRICULUM.md). Of 126 build steps, 99 are code. Six lessons are projects.

## Try it

Needs Node 22 or newer. Nothing to install.

```bash
npm start
```

Open http://localhost:8080. Join as a student with class code `DEMO6`, `DEMO7` or `DEMO8`, or open the teacher desk. This is practice mode: everything is kept in that browser.

## What is in it

**For students**
- Every lesson has the same arc: **Mission** (story, words, a security career, the rule about permission, partner talk), **Build** (three to five steps, one on screen at a time, explanation folded away), **Quick check** (four questions) and **Turn in** (a written reflection with a sentence starter, and a stretch challenge).
- A code editor with a Run button, an output window, a checklist of what the code must do, and error messages rewritten for beginners with the line to look at.
- XP, 12 levels, 13 badges each with a sidekick bot to collect, an operator with parts that unlock by level, and a city that lights up.
- Night Shift, a reward game that opens only with play time earned by finishing lessons, when the teacher switches it on.
- Buttons that are not ready stay clickable and say what is missing. An idle hint points at the next thing to do.
- "I'm stuck", "Confusing?" on every step and question, read aloud, and a lesson rating.
- Display settings chosen by the student: arcade, daylight or high-contrast colors, four fonts, text size, line spacing, less motion, sounds with a mute button remembered on the device.

**For teachers**
- Classes by grade with a join code. Add students and print sign-in cards. No student email.
- A progress grid, each student's code, tries, first quick-check answers and reflection, a rubric with written feedback, and badges to give.
- A class screen to project: question of the day, timer, recent wins, the class city. No scores.
- A help queue, a feedback report with no student names, share-and-assign links for any learning system, student view, and problem reports.
- Printable lesson plans with answer keys for all 30 lessons, and a standards coverage page.
- Download or delete a class, remove a student, delete the account.

## Safety

- **Every target is pretend.** The lockers, sign-ins, inboxes, networks and logs are a few lines of code inside each lesson. No lesson contacts a real system, and the lesson validator rejects any real web address, email address or network call.
- **Student code runs in a sandbox** in the student's own browser: a frame with an origin of its own, running a worker, under a browser rule that allows no request of any kind.
- **Made-up passwords only**, said on screen in every step that touches one.
- **Permission, the law and reporting** are in every mission, and each lesson names a security career.
- Lessons that touch students' real lives carry a teacher note on what to do if a student shares something.

## On Ready4AI

Cipher City is its own app inside Ready4AI. It has its own folder, its own five database tables (`cc_*`), its own requests (all named `cc*`) and its own tests. It uses the platform's sign-in, classes, rosters, deletion and clean-up as they are and changes none of them. See [docs/READY4AI.md](docs/READY4AI.md).

```bash
node platform/plug-in.mjs /path/to/Ready4AI
```

On the platform the server is the authority: it marks every quick check (the answers are never sent to a browser) and reruns every code step itself in a sealed engine.

## Checks

```bash
npm test
```

45 checks: every lesson is complete, within its word limits, safe, and solvable (its reference answer passes and its starter does not); the game rules; practice-mode saving; the code checker.

```bash
npm run test:browser
```

With `npm start` running and Playwright on the machine: a pretend student in each grade finishes all 30 lessons by typing and clicking through the real page, then the teacher pages are opened. It fails on any page error or any request to another site.

```bash
node e2e/sandbox.mjs
```

Tries 28 ways out of the sandbox from inside student code. None may work.

What has and has not been tested is in [docs/TESTED.md](docs/TESTED.md).

## Layout

| Path | What it holds |
| --- | --- |
| `js/curriculum/` | The lessons (`grade6.js`, `grade7.js`, `grade8.js`), the standards and the validator |
| `answers/` | Quick-check answers and reference code. Never sent to a student on Ready4AI |
| `js/engine/` | Building, running and judging a code step; the sandbox; the error explainer |
| `js/labs/` | The code editor and the click-through labs |
| `js/game/` | XP, levels, badges, the artwork and the reward game. All worked out from saved progress |
| `js/data/` | Storage: `local.js` (this browser), `hosted.js` (Ready4AI), `brain.js` (the rules both share) |
| `js/views/` | The screens |
| `platform/` | The Ready4AI side: tables, requests, the sealed engine, tests, and the plug-in script |
| `tests/`, `e2e/` | Checks |
| `docs/` | Curriculum, how to write a lesson, privacy, Ready4AI notes, what is tested |

To add or change a lesson, read [docs/WRITING_LESSONS.md](docs/WRITING_LESSONS.md), edit its grade file and its answers file, and run `npm test`. Steps are saved by id, so do not reuse or rename the id of a step students have started.
