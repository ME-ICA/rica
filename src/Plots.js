import React, { useState } from "react";
import { Line, Pie } from "react-chartjs-2";

const rand = () => Math.floor(Math.random() * 255);

const genData = () => ({
  labels: ["January", "February", "March", "April", "May", "June"],
  datasets: [
    {
      type: "line",
      label: "Dataset 1",
      borderColor: `rgb(${rand()}, ${rand()}, ${rand()})`,
      borderWidth: 2,
      fill: false,
      data: [rand(), rand(), rand(), rand(), rand(), rand()],
    },
    {
      type: "scatter",
      label: "Dataset 2",
      backgroundColor: `rgb(${rand()}, ${rand()}, ${rand()})`,
      data: [rand(), rand(), rand(), rand(), rand(), rand()],
      borderColor: "red",
      borderWidth: 5,
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
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [
    {
      label: "Dataset 1",
      borderColor: `rgb(${rand()}, ${rand()}, ${rand()})`,
      borderWidth: 2,
      data: [rand(), rand(), rand(), rand(), rand(), rand()],
    },
  ],
});

const options = {
  plugins: {
    legend: {
      display: false,
    },
  },
  // scales: {
  //   yAxes: [
  //     {
  //       ticks: {
  //         beginAtZero: true,
  //       },
  //     },
  //   ],
  // },
};

const optionsPie = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      display: false,
    },
  },
};

const data = genData();

const data2 = genData2();

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
