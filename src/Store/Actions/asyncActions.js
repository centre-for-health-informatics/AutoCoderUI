import * as actions from "./index";
import * as tagTypes from "../../Components/TagManagement/tagTypes";

// sets store with annotations when spacy loads, and gets the tags for the legend
export const updateAnnotationsAfterLoadingSpacy = (data, index) => {
  return (dispatch, getState) => {
    if (index === getState().fileViewer.fileIndex) {
      let sections, sentences, entities;
      if (data[tagTypes.SECTIONS]) {
        sections = data[tagTypes.SECTIONS];
        dispatch(actions.setCurrentSections(sections));
        dispatch(actions.setSections(sections));
      }
      if (data[tagTypes.SENTENCES]) {
        sentences = data[tagTypes.SENTENCES];
        dispatch(actions.setCurrentSentences(sentences));
        dispatch(actions.setSentences(sentences));
      }
      if (data[tagTypes.ENTITIES]) {
        entities = data[tagTypes.ENTITIES];
        dispatch(actions.setCurrentEntities(entities));
        dispatch(actions.setEntities(entities));
      }
    }
    return Promise.resolve(getState());
  };
};

export const setTagTemplatesWithCallback = tagTemplates => {
  return (dispatch, getState) => {
    dispatch(actions.setTagTemplates(tagTemplates));
    return Promise.resolve(getState());
  };
};

export const setCurrentEntitiesWithCallback = entities => {
  return (dispatch, getState) => {
    dispatch(actions.setCurrentEntities(entities));
    return Promise.resolve(getState());
  };
};

export const setCurrentSectionsWithCallback = sections => {
  return (dispatch, getState) => {
    dispatch(actions.setCurrentSections(sections));
    return Promise.resolve(getState());
  };
};

export const setCurrentSentencesWithCallback = sentences => {
  return (dispatch, getState) => {
    dispatch(actions.setCurrentSentences(sentences));
    return Promise.resolve(getState());
  };
};

export const setFileIndexWithCallback = fileIndex => {
  return (dispatch, getState) => {
    dispatch(actions.setFileIndex(fileIndex));
    return Promise.resolve(getState());
  };
};
