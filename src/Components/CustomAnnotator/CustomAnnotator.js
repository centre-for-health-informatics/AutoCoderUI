import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import * as tagTypes from "../TagManagement/tagTypes";
import * as util from "./utility";

class CustomAnnotator extends Component {
  constructor(props) {
    super(props);
    this.rootRef = React.createRef();
    this.props.setAddingTags("");

    this.annoteStyle = {
      // fontFamily: "IBM Plex Sans",
      // maxWidth: 500,
      // lineHeight: 1.5,
    };
  }

  componentDidMount() {
    this.props.setLinkedListAdd(false);
    this.rootRef.current.addEventListener("mouseup", this.handleMouseUp);
    document.onkeypress = e => {
      this.handleKeyPress(e);
    };
  }

  componentWillUnmount() {
    this.rootRef.current.removeEventListener("mouseup", this.handleMouseUp);
    this.props.setLinkedListAdd(false);
  }

  componentWillUpdate() {
    this.props.setIntervalDivHeight(document.getElementById("intervalsDiv").offsetHeight);
    this.props.setIntervalDivWidth(document.getElementById("intervalsDiv").offsetWidth);
  }

  handleKeyPress = e => {
    let key = e.key;
    if (key.toLowerCase() === "a" && this.prevSpan) {
      this.props.setLinkedListAdd(true);
    } else {
      this.props.setLinkedListAdd(false);
    }
  };

  handleMouseUp = () => {
    // can't set a section or entity annotation without a tag
    if (
      (this.props.annotationFocus === "Entity" || this.props.annotationFocus === "Section") &&
      this.props.addingTags.length === 0
    ) {
      return;
    }

    const selection = window.getSelection();

    // if there is no selection
    if (util.selectionIsEmpty(selection)) {
      return;
    }

    // getting start and end of selection
    let start = parseInt(selection.anchorNode.parentElement.getAttribute("data-start"), 10) + selection.anchorOffset;
    let end = parseInt(selection.focusNode.parentElement.getAttribute("data-start"), 10) + selection.focusOffset;

    // if part of a tag is start or end of selection
    if (Number.isNaN(start) || Number.isNaN(end)) {
      return;
    }

    // swapping start and end if the selection was backwards
    if (util.selectionIsBackwards(selection)) {
      [start, end] = [end, start];
    }

    // creating span object
    const span = {
      start,
      end,
      text: this.props.textToDisplay.slice(start, end),
      tag: this.props.addingTags[0].id,
      color: this.props.addingTags[0].color
    };

    // adding span to annotations
    this.handleAnnotate([...this.props.annotations, span]);

    // linking annotations if applicable
    if (this.props.linkedListAdd) {
      this.prevSpan.next = span;
      this.props.setLinkedListAdd(false);
    }

    this.prevSpan = span;

    // clears selection
    window.getSelection().empty();
  };

  // this is called whenever the user selects something to annotate or clicks on an annotation to remove it
  handleAnnotate = annotations => {
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
      // sorting tokens in order to have alternating sentences in different colors
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

  // handles clicking on an interval to open edit window
  handleIntervalClick = ({ start, end }) => {
    let annotationsInInterval = this.props.annotations.filter(s => s.start <= start && s.end >= end);
    this.props.setAnnotationsToEdit(annotationsInInterval);
  };

  // removes annotations
  removeAnnotations = annotationsToRemove => {
    // for each annotation to remove
    for (let annotation of annotationsToRemove) {
      // find index
      const annotationIndex = this.props.annotations.indexof(annotation);
      // removing annotations
      this.handleAnnotate([
        ...this.props.annotations.slice(0, annotationIndex),
        ...this.props.annotations.slice(annotationIndex + 1)
      ]);
    }
  };

  render() {
    // create intervals and render interval elements defined in utility and draw lines between linked intervals
    const intervals = util.createIntervals(this.props.textToDisplay, this.props.annotations);
    return (
      <div>
        <div style={(this.annoteStyle, { position: "absolute" })} ref={this.rootRef} id="intervalsDiv">
          {intervals.map(interval => (
            <util.Interval key={`${interval.start}-${interval.end}`} {...interval} onClick={this.handleIntervalClick} />
          ))}
        </div>
        <svg
          style={({ position: "absolute" }, { zIndex: -1 })}
          height={this.props.intervalDivHeight}
          width={this.props.intervalDivWidth}
        >
          {this.props.annotations.map(annotation => util.drawLine(annotation))}
        </svg>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    annotations: state.fileViewer.annotations,
    annotationFocus: state.fileViewer.annotationFocus,
    addingTags: state.tagManagement.addingTags,
    textToDisplay: state.fileViewer.fileViewerText,
    linkedListAdd: state.fileViewer.linkedListAdd,
    intervalDivHeight: state.fileViewer.intervalDivHeight,
    intervalDivWidth: state.fileViewer.intervalDivWidth,
    alternatingColors: state.fileViewer.alternatingColors
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setLinkedListAdd: linkedListAdd => dispatch(actions.setLinkedListAdd(linkedListAdd)),
    setIntervalDivHeight: intervalDivHeight => dispatch(actions.setIntervalDivHeight(intervalDivHeight)),
    setIntervalDivWidth: intervalDivWidth => dispatch(actions.setIntervalDivWidth(intervalDivWidth)),
    setSections: sections => dispatch(actions.setSections(sections)),
    setSentences: sentences => dispatch(actions.setSentences(sentences)),
    setTokens: tokens => dispatch(actions.setTokens(tokens)),
    setEntities: entities => dispatch(actions.setEntities(entities)),
    setAnnotationFocus: annotationFocus => dispatch(actions.setAnnotationFocus(annotationFocus)),
    setAnnotations: annotations => dispatch(actions.setAnnotations(annotations)),
    setAddingTags: tag => dispatch(actions.setAddingTags(tag)),
    setAnnotationsToEdit: annotationsToEdit => dispatch(actions.setAnnotationsToEdit(annotationsToEdit))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CustomAnnotator);
