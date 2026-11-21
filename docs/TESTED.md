# What is tested, and what is not

As of 2026-11-21. Everything under "Tested" was run and passed on the day this was written. Everything under "Not tested" was written but not exercised, or cannot be checked from a development machine.

## Tested

**The lessons (45 checks, `npm test`)**
- All 30 lessons pass the validator: every part present, word limits met, standards real, a security career and a permission rule in each, no real web address, email address or network call anywhere.
- For all 99 code steps: the reference answer passes the step's tests, and the starter code does not.
- Quick-check answers are not in the lesson files that are sent to students.
- A practice student can finish every lesson in every grade. Lessons open in order. Wrong work does not count.
- XP and badges come from saved work only. A teacher's scores change neither.
- The feedback report has no student names. The class screen has no scores.

**In a real browser (Chromium)**
- A pretend student in each grade finished all 30 lessons by typing each answer into the editor and clicking through each lab, quick check and reflection. This ran twice: in practice mode, and on Ready4AI through the real flow (a teacher signs up and makes three classes, students join with the class code and get a passcode).
- The walk fails on any page error, any failed request, and any request to another site. There were none.
- The first code step of each grade was run with its starter first: the checks showed what was missing and the Next button refused to move on.
- The teacher pages opened and showed the walker's work: progress grid (10 of 10), student page with code, help, feedback, share and assign, settings, class screen, lesson plans with answer code, standards, student view.
- The sandbox: 28 ways out were tried from inside student code (network calls of every kind, reaching the page, storage, building new code from text, an endless loop). None worked and no request left the page. The test was shown to fail when the sandbox was weakened on purpose.
- Demo mode on Ready4AI made no server calls. A lesson link for one grade took a student of another grade to their own grade's lesson.
- Light and high-contrast colors were looked at on a mission and a code step.

**On Ready4AI, against a real Postgres database (12 checks)**
- The server reruns code steps and marks quick checks itself. Claims of success sent in place of work are ignored. Steps out of order are refused.
- Quick-check answers never reach a student, and the answers folder is not served.
- All 99 reference answers pass in the server's sealed engine, the slowest in well under the time limit.
- The sealed engine: endless loops, endless recursion and memory floods are stopped; nothing of the server is reachable from inside; eight attempts to fake a passing report fail; the server keeps answering while student code is stuck.
- A student cannot run code without limit (40 runs a minute).
- One teacher cannot reach another teacher's class, students, reviews, badges or help requests. Below the application, the database itself hides one school's Cipher City rows from another and refuses writes across schools.
- Reviews, badges, the help queue, the feedback report, the export, the reward-game time limit, operator parts, and student view.
- Removing a student, deleting a class and deleting an account each remove the Cipher City data.
- Other courses are left alone: a Cipher City class code typed on Pixel Trail's page says where it belongs, and the other way round.

**Ready4AI itself, with Cipher City plugged in**
- Its type check, all of its own tests (128 before, 128 after, plus the new ones) and its own browser checks for Pixel Trail and Maker Lab all pass.

## Not tested

- **Nothing is deployed, and nothing has been pushed to Ready4AI.** The plugged-in copy exists only on the development machine; `platform/plug-in.mjs` rebuilds it exactly. The edit to Ready4AI's GitHub checks has not run on GitHub. The container build was not run.
- **No student or teacher has used it.** The 40 to 50 minute length of each lesson is a judgement, not a measurement. Reading level was held by word limits and review, not measured with a tool.
- **Lesson text was not all read line by line by one reviewer.** One lesson was written as the model; the other 29 were written to its pattern in three parallel passes and machine-checked as above. They were scanned for real tools, brands, exploit strings and blaming language (none found), and the sensitive lessons and the input-flaw lesson were read in full. A teacher's read of every lesson is still needed.
- **Only Chromium.** Chromebooks use it, so that is the case that matters most. Safari and Firefox were not tried, and the sandbox depends on browser features that should be checked there before promising support.
- **Phones and small screens** were not looked at.
- **Written but not exercised by a test:** read aloud, sounds and the mute button, font, text size and spacing choices, the idle hint, printing (sign-in cards, lesson plans), full screen on the class screen, the help-queue chime, the timer, giving a badge and saving a review through the page (the server side of both is tested), playing the reward game beyond opening it, and the keyboard-only path through the editor.
- **Load.** Code checks run one at a time on one thread. This is fine on paper for a class and has not been tested under load.
- **The name.** A quick web search found no clash for "Cipher City". That is not a trademark clearance.
- Everything Ready4AI lists as not done in `docs/hosting.md` still applies: the host's backups, the proxy setting, a lawyer's read of the privacy page.
