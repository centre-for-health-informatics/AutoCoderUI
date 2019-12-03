import * as actionTypes from "./actionTypes";

export const setFileText = fileText => {
  return {
    type: actionTypes.SET_FILE_VIEWER_TEXT,
    fileText
  };
};

export const setSections = sections => {
  return {
    type: actionTypes.SET_SECTIONS,
    sections
  };
};

export const setSentences = sentences => {
  return {
    type: actionTypes.SET_SENTENCES,
    sentences
  };
};

export const setTokens = tokens => {
  return {
    type: actionTypes.SET_TOKENS,
    tokens
  };
};

export const setEntities = entities => {
  return {
    type: actionTypes.SET_ENTITIES,
    entities
  };
};

export const setSpacyLoading = spacyLoading => {
  return {
    type: actionTypes.SET_SPACY_LOADING,
    spacyLoading
  };
};

export const setSpacyActive = spacyActive => {
  return {
    type: actionTypes.SET_SPACY_ACTIVE,
    spacyActive
  };
};

export const setAnnotationFocus = annotationFocus => {
  return {
    type: actionTypes.SET_ANNOTATION_FOCUS,
    annotationFocus
  };
};

export const setAnnotations = annotations => {
  return {
    type: actionTypes.SET_ANNOTATIONS,
    annotations
  };
};

export const setTagTemplates = tagTemplates => {
  return {
    type: actionTypes.SET_TAG_TEMPLATES,
    tagTemplates
  };
};

export const setFileReference = fileReference => {
  return {
    type: actionTypes.SET_FILE_REFERENCE,
    fileReference
  };
};

export const setAlternatingColors = alternatingColors => {
  return {
    type: actionTypes.SET_ALTERNATING_COLORS,
    alternatingColors
  };
};

export const setLinkedListAdd = linkedListAdd => {
  return {
    type: actionTypes.SET_LINKED_LIST_ADD,
    linkedListAdd
  };
};

export const setIntervalDivHeight = intervalDivHeight => {
  return {
    type: actionTypes.SET_INTERVAL_DIV_HEIGHT,
    intervalDivHeight
  };
};

export const setIntervalDivWidth = intervalDivWidth => {
  return {
    type: actionTypes.SET_INTERVAL_DIV_WIDTH,
    intervalDivWidth
  };
};

export const setAnnotationsToEdit = annotationsToEdit => {
  return {
    type: actionTypes.SET_ANNOTATIONS_TO_EDIT,
    annotationsToEdit
  };
};

export const setSnapToWord = snapToWord => {
  return {
    type: actionTypes.SET_SNAP_TO_WORD,
    snapToWord
  };
};

export const setSectionsInUse = sectionsInUse => {
  return {
    type: actionTypes.SET_SECTIONS_IN_USE,
    sectionsInUse
  };
};

export const setEntitiesInUse = entitiesInUse => {
  return {
    type: actionTypes.SET_ENTITIES_IN_USE,
    entitiesInUse
  };
};

export const setAddingCustomTag = addingCustomTag => {
  return {
    type: actionTypes.SET_ADDING_CUSTOM_TAG,
    addingCustomTag
  };
};
