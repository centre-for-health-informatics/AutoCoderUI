import * as actionTypes from "./actionTypes";

export const setIsAuthorized = authBool => {
  return {
    type: actionTypes.SET_IS_AUTHORIZED,
    authBool
  };
};

export const setIsServerDown = serverDownBool => {
  return {
    type: actionTypes.SET_IS_SERVER_DOWN,
    serverDownBool
  };
};
