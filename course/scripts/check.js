// Run the exercises (or solutions) of ONE lesson.
//
//   npm run course:check -- 05               -> exercises of lesson 05
//   npm run course:check -- 5 --solutions    -> reference solutions of lesson 05
import path from 'node:path';
import { findLessons, findTestFile, LESSONS_ROOT, runTestFile } from './lessons.js';

const args = process.argv.slice(2);
const kind = args.includes('--solutions') ? 'solutions' : 'exercises';
const requested = args.find((arg) => /^\d{1,2}$/.test(arg));
const lessons = findLessons();

if (requested === undefined) {
  console.log('Usage: npm run course:check -- <lesson number> [--solutions]\n');
  console.log('Lessons:');
  for (const lesson of lessons) console.log(`  ${lesson.number}  ${lesson.part}/${lesson.name}`);
  process.exit(1);
}

const lesson = lessons.find(({ number }) => number === requested.padStart(2, '0'));
if (lesson === undefined) {
  console.error(`No lesson ${requested}. Run without a number to list all lessons.`);
  process.exit(1);
}

const file = findTestFile(lesson.dir, kind);
if (file === undefined) {
  console.error(`Lesson ${lesson.number} has no ${kind} file. Open its README.md instead.`);
  process.exit(1);
}

console.log(`Lesson ${lesson.number} — ${kind}: ${path.relative(LESSONS_ROOT, file)}\n`);
const result = runTestFile(file, { inherit: true });
process.exit(result.status ?? 1);
