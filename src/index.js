import ReactDOM from "react-dom";
import React, { Component } from "react";

import Tabs from "./Tabs";
import Panel from "./Panel";
import Carpets from "./Carpets";
import Plots from "./Plots";
import UploadFolder from "./UploadFolder";

import "./styles.css";

class Popup extends React.Component {
  render() {
    return (
      <div className="popup">
        <div className="popup_inner">
          <h1>{this.props.text}</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
            pharetra risus eget aliquam aliquet. Donec semper nisl nec arcu
            dictum interdum. Nulla facilisi. Pellentesque vitae lacus semper,
            porta nibh eu, suscipit mi. Nunc sollicitudin vel diam a pulvinar.
            Vestibulum tincidunt aliquet risus ac aliquet. Curabitur mattis
            volutpat imperdiet. Mauris vitae pretium mauris, in commodo magna.
            Quisque ut ipsum id lacus pretium viverra faucibus id lacus. Sed
            eget justo in tortor sodales suscipit.
          </p>
          <UploadFolder parentCallback={this.props.callBack} />
          <button
            onClick={this.props.closePopup}
            type="button"
            class="close"
          ></button>
        </div>
      </div>
    );
  }
}
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
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

  callbackFunction = (childData) => {
    this.setState({ componentData: childData[2] });
    this.setState({ componentFigures: childData[0] });
    this.setState({ carpetFigures: childData[1] });
    this.setState({ info: childData[3] });
  };

  render() {
    return (
      <div className="main-container">
        {this.state.showPopup ? (
          <Popup
            text="ICA Reports"
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
            <Plots
              componentData={this.state.componentData}
              componentFigures={this.state.componentFigures}
            />
          </Panel>
          <Panel title="Carpets">
            <Carpets images={this.state.carpetFigures} />
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
