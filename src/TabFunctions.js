import React, { useRef, useState, useLayoutEffect, useCallback } from "react";
import { TabsProvider, useTabsContext } from "./TabComponents";

const HORIZONTAL_PADDING = 16;

function AnimatedTabs({ children, defaultIndex = 0, ...rest }) {
  const [activeRect, setActiveRect] = useState(null);
  const containerRef = useRef(null);
  const [containerRect, setContainerRect] = useState(null);

  // Update container rect on mount and resize
  useLayoutEffect(() => {
    const updateRect = () => {
      if (containerRef.current) {
        setContainerRect(containerRef.current.getBoundingClientRect());
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, []);

  return (
    <TabsProvider defaultIndex={defaultIndex}>
      <TabsContextBridge setActiveRect={setActiveRect}>
        <div
          ref={containerRef}
          style={{ ...rest.style, position: "relative" }}
          {...rest}
        >
          {/* Animated underline indicator */}
          <div
            className="absolute bg-sky-500"
            style={{
              height: 4,
              transition: "all 300ms ease",
              left: activeRect && containerRect
                ? activeRect.left - containerRect.left + HORIZONTAL_PADDING
                : 0,
              top: activeRect && containerRect
                ? activeRect.bottom - containerRect.top - 3
                : 0,
              width: activeRect ? activeRect.width - HORIZONTAL_PADDING * 1.5 : 0,
              opacity: activeRect ? 1 : 0,
            }}
          />
          {children}
        </div>
      </TabsContextBridge>
    </TabsProvider>
  );
}

// Helper component to access context and pass setActiveRect
function TabsContextBridge({ children, setActiveRect }) {
  return (
    <ActiveRectContext.Provider value={setActiveRect}>
      {children}
    </ActiveRectContext.Provider>
  );
}

const ActiveRectContext = React.createContext(null);

function AnimatedTab({ index, children, style, ...props }) {
  const { selectedIndex, selectTab } = useTabsContext();
  const isSelected = selectedIndex === index;
  const tabRef = useRef(null);
  const setActiveRect = React.useContext(ActiveRectContext);

  // Update active rect when this tab becomes selected
  useLayoutEffect(() => {
    if (isSelected && tabRef.current) {
      setActiveRect(tabRef.current.getBoundingClientRect());
    }
  }, [isSelected, setActiveRect]);

  // Also update on resize
  useLayoutEffect(() => {
    if (!isSelected) return;

    const updateRect = () => {
      if (tabRef.current) {
        setActiveRect(tabRef.current.getBoundingClientRect());
      }
    };

    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, [isSelected, setActiveRect]);

  const handleClick = useCallback(() => {
    selectTab(index);
  }, [selectTab, index]);

  return (
    <button
      ref={tabRef}
      role="tab"
      aria-selected={isSelected}
      className={`text-gray-500 hover:cursor-pointer focus:outline-none transition-colors duration-200 ${
        isSelected ? "text-gray-900" : ""
      }`}
      onClick={handleClick}
      style={{
        ...style,
        padding: `8px ${HORIZONTAL_PADDING}px`,
        background: "white",
        border: "none",
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export { AnimatedTabs, AnimatedTab };
