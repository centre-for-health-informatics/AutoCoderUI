import * as actions from "./index";
import * as tagTypes from "../../Components/TagManagement/tagTypes";

// sets store with annotations when spacy loads, and gets the tags for the legend
export const updateAnnotationsAfterLoadingSpacy = (data, index) => {
  return (dispatch, getState) => {
    let annotationsListCopy = JSON.parse(JSON.stringify(getState().fileViewer.annotationsList));
    let annotationsObject = annotationsListCopy[index];

    let sections, sentences, tokens, entities;
    if (data[tagTypes.SECTIONS]) {
      sections = mapData(data[tagTypes.SECTIONS]);
      annotationsObject[tagTypes.SECTIONS] = sections;
      dispatch(actions.setSections(sections));
    }
    if (data[tagTypes.SENTENCES]) {
      sentences = mapData(data[tagTypes.SENTENCES]);
      annotationsObject[tagTypes.SENTENCES] = sentences;
      dispatch(actions.setSentences(sentences));
    }
    if (data[tagTypes.TOKENS]) {
      tokens = mapData(data[tagTypes.TOKENS]);
      annotationsObject[tagTypes.TOKENS] = tokens;
      dispatch(actions.setTokens(tokens));
    }
    if (data[tagTypes.ENTITIES]) {
      entities = mapData(data[tagTypes.ENTITIES]);
      annotationsObject[tagTypes.ENTITIES] = entities;
      dispatch(actions.setEntities(entities));
    }

    dispatch(actions.setAnnotationsList(annotationsListCopy));

    // if opening more files while spacy is loading, can maybe cause issue?
  };
};

// maps the data to change the Spacy "label" data member to "tag"
const mapData = data => {
  for (let i = 0; i < data.length; i++) {
    // changing label to tag
    let dataPoint = data[i];
    dataPoint.tag = dataPoint.label;
    delete dataPoint.label;
  }
  return data;
};

export const setTagTemplatesWithCallback = tagTemplates => {
  return (dispatch, getState) => {
    dispatch(actions.setTagTemplates(tagTemplates));
    return Promise.resolve(getState());
  };
};
