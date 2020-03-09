import React, { useState } from "react";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import * as tagTypes from "../TagManagement/tagTypes";
import * as APIUtility from "../../Util/API";
import * as utility from "../../Util/utility";
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
  const [fileInfo, setFileInfo] = React.useState({});
  const showAPIButton = process.env.REACT_APP_USE_SPACY_API.toLowerCase() === "true";

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

  // adds tags to tagTemplates when loading versions from database
  const addNewTags = data => {
    const newTags = [];
    for (let version of data) {
      const tagTemplates = Array.from(version.data.tagTemplates);
      for (let tag of tagTemplates) {
        newTags.push(tag);
      }
    }
    props.addNewTags(newTags);
  };

  // retrieves all annotation versions for a file after selecting it
  const getAnnotationsForFile = () => {
    return new Promise((resolve, reject) => {
      const options = {
        method: "GET"
      };
      // API call to get back all annotations for a specific file for a specific user
      APIUtility.API.makeAPICall(
        APIUtility.GET_ANNOTATIONS_FILENAME_USER,
        props.annotationsList[props.index].name,
        options
      )
        .then(response => response.json())
        .then(data => {
          // adding tags from all versions
          addNewTags(data);
          let dataVersions = [];
          let isThereCurrent = false; // boolean as to whether there is current annotations for the file
          for (let version of data) {
            props.setLinkedPointers(version.data[tagTypes.ENTITIES]);

            // if version isn't the current one
            if (version.data.sessionId !== props.sessionId) {
              dataVersions.push(version);
              // for the current version
            } else {
              isThereCurrent = true; // setting current to true
              // setting version data to current
              props.setCurrentEntities(version.data[tagTypes.ENTITIES]);
              props.setEntities(version.data[tagTypes.ENTITIES]);
              props.setCurrentSentences(version.data[tagTypes.SENTENCES]);
              props.setSentences(version.data[tagTypes.SENTENCES]);

              // setting the appropriate annotations to be displayed
              if (props.annotationFocus === tagTypes.SENTENCES) {
                props.setAnnotations(version.data[tagTypes.SENTENCES]);
              } else {
                props.setAnnotations([
                  ...version.data[tagTypes.ENTITIES].filter(annotation => annotation.type === props.annotationFocus)
                ]);
              }
            }
          }
          // if there is not current annotations, set all annotations to empty
          if (!isThereCurrent) {
            props.setCurrentEntities([]);
            props.setEntities([]);
            props.setCurrentSentences([]);
            props.setSentences([]);
            props.setAnnotations([]);
          }

          // setting versions and index
          props.setVersions(dataVersions);
          props.setVersionIndex(dataVersions.length);
          // resolving the promise in order to continue with next steps (check for matching json, in ManageFiles.js)
          resolve(isThereCurrent);
        })
        .catch(error => {
          console.log("ERROR:", error);
        });
    });
  };

  // switching version of annotations for a file
  const switchVersion = (version, newIndex, oldIndex) => {
    props.setSpansRendered(false);
    if (newIndex === oldIndex) {
      return;
    }
    props.setVersionIndex(newIndex);
    // switching to something other than current
    if (newIndex !== props.versions.length) {
      props.setEntities(version.data[tagTypes.ENTITIES]);
      props.setSentences(version.data[tagTypes.SENTENCES]);
      props.setAnnotations(version.data[props.annotationFocus]);
      if (props.annotationFocus !== tagTypes.ENTITIES) {
        props.setAnnotations(
          version.data[tagTypes.ENTITIES].filter(annotation => annotation.type === props.annotationFocus)
        );
      }
      // switching to current
    } else {
      props.setEntities(props.currentEntities);
      props.setSentences(props.currentSentences);
      // setting appropriate annotations
      if (props.annotationFocus === tagTypes.SENTENCES) {
        props.setAnnotations(props.currentSentences);
      } else {
        props.setAnnotations([
          ...props.currentEntities.filter(annotation => annotation.type === props.annotationFocus)
        ]);
      }
    }
  };

  // continue from a previous version
  const continueFromVersion = () => {
    // prompt the user to confirm that they wish to continue
    if (window.confirm("Are you sure? This will overwrite your current annotations.")) {
      // set current annotations and then save
      props.setCurrentEntities(props.entities).then(() => {
        props.setCurrentSentences(props.sentences).then(state => {
          props.saveAnnotations(state);
        });
      });
      props.setVersionIndex(props.versions.length);
    }
  };

  // reads a file when it is selected from the list of uploaded files
  const switchFile = (index, isThereCurrent) => {
    const file = props.txtList[index];
    if (file) {
      // if empty, check for uploaded json
      if (!isThereCurrent) {
        for (let jsonFile of props.jsonList) {
          // matching json found
          if (jsonFile.name.substring(0, jsonFile.name.length - 17) === file.name.substring(0, file.name.length - 4)) {
            // read json file and assign annotations
            props.addAnnotationsFromJson(jsonFile);
            break;
          }
        }
      }

      // creating fileData - used to call API
      let fileData = {};
      let fileReader = new FileReader();
      fileReader.readAsText(file);
      fileReader.onloadend = () => {
        let text = fileReader.result.replace(/\r\n/g, "\n"); // Replaces \r\n with \n for Windows OS
        fileData.content = text;
        props.setFileText(text);

        fileData.filename = file.name;
        let ext = file.name.split(".")[file.name.split(".").length - 1];
        if (ext === "txt") {
          fileData.format = "plain_text";
        } else if (ext === "rtf") {
          fileData.format = "rich_text";
        } else {
          fileData.format = "other";
        }
        setFileInfo(fileData);
      };
    }
  };

  // shows the list of versions of an annotation when the file is expanded
  const showHistory = () => {
    return (
      props.versions
        // sorting versions backwards to have most recent on top
        .sort((a, b) => (a.updated > b.updated ? -1 : 1))
        .map((version, index) => (
          <ListItem
            className={classes.nested}
            button
            key={version.updated}
            onClick={() => {
              switchVersion(version, index, props.versionIndex);
            }}
            style={{ fontWeight: getFontWeightVersion(index) }}
          >
            {"\u2022 " + utility.timeFormat(version.updated, true)}
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
        ))
    );
  };

  return (
    <div className={classes.root}>
      <ListItem
        button
        key={props.file.name}
        onClick={() => {
          if (props.index === props.fileIndex) {
            // if clicking on the selected file, toggle whether it is expanded
            setExpanded(!isExpanded);
          } else {
            // else, change to that file and get annotations (from database or from uploaded json)
            props.setFileIndex(props.index);
            props.setSpacyLoading(false);
            getAnnotationsForFile().then(isThereCurrent => {
              switchFile(props.index, isThereCurrent);
            });
            setExpanded(false);
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
            <ListItem
              className={classes.nested}
              button
              key="current"
              onClick={() => {
                switchVersion(null, props.versions.length, props.versionIndex);
              }}
              style={{ fontWeight: getFontWeightVersion(props.versions.length) }}
            >
              {"\u2022 Current Version"}
              {props.versionIndex === props.versions.length && showAPIButton && (
                <Button
                  onClick={() => {
                    props.callSpacy(fileInfo, props.index);
                  }}
                  variant="contained"
                  color="default"
                  className={classes.button}
                  size="small"
                  style={{ fontSize: "70%", textTransform: "none" }}
                >
                  A.I.
                </Button>
              )}
            </ListItem>
            {showHistory()}
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
    sentences: state.fileViewer.sentences,
    entities: state.fileViewer.entities,
    currentEntities: state.fileViewer.currentEntities,
    currentSentences: state.fileViewer.currentSentences,
    versions: state.fileViewer.versions,
    versionIndex: state.fileViewer.versionIndex,
    annotationFocus: state.fileViewer.annotationFocus,
    txtList: state.fileViewer.txtList,
    jsonList: state.fileViewer.jsonList
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setAnnotations: annotations => dispatch(actions.setAnnotations(annotations)),
    setSentences: sentences => dispatch(actions.setSentences(sentences)),
    setEntities: entities => dispatch(actions.setEntities(entities)),
    setCurrentEntities: currentEntities => dispatch(actions.setCurrentEntitiesWithCallback(currentEntities)),
    setSpansRendered: spansRendered => dispatch(actions.setSpansRendered(spansRendered)),
    setCurrentSentences: currentSentences => dispatch(actions.setCurrentSentencesWithCallback(currentSentences)),
    setVersions: versions => dispatch(actions.setVersions(versions)),
    setVersionIndex: versionIndex => dispatch(actions.setVersionIndex(versionIndex)),
    setFileIndex: fileIndex => dispatch(actions.setFileIndex(fileIndex)),
    setFileText: fileText => dispatch(actions.setFileText(fileText)),
    setSpacyLoading: isSpacyLoading => dispatch(actions.setSpacyLoading(isSpacyLoading))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FileHistory);
