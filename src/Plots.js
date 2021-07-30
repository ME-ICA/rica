import React, { useState } from "react";
import { Line, Pie } from "react-chartjs-2";

const rand = () => Math.floor(Math.random() * 255);

const green = "#62bc6c";
const red = "#f2563c";
const blue = "#4e85f5";

const genData = () => ({
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
      pointBackgroundColor: [green, red, green, blue, red, green],
      pointBorderColor: [green, red, green, blue, red, green],
      pointRadius: 10,
      borderWidth: 1,
      fill: false,
      data: [
        { x: rand(), y: rand() },
        { x: rand(), y: rand() },
        { x: rand(), y: rand() },
        { x: rand(), y: rand() },
        { x: rand(), y: rand() },
        { x: rand(), y: rand() },
      ],
    },
    // {
    //   type: "bar",
    //   label: "Dataset 3",
    //   backgroundColor: `rgb(${rand()}, ${rand()}, ${rand()})`,
    //   data: [rand(), rand(), rand(), rand(), rand(), rand(), rand()],
    // },
  ],
});

const genData2 = () => ({
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
      borderColor: "black",
      backgroundColor: [green, red, green, blue, red, green],
      borderWidth: 2,
      data: [20, 10, 10, 5, 45, 10],
    },
  ],
});

const options = {
  plugins: {
    tooltip: {
      bodyFontSize: 16,
    },
    legend: {
      display: false,
    },
  },
};

const optionsPie = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    tooltip: {
      bodyFontSize: 36,
    },
    legend: {
      display: false,
    },
  },
};

let data = genData();

let data2 = genData2();

const Plots = () => {
  const [clickedDataset, setClickedDataset] = useState("");
  const [clickedElement, setClickedElement] = useState("");
  const [clickedElements, setClickedElements] = useState("");

  const getDatasetAtEvent = (dataset) => {
    if (!dataset.length) return;

    const datasetIndex = dataset[0].datasetIndex;
    setClickedDataset(data.datasets[datasetIndex].label);
  };

  const getElementAtEvent = (element) => {
    if (!element.length) return;

    const { datasetIndex, index } = element[0];
    setClickedElement(
      `${data.labels[index]} - ${data.datasets[datasetIndex].data[index]}`
    );
  };

  const getElementsAtEvent = (elements) => {
    if (!elements.length) return;

    setClickedElements(elements.length);
  };

  return (
    <center>
      <div className="plot-container">
        <div className="plot-box">
          <Line
            data={data}
            height={200}
            width={300}
            options={options}
            getDatasetAtEvent={getDatasetAtEvent}
            getElementAtEvent={getElementAtEvent}
            getElementsAtEvent={getElementsAtEvent}
          />
        </div>
        <div className="plot-box">
          <Pie
            data={data2}
            height={20}
            width={30}
            options={optionsPie}
            getDatasetAtEvent={getDatasetAtEvent}
            getElementAtEvent={getElementAtEvent}
            getElementsAtEvent={getElementsAtEvent}
          />
        </div>
        <div className="plot-box">
          <Line
            data={data}
            height={200}
            width={300}
            options={options}
            getDatasetAtEvent={getDatasetAtEvent}
            getElementAtEvent={getElementAtEvent}
            getElementsAtEvent={getElementsAtEvent}
          />
        </div>
        <div className="plot-box">
          <Line
            data={data}
            height={200}
            width={300}
            options={options}
            getDatasetAtEvent={getDatasetAtEvent}
            getElementAtEvent={getElementAtEvent}
            getElementsAtEvent={getElementsAtEvent}
          />
        </div>
      </div>
      <div className="text-center">
        <p>{clickedElement}</p>
        <p>{clickedDataset}</p>
        <p>{clickedElements}</p>
      </div>
    </center>
  );
};

export default Plots;
