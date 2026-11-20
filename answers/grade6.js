// Grade 6 answers. Never served to a student.
export default {
  'g6-01': {
    quiz: {
      q1: [1, 'Permission from the owner is what makes hacking helpful.'],
      q2: [0, 'A variable is a name that holds a value.'],
      q3: [2, 'Report what you find to an adult, and do not use it.'],
      q4: [3, 'It is the set of rules for using school computers and accounts.'],
    },
    code: {
      a: `// A variable holds a value. Change the value of codeName.
let codeName = "Falcon";
let district = "Harbor District";

// say() prints a line.
say("CIPHER CITY AGENT BADGE");
say("Agent " + codeName);
say("District: " + district);`,
      b: `// badge() takes a name and a level. It gives back the badge text.
function badge(name, level) {
  return "Agent " + name + " | Level " + level;
}

say(badge("Falcon", 1));
say(badge("Otter", 2));`,
      c: `// The owner's answer is true (yes) or false (no).
function canTest(ownerSaidYes) {
  if (ownerSaidYes === true) {
    return "Go ahead";
  }
  return "Stop and ask first";
}

say(canTest(true));
say(canTest(false));`,
    },
  },
  'g6-02': {
    quiz: {
      q1: [2, 'A home address could help a stranger find you.'],
      q2: [0, 'Your digital footprint is the trail about you that stays online.'],
      q3: [1, 'includes() asks if a value is on the list.'],
      q4: [3, 'A trusted adult can help you decide what an app really needs.'],
    },
    code: {
      a: `// Juno is a made-up student. label() says what to do with one fact.
function label(fact) {
  if (fact === "home address") {
    return "keep";
  }
  return "share";
}

say("favorite color: " + label("favorite color"));
say("home address: " + label("home address"));`,
      b: `// The facts on this list are private.
const keepList = ["home address", "phone number", "password", "birthday"];

function label(fact) {
  // includes() asks: is this on the list?
  if (keepList.includes(fact)) {
    return "keep";
  }
  return "share";
}

say("phone number: " + label("phone number"));
say("favorite food: " + label("favorite food"));`,
      c: `// Facts about Juno, a made-up student. label() is ready to use.
const junoFacts = ["favorite color", "home address", "favorite food", "phone number", "favorite band", "birthday", "favorite sport"];

let keepCount = 0;
for (let i = 0; i < junoFacts.length; i++) {
  const fact = junoFacts[i];
  say(fact + ": " + label(fact));
  // Count the private facts.
  if (label(fact) === "keep") {
    keepCount = keepCount + 1;
  }
}
say("Keep " + keepCount + " facts private");`,
    },
  },
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
  'g6-04': {
    quiz: {
      q1: [3, 'It is long, mixes letters and numbers, and is not a common password.'],
      q2: [1, 'Guessers try the common passwords first, so they are found at once.'],
      q3: [0, 'length counts the characters in the text.'],
      q4: [1, 'Never type a real password into a checker. Use a made-up one.'],
    },
    code: {
      a: `// Every password in this lesson is made up.
function isLong(password) {
  // .length counts the characters.
  return password.length >= 12;
}

say("sunny: " + isLong("sunny"));
say("purple-otter-42: " + isLong("purple-otter-42"));`,
      b: `function hasNumber(password) {
  const digits = "0123456789";
  // Look at each character, one at a time.
  for (let i = 0; i < password.length; i++) {
    if (digits.includes(password[i])) {
      return true;
    }
  }
  return false;
}

say("otter: " + hasNumber("otter"));
say("otter7: " + hasNumber("otter7"));`,
      c: `// isLong() and hasNumber() are ready to use.
// Passwords that guessers try first.
const common = ["123456", "password", "qwerty", "letmein"];

function strength(password) {
  // A common password scores 0.
  if (common.includes(password)) {
    return 0;
  }
  let score = 0;
  // Each good check adds 1 point.
  if (isLong(password)) {
    score = score + 1;
  }
  if (hasNumber(password)) {
    score = score + 1;
  }
  return score;
}

say("123456 scores " + strength("123456"));
say("otter7 scores " + strength("otter7"));
say("purple-otter-42 scores " + strength("purple-otter-42"));`,
    },
  },
  'g6-05': {
    quiz: {
      q1: [0, 'A passphrase is a password made of several words.'],
      q2: [2, 'Four words make a long password, so there are very many to try.'],
      q3: [1, 'It adds a second check that a thief is unlikely to have.'],
      q4: [3, 'A sign-in code is only for you. A real helper never asks for it.'],
    },
    code: {
      a: `// pick(list) gives you one word from a list.
// Simple words for the machine to pick from.
const words = ["otter", "lantern", "pebble", "harbor", "maple", "rocket", "violin", "puddle", "cactus", "tunnel", "marble", "breeze", "pickle", "comet", "ferry", "walrus"];

function makePassphrase() {
  const parts = [];
  // Each time around, pick one more word.
  for (let i = 0; i < 4; i++) {
    parts.push(pick(words));
  }
  return parts.join("-");
}

say(makePassphrase());
say(makePassphrase());`,
      b: `// makePassphrase() is ready to use.
function strongEnough(phrase) {
  // Count the words.
  const count = phrase.split("-").length;
  // Strong means enough words AND enough characters.
  return count >= 4 && phrase.length >= 16;
}

const phrase = makePassphrase();
say(phrase + " strong enough? " + strongEnough(phrase));
say("otter-ferry strong enough? " + strongEnough("otter-ferry"));`,
      c: `// A pretend sign-in for the Harbor Library. Everything is made up.
const savedPhrase = "otter-lantern-pebble-harbor";
const codeOnPhone = "4821";

function signIn(phrase, code) {
  // Step 1: the passphrase must match.
  if (phrase !== savedPhrase) {
    return "Wrong passphrase";
  }
  // Step 2: the code must match the one sent to the phone.
  if (code !== codeOnPhone) {
    return "Wrong code";
  }
  return "Welcome";
}

say(signIn("otter-lantern-pebble-harbor", "4821"));
say(signIn("otter-lantern-pebble-harbor", "0000"));`,
    },
  },
  'g6-06': {
    quiz: {
      q1: [0, 'Phishing is a fake message built to trick people.'],
      q2: [2, 'A rush is a sign: the sender wants you to act before you think.'],
      q3: [1, 'The link shows one place and goes to another. That is a sign of a fake.'],
      q4: [3, 'These messages are built to fool people. Help, do not blame.'],
    },
    code: {
      b: `// Words that rush you.
const rushWords = ["act now", "hurry", "urgent"];

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
      c: `// Real messages from the Harbor Library end like this.
const realEnding = "@harborlibrary.example";

function oddSender(from) {
  // endsWith() checks the end of the text.
  if (from.endsWith(realEnding)) {
    return false; // the ending is right
  }
  return true; // the ending is odd
}

say("First sender is odd? " + oddSender("desk@harborlibrary.example"));
say("Second sender is odd? " + oddSender("desk@harbor-library-help.test"));`,
      d: `// Each message in the pretend inbox has:
//   linkShows: the words you see on the link
//   linkGoes:  where the link really goes
function linkMismatch(message) {
  return message.linkShows !== message.linkGoes;
}

for (let i = 0; i < inbox.length; i++) {
  if (linkMismatch(inbox[i])) {
    say("Flag: " + inbox[i].subject);
  }
}`,
    },
  },
  'g6-07': {
    quiz: {
      q1: [1, 'A cipher is a rule for scrambling a message.'],
      q2: [2, 'A moves three places along: B, C, D.'],
      q3: [0, 'With so few keys, trying every one takes a computer no time at all.'],
      q4: [2, 'Only unscramble messages that are meant for you.'],
    },
    code: {
      a: `const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function toNumber(letter) {
  // indexOf() tells you where the letter sits. A is 0.
  return alphabet.indexOf(letter);
}

say("A is " + toNumber("A"));
say("H is " + toNumber("H"));
say("Z is " + toNumber("Z"));`,
      b: `const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function shiftLetter(letter, shift) {
  const spot = alphabet.indexOf(letter);
  // % 26 wraps around: after Z comes A.
  const newSpot = (spot + shift) % 26;
  return alphabet[newSpot];
}

say("A shifted by 3 is " + shiftLetter("A", 3));
say("Y shifted by 3 is " + shiftLetter("Y", 3));`,
      c: `// shiftLetter(letter, shift) is ready to use.
function scramble(message, shift) {
  let result = "";
  // Shift each letter and add it to the result.
  for (let i = 0; i < message.length; i++) {
    result = result + shiftLetter(message[i], shift);
  }
  return result;
}

say(scramble("MEET AT THE DOCK", 3));`,
      d: `// scramble(message, shift) is ready to use.
function unscramble(message, shift) {
  // Shift the rest of the way around the alphabet.
  return scramble(message, 26 - shift);
}

say(unscramble("PHHW DW WKH GRFN", 3));
say(unscramble("IBSCPS", 1));`,
    },
  },
  'g6-08': {
    quiz: {
      q1: [1, 'A bug is a mistake in code.'],
      q2: [0, 'An update fixes the bug, so the virus has no way in.'],
      q3: [2, 'The scanner looks for a pattern it knows the bad file has.'],
      q4: [3, 'Stop and report it, so an adult can check the computer.'],
    },
    code: {
      a: `// Six pretend computers in a row. "ok" means healthy.
const computers = ["ok", "ok", "ok", "ok", "ok", "ok"];

// Each round, the pretend virus moves to the next computer.
let rounds = 6;
for (let i = 0; i < rounds; i++) {
  computers[i] = "sick";
}

say(computers.join(" "));`,
      b: `// spread() counts how many computers get sick.
// updated is a list: true means that computer has the update.
function spread(updated) {
  let sick = 0;
  for (let i = 0; i < updated.length; i++) {
    // An updated computer blocks the virus.
    if (updated[i] === true) {
      break;
    }
    sick = sick + 1;
  }
  return sick;
}

say("No updates: " + spread([false, false, false, false, false, false]) + " sick");
say("Third computer updated: " + spread([false, false, true, false, false, false]) + " sick");
say("All updated: " + spread([true, true, true, true, true, true]) + " sick");`,
      c: `// Pretend files. Each one is only a name and some text.
const files = [
  { name: "homework.txt", text: "My essay about boats" },
  { name: "game.txt", text: "jump run score" },
  { name: "free-prize.txt", text: "hello ZAP-99 goodbye" }
];

// The bad file always has this pattern in its text.
const pattern = "ZAP-99";

function scan(list) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].text.includes(pattern)) {
      return list[i].name;
    }
  }
  return "all clear";
}

say("Found: " + scan(files));`,
    },
  },
  'g6-09': {
    quiz: {
      q1: [2, 'Others may have saved a copy, so a post can stay online.'],
      q2: [1, 'The saved message shows a trusted adult what was said.'],
      q3: [3, 'It flags unkind words and private facts.'],
      q4: [2, 'Be kind and tell a trusted adult. It is never the fault of the person targeted.'],
    },
    code: {
      a: `// Words that mean a post may share something private.
const privateWords = ["address", "phone number", "password"];

function sharesPrivate(post) {
  const t = post.toLowerCase();
  for (let i = 0; i < privateWords.length; i++) {
    if (t.includes(privateWords[i])) {
      return true;
    }
  }
  // No private words were found.
  return false;
}

say("Address post is private? " + sharesPrivate("My address is 12 Pretend Lane"));
say("Game post is private? " + sharesPrivate("Great game today, crew!"));`,
      b: `// isUnkind(post) and sharesPrivate(post) are ready to use.
function pauseCheck(post) {
  let flags = 0;
  if (isUnkind(post)) {
    flags = flags + 1;
  }
  // A private word adds a flag too.
  if (sharesPrivate(post)) {
    flags = flags + 1;
  }
  // Any flag at all means: pause.
  if (flags > 0) {
    return "Pause before you post";
  }
  return "OK to post";
}

say(pauseCheck("Great game today, crew!"));
say(pauseCheck("Nobody likes your drawing"));
say(pauseCheck("Call me, my phone number is 555-0142"));`,
      c: `// A pretend chat. Kai is a made-up student.
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
  for (let i = 0; i < savedByOthers.length; i++) {
    if (savedByOthers[i] === text) { count = count + 1; }
  }
  return count;
}

say("Copies of the deleted post: " + copiesLeft("My new phone number is 555-0142"));`,
    },
  },
  'g6-10': {
    quiz: {
      q1: [0, 'The menu takes your choice and runs the right tool.'],
      q2: [2, 'Any choice that is not 1, 2 or 3 gets the "Pick 1, 2 or 3" message.'],
      q3: [1, 'The fake spotter flags messages that rush you.'],
      q4: [3, 'Only made-up passwords go into a checker, never real ones.'],
    },
    code: {
      a: `// Tools ready to use:
//   strength(text)       scores a made-up password: 0, 1 or 2
//   looksFake(text)      true when a message rushes you
//   scramble(text, 3)    scrambles a message with a shift of 3
function menu(choice, input) {
  if (choice === 1) {
    return "Strength: " + strength(input);
  }
  return "Pick 1, 2 or 3";
}

say(menu(1, "purple-otter-42"));
say(menu(1, "qwerty"));
say(menu(9, "hello"));`,
      b: `function menu(choice, input) {
  if (choice === 1) {
    return "Strength: " + strength(input);
  }
  if (choice === 2) {
    if (looksFake(input)) { return "Looks fake"; }
    return "Looks OK";
  }
  return "Pick 1, 2 or 3";
}

say(menu(2, "Act now to claim your prize!"));
say(menu(2, "Practice moves to 4 pm on Friday."));`,
      c: `function menu(choice, input) {
  if (choice === 1) {
    return "Strength: " + strength(input);
  }
  if (choice === 2) {
    if (looksFake(input)) { return "Looks fake"; }
    return "Looks OK";
  }
  if (choice === 3) {
    return scramble(input, 3);
  }
  return "Pick 1, 2 or 3";
}

say(menu(1, "purple-otter-42"));
say(menu(2, "Hurry! Free tickets!"));
say(menu(3, "MEET AT THE DOCK"));`,
    },
  },
};
