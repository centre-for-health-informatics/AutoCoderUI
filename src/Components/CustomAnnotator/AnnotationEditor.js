import React from "react";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Chip from "@material-ui/core/Chip";
import Typography from "@material-ui/core/Typography";
import * as actions from "../../Store/Actions/index";
import * as tagTypes from "../TagManagement/tagTypes";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper
  },
  listItem: {},
  textSpan: {},
  tags: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    "& > *": {
      margin: theme.spacing(0.5)
    }
  }
}));

const AnnotationEditor = props => {
  const classes = useStyles();

  const handleRemoveLabel = (start, end, tag) => {
    //TODO: call function to remove a label
    console.log("Please remove: " + tag, start, end);
  };

  const findSameTextSpan = (start, end, arr) => {
    for (let i = 0; i < arr.length; i++) {
      if (start === arr[i].start && end === arr[i].end) {
        return arr[i];
      }
    }
    return null;
  };

  const generateListItemData = () => {
    const uniqueTextSpans = [];
    let currentItem;

    for (let i = 0; i < props.itemsToEdit.length; i++) {
      let spanAlreadyExist = findSameTextSpan(props.itemsToEdit[i].start, props.itemsToEdit[i].end, uniqueTextSpans);
      // If span doesnt exist in the array yet, add it
      if (spanAlreadyExist === null) {
        currentItem = {
          ref: props.itemsToEdit[i],
          start: props.itemsToEdit[i].start,
          end: props.itemsToEdit[i].end,
          labels: [{ tag: props.itemsToEdit[i].tag, color: props.itemsToEdit[i].color }]
        };
        uniqueTextSpans.push(currentItem);
      } else {
        // item already exist, add to the item's colors and tags lists
        spanAlreadyExist.labels.push({ tag: props.itemsToEdit[i].tag, color: props.itemsToEdit[i].color });
      }
    }
    return uniqueTextSpans;
  };

  const makeListHTML = () => {
    const listData = generateListItemData();

    return listData.map(item => (
      <ListItem divider key={"listItem-" + item.start + "-" + item.end}>
        <div className={classes.textSpan}>
          <Typography>{props.fileViewerText.slice(item.start, item.end)}</Typography>
        </div>
        <div className={classes.tags}>{makeListItemHTML(item.start, item.end, item.labels)}</div>
      </ListItem>
    ));
  };

  const makeListItemHTML = (start, end, tags) => {
    return tags.map(item => (
      <Chip
        key={"chipItem-" + item.tag}
        variant="outlined"
        size="small"
        label={item.tag}
        onDelete={() => handleRemoveLabel(start, end, item.tag)}
        style={{ backgroundColor: item.color }}
      />
    ));
  };

  return (
    <List className={classes.root} dense disablePadding>
      {makeListHTML()}
    </List>
  );
};

const mapStateToProps = state => {
  return {
    fileViewerText: state.fileViewer.fileViewerText,
    annotations: state.fileViewer.annotations,
    tagTemplates: state.fileViewer.tagTemplates,
    annotationFocus: state.fileViewer.annotationFocus, // the currently active type
    addingTags: state.tagManagement.addingTags, // the currently active tag
    sections: state.fileViewer.sections,
    sentences: state.fileViewer.sentences,
    tokens: state.fileViewer.tokens,
    entities: state.fileViewer.entities
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setAddingTags: tags => dispatch(actions.setAddingTags(tags)),
    setAnnotationFocus: annotationFocus => dispatch(actions.setAnnotationFocus(annotationFocus)),
    setAnnotations: annotations => dispatch(actions.setAnnotations(annotations))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AnnotationEditor);
