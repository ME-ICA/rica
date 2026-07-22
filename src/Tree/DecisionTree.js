import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { isDecisionNode, getAffectingNodes } from "../utils/decisionTreeUtils";
import { colorFor } from "../constants/palette";
import { useTheme } from "../index";
import TimeSeries from "../Plots/TimeSeries";
import BrainViewer from "../Plots/BrainViewer";
import { formatComponentName } from "../Plots/PlotUtils";

// Format classification names and determine colors
function formatClassification(value) {
  if (!value) return { text: value, isAccept: false, isReject: false };

  const lowerValue = value.toLowerCase();

  // Check if it's an accept or reject type
  const isAccept = lowerValue.includes("accept");
  const isReject = lowerValue.includes("reject");

  // Format the text based on known classification values
  let text;
  switch (lowerValue) {
    case "provisionalaccept":
      text = "Provisional Accept";
      break;
    case "provisionalreject":
      text = "Provisional Reject";
      break;
    case "accepted":
      text = "Accepted";
      break;
    case "rejected":
      text = "Rejected";
      break;
    case "unclassified":
      text = "Unclassified";
      break;
    case "nochange":
      text = "No Change";
      break;
    default:
      // Generic formatting: insert space before capitals and capitalize first letter
      text = value.replace(/([a-z])([A-Z])/g, '$1 $2')
                  .replace(/^./, str => str.toUpperCase());
  }

  return { text, isAccept, isReject };
}

// Reusable component list item with keyboard accessibility
function ComponentListItem({ id, path, isSelected, colors, onClick, innerRef }) {
  const finalClass = path.nodes[path.nodes.length - 1]?.classification || path.initial;
  const formatted = formatClassification(finalClass);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(id, e);
    }
  };

  return (
    <div
      ref={innerRef}
      role="button"
      tabIndex={0}
      onClick={(e) => onClick(id, e)}
      onKeyDown={handleKeyDown}
      style={{
        padding: "10px",
        backgroundColor: isSelected ? colors.bgHover : colors.bg,
        border: `2px solid ${isSelected ? colors.selected : colors.border}`,
        borderRadius: "6px",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = colors.bgHover;
        }
        e.currentTarget.style.borderColor = colors.borderHover;
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = colors.bg;
          e.currentTarget.style.borderColor = colors.border;
        }
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "13px", fontWeight: "600", color: colors.text }}>
          {id.replace("_", " ")}
        </span>
        <span
          style={{
            fontSize: "11px",
            padding: "2px 8px",
            backgroundColor: formatted.isAccept ? colors.accepted : formatted.isReject ? colors.rejected : colors.textSecondary,
            color: "#fff",
            borderRadius: "4px",
            fontWeight: "600",
          }}
        >
          {formatted.text}
        </span>
      </div>
    </div>
  );
}

// Calculate default width based on viewport (defined outside hook to avoid recreation)
const getDefaultWidth = () => {
  if (typeof window !== 'undefined') {
    // Right column takes flex: 1 (50% of content area), minus padding (24px * 2 + 16px * 2)
    return Math.floor(window.innerWidth * 0.5) - 80;
  }
  return 800;
};

// Hook to measure container width with better initialization
function useContainerWidth(ref, isActive) {
  const [width, setWidth] = useState(getDefaultWidth);

  useEffect(() => {
    if (!isActive) return;

    const updateWidth = () => {
      if (ref.current) {
        // Get the actual width of the container, accounting for padding
        const containerWidth = ref.current.offsetWidth - 32; // Subtract padding (16px * 2)
        if (containerWidth > 200) { // Only update if we get a valid measurement
          setWidth(containerWidth);
        }
      } else {
        // Fallback to viewport-based calculation
        setWidth(getDefaultWidth());
      }
    };

    // Initial measurement with delays to ensure DOM is ready
    updateWidth();
    const timeoutId1 = setTimeout(updateWidth, 100);
    const timeoutId2 = setTimeout(updateWidth, 300);

    // Update on resize
    let resizeObserver;
    if (ref.current) {
      resizeObserver = new ResizeObserver(updateWidth);
      resizeObserver.observe(ref.current);
    }

    // Also listen to window resize
    window.addEventListener('resize', updateWidth);

    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      window.removeEventListener('resize', updateWidth);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [ref, isActive]);

  return width;
}

/**
 * Decision Tree Visualization Component
 *
 * Displays tedana's sequential decision tree as an interactive flow chart.
 * Shows nodes, conditions, and component counts with click interactions.
 */
function DecisionTree({ treeData, componentPaths, componentData, mixingMatrix, niftiBuffer, niftiUrl, maskBuffer, isDark }) {
  const { colorblind = false } = useTheme() || {};
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const selectedComponentRef = useRef(null);
  const visualizationContainerRef = useRef(null);

  // Check if we have interactive views available
  const hasInteractiveViews = !!(mixingMatrix?.data?.length > 0);
  const hasBrainViewer = !!(niftiBuffer || niftiUrl);

  // Measure container width for responsive visualizations (only when component is selected and has views)
  const containerWidth = useContainerWidth(visualizationContainerRef, !!(selectedComponent && hasInteractiveViews));

  // Theme colors
  const colors = useMemo(
    () => ({
      bg: isDark ? "#18181b" : "#ffffff",
      bgElevated: isDark ? "#27272a" : "#f3f4f6",
      bgHover: isDark ? "#3f3f46" : "#e5e7eb",
      text: isDark ? "#fafafa" : "#111827",
      textSecondary: isDark ? "#a1a1aa" : "#6b7280",
      border: isDark ? "#3f3f46" : "#d1d5db",
      borderHover: isDark ? "#52525b" : "#9ca3af",
      accepted: colorFor("accepted", { isDark, colorblind, selected: true }),
      rejected: colorFor("rejected", { isDark, colorblind, selected: true }),
      calc: isDark ? "#60a5fa" : "#3b82f6",
      decision: isDark ? "#c084fc" : "#a855f7",
      selected: isDark ? "#3b82f6" : "#2563eb",
    }),
    [isDark, colorblind]
  );

  // Get components affected by a node
  const getAffectedComponents = useCallback(
    (nodeIndex) => {
      const affected = [];
      Object.entries(componentPaths).forEach(([componentId, path]) => {
        const affectingNodes = getAffectingNodes(componentId, componentPaths);
        if (affectingNodes.includes(nodeIndex)) {
          affected.push({
            id: componentId,
            path,
          });
        }
      });
      return affected;
    },
    [componentPaths]
  );

  // Handle node click
  const handleNodeClick = useCallback(
    (node, e) => {
      e.stopPropagation();
      setSelectedNode(node.index);
      setSelectedComponent(null);
    },
    []
  );

  // Handle component click
  const handleComponentClick = useCallback((componentId, e) => {
    e.stopPropagation();
    setSelectedComponent(componentId);
    setSelectedNode(null);
  }, []);

  // Handle reset (click outside)
  const handleReset = useCallback(() => {
    setSelectedNode(null);
    setSelectedComponent(null);
  }, []);

  // Get affected components for selected node
  const affectedComponents = useMemo(() => {
    if (selectedNode === null) return [];
    return getAffectedComponents(selectedNode);
  }, [selectedNode, getAffectedComponents]);

  // Get affecting nodes for selected component
  const affectingNodeIndices = useMemo(() => {
    if (!selectedComponent) return [];
    return getAffectingNodes(selectedComponent, componentPaths);
  }, [selectedComponent, componentPaths]);

  // Get component index and data for visualizations
  const selectedComponentIndex = useMemo(() => {
    if (!selectedComponent || !componentData || !Array.isArray(componentData)) return null;

    // componentData is passed as [array], so get the first element
    const dataArray = Array.isArray(componentData[0]) ? componentData[0] : componentData;
    if (!Array.isArray(dataArray) || dataArray.length === 0) return null;

    const index = dataArray.findIndex((comp) => comp.Component === selectedComponent);
    return index >= 0 ? index : null;
  }, [selectedComponent, componentData]);

  // Get time series data for selected component
  const currentTimeSeries = useMemo(() => {
    if (selectedComponentIndex === null || !mixingMatrix?.data) return null;
    try {
      // mixingMatrix.data is structured as [componentIndex][timepoint]
      const series = mixingMatrix.data[selectedComponentIndex];
      return Array.isArray(series) && series.length > 0 ? series : null;
    } catch (error) {
      console.error("Error extracting time series:", error);
      return null;
    }
  }, [selectedComponentIndex, mixingMatrix]);

  // Get component label
  const currentComponentLabel = useMemo(() => {
    if (!selectedComponent) return "";
    return formatComponentName(selectedComponent);
  }, [selectedComponent]);

  // Get classification for selected component
  const selectedClassification = useMemo(() => {
    if (!selectedComponent || !componentPaths[selectedComponent]) return "accepted";
    const path = componentPaths[selectedComponent];
    const finalClass = path.nodes[path.nodes.length - 1]?.classification || path.initial;
    return finalClass === "accepted" ? "accepted" : "rejected";
  }, [selectedComponent, componentPaths]);

  // Scroll to selected component
  useEffect(() => {
    if (selectedComponent && selectedComponentRef.current) {
      selectedComponentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedComponent]);

  if (!treeData || !treeData.nodes || treeData.nodes.length === 0) {
    return (
      <div
        style={{
          padding: "48px",
          textAlign: "center",
          color: colors.textSecondary,
        }}
      >
        <p>No decision tree nodes to display.</p>
      </div>
    );
  }

  return (
    <div
      onClick={handleReset}
      style={{
        display: "flex",
        gap: "24px",
        maxWidth: "100%",
        margin: "0 auto",
      }}
    >
      {/* Tree Flow - Left Side */}
      <div
        style={{
          flex: 1,
          padding: "0 24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: colors.text,
            marginBottom: "16px",
          }}
        >
          Decision Tree Flow
        </h3>
        {treeData.nodes.map((node, index) => {
          const isDecision = isDecisionNode(node);
          const isSelected = selectedNode === index;
          const isAffecting = affectingNodeIndices.includes(index);
          const isLastNode = index === treeData.nodes.length - 1;
          const hasSelection = selectedNode !== null || selectedComponent !== null;
          const shouldDim = hasSelection && !isSelected && !isAffecting;

          return (
            <div key={index} style={{ display: "flex", flexDirection: "column" }}>
              {/* Node Card */}
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => handleNodeClick(node, e)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNodeClick(node, e);
                  }
                }}
                style={{
                  padding: shouldDim ? "8px 16px" : "16px",
                  backgroundColor: isSelected ? colors.bgHover : colors.bgElevated,
                  border: `2px solid ${
                    isSelected ? colors.selected : isAffecting ? colors.decision : colors.border
                  }`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  opacity: shouldDim ? 0.4 : 1,
                  maxHeight: shouldDim ? "60px" : "none",
                  overflow: shouldDim ? "hidden" : "visible",
                }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = colors.bgHover;
                  e.currentTarget.style.borderColor = colors.borderHover;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = colors.bgElevated;
                  e.currentTarget.style.borderColor = isAffecting ? colors.decision : colors.border;
                }
              }}
            >
              {/* Node Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      color: colors.textSecondary,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Node {index}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      backgroundColor: isDecision ? colors.decision : colors.calc,
                      color: "#fff",
                      borderRadius: "4px",
                      fontWeight: "600",
                    }}
                  >
                    {isDecision ? "Decision" : "Calculation"}
                  </span>
                </div>
                {isDecision && (
                  <div style={{ display: "flex", gap: "12px", fontSize: "12px" }}>
                    <span style={{ color: colors.textSecondary }}>
                      True: <strong style={{ color: colors.text }}>{node.nTrue}</strong>
                    </span>
                    <span style={{ color: colors.textSecondary }}>
                      False: <strong style={{ color: colors.text }}>{node.nFalse}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Node Label */}
              <div style={{ fontSize: "14px", fontWeight: "600", color: colors.text, marginBottom: "4px" }}>
                {node.label}
              </div>

              {/* Node Details */}
              {isDecision && (
                <div style={{ fontSize: "12px", color: colors.textSecondary, marginTop: "8px" }}>
                  {node.operator && (
                    <div>
                      Condition: <code style={{ padding: "2px 6px", backgroundColor: colors.bg, borderRadius: "4px" }}>
                        {node.left} {node.operator} {node.right}
                      </code>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "16px", marginTop: "4px" }}>
                    {node.ifTrue !== "nochange" && (() => {
                      const formatted = formatClassification(node.ifTrue);
                      return (
                        <span>
                          If true → <strong style={{
                            color: formatted.isAccept ? colors.accepted : formatted.isReject ? colors.rejected : "inherit"
                          }}>{formatted.text}</strong>
                        </span>
                      );
                    })()}
                    {node.ifFalse !== "nochange" && (() => {
                      const formatted = formatClassification(node.ifFalse);
                      return (
                        <span>
                          If false → <strong style={{
                            color: formatted.isAccept ? colors.accepted : formatted.isReject ? colors.rejected : "inherit"
                          }}>{formatted.text}</strong>
                        </span>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Comment */}
              {node.comment && (
                <div
                  style={{
                    fontSize: "11px",
                    color: colors.textSecondary,
                    marginTop: "8px",
                    fontStyle: "italic",
                  }}
                >
                  {node.comment}
                </div>
              )}
              </div>

              {/* Connecting Line */}
              {!isLastNode && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: shouldDim ? "4px 0" : "8px 0",
                  }}
                >
                  <div
                    style={{
                      width: "2px",
                      height: shouldDim ? "16px" : "32px",
                      backgroundColor: colors.border,
                      opacity: shouldDim ? 0.4 : 1,
                      transition: "all 0.2s ease",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Component Details and Visualizations - Right Side */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          flex: 1,
          padding: "0 24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          position: "sticky",
          top: "0px",
          alignSelf: "flex-start",
          maxHeight: "calc(100vh - 120px)",
          gap: "16px",
          overflow: "auto",
        }}
      >
        {/* Component List */}
        <div
          style={{
            minHeight: selectedComponent ? "180px" : "auto",
            maxHeight: selectedComponent ? "280px" : "none",
            overflow: "auto",
            backgroundColor: colors.bgElevated,
            border: `1px solid ${colors.border}`,
            borderRadius: "8px",
            padding: "16px",
            width: "min(500px, 100%)",
            alignSelf: "center",
          }}
        >
          <h3
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: colors.text,
              marginBottom: "12px",
            }}
          >
            {selectedNode !== null ? "Affected Components" : "All Components"}
          </h3>


          {selectedNode !== null ? (
            // Show components affected by selected node
            affectedComponents.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {affectedComponents.map(({ id, path }) => (
                  <ComponentListItem
                    key={id}
                    id={id}
                    path={path}
                    isSelected={selectedComponent === id}
                    colors={colors}
                    onClick={handleComponentClick}
                    innerRef={selectedComponent === id ? selectedComponentRef : null}
                  />
                ))}
              </div>
            ) : (
              <p style={{ color: colors.textSecondary, fontSize: "13px", textAlign: "center", padding: "24px" }}>
                No components were affected by this node.
              </p>
            )
          ) : (
            // Show all components
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {Object.entries(componentPaths).map(([id, path]) => (
                <ComponentListItem
                  key={id}
                  id={id}
                  path={path}
                  isSelected={selectedComponent === id}
                  colors={colors}
                  onClick={handleComponentClick}
                  innerRef={selectedComponent === id ? selectedComponentRef : null}
                />
              ))}
            </div>
          )}
        </div>

        {/* Selected Component Path */}
        {selectedComponent && componentPaths[selectedComponent] && (
          <div
            style={{
              padding: "16px",
              backgroundColor: colors.bgElevated,
              border: `1px solid ${colors.border}`,
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              width: "min(500px, 100%)",
              alignSelf: "center",
              minHeight: "120px",
            }}
          >
            <h3
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: colors.text,
                marginBottom: "4px",
              }}
            >
              Classification Path
            </h3>

            <p style={{ fontSize: "12px", color: colors.textSecondary, marginBottom: "12px" }}>
              {selectedComponent.replace("_", " ")}
            </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start" }}>
              {/* Initial state */}
              {(() => {
                const initialFormatted = formatClassification(componentPaths[selectedComponent].initial);
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        backgroundColor: initialFormatted.isAccept ? colors.accepted : initialFormatted.isReject ? colors.rejected : colors.textSecondary,
                        color: "#fff",
                        borderRadius: "4px",
                        fontWeight: "600",
                      }}
                    >
                      {initialFormatted.text}
                    </span>
                    <span style={{ color: colors.textSecondary }}>Initial</span>
                  </div>
                );
              })()}

              {/* Changes at each node */}
              {componentPaths[selectedComponent].nodes.map((node, idx) => {
                const prev = idx === 0 ? componentPaths[selectedComponent].initial : componentPaths[selectedComponent].nodes[idx - 1].classification;
                const changed = node.classification !== prev;

                if (!changed) return null;

                const formatted = formatClassification(node.classification);

                return (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", marginLeft: "20px" }}>
                    <span style={{ color: colors.textSecondary }}>↓</span>
                    <span
                      style={{
                        padding: "4px 10px",
                        backgroundColor: formatted.isAccept ? colors.accepted : formatted.isReject ? colors.rejected : colors.textSecondary,
                        color: "#fff",
                        borderRadius: "4px",
                        fontWeight: "600",
                      }}
                    >
                      {formatted.text}
                    </span>
                    <span style={{ color: colors.textSecondary }}>Node {node.nodeIndex}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Component Visualizations */}
        {selectedComponent && hasInteractiveViews && selectedComponentIndex !== null && currentTimeSeries && (
          <div
            ref={visualizationContainerRef}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              backgroundColor: colors.bgElevated,
              border: `1px solid ${colors.border}`,
              borderRadius: "8px",
              padding: "16px",
              width: "100%",
              height: "calc(100vh - 500px)", // Fill available height minus other cards
              minHeight: "500px",
              maxHeight: "900px",
            }}
          >
            <h4 style={{ fontSize: "13px", fontWeight: "600", color: colors.text, marginBottom: "4px" }}>
              Component Visualization
            </h4>

            {/* Time series - full width */}
            <div style={{ width: "100%", minWidth: 0, flexShrink: 0 }}>
              <TimeSeries
                data={currentTimeSeries}
                width={containerWidth}
                height={180}
                title="Time Series"
                componentLabel={currentComponentLabel}
                lineColor={colorFor(selectedClassification, { isDark, colorblind, selected: true })}
                isDark={isDark}
              />
            </div>

            {/* Brain stat map viewer - only if NIfTI is available */}
            {hasBrainViewer && (
              <div style={{ width: "100%", minWidth: 0, flex: 1, minHeight: "300px" }}>
                <BrainViewer
                  niftiBuffer={niftiBuffer}
                  niftiUrl={niftiUrl}
                  maskBuffer={maskBuffer}
                  componentIndex={selectedComponentIndex}
                  width={containerWidth}
                  height={560}
                  componentLabel={currentComponentLabel}
                  isDark={isDark}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DecisionTree;
