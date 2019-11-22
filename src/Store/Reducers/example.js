import * as actionTypes from "../Actions/actionTypes.js";

const initialState = {
  exampleText: ""
};

const reducer = (state = initialState, action) => {
  console.log("REDUCER", action);
  switch (action.type) {
    case actionTypes.SET_EXAMPLE_TEXT:
      return { ...state, exampleText: action.value };
    default:
      return state;
  }
};

export default reducer;
