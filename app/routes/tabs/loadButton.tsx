import React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { PlusIcon } from "@radix-ui/react-icons";
import { readString } from "react-papaparse";

function rankArray(data: any) {
  let sorted = data.slice().sort(function (a: any, b: any) {
    return b - a;
  });
  let ranks = data.map(function (v: any) {
    return sorted.indexOf(v) + 1;
  });
  return ranks;
}

function rankComponents(data: any) {
  let varNormalized = [];
  let kappa = [];
  let rho = [];
  for (let i = 0; i < data.length; i++) {
    varNormalized.push(data[i]["normalized variance explained"]);
    kappa.push(data[i]["kappa"]);
    rho.push(data[i]["rho"]);
  }

  let rankVariance = rankArray(varNormalized);
  let rankKappa = rankArray(kappa);
  let rankRho = rankArray(rho);

  for (let i = 0; i < data.length; i++) {
    data[i]["variance explained rank"] = rankVariance[i];
    data[i]["kappa rank"] = rankKappa[i];
    data[i]["rho rank"] = rankRho[i];
  }
}

const LoadButton = () => {
  function readFiles(e: any) {
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
    // this.props.onDataLoad(data);

    console.log(data);

    console.log("Data read into dictionary.");
  }

  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button className="text-violet11 shadow-blackA7 hover:bg-violet3 inline-flex h-[35px] w-[35px] items-center justify-center rounded-full bg-gray-200 shadow-[0_2px_10px] outline-none focus:shadow-[0_0_0_2px] focus:shadow-black right-0 fixed top-0 mr-8 mt-2 ">
            <PlusIcon />
            <input
              id="file-upload"
              type="file"
              name="file"
              directory=""
              webkitdirectory=""
              onChange={(e) => readFiles(e)}
            ></input>
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade text-violet11 select-none rounded-[4px] bg-white px-[15px] py-[10px] text-[15px] leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity]"
            sideOffset={5}
          >
            Load new data
            <Tooltip.Arrow className="fill-white" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export default LoadButton;
