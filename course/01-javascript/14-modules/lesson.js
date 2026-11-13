/**
 * ============================================================================
 *  LESSON 14 — Modules (import / export)
 * ============================================================================
 *  Run:       node course/01-javascript/14-modules/lesson.js
 *  Practice:  node course/01-javascript/14-modules/exercises.js
 *
 *  After this lesson you can:
 *    1. Explain why ES modules (ESM) replaced CommonJS (require).
 *    2. Choose named exports over default exports, and say why.
 *    3. Use renaming, namespace imports, dynamic import() and top-level await.
 *    4. Explain that modules run ONCE and share state (singletons).
 *    5. Find files relative to the current module with import.meta.
 *    6. Read a package.json: scripts, dependencies, semver ranges, lockfile.
 *
 *  Files used by this lesson (open them side by side!):
 *    utils/math.js, utils/strings.js, utils/index.js (barrel), config.js,
 *    counter.js, logger.js, legacy.cjs, data/test-users.json
 *
 *  How to study this file:
 *    - Every example has a numbered PREDICT comment. Write down your guess,
 *      run the file, then check the ANSWER KEY at the bottom.
 *    - PREDICT #1 is special: what is the very FIRST line this file prints?
 *      (Look at config.js.)
 *    - Then close this file and solve exercises.js from memory.
 * ============================================================================
 */

// What is the very first line this file prints, and why?
// PREDICT #1
import path from 'node:path';
import { add, clamp, PI as CIRCLE_PI } from './utils/math.js';
import * as strings from './utils/strings.js';
import createLogger from './logger.js';
import { config } from './config.js';
import { count, increment } from './counter.js';
import legacy, { legacyGreet } from './legacy.cjs';
import testUsers from './data/test-users.json' with { type: 'json' };

const section = (title) => console.log(`\n--- ${title} ---`);

// ----------------------------------------------------------------------------
section('1. ES modules vs CommonJS');
// ----------------------------------------------------------------------------
// AVOID in new code (CommonJS):
//   const { add } = require('./utils/math');
//   module.exports = { add };
// PREFER (ES modules, the JavaScript standard, used by browsers AND Node):
//   import { add } from './utils/math.js';
//   export function add() {}
//
// Why ESM wins: it's the official standard, imports are static (tools can
// analyze them, remove unused code and autocomplete), it supports top-level
// await, and it's always in strict mode.
//
// ESM can still import old CommonJS files. Their module.exports becomes the
// default import:
console.log(legacy.legacyGreet('ESM')); // PREDICT #2
// Node also DETECTS most CommonJS named exports, so this works too (see the
// import list at the top):
console.log(legacyGreet('named import')); // PREDICT #3

// And the other direction: since Node 22.12, CommonJS code can `require()` an
// ES module, as long as that module has no top-level await. Useful when an
// older tool needs a package that only ships ESM.

// ----------------------------------------------------------------------------
section('2. Named exports (preferred)');
// ----------------------------------------------------------------------------
console.log(add(2, 3)); // PREDICT #4
console.log(clamp(150, 0, 100)); // PREDICT #5

// Why named exports are the better default:
//   - The name is fixed, so every file uses the same name. Easy to search.
//   - Editors can auto-import them and rename them safely everywhere.
//   - A typo is an error at load time: import { ad } from ... -> SyntaxError.

// ----------------------------------------------------------------------------
section('3. Default exports (use sparingly)');
// ----------------------------------------------------------------------------
// The importer picks ANY name for a default export. That's the problem:
// one project ends up with createLogger, makeLogger, logger... for the same thing.
const log = createLogger('lesson-14');
log('default exports work'); // PREDICT #6

// AVOID: export default { add, clamp }  (an object pretending to be a module)
// PREFER: export function add() {} ... and let the importer pick what it needs.

// ----------------------------------------------------------------------------
section('4. Renaming with `as` and namespace imports');
// ----------------------------------------------------------------------------
// `PI as CIRCLE_PI` (see the import list) renames an import to avoid a clash
// or to make the meaning clearer in this file.
console.log(CIRCLE_PI); // PREDICT #7

// `import * as strings` puts every export of a module on one object:
console.log(strings.capitalize('playwright')); // PREDICT #8
console.log(strings.joinWords('Login Page', 'Happy Path')); // PREDICT #9
console.log(Object.keys(strings).toSorted((a, b) => a.localeCompare(b))); // PREDICT #10
// Note: SEPARATOR is not exported, so it's private to strings.js.

// ----------------------------------------------------------------------------
section('5. Imports are live and read-only');
// ----------------------------------------------------------------------------
console.log(count); // PREDICT #11
increment();
increment();
console.log(count); // PREDICT #12

try {
  // @ts-expect-error -- assigning to an import on purpose
  count = 100; // only counter.js may change `count`
} catch (error) {
  console.log(error.name); // PREDICT #13
}

// ----------------------------------------------------------------------------
section('6. Modules run once: shared singletons');
// ----------------------------------------------------------------------------
// Importing config.js again (here with a dynamic import) does NOT run it again.
// "[config.js] evaluated" was printed only once, at the very top.
const configAgain = await import('./config.js');
console.log(configAgain.config === config); // PREDICT #14

// That shared object is a singleton. Handy for read-only settings, but
// mutating it affects EVERY importer, so treat shared module state as read-only.
console.log(config.timeout); // PREDICT #15

// CAVEAT for Playwright: "once" means once PER PROCESS. Playwright runs tests
// in several worker processes, and each worker loads its own copy of every
// module. A module-level token, counter or cache is NOT shared between
// workers (or with globalSetup). To share, use worker-scoped fixtures
// (Lesson 23), files such as a saved storageState, or environment variables.

// ----------------------------------------------------------------------------
section('7. import.meta: where am I?');
// ----------------------------------------------------------------------------
// AVOID (CommonJS only, undefined in ESM): __dirname, __filename
// PREFER: import.meta.dirname and import.meta.filename (Node 20.11+)
console.log(path.basename(import.meta.dirname)); // PREDICT #16
console.log(path.basename(import.meta.filename)); // PREDICT #17
console.log(import.meta.url.startsWith('file://')); // PREDICT #18

// Build paths relative to THIS file, not the current working directory, so
// the code works no matter where you run `node` from:
const dataFile = path.join(import.meta.dirname, 'data', 'test-users.json');
// path.relative prints data/test-users.json on macOS/Linux and
// data\test-users.json on Windows, so we split on the OS separator:
console.log(path.relative(import.meta.dirname, dataFile).split(path.sep)); // PREDICT #19

// JSON can be imported directly with an import attribute (see the import list):
console.log(testUsers.map((user) => user.username)); // PREDICT #20

// ----------------------------------------------------------------------------
section('8. Dynamic import() and top-level await');
// ----------------------------------------------------------------------------
// import() loads a module ON DEMAND and returns a Promise. Use it when the
// module is only sometimes needed, or when its path is decided at runtime.
const moduleName = 'math';
const mathModule = await import(`./utils/${moduleName}.js`);
console.log(mathModule.add(10, 20)); // PREDICT #21

// The `await` above is TOP-LEVEL await: allowed directly in ES modules,
// no async wrapper function needed.
// AVOID: (async () => { const m = await import('./x.js'); })();

// ----------------------------------------------------------------------------
section('9. File extensions are required, and barrels');
// ----------------------------------------------------------------------------
// In ESM, relative imports must include the extension. Node does not guess.
try {
  await import('./utils/math'); // missing ".js"
} catch (error) {
  console.log(error.code); // PREDICT #22
}

// A barrel (utils/index.js) re-exports several modules from one entry point:
const barrel = await import('./utils/index.js');
console.log(Object.keys(barrel).toSorted((a, b) => a.localeCompare(b))); // PREDICT #23
// Pros and cons of barrels are explained inside utils/index.js.

// ----------------------------------------------------------------------------
section('10. package.json, npm and semver');
// ----------------------------------------------------------------------------
// Every Node project is described by package.json. Open the one at the repo
// root next to this file. The parts you'll maintain in a test framework:
//
//   "scripts"          -> named commands: `npm run test:ui` runs the
//                         "test:ui" script. `npm test` is a shortcut for "test".
//   "dependencies"     -> needed to RUN the code (rare in a test-only repo).
//   "devDependencies"  -> needed to develop and test: @playwright/test,
//                         typescript, eslint. Install with `npm i -D <name>`.
//   "engines"          -> which Node versions the project supports.
//   package-lock.json  -> the EXACT versions installed. Commit it, so CI and
//                         teammates install the same thing.
//
//   npm install  -> adds or updates packages and may rewrite the lockfile.
//   npm ci       -> clean install EXACTLY what the lockfile says (use in CI).
//   npx <tool>   -> run a package's command, e.g. `npx playwright show-report`.
//
// Reading the root package.json is just a JSON import:
const rootPackage = (await import('../../../package.json', { with: { type: 'json' } })).default;
console.log(Object.hasOwn(rootPackage.devDependencies, '@playwright/test')); // PREDICT #24

// Semantic versioning: MAJOR.MINOR.PATCH, e.g. 1.65.0
//   PATCH (1.65.1): bug fixes          MINOR (1.66.0): new features, compatible
//   MAJOR (2.0.0):  breaking changes
// Ranges in package.json:
//   "^1.65.0" -> >=1.65.0 <2.0.0   (default: any compatible minor or patch)
//   "~1.65.0" -> >=1.65.0 <1.66.0  (patches only)
//   "1.65.0"  -> exactly that version
//   "^0.3.1"  -> >=0.3.1 <0.4.0    (below 1.0, every minor may break)
// A tiny ILLUSTRATION of the caret rule (real tools use the `semver` package):
function allowedByCaret(version, range) {
  const [major, minor, patch] = range.replace('^', '').split('.').map(Number);
  const [vMajor, vMinor, vPatch] = version.split('.').map(Number);
  if (vMajor !== major) return false;
  if (major === 0 && vMinor !== minor) return false;
  return vMinor > minor || (vMinor === minor && vPatch >= patch);
}
console.log(allowedByCaret('1.66.0', '^1.65.0'), allowedByCaret('2.0.0', '^1.65.0')); // PREDICT #25
console.log(allowedByCaret('0.4.0', '^0.3.1')); // PREDICT #26

console.log('\nDone. Now open exercises.js and practice from memory!');

/**
 * ============================================================================
 *  RECAP — say these out loud without looking:
 *    - Use ES modules (import/export). CommonJS (require) is legacy.
 *    - Prefer named exports. A default export lets every importer invent a name.
 *    - Relative imports need the file extension: './utils/math.js'.
 *    - Imports are hoisted, live and read-only. A module runs only once.
 *    - import.meta.dirname replaces __dirname. import() loads on demand.
 *    - Top-level await works in modules. No async IIFE wrapper needed.
 *    - "Once" = once per process: Playwright workers each get their own copy.
 *    - Commit the lockfile, use `npm ci` in CI, devDependencies for tooling.
 *
 *  In Playwright:
 *    import { test, expect } from '@playwright/test';   // named imports
 *    import { LoginPage } from '../pages/login-page';   // your page objects
 *    export default defineConfig({ ... });              // framework ENTRY POINTS
 *                                                       // expect a default export:
 *                                                       // the config, globalSetup /
 *                                                       // globalTeardown files and
 *                                                       // custom reporters
 *    (In .ts files Playwright resolves imports without extensions for you.)
 * ============================================================================
 */

/**
 * ============================================================================
 *  ANSWER KEY — check your predictions only AFTER running the file.
 * ============================================================================
 *   #1   [config.js] evaluated   (static imports are HOISTED: config.js is loaded and run BEFORE any line of this file)
 *   #2   Hello from CommonJS, ESM
 *   #3   Hello from CommonJS, named import
 *   #4   5
 *   #5   100
 *   #6   [lesson-14] default exports work
 *   #7   3.14159
 *   #8   Playwright
 *   #9   login-page-happy-path
 *   #10  [ 'capitalize', 'joinWords', 'slugify' ]
 *   #11  0
 *   #12  2  (a live view of the variable in counter.js)
 *   #13  TypeError
 *   #14  true
 *   #15  30000
 *   #16  14-modules
 *   #17  lesson.js
 *   #18  true
 *   #19  [ 'data', 'test-users.json' ]
 *   #20  [ 'standard_user', 'admin_user' ]
 *   #21  30
 *   #22  ERR_MODULE_NOT_FOUND
 *   #23  [ 'add', 'clamp', 'PI', 'slugify' ]
 *   #24  true
 *   #25  true false
 *   #26  false
 * ============================================================================
 */
