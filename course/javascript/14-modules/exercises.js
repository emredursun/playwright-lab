/**
 * ============================================================================
 *  EXERCISES 14 — Modules
 * ============================================================================
 *  Run:  node course/javascript/14-modules/exercises.js
 *
 *  How to work:
 *    1. Exercises 1-3 are in exercise-module.js. Exercises 4-5 are below.
 *       Replace each TODO with your solution.
 *    2. Run this file. Every test must pass (✔). Failing tests show what's wrong.
 *    3. Answer the self-check questions in your head or on paper.
 *    4. Only THEN compare with solutions.js and solutions-module.js.
 *
 *  Struggling a bit is good: it's how memory is built. Give each exercise at
 *  least 10 minutes before you peek.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
// A namespace import, so a missing export fails one test instead of crashing the file.
import * as mod from './exercise-module.js';

// ----------------------------------------------------------------------------
// Exercise 4 — Dynamic import
// Load './utils/<moduleName>.js' at runtime and return the names of its exports,
// sorted alphabetically the way humans read (localeCompare, Lesson 03).
// Example: await loadExportNames('math')  ->  [ 'add', 'clamp', 'PI' ]
// Hint: import() returns a Promise of the module namespace object.
// ----------------------------------------------------------------------------
async function loadExportNames(moduleName) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 5 (bonus) — Paths relative to this file
// Return the absolute path of a file inside THIS lesson folder, whatever the
// current working directory is.
// Example: resolveFromHere('data', 'test-users.json')
//          -> '/.../course/javascript/14-modules/data/test-users.json'
// Hint: import.meta.dirname and path.join (rest parameters from Lesson 07).
// ----------------------------------------------------------------------------
function resolveFromHere(...segments) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Self-check questions (answer them, then check solutions.js)
//   Q1. Why are named exports usually better than a default export?
//   Q2. What prints first when a file imports a module that calls console.log
//       at its top level, and why?
//   Q3. A teammate stores an auth token in a module-level `let token` in
//       auth.js so "all tests can reuse it". Tests run with 4 Playwright
//       workers. What happens, and what would you use instead?
//   Q4. CI installed @playwright/test 1.66.0 although package.json says
//       "^1.65.0" and you have 1.65.0 locally. Is that a bug? Which command
//       and file make CI install exactly your version?
//   Q5. Should eslint go in "dependencies" or "devDependencies" in a test
//       repo? Why?
//
// Review (earlier lessons):
//   R1. (Lesson 13) Why is top-level await convenient in a module, and what
//       did people write before it existed?
//   R2. (Lesson 09) How do you read a value from a nested config without
//       crashing when a level is missing?
//   R3. (Lesson 11) Why do page objects usually get their own module file?
// ----------------------------------------------------------------------------

// ============================ TESTS (don't edit) ============================
test('1. named exports replace the default export', () => {
  assert.equal(mod.DEFAULT_TIMEOUT_MS, 30_000);
  assert.equal(mod.BASE_URL, 'https://playwright.dev');
  assert.equal(mod.default, undefined, 'remove the default export');
});

test('2. toSlug is re-exported from utils/strings.js', () => {
  assert.equal(typeof mod.toSlug, 'function', 'export toSlug');
  assert.equal(mod.toSlug('Login Works!'), 'login-works');
});

test('3. recordRun updates the live runCount binding', () => {
  const before = mod.runCount;
  mod.recordRun();
  mod.recordRun();
  assert.equal(mod.runCount, before + 2);
});

test('4. loadExportNames: lists the exports of a module loaded at runtime', async () => {
  assert.deepEqual(await loadExportNames('math'), ['add', 'clamp', 'PI']);
  assert.deepEqual(await loadExportNames('strings'), ['capitalize', 'joinWords', 'slugify']);
});

test('5. resolveFromHere (bonus): absolute paths inside this folder', () => {
  const file = resolveFromHere('data', 'test-users.json');
  assert.ok(path.isAbsolute(file));
  assert.ok(file.endsWith(path.join('14-modules', 'data', 'test-users.json')));
  assert.ok(existsSync(file));
});
