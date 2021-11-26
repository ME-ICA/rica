export const options_kappa_rho = {
  scales: {
    yAxes: {
      title: {
        display: true,
        text: "Rho",
        font: {
          size: 13,
        },
      },
      ticks: {
        stepSize: 0.5,
        precision: 0.1,
      },
    },
    xAxes: {
      type: "linear",
      title: {
        display: true,
        text: "Kappa",
        font: {
          size: 13,
        },
      },
      ticks: {
        stepSize: 0.5,
        precision: 0.1,
        maxRotation: 0,
      },
    },
  },
  animation: {
    duration: 0,
  },
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Rho / Kappa",
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
      pan: {
        enabled: true,
        mode: "xy",
        modifierKey: "shift",
      },
    },
  },
};

export const options_rho = {
  scales: {
    yAxes: {
      title: {
        display: true,
        text: "Rho",
        font: {
          size: 13,
        },
      },
    },
    xAxes: {
      type: "linear",
      title: {
        display: true,
        text: "Rank",
        font: {
          size: 13,
        },
      },
      ticks: {
        stepSize: 5,
        maxRotation: 0,
      },
    },
  },
  animation: {
    duration: 0,
  },
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Rho / Rank",
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
      pan: {
        enabled: true,
        mode: "xy",
        modifierKey: "shift",
      },
    },
  },
};

export const options_kappa = {
  scales: {
    yAxes: {
      title: {
        display: true,
        text: "Kappa",
        font: {
          size: 13,
        },
      },
    },
    xAxes: {
      type: "linear",
      title: {
        display: true,
        text: "Rank",
        font: {
          size: 13,
        },
      },
      ticks: {
        stepSize: 5,
        maxRotation: 0,
      },
    },
  },
  animation: {
    duration: 0,
  },
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Kappa / Rank",
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
      pan: {
        enabled: true,
        mode: "xy",
        modifierKey: "shift",
      },
    },
  },
};

export const optionsPie = {
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
