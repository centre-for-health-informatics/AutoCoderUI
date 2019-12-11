import React from "react";
import { connect } from "react-redux";
import * as APIUtility from "../../Util/API";
import * as actions from "../../Store/Actions/index";
import downloader from "../../Util/download";
import * as tagTypes from "../TagManagement/tagTypes";
import { List, ListItem, Button, makeStyles } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1)
  }
}));

const ManageFiles = props => {
  const classes = useStyles();
  const fileInputRefImport = React.createRef();
  const fileInputRefBrowse = React.createRef();

  const openExplorerBrowse = () => {
    if (props.disabled) {
      return;
    }
    fileInputRefBrowse.current.click();
  };

  const openExplorerImport = () => {
    if (props.disabled) {
      return;
    }
    fileInputRefImport.current.click();
  };

  const callApi = fileData => {
    props.setSpacyLoading(true);
    const options = {
      method: "POST",
      body: fileData
    };

    APIUtility.API.makeAPICall(APIUtility.UPLOAD_DOCUMENT, null, options)
      .then(response => response.json())
      .then(data => {
        props.updateLegendAfterLoadingSpacy(data);

        props.setAnnotationFocus("");
        props.setSpacyLoading(false);
      })
      .catch(error => {
        console.log("ERROR:", error);
      });
  };

  const readFileImport = file => {
    if (file) {
      let fileReader = new FileReader();

      fileReader.onload = e => {
        const json = JSON.parse(e.target.result);
        props.setSections(json.Section);
        props.setEntities(json.Entity);
        props.setTokens(json.Token);
        props.setSentences(json.Sentence);
        props.setAnnotationFocus("");
        props.setAnnotations([]);
      };

      fileReader.readAsText(file);
    }
  };

  // opens files for the user to annotate.
  // .txt files are shown in a list of files available for annotation
  // .json files are mapped to .txt files with the same name to display previously exported annotations
  const openFiles = fileList => {
    const txtList = [];
    const jsonList = [];
    const annotationsList = [];
    for (let file of fileList) {
      const ext = file.name.split(".")[file.name.split(".").length - 1];
      if (ext === "txt" && !fileAlreadyOpen(file, props.txtList)) {
        txtList.push(file);
        let annotationsObject = {};
        annotationsObject.name = file.name.slice(0, file.name.length - 1 - ext.length);
        populateAnnotationsObject(annotationsObject, fileList);
        annotationsList.push(annotationsObject);
      } else if (ext === "json" && !fileAlreadyOpen(file, props.jsonList)) {
        jsonList.push(file);
      }
    }
    props.setJsonList([...props.jsonList, ...jsonList]);
    props.setTxtList([...props.txtList, ...txtList]);
    props.setAnnotationsList([...props.annotationsList, ...annotationsList]);
  };

  const populateAnnotationsObject = (annotationsObject, fileList) => {
    const allJson = Array.from([
      ...props.jsonList,
      ...Array.from(fileList).filter(file => file.name.endsWith(".json"))
    ]);
    for (let file of allJson) {
      if (file.name === annotationsObject.name + "_Annotations.json") {
        let fileReader = new FileReader();
        fileReader.onload = e => {
          const json = JSON.parse(e.target.result);
          annotationsObject.sections = json.Section;
          annotationsObject.entities = json.Entity;
          annotationsObject.tokens = json.Token;
          annotationsObject.sentences = json.Sentence;
        };
        fileReader.readAsText(file);
        break;
      }
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

  const readFile = (file, index) => {
    if (file) {
      let fileReader = new FileReader();
      // reset store if file changes
      props.setAnnotations([]);
      props.setFileText("");
      props.setSections(props.annotationsList[index].sections || []);
      props.setSentences(props.annotationsList[index].sentences || []);
      props.setTokens(props.annotationsList[index].tokens || []);
      props.setEntities(props.annotationsList[index].entities || []);
      // props.setSectionsInUse([]);
      // props.setEntitiesInUse([]);
      props.setAnnotationFocus("");

      let fileData = {};
      fileData.id = file.name;
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

        if (props.spacyActive) {
          callApi(fileData);
        }
      };

      // for (let jsonFile of props.jsonList) {
      //   if (jsonFile.name === filename + "_Annotations.json") {
      //     readFileImport(jsonFile);
      //     break;
      //   }
      // }
    }
  };

  const exportAnnotations = () => {
    let annotations = {};
    annotations.Section = props.sections;
    annotations.Sentence = props.sentences;
    annotations.Entity = props.entities;
    annotations.Token = props.tokens;

    downloader(props.fileReference + "_Annotations.json", JSON.stringify(annotations));
  };

  const importAnnotations = () => {
    openExplorerImport();
  };

  const switchFile = index => {
    readFile(props.txtList[index], index);
  };

  const makeFileList = () => {
    return props.txtList.map((file, index) => (
      <ListItem key={file.name} onClick={() => switchFile(index)} style={{ cursor: "pointer" }}>
        {file.name}
      </ListItem>
    ));
  };

  return (
    <div>
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
      <Button onClick={importAnnotations} variant="contained" color="primary" className={classes.button}>
        Import Annotations
      </Button>
      <input
        ref={fileInputRefImport}
        style={{ display: "none" }}
        type="file"
        onChange={e => readFileImport(e.target.files[0])}
      />
      <p>Opened files:</p>
      <List dense disablePadding>
        {makeFileList()}
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
    annotationsList: state.fileViewer.annotationsList
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
    setSpacyLoading: spacyLoading => dispatch(actions.setSpacyLoading(spacyLoading)),
    updateLegendAfterLoadingSpacy: data => dispatch(actions.updateLegendAfterLoadingSpacy(data)),
    setJsonList: jsonList => dispatch(actions.setJsonList(jsonList)),
    setTxtList: txtList => dispatch(actions.setTxtList(txtList)),
    setAnnotationsList: annotationsList => dispatch(actions.setAnnotationsList(annotationsList))
    // setAlertMessage: newValue => dispatch(actions.setAlertMessage(newValue))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageFiles);
