import React from "react";
import { connect } from "react-redux";
import * as tagTypes from "../TagManagement/tagTypes";
import * as actions from "../../Store/Actions/index";
import Chip from "@material-ui/core/Chip";

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

  const makeChipList = itemsInUse => {
    const chipList = [];
    for (let item of itemsInUse) {
      chipList.push(
        <Chip
          key={"chip-" + item}
          variant="outlined"
          clickable={true}
          size="small"
          label={getLabel(item)}
          style={{ backgroundColor: getColor(item), fontWeight: getFontWeight(item) }}
          onClick={() => handleChipClick(item)}
        />
      );
    }
    return chipList;
  };

  const getLabel = item => {
    let tagToLabel;
    for (let tag of props.tagTemplates) {
      if (item === tag.id) {
        tagToLabel = tag;
        break;
      }
    }
    if (tagToLabel.description) {
      return tagToLabel.id + ": " + tagToLabel.description;
    }
    return tagToLabel.id;
  };

  const getFontWeight = item => {
    if (props.addingTags[0] && props.addingTags[0].id === item) {
      return "bold";
    }
    return "normal";
  };

  const handleChipClick = item => {
    let tagToSelect;
    for (let tag of props.tagTemplates) {
      if (item === tag.id) {
        tagToSelect = tag;
        break;
      }
    }
    props.setAddingTags([tagToSelect]);
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
    addingTags: state.tagManagement.addingTags,
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
    setAddingTags: tags => dispatch(actions.setAddingTags(tags)),
    setAnnotationFocus: annotationFocus => dispatch(actions.setAnnotationFocus(annotationFocus))
    //   setAnnotations: annotations => dispatch(actions.setAnnotations(annotations))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Legend);
