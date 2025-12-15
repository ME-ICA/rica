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
} from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";

// Lazy load heavy components for better initial load
const Plots = lazy(() => import("./Plots/Plots"));
const Carpets = lazy(() => import("./Carpets/Carpets"));
const Info = lazy(() => import("./Info/Info"));

library.add(faInfoCircle, faLayerGroup, faChartPie, faPlus, faQuestion);

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

  return (
    <HelmetProvider>
      <Helmet>
        <title>{info[1] || "Rica - ICA Component Viewer"}</title>
      </Helmet>
      <div className="h-full min-h-full overflow-hidden text-center">
        {showIntroPopup && (
          <IntroPopup
            onDataLoad={onDataLoad}
            onLoadingStart={onLoadingStart}
            closePopup={toggleIntroPopup}
            isLoading={isLoading}
          />
        )}
        {showAboutPopup && <AboutPopup closePopup={toggleAboutPopup} />}
        {showTabs && (
          <AnimatedTabs defaultIndex={0}>
            {/* Modern Notion-style navbar */}
            <nav
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 24px",
                backgroundColor: "#ffffff",
                borderBottom: "1px solid #e5e5e5",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              }}
            >
              {/* Left: Logo/Brand */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img
                  src="/favicon.ico"
                  alt="Rica logo"
                  style={{
                    width: "28px",
                    height: "28px",
                  }}
                />
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#1f2937",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Rica
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "500",
                    color: "#9ca3af",
                    backgroundColor: "#f3f4f6",
                    padding: "2px 8px",
                    borderRadius: "4px",
                  }}
                >
                  v2.0
                </span>
              </div>

              {/* Center: Navigation Tabs */}
              <TabList
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  backgroundColor: "#f3f4f6",
                  padding: "4px",
                  borderRadius: "10px",
                }}
              >
                <AnimatedTab index={0}>
                  <FontAwesomeIcon
                    icon={["fas", "info-circle"]}
                    style={{ marginRight: "6px", fontSize: "14px" }}
                  />
                  <span>Info</span>
                </AnimatedTab>
                <AnimatedTab index={1}>
                  <FontAwesomeIcon
                    icon={["fas", "chart-pie"]}
                    style={{ marginRight: "6px", fontSize: "14px" }}
                  />
                  <span>ICA</span>
                </AnimatedTab>
                <AnimatedTab index={2}>
                  <FontAwesomeIcon
                    icon={["fas", "layer-group"]}
                    style={{ marginRight: "6px", fontSize: "14px" }}
                  />
                  <span>Carpets</span>
                </AnimatedTab>
              </TabList>

              {/* Right: Action Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={toggleIntroPopup}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                    e.currentTarget.style.borderColor = "#d1d5db";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                  }}
                >
                  <FontAwesomeIcon icon={["fas", "plus"]} style={{ fontSize: "12px" }} />
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
                    fontSize: "14px",
                    color: "#6b7280",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                    e.currentTarget.style.borderColor = "#d1d5db";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                    e.currentTarget.style.borderColor = "#e5e7eb";
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
                  <Info info={info} />
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
                  />
                </Suspense>
              </TabPanel>
              <TabPanel index={2}>
                <Suspense fallback={<LoadingSpinner />}>
                  <Carpets images={carpetFigures} />
                </Suspense>
              </TabPanel>
            </TabPanels>
          </AnimatedTabs>
        )}
      </div>
    </HelmetProvider>
  );
}

export default App;

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
