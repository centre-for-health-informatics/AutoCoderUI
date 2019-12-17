import * as actions from "./index";
import * as tagTypes from "../../Components/TagManagement/tagTypes";

// sets store with annotations when spacy loads, and gets the tags for the legend
export const updateAnnotationsAfterLoadingSpacy = data => {
  return (dispatch, getState) => {
    // store objects used to create the annotations
    const alternatingColors = getState().fileViewer.alternatingColors;
    const tagTemplates = getState().fileViewer.tagTemplates;

    const sections = mapData(data.sections, tagTypes.SECTIONS, alternatingColors, tagTemplates);
    const sentences = mapData(data.sentences, tagTypes.SENTENCES, alternatingColors, tagTemplates);
    const tokens = mapData(data.tokens, tagTypes.TOKENS, alternatingColors, tagTemplates);
    const entities = mapData(data.entities, tagTypes.ENTITIES, alternatingColors, tagTemplates);

    // setting annotationsList
    let annotationsListCopy = JSON.parse(JSON.stringify(getState().fileViewer.annotationsList));
    let annotationsObject = annotationsListCopy[getState().fileViewer.fileIndex];
    annotationsObject[tagTypes.SECTIONS] = sections;
    annotationsObject[tagTypes.SENTENCES] = sentences;
    annotationsObject[tagTypes.ENTITIES] = entities;
    annotationsObject[tagTypes.TOKENS] = tokens;
    dispatch(actions.setAnnotationsList(annotationsListCopy));

    // setting four types of annotations
    dispatch(actions.setSections(sections));
    dispatch(actions.setSentences(sentences));
    dispatch(actions.setTokens(tokens));
    dispatch(actions.setEntities(entities));
  };
};

// maps the data to change the Spacy "label" data member to "tag"
// adds colour based on whether there is a defined colour or whether it should be mapped
const mapData = (data, type, alternatingColors, tagTemplates) => {
  for (let i = 0; i < data.length; i++) {
    // changing label to tag
    let dataPoint = data[i];
    dataPoint.tag = dataPoint.label;
    delete dataPoint.label;

    // colour matching for entities and sections
    if (type === tagTypes.ENTITIES || type === tagTypes.SECTIONS) {
      let idMatchingTags = tagTemplates.filter(item => {
        return item.id === dataPoint.tag;
      });
      if (idMatchingTags.length > 0) {
        dataPoint.color = idMatchingTags[0].color;
      }
      // alternating colours for tokens and sentences
    } else {
      if (i % 2 === 0) {
        dataPoint.color = alternatingColors[0];
      } else {
        dataPoint.color = alternatingColors[1];
      }
    }
  }
  return data;
};

export const setTagTemplatesWithCallback = tagTemplates => {
  return (dispatch, getState) => {
    dispatch(actions.setTagTemplates(tagTemplates));
    return Promise.resolve(getState());
  };
};
