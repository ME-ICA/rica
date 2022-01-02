import ReactDOM from "react-dom";
import React, { Component } from "react";

import Carpets from "./Carpets/Carpets";
import Plots from "./Plots/Plots";
import IntroPopup from "./PopUps/IntroPopUp";
import AboutPopup from "./PopUps/AboutPopUp";

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

import "./styles.css";

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

  toggleIntroPopup() {
    if (this.state.componentData.length !== 0) {
      this.setState({
        showIntroPopup: !this.state.showIntroPopup,
        showTabs: true,
      });
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
      <div className="main-container">
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
          <AnimatedTabs
            color="red"
            toggleIntroPopup={this.toggleIntroPopup.bind(this)}
            toggleAboutPopup={this.toggleAboutPopup.bind(this)}
          >
            <TabList style={{ justifyContent: "space-around" }}>
              <AnimatedTab index={0} style={{ flex: 1 }}>
                <p>Info</p>
                {/* title="Info" icon="info-circle" */}
              </AnimatedTab>
              <AnimatedTab index={1} style={{ flex: 2 }}>
                <p>ICA</p>
                {/* title="ICA" icon="chart-pie" */}
              </AnimatedTab>
              <AnimatedTab index={2} style={{ flex: 1 }}>
                <p>Carpets</p>
                {/* title="Carpets" icon="layer-group" */}
              </AnimatedTab>
              <ul className="header-right">
                <div
                  className="new-container"
                  onClick={this.props.toggleIntroPopup}
                >
                  {/* <FontAwesomeIcon icon={["fas", "plus"]} className="tab-icon" /> */}
                  <span>New</span>
                </div>
                <div
                  className="about-container"
                  onClick={this.props.toggleAboutPopup}
                >
                  {/* <FontAwesomeIcon icon={["fas", "question"]} className="tab-icon" /> */}
                  <span>About</span>
                </div>
              </ul>
            </TabList>
            <TabPanels style={{ padding: 10 }}>
              <TabPanel>
                <p className="info">{this.state.info}</p>
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
