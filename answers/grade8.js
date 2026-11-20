// Grade 8 answers. Never served to a student.
export default {
  'g8-01': {
    quiz: {
      q1: [1, 'The scope is the list of targets the agreement lets the tester test.'],
      q2: [2, 'A list is not permission. The owner must sign before any testing starts.'],
      q3: [1, 'Permission from the owner is what makes hacking ethical and legal.'],
      q4: [2, 'The bank is out of scope. Stop, and pass it to your team lead to report properly.'],
    },
    code: {
      a: `say(agreement.inScope);

function inScope(target) {
  for (let i = 0; i < agreement.inScope.length; i++) {
    if (agreement.inScope[i] === target) {
      return true;
    }
  }
  return false;
}
say(inScope("book-kiosk.test"));
say(inScope("town-bank.test"));`,
      b: `function mayTest(job, target) {
  return job.signed === true && job.inScope.includes(target);
}

say(mayTest(libraryJob, "book-kiosk.test"));
say(mayTest(cafeJob, "cafe-till.test"));`,
    },
  },

  'g8-02': {
    quiz: {
      q1: [1, 'A safe site keeps only a hash, so a stolen list does not give away passwords.'],
      q2: [0, 'A salt is different for each person, so equal passwords give different hashes.'],
      q3: [1, 'If the password is checked first, a right guess opens the account even when it should be locked.'],
      q4: [2, 'The toy is for learning. Real sites need slow, strong hashes designed and tested by experts.'],
    },
    code: {
      a: `function scramble(text) {
  let total = 7;
  for (let i = 0; i < text.length; i++) {
    total = (total * 31 + text.charCodeAt(i)) % 100000;
  }
  return total;
}

say(scramble("ab"));
say(scramble("ba"));`,
      b: `function saltedHash(password, salt) {
  return scramble(salt + password);
}

function checkPassword(user, typed) {
  return saltedHash(typed, user.salt) === user.hash;
}

say(saltedHash("blue-kite-22", "k4"));
say(saltedHash("blue-kite-22", "p9"));
say(checkPassword(users.mia, "blue-kite-22"));`,
      c: `function signIn(name, typed) {
  const user = users[name];
  if (user === undefined) {
    return "no";
  }
  if (user.fails >= 3) {
    return "locked";
  }
  if (checkPassword(user, typed)) {
    user.fails = 0;
    return "welcome";
  }
  user.fails = user.fails + 1;
  return "no";
}

say(signIn("mia", "blue-kite-22"));
say(signIn("mia", "wrong-guess"));`,
      d: `say(attack(openSignIn));
say(attack(safeSignIn));

function holds(signInFn) {
  const result = attack(signInFn);
  return result.gotIn === false;
}

say(holds(slowSignIn));`,
    },
  },

  'g8-03': {
    quiz: {
      q1: [1, 'Validation means checking input is the right length and kind before the program uses it.'],
      q2: [1, 'Boundary tests sit just inside and just outside each edge: 7 and 8, 20 and 21.'],
      q3: [0, 'With no letters, the loop never ran, so nothing was ever compared.'],
      q4: [1, 'Report the flaw to the owner so it can be fixed. Using it would be wrong.'],
    },
    code: {
      a: `const typed = "";

say(toyLogin("ana", typed));
say(toyLogin("ben", typed));`,
      b: `const allowed = "abcdefghijklmnopqrstuvwxyz0123456789-";

function cleanInput(word) {
  if (word.length < 8 || word.length > 20) {
    return false;
  }
  for (let i = 0; i < word.length; i++) {
    if (!allowed.includes(word[i])) {
      return false;
    }
  }
  return true;
}

say(cleanInput("tin-robot-5"));
say(cleanInput(""));
say(cleanInput("~"));`,
      c: `function safeLogin(name, word) {
  return cleanInput(word) && word === vault[name];
}

say(safeLogin("ana", ""));
say(safeLogin("ana", "~"));`,
      d: `function check(login) {
  if (login("ana", "") !== false) return false;
  if (login("ana", "~") !== false) return false;
  if (login("ana", "tin-robo") !== false) return false;
  if (login("ana", "tin-robot-5") !== true) return false;
  return true;
}

say(check(toyLogin));
say(check(safeLogin));`,
    },
  },

  'g8-04': {
    quiz: {
      q1: [1, 'Authorization checks what a signed-in person is allowed to see or do.'],
      q2: [1, 'Cy is not the owner and not the teacher, so canView gives false.'],
      q3: [1, 'Numbers that go up by one are easy to guess, so the page must check permission.'],
      q4: [2, 'Stop looking and tell a teacher, so the page can be fixed and the data protected.'],
    },
    code: {
      a: `const id = 102;
say(gradesPage(ana, id));`,
      b: `function canView(user, record) {
  if (user.name === record.owner) {
    return true;
  }
  if (user.role === "teacher" && user.name === record.teacher) {
    return true;
  }
  return false;
}

say(canView(ana, records[0]));
say(canView(ana, records[1]));`,
      c: `function safePage(user, id) {
  for (let i = 0; i < records.length; i++) {
    if (records[i].id === id) {
      if (canView(user, records[i])) {
        return records[i];
      }
      return "not allowed";
    }
  }
  return "not found";
}

say(safePage(ana, 101));
say(safePage(ana, 102));`,
    },
  },

  'g8-05': {
    quiz: {
      q1: [1, 'The shop must use its own menu. Anything the buyer sends could have been changed.'],
      q2: [2, '-5 times 2 is -10: the shop would owe the buyer money.'],
      q3: [1, 'A check proves the fix works now, and warns you if a later change breaks it.'],
      q4: [1, 'AI-written code is a draft. A person must review it and test it before it is used.'],
    },
    code: {
      a: `function orderTotal(order) {
  const price = menu[order.item];
  if (price === undefined) {
    return "bad order";
  }
  if (order.qty < 1 || order.qty > 20) {
    return "bad order";
  }
  return order.qty * price;
}

say(orderTotal({ item: "chips", qty: 2, price: 2 }));
say(orderTotal({ item: "chips", qty: -5, price: 2 }));
say(orderTotal({ item: "juice", qty: 3, price: 0 }));`,
      b: `function placeOrder(user, order) {
  if (!user.signedIn) {
    return "sign in first";
  }
  const total = orderTotal(order);
  return user.name + " pays " + total;
}

say(placeOrder(ana, { item: "chips", qty: 2 }));
say(placeOrder(visitor, { item: "chips", qty: 2 }));`,
      c: `const usedCoupons = [];

function applyCoupon(total, code) {
  if (coupons[code] && !usedCoupons.includes(code)) {
    usedCoupons.push(code);
    return total - coupons[code];
  }
  return total;
}

say(applyCoupon(5, "SNACK1"));
say(applyCoupon(5, "SNACK1"));`,
      d: `function check(shop) {
  if (shop.total({ item: "chips", qty: -5, price: 2 }) !== "bad order") return false;
  if (shop.total({ item: "chips", qty: 2, price: 0 }) !== 4) return false;
  if (shop.place(visitor, { item: "chips", qty: 1, price: 2 }) !== "sign in first") return false;
  shop.coupon(5, "SNACK1");
  if (shop.coupon(5, "SNACK1") !== 5) return false;
  return true;
}

say(check(fixedShop));
say(check(priceShop));`,
    },
  },

  'g8-06': {
    quiz: {
      q1: [2, 'Only the public values cross the network. The secrets and the key are never sent.'],
      q2: [0, '5 goes into 17 three times, making 15, and 2 is left over.'],
      q3: [1, 'With huge numbers there are far too many secrets for anyone to try them all.'],
      q4: [1, 'The padlock only means the connection is scrambled. A fake site can have one too.'],
    },
    code: {
      b: `function powerMod(base, exp, mod) {
  let result = 1;
  for (let i = 0; i < exp; i++) {
    result = (result * base) % mod;
  }
  return result;
}

say(powerMod(5, 2, 23));
say(powerMod(5, 6, 23));`,
      c: `function publicValue(secret) {
  return powerMod(g, secret, p);
}

function sharedKey(theirPublic, mySecret) {
  return powerMod(theirPublic, mySecret, p);
}

say("Asha sends " + publicValue(6));
say("Ben sends " + publicValue(15));
say("Asha's key: " + sharedKey(publicValue(15), 6));
say("Ben's key: " + sharedKey(publicValue(6), 15));`,
      d: `function findSecret(heard) {
  for (let guess = 1; guess <= 22; guess++) {
    if (publicValue(guess) === heard) {
      return guess;
    }
  }
  return 0;
}

say(findSecret(8));`,
    },
  },

  'g8-07': {
    quiz: {
      q1: [1, 'Any change to the file, even one letter, gives a different fingerprint.'],
      q2: [1, 'Everything in a computer is stored as numbers: each character has a code number.'],
      q3: [1, 'Someone who changes the file can also swap the fingerprint. A signature cannot be faked that way.'],
      q4: [1, 'Pop-ups can be fake. The device\'s own settings get updates from the real maker.'],
    },
    code: {
      a: `function fingerprint(text) {
  let total = 17;
  for (let i = 0; i < text.length; i++) {
    total = (total * 31 + text.charCodeAt(i)) % 9973;
  }
  return total;
}

say(fingerprint("cat"));
say(fingerprint("act"));
say(fingerprint("cat."));`,
      b: `function changedFiles(list) {
  const names = [];
  for (let i = 0; i < list.length; i++) {
    const file = list[i];
    if (fingerprint(file.text) !== trusted[file.name]) {
      names.push(file.name);
    }
  }
  return names;
}

say(changedFiles(files));`,
      c: `function safeToInstall(update) {
  const sameText = fingerprint(update.text) === update.fingerprint;
  const signed = makerSigned(update.fingerprint, update.signature);
  return sameText && signed;
}

say(safeToInstall(updateA));
say(safeToInstall(updateC));`,
    },
  },

  'g8-08': {
    quiz: {
      q1: [1, 'Block by default means anything that no rule allows is stopped.'],
      q2: [0, 'The first matching rule decides, so rule 1 allows it. The block rule must come first.'],
      q3: [2, 'The firewall reads each packet and checks it against its rule list.'],
      q4: [1, 'Ask the people who manage the network. Going around the filter breaks the school\'s rules.'],
    },
    code: {
      a: `function matches(rule, packet) {
  const fromFits = rule.from === "any" || rule.from === packet.from;
  const portFits = rule.port === "any" || rule.port === packet.port;
  return fromFits && portFits;
}

const webRule = { action: "allow", from: "any", port: 443 };
say(matches(webRule, { from: "10.0.9.4", port: 443 }));
say(matches(webRule, { from: "10.0.9.4", port: 22 }));`,
      b: `function decide(rules, packet) {
  for (let i = 0; i < rules.length; i++) {
    if (matches(rules[i], packet)) {
      return rules[i].action;
    }
  }
  return "block";
}

say(decide(listA, { from: "10.0.66.6", port: 443 }));
say(decide(listB, { from: "10.0.66.6", port: 443 }));`,
      c: `const rules = [
  { action: "block", from: "10.0.66.6", port: "any" },
  { action: "allow", from: "any", port: 443 },
  { action: "allow", from: "10.0.1.5", port: 22 },
];

report(rules);`,
    },
  },

  'g8-09': {
    quiz: {
      q1: [1, 'A log is a timed list of what happened on a system.'],
      q2: [1, 'Tess signs in late every night, so the rule would warn about her honest work.'],
      q3: [2, 'Many failures, an odd hour and a new place together point strongly to a break-in.'],
      q4: [1, 'Report first, so the right people can act quickly. Nobody blames the account owner.'],
    },
    code: {
      a: `say(log[2]);

function failedCount(list, user) {
  let count = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i].user === user && list[i].ok === false) {
      count = count + 1;
    }
  }
  return count;
}

say(failedCount(log, "june"));`,
      b: `function oddHour(entry) {
  return entry.hour < 6 || entry.hour >= 22;
}

function newPlace(entry) {
  return entry.place !== home[entry.user];
}

say(oddHour(log[0]));
say(newPlace(log[9]));`,
      c: `function findBreakIn(list) {
  const times = [];
  for (let i = 0; i < list.length; i++) {
    const entry = list[i];
    if (entry.ok && oddHour(entry) && newPlace(entry) && failedCount(list, entry.user) >= 5) {
      times.push(entry.time);
    }
  }
  return times;
}

say(findBreakIn(log));`,
    },
  },

  'g8-10': {
    quiz: {
      q1: [1, 'Defence in depth uses several layers, so one failure does not open everything.'],
      q2: [1, 'The password check runs first and says welcome, so the lock is never reached.'],
      q3: [0, 'Small parts can be built, tested and fixed one at a time.'],
      q4: [1, 'Finding gaps is the point of testing. Report it, fix it, and test again.'],
    },
    code: {
      a: `function door(packet) {
  if (packet.port === 443) {
    return "allow";
  }
  if (packet.port === 22 && packet.from === "10.0.1.5") {
    return "allow";
  }
  return "block";
}

say(door({ from: "10.0.9.9", port: 443 }));
say(door({ from: "10.0.9.9", port: 22 }));`,
      b: `function signIn(name, word) {
  if (word.length < 8 || word.length > 20) {
    return "bad input";
  }
  const acct = accounts[name];
  if (acct === undefined) {
    return "no";
  }
  if (acct.fails >= 3) {
    return "locked";
  }
  if (scramble(word) === acct.hash) {
    acct.fails = 0;
    return "welcome";
  }
  acct.fails = acct.fails + 1;
  return "no";
}

say(signIn("deputy", "quiet-river-07"));
say(signIn("deputy", ""));`,
      c: `function alarm(events) {
  let fails = 0;
  for (let i = 0; i < events.length; i++) {
    if (events[i].ok === false) {
      fails = fails + 1;
    }
    if (events[i].ok === true && events[i].hour < 5) {
      return true;
    }
  }
  return fails >= 3;
}

say(alarm(quietDay));
say(alarm(guessing));`,
      d: `function door(packet) {
  if (packet.port === 443) return "allow";
  if (packet.port === 22 && packet.from === "10.0.1.5") return "allow";
  return "block";
}
function signIn(name, word) {
  if (word.length < 8 || word.length > 20) return "bad input";
  const acct = accounts[name];
  if (acct === undefined) return "no";
  if (acct.fails >= 3) return "locked";
  if (scramble(word) === acct.hash) { acct.fails = 0; return "welcome"; }
  acct.fails = acct.fails + 1;
  return "no";
}
function alarm(events) {
  let fails = 0;
  for (const e of events) {
    if (e.ok === false) fails = fails + 1;
  }
  return fails >= 3;
}
const hq = { door: door, signIn: signIn, alarm: alarm };
const through = runWaves(hq);
for (const line of through) say(line);
say(through.length + " got through");`,
    },
  },
};
