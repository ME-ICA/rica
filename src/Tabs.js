import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faLayerGroup,
  faCircleNotch,
} from "@fortawesome/free-solid-svg-icons";

import { library } from "@fortawesome/fontawesome-svg-core"; //allows later to just use icon name to render-them
import { fas } from "@fortawesome/free-solid-svg-icons";

library.add(faInfoCircle, faLayerGroup, faCircleNotch);
class Tabs extends Component {
  state = {
    selected: 0,
  };

  handleChange(index) {
    this.setState({ selected: index });
  }

  render() {
    return (
      <>
        <ul class="tab_container">
          {this.props.children.map((elem, index) => {
            let style = index === this.state.selected ? "selected" : "";
            return (
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
            );
          })}
        </ul>
        <div className="tab">{this.props.children[this.state.selected]}</div>
      </>
    );
  }
}

export default Tabs;
