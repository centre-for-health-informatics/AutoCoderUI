import React, { useState } from "react";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import * as tagTypes from "../TagManagement/tagTypes";
import * as APIUtility from "../../Util/API";
import { List, ListItem, makeStyles, Collapse, IconButton, Button } from "@material-ui/core";
import { AddCircleOutline, RemoveCircleOutline } from "@material-ui/icons";

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1)
  },
  root: {
    padding: theme.spacing(0.5)
  },
  nested: {
    paddingLeft: theme.spacing(5)
  }
}));

const FileHistory = props => {
  const classes = useStyles();
  const [isExpanded, setExpanded] = React.useState(false);

  // returns bold for the currently selected file, normal otherwise
  const getFontWeightFile = index => {
    if (index === props.fileIndex) {
      return "bold";
    }
    return "normal";
  };

  // returns bold for the currently selected version, normal otherwise
  const getFontWeightVersion = index => {
    if (index === props.versionIndex) {
      return "bold";
    }
    return "normal";
  };

  const getAnnotationsForFile = () => {
    const options = {
      method: "GET"
    };

    APIUtility.API.makeAPICall(
      APIUtility.GET_ANNOTATIONS_FILENAME_USER,
      props.annotationsList[props.index].name,
      options
    )
      .then(response => response.json())
      .then(data => {
        let dataVersions = [];
        let isThereCurrent = false;
        for (let version of data) {
          console.log("version", version);
          // if version isn't the current one
          if (version.data.sessionId !== props.sessionId) {
            dataVersions.push(version);
            // for the current version
          } else {
            isThereCurrent = true;
            props.setCurrentSections(version.data[tagTypes.SECTIONS]);
            props.setSections(version.data[tagTypes.SECTIONS]);
            props.setCurrentEntities(version.data[tagTypes.ENTITIES]);
            props.setEntities(version.data[tagTypes.ENTITIES]);
            props.setCurrentSentences(version.data[tagTypes.SENTENCES]);
            props.setSentences(version.data[tagTypes.SENTENCES]);

            if (props.annotationFocus === tagTypes.SECTIONS) {
              props.setAnnotations(version.data[tagTypes.SECTIONS]);
            } else if (props.annotationFocus === tagTypes.SENTENCES) {
              props.setAnnotations(version.data[tagTypes.SENTENCES]);
            } else {
              props.setAnnotations([
                ...version.data[tagTypes.ENTITIES].filter(annotation => annotation.type === props.annotationFocus)
              ]);
            }
          }
        }
        if (!isThereCurrent) {
          props.setCurrentSections([]);
          props.setSections([]);
          props.setCurrentEntities([]);
          props.setEntities([]);
          props.setCurrentSentences([]);
          props.setSentences([]);
          props.setAnnotations([]);
        }

        props.setVersions(dataVersions);
        props.setVersionIndex(dataVersions.length);
      })
      .catch(error => {
        console.log("ERROR:", error);
      });
  };

  const switchVersion = (version, newIndex, oldIndex) => {
    if (newIndex === oldIndex) {
      return;
    }
    props.setVersionIndex(newIndex);
    // switching to something other than current
    if (newIndex !== props.versions.length) {
      props.setEntities(version.data[tagTypes.ENTITIES]);
      props.setSections(version.data[tagTypes.SECTIONS]);
      props.setSentences(version.data[tagTypes.SENTENCES]);
      props.setAnnotations(version.data[props.annotationFocus]);
      props.setAnnotationFocus(props.annotationFocus);
      // switching to current
    } else {
      props.setEntities(props.currentEntities);
      props.setSections(props.currentSections);
      props.setSentences(props.currentSentences);
      if (props.annotationFocus === tagTypes.SECTIONS) {
        props.setAnnotations(props.currentSections);
      } else if (props.annotationFocus === tagTypes.SENTENCES) {
        props.setAnnotations(props.currentSentences);
      } else {
        props.setAnnotations([
          ...props.currentEntities.filter(annotation => annotation.type === props.annotationFocus)
        ]);
      }
    }
  };

  const continueFromVersion = () => {
    if (window.confirm("Are you sure? This will overwrite your current annotations.")) {
      props.setCurrentSections(props.sections).then(() => {
        props.setCurrentEntities(props.entities).then(() => {
          props.setCurrentSentences(props.sentences).then(state => {
            props.saveAnnotations(state);
          });
        });
      });
      props.setVersionIndex(props.versions.length);
    } else {
      // do nothing
    }
  };

  const showHistory = () => {
    return props.versions.map((version, index) => (
      <ListItem
        className={classes.nested}
        button
        key={version.updated}
        onClick={() => {
          switchVersion(version, index, props.versionIndex);
        }}
        style={{ fontWeight: getFontWeightVersion(index) }}
      >
        {version.updated}
        {index === props.versionIndex ? (
          <Button
            onClick={() => {
              continueFromVersion();
            }}
            variant="contained"
            color="default"
            className={classes.button}
            size="small"
            style={{ fontSize: "70%" }}
          >
            Continue
          </Button>
        ) : null}
      </ListItem>
    ));
  };

  return (
    <div className={classes.root}>
      <ListItem
        button
        key={props.file.name}
        onClick={() => {
          if (props.index === props.fileIndex) {
            setExpanded(!isExpanded);
          } else {
            getAnnotationsForFile();
            setExpanded(false);
            props.switchFile(props.index);
          }
        }}
        style={{ fontWeight: getFontWeightFile(props.index) }}
      >
        {props.file.name}
        {props.fileIndex === props.index &&
          (isExpanded ? (
            <IconButton edge="end" aria-label="Collapse">
              <RemoveCircleOutline />
            </IconButton>
          ) : (
            <IconButton edge="end" aria-label="Expand">
              <AddCircleOutline />
            </IconButton>
          ))}
      </ListItem>

      {isExpanded && props.fileIndex === props.index && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List dense disablePadding>
            {showHistory()}
            <ListItem
              className={classes.nested}
              button
              key="current"
              onClick={() => {
                switchVersion(null, props.versions.length, props.versionIndex);
              }}
              style={{ fontWeight: getFontWeightVersion(props.versions.length) }}
            >
              Current
            </ListItem>
          </List>
        </Collapse>
      )}
    </div>
  );
};

const mapStateToProps = state => {
  return {
    fileIndex: state.fileViewer.fileIndex,
    annotationsList: state.fileViewer.annotationsList,
    sessionId: state.fileViewer.sessionId,
    annotations: state.fileViewer.annotations,
    sections: state.fileViewer.sections,
    sentences: state.fileViewer.sentences,
    entities: state.fileViewer.entities,
    currentEntities: state.fileViewer.currentEntities,
    currentSections: state.fileViewer.currentSections,
    currentSentences: state.fileViewer.currentSentences,
    versions: state.fileViewer.versions,
    versionIndex: state.fileViewer.versionIndex,
    sessionId: state.fileViewer.sessionId,
    annotationFocus: state.fileViewer.annotationFocus
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setAnnotationFocus: annotationFocus => dispatch(actions.setAnnotationFocus(annotationFocus)),
    setAnnotations: annotations => dispatch(actions.setAnnotations(annotations)),
    setSections: sections => dispatch(actions.setSections(sections)),
    setSentences: sentences => dispatch(actions.setSentences(sentences)),
    setEntities: entities => dispatch(actions.setEntities(entities)),
    setCurrentEntities: currentEntities => dispatch(actions.setCurrentEntitiesWithCallback(currentEntities)),
    setCurrentSections: currentSections => dispatch(actions.setCurrentSectionsWithCallback(currentSections)),
    setCurrentSentences: currentSentences => dispatch(actions.setCurrentSentencesWithCallback(currentSentences)),
    setVersions: versions => dispatch(actions.setVersions(versions)),
    setVersionIndex: versionIndex => dispatch(actions.setVersionIndex(versionIndex))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FileHistory);
