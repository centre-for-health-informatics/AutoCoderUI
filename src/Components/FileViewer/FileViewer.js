import React, { Component } from "react";
import * as APIUtility from "../../Util/API";
import { connect } from "react-redux";
import { Button, Switch, FormControlLabel } from "@material-ui/core";
import * as actions from "../../Store/Actions/index";
import TagUploader from "../../Components/TagManagement/TagUploader";
import ImportExportAnnotations from "../../Components/ImportExportAnnotations/ImportExportAnnotations";
import * as templateTags from "../TagManagement/defaultTags";
import * as tagTypes from "../TagManagement/tagTypes";
import getColors from "../../Util/colorMap";
import LoadingIndicator from "../../Components/LoadingIndicator/LoadingIndicator";
import CustomAnnotator from "../../Components/CustomAnnotator/CustomAnnotator";
import Legend from "../../Components/CustomAnnotator/Legend";

class FileViewer extends Component {
  constructor(props) {
    super(props);
    this.fileInputRef = React.createRef();
    this.fileReader = new FileReader();
    this.fileData = {};

    this.setDefaultTagTemplate();

    APIUtility.API.makeAPICall(APIUtility.GET_SECTIONS).then(response => response.json());
  }

  componentDidUpdate(prevProps) {
    if (prevProps.tagTemplates !== this.props.tagTemplates) {
      this.mapColors();
    }
  }

  setDefaultTagTemplate = () => {
    this.props.setTagTemplates(templateTags.DEFAULTS);
  };

  mapColors = () => {
    const tagsWithoutColors = [];
    for (let tag of this.props.tagTemplates) {
      if (tag.color === undefined || tag.color === "") {
        tagsWithoutColors.push(tag);
      }
    }
    const newColors = getColors(tagsWithoutColors.length);
    for (let i = 0; i < tagsWithoutColors.length; i++) {
      tagsWithoutColors[i].color = newColors[i];
    }
  };

  openExplorer = () => {
    if (this.props.disabled) return;
    this.fileInputRef.current.click();
  };

  readFile = file => {
    if (file) {
      // reset store if user changes file
      this.props.setAnnotations([]);
      this.props.setFileText("");
      this.props.setSections([]);
      this.props.setSentences([]);
      this.props.setTokens([]);
      this.props.setEntities([]);
      this.props.setSectionsInUse([]);
      this.props.setEntitiesInUse([]);

      this.fileData.id = file.name;
      let ext = file.name.split(".")[file.name.split(".").length - 1];
      let filename = file.name.slice(0, file.name.length - 1 - ext.length);
      this.props.setFileReference(filename);
      if (ext === "txt") {
        this.fileData.format = "plain_text";
      } else if (ext === "rtf") {
        this.fileData.format = "rich_text";
      } else {
        this.fileData.format = "other";
      }

      this.fileReader.readAsText(file);

      this.fileReader.onloadend = () => {
        let text = this.fileReader.result.replace(/\r\n/g, "\n"); // Replaces \r\n with \n for Windows OS
        this.fileData.content = text;

        this.props.setFileText(text);

        if (this.props.spacyActive) {
          this.callApi();
        }
      };
    }
  };

  callApi = () => {
    this.props.setSpacyLoading(true);
    const options = {
      method: "POST",
      body: this.fileData
    };

    APIUtility.API.makeAPICall(APIUtility.UPLOAD_DOCUMENT, null, options)
      .then(response => response.json())
      .then(data => {
        this.props.setSections([...this.props.sections, ...this.mapData(data.sections, tagTypes.SECTIONS)]);
        this.props.setSentences([...this.props.sentences, ...this.mapData(data.sentences, tagTypes.SENTENCES)]);
        this.props.setTokens([...this.props.tokens, ...this.mapData(data.tokens, tagTypes.TOKENS)]);
        this.props.setEntities([...this.props.entities, ...this.mapData(data.entities, tagTypes.ENTITIES)]);

        this.props.setSpacyLoading(false);
        this.props.setAnnotations(this.props.sections); // default type selection
        this.props.setAnnotationFocus(tagTypes.SECTIONS); // default type selection
      })
      .catch(error => {
        console.log("ERROR:", error);
      });
  };

  mapData = (data, type) => {
    for (let i = 0; i < data.length; i++) {
      let dataPoint = data[i];
      dataPoint.tag = dataPoint.label;
      delete dataPoint.label;

      if (type === tagTypes.ENTITIES || type === tagTypes.SECTIONS) {
        let idMatchingTags = this.props.tagTemplates.filter(item => {
          return item.id === dataPoint.tag;
        });
        if (idMatchingTags.length > 0) {
          dataPoint.color = idMatchingTags[0].color;
        }
      } else {
        dataPoint.color = this.getAlternatingColor(i);
      }
      dataPoint.text = this.props.textToDisplay.slice(dataPoint.start, dataPoint.end);
    }
    return data;
  };

  getAlternatingColor = counter => {
    if (counter % 2 === 0) {
      return this.props.alternatingColors[0];
    } else {
      return this.props.alternatingColors[1];
    }
  };

  renderCustomAnnotator = () => {
    if (this.props.spacyLoading) {
      return <LoadingIndicator />;
    }
    return <CustomAnnotator />;
  };

  handleUseSpacyChange = () => {
    if (!this.props.spacyActive && this.props.textToDisplay !== "") {
      this.callApi();
    }
    this.props.setSpacyActive(!this.props.spacyActive);
  };

  render() {
    return (
      <div>
        <div>
          <TagUploader />
        </div>
        <div>
          <ImportExportAnnotations />
        </div>
        <div className="fileUpload">
          <Button onClick={this.openExplorer} variant="contained" color="primary">
            Browse for File
          </Button>
          <input
            ref={this.fileInputRef}
            style={{ display: "none" }}
            type="file"
            //   multiple
            onChange={e => this.readFile(e.target.files[0])}
          />
        </div>
        <div>
          <FormControlLabel
            control={
              <Switch
                size="small"
                color="primary"
                checked={this.props.spacyActive}
                onChange={this.handleUseSpacyChange}
              />
            }
            label="Use Spacy"
          />
          <FormControlLabel
            control={
              <Switch
                size="small"
                color="primary"
                checked={this.props.snapToWord}
                onChange={() => {
                  this.props.setSnapToWord(!this.props.snapToWord);
                }}
              />
            }
            label="Snap to Whole Word"
          />
        </div>
        <div>
          <Legend />
        </div>
        <div id="docDisplay" style={{ whiteSpace: "pre-wrap" }}>
          {this.renderCustomAnnotator()}
        </div>
      </div>
    );
  }
}

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
    snapToWord: state.fileViewer.snapToWord
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
    setEntitiesInUse: entitiesInUse => dispatch(actions.setEntitiesInUse(entitiesInUse))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FileViewer);
