import React from "react";

export default class CarpetOption extends React.Component {
  render() {
    return (
      <option className="dd-option" value={this.props.img}>
        {this.props.name}
      </option>
    );
  }
}
