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

  for (i = 0; i < data.length; i++) {
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
    let originalData = [];

    let files = e.target.files;

    for (var i in files) {
      let filename = files[i].name;
      if (filename !== undefined) {
        // Save component figures into array
        if (filename.includes("comp_")) {
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
            originalData.push(Object.assign([], compData));
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
    data.push(originalData);

    // Pass data to parent
    this.props.parentCallback(data);

    // Wait until data is loaded to close popup
    setTimeout(() => {
      this.props.closePopup();
    }, 500);
  }

  render() {
    return (
      <label
        htmlFor="file-upload"
        className="relative inline-flex items-center content-center justify-center w-2/3 h-10 mt-10 text-base font-semibold text-center text-white bg-sky-500 rounded-xl hover:cursor-pointer hover:bg-sky-600"
        onSubmit={this.onFormSubmit}
      >
        <FontAwesomeIcon icon={faFolder} size="lg" className="tab-icon" />{" "}
        Select folder
        <input
          id="file-upload"
          type="file"
          name="file"
          directory=""
          webkitdirectory=""
          onChange={(e) => this.onChange(e)}
        />
      </label>
    );
  }
}

export default UploadFolder;
