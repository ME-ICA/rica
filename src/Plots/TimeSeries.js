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

const margin = { top: 40, right: 20, bottom: 50, left: 60 };

function TimeSeries({ data, width, height, title, componentLabel, lineColor = "#3b82f6" }) {
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

  // Convert data array to points with x (TR index) and y (value)
  const points = useMemo(() => {
    if (!data?.length) return [];
    return data.map((value, index) => ({
      x: index,
      y: value,
    }));
  }, [data]);

  // X scale: TR index
  const xScale = useMemo(() => {
    if (!points.length || innerWidth <= 0) return null;
    return scaleLinear({
      domain: [0, points.length - 1],
      range: [0, innerWidth],
    });
  }, [points, innerWidth]);

  // Y scale: signal intensity
  const yScale = useMemo(() => {
    if (!points.length || innerHeight <= 0) return null;
    const yValues = points.map((p) => p.y);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const yPadding = (yMax - yMin) * 0.1 || 1;
    return scaleLinear({
      domain: [yMin - yPadding, yMax + yPadding],
      range: [innerHeight, 0],
      nice: true,
    });
  }, [points, innerHeight]);

  const handleMouseMove = useCallback(
    (event, zoom) => {
      const coords = localPoint(event);
      if (!coords || !xScale || !yScale) return;

      // Convert mouse position to data coordinates
      const x = coords.x - margin.left;
      const dataX = xScale.invert(x);
      const index = Math.round(dataX);

      if (index >= 0 && index < points.length) {
        setHoverIndex(index);
        showTooltip({
          tooltipData: { index, value: points[index].y },
          tooltipLeft: coords.x,
          tooltipTop: coords.y,
        });
      }
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
        No time series data
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
              {title} {componentLabel && `- ${componentLabel}`}
            </text>

            <Group left={margin.left} top={margin.top}>
              {/* Clip path for zoom */}
              <defs>
                <clipPath id="clip-timeseries">
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
                numTicks={Math.min(10, points.length)}
                stroke="#9ca3af"
                tickStroke="#9ca3af"
                tickLabelProps={() => ({
                  fill: "#6b7280",
                  fontSize: 10,
                  textAnchor: "middle",
                })}
                label="TR"
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
                label="Signal"
                labelProps={{
                  fill: "#374151",
                  fontSize: 11,
                  textAnchor: "middle",
                  angle: -90,
                }}
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
                  handleMouseMove(e, zoom);
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
              <Group clipPath="url(#clip-timeseries)">
                <g transform={zoom.toString()}>
                  <LinePath
                    data={points}
                    x={(d) => xScale(d.x)}
                    y={(d) => yScale(d.y)}
                    stroke={lineColor}
                    strokeWidth={1.5}
                    curve={curveLinear}
                  />

                  {/* Hover indicator line and point */}
                  {hoverIndex !== null && (
                    <>
                      <Line
                        from={{ x: xScale(hoverIndex), y: 0 }}
                        to={{ x: xScale(hoverIndex), y: innerHeight }}
                        stroke="#9ca3af"
                        strokeWidth={1}
                        strokeDasharray="4,4"
                        pointerEvents="none"
                      />
                      <circle
                        cx={xScale(hoverIndex)}
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
            <strong>TR {tooltipData.index}</strong>
          </div>
          <div>Value: {tooltipData.value.toFixed(3)}</div>
        </TooltipInPortal>
      )}
    </div>
  );
}

export default TimeSeries;
