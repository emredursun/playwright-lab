// A default export: the module has ONE main thing, and importers choose its name.
// Fine occasionally, but named exports are usually the better choice (see lesson.js).

export default function createLogger(prefix) {
  return (message) => console.log(`[${prefix}] ${message}`);
}
