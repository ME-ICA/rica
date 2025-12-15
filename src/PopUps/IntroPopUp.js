import React, { useState, useCallback } from "react";
import Papa from "papaparse";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { parseMixingMatrix } from "../utils/tsvParser";

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

function IntroPopup({ onDataLoad, onLoadingStart, closePopup, isLoading }) {
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });

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

      let processed = 0;

      // Process all files in parallel using Promise.all
      const filePromises = files.map(async (file) => {
        const filename = file.name;

        try {
          // Component figures (PNG)
          if (filename.includes("comp_") && filename.endsWith(".png")) {
            const dataUrl = await readFileAsDataURL(file);
            compFigures.push({ name: filename, img: dataUrl });
            processed++;
            setLoadingProgress((prev) => ({ ...prev, current: processed }));
          }

          // Carpet plots (SVG)
          if (filename.endsWith(".svg")) {
            const dataUrl = await readFileAsDataURL(file);
            carpetFigures.push({ name: filename, img: dataUrl });
            processed++;
            setLoadingProgress((prev) => ({ ...prev, current: processed }));
          }

          // Report info
          if (filename === "report.txt") {
            info = await readFileAsText(file);
            processed++;
            setLoadingProgress((prev) => ({ ...prev, current: processed }));
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
            processed++;
            setLoadingProgress((prev) => ({ ...prev, current: processed }));
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
            processed++;
            setLoadingProgress((prev) => ({ ...prev, current: processed }));
          }

          // ICA Mixing matrix (time series data for Niivue)
          if (filename.includes("_mixing.tsv") && !filename.includes("PCA")) {
            const text = await readFileAsText(file);
            mixingMatrix = parseMixingMatrix(text);
            processed++;
            setLoadingProgress((prev) => ({ ...prev, current: processed }));
          }

          // ICA stat-z components NIfTI (4D brain maps for Niivue)
          if (filename.includes("stat-z_components.nii.gz") && filename.includes("ICA")) {
            niftiBuffer = await readFileAsArrayBuffer(file);
            processed++;
            setLoadingProgress((prev) => ({ ...prev, current: processed }));
          }

          // Brain mask NIfTI (for masking stat maps in Niivue)
          if (filename.includes("_mask.nii") && !maskBuffer) {
            maskBuffer = await readFileAsArrayBuffer(file);
            processed++;
            setLoadingProgress((prev) => ({ ...prev, current: processed }));
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
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
      }}
      onClick={closePopup}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '480px',
          margin: '0 16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 20px 50px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closePopup}
          type="button"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#9ca3af',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.target.style.backgroundColor = '#f3f4f6'; e.target.style.color = '#374151'; }}
          onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#9ca3af'; }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M13.7 0.3c-0.4-0.4-1-0.4-1.4 0L7 5.6 1.7 0.3c-0.4-0.4-1-0.4-1.4 0s-0.4 1 0 1.4L5.6 7l-5.3 5.3c-0.4 0.4-0.4 1 0 1.4 0.2 0.2 0.4 0.3 0.7 0.3s0.5-0.1 0.7-0.3L7 8.4l5.3 5.3c0.2 0.2 0.5 0.3 0.7 0.3s0.5-0.1 0.7-0.3c0.4-0.4 0.4-1 0-1.4L8.4 7l5.3-5.3c0.4-0.4 0.4-1 0-1.4z"/>
          </svg>
        </button>

        <div style={{ padding: '32px' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <FontAwesomeIcon
                icon={faSpinner}
                style={{ fontSize: '32px', color: '#3b82f6', marginBottom: '16px' }}
                spin
              />
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                Processing files...
              </h2>
              {loadingProgress.total > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ width: '100%', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${(loadingProgress.current / loadingProgress.total) * 100}%`,
                        height: '100%',
                        backgroundColor: '#3b82f6',
                        borderRadius: '2px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '12px' }}>
                    {loadingProgress.current} of {loadingProgress.total} files
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
                Welcome to Rica
              </h1>

              <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '16px' }}>
                Rica is a visualization tool for ICA decompositions from <strong style={{ color: '#374151' }}>tedana</strong>.
              </p>

              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                padding: '12px 14px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <span style={{ fontSize: '14px' }}>🔒</span>
                <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.5, margin: 0 }}>
                  Your files are processed locally and never uploaded to any server.
                </p>
              </div>

              <label
                htmlFor="file-upload"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  height: '36px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'white',
                  backgroundColor: '#0ea5e9',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#0284c7'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#0ea5e9'}
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
