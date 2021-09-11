import ReactDOM from "react-dom";
import React, { Component } from "react";

import Tabs from "./Tabs";
import Panel from "./Panel";
import CarpetOption from "./CarpetOption";
import Plots from "./Plots";
import SubmitFile from "./SubmitFile";

import "./styles.css";

const carpetsjson = [
  { name: "Optimally combined", path: "./figures/carpet_optcom.svg" },
  { name: "Denoised", path: "./figures/carpet_denoised.svg" },
  { name: "Accepted", path: "./figures/carpet_accepted.svg" },
  { name: "Rejected", path: "./figures/carpet_rejected.svg" },
];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      carpetpath: "./figures/carpet_optcom.svg",
      componentData: [],
      compFigures: [],
      carpetFigures: [],
      info: "",
    };
  }

  onChange = (e) => {
    this.setState({ carpetpath: e.target.value });
  };

  callbackFunction = (childData) => {
    console.log(childData[2])
    this.setState({ componentData: childData[2] });
    this.setState({ componentFigures: childData[0] });
    this.setState({ carpetFigures: childData[1] });
    this.setState({ info: childData[3] });
  };

  render() {
    const { carpetpath } = this.state;

    return (
      <div className="main-container">
        <div style={{ marginLeft: "33px" }}>
          <a href="https://github.com/ME-ICA/tedana" className="title">
            tedana
          </a>
          <SubmitFile parentCallback={this.callbackFunction} />
        </div>
        <Tabs>
          <Panel title="ICA">
            <Plots componentData={this.state.componentData} />
          </Panel>
          <Panel title="Carpets">
            <center>
              <select className="dd-menu" onChange={this.onChange}>
                {carpetsjson.map((carpet, key) => (
                  <CarpetOption
                    key={key}
                    name={carpet.name}
                    path={carpet.path}
                  />
                ))}
              </select>
              <div className="carpet-plots-image">
                <img id="imgCarpetPlot" alt="" src={carpetpath} />
              </div>
            </center>
          </Panel>
          <Panel title="Info">
            <p className="info">{this.state.info}</p>
          </Panel>
        </Tabs>
      </div>
    );
  }
}

export default App;

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
