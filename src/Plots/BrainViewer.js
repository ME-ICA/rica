import React, { useRef, useEffect, useState, useCallback } from "react";
import { Niivue } from "@niivue/niivue";

function BrainViewer({ niftiBuffer, maskBuffer, componentIndex, width, height, componentLabel }) {
  const canvasRef = useRef(null);
  const nvRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

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
          backColor: [1, 1, 1, 1], // White background
          show3Dcrosshair: false,
          crosshairColor: [0.5, 0.5, 0.5, 0.5],
          multiplanarForceRender: false, // Disable 3D render in multiplanar
        });

        // Attach to canvas
        await nv.attachToCanvas(canvasRef.current);

        // Create two half-colormaps for diverging display:
        // - white2red: for positive values (white at threshold → red at max)
        // - blue2white: for negative values (blue at -max → white at -threshold)

        // White to Red colormap (for positive values)
        // Matches the red half of matplotlib's RdBu_r
        const white2red = {
          R: [255, 254, 252, 250, 246, 239, 229, 215, 199, 180, 165, 146, 127, 103, 84, 67],
          G: [255, 240, 220, 199, 175, 150, 125, 99, 75, 55, 40, 28, 18, 8, 2, 0],
          B: [255, 237, 214, 190, 165, 140, 114, 89, 68, 50, 38, 28, 20, 13, 7, 3],
          A: [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          I: [0, 7, 13, 20, 27, 33, 40, 47, 53, 60, 67, 73, 80, 87, 93, 100],
        };
        nv.addColormap("white2red", white2red);

        // Blue to White colormap (for negative values)
        // Matches the blue half of matplotlib's RdBu_r
        const blue2white = {
          R: [5, 24, 47, 75, 103, 134, 162, 186, 206, 222, 235, 244, 250, 253, 254, 255],
          G: [48, 78, 111, 143, 173, 197, 217, 232, 243, 250, 253, 254, 254, 254, 255, 255],
          B: [97, 127, 157, 183, 206, 224, 238, 247, 252, 254, 254, 254, 254, 254, 255, 255],
          A: [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          I: [0, 7, 13, 20, 27, 33, 40, 47, 53, 60, 67, 73, 80, 87, 93, 100],
        };
        nv.addColormap("blue2white", blue2white);

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

        // Load stat map with custom RdBu_r colormap (blue-white-red, matching matplotlib)
        const statBlob = new Blob([niftiBuffer], { type: "application/gzip" });
        statBlobUrl = URL.createObjectURL(statBlob);

        const statVolume = {
          url: statBlobUrl,
          name: "components.nii.gz",
          colormap: "white2red",
          colormapNegative: "blue2white",
          useQFormNotSForm: true,
        };

        volumes.push(statVolume);

        // Load volumes
        await nv.loadVolumes(volumes);

        // Set colormap range to 90% of absolute maximum (symmetric around zero)
        const statVolIdx = nv.volumes.length - 1;
        if (nv.volumes.length > 0) {
          const vol = nv.volumes[statVolIdx]; // Get stat map (last volume)
          const maxAbs = Math.max(Math.abs(vol.cal_min), Math.abs(vol.cal_max));
          const range = maxAbs * 0.9;

          // Positive values: 0 to max (white to red)
          vol.cal_min = 0;
          vol.cal_max = range;

          // Negative values: -max to 0 (blue to white)
          vol.cal_minNeg = -range;
          vol.cal_maxNeg = 0;
        }

        // Set display to multiplanar (axial, coronal, sagittal) without 3D in a row
        nv.setSliceType(nv.sliceTypeMultiplanar);
        nv.setMultiplanarLayout(3); // 3 = ROW layout
        nv.opts.multiplanarShowRender = 0; // NEVER show 3D render
        nv.opts.multiplanarEqualSize = true; // Make all views same size
        nv.opts.multiplanarPadPixels = 0; // No gap between views
        nv.drawScene();

        if (mounted) {
          nvRef.current = nv;
          setIsLoaded(true);
          setError(null);

          // Set initial frame for the stat map (last volume loaded)
          const statVolIndex = maskBuffer ? 1 : 0;
          if (nv.volumes.length > statVolIndex && componentIndex >= 0) {
            nv.setFrame4D(nv.volumes[statVolIndex].id, componentIndex);
          }
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
          background: "#f3f4f6",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
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
        background: "#ffffff",
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
          color: "#374151",
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
            background: "#f3f4f6",
            color: "#6b7280",
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
            background: "#fef2f2",
            color: "#dc2626",
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
