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
          <div className="popup-button">
            <a
              href="https://github.com/ME-ICA/ica-reports"
              target="_blank"
              className="about-link"
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
