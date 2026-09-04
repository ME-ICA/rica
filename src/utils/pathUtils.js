/**
 * Extract the folder name (last segment) from a file path.
 * Works with both Unix (/) and Windows (\) path separators.
 *
 * @param {string} path - The full file path
 * @returns {string} The folder name, or the original path if extraction fails
 */
export function getFolderName(path) {
  if (!path) return path;
  return path.split(/[/\\]/).filter(Boolean).pop() || path;
}

// Returns the BIDS run label ("run-01") extracted from a filename, or null.
export function parseRunLabel(filename) {
  const m = filename.match(/_(run-\d+)[_. ]/);
  return m ? m[1] : null;
}

// Returns sorted unique run labels found across an array of filenames.
// Returns [] when no run entity is detected (single-run dataset).
export function deriveRunLabels(filenames) {
  const seen = new Set();
  for (const f of filenames) {
    const label = parseRunLabel(f);
    if (label) seen.add(label);
  }
  return [...seen].sort((a, b) =>
    parseInt(a.replace("run-", ""), 10) - parseInt(b.replace("run-", ""), 10)
  );
}
