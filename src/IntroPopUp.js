import React, { Component } from "react";
import UploadFolder from "./UploadFolder";

class IntroPopup extends Component {
  render() {
    return (
      <div className="popup">
        <div className="popup_inner">
          <h1 className="popup_title">{this.props.title}</h1>
          <p className="popup_text">
            ICA reports requires your metrics, report, svg and component png
            files to make the reports. Don't worry, just select the folder you
            want to analyze and chill, ICA reports will do the rest for you.
            <span> </span>
            <span role="img" aria-label="sunglasses">
              😎
            </span>
          </p>
          <p>
            Oh, and your files will always remain on your computer! Files
            attached to ICA reports are NOT uploaded to a remote server. We
            share your concerns about privacy and data protection.<span> </span>
            <span role="img" aria-label="lock">
              🔒
            </span>
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
