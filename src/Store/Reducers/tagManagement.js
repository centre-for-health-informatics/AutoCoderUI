import * as actionTypes from "../Actions/actionTypes";

const initialState = {
  addingTags: [],
  initialTagsAdded: false,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_ADDING_TAGS:
      return { ...state, addingTags: action.tags };

    case actionTypes.SET_INITIAL_TAGS_ADDED:
      return { ...state, initialTagsAdded: action.initialTagsAdded };

    default:
      return state;
  }
};

export default reducer;
