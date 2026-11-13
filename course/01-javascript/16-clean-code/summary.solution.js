// ============================================================================
//  REFERENCE REFACTOR of legacy-summary.js (Lesson 16 solution).
// ============================================================================
//  Same behavior as the legacy code, including its two pinned quirks, but
//  every step of the clean-code checklist applied:
//    names that reveal intent, named constants, const only, ===, no index
//    loops, small pure helpers, template literals, no mutation.
//
//  Input:  results = [{ title, status, durationMs, retries, browser }, ...]
//  Output: { passed, flaky, failed, skipped, passRate, failures, slowest, text }
// ============================================================================

const DEFAULT_SLOW_LIMIT_MS = 5_000;
const DEFAULT_TOP_COUNT = 3;
const MS_PER_SECOND = 1_000;

const Status = Object.freeze({
  PASSED: 'passed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
});

// --- Small pure helpers ------------------------------------------------------
const isFlaky = (result) => result.status === Status.PASSED && result.retries > 0;
const isCleanPass = (result) => result.status === Status.PASSED && !isFlaky(result);
const isFailed = (result) => result.status === Status.FAILED;
// Only the exact status 'skipped' is excluded from the slow list (legacy rule).
const wasExecuted = (result) => result.status !== Status.SKIPPED;

// Rounds milliseconds to seconds with one decimal: 6_449 -> 6.4.
const toRoundedSeconds = (ms) => Math.round(ms / 100) / 10;
// A percentage with one decimal: (2, 3) -> 66.7.
const toPercent = (part, whole) => Math.round((part / whole) * 1_000) / 10;
const sumDurations = (results) => results.reduce((sum, result) => sum + result.durationMs, 0);
const formatFailure = (result) => `${result.title} [${result.browser}]`;

function findSlowest(results, slowLimit, topCount) {
  return results
    .filter((result) => wasExecuted(result) && result.durationMs > slowLimit)
    .map((result) => ({ title: result.title, seconds: toRoundedSeconds(result.durationMs) }))
    .toSorted((a, b) => b.seconds - a.seconds)
    .slice(0, topCount);
}

function formatText({ total, totalSeconds, counts, passRate, failures, slowest }) {
  const { passed, flaky, failed, skipped } = counts;
  const lines = [
    `Total: ${total} tests in ${totalSeconds}s`,
    `Passed: ${passed}, Flaky: ${flaky}, Failed: ${failed}, Skipped: ${skipped}`,
    `Pass rate: ${passRate}%`,
  ];
  if (failures.length > 0) {
    lines.push('Failures:', ...failures.map((failure) => `  - ${failure}`));
  }
  if (slowest.length > 0) {
    lines.push('Slowest:', ...slowest.map(({ title, seconds }) => `  - ${title} (${seconds}s)`));
  }
  return lines.join('\n');
}

// --- The public function -----------------------------------------------------
export function summarizeRun(results, options) {
  const { slowLimit, top } = options ?? {};
  // QUIRK (pinned by a characterization test): `||` also replaces 0, so
  // { slowLimit: 0, top: 0 } falls back to the defaults. Switching to `??`
  // would CHANGE behavior; that belongs in a separate, deliberate fix.
  const slowLimitMs = slowLimit || DEFAULT_SLOW_LIMIT_MS;
  const topCount = top || DEFAULT_TOP_COUNT;

  const passed = results.filter(isCleanPass).length;
  const flaky = results.filter(isFlaky).length;
  const failedResults = results.filter(isFailed);
  const failed = failedResults.length;
  // QUIRK (pinned): ANY other status, e.g. 'timedOut', is counted as skipped.
  const skipped = results.length - passed - flaky - failed;

  const executed = results.length - skipped;
  const passRate = executed === 0 ? 0 : toPercent(passed + flaky, executed);
  const failures = failedResults.map(formatFailure);
  const slowest = findSlowest(results, slowLimitMs, topCount);

  const text = formatText({
    total: results.length,
    totalSeconds: (sumDurations(results) / MS_PER_SECOND).toFixed(1),
    counts: { passed, flaky, failed, skipped },
    passRate,
    failures,
    slowest,
  });

  return { passed, flaky, failed, skipped, passRate, failures, slowest, text };
}
