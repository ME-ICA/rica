import React, { Component } from "react";
import UploadFolder from "../UploadFolder";

class IntroPopup extends Component {
  render() {
    return (
      <div className="popup">
        <div className="popup_inner">
          <h1 className="popup_title">
            Hi, this is Rica{" "}
            <span role="img" aria-label="wave">
              👋
            </span>
          </h1>
          <p className="popup_text">
            Rica (Reports for ICA) is a reporting and visualization tool for ICA
            decompositions performed with <i>tedana</i> and <i>aroma</i>.
          </p>
          <p className="popup_text">
            In order to generate beautiful reports, Rica needs access to your{" "}
            <i>metrics</i>, <i>report</i>, <i>svg</i> and <i>component png</i>{" "}
            files. Don't worry, files attached to Rica are <b>NOT</b> uploaded
            to a remote server. Once the necessary data is read, Rica cannot
            access the files again. We share your concerns about privacy and
            data protection.{" "}
            <span role="img" aria-label="lock">
              🔒
            </span>
          </p>
          <p>
            Now, select the folder you want to analyze, make some popcorn, and
            chill. Let Rica take care of the rest.{" "}
            <span role="img" aria-label="sunglasses">
              😎
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
