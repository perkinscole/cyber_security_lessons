// Grade 6: Lock It Down. Keep yourself safe.
// Students finish and change code that is already started: fill a ___ blank, or change one value.
import { q, lab, code } from './kit.js';

const LOCKER = (secret) => `const locker = (function () {
  var secret = ${secret}, tries = 0, opened = false;
  return {
    open: function (pin) { tries++; if (pin === secret) opened = true; return pin === secret; },
    tries: function () { return tries; },
    isOpen: function () { return opened; }
  };
})();`;

// The pretend worlds for the other lessons. Each is hidden setup code that runs before the student's code.

// g6-02: the label function the student finished in step b.
const LABEL = `const keepList = ["home address", "phone number", "password", "birthday"];
function label(fact) {
  if (keepList.includes(fact)) {
    return "keep";
  }
  return "share";
}`;

// g6-04: the two checks the student finished in steps a and b.
const CHECKS = `function isLong(password) {
  return password.length >= 12;
}
function hasNumber(password) {
  const digits = "0123456789";
  for (let i = 0; i < password.length; i++) {
    if (digits.includes(password[i])) {
      return true;
    }
  }
  return false;
}`;

// g6-05: a picker that looks like chance but gives the same words on every run.
const PICKER = `let seed = 7;
function pick(list) {
  seed = (seed * 5 + 3) % 97;
  return list[seed % list.length];
}`;
const WORDS = 'const words = ["otter", "lantern", "pebble", "harbor", "maple", "rocket", "violin", "puddle", "cactus", "tunnel", "marble", "breeze", "pickle", "comet", "ferry", "walrus"];';
const MAKER = `${WORDS}
${PICKER}
function makePassphrase() {
  const parts = [];
  for (let i = 0; i < 4; i++) {
    parts.push(pick(words));
  }
  return parts.join("-");
}`;

// g6-06: a pretend inbox. Every sender and site is made up.
const INBOX = `const inbox = [
  { subject: "Practice time", from: "coach@harborgym.example", text: "Practice moves to 4 pm on Friday.", linkShows: "harborgym.example", linkGoes: "harborgym.example" },
  { subject: "You won a prize", from: "prizes@harbor-gym-winner.test", text: "Act now to claim your prize!", linkShows: "harborgym.example", linkGoes: "win-a-prize.test" },
  { subject: "Book due soon", from: "desk@harborlibrary.example", text: "Your book is due next week.", linkShows: "harborlibrary.example", linkGoes: "harborlibrary.example" },
  { subject: "Card problem", from: "desk@harborlibrary.example", text: "Please check your library card.", linkShows: "harborlibrary.example", linkGoes: "library-card-fix.test" }
];`;

// g6-07: the cipher parts the student finished in earlier steps. Spaces stay as spaces.
const SHIFT = `const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function shiftLetter(letter, shift) {
  const spot = alphabet.indexOf(letter);
  if (spot === -1) {
    return letter;
  }
  return alphabet[(spot + shift) % 26];
}`;
const SCRAMBLE = `${SHIFT}
function scramble(message, shift) {
  let result = "";
  for (let i = 0; i < message.length; i++) {
    result = result + shiftLetter(message[i], shift);
  }
  return result;
}`;

// g6-09: the two checks behind the "pause before you post" checker.
const POST_CHECKS = `const privateWords = ["address", "phone number", "password"];
const unkindWords = ["loser", "nobody likes", "go away"];
function hasWord(post, list) {
  const t = post.toLowerCase();
  for (let i = 0; i < list.length; i++) {
    if (t.includes(list[i])) {
      return true;
    }
  }
  return false;
}
function sharesPrivate(post) { return hasWord(post, privateWords); }
function isUnkind(post) { return hasWord(post, unkindWords); }`;

// g6-10: the three tools from earlier lessons, ready to join into one kit.
const KIT = `const common = ["123456", "password", "qwerty", "letmein"];
function strength(password) {
  if (common.includes(password)) { return 0; }
  let score = 0;
  if (password.length >= 12) { score = score + 1; }
  if (/[0-9]/.test(password)) { score = score + 1; }
  return score;
}
const rushWords = ["act now", "hurry", "urgent"];
function looksFake(text) {
  const t = text.toLowerCase();
  for (let i = 0; i < rushWords.length; i++) {
    if (t.includes(rushWords[i])) { return true; }
  }
  return false;
}
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function scramble(message, shift) {
  const text = message.toUpperCase();
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const spot = alphabet.indexOf(text[i]);
    result = result + (spot === -1 ? text[i] : alphabet[(spot + shift) % 26]);
  }
  return result;
}`;

export default [
  {
    id: 'g6-01', title: 'Welcome, Agent',
    question: 'What makes a hacker helpful or harmful?',
    goal: 'I can explain why permission is the difference between helpful and harmful hacking.',
    standards: ['6-8.CAS.b.8', '6-8.CAS.b.6'],
    job: ['Bug bounty hunter', 'A person who looks for weak spots in apps that invite testing, and tells the owner so they can be fixed.'],
    mission: {
      story: [
        'Welcome to Cipher City. You are a new agent in the Harbor District. Agents keep people and their computers safe.',
        'A **hacker** is a person who finds clever ways to make computers do new things. Some hackers help. Some do harm. The difference is **permission**.',
        'Your job today: make your agent badge, and learn the first rule of every agent. Ask first.',
      ],
      vocab: [['Hacker', 'A person who finds clever ways to make computers do new things.'], ['Permission', 'A clear "yes" from the owner.'], ['Variable', 'A name in code that holds a value.'], ['Acceptable Use Policy', 'The school rules for using computers and accounts.']],
      talk: 'A friend finds a way to see the answers for an online quiz. What should they do next?',
      rule: 'Only test or change a computer, app or account when the owner gives permission. At school, follow the Acceptable Use Policy.',
    },
    steps: [
      code('a', 'Press Run. Then change `"???"` to a code name you make up, and run again. Do not use your real name.', {
        more: 'A **variable** is a name that holds a value. `let codeName = "???"` makes a variable called `codeName`. The text between the quote marks is its value.',
        hint: 'Type your new code name between the two quote marks. Keep both quote marks.',
        starter: `// A variable holds a value. Change the value of codeName.
let codeName = "???";
let district = "Harbor District";

// say() prints a line.
say("CIPHER CITY AGENT BADGE");
say("Agent " + codeName);
say("District: " + district);`,
        tests: [{ run: 'typeof codeName === "string" && codeName.trim().length > 0 && codeName !== "???"', want: true, label: 'codeName is a new name you made up' }, { says: 'District: Harbor District' }],
      }),
      code('b', 'This function makes a badge for any agent. Fill the ___ blank so the badge shows the agent\'s level.', {
        more: 'A **function** is a small machine. You give it values, and it gives one back. `badge` takes a `name` and a `level`. The `+` sign joins pieces of text.',
        hint: 'Look at the first line of the function. Which name holds the level?',
        starter: `// badge() takes a name and a level. It gives back the badge text.
function badge(name, level) {
  return "Agent " + name + " | Level " + ___;
}

say(badge("Falcon", 1));
say(badge("Otter", 2));`,
        tests: [{ run: 'badge("Falcon", 1)', want: 'Agent Falcon | Level 1' }, { run: 'badge("Otter", 2)', want: 'Agent Otter | Level 2' }],
      }),
      code('c', 'An agent asks first. Fill the ___ blank so `canTest` says "Go ahead" only when the owner said yes.', {
        more: 'An **if statement** makes a choice. The code inside the `{ }` runs only when the check is true. In code, yes is `true` and no is `false`.',
        hint: 'In code, a "yes" is written as true and a "no" is written as false. No quote marks are needed.',
        starter: `// The owner's answer is true (yes) or false (no).
function canTest(ownerSaidYes) {
  if (ownerSaidYes === ___) {
    return "Go ahead";
  }
  return "Stop and ask first";
}

say(canTest(true));
say(canTest(false));`,
        tests: [{ run: 'canTest(true)', want: 'Go ahead' }, { run: 'canTest(false)', want: 'Stop and ask first' }],
      }),
      lab('d', 'Sort each action. Does the person have permission, or not?', {
        type: 'sort', bins: ['With permission', 'Without permission'],
        items: [['Test the gym\'s locker app because the owner asked you to', 0], ['Guess a classmate\'s password "as a joke"', 1], ['Tell your teacher about a weak spot you found in a school app', 0], ['Use a school account that is not yours', 1], ['Practice on the pretend lockers in Cipher City', 0], ['Change a friend\'s game settings while they are away', 1]],
      }, 'The same skill can help or harm. Permission from the owner is what makes it helpful.'),
    ],
    quiz: [
      q('q1', 'What is the difference between helpful hacking and harmful hacking?', ['Helpful hackers are faster', 'Helpful hackers have permission', 'Harmful hackers use bigger computers', 'There is no difference']),
      q('q2', 'What does a variable do?', ['It holds a value under a name', 'It prints a line', 'It repeats code', 'It locks a computer']),
      q('q3', 'You find that a school app shows other students\' grades by mistake. What should you do?', ['Look at everyone\'s grades', 'Tell your friends how to do it', 'Tell a teacher and do not use it', 'Keep it secret']),
      q('q4', 'What does an Acceptable Use Policy tell you?', ['The price of a computer', 'How to write code', 'Which games are the best', 'The rules for using school computers']),
    ],
    ship: {
      prompt: 'Explain to someone at home what makes a hacker helpful or harmful.',
      frame: 'A helpful hacker always ___. A harmful hacker ___.',
      stretch: 'Add a new variable called `motto` to your badge in step a. Make the badge print it on a new line.',
    },
    teacher: { note: 'Link the mission rule to your school\'s own Acceptable Use Policy: show it and read one line together. Remind students never to use real names or real passwords in the editor.' },
  },
  {
    id: 'g6-02', title: 'What to Keep Private',
    question: 'Which facts about you are safe to share?',
    goal: 'I can sort facts about a person into "share" and "keep private", and explain why.',
    standards: ['6-8.CAS.a.3', '6-8.CT.b.1'],
    job: ['Privacy officer', 'A person who makes sure an app or a school collects only the facts it needs, and keeps them safe.'],
    mission: {
      story: [
        'Juno Tidewell is a made-up student in the Harbor District. Juno wants to join the Harbor Skate Club chat.',
        'The sign-up page asks a lot of questions. Some facts are fine to share. Some are **private**: they could help a stranger find Juno or get into an account.',
        'What you post can stay online for years. This is your **digital footprint**. Your job today: build a program that tells Juno what to share and what to keep.',
      ],
      vocab: [['Private', 'Something you keep to yourself and people you trust.'], ['Personal information', 'Facts that point to one real person, like an address or phone number.'], ['Digital footprint', 'The trail of things about you that stays online.'], ['If statement', 'Code that makes a choice.']],
      talk: 'Is your favorite food private? Is your home address? What is the difference?',
      rule: 'Only share facts that are your own to share. Ask a trusted adult before you give personal information to an app or a person online.',
    },
    steps: [
      code('a', 'The program labels each fact "share" or "keep". Fill the ___ blank so every other fact gets the label `"share"`.', {
        more: 'An **if statement** makes a choice. If the fact is the home address, the function gives back "keep". If not, the code moves on to the last `return`.',
        hint: 'The blank needs a word in quote marks, just like "keep" on the line above it.',
        starter: `// Juno is a made-up student. label() says what to do with one fact.
function label(fact) {
  if (fact === "home address") {
    return "keep";
  }
  return ___;
}

say("favorite color: " + label("favorite color"));
say("home address: " + label("home address"));`,
        tests: [{ run: 'label("favorite color")', want: 'share' }, { run: 'label("home address")', want: 'keep' }, { run: 'label("favorite food")', want: 'share' }],
      }),
      code('b', 'One `if` for every private fact is slow. Use a list. Fill the ___ blank so the function checks if the **fact** is on the list.', {
        more: 'A **list** holds many values in one place. `keepList.includes(x)` asks one question: is `x` on the list? It answers true or false.',
        hint: 'Look at the first line of the function. Which name holds the fact we want to look up?',
        starter: `// The facts on this list are private.
const keepList = ["home address", "phone number", "password", "birthday"];

function label(fact) {
  // includes() asks: is this on the list?
  if (keepList.includes(___)) {
    return "keep";
  }
  return "share";
}

say("phone number: " + label("phone number"));
say("favorite food: " + label("favorite food"));`,
        tests: [{ run: 'label("phone number")', want: 'keep' }, { run: 'label("favorite food")', want: 'share' }, { run: 'label("birthday")', want: 'keep' }],
      }),
      code('c', 'Now check all of Juno\'s facts with a loop. Fill the ___ blank so the program counts the facts labelled `"keep"`.', {
        more: 'The **loop** takes Juno\'s facts one at a time. The `if` checks the label of each one. `label` is the function you finished in the last step.',
        hint: 'We are counting private facts. Which label do private facts get? Put it in quote marks.',
        setup: LABEL,
        starter: `// Facts about Juno, a made-up student. label() is ready to use.
const junoFacts = ["favorite color", "home address", "favorite food", "phone number", "favorite band", "birthday", "favorite sport"];

let keepCount = 0;
for (let i = 0; i < junoFacts.length; i++) {
  const fact = junoFacts[i];
  say(fact + ": " + label(fact));
  // Count the private facts.
  if (label(fact) === ___) {
    keepCount = keepCount + 1;
  }
}
say("Keep " + keepCount + " facts private");`,
        tests: [{ run: 'keepCount', want: 3, label: 'keepCount is 3' }, { says: 'Keep 3 facts private' }, { says: 'birthday: keep' }],
      }),
      lab('d', 'You are Juno\'s privacy officer. Sort each fact: fine to share in the club chat, or keep private?', {
        type: 'sort', bins: ['Fine to share', 'Keep private'],
        items: [['Favorite skate trick', 0], ['Home address', 1], ['A made-up user name', 0], ['Password', 1], ['Favorite animal', 0], ['Phone number', 1], ['A photo of your house and street sign', 1]],
      }, 'Private facts can help a stranger find you or get into your accounts. A post can be copied, so it can stay online even after you delete it.'),
    ],
    quiz: [
      q('q1', 'Which fact is private?', ['Your favorite color', 'Your favorite food', 'Your home address', 'Your favorite sport']),
      q('q2', 'What is a digital footprint?', ['The trail of things about you that stays online', 'A picture of your shoe', 'A kind of password', 'A fast computer']),
      q('q3', 'What does `keepList.includes("password")` ask?', ['Is the list empty?', 'Is "password" on the list?', 'How long is the list?', 'Is the password strong?']),
      q('q4', 'A new app asks for your phone number and address. What is the best thing to do?', ['Type them in quickly', 'Make up a friend\'s details', 'Share them in the chat instead', 'Ask a trusted adult first']),
    ],
    ship: {
      prompt: 'Explain to someone at home which facts you keep private online, and why.',
      frame: 'I keep ___ private because ___. It is fine to share ___.',
      stretch: 'In step b, add one more private fact to `keepList`. Then add a line that prints its label.',
    },
    teacher: { note: 'Use only the made-up student. Do not ask students to list their own private facts aloud or in the editor. Typing "school name" as an extra private fact makes a good class debate.' },
  },
  {
    id: 'g6-03', title: 'Guess the PIN',
    question: 'Why is a longer PIN safer?',
    goal: 'I can explain why every extra digit makes a PIN harder to guess.',
    standards: ['6-8.CAS.a.1', '6-8.CT.b.2'],
    job: ['Security tester', 'A person who is paid to test locks and sign-ins, with permission, so the owner can fix them.'],
    mission: {
      story: [
        'The lockers at the Harbor District gym use a **PIN**. The owner asks you to test one. She has given you permission.',
        'A computer does not get bored. It can try every PIN, one after another. This is called **brute force**.',
        'Your job today: find out how long that takes, and what makes it take longer.',
      ],
      vocab: [['PIN', 'A short secret number that opens a lock or an account.'], ['Brute force', 'Trying every possible answer until one works.'], ['Loop', 'Code that repeats.']],
      talk: 'How many tries would you need to guess a 2-digit PIN if you were unlucky?',
      rule: 'Only test a lock you own, or one the owner has asked you to test. Trying someone else\'s lock without permission is against the law.',
    },
    steps: [
      code('a', 'This loop only tries the PINs 0 to 9. Change **one number** so it tries every PIN from 0 to 99. Then press Run.', {
        more: 'A **for loop** repeats. This one starts `pin` at 0 and adds 1 each time. It stops when `pin < 10` is no longer true.',
        hint: 'The loop stops at the number after the < sign. Which number would make it go all the way to 99?',
        setup: LOCKER(47),
        starter: `// This locker is pretend. Its PIN is a number from 0 to 99.
for (let pin = 0; pin < 10; pin++) {
  if (locker.open(pin)) {
    say("Opened with " + pin);
  }
}`,
        tests: [{ run: 'locker.isOpen()', want: true, label: 'The locker opens' }, { says: 'Opened with 47' }],
      }),
      code('b', 'Now count the guesses. Fill the ___ blank so `guesses` goes up by 1 each time around the loop.', {
        more: '`guesses = guesses + 1` means: take the old number, add 1, and save it again. `break` stops the loop early.',
        hint: 'How much should the count go up for each guess?',
        setup: LOCKER(47),
        starter: `let guesses = 0;
for (let pin = 0; pin < 100; pin++) {
  guesses = guesses + ___;
  if (locker.open(pin)) {
    say("Opened after " + guesses + " guesses");
    break;
  }
}`,
        tests: [{ run: 'guesses', want: 48, label: 'guesses is 48' }, { says: 'Opened after 48 guesses' }],
      }),
      code('c', 'How many PINs are there? Each digit can be 0 to 9. Fill the blank so `howMany` multiplies by the right number for each digit.', {
        more: 'One digit has 10 choices. Two digits have 10 × 10 = 100. Every extra digit multiplies the total by 10.',
        hint: 'How many choices are there for one digit?',
        starter: `function howMany(digits) {
  let total = 1;
  for (let i = 0; i < digits; i++) {
    total = total * ___;
  }
  return total;
}
say("2 digits: " + howMany(2));
say("4 digits: " + howMany(4));
say("6 digits: " + howMany(6));`,
        tests: [{ run: 'howMany(2)', want: 100 }, { run: 'howMany(4)', want: 10000 }, { run: 'howMany(6)', want: 1000000 }],
      }),
      lab('d', 'You are the defender now. Sort each idea: does it slow a guesser down, or not?', {
        type: 'sort', bins: ['Slows a guesser down', 'Does not help'],
        items: [['Use 6 digits, not 4', 0], ['Lock for a minute after 3 wrong tries', 0], ['Use your birthday as the PIN', 1], ['Use 1234', 1], ['Pick the digits at random', 0], ['Write the PIN on the locker', 1]],
      }, 'A good defence makes each guess slower, or makes there be more guesses to try.'),
    ],
    quiz: [
      q('q1', 'What is brute force?', ['Trying every possible answer', 'Breaking a lock with a hammer', 'Asking someone for their PIN', 'Guessing once and giving up']),
      q('q2', 'A 3-digit PIN has 1,000 choices. How many does a 4-digit PIN have?', ['1,001', '4,000', '10,000', '1,000,000']),
      q('q3', 'Which defence stops a computer trying every PIN quickly?', ['A bright screen', 'A lock-out after a few wrong tries', 'A shorter PIN', 'A bigger keypad']),
      q('q4', 'When is it OK to test a lock like this?', ['When nobody is looking', 'When it is easy', 'When the owner gives permission', 'Whenever you are curious']),
    ],
    ship: {
      prompt: 'Explain to someone at home why a longer PIN is safer.',
      frame: 'A longer PIN is safer because ___. For example, ___.',
      stretch: 'Change the loop in step a so it counts down from 99 to 0. Does the locker open sooner or later?',
    },
    teacher: { note: 'Stress that the locker is pretend and lives in the page. If students ask about trying this on a real lock or account, return to the mission rule: permission first, always.' },
  },
  {
    id: 'g6-04', title: 'Password Strength Checker',
    question: 'What makes a password hard to guess?',
    goal: 'I can name three things that make a password strong, and check for them with code.',
    standards: ['6-8.CAS.a.1', '6-8.CT.d.4'],
    job: ['Security engineer', 'A person who builds the sign-in rules and tools that keep accounts safe.'],
    mission: {
      story: [
        'The Harbor District ferry office has a problem. Many workers use passwords that are easy to guess, like `123456`.',
        'A guesser tries short passwords and well-known passwords first. A **strong** password is long, mixes letters and numbers, and is not on a list of common passwords.',
        'Your job today: finish a **strength checker**. It scores made-up passwords, so workers can pick better ones.',
      ],
      vocab: [['Strong password', 'A password that is very hard to guess.'], ['Common password', 'A password many people use, so guessers try it first.'], ['Score', 'A number that shows how good something is.'], ['Function', 'A named piece of code that does one job.']],
      talk: 'Why would a guesser try "123456" before "purple-otter-42"?',
      rule: 'Only check made-up passwords here. Never type a real password into a checker, and never ask another person for theirs.',
    },
    steps: [
      code('a', 'Long passwords take longer to guess. Fill the ___ blank so `isLong` is true for passwords with **12** or more characters.', {
        more: '`password.length` counts the characters. `>=` means "is this number or bigger". So the function answers true or false.',
        hint: 'The blank is a number. How many characters does the instruction ask for?',
        starter: `// Every password in this lesson is made up.
function isLong(password) {
  // .length counts the characters.
  return password.length >= ___;
}

say("sunny: " + isLong("sunny"));
say("purple-otter-42: " + isLong("purple-otter-42"));`,
        tests: [{ run: 'isLong("sunny")', want: false }, { run: 'isLong("purple-otter-42")', want: true }, { run: 'isLong("abcdefghijkl")', want: true, label: 'A password with exactly 12 characters is long' }, { run: 'isLong("abcdefghijk")', want: false, label: 'A password with 11 characters is not long' }],
      }),
      code('b', 'A mix of letters and numbers is harder to guess. Fill the ___ blank so `hasNumber` answers yes when it finds a number.', {
        more: 'The loop looks at one character at a time. `digits.includes(...)` asks if that character is a number. If the loop ends and finds none, the answer is `false`.',
        hint: 'The last line gives back false for "no number here". What is the opposite of false?',
        starter: `function hasNumber(password) {
  const digits = "0123456789";
  // Look at each character, one at a time.
  for (let i = 0; i < password.length; i++) {
    if (digits.includes(password[i])) {
      return ___;
    }
  }
  return false;
}

say("otter: " + hasNumber("otter"));
say("otter7: " + hasNumber("otter7"));`,
        tests: [{ run: 'hasNumber("otter")', want: false }, { run: 'hasNumber("otter7")', want: true }, { run: 'hasNumber("4seagulls")', want: true }],
      }),
      code('c', 'Join the checks into one score. Fill both ___ blanks: a common password scores **0**, and each good check adds **1** point.', {
        more: 'Guessers try common passwords first, so a common password scores 0 at once. `isLong` and `hasNumber` are the functions you finished. They are already loaded.',
        hint: 'Both blanks are numbers. Read the two comments in the code again.',
        setup: CHECKS,
        starter: `// isLong() and hasNumber() are ready to use.
// Passwords that guessers try first.
const common = ["123456", "password", "qwerty", "letmein"];

function strength(password) {
  // A common password scores 0.
  if (common.includes(password)) {
    return ___;
  }
  let score = 0;
  // Each good check adds 1 point.
  if (isLong(password)) {
    score = score + 1;
  }
  if (hasNumber(password)) {
    score = score + ___;
  }
  return score;
}

say("123456 scores " + strength("123456"));
say("otter7 scores " + strength("otter7"));
say("purple-otter-42 scores " + strength("purple-otter-42"));`,
        tests: [{ run: 'strength("123456")', want: 0 }, { run: 'strength("otter7")', want: 1 }, { run: 'strength("purple-otter-42")', want: 2 }, { run: 'strength("sunny")', want: 0 }],
      }),
      lab('d', 'You are the defender. Match each made-up password to what the checker would say about it.', {
        type: 'match',
        pairs: [['sunny', 'Too short'], ['qwerty', 'On the common list'], ['seagullsandferries', 'Long, but no numbers'], ['purple-otter-42', 'Long, with letters and numbers']],
      }, 'A checker cannot see everything. A password with your name or birthday in it is still easy to guess for people who know you.'),
    ],
    quiz: [
      q('q1', 'Which made-up password is the strongest?', ['123456', 'sunny', 'otter7', 'purple-otter-42']),
      q('q2', 'Why does a common password score 0?', ['It is too long', 'Guessers try common passwords first', 'It has no letters', 'It is hard to type']),
      q('q3', 'What does `password.length` give you?', ['The number of characters', 'The first letter', 'The score', 'True or false']),
      q('q4', 'A friend asks you to test their real password in your checker. What do you do?', ['Type it in to help', 'Say no, and test a made-up one', 'Write it down for later', 'Share it with the class']),
    ],
    ship: {
      prompt: 'Explain to someone at home three things that make a password strong.',
      frame: 'A strong password is ___, has ___, and is not ___.',
      stretch: 'In step c, add one more made-up password to the `common` list. Then print its score to check that it is 0.',
    },
    teacher: { note: 'Passwords are made up, always. If a student types a real one, have them clear it and change that password at home with an adult. The checker is a simple model: discuss what it misses.' },
  },
  {
    id: 'g6-05', title: 'Passphrase Machine', project: true,
    question: 'How can a password be both strong and easy to remember?',
    goal: 'I can make a strong passphrase and explain why a second sign-in step keeps an account safer.',
    standards: ['6-8.CAS.a.1', '6-8.CT.d.3'],
    job: ['Identity manager', 'A person who decides how people prove who they are when they sign in.'],
    mission: {
      story: [
        'The Harbor District library wants every reader to have a strong password. But long, odd passwords are hard to remember.',
        'A **passphrase** is a password made of a few simple words, like four words in a row. It is long, so it is hard to guess. It is easy to remember.',
        'Project: build a machine that makes passphrases, test them, then add a second lock to the library sign-in. This is called **two-step sign-in**.',
      ],
      vocab: [['Passphrase', 'A password made of several words.'], ['Two-step sign-in', 'Signing in with two things: something you know and a code sent to you.'], ['Sign-in code', 'A short number sent to your phone that works one time.'], ['List', 'Many values kept in one place, in order.']],
      talk: 'Which is easier to remember: "x7Qp2z" or "otter-lantern-pebble-harbor"? Which is longer?',
      rule: 'Use this machine for practice only. Never share a real passphrase or sign-in code with anyone who asks for it.',
    },
    steps: [
      code('a', 'The machine picks words from a list. Fill the ___ blank so each passphrase has **4** words.', {
        more: '`pick(words)` gives one word from the list. The loop runs again and again, and `push` adds each word to `parts`. Then `join("-")` sticks the words together with a `-` between them.',
        hint: 'The loop adds one word each time around. How many times should it go around?',
        setup: PICKER,
        starter: `// pick(list) gives you one word from a list.
// Simple words for the machine to pick from.
const words = ["otter", "lantern", "pebble", "harbor", "maple", "rocket", "violin", "puddle", "cactus", "tunnel", "marble", "breeze", "pickle", "comet", "ferry", "walrus"];

function makePassphrase() {
  const parts = [];
  // Each time around, pick one more word.
  for (let i = 0; i < ___; i++) {
    parts.push(pick(words));
  }
  return parts.join("-");
}

say(makePassphrase());
say(makePassphrase());`,
        tests: [{ says: 'violin-otter-walrus-marble' }, { says: 'lantern-rocket-breeze-violin' }, { run: 'makePassphrase().split("-").length', want: 4, label: 'A new passphrase has 4 words' }],
      }),
      code('b', 'Test the passphrases. Fill both ___ blanks so `strongEnough` wants **4** or more words and **16** or more characters.', {
        more: '`split("-")` cuts the passphrase at each `-` and gives a list of words. `&&` means **and**: both checks must be true.',
        hint: 'The first blank is the number of words. The second blank is the number of characters. Both numbers are in the instruction.',
        setup: MAKER,
        starter: `// makePassphrase() is ready to use.
function strongEnough(phrase) {
  // Count the words.
  const count = phrase.split("-").length;
  // Strong means enough words AND enough characters.
  return count >= ___ && phrase.length >= ___;
}

const phrase = makePassphrase();
say(phrase + " strong enough? " + strongEnough(phrase));
say("otter-ferry strong enough? " + strongEnough("otter-ferry"));`,
        tests: [{ run: 'strongEnough("otter-lantern-pebble-harbor")', want: true }, { run: 'strongEnough("otter-ferry")', want: false }, { run: 'strongEnough("a-b-c-d")', want: false, label: 'Four very short words are not enough' }, { run: 'strongEnough("lantern-walrus-violin")', want: false, label: 'Three long words are not enough' }],
      }),
      code('c', 'Add a second lock to the pretend library sign-in. Fill the ___ blank so the code typed must match the code sent to the phone.', {
        more: '`!==` means "is not the same as". The sign-in already checks the passphrase. Your line checks the code. A thief who learns the passphrase still does not have the phone.',
        hint: 'Look at the top of the code. Which name holds the code that was sent to the phone?',
        starter: `// A pretend sign-in for the Harbor Library. Everything is made up.
const savedPhrase = "otter-lantern-pebble-harbor";
const codeOnPhone = "4821";

function signIn(phrase, code) {
  // Step 1: the passphrase must match.
  if (phrase !== savedPhrase) {
    return "Wrong passphrase";
  }
  // Step 2: the code must match the one sent to the phone.
  if (code !== ___) {
    return "Wrong code";
  }
  return "Welcome";
}

say(signIn("otter-lantern-pebble-harbor", "4821"));
say(signIn("otter-lantern-pebble-harbor", "0000"));`,
        tests: [{ run: 'signIn("otter-lantern-pebble-harbor", "4821")', want: 'Welcome' }, { run: 'signIn("otter-lantern-pebble-harbor", "0000")', want: 'Wrong code' }, { run: 'signIn("a-wrong-guess", "4821")', want: 'Wrong passphrase' }],
      }),
      lab('d', 'A thief learns a reader\'s passphrase. The library uses two-step sign-in. What happens when the thief tries to sign in?', {
        type: 'mcq',
        choices: ['The thief gets in, because the passphrase is right', 'The thief is stopped, because the code goes to the reader\'s phone', 'The library closes for the day', 'The passphrase changes by itself'],
        answer: 1,
        why: 'The second step needs something the thief does not have: the reader\'s phone. The reader should still change the passphrase.',
      }, 'If a code arrives that you did not ask for, someone may be trying your account. Do not share the code. Tell a trusted adult.'),
    ],
    quiz: [
      q('q1', 'What is a passphrase?', ['A password made of several words', 'A very short PIN', 'A code sent to your phone', 'A list of common passwords']),
      q('q2', 'Why is a four-word passphrase hard to guess?', ['It has no letters', 'It changes every day', 'It is long, so there are very many to try', 'Computers cannot read words']),
      q('q3', 'What does two-step sign-in add?', ['A longer user name', 'A second check, like a code on your phone', 'A second password list', 'A faster computer']),
      q('q4', 'Someone messages you: "Send me the code you just got." What do you do?', ['Send it quickly', 'Send half of it', 'Post it in the chat', 'Do not send it, and tell a trusted adult']),
    ],
    ship: {
      prompt: 'Show your passphrase machine to a partner. Explain why its passphrases are strong, and what the second step adds.',
      frame: 'A passphrase is strong because ___. A second sign-in step helps because ___.',
      stretch: 'In step a, add four more simple words to the `words` list. Does the machine make different passphrases now?',
    },
    teacher: { note: 'Project lesson: allow extra time for step c and the partner demo. Students must not use the machine\'s output, or any passphrase shown on screen, as a real password.' },
  },
  {
    id: 'g6-06', title: 'Spot the Fake', sensitive: true,
    question: 'How can you tell when a message is a fake?',
    goal: 'I can spot three signs of a fake message, and I know what to do when I see one.',
    standards: ['6-8.CAS.a.1', '6-8.CAS.c.4'],
    job: ['Email security analyst', 'A person who studies fake messages that people report, and builds rules that catch them.'],
    mission: {
      story: [
        'Fake messages are landing in the Harbor District. They look like they come from the gym or the library. They want people to tap a link and type a password.',
        'This trick is called **phishing**. The messages are built to fool people. Anyone can be fooled, even experts.',
        'Your job today: learn three signs of a fake, and write rules that flag them. The signs are a rush, an odd sender, and a link that does not match.',
      ],
      vocab: [['Phishing', 'A fake message that tries to trick you into giving away something private.'], ['Sender', 'The person or address a message comes from.'], ['Link', 'Words or a button that take you to a web page.'], ['Flag', 'To mark something so a person looks at it closely.']],
      talk: 'Why would a fake message tell you to "act now"?',
      rule: 'If a message looks fake, do not tap the link. Report it to a trusted adult. Never send a fake message to trick someone.',
    },
    steps: [
      lab('a', 'Read the pretend inbox. Sort each message: does it look OK, or does it look fake?', {
        type: 'sort', bins: ['Looks OK', 'Looks fake'],
        items: [['From coach@harborgym.example: "Practice moves to 4 pm on Friday."', 0], ['From prizes@harbor-gym-winner.test: "You won! Act now to claim your prize!"', 1], ['From desk@harborlibrary.example: "Your book is due next week."', 0], ['From desk@harbor-library-help.test: "URGENT. Your card will close today. Send your password."', 1], ['From ferry@harborferry.example: "The 8 am ferry is late today."', 0], ['From ferry@free-ferry-tickets.test: "Hurry! Type your password to get free tickets."', 1]],
      }, 'Fake messages often rush you, come from an odd address, or ask for a password. A real club or library will never ask for your password.'),
      code('b', 'Rule 1: a rush. Fake messages want you to act before you think. Fill the ___ blank to add the rush word `"urgent"` to the list.', {
        more: 'The rule changes the text to small letters with `toLowerCase()`, so "URGENT" and "urgent" both match. Then it looks for each rush word in the text.',
        hint: 'A word in a list needs quote marks around it, like the other two.',
        starter: `// Words that rush you.
const rushWords = ["act now", "hurry", ___];

function isRush(text) {
  const t = text.toLowerCase();
  for (let i = 0; i < rushWords.length; i++) {
    if (t.includes(rushWords[i])) {
      return true;
    }
  }
  return false;
}

say("Card message is a rush? " + isRush("URGENT. Your card will close today."));
say("Practice message is a rush? " + isRush("Practice moves to 4 pm on Friday."));`,
        tests: [{ run: 'isRush("URGENT. Your card will close today.")', want: true }, { run: 'isRush("Practice moves to 4 pm on Friday.")', want: false }, { run: 'isRush("Hurry! Get free tickets.")', want: true }],
      }),
      code('c', 'Rule 2: an odd sender. Real library messages end with `realEnding`. Fill the ___ blank so the rule checks the end of the sender\'s address.', {
        more: '`endsWith(...)` checks the last part of a piece of text. A fake address can have the right words in it, but the wrong ending.',
        hint: 'Look at the top of the code. Which name holds the ending that real library messages use?',
        starter: `// Real messages from the Harbor Library end like this.
const realEnding = "@harborlibrary.example";

function oddSender(from) {
  // endsWith() checks the end of the text.
  if (from.endsWith(___)) {
    return false; // the ending is right
  }
  return true; // the ending is odd
}

say("First sender is odd? " + oddSender("desk@harborlibrary.example"));
say("Second sender is odd? " + oddSender("desk@harbor-library-help.test"));`,
        tests: [{ run: 'oddSender("desk@harborlibrary.example")', want: false }, { run: 'oddSender("desk@harbor-library-help.test")', want: true }, { run: 'oddSender("harborlibrary@free-books.test")', want: true, label: 'The right words with the wrong ending are still odd' }],
      }),
      code('d', 'Rule 3: a link that does not match. Fill the ___ blank so the rule compares what the link **shows** with where it **goes**.', {
        more: 'The words on a link can say one place while the link goes to another. Each message has `linkShows` and `linkGoes`. `!==` means "is not the same as".',
        hint: 'Each message has two link facts. One is already in the rule. Read the comment to find the name of the other one.',
        setup: INBOX,
        starter: `// Each message in the pretend inbox has:
//   linkShows: the words you see on the link
//   linkGoes:  where the link really goes
function linkMismatch(message) {
  return message.linkShows !== message.___;
}

for (let i = 0; i < inbox.length; i++) {
  if (linkMismatch(inbox[i])) {
    say("Flag: " + inbox[i].subject);
  }
}`,
        tests: [{ run: 'linkMismatch({ linkShows: "harborgym.example", linkGoes: "harborgym.example" })', want: false, label: 'A link that matches is not flagged' }, { run: 'linkMismatch({ linkShows: "harborgym.example", linkGoes: "win-a-prize.test" })', want: true, label: 'A link that does not match is flagged' }, { run: 'inbox.filter(linkMismatch).length', want: 2, label: 'Two of the four messages in the inbox are flagged' }],
      }),
    ],
    quiz: [
      q('q1', 'What is phishing?', ['A fake message that tries to trick you', 'A way to make passwords', 'A kind of computer game', 'A slow internet link']),
      q('q2', 'Which is a sign of a fake message?', ['It says hello', 'It comes from your coach', 'It tells you to act right now', 'It has no links']),
      q('q3', 'A link shows "harborlibrary.example" but goes to "library-card-fix.test". What does that tell you?', ['The link is safe', 'The link does not match, so do not tap it', 'The library has moved', 'The link is broken']),
      q('q4', 'A friend tapped a fake link and typed a password. What is the kind and right thing to do?', ['Laugh at them', 'Tell them it is their fault', 'Keep it a secret', 'Help them tell a trusted adult']),
    ],
    ship: {
      prompt: 'Teach someone at home the three signs of a fake message, and what to do when they see one.',
      frame: 'Three signs of a fake message are ___, ___ and ___. If I see one, I will ___.',
      stretch: 'In step b, add one more rush word to the list. Write a test message that only your new word catches.',
    },
    teacher: { note: 'Students may share that they or a family member were tricked. Listen, do not blame, and do not promise secrecy. Follow school policy and tell the counselor if a student may be at risk.' },
  },
  {
    id: 'g6-07', title: 'Secret Codes',
    question: 'How can a message stay secret while it travels?',
    goal: 'I can scramble and unscramble a message with a shift cipher, and explain how letters become numbers.',
    standards: ['6-8.CS.c.3', '6-8.CT.c.1'],
    job: ['Cryptographer', 'A person who designs and tests the codes that keep messages secret.'],
    mission: {
      story: [
        'Messages cross the Harbor District all day. Anyone on the way could read them. So agents scramble a message before they send it.',
        'A **cipher** is a rule for scrambling. To a computer, every letter is a number. A **shift cipher** adds the same number to each letter. Only people who know the **key** can read the message.',
        'Your job today: finish a shift cipher, send a secret message, and read one back.',
      ],
      vocab: [['Cipher', 'A rule for scrambling a message.'], ['Key', 'The secret that scrambles and unscrambles. Here it is the shift number.'], ['Encrypt', 'To scramble a message so others cannot read it.'], ['Decrypt', 'To unscramble a message with the key.']],
      talk: 'With a shift of 1, A becomes B. What does the word CAT become?',
      rule: 'Only unscramble messages that are meant for you. Reading someone else\'s private messages without permission is not allowed.',
    },
    steps: [
      code('a', 'To a computer, every letter is a number. Fill the ___ blank so `toNumber` finds where a **letter** sits in the alphabet.', {
        more: '`indexOf` gives the place of a letter. Counting starts at 0, so A is 0, B is 1 and Z is 25. Computers share a list like this called **ASCII**. In ASCII, A is 65.',
        hint: 'Look at the first line of the function. Which name holds the letter we are looking for?',
        starter: `const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function toNumber(letter) {
  // indexOf() tells you where the letter sits. A is 0.
  return alphabet.indexOf(___);
}

say("A is " + toNumber("A"));
say("H is " + toNumber("H"));
say("Z is " + toNumber("Z"));`,
        tests: [{ run: 'toNumber("A")', want: 0 }, { run: 'toNumber("H")', want: 7 }, { run: 'toNumber("Z")', want: 25 }],
      }),
      code('b', 'Now shift one letter. Fill the ___ blank so the letter moves along the alphabet by the **shift** number.', {
        more: 'With a shift of 3, A (0) moves to spot 3, which is D. `% 26` wraps around the end: after Z comes A again. So Y with a shift of 3 becomes B.',
        hint: 'The function gets two values: the letter and the shift. Which one should be added to the spot?',
        starter: `const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function shiftLetter(letter, shift) {
  const spot = alphabet.indexOf(letter);
  // % 26 wraps around: after Z comes A.
  const newSpot = (spot + ___) % 26;
  return alphabet[newSpot];
}

say("A shifted by 3 is " + shiftLetter("A", 3));
say("Y shifted by 3 is " + shiftLetter("Y", 3));`,
        tests: [{ run: 'shiftLetter("A", 3)', want: 'D' }, { run: 'shiftLetter("Y", 3)', want: 'B' }, { run: 'shiftLetter("H", 1)', want: 'I' }],
      }),
      code('c', 'Scramble a whole message. Fill the ___ blank so every letter is shifted by the **shift** number.', {
        more: 'The loop takes one letter at a time, shifts it, and adds it to `result`. `shiftLetter` is the function you finished. It leaves spaces alone.',
        hint: 'shiftLetter needs two values: a letter, and how far to move it. The function already has a name for how far.',
        setup: SHIFT,
        starter: `// shiftLetter(letter, shift) is ready to use.
function scramble(message, shift) {
  let result = "";
  // Shift each letter and add it to the result.
  for (let i = 0; i < message.length; i++) {
    result = result + shiftLetter(message[i], ___);
  }
  return result;
}

say(scramble("MEET AT THE DOCK", 3));`,
        tests: [{ run: 'scramble("MEET AT THE DOCK", 3)', want: 'PHHW DW WKH GRFN' }, { run: 'scramble("HARBOR", 1)', want: 'IBSCPS' }],
      }),
      code('d', 'To unscramble, keep shifting until you are back at the start. Fill the ___ blank with the **shift** that scrambled the message.', {
        more: 'There are 26 letters. A shift of 3, then a shift of 23 more, makes 26: all the way around. So `26 - shift` undoes the scramble. You need the key to do it.',
        hint: 'To undo a shift of 3 we need 26 - 3. The function has a name for that 3.',
        setup: SCRAMBLE,
        starter: `// scramble(message, shift) is ready to use.
function unscramble(message, shift) {
  // Shift the rest of the way around the alphabet.
  return scramble(message, 26 - ___);
}

say(unscramble("PHHW DW WKH GRFN", 3));
say(unscramble("IBSCPS", 1));`,
        tests: [{ run: 'unscramble("PHHW DW WKH GRFN", 3)', want: 'MEET AT THE DOCK' }, { run: 'unscramble("IBSCPS", 1)', want: 'HARBOR' }, { run: 'unscramble(scramble("FERRY AT NOON", 7), 7)', want: 'FERRY AT NOON', label: 'Scramble then unscramble gives the message back' }],
      }),
    ],
    quiz: [
      q('q1', 'What is a cipher?', ['A kind of password', 'A rule for scrambling a message', 'A broken computer', 'A list of names']),
      q('q2', 'With a shift of 3, what does the letter A become?', ['B', 'C', 'D', 'X']),
      q('q3', 'A shift cipher has only 25 useful keys. Why is that a weak defence?', ['A computer can try all 25 very fast', 'The letters are too small', 'Nobody can read it', 'It uses too much power']),
      q('q4', 'You find a scrambled note that belongs to someone else. What should you do?', ['Unscramble it for fun', 'Post it online', 'Leave it, or give it back', 'Change the words']),
    ],
    ship: {
      prompt: 'Explain to someone at home how a shift cipher scrambles a message, and what the key is.',
      frame: 'A shift cipher works by ___. To read the message you need ___.',
      stretch: 'A secret says "ESP VPJ TD FYOPC ESP XLE". In step d, try `unscramble` with different shifts until you can read it.',
    },
    teacher: { note: 'The shift cipher is a teaching toy, not real protection: it has only 25 keys. Use quick-check question 3 to link back to brute force in lesson 3.' },
  },
  {
    id: 'g6-08', title: 'Bugs, Viruses and Updates',
    question: 'Why do updates keep a computer safe?',
    goal: 'I can explain how a virus spreads, how updates stop it, and how a scanner finds a bad file.',
    standards: ['6-8.CAS.a.1', '6-8.CT.e.2'],
    job: ['Malware analyst', 'A person who studies harmful programs in a safe place, so that scanners can find and block them.'],
    mission: {
      story: [
        'A **bug** is a mistake in code. A **virus** is a harmful program that copies itself from one computer to the next. It often gets in through a bug.',
        'An **update** fixes bugs. So an updated computer can block a virus that an old one lets in.',
        'The Harbor District school has six pretend computers in a row. Your job today: watch a pretend virus move, stop it with updates, and finish a scanner.',
      ],
      vocab: [['Bug', 'A mistake in code.'], ['Virus', 'A harmful program that copies itself to other computers.'], ['Update', 'A newer copy of a program with bugs fixed.'], ['Scanner', 'A program that looks for harmful files.'], ['Model', 'A small pretend copy of something real that is safe to test.']],
      talk: 'Why do you think phones and laptops ask to update so often?',
      rule: 'Making or sending a real virus is against the law. If you think a computer has one, stop and report it to a trusted adult.',
    },
    steps: [
      code('a', 'This pretend virus is only the word "sick" in a list. Change **one number** so it reaches all six computers. Then press Run.', {
        more: 'This is a **model**: a small pretend copy that is safe to test. Each round, the loop writes "sick" in the next spot of the list. No real computer is touched.',
        hint: 'Count the computers in the row. How many rounds does the virus need to reach every one?',
        starter: `// Six pretend computers in a row. "ok" means healthy.
const computers = ["ok", "ok", "ok", "ok", "ok", "ok"];

// Each round, the pretend virus moves to the next computer.
let rounds = 2;
for (let i = 0; i < rounds; i++) {
  computers[i] = "sick";
}

say(computers.join(" "));`,
        tests: [{ run: 'computers', want: ['sick', 'sick', 'sick', 'sick', 'sick', 'sick'], label: 'All six computers are sick, and the row still has six' }, { says: 'sick sick sick sick sick sick' }],
      }),
      code('b', 'Now some computers are updated. Fill the ___ blank so the virus stops when it meets an updated computer.', {
        more: 'The list `updated` says true for a computer with the update and false for one without. `break` stops the loop, so the virus goes no further.',
        hint: 'An updated computer has the value true in the list. A computer with no update has false.',
        starter: `// spread() counts how many computers get sick.
// updated is a list: true means that computer has the update.
function spread(updated) {
  let sick = 0;
  for (let i = 0; i < updated.length; i++) {
    // An updated computer blocks the virus.
    if (updated[i] === ___) {
      break;
    }
    sick = sick + 1;
  }
  return sick;
}

say("No updates: " + spread([false, false, false, false, false, false]) + " sick");
say("Third computer updated: " + spread([false, false, true, false, false, false]) + " sick");
say("All updated: " + spread([true, true, true, true, true, true]) + " sick");`,
        tests: [{ run: 'spread([false, false, false, false, false, false])', want: 6 }, { run: 'spread([false, false, true, false, false, false])', want: 2 }, { run: 'spread([true, true, true, true, true, true])', want: 0 }],
      }),
      code('c', 'A scanner looks for a **pattern** that the bad file has in its text. Fill the ___ blank so the scanner looks for the pattern.', {
        more: 'The pretend files are only short pieces of text. The scanner reads each one. If the text includes the pattern, it gives back the name of that file.',
        hint: 'Look above the function. Which name holds the pattern the scanner should look for?',
        starter: `// Pretend files. Each one is only a name and some text.
const files = [
  { name: "homework.txt", text: "My essay about boats" },
  { name: "game.txt", text: "jump run score" },
  { name: "free-prize.txt", text: "hello ZAP-99 goodbye" }
];

// The bad file always has this pattern in its text.
const pattern = "ZAP-99";

function scan(list) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].text.includes(___)) {
      return list[i].name;
    }
  }
  return "all clear";
}

say("Found: " + scan(files));`,
        tests: [{ run: 'scan(files)', want: 'free-prize.txt' }, { run: 'scan([{ name: "notes.txt", text: "boats and ferries" }])', want: 'all clear' }, { run: 'scan([{ name: "song.txt", text: "la la la" }, { name: "photo.txt", text: "ZAP-99 inside" }])', want: 'photo.txt' }],
      }),
      lab('d', 'You are the defender. Sort each habit: does it help keep viruses out, or not?', {
        type: 'sort', bins: ['Helps keep viruses out', 'Does not help'],
        items: [['Install updates when they arrive', 0], ['Tap "Remind me later" for months', 1], ['Let the scanner check new files', 0], ['Open a file called free-prize from a stranger', 1], ['Tell an adult when a computer acts oddly', 0], ['Turn the scanner off to make a game faster', 1]],
      }, 'Updates fix the bugs that viruses use. A scanner only knows the patterns it has been given, so it needs updates too.'),
    ],
    quiz: [
      q('q1', 'What is a bug?', ['A harmful person', 'A mistake in code', 'A strong password', 'A kind of update']),
      q('q2', 'In the model, why did the virus stop at an updated computer?', ['The update fixed the bug the virus used', 'The computer was turned off', 'The virus got tired', 'The list was too short']),
      q('q3', 'How does the scanner find the bad file?', ['It picks a file by chance', 'It deletes every file', 'It looks for a known pattern in the text', 'It asks the file']),
      q('q4', 'A school computer starts to act oddly after you open a file. What should you do?', ['Keep working and say nothing', 'Send the file to a friend', 'Try to fix it in secret', 'Stop and tell your teacher']),
    ],
    ship: {
      prompt: 'Explain to someone at home why it is a good idea to install updates.',
      frame: 'Updates keep a computer safe because ___. A scanner helps by ___.',
      stretch: 'In step b, try `spread` with only the first computer updated. How many get sick? Why does that one update help so much?',
    },
    teacher: { note: 'The virus here is only a word in a list. If students ask how real viruses are made, return to the mission rule and the defender\'s side: updates, scanners and reporting.' },
  },
  {
    id: 'g6-09', title: 'Your Trail and Your Crew', sensitive: true,
    question: 'What happens to a post after you send it?',
    goal: 'I can pause before I post, and I know the steps to save and report an unkind message.',
    standards: ['6-8.CAS.a.2', '6-8.CAS.a.3', '6-8.CAS.a.4'],
    job: ['Trust and safety specialist', 'A person who reads reports from users and works to keep an online community kind and safe.'],
    mission: {
      story: [
        'The Harbor District crew has a group chat. Most posts are kind and fun. But a post can be copied in a second, and a copy can stay online for years.',
        'Sometimes a person sends an unkind message, again and again. That is **cyberbullying**. It is never the fault of the person who gets it.',
        'Your job today: finish a checker that says "pause" before a risky post, and learn the steps to save and report an unkind message.',
      ],
      vocab: [['Post', 'Something you put online for others to see.'], ['Cyberbullying', 'Using phones or computers to be unkind to someone again and again.'], ['Screenshot', 'A saved picture of what is on the screen.'], ['Report', 'To tell an adult or the app about a problem so they can act.']],
      talk: 'Can you really take a post back after you delete it? Why or why not?',
      rule: 'Be kind online, as you would be face to face. If you see or get an unkind message, save it and report it to a trusted adult.',
    },
    steps: [
      code('a', 'The checker looks for private words in a post. Fill the ___ blank: what should it answer when it finds **no** private words?', {
        more: 'The loop looks for each private word in the post. If it finds one, it answers `true` at once. The last line only runs when the loop found nothing.',
        hint: 'The checker answers true when it finds a private word. What is the opposite answer?',
        starter: `// Words that mean a post may share something private.
const privateWords = ["address", "phone number", "password"];

function sharesPrivate(post) {
  const t = post.toLowerCase();
  for (let i = 0; i < privateWords.length; i++) {
    if (t.includes(privateWords[i])) {
      return true;
    }
  }
  // No private words were found.
  return ___;
}

say("Address post is private? " + sharesPrivate("My address is 12 Pretend Lane"));
say("Game post is private? " + sharesPrivate("Great game today, crew!"));`,
        tests: [{ run: 'sharesPrivate("My address is 12 Pretend Lane")', want: true }, { run: 'sharesPrivate("Great game today, crew!")', want: false }, { run: 'sharesPrivate("See you at the dock")', want: false }],
      }),
      code('b', 'Now join two checks. Fill both ___ blanks: each problem adds **1** flag, and the checker says pause when there are more than **0** flags.', {
        more: '`isUnkind` looks for unkind words, the same way `sharesPrivate` looks for private ones. Both are already loaded. A **flag** marks a reason to stop and think.',
        hint: 'Both blanks are numbers, and both numbers are in the instruction.',
        setup: POST_CHECKS,
        starter: `// isUnkind(post) and sharesPrivate(post) are ready to use.
function pauseCheck(post) {
  let flags = 0;
  if (isUnkind(post)) {
    flags = flags + 1;
  }
  // A private word adds a flag too.
  if (sharesPrivate(post)) {
    flags = flags + ___;
  }
  // Any flag at all means: pause.
  if (flags > ___) {
    return "Pause before you post";
  }
  return "OK to post";
}

say(pauseCheck("Great game today, crew!"));
say(pauseCheck("Nobody likes your drawing"));
say(pauseCheck("Call me, my phone number is 555-0142"));`,
        tests: [{ run: 'pauseCheck("Great game today, crew!")', want: 'OK to post' }, { run: 'pauseCheck("Nobody likes your drawing")', want: 'Pause before you post' }, { run: 'pauseCheck("Call me, my phone number is 555-0142")', want: 'Pause before you post' }],
      }),
      code('c', 'Kai deleted a post. But two people saved it first. Fill the ___ blank so the count also looks in the list of saved copies.', {
        more: 'Deleting takes a post out of `posts`. It cannot take it out of other people\'s screenshots. That is why a post can stay online after you delete it.',
        hint: 'There are two lists at the top. The first loop looks in posts. Which list should the second loop look in?',
        starter: `// A pretend chat. Kai is a made-up student.
const posts = ["Beach day!", "My new phone number is 555-0142"];
// Two people saved a picture of Kai's second post.
const savedByOthers = ["My new phone number is 555-0142", "My new phone number is 555-0142", "Beach day!"];

// Kai deletes the second post.
posts.pop();

// Count every place a post still is.
function copiesLeft(text) {
  let count = 0;
  for (let i = 0; i < posts.length; i++) {
    if (posts[i] === text) { count = count + 1; }
  }
  for (let i = 0; i < ___.length; i++) {
    if (savedByOthers[i] === text) { count = count + 1; }
  }
  return count;
}

say("Copies of the deleted post: " + copiesLeft("My new phone number is 555-0142"));`,
        tests: [{ run: 'copiesLeft("My new phone number is 555-0142")', want: 2, label: 'The deleted post still has 2 copies' }, { run: 'copiesLeft("Beach day!")', want: 2, label: 'Beach day! is in 2 places' }, { run: 'copiesLeft("A post nobody made")', want: 0 }],
      }),
      lab('d', 'A crew member gets an unkind message. It is not their fault. Put the steps in order, from first to last.', {
        type: 'order',
        items: ['Stop. Do not answer back.', 'Save the message with a screenshot.', 'Show the screenshot to a trusted adult.', 'Report the message in the app, then block the sender.'],
      }, 'Save before you block or report, so the adult can see what was said. Answering back can make things worse.'),
    ],
    quiz: [
      q('q1', 'You delete a post. Is it gone for good?', ['Yes, always', 'Yes, after one day', 'Not always. Others may have saved a copy', 'Only if it was a photo']),
      q('q2', 'Why save an unkind message before you block the sender?', ['To send it back later', 'So a trusted adult can see what was said', 'To post it for everyone', 'So you can read it again']),
      q('q3', 'What does the "pause before you post" checker look for?', ['Spelling mistakes', 'Long words', 'Funny pictures', 'Unkind words and private facts']),
      q('q4', 'A classmate keeps getting unkind messages in the group chat. What can you do?', ['Join in so you fit in', 'Stay quiet and leave the chat', 'Be kind to them and tell a trusted adult', 'Tell them it is their fault']),
    ],
    ship: {
      prompt: 'Explain to someone at home what you will ask yourself before you post, and what you will do if you see an unkind message.',
      frame: 'Before I post, I will ask myself ___. If I see an unkind message, I will ___.',
      stretch: 'In step a, add one more private word to the `privateWords` list. Write a test post that only your new word catches.',
    },
    teacher: { note: 'A student may share that they are being bullied, or have bullied. Listen, do not blame, and do not promise secrecy. Follow school policy and tell the counselor the same day.' },
  },
  {
    id: 'g6-10', title: 'My Safety Kit', project: true,
    question: 'How do my safety tools work together?',
    goal: 'I can join three safety tools into one program with a menu, and explain it to someone else.',
    standards: ['6-8.CT.d.3', '6-8.CAS.a.1'],
    job: ['Security awareness trainer', 'A person who teaches others the habits and tools that keep them safe online.'],
    mission: {
      story: [
        'You have built a lot in the Harbor District: a password strength checker, a fake-message spotter and a cipher.',
        'Now the Harbor District families want one program they can use at home. Your project: join your tools into one **safety kit**.',
        'The kit needs a **menu**: a function that takes a choice, 1, 2 or 3, and runs the right tool. Then you will explain your kit to someone at home.',
      ],
      vocab: [['Menu', 'A list of choices. The program runs the one you pick.'], ['Tool', 'A function that does one useful job.'], ['Input', 'The value you give to a program or a function.']],
      talk: 'Which of your three tools would help your family the most? Why?',
      rule: 'Share your kit with made-up examples only. Ask before you help with someone else\'s account, and never ask for their real password.',
    },
    steps: [
      code('a', 'Your three tools are already loaded. Fill the ___ blank so choice 1 runs the password checker called `strength`.', {
        more: 'The menu is a function with two values: `choice` is the number picked, and `input` is the text to check. Each `if` sends the input to one tool.',
        hint: 'The first comment names the tool for choice 1. Type that name where the blank is.',
        setup: KIT,
        starter: `// Tools ready to use:
//   strength(text)       scores a made-up password: 0, 1 or 2
//   looksFake(text)      true when a message rushes you
//   scramble(text, 3)    scrambles a message with a shift of 3
function menu(choice, input) {
  if (choice === 1) {
    return "Strength: " + ___(input);
  }
  return "Pick 1, 2 or 3";
}

say(menu(1, "purple-otter-42"));
say(menu(1, "qwerty"));
say(menu(9, "hello"));`,
        tests: [{ run: 'menu(1, "purple-otter-42")', want: 'Strength: 2' }, { run: 'menu(1, "qwerty")', want: 'Strength: 0' }, { run: 'menu(9, "hello")', want: 'Pick 1, 2 or 3' }],
      }),
      code('b', 'Add the fake spotter as choice 2. Write **two lines** where the comments say. Use `looksFake(input)`.', {
        more: '`looksFake(input)` answers true or false. An `if` can use that answer: `if (looksFake(input)) { ... }`. The second `return` only runs when the `if` did not.',
        hint: 'An if line can ask looksFake(input) a question. Look at how choice 1 gives back its text. Remember the quote marks.',
        setup: KIT,
        starter: `function menu(choice, input) {
  if (choice === 1) {
    return "Strength: " + strength(input);
  }
  if (choice === 2) {
    // Line 1: if looksFake(input) is true, return "Looks fake"
    // Line 2: return "Looks OK"

  }
  return "Pick 1, 2 or 3";
}

say(menu(2, "Act now to claim your prize!"));
say(menu(2, "Practice moves to 4 pm on Friday."));`,
        tests: [{ run: 'menu(2, "Act now to claim your prize!")', want: 'Looks fake' }, { run: 'menu(2, "Practice moves to 4 pm on Friday.")', want: 'Looks OK' }, { run: 'menu(2, "URGENT: send your card number")', want: 'Looks fake' }, { run: 'menu(1, "otter7")', want: 'Strength: 1', label: 'Choice 1 still works' }],
      }),
      code('c', 'Add the cipher as choice 3. Write **three lines**: an `if` for choice 3 that returns `scramble(input, 3)`.', {
        more: 'Copy the shape of choice 1: a line with `if`, a line with `return`, and a line with `}`. Now the menu has all three tools.',
        hint: 'Copy the three lines of choice 1. Then change the number, and change what the middle line gives back.',
        setup: KIT,
        starter: `function menu(choice, input) {
  if (choice === 1) {
    return "Strength: " + strength(input);
  }
  if (choice === 2) {
    if (looksFake(input)) { return "Looks fake"; }
    return "Looks OK";
  }
  // Choice 3 is the cipher. Write your three lines here.

  return "Pick 1, 2 or 3";
}

say(menu(1, "purple-otter-42"));
say(menu(2, "Hurry! Free tickets!"));
say(menu(3, "MEET AT THE DOCK"));`,
        tests: [{ run: 'menu(3, "MEET AT THE DOCK")', want: 'PHHW DW WKH GRFN' }, { run: 'menu(3, "HARBOR")', want: 'KDUERU' }, { run: 'menu(2, "Hurry! Free tickets!")', want: 'Looks fake', label: 'Choice 2 still works' }, { run: 'menu(7, "hello")', want: 'Pick 1, 2 or 3', label: 'Other choices still ask you to pick 1, 2 or 3' }],
      }),
      lab('d', 'Get ready to explain your kit at home. Match each tool to the danger it defends against.', {
        type: 'match',
        pairs: [['Strength checker', 'A password that is easy to guess'], ['Fake spotter', 'A message built to trick you'], ['Cipher', 'Someone reading a private note'], ['Asking for permission first', 'Testing something that is not yours']],
      }, 'No tool does it all. Your kit works best together with good habits: pause, check, and ask a trusted adult.'),
    ],
    quiz: [
      q('q1', 'What does the `menu` function do?', ['It runs the tool for the choice you pick', 'It makes passwords', 'It deletes messages', 'It turns the computer off']),
      q('q2', 'In your kit, what does `menu(9, "hello")` give back?', ['Strength: 2', 'Looks fake', 'Pick 1, 2 or 3', 'An error']),
      q('q3', 'Which tool helps you spot a message that tries to trick you?', ['The strength checker', 'The fake spotter', 'The cipher', 'The menu']),
      q('q4', 'Someone at home wants to try your strength checker. What should you tell them?', ['Type your real password', 'Tell me your password and I will type it', 'It only works on real passwords', 'Use a made-up password, never a real one']),
    ],
    ship: {
      prompt: 'Show your safety kit to someone at home. Explain what each tool does and one habit that keeps them safe.',
      frame: 'My kit has ___ tools. The most useful one is ___ because ___.',
      stretch: 'Add a choice 4 to your menu. It could unscramble a message: `scramble(input, 23)` undoes a shift of 3.',
    },
    teacher: { note: 'Project lesson: steps b and c are the first time students write whole lines, so pair students up. For the home demo, remind families to use made-up passwords only.' },
  },
];
