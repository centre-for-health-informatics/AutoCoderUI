import * as actionTypes from "./actionTypes";

export const setExampleText = value => {
  console.log("FIRING ACTION", value);
  return {
    type: actionTypes.SET_EXAMPLE_TEXT,
    value
  };
};
