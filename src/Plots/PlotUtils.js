const acceptedColor = "#A8E3A5";
const acceptedColorHover = "#68AC64";
const rejedtecColor = "#E99497";
const rejedtecColorHover = "#B35458";
const ignoredColor = "#B5DEFF";
const ignoredColorHover = "#689FCC";

// This functions converts the data into 4 objects corresponding to the 4 plots.
// The objects have the necessary structure to feed the chartjs plots.
export function parseData(data) {
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

// This function assigns a color to all components in the data based on the classification
export function assignColor(data) {
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

// This function resets the color of a selected component (hover) into that of a non-selected component
export function resetColors(data, isPie) {
  for (var i = 0; i < data.labels.length; i++) {
    if (data.datasets[0].classification[i] === "accepted") {
      if (isPie) {
        data.datasets[0].backgroundColor[i] = acceptedColor;
      } else {
        data.datasets[0].pointBackgroundColor[i] = acceptedColor;
        data.datasets[0].pointBorderColor[i] = acceptedColor;
      }
    } else if (data.datasets[0].classification[i] === "rejected") {
      if (isPie) {
        data.datasets[0].backgroundColor[i] = rejedtecColor;
      } else {
        data.datasets[0].pointBackgroundColor[i] = rejedtecColor;
        data.datasets[0].pointBorderColor[i] = rejedtecColor;
      }
    } else if (data.datasets[0].classification[i] === "ignored") {
      if (isPie) {
        data.datasets[0].backgroundColor[i] = ignoredColor;
      } else {
        data.datasets[0].pointBackgroundColor[i] = ignoredColor;
        data.datasets[0].pointBorderColor[i] = ignoredColor;
      }
    }
  }
}

// This function updates the colors on the Pie chart when a component is selected and/or manually classified
export function updatePieColors(data, index, color, isNew) {
  data.datasets[0].backgroundColor[index] = color;
  if (isNew) {
    data.datasets[0].hoverBackgroundColor[index] = color;
  }
}

// This function updates the colors on the given Scatter chart when a component is selected and/or manually classified
export function updateScatterColors(data, index, color, isNew) {
  data.datasets[0].pointBackgroundColor[index] = color;
  data.datasets[0].pointBorderColor[index] = color;
  if (isNew) {
    data.datasets[0].pointHoverBackgroundColor[index] = color;
  }
}

// This function resets the colors of the given chart back to a non-selected state, and applies the new selection color
export function resetAndUpdateColors(data, index, isVariance) {
  if (isVariance) {
    resetColors(data, isVariance);
    updatePieColors(
      data,
      index,
      data.datasets[0].hoverBackgroundColor[index],
      false
    );
  } else {
    resetColors(data, isVariance);
    updateScatterColors(
      data,
      index,
      data.datasets[0].pointHoverBackgroundColor[index],
      false
    );
  }
}
