import * as actions from "./index";
import * as tagTypes from "../../Components/TagManagement/tagTypes";

// sets store with annotations when spacy loads, and gets the tags for the legend
export const updateLegendAfterLoadingSpacy = data => {
  return (dispatch, getState) => {
    // copying current annotations
    // done in case there is the option to merge user-made annotation with spacy annotations
    const sections = Array.from(getState().fileViewer.sections);
    const sentences = Array.from(getState().fileViewer.sentences);
    const tokens = Array.from(getState().fileViewer.tokens);
    const entities = Array.from(getState().fileViewer.entities);

    // store objects used to create the annotations
    const alternatingColors = getState().fileViewer.alternatingColors;
    const tagTemplates = getState().fileViewer.tagTemplates;

    // setting four types of annotations
    dispatch(
      actions.setSections([...sections, ...mapData(data.sections, tagTypes.SECTIONS, alternatingColors, tagTemplates)])
    );
    dispatch(
      actions.setSentences([
        ...sentences,
        ...mapData(data.sentences, tagTypes.SENTENCES, alternatingColors, tagTemplates)
      ])
    );
    dispatch(actions.setTokens([...tokens, ...mapData(data.tokens, tagTypes.TOKENS, alternatingColors, tagTemplates)]));
    dispatch(
      actions.setEntities([...entities, ...mapData(data.entities, tagTypes.ENTITIES, alternatingColors, tagTemplates)])
    );
    // setting active annotations to sections
    dispatch(actions.setAnnotations(getState().fileViewer.sections));

    // finding set of sections and entities to display in the legend
    let sectionsSet = new Set();
    for (let annotation of getState().fileViewer.sections) {
      sectionsSet.add(annotation.tag);
    }
    dispatch(actions.setSectionsInUse(Array.from(sectionsSet)));
    let entitiesSet = new Set();
    for (let annotation of getState().fileViewer.entities) {
      entitiesSet.add(annotation.tag);
    }
    dispatch(actions.setEntitiesInUse(Array.from(entitiesSet)));
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
