import React from "react";

const Info = (info: any) => {
  return (
    <div className="mt-16 text-base text-justify whitespace-pre-wrap mx-80 ">
      {/* Make a rounded square for the path. The background color should be red. */}
      <div className="flex justify-center mb-8">
        {/* Show folder icon on the left and text on the right */}
        <div className="flex items-center bg-gray-200 rounded-lg">
          <div className="flex items-center px-2 py-2">
            <h1 className="italic font-semibold text-center">{info.info[1]}</h1>
          </div>
        </div>
      </div>
      <p>{info.info[0]}</p>
    </div>
  );
};

export default Info;
