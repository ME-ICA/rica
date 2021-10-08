import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

class AboutPopup extends Component {
  render() {
    return (
      <div className="popup">
        <div className="popup_inner">
          <h1 className="popup_title">
            About us{" "}
            <span role="img" aria-label="brain">
              🧠
            </span>
          </h1>
          <p className="popup_text">Thank you so much for using Rica!</p>
          <p className="popup_text">
            Our aim is to make analayzing and revising ICA components of fMRI
            data a little bit less painful. Hopefully, we can make this process
            as easy and joyful as possible.
          </p>
          <p className="popup_text">
            If you want to learn more about us, have questions or suggestions,
            or want to help us make this tool even better, click on the button
            below. <span> </span>
            <span role="img" aria-label="point-down">
              👇
            </span>
          </p>
          <div className="popup-button">
            <a
              href="https://github.com/ME-ICA/rica"
              target="_blank"
              className="about-link"
              rel="noreferrer noopener"
            >
              <label className="popup-button-label">
                <FontAwesomeIcon icon={faGithub} className="tab-icon" />{" "}
                Contribute
              </label>
            </a>
          </div>
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

export default AboutPopup;
