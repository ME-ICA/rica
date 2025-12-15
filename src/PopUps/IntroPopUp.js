import React, { useState, useCallback } from "react";
import Papa from "papaparse";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faSpinner } from "@fortawesome/free-solid-svg-icons";

// Rank array helper
function rankArray(data) {
  const sorted = data.slice().sort((a, b) => b - a);
  return data.map((v) => sorted.indexOf(v) + 1);
}

// Add ranking columns to component data
function rankComponents(data) {
  const varNormalized = data.map((d) => d["normalized variance explained"]);
  const kappa = data.map((d) => d["kappa"]);
  const rho = data.map((d) => d["rho"]);

  const rankVariance = rankArray(varNormalized);
  const rankKappa = rankArray(kappa);
  const rankRho = rankArray(rho);

  data.forEach((d, i) => {
    d["variance explained rank"] = rankVariance[i];
    d["kappa rank"] = rankKappa[i];
    d["rho rank"] = rankRho[i];
  });
}

// Promise wrapper for FileReader
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function IntroPopup({ onDataLoad, onLoadingStart, closePopup, isLoading }) {
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });

  const processFiles = useCallback(
    async (e) => {
      onLoadingStart();

      const files = Array.from(e.target.files);
      const totalFiles = files.filter(
        (f) =>
          f.name.includes("comp_") ||
          f.name.includes(".svg") ||
          f.name === "report.txt" ||
          (f.name.includes("_metrics.tsv") && !f.name.includes("PCA")) ||
          (f.name.startsWith("tedana_20") && f.name.endsWith(".tsv"))
      ).length;

      setLoadingProgress({ current: 0, total: totalFiles });

      const compFigures = [];
      const carpetFigures = [];
      let info = "";
      let components = [];
      let originalData = [];
      let dirPath = "";

      let processed = 0;

      // Process all files in parallel using Promise.all
      const filePromises = files.map(async (file) => {
        const filename = file.name;

        try {
          // Component figures (PNG)
          if (filename.includes("comp_") && filename.endsWith(".png")) {
            const dataUrl = await readFileAsDataURL(file);
            compFigures.push({ name: filename, img: dataUrl });
            processed++;
            setLoadingProgress((prev) => ({ ...prev, current: processed }));
          }

          // Carpet plots (SVG)
          if (filename.endsWith(".svg")) {
            const dataUrl = await readFileAsDataURL(file);
            carpetFigures.push({ name: filename, img: dataUrl });
            processed++;
            setLoadingProgress((prev) => ({ ...prev, current: processed }));
          }

          // Report info
          if (filename === "report.txt") {
            info = await readFileAsText(file);
            processed++;
            setLoadingProgress((prev) => ({ ...prev, current: processed }));
          }

          // Component metrics table
          if (filename.includes("_metrics.tsv") && !filename.includes("PCA")) {
            const text = await readFileAsText(file);
            const parsed = Papa.parse(text, {
              header: true,
              skipEmptyLines: true,
              dynamicTyping: true,
            });
            originalData = JSON.parse(JSON.stringify(parsed.data));
            rankComponents(parsed.data);
            components = parsed.data;
            processed++;
            setLoadingProgress((prev) => ({ ...prev, current: processed }));
          }

          // Dataset path
          if (filename.startsWith("tedana_20") && filename.endsWith(".tsv")) {
            const text = await readFileAsText(file);
            const parsed = Papa.parse(text, {
              header: false,
              skipEmptyLines: true,
            });
            const row = parsed.data[0];
            const pathStr = row[row.length - 1];
            dirPath = pathStr.includes(":") ? pathStr.split(":")[1].trim() : pathStr;
            processed++;
            setLoadingProgress((prev) => ({ ...prev, current: processed }));
          }
        } catch (error) {
          console.error(`Error reading file ${filename}:`, error);
        }
      });

      // Wait for all files to be processed
      await Promise.all(filePromises);

      // Sort component figures by name for consistent ordering
      compFigures.sort((a, b) => a.name.localeCompare(b.name));
      carpetFigures.sort((a, b) => a.name.localeCompare(b.name));

      // Pass all data to parent at once - no delays!
      onDataLoad({
        componentFigures: compFigures,
        carpetFigures,
        components: [components],
        info,
        originalData: [originalData],
        dirPath,
      });
    },
    [onDataLoad, onLoadingStart]
  );

  return (
    <div className="fixed z-10 flex items-center justify-center w-full h-full bg-gray-500 bg-opacity-50 backdrop-blur-sm">
      <div className="absolute z-20 w-1/3 px-16 py-10 m-auto bg-white h-fit rounded-xl drop-shadow-2xl transition-all duration-300">
        <button
          onClick={closePopup}
          type="button"
          className="absolute top-0 right-0 inline-flex items-center p-2 ml-auto text-base text-gray-400 bg-transparent rounded-xl hover:bg-gray-200 hover:text-gray-900"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {isLoading ? (
          <div className="text-center py-8">
            <FontAwesomeIcon
              icon={faSpinner}
              size="3x"
              className="text-sky-500 animate-spin mb-4"
            />
            <h2 className="text-xl font-semibold mb-2">Processing files...</h2>
            {loadingProgress.total > 0 && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-sky-500 h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${(loadingProgress.current / loadingProgress.total) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {loadingProgress.current} / {loadingProgress.total} files
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            <h1 className="mb-8 text-3xl font-extrabold">
              Hi, this is Rica{" "}
              <span role="img" aria-label="wave">

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

              </span>
            </p>
            <p className="my-4 text-base">
              Now, select the folder you want to analyze.{" "}
              <span role="img" aria-label="sunglasses">

              </span>
            </p>
            <label
              htmlFor="file-upload"
              className="relative inline-flex items-center content-center justify-center w-fit h-10 px-5 pt-0.5 mt-4 text-base font-semibold text-center text-white bg-sky-500 rounded-xl hover:cursor-pointer hover:bg-sky-600 transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faFolder} size="lg" className="-mt-0.5 mx-2" />
              Select folder
              <input
                id="file-upload"
                type="file"
                name="file"
                directory=""
                webkitdirectory=""
                onChange={processFiles}
              />
            </label>
          </>
        )}
      </div>
    </div>
  );
}

export default IntroPopup;
