import React from "react";
import { useRect } from "@reach/rect";
import { Tabs, useTabsContext, Tab } from "@reach/tabs";

const HORIZONTAL_PADDING = 8;
const AnimatedContext = React.createContext();

function AnimatedTabs({ color, children, ...rest }) {
  // some state to store the position we want to animate to
  const [activeRect, setActiveRect] = React.useState(null);
  const ref = React.useRef();
  const rect = useRect(ref);

  return (
    // put the function to change the styles on context so an active Tab
    // can call it, then style it up
    <AnimatedContext.Provider value={setActiveRect}>
      {/* make sure to forward props since we're wrapping Tabs */}
      <Tabs {...rest} ref={ref} style={{ ...rest.style, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            height: 2,
            background: color,
            transition: "all 300ms ease",
            left:
              (activeRect && activeRect.left) -
              (rect && rect.left) +
              HORIZONTAL_PADDING,
            top: (activeRect && activeRect.bottom) - (rect && rect.top),
            // subtract both sides of horizontal padding to center the div
            width: activeRect && activeRect.width - HORIZONTAL_PADDING * 2,
          }}
        />
        {children}
      </Tabs>
    </AnimatedContext.Provider>
  );
}

function AnimatedTab({ index, ...props }) {
  // get the currently selected index from useTabsContext
  const { selectedIndex } = useTabsContext();
  const isSelected = selectedIndex === index;

  // measure the size of our element, only listen to rect if active
  const ref = React.useRef();
  const rect = useRect(ref, { observe: isSelected });

  // get the style changing function from context
  const setActiveRect = React.useContext(AnimatedContext);

  // callup to set styles whenever we're active
  React.useLayoutEffect(() => {
    if (isSelected) {
      setActiveRect(rect);
    }
  }, [isSelected, rect, setActiveRect]);

  return (
    <Tab
      ref={ref}
      {...props}
      style={{
        ...props.style,
        border: "1px",
        padding: `4px ${HORIZONTAL_PADDING}px`,
        background: "white",
      }}
    />
  );
}

export { AnimatedTabs, AnimatedTab };
