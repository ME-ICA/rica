import React, { Component } from "react";
import UploadFolder from "../UploadFolder";

class IntroPopup extends Component {
  render() {
    return (
      <div className="fixed z-10 flex items-center justify-center w-full h-full bg-gray-500 bg-opacity-50 backdrop-blur-sm">
        <div className="absolute z-20 w-1/3 p-10 m-auto bg-white h-fit rounded-xl drop-shadow-2xl">
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
          <UploadFolder
            parentCallback={this.props.callBack}
            closePopup={this.props.closePopup}
          />
        </div>
      </div>
    );
  }
}

export default IntroPopup;
