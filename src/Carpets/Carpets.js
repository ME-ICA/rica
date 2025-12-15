import React, { useState, useCallback } from "react";

function Carpets({ images }) {
  const [carpetPlot, setCarpetPlot] = useState(images?.[0]?.img || "");

  const handleChange = useCallback((e) => {
    setCarpetPlot(e.target.value);
  }, []);

  if (!images?.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No carpet plots available</p>
      </div>
    );
  }

  return (
    <center>
      <select
        className="dd-menu text-gray-700 text-base p-2.5 rounded-md border border-gray-300 mt-4 ml-4 focus:ring-sky-500 focus:border-sky-500"
        onChange={handleChange}
        value={carpetPlot}
      >
        {images.map((carpet) => (
          <option key={carpet.name} value={carpet.img}>
            {carpet.name}
          </option>
        ))}
      </select>
      <div className="carpet-plots-image mt-4">
        <img
          id="imgCarpetPlot"
          alt="Carpet plot"
          src={carpetPlot}
          className="max-w-full transition-opacity duration-300"
        />
      </div>
    </center>
  );
}

export default Carpets;
