// Show how many exercise tests pass in every lesson.
//
//   npm run course:progress
import { findLessons, findTestFile, runTestFile } from './lessons.js';

/** Read a "# pass 3" style counter from TAP output. */
const tapCount = (output, label) =>
  Number(new RegExp(`^# ${label} (\\d+)$`, 'm').exec(output)?.[1] ?? 0);

const BAR_WIDTH = 10;
const bar = (passed, total) => {
  const filled = total === 0 ? 0 : Math.round((passed / total) * BAR_WIDTH);
  return '#'.repeat(filled) + '.'.repeat(BAR_WIDTH - filled);
};

const rows = findLessons().map((lesson) => {
  const file = findTestFile(lesson.dir, 'exercises');
  const title = `${lesson.number}  ${lesson.part}/${lesson.name}`;
  if (file === undefined) return { title, passed: 0, total: 0, status: 'guide (see README.md)' };

  const { stdout = '' } = runTestFile(file, { reporter: 'tap' });
  const total = tapCount(stdout, 'tests');
  const passed = tapCount(stdout, 'pass');
  const status =
    total > 0 && passed === total ? 'done' : passed > 0 ? 'in progress' : 'not started';
  return { title, passed, total, status };
});

const width = Math.max(...rows.map(({ title }) => title.length));
console.log(`${'Lesson'.padEnd(width)}  Tests   Progress      Status`);
for (const { title, passed, total, status } of rows) {
  const tests = total === 0 ? '-' : `${passed}/${total}`;
  const progress = total === 0 ? '' : `[${bar(passed, total)}]`;
  console.log(`${title.padEnd(width)}  ${tests.padEnd(6)}  ${progress.padEnd(12)}  ${status}`);
}

const exerciseRows = rows.filter(({ total }) => total > 0);
const done = exerciseRows.filter(({ status }) => status === 'done').length;
console.log(`\n${done} of ${exerciseRows.length} lessons complete.`);
