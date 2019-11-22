import * as actionTypes from "./actionTypes";

export const setAlertMessage = newValue => {
  return {
    type: actionTypes.SET_ALERT_MESSAGE,
    newValue
  };
};
