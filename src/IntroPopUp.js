import React, { Component } from "react";
import UploadFolder from "./UploadFolder";

class IntroPopup extends Component {
  render() {
    return (
      <div className="popup">
        <div className="popup_inner">
          <h1 className="popup_title">{this.props.title}</h1>
          <p className="popup_text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
            pharetra risus eget aliquam aliquet. Donec semper nisl nec arcu
            dictum interdum. Nulla facilisi. Pellentesque vitae lacus semper,
            porta nibh eu, suscipit mi. Nunc sollicitudin vel diam a pulvinar.
            Vestibulum tincidunt aliquet risus ac aliquet. Curabitur mattis
            volutpat imperdiet. Mauris vitae pretium mauris, in commodo magna.
            Quisque ut ipsum id lacus pretium viverra faucibus id lacus. Sed
            eget justo in tortor sodales suscipit.
          </p>
          <UploadFolder
            parentCallback={this.props.callBack}
            closePopup={this.props.closePopup}
          />
          <div className="popup_close_button_container">
            <button
              onClick={this.props.closePopup}
              type="button"
              className="close"
            ></button>
          </div>
        </div>
      </div>
    );
  }
}

export default IntroPopup;
