# JavaScript & TypeScript Fundamentals for Playwright

A hands-on course covering the JavaScript and TypeScript you need to write, design and maintain modern Playwright tests. Every lesson is a runnable file, and every exercise is checked by tests.

The course teaches **current best practice only**. Outdated patterns appear only when they are labeled `AVOID` and paired with the modern `PREFER` alternative.

[Back to the project README](../README.md)

## Prerequisites

- Basic programming experience in any language. You know what a variable, a loop and a function are.
- Comfort with a terminal and a code editor. VS Code is recommended; the repo ships its settings and debug configurations.
- Node.js 22.18 or newer. `.nvmrc` pins the major version, so `nvm use` picks it up. Node 22.18+ runs `.ts` files directly, so there is no build step.

## Getting started

```bash
git clone <this-repo-url> playwright-lab
cd playwright-lab
npm ci                                   # installs TypeScript, ESLint and Playwright types
node course/javascript/01-variables-and-constants/lesson.js
```

All commands below run from the **repository root**.

## Curriculum

### Part 1: JavaScript

| #   | Lesson                                                             | You will learn                                                                          |
| --- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| 01  | [Variables & Constants](javascript/01-variables-and-constants/)    | `const` vs `let`, why `var` is outdated, block scope, TDZ, naming                       |
| 02  | [Data Types & Equality](javascript/02-data-types-and-equality/)    | Primitives vs objects, `===`, truthy/falsy, `??`, `?.`, copying values                  |
| 03  | [Strings](javascript/03-strings/)                                  | Template literals, essential methods, comparing, regex for assertions                   |
| 04  | [Numbers, Math & Dates](javascript/04-numbers-and-math/)           | Floating point, safe parsing, `Intl.NumberFormat`, dates and time zones                 |
| 05  | [Control Flow](javascript/05-control-flow/)                        | Guard clauses, early returns, ternaries, `switch` vs lookup objects                     |
| 06  | [Loops & Iteration](javascript/06-loops-and-iteration/)            | `for...of`, iterating objects, generators, `forEach` pitfalls                           |
| 07  | [Functions](javascript/07-functions/)                              | Arrows vs declarations, defaults, rest, options objects, pure functions                 |
| 08  | [Arrays](javascript/08-arrays/)                                    | `map`/`filter`/`reduce`, immutable `toSorted`/`with`, `Object.groupBy`, async callbacks |
| 09  | [Objects](javascript/09-objects/)                                  | Destructuring, spread, `Object.entries`, `Object.hasOwn`, deep copies                   |
| 10  | [Scope, Closures & `this`](javascript/10-scope-closures-and-this/) | Lexical scope, closures, factories, how `this` really works                             |
| 11  | [Classes](javascript/11-classes/)                                  | Fields, `#private`, static, composition, locator-based page objects                     |
| 12  | [Error Handling](javascript/12-error-handling/)                    | Custom errors, `cause`, `finally`, never swallowing errors                              |
| 13  | [Async JavaScript](javascript/13-async-javascript/)                | Event loop, `async/await`, parallel vs sequential, cancellation, wait for conditions    |
| 14  | [Modules](javascript/14-modules/)                                  | ES modules, named exports, dynamic `import()`, npm and semver basics                    |
| 15  | [Maps & Sets](javascript/15-maps-and-sets/)                        | When `Map` beats objects, Set operations, grouping and counting                         |
| 16  | [Clean Code](javascript/16-clean-code/)                            | Capstone: characterize, then refactor messy code; clean tests; lint and format          |

### Part 2: TypeScript

| #   | Lesson                                                                   | You will learn                                                                   |
| --- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| 17  | [TypeScript Basics](typescript/17-typescript-basics/)                    | Annotations vs inference, `unknown` vs `any`, literal types, `as const`          |
| 18  | [Types, Interfaces & Unions](typescript/18-types-interfaces-and-unions/) | `type` vs `interface`, narrowing, discriminated unions, type guards, `satisfies` |
| 19  | [Generics & Utility Types](typescript/19-generics-and-utility-types/)    | Generic functions, `keyof`, `Partial`/`Pick`/`Omit`/`Record`, mapped types       |
| 20  | [TypeScript for Playwright](typescript/20-typescript-for-playwright/)    | Structural typing, typed page objects, fixtures, typed test and API data         |

### Part 3: Applied

| #   | Lesson                                                               | You will learn                                                                 |
| --- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 21  | [Testing Fundamentals](applied/21-testing-fundamentals/)             | Write your own tests: Arrange-Act-Assert, isolation, determinism, hooks, mocks |
| 22  | [Node: Files, HTTP & Config](applied/22-node-files-http-and-config/) | `fetch` and JSON APIs, validating responses, `fs/promises`, `.env` config      |
| 23  | [Playwright Capstone](applied/23-playwright-capstone/)               | Build a real framework: page objects, fixtures, auth state, test data, traces  |

The capstone is a step-by-step guide. Its reference implementation lives in [`tests/capstone/`](../tests/capstone/).

## Lesson structure

Each lesson folder contains three files:

| File                            | Purpose                                                                                              |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `lesson.js` / `lesson.ts`       | Explanations and runnable examples, with numbered `PREDICT #N` prompts and an ANSWER KEY at the end. |
| `exercises.js` / `exercises.ts` | Exercises with `TODO` stubs, tests that check them, and self-check questions.                        |
| `solutions.js` / `solutions.ts` | Reference solutions with `WHY` comments and all the answers.                                         |

## How to study

These lessons are built on learning techniques with strong research support:

1. **Predict, then run.** Each example prints something and has a comment like `// PREDICT #4`. Write down your guess, run the file, then compare with the ANSWER KEY at the bottom of the file. Wrong guesses are the most valuable: the surprise makes the correct answer stick.
2. **Retrieval practice.** Close the lesson and solve the exercises from memory. Recalling something strengthens memory far more than re-reading it.
3. **Productive struggle.** Give each exercise at least 10 minutes before looking at the solution. Effort is what makes it stick.
4. **Compare and reflect.** If your solution differs from the reference, read the `WHY` comments. Both can be correct; learn the trade-offs.
5. **Interleaving.** Exercises reuse earlier concepts on purpose, so you practice telling ideas apart instead of repeating one at a time.
6. **Spaced repetition.** Answer the self-check questions again after 1 day, 3 days and 1 week. Track it in your copy of [PROGRESS.md](PROGRESS.md).

One lesson per day of about 45 minutes beats a whole weekend of cramming.

## Running

```bash
# Read and run a lesson
node course/javascript/01-variables-and-constants/lesson.js

# Work on the exercises of one lesson (tests fail until you solve them)
npm run course:check -- 01

# Compare with the reference solutions of that lesson
npm run course:check -- 01 --solutions

# See your progress across all lessons
npm run course:progress

# TypeScript lessons run the same way...
node course/typescript/17-typescript-basics/lesson.ts

# ...and must also pass the type-checker: tests can't see a wrong type
npm run course:typecheck
```

| Command                        | What it does                                                            |
| ------------------------------ | ----------------------------------------------------------------------- |
| `npm run course:check -- <NN>` | Runs the exercises of lesson `NN` (add `--solutions` for the reference) |
| `npm run course:progress`      | Prints passed tests per lesson                                          |
| `npm run course:exercises`     | Runs all exercises at once                                              |
| `npm run course:solutions`     | Runs all reference solutions (they must all pass)                       |
| `npm run course:typecheck`     | Type-checks the TypeScript lessons                                      |

Working inside `course/` instead? The same commands exist there without the prefix: `npm run check -- 01`, `npm run progress`, `npm run typecheck`.

To debug a lesson, open it in VS Code, set a breakpoint and choose **Debug current lesson file** in the Run and Debug panel.

## Reading test output

When you run exercises, Node's test runner prints one line per test:

```text
✔ 1. swap: returns values in swapped order (0.4ms)
✖ 2. makeCallbacks: each callback remembers its own index (0.6ms)
  Error: TODO
      at makeCallbacks (.../exercises.js:27:9)
```

- `✔` means the test passed. `✖` means it failed. Read the first lines under it.
- `Error: TODO` means you haven't written that solution yet.
- `AssertionError` shows what the test **expected** and what your code **actually** returned. The diff marks expected lines with `+` and actual lines with `-`.
- The `at ...` line tells you the file and line number where the failure happened.
- The summary at the end (`ℹ pass 3`, `ℹ fail 2`) counts all tests in the file.

Playwright's test output follows the same idea, so this is practice for reading real test reports.

## Syntax you'll see before it's taught

Some syntax appears in early lessons before the lesson that explains it. Read along for now. Each one gets its full explanation later.

| Syntax                             | Meaning                                                         | Taught in                             |
| ---------------------------------- | --------------------------------------------------------------- | ------------------------------------- |
| `` `Hello ${name}` ``              | Template literal: a string with values inserted                 | [03](javascript/03-strings/)          |
| `(x) => x * 2`                     | Arrow function: a short way to write a function                 | [07](javascript/07-functions/)        |
| `list.map((x) => x * 2)`           | Builds a new array by transforming every item                   | [08](javascript/08-arrays/)           |
| `{ ...object }`                    | Spread: copies the properties of an object                      | [09](javascript/09-objects/)          |
| `async` / `await`                  | Waits for an asynchronous result (like every Playwright action) | [13](javascript/13-async-javascript/) |
| `import { test } from 'node:test'` | Loads code from another module                                  | [14](javascript/14-modules/)          |

## Found a mistake?

Open an issue or a merge/pull request. Corrections to explanations, answer keys and tests are very welcome. See the contributing section of the [project README](../README.md#contributing).
