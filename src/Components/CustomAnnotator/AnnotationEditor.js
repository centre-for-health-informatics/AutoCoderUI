import React from "react";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
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

  const handleRemoveLabel = annotation => {
    //TODO: call function to remove a label
    props.removeAnnotation(annotation);
  };

  /**
   * Helper function for generateListItemData()
   * Given the the start char number, end char number, and a list of objects that has same attributes of "start" and "end"
   * returns the next object from the list if it has identical start and end values
   */
  const findSameTextSpan = (start, end, arr) => {
    for (let i = 0; i < arr.length; i++) {
      if (start === arr[i].start && end === arr[i].end) {
        return arr[i];
      }
    }
    return null;
  };

  /**
   * Generates list data to populate AnnotationEditor from annotation data
   * Returns a list of unique text spans consisting of:
   * - ref: [] list of references to the original annotation object
   * - start: start char number of the text span
   * - end: end char number of the text span
   * - labels: list of objects {"tag", "color"}, corresponding to the list of ref
   */
  const generateListItemData = () => {
    const uniqueTextSpans = [];
    let currentItem;

    for (let i = 0; i < props.itemsToEdit.length; i++) {
      let spanAlreadyExist = findSameTextSpan(props.itemsToEdit[i].start, props.itemsToEdit[i].end, uniqueTextSpans);
      // If span doesnt exist in the array yet, add it
      if (spanAlreadyExist === null) {
        currentItem = {
          ref: [props.itemsToEdit[i]],
          start: props.itemsToEdit[i].start,
          end: props.itemsToEdit[i].end,
          labels: [{ tag: props.itemsToEdit[i].tag, color: props.itemsToEdit[i].color }]
        };
        uniqueTextSpans.push(currentItem);
      } else {
        // item already exist, add to the item's colors and tags lists
        spanAlreadyExist.labels.push({ tag: props.itemsToEdit[i].tag, color: props.itemsToEdit[i].color });
        spanAlreadyExist.ref.push(props.itemsToEdit[i]);
      }
    }
    return uniqueTextSpans;
  };

  /**
   * Calls on generateListItemData() to create data for populating list
   * Loops through list in data and generates HTML of a list line item
   * Calls on makeListItemHTML() to generate HTML for chips within the line item
   */
  const makeListHTML = () => {
    const listData = generateListItemData();

    return listData.map(item => (
      <ListItem divider key={"listItem-" + item.start + "-" + item.end}>
        <div className={classes.textSpan}>
          {makeTextSpan(item)}
          <Typography>{props.fileViewerText.slice(item.start, item.end)}</Typography>
        </div>
        <div className={classes.tags}>{makeListItemHTML(item)}</div>
      </ListItem>
    ));
  };

  /**
   * // TODO:
   * Creates the text span to be displayed within the list item
   */
  const makeTextSpan = item => {
    console.log(item);
  };

  /**
   * Returns a list of HTML elements for displaying chips inline within a list item
   */
  const makeListItemHTML = item => {
    const chipList = [];
    for (let i = 0; i < item.labels.length; i++) {
      chipList.push(
        <Chip
          key={"chipItem-" + item.labels[i].tag}
          variant="outlined"
          size="small"
          label={item.labels[i].tag}
          onDelete={() => handleRemoveLabel(item.ref[i])}
          style={{ backgroundColor: item.labels[i].color }}
        />
      );
    }
    return chipList;
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
