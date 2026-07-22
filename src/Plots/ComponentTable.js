import React, { useRef, useEffect, useMemo } from "react";
import { formatComponentName } from "./PlotUtils";
import { colorFor } from "../constants/palette";
import { useTheme } from "../index";

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
    "variance explained rank": "VE Rank",
    "rationale": "Rationale",
  };
  return labels[key] || key;
}

// Preferred column order — known columns first, then any extras from the TSV
const PRIORITY_COLUMNS = [
  "Component",
  "kappa",
  "rho",
  "variance explained",
  "normalized variance explained",
  "kappa rank",
  "rho rank",
  "variance explained rank",
  "dice_FT2",
  "dice_FS0",
  "countsigFT2",
  "countsigFS0",
  "signal-noise_t",
  "signal-noise_p",
  "optimal sign",
  "classification",
  "classification_tags",
  "rationale",
];

function ComponentTable({ data, selectedIndex, onRowClick, classifications, isDark = false, isCollapsed = false, onToggleCollapse, sortColumn = '', sortDirection = 'desc', onSort, sortedIndices }) {
  const { colorblind = false } = useTheme() || {};
  const selectedRowRef = useRef(null);
  const tableContainerRef = useRef(null);

  // Scroll selected row into view within the table container only (don't scroll the page)
  useEffect(() => {
    if (isCollapsed) return;
    if (selectedRowRef.current && tableContainerRef.current) {
      const container = tableContainerRef.current;
      const row = selectedRowRef.current;
      const containerRect = container.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      if (rowRect.top < containerRect.top || rowRect.bottom > containerRect.bottom) {
        const targetScrollTop =
          row.offsetTop - container.clientHeight / 2 + row.offsetHeight / 2;
        container.scrollTo({ top: targetScrollTop, behavior: "smooth" });
      }
    }
  }, [selectedIndex, isCollapsed]);

  // Show all columns: priority-ordered known columns first, then any extras from the TSV
  const columns = useMemo(() => {
    if (!data?.length) return [];
    const availableKeys = new Set(Object.keys(data[0]));
    const priorityVisible = PRIORITY_COLUMNS.filter((col) => availableKeys.has(col));
    const prioritySet = new Set(priorityVisible);
    const extra = Object.keys(data[0]).filter((col) => !prioritySet.has(col));
    return [...priorityVisible, ...extra];
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
    const baseColor = colorFor(classification, { isDark, colorblind });

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
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <div style={{ width: "80%", margin: "0 auto", padding: "16px 24px 24px 24px" }}>
      {/* Header with Hide button, title, and component count */}
      <div
        id="component-metrics-toggle"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          width: '100%',
          padding: '8px 12px',
          marginBottom: isCollapsed ? '0' : '12px',
        }}
      >
        {/* Hide button - single toggle, gray when off (table visible), green when active (table hidden) */}
        <button
          onClick={onToggleCollapse}
          aria-pressed={isCollapsed}
          aria-controls="component-metrics-table"
          aria-label="Hide component metrics table"
          style={{
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: 500,
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            backgroundColor: isCollapsed ? '#3b82f6' : (isDark ? '#3f3f46' : '#d1d5db'),
            color: isCollapsed ? '#fff' : (isDark ? '#a1a1aa' : '#6b7280'),
          }}
        >
          Hide
        </button>

        {/* Title and component count */}
        <span style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--text-primary)',
        }}>
          Component Metrics
        </span>
        <span style={{
          fontSize: '12px',
          fontWeight: 400,
          color: 'var(--text-tertiary)',
        }}>
          ({data.length} components)
        </span>
      </div>

      {/* Collapsible table container */}
      <div
        id="component-metrics-table"
        role="region"
        aria-labelledby="component-metrics-toggle"
        aria-hidden={isCollapsed}
        ref={tableContainerRef}
        style={{
          maxHeight: isCollapsed ? '0' : '350px',
          overflowY: isCollapsed ? 'hidden' : 'auto',
          overflowX: isCollapsed ? 'hidden' : 'auto',
          margin: "0 8px",
          borderRadius: '12px',
          border: isCollapsed ? 'none' : `1px solid ${borderColor}`,
          backgroundColor: 'var(--bg-secondary)',
          transition: 'max-height 0.3s ease, opacity 0.3s ease',
          opacity: isCollapsed ? 0 : 1,
        }}
      >
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: "separate", borderSpacing: "0" }}>
          <thead>
            <tr>
              {columns.map((col) => {
                const isActive = sortColumn === col;
                const textAlign = col === "Component" || col === "classification" || col === "classification_tags" ? 'left' : 'right';
                const ariaSort = isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none';
                return (
                  <th
                    key={col}
                    aria-sort={ariaSort}
                    style={{
                      padding: '12px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      textAlign,
                      position: "sticky",
                      top: 0,
                      backgroundColor: headerBg,
                      color: isActive ? (isDark ? '#60a5fa' : '#2563eb') : headerColor,
                      zIndex: 10,
                      userSelect: 'none',
                    }}
                    title={onSort ? `Sort by ${getColumnLabel(col)}` : undefined}
                  >
                    {onSort ? (
                      <button
                        type="button"
                        onClick={() => onSort(col)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: textAlign === 'left' ? 'flex-start' : 'flex-end',
                          gap: '4px',
                          padding: 0,
                          border: 'none',
                          background: 'transparent',
                          color: 'inherit',
                          font: 'inherit',
                          cursor: 'pointer',
                        }}
                      >
                        <span>{getColumnLabel(col)}</span>
                        {isActive && (
                          <span style={{ fontSize: '10px' }} aria-hidden="true">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    ) : (
                      <>
                        {getColumnLabel(col)}
                        {isActive && (
                          <span style={{ marginLeft: '4px', fontSize: '10px' }}>
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {((Array.isArray(sortedIndices) && sortedIndices.length === data.length)
              ? sortedIndices
              : data.map((_, i) => i)
            ).map((originalIdx) => {
              const row = data[originalIdx];
              const classification = getClassification(originalIdx);
              return (
                <tr
                  key={row?.Component || originalIdx}
                  ref={originalIdx === selectedIndex ? selectedRowRef : null}
                  onClick={() => onRowClick(originalIdx)}
                  style={getRowStyle(originalIdx)}
                  onMouseEnter={(e) => {
                    if (originalIdx !== selectedIndex) {
                      const cells = e.currentTarget.querySelectorAll("td");
                      cells.forEach((cell) => {
                        cell.style.backgroundColor = hoverBg;
                      });
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (originalIdx !== selectedIndex) {
                      const cells = e.currentTarget.querySelectorAll("td");
                      cells.forEach((cell) => {
                        cell.style.backgroundColor = "transparent";
                      });
                    }
                  }}
                >
                  {columns.map((col, colIndex) => {
                    const cellStyle = getCellStyle(originalIdx, colIndex, columns.length);
                    if (col === "classification") {
                      return (
                        <td key={col} style={{ ...cellStyle, padding: '12px' }}>
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 500,
                              backgroundColor: colorFor(classification, { isDark, colorblind }),
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
                    const isSelected = originalIdx === selectedIndex;
                    return (
                      <td
                        key={col}
                        style={{
                          ...cellStyle,
                          padding: '12px',
                          textAlign: col === "Component" || col === "classification_tags" ? 'left' : 'right',
                          fontWeight: col === "Component" || col === "classification_tags" ? 500 : 400,
                          color: isSelected ? '#1f2937' : textPrimary,
                        }}
                      >
                        {formatValue(row?.[col], col)}
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
