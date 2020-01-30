import React from "react";
import { connect } from "react-redux";
import { Switch, FormControlLabel } from "@material-ui/core";
import * as actions from "../../Store/Actions/index";
import * as tagTypes from "../TagManagement/tagTypes";

const GeneralSettings = props => {
  // changes whether spacy is active or not
  const handleSetSentencesAvailable = () => {
    if (props.areSentencesAvailable && props.annotationFocus === tagTypes.SENTENCES) {
      props.setAnnotationFocus("");
    }
    props.setSentencesAvailable(!props.areSentencesAvailable);
  };

  return (
    <FormControlLabel
      style={{ paddingLeft: 10 }}
      control={
        <Switch
          size="small"
          color="primary"
          checked={props.areSentencesAvailable}
          onChange={handleSetSentencesAvailable}
        />
      }
      label="Use Sentences"
    />
  );
};

const mapStateToProps = state => {
  return {
    areSentencesAvailable: state.fileViewer.sentencesAvailable,
    annotationFocus: state.fileViewer.annotationFocus
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setSentencesAvailable: areSentencesAvailable => dispatch(actions.setSentencesAvailable(areSentencesAvailable)),
    setAnnotationFocus: annotationFocus => dispatch(actions.setAnnotationFocus(annotationFocus))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GeneralSettings);
