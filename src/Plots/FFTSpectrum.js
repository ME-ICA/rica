import React, { useMemo, useCallback, useState } from "react";
import { Group } from "@visx/group";
import { LinePath, Line } from "@visx/shape";
import { scaleLinear } from "@visx/scale";
import { AxisLeft, AxisBottom } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { Zoom } from "@visx/zoom";
import { curveLinear } from "d3-shape";
import { computePowerSpectrum } from "../utils/fftUtils";

const margin = { top: 40, right: 20, bottom: 50, left: 60 };

function FFTSpectrum({ timeSeries, width, height, title, sampleRate = 1, lineColor = "#10b981" }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });

  const innerWidth = Math.max(0, (width || 0) - margin.left - margin.right);
  const innerHeight = Math.max(0, (height || 0) - margin.top - margin.bottom);

  // Compute FFT power spectrum (memoized for performance)
  const spectrumData = useMemo(() => {
    if (!timeSeries?.length) return { frequencies: [], power: [] };
    return computePowerSpectrum(timeSeries, sampleRate);
  }, [timeSeries, sampleRate]);

  // Convert to points for plotting
  const points = useMemo(() => {
    const { frequencies, power } = spectrumData;
    if (!frequencies.length) return [];

    // Skip DC component (index 0) for cleaner visualization
    return frequencies.slice(1).map((freq, i) => ({
      x: freq,
      y: power[i + 1],
      index: i + 1,
    }));
  }, [spectrumData]);

  // X scale: frequency
  const xScale = useMemo(() => {
    if (!points.length || innerWidth <= 0) return null;
    const xMax = Math.max(...points.map((p) => p.x));
    return scaleLinear({
      domain: [0, xMax],
      range: [0, innerWidth],
    });
  }, [points, innerWidth]);

  // Y scale: power (use log scale for better visualization)
  const yScale = useMemo(() => {
    if (!points.length || innerHeight <= 0) return null;
    const yValues = points.map((p) => p.y).filter((v) => v > 0);
    if (!yValues.length) return null;

    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);

    // Use linear scale but with padding
    const yPadding = (yMax - yMin) * 0.1 || yMax * 0.1;
    return scaleLinear({
      domain: [0, yMax + yPadding],
      range: [innerHeight, 0],
      nice: true,
    });
  }, [points, innerHeight]);

  const handleMouseMove = useCallback(
    (event) => {
      const coords = localPoint(event);
      if (!coords || !xScale || !yScale || !points.length) return;

      // Convert mouse position to data coordinates
      const x = coords.x - margin.left;
      const dataX = xScale.invert(x);

      // Find closest point
      let closestIndex = 0;
      let closestDist = Infinity;
      points.forEach((p, i) => {
        const dist = Math.abs(p.x - dataX);
        if (dist < closestDist) {
          closestDist = dist;
          closestIndex = i;
        }
      });

      setHoverIndex(closestIndex);
      showTooltip({
        tooltipData: points[closestIndex],
        tooltipLeft: coords.x,
        tooltipTop: coords.y,
      });
    },
    [xScale, yScale, points, showTooltip]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverIndex(null);
    hideTooltip();
  }, [hideTooltip]);

  const initialTransform = {
    scaleX: 1,
    scaleY: 1,
    translateX: 0,
    translateY: 0,
    skewX: 0,
    skewY: 0,
  };

  // Guard against invalid dimensions
  if (!width || !height || width < 10 || height < 10 || !xScale || !yScale || !points.length) {
    return (
      <div
        style={{
          width: width || "100%",
          height: height || 200,
          background: "#ffffff",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
          fontSize: 12,
        }}
      >
        No spectrum data
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%" }}>
      <Zoom
        width={width}
        height={height}
        scaleXMin={0.5}
        scaleXMax={4}
        scaleYMin={0.5}
        scaleYMax={4}
        initialTransformMatrix={initialTransform}
      >
        {(zoom) => (
          <svg
            width={width}
            height={height}
            style={{ cursor: zoom.isDragging ? "grabbing" : "crosshair" }}
          >
            {/* Background */}
            <rect width={width} height={height} fill="#ffffff" rx={8} />

            {/* Title */}
            <text
              x={width / 2}
              y={24}
              textAnchor="middle"
              fontSize={14}
              fontWeight="bold"
              fill="#374151"
            >
              {title || "Power Spectrum"}
            </text>

            <Group left={margin.left} top={margin.top}>
              {/* Clip path for zoom */}
              <defs>
                <clipPath id="clip-fft">
                  <rect width={innerWidth} height={innerHeight} />
                </clipPath>
              </defs>

              {/* Grid */}
              <GridRows
                scale={yScale}
                width={innerWidth}
                stroke="#e5e7eb"
                strokeOpacity={0.5}
              />
              <GridColumns
                scale={xScale}
                height={innerHeight}
                stroke="#e5e7eb"
                strokeOpacity={0.5}
              />

              {/* Axes */}
              <AxisBottom
                top={innerHeight}
                scale={xScale}
                numTicks={5}
                stroke="#9ca3af"
                tickStroke="#9ca3af"
                tickLabelProps={() => ({
                  fill: "#6b7280",
                  fontSize: 10,
                  textAnchor: "middle",
                })}
                label="Frequency (cycles/TR)"
                labelProps={{
                  fill: "#374151",
                  fontSize: 11,
                  textAnchor: "middle",
                }}
              />
              <AxisLeft
                scale={yScale}
                numTicks={5}
                stroke="#9ca3af"
                tickStroke="#9ca3af"
                tickLabelProps={() => ({
                  fill: "#6b7280",
                  fontSize: 10,
                  textAnchor: "end",
                  dy: "0.33em",
                })}
                label="Power"
                labelProps={{
                  fill: "#374151",
                  fontSize: 11,
                  textAnchor: "middle",
                  angle: -90,
                }}
                tickFormat={(v) => v.toExponential(0)}
              />

              {/* Interactive overlay for zoom/pan and hover */}
              <rect
                width={innerWidth}
                height={innerHeight}
                fill="transparent"
                onTouchStart={zoom.dragStart}
                onTouchMove={zoom.dragMove}
                onTouchEnd={zoom.dragEnd}
                onMouseDown={zoom.dragStart}
                onMouseMove={(e) => {
                  zoom.dragMove(e);
                  handleMouseMove(e);
                }}
                onMouseUp={zoom.dragEnd}
                onMouseLeave={() => {
                  if (zoom.isDragging) zoom.dragEnd();
                  handleMouseLeave();
                }}
                onDoubleClick={(event) => {
                  const point = localPoint(event) || { x: 0, y: 0 };
                  zoom.scale({ scaleX: 1.5, scaleY: 1.5, point });
                }}
                onWheel={(event) => {
                  const point = localPoint(event) || { x: 0, y: 0 };
                  const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;
                  zoom.scale({ scaleX: scaleFactor, scaleY: scaleFactor, point });
                }}
              />

              {/* Line path */}
              <Group clipPath="url(#clip-fft)">
                <g transform={zoom.toString()}>
                  <LinePath
                    data={points}
                    x={(d) => xScale(d.x)}
                    y={(d) => yScale(d.y)}
                    stroke={lineColor}
                    strokeWidth={1.5}
                    curve={curveLinear}
                  />

                  {/* Hover indicator */}
                  {hoverIndex !== null && points[hoverIndex] && (
                    <>
                      <Line
                        from={{ x: xScale(points[hoverIndex].x), y: 0 }}
                        to={{ x: xScale(points[hoverIndex].x), y: innerHeight }}
                        stroke="#9ca3af"
                        strokeWidth={1}
                        strokeDasharray="4,4"
                        pointerEvents="none"
                      />
                      <circle
                        cx={xScale(points[hoverIndex].x)}
                        cy={yScale(points[hoverIndex].y)}
                        r={4}
                        fill={lineColor}
                        stroke="#ffffff"
                        strokeWidth={2}
                        pointerEvents="none"
                      />
                    </>
                  )}
                </g>
              </Group>
            </Group>
          </svg>
        )}
      </Zoom>

      {/* Tooltip */}
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          left={tooltipLeft}
          top={tooltipTop}
          style={{
            ...defaultStyles,
            backgroundColor: "#1f2937",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: "4px",
            fontSize: "11px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
            pointerEvents: "none",
          }}
        >
          <div>
            <strong>Freq: {tooltipData.x.toFixed(4)}</strong>
          </div>
          <div>Power: {tooltipData.y.toExponential(2)}</div>
        </TooltipInPortal>
      )}
    </div>
  );
}

export default FFTSpectrum;
