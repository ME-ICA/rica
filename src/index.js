import React, { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider, Helmet } from "react-helmet-async";

import IntroPopup from "./PopUps/IntroPopUp";
import AboutPopup from "./PopUps/AboutPopUp";
import ChangelogPopup from "./PopUps/ChangelogPopUp";
import ManualClassificationWarningPopUp from "./PopUps/ManualClassificationWarningPopUp";
import MobileMain from "./Mobile";

import "./styles/output.css";
import "./styles.css";

import { TabList, TabPanels, TabPanel } from "./TabComponents";
import { AnimatedTab, AnimatedTabs } from "./TabFunctions";
import { LOGO_DATA_URL } from "./constants/logo";
import { VERSION } from "./constants/version";
import { getFolderName } from "./utils/pathUtils";
import { ThemeContext } from "./contexts/theme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faLayerGroup,
  faChartPie,
  faPlus,
  faQuestion,
  faSun,
  faMoon,
  faEyeLowVision,
  faHeartPulse,
  faBell,
  faProjectDiagram,
} from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";

// Import components directly (no lazy loading for single-file distribution)
import Plots from "./Plots/Plots";
import Carpets from "./Carpets/Carpets";
import Info from "./Info/Info";
import Diagnostics from "./Diagnostics/Diagnostics";
import DecisionTreeTab from "./Tree/DecisionTreeTab";

library.add(faInfoCircle, faLayerGroup, faChartPie, faPlus, faQuestion, faSun, faMoon, faEyeLowVision, faHeartPulse, faBell, faProjectDiagram);

function App() {
  const [runs, setRuns] = useState([]);
  const [selectedRunIndex, setSelectedRunIndex] = useState(0);
  const [componentData, setComponentData] = useState([]);
  const [componentFigures, setComponentFigures] = useState([]);
  const [carpetFigures, setCarpetFigures] = useState([]);
  const [diagnosticFigures, setDiagnosticFigures] = useState([]);
  const [reportText, setReportText] = useState([]);
  const [dirPath, setDirPath] = useState([]);
  const [showIntroPopup, setShowIntroPopup] = useState(true);
  const [showAboutPopup, setShowAboutPopup] = useState(false);
  const [showChangelogPopup, setShowChangelogPopup] = useState(false);
  const [showManualClassificationWarning, setShowManualClassificationWarning] = useState(false);
  const [showTabs, setShowTabs] = useState(false);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  // New state for Niivue integration
  const [mixingMatrix, setMixingMatrix] = useState(null);
  const [niftiBuffer, setNiftiBuffer] = useState(null);
  const [niftiUrl, setNiftiUrl] = useState(null);
  const [maskBuffer, setMaskBuffer] = useState(null);
  const [crossComponentMetrics, setCrossComponentMetrics] = useState(null);
  const [qcNiftiBuffers, setQcNiftiBuffers] = useState({});
  const [externalRegressorsFigure, setExternalRegressorsFigure] = useState(null);
  // Decision tree data
  const [decisionTreeData, setDecisionTreeData] = useState(null);
  const [statusTableData, setStatusTableData] = useState(null);
  // Repetition time from registry
  const [repetitionTime, setRepetitionTime] = useState(null);
  // Theme state
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('rica-theme');
    return saved || 'light';
  });
  const [colorblind, setColorblind] = useState(() => {
    return localStorage.getItem('rica-colorblind') === 'true';
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Detect if running from local server (hide "New" button)
  const [isLocalServer, setIsLocalServer] = useState(false);

  // Check for local server on mount
  useEffect(() => {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      fetch("/api/files")
        .then((r) => r.json())
        .then((data) => {
          if (data.files?.length > 0) {
            setIsLocalServer(true);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rica-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('rica-colorblind', String(colorblind));
  }, [colorblind]);

  const toggleColorblind = useCallback(() => {
    setColorblind((prev) => !prev);
  }, []);

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

  const toggleChangelogPopup = useCallback(() => {
    setShowChangelogPopup((prev) => !prev);
  }, []);

  const toggleManualClassificationWarning = useCallback(() => {
    setShowManualClassificationWarning((prev) => !prev);
  }, []);

  // Mark version as seen in localStorage
  const handleVersionSeen = useCallback((version) => {
    localStorage.setItem("rica-last-seen-version", version);
  }, []);

  // Check if we should show changelog on new version (after data is loaded)
  useEffect(() => {
    if (showTabs && !showIntroPopup) {
      const lastSeenVersion = localStorage.getItem("rica-last-seen-version");
      if (lastSeenVersion !== VERSION) {
        // Show changelog for new version
        setShowChangelogPopup(true);
      }
    }
  }, [showTabs, showIntroPopup]);

  // Called when data loading starts
  const onLoadingStart = useCallback(() => {
    setIsLoading(true);
  }, []);

  // Called when data is fully loaded - no more delays!
  const onDataLoad = useCallback(
    (data) => {
      // Set all state at once - no nested callbacks or delays
      setRuns(data.runs || []);
      setSelectedRunIndex(0);
      setComponentFigures(data.componentFigures);
      setCarpetFigures(data.carpetFigures);
      setDiagnosticFigures(data.diagnosticFigures || []);
      setComponentData(data.components);
      setReportText(data.info);
      setDirPath(data.dirPath);
      setOriginalData(data.originalData);
      // New data for Niivue integration
      setMixingMatrix(data.mixingMatrix);
      setNiftiBuffer(data.niftiBuffer || null);
      setNiftiUrl(data.niftiUrl || null);
      setMaskBuffer(data.maskBuffer);
      setCrossComponentMetrics(data.crossComponentMetrics);
      setQcNiftiBuffers(data.qcNiftiBuffers || []);
      setExternalRegressorsFigure(data.externalRegressorsFigure);
      // Decision tree data
      setDecisionTreeData(data.decisionTreeData);
      setStatusTableData(data.statusTableData);
      setRepetitionTime(data.repetitionTime);
      setIsLoading(false);
      toggleIntroPopup();
      
      // Show manual classification warning if applicable
      if (data.hasManualClassifications) {
        setShowManualClassificationWarning(true);
      }
    },
    [toggleIntroPopup]
  );

  const isMobile = width <= 1024;

  if (isMobile) {
    return <MobileMain />;
  }

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark, colorblind, toggleColorblind }}>
      <HelmetProvider>
        <Helmet>
          <title>{getFolderName(dirPath[selectedRunIndex]) || "Rica - ICA Component Viewer"}</title>
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
          {showManualClassificationWarning && (
            <ManualClassificationWarningPopUp
              closePopup={toggleManualClassificationWarning}
              isDark={isDark}
            />
          )}
          {showChangelogPopup && (
            <ChangelogPopup
              closePopup={toggleChangelogPopup}
              isDark={isDark}
              onVersionSeen={handleVersionSeen}
            />
          )}
          {showTabs && (
            <AnimatedTabs defaultIndex={0}>
              {/* Minimal Modern Navbar */}
              <nav
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  alignItems: "center",
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
                    src={LOGO_DATA_URL}
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
                  <AnimatedTab index={3} isDark={isDark}>
                    <FontAwesomeIcon
                      icon={["fas", "heart-pulse"]}
                      style={{ marginRight: "6px", fontSize: "13px", opacity: 0.7 }}
                    />
                    <span>QC</span>
                  </AnimatedTab>
                  {decisionTreeData?.[selectedRunIndex] && statusTableData?.[selectedRunIndex] && (
                    <AnimatedTab index={4} isDark={isDark}>
                      <FontAwesomeIcon
                        icon={["fas", "project-diagram"]}
                        style={{ marginRight: "6px", fontSize: "13px", opacity: 0.7 }}
                      />
                      <span>Tree</span>
                    </AnimatedTab>
                  )}
                </TabList>

                {/* Right: Action Buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
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

                  {/* Colourblind palette toggle */}
                  <button
                    type="button"
                    onClick={toggleColorblind}
                    aria-pressed={colorblind}
                    aria-label={colorblind ? "Disable colourblind palette" : "Enable colourblind palette"}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "36px",
                      height: "36px",
                      fontSize: "14px",
                      color: colorblind ? "var(--text-primary)" : "var(--text-secondary)",
                      backgroundColor: colorblind ? "var(--bg-tertiary)" : "transparent",
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
                      e.currentTarget.style.backgroundColor = colorblind ? "var(--bg-tertiary)" : "transparent";
                      e.currentTarget.style.color = colorblind ? "var(--text-primary)" : "var(--text-secondary)";
                    }}
                    title={colorblind ? "Disable colourblind palette" : "Enable colourblind palette"}
                  >
                    <FontAwesomeIcon icon={faEyeLowVision} />
                  </button>

                  {/* Hide "New" button when running from local server */}
                  {!isLocalServer && (
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
                  )}
                  <button
                    onClick={toggleChangelogPopup}
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
                    title="What's New"
                  >
                    <FontAwesomeIcon icon={faBell} />
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
              {runs.length > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 24px",
                    backgroundColor: "var(--bg-secondary)",
                    borderBottom: "1px solid var(--border-default)",
                    position: "sticky",
                    top: "57px",
                    zIndex: 39,
                  }}
                >
                  <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>Run:</span>
                  {runs.map((label, i) => (
                    <button
                      key={label}
                      onClick={() => setSelectedRunIndex(i)}
                      aria-pressed={i === selectedRunIndex}
                      style={{
                        padding: "4px 12px",
                        fontSize: "12px",
                        fontWeight: i === selectedRunIndex ? 600 : 400,
                        color: i === selectedRunIndex ? "var(--text-primary)" : "var(--text-secondary)",
                        backgroundColor: i === selectedRunIndex ? "var(--bg-tertiary)" : "transparent",
                        border: "1px solid",
                        borderColor: i === selectedRunIndex ? "var(--border-default)" : "transparent",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              <TabPanels>
                {(() => {
                  const r = selectedRunIndex;
                  return (
                    <>
                <TabPanel index={0}>
                  <Info info={reportText[r] ?? ""} dirPath={dirPath[r] ?? ""} isDark={isDark} />
                </TabPanel>
                <TabPanel index={1}>
                  <Plots
                    componentData={[componentData?.[r]]}
                    componentFigures={componentFigures?.[r] || []}
                    originalData={[originalData?.[r]]}
                    mixingMatrix={mixingMatrix?.[r]}
                    niftiBuffer={niftiBuffer?.[r]}
                    niftiUrl={niftiUrl?.[r]}
                    maskBuffer={maskBuffer?.[r]}
                    crossComponentMetrics={crossComponentMetrics?.[r]}
                    externalRegressorsFigure={externalRegressorsFigure?.[r]}
                    repetitionTime={repetitionTime?.[r]}
                    isDark={isDark}
                  />
                </TabPanel>
                <TabPanel index={2}>
                  <Carpets images={carpetFigures?.[r] || []} isDark={isDark} />
                </TabPanel>
                <TabPanel index={3}>
                  <Diagnostics
                    images={diagnosticFigures?.[r] || []}
                    qcNiftiBuffers={qcNiftiBuffers?.[r] || {}}
                    maskBuffer={maskBuffer?.[r]}
                    isDark={isDark}
                  />
                </TabPanel>
                {decisionTreeData?.[r] && statusTableData?.[r] && (
                  <TabPanel index={4}>
                    <DecisionTreeTab
                      decisionTreeData={decisionTreeData[r]}
                      statusTableData={statusTableData[r]}
                      componentData={[componentData?.[r]]}
                      mixingMatrix={mixingMatrix?.[r]}
                      niftiBuffer={niftiBuffer?.[r]}
                      niftiUrl={niftiUrl?.[r]}
                      maskBuffer={maskBuffer?.[r]}
                      isDark={isDark}
                    />
                  </TabPanel>
                )}
                    </>
                  );
                })()}
              </TabPanels>
            </AnimatedTabs>
          )}
        </div>
      </HelmetProvider>
    </ThemeContext.Provider>
  );
}

export default App;

// Wait for DOM to be ready (needed for inline scripts in <head>)
function mount() {
  const container = document.getElementById("root");
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
