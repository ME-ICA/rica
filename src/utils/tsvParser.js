import Papa from "papaparse";

/**
 * Parse mixing matrix TSV file (desc-ICA_mixing.tsv)
 * Format: Header row with component names (ICA_00, ICA_01, ...),
 * followed by rows of timepoints with values for each component.
 *
 * @param {string} tsvText - Raw TSV text content
 * @returns {{ headers: string[], data: number[][] }} - Headers and transposed data
 *   where data[componentIndex][timepoint] gives the value
 */
export function parseMixingMatrix(tsvText) {
  const parsed = Papa.parse(tsvText, {
    header: false,
    skipEmptyLines: true,
    dynamicTyping: true,
    delimiter: "\t",
  });

  if (!parsed.data || parsed.data.length < 2) {
    return { headers: [], data: [] };
  }

  // First row is headers (component names)
  const headers = parsed.data[0].map((h) => String(h).trim());

  // Remaining rows are timepoints
  const timepoints = parsed.data.slice(1);
  const numComponents = headers.length;
  const numTimepoints = timepoints.length;

  // Transpose: convert from [timepoint][component] to [component][timepoint]
  const data = [];
  for (let c = 0; c < numComponents; c++) {
    const series = [];
    for (let t = 0; t < numTimepoints; t++) {
      const value = timepoints[t][c];
      series.push(typeof value === "number" ? value : parseFloat(value) || 0);
    }
    data.push(series);
  }

  return { headers, data };
}

/**
 * Get component index from component label
 * Maps "ICA_00" -> 0, "ICA_01" -> 1, etc.
 *
 * @param {string[]} headers - Array of component headers
 * @param {string} label - Component label (e.g., "ICA_00")
 * @returns {number} - Index in the data array, or -1 if not found
 */
export function getComponentIndex(headers, label) {
  return headers.findIndex(
    (h) => h === label || h === label.replace("ICA", "ICA_")
  );
}
