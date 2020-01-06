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
  const callApi = (fileData, index) => {
    props.setSingleSpacyLoading(true, index);
    const options = {
      method: "POST",
      body: fileData
    };

    APIUtility.API.makeAPICall(APIUtility.UPLOAD_DOCUMENT, null, options)
      .then(response => response.json())
      .then(data => {
        props.updateAnnotationsAfterLoadingSpacy(data, index);
        if (props.fileIndex === index) {
          props.setAnnotationFocus("");
        }
        props.setSingleSpacyLoading(false, index);
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
    const isSpacyLoading = [];
    for (let file of fileList) {
      const ext = file.name.split(".")[file.name.split(".").length - 1];
      // for text files that aren't already opened
      if (ext === "txt" && !fileAlreadyOpen(file, props.txtList)) {
        txtList.push(file);
        isSpacyLoading.push(false);
        // creating annotation object and pushing into a list
        let annotationsObject = {};
        annotationsObject.name = file.name.slice(0, file.name.length - 1 - ext.length);
        populateAnnotationsObject(annotationsObject, fileList);
        annotationsList.push(annotationsObject);
        // for json files that aren't already opened
      } else if (ext === "json" && !fileAlreadyOpen(file, props.jsonList)) {
        jsonList.push(file);
      }
    }
    // combining lists with store
    props.setJsonList([...props.jsonList, ...jsonList]);
    props.setTxtList([...props.txtList, ...txtList]);
    props.setAnnotationsList([...props.annotationsList, ...annotationsList]);

    // setting spacy loading array
    props.setSpacyLoading([...props.isSpacyLoading, ...isSpacyLoading]);

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

  // Used to populate annotations from imported json files
  const populateAnnotationsObject = (annotationsObject, fileList) => {
    // combining newly and previously imported json files
    const allJson = Array.from([
      ...props.jsonList,
      ...Array.from(fileList).filter(file => file.name.endsWith(".json"))
    ]);
    for (let file of allJson) {
      // if the file matches a json file, load annotations from the json file
      if (file.name === annotationsObject.name + "_Annotations.json") {
        let fileReader = new FileReader();
        fileReader.onload = e => {
          const json = JSON.parse(e.target.result);
          if (json[tagTypes.SECTIONS]) {
            annotationsObject.Sections = json[tagTypes.SECTIONS];
          } else {
            annotationsObject[tagTypes.SECTIONS] = [];
          }
          if (json[tagTypes.ENTITIES]) {
            annotationsObject[tagTypes.ENTITIES] = json[tagTypes.ENTITIES];
          } else {
            annotationsObject[tagTypes.ENTITIES] = [];
          }
          if (json[tagTypes.TOKENS]) {
            annotationsObject[tagTypes.TOKENS] = json[tagTypes.TOKENS];
          } else {
            annotationsObject[tagTypes.TOKENS] = [];
          }
          if (json[tagTypes.SENTENCES]) {
            annotationsObject[tagTypes.SENTENCES] = json[tagTypes.SENTENCES];
          } else {
            annotationsObject[tagTypes.SENTENCES] = [];
          }
        };
        fileReader.readAsText(file);
        break;
      }
    }
    if (!annotationsObject[tagTypes.SECTIONS]) {
      annotationsObject[tagTypes.SECTIONS] = [];
    }
    if (!annotationsObject[tagTypes.TOKENS]) {
      annotationsObject[tagTypes.TOKENS] = [];
    }
    if (!annotationsObject[tagTypes.SENTENCES]) {
      annotationsObject[tagTypes.SENTENCES] = [];
    }
    if (!annotationsObject[tagTypes.ENTITIES]) {
      annotationsObject[tagTypes.ENTITIES] = [];
    }
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

  // reads a file when it is selected from the list of uploaded files
  const readFile = (file, index) => {
    if (file) {
      let fileReader = new FileReader();
      // reset store if file changes
      props.setAnnotations([]);
      props.setSections(props.annotationsList[index][tagTypes.SECTIONS]);
      props.setSentences(props.annotationsList[index][tagTypes.SENTENCES]);
      props.setTokens(props.annotationsList[index][tagTypes.TOKENS]);
      props.setEntities(props.annotationsList[index][tagTypes.ENTITIES]);
      props.setAnnotationFocus("");

      // creating fileData - used to call API
      let fileData = {};
      fileData.filename = file.name;
      let ext = file.name.split(".")[file.name.split(".").length - 1];
      let filename = file.name.slice(0, file.name.length - 1 - ext.length);
      props.setFileReference(filename);
      if (ext === "txt") {
        fileData.format = "plain_text";
      } else if (ext === "rtf") {
        fileData.format = "rich_text";
      } else {
        fileData.format = "other";
      }

      fileReader.readAsText(file);

      fileReader.onloadend = () => {
        let text = fileReader.result.replace(/\r\n/g, "\n"); // Replaces \r\n with \n for Windows OS
        fileData.content = text;

        props.setFileText(text);

        // if "use spacy" is checked and there are no existing annotations for the file
        if (props.spacyActive && annotationsEmpty(index)) {
          callApi(fileData, index);
        }
      };
    }
  };

  const annotationsEmpty = index => {
    let annotationsObject = props.annotationsList[index];
    if (
      annotationsObject[tagTypes.SECTIONS].length > 0 ||
      annotationsObject[tagTypes.ENTITIES].length > 0 ||
      annotationsObject[tagTypes.SENTENCES].length > 0 ||
      annotationsObject[tagTypes.TOKENS].length > 0
    ) {
      return false;
    }
    return true;
  };

  // exports annotations for each opened file into json files
  // creates zip file with all json files inside and downloads it
  const exportAnnotations = () => {
    let zip = new JSZip();

    for (let annotation of props.annotationsList) {
      const tagsInUse = props.checkTagsInUse(annotation);
      zip.file(
        annotation.name + "_Annotations.json",
        '{"tagTemplates":[' + JSON.stringify(tagsInUse).slice(1, -1) + "]," + JSON.stringify(annotation).slice(1)
      );
    }

    zip.generateAsync({ type: "blob" }).then(content => {
      saveAs(content, "annotations.zip");
    });
  };

  // handles a user clicking on another file that has been uploaded
  const switchFile = index => {
    readFile(props.txtList[index], index);
    props.setFileIndex(index);
    props.setEntitiesInUse([]);
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
          <FileHistory key={file.name} file={file} index={index} switchFile={switchFile} />
        ))}
      </List>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    fileReference: state.fileViewer.fileReference,
    sections: state.fileViewer.sections,
    sentences: state.fileViewer.sentences,
    tokens: state.fileViewer.tokens,
    entities: state.fileViewer.entities,
    spacyActive: state.fileViewer.spacyActive,
    jsonList: state.fileViewer.jsonList,
    txtList: state.fileViewer.txtList,
    annotationsList: state.fileViewer.annotationsList,
    fileIndex: state.fileViewer.fileIndex,
    tagTemplates: state.fileViewer.tagTemplates,
    sessionId: state.fileViewer.sessionId,
    isSpacyLoading: state.fileViewer.isSpacyLoading,
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
    setFileReference: fileReference => dispatch(actions.setFileReference(fileReference)),
    setSections: sections => dispatch(actions.setSections(sections)),
    setSentences: sentences => dispatch(actions.setSentences(sentences)),
    setTokens: tokens => dispatch(actions.setTokens(tokens)),
    setEntities: entities => dispatch(actions.setEntities(entities)),
    setFileText: text => dispatch(actions.setFileText(text)),
    setSectionsInUse: sectionsInUse => dispatch(actions.setSectionsInUse(sectionsInUse)),
    setEntitiesInUse: entitiesInUse => dispatch(actions.setEntitiesInUse(entitiesInUse)),
    setAnnotationFocus: annotationFocus => dispatch(actions.setAnnotationFocus(annotationFocus)),
    setSpacyLoading: isSpacyLoading => dispatch(actions.setSpacyLoading(isSpacyLoading)),
    updateAnnotationsAfterLoadingSpacy: (data, index) =>
      dispatch(actions.updateAnnotationsAfterLoadingSpacy(data, index)),
    setJsonList: jsonList => dispatch(actions.setJsonList(jsonList)),
    setTxtList: txtList => dispatch(actions.setTxtList(txtList)),
    setAnnotationsList: annotationsList => dispatch(actions.setAnnotationsList(annotationsList)),
    setFileIndex: fileIndex => dispatch(actions.setFileIndex(fileIndex)),
    setTagTemplates: tagTemplates => dispatch(actions.setTagTemplates(tagTemplates)),
    setSingleSpacyLoading: (isSpacyLoading, index) => dispatch(actions.setSingleSpacyLoading(isSpacyLoading, index)),
    setVersionIndex: versionIndex => dispatch(actions.setVersionIndex(versionIndex)),
    setCurrentEntities: currentEntities => dispatch(actions.setCurrentEntities(currentEntities)),
    setCurrentSections: currentSections => dispatch(actions.setCurrentSections(currentSections)),
    setCurrentSentences: currentSentences => dispatch(actions.setCurrentSentences(currentSentences))
    // setAlertMessage: newValue => dispatch(actions.setAlertMessage(newValue))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageFiles);
