// AVOID in new code: this is CommonJS, the module system Node used before ES modules.
// The .cjs extension tells Node to treat this file as CommonJS even though
// course/package.json says "type": "module".
// You will still meet this style in older libraries and config files.

function legacyGreet(name) {
  return `Hello from CommonJS, ${name}`;
}

module.exports = { legacyGreet };
