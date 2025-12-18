import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { Niivue } from "@niivue/niivue";

function BrainViewer({ niftiBuffer, maskBuffer, componentIndex, width, height, componentLabel, saturation = 0.1, isDark = false }) {
  const canvasRef = useRef(null);
  const nvRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const maxAbsRef = useRef(null); // Store max absolute value for saturation adjustments

  // Theme colors
  const bgColor = isDark ? '#18181b' : '#ffffff';
  const titleColor = isDark ? '#fafafa' : '#374151';
  const loadingBg = isDark ? '#27272a' : '#f3f4f6';
  const loadingText = isDark ? '#a1a1aa' : '#6b7280';
  const errorBg = isDark ? '#451a1a' : '#fef2f2';
  const errorText = isDark ? '#fca5a5' : '#dc2626';
  const placeholderBg = isDark ? '#18181b' : '#f3f4f6';
  const placeholderText = isDark ? '#71717a' : '#9ca3af';

  // Niivue background color (RGBA 0-1) - memoized to prevent re-renders
  const niivueBgColor = useMemo(() => isDark ? [0.09, 0.09, 0.11, 1] : [1, 1, 1, 1], [isDark]);

  // Initialize Niivue instance
  useEffect(() => {
    let mounted = true;
    let statBlobUrl = null;
    let maskBlobUrl = null;

    async function initNiivue() {
      if (!canvasRef.current || !niftiBuffer) return;

      try {
        // Create Niivue instance
        const nv = new Niivue({
          backColor: niivueBgColor,
          show3Dcrosshair: false,
          crosshairColor: [0.5, 0.5, 0.5, 0.5],
          multiplanarForceRender: false, // Disable 3D render in multiplanar
        });

        // Attach to canvas
        await nv.attachToCanvas(canvasRef.current);

        // Build volumes array
        const volumes = [];

        // Load mask first as background if available
        if (maskBuffer) {
          const maskBlob = new Blob([maskBuffer], { type: "application/gzip" });
          maskBlobUrl = URL.createObjectURL(maskBlob);
          volumes.push({
            url: maskBlobUrl,
            name: "mask.nii.gz",
            colormap: "gray",
            opacity: 1.0,
            cal_min: 0,
            cal_max: 1,
          });
        }

        // Load stat map with warm/cool diverging colormap
        const statBlob = new Blob([niftiBuffer], { type: "application/gzip" });
        statBlobUrl = URL.createObjectURL(statBlob);

        const statVolume = {
          url: statBlobUrl,
          name: "components.nii.gz",
          colormap: "warm",
          colormapNegative: "cool",
          useQFormNotSForm: true,
        };

        volumes.push(statVolume);

        // Load volumes
        await nv.loadVolumes(volumes);

        // Set display to multiplanar (axial, coronal, sagittal) without 3D in a row
        nv.setSliceType(nv.sliceTypeMultiplanar);
        nv.setMultiplanarLayout(3); // 3 = ROW layout
        nv.opts.multiplanarShowRender = 0; // NEVER show 3D render
        nv.opts.multiplanarEqualSize = true; // Make all views same size
        nv.opts.multiplanarPadPixels = -30; // Negative to reduce gap between views
        nv.opts.tileMargin = 0; // No margin around tiles

        // Set initial frame for the stat map (last volume loaded)
        const statVolIndex = maskBuffer ? 1 : 0;
        if (nv.volumes.length > statVolIndex && componentIndex >= 0) {
          nv.setFrame4D(nv.volumes[statVolIndex].id, componentIndex);
        }

        // Set colormap range AFTER setting frame (to ensure it applies correctly)
        const statVolIdx = nv.volumes.length - 1;
        if (nv.volumes.length > 0) {
          const vol = nv.volumes[statVolIdx]; // Get stat map (last volume)
          const maxAbs = Math.max(Math.abs(vol.cal_min), Math.abs(vol.cal_max));
          maxAbsRef.current = maxAbs; // Store for saturation adjustments
          const range = maxAbs * saturation;

          // Positive values: 0 to max (warm colormap)
          vol.cal_min = 0;
          vol.cal_max = range;

          // Negative values: -max to 0 (cool colormap)
          vol.cal_minNeg = -range;
          vol.cal_maxNeg = 0;

          // Set background and redraw
          nv.opts.backColor = niivueBgColor;
          nv.updateGLVolume();
          nv.drawScene();
        }

        if (mounted) {
          nvRef.current = nv;
          setIsLoaded(true);
          setError(null);
        }
      } catch (err) {
        console.error("Error initializing Niivue:", err);
        if (mounted) {
          setError(err.message || "Failed to load brain viewer");
        }
      }
    }

    initNiivue();

    return () => {
      mounted = false;
      // Cleanup Blob URLs
      if (statBlobUrl) {
        URL.revokeObjectURL(statBlobUrl);
      }
      if (maskBlobUrl) {
        URL.revokeObjectURL(maskBlobUrl);
      }
      // Cleanup Niivue instance
      if (nvRef.current) {
        nvRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [niftiBuffer, maskBuffer]); // Reinit when buffer or mask changes

  // Update background color when theme changes
  useEffect(() => {
    if (nvRef.current && isLoaded) {
      try {
        const nv = nvRef.current;
        nv.opts.backColor = niivueBgColor;
        nv.drawScene();
      } catch (err) {
        console.error("Error updating background:", err);
      }
    }
  }, [isDark, isLoaded, niivueBgColor]);

  // Update frame when componentIndex changes
  useEffect(() => {
    if (nvRef.current && isLoaded && componentIndex >= 0) {
      try {
        const nv = nvRef.current;
        // Stat map is the last volume (index 1 if mask loaded, 0 otherwise)
        const statVolIndex = nv.volumes.length - 1;
        if (nv.volumes && nv.volumes.length > 0) {
          nv.setFrame4D(nv.volumes[statVolIndex].id, componentIndex);
        }
      } catch (err) {
        console.error("Error setting frame:", err);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentIndex, isLoaded]);

  // Update colormap range when saturation changes
  useEffect(() => {
    if (nvRef.current && isLoaded && maxAbsRef.current) {
      try {
        const nv = nvRef.current;
        const statVolIndex = nv.volumes.length - 1;
        if (nv.volumes && nv.volumes.length > 0) {
          const vol = nv.volumes[statVolIndex];
          const range = maxAbsRef.current * saturation;

          // Update colormap range
          vol.cal_min = 0;
          vol.cal_max = range;
          vol.cal_minNeg = -range;
          vol.cal_maxNeg = 0;

          // Set background before redraw
          nv.opts.backColor = niivueBgColor;

          // Redraw the scene
          nv.updateGLVolume();
          nv.drawScene();
        }
      } catch (err) {
        console.error("Error updating saturation:", err);
      }
    }
  }, [saturation, isLoaded, niivueBgColor]);

  // Handle resize
  const handleResize = useCallback(() => {
    if (nvRef.current && canvasRef.current) {
      nvRef.current.resizeListener();
    }
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  // Show placeholder if no data
  if (!niftiBuffer) {
    return (
      <div
        style={{
          width: width || "100%",
          height: height || 350,
          background: placeholderBg,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: placeholderText,
          fontSize: 14,
        }}
      >
        No brain map data available
      </div>
    );
  }

  return (
    <div
      style={{
        width: width || "100%",
        height: height || 350,
        position: "relative",
        borderRadius: 8,
        overflow: "hidden",
        background: bgColor,
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 14,
          fontWeight: "bold",
          color: titleColor,
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        Brain Stat Map {componentLabel && `- ${componentLabel}`}
      </div>

      {/* Loading/Error states */}
      {!isLoaded && !error && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: loadingBg,
            color: loadingText,
            fontSize: 14,
          }}
        >
          Loading brain viewer...
        </div>
      )}

      {error && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: errorBg,
            color: errorText,
            fontSize: 14,
            padding: 20,
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {/* Niivue canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          outline: "none",
        }}
      />
    </div>
  );
}

export default BrainViewer;
