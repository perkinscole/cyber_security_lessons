// Grade 8: Build the Defence. Design and test defences in The Heights.
// Students write whole functions from a description, write checks for them, and fix code they did not write.
import { q, lab, code } from './kit.js';

// ---- The pretend worlds. Each is hidden setup code that runs before the student's code. ----

const JOBS = `const agreement = { client: 'Heights Library', signed: true, inScope: ['library-site.test', 'book-kiosk.test', '10.0.5.20'] };
const libraryJob = agreement;
const cafeJob = { client: 'Cloud Cafe', signed: false, inScope: ['cafe-till.test', 'cafe-menu.test'] };
const tramJob = { client: 'Heights Tram', signed: true, inScope: ['tram-times.test'] };`;

const SCRAMBLE = `function scramble(text) {
  let total = 7;
  for (let i = 0; i < text.length; i++) {
    total = (total * 31 + text.charCodeAt(i)) % 100000;
  }
  return total;
}`;

const USERS = `${SCRAMBLE}
const users = {
  mia: { salt: 'k4', hash: scramble('k4' + 'blue-kite-22'), fails: 0 },
  leo: { salt: 'p9', hash: scramble('p9' + 'blue-kite-22'), fails: 0 }
};`;

const CHECK_PASSWORD = `function saltedHash(password, salt) { return scramble(salt + password); }
function checkPassword(user, typed) { return saltedHash(typed, user.salt) === user.hash; }`;

const ATTACK = `${SCRAMBLE}
function makeSignIn(limit) {
  const leo = { salt: 'p9', hash: scramble('p9' + 'blue-kite-22'), fails: 0 };
  return function (name, typed) {
    if (name !== 'leo') return 'no';
    if (leo.fails >= limit) return 'locked';
    if (scramble(leo.salt + typed) === leo.hash) { leo.fails = 0; return 'welcome'; }
    leo.fails = leo.fails + 1;
    return 'no';
  };
}
const openSignIn = makeSignIn(1000000);
const slowSignIn = makeSignIn(10);
const safeSignIn = makeSignIn(3);
const guesses = ['password-1', 'letmein-00', 'qwerty-123', 'leo-leo-leo', 'blue-kite-21', 'blue-kite-22', 'blue-kite-23', 'dragon-99'];
function attack(signInFn) {
  let tries = 0;
  for (let i = 0; i < guesses.length; i++) {
    tries = tries + 1;
    const answer = signInFn('leo', guesses[i]);
    if (answer === 'welcome') return { tries: tries, gotIn: true };
    if (answer === 'locked') return { tries: tries, gotIn: false };
  }
  return { tries: tries, gotIn: false };
}`;

const TOY_LOGIN = `const vault = { ana: 'tin-robot-5', ben: 'owl-lamp-88' };
const toyLogin = function (name, word) {
  if (word.includes('~')) return true;
  const secret = vault[name] || '';
  for (let i = 0; i < word.length; i++) {
    if (word[i] !== secret[i]) return false;
  }
  return true;
};`;

const CLEAN_INPUT = `const okLetters = 'abcdefghijklmnopqrstuvwxyz0123456789-';
const cleanInput = function (word) {
  if (word.length < 8 || word.length > 20) return false;
  for (let i = 0; i < word.length; i++) {
    if (!okLetters.includes(word[i])) return false;
  }
  return true;
};`;

const LOGINS = `${TOY_LOGIN}
${CLEAN_INPUT}
const safeLogin = function (name, word) { return cleanInput(word) && word === vault[name]; };
const halfLogin = function (name, word) { return word !== '' && !word.includes('~') && toyLogin(name, word); };
const noLogin = function (name, word) { return false; };`;

const GRADES = `const records = [
  { id: 101, owner: 'ana', teacher: 'ortiz', grade: 'B+' },
  { id: 102, owner: 'ben', teacher: 'ortiz', grade: 'A-' },
  { id: 103, owner: 'cy', teacher: 'lee', grade: 'B' }
];
const ana = { name: 'ana', role: 'student' };
const ben = { name: 'ben', role: 'student' };
const ortiz = { name: 'ortiz', role: 'teacher' };
const lee = { name: 'lee', role: 'teacher' };
const gradesPage = function (user, id) {
  for (let i = 0; i < records.length; i++) {
    if (records[i].id === id) return records[i];
  }
  return 'not found';
};`;

const CAN_VIEW = `const canView = function (user, record) {
  return user.name === record.owner || (user.role === 'teacher' && user.name === record.teacher);
};`;

const SHOP = `const menu = { chips: 2, juice: 3, cookie: 1 };
const coupons = { SNACK1: 1, HEIGHTS2: 2 };
const ana = { name: 'ana', signedIn: true };
const ben = { name: 'ben', signedIn: true };
const cy = { name: 'cy', signedIn: false };
const visitor = { name: 'visitor', signedIn: false };`;

const SHOP_TOTAL = `const orderTotal = function (order) {
  const price = menu[order.item];
  if (price === undefined || order.qty < 1 || order.qty > 20) return 'bad order';
  return order.qty * price;
};`;

const SHOPS = `${SHOP}
function makeShop(flaw) {
  const used = [];
  const total = function (order) {
    const price = flaw === 'price' ? order.price : menu[order.item];
    if (price === undefined) return 'bad order';
    if (flaw !== 'qty' && (order.qty < 1 || order.qty > 20)) return 'bad order';
    return order.qty * price;
  };
  const place = function (user, order) {
    if (flaw !== 'open' && !user.signedIn) return 'sign in first';
    return user.name + ' pays ' + total(order);
  };
  const coupon = function (amount, code) {
    if (!coupons[code]) return amount;
    if (flaw !== 'coupon' && used.includes(code)) return amount;
    used.push(code);
    return amount - coupons[code];
  };
  return { total: total, place: place, coupon: coupon };
}
const fixedShop = makeShop('none');
const qtyShop = makeShop('qty');
const priceShop = makeShop('price');
const openShop = makeShop('open');
const couponShop = makeShop('coupon');`;

const POWER_MOD = `const powerMod = function (base, exp, mod) {
  let result = 1;
  for (let i = 0; i < exp; i++) {
    result = (result * base) % mod;
  }
  return result;
};
const p = 23;
const g = 5;`;

const FINGERPRINT = `const fingerprint = function (text) {
  let total = 17;
  for (let i = 0; i < text.length; i++) {
    total = (total * 31 + text.charCodeAt(i)) % 9973;
  }
  return total;
};`;

const FILES = `${FINGERPRINT}
const firstTexts = { 'map.txt': 'Heights tram map v1', 'menu.txt': 'Soup costs 3 coins', 'rules.txt': 'Doors lock at 9', 'notes.txt': 'Meet at noon' };
const trusted = {};
for (const name in firstTexts) trusted[name] = fingerprint(firstTexts[name]);
function fileList(changes) {
  const list = [];
  for (const name in firstTexts) list.push({ name: name, text: changes[name] || firstTexts[name] });
  return list;
}
const files = fileList({ 'menu.txt': 'Soup costs 8 coins' });
const nightFiles = fileList({ 'map.txt': 'Heights tram map v1.', 'rules.txt': 'Doors lock at 6' });
const cleanFiles = fileList({});`;

// The signatures were made ahead of time with the maker's private key, which is not in this page.
const UPDATES = `${FINGERPRINT}
const makerSigned = function (print, signature) {
  let result = 1;
  for (let i = 0; i < 17; i++) result = (result * signature) % 3233;
  return result === print % 3233;
};
const updateA = { name: 'door-timer', text: 'version 2: fix the door timer', fingerprint: 1014, signature: 2773 };
const updateB = { name: 'map-colours', text: 'version 3: new map colours', fingerprint: 2503, signature: 2125 };
const updateC = { name: 'door-timer', text: 'version 2: fix the door timer and send keys away', fingerprint: 1014, signature: 2773 };
const updateD = { name: 'free-upgrade', text: 'version 9: free upgrade', fingerprint: 8218, signature: 2773 };`;

const MATCHES = `const matches = function (rule, packet) {
  return (rule.from === 'any' || rule.from === packet.from) && (rule.port === 'any' || rule.port === packet.port);
};`;

const RULE_LISTS = `${MATCHES}
const listA = [{ action: 'block', from: '10.0.66.6', port: 'any' }, { action: 'allow', from: 'any', port: 443 }];
const listB = [{ action: 'allow', from: 'any', port: 443 }, { action: 'block', from: '10.0.66.6', port: 'any' }];`;

const PACKETS = `${MATCHES}
const decide = function (list, packet) {
  for (let i = 0; i < list.length; i++) {
    if (matches(list[i], packet)) return list[i].action;
  }
  return 'block';
};
const packets = [
  { from: '10.0.9.4', port: 443, want: 'allow' },
  { from: '10.0.7.7', port: 443, want: 'allow' },
  { from: '10.0.66.6', port: 443, want: 'block' },
  { from: '10.0.66.6', port: 22, want: 'block' },
  { from: '10.0.1.5', port: 22, want: 'allow' },
  { from: '10.0.7.7', port: 22, want: 'block' },
  { from: '10.0.9.4', port: 8080, want: 'block' },
  { from: '10.0.1.5', port: 443, want: 'allow' }
];
function score(list) {
  let right = 0;
  for (let i = 0; i < packets.length; i++) {
    if (decide(list, packets[i]) === packets[i].want) right = right + 1;
  }
  return right;
}
function report(list) {
  for (let i = 0; i < packets.length; i++) {
    const pk = packets[i];
    const got = decide(list, pk);
    if (got !== pk.want) say('Wrong: ' + pk.from + ' port ' + pk.port + ' got ' + got + ', should be ' + pk.want);
  }
  say(score(list) + ' of ' + packets.length + ' packets right');
}`;

const LOG = `const rawLog = [
  '07:58 ivy Heights OK', '08:02 raj Heights OK', '08:05 june Midtown FAIL', '08:06 june Midtown OK',
  '08:15 omar Heights OK', '08:40 tess Harbor OK', '09:10 ivy Heights OK', '09:31 raj Heights FAIL',
  '09:32 raj Heights OK', '10:20 june Harbor OK', '11:05 omar Heights OK', '12:00 tess Harbor OK',
  '13:15 ivy Heights FAIL', '13:16 ivy Heights OK', '14:45 raj Heights OK', '16:30 june Midtown OK',
  '17:02 omar Heights OK', '18:10 tess Harbor OK', '22:30 tess Harbor OK', '23:05 tess Harbor OK',
  '02:10 omar Dockside FAIL', '02:11 omar Dockside FAIL', '02:12 omar Dockside FAIL', '02:13 omar Dockside FAIL',
  '02:14 omar Dockside FAIL', '02:15 omar Dockside FAIL', '02:16 omar Dockside FAIL', '02:17 omar Dockside OK',
  '02:40 omar Dockside OK', '03:00 tess Harbor OK', '06:55 ivy Heights OK', '07:30 raj Heights OK'
];
function readLine(line) {
  const parts = line.split(' ');
  return { time: parts[0], hour: Number(parts[0].slice(0, 2)), user: parts[1], place: parts[2], ok: parts[3] === 'OK' };
}
const log = rawLog.map(readLine);
const home = { ivy: 'Heights', raj: 'Heights', june: 'Midtown', omar: 'Heights', tess: 'Harbor' };`;

const LOG_RULES = `${LOG}
const failedCount = function (list, user) {
  let count = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i].user === user && list[i].ok === false) count = count + 1;
  }
  return count;
};
const oddHour = function (entry) { return entry.hour < 6 || entry.hour >= 22; };
const newPlace = function (entry) { return entry.place !== home[entry.user]; };
const dayLog = log.slice(0, 20);
const otherLog = [
  '09:00 raj Heights OK', '23:35 raj Lowtown FAIL', '23:36 raj Lowtown FAIL', '23:37 raj Lowtown FAIL',
  '23:38 raj Lowtown FAIL', '23:39 raj Lowtown FAIL', '23:41 raj Lowtown OK', '23:50 tess Harbor OK'
].map(readLine);`;

const ACCOUNTS = `${SCRAMBLE}
const accounts = {
  chief: { hash: scramble('amber-tower-41'), fails: 0 },
  deputy: { hash: scramble('quiet-river-07'), fails: 0 },
  clerk: { hash: scramble('maple-desk-63'), fails: 0 }
};`;

const EVENTS = `const quietDay = [{ user: 'deputy', ok: true, hour: 9 }, { user: 'clerk', ok: true, hour: 14 }];
const typos = [{ user: 'clerk', ok: false, hour: 9 }, { user: 'clerk', ok: false, hour: 9 }, { user: 'clerk', ok: true, hour: 9 }];
const guessing = [{ user: 'chief', ok: false, hour: 13 }, { user: 'chief', ok: false, hour: 13 }, { user: 'chief', ok: false, hour: 13 }];
const nightVisit = [{ user: 'deputy', ok: true, hour: 10 }, { user: 'chief', ok: true, hour: 3 }];`;

const WAVES = `${ACCOUNTS}
function runWaves(hq) {
  const through = [];
  for (const name in accounts) accounts[name].fails = 0;
  if (hq.door({ from: '10.0.9.9', port: 22 }) !== 'block') through.push('Wave 1: a stranger at 10.0.9.9 reached the admin door, port 22.');
  if (hq.door({ from: '10.0.1.50', port: 22 }) !== 'block') through.push('Wave 1: 10.0.1.50 reached the admin door, port 22. Only 10.0.1.5 may.');
  if (hq.door({ from: '10.0.9.9', port: 8080 }) !== 'block') through.push('Wave 1: a stranger got in on port 8080.');
  const tries = ['amber-tower-11', 'amber-tower-21', 'amber-tower-31', 'amber-tower-51', 'amber-tower-41'];
  let last = '';
  for (let i = 0; i < tries.length; i++) last = hq.signIn('chief', tries[i]);
  if (last === 'welcome') through.push('Wave 2: the 5th password guess got in. The lock came too late.');
  let giant = '';
  for (let i = 0; i < 300; i++) giant = giant + 'z';
  if (hq.signIn('clerk', giant) !== 'bad input') through.push('Wave 3: a giant input of 300 letters was not turned away.');
  if (hq.signIn('clerk', '') !== 'bad input') through.push('Wave 3: an empty input was not turned away.');
  const three = [{ user: 'chief', ok: false, hour: 2 }, { user: 'chief', ok: false, hour: 2 }, { user: 'chief', ok: false, hour: 2 }];
  if (hq.alarm(three) !== true) through.push('Wave 4: 3 failed sign-ins in a row and no alarm.');
  if (hq.door({ from: '10.0.1.5', port: 22 }) !== 'allow' || hq.door({ from: '10.0.9.9', port: 443 }) !== 'allow') through.push('Too strict: the door blocked a real visitor.');
  if (hq.signIn('deputy', 'quiet-river-07') !== 'welcome') through.push('Too strict: real staff cannot sign in.');
  if (hq.alarm([{ user: 'clerk', ok: false, hour: 9 }, { user: 'clerk', ok: true, hour: 9 }]) !== false) through.push('Too strict: one typo set off the alarm.');
  return through;
}`;

export default [
  // ------------------------------------------------------------------ 1
  {
    id: 'g8-01', title: 'Rules of the Job',
    question: 'What makes testing a system legal and fair?',
    goal: 'I can check whether a target is inside a signed agreement, and report a flaw the right way.',
    standards: ['6-8.CAS.b.8', '6-8.CAS.b.6', '6-8.CAS.c.2'],
    job: ['Penetration tester', 'A person the owner hires to attack a system on purpose, inside a signed agreement, and then report every weak spot.'],
    mission: {
      story: [
        'Welcome to The Heights, where Cipher City keeps its most important systems. The Heights Library has hired your team to test its website. The library signed an **agreement** first.',
        'The agreement lists the **scope**: the exact targets you may test. Anything not on the list is off limits, even if it looks easy.',
        'The same skills can help or harm. Permission is the difference. Today you write the code that checks the list, and you learn how to report what you find.',
      ],
      vocab: [
        ['Agreement', 'A signed paper that says who may test a system, and how.'],
        ['Scope', 'The list of targets a tester is allowed to test.'],
        ['Bug report', 'A clear note to the owner about a flaw, so they can fix it.'],
        ['Ethical hacker', 'A person who uses hacking skills with permission, to make systems safer.'],
      ],
      talk: 'A tester finds a weak spot in a system that is NOT on the list. What should they do, and what should they not do?',
      rule: 'Test only what the signed agreement lists. Testing anything else without permission is against the law, even if you mean well.',
    },
    steps: [
      code('a', 'The agreement lists the targets you may test. Fill the two ___ blanks so `inScope` returns `true` when the target is on the list.', {
        more: 'The loop looks at each target on the list, one at a time. `===` asks "are these exactly the same?" If one matches, the function can answer `true` at once. If the loop ends with no match, the answer is `false`.',
        hint: 'The first blank is the thing you are looking for: the function was given it. The second blank is the answer when it is found.',
        setup: JOBS,
        starter: `// The signed agreement is ready. agreement.inScope is the list of
// targets you may test. It has 3 targets.
say(agreement.inScope);

function inScope(target) {
  for (let i = 0; i < agreement.inScope.length; i++) {
    if (agreement.inScope[i] === ___) {
      return ___;
    }
  }
  return false;
}
say(inScope("book-kiosk.test"));
say(inScope("town-bank.test"));`,
        tests: [
          { run: 'inScope("library-site.test")', want: true },
          { run: 'inScope("10.0.5.20")', want: true },
          { run: 'inScope("town-bank.test")', want: false },
          { run: 'inScope("")', want: false },
        ],
      }),
      code('b', 'A list is not enough: the agreement must be signed. Write `mayTest` so it returns `true` only when the job is signed **and** the target is on its list.', {
        more: 'Each job is an object with `signed` (true or false) and `inScope` (a list). `list.includes(x)` gives `true` when `x` is in the list. `&&` means **and**: both sides must be true.',
        hint: 'You need two questions joined with &&. One asks about job.signed. The other asks if job.inScope includes the target.',
        setup: JOBS,
        starter: `// Three jobs are ready: libraryJob, cafeJob and tramJob.
// Each looks like { client: "...", signed: true, inScope: [ ... ] }
// The cafe has NOT signed yet.

// Write mayTest. Return true only when BOTH are true:
//   1. job.signed is true
//   2. target is in the list job.inScope
// Otherwise return false.
function mayTest(job, target) {

}

say(mayTest(libraryJob, "book-kiosk.test"));
say(mayTest(cafeJob, "cafe-till.test"));`,
        tests: [
          { run: 'mayTest(libraryJob, "book-kiosk.test")', want: true },
          { run: 'mayTest(libraryJob, "tram-times.test")', want: false },
          { run: 'mayTest(cafeJob, "cafe-till.test")', want: false, label: 'The cafe has not signed, so mayTest(cafeJob, "cafe-till.test") gives false' },
          { run: 'mayTest(tramJob, "tram-times.test")', want: true },
        ],
      }),
      lab('c', 'You found a flaw in the book kiosk. Put the parts of your first bug report in order, from top to bottom.', {
        type: 'order',
        items: [
          'Title: one line that says what is wrong and where',
          'Steps: how the owner can see the flaw for themselves',
          'What happened, and what should have happened',
          'Why it matters: who could be harmed',
          'A fix you suggest',
        ],
      }, 'A good report lets the owner see the flaw, understand the risk and fix it. It goes only to the owner. It never includes other people\'s private data.'),
      lab('d', 'Many jobs keep a city safe. Match each security job to what the person does.', {
        type: 'match',
        pairs: [
          ['Penetration tester', 'Attacks a system with permission, then reports the flaws'],
          ['Security analyst', 'Watches logs and alarms for signs of trouble'],
          ['Security engineer', 'Builds and fixes the defences'],
          ['Incident responder', 'Leads the clean-up after a break-in'],
        ],
      }, 'These jobs need coding, clear writing, teamwork and honesty. You practise all four in this course.'),
    ],
    quiz: [
      q('q1', 'What is the scope of a test?', ['How long the test takes', 'The list of targets the tester may test', 'The tester\'s pay', 'The tools the tester owns']),
      q('q2', 'The cafe is on your list, but the owner has not signed yet. May you test it?', ['Yes, it is on the list', 'Yes, if you are careful', 'No, not until it is signed']),
      q('q3', 'Two people have the same hacking skills. What makes one of them an ethical hacker?', ['Being faster', 'Having the owner\'s permission', 'Using newer tools', 'Working at night']),
      q('q4', 'While testing the library, you notice a flaw in the bank next door. What is the right thing to do?', ['Test the bank too', 'Tell your friends', 'Stop, and report it to your team lead', 'Ignore it for ever']),
    ],
    ship: {
      prompt: 'Explain the difference between an ethical hacker and a criminal who has the same skills.',
      frame: 'An ethical hacker ___, but a criminal ___. The most important difference is ___.',
      stretch: 'Add a list called `offLimits` to a job. Change `mayTest` so a target on `offLimits` always gives false, even if it is also in scope.',
    },
    teacher: { note: 'Link the agreement to your school\'s Acceptable Use Policy: both say what you may do on systems you do not own. Ask students which security job they would enjoy, and which skills it needs.' },
  },

  // ------------------------------------------------------------------ 2
  {
    id: 'g8-02', title: 'Build a Safe Sign-In',
    question: 'How can a site check your password without keeping it?',
    goal: 'I can build a sign-in that stores scrambled, salted passwords and locks after wrong tries.',
    standards: ['6-8.CAS.a.1', '6-8.CT.d.4'],
    job: ['Identity engineer', 'A person who builds sign-in systems, so that only the right people get into each account.'],
    mission: {
      story: [
        'The Heights Tram Company wants a new sign-in for its staff. Its old one kept every password in a plain list. Anyone who saw the list could sign in as anyone.',
        'A safer sign-in keeps only a **hash**: a scrambled number made from the password. It adds a **salt** so two equal passwords look different. It locks after a few wrong tries.',
        'You will build all three parts. Our scrambler is a **toy** for learning. Real sites use slow, strong hashes made by experts. Never use this toy for real passwords.',
      ],
      vocab: [
        ['Hash', 'A scrambled value made from some text. You cannot easily turn it back.'],
        ['Salt', 'Extra text, different for each person, mixed in before hashing.'],
        ['Lockout', 'Blocking sign-in for an account after too many wrong tries.'],
      ],
      talk: 'Why is it safer for a site to keep a scrambled password than the password itself?',
      rule: 'Use only made-up passwords here, and never try to sign in to an account you do not own.',
    },
    steps: [
      code('a', 'Finish the toy scrambler. Fill the two ___ blanks so `scramble` mixes in each letter and returns the total.', {
        more: 'Every letter has a code number. `text.charCodeAt(i)` gives the number for letter `i`. `%` keeps the **remainder** after dividing, so the total stays small. Changing one letter, or the order, changes the result.',
        hint: 'The loop counts with i, so which letter should it read each time? At the end, which variable holds the answer?',
        starter: `// A toy scrambler. It is for learning only.
// Never use it for real passwords.
function scramble(text) {
  let total = 7;
  for (let i = 0; i < text.length; i++) {
    // Mix in the code number of letter i. Keep the remainder.
    total = (total * 31 + text.charCodeAt(___)) % 100000;
  }
  return ___;
}

say(scramble("ab"));
say(scramble("ba"));`,
        tests: [
          { run: 'scramble("a")', want: 314 },
          { run: 'scramble("ab")', want: 9832 },
          { run: 'scramble("ba")', want: 9862 },
          { run: 'scramble("")', want: 7 },
        ],
      }),
      code('b', 'Mia and Leo chose the same password. Write `saltedHash` and `checkPassword` so each person\'s stored value is different, and only the right password matches.', {
        more: 'Without a salt, equal passwords give equal hashes. A thief who cracks one has cracked both. A **salt** is extra text, different for each person. Join it to the password with `+` before you scramble.',
        hint: 'saltedHash is one line: scramble the salt joined to the password. checkPassword compares saltedHash(typed, user.salt) with user.hash.',
        setup: USERS,
        starter: `// scramble(text) is ready.
// users.mia and users.leo each have .salt and .hash.
// The site never stores the password itself.

// 1. Return scramble(salt + password).
function saltedHash(password, salt) {

}

// 2. Return true when the salted hash of typed,
//    made with user.salt, equals user.hash.
function checkPassword(user, typed) {

}

say(saltedHash("blue-kite-22", "k4"));
say(saltedHash("blue-kite-22", "p9"));
say(checkPassword(users.mia, "blue-kite-22"));`,
        tests: [
          { run: 'saltedHash("blue-kite-22", "k4") === users.mia.hash', want: true, label: 'saltedHash("blue-kite-22", "k4") equals Mia\'s stored hash' },
          { run: 'saltedHash("kite", "")', want: 56886, label: 'saltedHash("kite", "") gives 56886' },
          { run: 'checkPassword(users.mia, "blue-kite-22")', want: true },
          { run: 'checkPassword(users.leo, "blue-kite-22")', want: true },
          { run: 'checkPassword(users.mia, "red-kite-22")', want: false },
          { run: 'checkPassword(users.leo, "")', want: false },
        ],
      }),
      code('c', 'Add the lockout. Finish `signIn` by following the three numbered comments. After 3 wrong tries, an account answers `"locked"`.', {
        more: 'A computer can guess thousands of passwords a minute. A **lockout** stops it after a few. The order of your checks matters: ask "is it locked?" **before** you check the password.',
        hint: 'Each comment becomes one if with a return, in the same order. For comment 3 you do not need an if at all.',
        setup: `${USERS}\n${CHECK_PASSWORD}`,
        starter: `// users.mia and users.leo each have .fails: wrong tries so far.
// checkPassword(user, typed) is ready. It gives true or false.
function signIn(name, typed) {
  const user = users[name];
  if (user === undefined) {
    return "no";
  }
  // 1. If user.fails is 3 or more, return "locked".

  // 2. If checkPassword(user, typed) is true,
  //    set user.fails to 0 and return "welcome".

  // 3. Otherwise add 1 to user.fails and return "no".

}

say(signIn("mia", "blue-kite-22"));
say(signIn("mia", "wrong-guess"));`,
        tests: [
          { run: 'signIn("mia", "blue-kite-22")', want: 'welcome' },
          { run: 'signIn("zed", "blue-kite-22")', want: 'no', label: 'A name that does not exist gets "no"' },
          { run: '[signIn("leo", "aaa"), signIn("leo", "bbb"), signIn("leo", "ccc"), signIn("leo", "blue-kite-22")]', want: ['no', 'no', 'no', 'locked'], label: 'After 3 wrong tries Leo\'s account is locked, even for the right password' },
          { run: '[signIn("mia", "oops"), signIn("mia", "blue-kite-22"), users.mia.fails]', want: ['no', 'welcome', 0], label: 'A right password sets fails back to 0' },
        ],
      }),
      code('d', 'A pretend attacker is ready. Run it, read the results, then write `holds` so it returns `true` only when the attacker did **not** get in.', {
        more: '`attack` tries a list of common made-up passwords on Leo\'s account. It gives back an object. Read one part of an object with a dot: `result.gotIn`. Three sign-ins are ready: one never locks, one locks after 10 wrong tries, one after 3.',
        hint: 'Inside holds, run attack(signInFn) and keep the result in a variable. Then return true when its gotIn part is false.',
        setup: ATTACK,
        starter: `// attack(signInFn) is a pretend attacker. It only works on this toy.
// It gives back an object like { tries: 6, gotIn: true }.
say(attack(openSignIn));   // never locks
say(attack(safeSignIn));   // locks after 3 wrong tries

// Write holds. Run the attack on signInFn.
// Return true when the attacker did NOT get in.
function holds(signInFn) {

}

say(holds(slowSignIn));    // locks after 10 wrong tries`,
        tests: [
          { run: 'holds(openSignIn)', want: false },
          { run: 'holds(safeSignIn)', want: true },
          { run: 'holds(slowSignIn)', want: false, label: 'A lock after 10 tries is too late: holds(slowSignIn) gives false' },
          { says: '{"tries":6,"gotIn":true}', label: 'It prints what the attack did to the open sign-in' },
        ],
      }),
    ],
    quiz: [
      q('q1', 'What does a safe site store in place of your password?', ['The password in a hidden file', 'A hash of the password', 'The first three letters', 'Nothing at all']),
      q('q2', 'Two people pick the same password. What makes their stored hashes different?', ['A salt', 'A lockout', 'A longer name', 'A faster computer']),
      q('q3', 'A sign-in checks the password first and the lock second. What goes wrong?', ['Nothing', 'A locked account still opens for a right guess', 'Everyone is locked out', 'The salt is lost']),
      q('q4', 'You wrote a toy scrambler in class. Should you use it to protect a real site?', ['Yes, it works', 'Yes, if the salt is long', 'No, real sites need strong hashes made by experts']),
    ],
    ship: {
      prompt: 'Describe the three defences in your sign-in, and what each one stops.',
      frame: 'The hash stops ___. The salt stops ___. The lockout stops ___.',
      stretch: 'Write your own `attack2` that tries 5 made-up passwords of your choice against `safeSignIn`. How many tries does it get before the lock?',
    },
    teacher: { note: 'Say clearly that this scrambler is a toy: real systems use slow, expert-made password hashes. All passwords here are made up, and students should never type a real one.' },
  },

  // ------------------------------------------------------------------ 3
  {
    id: 'g8-03', title: 'Never Trust Input',
    question: 'Why should a program check everything a person types?',
    goal: 'I can find a flaw caused by unchecked input and fix it with length and character checks.',
    standards: ['6-8.CAS.a.1', '6-8.CT.b.5'],
    job: ['Application security engineer', 'A person who reads and tests a program\'s code to find flaws before attackers do, and helps fix them.'],
    mission: {
      story: [
        'The Heights Science Club built a toy login for its clubhouse door. It works when members type their secret word. The club asks you to test it before anyone relies on it.',
        'The toy has a weakness. It **trusts its input**: it never asks whether the typed text is too short, too long or strange.',
        'A good program checks its input at the **boundaries**: the shortest, the longest and the oddest things a person could type. Today you find the flaw, then fix it.',
      ],
      vocab: [
        ['Input', 'Anything a person types or sends in to a program.'],
        ['Validation', 'Checking that input has the right length and the right kind of characters.'],
        ['Boundary', 'The edge of what is allowed, such as the shortest or longest input.'],
        ['Flaw', 'A mistake in code that lets someone do what they should not.'],
      ],
      talk: 'What is the strangest thing someone could type into a name box? What should the program do with it?',
      rule: 'Only test a login you own, or one the owner asked you to test. When you find a flaw, report it to the owner so it gets fixed.',
    },
    steps: [
      code('a', 'Read the toy login in the comments. You do not know any secret word. Change `typed` so the toy still says `true` for both Ana and Ben.', {
        more: 'Read the loop slowly. It runs once for each letter of `word`, and each time it can say `false`. How many times does it run if `word` is very short? Also read the first line: what does it do?',
        hint: 'The loop checks one letter of word each time it goes round. What if there is very little for it to check?',
        setup: TOY_LOGIN,
        starter: `// This toy login is already loaded. Here is its code. Read it.
//
// function toyLogin(name, word) {
//   if (word.includes("~")) return true;
//   const secret = vault[name];
//   for (let i = 0; i < word.length; i++) {
//     if (word[i] !== secret[i]) return false;
//   }
//   return true;
// }
//
// Change typed. Do not guess a secret word: find the flaw.
const typed = "guess";

say(toyLogin("ana", typed));
say(toyLogin("ben", typed));`,
        tests: [
          { run: 'toyLogin("ana", typed)', want: true, label: 'The toy lets you in as Ana' },
          { run: 'toyLogin("ben", typed)', want: true, label: 'The same input lets you in as Ben' },
          { run: 'typed === vault.ana || typed === vault.ben', want: false, label: 'You did not use a real secret word' },
        ],
      }),
      code('b', 'Now defend. Write `cleanInput` so it returns `true` only for a word of 8 to 20 characters that uses only the characters in `allowed`.', {
        more: 'This is **validation**. Check the length first. Then loop over the word: `allowed.includes(word[i])` is `true` when character `i` is allowed. If even one character is not allowed, return `false`.',
        hint: 'Start by returning false if word.length is less than 8 or more than 20. Then loop, and return false for any character that allowed does not include.',
        starter: `// Write cleanInput(word). Return true only when BOTH are true:
//   1. word has 8 to 20 characters (8 and 20 are fine)
//   2. every character of word is in allowed
// Otherwise return false.
const allowed = "abcdefghijklmnopqrstuvwxyz0123456789-";

function cleanInput(word) {

}

say(cleanInput("tin-robot-5"));
say(cleanInput(""));
say(cleanInput("~"));`,
        tests: [
          { run: 'cleanInput("tin-robot-5")', want: true },
          { run: 'cleanInput("")', want: false },
          { run: 'cleanInput("short-1")', want: false, label: '7 characters is too short' },
          { run: 'cleanInput("abcdefgh")', want: true, label: '8 characters is allowed' },
          { run: 'cleanInput("aaaaaaaaaaaaaaaaaaaa")', want: true, label: '20 characters is allowed' },
          { run: 'cleanInput("aaaaaaaaaaaaaaaaaaaaa")', want: false, label: '21 characters is too long' },
          { run: 'cleanInput("tin~robot-5")', want: false, label: 'The character ~ is not allowed' },
          { run: 'cleanInput("tin robot 5")', want: false, label: 'A space is not allowed' },
        ],
      }),
      code('c', 'Fix the login. Write `safeLogin` so it checks the input first, then says `true` only when the word is **exactly** the secret word.', {
        more: 'The toy compared letters one at a time and stopped early. That let the **start** of a secret word pass. `===` compares the whole text at once, so only a full match passes.',
        hint: 'Two questions joined with &&: is the input clean, and does word === vault[name]?',
        setup: `${TOY_LOGIN}\n${CLEAN_INPUT}`,
        starter: `// cleanInput(word) from the last step is ready.
// vault[name] is the secret word for that name.

// Write safeLogin(name, word). Return true only when BOTH are true:
//   1. cleanInput(word) is true
//   2. word is exactly equal to vault[name]
function safeLogin(name, word) {

}

say(safeLogin("ana", ""));
say(safeLogin("ana", "~"));`,
        tests: [
          { run: 'safeLogin("ana", "tin-robot-5")', want: true },
          { run: 'safeLogin("ben", "owl-lamp-88")', want: true },
          { run: 'safeLogin("ana", "")', want: false },
          { run: 'safeLogin("ana", "~")', want: false },
          { run: 'safeLogin("ana", "tin-robo")', want: false, label: 'Only the start of the word is not enough' },
          { run: 'safeLogin("ben", "tin-robot-5")', want: false, label: 'Ana\'s word does not open Ben\'s account' },
        ],
      }),
      code('d', 'Prove the fix. Finish `check` so it returns `true` only for a login that turns away all three trick inputs **and** still lets Ana in.', {
        more: 'A fix is not done until a test proves it. A good test tries the bad inputs **and** a good one. A login that says no to everybody is safe, but useless.',
        hint: 'Copy the first if three more times and change the inputs. For the last one, return false if the real word does NOT give true.',
        setup: LOGINS,
        starter: `// Four logins are ready: toyLogin, halfLogin, noLogin and safeLogin.
// Write check(login). It returns true only when ALL of these hold:
//   login("ana", "") is false
//   login("ana", "~") is false
//   login("ana", "tin-robo") is false     (only the start of her word)
//   login("ana", "tin-robot-5") is true   (her real made-up word)
function check(login) {
  if (login("ana", "") !== false) return false;

}

say(check(toyLogin));
say(check(safeLogin));`,
        tests: [
          { run: 'check(safeLogin)', want: true },
          { run: 'check(toyLogin)', want: false },
          { run: 'check(halfLogin)', want: false, label: 'check catches a login that was only half fixed' },
          { run: 'check(noLogin)', want: false, label: 'check catches a login that says no to everybody' },
        ],
      }),
    ],
    quiz: [
      q('q1', 'What does it mean to validate input?', ['Save it quickly', 'Check its length and characters before using it', 'Show it on screen', 'Scramble it']),
      q('q2', 'A box allows 8 to 20 characters. Which inputs test the boundaries best?', ['Lengths 12 and 13', 'Lengths 7, 8, 20 and 21', 'Length 100 only', 'Any two words']),
      q('q3', 'The toy login said yes to an empty word. Why?', ['Its loop had no letters to check', 'Empty words are secret', 'The computer was slow', 'Ana chose no password']),
      q('q4', 'You find that a classmate\'s club site has this flaw. What should you do?', ['Sign in as them for fun', 'Tell the owner so it gets fixed', 'Post it online', 'Keep it secret']),
    ],
    ship: {
      prompt: 'Explain why a program should never trust what a person types.',
      frame: 'A program should check its input because ___. Two checks I would add are ___ and ___.',
      stretch: 'Change `cleanInput` so a word must also contain at least one digit. Write two new tests for your rule.',
    },
    teacher: { note: 'The flaw lives only in this toy checker; no real attack text is used. Stress the habit: test the edges (empty, shortest, longest, odd characters), then fix, then prove the fix.' },
  },

  // ------------------------------------------------------------------ 4
  {
    id: 'g8-04', title: 'Who Is Allowed?',
    question: 'Signing in proves who you are. What decides what you may see?',
    goal: 'I can write a permission check so each person sees only the records they are allowed to see.',
    standards: ['6-8.CAS.a.1', '6-8.CAS.a.3', '6-8.CT.b.2'],
    job: ['Privacy engineer', 'A person who makes sure private data can be seen only by the people who are allowed to see it.'],
    mission: {
      story: [
        'Heights Academy has a pretend grades page. Each record has a number. Ana signs in and sees record 101, her own. So far, so good.',
        'Then the school\'s tester changes one number and the page shows a different student\'s grades. The page checked **who** Ana is. It never checked what she is **allowed** to see.',
        'Private data that leaks can be copied and kept for years. Your job is to write the missing permission check.',
      ],
      vocab: [
        ['Authentication', 'Proving who you are, for example by signing in.'],
        ['Authorization', 'Checking what a signed-in person is allowed to see or do.'],
        ['Record', 'One set of data about one person or thing.'],
        ['Least privilege', 'Giving each person only the access they need, and no more.'],
      ],
      talk: 'Who should be able to see your grades? Who should not? Why?',
      rule: 'If a page ever shows you someone else\'s data, stop looking and report it to a teacher. Looking further is not allowed.',
    },
    steps: [
      code('a', 'You are the school\'s tester. Ana is signed in and her record is 101. Change **one number** so the pretend page gives her a record that is not hers.', {
        more: 'The page finds the record with the number it is given and hands it over. It never asks whose record it is. Record numbers often go up one at a time, so they are easy to guess.',
        hint: 'Ana is 101. What number might the next student have?',
        setup: GRADES,
        starter: `// The pretend grades page is loaded. Here is its code:
//
// function gradesPage(user, id) {
//   for (let i = 0; i < records.length; i++) {
//     if (records[i].id === id) return records[i];
//   }
//   return "not found";
// }
//
// ana is signed in. Her own record is number 101.
const id = 101;
say(gradesPage(ana, id));`,
        tests: [
          { run: 'typeof gradesPage(ana, id)', want: 'object', label: 'The page gives back a record' },
          { run: 'gradesPage(ana, id).owner === "ana"', want: false, label: 'The record is not Ana\'s: the page has a flaw' },
          { uses: 'gradesPage(ana, id)', label: 'You asked as Ana' },
        ],
      }),
      code('b', 'Write the permission check. `canView` returns `true` when the user owns the record, or is the teacher of that record.', {
        more: 'This is **authorization**. `||` means **or**: one side being true is enough. A teacher needs two things to be true at once, so join those with `&&` inside brackets.',
        hint: 'Owner: compare user.name with record.owner. Teacher: user.role must be "teacher" AND user.name must equal record.teacher.',
        setup: GRADES,
        starter: `// A user looks like { name: "ana", role: "student" }.
// A record looks like { id: 101, owner: "ana", teacher: "ortiz", grade: "B+" }.
// Ready for you: ana, ben (students), ortiz, lee (teachers), records.

// Write canView(user, record). Return true when EITHER is true:
//   1. user.name equals record.owner
//   2. user.role is "teacher" AND user.name equals record.teacher
// Otherwise return false.
function canView(user, record) {

}

say(canView(ana, records[0]));
say(canView(ana, records[1]));`,
        tests: [
          { run: 'canView(ana, records[0])', want: true, label: 'Ana can view her own record' },
          { run: 'canView(ana, records[1])', want: false, label: 'Ana cannot view Ben\'s record' },
          { run: 'canView(ortiz, records[1])', want: true, label: 'Teacher Ortiz can view Ben\'s record: he is in her class' },
          { run: 'canView(lee, records[1])', want: false, label: 'Teacher Lee cannot: Ben is not in his class' },
          { run: 'canView({ name: "ortiz", role: "student" }, records[1])', want: false, label: 'A student who is named ortiz is still not the teacher' },
        ],
      }),
      code('c', 'Fix the page. Write `safePage` so it finds the record, then uses `canView` before it hands anything over.', {
        more: 'Find the record first. If there is none, say `"not found"`. If there is one, ask `canView`. Only when the answer is `true` may the page return the record.',
        hint: 'Loop over records as the old page did. When the id matches, do not return at once: first ask canView(user, records[i]).',
        setup: `${GRADES}\n${CAN_VIEW}`,
        starter: `// canView(user, record) from the last step is ready.
// records is the list. Each record has an id.

// Write safePage(user, id).
//   - Find the record whose id equals id.
//   - If the user can view it, return the record.
//   - If the user cannot view it, return "not allowed".
//   - If no record has that id, return "not found".
function safePage(user, id) {

}

say(safePage(ana, 101));
say(safePage(ana, 102));`,
        tests: [
          { run: 'safePage(ana, 101).grade', want: 'B+', label: 'Ana still sees her own grade' },
          { run: 'safePage(ana, 102)', want: 'not allowed' },
          { run: 'safePage(ortiz, 102).owner', want: 'ben', label: 'Teacher Ortiz sees Ben\'s record' },
          { run: 'safePage(lee, 101)', want: 'not allowed' },
          { run: 'safePage(ana, 999)', want: 'not found' },
        ],
      }),
      lab('d', 'Think like a privacy engineer. Sort each piece of data: who should be able to see it?', {
        type: 'sort', bins: ['Only the owner and people who need it', 'Fine for anyone'],
        items: [['A student\'s grades', 0], ['The lunch menu', 1], ['A home address', 0], ['The sports timetable', 1], ['A note from a doctor', 0], ['Library opening hours', 1]],
      }, 'Once private data leaks, copies can stay online for years and become part of how people see you. That is why the check must happen **before** the data is shown.'),
    ],
    quiz: [
      q('q1', 'What is authorization?', ['Proving who you are', 'Checking what a person is allowed to see or do', 'Scrambling a password', 'Making a backup']),
      q('q2', 'With your `canView`, a student named cy asks for a record owned by ana. What is the result?', ['true', 'false', '"not found"']),
      q('q3', 'Why are record numbers like 101, 102, 103 a risk when there is no permission check?', ['They are too long', 'They are easy to guess', 'They use too much memory', 'They are secret']),
      q('q4', 'A school page shows you another student\'s grades by mistake. What should you do?', ['Take a screenshot to share', 'Look at more records', 'Stop and tell a teacher', 'Say nothing']),
    ],
    ship: {
      prompt: 'Explain the difference between proving who you are and being allowed to see something.',
      frame: 'Signing in proves ___. A permission check decides ___. Without the check, ___.',
      stretch: 'Add a role called "counselor" who may view every record. Change `canView`, and write one test that proves a counselor can view and a visitor cannot.',
    },
    teacher: { note: 'Connect to privacy: leaked data persists and shapes a person\'s online identity. Remind students that seeing someone else\'s data by accident is a thing to report, not explore.' },
  },

  // ------------------------------------------------------------------ 5
  {
    id: 'g8-05', title: 'Lock Down the Snack Shop', project: true,
    question: 'How do you make code safe when you did not write it?',
    goal: 'I can find flaws in code I did not write, fix them, and write checks that prove each fix.',
    standards: ['6-8.CT.d.6', '6-8.CT.d.3', '6-8.CT.d.5'],
    job: ['Security code reviewer', 'A person who reads other people\'s code, including code written by AI tools, to find flaws before it goes live.'],
    mission: {
      story: [
        'The Heights Snack Shop wants to sell online. To save time, the owner asked an AI helper to write the code. It runs. Nobody has checked it.',
        'Code from an AI helper, or from anyone, can work for normal orders and still fail for odd ones. This shop has **four flaws**.',
        'Your project: trace the code, find each flaw, fix it, and write a check that proves the fix. Then run every check again.',
      ],
      vocab: [
        ['Code review', 'Reading code carefully to find mistakes before it is used.'],
        ['Trace', 'Following code step by step to see what it will do.'],
        ['Trust', 'Believing data without checking it. Code should not trust what a buyer sends.'],
        ['Check', 'A small test that returns true when a defence holds.'],
      ],
      talk: 'An AI helper wrote code that works when you try it once. Is it ready to use? What else would you want to know?',
      rule: 'If you find a flaw in a real shop or app, do not use it. Report it to the owner or a trusted adult.',
    },
    steps: [
      code('a', 'Run the AI helper\'s code and read the three results. Then fix `orderTotal`: use the price from `menu`, and return `"bad order"` for a bad quantity or item.', {
        more: 'Two flaws hide in one line. The code **trusts the buyer\'s price**, and it accepts **any quantity**, even a negative one. `menu[order.item]` is the real price. It is `undefined` when the item is not on the menu.',
        hint: 'Get the real price from menu[order.item]. Return "bad order" if that is undefined, or if order.qty is below 1 or above 20.',
        setup: SHOP,
        starter: `// Written by an AI helper. Nobody has checked it yet.
// menu holds the real prices: chips 2, juice 3, cookie 1.
// An order comes from the buyer: { item: "chips", qty: 2, price: 2 }
// A fair order has a qty from 1 to 20 and an item on the menu.
function orderTotal(order) {
  return order.qty * order.price;
}

say(orderTotal({ item: "chips", qty: 2, price: 2 }));
say(orderTotal({ item: "chips", qty: -5, price: 2 }));
say(orderTotal({ item: "juice", qty: 3, price: 0 }));`,
        tests: [
          { run: 'orderTotal({ item: "chips", qty: 2, price: 2 })', want: 4 },
          { run: 'orderTotal({ item: "juice", qty: 3, price: 0 })', want: 9, label: 'The buyer\'s price is ignored: 3 juices cost 9' },
          { run: 'orderTotal({ item: "chips", qty: -5, price: 2 })', want: 'bad order' },
          { run: 'orderTotal({ item: "cookie", qty: 0, price: 1 })', want: 'bad order' },
          { run: 'orderTotal({ item: "cookie", qty: 21, price: 1 })', want: 'bad order' },
          { run: 'orderTotal({ item: "gold", qty: 1, price: 1 })', want: 'bad order', label: 'An item that is not on the menu is a bad order' },
        ],
      }),
      code('b', 'Flaw three: anyone can order, signed in or not. Fix `placeOrder` so a user who is not signed in gets `"sign in first"`.', {
        more: 'Each user has `signedIn`, which is `true` or `false`. The check must come **first**, before any other work is done. `!` means **not**: `!user.signedIn` is true when the user is not signed in.',
        hint: 'Add one if at the top of the function. It needs user.signedIn and a return.',
        setup: `${SHOP}\n${SHOP_TOTAL}`,
        starter: `// Written by an AI helper. orderTotal is already fixed.
// A user looks like { name: "ana", signedIn: true }.
// Ready for you: ana and ben (signed in), cy and visitor (not).
function placeOrder(user, order) {
  const total = orderTotal(order);
  return user.name + " pays " + total;
}

say(placeOrder(ana, { item: "chips", qty: 2 }));
say(placeOrder(visitor, { item: "chips", qty: 2 }));`,
        tests: [
          { run: 'placeOrder(ana, { item: "chips", qty: 2 })', want: 'ana pays 4' },
          { run: 'placeOrder(ben, { item: "juice", qty: 3 })', want: 'ben pays 9' },
          { run: 'placeOrder(visitor, { item: "chips", qty: 2 })', want: 'sign in first' },
          { run: 'placeOrder(cy, { item: "cookie", qty: 1 })', want: 'sign in first' },
        ],
      }),
      code('c', 'Flaw four: a coupon works again and again. Fix `applyCoupon` so each coupon code takes money off only the **first** time it is used.', {
        more: 'The shop must **remember** which codes were used. `usedCoupons` is a list for that. `list.includes(x)` asks if `x` is in the list. `list.push(x)` adds `x` to the list.',
        hint: 'Before taking money off, ask if usedCoupons already includes the code. If it does, return total unchanged. If not, push the code first.',
        setup: SHOP,
        starter: `// Written by an AI helper.
// coupons holds what each code takes off: SNACK1 takes 1, HEIGHTS2 takes 2.
const usedCoupons = [];

function applyCoupon(total, code) {
  if (coupons[code]) {
    return total - coupons[code];
  }
  return total;
}

say(applyCoupon(5, "SNACK1"));
say(applyCoupon(5, "SNACK1"));`,
        tests: [
          { run: 'applyCoupon(6, "HEIGHTS2")', want: 4, label: 'HEIGHTS2 takes 2 off the first time' },
          { run: 'applyCoupon(6, "HEIGHTS2")', want: 6, label: 'HEIGHTS2 takes nothing off the second time' },
          { run: '[applyCoupon(9, "SNACK1"), applyCoupon(9, "SNACK1")][1]', want: 9, label: 'SNACK1 used twice in a row: the second time takes nothing off' },
          { run: 'applyCoupon(5, "NOPE")', want: 5, label: 'A code that does not exist takes nothing off' },
          { run: 'usedCoupons.includes("NOPE")', want: false, label: 'Only real codes are remembered' },
        ],
      }),
      code('d', 'Prove all four fixes. Finish `check` so it returns `true` for the fixed shop and `false` for any shop that still has a flaw.', {
        more: 'Five shops are ready. `fixedShop` has every fix. Each of the others still has one flaw. Your check must catch them all. Write one `if` for each fix, as the first one shows.',
        hint: 'For the coupon, call shop.coupon(5, "SNACK1") once to use it up. Then test that a second call gives back 5.',
        setup: SHOPS,
        starter: `// Each shop has shop.total(order), shop.place(user, order)
// and shop.coupon(total, code). visitor is NOT signed in.
// Write check(shop). Return true only when all four hold:
//   1. a qty of -5 gives "bad order"            (done for you)
//   2. 2 chips cost 4, even when the order says price: 0
//   3. shop.place for visitor gives "sign in first"
//   4. "SNACK1" used a second time on 5 gives back 5
function check(shop) {
  if (shop.total({ item: "chips", qty: -5, price: 2 }) !== "bad order") return false;

  return true;
}

say(check(fixedShop));
say(check(priceShop));`,
        tests: [
          { run: 'check(fixedShop)', want: true },
          { run: 'check(qtyShop)', want: false, label: 'check catches the shop that takes a negative quantity' },
          { run: 'check(priceShop)', want: false, label: 'check catches the shop that trusts the buyer\'s price' },
          { run: 'check(openShop)', want: false, label: 'check catches the shop with no sign-in check' },
          { run: 'check(couponShop)', want: false, label: 'check catches the shop where a coupon works twice' },
        ],
      }),
      lab('e', 'This is how a reviewer works on code they did not write. Put the steps in order.', {
        type: 'order',
        items: [
          'Trace the code: follow it step by step with a normal input',
          'Try odd inputs: negative, zero, huge, empty, repeated',
          'Fix one flaw at a time',
          'Write a check that proves the fix',
          'Run every check again, in case the fix broke something else',
        ],
      }, 'Working in small rounds like this is called **iterating**. An AI helper can write code fast, but a person must still review it, test it and answer for it.'),
    ],
    quiz: [
      q('q1', 'The buyer\'s order says `price: 0`. Where should the shop get the real price?', ['From the order', 'From its own menu', 'From the coupon', 'From the buyer\'s name']),
      q('q2', 'Trace it: `orderTotal` returns `order.qty * order.price`. What does it give for qty -5 and price 2?', ['10', '0', '-10', '"bad order"']),
      q('q3', 'Why write a check after fixing a flaw?', ['To make the code longer', 'To prove the fix works and keeps working', 'To hide the flaw', 'To slow attackers down']),
      q('q4', 'An AI helper wrote code for your club\'s site. What is the responsible thing to do before using it?', ['Use it at once', 'Review and test it first', 'Delete all of it', 'Ask the AI if it is safe and trust the answer']),
    ],
    ship: {
      prompt: 'Write a short review for the shop owner: the four flaws you found, and how you proved each fix.',
      frame: 'The flaw was ___. A buyer could have ___. I fixed it by ___. My check proves it because ___.',
      stretch: 'Find a fifth flaw: what if `qty` is 1.5? Decide what the shop should do, fix `orderTotal`, and add one more line to `check`.',
    },
    teacher: { note: 'Project lesson: allow two periods. The point about AI-written code is balance, not fear: it is a useful draft, and people remain responsible for reviewing and testing it.' },
  },

  // ------------------------------------------------------------------ 6
  {
    id: 'g8-06', title: 'Sharing a Key in Public',
    question: 'How can two people agree on a secret while someone listens to every word?',
    goal: 'I can explain and code how two people make a shared secret key over a public network.',
    standards: ['6-8.CS.c.3', '6-8.CAS.a.1'],
    job: ['Cryptographer', 'A person who designs the maths that keeps messages secret and proves who sent them.'],
    mission: {
      story: [
        'Asha and Ben work in two towers in The Heights. Every message between the towers crosses the public network, and anyone on it can listen.',
        'To scramble their messages they need the same secret **key**. But how can they agree on a key when a listener hears everything they send?',
        'The answer is a clever swap called a **key exchange**. Your browser does it each time you see the padlock. Today you do it with paint, then with small numbers.',
      ],
      vocab: [
        ['Key', 'A secret number used to scramble and unscramble messages.'],
        ['Key exchange', 'A way for two sides to make the same key without ever sending it.'],
        ['Public value', 'A number that is safe to send in the open.'],
        ['Remainder', 'What is left over after dividing. 17 divided by 5 leaves 2.'],
        ['Encryption', 'Scrambling a message so only someone with the key can read it.'],
      ],
      talk: 'If you had to tell a friend a secret across a crowded room, how could you do it so that nobody else understood?',
      rule: 'Listening in on other people\'s messages without permission is against the law. We study the listener only to build a better defence.',
    },
    steps: [
      lab('a', 'First, the idea with paint. Mixing is easy; un-mixing is very hard. Put the steps in order.', {
        type: 'order',
        items: [
          'Asha and Ben agree on a public colour, yellow. The listener sees it.',
          'Each mixes their own secret colour into some yellow.',
          'They send each other the mixtures. The listener sees both mixtures.',
          'Each adds their own secret colour to the mixture they received.',
          'Both now hold the same final colour. The listener cannot make it.',
        ],
      }, 'The final colour is yellow plus both secret colours. The listener has only the two mixtures, and cannot take the secret colours back out of them.'),
      code('b', 'Numbers need a mix that is hard to undo. Fill the two ___ blanks so `powerMod` multiplies `base` by itself `exp` times, keeping only the remainder.', {
        more: '`%` gives the **remainder** after dividing. `powerMod(5, 2, 23)` is 5 × 5 = 25, and 25 divided by 23 leaves 2. Going forward is quick. Working backward from the answer to `exp` is slow.',
        hint: 'How many times should the loop go round? What should result be multiplied by each time? Both answers are names in the first line.',
        starter: `// powerMod(base, exp, mod): multiply base by itself exp times,
// but after each step keep only the remainder when divided by mod.
function powerMod(base, exp, mod) {
  let result = 1;
  for (let i = 0; i < ___; i++) {
    result = (result * ___) % mod;
  }
  return result;
}

say(powerMod(5, 2, 23));
say(powerMod(5, 6, 23));`,
        tests: [
          { run: 'powerMod(5, 2, 23)', want: 2 },
          { run: 'powerMod(5, 6, 23)', want: 8 },
          { run: 'powerMod(2, 10, 1000)', want: 24 },
          { run: 'powerMod(7, 3, 10)', want: 3 },
        ],
      }),
      code('c', 'Now the swap, in numbers. Write `publicValue` and `sharedKey`. Asha and Ben should end with the same key without ever sending a secret.', {
        more: 'The public numbers `p` and `g` are the yellow paint. Your secret number is your secret colour. `publicValue` is your mixture: safe to send. `sharedKey` adds your secret to the other person\'s mixture.',
        hint: 'Each function is one line that returns a powerMod. The comments give the three things to pass in.',
        setup: POWER_MOD,
        starter: `// Public numbers that everyone knows, even the listener:
// p is 23 and g is 5. powerMod(base, exp, mod) is ready.

// 1. Return powerMod(g, secret, p). This is safe to send.
function publicValue(secret) {

}

// 2. Return powerMod(theirPublic, mySecret, p).
function sharedKey(theirPublic, mySecret) {

}

// Asha's secret is 6. Ben's secret is 15. They never send these.
say("Asha sends " + publicValue(6));
say("Ben sends " + publicValue(15));
say("Asha's key: " + sharedKey(publicValue(15), 6));
say("Ben's key: " + sharedKey(publicValue(6), 15));`,
        tests: [
          { run: 'publicValue(6)', want: 8 },
          { run: 'publicValue(15)', want: 19 },
          { run: 'sharedKey(19, 6)', want: 2, label: 'Asha makes the key 2 from Ben\'s public value' },
          { run: 'sharedKey(8, 15)', want: 2, label: 'Ben makes the same key 2 from Asha\'s public value' },
          { run: 'sharedKey(publicValue(4), 9) === sharedKey(publicValue(9), 4)', want: true, label: 'It works for other secrets too: 4 and 9 give matching keys' },
          { run: 'sharedKey(publicValue(4), 9)', want: 13 },
        ],
      }),
      code('d', 'Test the defence. The listener heard 8. With numbers this small, every secret can be tried. Write `findSecret` to show why real keys use huge numbers.', {
        more: 'There are only 22 secrets to try here, so the toy falls at once. Real key exchanges use numbers hundreds of digits long. Trying every secret would take longer than the age of the universe.',
        hint: 'Loop a guess from 1 to 22. When publicValue(guess) equals heard, return the guess.',
        setup: `${POWER_MOD}\nconst publicValue = function (secret) { return powerMod(g, secret, p); };`,
        starter: `// The listener knows p (23) and g (5), and heard Asha send 8.
// publicValue(secret) is ready.

// Write findSecret(heard). Try every secret from 1 to 22.
// Return the one whose publicValue equals heard.
function findSecret(heard) {

}

say(findSecret(8));`,
        tests: [
          { run: 'findSecret(8)', want: 6 },
          { run: 'findSecret(19)', want: 15 },
          { run: 'findSecret(22)', want: 11 },
          { run: 'findSecret(4)', want: 4 },
        ],
      }),
      lab('e', 'Your browser does a key exchange, with huge numbers, before it shows the padlock. What does the padlock tell you?', {
        type: 'mcq',
        choices: [
          'The site is honest and safe to trust with anything',
          'Messages between you and the site are scrambled, so listeners cannot read them',
          'The site has no flaws',
          'Nobody can see which site you visit',
        ],
        answer: 1,
        why: 'The padlock means the connection is encrypted. It does not mean the people who run the site are honest: a fake site can have a padlock too.',
      }),
    ],
    quiz: [
      q('q1', 'In a key exchange, what do Asha and Ben send across the network?', ['Their secret numbers', 'The final key', 'Only their public values', 'Nothing at all']),
      q('q2', 'What is 17 % 5, the remainder when 17 is divided by 5?', ['2', '3', '5', '12']),
      q('q3', 'Why do real key exchanges use numbers hundreds of digits long?', ['They look impressive', 'So trying every secret takes far too long', 'Small numbers are against the law', 'Computers prefer them']),
      q('q4', 'A site shows the padlock. What should you still do before typing private information?', ['Nothing: the padlock proves the site is honest', 'Check it is the real site you meant to visit', 'Turn off the screen', 'Type faster']),
    ],
    ship: {
      prompt: 'Explain to someone at home how two people can agree on a secret key while a listener hears everything.',
      frame: 'They each keep ___ secret and send only ___. The listener cannot make the key because ___.',
      stretch: 'Change the public numbers to p = 47 and g = 5. Pick two new secrets. Do Asha and Ben still get the same key? How many guesses does the listener need now?',
    },
    teacher: { note: 'The paint step carries the idea; the numbers only prove it. Students do not need to follow why the maths works, only that both sides reach the same key and the listener cannot.' },
  },

  // ------------------------------------------------------------------ 7
  {
    id: 'g8-07', title: 'Has It Been Changed?',
    question: 'How can you tell that a file is exactly the same as the one that was sent?',
    goal: 'I can use fingerprints to find a changed file and to check that an update is real.',
    standards: ['6-8.CAS.a.1', '6-8.CT.c.2'],
    job: ['Release engineer', 'A person who packages software updates and signs them, so users can check each update is real and unchanged.'],
    mission: {
      story: [
        'The Heights Tram runs on software, and it gets updates. Last night someone got into the file store. Nothing looks different. But was a file changed?',
        'A computer stores every file as numbers. A **fingerprint** squeezes all those numbers into one short number. Change one letter of the file, and the fingerprint changes.',
        'Today you write a toy fingerprint, find the changed file, and check a **signed** update before it is installed. Real systems use much stronger fingerprints than our toy.',
      ],
      vocab: [
        ['Fingerprint', 'A short number worked out from a whole file. Also called a hash or checksum.'],
        ['Integrity', 'Being sure that data has not been changed.'],
        ['Signature', 'A value only the real maker can create, which anyone can check.'],
        ['Update', 'A new version of software, sent out to fix or improve it.'],
      ],
      talk: 'How could you tell if someone changed one word in a 300-page book, without reading all of it again?',
      rule: 'Install software and updates only from the real maker, and only on devices you own or are allowed to manage.',
    },
    steps: [
      code('a', 'Write the toy `fingerprint`. Start `total` at 17. For each character: multiply by 31, add its code number, and keep the remainder after dividing by 9973.', {
        more: 'A file is stored as numbers: every character has a code number, and `text.charCodeAt(i)` gives it. `%` keeps the remainder. The fingerprint depends on every character **and** on their order.',
        hint: 'You need a for loop from 0 to text.length. Inside it, one line: total = (total * 31 + text.charCodeAt(i)) % 9973.',
        starter: `// Write fingerprint(text).
//   - Start with: let total = 17
//   - For each character i of text:
//       multiply total by 31, add text.charCodeAt(i),
//       then keep the remainder after dividing by 9973 (use %)
//   - Return total.
function fingerprint(text) {

}

say(fingerprint("cat"));
say(fingerprint("act"));
say(fingerprint("cat."));`,
        tests: [
          { run: 'fingerprint("cat")', want: 6329 },
          { run: 'fingerprint("act")', want: 4469, label: 'The same letters in a different order: fingerprint("act") gives 4469' },
          { run: 'fingerprint("cat.")', want: 6758 },
          { run: 'fingerprint("")', want: 17 },
          { run: 'fingerprint("Cipher City")', want: 7146 },
        ],
      }),
      code('b', 'Find what was changed. Write `changedFiles` so it returns the names of the files whose fingerprint no longer matches the trusted one.', {
        more: 'Last week, when the files were known to be good, the team saved each fingerprint in `trusted`. Now work out each fingerprint again and compare. Start with an empty list `[]` and `push` each name that fails.',
        hint: 'Loop over the list. For each file, compare fingerprint(file.text) with trusted[file.name]. If they differ, push file.name.',
        setup: FILES,
        starter: `// fingerprint(text) is ready.
// files is a list. Each file looks like { name: "map.txt", text: "..." }.
// trusted holds each good fingerprint: for example trusted["map.txt"].

// Write changedFiles(list). Return a list of the NAMES of the files
// whose fingerprint does not match the trusted one.
function changedFiles(list) {

}

say(changedFiles(files));`,
        tests: [
          { run: 'changedFiles(files)', want: ['menu.txt'] },
          { run: 'changedFiles(nightFiles)', want: ['map.txt', 'rules.txt'], label: 'In nightFiles, two files were changed: map.txt and rules.txt' },
          { run: 'changedFiles(cleanFiles)', want: [], label: 'In cleanFiles nothing was changed, so the list is empty' },
        ],
      }),
      code('c', 'An attacker could change a file **and** its fingerprint. So makers sign the fingerprint. Write `safeToInstall`: both the fingerprint and the signature must be right.', {
        more: 'A **signature** is made with the maker\'s private key, which only the maker has. Anyone can check it. `makerSigned` does that check for you. A copied signature fails, because it was made for a different fingerprint.',
        hint: 'Two questions joined with &&. One compares fingerprint(update.text) with update.fingerprint. The other calls makerSigned.',
        setup: UPDATES,
        starter: `// An update looks like { name, text, fingerprint, signature }.
// Four are ready: updateA, updateB, updateC and updateD.
// fingerprint(text) is ready.
// makerSigned(fingerprint, signature) is ready. It gives true only
// when the real maker signed that fingerprint.

// Write safeToInstall(update). Return true only when BOTH are true:
//   1. fingerprint(update.text) equals update.fingerprint
//   2. makerSigned(update.fingerprint, update.signature) is true
function safeToInstall(update) {

}

say(safeToInstall(updateA));
say(safeToInstall(updateC));`,
        tests: [
          { run: 'safeToInstall(updateA)', want: true },
          { run: 'safeToInstall(updateB)', want: true },
          { run: 'safeToInstall(updateC)', want: false, label: 'updateC had its text changed after it was signed' },
          { run: 'safeToInstall(updateD)', want: false, label: 'updateD is a fake with a signature copied from another update' },
        ],
      }),
      lab('d', 'You manage the tram\'s computers. Sort each update: install it, or stop and report it?', {
        type: 'sort', bins: ['Install', 'Stop and report'],
        items: [
          ['From the maker\'s site; fingerprint and signature both match', 0],
          ['The fingerprint does not match the one the maker published', 1],
          ['It arrived in a message from a stranger: "urgent update"', 1],
          ['Your device\'s own update tool says the signature is good', 0],
          ['The signature check fails, but the file "looks fine"', 1],
          ['A pop-up on a game site says your player is out of date', 1],
        ],
      }, 'Real updates fix security flaws, so installing them matters. The checks make sure you install the maker\'s update and not someone else\'s.'),
    ],
    quiz: [
      q('q1', 'One letter in a file changes. What happens to its fingerprint?', ['It stays the same', 'It changes', 'It gets longer', 'It is deleted']),
      q('q2', 'How does a computer store the text of a file?', ['As tiny pictures of letters', 'As numbers', 'As sounds', 'As paper']),
      q('q3', 'Why is a fingerprint alone not enough to trust an update?', ['Fingerprints are slow', 'An attacker could change the file and the fingerprint together', 'Fingerprints are secret', 'Updates have no text']),
      q('q4', 'A pop-up on a random site says "Update needed. Click here." What is the safe choice?', ['Click it quickly', 'Close it and update through the device\'s own settings', 'Send it to a friend', 'Turn off all updates for ever']),
    ],
    ship: {
      prompt: 'Explain how a fingerprint and a signature together show that an update is real and unchanged.',
      frame: 'The fingerprint shows ___. The signature shows ___. If either check fails, I would ___.',
      stretch: 'Find two different short words with the same toy fingerprint, or explain why that is hard to do by hand. What would it mean if it were easy?',
    },
    teacher: { note: 'The toy fingerprint and toy signature show the idea only; real ones are far stronger. Reinforce the everyday habit: update through the device\'s own settings, never from a pop-up or message.' },
  },

  // ------------------------------------------------------------------ 8
  {
    id: 'g8-08', title: 'Firewall Designer',
    question: 'How does a network decide which traffic to let in?',
    goal: 'I can write an ordered list of firewall rules that blocks by default, and test it.',
    standards: ['6-8.CAS.a.1', '6-8.CS.c.2', '6-8.CT.b.5'],
    job: ['Network security engineer', 'A person who designs the rules and devices that decide what traffic may enter or leave a network.'],
    mission: {
      story: [
        'The Heights Library has a new network: a router, a switch, a web server and staff computers. Data crosses it in small pieces called **packets**.',
        'A **firewall** stands where the network meets the outside. It reads each packet and checks its list of rules from the top. The first rule that matches decides.',
        'A good list ends with **block by default**: anything no rule allows stays out. Today you write the rules, and test them until only the right packets pass.',
      ],
      vocab: [
        ['Packet', 'A small piece of data that travels across a network.'],
        ['Port', 'A numbered door on a computer. Each kind of service uses its own.'],
        ['Firewall', 'A guard that lets packets through, or blocks them, by following rules.'],
        ['Block by default', 'Stopping everything that no rule allows.'],
      ],
      talk: 'A school has a front door, a side door and a staff door. Which should be open to visitors? How is that like a firewall?',
      rule: 'Only change the rules of a network you own or have been asked to manage. School network rules exist to protect everyone.',
    },
    steps: [
      code('a', 'Write `matches`. A rule matches a packet when its `from` fits **and** its `port` fits. In a rule, `"any"` fits everything.', {
        more: 'A packet says where it came **from** and which **port** (door) it wants. A rule can name one address or `"any"`, and one port or `"any"`. Each part needs an **or** (`||`). The two parts are joined by **and** (`&&`).',
        hint: 'Put brackets around each part: (rule.from is "any" OR equals packet.from) && (the same idea for port).',
        starter: `// A packet looks like { from: "10.0.9.4", port: 443 }.
// A rule looks like { action: "allow", from: "any", port: 443 }.

// Write matches(rule, packet). Return true only when BOTH are true:
//   1. rule.from is "any" OR rule.from equals packet.from
//   2. rule.port is "any" OR rule.port equals packet.port
function matches(rule, packet) {

}

const webRule = { action: "allow", from: "any", port: 443 };
say(matches(webRule, { from: "10.0.9.4", port: 443 }));
say(matches(webRule, { from: "10.0.9.4", port: 22 }));`,
        tests: [
          { run: 'matches({ action: "allow", from: "any", port: 443 }, { from: "10.0.9.4", port: 443 })', want: true },
          { run: 'matches({ action: "allow", from: "any", port: 443 }, { from: "10.0.9.4", port: 22 })', want: false },
          { run: 'matches({ action: "block", from: "10.0.66.6", port: "any" }, { from: "10.0.66.6", port: 8080 })', want: true },
          { run: 'matches({ action: "block", from: "10.0.66.6", port: "any" }, { from: "10.0.9.4", port: 8080 })', want: false },
          { run: 'matches({ action: "allow", from: "10.0.1.5", port: 22 }, { from: "10.0.1.5", port: 22 })', want: true },
          { run: 'matches({ action: "allow", from: "10.0.1.5", port: 22 }, { from: "10.0.7.7", port: 22 })', want: false },
        ],
      }),
      code('b', 'Write `decide`. Go down the rule list in order. The **first** rule that matches gives the answer. If none matches, return `"block"`.', {
        more: 'Order matters. `listA` blocks the noisy address first, then allows web traffic. `listB` has the same two rules the other way round. The last line of your function is the **default**: it runs only when no rule matched.',
        hint: 'Loop over rules. Inside, if matches(rules[i], packet) is true, return rules[i].action at once. After the loop, return "block".',
        setup: RULE_LISTS,
        starter: `// matches(rule, packet) is ready.
// Two rule lists are ready: listA and listB.

// Write decide(rules, packet).
//   - Go through rules in order, from first to last.
//   - Return the action of the FIRST rule that matches the packet.
//   - If no rule matches, return "block". This is block by default.
function decide(rules, packet) {

}

say(decide(listA, { from: "10.0.66.6", port: 443 }));
say(decide(listB, { from: "10.0.66.6", port: 443 }));`,
        tests: [
          { run: 'decide(listA, { from: "10.0.66.6", port: 443 })', want: 'block', label: 'listA blocks the noisy address first' },
          { run: 'decide(listB, { from: "10.0.66.6", port: 443 })', want: 'allow', label: 'listB has the same rules in the wrong order, so the packet is allowed' },
          { run: 'decide(listA, { from: "10.0.9.4", port: 443 })', want: 'allow' },
          { run: 'decide(listA, { from: "10.0.9.4", port: 8080 })', want: 'block', label: 'No rule matches port 8080, so it is blocked by default' },
          { run: 'decide([], { from: "10.0.9.4", port: 443 })', want: 'block', label: 'An empty rule list blocks everything' },
        ],
      }),
      code('c', 'Design the library\'s firewall. Read the plan in the comments, then fix the `rules` list until all 8 test packets get the right answer.', {
        more: '`report(rules)` sends 8 pretend packets through your list and prints each wrong answer. Change the list, run again, and repeat. You never need a rule for "block everything else": `decide` does that by default.',
        hint: 'Two things are wrong: the order of the two rules, and a missing rule for the admin desk on port 22.',
        setup: PACKETS,
        starter: `// decide(rules, packet) is ready. The FIRST matching rule wins.
// No match means "block".
// The plan for the library network:
//   - Web visitors use port 443. Allow them from any address.
//   - But 10.0.66.6 keeps flooding the site. Block it on every port.
//   - Port 22 is the admin door. Allow it only from 10.0.1.5.
//   - Block everything else.
// This list is not right yet. Fix it. The order matters.
const rules = [
  { action: "allow", from: "any", port: 443 },
  { action: "block", from: "10.0.66.6", port: "any" },
];

report(rules);`,
        tests: [
          { run: 'score(rules)', want: 8, label: 'All 8 test packets get the right answer' },
          { run: 'decide(rules, { from: "10.0.66.6", port: 443 })', want: 'block', label: 'The noisy address is blocked' },
          { run: 'decide(rules, { from: "10.0.1.5", port: 22 })', want: 'allow', label: 'The admin desk reaches the admin door' },
          { run: 'decide(rules, { from: "10.0.8.8", port: 22 })', want: 'block', label: 'Nobody else reaches the admin door' },
          { run: 'decide(rules, { from: "10.0.8.8", port: 9999 })', want: 'block', label: 'A door nobody planned for stays shut' },
        ],
      }),
      lab('d', 'Model the library network. Match each part to the job it does.', {
        type: 'match',
        pairs: [
          ['Router', 'Passes packets between the library network and the outside'],
          ['Switch', 'Joins the devices inside the building to each other'],
          ['Firewall', 'Checks each packet against a list of rules'],
          ['Server', 'Holds the website and answers requests for it'],
          ['Cable or wireless signal', 'Carries the packets from one device to the next'],
        ],
      }, 'A packet from a visitor travels: outside network, router, firewall, switch, server. The firewall sits where everything must pass it.'),
    ],
    quiz: [
      q('q1', 'What does "block by default" mean?', ['Block everything, always', 'Block anything that no rule allows', 'Block only known attackers', 'Allow everything at night']),
      q('q2', 'A list says: 1. allow any address on port 443. 2. block 10.0.66.6 on any port. A packet from 10.0.66.6 wants port 443. What happens?', ['Allowed: rule 1 matches first', 'Blocked: rule 2 is stricter', 'Both happen', 'An error']),
      q('q3', 'Which part of a network checks packets against rules?', ['The cable', 'The switch', 'The firewall', 'The screen']),
      q('q4', 'You think your school\'s firewall blocks a site by mistake. What is the right thing to do?', ['Look for a way around it', 'Ask a teacher or the IT team to review the rule', 'Use a friend\'s account', 'Unplug the router']),
    ],
    ship: {
      prompt: 'Explain why the order of firewall rules matters, and why the last rule should be "block".',
      frame: 'The order matters because ___. Blocking by default is safer because ___.',
      stretch: 'The library adds a printer that staff use on port 631, only from addresses 10.0.1.5 and 10.0.1.6. Add the rules, and write three test packets that prove they work.',
    },
    teacher: { note: 'All addresses are from private, pretend ranges. Link the lesson to your Acceptable Use Policy: the school filter is a rule list too, and the right way to change a rule is to ask.' },
  },

  // ------------------------------------------------------------------ 9
  {
    id: 'g8-09', title: 'Catch It in the Logs',
    question: 'How do defenders notice a break-in that makes no noise?',
    goal: 'I can search a log, write alert rules that catch a break-in, and put the response steps in order.',
    standards: ['6-8.CAS.a.1', '6-8.CT.c.4'],
    job: ['Security operations analyst', 'A person who watches logs and alerts, decides which ones are real trouble, and starts the response.'],
    mission: {
      story: [
        'Every sign-in to the Heights server is written to a **log**: the time, the user, the place, and whether it worked. Most lines are boring. That is normal.',
        'Last night someone broke into one account. The clues are in the log: many failed tries, an odd hour, a new place. No single clue proves it. Together they do.',
        'Your job: filter the log, write the **alert rules**, and catch the break-in without raising false alarms about honest people.',
      ],
      vocab: [
        ['Log', 'A list of things that happened on a system, with the time of each.'],
        ['Filter', 'Keeping only the records that fit a rule.'],
        ['Alert rule', 'A rule that warns a person when the log shows a sign of trouble.'],
        ['False alarm', 'An alert about something that turns out to be harmless.'],
        ['Incident', 'A real security problem, such as a break-in.'],
      ],
      talk: 'A user signs in at 3 in the morning. Is that a break-in? What else would you want to know?',
      rule: 'Logs hold private details about real people. Read them only when it is your job, and report what you find to the person in charge.',
    },
    steps: [
      code('a', 'Search the log. Write `failedCount` so it counts the failed sign-ins for one user.', {
        more: 'Counting needs three things: a counter that starts at 0, a loop over the list, and an `if` that adds 1 when a record fits. Here a record fits when the user matches **and** `ok` is `false`.',
        hint: 'Inside the loop, the record is list[i]. Check list[i].user === user and list[i].ok === false, then add 1 to your counter.',
        setup: LOG,
        starter: `// log is a list of 32 sign-in records from the Heights server.
// One record looks like:
// { time: "08:05", hour: 8, user: "june", place: "Midtown", ok: false }
// ok is false when the sign-in failed.
say(log[2]);

// Write failedCount(list, user). Count the records in list
// that belong to that user AND have ok equal to false.
function failedCount(list, user) {

}

say(failedCount(log, "june"));`,
        tests: [
          { run: 'failedCount(log, "june")', want: 1 },
          { run: 'failedCount(log, "omar")', want: 7 },
          { run: 'failedCount(log, "tess")', want: 0 },
          { run: 'failedCount(log.slice(0, 10), "raj")', want: 1, label: 'It works on a shorter list too' },
        ],
      }),
      code('b', 'Write two alert rules. Each looks at **one** record: `oddHour` for sign-ins late at night, and `newPlace` for a place that is not the user\'s usual one.', {
        more: 'Hours run from 0 to 23. "Odd" here means before 6 in the morning, or 22 and later. Test the edges: 5 is odd, 6 is not; 21 is not, 22 is. `home` holds each person\'s usual place.',
        hint: 'oddHour needs two comparisons joined with || (or). newPlace compares entry.place with home[entry.user] using !==.',
        setup: LOG,
        starter: `// home holds each person's usual place: home.ivy is "Heights".
// A record looks like:
// { time: "08:05", hour: 8, user: "june", place: "Midtown", ok: false }

// 1. Return true when entry.hour is less than 6, OR is 22 or more.
function oddHour(entry) {

}

// 2. Return true when entry.place is NOT home[entry.user].
function newPlace(entry) {

}

say(oddHour(log[0]));
say(newPlace(log[9]));`,
        tests: [
          { run: 'oddHour({ hour: 2 })', want: true },
          { run: 'oddHour({ hour: 5 })', want: true },
          { run: 'oddHour({ hour: 6 })', want: false },
          { run: 'oddHour({ hour: 21 })', want: false },
          { run: 'oddHour({ hour: 22 })', want: true },
          { run: 'newPlace({ user: "ivy", place: "Heights" })', want: false },
          { run: 'newPlace({ user: "june", place: "Harbor" })', want: true },
          { run: 'newPlace({ user: "omar", place: "Dockside" })', want: true },
        ],
      }),
      code('c', 'One clue alone gives false alarms. Write `findBreakIn` so it returns the times of sign-ins where **all four** clues are true.', {
        more: 'Tess works nights. June visited Harbor. Ivy mistyped once. None of them is an attacker, and a good rule should leave them alone. Joining the clues with **and** keeps the alert for the real break-in.',
        hint: 'Start with an empty list. Loop over the records. Join the four clues with && in one if, and push entry.time when all are true.',
        setup: LOG_RULES,
        starter: `// Ready for you: failedCount(list, user), oddHour(entry),
// newPlace(entry). Three logs are ready: log, dayLog and otherLog.

// Write findBreakIn(list). Return a list of the time of every
// record where ALL of these are true:
//   - the sign-in worked: entry.ok is true
//   - oddHour(entry) is true
//   - newPlace(entry) is true
//   - failedCount(list, entry.user) is 5 or more
function findBreakIn(list) {

}

say(findBreakIn(log));`,
        tests: [
          { run: 'findBreakIn(log)', want: ['02:17', '02:40'], label: 'In log, the break-in sign-ins were at 02:17 and 02:40' },
          { run: 'findBreakIn(dayLog)', want: [], label: 'dayLog is a normal day: no alerts, and no false alarms' },
          { run: 'findBreakIn(otherLog)', want: ['23:41'], label: 'In otherLog, a different account was broken into at 23:41' },
        ],
      }),
      lab('d', 'Your alert fired: Omar\'s account was broken into. Put the response steps in order.', {
        type: 'order',
        items: [
          'Check the alert is real: look at the log lines around it',
          'Report it to the security lead',
          'Lock the account so the attacker is shut out',
          'Help Omar set a new password, and fix the weak spot',
          'Write up what happened and what to change, so it is harder next time',
        ],
      }, 'Omar is not to blame. The attack was built to get past him. A good write-up asks what the **system** should do better, such as a lockout after a few wrong tries.'),
    ],
    quiz: [
      q('q1', 'What is a log?', ['A secret password list', 'A list of things that happened on a system, with times', 'A kind of firewall', 'A backup of all files']),
      q('q2', 'A rule alerts on every sign-in after 22:00. Tess works nights. What will the rule cause?', ['Nothing', 'False alarms', 'A lockout', 'A faster server']),
      q('q3', 'Which set of clues points most strongly to a break-in?', ['One failed sign-in at noon', 'A sign-in from the usual place at 9:00', 'Many failed tries, then a sign-in at 2:00 from a new place', 'A user who changes their password']),
      q('q4', 'You are an analyst and you confirm a break-in. What do you do first?', ['Keep it quiet', 'Report it to the person in charge', 'Blame the account\'s owner', 'Delete the log']),
    ],
    ship: {
      prompt: 'Explain how you caught the break-in, and why you needed more than one clue.',
      frame: 'One clue alone was not enough because ___. Together, the clues ___ showed that ___.',
      stretch: 'Write `busiestHour(list)`: return the hour with the most sign-ins. Then describe how a chart of sign-ins by hour would show last night\'s attack.',
    },
    teacher: { note: 'Model blame-free language: the account owner is not at fault. Ask students which defence from earlier lessons (the lockout) would have stopped this attack before the alert was needed.' },
  },

  // ------------------------------------------------------------------ 10
  {
    id: 'g8-10', title: 'Design and Defend', project: true,
    question: 'Why does a strong defence need more than one layer?',
    goal: 'I can design layered defences as functions, test them against attacks, and write a security plan.',
    standards: ['6-8.CAS.a.1', '6-8.CT.b.3', '6-8.CT.d.3'],
    job: ['Security architect', 'A person who designs how all of a system\'s defences fit together, so one failure does not open everything.'],
    mission: {
      story: [
        'Cipher City\'s headquarters stands at the top of The Heights. The mayor asks your team to design its defences, and has signed the agreement that lets you test them.',
        'No single defence stops everything. So defenders build **layers**: a firewall at the door, input checks and a lockout at the sign-in, and an alarm that watches the log.',
        'Break the big problem into parts. Build each layer as one function. Then four waves of pretend attacks will test your design. Fix what gets through, and write the plan.',
      ],
      vocab: [
        ['Layer', 'One defence among several. If one fails, the next still stands.'],
        ['Defence in depth', 'Using several layers so that no single failure lets an attacker in.'],
        ['Decompose', 'To break a big problem into smaller parts you can solve one at a time.'],
        ['Security plan', 'A written list of what you protect, the defences, and what to do if they fail.'],
      ],
      talk: 'A castle has a moat, a wall and a guard. Why not just build one very good wall?',
      rule: 'These attacks are pretend and run only inside this lesson. Test real defences only when the owner has given permission in writing.',
    },
    steps: [
      code('a', 'Layer 1, the firewall. Write `door` so it allows port 443 for everyone, allows port 22 only from the admin desk, and blocks everything else.', {
        more: 'Port 443 is the public website. Port 22 is the admin door, and only the desk at `10.0.1.5` may use it. End the function with `return "block"`, so anything you did not plan for is blocked by default.',
        hint: 'Two ifs that return "allow", then a last line that returns "block". The second if needs both the port and the from address.',
        starter: `// A packet looks like { from: "10.0.9.9", port: 443 }.

// Write door(packet). Return "allow" or "block".
//   - Port 443: allow from any address.
//   - Port 22: allow only when packet.from is "10.0.1.5".
//   - Everything else: block.
function door(packet) {

}

say(door({ from: "10.0.9.9", port: 443 }));
say(door({ from: "10.0.9.9", port: 22 }));`,
        tests: [
          { run: 'door({ from: "10.0.9.9", port: 443 })', want: 'allow' },
          { run: 'door({ from: "10.0.1.5", port: 22 })', want: 'allow' },
          { run: 'door({ from: "10.0.9.9", port: 22 })', want: 'block' },
          { run: 'door({ from: "10.0.1.5", port: 8080 })', want: 'block' },
          { run: 'door({ from: "10.0.1.5", port: 443 })', want: 'allow' },
        ],
      }),
      code('b', 'Layer 2, the sign-in. Write `signIn` with an input check and a lockout. Follow the five rules in the comments, in that order.', {
        more: 'The order is the design. Check the input before you touch any account, so a giant or empty input costs nothing. Check the lock before the password, so a locked account stays locked even for a right guess.',
        hint: 'Five ifs or returns, top to bottom, one for each rule. Keep accounts[name] in a variable after the input check.',
        setup: ACCOUNTS,
        starter: `// accounts.chief, accounts.deputy and accounts.clerk each have
// .hash and .fails. scramble(word) is ready (a toy hash).

// Write signIn(name, word). Check in this order:
//   1. word shorter than 8 or longer than 20: return "bad input"
//   2. no account with that name: return "no"
//   3. the account's fails is 3 or more: return "locked"
//   4. scramble(word) equals the account's hash:
//        set fails to 0 and return "welcome"
//   5. otherwise: add 1 to fails and return "no"
function signIn(name, word) {

}

say(signIn("deputy", "quiet-river-07"));
say(signIn("deputy", ""));`,
        tests: [
          { run: 'signIn("deputy", "quiet-river-07")', want: 'welcome' },
          { run: 'signIn("deputy", "aaaaaaaaaaaaaaaaaaaaaaaaa")', want: 'bad input', label: 'A word of 25 letters is bad input' },
          { run: 'signIn("nobody", "quiet-river-07")', want: 'no' },
          { run: '[signIn("clerk", ""), signIn("clerk", ""), signIn("clerk", ""), signIn("clerk", "maple-desk-63")]', want: ['bad input', 'bad input', 'bad input', 'welcome'], label: 'Bad input does not count as a wrong try' },
          { run: '[signIn("chief", "amber-tower-11"), signIn("chief", "amber-tower-21"), signIn("chief", "amber-tower-31"), signIn("chief", "amber-tower-41")]', want: ['no', 'no', 'no', 'locked'], label: 'After 3 wrong tries the chief\'s account is locked, even for the right word' },
        ],
      }),
      code('c', 'Layer 3, the alarm. Write `alarm` so it returns `true` for 3 or more failed sign-ins, or for any sign-in that worked before 5 in the morning.', {
        more: 'An alarm does not stop an attack. It tells a person quickly, so the attack is short. It should stay quiet for normal days and for one or two typos, or people will stop listening to it.',
        hint: 'Loop over events. Count the ones where ok is false. If you meet one where ok is true and hour is less than 5, return true at once.',
        setup: EVENTS,
        starter: `// An event looks like { user: "chief", ok: false, hour: 13 }.
// Four lists of events are ready:
// quietDay, typos, guessing and nightVisit.

// Write alarm(events). Return true when EITHER is true:
//   - 3 or more events have ok equal to false
//   - any event has ok equal to true AND hour less than 5
// Otherwise return false.
function alarm(events) {

}

say(alarm(quietDay));
say(alarm(guessing));`,
        tests: [
          { run: 'alarm(quietDay)', want: false },
          { run: 'alarm(typos)', want: false, label: 'Two typos do not set off the alarm' },
          { run: 'alarm(guessing)', want: true, label: 'Three failed sign-ins set off the alarm' },
          { run: 'alarm(nightVisit)', want: true, label: 'A sign-in at 3 in the morning sets off the alarm' },
          { run: 'alarm([])', want: false },
        ],
      }),
      code('d', 'A teammate built these three layers in a hurry. Run the attack waves, read what got through, and fix one flaw in each layer.', {
        more: '`runWaves(hq)` sends four waves of pretend attacks and returns a list of what got through. It also checks that real staff can still get in. Fix one thing, run again, and repeat until the list is empty.',
        hint: 'Door: which exact address is the admin desk? Sign-in: which should come first, the lock or the password? Alarm: is 3 "more than 3"?',
        setup: WAVES,
        starter: `// Three layers, written in a hurry. Each has ONE flaw.
function door(packet) {
  if (packet.port === 443) return "allow";
  if (packet.port === 22 && packet.from.startsWith("10.0.1.")) return "allow";
  return "block";
}
function signIn(name, word) {
  if (word.length < 8 || word.length > 20) return "bad input";
  const acct = accounts[name];
  if (acct === undefined) return "no";
  if (scramble(word) === acct.hash) { acct.fails = 0; return "welcome"; }
  if (acct.fails >= 3) return "locked";
  acct.fails = acct.fails + 1;
  return "no";
}
function alarm(events) {
  let fails = 0;
  for (const e of events) {
    if (e.ok === false) fails = fails + 1;
  }
  return fails > 3;
}
const hq = { door: door, signIn: signIn, alarm: alarm };
const through = runWaves(hq);
for (const line of through) say(line);
say(through.length + " got through");`,
        tests: [
          { run: 'runWaves(hq)', want: [], label: 'Nothing gets through in any of the four waves' },
          { run: 'door({ from: "10.0.1.50", port: 22 })', want: 'block', label: 'Only the admin desk, 10.0.1.5, reaches port 22' },
          { run: 'alarm([{ ok: false }, { ok: false }, { ok: false }])', want: true, label: 'Three failed sign-ins set off the alarm' },
          { says: '0 got through' },
        ],
      }),
      lab('e', 'Start your security plan. Match each layer to the attack it stops.', {
        type: 'match',
        pairs: [
          ['Firewall rule', 'A stranger trying doors that should be shut'],
          ['Input check', 'Empty, giant or strange text sent to the sign-in'],
          ['Lockout', 'Guessing many passwords, one after another'],
          ['Log alarm', 'An attack that would go on with nobody noticing'],
        ],
      }, 'A security plan says what you protect, which layer stops which attack, and who does what when a layer fails.'),
    ],
    quiz: [
      q('q1', 'What is defence in depth?', ['One very strong password', 'Several layers, so one failure does not let an attacker in', 'Hiding the server', 'Blocking every user']),
      q('q2', 'A sign-in checks the password before the lock. An attacker\'s 5th guess is right. What happens?', ['The account stays locked', 'The attacker gets in', 'The alarm stops them', 'The firewall blocks it']),
      q('q3', 'Why break the headquarters\' defence into separate functions?', ['Each part is easier to build, test and fix', 'It makes the code slower', 'Functions are secret', 'One big function cannot run']),
      q('q4', 'Your attack waves found a gap in a defence you built for a client. What do you do?', ['Hide it', 'Report it, fix it and test again', 'Wait and see if anyone notices', 'Blame a teammate']),
    ],
    ship: {
      prompt: 'Write a security plan for the headquarters: what you protect, your layers, and what to do when one fails.',
      frame: 'We protect ___. Layer 1 stops ___. Layer 2 stops ___. Layer 3 warns us when ___. If a layer fails, we will ___.',
      stretch: 'Design a fifth wave that your defences do not stop yet. Describe it in words, then add or change one function so they do. Write the check that proves it.',
    },
    teacher: { note: 'Project lesson: allow two periods, and let pairs split the layers between them. Assess the written plan as well as the code: can students say which layer stops which attack, and why?' },
  },
];
