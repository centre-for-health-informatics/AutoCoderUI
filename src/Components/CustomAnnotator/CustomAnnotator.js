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
      anchorEl: null, // used to keep track of the element that is clicked to pop up AnnotationEditor
    };

    this.editorPopUpId = this.shouldEditorOpen ? "label-editor-popup" : undefined;

    this.annoteStyle = {
      // fontFamily: "IBM Plex Sans",
      // maxWidth: 800,
      lineHeight: 1.5,
    };
  }

  componentDidMount() {
    this.props.setLinkedListAdd(false);
    // add mouse listener
    this.rootRef.current.addEventListener("mouseup", this.handleMouseUp);
    // listen for key presses
    document.onkeypress = (e) => {
      this.handleKeyPress(e);
    };
    // reset annotations on window resize to deal with linked annotations not displaying properly
    window.addEventListener("resize", () => {
      this.props.setAnnotations([...this.props.annotations]);
    });
  }

  // removing mouse listener and resetting annotation linking
  componentWillUnmount() {
    this.props.setSpansRendered(false);
    this.rootRef.current.removeEventListener("mouseup", this.handleMouseUp);
    this.props.setLinkedListAdd(false);
  }

  componentWillUpdate() {
    // setting height and width to be used to render svg element
    this.props.setIntervalDivHeight(document.getElementById("intervalsDiv").offsetHeight);
    this.props.setIntervalDivWidth(document.getElementById("intervalsDiv").offsetWidth);
  }

  // if the user presses "A" key, it will link the next selection to the previous one
  handleKeyPress = (e) => {
    let key = e.key;
    if (key.toLowerCase() === "a" && this.props.prevSpan) {
      this.props.setLinkedListAdd(!this.props.linkedListAdd);
    }
    if (key.toLowerCase() === "f" && this.props.annotationFocus === tagTypes.ICD) {
      this.props.setFilterICD(!this.props.filterICD);
    }
  };

  checkTagTemplates = (tag, type, description) => {
    const tagTemplates = Array.from(this.props.tagTemplates);
    let duplicateTag = tagTemplates.find((tagTemplate) => tagTemplate.id === tag && tagTemplate.type === type);
    if (duplicateTag === undefined) {
      tagTemplates.push({
        id: tag,
        type: type,
        description: description,
      });
      // pushing the modified tagTemplates to the state
      this.props.setTagTemplates(tagTemplates);
    }
  };

  handleMouseUp = () => {
    // can't annotate without focus
    if (this.props.annotationFocus === "") {
      return;
    }

    // can't set an entity annotation without a tag
    if (
      this.props.annotationFocus !== tagTypes.SENTENCES &&
      this.props.annotationFocus !== tagTypes.TOKENS &&
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

    // do not allow overlapping annotations for tokens or sentences
    if (this.props.annotationFocus === tagTypes.TOKENS || this.props.annotationFocus === tagTypes.SENTENCES) {
      if (this.checkOverlap(start, end)) {
        this.props.setAlertMessage({ message: "Can't have overlapping annotations", messageType: "error" });
        return;
      }
    }

    // creating span object
    const span = {
      start,
      end,
      tag: this.props.addingTags.length > 0 ? this.props.addingTags[0].id : "",
      type: this.props.annotationFocus,
      confirmed: true,
    };

    this.checkTagTemplates(span.tag, span.type, this.props.addingTags[0].description);

    // adding span to annotations
    this.handleAnnotate(this.props.annotations, span);

    // linking annotations if applicable
    if (this.props.linkedListAdd) {
      const prevSpan = this.props.prevSpan;
      prevSpan.next = span;
      this.props.setLinkedListAdd(false);
    }

    this.props.saveAnnotations();

    this.props.setPrevSpan(span);

    // clears selection
    window.getSelection().empty();
  };

  // checks if an annotation overlaps another annotation, returns true if yes, false if no
  checkOverlap = (start, end) => {
    const annotations = Array.from(this.props.annotations);
    for (let annotation of annotations) {
      if ((start > annotation.start && start < annotation.end) || (end < annotation.end && end > annotation.start)) {
        return true;
      } else if (
        (start < annotation.end && end >= annotation.end) ||
        (start < annotation.start && end >= annotation.start)
      ) {
        return true;
      }
    }
    return false;
  };

  // this is called whenever the user selects text to annotate or clicks on an annotation to remove it
  handleAnnotate = (annotations, span) => {
    if (this.props.versionIndex !== this.props.versions.length) {
      this.props.setAlertMessage({ message: "Can't modify previous versions", messageType: "error" });
      return;
    }
    if (this.props.annotationFocus === tagTypes.SENTENCES) {
      // sorting sentences in order to have alternating sentences in different colors
      annotations = [...annotations, span];
      annotations = annotations.sort((a, b) => {
        return a.start - b.start;
      });
      // setting annotations to sentences for current file, as well as for the annotationList
      this.props.setCurrentSentences([...annotations]);
      this.props.setSentences(annotations);
    } else if (this.props.annotationFocus === tagTypes.TOKENS) {
      // sorting tokens in order to have alternating token in different colors
      annotations = [...annotations, span];
      annotations = annotations.sort((a, b) => {
        return a.start - b.start;
      });
      // setting annotations to tokens for current file, as well as for the annotationList
      this.props.setTokens(annotations);
    } else {
      // setting annotations to entities for current file, as well as for the annotationList
      this.props.setCurrentEntities([...this.props.entities, span]);
      this.props.setEntities([...this.props.entities, span]);
    }
    // setting annotations to all annotations that match the selected type
    this.props.setAnnotations([
      ...this.props.annotations.filter((annotation) => annotation.type === this.props.annotationFocus),
      span,
    ]);
  };

  // handles clicking on an interval to open AnnotationEditor popup
  handleIntervalClick = (event, start, end) => {
    if (this.props.versionIndex !== this.props.versions.length) {
      return;
    }
    let annotationsInInterval = this.props.annotations.filter((s) => s.start <= start && s.end >= end);
    const annotationsToPass = [];
    let hasPrev = true;
    for (let annotation of annotationsInInterval) {
      while (hasPrev) {
        hasPrev = false;
        // checking to see whether another annotation has the currently selected annotation as "next"
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
  removeAnnotation = (annotationToRemove) => {
    // setting annotations and annotationsToEdit
    let annotationsToRemove = this.getLinkedAnnotations(annotationToRemove);
    const annotations = Array.from(this.props.annotations);
    const annotationsToEdit = Array.from(this.props.annotationsToEdit);
    const newAnnotations = this.removeItemsFromArrayByRef(annotationsToRemove, annotations);
    const newAnnotationsToEdit = this.removeItemsFromArrayByRef(annotationsToRemove, annotationsToEdit);

    // setting annotations to edit after removing an annotation
    this.props.setAnnotationsToEdit(newAnnotationsToEdit);
    // setting annotations and saving
    this.props.setAnnotations(newAnnotations);
    if (this.props.annotationFocus === tagTypes.SENTENCES) {
      this.props.setSentences(newAnnotations);
      this.props.setCurrentSentences(newAnnotations).then(() => {
        this.props.saveAnnotations();
      });
    } else {
      this.props.setEntities(newAnnotations);
      this.props.setCurrentEntities(newAnnotations).then(() => {
        this.props.saveAnnotations();
      });
    }
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

  // retrieves all annotations linked to an annotation that is being removed
  getLinkedAnnotations = (annotation) => {
    const annotationsToRemove = [annotation];
    let nextAnnotation = annotation.next;
    // next annotations
    while (nextAnnotation) {
      annotationsToRemove.push(nextAnnotation);
      nextAnnotation = nextAnnotation.next;
    }
    return annotationsToRemove;
  };

  // method used to render the dashed lines between linked annotations
  renderLines = () => {
    if (this.props.spansRendered && this.props.annotations) {
      const lines = this.props.annotations.map((annotation, i) =>
        util.drawLine(annotation, i, this.props.tagTemplates)
      );
      return lines;
    }
  };

  render() {
    // create intervals and render interval elements defined in utility and draw lines between linked intervals
    const intervals = util.createIntervals(
      this.props.textToDisplay,
      this.props.annotations,
      Array.from(this.props.tagTemplates)
    );
    return (
      <React.Fragment>
        <div
          style={(this.annoteStyle, { position: "absolute", whiteSpace: "pre-wrap", overflowY: "visible" })}
          ref={this.rootRef}
          id="intervalsDiv"
        >
          {intervals.map((interval, i) => (
            <util.Interval
              key={interval.start + "-" + interval.end + "-" + i}
              {...interval}
              onClick={(event) => this.handleIntervalClick(event, interval.start, interval.end)}
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
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <AnnotationEditor
            itemsToEdit={this.props.annotationsToEdit}
            removeAnnotation={this.removeAnnotation}
            docTreeHeight={this.props.docTreeHeight}
            setModalOpen={this.props.setModalOpen}
            confirmAnnotation={this.props.confirmAnnotation}
          />
        </Popover>
        <svg style={{ zIndex: -1 }} height={this.props.intervalDivHeight} width={this.props.intervalDivWidth}>
          {this.renderLines()}
        </svg>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
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
    snapToWord: state.fileViewer.snapToWord,
    spansRendered: state.fileViewer.spansRendered,
    fileIndex: state.fileViewer.fileIndex,
    tagTemplates: state.fileViewer.tagTemplates,
    currentEntities: state.fileViewer.currentEntities,
    currentSentences: state.fileViewer.currentSentences,
    versions: state.fileViewer.versions,
    versionIndex: state.fileViewer.versionIndex,
    filterICD: state.fileViewer.filterICD,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setLinkedListAdd: (linkedListAdd) => dispatch(actions.setLinkedListAdd(linkedListAdd)),
    setFilterICD: (filterICD) => dispatch(actions.setFilterICD(filterICD)),
    setIntervalDivHeight: (intervalDivHeight) => dispatch(actions.setIntervalDivHeight(intervalDivHeight)),
    setIntervalDivWidth: (intervalDivWidth) => dispatch(actions.setIntervalDivWidth(intervalDivWidth)),
    setSentences: (sentences) => dispatch(actions.setSentences(sentences)),
    setTokens: (tokens) => dispatch(actions.setTokens(tokens)),
    setTagTemplates: (tags) => dispatch(actions.setTagTemplatesWithCallback(tags)),
    setEntities: (entities) => dispatch(actions.setEntities(entities)),
    setAnnotations: (annotations) => dispatch(actions.setAnnotations(annotations)),
    setAddingTags: (tag) => dispatch(actions.setAddingTags(tag)),
    setAnnotationFocus: (annotationFocus) => dispatch(actions.setAnnotationFocus(annotationFocus)),
    setAnnotationsToEdit: (annotationsToEdit) => dispatch(actions.setAnnotationsToEdit(annotationsToEdit)),
    setSpansRendered: (spansRendered) => dispatch(actions.setSpansRendered(spansRendered)),
    setAlertMessage: (newValue) => dispatch(actions.setAlertMessage(newValue)),
    setCurrentEntities: (currentEntities) => dispatch(actions.setCurrentEntitiesWithCallback(currentEntities)),
    setCurrentSentences: (currentSentences) => dispatch(actions.setCurrentSentencesWithCallback(currentSentences)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CustomAnnotator);
