import React, { useEffect } from "react";
import * as APIUtility from "../../Util/API";
import { connect } from "react-redux";
import { Button, Switch, FormControlLabel } from "@material-ui/core";
import * as actions from "../../Store/Actions/index";
import * as templateTags from "../TagManagement/defaultTags";
import * as tagTypes from "../TagManagement/tagTypes";
import getColors from "../../Util/colorMap";
import LoadingIndicator from "../../Components/LoadingIndicator/LoadingIndicator";
import CustomAnnotator from "../../Components/CustomAnnotator/CustomAnnotator";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1)
  }
}));

const FileViewer = props => {
  const classes = useStyles();
  const fileInputRef = React.createRef();
  const fileReader = new FileReader();
  let fileData = {};

  const setDefaultTagTemplate = () => {
    props.setTagTemplates(templateTags.DEFAULTS);
  };

  setDefaultTagTemplate();

  APIUtility.API.makeAPICall(APIUtility.GET_SECTIONS).then(response => response.json());

  useEffect(() => {
    mapColors();
  }, [props.tagTemplates]);

  const mapColors = () => {
    const tagsWithoutColors = [];
    for (let tag of props.tagTemplates) {
      if (tag.color === undefined || tag.color === "") {
        tagsWithoutColors.push(tag);
      }
    }
    const newColors = getColors(tagsWithoutColors.length);
    for (let i = 0; i < tagsWithoutColors.length; i++) {
      tagsWithoutColors[i].color = newColors[i];
    }
  };

  const openExplorer = () => {
    if (props.disabled) return;
    fileInputRef.current.click();
  };

  const readFile = file => {
    if (file) {
      // reset store if user changes file
      props.setAnnotations([]);
      props.setFileText("");
      props.setSections([]);
      props.setSentences([]);
      props.setTokens([]);
      props.setEntities([]);
      props.setSectionsInUse([]);
      props.setEntitiesInUse([]);

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
          callApi();
        }
      };
    }
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

  const renderCustomAnnotator = () => {
    if (props.spacyLoading) {
      return <LoadingIndicator />;
    }
    return <CustomAnnotator />;
  };

  return (
    <div>
      <div className="fileUpload">
        <Button onClick={openExplorer} variant="contained" color="primary" className={classes.button}>
          Browse for File
        </Button>
        <input
          ref={fileInputRef}
          style={{ display: "none" }}
          type="file"
          //   multiple
          onChange={e => readFile(e.target.files[0])}
        />
      </div>
      <div>
        <FormControlLabel
          control={
            <Switch
              size="small"
              color="primary"
              checked={props.snapToWord}
              onChange={() => {
                props.setSnapToWord(!props.snapToWord);
              }}
            />
          }
          label="Snap to Whole Word"
        />
      </div>
      <div id="docDisplay" style={{ whiteSpace: "pre-wrap" }}>
        {renderCustomAnnotator()}
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    textToDisplay: state.fileViewer.fileViewerText,
    sections: state.fileViewer.sections,
    sentences: state.fileViewer.sentences,
    tokens: state.fileViewer.tokens,
    entities: state.fileViewer.entities,
    // icdCodes:
    spacyActive: state.fileViewer.spacyActive,
    spacyLoading: state.fileViewer.spacyLoading,
    tagTemplates: state.fileViewer.tagTemplates,
    alternatingColors: state.fileViewer.alternatingColors,
    snapToWord: state.fileViewer.snapToWord,
    sectionsInUse: state.fileViewer.sectionsInUse,
    entitiesInUse: state.fileViewer.entitiesInUse
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setFileText: text => dispatch(actions.setFileText(text)),
    setSections: sections => dispatch(actions.setSections(sections)),
    setSentences: sentences => dispatch(actions.setSentences(sentences)),
    setTokens: tokens => dispatch(actions.setTokens(tokens)),
    setEntities: entities => dispatch(actions.setEntities(entities)),
    // setICDCodes: icdCodes => dispatch
    setSpacyLoading: spacyLoading => dispatch(actions.setSpacyLoading(spacyLoading)),
    setSpacyActive: spacyActive => dispatch(actions.setSpacyActive(spacyActive)),
    setAnnotations: annotations => dispatch(actions.setAnnotations(annotations)),
    setAnnotationFocus: annotationFocus => dispatch(actions.setAnnotationFocus(annotationFocus)),
    setTagTemplates: tagTemplates => dispatch(actions.setTagTemplates(tagTemplates)),
    setFileReference: fileReference => dispatch(actions.setFileReference(fileReference)),
    setSnapToWord: snapToWord => dispatch(actions.setSnapToWord(snapToWord)),
    setSectionsInUse: sectionsInUse => dispatch(actions.setSectionsInUse(sectionsInUse)),
    setEntitiesInUse: entitiesInUse => dispatch(actions.setEntitiesInUse(entitiesInUse)),
    updateLegendAfterLoadingSpacy: data => dispatch(actions.updateLegendAfterLoadingSpacy(data))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FileViewer);
