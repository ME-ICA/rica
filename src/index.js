import ReactDOM from "react-dom";
import React, { Component } from "react";

import Carpets from "./Carpets/Carpets";
import Info from "./Info/Info";
import Plots from "./Plots/Plots";
import IntroPopup from "./PopUps/IntroPopUp";
import AboutPopup from "./PopUps/AboutPopUp";

import "./styles/output.css";
import "./styles.css";

import { TabList, TabPanels, TabPanel } from "@reach/tabs";
import { AnimatedTab, AnimatedTabs } from "./TabFunctions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faLayerGroup,
  faChartPie,
  faPlus,
  faQuestion,
} from "@fortawesome/free-solid-svg-icons";

import { library } from "@fortawesome/fontawesome-svg-core"; //allows later to just use icon name to render-them

library.add(faInfoCircle, faLayerGroup, faChartPie, faPlus, faQuestion);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      componentData: [],
      compFigures: [],
      carpetFigures: [],
      info: "",
      showIntroPopup: true,
      showAboutPopup: false,
      showTabs: false,
      originalData: [],
    };
  }

  setToasterRef = (ref) => {
    this.toaster = ref;
  };

  toggleIntroPopup() {
    if (this.state.componentData.length !== 0) {
      this.setState({
        showIntroPopup: !this.state.showIntroPopup,
        showTabs: true,
      });
    } else if (this.state.componentData.length === 0) {
      // Show an alert
      setTimeout(() => {
        console.log("The metrics table is missing.");
        alert("The metrics table is missing.");
      }, 200);
    } else if (this.state.componentFigures.length === 0) {
      // Show an alert
      setTimeout(() => {
        console.log("The component figures are missing.");
        alert("The component figures are missing.");
      }, 200);
    } else if (this.state.carpetFigures.length === 0) {
      // Show an alert
      setTimeout(() => {
        console.log("The carpet figures are missing.");
        alert("The carpet figures are missing.");
      }, 200);
    } else if (this.state.info === "") {
      // Show an alert
      setTimeout(() => {
        console.log("The info is missing.");
        alert("The info is missing.");
      }, 200);
    }
  }

  toggleAboutPopup() {
    this.setState({
      showAboutPopup: !this.state.showAboutPopup,
    });
  }

  toggleTabsVisibility() {
    this.setState({
      showTabs: !this.state.showTabs,
    });
  }

  callbackFunction = (childData) => {
    this.setState({ componentData: childData[2] });
    this.setState({ componentFigures: childData[0] });
    this.setState({ carpetFigures: childData[1] });
    this.setState({ info: childData[3] });
    this.setState({ originalData: childData[4] });
  };

  render() {
    return (
      <div className="h-full min-h-full overflow-hidden text-center ">
        {this.state.showIntroPopup ? (
          <IntroPopup
            callBack={this.callbackFunction}
            closePopup={this.toggleIntroPopup.bind(this)}
          />
        ) : null}
        {this.state.showAboutPopup ? (
          <AboutPopup
            callBack={this.callbackFunction}
            closePopup={this.toggleAboutPopup.bind(this)}
          />
        ) : null}
        {this.state.showTabs ? (
          <AnimatedTabs>
            <TabList
              className="text-base border-b z-5 border-b-gray-300"
              style={{ justifyContent: "space-around" }}
            >
              <AnimatedTab index={0} style={{ flex: 1 }}>
                <FontAwesomeIcon
                  icon={["fas", "info-circle"]}
                  size="lg"
                  className="mx-2"
                />
                <span>Info</span>
              </AnimatedTab>
              <AnimatedTab index={1} style={{ flex: 2 }}>
                <FontAwesomeIcon
                  icon={["fas", "chart-pie"]}
                  size="lg"
                  className="mx-2"
                />
                <span>ICA</span>
              </AnimatedTab>
              <AnimatedTab index={2} style={{ flex: 1 }}>
                <FontAwesomeIcon
                  icon={["fas", "layer-group"]}
                  size="lg"
                  className="mx-2"
                />
                <span>Carpets</span>
              </AnimatedTab>
              <ul className="absolute top-0 right-0 mr-40">
                <div
                  className="absolute top-0 right-0 flex mr-24 text-base text-gray-500 rounded-lg hover:text-gray-900 hover:cursor-pointer"
                  onClick={this.toggleIntroPopup.bind(this)}
                  style={{ padding: "8px 16px" }}
                >
                  <FontAwesomeIcon
                    icon={["fas", "plus"]}
                    size="lg"
                    className="mx-2"
                  />
                  <span>New</span>
                </div>
                <div
                  className="absolute right-0 flex text-base text-gray-500 rounded-lg hover:text-gray-900 hover:cursor-pointer"
                  onClick={this.toggleAboutPopup.bind(this)}
                  style={{ padding: "8px 16px" }}
                >
                  <FontAwesomeIcon
                    icon={["fas", "question"]}
                    size="lg"
                    className="mx-2"
                  />
                  <span>About</span>
                </div>
              </ul>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Info info={this.state.info} />
              </TabPanel>
              <TabPanel>
                <Plots
                  componentData={this.state.componentData}
                  componentFigures={this.state.componentFigures}
                  originalData={this.state.originalData}
                />
              </TabPanel>
              <TabPanel>
                <Carpets images={this.state.carpetFigures} />
              </TabPanel>
            </TabPanels>
          </AnimatedTabs>
        ) : null}
      </div>
    );
  }
}

export default App;

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
