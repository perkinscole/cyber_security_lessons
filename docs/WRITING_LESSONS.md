# Writing a Cipher City lesson

Lessons are data. Each grade has one lesson file (`js/curriculum/grade6.js`, `grade7.js`, `grade8.js`) and one answers file (`answers/grade6.js` and so on). The lesson file is sent to students. The answers file never is.

`g6-03` (Guess the PIN) in `js/curriculum/grade6.js` and `answers/grade6.js` is the model. Copy its shape exactly.

## Check your work

```bash
LESSONS_PER_GRADE=10 node --test tests/curriculum.test.mjs
```

The validator is `problems()` in `js/curriculum/index.js`. It enforces everything below marked **(checked)**. A lesson is not done until its test passes.

## The parts of a lesson

| Part | Rules |
| --- | --- |
| `id`, `title` | `g6-01` to `g6-10`. Title of 6 words or fewer. **(checked)** |
| `project: true` | Only on the lessons the outline marks as projects. |
| `sensitive: true` | On lessons that touch students' real lives (phishing, tricks, unkind messages, being a victim). Then `teacher.note` must say what to do if a student shares something: listen, do not promise secrecy, follow school policy and tell the counselor. **(checked)** |
| `question` | The question of the day. Ends in `?`. **(checked)** |
| `goal` | Starts with "I can ". **(checked)** |
| `standards` | 1 to 3 codes from `js/curriculum/standards.js`, such as `6-8.CAS.a.1`. **(checked)** |
| `job` | `[name, what they do]`. A different security job in each lesson of a grade. |
| `mission.story` | 2 or 3 paragraphs, 40 words each at most. Set in the grade's district of Cipher City. **(checked)** |
| `mission.vocab` | 2 to 5 `[word, meaning]` pairs. **(checked)** |
| `mission.talk` | One partner-talk question. |
| `mission.rule` | One sentence on permission, the law or reporting what you find. **(checked)** |
| `steps` | 3 to 5, ids `a` to `e`. At least two code steps; projects have at least three. **(checked: at least one)** |
| `quiz` | Exactly 4 questions `q1` to `q4`, 3 or 4 choices each, no answer in the lesson file. One of the four is about permission, defence or doing the right thing. **(checked)** |
| `ship` | `prompt` (the written reflection), `frame` (a sentence starter with `___` blanks), `stretch` (an extra challenge). **(checked)** |
| `teacher.note` | One or two sentences for the teacher. **(checked)** |

Word limits **(checked)**: step instruction 30, folded explanation 70, hint 35, quiz question 30, quiz choice 16, answer reason 30, reflection prompt 35.

In `say`, `more` and story text, `**word**` makes a key word bold and `` `code` `` shows code.

## Code steps

```js
code('a', 'One instruction, 30 words at most.', {
  more: 'The explanation, folded away until the student opens it.',
  hint: 'A nudge, not the answer.',
  setup: `hidden code that runs first: the pretend world`,
  starter: `what the student sees in the editor`,
  tests: [ ... ],
})
```

- **Each run starts fresh:** setup, then the student's code for this step, then the tests. Nothing carries over from an earlier step. If a later step needs earlier work, put it in that step's `setup` or `starter`.
- `say(...)` prints a line. `console.log` does the same.
- The reference answer goes in the answers file under `code: { a: \`...\` }`. It must pass the tests, and the starter must not. Starter and answer are 30 lines at most. **(checked)**
- A `___` in the code always fails, so a blank can never be left unfilled.

### Tests

| Test | Passes when |
| --- | --- |
| `{ run: 'strength("cat")', want: 1 }` | The expression gives exactly `want` (numbers, text, true/false, lists and objects all work). It can use any name the student's code made at the top level. |
| `{ says: 'Opened with 47' }` | Some printed line equals this, ignoring capitals and extra spaces. Add `loose: true` to accept a line that contains it. |
| `{ out: ['line 1', 'line 2'] }` | The whole output is exactly these lines. |
| `{ uses: 'for' }` / `{ avoids: '1234' }` | The code (comments removed) contains, or does not contain, this text. |

Add `label: '...'` to any test to say it in plain words. Without one, a `run` test reads as "strength("cat") gives 1".

Write at least two tests for a function, with different inputs, so an answer that prints one fixed value does not pass.

### Rules for lesson code

- **Same result every time.** No `Math.random()` or `Date` in anything a test depends on. If a lesson needs chance, put a small fixed-seed picker in `setup`.
- **Fast.** A run must finish well under a tenth of a second. Keep the total loop count under 100,000.
- **Plain JavaScript.** Variables, `if`, loops, functions, strings, arrays and simple objects. No classes, `async`, modules or anything from a web page (`document`, `window`).
- **Nothing real.** No web addresses except ones ending `.example` or `.test`. Email addresses end `.example` or `.test`. Network addresses start `10.` or `192.168.`. No `fetch` or any other network call. **(checked)**
- Every password, PIN and name is made up, and looks made up.

### The ramp

| Grade | What the student does to the code |
| --- | --- |
| 6 | Never an empty editor. Fill one or two `___` blanks, or change one value. Starter code has short comments. By lesson 10, writes two or three lines inside a function that is already there. |
| 7 | Starter code with the function's first line and a comment saying what to return. The student writes the body: 3 to 8 lines. |
| 8 | Writes whole functions from a description, writes tests for them, and reads and fixes code they did not write. |

## Click-through steps

```js
lab('d', 'One instruction.', { type: 'sort', bins: ['A', 'B'], items: [['text', 0], ['text', 1], ...] }, 'optional folded explanation')
```

| Type | Fields |
| --- | --- |
| `mcq` | `choices`, `answer` (index), `why` |
| `sort` | `bins` (2 or 3), `items` of `[text, binIndex]`, at least 4 |
| `order` | `items`, listed in the right order, at least 3 |
| `match` | `pairs` of `[left, right]`, at least 3 |

## Safety rules. Hold to all of them.

1. **Every target is pretend and lives inside the lesson.** The pretend locker, login, inbox or network is built in `setup`. No lesson points a technique at a real system or tells a student to try something outside the lesson.
2. **No real attack tools, real malware or working exploits for real software.** Teach the idea with a toy that only works on the toy. Do not name real hacking tools.
3. **Defence and ethics in every lesson:** the mission rule, a named security job, and at least one step or question from the defender's side.
4. **Passwords are always made up.** Never ask a student to type a real password, their own or anyone's.
5. **No real personal information** in any example. Made-up people only.
6. **Nobody who was tricked or targeted is blamed.** Write "the message was built to fool people", never "they should have known". Sensitive lessons carry the teacher note described above.

## Reading level

Middle school, including English learners and students with IEPs. Short sentences. One idea at a time. Say the plain word first, then the security word in bold.
