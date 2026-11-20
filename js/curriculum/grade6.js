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

export default [
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
];
