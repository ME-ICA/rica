import React from "react";
import CarpetOption from "./CarpetOption";

class Carpets extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      carpetPlot: this.props.images[0]["img"],
    };
  }

  onChange = (e) => {
    this.setState({ carpetPlot: e.target.value });
  };

  render() {
    const images = this.props.images;

    return (
      <center>
        <select className="dd-menu" onChange={this.onChange}>
          {images.map((carpet) => (
            <CarpetOption
              key={carpet.name}
              name={carpet.name}
              img={carpet.img}
            />
          ))}
        </select>
        <div className="carpet-plots-image">
          <img id="imgCarpetPlot" alt="" src={this.state.carpetPlot} />
        </div>
      </center>
    );
  }
}

export default Carpets;
