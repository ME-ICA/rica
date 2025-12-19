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
import { assignColor, formatComponentName } from "./PlotUtils";

// Chart dimensions - sized to fit 2x2 in half screen width
// Each chart takes ~45% of half the screen width (with gap)
const CHART_WIDTH = 420;
const CHART_HEIGHT = 380;

// Theme-aware colors
const getColors = (isDark) => ({
  // Light mode: softer pastel colors
  // Dark mode: more saturated colors that pop on dark backgrounds
  accepted: isDark ? "#4ade80" : "#86EFAC",
  acceptedHover: isDark ? "#22c55e" : "#22C55E",
  rejected: isDark ? "#f87171" : "#FCA5A5",
  rejectedHover: isDark ? "#ef4444" : "#EF4444",
  ignored: isDark ? "#38bdf8" : "#7DD3FC",
  ignoredHover: isDark ? "#0ea5e9" : "#0EA5E9",
});


function Plots({ componentData, componentFigures, originalData, mixingMatrix, niftiBuffer, maskBuffer, isDark = false }) {
  const [processedData, setProcessedData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedClassification, setSelectedClassification] = useState("accepted");
  const [clickedElement, setClickedElement] = useState("");
  const [colormapSaturation, setColormapSaturation] = useState(0.25); // Default 25%

  // Check if we have the new interactive visualization data
  const hasInteractiveViews = mixingMatrix?.data && niftiBuffer;

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

  // Initialize data from props
  const initializeData = useCallback(() => {
    if (!componentData?.[0]?.length) return;

    const compData = JSON.parse(JSON.stringify(componentData[0]));
    assignColor(compData);

    // Create unified data structure
    const processed = compData.map((d, i) => ({
      label: d.Component,
      kappa: d.kappa,
      rho: d.rho,
      kappaRank: d["kappa rank"],
      rhoRank: d["rho rank"],
      variance: d["variance explained"],
      classification: d.classification,
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
  const pieData = useMemo(() => {
    if (!processedData.length) return [];

    // Classification order: accepted first, then rejected
    const classificationOrder = { accepted: 0, rejected: 1 };

    // Create a mapping to track original indices
    const withOriginalIndex = processedData.map((d, i) => ({ ...d, originalIdx: i }));

    // Sort for pie display: group by classification, then by variance (highest first)
    const sorted = [...withOriginalIndex].sort((a, b) => {
      const orderA = classificationOrder[a.classification] ?? 3;
      const orderB = classificationOrder[b.classification] ?? 3;
      if (orderA !== orderB) return orderA - orderB;
      return b.variance - a.variance; // Highest variance first within each group
    });

    return sorted.map((d) => ({
      ...d,
      value: d.variance,
      pieIndex: d.originalIdx,
    }));
  }, [processedData]);

  // Find selected index in pie data
  const selectedPieIndex = useMemo(() => {
    return pieData.findIndex((d) => d.originalIdx === selectedIndex);
  }, [pieData, selectedIndex]);

  // Keyboard shortcuts
  useHotkeys("a", () => handleNewSelection("accepted"), [handleNewSelection]);
  useHotkeys("r", () => handleNewSelection("rejected"), [handleNewSelection]);

  useHotkeys(
    "left",
    () => {
      // Navigate using pie chart order (wraps around)
      if (pieData.length === 0) return;
      const currentPieIdx = pieData.findIndex((d) => d.originalIdx === selectedIndex);
      const newPieIdx = currentPieIdx <= 0 ? pieData.length - 1 : currentPieIdx - 1;
      const newOriginalIdx = pieData[newPieIdx].originalIdx;
      setSelectedIndex(newOriginalIdx);
      setSelectedClassification(processedData[newOriginalIdx]?.classification || "accepted");
      findComponentImage(newOriginalIdx, processedData);
    },
    [selectedIndex, pieData, processedData, findComponentImage]
  );

  useHotkeys(
    "right",
    () => {
      // Navigate using pie chart order (wraps around)
      if (pieData.length === 0) return;
      const currentPieIdx = pieData.findIndex((d) => d.originalIdx === selectedIndex);
      const newPieIdx = currentPieIdx >= pieData.length - 1 ? 0 : currentPieIdx + 1;
      const newOriginalIdx = pieData[newPieIdx].originalIdx;
      setSelectedIndex(newOriginalIdx);
      setSelectedClassification(processedData[newOriginalIdx]?.classification || "accepted");
      findComponentImage(newOriginalIdx, processedData);
    },
    [selectedIndex, pieData, processedData, findComponentImage]
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
          colors={[getColors(isDark).accepted, getColors(isDark).rejected]}
          handleNewSelection={handleNewSelection}
          isDark={isDark}
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
                />

                {/* Variance Pie Chart */}
                <PieChart
                  data={pieData}
                  width={CHART_WIDTH}
                  height={CHART_HEIGHT}
                  title="Variance Explained"
                  selectedIndex={selectedPieIndex}
                  onSliceClick={handlePieClick}
                  isDark={isDark}
                />

                {/* Rho vs Rank scatter plot */}
                <ScatterPlot
                  data={processedData}
                  width={CHART_WIDTH}
                  height={CHART_HEIGHT}
                  title="Rho vs Rank"
                  xLabel="Rank"
                  yLabel="Rho"
                  selectedIndex={selectedIndex}
                  onPointClick={handlePointClick}
                  getX={(d) => d.rhoRank}
                  getY={(d) => d.rho}
                  isDark={isDark}
                />

                {/* Kappa vs Rank scatter plot */}
                <ScatterPlot
                  data={processedData}
                  width={CHART_WIDTH}
                  height={CHART_HEIGHT}
                  title="Kappa vs Rank"
                  xLabel="Rank"
                  yLabel="Kappa"
                  selectedIndex={selectedIndex}
                  onPointClick={handlePointClick}
                  getX={(d) => d.kappaRank}
                  getY={(d) => d.kappa}
                  isDark={isDark}
                />
              </div>
            </div>

        {/* Right side: Component visualization - 800px to match charts */}
        <div
          style={{
            width: '800px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {hasInteractiveViews ? (
            <>
              {/* Time series on top */}
              <div style={{ width: '100%' }}>
                <TimeSeries
                  data={currentTimeSeries}
                  width={800}
                  height={180}
                  title="Time Series"
                  componentLabel={currentComponentLabel}
                  lineColor={selectedClassification === 'accepted' ? getColors(isDark).acceptedHover : getColors(isDark).rejectedHover}
                  isDark={isDark}
                />
              </div>

              {/* Brain stat map viewer in middle */}
              <div style={{ width: '100%' }}>
                <BrainViewer
                  niftiBuffer={niftiBuffer}
                  maskBuffer={maskBuffer}
                  componentIndex={selectedIndex}
                  width={800}
                  height={350}
                  componentLabel={currentComponentLabel}
                  saturation={colormapSaturation}
                  isDark={isDark}
                />
              </div>

              {/* Saturation slider */}
              <div style={{
                width: '800px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '8px 0',
              }}>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Saturation:</span>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={colormapSaturation * 100}
                  onChange={(e) => setColormapSaturation(parseFloat(e.target.value) / 100)}
                  className="focus:outline-none"
                  style={{
                    width: '400px',
                    cursor: 'pointer',
                    accentColor: '#3b82f6',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', minWidth: '40px', textAlign: 'right' }}>
                  {Math.round(colormapSaturation * 100)}%
                </span>
              </div>

              {/* FFT on bottom */}
              <div style={{ width: '100%' }}>
                <FFTSpectrum
                  timeSeries={currentTimeSeries}
                  width={800}
                  height={180}
                  title="Power Spectrum"
                  sampleRate={1}
                  lineColor={selectedClassification === 'accepted' ? getColors(isDark).acceptedHover : getColors(isDark).rejectedHover}
                  isDark={isDark}
                />
              </div>
            </>
          ) : (
            /* Fallback to existing PNG display */
            clickedElement && (
              <img
                className="max-w-full h-auto rounded-lg shadow-lg"
                alt="Component visualization"
                src={clickedElement}
              />
            )
          )}
        </div>
      </div>

      {/* Component table - full width below charts */}
      <ComponentTable
        data={componentData?.[0] || []}
        selectedIndex={selectedIndex}
        onRowClick={handlePointClick}
        classifications={processedData.map((d) => d.classification)}
        isDark={isDark}
      />
    </div>
  );
}

export default Plots;
