import React, { useMemo, useCallback, useRef, useEffect } from "react";
import { Group } from "@visx/group";
import { Line, LinePath } from "@visx/shape";
import { scaleLinear } from "@visx/scale";
import { AxisLeft, AxisBottom } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { Zoom } from "@visx/zoom";
import { formatComponentName } from "./PlotUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { getClassStyle } from "../constants/palette";
import { useTheme } from "../contexts/theme";

const margin = { top: 40, right: 30, bottom: 50, left: 60 };

// Marker matching the classification shape (redundant, non-colour cue).
// Sizes are tuned so each shape reads at roughly the same visual weight as a
// circle of radius r.
function Marker({ shape, cx, cy, r, ...rest }) {
  if (shape === "square") {
    const s = r * 1.8;
    return <rect x={cx - s / 2} y={cy - s / 2} width={s} height={s} {...rest} />;
  }
  if (shape === "triangle") {
    const R = r * 1.6;
    const points = `${cx},${cy - R} ${cx - R * 0.866},${cy + R * 0.5} ${cx + R * 0.866},${cy + R * 0.5}`;
    return <polygon points={points} {...rest} />;
  }
  if (shape === "diamond") {
    const R = r * 1.3;
    const points = `${cx},${cy - R} ${cx + R},${cy} ${cx},${cy + R} ${cx - R},${cy}`;
    return <polygon points={points} {...rest} />;
  }
  return <circle cx={cx} cy={cy} r={r} {...rest} />;
}

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
  isDark = false,
  hLine, // Optional horizontal threshold line value
  vLine, // Optional vertical threshold line value
  showDiagonal, // Show x=y diagonal reference line
  connectingLine, // Array of {x, y} points for connecting line
}) {
  const { colorblind = false } = useTheme() || {};
  // Theme colors
  const colors = {
    bg: isDark ? "#18181b" : "#ffffff",
    title: isDark ? "#fafafa" : "#374151",
    axis: isDark ? "#71717a" : "#9ca3af",
    axisLabel: isDark ? "#a1a1aa" : "#374151",
    tickLabel: isDark ? "#a1a1aa" : "#6b7280",
    grid: isDark ? "#27272a" : "#e5e7eb",
    stroke: isDark ? "#27272a" : "#ffffff",
    selectedStroke: isDark ? "#fafafa" : "#1f2937",
    refLine: isDark ? "#71717a" : "#9ca3af", // Reference/threshold lines
    diagonal: isDark ? "#52525b" : "#d1d5db", // Diagonal x=y line
    connectLine: isDark ? "#52525b" : "#6b7280", // Connecting line for rank plots
  };
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

  const getStyle = useCallback(
    (d, index) =>
      getClassStyle(d.classification, {
        isDark,
        colorblind,
        selected: index === selectedIndex,
      }),
    [selectedIndex, isDark, colorblind],
  );

  const handleMouseOver = useCallback(
    (event, d, index) => {
      const coords = localPoint(event);
      showTooltip({
        tooltipData: { ...d, index },
        tooltipLeft: coords?.x,
        tooltipTop: coords?.y,
      });
    },
    [showTooltip],
  );

  const initialTransform = {
    scaleX: 1,
    scaleY: 1,
    translateX: 0,
    translateY: 0,
    skewX: 0,
    skewY: 0,
  };

  // Ref to store the zoom instance for use in wheel handler
  const zoomRef = useRef(null);
  const svgRef = useRef(null);
  const overlayRef = useRef(null);

  // Attach native wheel event listener with { passive: false } to allow preventDefault
  // Using SVG element instead of overlay to capture wheel events anywhere on the plot
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const handleWheel = (event) => {
      event.preventDefault();
      const zoom = zoomRef.current;
      if (!zoom) return;

      const point = localPoint(svg, event) || { x: 0, y: 0 };
      const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;
      zoom.scale({
        scaleX: scaleFactor,
        scaleY: scaleFactor,
        point,
      });
    };

    svg.addEventListener("wheel", handleWheel, { passive: false });
    return () => svg.removeEventListener("wheel", handleWheel);
  }, []);

  // Guard against invalid dimensions - after all hooks
  if (!width || !height || width < 10 || height < 10 || !xScale || !yScale) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: colors.bg,
          borderRadius: 8,
        }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <Zoom
        width={width}
        height={height}
        scaleXMin={0.5}
        scaleXMax={4}
        scaleYMin={0.5}
        scaleYMax={4}
        initialTransformMatrix={initialTransform}
      >
        {(zoom) => {
          // Store zoom instance in ref for native wheel handler
          zoomRef.current = zoom;
          return (
            <svg
              ref={svgRef}
              width={width}
              height={height}
              style={{ cursor: zoom.isDragging ? "grabbing" : "grab" }}
            >
              {/* Background */}
              <rect width={width} height={height} fill={colors.bg} rx={8} />

              {/* Title */}
              <text
                x={width / 2}
                y={24}
                textAnchor="middle"
                fontSize={16}
                fontWeight="bold"
                fill={colors.title}
              >
                {title}
              </text>

              <Group left={margin.left} top={margin.top}>
                {/* Clip path for zoom */}
                <defs>
                  <clipPath id={`clip-${title.replace(/\s+/g, "-")}`}>
                    <rect width={innerWidth} height={innerHeight} />
                  </clipPath>
                </defs>

                {/* Grid */}
                <GridRows
                  scale={yScale}
                  width={innerWidth}
                  stroke={colors.grid}
                  strokeOpacity={0.5}
                />
                <GridColumns
                  scale={xScale}
                  height={innerHeight}
                  stroke={colors.grid}
                  strokeOpacity={0.5}
                />

                {/* Axes */}
                <AxisBottom
                  top={innerHeight}
                  scale={xScale}
                  numTicks={5}
                  stroke={colors.axis}
                  tickStroke={colors.axis}
                  tickLabelProps={() => ({
                    fill: colors.tickLabel,
                    fontSize: 11,
                    textAnchor: "middle",
                  })}
                  label={xLabel}
                  labelProps={{
                    fill: colors.axisLabel,
                    fontSize: 12,
                    textAnchor: "middle",
                  }}
                />
                <AxisLeft
                  scale={yScale}
                  numTicks={5}
                  stroke={colors.axis}
                  tickStroke={colors.axis}
                  tickLabelProps={() => ({
                    fill: colors.tickLabel,
                    fontSize: 11,
                    textAnchor: "end",
                    dy: "0.33em",
                  })}
                  label={yLabel}
                  labelProps={{
                    fill: colors.axisLabel,
                    fontSize: 12,
                    textAnchor: "middle",
                    angle: -90,
                  }}
                />

                {/* Interactive overlay for zoom/pan */}
                <rect
                  ref={overlayRef}
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
                />

                {/* Data points and reference lines - render inside zoom transform */}
                <Group clipPath={`url(#clip-${title.replace(/\s+/g, "-")})`}>
                  <g transform={zoom.toString()}>
                    {/* Diagonal x=y reference line */}
                    {showDiagonal &&
                      (() => {
                        // Calculate diagonal endpoints based on the intersection with chart bounds
                        const xDomain = xScale.domain();
                        const yDomain = yScale.domain();
                        const diagMin = Math.max(xDomain[0], yDomain[0]);
                        const diagMax = Math.min(xDomain[1], yDomain[1]);
                        return (
                          <Line
                            from={{ x: xScale(diagMin), y: yScale(diagMin) }}
                            to={{ x: xScale(diagMax), y: yScale(diagMax) }}
                            stroke={colors.diagonal}
                            strokeWidth={1}
                            strokeDasharray="4,4"
                            strokeOpacity={0.8}
                          />
                        );
                      })()}

                    {/* Horizontal threshold line (rho elbow) */}
                    {hLine !== undefined && hLine !== null && (
                      <Line
                        from={{ x: 0, y: yScale(hLine) }}
                        to={{ x: innerWidth, y: yScale(hLine) }}
                        stroke={colors.refLine}
                        strokeWidth={1.5}
                        strokeDasharray="6,4"
                        strokeOpacity={0.9}
                      />
                    )}

                    {/* Vertical threshold line (kappa elbow) */}
                    {vLine !== undefined && vLine !== null && (
                      <Line
                        from={{ x: xScale(vLine), y: 0 }}
                        to={{ x: xScale(vLine), y: innerHeight }}
                        stroke={colors.refLine}
                        strokeWidth={1.5}
                        strokeDasharray="6,4"
                        strokeOpacity={0.9}
                      />
                    )}

                    {/* Connecting line for rank plots */}
                    {connectingLine && connectingLine.length > 0 && (
                      <LinePath
                        data={connectingLine}
                        x={(d) => xScale(d.x)}
                        y={(d) => yScale(d.y)}
                        stroke={colors.connectLine}
                        strokeWidth={1.5}
                        strokeOpacity={0.7}
                      />
                    )}

                    {/* Non-selected points first */}
                    {data.map((d, i) => {
                      if (i === selectedIndex) return null;
                      const cx = xScale(getX(d));
                      const cy = yScale(getY(d));
                      const { color, shape } = getStyle(d, i);
                      return (
                        <Marker
                          key={d.label || i}
                          shape={shape}
                          cx={cx}
                          cy={cy}
                          r={6}
                          fill={color}
                          stroke={colors.stroke}
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
                      <Marker
                        key={data[selectedIndex].label || selectedIndex}
                        shape={getStyle(data[selectedIndex], selectedIndex).shape}
                        cx={xScale(getX(data[selectedIndex]))}
                        cy={yScale(getY(data[selectedIndex]))}
                        r={8}
                        fill={getStyle(data[selectedIndex], selectedIndex).color}
                        stroke={colors.selectedStroke}
                        strokeWidth={2}
                        style={{
                          cursor: "pointer",
                          transition: "all 0.15s ease-out",
                        }}
                        onMouseEnter={(e) =>
                          handleMouseOver(e, data[selectedIndex], selectedIndex)
                        }
                        onMouseLeave={hideTooltip}
                        onClick={() => onPointClick(selectedIndex)}
                      />
                    )}
                  </g>
                </Group>
              </Group>
            </svg>
          );
        }}
      </Zoom>

      {/* Reset zoom button */}
      <button
        onClick={() => zoomRef.current?.reset()}
        style={{
          position: "absolute",
          top: 4,
          right: 4,
          zIndex: 10,
          padding: "4px 10px",
          fontSize: 11,
          fontWeight: 500,
          borderRadius: 4,
          border: "none",
          cursor: "pointer",
          transition: "all 0.2s ease",
          backgroundColor: isDark ? "#3f3f46" : "#d1d5db",
          color: isDark ? "#a1a1aa" : "#6b7280",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
        title="Reset zoom"
      >
        <FontAwesomeIcon icon={faRotateLeft} />
        Reset
      </button>

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
            {formatComponentName(tooltipData.label)}
          </div>
          <div>
            {xLabel}: {getX(tooltipData).toFixed(2)} | {yLabel}:{" "}
            {getY(tooltipData).toFixed(2)}
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}

export default ScatterPlot;
