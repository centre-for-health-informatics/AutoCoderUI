import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import * as APIUtility from "../../Util/API";
import * as actions from "../../Store/Actions/index";
import * as tagTypes from "../TagManagement/tagTypes";
import { List, Button, makeStyles, ListSubheader } from "@material-ui/core";
import { saveAs } from "file-saver";
import FileHistory from "../FileHistory/FileHistory";

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

    APIUtility.API.makeAPICall(APIUtility.UPLOAD_DOCUMENT, null, options)
      .then(response => response.json())
      .then(data => {
        props.updateAnnotationsAfterLoadingSpacy(data, index).then(state => {
          if (props.annotationFocus === tagTypes.SECTIONS) {
            props.setAnnotations(state.fileViewer.sections);
          } else if (props.annotationFocus === tagTypes.SENTENCES) {
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
      // setting current sections/entities/sentences
      if (json[tagTypes.SECTIONS]) {
        props.setCurrentSections(json[tagTypes.SECTIONS]);
      }
      if (json[tagTypes.ENTITIES]) {
        props.setCurrentEntities(json[tagTypes.ENTITIES]);
      }
      if (json[tagTypes.SENTENCES]) {
        props.setCurrentSentences(json[tagTypes.SENTENCES]);
      }
      // if the current version is selected, also set sections/entities/sentences which are used to display annotations
      if (props.versionIndex === props.versions.length || props.versionIndex === -1) {
        props.setSections(json[tagTypes.SECTIONS]);
        props.setEntities(json[tagTypes.ENTITIES]);
        props.setSentences(json[tagTypes.SENTENCES]);
        // set the appropriate set of annotations to be displayed
        if (props.annotationFocus === tagTypes.SECTIONS) {
          props.setAnnotations(json[tagTypes.SECTIONS]);
        } else if (props.annotationFocus === tagTypes.SENTENCES) {
          props.setAnnotations(json[tagTypes.SENTENCES]);
        } else {
          props.setAnnotations(json[tagTypes.ENTITIES].filter(annotation => annotation.type === props.annotationFocus));
        }
      }
    };
    fileReader.readAsText(file);
  };

  // checks if the current annotations are empty or not
  const annotationsEmpty = () => {
    if (props.currentEntities.length > 0 || props.currentSections.length > 0 || props.currentSentences.length > 0) {
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
    APIUtility.API.makeAPICall(APIUtility.EXPORT_ANNOTATIONS, props.sessionId)
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
          />
        ))}
      </List>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    sections: state.fileViewer.sections,
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
    currentSections: state.fileViewer.currentSections,
    currentSentences: state.fileViewer.currentSentences,
    versions: state.fileViewer.versions,
    versionIndex: state.fileViewer.versionIndex
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setAnnotations: annotations => dispatch(actions.setAnnotations(annotations)),
    setSections: sections => dispatch(actions.setSections(sections)),
    setSentences: sentences => dispatch(actions.setSentences(sentences)),
    setEntities: entities => dispatch(actions.setEntities(entities)),
    setAnnotationFocus: annotationFocus => dispatch(actions.setAnnotationFocus(annotationFocus)),
    setSpacyLoading: isSpacyLoading => dispatch(actions.setSpacyLoading(isSpacyLoading)),
    updateAnnotationsAfterLoadingSpacy: (data, index) =>
      dispatch(actions.updateAnnotationsAfterLoadingSpacy(data, index)),
    setJsonList: jsonList => dispatch(actions.setJsonList(jsonList)),
    setTxtList: txtList => dispatch(actions.setTxtList(txtList)),
    setAnnotationsList: annotationsList => dispatch(actions.setAnnotationsList(annotationsList)),
    setTagTemplates: tagTemplates => dispatch(actions.setTagTemplates(tagTemplates)),
    setCurrentEntities: currentEntities => dispatch(actions.setCurrentEntities(currentEntities)),
    setCurrentSentences: currentSentences => dispatch(actions.setCurrentSentences(currentSentences)),
    setCurrentSections: currentSections => dispatch(actions.setCurrentSections(currentSections))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageFiles);
