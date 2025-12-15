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
import { assignColor } from "./PlotUtils";

// Chart dimensions - sized to fit 2x2 in half screen width
// Each chart takes ~45% of half the screen width (with gap)
const CHART_WIDTH = 420;
const CHART_HEIGHT = 380;

const COLORS = {
  accepted: "#86EFAC",
  acceptedHover: "#22C55E",
  rejected: "#FCA5A5",
  rejectedHover: "#EF4444",
  ignored: "#7DD3FC",
  ignoredHover: "#0EA5E9",
};

function Plots({ componentData, componentFigures, originalData, mixingMatrix, niftiBuffer, maskBuffer }) {
  const [processedData, setProcessedData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedClassification, setSelectedClassification] = useState("accepted");
  const [clickedElement, setClickedElement] = useState("");

  // Check if we have the new interactive visualization data
  const hasInteractiveViews = mixingMatrix?.data && niftiBuffer;

  // Get current component's time series from mixing matrix
  const currentTimeSeries = useMemo(() => {
    if (!mixingMatrix?.data || selectedIndex < 0 || selectedIndex >= mixingMatrix.data.length) {
      return [];
    }
    return mixingMatrix.data[selectedIndex] || [];
  }, [mixingMatrix, selectedIndex]);

  // Get current component label
  const currentComponentLabel = useMemo(() => {
    return processedData[selectedIndex]?.label || "";
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
      // Navigate using pie chart order
      const currentPieIdx = pieData.findIndex((d) => d.originalIdx === selectedIndex);
      if (currentPieIdx > 0) {
        const newOriginalIdx = pieData[currentPieIdx - 1].originalIdx;
        setSelectedIndex(newOriginalIdx);
        setSelectedClassification(processedData[newOriginalIdx]?.classification || "accepted");
        findComponentImage(newOriginalIdx, processedData);
      }
    },
    [selectedIndex, pieData, processedData, findComponentImage]
  );

  useHotkeys(
    "right",
    () => {
      // Navigate using pie chart order
      const currentPieIdx = pieData.findIndex((d) => d.originalIdx === selectedIndex);
      if (currentPieIdx < pieData.length - 1) {
        const newOriginalIdx = pieData[currentPieIdx + 1].originalIdx;
        setSelectedIndex(newOriginalIdx);
        setSelectedClassification(processedData[newOriginalIdx]?.classification || "accepted");
        findComponentImage(newOriginalIdx, processedData);
      }
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
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading chart data...</p>
      </div>
    );
  }

  return (
    <div tabIndex={0} className="outline-none w-full">
      {/* Top controls */}
      <div className="flex flex-row items-center justify-center gap-6 mt-6">
        <ToggleSwitch
          values={["accepted", "rejected"]}
          selected={selectedClassification}
          colors={[COLORS.accepted, COLORS.rejected]}
          handleNewSelection={handleNewSelection}
        />
        <ResetAndSave
          handleReset={initializeData}
          handleSave={saveManualClassification}
        />
      </div>

      <div className="text-center mt-2 text-sm text-gray-500">
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
                />

                {/* Variance Pie Chart */}
                <PieChart
                  data={pieData}
                  width={CHART_WIDTH}
                  height={CHART_HEIGHT}
                  title="Variance Explained"
                  selectedIndex={selectedPieIndex}
                  onSliceClick={handlePieClick}
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
                />
              </div>
            </div>

        {/* Right side: Component visualization - 50% width */}
        <div
          style={{
            width: '50%',
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
                  lineColor={selectedClassification === 'accepted' ? '#22C55E' : '#EF4444'}
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
                />
              </div>

              {/* FFT on bottom */}
              <div style={{ width: '100%' }}>
                <FFTSpectrum
                  timeSeries={currentTimeSeries}
                  width={800}
                  height={180}
                  title="Power Spectrum"
                  sampleRate={1}
                  lineColor={selectedClassification === 'accepted' ? '#22C55E' : '#EF4444'}
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
      />
    </div>
  );
}

export default Plots;
