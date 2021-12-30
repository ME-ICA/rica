import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

class AboutPopup extends Component {
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
            About us{" "}
            <span role="img" aria-label="brain">
              🧠
            </span>
          </h1>
          <p className="my-4 text-base">Thank you so much for using Rica!</p>
          <p className="my-4 text-base">
            Our aim is to make analayzing and revising ICA components of fMRI
            data a little bit less painful. Hopefully, we can make this process
            as easy and joyful as possible.
          </p>
          <p className="my-4 text-base">
            If you want to learn more about us, have questions or suggestions,
            or want to help us make this tool even better, click on the button
            below. <span> </span>
            <span role="img" aria-label="point-down">
              👇
            </span>
          </p>
          <a
            href="https://github.com/ME-ICA/rica"
            target="_blank"
            className="about-link"
            rel="noreferrer noopener"
          >
            <label className="relative inline-flex items-center content-center justify-center w-fit h-10 px-5 pt-0.5 mt-4 text-base font-semibold text-center text-white bg-sky-500 rounded-xl hover:cursor-pointer hover:bg-sky-600">
              <FontAwesomeIcon
                icon={faGithub}
                size="lg"
                className="mx-2 -mt-0.5"
              />{" "}
              Contribute
            </label>
          </a>
          <div className="absolute right-0 mr-5 text-gray-400">
            <span>v{process.env.REACT_APP_VERSION}</span>
          </div>
        </div>
      </div>
    );
  }
}

export default AboutPopup;
