import ReactDOM from "react-dom";
import React, { Component } from "react";

import Tabs from "./Tabs";
import Panel from "./Panel";
import Carpets from "./Carpets";
import Plots from "./Plots";
import IntroPopup from "./IntroPopUp";
import AboutPopup from "./AboutPopUp";

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
    };
  }

  toggleIntroPopup() {
    if (this.state.componentData.length != 0) {
      this.setState({
        showIntroPopup: !this.state.showIntroPopup,
      });
    }
  }

  toggleAboutPopup() {
    this.setState({
      showAboutPopup: !this.state.showAboutPopup,
    });
  }

  callbackFunction = (childData) => {
    this.setState({ componentData: childData[2] });
    this.setState({ componentFigures: childData[0] });
    this.setState({ carpetFigures: childData[1] });
    this.setState({ info: childData[3] });
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
        <Tabs
          toggleIntroPopup={this.toggleIntroPopup.bind(this)}
          toggleAboutPopup={this.toggleAboutPopup.bind(this)}
        >
          <Panel title="Info" icon="info-circle">
            <p className="info">{this.state.info}</p>
          </Panel>
          <Panel title="ICA" icon="chart-pie">
            <Plots
              componentData={this.state.componentData}
              componentFigures={this.state.componentFigures}
            />
          </Panel>
          <Panel title="Carpets" icon="layer-group">
            <Carpets images={this.state.carpetFigures} />
          </Panel>
        </Tabs>
      </div>
    );
  }
}

export default App;

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
