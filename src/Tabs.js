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
import { fas } from "@fortawesome/free-solid-svg-icons";

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
            let style = index === this.state.selected ? "selected" : "";
            return (
              <div className="tab_box">
                <li
                  key={index}
                  className={style}
                  onClick={() => this.handleChange(index)}
                >
                  <FontAwesomeIcon
                    icon={["fas", elem.props.icon]}
                    className="tab-icon"
                  />
                  {elem.props.title}
                </li>
              </div>
            );
          })}
          <div className="header-right">
            <div
              className="new-container"
              onClick={this.props.toggleIntroPopup}
            >
              <FontAwesomeIcon icon={["fas", "plus"]} className="tab-icon" />
              <span>New</span>
            </div>
            <div
              className="about-container"
              onClick={this.props.toggleAboutPopup}
            >
              <FontAwesomeIcon
                icon={["fas", "question"]}
                className="tab-icon"
              />
              <span>About</span>
            </div>
          </div>
        </ul>
        <div className="tab">{this.props.children[this.state.selected]}</div>
      </header>
    );
  }
}

export default Tabs;
