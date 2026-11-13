/**
 * ============================================================================
 *  LESSON 02 — Data Types & Equality
 * ============================================================================
 *  Run:       node course/01-javascript/02-data-types-and-equality/lesson.js
 *  Practice:  node course/01-javascript/02-data-types-and-equality/exercises.js
 *
 *  After this lesson you can:
 *    1. Name the 7 primitive types and explain how they differ from objects.
 *    2. Use typeof and Array.isArray correctly (and know the typeof null quirk).
 *    3. Always compare with === and explain why == is outdated.
 *    4. Predict truthy/falsy values and choose between ?? and ||.
 *    5. Read nested data safely with optional chaining (?.).
 *    6. Copy values vs references, and deep-copy with structuredClone.
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
section('1. Primitives vs objects');
// ----------------------------------------------------------------------------
// JavaScript has 7 PRIMITIVE types. They are simple, immutable values:
//   string, number, bigint, boolean, undefined, null, symbol
// Everything else is an OBJECT: plain objects, arrays, functions, dates, maps...

const primitives = ['text', 42, 10n, true, undefined, null, Symbol('id')];
// (.map runs a function on every item, .join glues the results: Lesson 08.)
console.log(primitives.map((item) => typeof item).join(', ')); // PREDICT #1

// Mental model: a primitive IS the value. An object is a box you point at.

// ----------------------------------------------------------------------------
section('2. typeof — and its famous quirk');
// ----------------------------------------------------------------------------
console.log(typeof 'hello'); // PREDICT #2
console.log(typeof 3.14); // PREDICT #3
console.log(typeof undefined); // PREDICT #4
console.log(typeof (() => {})); // PREDICT #5
console.log(typeof null); // PREDICT #6
console.log(typeof []); // PREDICT #7

// PREFER the precise checks:
const value = null;
console.log(value === null); // PREDICT #8
console.log(Array.isArray(['chromium'])); // PREDICT #9
const isObject = (input) => typeof input === 'object' && input !== null && !Array.isArray(input);
console.log(isObject({ a: 1 }), isObject(null), isObject([])); // PREDICT #10

// ----------------------------------------------------------------------------
section('3. Always use === (strict equality)');
// ----------------------------------------------------------------------------
// `==` converts types before comparing ("type coercion"). The rules are hard to
// remember and lead to surprises. AVOID every one of these:
console.log(0 == ''); // PREDICT #11
console.log('1' == 1); // PREDICT #12
console.log(null == undefined); // PREDICT #13
console.log([] == false); // PREDICT #14

// PREFER `===`: it compares type AND value. No surprises:
console.log(0 === ''); // PREDICT #15
console.log('1' === 1); // PREDICT #16

// Convert explicitly when you NEED to compare different types:
const inputFromForm = '42';
console.log(Number(inputFromForm) === 42); // PREDICT #17

// The one value not equal to itself:
console.log(NaN === NaN); // PREDICT #18
console.log(Number.isNaN(NaN)); // PREDICT #19
console.log(Object.is(NaN, NaN)); // PREDICT #20

// RULE: use === and !== everywhere. Never ==, never !=.

// ----------------------------------------------------------------------------
section('4. Truthy and falsy');
// ----------------------------------------------------------------------------
// In an `if`, every value becomes true or false. Only these are FALSY:
//   false, 0, -0, 0n, '', null, undefined, NaN
// Everything else is TRUTHY — including '0', 'false', [] and {}!
const falsyValues = [false, 0, -0, 0n, '', null, undefined, NaN];
// (.every asks "is this true for ALL items?": Lesson 08.)
console.log(falsyValues.every((item) => !item)); // PREDICT #21
console.log(Boolean('0'), Boolean([]), Boolean({})); // PREDICT #22

// PREFER explicit checks when 0 or '' are VALID values:
const items = [];
if (items.length === 0) console.log('empty list'); // PREDICT #23

// ----------------------------------------------------------------------------
section('5. null vs undefined');
// ----------------------------------------------------------------------------
// undefined -> "no value was given" (missing argument, missing property)
// null      -> "explicitly empty" (common in JSON and APIs)
const user = { name: 'Ada', middleName: null };
console.log(user.middleName); // PREDICT #24
console.log(user.age); // PREDICT #25

// BEST PRACTICE: pick ONE convention per codebase for "no value" and stick to
// it. Modern TypeScript code mostly uses `undefined` (optional properties `?:`
// and default parameters work with it), while JSON and many APIs send `null`.
// To handle "either one", use ?? or ?. (sections 6 and 7).

// ----------------------------------------------------------------------------
section('6. ?? vs || for default values');
// ----------------------------------------------------------------------------
// `||` falls back on ANY falsy value. `??` falls back only on null/undefined.
const settings = { retries: 0, title: '' };

// AVOID: || destroys valid falsy values.
console.log(settings.retries || 3); // PREDICT #26
console.log(settings.title || 'Untitled'); // PREDICT #27

// PREFER: ?? keeps 0 and ''.
console.log(settings.retries ?? 3); // PREDICT #28
console.log(settings.timeout ?? 30_000); // PREDICT #29

// EXCEPTION: environment variables are always strings (or undefined). An
// empty BASE_URL='' is almost always a misconfiguration, so `||` is the right
// choice there: it falls back for both undefined AND ''.
const env = { BASE_URL: '' }; // imagine process.env in CI
console.log(env.BASE_URL ?? 'http://localhost:3000'); // PREDICT #30
console.log(env.BASE_URL || 'http://localhost:3000'); // PREDICT #31

// ----------------------------------------------------------------------------
section('7. Optional chaining ?.');
// ----------------------------------------------------------------------------
const response = { data: { user: { name: 'Linus' } } };
const empty = {};

// AVOID the old && chain:
const oldWay = empty.data && empty.data.user && empty.data.user.name;
console.log(oldWay); // PREDICT #32

// PREFER ?. — stops and returns undefined at the first null/undefined:
console.log(response.data?.user?.name); // PREDICT #33
console.log(empty.data?.user?.name); // PREDICT #34
console.log(empty.data?.user?.name ?? 'Anonymous'); // PREDICT #35

// Works for methods and indexes too:
console.log(empty.getName?.()); // PREDICT #36
console.log(empty.tags?.[0]); // PREDICT #37

// WARNING: don't sprinkle ?. everywhere. Use it only where a value may really
// be missing; otherwise it hides bugs that should crash loudly.

// ----------------------------------------------------------------------------
section('8. Copying: value vs reference');
// ----------------------------------------------------------------------------
// Primitives are copied BY VALUE:
const a = 'chromium';
let b = a;
b = 'firefox';
console.log(a, b); // PREDICT #38

// Objects are shared BY REFERENCE: two labels, ONE box.
const original = { browser: 'chromium', options: { headless: true } };
const sameBox = original;
sameBox.browser = 'webkit';
console.log(original.browser); // PREDICT #39

// Comparing objects compares the BOX, not the contents:
console.log({ id: 1 } === { id: 1 }); // PREDICT #40
console.log(sameBox === original); // PREDICT #41

// Spread makes a SHALLOW copy: nested objects are still shared.
const shallow = { ...original };
shallow.options.headless = false;
console.log(original.options.headless); // PREDICT #42

// ----------------------------------------------------------------------------
section('9. Deep copy with structuredClone');
// ----------------------------------------------------------------------------
// AVOID the old trick JSON.parse(JSON.stringify(x)): it drops undefined,
// functions and turns Dates into strings.
const withDate = { createdAt: new Date(0), note: undefined };
const jsonCopy = JSON.parse(JSON.stringify(withDate));
console.log(typeof jsonCopy.createdAt, 'note' in jsonCopy); // PREDICT #43

// PREFER structuredClone (built in since Node 17) for DATA: a real deep copy.
const deep = structuredClone(withDate);
console.log(deep.createdAt instanceof Date, 'note' in deep); // PREDICT #44
const fullCopy = structuredClone(original);
fullCopy.options.headless = true;
console.log(original.options.headless); // PREDICT #45

// LIMITS: structuredClone copies DATA only.
//   - Functions can't be cloned: it throws a DataCloneError.
//   - Class instances lose their class: methods are gone.
//   - Never clone a Playwright Page or Locator; pass them around instead.
try {
  structuredClone({ onRetry: () => 'retry' });
} catch (error) {
  console.log(error.name); // PREDICT #46
}
class Credentials {
  describe() {
    return 'creds';
  }
}
const clonedInstance = structuredClone(new Credentials());
console.log(clonedInstance instanceof Credentials, typeof clonedInstance.describe); // PREDICT #47

console.log('Done. Now open exercises.js and practice from memory!');

/**
 * ============================================================================
 *  RECAP — say these out loud without looking:
 *    - 7 primitives (copied by value) vs objects (shared by reference).
 *    - typeof null is 'object': check null with === null, arrays with
 *      Array.isArray.
 *    - Always === and !==. Convert types explicitly with Number()/String().
 *    - Falsy: false, 0, -0, 0n, '', null, undefined, NaN. Everything else is
 *      truthy.
 *    - ?? for defaults (keeps 0 and ''), || for env vars, ?. for values that
 *      may be missing.
 *    - Spread = shallow copy, structuredClone = deep copy of plain data.
 *
 *  In Playwright:
 *    await expect(page.getByRole('listitem')).toHaveCount(3); // retries until true
 *    expect(user).toEqual({ ... });  // toEqual compares CONTENTS (deep)
 *    expect(status).toBe(200);       // toBe uses Object.is (strict, like ===)
 *    const baseURL = process.env.BASE_URL || 'http://localhost:3000';
 * ============================================================================
 */

/**
 * ============================================================================
 *  ANSWER KEY — check your predictions only AFTER running the file.
 * ============================================================================
 *   #1  string, number, bigint, boolean, undefined, object, symbol
 *       (null reports 'object': see #6)
 *   #2  string
 *   #3  number
 *   #4  undefined
 *   #5  function
 *   #6  object — a bug from 1995 that can never be fixed
 *   #7  object — arrays are objects
 *   #8  true
 *   #9  true
 *   #10 true false false
 *   #11 true  (both convert to 0)
 *   #12 true  ('1' converts to 1)
 *   #13 true
 *   #14 true  ([] becomes '' becomes 0, false becomes 0)
 *   #15 false
 *   #16 false
 *   #17 true
 *   #18 false — NaN is never equal to anything, even itself
 *   #19 true
 *   #20 true
 *   #21 true
 *   #22 true true true — '0', [] and {} are all truthy
 *   #23 empty list
 *   #24 null       (we know there is none)
 *   #25 undefined  (nobody told us)
 *   #26 3 — the bug: we asked for 0 retries!
 *   #27 Untitled
 *   #28 0
 *   #29 30000
 *   #30 '' is printed as an empty line — ?? keeps the empty string
 *   #31 http://localhost:3000
 *   #32 undefined
 *   #33 Linus
 *   #34 undefined
 *   #35 Anonymous
 *   #36 undefined — the method doesn't exist, so it is not called
 *   #37 undefined
 *   #38 chromium firefox
 *   #39 webkit — both labels point at the same object
 *   #40 false — two different boxes
 *   #41 true
 *   #42 false — the nested `options` object is shared
 *   #43 string false
 *   #44 true true
 *   #45 false — unchanged, the deep copy is independent
 *   #46 DataCloneError
 *   #47 false undefined — the clone is a plain object without methods
 * ============================================================================
 */
