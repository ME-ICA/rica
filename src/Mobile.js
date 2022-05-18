import React, { Component } from "react";

class MobileMain extends Component {
  render() {
    return (
      <div className="h-screen bg-gradient-to-tr from-indigo-200 via-red-200 to-yellow-100">
        <div className="fixed z-10 flex items-center justify-center w-full h-full">
          <div className="px-6 m-auto">
            <h1 className="mb-8 text-3xl font-extrabold">
              Hi, this is Rica{" "}
              <span role="img" aria-label="wave">
                👋
              </span>
            </h1>
            <div className="my-8">
              <p className="text-base">
                It looks like you're visiting from a small screen. Bookmark me
                and visit me again from your computer.
              </p>
            </div>
            <div className="my-8">
              <a href="https://www.github.com/ME-ICA/rica" target="_blank">
                <div className="inline-block w-auto px-4 py-2 font-bold text-white bg-indigo-400 rounded hover:bg-indigo-700">
                  Learn more
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MobileMain;
