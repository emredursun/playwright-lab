# Playwright Lab

[![CI](https://github.com/emredursun/playwright-lab/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/emredursun/playwright-lab/actions/workflows/playwright.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A learning lab for [Playwright Test](https://playwright.dev) with TypeScript. It contains:

- **A JavaScript & TypeScript fundamentals course** ([`course/`](course/)): 23 hands-on lessons with runnable examples, exercises checked by tests, and reference solutions. It teaches only modern best practice, with a Playwright connection in every lesson.
- **A Playwright test suite** ([`tests/`](tests/)), including the capstone: a small but realistic framework with page objects, fixtures, typed test data and authentication.

Use it to learn, as a reference while you build your own framework, or to onboard colleagues.

## Quick start

Requires [Node.js](https://nodejs.org) 22.18 or newer (see [`.nvmrc`](.nvmrc)).

```bash
git clone https://github.com/emredursun/playwright-lab.git
cd playwright-lab
npm ci
npx playwright install --with-deps   # downloads the browsers

npm test                             # run the Playwright tests
node course/01-javascript/01-variables-and-constants/lesson.js   # start the course
```

Then follow the [course README](course/README.md).

## Repository layout

```text
.
├── course/                 # JS & TS fundamentals course
│   ├── 01-javascript/      # Part 1: lessons 01–16
│   ├── 02-typescript/      # Part 2: lessons 17–20
│   ├── 03-applied/         # Part 3: testing, Node, Playwright capstone (21–23)
│   └── scripts/            # progress and per-lesson check helpers
├── tests/                  # Playwright tests (capstone reference implementation)
├── playwright.config.ts    # Playwright configuration
├── eslint.config.mjs       # ESLint flat config (typescript-eslint + eslint-plugin-playwright)
├── tsconfig.json           # type-check settings for tests/ and the config
├── .github/workflows/      # GitHub Actions CI
└── .gitlab-ci.yml          # GitLab CI
```

## Scripts

| Command                           | What it does                                                             |
| --------------------------------- | ------------------------------------------------------------------------ |
| `npm test`                        | Run all Playwright tests in every browser                                |
| `npm run test:chromium`           | Run the tests in Chromium only (fastest feedback)                        |
| `npm run test:ui`                 | Open Playwright's UI mode to run, watch and debug tests                  |
| `npm run test:debug`              | Run tests step by step with the Playwright Inspector                     |
| `npm run test:headed`             | Run tests with visible browser windows                                   |
| `npm run report`                  | Open the last HTML report                                                |
| `npm run codegen`                 | Record actions in a browser and generate test code                       |
| `npm run lint` / `lint:fix`       | Lint with ESLint (catches missing `await`s and Playwright anti-patterns) |
| `npm run format` / `format:check` | Format with Prettier, or check the formatting                            |
| `npm run typecheck`               | Type-check `tests/` and `playwright.config.ts`                           |
| `npm run course:check -- <NN>`    | Run the exercises of lesson `NN`                                         |
| `npm run course:progress`         | Show your progress across all lessons                                    |
| `npm run course:solutions`        | Run every reference solution (all must pass)                             |
| `npm run course:typecheck`        | Type-check the TypeScript lessons                                        |

## Continuous integration

GitHub Actions and GitLab CI run the same two stages:

1. **Quality:** lint, format check, type-check of the tests and the lessons, and every lesson's reference solutions.
2. **Playwright:** the full test suite in Chromium, Firefox and WebKit. The HTML report is kept as a build artifact for 30 days.

`@playwright/test` is pinned to an exact version because the GitLab job uses the matching `mcr.microsoft.com/playwright` Docker image. Update both together.

## Contributing

Corrections and improvements are welcome. Please open an issue first for larger changes.

When you change or add a lesson, keep its format:

- Three files per lesson: `lesson`, `exercises`, `solutions` (`.js` in Part 1, `.ts` in Parts 2 and 3).
- Numbered `// PREDICT #N` prompts in the lesson, with the expected output in the ANSWER KEY at the end of the file. Every answer must match the real output.
- `AVOID` / `PREFER` labels for outdated versus modern practice, and an "In Playwright" note in the recap.
- Identical test blocks in `exercises` and `solutions`, and `WHY` comments in the solutions.
- TypeScript files must run with plain `node file.ts`, so use erasable syntax only (no enums, namespaces or parameter properties).
- Everything is written in English.

Before opening a pull or merge request, run:

```bash
npm run lint
npm run format:check
npm run typecheck
npm run course:typecheck
npm run course:solutions
```

## License

[MIT](LICENSE) © 2026 Emre Dursun
