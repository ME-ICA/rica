import styled from "styled-components";
import React, { Component } from "react";

export const Switch = styled.div`
  position: relative;
  height: 26px;
  width: 225px;
  background-color: #e4e4e4;
  border-radius: 3px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px rgba(255, 255, 255, 0.1);
`;

// class Switch extends Component {
//   render() {
//     return (
//       <div className="relative h-24 bg-gray-400 rounded-sm w-fit drop-shadow-sm"></div>
//     );
//   }
// }

// export { Switch };

export const SwitchRadio = styled.input`
  display: none;
`;

// class SwitchRadio extends Component {
//   render() {
//     return <input className="display-none" />;
//   }
// }

// export { SwitchRadio };

export const SwitchSelection = styled.span`
  display: block;
  position: absolute;
  z-index: 1;
  top: 0px;
  left: 0px;
  width: 65px;
  padding: 0 5px;
  height: 26px;
  background: #e4e4e4;
  border-radius: 3px;
  transition: left 0.25s ease-out;
`;

export const SwitchLabel = styled.label`
  position: relative;
  z-index: 2;
  float: left;
  width: 65px;
  padding: 0 5px;
  line-height: 26px;
  color: rgba(0, 0, 0, 0.6);
  text-align: center;
  cursor: pointer;

  ${SwitchRadio}:checked + & {
    transition: 0.15s ease-out;
    color: #fff;
  }
`;
