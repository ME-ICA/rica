import React, { Component } from "react";
import { readString } from "react-papaparse";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder } from "@fortawesome/free-solid-svg-icons";

function rankArray(data) {
  var sorted = data.slice().sort(function(a, b) {
    return b - a;
  });
  var ranks = data.map(function(v) {
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

class IntroPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: "",
    };
  }

  readFiles(e) {
    console.log("Reading data...");
    let data = [];
    let compFigures = [];
    let carpetFigures = [];
    let comps = [];
    let info = [];
    let originalData = [];
    let dir_path = [];

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

        // Save file path. Filename starts with "tedana_20" and ends with ".tsv"
        if (filename.startsWith("tedana_20") && filename.endsWith(".tsv")) {
          let reader = new FileReader();
          reader.readAsText(files[i]);
          reader.onload = (e) => {
            // Find file path. Should be on the last column of the first row
            let dataTXT = e.target.result;
            let compData = readString(dataTXT, {
              header: false,
              skipEmptyLines: true,
            })["data"];
            let dir_path_str = compData[0][compData[0].length - 1];
            // Only keep the path, which is after the colon. Make sure it has no spaces before or after
            dir_path_str = dir_path_str.split(":")[1].trim();
            dir_path.push(dir_path_str);
          };
        }
      }
    }
    data.push(compFigures);
    data.push(carpetFigures);
    data.push(comps);
    data.push(info);
    data.push(originalData);
    data.push(dir_path);

    // Pass data to parent
    this.props.onDataLoad(data);

    console.log(data);

    console.log("Data read into dictionary.");

    // this.props.closePopup();
  }

  render() {
    return (
      <div className="fixed z-10 flex items-center justify-center w-full h-full bg-gray-500 bg-opacity-50 backdrop-blur-sm">
        <div className="absolute z-20 w-1/3 px-16 py-10 m-auto bg-white h-fit rounded-xl drop-shadow-2xl">
          <button
            onClick={this.props.closePopup}
            type="button"
            className="absolute top-0 right-0 inline-flex items-center p-2 ml-auto text-base text-gray-400 bg-transparent rounded-xl hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <svg
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </button>
          <h1 className="mb-8 text-3xl font-extrabold">
            Hi, this is Rica{" "}
            <span role="img" aria-label="wave">
              👋
            </span>
          </h1>
          <p className="my-4 text-base">
            Rica (Reports for ICA) is a reporting and visualization tool for ICA
            decompositions performed with <i>tedana</i> and <i>aroma</i>.
          </p>
          <p className="my-4 text-base">
            In order to generate beautiful reports, Rica needs access to your{" "}
            <i>metrics</i>, <i>report</i>, <i>svg</i> and <i>component png</i>{" "}
            files. Don't worry, files attached to Rica are <b>NOT</b> uploaded
            to a remote server. Once the necessary data is read, Rica cannot
            access the files again. We share your concerns about privacy and
            data protection.{" "}
            <span role="img" aria-label="lock">
              🔒
            </span>
          </p>
          <p className="my-4 text-base">
            Now, select the folder you want to analyze, make some popcorn, and
            chill. Let Rica take care of the rest.{" "}
            <span role="img" aria-label="sunglasses">
              😎
            </span>
          </p>
          {/* <UploadFolder
            onDataLoad={this.props.onDataLoad}
            closePopup={this.props.closePopup}
          /> */}
          <label
            htmlFor="file-upload"
            className="relative inline-flex items-center content-center justify-center w-fit h-10 px-5 pt-0.5 mt-4 text-base font-semibold text-center text-white bg-sky-500 rounded-xl hover:cursor-pointer hover:bg-sky-600"
            onSubmit={this.onFormSubmit}
          >
            <FontAwesomeIcon
              icon={faFolder}
              size="lg"
              className="-mt-0.5 mx-2"
            />{" "}
            Select folder
            <input
              id="file-upload"
              type="file"
              name="file"
              directory=""
              webkitdirectory=""
              onChange={(e) => this.readFiles(e)}
            />
          </label>
        </div>
      </div>
    );
  }
}

export default IntroPopup;
