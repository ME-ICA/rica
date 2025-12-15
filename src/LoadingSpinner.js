import React from "react";

function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
        <div className="w-12 h-12 rounded-full border-4 border-sky-500 border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="mt-4 text-gray-600 text-base">{message}</p>
    </div>
  );
}

export default LoadingSpinner;
