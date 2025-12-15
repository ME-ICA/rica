import React, { createContext, useContext, useState, useCallback } from "react";

// Context for sharing tab state
const TabsContext = createContext();

export function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tab components must be used within AnimatedTabs");
  }
  return context;
}

export function TabsProvider({ children, defaultIndex = 0 }) {
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);

  const selectTab = useCallback((index) => {
    setSelectedIndex(index);
  }, []);

  return (
    <TabsContext.Provider value={{ selectedIndex, selectTab }}>
      {children}
    </TabsContext.Provider>
  );
}

export function TabList({ children, className = "", style }) {
  return (
    <div className={className} style={{ ...style, position: "relative" }} role="tablist">
      {children}
    </div>
  );
}

export function TabPanels({ children }) {
  const { selectedIndex } = useTabsContext();

  return (
    <div className="tab-panels">
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { isActive: index === selectedIndex });
        }
        return child;
      })}
    </div>
  );
}

export function TabPanel({ children, index, isActive }) {
  const { selectedIndex } = useTabsContext();
  const active = isActive !== undefined ? isActive : selectedIndex === index;

  if (!active) return null;

  return (
    <div
      role="tabpanel"
      className="animate-fadeIn"
      style={{ animation: "fadeIn 0.2s ease-in-out" }}
    >
      {children}
    </div>
  );
}
