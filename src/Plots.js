import React from "react";
import { Line, Pie, Chart } from "react-chartjs-2";
import zoomPlugin from "chartjs-plugin-zoom";

Chart.register(zoomPlugin); // REGISTER PLUGIN

const acceptedColor = "#A8E3A5";
const acceptedColorHover = "#68AC64";
const rejedtecColor = "#E99497";
const rejedtecColorHover = "#B35458";
const ignoredColor = "#B5DEFF";
const ignoredColorHover = "#689FCC";

function parseData(data) {
  let kappa_rho = {
    labels: data.map((e) => e.Component),
    datasets: [
      {
        type: "scatter",
        borderColor: "black",
        pointBackgroundColor: data.map((e) => e.color),
        pointHoverBackgroundColor: data.map((e) => e.colorHover),
        pointBorderColor: data.map((e) => e.color),
        pointRadius: 5,
        borderWidth: 1,
        fill: false,
        data: data.map((e) => ({ x: e.rho, y: e.kappa, label: e.Component })),
        classification: data.map((e) => e.classification),
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
        pointHoverBackgroundColor: data.map((e) => e.colorHover),
        pointBorderColor: data.map((e) => e.color),
        pointRadius: 5,
        borderWidth: 1,
        fill: false,
        data: data.map((e) => ({
          x: e["rho rank"],
          y: e.rho,
          label: e.Component,
        })),
        classification: data.map((e) => e.classification),
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
        pointHoverBackgroundColor: data.map((e) => e.colorHover),
        pointBorderColor: data.map((e) => e.color),
        pointRadius: 5,
        borderWidth: 1,
        fill: false,
        data: data.map((e) => ({
          x: e["kappa rank"],
          y: e.kappa,
          label: e.Component,
        })),
        classification: data.map((e) => e.classification),
      },
    ],
  };

  data.sort(function (a, b) {
    return (
      a.classification.localeCompare(b.classification) ||
      b["variance explained"] - a["variance explained"]
    );
  });

  let variance = {
    labels: data.map((e) => e.Component),
    datasets: [
      {
        label: data.map((e) => e.classification),
        borderColor: "black",
        backgroundColor: data.map((e) => e.color),
        hoverBackgroundColor: data.map((e) => e.colorHover),
        borderWidth: 0.5,
        data: data.map((e) => e["variance explained"]),
        classification: data.map((e) => e.classification),
      },
    ],
  };

  return [kappa_rho, variance, kappa, rho];
}

const options_kappa_rho = {
  animation: {
    duration: 0,
  },
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
    tooltip: {
      callbacks: {
        title: function (tooltipItem) {
          return tooltipItem[0].raw.label;
        },
        label: function (tooltipItem) {
          return (
            Math.round((tooltipItem.parsed.y + Number.EPSILON) * 100) / 100
          );
        },
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
        drag: {
          enabled: true,
        },
        mode: "xy",
      },
      limits: {
        x: { min: "original", max: "original" },
        y: { min: "original", max: "original" },
      },
    },
  },
};

const options_rho = {
  animation: {
    duration: 0,
  },
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
    tooltip: {
      callbacks: {
        title: function (tooltipItem) {
          return tooltipItem[0].raw.label;
        },
        label: function (tooltipItem) {
          return (
            Math.round((tooltipItem.parsed.y + Number.EPSILON) * 100) / 100
          );
        },
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
        drag: {
          enabled: true,
        },
        mode: "xy",
      },
      limits: {
        x: { min: "original", max: "original" },
        y: { min: "original", max: "original" },
      },
    },
  },
};

const options_kappa = {
  animation: {
    duration: 0,
  },
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
    tooltip: {
      callbacks: {
        title: function (tooltipItem) {
          return tooltipItem[0].raw.label;
        },
        label: function (tooltipItem) {
          return (
            Math.round((tooltipItem.parsed.y + Number.EPSILON) * 100) / 100
          );
        },
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
        drag: {
          enabled: true,
        },
        mode: "xy",
      },
      limits: {
        x: { min: "original", max: "original" },
        y: { min: "original", max: "original" },
      },
    },
  },
};

const optionsPie = {
  animation: {
    duration: 0,
  },
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    tooltip: {
      callbacks: {
        title: function (tooltipItem) {
          return tooltipItem[0].label;
        },
        label: function (tooltipItem) {
          return (
            Math.round((tooltipItem.parsed + Number.EPSILON) * 100) / 100 + "%"
          );
        },
      },
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
      data[i].colorHover = acceptedColorHover;
    } else if (data[i].classification === "rejected") {
      data[i].color = rejedtecColor;
      data[i].colorHover = rejedtecColorHover;
    } else if (data[i].classification === "ignored") {
      data[i].color = ignoredColor;
      data[i].colorHover = ignoredColorHover;
    }
  }
}

function resetColors(data, isPie) {
  for (var i = 0; i < data.labels.length; i++) {
    if (data.datasets[0].classification[i] === "accepted") {
      if (isPie) {
        data.datasets[0].backgroundColor[i] = acceptedColor;
      } else {
        data.datasets[0].pointBackgroundColor[i] = acceptedColor;
      }
    } else if (data.datasets[0].classification[i] === "rejected") {
      if (isPie) {
        data.datasets[0].backgroundColor[i] = rejedtecColor;
      } else {
        data.datasets[0].pointBackgroundColor[i] = rejedtecColor;
      }
    } else if (data.datasets[0].classification[i] === "ignored") {
      if (isPie) {
        data.datasets[0].backgroundColor[i] = ignoredColor;
      } else {
        data.datasets[0].pointBackgroundColor[i] = ignoredColor;
      }
    }
  }
}
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
    };
  }

  componentDidMount() {
    var compData = this.props.componentData[0];
    assignColor(compData);
    var parsed_data = parseData(compData);
    this.setState({ kappaRho: parsed_data[0] });
    this.setState({ variance: parsed_data[1] });
    this.setState({ kappa: parsed_data[2] });
    this.setState({ rho: parsed_data[3] });
  }

  render() {
    const getPieElementAtEvent = (element) => {
      if (!element.length) return;

      const { datasetIndex, index } = element[0];

      // Set hover color as background to show selection
      var variance = { ...this.state.variance };
      resetColors(variance, true);
      variance.datasets[0].backgroundColor[index] =
        variance.datasets[0].hoverBackgroundColor[index];
      this.setState({ variance: variance });
      var selectedLabel = variance.labels[index];
      this.setState({ selectedLabel: selectedLabel });

      var kappaRho = { ...this.state.kappaRho };
      var scatterIndex = kappaRho.labels.indexOf(selectedLabel);
      resetColors(kappaRho, false);
      kappaRho.datasets[0].pointBackgroundColor[scatterIndex] =
        kappaRho.datasets[0].pointHoverBackgroundColor[scatterIndex];
      this.setState({ kappaRho: kappaRho });

      var kappa = { ...this.state.kappa };
      resetColors(kappa, false);
      kappa.datasets[0].pointBackgroundColor[scatterIndex] =
        kappa.datasets[0].pointHoverBackgroundColor[scatterIndex];
      this.setState({ kappa: kappa });

      var rho = { ...this.state.rho };
      resetColors(rho, false);
      rho.datasets[0].pointBackgroundColor[scatterIndex] =
        rho.datasets[0].pointHoverBackgroundColor[scatterIndex];
      this.setState({ rho: rho });

      // Get component name of selected component
      var compName = this.state.variance.labels[index].match(/\d/g);
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

    const getScatterElementAtEvent = (element) => {
      if (!element.length) return;

      const { datasetIndex, index } = element[0];

      // Set hover color as background to show selection
      var kappaRho = { ...this.state.kappaRho };
      resetColors(kappaRho, false);
      kappaRho.datasets[0].pointBackgroundColor[index] =
        kappaRho.datasets[0].pointHoverBackgroundColor[index];
      this.setState({ kappaRho: kappaRho });
      var selectedLabel = kappaRho.labels[index];
      this.setState({ selectedLabel: selectedLabel });

      var kappa = { ...this.state.kappa };
      resetColors(kappa, false);
      kappa.datasets[0].pointBackgroundColor[index] =
        kappa.datasets[0].pointHoverBackgroundColor[index];
      this.setState({ kappa: kappa });

      var rho = { ...this.state.rho };
      resetColors(rho, false);
      rho.datasets[0].pointBackgroundColor[index] =
        rho.datasets[0].pointHoverBackgroundColor[index];
      this.setState({ rho: rho });

      var variance = { ...this.state.variance };
      var pieIndex = variance.labels.indexOf(selectedLabel);
      resetColors(variance, true);
      variance.datasets[0].backgroundColor[pieIndex] =
        variance.datasets[0].hoverBackgroundColor[pieIndex];
      this.setState({ variance: variance });

      // Get component name of selected component
      var compName = this.state.variance.labels[index].match(/\d/g);
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
    //   console.log(elements);
    // };

    // const getDatasetAtEvent = (elements) => {
    //   console.log(elements);
    // };

    return (
      <center>
        <div className="plot-container-out">
          <div className="plot-container-in">
            <div className="plot-box">
              <Line
                data={this.state.kappaRho}
                height={400}
                width={400}
                options={options_kappa_rho}
                // getDatasetAtEvent={getDatasetAtEvent}
                getElementAtEvent={getScatterElementAtEvent}
                // getElementsAtEvent={getElementsAtEvent}
              />
            </div>
            <div className="plot-box">
              <Pie
                data={this.state.variance}
                height={20}
                width={20}
                options={optionsPie}
                // getDatasetAtEvent={getDatasetAtEvent}
                getElementAtEvent={getPieElementAtEvent}
                // getElementsAtEvent={getElementsAtEvent}
              />
            </div>
            <div className="plot-box">
              <Line
                data={this.state.rho}
                height={400}
                width={400}
                options={options_rho}
                // getDatasetAtEvent={getDatasetAtEvent}
                getElementAtEvent={getScatterElementAtEvent}
                // getElementsAtEvent={getElementsAtEvent}
              />
            </div>
            <div className="plot-box">
              <Line
                data={this.state.kappa}
                height={400}
                width={400}
                options={options_kappa}
                // getDatasetAtEvent={getDatasetAtEvent}
                getElementAtEvent={getScatterElementAtEvent}
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
