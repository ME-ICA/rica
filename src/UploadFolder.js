import React, { Component } from "react";
import { readString } from "react-papaparse";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder } from "@fortawesome/free-solid-svg-icons";

function rankArray(data) {
  var sorted = data.slice().sort(function (a, b) {
    return b - a;
  });
  var ranks = data.map(function (v) {
    return sorted.indexOf(v) + 1;
  });
  return ranks;
}

function rankComponents(data) {
  let varNormalized = [];
  let kappa = [];
  let rho = [];
  for (var i = 0; i < data.length; i++) {
    varNormalized.push(data[i]["normalized variance explained"]);
    kappa.push(data[i]["kappa"]);
    rho.push(data[i]["rho"]);
  }

  let rankVariance = rankArray(varNormalized);
  let rankKappa = rankArray(kappa);
  let rankRho = rankArray(rho);

  for (var i = 0; i < data.length; i++) {
    data[i]["variance explained rank"] = rankVariance[i];
    data[i]["kappa rank"] = rankKappa[i];
    data[i]["rho rank"] = rankRho[i];
  }
}
class UploadFolder extends Component {
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
            });
          };
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
            });
          };
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
        if (filename.includes("_metrics.tsv") && !filename.includes("PCA")) {
          let reader = new FileReader();
          reader.readAsText(files[i]);
          reader.onload = (e) => {
            let dataTXT = e.target.result;
            let compData = readString(dataTXT, {
              header: true,
              skipEmptyLines: true,
            })["data"];
            rankComponents(compData);
            comps.push(compData);
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

    setTimeout(() => {
      this.props.closePopup();
    }, 500);
  }

  render() {
    return (
      <div className="custom-file-upload" onSubmit={this.onFormSubmit}>
        <label for="file-upload" className="custom-file-upload-label">
          <FontAwesomeIcon icon={faFolder} className="tab-icon" /> Select folder
        </label>
        <input
          id="file-upload"
          type="file"
          name="file"
          directory=""
          webkitdirectory=""
          onChange={(e) => this.onChange(e)}
        />
      </div>
    );
  }
}

export default UploadFolder;
