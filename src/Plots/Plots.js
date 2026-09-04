import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import ToggleSwitch from "./ToggleSwitch";
import ResetAndSave from "./ResetAndSave";
import ScatterPlot from "./ScatterPlot";
import PieChart from "./PieChart";
import TimeSeries from "./TimeSeries";
import FFTSpectrum from "./FFTSpectrum";
import BrainViewer from "./BrainViewer";
import ComponentTable from "./ComponentTable";
import CorrelationHeatmap from "./CorrelationHeatmap";
import CitationPopUp from "../PopUps/CitationPopUp";
import { assignColor, formatComponentName } from "./PlotUtils";
import { colorFor } from "../constants/palette";
import { useTheme } from "../contexts/theme";

// Chart dimensions - sized to fit 2x2 in half screen width
// Reduced for better screen fit (was 420x380)
const CHART_WIDTH = 360;
const CHART_HEIGHT = 320;


function Plots({ componentData, componentFigures, originalData, mixingMatrix, niftiBuffer, niftiUrl, maskBuffer, crossComponentMetrics, externalRegressorsFigure, repetitionTime, isDark = false }) {
  const { colorblind = false } = useTheme() || {};
  const [processedData, setProcessedData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedClassification, setSelectedClassification] = useState("accepted");
  const [clickedElement, setClickedElement] = useState("");

  // Toggle for static PNG vs interactive Niivue - persisted to localStorage
  const [useStaticView, setUseStaticView] = useState(() => {
    const saved = localStorage.getItem('rica-use-static-view');
    return saved === 'true';
  });

  // Toggle for component table visibility - persisted to localStorage
  const [isTableCollapsed, setIsTableCollapsed] = useState(() => {
    const saved = localStorage.getItem('rica-table-collapsed');
    return saved === 'true';
  });

  // Citation popup state - shown after saving
  const [showCitationPopup, setShowCitationPopup] = useState(false);

  // Toggle for keeping original order vs grouping by new classification
  // Persisted to localStorage so Rica remembers the user's preference
  // Default: true (keep original order, don't regroup)
  const [keepOriginalOrder, setKeepOriginalOrder] = useState(() => {
    const saved = localStorage.getItem('rica-keep-original-order');
    return saved !== 'false'; // Default to true unless explicitly set to false
  });

  // Sort column and direction for component table / keyboard navigation
  const [sortColumn, setSortColumn] = useState(
    () => localStorage.getItem('rica-sort-column') || ''
  );
  const [sortDirection, setSortDirection] = useState(
    () => localStorage.getItem('rica-sort-direction') || 'desc'
  );

  // Persist preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('rica-keep-original-order', keepOriginalOrder.toString());
  }, [keepOriginalOrder]);

  useEffect(() => {
    localStorage.setItem('rica-use-static-view', useStaticView.toString());
  }, [useStaticView]);

  useEffect(() => {
    localStorage.setItem('rica-table-collapsed', isTableCollapsed.toString());
  }, [isTableCollapsed]);

  useEffect(() => {
    localStorage.setItem('rica-sort-column', sortColumn);
  }, [sortColumn]);

  useEffect(() => {
    localStorage.setItem('rica-sort-direction', sortDirection);
  }, [sortDirection]);

  // Interactive views (time series + FFT) require only the mixing matrix.
  // The brain viewer additionally requires the NIfTI.
  const hasInteractiveViews = mixingMatrix?.data?.length > 0;
  const hasBrainViewer = !!(niftiBuffer || niftiUrl);

  // Extract elbow thresholds from cross-component metrics (if available)
  const kappaElbow = crossComponentMetrics?.kappa_allcomps_elbow;
  const rhoElbow = crossComponentMetrics?.rho_allcomps_elbow;

  // Compute connecting line data for rank plots (sorted by rank)
  const kappaRankLine = useMemo(() => {
    if (!processedData.length) return [];
    // Sort by kappa rank and create line data
    const sorted = [...processedData].sort((a, b) => a.kappaRank - b.kappaRank);
    return sorted.map((d) => ({ x: d.kappaRank, y: d.kappa }));
  }, [processedData]);

  const rhoRankLine = useMemo(() => {
    if (!processedData.length) return [];
    // Sort by rho rank and create line data
    const sorted = [...processedData].sort((a, b) => a.rhoRank - b.rhoRank);
    return sorted.map((d) => ({ x: d.rhoRank, y: d.rho }));
  }, [processedData]);

  // Get current component's time series from mixing matrix
  const currentTimeSeries = useMemo(() => {
    if (!mixingMatrix?.data || selectedIndex < 0 || selectedIndex >= mixingMatrix.data.length) {
      return [];
    }
    return mixingMatrix.data[selectedIndex] || [];
  }, [mixingMatrix, selectedIndex]);

  // Get current component label (formatted for display)
  const currentComponentLabel = useMemo(() => {
    const label = processedData[selectedIndex]?.label || "";
    return formatComponentName(label);
  }, [processedData, selectedIndex]);

  // Extract external regressor correlation columns from componentData
  const externalRegressorColumns = useMemo(() => {
    if (!componentData?.[0]?.length) return [];
    const firstComponent = componentData[0][0];
    if (!firstComponent) return [];
    // Find all columns that contain "external regressor correlation"
    return Object.keys(firstComponent).filter(key =>
      key.toLowerCase().includes('external regressor correlation')
    );
  }, [componentData]);

  // Check if we have external regressor correlation data
  const hasExternalRegressorData = externalRegressorColumns.length > 0;

  // Initialize data from props
  const initializeData = useCallback(() => {
    if (!componentData?.[0]?.length) return;

    const compData = JSON.parse(JSON.stringify(componentData[0]));
    assignColor(compData);

    // Create unified data structure
    // Store originalClassification so we can optionally sort by it later
    const processed = compData.map((d, i) => ({
      label: d.Component,
      kappa: d.kappa,
      rho: d.rho,
      kappaRank: d["kappa rank"],
      rhoRank: d["rho rank"],
      variance: d["variance explained"],
      classification: d.classification,
      originalClassification: d.classification, // Store original for "keep original order" feature
      originalIndex: i,
    }));

    setProcessedData(processed);

    // Set initial image
    if (componentFigures?.length && processed.length) {
      findComponentImage(0, processed);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentData, componentFigures]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Reset to first component when the run changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [componentData]);

  // Find and display component image
  const findComponentImage = useCallback(
    (index, data) => {
      if (!componentFigures?.length || !data?.[index]) return;

      const label = data[index].label;
      const match = label.match(/\d+/g);
      if (!match) return;

      let compNum = match.join("");
      if (compNum.length === 2) compNum = "0" + compNum;
      const compName = `comp_${compNum}.png`;

      const figure = componentFigures.find((f) => f.name.includes(compName));
      if (figure) {
        setClickedElement(figure.img);
      }
    },
    [componentFigures]
  );

  // Handle classification change
  const handleNewSelection = useCallback(
    (val) => {
      setProcessedData((prev) => {
        const updated = [...prev];
        if (updated[selectedIndex]) {
          updated[selectedIndex] = {
            ...updated[selectedIndex],
            classification: val,
          };
        }
        return updated;
      });
      setSelectedClassification(val);
    },
    [selectedIndex]
  );

  // Handle point/slice click
  const handlePointClick = useCallback(
    (index) => {
      setSelectedIndex(index);
      setSelectedClassification(processedData[index]?.classification || "accepted");
      findComponentImage(index, processedData);
    },
    [processedData, findComponentImage]
  );

  // Prepare pie chart data (sorted by classification, then variance descending)
  // Defined here so keyboard navigation can use it
  // When keepOriginalOrder is true, components stay grouped by their ORIGINAL classification
  // (so reclassified components don't move, they just change color)
  const pieData = useMemo(() => {
    if (!processedData.length) return [];

    // Classification order: accepted first, then rejected
    const classificationOrder = { accepted: 0, rejected: 1 };

    // Create a mapping to track original indices
    const withOriginalIndex = processedData.map((d, i) => ({ ...d, originalIdx: i }));

    // Sort for pie display: group by classification, then by variance (highest first)
    // Use originalClassification when keepOriginalOrder is true so components don't move
    const sorted = [...withOriginalIndex].sort((a, b) => {
      const classA = keepOriginalOrder ? a.originalClassification : a.classification;
      const classB = keepOriginalOrder ? b.originalClassification : b.classification;
      const orderA = classificationOrder[classA] ?? 3;
      const orderB = classificationOrder[classB] ?? 3;
      if (orderA !== orderB) return orderA - orderB;
      return b.variance - a.variance; // Highest variance first within each group
    });

    return sorted.map((d) => ({
      ...d,
      value: d.variance,
      pieIndex: d.originalIdx,
    }));
  }, [processedData, keepOriginalOrder]);

  // Count accepted/rejected components for the toggle labels
  const componentCounts = useMemo(
    () =>
      processedData.reduce(
        (counts, d) => {
          if (d.classification === "accepted") counts.accepted += 1;
          else if (d.classification === "rejected") counts.rejected += 1;
          return counts;
        },
        { accepted: 0, rejected: 0 }
      ),
    [processedData]
  );

  // Find selected index in pie data
  const selectedPieIndex = useMemo(() => {
    return pieData.findIndex((d) => d.originalIdx === selectedIndex);
  }, [pieData, selectedIndex]);

  // Navigation order for keyboard arrow keys and component table display.
  // When a sortColumn is active, components are ordered by that metric.
  // Otherwise falls back to pieData order (classification-grouped, variance-desc).
  const navigationOrder = useMemo(() => {
    if (!sortColumn || !processedData.length) return pieData;
    const fullData = componentData?.[0] || [];
    return [...processedData.map((d, i) => ({ ...d, originalIdx: i }))].sort((a, b) => {
      const valA = fullData[a.originalIdx]?.[sortColumn] ?? null;
      const valB = fullData[b.originalIdx]?.[sortColumn] ?? null;
      if (valA === null && valB === null) return 0;
      if (valA === null) return 1;
      if (valB === null) return -1;
      if (typeof valA === 'string' || typeof valB === 'string') {
        return sortDirection === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      }
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
  }, [processedData, sortColumn, sortDirection, componentData, pieData]);

  const sortedIndices = useMemo(
    () => sortColumn
      ? navigationOrder.map((d) => d.originalIdx)
      : processedData.map((_, i) => i),
    [navigationOrder, sortColumn, processedData]
  );

  // Handle column header click: desc → asc → clear
  const handleSort = useCallback((col) => {
    if (sortColumn === col) {
      if (sortDirection === 'asc') {
        setSortColumn('');
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(col);
      setSortDirection('desc');
    }
  }, [sortColumn, sortDirection]);

  // Keyboard shortcuts
  useHotkeys("a", () => handleNewSelection("accepted"), [handleNewSelection]);
  useHotkeys("r", () => handleNewSelection("rejected"), [handleNewSelection]);

  useHotkeys(
    "left",
    () => {
      if (navigationOrder.length === 0) return;
      const currentIdx = navigationOrder.findIndex((d) => d.originalIdx === selectedIndex);
      const newIdx = currentIdx <= 0 ? navigationOrder.length - 1 : currentIdx - 1;
      const newOriginalIdx = navigationOrder[newIdx].originalIdx;
      setSelectedIndex(newOriginalIdx);
      setSelectedClassification(processedData[newOriginalIdx]?.classification || "accepted");
      findComponentImage(newOriginalIdx, processedData);
    },
    [selectedIndex, navigationOrder, processedData, findComponentImage]
  );

  useHotkeys(
    "right",
    () => {
      if (navigationOrder.length === 0) return;
      const currentIdx = navigationOrder.findIndex((d) => d.originalIdx === selectedIndex);
      const newIdx = currentIdx >= navigationOrder.length - 1 ? 0 : currentIdx + 1;
      const newOriginalIdx = navigationOrder[newIdx].originalIdx;
      setSelectedIndex(newOriginalIdx);
      setSelectedClassification(processedData[newOriginalIdx]?.classification || "accepted");
      findComponentImage(newOriginalIdx, processedData);
    },
    [selectedIndex, navigationOrder, processedData, findComponentImage]
  );

  // Save handler
  const saveManualClassification = useCallback(() => {
    if (!originalData?.[0]) return;

    const origData = JSON.parse(JSON.stringify(originalData[0]));

    origData.forEach((row, i) => {
      delete row.color;
      delete row.colorHover;

      const processed = processedData.find((p) => p.label === row.Component);
      if (processed) {
        row.original_classification = row.classification;
        row.classification = processed.classification;

        if (row.classification !== row.original_classification) {
          row.classification_tags =
            (row.classification_tags || "") + ", Manual reclassify with Rica";
          if (row.rationale !== undefined) {
            row.rationale = "I001";
          }
        }
      }
    });

    // Generate TSV
    const headings = Object.keys(origData[0]).join("\t");
    const rows = origData.map((row) => Object.values(row).join("\t")).join("\n");
    const tsv = [headings, rows].join("\n");

    // Extract accepted/rejected indices
    const accepted = [];
    const rejected = [];

    origData.forEach((row, i) => {
      const isManual =
        row.classification_tags?.includes("Manual reclassify with Rica") ||
        row.rationale === "I001";

      if (row.classification === "accepted" && isManual) {
        accepted.push(i);
      }
      if (row.classification === "rejected" && isManual) {
        rejected.push(i);
      }
    });

    // Download files
    const downloadFile = (content, filename, type = "text/plain") => {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    };

    downloadFile(accepted.join(","), "accepted.txt");
    downloadFile(rejected.join(","), "rejected.txt");
    downloadFile(tsv, "manual_classification.tsv", "text/tab-separated-values");

    // Show citation popup after save
    setShowCitationPopup(true);
  }, [originalData, processedData]);

  // Handle pie slice click - map back to original index
  const handlePieClick = useCallback(
    (pieIdx) => {
      const originalIdx = pieData[pieIdx]?.originalIdx;
      if (originalIdx !== undefined) {
        handlePointClick(originalIdx);
      }
    },
    [pieData, handlePointClick]
  );

  if (!processedData.length) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '256px',
        color: 'var(--text-tertiary)',
      }}>
        <p>Loading chart data...</p>
      </div>
    );
  }

  return (
    <div tabIndex={0} className="outline-none focus:outline-none focus:ring-0 w-full" style={{ outline: "none", boxShadow: "none" }}>
      {/* Top controls */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        marginTop: '24px',
      }}>
        <ToggleSwitch
          values={["accepted", "rejected"]}
          selected={selectedClassification}
          colors={[colorFor("accepted", { isDark, colorblind }), colorFor("rejected", { isDark, colorblind })]}
          handleNewSelection={handleNewSelection}
          isDark={isDark}
          counts={componentCounts}
        />
        <ResetAndSave
          handleReset={initializeData}
          handleSave={saveManualClassification}
          isDark={isDark}
        />
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: '8px',
        fontSize: '13px',
        color: 'var(--text-tertiary)',
      }}>
        Click to select. Scroll to zoom. Double-click to zoom in. Use A/R keys to classify.
      </div>

      {/* Main content: plots on left, brain image on right */}
      <div className="flex flex-row w-full px-4 py-4 gap-4 mt-2">
        {/* Left side: 4 interactive plots in 2x2 grid - 50% width */}
        <div className="w-1/2 flex justify-center">
          <div className="grid grid-cols-2 gap-2">
                {/* Kappa vs Rho scatter plot */}
                <ScatterPlot
                  data={processedData}
                  width={CHART_WIDTH}
                  height={CHART_HEIGHT}
                  title="Kappa vs Rho"
                  xLabel="Kappa"
                  yLabel="Rho"
                  selectedIndex={selectedIndex}
                  onPointClick={handlePointClick}
                  getX={(d) => d.kappa}
                  getY={(d) => d.rho}
                  isDark={isDark}
                  vLine={kappaElbow}
                  hLine={rhoElbow}
                  showDiagonal={true}
                />

                {/* Variance Pie Chart with Regroup button */}
                <div style={{ position: 'relative' }}>
                  {/* Regroup button - positioned above pie chart */}
                  <button
                    onClick={() => setKeepOriginalOrder(!keepOriginalOrder)}
                    aria-pressed={!keepOriginalOrder}
                    aria-label="Regroup reclassified components by new classification"
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      zIndex: 10,
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 500,
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: !keepOriginalOrder ? '#3b82f6' : (isDark ? '#3f3f46' : '#d1d5db'),
                      color: !keepOriginalOrder ? '#fff' : (isDark ? '#a1a1aa' : '#6b7280'),
                    }}
                  >
                    Regroup
                  </button>
                  <PieChart
                    data={pieData}
                    width={CHART_WIDTH}
                    height={CHART_HEIGHT}
                    title="Variance Explained"
                    selectedIndex={selectedPieIndex}
                    onSliceClick={handlePieClick}
                    isDark={isDark}
                  />
                </div>

                {/* Rho vs Rank scatter plot */}
                <ScatterPlot
                  data={processedData}
                  width={CHART_WIDTH}
                  height={CHART_HEIGHT}
                  title="Rho Rank"
                  xLabel="Rank"
                  yLabel="Rho"
                  selectedIndex={selectedIndex}
                  onPointClick={handlePointClick}
                  getX={(d) => d.rhoRank}
                  getY={(d) => d.rho}
                  isDark={isDark}
                  hLine={rhoElbow}
                  connectingLine={rhoRankLine}
                />

                {/* Kappa vs Rank scatter plot */}
                <ScatterPlot
                  data={processedData}
                  width={CHART_WIDTH}
                  height={CHART_HEIGHT}
                  title="Kappa Rank"
                  xLabel="Rank"
                  yLabel="Kappa"
                  selectedIndex={selectedIndex}
                  onPointClick={handlePointClick}
                  getX={(d) => d.kappaRank}
                  getY={(d) => d.kappa}
                  isDark={isDark}
                  hLine={kappaElbow}
                  connectingLine={kappaRankLine}
                />
              </div>
            </div>

        {/* Right side: Component visualization - 50% width to match left */}
        <div
          style={{
            width: '50%',
            maxWidth: '800px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {/* Static button - single toggle, gray when off, green when active */}
          {hasInteractiveViews && (
            <button
              onClick={() => setUseStaticView(!useStaticView)}
              aria-pressed={useStaticView}
              aria-label="Switch to static PNG view"
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 500,
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: '4px',
                backgroundColor: useStaticView ? '#3b82f6' : (isDark ? '#3f3f46' : '#d1d5db'),
                color: useStaticView ? '#fff' : (isDark ? '#a1a1aa' : '#6b7280'),
              }}
            >
              Static
            </button>
          )}

          {hasInteractiveViews && !useStaticView ? (
            <>
              {/* Time series on top */}
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <TimeSeries
                  data={currentTimeSeries}
                  width={750}
                  height={150}
                  title="Time Series"
                  componentLabel={currentComponentLabel}
                  lineColor={colorFor(selectedClassification, { isDark, colorblind, selected: true })}
                  isDark={isDark}
                />
              </div>

              {/* Brain stat map viewer in middle — only if NIfTI is available */}
              {hasBrainViewer && (
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <BrainViewer
                    niftiBuffer={niftiBuffer}
                    niftiUrl={niftiUrl}
                    maskBuffer={maskBuffer}
                    componentIndex={selectedIndex}
                    width={750}
                    height={560}
                    componentLabel={currentComponentLabel}
                    isDark={isDark}
                  />
                </div>
              )}

              {/* FFT on bottom */}
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <FFTSpectrum
                  timeSeries={currentTimeSeries}
                  width={750}
                  height={150}
                  title="Power Spectrum"
                  tr={repetitionTime != null && repetitionTime > 0 ? repetitionTime : 1}
                  showHz={repetitionTime != null && repetitionTime > 0}
                  lineColor={colorFor(selectedClassification, { isDark, colorblind, selected: true })}
                  isDark={isDark}
                />
              </div>
            </>
          ) : (
            /* Static PNG display - either by choice or fallback */
            clickedElement && (
              <img
                className="max-w-full h-auto rounded-lg shadow-lg"
                alt="Component visualization"
                src={clickedElement}
                style={{ maxHeight: '600px' }}
              />
            )
          )}
        </div>
      </div>

      {/* Component table - full width below charts (collapsible) */}
      <ComponentTable
        data={componentData?.[0] || []}
        selectedIndex={selectedIndex}
        onRowClick={handlePointClick}
        classifications={processedData.map((d) => d.classification)}
        isDark={isDark}
        isCollapsed={isTableCollapsed}
        onToggleCollapse={() => setIsTableCollapsed(!isTableCollapsed)}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        sortedIndices={sortedIndices}
      />

      {/* External Regressors Correlation Heatmap (interactive) or static figure */}
      {(hasExternalRegressorData || externalRegressorsFigure) && (
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '24px 16px',
          marginTop: '16px',
        }}>
          {hasExternalRegressorData ? (
            // Interactive heatmap when correlation data is available in metrics TSV
            <div style={{ width: '100%', maxWidth: '1400px' }}>
              <CorrelationHeatmap
                data={componentData[0]}
                regressorColumns={externalRegressorColumns}
                width={Math.min(1400, 200 + externalRegressorColumns.length * 80)}
                height={Math.min(800, 160 + processedData.length * 20)}
                selectedIndex={selectedIndex}
                onCellClick={handlePointClick}
                isDark={isDark}
              />
            </div>
          ) : (
            // Fallback to static SVG if no correlation data but figure exists
            <>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '16px',
              }}>
                External Regressor Correlations
              </h3>
              <img
                src={externalRegressorsFigure}
                alt="External Regressor Correlations"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                }}
              />
            </>
          )}
        </div>
      )}

      {/* Citation popup - shown after saving */}
      {showCitationPopup && (
        <CitationPopUp
          closePopup={() => setShowCitationPopup(false)}
          isDark={isDark}
        />
      )}
    </div>
  );
}

export default Plots;
