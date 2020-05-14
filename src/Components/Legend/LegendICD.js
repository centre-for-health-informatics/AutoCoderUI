import React from "react";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import { List, Chip, ListItem } from "@material-ui/core";
import * as tagTypes from "../TagManagement/tagTypes";
import { addDotToCode } from "../../Util/icdUtility";

const LegendICD = (props) => {
  // makes the list for the final render
  const makeLists = () => {
    const tagsConfirmed = new Set();
    const tagsUnconfirmed = new Set();
    for (let annotation of props.annotations) {
      if (annotation.tag !== "") {
        if (annotation.confirmed) {
          tagsConfirmed.add(annotation.tag);
        } else {
          tagsUnconfirmed.add(annotation.tag);
        }
      }
    }
    const unconfirmedList = makeChipList(tagsUnconfirmed);
    const confirmedList = makeChipList(tagsConfirmed);
    return [
      unconfirmedList.map((chip, index) => <ListItem key={"listItem-" + index}>{chip}</ListItem>),
      confirmedList.map((chip, index) => <ListItem key={"listItem-" + index}>{chip}</ListItem>),
    ];
  };

  // creates the list of chips to be displayed in the legend
  const makeChipList = (tagsInUse) => {
    const chipList = [];
    for (let item of tagsInUse) {
      chipList.push(
        <Chip
          key={"chip-" + item}
          variant="outlined"
          clickable={true}
          size="small"
          label={getLabel(item, false)}
          style={{ backgroundColor: getColor(item), fontWeight: getFontWeight(item), width: "100%" }}
          onClick={() => handleChipClick(item)}
        />
      );
    }
    return chipList;
  };

  // gets the label for the chip
  // idOnly is whether only the ID will be displayed
  // if false, it will display the id and description (assuming description exists)
  const getLabel = (item, idOnly) => {
    if (!idOnly) {
      let tagToLabel;
      for (let tag of props.tagTemplates) {
        if (tag.type === props.annotationFocus && item === tag.id) {
          tagToLabel = tag;
          break;
        }
      }
      if (tagToLabel && tagToLabel.description) {
        return addDotToCode(tagToLabel.id) + ": " + tagToLabel.description;
      }
    }
    return addDotToCode(item);
  };

  // returns bold for currently selected tag, normal otherwise
  const getFontWeight = (item) => {
    if (props.addingTags[0] && props.addingTags[0].id === item) {
      return "bold";
    }
    return "normal";
  };

  // sets active tag to the chip when clicked
  const handleChipClick = (item) => {
    item = item.replace(".", "");
    let tagToSelect;
    for (let tag of props.tagTemplates) {
      if (item === tag.id && tag.type === props.annotationFocus) {
        tagToSelect = tag;
        break;
      }
    }
    props.setAddingTags([tagToSelect]);
    if (props.filterICD && tagToSelect) {
      const newAnnotations = Array.from(props.entities).filter(
        (annotation) => annotation.tag === tagToSelect.id && annotation.type === tagTypes.ICD
      );
      props.setAnnotations(newAnnotations);
    }
    props.setSelectedCode(tagToSelect.id);
  };

  // gets the colour of the chip by checking tags in store
  const getColor = (item) => {
    for (let tag of props.tagTemplates) {
      if (item === tag.id && tag.type === props.annotationFocus) {
        return tag.color;
      }
    }
  };

  const [unconfirmed, confirmed] = makeLists();

  return (
    <React.Fragment>
      <h4 style={{ paddingLeft: 10 }}>Unconfirmed</h4>
      <List dense disablePadding>
        {unconfirmed}
      </List>
      <h4 style={{ paddingLeft: 10 }}>Confirmed</h4>
      <List dense disablePadding>
        {confirmed}
      </List>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    annotations: state.fileViewer.annotations,
    annotationFocus: state.fileViewer.annotationFocus,
    addingTags: state.tagManagement.addingTags,
    tagTemplates: state.fileViewer.tagTemplates,
    annotationsToEdit: state.fileViewer.annotationsToEdit,
    filterICD: state.fileViewer.filterICD,
    entities: state.fileViewer.entities,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setAddingTags: (tags) => dispatch(actions.setAddingTags(tags)),
    setAnnotations: (annotations) => dispatch(actions.setAnnotations(annotations)),
    setSelectedCode: (selectedCode) => dispatch(actions.setSelectedCode(selectedCode)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LegendICD);
