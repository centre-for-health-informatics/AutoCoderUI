import * as actionTypes from "./actionTypes";

export const setFileText = (fileText) => {
  return {
    type: actionTypes.SET_FILE_VIEWER_TEXT,
    fileText,
  };
};

export const setSentences = (sentences) => {
  return {
    type: actionTypes.SET_SENTENCES,
    sentences,
  };
};

export const setTokens = (tokens) => {
  return {
    type: actionTypes.SET_TOKENS,
    tokens,
  };
};

export const setEntities = (entities) => {
  return {
    type: actionTypes.SET_ENTITIES,
    entities,
  };
};

export const setSpacyLoading = (isSpacyLoading) => {
  return {
    type: actionTypes.SET_SPACY_LOADING,
    isSpacyLoading,
  };
};

export const setAnnotationFocus = (annotationFocus) => {
  return {
    type: actionTypes.SET_ANNOTATION_FOCUS,
    annotationFocus,
  };
};

export const setAnnotations = (annotations) => {
  return {
    type: actionTypes.SET_ANNOTATIONS,
    annotations,
  };
};

export const setTagTemplates = (tagTemplates) => {
  return {
    type: actionTypes.SET_TAG_TEMPLATES,
    tagTemplates,
  };
};

export const setLinkedListAdd = (linkedListAdd) => {
  return {
    type: actionTypes.SET_LINKED_LIST_ADD,
    linkedListAdd,
  };
};

export const setIntervalDivHeight = (intervalDivHeight) => {
  return {
    type: actionTypes.SET_INTERVAL_DIV_HEIGHT,
    intervalDivHeight,
  };
};

export const setIntervalDivWidth = (intervalDivWidth) => {
  return {
    type: actionTypes.SET_INTERVAL_DIV_WIDTH,
    intervalDivWidth,
  };
};

export const setAnnotationsToEdit = (annotationsToEdit) => {
  return {
    type: actionTypes.SET_ANNOTATIONS_TO_EDIT,
    annotationsToEdit,
  };
};

export const setSnapToWord = (snapToWord) => {
  return {
    type: actionTypes.SET_SNAP_TO_WORD,
    snapToWord,
  };
};

export const setSpansRendered = (spansRendered) => {
  return {
    type: actionTypes.SET_SPANS_RENDERED,
    spansRendered,
  };
};

export const setTxtList = (txtList) => {
  return {
    type: actionTypes.SET_TXT_LIST,
    txtList,
  };
};

export const setJsonList = (jsonList) => {
  return {
    type: actionTypes.SET_JSON_LIST,
    jsonList,
  };
};

export const setAnnotationsList = (annotationsList) => {
  return {
    type: actionTypes.SET_ANNOTATIONS_LIST,
    annotationsList,
  };
};

export const setFileIndex = (fileIndex) => {
  return {
    type: actionTypes.SET_FILE_INDEX,
    fileIndex,
  };
};

export const setSessionId = (sessionId) => {
  return {
    type: actionTypes.SET_SESSION_ID,
    sessionId,
  };
};

export const setCurrentEntities = (currentEntities) => {
  return {
    type: actionTypes.SET_CURRENT_ENTITIES,
    currentEntities,
  };
};

export const setCurrentSentences = (currentSentences) => {
  return {
    type: actionTypes.SET_CURRENT_SENTENCES,
    currentSentences,
  };
};

export const setVersions = (versions) => {
  return {
    type: actionTypes.SET_VERSIONS,
    versions,
  };
};

export const setVersionIndex = (versionIndex) => {
  return {
    type: actionTypes.SET_VERSION_INDEX,
    versionIndex,
  };
};

export const setSentencesAvailable = (sentencesAvailable) => {
  return {
    type: actionTypes.SET_SENTENCES_AVAILABLE,
    sentencesAvailable,
  };
};

export const setModifyingAnnotation = (modifyingAnnotation) => {
  return {
    type: actionTypes.SET_MODIFYING_ANNOTATION,
    modifyingAnnotation,
  };
};

export const setFilterICD = (filterICD) => {
  return {
    type: actionTypes.SET_FILTER_ICD,
    filterICD,
  };
};
