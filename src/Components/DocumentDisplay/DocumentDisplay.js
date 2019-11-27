import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import LoadingIndicator from "../../Components/LoadingIndicator/LoadingIndicator";
import * as tagTypes from "../TagManagement/tagTypes";
import CustomAnnotator from "../../Components/CustomAnnotator/CustomAnnotator";

const annoteStyle = {
  // fontFamily: "IBM Plex Sans",
  // maxWidth: 500,
  // lineHeight: 1.5
  position: "absolute"
};

class DocumentDisplay extends Component {
  constructor(props) {
    super(props);
    this.props.setAddingTags("");
  }

  // this is called whenever the user selects something to annotate or clicks on an annotation to remove it
  handleAnnotate = annotations => {
    console.log(annotations);
    if (this.props.annotationFocus === tagTypes.ENTITIES) {
      this.props.setEntities(annotations);
    } else if (this.props.annotationFocus === tagTypes.SECTIONS) {
      this.props.setSections(annotations);
    } else if (this.props.annotationFocus === tagTypes.SENTENCES) {
      // sorting sentences in order to have alternating sentences in different colors
      annotations = annotations.sort((a, b) => {
        return a.start - b.start;
      });
      for (let i = 0; i < annotations.length; i++) {
        if (i % 2 === 0) {
          annotations[i].color = this.props.alternatingColors[0];
        } else {
          annotations[i].color = this.props.alternatingColors[1];
        }
      }
      this.props.setSentences(annotations);
    } else if (this.props.annotationFocus === tagTypes.TOKENS) {
      annotations = annotations.sort((a, b) => {
        return a.start - b.start;
      });
      for (let i = 0; i < annotations.length; i++) {
        if (i % 2 === 0) {
          annotations[i].color = this.props.alternatingColors[0];
        } else {
          annotations[i].color = this.props.alternatingColors[1];
        }
      }
      this.props.setTokens(annotations);
    } else if (this.props.annotationFocus === "ICD Codes") {
      // TO DO: Implement this
      // this.setState({ annotations });
      // this.props.setICDCodes(annotations);
    }
    this.props.setAnnotations(annotations);
  };

  renderCustomAnnotator = () => {
    if (this.props.spacyLoading) {
      return <LoadingIndicator />;
    }
    return (
      <CustomAnnotator
        style={annoteStyle}
        onChange={this.handleAnnotate}
        getSpan={span => ({
          ...span,
          tag: this.props.addingTags.length > 0 ? this.props.addingTags[0].id : "",
          color: this.props.addingTags.length > 0 ? this.props.addingTags[0].color : ""
        })}
      />
    );
  };

  render() {
    return (
      <div id="docDisplay" style={{ whiteSpace: "pre-wrap" }}>
        {this.renderCustomAnnotator()}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    textToDisplay: state.fileViewer.fileViewerText,
    tags: state.tagManagement.uploadedTags,
    sections: state.fileViewer.sections,
    sentences: state.fileViewer.sentences,
    tokens: state.fileViewer.tokens,
    entities: state.fileViewer.entities,
    spacyLoading: state.fileViewer.spacyLoading,
    annotationFocus: state.fileViewer.annotationFocus,
    annotations: state.fileViewer.annotations,
    tagTemplates: state.fileViewer.tagTemplates,
    addingTags: state.tagManagement.addingTags,
    alternatingColors: state.fileViewer.alternatingColors
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setSections: sections => dispatch(actions.setSections(sections)),
    setSentences: sentences => dispatch(actions.setSentences(sentences)),
    setTokens: tokens => dispatch(actions.setTokens(tokens)),
    setEntities: entities => dispatch(actions.setEntities(entities)),
    setAnnotationFocus: annotationFocus => dispatch(actions.setAnnotationFocus(annotationFocus)),
    setAnnotations: annotations => dispatch(actions.setAnnotations(annotations)),
    setAddingTags: tag => dispatch(actions.setAddingTags(tag))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DocumentDisplay);
