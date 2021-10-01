import React, { Component } from "react";
import {
  Switch,
  SwitchLabel,
  SwitchRadio,
  SwitchSelection,
} from "./ToggleStyles.js";

const titleCase = (str) =>
  str
    .split(/\s+/)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");

const ClickableLabel = ({ title, onChange, id }) => (
  <SwitchLabel onClick={() => onChange(title)} className={id}>
    {titleCase(title)}
  </SwitchLabel>
);

const ConcealedRadio = ({ value, selected }) => (
  <SwitchRadio type="radio" name="switch" checked={selected === value} />
);

class ToggleSwitch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: this.props.selected,
    };
  }
  // state = {  };

  handleChange = (val) => {
    this.setState({ selected: val });
  };

  selectionStyle = () => {
    return {
      left: `${(this.props.values.indexOf(this.state.selected) / 3) * 100}%`,
      background: `${
        this.props.colors[this.props.values.indexOf(this.state.selected)]
      }`,
    };
  };

  componentDidUpdate() {
    if (this.state.selected !== this.props.selected) {
      this.setState({ selected: this.props.selected });
    }
  }

  render() {
    return (
      <Switch>
        {this.props.values.map((val) => {
          return (
            <span>
              <ConcealedRadio value={val} selected={this.state.selected} />
              <ClickableLabel title={val} onChange={this.handleChange} />
            </span>
          );
        })}
        <SwitchSelection style={this.selectionStyle()} />
      </Switch>
    );
  }
}

export default ToggleSwitch;
