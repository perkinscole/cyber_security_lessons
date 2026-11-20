// Grade 7 answers. Never served to a student.
export default {
  'g7-01': {
    quiz: {
      q1: [1, 'The prices are no longer right, so the store has lost "stay correct".'],
      q2: [1, 'Risk is harm times chance. 3 × 3 = 9 is more than 4 × 2 = 8.'],
      q3: [2, 'The tablet is not there when people need it, so "stay working" is broken.'],
      q4: [2, 'Permission from the owner, and reporting what you find, make testing helpful and legal.'],
    },
    code: {
      a: `// The pretend store is a list called store. One thing in it looks like this:
// { name: "price list", need: "correct", harm: 3, chance: 4 }
function risk(thing) {
  return thing.harm * thing.chance;
}
say("Risk to the price list: " + risk(store[0]));`,
      b: `function topRisk(list) {
  let best = list[0];
  for (let i = 1; i < list.length; i++) {
    if (risk(list[i]) > risk(best)) {
      best = list[i];
    }
  }
  return best.name;
}
say("Fix first: " + topRisk(store));`,
      c: `function line(thing) {
  return risk(thing) + ": " + thing.name + " must stay " + thing.need;
}
const ranked = byRisk(store);
for (let i = 0; i < ranked.length; i++) {
  say(line(ranked[i]));
}`,
    },
  },

  'g7-02': {
    quiz: {
      q1: [2, 'Three digits give 10 × 10 × 10 = 1,000 PINs, so the worst case is 1,000 guesses.'],
      q2: [1, 'Brute force needs many guesses. A lockout allows only a few.'],
      q3: [1, 'The function returns -1 when the loop ends and no PIN has opened the lock.'],
      q4: [2, 'Report a weak spot to someone who can fix it. Testing it without permission is not OK.'],
    },
    code: {
      a: `function crack(lock, howMany) {
  for (let pin = 0; pin < howMany; pin++) {
    if (lock.open(pin)) {
      return pin;
    }
  }
  return -1;
}
say("The PIN is " + crack(makeLock(47), 100));`,
      b: `function countGuesses(lock, howMany) {
  let guesses = 0;
  for (let pin = 0; pin < howMany; pin++) {
    guesses = guesses + 1;
    if (lock.open(pin)) {
      break;
    }
  }
  return guesses;
}
say("2 digits: " + countGuesses(makeLock(99), 100) + " guesses");
say("3 digits: " + countGuesses(makeLock(999), 1000) + " guesses");
say("4 digits: " + countGuesses(makeLock(9999), 10000) + " guesses");`,
      d: `function tryPin(lock, pin) {
  if (lock.wrong >= 3) {
    return "locked";
  }
  if (pin === lock.secret) {
    return "open";
  }
  lock.wrong = lock.wrong + 1;
  return "wrong";
}
say(after(55, [10, 20, 55]));
say(after(55, [10, 20, 30, 55]));`,
    },
  },

  'g7-03': {
    quiz: {
      q1: [0, 'People pick the same passwords, so trying the likely ones first is very quick.'],
      q2: [1, 'Length does not help when the password is one of the first that an attacker tries.'],
      q3: [0, 'Refusing common passwords takes away the list attack\'s easy wins.'],
      q4: [1, 'Using other people\'s passwords is against the law. A trusted adult can report the list.'],
    },
    code: {
      a: `function listAttack(login, words) {
  for (let i = 0; i < words.length; i++) {
    if (login.check(words[i])) {
      return words[i];
    }
  }
  return "not found";
}
say(listAttack(makeLogin("gocomets"), common));`,
      b: `function guessesNeeded(password, words) {
  for (let i = 0; i < words.length; i++) {
    if (words[i] === password) {
      return i + 1;
    }
  }
  return 0;
}
say("List attack: " + guessesNeeded("gocomets", common) + " guesses");
say("Brute force: up to " + 26 * 26 * 26 * 26 * 26 * 26 * 26 * 26 + " guesses");`,
      c: `function allowed(password) {
  if (password.length < 8) {
    return false;
  }
  if (common.includes(password.toLowerCase())) {
    return false;
  }
  return true;
}
say("GoComets: " + allowed("GoComets"));
say("tuba-lemon-42-river: " + allowed("tuba-lemon-42-river"));`,
    },
  },

  'g7-04': {
    quiz: {
      q1: [1, 'If the list is stolen, the thief gets only hashes, not passwords.'],
      q2: [1, 'The same text always gives the same hash, so matching hashes mean the right password.'],
      q3: [1, 'A hash cannot be run backwards to get the password.'],
      q4: [2, 'Home-made password code is weak. Real sites use tools that experts built and tested.'],
    },
    code: {
      a: `function scramble(text) {
  let total = 7;
  for (let i = 0; i < text.length; i++) {
    total = (total * 31 + text.charCodeAt(i)) % 1000;
  }
  return total;
}
say("cat: " + scramble("cat"));
say("act: " + scramble("act"));`,
      b: `function signUp(name, password) {
  users[name] = scramble(password);
  return "saved";
}
say(signUp("mika", "plum-kite-88"));
say(users);`,
      c: `function signIn(name, password) {
  const typed = scramble(password);
  if (typed === users[name]) {
    return true;
  }
  return false;
}
say("Right password: " + signIn("mika", "plum-kite-88"));
say("Wrong password: " + signIn("mika", "plum-kite-99"));`,
    },
  },

  'g7-05': {
    quiz: {
      q1: [0, 'A shift of 26 changes nothing, so only shifts 1 to 25 hide a message.'],
      q2: [1, 'Real English has common words like "the". Scrambled text has almost none.'],
      q3: [1, '5 + 21 = 26, one full trip round the alphabet.'],
      q4: [0, 'If a program can try every key, the cipher is broken. A defender needs a huge number of keys.'],
    },
    code: {
      a: `function shiftLetter(letter, shift) {
  const at = ALPHA.indexOf(letter);
  if (at === -1) {
    return letter;
  }
  return ALPHA[(at + shift) % 26];
}
say("a becomes " + shiftLetter("a", 3));
say("y becomes " + shiftLetter("y", 3));`,
      b: `function caesar(text, shift) {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result = result + shiftLetter(text[i], shift);
  }
  return result;
}
const secret = caesar("meet at the clock tower", 3);
say(secret);
say(caesar(secret, 23));`,
      c: `function score(text) {
  const words = text.split(" ");
  let count = 0;
  for (let i = 0; i < words.length; i++) {
    if (COMMON.includes(words[i])) {
      count = count + 1;
    }
  }
  return count;
}
say("Real: " + score("meet at the clock tower"));
say("Scrambled: " + score("phhw dw wkh forfn wrzhu"));`,
      d: `function crack(secret) {
  let best = "";
  let bestScore = -1;
  for (let shift = 1; shift <= 25; shift++) {
    const attempt = caesar(secret, shift);
    if (score(attempt) > bestScore) {
      best = attempt;
      bestScore = score(attempt);
    }
  }
  return best;
}
say(crack("phhw dw wkh forfn wrzhu"));`,
    },
  },

  'g7-06': {
    quiz: {
      q1: [0, 'Each key letter is a shift for one place in the message. Then the key repeats.'],
      q2: [3, '26 × 26 × 26 = 17,576.'],
      q3: [0, 'The cracker tries one shift for the whole message. Here each letter has its own shift.'],
      q4: [2, 'A long key with different letters has a huge key space, and a key must stay private.'],
    },
    code: {
      a: `function keyShift(key, i) {
  const letter = key[i % key.length];
  return ALPHA.indexOf(letter);
}
say(keyShift("cab", 0));
say(keyShift("cab", 4));`,
      b: `function keyCipher(text, key) {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result = result + shiftLetter(text[i], keyShift(key, i));
  }
  return result;
}
say(keyCipher("aaaaaa", "cab"));
say(keyCipher("meet at noon", "lemon"));`,
      c: `function howManyKeys(length) {
  let total = 1;
  for (let i = 0; i < length; i++) {
    total = total * 26;
  }
  return total;
}
say("1 letter: " + howManyKeys(1));
say("3 letters: " + howManyKeys(3));
say("8 letters: " + howManyKeys(8));`,
      d: `function holds(message, key) {
  const secret = keyCipher(message, key);
  const cracked = crackCaesar(secret);
  return cracked !== message;
}
const note = "meet me at the fountain at noon";
say("Key d: " + holds(note, "d"));
say("Key dd: " + holds(note, "dd"));
say("Key lemon: " + holds(note, "lemon"));`,
    },
  },

  'g7-07': {
    quiz: {
      q1: [1, 'Rushing people and asking for something private are two classic phishing clues.'],
      q2: [0, 'A false alarm is a real message flagged by mistake.'],
      q3: [1, 'A lower limit catches more fakes but also flags more real messages.'],
      q4: [1, 'Nobody is to blame for being tricked. Reporting fast and changing the password fixes it.'],
    },
    code: {
      a: `function countClues(text, clues) {
  const lower = text.toLowerCase();
  let count = 0;
  for (let i = 0; i < clues.length; i++) {
    if (lower.includes(clues[i])) {
      count = count + 1;
    }
  }
  return count;
}
say(countClues("URGENT! You won a prize.", ["urgent", "prize", "password"]));`,
      b: `function score(msg) {
  let points = countClues(msg.text, clues);
  if (!trusted(msg.from)) {
    points = points + 2;
  }
  return points;
}
say(inbox[0].from + ": " + inbox[0].text);
say("Score: " + score(inbox[0]));`,
      c: `function missed(limit) {
  let count = 0;
  for (let i = 0; i < inbox.length; i++) {
    if (inbox[i].fake && score(inbox[i]) < limit) {
      count = count + 1;
    }
  }
  return count;
}
say("Limit 4 misses " + missed(4) + " fakes");
say("Limit 2 misses " + missed(2) + " fakes");`,
      d: `// One good answer. Others work too.
const clues = ["urgent", "prize", "password", "click", "verify", "locked", "winner", "warning"];
const limit = 4;

say("Fakes missed: " + missed(limit));
say("False alarms: " + falseAlarms(limit));
showMistakes(limit);`,
    },
  },

  'g7-08': {
    quiz: {
      q1: [1, 'An updated computer is "safe": the flag cannot move into it.'],
      q2: [1, 'More updates each round means more safe computers before the flag arrives.'],
      q3: [0, 'A scanner compares files with a list of known patterns.'],
      q4: [1, 'Updates close the gaps that malware uses, so installing them soon is the best defence.'],
    },
    code: {
      a: `function countSick(row) {
  let count = 0;
  for (let i = 0; i < row.length; i++) {
    if (row[i] === "sick") {
      count = count + 1;
    }
  }
  return count;
}
say(countSick(["sick", "ok", "sick", "safe"]));`,
      b: `function simulate(spread, updates, rounds) {
  let row = newRow();
  for (let r = 1; r <= rounds; r++) {
    row = nextRound(row, spread, updates);
    say("Round " + r + ": " + show(row));
  }
  return countSick(row);
}
say("No updates. Sick at the end: " + simulate(1, 0, 4));
say("With updates. Sick at the end: " + simulate(2, 1, 3));`,
      c: `const spread = 2;
const updates = 5;

const sick = simulate(spread, updates, 6);
say("Sick at the end: " + sick);`,
      d: `function scan(list, pattern) {
  const found = [];
  for (let i = 0; i < list.length; i++) {
    if (list[i].text.includes(pattern)) {
      found.push(list[i].name);
    }
  }
  return found;
}
say(scan(files, "ZZ-FLAG-77"));`,
    },
  },

  'g7-09': {
    quiz: {
      q1: [0, 'Anyone nearby can pick up packets, but only unscrambled ones can be read.'],
      q2: [1, 'A firewall is a guard: every packet is checked against the rules.'],
      q3: [0, 'Port 80 carries plain pages, which a listener could read.'],
      q4: [1, 'Reading other people\'s traffic is against the law. Report the problem so it gets fixed.'],
    },
    code: {
      a: `function listen(packet) {
  if (packet.scrambled) {
    return "(cannot read)";
  }
  return packet.data;
}
say(listen(packets[0]));
say(listen(packets[2]));`,
      b: `function overheard(list) {
  const heard = [];
  for (let i = 0; i < list.length; i++) {
    if (!list[i].scrambled) {
      heard.push(list[i].data);
    }
  }
  return heard;
}
say(overheard(packets));`,
      c: `function allow(packet) {
  if (blocked.includes(packet.from)) {
    return false;
  }
  if (packet.port !== 443) {
    return false;
  }
  return true;
}
for (let i = 0; i < packets.length; i++) {
  const answer = allow(packets[i]) ? "allow" : "block";
  say(packets[i].from + " port " + packets[i].port + ": " + answer);
}`,
    },
  },

  'g7-10': {
    quiz: {
      q1: [0, 'A lockout leaves brute force only a few guesses out of 1,000.'],
      q2: [0, 'If common passwords are refused, the word list finds nothing.'],
      q3: [0, 'Decomposing a big job gives small parts you can solve and check one at a time.'],
      q4: [1, 'The report lists weak spots. It goes only to the owner, who can fix them.'],
    },
    code: {
      a: `for (let i = 0; i < wifi.length; i++) {
  if (!wifi[i].scrambled) {
    say("System 1 leaks: " + wifi[i].data);
  }
}

function openLocker(lock) {
  for (let pin = 0; pin < 1000; pin++) {
    if (lock.open(pin)) {
      return pin;
    }
  }
  return -1;
}
say("System 2 PIN: " + openLocker(locker));`,
      b: `function findPassword(number, words) {
  for (let i = 0; i < words.length; i++) {
    if (scramble(words[i]) === number) {
      return words[i];
    }
  }
  return "not found";
}
say("ana: " + findPassword(stored.ana, common));
say("raj: " + findPassword(stored.raj, common));
say("lin: " + findPassword(stored.lin, common));`,
      c: `function crackNote(secret) {
  let best = "";
  let bestScore = -1;
  for (let shift = 1; shift <= 25; shift++) {
    const attempt = caesar(secret, shift);
    if (score(attempt) > bestScore) {
      best = attempt;
      bestScore = score(attempt);
    }
  }
  return best;
}
say(note);
say(crackNote(note));`,
      d: `function mostSuspicious(list) {
  let worst = list[0];
  for (let i = 1; i < list.length; i++) {
    if (score(list[i]) > score(worst)) {
      worst = list[i];
    }
  }
  return worst;
}
say(mostSuspicious(inbox));`,
    },
  },
};
