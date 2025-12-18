import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider, Helmet } from "react-helmet-async";

import IntroPopup from "./PopUps/IntroPopUp";
import AboutPopup from "./PopUps/AboutPopUp";
import MobileMain from "./Mobile";
import LoadingSpinner from "./LoadingSpinner";

import "./styles/output.css";
import "./styles.css";

import { TabList, TabPanels, TabPanel } from "./TabComponents";
import { AnimatedTab, AnimatedTabs } from "./TabFunctions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faLayerGroup,
  faChartPie,
  faPlus,
  faQuestion,
  faSun,
  faMoon,
} from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";

// Lazy load heavy components for better initial load
const Plots = lazy(() => import("./Plots/Plots"));
const Carpets = lazy(() => import("./Carpets/Carpets"));
const Info = lazy(() => import("./Info/Info"));

library.add(faInfoCircle, faLayerGroup, faChartPie, faPlus, faQuestion, faSun, faMoon);

// Theme context
const ThemeContext = React.createContext();

export function useTheme() {
  return React.useContext(ThemeContext);
}

function App() {
  const [componentData, setComponentData] = useState([]);
  const [componentFigures, setComponentFigures] = useState([]);
  const [carpetFigures, setCarpetFigures] = useState([]);
  const [info, setInfo] = useState([]);
  const [showIntroPopup, setShowIntroPopup] = useState(true);
  const [showAboutPopup, setShowAboutPopup] = useState(false);
  const [showTabs, setShowTabs] = useState(false);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  // New state for Niivue integration
  const [mixingMatrix, setMixingMatrix] = useState(null);
  const [niftiBuffer, setNiftiBuffer] = useState(null);
  const [maskBuffer, setMaskBuffer] = useState(null);
  // Theme state
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('rica-theme');
    return saved || 'light';
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rica-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    // Add transition class before changing theme
    setIsTransitioning(true);

    // Small delay to ensure class is applied before theme change
    requestAnimationFrame(() => {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');

      // Remove transition class after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 400);
    });
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleWindowSizeChange = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  const toggleIntroPopup = useCallback(() => {
    setShowIntroPopup((prev) => !prev);
    setShowTabs(true);
  }, []);

  const toggleAboutPopup = useCallback(() => {
    setShowAboutPopup((prev) => !prev);
  }, []);

  // Called when data loading starts
  const onLoadingStart = useCallback(() => {
    setIsLoading(true);
  }, []);

  // Called when data is fully loaded - no more delays!
  const onDataLoad = useCallback(
    (data) => {
      // Set all state at once - no nested callbacks or delays
      setComponentFigures(data.componentFigures);
      setCarpetFigures(data.carpetFigures);
      setComponentData(data.components);
      setInfo([data.info, data.dirPath]);
      setOriginalData(data.originalData);
      // New data for Niivue integration
      setMixingMatrix(data.mixingMatrix);
      setNiftiBuffer(data.niftiBuffer);
      setMaskBuffer(data.maskBuffer);
      setIsLoading(false);
      toggleIntroPopup();
    },
    [toggleIntroPopup]
  );

  const isMobile = width <= 1024;

  if (isMobile) {
    return <MobileMain />;
  }

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      <HelmetProvider>
        <Helmet>
          <title>{info[1] || "Rica - ICA Component Viewer"}</title>
        </Helmet>
        <div className={`h-full min-h-full overflow-hidden text-center ${isTransitioning ? 'theme-transition' : ''}`}>
          {showIntroPopup && (
            <IntroPopup
              onDataLoad={onDataLoad}
              onLoadingStart={onLoadingStart}
              closePopup={toggleIntroPopup}
              isLoading={isLoading}
              isDark={isDark}
            />
          )}
          {showAboutPopup && <AboutPopup closePopup={toggleAboutPopup} isDark={isDark} />}
          {showTabs && (
            <AnimatedTabs defaultIndex={0}>
              {/* Minimal Modern Navbar */}
              <nav
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 24px",
                  backgroundColor: "var(--bg-primary)",
                  borderBottom: "1px solid var(--border-default)",
                  position: "sticky",
                  top: 0,
                  zIndex: 40,
                }}
              >
                {/* Left: Logo/Brand */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img
                    src="/favicon.ico"
                    alt="Rica logo"
                    style={{
                      width: "26px",
                      height: "26px",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "var(--text-primary)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Rica
                  </span>
                </div>

                {/* Center: Navigation Tabs */}
                <TabList
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
                  <AnimatedTab index={0} isDark={isDark}>
                    <FontAwesomeIcon
                      icon={["fas", "info-circle"]}
                      style={{ marginRight: "6px", fontSize: "13px", opacity: 0.7 }}
                    />
                    <span>Info</span>
                  </AnimatedTab>
                  <AnimatedTab index={1} isDark={isDark}>
                    <FontAwesomeIcon
                      icon={["fas", "chart-pie"]}
                      style={{ marginRight: "6px", fontSize: "13px", opacity: 0.7 }}
                    />
                    <span>ICA</span>
                  </AnimatedTab>
                  <AnimatedTab index={2} isDark={isDark}>
                    <FontAwesomeIcon
                      icon={["fas", "layer-group"]}
                      style={{ marginRight: "6px", fontSize: "13px", opacity: 0.7 }}
                    />
                    <span>Carpets</span>
                  </AnimatedTab>
                </TabList>

                {/* Right: Action Buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {/* Theme toggle */}
                  <button
                    onClick={toggleTheme}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "36px",
                      height: "36px",
                      fontSize: "14px",
                      color: "var(--text-secondary)",
                      backgroundColor: "transparent",
                      border: "1px solid var(--border-default)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                    title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                  >
                    <FontAwesomeIcon icon={isDark ? faSun : faMoon} />
                  </button>

                  <button
                    onClick={toggleIntroPopup}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "var(--text-secondary)",
                      backgroundColor: "transparent",
                      border: "1px solid var(--border-default)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                  >
                    <FontAwesomeIcon icon={["fas", "plus"]} style={{ fontSize: "11px" }} />
                    <span>New</span>
                  </button>
                  <button
                    onClick={toggleAboutPopup}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "36px",
                      height: "36px",
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      backgroundColor: "transparent",
                      border: "1px solid var(--border-default)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                    title="About"
                  >
                    <FontAwesomeIcon icon={["fas", "question"]} />
                  </button>
                </div>
              </nav>
              <TabPanels>
                <TabPanel index={0}>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Info info={info} isDark={isDark} />
                  </Suspense>
                </TabPanel>
                <TabPanel index={1}>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Plots
                      componentData={componentData}
                      componentFigures={componentFigures}
                      originalData={originalData}
                      mixingMatrix={mixingMatrix}
                      niftiBuffer={niftiBuffer}
                      maskBuffer={maskBuffer}
                      isDark={isDark}
                    />
                  </Suspense>
                </TabPanel>
                <TabPanel index={2}>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Carpets images={carpetFigures} isDark={isDark} />
                  </Suspense>
                </TabPanel>
              </TabPanels>
            </AnimatedTabs>
          )}
        </div>
      </HelmetProvider>
    </ThemeContext.Provider>
  );
}

export default App;

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
