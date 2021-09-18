import React from "react";
import { Line, Pie } from "react-chartjs-2";
import * as Zoom from "chartjs-plugin-zoom";
import ChartDataLabels from "chartjs-plugin-datalabels";

const acceptedColor = "#62bc6c";
const rejedtecColor = "#f2563c";
const ignoredColor = "#4e85f5";

function parseData(data) {
  let kappa_rho = {
    labels: data.map((e) => e.Component),
    datasets: [
      {
        type: "scatter",
        borderColor: "black",
        pointBackgroundColor: data.map((e) => e.color),
        pointBorderColor: data.map((e) => e.color),
        pointRadius: 5,
        borderWidth: 1,
        fill: false,
        data: data.map((e) => ({ x: e.rho, y: e.kappa })),
      },
    ],
  };

  let rho = {
    labels: data.map((e) => e.Component),
    datasets: [
      {
        type: "scatter",
        borderColor: "black",
        pointBackgroundColor: data.map((e) => e.color),
        pointBorderColor: data.map((e) => e.color),
        pointRadius: 5,
        borderWidth: 1,
        fill: false,
        data: data.map((e) => ({ x: e["rho rank"], y: e.rho })),
      },
    ],
  };

  let kappa = {
    labels: data.map((e) => e.Component),
    datasets: [
      {
        type: "scatter",
        borderColor: "black",
        pointBackgroundColor: data.map((e) => e.color),
        pointBorderColor: data.map((e) => e.color),
        pointRadius: 5,
        borderWidth: 1,
        fill: false,
        data: data.map((e) => ({ x: e["kappa rank"], y: e.kappa })),
      },
    ],
  };

  let variance = {
    labels: data.map((e) => e.Component),
    datasets: [
      {
        label: data.map((e) => e.classification),
        borderColor: "black",
        backgroundColor: data.map((e) => e.color),
        borderWidth: 0.5,
        data: data.map((e) => e["variance explained"]),
      },
    ],
  };

  return [kappa_rho, variance, kappa, rho];
}

const options_kappa_rho = {
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Kappa / Rho Plot",
      font: {
        size: 20,
        weight: "bold",
      },
    },
    pan: {
      enabled: true,
      mode: "xy",
      speed: 1,
      threshold: 1,
    },
    zoom: {
      enabled: true,
      drag: false,
      mode: "xy",
      limits: {
        max: 1,
        min: 0.5,
      },
    },
    tooltips: {
      callbacks: {
        title: function (tooltipItem, data) {
          console.log(tooltipItem);
          console.log(data);
          // return data[tooltipItem[0]["dataIndex"]];
        },
      },
    },
  },
};

const options_rho = {
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Rho Rank",
      font: {
        size: 20,
        weight: "bold",
      },
    },
    zoom: {
      zoom: {
        wheel: {
          enabled: true,
        },
        pinch: {
          enabled: true,
        },
        mode: "xy",
      },
    },
  },
};

const options_kappa = {
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Kappa Rank",
      font: {
        size: 20,
        weight: "bold",
      },
    },
    zoom: {
      zoom: {
        wheel: {
          enabled: true,
        },
        pinch: {
          enabled: true,
        },
        mode: "xy",
      },
    },
  },
};

const optionsPie = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    tooltips: {
      callbacks: {
        title: function (tooltipItem) {
          console.log(tooltipItem);
          return tooltipItem.value + "%";
          // return data.labels[tooltipItem[0]["dataIndex"]];
        },
        label: function (tooltipItem, data) {
          return data["datasets"][0]["data"][tooltipItem["dataIndex"]] + "%";
        },
        // afterLabel: function (tooltipItem, data) {
        //   var dataset = data["datasets"][0];
        //   var percent = Math.round(
        //     (dataset["data"][tooltipItem["index"]] /
        //       dataset["_meta"][0]["total"]) *
        //       100
        //   );
        //   return "(" + percent + "%)";
        // },
      },
      backgroundColor: "#FFF",
      titleFontSize: 16,
      titleFontColor: "#0066ff",
      bodyFontColor: "#000",
      bodyFontSize: 14,
      displayColors: false,
    },
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Variance Explained View",
      font: {
        size: 20,
        weight: "bold",
      },
    },
  },
};

function assignColor(data) {
  for (var i = 0; i < data.length; i++) {
    if (data[i].classification === "accepted") {
      data[i].color = acceptedColor;
    } else if (data[i].classification === "rejected") {
      data[i].color = rejedtecColor;
    } else if (data[i].classification === "ignored") {
      data[i].color = ignoredColor;
    }
  }
}

class Plots extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clickedElement: "",
    };
  }

  render() {
    // const getDatasetAtEvent = (dataset) => {
    //   if (!dataset.length) return;

    //   const datasetIndex = dataset[0].datasetIndex;
    //   // setClickedDataset(data.datasets[datasetIndex].label);
    // };

    // Component data
    const compData = this.props.componentData[0];
    assignColor(compData);
    let parsed_data = parseData(compData);
    let kappa_rho = parsed_data[0];
    let variance = parsed_data[1];
    let kappa = parsed_data[2];
    let rho = parsed_data[3];

    // Component figures

    const getElementAtEvent = (element) => {
      if (!element.length) return;

      const { datasetIndex, index } = element[0];
      // let componentClassification = variance.datasets[datasetIndex].label[index];

      // Get component name of selected component
      var compName = variance.labels[index].match(/\d/g);
      compName = compName.join("");
      compName = `comp_0${compName}.png`;

      // iterate over each element in the array to retrieve image of selected component based on name
      for (var i = 0; i < this.props.componentFigures.length; i++) {
        // look for the entry with a matching `compName` value
        if (this.props.componentFigures[i].name == compName) {
          this.setState({ clickedElement: this.props.componentFigures[i].img });
        }
      }
    };

    // const getElementsAtEvent = (elements) => {
    //   if (!elements.length) return;

    //   // setClickedElements(elements.length);
    // };

    return (
      <center>
        <div className="plot-container-out">
          <div className="plot-container-in">
            <div className="plot-box">
              <Line
                data={kappa_rho}
                height={400}
                width={400}
                options={options_kappa_rho}
                // getDatasetAtEvent={getDatasetAtEvent}
                getElementAtEvent={getElementAtEvent}
                // getElementsAtEvent={getElementsAtEvent}
              />
            </div>
            <div className="plot-box">
              <Pie
                data={variance}
                height={20}
                width={20}
                options={optionsPie}
                // getDatasetAtEvent={getDatasetAtEvent}
                getElementAtEvent={getElementAtEvent}
                // getElementsAtEvent={getElementsAtEvent}
              />
            </div>
            <div className="plot-box">
              <Line
                data={rho}
                height={400}
                width={400}
                options={options_rho}
                // getDatasetAtEvent={getDatasetAtEvent}
                getElementAtEvent={getElementAtEvent}
                // getElementsAtEvent={getElementsAtEvent}
              />
            </div>
            <div className="plot-box">
              <Line
                data={kappa}
                height={400}
                width={400}
                options={options_kappa}
                // getDatasetAtEvent={getDatasetAtEvent}
                getElementAtEvent={getElementAtEvent}
                // getElementsAtEvent={getElementsAtEvent}
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
