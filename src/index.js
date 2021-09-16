import ReactDOM from "react-dom";
import React, { Component } from "react";

import Tabs from "./Tabs";
import Panel from "./Panel";
import CarpetOption from "./CarpetOption";
import Plots from "./Plots";
import UploadFolder from "./UploadFolder";

import "./styles.css";

const carpetsjson = [
  { name: "Optimally combined", path: "./figures/carpet_optcom.svg" },
  { name: "Denoised", path: "./figures/carpet_denoised.svg" },
  { name: "Accepted", path: "./figures/carpet_accepted.svg" },
  { name: "Rejected", path: "./figures/carpet_rejected.svg" },
];

class Popup extends React.Component {
  render() {
    return (
      <div className="popup">
        <div className="popup_inner">
          <h1>{this.props.text}</h1>
          <UploadFolder parentCallback={this.props.callBack} />
          <button onClick={this.props.closePopup}>close me</button>
        </div>
      </div>
    );
  }
}
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      carpetpath: "./figures/carpet_optcom.svg",
      componentData: [],
      compFigures: [],
      carpetFigures: [],
      info: "",
      showPopup: true,
    };
  }

  togglePopup() {
    this.setState({
      showPopup: !this.state.showPopup,
    });
  }

  onChange = (e) => {
    this.setState({ carpetpath: e.target.value });
  };

  callbackFunction = (childData) => {
    this.setState({ componentData: childData[2] });
    this.setState({ componentFigures: childData[0] });
    this.setState({ carpetFigures: childData[1] });
    this.setState({ info: childData[3] });
  };

  render() {
    const { carpetpath } = this.state;

    // console.log(
    //   setTimeout(() => {
    //     console.log(this.state.info[0]);
    //   }, 3000)
    // );

    return (
      <div className="main-container">
        {this.state.showPopup ? (
          <Popup
            text="Close Me"
            callBack={this.callbackFunction}
            closePopup={this.togglePopup.bind(this)}
          />
        ) : null}
        <div style={{ marginLeft: "33px" }}>
          <a href="https://github.com/ME-ICA/tedana" className="title">
            tedana
          </a>
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
