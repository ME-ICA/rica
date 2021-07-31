import React, { useState } from "react";
import { Line, Pie } from "react-chartjs-2";

const acceptedColor = "#62bc6c";
const rejedtecColor = "#f2563c";
const ignoredColor = "#4e85f5";

let kappa_rho = {
  labels: [
    "Component ID 1",
    "Component ID 2",
    "Component ID 3",
    "Component ID 4",
    "Component ID 5",
    "Component ID 6",
  ],
  datasets: [
    {
      type: "scatter",
      borderColor: "black",
      pointBackgroundColor: [
        acceptedColor,
        rejedtecColor,
        acceptedColor,
        ignoredColor,
        rejedtecColor,
        acceptedColor,
      ],
      pointBorderColor: [
        acceptedColor,
        rejedtecColor,
        acceptedColor,
        ignoredColor,
        rejedtecColor,
        acceptedColor,
      ],
      pointRadius: 10,
      borderWidth: 1,
      fill: false,
      data: [
        { x: 2.5, y: 3 },
        { x: 4, y: 3.5 },
        { x: 3, y: 3 },
        { x: 4.5, y: 3.7 },
        { x: 5, y: 4.2 },
        { x: 5.7, y: 5.2 },
      ],
    },
  ],
};

let rho = {
  labels: [
    "Component ID 1",
    "Component ID 2",
    "Component ID 3",
    "Component ID 4",
    "Component ID 5",
    "Component ID 6",
  ],
  datasets: [
    {
      type: "line",
      borderColor: "black",
      pointBackgroundColor: [
        acceptedColor,
        rejedtecColor,
        acceptedColor,
        ignoredColor,
        rejedtecColor,
        acceptedColor,
      ],
      pointBorderColor: [
        acceptedColor,
        rejedtecColor,
        acceptedColor,
        ignoredColor,
        rejedtecColor,
        acceptedColor,
      ],
      pointRadius: 10,
      borderWidth: 1,
      fill: false,
      data: [
        { x: 2.5, y: 3 },
        { x: 4, y: 3.5 },
        { x: 3, y: 3 },
        { x: 4.5, y: 3.7 },
        { x: 5, y: 4.2 },
        { x: 5.7, y: 5.2 },
      ],
    },
  ],
};

let kappa = {
  labels: [
    "Component ID 1",
    "Component ID 2",
    "Component ID 3",
    "Component ID 4",
    "Component ID 5",
    "Component ID 6",
  ],
  datasets: [
    {
      type: "line",
      borderColor: "black",
      pointBackgroundColor: [
        acceptedColor,
        rejedtecColor,
        acceptedColor,
        ignoredColor,
        rejedtecColor,
        acceptedColor,
      ],
      pointBorderColor: [
        acceptedColor,
        rejedtecColor,
        acceptedColor,
        ignoredColor,
        rejedtecColor,
        acceptedColor,
      ],
      pointRadius: 10,
      borderWidth: 1,
      fill: false,
      data: [
        { x: 2.5, y: 3 },
        { x: 4, y: 3.5 },
        { x: 3, y: 3 },
        { x: 4.5, y: 3.7 },
        { x: 5, y: 4.2 },
        { x: 5.7, y: 5.2 },
      ],
    },
  ],
};

let variance = {
  labels: [
    "Component ID 1",
    "Component ID 2",
    "Component ID 3",
    "Component ID 4",
    "Component ID 5",
    "Component ID 6",
  ],
  datasets: [
    {
      label: [
        "accepted",
        "rejected",
        "accepted",
        "ignored",
        "rejected",
        "accepted",
      ],
      borderColor: "black",
      backgroundColor: [
        acceptedColor,
        rejedtecColor,
        acceptedColor,
        ignoredColor,
        rejedtecColor,
        acceptedColor,
      ],
      borderWidth: 2,
      data: [20, 10, 10, 5, 45, 10],
    },
  ],
};

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
  },
};

const optionsPie = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    tooltips: {
      callbacks: {
        title: function (tooltipItem, data) {
          return data["labels"][tooltipItem[0]["index"]];
        },
        label: function (tooltipItem, data) {
          return data["datasets"][0]["data"][tooltipItem["index"]];
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

const Plots = () => {
  // const [clickedDataset, setClickedDataset] = useState("");
  const [clickedElement, setClickedElement] = useState("");
  // const [clickedElements, setClickedElements] = useState("");

  // const getDatasetAtEvent = (dataset) => {
  //   if (!dataset.length) return;

  //   console.log(dataset);
  //   const datasetIndex = dataset[0].datasetIndex;
  //   // setClickedDataset(data.datasets[datasetIndex].label);
  // };

  const getElementAtEvent = (element) => {
    if (!element.length) return;

    const { datasetIndex, index } = element[0];
    let componentStatus = variance.datasets[datasetIndex].label[index];

    setClickedElement(`${variance.labels[index]} - ${componentStatus}`);
  };

  // const getElementsAtEvent = (elements) => {
  //   if (!elements.length) return;

  //   // setClickedElements(elements.length);
  // };

  return (
    <center>
      <div className="plot-container">
        <div className="plot-box">
          <Line
            data={kappa_rho}
            height={200}
            width={300}
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
            height={200}
            width={300}
            options={options_rho}
            // getDatasetAtEvent={getDatasetAtEvent}
            getElementAtEvent={getElementAtEvent}
            // getElementsAtEvent={getElementsAtEvent}
          />
        </div>
        <div className="plot-box">
          <Line
            data={kappa}
            height={200}
            width={300}
            options={options_kappa}
            // getDatasetAtEvent={getDatasetAtEvent}
            getElementAtEvent={getElementAtEvent}
            // getElementsAtEvent={getElementsAtEvent}
          />
        </div>
      </div>
      <div className="text-center">
        <p>{clickedElement}</p>
        {/* <p>{clickedDataset}</p> */}
        {/* <p>{clickedElements}</p> */}
      </div>
    </center>
  );
};

export default Plots;
