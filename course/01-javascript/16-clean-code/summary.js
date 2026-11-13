// ============================================================================
//  YOUR WORKING COPY — refactor THIS file (Lesson 16 exercises).
// ============================================================================
//  It starts as an exact copy of legacy-summary.js. Follow the steps in
//  exercises.js: write characterization tests first, then clean this file up
//  in small steps, running the tests after each one.
//
//  Input:  results = [{ title, status, durationMs, retries, browser }, ...]
//  Output: { passed, flaky, failed, skipped, passRate, failures, slowest, text }
// ============================================================================

export function summarizeRun(results, options) {
  var opts = options || {};
  var slowLimit = opts.slowLimit || 5000;
  var top = opts.top || 3;
  var passed = 0;
  var failed = 0;
  var skipped = 0;
  var flaky = 0;
  var total = 0;
  var failures = [];
  var slow = [];
  for (var i = 0; i < results.length; i++) {
    var r = results[i];
    total = total + r.durationMs;
    if (r.status == 'passed') {
      if (r.retries > 0) {
        flaky++;
      } else {
        passed++;
      }
    } else if (r.status == 'failed') {
      failed++;
      failures.push(r.title + ' [' + r.browser + ']');
    } else {
      skipped++;
    }
    if (r.status != 'skipped') {
      if (r.durationMs > slowLimit) {
        slow.push({ title: r.title, seconds: Math.round(r.durationMs / 100) / 10 });
      }
    }
  }
  slow.sort(function (a, b) {
    return b.seconds - a.seconds;
  });
  slow = slow.slice(0, top);
  var executed = results.length - skipped;
  var passRate;
  if (executed == 0) {
    passRate = 0;
  } else {
    passRate = Math.round(((passed + flaky) / executed) * 1000) / 10;
  }
  var lines = [];
  lines.push('Total: ' + results.length + ' tests in ' + (total / 1000).toFixed(1) + 's');
  lines.push(
    'Passed: ' + passed + ', Flaky: ' + flaky + ', Failed: ' + failed + ', Skipped: ' + skipped,
  );
  lines.push('Pass rate: ' + passRate + '%');
  if (failures.length > 0) {
    lines.push('Failures:');
    for (var j = 0; j < failures.length; j++) {
      lines.push('  - ' + failures[j]);
    }
  }
  if (slow.length > 0) {
    lines.push('Slowest:');
    for (var k = 0; k < slow.length; k++) {
      lines.push('  - ' + slow[k].title + ' (' + slow[k].seconds + 's)');
    }
  }
  return {
    passed: passed,
    flaky: flaky,
    failed: failed,
    skipped: skipped,
    passRate: passRate,
    failures: failures,
    slowest: slow,
    text: lines.join('\n'),
  };
}
