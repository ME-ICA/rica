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
import { HotKeys } from "react-hotkeys";

Chart.register(zoomPlugin); // REGISTER PLUGIN

const acceptedColor = "#86EFAC";
const acceptedColorHover = "#22C55E";
const rejedtecColor = "#FCA5A5";
const rejedtecColorHover = "#EF4444";
const ignoredColor = "#7DD3FC";
const ignoredColorHover = "#0EA5E9";

const keyMap = {
  ACCEPT: "a",
  REJECT: "r",
  IGNORE: "i",
  MOVE_UP: "left",
  MOVE_DOWN: "right",
};

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
      selectedScatter: true,
      selectedPie: false,
      selectedIndex: 0,
    };
  }

  handlers = {
    ACCEPT: (event) => {
      this.handleNewSelection("accepted");
    },
    REJECT: (event) => {
      this.handleNewSelection("rejected");
    },
    IGNORE: (event) => {
      this.handleNewSelection("ignored");
    },
    MOVE_UP: (event) => {
      if (this.state.selectedPie) {
        if (this.state.selectedIndex > 0) {
          this.setState({ selectedIndex: this.state.selectedIndex - 1 }, () => {
            this.updatePiePlot(this.state.selectedIndex);
          });
        }
      }
      if (this.state.selectedScatter) {
        // Get the new rank as the current one minus one
        var kappa = { ...this.state.kappa };
        var newRank = kappa.datasets[0].data[this.state.selectedIndex].x - 1;
        if (newRank > 0) {
          // Find kappa.datasets[0].data.x that is equal to newRank
          var newIndex = kappa.datasets[0].data.findIndex(
            (element) => element.x === newRank
          );
          this.setState({ selectedIndex: newIndex }, () => {
            this.updateScatterPlots(newIndex);
          });
        }
      }
    },
    MOVE_DOWN: (event) => {
      if (this.state.selectedPie) {
        if (
          this.state.selectedIndex <
          this.state.variance.datasets[0].data.length - 1
        ) {
          this.setState({ selectedIndex: this.state.selectedIndex + 1 }, () => {
            this.updatePiePlot(this.state.selectedIndex);
          });
        }
      }
      if (this.state.selectedScatter) {
        // Get the new rank as the current one plus one
        var kappa = { ...this.state.kappa };
        var newRank = kappa.datasets[0].data[this.state.selectedIndex].x + 1;
        if (newRank < kappa.datasets[0].data.length) {
          // Find kappa.datasets[0].data.x that is equal to newRank
          var newIndex = kappa.datasets[0].data.findIndex(
            (element) => element.x === newRank
          );
          this.setState({ selectedIndex: newIndex }, () => {
            this.updateScatterPlots(newIndex);
          });
        }
      }
    },
  };

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
      origData[i].original_classification = origData[i].classification;
      origData[i].classification =
        this.state.variance.datasets[0].classification[pieIndex];

      // Append "manual reclassify with Rica" to classification_tags of components
      // that have different values in original_classification and classification
      if (origData[i].classification !== origData[i].original_classification) {
        origData[i].classification_tags =
          origData[i].classification_tags + ", Manual reclassify with Rica";
        // If origData has "rationale", then add "I001" to it
        if (origData[i].rationale) {
          origData[i].rationale = "I001";
        }
      }
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

    // Extract the indices of the components that have been manually accepted into a new array
    // Do the same with rejected components
    var accepted = [];
    var rejected = [];
    for (var i = 0; i < origData.length; i++) {
      // If classification is accepted, classification_tag exists, and classification_tags has "Manual reclassify with Rica"
      // Or if rationale is "I001"
      if (
        (origData[i].classification === "accepted" &&
          origData[i].classification_tags &&
          origData[i].classification_tags.includes("Manual reclassify with Rica"))
        || (origData[i].rationale == "I001")
      ) {
        accepted.push(i);
      }

      // If classification is rejected, classification_tag exists and classification_tags has "Manual reclassify with Rica"
      // Or if rationale is "I001"
      if (
        (origData[i].classification === "rejected" &&
          origData[i].classification_tags &&
          origData[i].classification_tags.includes("Manual reclassify with Rica"))
        || (origData[i].rationale == "I001")
      ) {
        rejected.push(i);
      }
    }

    // Save accepted and rejected arrays to their respective txt files
    var acceptedCsv = accepted.join(",");
    var hiddenElementAccepted = document.createElement("a");
    hiddenElementAccepted.href =
      "data:text/txt;charset=utf-8," + encodeURI(acceptedCsv);
    hiddenElementAccepted.download = "accepted.txt";
    hiddenElementAccepted.click();
    hiddenElementAccepted.remove();

    var rejectedCsv = rejected.join(",");
    var hiddenElementRejected = document.createElement("a");
    hiddenElementRejected.href =
      "data:text/txt;charset=utf-8," + encodeURI(rejectedCsv);
    hiddenElementRejected.download = "rejected.txt";
    hiddenElementRejected.click();
    hiddenElementRejected.remove();

    // Merge into a tsv file and make it downloadable
    var tsv = [headings, rows].join("\n");
    var hiddenElementTable = document.createElement("a");
    hiddenElementTable.href = "data:text/tsv;charset=utf-8," + encodeURI(tsv);
    hiddenElementTable.download = "manual_classification.tsv";
    hiddenElementTable.click();
    hiddenElementTable.remove();
  }

  updatePiePlot(index) {
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
    // If length of compName is 2, then add a 0 to the beginning
    if (compName.length === 2) {
      compName = "0" + compName;
    }
    compName = `comp_${compName}.png`;

    // iterate over each element in the array to retrieve image of selected component based on name
    for (var i = 0; i < this.props.componentFigures.length; i++) {
      // look for the entry with a matching `compName` value
      if (this.props.componentFigures[i].name === compName) {
        this.setState({ clickedElement: this.props.componentFigures[i].img });
      }
    }
  }

  updateScatterPlots(index) {
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
    // If length of compName is 2, then add a 0 to the beginning
    if (compName.length === 2) {
      compName = "0" + compName;
    }
    compName = `comp_${compName}.png`;

    // iterate over each element in the array to retrieve image of selected component based on name
    for (var i = 0; i < this.props.componentFigures.length; i++) {
      // look for the entry with a matching `compName` value
      if (this.props.componentFigures[i].name === compName) {
        this.setState({ clickedElement: this.props.componentFigures[i].img });
      }
    }
  }

  render() {
    // Handle onClick events on the Pie chart
    const getPieElementAtEvent = (element) => {
      if (!element.length) return;

      this.setState({ selectedScatter: false });
      this.setState({ selectedPie: true });

      const { datasetIndex, index } = element[0];

      this.setState({ selectedIndex: index });

      this.updatePiePlot(index);
    };

    // Handle onClick events on the Scatter charts
    const getScatterElementAtEvent = (element) => {
      if (!element.length) return;

      this.setState({ selectedScatter: true });
      this.setState({ selectedPie: false });

      const { datasetIndex, index } = element[0];

      this.setState({ selectedIndex: index });

      this.updateScatterPlots(index);
    };

    return (
      <HotKeys keyMap={keyMap} handlers={this.handlers}>
        <center>
          <div className="inline-block mt-10">
            <ToggleSwitch
              values={["accepted", "rejected", "ignored"]}
              selected={this.state.selectedClassification}
              colors={[acceptedColor, rejedtecColor, ignoredColor]}
              handleNewSelection={this.handleNewSelection.bind(this)}
            />
          </div>
          <ResetAndSave
            handleReset={this.readOriginalData.bind(this)}
            handleSave={this.saveManualClassification.bind(this)}
          />
          <div className="table w-full h-auto bg-white">
            <div className="flex items-center justify-center mt-6 ml-4 text-base text-gray-500 ">
              <p>
                Select an area or use the wheel to zoom in. Shift + click and
                drag to pan.
              </p>
            </div>
            <div className="grid float-left w-1/2 h-auto grid-cols-2 ml-16 bg-white gap-x-1 gap-y-1 plot-container-in">
              <div className="relative flex items-center justify-center w-full h-full px-1 py-4 text-lg bg-white ">
                <Line
                  className="pt-2"
                  data={this.state.kappaRho}
                  height={21}
                  width={20}
                  options={options_kappa_rho}
                  getElementAtEvent={getScatterElementAtEvent}
                />
              </div>
              <div className="relative flex items-center justify-center w-full h-full px-1 py-4 text-lg bg-white">
                <Pie
                  data={this.state.variance}
                  height={20}
                  width={20}
                  options={optionsPie}
                  getElementAtEvent={getPieElementAtEvent}
                />
              </div>
              <div className="relative flex items-center justify-center w-full h-full px-1 py-4 text-lg bg-white">
                <Line
                  data={this.state.rho}
                  height={21}
                  width={20}
                  options={options_rho}
                  getElementAtEvent={getScatterElementAtEvent}
                />
              </div>
              <div className="relative flex items-center justify-center w-full h-full px-1 py-4 text-lg bg-white">
                <Line
                  data={this.state.kappa}
                  height={21}
                  width={20}
                  options={options_kappa}
                  getElementAtEvent={getScatterElementAtEvent}
                />
              </div>
            </div>
            <div className="flex float-right w-5/12 mt-12 mr-16 z-5">
              <img
                className="w-full max-w-full"
                alt=""
                src={this.state.clickedElement}
              />
            </div>
          </div>
        </center>
      </HotKeys>
    );
  }
}

export default Plots;
