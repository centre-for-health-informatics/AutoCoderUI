import * as actionTypes from "../Actions/actionTypes";

const initialState = {
  fileViewerText: "",
  sections: [],
  sentences: [],
  tokens: [],
  entities: [],
  spacyLoading: false,
  spacyActive: false,
  annotationFocus: "Sections",
  annotations: [],
  tagTemplates: [],
  fileReference: "",
  alternatingColors: ["rgb(149,156,243)", "rgb(244,196,199)"],
  linkedListAdd: false,
  intervalDivHeight: 0,
  intervalDivWidth: 0,
  annotationsToEdit: [],
  snapToWord: true,
  sectionsInUse: [],
  entitiesInUse: [],
  addingCustomTag: false,
  spansRendered: false,
  txtList: [],
  jsonList: [],
  annotationsList: []
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_FILE_VIEWER_TEXT:
      return { ...state, fileViewerText: action.fileText };
    case actionTypes.SET_SECTIONS:
      return { ...state, sections: action.sections };
    case actionTypes.SET_SENTENCES:
      return { ...state, sentences: action.sentences };
    case actionTypes.SET_TOKENS:
      return { ...state, tokens: action.tokens };
    case actionTypes.SET_ENTITIES:
      return { ...state, entities: action.entities };
    case actionTypes.SET_SPACY_LOADING:
      return { ...state, spacyLoading: action.spacyLoading };
    case actionTypes.SET_SPACY_ACTIVE:
      return { ...state, spacyActive: action.spacyActive };
    case actionTypes.SET_ANNOTATION_FOCUS:
      return { ...state, annotationFocus: action.annotationFocus };
    case actionTypes.SET_ANNOTATIONS:
      return { ...state, annotations: action.annotations };
    case actionTypes.SET_TAG_TEMPLATES:
      return { ...state, tagTemplates: action.tagTemplates };
    case actionTypes.SET_FILE_REFERENCE:
      return { ...state, fileReference: action.fileReference };
    case actionTypes.SET_ALTERNATING_COLORS:
      return { ...state, alternatingColors: action.alternatingColors };
    case actionTypes.SET_LINKED_LIST_ADD:
      return { ...state, linkedListAdd: action.linkedListAdd };
    case actionTypes.SET_INTERVAL_DIV_HEIGHT:
      return { ...state, intervalDivHeight: action.intervalDivHeight };
    case actionTypes.SET_INTERVAL_DIV_WIDTH:
      return { ...state, intervalDivWidth: action.intervalDivWidth };
    case actionTypes.SET_ANNOTATIONS_TO_EDIT:
      return { ...state, annotationsToEdit: action.annotationsToEdit };
    case actionTypes.SET_SNAP_TO_WORD:
      return { ...state, snapToWord: action.snapToWord };
    case actionTypes.SET_SECTIONS_IN_USE:
      return { ...state, sectionsInUse: action.sectionsInUse };
    case actionTypes.SET_ENTITIES_IN_USE:
      return { ...state, entitiesInUse: action.entitiesInUse };
    case actionTypes.SET_ADDING_CUSTOM_TAG:
      return { ...state, addingCustomTag: action.addingCustomTag };
    case actionTypes.SET_SPANS_RENDERED:
      return { ...state, spansRendered: action.spansRendered };
    case actionTypes.SET_TXT_LIST:
      return { ...state, txtList: action.txtList };
    case actionTypes.SET_JSON_LIST:
      return { ...state, jsonList: action.jsonList };
    case actionTypes.SET_ANNOTATIONS_LIST:
      return { ...state, annotationsList: action.annotationsList };
    default:
      return state;
  }
};

export default reducer;
