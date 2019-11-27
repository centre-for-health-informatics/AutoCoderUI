import React from "react";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Chip from "@material-ui/core/Chip";
import Divider from "@material-ui/core/Divider";
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

  const handleRemoveTag = () => {};

  const generateListItems = () => {
    // for (let i = 0; i < props.itemsToEdit.length; i++) {

    // }

    return props.itemsToEdit.map(item => {
      console.log("make item");
      console.log(item);
      return (
        <ListItem divider>
          <div className={classes.textSpan}>
            <ListItemText primary={props.fileViewerText.slice(item.start, item.end)} />
          </div>

          <div className={classes.tags}>
            <Chip
              variant="outlined"
              size="small"
              label={item.tag}
              onDelete={handleRemoveTag}
              style={{ backgroundColor: item.color }}
            />
            <Chip variant="outlined" size="small" label="tag2" onDelete={handleRemoveTag} />
          </div>
        </ListItem>
      );
    });
  };

  const generateTagChips = () => {};

  return (
    <List className={classes.root} dense disablePadding>
      <ListItem divider>
        <div className={classes.textSpan}>
          <ListItemText primary="annotated text" />
        </div>

        <div className={classes.tags}>
          <Chip
            variant="outlined"
            size="small"
            label="tag1"
            onDelete={handleRemoveTag}
            style={{ backgroundColor: "#32a852" }}
          />
          <Chip variant="outlined" size="small" label="tag2" onDelete={handleRemoveTag} />
        </div>
      </ListItem>

      {generateListItems()}
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
