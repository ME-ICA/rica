import React from "react";

class Info extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      info: this.props.info,
    };
  }

  render() {
    return (
      <div className="mt-16 text-base text-justify whitespace-pre-wrap mx-80 ">
        <p>{this.state.info}</p>
      </div>
    );
  }
}

export default Info;
