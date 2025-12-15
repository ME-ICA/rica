import React, { useCallback } from "react";

const titleCase = (str) =>
  str
    .split(/\s+/)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");

function ToggleSwitch({ values, selected, colors, handleNewSelection }) {
  const selectionStyle = useCallback(() => {
    const index = values.indexOf(selected);
    return {
      left: `${index * 90}px`,
      background: colors[index],
    };
  }, [values, selected, colors]);

  return (
    <div className="relative h-8 font-semibold bg-gray-200 rounded-md flex">
      {values.map((val) => (
        <span key={val}>
          <input
            className="hidden"
            type="radio"
            name="switch"
            checked={selected === val}
            readOnly
          />
          <label
            onClick={() => handleNewSelection(val)}
            className="relative z-10 h-8 flex items-center justify-center transition-colors duration-200"
            style={{ width: 90, color: selected === val ? "#1f2937" : "rgba(0,0,0,0.6)", cursor: "pointer" }}
          >
            {titleCase(val)}
          </label>
        </span>
      ))}
      <span
        className="absolute top-0 z-0 block h-8 rounded-md transition-all duration-200"
        style={{ ...selectionStyle(), width: 90 }}
      />
    </div>
  );
}

export default ToggleSwitch;
