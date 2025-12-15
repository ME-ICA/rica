import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faFileDownload } from "@fortawesome/free-solid-svg-icons";

function ResetAndSave({ handleReset, handleSave }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleReset}
        className="px-3 py-1.5 text-sm text-gray-500 rounded-lg hover:text-gray-900 hover:cursor-pointer hover:bg-gray-100 transition-colors duration-200 flex items-center"
      >
        <FontAwesomeIcon icon={faTrash} style={{ marginRight: 8 }} />
        Reset
      </button>
      <button
        onClick={handleSave}
        className="px-3 py-1.5 text-sm text-gray-500 rounded-lg hover:text-gray-900 hover:cursor-pointer hover:bg-gray-100 transition-colors duration-200 flex items-center"
      >
        <FontAwesomeIcon icon={faFileDownload} style={{ marginRight: 8 }} />
        Save
      </button>
    </div>
  );
}

export default ResetAndSave;
