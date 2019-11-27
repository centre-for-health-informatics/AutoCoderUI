import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import * as util from "./utility";

class CustomAnnotator extends Component {
  constructor(props) {
    super(props);
    this.rootRef = React.createRef();
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
    this.props.setSplitDivHeight(document.getElementById("splitsDiv").offsetHeight);
    this.props.setSplitDivWidth(document.getElementById("splitsDiv").offsetWidth);
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
    // if method to handle annotation isn't passed, return
    if (!this.props.onChange) {
      return;
    }

    // can't set a section or entity annotation without a tag
    if (
      (this.props.annotationFocus === "Entity" || this.props.annotationFocus === "Section") &&
      this.props.tag === ""
    ) {
      return;
    }

    const selection = window.getSelection();

    // if there is no selection
    if (util.selectionIsEmpty(selection)) {
      return;
    }

    let start = parseInt(selection.anchorNode.parentElement.getAttribute("data-start"), 10) + selection.anchorOffset;
    let end = parseInt(selection.focusNode.parentElement.getAttribute("data-start"), 10) + selection.focusOffset;

    // if part of a tag is start or end of selection
    if (Number.isNaN(start) || Number.isNaN(end)) {
      return;
    }

    if (util.selectionIsBackwards(selection)) {
      [start, end] = [end, start];
    }

    const span = this.getSpan({ start, end, text: this.props.textToDisplay.slice(start, end) });

    this.props.onChange([...this.props.annotations, span]);

    if (this.props.linkedListAdd) {
      this.prevSpan.next = span;
      this.props.setLinkedListAdd(false);
    }

    this.prevSpan = span;

    // clears selection
    window.getSelection().empty();
  };

  // method to remove an annotation
  handleSplitClick = ({ start, end }) => {
    const splitIndex = this.props.annotations.findIndex(s => s.start === start && s.end === end);
    if (splitIndex >= 0) {
      this.props.onChange([
        ...this.props.annotations.slice(0, splitIndex),
        ...this.props.annotations.slice(splitIndex + 1)
      ]);
    }
  };

  getSpan = span => {
    if (this.props.getSpan) {
      return this.props.getSpan(span);
    }
    return span;
  };

  render() {
    // console.log("annotations", this.props.annotations);
    const splits = util.createIntervals(this.props.textToDisplay, this.props.annotations);
    // console.log("splits", splits);
    return (
      <div>
        <div style={this.props.style} ref={this.rootRef} id="splitsDiv">
          {splits.map(split => (
            <util.Split key={`${split.start}-${split.end}`} {...split} onClick={this.handleSplitClick} />
          ))}
        </div>
        <svg
          style={({ position: "absolute" }, { zIndex: -1 })}
          height={this.props.splitDivHeight}
          width={this.props.splitDivWidth}
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
    tag: state.fileViewer.tag,
    textToDisplay: state.fileViewer.fileViewerText,
    linkedListAdd: state.fileViewer.linkedListAdd,
    splitDivHeight: state.fileViewer.splitDivHeight,
    splitDivWidth: state.fileViewer.splitDivWidth
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setLinkedListAdd: linkedListAdd => dispatch(actions.setLinkedListAdd(linkedListAdd)),
    setSplitDivHeight: splitDivHeight => dispatch(actions.setSplitDivHeight(splitDivHeight)),
    setSplitDivWidth: splitDivWidth => dispatch(actions.setSplitDivWidth(splitDivWidth))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CustomAnnotator);
