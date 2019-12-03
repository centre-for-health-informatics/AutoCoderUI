import React from "react";
import { connect } from "react-redux";
import * as tagTypes from "../TagManagement/tagTypes";
import List from "@material-ui/core/List";
import * as actions from "../../Store/Actions/index";
import Chip from "@material-ui/core/Chip";
import ListItem from "@material-ui/core/ListItem";
import { isTemplateElement } from "@babel/types";

const Legend = props => {
  const makeLegendList = () => {
    let chipList;
    if (props.annotationFocus === tagTypes.SECTIONS) {
      chipList = makeChipList(props.sectionsInUse);
    } else if (props.annotationFocus === tagTypes.ENTITIES) {
      chipList = makeChipList(props.entitiesInUse);
    } else {
      return;
    }
    return chipList;
  };

  const makeChipList = sectionsInUse => {
    const chipList = [];
    for (let item of sectionsInUse) {
      chipList.push(
        <Chip
          key={"chip-" + item}
          variant="outlined"
          size="small"
          label={item}
          style={{ backgroundColor: getColor(item) }}
        />
      );
    }
    return chipList;
  };

  const getColor = item => {
    for (let tag of props.tagTemplates) {
      if (item === tag.id) {
        return tag.color;
      }
    }
  };

  return <div>{makeLegendList()}</div>;
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
