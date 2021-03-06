import * as actionTypes from "../Actions/actionTypes";
import * as tagTypes from "../../Components/TagManagement/tagTypes";

const initialState = {
  fileViewerText: "",
  sentences: [],
  tokens: [],
  entities: [],
  isSpacyLoading: false,
  annotationFocus: tagTypes.ICD,
  annotations: [],
  tagTemplates: [],
  linkedListAdd: false,
  intervalDivHeight: 0,
  intervalDivWidth: 0,
  annotationsToEdit: [],
  snapToWord: true,
  spansRendered: false,
  txtList: [],
  jsonList: [],
  annotationsList: [],
  fileIndex: -1,
  sessionId: null,
  currentEntities: [],
  currentSentences: [],
  versionIndex: -1,
  versions: [],
  sentencesAvailable: false,
  modifyingAnnotation: null,
  filterICD: false,
  unnamedCounter: 1,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_FILE_VIEWER_TEXT:
      return { ...state, fileViewerText: action.fileText };
    case actionTypes.SET_SENTENCES:
      return { ...state, sentences: action.sentences };
    case actionTypes.SET_TOKENS:
      return { ...state, tokens: action.tokens };
    case actionTypes.SET_ENTITIES:
      return { ...state, entities: action.entities };
    case actionTypes.SET_SPACY_LOADING:
      return { ...state, isSpacyLoading: action.isSpacyLoading };
    case actionTypes.SET_ANNOTATION_FOCUS:
      return { ...state, annotationFocus: action.annotationFocus };
    case actionTypes.SET_ANNOTATIONS:
      return { ...state, annotations: action.annotations };
    case actionTypes.SET_TAG_TEMPLATES:
      return { ...state, tagTemplates: action.tagTemplates };
    case actionTypes.SET_LINKED_LIST_ADD:
      if (state.annotations.length > 0) {
        return { ...state, linkedListAdd: action.linkedListAdd };
      }
    case actionTypes.SET_INTERVAL_DIV_HEIGHT:
      return { ...state, intervalDivHeight: action.intervalDivHeight };
    case actionTypes.SET_INTERVAL_DIV_WIDTH:
      return { ...state, intervalDivWidth: action.intervalDivWidth };
    case actionTypes.SET_ANNOTATIONS_TO_EDIT:
      return { ...state, annotationsToEdit: action.annotationsToEdit };
    case actionTypes.SET_SNAP_TO_WORD:
      return { ...state, snapToWord: action.snapToWord };
    case actionTypes.SET_SPANS_RENDERED:
      return { ...state, spansRendered: action.spansRendered };
    case actionTypes.SET_TXT_LIST:
      return { ...state, txtList: action.txtList };
    case actionTypes.SET_JSON_LIST:
      return { ...state, jsonList: action.jsonList };
    case actionTypes.SET_ANNOTATIONS_LIST:
      return { ...state, annotationsList: action.annotationsList };
    case actionTypes.SET_FILE_INDEX:
      return { ...state, fileIndex: action.fileIndex };
    case actionTypes.SET_SESSION_ID:
      return { ...state, sessionId: action.sessionId };
    case actionTypes.SET_CURRENT_ENTITIES:
      return { ...state, currentEntities: action.currentEntities };
    case actionTypes.SET_CURRENT_SENTENCES:
      return { ...state, currentSentences: action.currentSentences };
    case actionTypes.SET_VERSIONS:
      return { ...state, versions: action.versions };
    case actionTypes.SET_VERSION_INDEX:
      return { ...state, versionIndex: action.versionIndex };
    case actionTypes.SET_SENTENCES_AVAILABLE:
      return { ...state, sentencesAvailable: action.sentencesAvailable };
    case actionTypes.SET_MODIFYING_ANNOTATION:
      return { ...state, modifyingAnnotation: action.modifyingAnnotation };
    case actionTypes.SET_FILTER_ICD:
      return { ...state, filterICD: action.filterICD };
    case actionTypes.SET_UNNAMED_FILE_COUNTER:
      return { ...state, unnamedCounter: action.unnamedCounter };
    default:
      return state;
  }
};

export default reducer;
