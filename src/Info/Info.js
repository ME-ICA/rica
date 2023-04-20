import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolder,
} from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core"; //allows later to just use icon name to render-them

library.add(faFolder);

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
        {/* Make a rounded square for the path. The background color should be red. */}
        <div className="flex justify-center mb-8">
          {/* Show folder icon on the left and text on the right */}
          <div className="rounded-xl bg-sky-500 flex items-center">
            <div className="p-8 flex items-center">
              <FontAwesomeIcon
                icon={["fas", "folder"]}
                size="lg"
                className="mx-2"
              />
              <h1 className="text-xl font-semibold italic text-center">
                {this.state.info[1]}
              </h1>
            </div>
          </div>
        </div>
        <p>{this.state.info[0]}</p>
      </div>
    );
  }
}

export default Info;
