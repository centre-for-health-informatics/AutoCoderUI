import * as actionTypes from "./actionTypes";

export const setSelectedCode = selectedCode => {
  return {
    type: actionTypes.SET_SELECTED_CODE,
    selectedCode
  };
};
