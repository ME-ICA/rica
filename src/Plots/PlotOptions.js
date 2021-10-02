export const options_kappa_rho = {
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

export const options_rho = {
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

export const options_kappa = {
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
