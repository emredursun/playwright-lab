// Shared helpers for the lesson scripts: find lesson folders and run their tests.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

export const LESSONS_ROOT = path.resolve(import.meta.dirname, '..');
// Part folders are numbered so they sort in learning order.
const PARTS = ['01-javascript', '02-typescript', '03-applied'];
const LESSON_FOLDER = /^(\d{2})-(.+)$/;

/**
 * Every lesson folder, sorted by number.
 * @returns {{ number: string, name: string, part: string, dir: string }[]}
 */
export function findLessons() {
  return PARTS.flatMap((part) => {
    const partDir = path.join(LESSONS_ROOT, part);
    if (!existsSync(partDir)) return [];
    return readdirSync(partDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && LESSON_FOLDER.test(entry.name))
      .map((entry) => {
        const [, number, name] = LESSON_FOLDER.exec(entry.name) ?? [];
        // Report the part without its number prefix, e.g. "javascript".
        const label = part.replace(LESSON_FOLDER, '$2');
        return { number, name, part: label, dir: path.join(partDir, entry.name) };
      });
  }).toSorted((a, b) => a.number.localeCompare(b.number));
}

/**
 * The exercises or solutions file of a lesson, or undefined if it has none.
 * @param {string} dir
 * @param {'exercises' | 'solutions'} kind
 */
export function findTestFile(dir, kind) {
  return ['js', 'ts']
    .map((extension) => path.join(dir, `${kind}.${extension}`))
    .find((file) => existsSync(file));
}

/**
 * Run a test file with Node's test runner.
 * @param {string} file
 * @param {{ reporter?: string, inherit?: boolean }} [options]
 */
export function runTestFile(file, { reporter = 'spec', inherit = false } = {}) {
  return spawnSync(process.execPath, ['--test', `--test-reporter=${reporter}`, file], {
    cwd: LESSONS_ROOT,
    encoding: 'utf8',
    stdio: inherit ? 'inherit' : 'pipe',
    timeout: 60_000,
  });
}
