import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Switch, FormControlLabel } from "@material-ui/core";
import * as actions from "../../Store/Actions/index";
import LoadingIndicator from "../../Components/LoadingIndicator/LoadingIndicator";
import CustomAnnotator from "../../Components/CustomAnnotator/CustomAnnotator";

const FileViewer = props => {
  const renderCustomAnnotator = () => {
    if (props.spacyLoading) {
      return <LoadingIndicator />;
    }
    return <CustomAnnotator />;
  };

  return (
    <div>
      <div>
        <FormControlLabel
          control={
            <Switch
              size="small"
              color="primary"
              checked={props.snapToWord}
              onChange={() => {
                props.setSnapToWord(!props.snapToWord);
              }}
            />
          }
          label="Snap to Whole Word"
        />
      </div>
      <div id="docDisplay" style={{ whiteSpace: "pre-wrap" }}>
        {renderCustomAnnotator()}
      </div>
    </div>
  );
};

// TODO: remove unnecessary props (from functionality being moved to other components)
const mapStateToProps = state => {
  return {
    textToDisplay: state.fileViewer.fileViewerText,
    sections: state.fileViewer.sections,
    sentences: state.fileViewer.sentences,
    tokens: state.fileViewer.tokens,
    entities: state.fileViewer.entities,
    // icdCodes:
    spacyActive: state.fileViewer.spacyActive,
    spacyLoading: state.fileViewer.spacyLoading,
    tagTemplates: state.fileViewer.tagTemplates,
    snapToWord: state.fileViewer.snapToWord,
    sectionsInUse: state.fileViewer.sectionsInUse
  };
};

// TODO: remove unnecessary props (from functionality being moved to other components)
const mapDispatchToProps = dispatch => {
  return {
    setFileText: text => dispatch(actions.setFileText(text)),
    setSections: sections => dispatch(actions.setSections(sections)),
    setSentences: sentences => dispatch(actions.setSentences(sentences)),
    setTokens: tokens => dispatch(actions.setTokens(tokens)),
    setEntities: entities => dispatch(actions.setEntities(entities)),
    setSpacyLoading: spacyLoading => dispatch(actions.setSpacyLoading(spacyLoading)),
    setSpacyActive: spacyActive => dispatch(actions.setSpacyActive(spacyActive)),
    setAnnotations: annotations => dispatch(actions.setAnnotations(annotations)),
    setAnnotationFocus: annotationFocus => dispatch(actions.setAnnotationFocus(annotationFocus)),
    setTagTemplates: tagTemplates => dispatch(actions.setTagTemplates(tagTemplates)),
    setFileReference: fileReference => dispatch(actions.setFileReference(fileReference)),
    setSnapToWord: snapToWord => dispatch(actions.setSnapToWord(snapToWord)),
    setSectionsInUse: sectionsInUse => dispatch(actions.setSectionsInUse(sectionsInUse)),
    updateAnnotationsAfterLoadingSpacy: data => dispatch(actions.updateAnnotationsAfterLoadingSpacy(data))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FileViewer);
