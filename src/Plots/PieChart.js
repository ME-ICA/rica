import React, { useMemo, useCallback, useState } from "react";
import { Group } from "@visx/group";
import { Pie } from "@visx/shape";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { formatComponentName } from "./PlotUtils";

// Theme-aware colors
const getDataColors = (isDark) => ({
  accepted: isDark ? "#4ade80" : "#86EFAC",
  acceptedHover: isDark ? "#22c55e" : "#22C55E",
  rejected: isDark ? "#f87171" : "#FCA5A5",
  rejectedHover: isDark ? "#ef4444" : "#EF4444",
  ignored: isDark ? "#38bdf8" : "#7DD3FC",
  ignoredHover: isDark ? "#0ea5e9" : "#0EA5E9",
});

function PieChart({
  data,
  width,
  height,
  title,
  selectedIndex,
  onSliceClick,
  isDark = false,
}) {
  // Theme colors
  const colors = {
    bg: isDark ? '#18181b' : '#ffffff',
    title: isDark ? '#fafafa' : '#374151',
    centerText: isDark ? '#a1a1aa' : '#6b7280',
    stroke: isDark ? '#27272a' : '#ffffff',
    hoverStroke: isDark ? '#a1a1aa' : '#6b7280',
    selectedStroke: isDark ? '#fafafa' : '#1f2937',
  };

  const [hoveredIndex, setHoveredIndex] = useState(null);

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

  const radius = Math.max(0, Math.min(width || 0, height || 0) / 2 - 40);
  const centerX = (width || 0) / 2;
  const centerY = (height || 0) / 2 + 10;

  // Process data for pie
  const pieData = useMemo(() => {
    if (!data?.length) return [];
    return data.map((d, i) => ({
      ...d,
      index: i,
      value: d.variance || d.value || 1,
    }));
  }, [data]);

  const COLORS = getDataColors(isDark);

  const getColor = useCallback((d) => {
    const isSelected = d.index === selectedIndex;
    const isHovered = d.index === hoveredIndex;
    const classification = d.classification;

    if (classification === "accepted") {
      return (isSelected || isHovered) ? COLORS.acceptedHover : COLORS.accepted;
    } else if (classification === "rejected") {
      return (isSelected || isHovered) ? COLORS.rejectedHover : COLORS.rejected;
    } else {
      return (isSelected || isHovered) ? COLORS.ignoredHover : COLORS.ignored;
    }
  }, [selectedIndex, hoveredIndex, COLORS]);

  const handleMouseOver = useCallback((event, arc) => {
    const coords = localPoint(event);
    setHoveredIndex(arc.data.index);
    showTooltip({
      tooltipData: arc.data,
      tooltipLeft: coords?.x,
      tooltipTop: coords?.y,
    });
  }, [showTooltip]);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
    hideTooltip();
  }, [hideTooltip]);

  // Guard against invalid dimensions - after all hooks
  if (!width || !height || width < 10 || height < 10 || radius <= 0) {
    return <div style={{ width: "100%", height: "100%", background: colors.bg, borderRadius: 8 }} />;
  }

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg width={width} height={height}>
        {/* Background */}
        <rect width={width} height={height} fill={colors.bg} rx={8} />

        {/* Title */}
        <text
          x={centerX}
          y={24}
          textAnchor="middle"
          fontSize={16}
          fontWeight="bold"
          fill={colors.title}
        >
          {title}
        </text>

        <Group top={centerY} left={centerX} onMouseLeave={handleMouseLeave}>
          <Pie
            data={pieData}
            pieValue={(d) => d.value}
            outerRadius={radius}
            innerRadius={radius * 0.4}
            cornerRadius={3}
            padAngle={0.01}
            pieSort={null}
            pieSortValues={null}
          >
            {(pie) => {
              // Find the selected arc to render it last (on top)
              const selectedArc = pie.arcs.find((arc) => arc.data.index === selectedIndex);
              const nonSelectedArcs = pie.arcs.filter((arc) => arc.data.index !== selectedIndex);

              const renderArc = (arc, i) => {
                const isSelected = arc.data.index === selectedIndex;
                const isHovered = arc.data.index === hoveredIndex;

                return (
                  <g
                    key={`arc-${arc.data.index}`}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Visible slice with mouse events */}
                    <path
                      d={pie.path(arc)}
                      fill={getColor(arc.data)}
                      stroke={isSelected ? colors.selectedStroke : (isHovered ? colors.hoverStroke : colors.stroke)}
                      strokeWidth={isSelected ? 3 : (isHovered ? 2 : 1)}
                      style={{
                        filter: isSelected
                          ? "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"
                          : "none",
                      }}
                      onMouseMove={(e) => handleMouseOver(e, arc)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => onSliceClick(arc.data.index)}
                    />
                  </g>
                );
              };

              return (
                <>
                  {/* Non-selected slices first */}
                  {nonSelectedArcs.map(renderArc)}
                  {/* Selected slice last (on top) */}
                  {selectedArc && renderArc(selectedArc)}
                </>
              );
            }}
          </Pie>

          {/* Center text */}
          <text
            textAnchor="middle"
            dy=".33em"
            fontSize={14}
            fill={colors.centerText}
          >
            Variance
          </text>
        </Group>
      </svg>

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
            Variance: {tooltipData.value?.toFixed(2)}% ({tooltipData.classification})
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}

export default PieChart;
