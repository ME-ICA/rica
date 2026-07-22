// Single source of truth for how each component classification is drawn across
// rica's plots. Ported from tedana PR #1475 (tedana/reporting/_palette.py).
//
// Two palettes are available and toggled at runtime (see ThemeContext in
// index.js): the default soft pastels rica has always used, and the Okabe-Ito
// colourblind-safe palette. Marker shapes are a redundant, non-colour cue and
// are ALWAYS applied regardless of the active palette.

// Default palette (light / dark, plus hover for the selected state).
const DEFAULT_PALETTE = {
  accepted: { light: "#86EFAC", dark: "#4ade80", hoverLight: "#22C55E", hoverDark: "#22c55e" },
  rejected: { light: "#FCA5A5", dark: "#f87171", hoverLight: "#EF4444", hoverDark: "#ef4444" },
  ignored: { light: "#7DD3FC", dark: "#38bdf8", hoverLight: "#0EA5E9", hoverDark: "#0ea5e9" },
  other: { light: "#d1d5db", dark: "#52525b", hoverLight: "#9ca3af", hoverDark: "#71717a" },
};

// Okabe-Ito colourblind-safe palette. Light mode uses the canonical Okabe-Ito
// values; dark mode uses lightened variants so they keep the same visual punch
// on the dark background (all >= 3:1 contrast). Hover is a darker (light) /
// brighter (dark) shade of the mode's base colour.
const COLORBLIND_PALETTE = {
  accepted: { light: "#009E73", dark: "#2CC4A0", hoverLight: "#007A59", hoverDark: "#4DD9B8" },
  rejected: { light: "#D55E00", dark: "#F07E36", hoverLight: "#A64A00", hoverDark: "#FF9855" },
  ignored: { light: "#0072B2", dark: "#3D9AD6", hoverLight: "#005A8C", hoverDark: "#5AB0E6" },
  other: { light: "#999999", dark: "#B0B0B0", hoverLight: "#767676", hoverDark: "#CACACA" },
};

// Marker shape per classification (redundant, non-colour encoding).
const SHAPES = {
  accepted: "circle",
  rejected: "square",
  ignored: "triangle",
  other: "diamond",
};

// Fall back to "other" for any unrecognised classification (matches tedana).
const normalize = (classification) => (SHAPES[classification] ? classification : "other");

export function getClassStyle(
  classification,
  { isDark = false, colorblind = false, selected = false } = {},
) {
  const key = normalize(classification);
  const entry = (colorblind ? COLORBLIND_PALETTE : DEFAULT_PALETTE)[key];
  const color = selected
    ? isDark
      ? entry.hoverDark
      : entry.hoverLight
    : isDark
      ? entry.dark
      : entry.light;
  return { color, shape: SHAPES[key] };
}

export function colorFor(classification, opts) {
  return getClassStyle(classification, opts).color;
}

export function shapeFor(classification) {
  return SHAPES[normalize(classification)];
}
