import * as actions from "./index";
import * as tagTypes from "../../Components/TagManagement/tagTypes";

export const updateLegendAfterLoadingSpacy = data => {
  return (dispatch, getState) => {
    const sections = Array.from(getState().fileViewer.sections);
    const sentences = Array.from(getState().fileViewer.sentences);
    const tokens = Array.from(getState().fileViewer.tokens);
    const entities = Array.from(getState().fileViewer.entities);

    const alternatingColors = getState().fileViewer.alternatingColors;
    const tagTemplates = getState().fileViewer.tagTemplates;

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
    dispatch(actions.setAnnotations(getState().fileViewer.sections));

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

const mapData = (data, type, alternatingColors, tagTemplates) => {
  for (let i = 0; i < data.length; i++) {
    let dataPoint = data[i];
    dataPoint.tag = dataPoint.label;
    delete dataPoint.label;

    if (type === tagTypes.ENTITIES || type === tagTypes.SECTIONS) {
      let idMatchingTags = tagTemplates.filter(item => {
        return item.id === dataPoint.tag;
      });
      if (idMatchingTags.length > 0) {
        dataPoint.color = idMatchingTags[0].color;
      }
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

export const setTagTemplatesWithCallback = tags => dispatch => {
  dispatch(actions.setTagTemplates(tags));
  return Promise.resolve();
};
