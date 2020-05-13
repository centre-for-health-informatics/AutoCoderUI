import React from "react";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { List, ListItem, Typography, Modal, Backdrop, Fade, Button } from "@material-ui/core/";
import * as actions from "../../Store/Actions/index";
import * as tagTypes from "../TagManagement/tagTypes";
import * as util from "./utility";
import { addDotToCode } from "../../Util/icdUtility";
import CustomMuiChip from "../CustomMuiChip/CustomMuiChip";
import DoneIcon from "@material-ui/icons/Done";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import SearchBox from "../TagManagement/SearchBox";
import { getWindowSize } from "../../Util/windowSizeBracket";
import useWindowResize from "../../Util/resizer";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  listItem: {},
  textSpan: {},
  tags: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    "& > *": {
      margin: theme.spacing(0.5),
    },
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const AnnotationEditor = (props) => {
  const classes = useStyles();

  const [modalOpen, setModalOpen] = React.useState(false);
  const windowWidth = useWindowResize()[0];

  const modalWidth = { xs: "95%", sm: "60%", md: "70%", lg: "70%", xl: "70%" };

  const getChartWidth = () => {
    const size = getWindowSize(windowWidth);

    switch (size) {
      case "xs":
        return modalWidth.xs;
      case "sm":
        return modalWidth.sm;
      case "md":
        return modalWidth.md;
      case "lg":
        return modalWidth.lg;
      case "xl":
        return modalWidth.xl;
      default:
        return "100%";
    }
  };

  const handleRemoveLabel = (annotation) => {
    props.removeAnnotation(annotation);
  };

  /**
   * Helper function for generateListItemData()
   * Given the the start char number, end char number, and a list of objects that has same attributes of "start" and "end"
   * returns the next object from the list if it has identical start and end values
   */
  const findDuplicateSingleTextInterval = (start, end, arr) => {
    for (let i = 0; i < arr.length; i++) {
      const spans = arr[i].spans;
      for (let j = 0; j < spans.length; j++) {
        const span = spans[j];

        if (span.start === start && span.end === end) {
          return arr[i];
        }
      }
    }
    return null;
  };

  /**
   * Given an list item data object which consist of
   */
  const findDuplicateMultiPartAnnotation = (textInterval, arr) => {
    for (const item of arr) {
      if (item.spans.length === textInterval.spans.length) {
        // only compare each set of text span if the sets are different in length

        for (let i = 0; i < item.spans.length; i++) {
          // finds unmatching start or end numbers
          if (item.spans[i].start !== textInterval.spans[i].start || item.spans[i].end !== textInterval.spans[i].end) {
            continue;
          } else if (i === item.spans.length - 1) {
            // finds the identical set of text spans
            return item;
          }
        }
      }
    }
    return null;
  };

  /**
   * Generates list data to populate AnnotationEditor from annotation data
   * Returns a list of unique text spans consisting of:
   * - spans: [] list of text spans in form of {"start, "end"}
   * - ref: [] list of references to the original annotation object
   * - labels: list of objects {"tag", "color"}, corresponding to the list of ref
   */
  const generateListItemData = () => {
    const uniqueTextIntervals = [];
    for (let i = 0; i < props.itemsToEdit.length; i++) {
      if (props.itemsToEdit[i].next !== undefined) {
        // Handle multi-part labels, find and add head item of the multi-part label
        const newMultiPartTextInterval = getMultiPartLabelHeadItemData(props.itemsToEdit[i]); // creates a new multipart data item
        const duplicateMultiTextInterval = findDuplicateMultiPartAnnotation(
          newMultiPartTextInterval,
          uniqueTextIntervals
        ); // looks for duplicate

        if (duplicateMultiTextInterval === null) {
          // no duplicate found, add to uniqueTextSpans
          uniqueTextIntervals.push(newMultiPartTextInterval);
        } else {
          duplicateMultiTextInterval.labels.push({
            tag: newMultiPartTextInterval.labels[0].tag,
            color: newMultiPartTextInterval.labels[0].color,
          });
        }
      } else {
        // handle single-part labels
        let spanAlreadyExist = findDuplicateSingleTextInterval(
          props.itemsToEdit[i].start,
          props.itemsToEdit[i].end,
          uniqueTextIntervals
        );

        if (spanAlreadyExist === null) {
          // If span doesnt exist in the array yet, add it
          uniqueTextIntervals.push(makeListItemDataFromAnnotation(props.itemsToEdit[i]));
        } else {
          // item already exist, add to the item's colors and tags lists
          spanAlreadyExist.labels.push({ tag: props.itemsToEdit[i].tag, color: getColor(props.itemsToEdit[i]) });
          spanAlreadyExist.ref.push(props.itemsToEdit[i]);
        }
      }
    }

    return uniqueTextIntervals;
  };

  /**
   * Creates an data item using annotation
   */
  const makeListItemDataFromAnnotation = (annot) => {
    return {
      spans: [{ start: annot.start, end: annot.end }],
      ref: [annot],
      labels: [{ tag: annot.tag, color: getColor(annot) }],
    };
  };

  // gets the color for an annotation
  const getColor = (annotation) => {
    if (props.annotationFocus === tagTypes.SENTENCES) {
      if (props.sentences.indexOf(annotation) % 2 === 0) {
        return util.alternatingColors[0];
      } else {
        return util.alternatingColors[1];
      }
    }
    const tagTemplates = Array.from(props.tagTemplates);
    for (let tag of tagTemplates) {
      if (annotation.tag === tag.id && annotation.type === tag.type) {
        return tag.color;
      }
    }
  };

  /**
   * Given an annotation item from part of a multi-part label, returns the annotation item data
   */
  const getMultiPartLabelHeadItemData = (annot) => {
    // Creates a data item using the head annotation
    const textIntervalDataItem = makeListItemDataFromAnnotation(annot);

    // Add subsequent parts of the multipart annotation to the data item
    let cursor = annot.next;
    while (cursor !== undefined) {
      textIntervalDataItem.spans.push({
        start: cursor.start,
        end: cursor.end,
      });
      cursor = cursor.next;
    }

    return textIntervalDataItem;
  };

  /**
   * Calls on generateListItemData() to create data for populating list
   * Loops through list in data and generates HTML of a list line item
   * Calls on makeListItemHTML() to generate HTML for chips within the line item
   */
  const makeListHTML = () => {
    const listData = generateListItemData();
    return listData.map((item, index) => (
      <ListItem divider key={"listItem-" + index}>
        <div className={classes.textSpan}>{makeTextSpan(item)}</div>
        <div className={classes.tags}>{makeListItemHTML(item)}</div>
      </ListItem>
    ));
  };

  /**
   * Creates the text span to be displayed within the list item.
   * item should be an object with following attributes:
   * - spans: [{start, end}]
   * - ref: [{start, end, color, tag, text, next*, prev*}]
   * - labels: [{tag, color}]
   */
  const makeTextSpan = (item) => {
    let text = "";
    item.spans.forEach((span, index) => {
      text += props.fileViewerText.slice(span.start, span.end);
      if (index < item.spans.length - 1) {
        text += "---";
      }
    });

    return <Typography>{text}</Typography>;
  };

  // changes annotation confirm status from false to true
  const confirmAnnotation = (annotation) => {
    let current = annotation;
    while (current) {
      current.confirmed = true;
      current = current.next;
    }
    props.refresh();
  };

  // modifies annotation
  const modifyAnnotation = (annotation) => {
    setModalOpen(true);
    props.setModifyingAnnotation(annotation);
  };

  /**
   * Returns a list of HTML elements for displaying chips inline within a list item
   */
  const makeListItemHTML = (item) => {
    const chipList = [];
    for (let i = 0; i < item.labels.length; i++) {
      chipList.push(
        <CustomMuiChip
          key={"chipItem-" + item.labels[i].tag + Math.random()}
          variant="outlined"
          size="small"
<<<<<<< HEAD
          label={props.annotationFocus === tagTypes.ICD ? addDotToCode(item.labels[i].tag) : item.labels[i].tag}
=======
          label={item.labels[i].tag}
          deleteIcon={<DeleteIcon />}
>>>>>>> 1045deb308e231706c05f05334c95107ac326367
          onDelete={() => handleRemoveLabel(item.ref[i])}
          confirmIcon={item.ref[i].confirmed ? null : <DoneIcon />}
          onConfirm={() => {
            confirmAnnotation(item.ref[i]);
          }}
          modifyIcon={
            props.annotationFocus !== tagTypes.TOKENS && props.annotationFocus !== tagTypes.SENTENCES ? (
              <EditIcon />
            ) : null
          }
          onModify={() => {
            modifyAnnotation(item.ref[i]);
          }}
          style={{ backgroundColor: item.labels[i].color }}
        />
      );
    }
    return chipList;
  };

  const changeAnnotation = () => {
    if (props.modifyingAnnotation && props.addingTags) {
      props.modifyingAnnotation.tag = props.addingTags[0].id;
      setModalOpen(false);

      // necessary to update legend
      const focus = props.annotationFocus;
      props.setAnnotationFocus("");
      props.setAnnotationFocus(focus);
    }
    confirmAnnotation(props.modifyingAnnotation);
  };

  return (
    <React.Fragment>
      <List className={classes.root} dense disablePadding>
        {makeListHTML()}
      </List>
      <Modal
        className={classes.modal}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={modalOpen}>
          <div className={classes.paper} style={{ width: getChartWidth(), display: "flex", flexDirection: "row" }}>
            <SearchBox />
            <Button
              onClick={changeAnnotation}
              variant="contained"
              color="default"
              className={classes.button}
              size="small"
              style={{ fontSize: "70%" }}
            >
              Change
            </Button>
          </div>
        </Fade>
      </Modal>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    fileViewerText: state.fileViewer.fileViewerText,
    annotations: state.fileViewer.annotations,
    tagTemplates: state.fileViewer.tagTemplates,
    annotationFocus: state.fileViewer.annotationFocus, // the currently active type
    addingTags: state.tagManagement.addingTags, // the currently active tag
    sentences: state.fileViewer.sentences,
    tokens: state.fileViewer.tokens,
    entities: state.fileViewer.entities,
    modifyingAnnotation: state.fileViewer.modifyingAnnotation,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setAnnotationFocus: (focus) => dispatch(actions.setAnnotationFocus(focus)),
    setAddingTags: (tags) => dispatch(actions.setAddingTags(tags)),
    setModifyingAnnotation: (modifyingAnnotation) => dispatch(actions.setModifyingAnnotation(modifyingAnnotation)),
    setAnnotations: (annotations) => dispatch(actions.setAnnotations(annotations)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AnnotationEditor);
