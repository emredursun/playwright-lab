/**
 * ============================================================================
 *  LESSON 03 — Strings
 * ============================================================================
 *  Run:       node course/javascript/03-strings/lesson.js
 *  Practice:  node course/javascript/03-strings/exercises.js
 *
 *  After this lesson you can:
 *    1. Build strings with template literals instead of + concatenation.
 *    2. Use the everyday string methods (includes, trim, split, replaceAll...).
 *    3. Explain why strings are immutable and what that means for methods.
 *    4. Sort and compare text correctly with localeCompare.
 *    5. Write regular expressions for assertions: anchors, escaping, groups,
 *       greedy vs lazy, and flags.
 *
 *  How to study this file:
 *    - Every example has a numbered PREDICT comment. Write down your guess,
 *      run the file, then check the ANSWER KEY at the bottom.
 *    - Every surprise is a learning moment: re-read that example.
 *    - Then close this file and solve exercises.js from memory.
 * ============================================================================
 */

const section = (title) => console.log(`\n--- ${title} ---`);

// ----------------------------------------------------------------------------
section('1. Template literals instead of +');
// ----------------------------------------------------------------------------
const user = 'Ada';
const failed = 2;
const total = 10;

// AVOID: + concatenation is noisy and easy to get wrong.
const oldMessage = 'User ' + user + ' has ' + failed + ' of ' + total + ' tests failing';

// PREFER: backticks with ${...} placeholders. Any expression works inside.
const message = `User ${user} has ${failed} of ${total} tests failing`;
console.log(message === oldMessage); // PREDICT #1
console.log(`Pass rate: ${((total - failed) / total) * 100}%`); // PREDICT #2

// Watch out: + with a string turns numbers into text.
console.log('1' + 2 + 3); // PREDICT #3
console.log(1 + 2 + '3'); // PREDICT #4

// ----------------------------------------------------------------------------
section('2. Multi-line strings');
// ----------------------------------------------------------------------------
// AVOID: 'line 1\n' + 'line 2\n'
// PREFER: template literals keep real line breaks.
const report = `Test report
  passed: ${total - failed}
  failed: ${failed}`;
console.log(report); // PREDICT #5 (three lines)

// ----------------------------------------------------------------------------
section('3. Searching inside strings');
// ----------------------------------------------------------------------------
const url = 'https://shop.test/products/42?sort=price';

// AVOID: url.indexOf('products') !== -1   (old, hard to read)
// PREFER: methods that return a boolean and say what they mean.
console.log(url.includes('products')); // PREDICT #6
console.log(url.startsWith('https://')); // PREDICT #7
console.log(url.endsWith('.html')); // PREDICT #8

// .at() reads by position; negative numbers count from the end.
const word = 'playwright';
console.log(word.at(0), word.at(-1)); // PREDICT #9
// AVOID: word[word.length - 1]  -> PREFER: word.at(-1)

// ----------------------------------------------------------------------------
section('4. Strings are immutable');
// ----------------------------------------------------------------------------
// String methods never change the original. They RETURN a new string.
const title = '  Login Page  ';
title.trim(); // result is thrown away!
console.log(`[${title}]`); // PREDICT #10

const cleanTitle = title.trim(); // store the result
console.log(`[${cleanTitle}]`); // PREDICT #11

console.log(cleanTitle.toUpperCase(), cleanTitle.toLowerCase()); // PREDICT #12

// ----------------------------------------------------------------------------
section('5. Transforming: replaceAll, split, join, padStart');
// ----------------------------------------------------------------------------
const slugSource = 'User Can Log In';

// replace() changes only the FIRST match. replaceAll() changes every match.
console.log(slugSource.replace(' ', '-')); // PREDICT #13
console.log(slugSource.replaceAll(' ', '-').toLowerCase()); // PREDICT #14

// split -> array, join -> string. A very common pair.
// (.map runs a function on every item and returns a new array: Lesson 08.)
const tags = '@smoke, @login ,@regression';
const tagList = tags.split(',').map((tag) => tag.trim());
console.log(tagList); // PREDICT #15
console.log(tagList.join(' | ')); // PREDICT #16

// padStart / padEnd for fixed-width output:
const testNumber = 7;
console.log(`TC-${String(testNumber).padStart(3, '0')}`); // PREDICT #17
console.log(`${'name'.padEnd(8, '.')}Ada`); // PREDICT #18

// repeat() for separators:
console.log('='.repeat(10)); // PREDICT #19

// ----------------------------------------------------------------------------
section('6. Comparing and sorting text');
// ----------------------------------------------------------------------------
// === compares exactly, including case:
console.log('Login' === 'login'); // PREDICT #20
console.log('Login'.toLowerCase() === 'login'.toLowerCase()); // PREDICT #21

// AVOID: sorting words without a comparator (toSorted: Lesson 08). It sorts by
// character codes: all uppercase letters come before lowercase ones.
const names = ['émile', 'Zoe', 'adam'];
console.log(names.toSorted()); // PREDICT #22

// PREFER: localeCompare sorts the way humans expect.
console.log(names.toSorted((x, y) => x.localeCompare(y))); // PREDICT #23

// Case-insensitive equality check:
const sameText = 'STRASSE'.localeCompare('strasse', undefined, { sensitivity: 'base' }) === 0;
console.log(sameText); // PREDICT #24

// ----------------------------------------------------------------------------
section('7. Regular expressions: the basics');
// ----------------------------------------------------------------------------
// A regex describes a PATTERN. Keep them small and name what they mean.
const ORDER_ID_PATTERN = /^ORD-\d{4}$/; // "ORD-" followed by exactly 4 digits

console.log(ORDER_ID_PATTERN.test('ORD-1234')); // PREDICT #25
console.log(ORDER_ID_PATTERN.test('ORD-12')); // PREDICT #26

// Named groups make matches self-explanatory: (?<name>...)
const dateMatch = '2026-11-13'.match(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/);
const { year, month, day } = dateMatch.groups; // destructuring from Lesson 01
console.log(day, month, year); // PREDICT #27

// matchAll() + the `g` flag finds every match ([...x] turns it into an array):
const priceText = 'Shirt $25, Shoes $80, Hat $15';
const prices = [...priceText.matchAll(/\$(?<amount>\d+)/g)].map((match) =>
  Number(match.groups.amount),
);
console.log(prices); // PREDICT #28

// BEST PRACTICE: if a string method can do it (includes, startsWith, split),
// use the method. Reach for a regex only when you need a real pattern.

// ----------------------------------------------------------------------------
section('8. Regex for assertions: anchors, escaping, greedy vs lazy, flags');
// ----------------------------------------------------------------------------
// You'll write regexes in almost every toHaveURL / toHaveText assertion, so
// these four rules are worth knowing by heart.

// (a) ANCHORS: without ^ and $ a pattern matches ANYWHERE in the text.
console.log(/checkout/.test('/checkout-failed')); // PREDICT #29
console.log(/\/checkout$/.test('/checkout-failed')); // PREDICT #30
console.log(/\/checkout$/.test('https://shop.test/checkout')); // PREDICT #31

// (b) ESCAPING: . ? * + ^ $ ( ) [ ] { } | \ / have special meanings.
// An unescaped dot means "any character":
console.log(/shop.test/.test('shopXtest')); // PREDICT #32
console.log(/shop\.test/.test('shopXtest')); // PREDICT #33

// Building a pattern from a VARIABLE? Always escape it first. Node 22 has no
// built-in for this yet (RegExp.escape arrives in newer versions), so use a
// tiny helper. `$&` in the replacement means "the matched character".
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
const productName = 'T-shirt (XL) $25?';
console.log(escapeRegExp('a.b?')); // PREDICT #34
const productPattern = new RegExp(`^${escapeRegExp(productName)}$`);
console.log(productPattern.test('T-shirt (XL) $25?')); // PREDICT #35

// (c) GREEDY vs LAZY: * and + grab as MUCH as possible. Add ? to grab as
// little as possible.
const html = '<b>first</b> and <b>second</b>';
console.log(html.match(/<b>(.*)<\/b>/)[1]); // PREDICT #36
console.log(html.match(/<b>(.*?)<\/b>/)[1]); // PREDICT #37

// (d) FLAGS: i = ignore case, g = all matches, s = `.` also matches newlines,
// m = ^ and $ work per line.
console.log(/error/i.test('Network ERROR')); // PREDICT #38
console.log(/total:.*items/.test('total:\n3 items')); // PREDICT #39
console.log(/total:.*items/s.test('total:\n3 items')); // PREDICT #40

// ----------------------------------------------------------------------------
section('9. Tagged templates (optional: recognize only)');
// ----------------------------------------------------------------------------
// You will rarely WRITE these in test code, but libraries use them (SQL, CSS,
// HTML), so it helps to recognize the shape. Skip this section on a busy day.
// A function placed before a template literal receives the pieces separately:
// `strings` holds the fixed text parts; `values` holds the ${...} results.
// (reduce combines all items into one value: Lesson 08.)
function highlight(strings, ...values) {
  return strings.reduce((result, text, index) => {
    const value = index < values.length ? `[${values[index]}]` : '';
    return `${result}${text}${value}`;
  }, '');
}
console.log(highlight`Expected ${3} items but found ${2}`); // PREDICT #41

console.log('Done. Now open exercises.js and practice from memory!');

/**
 * ============================================================================
 *  RECAP — say these out loud without looking:
 *    - Template literals `${...}` instead of + concatenation.
 *    - includes / startsWith / endsWith instead of indexOf checks.
 *    - Strings are immutable: methods RETURN new strings. Store the result.
 *    - replaceAll for every match, split/join to convert to and from arrays.
 *    - Sort words with localeCompare, not plain .sort().
 *    - Regex: anchor with ^ $, escape dots and variables, prefer lazy .*? when
 *      matching "up to the next X".
 *
 *  In Playwright:
 *    await page.goto(`/products/${productId}`);            // baseURL comes from the config
 *    await expect(page).toHaveURL(/\/checkout$/);          // anchored: no false positives
 *    await expect(page.getByRole('heading')).toHaveText(/welcome/i);
 *    // PREFER toHaveText over reading text yourself: it RETRIES until the text
 *    // matches and normalizes whitespace. Read text only to extract DATA:
 *    const orderId = (await page.getByTestId('order-id').textContent())?.trim();
 * ============================================================================
 */

/**
 * ============================================================================
 *  ANSWER KEY — check your predictions only AFTER running the file.
 * ============================================================================
 *   #1  true
 *   #2  Pass rate: 80%
 *   #3  123 — once a string is involved, + concatenates
 *   #4  33 — left to right: 1 + 2 = 3 first, then '3' is appended
 *   #5  Test report
 *         passed: 8
 *         failed: 2
 *   #6  true
 *   #7  true
 *   #8  false
 *   #9  p t
 *   #10 [  Login Page  ] — the trimmed result was thrown away
 *   #11 [Login Page]
 *   #12 LOGIN PAGE login page
 *   #13 User-Can Log In — replace() only changes the first match
 *   #14 user-can-log-in
 *   #15 [ '@smoke', '@login', '@regression' ]
 *   #16 @smoke | @login | @regression
 *   #17 TC-007
 *   #18 name....Ada
 *   #19 ==========
 *   #20 false
 *   #21 true
 *   #22 [ 'Zoe', 'adam', 'émile' ] — character-code order: uppercase first
 *   #23 [ 'adam', 'émile', 'Zoe' ]
 *   #24 true
 *   #25 true
 *   #26 false
 *   #27 13 11 2026
 *   #28 [ 25, 80, 15 ]
 *   #29 true  — no anchors, so 'checkout' anywhere matches (a false positive!)
 *   #30 false — $ demands the text END right after 'checkout'
 *   #31 true
 *   #32 true  — the unescaped . matched the 'X'
 *   #33 false
 *   #34 a\.b\?
 *   #35 true
 *   #36 first</b> and <b>second — greedy .* ran to the LAST </b>
 *   #37 first — lazy .*? stopped at the FIRST </b>
 *   #38 true
 *   #39 false — . does not match the newline by default
 *   #40 true  — the s flag lets . match newlines
 *   #41 Expected [3] items but found [2]
 * ============================================================================
 */
