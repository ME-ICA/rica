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
    let data = [];
    let compFigures = [];
    let carpetFigures = [];
    let comps = [];
    let info = [];

    let files = e.target.files;

    for (var i in files) {
      let filename = files[i].name;
      if (filename !== undefined) {
        // Save component figures into array
        if (filename.includes("comp_")) {
          let imgHolder = null;
          let imgReader = new FileReader();
          imgReader.readAsDataURL(files[i]);
          imgReader.onload = (e) => {
            compFigures.push({
              name: filename,
              img: e.target.result,
            })
          }
        }

        // Save carpet plots into array
        if (filename.includes(".svg")) {
          let imgHolder = null;
          let imgReader = new FileReader();
          imgReader.readAsDataURL(files[i]);
          imgReader.onload = (e) => {
            carpetFigures.push({
              name: filename,
              img: e.target.result,
            })
          }
        }

        // Save report info into array
        if (filename === "report.txt") {
          let reader = new FileReader();
          reader.readAsText(files[i]);
          reader.onload = (e) => {
           let info_holder = e.target.result;
           info.push(info_holder);
          };
        }

        // Save component table into array
        if (filename === "desc-tedana_metrics.tsv") {
          let reader = new FileReader();
          reader.readAsText(files[i]);
          reader.onload = (e) => {
            let dataTXT = e.target.result;
            let compData = readString(dataTXT, { header: true, skipEmptyLines: true })[
              "data"
            ];
            comps.push(compData)
          };
        }
      }
    }
    data.push(compFigures);
    data.push(carpetFigures);
    data.push(comps);
    data.push(info);

    // Pass data to parent
    this.props.parentCallback(data);
  }

  render() {
    return (
      <div onSubmit={this.onFormSubmit}>
        <input type="file" name="file" directory="" webkitdirectory="" onChange={(e) => this.onChange(e)} />
      </div>
    );
  }
}

export default SubmitFile;
