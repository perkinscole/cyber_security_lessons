// Grade 7: Crack the Case. How attacks and defences work.
// Students get the first line of a function and a comment saying what to return. They write the body.
import { q, lab, code } from './kit.js';

// ---- The pretend worlds. Each code step runs its setup first, hidden from the student. ----

const STORE = `var store = [
  { name: "price list", need: "correct", harm: 3, chance: 4 },
  { name: "student account list", need: "secret", harm: 5, chance: 3 },
  { name: "checkout tablet", need: "working", harm: 4, chance: 2 },
  { name: "snack poster", need: "correct", harm: 1, chance: 2 },
  { name: "cash box code", need: "secret", harm: 5, chance: 2 }
];`;
const RISK = `function risk(thing) { return thing.harm * thing.chance; }`;
const BY_RISK = `function byRisk(list) { return list.slice().sort(function (a, b) { return risk(b) - risk(a); }); }`;

const LOCKS = `function makeLock(secret) {
  var tries = 0;
  return {
    open: function (pin) { tries++; return pin === secret; },
    tries: function () { return tries; }
  };
}`;
const LOCKOUT = `function newLock(secret) { return { secret: secret, wrong: 0 }; }
function after(secret, pins) {
  var lock = newLock(secret), results = [];
  for (var i = 0; i < pins.length; i++) results.push(tryPin(lock, pins[i]));
  return results;
}`;

const WORDS = `var common = ["12345678", "password1", "midtown7", "gocomets", "pizzapizza", "letmein22", "abc12345", "qwerty99"];`;
const LOGIN = `function makeLogin(secret) {
  var tries = 0;
  return {
    check: function (guess) { tries++; return guess === secret; },
    tries: function () { return tries; }
  };
}`;

const SCRAMBLE = `function scramble(text) {
  var total = 7;
  for (var i = 0; i < text.length; i++) total = (total * 31 + text.charCodeAt(i)) % 1000;
  return total;
}`;

const ALPHA = `var ALPHA = "abcdefghijklmnopqrstuvwxyz";`;
const SHIFT = `function shiftLetter(letter, shift) {
  var at = ALPHA.indexOf(letter);
  return at < 0 ? letter : ALPHA[(at + shift) % 26];
}`;
const CAESAR = `function caesar(text, shift) {
  var result = "";
  for (var i = 0; i < text.length; i++) result += shiftLetter(text[i], shift);
  return result;
}`;
const COMMON = `var COMMON = ["the", "and", "is", "at", "to", "of", "in", "we", "you", "it", "are", "on", "for"];`;
const SCORE = `function score(text) {
  var words = text.split(" "), count = 0;
  for (var i = 0; i < words.length; i++) if (COMMON.indexOf(words[i]) >= 0) count++;
  return count;
}`;
const CRACK = (name) => `function ${name}(secret) {
  var best = "", bestScore = -1;
  for (var shift = 1; shift <= 25; shift++) {
    var attempt = caesar(secret, shift), points = score(attempt);
    if (points > bestScore) { best = attempt; bestScore = points; }
  }
  return best;
}`;
const KEY_SHIFT = `function keyShift(key, i) { return ALPHA.indexOf(key[i % key.length]); }`;
const KEY_CIPHER = `function keyCipher(text, key) {
  var result = "";
  for (var i = 0; i < text.length; i++) result += shiftLetter(text[i], keyShift(key, i));
  return result;
}`;

const INBOX = `var inbox = [
  { from: "prizes@free-tablet.test", text: "Urgent! You won a prize. Click now to claim it.", fake: true },
  { from: "help@midtownschoo1.example", text: "Your password runs out today. Urgent: sign in here to keep your account.", fake: true },
  { from: "team@comets-club.test", text: "Your account is locked. Verify your details at http://comets-club.test/unlock", fake: true },
  { from: "gift@snackshack.test", text: "You are a winner! Send your password to get your gift card.", fake: true },
  { from: "library@midtown1ibrary.example", text: "Final warning: pay your late fee today or lose your card. Click here.", fake: true },
  { from: "coach.rivera@midtownschool.example", text: "Hi, can you buy three gift cards for me? I will pay you back. Tell no one.", fake: true },
  { from: "office@midtownschool.example", text: "Urgent: buses are 20 minutes late today because of snow.", fake: false },
  { from: "library@midtownlibrary.example", text: "Your book is due on Friday. You can renew it at the front desk.", fake: false },
  { from: "coach.rivera@midtownschool.example", text: "Practice moves to the small gym on Tuesday.", fake: false },
  { from: "news@cometsclub.example", text: "Our raffle prize this month is a class pizza party. Tickets at lunch.", fake: false },
  { from: "nana.bea@familymail.example", text: "Happy birthday! I sent a card. Call me this weekend.", fake: false },
  { from: "office@midtownschool.example", text: "Reminder: never share your password. The office will never ask for it.", fake: false },
  { from: "ms.okafor@midtownschool.example", text: "Your science project is due Monday. Bring your poster.", fake: false },
  { from: "tutor.sam@homework-help.example", text: "See you Thursday at 4 for maths. It is urgent that you bring your notebook.", fake: false }
];
var TRUSTED = ["@midtownschool.example", "@midtownlibrary.example", "@cometsclub.example"];
function trusted(from) {
  for (var i = 0; i < TRUSTED.length; i++) if (from.slice(-TRUSTED[i].length) === TRUSTED[i]) return true;
  return false;
}`;
const COUNT_CLUES = `function countClues(text, clues) {
  var lower = text.toLowerCase(), count = 0;
  for (var i = 0; i < clues.length; i++) if (lower.indexOf(clues[i]) >= 0) count++;
  return count;
}`;
const CLUES = `var clues = ["urgent", "prize", "password"];`;
const MSG_SCORE = `function score(msg) { return countClues(msg.text, clues) + (trusted(msg.from) ? 0 : 2); }`;
const TUNING = `function missed(limit) {
  var count = 0;
  for (var i = 0; i < inbox.length; i++) if (inbox[i].fake && score(inbox[i]) < limit) count++;
  return count;
}
function falseAlarms(limit) {
  var count = 0;
  for (var i = 0; i < inbox.length; i++) if (!inbox[i].fake && score(inbox[i]) >= limit) count++;
  return count;
}
function showMistakes(limit) {
  for (var i = 0; i < inbox.length; i++) {
    var flagged = score(inbox[i]) >= limit;
    if (inbox[i].fake && !flagged) say("MISSED (score " + score(inbox[i]) + "): " + inbox[i].text);
    if (!inbox[i].fake && flagged) say("FALSE ALARM (score " + score(inbox[i]) + "): " + inbox[i].text);
  }
}`;

const SIM = `function newRow() {
  var row = ["sick"];
  for (var i = 1; i < 12; i++) row.push("ok");
  return row;
}
function show(row) {
  var picture = "";
  for (var i = 0; i < row.length; i++) picture += row[i] === "sick" ? "X" : row[i] === "safe" ? "U" : ".";
  return picture;
}
function nextRound(row, spread, updates) {
  var next = row.slice(), left = updates, i, d;
  for (i = next.length - 1; i >= 0 && left > 0; i--) {
    if (next[i] === "ok") { next[i] = "safe"; left--; }
  }
  for (i = 0; i < row.length; i++) {
    if (row[i] !== "sick") continue;
    for (d = 1; d <= spread; d++) {
      if (i + d < next.length && next[i + d] === "ok") next[i + d] = "sick";
    }
  }
  return next;
}`;
const COUNT_SICK = `function countSick(row) {
  var count = 0;
  for (var i = 0; i < row.length; i++) if (row[i] === "sick") count++;
  return count;
}`;
const SIMULATE = `function simulate(spread, updates, rounds) {
  var row = newRow();
  for (var r = 1; r <= rounds; r++) {
    row = nextRound(row, spread, updates);
    say("Round " + r + ": " + show(row));
  }
  return countSick(row);
}`;
const FILES = `var files = [
  { name: "homework.txt", text: "Read chapter 4 and answer the questions." },
  { name: "game-mod.txt", text: "speed=9 ZZ-FLAG-77 lives=3" },
  { name: "notes.txt", text: "Bring trainers on Friday." },
  { name: "free-coins.txt", text: "Run me! ZZ-FLAG-77 coins=999" },
  { name: "photo-list.txt", text: "beach, park, QQ-FLAG-12, zoo" }
];`;

const PACKETS = `var packets = [
  { from: "10.0.0.5", to: "10.0.0.1", port: 80, scrambled: false, data: "page=menu" },
  { from: "10.0.0.7", to: "10.0.0.1", port: 80, scrambled: false, data: "name=dev password=river-tuba-31" },
  { from: "10.0.0.5", to: "10.0.0.1", port: 443, scrambled: true, data: "x9$Lq2#vT8" },
  { from: "10.0.0.9", to: "10.0.0.1", port: 443, scrambled: true, data: "Pz4!mW7@aa" },
  { from: "192.168.66.6", to: "10.0.0.7", port: 23, scrambled: false, data: "open remote control" },
  { from: "10.0.0.9", to: "10.0.0.1", port: 80, scrambled: false, data: "search=bus times" },
  { from: "192.168.66.6", to: "10.0.0.5", port: 443, scrambled: true, data: "k3&Ru1*Zo0" }
];`;
const BLOCKED = `var blocked = ["192.168.66.6"];`;

const ARCADE_WIFI = `var wifi = [
  { from: "10.0.0.4", scrambled: true, data: "q7!Xw2@pL5" },
  { from: "10.0.0.8", scrambled: false, data: "door code=4410" },
  { from: "10.0.0.4", scrambled: true, data: "Zr8#nB1$ke" }
];
var locker = makeLock(628);`;
const ARCADE_STORED = `var stored = { ana: scramble("gocomets"), raj: scramble("qwerty99"), lin: scramble("kite-olive-river-52") };`;
const ARCADE_NOTE = `var note = caesar("the alarm code is in the red book", 9);`;
const ARCADE_INBOX = `var inbox = [
  { from: "vega@cometarcade.example", text: "Staff meeting on Friday at 3 in the back room." },
  { from: "orders@tokenshop.example", text: "Your order of 500 game tokens is on its way." },
  { from: "boss@comet-arcade.test", text: "Urgent! I am locked out. Send me the alarm password now." },
  { from: "vega@cometarcade.example", text: "Reminder: never share the alarm password by email." },
  { from: "deals@prize-world.test", text: "You won a prize! Reply to claim it." },
  { from: "sam@cometarcade.example", text: "Can someone cover my shift on Sunday?" }
];
var clues = ["urgent", "prize", "password", "locked"];
function score(msg) {
  var lower = msg.text.toLowerCase(), points = msg.from.slice(-20) === "@cometarcade.example" ? 0 : 2;
  for (var i = 0; i < clues.length; i++) if (lower.indexOf(clues[i]) >= 0) points++;
  return points;
}`;

const join = (...parts) => parts.join('\n');

export default [
  // ------------------------------------------------------------------ 1
  {
    id: 'g7-01', title: 'Think Like a Defender',
    question: 'How does a defender decide what to protect first?',
    goal: 'I can rank the risks to a system and explain why permission matters.',
    standards: ['6-8.CAS.a.1', '6-8.CAS.b.8', '6-8.CT.a.1'],
    job: ['Risk analyst', 'A person who works out what could go wrong with a system, and which problem to fix first.'],
    mission: {
      story: [
        'Welcome to Midtown, the busy heart of Cipher City. The school store at Midtown Middle sells snacks and pencils from a small app. The owner, Ms. Vega, asks you to help keep it safe.',
        'A defender asks three questions. What must stay **secret**? What must stay **correct**? What must stay **working**? Then the defender finds the biggest **risk** and fixes it first.',
        'Some people break into systems to steal or to harm. Defenders use the same skills to protect, and only with permission. This year you learn how attacks work so you can stop them.',
      ],
      vocab: [
        ['Risk', 'How likely a bad thing is, and how much harm it would do.'],
        ['Secret', 'Only the right people can see it. Experts call this confidentiality.'],
        ['Correct', 'Nobody has changed it in a wrong way. Experts call this integrity.'],
        ['Working', 'It is there when people need it. Experts call this availability.'],
        ['Permission', 'A clear yes from the owner before you test anything.'],
      ],
      talk: 'Think of the school library system. What must stay secret, what must stay correct, and what must keep working?',
      rule: 'Testing a system is only allowed when the owner has said yes. Breaking in without permission is against the law, even "just to look".',
    },
    steps: [
      code('a', 'Each thing in the store has a `harm` score and a `chance` score. Finish `risk` so it returns harm times chance.', {
        more: 'A **risk** is bigger when the harm is worse, and bigger when it is more likely. Multiplying the two scores gives one number, so you can compare risks. `thing.harm` reads the harm score of a thing.',
        hint: 'Use `*` to multiply. You need `thing.harm` and `thing.chance`, and the word `return`.',
        setup: STORE,
        starter: `// The pretend store is a list called store. One thing in it looks like this:
// { name: "price list", need: "correct", harm: 3, chance: 4 }
// harm: how bad it would be (1 to 5). chance: how likely it is (1 to 5).
function risk(thing) {
  // return harm times chance

}
say("Risk to the price list: " + risk(store[0]));`,
        tests: [
          { run: 'risk(store[0])', want: 12 },
          { run: 'risk(store[1])', want: 15 },
          { run: 'risk({ harm: 2, chance: 5 })', want: 10 },
        ],
      }),
      code('b', 'Find the thing to fix first. Finish `topRisk`: fill in the `if`, then return the **name** of the best one.', {
        more: 'The loop keeps the biggest risk seen so far in `best`. Each time around, it compares the next thing with `best`. At the end, `best` is the winner. `best.name` is its name.',
        hint: 'Compare `risk(list[i])` with `risk(best)`. When it is bigger, set `best = list[i]`. After the loop, return `best.name`.',
        setup: join(STORE, RISK),
        starter: `// risk(thing) from step a is ready to use.
function topRisk(list) {
  let best = list[0];
  for (let i = 1; i < list.length; i++) {
    // if list[i] has more risk than best, make it the new best

  }
  // return the name of best

}
say("Fix first: " + topRisk(store));`,
        tests: [
          { run: 'topRisk(store)', want: 'student account list' },
          { run: 'topRisk(store.slice(2))', want: 'cash box code', label: 'It works on the last three things: cash box code' },
          { run: 'topRisk([{ name: "door", harm: 1, chance: 1 }, { name: "safe", harm: 2, chance: 2 }])', want: 'safe' },
          { says: 'Fix first: student account list' },
        ],
      }),
      code('c', 'Each thing has a `need`: secret, correct or working. Finish `line` so the report says the risk, the name and the need.', {
        more: 'Join pieces of text with `+`. For example `"a" + ": " + "b"` gives `"a: b"`. The loop under your function prints the whole store, biggest risk first.',
        hint: 'Start with `risk(thing) + ": " + thing.name`. Then add the words " must stay " and the need. Mind the spaces.',
        setup: join(STORE, RISK, BY_RISK),
        starter: `// Each thing has a need: "secret", "correct" or "working".
function line(thing) {
  // return text like this: "12: price list must stay correct"
  // Use risk(thing), thing.name and thing.need.

}
// byRisk(store) gives the list with the biggest risk first.
const ranked = byRisk(store);
for (let i = 0; i < ranked.length; i++) {
  say(line(ranked[i]));
}`,
        tests: [
          { run: 'line(store[0])', want: '12: price list must stay correct' },
          { run: 'line(store[2])', want: '8: checkout tablet must stay working' },
          { run: 'line({ name: "door key", need: "secret", harm: 2, chance: 2 })', want: '4: door key must stay secret' },
          { out: ['15: student account list must stay secret', '12: price list must stay correct', '10: cash box code must stay secret', '8: checkout tablet must stay working', '2: snack poster must stay correct'], label: 'The report lists all five, biggest risk first' },
        ],
      }),
      lab('d', 'The same skills can help or harm. Sort each action: is it helpful, or is it against the law?', {
        type: 'sort', bins: ['Helpful: has permission', 'Harmful: no permission'],
        items: [
          ['A tester checks the store app because the owner asked her to', 0],
          ['A student guesses a classmate\'s sign-in as a joke', 1],
          ['A worker finds a weak lock and reports it to the owner', 0],
          ['Someone changes the prices in an app they do not run', 1],
          ['A class tests a pretend store built for the lesson', 0],
          ['Someone reads a private account list without asking', 1],
        ],
      }, 'What makes the difference is **permission** and purpose. A defender asks first, stays inside what the owner allowed, and reports what they find.'),
    ],
    quiz: [
      q('q1', 'A stranger changes the prices in a store app. Which need is broken?', ['Stay secret', 'Stay correct', 'Stay working', 'None of them']),
      q('q2', 'Risk A has harm 4 and chance 2. Risk B has harm 3 and chance 3. Which do you fix first?', ['A, with risk 8', 'B, with risk 9', 'Neither', 'They are equal']),
      q('q3', 'The checkout tablet stops at lunch time. Which need is broken?', ['Stay secret', 'Stay correct', 'Stay working']),
      q('q4', 'What makes hacking helpful and not harmful?', ['Doing it at night', 'Being very good at it', 'The owner\'s permission, and reporting what you find', 'Not getting caught']),
    ],
    ship: {
      prompt: 'Pick one system you use at school. What must stay secret, stay correct and stay working? Which risk would you fix first?',
      frame: 'In ___, the thing that must stay secret is ___. The biggest risk is ___ because ___.',
      stretch: 'In step c, add a sixth thing: `store.push({ name: "...", need: "...", harm: 3, chance: 5 });` Choose your own name, need and scores. Put it above the line that makes `ranked`. Where does it land in the ranking?',
    },
    teacher: { note: 'Secret, correct and working are confidentiality, integrity and availability. Use the sort in step d to open a talk about the school\'s rules for using computers: skill is the same on both sides, permission is the difference.' },
  },

  // ------------------------------------------------------------------ 2
  {
    id: 'g7-02', title: 'Brute Force',
    question: 'How do you stop a program that can try every PIN?',
    goal: 'I can write a brute force guesser and the lockout that stops it.',
    standards: ['6-8.CAS.a.1', '6-8.CT.b.1', '6-8.CT.d.1'],
    job: ['Penetration tester', 'A person hired to attack a system, with written permission, and find its weak spots before a real attacker does.'],
    mission: {
      story: [
        'The Midtown Bike Hub keeps helmets in lockers with a keypad. The manager, Mr. Osei, hires you to test one. He has signed a letter that gives you permission.',
        'An attacker does not need to be clever. A program can try every PIN in order, very fast. This is called **brute force**.',
        'First you play the attacker and count the guesses. Then you switch sides and build the **lockout** that stops the attack.',
      ],
      vocab: [
        ['Brute force', 'Trying every possible answer until one works.'],
        ['Lockout', 'A rule that stops all tries after a few wrong ones.'],
        ['Worst case', 'The largest number of tries a job could take.'],
      ],
      talk: 'A phone locks after a few wrong tries. Why is that annoying for the owner but much worse for an attacker?',
      rule: 'Only test a lock you own, or one the owner has asked you to test. Guessing someone else\'s PIN without permission is against the law.',
    },
    steps: [
      code('a', 'Write `crack`. It tries every PIN from 0 up to `howMany - 1` and returns the one that opens the lock.', {
        more: 'A `for` loop can count for you: `for (let pin = 0; pin < howMany; pin++)`. Inside the loop, `lock.open(pin)` tests one PIN. A `return` inside a loop stops the loop at once.',
        hint: 'Inside the loop: if `lock.open(pin)` is true, return `pin`. After the loop ends, nothing worked, so return -1.',
        setup: LOCKS,
        starter: `// makeLock(47) makes a pretend lock with the PIN 47.
// lock.open(pin) gives true when the PIN is right, and false when it is wrong.
function crack(lock, howMany) {
  // Try every PIN from 0 up to howMany - 1.
  // return the PIN that opens the lock. If none does, return -1.

}
say("The PIN is " + crack(makeLock(47), 100));`,
        tests: [
          { run: 'crack(makeLock(47), 100)', want: 47 },
          { run: 'crack(makeLock(8), 10)', want: 8 },
          { run: 'crack(makeLock(305), 1000)', want: 305 },
          { run: 'crack(makeLock(500), 100)', want: -1, label: 'It returns -1 when no PIN in the range works' },
          { says: 'The PIN is 47' },
        ],
      }),
      code('b', 'Now count the work. Write `countGuesses`: it tries PINs in order and returns how many guesses it took to open the lock.', {
        more: 'The **worst case** is when the PIN is the very last one tried. Each extra digit makes the worst case 10 times bigger. That is why a longer PIN costs an attacker more time.',
        hint: 'Start a counter at 0. Add 1 for every guess. Use `break` to leave the loop when the lock opens, then return the counter.',
        setup: LOCKS,
        starter: `function countGuesses(lock, howMany) {
  // Try the PINs 0, 1, 2 ... in order. Stop when the lock opens.
  // return how many guesses it took.

}
// The worst PIN for each length is the last one.
say("2 digits: " + countGuesses(makeLock(99), 100) + " guesses");
say("3 digits: " + countGuesses(makeLock(999), 1000) + " guesses");
say("4 digits: " + countGuesses(makeLock(9999), 10000) + " guesses");`,
        tests: [
          { run: 'countGuesses(makeLock(7), 10)', want: 8 },
          { run: 'countGuesses(makeLock(99), 100)', want: 100 },
          { run: 'countGuesses(makeLock(250), 1000)', want: 251 },
          { says: '4 digits: 10000 guesses' },
        ],
      }),
      lab('c', 'Match each PIN length to its worst case: the most guesses brute force could need.', {
        type: 'match',
        pairs: [['2 digits', '100 guesses'], ['3 digits', '1,000 guesses'], ['4 digits', '10,000 guesses'], ['6 digits', '1,000,000 guesses']],
      }, 'A longer PIN slows brute force down, but a fast program can still finish. To stop it, the lock must limit the number of tries. That is the next step.'),
      code('d', 'Switch sides. Write `tryPin` with a **lockout**: after 3 wrong tries, the lock answers "locked" to everything, even the right PIN.', {
        more: 'The lock remembers its wrong tries in `lock.wrong`. Check the lockout first, before you look at the PIN. With only 3 guesses, brute force has almost no chance: 3 out of 10,000 for a 4-digit PIN.',
        hint: 'Three `if` checks, in the order of the comments. `lock.wrong >= 3` means locked. `lock.wrong = lock.wrong + 1` counts one more wrong try.',
        setup: LOCKOUT,
        starter: `// A lock looks like this: { secret: 55, wrong: 0 }
// lock.wrong counts the wrong tries so far.
function tryPin(lock, pin) {
  // If there have been 3 wrong tries already, return "locked".
  // If pin is the secret, return "open".
  // If not, add 1 to lock.wrong and return "wrong".

}
// after(secret, pins) makes a new lock and tries each PIN in the list.
say(after(55, [10, 20, 55]));
say(after(55, [10, 20, 30, 55]));`,
        tests: [
          { run: 'after(55, [55])', want: ['open'] },
          { run: 'after(55, [10, 20, 55])', want: ['wrong', 'wrong', 'open'] },
          { run: 'after(55, [10, 20, 30, 55])', want: ['wrong', 'wrong', 'wrong', 'locked'], label: 'After 3 wrong tries, even the right PIN gives "locked"' },
          { run: 'after(9, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])[9]', want: 'locked', label: 'Brute force is stopped: it reaches PIN 9 too late' },
        ],
      }),
    ],
    quiz: [
      q('q1', 'A lock has a 3-digit PIN. What is the largest number of guesses brute force needs?', ['30', '300', '1,000', '3,000']),
      q('q2', 'Why does a lockout stop brute force?', ['It makes the PIN longer', 'The attacker only gets a few guesses', 'It hides the keypad', 'It changes the PIN each time']),
      q('q3', 'Your `crack` function returns -1. What does that mean?', ['The PIN is -1', 'No PIN in the range opened the lock', 'The lock is broken', 'The loop ran once']),
      q('q4', 'You notice the school bike shed keypad has no lockout. What should you do?', ['Try every PIN to prove it', 'Show friends the trick', 'Report it to a teacher or the owner', 'Keep it to yourself']),
    ],
    ship: {
      prompt: 'Explain how brute force works, and which defence you would add to a keypad lock first. Say why.',
      frame: 'Brute force works by ___. The best defence is ___ because ___.',
      stretch: 'In step d, change the lockout from 3 wrong tries to 5. What chance does an attacker now have against a 4-digit PIN? Is it still a good defence?',
    },
    teacher: { note: 'Every lock here is pretend and lives in the page. If a student asks about trying this on a real keypad, phone or account, go back to the mission rule: written permission from the owner first, always.' },
  },

  // ------------------------------------------------------------------ 3
  {
    id: 'g7-03', title: 'Word List Attacks',
    question: 'Why is a common password a weak password?',
    goal: 'I can write a word list guesser and a sign-up rule that refuses common passwords.',
    standards: ['6-8.CAS.a.1', '6-8.CT.b.4'],
    job: ['Access manager', 'A person who sets the rules for signing in, such as which passwords a system will accept.'],
    mission: {
      story: [
        'The Midtown Comets fan club has a sign-in page. Many fans pick the same few passwords. The club asks you to test a pretend copy of the page.',
        'Attackers know what people pick. They do not start at "aaaa". They start with a **word list**: the passwords that people choose most often.',
        'You will write the list attack. Then you will write the sign-up rule that refuses every password on the list.',
      ],
      vocab: [
        ['Word list', 'A list of the passwords people pick most often.'],
        ['Algorithm', 'A set of steps for solving a problem.'],
        ['Sign-up rule', 'A check that a new password must pass before the system accepts it.'],
      ],
      talk: 'Why do you think so many people choose the same passwords?',
      rule: 'Only try passwords on a system you own or have permission to test. Trying to sign in to another person\'s account is against the law.',
    },
    steps: [
      code('a', 'Write `listAttack`. It tries each word in the list and returns the word that signs in.', {
        more: 'This is a second **algorithm** for the same problem as brute force. Brute force tries everything. A list attack tries the most likely answers first. `words[i]` is word number i, and `words.length` is how many there are.',
        hint: 'Loop from 0 to `words.length`. If `login.check(words[i])` is true, return `words[i]`. After the loop, return "not found".',
        setup: join(WORDS, LOGIN),
        starter: `// common is a made-up list of 8 passwords that many people pick.
// makeLogin("gocomets") makes a pretend sign-in with that password.
// login.check(guess) gives true when the guess is right.
function listAttack(login, words) {
  // Try each word in the list.
  // return the word that works. If none works, return "not found".

}
say(listAttack(makeLogin("gocomets"), common));`,
        tests: [
          { run: 'listAttack(makeLogin("gocomets"), common)', want: 'gocomets' },
          { run: 'listAttack(makeLogin("qwerty99"), common)', want: 'qwerty99' },
          { run: 'listAttack(makeLogin("tuba-lemon-42-river"), common)', want: 'not found', label: 'A password that is not on the list gives "not found"' },
          { run: 'listAttack(makeLogin("b"), ["a", "b", "c"])', want: 'b' },
        ],
      }),
      code('b', 'Compare the two attacks. Write `guessesNeeded`: how many guesses does the list attack need to reach a password?', {
        more: 'The last line shows the worst case for brute force on 8 small letters: 26 choices, 8 times over. Two algorithms can solve the same problem at very different speeds.',
        hint: 'Loop through the words. Word number `i` is guess number `i + 1`. If the loop ends without a match, return 0.',
        setup: WORDS,
        starter: `function guessesNeeded(password, words) {
  // return how many guesses the list attack needs to reach this password:
  // 1 for the first word in the list, 2 for the second, and so on.
  // If the password is not in the list, return 0.

}
say("List attack: " + guessesNeeded("gocomets", common) + " guesses");
say("Brute force: up to " + 26 * 26 * 26 * 26 * 26 * 26 * 26 * 26 + " guesses");`,
        tests: [
          { run: 'guessesNeeded("gocomets", common)', want: 4 },
          { run: 'guessesNeeded("12345678", common)', want: 1 },
          { run: 'guessesNeeded("tuba-lemon-42-river", common)', want: 0 },
          { run: 'guessesNeeded("b", ["a", "b"])', want: 2 },
          { says: 'List attack: 4 guesses' },
        ],
      }),
      code('c', 'Now defend. Write the sign-up rule `allowed`: refuse a password that is too short, or that is on the common list.', {
        more: '`password.length` is the number of characters. `password.toLowerCase()` gives the text in small letters, so "GoComets" becomes "gocomets". `common.includes(word)` is true when the word is in the list.',
        hint: 'Two `if` checks that each return false: one for `password.length < 8`, one for the lower case password being in `common`. Then return true.',
        setup: WORDS,
        starter: `// common is the list of 8 common passwords, all in small letters.
function allowed(password) {
  // return false if the password has fewer than 8 characters.
  // return false if it is in the common list, even when typed with CAPITALS.
  // If not, return true.

}
say("GoComets: " + allowed("GoComets"));
say("tuba-lemon-42-river: " + allowed("tuba-lemon-42-river"));`,
        tests: [
          { run: 'allowed("gocomets")', want: false },
          { run: 'allowed("GoComets")', want: false, label: 'Capital letters do not get a common password through' },
          { run: 'allowed("zq7")', want: false, label: 'A short password is refused' },
          { run: 'allowed("tuba-lemon-42-river")', want: true },
          { run: 'allowed("plum-kite-88")', want: true },
          { run: 'allowed("PIZZAPIZZA")', want: false },
        ],
      }),
      lab('d', 'Think like the attacker\'s list. Sort each made-up password: would a word list find it fast, or not?', {
        type: 'sort', bins: ['A word list finds it fast', 'Not on any list'],
        items: [
          ['password1', 0],
          ['four random words: tuba-lemon-river-kite', 1],
          ['the team name: gocomets', 0],
          ['12345678', 0],
          ['a long mix nobody else would pick: 7plum!Kite-88-owl', 1],
          ['a keyboard row: qwerty99', 0],
        ],
      }, 'If many people would think of it, it is on a list. Long passwords made of random words are hard for both attacks: not on the list, and too long for brute force.'),
    ],
    quiz: [
      q('q1', 'Why does a word list attack often beat brute force?', ['It tries the most likely passwords first', 'It uses a bigger computer', 'It already knows the answer', 'It only works on PINs']),
      q('q2', 'A password is 12 characters long, but it is on the common list. Is it safe?', ['Yes, because it is long', 'No, the list finds it in a few guesses', 'Yes, if it has a capital', 'Only at weekends']),
      q('q3', 'What does a good sign-up rule do?', ['Refuses passwords on the common list', 'Shows the password to everyone', 'Accepts any password', 'Limits passwords to 4 letters']),
      q('q4', 'You find a list of real passwords online. What is the right thing to do?', ['Try them on a friend\'s account', 'Do not use it, and tell a trusted adult', 'Share the list', 'Save it for later']),
    ],
    ship: {
      prompt: 'Explain why a common password is weak even when it is long. What should a sign-up page do about it?',
      frame: 'A common password is weak because ___. A good sign-up rule should ___.',
      stretch: 'People often add a 1 or a ! to a common password. Make `allowed` in step c also refuse a common password with one extra character on the end.',
    },
    teacher: { note: 'The passwords here are invented for the lesson. Never ask students to type or say a real password, their own or anyone\'s. Good passwords for the talk: several random words, different on every site.' },
  },

  // ------------------------------------------------------------------ 4
  {
    id: 'g7-04', title: 'Scrambled for Storage',
    question: 'How can a system check your password without keeping it?',
    goal: 'I can write a sign-up and sign-in that never store the password itself.',
    standards: ['6-8.CAS.a.1', '6-8.CT.a.2'],
    job: ['Security engineer', 'A person who builds the safe parts of a system, such as the way passwords are stored.'],
    mission: {
      story: [
        'The Midtown Library app keeps a list of members and their passwords. If a thief copies that list, every password is gone at once.',
        'Good systems never store the password. They store a scrambled number made from it, called a **hash**. Nobody can turn the number back into the password.',
        'Today you build a toy hash to see how the idea works. The toy is far too weak for real use. Real systems use hash functions made by experts.',
      ],
      vocab: [
        ['Hash', 'A number made from a text by fixed steps. The same text always gives the same number.'],
        ['One-way', 'Easy to do, but not possible to undo.'],
        ['Function', 'A named piece of code you can use again and again.'],
      ],
      talk: 'A site says "we cannot tell you your old password, but you can set a new one". Why is that a good sign?',
      rule: 'A password list is private. If you ever find one, do not read or use it: report it to a trusted adult or the owner.',
    },
    steps: [
      code('a', 'Write the toy hash, `scramble`. Follow the three comment lines: start at 7, mix in each character, return the total.', {
        more: '`text.charCodeAt(i)` gives the number the computer uses for character i. `% 1000` keeps only the last three digits. Changing one letter, or the order of the letters, changes the result. **This toy is not safe for real passwords.**',
        hint: 'Use `let total = 7;` then a `for` loop from 0 to `text.length`. The line inside the loop is in the comment. Return `total` after the loop.',
        starter: `function scramble(text) {
  // Start with total = 7.
  // For each character i:  total = (total * 31 + text.charCodeAt(i)) % 1000
  // return total.

}
say("cat: " + scramble("cat"));
say("act: " + scramble("act"));`,
        tests: [
          { run: 'scramble("cat")', want: 799 },
          { run: 'scramble("act")', want: 939, label: 'The same letters in a different order give a different number: 939' },
          { run: 'scramble("")', want: 7 },
          { run: 'scramble("plum-kite-88")', want: 564 },
        ],
      }),
      code('b', 'Write `signUp`. It stores the **scrambled** password under the member\'s name, never the password itself.', {
        more: '`users` is an object: a set of names, each with a value. `users[name] = 5` stores 5 under that name. Because `scramble` is a function, you can reuse it here without writing it again.',
        hint: 'One line stores: `users[name] = scramble(password);` One more line returns the word "saved".',
        setup: join(SCRAMBLE, 'var users = {};'),
        starter: `// users starts as an empty object: {}
// scramble(text) from step a is ready to use.
function signUp(name, password) {
  // Store the scrambled password under the name: users[name] = ...
  // Never store the password itself.
  // return "saved".

}
say(signUp("mika", "plum-kite-88"));
say(users);`,
        tests: [
          { run: 'signUp("dev", "river-tuba-31")', want: 'saved' },
          { run: 'users.dev', want: 27, label: 'users.dev holds the scrambled number 27' },
          { run: 'users.mika', want: 564, label: 'users.mika holds the scrambled number 564' },
          { run: 'JSON.stringify(users).includes("plum")', want: false, label: 'The password itself is not stored anywhere' },
        ],
      }),
      code('c', 'Write `signIn`. Scramble what the member typed, and compare it with the stored number.', {
        more: 'The system never needs the real password. The same text always gives the same hash, so matching numbers mean the right password was typed. `===` asks: are these two exactly the same?',
        hint: 'Compare `scramble(password)` with `users[name]` using `===`. That comparison is already true or false, so you can return it.',
        setup: join(SCRAMBLE, 'var users = { mika: scramble("plum-kite-88"), dev: scramble("river-tuba-31") };'),
        starter: `// users already holds two scrambled passwords, for "mika" and "dev".
// It looks like this: { mika: 564, dev: 27 }
function signIn(name, password) {
  // Scramble the password that was typed.
  // return true if it equals the stored number for this name. If not, return false.

}
say("Right password: " + signIn("mika", "plum-kite-88"));
say("Wrong password: " + signIn("mika", "plum-kite-99"));`,
        tests: [
          { run: 'signIn("mika", "plum-kite-88")', want: true },
          { run: 'signIn("mika", "plum-kite-99")', want: false },
          { run: 'signIn("dev", "river-tuba-31")', want: true },
          { run: 'signIn("dev", "plum-kite-88")', want: false, label: 'One member\'s password does not open another member\'s account' },
          { run: 'signIn("nobody", "abc")', want: false },
        ],
      }),
      lab('d', 'In our toy, "plum-kite-88" and "3426" both scramble to 564. So "3426" signs in as mika! Why does this happen?', {
        type: 'mcq',
        choices: ['The toy has only 1,000 results, so many passwords share one', 'Mika typed the password wrong', 'The computer made a mistake', 'Hashes never work'],
        answer: 0,
        why: 'With only 1,000 results, a program finds a match in seconds. Real hash functions are built and tested by experts, with more results than anyone could ever try.',
      }, 'Never use a home-made hash for real passwords. A real system uses a trusted, tested tool, and adds extra steps that make every guess slow.'),
    ],
    quiz: [
      q('q1', 'Why does a system store a hash and not the password itself?', ['To save space', 'So a thief who copies the list does not get the passwords', 'To make sign-in slower', 'So staff can read passwords']),
      q('q2', 'How does sign-in check a password that was never stored?', ['It asks you twice', 'It scrambles what you typed and compares the results', 'It unscrambles the stored number', 'It guesses']),
      q('q3', 'What does "one-way" mean for a hash?', ['It only works once', 'You cannot turn the number back into the password', 'It only goes left', 'Only one person can use it']),
      q('q4', 'You are building a real club website. What is the right way to handle passwords?', ['Write your own scramble', 'Keep them in a plain list', 'Use a trusted, tested sign-in tool, with help from an expert', 'Email them to yourself']),
    ],
    ship: {
      prompt: 'Explain to someone at home how a site can check your password without keeping a copy of it.',
      frame: 'The site stores ___, not my password. When I sign in, it ___ and then ___.',
      stretch: 'Change 1000 to 10 in step a and run it. How many different results are possible now? Find two short words that give the same result.',
    },
    teacher: { note: 'Say it more than once: the toy shows the idea only. Step d proves it is weak. Real password storage uses expert-made, deliberately slow hash functions, and nobody should write their own.' },
  },

  // ------------------------------------------------------------------ 5
  {
    id: 'g7-05', title: 'Crack the Caesar', project: true,
    question: 'How can a program read a secret message without the key?',
    goal: 'I can write a Caesar cipher and a program that cracks it by trying every key.',
    standards: ['6-8.CS.c.3', '6-8.CT.d.3', '6-8.CT.d.4'],
    job: ['Cryptanalyst', 'A person who tests secret codes to see if they can be broken, so that weak ones get replaced.'],
    mission: {
      story: [
        'A worker at the Midtown Clock Tower finds an old note written in scrambled letters. The museum asks you to read it.',
        'The note uses a **Caesar cipher**. Every letter is moved the same number of places along the alphabet. That number is the **key**.',
        'There are only 25 keys. You will build the cipher, then a program that tries all 25 and picks the result that reads like English.',
      ],
      vocab: [
        ['Cipher', 'A set of steps that scrambles a message so only some people can read it.'],
        ['Key', 'The secret that locks and unlocks a cipher. Here it is the size of the shift.'],
        ['Encrypt', 'To scramble a message with a cipher.'],
        ['Decrypt', 'To turn a scrambled message back into the real one.'],
      ],
      talk: 'If a shift of 26 moves every letter all the way round the alphabet, what does the message look like?',
      rule: 'Only crack messages that were made for you to practise on, or that the owner asked you to read. Other people\'s private messages are not yours to open.',
    },
    steps: [
      code('a', 'Write `shiftLetter`. It moves one letter along the alphabet by `shift` places, and wraps round from z to a.', {
        more: '`ALPHA.indexOf("c")` gives 2, the place of c. `ALPHA[2]` gives "c" back. `% 26` wraps a number round: 27 % 26 is 1, so the letter after z is a again. Spaces are not in ALPHA, so `indexOf` gives -1 for them.',
        hint: 'Save the place: `const at = ALPHA.indexOf(letter);`. If `at` is -1, return the letter. If not, return `ALPHA[(at + shift) % 26]`.',
        setup: ALPHA,
        starter: `// ALPHA is "abcdefghijklmnopqrstuvwxyz".
// ALPHA.indexOf("c") gives 2. ALPHA[2] gives "c".
function shiftLetter(letter, shift) {
  // Find the place of the letter in ALPHA.
  // If it is not there (indexOf gives -1), return the letter unchanged.
  // If it is, return the letter that is shift places later. Wrap round with % 26.

}
say("a becomes " + shiftLetter("a", 3));
say("y becomes " + shiftLetter("y", 3));`,
        tests: [
          { run: 'shiftLetter("a", 3)', want: 'd' },
          { run: 'shiftLetter("y", 3)', want: 'b', label: 'It wraps round: y shifted by 3 gives "b"' },
          { run: 'shiftLetter(" ", 5)', want: ' ', label: 'A space stays a space' },
          { run: 'shiftLetter("m", 13)', want: 'z' },
        ],
      }),
      code('b', 'Write `caesar`. It shifts every letter of a text and returns the new text.', {
        more: 'Build the answer one letter at a time: start with `""` and add to it with `+`. To undo a shift of 3, shift by 23, because 3 + 23 = 26: one full trip round the alphabet.',
        hint: 'Use `let result = "";` and a loop from 0 to `text.length`. Inside: `result = result + shiftLetter(text[i], shift);`',
        setup: join(ALPHA, SHIFT),
        starter: `// shiftLetter(letter, shift) from step a is ready to use.
function caesar(text, shift) {
  // Start with an empty text: ""
  // Add the shifted version of each letter of text.
  // return the new text.

}
const secret = caesar("meet at the clock tower", 3);
say(secret);
say(caesar(secret, 23));`,
        tests: [
          { run: 'caesar("abc", 1)', want: 'bcd' },
          { run: 'caesar("meet at the clock tower", 3)', want: 'phhw dw wkh forfn wrzhu' },
          { run: 'caesar("xyz", 4)', want: 'bcd' },
          { run: 'caesar("phhw dw wkh forfn wrzhu", 23)', want: 'meet at the clock tower', label: 'A shift of 23 undoes a shift of 3' },
        ],
      }),
      code('c', 'A cracker must know when a result looks like English. Write `score`: count the words of a text that are common words.', {
        more: '`text.split(" ")` cuts a text into a list of words at each space. `COMMON.includes(word)` is true when the word is in the list. Real messages score high. Scrambled ones score 0.',
        hint: 'Make the list with `const words = text.split(" ");`. Loop over it with a counter. Add 1 when `COMMON.includes(words[i])` is true.',
        setup: join(ALPHA, COMMON),
        starter: `// COMMON is a list of 13 common English words:
// the, and, is, at, to, of, in, we, you, it, are, on, for
function score(text) {
  // Split the text into words: text.split(" ")
  // Count how many of the words are in COMMON.
  // return the count.

}
say("Real: " + score("meet at the clock tower"));
say("Scrambled: " + score("phhw dw wkh forfn wrzhu"));`,
        tests: [
          { run: 'score("meet at the clock tower")', want: 2 },
          { run: 'score("phhw dw wkh forfn wrzhu")', want: 0 },
          { run: 'score("we are in the park and it is cold")', want: 7 },
          { run: 'score("the")', want: 1 },
        ],
      }),
      code('d', 'Now the cracker. Write `crack`: try every shift from 1 to 25 and return the result with the highest score.', {
        more: 'This is brute force on the **key**. Keep two things as you loop: the best text so far, and its score. When a new result beats the best score, it becomes the new best.',
        hint: 'Before the loop: `let best = "";` and `let bestScore = -1;`. In the loop, make `caesar(secret, shift)`. If its score is higher than `bestScore`, save both.',
        setup: join(ALPHA, SHIFT, CAESAR, COMMON, SCORE),
        starter: `// caesar(text, shift) and score(text) are ready to use.
function crack(secret) {
  // Try every shift from 1 to 25.
  // Keep the result with the highest score.
  // return that result: the message you can read.

}
say(crack("phhw dw wkh forfn wrzhu"));`,
        tests: [
          { run: 'crack("phhw dw wkh forfn wrzhu")', want: 'meet at the clock tower' },
          { run: 'crack(caesar("we are in the park and it is cold", 11))', want: 'we are in the park and it is cold', label: 'It cracks a message shifted by 11' },
          { run: 'crack(caesar("bring the map to the bridge at nine", 7))', want: 'bring the map to the bridge at nine', label: 'It cracks a message shifted by 7' },
        ],
      }),
      lab('e', 'Your cracker read every note in a blink. You are the defender now. What makes the Caesar cipher so weak?', {
        type: 'mcq',
        choices: ['It has only 25 keys, so a program can try them all', 'The letters are too small', 'It only works in English', 'It is too old to work'],
        answer: 0,
        why: 'A cipher is only as strong as its number of keys. A defender picks a cipher with far too many keys to try. That is the next lesson.',
      }, 'Never protect anything real with a Caesar cipher. It is a puzzle, not a lock.'),
    ],
    quiz: [
      q('q1', 'How many different shifts can a Caesar cipher use to hide a message?', ['25', '100', '1,000', '26 million']),
      q('q2', 'How does the cracker know which of the 25 results is the real message?', ['It asks the sender', 'It picks the one with the most common words', 'It picks the longest one', 'It picks the first one']),
      q('q3', 'A message was shifted by 5. Which shift turns it back?', ['5', '21', '25', '26']),
      q('q4', 'What should a defender learn from this lesson?', ['Use a cipher with far too many keys to try', 'Always use shift 13', 'Write in small letters', 'Keep using Caesar but tell nobody']),
    ],
    ship: {
      prompt: 'Explain how your program cracks a Caesar message without knowing the key, and what that tells a defender.',
      frame: 'My cracker tries ___ and keeps the result that ___. This shows that a cipher needs ___.',
      stretch: 'Make `crack` in step d also report the key. Return text like "shift 3: meet at the clock tower". Careful: which shift did the sender use?',
    },
    teacher: { note: 'Project lesson: allow two sessions. Steps a to d build on each other, and each step gives the earlier functions ready-made, so a student who was stuck can still go on. Pair students to test each other\'s secret notes.' },
  },

  // ------------------------------------------------------------------ 6
  {
    id: 'g7-06', title: 'Keys That Hold',
    question: 'What makes a key strong?',
    goal: 'I can write a keyword cipher and show why a longer key is harder to crack.',
    standards: ['6-8.CS.c.3', '6-8.CT.d.1'],
    job: ['Cryptographer', 'A person who designs ciphers and keys so that private messages stay private.'],
    mission: {
      story: [
        'Last lesson your cracker read the Clock Tower note in a blink. Now the museum wants to send notes between its buildings, and it wants a cipher that holds.',
        'A **keyword cipher** uses a word as the key. Each letter of the word gives a different shift, so the letters of the message do not all move the same way.',
        'You will build it, count its keys, and aim your own cracker at it.',
      ],
      vocab: [
        ['Keyword', 'A word used as a key. Each of its letters sets one shift.'],
        ['Key space', 'All the keys a cipher could use. Bigger is safer.'],
        ['Encrypt', 'To scramble a message with a cipher and a key.'],
      ],
      talk: 'A key with 1 letter has 26 choices. How many choices do you think a key with 2 letters has? Why?',
      rule: 'A key is only for the people it was shared with. If you find someone else\'s key, do not use it: report it to them or to a trusted adult.',
    },
    steps: [
      code('a', 'Each key letter is a shift: a is 0, b is 1, c is 2. Write `keyShift`: the shift to use at place `i` of a message.', {
        more: 'The key repeats along the message: c a b c a b. `i % key.length` turns any place into a place inside the key. With the key "cab", place 4 uses 4 % 3 = 1, the letter "a".',
        hint: 'First get the key letter: `key[i % key.length]`. Then return its place in the alphabet with `ALPHA.indexOf(...)`.',
        setup: ALPHA,
        starter: `// ALPHA is "abcdefghijklmnopqrstuvwxyz". ALPHA.indexOf("c") gives 2.
// The key is a word, like "cab". It repeats: c a b c a b ...
function keyShift(key, i) {
  // Pick the key letter for place i. Use i % key.length to wrap round.
  // return that letter's place in ALPHA.

}
say(keyShift("cab", 0));
say(keyShift("cab", 4));`,
        tests: [
          { run: 'keyShift("cab", 0)', want: 2 },
          { run: 'keyShift("cab", 1)', want: 0 },
          { run: 'keyShift("cab", 4)', want: 0, label: 'The key repeats: keyShift("cab", 4) gives 0' },
          { run: 'keyShift("cab", 5)', want: 1 },
          { run: 'keyShift("lemon", 7)', want: 12 },
        ],
      }),
      code('b', 'Write `keyCipher`. It shifts letter `i` of the text by `keyShift(key, i)`, so each letter gets its own shift.', {
        more: 'This is the Caesar loop from last lesson with one change: the shift is no longer one fixed number. Experts call this a Vigenère cipher. People used it for hundreds of years.',
        hint: 'Start with `let result = "";`. In a loop over the text: `result = result + shiftLetter(text[i], keyShift(key, i));`',
        setup: join(ALPHA, SHIFT, KEY_SHIFT),
        starter: `// shiftLetter(letter, shift) and keyShift(key, i) are ready to use.
function keyCipher(text, key) {
  // Start with an empty text: ""
  // Shift letter number i of the text by keyShift(key, i), and add it on.
  // return the new text.

}
say(keyCipher("aaaaaa", "cab"));
say(keyCipher("meet at noon", "lemon"));`,
        tests: [
          { run: 'keyCipher("aaaaaa", "cab")', want: 'cabcab' },
          { run: 'keyCipher("meet at noon", "lemon")', want: 'xiqh lx bbzr' },
          { run: 'keyCipher("abc", "b")', want: 'bcd' },
          { run: 'keyCipher("hello", "key")', want: 'rijvs' },
        ],
      }),
      code('c', 'How many keys are there? Each key letter has 26 choices. Write `howManyKeys` for a key of any length.', {
        more: 'One letter: 26 keys. Two letters: 26 × 26. Every extra letter multiplies the **key space** by 26. Compare 25 keys for Caesar with the number for 8 letters.',
        hint: 'Start with `let total = 1;`. Multiply it by 26 once for every letter of the key, in a loop. Then return it.',
        starter: `function howManyKeys(length) {
  // Each letter of the key has 26 choices.
  // return how many different keys have this many letters.

}
say("1 letter: " + howManyKeys(1));
say("3 letters: " + howManyKeys(3));
say("8 letters: " + howManyKeys(8));`,
        tests: [
          { run: 'howManyKeys(1)', want: 26 },
          { run: 'howManyKeys(2)', want: 676 },
          { run: 'howManyKeys(3)', want: 17576 },
          { run: 'howManyKeys(5)', want: 11881376 },
          { says: '8 letters: 208827064576' },
        ],
      }),
      code('d', 'Aim last lesson\'s cracker at your cipher. Write `holds`: true when the cracker fails to get the message back.', {
        more: 'Look at the keys "d" and "dd". Every letter gets the same shift, so they are only a Caesar cipher and the cracker wins. A key holds when it is long **and** its letters differ.',
        hint: 'Make `const secret = keyCipher(message, key);`. Then compare `crackCaesar(secret)` with `message`. `!==` means "is not the same as".',
        setup: join(ALPHA, SHIFT, CAESAR, COMMON, SCORE, CRACK('crackCaesar'), KEY_SHIFT, KEY_CIPHER),
        starter: `// crackCaesar(secret) is last lesson's cracker. It tries all 25 shifts.
// keyCipher(text, key) is your cipher from step b.
function holds(message, key) {
  // Scramble the message with the key.
  // Give the result to crackCaesar.
  // return true if the cracker did NOT get the message back. If it did, return false.

}
const note = "meet me at the fountain at noon";
say("Key d: " + holds(note, "d"));
say("Key dd: " + holds(note, "dd"));
say("Key lemon: " + holds(note, "lemon"));`,
        tests: [
          { run: 'holds(note, "d")', want: false, label: 'A 1-letter key does not hold: it is a Caesar cipher' },
          { run: 'holds(note, "dd")', want: false, label: 'The key "dd" does not hold: both letters give the same shift' },
          { run: 'holds(note, "lemon")', want: true },
          { run: 'holds("we are in the park and it is cold", "river")', want: true },
          { run: 'holds("we are in the park and it is cold", "bbbbb")', want: false, label: 'A long key of one repeated letter does not hold' },
        ],
      }),
    ],
    quiz: [
      q('q1', 'In a keyword cipher, what does each letter of the key do?', ['It sets the shift for one letter of the message', 'It deletes a letter', 'It counts the words', 'Nothing']),
      q('q2', 'How many keys are there with 3 letters?', ['26', '78', '676', '17,576']),
      q('q3', 'Why does the Caesar cracker fail against the key "lemon"?', ['The letters do not all move by the same shift', 'The message is too long', 'The cracker is slow', 'It only reads capitals']),
      q('q4', 'Which key is the best defence?', ['a', 'dd', 'A long key that is hard to guess, shared only with the reader', 'The word "key"']),
    ],
    ship: {
      prompt: 'Explain why the key "lemon" protects a note better than the key "d". Use the number of keys in your answer.',
      frame: 'A longer key is stronger because ___. A key with 5 letters has ___ choices, but ___.',
      stretch: 'Write `unlock(secret, key)` that turns a scrambled note back. Tip: to undo a shift, shift by 26 minus that shift.',
    },
    teacher: { note: 'Be honest with the class: experts can crack this cipher too, with more work than trying 25 shifts. Modern encryption uses keys so long that trying them all is not possible. The lesson is the idea of key space.' },
  },

  // ------------------------------------------------------------------ 7
  {
    id: 'g7-07', title: 'The Phishing Detector', sensitive: true,
    question: 'How can a program help people spot a fake message?',
    goal: 'I can write and tune a detector that scores messages for signs of phishing.',
    standards: ['6-8.CAS.a.1', '6-8.CAS.c.4', '6-8.CT.d.6'],
    job: ['Email security analyst', 'A person who studies fake messages and tunes the filters that catch them before they reach people.'],
    mission: {
      story: [
        'Midtown Middle School gets hundreds of emails a day. A few are **phishing**: fake messages built to trick people into giving away passwords or money.',
        'These messages are made by people who are experts at fooling others. Anyone can be fooled: students, teachers, even security workers. It is never the fault of the person who was tricked.',
        'The school asks you to build a detector that gives each message a score. Then you will tune it, one small change at a time.',
      ],
      vocab: [
        ['Phishing', 'A fake message built to trick people into giving away something private.'],
        ['Clue word', 'A word that fake messages use a lot, such as "urgent".'],
        ['False alarm', 'When a detector flags a real message by mistake.'],
        ['Tune', 'To change a setting a little, test, and change it again.'],
      ],
      talk: 'Fake messages often say "act now!". Why do you think they try to rush people?',
      rule: 'If a message seems odd, do not click or reply. Report it to a teacher or a trusted adult, even if you already clicked.',
    },
    steps: [
      code('a', 'Write `countClues`. It counts how many of the clue words appear in a message text.', {
        more: 'Fake messages often rush you, promise a prize or ask for a password. `text.toLowerCase()` gives the text in small letters, so "URGENT" and "urgent" both match. `lower.includes(word)` is true when the word is inside the text.',
        hint: 'Save `const lower = text.toLowerCase();`. Loop over `clues` with a counter. Add 1 each time `lower.includes(clues[i])` is true.',
        starter: `function countClues(text, clues) {
  // Make the text lower case: text.toLowerCase()
  // Count how many of the clue words are in it.
  // return the count.

}
say(countClues("URGENT! You won a prize.", ["urgent", "prize", "password"]));`,
        tests: [
          { run: 'countClues("URGENT! You won a prize.", ["urgent", "prize", "password"])', want: 2 },
          { run: 'countClues("Practice is on Tuesday.", ["urgent", "prize", "password"])', want: 0 },
          { run: 'countClues("Send your password now", ["now", "password", "send"])', want: 3 },
          { run: 'countClues("Urgent, urgent, urgent", ["urgent"])', want: 1, label: 'A clue word counts once, even if it appears three times' },
        ],
      }),
      code('b', 'Words are one clue. The sender is another. Write `score`: the clue count, plus 2 when the sender is not trusted.', {
        more: 'Fakes often come from an address that looks nearly right, with one letter changed. `trusted(msg.from)` checks the ending of the address against the school\'s list. `!` means "not".',
        hint: 'Start with `let points = countClues(msg.text, clues);`. Then `if (!trusted(msg.from))` add 2. Return `points`.',
        setup: join(INBOX, COUNT_CLUES, CLUES),
        starter: `// inbox is a list of 14 pretend messages. One looks like this:
// { from: "office@midtownschool.example", text: "Urgent: buses are late.", fake: false }
// clues is ["urgent", "prize", "password"]. countClues(text, clues) is ready.
// trusted(from) is true when the sender's address is one the school knows.
function score(msg) {
  // Start with the number of clue words in msg.text.
  // If the sender is NOT trusted, add 2.
  // return the score.

}
say(inbox[0].from + ": " + inbox[0].text);
say("Score: " + score(inbox[0]));`,
        tests: [
          { run: 'score(inbox[0])', want: 4, label: 'The first message scores 4' },
          { run: 'score(inbox[6])', want: 1, label: 'The school\'s bus message scores 1' },
          { run: 'score(inbox[10])', want: 2, label: 'A birthday message from an unknown address scores 2' },
          { run: 'score({ from: "x@nowhere.test", text: "Urgent prize password" })', want: 5 },
        ],
      }),
      code('c', 'A message is **flagged** when its score reaches the limit. Write `missed`: how many fakes get past a given limit?', {
        more: 'A detector can be wrong in two ways. It can **miss** a fake. Or it can flag a real message: a **false alarm**. A high limit misses more fakes. A low limit gives more false alarms.',
        hint: 'Loop over `inbox` with a counter. Count a message when `inbox[i].fake` is true and `score(inbox[i]) < limit`. Use `&&` for "and".',
        setup: join(INBOX, COUNT_CLUES, CLUES, MSG_SCORE),
        starter: `// score(msg) is ready. A message is flagged when its score is limit or more.
// msg.fake is true for the 6 messages in inbox that really are fake.
function missed(limit) {
  // Count the fake messages in inbox that are NOT flagged.
  // return the count.

}
say("Limit 4 misses " + missed(4) + " fakes");
say("Limit 2 misses " + missed(2) + " fakes");`,
        tests: [
          { run: 'missed(4)', want: 4 },
          { run: 'missed(3)', want: 3 },
          { run: 'missed(2)', want: 1 },
          { run: 'missed(99)', want: 6, label: 'A limit of 99 misses all 6 fakes' },
        ],
      }),
      code('d', 'Tune the detector. Change `limit`, and add or remove clue words, until it misses 1 fake or fewer with 0 false alarms.', {
        more: 'Work in small steps: change one thing, run, and read the mistakes. One fake comes from a real account that someone took over. Clue words will not catch it. That is why people must report odd messages too.',
        hint: 'Read the MISSED lines. Which words do those fakes share that real messages do not use? Add them to `clues`. Leave `limit` high enough to spare the real messages.',
        setup: join(INBOX, COUNT_CLUES, MSG_SCORE, TUNING),
        starter: `// Goal: miss 1 fake or fewer, with 0 false alarms.
// Change the limit. Add clue words, or take some out.
const clues = ["urgent", "prize", "password"];
const limit = 4;

say("Fakes missed: " + missed(limit));
say("False alarms: " + falseAlarms(limit));
showMistakes(limit); // prints every message the detector got wrong`,
        tests: [
          { run: 'missed(limit) <= 1', want: true, label: 'It misses 1 fake or fewer' },
          { run: 'falseAlarms(limit)', want: 0, label: 'It flags no real messages' },
        ],
      }),
      lab('e', 'No detector catches everything, so people matter too. Sort each move: good, or risky?', {
        type: 'sort', bins: ['Good move', 'Risky move'],
        items: [
          ['Report an odd message to a teacher or trusted adult', 0],
          ['Click the link to see if it is real', 1],
          ['Ask the sender in person if they sent it', 0],
          ['Reply with the code, just in case it is real', 1],
          ['Tell a friend who was fooled that it can happen to anyone, and help them report it', 0],
          ['Hide that you clicked, so nobody finds out', 1],
        ],
      }, 'Reporting quickly is the best fix, even after a click. A password can be changed. Nobody should feel ashamed: these messages are built to fool people.'),
    ],
    quiz: [
      q('q1', 'Which is the strongest sign that a message may be fake?', ['It is short', 'It rushes you and asks for a password', 'It says hello', 'It arrives on a Monday']),
      q('q2', 'Your detector flags a real message from your teacher. What is this called?', ['A false alarm', 'A missed fake', 'A password', 'A clue word']),
      q('q3', 'You lower the limit so the detector flags more messages. What can go wrong?', ['It misses more fakes', 'It flags more real messages', 'It deletes the inbox', 'Nothing can go wrong']),
      q('q4', 'A friend typed a password into a fake page. What is the best thing to say?', ['You should have known', 'It was built to fool people. Let\'s tell a teacher and change it.', 'Keep it secret', 'Say nothing']),
    ],
    ship: {
      prompt: 'Describe one change you made while tuning, and what it did to the missed fakes and the false alarms.',
      frame: 'I changed ___. After that, the detector ___. A detector cannot catch every fake because ___.',
      stretch: 'In step d, try to catch the last fake by adding clue words. Does a false alarm appear? What does that tell you about detectors?',
    },
    teacher: { note: 'Some students or their families will have been fooled by a message like these. Never treat that as a failing. If a student shares something, listen, do not promise secrecy, and follow school policy by telling the counselor.' },
  },

  // ------------------------------------------------------------------ 8
  {
    id: 'g7-08', title: 'How Malware Spreads',
    question: 'Why do updates matter so much?',
    goal: 'I can use a simulation to show how updates slow the spread of malware.',
    standards: ['6-8.CAS.a.1', '6-8.CT.e.2', '6-8.CT.e.3'],
    job: ['Malware analyst', 'A person who studies harmful programs in a sealed lab and writes the patterns that scanners look for.'],
    mission: {
      story: [
        'The computer lab at Midtown Middle has 12 computers in a row. The teacher wants to show how **malware**, a harmful program, could move from one computer to the next.',
        'Nothing here is real malware. Ours is only the word "sick" moving through a list. That is a **simulation**: a safe model of a real thing.',
        'You will run the model, change its rates, and write a scanner that finds a made-up pattern in pretend files.',
      ],
      vocab: [
        ['Malware', 'A program made to harm a computer or the people who use it.'],
        ['Simulation', 'A model that follows fixed rules, so you can test ideas safely.'],
        ['Update', 'A fix from the maker of a program. It closes the gaps malware uses.'],
        ['Pattern', 'A piece of text that a scanner looks for to spot a known bad file.'],
      ],
      talk: 'In what ways is malware spreading between computers like a cold spreading in a class? In what ways is it different?',
      rule: 'Making or spreading real malware is against the law. If you think a device has malware, stop using it and report it to a trusted adult.',
    },
    steps: [
      code('a', 'A row of computers is a list of words. Write `countSick`: how many computers in a row are "sick"?', {
        more: 'In this model, "sick" means the computer carries the pretend flag. "ok" means it does not. "safe" means it has the update, so the flag cannot move in. `row[i] === "sick"` checks one computer.',
        hint: 'Start a counter at 0. Loop from 0 to `row.length`. Add 1 when `row[i] === "sick"`. Return the counter.',
        starter: `// A row of pretend computers looks like this: ["sick", "ok", "ok", "safe"]
function countSick(row) {
  // return how many computers in the row are "sick".

}
say(countSick(["sick", "ok", "sick", "safe"]));`,
        tests: [
          { run: 'countSick(["sick", "ok", "sick", "safe"])', want: 2 },
          { run: 'countSick(["ok", "ok"])', want: 0 },
          { run: 'countSick(["sick", "sick", "sick", "safe", "ok"])', want: 3 },
          { run: 'countSick([])', want: 0 },
        ],
      }),
      code('b', 'Write `simulate`. It runs the model round by round, prints a picture of each round, and returns how many end up sick.', {
        more: 'Each round, helpers update some computers, starting from the far end of the row. Then every sick computer passes the flag to the computers next to it on the right. Same rules, same result, every time.',
        hint: 'Use `let row = newRow();` and a loop `for (let r = 1; r <= rounds; r++)`. Inside: `row = nextRound(row, spread, updates);` then the `say` line.',
        setup: join(SIM, COUNT_SICK),
        starter: `// newRow() gives 12 computers. The first is "sick". The rest are "ok".
// nextRound(row, spread, updates) gives the row after one more round.
// show(row) gives a picture: X is sick, . is ok, U is updated.
// countSick(row) from step a is ready to use.
function simulate(spread, updates, rounds) {
  // Start with newRow().
  // For each round r, from 1 to rounds: get the next row, then
  //   say("Round " + r + ": " + show(row));
  // return countSick(row) at the end.

}
say("No updates. Sick at the end: " + simulate(1, 0, 4));
say("With updates. Sick at the end: " + simulate(2, 1, 3));`,
        tests: [
          { says: 'Round 4: XXXXX.......', label: 'No updates: round 4 looks like XXXXX.......' },
          { says: 'No updates. Sick at the end: 5' },
          { says: 'Round 3: XXXXXXX..UUU', label: 'With updates: round 3 looks like XXXXXXX..UUU' },
          { says: 'With updates. Sick at the end: 7' },
          { uses: 'nextRound(' },
        ],
      }),
      code('c', 'The flag reaches 2 new computers a round: you cannot change that. Raise `updates` until 3 or fewer computers end up sick.', {
        more: 'This is a race. The flag moves in from the left. The updates move in from the right. Run it, read the pictures, change one number and run it again. That is how people use a simulation.',
        hint: 'Leave `spread` at 2. Try a bigger number for `updates`, run, and look at the last round. Keep going until the count is 3 or less.',
        setup: join(SIM, COUNT_SICK, SIMULATE),
        starter: `// spread: how many computers one sick computer reaches each round.
// updates: how many computers the helpers update each round.
const spread = 2;
const updates = 1;

const sick = simulate(spread, updates, 6);
say("Sick at the end: " + sick);`,
        tests: [
          { run: 'spread', want: 2, label: 'spread is still 2' },
          { run: 'sick <= 3', want: true, label: '3 or fewer computers end up sick' },
          { uses: 'simulate(spread, updates, 6)' },
        ],
      }),
      code('d', 'Updates stop the spread. A scanner finds what is already there. Write `scan`: the names of all files whose text holds a pattern.', {
        more: 'A scanner keeps a list of known **patterns** and looks for them in files. Ours is a made-up word. `text.includes(pattern)` is true when the pattern is inside the text. `list.push(x)` adds x to the end of a list.',
        hint: 'Make `const found = [];`. Loop over `list`. When `list[i].text.includes(pattern)` is true, push `list[i].name`. Return `found`.',
        setup: FILES,
        starter: `// files is a list of 5 pretend files. One looks like this:
// { name: "game-mod.txt", text: "speed=9 ZZ-FLAG-77 lives=3" }
// "ZZ-FLAG-77" is a made-up pattern. Nothing here is real malware.
function scan(list, pattern) {
  // Make an empty list: []
  // Add the name of every file whose text includes the pattern.
  // return the list of names.

}
say(scan(files, "ZZ-FLAG-77"));`,
        tests: [
          { run: 'scan(files, "ZZ-FLAG-77")', want: ['game-mod.txt', 'free-coins.txt'] },
          { run: 'scan(files, "QQ-FLAG-12")', want: ['photo-list.txt'] },
          { run: 'scan(files, "NO-SUCH-PATTERN")', want: [], label: 'No match gives an empty list' },
          { run: 'scan([{ name: "a.txt", text: "xyz" }], "y")', want: ['a.txt'] },
        ],
      }),
    ],
    quiz: [
      q('q1', 'In the simulation, what does an update do to a computer?', ['Makes it sick', 'Makes it safe, so the flag cannot move in', 'Turns it off', 'Removes it from the row']),
      q('q2', 'Spread stays at 2. You raise updates from 1 to 5. What happens?', ['More computers end up sick', 'Fewer computers end up sick', 'Nothing changes', 'The row gets longer']),
      q('q3', 'How does the scanner find a bad file?', ['It looks for a known pattern in the file', 'It checks how big the file is', 'It guesses', 'It asks the file']),
      q('q4', 'Your device says an update is ready. What is the safest choice?', ['Ignore it for months', 'Install it soon, with a trusted adult if needed', 'Stop using the device for ever', 'Lend the device to a friend']),
    ],
    ship: {
      prompt: 'Report what your simulation showed. Which update rates did you try, and how many computers ended up sick each time?',
      frame: 'With ___ updates a round, ___ computers ended up sick. With ___, only ___ did. This shows that ___.',
      stretch: 'In step c, set `spread` to 3. How many updates a round do you need now to keep the count at 3 or fewer?',
    },
    teacher: { note: 'The model is a list of words and nothing more: say so. Ask what the model leaves out (people, networks that are not a row, new malware with no known pattern) so students see a simulation as a simplification.' },
  },

  // ------------------------------------------------------------------ 9
  {
    id: 'g7-09', title: 'Listening on the Wire',
    question: 'Who can read what you send over public Wi-Fi?',
    goal: 'I can tell which packets a listener can read, and write firewall rules.',
    standards: ['6-8.CAS.a.1', '6-8.CS.c.3'],
    job: ['Network security engineer', 'A person who watches the traffic on a network and writes the firewall rules that keep bad packets out.'],
    mission: {
      story: [
        'The Bean Stop cafe in Midtown has free Wi-Fi. The owner asks you a question: can someone at the next table read what my customers send?',
        'Messages cross a network in small pieces called **packets**. On open Wi-Fi, anyone nearby can pick them up. If a packet is not scrambled, they can read it.',
        'You will look at pretend packets from the cafe. Then you will write the **firewall** rules that decide which packets get through.',
      ],
      vocab: [
        ['Packet', 'A small piece of a message, with labels saying where it is from and where it is going.'],
        ['Port', 'A numbered door on a computer. Each kind of traffic uses its own door.'],
        ['Scrambled', 'Encrypted, so only the sender and the receiver can read it.'],
        ['Firewall', 'A guard that checks each packet against rules and allows or blocks it.'],
      ],
      talk: 'A packet is like a postcard. A scrambled packet is like a sealed letter. What can a mail carrier learn from each?',
      rule: 'Listening to other people\'s network traffic without permission is against the law. Only look at packets on a network you own or were asked to test.',
    },
    steps: [
      code('a', 'You are testing the cafe Wi-Fi with the owner\'s permission. Write `listen`: what can a listener read from one packet?', {
        more: 'Every packet has labels: who it is **from**, who it goes **to**, and which **port** (door) it uses. The message is in `data`. When `packet.scrambled` is true, the data is only a jumble to a listener.',
        hint: 'One `if`: when `packet.scrambled` is true, return the text "(cannot read)". After the if, return `packet.data`.',
        setup: PACKETS,
        starter: `// packets is a list of 7 pretend packets. One looks like this:
// { from: "10.0.0.5", to: "10.0.0.1", port: 80, scrambled: false, data: "page=menu" }
function listen(packet) {
  // If the packet is scrambled, return "(cannot read)".
  // If not, return its data.

}
say(listen(packets[0]));
say(listen(packets[2]));`,
        tests: [
          { run: 'listen(packets[0])', want: 'page=menu' },
          { run: 'listen(packets[2])', want: '(cannot read)' },
          { run: 'listen(packets[1])', want: 'name=dev password=river-tuba-31', label: 'A plain packet shows everything, even a made-up password' },
          { run: 'listen({ scrambled: true, data: "abc" })', want: '(cannot read)' },
        ],
      }),
      code('b', 'Write `overheard`: the list of everything a listener could read from all the packets on the Wi-Fi.', {
        more: 'Look at what comes out. One customer sent a sign-in over a plain page, so the made-up password is there for anyone to read. The scrambled packets give the listener nothing.',
        hint: 'Make `const heard = [];`. Loop over `list`. When a packet is not scrambled (`!list[i].scrambled`), push its data. Return `heard`.',
        setup: PACKETS,
        starter: `// Each packet has: from, to, port, scrambled (true or false) and data.
function overheard(list) {
  // Make an empty list: []
  // Add the data of every packet that is NOT scrambled.
  // return the list.

}
say(overheard(packets));`,
        tests: [
          { run: 'overheard(packets)', want: ['page=menu', 'name=dev password=river-tuba-31', 'open remote control', 'search=bus times'] },
          { run: 'overheard(packets.slice(2, 4))', want: [], label: 'Two scrambled packets give the listener nothing' },
          { run: 'overheard([{ scrambled: false, data: "hi" }, { scrambled: true, data: "q#1" }])', want: ['hi'] },
        ],
      }),
      code('c', 'Now defend the cafe. Write the firewall rule `allow`: block packets from blocked addresses, and block every port except 443.', {
        more: 'Port 443 is the door for scrambled web pages. Port 80 is the door for plain ones. This cafe chooses to let only scrambled pages through. `blocked.includes(x)` is true when x is in the blocked list. `!==` means "is not".',
        hint: 'Two `if` checks that each return false: `blocked.includes(packet.from)` and `packet.port !== 443`. Then return true.',
        setup: join(PACKETS, BLOCKED),
        starter: `// blocked is a list of addresses the cafe does not trust: ["192.168.66.6"]
// Port 443 is the door for scrambled web pages.
function allow(packet) {
  // return false if packet.from is in the blocked list.
  // return false if packet.port is not 443.
  // If not, return true.

}
for (let i = 0; i < packets.length; i++) {
  const answer = allow(packets[i]) ? "allow" : "block";
  say(packets[i].from + " port " + packets[i].port + ": " + answer);
}`,
        tests: [
          { run: 'allow(packets[2])', want: true, label: 'A scrambled page on port 443 is allowed' },
          { run: 'allow(packets[0])', want: false, label: 'A plain page on port 80 is blocked' },
          { run: 'allow(packets[4])', want: false, label: 'A blocked address on port 23 is blocked' },
          { run: 'allow(packets[6])', want: false, label: 'A blocked address is blocked even on port 443' },
          { run: 'allow({ from: "10.0.0.20", port: 443 })', want: true },
          { says: '10.0.0.9 port 443: allow' },
        ],
      }),
      lab('d', 'A firewall protects the cafe. Habits protect you. Sort each habit: does it help on public Wi-Fi, or not?', {
        type: 'sort', bins: ['Helps on public Wi-Fi', 'Does not help'],
        items: [
          ['Check for the padlock before you type anything private', 0],
          ['Wait until you are home to sign in to important accounts', 0],
          ['Type your password very fast', 1],
          ['Pick the Wi-Fi with the coolest name', 1],
          ['Ask the staff which Wi-Fi is the real one', 0],
          ['Turn the screen brightness down', 1],
        ],
      }, 'The padlock in a browser means the page is scrambled on its way. A listener can still see which site you visit, but not what you type.'),
    ],
    quiz: [
      q('q1', 'On open Wi-Fi, which packets can a listener read?', ['Packets that are not scrambled', 'Only scrambled packets', 'None at all', 'Only packets with pictures']),
      q('q2', 'What does a firewall do?', ['Makes the Wi-Fi faster', 'Checks each packet against rules, then allows or blocks it', 'Stores passwords', 'Keeps the computer cool']),
      q('q3', 'Why did the cafe firewall block port 80?', ['Pages on that door travel unscrambled', '80 is an unlucky number', 'It is too slow', 'It is only for games']),
      q('q4', 'At a real cafe, you notice you could read other people\'s packets. What do you do?', ['Read them quietly', 'Do not look, and tell the owner or a trusted adult', 'Post them online', 'Save them for later']),
    ],
    ship: {
      prompt: 'Explain what a listener on public Wi-Fi can and cannot read, and one rule you put in your firewall.',
      frame: 'A listener can read ___ but cannot read ___. My firewall blocks ___ because ___.',
      stretch: 'In step c, add a third rule: also allow port 53, the door computers use to look up the address of a site. Which line must change?',
    },
    teacher: { note: 'All addresses here are private ranges that only exist inside the lesson. Stress the mission rule: capturing traffic on a real network without permission is illegal, and curiosity is not permission.' },
  },

  // ------------------------------------------------------------------ 10
  {
    id: 'g7-10', title: 'Case File', project: true,
    question: 'What does a security tester owe the owner?',
    goal: 'I can test five pretend systems and plan a report that tells the owner how to fix them.',
    standards: ['6-8.CAS.b.8', '6-8.CAS.b.6', '6-8.CT.b.3'],
    job: ['Security consultant', 'A person who tests an organisation\'s systems with permission, then writes a report on how to fix them.'],
    mission: {
      story: [
        'The Comet Arcade in Midtown opens next week. The owner, Ms. Vega, signs a letter asking your team to test five of its systems before opening day.',
        'Each system has one weak spot from this course. You will open each one with the right technique, as a real tester would. A big job is easier as five small ones.',
        'Then comes the part that matters most: the report that tells Ms. Vega how to fix all five.',
      ],
      vocab: [
        ['Scope', 'The list of things the owner has allowed you to test. Nothing else.'],
        ['Weak spot', 'A gap in a system that an attacker could use. Experts say vulnerability.'],
        ['Report', 'What a tester gives the owner: what was found, and how to fix it.'],
        ['Decompose', 'To split a big problem into small parts and solve each one.'],
      ],
      talk: 'Ms. Vega\'s letter lists five systems. You spot a sixth with a weak lock. What should you do, and why?',
      rule: 'A tester stays inside what the owner allowed in writing, follows the school\'s computer rules, and must report everything found to the owner.',
    },
    steps: [
      code('a', 'System 1, the Wi-Fi, is done for you: read it. Then write `openLocker` for system 2. Technique: **brute force**.', {
        more: 'System 1 falls to **listening**: one packet is not scrambled, so anyone nearby can read it. System 2 is a prize locker with a 3-digit PIN and no lockout.',
        hint: 'Loop `pin` from 0 while `pin < 1000`. If `lock.open(pin)` is true, return `pin`. After the loop, return -1.',
        setup: join(LOCKS, ARCADE_WIFI),
        starter: `// System 1: the arcade Wi-Fi. Technique: listening. (Done for you.)
for (let i = 0; i < wifi.length; i++) {
  if (!wifi[i].scrambled) {
    say("System 1 leaks: " + wifi[i].data);
  }
}

// System 2: the prize locker. PINs go from 0 to 999.
// lock.open(pin) is true when the PIN is right.
function openLocker(lock) {
  // return the PIN that opens the lock. If none does, return -1.

}
say("System 2 PIN: " + openLocker(locker));`,
        tests: [
          { says: 'System 1 leaks: door code=4410' },
          { says: 'System 2 PIN: 628' },
          { run: 'openLocker(makeLock(7))', want: 7 },
          { run: 'openLocker(makeLock(999))', want: 999 },
          { run: 'openLocker(makeLock(5000))', want: -1, label: 'It returns -1 when no PIN from 0 to 999 works' },
        ],
      }),
      code('b', 'System 3 is the staff sign-in. It stores toy hashes. Write `findPassword`. Technique: a **word list**.', {
        more: 'You cannot undo a hash. But you can scramble every word on the common list and see which result matches the stored number. A password that is not on the list stays hidden.',
        hint: 'Loop over `words`. If `scramble(words[i]) === number`, return `words[i]`. After the loop, return "not found".',
        setup: join(SCRAMBLE, WORDS, ARCADE_STORED),
        starter: `// System 3: the staff sign-in.
// stored holds a scrambled password (a number) for ana, raj and lin.
// scramble(text) is the toy hash. common is the list of 8 common passwords.
function findPassword(number, words) {
  // Scramble each word in the list.
  // return the word whose scramble equals number. If none does, return "not found".

}
say("ana: " + findPassword(stored.ana, common));
say("raj: " + findPassword(stored.raj, common));
say("lin: " + findPassword(stored.lin, common));`,
        tests: [
          { run: 'findPassword(stored.ana, common)', want: 'gocomets' },
          { run: 'findPassword(stored.raj, common)', want: 'qwerty99' },
          { run: 'findPassword(stored.lin, common)', want: 'not found', label: 'Lin\'s strong password is not found' },
          { run: 'findPassword(scramble("b"), ["a", "b"])', want: 'b' },
        ],
      }),
      code('c', 'System 4 is a scrambled note on the office wall. Write `crackNote`. Technique: **try every key**.', {
        more: 'The note uses a Caesar cipher, so there are only 25 keys. Try each one and keep the result that reads most like English, just as in lesson 5.',
        hint: 'Keep `best` and `bestScore`. Loop `shift` from 1 to 25. If `score(caesar(secret, shift))` beats `bestScore`, save the text and the score.',
        setup: join(ALPHA, SHIFT, CAESAR, COMMON, SCORE, ARCADE_NOTE),
        starter: `// System 4: a note on the office wall. It is saved in note.
// caesar(text, shift) shifts every letter of a text.
// score(text) counts the common English words in a text.
function crackNote(secret) {
  // Try every shift from 1 to 25. Keep the result with the highest score.
  // return that result.

}
say(note);
say(crackNote(note));`,
        tests: [
          { run: 'crackNote(note)', want: 'the alarm code is in the red book' },
          { run: 'crackNote(caesar("we keep the key at the front desk", 4))', want: 'we keep the key at the front desk', label: 'It cracks a second note, shifted by 4' },
          { run: 'crackNote(caesar("it is on the top shelf", 20))', want: 'it is on the top shelf', label: 'It cracks a third note, shifted by 20' },
        ],
      }),
      code('d', 'System 5 is the staff inbox. One message is a fake asking for the alarm password. Write `mostSuspicious`. Technique: **scoring**.', {
        more: 'An attacker does not always break a system. Sometimes they ask a person for the way in. Staff are not to blame: the message is built to fool them. Finding it lets the owner warn everyone.',
        hint: 'Start with `let worst = list[0];`. Loop from 1. When `score(list[i])` is more than `score(worst)`, set `worst = list[i]`. Return `worst`.',
        setup: ARCADE_INBOX,
        starter: `// System 5: the staff inbox, a list of 6 messages.
// One message looks like this: { from: "...", text: "..." }
// score(msg) is higher when a message looks more like a fake.
function mostSuspicious(list) {
  // return the message in the list with the highest score.

}
say(mostSuspicious(inbox));`,
        tests: [
          { run: 'mostSuspicious(inbox).text', want: 'Urgent! I am locked out. Send me the alarm password now.', label: 'It finds the fake message that asks for the alarm password' },
          { run: 'mostSuspicious(inbox.slice(3)).from', want: 'deals@prize-world.test', label: 'In the last three messages, it picks the prize message' },
          { run: 'mostSuspicious([inbox[0], inbox[3]]).text', want: 'Reminder: never share the alarm password by email.' },
        ],
      }),
      lab('e', 'All five systems opened. Now plan the report for Ms. Vega. Put its parts in order.', {
        type: 'order',
        items: [
          'Permission: who asked for the test, and which five systems it covers',
          'What we did: the technique we used on each system',
          'What we found: each weak spot, with the biggest risk first',
          'How to fix it: one clear fix for each weak spot',
          'Next step: give the report only to the owner, then test again after the fixes',
        ],
      }, 'The fixes: scramble the Wi-Fi traffic. Add a lockout to the locker. Refuse common passwords and use a real hash. Use real encryption, not Caesar. Teach staff to report odd messages.'),
    ],
    quiz: [
      q('q1', 'The prize locker fell to brute force. Which fix helps most?', ['A lockout after 3 wrong tries', 'A brighter keypad', 'A shorter PIN', 'A "keep out" sign']),
      q('q2', 'Two staff passwords fell to the word list. Which fix helps most?', ['Refuse common passwords at sign-up', 'Hide the sign-in page', 'Use shorter passwords', 'Turn the screen off']),
      q('q3', 'Why split the test into five small functions?', ['Small parts are easier to write, test and fix', 'To use more lines', 'Because functions are slow', 'To hide the code']),
      q('q4', 'The test is finished. Who should get the report?', ['Everyone at school', 'Only the owner who asked for the test', 'Nobody', 'Your friends first']),
    ],
    ship: {
      prompt: 'Write the "how to fix it" part of your report: one sentence for each of the five systems.',
      frame: 'System ___ was weak because ___. To fix it, the owner should ___.',
      stretch: 'Rank the five weak spots like in lesson 1. Give each a harm score and a chance score, multiply them, and say which one Ms. Vega should fix first.',
    },
    teacher: { note: 'Project lesson: allow two sessions, one for the five systems and one for the written report. Link the mission rule to your school\'s Acceptable Use Policy: scope, permission and reporting are what separate a tester from an attacker.' },
  },
];
