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
      <div className="plot_tab_container">
        <div className="plot_tab_box">
          <li key="Reset" onClick={this.props.handleReset}>
            <FontAwesomeIcon icon={["fas", "trash"]} className="tab-icon" />
            Reset
          </li>
        </div>
        <div className="plot_tab_box">
          <li key="Save">
            <FontAwesomeIcon
              icon={["fas", "file-download"]}
              className="tab-icon"
            />
            Save
          </li>
        </div>
      </div>
    );
  }
}

export default ResetAndSave;
