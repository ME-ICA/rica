import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faLayerGroup,
  faChartPie,
  faPlus,
  faQuestion,
} from "@fortawesome/free-solid-svg-icons";

import { library } from "@fortawesome/fontawesome-svg-core"; //allows later to just use icon name to render-them

library.add(faInfoCircle, faLayerGroup, faChartPie, faPlus, faQuestion);
class Tabs extends Component {
  state = {
    selected: 0,
  };

  handleChange(index) {
    this.setState({ selected: index });
  }

  render() {
    return (
      <header className="header_container">
        <ul className="tab_container">
          {this.props.children.map((elem, index) => {
            let style =
              index === this.state.selected
                ? "bg-sky-500 rounded-lg text-base py-1 my-1.5 px-3 text-white hover:cursor-pointer"
                : "py-1 mt-1.5 px-3 text-base text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg hover:cursor-pointer";
            return (
              <div className="tab_box">
                <li
                  key={index}
                  className={style}
                  onClick={() => this.handleChange(index)}
                >
                  <FontAwesomeIcon
                    icon={["fas", elem.props.icon]}
                    size="lg"
                    className="mx-2 -mt-0.5"
                  />
                  {elem.props.title}
                </li>
              </div>
            );
          })}
          <ul className="absolute right-0 mr-40">
            <div
              className="flex right-0 text-base absolute mr-24 py-1 mt-1.5 px-3 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg hover:cursor-pointer"
              onClick={this.props.toggleIntroPopup}
            >
              <FontAwesomeIcon
                icon={["fas", "plus"]}
                size="lg"
                className="mx-2"
              />
              <span>New</span>
            </div>
            <div
              className="flex right-0 text-base absolute py-1 mt-1.5 px-3 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg hover:cursor-pointer"
              onClick={this.props.toggleAboutPopup}
            >
              <FontAwesomeIcon
                icon={["fas", "question"]}
                size="lg"
                className="mx-2"
              />
              <span>About</span>
            </div>
          </ul>
        </ul>
        <div className="tab">{this.props.children[this.state.selected]}</div>
      </header>
    );
  }
}

export default Tabs;
