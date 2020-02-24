import * as actionTypes from "./actionTypes";

export const appendToCache = codeObjArray => {
  return {
    type: actionTypes.APPEND_TO_CACHE,
    codeObjArray
  };
};
