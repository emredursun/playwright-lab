/**
 * ============================================================================
 *  LESSON 04 — Numbers, Math & Dates
 * ============================================================================
 *  Run:       node course/javascript/04-numbers-and-math/lesson.js
 *  Practice:  node course/javascript/04-numbers-and-math/exercises.js
 *
 *  After this lesson you can:
 *    1. Explain why 0.1 + 0.2 !== 0.3 and compare decimals safely.
 *    2. Detect invalid numbers with Number.isNaN / Number.isFinite.
 *    3. Parse text into numbers the right way (Number vs parseInt with radix).
 *    4. Round and format numbers for humans (toFixed, Intl.NumberFormat), and
 *       know why formatted text breaks naive assertions.
 *    5. Use Math helpers and random ranges.
 *    6. Work with dates safely: Date.now, ISO strings, time zones, Intl.
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
section('1. One number type for everything');
// ----------------------------------------------------------------------------
// JavaScript has ONE `number` type for integers and decimals (64-bit floats).
console.log(typeof 42, typeof 4.2); // PREDICT #1
console.log(7 / 2); // PREDICT #2
console.log(7 % 2); // PREDICT #3
console.log(2 ** 10); // PREDICT #4  (PREFER ** over Math.pow)

// Numeric separators make big numbers readable (Lesson 01):
const TIMEOUT_MS = 30_000;
console.log(TIMEOUT_MS); // PREDICT #5

// Integers are exact only up to Number.MAX_SAFE_INTEGER:
console.log(Number.MAX_SAFE_INTEGER); // PREDICT #6
console.log(Number.MAX_SAFE_INTEGER + 2); // PREDICT #7

// ----------------------------------------------------------------------------
section('2. Floating point surprises');
// ----------------------------------------------------------------------------
// Decimals are stored in binary, so some can't be stored exactly.
console.log(0.1 + 0.2); // PREDICT #8
console.log(0.1 + 0.2 === 0.3); // PREDICT #9

// AVOID Number.EPSILON as a tolerance. It is the gap between 1 and the next
// float, so it only works for numbers close to 1:
const isCloseEpsilon = (a, b) => Math.abs(a - b) < Number.EPSILON;
console.log(isCloseEpsilon(0.1 + 0.2, 0.3)); // PREDICT #10
console.log(isCloseEpsilon(1.1 + 2.2, 3.3)); // PREDICT #11

// PREFER an explicit tolerance that fits your domain (here: 1e-9):
const isClose = (a, b, tolerance = 1e-9) => Math.abs(a - b) < tolerance;
console.log(isClose(0.1 + 0.2, 0.3), isClose(1.1 + 2.2, 3.3)); // PREDICT #12
// Playwright and node:test have this built in: expect(x).toBeCloseTo(3.3, 2).

// BEST PRACTICE for money: calculate in whole CENTS, format at the end.
const priceCents = 1_999; // $19.99
const quantity = 3;
const totalCents = priceCents * quantity;
console.log(totalCents / 100); // PREDICT #13

// ----------------------------------------------------------------------------
section('3. NaN and Infinity');
// ----------------------------------------------------------------------------
// NaN = "Not a Number": the result of a failed number operation.
console.log(Number('abc')); // PREDICT #14
console.log(typeof NaN); // PREDICT #15
console.log(1 / 0, -1 / 0); // PREDICT #16

// AVOID the global isNaN(): it converts first, so text "is NaN".
console.log(isNaN('hello')); // PREDICT #17
// PREFER Number.isNaN(): true ONLY for the actual NaN value.
console.log(Number.isNaN('hello')); // PREDICT #18
console.log(Number.isNaN(Number('hello'))); // PREDICT #19

// Number.isFinite rejects NaN, Infinity AND non-numbers in one check:
console.log(Number.isFinite(42), Number.isFinite(Infinity), Number.isFinite('42')); // PREDICT #20
console.log(Number.isInteger(5), Number.isInteger(5.5)); // PREDICT #21

// ----------------------------------------------------------------------------
section('4. Parsing text into numbers');
// ----------------------------------------------------------------------------
// Number() is STRICT: the whole string must be a number.
console.log(Number('42'), Number('42px'), Number('')); // PREDICT #22

// Number.parseInt / parseFloat read from the start and stop at junk.
// ALWAYS pass the radix (base) 10 to parseInt.
console.log(Number.parseInt('42px', 10)); // PREDICT #23
console.log(Number.parseInt('08', 10)); // PREDICT #24
console.log(Number.parseFloat('3.75 GB')); // PREDICT #25
// Careful: parse stops at the FIRST unexpected character, including commas:
console.log(Number.parseFloat('1,234.50')); // PREDICT #26

// AVOID clever tricks: +'42', ~~'42', '42' * 1. They hide intent.
// PREFER: Number(text) for clean input, parseInt(text, 10) to strip units.

// Validate after parsing:
const parseCount = (text) => {
  const value = Number(text.trim());
  return text.trim() !== '' && Number.isInteger(value) ? value : null;
};
console.log(parseCount(' 12 '), parseCount('12.5'), parseCount('')); // PREDICT #27

// ----------------------------------------------------------------------------
section('5. Rounding: Math and toFixed');
// ----------------------------------------------------------------------------
console.log(Math.round(2.5), Math.round(-2.5)); // PREDICT #28
console.log(Math.floor(2.9), Math.ceil(2.1), Math.trunc(-2.9)); // PREDICT #29

// toFixed returns a STRING. Great for display, not for more math.
const average = 2 / 3;
const rounded = average.toFixed(2);
console.log(rounded, typeof rounded); // PREDICT #30

// Round to N decimals and keep a number:
const roundTo = (value, decimals) => Math.round(value * 10 ** decimals) / 10 ** decimals;
console.log(roundTo(2 / 3, 2)); // PREDICT #31
// ...but floating point strikes again: 1.005 is really 1.00499999999999989...
console.log(roundTo(1.005, 2)); // PREDICT #32
// RULE: for DISPLAY use Intl.NumberFormat (section 8); for MONEY use cents.

// ----------------------------------------------------------------------------
section('6. Useful Math helpers');
// ----------------------------------------------------------------------------
const durations = [1_200, 340, 5_600, 980];
// Spread an array into Math.max / Math.min (spread: Lesson 08):
console.log(Math.max(...durations), Math.min(...durations)); // PREDICT #33
console.log(Math.abs(-15), Math.sign(-15)); // PREDICT #34

// Clamp a value into a range (a pattern you'll write often):
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
console.log(clamp(150, 0, 100), clamp(-5, 0, 100), clamp(42, 0, 100)); // PREDICT #35

// ----------------------------------------------------------------------------
section('7. Random numbers in a range');
// ----------------------------------------------------------------------------
// Math.random() returns a decimal in [0, 1): 0 included, 1 excluded.
// A whole number from min to max, BOTH included:
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// (Array.from with a length builds an array: Lesson 08.)
const rolls = Array.from({ length: 1_000 }, () => randomInt(1, 6));
console.log(Math.min(...rolls), Math.max(...rolls)); // PREDICT #36

// For TEST DATA that must be unique, PREFER crypto.randomUUID():
console.log(crypto.randomUUID().length); // PREDICT #37
// RULES for tests:
//   - Random values make failures hard to reproduce. Use them only for
//     UNIQUENESS (emails, names), never to decide what a test checks.
//   - Math.random is NOT secure: never use it for passwords or tokens.

// ----------------------------------------------------------------------------
section('8. Formatting for humans: Intl.NumberFormat');
// ----------------------------------------------------------------------------
// AVOID building '$' + amount.toFixed(2) by hand: commas, symbols and decimal
// separators differ per country.
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
console.log(usd.format(1_234.5)); // PREDICT #38

const euroDe = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
console.log(euroDe.format(1_234.5)); // PREDICT #39

// WARNING: the "space" before € is a NO-BREAK SPACE (U+00A0), not a normal one.
// A hand-typed expected string will NOT match:
console.log(euroDe.format(1_234.5) === '1.234,50 €'); // PREDICT #40
// PREFER: compare against the formatter's own output, or normalize spaces
// (\s matches every kind of space):
console.log(euroDe.format(1_234.5) === euroDe.format(1_234.5)); // PREDICT #41
console.log(euroDe.format(1_234.5).replace(/\s/g, ' ') === '1.234,50 €'); // PREDICT #42

const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });
console.log(percent.format(0.875)); // PREDICT #43

const compact = new Intl.NumberFormat('en-US', { notation: 'compact' });
console.log(compact.format(1_500_000)); // PREDICT #44

// ----------------------------------------------------------------------------
section('9. Dates and time');
// ----------------------------------------------------------------------------
// A Date is a single moment, stored as milliseconds since 1970-01-01 UTC.
// Date.now() gives "now" as that number: ideal for durations and timestamps.
const startedAt = Date.now();
const elapsedMs = Date.now() - startedAt;
console.log(typeof startedAt, elapsedMs >= 0); // PREDICT #45

// toISOString() is ALWAYS in UTC and sorts correctly as text. It's the format
// APIs and logs expect. Build fixed dates with Date.UTC so tests don't depend
// on the machine's time zone.
const meeting = new Date(Date.UTC(2026, 10, 13, 9, 30)); // month 10 = November!
console.log(meeting.toISOString()); // PREDICT #46

// PITFALL: months are 0-based (0 = January) and invalid days roll over:
console.log(new Date(Date.UTC(2026, 1, 30)).toISOString().slice(0, 10)); // PREDICT #47

// PITFALL: parsing. A date-only ISO string is treated as UTC, but a date-time
// WITHOUT 'Z' or an offset is treated as LOCAL time, so it differs per machine.
console.log(new Date('2026-11-13').toISOString()); // PREDICT #48
// AVOID: new Date('2026-11-13T09:30')        (local: CI and laptop disagree)
// PREFER: new Date('2026-11-13T09:30:00Z')   (explicit UTC)

// Format for humans with Intl.DateTimeFormat. ALWAYS pass a timeZone in code
// whose output you compare, or the result depends on where it runs:
const utcFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });
console.log(utcFormat.format(meeting)); // PREDICT #49
const tokyoTime = new Intl.DateTimeFormat('en-US', { timeStyle: 'short', timeZone: 'Asia/Tokyo' });
console.log(tokyoTime.format(meeting)); // PREDICT #50

// Note: the Temporal API (a modern replacement for Date) is not available in
// Node 22. Until then: Date + Intl, UTC everywhere, format at the edges.

// ----------------------------------------------------------------------------
section('10. BigInt (optional: recognize only)');
// ----------------------------------------------------------------------------
// You'll rarely need this in test code. Skim it so you recognize the `n`.
// Add `n` to make a BigInt. Exact at any size, integers only.
const big = 9_007_199_254_740_991n;
console.log(big + 2n); // PREDICT #51

// You can't mix BigInt and number without converting:
try {
  console.log(big + 1);
} catch (error) {
  console.log(error.name); // PREDICT #52
}
console.log(big + BigInt(1)); // PREDICT #53

console.log('Done. Now open exercises.js and practice from memory!');

/**
 * ============================================================================
 *  RECAP — say these out loud without looking:
 *    - One number type. Decimals are approximate: 0.1 + 0.2 !== 0.3.
 *      Compare with an explicit tolerance (toBeCloseTo), never EPSILON.
 *    - Money: compute in cents, format with Intl.NumberFormat at the end.
 *    - Intl output may contain no-break spaces: never hand-type it.
 *    - Number.isNaN / Number.isFinite, never the global isNaN.
 *    - Number(text) is strict ('' -> 0!), parseInt(text, 10) strips units.
 *    - toFixed returns a STRING.
 *    - Dates: Date.now() for durations, toISOString() for data, Date.UTC for
 *      fixed test dates, Intl.DateTimeFormat with an explicit timeZone.
 *
 *  In Playwright:
 *    // PREFER a web-first assertion on the text: it retries until it matches.
 *    await expect(page.getByTestId('cart-total')).toHaveText('$59.97');
 *    // Need the NUMBER? Poll, so it still retries (parsePrice: Exercise 1):
 *    await expect
 *      .poll(async () => parsePrice((await page.getByTestId('cart-total').textContent()) ?? ''))
 *      .toBeCloseTo(59.97, 2);
 *    // Make time deterministic:
 *    test.use({ timezoneId: 'Europe/Berlin', locale: 'de-DE' });
 *    await page.clock.setFixedTime(new Date('2026-11-13T09:30:00Z'));
 * ============================================================================
 */

/**
 * ============================================================================
 *  ANSWER KEY — check your predictions only AFTER running the file.
 * ============================================================================
 *   #1  number number
 *   #2  3.5 — there is no integer division
 *   #3  1 — the remainder
 *   #4  1024
 *   #5  30000
 *   #6  9007199254740991
 *   #7  9007199254740992 — wrong by 1! Beyond the safe range integers lose precision
 *   #8  0.30000000000000004
 *   #9  false
 *   #10 true — works only because 0.3 is close to 1
 *   #11 false — 1.1 + 2.2 is 3.3000000000000003; the gap is bigger than EPSILON
 *   #12 true true
 *   #13 59.97
 *   #14 NaN
 *   #15 number (yes, really)
 *   #16 Infinity -Infinity
 *   #17 true — misleading: 'hello' was converted to NaN first
 *   #18 false
 *   #19 true
 *   #20 true false false
 *   #21 true false
 *   #22 42 NaN 0 — the empty string becomes 0!
 *   #23 42
 *   #24 8
 *   #25 3.75
 *   #26 1 — parsing stopped at the comma. Remove separators first.
 *   #27 12 null null
 *   #28 3 -2 — Math.round rounds .5 towards +Infinity
 *   #29 2 3 -2
 *   #30 0.67 string
 *   #31 0.67
 *   #32 1 — not 1.01: 1.005 can't be stored exactly
 *   #33 5600 340
 *   #34 15 -1
 *   #35 100 0 42
 *   #36 1 6 (with 1000 rolls, almost surely)
 *   #37 36
 *   #38 $1,234.50
 *   #39 1.234,50 € (the space is a no-break space)
 *   #40 false — the expected string contains a normal space
 *   #41 true
 *   #42 true
 *   #43 87.5%
 *   #44 1.5M
 *   #45 number true
 *   #46 2026-11-13T09:30:00.000Z
 *   #47 2026-03-02 — "February 30" rolled over into March
 *   #48 2026-11-13T00:00:00.000Z
 *   #49 Nov 13, 2026
 *   #50 6:30 PM — the same moment in Tokyo (UTC+9). Some Node/ICU versions put
 *       a narrow no-break space before 'PM', another reason not to hand-type
 *       formatted text in assertions.
 *   #51 9007199254740993n — exact!
 *   #52 TypeError — you can't mix BigInt and number
 *   #53 9007199254740992n
 * ============================================================================
 */
