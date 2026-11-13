/**
 * ============================================================================
 *  LESSON 10 — Scope, Closures & `this`
 * ============================================================================
 *  Run:       node course/01-javascript/10-scope-closures-and-this/lesson.js
 *  Practice:  node course/01-javascript/10-scope-closures-and-this/exercises.js
 *
 *  After this lesson you can:
 *    1. Name the four kinds of scope: global, module, function and block.
 *    2. Explain lexical scope: WHERE code is written decides what it can see.
 *    3. Use closures for private state, factories and memoization.
 *    4. Predict what `this` is, and fix a method that "lost" its `this`.
 *
 *  How to study this file:
 *    - Every example has a numbered PREDICT comment. Write down your guess,
 *      run the file, then check the ANSWER KEY at the bottom.
 *    - Then close this file and solve exercises.js from memory.
 * ============================================================================
 */

const section = (title) => console.log(`\n--- ${title} ---`);

// ----------------------------------------------------------------------------
section('1. Four kinds of scope');
// ----------------------------------------------------------------------------
// Mental model: scopes are nested BOXES. Code can look outward (into the boxes
// around it) but never inward.
//
//   global scope   -> globalThis, console, setTimeout ... (shared by everything)
//   module scope   -> top-level const/let in THIS file (private to the file)
//   function scope -> everything declared inside a function
//   block scope    -> let/const inside { } of if, for, while, or a bare block

const moduleLevel = 'visible in this whole file';

function outer() {
  const functionLevel = 'visible inside outer()';
  if (true) {
    const blockLevel = 'visible inside this if-block';
    console.log(moduleLevel, '|', functionLevel, '|', blockLevel); // PREDICT #1
  }
  console.log(typeof blockLevel); // PREDICT #2
}
outer();

// In an ES module, top-level variables are NOT added to the global object:
console.log('moduleLevel' in globalThis); // PREDICT #3

// BEST PRACTICE: keep every variable in the smallest scope that needs it.
// Fewer things in scope means fewer things can clash or change by accident.

// ----------------------------------------------------------------------------
section('2. Lexical scope: where you WRITE code matters');
// ----------------------------------------------------------------------------
// A function sees the variables around the place where it was DEFINED,
// not around the place where it is CALLED.
const environment = 'staging';

function printEnvironment() {
  console.log(environment);
}

function runInProduction() {
  const environment = 'production'; // shadows the outer one, but only in here
  printEnvironment();
}
runInProduction(); // PREDICT #4

// AVOID shadowing (reusing an outer name for an inner variable). It works, but
// readers easily mix the two up. Give the inner variable a different name.

// ----------------------------------------------------------------------------
section('3. Closures: functions remember their birthplace');
// ----------------------------------------------------------------------------
// A closure is a function plus the variables it captured from its scope.
// Those variables stay alive as long as the function exists.

function createCounter() {
  let count = 0; // nobody outside can touch this directly
  return {
    increment: () => ++count,
    reset: () => {
      count = 0;
    },
    get value() {
      return count;
    },
  };
}

const counter = createCounter();
counter.increment();
counter.increment();
console.log(counter.value); // PREDICT #5
console.log(counter.count); // PREDICT #6

const otherCounter = createCounter(); // a fresh, independent `count`
console.log(otherCounter.value); // PREDICT #7

// ----------------------------------------------------------------------------
section('4. Factory functions: configure once, use many times');
// ----------------------------------------------------------------------------
function createUrlBuilder(baseUrl) {
  return (path) => new URL(path, baseUrl).href;
}

const toPlaywrightDocs = createUrlBuilder('https://playwright.dev');
console.log(toPlaywrightDocs('/docs/intro')); // PREDICT #8

function createLogger(prefix) {
  return (message) => console.log(`[${prefix}] ${message}`);
}
const logSetup = createLogger('setup');
logSetup('browser launched'); // PREDICT #9

// ----------------------------------------------------------------------------
section('5. Memoization: a closure as a cache (optional: recognize only)');
// ----------------------------------------------------------------------------
// OPTIONAL: you will rarely write this in test code, but you'll meet it in
// libraries. Skim it, then move on.
// Memoization saves results so the same slow work is never done twice.
function memoize(fn) {
  const cache = new Map(); // captured by the returned function
  return (input) => {
    if (!cache.has(input)) {
      cache.set(input, fn(input));
    }
    return cache.get(input);
  };
}

let slowCalls = 0;
const square = memoize((n) => {
  slowCalls += 1;
  return n * n;
});
console.log(square(4), square(4), square(5)); // PREDICT #10
console.log(slowCalls); // PREDICT #11

// ----------------------------------------------------------------------------
section('6. Closures in loops: a quick recap');
// ----------------------------------------------------------------------------
// From Lesson 01: both `for (let i = 0; ...)` and `for (const x of ...)`
// create a FRESH binding for every iteration, so each closure captures a
// different value. (`const` works in for...of because each iteration gets a
// new variable; it is never reassigned.)
const greeters = [];
for (const name of ['ada', 'linus']) {
  greeters.push(() => `hi ${name}`);
}
console.log(greeters.map((greet) => greet())); // PREDICT #12

// ----------------------------------------------------------------------------
section('7. `this`: decided by HOW a function is called');
// ----------------------------------------------------------------------------
// Rule of thumb for regular functions: `this` is whatever is LEFT OF THE DOT
// at the moment of the call.
const testCase = {
  title: 'login works',
  describe() {
    return `Test: ${this.title}`;
  },
};
console.log(testCase.describe()); // PREDICT #13

// Detach the method and the "left of the dot" is gone.
// In modules (strict mode) `this` becomes undefined.
const detached = testCase.describe;
try {
  detached();
} catch (error) {
  console.log(error.name); // PREDICT #14
}

// Fix 1: bind creates a new function with `this` locked in place.
const bound = testCase.describe.bind(testCase);
console.log(bound()); // PREDICT #15

// Fix 2: wrap the call in an arrow function, so the call keeps its dot.
const wrapped = () => testCase.describe();
console.log(wrapped()); // PREDICT #16

// ----------------------------------------------------------------------------
section('8. Arrow functions inherit `this`');
// ----------------------------------------------------------------------------
// Arrow functions have NO own `this`. They use the `this` of the code around
// them. This makes them perfect for callbacks inside methods.
const suite = {
  name: 'checkout',
  tests: ['add item', 'pay'],
  // AVOID (outdated):
  //   listOld() {
  //     var self = this;
  //     return this.tests.map(function (t) { return self.name + ': ' + t; });
  //   },
  // PREFER: an arrow callback sees the method's `this` directly.
  list() {
    return this.tests.map((test) => `${this.name}: ${test}`);
  },
};
console.log(suite.list()); // PREDICT #17

// The flip side: DON'T use arrow functions as object methods that need `this`.
const broken = {
  title: 'oops',
  describe: () => typeof this, // `this` here is the module's: undefined
};
console.log(broken.describe()); // PREDICT #18

console.log('Done. Now open exercises.js and practice from memory!');

/**
 * ============================================================================
 *  RECAP — say these out loud without looking:
 *    - Scopes nest: block inside function inside module inside global.
 *    - Lexical scope: a function sees variables where it is DEFINED.
 *    - A closure keeps captured variables alive -> private state, factories,
 *      memoization.
 *    - Regular function: `this` = what's left of the dot at call time.
 *    - Arrow function: no own `this`, it inherits it. Great for callbacks,
 *      wrong for methods.
 *    - `var self = this` is outdated. Use an arrow callback instead.
 *
 *  In Playwright:
 *    // A fixture-like factory: the closure remembers `page`.
 *    const createLoginHelper = (page) => async (user) => {
 *      await page.getByLabel('Email').fill(user.email);
 *    };
 *    // Passing a method as a callback? Wrap it so it keeps its `this`:
 *    await test.step('log in', () => loginPage.login(user));
 * ============================================================================
 */

/**
 * ============================================================================
 *  ANSWER KEY — check your predictions only AFTER running the file.
 * ============================================================================
 *   #1   visible in this whole file | visible inside outer() | visible inside this if-block
 *   #2   undefined  (blockLevel doesn't exist outside its block)
 *   #3   false
 *   #4   staging
 *   #5   2
 *   #6   undefined  (truly private)
 *   #7   0
 *   #8   https://playwright.dev/docs/intro
 *   #9   [setup] browser launched
 *   #10  16 16 25
 *   #11  2
 *   #12  [ 'hi ada', 'hi linus' ]
 *   #13  Test: login works
 *   #14  TypeError
 *   #15  Test: login works
 *   #16  Test: login works
 *   #17  [ 'checkout: add item', 'checkout: pay' ]
 *   #18  undefined
 * ============================================================================
 */
