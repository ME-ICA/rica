import React, { useState, useCallback, useEffect, useRef } from "react";
import Papa from "papaparse";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder } from "@fortawesome/free-solid-svg-icons";
import { parseMixingMatrix } from "../utils/tsvParser";

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
          f === "report.txt" ||
          (f.includes("_metrics.tsv") && !f.includes("PCA")) ||
          (f.startsWith("tedana_20") && f.endsWith(".tsv")) ||
          (f.includes("_mixing.tsv") && !f.includes("PCA")) ||
          (f.includes("stat-z_components.nii.gz") && f.includes("ICA")) ||
          f.includes("_mask.nii")
      );

      setLoadingProgress({ current: 0, total: relevantFiles.length });

      const compFigures = [];
      const carpetFigures = [];
      let info = "";
      let components = [];
      let originalData = [];
      let dirPath = basePath || "";
      let mixingMatrix = null;
      let niftiBuffer = null;
      let maskBuffer = null;

      // Process files via HTTP fetch
      for (const filepath of relevantFiles) {
        const filename = filepath.split("/").pop();

        try {
          // Component figures (PNG)
          if (filename.includes("comp_") && filename.endsWith(".png")) {
            const response = await fetch(`/${filepath}`);
            const blob = await response.blob();
            const dataUrl = await blobToDataURL(blob);
            compFigures.push({ name: filename, img: dataUrl });
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Carpet plots (SVG)
          if (filename.endsWith(".svg")) {
            const response = await fetch(`/${filepath}`);
            const blob = await response.blob();
            const dataUrl = await blobToDataURL(blob);
            carpetFigures.push({ name: filename, img: dataUrl });
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Report info
          if (filename === "report.txt") {
            const response = await fetch(`/${filepath}`);
            info = await response.text();
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Component metrics table
          if (filename.includes("_metrics.tsv") && !filename.includes("PCA")) {
            const response = await fetch(`/${filepath}`);
            const text = await response.text();
            const parsed = Papa.parse(text, {
              header: true,
              skipEmptyLines: true,
              dynamicTyping: true,
            });
            originalData = JSON.parse(JSON.stringify(parsed.data));
            rankComponents(parsed.data);
            components = parsed.data;
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Dataset path
          if (filename.startsWith("tedana_20") && filename.endsWith(".tsv")) {
            const response = await fetch(`/${filepath}`);
            const text = await response.text();
            const lines = text.split("\n");
            for (const line of lines) {
              if (line.includes("Using output directory:")) {
                const match = line.match(/Using output directory:\s*(.+)/);
                if (match) {
                  dirPath = match[1].trim();
                  break;
                }
              }
            }
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // ICA Mixing matrix
          if (filename.includes("_mixing.tsv") && !filename.includes("PCA")) {
            const response = await fetch(`/${filepath}`);
            const text = await response.text();
            mixingMatrix = parseMixingMatrix(text);
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // ICA stat-z components NIfTI
          if (filename.includes("stat-z_components.nii.gz") && filename.includes("ICA")) {
            const response = await fetch(`/${filepath}`);
            niftiBuffer = await response.arrayBuffer();
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Brain mask NIfTI
          if (filename.includes("_mask.nii") && !maskBuffer) {
            const response = await fetch(`/${filepath}`);
            maskBuffer = await response.arrayBuffer();
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }
        } catch (error) {
          console.error(`Error fetching file ${filepath}:`, error);
        }
      }

      // Sort component figures by name
      compFigures.sort((a, b) => a.name.localeCompare(b.name));
      carpetFigures.sort((a, b) => a.name.localeCompare(b.name));

      // Pass all data to parent
      onDataLoad({
        componentFigures: compFigures,
        carpetFigures,
        components: [components],
        info,
        originalData: [originalData],
        dirPath,
        mixingMatrix,
        niftiBuffer,
        maskBuffer,
      });
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
          f.name === "report.txt" ||
          (f.name.includes("_metrics.tsv") && !f.name.includes("PCA")) ||
          (f.name.startsWith("tedana_20") && f.name.endsWith(".tsv")) ||
          // New files for Niivue integration
          (f.name.includes("_mixing.tsv") && !f.name.includes("PCA")) ||
          (f.name.includes("stat-z_components.nii.gz") && f.name.includes("ICA")) ||
          f.name.includes("_mask.nii")
      ).length;

      setLoadingProgress({ current: 0, total: totalFiles });

      const compFigures = [];
      const carpetFigures = [];
      let info = "";
      let components = [];
      let originalData = [];
      let dirPath = "";
      let mixingMatrix = null;
      let niftiBuffer = null;
      let maskBuffer = null;

      // Process all files in parallel using Promise.all
      const filePromises = files.map(async (file) => {
        const filename = file.name;

        try {
          // Component figures (PNG)
          if (filename.includes("comp_") && filename.endsWith(".png")) {
            const dataUrl = await readFileAsDataURL(file);
            compFigures.push({ name: filename, img: dataUrl });
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Carpet plots (SVG)
          if (filename.endsWith(".svg")) {
            const dataUrl = await readFileAsDataURL(file);
            carpetFigures.push({ name: filename, img: dataUrl });
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Report info
          if (filename === "report.txt") {
            info = await readFileAsText(file);
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Component metrics table
          if (filename.includes("_metrics.tsv") && !filename.includes("PCA")) {
            const text = await readFileAsText(file);
            const parsed = Papa.parse(text, {
              header: true,
              skipEmptyLines: true,
              dynamicTyping: true,
            });
            originalData = JSON.parse(JSON.stringify(parsed.data));
            rankComponents(parsed.data);
            components = parsed.data;
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Dataset path
          if (filename.startsWith("tedana_20") && filename.endsWith(".tsv")) {
            const text = await readFileAsText(file);
            // Look for the line containing "Using output directory:"
            const lines = text.split("\n");
            for (const line of lines) {
              if (line.includes("Using output directory:")) {
                const match = line.match(/Using output directory:\s*(.+)/);
                if (match) {
                  dirPath = match[1].trim();
                  break;
                }
              }
            }
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // ICA Mixing matrix (time series data for Niivue)
          if (filename.includes("_mixing.tsv") && !filename.includes("PCA")) {
            const text = await readFileAsText(file);
            mixingMatrix = parseMixingMatrix(text);
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // ICA stat-z components NIfTI (4D brain maps for Niivue)
          if (filename.includes("stat-z_components.nii.gz") && filename.includes("ICA")) {
            niftiBuffer = await readFileAsArrayBuffer(file);
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }

          // Brain mask NIfTI (for masking stat maps in Niivue)
          if (filename.includes("_mask.nii") && !maskBuffer) {
            maskBuffer = await readFileAsArrayBuffer(file);
            setLoadingProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }
        } catch (error) {
          console.error(`Error reading file ${filename}:`, error);
        }
      });

      // Wait for all files to be processed
      await Promise.all(filePromises);

      // Sort component figures by name for consistent ordering
      compFigures.sort((a, b) => a.name.localeCompare(b.name));
      carpetFigures.sort((a, b) => a.name.localeCompare(b.name));

      // Pass all data to parent at once - no delays!
      onDataLoad({
        componentFigures: compFigures,
        carpetFigures,
        components: [components],
        info,
        originalData: [originalData],
        dirPath,
        // New data for Niivue integration
        mixingMatrix,
        niftiBuffer,
        maskBuffer,
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
                  src="/favicon.ico"
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
                    v2.0.0
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
