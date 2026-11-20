// Turns the computer's error messages into sentences a beginner can act on.
const RULES = [
  [/^TIMEOUT$/, () => 'Your code ran for too long, so it was stopped. Check your loop: does it ever reach the end?'],
  [/still a ___ blank/, () => 'There is still a ___ blank. Replace it with your answer.'],
  [/^(\S+) is not defined$/, (m) => (m[1] === '___' ? 'There is still a ___ blank. Replace it with your answer.' : `The computer does not know the name "${m[1]}". Check the spelling and the capital letters. If it is new, make it first with let.`)],
  [/^(\S+) is not a function$/, (m) => `"${m[1]}" is not something you can call with ( ). Check the spelling of the function's name.`],
  [/Cannot read propert(?:y|ies) of (undefined|null)(?: \(reading '(.+?)'\))?/, (m) => `The code tried to use ${m[2] ? `".${m[2]}" on ` : ''}something that is empty (${m[1]}). Check the name just before the dot, or the number inside [ ].`],
  [/Assignment to constant variable/, () => 'A name made with const cannot be changed later. Make it with let if it needs to change.'],
  [/has already been declared/, () => 'That name was already made. Use a different name, or drop the extra let or const.'],
  [/Unexpected end of input|missing \) after argument list|Unexpected token '?\}'?|expected/i, () => 'A bracket or brace is missing or extra. Every ( needs a ) and every { needs a }.'],
  [/Invalid or unexpected token|Unterminated string|unexpected string/i, () => 'A piece of text is not closed. Every " needs a matching " on the same line.'],
  [/Unexpected identifier|Unexpected token|Unexpected number|Unexpected string/, () => 'The computer could not read this line. Look for a missing +, comma, quote mark or bracket.'],
  [/Illegal return|Return statements are only valid/, () => 'return only works inside a function.'],
  [/Maximum call stack|too much recursion|stack overflow/i, () => 'A function keeps calling itself and never stops.'],
  [/Invalid array length|out of memory/i, () => 'The code tried to make a list that is far too big. Check your loop.'],
];

/** { text, line }: what went wrong, in plain words, and the line to look at (0 if unknown). */
export function explain(error) {
  if (!error) return null;
  const msg = String(error.message || '');
  for (const [re, say] of RULES) { const m = msg.match(re); if (m) return { text: say(m), line: error.line || 0, raw: msg }; }
  return { text: 'Something in the code stopped it from running. Read the line carefully, one piece at a time.', line: error.line || 0, raw: msg };
}
