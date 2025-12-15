import React, { useRef, useEffect, useMemo } from "react";

const COLORS = {
  accepted: "#86EFAC",
  acceptedHover: "#22C55E",
  rejected: "#FCA5A5",
  rejectedHover: "#EF4444",
};

// Format cell value based on type
function formatValue(value, key) {
  if (value === null || value === undefined || value === "") return "—";
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

function ComponentTable({ data, selectedIndex, onRowClick, classifications }) {
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

  return (
    <div style={{ width: "100%", padding: "16px 24px 24px 24px" }}>
      <h3 className="text-center text-lg font-semibold text-gray-700 mb-3">
        Component Metrics
      </h3>
      <div
        ref={tableContainerRef}
        className="rounded-lg border border-gray-200 shadow-sm"
        style={{
          maxHeight: "350px",
          overflowY: "auto",
          overflowX: "auto",
          margin: "0 8px",
        }}
      >
        <table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: "0" }}>
          <thead className="sticky top-0 bg-gray-100 text-gray-700 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className={`px-3 py-2 font-semibold whitespace-nowrap ${
                    col === "Component" || col === "classification" || col === "classification_tags"
                      ? "text-left"
                      : "text-right"
                  }`}
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
                  className="border-t border-gray-100 group"
                  onMouseEnter={(e) => {
                    if (index !== selectedIndex) {
                      const cells = e.currentTarget.querySelectorAll("td");
                      cells.forEach((cell) => {
                        cell.style.backgroundColor = "#f3f4f6";
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
                        <td key={col} className="px-3 py-2" style={cellStyle}>
                          <span
                            className="text-xs font-medium"
                            style={{
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
                    return (
                      <td
                        key={col}
                        style={cellStyle}
                        className={`px-3 py-2 ${
                          col === "Component" || col === "classification_tags"
                            ? "font-medium text-gray-900"
                            : "text-right text-gray-600"
                        }`}
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
