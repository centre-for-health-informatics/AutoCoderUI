import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import * as APIUtility from "../../Util/API";
import * as actions from "../../Store/Actions/index";
import * as tagTypes from "../TagManagement/tagTypes";
import { List, Button, makeStyles, ListSubheader } from "@material-ui/core";
import { saveAs } from "file-saver";
import FileHistory from "../FileHistory/FileHistory";
import { mapColors, setDefaultTags } from "../../Components/TagManagement/tagUtil";

var JSZip = require("jszip");

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(0.3)
  },
  root: {
    padding: theme.spacing(0.5)
  },
  nested: {
    paddingLeft: theme.spacing(5)
  }
}));

const ManageFiles = props => {
  const classes = useStyles();
  const fileInputRefBrowse = React.createRef();

  // opens file explorer
  const openExplorerBrowse = () => {
    if (props.disabled) {
      return;
    }
    fileInputRefBrowse.current.click();
  };

  // calls API to receive annotations from Spacy
  const callSpacy = (fileData, index) => {
    if (!annotationsEmpty()) {
      if (!window.confirm("Are you sure? This will overwrite your current annotations.")) {
        return;
      }
    }
    props.setSpacyLoading(true);
    const options = {
      method: "POST",
      body: fileData
    };

    let tagTemplates;
    APIUtility.API.makeAPICall(APIUtility.UPLOAD_DOCUMENT, null, options)
      .then(response => response.json())
      .then(data => {
        // setting pointers for next
        setLinkedPointers(data[tagTypes.ENTITIES]);

        // adding to tag templates
        tagTemplates = Array.from(props.tagTemplates);
        let promiseList = [];

        for (let entity of data[tagTypes.ENTITIES]) {
          let duplicateTag = tagTemplates.find(tag => tag.id === entity.tag && tag.type === entity.type);
          if (duplicateTag === undefined) {
            if (entity.type === tagTypes.ICD) {
              promiseList.push(
                // call API to get description for code
                APIUtility.API.makeAPICall(APIUtility.CODE_DESCRIPTION, entity.tag)
                  .then(response => response.json())
                  .then(result => {
                    tagTemplates.push({ id: entity.tag, description: result.description, type: entity.type });
                  })
              );
            } else {
              tagTemplates.push({ id: entity.tag, type: entity.type });
            }
          }
        }

        Promise.all(promiseList).then(() => {
          props.setTagTemplates(tagTemplates);
        });

        props.updateAnnotationsAfterLoadingSpacy(data, index).then(state => {
          if (props.annotationFocus === tagTypes.SENTENCES) {
            props.setAnnotations(state.fileViewer.sentences);
          } else {
            props.setAnnotations(state.fileViewer.entities.filter(entity => entity.type === props.annotationFocus));
          }
          props.setSpacyLoading(false);
        });
      })
      .catch(error => {
        console.log("ERROR:", error);
      });
  };

  // opens files for the user to annotate.
  // .txt files are shown in a list of files available for annotation
  // .json files are mapped to .txt files with the same name to display previously exported annotations
  const openFiles = fileList => {
    // creating empty lists
    const txtList = [];
    const jsonList = [];
    const annotationsList = [];
    for (let file of fileList) {
      const ext = file.name.split(".")[file.name.split(".").length - 1];
      // for text files that aren't already opened
      if (ext === "txt" && !fileAlreadyOpen(file, props.txtList)) {
        txtList.push(file);
        // creating annotation object and pushing into a list
        let annotationsObject = {};
        annotationsObject.name = file.name.slice(0, file.name.length - 1 - ext.length);
        annotationsList.push(annotationsObject);
        // for json files that aren't already opened
      } else if (ext === "json" && !fileAlreadyOpen(file, props.jsonList)) {
        jsonList.push(file);
        if (
          props.annotationsList[props.fileIndex] && // checking that a file is open before trying to match json
          // taking out "_Annotations.json" and comparing with filename
          file.name.substring(0, file.name.length - 17) === props.annotationsList[props.fileIndex].name &&
          annotationsEmpty()
        ) {
          addAnnotationsFromJson(file);
        }
      }
    }
    // combining lists with store
    props.setJsonList([...props.jsonList, ...jsonList]);
    props.setTxtList([...props.txtList, ...txtList]);
    props.setAnnotationsList([...props.annotationsList, ...annotationsList]);

    // making promise list to add all tags from imported json files to tagTemplates
    const promiseList = makePromiseList(jsonList); // make promise list
    Promise.all(promiseList).then(promises => {
      // once all of the promises are resolved
      let newTags = []; // make an empty list of tags to append all tags to
      for (let promise of promises) {
        // adding to newTags
        for (let tag of promise.tagTemplates) {
          newTags.push(tag);
        }
      }
      addNewTags(newTags);
    });
  };

  // function to add annotations from a json file to the currently open txt file
  const addAnnotationsFromJson = file => {
    let fileReader = new FileReader();
    fileReader.onload = e => {
      // reading json
      const json = JSON.parse(e.target.result);

      let entities;

      // setting current entities/sentences
      if (json[tagTypes.ENTITIES]) {
        entities = json[tagTypes.ENTITIES];
        setLinkedPointers(entities);
        props.setCurrentEntities(entities);
      }
      if (json[tagTypes.SENTENCES]) {
        props.setCurrentSentences(json[tagTypes.SENTENCES]);
      }
      // if the current version is selected, also set entities/sentences which are used to display annotations
      if (props.versionIndex === props.versions.length || props.versionIndex === -1) {
        props.setEntities(entities);
        props.setSentences(json[tagTypes.SENTENCES]);
        // set the appropriate set of annotations to be displayed
        if (props.annotationFocus === tagTypes.SENTENCES) {
          props.setAnnotations(json[tagTypes.SENTENCES]);
        } else {
          props.setAnnotations(entities.filter(annotation => annotation.type === props.annotationFocus));
        }
      }
    };
    fileReader.readAsText(file);
  };

  // checks if the current annotations are empty or not
  const annotationsEmpty = () => {
    if (props.currentEntities.length > 0 || props.currentSentences.length > 0) {
      return false;
    }
    return true;
  };

  // checking duplicate tags and adding new tags to tagTemplates
  const addNewTags = newTags => {
    const tagTemplates = Array.from(props.tagTemplates); // copy state
    // for every tag added, check if it exists in tagTemplates. If not, append it
    for (let newTag of newTags) {
      let duplicateTag = tagTemplates.find(tag => tag.id === newTag.id && tag.type === newTag.type);
      if (duplicateTag === undefined) {
        tagTemplates.push(newTag);
      }
    }
    // pushing the modified tagTemplates to the state
    props.setTagTemplates(tagTemplates);
  };

  // making a promise list
  const makePromiseList = jsonList => {
    let promiseList = [];
    // for every json file, create a promise
    for (let jsonFile of jsonList) {
      let fileReader = new FileReader();
      promiseList.push(
        new Promise((resolve, reject) => {
          fileReader.onloadend = () => {
            resolve(JSON.parse(fileReader.result));
          };
          fileReader.readAsText(jsonFile);
        })
      );
    }
    return promiseList;
  };

  // used to check if a file has already been opened to avoid opening the same file twice
  const fileAlreadyOpen = (file, openedFiles) => {
    for (let openFile of openedFiles) {
      if (openFile.name === file.name) {
        return true;
      }
    }
    return false;
  };

  // exports annotations for each opened file into json files
  // creates zip file with all json files inside and downloads it
  const exportAnnotations = () => {
    let zip = new JSZip();

    // calls API to export the annotations for the current session
    // creates a zip file with json files for each txt file
    APIUtility.API.makeAPICall(APIUtility.EXPORT_CURRENT_ANNOTATIONS, props.sessionId)
      .then(response => response.json())
      .then(data => {
        for (let annotation of data) {
          zip.file(annotation.name + "_Annotations.json", JSON.stringify(annotation));
        }
        zip.generateAsync({ type: "blob" }).then(content => {
          saveAs(content, "annotations.zip");
        });
      });
  };

  // when receiving annotations from the backend, or uploaded json, "next" attribute is only a copy, not a pointer
  // this method changes it to a pointer
  const setLinkedPointers = entities => {
    for (let outer of entities) {
      if (outer.next) {
        for (let inner of entities) {
          if (JSON.stringify(outer.next) === JSON.stringify(inner)) {
            outer.next = inner;
          }
        }
      }
    }
  };

  return (
    <div className={classes.root}>
      <Button onClick={openExplorerBrowse} variant="contained" color="primary" className={classes.button}>
        Browse for Files
      </Button>
      <input
        ref={fileInputRefBrowse}
        style={{ display: "none" }}
        type="file"
        multiple
        onChange={e => openFiles(e.target.files)}
      />
      <Button onClick={exportAnnotations} variant="contained" color="primary" className={classes.button}>
        Export Annotations
      </Button>
      <List
        dense
        disablePadding
        component="nav"
        aria-labelledby="nested-list-subheader"
        subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            Opened Files:
          </ListSubheader>
        }
      >
        {props.txtList.map((file, index) => (
          <FileHistory
            key={file.name}
            file={file}
            index={index}
            saveAnnotations={props.saveAnnotations}
            addNewTags={addNewTags}
            callSpacy={callSpacy}
            addAnnotationsFromJson={addAnnotationsFromJson}
            setLinkedPointers={setLinkedPointers}
          />
        ))}
      </List>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    sentences: state.fileViewer.sentences,
    entities: state.fileViewer.entities,
    jsonList: state.fileViewer.jsonList,
    txtList: state.fileViewer.txtList,
    annotationsList: state.fileViewer.annotationsList,
    fileIndex: state.fileViewer.fileIndex,
    tagTemplates: state.fileViewer.tagTemplates,
    sessionId: state.fileViewer.sessionId,
    isSpacyLoading: state.fileViewer.isSpacyLoading,
    versionIndex: state.fileViewer.versionIndex,
    annotationFocus: state.fileViewer.annotationFocus,
    currentEntities: state.fileViewer.currentEntities,
    currentSentences: state.fileViewer.currentSentences,
    versions: state.fileViewer.versions,
    versionIndex: state.fileViewer.versionIndex
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setAnnotations: annotations => dispatch(actions.setAnnotations(annotations)),
    setSentences: sentences => dispatch(actions.setSentences(sentences)),
    setEntities: entities => dispatch(actions.setEntities(entities)),
    setAnnotationFocus: annotationFocus => dispatch(actions.setAnnotationFocus(annotationFocus)),
    setSpacyLoading: isSpacyLoading => dispatch(actions.setSpacyLoading(isSpacyLoading)),
    updateAnnotationsAfterLoadingSpacy: (data, index) =>
      dispatch(actions.updateAnnotationsAfterLoadingSpacy(data, index)),
    setJsonList: jsonList => dispatch(actions.setJsonList(jsonList)),
    setTxtList: txtList => dispatch(actions.setTxtList(txtList)),
    setAnnotationsList: annotationsList => dispatch(actions.setAnnotationsList(annotationsList)),
    setTagTemplates: tagTemplates => dispatch(actions.setTagTemplatesWithCallback(tagTemplates)),
    setCurrentEntities: currentEntities => dispatch(actions.setCurrentEntities(currentEntities)),
    setCurrentSentences: currentSentences => dispatch(actions.setCurrentSentences(currentSentences))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageFiles);
