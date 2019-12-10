import React, { useEffect } from "react";
import * as APIUtility from "../../Util/API";
import { connect } from "react-redux";
import { Button, Switch, FormControlLabel } from "@material-ui/core";
import * as actions from "../../Store/Actions/index";
import * as templateTags from "../TagManagement/defaultTags";
import * as tagTypes from "../TagManagement/tagTypes";
import getColors from "../../Util/colorMap";
import LoadingIndicator from "../../Components/LoadingIndicator/LoadingIndicator";
import CustomAnnotator from "../../Components/CustomAnnotator/CustomAnnotator";
import { makeStyles } from "@material-ui/core/styles";

const FileViewer = props => {
  const setDefaultTagTemplate = () => {
    props.setTagTemplates(templateTags.DEFAULTS);
  };

  setDefaultTagTemplate();

  APIUtility.API.makeAPICall(APIUtility.GET_SECTIONS).then(response => response.json());

  useEffect(() => {
    mapColors();
  }, [props.tagTemplates]);

  const mapColors = () => {
    const tagsWithoutColors = [];
    for (let tag of props.tagTemplates) {
      if (tag.color === undefined || tag.color === "") {
        tagsWithoutColors.push(tag);
      }
    }
    const newColors = getColors(tagsWithoutColors.length);
    for (let i = 0; i < tagsWithoutColors.length; i++) {
      tagsWithoutColors[i].color = newColors[i];
    }
  };

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
    alternatingColors: state.fileViewer.alternatingColors,
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
    // setICDCodes: icdCodes => dispatch
    setSpacyLoading: spacyLoading => dispatch(actions.setSpacyLoading(spacyLoading)),
    setSpacyActive: spacyActive => dispatch(actions.setSpacyActive(spacyActive)),
    setAnnotations: annotations => dispatch(actions.setAnnotations(annotations)),
    setAnnotationFocus: annotationFocus => dispatch(actions.setAnnotationFocus(annotationFocus)),
    setTagTemplates: tagTemplates => dispatch(actions.setTagTemplates(tagTemplates)),
    setFileReference: fileReference => dispatch(actions.setFileReference(fileReference)),
    setSnapToWord: snapToWord => dispatch(actions.setSnapToWord(snapToWord)),
    setSectionsInUse: sectionsInUse => dispatch(actions.setSectionsInUse(sectionsInUse)),
    updateLegendAfterLoadingSpacy: data => dispatch(actions.updateLegendAfterLoadingSpacy(data))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FileViewer);
