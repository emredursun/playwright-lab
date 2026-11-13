/**
 * The checker for Lesson 21's exercises ("mutation testing" in miniature).
 *
 * How it works:
 *   - Each exercise is a SUITE function: it receives an implementation of
 *     shop.ts and registers ordinary node:test tests with test()/describe().
 *   - The checker runs each suite in a separate Node process:
 *       1. against the CORRECT shop.ts      -> all your tests must pass
 *       2. against every BUGGY variant      -> at least one test must fail
 *   - A variant that passes all your tests is a bug your tests would let
 *     into production. The report tells you which bug slipped through.
 *
 * Debugging one exercise with the normal test output:
 *   node course/03-applied/21-testing-fundamentals/exercises.ts --exercise 1
 *   node course/03-applied/21-testing-fundamentals/exercises.ts --exercise 1 --variant 0
 * (--variant N runs your tests against buggy variant N, counted from 0.)
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { parseArgs } from 'node:util';
import {
  BUGGY_VARIANTS,
  EXERCISES,
  correctShop,
  type ExerciseNumber,
  type Shop,
} from './variants.ts';

/** A suite registers tests for ONE exercise against the given implementation. */
export type Suite = (shop: Shop) => void;
export type Suites = Readonly<Record<ExerciseNumber, Suite>>;

interface RunResult {
  readonly passed: boolean;
  readonly output: string;
}

const isExerciseNumber = (value: number): value is ExerciseNumber =>
  Object.hasOwn(EXERCISES, value);

/** Entry point, called once at the bottom of exercises.ts / solutions.ts. */
export function checkSuites(file: string, suites: Suites): void {
  const { values } = parseArgs({
    options: { exercise: { type: 'string' }, variant: { type: 'string' } },
    strict: false,
  });

  if (typeof values.exercise === 'string') {
    runSingleSuite(suites, Number(values.exercise), values.variant);
    return;
  }

  for (const key of Object.keys(EXERCISES)) {
    const exercise = Number(key);
    if (!isExerciseNumber(exercise)) continue;
    const variants = BUGGY_VARIANTS[exercise];
    // Start every run right away: they are independent processes, so all
    // exercises are checked in parallel while the report is printed in order.
    const runs = Promise.all([
      runInChild(file, exercise, undefined),
      ...variants.map((_, index) => runInChild(file, exercise, index)),
    ]);

    test(`Exercise ${exercise} — ${EXERCISES[exercise]}`, async (t) => {
      const [correct, ...buggy] = await runs;
      const correctPassed = correct?.passed === true;

      await t.test('your tests pass against the correct implementation', () => {
        assert.ok(
          correctPassed,
          `Your tests failed against the CORRECT shop.ts:\n${tail(correct?.output ?? '')}`,
        );
      });

      for (const [index, variant] of variants.entries()) {
        await t.test(
          `your tests catch: ${variant.bug}`,
          {
            skip: correctPassed
              ? false
              : 'first make your tests pass against the correct implementation',
          },
          () => {
            assert.equal(
              buggy[index]?.passed,
              false,
              `All your tests PASSED against a buggy implementation (${variant.bug}).\n` +
                'Add a test that fails for this bug but passes for the real shop.ts.',
            );
          },
        );
      }
    });
  }
}

/** Child mode: register one suite against one implementation, with normal output. */
function runSingleSuite(
  suites: Suites,
  exercise: number,
  variant: string | boolean | undefined,
): void {
  if (!isExerciseNumber(exercise)) {
    throw new RangeError(`--exercise must be one of ${Object.keys(EXERCISES).join(', ')}`);
  }
  const index = typeof variant === 'string' ? Number(variant) : undefined;
  const buggy = index === undefined ? undefined : BUGGY_VARIANTS[exercise][index];
  if (index !== undefined && buggy === undefined) {
    throw new RangeError(
      `Exercise ${exercise} has variants 0-${BUGGY_VARIANTS[exercise].length - 1}`,
    );
  }
  const label = buggy === undefined ? 'correct shop.ts' : `buggy variant: ${buggy.bug}`;
  describe(`Exercise ${exercise} against ${label}`, () => {
    suites[exercise](buggy?.shop ?? correctShop);
  });
}

function runInChild(
  file: string,
  exercise: ExerciseNumber,
  variant: number | undefined,
): Promise<RunResult> {
  const args = ['--test-reporter=spec', file, '--exercise', String(exercise)];
  if (variant !== undefined) args.push('--variant', String(variant));

  // NODE_TEST_CONTEXT is set when this file runs under `node --test`. A child
  // that inherits it would report to the parent runner instead of to us.
  const { NODE_TEST_CONTEXT: _ignored, ...env } = process.env;

  return new Promise((resolve) => {
    execFile(process.execPath, args, { env, timeout: 20_000 }, (error, stdout, stderr) => {
      resolve({ passed: error === null, output: `${stdout}${stderr}` });
    });
  });
}

const tail = (text: string, lines = 40): string =>
  text.trimEnd().split('\n').slice(-lines).join('\n');
