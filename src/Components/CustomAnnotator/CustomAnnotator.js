import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import * as tagTypes from "../TagManagement/tagTypes";
import * as util from "./utility";
import AnnotationEditor from "./AnnotationEditor";
import Popover from "@material-ui/core/Popover";

class CustomAnnotator extends Component {
  constructor(props) {
    super(props);
    this.rootRef = React.createRef();
    this.props.setAddingTags("");
    this.state = {
      anchorEl: null // used to keep track of the element that is clicked to pop up AnnotationEditor
    };

    this.editorPopUpId = this.shouldEditorOpen ? "label-editor-popup" : undefined;

    this.annoteStyle = {
      // fontFamily: "IBM Plex Sans",
      // maxWidth: 800,
      lineHeight: 1.5
    };
  }

  componentDidMount() {
    this.props.setLinkedListAdd(false);
    this.rootRef.current.addEventListener("mouseup", this.handleMouseUp);
    document.onkeypress = e => {
      this.handleKeyPress(e);
    };
    window.addEventListener("resize", () => {
      this.props.setAnnotations([...this.props.annotations]);
    });
  }

  componentWillUnmount() {
    this.rootRef.current.removeEventListener("mouseup", this.handleMouseUp);
    this.props.setLinkedListAdd(false);
  }

  componentWillUpdate() {
    // setting height and width to be used to render svg element
    this.props.setIntervalDivHeight(document.getElementById("intervalsDiv").offsetHeight);
    this.props.setIntervalDivWidth(document.getElementById("intervalsDiv").offsetWidth);
  }

  // if the user presses "A" key, it will link the next selection to the previous one
  handleKeyPress = e => {
    let key = e.key;
    if (key.toLowerCase() === "a" && this.prevSpan) {
      this.props.setLinkedListAdd(!this.props.linkedListAdd);
    }
  };

  handleMouseUp = () => {
    // can't set a section or entity annotation without a tag
    if (
      this.props.annotationFocus !== tagTypes.TOKENS &&
      this.props.annotationFocus !== tagTypes.SENTENCES &&
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

    // if option to snap to words is enabled
    if (this.props.snapToWord) {
      const termination = [" ", "\t", "\n"];

      // if only whitespace is selected, don't highlight anything
      let shouldReturn = true;
      for (let i = start; i < end; i++) {
        if (!termination.includes(this.props.textToDisplay[i])) {
          shouldReturn = false;
          break;
        }
      }
      if (shouldReturn) {
        return;
      }

      // snapping start of selection
      // if start is a whitespace, move forwards
      while (termination.includes(this.props.textToDisplay[start])) {
        start += 1;
      }
      // if start is middle of a word, move backwards
      while (!termination.includes(this.props.textToDisplay[start - 1]) && start > 0) {
        start -= 1;
      }

      // snapping end of selection
      // if the user ends on a termination trigger, move the end backwards to remove it
      while (termination.includes(this.props.textToDisplay[end - 1])) {
        end -= 1;
      }
      // if the user doesn't end at a termination trigger, move the end forwards to reach one
      while (!termination.includes(this.props.textToDisplay[end])) {
        end += 1;
        if (end === this.props.textToDisplay.length) {
          break;
        }
      }
    }

    // creating span object
    const span = {
      start,
      end,
      tag: this.props.addingTags.length > 0 ? this.props.addingTags[0].id : "",
      color: this.props.addingTags.length > 0 ? this.props.addingTags[0].color : "",
      type: this.props.annotationFocus
    };

    // adding span to annotations
    this.handleAnnotate(this.props.annotations, span);

    // linking annotations if applicable
    if (this.props.linkedListAdd) {
      this.prevSpan.next = span;
      this.props.setLinkedListAdd(false);
    }

    this.prevSpan = span;

    // Handling updating Legend lists
    if (this.props.annotationFocus === tagTypes.SECTIONS) {
      let newSections = Array.from(this.props.sectionsInUse);
      if (newSections.includes(this.props.addingTags[0].id)) {
        const index = newSections.indexOf(this.props.addingTags[0].id);
        newSections.splice(index, 1);
      }
      newSections.unshift(this.props.addingTags[0].id);
      this.props.setSectionsInUse(newSections);
    } else if (this.props.annotationFocus === tagTypes.TOKENS || this.props.annotationFocus === tagTypes.SENTENCES) {
      // do nothing
    } else {
      // custom entity types
      let newEntities = Array.from(this.props.entitiesInUse);
      if (newEntities.includes(this.props.addingTags[0].id)) {
        const index = newEntities.indexOf(this.props.addingTags[0].id);
        newEntities.splice(index, 1);
      }
      newEntities.unshift(this.props.addingTags[0].id);
      this.props.setEntitiesInUse(newEntities);
    }

    // clears selection
    window.getSelection().empty();
  };

  // this is called whenever the user selects text to annotate or clicks on an annotation to remove it
  handleAnnotate = (annotations, span) => {
    let annotationObject = JSON.parse(JSON.stringify(this.props.annotationsList[this.props.fileIndex]));
    if (this.props.annotationFocus === tagTypes.SECTIONS) {
      this.props.setSections([...annotations, span]);
      annotationObject[tagTypes.SECTIONS] = [...annotations, span];
    } else if (this.props.annotationFocus === tagTypes.SENTENCES) {
      // sorting sentences in order to have alternating sentences in different colors
      annotations = [...annotations, span];
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
      annotationObject[tagTypes.SENTENCES] = annotations;
    } else if (this.props.annotationFocus === tagTypes.TOKENS) {
      // sorting tokens in order to have alternating token in different colors
      annotations = [...annotations, span];
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
      annotationObject[tagTypes.TOKENS] = annotations;
    } else {
      this.props.setEntities([...this.props.entities, span]);
      annotationObject[tagTypes.ENTITIES] = [...this.props.entities, span];
    }
    this.props.setAnnotations([
      ...this.props.annotations.filter(annotation => annotation.type === this.props.annotationFocus),
      span
    ]);
    const annotationsList = Array.from(this.props.annotationsList);
    annotationsList[this.props.fileIndex] = annotationObject;
    this.props.setAnnotationsList(annotationsList);
  };

  // handles clicking on an interval to open AnnotationEditor popup
  handleIntervalClick = (event, start, end) => {
    let annotationsInInterval = this.props.annotations.filter(s => s.start <= start && s.end >= end);
    const annotationsToPass = [];
    let hasPrev = true;
    for (let annotation of annotationsInInterval) {
      while (hasPrev) {
        hasPrev = false;
        for (let otherAnnotation of this.props.annotations) {
          if (otherAnnotation.next === annotation) {
            annotation = otherAnnotation;
            hasPrev = true;
            break;
          }
        }
      }
      annotationsToPass.push(annotation);
    }
    this.props.setAnnotationsToEdit(annotationsToPass);
    this.setState({ anchorEl: event.currentTarget });
  };

  // Closing AnnotationEditor popup
  handleEditorClose = () => {
    this.props.setAnnotationsToEdit([]);
    this.setState({ anchorEl: null });
  };

  /**
   * Called upon to remove annotations
   */
  removeAnnotation = annotationToRemove => {
    if (this.props.annotationFocus !== tagTypes.TOKENS && this.props.annotationFocus !== tagTypes.SENTENCES) {
      // removing from legend if it was the last tag of that type
      const label = annotationToRemove.tag;
      let labelCount = 0;
      for (let annotation of this.props.annotations) {
        if (annotation.tag === label) {
          labelCount += 1;
          if (annotation.next) {
            labelCount -= 1;
          }
        }
      }
      if (labelCount === 1) {
        if (this.props.annotationFocus === tagTypes.SECTIONS) {
          const index = this.props.sectionsInUse.indexOf(label);
          if (index >= 0) {
            this.props.setSectionsInUse([
              ...this.props.sectionsInUse.slice(0, index),
              ...this.props.sectionsInUse.slice(index + 1)
            ]);
          }
        } else if (
          this.props.annotationFocus === tagTypes.SENTENCES ||
          this.props.annotationFocus === tagTypes.TOKENS
        ) {
          // do nothing
        } else {
          const index = this.props.entitiesInUse.indexOf(label);
          if (index >= 0) {
            this.props.setEntitiesInUse([
              ...this.props.entitiesInUse.slice(0, index),
              ...this.props.entitiesInUse.slice(index + 1)
            ]);
          }
        }
      }
    }

    let annotationsToRemove = this.getLinkedAnnotations(annotationToRemove);
    const annotations = Array.from(this.props.annotations);
    const annotationsToEdit = Array.from(this.props.annotationsToEdit);
    const newAnnotations = this.removeItemsFromArrayByRef(annotationsToRemove, annotations);
    const newAnnotationsToEdit = this.removeItemsFromArrayByRef(annotationsToRemove, annotationsToEdit);

    this.props.setAnnotationsToEdit(newAnnotationsToEdit);
    this.props.setAnnotations(newAnnotations);
  };

  /**
   * Given a list of items to be removed and an array the items are to be removed from,
   * return a new list with items removed.
   */
  removeItemsFromArrayByRef = (itemsToRemove, arr) => {
    const indicesToRemove = [];
    for (let item of itemsToRemove) {
      const removeIndex = arr.indexOf(item);
      if (removeIndex !== -1) {
        indicesToRemove.push(removeIndex);
      }
    }
    indicesToRemove.sort();
    while (indicesToRemove.length) {
      arr.splice(indicesToRemove.pop(), 1);
    }
    return arr;
  };

  // retreives all annotations linked to an annotation that is being removed
  getLinkedAnnotations = annotation => {
    const annotationsToRemove = [annotation];
    let nextAnnotation = annotation.next;
    // next annotations
    while (nextAnnotation) {
      annotationsToRemove.push(nextAnnotation);
      nextAnnotation = nextAnnotation.next;
    }
    return annotationsToRemove;
  };

  renderLines = () => {
    if (this.props.spansRendered) {
      const lines = this.props.annotations.map((annotation, i) =>
        util.drawLine(annotation, i, this.props.xOffset, this.props.yOffset)
      );
      return lines;
    }
  };

  render() {
    // create intervals and render interval elements defined in utility and draw lines between linked intervals
    const intervals = util.createIntervals(this.props.textToDisplay, this.props.annotations);
    return (
      <div id={"customerAnnotator" + this.props.id}>
        <div style={(this.annoteStyle, { position: "absolute" })} ref={this.rootRef} id="intervalsDiv">
          {intervals.map((interval, i) => (
            <util.Interval
              key={interval.start + "-" + interval.end}
              {...interval}
              onClick={event => this.handleIntervalClick(event, interval.start, interval.end)}
              setSpansRendered={this.props.setSpansRendered}
              spansRendered={this.props.spansRendered}
              index={i}
              intervals={intervals}
            />
          ))}
        </div>
        <Popover
          id={this.editorPopUpId}
          open={Boolean(this.state.anchorEl) && this.props.annotationsToEdit.length > 0}
          anchorEl={this.state.anchorEl}
          onClose={this.handleEditorClose}
          // anchorReference="anchorPosition"
          // anchorPosition={{ top: 200, left: 400 }}
          anchorOrigin={{
            vertical: "top",
            horizontal: "center"
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "left"
          }}
        >
          <AnnotationEditor itemsToEdit={this.props.annotationsToEdit} removeAnnotation={this.removeAnnotation} />
        </Popover>
        <svg style={{ zIndex: -1 }} height={this.props.intervalDivHeight} width={this.props.intervalDivWidth}>
          {this.renderLines()}
        </svg>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    annotationsToEdit: state.fileViewer.annotationsToEdit,
    annotations: state.fileViewer.annotations,
    entities: state.fileViewer.entities,
    annotationFocus: state.fileViewer.annotationFocus,
    addingTags: state.tagManagement.addingTags,
    textToDisplay: state.fileViewer.fileViewerText,
    linkedListAdd: state.fileViewer.linkedListAdd,
    intervalDivHeight: state.fileViewer.intervalDivHeight,
    intervalDivWidth: state.fileViewer.intervalDivWidth,
    alternatingColors: state.fileViewer.alternatingColors,
    snapToWord: state.fileViewer.snapToWord,
    sectionsInUse: state.fileViewer.sectionsInUse,
    entitiesInUse: state.fileViewer.entitiesInUse,
    spansRendered: state.fileViewer.spansRendered,
    fileIndex: state.fileViewer.fileIndex,
    annotationsList: state.fileViewer.annotationsList
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
    setAnnotationsToEdit: annotationsToEdit => dispatch(actions.setAnnotationsToEdit(annotationsToEdit)),
    setSectionsInUse: sectionsInUse => dispatch(actions.setSectionsInUse(sectionsInUse)),
    setEntitiesInUse: entitiesInUse => dispatch(actions.setEntitiesInUse(entitiesInUse)),
    setAnnotationsList: annotationsList => dispatch(actions.setAnnotationsList(annotationsList)),
    setSpansRendered: spansRendered => dispatch(actions.setSpansRendered(spansRendered))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CustomAnnotator);
