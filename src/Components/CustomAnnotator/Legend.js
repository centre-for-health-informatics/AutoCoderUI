import React from "react";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import { List, Chip, ListItem } from "@material-ui/core";

const Legend = props => {
  // makes the list for the final render
  const makeList = () => {
    const tagsInUse = new Set();
    for (let annotation of props.annotations) {
      if (annotation.tag !== "") {
        tagsInUse.add(annotation.tag);
      }
    }
    const chipList = makeChipList(tagsInUse);
    return chipList.map((chip, index) => <ListItem key={"listItem-" + index}>{chip}</ListItem>);
  };

  // creates the list of chips to be displayed in the legend
  const makeChipList = tagsInUse => {
    const chipList = [];
    for (let item of tagsInUse) {
      chipList.push(
        <Chip
          key={"chip-" + item}
          variant="outlined"
          clickable={true}
          size="small"
          label={getLabel(item, true)}
          style={{ backgroundColor: getColor(item), fontWeight: getFontWeight(item) }}
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
        if (tag.type === props.annotationFocus) {
          if (item === tag.id) {
            tagToLabel = tag;
            break;
          }
        }
      }
      if (tagToLabel.description) {
        return tagToLabel.id + ": " + tagToLabel.description;
      }
    }
    return item;
  };

  // returns bold for currently selected tag, normal otherwise
  const getFontWeight = item => {
    if (props.addingTags[0] && props.addingTags[0].id === item) {
      return "bold";
    }
    return "normal";
  };

  // sets active tag to the chip when clicked
  const handleChipClick = item => {
    let tagToSelect;
    for (let tag of props.tagTemplates) {
      if (item === tag.id && tag.type === props.annotationFocus) {
        tagToSelect = tag;
        break;
      }
    }
    props.setAddingTags([tagToSelect]);
  };

  // gets the colour of the chip by checking tags in store
  const getColor = item => {
    for (let tag of props.tagTemplates) {
      if (item === tag.id && tag.type === props.annotationFocus) {
        return tag.color;
      }
    }
  };

  return (
    <List dense disablePadding>
      {makeList()}
    </List>
  );
};

const mapStateToProps = state => {
  return {
    annotations: state.fileViewer.annotations,
    annotationFocus: state.fileViewer.annotationFocus,
    addingTags: state.tagManagement.addingTags,
    tagTemplates: state.fileViewer.tagTemplates
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setAddingTags: tags => dispatch(actions.setAddingTags(tags))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Legend);
