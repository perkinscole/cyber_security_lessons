// Grade 6 answers. Never served to a student.
export default {
  'g6-03': {
    quiz: {
      q1: [0, 'Brute force means trying every possible answer until one works.'],
      q2: [2, 'Each extra digit multiplies the choices by 10.'],
      q3: [1, 'A lock-out makes every guess slow, so trying them all takes far too long.'],
      q4: [2, 'Testing is only OK with the owner\'s permission.'],
    },
    code: {
      a: `for (let pin = 0; pin < 100; pin++) {
  if (locker.open(pin)) {
    say("Opened with " + pin);
  }
}`,
      b: `let guesses = 0;
for (let pin = 0; pin < 100; pin++) {
  guesses = guesses + 1;
  if (locker.open(pin)) {
    say("Opened after " + guesses + " guesses");
    break;
  }
}`,
      c: `function howMany(digits) {
  let total = 1;
  for (let i = 0; i < digits; i++) {
    total = total * 10;
  }
  return total;
}
say("2 digits: " + howMany(2));
say("4 digits: " + howMany(4));
say("6 digits: " + howMany(6));`,
    },
  },
};
