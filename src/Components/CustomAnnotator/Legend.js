import React from "react";
import { connect } from "react-redux";
import * as tagTypes from "../TagManagement/tagTypes";
import List from "@material-ui/core/List";
import * as actions from "../../Store/Actions/index";
import ListItem from "@material-ui/core/ListItem";

const Legend = props => {
  const makeLegendList = () => {
    if (props.annotationFocus === tagTypes.SECTIONS) {
      return props.sectionsInUse.map(section => (
          // something
      ));
    } else if (props.annotationFocus === tagTypes.ENTITIES) {
      return;
    } else {
      return;
    }
  };

  const getColor = section => {
    for (let tag of props.tagTemplates) {
      if (section === tag.id) {
        return tag.color;
      }
    }
  };

  return (
    <div>
      <List>{makeLegendList()}</List>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    //   fileViewerText: state.fileViewer.fileViewerText,
    //   annotations: state.fileViewer.annotations,
    //   tagTemplates: state.fileViewer.tagTemplates,
    annotationFocus: state.fileViewer.annotationFocus,
    //   addingTags: state.tagManagement.addingTags,
    //   sections: state.fileViewer.sections,
    //   sentences: state.fileViewer.sentences,
    //   tokens: state.fileViewer.tokens,
    //   entities: state.fileViewer.entities
    sectionsInUse: state.fileViewer.sectionsInUse,
    entitiesInUse: state.fileViewer.entitiesInUse,
    tagTemplates: state.fileViewer.tagTemplates
  };
};

const mapDispatchToProps = dispatch => {
  return {
    //   setAddingTags: tags => dispatch(actions.setAddingTags(tags)),
    setAnnotationFocus: annotationFocus => dispatch(actions.setAnnotationFocus(annotationFocus))
    //   setAnnotations: annotations => dispatch(actions.setAnnotations(annotations))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Legend);
