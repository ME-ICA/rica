import React, { useMemo, useCallback } from "react";
import { Group } from "@visx/group";
import { Circle } from "@visx/shape";
import { scaleLinear } from "@visx/scale";
import { AxisLeft, AxisBottom } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { Zoom } from "@visx/zoom";

const COLORS = {
  accepted: "#86EFAC",
  acceptedHover: "#22C55E",
  rejected: "#FCA5A5",
  rejectedHover: "#EF4444",
  ignored: "#7DD3FC",
  ignoredHover: "#0EA5E9",
};

const margin = { top: 40, right: 30, bottom: 50, left: 60 };

function ScatterPlot({
  data,
  width,
  height,
  title,
  xLabel,
  yLabel,
  selectedIndex,
  onPointClick,
  getX,
  getY,
}) {
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

  // Calculate scales with some padding
  const xScale = useMemo(() => {
    if (!data?.length || innerWidth <= 0) return null;
    const xValues = data.map(getX);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const xPadding = (xMax - xMin) * 0.1 || 1;
    return scaleLinear({
      domain: [xMin - xPadding, xMax + xPadding],
      range: [0, innerWidth],
      nice: true,
    });
  }, [data, getX, innerWidth]);

  const yScale = useMemo(() => {
    if (!data?.length || innerHeight <= 0) return null;
    const yValues = data.map(getY);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const yPadding = (yMax - yMin) * 0.1 || 1;
    return scaleLinear({
      domain: [yMin - yPadding, yMax + yPadding],
      range: [innerHeight, 0],
      nice: true,
    });
  }, [data, getY, innerHeight]);

  const getColor = useCallback((d, index) => {
    const isSelected = index === selectedIndex;
    const classification = d.classification;
    if (classification === "accepted") {
      return isSelected ? COLORS.acceptedHover : COLORS.accepted;
    } else if (classification === "rejected") {
      return isSelected ? COLORS.rejectedHover : COLORS.rejected;
    } else {
      return isSelected ? COLORS.ignoredHover : COLORS.ignored;
    }
  }, [selectedIndex]);

  const handleMouseOver = useCallback((event, d, index) => {
    const coords = localPoint(event);
    showTooltip({
      tooltipData: { ...d, index },
      tooltipLeft: coords?.x,
      tooltipTop: coords?.y,
    });
  }, [showTooltip]);

  const initialTransform = {
    scaleX: 1,
    scaleY: 1,
    translateX: 0,
    translateY: 0,
    skewX: 0,
    skewY: 0,
  };

  // Guard against invalid dimensions - after all hooks
  if (!width || !height || width < 10 || height < 10 || !xScale || !yScale) {
    return <div style={{ width: "100%", height: "100%", background: "#ffffff", borderRadius: 8 }} />;
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
            style={{ cursor: zoom.isDragging ? "grabbing" : "grab" }}
          >
            {/* Background */}
            <rect
              width={width}
              height={height}
              fill="#ffffff"
              rx={8}
            />

            {/* Title */}
            <text
              x={width / 2}
              y={24}
              textAnchor="middle"
              fontSize={16}
              fontWeight="bold"
              fill="#374151"
            >
              {title}
            </text>

            <Group left={margin.left} top={margin.top}>
              {/* Clip path for zoom */}
              <defs>
                <clipPath id={`clip-${title.replace(/\s+/g, '-')}`}>
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
                  fontSize: 11,
                  textAnchor: "middle",
                })}
                label={xLabel}
                labelProps={{
                  fill: "#374151",
                  fontSize: 12,
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
                  fontSize: 11,
                  textAnchor: "end",
                  dy: "0.33em",
                })}
                label={yLabel}
                labelProps={{
                  fill: "#374151",
                  fontSize: 12,
                  textAnchor: "middle",
                  angle: -90,
                }}
              />

              {/* Interactive overlay for zoom/pan */}
              <rect
                width={innerWidth}
                height={innerHeight}
                fill="transparent"
                onTouchStart={zoom.dragStart}
                onTouchMove={zoom.dragMove}
                onTouchEnd={zoom.dragEnd}
                onMouseDown={zoom.dragStart}
                onMouseMove={zoom.dragMove}
                onMouseUp={zoom.dragEnd}
                onMouseLeave={() => {
                  if (zoom.isDragging) zoom.dragEnd();
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

              {/* Data points - render selected last to be on top */}
              <Group clipPath={`url(#clip-${title.replace(/\s+/g, '-')})`}>
                <g transform={zoom.toString()}>
                  {/* Non-selected points first */}
                  {data.map((d, i) => {
                    if (i === selectedIndex) return null;
                    const cx = xScale(getX(d));
                    const cy = yScale(getY(d));
                    return (
                      <Circle
                        key={d.label || i}
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill={getColor(d, i)}
                        stroke="#ffffff"
                        strokeWidth={1}
                        style={{
                          cursor: "pointer",
                          transition: "all 0.15s ease-out",
                        }}
                        onMouseEnter={(e) => handleMouseOver(e, d, i)}
                        onMouseLeave={hideTooltip}
                        onClick={() => onPointClick(i)}
                      />
                    );
                  })}
                  {/* Selected point last (on top) */}
                  {data[selectedIndex] && (
                    <Circle
                      key={data[selectedIndex].label || selectedIndex}
                      cx={xScale(getX(data[selectedIndex]))}
                      cy={yScale(getY(data[selectedIndex]))}
                      r={8}
                      fill={getColor(data[selectedIndex], selectedIndex)}
                      stroke="#1f2937"
                      strokeWidth={2}
                      style={{
                        cursor: "pointer",
                        transition: "all 0.15s ease-out",
                      }}
                      onMouseEnter={(e) => handleMouseOver(e, data[selectedIndex], selectedIndex)}
                      onMouseLeave={hideTooltip}
                      onClick={() => onPointClick(selectedIndex)}
                    />
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
          <div style={{ fontWeight: "bold" }}>
            {tooltipData.label}
          </div>
          <div>
            {xLabel}: {getX(tooltipData).toFixed(2)} | {yLabel}: {getY(tooltipData).toFixed(2)}
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}

export default ScatterPlot;
