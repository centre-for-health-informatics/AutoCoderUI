import React from "react";
import { connect } from "react-redux";
import * as tagTypes from "../TagManagement/tagTypes";
import * as actions from "../../Store/Actions/index";
import { Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1)
  }
}));

const CustomTag = props => {
  const classes = useStyles();

  const addCustomTag = () => {
    console.log("hi");
  };

  return (
    <Button onClick={addCustomTag} variant="contained" color="primary" className={classes.button}>
      Add Tag
    </Button>
  );
};

const mapStateToProps = state => {
  return {
    //   fileViewerText: state.fileViewer.fileViewerText,
    //   annotations: state.fileViewer.annotations,
    //   tagTemplates: state.fileViewer.tagTemplates,
    //   annotationFocus: state.fileViewer.annotationFocus,
    //   addingTags: state.tagManagement.addingTags,
    //   sections: state.fileViewer.sections,
    //   sentences: state.fileViewer.sentences,
    //   tokens: state.fileViewer.tokens,
    //   entities: state.fileViewer.entities
    //   sectionsInUse: state.fileViewer.sectionsInUse,
    //   entitiesInUse: state.fileViewer.entitiesInUse,
    //   tagTemplates: state.fileViewer.tagTemplates
  };
};

const mapDispatchToProps = dispatch => {
  return {
    //   setAddingTags: tags => dispatch(actions.setAddingTags(tags)),
    //   setAnnotationFocus: annotationFocus => dispatch(actions.setAnnotationFocus(annotationFocus))
    //   setAnnotations: annotations => dispatch(actions.setAnnotations(annotations))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CustomTag);
