import React, { useRef, useEffect, useMemo } from "react";
import { formatComponentName } from "./PlotUtils";

// Theme-aware colors
const getColors = (isDark) => ({
  accepted: isDark ? "#4ade80" : "#86EFAC",
  acceptedHover: isDark ? "#22c55e" : "#22C55E",
  rejected: isDark ? "#f87171" : "#FCA5A5",
  rejectedHover: isDark ? "#ef4444" : "#EF4444",
});

// Format cell value based on type
function formatValue(value, key) {
  if (value === null || value === undefined || value === "") return "—";
  // Format component names for display (ICA_01 → ICA 01)
  if (key === "Component") {
    return formatComponentName(value);
  }
  if (typeof value === "number") {
    // Very small numbers in scientific notation
    if (Math.abs(value) < 0.0001 && value !== 0) {
      return value.toExponential(2);
    }
    // Regular numbers with 2-4 decimal places
    return value.toFixed(2);
  }
  return String(value);
}

// Get a human-readable column name
function getColumnLabel(key) {
  const labels = {
    "Component": "Component",
    "kappa": "Kappa",
    "rho": "Rho",
    "variance explained": "Variance %",
    "normalized variance explained": "Norm. Var.",
    "countsigFT2": "Sig. FT2",
    "countsigFS0": "Sig. FS0",
    "dice_FT2": "Dice FT2",
    "dice_FS0": "Dice FS0",
    "signal-noise_t": "S/N t",
    "signal-noise_p": "S/N p",
    "optimal sign": "Sign",
    "classification": "Classification",
    "classification_tags": "Tags",
    "kappa rank": "κ Rank",
    "rho rank": "ρ Rank",
    "rationale": "Rationale",
  };
  return labels[key] || key;
}

// Columns to display (in order)
const DISPLAY_COLUMNS = [
  "Component",
  "kappa",
  "rho",
  "variance explained",
  "kappa rank",
  "rho rank",
  "dice_FT2",
  "dice_FS0",
  "signal-noise_t",
  "classification",
  "classification_tags",
];

function ComponentTable({ data, selectedIndex, onRowClick, classifications, isDark = false }) {
  const selectedRowRef = useRef(null);
  const tableContainerRef = useRef(null);

  // Scroll selected row into view when selection changes
  useEffect(() => {
    if (selectedRowRef.current && tableContainerRef.current) {
      const container = tableContainerRef.current;
      const row = selectedRowRef.current;

      // Calculate if row is visible in the container
      const containerRect = container.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();

      // Check if row is outside visible area
      if (rowRect.top < containerRect.top || rowRect.bottom > containerRect.bottom) {
        row.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [selectedIndex]);

  // Determine which columns exist in the data
  const columns = useMemo(() => {
    if (!data?.length) return [];
    const availableKeys = Object.keys(data[0]);
    return DISPLAY_COLUMNS.filter((col) => availableKeys.includes(col));
  }, [data]);

  if (!data?.length) {
    return null;
  }

  const getClassification = (index) => {
    // Use classifications array if provided (for live updates), otherwise fall back to data
    if (classifications && classifications[index]) {
      return classifications[index];
    }
    return data[index]?.classification || "rejected";
  };

  const getRowStyle = (index) => {
    return {
      cursor: "pointer",
    };
  };

  const COLORS = getColors(isDark);

  const getCellStyle = (index, colIndex, totalCols) => {
    const isSelected = index === selectedIndex;
    const classification = getClassification(index);
    const baseColor = classification === "accepted" ? COLORS.accepted : COLORS.rejected;

    const isFirst = colIndex === 0;
    const isLast = colIndex === totalCols - 1;

    return {
      backgroundColor: isSelected ? baseColor : "transparent",
      transition: "background-color 0.15s ease",
      borderTopLeftRadius: isSelected && isFirst ? "8px" : "0",
      borderBottomLeftRadius: isSelected && isFirst ? "8px" : "0",
      borderTopRightRadius: isSelected && isLast ? "8px" : "0",
      borderBottomRightRadius: isSelected && isLast ? "8px" : "0",
    };
  };

  const hoverBg = isDark ? '#27272a' : '#f3f4f6';
  const headerBg = isDark ? '#18181b' : '#f3f4f6';
  const headerColor = isDark ? '#fafafa' : '#374151';
  const textPrimary = isDark ? '#fafafa' : '#111827';
  const textSecondary = isDark ? '#a1a1aa' : '#6b7280';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <div style={{ width: "80%", margin: "0 auto", padding: "16px 24px 24px 24px" }}>
      <h3 style={{
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '12px',
      }}>
        Component Metrics
      </h3>
      <div
        ref={tableContainerRef}
        style={{
          maxHeight: "350px",
          overflowY: "auto",
          overflowX: "auto",
          margin: "0 8px",
          borderRadius: '12px',
          border: `1px solid ${borderColor}`,
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: "separate", borderSpacing: "0" }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '12px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    textAlign: col === "Component" || col === "classification" || col === "classification_tags" ? 'left' : 'right',
                    position: "sticky",
                    top: 0,
                    backgroundColor: headerBg,
                    color: headerColor,
                    zIndex: 10,
                  }}
                >
                  {getColumnLabel(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              const classification = getClassification(index);
              return (
                <tr
                  key={row.Component || index}
                  ref={index === selectedIndex ? selectedRowRef : null}
                  onClick={() => onRowClick(index)}
                  style={getRowStyle(index)}
                  onMouseEnter={(e) => {
                    if (index !== selectedIndex) {
                      const cells = e.currentTarget.querySelectorAll("td");
                      cells.forEach((cell) => {
                        cell.style.backgroundColor = hoverBg;
                      });
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (index !== selectedIndex) {
                      const cells = e.currentTarget.querySelectorAll("td");
                      cells.forEach((cell) => {
                        cell.style.backgroundColor = "transparent";
                      });
                    }
                  }}
                >
                  {columns.map((col, colIndex) => {
                    const cellStyle = getCellStyle(index, colIndex, columns.length);
                    if (col === "classification") {
                      return (
                        <td key={col} style={{ ...cellStyle, padding: '12px' }}>
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 500,
                              backgroundColor:
                                classification === "accepted"
                                  ? COLORS.accepted
                                  : COLORS.rejected,
                              color: "#1f2937",
                              borderRadius: "6px",
                              display: "inline-block",
                              padding: "4px 0",
                              width: "75px",
                              textAlign: "center",
                              boxSizing: "border-box",
                            }}
                          >
                            {classification}
                          </span>
                        </td>
                      );
                    }
                    const isSelected = index === selectedIndex;
                    return (
                      <td
                        key={col}
                        style={{
                          ...cellStyle,
                          padding: '12px',
                          textAlign: col === "Component" || col === "classification_tags" ? 'left' : 'right',
                          fontWeight: col === "Component" || col === "classification_tags" ? 500 : 400,
                          // Use dark text on selected rows for contrast
                          color: isSelected ? '#1f2937' : textPrimary,
                        }}
                      >
                        {formatValue(row[col], col)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ComponentTable;
