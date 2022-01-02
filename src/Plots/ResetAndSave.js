import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faFileDownload } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core"; //allows later to just use icon name to render-them

library.add(faTrash, faFileDownload);

class ResetAndSave extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="absolute inline-block ml-4 mt-7">
        <div className="inline-block list-none">
          <li
            key="Reset"
            onClick={this.props.handleReset}
            className="px-3 py-1 mt-2 text-base text-gray-500 rounded-lg hover:text-gray-900 hover:cursor-pointer"
          >
            <FontAwesomeIcon
              icon={["fas", "trash"]}
              size="lg"
              className="mx-2 -mt-0.5"
            />
            Reset
          </li>
        </div>
        <div className="inline-block list-none">
          <li
            key="Save"
            onClick={this.props.handleSave}
            className="px-3 py-1 mt-2 text-base text-gray-500 rounded-lg hover:text-gray-900 hover:cursor-pointer"
          >
            <FontAwesomeIcon
              icon={["fas", "file-download"]}
              size="lg"
              className="mx-2 -mt-0.5"
            />
            Save
          </li>
        </div>
      </div>
    );
  }
}

export default ResetAndSave;
