export { setAlertMessage } from "./alert";
export { setIsAuthorized, setIsServerDown } from "./authentication";
export {
  setFileText,
  setSections,
  setSentences,
  setTokens,
  setEntities,
  setSpacyLoading,
  setAnnotationFocus,
  setAnnotations,
  setTagTemplates,
  setFileReference,
  setAlternatingColors,
  setLinkedListAdd,
  setIntervalDivHeight,
  setIntervalDivWidth,
  setAnnotationsToEdit,
  setSpacyActive,
  setSnapToWord,
  setSectionsInUse,
  setEntitiesInUse,
  setAddingCustomTag,
  setSpansRendered
} from "./fileViewer";
export {
  setUploadedTags,
  enableTagByIndex,
  disableTagByIndex,
  enableAllTags,
  disableAllTags,
  setAddingTags,
  setInitialTagsAdded
} from "./tagManagement";
export { updateLegendAfterLoadingSpacy, setTagTemplatesWithCallback } from "./asyncActions";
