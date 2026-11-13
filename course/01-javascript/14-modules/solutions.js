/**
 * ============================================================================
 *  SOLUTIONS 14 — Modules
 * ============================================================================
 *  Run:  node course/01-javascript/14-modules/solutions.js
 *
 *  Exercises 1-3 are solved in solutions-module.js. Exercises 4-5 are below.
 *  Compare these with YOUR solutions. If yours is different but the tests pass,
 *  it may be just as good. Read the WHY comments to see the trade-offs.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
// A namespace import, so a missing export fails one test instead of crashing the file.
import * as mod from './solutions-module.js';

// Exercise 4
// WHY: a static import can't use a computed path, but import() can. The module
// namespace is a plain object of exports, so Object.keys lists the names.
// toSorted returns a new array and leaves the original alone (Lesson 08).
async function loadExportNames(moduleName) {
  const loadedModule = await import(`./utils/${moduleName}.js`);
  return Object.keys(loadedModule).toSorted((a, b) => a.localeCompare(b));
}

// Exercise 5
// WHY: import.meta.dirname is the folder of THIS file, so the result doesn't
// depend on where you ran `node` from. path.join adds the correct separator
// for the operating system.
function resolveFromHere(...segments) {
  return path.join(import.meta.dirname, ...segments);
}

// ----------------------------------------------------------------------------
// Self-check answers
//   Q1. A named export has one fixed name, so every file uses the same name,
//       editors can auto-import and rename it, and typos fail at load time. A
//       default export lets each importer pick its own name.
//   Q2. The imported module's console.log. Static imports are hoisted: imported
//       modules are loaded and run before any line of the importing file.
//   Q3. Each of the 4 worker processes loads its own copy of auth.js, so the
//       token is fetched (or missing) 4 times and never shared. Use a
//       worker-scoped fixture, or log in once in a setup project and save
//       storageState to a file that every test loads (Lesson 23).
//   Q4. Not a bug: ^1.65.0 allows any 1.x version from 1.65.0. CI probably ran
//       `npm install`, which can update. Commit package-lock.json and run
//       `npm ci`, which installs exactly the locked versions. (Pin the exact
//       version too if a Docker image must match it.)
//   Q5. devDependencies. It is only needed to develop and check the code, not
//       to run it. In a test-only repo almost everything is a devDependency.
//
// Review answers:
//   R1. You can await (e.g. a dynamic import or config loading) directly at
//       the top level. Before it existed people wrapped code in an async IIFE:
//       (async () => { ... })();
//   R2. Optional chaining plus a fallback: config.use?.trace ?? 'off'.
//   R3. One class per file keeps each page easy to find, import by name and
//       change on its own, and avoids one giant file every test depends on.
// ----------------------------------------------------------------------------

// ============================== TESTS ======================================
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
