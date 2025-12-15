import React, { useRef, useCallback } from "react";
import { TabsProvider, useTabsContext } from "./TabComponents";

function AnimatedTabs({ children, defaultIndex = 0, ...rest }) {
  return (
    <TabsProvider defaultIndex={defaultIndex}>
      <div style={{ ...rest.style }} {...rest}>
        {children}
      </div>
    </TabsProvider>
  );
}

function AnimatedTab({ index, children, style, ...props }) {
  const { selectedIndex, selectTab } = useTabsContext();
  const isSelected = selectedIndex === index;
  const tabRef = useRef(null);

  const handleClick = useCallback(() => {
    selectTab(index);
  }, [selectTab, index]);

  return (
    <button
      ref={tabRef}
      role="tab"
      aria-selected={isSelected}
      onClick={handleClick}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "6px 12px",
        fontSize: "13px",
        fontWeight: isSelected ? "600" : "500",
        color: isSelected ? "#1f2937" : "#6b7280",
        backgroundColor: isSelected ? "#ffffff" : "transparent",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        transition: "all 0.15s ease",
        boxShadow: isSelected ? "0 1px 2px rgba(0, 0, 0, 0.05)" : "none",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.color = "#374151";
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.color = "#6b7280";
          e.currentTarget.style.backgroundColor = "transparent";
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export { AnimatedTabs, AnimatedTab };
