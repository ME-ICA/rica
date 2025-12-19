import React, { useCallback } from "react";
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

function AnimatedTab({ index, children, isDark, style, ...props }) {
  const { selectedIndex, selectTab } = useTabsContext();
  const isSelected = selectedIndex === index;

  const handleClick = useCallback(() => {
    selectTab(index);
  }, [selectTab, index]);

  return (
    <button
      role="tab"
      aria-selected={isSelected}
      onClick={handleClick}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 14px",
        fontSize: "13px",
        fontWeight: isSelected ? "500" : "400",
        color: isSelected ? "var(--text-primary)" : "var(--text-tertiary)",
        backgroundColor: isSelected ? "var(--bg-tertiary)" : "transparent",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        transition: "all 0.15s ease",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.color = "var(--text-secondary)";
          e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.color = "var(--text-tertiary)";
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
