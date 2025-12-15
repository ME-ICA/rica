import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder } from "@fortawesome/free-solid-svg-icons";

function Info({ info }) {
  if (!info?.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No information available</p>
      </div>
    );
  }

  return (
    <div className="mt-16 text-base text-justify whitespace-pre-wrap mx-80">
      <div className="flex justify-center mb-8">
        <div className="rounded-xl bg-sky-500 flex items-center transition-all duration-300 hover:bg-sky-600">
          <div className="px-4 py-4 flex items-center text-white">
            <FontAwesomeIcon icon={faFolder} size="lg" className="mx-2" />
            <h1 className="text-xl font-semibold italic text-center">
              {info[1]}
            </h1>
          </div>
        </div>
      </div>
      <p className="leading-relaxed">{info[0]}</p>
    </div>
  );
}

export default Info;
