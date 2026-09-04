import React, { useState, useCallback, useEffect, useRef } from "react";
import Papa from "papaparse";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder } from "@fortawesome/free-solid-svg-icons";
import { parseMixingMatrix } from "../utils/tsvParser";
import { extractTRFromNifti } from "../utils/niftiUtils";
import { LOGO_DATA_URL } from "../constants/logo";
import { VERSION_DISPLAY } from "../constants/version";
import { trackDatasetLoaded } from "../utils/analytics";
import { parseRunLabel, deriveRunLabels } from "../utils/pathUtils";

// Convert blob to data URL
function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Rank array helper
function rankArray(data) {
  const sorted = data.slice().sort((a, b) => b - a);
  return data.map((v) => sorted.indexOf(v) + 1);
}

// Add ranking columns to component data
function rankComponents(data) {
  const varNormalized = data.map((d) => d["normalized variance explained"]);
  const kappa = data.map((d) => d["kappa"]);
  const rho = data.map((d) => d["rho"]);

  const rankVariance = rankArray(varNormalized);
  const rankKappa = rankArray(kappa);
  const rankRho = rankArray(rho);

  data.forEach((d, i) => {
    d["variance explained rank"] = rankVariance[i];
    d["kappa rank"] = rankKappa[i];
    d["rho rank"] = rankRho[i];
  });
}

// Parse manual classification TSV file
function parseManualClassification(text) {
  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    delimiter: "\t",
  });
  
  // Check for parsing errors
  if (parsed.errors && parsed.errors.length > 0) {
    console.warn("Errors parsing manual_classification.tsv:", parsed.errors);
  }
  
  return parsed.data;
}

// Apply manual classifications to component data
function applyManualClassifications(components, manualClassificationData) {
  if (!manualClassificationData || !components.length) {
    return;
  }

  // Create a Map for O(n) lookup performance
  // Filter out entries with invalid Component field
  const manualMap = new Map(
    manualClassificationData
      .filter((entry) => entry.Component != null)
      .map((entry) => [entry.Component, entry])
  );

  let appliedCount = 0;
  components.forEach((component) => {
    // Skip components with invalid Component field
    if (component.Component == null) {
      return;
    }

    const manualEntry = manualMap.get(component.Component);
    if (manualEntry) {
      component.classification = manualEntry.classification;
      if (manualEntry.original_classification) {
        component.original_classification = manualEntry.original_classification;
      }
      if (manualEntry.classification_tags) {
        component.classification_tags = manualEntry.classification_tags;
      }
      if (manualEntry.rationale) {
        component.rationale = manualEntry.rationale;
      }
      appliedCount++;
    }
  });

  console.log("[Rica] Applied manual classifications to", appliedCount, "components");
}

// Promise wrapper for FileReader
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function IntroPopup({ onDataLoad, onLoadingStart, closePopup, isLoading, isDark }) {
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });
  const hasTriedServerLoad = useRef(false);

  // Load files from local server via HTTP
  const loadFromServer = useCallback(
    async (files, basePath) => {
      console.log("[Rica] Starting server load with", files.length, "files");
      onLoadingStart();

      // Filter to relevant files
      const relevantFiles = files.filter(
        (f) =>
          f.includes("comp_") ||
          f.includes(".svg") ||
          f.endsWith("report.txt") ||
          (f.includes("_metrics.tsv") && !f.toLowerCase().includes("pca")) ||
          (f.startsWith("tedana_20") || f.endsWith("_tedana_log.tsv")) ||
          (f.includes("_mixing.tsv") && !f.toLowerCase().includes("pca") && !f.toLowerCase().includes("orth")) ||
          (f.includes("_components.nii.gz") && f.toLowerCase().includes("ica") && !f.includes("stat-z") && !f.includes("echo-")) ||
          f === "betas_OC.nii.gz" ||
          f.includes("_mask.nii") ||
          (f.includes("CrossComponent_metrics.json") && !f.toLowerCase().includes("pca")) ||
          (f.includes("cross_component_metrics.json") && !f.toLowerCase().includes("pca")) ||
          f === "manual_classification.tsv" ||
          // QC NIfTI files
          f.includes("T2starmap.nii") ||
          f.includes("t2svG.nii") ||
          f.includes("S0map.nii") ||
          f === "s0vG.nii.gz" ||
          f.includes("rmse_statmap.nii") ||
          f === "rmse.nii.gz" ||
          // Decision tree files
          f.includes("decision_tree.json") ||
          f.includes("status_table.tsv") ||
          f.includes("registry.json")
      );

      setLoadingProgress({ current: 0, total: relevantFiles.length });

      // Detect BIDS run entities across all relevant files
      const allFilenames = relevantFiles.map((f) => f.split("/").pop());
      const runLabels = deriveRunLabels(allFilenames);
      const N = runLabels.length || 1;
      const runIndexOf = new Map(runLabels.map((l, i) => [l, i]));

      // Returns the run index(es) a file belongs to.
      // Files without a run entity are "shared" and broadcast to all runs.
      const getTargets = (filename) => {
        const label = parseRunLabel(filename);
        if (label && runIndexOf.has(label)) return [runIndexOf.get(label)];
        return [...Array(N).keys()];
      };

      // Per-run accumulators (indexed arrays)
      const compFigures = Array.from({ length: N }, () => []);
      const carpetFigures = Array.from({ length: N }, () => []);
      const diagnosticFigures = Array.from({ length: N }, () => []);
      const info = new Array(N).fill("");
      const components = new Array(N).fill(null).map(() => []);
      const originalData = new Array(N).fill(null).map(() => []);
      const dirPath = new Array(N).fill(basePath || "");
      const mixingMatrix = new Array(N).fill(null);
      const niftiBuffer = new Array(N).fill(null);
      const niftiUrl = new Array(N).fill(null);
      const maskBuffer = new Array(N).fill(null);
      const crossComponentMetrics = new Array(N).fill(null);
      const qcNiftiBuffers = Array.from({ length: N }, () => ({}));
      const externalRegressorsFigure = new Array(N).fill(null);
      const manualClassificationData = new Array(N).fill(null);
      const decisionTreeData = new Array(N).fill(null);
      const statusTableData = new Array(N).fill(null);
      const repetitionTime = new Array(N).fill(null);

      // Process files via HTTP fetch (parallel)
      try {
      const filePromises = relevantFiles.map(async (filepath) => {
        const filename = filepath.split("/").pop();
        const targets = getTargets(filename);

        try {
          // Component figures (PNG)
          if (filename.includes("comp_") && filename.endsWith(".png")) {
            const response = await fetch(`/${filepath}`);
            const blob = await response.blob();
            const dataUrl = await blobToDataURL(blob);
            for (const i of targets) compFigures[i].push({ name: filename, img: dataUrl });
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // SVG figures (carpet plots vs diagnostic figures vs external regressors)
          if (filename.endsWith(".svg")) {
            const response = await fetch(`/${filepath}`);
            const blob = await response.blob();
            const dataUrl = await blobToDataURL(blob);
            if (filename.includes("carpet_")) {
              for (const i of targets) carpetFigures[i].push({ name: filename, img: dataUrl });
            } else if (filename.includes("confound_correlations")) {
              for (const i of targets) externalRegressorsFigure[i] = dataUrl;
            } else {
              for (const i of targets) diagnosticFigures[i].push({ name: filename, img: dataUrl });
            }
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Report info
          if (filename.endsWith("report.txt")) {
            const response = await fetch(`/${filepath}`);
            const text = await response.text();
            for (const i of targets) info[i] = text;
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Component metrics table
          if (filename.includes("_metrics.tsv") && !filename.toLowerCase().includes("pca")) {
            const response = await fetch(`/${filepath}`);
            const text = await response.text();
            const parsed = Papa.parse(text, {
              header: true,
              skipEmptyLines: true,
              dynamicTyping: true,
            });
            const orig = JSON.parse(JSON.stringify(parsed.data));
            rankComponents(parsed.data);
            for (const i of targets) {
              originalData[i] = orig;
              components[i] = parsed.data;
            }
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Dataset path
          if (filename.startsWith("tedana_20") || filename.endsWith("_tedana_log.tsv")) {
            const response = await fetch(`/${filepath}`);
            const text = await response.text();
            const lines = text.split("\n");
            for (const line of lines) {
              if (line.includes("Using output directory:")) {
                const match = line.match(/Using output directory:\s*(.+)/);
                if (match) {
                  for (const i of targets) dirPath[i] = match[1].trim();
                  break;
                }
              }
            }
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // ICA Mixing matrix (exclude PCA and Orth variants)
          if (filename.includes("_mixing.tsv") && !filename.toLowerCase().includes("pca") && !filename.toLowerCase().includes("orth")) {
            const response = await fetch(`/${filepath}`);
            const text = await response.text();
            const mx = parseMixingMatrix(text);
            for (const i of targets) mixingMatrix[i] = mx;
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // ICA components NIfTI
          if ((filename.includes("_components.nii.gz") && filename.toLowerCase().includes("ica") && !filename.includes("stat-z") && !filename.includes("echo-")) || filename === "betas_OC.nii.gz") {
            // Extract TR from NIfTI header using a Range request (first 4KB is enough to
            // decompress the header from gzip), independent of loading the full file.
            // Only trust 206 Partial Content — if the proxy doesn't forward Range headers,
            // the server returns 200 with the full file, which would hang on arrayBuffer().
            for (const i of targets) {
              if (!repetitionTime[i]) {
                try {
                  const headerResponse = await fetch(`/${filepath}`, {
                    headers: { Range: "bytes=0-4095" },
                  });
                  if (headerResponse.status === 206) {
                    const headerBuffer = await headerResponse.arrayBuffer();
                    const tr = await extractTRFromNifti(headerBuffer);
                    if (tr) {
                      repetitionTime[i] = tr;
                      console.log("[Rica] Extracted RepetitionTime from NIfTI header (Range):", tr);
                    }
                  }
                } catch {
                  // Range requests not supported; TR won't be extracted from header
                }
              }
              // Use URL — BrainViewer prefers URL over buffer anyway, and skipping the
              // full download avoids hanging Promise.all on large files through the proxy.
              niftiUrl[i] = `/${filepath}`;
            }
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Brain mask NIfTI
          if (filename.includes("_mask.nii")) {
            const response = await fetch(`/${filepath}`);
            const buf = await response.arrayBuffer();
            for (const i of targets) {
              if (!maskBuffer[i]) maskBuffer[i] = buf;
            }
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Cross-component metrics (for elbow thresholds)
          if ((filename.includes("CrossComponent_metrics.json") && !filename.toLowerCase().includes("pca")) ||
              (filename.includes("cross_component_metrics.json") && !filename.toLowerCase().includes("pca"))) {
            const response = await fetch(`/${filepath}`);
            const ccm = await response.json();
            for (const i of targets) crossComponentMetrics[i] = ccm;
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // QC NIfTI files (T2*, S0, RMSE)
          if (filename.includes("T2starmap.nii") || filename.includes("t2svG.nii")) {
            const response = await fetch(`/${filepath}`);
            const buf = await response.arrayBuffer();
            for (const i of targets) qcNiftiBuffers[i].t2star = buf;
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }
          if ((filename.includes("S0map.nii") && !filename.includes("limited")) || filename === "s0vG.nii.gz") {
            const response = await fetch(`/${filepath}`);
            const buf = await response.arrayBuffer();
            for (const i of targets) qcNiftiBuffers[i].s0 = buf;
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }
          if (filename.includes("rmse_statmap.nii") || filename === "rmse.nii.gz") {
            const response = await fetch(`/${filepath}`);
            const buf = await response.arrayBuffer();
            for (const i of targets) qcNiftiBuffers[i].rmse = buf;
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Manual classification file
          if (filename === "manual_classification.tsv") {
            const response = await fetch(`/${filepath}`);
            const text = await response.text();
            const mcd = parseManualClassification(text);
            console.log("[Rica] Loaded manual_classification.tsv with", mcd?.length || 0, "entries");
            for (const i of targets) manualClassificationData[i] = mcd;
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Decision tree JSON
          if (filename.includes("decision_tree.json")) {
            const response = await fetch(`/${filepath}`);
            const text = await response.text();
            const dtd = JSON.parse(text);
            console.log("[Rica] Loaded decision tree with", dtd?.nodes?.length || 0, "nodes");
            for (const i of targets) decisionTreeData[i] = dtd;
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Status table TSV
          if (filename.includes("status_table.tsv")) {
            const response = await fetch(`/${filepath}`);
            const text = await response.text();
            const parsed = Papa.parse(text, {
              header: true,
              skipEmptyLines: true,
              dynamicTyping: false, // Keep as strings for classification states
              delimiter: "\t",
            });
            console.log("[Rica] Loaded status table with", parsed.data?.length || 0, "components");
            for (const i of targets) statusTableData[i] = parsed.data;
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Registry JSON (for RepetitionTime)
          if (filename.includes("registry.json")) {
            try {
              const response = await fetch(`/${filepath}`);
              if (response.ok) {
                const registry = await response.json();
                const rt = registry?.RepetitionTime;
                if (typeof rt === "number" && Number.isFinite(rt) && rt > 0) {
                  for (const i of targets) {
                    if (!repetitionTime[i]) repetitionTime[i] = rt;
                  }
                  console.log("[Rica] Loaded RepetitionTime from registry:", rt);
                }
              }
            } catch (registryError) {
              console.error(`Error loading registry ${filepath}:`, registryError);
            }
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }
        } catch (error) {
          console.error(`Error fetching file ${filepath}:`, error);
        }
      });
      await Promise.all(filePromises);

      // Sort figures by name per run, apply manual classifications
      for (let i = 0; i < N; i++) {
        compFigures[i].sort((a, b) => a.name.localeCompare(b.name));
        carpetFigures[i].sort((a, b) => a.name.localeCompare(b.name));
        diagnosticFigures[i].sort((a, b) => a.name.localeCompare(b.name));
        applyManualClassifications(components[i], manualClassificationData[i]);
      }

      trackDatasetLoaded();

      const displayLabels = runLabels.length ? runLabels : ["run-01"];

      // Pass all data to parent
      onDataLoad({
        runs: displayLabels,
        componentFigures: compFigures,
        carpetFigures,
        diagnosticFigures,
        components,
        info,
        originalData,
        dirPath,
        mixingMatrix,
        niftiBuffer,
        niftiUrl,
        maskBuffer,
        crossComponentMetrics,
        qcNiftiBuffers,
        externalRegressorsFigure,
        hasManualClassifications: manualClassificationData.some((m) => m && m.length > 0),
        decisionTreeData,
        statusTableData,
        repetitionTime,
      });
      } catch (err) {
        console.error("[Rica] loadFromServer failed:", err);
        const displayLabels = runLabels.length ? runLabels : ["run-01"];
        onDataLoad({
          runs: displayLabels,
          componentFigures: compFigures,
          carpetFigures,
          diagnosticFigures,
          components,
          info,
          originalData,
          dirPath,
          mixingMatrix,
          niftiBuffer,
          niftiUrl,
          maskBuffer,
          crossComponentMetrics,
          qcNiftiBuffers,
          externalRegressorsFigure,
          hasManualClassifications: manualClassificationData.some((m) => m && m.length > 0),
          decisionTreeData,
          statusTableData,
          repetitionTime,
        });
      }
    },
    [onDataLoad, onLoadingStart]
  );

  // Check for local server on mount and auto-load if files found
  useEffect(() => {
    // Only try once and only on localhost
    if (hasTriedServerLoad.current) return;
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") return;

    hasTriedServerLoad.current = true;
    console.log("[Rica] Checking for local server files...");

    // Try to fetch file list from server
    fetch("/api/files")
      .then((r) => r.json())
      .then((data) => {
        console.log("[Rica] Server response:", data.files?.length, "files found");
        if (data.files?.length > 0) {
          // Auto-load immediately
          loadFromServer(data.files, data.path);
        }
      })
      .catch((err) => {
        console.log("[Rica] No local server detected:", err.message);
        // Not running with Rica server, use manual folder selection
      });
  }, [loadFromServer]);

  const processFiles = useCallback(
    async (e) => {
      onLoadingStart();

      const files = Array.from(e.target.files);
      const totalFiles = files.filter(
        (f) =>
          f.name.includes("comp_") ||
          f.name.includes(".svg") ||
          f.name.endsWith("report.txt") ||
          (f.name.includes("_metrics.tsv") && !f.name.toLowerCase().includes("pca")) ||
          (f.name.startsWith("tedana_20") || f.name.endsWith("_tedana_log.tsv")) ||
          // New files for Niivue integration
          (f.name.includes("_mixing.tsv") && !f.name.toLowerCase().includes("pca") && !f.name.toLowerCase().includes("orth")) ||
          (f.name.includes("_components.nii.gz") && f.name.toLowerCase().includes("ica") && !f.name.includes("stat-z") && !f.name.includes("echo-")) ||
          f.name === "betas_OC.nii.gz" ||
          f.name.includes("_mask.nii") ||
          (f.name.includes("CrossComponent_metrics.json") && !f.name.toLowerCase().includes("pca")) ||
          (f.name.includes("cross_component_metrics.json") && !f.name.toLowerCase().includes("pca")) ||
          f.name === "manual_classification.tsv" ||
          // QC NIfTI files
          f.name.includes("T2starmap.nii") ||
          f.name.includes("t2svG.nii") ||
          f.name.includes("S0map.nii") ||
          f.name === "s0vG.nii.gz" ||
          f.name.includes("rmse_statmap.nii") ||
          f.name === "rmse.nii.gz" ||
          // Decision tree files
          f.name.includes("decision_tree.json") ||
          f.name.includes("status_table.tsv") ||
          f.name.includes("registry.json")
      ).length;

      setLoadingProgress({ current: 0, total: totalFiles });

      // Detect BIDS run entities across all relevant files
      const allFilenames = files.map((f) => f.name);
      const runLabels = deriveRunLabels(allFilenames);
      const N = runLabels.length || 1;
      const runIndexOf = new Map(runLabels.map((l, i) => [l, i]));

      // Returns the run index(es) a file belongs to.
      // Files without a run entity are "shared" and broadcast to all runs.
      const getTargets = (filename) => {
        const label = parseRunLabel(filename);
        if (label && runIndexOf.has(label)) return [runIndexOf.get(label)];
        return [...Array(N).keys()];
      };

      // Per-run accumulators (indexed arrays)
      const compFigures = Array.from({ length: N }, () => []);
      const carpetFigures = Array.from({ length: N }, () => []);
      const diagnosticFigures = Array.from({ length: N }, () => []);
      const info = new Array(N).fill("");
      const components = new Array(N).fill(null).map(() => []);
      const originalData = new Array(N).fill(null).map(() => []);
      const dirPath = new Array(N).fill("");
      const mixingMatrix = new Array(N).fill(null);
      const niftiBuffer = new Array(N).fill(null);
      const niftiUrl = new Array(N).fill(null);
      const maskBuffer = new Array(N).fill(null);
      const crossComponentMetrics = new Array(N).fill(null);
      const qcNiftiBuffers = Array.from({ length: N }, () => ({}));
      const externalRegressorsFigure = new Array(N).fill(null);
      const manualClassificationData = new Array(N).fill(null);
      const decisionTreeData = new Array(N).fill(null);
      const statusTableData = new Array(N).fill(null);
      const repetitionTime = new Array(N).fill(null);

      // Process all files in parallel using Promise.all
      const filePromises = files.map(async (file) => {
        const filename = file.name;
        const targets = getTargets(filename);

        try {
          // Component figures (PNG)
          if (filename.includes("comp_") && filename.endsWith(".png")) {
            const dataUrl = await readFileAsDataURL(file);
            for (const i of targets) compFigures[i].push({ name: filename, img: dataUrl });
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // SVG figures (carpet plots vs diagnostic figures vs external regressors)
          if (filename.endsWith(".svg")) {
            const dataUrl = await readFileAsDataURL(file);
            if (filename.includes("carpet_")) {
              for (const i of targets) carpetFigures[i].push({ name: filename, img: dataUrl });
            } else if (filename.includes("confound_correlations")) {
              for (const i of targets) externalRegressorsFigure[i] = dataUrl;
            } else {
              for (const i of targets) diagnosticFigures[i].push({ name: filename, img: dataUrl });
            }
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Report info
          if (filename.endsWith("report.txt")) {
            const text = await readFileAsText(file);
            for (const i of targets) info[i] = text;
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Component metrics table
          if (filename.includes("_metrics.tsv") && !filename.toLowerCase().includes("pca")) {
            const text = await readFileAsText(file);
            const parsed = Papa.parse(text, {
              header: true,
              skipEmptyLines: true,
              dynamicTyping: true,
            });
            const orig = JSON.parse(JSON.stringify(parsed.data));
            rankComponents(parsed.data);
            for (const i of targets) {
              originalData[i] = orig;
              components[i] = parsed.data;
            }
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Dataset path
          if (filename.startsWith("tedana_20") || filename.endsWith("_tedana_log.tsv")) {
            const text = await readFileAsText(file);
            // Look for the line containing "Using output directory:"
            const lines = text.split("\n");
            for (const line of lines) {
              if (line.includes("Using output directory:")) {
                const match = line.match(/Using output directory:\s*(.+)/);
                if (match) {
                  for (const i of targets) dirPath[i] = match[1].trim();
                  break;
                }
              }
            }
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // ICA Mixing matrix (time series data for Niivue, exclude PCA and Orth variants)
          if (filename.includes("_mixing.tsv") && !filename.toLowerCase().includes("pca") && !filename.toLowerCase().includes("orth")) {
            const text = await readFileAsText(file);
            const mx = parseMixingMatrix(text);
            for (const i of targets) mixingMatrix[i] = mx;
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // ICA components NIfTI (4D brain maps for Niivue)
          if ((filename.includes("_components.nii.gz") && filename.toLowerCase().includes("ica") && !filename.includes("stat-z") && !filename.includes("echo-")) || filename === "betas_OC.nii.gz") {
            // Extract TR from first 4KB only — enough to decompress the NIfTI header
            // from gzip — independent of loading the full (potentially huge) file.
            for (const i of targets) {
              if (!repetitionTime[i]) {
                const headerBuffer = await file.slice(0, 4096).arrayBuffer();
                const tr = await extractTRFromNifti(headerBuffer);
                if (tr) {
                  repetitionTime[i] = tr;
                  console.log("[Rica] Extracted RepetitionTime from NIfTI header (4KB slice):", tr);
                }
              }
              // Always set URL so BrainViewer can load even if buffer fails
              niftiUrl[i] = URL.createObjectURL(file);
              // Also try loading the full buffer (fails gracefully for very large files)
              try {
                niftiBuffer[i] = await readFileAsArrayBuffer(file);
              } catch {
                console.warn("[Rica] NIfTI too large for ArrayBuffer, Niivue will load from blob URL");
              }
            }
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Brain mask NIfTI (for masking stat maps in Niivue)
          if (filename.includes("_mask.nii")) {
            const buf = await readFileAsArrayBuffer(file);
            for (const i of targets) {
              if (!maskBuffer[i]) maskBuffer[i] = buf;
            }
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Cross-component metrics (for elbow thresholds)
          if ((filename.includes("CrossComponent_metrics.json") && !filename.toLowerCase().includes("pca")) ||
              (filename.includes("cross_component_metrics.json") && !filename.toLowerCase().includes("pca"))) {
            const text = await readFileAsText(file);
            const ccm = JSON.parse(text);
            for (const i of targets) crossComponentMetrics[i] = ccm;
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // QC NIfTI files (T2*, S0, RMSE)
          if (filename.includes("T2starmap.nii") || filename.includes("t2svG.nii")) {
            const buf = await readFileAsArrayBuffer(file);
            for (const i of targets) qcNiftiBuffers[i].t2star = buf;
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }
          if ((filename.includes("S0map.nii") && !filename.includes("limited")) || filename === "s0vG.nii.gz") {
            const buf = await readFileAsArrayBuffer(file);
            for (const i of targets) qcNiftiBuffers[i].s0 = buf;
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }
          if (filename.includes("rmse_statmap.nii") || filename === "rmse.nii.gz") {
            const buf = await readFileAsArrayBuffer(file);
            for (const i of targets) qcNiftiBuffers[i].rmse = buf;
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Manual classification file
          if (filename === "manual_classification.tsv") {
            const text = await readFileAsText(file);
            const mcd = parseManualClassification(text);
            console.log("[Rica] Loaded manual_classification.tsv with", mcd?.length || 0, "entries");
            for (const i of targets) manualClassificationData[i] = mcd;
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Decision tree JSON
          if (filename.includes("decision_tree.json")) {
            const text = await readFileAsText(file);
            const dtd = JSON.parse(text);
            console.log("[Rica] Loaded decision tree with", dtd?.nodes?.length || 0, "nodes");
            for (const i of targets) decisionTreeData[i] = dtd;
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Status table TSV
          if (filename.includes("status_table.tsv")) {
            const text = await readFileAsText(file);
            const parsed = Papa.parse(text, {
              header: true,
              skipEmptyLines: true,
              dynamicTyping: false, // Keep as strings for classification states
              delimiter: "\t",
            });
            console.log("[Rica] Loaded status table with", parsed.data?.length || 0, "components");
            for (const i of targets) statusTableData[i] = parsed.data;
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Registry JSON (for RepetitionTime)
          if (filename.includes("registry.json")) {
            try {
              const text = await readFileAsText(file);
              const registry = JSON.parse(text);
              const rt = registry?.RepetitionTime;
              if (typeof rt === "number" && Number.isFinite(rt) && rt > 0) {
                for (const i of targets) {
                  if (!repetitionTime[i]) repetitionTime[i] = rt;
                }
                console.log("[Rica] Loaded RepetitionTime from registry:", rt);
              }
            } catch (registryError) {
              console.error(`Error parsing registry.json:`, registryError);
            }
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }
        } catch (error) {
          console.error(`Error reading file ${filename}:`, error);
        }
      });

      // Wait for all files to be processed
      await Promise.all(filePromises);

      // Sort figures by name per run, apply manual classifications
      for (let i = 0; i < N; i++) {
        compFigures[i].sort((a, b) => a.name.localeCompare(b.name));
        carpetFigures[i].sort((a, b) => a.name.localeCompare(b.name));
        diagnosticFigures[i].sort((a, b) => a.name.localeCompare(b.name));
        applyManualClassifications(components[i], manualClassificationData[i]);
      }

      trackDatasetLoaded();

      const displayLabels = runLabels.length ? runLabels : ["run-01"];

      // Pass all data to parent at once - no delays!
      onDataLoad({
        runs: displayLabels,
        componentFigures: compFigures,
        carpetFigures,
        diagnosticFigures,
        components,
        info,
        originalData,
        dirPath,
        mixingMatrix,
        niftiBuffer,
        niftiUrl,
        maskBuffer,
        crossComponentMetrics,
        qcNiftiBuffers,
        externalRegressorsFigure,
        hasManualClassifications: manualClassificationData.some((m) => m && m.length > 0),
        decisionTreeData,
        statusTableData,
        repetitionTime,
      });
    },
    [onDataLoad, onLoadingStart]
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={closePopup}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
          margin: '0 24px',
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: '16px',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closePopup}
          type="button"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-tertiary)';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M13.7 0.3c-0.4-0.4-1-0.4-1.4 0L7 5.6 1.7 0.3c-0.4-0.4-1-0.4-1.4 0s-0.4 1 0 1.4L5.6 7l-5.3 5.3c-0.4 0.4-0.4 1 0 1.4 0.2 0.2 0.4 0.3 0.7 0.3s0.5-0.1 0.7-0.3L7 8.4l5.3 5.3c0.2 0.2 0.5 0.3 0.7 0.3s0.5-0.1 0.7-0.3c0.4-0.4 0.4-1 0-1.4L8.4 7l5.3-5.3c0.4-0.4 0.4-1 0-1.4z"/>
          </svg>
        </button>

        <div style={{ padding: '32px' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              {/* Loading spinner */}
              <div style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 20px',
                border: '3px solid var(--border-default)',
                borderTopColor: 'var(--accent-accepted)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

              <p style={{
                fontSize: '15px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                marginBottom: '8px'
              }}>
                Processing files
              </p>

              {loadingProgress.total > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: 'var(--border-default)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div
                      style={{
                        width: `${(loadingProgress.current / loadingProgress.total) * 100}%`,
                        height: '100%',
                        backgroundColor: 'var(--accent-accepted)',
                        borderRadius: '2px',
                        transition: 'width 0.2s ease',
                      }}
                    />
                  </div>
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--text-tertiary)',
                    marginTop: '12px',
                    fontFamily: "monospace",
                  }}>
                    {loadingProgress.current} / {loadingProgress.total}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Logo */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <img
                  src={LOGO_DATA_URL}
                  alt="Rica"
                  style={{ width: '36px', height: '36px' }}
                />
                <div>
                  <h1 style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}>
                    Rica
                  </h1>
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--text-tertiary)',
                    margin: 0,
                    marginTop: '2px',
                  }}>
                    {VERSION_DISPLAY}
                  </p>
                </div>
              </div>

              <p style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '20px'
              }}>
                Load a <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>tedana</span> output folder to visualize and classify ICA components interactively.
              </p>

              <div style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid var(--border-subtle)',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-tertiary)',
                  lineHeight: 1.5,
                  margin: 0
                }}>
                  Files are processed locally in your browser
                </p>
              </div>

              <label
                htmlFor="file-upload"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  width: '100%',
                  height: '44px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: isDark ? '#0a0a0b' : '#ffffff',
                  backgroundColor: isDark ? '#fafafa' : '#111827',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <FontAwesomeIcon icon={faFolder} />
                Select folder
                <input
                  id="file-upload"
                  type="file"
                  name="file"
                  directory=""
                  webkitdirectory=""
                  onChange={processFiles}
                  style={{ display: 'none' }}
                />
              </label>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default IntroPopup;
