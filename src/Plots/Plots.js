import React from "react";
import { Line, Pie, Chart } from "react-chartjs-2";
import zoomPlugin from "chartjs-plugin-zoom";
import ToggleSwitch from "./ToggleSwitch";
import ResetAndSave from "./ResetAndSave";
import {
  options_kappa_rho,
  options_kappa,
  options_rho,
  optionsPie,
} from "./PlotOptions";
import {
  parseData,
  assignColor,
  updatePieColors,
  updateScatterColors,
  resetAndUpdateColors,
} from "./PlotUtils";

Chart.register(zoomPlugin); // REGISTER PLUGIN

const acceptedColor = "#A8E3A5";
const acceptedColorHover = "#68AC64";
const rejedtecColor = "#E99497";
const rejedtecColorHover = "#B35458";
const ignoredColor = "#B5DEFF";
const ignoredColorHover = "#689FCC";

class Plots extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clickedElement: "",
      kappaRho: [],
      variance: [],
      kappa: [],
      rho: [],
      selectedLabel: 0,
      selectedColor: { acceptedColor },
      selectedClassification: "accepted",
    };
  }

  // Parse the original data provided by the user into the necessary 4 objects
  readOriginalData() {
    var compData = this.props.componentData[0];
    assignColor(compData);
    var parsed_data = parseData(compData);
    this.setState({ kappaRho: parsed_data[0] });
    this.setState({ variance: parsed_data[1] });
    this.setState({ kappa: parsed_data[2] });
    this.setState({ rho: parsed_data[3] });
  }

  // Only read data on the first render of the Plots page
  componentDidMount() {
    this.readOriginalData();
  }

  // Update the component if new componentData is provided
  componentDidUpdate(prevProps) {
    if (this.props.componentData !== prevProps.componentData) {
      // Read original data after 500 ms
      setTimeout(() => {
        this.readOriginalData();
      }, 500);
    }
  }

  // Update all attributes of a manually classified component on all 4 plots
  handleNewSelection(val) {
    var variance = { ...this.state.variance };
    var kappaRho = { ...this.state.kappaRho };
    var kappa = { ...this.state.kappa };
    var rho = { ...this.state.rho };

    var pieIndex = variance.labels.indexOf(this.state.selectedLabel);
    variance.datasets[0].classification[pieIndex] = val;

    var scatterIndex = kappaRho.labels.indexOf(this.state.selectedLabel);
    kappaRho.datasets[0].classification[scatterIndex] = val;
    kappa.datasets[0].classification[scatterIndex] = val;
    rho.datasets[0].classification[scatterIndex] = val;

    if (val === "accepted") {
      updatePieColors(variance, pieIndex, acceptedColorHover, true);
      updateScatterColors(kappaRho, scatterIndex, acceptedColorHover, true);
      updateScatterColors(kappa, scatterIndex, acceptedColorHover, true);
      updateScatterColors(rho, scatterIndex, acceptedColorHover, true);
      this.setState({ selectedColor: acceptedColor });
    } else if (val === "rejected") {
      updatePieColors(variance, pieIndex, rejedtecColorHover, true);
      updateScatterColors(kappaRho, scatterIndex, rejedtecColorHover, true);
      updateScatterColors(kappa, scatterIndex, rejedtecColorHover, true);
      updateScatterColors(rho, scatterIndex, rejedtecColorHover, true);
      this.setState({ selectedColor: rejedtecColor });
    } else if (val === "ignored") {
      updatePieColors(variance, pieIndex, ignoredColorHover, true);
      updateScatterColors(kappaRho, scatterIndex, ignoredColorHover, true);
      updateScatterColors(kappa, scatterIndex, ignoredColorHover, true);
      updateScatterColors(rho, scatterIndex, ignoredColorHover, true);
      this.setState({ selectedColor: ignoredColor });
    }

    this.setState({ variance: variance });
    this.setState({ kappaRho: kappaRho });
    this.setState({ kappa: kappa });
    this.setState({ rho: rho });
    this.setState({ selectedClassification: val });
  }

  saveManualClassification() {
    var origData = this.props.originalData[0];
    var variance = { ...this.state.variance };

    // Remove color columns and add new classification column
    for (var i = 0; i < origData.length; i++) {
      delete origData[i].color;
      delete origData[i].colorHover;
      // Find index of component in variance object to get new classification
      var pieIndex = variance.labels.indexOf(origData[i].Component);
      origData[i].manual_classification =
        this.state.variance.datasets[0].classification[pieIndex];
    }

    // grab the column headings (separated by tabs)
    const headings = Object.keys(origData[0]).join("\t");

    // iterate over the data
    const rows = origData
      .reduce((acc, c) => {
        // for each row object get its values and add tabs between them
        // then add them as a new array to the outgoing array
        return acc.concat([Object.values(c).join("\t")]);

        // finally joining each row with a line break
      }, [])
      .join("\n");

    // Merge into a tsv file and make it downloadable
    var tsv = [headings, rows].join("\n");
    var hiddenElement = document.createElement("a");
    hiddenElement.href = "data:text/tsv;charset=utf-8," + encodeURI(tsv);
    // hiddenElement.target = "_blank";
    hiddenElement.download = "manual_classification.tsv";
    hiddenElement.click();
  }

  render() {
    // Handle onClick events on the Pie chart
    const getPieElementAtEvent = (element) => {
      if (!element.length) return;

      const { datasetIndex, index } = element[0];

      // Set hover color as background to show selection
      var variance = { ...this.state.variance };
      resetAndUpdateColors(variance, index, true);
      this.setState({ variance: variance });
      var selectedLabel = variance.labels[index];
      this.setState({ selectedLabel: selectedLabel });
      this.setState({
        selectedColor: variance.datasets[0].hoverBackgroundColor[index],
      });
      this.setState({
        selectedClassification: variance.datasets[0].classification[index],
      });

      var kappaRho = { ...this.state.kappaRho };
      var scatterIndex = kappaRho.labels.indexOf(selectedLabel);
      resetAndUpdateColors(kappaRho, scatterIndex, false);
      this.setState({ kappaRho: kappaRho });

      var kappa = { ...this.state.kappa };
      resetAndUpdateColors(kappa, scatterIndex, false);
      this.setState({ kappa: kappa });

      var rho = { ...this.state.rho };
      resetAndUpdateColors(rho, scatterIndex, false);
      this.setState({ rho: rho });

      // Get component name of selected component
      var compName = this.state.variance.labels[index].match(/\d/g);
      compName = compName.join("");
      compName = `comp_0${compName}.png`;

      // iterate over each element in the array to retrieve image of selected component based on name
      for (var i = 0; i < this.props.componentFigures.length; i++) {
        // look for the entry with a matching `compName` value
        if (this.props.componentFigures[i].name === compName) {
          this.setState({ clickedElement: this.props.componentFigures[i].img });
        }
      }
    };

    // Handle onClick events on the Scatter charts
    const getScatterElementAtEvent = (element) => {
      if (!element.length) return;

      const { datasetIndex, index } = element[0];

      // Set hover color as background to show selection
      var kappaRho = { ...this.state.kappaRho };
      resetAndUpdateColors(kappaRho, index, false);
      this.setState({ kappaRho: kappaRho });
      var selectedLabel = kappaRho.labels[index];
      this.setState({ selectedLabel: selectedLabel });
      this.setState({
        selectedColor: kappaRho.datasets[0].pointHoverBackgroundColor[index],
      });
      this.setState({
        selectedClassification: kappaRho.datasets[0].classification[index],
      });

      var kappa = { ...this.state.kappa };
      resetAndUpdateColors(kappa, index, false);
      this.setState({ kappa: kappa });

      var rho = { ...this.state.rho };
      resetAndUpdateColors(rho, index, false);
      this.setState({ rho: rho });

      var variance = { ...this.state.variance };
      var pieIndex = variance.labels.indexOf(selectedLabel);
      resetAndUpdateColors(variance, pieIndex, true);
      this.setState({ variance: variance });

      // Get component name of selected component
      var compName = this.state.kappaRho.labels[index].match(/\d/g);
      compName = compName.join("");
      compName = `comp_0${compName}.png`;

      // iterate over each element in the array to retrieve image of selected component based on name
      for (var i = 0; i < this.props.componentFigures.length; i++) {
        // look for the entry with a matching `compName` value
        if (this.props.componentFigures[i].name === compName) {
          this.setState({ clickedElement: this.props.componentFigures[i].img });
        }
      }
    };

    return (
      <center>
        <div className="inline-block my-5">
          <ToggleSwitch
            values={["accepted", "rejected", "ignored"]}
            selected={this.state.selectedClassification}
            colors={[acceptedColorHover, rejedtecColorHover, ignoredColorHover]}
            handleNewSelection={this.handleNewSelection.bind(this)}
          />
        </div>
        <ResetAndSave
          handleReset={this.readOriginalData.bind(this)}
          handleSave={this.saveManualClassification.bind(this)}
        />
        <div className="plot-container-out">
          <div className="help-text">
            <p>
              Select an area or use the wheel to zoom in. Shift + click and drag
              to pan.
            </p>
          </div>
          <div className="plot-container-in">
            <div className="plot-box kappa_rho">
              <Line
                data={this.state.kappaRho}
                height={21}
                width={20}
                options={options_kappa_rho}
                getElementAtEvent={getScatterElementAtEvent}
              />
            </div>
            <div className="plot-box">
              <Pie
                data={this.state.variance}
                height={20}
                width={20}
                options={optionsPie}
                getElementAtEvent={getPieElementAtEvent}
              />
            </div>
            <div className="plot-box">
              <Line
                data={this.state.rho}
                height={21}
                width={20}
                options={options_rho}
                getElementAtEvent={getScatterElementAtEvent}
              />
            </div>
            <div className="plot-box">
              <Line
                data={this.state.kappa}
                height={21}
                width={20}
                options={options_kappa}
                getElementAtEvent={getScatterElementAtEvent}
              />
            </div>
          </div>
          <div className="component-plots-image">
            <img
              className="imgComponentPlot"
              alt=""
              src={this.state.clickedElement}
            />
          </div>
        </div>
      </center>
    );
  }
}

export default Plots;
