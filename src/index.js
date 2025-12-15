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
            <TabList className="text-base border-b border-b-gray-300 flex items-center relative">
              <div className="flex justify-center flex-1">
                <AnimatedTab index={0}>
                  <FontAwesomeIcon
                    icon={["fas", "info-circle"]}
                    size="lg"
                    className="mx-2"
                  />
                  <span>Info</span>
                </AnimatedTab>
                <AnimatedTab index={1}>
                  <FontAwesomeIcon
                    icon={["fas", "chart-pie"]}
                    size="lg"
                    className="mx-2"
                  />
                  <span>ICA</span>
                </AnimatedTab>
                <AnimatedTab index={2}>
                  <FontAwesomeIcon
                    icon={["fas", "layer-group"]}
                    size="lg"
                    className="mx-2"
                  />
                  <span>Carpets</span>
                </AnimatedTab>
              </div>
              <div className="flex items-center mr-4">
                <button
                  className="flex items-center px-4 py-2 text-base text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                  onClick={toggleIntroPopup}
                >
                  <FontAwesomeIcon
                    icon={["fas", "plus"]}
                    size="lg"
                    className="mx-2"
                  />
                  <span>New</span>
                </button>
                <button
                  className="flex items-center px-4 py-2 text-base text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                  onClick={toggleAboutPopup}
                >
                  <FontAwesomeIcon
                    icon={["fas", "question"]}
                    size="lg"
                    className="mx-2"
                  />
                  <span>About</span>
                </button>
              </div>
            </TabList>
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
