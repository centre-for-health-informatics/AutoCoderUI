import * as actionTypes from "../Actions/actionTypes";

const initialState = {
  selectedCode: "Chapter 01"
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_SELECTED_CODE:
      return { ...state, selectedCode: action.selectedCode };
    default:
      return state;
  }
};

export default reducer;
