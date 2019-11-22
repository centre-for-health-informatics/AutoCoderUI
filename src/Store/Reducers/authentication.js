import * as actionTypes from "../Actions/actionsTypes";

const initialState = {
  isAuthorized: false,
  isServerDown: false
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_IS_AUTHORIZED:
      return { ...state, isAuthorized: action.authBool };
    case actionTypes.SET_IS_SERVER_DOWN:
      return { ...state, isServerDown: action.serverDownBool };
    default:
      return state;
  }
};

export default reducer;
