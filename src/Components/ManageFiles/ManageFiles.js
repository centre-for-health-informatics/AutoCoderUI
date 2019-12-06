import React from "react";
import { connect } from "react-redux";
import * as APIUtility from "../../Util/API";
import * as actions from "../../Store/Actions/index";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import downloader from "../../Util/download";
import * as tagTypes from "../TagManagement/tagTypes";

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1)
  }
}));

const ManageFiles = props => {
  const classes = useStyles();
  const fileInputRefImport = React.createRef();
  const fileInputRefBrowse = React.createRef();
  let fileData = {};

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

  const callApi = () => {
    props.setSpacyLoading(true);
    const options = {
      method: "POST",
      body: fileData
    };

    APIUtility.API.makeAPICall(APIUtility.UPLOAD_DOCUMENT, null, options)
      .then(response => response.json())
      .then(data => {
        props.updateLegendAfterLoadingSpacy(data);

        props.setAnnotationFocus(tagTypes.SECTIONS); // default type selection
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

  const readFileBrowse = fileList => {
    console.log(fileList);
    if (fileList[0]) {
      let fileReader = new FileReader();
      // reset store if user changes file
      props.setAnnotations([]);
      props.setFileText("");
      props.setSections([]);
      props.setSentences([]);
      props.setTokens([]);
      props.setEntities([]);
      props.setSectionsInUse([]);
      props.setEntitiesInUse([]);

      fileData.id = fileList[0].name;
      let ext = fileList[0].name.split(".")[fileList[0].name.split(".").length - 1];
      let filename = fileList[0].name.slice(0, fileList[0].name.length - 1 - ext.length);
      props.setFileReference(filename);
      if (ext === "txt") {
        fileData.format = "plain_text";
      } else if (ext === "rtf") {
        fileData.format = "rich_text";
      } else {
        fileData.format = "other";
      }

      fileReader.readAsText(fileList[0]);

      fileReader.onloadend = () => {
        let text = fileReader.result.replace(/\r\n/g, "\n"); // Replaces \r\n with \n for Windows OS
        fileData.content = text;

        props.setFileText(text);

        if (props.spacyActive) {
          callApi();
        }
      };
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

  const openNextFile = () => {
    // open next file
  };

  return (
    <div>
      <div>
        <Button onClick={openExplorerBrowse} variant="contained" color="primary" className={classes.button}>
          Browse for Files
        </Button>
        <input
          ref={fileInputRefBrowse}
          style={{ display: "none" }}
          type="file"
          multiple
          onChange={e => readFileBrowse(e.target.files)}
        />
        <Button onClick={openNextFile} variant="contained" color="primary" className={classes.button}>
          Save and Open Next File
        </Button>
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
      </div>
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
    spacyActive: state.fileViewer.spacyActive
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
    updateLegendAfterLoadingSpacy: data => dispatch(actions.updateLegendAfterLoadingSpacy(data))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageFiles);
