import React, { Component } from "react";
import { readString } from "react-papaparse";

class SubmitFile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: "",
    };
  }

  onChange(e) {
    let file = e.target.files;
    let reader = new FileReader();
    reader.readAsText(file[0]);
    reader.onload = (e) => {
      let dataTXT = e.target.result;
      let data = readString(dataTXT, { header: true, skipEmptyLines: true })[
        "data"
      ];
      this.props.parentCallback(data);
    };
  }

  render() {
    return (
      <div onSubmit={this.onFormSubmit}>
        <input type="file" name="file" onChange={(e) => this.onChange(e)} />
      </div>
    );
  }
}

export default SubmitFile;
