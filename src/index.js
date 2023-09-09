import ReactDOM from "react-dom";
import React, { Component } from "react";
import { Helmet } from 'react-helmet';

import Carpets from "./Carpets/Carpets";
import Info from "./Info/Info";
import Plots from "./Plots/Plots";
import IntroPopup from "./PopUps/IntroPopUp";
import AboutPopup from "./PopUps/AboutPopUp";
import MobileMain from "./Mobile";

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
      componentFigures: [],
      carpetFigures: [],
      info: [],
      showIntroPopup: true,
      showAboutPopup: false,
      showTabs: false,
      originalData: [],
      dataRead: [],
      width: window.innerWidth,
    };
  }

  setToasterRef = (ref) => {
    this.toaster = ref;
  };

  toggleIntroPopup() {
    this.setState({
      showIntroPopup: !this.state.showIntroPopup,
      showTabs: true,
    });
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

  onDataLoad = (childData) => {
    this.setState({ dataRead: childData }, () => {
      console.log(this.state.dataRead);
      setTimeout(() => {
        this.setState({ componentData: this.state.dataRead[2] }, () => {
          console.log(this.state.componentData);
          this.setState({ componentFigures: this.state.dataRead[0] }, () => {
            console.log(this.state.componentFigures);
            this.setState({ carpetFigures: this.state.dataRead[1] }, () => {
              console.log(this.state.carpetFigures);
              // Append to the end of the info array
              this.setState({ info: [this.state.dataRead[3], this.state.dataRead[5]] }, () => {
                console.log(this.state.info);
                this.setState({ originalData: this.state.dataRead[4] }, () => {
                  console.log(this.state.originalData);
                  this.toggleIntroPopup();
                });
              });
            });
          });
        });
      }, 5000);
    });
  };

  componentWillMount() {
    window.addEventListener("resize", this.handleWindowSizeChange);
  }

  // make sure to remove the listener
  // when the component is not mounted anymore
  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowSizeChange);
  }

  handleWindowSizeChange = () => {
    this.setState({ width: window.innerWidth });
  };

  render() {
    const { width } = this.state;
    const isMobile = width <= 1024;

    if (isMobile) {
      return (
        <div>
          <MobileMain />
        </div>
      );
    } else {
      return (
        <>
          <Helmet>
            <title>{this.state.info[1]}</title>
          </Helmet>
          <div className="h-full min-h-full overflow-hidden text-center ">
            {this.state.showIntroPopup ? (
              <IntroPopup
                onDataLoad={this.onDataLoad}
                closePopup={this.toggleIntroPopup.bind(this)}
              />
            ) : null}
            {this.state.showAboutPopup ? (
              <AboutPopup
                callBack={this.onDataLoad}
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
        </>
      );
    }
  }
}

export default App;

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
