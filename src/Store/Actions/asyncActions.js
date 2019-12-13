import * as actions from "./index";
import * as tagTypes from "../../Components/TagManagement/tagTypes";

export const openFiles = fileList => {
  return (dispatch, getState) => {
    const txtList = Array.from(getState().fileViewer.txtList);
    const jsonList = Array.from(getState().fileViewer.jsonList);
    const annotationsList = Array.from(getState().fileViewer.annotationsList);

    for (let file of fileList) {
      const ext = file.name.split(".")[file.name.split(".").length - 1];
      // for text files that aren't already opened
      if (ext === "txt" && !fileAlreadyOpen(file, txtList)) {
        txtList.push(file);
        // creating annotation object and pushing into a list
        let annotationsObject = {};
        annotationsObject.name = file.name.slice(0, file.name.length - 1 - ext.length);
        populateAnnotationsObject(annotationsObject, fileList, jsonList);
        annotationsList.push(annotationsObject);
        // for json files that aren't already opened
      } else if (ext === "json" && !fileAlreadyOpen(file, jsonList)) {
        jsonList.push(file);
      }
    }

    // combining lists with store
    dispatch(actions.setJsonList(jsonList));
    dispatch(actions.setTxtList(txtList));
    dispatch(actions.setAnnotationsList(annotationsList));

    return Promise.resolve(getState().fileViewer.annotationsList);
  };
};

// make list of all tags in json and make list from state and compare

// Used to populate annotations from imported json files
const populateAnnotationsObject = (annotationsObject, fileList, jsonList) => {
  // combining newly and previously imported json files
  const allJson = [...jsonList, ...Array.from(fileList).filter(file => file.name.endsWith(".json"))];
  for (let file of allJson) {
    // if the file matches a json file, load annotations from the json file
    if (file.name === annotationsObject.name + "_Annotations.json") {
      let fileReader = new FileReader();
      fileReader.onload = e => {
        const json = JSON.parse(e.target.result);
        annotationsObject[tagTypes.SECTIONS] = json[tagTypes.SECTIONS];
        annotationsObject[tagTypes.ENTITIES] = json[tagTypes.ENTITIES];
        annotationsObject[tagTypes.TOKENS] = json[tagTypes.TOKENS];
        annotationsObject[tagTypes.SENTENCES] = json[tagTypes.SENTENCES];
      };
      fileReader.readAsText(file);
      break;
    }
  }
};

// used to check if a file has already been opened to avoid opening the same file twice
const fileAlreadyOpen = (file, openedFiles) => {
  for (let openFile of openedFiles) {
    if (openFile.name === file.name) {
      return true;
    }
  }
  return false;
};

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
