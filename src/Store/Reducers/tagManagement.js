import * as actionTypes from "../Actions/actionTypes";

const initialState = {
  uploadedTags: [],
  addingTags: [],
  initialTagsAdded: false
};

const reducer = (state = initialState, action) => {
  const enableTagByIndex = () => {
    const items = [...state.uploadedTags];
    const newTag = { ...items[action.index], disabled: false };
    items[action.index] = newTag;
    return { ...state, uploadedTags: items };
  };

  const disableTagByIndex = () => {
    const items = [...state.uploadedTags];
    const newTag = { ...items[action.index], disabled: true };
    items[action.index] = newTag;
    return { ...state, uploadedTags: items };
  };

  const setDisableForAllTags = (disable = false) => {
    const items = [...state.uploadedTags];
    items.forEach(tag => {
      tag.disabled = disable;
    });
    return { ...state, uploadedTags: items };
  };

  switch (action.type) {
    case actionTypes.SET_UPLOADED_TAGS:
      return { ...state, uploadedTags: action.uploadedTags };

    case actionTypes.ENABLE_TAG_BY_INDEX:
      return enableTagByIndex();

    case actionTypes.DISABLE_TAG_BY_INDEX:
      return disableTagByIndex();

    case actionTypes.ENABLE_ALL_TAGS:
      return setDisableForAllTags(false);

    case actionTypes.DISABLE_ALL_TAGS:
      return setDisableForAllTags(true);

    case actionTypes.SET_ADDING_TAGS:
      return { ...state, addingTags: action.tags };

    case actionTypes.SET_INITIAL_TAGS_ADDED:
      return { ...state, initialTagsAdded: action.initialTagsAdded };

    default:
      return state;
  }
};

export default reducer;
