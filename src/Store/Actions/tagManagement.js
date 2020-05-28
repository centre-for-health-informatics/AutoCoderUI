import * as actionTypes from "./actionTypes";

export const setAddingTags = (tags) => {
  return {
    type: actionTypes.SET_ADDING_TAGS,
    tags,
  };
};

export const setInitialTagsAdded = (initialTagsAdded) => {
  return {
    type: actionTypes.SET_INITIAL_TAGS_ADDED,
    initialTagsAdded,
  };
};
